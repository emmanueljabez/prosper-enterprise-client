<template>
  <DialogContent class="sm:max-w-[600px] max-h-[90vh] flex flex-col">
    <DialogHeader class="flex-shrink-0">
      <DialogTitle>Create New Reservation</DialogTitle>
      <DialogDescription>
        Reserve inventory items for a customer, service, or project
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-4 py-2 pb-4 overflow-y-auto flex-grow">
      <div class="space-y-2">
        <Label for="type">Reservation Type</Label>
        <Select v-model="formData.type">
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual Hold</SelectItem>
            <SelectItem value="service">Service Hold</SelectItem>
            <SelectItem value="project">Project Hold</SelectItem>
            <SelectItem value="customer">Customer Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label for="reference">Reference Number</Label>
        <Input
          id="reference"
          v-model="formData.reference"
          placeholder="Order number, service ticket, etc."
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="customer">Customer Name</Label>
          <Input
            id="customer"
            v-model="formData.customerName"
            placeholder="Customer name"
          />
        </div>
        <div class="space-y-2">
          <Label for="customerId">Customer ID</Label>
          <Input
            id="customerId"
            v-model="formData.customerId"
            placeholder="Customer ID (optional)"
          />
        </div>
      </div>

      <div class="space-y-2">
        <Label for="location">Location</Label>
        <Select v-model="formData.locationId">
          <SelectTrigger id="location">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="location in locations" 
              :key="location.id" 
              :value="location.id"
            >
              {{ location.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label for="holdPolicy">Hold Policy</Label>
        <Select v-model="formData.holdPolicyId">
          <SelectTrigger id="holdPolicy">
            <SelectValue placeholder="Select hold policy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="policy in activeHoldPolicies" 
              :key="policy.id" 
              :value="policy.id"
            >
              {{ policy.name }} ({{ formatDuration(policy) }})
            </SelectItem>
          </SelectContent>
        </Select>
        <p class="text-sm text-muted-foreground" v-if="selectedPolicy">
          Items will be held until {{ formatExpiryDate(calculateExpiryDate(selectedPolicy)) }}
        </p>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label>Items</Label>
          <Button 
            variant="outline" 
            size="sm" 
            @click="addItem" 
            class="h-8 gap-1"
          >
            <PlusIcon class="h-3.5 w-3.5" />
            <span>Add Item</span>
          </Button>
        </div>
        <div class="border rounded-md" v-if="formData.items.length > 0">
          <div class="grid grid-cols-[1fr,80px,80px,60px] gap-2 p-3 border-b text-sm text-muted-foreground">
            <div>Item</div>
            <div>Available</div>
            <div>Quantity</div>
            <div></div>
          </div>
          <div class="max-h-[200px] overflow-y-auto">
            <div v-for="(item, index) in formData.items" :key="index" class="grid grid-cols-[1fr,80px,80px,60px] gap-2 p-3 border-b last:border-0 items-center">
              <div>
                <Select v-model="item.itemId" @update:modelValue="updateItemDetails(index)">
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="inventoryItem in filteredItems" 
                      :key="inventoryItem.id" 
                      :value="inventoryItem.id"
                      :disabled="isItemAlreadySelected(inventoryItem.id, index)"
                    >
                      {{ inventoryItem.name }} ({{ inventoryItem.sku }})
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div class="text-xs text-muted-foreground" v-if="getItemBySku(item.itemId)">
                  SKU: {{ getItemBySku(item.itemId)?.sku }}
                </div>
              </div>
              <div>
                {{ getAvailableQuantity(item.itemId) }}
              </div>
              <div>
                <Input 
                  type="number" 
                  v-model.number="item.quantity" 
                  min="1" 
                  :max="getAvailableQuantity(item.itemId)"
                  class="h-9"
                />
              </div>
              <div>
                <Button 
                  variant="ghost"
                  size="icon"
                  @click="removeItem(index)"
                >
                  <XIcon class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="border rounded-md p-8 flex flex-col items-center justify-center text-center">
          <PackageIcon class="h-8 w-8 text-muted-foreground mb-2" />
          <p class="text-sm text-muted-foreground">No items added yet</p>
          <Button 
            variant="outline" 
            size="sm" 
            @click="addItem" 
            class="mt-2"
          >
            <PlusIcon class="h-3.5 w-3.5 mr-1" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

      <div class="space-y-2">
        <Label for="notes">Notes</Label>
        <Textarea
          id="notes"
          v-model="formData.notes"
          placeholder="Add any additional notes about this reservation"
          rows="3"
        />
      </div>
    </div>

    <DialogFooter class="flex-shrink-0">
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        type="submit" 
        @click="createReservation" 
        :disabled="isSubmitting || !isFormValid"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Create Reservation
      </Button>
    </DialogFooter>
  </DialogContent>

  <!-- Keep alert dialog outside the scrollable area -->
  <AlertDialog v-model:open="showQuantityWarning">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Quantity Warning</AlertDialogTitle>
        <AlertDialogDescription>
          Some of the quantities you've requested exceed the available stock.
          Please adjust the quantities or continue with the available amounts.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="showQuantityWarning = false">
          Adjust Quantities
        </AlertDialogCancel>
        <AlertDialogAction @click="createReservationAnyway">
          Continue Anyway
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, addDays, addHours } from 'date-fns'
import { Loader2Icon, PlusIcon, XIcon, PackageIcon } from 'lucide-vue-next'
import { 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  locations: {
    type: Array,
    required: true
  },
  holdPolicies: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'reservation-created'])

// Form state
const formData = ref({
  type: 'manual',
  reference: '',
  customerName: '',
  customerId: '',
  locationId: '',
  holdPolicyId: '',
  notes: '',
  items: []
})

const isSubmitting = ref(false)
const showQuantityWarning = ref(false)
const forceSubmit = ref(false)

// Computed properties
const activeHoldPolicies = computed(() => {
  return props.holdPolicies.filter(policy => policy.status === 'active')
})

const selectedPolicy = computed(() => {
  if (!formData.value.holdPolicyId) return null
  return props.holdPolicies.find(policy => policy.id === formData.value.holdPolicyId)
})

const filteredItems = computed(() => {
  return props.items.filter(item => item.status === 'active')
})

const isFormValid = computed(() => {
  return (
    formData.value.type &&
    formData.value.locationId &&
    formData.value.holdPolicyId &&
    formData.value.items.length > 0 &&
    formData.value.items.every(item => item.itemId && item.quantity > 0)
  )
})

const hasQuantityExceeded = computed(() => {
  return formData.value.items.some(item => {
    const availableQty = getAvailableQuantity(item.itemId)
    return item.quantity > availableQty
  })
})

// Helper functions
function formatDuration(policy) {
  if (!policy) return ''
  
  if (policy.durationType === 'days') {
    return policy.duration === 1 ? '1 day' : `${policy.duration} days`
  } else if (policy.durationType === 'hours') {
    return policy.duration === 1 ? '1 hour' : `${policy.duration} hours`
  }
  
  return `${policy.duration} ${policy.durationType}`
}

function calculateExpiryDate(policy) {
  if (!policy) return new Date()
  
  const now = new Date()
  
  if (policy.durationType === 'days') {
    return addDays(now, policy.duration)
  } else if (policy.durationType === 'hours') {
    return addHours(now, policy.duration)
  }
  
  return addDays(now, 7) // Default: 7 days
}

function formatExpiryDate(date) {
  return format(date, 'MMM d, yyyy h:mm a')
}

function getItemBySku(itemId) {
  return props.items.find(item => item.id === itemId)
}

function getAvailableQuantity(itemId) {
  const item = getItemBySku(itemId)
  return item ? item.availableQuantity || 0 : 0
}

function isItemAlreadySelected(itemId, currentIndex) {
  return formData.value.items.some((item, index) => 
    index !== currentIndex && item.itemId === itemId
  )
}

function updateItemDetails(index) {
  const item = formData.value.items[index]
  const inventoryItem = getItemBySku(item.itemId)
  
  if (inventoryItem) {
    // Set a default quantity (1 or available quantity, whichever is smaller)
    const availableQty = getAvailableQuantity(item.itemId)
    if (!item.quantity || item.quantity <= 0) {
      formData.value.items[index].quantity = Math.min(1, availableQty)
    } else if (item.quantity > availableQty) {
      formData.value.items[index].quantity = availableQty
    }
  }
}

// Action methods
function addItem() {
  formData.value.items.push({
    itemId: '',
    quantity: 1
  })
}

function removeItem(index) {
  formData.value.items.splice(index, 1)
}

function createReservation() {
  if (!isFormValid.value) return
  
  if (hasQuantityExceeded.value && !forceSubmit.value) {
    showQuantityWarning.value = true
    return
  }
  
  submitReservation()
}

function createReservationAnyway() {
  showQuantityWarning.value = false
  forceSubmit.value = true
  submitReservation()
}

async function submitReservation() {
  isSubmitting.value = true
  
  try {
    // Prepare data for API
    const expiresAt = calculateExpiryDate(selectedPolicy.value).toISOString()
    
    const reservationData = {
      type: formData.value.type,
      reference: formData.value.reference,
      customerName: formData.value.customerName,
      customerId: formData.value.customerId,
      locationId: formData.value.locationId,
      holdPolicyId: formData.value.holdPolicyId,
      notes: formData.value.notes,
      expiresAt: expiresAt,
      items: formData.value.items.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity
      }))
    }
    
    // Find location name for display
    const location = props.locations.find(loc => loc.id === formData.value.locationId)
    if (location) {
      reservationData.locationName = location.name
    }
    
    emit('reservation-created', reservationData)
  } catch (error) {
    console.error('Error creating reservation:', error)
  } finally {
    isSubmitting.value = false
    forceSubmit.value = false
  }
}

// Set default location if only one exists
watch(() => props.locations, (newLocations) => {
  if (newLocations.length === 1 && !formData.value.locationId) {
    formData.value.locationId = newLocations[0].id
  }
}, { immediate: true })

// Set default hold policy if only one exists
watch(() => activeHoldPolicies.value, (newPolicies) => {
  if (newPolicies.length === 1 && !formData.value.holdPolicyId) {
    formData.value.holdPolicyId = newPolicies[0].id
  }
}, { immediate: true })
</script>