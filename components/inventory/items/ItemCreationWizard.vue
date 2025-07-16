<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 overflow-y-auto px-6 pt-4 pb-4 space-y-6 min-h-0 max-h-[70vh]">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold mb-2">Create New Inventory Item</h2>
          <p class="text-muted-foreground">
            Follow the steps below to add a new item to your inventory
          </p>
        </div>

        <!-- Progress Steps -->
        <div class="flex items-center justify-center mb-8">
          <div class="flex items-center space-x-4">
            <div 
              v-for="(step, index) in steps" 
              :key="index"
              class="flex items-center"
            >
              <div 
                class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors"
                :class="getStepClass(index)"
              >
                <CheckIcon v-if="index < currentStep" class="h-4 w-4" />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span 
                class="ml-2 text-sm font-medium"
                :class="index <= currentStep ? 'text-foreground' : 'text-muted-foreground'"
              >
                {{ step.title }}
              </span>
              <ChevronRight v-if="index < steps.length - 1" class="h-4 w-4 mx-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <!-- Step Content -->
        <Card>
          <CardHeader>
            <CardTitle>{{ steps[currentStep].title }}</CardTitle>
            <CardDescription>{{ steps[currentStep].description }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Step 1: Basic Information -->
            <div v-if="currentStep === 0" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="sku">SKU</Label>
                  <Input
                    id="sku"
                    v-model="formData.sku"
                    placeholder="Enter SKU (optional)"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    v-model="formData.barcode"
                    placeholder="Enter barcode (optional)"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label for="name">Item Name *</Label>
                <Input
                  id="name"
                  v-model="formData.itemName"
                  placeholder="Enter item name"
                  :class="{ 'border-red-500': errors.itemName }"
                />
                <p v-if="errors.itemName" class="text-sm text-red-500">{{ errors.itemName }}</p>
              </div>

              <div class="space-y-2">
                <Label for="description">Description</Label>
                <Textarea
                  id="description"
                  v-model="formData.description"
                  placeholder="Enter item description"
                  rows="3"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="brand">Brand</Label>
                  <Input
                    id="brand"
                    v-model="formData.brand"
                    placeholder="Enter brand (optional)"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    v-model="formData.manufacturer"
                    placeholder="Enter manufacturer (optional)"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="category">Category *</Label>
                  <Select v-model="formData.categoryId">
                    <SelectTrigger :class="{ 'border-red-500': errors.categoryId }">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                        v-for="category in categoryOptions" 
                        :key="category.id" 
                        :value="category.id?.toString()"
                        :class="{ 
                          'pl-6': category.level > 0, 
                          'font-semibold text-foreground': category.level === 0, 
                          'text-muted-foreground font-normal': category.level > 0,
                          'border-l-2 border-muted ml-2': category.level > 0
                        }"
                      >
                        {{ category.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-if="errors.categoryId" class="text-sm text-red-500">{{ errors.categoryId }}</p>
                </div>
                <div class="space-y-2">
                  <Label for="unitOfMeasure">Unit of Measure *</Label>
                  <Select v-model="formData.baseUnitOfMeasureId">
                    <SelectTrigger :class="{ 'border-red-500': errors.baseUnitOfMeasureId }">
                      <SelectValue placeholder="Select UOM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                        v-for="uom in uomOptions" 
                        :key="uom.id" 
                        :value="uom.id?.toString()"
                        :class="{ 
                          'pl-6': uom.level > 0, 
                          'font-semibold text-foreground': uom.level === 0, 
                          'text-muted-foreground font-normal': uom.level > 0,
                          'border-l-2 border-muted ml-2': uom.level > 0
                        }"
                      >
                        {{ uom.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-if="errors.baseUnitOfMeasureId" class="text-sm text-red-500">{{ errors.baseUnitOfMeasureId }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="itemType">Item Type</Label>
                  <Select v-model="formData.itemType">
                    <SelectTrigger>
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INVENTORY">Inventory</SelectItem>
                      <SelectItem value="NON_INVENTORY">Non-Inventory</SelectItem>
                      <SelectItem value="SERVICE">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <Label for="valuationMethod">Valuation Method</Label>
                  <Select v-model="formData.valuationMethod">
                    <SelectTrigger>
                      <SelectValue placeholder="Select valuation method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIFO">FIFO</SelectItem>
                      <SelectItem value="LIFO">LIFO</SelectItem>
                      <SelectItem value="AVERAGE">Average Cost</SelectItem>
                      <SelectItem value="STANDARD">Standard Cost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <!-- Step 2: Pricing & Costs -->
            <div v-else-if="currentStep === 1" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="standardCost">Standard Cost</Label>
                  <Input
                    id="standardCost"
                    v-model="formData.standardCost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="averageCost">Average Cost</Label>
                  <Input
                    id="averageCost"
                    v-model="formData.averageCost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="lastCost">Last Cost</Label>
                  <Input
                    id="lastCost"
                    v-model="formData.lastCost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="sellingPrice">Selling Price</Label>
                  <Input
                    id="sellingPrice"
                    v-model="formData.sellingPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <!-- Step 3: Inventory Settings -->
            <div v-else-if="currentStep === 2" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="initialStockQuantity">Initial Stock Quantity</Label>
                  <Input
                    id="initialStockQuantity"
                    v-model="formData.initialStockQuantity"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="initialLocationId">Initial Location *</Label>
                  <Select v-model="formData.initialLocationId">
                    <SelectTrigger :class="{ 'border-red-500': errors.initialLocationId }">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="location in props.locations" :key="location.id" :value="location.id.toString()">
                        {{ location.name }} ({{ location.code }})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-if="errors.initialLocationId" class="text-sm text-red-500">{{ errors.initialLocationId }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="minStockLevel">Minimum Stock Level</Label>
                  <Input
                    id="minStockLevel"
                    v-model="formData.minStockLevel"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="maxStockLevel">Maximum Stock Level</Label>
                  <Input
                    id="maxStockLevel"
                    v-model="formData.maxStockLevel"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <Label for="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    v-model="formData.reorderPoint"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="reorderQuantity">Reorder Quantity</Label>
                  <Input
                    id="reorderQuantity"
                    v-model="formData.reorderQuantity"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="leadTimeDays">Lead Time (Days)</Label>
                  <Input
                    id="leadTimeDays"
                    v-model="formData.leadTimeDays"
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label>Tracking Options</Label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <Checkbox id="trackLotNumber" v-model:checked="formData.trackLotNumber" />
                      <Label for="trackLotNumber">Track lot/batch numbers</Label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <Checkbox id="trackSerialNumber" v-model:checked="formData.trackSerialNumber" />
                      <Label for="trackSerialNumber">Track serial numbers</Label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <Checkbox id="trackExpirationDate" v-model:checked="formData.trackExpirationDate" />
                      <Label for="trackExpirationDate">Track expiration dates</Label>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <Checkbox id="perishable" v-model:checked="formData.perishable" />
                      <Label for="perishable">Perishable item</Label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <Checkbox id="hazardous" v-model:checked="formData.hazardous" />
                      <Label for="hazardous">Hazardous material</Label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <Checkbox id="controlledSubstance" v-model:checked="formData.controlledSubstance" />
                      <Label for="controlledSubstance">Controlled substance</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Additional Information -->
            <div v-else-if="currentStep === 3" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="weight">Weight</Label>
                  <Input
                    id="weight"
                    v-model="formData.weight"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="weightUnit">Weight Unit</Label>
                  <Select v-model="formData.weightUnit">
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KILOGRAMS">Kilograms (kg)</SelectItem>
                      <SelectItem value="POUNDS">Pounds (lb)</SelectItem>
                      <SelectItem value="GRAMS">Grams (g)</SelectItem>
                      <SelectItem value="OUNCES">Ounces (oz)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <Label for="length">Length</Label>
                  <Input
                    id="length"
                    v-model="formData.length"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="width">Width</Label>
                  <Input
                    id="width"
                    v-model="formData.width"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="height">Height</Label>
                  <Input
                    id="height"
                    v-model="formData.height"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="volume">Volume</Label>
                  <Input
                    id="volume"
                    v-model="formData.volume"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="volumeUnit">Volume Unit</Label>
                  <Select v-model="formData.volumeUnit">
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LITERS">Liters (L)</SelectItem>
                      <SelectItem value="MILLILITERS">Milliliters (mL)</SelectItem>
                      <SelectItem value="GALLONS">Gallons (gal)</SelectItem>
                      <SelectItem value="FLUID_OUNCES">Fluid Ounces (fl oz)</SelectItem>
                      <SelectItem value="CUBIC_METERS">Cubic Meters (m³)</SelectItem>
                      <SelectItem value="CUBIC_FEET">Cubic Feet (ft³)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div class="space-y-2">
                <Label for="notes">Notes</Label>
                <Textarea
                  id="notes"
                  v-model="formData.notes"
                  placeholder="Additional notes about this item"
                  rows="3"
                />
              </div>

              <div class="space-y-2">
                <Label>Item Status</Label>
                <div class="flex items-center space-x-2">
                  <Checkbox id="isActive" v-model:checked="formData.isActive" />
                  <Label for="isActive">Item is active</Label>
                </div>
              </div>

              <!-- Image Upload Section -->
              <div class="space-y-2">
                <Label for="itemImage">Item Image</Label>
                <div class="space-y-3">
                  <!-- Current Image Display -->
                  <div v-if="imageUrl" class="relative inline-block">
                    <img 
                      :src="imageUrl" 
                      alt="Item image" 
                      class="w-32 h-32 object-cover rounded-lg border border-border"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      class="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      @click="removeImage"
                    >
                      <X class="h-3 w-3" />
                    </Button>
                    <!-- Change Image Button -->
                    <div class="mt-2 flex items-center space-x-2">
                      <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleImageSelect"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        :disabled="isUploading"
                        @click="$refs.fileInput?.click()"
                      >
                        <Upload class="h-4 w-4 mr-2" />
                        Change Image
                      </Button>
                      <Loader2 v-if="isUploading" class="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                  <!-- Upload Button and File Input (only if no image) -->
                  <div v-else class="flex items-center space-x-2">
                    <input
                      ref="fileInput"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleImageSelect"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      :disabled="isUploading"
                      @click="$refs.fileInput?.click()"
                    >
                      <Upload class="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    <Loader2 v-if="isUploading" class="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                  <!-- Upload Error -->
                  <p v-if="uploadError" class="text-sm text-red-500">
                    {{ uploadError }}
                  </p>
                  <!-- Help Text -->
                  <p class="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="border-t px-6 py-4 flex justify-between flex-shrink-0 bg-background/95 backdrop-blur-sm sticky bottom-0 z-10">
      <Button 
        variant="outline" 
        @click="previousStep"
        :disabled="currentStep === 0"
      >
        <ChevronLeft class="mr-2 h-4 w-4" />
        Previous
      </Button>
      <div class="space-x-2">
        <Button variant="outline" @click="$emit('close')">
          Cancel
        </Button>
        <Button 
          v-if="currentStep < steps.length - 1"
          @click="nextStep"
        >
          Next
          <ChevronRight class="ml-2 h-4 w-4" />
        </Button>
        <Button 
          v-else
          @click="createItem"
          :disabled="!isFormValid || creating"
        >
          <Loader2 v-if="creating" class="mr-2 h-4 w-4 animate-spin" />
          Create Item
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { CheckIcon, ChevronRight, ChevronLeft, Loader2, X, Upload } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Emits
const emit = defineEmits(['item-created', 'close', 'upload-image', 'remove-image'])

// Props
const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  units: {
    type: Array,
    default: () => []
  },
  categoryHierarchy: {
    type: Array,
    default: () => []
  },
  unitHierarchy: {
    type: Array,
    default: () => []
  },
  locations: {
    type: Array,
    default: () => []
  },
  isUploading: {
    type: Boolean,
    default: false
  },
  uploadError: {
    type: String,
    default: null
  },
  imageUrl: {
    type: String,
    default: ''
  }
})

// State
const currentStep = ref(0)
const creating = ref(false)
const errors = reactive({})
const fileInput = ref(null)

const steps = [
  {
    title: 'Basic Info',
    description: 'Enter the basic information for your inventory item'
  },
  {
    title: 'Pricing & Costs',
    description: 'Set up pricing and cost information'
  },
  {
    title: 'Inventory Settings',
    description: 'Configure stock management and tracking'
  },
  {
    title: 'Additional Info',
    description: 'Add physical properties and additional details'
  }
]

const formData = reactive({
  itemName: '',
  description: '',
  categoryId: '',
  baseUnitOfMeasureId: '',
  barcode: '',
  sku: '',
  brand: '',
  manufacturer: '',
  standardCost: null,
  averageCost: null,
  lastCost: null,
  sellingPrice: null,
  valuationMethod: 'FIFO',
  itemType: 'INVENTORY',
  initialStockQuantity: null,
  initialLocationId: '',
  minStockLevel: null,
  maxStockLevel: null,
  reorderPoint: null,
  reorderQuantity: null,
  leadTimeDays: null,
  trackLotNumber: false,
  trackSerialNumber: false,
  trackExpirationDate: false,
  perishable: false,
  hazardous: false,
  controlledSubstance: false,
  weight: null,
  weightUnit: '',
  length: null,
  width: null,
  height: null,
  volume: null,
  volumeUnit: '',
  notes: '',
  isActive: true
})

// Mock data - should come from stores  
// Computed
const isFormValid = computed(() => {
  return formData.itemName && formData.categoryId && formData.baseUnitOfMeasureId
})

const getStepClass = (index) => {
  if (index < currentStep.value) {
    return 'bg-primary text-primary-foreground'
  } else if (index === currentStep.value) {
    return 'bg-primary text-primary-foreground'
  } else {
    return 'bg-muted text-muted-foreground'
  }
}

// Helper functions for hierarchical data
const renderCategoryOptions = (categories, level = 0) => {
  const options = []
  if (!categories || !Array.isArray(categories)) return options
  
  for (const category of categories) {
    if (!category || !category.id) continue
    
    const prefix = level === 0 ? '' : '  '.repeat(level)
    options.push({
      id: category.id,
      name: `${prefix}${category.name || 'Unnamed Category'}`,
      level,
      isParent: level === 0
    })
    
    // Check for both children and subCategories properties
    const childCategories = category.children || category.subCategories || []
    if (childCategories && childCategories.length > 0) {
      options.push(...renderCategoryOptions(childCategories, level + 1))
    }
  }
  return options
}

const renderUOMOptions = (units, level = 0) => {
  const options = []
  if (!units || !Array.isArray(units)) return options
  
  for (const unit of units) {
    if (!unit || !unit.id) continue
    
    const prefix = level === 0 ? '' : '  '.repeat(level)
    const displayName = unit.name || 'Unnamed Unit'
    const codeDisplay = unit.code ? ` (${unit.code})` : ''
    
    options.push({
      id: unit.id,
      name: `${prefix}${displayName}${codeDisplay}`,
      code: unit.code,
      level,
      isParent: level === 0
    })
    
    if (unit.children && unit.children.length > 0) {
      options.push(...renderUOMOptions(unit.children, level + 1))
    }
  }
  return options
}

const categoryOptions = computed(() => {
  return renderCategoryOptions(props.categoryHierarchy || [])
})

const uomOptions = computed(() => {
  return renderUOMOptions(props.unitHierarchy || [])
})

// Image upload methods
const handleImageSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  emit('upload-image', { file, itemId: props.item?.id })
}

const removeImage = () => {
   emit('remove-image', { itemId: props.item?.id })
}

// Methods
const nextStep = () => {
  if (validateCurrentStep()) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const validateCurrentStep = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])

  if (currentStep.value === 0) {
    if (!formData.itemName) {
      errors.itemName = 'Item name is required'
    }
    if (!formData.categoryId) {
      errors.categoryId = 'Category is required'
    }
    if (!formData.baseUnitOfMeasureId) {
      errors.baseUnitOfMeasureId = 'Unit of measure is required'
    }
  }

  if (currentStep.value === 2) {
    if (formData.initialStockQuantity && !formData.initialLocationId) {
      errors.initialLocationId = 'Initial location is required when setting initial stock'
    }
  }

  return Object.keys(errors).length === 0
}

const createItem = async () => {
  if (!validateCurrentStep()) return

  creating.value = true
  try {
    const itemData = {
      itemName: formData.itemName,
      description: formData.description || undefined,
      categoryId: parseInt(formData.categoryId),
      baseUnitOfMeasureId: parseInt(formData.baseUnitOfMeasureId),
      barcode: formData.barcode || undefined,
      sku: formData.sku || undefined,
      brand: formData.brand || undefined,
      manufacturer: formData.manufacturer || undefined,
      standardCost: parseFloat(formData.standardCost) || undefined,
      averageCost: parseFloat(formData.averageCost) || undefined,
      lastCost: parseFloat(formData.lastCost) || undefined,
      sellingPrice: parseFloat(formData.sellingPrice) || undefined,
      valuationMethod: formData.valuationMethod || 'FIFO',
      itemType: formData.itemType || 'INVENTORY',
      imageUrl: props.imageUrl || undefined,
      initialStockQuantity: parseFloat(formData.initialStockQuantity) || undefined,
      initialLocationId: parseInt(formData.initialLocationId) || undefined,
      minStockLevel: parseFloat(formData.minStockLevel) || undefined,
      maxStockLevel: parseFloat(formData.maxStockLevel) || undefined,
      reorderPoint: parseFloat(formData.reorderPoint) || undefined,
      reorderQuantity: parseFloat(formData.reorderQuantity) || undefined,
      leadTimeDays: parseInt(formData.leadTimeDays) || undefined,
      trackLotNumber: formData.trackLotNumber,
      trackSerialNumber: formData.trackSerialNumber,
      trackExpirationDate: formData.trackExpirationDate,
      perishable: formData.perishable,
      hazardous: formData.hazardous,
      controlledSubstance: formData.controlledSubstance,
      weight: parseFloat(formData.weight) || undefined,
      weightUnit: formData.weightUnit || undefined,
      length: parseFloat(formData.length) || undefined,
      width: parseFloat(formData.width) || undefined,
      height: parseFloat(formData.height) || undefined,
      volume: parseFloat(formData.volume) || undefined,
      volumeUnit: formData.volumeUnit || undefined,
      notes: formData.notes || undefined,
      isActive: formData.isActive
    }

    emit('item-created', itemData)
    
    // Reset form after successful emission
    resetForm()
    
    // Also emit close to ensure the wizard closes
    emit('close')
  } catch (error) {
    console.error('Error creating item:', error)
  } finally {
    creating.value = false
  }
}

const resetForm = () => {
  // Reset form data to initial state
  Object.assign(formData, {
    itemName: '',
    description: '',
    categoryId: '',
    baseUnitOfMeasureId: '',
    barcode: '',
    sku: '',
    brand: '',
    manufacturer: '',
    standardCost: null,
    averageCost: null,
    lastCost: null,
    sellingPrice: null,
    valuationMethod: 'FIFO',
    itemType: 'INVENTORY',
    initialStockQuantity: null,
    initialLocationId: '',
    minStockLevel: null,
    maxStockLevel: null,
    reorderPoint: null,
    reorderQuantity: null,
    leadTimeDays: null,
    trackLotNumber: false,
    trackSerialNumber: false,
    trackExpirationDate: false,
    perishable: false,
    hazardous: false,
    controlledSubstance: false,
    weight: null,
    weightUnit: '',
    length: null,
    width: null,
    height: null,
    volume: null,
    volumeUnit: '',
    notes: '',
    isActive: true
  })
  
  // Reset current step
  currentStep.value = 0
  
  // Clear errors
  Object.keys(errors).forEach(key => delete errors[key])
}
</script>
