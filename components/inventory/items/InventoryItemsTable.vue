<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Inventory Items</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredItems.length }} items found
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
            @click="$emit('bulk-edit', selectedItems)" 
            :disabled="!hasSelectedItems"
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
            placeholder="Search by name, SKU, or UPC..."
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
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="categoryFilter">Category</Label>
          <Select v-model="filters.category">
            <SelectTrigger id="categoryFilter">
              <SelectValue :placeholder="getCategoryLabel(filters.category)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id.toString()"
              >
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="locationFilter">Location</Label>
          <Select v-model="filters.location">
            <SelectTrigger id="locationFilter">
              <SelectValue :placeholder="getLocationLabel(filters.location)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem 
                v-for="location in locations" 
                :key="location.id" 
                :value="location.id.toString()"
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
                Item 
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
                @click="sortBy('sku')"
              >
                SKU 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'sku' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'sku' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('stockAvailable')"
              >
                Stock Available 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'stockAvailable' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'stockAvailable' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('cost')"
              >
                Cost 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'cost' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'cost' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Locations</TableHead>
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
              <div class="mt-2 text-sm text-muted-foreground">Loading inventory items...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedItems.length === 0" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <PackageXIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No items found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new inventory item
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="item in paginatedItems" :key="item.id">
            <TableCell>
              <Checkbox
                :checked="selectedItems.includes(item.id)"
                @update:checked="() => toggleItemSelection(item.id)"
              />
            </TableCell>
            <TableCell class="min-w-[200px]">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                  <BoxIcon class="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div class="font-medium">{{ item.name }}</div>
                  <div v-if="getCategoryName(item.categoryId)" class="text-xs text-muted-foreground">
                    {{ getCategoryName(item.categoryId) }}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>{{ item.sku }}</TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(item.status)">
                {{ formatStatus(item.status) }}
              </Badge>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1">
                <span>{{ item.stockAvailable }}</span>
                <Badge v-if="item.stockAvailable <= 0" variant="destructive" class="ml-1">Out of stock</Badge>
                <Badge v-else-if="isLowStock(item)" variant="warning" class="ml-1">Low stock</Badge>
              </div>
            </TableCell>
            <TableCell>{{ formatCurrency(item.cost) }}</TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-1">
                <Badge 
                  v-for="location in item.locations.slice(0, 2)" 
                  :key="location.id" 
                  variant="outline" 
                  class="whitespace-nowrap"
                >
                  {{ location.name }}: {{ location.quantity }}
                </Badge>
                <Badge 
                  v-if="item.locations.length > 2" 
                  variant="outline" 
                  class="whitespace-nowrap"
                >
                  +{{ item.locations.length - 2 }} more
                </Badge>
              </div>
            </TableCell>
            <TableCell>{{ formatDate(item.updatedAt) }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewItemDetails(item)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="editItem(item)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="adjustStock(item)">
                    <ScaleIcon class="mr-2 h-4 w-4" />
                    <span>Adjust Stock</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="updateStatus(item)">
                    <TagIcon class="mr-2 h-4 w-4" />
                    <span>Update Status</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="duplicateItem(item)">
                    <CopyIcon class="mr-2 h-4 w-4" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="deleteItem(item)" class="text-destructive focus:text-destructive">
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredItems.length) }}
        of {{ filteredItems.length }} entries
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
  BoxIcon,
  CopyIcon,
  EditIcon,
  EyeIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PackageXIcon,
  PencilIcon,
  RefreshCwIcon,
  ScaleIcon,
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
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  locations: {
    type: Array,
    required: true,
    default: () => []
  },
  categories: {
    type: Array,
    required: false,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-item',
  'edit-item',
  'duplicate-item',
  'delete-item',
  'update-status',
  'adjust-stock',
  'refresh',
  'bulk-edit'
])

// State
const selectedItems = ref([])
const filters = ref({
  search: '',
  status: 'all',
  category: 'all',
  location: 'all'
})

const sortConfig = ref({
  key: 'updatedAt',
  direction: 'desc'
})

const pagination = ref({
  page: 1,
  pageSize: 10
})

// Computed properties
const hasSelectedItems = computed(() => selectedItems.value.length > 0)

const filteredItems = computed(() => {
  return props.items.filter(item => {
    // Search filter
    if (filters.value.search && !matchesSearch(item, filters.value.search)) {
      return false
    }
    
    // Status filter
    if (filters.value.status !== 'all' && item.status !== filters.value.status) {
      return false
    }
    
    // Category filter
    if (filters.value.category !== 'all' && item.categoryId !== filters.value.category) {
      return false
    }
    
    // Location filter
    if (filters.value.location !== 'all' && !item.locations.some(loc => loc.id === filters.value.location)) {
      return false
    }
    
    return true
  })
})

const sortedItems = computed(() => {
  return [...filteredItems.value].sort((a, b) => {
    let aValue, bValue
    
    // Handle nested properties like stockAvailable
    if (sortConfig.value.key === 'stockAvailable') {
      aValue = a.stockAvailable
      bValue = b.stockAvailable
    } else {
      aValue = a[sortConfig.value.key]
      bValue = b[sortConfig.value.key]
    }
    
    // Handle string comparisons
    if (typeof aValue === 'string') {
      const result = aValue.localeCompare(bValue)
      return sortConfig.value.direction === 'asc' ? result : -result
    }
    
    // Handle number comparisons
    const result = aValue - bValue
    return sortConfig.value.direction === 'asc' ? result : -result
  })
})

const paginatedItems = computed(() => {
  const startIndex = (pagination.value.page - 1) * pagination.value.pageSize
  const endIndex = startIndex + pagination.value.pageSize
  return sortedItems.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / pagination.value.pageSize)
})

const isAllSelected = computed(() => {
  return paginatedItems.value.length > 0 && paginatedItems.value.every(item => selectedItems.value.includes(item.id))
})

const isSomeSelected = computed(() => {
  return paginatedItems.value.some(item => selectedItems.value.includes(item.id)) && !isAllSelected.value
})

// Methods
function matchesSearch(item, searchTerm) {
  searchTerm = searchTerm.toLowerCase()
  return (
    item.name.toLowerCase().includes(searchTerm) ||
    item.sku.toLowerCase().includes(searchTerm) ||
    (item.upc && item.upc.toLowerCase().includes(searchTerm)) ||
    (item.description && item.description.toLowerCase().includes(searchTerm))
  )
}

function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy')
  } catch (e) {
    return dateString
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(value)
}

function formatStatus(status) {
  switch (status) {
    case 'active':
      return 'Active'
    case 'out_of_stock':
      return 'Out of Stock'
    case 'low_stock':
      return 'Low Stock'
    case 'discontinued':
      return 'Discontinued'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

function getStatusVariant(status) {
  switch (status) {
    case 'active':
      return 'success'
    case 'out_of_stock':
      return 'destructive'
    case 'low_stock':
      return 'warning'
    case 'discontinued':
      return 'outline'
    default:
      return 'default'
  }
}

function getStatusLabel(statusValue) {
  switch (statusValue) {
    case 'active':
      return 'Active'
    case 'out_of_stock':
      return 'Out of Stock'
    case 'low_stock':
      return 'Low Stock'
    case 'discontinued':
      return 'Discontinued'
    case 'all':
      return 'All Statuses'
    default:
      return statusValue
  }
}

function getCategoryName(categoryId) {
  if (!categoryId) return null
  const category = props.categories.find(c => c.id === categoryId)
  return category ? category.name : null
}

function getCategoryLabel(categoryId) {
  if (categoryId === 'all') return 'All Categories'
  return getCategoryName(categoryId) || 'Select Category'
}

function getLocationLabel(locationId) {
  if (locationId === 'all') return 'All Locations'
  const location = props.locations.find(l => l.id === locationId)
  return location ? location.name : 'Select Location'
}

function isLowStock(item) {
  return item.stockAvailable > 0 && item.stockAvailable <= item.reorderPoint
}

function toggleSelectAll(checked) {
  if (checked) {
    selectedItems.value = paginatedItems.value.map(item => item.id)
  } else {
    selectedItems.value = []
  }
}

function toggleItemSelection(id) {
  const index = selectedItems.value.indexOf(id)
  if (index === -1) {
    selectedItems.value.push(id)
  } else {
    selectedItems.value.splice(index, 1)
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

function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    category: 'all',
    location: 'all'
  }
  pagination.value.page = 1
}

function refreshData() {
  emit('refresh')
}

// Event handlers
function viewItemDetails(item) {
  emit('view-item', item)
}

function editItem(item) {
  emit('edit-item', item)
}

function duplicateItem(item) {
  emit('duplicate-item', item)
}

function deleteItem(item) {
  emit('delete-item', item)
}

function updateStatus(item) {
  emit('update-status', item)
}

function adjustStock(item) {
  emit('adjust-stock', item)
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })
</script>