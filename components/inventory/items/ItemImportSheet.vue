<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="border-b p-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">{{ importTypeTitle }}</h2>
        <Button variant="ghost" size="icon" @click="$emit('close')">
          <XIcon class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </Button>
      </div>
      <p class="text-sm text-muted-foreground">
        {{ importTypeDescription }}
      </p>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- CSV Import -->
      <template v-if="importType === 'csv'">
        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Upload CSV File</Label>
            <div 
              class="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              @click="triggerFileInput"
              @dragover.prevent="dragOver = true"
              @dragleave.prevent="dragOver = false"
              @drop.prevent="handleFileDrop"
              :class="{ 'border-primary bg-primary/5': dragOver }"
            >
              <input 
                type="file" 
                ref="fileInput" 
                accept=".csv" 
                class="hidden" 
                @change="handleFileSelected"
              />
              
              <div v-if="!selectedFile">
                <UploadIcon class="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <div class="text-sm font-medium">
                  Drag and drop a CSV file here, or click to browse
                </div>
                <div class="text-xs text-muted-foreground mt-1">
                  File must be properly formatted. <Button variant="link" class="p-0 h-auto" @click.stop="downloadTemplate">Download template</Button>
                </div>
              </div>
              
              <div v-else class="text-left">
                <div class="flex items-center gap-2">
                  <FileTextIcon class="h-8 w-8 text-primary" />
                  <div class="flex-1">
                    <div class="font-medium">{{ selectedFile.name }}</div>
                    <div class="text-xs text-muted-foreground">
                      {{ formatFileSize(selectedFile.size) }} · {{ formatFileDate(selectedFile.lastModified) }}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" @click.stop="removeFile">
                    <XIcon class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="csv-delimiter">CSV Delimiter</Label>
            <Select v-model="csvOptions.delimiter">
              <SelectTrigger id="csv-delimiter">
                <SelectValue placeholder="Select delimiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">Comma (,)</SelectItem>
                <SelectItem value=";">Semicolon (;)</SelectItem>
                <SelectItem value="\t">Tab</SelectItem>
                <SelectItem value="|">Pipe (|)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox id="has-header" v-model:checked="csvOptions.hasHeader" />
            <Label for="has-header">File has header row</Label>
          </div>
        </div>
        
        <div v-if="parseError" class="bg-destructive/10 text-destructive p-4 rounded-md">
          <div class="font-semibold">Error parsing CSV:</div>
          <div class="text-sm">{{ parseError }}</div>
        </div>
        
        <div v-if="parsedItems.length > 0" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-medium">Preview ({{ parsedItems.length }} items)</h3>
            <Badge variant="outline">{{ validItemsCount }} valid items</Badge>
          </div>
          
          <div class="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(item, index) in previewItems" :key="index">
                  <TableCell>
                    <div class="flex items-center gap-1">
                      <CheckCircle2Icon v-if="!item.errors.length" class="h-4 w-4 text-success" />
                      <AlertCircleIcon v-else class="h-4 w-4 text-destructive" />
                      <span v-if="item.errors.length" class="text-xs text-destructive">
                        {{ item.errors[0] }}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{{ item.data.sku }}</TableCell>
                  <TableCell>{{ item.data.name }}</TableCell>
                  <TableCell>{{ getCategoryName(item.data.categoryId) }}</TableCell>
                  <TableCell>{{ item.data.stockOnHand || 0 }}</TableCell>
                  <TableCell>{{ formatCurrency(item.data.cost) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div v-if="parsedItems.length > 5" class="text-center text-sm text-muted-foreground">
            Showing first 5 items of {{ parsedItems.length }}
          </div>
          
          <div v-if="hasInvalidItems" class="bg-warning/10 text-warning p-4 rounded-md">
            <div class="font-semibold">Warning:</div>
            <div class="text-sm">
              {{ parsedItems.length - validItemsCount }} items have validation errors and will be skipped during import.
            </div>
          </div>
        </div>
      </template>
      
      <!-- Excel Import -->
      <template v-else-if="importType === 'excel'">
        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Upload Excel File</Label>
            <div 
              class="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              @click="triggerFileInput"
              @dragover.prevent="dragOver = true"
              @dragleave.prevent="dragOver = false"
              @drop.prevent="handleFileDrop"
              :class="{ 'border-primary bg-primary/5': dragOver }"
            >
              <input 
                type="file" 
                ref="fileInput" 
                accept=".xlsx,.xls" 
                class="hidden" 
                @change="handleFileSelected"
              />
              
              <div v-if="!selectedFile">
                <UploadIcon class="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <div class="text-sm font-medium">
                  Drag and drop an Excel file here, or click to browse
                </div>
                <div class="text-xs text-muted-foreground mt-1">
                  File must be properly formatted. <Button variant="link" class="p-0 h-auto" @click.stop="downloadTemplate">Download template</Button>
                </div>
              </div>
              
              <div v-else class="text-left">
                <div class="flex items-center gap-2">
                  <FileSpreadsheetIcon class="h-8 w-8 text-emerald-500" />
                  <div class="flex-1">
                    <div class="font-medium">{{ selectedFile.name }}</div>
                    <div class="text-xs text-muted-foreground">
                      {{ formatFileSize(selectedFile.size) }} · {{ formatFileDate(selectedFile.lastModified) }}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" @click.stop="removeFile">
                    <XIcon class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="sheet-name">Sheet Name</Label>
            <Input id="sheet-name" v-model="excelOptions.sheetName" placeholder="Default: first sheet" />
            <p class="text-xs text-muted-foreground">
              Leave blank to use the first sheet in the workbook
            </p>
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox id="has-header-excel" v-model:checked="excelOptions.hasHeader" />
            <Label for="has-header-excel">File has header row</Label>
          </div>
        </div>
        
        <!-- Excel preview would go here, similar to CSV preview -->
      </template>
      
      <!-- API Import -->
      <template v-else-if="importType === 'api'">
        <div class="space-y-6">
          <div class="space-y-4">
            <h3 class="font-medium">API Connection Settings</h3>
            
            <div class="space-y-2">
              <Label for="api-url" required>API Endpoint URL</Label>
              <Input id="api-url" v-model="apiOptions.url" placeholder="https://example.com/api/inventory" />
            </div>
            
            <div class="space-y-2">
              <Label for="api-method">HTTP Method</Label>
              <Select v-model="apiOptions.method">
                <SelectTrigger id="api-method">
                  <SelectValue placeholder="Select HTTP method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="api-auth-type">Authentication Type</Label>
              <Select v-model="apiOptions.authType">
                <SelectTrigger id="api-auth-type">
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
            
            <div v-if="apiOptions.authType === 'basic'" class="space-y-4">
              <div class="space-y-2">
                <Label for="api-username">Username</Label>
                <Input id="api-username" v-model="apiOptions.username" />
              </div>
              <div class="space-y-2">
                <Label for="api-password">Password</Label>
                <Input id="api-password" v-model="apiOptions.password" type="password" />
              </div>
            </div>
            
            <div v-if="apiOptions.authType === 'bearer'" class="space-y-2">
              <Label for="api-token">Bearer Token</Label>
              <Input id="api-token" v-model="apiOptions.token" />
            </div>
            
            <div v-if="apiOptions.authType === 'apikey'" class="space-y-4">
              <div class="space-y-2">
                <Label for="api-key-name">API Key Name</Label>
                <Input id="api-key-name" v-model="apiOptions.apiKeyName" placeholder="X-API-Key" />
              </div>
              <div class="space-y-2">
                <Label for="api-key-value">API Key Value</Label>
                <Input id="api-key-value" v-model="apiOptions.apiKeyValue" />
              </div>
              <div class="space-y-2">
                <Label for="api-key-location">API Key Location</Label>
                <Select v-model="apiOptions.apiKeyLocation">
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
          </div>
          
          <div class="space-y-4">
            <h3 class="font-medium">Data Mapping</h3>
            <p class="text-sm text-muted-foreground">
              Specify how the API response data maps to inventory fields
            </p>
            
            <div class="space-y-2">
              <Label for="api-data-path">Data Path</Label>
              <Input id="api-data-path" v-model="apiOptions.dataPath" placeholder="e.g., data.items or leave blank" />
              <p class="text-xs text-muted-foreground">
                JSON path to the array of items (leave blank if response is already an array)
              </p>
            </div>
            
            <div class="space-y-2">
              <Button variant="outline" size="sm" @click="testApiConnection">
                <Loader2Icon v-if="apiTesting" class="mr-2 h-4 w-4 animate-spin" />
                <NetworkIcon v-else class="mr-2 h-4 w-4" />
                Test Connection
              </Button>
            </div>
            
            <div v-if="apiTestResult" class="mt-2 text-sm"
              :class="apiTestResult.success ? 'text-success' : 'text-destructive'"
            >
              {{ apiTestResult.message }}
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Footer -->
    <div class="border-t p-4">
      <div class="flex justify-between">
        <Button
          variant="outline"
          @click="$emit('close')"
        >
          Cancel
        </Button>
        <Button
          @click="importItems"
          :disabled="isImportDisabled || isSubmitting"
        >
          <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          Import {{ validItemsCount || '' }} {{ validItemsCount === 1 ? 'Item' : 'Items' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  FileSpreadsheetIcon,
  FileTextIcon,
  Loader2Icon,
  NetworkIcon,
  UploadIcon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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

const props = defineProps({
  importType: {
    type: String,
    required: true,
    validator: (value) => ['csv', 'excel', 'api'].includes(value)
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['import-complete', 'close'])

// State
const fileInput = ref(null)
const selectedFile = ref(null)
const dragOver = ref(false)
const isSubmitting = ref(false)
const parseError = ref('')
const parsedItems = ref([])
const apiTesting = ref(false)
const apiTestResult = ref(null)

// Import options
const csvOptions = reactive({
  delimiter: ',',
  hasHeader: true
})

const excelOptions = reactive({
  sheetName: '',
  hasHeader: true
})

const apiOptions = reactive({
  url: '',
  method: 'GET',
  authType: 'none',
  username: '',
  password: '',
  token: '',
  apiKeyName: 'X-API-Key',
  apiKeyValue: '',
  apiKeyLocation: 'header',
  dataPath: ''
})

// Computed properties
const importTypeTitle = computed(() => {
  switch (props.importType) {
    case 'csv': return 'Import from CSV'
    case 'excel': return 'Import from Excel'
    case 'api': return 'Import from API'
    default: return 'Import Items'
  }
})

const importTypeDescription = computed(() => {
  switch (props.importType) {
    case 'csv': return 'Upload a CSV file with inventory items to import.'
    case 'excel': return 'Upload an Excel spreadsheet with inventory items to import.'
    case 'api': return 'Configure API integration to import inventory items.'
    default: return 'Import inventory items from external sources.'
  }
})

const validItemsCount = computed(() => {
  return parsedItems.value.filter(item => item.errors.length === 0).length
})

const hasInvalidItems = computed(() => {
  return parsedItems.value.length > 0 && validItemsCount.value < parsedItems.value.length
})

const previewItems = computed(() => {
  return parsedItems.value.slice(0, 5)
})

const isImportDisabled = computed(() => {
  if (props.importType === 'csv' || props.importType === 'excel') {
    return !selectedFile.value || validItemsCount.value === 0
  } else if (props.importType === 'api') {
    return !apiOptions.url || !apiTestResult.value?.success
  }
  return true
})

// Methods
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelected = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    parseFile(file)
  }
}

const handleFileDrop = (event) => {
  dragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    selectedFile.value = file
    parseFile(file)
  }
}

const removeFile = () => {
  selectedFile.value = null
  parsedItems.value = []
  parseError.value = ''
  fileInput.value.value = ''
}

const parseFile = async (file) => {
  parsedItems.value = []
  parseError.value = ''
  
  try {
    if (props.importType === 'csv') {
      // In a real app, this would be more robust and use a CSV parsing library
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      // Skip header if option is selected
      const startIndex = csvOptions.hasHeader ? 1 : 0
      
      // Parse each line
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i]
        const values = line.split(csvOptions.delimiter)
        
        // Map CSV columns to item properties
        const itemData = {
          sku: values[0]?.trim() || '',
          name: values[1]?.trim() || '',
          description: values[2]?.trim() || '',
          categoryId: values[3]?.trim() || '',
          cost: parseFloat(values[4]) || 0,
          stockOnHand: parseInt(values[5]) || 0,
          reorderPoint: parseInt(values[6]) || 0,
          reorderQuantity: parseInt(values[7]) || 0,
          status: values[8]?.trim() || 'active',
          unitOfMeasure: values[9]?.trim() || 'each',
        }
        
        // Validate the item
        const errors = validateItem(itemData)
        
        parsedItems.value.push({
          data: itemData,
          errors
        })
      }
      
    } else if (props.importType === 'excel') {
      // In a real app, this would use a library like SheetJS to parse Excel
      parseError.value = 'Excel parsing not implemented in this example. In a production app, this would use SheetJS or similar library.'
    }
  } catch (error) {
    console.error('Error parsing file:', error)
    parseError.value = error.message || 'Invalid file format'
  }
}

const validateItem = (item) => {
  const errors = []
  
  if (!item.sku) {
    errors.push('SKU is required')
  }
  
  if (!item.name) {
    errors.push('Name is required')
  }
  
  if (item.cost < 0) {
    errors.push('Cost cannot be negative')
  }
  
  if (item.stockOnHand < 0) {
    errors.push('Stock cannot be negative')
  }
  
  return errors
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' bytes'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}

const formatFileDate = (timestamp) => {
  return format(new Date(timestamp), 'MMM d, yyyy')
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(value || 0)
}

const getCategoryName = (categoryId) => {
  if (!categoryId) return 'Uncategorized'
  
  const category = props.categories?.find(c => c.id === categoryId)
  return category ? category.name : 'Unknown Category'
}

const downloadTemplate = () => {
  // In a real app, this would generate and download a template file
  alert('In a real application, this would download a template file.')
}

const testApiConnection = async () => {
  apiTesting.value = true
  apiTestResult.value = null
  
  try {
    // In a real app, this would actually test the API connection
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simulated result
    apiTestResult.value = {
      success: true,
      message: 'Connection successful! Found 24 items ready to import.'
    }
  } catch (error) {
    apiTestResult.value = {
      success: false,
      message: error.message || 'Connection failed. Please check your settings.'
    }
  } finally {
    apiTesting.value = false
  }
}

const importItems = async () => {
  if (isImportDisabled.value) return
  
  isSubmitting.value = true
  
  try {
    // In a real app, this would send the data to the server or process it locally
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    let result = { success: true, count: 0 }
    
    if (props.importType === 'csv' || props.importType === 'excel') {
      // Only import valid items
      const validItems = parsedItems.value
        .filter(item => item.errors.length === 0)
        .map(item => item.data)
      
      result.count = validItems.length
    } else if (props.importType === 'api') {
      // Simulate API import
      result.count = 24 // Mock count
    }
    
    emit('import-complete', result)
  } catch (error) {
    console.error('Error during import:', error)
    emit('import-complete', { 
      success: false, 
      error: error.message || 'Failed to import items'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>