<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Transactions</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredTransactions.length }} transactions found
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            @click="refreshData" 
            :disabled="loading"
          >
            <RefreshCwIcon v-if="!loading" class="h-4 w-4 mr-2" />
            <Loader2Icon v-else class="h-4 w-4 mr-2 animate-spin" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" @click="resetFilters">
            <XIcon class="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="space-y-2">
          <Label for="search">Search</Label>
          <Input
            id="search"
            v-model="filters.search"
            placeholder="Search by reference number or notes..."
          />
        </div>
        <div class="space-y-2">
          <Label for="typeFilter">Transaction Type</Label>
          <Select v-model="filters.transactionType">
            <SelectTrigger id="typeFilter">
              <SelectValue :placeholder="getTransactionTypeLabel(filters.transactionType)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="receive">Receive</SelectItem>
              <SelectItem value="issue">Issue</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
              <SelectItem value="count">Count</SelectItem>
              <SelectItem value="return">Return</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="warehouseFilter">Warehouse</Label>
          <Select v-model="filters.warehouse">
            <SelectTrigger id="warehouseFilter">
              <SelectValue placeholder="Select warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              <SelectGroup v-for="group in warehouseGroups" :key="group.type">
                <SelectLabel>{{ formatWarehouseType(group.type) }}</SelectLabel>
                <SelectItem 
                  v-for="warehouse in group.warehouses" 
                  :key="warehouse.id" 
                  :value="warehouse.id"
                >
                  {{ warehouse.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="dateFilter">Date Range</Label>
          <Select v-model="filters.dateRange">
            <SelectTrigger id="dateFilter">
              <SelectValue :placeholder="getDateRangeLabel(filters.dateRange)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <!-- Custom date range selector - appears when "Custom Range" is selected -->
      <div v-if="filters.dateRange === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="startDate">Start Date</Label>
          <Input
            id="startDate"
            v-model="filters.startDate"
            type="date"
          />
        </div>
        <div class="space-y-2">
          <Label for="endDate">End Date</Label>
          <Input
            id="endDate"
            v-model="filters.endDate"
            type="date"
          />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('referenceNumber')"
              >
                Reference 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'referenceNumber' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'referenceNumber' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('type')"
              >
                Type 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'type' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'type' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('transactionDate')"
              >
                Date 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'transactionDate' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'transactionDate' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Source/Destination</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('totalValue')"
              >
                Value 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'totalValue' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'totalValue' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Skeleton Loading Rows -->
          <template v-if="loading">
            <TableRow v-for="i in pagination.pageSize" :key="`skeleton-${i}`" class="animate-pulse">
              <TableCell>
                <div class="space-y-2">
                  <div class="h-4 bg-muted rounded" :class="i % 3 === 0 ? 'w-28' : i % 2 === 0 ? 'w-24' : 'w-32'"></div>
                  <div class="h-3 bg-muted rounded" :class="i % 2 === 0 ? 'w-16' : 'w-20'"></div>
                </div>
              </TableCell>
              <TableCell>
                <div class="h-6 bg-muted rounded-full" :class="i % 2 === 0 ? 'w-16' : 'w-20'"></div>
              </TableCell>
              <TableCell>
                <div class="space-y-2">
                  <div class="h-4 bg-muted rounded w-20"></div>
                  <div class="h-3 bg-muted rounded w-12"></div>
                </div>
              </TableCell>
              <TableCell>
                <div class="space-y-2">
                  <div class="h-4 bg-muted rounded" :class="i % 3 === 0 ? 'w-36' : 'w-32'"></div>
                  <div class="h-3 bg-muted rounded" :class="i % 2 === 0 ? 'w-28' : 'w-24'"></div>
                </div>
              </TableCell>
              <TableCell>
                <div class="h-6 bg-muted rounded-full w-14"></div>
              </TableCell>
              <TableCell>
                <div class="h-4 bg-muted rounded" :class="i % 2 === 0 ? 'w-16' : 'w-20'"></div>
              </TableCell>
              <TableCell>
                <div class="h-6 bg-muted rounded-full" :class="i % 3 === 0 ? 'w-20' : 'w-18'"></div>
              </TableCell>
              <TableCell class="text-right">
                <div class="h-8 w-8 bg-muted rounded ml-auto"></div>
              </TableCell>
            </TableRow>
          </template>
          
          <TableRow v-else-if="paginatedTransactions.length === 0" class="h-24">
            <TableCell colSpan="8" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <FileTextIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No transactions found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or create a new transaction
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow 
            v-for="transaction in paginatedTransactions" 
            :key="transaction.id"
            :class="{ 'bg-muted/40': transaction.isReversed }"
          >
            <TableCell>
              <div class="font-medium">{{ transaction.transactionNumber }}</div>
              <div class="text-xs text-muted-foreground" v-if="transaction.referenceNumber">
                Ref: {{ transaction.referenceNumber }}
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getTypeVariant(transaction.transactionType)">
                {{ formatTransactionType(transaction.transactionType) }}
              </Badge>
            </TableCell>
            <TableCell>
              <div>{{ formatDateShort(transaction.transactionDate) }}</div>
              <div class="text-xs text-muted-foreground">
                {{ formatTime(transaction.transactionDate) }}
              </div>
            </TableCell>
            <TableCell>
              <div v-if="transaction.transactionType === 'RECEIVE'">
                <div class="flex items-center gap-2">
                  <ArrowDownLeftIcon class="h-4 w-4 text-emerald-500" />
                  <div>
                    <div class="text-sm">To: {{ transaction.effectiveLocation?.name || 'Unknown' }}</div>
                    <div class="text-xs text-muted-foreground">{{ transaction.effectiveLocation?.code || '' }}</div>
                  </div>
                </div>
              </div>
              <div v-else-if="transaction.transactionType === 'ISSUE'">
                <div class="flex items-center gap-2">
                  <ArrowUpRightIcon class="h-4 w-4 text-blue-500" />
                  <div>
                    <div class="text-sm">From: {{ transaction.effectiveLocation?.name || 'Unknown' }}</div>
                    <div class="text-xs text-muted-foreground">{{ transaction.effectiveLocation?.code || '' }}</div>
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="text-sm">{{ transaction.effectiveLocation?.name || 'Unknown' }}</div>
                <div class="text-xs text-muted-foreground">{{ transaction.effectiveLocation?.code || '' }}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{{ transaction.quantity || 0 }} units</Badge>
            </TableCell>
            <TableCell>{{ formatCurrency(transaction.totalCost || transaction.totalLandedCost || 0) }}</TableCell>
            <TableCell>
              <div class="space-y-1">
                <Badge v-if="transaction.isReversed" variant="destructive">
                  Reversed
                </Badge>
                <Badge v-else :variant="getStatusVariant(transaction.status)">
                  {{ formatStatus(transaction.status) }}
                </Badge>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewTransactionDetails(transaction)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="printDocument(transaction)">
                    <PrinterIcon class="mr-2 h-4 w-4" />
                    <span>Print Document</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator v-if="!transaction.isReversed" />
                  <DropdownMenuItem 
                    v-if="!transaction.isReversed"
                    @click="voidTransaction(transaction)" 
                    class="text-destructive focus:text-destructive"
                  >
                    <BanIcon class="mr-2 h-4 w-4" />
                    <span>Void Transaction</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Showing {{ pagination.pageSize * (pagination.page - 1) + 1 }} to
        {{ Math.min(pagination.pageSize * pagination.page, filteredTransactions.length) }}
        of {{ filteredTransactions.length }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.page <= 1"
          @click="pagination.page--"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.page >= totalPages"
          @click="pagination.page++"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import {
  ArrowDownIcon,
  ArrowDownLeftIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  BanIcon,
  EyeIcon,
  FileTextIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  MoveHorizontalIcon,
  PrinterIcon,
  RefreshCwIcon,
  ScaleIcon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const props = defineProps({
  transactions: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  warehouses: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'view-transaction', 
  'void-transaction', 
  'print-document', 
  'refresh',
  'filter-changed'
])

// State
const filters = ref({
  search: '',
  transactionType: 'all',
  warehouse: 'all',
  dateRange: 'all',
  startDate: '',
  endDate: '',
  isVoided: false
})

const sortConfig = ref({
  key: 'transactionDate',
  direction: 'desc'
})

const pagination = ref({
  page: 1,
  pageSize: 10
})

// Computed properties
const warehouseGroups = computed(() => {
  // Group warehouses by type
  const groups = {}
  props.warehouses.forEach(warehouse => {
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

const filteredTransactions = computed(() => {
  let result = [...props.transactions]

  // Apply filters
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(transaction => 
      (transaction.transactionNumber && transaction.transactionNumber.toLowerCase().includes(searchTerm)) ||
      (transaction.referenceNumber && transaction.referenceNumber.toLowerCase().includes(searchTerm)) ||
      (transaction.notes && transaction.notes.toLowerCase().includes(searchTerm))
    )
  }

  if (filters.value.transactionType && filters.value.transactionType !== 'all') {
    result = result.filter(transaction => transaction.transactionType === filters.value.transactionType)
  }

  if (filters.value.warehouse && filters.value.warehouse !== 'all') {
    result = result.filter(transaction => 
      transaction.effectiveLocation?.id === parseInt(filters.value.warehouse)
    )
  }

  if (filters.value.dateRange && filters.value.dateRange !== 'all') {
    const now = new Date()
    let startDate

    // Set date range based on filter
    switch (filters.value.dateRange) {
      case 'today':
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        result = result.filter(transaction => new Date(transaction.transactionDate) >= startDate)
        break
      case 'yesterday':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 1)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(now)
        endDate.setDate(now.getDate() - 1)
        endDate.setHours(23, 59, 59, 999)
        result = result.filter(transaction => {
          const date = new Date(transaction.transactionDate)
          return date >= startDate && date <= endDate
        })
        break
      case 'thisWeek':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
        startDate.setHours(0, 0, 0, 0)
        result = result.filter(transaction => new Date(transaction.transactionDate) >= startDate)
        break
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        result = result.filter(transaction => new Date(transaction.transactionDate) >= startDate)
        break
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
        result = result.filter(transaction => {
          const date = new Date(transaction.transactionDate)
          return date >= startDate && date <= lastMonthEnd
        })
        break
      case 'custom':
        if (filters.value.startDate) {
          const customStart = new Date(filters.value.startDate)
          customStart.setHours(0, 0, 0, 0)
          result = result.filter(transaction => new Date(transaction.transactionDate) >= customStart)
        }
        if (filters.value.endDate) {
          const customEnd = new Date(filters.value.endDate)
          customEnd.setHours(23, 59, 59, 999)
          result = result.filter(transaction => new Date(transaction.transactionDate) <= customEnd)
        }
        break
    }
  }

  // Apply sorting
  result.sort((a, b) => {
    let aValue = a[sortConfig.value.key]
    let bValue = b[sortConfig.value.key]
    
    // Handle nested properties
    if (sortConfig.value.key.includes('.')) {
      const parts = sortConfig.value.key.split('.')
      let aPart = a
      let bPart = b
      
      for (const part of parts) {
        aPart = aPart && aPart[part]
        bPart = bPart && bPart[part]
      }
      
      aValue = aPart
      bValue = bPart
    }
    
    // Handle date comparisons
    if (sortConfig.value.key === 'transactionDate') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }
    
    // Handle string comparisons
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (aValue === bValue) return 0
    
    // Handle null or undefined values
    if (aValue == null) return 1
    if (bValue == null) return -1
    
    if (sortConfig.value.direction === 'asc') {
      return aValue < bValue ? -1 : 1
    } else {
      return aValue > bValue ? -1 : 1
    }
  })

  return result
})

const paginatedTransactions = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredTransactions.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / pagination.value.pageSize)
})

// Methods
const refreshData = () => {
  emit('refresh')
}

const resetFilters = () => {
  filters.value = {
    search: '',
    transactionType: 'all',
    warehouse: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    isVoided: false
  }
  pagination.value.page = 1
}

const sortBy = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
}

const viewTransactionDetails = (transaction) => {
  emit('view-transaction', transaction)
}

const voidTransaction = (transaction) => {
  emit('void-transaction', transaction)
}

const printDocument = (transaction) => {
  emit('print-document', transaction)
}

const getWarehouseName = (warehouseId) => {
  if (!warehouseId) return 'N/A'
  const warehouse = props.warehouses.find(w => w.id === warehouseId)
  return warehouse ? warehouse.name : 'Unknown Warehouse'
}

// Formatters
const formatDateShort = (dateString) => {
  try {
    return format(new Date(dateString), 'MMM d, yyyy')
  } catch (e) {
    return dateString
  }
}

const formatTime = (dateString) => {
  try {
    return format(new Date(dateString), 'h:mm a')
  } catch (e) {
    return ''
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'KES' 
  }).format(value || 0)
}

const formatTransactionType = (type) => {
  switch (type) {
    case 'RECEIVE': return 'Receive'
    case 'ISSUE': return 'Issue'
    case 'TRANSFER': return 'Transfer'
    case 'ADJUSTMENT': return 'Adjustment'
    case 'COUNT': return 'Count'
    case 'RETURN': return 'Return'
    default: return type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : 'Unknown'
  }
}

const formatStatus = (status) => {
  switch (status) {
    case 'COMPLETED': return 'Completed'
    case 'PENDING': return 'Pending'
    case 'IN_PROGRESS': return 'In Progress'
    case 'DRAFT': return 'Draft'
    case 'CANCELLED': return 'Cancelled'
    case 'APPROVED': return 'Approved'
    default: return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Unknown'
  }
}

const formatAdjustmentReason = (reason) => {
  switch (reason) {
    case 'damage': return 'Damage'
    case 'loss': return 'Loss'
    case 'theft': return 'Theft'
    case 'expiration': return 'Expiration'
    case 'count': return 'Inventory Count'
    case 'quality': return 'Quality Control'
    case 'other': return 'Other'
    default: return reason ? reason.charAt(0).toUpperCase() + reason.slice(1) : 'N/A'
  }
}

const formatWarehouseType = (type) => {
  switch (type) {
    case 'warehouse': return 'Warehouses'
    case 'store': return 'Stores'
    case 'supplier': return 'Suppliers'
    case 'customer': return 'Customers'
    case 'other': return 'Other Warehouses'
    default: return type.charAt(0).toUpperCase() + type.slice(1) + 's'
  }
}

const getTransactionTypeLabel = (type) => {
  if (type === 'all') return 'All Types'
  return formatTransactionType(type)
}

const getDateRangeLabel = (range) => {
  switch (range) {
    case 'all': return 'All Time'
    case 'today': return 'Today'
    case 'yesterday': return 'Yesterday'
    case 'thisWeek': return 'This Week'
    case 'thisMonth': return 'This Month'
    case 'lastMonth': return 'Last Month'
    case 'custom': return 'Custom Range'
    default: return range
  }
}

const getTypeVariant = (type) => {
  switch (type) {
    case 'RECEIVE': return 'success'
    case 'ISSUE': return 'blue'
    case 'TRANSFER': return 'purple'
    case 'ADJUSTMENT': return 'yellow'
    case 'COUNT': return 'secondary'
    case 'RETURN': return 'pink'
    default: return 'default'
  }
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'COMPLETED': return 'success'
    case 'PENDING': return 'warning'
    case 'IN_PROGRESS': return 'info'
    case 'DRAFT': return 'outline'
    case 'CANCELLED': return 'destructive'
    case 'APPROVED': return 'success'
    default: return 'default'
  }
}

// Watch for filter changes
watch(filters, (newFilters) => {
  // Reset to page 1 when filters change
  pagination.value.page = 1
  // Emit filter changes to parent
  emit('filter-changed', newFilters)
}, { deep: true })
</script>