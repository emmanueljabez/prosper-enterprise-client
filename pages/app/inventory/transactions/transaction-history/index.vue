<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Transaction History</h2>
        <p class="text-muted-foreground">Timeline of inventory movements, documents, and audit logs</p>
      </div>
      <div class="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FilterIcon class="h-4 w-4 mr-2" />
              Filter
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="setFilter('all')">
              <LayersIcon class="h-4 w-4 mr-2" />
              All Transactions
            </DropdownMenuItem>
            <DropdownMenuItem @click="setFilter('receive')">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Receives
            </DropdownMenuItem>
            <DropdownMenuItem @click="setFilter('issue')">
              <UploadIcon class="h-4 w-4 mr-2" />
              Issues
            </DropdownMenuItem>
            <DropdownMenuItem @click="setFilter('transfer')">
              <MoveHorizontalIcon class="h-4 w-4 mr-2" />
              Transfers
            </DropdownMenuItem>
            <DropdownMenuItem @click="setFilter('adjustment')">
              <EditIcon class="h-4 w-4 mr-2" />
              Adjustments
            </DropdownMenuItem>
            <DropdownMenuItem @click="setFilter('count')">
              <ClipboardListIcon class="h-4 w-4 mr-2" />
              Counts
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="setFilter('voided')">
              <BanIcon class="h-4 w-4 mr-2" />
              Voided Transactions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <CalendarIcon class="h-4 w-4 mr-2" />
              Time Range
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="setTimeRange('today')">Today</DropdownMenuItem>
            <DropdownMenuItem @click="setTimeRange('week')">This Week</DropdownMenuItem>
            <DropdownMenuItem @click="setTimeRange('month')">This Month</DropdownMenuItem>
            <DropdownMenuItem @click="setTimeRange('quarter')">Last 3 Months</DropdownMenuItem>
            <DropdownMenuItem @click="setTimeRange('year')">This Year</DropdownMenuItem>
            <DropdownMenuItem @click="showCustomDateRangePicker = true">Custom Range...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="outline" @click="exportData">
          <FileDownIcon class="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button variant="outline" @click="refreshData">
          <RefreshCwIcon class="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
    
    <!-- Filter Pills -->
    <FilterPills 
      v-if="hasActiveFilters"
      :filters="filters"
      @clear-type="clearTypeFilter"
      @clear-time="clearTimeRangeFilter"
      @clear-item="clearItemFilter"
      @clear-location="clearLocationFilter"
      @clear-all="clearAllFilters"
    />
    
    <!-- Summary Cards -->
    <TransactionStatCards :stats="stats" />
    
    <!-- View Selector -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Transaction Timeline</h3>
      <div class="flex space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          :class="{ 'bg-accent': viewMode === 'timeline' }"
          @click="viewMode = 'timeline'"
        >
          <ListIcon class="h-4 w-4 mr-2" />
          Timeline
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          :class="{ 'bg-accent': viewMode === 'table' }"
          @click="viewMode = 'table'"
        >
          <TableIcon class="h-4 w-4 mr-2" />
          Table
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          :class="{ 'bg-accent': viewMode === 'documents' }"
          @click="viewMode = 'documents'"
        >
          <FileTextIcon class="h-4 w-4 mr-2" />
          Documents
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          :class="{ 'bg-accent': viewMode === 'audit' }"
          @click="viewMode = 'audit'"
        >
          <HistoryIcon class="h-4 w-4 mr-2" />
          Audit Log
        </Button>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center p-8">
      <Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
    
    <!-- No Results State -->
    <EmptyState 
      v-else-if="filteredTransactions.length === 0"
      title="No transactions found"
      description="We couldn't find any transactions matching your current filters. Try adjusting your filters or selecting a different time range."
      @clear-filters="clearAllFilters"
    />
    
    <!-- Transaction Views -->
    <TransactionTimeline 
      v-else-if="viewMode === 'timeline'"
      :transactions="filteredTransactions"
      :locations="locations"
      :isLoadingMore="isLoadingMore"
      :canLoadMore="canLoadMore"
      @view-transaction="openTransactionDetails"
      @load-more="loadMoreTransactions"
    />
    
    <TransactionsTable 
      v-else-if="viewMode === 'table'"
      :transactions="filteredTransactions"
      :locations="locations"
      :totalCount="totalTransactions"
      :currentPage="currentPage"
      :hasNextPage="hasNextPage"
      @view-transaction="openTransactionDetails"
      @view-documents="viewTransactionDocuments"
      @view-audit="viewTransactionAudit"
      @print-transaction="printTransaction"
      @void-transaction="voidTransaction"
      @prev-page="goToPreviousPage"
      @next-page="goToNextPage"
    />
    
    <DocumentsView 
      v-else-if="viewMode === 'documents'"
      :documents="documents"
      :documentsByType="documentsByType"
      :isLoadingMore="isLoadingMoreDocuments"
      :canLoadMore="canLoadMoreDocuments"
      @view-document="viewDocument"
      @load-more="loadMoreDocuments"
    />
    
    <AuditLogTable 
      v-else-if="viewMode === 'audit'"
      :auditLogs="auditLogs"
      :totalLogs="totalAuditLogs"
      :currentPage="auditPage"
      :hasMoreLogs="hasMoreAuditLogs"
      @view-transaction="openTransactionById"
      @prev-page="auditPage--"
      @next-page="auditPage++"
    />
    
    <!-- Transaction Details Dialog -->
    <Dialog v-model:open="showTransactionDialog">
      <TransactionDetailsDialog
        v-if="showTransactionDialog"
        :transaction="selectedTransaction"
        :locations="locations"
        :items="items"
        @void-transaction="openVoidTransactionDialog"
        @print-document="handlePrintDocument"
        @close="showTransactionDialog = false"
      />
    </Dialog>
    
    <!-- Void Transaction Dialog -->
    <Dialog v-model:open="showVoidDialog">
      <VoidTransactionDialog
        v-if="showVoidDialog"
        :transaction="selectedTransaction"
        @void-confirmed="handleVoidTransaction"
        @close="showVoidDialog = false"
      />
    </Dialog>
    
    <!-- Document Viewer Dialog -->
    <Dialog v-model:open="showDocumentViewer">
      <DocumentViewerDialog
        v-if="showDocumentViewer"
        :document="selectedDocument"
        @download="downloadDocument"
        @close="showDocumentViewer = false"
      />
    </Dialog>
    
    <!-- Custom Date Range Picker -->
    <Dialog v-model:open="showCustomDateRangePicker">
      <DateRangePickerDialog
        v-if="showCustomDateRangePicker"
        v-model:startDate="customDateRange.start"
        v-model:endDate="customDateRange.end"
        @apply="applyCustomDateRange"
        @close="showCustomDateRangePicker = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  ChevronDown, RefreshCwIcon, FileDownIcon, FilterIcon, CalendarIcon,
  LayersIcon, ListIcon, TableIcon, FileTextIcon, HistoryIcon, 
  DownloadIcon, UploadIcon, MoveHorizontalIcon, EditIcon,
  ClipboardListIcon, BanIcon, Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'

// Components
import FilterPills from '@/components/inventory/transactions/history/FilterPills.vue'
import TransactionStatCards from '@/components/inventory/transactions/history/TransactionStatCards.vue'
import EmptyState from '@/components/inventory/transactions/history/EmptyState.vue'
import TransactionTimeline from '@/components/inventory/transactions/history/TransactionTimeline.vue'
import TransactionsTable from '@/components/inventory/transactions/history/TransactionsTable.vue'
import DocumentsView from '@/components/inventory/transactions/history/DocumentsView.vue'
import AuditLogTable from '@/components/inventory/transactions/history/AuditLogTable.vue'
import TransactionDetailsDialog from '@/components/inventory/transactions/TransactionDetailsDialog.vue'
import VoidTransactionDialog from '@/components/inventory/transactions/VoidTransactionDialog.vue'
import DocumentViewerDialog from '@/components/inventory/transactions/history/DocumentViewerDialog.vue'
import DateRangePickerDialog from '@/components/inventory/transactions/history/DateRangePickerDialog.vue'

// Store imports
import { useInventoryStore } from '@/store/modules/inventory/items'
import { useLocationsStore } from '@/store/modules/inventory/locations'
import { useTransactionsStore } from '@/store/modules/inventory/transactions'
import { useDocumentsStore } from '@/store/modules/inventory/documents'
import { useAuditStore } from '@/store/modules/inventory/audit'

// Initialize stores
const inventoryStore = useInventoryStore()
const locationsStore = useLocationsStore()
const transactionsStore = useTransactionsStore()
const documentsStore = useDocumentsStore()
const auditStore = useAuditStore()
const { toast } = useToast()

// State
const viewMode = ref('timeline')
const isLoading = ref(false)
const isLoadingMore = ref(false)
const isLoadingMoreDocuments = ref(false)
const currentPage = ref(1)
const auditPage = ref(1)
const pageSize = 20

const filters = ref({
  type: 'all',
  timeRange: 'month',
  startDate: null,
  endDate: null,
  itemId: null,
  locationId: null
})

const customDateRange = ref({
  start: '',
  end: ''
})

// UI control
const showTransactionDialog = ref(false)
const showVoidDialog = ref(false)
const showDocumentViewer = ref(false)
const showCustomDateRangePicker = ref(false)
const selectedTransaction = ref(null)
const selectedDocument = ref(null)

// Computed properties
const items = computed(() => inventoryStore.getItems)
const locations = computed(() => locationsStore.getLocations)
const transactions = computed(() => transactionsStore.getTransactions)
const documents = computed(() => documentsStore.getDocuments)
const documentsByType = computed(() => documentsStore.getDocumentsByType)
const auditLogs = computed(() => auditStore.getAuditLogs)
const totalTransactions = computed(() => transactionsStore.getTotalCount)
const totalAuditLogs = computed(() => auditStore.getTotalCount)
const hasNextPage = computed(() => (currentPage.value * pageSize) < totalTransactions.value)
const hasMoreAuditLogs = computed(() => auditPage.value * pageSize < totalAuditLogs.value)
const canLoadMore = computed(() => transactionsStore.hasMoreTransactions)
const canLoadMoreDocuments = computed(() => documentsStore.hasMoreDocuments)

const filteredTransactions = computed(() => {
  return transactions.value
})

const hasActiveFilters = computed(() => {
  return filters.value.type !== 'all' || 
         filters.value.timeRange !== 'all' || 
         filters.value.itemId || 
         filters.value.locationId
})

// Stats for dashboard cards
const stats = computed(() => ({
  total: transactions.value.length,
  received: transactions.value.filter(t => t.type === 'receive').length,
  issued: transactions.value.filter(t => t.type === 'issue').length,
  value: transactions.value.reduce((sum, t) => sum + (t.totalValue || 0), 0),
  percentChange: {
    total: 5,
    received: 12,
    issued: -3,
    value: 8
  }
}))

// Filter methods
const setFilter = (type) => {
  filters.value.type = type
  fetchTransactions()
}

const setTimeRange = (range) => {
  filters.value.timeRange = range
  
  // Convert range to actual dates
  const now = new Date()
  let startDate = new Date()
  
  switch (range) {
    case 'today':
      startDate.setHours(0, 0, 0, 0)
      break
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3)
      break
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1)
      break
    default:
      // 'all' - don't set date filters
      filters.value.startDate = null
      filters.value.endDate = null
      fetchTransactions()
      return
  }
  
  filters.value.startDate = startDate.toISOString().split('T')[0]
  filters.value.endDate = now.toISOString().split('T')[0]
  fetchTransactions()
}

const applyCustomDateRange = () => {
  if (customDateRange.value.start && customDateRange.value.end) {
    filters.value.startDate = customDateRange.value.start
    filters.value.endDate = customDateRange.value.end
    filters.value.timeRange = 'custom'
    showCustomDateRangePicker.value = false
    fetchTransactions()
  }
}

const clearTypeFilter = () => {
  filters.value.type = 'all'
  fetchTransactions()
}

const clearTimeRangeFilter = () => {
  filters.value.timeRange = 'all'
  filters.value.startDate = null
  filters.value.endDate = null
  fetchTransactions()
}

const clearItemFilter = () => {
  filters.value.itemId = null
  fetchTransactions()
}

const clearLocationFilter = () => {
  filters.value.locationId = null
  fetchTransactions()
}

const clearAllFilters = () => {
  filters.value = {
    type: 'all',
    timeRange: 'all',
    startDate: null,
    endDate: null,
    itemId: null,
    locationId: null
  }
  fetchTransactions()
}

// Action methods
const exportData = () => {
  toast({
    title: 'Export Started',
    description: 'Your data export is being prepared.',
    variant: 'default'
  })
}

const refreshData = () => {
  fetchTransactions()
  fetchDocuments()
  fetchAuditLogs()
  
  toast({
    title: 'Data Refreshed',
    description: 'Transaction history has been updated.',
    variant: 'default'
  })
}

// Data fetching methods
const fetchTransactions = async () => {
  try {
    isLoading.value = true
    await transactionsStore.fetchTransactions({
      page: currentPage.value,
      pageSize,
      type: filters.value.type === 'all' ? null : filters.value.type,
      startDate: filters.value.startDate,
      endDate: filters.value.endDate,
      itemId: filters.value.itemId,
      locationId: filters.value.locationId
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    toast({
      title: 'Error',
      description: 'Failed to load transactions. Please try again.',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

const fetchDocuments = async () => {
  try {
    await documentsStore.fetchDocuments()
  } catch (error) {
    console.error('Error fetching documents:', error)
    toast({
      title: 'Error',
      description: 'Failed to load documents. Please try again.',
      variant: 'destructive'
    })
  }
}

const fetchAuditLogs = async () => {
  try {
    await auditStore.fetchAuditLogs({
      page: auditPage.value,
      pageSize
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    toast({
      title: 'Error',
      description: 'Failed to load audit logs. Please try again.',
      variant: 'destructive'
    })
  }
}

const loadMoreTransactions = async () => {
  try {
    isLoadingMore.value = true
    await transactionsStore.fetchMoreTransactions()
  } catch (error) {
    console.error('Error loading more transactions:', error)
    toast({
      title: 'Error',
      description: 'Failed to load more transactions.',
      variant: 'destructive'
    })
  } finally {
    isLoadingMore.value = false
  }
}

const loadMoreDocuments = async () => {
  try {
    isLoadingMoreDocuments.value = true
    await documentsStore.fetchMoreDocuments()
  } catch (error) {
    console.error('Error loading more documents:', error)
    toast({
      title: 'Error',
      description: 'Failed to load more documents.',
      variant: 'destructive'
    })
  } finally {
    isLoadingMoreDocuments.value = false
  }
}

// Pagination methods
const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchTransactions()
  }
}

const goToNextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++
    fetchTransactions()
  }
}

// Dialog and interaction handlers
const openTransactionDetails = (transaction) => {
  selectedTransaction.value = transaction
  showTransactionDialog.value = true
}

const openTransactionById = async (id) => {
  try {
    const transaction = await transactionsStore.getTransactionById(id)
    if (transaction) {
      selectedTransaction.value = transaction
      showTransactionDialog.value = true
    }
  } catch (error) {
    console.error('Error fetching transaction:', error)
    toast({
      title: 'Error',
      description: 'Could not retrieve transaction details.',
      variant: 'destructive'
    })
  }
}

const viewDocument = (document) => {
  selectedDocument.value = document
  showDocumentViewer.value = true
}

const downloadDocument = (document) => {
  toast({
    title: 'Download Started',
    description: `Downloading "${document.name}"`,
    variant: 'default'
  })
}

const openVoidTransactionDialog = (transaction) => {
  selectedTransaction.value = transaction
  showVoidDialog.value = true
}

const handleVoidTransaction = async (transactionId, reason) => {
  try {
    await transactionsStore.voidTransaction(transactionId, reason)
    showVoidDialog.value = false
    
    toast({
      title: 'Transaction Voided',
      description: 'The transaction has been voided successfully.',
      variant: 'success'
    })
    
    fetchTransactions()
  } catch (error) {
    console.error('Error voiding transaction:', error)
    toast({
      title: 'Error',
      description: 'Failed to void transaction. Please try again.',
      variant: 'destructive'
    })
  }
}

const voidTransaction = (transaction) => {
  selectedTransaction.value = transaction
  showVoidDialog.value = true
}

const printTransaction = (transaction) => {
  toast({
    title: 'Printing',
    description: `Printing transaction ${transaction.referenceNumber}`,
    variant: 'default'
  })
}

const handlePrintDocument = (document) => {
  toast({
    title: 'Printing Document',
    description: `Printing "${document.name}"`,
    variant: 'default'
  })
}

const viewTransactionDocuments = (transaction) => {
  viewMode.value = 'documents'
  filters.value.transactionId = transaction.id
  fetchDocuments()
}

const viewTransactionAudit = (transaction) => {
  viewMode.value = 'audit'
  filters.value.transactionId = transaction.id
  fetchAuditLogs()
}

// Initialize component
onMounted(() => {
  fetchTransactions()
  fetchDocuments()
  fetchAuditLogs()
  
  // Also fetch items and locations for reference
  inventoryStore.fetchItems()
  locationsStore.fetchLocations()
})
</script>