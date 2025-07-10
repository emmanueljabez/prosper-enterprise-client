<template>
  <div class="flex flex-col h-[calc(85vh)]">
    <div class="flex items-center justify-between p-2">
      <div>
        <h3 class="text-lg font-medium">Inventory Adjustment</h3>
        <p class="text-sm text-muted-foreground">Adjust inventory quantities due to damage, loss, or other reasons</p>
      </div>
      <Button variant="ghost" size="icon" @click="$emit('close')">
        <XIcon class="h-4 w-4" />
      </Button>
    </div>
    
    <Separator />
    
    <div class="flex-1 overflow-y-auto pr-1">
      <form @submit.prevent="handleSubmit" class="space-y-8 p-2">
        <!-- Transaction Details -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium">Adjustment Details</h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="transaction-date">Date & Time *</Label>
              <DatePicker
                v-model="form.transactionDate"
                placeholder="Select transaction date and time"
                class="w-full"
                :include-time="true"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="reason">Adjustment Reason *</Label>
              <Select v-model="form.reason" required>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="damage">Damage</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                  <SelectItem value="theft">Theft</SelectItem>
                  <SelectItem value="expiration">Expiration</SelectItem>
                  <SelectItem value="count">Inventory Count</SelectItem>
                  <SelectItem value="quality">Quality Control</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="location">Location *</Label>
            <Select v-model="form.locationId" required>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup v-for="group in locationGroups" :key="group.type">
                  <SelectLabel>{{ formatLocationType(group.type) }}</SelectLabel>
                  <SelectItem 
                    v-for="location in group.locations" 
                    :key="location.id" 
                    :value="location.id"
                  >
                    {{ location.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="notes">Notes *</Label>
            <Textarea 
              id="notes" 
              v-model="form.notes" 
              placeholder="Explain the reason for this adjustment" 
              rows="3"
              required
            />
          </div>
        </div>
        
        <Separator />
        
        <!-- Items -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium">Items to Adjust</h4>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              @click="addItemRow"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div v-if="form.items.length === 0" class="border rounded-md p-8 flex flex-col items-center justify-center bg-muted/40">
            <ScaleIcon class="h-8 w-8 text-muted-foreground mb-2" />
            <p class="text-muted-foreground">No items added yet.</p>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              class="mt-2"
              @click="addItemRow"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div v-else class="space-y-4">
            <Card v-for="(item, index) in form.items" :key="index" class="overflow-hidden">
              <CardHeader class="bg-muted/60 p-3 flex flex-row items-center justify-between">
                <CardTitle class="text-sm font-medium">Item {{ index + 1 }}</CardTitle>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  class="h-7 w-7" 
                  @click="removeItemRow(index)"
                >
                  <Trash2Icon class="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent class="p-4 space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`item-${index}`">Item *</Label>
                    <Select v-model="item.itemId" required @update:modelValue="updateItemAvailability(index)">
                      <SelectTrigger :id="`item-${index}`">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="inventoryItem in items" :key="inventoryItem.id" :value="inventoryItem.id">
                          {{ inventoryItem.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`adjustment-type-${index}`">Adjustment Type *</Label>
                    <Select v-model="item.adjustmentType" required>
                      <SelectTrigger :id="`adjustment-type-${index}`">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="decrease">Decrease (Write-off)</SelectItem>
                        <SelectItem value="increase">Increase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`quantity-${index}`">Quantity *</Label>
                    <div class="relative">
                      <Input 
                        :id="`quantity-${index}`" 
                        v-model.number="item.quantity" 
                        type="number" 
                        min="1" 
                        step="1" 
                        required
                      />
                      <div v-if="item.itemId && getItemAvailability(item.itemId)" class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        Current: {{ getItemAvailability(item.itemId) }}
                      </div>
                    </div>
                    <p v-if="item.adjustmentType === 'decrease' && isQuantityExceedsAvailable(item)" class="text-xs text-destructive">
                      Warning: Quantity exceeds available stock
                    </p>
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`bin-${index}`">Bin Location</Label>
                    <Input 
                      :id="`bin-${index}`" 
                      v-model="item.binLocation" 
                      placeholder="Optional"
                    />
                  </div>
                </div>
                
                <div class="space-y-2">
                  <Label :for="`item-note-${index}`">Item Note</Label>
                  <Textarea 
                    :id="`item-note-${index}`" 
                    v-model="item.note" 
                    placeholder="Additional details about this adjustment" 
                    rows="2"
                  />
                </div>
                
                <div v-if="item.adjustmentType && item.itemId" class="mt-2 p-3 bg-muted/40 rounded-md text-sm">
                  <p class="font-medium">
                    <span v-if="item.adjustmentType === 'decrease'" class="text-destructive">
                      Decreasing
                    </span>
                    <span v-else class="text-green-600">
                      Increasing
                    </span>
                    {{ getItemName(item.itemId) }} by {{ item.quantity }} 
                    {{ item.quantity === 1 ? 'unit' : 'units' }}
                  </p>
                  <p class="text-muted-foreground mt-1">
                    <span v-if="item.adjustmentType === 'decrease'">
                      New quantity will be {{ Math.max(0, (getItemAvailability(item.itemId) || 0) - item.quantity) }}
                    </span>
                    <span v-else>
                      New quantity will be {{ (getItemAvailability(item.itemId) || 0) + item.quantity }}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
    
    <div class="border-t pt-4 pb-2 px-2 bg-background">
      <div class="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          @click="$emit('close')"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          :disabled="submitting || !isFormValid"
          @click="handleSubmit"
        >
          <Loader2Icon v-if="submitting" class="h-4 w-4 mr-2 animate-spin" />
          <span>{{ submitting ? 'Submitting...' : 'Process Adjustment' }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  XIcon,
  PlusIcon,
  Trash2Icon,
  ScaleIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { DatePicker } from '@/components/ui/date-picker'
import { formatCurrentDateTime, ensureDateTimeFormat } from '@/utils/dateUtils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  locations: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: () => []
  },
  // For pre-filling form with a scanned item
  scannedItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'transaction-created'])

// Form state
const form = reactive({
  transactionDate: formatCurrentDateTime(),
  locationId: '',
  reason: '',
  notes: '',
  type: 'adjustment',
  items: []
})

const submitting = ref(false)
const itemAvailability = ref({})

// Computed properties
const locationGroups = computed(() => {
  // Filter active locations
  const filteredLocations = props.locations.filter(location => location.isActive)
  
  // Group locations by type
  const groups = {}
  filteredLocations.forEach(location => {
    const type = location.type || 'other'
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(location)
  })

  // Convert to array format for SelectGroup
  return Object.entries(groups).map(([type, locations]) => ({
    type,
    locations
  }))
})

const isFormValid = computed(() => {
  // Check basic transaction details
  if (!form.transactionDate || !form.locationId || !form.reason || !form.notes) {
    return false
  }
  
  // Check if we have at least one item
  if (form.items.length === 0) {
    return false
  }
  
  // Check that each item has required fields
  for (const item of form.items) {
    if (!item.itemId || !item.quantity || item.quantity <= 0 || !item.adjustmentType) {
      return false
    }
  }
  
  return true
})

// Methods
function addItemRow() {
  form.items.push({
    itemId: '',
    quantity: 1,
    adjustmentType: 'decrease', // Default to decrease
    binLocation: '',
    note: ''
  })
}

function removeItemRow(index) {
  form.items.splice(index, 1)
}

function formatLocationType(type) {
  switch (type) {
    case 'warehouse': return 'Warehouses'
    case 'store': return 'Stores'
    case 'zone': return 'Zones'
    case 'other': return 'Other Locations'
    default: return type.charAt(0).toUpperCase() + type.slice(1) + 's'
  }
}

function updateItemAvailability(index) {
  const itemId = form.items[index].itemId
  if (!itemId || !form.locationId) return
  
  // Find the selected item
  const item = props.items.find(i => i.id === itemId)
  if (item) {
    // Get stock availability for the selected location
    const locationStock = item.stock?.find(s => s.locationId === form.locationId)
    itemAvailability.value[itemId] = locationStock?.quantity || 0
  }
}

function getItemAvailability(itemId) {
  return itemAvailability.value[itemId] || 0
}

function getItemName(itemId) {
  const item = props.items.find(i => i.id === itemId)
  return item ? item.name : 'Unknown Item'
}

function isQuantityExceedsAvailable(item) {
  if (!item.itemId || item.adjustmentType !== 'decrease') return false
  const available = getItemAvailability(item.itemId)
  return item.quantity > available
}

async function handleSubmit() {
  if (!isFormValid.value) return
  
  submitting.value = true
  
  try {
    // Map items to transaction items format
    const mappedItems = form.items.map(item => {
      const adjustmentValue = item.adjustmentType === 'decrease' ? -item.quantity : item.quantity
      return {
        itemId: item.itemId,
        quantity: Math.abs(adjustmentValue), // Always positive in the API
        binLocation: item.binLocation,
        notes: item.note,
        // Additional fields needed for the API
        adjustmentValue: adjustmentValue, 
        adjustmentType: item.adjustmentType
      }
    })
    
    // Create transaction payload
    const transaction = {
      type: 'adjustment',
      destinationLocationId: form.locationId, // For adjustments, only destinationLocationId is used
      transactionDate: ensureDateTimeFormat(form.transactionDate),
      reason: form.reason,
      notes: form.notes,
      items: mappedItems
    }
    
    // Emit the transaction to parent for API submission
    emit('transaction-created', transaction)
  } catch (error) {
    console.error('Error creating adjustment:', error)
    // Error handling would typically be done in the parent component
  } finally {
    submitting.value = false
  }
}

// When location changes, update stock availability for all items
function updateAllItemsAvailability() {
  if (!form.locationId) return
  
  form.items.forEach((item, index) => {
    if (item.itemId) {
      updateItemAvailability(index)
    }
  })
}

// Watch for location changes to update all items
watch(() => form.locationId, () => {
  updateAllItemsAvailability()
})

// Initialize
onMounted(() => {
  // Add first item row by default
  if (form.items.length === 0) {
    addItemRow()
  }
  
  // Handle pre-filled scanned item if provided
  if (props.scannedItem) {
    // Find the item in our items list
    const matchedItem = props.items.find(
      item => item.id === props.scannedItem.id || 
             item.sku === props.scannedItem.barcode ||
             item.barcode === props.scannedItem.barcode
    )
    
    if (matchedItem) {
      form.items[0].itemId = matchedItem.id
      form.items[0].quantity = 1
      
      // If we have a location set, update item availability
      if (form.locationId) {
        updateItemAvailability(0)
      }
    }
  }
})
</script>