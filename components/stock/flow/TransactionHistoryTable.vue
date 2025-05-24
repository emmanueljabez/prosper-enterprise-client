<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between pb-2">
      <div>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          Recent inventory transactions and their impact on stock levels
        </CardDescription>
      </div>
      <div class="flex space-x-2">
        <Button variant="outline" size="sm" @click="$emit('refresh')">
          <RefreshCcwIcon class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" @click="$emit('create-transaction')">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Transaction
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <!-- Filter Controls -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
        <div class="flex flex-wrap gap-2">
          <Button 
            v-for="type in transactionTypes" 
            :key="type.value"
            variant="outline" 
            size="sm"
            :class="{'bg-primary/10 border-primary': selectedTypes.includes(type.value)}"
            @click="toggleTypeFilter(type.value)"
          >
            <component :is="type.icon" class="h-4 w-4 mr-2" />
            {{ type.label }}
          </Button>
        </div>
        <div class="flex items-center space-x-2 w-full sm:w-auto">
          <Input
            v-model="searchQuery"
            placeholder="Search transactions..."
            class="h-9 w-full sm:w-[240px]"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <FilterIcon class="h-4 w-4 mr-2" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-80">
              <div class="space-y-4">
                <div class="space-y-2">
                  <Label>Status</Label>
                  <div class="grid grid-cols-2 gap-2">
                    <Button 
                      v-for="status in statuses" 
                      :key="status.value"
                      variant="outline" 
                      size="sm"
                      :class="{'bg-primary/10 border-primary': selectedStatuses.includes(status.value)}"
                      @click="toggleStatusFilter(status.value)"
                    >
                      {{ status.label }}
                    </Button>
                  </div>
                </div>
                <div class="space-y-2">
                  <Label>Date Range</Label>
                  <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1">
                      <Label class="text-xs">From</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" class="w-full justify-start">
                            {{ filterFromDate ? formatDate(filterFromDate) : 'Select date' }}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-auto p-0" align="start">
                          <Calendar
                            v-model="filterFromDate"
                            mode="single"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div class="space-y-1">
                      <Label class="text-xs">To</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" class="w-full justify-start">
                            {{ filterToDate ? formatDate(filterToDate) : 'Select date' }}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-auto p-0" align="start">
                          <Calendar
                            v-model="filterToDate"
                            mode="single"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <div class="flex justify-between">
                  <Button variant="ghost" size="sm" @click="resetFilters">
                    Reset Filters
                  </Button>
                  <Button size="sm" @click="applyFilters">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center h-80">
        <div class="flex flex-col items-center">
          <Loader2Icon class="h-10 w-10 animate-spin text-muted-foreground" />
          <p class="mt-4 text-sm text-muted-foreground">Loading transaction history...</p>
        </div>
      </div>
      
      <div v-else-if="filteredTransactions.length === 0" class="flex items-center justify-center h-80 border rounded-md border-dashed p-8">
        <div class="flex flex-col items-center text-center max-w-md">
          <ReceiptIcon class="h-10 w-10 mb-4 text-muted-foreground" />
          <h3 class="text-lg font-medium mb-2">No transactions found</h3>
          <p class="text-sm text-muted-foreground">
            There are no transactions matching your current filters. Try adjusting your search criteria or create a new transaction.
          </p>
          <Button class="mt-4" @click="$emit('create-transaction')">
            <PlusIcon class="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>
      
      <div v-else>
        <div class="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[120px]">Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location(s)</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Stock Impact</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="transaction in paginatedTransactions" :key="transaction.id" class="cursor-pointer hover:bg-muted/50" @click="viewTransaction(transaction)">
                <TableCell class="font-medium">{{ transaction.referenceNumber }}</TableCell>
                <TableCell>
                  <Badge :variant="getTypeVariant(transaction.type)">
                    {{ formatTransactionType(transaction.type) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(transaction.status)">
                    {{ formatTransactionStatus(transaction.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex flex-col">
                    <span v-if="transaction.type === 'transfer'" class="text-xs">
                      From: {{ getLocationName(transaction.fromLocationId) }}
                    </span>
                    <span v-if="transaction.type === 'transfer'" class="text-xs">
                      To: {{ getLocationName(transaction.toLocationId) }}
                    </span>
                    <span v-else>
                      {{ getLocationName(transaction.locationId) }}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center">
                    <span>{{ transaction.items.length }}</span>
                    <Tooltip v-if="transaction.items.length > 0">
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" class="h-7 w-7 ml-1" @click.stop>
                          <InfoIcon class="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div class="space-y-1 max-w-xs">
                          <div v-for="(item, index) in transaction.items.slice(0, 3)" :key="index" class="text-xs">
                            {{ getItemName(item.itemId) }} ({{ item.quantity }})
                          </div>
                          <div v-if="transaction.items.length > 3" class="text-xs font-medium">
                            ...and {{ transaction.items.length - 3 }} more items
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>{{ formatDateTime(transaction.createdAt) }}</TableCell>
                <TableCell>
                  <div class="flex items-center">
                    <StockImpactIndicator :transaction="transaction" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" class="h-7 w-7 ml-1" @click.stop>
                          <InfoIcon class="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div class="space-y-1">
                          <div class="text-xs font-medium">Stock Level Impact</div>
                          <div v-for="(item, index) in transaction.items.slice(0, 3)" :key="index" class="text-xs flex justify-between space-x-4">
                            <span>{{ getItemName(item.itemId) }}:</span>
                            <span :class="getQuantityClass(item.quantity)">
                              {{ item.quantity > 0 ? '+' : '' }}{{ item.quantity }}
                            </span>
                          </div>
                          <div v-if="transaction.items.length > 3" class="text-xs">
                            ...and {{ transaction.items.length - 3 }} more changes
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild @click.stop>
                      <Button variant="ghost" size="icon" class="h-8 w-8">
                        <MoreHorizontalIcon class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click.stop="viewTransaction(transaction)">
                        <EyeIcon class="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem v-if="transaction.status === 'pending'" @click.stop>
                        <CheckIcon class="h-4 w-4 mr-2" />
                        Complete Transaction
                      </DropdownMenuItem>
                      <DropdownMenuItem v-if="transaction.status === 'pending'" @click.stop>
                        <XIcon class="h-4 w-4 mr-2" />
                        Cancel Transaction
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click.stop>
                        <PrinterIcon class="h-4 w-4 mr-2" />
                        Print Details
                      </DropdownMenuItem>
                      <DropdownMenuItem @click.stop>
                        <DownloadIcon class="h-4 w-4 mr-2" />
                        Export Data
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <!-- Pagination -->
        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-muted-foreground">
            Showing <span class="font-medium">{{ startItem }}</span> to <span class="font-medium">{{ endItem }}</span> of <span class="font-medium">{{ filteredTransactions.length }}</span> transactions
          </div>
          <div class="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              <ChevronLeftIcon class="h-4 w-4" />
            </Button>
            <div class="text-sm">
              Page {{ currentPage }} of {{ totalPages }}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              <ChevronRightIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import { 
  RefreshCcwIcon, PlusIcon, FilterIcon, ReceiptIcon, InfoIcon,
  ArrowDownIcon, ArrowUpIcon, ArrowRightIcon, MoreHorizontalIcon,
  EyeIcon, CheckIcon, XIcon, PrinterIcon, DownloadIcon,
  ChevronLeftIcon, ChevronRightIcon, ArrowDownCircleIcon,
  ArrowUpCircleIcon, RepeatIcon, PackageIcon, 
  ShoppingCartIcon, ClipboardEditIcon
} from 'lucide-vue-next'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Calendar } from '@/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Props
const props = defineProps({
  transactions: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: () => []
  },
  locations: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['view-transaction', 'create-transaction', 'refresh', 'filter-changed'])

// State for filtering
const searchQuery = ref('')
const selectedTypes = ref(['receipt', 'issue', 'adjustment', 'transfer'])
const selectedStatuses = ref(['pending', 'in_transit', 'awaiting_receipt', 'completed', 'cancelled'])
const filterFromDate = ref(null)
const filterToDate = ref(null)

// State for pagination
const currentPage = ref(1)
const pageSize = ref(10)

// Transaction type options
const transactionTypes = [
  { value: 'receipt', label: 'Receipts', icon: ShoppingCartIcon },
  { value: 'issue', label: 'Issues', icon: ArrowUpCircleIcon },
  { value: 'adjustment', label: 'Adjustments', icon: ClipboardEditIcon },
  { value: 'transfer', label: 'Transfers', icon: RepeatIcon }
]

// Status options
const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'awaiting_receipt', label: 'Awaiting Receipt' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

// Computed for filtered transactions
const filteredTransactions = computed(() => {
  let filtered = [...props.transactions]
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(transaction => {
      return (
        transaction.referenceNumber?.toLowerCase().includes(query) ||
        transaction.notes?.toLowerCase().includes(query) ||
        transaction.items.some(item => {
          const itemObj = props.items.find(i => i.id === item.itemId)
          return itemObj?.name.toLowerCase().includes(query) || 
                 itemObj?.sku.toLowerCase().includes(query)
        })
      )
    })
  }
  
  // Filter by transaction type
  if (selectedTypes.value.length > 0) {
    filtered = filtered.filter(transaction => 
      selectedTypes.value.includes(transaction.type)
    )
  }
  
  // Filter by status
  if (selectedStatuses.value.length > 0) {
    filtered = filtered.filter(transaction => 
      selectedStatuses.value.includes(transaction.status)
    )
  }
  
  // Filter by date range
  if (filterFromDate.value) {
    const fromDate = new Date(filterFromDate.value).setHours(0, 0, 0, 0)
    filtered = filtered.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt).getTime()
      return transactionDate >= fromDate
    })
  }
  
  if (filterToDate.value) {
    const toDate = new Date(filterToDate.value).setHours(23, 59, 59, 999)
    filtered = filtered.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt).getTime()
      return transactionDate <= toDate
    })
  }
  
  // Sort by date (newest first)
  return filtered.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

// Computed for paginated transactions
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTransactions.value.slice(start, end)
})

// Computed for pagination info
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredTransactions.value.length / pageSize.value))
})

const startItem = computed(() => {
  return (currentPage.value - 1) * pageSize.value + 1
})

const endItem = computed(() => {
  return Math.min(currentPage.value * pageSize.value, filteredTransactions.value.length)
})

// Methods
function toggleTypeFilter(type) {
  const index = selectedTypes.value.indexOf(type)
  if (index === -1) {
    selectedTypes.value.push(type)
  } else {
    // Make sure we don't remove all types
    if (selectedTypes.value.length > 1) {
      selectedTypes.value.splice(index, 1)
    }
  }
  // Reset to first page when filters change
  currentPage.value = 1
  emitFilterChanged()
}

function toggleStatusFilter(status) {
  const index = selectedStatuses.value.indexOf(status)
  if (index === -1) {
    selectedStatuses.value.push(status)
  } else {
    // Make sure we don't remove all statuses
    if (selectedStatuses.value.length > 1) {
      selectedStatuses.value.splice(index, 1)
    }
  }
  // Reset to first page when filters change
  currentPage.value = 1
}

function resetFilters() {
  selectedTypes.value = ['receipt', 'issue', 'adjustment', 'transfer']
  selectedStatuses.value = ['pending', 'in_transit', 'awaiting_receipt', 'completed', 'cancelled']
  filterFromDate.value = null
  filterToDate.value = null
  searchQuery.value = ''
  currentPage.value = 1
  emitFilterChanged()
}

function applyFilters() {
  currentPage.value = 1
  emitFilterChanged()
}

function emitFilterChanged() {
  emit('filter-changed', {
    types: selectedTypes.value,
    statuses: selectedStatuses.value,
    dateRange: {
      start: filterFromDate.value,
      end: filterToDate.value
    },
    search: searchQuery.value
  })
}

function viewTransaction(transaction) {
  emit('view-transaction', transaction)
}

// Helper methods
function getLocationName(locationId) {
  const location = props.locations.find(loc => loc.id === locationId)
  return location ? location.name : 'Unknown'
}

function getItemName(itemId) {
  const item = props.items.find(i => i.id === itemId)
  return item ? item.name : 'Unknown Item'
}

function formatTransactionType(type) {
  const types = {
    receipt: 'Receipt',
    issue: 'Issue',
    adjustment: 'Adjustment',
    transfer: 'Transfer',
    return: 'Return',
    bulk: 'Bulk Transfer'
  }
  return types[type] || type
}

function formatTransactionStatus(status) {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function formatDateTime(dateTime) {
  if (!dateTime) return 'N/A'
  return format(new Date(dateTime), 'MMM d, yyyy')
}

function formatDate(date) {
  if (!date) return 'Select date'
  return format(new Date(date), 'MMM d, yyyy')
}

function getTypeVariant(type) {
  const variants = {
    receipt: 'success',
    issue: 'destructive',
    adjustment: 'warning',
    transfer: 'default',
    return: 'secondary',
    bulk: 'default'
  }
  return variants[type] || 'outline'
}

function getStatusVariant(status) {
  const variants = {
    pending: 'warning',
    in_transit: 'info',
    awaiting_receipt: 'info',
    completed: 'success',
    cancelled: 'destructive'
  }
  return variants[status] || 'outline'
}

function getQuantityClass(quantity) {
  if (quantity > 0) return 'text-success'
  if (quantity < 0) return 'text-destructive'
  return ''
}

// Reset page when transactions change
watch(() => props.transactions, () => {
  currentPage.value = 1
})

// Stock Impact Indicator Component
const StockImpactIndicator = {
  props: {
    transaction: Object
  },
  setup(props) {
    const getImpactType = () => {
      if (props.transaction.type === 'receipt') return 'increase'
      if (props.transaction.type === 'issue') return 'decrease'
      if (props.transaction.type === 'transfer') return 'transfer'
      
      // For adjustments, determine if it's overall positive, negative, or mixed
      if (props.transaction.type === 'adjustment') {
        let totalImpact = 0
        props.transaction.items.forEach(item => {
          totalImpact += item.quantity
        })
        
        if (totalImpact > 0) return 'increase'
        if (totalImpact < 0) return 'decrease'
        return 'neutral'
      }
      
      return 'neutral'
    }
    
    const getIcon = () => {
      const impactType = getImpactType()
      
      if (impactType === 'increase') return ArrowDownIcon
      if (impactType === 'decrease') return ArrowUpIcon
      if (impactType === 'transfer') return ArrowRightIcon
      return InfoIcon
    }
    
    const getIconClass = () => {
      const impactType = getImpactType()
      
      if (impactType === 'increase') return 'text-success'
      if (impactType === 'decrease') return 'text-destructive'
      if (impactType === 'transfer') return 'text-primary'
      return 'text-muted-foreground'
    }
    
    return {
      getIcon,
      getIconClass
    }
  },
  render() {
    const Icon = this.getIcon()
    return h('div', { class: `flex items-center ${this.getIconClass()}` }, [
      h(Icon, { class: 'h-4 w-4' })
    ])
  }
}
</script>

<style scoped>
/* Additional custom colors for specific transaction types */
:deep(.text-info) {
  color: hsl(214, 100%, 60%);
}

:deep(.bg-info) {
  background-color: hsl(214, 100%, 60%);
}
</style>