<template>
  <DialogContent class="sm:max-w-[450px]">
    <DialogHeader>
      <DialogTitle>Update Stock</DialogTitle>
      <DialogDescription>
        Adjust inventory levels for this variant
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 space-y-6">
      <!-- Variant Info -->
      <div class="space-y-2">
        <h3 class="text-sm font-medium">Product Variant</h3>
        <div class="rounded-md border p-3 space-y-2">
          <div class="flex justify-between items-center">
            <div>
              <div class="font-medium">{{ product?.name }}</div>
              <div class="text-sm text-muted-foreground">SKU: {{ variant.sku }}</div>
            </div>
            <Badge 
              :variant="getStockVariant(variant.stock)" 
              class="px-3 py-1"
            >
              {{ variant.stock || 0 }} in stock
            </Badge>
          </div>
          
          <div v-if="variant.attributeValues" class="flex flex-wrap gap-2 mt-1">
            <Badge 
              v-for="(value, key) in variant.attributeValues" 
              :key="key"
              variant="outline"
              class="text-xs"
            >
              {{ formatAttributeName(key) }}: {{ formatAttributeValue(key, value) }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- Stock Adjustment -->
      <div class="space-y-3">
        <div class="mb-4">
          <Label>Adjustment Type</Label>
          <RadioGroup v-model="adjustmentType" class="mt-2 space-y-2">
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="add" id="add-stock" />
              <Label for="add-stock">Add Stock</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="subtract" id="subtract-stock" />
              <Label for="subtract-stock">Subtract Stock</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="set" id="set-stock" />
              <Label for="set-stock">Set Exact Quantity</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div class="space-y-2">
          <Label for="quantity">
            {{ adjustmentType === 'add' ? 'Quantity to Add' : 
               adjustmentType === 'subtract' ? 'Quantity to Subtract' : 
               'New Stock Level' }}
            <span class="text-destructive">*</span>
          </Label>
          <Input 
            id="quantity"
            v-model="quantity"
            type="number"
            min="0"
            placeholder="0"
            :disabled="isSubmitting"
            @keydown.enter="updateStock"
          />
          <p v-if="errors.quantity" class="text-sm text-destructive">{{ errors.quantity }}</p>
        </div>
        
        <div class="space-y-2">
          <Label for="reason">Reason (Optional)</Label>
          <Select v-model="reason" :disabled="isSubmitting">
            <SelectTrigger id="reason">
              <SelectValue placeholder="Select reason for adjustment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purchase">New Purchase/Restock</SelectItem>
              <SelectItem value="return">Customer Return</SelectItem>
              <SelectItem value="damage">Damaged/Defective</SelectItem>
              <SelectItem value="adjustment">Inventory Adjustment</SelectItem>
              <SelectItem value="correction">Error Correction</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div v-if="reason === 'other'" class="space-y-2">
          <Label for="custom-reason">Specify Reason</Label>
          <Input 
            id="custom-reason"
            v-model="customReason"
            placeholder="Specify reason for adjustment"
            :disabled="isSubmitting"
          />
        </div>
        
        <div class="space-y-2">
          <Label for="notes">Notes (Optional)</Label>
          <Textarea 
            id="notes"
            v-model="notes"
            placeholder="Add any additional notes about this adjustment"
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <!-- Preview -->
      <Alert v-if="isValidQuantity">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Stock Change Preview</AlertTitle>
        <AlertDescription>
          <div class="text-sm space-y-1 mt-1">
            <div><span class="font-medium">Current Stock:</span> {{ variant.stock || 0 }}</div>
            <div>
              <span class="font-medium">
                {{ adjustmentType === 'add' ? 'Adding:' : 
                   adjustmentType === 'subtract' ? 'Subtracting:' : 
                   'Setting to:' }}
              </span> 
              {{ quantityNum }}
            </div>
            <div class="font-medium mt-1">
              New Stock Level: {{ newStockLevel }}
            </div>
          </div>
        </AlertDescription>
      </Alert>
      
      <Alert v-else-if="quantity && !isValidQuantity" variant="destructive">
        <AlertTriangle class="h-4 w-4" />
        <AlertTitle>Invalid Quantity</AlertTitle>
        <AlertDescription>
          {{ errors.quantity || 'Please enter a valid quantity' }}
        </AlertDescription>
      </Alert>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')" :disabled="isSubmitting">
        Cancel
      </Button>
      <Button 
        @click="updateStock" 
        :disabled="isSubmitting || !isValidQuantity"
      >
        <Loader2 v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        Update Stock
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Loader2, AlertCircle, AlertTriangle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps({
  variant: {
    type: Object,
    required: true
  },
  product: {
    type: Object,
    default: () => ({})
  },
  attributes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['stock-updated', 'close'])

// State
const adjustmentType = ref('add')
const quantity = ref('')
const reason = ref('purchase')
const customReason = ref('')
const notes = ref('')
const errors = ref({})
const isSubmitting = ref(false)

// Computed properties
const quantityNum = computed(() => {
  return parseInt(quantity.value) || 0
})

const isValidQuantity = computed(() => {
  if (!quantity.value || isNaN(parseInt(quantity.value)) || parseInt(quantity.value) < 0) {
    errors.value.quantity = 'Please enter a valid quantity'
    return false
  }
  
  if (adjustmentType.value === 'subtract' && quantityNum.value > (props.variant.stock || 0)) {
    errors.value.quantity = 'Cannot subtract more than current stock'
    return false
  }
  
  errors.value.quantity = null
  return true
})

const newStockLevel = computed(() => {
  if (!isValidQuantity.value) return props.variant.stock || 0
  
  const currentStock = props.variant.stock || 0
  
  switch (adjustmentType.value) {
    case 'add':
      return currentStock + quantityNum.value
    case 'subtract':
      return Math.max(0, currentStock - quantityNum.value)
    case 'set':
      return quantityNum.value
    default:
      return currentStock
  }
})

// Methods
const getStockVariant = (stock) => {
  if (stock === undefined || stock === null) return 'outline'
  if (stock <= 0) return 'destructive'
  if (stock < 10) return 'warning'
  return 'success'
}

const formatAttributeName = (attributeId) => {
  const attribute = props.attributes.find(attr => attr.id === attributeId)
  return attribute ? attribute.name : attributeId
}

const formatAttributeValue = (attributeId, value) => {
  const attribute = props.attributes.find(attr => attr.id === attributeId)
  
  if (!attribute) return value
  
  if (attribute.type === 'select' || attribute.type === 'multiselect') {
    const option = attribute.options?.find(opt => opt.id === value || opt.value === value)
    return option ? option.label : value
  }
  
  if (attribute.type === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  
  return value
}

const updateStock = async () => {
  if (!isValidQuantity.value) return
  
  isSubmitting.value = true
  
  try {
    // Prepare the stock adjustment data
    const stockAdjustment = {
      type: adjustmentType.value,
      quantity: quantityNum.value,
      reason: reason.value === 'other' ? customReason.value : reason.value,
      notes: notes.value,
      timestamp: new Date().toISOString()
    }
    
    // In a real application, you would save this adjustment to a log
    console.log('Stock adjustment:', stockAdjustment)
    
    // Emit the event with the new stock level
    emit('stock-updated', props.variant, newStockLevel.value)
  } catch (error) {
    console.error('Error updating stock:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>