<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 overflow-y-auto px-6 pt-4 pb-4 space-y-6 min-h-0">
      <div class="space-y-4 pb-4">
        <h3 class="text-lg font-semibold">Import Units of Measure</h3>
        
        <!-- Import Method Selection -->
        <div class="space-y-4">
          <h3 class="text-base font-medium">Import Method</h3>
          
          <RadioGroup v-model="importMethod" class="grid grid-cols-1 gap-3">
            <div v-for="method in importMethods" :key="method.value">
              <Label 
                :for="`method-${method.value}`" 
                class="flex items-start space-x-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <RadioGroupItem 
                  :value="method.value" 
                  :id="`method-${method.value}`" 
                  class="mt-1" 
                />
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <component :is="method.icon" class="h-5 w-5" />
                    <span class="font-medium">{{ method.label }}</span>
                  </div>
                  <p class="text-sm text-muted-foreground">{{ method.description }}</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <!-- File Upload -->
        <div v-if="importMethod" class="space-y-4">
          <h3 class="text-base font-medium">Upload File</h3>
          
          <div class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div class="text-center">
              <UploadIcon class="mx-auto h-12 w-12 text-muted-foreground" />
              <div class="mt-4">
                <Label for="file-upload" class="cursor-pointer">
                  <span class="text-primary hover:text-primary/80">Upload a file</span>
                  <span class="text-muted-foreground"> or drag and drop</span>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  class="sr-only"
                  :accept="getAcceptedFileTypes()"
                  @change="handleFileUpload"
                />
              </div>
              <p class="text-xs text-muted-foreground mt-2">
                {{ getFileTypeDescription() }}
              </p>
            </div>
          </div>

          <div v-if="uploadedFile" class="flex items-center space-x-3 p-3 border rounded-md bg-muted/30">
            <FileTextIcon class="h-5 w-5 text-muted-foreground" />
            <div class="flex-1">
              <p class="text-sm font-medium">{{ uploadedFile.name }}</p>
              <p class="text-xs text-muted-foreground">{{ formatFileSize(uploadedFile.size) }}</p>
            </div>
            <Button variant="ghost" size="sm" @click="removeFile">
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Template Download -->
        <div v-if="importMethod === 'csv' || importMethod === 'excel'" class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">NEED A TEMPLATE?</Label>
          <div class="flex space-x-2">
            <Button variant="outline" size="sm" @click="downloadTemplate('csv')">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
            <Button variant="outline" size="sm" @click="downloadTemplate('excel')">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Download Excel Template
            </Button>
          </div>
        </div>

        <!-- Import Options -->
        <div v-if="uploadedFile" class="space-y-4">
          <h3 class="text-base font-medium">Import Options</h3>
          
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Checkbox id="skipDuplicates" v-model="importOptions.skipDuplicates" />
              <Label for="skipDuplicates" class="text-sm">
                Skip duplicate units (based on symbol)
              </Label>
            </div>
            
            <div class="flex items-center space-x-2">
              <Checkbox id="updateExisting" v-model="importOptions.updateExisting" />
              <Label for="updateExisting" class="text-sm">
                Update existing units with new data
              </Label>
            </div>
            
            <div class="flex items-center space-x-2">
              <Checkbox id="validateConversions" v-model="importOptions.validateConversions" />
              <Label for="validateConversions" class="text-sm">
                Validate conversion factors
              </Label>
            </div>
            
            <div class="flex items-center space-x-2">
              <Checkbox id="createFamilies" v-model="importOptions.createFamilies" />
              <Label for="createFamilies" class="text-sm">
                Auto-create families from category groupings
              </Label>
            </div>
          </div>
        </div>

        <!-- File Preview -->
        <div v-if="previewData.length > 0" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-medium">Preview ({{ previewData.length }} units)</h3>
            <Button variant="outline" size="sm" @click="refreshPreview">
              <RefreshCwIcon class="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div class="border rounded-md max-h-64 overflow-auto">
            <table class="w-full text-sm">
              <thead class="border-b bg-muted/30">
                <tr>
                  <th class="text-left p-2">Name</th>
                  <th class="text-left p-2">Symbol</th>
                  <th class="text-left p-2">Category</th>
                  <th class="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(row, index) in previewData.slice(0, 10)" 
                  :key="index"
                  class="border-b"
                  :class="{ 'bg-destructive/10': row.hasError }"
                >
                  <td class="p-2">
                    <div class="flex items-center space-x-2">
                      <span>{{ row.name }}</span>
                      <AlertTriangleIcon v-if="row.hasError" class="h-4 w-4 text-destructive" />
                    </div>
                  </td>
                  <td class="p-2 font-mono">{{ row.symbol }}</td>
                  <td class="p-2">{{ row.category }}</td>
                  <td class="p-2">
                    <Badge :variant="row.duplicate ? 'destructive' : 'default'" class="text-xs">
                      {{ row.duplicate ? 'Duplicate' : 'New' }}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-if="previewData.length > 10" class="p-2 text-center text-xs text-muted-foreground border-t">
              ... and {{ previewData.length - 10 }} more rows
            </div>
          </div>
        </div>

        <!-- Validation Results -->
        <div v-if="validationResults" class="space-y-4">
          <h3 class="text-base font-medium">Validation Results</h3>
          
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center p-3 border rounded-md">
              <div class="text-2xl font-bold text-green-600">{{ validationResults.valid }}</div>
              <div class="text-xs text-muted-foreground">Valid</div>
            </div>
            <div class="text-center p-3 border rounded-md">
              <div class="text-2xl font-bold text-amber-600">{{ validationResults.warnings }}</div>
              <div class="text-xs text-muted-foreground">Warnings</div>
            </div>
            <div class="text-center p-3 border rounded-md">
              <div class="text-2xl font-bold text-destructive">{{ validationResults.errors }}</div>
              <div class="text-xs text-muted-foreground">Errors</div>
            </div>
          </div>

          <div v-if="validationResults.issues && validationResults.issues.length > 0" class="space-y-2">
            <Label class="text-sm font-medium text-muted-foreground">ISSUES FOUND</Label>
            <div class="max-h-32 overflow-y-auto space-y-1">
              <div 
                v-for="issue in validationResults.issues" 
                :key="issue.id"
                class="text-sm p-2 rounded border"
                :class="{
                  'bg-destructive/10 border-destructive/20': issue.type === 'error',
                  'bg-amber-50 border-amber-200': issue.type === 'warning'
                }"
              >
                <span class="font-medium">Row {{ issue.row }}:</span> {{ issue.message }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t px-6 py-4 flex justify-end space-x-2 flex-shrink-0 bg-background/95 backdrop-blur-sm sticky bottom-0 z-10">
      <Button variant="outline" @click="$emit('update:open', false)" :disabled="isImporting">
        Cancel
      </Button>
      <Button 
        @click="startImport"
        :disabled="!canImport || isImporting"
      >
        <Loader2Icon v-if="isImporting" class="h-4 w-4 mr-2 animate-spin" />
        Import {{ previewData.length }} Unit(s)
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  UploadIcon, FileTextIcon, XIcon, DownloadIcon, RefreshCwIcon,
  AlertTriangleIcon, Loader2Icon, FileSpreadsheetIcon, DatabaseIcon 
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:open', 'imported'])

const { toast } = useToast()

// Form state
const importMethod = ref('')
const uploadedFile = ref(null)
const previewData = ref([])
const validationResults = ref(null)
const isImporting = ref(false)

const importOptions = ref({
  skipDuplicates: true,
  updateExisting: false,
  validateConversions: true,
  createFamilies: false
})

// Static data
const importMethods = [
  {
    value: 'csv',
    label: 'CSV File',
    description: 'Import from comma-separated values file',
    icon: FileTextIcon
  },
  {
    value: 'excel',
    label: 'Excel File',
    description: 'Import from Excel spreadsheet (.xlsx, .xls)',
    icon: FileSpreadsheetIcon
  },
  {
    value: 'template',
    label: 'System Template',
    description: 'Import from pre-configured system template',
    icon: DatabaseIcon
  }
]

// Computed properties
const canImport = computed(() => {
  return uploadedFile.value && 
         previewData.value.length > 0 && 
         (!validationResults.value || validationResults.value.errors === 0)
})

// Methods
function getAcceptedFileTypes() {
  switch (importMethod.value) {
    case 'csv':
      return '.csv,.txt'
    case 'excel':
      return '.xlsx,.xls'
    case 'template':
      return '.json,.uom'
    default:
      return ''
  }
}

function getFileTypeDescription() {
  switch (importMethod.value) {
    case 'csv':
      return 'CSV or TXT files up to 10MB'
    case 'excel':
      return 'Excel files (.xlsx, .xls) up to 10MB'
    case 'template':
      return 'JSON or UOM template files up to 5MB'
    default:
      return ''
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    uploadedFile.value = file
    processFile(file)
  }
}

function removeFile() {
  uploadedFile.value = null
  previewData.value = []
  validationResults.value = null
}

async function processFile(file) {
  try {
    // Simulate file processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock preview data
    previewData.value = [
      { name: 'Kilogram', symbol: 'kg', category: 'weight', duplicate: false, hasError: false },
      { name: 'Gram', symbol: 'g', category: 'weight', duplicate: false, hasError: false },
      { name: 'Meter', symbol: 'm', category: 'length', duplicate: false, hasError: false },
      { name: 'Centimeter', symbol: 'cm', category: 'length', duplicate: false, hasError: false },
      { name: 'Invalid Unit', symbol: '', category: 'unknown', duplicate: false, hasError: true }
    ]
    
    // Mock validation results
    validationResults.value = {
      valid: 4,
      warnings: 0,
      errors: 1,
      issues: [
        { id: '1', row: 5, type: 'error', message: 'Symbol is required' }
      ]
    }
    
    toast({
      title: "File Processed",
      description: `Found ${previewData.value.length} units for import`,
    })
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to process file",
      variant: "destructive",
    })
  }
}

function refreshPreview() {
  if (uploadedFile.value) {
    processFile(uploadedFile.value)
  }
}

function downloadTemplate(type) {
  // Simulate template download
  const templateData = type === 'csv' 
    ? 'name,symbol,category,description,baseUnit,conversionFactor\nKilogram,kg,weight,Base weight unit,true,1\nGram,g,weight,Metric weight unit,false,0.001'
    : { sample: 'excel template data' }
    
  const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `uom-template.${type === 'csv' ? 'csv' : 'json'}`
  a.click()
  URL.revokeObjectURL(url)
  
  toast({
    title: "Template Downloaded",
    description: `${type.toUpperCase()} template has been downloaded`,
  })
}

async function startImport() {
  if (!canImport.value) return
  
  try {
    isImporting.value = true
    
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const importedCount = previewData.value.filter(row => !row.hasError).length
    
    toast({
      title: "Import Complete",
      description: `Successfully imported ${importedCount} units of measure`,
    })
    
    emit('imported', {
      count: importedCount,
      method: importMethod.value,
      options: importOptions.value
    })
    
    emit('update:open', false)
    resetForm()
  } catch (error) {
    toast({
      title: "Import Failed",
      description: "Failed to import units of measure",
      variant: "destructive",
    })
  } finally {
    isImporting.value = false
  }
}

function resetForm() {
  importMethod.value = ''
  uploadedFile.value = null
  previewData.value = []
  validationResults.value = null
  importOptions.value = {
    skipDuplicates: true,
    updateExisting: false,
    validateConversions: true,
    createFamilies: false
  }
}
</script>
