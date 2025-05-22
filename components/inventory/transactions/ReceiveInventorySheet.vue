<template>
  <div class="flex flex-col h-[calc(85vh)]">
    <div class="flex items-center justify-between p-2">
      <div>
        <h3 class="text-lg font-medium">Receive Inventory</h3>
        <p class="text-sm text-muted-foreground">Record inventory received from suppliers or other locations</p>
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
          <h4 class="text-sm font-medium">Transaction Details</h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="transaction-date">Date *</Label>
              <Input 
                id="transaction-date" 
                v-model="form.transactionDate" 
                type="datetime-local" 
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="external-reference">External Reference</Label>
              <Input 
                id="external-reference" 
                v-model="form.externalReference" 
                placeholder="PO number, invoice number, etc."
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="source-location">Source (Supplier) *</Label>
              <Select v-model="form.sourceLocationId" required>
                <SelectTrigger id="source-location">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                    {{ supplier.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="destination-location">Destination *</Label>
              <Select v-model="form.destinationLocationId" required>
                <SelectTrigger id="destination-location">
                  <SelectValue placeholder="Select destination" />
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
          </div>
          
          <div class="space-y-2">
            <Label for="notes">Notes</Label>
            <Textarea 
              id="notes" 
              v-model="form.notes" 
              placeholder="Enter any additional information about this receipt" 
              rows="3"
            />
          </div>
        </div>
        
        <Separator />
        
        <!-- Items -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium">Items</h4>
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
            <PackageIcon class="h-8 w-8 text-muted-foreground mb-2" />
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
                    <Select v-model="item.itemId" required>
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
                    <Input 
                      :id="`quantity-${index}`" 
                      v-model.number="item.quantity" 
                      type="number" 
                      min="1" 
                      step="1" 
                      required
                    />
                  </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`cost-${index}`">Cost per Unit</Label>
                    <div class="relative">
                      <span class="absolute left-2.5 top-1/2 -translate-y-1/2">$</span>
                      <Input 
                        :id="`cost-${index}`" 
                        v-model.number="item.cost" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        class="pl-6"
                      />
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`lot-${index}`">Lot/Batch Number</Label>
                    <Input 
                      :id="`lot-${index}`" 
                      v-model="item.lot" 
                      placeholder="Optional"
                    />
                  </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`bin-${index}`">Bin Location</Label>
                    <Input 
                      :id="`bin-${index}`" 
                      v-model="item.binLocation" 
                      placeholder="Optional"
                    />
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`expiration-${index}`">Expiration Date</Label>
                    <Input 
                      :id="`expiration-${index}`" 
                      v-model="item.expirationDate" 
                      type="date"
                    />
                  </div>
                </div>
                
                <div class="flex justify-between items-center mt-2 text-sm">
                  <div class="text-muted-foreground">Subtotal:</div>
                  <div class="font-medium">{{ formatCurrency(calculateSubtotal(item)) }}</div>
                </div>
              </CardContent>
            </Card>
            
            <div class="flex justify-end space-x-4 items-center">
              <span class="text-muted-foreground">Total:</span>
              <span class="text-lg font-medium">{{ formatCurrency(calculateTotal()) }}</span>
            </div>
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
          <span>{{ submitting ? 'Submitting...' : 'Complete Receipt' }}</span>
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
  PackageIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
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
  suppliers: {
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
  type: 'receive',
  items: []
})

const submitting = ref(false)

// Computed properties
const locationGroups = computed(() => {
  // Filter out supplier locations since they're in a separate dropdown
  const filteredLocations = props.locations.filter(
    location => location.type !== 'supplier' && location.isActive
  )
  
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
  
  // Check if we have at least one item
  if (form.items.length === 0) {
    return false
  }
  
  // Check that each item has required fields
  for (const item of form.items) {
    if (!item.itemId || !item.quantity || item.quantity <= 0) {
      return false
    }
  }
  
  return true
})

// Methods
function formatCurrentDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function calculateSubtotal(item) {
  const cost = item.cost || 0
  const quantity = item.quantity || 0
  return cost * quantity
}

function calculateTotal() {
  return form.items.reduce((total, item) => {
    return total + calculateSubtotal(item)
  }, 0)
}

function addItemRow() {
  form.items.push({
    itemId: '',
    quantity: 1,
    cost: null,
    lot: '',
    binLocation: '',
    expirationDate: ''
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

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(value || 0)
}

async function handleSubmit() {
  if (!isFormValid.value) return
  
  submitting.value = true
  
  try {
    // Calculate subtotals for each item
    const items = form.items.map(item => ({
      ...item,
      subtotal: calculateSubtotal(item)
    }))
    
    // Create transaction payload
    const transaction = {
      type: 'receive',
      sourceLocationId: form.sourceLocationId,
      destinationLocationId: form.destinationLocationId,
      transactionDate: new Date(form.transactionDate).toISOString(),
      externalReference: form.externalReference,
      notes: form.notes,
      items,
      totalValue: calculateTotal()
    }
    
    // Emit the transaction to parent for API submission
    emit('transaction-created', transaction)
  } catch (error) {
    console.error('Error creating transaction:', error)
    // Error handling would typically be done in the parent component
  } finally {
    submitting.value = false
  }
}

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
      form.items[0].cost = matchedItem.cost
    }
  }
})
</script>