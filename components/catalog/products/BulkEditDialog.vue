<template>
  <DialogContent class="sm:max-w-2xl">
    <DialogHeader>
      <DialogTitle>Bulk Edit Products</DialogTitle>
      <DialogDescription>
        Update {{ selectedProducts.length }} selected product{{ selectedProducts.length !== 1 ? 's' : '' }}
      </DialogDescription>
    </DialogHeader>

    <div class="overflow-y-auto max-h-[70vh] py-4">
      <div class="space-y-6">
        <!-- Field selection -->
        <div class="border rounded-md p-4 bg-muted/20">
          <h3 class="text-sm font-medium mb-2">What would you like to update?</h3>
          <p class="text-sm text-muted-foreground mb-3">
            Select which fields to modify. Unselected fields will remain unchanged.
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="edit-status" 
                v-model:checked="fieldSelection.status"
              />
              <Label for="edit-status">Status</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="edit-price" 
                v-model:checked="fieldSelection.price"
              />
              <Label for="edit-price">Price</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="edit-categories" 
                v-model:checked="fieldSelection.categories"
              />
              <Label for="edit-categories">Categories</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="edit-stock" 
                v-model:checked="fieldSelection.stock"
              />
              <Label for="edit-stock">Stock</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="edit-visibility" 
                v-model:checked="fieldSelection.visibility"
              />
              <Label for="edit-visibility">Visibility</Label>
            </div>
          </div>
        </div>

        <!-- Status update section -->
        <div v-if="fieldSelection.status" class="space-y-3 border-b pb-5">
          <h3 class="text-sm font-medium">Update Status</h3>
          <div class="space-y-3">
            <Select v-model="updates.status">
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            
            <div v-if="updates.status === 'out_of_stock' || updates.status === 'archived'" class="space-y-2">
              <Label for="status-reason">Reason</Label>
              <Textarea
                id="status-reason"
                v-model="updates.statusReason"
                placeholder="Reason for status change"
                rows="2"
              />
            </div>
          </div>
        </div>

        <!-- Price update section -->
        <div v-if="fieldSelection.price" class="space-y-3 border-b pb-5">
          <h3 class="text-sm font-medium">Update Price</h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <RadioGroup v-model="priceUpdateType" class="flex space-x-4">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed-price" />
                  <Label for="fixed-price">Set fixed price</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="percentage-price" />
                  <Label for="percentage-price">Percentage change</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="amount" id="amount-price" />
                  <Label for="amount-price">Amount change</Label>
                </div>
              </RadioGroup>
            </div>

            <div v-if="priceUpdateType === 'fixed'" class="space-y-2">
              <Label for="price-fixed">New Price ($)</Label>
              <Input
                id="price-fixed"
                v-model="updates.price.value"
                type="number"
                step="0.01"
                min="0"
              />
            </div>

            <div v-if="priceUpdateType === 'percentage'" class="space-y-2">
              <Label for="price-percentage">Percentage Change (%)</Label>
              <div class="flex items-center space-x-2">
                <Select v-model="updates.price.direction">
                  <SelectTrigger class="w-[120px]">
                    <SelectValue placeholder="Change" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">Increase</SelectItem>
                    <SelectItem value="decrease">Decrease</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="price-percentage"
                  v-model="updates.price.value"
                  type="number"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>

            <div v-if="priceUpdateType === 'amount'" class="space-y-2">
              <Label for="price-amount">Amount Change ($)</Label>
              <div class="flex items-center space-x-2">
                <Select v-model="updates.price.direction">
                  <SelectTrigger class="w-[120px]">
                    <SelectValue placeholder="Change" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">Increase</SelectItem>
                    <SelectItem value="decrease">Decrease</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="price-amount"
                  v-model="updates.price.value"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div v-if="priceUpdateType !== 'fixed'" class="border rounded-md p-2 bg-muted/30">
              <h4 class="text-xs font-medium mb-1">Sample Price Changes</h4>
              <div class="text-xs space-y-1">
                <div class="flex justify-between">
                  <span>$10.00 → </span>
                  <span class="font-medium">{{ calculateSamplePrice(10.00) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>$25.00 → </span>
                  <span class="font-medium">{{ calculateSamplePrice(25.00) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>$99.99 → </span>
                  <span class="font-medium">{{ calculateSamplePrice(99.99) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Categories update section -->
        <div v-if="fieldSelection.categories" class="space-y-3 border-b pb-5">
          <h3 class="text-sm font-medium">Update Categories</h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <RadioGroup v-model="categoryUpdateType" class="flex space-x-4">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="replace" id="replace-categories" />
                  <Label for="replace-categories">Replace all</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="add" id="add-categories" />
                  <Label for="add-categories">Add categories</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="remove" id="remove-categories" />
                  <Label for="remove-categories">Remove categories</Label>
                </div>
              </RadioGroup>
            </div>

            <div class="border rounded-md p-2 max-h-40 overflow-y-auto">
              <div v-for="category in categories" :key="category.id" class="flex items-center space-x-2 py-1">
                <Checkbox 
                  :id="`category-${category.id}`"
                  v-model:checked="updates.categories[category.id]"
                />
                <Label :for="`category-${category.id}`" class="text-sm">{{ category.name }}</Label>
              </div>
            </div>
          </div>
        </div>

        <!-- Stock update section -->
        <div v-if="fieldSelection.stock" class="space-y-3 border-b pb-5">
          <h3 class="text-sm font-medium">Update Stock</h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <RadioGroup v-model="stockUpdateType" class="flex space-x-4">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="set" id="set-stock" />
                  <Label for="set-stock">Set quantity</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="adjust" id="adjust-stock" />
                  <Label for="adjust-stock">Adjust quantity</Label>
                </div>
              </RadioGroup>
            </div>

            <div v-if="stockUpdateType === 'set'" class="space-y-2">
              <Label for="stock-quantity">New Quantity</Label>
              <Input
                id="stock-quantity"
                v-model="updates.stock.quantity"
                type="number"
                min="0"
              />
            </div>

            <div v-if="stockUpdateType === 'adjust'" class="space-y-2">
              <Label for="stock-adjust">Adjust Quantity</Label>
              <div class="flex items-center space-x-2">
                <Select v-model="updates.stock.direction">
                  <SelectTrigger class="w-[120px]">
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">Increase</SelectItem>
                    <SelectItem value="decrease">Decrease</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="stock-adjust"
                  v-model="updates.stock.value"
                  type="number"
                  min="0"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="update-backorder"
                  v-model:checked="updates.stock.updateBackorder"
                />
                <Label for="update-backorder">Update backorder setting</Label>
              </div>
              
              <div v-if="updates.stock.updateBackorder" class="flex items-center space-x-2 ml-6">
                <Switch id="backorder" v-model="updates.stock.backorder" />
                <Label for="backorder">Allow backorders</Label>
              </div>
            </div>
          </div>
        </div>

        <!-- Visibility update section -->
        <div v-if="fieldSelection.visibility" class="space-y-3">
          <h3 class="text-sm font-medium">Update Visibility</h3>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="update-webstore"
                v-model:checked="updates.visibility.updateWebstore"
              />
              <Label for="update-webstore">Web store</Label>
            </div>
            <div v-if="updates.visibility.updateWebstore" class="ml-6">
              <div class="flex items-center space-x-2">
                <Switch id="webstore" v-model="updates.visibility.webstore" />
                <Label for="webstore">Show in web store</Label>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <Checkbox 
                id="update-b2b"
                v-model:checked="updates.visibility.updateB2b"
              />
              <Label for="update-b2b">B2B portal</Label>
            </div>
            <div v-if="updates.visibility.updateB2b" class="ml-6">
              <div class="flex items-center space-x-2">
                <Switch id="b2b" v-model="updates.visibility.b2bPortal" />
                <Label for="b2b">Show in B2B portal</Label>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <Checkbox 
                id="update-marketplace"
                v-model:checked="updates.visibility.updateMarketplace"
              />
              <Label for="update-marketplace">Marketplace</Label>
            </div>
            <div v-if="updates.visibility.updateMarketplace" class="ml-6">
              <div class="flex items-center space-x-2">
                <Switch id="marketplace" v-model="updates.visibility.marketplace" />
                <Label for="marketplace">Show in marketplace</Label>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning alert for significant changes -->
        <Alert v-if="showWarning" variant="warning">
          <AlertTriangleIcon class="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{{ warningMessage }}</AlertDescription>
        </Alert>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="onCancel">Cancel</Button>
      <Button 
        @click="applyChanges" 
        :disabled="isSubmitting || !hasSelectedFields"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Update {{ selectedProducts.length }} Product{{ selectedProducts.length !== 1 ? 's' : '' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import {
  AlertTriangleIcon,
  Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  selectedProducts: {
    type: Array,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update', 'cancel'])

// Field selection
const fieldSelection = reactive({
  status: false,
  price: false,
  categories: false,
  stock: false,
  visibility: false
})

// Update types
const priceUpdateType = ref('fixed')
const categoryUpdateType = ref('replace')
const stockUpdateType = ref('set')

// Form state
const isSubmitting = ref(false)

// Updates model
const updates = reactive({
  status: '',
  statusReason: '',
  price: {
    value: '',
    direction: 'increase',
    type: computed(() => priceUpdateType.value)
  },
  categories: {},
  stock: {
    quantity: '',
    value: '',
    direction: 'increase',
    type: computed(() => stockUpdateType.value),
    updateBackorder: false,
    backorder: false
  },
  visibility: {
    updateWebstore: false,
    webstore: true,
    updateB2b: false,
    b2bPortal: false,
    updateMarketplace: false,
    marketplace: false
  }
})

// Initialize category checkboxes
props.categories.forEach(category => {
  updates.categories[category.id] = false
})

// Computed properties
const hasSelectedFields = computed(() => {
  return Object.values(fieldSelection).some(selected => selected)
})

const showWarning = computed(() => {
  // Warning for status changes to archived
  if (fieldSelection.status && updates.status === 'archived') {
    return true
  }
  
  // Warning for price decreases
  if (fieldSelection.price && 
      ((priceUpdateType.value === 'percentage' || priceUpdateType.value === 'amount') && 
       updates.price.direction === 'decrease') || 
      (priceUpdateType.value === 'fixed' && parseFloat(updates.price.value) < 5)
     ) {
    return true
  }
  
  // Warning for stock decreases
  if (fieldSelection.stock && 
      stockUpdateType.value === 'adjust' && 
      updates.stock.direction === 'decrease' && 
      parseInt(updates.stock.value) > 0) {
    return true
  }
  
  return false
})

const warningMessage = computed(() => {
  if (fieldSelection.status && updates.status === 'archived') {
    return `You are about to archive ${props.selectedProducts.length} product${props.selectedProducts.length !== 1 ? 's' : ''}. This will hide them from all sales channels.`
  }
  
  if (fieldSelection.price) {
    if ((priceUpdateType.value === 'percentage' || priceUpdateType.value === 'amount') && 
        updates.price.direction === 'decrease') {
      return `You are about to decrease prices across ${props.selectedProducts.length} product${props.selectedProducts.length !== 1 ? 's' : ''}.`
    }
    if (priceUpdateType.value === 'fixed' && parseFloat(updates.price.value) < 5) {
      return `You are setting a low price ($${updates.price.value}) for all selected products.`
    }
  }
  
  if (fieldSelection.stock && 
      stockUpdateType.value === 'adjust' && 
      updates.stock.direction === 'decrease') {
    return `You are reducing inventory levels by ${updates.stock.value} units for ${props.selectedProducts.length} product${props.selectedProducts.length !== 1 ? 's' : ''}.`
  }
  
  return ''
})

// Helper functions
function calculateSamplePrice(originalPrice) {
  let newPrice = originalPrice
  
  if (priceUpdateType.value === 'percentage') {
    const change = originalPrice * (parseFloat(updates.price.value) / 100)
    if (updates.price.direction === 'increase') {
      newPrice = originalPrice + change
    } else {
      newPrice = originalPrice - change
    }
  } else if (priceUpdateType.value === 'amount') {
    const change = parseFloat(updates.price.value)
    if (updates.price.direction === 'increase') {
      newPrice = originalPrice + change
    } else {
      newPrice = originalPrice - change
    }
  }
  
  // Ensure price doesn't go below zero
  newPrice = Math.max(0, newPrice)
  
  return `$${newPrice.toFixed(2)}`
}

// Build final updates object based on selections
function buildUpdates() {
  const result = {}
  
  // Status update
  if (fieldSelection.status) {
    result.status = updates.status
    if ((updates.status === 'archived' || updates.status === 'out_of_stock') && updates.statusReason) {
      result.statusReason = updates.statusReason
    }
  }
  
  // Price update
  if (fieldSelection.price) {
    result.price = {
      type: priceUpdateType.value,
      value: parseFloat(updates.price.value)
    }
    
    if (priceUpdateType.value !== 'fixed') {
      result.price.direction = updates.price.direction
    }
  }
  
  // Categories update
  if (fieldSelection.categories) {
    const selectedCategoryIds = Object.entries(updates.categories)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => parseInt(id))
    
    result.categories = {
      type: categoryUpdateType.value,
      ids: selectedCategoryIds
    }
  }
  
  // Stock update
  if (fieldSelection.stock) {
    result.stock = {
      type: stockUpdateType.value
    }
    
    if (stockUpdateType.value === 'set') {
      result.stock.quantity = parseInt(updates.stock.quantity)
    } else {
      result.stock.value = parseInt(updates.stock.value)
      result.stock.direction = updates.stock.direction
    }
    
    if (updates.stock.updateBackorder) {
      result.stock.backorder = updates.stock.backorder
    }
  }
  
  // Visibility update
  if (fieldSelection.visibility) {
    result.visibility = {}
    
    if (updates.visibility.updateWebstore) {
      result.visibility.webstore = updates.visibility.webstore
    }
    
    if (updates.visibility.updateB2b) {
      result.visibility.b2bPortal = updates.visibility.b2bPortal
    }
    
    if (updates.visibility.updateMarketplace) {
      result.visibility.marketplace = updates.visibility.marketplace
    }
  }
  
  return result
}

// Actions
async function applyChanges() {
  if (!hasSelectedFields.value) return
  
  isSubmitting.value = true
  
  try {
    const updates = buildUpdates()
    
    // Add product IDs
    const productIds = props.selectedProducts.map(product => 
      typeof product === 'object' ? product.id : product
    )
    
    emit('update', { productIds, updates })
  } catch (error) {
    console.error('Error applying bulk updates:', error)
  } finally {
    isSubmitting.value = false
  }
}

function onCancel() {
  emit('cancel')
}
</script>