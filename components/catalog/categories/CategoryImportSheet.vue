<template>
  <SheetContent class="sm:max-w-[500px]">
    <SheetHeader>
      <SheetTitle>Import Categories</SheetTitle>
      <SheetDescription>
        Import product categories from {{ importType.toUpperCase() }} file
      </SheetDescription>
    </SheetHeader>

    <div class="py-6 space-y-8">
      <!-- Step 1: Upload File -->
      <div class="space-y-4" v-if="step === 1">
        <h3 class="text-sm font-medium">1. Upload {{ importType.toUpperCase() }} File</h3>
        
        <div class="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center" 
             @dragover.prevent 
             @drop.prevent="handleFileDrop">
          <FileUp class="h-10 w-10 text-muted-foreground mb-2" />
          <p class="text-sm text-muted-foreground mb-2">
            Drag and drop your {{ importType.toUpperCase() }} file here, or click to browse
          </p>
          <Button variant="outline" @click="triggerFileInput">
            <FileUp class="h-4 w-4 mr-2" />
            Browse Files
          </Button>
          <input 
            type="file" 
            ref="fileInput" 
            class="hidden" 
            :accept="acceptedFileTypes" 
            @change="handleFileChange" 
          />
        </div>

        <div v-if="file" class="flex items-center space-x-2 p-2 bg-muted rounded-md">
          <FileText class="h-4 w-4 text-primary" />
          <div class="text-sm font-medium flex-1 truncate">{{ file.name }}</div>
          <Button variant="ghost" size="icon" @click="file = null">
            <X class="h-4 w-4" />
          </Button>
        </div>

        <div v-if="uploadError" class="text-sm text-destructive">
          {{ uploadError }}
        </div>

        <Button 
          @click="parseFile" 
          :disabled="!file || isUploading" 
          class="w-full"
        >
          <Loader2 v-if="isUploading" class="h-4 w-4 mr-2 animate-spin" />
          Continue to Mapping
        </Button>
      </div>

      <!-- Step 2: Map Columns -->
      <div class="space-y-4" v-else-if="step === 2">
        <h3 class="text-sm font-medium">2. Map Columns</h3>
        
        <p class="text-sm text-muted-foreground">
          Match each column from your file to the appropriate category field.
        </p>

        <div class="space-y-4">
          <div v-for="(field, index) in requiredFields" :key="index" class="space-y-2">
            <Label>{{ field.label }} {{ field.required ? '*' : '' }}</Label>
            <Select v-model="fieldMapping[field.key]">
              <SelectTrigger>
                <SelectValue :placeholder="`Select column for ${field.label}`" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">- Skip -</SelectItem>
                <SelectItem 
                  v-for="(column, idx) in parsedHeaders" 
                  :key="idx" 
                  :value="column"
                >
                  {{ column }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" @click="step = 1">
            Back
          </Button>
          <Button @click="validateMapping" :disabled="isValidating">
            <Loader2 v-if="isValidating" class="h-4 w-4 mr-2 animate-spin" />
            Continue to Preview
          </Button>
        </div>
      </div>

      <!-- Step 3: Preview and Import -->
      <div class="space-y-4" v-else-if="step === 3">
        <h3 class="text-sm font-medium">3. Preview and Import</h3>
        
        <div class="border rounded-md max-h-[300px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead v-for="field in requiredFields" :key="field.key">
                  {{ field.label }}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(row, rowIndex) in previewData" :key="rowIndex">
                <TableCell v-for="field in requiredFields" :key="field.key">
                  {{ row[field.key] || '-' }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div class="text-sm text-muted-foreground">
          Showing {{ Math.min(5, parsedData.length) }} of {{ parsedData.length }} rows
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="text-sm font-medium">Import Options</div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="update-existing" v-model:checked="updateExisting" />
              <Label for="update-existing">Update existing categories if found</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="skip-errors" v-model:checked="skipErrors" />
              <Label for="skip-errors">Skip rows with errors</Label>
            </div>
          </div>
        </div>

        <Alert v-if="validationErrors.length" variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul class="list-disc pl-4 text-sm">
              <li v-for="(error, idx) in validationErrors.slice(0, 3)" :key="idx">
                {{ error }}
              </li>
              <li v-if="validationErrors.length > 3">
                And {{ validationErrors.length - 3 }} more errors...
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" @click="step = 2">
            Back
          </Button>
          <Button 
            @click="importCategories" 
            :disabled="isImporting || validationErrors.length > 0"
          >
            <Loader2 v-if="isImporting" class="h-4 w-4 mr-2 animate-spin" />
            {{ isImporting ? 'Importing...' : 'Import Categories' }}
          </Button>
        </div>
      </div>

      <!-- Step 4: Import Complete -->
      <div class="space-y-4" v-else-if="step === 4">
        <div class="flex flex-col items-center justify-center py-6">
          <div class="bg-primary/10 p-3 rounded-full mb-4">
            <CheckCircle2 class="h-8 w-8 text-primary" />
          </div>
          <h3 class="text-xl font-medium mb-2">Import Complete</h3>
          <p class="text-center text-muted-foreground mb-4">
            Successfully imported {{ importStats.total }} categories
          </p>
          
          <div class="w-full grid grid-cols-2 gap-4 mb-6">
            <div class="bg-muted rounded-lg p-3 text-center">
              <p class="text-sm text-muted-foreground">Created</p>
              <p class="text-2xl font-medium">{{ importStats.created }}</p>
            </div>
            <div class="bg-muted rounded-lg p-3 text-center">
              <p class="text-sm text-muted-foreground">Updated</p>
              <p class="text-2xl font-medium">{{ importStats.updated }}</p>
            </div>
            <div class="bg-muted rounded-lg p-3 text-center">
              <p class="text-sm text-muted-foreground">Skipped</p>
              <p class="text-2xl font-medium">{{ importStats.skipped }}</p>
            </div>
            <div class="bg-muted rounded-lg p-3 text-center">
              <p class="text-sm text-muted-foreground">Errors</p>
              <p class="text-2xl font-medium">{{ importStats.errors }}</p>
            </div>
          </div>
          
          <Button @click="completeImport">
            Done
          </Button>
        </div>
      </div>
    </div>
  </SheetContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  FileUp, FileText, Loader2, X, CheckCircle2, AlertCircle 
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

const props = defineProps({
  importType: {
    type: String,
    default: 'csv',
    validator: (value) => ['csv', 'excel'].includes(value)
  }
})

const emit = defineEmits(['import-complete', 'close'])

// State
const step = ref(1)
const file = ref(null)
const fileInput = ref(null)
const uploadError = ref('')
const isUploading = ref(false)
const isValidating = ref(false)
const isImporting = ref(false)

// Parsed data
const parsedData = ref([])
const parsedHeaders = ref([])
const fieldMapping = ref({})
const validationErrors = ref([])

// Import options
const updateExisting = ref(true)
const skipErrors = ref(true)

// Import stats
const importStats = ref({
  total: 0,
  created: 0,
  updated: 0,
  skipped: 0,
  errors: 0
})

// Required fields for import
const requiredFields = [
  { key: 'name', label: 'Name', required: true },
  { key: 'description', label: 'Description', required: false },
  { key: 'slug', label: 'Slug', required: false },
  { key: 'parentName', label: 'Parent Category', required: false },
  { key: 'status', label: 'Status', required: false },
  { key: 'featured', label: 'Featured', required: false },
  { key: 'displayOrder', label: 'Display Order', required: false }
]

// Computed
const acceptedFileTypes = computed(() => {
  if (props.importType === 'csv') return '.csv'
  if (props.importType === 'excel') return '.xlsx,.xls'
  return ''
})

const previewData = computed(() => {
  return parsedData.value.slice(0, 5)
})

// Methods
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    file.value = files[0]
    uploadError.value = ''
  }
}

const handleFileDrop = (event) => {
  const files = event.dataTransfer.files
  if (files.length > 0) {
    file.value = files[0]
    uploadError.value = ''
  }
}

const parseFile = async () => {
  if (!file.value) return
  
  isUploading.value = true
  uploadError.value = ''
  
  try {
    // In a real implementation, you would parse the file here
    // For this example, we'll simulate parsing with a timeout
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock parsed data
    parsedHeaders.value = ['Category Name', 'Description', 'Slug', 'Parent', 'Status', 'Featured', 'Order']
    parsedData.value = [
      { 'Category Name': 'Electronics', 'Description': 'Electronic devices', 'Slug': 'electronics', 'Parent': '', 'Status': 'active', 'Featured': 'yes', 'Order': '1' },
      { 'Category Name': 'Smartphones', 'Description': 'Mobile phones', 'Slug': 'smartphones', 'Parent': 'Electronics', 'Status': 'active', 'Featured': 'yes', 'Order': '1' },
      { 'Category Name': 'Laptops', 'Description': 'Portable computers', 'Slug': 'laptops', 'Parent': 'Electronics', 'Status': 'active', 'Featured': 'no', 'Order': '2' },
      { 'Category Name': 'Clothing', 'Description': 'Apparel and accessories', 'Slug': 'clothing', 'Status': 'active', 'Featured': 'yes', 'Order': '2' },
      { 'Category Name': 'Men\'s Clothing', 'Description': 'Apparel for men', 'Slug': 'mens-clothing', 'Parent': 'Clothing', 'Status': 'active', 'Featured': 'no', 'Order': '1' }
    ]
    
    // Initialize field mapping with best guesses
    fieldMapping.value = {
      name: 'Category Name',
      description: 'Description',
      slug: 'Slug',
      parentName: 'Parent',
      status: 'Status',
      featured: 'Featured',
      displayOrder: 'Order'
    }
    
    step.value = 2
  } catch (error) {
    uploadError.value = `Error parsing file: ${error.message || 'Unknown error'}`
  } finally {
    isUploading.value = false
  }
}

const validateMapping = async () => {
  isValidating.value = true
  validationErrors.value = []
  
  try {
    // Check if required fields are mapped
    for (const field of requiredFields) {
      if (field.required && !fieldMapping.value[field.key]) {
        validationErrors.value.push(`${field.label} is required but not mapped`)
      }
    }
    
    // In a real implementation, you would validate the data here
    // For this example, we'll just move to the preview step
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    step.value = 3
  } catch (error) {
    validationErrors.value.push(`Error validating data: ${error.message || 'Unknown error'}`)
  } finally {
    isValidating.value = false
  }
}

const importCategories = async () => {
  isImporting.value = true
  
  try {
    // In a real implementation, you would import the data here
    // For this example, we'll simulate the import with a timeout
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Set mock import stats
    importStats.value = {
      total: parsedData.value.length,
      created: 3,
      updated: 1,
      skipped: 0,
      errors: 1
    }
    
    step.value = 4
  } catch (error) {
    validationErrors.value.push(`Error importing data: ${error.message || 'Unknown error'}`)
  } finally {
    isImporting.value = false
  }
}

const completeImport = () => {
  emit('import-complete', {
    success: true,
    count: importStats.value.total,
    stats: importStats.value
  })
  emit('close')
}
</script>