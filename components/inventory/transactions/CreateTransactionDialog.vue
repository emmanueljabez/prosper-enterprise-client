<template>
  <DialogContent class="sm:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
    <DialogHeader class="flex-shrink-0">
      <DialogTitle>Create New Transaction</DialogTitle>
      <DialogDescription>
        Select a transaction type and complete the details to update inventory.
      </DialogDescription>
    </DialogHeader>
    
    <div class="flex-1 overflow-y-auto">
      <!-- Tabs -->
      <div class="border-b border-border">
        <div class="flex space-x-8 px-4">
          <button
            v-for="type in transactionTypes"
            :key="type.value"
            @click="selectedTransactionType = type.value"
            :class="[
              'flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors',
              selectedTransactionType === type.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            ]"
          >
            <component :is="type.icon" class="h-4 w-4" />
            {{ type.label }}
          </button>
        </div>
      </div>
      
      <!-- Tab Content -->
      <div class="p-4">
        <div class="min-h-0">
          <!-- Receive Inventory Form -->
          <div v-if="selectedTransactionType === 'receive'" class="receive-form-container">
            <ReceiveInventorySheet 
              :warehouses="warehouses"
              :items="items"
              :suppliers="suppliers"
              :purchase-orders="purchaseOrders"
              :purchase-orders-loading="purchaseOrdersLoading"
              :purchase-orders-pagination-meta="purchaseOrdersPaginationMeta"
              :scanned-item="scannedItem"
              :delivery-note-file-url="deliveryNoteFileUrl"
              :delivery-note-uploading="deliveryNoteUploading"
              :delivery-note-upload-error="deliveryNoteUploadError"
              @upload-delivery-note="handleDeliveryNoteUpload"
              @remove-delivery-note="handleRemoveDeliveryNote"
              @transaction-created="handleTransactionCreated"
              @multi-receive-from-po="handleMultiReceiveFromPO"
              @load-purchase-orders="handleLoadPurchaseOrders"
              @close="closeDialog"
            />
          </div>
          
          <!-- Issue Inventory Form -->
          <div v-if="selectedTransactionType === 'issue'" class="issue-form-container">
            <IssueInventorySheet 
              :warehouses="warehouses"
              :items="items"
              :customers="customers"
              :users="users"
              :sales-orders="salesOrders"
              :work-orders="workOrders"
              :purchase-orders="purchaseOrders"
              :purchase-orders-loading="purchaseOrdersLoading"
              :purchase-orders-pagination-meta="purchaseOrdersPaginationMeta"
              :scanned-item="scannedItem"
              @transaction-created="handleTransactionCreated"
              @load-purchase-orders="handleLoadPurchaseOrders"
              @close="closeDialog"
            />
          </div>
          
          <!-- Stock Transfer Form -->
          <div v-if="selectedTransactionType === 'transfer'" class="transfer-form-container">
            <StockTransferSheet 
              :locations="warehouses"
              :items="items"
              :scanned-item="scannedItem"
              @transaction-created="handleTransactionCreated"
              @close="closeDialog"
            />
          </div>
          
          <!-- Stock Count Form -->
          <div v-if="selectedTransactionType === 'count'" class="count-form-container">
            <StockCountSheet 
              :locations="warehouses"
              :items="items"
              :scanned-item="scannedItem"
              @transaction-created="handleTransactionCreated"
              @close="closeDialog"
            />
          </div>
          
          <!-- Adjustment Form -->
          <div v-if="selectedTransactionType === 'adjustment' && showAdjustmentForm" class="adjustment-form-container">
            <InventoryAdjustmentSheet 
              :locations="warehouses"
              :items="items"
              :scanned-item="scannedItem"
              @transaction-created="handleTransactionCreated"
              @close="closeDialog"
            />
          </div>
        </div>
      </div>
    </div>
    
    <DialogFooter class="mt-2 pt-2 border-t">
      <Button variant="outline" @click="closeDialog">
        Cancel
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  ShoppingCartIcon, ArrowUpIcon, ArrowRightIcon, ClipboardCheckIcon, WrenchIcon
} from 'lucide-vue-next'
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

// Import transaction components
import ReceiveInventorySheet from './ReceiveInventorySheet.vue'
import IssueInventorySheet from './IssueInventorySheet.vue'
import StockTransferSheet from './StockTransferSheet.vue'
import StockCountSheet from './StockCountSheet.vue'
import InventoryAdjustmentSheet from './InventoryAdjustmentSheet.vue'

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
  suppliers: {
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
    default: () => ({})
  },
  scannedItem: {
    type: Object,
    default: null
  },
  // Delivery note file upload props
  deliveryNoteFileUrl: {
    type: String,
    default: null
  },
  deliveryNoteUploading: {
    type: Boolean,
    default: false
  },
  deliveryNoteUploadError: {
    type: String,
    default: null
  }
})

const emit = defineEmits([
  'close', 
  'transaction-created', 
  'multi-receive-from-po',
  'multi-issue-from-po',
  'load-purchase-orders',
  'upload-delivery-note',
  'remove-delivery-note'
])

// Transaction types
const transactionTypes = [
  { value: 'receive', label: 'Receive', icon: ShoppingCartIcon },
  { value: 'issue', label: 'Issue', icon: ArrowUpIcon },
  { value: 'transfer', label: 'Transfer', icon: ArrowRightIcon },
  { value: 'count', label: 'Stock Count', icon: ClipboardCheckIcon },
  { value: 'adjustment', label: 'Adjustment', icon: WrenchIcon }
]

// State
const selectedTransactionType = ref('receive')

// Computed properties
const showAdjustmentForm = computed(() => {
  // Only show adjustment form if the component exists
  return selectedTransactionType.value === 'adjustment'
})

// Methods
function closeDialog() {
  selectedTransactionType.value = 'receive'
  emit('close')
}

function handleTransactionCreated(transactionData) {
  emit('transaction-created', transactionData)
  closeDialog()
}

function handleMultiReceiveFromPO(transactionData) {
  emit('multi-receive-from-po', transactionData)
  closeDialog()
}

// function handleMultiIssueFromPO(transactionData) {
//   emit('multi-issue-from-po', transactionData)
//   closeDialog()
// }

function handleLoadPurchaseOrders(params) {
  emit('load-purchase-orders', params)
}

function handleDeliveryNoteUpload(file) {
  emit('upload-delivery-note', file)
}

function handleRemoveDeliveryNote() {
  emit('remove-delivery-note', null)
}
</script>

<style scoped>
/* Ensure embedded transaction forms don't create their own scroll containers */
:deep(.flex.flex-col.h-\[calc\(85vh\)\]) {
  height: auto !important;
  min-height: 0 !important;
}

/* Remove internal overflow scrolling from embedded forms */
:deep(.flex-1.overflow-y-auto) {
  overflow-y: visible !important;
  height: auto !important;
  flex: none !important;
}

/* Hide headers from embedded transaction sheets */
:deep(.flex.items-center.justify-between.p-2:first-child) {
  display: none !important;
}

/* Hide separators */
:deep([data-orientation="horizontal"]) {
  display: none !important;
}

/* Remove footer styling from embedded forms */
:deep(.border-t.pt-4.pb-2.px-2.bg-background) {
  border-top: none !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  background: none !important;
}

/* Ensure form content flows naturally */
:deep(form) {
  height: auto !important;
}
</style>
