<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle class="flex items-center space-x-2">
        <Package class="h-5 w-5" />
        <span>Stock Adjustment</span>
      </DialogTitle>
      <DialogDescription>
        Adjust stock levels for {{ item?.name || 'selected item' }}
      </DialogDescription>
    </DialogHeader>

    <div v-if="item" class="space-y-6">
      <!-- Current Stock Info -->
      <div class="bg-muted/50 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium">{{ item.name }}</span>
          <Badge variant="outline">{{ item.itemCode }}</Badge>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">Current Stock:</span>
          <span class="text-lg font-semibold">{{ formatNumber(item.stockOnHand || 0) }} {{ item.unitOfMeasureName }}</span>
        </div>
      </div>

      <form @submit.prevent="createAdjustment" class="space-y-4">
        <!-- Adjustment Type -->
        <div class="space-y-2">
          <Label for="adjustmentType">Adjustment Type *</Label>
          <Select v-model="formData.adjustmentType" required>
            <SelectTrigger :class="{ 'border-red-500': errors.adjustmentType }">
              <SelectValue placeholder="Select adjustment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN">Stock In</SelectItem>
              <SelectItem value="OUT">Stock Out</SelectItem>
              <SelectItem value="ADJUSTMENT">Manual Adjustment</SelectItem>
              <SelectItem value="TRANSFER_IN">Transfer In</SelectItem>
              <SelectItem value="TRANSFER_OUT">Transfer Out</SelectItem>
              <SelectItem value="COUNT">Cycle Count</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.adjustmentType" class="text-sm text-red-500">{{ errors.adjustmentType }}</p>
        </div>

        <!-- Quantity Input -->
        <div class="space-y-2">
          <Label for="quantity">
            {{ getQuantityLabel() }} *
          </Label>
          <div class="flex space-x-2">
            <Input
              id="quantity"
              v-model="formData.quantity"
              type="number"
              step="0.01"
              placeholder="0"
              class="flex-1"
              :class="{ 'border-red-500': errors.quantity }"
              required
            />
            <div class="flex items-center px-3 bg-muted rounded-md min-w-[60px] justify-center">
              <span class="text-sm text-muted-foreground">{{ item.unitOfMeasureName || 'UNIT' }}</span>
            </div>
          </div>
          <p v-if="errors.quantity" class="text-sm text-red-500">{{ errors.quantity }}</p>
        </div>

        <!-- New Stock Level Preview -->
        <div v-if="formData.quantity && formData.adjustmentType" class="bg-blue-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-blue-900">New Stock Level:</span>
            <span class="text-lg font-semibold text-blue-900">
              {{ formatNumber(getNewStockLevel()) }} {{ item.unitOfMeasureName }}
            </span>
          </div>
          <div class="text-xs text-blue-700 mt-1">
            {{ getAdjustmentChangeText() }}
          </div>
        </div>

        <!-- Reason -->
        <div class="space-y-2">
          <Label for="reason">Reason *</Label>
          <Select v-model="formData.reason" required>
            <SelectTrigger :class="{ 'border-red-500': errors.reason }">
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RECEIVED">Stock Received</SelectItem>
              <SelectItem value="SOLD">Stock Sold</SelectItem>
              <SelectItem value="DAMAGED">Damaged/Spoiled</SelectItem>
              <SelectItem value="THEFT">Theft/Loss</SelectItem>
              <SelectItem value="COUNT_VARIANCE">Count Variance</SelectItem>
              <SelectItem value="RETURN">Customer Return</SelectItem>
              <SelectItem value="TRANSFER">Warehouse Transfer</SelectItem>
              <SelectItem value="CORRECTION">Data Correction</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.reason" class="text-sm text-red-500">{{ errors.reason }}</p>
        </div>

        <!-- Reference -->
        <div class="space-y-2">
          <Label for="reference">Reference Number</Label>
          <Input
            id="reference"
            v-model="formData.reference"
            placeholder="PO#, Invoice#, etc. (optional)"
          />
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Additional notes about this adjustment"
            rows="3"
          />
        </div>

        <!-- Cost per Unit (for stock in) -->
        <div v-if="formData.adjustmentType === 'IN' || formData.adjustmentType === 'RECEIVED'" class="space-y-2">
          <Label for="unitCost">Unit Cost</Label>
          <Input
            id="unitCost"
            v-model="formData.unitCost"
            type="number"
            step="0.01"
            placeholder="0.00"
          />
          <p class="text-xs text-muted-foreground">
            Leave empty to use standard cost ({{ formatCurrency(item.standardCost || 0) }})
          </p>
        </div>

        <!-- Effective Date -->
        <div class="space-y-2">
          <Label for="effectiveDate">Effective Date</Label>
          <Input
            id="effectiveDate"
            v-model="formData.effectiveDate"
            type="datetime-local"
          />
        </div>

        <!-- Serial/Lot Numbers (if applicable) -->
        <div v-if="item.isSerialTracked || item.isLotTracked" class="space-y-2">
          <Label>{{ item.isSerialTracked ? 'Serial Numbers' : 'Lot Numbers' }}</Label>
          <Textarea
            v-model="formData.serialLotNumbers"
            :placeholder="item.isSerialTracked ? 'Enter serial numbers (one per line)' : 'Enter lot numbers (one per line)'"
            rows="3"
          />
          <p class="text-xs text-muted-foreground">
            {{ item.isSerialTracked ? 'One serial number per line' : 'Format: LOT001, QTY50' }}
          </p>
        </div>
      </form>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button 
        @click="createAdjustment"
        :disabled="!isFormValid || creating"
      >
        <Loader2 v-if="creating" class="mr-2 h-4 w-4 animate-spin" />
        Create Adjustment
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { Package, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Props
const props = defineProps({
  item: {
    type: Object,
    default: () => null
  }
})

// Emits
const emit = defineEmits(['adjustment-created', 'close'])

// State
const creating = ref(false)
const errors = reactive({})

const formData = reactive({
  adjustmentType: '',
  quantity: null,
  reason: '',
  reference: '',
  notes: '',
  unitCost: null,
  effectiveDate: new Date().toISOString().slice(0, 16), // Current datetime in local format
  serialLotNumbers: ''
})

// Computed
const isFormValid = computed(() => {
  return formData.adjustmentType && 
         formData.quantity && 
         parseFloat(formData.quantity) !== 0 && 
         formData.reason
})

const getQuantityLabel = () => {
  switch (formData.adjustmentType) {
    case 'IN':
    case 'TRANSFER_IN':
      return 'Quantity to Add'
    case 'OUT':
    case 'TRANSFER_OUT':
      return 'Quantity to Remove'
    case 'ADJUSTMENT':
      return 'Adjustment Quantity (+/-)'
    case 'COUNT':
      return 'Actual Count'
    default:
      return 'Quantity'
  }
}

const getNewStockLevel = () => {
  const currentStock = props.item?.stockOnHand || 0
  const quantity = parseFloat(formData.quantity) || 0
  
  switch (formData.adjustmentType) {
    case 'IN':
    case 'TRANSFER_IN':
      return currentStock + Math.abs(quantity)
    case 'OUT':
    case 'TRANSFER_OUT':
      return currentStock - Math.abs(quantity)
    case 'ADJUSTMENT':
      return currentStock + quantity
    case 'COUNT':
      return quantity
    default:
      return currentStock
  }
}

const getAdjustmentChangeText = () => {
  const currentStock = props.item?.stockOnHand || 0
  const newStock = getNewStockLevel()
  const change = newStock - currentStock
  
  if (change > 0) {
    return `+${formatNumber(Math.abs(change))} increase`
  } else if (change < 0) {
    return `-${formatNumber(Math.abs(change))} decrease`
  } else {
    return 'No change'
  }
}

// Methods
const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])

  if (!formData.adjustmentType) {
    errors.adjustmentType = 'Adjustment type is required'
  }
  
  if (!formData.quantity || parseFloat(formData.quantity) === 0) {
    errors.quantity = 'Quantity is required and must be non-zero'
  }
  
  if (!formData.reason) {
    errors.reason = 'Reason is required'
  }

  // Additional validation for negative stock
  if (getNewStockLevel() < 0 && !props.item?.allowNegativeStock) {
    errors.quantity = 'This adjustment would result in negative stock'
  }

  return Object.keys(errors).length === 0
}

const createAdjustment = async () => {
  if (!validateForm()) return

  creating.value = true
  try {
    const adjustmentData = {
      itemId: props.item.id,
      adjustmentType: formData.adjustmentType,
      quantity: parseFloat(formData.quantity),
      reason: formData.reason,
      reference: formData.reference || null,
      notes: formData.notes || null,
      unitCost: formData.unitCost ? parseFloat(formData.unitCost) : null,
      effectiveDate: new Date(formData.effectiveDate).toISOString(),
      serialLotNumbers: formData.serialLotNumbers ? formData.serialLotNumbers.split('\n').filter(s => s.trim()) : []
    }

    // Adjust quantity based on type
    if (formData.adjustmentType === 'OUT' || formData.adjustmentType === 'TRANSFER_OUT') {
      adjustmentData.quantity = -Math.abs(adjustmentData.quantity)
    } else if (formData.adjustmentType === 'COUNT') {
      // For count adjustments, calculate the difference
      adjustmentData.quantity = adjustmentData.quantity - (props.item?.stockOnHand || 0)
    }

    emit('adjustment-created', adjustmentData)
  } catch (error) {
    console.error('Error creating adjustment:', error)
  } finally {
    creating.value = false
  }
}

const formatNumber = (value) => {
  return new Intl.NumberFormat().format(value || 0)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0)
}

// Initialize
onMounted(() => {
  // Set default unit cost to item's standard cost
  if (props.item?.standardCost) {
    formData.unitCost = props.item.standardCost
  }
})
</script>
