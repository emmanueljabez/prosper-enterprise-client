<template>
  <SheetContent class="w-full sm:max-w-md md:max-w-lg" position="right">
    <SheetHeader>
      <SheetTitle>Import Sync Rules</SheetTitle>
      <SheetDescription>
        Upload {{ importType === 'csv' ? 'CSV' : 'Excel' }} file to import sync rules
      </SheetDescription>
    </SheetHeader>
    
    <div class="mt-6 space-y-6">
      <!-- File Upload Section -->
      <div v-if="!fileSelected" class="space-y-4">
        <div
          class="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
          @dragover.prevent
          @drop.prevent="handleFileDrop"
          @click="$refs.fileInput.click()"
        >
          <FileUpIcon class="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-lg font-medium">Drag and drop or click to upload</h3>
          <p class="text-sm text-muted-foreground mt-1">
            {{ importType === 'csv' ? 'CSV' : 'Excel' }} files only
            ({{ allowedExtensions.join(', ') }})
          </p>
          <p class="text-xs text-muted-foreground mt-2">
            Maximum file size: 10MB
          </p>
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            :accept="acceptedFileTypes"
            @change="handleFileChange"
          />
        </div>
        
        <Alert>
          <AlertCircle class="h-4 w-4 mr-2" />
          <AlertTitle>Import Template</AlertTitle>
          <AlertDescription class="flex flex-col space-y-2">
            <p>Make sure your file follows the required template format.</p>
            <div class="flex items-center mt-2">
              <Button variant="outline" size="sm" @click="downloadTemplate">
                <FileDownIcon class="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
      
      <!-- File Preview Section -->
      <div v-if="fileSelected && !isUploading && !importComplete" class="space-y-4">
        <div class="flex items-center justify-between bg-muted p-3 rounded">
          <div class="flex items-center">
            <FileIcon class="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <div class="font-medium">{{ selectedFile.name }}</div>
              <div class="text-xs text-muted-foreground">{{ formatFileSize(selectedFile.size) }}</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" @click="resetFileSelection">
            <XIcon class="h-4 w-4" />
          </Button>
        </div>
        
        <!-- Validation Results -->
        <div v-if="validationResults">
          <Alert :variant="validationResults.isValid ? 'success' : 'destructive'">
            <CheckCircle2 v-if="validationResults.isValid" class="h-4 w-4 mr-2" />
            <AlertCircle v-else class="h-4 w-4 mr-2" />
            <AlertTitle>
              {{ validationResults.isValid ? 'Validation Successful' : 'Validation Issues' }}
            </AlertTitle>
            <AlertDescription>
              <p v-if="validationResults.isValid">
                {{ validationResults.validRows }} rules are ready to be imported.
              </p>
              <div v-else>
                <p>{{ validationResults.message }}</p>
                <ul v-if="validationResults.errors?.length" class="mt-2 text-sm list-disc pl-5 space-y-1">
                  <li v-for="(error, index) in validationResults.errors.slice(0, 3)" :key="index">
                    {{ error }}
                  </li>
                  <li v-if="validationResults.errors.length > 3">
                    And {{ validationResults.errors.length - 3 }} more issues...
                  </li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </div>
        
        <!-- Column Mapping -->
        <div v-if="showColumnMapping" class="space-y-3">
          <h3 class="text-sm font-medium">Column Mapping</h3>
          <p class="text-sm text-muted-foreground">
            Map the columns in your file to the required fields.
          </p>
          
          <div class="space-y-3 mt-4">
            <div v-for="(field, index) in requiredFields" :key="index" class="grid grid-cols-2 gap-2">
              <div class="text-sm">{{ field.label }}</div>
              <Select v-model="columnMapping[field.key]">
                <SelectTrigger>
                  <SelectValue :placeholder="`Select column for ${field.label}`" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="col in detectedColumns" :key="col" :value="col">
                    {{ col }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <!-- Preview Table -->
        <div v-if="previewData.length" class="space-y-3">
          <Collapsible>
            <CollapsibleTrigger class="flex items-center text-sm font-medium">
              <ChevronRightIcon class="h-4 w-4 mr-1 transition-transform ui-expanded:rotate-90" />
              Data Preview ({{ previewData.length }} rows)
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div class="max-h-60 overflow-auto border rounded-md mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead v-for="header in previewHeaders" :key="header">
                        {{ header }}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="(row, rowIndex) in previewData" :key="rowIndex">
                      <TableCell v-for="header in previewHeaders" :key="header">
                        {{ row[header] }}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        <!-- Import Options -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium">Import Options</h3>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="updateExisting" v-model="importOptions.updateExisting" />
              <Label for="updateExisting">Update existing rules</Label>
            </div>
            <p class="text-xs text-muted-foreground ml-6">
              If a rule with the same ID or name exists, it will be updated.
            </p>
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="skipErrors" v-model="importOptions.skipErrors" />
              <Label for="skipErrors">Skip rows with errors</Label>
            </div>
            <p class="text-xs text-muted-foreground ml-6">
              Continue importing valid rows even if some rows have errors.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="isUploading" class="py-8 text-center">
        <Loader2Icon class="h-8 w-8 animate-spin mx-auto text-primary" />
        <p class="mt-4 text-muted-foreground">
          Importing rules... This may take a moment.
        </p>
      </div>
      
      <!-- Import Complete State -->
      <div v-if="importComplete" class="space-y-4">
        <Alert variant="success">
          <CheckCircle2 class="h-4 w-4 mr-2" />
          <AlertTitle>Import Complete</AlertTitle>
          <AlertDescription>
            Successfully imported {{ importResult.count }} rules.
          </AlertDescription>
        </Alert>
        
        <div v-if="importResult.warnings?.length" class="space-y-2">
          <h3 class="text-sm font-medium">Warnings</h3>
          <Alert variant="warning">
            <AlertCircle class="h-4 w-4 mr-2" />
            <AlertDescription>
              <ul class="list-disc pl-5 space-y-1">
                <li v-for="(warning, index) in importResult.warnings" :key="index">
                  {{ warning }}
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
    
    <div class="mt-6 space-x-2 flex justify-end">
      <Button variant="outline" @click="$emit('close')">
        {{ importComplete ? 'Close' : 'Cancel' }}
      </Button>
      
      <Button 
        v-if="fileSelected && !isUploading && !importComplete" 
        @click="processImport"
        :disabled="!canImport"
      >
        <UploadIcon class="h-4 w-4 mr-2" />
        Import Rules
      </Button>
      
      <Button 
        v-if="importComplete" 
        variant="default" 
        @click="resetImport"
      >
        Import More
      </Button>
    </div>
  </SheetContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  FileUpIcon, FileIcon, FileDownIcon, XIcon, UploadIcon,
  AlertCircle, Loader2Icon, CheckCircle2, ChevronRightIcon
} from 'lucide-vue-next'
import { useInventorySyncStore } from '@/store/modules/rules/sync'
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const props = defineProps({
  importType: {
    type: String,
    default: 'csv',
    validator: (value) => ['csv', 'excel'].includes(value)
  }
})

const emit = defineEmits(['import-complete', 'close'])
const syncStore = useInventorySyncStore()

// State
const fileInput = ref(null)
const selectedFile = ref(null)
const fileSelected = ref(false)
const isUploading = ref(false)
const importComplete = ref(false)
const validationResults = ref(null)
const previewData = ref([])
const previewHeaders = ref([])
const detectedColumns = ref([])
const importResult = ref(null)
const showColumnMapping = ref(false)

// Import options
const importOptions = ref({
  updateExisting: true,
  skipErrors: true
})

// Column mapping
const columnMapping = ref({})

// Required fields for mapping
const requiredFields = [
  { key: 'name', label: 'Rule Name' },
  { key: 'description', label: 'Description' },
  { key: 'scope', label: 'Scope' },
  { key: 'triggerType', label: 'Trigger Type' },
  { key: 'action', label: 'Action' },
  { key: 'priority', label: 'Priority' },
  { key: 'active', label: 'Status' }
]

// Computed properties
const allowedExtensions = computed(() => {
  return props.importType === 'csv' ? ['.csv'] : ['.xlsx', '.xls']
})

const acceptedFileTypes = computed(() => {
  return props.importType === 'csv' 
    ? '.csv,text/csv' 
    : '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
})

const canImport = computed(() => {
  return fileSelected.value && 
    (!validationResults.value || validationResults.value.isValid || importOptions.value.skipErrors)
})

// Methods
function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    fileSelected.value = true
    validateAndPreviewFile(file)
  }
}

function handleFileDrop(event) {
  const file = event.dataTransfer.files[0]
  if (file) {
    // Check if file type is allowed
    const fileExt = file.name.split('.').pop().toLowerCase()
    if (props.importType === 'csv' && fileExt !== 'csv') {
      alert('Only CSV files are allowed')
      return
    }
    if (props.importType === 'excel' && !['xlsx', 'xls'].includes(fileExt)) {
      alert('Only Excel files are allowed')
      return
    }
    
    selectedFile.value = file
    fileSelected.value = true
    validateAndPreviewFile(file)
  }
}

function resetFileSelection() {
  selectedFile.value = null
  fileSelected.value = false
  previewData.value = []
  previewHeaders.value = []
  validationResults.value = null
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function resetImport() {
  resetFileSelection()
  importComplete.value = false
  importResult.value = null
  isUploading.value = false
}

function validateAndPreviewFile(file) {
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      if (props.importType === 'csv') {
        parseCSV(e.target.result)
      } else {
        // Mock Excel parsing for now - in a real implementation,
        // you would use a library like SheetJS/xlsx
        mockParseExcel(file.name)
      }
    } catch (error) {
      validationResults.value = {
        isValid: false,
        message: 'Failed to parse file',
        errors: [error.message]
      }
    }
  }
  
  reader.onerror = () => {
    validationResults.value = {
      isValid: false,
      message: 'Error reading file',
      errors: ['Could not read the file. Please try again.']
    }
  }
  
  if (props.importType === 'csv') {
    reader.readAsText(file)
  } else {
    // For Excel, we'd normally use different methods
    // For now, just show a mock preview
    mockParseExcel(file.name)
  }
}

function parseCSV(content) {
  // Simple CSV parsing - in a real app, use a robust CSV parser library
  const lines = content.split('\n')
  if (lines.length < 2) {
    validationResults.value = {
      isValid: false,
      message: 'File is empty or has no data rows',
      errors: ['The file must contain a header row and at least one data row']
    }
    return
  }
  
  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  previewHeaders.value = headers
  detectedColumns.value = headers
  
  // Auto-map columns based on header names
  autoMapColumns(headers)
  
  // Parse data (limit to 5 rows for preview)
  const parsedData = []
  for (let i = 1; i < Math.min(lines.length, 6); i++) {
    if (!lines[i].trim()) continue
    
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const row = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    parsedData.push(row)
  }
  
  previewData.value = parsedData
  
  // Validate data
  validateData(parsedData, headers)
}

function mockParseExcel(fileName) {
  // Mock data for Excel preview
  previewHeaders.value = [
    'name', 'description', 'scope', 'triggerType', 
    'action', 'priority', 'active', 'tags'
  ]
  detectedColumns.value = previewHeaders.value
  
  // Auto-map columns
  autoMapColumns(previewHeaders.value)
  
  // Generate mock data
  const mockData = [
    {
      name: 'Low Stock Alert',
      description: 'Notify when stock is low',
      scope: 'global',
      triggerType: 'threshold',
      action: 'notify_only',
      priority: '100',
      active: 'true',
      tags: 'alert,inventory'
    },
    {
      name: 'Hide Out-of-Stock Items',
      description: 'Automatically hide products when out of stock',
      scope: 'product',
      triggerType: 'stock_change',
      action: 'hide_product',
      priority: '90',
      active: 'true',
      tags: 'visibility,automation'
    },
    {
      name: 'Weekly Inventory Sync',
      description: 'Weekly synchronization of inventory levels',
      scope: 'global',
      triggerType: 'scheduled',
      action: 'update_inventory',
      priority: '80',
      active: 'true',
      tags: 'scheduled,weekly'
    }
  ]
  
  previewData.value = mockData
  
  // Mock validation
  validationResults.value = {
    isValid: true,
    validRows: mockData.length,
    message: 'All rows are valid and ready to import'
  }
}

function autoMapColumns(headers) {
  // Reset mapping
  columnMapping.value = {}
  
  // Try to map headers to required fields
  requiredFields.forEach(field => {
    // Check for exact match
    const exactMatch = headers.find(h => h.toLowerCase() === field.key.toLowerCase())
    if (exactMatch) {
      columnMapping.value[field.key] = exactMatch
      return
    }
    
    // Check for partial match
    const partialMatch = headers.find(h => 
      h.toLowerCase().includes(field.key.toLowerCase()) ||
      field.label.toLowerCase().includes(h.toLowerCase())
    )
    
    if (partialMatch) {
      columnMapping.value[field.key] = partialMatch
    }
  })
  
  // If we have incomplete mappings, show the mapping UI
  const mappedFields = Object.keys(columnMapping.value).length
  showColumnMapping.value = mappedFields < requiredFields.length
}

function validateData(data, headers) {
  // Basic validation
  const errors = []
  let isValid = true
  
  // Check for required fields
  const missingFields = []
  requiredFields.forEach(field => {
    // Check if we have a mapping for this field
    if (!columnMapping.value[field.key]) {
      missingFields.push(field.label)
    }
  })
  
  if (missingFields.length > 0) {
    errors.push(`Missing required columns: ${missingFields.join(', ')}`)
    isValid = false
  }
  
  // Validate data rows
  data.forEach((row, index) => {
    // Validate name (required)
    const nameField = columnMapping.value['name']
    if (nameField && !row[nameField]) {
      errors.push(`Row ${index + 1}: Rule name is required`)
      isValid = false
    }
    
    // Validate scope (must be one of valid values)
    const scopeField = columnMapping.value['scope']
    if (scopeField && row[scopeField]) {
      const validScopes = ['global', 'category', 'product', 'item']
      if (!validScopes.includes(row[scopeField].toLowerCase())) {
        errors.push(`Row ${index + 1}: Invalid scope value "${row[scopeField]}" (must be one of: ${validScopes.join(', ')})`)
        isValid = false
      }
    }
    
    // Validate trigger type
    const triggerTypeField = columnMapping.value['triggerType']
    if (triggerTypeField && row[triggerTypeField]) {
      const validTriggers = ['stock_change', 'threshold', 'scheduled', 'manual']
      if (!validTriggers.includes(row[triggerTypeField].toLowerCase())) {
        errors.push(`Row ${index + 1}: Invalid trigger type "${row[triggerTypeField]}" (must be one of: ${validTriggers.join(', ')})`)
        isValid = false
      }
    }
    
    // Validate action
    const actionField = columnMapping.value['action']
    if (actionField && row[actionField]) {
      const validActions = ['update_inventory', 'notify_only', 'hide_product', 'show_product', 'change_status']
      if (!validActions.includes(row[actionField].toLowerCase())) {
        errors.push(`Row ${index + 1}: Invalid action "${row[actionField]}" (must be one of: ${validActions.join(', ')})`)
        isValid = false
      }
    }
    
    // Validate priority (must be a number)
    const priorityField = columnMapping.value['priority']
    if (priorityField && row[priorityField]) {
      if (isNaN(Number(row[priorityField]))) {
        errors.push(`Row ${index + 1}: Priority must be a number`)
        isValid = false
      }
    }
    
    // Validate active (must be boolean-like)
    const activeField = columnMapping.value['active']
    if (activeField && row[activeField]) {
      const value = row[activeField].toLowerCase()
      if (!['true', 'false', 'yes', 'no', '1', '0'].includes(value)) {
        errors.push(`Row ${index + 1}: Active status must be a boolean value (true/false, yes/no, 1/0)`)
        isValid = false
      }
    }
  })
  
  validationResults.value = {
    isValid,
    validRows: isValid ? data.length : 0,
    message: isValid ? 'File validation successful' : 'Validation failed',
    errors: errors
  }
}

async function processImport() {
  isUploading.value = true
  
  try {
    // In a real implementation, you'd send the file to the server
    // Here we're simulating the API call
    
    // Create a FormData object
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('type', props.importType)
    formData.append('updateExisting', importOptions.value.updateExisting)
    formData.append('skipErrors', importOptions.value.skipErrors)
    
    // Add column mappings
    formData.append('columnMapping', JSON.stringify(columnMapping.value))
    
    // Call the API
    const response = await syncStore.importSyncRules(formData)
    
    // Process response
    importComplete.value = true
    importResult.value = {
      success: true,
      count: response.importedCount || 5, // Fallback for mock
      warnings: response.warnings || []
    }
    
    // Emit the complete event
    emit('import-complete', {
      success: true,
      count: importResult.value.count
    })
  } catch (error) {
    console.error('Import failed:', error)
    
    importComplete.value = true
    importResult.value = {
      success: false,
      error: error.message || 'Import failed. Please try again.'
    }
    
    // Emit the complete event with error
    emit('import-complete', {
      success: false,
      error: importResult.value.error
    })
  } finally {
    isUploading.value = false
  }
}

function downloadTemplate() {
  // In a real app, you'd generate or download a real template
  // For this example, we'll create a simple CSV or XLSX download
  const templateData = props.importType === 'csv'
    ? 'name,description,scope,triggerType,action,priority,active,tags\n' +
      'Low Stock Alert,Notify when stock is low,global,threshold,notify_only,100,true,alert;inventory\n' +
      'Hide Out-of-Stock Items,Automatically hide products when out of stock,product,stock_change,hide_product,90,true,visibility;automation'
    : null // For Excel, you'd use a library to create a real Excel file
  
  if (templateData) {
    const blob = new Blob([templateData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sync_rules_template.${props.importType}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } else {
    // Mock Excel download - in a real app, use a library to create Excel files
    alert('Excel template download would happen here')
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}
</script>