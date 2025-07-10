<template>
  <div class="flex flex-col h-[calc(85vh)]">
    <div class="flex items-center justify-between p-2">
      <div>
        <h3 class="text-lg font-medium">Issue Inventory</h3>
        <p class="text-sm text-muted-foreground">Record inventory issued to customers or other locations</p>
      </div>
      <Button variant="ghost" size="icon" @click="$emit('close')">
        <XIcon class="h-4 w-4" />
      </Button>
    </div>
    
    <Separator />
    
    <div class="flex-1 overflow-y-auto pr-1">
      <form @submit.prevent="handleSubmit" class="space-y-8 p-2">
        <!-- Transaction Type Selection -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium">Issue Type</h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="issue-type">Transaction Type *</Label>
              <Select v-model="form.issueType" @update:model-value="onIssueTypeChange">
                <SelectTrigger id="issue-type">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE_ITEM">Single Item Issue</SelectItem>
                  <SelectItem value="MULTI_ITEM">Multi-Item Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="purpose">Purpose *</Label>
              <Select v-model="form.purpose" required>
                <SelectTrigger id="purpose">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALE">Sale</SelectItem>
                  <SelectItem value="PRODUCTION">Production</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="SAMPLE">Sample</SelectItem>
                  <SelectItem value="WASTE">Waste</SelectItem>
                  <SelectItem value="QUALITY_CONTROL">Quality Control</SelectItem>
                  <SelectItem value="REWORK">Rework</SelectItem>
                  <SelectItem value="CUSTOMER_RETURN">Customer Return</SelectItem>
                  <SelectItem value="INTERNAL_USE">Internal Use</SelectItem>
                  <SelectItem value="CONSIGNMENT">Consignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <!-- Transaction Details -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium">Transaction Details</h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2" v-if="form.issueType === 'MULTI_ITEM'">
              <Label for="transaction-date">Date & Time *</Label>
              <DatePicker
                v-model="form.transactionDate"
                placeholder="Select transaction date and time"
                class="w-full"
                :include-time="true"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="warehouse">Source Warehouse *</Label>
              <Select v-model="form.locationId" required @update:model-value="onWarehouseChange">
                <SelectTrigger id="warehouse">
                  <SelectValue placeholder="Select source warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup v-for="group in warehouseGroups" :key="group.type">
                    <SelectLabel>{{ formatLocationType(group.type) }}</SelectLabel>
                    <SelectItem 
                      v-for="warehouse in group.warehouses" 
                      :key="warehouse.id" 
                      :value="warehouse.id"
                    >
                      {{ warehouse.name || warehouse.code }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="reference-type">Reference Type</Label>
              <Select v-model="form.referenceType">
                <SelectTrigger id="reference-type">
                  <SelectValue placeholder="Select reference type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALES_ORDER">Sales Order</SelectItem>
                  <SelectItem value="WORK_ORDER">Work Order</SelectItem>
                  <SelectItem value="TRANSFER_ORDER">Transfer Order</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="reference-number">Reference Number</Label>
              <Input 
                id="reference-number" 
                v-model="form.referenceNumber" 
                placeholder="Order number, request number, etc."
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" v-if="form.issueType === 'MULTI_ITEM'">
            <div class="space-y-2">
              <Label for="reference-id">Reference ID</Label>
              <Input 
                id="reference-id" 
                v-model="form.referenceId" 
                placeholder="Unique reference identifier"
              />
            </div>
            
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <input 
                  id="requires-quality-check" 
                  v-model="form.requiresQualityCheck" 
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label for="requires-quality-check">Requires Quality Check</Label>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" v-if="form.issueType === 'MULTI_ITEM'">
            <div class="space-y-2">
              <Label for="priority">Priority</Label>
              <Select v-model="form.priority">
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" v-if="form.issueType === 'SINGLE_ITEM'">
            <div class="space-y-2">
              <Label for="customer">Customer</Label>
              <Select v-model="form.customerId">
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="customer in customers" :key="customer.id" :value="customer.id">
                    {{ customer.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="issued-by">Issued By *</Label>
              <Input 
                id="issued-by" 
                v-model="form.issuedBy" 
                placeholder="Name of person issuing items"
                required
              />
            </div>
            
            <div class="space-y-2" v-if="form.issueType === 'MULTI_ITEM'">
              <Label for="authorized-by">Authorized By</Label>
              <Input 
                id="authorized-by" 
                v-model="form.authorizedBy" 
                placeholder="Name of authorizing person"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="notes">Notes</Label>
            <Textarea 
              id="notes" 
              v-model="form.notes" 
              placeholder="Enter any additional information about this issue" 
              rows="3"
            />
          </div>
          
          <div class="space-y-2" v-if="form.issueType === 'MULTI_ITEM'">
            <Label for="quality-notes">Quality Notes</Label>
            <Textarea 
              id="quality-notes" 
              v-model="form.qualityNotes" 
              placeholder="Enter quality control notes for this transaction" 
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
              v-if="form.issueType !== 'SINGLE_ITEM'"
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
                  v-if="form.issueType !== 'SINGLE_ITEM'"
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
                      <div v-if="item.itemId && getItemAvailability(item.itemId) > 0" class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        Available: {{ getItemAvailability(item.itemId) }}
                      </div>
                    </div>
                    <div v-if="item.itemId" class="flex items-center justify-between text-xs">
                      <span class="text-muted-foreground">
                        Available Stock: 
                        <span class="font-medium" :class="getItemAvailability(item.itemId) > 0 ? 'text-green-600' : 'text-red-600'">
                          {{ getItemAvailability(item.itemId) }}
                        </span>
                      </span>
                      <span v-if="isQuantityExceedsAvailable(item)" class="text-destructive font-medium">
                        ⚠️ Exceeds stock
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`cost-${index}`">Unit Cost *</Label>
                    <div class="relative">
                      <span class="absolute left-2.5 top-1/2 -translate-y-1/2"></span>
                      <Input 
                        :id="`cost-${index}`" 
                        v-model.number="item.unitCost" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        class="pl-6"
                        required
                      />
                    </div>
                  </div>
                  
                  <div class="space-y-2" v-if="form.issueType === 'MULTI_ITEM'">
                    <Label :for="`quality-status-${index}`">Quality Status</Label>
                    <Select v-model="item.qualityStatus">
                      <SelectTrigger :id="`quality-status-${index}`">
                        <SelectValue placeholder="Select quality status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING_INSPECTION">Pending Inspection</SelectItem>
                        <SelectItem value="PASSED">Passed</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="CONDITIONAL_PASS">Conditional Pass</SelectItem>
                        <SelectItem value="QUARANTINED">Quarantined</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" v-if="form.issueType === 'MULTI_ITEM'">
                  <div class="space-y-2">
                    <Label :for="`lot-${index}`">Lot Number</Label>
                    <Input 
                      :id="`lot-${index}`" 
                      v-model="item.lotNumber" 
                      placeholder="Optional"
                    />
                  </div>
                  
                  <div class="space-y-2">
                    <Label :for="`batch-${index}`">Batch Number</Label>
                    <Input 
                      :id="`batch-${index}`" 
                      v-model="item.batchNumber" 
                      placeholder="Optional"
                    />
                  </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" v-if="form.issueType === 'MULTI_ITEM'">
                  <div class="space-y-2">
                    <Label :for="`expiration-${index}`">Expiration Date</Label>
                    <DatePicker
                      v-model="item.expirationDate"
                      placeholder="Select expiration date"
                      class="w-full"
                    />
                  </div>
                  
                  <div class="space-y-2" v-if="form.issueType === 'MULTI_ITEM'">
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
                  </div>
                </div>
                
                <div class="space-y-2" v-if="form.issueType === 'MULTI_ITEM'">
                  <Label :for="`item-notes-${index}`">Item Notes</Label>
                  <Textarea 
                    :id="`item-notes-${index}`" 
                    v-model="item.itemNotes" 
                    placeholder="Optional notes for this item"
                    rows="2"
                  />
                </div>
                
                <div class="space-y-2" v-if="form.issueType === 'MULTI_ITEM'">
                  <Label :for="`item-quality-notes-${index}`">Item Quality Notes</Label>
                  <Textarea 
                    :id="`item-quality-notes-${index}`" 
                    v-model="item.qualityNotes" 
                    placeholder="Quality control notes for this specific item"
                    rows="2"
                  />
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
          <span>{{ submitting ? 'Submitting...' : 'Complete Issue' }}</span>
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
import { Badge } from '@/components/ui/badge'
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
  warehouses: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: () => []
  },
  customers: {
    type: Array,
    default: () => []
  },
  purchaseOrders: {
    type: Array,
    default: () => []
  },
  purchaseOrdersLoading: {
    type: Boolean,
    default: false
  },
  purchaseOrdersPaginationMeta: {
    type: Object,
    default: () => ({
      page: 0,
      totalPages: 0,
      hasMore: false
    })
  },
  // For pre-filling form with a scanned item
  scannedItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'close', 
  'transaction-created', 
  'multi-issue-from-po',
  'load-purchase-orders'
])

// Form state
const form = reactive({
  issueType: 'SINGLE_ITEM', // SINGLE_ITEM, MULTI_ITEM
  transactionDate: formatCurrentDateTime(),
  locationId: null,
  purpose: 'SALE',
  referenceType: 'MANUAL',
  referenceNumber: '',
  referenceId: '',
  requiresQualityCheck: false,
  priority: 'NORMAL',
  issuedBy: '',
  authorizedBy: '',
  notes: '',
  qualityNotes: '',
  customerId: null,
  items: []
})

const serialNumberInputs = ref({})
const submitting = ref(false)
const itemAvailability = ref({})

// Methods
const onIssueTypeChange = (newType) => {
  // Clear items and reset for single item issue
  if (newType === 'SINGLE_ITEM') {
    form.items = []
    if (form.items.length === 0) {
      addItemRow()
    }
  }
}

const onWarehouseChange = (warehouseId) => {
  // Update item availability when warehouse changes, only for items that have been selected
  form.items.forEach((item, index) => {
    if (item.itemId) {
      updateItemAvailability(index)
    }
  })
}

// Serial number methods
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

// Computed properties
const warehouseGroups = computed(() => {
  // Filter out customer warehouses since they're in a separate dropdown and group by type
  const filteredWarehouses = props.warehouses.filter(
    warehouse => warehouse.type !== 'customer' && warehouse.isActive
  )
  
  // Group warehouses by type
  const groups = {}
  filteredWarehouses.forEach(warehouse => {
    const type = warehouse.type || 'warehouse'
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(warehouse)
  })

  // Convert to array format for SelectGroup
  return Object.entries(groups).map(([type, warehouses]) => ({
    type,
    warehouses
  }))
})

const isFormValid = computed(() => {
  // Check basic transaction details
  if (!form.locationId || !form.purpose || !form.issuedBy) {
    return false
  }
  
  // For multi-item transactions, transactionDate is required
  if (form.issueType === 'MULTI_ITEM' && !form.transactionDate) {
    return false
  }
  
  // Check if we have at least one item
  if (form.items.length === 0) {
    return false
  }
  
  // Check that each item has required fields
  for (const item of form.items) {
    if (!item.itemId || !item.quantity || item.quantity <= 0 || !item.unitCost) {
      return false
    }
  }
  
  return true
})

// Methods
function calculateSubtotal(item) {
  const cost = item.unitCost || 0
  const quantity = item.quantity || 0
  return cost * quantity
}

function calculateTotal() {
  return form.items.reduce((total, item) => {
    return total + calculateSubtotal(item)
  }, 0)
}

function addItemRow() {
  const index = form.items.length
  
  // For single item issue, only allow one item
  if (form.issueType === 'SINGLE_ITEM' && form.items.length >= 1) {
    return
  }
  
  const baseItem = {
    itemId: null,
    quantity: 1,
    unitCost: 0
  }
  
  // Add additional fields for multi-item transactions
  if (form.issueType === 'MULTI_ITEM') {
    Object.assign(baseItem, {
      lotNumber: '',
      batchNumber: '',
      qualityStatus: 'PASSED',
      itemNotes: '',
      qualityNotes: '',
      expirationDate: '',
      serialNumbers: []
    })
  }
  
  form.items.push(baseItem)
  serialNumberInputs.value[index] = ''
}

function removeItemRow(index) {
  // For single item issue, don't allow removing the only item
  if (form.issueType === 'SINGLE_ITEM') {
    return
  }
  
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
    currency: 'KES' 
  }).format(value || 0)
}

function updateItemAvailability(index) {
  const itemId = form.items[index].itemId
  if (!itemId) {
    // Clear availability when no item is selected
    return
  }
  
  // Find the selected item
  const item = props.items.find(i => i.id === itemId)
  if (item) {
    // Use the item's volume as the available quantity
    itemAvailability.value[itemId] = item.volume || 0
    
    // Default cost to the item's standard cost, average cost, or last cost
    if (!form.items[index].unitCost) {
      form.items[index].unitCost = item.standardCost || item.averageCost || item.lastCost || 0
    }
  } else {
    // Clear availability if item not found
    itemAvailability.value[itemId] = 0
  }
}

function getItemAvailability(itemId) {
  return itemAvailability.value[itemId] || 0
}

function isQuantityExceedsAvailable(item) {
  if (!item.itemId) return false
  const available = getItemAvailability(item.itemId)
  return item.quantity > available
}

async function handleSubmit() {
  if (!isFormValid.value) return
  
  submitting.value = true
  
  try {
    if (form.issueType === 'SINGLE_ITEM') {
      // Single Item Issue Transaction - matches exact API contract
      const singleItem = form.items[0]
      const transaction = {
        itemId: singleItem.itemId,
        locationId: form.locationId,
        quantity: singleItem.quantity,
        unitCost: singleItem.unitCost,
        issueType: form.purpose,
        referenceNumber: form.referenceNumber || null,
        referenceType: form.referenceType || null,
        customerId: form.customerId || null,
        notes: form.notes || null
      }
      
      emit('transaction-created', { type: 'SINGLE_ITEM_ISSUE', payload: transaction })
    } else {
      // Multi-Item Issue Transaction - matches exact API contract
      const transaction = {
        locationId: form.locationId,
        transactionDate: ensureDateTimeFormat(form.transactionDate),
        issueType: form.purpose,
        referenceType: form.referenceType || null,
        referenceNumber: form.referenceNumber || null,
        referenceId: form.referenceId || null,
        requiresQualityCheck: form.requiresQualityCheck || false,
        priority: form.priority || 'NORMAL',
        issuedBy: form.issuedBy,
        authorizedBy: form.authorizedBy || null,
        notes: form.notes || null,
        qualityNotes: form.qualityNotes || null,
        purpose: form.purpose,
        items: form.items.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          lotNumber: item.lotNumber || null,
          batchNumber: item.batchNumber || null,
          qualityStatus: item.qualityStatus || null,
          expirationDate: ensureDateTimeFormat(item.expirationDate) || null,
          serialNumbers: item.serialNumbers && item.serialNumbers.length > 0 ? item.serialNumbers : null,
          itemNotes: item.itemNotes || null,
          qualityNotes: item.qualityNotes || null
        }))
      }
      
      emit('transaction-created', { type: 'MULTI_ITEM_ISSUE', payload: transaction })
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
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
      form.items[0].unitCost = matchedItem.cost || 0
      
      // If we have a source location set, update item availability
      if (form.locationId) {
        updateItemAvailability(0)
      }
    }
  }
})
</script>