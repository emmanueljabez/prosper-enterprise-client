<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Cart Reservations</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredReservations.length }} active cart reservations
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
            placeholder="Search by customer or items..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="expiryFilter">Expiry</Label>
          <Select v-model="filters.expiry">
            <SelectTrigger id="expiryFilter">
              <SelectValue placeholder="Any Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Time</SelectItem>
              <SelectItem value="hour">Within 1 Hour</SelectItem>
              <SelectItem value="today">Today</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="sortBy">Sort By</Label>
          <Select v-model="sortConfig.key">
            <SelectTrigger id="sortBy">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="expiresAt">Expiry Time</SelectItem>
              <SelectItem value="customerName">Customer Name</SelectItem>
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
            <TableHead>Cart ID</TableHead>
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
                @click="sortBy('expiresAt')"
              >
                Expires 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'expiresAt' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'expiresAt' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Time Left</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="h-24">
            <TableCell colSpan="8" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading cart reservations...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedReservations.length === 0" class="h-24">
            <TableCell colSpan="8" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <ShoppingCartIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No cart reservations found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="reservation in paginatedReservations" :key="reservation.id">
            <TableCell class="font-medium">{{ reservation.cartId }}</TableCell>
            <TableCell>
              <div>
                <div>{{ reservation.customerName || 'Guest' }}</div>
                <div v-if="reservation.customerId" class="text-xs text-muted-foreground">
                  ID: {{ reservation.customerId }}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(reservation.status)">
                {{ formatStatus(reservation.status) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDateTime(reservation.createdAt) }}</TableCell>
            <TableCell>{{ formatDateTime(reservation.expiresAt) }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-1">
                <span>{{ getTotalItems(reservation) }}</span>
                <span class="text-xs text-muted-foreground">({{ reservation.items.length }} SKUs)</span>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1">
                {{ getTimeLeft(reservation) }}
                <Badge v-if="isExpiringWithinHour(reservation)" variant="destructive" class="ml-1">Soon</Badge>
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
                  <DropdownMenuItem @click="viewCartDetails(reservation)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="extendCart(reservation)">
                    <ClockIcon class="mr-2 h-4 w-4" />
                    <span>Extend Time</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="releaseCart(reservation)" class="text-destructive focus:text-destructive">
                    <Trash2Icon class="mr-2 h-4 w-4" />
                    <span>Release Items</span>
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredReservations.length) }}
        of {{ filteredReservations.length }} entries
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
import { format, isToday, addHours, differenceInMinutes, parseISO } from 'date-fns'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClockIcon,
  EyeIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  ShoppingCartIcon,
  Trash2Icon,
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
  reservations: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-cart',
  'extend-cart',
  'release-cart',
  'refresh'
])

// Filters and sorting
const filters = ref({
  search: '',
  status: 'all',
  expiry: 'all'
})

const sortConfig = ref({
  key: 'expiresAt',
  direction: 'asc'
})

// Pagination
const pagination = ref({
  page: 1,
  pageSize: 10
})

// Computed properties
const filteredReservations = computed(() => {
  let result = [...props.reservations]

  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(reservation => {
      // Search in customer name
      if (reservation.customerName?.toLowerCase().includes(searchTerm)) return true
      if (reservation.cartId.toLowerCase().includes(searchTerm)) return true
      
      // Search in item names
      const itemsMatch = reservation.items.some(item => 
        item.itemName.toLowerCase().includes(searchTerm) || 
        item.sku.toLowerCase().includes(searchTerm)
      )
      if (itemsMatch) return true
      
      return false
    })
  }

  // Apply status filter
  if (filters.value.status !== 'all') {
    result = result.filter(reservation => reservation.status === filters.value.status)
  }

  // Apply expiry filter
  if (filters.value.expiry !== 'all') {
    const now = new Date()
    const oneHourLater = addHours(now, 1)
    const endOfDay = new Date(now.setHours(23, 59, 59, 999))
    
    result = result.filter(reservation => {
      const expiryDate = parseISO(reservation.expiresAt)
      
      if (filters.value.expiry === 'hour') {
        return expiryDate <= oneHourLater
      } else if (filters.value.expiry === 'today') {
        return isToday(expiryDate)
      }
      
      return true
    })
  }

  // Apply sorting
  result.sort((a, b) => {
    let aValue = a[sortConfig.value.key]
    let bValue = b[sortConfig.value.key]
    
    // Handle dates
    if (sortConfig.value.key === 'createdAt' || sortConfig.value.key === 'expiresAt') {
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

const paginatedReservations = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredReservations.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredReservations.value.length / pagination.value.pageSize)
})

// Helper functions
function formatDateTime(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}

function formatStatus(status) {
  const statuses = {
    active: 'Active',
    abandoned: 'Abandoned',
    expired: 'Expired',
    completed: 'Completed'
  }
  return statuses[status] || status
}

function getStatusVariant(status) {
  const variants = {
    active: 'default',
    abandoned: 'warning',
    expired: 'destructive',
    completed: 'success'
  }
  return variants[status] || 'outline'
}

function getStatusLabel(status) {
  if (status === 'all') return 'All Statuses'
  return formatStatus(status)
}

function getTotalItems(reservation) {
  return reservation.items.reduce((sum, item) => sum + item.quantity, 0)
}

function isExpiringWithinHour(reservation) {
  const now = new Date()
  const expiryDate = new Date(reservation.expiresAt)
  return differenceInMinutes(expiryDate, now) <= 60 && differenceInMinutes(expiryDate, now) > 0
}

function getTimeLeft(reservation) {
  const now = new Date()
  const expiryDate = new Date(reservation.expiresAt)
  
  if (expiryDate < now) {
    return 'Expired'
  }
  
  const minutesLeft = differenceInMinutes(expiryDate, now)
  
  if (minutesLeft < 60) {
    return `${minutesLeft} min`
  }
  
  const hoursLeft = Math.floor(minutesLeft / 60)
  const remainingMinutes = minutesLeft % 60
  
  if (hoursLeft < 24) {
    return `${hoursLeft}h ${remainingMinutes}m`
  }
  
  const daysLeft = Math.floor(hoursLeft / 24)
  const remainingHours = hoursLeft % 24
  
  return `${daysLeft}d ${remainingHours}h`
}

// Actions
function refreshData() {
  emit('refresh')
}

function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    expiry: 'all'
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

function viewCartDetails(cart) {
  emit('view-cart', cart)
}

function extendCart(cart) {
  emit('extend-cart', cart)
}

function releaseCart(cart) {
  emit('release-cart', cart)
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })
</script>