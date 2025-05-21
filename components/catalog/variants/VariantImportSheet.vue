<template>
  <SheetContent class="sm:max-w-xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Import Variants</SheetTitle>
      <SheetDescription>
        Import product variants from {{ importType.toUpperCase() }} file
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

        <Alert v-if="uploadError" variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{{ uploadError }}</AlertDescription>
        </Alert>

        <!-- Sample Template Link -->
        <div class="flex items-center justify-between p-3 border rounded-md bg-muted/50">
          <div class="flex items-center space-x-2">
            <FileQuestion class="h-5 w-5 text-muted-foreground" />
            <div>
              <h4 class="text-sm font-medium">Need a template?</h4>
              <p class="text-xs text-muted-foreground">
                Download our sample template to ensure proper formatting
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" @click="downloadTemplate">
            <Download class="h-4 w-4 mr-2" />
            Download
          </Button>
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
          Match each column from your file to the appropriate variant field.
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

        <!-- Product Selection Strategy -->
        <div class="p-4 border rounded-md space-y-3">
          <h4 class="text-sm font-medium">Product Matching Strategy</h4>
          <RadioGroup v-model="productMatchingStrategy">
            <div class="flex items-start space-x-2">
              <RadioGroupItem value="id" id="match-id" />
              <div>
                <Label for="match-id">Match by Product ID</Label>
                <p class="text-xs text-muted-foreground">
                  Use the product ID in your spreadsheet to match products
                </p>
              </div>
            </div>
            <div class="flex items-start space-x-2">
              <RadioGroupItem value="sku" id="match-sku" />
              <div>
                <Label for="match-sku">Match by Product SKU</Label>
                <p class="text-xs text-muted-foreground">
                  Use the product SKU in your spreadsheet to match products
                </p>
              </div>
            </div>
            <div class="flex items-start space-x-2">
              <RadioGroupItem value="name" id="match-name" />
              <div>
                <Label for="match-name">Match by Product Name</Label>
                <p class="text-xs text-muted-foreground">
                  Use the product name in your spreadsheet to match products
                </p>
              </div>
            </div>
          </RadioGroup>
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
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Attributes</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(row, rowIndex) in previewData" :key="rowIndex">
                <TableCell>{{ row.productName || row.productId }}</TableCell>
                <TableCell>{{ row.sku }}</TableCell>
                <TableCell>
                  <div class="flex flex-wrap gap-1">
                    <Badge 
                      v-for="(value, key) in row.attributeValues" 
                      :key="key"
                      variant="outline"
                      class="whitespace-nowrap"
                    >
                      {{ formatAttributeName(key) }}: {{ value }}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{{ formatPrice(row.price) }}</TableCell>
                <TableCell>{{ row.stock }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div class="text-sm text-muted-foreground">
          Showing {{ Math.min(5, parsedData.length) }} of {{ parsedData.length }} rows
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

        <div class="p-4 border rounded-md space-y-3">
          <h4 class="text-sm font-medium">Import Options</h4>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="update-existing" v-model:checked="updateExisting" />
              <div>
                <Label for="update-existing">Update existing variants if found</Label>
                <p class="text-xs text-muted-foreground">
                  If a variant with the same SKU exists, it will be updated
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="skip-errors" v-model:checked="skipErrors" />
              <div>
                <Label for="skip-errors">Skip rows with errors</Label>
                <p class="text-xs text-muted-foreground">
                  Continue import even if some rows have errors
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" @click="step = 2">
            Back
          </Button>
          <Button 
            @click="importVariants" 
            :disabled="isImporting || validationErrors.length > 0"
          >
            <Loader2 v-if="isImporting" class="h-4 w-4 mr-2 animate-spin" />
            {{ isImporting ? 'Importing...' : 'Import Variants' }}
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
            Successfully imported {{ importStats.total }} variants
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
  FileUp, FileText, Loader2, X, CheckCircle2, AlertCircle,
  Download, FileQuestion
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const props = defineProps({
  importType: {
    type: String,
    default: 'csv',
    validator: (value) => ['csv', 'excel'].includes(value)
  },
  products: {
    type: Array,
    default: () => []
  },
  attributes: {
    type: Array,
    default: () => []
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
const productMatchingStrategy = ref('id')

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
  { key: 'productId', label: 'Product ID/SKU/Name', required: true },
  { key: 'sku', label: 'Variant SKU', required: true },
  { key: 'price', label: 'Price', required: true },
  { key: 'stock', label: 'Stock', required: false },
  { key: 'isEnabled', label: 'Is Enabled', required: false },
  { key: 'priceAdjustment', label: 'Price Adjustment (%)', required: false },
  // Dynamically add attribute fields later
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

const downloadTemplate = () => {
  // In a real implementation, this would download a template file
  // For now, we'll just show a mock interface
  console.log('Downloading template file')
  
  // Example of how this might work
  const link = document.createElement('a')
  link.href = '/templates/variant-import-template.csv'
  link.download = 'variant-import-template.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
    parsedHeaders.value = [
      'Product ID', 'Product SKU', 'Variant SKU', 'Color', 'Size', 
      'Price', 'Stock', 'Enabled'
    ]
    
    // Add attribute fields dynamically
    props.attributes.forEach(attr => {
      if (attr.isVariant) {
        requiredFields.push({
          key: `attribute_${attr.id}`,
          label: `Attribute: ${attr.name}`,
          required: attr.isRequired
        })
      }
    })
    
    // Initialize field mapping with best guesses
    fieldMapping.value = {
      productId: 'Product ID',
      sku: 'Variant SKU',
      price: 'Price',
      stock: 'Stock',
      isEnabled: 'Enabled'
    }
    
    // Map attribute columns
    props.attributes.forEach(attr => {
      if (attr.isVariant) {
        const headerMatch = parsedHeaders.value.find(
          h => h.toLowerCase() === attr.name.toLowerCase()
        )
        if (headerMatch) {
          fieldMapping.value[`attribute_${attr.id}`] = headerMatch
        }
      }
    })
    
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
    
    // Mock parsed variants data
    parsedData.value = [
      {
        productId: '1001',
        productName: 'Cotton T-Shirt',
        sku: 'TSHIRT-BL-S',
        attributeValues: {
          'attr1': 'Blue',
          'attr2': 'Small'
        },
        price: 19.99,
        stock: 25,
        isEnabled: true
      },
      {
        productId: '1001',
        productName: 'Cotton T-Shirt',
        sku: 'TSHIRT-BL-M',
        attributeValues: {
          'attr1': 'Blue',
          'attr2': 'Medium'
        },
        price: 19.99,
        stock: 18,
        isEnabled: true
      },
      {
        productId: '1002',
        productName: 'Denim Jeans',
        sku: 'JEANS-DK-32',
        attributeValues: {
          'attr1': 'Dark Wash',
          'attr2': '32'
        },
        price: 49.99,
        stock: 12,
        isEnabled: true
      },
      {
        productId: '1002',
        productName: 'Denim Jeans',
        sku: 'JEANS-DK-34',
        attributeValues: {
          'attr1': 'Dark Wash',
          'attr2': '34'
        },
        price: 49.99,
        stock: 8,
        isEnabled: true
      },
      {
        productId: '1003',
        productName: 'Leather Jacket',
        sku: 'JACKET-BK-L',
        attributeValues: {
          'attr1': 'Black',
          'attr2': 'Large'
        },
        price: 199.99,
        stock: 5,
        isEnabled: true
      }
    ]
    
    step.value = 3
  } catch (error) {
    validationErrors.value.push(`Error validating data: ${error.message || 'Unknown error'}`)
  } finally {
    isValidating.value = false
  }
}

const formatAttributeName = (attributeId) => {
  const attribute = props.attributes.find(attr => attr.id === attributeId)
  return attribute ? attribute.name : attributeId
}

const formatPrice = (price) => {
  if (price === undefined || price === null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

const importVariants = async () => {
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