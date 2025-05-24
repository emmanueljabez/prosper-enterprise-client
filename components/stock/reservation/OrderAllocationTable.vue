<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Order Allocations</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredAllocations.length }} allocations ({{ pendingCount }} pending)
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
            placeholder="Search by order, customer, or items..."
          />
        </div>
        <div class="space-y-2">
          <Label for="statusFilter">Status</Label>
          <Select v-model="filters.status">
            <SelectTrigger id="statusFilter">
              <SelectValue :placeholder="getStatusLabel(filters.status)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="allocated">Allocated</SelectItem>
              <SelectItem value="partially_allocated">Partially Allocated</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="priorityFilter">Priority</Label>
          <Select v-model="filters.priority">
            <SelectTrigger id="priorityFilter">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="locationFilter">Location</Label>
          <Select v-model="filters.location">
            <SelectTrigger id="locationFilter">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem 
                v-for="location in locations" 
                :key="location.id" 
                :value="location.id"
              >
                {{ location.name }}
              </SelectItem>
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
                @click="sortBy('orderReference')"
              >
                Order # 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'orderReference' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'orderReference' && sortConfig.direction === 'desc'"
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
            <TableHead>Status</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('priority')"
              >
                Priority 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'priority' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'priority' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
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
            <TableHead>Location</TableHead>
            <TableHead>Allocated / Requested</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading order allocations...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedAllocations.length === 0" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <PackageIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No order allocations found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="allocation in paginatedAllocations" :key="allocation.id">
            <TableCell class="font-medium">{{ allocation.orderReference }}</TableCell>
            <TableCell>
              <div>
                <div>{{ allocation.customerName }}</div>
                <div class="text-xs text-muted-foreground">
                  ID: {{ allocation.customerId }}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(allocation.status)">
                {{ formatStatus(allocation.status) }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="getPriorityVariant(allocation.priority)">
                {{ formatPriority(allocation.priority) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDate(allocation.createdAt) }}</TableCell>
            <TableCell>{{ allocation.locationName }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-1">
                <span>{{ getAllocatedItems(allocation) }} / {{ getTotalItems(allocation) }}</span>
                <span class="text-xs text-muted-foreground">({{ allocation.items.length }} SKUs)</span>
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
                  <DropdownMenuItem @click="viewAllocationDetails(allocation)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="modifyAllocation(allocation)">
                    <EditIcon class="mr-2 h-4 w-4" />
                    <span>Modify Allocation</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="overrideAllocation(allocation)">
                    <ShieldAlertIcon class="mr-2 h-4 w-4" />
                    <span>Override Allocation</span>
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredAllocations.length) }}
        of {{ filteredAllocations.length }} entries
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
import { format, parseISO } from 'date-fns'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  EyeIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PackageIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const props = defineProps({
  allocations: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  locations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'view-allocation',
  'modify-allocation',
  'override-allocation',
  'refresh'
])

// Filters and sorting
const filters = ref({
  search: '',
  status: 'all',
  priority: 'all',
  location: 'all'
})

const sortConfig = ref({
  key: 'createdAt',
  direction: 'desc'
})

// Pagination
const pagination = ref({
  page: 1,
  pageSize: 10
})

// Computed properties
const filteredAllocations = computed(() => {
  let result = [...props.allocations]

  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(allocation => {
      // Search in order reference and customer name
      if (allocation.orderReference.toLowerCase().includes(searchTerm)) return true
      if (allocation.customerName.toLowerCase().includes(searchTerm)) return true
      if (allocation.orderId.toLowerCase().includes(searchTerm)) return true
      
      // Search in item names
      const itemsMatch = allocation.items.some(item => 
        item.itemName?.toLowerCase().includes(searchTerm) || 
        item.sku?.toLowerCase().includes(searchTerm)
      )
      if (itemsMatch) return true
      
      return false
    })
  }

  // Apply status filter
  if (filters.value.status !== 'all') {
    result = result.filter(allocation => allocation.status === filters.value.status)
  }

  // Apply priority filter
  if (filters.value.priority !== 'all') {
    result = result.filter(allocation => allocation.priority === filters.value.priority)
  }

  // Apply location filter
  if (filters.value.location !== 'all') {
    result = result.filter(allocation => allocation.locationId === filters.value.location)
  }

  // Apply sorting
  result.sort((a, b) => {
    let aValue = a[sortConfig.value.key]
    let bValue = b[sortConfig.value.key]
    
    // Handle priority special case
    if (sortConfig.value.key === 'priority') {
      const priorityValues = { 'critical': 4, 'high': 3, 'normal': 2, 'low': 1 }
      aValue = priorityValues[aValue] || 0
      bValue = priorityValues[bValue] || 0
    }
    
    // Handle dates
    if (sortConfig.value.key === 'createdAt') {
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

const pendingCount = computed(() => {
  return props.allocations.filter(a => a.status === 'pending' || a.status === 'partially_allocated').length
})

const paginatedAllocations = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredAllocations.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredAllocations.value.length / pagination.value.pageSize)
})

// Helper functions
function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy')
  } catch (e) {
    return dateString
  }
}

function formatStatus(status) {
  const statuses = {
    pending: 'Pending',
    allocated: 'Allocated',
    partially_allocated: 'Partially Allocated',
    fulfilled: 'Fulfilled',
    cancelled: 'Cancelled'
  }
  return statuses[status] || status
}

function getStatusVariant(status) {
  const variants = {
    pending: 'warning',
    allocated: 'success',
    partially_allocated: 'info',
    fulfilled: 'default',
    cancelled: 'destructive'
  }
  return variants[status] || 'outline'
}

function getStatusLabel(status) {
  if (status === 'all') return 'All Statuses'
  return formatStatus(status)
}

function formatPriority(priority) {
  const priorities = {
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    critical: 'Critical'
  }
  return priorities[priority] || priority
}

function getPriorityVariant(priority) {
  const variants = {
    low: 'outline',
    normal: 'secondary',
    high: 'warning',
    critical: 'destructive'
  }
  return variants[priority] || 'outline'
}

function getTotalItems(allocation) {
  return allocation.items.reduce((sum, item) => sum + item.quantity, 0)
}

function getAllocatedItems(allocation) {
  return allocation.items.reduce((sum, item) => sum + (item.allocatedQuantity || 0), 0)
}

// Actions
function refreshData() {
  emit('refresh')
}

function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    priority: 'all',
    location: 'all'
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

function viewAllocationDetails(allocation) {
  emit('view-allocation', allocation)
}

function modifyAllocation(allocation) {
  emit('modify-allocation', allocation)
}

function overrideAllocation(allocation) {
  emit('override-allocation', allocation)
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })
</script>