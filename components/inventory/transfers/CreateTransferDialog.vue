<template>
  <DialogContent class="sm:max-w-[600px] max-h-[85vh] flex flex-col">
    <DialogHeader>
      <DialogTitle>Create New Transfer</DialogTitle>
      <DialogDescription>
        Create a transfer to move inventory between locations
      </DialogDescription>
    </DialogHeader>
    
    <div class="flex-1 overflow-y-auto py-2">
      <form id="transfer-form" @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Basic Info -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="transferType">Transfer Type</Label>
            <Select v-model="formData.type" required>
              <SelectTrigger id="transferType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Transfer</SelectItem>
                <SelectItem value="return">Return Transfer</SelectItem>
                <SelectItem value="adjustment">Inventory Adjustment</SelectItem>
                <SelectItem value="bulk">Bulk Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label for="externalReference">External Reference</Label>
            <Input 
              id="externalReference"
              v-model="formData.externalReference" 
              placeholder="Order #, PO #, etc."
            />
          </div>
        </div>
        
        <!-- Locations -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="fromLocation">From Location</Label>
            <Select v-model="formData.fromLocationId" required>
              <SelectTrigger id="fromLocation">
                <SelectValue placeholder="Select source location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="location in locations" :key="location.id" :value="location.id">
                  {{ location.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label for="toLocation">To Location</Label>
            <Select 
              v-model="formData.toLocationId" 
              :disabled="formData.type === 'adjustment'"
              required
            >
              <SelectTrigger id="toLocation">
                <SelectValue placeholder="Select destination location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="location in destinationLocations" 
                  :key="location.id" 
                  :value="location.id"
                >
                  {{ location.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <div v-if="formData.type === 'adjustment'" class="text-xs text-muted-foreground mt-1">
              Adjustments occur within the same location
            </div>
          </div>
        </div>
        
        <!-- Dates -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="expectedShipDate">Expected Ship Date</Label>
            <Input 
              id="expectedShipDate"
              v-model="formData.expectedShipDate" 
              type="date"
              :min="today"
              :disabled="formData.type === 'adjustment'"
              :required="formData.type !== 'adjustment'"
            />
          </div>
          
          <div>
            <Label for="expectedDeliveryDate">Expected Delivery Date</Label>
            <Input 
              id="expectedDeliveryDate"
              v-model="formData.expectedDeliveryDate" 
              type="date"
              :min="formData.expectedShipDate || today"
              :disabled="formData.type === 'adjustment'"
            />
          </div>
        </div>
        
        <!-- Approval and Notes -->
        <div class="grid grid-cols-1 gap-4">
          <div class="flex items-center space-x-2">
            <Checkbox id="requiresApproval" v-model:checked="formData.requiresApproval" />
            <Label for="requiresApproval" class="cursor-pointer">Requires Approval</Label>
          </div>
          
          <div>
            <Label for="notes">Notes</Label>
            <Textarea
              id="notes"
              v-model="formData.notes"
              placeholder="Enter any additional information about this transfer"
              rows="2"
            />
          </div>
        </div>
        
        <!-- Items Section -->
        <div class="border rounded-md p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">Items to Transfer</h3>
            <Button type="button" variant="outline" size="sm" @click="addItem">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div v-if="formData.items.length === 0" class="text-center p-4 text-muted-foreground">
            <PackageIcon class="h-10 w-10 mx-auto text-muted-foreground/70" />
            <p class="mt-2">No items added yet</p>
            <p class="text-sm">Click "Add Item" to start adding items to this transfer</p>
          </div>
          
          <div v-for="(item, index) in formData.items" :key="index" class="mb-4 border rounded-md p-3">
            <div class="flex justify-between items-start mb-2">
              <div class="text-sm font-medium">Item {{ index + 1 }}</div>
              <Button type="button" variant="ghost" size="icon" @click="removeItem(index)">
                <XIcon class="h-4 w-4" />
              </Button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label :for="`item-${index}`">Item</Label>
                <Select v-model="item.itemId" required>
                  <SelectTrigger :id="`item-${index}`">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="inventoryItem in availableItems" 
                      :key="inventoryItem.id" 
                      :value="inventoryItem.id"
                    >
                      {{ inventoryItem.name }} ({{ inventoryItem.sku }})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label :for="`quantity-${index}`">Quantity</Label>
                <Input 
                  :id="`quantity-${index}`"
                  v-model.number="item.quantity" 
                  type="number"
                  min="1"
                  required
                />
              </div>
              
              <div class="md:col-span-2">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <Label :for="`sourceBin-${index}`">Source Bin</Label>
                    <Input 
                      :id="`sourceBin-${index}`"
                      v-model="item.sourceBin"
                      placeholder="Optional"
                    />
                  </div>
                  
                  <div>
                    <Label :for="`destinationBin-${index}`">Destination Bin</Label>
                    <Input 
                      :id="`destinationBin-${index}`"
                      v-model="item.destinationBin"
                      :disabled="formData.type === 'adjustment' && item.quantity < 0"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
              
              <div class="md:col-span-2" v-if="formData.type === 'adjustment'">
                <Label :for="`notes-${index}`">Adjustment Reason</Label>
                <Textarea
                  :id="`notes-${index}`"
                  v-model="item.notes"
                  placeholder="Reason for inventory adjustment"
                  rows="1"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        type="submit" 
        form="transfer-form" 
        :disabled="isSubmitting || !isFormValid"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Create Transfer
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import { 
  Loader2Icon, 
  PackageIcon, 
  PlusIcon, 
  XIcon 
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const props = defineProps({
  locations: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] }
})

const emit = defineEmits(['transfer-created', 'close'])

const isSubmitting = ref(false)
const formData = ref({
  type: 'standard',
  fromLocationId: '',
  toLocationId: '',
  expectedShipDate: '',
  expectedDeliveryDate: '',
  requiresApproval: false,
  notes: '',
  externalReference: '',
  items: []
})

// Initialize form with default values
const initForm = () => {
  // Set today's date as the default expected ship date
  formData.value.expectedShipDate = format(new Date(), 'yyyy-MM-dd')
  
  // Set tomorrow as the default expected delivery date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  formData.value.expectedDeliveryDate = format(tomorrow, 'yyyy-MM-dd')
}

// When type changes to adjustment, set to/from locations to be the same
watch(() => formData.value.type, (newType) => {
  if (newType === 'adjustment' && formData.value.fromLocationId) {
    formData.value.toLocationId = formData.value.fromLocationId
  }
})

watch(() => formData.value.fromLocationId, (newLocation) => {
  if (formData.value.type === 'adjustment' && newLocation) {
    formData.value.toLocationId = newLocation
  }
})

const today = computed(() => {
  return format(new Date(), 'yyyy-MM-dd')
})

const destinationLocations = computed(() => {
  if (formData.value.type === 'adjustment') {
    return props.locations.filter(loc => loc.id === formData.value.fromLocationId)
  }
  return props.locations.filter(loc => loc.id !== formData.value.fromLocationId)
})

const availableItems = computed(() => {
  return props.items
})

const isFormValid = computed(() => {
  const isBasicInfoValid = formData.value.type && 
                           formData.value.fromLocationId && 
                           formData.value.toLocationId

  const isDateInfoValid = formData.value.type === 'adjustment' || 
                         (formData.value.expectedShipDate && 
                          (!formData.value.expectedDeliveryDate || 
                           formData.value.expectedDeliveryDate >= formData.value.expectedShipDate))

  const areItemsValid = formData.value.items.length > 0 && 
                       formData.value.items.every(item => 
                         item.itemId && 
                         item.quantity && 
                         item.quantity > 0)
  
  return isBasicInfoValid && isDateInfoValid && areItemsValid
})

function addItem() {
  formData.value.items.push({
    itemId: '',
    quantity: 1,
    sourceBin: '',
    destinationBin: '',
    notes: ''
  })
}

function removeItem(index) {
  formData.value.items.splice(index, 1)
}

async function handleSubmit() {
  if (!isFormValid.value) return

  isSubmitting.value = true

  try {
    const transferData = {
      ...formData.value,
      expectedShipDate: formData.value.expectedShipDate ? new Date(formData.value.expectedShipDate).toISOString() : undefined,
      expectedDeliveryDate: formData.value.expectedDeliveryDate ? new Date(formData.value.expectedDeliveryDate).toISOString() : undefined,
    }
    
    // For adjustments, ensure to/from are the same location
    if (transferData.type === 'adjustment') {
      transferData.toLocationId = transferData.fromLocationId
    }

    emit('transfer-created', transferData)
  } catch (error) {
    console.error('Error creating transfer:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Initialize on mount
initForm()
</script>