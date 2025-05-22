<template>
  <div class="space-y-4">
    <!-- Filters and Search -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      <div class="flex-1">
        <div class="relative">
          <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search promotions..."
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
        
        <Select v-model="typeFilter">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Promotion Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="percentage">Percentage Discount</SelectItem>
            <SelectItem value="fixed">Fixed Amount</SelectItem>
            <SelectItem value="bogo">Buy One Get One</SelectItem>
            <SelectItem value="shipping">Free Shipping</SelectItem>
            <SelectItem value="bundle">Bundle Discount</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="icon" @click="$emit('refresh')" title="Refresh">
          <RefreshCwIcon class="h-4 w-4" />
        </Button>
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
                @click="sortBy('name')"
              >
                Name 
                <ChevronUpIcon
                  v-if="sortConfig.key === 'name' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ChevronDownIcon
                  v-if="sortConfig.key === 'name' && sortConfig.direction === 'desc'"
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
                <ChevronUpIcon
                  v-if="sortConfig.key === 'type' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ChevronDownIcon
                  v-if="sortConfig.key === 'type' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('value')"
              >
                Value 
                <ChevronUpIcon
                  v-if="sortConfig.key === 'value' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ChevronDownIcon
                  v-if="sortConfig.key === 'value' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('appliesTo')"
              >
                Applies To
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
            <TableCell :colspan="10" class="h-24 text-center">
              <Loader2Icon class="h-6 w-6 animate-spin mx-auto" />
              <p class="mt-2 text-sm text-muted-foreground">Loading promotions...</p>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedPromotions.length === 0">
            <TableCell :colspan="10" class="h-24 text-center">
              <p class="text-muted-foreground">No promotions found.</p>
              <Button variant="link" @click="$emit('refresh')" class="mt-2">
                <RefreshCwIcon class="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </TableCell>
          </TableRow>
          <TableRow 
            v-for="promotion in paginatedPromotions" 
            :key="promotion.id"
            :class="{ 'bg-muted/50': selectedRows.includes(promotion.id) }"
          >
            <TableCell>
              <Checkbox 
                :checked="selectedRows.includes(promotion.id)" 
                @update:checked="toggleSelection(promotion.id)"
              />
            </TableCell>
            <TableCell>
              <div class="font-medium">{{ promotion.name }}</div>
              <div class="text-xs text-muted-foreground">ID: {{ promotion.id }}</div>
            </TableCell>
            <TableCell>
              <Badge :variant="getPromotionTypeBadgeVariant(promotion.type)">
                {{ formatPromotionType(promotion.type) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatPromotionValue(promotion.value, promotion.type) }}</TableCell>
            <TableCell>
              <div class="text-sm">
                <span v-if="promotion.appliesTo === 'all'">All Products</span>
                <span v-else-if="promotion.appliesTo === 'category'">{{ promotion.categoryName || 'Category' }}</span>
                <span v-else-if="promotion.appliesTo === 'products'">{{ getApplicableProductsDisplay(promotion) }}</span>
                <span v-else>{{ promotion.appliesTo }}</span>
              </div>
            </TableCell>
            <TableCell>{{ formatDate(promotion.startDate) }}</TableCell>
            <TableCell>{{ formatDate(promotion.endDate) || '—' }}</TableCell>
            <TableCell>
              <Badge :variant="getStatusBadgeVariant(promotion.status)">
                {{ promotion.status }}
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
                  <DropdownMenuItem @click="$emit('view-promotion', promotion)">
                    <EyeIcon class="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-promotion', promotion)">
                    <PencilIcon class="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('duplicate-promotion', promotion)">
                    <CopyIcon class="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('update-status', promotion)">
                    <ToggleLeftIcon class="h-4 w-4 mr-2" />
                    Change Status
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('delete-promotion', promotion)" class="text-destructive focus:text-destructive">
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
        <span class="font-medium">{{ filteredPromotions.length }}</span> promotions
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
  promotions: {
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
  'view-promotion', 
  'edit-promotion', 
  'duplicate-promotion', 
  'delete-promotion', 
  'update-status',
  'refresh',
  'bulk-edit'
])

// Search and filter state
const searchQuery = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')

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
watch([searchQuery, statusFilter, typeFilter], () => {
  currentPage.value = 1
})

// Computed properties
const filteredPromotions = computed(() => {
  return props.promotions.filter(promotion => {
    // Apply search filter
    const searchMatch = !searchQuery.value || 
      promotion.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      formatPromotionType(promotion.type).toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      formatPromotionValue(promotion.value, promotion.type).toLowerCase().includes(searchQuery.value.toLowerCase())

    // Apply status filter
    const statusMatch = statusFilter.value === 'all' || promotion.status === statusFilter.value

    // Apply type filter
    const typeMatch = typeFilter.value === 'all' || promotion.type === typeFilter.value

    return searchMatch && statusMatch && typeMatch
  }).sort((a, b) => {
    const direction = sortConfig.value.direction === 'asc' ? 1 : -1
    
    if (sortConfig.value.key === 'startDate' || sortConfig.value.key === 'endDate') {
      const dateA = a[sortConfig.value.key] ? new Date(a[sortConfig.value.key]).getTime() : 0
      const dateB = b[sortConfig.value.key] ? new Date(b[sortConfig.value.key]).getTime() : 0
      return (dateA - dateB) * direction
    }
    
    if (sortConfig.value.key === 'value') {
      const valueA = typeof a.value === 'number' ? a.value : 0
      const valueB = typeof b.value === 'number' ? b.value : 0
      return (valueA - valueB) * direction
    }
    
    if (a[sortConfig.value.key] < b[sortConfig.value.key]) return -1 * direction
    if (a[sortConfig.value.key] > b[sortConfig.value.key]) return 1 * direction
    return 0
  })
})

const paginatedPromotions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPromotions.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredPromotions.value.length / pageSize.value) || 1
})

const paginationStart = computed(() => {
  return filteredPromotions.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * pageSize.value, filteredPromotions.value.length)
})

const selectAll = computed({
  get: () => {
    return paginatedPromotions.value.length > 0 && 
      paginatedPromotions.value.every(promotion => selectedRows.value.includes(promotion.id))
  },
  set: (value) => {
    if (value) {
      // Add all paginated promotions to selection
      paginatedPromotions.value.forEach(promotion => {
        if (!selectedRows.value.includes(promotion.id)) {
          selectedRows.value.push(promotion.id)
        }
      })
    } else {
      // Remove all paginated promotions from selection
      selectedRows.value = selectedRows.value.filter(id => 
        !paginatedPromotions.value.some(promotion => promotion.id === id)
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

const formatPromotionType = (type) => {
  switch (type) {
    case 'percentage':
      return 'Percentage'
    case 'fixed':
      return 'Fixed Amount'
    case 'bogo':
      return 'Buy One Get One'
    case 'shipping':
      return 'Free Shipping'
    case 'bundle':
      return 'Bundle'
    default:
      return type
  }
}

const formatPromotionValue = (value, type) => {
  if (type === 'percentage') {
    return `${value}%`
  } else if (type === 'fixed') {
    return `$${parseFloat(value).toFixed(2)}`
  } else if (type === 'bogo') {
    return `Buy ${value.buy}, Get ${value.get} ${value.percent ? `${value.percent}% off` : 'Free'}`
  } else if (type === 'shipping') {
    return 'Free'
  } else if (type === 'bundle') {
    return `${value.discount}% off ${value.quantity}+ items`
  } else {
    return value.toString()
  }
}

const getPromotionTypeBadgeVariant = (type) => {
  switch (type) {
    case 'percentage':
      return 'secondary'
    case 'fixed':
      return 'outline'
    case 'bogo':
      return 'default'
    case 'shipping':
      return 'success'
    case 'bundle':
      return 'warning'
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

const getApplicableProductsDisplay = (promotion) => {
  if (promotion.productIds && promotion.productIds.length > 0) {
    if (promotion.productIds.length === 1) {
      const product = props.products.find(p => p.id === promotion.productIds[0])
      return product ? product.name : 'Single Product'
    } else {
      return `${promotion.productIds.length} Products`
    }
  }
  return 'Selected Products'
}

const handleBulkEdit = () => {
  const selectedPromotions = props.promotions.filter(promotion => 
    selectedRows.value.includes(promotion.id)
  )
  emit('bulk-edit', selectedPromotions)
}

const handleBulkDelete = () => {
  // This would typically show a confirmation dialog
  // Here we're just emitting delete events for each selected promotion
  props.promotions.forEach(promotion => {
    if (selectedRows.value.includes(promotion.id)) {
      emit('delete-promotion', promotion)
    }
  })
}

const handleBulkToggleStatus = () => {
  // This would typically show a status update dialog
  // Here we're just emitting update-status events for each selected promotion
  props.promotions.forEach(promotion => {
    if (selectedRows.value.includes(promotion.id)) {
      emit('update-status', promotion)
    }
  })
}
</script>