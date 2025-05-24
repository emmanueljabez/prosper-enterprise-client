<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent class="sm:max-w-[600px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Import Manufacturing Data</SheetTitle>
        <SheetDescription>
          Import BOMs or work orders from spreadsheets.
        </SheetDescription>
      </SheetHeader>

      <div class="py-6 space-y-6">
        <!-- Import Type Selection -->
        <div class="space-y-4">
          <Label>Import Type</Label>
          <RadioGroup v-model="importType" class="grid grid-cols-2 gap-4">
            <div>
              <RadioGroupItem value="bom" id="bom">
                <div class="flex items-center gap-2">
                  <LayersIcon class="h-4 w-4" />
                  <Label for="bom">Bill of Materials</Label>
                </div>
              </RadioGroupItem>
            </div>
            <div>
              <RadioGroupItem value="workOrder" id="workOrder">
                <div class="flex items-center gap-2">
                  <ClipboardIcon class="h-4 w-4" />
                  <Label for="workOrder">Work Orders</Label>
                </div>
              </RadioGroupItem>
            </div>
          </RadioGroup>
        </div>

        <!-- Template Download -->
        <div class="border rounded-md p-4 bg-muted/20">
          <h3 class="text-sm font-medium mb-2">Download Template</h3>
          <p class="text-sm text-muted-foreground mb-3">
            Download a template file to see the required format for importing data.
          </p>
          <Button variant="outline" size="sm" @click="downloadTemplate">
            <DownloadIcon class="h-4 w-4 mr-2" />
            Download {{ importType === 'bom' ? 'BOM' : 'Work Order' }} Template
          </Button>
        </div>

        <!-- File Upload -->
        <div class="space-y-4">
          <Label>Upload File</Label>
          <div 
            class="border-2 border-dashed rounded-md p-6 cursor-pointer hover:border-primary/50 transition-colors"
            :class="{ 'border-primary': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            @click="triggerFileInput"
          >
            <div class="flex flex-col items-center justify-center gap-2">
              <UploadCloudIcon class="h-10 w-10 text-muted-foreground" />
              <div class="text-sm text-center">
                <p class="font-medium">
                  Click to upload or drag and drop
                </p>
                <p class="text-muted-foreground">
                  XLSX or CSV (max. 5MB)
                </p>
              </div>
            </div>
          </div>
          <input 
            type="file" 
            ref="fileInput" 
            class="hidden" 
            accept=".csv,.xlsx,.xls" 
            @change="handleFileSelect" 
          />

          <!-- Selected File Info -->
          <div v-if="selectedFile" class="flex items-center justify-between p-2 border rounded-md">
            <div class="flex items-center gap-2">
              <FileSpreadsheetIcon class="h-5 w-5 text-primary" />
              <div>
                <div class="text-sm font-medium">{{ selectedFile.name }}</div>
                <div class="text-xs text-muted-foreground">{{ formatFileSize(selectedFile.size) }}</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" @click="clearFile">
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Preview Data (when file is selected) -->
        <div v-if="parsedData.length > 0" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium">Data Preview</h3>
            <Badge>{{ parsedData.length }} records</Badge>
          </div>

          <div class="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead v-for="(header, index) in tableHeaders" :key="index" class="whitespace-nowrap">
                    {{ header }}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(row, rowIndex) in previewData" :key="rowIndex">
                  <TableCell v-for="(header, colIndex) in tableHeaders" :key="colIndex" class="py-2">
                    {{ row[header] }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div v-if="parsedData.length > previewRowCount" class="text-center text-sm text-muted-foreground">
            Showing {{ previewRowCount }} of {{ parsedData.length }} records
          </div>

          <!-- Validation Issues -->
          <div v-if="validationIssues.length > 0" class="border rounded-md p-4 bg-destructive/10">
            <div class="flex items-center gap-2 mb-2">
              <AlertTriangleIcon class="h-5 w-5 text-destructive" />
              <h3 class="text-sm font-medium text-destructive">Validation Issues</h3>
            </div>
            <ul class="space-y-1 text-sm">
              <li v-for="(issue, index) in validationIssues" :key="index" class="flex items-start gap-2">
                <CircleXIcon class="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <span>{{ issue }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Import in Progress -->
        <div v-if="importing" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-sm font-medium">Importing Data</h3>
            <span class="text-sm">{{ processedCount }} of {{ parsedData.length }}</span>
          </div>
          <Progress :value="importProgress" class="w-full" />
        </div>

        <!-- Import Results -->
        <div v-if="importComplete" class="border rounded-md p-4" :class="hasImportErrors ? 'bg-destructive/10' : 'bg-success/10'">
          <div class="flex items-center gap-2 mb-2">
            <component :is="hasImportErrors ? AlertTriangleIcon : CheckCircleIcon" 
              class="h-5 w-5" 
              :class="hasImportErrors ? 'text-destructive' : 'text-success'" 
            />
            <h3 class="text-sm font-medium">Import Results</h3>
          </div>
          
          <div class="text-sm space-y-1">
            <p>{{ successCount }} records imported successfully</p>
            <p v-if="errorCount > 0">{{ errorCount }} records failed</p>
            
            <div v-if="errorCount > 0 && importErrors.length > 0" class="mt-2 pt-2 border-t">
              <Accordion type="single" collapsible>
                <AccordionItem value="errors">
                  <AccordionTrigger>View Errors</AccordionTrigger>
                  <AccordionContent>
                    <ul class="space-y-1 text-sm">
                      <li v-for="(error, index) in importErrors" :key="index" class="flex items-start gap-2">
                        <CircleXIcon class="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Row {{ error.row }}: {{ error.message }}</span>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <SheetFooter>
        <Button variant="outline" @click="$emit('update:open', false)" :disabled="importing">
          {{ importComplete ? 'Close' : 'Cancel' }}
        </Button>
        <Button 
          v-if="!importComplete"
          @click="startImport" 
          :disabled="importing || parsedData.length === 0 || validationIssues.length > 0"
        >
          <UploadIcon v-if="!importing" class="h-4 w-4 mr-2" />
          <Loader2Icon v-else class="h-4 w-4 mr-2 animate-spin" />
          {{ importing ? 'Importing...' : 'Import Data' }}
        </Button>
        <Button 
          v-else-if="hasImportErrors"
          variant="outline"
          @click="resetImport"
        >
          Try Again
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { 
  ClipboardIcon, 
  LayersIcon,
  UploadCloudIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  XIcon,
  AlertTriangleIcon,
  CircleXIcon,
  CheckCircleIcon,
  UploadIcon,
  Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:open', 'import-complete'])

// State
const importType = ref('bom')
const fileInput = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)
const parsedData = ref([])
const validationIssues = ref([])
const importing = ref(false)
const importComplete = ref(false)
const processedCount = ref(0)
const successCount = ref(0)
const errorCount = ref(0)
const importErrors = ref([])
const previewRowCount = 5

// Computed properties
const tableHeaders = computed(() => {
  if (parsedData.value.length === 0) return []
  return Object.keys(parsedData.value[0])
})

const previewData = computed(() => {
  return parsedData.value.slice(0, previewRowCount)
})

const importProgress = computed(() => {
  if (parsedData.value.length === 0) return 0
  return (processedCount.value / parsedData.value.length) * 100
})

const hasImportErrors = computed(() => {
  return errorCount.value > 0
})

// Reset when dialog is closed
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})

// Methods
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleFileDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = async (file) => {
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size exceeds 5MB limit')
    return
  }

  // Check file type
  const validTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
  if (!validTypes.includes(file.type) && 
      !(file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
    alert('Invalid file type. Please upload a CSV or Excel file.')
    return
  }

  selectedFile.value = file
  
  // Parse file (this would typically use a library like SheetJS/xlsx or PapaParse)
  // For this example, we'll simulate parsing with mock data
  await simulateFileParsing(file)
  
  // Validate the data
  validateData()
}

const simulateFileParsing = async (file) => {
  // In a real implementation, you would use a library to parse CSV/Excel
  // For now, we'll generate mock data based on the import type
  parsedData.value = []
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Generate mock data based on import type
  if (importType.value === 'bom') {
    parsedData.value = [
      { name: 'Assembly BOM 1', productId: 'PROD-001', version: '1.0', components: '5', status: 'draft' },
      { name: 'Circuit Board BOM', productId: 'PROD-002', version: '2.1', components: '12', status: 'active' },
      { name: 'Packaging BOM', productId: 'PROD-003', version: '1.2', components: '3', status: 'draft' },
      { name: 'Motor Assembly', productId: 'PROD-004', version: '1.0', components: '8', status: 'active' },
      { name: 'Display Unit', productId: 'PROD-005', version: '1.5', components: '6', status: 'draft' },
      { name: 'Control Panel', productId: 'PROD-006', version: '1.1', components: '9', status: 'active' }
    ]
  } else {
    parsedData.value = [
      { orderNumber: 'WO-001', bomId: 'BOM-001', quantity: '100', priority: 'medium', status: 'planned', dueDate: '2025-06-10' },
      { orderNumber: 'WO-002', bomId: 'BOM-002', quantity: '50', priority: 'high', status: 'planned', dueDate: '2025-06-15' },
      { orderNumber: 'WO-003', bomId: 'BOM-001', quantity: '200', priority: 'medium', status: 'planned', dueDate: '2025-06-20' },
      { orderNumber: 'WO-004', bomId: 'BOM-003', quantity: '75', priority: 'low', status: 'planned', dueDate: '2025-06-25' },
      { orderNumber: 'WO-005', bomId: 'BOM-002', quantity: '150', priority: 'urgent', status: 'planned', dueDate: '2025-06-05' },
      { orderNumber: 'WO-006', bomId: 'BOM-004', quantity: '25', priority: 'medium', status: 'planned', dueDate: '2025-06-30' }
    ]
  }
}

const validateData = () => {
  validationIssues.value = []
  
  // Perform basic validation based on import type
  if (importType.value === 'bom') {
    // Check for required fields in BOMs
    for (let i = 0; i < parsedData.value.length; i++) {
      const row = parsedData.value[i]
      if (!row.name) {
        validationIssues.value.push(`Row ${i + 1}: Missing BOM name`)
      }
      if (!row.productId) {
        validationIssues.value.push(`Row ${i + 1}: Missing product ID`)
      }
      if (!row.version) {
        validationIssues.value.push(`Row ${i + 1}: Missing version`)
      }
    }
  } else {
    // Check for required fields in work orders
    for (let i = 0; i < parsedData.value.length; i++) {
      const row = parsedData.value[i]
      if (!row.bomId) {
        validationIssues.value.push(`Row ${i + 1}: Missing BOM ID`)
      }
      if (!row.quantity || isNaN(row.quantity)) {
        validationIssues.value.push(`Row ${i + 1}: Invalid quantity`)
      }
      if (!row.dueDate) {
        validationIssues.value.push(`Row ${i + 1}: Missing due date`)
      }
    }
  }
  
  // Add a simulated validation issue for demonstration
  if (parsedData.value.length > 0 && Math.random() > 0.7) {
    validationIssues.value.push(`Row ${Math.floor(Math.random() * parsedData.value.length) + 1}: Invalid reference data`)
  }
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' bytes'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}

const downloadTemplate = () => {
  // In a real implementation, this would generate and download a template file
  // For now, we'll just show an alert
  alert(`Downloading ${importType.value === 'bom' ? 'BOM' : 'Work Order'} template`)
}

const startImport = async () => {
  importing.value = true
  processedCount.value = 0
  successCount.value = 0
  errorCount.value = 0
  importErrors.value = []
  
  // Simulate processing each record with a delay
  for (let i = 0; i < parsedData.value.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 200)) // Simulate processing time
    
    processedCount.value++
    
    // Randomly simulate success or error (90% success rate)
    if (Math.random() < 0.9) {
      successCount.value++
    } else {
      errorCount.value++
      importErrors.value.push({
        row: i + 1,
        message: `Failed to import record: ${JSON.stringify(parsedData.value[i])}`
      })
    }
  }
  
  importing.value = false
  importComplete.value = true
  
  // Emit import complete event with results
  emit('import-complete', {
    type: importType.value,
    total: parsedData.value.length,
    success: successCount.value,
    errors: errorCount.value,
    errorDetails: importErrors.value
  })
}

const resetImport = () => {
  importComplete.value = false
  processedCount.value = 0
  successCount.value = 0
  errorCount.value = 0
  importErrors.value = []
}

const resetForm = () => {
  importType.value = 'bom'
  selectedFile.value = null
  isDragging.value = false
  parsedData.value = []
  validationIssues.value = []
  importing.value = false
  importComplete.value = false
  processedCount.value = 0
  successCount.value = 0
  errorCount.value = 0
  importErrors.value = []
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const clearFile = () => {
  selectedFile.value = null
  parsedData.value = []
  validationIssues.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>