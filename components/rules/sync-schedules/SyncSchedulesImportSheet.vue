<template>
  <SheetContent class="sm:max-w-[600px] overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Import Sync Schedules</SheetTitle>
      <SheetDescription>
        Import sync schedules from {{ importType === 'csv' ? 'CSV' : 'Excel' }} file
      </SheetDescription>
    </SheetHeader>

    <div class="py-6 space-y-6">
      <!-- Progress Steps -->
      <div class="relative">
        <div class="flex justify-between items-center">
          <div v-for="(step, index) in steps" :key="step.id" class="flex flex-col items-center">
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm relative z-10"
              :class="[
                currentStep > index 
                  ? 'bg-primary text-primary-foreground' 
                  : currentStep === index 
                    ? 'bg-primary/80 text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
              ]"
            >
              {{ index + 1 }}
            </div>
            <div class="text-xs mt-1 text-center">{{ step.name }}</div>
          </div>
        </div>
        
        <div class="absolute top-4 left-0 right-0 h-[2px] bg-muted -z-0">
          <div 
            class="h-full bg-primary transition-all duration-300" 
            :style="{ width: `${(currentStep / (steps.length - 1)) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Step 1: Upload File -->
      <div v-if="currentStep === 0" class="space-y-4">
        <Card>
          <CardContent class="pt-6">
            <div 
              class="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer"
              :class="{ 'border-primary bg-primary/5': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
              @click="$refs.fileInput.click()"
            >
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                :accept="acceptFileTypes"
                @change="handleFileSelection"
              />
              
              <FileUp class="h-10 w-10 text-muted-foreground mb-2" />
              <p class="text-lg font-medium">
                Drag & drop your {{ importType.toUpperCase() }} file here or click to browse
              </p>
              <p class="text-sm text-muted-foreground mt-1">
                {{ importType === 'csv' 
                  ? 'Supported format: .csv' 
                  : 'Supported formats: .xlsx, .xls' }}
              </p>
            </div>
          </CardContent>
        </Card>

        <div v-if="selectedFile" class="bg-muted p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-background rounded-lg">
                <FileText class="h-6 w-6 text-primary" />
              </div>
              <div>
                <p class="font-medium">{{ selectedFile.name }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ formatFileSize(selectedFile.size) }}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" @click="resetFileSelection">
              <X class="h-4 w-4" />
              <span class="sr-only">Remove</span>
            </Button>
          </div>
        </div>

        <div v-if="uploadError" class="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md text-sm">
          {{ uploadError }}
        </div>
      </div>

      <!-- Step 2: Map Columns -->
      <div v-if="currentStep === 1" class="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Map Columns</CardTitle>
            <CardDescription>
              Match columns from your file to sync schedule fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="field in requiredFields" :key="field.key" class="grid grid-cols-2 gap-3 items-center">
                <div>
                  <Label :for="`map-${field.key}`" class="required">
                    {{ field.label }}
                  </Label>
                </div>
                <div>
                  <Select v-model="columnMapping[field.key]">
                    <SelectTrigger :id="`map-${field.key}`">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Skip --</SelectItem>
                      <SelectItem 
                        v-for="column in fileColumns" 
                        :key="column" 
                        :value="column"
                      >
                        {{ column }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Collapsible class="mt-6">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" class="flex items-center justify-between w-full p-0 h-8">
                    <span>Optional Fields</span>
                    <ChevronDown class="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div class="pt-3 space-y-4">
                    <div v-for="field in optionalFields" :key="field.key" class="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <Label :for="`map-${field.key}`">
                          {{ field.label }}
                        </Label>
                      </div>
                      <div>
                        <Select v-model="columnMapping[field.key]">
                          <SelectTrigger :id="`map-${field.key}`">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">-- Skip --</SelectItem>
                            <SelectItem 
                              v-for="column in fileColumns" 
                              :key="column" 
                              :value="column"
                            >
                              {{ column }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </CardContent>
        </Card>

        <div v-if="mappingError" class="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md text-sm">
          {{ mappingError }}
        </div>
      </div>

      <!-- Step 3: Preview & Validate -->
      <div v-if="currentStep === 2" class="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Preview Import</CardTitle>
            <CardDescription>
              Preview and validate the data before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="bg-muted p-3 rounded-lg">
                <div class="flex justify-between mb-2">
                  <p class="font-medium">Summary</p>
                  <Badge variant="outline">{{ parsedData.length }} schedules</Badge>
                </div>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span>Valid records:</span>
                    <span class="font-medium text-green-600">{{ validRecordsCount }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Records with warnings:</span>
                    <span class="font-medium text-yellow-600">{{ warningRecordsCount }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Invalid records:</span>
                    <span class="font-medium text-red-600">{{ errorRecordsCount }}</span>
                  </div>
                </div>
              </div>

              <div class="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead class="w-[80px]">Row</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow 
                      v-for="(item, index) in parsedData.slice(0, 5)" 
                      :key="index"
                      :class="{
                        'bg-green-50': !item._errors?.length && !item._warnings?.length,
                        'bg-yellow-50': !item._errors?.length && item._warnings?.length,
                        'bg-red-50': item._errors?.length
                      }"
                    >
                      <TableCell>{{ index + 1 }}</TableCell>
                      <TableCell class="max-w-[200px] truncate">
                        {{ item.name }}
                        <div v-if="item._errors?.name" class="text-xs text-destructive">
                          {{ item._errors.name }}
                        </div>
                      </TableCell>
                      <TableCell>{{ formatType(item.type) }}</TableCell>
                      <TableCell>{{ formatFrequency(item.schedule?.frequency) }}</TableCell>
                      <TableCell>
                        <Badge 
                          :variant="item._errors?.length 
                            ? 'destructive' 
                            : item._warnings?.length 
                              ? 'warning' 
                              : 'success'"
                          class="whitespace-nowrap"
                        >
                          {{ item._errors?.length 
                            ? 'Error' 
                            : item._warnings?.length 
                              ? 'Warning' 
                              : 'Valid' }}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow v-if="parsedData.length > 5">
                      <TableCell colspan="5" class="text-center text-muted-foreground">
                        + {{ parsedData.length - 5 }} more records
                      </TableCell>
                    </TableRow>
                    <TableRow v-if="parsedData.length === 0">
                      <TableCell colspan="5" class="text-center py-6 text-muted-foreground">
                        No valid data found to preview
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div v-if="errorRecordsCount > 0" class="space-y-2">
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    id="skipInvalid" 
                    v-model:checked="skipInvalidRecords"
                  />
                  <Label for="skipInvalid">Skip invalid records during import</Label>
                </div>
                <p class="text-xs text-muted-foreground">
                  If unchecked, the import will fail if any record is invalid
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Step 4: Import Progress -->
      <div v-if="currentStep === 3" class="space-y-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex flex-col items-center justify-center py-6">
              <div v-if="importStatus === 'in_progress'" class="text-center">
                <Loader2 class="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                <h3 class="text-lg font-medium">Importing schedules...</h3>
                <p class="text-muted-foreground mt-1">
                  {{ processedCount }} of {{ totalCount }} processed
                </p>
                <div class="w-full max-w-md mx-auto mt-4 bg-secondary rounded-full h-2.5 overflow-hidden">
                  <div 
                    class="bg-primary h-2.5 transition-all duration-300"
                    :style="{ width: `${(processedCount / totalCount) * 100}%` }"
                  ></div>
                </div>
              </div>

              <div v-if="importStatus === 'success'" class="text-center">
                <CheckCircle class="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 class="text-lg font-medium">Import Complete!</h3>
                <p class="text-muted-foreground mt-1">
                  Successfully imported {{ processedCount }} sync schedules
                </p>
                <Button @click="finishImport" class="mt-6">
                  View Sync Schedules
                </Button>
              </div>

              <div v-if="importStatus === 'error'" class="text-center">
                <AlertCircle class="h-16 w-16 text-destructive mx-auto mb-4" />
                <h3 class="text-lg font-medium">Import Failed</h3>
                <p class="text-muted-foreground mt-1">
                  {{ importError }}
                </p>
                <div class="mt-6 space-x-2">
                  <Button variant="outline" @click="goToStep(0)">
                    Try Again
                  </Button>
                  <Button variant="default" @click="$emit('close')">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <SheetFooter>
      <div class="w-full flex justify-between">
        <Button 
          v-if="currentStep > 0 && importStatus !== 'success'" 
          variant="outline" 
          @click="goToPreviousStep"
          :disabled="currentStep === 3 && importStatus === 'in_progress'"
        >
          Back
        </Button>
        <div v-else></div>
        
        <div>
          <Button 
            v-if="currentStep < 3 && currentStep !== 2"
            variant="default" 
            @click="goToNextStep" 
            :disabled="!canProceedToNextStep"
          >
            Continue
          </Button>
          
          <Button 
            v-if="currentStep === 2"
            variant="default" 
            @click="startImport" 
            :disabled="!canImport"
          >
            Import
          </Button>
          
          <Button 
            v-if="importStatus === 'success'"
            variant="default" 
            @click="finishImport"
          >
            Finish
          </Button>
        </div>
      </div>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  FileUp, X, FileText, ChevronDown, 
  Loader2, CheckCircle, AlertCircle
} from 'lucide-vue-next'
import {
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from '@/components/ui/collapsible'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'

const props = defineProps({
  importType: {
    type: String,
    required: true,
    validator: (value) => ['csv', 'excel'].includes(value)
  }
})

const emit = defineEmits(['import-complete', 'close'])

// State for file upload
const isDragging = ref(false)
const selectedFile = ref(null)
const uploadError = ref('')
const fileColumns = ref([])
const fileData = ref([])

// State for column mapping
const columnMapping = ref({})
const mappingError = ref('')

// State for data preview and validation
const parsedData = ref([])
const skipInvalidRecords = ref(true)

// State for import process
const importStatus = ref('idle') // 'idle', 'in_progress', 'success', 'error'
const processedCount = ref(0)
const totalCount = ref(0)
const importError = ref('')

// Wizard steps
const currentStep = ref(0)
const steps = [
  { id: 'upload', name: 'Upload' },
  { id: 'map', name: 'Map' },
  { id: 'preview', name: 'Preview' },
  { id: 'import', name: 'Import' }
]

// Field definitions for mapping
const requiredFields = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Sync Type' },
  { key: 'active', label: 'Active Status' },
  { key: 'scope', label: 'Scope' }
]

const optionalFields = [
  { key: 'description', label: 'Description' },
  { key: 'frequency', label: 'Schedule Frequency' },
  { key: 'priority', label: 'Priority' },
  { key: 'batchSize', label: 'Batch Size' },
  { key: 'maxRuntime', label: 'Max Runtime' },
  { key: 'retryCount', label: 'Retry Count' },
  { key: 'tags', label: 'Tags' }
]

// Computed properties
const acceptFileTypes = computed(() => {
  return props.importType === 'csv' 
    ? '.csv' 
    : '.xlsx, .xls'
})

const validRecordsCount = computed(() => {
  return parsedData.value.filter(item => 
    !item._errors?.length && !item._warnings?.length
  ).length
})

const warningRecordsCount = computed(() => {
  return parsedData.value.filter(item => 
    !item._errors?.length && item._warnings?.length
  ).length
})

const errorRecordsCount = computed(() => {
  return parsedData.value.filter(item => 
    item._errors?.length
  ).length
})

const canProceedToNextStep = computed(() => {
  if (currentStep.value === 0) {
    return !!selectedFile.value && !uploadError.value
  }
  
  if (currentStep.value === 1) {
    const requiredMapped = requiredFields.every(field => !!columnMapping.value[field.key])
    return requiredMapped && !mappingError.value
  }
  
  return true
})

const canImport = computed(() => {
  if (errorRecordsCount.value > 0 && !skipInvalidRecords.value) {
    return false
  }
  
  return parsedData.value.length > 0 && 
    (validRecordsCount.value > 0 || warningRecordsCount.value > 0)
})

// Methods
function formatFileSize(bytes) {
  if (bytes < 1024) {
    return bytes + ' bytes'
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB'
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
}

function formatType(type) {
  switch (type) {
    case 'realtime': return 'Real-time'
    case 'batch_high': return 'High Frequency'
    case 'batch_medium': return 'Medium Frequency'
    case 'batch_low': return 'Low Frequency'
    case 'manual': return 'Manual'
    default: return type || 'Unknown'
  }
}

function formatFrequency(frequency) {
  switch (frequency) {
    case 'hourly': return 'Hourly'
    case 'daily': return 'Daily'
    case 'weekly': return 'Weekly'
    case 'monthly': return 'Monthly'
    case 'custom': return 'Custom'
    default: return frequency || 'Unknown'
  }
}

function resetFileSelection() {
  selectedFile.value = null
  uploadError.value = ''
  fileColumns.value = []
  fileData.value = []
}

function handleFileDrop(event) {
  isDragging.value = false
  const files = event.dataTransfer.files
  if (files.length) {
    validateAndProcessFile(files[0])
  }
}

function handleFileSelection(event) {
  const files = event.target.files
  if (files.length) {
    validateAndProcessFile(files[0])
  }
}

function validateAndProcessFile(file) {
  uploadError.value = ''
  
  // Check file type
  if (props.importType === 'csv' && !file.name.toLowerCase().endsWith('.csv')) {
    uploadError.value = 'Please upload a valid CSV file'
    return
  }
  
  if (props.importType === 'excel' && 
      !file.name.toLowerCase().endsWith('.xlsx') && 
      !file.name.toLowerCase().endsWith('.xls')) {
    uploadError.value = 'Please upload a valid Excel file'
    return
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'File size exceeds the 5MB limit'
    return
  }
  
  selectedFile.value = file
  
  // Parse file to extract columns
  // In a real app, this would use libraries like Papa Parse for CSV or SheetJS for Excel
  // For simplicity, we'll simulate the parsing with some mock data
  setTimeout(() => {
    // Mock columns from file
    fileColumns.value = [
      'Schedule Name', 'Type', 'Description', 'Active', 
      'Frequency', 'Scope', 'Priority', 'Batch Size',
      'Tags', 'Runtime Limit', 'Retry Count'
    ]
    
    // Mock file data (rows from file)
    fileData.value = Array(20).fill(0).map((_, i) => ({
      'Schedule Name': `Schedule ${i + 1}`,
      'Type': ['realtime', 'batch_high', 'batch_medium', 'batch_low', 'manual'][i % 5],
      'Description': `Description for schedule ${i + 1}`,
      'Active': i % 3 === 0 ? 'No' : 'Yes',
      'Frequency': ['hourly', 'daily', 'weekly', 'monthly', 'custom'][i % 5],
      'Scope': ['global', 'category', 'product', 'item'][i % 4],
      'Priority': Math.floor(Math.random() * 100) + 1,
      'Batch Size': (i + 1) * 50,
      'Tags': `tag1,tag2,tag${i + 1}`,
      'Runtime Limit': (i + 1) * 60,
      'Retry Count': i % 5
    }))
    
    // Initialize column mapping with best guesses
    columnMapping.value = {
      name: 'Schedule Name',
      type: 'Type',
      description: 'Description',
      active: 'Active',
      frequency: 'Frequency',
      scope: 'Scope',
      priority: 'Priority',
      batchSize: 'Batch Size',
      tags: 'Tags',
      maxRuntime: 'Runtime Limit',
      retryCount: 'Retry Count'
    }
  }, 500)
}

function goToNextStep() {
  if (currentStep.value === 0) {
    // Parse file data
    parseFileData()
  } else if (currentStep.value === 1) {
    // Validate mapped data
    validateMappedData()
  }
  
  if (canProceedToNextStep.value) {
    currentStep.value = Math.min(currentStep.value + 1, steps.length - 1)
  }
}

function goToPreviousStep() {
  currentStep.value = Math.max(currentStep.value - 1, 0)
}

function goToStep(step) {
  currentStep.value = step
}

function parseFileData() {
  // In a real app, this would transform the raw file data into structured data
  // based on the column mapping
  parsedData.value = fileData.value.map((row, index) => {
    const item = {}
    
    // Basic fields
    item.name = row[columnMapping.value.name] || ''
    item.type = row[columnMapping.value.type] || ''
    item.description = row[columnMapping.value.description] || ''
    item.active = row[columnMapping.value.active] === 'Yes'
    item.scope = row[columnMapping.value.scope] || 'global'
    item.priority = parseInt(row[columnMapping.value.priority]) || 50
    item.batchSize = parseInt(row[columnMapping.value.batchSize]) || 100
    item.maxRuntime = parseInt(row[columnMapping.value.maxRuntime]) || 300
    item.retryCount = parseInt(row[columnMapping.value.retryCount]) || 3
    
    // Tags
    if (row[columnMapping.value.tags]) {
      item.tags = row[columnMapping.value.tags].split(',').map(tag => tag.trim())
    } else {
      item.tags = []
    }
    
    // Schedule
    item.schedule = {
      frequency: row[columnMapping.value.frequency] || 'daily'
    }
    
    // Add validation errors and warnings
    item._errors = {}
    item._warnings = {}
    
    // Validate
    if (!item.name) {
      item._errors.name = 'Name is required'
    }
    
    if (!['realtime', 'batch_high', 'batch_medium', 'batch_low', 'manual'].includes(item.type)) {
      item._errors.type = 'Invalid sync type'
    }
    
    if (!['global', 'category', 'product', 'item'].includes(item.scope)) {
      item._errors.scope = 'Invalid scope'
    }
    
    if (item.type === 'realtime') {
      item._warnings.performance = 'Real-time sync may impact system performance'
    }
    
    return item
  })
}

function validateMappedData() {
  // Check if required fields are mapped
  const missingFields = requiredFields
    .filter(field => !columnMapping.value[field.key])
    .map(field => field.label)
  
  if (missingFields.length > 0) {
    mappingError.value = `Required fields not mapped: ${missingFields.join(', ')}`
    return false
  }
  
  mappingError.value = ''
  return true
}

function startImport() {
  importStatus.value = 'in_progress'
  processedCount.value = 0
  
  // Filter out records based on skip setting
  const recordsToImport = skipInvalidRecords.value
    ? parsedData.value.filter(item => !item._errors?.length)
    : parsedData.value
  
  totalCount.value = recordsToImport.length
  
  // Simulate import process
  const importInterval = setInterval(() => {
    processedCount.value += 1
    
    if (processedCount.value >= totalCount.value) {
      clearInterval(importInterval)
      
      // Simulate success (or random failure for demo purposes)
      if (Math.random() > 0.9) { // 10% chance of failure for demo
        importStatus.value = 'error'
        importError.value = 'Server error occurred during import'
      } else {
        importStatus.value = 'success'
      }
    }
  }, 200)
  
  currentStep.value = 3
}

function finishImport() {
  emit('import-complete', {
    success: importStatus.value === 'success',
    count: processedCount.value,
    error: importError.value
  })
}

// Reset when import type changes
watch(() => props.importType, () => {
  resetFileSelection()
  currentStep.value = 0
  importStatus.value = 'idle'
})
</script>

<style scoped>
.required::after {
  content: " *";
  color: rgb(var(--destructive));
}
</style>