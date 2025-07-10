<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium">Transfer Stock</h3>
        <p class="text-sm text-muted-foreground">Move inventory between locations</p>
      </div>
      <Button variant="ghost" size="icon" @click="$emit('close')">
        <XIcon class="h-4 w-4" />
      </Button>
    </div>
    
    <Separator />
    
    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Transaction Details -->
      <div class="space-y-4">
        <h4 class="text-sm font-medium">Transfer Details</h4>
        
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
            <Label for="external-reference">Reference Number</Label>
            <Input 
              id="external-reference" 
              v-model="form.externalReference" 
              placeholder="Transfer #, request #, etc."
            />
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="source-location">Source Location *</Label>
            <Select 
              v-model="form.sourceLocationId" 
              required
              @update:modelValue="handleSourceLocationChanged"
            >
              <SelectTrigger id="source-location">
                <SelectValue placeholder="Select source" />
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
            <Label for="destination-location">Destination Location *</Label>
            <Select 
              v-model="form.destinationLocationId" 
              required
              :disabled="!form.sourceLocationId"
            >
              <SelectTrigger id="destination-location">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup v-for="group in locationGroups" :key="group.type">
                  <SelectLabel>{{ formatLocationType(group.type) }}</SelectLabel>
                  <SelectItem 
                    v-for="location in filteredDestinationLocations(group.locations)" 
                    :key="location.id" 
                    :value="location.id"
                  >
                    {{ location.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p v-if="!form.sourceLocationId" class="text-xs text-muted-foreground">
              Select a source location first
            </p>
          </div>
        </div>
        
        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <Textarea 
            id="notes" 
            v-model="form.notes" 
            placeholder="Enter any additional information about this transfer" 
            rows="3"
          />
        </div>
      </div>
      
      <Separator />
      
      <!-- Items -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium">Items to Transfer</h4>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            @click="addItemRow"
            :disabled="!form.sourceLocationId"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        <Alert v-if="!form.sourceLocationId" variant="warning">
          <AlertCircleIcon class="h-4 w-4" />
          <AlertTitle>Select source location</AlertTitle>
          <AlertDescription>
            You need to select a source location before adding items to transfer.
          </AlertDescription>
        </Alert>
        
        <div v-else-if="form.items.length === 0" class="border rounded-md p-8 flex flex-col items-center justify-center bg-muted/40">
          <ArrowRightLeftIcon class="h-8 w-8 text-muted-foreground mb-2" />
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
                  <Select 
                    v-model="item.itemId" 
                    required
                    @update:modelValue="updateItemDetails(index)"
                  >
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
                      Available: {{ getItemAvailability(item.itemId) }}
                    </div>
                  </div>
                  <p v-if="item.itemId && isQuantityExceedsAvailable(item)" class="text-xs text-destructive">
                    Warning: Quantity exceeds available stock
                  </p>
                </div>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label :for="`source-bin-${index}`">Source Bin Location</Label>
                  <Input 
                    :id="`source-bin-${index}`" 
                    v-model="item.sourceBin" 
                    placeholder="Where item is stored"
                  />
                </div>
                
                <div class="space-y-2">
                  <Label :for="`destination-bin-${index}`">Destination Bin</Label>
                  <Input 
                    :id="`destination-bin-${index}`" 
                    v-model="item.destinationBin" 
                    placeholder="Where item will go"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label :for="`lot-${index}`">Lot/Batch Number</Label>
                  <Input 
                    :id="`lot-${index}`" 
                    v-model="item.lot" 
                    placeholder="Optional"
                  />
                </div>
                
                <div class="space-y-2" v-if="isSerializedItem(item.itemId)">
                  <Label :for="`serial-${index}`">Serial Numbers</Label>
                  <div class="flex space-x-2">
                    <Input 
                      :id="`serial-${index}`" 
                      v-model="serialNumberInputs[index]" 
                      placeholder="Add serial numbers"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      class="shrink-0"
                      @click="addSerialNumber(index)"
                    >
                      <PlusIcon class="h-4 w-4" />
                    </Button>
                  </div>
                  <div v-if="item.serialNumbers && item.serialNumbers.length > 0" class="flex flex-wrap gap-1 mt-2">
                    <Badge 
                      v-for="(serial, sIndex) in item.serialNumbers" 
                      :key="sIndex" 
                      variant="secondary"
                      class="flex items-center gap-1"
                    >
                      {{ serial }}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        class="h-4 w-4 p-0" 
                        @click="removeSerialNumber(index, sIndex)"
                      >
                        <XIcon class="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                  <p v-if="item.serialNumbers && item.quantity !== item.serialNumbers.length" class="text-xs text-amber-600">
                    Number of serial numbers ({{ item.serialNumbers.length }}) should match quantity ({{ item.quantity }})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Separator />
      
      <!-- Submit Buttons -->
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
        >
          <Loader2Icon v-if="submitting" class="h-4 w-4 mr-2 animate-spin" />
          <span>{{ submitting ? 'Processing...' : 'Complete Transfer' }}</span>
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import {
  XIcon,
  PlusIcon,
  Trash2Icon,
  ArrowRightLeftIcon,
  Loader2Icon,
  AlertCircleIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import { formatCurrentDateTime, ensureDateTimeFormat } from '@/utils/dateUtils'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
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
  sourceLocationId: '',
  destinationLocationId: '',
  externalReference: '',
  notes: '',
  type: 'transfer',
  items: []
})

const serialNumberInputs = ref({})
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
  if (!form.transactionDate || !form.sourceLocationId || !form.destinationLocationId) {
    return false
  }
  
  if (form.sourceLocationId === form.destinationLocationId) {
    return false // Can't transfer to the same location
  }
  
  // Check if we have at least one item
  if (form.items.length === 0) {
    return false
  }
  
  // Check that each item has required fields
  for (const item of form.items) {
    if (!item.itemId || !item.quantity || item.quantity <= 0) {
      return false
    }
    
    // For serialized items, the number of serial numbers must match quantity
    if (isSerializedItem(item.itemId) && 
        item.serialNumbers && 
        item.serialNumbers.length !== item.quantity) {
      return false
    }
  }
  
  return true
})

// Methods
function filteredDestinationLocations(locations) {
  if (!form.sourceLocationId) return locations
  // Filter out the source location from the destination options
  return locations.filter(loc => loc.id !== form.sourceLocationId)
}

function handleSourceLocationChanged() {
  // Reset destination if it's the same as the new source
  if (form.destinationLocationId === form.sourceLocationId) {
    form.destinationLocationId = ''
  }
  
  // Update availability for all existing items
  form.items.forEach((item, index) => {
    if (item.itemId) {
      updateItemDetails(index)
    }
  })
}

function updateItemDetails(index) {
  const itemId = form.items[index].itemId
  if (!itemId || !form.sourceLocationId) return
  
  // Find the selected item
  const item = props.items.find(i => i.id === itemId)
  if (item) {
    // Get stock availability for the selected source location
    const locationStock = item.stock?.find(s => s.locationId === form.sourceLocationId)
    itemAvailability.value[itemId] = locationStock?.quantity || 0
    
    // Initialize serial numbers array if it's a serialized item
    if (isSerializedItem(itemId) && !form.items[index].serialNumbers) {
      form.items[index].serialNumbers = []
    }
  }
}

function getItemAvailability(itemId) {
  return itemAvailability.value[itemId] || 0
}

function isSerializedItem(itemId) {
  if (!itemId) return false
  const item = props.items.find(i => i.id === itemId)
  return item && item.trackSerialNumber
}

function isQuantityExceedsAvailable(item) {
  if (!item.itemId) return false
  const available = getItemAvailability(item.itemId)
  return item.quantity > available
}

function addItemRow() {
  const index = form.items.length
  form.items.push({
    itemId: '',
    quantity: 1,
    sourceBin: '',
    destinationBin: '',
    lot: '',
    serialNumbers: []
  })
  serialNumberInputs.value[index] = ''
}

function removeItemRow(index) {
  form.items.splice(index, 1)
  // Update serial number inputs
  const newSerialInputs = {}
  Object.keys(serialNumberInputs.value).forEach(key => {
    const keyNum = parseInt(key)
    if (keyNum < index) {
      newSerialInputs[keyNum] = serialNumberInputs.value[keyNum]
    } else if (keyNum > index) {
      newSerialInputs[keyNum - 1] = serialNumberInputs.value[keyNum]
    }
  })
  serialNumberInputs.value = newSerialInputs
}

function addSerialNumber(index) {
  const serial = serialNumberInputs.value[index]
  if (!serial) return
  
  if (!form.items[index].serialNumbers) {
    form.items[index].serialNumbers = []
  }
  
  if (!form.items[index].serialNumbers.includes(serial)) {
    form.items[index].serialNumbers.push(serial)
  }
  
  serialNumberInputs.value[index] = ''
}

function removeSerialNumber(itemIndex, serialIndex) {
  form.items[itemIndex].serialNumbers.splice(serialIndex, 1)
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

async function handleSubmit() {
  if (!isFormValid.value) return
  
  submitting.value = true
  
  try {
    // Create transaction payload
    const transaction = {
      type: 'transfer',
      sourceLocationId: form.sourceLocationId,
      destinationLocationId: form.destinationLocationId,
      transactionDate: ensureDateTimeFormat(form.transactionDate),
      externalReference: form.externalReference,
      notes: form.notes,
      items: form.items
    }
    
    // Emit the transaction to parent for API submission
    emit('transaction-created', transaction)
  } catch (error) {
    console.error('Error creating transfer:', error)
    // Error handling would typically be done in the parent component
  } finally {
    submitting.value = false
  }
}

// Initialize
watch(() => props.scannedItem, (newScannedItem) => {
  if (newScannedItem && form.sourceLocationId) {
    // Find the item in our items list
    const matchedItem = props.items.find(
      item => item.id === newScannedItem.id || 
             item.sku === newScannedItem.barcode ||
             item.barcode === newScannedItem.barcode
    )
    
    if (matchedItem) {
      // If no items yet, add one
      if (form.items.length === 0) {
        addItemRow()
      }
      
      // Add to the first empty item row or create a new one
      const emptyIndex = form.items.findIndex(item => !item.itemId)
      const index = emptyIndex >= 0 ? emptyIndex : form.items.length;
      
      if (emptyIndex < 0) {
        addItemRow()
      }
      
      form.items[index].itemId = matchedItem.id
      form.items[index].quantity = 1
      
      // Update availability
      updateItemDetails(index)
    }
  }
}, { immediate: true })

// Add first item row by default when source location is selected
watch(() => form.sourceLocationId, (newSourceId) => {
  if (newSourceId && form.items.length === 0) {
    addItemRow()
  }
})
</script>