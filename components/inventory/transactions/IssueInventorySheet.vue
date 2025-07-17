<template>
  <div class="flex flex-col h-[calc(85vh)]">
    <div class="flex items-center justify-between p-2">
      <div>
        <h3 class="text-lg font-medium">Issue Inventory</h3>
        <p class="text-sm text-muted-foreground">Record multi-item inventory issues to customers or other locations</p>
      </div>
      <Button variant="ghost" size="icon" @click="$emit('close')">
        <XIcon class="h-4 w-4" />
      </Button>
    </div>

    <Separator />

    <div class="flex-1 overflow-y-auto pr-1">
      <form @submit.prevent="handleSubmit" class="space-y-6 p-2">
        <!-- Transaction Details -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium">Transaction Details</h4>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="issue-type">Issue Type *</Label>
              <Select v-model="form.issueType" required>
                <SelectTrigger id="issue-type">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALE">Sale</SelectItem>
                  <SelectItem value="PRODUCTION">Production</SelectItem>
                  <SelectItem value="INTERNAL_USE">Internal Use</SelectItem>
                  <SelectItem value="RETURN">Return</SelectItem>
                  <SelectItem value="WASTE">Waste</SelectItem>
                  <SelectItem value="SCRAP">Scrap</SelectItem>
                  <SelectItem value="SAMPLE">Sample</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="TESTING">Testing</SelectItem>
                  <SelectItem value="REPAIR">Repair</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="PROMOTIONAL">Promotional</SelectItem>
                  <SelectItem value="CONSUMPTION">Consumption</SelectItem>
                  <SelectItem value="LOSS">Loss</SelectItem>
                  <SelectItem value="DAMAGE">Damage</SelectItem>
                  <SelectItem value="SPOILAGE">Spoilage</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="QUALITY_CONTROL">Quality Control</SelectItem>
                  <SelectItem value="RESEARCH_AND_DEVELOPMENT">Research and Development</SelectItem>
                  <SelectItem value="EMPLYEE_USE">Emplyee Use</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="purpose">Purpose *</Label>
              <Input id="purpose" v-model="form.purpose"
                placeholder="Enter purpose (e.g., Sale, Production, Transfer, etc.)" required />
            </div>
            <div class="space-y-2">
              <Label for="transaction-date">Date & Time *</Label>
              <DatePicker v-model="form.transactionDate" placeholder="Select transaction date and time" class="w-full"
                :include-time="true" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="warehouse">Source Warehouse *</Label>
              <Select v-model="form.locationId" required @update:model-value="onWarehouseChange">
                <SelectTrigger id="warehouse">
                  <SelectValue placeholder="Select source warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup v-for="group in warehouseGroups" :key="group.type">
                    <SelectLabel>{{ formatLocationType(group.type) }}</SelectLabel>
                    <SelectItem v-for="warehouse in group.warehouses" :key="warehouse.id" :value="warehouse.id">
                      {{ warehouse.name || warehouse.code }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

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

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="reference-type">Reference Type</Label>
              <Select v-model="form.referenceType" @update:model-value="onReferenceTypeChange">
                <SelectTrigger id="reference-type">
                  <SelectValue placeholder="Select reference type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PURCHASE_ORDER">Purchase Order</SelectItem>
                  <SelectItem value="SALES_ORDER">Sales Order</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="PRODUCTION_ORDER">Production Order</SelectItem>
                  <SelectItem value="WORK_ORDER">Work Order</SelectItem>
                  <SelectItem value="RETURN_AUTHORIZATION">Return Authorization</SelectItem>
                  <SelectItem value="CYCLE_COUNT">Cycle Count</SelectItem>
                  <SelectItem value="PHYSICAL_COUNT">Physical Count</SelectItem>
                  <SelectItem value="INVENTORY_RECEIPT">Inventory Receipt</SelectItem>
                  <SelectItem value="INVENTORY_ISSUE">Inventory Issue</SelectItem>
                  <SelectItem value="BILL_OF_MATERIALS">Bill of Materials</SelectItem>
                  <SelectItem value="MANUFACTURING_ORDER">Manufacturing Order</SelectItem>
                  <SelectItem value="QUALITY_CONTROL">Quality Control</SelectItem>
                  <SelectItem value="WASTE_DISPOSAL">Waste Disposal</SelectItem>
                  <SelectItem value="ASSET_DISPOSAL">Asset Disposal</SelectItem>
                  <SelectItem value="CUSTOMER_RETURN">Customer Return</SelectItem>
                  <SelectItem value="SUPPLIER_RETURN">Supplier Return</SelectItem>
                  <SelectItem value="INTERNAL_REQUEST">Internal Request</SelectItem>
                  <SelectItem value="MAINTENANCE_ORDER">Maintenance Order</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Sales Order Dropdown -->
            <div class="space-y-2" v-if="form.referenceType === 'SALES_ORDER'">
              <Label for="sales-order">Sales Order *</Label>
              <Select v-model="selectedSalesOrderId" @update:model-value="onSalesOrderChange">
                <SelectTrigger id="sales-order">
                  <SelectValue placeholder="Select sales order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="order in salesOrders" :key="order.id" :value="order.id">
                    {{ order.orderNumber || order.code }} - {{ order.customerName }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Work Order Dropdown -->
            <div class="space-y-2" v-if="form.referenceType === 'WORK_ORDER'">
              <Label for="work-order">Work Order *</Label>
              <Select v-model="selectedWorkOrderId" @update:model-value="onWorkOrderChange">
                <SelectTrigger id="work-order">
                  <SelectValue placeholder="Select work order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="order in workOrders" :key="order.id" :value="order.id">
                    {{ order.orderNumber || order.workOrderNumber || order.code }} - {{ order.bomName || order.title ||
                      order.description || order.productName }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Reference Number for other types -->
            <div class="space-y-2" v-if="!['SALES_ORDER', 'WORK_ORDER'].includes(form.referenceType)">
              <Label for="reference-number">Reference Number</Label>
              <Input id="reference-number" v-model="form.referenceNumber"
                placeholder="Order number, request number, etc." />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="authorized-by">Authorized By</Label>
              <Input id="authorized-by" v-model="form.authorizedBy" placeholder="Name of authorizing person" />
            </div>
          </div>

          <!-- Customer/User Selection Based on Reference Type -->
          <!-- These dropdowns are for UI display and validation only, not sent to API -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Customer dropdown for Sales Order -->
            <div class="space-y-2" v-if="form.referenceType === 'SALES_ORDER'">
              <Label for="customer">Customer *</Label>
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

            <!-- Users dropdown for Work Order -->
            <div class="space-y-2" v-if="form.referenceType === 'WORK_ORDER'">
              <Label for="assigned-user">Assigned User *</Label>
              <Select v-model="form.customerId">
                <SelectTrigger id="assigned-user">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.fullName }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Quality Check - show for all reference types -->
            <div class="space-y-2"
              :class="{ 'sm:col-start-2': !['SALES_ORDER', 'WORK_ORDER'].includes(form.referenceType) }">
              <div class="flex items-center space-x-2">
                <input id="requires-quality-check" v-model="form.requiresQualityCheck" type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <Label for="requires-quality-check">Requires Quality Check</Label>
              </div>
            </div>
          </div>

          <!-- Display selected entity -->
          <div v-if="selectedEntityLabel" class="flex items-center">
            <Badge variant="secondary" class="text-sm">
              {{ selectedEntityLabel }}
            </Badge>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="notes">Notes</Label>
              <Textarea id="notes" v-model="form.notes" placeholder="Enter any additional information about this issue"
                rows="3" />
            </div>

            <div class="space-y-2">
              <Label for="quality-notes">Quality Notes</Label>
              <Textarea id="quality-notes" v-model="form.qualityNotes"
                placeholder="Enter quality control notes for this transaction" rows="3" />
            </div>
          </div>
        </div>

        <Separator />

        <!-- Items -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium">Items</h4>
            <Button type="button" variant="outline" size="sm" @click="addItemRow">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div v-if="form.items.length === 0"
            class="border rounded-md p-8 flex flex-col items-center justify-center bg-muted/40">
            <PackageIcon class="h-8 w-8 text-muted-foreground mb-2" />
            <p class="text-muted-foreground">No items added yet.</p>
            <Button type="button" variant="outline" size="sm" class="mt-2" @click="addItemRow">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div v-else class="space-y-4">
            <Card v-for="(item, index) in form.items" :key="index" class="overflow-hidden">
              <CardHeader class="bg-muted/60 p-3 flex flex-row items-center justify-between">
                <CardTitle class="text-sm font-medium">Item {{ index + 1 }}</CardTitle>
                <Button type="button" variant="ghost" size="icon" class="h-7 w-7" @click="removeItemRow(index)">
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
                        <SelectItem v-for="inventoryItem in filteredItems" :key="inventoryItem.id"
                          :value="inventoryItem.id">
                          {{ inventoryItem.name || inventoryItem.itemName }} ({{ inventoryItem.itemCode }})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div class="space-y-2">
                    <Label :for="`quantity-${index}`">Quantity *</Label>
                    <div class="relative">
                      <Input :id="`quantity-${index}`" v-model.number="item.quantity" type="number" step="0.01" min="0"
                        placeholder="0" required :class="{ 'border-red-500': isQuantityExceedsAvailable(item) }" />
                      <div v-if="item.itemId && getItemAvailability(item.itemId) > 0"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        Available: {{ formatNumber(getItemAvailability(item.itemId)) }}
                      </div>
                    </div>
                    <div v-if="item.itemId" class="flex items-center justify-between text-xs">
                      <div class="flex items-center space-x-2">
                        <span class="text-muted-foreground">
                          Available Stock:
                          <span class="font-medium" :class="{
                            'text-green-600': getItemAvailability(item.itemId) > 0 && !isLowStock(item),
                            'text-orange-600': isLowStock(item),
                            'text-red-600': isOutOfStock(item)
                          }">
                            {{ formatNumber(getItemAvailability(item.itemId)) }}
                          </span>
                        </span>
                        <Badge v-if="isLowStock(item)" variant="outline"
                          class="text-xs text-orange-600 border-orange-200">
                          Low Stock
                        </Badge>
                        <Badge v-else-if="isOutOfStock(item)" variant="outline"
                          class="text-xs text-red-600 border-red-200">
                          Out of Stock
                        </Badge>
                      </div>
                      <span v-if="isQuantityExceedsAvailable(item)" class="text-red-500 font-medium">
                        ⚠️ Exceeds available stock
                      </span>
                    </div>

                    <!-- Multi-location stock details -->
                    <div v-if="getStockByLocation(item).length > 1" class="mt-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" class="text-xs p-1 h-auto">
                            View stock by location ({{ getStockByLocation(item).length }} locations)
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-80" align="start">
                          <div class="space-y-3">
                            <h4 class="font-medium text-sm">Stock by Location</h4>
                            <div class="space-y-2 max-h-48 overflow-y-auto">
                              <div v-for="stock in getStockByLocation(item)" :key="stock.locationCode"
                                class="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
                                <div>
                                  <div class="font-medium">{{ stock.locationName }}</div>
                                  <div class="text-xs text-muted-foreground">{{ stock.locationCode }}</div>
                                </div>
                                <div class="text-right">
                                  <div class="font-medium">{{ formatNumber(stock.quantity) }}</div>
                                  <div v-if="stock.reserved > 0" class="text-xs text-orange-600">
                                    Reserved: {{ formatNumber(stock.reserved) }}
                                  </div>
                                  <div v-if="stock.allocated > 0" class="text-xs text-blue-600">
                                    Allocated: {{ formatNumber(stock.allocated) }}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`cost-${index}`">Unit Cost *</Label>
                    <div class="relative">
                      <Input :id="`cost-${index}`" v-model.number="item.unitCost" type="number" min="0" step="0.01"
                        placeholder="0.00" required />
                    </div>
                  </div>

                  <div class="space-y-2">
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

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`lot-${index}`">Lot Number</Label>
                    <Input :id="`lot-${index}`" v-model="item.lotNumber" placeholder="Optional" />
                  </div>

                  <div class="space-y-2">
                    <Label :for="`batch-${index}`">Batch Number</Label>
                    <Input :id="`batch-${index}`" v-model="item.batchNumber" placeholder="Optional" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`expiration-${index}`">Expiration Date</Label>
                    <DatePicker v-model="item.expirationDate" placeholder="Select expiration date" class="w-full" />
                  </div>

                  <div class="space-y-2">
                    <Label :for="`serial-${index}`">Serial Numbers</Label>
                    <div class="flex space-x-2">
                      <Input :id="`serial-${index}`" v-model="serialNumberInputs[index]"
                        placeholder="Add serial numbers" />
                      <Button type="button" variant="outline" class="shrink-0" @click="addSerialNumber(index)">
                        <PlusIcon class="h-4 w-4" />
                      </Button>
                    </div>
                    <div v-if="item.serialNumbers && item.serialNumbers.length > 0" class="flex flex-wrap gap-1 mt-2">
                      <Badge v-for="(serial, sIndex) in item.serialNumbers" :key="sIndex" variant="secondary"
                        class="flex items-center gap-1">
                        {{ serial }}
                        <Button type="button" variant="ghost" size="icon" class="h-4 w-4 p-0"
                          @click="removeSerialNumber(index, sIndex)">
                          <XIcon class="h-3 w-3" />
                        </Button>
                      </Badge>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label :for="`item-notes-${index}`">Item Notes</Label>
                    <Textarea :id="`item-notes-${index}`" v-model="item.itemNotes"
                      placeholder="Optional notes for this item" rows="2" />
                  </div>

                  <div class="space-y-2">
                    <Label :for="`item-quality-notes-${index}`">Item Quality Notes</Label>
                    <Textarea :id="`item-quality-notes-${index}`" v-model="item.qualityNotes"
                      placeholder="Quality control notes for this specific item" rows="2" />
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
        <Button type="button" variant="outline" @click="$emit('close')">
          Cancel
        </Button>
        <Button type="submit" :disabled="submitting || !isFormValid" @click="handleSubmit">
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  users: {
    type: Array,
    default: () => []
  },
  salesOrders: {
    type: Array,
    default: () => []
  },
  workOrders: {
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
  transactionDate: formatCurrentDateTime(),
  locationId: null,
  issueType: '', // New field for issue type
  purpose: '', // Optionally keep for legacy/notes
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

// Track selected orders for autofill
const selectedSalesOrderId = ref(null)
const selectedWorkOrderId = ref(null)

// Methods
const onWarehouseChange = (warehouseId) => {
  // Update item availability when warehouse changes, only for items that have been selected
  form.items.forEach((item, index) => {
    if (item.itemId) {
      updateItemAvailability(index)
    }
  })

  // Clear any validation errors related to stock availability
  form.items.forEach(item => {
    if (item.itemId && item.quantity > getItemAvailability(item.itemId)) {
      // Optionally adjust quantity to available stock or show warning
      console.warn(`Item ${item.itemId} quantity ${item.quantity} exceeds available stock ${getItemAvailability(item.itemId)} in selected warehouse`)
    }
  })
}

const onReferenceTypeChange = (newType) => {
  // Clear the selected customer/user when reference type changes
  form.customerId = null
  // Clear the order selections and reference fields
  selectedSalesOrderId.value = null
  selectedWorkOrderId.value = null
  form.referenceNumber = ''
  // For manual reference type, referenceId defaults to null, otherwise it will be set by order selection
  if (newType === 'MANUAL') {
    form.referenceId = null
  } else {
    form.referenceId = ''
  }
}

// Sales Order selection handler
const onSalesOrderChange = (orderId) => {
  if (!orderId) return

  const selectedOrder = props.salesOrders.find(order => order.id === orderId)
  if (selectedOrder) {
    // Autofill reference fields - referenceId is the order ID, referenceNumber is the order number
    form.referenceId = selectedOrder.id
    form.referenceNumber = selectedOrder.orderNumber || selectedOrder.code || ''
    // Set customer if available (for UI display only, not sent to API)
    if (selectedOrder.customerId) {
      form.customerId = selectedOrder.customerId
    }
  }
}

// Work Order selection handler
const onWorkOrderChange = (orderId) => {
  if (!orderId) return

  const selectedOrder = props.workOrders.find(order => order.id === orderId)
  if (selectedOrder) {
    // Autofill reference fields - referenceId is the order ID, referenceNumber is the order number
    form.referenceId = selectedOrder.id
    form.referenceNumber = selectedOrder.orderNumber || selectedOrder.workOrderNumber || selectedOrder.code || ''
    // Set assigned user if available (for UI display only, not sent to API)
    if (selectedOrder.assignedUserId) {
      form.customerId = selectedOrder.assignedUserId
    }
  }
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

// Filter items by selected warehouse/location
const filteredItems = computed(() => {
  // If no warehouse selected, show all items
  if (!form.locationId) return props.items
  // Only show items that have inventoryStocks in the selected location with available quantity > 0
  return props.items.filter(item => {
    if (!item.inventoryStocks || !Array.isArray(item.inventoryStocks)) return false
    return item.inventoryStocks.some(stock => {
      // Match by location id (direct or parent)
      let loc = stock.location
      while (loc) {
        if (loc.id === form.locationId) return (stock.quantityAvailable || 0) > 0
        loc = loc.parentLocation || null
      }
      return false
    })
  })
})

const isFormValid = computed(() => {
  // Check basic transaction details
  if (!form.locationId || !form.purpose || !form.transactionDate) {
    return false
  }

  // Check reference type specific requirements
  if (form.referenceType === 'SALES_ORDER') {
    if (!selectedSalesOrderId.value || !form.customerId) {
      return false
    }
  } else if (form.referenceType === 'WORK_ORDER') {
    if (!selectedWorkOrderId.value || !form.customerId) {
      return false
    }
  }

  // Check if we have at least one item
  if (form.items.length === 0) {
    return false
  }

  // Check that each item has required fields and doesn't exceed available stock
  for (const item of form.items) {
    if (!item.itemId || !item.quantity || item.quantity <= 0 || !item.unitCost) {
      return false
    }

    // Check if quantity exceeds available stock
    if (isQuantityExceedsAvailable(item)) {
      return false
    }

    // Check if item is out of stock
    if (isOutOfStock(item)) {
      return false
    }
  }

  return true
})

// Computed property to determine the selected entity label
const selectedEntityLabel = computed(() => {
  if (form.referenceType === 'SALES_ORDER') {
    if (selectedSalesOrderId.value) {
      const selectedOrder = props.salesOrders.find(order => order.id === selectedSalesOrderId.value)
      if (selectedOrder) {
        return `Sales Order: ${selectedOrder.orderNumber || selectedOrder.code} - ${selectedOrder.customerName}`
      }
    }
    if (form.customerId) {
      const customer = props.customers.find(c => c.id === form.customerId)
      return customer ? `Customer: ${customer.name}` : ''
    }
  } else if (form.referenceType === 'WORK_ORDER') {
    if (selectedWorkOrderId.value) {
      const selectedOrder = props.workOrders.find(order => order.id === selectedWorkOrderId.value)
      if (selectedOrder) {
        const orderNumber = selectedOrder.orderNumber || selectedOrder.workOrderNumber || selectedOrder.code
        const orderName = selectedOrder.bomName || selectedOrder.title || selectedOrder.description || selectedOrder.productName || ''
        return `Work Order: ${orderNumber} - ${orderName}`
      }
    }
    if (form.customerId) {
      const user = props.users.find(u => u.id === form.customerId)
      return user ? `Assigned to: ${user.fullName}` : ''
    }
  }
  return ''
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
  const item = {
    itemId: null,
    quantity: 1,
    unitCost: 0,
    lotNumber: '',
    batchNumber: '',
    qualityStatus: 'PASSED',
    itemNotes: '',
    qualityNotes: '',
    expirationDate: '',
    serialNumbers: []
  }
  form.items.push(item)
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

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0)
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
    // Calculate total stock using the same logic as InventoryItemsTable
    const totalStock = getTotalStock(item)
    itemAvailability.value[itemId] = totalStock

    // Default cost to the item's standard cost, average cost, or last cost
    if (!form.items[index].unitCost) {
      form.items[index].unitCost = item.standardCost || item.averageCost || item.lastCost || 0
    }
  } else {
    // Clear availability if item not found
    itemAvailability.value[itemId] = 0
  }
}

function getTotalStock(item) {
  if (item.inventoryStocks && Array.isArray(item.inventoryStocks)) {
    return item.inventoryStocks.reduce((total, stock) => {
      return total + (stock.quantityAvailable || stock.quantity || 0)
    }, 0)
  }
  return item.stockOnHand || item.currentStock || item.volume || 0
}

function getItemAvailability(itemId) {
  return itemAvailability.value[itemId] || 0
}

function isQuantityExceedsAvailable(item) {
  if (!item.itemId) return false
  const available = getItemAvailability(item.itemId)
  return item.quantity > available
}

function isLowStock(item) {
  const itemData = props.items.find(i => i.id === item.itemId)
  if (!itemData) return false

  const stock = getTotalStock(itemData)
  const reorderPoint = itemData.reorderPoint || itemData.reorderLevel || 0
  const minStock = itemData.minStockLevel || itemData.minimumStock || 0
  return stock <= Math.max(reorderPoint, minStock) && stock > 0
}

function isOutOfStock(item) {
  const itemData = props.items.find(i => i.id === item.itemId)
  if (!itemData) return true

  return getTotalStock(itemData) === 0
}

function getStockByLocation(item) {
  const itemData = props.items.find(i => i.id === item.itemId)
  if (!itemData || !itemData.inventoryStocks || !Array.isArray(itemData.inventoryStocks)) {
    return []
  }

  return itemData.inventoryStocks.map(stock => ({
    locationCode: stock.location?.code || 'Unknown',
    locationName: stock.location?.name || 'Unknown Location',
    quantity: Number(stock.quantity || stock.quantityAvailable) || 0,
    reserved: Number(stock.reserved || stock.quantityReserved) || 0,
    allocated: Number(stock.allocated || stock.quantityAllocated) || 0,
  })).sort((a, b) => {
    // Sort by quantity descending, then by location name
    if (b.quantity !== a.quantity) {
      return b.quantity - a.quantity
    }
    return a.locationName.localeCompare(b.locationName)
  })
}

async function handleSubmit() {
  if (!isFormValid.value) return

  submitting.value = true

  try {
    // Get the logged-in user name from localStorage
    const loggedInUserName = localStorage.getItem('name') || 'Unknown User'

    const transaction = {
      locationId: form.locationId,
      transactionDate: ensureDateTimeFormat(form.transactionDate),
      issueType: form.issueType || '',
      referenceType: form.referenceType || null,
      referenceNumber: form.referenceNumber || null,
      referenceId: form.referenceId ? Number(form.referenceId) : 0,
      requiresQualityCheck: form.requiresQualityCheck || false,
      priority: form.priority || 'NORMAL',
      purpose: form.purpose, 
      issuedBy: loggedInUserName,
      authorizedBy: form.authorizedBy || null,
      notes: form.notes || null,
      qualityNotes: form.qualityNotes || null,
      ...(form.customerId ? { customerId: form.customerId } : {}),
      ...(form.supplierId ? { supplierId: form.supplierId } : {}),
      items: form.items.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        lotNumber: item.lotNumber || null,
        batchNumber: item.batchNumber || null,
        qualityStatus: item.qualityStatus || null,
        itemNotes: item.itemNotes || null,
        qualityNotes: item.qualityNotes || null
      }))
    }

    // Note: customerId and assignedUserId are not included in the API payload
    // These fields are kept in the form for UI display purposes only

    emit('transaction-created', { type: 'MULTI_ITEM_ISSUE', payload: transaction })
  } catch (error) {
    console.error('Error creating transaction:', error)
  } finally {
    submitting.value = false
  }
}

// Initialize
onMounted(() => {
  // Set the issued by field from localStorage
  form.issuedBy = localStorage.getItem('name') || 'Unknown User'

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