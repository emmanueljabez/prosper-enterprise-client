<template>
  <div class="space-y-4">
    <!-- Filters and controls -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Customer-Specific Pricing</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredPricing.length }} customer price overrides
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
          <Button 
            variant="default" 
            size="sm" 
            @click="$emit('add-customer-price')"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Price Override
          </Button>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="space-y-2">
          <Label for="search">Search</Label>
          <Input
            id="search"
            v-model="filters.search"
            placeholder="Search by customer or product..."
          />
        </div>
        <div class="space-y-2">
          <Label for="statusFilter">Status</Label>
          <Select v-model="filters.status">
            <SelectTrigger id="statusFilter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="customerGroup">Customer Group</Label>
          <Select v-model="filters.customerGroup">
            <SelectTrigger id="customerGroup">
              <SelectValue placeholder="Customer Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              <SelectItem 
                v-for="group in customerGroups" 
                :key="group.id" 
                :value="group.id"
              >
                {{ group.name }}
              </SelectItem>
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
              <SelectItem value="customerName">Customer Name</SelectItem>
              <SelectItem value="productName">Product Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="discountPercentage">Discount</SelectItem>
              <SelectItem value="updatedAt">Last Updated</SelectItem>
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
                @click="toggleSort('customerName')"
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
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="toggleSort('productName')"
              >
                Product 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'productName' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'productName' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div
                class="flex items-center cursor-pointer"
                @click="toggleSort('price')"
              >
                Price
                <ArrowUpIcon
                  v-if="sortConfig.key === 'price' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'price' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div
                class="flex items-center cursor-pointer"
                @click="toggleSort('compareAtPrice')"
              >
                Compare At
                <ArrowUpIcon
                  v-if="sortConfig.key === 'compareAtPrice' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'compareAtPrice' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div
                class="flex items-center cursor-pointer"
                @click="toggleSort('discountPercentage')"
              >
                Discount
                <ArrowUpIcon
                  v-if="sortConfig.key === 'discountPercentage' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'discountPercentage' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <div
                class="flex items-center cursor-pointer"
                @click="toggleSort('updatedAt')"
              >
                Updated
                <ArrowUpIcon
                  v-if="sortConfig.key === 'updatedAt' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'updatedAt' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="h-24">
            <TableCell colSpan="10" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading customer pricing...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedPricing.length === 0" class="h-24">
            <TableCell colSpan="10" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <TagIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No customer-specific pricing found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new price override
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  @click="$emit('add-customer-price')"
                  class="mt-4"
                >
                  <PlusIcon class="h-4 w-4 mr-2" />
                  Add Price Override
                </Button>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="pricing in paginatedPricing" :key="pricing.id">
            <TableCell class="font-medium">
              <div class="flex flex-col">
                <div>{{ getCustomerName(pricing) }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ getCustomerEmail(pricing) }}
                </div>
                <div v-if="getCustomerCompany(pricing)" class="text-xs text-muted-foreground">
                  {{ getCustomerCompany(pricing) }}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-col">
                <div>{{ getProductName(pricing) }}</div>
                <div class="text-xs text-muted-foreground">
                  SKU: {{ getProductSku(pricing) }}
                </div>
              </div>
            </TableCell>
            <TableCell class="font-medium">
              {{ formatCurrency(pricing.price) }}
            </TableCell>
            <TableCell>
              <div v-if="pricing.compareAtPrice">
                <span class="line-through text-muted-foreground">
                  {{ formatCurrency(pricing.compareAtPrice) }}
                </span>
              </div>
              <div v-else class="text-muted-foreground text-sm">—</div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" v-if="calculateDiscount(pricing)">
                {{ calculateDiscount(pricing) }}% off
              </Badge>
              <div v-else class="text-muted-foreground text-sm">—</div>
            </TableCell>
            <TableCell>
              <div v-if="pricing.startDate || pricing.endDate" class="text-xs space-y-1">
                <div v-if="pricing.startDate">
                  From: {{ formatDate(pricing.startDate) }}
                </div>
                <div v-if="pricing.endDate">
                  Until: {{ formatDate(pricing.endDate) }}
                </div>
              </div>
              <div v-else class="text-muted-foreground text-sm">Ongoing</div>
            </TableCell>
            <TableCell>
              <Badge :variant="getPricingStatusVariant(pricing)">
                {{ formatPricingStatus(pricing) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDate(pricing.updatedAt) }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="$emit('edit-customer-price', pricing)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('view-customer', pricing.customerId)">
                    <UserIcon class="mr-2 h-4 w-4" />
                    <span>View Customer</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('view-product', pricing.productId)">
                    <BoxIcon class="mr-2 h-4 w-4" />
                    <span>View Product</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('toggle-status', pricing)">
                    <PowerIcon class="mr-2 h-4 w-4" />
                    <span>{{ pricing.isActive ? 'Deactivate' : 'Activate' }}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('duplicate-price', pricing)">
                    <CopyIcon class="mr-2 h-4 w-4" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    @click="$emit('delete-customer-price', pricing)" 
                    class="text-destructive focus:text-destructive"
                  >
                    <Trash2Icon class="mr-2 h-4 w-4" />
                    <span>Delete</span>
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredPricing.length) }}
        of {{ filteredPricing.length }} entries
      </div>
      <div class="flex items-center space-x-6">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-muted-foreground">Rows per page</span>
          <Select 
            v-model="pagination.pageSize" 
            class="w-[70px]"
          >
            <SelectTrigger>
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIcon,
  CopyIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  RefreshCwIcon,
  TagIcon,
  Trash2Icon,
  UserIcon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
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
  customerPricing: {
    type: Array,
    required: true,
    default: () => []
  },
  customers: {
    type: Array,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  },
  customerGroups: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'refresh',
  'add-customer-price',
  'edit-customer-price',
  'delete-customer-price',
  'toggle-status',
  'view-customer',
  'view-product',
  'duplicate-price'
])

// Filters
const filters = ref({
  search: '',
  status: 'all',
  customerGroup: 'all'
})

// Pagination
const pagination = ref({
  page: 1,
  pageSize: 10
})

// Sorting
const sortConfig = ref({
  key: 'updatedAt',
  direction: 'desc'
})

// Computed properties
const filteredPricing = computed(() => {
  let result = [...props.customerPricing]

  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(pricing => {
      const customer = props.customers.find(c => c.id === pricing.customerId)
      const product = props.products.find(p => p.id === pricing.productId)
      
      return (
        (customer && customer.firstName && customer.firstName.toLowerCase().includes(searchTerm)) ||
        (customer && customer.lastName && customer.lastName.toLowerCase().includes(searchTerm)) ||
        (customer && customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
        (customer && customer.company && customer.company.toLowerCase().includes(searchTerm)) ||
        (product && product.name && product.name.toLowerCase().includes(searchTerm)) ||
        (product && product.sku && product.sku.toLowerCase().includes(searchTerm))
      )
    })
  }

  // Apply status filter
  if (filters.value.status !== 'all') {
    const now = new Date()
    
    if (filters.value.status === 'active') {
      result = result.filter(pricing => 
        pricing.isActive && 
        (!pricing.startDate || new Date(pricing.startDate) <= now) &&
        (!pricing.endDate || new Date(pricing.endDate) >= now)
      )
    } else if (filters.value.status === 'inactive') {
      result = result.filter(pricing => !pricing.isActive)
    } else if (filters.value.status === 'scheduled') {
      result = result.filter(pricing => 
        pricing.isActive && 
        pricing.startDate && 
        new Date(pricing.startDate) > now
      )
    } else if (filters.value.status === 'expired') {
      result = result.filter(pricing => 
        pricing.endDate && 
        new Date(pricing.endDate) < now
      )
    }
  }

  // Apply customer group filter
  if (filters.value.customerGroup !== 'all') {
    result = result.filter(pricing => {
      const customer = props.customers.find(c => c.id === pricing.customerId)
      return customer && customer.groupId === filters.value.customerGroup
    })
  }

  // Apply sorting
  result.sort((a, b) => {
    let aValue, bValue
    
    // Handle special sort keys that require lookups
    if (sortConfig.value.key === 'customerName') {
      const customerA = props.customers.find(c => c.id === a.customerId)
      const customerB = props.customers.find(c => c.id === b.customerId)
      
      aValue = customerA ? `${customerA.firstName} ${customerA.lastName}`.toLowerCase() : ''
      bValue = customerB ? `${customerB.firstName} ${customerB.lastName}`.toLowerCase() : ''
    } 
    else if (sortConfig.value.key === 'productName') {
      const productA = props.products.find(p => p.id === a.productId)
      const productB = props.products.find(p => p.id === b.productId)
      
      aValue = productA?.name?.toLowerCase() || ''
      bValue = productB?.name?.toLowerCase() || ''
    }
    else if (sortConfig.value.key === 'discountPercentage') {
      // Calculate discount percentages for comparison
      aValue = calculateDiscountNumber(a) || 0
      bValue = calculateDiscountNumber(b) || 0
    }
    else {
      // Default sorting for direct properties
      aValue = a[sortConfig.value.key]
      bValue = b[sortConfig.value.key]
      
      // Handle dates
      if (sortConfig.value.key === 'updatedAt' || sortConfig.value.key === 'createdAt' ||
          sortConfig.value.key === 'startDate' || sortConfig.value.key === 'endDate') {
        aValue = new Date(aValue || 0).getTime()
        bValue = new Date(bValue || 0).getTime()
      }
      
      // Handle numeric values that might be strings
      if (sortConfig.value.key === 'price' || sortConfig.value.key === 'compareAtPrice') {
        aValue = parseFloat(aValue || 0)
        bValue = parseFloat(bValue || 0)
      }
    }

    // Sort direction
    if (sortConfig.value.direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  return result
})

const paginatedPricing = computed(() => {
  const startIndex = (pagination.value.page - 1) * pagination.value.pageSize
  const endIndex = startIndex + pagination.value.pageSize
  return filteredPricing.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => 
  Math.max(1, Math.ceil(filteredPricing.value.length / pagination.value.pageSize))
)

// Methods
function toggleSort(key) {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return format(date, 'dd MMM yyyy')
  } catch (error) {
    console.error('Date formatting error:', error)
    return dateString
  }
}

function formatCurrency(value) {
  if (!value) return '$0.00'
  return `$${parseFloat(value).toFixed(2)}`
}

function getCustomerName(pricing) {
  const customer = props.customers.find(c => c.id === pricing.customerId)
  return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer'
}

function getCustomerEmail(pricing) {
  const customer = props.customers.find(c => c.id === pricing.customerId)
  return customer?.email || ''
}

function getCustomerCompany(pricing) {
  const customer = props.customers.find(c => c.id === pricing.customerId)
  return customer?.company || ''
}

function getProductName(pricing) {
  const product = props.products.find(p => p.id === pricing.productId)
  return product?.name || 'Unknown Product'
}

function getProductSku(pricing) {
  const product = props.products.find(p => p.id === pricing.productId)
  return product?.sku || 'N/A'
}

function calculateDiscountNumber(pricing) {
  if (!pricing.compareAtPrice || !pricing.price) return null
  
  const originalPrice = parseFloat(pricing.compareAtPrice)
  const discountedPrice = parseFloat(pricing.price)
  
  if (originalPrice <= 0 || discountedPrice >= originalPrice) return null
  
  const discountPercentage = ((originalPrice - discountedPrice) / originalPrice) * 100
  return parseFloat(discountPercentage.toFixed(1))
}

function calculateDiscount(pricing) {
  return calculateDiscountNumber(pricing)?.toString() || null
}

function formatPricingStatus(pricing) {
  if (!pricing.isActive) return 'Inactive'
  
  const now = new Date()
  const startDate = pricing.startDate ? new Date(pricing.startDate) : null
  const endDate = pricing.endDate ? new Date(pricing.endDate) : null
  
  if (startDate && startDate > now) {
    return 'Scheduled'
  }
  
  if (endDate && endDate < now) {
    return 'Expired'
  }
  
  return 'Active'
}

function getPricingStatusVariant(pricing) {
  const status = formatPricingStatus(pricing)
  
  const variants = {
    'Active': 'success',
    'Inactive': 'secondary',
    'Scheduled': 'warning',
    'Expired': 'outline'
  }
  
  return variants[status] || 'default'
}

function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    customerGroup: 'all'
  }
}

function refreshData() {
  emit('refresh')
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })

// Watch for pageSize changes to adjust current page if needed
watch(() => pagination.value.pageSize, (newSize) => {
  // Convert to number since Select may return string
  pagination.value.pageSize = Number(newSize)
  
  // Check if current page is now invalid with new page size
  if (pagination.value.page > totalPages.value) {
    pagination.value.page = totalPages.value
  }
})
</script>