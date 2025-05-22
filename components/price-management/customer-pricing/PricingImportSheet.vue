<template>
  <SheetContent class="sm:max-w-md md:max-w-lg w-full overflow-y-auto">
    <SheetHeader>
      <SheetTitle>
        {{ importTypeTitle }}
      </SheetTitle>
      <SheetDescription>
        Import customer-specific pricing rules from {{ importTypeDescription }}
      </SheetDescription>
    </SheetHeader>

    <div class="py-6 space-y-6">
      <!-- CSV Import -->
      <div v-if="importType === 'csv'">
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <div 
              class="border-2 border-dashed rounded-md p-8 w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary"
              @click="triggerFileInput"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
              :class="{ 'border-primary bg-primary/5': isDragging || csvFile }"
            >
              <div v-if="!csvFile">
                <UploadCloudIcon class="h-10 w-10 text-muted-foreground mb-2" />
                <p class="text-sm text-muted-foreground">
                  Drag and drop your CSV file here, or <span class="text-primary font-medium">click to browse</span>
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  Supported format: CSV
                </p>
              </div>
              <div v-else class="text-center">
                <CheckCircle2Icon class="h-8 w-8 text-primary mb-2" />
                <p class="text-sm font-medium">{{ csvFile.name }}</p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ formatFileSize(csvFile.size) }} • Click or drop to replace
                </p>
              </div>
              <input 
                type="file"
                ref="fileInput"
                class="hidden"
                accept=".csv"
                @change="handleFileSelected"
              />
            </div>
          </div>

          <div v-if="csvFile" class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <Label>Column Mapping</Label>
                <Button variant="ghost" size="sm" @click="resetMapping">Reset</Button>
              </div>
              <div class="border rounded-md divide-y">
                <div v-for="(field, index) in requiredFields" :key="field.key" class="p-3 flex justify-between items-center">
                  <div>
                    <p class="font-medium text-sm">{{ field.label }}</p>
                    <p class="text-xs text-muted-foreground">{{ field.description }}</p>
                  </div>
                  <Select v-model="columnMapping[field.key]">
                    <SelectTrigger class="w-[180px]">
                      <SelectValue :placeholder="`Map to ${field.label}`" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="header in csvHeaders" :key="header" :value="header">
                        {{ header }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              class="w-full" 
              size="lg"
              :disabled="!isMappingValid || isImporting"
              @click="importCSV"
            >
              <Loader2Icon v-if="isImporting" class="h-4 w-4 mr-2 animate-spin" />
              <UploadIcon v-else class="h-4 w-4 mr-2" />
              {{ isImporting ? 'Importing...' : 'Import Price Rules' }}
            </Button>

            <div v-if="!isMappingValid" class="rounded-md bg-amber-50 p-3 border border-amber-200">
              <div class="flex items-start">
                <AlertTriangleIcon class="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                <div>
                  <p class="text-sm font-medium text-amber-800">Please map all required fields</p>
                  <p class="text-xs text-amber-700 mt-1">
                    Each required field must be mapped to a CSV column before importing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!csvFile" class="mt-6">
            <h4 class="text-sm font-medium mb-2">Need a template?</h4>
            <Button variant="outline" size="sm" @click="downloadTemplate">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
            <p class="text-xs text-muted-foreground mt-2">
              Use our template to ensure your data is formatted correctly for import.
            </p>
          </div>
        </div>
      </div>

      <!-- Excel Import -->
      <div v-if="importType === 'excel'">
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <div 
              class="border-2 border-dashed rounded-md p-8 w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary"
              @click="triggerFileInput"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
              :class="{ 'border-primary bg-primary/5': isDragging || excelFile }"
            >
              <div v-if="!excelFile">
                <UploadCloudIcon class="h-10 w-10 text-muted-foreground mb-2" />
                <p class="text-sm text-muted-foreground">
                  Drag and drop your Excel file here, or <span class="text-primary font-medium">click to browse</span>
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  Supported formats: XLSX, XLS
                </p>
              </div>
              <div v-else class="text-center">
                <CheckCircle2Icon class="h-8 w-8 text-primary mb-2" />
                <p class="text-sm font-medium">{{ excelFile.name }}</p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ formatFileSize(excelFile.size) }} • Click or drop to replace
                </p>
              </div>
              <input 
                type="file"
                ref="fileInput"
                class="hidden"
                accept=".xlsx,.xls"
                @change="handleFileSelected"
              />
            </div>
          </div>

          <div v-if="excelFile" class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <Label>Excel Sheet</Label>
              </div>
              <Select v-model="selectedSheet">
                <SelectTrigger>
                  <SelectValue placeholder="Select a sheet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="sheet in excelSheets" :key="sheet" :value="sheet">
                    {{ sheet }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <Label>Column Mapping</Label>
                <Button variant="ghost" size="sm" @click="resetMapping">Reset</Button>
              </div>
              <div class="border rounded-md divide-y">
                <div v-for="(field, index) in requiredFields" :key="field.key" class="p-3 flex justify-between items-center">
                  <div>
                    <p class="font-medium text-sm">{{ field.label }}</p>
                    <p class="text-xs text-muted-foreground">{{ field.description }}</p>
                  </div>
                  <Select v-model="columnMapping[field.key]">
                    <SelectTrigger class="w-[180px]">
                      <SelectValue :placeholder="`Map to ${field.label}`" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="header in excelHeaders" :key="header" :value="header">
                        {{ header }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              class="w-full" 
              size="lg"
              :disabled="!isMappingValid || !selectedSheet || isImporting"
              @click="importExcel"
            >
              <Loader2Icon v-if="isImporting" class="h-4 w-4 mr-2 animate-spin" />
              <UploadIcon v-else class="h-4 w-4 mr-2" />
              {{ isImporting ? 'Importing...' : 'Import Price Rules' }}
            </Button>

            <div v-if="!isMappingValid || !selectedSheet" class="rounded-md bg-amber-50 p-3 border border-amber-200">
              <div class="flex items-start">
                <AlertTriangleIcon class="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                <div>
                  <p class="text-sm font-medium text-amber-800">
                    {{ !selectedSheet ? 'Please select a sheet' : 'Please map all required fields' }}
                  </p>
                  <p class="text-xs text-amber-700 mt-1">
                    {{ !selectedSheet 
                      ? 'Select which Excel sheet contains your pricing data.' 
                      : 'Each required field must be mapped to an Excel column before importing.' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!excelFile" class="mt-6">
            <h4 class="text-sm font-medium mb-2">Need a template?</h4>
            <Button variant="outline" size="sm" @click="downloadTemplate">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Download Excel Template
            </Button>
            <p class="text-xs text-muted-foreground mt-2">
              Use our template to ensure your data is formatted correctly for import.
            </p>
          </div>
        </div>
      </div>

      <!-- API Import -->
      <div v-if="importType === 'api'">
        <div class="space-y-4">
          <div>
            <Label for="api-url">API Endpoint URL</Label>
            <Input
              id="api-url"
              v-model="apiUrl"
              placeholder="https://example.com/api/pricing"
            />
            <p class="text-xs text-muted-foreground mt-1">
              Enter the URL of the API endpoint that returns pricing data.
            </p>
          </div>

          <div>
            <Label for="api-method">HTTP Method</Label>
            <Select v-model="apiMethod">
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="apiMethod === 'POST'">
            <Label for="api-body">Request Body (JSON)</Label>
            <Textarea
              id="api-body"
              v-model="apiBody"
              placeholder='{"key": "value"}'
              rows="5"
            />
            <p class="text-xs text-muted-foreground mt-1">
              Enter the JSON payload to send with your request.
            </p>
          </div>

          <div>
            <Label for="api-headers">Headers (Optional)</Label>
            <div class="space-y-2">
              <div 
                v-for="(header, index) in apiHeaders" 
                :key="index"
                class="flex items-center space-x-2"
              >
                <Input
                  v-model="header.key"
                  placeholder="Header name"
                  class="flex-1"
                />
                <Input
                  v-model="header.value"
                  placeholder="Value"
                  class="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  @click="removeHeader(index)"
                >
                  <XIcon class="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                @click="addHeader"
              >
                <PlusIcon class="h-4 w-4 mr-2" />
                Add Header
              </Button>
            </div>
          </div>

          <Button 
            class="w-full" 
            size="lg"
            :disabled="!apiUrl || isImporting"
            @click="importFromApi"
          >
            <Loader2Icon v-if="isImporting" class="h-4 w-4 mr-2 animate-spin" />
            <WebhookIcon v-else class="h-4 w-4 mr-2" />
            {{ isImporting ? 'Importing...' : 'Import from API' }}
          </Button>
        </div>
      </div>

      <!-- Result -->
      <div v-if="importResult" class="mt-6">
        <div 
          class="p-4 rounded-md"
          :class="{
            'bg-success/10 border border-success/20': importResult.success,
            'bg-destructive/10 border border-destructive/20': !importResult.success
          }"
        >
          <div class="flex items-start">
            <CheckCircle2Icon v-if="importResult.success" class="h-5 w-5 text-success mt-0.5 mr-2" />
            <XCircleIcon v-else class="h-5 w-5 text-destructive mt-0.5 mr-2" />
            <div>
              <p class="text-sm font-medium">
                {{ importResult.success ? 'Import successful!' : 'Import failed' }}
              </p>
              <p class="text-xs mt-1">
                {{ importResult.success 
                  ? `Successfully imported ${importResult.count} pricing rules.` 
                  : importResult.error }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SheetFooter>
      <Button variant="outline" @click="$emit('close')">Close</Button>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  AlertTriangleIcon,
  CheckCircle2Icon,
  DownloadIcon,
  Loader2Icon,
  PlusIcon,
  UploadCloudIcon,
  UploadIcon,
  WebhookIcon,
  XCircleIcon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

const props = defineProps({
  importType: {
    type: String,
    required: true,
    validator: (value) => ['csv', 'excel', 'api'].includes(value)
  }
})

const emit = defineEmits(['import-complete', 'close'])

// File upload state
const fileInput = ref(null)
const isDragging = ref(false)
const csvFile = ref(null)
const excelFile = ref(null)
const csvHeaders = ref([])
const excelSheets = ref([])
const excelHeaders = ref([])
const selectedSheet = ref('')
const columnMapping = ref({})
const isImporting = ref(false)
const importResult = ref(null)

// API Import state
const apiUrl = ref('')
const apiMethod = ref('GET')
const apiBody = ref('{}')
const apiHeaders = ref([{ key: '', value: '' }])

// Define the required fields for mapping
const requiredFields = [
  { key: 'customerId', label: 'Customer ID', description: 'Unique identifier for the customer' },
  { key: 'customerName', label: 'Customer Name', description: 'Name of the customer' },
  { key: 'productId', label: 'Product ID', description: 'Unique identifier for the product' },
  { key: 'productName', label: 'Product Name', description: 'Name of the product' },
  { key: 'discountType', label: 'Discount Type', description: 'percentage, fixed, or override' },
  { key: 'amount', label: 'Amount', description: 'Discount amount or percentage' },
  { key: 'startDate', label: 'Start Date', description: 'When the price rule becomes active' }
]

// Computed properties
const importTypeTitle = computed(() => {
  switch (props.importType) {
    case 'csv': return 'Import from CSV'
    case 'excel': return 'Import from Excel'
    case 'api': return 'Import from API'
    default: return 'Import Data'
  }
})

const importTypeDescription = computed(() => {
  switch (props.importType) {
    case 'csv': return 'a CSV file'
    case 'excel': return 'an Excel spreadsheet'
    case 'api': return 'an external API'
    default: return 'external source'
  }
})

const isMappingValid = computed(() => {
  if (props.importType === 'api') return true

  return requiredFields.every(field => 
    columnMapping.value[field.key] && 
    columnMapping.value[field.key].trim() !== ''
  )
})

// Methods
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (props.importType === 'csv') {
    csvFile.value = file
    parseCSVHeaders(file)
  } else if (props.importType === 'excel') {
    excelFile.value = file
    parseExcelFile(file)
  }

  // Reset the file input to allow selecting the same file again
  event.target.value = null
}

const handleFileDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (!file) return

  if (props.importType === 'csv' && file.name.toLowerCase().endsWith('.csv')) {
    csvFile.value = file
    parseCSVHeaders(file)
  } else if (props.importType === 'excel' && 
    (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls'))) {
    excelFile.value = file
    parseExcelFile(file)
  }
}

const parseCSVHeaders = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    const lines = content.split('\n')
    if (lines.length > 0) {
      const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''))
      csvHeaders.value = headers
      
      // Auto-map columns if headers match our required fields
      autoMapColumns(headers)
    }
  }
  reader.readAsText(file)
}

const parseExcelFile = (file) => {
  // For a real implementation, you would use a library like SheetJS (xlsx)
  // This is a simplified mock for demonstration
  
  // Mock sheet names
  excelSheets.value = ['Sheet1', 'Price Rules', 'Data']
  
  // Mock headers for the first sheet
  excelHeaders.value = [
    'Customer ID', 'Customer Name', 'Product ID', 'Product SKU', 'Product Name',
    'Regular Price', 'Discount Type', 'Discount Amount', 'Start Date', 'End Date',
    'Status', 'Notes'
  ]
  
  // Auto-map columns
  autoMapColumns(excelHeaders.value)
}

const autoMapColumns = (headers) => {
  // Reset mapping
  resetMapping()
  
  // Try to automatically map columns based on similar names
  requiredFields.forEach(field => {
    const headerKey = field.key.toLowerCase()
    const headerLabel = field.label.toLowerCase()
    
    // Find an exact match first
    let match = headers.find(h => h.toLowerCase() === headerKey || h.toLowerCase() === headerLabel)
    
    // If no exact match, look for a partial match
    if (!match) {
      match = headers.find(h => 
        h.toLowerCase().includes(headerKey) || 
        h.toLowerCase().includes(headerLabel) ||
        headerKey.includes(h.toLowerCase()) ||
        headerLabel.includes(h.toLowerCase())
      )
    }
    
    if (match) {
      columnMapping.value[field.key] = match
    }
  })
}

const resetMapping = () => {
  columnMapping.value = {}
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const downloadTemplate = () => {
  // Generate and download the appropriate template
  // This would typically create a file with the required headers
  
  // For demonstration, we'll just show what the template would include
  const templateHeaders = requiredFields.map(field => field.label).join(',')
  
  // In a real implementation, you would create a file and trigger a download
  console.log('Template headers:', templateHeaders)
  
  // Mock successful download
  alert('Template downloaded successfully!')
}

const addHeader = () => {
  apiHeaders.value.push({ key: '', value: '' })
}

const removeHeader = (index) => {
  apiHeaders.value.splice(index, 1)
  
  // Always keep at least one header row
  if (apiHeaders.value.length === 0) {
    apiHeaders.value.push({ key: '', value: '' })
  }
}

const importCSV = async () => {
  isImporting.value = true
  importResult.value = null
  
  try {
    // In a real implementation, you would:
    // 1. Read the full CSV file
    // 2. Parse according to the column mapping
    // 3. Validate each row
    // 4. Submit to your API
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock successful import
    const result = {
      success: true,
      count: Math.floor(Math.random() * 50) + 5  // Random number between 5-55
    }
    
    importResult.value = result
    emit('import-complete', result)
  } catch (error) {
    // Handle error
    importResult.value = {
      success: false,
      error: error.message || 'Failed to import CSV data'
    }
    emit('import-complete', importResult.value)
  } finally {
    isImporting.value = false
  }
}

const importExcel = async () => {
  isImporting.value = true
  importResult.value = null
  
  try {
    // Similar to CSV import, but with Excel-specific parsing
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock successful import
    const result = {
      success: true,
      count: Math.floor(Math.random() * 100) + 10  // Random number between 10-110
    }
    
    importResult.value = result
    emit('import-complete', result)
  } catch (error) {
    // Handle error
    importResult.value = {
      success: false,
      error: error.message || 'Failed to import Excel data'
    }
    emit('import-complete', importResult.value)
  } finally {
    isImporting.value = false
  }
}

const importFromApi = async () => {
  isImporting.value = true
  importResult.value = null
  
  try {
    // Validate API URL
    if (!apiUrl.value) {
      throw new Error('API URL is required')
    }
    
    // In a real implementation, you would:
    // 1. Prepare headers
    // 2. Make the API request
    // 3. Process the response
    // 4. Import the data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    // Mock successful import
    const result = {
      success: true,
      count: Math.floor(Math.random() * 200) + 20  // Random number between 20-220
    }
    
    importResult.value = result
    emit('import-complete', result)
  } catch (error) {
    // Handle error
    importResult.value = {
      success: false,
      error: error.message || 'Failed to import from API'
    }
    emit('import-complete', importResult.value)
  } finally {
    isImporting.value = false
  }
}

// Reset forms when import type changes
watch(() => props.importType, () => {
  csvFile.value = null
  excelFile.value = null
  csvHeaders.value = []
  excelSheets.value = []
  excelHeaders.value = []
  selectedSheet.value = ''
  columnMapping.value = {}
  apiUrl.value = ''
  apiMethod.value = 'GET'
  apiBody.value = '{}'
  apiHeaders.value = [{ key: '', value: '' }]
  importResult.value = null
})
</script>