<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Inventory Transactions</h2>
        <p class="text-muted-foreground">Track and manage inventory movements, transfers, and adjustments</p>
      </div>
      <div class="flex items-center space-x-2">
        <!-- <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ScanBarcodeIcon class="h-4 w-4 mr-2" />
              Barcode
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="openBarcodeScanner('receive')">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Scan to Receive
            </DropdownMenuItem>
            <DropdownMenuItem @click="openBarcodeScanner('issue')">
              <UploadIcon class="h-4 w-4 mr-2" />
              Scan to Issue
            </DropdownMenuItem>
            <DropdownMenuItem @click="openBarcodeScanner('transfer')">
              <MoveHorizontalIcon class="h-4 w-4 mr-2" />
              Scan to Transfer
            </DropdownMenuItem>
            <DropdownMenuItem @click="openBarcodeScanner('count')">
              <ListChecksIcon class="h-4 w-4 mr-2" />
              Scan for Count
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> -->

        <Button @click="openCreateTransactionDialog()">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Transaction
        </Button>
      </div>
    </div>

    <!-- Transactions Table -->
    <InventoryTransactionsTable :transactions="transactions" :loading="isLoading" :warehouses="warehouses"
      @view-transaction="openTransactionDetails" @void-transaction="openVoidTransactionDialog"
      @print-document="handlePrintDocument" @refresh="fetchTransactions" @filter-changed="handleFilterChanged" />

    <!-- Transaction Details Dialog -->
    <Dialog v-model:open="showTransactionDetailsDialog">
      <TransactionDetailsDialog v-if="showTransactionDetailsDialog" :transaction="selectedTransaction"
        :warehouses="warehouses" :items="items" @void-transaction="openVoidTransactionDialog"
        @print-document="handlePrintDocument" @close="showTransactionDetailsDialog = false" />
    </Dialog>

    <!-- Create Transaction Dialog -->
    <Dialog v-model:open="showCreateTransactionDialog">
      <CreateTransactionDialog 
        v-if="showCreateTransactionDialog"
        :warehouses="warehouses"
        :items="items"
        :customers="customers"
        :suppliers="suppliers"
        :purchase-orders="purchaseOrders"
        :purchase-orders-loading="purchaseOrdersLoading"
        :purchase-orders-pagination-meta="purchaseOrdersPaginationMeta"
        :scanned-item="null"
        @transaction-created="handleTransactionCreated"
        @multi-receive-from-po="handleMultiReceiveFromPO"
        @multi-issue-from-po="handleMultiIssueFromPO"
        @load-purchase-orders="handleLoadPurchaseOrders"
        @close="showCreateTransactionDialog = false"
      />
    </Dialog>

    <!-- Void Transaction Dialog -->
    <Dialog v-model:open="showVoidDialog">
      <VoidTransactionDialog v-if="showVoidDialog" :transaction="selectedTransaction"
        @void-confirmed="handleVoidTransaction" @close="showVoidDialog = false" />
    </Dialog>

    <!-- Barcode Scanner Dialog -->
    <!-- <Dialog v-model:open="showBarcodeScannerDialog">
      <BarcodeScannerDialog
        v-if="showBarcodeScannerDialog"
        :scan-mode="barcodeScanMode"
        :warehouses="warehouses"
        @item-scanned="handleItemScanned"
        @close="showBarcodeScannerDialog = false"
      />
    </Dialog> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  PlusIcon,
  ScanBarcodeIcon, ListChecksIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'

// Components
import InventoryTransactionsTable from '@/components/inventory/transactions/InventoryTransactionsTable.vue'
import TransactionDetailsDialog from '@/components/inventory/transactions/TransactionDetailsDialog.vue'
import CreateTransactionDialog from '@/components/inventory/transactions/CreateTransactionDialog.vue'
import VoidTransactionDialog from '@/components/inventory/transactions/VoidTransactionDialog.vue'
// import BarcodeScannerDialog from '@/components/inventory/transactions/BarcodeScannerDialog.vue'

// Stores
import { useInventoryItemsStore } from '@/store/modules/inventory/inventory-items'
import { useLocationsStore } from '@/store/modules/inventory/locations'
import { useInventoryTransactionsStore } from '@/store/modules/inventory/transactions'
import { useCustomersStore } from '@/store/modules/price-mangement/customers'
import { usePurchaseOrdersStore } from '@/store/modules/purchase-orders/purchase-orders'
import { useSuppliersStore } from '@/store/modules/inventory/suppliers'

// Initialize stores
const inventoryItemsStore = useInventoryItemsStore()
const locationsStore = useLocationsStore()
const transactionsStore = useInventoryTransactionsStore()
const customersStore = useCustomersStore()
const purchaseOrdersStore = usePurchaseOrdersStore()
const suppliersStore = useSuppliersStore()
const { toast } = useToast()

// Access store state through computed properties
const transactions = computed(() => transactionsStore.getTransactions)
const paginatedTransactions = computed(() => transactionsStore.getPaginatedTransactions)
const items = computed(() => inventoryItemsStore.getItems)
const warehouses = computed(() => locationsStore.getWarehouses)
const customers = computed(() => customersStore.getCustomers)
const suppliers = computed(() => suppliersStore.getSuppliers)
const multiItemReceives = computed(() => transactionsStore.getMultiItemReceives)
const singleItemIssues = computed(() => transactionsStore.getSingleItemIssues)
const multiItemIssues = computed(() => transactionsStore.getMultiItemIssues)
const singleItemReceives = computed(() => transactionsStore.getSingleItemReceives)
const transactionSummary = computed(() => transactionsStore.getTransactionSummary)
const isLoading = computed(() => transactionsStore.getIsLoading)
const error = computed(() => transactionsStore.getError)

// Purchase orders store state
const purchaseOrders = computed(() => purchaseOrdersStore.getOrders)
const purchaseOrdersLoading = computed(() => purchaseOrdersStore.getIsLoading)
const purchaseOrdersPagination = computed(() => purchaseOrdersStore.getPagination)

// Purchase orders pagination metadata for components
const purchaseOrdersPaginationMeta = computed(() => ({
  page: purchaseOrdersPagination.value.page,
  totalPages: purchaseOrdersPagination.value.totalPages,
  hasMore: purchaseOrdersPagination.value.page < purchaseOrdersPagination.value.totalPages - 1
}))

// State management
const selectedTransaction = ref(null)
const selectedPurchaseOrder = ref(null)
const barcodeScanMode = ref('receive')
const filters = ref({
  dateRange: 'all',
  transactionType: 'all',
  locationId: null,
  status: 'all'
})

// UI control
const showTransactionDetailsDialog = ref(false)
const showCreateTransactionDialog = ref(false)
const showVoidDialog = ref(false)
const showBarcodeScannerDialog = ref(false)

// Fetch data from APIs
const fetchTransactions = async (params = {
  page: 0,
  size: 20,
  // itemId: 0,
  locationId: '',
  transactionType: '',
  startDate: '2025-01-01',
  endDate: '2025-12-31'
}) => {
  try {
    await transactionsStore.fetchTransactions({ ...params })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

const fetchItems = async () => {
  try {
    await inventoryItemsStore.fetchAllItems()
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    toast({
      title: 'Error',
      description: 'Failed to load items',
      variant: 'destructive'
    })
  }
}

const fetchWarehouses = async () => {
  try {
    await locationsStore.fetchAllWarehouses()
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    toast({
      title: 'Error',
      description: 'Failed to load warehouses',
      variant: 'destructive'
    })
  }
}

const fetchCustomers = async () => {
  try {
    await customersStore.fetchAllCustomers()
  } catch (error) {
    console.error('Error fetching customers:', error)
    toast({
      title: 'Error',
      description: 'Failed to load customers',
      variant: 'destructive'
    })
  }
}

const fetchSuppliers = async () => {
  try {
    await suppliersStore.fetchAllSuppliers()
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    toast({
      title: 'Error',
      description: 'Failed to load suppliers',
      variant: 'destructive'
    })
  }
}

const fetchTransactionSummary = async () => {
  try {
    await transactionsStore.fetchTransactionSummary()
  } catch (error) {
    console.error('Error fetching transaction summary:', error)
  }
}

// Purchase Orders for multi-item operations
const fetchPurchaseOrders = async (options = {}) => {
  try {
    const { page = 0, append = false } = options

    const params = {
      page,
      pageSize: 10,
      startCreatedDate: 'all',
      endCreatedDate: 'all',
      raisedById: 0,
      vendorId: 0,
      // status: 'all',
      startDueDate: 'all',
      requisitionId: 0,
      approvalStatus: 'all',
      deliveryStatus: 'all',
      paymentStatus: 'all',
      // paymentTermsId: 0,
      // endDueDate: 'all',
    }

    if (append && page > 0) {
      // For pagination, we need to append to existing orders
      // The store should handle this logic
      await purchaseOrdersStore.fetchMoreOrders(params)
    } else {
      // For initial load, fetch fresh data
      await purchaseOrdersStore.fetchOrders(params)
    }
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    toast({
      title: 'Error',
      description: 'Failed to load purchase orders',
      variant: 'destructive'
    })
  }
}

// Dialog and sheet handlers
const openTransactionDetails = (transaction) => {
  selectedTransaction.value = transaction
  showTransactionDetailsDialog.value = true
}

const openCreateTransactionDialog = () => {
  showCreateTransactionDialog.value = true
}

const openVoidTransactionDialog = (transaction) => {
  selectedTransaction.value = transaction
  showVoidDialog.value = true
}

const openBarcodeScanner = (mode) => {
  barcodeScanMode.value = mode
  showBarcodeScannerDialog.value = true
}

// Transaction CRUD operation handlers
const handleTransactionCreated = async (transactionData) => {
  try {
    let result;
    console.log('Creating transaction with data:', transactionData)

    // Determine the transaction type and call the appropriate store method
    switch (transactionData.type) {
      case 'MULTI_ITEM_RECEIVE':
        result = await transactionsStore.createMultiItemReceive(transactionData);
        break;
      case 'SINGLE_ITEM_RECEIVE':
        result = await transactionsStore.createSingleItemReceive(transactionData);
        break;
      case 'MULTI_ITEM_ISSUE':
        result = await transactionsStore.createMultiItemIssue(transactionData);
        break;
      case 'SINGLE_ITEM_ISSUE':
        result = await transactionsStore.createSingleItemIssue(transactionData);
        break;
      default:
        // For other transaction types, use generic transaction creation
        result = await transactionsStore.createTransaction?.(transactionData) ||
          await transactionsStore.createSingleItemReceive(transactionData);
    }

    // Close all dialogs
    showReceiveDialog.value = false
    showIssueDialog.value = false
    showAdjustmentDialog.value = false
    showTransferDialog.value = false
    showStockCountDialog.value = false

    toast({
      title: 'Transaction Created',
      description: `Transaction ${result.referenceNumber || result.id} has been created successfully.`,
      variant: 'success'
    })

    // Refresh data
    await fetchTransactions()
  } catch (error) {
    console.error('Error creating transaction:', error)
    toast({
      title: 'Error',
      description: 'Failed to create transaction. Please try again.',
      variant: 'destructive'
    })
  }
}

// Purchase Order specific transaction handlers
const handleMultiReceiveFromPO = async (transactionData) => {
  try {
    const result = await transactionsStore.createMultiItemReceive(transactionData);

    showReceiveDialog.value = false

    toast({
      title: 'Multi-Item Receive Created',
      description: `Receive transaction ${result.referenceNumber || result.id} has been created successfully.`,
      variant: 'success'
    })

    // Refresh data
    await Promise.all([
      fetchTransactions(),
      fetchItems(),
      transactionsStore.fetchMultiItemReceives(),
      fetchTransactionSummary()
    ])
  } catch (error) {
    console.error('Error creating multi-item receive from PO:', error)
    toast({
      title: 'Error',
      description: 'Failed to create multi-item receive. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleMultiIssueFromPO = async (transactionData) => {
  try {
    const result = await transactionsStore.createMultiItemIssue(transactionData);

    showIssueDialog.value = false

    toast({
      title: 'Multi-Item Issue Created',
      description: `Issue transaction ${result.referenceNumber || result.id} has been created successfully.`,
      variant: 'success'
    })

    // Refresh data
    await Promise.all([
      fetchTransactions(),
      fetchItems(),
      transactionsStore.fetchMultiItemIssues(),
      fetchTransactionSummary()
    ])
  } catch (error) {
    console.error('Error creating multi-item issue from PO:', error)
    toast({
      title: 'Error',
      description: 'Failed to create multi-item issue. Please try again.',
      variant: 'destructive'
    })
  }
}

// Purchase order loading handler for components
const handleLoadPurchaseOrders = async (params) => {
  await fetchPurchaseOrders(params)
}

const handleVoidTransaction = async (transactionId, reason) => {
  try {
    await transactionsStore.voidTransaction(transactionId, reason)
    showVoidDialog.value = false

    toast({
      title: 'Transaction Voided',
      description: `Transaction has been voided successfully.`,
      variant: 'success'
    })

    // Refresh data
    await fetchTransactions()
    await fetchItems() // Refresh inventory items since stock levels have changed
  } catch (error) {
    console.error('Error voiding transaction:', error)
    toast({
      title: 'Error',
      description: 'Failed to void transaction. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePrintDocument = async (transaction) => {
  try {
    await transactionsStore.generateTransactionDocument(transaction.id)

    toast({
      title: 'Document Generated',
      description: `Document for transaction #${transaction.referenceNumber} has been generated.`,
      variant: 'success'
    })
  } catch (error) {
    console.error('Error generating document:', error)
    toast({
      title: 'Error',
      description: 'Failed to generate document. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleFilterChanged = (newFilters) => {
  filters.value = { ...newFilters }
  fetchTransactions()
}

const handleItemScanned = async (result) => {
  try {
    // Process the scanned item based on the current mode
    if (barcodeScanMode.value === 'receive') {
      showBarcodeScannerDialog.value = false
      showReceiveDialog.value = true
      // Pass the scanned item to the receive dialog
      // This would be handled via refs or events in a real implementation
    } else if (barcodeScanMode.value === 'issue') {
      showBarcodeScannerDialog.value = false
      showIssueDialog.value = true
      // Pass the scanned item to the issue dialog
    } else if (barcodeScanMode.value === 'transfer') {
      showBarcodeScannerDialog.value = false
      showTransferDialog.value = true
      // Pass the scanned item to the transfer dialog
    } else if (barcodeScanMode.value === 'count') {
      showBarcodeScannerDialog.value = false
      showStockCountDialog.value = true
      // Pass the scanned item to the stock count dialog
    }

    toast({
      title: 'Item Scanned',
      description: `${result.itemCode || result.barcode} has been scanned successfully.`,
      variant: 'success'
    })
  } catch (error) {
    console.error('Error processing scanned item:', error)
    toast({
      title: 'Error',
      description: 'Failed to process scanned item. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(async () => {
  try {
    await Promise.all([
      fetchTransactions(),
      fetchItems(),
      fetchWarehouses(),
      fetchCustomers(),
      fetchSuppliers(),
      fetchTransactionSummary()
    ])
  } catch (error) {
    console.error('Error initializing transactions page:', error)
    toast({
      title: 'Initialization Error',
      description: 'Some data could not be loaded. Please refresh the page.',
      variant: 'destructive'
    })
  }
})
</script>