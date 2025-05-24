<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Active Reservations</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredReservations.length }} active holds
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
        <div class="space-y-2">
          <Label for="expiryFilter">Expiry</Label>
          <Select v-model="filters.expiry">
            <SelectTrigger id="expiryFilter">
              <SelectValue placeholder="Any Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Date</SelectItem>
              <SelectItem value="today">Expiring Today</SelectItem>
              <SelectItem value="tomorrow">Expiring Tomorrow</SelectItem>
              <SelectItem value="week">Expiring This Week</SelectItem>
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
            <TableHead>Location</TableHead>
            <TableHead>Items</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="h-24">
            <TableCell colSpan="8" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading reservations...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedReservations.length === 0" class="h-24">
            <TableCell colSpan="8" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <ClockIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No reservations found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or create a new reservation
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="reservation in paginatedReservations" :key="reservation.id">
            <TableCell class="font-medium">{{ reservation.reference }}</TableCell>
            <TableCell>
              <div>
                <div>{{ reservation.customerName || 'No customer' }}</div>
                <div v-if="reservation.customerId" class="text-xs text-muted-foreground">
                  ID: {{ reservation.customerId }}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getTypeVariant(reservation.type)">
                {{ formatType(reservation.type) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDate(reservation.createdAt) }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-1">
                {{ formatDate(reservation.expiresAt) }}
                <Badge v-if="isExpiringToday(reservation)" variant="destructive" class="ml-1">Today</Badge>
                <Badge v-else-if="isExpiringTomorrow(reservation)" variant="warning" class="ml-1">Tomorrow</Badge>
              </div>
            </TableCell>
            <TableCell>{{ reservation.locationName }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-1">
                <span>{{ getTotalItems(reservation) }}</span>
                <span class="text-xs text-muted-foreground">({{ reservation.items.length }} SKUs)</span>
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
                  <DropdownMenuItem @click="viewReservationDetails(reservation)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="extendReservation(reservation)">
                    <ClockIcon class="mr-2 h-4 w-4" />
                    <span>Extend</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="releaseReservation(reservation)" class="text-destructive focus:text-destructive">
                    <Trash2Icon class="mr-2 h-4 w-4" />
                    <span>Release</span>
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
import { format, isToday, isTomorrow, addDays, parseISO } from 'date-fns'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClockIcon,
  EyeIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  RefreshCwIcon,
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
  },
  locations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'view-reservation',
  'extend-reservation',
  'release-reservation',
  'refresh'
])

// Filters and sorting
const filters = ref({
  search: '',
  type: 'all',
  location: 'all',
  expiry: 'all'
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
const filteredReservations = computed(() => {
  let result = [...props.reservations]

  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(reservation => {
      // Search in reference and customer name
      if (reservation.reference.toLowerCase().includes(searchTerm)) return true
      if (reservation.customerName?.toLowerCase().includes(searchTerm)) return true
      
      // Search in item names
      const itemsMatch = reservation.items.some(item => 
        item.itemName.toLowerCase().includes(searchTerm) || 
        item.sku.toLowerCase().includes(searchTerm)
      )
      if (itemsMatch) return true
      
      return false
    })
  }

  // Apply type filter
  if (filters.value.type !== 'all') {
    result = result.filter(reservation => reservation.type === filters.value.type)
  }

  // Apply location filter
  if (filters.value.location !== 'all') {
    result = result.filter(reservation => reservation.locationId === filters.value.location)
  }

  // Apply expiry filter
  if (filters.value.expiry !== 'all') {
    const now = new Date()
    const tomorrow = addDays(now, 1)
    const weekEnd = addDays(now, 7)
    
    result = result.filter(reservation => {
      const expiryDate = parseISO(reservation.expiresAt)
      
      if (filters.value.expiry === 'today') {
        return isToday(expiryDate)
      } else if (filters.value.expiry === 'tomorrow') {
        return isTomorrow(expiryDate)
      } else if (filters.value.expiry === 'week') {
        return expiryDate >= now && expiryDate <= weekEnd
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

function getTotalItems(reservation) {
  return reservation.items.reduce((sum, item) => sum + item.quantity, 0)
}

function isExpiringToday(reservation) {
  return isToday(new Date(reservation.expiresAt))
}

function isExpiringTomorrow(reservation) {
  return isTomorrow(new Date(reservation.expiresAt))
}

// Actions
function refreshData() {
  emit('refresh')
}

function resetFilters() {
  filters.value = {
    search: '',
    type: 'all',
    location: 'all',
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

function viewReservationDetails(reservation) {
  emit('view-reservation', reservation)
}

function extendReservation(reservation) {
  emit('extend-reservation', reservation)
}

function releaseReservation(reservation) {
  emit('release-reservation', reservation)
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })
</script>