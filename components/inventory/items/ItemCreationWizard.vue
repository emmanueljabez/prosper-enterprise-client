<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 overflow-y-auto px-6 pt-4 pb-4 space-y-6 min-h-0">
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
                  <Label for="itemCode">Item Code *</Label>
                  <Input
                    id="itemCode"
                    v-model="formData.itemCode"
                    placeholder="Enter unique item code"
                    :class="{ 'border-red-500': errors.itemCode }"
                  />
                  <p v-if="errors.itemCode" class="text-sm text-red-500">{{ errors.itemCode }}</p>
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
                  v-model="formData.name"
                  placeholder="Enter item name"
                  :class="{ 'border-red-500': errors.name }"
                />
                <p v-if="errors.name" class="text-sm text-red-500">{{ errors.name }}</p>
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
                  <Label for="category">Category *</Label>
                  <Select v-model="formData.categoryId">
                    <SelectTrigger :class="{ 'border-red-500': errors.categoryId }">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="category in props.categories" :key="category.id" :value="category.id.toString()">
                        {{ category.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-if="errors.categoryId" class="text-sm text-red-500">{{ errors.categoryId }}</p>
                </div>
                <div class="space-y-2">
                  <Label for="unitOfMeasure">Unit of Measure *</Label>
                  <Select v-model="formData.unitOfMeasureId">
                    <SelectTrigger :class="{ 'border-red-500': errors.unitOfMeasureId }">
                      <SelectValue placeholder="Select UOM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="uom in props.units" :key="uom.id" :value="uom.id.toString()">
                        {{ uom.name }} ({{ uom.code }})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-if="errors.unitOfMeasureId" class="text-sm text-red-500">{{ errors.unitOfMeasureId }}</p>
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
                  <Label for="listPrice">List Price</Label>
                  <Input
                    id="listPrice"
                    v-model="formData.listPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="wholesalePrice">Wholesale Price</Label>
                  <Input
                    id="wholesalePrice"
                    v-model="formData.wholesalePrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="retailPrice">Retail Price</Label>
                  <Input
                    id="retailPrice"
                    v-model="formData.retailPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label>Pricing Configuration</Label>
                <div class="space-y-2">
                  <div class="flex items-center space-x-2">
                    <Checkbox id="taxable" v-model:checked="formData.isTaxable" />
                    <Label for="taxable">Taxable item</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox id="priceIncludesTax" v-model:checked="formData.priceIncludesTax" />
                    <Label for="priceIncludesTax">Price includes tax</Label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Inventory Settings -->
            <div v-else-if="currentStep === 2" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="initialStock">Initial Stock Quantity</Label>
                  <Input
                    id="initialStock"
                    v-model="formData.initialStock"
                    type="number"
                    placeholder="0"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    v-model="formData.reorderPoint"
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="reorderQuantity">Reorder Quantity</Label>
                  <Input
                    id="reorderQuantity"
                    v-model="formData.reorderQuantity"
                    type="number"
                    placeholder="0"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="maxStock">Maximum Stock</Label>
                  <Input
                    id="maxStock"
                    v-model="formData.maxStock"
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label>Stock Management</Label>
                <div class="space-y-2">
                  <div class="flex items-center space-x-2">
                    <Checkbox id="trackStock" v-model:checked="formData.trackStock" />
                    <Label for="trackStock">Track stock levels</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox id="allowNegativeStock" v-model:checked="formData.allowNegativeStock" />
                    <Label for="allowNegativeStock">Allow negative stock</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox id="serialTracked" v-model:checked="formData.isSerialTracked" />
                    <Label for="serialTracked">Serial number tracking</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox id="lotTracked" v-model:checked="formData.isLotTracked" />
                    <Label for="lotTracked">Lot/Batch tracking</Label>
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
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="lb">Pounds (lb)</SelectItem>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="oz">Ounces (oz)</SelectItem>
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
import { CheckIcon, ChevronRight, ChevronLeft, Loader2 } from 'lucide-vue-next'
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
const emit = defineEmits(['item-created', 'close'])

// Props
const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  units: {
    type: Array,
    default: () => []
  }
})

// State
const currentStep = ref(0)
const creating = ref(false)
const errors = reactive({})

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
  itemCode: '',
  name: '',
  description: '',
  barcode: '',
  categoryId: '',
  unitOfMeasureId: '',
  standardCost: null,
  listPrice: null,
  wholesalePrice: null,
  retailPrice: null,
  isTaxable: true,
  priceIncludesTax: false,
  initialStock: 0,
  reorderPoint: 0,
  reorderQuantity: 0,
  maxStock: null,
  trackStock: true,
  allowNegativeStock: false,
  isSerialTracked: false,
  isLotTracked: false,
  weight: null,
  weightUnit: '',
  length: null,
  width: null,
  height: null,
  notes: '',
  isActive: true
})

// Mock data - should come from stores  
// Computed
const isFormValid = computed(() => {
  return formData.itemCode && formData.name && formData.categoryId && formData.unitOfMeasureId
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
    if (!formData.itemCode) {
      errors.itemCode = 'Item code is required'
    }
    if (!formData.name) {
      errors.name = 'Item name is required'
    }
    if (!formData.categoryId) {
      errors.categoryId = 'Category is required'
    }
    if (!formData.unitOfMeasureId) {
      errors.unitOfMeasureId = 'Unit of measure is required'
    }
  }

  return Object.keys(errors).length === 0
}

const createItem = async () => {
  if (!validateCurrentStep()) return

  creating.value = true
  try {
    const itemData = {
      itemCode: formData.itemCode,
      itemName: formData.name, // Map name to itemName
      description: formData.description || undefined,
      categoryId: parseInt(formData.categoryId),
      baseUnitOfMeasureId: parseInt(formData.unitOfMeasureId), // Map unitOfMeasureId to baseUnitOfMeasureId
      barcode: formData.barcode || undefined,
      standardCost: parseFloat(formData.standardCost) || undefined,
      sellingPrice: parseFloat(formData.listPrice) || undefined, // Map listPrice to sellingPrice
      minStockLevel: parseInt(formData.minStock) || undefined, // Map minStock to minStockLevel
      maxStockLevel: parseInt(formData.maxStock) || undefined, // Map maxStock to maxStockLevel
      reorderPoint: parseInt(formData.reorderPoint) || undefined,
      reorderQuantity: parseInt(formData.reorderQuantity) || undefined,
      trackSerialNumber: formData.isSerialTracked, // Map isSerialTracked to trackSerialNumber
      trackLotNumber: formData.isLotTracked, // Map isLotTracked to trackLotNumber
      weight: parseFloat(formData.weight) || undefined,
      length: parseFloat(formData.length) || undefined,
      width: parseFloat(formData.width) || undefined,
      height: parseFloat(formData.height) || undefined,
      notes: formData.notes || undefined,
      isActive: formData.isActive
    }

    emit('item-created', itemData)
  } catch (error) {
    console.error('Error creating item:', error)
  } finally {
    creating.value = false
  }
}
</script>
