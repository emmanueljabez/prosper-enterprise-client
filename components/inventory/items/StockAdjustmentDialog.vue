<template>
  <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle class="flex items-center space-x-2">
        <Package class="h-5 w-5" />
        <span>Stock Transaction</span>
      </DialogTitle>
      <DialogDescription>
        Create stock transaction for {{ item?.itemName || 'selected item' }}
      </DialogDescription>
    </DialogHeader>

    <div v-if="item" class="space-y-6">
      <!-- Current Stock Info -->
      <div class="bg-muted/50 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium">{{ item.itemName }}</span>
          <Badge variant="outline">{{ item.itemCode }}</Badge>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">Current Stock:</span>
          <span class="text-lg font-semibold">{{ formatNumber(item.stockOnHand || 0) }} {{ item.baseUnitOfMeasure?.name || 'UNIT' }}</span>
        </div>
      </div>

      <form @submit.prevent="createTransaction" class="space-y-4">
        <!-- Transaction Type -->
        <div class="space-y-2">
          <Label for="transactionType">Transaction Type *</Label>
          <Select v-model="formData.transactionType" required>
            <SelectTrigger :class="{ 'border-red-500': errors.transactionType }">
              <SelectValue placeholder="Select transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RECEIVE">Receive</SelectItem>
              <SelectItem value="ISSUE">Issue</SelectItem>
              <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
              <SelectItem value="TRANSFER">Transfer</SelectItem>
              <SelectItem value="COUNT">Count</SelectItem>
              <SelectItem value="RETURN">Return</SelectItem>
              <SelectItem value="ASSEMBLY">Assembly</SelectItem>
              <SelectItem value="DISASSEMBLY">Disassembly</SelectItem>
              <SelectItem value="SCRAP">Scrap</SelectItem>
              <SelectItem value="REWORK">Rework</SelectItem>
              <SelectItem value="ALLOCATION">Allocation</SelectItem>
              <SelectItem value="RESERVATION">Reservation</SelectItem>
              <SelectItem value="CONVERSION">Conversion</SelectItem>
              <SelectItem value="PRODUCTION_RECEIPT">Production Receipt</SelectItem>
              <SelectItem value="PRODUCTION_ISSUE">Production Issue</SelectItem>
              <SelectItem value="WORK_ORDER_RECEIPT">Work Order Receipt</SelectItem>
              <SelectItem value="WORK_ORDER_ISSUE">Work Order Issue</SelectItem>
              <SelectItem value="CYCLE_COUNT">Cycle Count</SelectItem>
              <SelectItem value="PHYSICAL_COUNT">Physical Count</SelectItem>
              <SelectItem value="SPOT_COUNT">Spot Count</SelectItem>
              <SelectItem value="QUALITY_HOLD">Quality Hold</SelectItem>
              <SelectItem value="QUALITY_RELEASE">Quality Release</SelectItem>
              <SelectItem value="QUARANTINE">Quarantine</SelectItem>
              <SelectItem value="RELEASE_FROM_QUARANTINE">Release from Quarantine</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.transactionType" class="text-sm text-red-500">{{ errors.transactionType }}</p>
        </div>

        <!-- Location -->
        <div class="space-y-2">
          <Label for="locationId">Location</Label>
          <Select v-model="formData.locationId">
            <SelectTrigger :class="{ 'border-red-500': errors.locationId }">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="warehouse in warehouses" 
                :key="warehouse.id" 
                :value="warehouse.id"
              >
                {{ warehouse.name }} ({{ warehouse.code }})
                <span v-if="warehouse.address" class="text-xs text-muted-foreground ml-2">
                  - {{ warehouse.address }}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.locationId" class="text-sm text-red-500">{{ errors.locationId }}</p>
          <p class="text-xs text-muted-foreground">
            Select the warehouse/location for this transaction
          </p>
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
              <span class="text-sm text-muted-foreground">{{ item.baseUnitOfMeasure?.name || 'UNIT' }}</span>
            </div>
          </div>
          <p v-if="errors.quantity" class="text-sm text-red-500">{{ errors.quantity }}</p>
        </div>

        <!-- Unit Cost -->
        <div class="space-y-2">
          <Label for="unitCost">Unit Cost</Label>
          <Input
            id="unitCost"
            v-model="formData.unitCost"
            type="number"
            step="0.01"
            placeholder="0.00"
          />
          <p class="text-xs text-muted-foreground">
            Current standard cost: {{ formatCurrency(item.standardCost || 0) }}
          </p>
        </div>

        <!-- Reference Type -->
        <div class="space-y-2">
          <Label for="referenceType">Reference Type</Label>
          <Select v-model="formData.referenceType">
            <SelectTrigger>
              <SelectValue placeholder="Select reference type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PURCHASE_ORDER">Purchase Order</SelectItem>
              <SelectItem value="SALES_ORDER">Sales Order</SelectItem>
              <SelectItem value="WORK_ORDER">Work Order</SelectItem>
              <SelectItem value="TRANSFER_ORDER">Transfer Order</SelectItem>
              <SelectItem value="ADJUSTMENT_ORDER">Adjustment Order</SelectItem>
              <SelectItem value="RETURN_ORDER">Return Order</SelectItem>
              <SelectItem value="INVOICE">Invoice</SelectItem>
              <SelectItem value="RECEIPT">Receipt</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Reference Selection (Purchase Order) -->
        <div v-if="formData.referenceType === 'PURCHASE_ORDER'" class="space-y-2">
          <Label for="purchaseOrder">Purchase Order *</Label>
          <Select 
            v-model="formData.referenceId" 
            required
          >
            <SelectTrigger :class="{ 'border-red-500': errors.referenceId }">
              <div class="flex items-center justify-between w-full">
                <span v-if="formData.referenceId" class="truncate">
                  {{ getSelectedOrderInvoiceNumber() }}
                </span>
                <span v-else class="text-muted-foreground">
                  Select purchase order
                </span>
              </div>
            </SelectTrigger>
            <SelectContent 
              class="max-h-[600px] overflow-y-auto"
              ref="purchaseOrderDropdown"
            >
              <SelectItem 
                v-for="order in purchaseOrders" 
                :key="order.id" 
                :value="order.id?.toString()"
              >
                <div class="flex flex-col space-y-1 w-full">
                  <div class="flex items-center justify-between">
                    <span class="font-medium">{{ order.transactionDate }}</span>
                    <span class="text-xs text-muted-foreground">{{ order.currency }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-semibold">{{ formatCurrency(order.amount, order.currency) }}</span>
                  </div>
                  <div v-if="order.invoiceNumber" class="text-xs text-muted-foreground">
                    Invoice: {{ order.invoiceNumber }}
                  </div>
                </div>
              </SelectItem>
              <SelectItem 
                v-if="purchaseOrdersLoading" 
                value="loading" 
                disabled
                class="text-center text-muted-foreground pointer-events-none"
              >
                <div class="flex items-center justify-center space-x-2 py-2">
                  <Loader2 class="h-4 w-4 animate-spin" />
                  <span>Loading more...</span>
                </div>
              </SelectItem>
              <SelectItem 
                v-if="purchaseOrdersPaginationMeta.hasMore && !purchaseOrdersLoading" 
                value="load-more" 
                class="text-center text-blue-600 cursor-pointer hover:bg-blue-50"
              >
                <div class="flex items-center justify-center space-x-2 py-2">
                  <span>Load more purchase orders...</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.referenceId" class="text-sm text-red-500">{{ errors.referenceId }}</p>
        </div>

        <!-- Manual Reference ID -->
        <div v-else-if="formData.referenceType && formData.referenceType !== 'PURCHASE_ORDER'" class="space-y-2">
          <Label for="referenceId">Reference ID</Label>
          <Input
            id="referenceId"
            v-model="formData.referenceId"
            type="number"
            placeholder="Enter reference ID"
          />
        </div>

        <!-- Reference Number -->
        <div class="space-y-2">
          <Label for="referenceNumber">Reference Number</Label>
          <Input
            id="referenceNumber"
            v-model="formData.referenceNumber"
            placeholder="PO#, Invoice#, etc."
          />
        </div>

        <!-- Supplier (for receives) -->
        <div v-if="isReceiveTransaction" class="space-y-2">
          <Label for="supplierId">Supplier</Label>
          <Input
            id="supplierId"
            v-model="formData.supplierId"
            type="number"
            placeholder="Enter supplier ID"
          />
        </div>

        <!-- Quality Status -->
        <div class="space-y-2">
          <Label for="qualityStatus">Quality Status</Label>
          <Select v-model="formData.qualityStatus">
            <SelectTrigger>
              <SelectValue placeholder="Select quality status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING_INSPECTION">Pending Inspection</SelectItem>
              <SelectItem value="PASSED">Passed</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="CONDITIONAL_PASS">Conditional Pass</SelectItem>
              <SelectItem value="QUARANTINED">Quarantined</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="REWORK_REQUIRED">Rework Required</SelectItem>
              <SelectItem value="PARTIAL_ACCEPTANCE">Partial Acceptance</SelectItem>
              <SelectItem value="AWAITING_DOCUMENTATION">Awaiting Documentation</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="DAMAGED">Damaged</SelectItem>
              <SelectItem value="CONTAMINATED">Contaminated</SelectItem>
              <SelectItem value="TEMPERATURE_COMPROMISED">Temperature Compromised</SelectItem>
              <SelectItem value="PACKAGING_DEFECT">Packaging Defect</SelectItem>
              <SelectItem value="SAMPLE_TESTING">Sample Testing</SelectItem>
              <SelectItem value="THIRD_PARTY_INSPECTION">Third Party Inspection</SelectItem>
              <SelectItem value="APPROVED_WITH_CONDITIONS">Approved with Conditions</SelectItem>
              <SelectItem value="TEMPORARY_HOLD">Temporary Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Expected Date -->
        <div class="space-y-2">
          <Label for="expectedDate">Expected Date</Label>
          <Input
            id="expectedDate"
            v-model="formData.expectedDate"
            type="datetime-local"
          />
        </div>

        <!-- Received Date -->
        <div class="space-y-2">
          <Label for="receivedDate">Received Date</Label>
          <Input
            id="receivedDate"
            v-model="formData.receivedDate"
            type="datetime-local"
          />
        </div>

        <!-- Freight Cost -->
        <div v-if="isReceiveTransaction" class="space-y-2">
          <Label for="freightCost">Freight Cost</Label>
          <Input
            id="freightCost"
            v-model="formData.freightCost"
            type="number"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <!-- Customs Cost -->
        <div v-if="isReceiveTransaction" class="space-y-2">
          <Label for="customsCost">Customs Cost</Label>
          <Input
            id="customsCost"
            v-model="formData.customsCost"
            type="number"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <!-- Supplier Reference -->
        <div v-if="isReceiveTransaction" class="space-y-2">
          <Label for="supplierReference">Supplier Reference</Label>
          <Input
            id="supplierReference"
            v-model="formData.supplierReference"
            placeholder="Supplier invoice number, etc."
          />
        </div>

        <!-- Tracking Number -->
        <div v-if="isReceiveTransaction" class="space-y-2">
          <Label for="trackingNumber">Tracking Number</Label>
          <Input
            id="trackingNumber"
            v-model="formData.trackingNumber"
            placeholder="Shipment tracking number"
          />
        </div>

        <!-- New Stock Level Preview -->
        <div v-if="formData.quantity && formData.transactionType" class="bg-blue-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-blue-900">New Stock Level:</span>
            <span class="text-lg font-semibold text-blue-900">
              {{ formatNumber(getNewStockLevel()) }} {{ item.baseUnitOfMeasure?.name || 'UNIT' }}
            </span>
          </div>
          <div class="text-xs text-blue-700 mt-1">
            {{ getTransactionChangeText() }}
          </div>
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Additional notes about this transaction"
            rows="3"
          />
        </div>
      </form>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button 
        @click="createTransaction"
        :disabled="!isFormValid || creating"
      >
        <Loader2 v-if="creating" class="mr-2 h-4 w-4 animate-spin" />
        Create Transaction
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue'
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
  },
  purchaseOrders: {
    type: Array,
    default: () => []
  },
  warehouses: {
    type: Array,
    default: () => []
  },
  purchaseOrdersLoading: {
    type: Boolean,
    default: false
  },
  warehousesLoading: {
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
  }
})

// Emits
const emit = defineEmits(['transaction-created', 'close', 'load-purchase-orders'])

// State
const creating = ref(false)
const errors = reactive({})
const purchaseOrders = computed(() => props.purchaseOrders)
const purchaseOrdersLoading = computed(() => props.purchaseOrdersLoading)
const warehouses = computed(() => props.warehouses)
const warehousesLoading = computed(() => props.warehousesLoading)
const purchaseOrdersPaginationMeta = computed(() => props.purchaseOrdersPaginationMeta)

// Pagination state for purchase orders
const purchaseOrdersPagination = ref({
  page: 0,
  hasMore: true,
  loading: false
})

const formData = reactive({
  itemId: null,
  locationId: null,
  transactionType: '',
  quantity: null,
  unitCost: null,
  referenceNumber: '',
  referenceType: '',
  referenceId: null,
  supplierId: null,
  qualityStatus: '',
  expectedDate: '',
  receivedDate: new Date().toISOString().slice(0, 16),
  freightCost: null,
  customsCost: null,
  supplierReference: '',
  trackingNumber: '',
  notes: ''
})

// Computed
const isFormValid = computed(() => {
  const hasRequiredFields = formData.transactionType && 
                           formData.quantity && 
                           parseFloat(formData.quantity) !== 0

  // If reference type is purchase order, reference ID is required and valid
  if (formData.referenceType === 'PURCHASE_ORDER') {
    return hasRequiredFields && formData.referenceId && 
           formData.referenceId !== 'load-more' && 
           formData.referenceId !== 'loading'
  }

  return hasRequiredFields
})

const isReceiveTransaction = computed(() => {
  return ['RECEIVE', 'PRODUCTION_RECEIPT', 'WORK_ORDER_RECEIPT', 'RETURN'].includes(formData.transactionType)
})

const getQuantityLabel = () => {
  switch (formData.transactionType) {
    case 'RECEIVE':
    case 'PRODUCTION_RECEIPT':
    case 'WORK_ORDER_RECEIPT':
    case 'RETURN':
      return 'Quantity to Receive'
    case 'ISSUE':
    case 'PRODUCTION_ISSUE':
    case 'WORK_ORDER_ISSUE':
      return 'Quantity to Issue'
    case 'ADJUSTMENT':
      return 'Adjustment Quantity (+/-)'
    case 'COUNT':
    case 'CYCLE_COUNT':
    case 'PHYSICAL_COUNT':
    case 'SPOT_COUNT':
      return 'Actual Count'
    case 'TRANSFER':
      return 'Quantity to Transfer'
    default:
      return 'Quantity'
  }
}

const getNewStockLevel = () => {
  const currentStock = props.item?.stockOnHand || 0
  const quantity = parseFloat(formData.quantity) || 0
  
  switch (formData.transactionType) {
    case 'RECEIVE':
    case 'PRODUCTION_RECEIPT':
    case 'WORK_ORDER_RECEIPT':
    case 'RETURN':
    case 'QUALITY_RELEASE':
    case 'RELEASE_FROM_QUARANTINE':
      return currentStock + Math.abs(quantity)
    case 'ISSUE':
    case 'PRODUCTION_ISSUE':
    case 'WORK_ORDER_ISSUE':
    case 'SCRAP':
    case 'QUARANTINE':
    case 'QUALITY_HOLD':
      return currentStock - Math.abs(quantity)
    case 'ADJUSTMENT':
      return currentStock + quantity
    case 'COUNT':
    case 'CYCLE_COUNT':
    case 'PHYSICAL_COUNT':
    case 'SPOT_COUNT':
      return quantity
    default:
      return currentStock
  }
}

const getTransactionChangeText = () => {
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

  if (!formData.transactionType) {
    errors.transactionType = 'Transaction type is required'
  }
  
  if (!formData.quantity || parseFloat(formData.quantity) === 0) {
    errors.quantity = 'Quantity is required and must be non-zero'
  }

  // Validate reference ID for purchase orders
  if (formData.referenceType === 'PURCHASE_ORDER' && (!formData.referenceId || formData.referenceId === 'load-more' || formData.referenceId === 'loading')) {
    errors.referenceId = 'Purchase order selection is required'
  }

  // Additional validation for negative stock
  if (getNewStockLevel() < 0 && !props.item?.allowNegativeStock) {
    errors.quantity = 'This transaction would result in negative stock'
  }

  return Object.keys(errors).length === 0
}

const createTransaction = async () => {
  if (!validateForm()) return

  creating.value = true
  try {
    const transactionData = {
      itemId: props.item.id,
      locationId: formData.locationId ? parseInt(formData.locationId) : null,
      quantity: parseFloat(formData.quantity),
      unitCost: formData.unitCost ? parseFloat(formData.unitCost) : null,
      referenceNumber: formData.referenceNumber || null,
      referenceType: formData.referenceType || null,
      referenceId: formData.referenceId && !isNaN(parseInt(formData.referenceId)) ? parseInt(formData.referenceId) : null,
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
      qualityStatus: formData.qualityStatus || null,
      expectedDate: formData.expectedDate ? new Date(formData.expectedDate).toISOString() : null,
      receivedDate: formData.receivedDate ? new Date(formData.receivedDate).toISOString() : null,
      freightCost: formData.freightCost ? parseFloat(formData.freightCost) : null,
      customsCost: formData.customsCost ? parseFloat(formData.customsCost) : null,
      supplierReference: formData.supplierReference || null,
      trackingNumber: formData.trackingNumber || null,
      notes: formData.notes || null,
      transactionType: formData.transactionType
    }

    // Adjust quantity based on transaction type
    const issueTypes = ['ISSUE', 'PRODUCTION_ISSUE', 'WORK_ORDER_ISSUE', 'SCRAP', 'QUARANTINE', 'QUALITY_HOLD']
    if (issueTypes.includes(formData.transactionType)) {
      transactionData.quantity = -Math.abs(transactionData.quantity)
    } else if (['COUNT', 'CYCLE_COUNT', 'PHYSICAL_COUNT', 'SPOT_COUNT'].includes(formData.transactionType)) {
      // For count transactions, calculate the difference
      transactionData.quantity = transactionData.quantity - (props.item?.stockOnHand || 0)
    }

    emit('transaction-created', transactionData)
  } catch (error) {
    console.error('Error creating transaction:', error)
  } finally {
    creating.value = false
  }
}

const formatNumber = (value) => {
  return new Intl.NumberFormat().format(value || 0)
}

const formatCurrency = (value, currencyCode = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(value || 0)
}

const loadMorePurchaseOrders = () => {
  if (!purchaseOrdersPaginationMeta.value.hasMore || purchaseOrdersLoading.value) {
    return
  }
  
  emit('load-purchase-orders', {
    page: purchaseOrdersPaginationMeta.value.page + 1,
    append: true
  })
}

const getSelectedOrderInvoiceNumber = () => {
  if (!formData.referenceId) return ''
  
  const selectedOrder = purchaseOrders.value.find(order => 
    order.id?.toString() === formData.referenceId?.toString()
  )
  
  return selectedOrder?.invoiceNumber || `Order #${formData.referenceId}`
}

// Load purchase orders when reference type changes to purchase order
watch(() => formData.referenceType, (newType) => {
  if (newType === 'PURCHASE_ORDER' && purchaseOrders.value.length === 0) {
    emit('load-purchase-orders', {
      page: 0,
      append: false
    })
  }
})

// Handle load more selection
watch(() => formData.referenceId, (newValue) => {
  if (newValue === 'load-more') {
    loadMorePurchaseOrders()
    // Reset the selection
    nextTick(() => {
      formData.referenceId = null
    })
  }
})

// Watch for pagination metadata changes
watch(() => props.purchaseOrdersPaginationMeta, (newMeta) => {
  if (newMeta) {
    purchaseOrdersPagination.value.hasMore = newMeta.hasMore
    purchaseOrdersPagination.value.page = newMeta.page
  }
}, { deep: true })

// Initialize
onMounted(() => {
  // Set default values from item
  if (props.item) {
    formData.itemId = props.item.id
    if (props.item.standardCost) {
      formData.unitCost = props.item.standardCost
    }
  }
})
</script>
