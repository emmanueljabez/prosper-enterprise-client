<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex-1 overflow-auto p-6">
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Import Type Info -->
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-2">Import Inventory Items</h2>
          <p class="text-muted-foreground">
            Import items from {{ importType.toUpperCase() }} file
          </p>
        </div>

        <!-- Step 1: File Upload -->
        <Card v-if="currentStep === 1">
          <CardHeader>
            <CardTitle>Step 1: Upload File</CardTitle>
            <CardDescription>
              Select your {{ importType.toUpperCase() }} file containing inventory items
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- File Upload Area -->
            <div 
              class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
              @click="triggerFileInput"
              @drop="handleFileDrop"
              @dragover.prevent
              @dragenter.prevent
            >
              <input
                ref="fileInput"
                type="file"
                :accept="importType === 'csv' ? '.csv' : '.xlsx,.xls'"
                class="hidden"
                @change="handleFileSelect"
              />
              
              <div v-if="!selectedFile" class="space-y-2">
                <FileUp class="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p class="font-medium">Click to upload or drag and drop</p>
                  <p class="text-sm text-muted-foreground">
                    {{ importType.toUpperCase() }} files only
                  </p>
                </div>
              </div>
              
              <div v-else class="space-y-2">
                <FileCheck class="h-12 w-12 mx-auto text-green-600" />
                <div>
                  <p class="font-medium">{{ selectedFile.name }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ formatFileSize(selectedFile.size) }}
                  </p>
                </div>
                <Button variant="outline" size="sm" @click.stop="clearFile">
                  <X class="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>

            <!-- Import Options -->
            <div class="space-y-4">
              <div class="flex items-center space-x-2">
                <Checkbox id="hasHeaders" v-model:checked="importOptions.hasHeaders" />
                <Label for="hasHeaders">First row contains headers</Label>
              </div>
              
              <div class="flex items-center space-x-2">
                <Checkbox id="updateExisting" v-model:checked="importOptions.updateExisting" />
                <Label for="updateExisting">Update existing items (match by item code)</Label>
              </div>
              
              <div class="flex items-center space-x-2">
                <Checkbox id="skipErrors" v-model:checked="importOptions.skipErrors" />
                <Label for="skipErrors">Skip rows with errors and continue</Label>
              </div>
            </div>

            <!-- Template Download -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <Info class="h-5 w-5 text-blue-600 mt-0.5" />
                <div class="flex-1">
                  <p class="text-sm font-medium text-blue-900">Need a template?</p>
                  <p class="text-xs text-blue-700 mb-2">
                    Download our template file to ensure proper formatting
                  </p>
                  <Button variant="outline" size="sm" @click="downloadTemplate">
                    <Download class="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Step 2: Column Mapping -->
        <Card v-else-if="currentStep === 2">
          <CardHeader>
            <CardTitle>Step 2: Map Columns</CardTitle>
            <CardDescription>
              Map your file columns to inventory item fields
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div v-for="field in requiredFields" :key="field.key" class="space-y-2">
                <Label>{{ field.label }} {{ field.required ? '*' : '' }}</Label>
                <Select v-model="columnMapping[field.key]">
                  <SelectTrigger>
                    <SelectValue :placeholder="`Select column for ${field.label}`" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_skip">-- Skip Field --</SelectItem>
                    <SelectItem v-for="column in fileColumns" :key="column" :value="column">
                      {{ column }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Preview -->
            <div v-if="previewData.length > 0" class="mt-6">
              <Label class="text-base font-medium">Preview Data</Label>
              <div class="border rounded-lg mt-2 overflow-auto max-h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead v-for="field in mappedFields" :key="field.key">
                        {{ field.label }}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="(row, index) in previewData.slice(0, 5)" :key="index">
                      <TableCell v-for="field in mappedFields" :key="field.key">
                        {{ row[columnMapping[field.key]] || '-' }}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <p class="text-xs text-muted-foreground mt-2">
                Showing first 5 rows of {{ previewData.length }} total rows
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Step 3: Validation Results -->
        <Card v-else-if="currentStep === 3">
          <CardHeader>
            <CardTitle>Step 3: Validation Results</CardTitle>
            <CardDescription>
              Review validation results before importing
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Validation Summary -->
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ validationResults.valid }}</div>
                <div class="text-sm text-green-700">Valid Rows</div>
              </div>
              <div class="text-center p-4 bg-red-50 rounded-lg">
                <div class="text-2xl font-bold text-red-600">{{ validationResults.errors }}</div>
                <div class="text-sm text-red-700">Errors</div>
              </div>
              <div class="text-center p-4 bg-yellow-50 rounded-lg">
                <div class="text-2xl font-bold text-yellow-600">{{ validationResults.warnings }}</div>
                <div class="text-sm text-yellow-700">Warnings</div>
              </div>
            </div>

            <!-- Error Details -->
            <div v-if="validationResults.errorDetails.length > 0" class="space-y-2">
              <Label class="text-base font-medium text-red-600">Errors</Label>
              <div class="max-h-32 overflow-auto space-y-1">
                <div 
                  v-for="error in validationResults.errorDetails" 
                  :key="error.row"
                  class="text-sm p-2 bg-red-50 border border-red-200 rounded"
                >
                  <span class="font-medium">Row {{ error.row }}:</span> {{ error.message }}
                </div>
              </div>
            </div>

            <!-- Warning Details -->
            <div v-if="validationResults.warningDetails.length > 0" class="space-y-2">
              <Label class="text-base font-medium text-yellow-600">Warnings</Label>
              <div class="max-h-32 overflow-auto space-y-1">
                <div 
                  v-for="warning in validationResults.warningDetails" 
                  :key="warning.row"
                  class="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded"
                >
                  <span class="font-medium">Row {{ warning.row }}:</span> {{ warning.message }}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Step 4: Import Progress -->
        <Card v-else-if="currentStep === 4">
          <CardHeader>
            <CardTitle>Step 4: Importing Items</CardTitle>
            <CardDescription>
              Please wait while we import your inventory items
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="text-center space-y-4">
              <div class="w-16 h-16 mx-auto">
                <div class="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
              </div>
              <div>
                <p class="font-medium">Importing items...</p>
                <p class="text-sm text-muted-foreground">
                  {{ importProgress.current }} of {{ importProgress.total }} processed
                </p>
              </div>
              <div class="w-full bg-muted rounded-full h-2">
                <div 
                  class="bg-primary h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${(importProgress.current / importProgress.total) * 100}%` }"
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Step 5: Import Results -->
        <Card v-else-if="currentStep === 5">
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <CheckCircle class="h-5 w-5 text-green-600" />
              <span>Import Complete</span>
            </CardTitle>
            <CardDescription>
              Your inventory items have been imported
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ importResults.imported }}</div>
                <div class="text-sm text-green-700">Items Imported</div>
              </div>
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ importResults.updated }}</div>
                <div class="text-sm text-blue-700">Items Updated</div>
              </div>
            </div>

            <div v-if="importResults.skipped > 0" class="text-center p-4 bg-yellow-50 rounded-lg">
              <div class="text-lg font-bold text-yellow-600">{{ importResults.skipped }}</div>
              <div class="text-sm text-yellow-700">Items Skipped (due to errors)</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="border-t p-6">
      <div class="flex justify-between">
        <Button 
          variant="outline" 
          @click="previousStep"
          :disabled="currentStep === 1 || importing"
        >
          Previous
        </Button>
        <div class="space-x-2">
          <Button variant="outline" @click="$emit('close')">
            {{ currentStep === 5 ? 'Close' : 'Cancel' }}
          </Button>
          <Button 
            v-if="currentStep < 4"
            @click="nextStep"
            :disabled="!canProceed"
          >
            {{ currentStep === 3 ? 'Start Import' : 'Next' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { 
  FileUp, FileCheck, X, Info, Download, CheckCircle
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

// Props
const props = defineProps({
  importType: {
    type: String,
    default: 'csv'
  },
  categories: {
    type: Array,
    default: () => []
  },
  units: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['import-complete', 'close'])

// State
const currentStep = ref(1)
const selectedFile = ref(null)
const fileInput = ref(null)
const importing = ref(false)
const fileColumns = ref([])
const previewData = ref([])

const importOptions = reactive({
  hasHeaders: true,
  updateExisting: false,
  skipErrors: true
})

const columnMapping = reactive({})

const validationResults = reactive({
  valid: 0,
  errors: 0,
  warnings: 0,
  errorDetails: [],
  warningDetails: []
})

const importProgress = reactive({
  current: 0,
  total: 0
})

const importResults = reactive({
  imported: 0,
  updated: 0,
  skipped: 0
})

const requiredFields = [
  { key: 'itemCode', label: 'Item Code', required: true },
  { key: 'name', label: 'Item Name', required: true },
  { key: 'categoryId', label: 'Category', required: false },
  { key: 'unitOfMeasureId', label: 'Unit of Measure', required: false },
  { key: 'standardCost', label: 'Standard Cost', required: false },
  { key: 'listPrice', label: 'List Price', required: false },
  { key: 'description', label: 'Description', required: false },
  { key: 'reorderPoint', label: 'Reorder Point', required: false },
  { key: 'reorderQuantity', label: 'Reorder Quantity', required: false }
]

// Computed
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return selectedFile.value !== null
    case 2:
      return columnMapping.itemCode && columnMapping.name
    case 3:
      return validationResults.errors === 0 || importOptions.skipErrors
    default:
      return true
  }
})

const mappedFields = computed(() => {
  return requiredFields.filter(field => columnMapping[field.key])
})

// Methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    selectedFile.value = file
    parseFile(file)
  }
}

const handleFileDrop = (event) => {
  event.preventDefault()
  const file = event.dataTransfer.files?.[0]
  if (file) {
    selectedFile.value = file
    parseFile(file)
  }
}

const clearFile = () => {
  selectedFile.value = null
  fileColumns.value = []
  previewData.value = []
  Object.keys(columnMapping).forEach(key => delete columnMapping[key])
}

const parseFile = async (file) => {
  // Simulate file parsing
  // In a real app, you'd use a library like Papa Parse for CSV or SheetJS for Excel
  
  // Mock columns and data
  const mockColumns = ['Item Code', 'Item Name', 'Description', 'Category', 'Unit Price', 'Stock']
  const mockData = [
    { 'Item Code': 'ITEM001', 'Item Name': 'Widget A', 'Description': 'Sample widget', 'Category': 'Electronics', 'Unit Price': '25.00', 'Stock': '100' },
    { 'Item Code': 'ITEM002', 'Item Name': 'Widget B', 'Description': 'Another widget', 'Category': 'Hardware', 'Unit Price': '35.00', 'Stock': '50' }
  ]

  fileColumns.value = mockColumns
  previewData.value = mockData

  // Auto-map columns
  columnMapping.itemCode = 'Item Code'
  columnMapping.name = 'Item Name'
  columnMapping.description = 'Description'
  columnMapping.standardCost = 'Unit Price'
}

const nextStep = async () => {
  if (currentStep.value === 2) {
    await validateData()
  } else if (currentStep.value === 3) {
    await startImport()
    return // Import will handle step progression
  }
  
  currentStep.value++
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const validateData = async () => {
  // Simulate validation
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  validationResults.valid = previewData.value.length - 1
  validationResults.errors = 1
  validationResults.warnings = 0
  validationResults.errorDetails = [
    { row: 3, message: 'Invalid category name' }
  ]
  validationResults.warningDetails = []
}

const startImport = async () => {
  currentStep.value = 4
  importing.value = true
  
  importProgress.total = previewData.value.length
  importProgress.current = 0

  // Simulate import progress
  for (let i = 0; i < importProgress.total; i++) {
    await new Promise(resolve => setTimeout(resolve, 500))
    importProgress.current = i + 1
  }

  // Set results
  importResults.imported = validationResults.valid
  importResults.updated = 0
  importResults.skipped = validationResults.errors

  importing.value = false
  currentStep.value = 5

  // Emit completion
  emit('import-complete', {
    success: true,
    importedCount: importResults.imported,
    updatedCount: importResults.updated,
    skippedCount: importResults.skipped
  })
}

const downloadTemplate = () => {
  // Create and download template file
  const headers = requiredFields.map(field => field.label).join(',')
  const sampleRow = 'SAMPLE001,Sample Item,Sample description,Electronics,25.00,100,PCS,10,50'
  const csvContent = `${headers}\n${sampleRow}`
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `inventory-items-template.${props.importType}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
