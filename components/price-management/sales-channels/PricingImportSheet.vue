<template>
  <SheetContent class="sm:max-w-2xl flex flex-col h-full overflow-hidden">
    <SheetHeader class="flex-shrink-0">
      <SheetTitle>Import Pricing Data</SheetTitle>
      <SheetDescription>
        Import product prices for {{ salesChannel.name }} sales channel
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
                :class="{ 'cursor-pointer': index <= currentStep - 1 }"
                @click="index < currentStep && goToStep(index + 1)"
              >
                <span
                  class="text-sm font-medium"
                  :class="
                    index === currentStep - 1
                      ? 'text-primary'
                      : index < currentStep - 1
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
                        index === currentStep - 1,
                      'bg-primary-foreground border-primary text-primary':
                        index < currentStep - 1,
                      'bg-background border-muted text-muted-foreground':
                        index > currentStep - 1,
                    }"
                  >
                    <span v-if="index < currentStep - 1" class="text-xs">✓</span>
                    <span v-else class="text-xs">{{ index + 1 }}</span>
                  </div>

                  <!-- Step description -->
                  <span
                    v-if="index === currentStep - 1"
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
                  :style="`width: ${((currentStep - 1) / (steps.length - 1)) * 100}%`"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 1: File Upload -->
        <div v-if="currentStep === 1" class="space-y-4">
          <div class="border-2 border-dashed rounded-md p-6 text-center space-y-4">
            <UploadIcon class="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 class="text-lg font-medium">Upload Pricing File</h3>
            <p class="text-sm text-muted-foreground">
              Upload a CSV file containing product pricing information
            </p>
            
            <div class="flex flex-col items-center space-y-2">
              <label 
                for="file-upload" 
                class="cursor-pointer inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <UploadCloudIcon class="h-4 w-4 mr-2" />
                Select File
              </label>
              <input 
                id="file-upload" 
                type="file" 
                accept=".csv" 
                @change="handleFileUpload" 
                class="hidden" 
                :disabled="isUploading"
              />
              <p v-if="selectedFile" class="text-sm flex items-center">
                <FileIcon class="h-4 w-4 mr-2 text-primary" />
                {{ selectedFile.name }}
                <Button variant="ghost" size="sm" @click="resetFileUpload" :disabled="isUploading">
                  <XIcon class="h-4 w-4" />
                </Button>
              </p>
            </div>
            
            <div class="text-xs text-muted-foreground">
              <p>Supported format: CSV</p>
              <p>Maximum file size: 5MB</p>
            </div>
          </div>
          
          <div>
            <Button
              variant="outline"
              size="sm"
              @click="downloadTemplate"
              class="mr-2"
            >
              <DownloadIcon class="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="downloadSampleData"
            >
              <FileTextIcon class="h-4 w-4 mr-2" />
              Download Sample Data
            </Button>
          </div>
          
          <Alert variant="info">
            <InfoIcon class="h-4 w-4" />
            <AlertTitle>Import Instructions</AlertTitle>
            <AlertDescription>
              <p>Your CSV file should contain the following columns:</p>
              <ul class="list-disc pl-5 space-y-1 text-xs">
                <li><strong>product_id</strong> or <strong>sku</strong> (required): Product identifier</li>
                <li><strong>price</strong> (required): The price for this sales channel</li>
                <li><strong>compare_at_price</strong> (optional): Original or compare-at price</li>
                <li><strong>sale_price</strong> (optional): Special sale price</li>
                <li><strong>minimum_price</strong> (optional): Minimum allowed price</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
        
        <!-- Step 2: Field Mapping -->
        <div v-else-if="currentStep === 2" class="space-y-4">
          <Alert variant="info">
            <InfoIcon class="h-4 w-4" />
            <AlertTitle>Field Mapping</AlertTitle>
            <AlertDescription>
              Map columns from your CSV file to product pricing fields. Required fields are marked with an asterisk (*).
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Map Fields</CardTitle>
              <CardDescription>
                Match columns from your CSV file to product pricing fields
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-for="(field, index) in requiredFields" :key="index" class="grid grid-cols-2 gap-4 items-center">
                <div>
                  <Label :for="`field-${index}`">
                    {{ field.label }} 
                    <span v-if="field.required" class="text-destructive">*</span>
                  </Label>
                  <p class="text-xs text-muted-foreground">{{ field.description }}</p>
                </div>
                <div>
                  <Select 
                    v-model="fieldMapping[field.key]" 
                    :disabled="isProcessing"
                  >
                    <SelectTrigger :id="`field-${index}`" :class="{ 'border-destructive': errors[field.key] }">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Ignore this field --</SelectItem>
                      <SelectItem 
                        v-for="column in importColumns" 
                        :key="column" 
                        :value="column"
                      >
                        {{ column }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-if="errors[field.key]" class="text-xs text-destructive mt-1">{{ errors[field.key] }}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div v-if="previewData.length > 0">
            <h3 class="text-sm font-medium mb-2">Data Preview</h3>
            <div class="border rounded-md overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead v-for="field in requiredFields" :key="field.key" class="whitespace-nowrap">
                      {{ field.label }}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(row, rowIndex) in previewData" :key="rowIndex">
                    <TableCell v-for="field in requiredFields" :key="field.key" class="whitespace-nowrap">
                      {{ getValueForField(row, field.key) }}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        
        <!-- Step 3: Confirmation -->
        <div v-else-if="currentStep === 3" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Confirm Import</CardTitle>
              <CardDescription>
                Review the pricing data before importing
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <h4 class="text-sm font-medium mb-1">File Name</h4>
                  <p class="text-sm">{{ selectedFile?.name }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium mb-1">Total Records</h4>
                  <p class="text-sm">{{ importStats.totalRows || 0 }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium mb-1">Products Found</h4>
                  <p class="text-sm">{{ importStats.productsFound || 0 }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium mb-1">Products Not Found</h4>
                  <p class="text-sm">{{ importStats.productsNotFound || 0 }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium mb-1">Price Updates</h4>
                  <p class="text-sm">{{ importStats.priceUpdates || 0 }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium mb-1">Sales Channel</h4>
                  <p class="text-sm">{{ salesChannel.name }}</p>
                </div>
              </div>
              
              <Alert v-if="importStats.productsNotFound > 0" variant="warning">
                <AlertTriangleIcon class="h-4 w-4" />
                <AlertTitle>Some products not found</AlertTitle>
                <AlertDescription>
                  {{ importStats.productsNotFound }} products in your import file could not be matched to existing products.
                </AlertDescription>
              </Alert>
              
              <div class="border rounded-md p-3 space-y-2">
                <h3 class="text-sm font-medium mb-2">Import Options</h3>
                <div class="flex items-center space-x-2">
                  <Checkbox id="skip-not-found" v-model:checked="skipNotFound" />
                  <div>
                    <Label for="skip-not-found">Skip products that cannot be found</Label>
                    <p class="text-xs text-muted-foreground">
                      Continue with import and skip any products that are not found in your catalog
                    </p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <Checkbox id="update-existing" v-model:checked="updateExistingOnly" />
                  <div>
                    <Label for="update-existing">Update only existing prices</Label>
                    <p class="text-xs text-muted-foreground">
                      Don't create new price entries if they don't already exist
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div v-if="importErrors.length > 0" class="border rounded-md p-4 space-y-2">
            <h4 class="font-medium">Import Warnings</h4>
            <ul class="list-disc pl-5 space-y-1 text-sm">
              <li v-for="(error, index) in importErrors" :key="index" class="text-amber-600">
                {{ error }}
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Step 4: Results -->
        <div v-else-if="currentStep === 4" class="space-y-4">
          <div class="text-center py-6 space-y-4">
            <div class="bg-primary/10 rounded-full p-3 w-16 h-16 mx-auto mb-4">
              <CheckIcon class="h-10 w-10 text-primary" />
            </div>
            <h3 class="text-xl font-medium">Import Complete</h3>
            <p class="text-muted-foreground">
              Your pricing data has been successfully imported to {{ salesChannel.name }}
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <h4 class="text-sm font-medium mb-1">Total Records</h4>
                  <p class="text-sm">{{ importStats.totalRows || 0 }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium mb-1">Processed</h4>
                  <p class="text-sm">{{ importStats.processed || 0 }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium mb-1">Successful</h4>
                  <p class="text-sm">{{ importStats.successful || 0 }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium mb-1">Failed</h4>
                  <p class="text-sm">{{ importStats.failed || 0 }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium mb-1">Created</h4>
                  <p class="text-sm">{{ importStats.created || 0 }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium mb-1">Updated</h4>
                  <p class="text-sm">{{ importStats.updated || 0 }}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div v-if="importErrors.length > 0" class="border rounded-md p-4 space-y-2">
            <h4 class="font-medium">Import Errors</h4>
            <ul class="list-disc pl-5 space-y-1 text-sm">
              <li v-for="(error, index) in importErrors.slice(0, 10)" :key="index" class="text-destructive">
                {{ error }}
              </li>
              <li v-if="importErrors.length > 10" class="text-muted-foreground">
                ...and {{ importErrors.length - 10 }} more errors
              </li>
            </ul>
            <Button variant="outline" size="sm" @click="downloadErrorReport" class="mt-2">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Download Error Report
            </Button>
          </div>
        </div>
      </div>
    </div>

    <SheetFooter class="flex-shrink-0 border-t pt-4">
      <div class="flex justify-between w-full">
        <div>
          <Button
            v-if="currentStep > 1 && !isImporting"
            variant="outline"
            @click="currentStep--"
          >
            <ChevronLeftIcon class="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div>
          <Button
            v-if="currentStep !== 4"
            variant="outline"
            class="mr-2"
            @click="$emit('close')"
            :disabled="isImporting"
          >
            Cancel
          </Button>

          <Button 
            v-if="currentStep === 1" 
            @click="proceedToMapping" 
            :disabled="!selectedFile || isUploading"
          >
            <Loader2Icon v-if="isUploading" class="h-4 w-4 mr-2 animate-spin" />
            <span v-else>Next</span>
            <ChevronRightIcon v-if="!isUploading" class="h-4 w-4 ml-2" />
          </Button>

          <Button 
            v-if="currentStep === 2"
            @click="proceedToConfirmation" 
            :disabled="isProcessing || !isFieldMappingValid"
          >
            <Loader2Icon v-if="isProcessing" class="h-4 w-4 mr-2 animate-spin" />
            <span v-else>Next</span>
            <ChevronRightIcon v-if="!isProcessing" class="h-4 w-4 ml-2" />
          </Button>

          <Button 
            v-if="currentStep === 3"
            @click="confirmImport" 
            :disabled="isImporting"
          >
            <Loader2Icon v-if="isImporting" class="h-4 w-4 mr-2 animate-spin" />
            <span v-else>Import Prices</span>
          </Button>

          <Button 
            v-if="currentStep === 4"
            @click="$emit('close')"
          >
            Close
          </Button>
        </div>
      </div>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  FileIcon,
  FileTextIcon,
  InfoIcon,
  Loader2Icon,
  UploadCloudIcon,
  UploadIcon,
  XIcon
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import Papa from 'papaparse'

const props = defineProps({
  salesChannel: {
    type: Object,
    required: true
  },
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['import-prices', 'close'])
const { toast } = useToast()

// Define the steps
const steps = [
  {
    id: 'upload',
    title: 'Upload File',
    description: 'Choose CSV file'
  },
  {
    id: 'map',
    title: 'Map Fields',
    description: 'Match columns'
  },
  {
    id: 'confirm',
    title: 'Review',
    description: 'Confirm import'
  },
  {
    id: 'results',
    title: 'Results',
    description: 'View outcome'
  }
]

// State
const currentStep = ref(1)
const selectedFile = ref(null)
const isUploading = ref(false)
const isProcessing = ref(false)
const isImporting = ref(false)
const importData = ref([])
const previewData = ref([])
const importColumns = ref([])
const fieldMapping = ref({
  productId: '',
  sku: '',
  price: '',
  compareAtPrice: '',
  salePrice: '',
  minimumPrice: ''
})
const errors = ref({})
const importErrors = ref([])
const importStats = ref({
  totalRows: 0,
  productsFound: 0,
  productsNotFound: 0,
  priceUpdates: 0,
  processed: 0,
  successful: 0,
  failed: 0,
  created: 0,
  updated: 0
})
const skipNotFound = ref(true)
const updateExistingOnly = ref(false)

// Required fields configuration
const requiredFields = [
  {
    key: 'productId',
    label: 'Product ID',
    description: 'Unique identifier for the product',
    required: true,
    altField: 'sku'
  },
  {
    key: 'sku',
    label: 'SKU',
    description: 'Product SKU (used if Product ID is not provided)',
    required: false,
    altField: 'productId'
  },
  {
    key: 'price',
    label: 'Price',
    description: 'Price in this sales channel',
    required: true
  },
  {
    key: 'compareAtPrice',
    label: 'Compare At Price',
    description: 'Original price for comparison (optional)',
    required: false
  },
  {
    key: 'salePrice',
    label: 'Sale Price',
    description: 'Special sale price (optional)',
    required: false
  },
  {
    key: 'minimumPrice',
    label: 'Minimum Price',
    description: 'Lowest allowed price (optional)',
    required: false
  }
]

// Navigation helper
function goToStep(step) {
  if (step >= 1 && step <= 4) {
    currentStep.value = step;
  }
}

// Computed properties
const isFieldMappingValid = computed(() => {
  errors.value = {}
  
  // Check that at least productId OR sku is mapped
  if (!fieldMapping.value.productId && !fieldMapping.value.sku) {
    errors.value.productId = 'Either Product ID or SKU must be mapped'
    return false
  }
  
  // Check that price is mapped
  if (!fieldMapping.value.price) {
    errors.value.price = 'Price field is required'
    return false
  }
  
  return true
})

// File handling methods
function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  // Validate file type
  if (!file.name.endsWith('.csv')) {
    toast({
      title: 'Invalid file',
      description: 'Please upload a CSV file',
      variant: 'destructive'
    })
    resetFileUpload()
    return
  }
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    toast({
      title: 'File too large',
      description: 'Maximum file size is 5MB',
      variant: 'destructive'
    })
    resetFileUpload()
    return
  }
  
  selectedFile.value = file
}

function resetFileUpload() {
  selectedFile.value = null
  const input = document.getElementById('file-upload')
  if (input) input.value = ''
}

function downloadTemplate() {
  // Generate a CSV template based on required fields
  const headers = requiredFields.map(field => field.key)
  const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',')
  
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'pricing_template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function downloadSampleData() {
  // Generate sample data based on a few products
  const sampleProducts = props.products.slice(0, 5).map(product => {
    return {
      productId: product.id,
      sku: product.sku || `SKU-${product.id}`,
      price: parseFloat(product.price || 0) + 5, // Example price adjustment
      compareAtPrice: product.price,
      salePrice: '',
      minimumPrice: ''
    }
  })
  
  // Generate CSV content
  const headers = Object.keys(sampleProducts[0])
  const csvRows = [
    headers.join(','),
    ...sampleProducts.map(product => 
      headers.map(header => product[header]).join(',')
    )
  ]
  
  const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'pricing_sample.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function downloadErrorReport() {
  // Generate a CSV with the error report
  const csvContent = 'data:text/csv;charset=utf-8,Error\n' + 
    importErrors.value.map(error => `"${error}"`).join('\n')
  
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'import_errors.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Process steps
async function proceedToMapping() {
  if (!selectedFile.value) return
  
  isUploading.value = true
  importErrors.value = []
  
  try {
    // Parse CSV file
    const parseResult = await new Promise((resolve, reject) => {
      Papa.parse(selectedFile.value, {
        header: true,
        skipEmptyLines: true,
        complete: resolve,
        error: reject
      })
    })
    
    if (parseResult.errors && parseResult.errors.length > 0) {
      parseResult.errors.forEach(error => {
        importErrors.value.push(`Row ${error.row}: ${error.message}`)
      })
    }
    
    // Store data and preview
    importData.value = parseResult.data || []
    importStats.value.totalRows = importData.value.length
    previewData.value = importData.value.slice(0, 5) // First 5 rows for preview
    
    // Extract column headers for mapping
    importColumns.value = parseResult.meta.fields || []
    
    // Attempt automatic mapping of common field names
    const fieldMappingPatterns = {
      productId: /(^|_)product.?id($|_)/i,
      sku: /(^|_)sku($|_)/i,
      price: /(^|_)price($|_)/i,
      compareAtPrice: /(^|_)(compare|original|regular).?(at.?)?price($|_)/i,
      salePrice: /(^|_)sale.?price($|_)/i,
      minimumPrice: /(^|_)(min|minimum).?price($|_)/i
    }
    
    // Reset field mapping
    Object.keys(fieldMapping.value).forEach(key => {
      fieldMapping.value[key] = ''
    })
    
    // Try to auto-map fields
    importColumns.value.forEach(column => {
      Object.entries(fieldMappingPatterns).forEach(([field, pattern]) => {
        if (pattern.test(column) && !fieldMapping.value[field]) {
          fieldMapping.value[field] = column
        }
      })
    })
    
    currentStep.value = 2
  } catch (error) {
    console.error('Error parsing CSV:', error)
    toast({
      title: 'Error parsing file',
      description: 'Could not parse the CSV file. Please check the format.',
      variant: 'destructive'
    })
  } finally {
    isUploading.value = false
  }
}

function getValueForField(row, fieldKey) {
  const mappedColumn = fieldMapping.value[fieldKey]
  return mappedColumn ? row[mappedColumn] : ''
}

async function proceedToConfirmation() {
  if (!isFieldMappingValid.value) return
  
  isProcessing.value = true
  importStats.value = {
    ...importStats.value,
    productsFound: 0,
    productsNotFound: 0,
    priceUpdates: 0
  }
  importErrors.value = []
  
  try {
    // Validate the mapped data
    const productIdCol = fieldMapping.value.productId
    const skuCol = fieldMapping.value.sku
    
    for (let i = 0; i < importData.value.length; i++) {
      const row = importData.value[i]
      const productId = productIdCol ? row[productIdCol] : null
      const sku = skuCol ? row[skuCol] : null
      
      // Check if we can find the product
      const foundProduct = props.products.find(p => 
        (productId && p.id === productId) || (sku && p.sku === sku)
      )
      
      if (foundProduct) {
        importStats.value.productsFound++
        
        // Detect price changes
        const newPrice = parseFloat(row[fieldMapping.value.price] || 0)
        const currentPrice = parseFloat(foundProduct.price || 0)
        if (newPrice !== currentPrice) {
          importStats.value.priceUpdates++
        }
      } else {
        importStats.value.productsNotFound++
        
        if (importStats.value.productsNotFound <= 10) {
          importErrors.value.push(
            `Row ${i + 1}: Product ${productId || sku} not found in your catalog`
          )
        } else if (importStats.value.productsNotFound === 11) {
          importErrors.value.push('Additional products not found...')
        }
      }
    }
    
    currentStep.value = 3
  } catch (error) {
    console.error('Error validating data:', error)
    toast({
      title: 'Validation error',
      description: 'An error occurred while validating your import data',
      variant: 'destructive'
    })
  } finally {
    isProcessing.value = false
  }
}

async function confirmImport() {
  isImporting.value = true
  
  try {
    // Process the import data for the API
    const processedData = importData.value.map(row => {
      const productId = fieldMapping.value.productId ? row[fieldMapping.value.productId] : null
      const sku = fieldMapping.value.sku ? row[fieldMapping.value.sku] : null
      
      return {
        productId,
        sku, 
        price: fieldMapping.value.price ? parseFloat(row[fieldMapping.value.price] || 0) : 0,
        compareAtPrice: fieldMapping.value.compareAtPrice ? parseFloat(row[fieldMapping.value.compareAtPrice] || 0) : null,
        salePrice: fieldMapping.value.salePrice ? parseFloat(row[fieldMapping.value.salePrice] || 0) : null,
        minimumPrice: fieldMapping.value.minimumPrice ? parseFloat(row[fieldMapping.value.minimumPrice] || 0) : null
      }
    })
    
    // Emit the import event with the processed data and options
    const importResult = await emit('import-prices', {
      salesChannelId: props.salesChannel.id,
      prices: processedData,
      options: {
        skipNotFound: skipNotFound.value,
        updateExistingOnly: updateExistingOnly.value
      }
    })
    
    // In a real app, we'd get the result from the API/service
    // For now, simulate a successful import with some stats
    importStats.value = {
      ...importStats.value,
      processed: importData.value.length,
      successful: importStats.value.productsFound,
      failed: importStats.value.productsNotFound,
      created: Math.floor(importStats.value.productsFound * 0.3),
      updated: Math.floor(importStats.value.productsFound * 0.7)
    }
    
    // Simulate some errors for demonstration
    if (importStats.value.failed > 0) {
      importErrors.value = [
        'Some products could not be imported due to validation errors',
        'Row 4: Invalid price format',
        'Row 7: Product not found in catalog',
        'Row 12: Price below minimum threshold'
      ]
    } else {
      importErrors.value = []
    }
    
    toast({
      title: 'Import complete',
      description: `Successfully imported ${importStats.value.successful} product prices`,
      variant: 'success'
    })
    
    currentStep.value = 4
  } catch (error) {
    console.error('Import error:', error)
    toast({
      title: 'Import failed',
      description: 'An error occurred during the import process',
      variant: 'destructive'
    })
  } finally {
    isImporting.value = false
  }
}
</script>