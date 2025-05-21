<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Pricing Rules</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredPricingRules.length }} rules found
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
            @click="$emit('bulk-edit', selectedRules)" 
            :disabled="!hasSelectedRules"
          >
            <EditIcon class="h-4 w-4 mr-2" />
            Bulk Edit
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="space-y-2">
          <Label for="search">Search</Label>
          <Input
            id="search"
            v-model="filters.search"
            placeholder="Search by name or description..."
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
          <Label for="typeFilter">Rule Type</Label>
          <Select v-model="filters.type">
            <SelectTrigger id="typeFilter">
              <SelectValue placeholder="Rule Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="percentage">Percentage Discount</SelectItem>
              <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
              <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
              <SelectItem value="free_shipping">Free Shipping</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="customerGroupFilter">Customer Group</Label>
          <Select v-model="filters.customerGroup">
            <SelectTrigger id="customerGroupFilter">
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
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[50px]">
              <Checkbox 
                :checked="isAllSelected" 
                :indeterminate="isSomeSelected && !isAllSelected"
                @update:checked="toggleSelectAll"
              />
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('name')"
              >
                Rule Name 
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
            <TableHead>Type</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('discountValue')"
              >
                Value 
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
            <TableHead>Customer Group</TableHead>
            <TableHead>Conditions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('updatedAt')"
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
          <TableRow v-else-if="paginatedPricingRules.length === 0" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <TagIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No pricing rules found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new pricing rule
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="rule in paginatedPricingRules" :key="rule.id">
            <TableCell>
              <Checkbox
                :checked="selectedRules.includes(rule.id)"
                @update:checked="() => toggleRuleSelection(rule.id)"
              />
            </TableCell>
            <TableCell class="min-w-[200px]">
              <div class="flex flex-col">
                <div class="font-medium">{{ rule.name }}</div>
                <div v-if="rule.description" class="text-xs text-muted-foreground truncate max-w-xs">
                  {{ rule.description }}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {{ formatRuleType(rule.type) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDiscount(rule) }}</TableCell>
            <TableCell>
              <div v-if="getCustomerGroupName(rule)">
                {{ getCustomerGroupName(rule) }}
              </div>
              <div v-else-if="rule.customerIds && rule.customerIds.length">
                {{ rule.customerIds.length }} specific customers
              </div>
              <div v-else class="text-muted-foreground text-sm">All customers</div>
            </TableCell>
            <TableCell>
              <div class="flex flex-col gap-1">
                <div v-if="rule.conditions && Object.keys(rule.conditions).length" class="text-xs">
                  <Badge variant="secondary" class="mr-1 mb-1" v-if="rule.conditions.minimumOrderAmount">
                    Min order: {{ formatCurrency(rule.conditions.minimumOrderAmount) }}
                  </Badge>
                  <Badge variant="secondary" class="mr-1 mb-1" v-if="rule.conditions.productCategory">
                    Category specific
                  </Badge>
                  <Badge variant="secondary" class="mr-1 mb-1" v-if="rule.conditions.productIds">
                    {{ Array.isArray(rule.conditions.productIds) ? rule.conditions.productIds.length : 0 }} products
                  </Badge>
                </div>
                <div v-else class="text-xs text-muted-foreground">No conditions</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(rule)">
                {{ formatStatus(rule) }}
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
                  <DropdownMenuItem @click="editRule(rule)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="duplicateRule(rule)">
                    <CopyIcon class="mr-2 h-4 w-4" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="toggleRuleStatus(rule)">
                    <PowerIcon class="mr-2 h-4 w-4" />
                    <span>{{ rule.isActive ? 'Deactivate' : 'Activate' }}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="deleteRule(rule)" class="text-destructive focus:text-destructive">
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredPricingRules.length) }}
        of {{ filteredPricingRules.length }} entries
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
  ArrowUpIcon,
  CopyIcon,
  EditIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PencilIcon,
  PowerIcon,
  RefreshCwIcon,
  TagIcon,
  Trash2Icon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  pricingRules: {
    type: Array,
    required: true,
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
  'edit-rule',
  'delete-rule',
  'duplicate-rule',
  'toggle-rule-status',
  'refresh',
  'bulk-edit'
])

// Filters
const filters = ref({
  search: '',
  status: 'all',
  type: 'all',
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

// Selected rules
const selectedRules = ref([])

// Computed properties
const filteredPricingRules = computed(() => {
  let result = [...props.pricingRules]

  // Search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(rule =>
      rule.name.toLowerCase().includes(searchTerm) ||
      (rule.description && rule.description.toLowerCase().includes(searchTerm))
    )
  }

  // Status filter
  if (filters.value.status !== 'all') {
    if (filters.value.status === 'active') {
      result = result.filter(rule => rule.isActive)
    } else if (filters.value.status === 'inactive') {
      result = result.filter(rule => !rule.isActive)
    } else if (filters.value.status === 'scheduled') {
      const now = new Date()
      result = result.filter(rule => 
        rule.isActive && 
        rule.startDate && 
        new Date(rule.startDate) > now
      )
    } else if (filters.value.status === 'expired') {
      const now = new Date()
      result = result.filter(rule => 
        rule.isActive && 
        rule.endDate && 
        new Date(rule.endDate) < now
      )
    }
  }

  // Type filter
  if (filters.value.type !== 'all') {
    result = result.filter(rule => rule.type === filters.value.type)
  }

  // Customer group filter
  if (filters.value.customerGroup !== 'all') {
    result = result.filter(rule => 
      rule.customerGroupId === filters.value.customerGroup || 
      (rule.conditions && rule.conditions.customerGroupId === filters.value.customerGroup)
    )
  }

  // Sorting
  result.sort((a, b) => {
    let aValue = a[sortConfig.value.key]
    let bValue = b[sortConfig.value.key]

    // Handle dates
    if (sortConfig.value.key === 'updatedAt' || sortConfig.value.key === 'createdAt') {
      aValue = new Date(aValue || 0).getTime()
      bValue = new Date(bValue || 0).getTime()
    }

    // Handle discount value sorting
    if (sortConfig.value.key === 'discountValue') {
      aValue = parseFloat(a.discountValue || 0)
      bValue = parseFloat(b.discountValue || 0)
    }

    // Sort logic
    if (sortConfig.value.direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  return result
})

const paginatedPricingRules = computed(() => {
  const startIndex = (pagination.value.page - 1) * pagination.value.pageSize
  const endIndex = startIndex + pagination.value.pageSize
  return filteredPricingRules.value.slice(startIndex, endIndex)
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredPricingRules.value.length / pagination.value.pageSize))
)

const isAllSelected = computed(() =>
  filteredPricingRules.value.length > 0 && selectedRules.value.length === filteredPricingRules.value.length
)

const isSomeSelected = computed(() =>
  selectedRules.value.length > 0 && selectedRules.value.length < filteredPricingRules.value.length
)

const hasSelectedRules = computed(() => selectedRules.value.length > 0)

// Utility functions
function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return format(date, 'dd MMM yyyy')
  } catch (error) {
    console.error('Date formatting error:', error)
    return dateString
  }
}

function formatCurrency(value) {
  return `$${parseFloat(value).toFixed(2)}`
}

function formatRuleType(type) {
  if (!type) return 'Unknown'
  
  const typeMap = {
    'percentage': 'Percentage',
    'fixed_amount': 'Fixed Amount',
    'buy_x_get_y': 'Buy X Get Y',
    'free_shipping': 'Free Shipping',
    'customer_based': 'Customer Based',
    'customer_group': 'Customer Group'
  }
  
  return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatDiscount(rule) {
  if (!rule.type) return '-'
  
  switch (rule.type) {
    case 'percentage':
      return `${rule.discountValue}%`
    case 'fixed_amount':
      return formatCurrency(rule.discountValue)
    case 'buy_x_get_y':
      return `Buy ${rule.conditions?.buyQuantity || 'X'}, Get ${rule.conditions?.getQuantity || 'Y'}`
    case 'free_shipping':
      return 'Free Shipping'
    default:
      return rule.discountValue ? `${rule.discountValue}` : '-'
  }
}

function formatStatus(rule) {
  if (!rule) return 'Unknown'
  
  const now = new Date()
  const startDate = rule.startDate ? new Date(rule.startDate) : null
  const endDate = rule.endDate ? new Date(rule.endDate) : null
  
  if (!rule.isActive) {
    return 'Inactive'
  }
  
  if (startDate && startDate > now) {
    return 'Scheduled'
  }
  
  if (endDate && endDate < now) {
    return 'Expired'
  }
  
  return 'Active'
}

function getStatusVariant(rule) {
  const status = formatStatus(rule)
  
  const variants = {
    'Active': 'success',
    'Inactive': 'secondary',
    'Scheduled': 'warning',
    'Expired': 'outline'
  }
  
  return variants[status] || 'default'
}

function getCustomerGroupName(rule) {
  if (!rule.customerGroupId && (!rule.conditions || !rule.conditions.customerGroupId)) {
    return null
  }
  
  const groupId = rule.customerGroupId || (rule.conditions && rule.conditions.customerGroupId)
  const group = props.customerGroups.find(g => g.id === groupId)
  
  return group ? group.name : 'Unknown Group'
}

// Action functions
function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    type: 'all',
    customerGroup: 'all'
  }
}

function refreshData() {
  emit('refresh')
}

function toggleSelectAll(checked) {
  if (checked) {
    selectedRules.value = filteredPricingRules.value.map(rule => rule.id)
  } else {
    selectedRules.value = []
  }
}

function toggleRuleSelection(id) {
  const index = selectedRules.value.indexOf(id)
  if (index === -1) {
    selectedRules.value.push(id)
  } else {
    selectedRules.value.splice(index, 1)
  }
}

function sortBy(key) {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
}

function editRule(rule) {
  emit('edit-rule', rule)
}

function duplicateRule(rule) {
  emit('duplicate-rule', rule)
}

function deleteRule(rule) {
  emit('delete-rule', rule)
}

function toggleRuleStatus(rule) {
  emit('toggle-rule-status', rule)
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })
</script>