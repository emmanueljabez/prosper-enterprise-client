<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="border-b p-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">{{ stepTitles[currentStep] }}</h2>
        <Button variant="ghost" size="icon" @click="$emit('close')">
          <XIcon class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </Button>
      </div>
      <p class="text-sm text-muted-foreground">
        Step {{ currentStep + 1 }} of {{ steps.length }}
      </p>
    </div>

    <!-- Wizard Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Basic Info Step -->
      <div v-if="currentStep === 0" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="item-name" required>Item Name</Label>
            <Input
              id="item-name"
              v-model="formData.name"
              placeholder="Enter item name"
              :error="errors.name"
            />
            <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
          </div>
          <div class="space-y-2">
            <Label for="item-sku" required>SKU</Label>
            <Input
              id="item-sku"
              v-model="formData.sku"
              placeholder="Enter item SKU"
              :error="errors.sku"
            />
            <p v-if="errors.sku" class="text-sm text-destructive">{{ errors.sku }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="item-description">Description</Label>
          <Textarea
            id="item-description"
            v-model="formData.description"
            placeholder="Enter item description"
            rows="4"
          />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="item-upc">UPC/EAN</Label>
            <Input id="item-upc" v-model="formData.upc" placeholder="Enter barcode if applicable" />
          </div>
          <div class="space-y-2">
            <Label for="item-vendor-sku">Vendor SKU</Label>
            <Input
              id="item-vendor-sku"
              v-model="formData.vendorSku"
              placeholder="Enter vendor's SKU if applicable"
            />
          </div>
        </div>
      </div>

      <!-- Categories and Attributes Step -->
      <div v-if="currentStep === 1" class="space-y-4">
        <div class="space-y-2">
          <Label for="item-category" required>Category</Label>
          <Select v-model="formData.categoryId" :error="errors.categoryId">
            <SelectTrigger id="item-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.categoryId" class="text-sm text-destructive">{{ errors.categoryId }}</p>
        </div>

        <div class="space-y-2">
          <Label for="item-unit">Unit of Measure</Label>
          <Select v-model="formData.unitOfMeasure">
            <SelectTrigger id="item-unit">
              <SelectValue placeholder="Select unit of measure" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="each">Each</SelectItem>
              <SelectItem value="case">Case</SelectItem>
              <SelectItem value="box">Box</SelectItem>
              <SelectItem value="pair">Pair</SelectItem>
              <SelectItem value="kg">Kilogram</SelectItem>
              <SelectItem value="lb">Pound</SelectItem>
              <SelectItem value="l">Liter</SelectItem>
              <SelectItem value="m">Meter</SelectItem>
              <SelectItem value="ft">Foot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2 border rounded-md p-4">
          <Label>Dimensions</Label>
          <div class="grid gap-4 md:grid-cols-3">
            <div class="space-y-2">
              <Label for="item-length">Length</Label>
              <div class="flex gap-2">
                <Input
                  id="item-length"
                  v-model.number="formData.dimensions.length"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                <Select v-model="formData.dimensions.dimensionUnit" class="w-24">
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">in</SelectItem>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                    <SelectItem value="ft">ft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div class="space-y-2">
              <Label for="item-width">Width</Label>
              <Input
                id="item-width"
                v-model.number="formData.dimensions.width"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div class="space-y-2">
              <Label for="item-height">Height</Label>
              <Input
                id="item-height"
                v-model.number="formData.dimensions.height"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label for="item-weight">Weight</Label>
              <div class="flex gap-2">
                <Input
                  id="item-weight"
                  v-model.number="formData.dimensions.weight"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                <Select v-model="formData.dimensions.weightUnit" class="w-24">
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory Details Step -->
      <div v-if="currentStep === 2" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="item-cost" required>Cost</Label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
              <Input
                id="item-cost"
                v-model.number="formData.cost"
                type="number"
                min="0"
                step="0.01"
                class="pl-8"
                placeholder="0.00"
                :error="errors.cost"
              />
            </div>
            <p v-if="errors.cost" class="text-sm text-destructive">{{ errors.cost }}</p>
          </div>
        </div>

        <div class="border rounded-md p-4 space-y-4">
          <h3 class="font-medium">Reorder Settings</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label for="reorder-point">Reorder Point</Label>
              <Input
                id="reorder-point"
                v-model.number="formData.reorderPoint"
                type="number"
                min="0"
                placeholder="0"
              />
              <p class="text-xs text-muted-foreground">
                Minimum quantity before reordering
              </p>
            </div>
            <div class="space-y-2">
              <Label for="reorder-quantity">Reorder Quantity</Label>
              <Input
                id="reorder-quantity"
                v-model.number="formData.reorderQuantity"
                type="number"
                min="0"
                placeholder="0"
              />
              <p class="text-xs text-muted-foreground">
                Quantity to order when reordering
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Location Assignment Step -->
      <div v-if="currentStep === 3" class="space-y-4">
        <p class="text-sm text-muted-foreground mb-4">
          Assign initial inventory to locations. You can adjust quantities later.
        </p>
        
        <div v-for="(locationItem, index) in formData.locations" :key="index" class="border rounded-md p-4 mb-4">
          <div class="flex justify-between mb-4">
            <h3 class="font-medium">Location Assignment #{{ index + 1 }}</h3>
            <Button variant="ghost" size="icon" @click="removeLocation(index)" v-if="formData.locations.length > 1">
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
          
          <div class="grid gap-4 md:grid-cols-2 mb-4">
            <div class="space-y-2">
              <Label :for="`location-${index}`" required>Location</Label>
              <Select v-model="locationItem.id" :error="getLocationError(index)">
                <SelectTrigger :id="`location-${index}`">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="location in availableLocations(index)" 
                    :key="location.id" 
                    :value="location.id"
                  >
                    {{ location.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="getLocationError(index)" class="text-sm text-destructive">{{ getLocationError(index) }}</p>
            </div>
            <div class="space-y-2">
              <Label :for="`quantity-${index}`" required>Initial Quantity</Label>
              <Input
                :id="`quantity-${index}`"
                v-model.number="locationItem.quantity"
                type="number"
                min="0"
                placeholder="0"
                :error="getQuantityError(index)"
              />
              <p v-if="getQuantityError(index)" class="text-sm text-destructive">{{ getQuantityError(index) }}</p>
            </div>
          </div>
          
          <div class="space-y-2">
            <Label :for="`bin-${index}`">Bin Location</Label>
            <Input :id="`bin-${index}`" v-model="locationItem.bin" placeholder="e.g., A1-B2-C3" />
            <p class="text-xs text-muted-foreground">
              Optional: Specify a bin or shelf location
            </p>
          </div>
        </div>
        
        <Button variant="outline" @click="addLocation" class="w-full">
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Another Location
        </Button>
      </div>

      <!-- Review and Submit Step -->
      <div v-if="currentStep === 4" class="space-y-6">
        <div class="rounded-md border">
          <div class="p-4 bg-muted/50">
            <h3 class="font-medium">Basic Information</h3>
          </div>
          <div class="p-4 grid gap-4 md:grid-cols-2">
            <div>
              <div class="text-sm font-medium">Name</div>
              <div>{{ formData.name }}</div>
            </div>
            <div>
              <div class="text-sm font-medium">SKU</div>
              <div>{{ formData.sku }}</div>
            </div>
            <div>
              <div class="text-sm font-medium">Category</div>
              <div>{{ getCategoryName(formData.categoryId) }}</div>
            </div>
            <div>
              <div class="text-sm font-medium">Unit of Measure</div>
              <div>{{ formatUnitOfMeasure(formData.unitOfMeasure) }}</div>
            </div>
            <div class="md:col-span-2">
              <div class="text-sm font-medium">Description</div>
              <div class="line-clamp-2">{{ formData.description || 'None' }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-md border">
          <div class="p-4 bg-muted/50">
            <h3 class="font-medium">Inventory Details</h3>
          </div>
          <div class="p-4 grid gap-4 md:grid-cols-2">
            <div>
              <div class="text-sm font-medium">Cost</div>
              <div>{{ formatCurrency(formData.cost) }}</div>
            </div>
            <div>
              <div class="text-sm font-medium">Total Initial Stock</div>
              <div>{{ getTotalStock() }} {{ formData.unitOfMeasure }}</div>
            </div>
            <div>
              <div class="text-sm font-medium">Reorder Point</div>
              <div>{{ formData.reorderPoint }}</div>
            </div>
            <div>
              <div class="text-sm font-medium">Reorder Quantity</div>
              <div>{{ formData.reorderQuantity }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-md border">
          <div class="p-4 bg-muted/50">
            <h3 class="font-medium">Location Assignments</h3>
          </div>
          <div class="p-4">
            <div v-if="formData.locations.length === 0" class="text-muted-foreground">
              No locations assigned
            </div>
            <div v-for="(loc, index) in formData.locations" :key="index" class="py-2 border-b last:border-0">
              <div class="flex justify-between">
                <div>
                  <span class="font-medium">{{ getLocationName(loc.id) }}</span>
                  <span v-if="loc.bin" class="text-sm text-muted-foreground ml-2">(Bin: {{ loc.bin }})</span>
                </div>
                <div>{{ loc.quantity }} {{ formData.unitOfMeasure }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t p-4">
      <div class="flex justify-between">
        <Button
          variant="outline"
          @click="previousStep"
          :disabled="currentStep === 0"
        >
          Previous
        </Button>
        <Button
          v-if="currentStep < steps.length - 1"
          @click="nextStep"
        >
          Next
        </Button>
        <Button
          v-else
          @click="createItem"
          :disabled="isSubmitting"
        >
          <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          Create Item
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  XIcon,
  PlusIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  locations: {
    type: Array,
    required: true,
    default: () => []
  },
  categories: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['item-created', 'close'])

// Wizard steps
const steps = ['basic-info', 'categories', 'inventory', 'locations', 'review']
const stepTitles = [
  'Basic Information',
  'Categories & Attributes',
  'Inventory Details',
  'Location Assignment',
  'Review & Create'
]
const currentStep = ref(0)

// Form data
const formData = reactive({
  name: '',
  sku: '',
  description: '',
  categoryId: '',
  status: 'active',
  upc: '',
  vendorSku: '',
  reorderPoint: 10,
  reorderQuantity: 20,
  cost: 0,
  unitOfMeasure: 'each',
  dimensions: {
    weight: null,
    length: null,
    width: null,
    height: null,
    weightUnit: 'lb',
    dimensionUnit: 'in'
  },
  locations: [
    {
      id: '',
      quantity: 0,
      bin: ''
    }
  ]
})

// Form validation errors
const errors = reactive({
  name: '',
  sku: '',
  categoryId: '',
  cost: '',
  locations: []
})

// Submission state
const isSubmitting = ref(false)

// Navigation methods
const nextStep = () => {
  if (validateCurrentStep()) {
    currentStep.value++
  }
}

const previousStep = () => {
  currentStep.value--
}

// Location management
const addLocation = () => {
  formData.locations.push({
    id: '',
    quantity: 0,
    bin: ''
  })
  errors.locations.push({
    id: '',
    quantity: ''
  })
}

const removeLocation = (index) => {
  formData.locations.splice(index, 1)
  errors.locations.splice(index, 1)
}

const availableLocations = (currentIndex) => {
  // Filter out locations that are already selected in other entries
  const selectedLocationIds = formData.locations
    .map((loc, i) => i !== currentIndex ? loc.id : null)
    .filter(id => id)
  
  return props.locations.filter(location => 
    !selectedLocationIds.includes(location.id) || 
    location.id === formData.locations[currentIndex].id
  )
}

// Validation methods
const validateCurrentStep = () => {
  let isValid = true
  
  // Reset errors
  for (const key in errors) {
    if (Array.isArray(errors[key])) {
      errors[key] = formData.locations.map(() => ({ id: '', quantity: '' }))
    } else {
      errors[key] = ''
    }
  }
  
  if (currentStep.value === 0) {
    if (!formData.name.trim()) {
      errors.name = 'Item name is required'
      isValid = false
    }
    
    if (!formData.sku.trim()) {
      errors.sku = 'SKU is required'
      isValid = false
    }
  }
  
  if (currentStep.value === 1) {
    if (!formData.categoryId) {
      errors.categoryId = 'Category is required'
      isValid = false
    }
  }
  
  if (currentStep.value === 2) {
    if (formData.cost === null || formData.cost === undefined || formData.cost < 0) {
      errors.cost = 'Cost must be a positive number'
      isValid = false
    }
  }
  
  if (currentStep.value === 3) {
    let hasLocation = false
    
    errors.locations = formData.locations.map((loc, index) => {
      const locErrors = { id: '', quantity: '' }
      
      if (loc.id) {
        hasLocation = true
        
        if (loc.quantity === null || loc.quantity === undefined || loc.quantity < 0) {
          locErrors.quantity = 'Quantity must be a positive number'
          isValid = false
        }
      } else {
        locErrors.id = 'Location is required'
        isValid = false
      }
      
      return locErrors
    })
    
    if (formData.locations.length === 0) {
      isValid = false
    }
  }
  
  return isValid
}

const validateAllSteps = () => {
  const originalStep = currentStep.value
  let isValid = true
  
  // Validate each step
  for (let step = 0; step < steps.length - 1; step++) {
    currentStep.value = step
    if (!validateCurrentStep()) {
      isValid = false
    }
  }
  
  // Restore original step
  currentStep.value = originalStep
  return isValid
}

const getLocationError = (index) => {
  if (!errors.locations || !errors.locations[index]) return ''
  return errors.locations[index].id
}

const getQuantityError = (index) => {
  if (!errors.locations || !errors.locations[index]) return ''
  return errors.locations[index].quantity
}

// Helper methods
const getCategoryName = (categoryId) => {
  const category = props.categories.find(c => c.id === categoryId)
  return category ? category.name : 'None'
}

const getLocationName = (locationId) => {
  const location = props.locations.find(l => l.id === locationId)
  return location ? location.name : 'Unknown Location'
}

const formatUnitOfMeasure = (unit) => {
  const unitMap = {
    'each': 'Each',
    'case': 'Case',
    'box': 'Box',
    'pair': 'Pair',
    'kg': 'Kilogram',
    'lb': 'Pound',
    'l': 'Liter',
    'm': 'Meter',
    'ft': 'Foot'
  }
  return unitMap[unit] || unit
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(value || 0)
}

const getTotalStock = () => {
  return formData.locations.reduce((total, loc) => total + (Number(loc.quantity) || 0), 0)
}

// Submission handler
const createItem = async () => {
  if (!validateAllSteps()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Calculate stockOnHand from location quantities
    const stockOnHand = getTotalStock()
    
    // Prepare data for submission
    const itemData = {
      ...formData,
      stockOnHand,
      stockCommitted: 0,
      stockAvailable: stockOnHand,
      // Filter out empty locations
      locations: formData.locations
        .filter(loc => loc.id && loc.quantity > 0)
        .map(loc => ({
          ...loc,
          name: getLocationName(loc.id)
        }))
    }
    
    // Emit the item for creation
    emit('item-created', itemData)
  } catch (error) {
    console.error('Error preparing item data:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>