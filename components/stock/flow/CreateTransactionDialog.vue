<template>
  <DialogContent class="sm:max-w-2xl max-h-[90vh] flex flex-col">
    <DialogHeader>
      <DialogTitle>Create New Transaction</DialogTitle>
      <DialogDescription>
        Add a new inventory transaction to update stock levels.
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-6 my-4 overflow-y-auto pr-2 flex-1">
      <!-- Transaction Type Selection -->
      <div class="space-y-2">
        <Label>Transaction Type</Label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button 
            v-for="type in transactionTypes" 
            :key="type.value"
            variant="outline" 
            :class="{'bg-primary/10 border-primary text-primary': transaction.type === type.value}"
            @click="selectTransactionType(type.value)"
            class="flex flex-col items-center p-3 h-auto"
          >
            <component :is="type.icon" class="h-6 w-6 mb-1" />
            <span>{{ type.label }}</span>
          </Button>
        </div>
      </div>
      
      <!-- Basic Transaction Details -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="reference-number">Reference Number</Label>
          <Input 
            id="reference-number"
            v-model="transaction.referenceNumber"
            placeholder="Auto-generated if left empty"
          />
        </div>
        <div class="space-y-2">
          <Label for="transaction-date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="transaction-date"
                variant="outline"
                :class="{ 'text-muted-foreground': !transaction.date }"
                class="w-full justify-start text-left"
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{ transaction.date ? formatDate(transaction.date) : 'Select date' }}
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar
                v-model="transaction.date"
                mode="single"
                :disabled-dates="{ after: new Date() }"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <!-- Location Selection -->
      <div>
        <div v-if="transaction.type === 'transfer'">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="source-location">Source Location</Label>
              <Select 
                v-model="transaction.sourceLocationId"
                :disabled="!locations.length"
              >
                <SelectTrigger id="source-location">
                  <SelectValue placeholder="Select source location" />
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
              <Label for="destination-location">Destination Location</Label>
              <Select 
                v-model="transaction.destinationLocationId"
                :disabled="!locations.length || !transaction.sourceLocationId"
              >
                <SelectTrigger id="destination-location">
                  <SelectValue placeholder="Select destination location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="location in availableDestinationLocations" 
                    :key="location.id" 
                    :value="location.id"
                  >
                    {{ location.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div v-else class="space-y-2">
          <Label for="location">Location</Label>
          <Select 
            v-model="transaction.locationId"
            :disabled="!locations.length"
          >
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
      </div>
      
      <!-- Items Selection -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <Label>Transaction Items</Label>
          <Button 
            variant="outline" 
            size="sm" 
            @click="addItem"
            :disabled="!canAddItems"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        <div v-if="transaction.items.length === 0" class="border border-dashed rounded-md p-6 flex flex-col items-center justify-center">
          <PackageIcon class="h-10 w-10 mb-2 text-muted-foreground" />
          <p class="text-sm text-muted-foreground">No items added to this transaction</p>
          <Button 
            variant="outline" 
            size="sm" 
            class="mt-4" 
            @click="addItem"
            :disabled="!canAddItems"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="(item, index) in transaction.items" 
            :key="index" 
            class="border rounded-md p-4 space-y-3"
          >
            <div class="flex items-center justify-between">
              <h4 class="font-medium">Item {{ index + 1 }}</h4>
              <Button variant="ghost" size="icon" @click="removeItem(index)">
                <XIcon class="h-4 w-4" />
              </Button>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label :for="`item-${index}`">Item</Label>
                <Select 
                  v-model="item.itemId"
                  :disabled="!availableItems.length"
                >
                  <SelectTrigger :id="`item-${index}`">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup v-for="(group, category) in groupedItems" :key="category">
                      <SelectLabel>{{ getCategoryName(category) }}</SelectLabel>
                      <SelectItem 
                        v-for="inventoryItem in group" 
                        :key="inventoryItem.id" 
                        :value="inventoryItem.id"
                      >
                        {{ inventoryItem.name }} ({{ inventoryItem.sku }})
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div class="space-y-2">
                <Label :for="`quantity-${index}`">Quantity</Label>
                <div class="flex">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    class="rounded-r-none" 
                    @click="decrementQuantity(index)"
                    :disabled="getMinQuantity(item) >= item.quantity"
                  >
                    <MinusIcon class="h-4 w-4" />
                  </Button>
                  <Input 
                    :id="`quantity-${index}`"
                    v-model="item.quantity"
                    type="number"
                    class="rounded-none text-center"
                    :min="getMinQuantity(item)"
                    :max="getMaxQuantity(item)"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    class="rounded-l-none" 
                    @click="incrementQuantity(index)"
                    :disabled="getMaxQuantity(item) <= item.quantity"
                  >
                    <PlusIcon class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div v-if="item.itemId" class="text-xs flex justify-between mt-2">
              <span class="text-muted-foreground">Available: {{ getItemAvailableStock(item.itemId) }}</span>
              <Badge :variant="getStockLevelVariant(item.itemId)">
                {{ getStockLevelLabel(item.itemId) }}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Additional Details -->
      <div class="space-y-2">
        <Label for="notes">Notes</Label>
        <Textarea 
          id="notes"
          v-model="transaction.notes"
          placeholder="Add any additional details about this transaction..."
          rows="3"
        />
      </div>
    </div>
    
    <DialogFooter class="mt-2 pt-2 border-t">
      <div class="flex justify-between w-full">
        <div class="text-sm text-muted-foreground">
          <span v-if="transaction.items.length > 0">
            {{ transaction.items.length }} items selected
          </span>
        </div>
        <div class="flex space-x-2">
          <Button variant="outline" @click="$emit('close')">Cancel</Button>
          <Button 
            type="submit" 
            @click="createTransaction"
            :disabled="!isFormValid"
          >
            Create Transaction
          </Button>
        </div>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import { 
  PlusIcon, XIcon, MinusIcon, CalendarIcon, PackageIcon,
  ShoppingCartIcon, ArrowUpIcon, ClipboardCheckIcon, ArrowRightIcon
} from 'lucide-vue-next'
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  locations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['transaction-created', 'close'])

// Transaction types
const transactionTypes = [
  { value: 'receipt', label: 'Receipt', icon: ShoppingCartIcon },
  { value: 'issue', label: 'Issue', icon: ArrowUpIcon },
  { value: 'adjustment', label: 'Adjustment', icon: ClipboardCheckIcon },
  { value: 'transfer', label: 'Transfer', icon: ArrowRightIcon }
]

// Transaction model
const transaction = ref({
  type: 'receipt',
  referenceNumber: '',
  date: new Date(),
  locationId: '',
  sourceLocationId: '',
  destinationLocationId: '',
  status: 'pending',
  items: [],
  notes: ''
})

// Group items by category
const groupedItems = computed(() => {
  const grouped = {}
  
  props.items.forEach(item => {
    const category = item.categoryId || 'uncategorized'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(item)
  })
  
  return grouped
})

// Available destination locations (for transfers)
const availableDestinationLocations = computed(() => {
  if (!transaction.value.sourceLocationId) return []
  
  return props.locations.filter(loc => 
    loc.id !== transaction.value.sourceLocationId && 
    loc.status === 'active'
  )
})

// Filter available items based on transaction type and selected location
const availableItems = computed(() => {
  if (transaction.value.type === 'receipt') {
    // For receipts, all items are available
    return props.items
  } else if (transaction.value.type === 'issue' || transaction.value.type === 'adjustment') {
    // For issues and adjustments, items must be available at the selected location
    if (!transaction.value.locationId) return []
    
    return props.items.filter(item => {
      const locationStock = item.locations.find(loc => loc.id === transaction.value.locationId)
      return locationStock && locationStock.quantity > 0
    })
  } else if (transaction.value.type === 'transfer') {
    // For transfers, items must be available at the source location
    if (!transaction.value.sourceLocationId) return []
    
    return props.items.filter(item => {
      const locationStock = item.locations.find(loc => loc.id === transaction.value.sourceLocationId)
      return locationStock && locationStock.quantity > 0
    })
  }
  
  return []
})

// Check if form is valid
const isFormValid = computed(() => {
  // Common validations
  if (!transaction.value.date) return false
  if (transaction.value.items.length === 0) return false
  
  // Transaction type specific validations
  if (transaction.value.type === 'transfer') {
    if (!transaction.value.sourceLocationId || !transaction.value.destinationLocationId) return false
  } else {
    if (!transaction.value.locationId) return false
  }
  
  // Validate items
  for (const item of transaction.value.items) {
    if (!item.itemId || !item.quantity) return false
    
    // For issues and transfers, ensure quantity doesn't exceed available stock
    if (transaction.value.type === 'issue' || transaction.value.type === 'transfer') {
      const availableStock = getItemAvailableStock(item.itemId)
      if (item.quantity > availableStock) return false
    }
  }
  
  return true
})

// Check if we can add more items
const canAddItems = computed(() => {
  if (transaction.value.type === 'receipt') {
    return transaction.value.locationId !== ''
  } else if (transaction.value.type === 'issue' || transaction.value.type === 'adjustment') {
    return transaction.value.locationId !== '' && availableItems.value.length > 0
  } else if (transaction.value.type === 'transfer') {
    return transaction.value.sourceLocationId !== '' && 
           transaction.value.destinationLocationId !== '' && 
           availableItems.value.length > 0
  }
  
  return false
})

// Methods
function selectTransactionType(type) {
  // Reset items when changing transaction type
  transaction.value.items = []
  transaction.value.type = type
  
  // Reset location IDs
  if (type === 'transfer') {
    transaction.value.locationId = ''
  } else {
    transaction.value.sourceLocationId = ''
    transaction.value.destinationLocationId = ''
  }
}

function formatDate(date) {
  return format(date, 'PPP')
}

function addItem() {
  transaction.value.items.push({
    itemId: '',
    quantity: 1
  })
}

function removeItem(index) {
  transaction.value.items.splice(index, 1)
}

function incrementQuantity(index) {
  const item = transaction.value.items[index]
  const maxQuantity = getMaxQuantity(item)
  
  if (item.quantity < maxQuantity) {
    item.quantity++
  }
}

function decrementQuantity(index) {
  const item = transaction.value.items[index]
  const minQuantity = getMinQuantity(item)
  
  if (item.quantity > minQuantity) {
    item.quantity--
  }
}

function getMinQuantity(item) {
  return 1
}

function getMaxQuantity(item) {
  if (!item.itemId) return 999
  
  if (transaction.value.type === 'receipt') {
    return 999 // No limit for receipts
  } else if (transaction.value.type === 'issue' || transaction.value.type === 'transfer') {
    return getItemAvailableStock(item.itemId)
  } else if (transaction.value.type === 'adjustment') {
    // For adjustments, allow reasonable ranges
    const currentStock = getItemAvailableStock(item.itemId)
    return currentStock + 100 // Allow adjusting up to 100 units above current stock
  }
  
  return 999
}

function getItemAvailableStock(itemId) {
  const item = props.items.find(i => i.id === itemId)
  if (!item) return 0
  
  if (transaction.value.type === 'transfer') {
    const locationStock = item.locations.find(loc => loc.id === transaction.value.sourceLocationId)
    return locationStock ? locationStock.quantity : 0
  } else {
    const locationStock = item.locations.find(loc => loc.id === transaction.value.locationId)
    return locationStock ? locationStock.quantity : 0
  }
}

function getStockLevelLabel(itemId) {
  const stock = getItemAvailableStock(itemId)
  
  if (stock <= 0) return 'Out of Stock'
  if (stock <= 2) return 'Critical'
  if (stock <= 5) return 'Low Stock'
  return 'In Stock'
}

function getStockLevelVariant(itemId) {
  const stock = getItemAvailableStock(itemId)
  
  if (stock <= 0) return 'destructive'
  if (stock <= 2) return 'destructive'
  if (stock <= 5) return 'warning'
  return 'success'
}

function getCategoryName(categoryId) {
  const categories = {
    'cat-001': 'Tools',
    'cat-002': 'Customer Premise Equipment',
    'cat-003': 'Network Termination',
    'cat-004': 'Cabling',
    'uncategorized': 'Uncategorized'
  }
  
  return categories[categoryId] || 'Other'
}

function createTransaction() {
  if (!isFormValid.value) return
  
  // Generate reference number if not provided
  if (!transaction.value.referenceNumber) {
    const typePrefix = transaction.value.type.slice(0, 3).toUpperCase()
    const timestamp = Date.now().toString().slice(-6)
    transaction.value.referenceNumber = `${typePrefix}-${timestamp}`
  }
  
  // Prepare transaction object
  const newTransaction = {
    ...transaction.value,
    createdAt: new Date().toISOString(),
    completedAt: null
  }
  
  // Add location information based on transaction type
  if (transaction.value.type === 'transfer') {
    newTransaction.fromLocationId = transaction.value.sourceLocationId
    newTransaction.toLocationId = transaction.value.destinationLocationId
    delete newTransaction.locationId
  } else {
    delete newTransaction.sourceLocationId
    delete newTransaction.destinationLocationId
  }
  
  emit('transaction-created', newTransaction)
}

// Watch for changes in transaction type to update location selections
watch(() => transaction.value.type, (newType) => {
  // Reset items when changing transaction type
  transaction.value.items = []
})

// Set default location if only one is available
watch(() => props.locations, (newLocations) => {
  if (newLocations.length === 1) {
    if (transaction.value.type === 'transfer') {
      transaction.value.sourceLocationId = newLocations[0].id
    } else {
      transaction.value.locationId = newLocations[0].id
    }
  }
}, { immediate: true })
</script>