<template>
  <DialogContent class="sm:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
    <DialogHeader class="flex-shrink-0">
      <DialogTitle>Create New Transaction</DialogTitle>
      <DialogDescription>
        Select a transaction type and complete the details to update inventory.
      </DialogDescription>
    </DialogHeader>
    
    <div class="flex-1 overflow-y-auto">
      <div class="space-y-6 p-4">
        <!-- Transaction Type Selection -->
        <div v-if="!selectedTransactionType" class="space-y-4">
          <Label>Transaction Type</Label>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Button 
              v-for="type in transactionTypes" 
              :key="type.value"
              variant="outline" 
              @click="selectTransactionType(type.value)"
              class="flex flex-col items-center p-4 h-auto hover:bg-primary/10 hover:border-primary hover:text-primary"
            >
              <component :is="type.icon" class="h-8 w-8 mb-2" />
              <span class="text-sm font-medium">{{ type.label }}</span>
            </Button>
          </div>
        </div>
        
        <!-- Back to Type Selection -->
        <div v-if="selectedTransactionType" class="flex items-center gap-2 pb-2 border-b">
          <Button variant="ghost" size="sm" @click="selectedTransactionType = ''" class="text-muted-foreground">
            ← Back to Transaction Types
          </Button>
          <div class="flex items-center gap-2">
            <component :is="getSelectedTypeIcon()" class="h-5 w-5" />
            <span class="font-medium">{{ getSelectedTypeLabel() }}</span>
          </div>
        </div>
        
        <!-- Transaction Form Content -->
        <div v-if="selectedTransactionType" class="min-h-0">
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
              :purchase-orders="purchaseOrders"
              :purchase-orders-loading="purchaseOrdersLoading"
              :purchase-orders-pagination-meta="purchaseOrdersPaginationMeta"
              :scanned-item="scannedItem"
              @transaction-created="handleTransactionCreated"
              @multi-issue-from-po="handleMultiIssueFromPO"
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
    
    <DialogFooter v-if="!selectedTransactionType" class="mt-2 pt-2 border-t">
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
  }
})

const emit = defineEmits([
  'close', 
  'transaction-created', 
  'multi-receive-from-po',
  'multi-issue-from-po',
  'load-purchase-orders'
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
const selectedTransactionType = ref('')

// Computed properties
const showAdjustmentForm = computed(() => {
  // Only show adjustment form if the component exists
  return selectedTransactionType.value === 'adjustment'
})

// Methods
function selectTransactionType(type) {
  selectedTransactionType.value = type
}

function getSelectedTypeIcon() {
  const type = transactionTypes.find(t => t.value === selectedTransactionType.value)
  return type ? type.icon : null
}

function getSelectedTypeLabel() {
  const type = transactionTypes.find(t => t.value === selectedTransactionType.value)
  return type ? type.label : ''
}

function closeDialog() {
  selectedTransactionType.value = ''
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

function handleMultiIssueFromPO(transactionData) {
  emit('multi-issue-from-po', transactionData)
  closeDialog()
}

function handleLoadPurchaseOrders(params) {
  emit('load-purchase-orders', params)
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
