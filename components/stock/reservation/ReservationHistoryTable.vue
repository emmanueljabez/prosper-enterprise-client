<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Reservation History</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredHistory.length }} completed reservations
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
            placeholder="Search by reference, customer, or items..."
          />
        </div>
        <div class="space-y-2">
          <Label for="typeFilter">Type</Label>
          <Select v-model="filters.type">
            <SelectTrigger id="typeFilter">
              <SelectValue :placeholder="getTypeLabel(filters.type)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="manual">Manual Hold</SelectItem>
              <SelectItem value="service">Service Hold</SelectItem>
              <SelectItem value="project">Project Hold</SelectItem>
              <SelectItem value="customer">Customer Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="statusFilter">Status</Label>
          <Select v-model="filters.status">
            <SelectTrigger id="statusFilter">
              <SelectValue :placeholder="getStatusLabel(filters.status)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="released">Released</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="dateFilter">Date Range</Label>
          <Select v-model="filters.dateRange">
            <SelectTrigger id="dateFilter">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
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
                @click="sortBy('reference')"
              >
                Reference 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'reference' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'reference' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('customerName')"
              >
                Customer 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'customerName' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'customerName' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('createdAt')"
              >
                Created 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'createdAt' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'createdAt' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('completedAt')"
              >
                Completed 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'completedAt' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'completedAt' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Items</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading reservation history...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedHistory.length === 0" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <HistoryIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No reservation history found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="history in paginatedHistory" :key="history.id">
            <TableCell class="font-medium">{{ history.reference }}</TableCell>
            <TableCell>
              <div>
                <div>{{ history.customerName || 'No customer' }}</div>
                <div v-if="history.customerId" class="text-xs text-muted-foreground">
                  ID: {{ history.customerId }}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getTypeVariant(history.type)">
                {{ formatType(history.type) }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(history.status)">
                {{ formatStatus(history.status) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDate(history.createdAt) }}</TableCell>
            <TableCell>{{ formatDate(history.completedAt) }}</TableCell>
            <TableCell>{{ history.locationName }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-1">
                <span>{{ getTotalItems(history) }}</span>
                <span class="text-xs text-muted-foreground">({{ history.items.length }} SKUs)</span>
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
                  <DropdownMenuItem @click="viewHistoryDetails(history)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="exportHistoryEntry(history)">
                    <DownloadIcon class="mr-2 h-4 w-4" />
                    <span>Export</span>
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredHistory.length) }}
        of {{ filteredHistory.length }} entries
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
import { format, parseISO, subDays } from 'date-fns'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DownloadIcon,
  EyeIcon,
  HistoryIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  RefreshCwIcon,
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
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const props = defineProps({
  history: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-history',
  'export-history',
  'refresh'
])

// Filters and sorting
const filters = ref({
  search: '',
  type: 'all',
  status: 'all',
  dateRange: 'all'
})

const sortConfig = ref({
  key: 'completedAt',
  direction: 'desc'
})

// Pagination
const pagination = ref({
  page: 1,
  pageSize: 10
})

// Computed properties
const filteredHistory = computed(() => {
  let result = Array.isArray(props.history) ? [...props.history] : []

  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(history => {
      // Search in reference and customer name
      if (history.reference.toLowerCase().includes(searchTerm)) return true
      if (history.customerName?.toLowerCase().includes(searchTerm)) return true
      
      // Search in item names
      const itemsMatch = history.items.some(item => 
        item.itemName?.toLowerCase().includes(searchTerm) || 
        item.sku?.toLowerCase().includes(searchTerm)
      )
      if (itemsMatch) return true
      
      return false
    })
  }

  // Apply type filter
  if (filters.value.type !== 'all') {
    result = result.filter(history => history.type === filters.value.type)
  }

  // Apply status filter
  if (filters.value.status !== 'all') {
    result = result.filter(history => history.status === filters.value.status)
  }

  // Apply date range filter
  if (filters.value.dateRange !== 'all') {
    const now = new Date()
    let startDate
    
    if (filters.value.dateRange === 'last7days') {
      startDate = subDays(now, 7)
    } else if (filters.value.dateRange === 'last30days') {
      startDate = subDays(now, 30)
    } else if (filters.value.dateRange === 'last90days') {
      startDate = subDays(now, 90)
    }
    
    if (startDate) {
      result = result.filter(history => {
        const completedDate = parseISO(history.completedAt)
        return completedDate >= startDate
      })
    }
  }

  // Apply sorting
  result.sort((a, b) => {
    let aValue = a[sortConfig.value.key]
    let bValue = b[sortConfig.value.key]
    
    // Handle dates
    if (sortConfig.value.key === 'createdAt' || sortConfig.value.key === 'completedAt') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }
    
    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (aValue < bValue) {
      return sortConfig.value.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.value.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  return result
})

const paginatedHistory = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredHistory.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredHistory.value.length / pagination.value.pageSize)
})

// Helper functions
function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy')
  } catch (e) {
    return dateString
  }
}

function formatType(type) {
  const types = {
    manual: 'Manual Hold',
    service: 'Service Hold',
    project: 'Project Hold',
    customer: 'Customer Hold'
  }
  return types[type] || type
}

function getTypeVariant(type) {
  const variants = {
    manual: 'outline',
    service: 'secondary',
    project: 'default',
    customer: 'info'
  }
  return variants[type] || 'outline'
}

function getTypeLabel(type) {
  if (type === 'all') return 'All Types'
  return formatType(type)
}

function formatStatus(status) {
  const statuses = {
    expired: 'Expired',
    completed: 'Completed',
    cancelled: 'Cancelled',
    released: 'Released'
  }
  return statuses[status] || status
}

function getStatusVariant(status) {
  const variants = {
    expired: 'warning',
    completed: 'success',
    cancelled: 'destructive',
    released: 'info'
  }
  return variants[status] || 'outline'
}

function getStatusLabel(status) {
  if (status === 'all') return 'All Outcomes'
  return formatStatus(status)
}

function getTotalItems(history) {
  return history.items.reduce((sum, item) => sum + item.quantity, 0)
}

// Actions
function refreshData() {
  emit('refresh')
}

function resetFilters() {
  filters.value = {
    search: '',
    type: 'all',
    status: 'all',
    dateRange: 'all'
  }
  pagination.value.page = 1
}

function sortBy(key) {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
}

function viewHistoryDetails(history) {
  emit('view-history', history)
}

function exportHistoryEntry(history) {
  emit('export-history', history)
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })
</script>