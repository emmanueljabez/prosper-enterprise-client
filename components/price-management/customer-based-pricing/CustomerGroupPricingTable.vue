<template>
  <div class="space-y-4">
    <!-- Filters and controls -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Group Pricing Rules</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredRules.length }} group pricing rules
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
            @click="$emit('add-group-rule')"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Group Rule
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
            placeholder="Search by group name..."
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
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="discountType">Discount Type</Label>
          <Select v-model="filters.discountType">
            <SelectTrigger id="discountType">
              <SelectValue placeholder="Discount Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
              <SelectItem value="none">No Discount</SelectItem>
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
              <SelectItem value="name">Group Name</SelectItem>
              <SelectItem value="discountValue">Discount Value</SelectItem>
              <SelectItem value="customerCount">Customer Count</SelectItem>
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
                @click="toggleSort('name')"
              >
                Group Name 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'name' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'name' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="toggleSort('customerCount')"
              >
                Customers 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'customerCount' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'customerCount' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Discount Type</TableHead>
            <TableHead>
              <div
                class="flex items-center cursor-pointer"
                @click="toggleSort('discountValue')"
              >
                Discount Value
                <ArrowUpIcon
                  v-if="sortConfig.key === 'discountValue' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'discountValue' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Pricing Tier</TableHead>
            <TableHead>Min. Order</TableHead>
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
            <TableCell colSpan="9" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading pricing rules...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedRules.length === 0" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <UsersIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No customer group pricing rules found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new group pricing rule
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  @click="$emit('add-group-rule')"
                  class="mt-4"
                >
                  <PlusIcon class="h-4 w-4 mr-2" />
                  Add Group Rule
                </Button>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="rule in paginatedRules" :key="rule.id">
            <TableCell class="font-medium">
              <div class="flex flex-col">
                <div>{{ rule.name }}</div>
                <div v-if="rule.description" class="text-xs text-muted-foreground truncate max-w-xs">
                  {{ rule.description }}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{{ rule.customerCount || 0 }}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {{ formatDiscountType(rule.discountType) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDiscountValue(rule) }}</TableCell>
            <TableCell>
              <div v-if="rule.pricingTier">{{ rule.pricingTier }}</div>
              <div v-else class="text-muted-foreground text-sm">Default</div>
            </TableCell>
            <TableCell>
              <div v-if="rule.minimumOrderAmount">
                {{ formatCurrency(rule.minimumOrderAmount) }}
              </div>
              <div v-else class="text-muted-foreground text-sm">None</div>
            </TableCell>
            <TableCell>
              <Badge :variant="rule.isDefault ? 'default' : (rule.isActive ? 'success' : 'secondary')">
                {{ rule.isDefault ? 'Default' : (rule.isActive ? 'Active' : 'Inactive') }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDate(rule.updatedAt) }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="$emit('edit-group-rule', rule)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('view-customers', rule)">
                    <UsersIcon class="mr-2 h-4 w-4" />
                    <span>View Customers</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-products', rule)">
                    <BoxIcon class="mr-2 h-4 w-4" />
                    <span>Product Pricing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('toggle-status', rule)" v-if="!rule.isDefault">
                    <PowerIcon class="mr-2 h-4 w-4" />
                    <span>{{ rule.isActive ? 'Deactivate' : 'Activate' }}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('set-default', rule)" v-if="!rule.isDefault">
                    <StarIcon class="mr-2 h-4 w-4" />
                    <span>Set as Default</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    @click="$emit('delete-group-rule', rule)" 
                    class="text-destructive focus:text-destructive"
                    v-if="!rule.isDefault"
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredRules.length) }}
        of {{ filteredRules.length }} entries
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
  Loader2Icon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  RefreshCwIcon,
  StarIcon,
  Trash2Icon,
  UsersIcon,
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
  customerGroups: {
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
  'refresh',
  'add-group-rule',
  'edit-group-rule',
  'delete-group-rule',
  'toggle-status',
  'set-default',
  'view-customers',
  'edit-products'
])

// Filters
const filters = ref({
  search: '',
  status: 'all',
  discountType: 'all'
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
const filteredRules = computed(() => {
  let result = [...props.customerGroups]

  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(group =>
      group.name.toLowerCase().includes(searchTerm) ||
      (group.description && group.description.toLowerCase().includes(searchTerm))
    )
  }

  // Apply status filter
  if (filters.value.status !== 'all') {
    if (filters.value.status === 'active') {
      result = result.filter(group => group.isActive)
    } else if (filters.value.status === 'inactive') {
      result = result.filter(group => !group.isActive)
    }
  }

  // Apply discount type filter
  if (filters.value.discountType !== 'all') {
    result = result.filter(group => group.discountType === filters.value.discountType)
  }

  // Apply sorting
  result.sort((a, b) => {
    let aValue = a[sortConfig.value.key]
    let bValue = b[sortConfig.value.key]

    // Special handling for dates
    if (sortConfig.value.key === 'updatedAt' || sortConfig.value.key === 'createdAt') {
      aValue = new Date(aValue || 0).getTime()
      bValue = new Date(bValue || 0).getTime()
    }

    // Special handling for numbers that might be strings
    if (
      sortConfig.value.key === 'discountValue' || 
      sortConfig.value.key === 'customerCount' ||
      sortConfig.value.key === 'minimumOrderAmount'
    ) {
      aValue = parseFloat(aValue || 0)
      bValue = parseFloat(bValue || 0)
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

const paginatedRules = computed(() => {
  const startIndex = (pagination.value.page - 1) * pagination.value.pageSize
  const endIndex = startIndex + pagination.value.pageSize
  return filteredRules.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => 
  Math.max(1, Math.ceil(filteredRules.value.length / pagination.value.pageSize))
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

function formatDiscountType(type) {
  if (!type || type === 'none') return 'No Discount'
  
  const typeMap = {
    'percentage': 'Percentage',
    'fixed_amount': 'Fixed Amount'
  }
  
  return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatDiscountValue(rule) {
  if (!rule.discountType || rule.discountType === 'none') return 'N/A'
  
  switch (rule.discountType) {
    case 'percentage':
      return `${rule.discountValue}%`
    case 'fixed_amount':
      return formatCurrency(rule.discountValue)
    default:
      return rule.discountValue ? `${rule.discountValue}` : 'N/A'
  }
}

function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    discountType: 'all'
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