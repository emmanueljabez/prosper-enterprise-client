<template>
  <div class="flex flex-col h-full">
    <!-- Import Steps -->
    <div class="px-6 py-4 border-b">
      <div class="flex items-center space-x-4">
        <div 
          v-for="(step, index) in steps" 
          :key="step.id"
          class="flex items-center"
        >
          <div 
            class="flex items-center justify-center w-8 h-8 rounded-full border-2"
            :class="{
              'bg-primary text-primary-foreground border-primary': currentStep > index,
              'border-primary text-primary': currentStep === index,
              'border-muted-foreground text-muted-foreground': currentStep < index
            }"
          >
            <CheckIcon v-if="currentStep > index" class="h-4 w-4" />
            <span v-else class="text-sm font-medium">{{ index + 1 }}</span>
          </div>
          <span 
            class="ml-2 text-sm font-medium"
            :class="{
              'text-primary': currentStep >= index,
              'text-muted-foreground': currentStep < index
            }"
          >
            {{ step.title }}
          </span>
          <ChevronRightIcon 
            v-if="index < steps.length - 1" 
            class="h-4 w-4 mx-4 text-muted-foreground" 
          />
        </div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="flex-1 p-6 overflow-y-auto">
      <!-- Step 1: Choose Import Type -->
      <div v-if="currentStep === 0" class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-4">Choose Import Method</h3>
          <div class="grid grid-cols-1 gap-4">
            <div 
              v-for="type in importTypes" 
              :key="type.id"
              class="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
              :class="{ 'border-primary bg-primary/5': selectedImportType === type.id }"
              @click="selectedImportType = type.id"
            >
              <div class="flex items-center space-x-3">
                <component :is="type.icon" class="h-8 w-8 text-primary" />
                <div>
                  <div class="font-medium">{{ type.title }}</div>
                  <div class="text-sm text-muted-foreground">{{ type.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Template Download -->
        <div class="bg-muted/50 rounded-lg p-4">
          <h4 class="font-medium mb-2">Need a template?</h4>
          <p class="text-sm text-muted-foreground mb-3">
            Download our template file to ensure your data is formatted correctly.
          </p>
          <Button variant="outline" size="sm" @click="downloadTemplate">
            <DownloadIcon class="h-4 w-4 mr-2" />
            Download {{ selectedImportType.toUpperCase() }} Template
          </Button>
        </div>
      </div>

      <!-- Step 2: Upload File -->
      <div v-if="currentStep === 1" class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-4">Upload File</h3>
          
          <!-- File Upload Area -->
          <div 
            class="border-2 border-dashed rounded-lg p-8 text-center"
            :class="{
              'border-primary bg-primary/5': isDragActive,
              'border-muted-foreground': !isDragActive
            }"
            @drop="handleDrop"
            @dragover.prevent="isDragActive = true"
            @dragleave="isDragActive = false"
          >
            <div v-if="!selectedFile">
              <FileUpIcon class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div class="text-lg font-medium mb-2">Drop your file here</div>
              <div class="text-sm text-muted-foreground mb-4">
                or click to browse files
              </div>
              <Button variant="outline" @click="$refs.fileInput.click()">
                Choose File
              </Button>
              <input
                ref="fileInput"
                type="file"
                :accept="acceptedFileTypes"
                @change="handleFileSelect"
                class="hidden"
              />
            </div>
            <div v-else class="space-y-4">
              <div class="flex items-center justify-center space-x-3">
                <FileIcon class="h-8 w-8 text-primary" />
                <div>
                  <div class="font-medium">{{ selectedFile.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ formatFileSize(selectedFile.size) }}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" @click="clearFile">
                Choose Different File
              </Button>
            </div>
          </div>

          <!-- Upload Progress -->
          <div v-if="uploadProgress > 0" class="mt-4">
            <div class="flex items-center justify-between text-sm mb-1">
              <span>Uploading...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-primary h-2 rounded-full transition-all duration-300"
                :style="{ width: `${uploadProgress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Review and Import -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-4">Review Import Data</h3>
          
          <div v-if="parseError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div class="flex items-center space-x-2 text-red-800 mb-2">
              <AlertCircleIcon class="h-4 w-4" />
              <span class="font-medium">Parse Error</span>
            </div>
            <p class="text-sm text-red-700">{{ parseError }}</p>
          </div>

          <div v-else-if="previewData.length > 0">
            <!-- Import Summary -->
            <div class="grid grid-cols-3 gap-4 mb-6">
              <Card class="p-4 text-center">
                <div class="text-2xl font-bold text-green-600">{{ validRows }}</div>
                <div class="text-sm text-muted-foreground">Valid Categories</div>
              </Card>
              <Card class="p-4 text-center">
                <div class="text-2xl font-bold text-yellow-600">{{ warningRows }}</div>
                <div class="text-sm text-muted-foreground">With Warnings</div>
              </Card>
              <Card class="p-4 text-center">
                <div class="text-2xl font-bold text-red-600">{{ errorRows }}</div>
                <div class="text-sm text-muted-foreground">With Errors</div>
              </Card>
            </div>

            <!-- Data Preview -->
            <div class="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-12">Status</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(row, index) in previewData.slice(0, 10)" :key="index">
                    <TableCell>
                      <CheckCircleIcon v-if="row.status === 'valid'" class="h-4 w-4 text-green-600" />
                      <AlertTriangleIcon v-else-if="row.status === 'warning'" class="h-4 w-4 text-yellow-600" />
                      <XCircleIcon v-else class="h-4 w-4 text-red-600" />
                    </TableCell>
                    <TableCell class="font-mono text-sm">{{ row.code }}</TableCell>
                    <TableCell>{{ row.name }}</TableCell>
                    <TableCell>{{ row.parentCode || '-' }}</TableCell>
                    <TableCell class="max-w-xs truncate">{{ row.description || '-' }}</TableCell>
                    <TableCell>
                      <div v-if="row.issues.length > 0" class="space-y-1">
                        <div 
                          v-for="issue in row.issues" 
                          :key="issue"
                          class="text-xs p-1 rounded"
                          :class="{
                            'bg-red-100 text-red-700': row.status === 'error',
                            'bg-yellow-100 text-yellow-700': row.status === 'warning'
                          }"
                        >
                          {{ issue }}
                        </div>
                      </div>
                      <span v-else class="text-green-600 text-sm">✓ Valid</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div v-if="previewData.length > 10" class="p-3 text-center text-sm text-muted-foreground border-t">
                ... and {{ previewData.length - 10 }} more rows
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="px-6 py-4 border-t flex items-center justify-between">
      <Button variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <div class="flex items-center space-x-2">
        <Button 
          v-if="currentStep > 0"
          variant="outline" 
          @click="previousStep"
        >
          <ChevronLeftIcon class="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button 
          v-if="currentStep < steps.length - 1"
          @click="nextStep"
          :disabled="!canProceed"
        >
          Next
          <ChevronRightIcon class="h-4 w-4 ml-2" />
        </Button>
        <Button 
          v-else
          @click="startImport"
          :disabled="!canImport || isImporting"
        >
          <Loader2Icon v-if="isImporting" class="h-4 w-4 mr-2 animate-spin" />
          <UploadIcon v-else class="h-4 w-4 mr-2" />
          Import {{ validRows }} Categories
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  CheckIcon, ChevronRightIcon, ChevronLeftIcon, DownloadIcon, FileUpIcon,
  FileIcon, AlertCircleIcon, CheckCircleIcon, AlertTriangleIcon, XCircleIcon,
  Loader2Icon, UploadIcon, FileSpreadsheet, Table2, FileTextIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Props
const props = defineProps({
  importType: {
    type: String,
    default: 'csv'
  }
})

// Emits
const emit = defineEmits(['import-complete', 'close'])

// State
const currentStep = ref(0)
const selectedImportType = ref(props.importType)
const selectedFile = ref(null)
const isDragActive = ref(false)
const uploadProgress = ref(0)
const parseError = ref('')
const previewData = ref([])
const isImporting = ref(false)

const steps = [
  { id: 'type', title: 'Import Type' },
  { id: 'upload', title: 'Upload File' },
  { id: 'review', title: 'Review & Import' }
]

const importTypes = [
  {
    id: 'csv',
    title: 'CSV File',
    description: 'Comma-separated values file',
    icon: FileSpreadsheet
  },
  {
    id: 'excel',
    title: 'Excel File',
    description: 'Microsoft Excel spreadsheet',
    icon: Table2
  },
  {
    id: 'json',
    title: 'JSON File',
    description: 'JavaScript Object Notation',
    icon: FileTextIcon
  }
]

// Computed
const acceptedFileTypes = computed(() => {
  const types = {
    csv: '.csv',
    excel: '.xlsx,.xls',
    json: '.json'
  }
  return types[selectedImportType.value] || '.csv'
})

const validRows = computed(() => {
  return previewData.value.filter(row => row.status === 'valid').length
})

const warningRows = computed(() => {
  return previewData.value.filter(row => row.status === 'warning').length
})

const errorRows = computed(() => {
  return previewData.value.filter(row => row.status === 'error').length
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return selectedImportType.value
    case 1:
      return selectedFile.value
    case 2:
      return validRows.value > 0
    default:
      return false
  }
})

const canImport = computed(() => {
  return validRows.value > 0 && !parseError.value
})

// Methods
const nextStep = () => {
  if (canProceed.value && currentStep.value < steps.length - 1) {
    currentStep.value++
    
    // Parse file when moving to review step
    if (currentStep.value === 2 && selectedFile.value) {
      parseFile()
    }
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragActive.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    selectedFile.value = files[0]
  }
}

const clearFile = () => {
  selectedFile.value = null
  previewData.value = []
  parseError.value = ''
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const downloadTemplate = () => {
  // Mock template download
  const template = {
    csv: 'code,name,description,parentCode,sortOrder,isActive\nELEC,Electronics,Electronic devices,,0,true\nTOOL,Tools,Hand and power tools,,1,true',
    excel: 'template.xlsx',
    json: JSON.stringify([
      {
        code: 'ELEC',
        name: 'Electronics',
        description: 'Electronic devices',
        parentCode: '',
        sortOrder: 0,
        isActive: true
      }
    ], null, 2)
  }
  
  const content = template[selectedImportType.value]
  const blob = new Blob([content], { 
    type: selectedImportType.value === 'json' ? 'application/json' : 'text/csv' 
  })
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `categories-template.${selectedImportType.value}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const parseFile = async () => {
  if (!selectedFile.value) return
  
  try {
    parseError.value = ''
    const content = await selectedFile.value.text()
    
    // Mock parsing logic - in real app, this would parse CSV/Excel/JSON
    const mockData = [
      { code: 'ELEC', name: 'Electronics', description: 'Electronic devices', parentCode: '', status: 'valid', issues: [] },
      { code: 'COMP', name: 'Computers', description: 'Computer equipment', parentCode: 'ELEC', status: 'valid', issues: [] },
      { code: 'TOOL', name: 'Tools', description: 'Hand tools', parentCode: '', status: 'warning', issues: ['Duplicate code found'] },
      { code: '', name: 'Invalid Category', description: '', parentCode: '', status: 'error', issues: ['Code is required', 'Name is required'] }
    ]
    
    previewData.value = mockData
  } catch (error) {
    parseError.value = 'Failed to parse file: ' + error.message
  }
}

const startImport = async () => {
  if (!canImport.value) return
  
  isImporting.value = true
  
  try {
    // Mock import process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const result = {
      success: true,
      imported: validRows.value,
      skipped: errorRows.value,
      warnings: warningRows.value
    }
    
    emit('import-complete', result)
  } catch (error) {
    const result = {
      success: false,
      errors: [error.message]
    }
    
    emit('import-complete', result)
  } finally {
    isImporting.value = false
  }
}
</script>
