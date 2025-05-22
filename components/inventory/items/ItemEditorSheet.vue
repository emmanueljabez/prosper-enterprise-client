<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="border-b p-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Edit Item</h2>
        <Button variant="ghost" size="icon" @click="$emit('close')">
          <XIcon class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </Button>
      </div>
      <p class="text-sm text-muted-foreground">
        Edit inventory item details, attributes, and settings
      </p>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- Basic Information Section -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium">Basic Information</h3>
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
            <Input 
              id="item-upc" 
              v-model="formData.upc" 
              placeholder="Enter barcode if applicable" 
            />
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

      <!-- Categories and Attributes Section -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium">Categories & Attributes</h3>
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

      <!-- Inventory Settings Section -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium">Inventory Settings</h3>
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
          <div class="space-y-2">
            <Label for="item-status">Status</Label>
            <Select v-model="formData.status">
              <SelectTrigger id="item-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="border rounded-md p-4 space-y-4">
          <h4 class="font-medium">Reorder Settings</h4>
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

      <!-- Location Assignments Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">Location Assignments</h3>
          <Badge variant="outline">
            Total Stock: {{ getTotalStock() }} {{ formData.unitOfMeasure }}
          </Badge>
        </div>
        
        <p class="text-sm text-muted-foreground">
          Current inventory distribution across locations. To adjust stock levels, use the "Adjust Stock" feature.
        </p>
        
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Bin</TableHead>
                <TableHead class="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="formData.locations.length === 0">
                <TableCell colSpan="3" class="text-center py-6 text-muted-foreground">
                  No location assignments found
                </TableCell>
              </TableRow>
              <TableRow v-for="(location, index) in formData.locations" :key="index">
                <TableCell>
                  <div class="font-medium">{{ getLocationName(location.id) }}</div>
                </TableCell>
                <TableCell>{{ location.bin || '-' }}</TableCell>
                <TableCell class="text-right">{{ location.quantity }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <div class="text-sm text-muted-foreground">
          <InfoIcon class="inline-block h-4 w-4 mr-1" />
          Stock adjustments, transfers between locations, and bin changes must be done through the inventory operations.
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t p-4">
      <div class="flex justify-between">
        <Button
          variant="outline"
          @click="$emit('close')"
        >
          Cancel
        </Button>
        <div class="flex space-x-2">
          <Button
            @click="saveItem"
            :disabled="isSubmitting"
          >
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import {
  InfoIcon,
  Loader2Icon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
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

const emit = defineEmits(['item-updated', 'close'])

// Form data
const formData = reactive({
  id: '',
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
  stockOnHand: 0,
  stockCommitted: 0,
  stockAvailable: 0,
  unitOfMeasure: 'each',
  dimensions: {
    weight: null,
    length: null,
    width: null,
    height: null,
    weightUnit: 'lb',
    dimensionUnit: 'in'
  },
  locations: [],
  createdAt: '',
  updatedAt: ''
})

// Form validation errors
const errors = reactive({
  name: '',
  sku: '',
  categoryId: '',
  cost: ''
})

// Submission state
const isSubmitting = ref(false)

// Initialize form data from props
onMounted(() => {
  if (props.item) {
    // Clone the item to avoid modifying the original
    const itemCopy = JSON.parse(JSON.stringify(props.item))
    
    // Ensure dimensions object exists
    if (!itemCopy.dimensions) {
      itemCopy.dimensions = {
        weight: null,
        length: null,
        width: null,
        height: null,
        weightUnit: 'lb',
        dimensionUnit: 'in'
      }
    }
    
    // Update form data
    Object.keys(formData).forEach(key => {
      if (key in itemCopy) {
        formData[key] = itemCopy[key]
      }
    })
  }
})

// Helper methods
const getLocationName = (locationId) => {
  const location = props.locations.find(l => l.id === locationId)
  return location ? location.name : 'Unknown Location'
}

const getTotalStock = () => {
  return formData.locations.reduce((total, loc) => total + (Number(loc.quantity) || 0), 0)
}

// Validation
const validateForm = () => {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  if (!formData.name.trim()) {
    errors.name = 'Item name is required'
    isValid = false
  }
  
  if (!formData.sku.trim()) {
    errors.sku = 'SKU is required'
    isValid = false
  }
  
  if (!formData.categoryId) {
    errors.categoryId = 'Category is required'
    isValid = false
  }
  
  if (formData.cost === null || formData.cost === undefined || formData.cost < 0) {
    errors.cost = 'Cost must be a positive number'
    isValid = false
  }
  
  return isValid
}

// Form submission
const saveItem = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Calculate stock totals from locations
    const stockOnHand = getTotalStock()
    
    // Prepare data for submission
    const updatedItem = {
      ...formData,
      stockOnHand,
      stockAvailable: stockOnHand - formData.stockCommitted
    }
    
    // Emit the updated item
    emit('item-updated', updatedItem)
  } catch (error) {
    console.error('Error preparing item data:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>