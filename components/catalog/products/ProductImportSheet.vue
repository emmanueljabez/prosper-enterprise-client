<template>
  <SheetContent class="sm:max-w-xl flex flex-col h-full overflow-hidden">
    <SheetHeader class="flex-shrink-0">
      <SheetTitle>Import Products</SheetTitle>
      <SheetDescription>
        Upload a file to import multiple products at once.
      </SheetDescription>
    </SheetHeader>

    <div class="flex-1 overflow-y-auto py-6 px-1">
      <div class="space-y-6">
        <!-- Step indicator -->
        <div class="space-y-2">
          <!-- Stepper component -->
          <div class="w-full">
            <!-- Step titles -->
            <div class="flex justify-between mb-2">
              <div
                v-for="(step, index) in steps"
                :key="step.id"
                class="text-center flex-1 relative"
                :class="{ 'cursor-pointer': index <= currentStep }"
                @click="index <= currentStep && goToStep(index)"
              >
                <span
                  class="text-sm font-medium"
                  :class="
                    index === currentStep
                      ? 'text-primary'
                      : index < currentStep
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/50'
                  "
                >
                  {{ step.title }}
                </span>
              </div>
            </div>

            <!-- Progress bar with step indicators -->
            <div class="relative flex items-center w-full">
              <!-- Step circles -->
              <div class="flex w-full justify-between">
                <div
                  v-for="(step, index) in steps"
                  :key="`indicator-${step.id}`"
                  class="flex flex-col items-center"
                >
                  <!-- Circle indicator -->
                  <div
                    class="rounded-full h-8 w-8 flex items-center justify-center border transition-colors z-10"
                    :class="{
                      'bg-primary border-primary text-primary-foreground':
                        index === currentStep,
                      'bg-primary-foreground border-primary text-primary':
                        index < currentStep,
                      'bg-background border-muted text-muted-foreground':
                        index > currentStep,
                    }"
                    :aria-current="index === currentStep ? 'step' : null"
                  >
                    <span v-if="index < currentStep" class="text-xs">✓</span>
                    <span v-else class="text-xs">{{ index + 1 }}</span>
                  </div>

                  <!-- Step description -->
                  <span
                    v-if="index === currentStep"
                    class="text-xs text-muted-foreground mt-1 absolute top-full whitespace-nowrap"
                  >
                    {{ step.description }}
                  </span>
                </div>
              </div>

              <!-- Background line for the progress bar -->
              <div class="absolute top-4 left-0 w-full transform -translate-y-1/2">
                <div class="h-0.5 bg-muted"></div>
              </div>

              <!-- Filled progress bar showing completion -->
              <div class="absolute top-4 left-0 transform -translate-y-1/2">
                <div
                  class="h-0.5 bg-primary transition-all"
                  :style="`width: ${(currentStep / (steps.length - 1)) * 100}%`"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 1: File Upload -->
        <div v-if="currentStep === 0" class="space-y-4">
          <div class="space-y-2">
            <Label>Import Format</Label>
            <div class="flex space-x-3">
              <RadioGroup v-model="importFormat" class="flex flex-col space-y-1">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="import-csv" />
                  <Label for="import-csv">CSV</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="xlsx" id="import-xlsx" />
                  <Label for="import-xlsx">Excel (XLSX)</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="import-json" />
                  <Label for="import-json">JSON</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div class="space-y-2">
            <Label>Upload File</Label>
            <div
              class="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              :class="{ 'border-destructive': fileError, 'bg-muted/50': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="onFileDrop"
              @click="$refs.fileInput.click()"
            >
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                :accept="acceptedFileTypes"
                @change="onFileSelected"
              />

              <div v-if="!selectedFile" class="flex flex-col items-center">
                <UploadIcon class="h-10 w-10 text-muted-foreground mb-2" />
                <div class="text-sm font-medium">Click to upload or drag and drop</div>
                <div class="text-xs text-muted-foreground mt-1">{{ fileTypeMessage }}</div>
              </div>

              <div v-else class="flex flex-col items-center">
                <FileIcon class="h-10 w-10 text-primary mb-2" />
                <div class="text-sm font-medium">{{ selectedFile.name }}</div>
                <div class="text-xs text-muted-foreground mt-1">
                  {{ formatFileSize(selectedFile.size) }}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  class="mt-2"
                  @click.stop="selectedFile = null"
                >
                  <XIcon class="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
            <p v-if="fileError" class="text-sm text-destructive">{{ fileError }}</p>
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              @click="downloadSampleTemplate"
            >
              <DownloadIcon class="h-4 w-4 mr-2" />
              Download Sample Template
            </Button>
          </div>

          <Alert v-if="importFormat === 'csv'" variant="info">
            <InfoIcon class="h-4 w-4" />
            <AlertTitle>CSV Import</AlertTitle>
            <AlertDescription>
              <p>To ensure a successful import, your CSV file should:</p>
              <ul class="list-disc list-inside mt-1 space-y-1 text-xs">
                <li>Use UTF-8 encoding</li>
                <li>Include a header row with field names</li>
                <li>Have required fields: name, sku, price, status</li>
                <li>Use comma as the delimiter</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <!-- Step 2: Field Mapping -->
        <div v-if="currentStep === 1" class="space-y-4">
          <Alert variant="info">
            <InfoIcon class="h-4 w-4" />
            <AlertTitle>Field Mapping</AlertTitle>
            <AlertDescription>
              Map columns from your file to product properties. Required fields are marked with an asterisk (*).
            </AlertDescription>
          </Alert>

          <div v-if="previewData.length > 0" class="space-y-4">
            <div class="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead v-for="(header, index) in previewHeaders" :key="index">
                      {{ header }}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(row, rowIndex) in previewData.slice(0, 3)" :key="rowIndex">
                    <TableCell v-for="(header, colIndex) in previewHeaders" :key="colIndex">
                      {{ row[header] }}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div class="space-y-3">
              <h3 class="text-sm font-medium">Map Fields</h3>
              <div class="space-y-2">
                <div
                  v-for="field in requiredFields"
                  :key="field.key"
                  class="grid grid-cols-2 gap-2 items-center"
                >
                  <div>
                    <Label :for="`map-${field.key}`">
                      {{ field.label }} <span class="text-destructive">*</span>
                    </Label>
                    <p class="text-xs text-muted-foreground">{{ field.description }}</p>
                  </div>
                  <Select
                    v-model="fieldMapping[field.key]"
                    :class="{ 'border-destructive': mappingErrors[field.key] }"
                  >
                    <SelectTrigger :id="`map-${field.key}`">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Skip --</SelectItem>
                      <SelectItem v-for="header in previewHeaders" :key="header" :value="header">
                        {{ header }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-if="mappingErrors[field.key]" class="col-span-2 text-xs text-destructive">
                    {{ mappingErrors[field.key] }}
                  </p>
                </div>
              </div>

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" class="flex items-center justify-between w-full">
                    <span>Optional Fields</span>
                    <ChevronDownIcon class="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div class="space-y-2 pt-2">
                    <div
                      v-for="field in optionalFields"
                      :key="field.key"
                      class="grid grid-cols-2 gap-2 items-center"
                    >
                      <div>
                        <Label :for="`map-${field.key}`">{{ field.label }}</Label>
                        <p class="text-xs text-muted-foreground">{{ field.description }}</p>
                      </div>
                      <Select v-model="fieldMapping[field.key]">
                        <SelectTrigger :id="`map-${field.key}`">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">-- Skip --</SelectItem>
                          <SelectItem v-for="header in previewHeaders" :key="header" :value="header">
                            {{ header }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          <div v-else class="text-center py-6">
            <Loader2Icon class="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p class="mt-2 text-sm text-muted-foreground">Analyzing file...</p>
          </div>
        </div>

        <!-- Step 3: Import Options -->
        <div v-if="currentStep === 2" class="space-y-4">
          <div class="space-y-3">
            <h3 class="text-sm font-medium">Import Options</h3>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="overwrite-existing" v-model:checked="importOptions.overwriteExisting" />
                <div>
                  <Label for="overwrite-existing">Update existing products</Label>
                  <p class="text-xs text-muted-foreground">
                    If a product with the same SKU exists, update it with the imported data
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="validate-only" v-model:checked="importOptions.validateOnly" />
                <div>
                  <Label for="validate-only">Validate data only (dry run)</Label>
                  <p class="text-xs text-muted-foreground">
                    Check for potential errors without importing
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="import-default-status">Default Status</Label>
              <Select v-model="importOptions.defaultStatus">
                <SelectTrigger id="import-default-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
              <p class="text-xs text-muted-foreground">
                Default status for products when not specified in the import file
              </p>
            </div>
          </div>

          <Alert variant="warning">
            <AlertTriangleIcon class="h-4 w-4" />
            <AlertTitle>Import Preview</AlertTitle>
            <AlertDescription>
              <p>You are about to import approximately {{ totalRecords }} products.</p>
              <p class="text-xs mt-1">
                This operation may take several minutes to complete depending on the file size.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <!-- Step 4: Import Progress/Results -->
        <div v-if="currentStep === 3" class="space-y-4">
          <div v-if="importStatus === 'idle'" class="text-center py-6">
            <p>Click the Import button to begin the import process.</p>
          </div>

          <div v-else-if="importStatus === 'validating'" class="text-center py-6">
            <Loader2Icon class="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
            <h3 class="text-base font-medium">Validating data...</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Please wait while we validate your file.
            </p>
          </div>

          <div v-else-if="importStatus === 'importing'" class="space-y-4">
            <div class="text-center py-2">
              <Loader2Icon class="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
              <h3 class="text-base font-medium">Importing products...</h3>
              <p class="text-sm text-muted-foreground mt-1">
                {{ importProgress.processed }} of {{ importProgress.total }} processed
              </p>
            </div>

            <Progress :value="importProgress.percentage" class="h-2" />

            <p class="text-center text-xs text-muted-foreground">
              Please don't close this window until the import is complete.
            </p>
          </div>

          <div v-else-if="importStatus === 'success'" class="space-y-4">
            <div class="text-center py-4">
              <div class="bg-success/10 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                <CheckIcon class="h-10 w-10 text-success" />
              </div>
              <h3 class="text-lg font-medium">Import Successful</h3>
              <p class="text-sm text-muted-foreground mt-1">
                {{ importResults.success }} products were successfully imported.
              </p>
            </div>

            <div v-if="importResults.warnings.length > 0" class="border rounded-md p-3 bg-muted/20">
              <h4 class="font-medium mb-2">Warnings</h4>
              <ul class="text-xs space-y-1 list-disc list-inside">
                <li v-for="(warning, index) in importResults.warnings.slice(0, 5)" :key="index">
                  {{ warning }}
                </li>
                <li v-if="importResults.warnings.length > 5" class="text-muted-foreground">
                  ...and {{ importResults.warnings.length - 5 }} more warnings
                </li>
              </ul>
            </div>
          </div>

          <div v-else-if="importStatus === 'error'" class="space-y-4">
            <div class="text-center py-4">
              <div class="bg-destructive/10 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                <XIcon class="h-10 w-10 text-destructive" />
              </div>
              <h3 class="text-lg font-medium">Import Failed</h3>
              <p class="text-sm text-muted-foreground mt-1">
                {{ importResults.error || 'An error occurred during the import process.' }}
              </p>
            </div>

            <div v-if="importResults.errors.length > 0" class="border rounded-md p-3 bg-muted/20">
              <h4 class="font-medium mb-2">Errors</h4>
              <ul class="text-xs space-y-1 list-disc list-inside">
                <li v-for="(error, index) in importResults.errors.slice(0, 10)" :key="index">
                  {{ error }}
                </li>
                <li v-if="importResults.errors.length > 10" class="text-muted-foreground">
                  ...and {{ importResults.errors.length - 10 }} more errors
                </li>
              </ul>
            </div>

            <Alert variant="destructive" class="text-sm">
              <AlertCircleIcon class="h-4 w-4" />
              <AlertTitle>No products were imported</AlertTitle>
              <AlertDescription>
                Please fix the errors and try again.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>

    <SheetFooter class="flex-shrink-0 border-t pt-4">
      <div class="flex justify-between w-full">
        <div>
          <Button
            v-if="currentStep > 0 && importStatus === 'idle'"
            variant="outline"
            @click="currentStep--"
          >
            Back
          </Button>
        </div>

        <div>
          <Button
            v-if="currentStep < 3"
            variant="outline"
            class="mr-2"
            @click="$emit('close')"
          >
            Cancel
          </Button>

          <Button
            v-if="currentStep === 0"
            type="submit"
            @click="processFile"
            :disabled="!selectedFile || fileError"
          >
            Continue
          </Button>

          <Button
            v-if="currentStep === 1"
            type="submit"
            @click="validateMapping"
            :disabled="!previewData.length"
          >
            Continue
          </Button>

          <Button
            v-if="currentStep === 2"
            type="submit"
            @click="currentStep = 3"
          >
            Review
          </Button>

          <Button
            v-if="currentStep === 3 && importStatus === 'idle'"
            type="submit"
            @click="startImport"
            variant="default"
          >
            {{ importOptions.validateOnly ? 'Validate' : 'Import' }}
          </Button>

          <Button
            v-if="['success', 'error'].includes(importStatus)"
            @click="$emit('close')"
          >
            Close
          </Button>

          <Button
            v-if="importStatus === 'error'"
            variant="outline"
            class="ml-2"
            @click="currentStep = 0"
          >
            Try Again
          </Button>
        </div>
      </div>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
// import { Steps, Step } from '@/components/ui/steps'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  DownloadIcon,
  FileIcon,
  InfoIcon,
  Loader2Icon,
  UploadIcon,
  XIcon
} from 'lucide-vue-next'

const emit = defineEmits(['close', 'import-complete'])

// Wizard steps
const steps = [
  {
    id: 'upload',
    title: 'Select File',
    description: 'Upload a file'
  },
  {
    id: 'mapping',
    title: 'Map Fields',
    description: 'Match columns'
  },
  {
    id: 'options',
    title: 'Options',
    description: 'Configure import'
  },
  {
    id: 'import',
    title: 'Import',
    description: 'Process data'
  }
]

// State
const currentStep = ref(0)
const importFormat = ref('csv')
const selectedFile = ref(null)
const fileError = ref('')
const isDragging = ref(false)
const previewData = ref([])
const previewHeaders = ref([])
const totalRecords = ref(0)
const fieldMapping = reactive({})
const mappingErrors = reactive({})
const importOptions = reactive({
  overwriteExisting: true,
  validateOnly: false,
  defaultStatus: 'draft'
})
const importStatus = ref('idle') // idle, validating, importing, success, error
const importProgress = reactive({
  processed: 0,
  total: 0,
  percentage: 0
})
const importResults = reactive({
  success: 0,
  errors: [],
  warnings: [],
  error: null
})

// Field definitions
const requiredFields = [
  { key: 'name', label: 'Product Name', description: 'The name of the product' },
  { key: 'sku', label: 'SKU', description: 'Stock Keeping Unit, must be unique' },
  { key: 'price', label: 'Price', description: 'Product price (numeric)' },
  { key: 'description', label: 'Description', description: 'Product description' }
]

const optionalFields = [
  { key: 'status', label: 'Status', description: 'Product status (draft, active, archived)' },
  { key: 'cost', label: 'Cost', description: 'Product cost price (numeric)' },
  { key: 'category', label: 'Category', description: 'Product category name(s)' },
  { key: 'quantity', label: 'Quantity', description: 'Stock quantity (numeric)' },
  { key: 'weight', label: 'Weight', description: 'Product weight (numeric)' },
  { key: 'imageUrl', label: 'Image URL', description: 'URL to product image' },
  { key: 'metaTitle', label: 'Meta Title', description: 'SEO title' },
  { key: 'metaDescription', label: 'Meta Description', description: 'SEO description' }
]

// Computed properties
const acceptedFileTypes = computed(() => {
  switch (importFormat.value) {
    case 'csv':
      return '.csv,text/csv'
    case 'xlsx':
      return '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
    case 'json':
      return '.json,application/json'
    default:
      return ''
  }
})

const fileTypeMessage = computed(() => {
  switch (importFormat.value) {
    case 'csv':
      return 'Upload a CSV file (.csv)'
    case 'xlsx':
      return 'Upload an Excel file (.xlsx, .xls)'
    case 'json':
      return 'Upload a JSON file (.json)'
    default:
      return 'Select a file'
  }
})

// Helper functions
function getStepStatus(index) {
  if (index < currentStep.value) return 'complete'
  if (index === currentStep.value) return 'current'
  return 'upcoming'
}

function goToStep(index) {
  // Only allow navigation to completed steps or current step
  if (index <= currentStep.value) {
    currentStep.value = index
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function onFileSelected(event) {
  const file = event.target.files[0]
  handleFile(file)
}

function onFileDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  handleFile(file)
}

function handleFile(file) {
  fileError.value = ''

  if (!file) return

  // Validate file type
  const fileExt = file.name.split('.').pop().toLowerCase()

  if (importFormat.value === 'csv' && fileExt !== 'csv') {
    fileError.value = 'Please upload a CSV file'
    return
  }

  if (importFormat.value === 'xlsx' && !['xlsx', 'xls'].includes(fileExt)) {
    fileError.value = 'Please upload an Excel file'
    return
  }

  if (importFormat.value === 'json' && fileExt !== 'json') {
    fileError.value = 'Please upload a JSON file'
    return
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    fileError.value = 'File size must be less than 10MB'
    return
  }

  selectedFile.value = file
}

function processFile() {
  if (!selectedFile.value) return

  // Clear previous data
  previewData.value = []
  previewHeaders.value = []

  // Simulate file processing
  // In a real implementation, you would parse the file based on its format
  setTimeout(() => {
    // Simulate parsed data
    previewHeaders.value = ['sku', 'name', 'description', 'price', 'quantity', 'category', 'imageUrl']
    previewData.value = [
      { sku: 'TS-001', name: 'T-Shirt Large', description: 'Cotton t-shirt, large size', price: '19.99', quantity: '100', category: 'Apparel', imageUrl: 'https://example.com/ts-001.jpg' },
      { sku: 'TS-002', name: 'T-Shirt Medium', description: 'Cotton t-shirt, medium size', price: '19.99', quantity: '150', category: 'Apparel', imageUrl: 'https://example.com/ts-002.jpg' },
      { sku: 'HD-001', name: 'Hoodie Black', description: 'Black cotton hoodie', price: '39.99', quantity: '75', category: 'Apparel', imageUrl: 'https://example.com/hd-001.jpg' }
    ]

    totalRecords.value = 25 // Simulated total

    // Pre-populate field mapping with best guesses
    requiredFields.concat(optionalFields).forEach(field => {
      // Try to find an exact match
      const exactMatch = previewHeaders.value.find(header => 
        header.toLowerCase() === field.key.toLowerCase()
      )
      
      if (exactMatch) {
        fieldMapping[field.key] = exactMatch
      } else {
        // Try to find a partial match
        const partialMatch = previewHeaders.value.find(header => 
          header.toLowerCase().includes(field.key.toLowerCase())
        )
        
        if (partialMatch) {
          fieldMapping[field.key] = partialMatch
        } else {
          fieldMapping[field.key] = ''
        }
      }
    })
    
    currentStep.value = 1
  }, 1000)
}

function validateMapping() {
  // Clear previous errors
  Object.keys(mappingErrors).forEach(key => delete mappingErrors[key])
  
  let isValid = true
  
  // Validate required fields
  requiredFields.forEach(field => {
    if (!fieldMapping[field.key]) {
      mappingErrors[field.key] = `${field.label} is required`
      isValid = false
    }
  })
  
  if (isValid) {
    currentStep.value = 2
  }
}

function downloadSampleTemplate() {
  // In a real implementation, this would download a template file based on the selected format
  alert('Sample template download would start here')
}

function startImport() {
  importStatus.value = 'validating'
  
  // Simulate validation
  setTimeout(() => {
    if (importOptions.validateOnly) {
      // Simulate validation results
      importStatus.value = 'success'
      importResults.success = totalRecords.value
      importResults.warnings = [
        'Some products have missing images',
        'Category "Special Items" not found, will be created'
      ]
      return
    }
    
    // Start the import
    importStatus.value = 'importing'
    importProgress.total = totalRecords.value
    
    // Simulate import progress
    const interval = setInterval(() => {
      importProgress.processed += 1
      importProgress.percentage = (importProgress.processed / importProgress.total) * 100
      
      if (importProgress.processed >= importProgress.total) {
        clearInterval(interval)
        
        // Simulate successful import
        importStatus.value = 'success'
        importResults.success = totalRecords.value - 2
        importResults.warnings = [
          'Product "Special Item" has an invalid price format, using default',
          'Image URL for "Limited Edition" could not be accessed'
        ]
        
        emit('import-complete', {
          success: importResults.success,
          warnings: importResults.warnings.length,
          errors: 0
        })
      }
    }, 100)
  }, 1500)
}
</script>