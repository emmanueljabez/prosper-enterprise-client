<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Inventory Transactions</h2>
        <p class="text-muted-foreground">Track and manage inventory movements, transfers, and adjustments</p>
      </div>
      <div class="flex items-center space-x-2">
        <DropdownMenu>
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
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <PlusIcon class="h-4 w-4 mr-2" />
              New Transaction
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="openReceiveDialog()">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Receive Inventory
            </DropdownMenuItem>
            <DropdownMenuItem @click="openIssueDialog()">
              <UploadIcon class="h-4 w-4 mr-2" />
              Issue Inventory
            </DropdownMenuItem>
            <DropdownMenuItem @click="openAdjustmentDialog()">
              <EditIcon class="h-4 w-4 mr-2" />
              Inventory Adjustment
            </DropdownMenuItem>
            <DropdownMenuItem @click="openTransferDialog()">
              <MoveHorizontalIcon class="h-4 w-4 mr-2" />
              Transfer Stock
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="openStockCountDialog()">
              <ClipboardListIcon class="h-4 w-4 mr-2" />
              Stock Count
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Transactions Table -->
    <InventoryTransactionsTable
      :transactions="transactions"
      :loading="isLoading"
      @view-transaction="openTransactionDetails"
      @void-transaction="openVoidTransactionDialog"
      @print-document="handlePrintDocument"
      @refresh="fetchTransactions"
      @filter-changed="handleFilterChanged"
    />

    <!-- Transaction Details Dialog -->
    <Dialog v-model:open="showTransactionDetailsDialog">
      <TransactionDetailsDialog
        v-if="showTransactionDetailsDialog"
        :transaction="selectedTransaction"
        :locations="locations"
        :items="items"
        @void-transaction="openVoidTransactionDialog"
        @print-document="handlePrintDocument"
        @close="showTransactionDetailsDialog = false"
      />
    </Dialog>

    <!-- Receive Inventory Dialog -->
    <Sheet v-model:open="showReceiveDialog" position="right" size="lg">
      <SheetContent class="w-full sm:max-w-xl lg:max-w-2xl">
        <ReceiveInventorySheet
          v-if="showReceiveDialog"
          :locations="locations"
          :items="items"
          :suppliers="suppliers"
          @transaction-created="handleTransactionCreated"
          @close="showReceiveDialog = false"
        />
      </SheetContent>
    </Sheet>

    <!-- Issue Inventory Dialog -->
    <Sheet v-model:open="showIssueDialog" position="right" size="lg">
      <SheetContent class="w-full sm:max-w-xl lg:max-w-2xl">
        <IssueInventorySheet
          v-if="showIssueDialog"
          :locations="locations"
          :items="items"
          :customers="customers"
          @transaction-created="handleTransactionCreated"
          @close="showIssueDialog = false"
        />
      </SheetContent>
    </Sheet>

    <!-- Adjustment Dialog -->
    <Sheet v-model:open="showAdjustmentDialog" position="right" size="lg">
      <SheetContent class="w-full sm:max-w-xl lg:max-w-2xl">
        <InventoryAdjustmentSheet
          v-if="showAdjustmentDialog"
          :locations="locations"
          :items="items"
          @transaction-created="handleTransactionCreated"
          @close="showAdjustmentDialog = false"
        />
      </SheetContent>
    </Sheet>

    <!-- Transfer Dialog -->
    <Sheet v-model:open="showTransferDialog" position="right" size="lg">
      <SheetContent class="w-full sm:max-w-xl lg:max-w-2xl">
        <StockTransferSheet
          v-if="showTransferDialog"
          :locations="locations"
          :items="items"
          @transaction-created="handleTransactionCreated"
          @close="showTransferDialog = false"
        />
      </SheetContent>
    </Sheet>

    <!-- Stock Count Dialog -->
    <Sheet v-model:open="showStockCountDialog" position="right" size="lg">
      <SheetContent class="w-full sm:max-w-xl lg:max-w-2xl">
        <StockCountSheet
          v-if="showStockCountDialog"
          :locations="locations"
          :items="items"
          @transaction-created="handleTransactionCreated"
          @close="showStockCountDialog = false"
        />
      </SheetContent>
    </Sheet>

    <!-- Void Transaction Dialog -->
    <Dialog v-model:open="showVoidDialog">
      <VoidTransactionDialog
        v-if="showVoidDialog"
        :transaction="selectedTransaction"
        @void-confirmed="handleVoidTransaction"
        @close="showVoidDialog = false"
      />
    </Dialog>

    <!-- Barcode Scanner Dialog -->
    <Dialog v-model:open="showBarcodeScannerDialog">
      <BarcodeScannerDialog
        v-if="showBarcodeScannerDialog"
        :scan-mode="barcodeScanMode"
        :locations="locations"
        @item-scanned="handleItemScanned"
        @close="showBarcodeScannerDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, ChevronDown, 
  DownloadIcon, UploadIcon, EditIcon, 
  MoveHorizontalIcon, ClipboardListIcon, 
  ScanBarcodeIcon, ListChecksIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { 
  Sheet,
  SheetContent
} from '@/components/ui/sheet'
import { 
  Dialog,
  DialogContent 
} from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'

// Components
import InventoryTransactionsTable from '@/components/inventory/transactions/InventoryTransactionsTable.vue'
import TransactionDetailsDialog from '@/components/inventory/transactions/TransactionDetailsDialog.vue'
import ReceiveInventorySheet from '@/components/inventory/transactions/ReceiveInventorySheet.vue'
import IssueInventorySheet from '@/components/inventory/transactions/IssueInventorySheet.vue'
import InventoryAdjustmentSheet from '@/components/inventory/transactions/InventoryAdjustmentSheet.vue'
import StockTransferSheet from '@/components/inventory/transactions/StockTransferSheet.vue'
import StockCountSheet from '@/components/inventory/transactions/StockCountSheet.vue'
import VoidTransactionDialog from '@/components/inventory/transactions/VoidTransactionDialog.vue'
import BarcodeScannerDialog from '@/components/inventory/transactions/BarcodeScannerDialog.vue'

// Stores
import { useInventoryStore } from '@/store/modules/inventory/items'
import { useLocationsStore } from '@/store/modules/inventory/locations'
import { useTransactionsStore } from '@/store/modules/inventory/transactions'
import { useCustomersStore } from '@/store/modules/price-mangement/customers'

// Initialize stores
const inventoryStore = useInventoryStore()
const locationsStore = useLocationsStore()
const transactionsStore = useTransactionsStore()
const customersStore = useCustomersStore()
const { toast } = useToast()

// Access store state through computed properties
const transactions = computed(() => transactionsStore.getTransactions)
const items = computed(() => inventoryStore.getItems)
const locations = computed(() => locationsStore.getLocations)
const customers = computed(() => customersStore.getCustomers)
const suppliers = computed(() => locationsStore.getLocationsByType('supplier'))
const isLoading = computed(() => transactionsStore.getIsLoading)
const error = computed(() => transactionsStore.getError)

// State management
const selectedTransaction = ref(null)
const barcodeScanMode = ref('receive')
const filters = ref({
  dateRange: 'all',
  transactionType: 'all',
  location: 'all'
})

// UI control
const showTransactionDetailsDialog = ref(false)
const showReceiveDialog = ref(false)
const showIssueDialog = ref(false)
const showAdjustmentDialog = ref(false)
const showTransferDialog = ref(false)
const showStockCountDialog = ref(false)
const showVoidDialog = ref(false)
const showBarcodeScannerDialog = ref(false)

// Fetch data from APIs
const fetchTransactions = async () => {
  try {
    await transactionsStore.fetchTransactions(filters.value)
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
    await inventoryStore.fetchItems()
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    toast({
      title: 'Error',
      description: 'Failed to load items',
      variant: 'destructive'
    })
  }
}

const fetchLocations = async () => {
  try {
    await locationsStore.fetchLocations()
  } catch (error) {
    console.error('Error fetching locations:', error)
    toast({
      title: 'Error',
      description: 'Failed to load locations',
      variant: 'destructive'
    })
  }
}

const fetchCustomers = async () => {
  try {
    await customersStore.fetchCustomers()
  } catch (error) {
    console.error('Error fetching customers:', error)
    toast({
      title: 'Error',
      description: 'Failed to load customers',
      variant: 'destructive'
    })
  }
}

// Dialog and sheet handlers
const openTransactionDetails = (transaction) => {
  selectedTransaction.value = transaction
  showTransactionDetailsDialog.value = true
}

const openReceiveDialog = () => {
  showReceiveDialog.value = true
}

const openIssueDialog = () => {
  showIssueDialog.value = true
}

const openAdjustmentDialog = () => {
  showAdjustmentDialog.value = true
}

const openTransferDialog = () => {
  showTransferDialog.value = true
}

const openStockCountDialog = () => {
  showStockCountDialog.value = true
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
const handleTransactionCreated = async (transaction) => {
  try {
    await transactionsStore.createTransaction(transaction)
    
    // Close all dialogs
    showReceiveDialog.value = false
    showIssueDialog.value = false
    showAdjustmentDialog.value = false
    showTransferDialog.value = false
    showStockCountDialog.value = false
    
    toast({
      title: 'Transaction Created',
      description: `Transaction #${transaction.referenceNumber} has been recorded successfully.`,
      variant: 'success'
    })
    
    // Refresh data
    await fetchTransactions()
    await fetchItems() // Refresh inventory items since stock levels have changed
  } catch (error) {
    console.error('Error creating transaction:', error)
    toast({
      title: 'Error',
      description: 'Failed to create transaction. Please try again.',
      variant: 'destructive'
    })
  }
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
onMounted(() => {
  fetchTransactions()
  fetchItems()
  fetchLocations()
  fetchCustomers()
})
</script>