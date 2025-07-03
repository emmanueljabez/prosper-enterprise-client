<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Stock Flow</h2>
        <p class="text-muted-foreground">Visualize how transactions affect inventory and catalog stock levels</p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" @click="refreshData">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal class="h-4 w-4 mr-2" />
              Options
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="openStockThresholdDialog">
              <Settings class="h-4 w-4 mr-2" />
              Configure Stock Thresholds
            </DropdownMenuItem>
            <DropdownMenuItem @click="openTimeRangeDialog">
              <Calendar class="h-4 w-4 mr-2" />
              Set Time Range
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="exportStockFlowData">
              <Download class="h-4 w-4 mr-2" />
              Export Data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="openCreateTransactionDialog">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Transaction
        </Button>
      </div>
    </div>

    <!-- Filter Controls -->
    <StockFlowFilterPanel 
      :locations="locations"
      :selectedLocation="selectedLocation"
      :selectedDateRange="selectedDateRange"
      :selectedTransactionTypes="selectedTransactionTypes"
      :stockVisualizationType="stockVisualizationType"
      @update-location="selectedLocation = $event"
      @update-date-range="selectedDateRange = $event"
      @update-transaction-types="selectedTransactionTypes = $event"
      @update-visualization-type="stockVisualizationType = $event"
      @apply-filters="applyFilters"
      @reset-filters="resetFilters"
    />

    <!-- Stock Flow Visualization -->
    <StockFlowVisualization 
      :itemsData="filteredItems"
      :transactionsData="filteredTransactions"
      :mappingsData="itemProductMappings"
      :loading="isLoading"
      :visualizationType="stockVisualizationType"
      :location="selectedLocation"
      :thresholds="stockThresholds"
      @view-item="openItemDetails"
      @view-transaction="openTransactionDetails"
    />

    <!-- Stock Levels by Location -->
    <StockLevelsByLocation
      :locations="locations"
      :items="items"
      :thresholds="stockThresholds"
      :loading="isLoading"
      @view-location="openLocationDetails"
      @configure-thresholds="openStockThresholdDialog"
    />

    <!-- Transaction History -->
    <TransactionHistoryTable
      :transactions="filteredTransactions"
      :items="items"
      :locations="locations"
      :loading="isLoading"
      @view-transaction="openTransactionDetails"
      @create-transaction="openCreateTransactionDialog"
      @refresh="fetchTransactions"
      @filter-changed="updateTransactionFilters"
    />

    <!-- Stock Threshold Dialog -->
    <Dialog v-model:open="showStockThresholdDialog">
      <StockThresholdDialog
        v-if="showStockThresholdDialog"
        :thresholds="stockThresholds"
        :locations="locations"
        @thresholds-updated="handleThresholdsUpdated"
        @close="showStockThresholdDialog = false"
      />
    </Dialog>

    <!-- Time Range Dialog -->
    <Dialog v-model:open="showTimeRangeDialog">
      <TimeRangeDialog
        v-if="showTimeRangeDialog"
        :dateRange="selectedDateRange"
        @date-range-updated="handleDateRangeUpdated"
        @close="showTimeRangeDialog = false"
      />
    </Dialog>

    <!-- Create Transaction Dialog -->
    <Dialog v-model:open="showCreateTransactionDialog">
      <CreateTransactionDialog
        v-if="showCreateTransactionDialog"
        :items="items"
        :locations="locations"
        @transaction-created="handleTransactionCreated"
        @close="showCreateTransactionDialog = false"
      />
    </Dialog>

    <!-- Transaction Details Dialog -->
    <Dialog v-model:open="showTransactionDetailsDialog">
      <TransactionDetailsDialog
        v-if="showTransactionDetailsDialog"
        :transaction="selectedTransaction"
        :items="items"
        :locations="locations"
        @close="showTransactionDetailsDialog = false"
      />
    </Dialog>

    <!-- Item Details Dialog -->
    <Dialog v-model:open="showItemDetailsDialog">
      <ItemDetailsDialog
        v-if="showItemDetailsDialog"
        :item="selectedItem"
        :locations="locations"
        :transactions="getItemTransactions(selectedItem?.id)"
        :productMapping="getItemProductMapping(selectedItem?.id)"
        @close="showItemDetailsDialog = false"
      />
    </Dialog>

    <!-- Location Details Dialog -->
    <Dialog v-model:open="showLocationDetailsDialog">
      <LocationDetailsDialog
        v-if="showLocationDetailsDialog"
        :location="selectedLocation"
        :items="getLocationItems(selectedLocation?.id)"
        :transactions="getLocationTransactions(selectedLocation?.id)"
        @close="showLocationDetailsDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  PlusIcon, RefreshCw, SlidersHorizontal, ChevronDown, Settings,
  Calendar, Download
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

// Components - import the components we'll create
import StockFlowFilterPanel from '@/components/stock/flow/StockFlowFilterPanel.vue'
import StockFlowVisualization from '@/components/stock/flow/StockFlowVisualization.vue'
import StockLevelsByLocation from '@/components/stock/flow/StockLevelsByLocation.vue'
import TransactionHistoryTable from '@/components/stock/flow/TransactionHistoryTable.vue'
import StockThresholdDialog from '@/components/stock/flow/StockThresholdDialog.vue'
import TimeRangeDialog from '@/components/stock/flow/TimeRangeDialog.vue'
import CreateTransactionDialog from '@/components/stock/flow/CreateTransactionDialog.vue'
import TransactionDetailsDialog from '@/components/stock/flow/TransactionDetailsDialog.vue'
import ItemDetailsDialog from '@/components/stock/flow/ItemDetailsDialog.vue'
import LocationDetailsDialog from '@/components/stock/flow/LocationDetailsDialog.vue'

// Stores
import { useInventoryStore } from '@/store/modules/inventory/items'
import { useLocationsStore } from '@/store/modules/inventory/locations'
import { useInventoryTransactionsStore } from '@/store/modules/inventory/transactions'

// Initialize stores
const inventoryStore = useInventoryStore()
const locationStore = useLocationsStore()
const transactionStore = useInventoryTransactionsStore()
const { toast } = useToast()

// Access store state through computed properties
const items = computed(() => inventoryStore.getItems)
const locations = computed(() => locationStore.getLocations)
const transactions = computed(() => transactionStore.getTransactions)
const itemProductMappings = computed(() => inventoryStore.getMappings)
const isLoading = computed(() => 
  inventoryStore.getIsLoading || 
  locationStore.getIsLoading || 
  transactionStore.getIsLoading
)

// State management
const selectedItem = ref(null)
const selectedLocation = ref(null)
const selectedTransaction = ref(null)
const selectedDateRange = ref({
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  end: new Date()
})
const selectedTransactionTypes = ref(['receipt', 'issue', 'adjustment', 'transfer'])
const stockVisualizationType = ref('timeline') // 'timeline', 'flowchart', 'heatmap'

// Stock threshold configuration
const stockThresholds = ref({
  default: {
    inStock: 10,
    lowStock: 5,
    criticalStock: 2
  },
  byLocation: {},
  byCategory: {}
})

// UI control
const showStockThresholdDialog = ref(false)
const showTimeRangeDialog = ref(false)
const showCreateTransactionDialog = ref(false)
const showTransactionDetailsDialog = ref(false)
const showItemDetailsDialog = ref(false)
const showLocationDetailsDialog = ref(false)

// Computed properties for filtered data
const filteredItems = computed(() => {
  let result = [...items.value]
  
  if (selectedLocation.value) {
    result = result.filter(item => 
      item.locations.some(loc => loc.id === selectedLocation.value.id)
    )
  }
  
  return result
})

const filteredTransactions = computed(() => {
  let result = [...transactions.value]
  
  // Filter by transaction type
  if (selectedTransactionTypes.value.length > 0) {
    result = result.filter(transaction => 
      selectedTransactionTypes.value.includes(transaction.type)
    )
  }
  
  // Filter by date range
  if (selectedDateRange.value.start && selectedDateRange.value.end) {
    const startDate = new Date(selectedDateRange.value.start).getTime()
    const endDate = new Date(selectedDateRange.value.end).getTime()
    
    result = result.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt).getTime()
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }
  
  // Filter by location
  if (selectedLocation.value) {
    result = result.filter(transaction => {
      // Check if transaction involves the selected location
      if (transaction.type === 'transfer') {
        return (
          transaction.sourceLocationId === selectedLocation.value.id || 
          transaction.destinationLocationId === selectedLocation.value.id
        )
      }
      
      return transaction.locationId === selectedLocation.value.id
    })
  }
  
  return result
})

// Helper methods for getting related data
const getItemTransactions = (itemId) => {
  if (!itemId) return []
  
  return transactions.value.filter(transaction => 
    transaction.items.some(item => item.itemId === itemId)
  )
}

const getItemProductMapping = (itemId) => {
  if (!itemId) return null
  
  return itemProductMappings.value.find(mapping => mapping.itemId === itemId)
}

const getLocationItems = (locationId) => {
  if (!locationId) return []
  
  return items.value.filter(item => 
    item.locations.some(loc => loc.id === locationId)
  )
}

const getLocationTransactions = (locationId) => {
  if (!locationId) return []
  
  return transactions.value.filter(transaction => {
    if (transaction.type === 'transfer') {
      return (
        transaction.sourceLocationId === locationId || 
        transaction.destinationLocationId === locationId
      )
    }
    
    return transaction.locationId === locationId
  })
}

// Fetch data from APIs
const fetchItems = async () => {
  try {
    await inventoryStore.fetchItems()
  } catch (error) {
    console.error('Error fetching items:', error)
    toast({
      title: 'Error',
      description: 'Failed to load inventory items',
      variant: 'destructive'
    })
  }
}

const fetchLocations = async () => {
  try {
    await locationStore.fetchLocations()
  } catch (error) {
    console.error('Error fetching locations:', error)
    toast({
      title: 'Error',
      description: 'Failed to load inventory locations',
      variant: 'destructive'
    })
  }
}

const fetchTransactions = async () => {
  try {
    await transactionStore.fetchTransactions()
  } catch (error) {
    console.error('Error fetching transactions:', error)
    toast({
      title: 'Error',
      description: 'Failed to load inventory transactions',
      variant: 'destructive'
    })
  }
}

const fetchMappings = async () => {
  try {
    await inventoryStore.fetchMappings()
  } catch (error) {
    console.error('Error fetching item-product mappings:', error)
    toast({
      title: 'Error',
      description: 'Failed to load item-product mappings',
      variant: 'destructive'
    })
  }
}

// Action handlers
const refreshData = async () => {
  toast({
    title: 'Refreshing Data',
    description: 'Fetching the latest inventory data...',
  })
  
  try {
    await Promise.all([
      fetchItems(),
      fetchLocations(),
      fetchTransactions(),
      fetchMappings()
    ])
    
    toast({
      title: 'Data Refreshed',
      description: 'Stock flow data has been updated successfully.',
      variant: 'success'
    })
  } catch (error) {
    console.error('Error refreshing data:', error)
    toast({
      title: 'Refresh Failed',
      description: 'An error occurred while refreshing data.',
      variant: 'destructive'
    })
  }
}

const applyFilters = () => {
  toast({
    title: 'Filters Applied',
    description: 'The stock flow visualization has been updated.',
  })
}

const resetFilters = () => {
  selectedLocation.value = null
  selectedDateRange.value = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  }
  selectedTransactionTypes.value = ['receipt', 'issue', 'adjustment', 'transfer']
  stockVisualizationType.value = 'timeline'
  
  toast({
    title: 'Filters Reset',
    description: 'All filters have been reset to default values.',
  })
}

const updateTransactionFilters = (filters) => {
  // Update filters based on the TransactionHistoryTable component
  if (filters.types) {
    selectedTransactionTypes.value = filters.types
  }
  
  if (filters.dateRange) {
    selectedDateRange.value = filters.dateRange
  }
}

// Dialog handlers
const openStockThresholdDialog = () => {
  showStockThresholdDialog.value = true
}

const openTimeRangeDialog = () => {
  showTimeRangeDialog.value = true
}

const openCreateTransactionDialog = () => {
  showCreateTransactionDialog.value = true
}

const openTransactionDetails = (transaction) => {
  selectedTransaction.value = transaction
  showTransactionDetailsDialog.value = true
}

const openItemDetails = (item) => {
  selectedItem.value = item
  showItemDetailsDialog.value = true
}

const openLocationDetails = (location) => {
  selectedLocation.value = location
  showLocationDetailsDialog.value = true
}

const exportStockFlowData = () => {
  toast({
    title: 'Exporting Data',
    description: 'Preparing stock flow data for export...',
  })
  
  // In a real app, this would generate and download a file
  setTimeout(() => {
    toast({
      title: 'Export Complete',
      description: 'Stock flow data has been exported successfully.',
      variant: 'success'
    })
  }, 1500)
}

// Event handlers
const handleThresholdsUpdated = (newThresholds) => {
  stockThresholds.value = newThresholds
  showStockThresholdDialog.value = false
  
  toast({
    title: 'Thresholds Updated',
    description: 'Stock level thresholds have been updated successfully.',
    variant: 'success'
  })
}

const handleDateRangeUpdated = (newDateRange) => {
  selectedDateRange.value = newDateRange
  showTimeRangeDialog.value = false
  
  toast({
    title: 'Date Range Updated',
    description: 'The time range for stock flow analysis has been updated.',
    variant: 'success'
  })
}

const handleTransactionCreated = async (newTransaction) => {
  try {
    await transactionStore.createTransaction(newTransaction)
    showCreateTransactionDialog.value = false
    
    toast({
      title: 'Transaction Created',
      description: `${newTransaction.type} transaction has been created successfully.`,
      variant: 'success'
    })
    
    // Refresh data to reflect the new transaction's impact on stock levels
    await refreshData()
  } catch (error) {
    console.error('Error creating transaction:', error)
    toast({
      title: 'Error',
      description: 'Failed to create transaction. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(async () => {
  await refreshData()
})
</script>