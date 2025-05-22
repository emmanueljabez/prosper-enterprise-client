<template>
  <DialogContent class="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Adjust Stock Level</DialogTitle>
      <DialogDescription>
        Increase or decrease inventory for {{ item.name }} ({{ item.sku }})
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-4 py-2">
      <!-- Item Badge -->
      <div class="flex items-center justify-between bg-muted/40 p-3 rounded-md">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
            <BoxIcon class="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div class="font-medium">{{ item.name }}</div>
            <div class="text-xs text-muted-foreground">{{ item.sku }}</div>
          </div>
        </div>
        <Badge :variant="getStatusVariant(item.status)">
          {{ formatStatus(item.status) }}
        </Badge>
      </div>
      
      <!-- Location Selection -->
      <div class="space-y-2">
        <Label for="location" required>Location</Label>
        <Select v-model="adjustment.locationId" :error="errors.locationId">
          <SelectTrigger id="location">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="location in availableLocations" 
              :key="location.id" 
              :value="location.id"
            >
              {{ location.name }}
              <span v-if="getLocationStock(location.id) !== null" class="ml-2 text-xs text-muted-foreground">
                (Current: {{ getLocationStock(location.id) }})
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        <p v-if="errors.locationId" class="text-sm text-destructive">{{ errors.locationId }}</p>
      </div>
      
      <!-- Bin Location -->
      <div class="space-y-2" v-if="adjustment.locationId && !existingLocation">
        <Label for="bin">Bin Location</Label>
        <Input id="bin" v-model="adjustment.bin" placeholder="Enter bin location (e.g., A1-B2-C3)" />
        <p class="text-xs text-muted-foreground">
          Optional: Specify a bin or shelf location for this item
        </p>
      </div>
      
      <!-- Quantity Adjustment -->
      <div class="space-y-2">
        <Label for="quantity" required>Adjustment Amount</Label>
        <div class="relative">
          <Input
            id="quantity"
            v-model.number="adjustment.quantity"
            type="number"
            step="1"
            placeholder="Enter quantity (+/-)"
            :error="errors.quantity"
          />
          <div class="absolute right-3 top-3 text-xs text-muted-foreground">
            {{ item.unitOfMeasure }}
          </div>
        </div>
        <p v-if="errors.quantity" class="text-sm text-destructive">{{ errors.quantity }}</p>
        <p class="text-xs text-muted-foreground">
          Enter a positive number to add stock or a negative number to remove stock
        </p>
      </div>
      
      <!-- Preview -->
      <div v-if="adjustment.locationId && adjustment.quantity" class="bg-muted/30 p-3 rounded-md">
        <div class="font-medium mb-2">Preview:</div>
        <div class="flex justify-between text-sm">
          <span>Current quantity at {{ getLocationName(adjustment.locationId) }}:</span>
          <span>{{ getLocationStock(adjustment.locationId) || 0 }} {{ item.unitOfMeasure }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span>Adjustment:</span>
          <span :class="adjustment.quantity >= 0 ? 'text-green-600' : 'text-destructive'">
            {{ adjustment.quantity >= 0 ? '+' : '' }}{{ adjustment.quantity }} {{ item.unitOfMeasure }}
          </span>
        </div>
        <div class="flex justify-between font-medium text-sm mt-1 pt-1 border-t">
          <span>New quantity:</span>
          <span>{{ calculateNewQuantity() }} {{ item.unitOfMeasure }}</span>
        </div>
      </div>
      
      <!-- Reason -->
      <div class="space-y-2">
        <Label for="reason" required>Reason</Label>
        <Select v-model="adjustment.reason" :error="errors.reason">
          <SelectTrigger id="reason">
            <SelectValue placeholder="Select reason for adjustment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="initial_count">Initial Count</SelectItem>
            <SelectItem value="recount">Inventory Recount</SelectItem>
            <SelectItem value="purchase">New Purchase</SelectItem>
            <SelectItem value="returned">Customer Return</SelectItem>
            <SelectItem value="damaged">Damaged/Defective</SelectItem>
            <SelectItem value="lost">Lost/Missing</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="internal_use">Internal Use</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <p v-if="errors.reason" class="text-sm text-destructive">{{ errors.reason }}</p>
      </div>
      
      <!-- Notes -->
      <div class="space-y-2">
        <Label for="notes">Notes</Label>
        <Textarea
          id="notes"
          v-model="adjustment.notes"
          placeholder="Enter any additional details about this adjustment"
          rows="2"
        />
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button @click="saveAdjustment" :disabled="isSubmitting">
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Save Adjustment
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  BoxIcon,
  Loader2Icon
} from 'lucide-vue-next'
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

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  locations: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['adjustment-saved', 'close'])

// Form data
const adjustment = reactive({
  itemId: '',
  locationId: '',
  quantity: null,
  reason: '',
  notes: '',
  bin: ''
})

// Form validation errors
const errors = reactive({
  locationId: '',
  quantity: '',
  reason: ''
})

// Submission state
const isSubmitting = ref(false)

// Set the item ID from props
adjustment.itemId = props.item.id

// Computed properties
const availableLocations = computed(() => {
  return props.locations.filter(location => location.isActive !== false)
})

const existingLocation = computed(() => {
  if (!adjustment.locationId) return false
  return props.item.locations.some(loc => loc.id === adjustment.locationId)
})

// Helper methods
const getLocationName = (locationId) => {
  const location = props.locations.find(l => l.id === locationId)
  return location ? location.name : 'Unknown Location'
}

const getLocationStock = (locationId) => {
  const locationItem = props.item.locations.find(loc => loc.id === locationId)
  return locationItem ? locationItem.quantity : null
}

const calculateNewQuantity = () => {
  const currentQty = getLocationStock(adjustment.locationId) || 0
  return currentQty + adjustment.quantity
}

const formatStatus = (status) => {
  switch (status) {
    case 'active':
      return 'Active'
    case 'out_of_stock':
      return 'Out of Stock'
    case 'low_stock':
      return 'Low Stock'
    case 'discontinued':
      return 'Discontinued'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'out_of_stock':
      return 'destructive'
    case 'low_stock':
      return 'warning'
    case 'discontinued':
      return 'outline'
    default:
      return 'default'
  }
}

// Validation
const validateForm = () => {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  if (!adjustment.locationId) {
    errors.locationId = 'Location is required'
    isValid = false
  }
  
  if (adjustment.quantity === null || adjustment.quantity === undefined) {
    errors.quantity = 'Quantity is required'
    isValid = false
  }
  
  if (adjustment.quantity === 0) {
    errors.quantity = 'Quantity cannot be zero'
    isValid = false
  }
  
  const newQuantity = calculateNewQuantity()
  if (newQuantity < 0) {
    errors.quantity = 'Cannot reduce stock below zero'
    isValid = false
  }
  
  if (!adjustment.reason) {
    errors.reason = 'Reason is required'
    isValid = false
  }
  
  return isValid
}

// Form submission
const saveAdjustment = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // If the location is not in the item's locations and we're adding stock,
    // make sure bin is provided if we're adding to a new location
    if (!existingLocation.value && adjustment.quantity > 0 && !adjustment.bin) {
      adjustment.bin = 'Default'
    }
    
    // Emit the adjustment
    emit('adjustment-saved', { ...adjustment })
  } catch (error) {
    console.error('Error saving adjustment:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>