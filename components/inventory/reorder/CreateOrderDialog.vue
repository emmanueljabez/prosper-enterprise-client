<template>
  <DialogContent class="sm:max-w-[700px] max-h-[90vh] flex flex-col">
    <DialogHeader class="flex-shrink-0">
      <DialogTitle>Create Purchase Order</DialogTitle>
      <DialogDescription>
        Generate a purchase order for the selected reorder suggestion.
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-4 space-y-4 overflow-y-auto flex-grow">
      <!-- Item Info -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">Item Details</h3>
          <Badge>{{ reorderData.priority }}</Badge>
        </div>
        
        <div class="rounded-lg border bg-card p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-muted-foreground">Item Name</div>
              <div class="font-medium">{{ reorderData.itemName }}</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">SKU</div>
              <div class="font-medium">{{ reorderData.sku }}</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Current Stock</div>
              <div class="font-medium">{{ reorderData.currentStock }}</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Reorder Point</div>
              <div class="font-medium">{{ reorderData.reorderPoint }}</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Location</div>
              <div class="font-medium">{{ reorderData.locationName }}</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Suggested Quantity</div>
              <div class="font-medium">{{ reorderData.suggestedQuantity }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Order Details -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium">Order Details</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="supplier">Supplier</Label>
            <Select 
              v-model="orderData.supplierId" 
              @update:modelValue="handleSupplierChange"
            >
              <SelectTrigger id="supplier">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select a supplier</SelectItem>
                <SelectGroup>
                  <SelectLabel>Preferred Suppliers</SelectLabel>
                  <SelectItem 
                    v-for="supplier in preferredSuppliers" 
                    :key="supplier.id" 
                    :value="supplier.id"
                  >
                    {{ supplier.name }} ⭐
                  </SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Other Suppliers</SelectLabel>
                  <SelectItem 
                    v-for="supplier in otherSuppliers" 
                    :key="supplier.id" 
                    :value="supplier.id"
                  >
                    {{ supplier.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="delivery-date">Expected Delivery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="delivery-date"
                  variant="outline"
                  :class="[
                    'w-full justify-start text-left font-normal',
                    !orderData.expectedDeliveryDate && 'text-muted-foreground'
                  ]"
                >
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ orderData.expectedDeliveryDate ? formatDate(orderData.expectedDeliveryDate) : 'Select date' }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar 
                  v-model="orderData.expectedDeliveryDate" 
                  :disabled-date="isDateDisabled"
                />
              </PopoverContent>
            </Popover>
            <div v-if="selectedSupplier" class="text-xs text-muted-foreground">
              Lead time: {{ selectedSupplier.leadTime }} days
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="order-quantity">Order Quantity</Label>
            <Input 
              id="order-quantity"
              v-model="orderData.quantity"
              type="number"
              min="1"
              step="1"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="unit-price">Unit Price</Label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
              <Input 
                id="unit-price"
                v-model="orderData.unitPrice"
                type="number"
                min="0.01"
                step="0.01"
                class="pl-7"
              />
            </div>
          </div>
        </div>
        
        <div class="space-y-2">
          <Label for="notes">Order Notes</Label>
          <Textarea 
            id="notes"
            v-model="orderData.notes"
            placeholder="Add any special instructions or notes for this order"
          />
        </div>
      </div>
      
      <!-- Order Summary -->
      <div class="space-y-2">
        <h3 class="text-lg font-medium">Order Summary</h3>
        
        <div class="rounded-lg border bg-card p-4 space-y-2">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>{{ formatCurrency(calculateSubtotal()) }}</span>
          </div>
          <div v-if="calculatedTax > 0" class="flex justify-between">
            <span>Estimated Tax</span>
            <span>{{ formatCurrency(calculatedTax) }}</span>
          </div>
          <div v-if="calculatedShipping > 0" class="flex justify-between">
            <span>Estimated Shipping</span>
            <span>{{ formatCurrency(calculatedShipping) }}</span>
          </div>
          <Separator />
          <div class="flex justify-between font-medium">
            <span>Total</span>
            <span>{{ formatCurrency(calculateTotal()) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Error message -->
      <div v-if="error" class="text-sm text-destructive">
        {{ error }}
      </div>
    </div>
    
    <DialogFooter class="flex-shrink-0">
      <Button variant="outline" @click="close">Cancel</Button>
      <Button type="submit" @click="createOrder">Create Purchase Order</Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
// Fix the setup function to handle potentially undefined props safely
import { ref, reactive, computed, watch } from 'vue'
import { CalendarIcon } from 'lucide-vue-next'
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps({
  reorderSuggestion: { 
    type: Object, 
    // Provide a default empty object to prevent undefined errors
    default: () => ({}) 
  },
  suppliers: { type: Array, default: () => [] },
  itemDetails: { type: Object, default: null },
  taxRate: { type: Number, default: 0.0 },
  estimateShipping: { type: Boolean, default: true }
})

const emit = defineEmits(['create-order', 'close'])

// Extract reorder data with null checks and optional chaining
const reorderData = reactive({
  itemId: props.reorderSuggestion?.itemId || '',
  itemName: props.reorderSuggestion?.itemName || '',
  sku: props.reorderSuggestion?.sku || '',
  currentStock: props.reorderSuggestion?.currentStock || 0,
  reorderPoint: props.reorderSuggestion?.reorderPoint || 0,
  suggestedQuantity: props.reorderSuggestion?.suggestedQuantity || 0,
  locationId: props.reorderSuggestion?.locationId || '',
  locationName: props.reorderSuggestion?.locationName || '',
  priority: props.reorderSuggestion?.priority || 'medium',
  triggeredByRuleId: props.reorderSuggestion?.triggeredByRuleId || null,
  estimatedCost: props.reorderSuggestion?.estimatedCost || 0,
})

// Get suppliers
const preferredSuppliers = computed(() => {
  return props.suppliers.filter(supplier => 
    supplier.status === 'active' && supplier.rating >= 4
  )
})

const otherSuppliers = computed(() => {
  return props.suppliers.filter(supplier => 
    supplier.status === 'active' && supplier.rating < 4
  )
})

// Selected supplier
const selectedSupplier = computed(() => {
  if (!orderData.supplierId || orderData.supplierId === 'none') return null
  return props.suppliers.find(supplier => supplier.id === orderData.supplierId)
})

// Initialize order data with null checks
const orderData = reactive({
  supplierId: props.reorderSuggestion?.preferredSupplierId || 'none',
  quantity: props.reorderSuggestion?.suggestedQuantity || 0,
  unitPrice: ((props.itemDetails?.lastPurchasePrice || 
              (props.reorderSuggestion?.estimatedCost || 0) / 
              (props.reorderSuggestion?.suggestedQuantity || 1) || 0)).toFixed(2),
  expectedDeliveryDate: null,
  notes: '',
})

// Error state
const error = ref('')

// Calculate shipping based on order total and supplier
const calculatedShipping = computed(() => {
  if (!props.estimateShipping || !selectedSupplier.value) return 0
  
  const subtotal = calculateSubtotal()
  
  // Use supplier's minimum order value as reference
  const minOrderValue = selectedSupplier.value.minOrderValue || 0
  
  // Simple shipping calculation logic
  if (subtotal >= minOrderValue) {
    return 0 // Free shipping
  } else {
    // Basic shipping calculation - could be more complex in real app
    return Math.min(15, subtotal * 0.1) // 10% of order or max $15
  }
})

// Calculate tax
const calculatedTax = computed(() => {
  return calculateSubtotal() * props.taxRate
})

// Helper functions
const calculateSubtotal = () => {
  return orderData.quantity * parseFloat(orderData.unitPrice)
}

const calculateTotal = () => {
  return calculateSubtotal() + calculatedTax.value + calculatedShipping.value
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(value)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  })
}

const isDateDisabled = (date) => {
  // Can't select dates in the past
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

// Handle supplier change
const handleSupplierChange = (supplierId) => {
  if (!supplierId || supplierId === 'none') return
  
  // Find selected supplier
  const supplier = props.suppliers.find(s => s.id === supplierId)
  if (supplier) {
    // Update expected delivery date based on lead time
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + (supplier.leadTime || 7))
    orderData.expectedDeliveryDate = deliveryDate
  }
}

// Set initial supplier if available
watch(() => props.reorderSuggestion, (newVal) => {
  if (newVal.preferredSupplierId) {
    orderData.supplierId = newVal.preferredSupplierId
    handleSupplierChange(newVal.preferredSupplierId)
  } else if (preferredSuppliers.value.length > 0) {
    // Default to first preferred supplier
    orderData.supplierId = preferredSuppliers.value[0].id
    handleSupplierChange(preferredSuppliers.value[0].id)
  }
}, { immediate: true })

// Form validation
const validateForm = () => {
  if (!orderData.supplierId || orderData.supplierId === 'none') {
    error.value = 'Please select a supplier'
    return false
  }
  
  if (!orderData.quantity || orderData.quantity <= 0) {
    error.value = 'Order quantity must be greater than 0'
    return false
  }
  
  if (!orderData.unitPrice || parseFloat(orderData.unitPrice) <= 0) {
    error.value = 'Unit price must be greater than 0'
    return false
  }
  
  if (!orderData.expectedDeliveryDate) {
    error.value = 'Please select an expected delivery date'
    return false
  }
  
  return true
}

// Event handlers
const createOrder = () => {
  error.value = ''
  
  if (!validateForm()) {
    return
  }
  
  const orderDetails = {
    // Suggestion data
    reorderSuggestionId: props.reorderSuggestion.id,
    triggeredByRuleId: reorderData.triggeredByRuleId,
    
    // Item data
    itemId: reorderData.itemId,
    itemName: reorderData.itemName,
    sku: reorderData.sku,
    locationId: reorderData.locationId,
    
    // Order specifics
    supplierId: orderData.supplierId,
    supplierName: selectedSupplier.value?.name || '',
    quantity: parseInt(orderData.quantity),
    unitPrice: parseFloat(orderData.unitPrice),
    subtotal: calculateSubtotal(),
    tax: calculatedTax.value,
    shipping: calculatedShipping.value,
    total: calculateTotal(),
    expectedDeliveryDate: orderData.expectedDeliveryDate,
    notes: orderData.notes,
    
    // Metadata
    createdAt: new Date().toISOString(),
    status: 'draft'
  }
  
  emit('create-order', orderDetails)
}

const close = () => {
  emit('close')
}
</script>