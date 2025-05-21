<template>
  <Sheet :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <SheetContent class="sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Import Customer Pricing</SheetTitle>
        <SheetDescription>
          Upload a CSV or Excel file with customer pricing data to import.
        </SheetDescription>
      </SheetHeader>
      
      <div class="py-6 space-y-6">
        <!-- Step Indicator -->
        <div class="space-y-2">
          <div class="relative">
            <div class="absolute left-0 top-1/2 w-full h-0.5 bg-border -translate-y-1/2"></div>
            <ol class="relative flex justify-between">
              <li v-for="(step, index) in steps" :key="index" class="flex flex-col items-center">
                <div 
                  class="relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium"
                  :class="{
                    'bg-primary text-primary-foreground': currentStep > index,
                    'bg-primary/20 text-primary': currentStep === index,
                    'bg-muted text-muted-foreground': currentStep < index,
                  }"
                >
                  <CheckIcon v-if="currentStep > index" class="h-4 w-4" />
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <span 
                  class="mt-2 text-xs"
                  :class="{
                    'font-medium': currentStep === index,
                    'text-muted-foreground': currentStep !== index
                  }"
                >
                  {{ step }}
                </span>
              </li>
            </ol>
          </div>
        </div>
        
        <!-- Step 1: Upload File -->
        <div v-if="currentStep === 0" class="space-y-4">
          <div 
            class="border-2 border-dashed rounded-lg p-6 text-center"
            :class="{ 'border-primary': isDragging }"
            @dragenter.prevent="isDragging = true"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
          >
            <div class="flex flex-col items-center">
              <UploadCloudIcon 
                class="h-10 w-10 mb-2"
                :class="isDragging ? 'text-primary' : 'text-muted-foreground'"
              />
              <p class="text-sm mb-2">
                <span class="font-medium">Click to upload</span> or drag and drop
              </p>
              <p class="text-xs text-muted-foreground mb-4">
                CSV or Excel files (max 5MB)
              </p>
              <Button variant="outline" size="sm" @click="triggerFileInput">
                Browse Files
              </Button>
              <input 
                ref="fileInput" 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                class="hidden"
                @change="handleFileInput"
              />
            </div>
          </div>
          
          <div v-if="uploadedFile" class="rounded-md border p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <FileIcon class="h-5 w-5 text-muted-foreground" />
                <div class="space-y-0.5">
                  <p class="text-sm font-medium">{{ uploadedFile.name }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatFileSize(uploadedFile.size) }}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" @click="uploadedFile = null">
                <XIcon class="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div class="space-y-2">
            <Label>Column Mapping</Label>
            <p class="text-xs text-muted-foreground">
              Ensure your file has the following columns:
            </p>
            <ul class="text-xs text-muted-foreground list-disc list-inside ml-2 space-y-1">
              <li>Customer Email or ID (required)</li>
              <li>Product SKU or ID (required)</li>
              <li>Price (required)</li>
              <li>Compare At Price (optional)</li>
              <li>Start Date (optional, format: YYYY-MM-DD)</li>
              <li>End Date (optional, format: YYYY-MM-DD)</li>
            </ul>
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Switch
                id="has-header-row"
                v-model="hasHeaderRow"
              />
              <Label for="has-header-row">File has header row</Label>
            </div>
          </div>
        </div>
        
        <!-- Step 2: Validate and Preview -->
        <div v-else-if="currentStep === 1" class="space-y-4">
          <div v-if="isProcessing" class="flex flex-col items-center justify-center p-8">
            <Loader2Icon class="h-8 w-8 animate-spin text-primary mb-4" />
            <p class="text-sm font-medium">Validating your file...</p>
            <p class="text-xs text-muted-foreground">This may take a moment</p>
          </div>
          
          <div v-else>
            <div v-if="importErrors.length > 0" class="rounded-md bg-destructive/10 border-destructive/20 border p-4 mb-4">
              <div class="flex items-start">
                <AlertCircleIcon class="h-5 w-5 text-destructive mr-3 mt-0.5" />
                <div>
                  <h3 class="text-sm font-medium text-destructive">Validation errors found</h3>
                  <div class="mt-1 text-sm text-destructive/80">
                    <p>Please fix the following issues in your file:</p>
                    <ul class="list-disc list-inside mt-2 space-y-1">
                      <li v-for="(error, index) in importErrors.slice(0, 5)" :key="index">
                        {{ error }}
                      </li>
                      <li v-if="importErrors.length > 5" class="italic">
                        And {{ importErrors.length - 5 }} more errors...
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="importWarnings.length > 0" class="rounded-md bg-warning/10 border-warning/20 border p-4 mb-4">
              <div class="flex items-start">
                <AlertTriangleIcon class="h-5 w-5 text-warning mr-3 mt-0.5" />
                <div>
                  <h3 class="text-sm font-medium text-warning">Warnings</h3>
                  <div class="mt-1 text-sm text-warning/80">
                    <ul class="list-disc list-inside mt-2 space-y-1">
                      <li v-for="(warning, index) in importWarnings.slice(0, 3)" :key="index">
                        {{ warning }}
                      </li>
                      <li v-if="importWarnings.length > 3" class="italic">
                        And {{ importWarnings.length - 3 }} more warnings...
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="space-y-2 mb-4">
              <h3 class="text-sm font-medium">Data Preview</h3>
              <p class="text-xs text-muted-foreground">
                {{ previewData.length }} rows found in your file. 
                <span v-if="previewData.length > 0">
                  Showing first {{ Math.min(previewData.length, 5) }} rows.
                </span>
              </p>
            </div>
            
            <div class="rounded-md border overflow-hidden mb-4">
              <ScrollArea class="h-[250px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead class="w-[180px]">Customer</TableHead>
                      <TableHead class="w-[180px]">Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Compare At</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-if="previewData.length === 0">
                      <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
                        No data found in file or validation errors occurred
                      </TableCell>
                    </TableRow>
                    <TableRow 
                      v-for="(row, index) in previewData.slice(0, 5)" 
                      :key="index"
                      :class="{ 'bg-muted/40': row.hasWarning, 'bg-destructive/10': row.hasError }"
                    >
                      <TableCell>
                        <div class="font-medium">{{ row.customerName || 'Unknown' }}</div>
                        <div class="text-xs text-muted-foreground">{{ row.customerEmail || row.customerId }}</div>
                      </TableCell>
                      <TableCell>
                        <div class="font-medium">{{ row.productName || 'Unknown' }}</div>
                        <div class="text-xs text-muted-foreground">{{ row.productSku || row.productId }}</div>
                      </TableCell>
                      <TableCell>{{ formatCurrency(row.price) }}</TableCell>
                      <TableCell>{{ row.compareAtPrice ? formatCurrency(row.compareAtPrice) : '-' }}</TableCell>
                      <TableCell>{{ row.startDate || '-' }}</TableCell>
                      <TableCell>{{ row.endDate || '-' }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
            
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Switch
                  id="skip-invalid-rows"
                  v-model="skipInvalidRows"
                  :disabled="importErrors.length === 0"
                />
                <Label for="skip-invalid-rows">Skip rows with errors during import</Label>
              </div>
              <p class="text-xs text-muted-foreground ml-7">
                Only valid rows will be imported. Uncheck to cancel import if any errors are found.
              </p>
            </div>
            
            <div class="pt-2">
              <Alert variant="info">
                <InfoIcon class="h-4 w-4" />
                <AlertTitle>Import Summary</AlertTitle>
                <AlertDescription>
                  <p>Total rows: {{ totalRows }}</p>
                  <p>Valid rows: {{ validRows }}</p>
                  <p>Invalid rows: {{ totalRows - validRows }}</p>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
        
        <!-- Step 3: Import Progress -->
        <div v-else-if="currentStep === 2" class="space-y-4">
          <div class="text-center space-y-4">
            <div v-if="importStatus === 'processing'">
              <Loader2Icon class="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <h3 class="text-lg font-medium">Importing pricing data...</h3>
              <p class="text-sm text-muted-foreground">
                Importing {{ currentRow }} of {{ totalRows }} rows
              </p>
            </div>
            
            <div v-else-if="importStatus === 'success'">
              <CheckCircleIcon class="h-12 w-12 text-success mx-auto mb-4" />
              <h3 class="text-lg font-medium">Import Complete</h3>
              <p class="text-sm text-muted-foreground mb-2">
                Successfully imported {{ successRows }} customer pricing rules.
              </p>
              <Alert variant="success">
                <CheckIcon class="h-4 w-4" />
                <AlertTitle>Import Successful</AlertTitle>
                <AlertDescription>
                  <p>Total rows processed: {{ totalRows }}</p>
                  <p>Successfully imported: {{ successRows }}</p>
                  <p>Skipped rows: {{ totalRows - successRows }}</p>
                </AlertDescription>
              </Alert>
            </div>
            
            <div v-else-if="importStatus === 'error'">
              <XCircleIcon class="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 class="text-lg font-medium">Import Failed</h3>
              <p class="text-sm text-muted-foreground mb-2">
                An error occurred during the import process.
              </p>
              <Alert variant="destructive">
                <AlertCircleIcon class="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>
                  {{ importError }}
                </AlertDescription>
              </Alert>
              <p class="text-sm text-muted-foreground mt-4">
                You can try uploading a different file or fix the issues in your current file.
              </p>
            </div>
            
            <div v-else-if="importStatus === 'partial'">
              <AlertTriangleIcon class="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 class="text-lg font-medium">Partial Import</h3>
              <p class="text-sm text-muted-foreground mb-2">
                Some rows were imported, but others had errors.
              </p>
              <Alert variant="warning">
                <AlertTriangleIcon class="h-4 w-4" />
                <AlertTitle>Partial Import</AlertTitle>
                <AlertDescription>
                  <p>Total rows processed: {{ totalRows }}</p>
                  <p>Successfully imported: {{ successRows }}</p>
                  <p>Failed rows: {{ totalRows - successRows }}</p>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
      
      <SheetFooter>
        <div class="w-full flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <div>
            <Button
              type="button"
              variant="outline"
              @click="currentStep > 0 ? currentStep-- : $emit('update:isOpen', false)"
              :disabled="isProcessing || importStatus === 'processing'"
            >
              {{ currentStep > 0 ? 'Back' : 'Cancel' }}
            </Button>
          </div>
          
          <div class="flex flex-col-reverse sm:flex-row sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
            <Button
              v-if="currentStep === 2 && ['success', 'partial', 'error'].includes(importStatus)"
              type="button"
              variant="default"
              @click="$emit('update:isOpen', false)"
            >
              Close
            </Button>
            
            <Button
              v-else
              type="button"
              variant="default"
              @click="handleNextStep"
              :disabled="
                isProcessing || 
                (currentStep === 0 && !uploadedFile) || 
                (currentStep === 1 && importErrors.length > 0 && !skipInvalidRows) ||
                importStatus === 'processing'
              "
            >
              <Loader2Icon
                v-if="isProcessing"
                class="mr-2 h-4 w-4 animate-spin"
              />
              {{ getNextButtonText() }}
            </Button>
          </div>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { 
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  CheckIcon,
  FileIcon,
  InfoIcon,
  Loader2Icon,
  UploadCloudIcon,
  XCircleIcon,
  XIcon
} from 'lucide-vue-next'
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  customers: {
    type: Array,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:isOpen',
  'import-data',
  'validate-data'
])

// State
const steps = ['Upload File', 'Preview & Validate', 'Import']
const currentStep = ref(0)
const fileInput = ref(null)
const uploadedFile = ref(null)
const isDragging = ref(false)
const hasHeaderRow = ref(true)
const skipInvalidRows = ref(false)
const importStatus = ref('idle') // idle, processing, success, error, partial
const importError = ref('')
const importErrors = ref([])
const importWarnings = ref([])
const previewData = ref([])
const totalRows = ref(0)
const validRows = ref(0)
const currentRow = ref(0)
const successRows = ref(0)

// Methods
function formatFileSize(size) {
  if (size < 1024) {
    return `${size} bytes`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }
}

function formatCurrency(value) {
  if (!value) return '$0.00'
  const numValue = parseFloat(value)
  if (isNaN(numValue)) return '$0.00'
  return `$${numValue.toFixed(2)}`
}

function triggerFileInput() {
  fileInput.value.click()
}

function handleFileDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (isValidFile(file)) {
    uploadedFile.value = file
  }
}

function handleFileInput(event) {
  const file = event.target.files[0]
  if (isValidFile(file)) {
    uploadedFile.value = file
  }
  // Reset the file input so the change event fires if same file is selected again
  event.target.value = null
}

function isValidFile(file) {
  if (!file) return false
  
  // Check file type
  const validTypes = [
    'text/csv', 
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  if (!validTypes.includes(file.type)) {
    alert('Please upload a CSV or Excel file')
    return false
  }
  
  // Check file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size exceeds 5MB limit')
    return false
  }
  
  return true
}

function getNextButtonText() {
  if (currentStep.value === 0) return 'Continue'
  if (currentStep.value === 1) return 'Import Data'
  return 'Finish'
}

function handleNextStep() {
  if (currentStep.value === 0) {
    // Move to validation and preview
    validateFile()
  } else if (currentStep.value === 1) {
    // Start import process
    startImport()
  }
}

function validateFile() {
  if (!uploadedFile.value) return
  
  // Reset validation state
  importErrors.value = []
  importWarnings.value = []
  previewData.value = []
  totalRows.value = 0
  validRows.value = 0
  
  // TODO: In a real app, you would send the file to your backend for validation
  // For this example, we'll simulate the validation process
  simulateValidation()
}

function simulateValidation() {
  // Simulate validation process
  importStatus.value = 'processing'
  currentStep.value = 1
  
  // Simulate API call with sample data
  setTimeout(() => {
    // Sample validation results
    totalRows.value = 25
    
    // Sample errors
    importErrors.value = [
      'Row 7: Customer email "invalid@email" is not valid',
      'Row 12: Product SKU "XYZ123" not found in your system',
      'Row 15: Price value "abc" is not a valid number'
    ]
    
    // Sample warnings
    importWarnings.value = [
      'Row 3: Compare At Price is lower than Price',
      'Row 9: End date is before Start date'
    ]
    
    // Calculate valid rows
    validRows.value = totalRows.value - (skipInvalidRows.value ? 0 : importErrors.value.length)
    
    // Sample preview data
    previewData.value = [
      {
        customerId: '1001',
        customerEmail: 'john.doe@example.com',
        customerName: 'John Doe',
        productId: '2001',
        productSku: 'PROD-001',
        productName: 'Premium Widget',
        price: 49.99,
        compareAtPrice: 59.99,
        startDate: '2025-06-01',
        endDate: '2025-12-31',
        hasWarning: false,
        hasError: false
      },
      {
        customerId: '1002',
        customerEmail: 'jane.smith@example.com',
        customerName: 'Jane Smith',
        productId: '2002',
        productSku: 'PROD-002',
        productName: 'Deluxe Gadget',
        price: 29.99,
        compareAtPrice: null,
        startDate: null,
        endDate: null,
        hasWarning: false,
        hasError: false
      },
      {
        customerId: '1003',
        customerEmail: 'bob.jones@example.com',
        customerName: 'Bob Jones',
        productId: '2003',
        productSku: 'PROD-003',
        productName: 'Basic Tool',
        price: 19.99,
        compareAtPrice: 15.99,
        startDate: '2025-07-01',
        endDate: '2025-08-31',
        hasWarning: true,
        hasError: false
      },
      {
        customerId: '1004',
        customerEmail: 'alice.wong@example.com',
        customerName: 'Alice Wong',
        productId: '2004',
        productSku: 'PROD-004',
        productName: 'Special Bundle',
        price: 89.99,
        compareAtPrice: 99.99,
        startDate: null,
        endDate: null,
        hasWarning: false,
        hasError: false
      },
      {
        customerId: '1005',
        customerEmail: 'invalid@email',
        customerName: null,
        productId: null,
        productSku: 'PROD-005',
        productName: 'Premium Service',
        price: 'abc',
        compareAtPrice: null,
        startDate: null,
        endDate: null,
        hasWarning: false,
        hasError: true
      }
    ]
    
    importStatus.value = 'idle'
  }, 1500)
}

function startImport() {
  if (importErrors.value.length > 0 && !skipInvalidRows.value) {
    return
  }
  
  // Move to import step
  currentStep.value = 2
  importStatus.value = 'processing'
  currentRow.value = 0
  successRows.value = 0
  
  // Simulate import process
  simulateImport()
}

function simulateImport() {
  // Simulate a gradual import process for demonstration
  const totalToProcess = validRows.value
  const updateInterval = setInterval(() => {
    currentRow.value += 1
    
    // Randomly succeed (90% chance)
    if (Math.random() < 0.9) {
      successRows.value += 1
    }
    
    // Check if done
    if (currentRow.value >= totalToProcess) {
      clearInterval(updateInterval)
      finishImport()
    }
  }, 100)
}

function finishImport() {
  // Determine final status
  if (successRows.value === 0) {
    importStatus.value = 'error'
    importError.value = 'No rows could be imported. Please check your file and try again.'
  } else if (successRows.value < totalRows.value) {
    importStatus.value = 'partial'
  } else {
    importStatus.value = 'success'
  }
  
  // In a real app, you would emit details about the import
  emit('import-data', {
    status: importStatus.value,
    totalRows: totalRows.value,
    successRows: successRows.value,
    failedRows: totalRows.value - successRows.value
  })
}

// When the sheet is closed, reset the state
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    // Reset on close
    currentStep.value = 0
    uploadedFile.value = null
    isDragging.value = false
    hasHeaderRow.value = true
    skipInvalidRows.value = false
    importStatus.value = 'idle'
    importError.value = ''
    importErrors.value = []
    importWarnings.value = []
    previewData.value = []
    totalRows.value = 0
    validRows.value = 0
    currentRow.value = 0
    successRows.value = 0
  }
})
</script>