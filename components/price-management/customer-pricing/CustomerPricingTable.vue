<template>
  <div class="space-y-4">
    <!-- Filters and Search -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      <div class="flex-1">
        <div class="relative">
          <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search price rules..."
            class="pl-8"
            v-model="searchQuery"
          />
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <Select v-model="statusFilter">
          <SelectTrigger class="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
        
        <Select v-model="customerFilter">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem v-for="customer in customers" :key="customer.id" :value="customer.id">
              {{ customer.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        
        <Select v-model="discountTypeFilter">
          <SelectTrigger class="w-[150px]">
            <SelectValue placeholder="Discount Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="fixed">Fixed Amount</SelectItem>
            <SelectItem value="override">Price Override</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <!-- Bulk Actions & Selected Count -->
    <div v-if="selectedRows.length > 0" class="flex items-center justify-between bg-muted/30 p-2 rounded-md">
      <span class="text-sm font-medium">{{ selectedRows.length }} selected</span>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="handleBulkEdit">
          <PencilIcon class="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="outline" size="sm" @click="handleBulkDelete">
          <TrashIcon class="h-4 w-4 mr-2" />
          Delete
        </Button>
        <Button variant="outline" size="sm" @click="handleBulkToggleStatus">
          <ToggleLeftIcon class="h-4 w-4 mr-2" />
          Toggle Status
        </Button>
        <Button variant="ghost" size="sm" @click="selectedRows = []">
          Clear Selection
        </Button>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[50px]">
              <Checkbox 
                :checked="selectAll" 
                @update:checked="toggleSelectAll"
              />
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('customerName')"
              >
                Customer 
                <ChevronUpIcon
                  v-if="sortConfig.key === 'customerName' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ChevronDownIcon
                  v-if="sortConfig.key === 'customerName' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('productName')"
              >
                Product 
                <ChevronUpIcon
                  v-if="sortConfig.key === 'productName' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ChevronDownIcon
                  v-if="sortConfig.key === 'productName' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('discountType')"
              >
                Discount Type 
                <ChevronUpIcon
                  v-if="sortConfig.key === 'discountType' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ChevronDownIcon
                  v-if="sortConfig.key === 'discountType' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('amount')"
              >
                Amount 
                <ChevronUpIcon
                  v-if="sortConfig.key === 'amount' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ChevronDownIcon
                  v-if="sortConfig.key === 'amount' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('startDate')"
              >
                Start Date 
                <ChevronUpIcon
                  v-if="sortConfig.key === 'startDate' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ChevronDownIcon
                  v-if="sortConfig.key === 'startDate' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('endDate')"
              >
                End Date 
                <ChevronUpIcon
                  v-if="sortConfig.key === 'endDate' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ChevronDownIcon
                  v-if="sortConfig.key === 'endDate' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('status')"
              >
                Status 
                <ChevronUpIcon
                  v-if="sortConfig.key === 'status' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ChevronDownIcon
                  v-if="sortConfig.key === 'status' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead class="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell :colspan="9" class="h-24 text-center">
              <Loader2Icon class="h-6 w-6 animate-spin mx-auto" />
              <p class="mt-2 text-sm text-muted-foreground">Loading pricing rules...</p>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedRules.length === 0">
            <TableCell :colspan="9" class="h-24 text-center">
              <p class="text-muted-foreground">No pricing rules found.</p>
              <Button variant="link" @click="$emit('refresh')" class="mt-2">
                <RefreshCwIcon class="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </TableCell>
          </TableRow>
          <TableRow 
            v-for="rule in paginatedRules" 
            :key="rule.id"
            :class="{ 'bg-muted/50': selectedRows.includes(rule.id) }"
          >
            <TableCell>
              <Checkbox 
                :checked="selectedRows.includes(rule.id)" 
                @update:checked="toggleSelection(rule.id)"
              />
            </TableCell>
            <TableCell>
              <div class="font-medium">{{ rule.customerName }}</div>
              <div class="text-xs text-muted-foreground">ID: {{ rule.customerId }}</div>
            </TableCell>
            <TableCell>{{ rule.productName }}</TableCell>
            <TableCell>
              <Badge :variant="getDiscountTypeBadgeVariant(rule.discountType)">
                {{ formatDiscountType(rule.discountType) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatAmount(rule.amount, rule.discountType) }}</TableCell>
            <TableCell>{{ formatDate(rule.startDate) }}</TableCell>
            <TableCell>{{ formatDate(rule.endDate) || '—' }}</TableCell>
            <TableCell>
              <Badge :variant="getStatusBadgeVariant(rule.status)">
                {{ rule.status }}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="$emit('view-pricing', rule)">
                    <EyeIcon class="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-pricing', rule)">
                    <PencilIcon class="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('duplicate-pricing', rule)">
                    <CopyIcon class="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('update-status', rule)">
                    <ToggleLeftIcon class="h-4 w-4 mr-2" />
                    Change Status
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('delete-pricing', rule)" class="text-destructive focus:text-destructive">
                    <TrashIcon class="h-4 w-4 mr-2" />
                    Delete
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
        Showing 
        <span class="font-medium">{{ paginationStart }}</span> to 
        <span class="font-medium">{{ paginationEnd }}</span> of 
        <span class="font-medium">{{ filteredRules.length }}</span> rules
      </div>
      <div class="flex items-center space-x-6 lg:space-x-8">
        <div class="flex items-center space-x-2">
          <p class="text-sm font-medium">Rows per page</p>
          <Select v-model="pageSize">
            <SelectTrigger class="h-8 w-[70px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="10">10</SelectItem>
              <SelectItem :value="20">20</SelectItem>
              <SelectItem :value="50">50</SelectItem>
              <SelectItem :value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <ChevronLeftIcon class="h-4 w-4" />
            <span class="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            <ChevronRightIcon class="h-4 w-4" />
            <span class="sr-only">Next page</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, parseISO } from 'date-fns'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CopyIcon,
  EyeIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PencilIcon,
  RefreshCwIcon,
  SearchIcon,
  ToggleLeftIcon,
  TrashIcon,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  pricingRules: {
    type: Array,
    required: true,
    default: () => []
  },
  customers: {
    type: Array,
    required: true,
    default: () => []
  },
  products: {
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
  'view-pricing', 
  'edit-pricing', 
  'duplicate-pricing', 
  'delete-pricing', 
  'update-status',
  'refresh',
  'bulk-edit'
])

// Search and filter state
const searchQuery = ref('')
const statusFilter = ref('all')
const customerFilter = ref('all')
const discountTypeFilter = ref('all')

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)

// Sort state
const sortConfig = ref({
  key: 'startDate',
  direction: 'desc'
})

// Selection state
const selectedRows = ref([])

// Reset page when filters change
watch([searchQuery, statusFilter, customerFilter, discountTypeFilter], () => {
  currentPage.value = 1
})

// Computed properties
const filteredRules = computed(() => {
  return props.pricingRules.filter(rule => {
    // Apply search filter
    const searchMatch = !searchQuery.value || 
      rule.customerName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      rule.productName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      formatAmount(rule.amount, rule.discountType).toLowerCase().includes(searchQuery.value.toLowerCase())

    // Apply status filter
    const statusMatch = statusFilter.value === 'all' || rule.status === statusFilter.value

    // Apply customer filter
    const customerMatch = customerFilter.value === 'all' || rule.customerId === customerFilter.value

    // Apply discount type filter
    const discountTypeMatch = discountTypeFilter.value === 'all' || rule.discountType === discountTypeFilter.value

    return searchMatch && statusMatch && customerMatch && discountTypeMatch
  }).sort((a, b) => {
    const direction = sortConfig.value.direction === 'asc' ? 1 : -1
    
    if (sortConfig.value.key === 'startDate' || sortConfig.value.key === 'endDate') {
      const dateA = a[sortConfig.value.key] ? new Date(a[sortConfig.value.key]) : new Date(0)
      const dateB = b[sortConfig.value.key] ? new Date(b[sortConfig.value.key]) : new Date(0)
      return (dateA - dateB) * direction
    }
    
    if (sortConfig.value.key === 'amount') {
      return (parseFloat(a.amount) - parseFloat(b.amount)) * direction
    }
    
    return a[sortConfig.value.key].toString().localeCompare(b[sortConfig.value.key].toString()) * direction
  })
})

const paginatedRules = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRules.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredRules.value.length / pageSize.value) || 1
})

const paginationStart = computed(() => {
  return filteredRules.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * pageSize.value, filteredRules.value.length)
})

const selectAll = computed({
  get: () => {
    return paginatedRules.value.length > 0 && 
      paginatedRules.value.every(rule => selectedRows.value.includes(rule.id))
  },
  set: (value) => {
    if (value) {
      // Add all paginated rules to selection
      paginatedRules.value.forEach(rule => {
        if (!selectedRows.value.includes(rule.id)) {
          selectedRows.value.push(rule.id)
        }
      })
    } else {
      // Remove all paginated rules from selection
      selectedRows.value = selectedRows.value.filter(id => 
        !paginatedRules.value.some(rule => rule.id === id)
      )
    }
  }
})

// Methods
const sortBy = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
}

const toggleSelection = (id) => {
  const index = selectedRows.value.indexOf(id)
  if (index === -1) {
    selectedRows.value.push(id)
  } else {
    selectedRows.value.splice(index, 1)
  }
}

const toggleSelectAll = (checked) => {
  selectAll.value = checked
}

const formatDate = (dateString) => {
  if (!dateString) return null
  return format(parseISO(dateString), 'MMM d, yyyy')
}

const formatDiscountType = (type) => {
  switch (type) {
    case 'percentage':
      return 'Percentage'
    case 'fixed':
      return 'Fixed Amount'
    case 'override':
      return 'Price Override'
    default:
      return type
  }
}

const formatAmount = (amount, type) => {
  if (type === 'percentage') {
    return `${amount}%`
  } else {
    return `$${parseFloat(amount).toFixed(2)}`
  }
}

const getDiscountTypeBadgeVariant = (type) => {
  switch (type) {
    case 'percentage':
      return 'secondary'
    case 'fixed':
      return 'outline'
    case 'override':
      return 'default'
    default:
      return 'outline'
  }
}

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    case 'scheduled':
      return 'warning'
    default:
      return 'outline'
  }
}

const handleBulkEdit = () => {
  const selectedPricingRules = props.pricingRules.filter(rule => 
    selectedRows.value.includes(rule.id)
  )
  emit('bulk-edit', selectedPricingRules)
}

const handleBulkDelete = () => {
  // This would typically show a confirmation dialog
  // Here we're just emitting delete events for each selected rule
  props.pricingRules.forEach(rule => {
    if (selectedRows.value.includes(rule.id)) {
      emit('delete-pricing', rule)
    }
  })
}

const handleBulkToggleStatus = () => {
  // This would typically show a status update dialog
  // Here we're just emitting update-status events for each selected rule
  props.pricingRules.forEach(rule => {
    if (selectedRows.value.includes(rule.id)) {
      emit('update-status', rule)
    }
  })
}
</script>