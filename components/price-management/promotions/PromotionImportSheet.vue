<template>
  <SheetContent class="sm:max-w-xl w-full overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Import Promotions</SheetTitle>
      <SheetDescription>
        {{ getImportDescription() }}
      </SheetDescription>
    </SheetHeader>

    <div class="py-6 space-y-6">
      <!-- Import Type Tabs -->
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="csv" @click="updateImportType('csv')">
            <FileSpreadsheet class="h-4 w-4 mr-2" />
            CSV
          </TabsTrigger>
          <TabsTrigger value="excel" @click="updateImportType('excel')">
            <Table2 class="h-4 w-4 mr-2" />
            Excel
          </TabsTrigger>
          <TabsTrigger value="api" @click="updateImportType('api')">
            <Webhook class="h-4 w-4 mr-2" />
            API
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <!-- Import Steps -->
      <div class="mb-6">
        <nav aria-label="Progress" class="mb-4">
          <ol role="list" class="space-y-3">
            <li v-for="(step, index) in importSteps" :key="index" class="relative">
              <div class="group flex items-center">
                <span class="flex items-center justify-center">
                  <span
                    class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full"
                    :class="{
                      'bg-primary text-primary-foreground': currentStep > index,
                      'bg-primary text-primary-foreground ring-primary/20 ring-2': currentStep === index,
                      'bg-muted text-muted-foreground': currentStep < index
                    }"
                  >
                    <CheckIcon v-if="currentStep > index" class="h-5 w-5" />
                    <span v-else>{{ index + 1 }}</span>
                  </span>
                </span>
                <span class="ml-3 text-sm font-medium">
                  {{ step.label }}
                </span>
              </div>
              <div 
                v-if="index < importSteps.length - 1"
                class="absolute left-4 top-8 -ml-px mt-0.5 h-full w-0.5 bg-muted" 
                aria-hidden="true"
              ></div>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Step Content -->
      <!-- Step 1: File Upload / API Config -->
      <div v-if="currentStep === 0" class="space-y-4">
        <!-- CSV or Excel File Upload -->
        <div v-if="importType === 'csv' || importType === 'excel'" class="space-y-4">
          <div class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
               @click="$refs.fileInput.click()"
               @dragover.prevent="dragover = true"
               @dragleave.prevent="dragover = false"
               @drop.prevent="handleFileDrop"
               :class="{ 'bg-muted/50 border-primary/50': dragover }">
            <div class="flex flex-col items-center justify-center space-y-2">
              <UploadIcon class="h-8 w-8 text-muted-foreground" />
              <h3 class="text-lg font-medium">
                Drag & drop your {{ importType.toUpperCase() }} file here
              </h3>
              <p class="text-sm text-muted-foreground">
                or click to browse files
              </p>
              <input 
                ref="fileInput" 
                type="file" 
                :accept="acceptedFileTypes" 
                class="hidden" 
                @change="handleFileSelect"
              />
            </div>
          </div>

          <div v-if="selectedFile" class="p-4 border rounded-md bg-muted/50 flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <FileTextIcon class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="font-medium">{{ selectedFile.name }}</p>
                <p class="text-xs text-muted-foreground">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" @click="removeFile">
              <XIcon class="h-4 w-4" />
            </Button>
          </div>

          <Alert v-if="importType === 'csv'" variant="default">
            <AlertCircleIcon class="h-4 w-4" />
            <AlertTitle>CSV Format Requirements</AlertTitle>
            <AlertDescription>
              <p>Your CSV file should have the following columns:</p>
              <ul class="list-disc pl-5 text-sm mt-2 space-y-1">
                <li>name - Promotion name (required)</li>
                <li>type - One of: percentage, fixed, bogo, shipping, bundle (required)</li>
                <li>value - Discount value (required)</li>
                <li>startDate - Start date in YYYY-MM-DD format (required)</li>
                <li>endDate - End date in YYYY-MM-DD format (optional)</li>
                <li>status - One of: active, inactive, scheduled (default: active)</li>
                <li>productIds - Comma-separated list of product IDs (optional)</li>
              </ul>
              <a href="#" class="text-sm text-primary mt-2 inline-block" @click.prevent="downloadTemplate">
                Download template
              </a>
            </AlertDescription>
          </Alert>

          <Alert v-if="importType === 'excel'" variant="default">
            <AlertCircleIcon class="h-4 w-4" />
            <AlertTitle>Excel Format Requirements</AlertTitle>
            <AlertDescription>
              <p>Your Excel file should have the following columns:</p>
              <ul class="list-disc pl-5 text-sm mt-2 space-y-1">
                <li>name - Promotion name (required)</li>
                <li>type - One of: percentage, fixed, bogo, shipping, bundle (required)</li>
                <li>value - Discount value (required)</li>
                <li>startDate - Start date in YYYY-MM-DD format (required)</li>
                <li>endDate - End date in YYYY-MM-DD format (optional)</li>
                <li>status - One of: active, inactive, scheduled (default: active)</li>
                <li>productIds - Comma-separated list of product IDs (optional)</li>
              </ul>
              <a href="#" class="text-sm text-primary mt-2 inline-block" @click.prevent="downloadTemplate">
                Download template
              </a>
            </AlertDescription>
          </Alert>
        </div>

        <!-- API Configuration -->
        <div v-else-if="importType === 'api'" class="space-y-4">
          <div class="space-y-2">
            <Label for="api-endpoint">API Endpoint</Label>
            <Input 
              id="api-endpoint" 
              v-model="apiConfig.endpoint" 
              placeholder="https://api.example.com/promotions"
            />
            <p class="text-xs text-muted-foreground">
              Enter the URL of the API endpoint that contains promotion data
            </p>
          </div>

          <div class="space-y-2">
            <Label for="api-method">Request Method</Label>
            <Select v-model="apiConfig.method">
              <SelectTrigger id="api-method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="api-auth">Authentication</Label>
            <Select v-model="apiConfig.authType">
              <SelectTrigger id="api-auth">
                <SelectValue placeholder="Select authentication type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="apikey">API Key</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="apiConfig.authType === 'basic'" class="space-y-4">
            <div class="space-y-2">
              <Label for="api-username">Username</Label>
              <Input id="api-username" v-model="apiConfig.username" />
            </div>
            <div class="space-y-2">
              <Label for="api-password">Password</Label>
              <Input id="api-password" v-model="apiConfig.password" type="password" />
            </div>
          </div>

          <div v-if="apiConfig.authType === 'bearer'" class="space-y-2">
            <Label for="api-token">Bearer Token</Label>
            <Input id="api-token" v-model="apiConfig.token" />
          </div>

          <div v-if="apiConfig.authType === 'apikey'" class="space-y-4">
            <div class="space-y-2">
              <Label for="api-key-name">API Key Name</Label>
              <Input id="api-key-name" v-model="apiConfig.apiKeyName" placeholder="X-API-KEY" />
            </div>
            <div class="space-y-2">
              <Label for="api-key-value">API Key Value</Label>
              <Input id="api-key-value" v-model="apiConfig.apiKeyValue" />
            </div>
            <div class="space-y-2">
              <Label for="api-key-location">API Key Location</Label>
              <Select v-model="apiConfig.apiKeyLocation">
                <SelectTrigger id="api-key-location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="query">Query Parameter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-2" v-if="apiConfig.method === 'POST'">
            <Label for="api-body">Request Body (JSON)</Label>
            <Textarea
              id="api-body"
              v-model="apiConfig.body"
              rows="5"
              placeholder="{}"
            />
          </div>

          <Alert variant="default">
            <AlertCircleIcon class="h-4 w-4" />
            <AlertTitle>API Response Format</AlertTitle>
            <AlertDescription>
              <p>The API response should contain an array of promotion objects with these properties:</p>
              <ul class="list-disc pl-5 text-sm mt-2 space-y-1">
                <li>name - Promotion name (required)</li>
                <li>type - Promotion type (required)</li>
                <li>value - Discount value (required)</li>
                <li>startDate - Start date (required)</li>
                <li>endDate - End date (optional)</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <!-- Step 2: Validate & Preview -->
      <div v-if="currentStep === 1" class="space-y-4">
        <div v-if="validating">
          <div class="flex flex-col items-center justify-center py-8">
            <Loader2Icon class="h-8 w-8 animate-spin text-primary mb-4" />
            <p class="text-center text-muted-foreground">
              Validating import data...
            </p>
          </div>
        </div>
        <div v-else-if="validationError">
          <Alert variant="destructive">
            <AlertCircleIcon class="h-4 w-4" />
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>
              {{ validationError }}
            </AlertDescription>
          </Alert>
          <Button variant="outline" class="mt-4 w-full" @click="currentStep = 0">
            Go Back
          </Button>
        </div>
        <div v-else-if="previewData.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium">Data Preview</h3>
            <p class="text-sm text-muted-foreground">
              {{ previewData.length }} items to import
            </p>
          </div>
          
          <div class="border rounded-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-muted/50">
                    <th class="px-4 py-2 text-left font-medium">Name</th>
                    <th class="px-4 py-2 text-left font-medium">Type</th>
                    <th class="px-4 py-2 text-left font-medium">Value</th>
                    <th class="px-4 py-2 text-left font-medium">Start Date</th>
                    <th class="px-4 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="(item, index) in previewData.slice(0, 5)" :key="index">
                    <td class="px-4 py-2 whitespace-nowrap">{{ item.name }}</td>
                    <td class="px-4 py-2 whitespace-nowrap">{{ formatPromotionType(item.type) }}</td>
                    <td class="px-4 py-2 whitespace-nowrap">{{ formatPromotionValue(item.value, item.type) }}</td>
                    <td class="px-4 py-2 whitespace-nowrap">{{ formatDate(item.startDate) }}</td>
                    <td class="px-4 py-2 whitespace-nowrap">
                      <Badge :variant="getStatusBadgeVariant(item.status)">
                        {{ item.status || 'active' }}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="previewData.length > 5" class="px-4 py-2 bg-muted/30 text-center text-sm text-muted-foreground">
              {{ previewData.length - 5 }} more items not shown in preview
            </div>
          </div>

          <div v-if="validationWarnings.length > 0" class="mt-4">
            <Alert variant="warning">
              <AlertTriangleIcon class="h-4 w-4" />
              <AlertTitle>Warnings</AlertTitle>
              <AlertDescription>
                <ul class="list-disc pl-5 text-sm mt-2 space-y-1">
                  <li v-for="(warning, index) in validationWarnings" :key="index">
                    {{ warning }}
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <div class="mt-4 flex flex-col space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="overwrite-existing" v-model:checked="importOptions.overwriteExisting" />
              <Label for="overwrite-existing" class="font-normal cursor-pointer">
                Overwrite existing promotions with the same name
              </Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="activate-all" v-model:checked="importOptions.activateAll" />
              <Label for="activate-all" class="font-normal cursor-pointer">
                Set all imported promotions as active
              </Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="skip-validation" v-model:checked="importOptions.skipValidation" />
              <Label for="skip-validation" class="font-normal cursor-pointer">
                Skip additional validation (not recommended)
              </Label>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Import Progress -->
      <div v-if="currentStep === 2" class="space-y-4">
        <div v-if="importing" class="space-y-4">
          <div class="flex flex-col items-center justify-center py-8">
            <div class="w-full max-w-xs">
              <Progress :value="importProgress" class="w-full h-2" />
            </div>
            <p class="mt-4 text-center text-muted-foreground">
              Importing promotions... {{ importProgress }}%
            </p>
          </div>
        </div>
        <div v-else-if="importComplete" class="space-y-4">
          <div class="flex flex-col items-center justify-center py-8">
            <div class="bg-muted/30 p-3 rounded-full">
              <CheckIcon v-if="importSuccess" class="h-8 w-8 text-green-500" />
              <XIcon v-else class="h-8 w-8 text-destructive" />
            </div>
            <h3 class="mt-4 text-lg font-medium text-center">
              {{ importSuccess ? 'Import Complete' : 'Import Failed' }}
            </h3>
            <p class="mt-2 text-center text-muted-foreground">
              {{ importResultMessage }}
            </p>
          </div>

          <div v-if="importErrors.length > 0" class="mt-4">
            <Alert variant="destructive">
              <AlertCircleIcon class="h-4 w-4" />
              <AlertTitle>Errors</AlertTitle>
              <AlertDescription>
                <div class="max-h-[200px] overflow-y-auto mt-2">
                  <ul class="list-disc pl-5 text-sm space-y-1">
                    <li v-for="(error, index) in importErrors" :key="index">
                      {{ error }}
                    </li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>

    <SheetFooter class="pt-4 gap-2">
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button v-if="currentStep === 0" 
              @click="validateData" 
              :disabled="disableNextButton">
        Continue
      </Button>
      <Button v-else-if="currentStep === 1" 
              @click="startImport">
        Import {{ previewData.length }} Promotions
      </Button>
      <Button v-else-if="currentStep === 2 && importComplete"
              @click="handleFinish"
              variant="default">
        {{ importSuccess ? 'Finish' : 'Try Again' }}
      </Button>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckIcon,
  FileSpreadsheet,
  FileTextIcon,
  Loader2Icon,
  Table2,
  UploadIcon,
  Webhook,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'

const props = defineProps({
  importType: {
    type: String,
    required: true,
    default: 'csv',
    validator: (value) => ['csv', 'excel', 'api'].includes(value)
  }
})

const emit = defineEmits(['import-complete', 'close'])

// Active tab, synchronized with import type
const activeTab = ref(props.importType)

// File related state
const fileInput = ref(null)
const selectedFile = ref(null)
const dragover = ref(false)

// API Config
const apiConfig = ref({
  endpoint: '',
  method: 'GET',
  authType: 'none',
  username: '',
  password: '',
  token: '',
  apiKeyName: '',
  apiKeyValue: '',
  apiKeyLocation: 'header',
  body: '{}'
})

// Import steps
const importSteps = [
  { label: 'Select Source' },
  { label: 'Preview & Validate' },
  { label: 'Import' }
]
const currentStep = ref(0)

// Validation and preview data
const validating = ref(false)
const validationError = ref(null)
const validationWarnings = ref([])
const previewData = ref([])

// Import options
const importOptions = ref({
  overwriteExisting: false,
  activateAll: false,
  skipValidation: false
})

// Import progress
const importing = ref(false)
const importProgress = ref(0)
const importComplete = ref(false)
const importSuccess = ref(false)
const importResultMessage = ref('')
const importedCount = ref(0)
const importErrors = ref([])

// Computed properties
const importType = ref(props.importType)

const acceptedFileTypes = computed(() => {
  return importType.value === 'csv' 
    ? '.csv' 
    : '.xlsx,.xls'
})

const disableNextButton = computed(() => {
  if (importType.value === 'csv' || importType.value === 'excel') {
    return !selectedFile.value
  } else if (importType.value === 'api') {
    return !apiConfig.value.endpoint
  }
  return false
})

// Watch for prop changes
watch(() => props.importType, (newType) => {
  importType.value = newType
  activeTab.value = newType
})

// Methods
function updateImportType(type) {
  importType.value = type
  // Reset file when changing import type
  selectedFile.value = null
  validationError.value = null
  previewData.value = []
}

function getImportDescription() {
  switch (importType.value) {
    case 'csv':
      return 'Import promotions from a CSV file'
    case 'excel':
      return 'Import promotions from an Excel spreadsheet'
    case 'api':
      return 'Import promotions from an external API'
    default:
      return 'Import promotions'
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    validationError.value = null
  }
}

function handleFileDrop(event) {
  dragover.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    // Check if the file type matches what we expect
    const extension = file.name.split('.').pop().toLowerCase()
    if (importType.value === 'csv' && extension === 'csv') {
      selectedFile.value = file
      validationError.value = null
    } else if (importType.value === 'excel' && ['xlsx', 'xls'].includes(extension)) {
      selectedFile.value = file
      validationError.value = null
    } else {
      validationError.value = `Invalid file type. Please upload a ${importType.value === 'csv' ? 'CSV' : 'Excel'} file.`
    }
  }
}

function removeFile() {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function downloadTemplate() {
  // In a real application, you would generate or serve a real template
  // This is a simplified version for demonstration
  const csvTemplate = "name,type,value,startDate,endDate,status,productIds\nSummer Sale,percentage,10,2025-06-01,2025-08-31,active,\nNew Customer,fixed,5,2025-05-25,,active,\nBOGO Deal,bogo,\"{'buy':1,'get':1,'percent':100}\",2025-05-30,2025-06-15,active,"
  
  const blob = new Blob([csvTemplate], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `promotion_import_template.${importType.value}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Validation and import
async function validateData() {
  validating.value = true
  validationError.value = null
  validationWarnings.value = []
  previewData.value = []
  
  try {
    if (importType.value === 'csv' || importType.value === 'excel') {
      if (!selectedFile.value) {
        throw new Error(`Please select a ${importType.value.toUpperCase()} file to import`)
      }
      
      // Simulate file parsing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In a real app, you would parse the file here
      // For this demo, we'll use mock data
      previewData.value = [
        {
          name: 'Summer Sale',
          type: 'percentage',
          value: 15,
          startDate: '2025-06-01',
          endDate: '2025-08-31',
          status: 'active',
          productIds: []
        },
        {
          name: 'Welcome Discount',
          type: 'fixed',
          value: 10,
          startDate: '2025-05-25',
          status: 'active',
          productIds: ['prod-123', 'prod-456']
        },
        {
          name: 'Buy One Get One Free',
          type: 'bogo',
          value: { buy: 1, get: 1, percent: 100 },
          startDate: '2025-06-15',
          endDate: '2025-07-15',
          status: 'scheduled',
          productIds: []
        },
        {
          name: 'Free Shipping',
          type: 'shipping',
          value: 'free',
          startDate: '2025-05-30',
          status: 'active',
          productIds: []
        },
        {
          name: 'Bundle Discount',
          type: 'bundle',
          value: { quantity: 3, discount: 20 },
          startDate: '2025-07-01',
          endDate: '2025-07-31',
          status: 'scheduled',
          productIds: ['prod-789', 'prod-012']
        },
        {
          name: 'Holiday Special',
          type: 'percentage',
          value: 25,
          startDate: '2025-12-01',
          endDate: '2025-12-31',
          status: 'scheduled',
          productIds: []
        }
      ]
      
      // Add some validation warnings
      validationWarnings.value = [
        'Some promotions might overlap with existing ones',
        'Product with ID "prod-123" might already have a promotion applied'
      ]
    } else if (importType.value === 'api') {
      if (!apiConfig.value.endpoint) {
        throw new Error('Please enter an API endpoint')
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock API response data
      previewData.value = [
        {
          name: 'API Flash Sale',
          type: 'percentage',
          value: 30,
          startDate: '2025-06-01',
          endDate: '2025-06-07',
          status: 'scheduled',
          productIds: []
        },
        {
          name: 'API Free Shipping',
          type: 'shipping',
          value: 'free',
          startDate: '2025-05-30',
          status: 'active',
          productIds: []
        },
        {
          name: 'API Bundle Deal',
          type: 'bundle',
          value: { quantity: 2, discount: 15 },
          startDate: '2025-07-01',
          endDate: '2025-07-31',
          status: 'scheduled',
          productIds: []
        }
      ]
    }
    
    // Move to next step if validation successful
    if (previewData.value.length > 0) {
      currentStep.value = 1
    } else {
      throw new Error('No valid data found to import')
    }
  } catch (error) {
    validationError.value = error.message || 'Failed to validate import data'
  } finally {
    validating.value = false
  }
}

async function startImport() {
  importing.value = true
  importProgress.value = 0
  importComplete.value = false
  importSuccess.value = false
  importResultMessage.value = ''
  importedCount.value = 0
  importErrors.value = []
  currentStep.value = 2
  
  try {
    // Simulate import process with progress updates
    const total = previewData.value.length
    
    for (let i = 0; i < total; i++) {
      // Simulate processing each item
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update progress
      importProgress.value = Math.round(((i + 1) / total) * 100)
      
      // Simulate some random errors
      if (Math.random() > 0.9) {
        importErrors.value.push(`Error importing "${previewData.value[i].name}": Validation failed`)
      } else {
        importedCount.value++
      }
    }
    
    // Complete import
    importComplete.value = true
    importSuccess.value = importErrors.value.length === 0 || importedCount.value > 0
    
    if (importSuccess.value) {
      importResultMessage.value = `Successfully imported ${importedCount.value} out of ${total} promotions`
      if (importErrors.value.length > 0) {
        importResultMessage.value += ` with ${importErrors.value.length} errors`
      }
    } else {
      importResultMessage.value = 'Import failed. No promotions were imported.'
    }
  } catch (error) {
    importComplete.value = true
    importSuccess.value = false
    importResultMessage.value = error.message || 'An unexpected error occurred during import'
    importErrors.value.push(importResultMessage.value)
  } finally {
    importing.value = false
  }
}

function handleFinish() {
  if (importSuccess.value) {
    emit('import-complete', {
      success: true,
      count: importedCount.value,
      errors: importErrors.value
    })
  } else {
    // Go back to first step if import failed
    currentStep.value = 0
    importComplete.value = false
  }
}

// Helper functions for formatting
function formatPromotionType(type) {
  switch (type) {
    case 'percentage':
      return 'Percentage'
    case 'fixed':
      return 'Fixed Amount'
    case 'bogo':
      return 'Buy One Get One'
    case 'shipping':
      return 'Free Shipping'
    case 'bundle':
      return 'Bundle'
    default:
      return type
  }
}

function formatPromotionValue(value, type) {
  if (type === 'percentage') {
    return `${value}%`
  } else if (type === 'fixed') {
    return `$${parseFloat(value).toFixed(2)}`
  } else if (type === 'bogo') {
    if (typeof value === 'object') {
      return `Buy ${value.buy}, Get ${value.get} ${value.percent < 100 ? `${value.percent}% off` : 'Free'}`
    }
    return 'BOGO'
  } else if (type === 'shipping') {
    return 'Free'
  } else if (type === 'bundle') {
    if (typeof value === 'object') {
      return `${value.discount}% off ${value.quantity}+ items`
    }
    return 'Bundle'
  } else {
    return value.toString()
  }
}

function formatDate(dateString) {
  if (!dateString) return null
  try {
    return format(parseISO(dateString), 'MMM d, yyyy')
  } catch (e) {
    return dateString
  }
}

function getStatusBadgeVariant(status) {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    case 'scheduled':
      return 'warning'
    case 'expired':
      return 'outline'
    default:
      return 'outline'
  }
}
</script>