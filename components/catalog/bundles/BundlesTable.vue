<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Bundles</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredBundles.length }} bundles found
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
            @click="$emit('bulk-edit', getSelectedBundles())" 
            :disabled="!hasSelectedBundles"
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
            placeholder="Search by name, SKU, or description..."
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
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
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
          <Label for="inventoryFilter">Inventory</Label>
          <Select v-model="filters.inventory">
            <SelectTrigger id="inventoryFilter">
              <SelectValue :placeholder="getInventoryLabel(filters.inventory)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Inventory</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
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
                Bundle
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
            <TableHead>SKU</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('price')"
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
            <TableHead>Components</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('inventory.available')"
              >
                Availability
                <ArrowUpIcon
                  v-if="sortConfig.key === 'inventory.available' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'inventory.available' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
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
              <div class="mt-2 text-sm text-muted-foreground">Loading bundles...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedBundles.length === 0" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <PackageXIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No bundles found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new bundle
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="bundle in paginatedBundles" :key="bundle.id">
            <TableCell>
              <Checkbox
                :checked="selectedBundles.includes(bundle.id)"
                @update:checked="() => toggleBundleSelection(bundle.id)"
              />
            </TableCell>
            <TableCell class="min-w-[200px]">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    v-if="getBundleImage(bundle)"
                    :src="getBundleImage(bundle)"
                    :alt="bundle.name"
                    class="h-full w-full object-cover"
                  />
                  <PackageIcon v-else class="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div class="font-medium">{{ bundle.name }}</div>
                  <div v-if="getCategoryNames(bundle).length" class="text-xs text-muted-foreground">
                    {{ getCategoryNames(bundle).join(', ') }}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>{{ bundle.sku }}</TableCell>
            <TableCell>
              <div class="flex flex-col">
                <span>{{ formatPrice(bundle.price) }}</span>
                <span v-if="bundle.compareAtPrice" class="text-xs text-muted-foreground line-through">
                  {{ formatPrice(bundle.compareAtPrice) }}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge>{{ getBundleItemCount(bundle) }} items</Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(bundle.status)">
                {{ formatStatus(bundle.status) }}
              </Badge>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1">
                <Badge :variant="getInventoryVariant(bundle)">
                  {{ getInventoryStatus(bundle) }}
                </Badge>
              </div>
            </TableCell>
            <TableCell>{{ formatDate(bundle.updatedAt) }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewBundleDetails(bundle)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="editBundle(bundle)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="manageBundleItems(bundle)">
                    <PackageIcon class="mr-2 h-4 w-4" />
                    <span>Manage Components</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="updateStatus(bundle)">
                    <TagIcon class="mr-2 h-4 w-4" />
                    <span>Update Status</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="duplicateBundle(bundle)">
                    <CopyIcon class="mr-2 h-4 w-4" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="deleteBundle(bundle)" class="text-destructive focus:text-destructive">
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredBundles.length) }}
        of {{ filteredBundles.length }} entries
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
  EyeIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PackageIcon,
  PackageXIcon,
  PencilIcon,
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
  bundles: {
    type: Array,
    required: true,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-bundle',
  'edit-bundle',
  'duplicate-bundle',
  'delete-bundle',
  'update-status',
  'manage-bundle-items',
  'refresh',
  'bulk-edit'
])

// Filters
const filters = ref({
  search: '',
  status: 'all',
  category: 'all',
  inventory: 'all'
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

// Selected bundles
const selectedBundles = ref([])

// Computed properties
const filteredBundles = computed(() => {
  let result = [...props.bundles]

  // Search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(bundle =>
      bundle.name.toLowerCase().includes(searchTerm) ||
      bundle.sku.toLowerCase().includes(searchTerm) ||
      (bundle.description && bundle.description.toLowerCase().includes(searchTerm))
    )
  }

  // Status filter
  if (filters.value.status && filters.value.status !== 'all') {
    result = result.filter(bundle => bundle.status === filters.value.status)
  }

  // Category filter
  if (filters.value.category && filters.value.category !== 'all') {
    const categoryId = parseInt(filters.value.category) || filters.value.category
    result = result.filter(bundle => 
      bundle.categories && bundle.categories.includes(categoryId)
    )
  }

  // Inventory filter
  if (filters.value.inventory && filters.value.inventory !== 'all') {
    if (filters.value.inventory === 'in_stock') {
      result = result.filter(bundle => 
        bundle.inventory?.dynamicStock ? 
          (getInventoryStatus(bundle) === 'In Stock') : 
          true
      )
    } else if (filters.value.inventory === 'out_of_stock') {
      result = result.filter(bundle => 
        bundle.inventory?.dynamicStock ? 
          (getInventoryStatus(bundle) === 'Out of Stock') : 
          false
      )
    } else if (filters.value.inventory === 'low_stock') {
      result = result.filter(bundle => 
        bundle.inventory?.dynamicStock ? 
          (getInventoryStatus(bundle) === 'Low Stock') : 
          false
      )
    }
  }

  // Sorting
  result.sort((a, b) => {
    let aValue, bValue

    // Handle nested properties like inventory.available
    if (sortConfig.value.key.includes('.')) {
      const parts = sortConfig.value.key.split('.')
      aValue = parts.reduce((obj, key) => obj && obj[key], a)
      bValue = parts.reduce((obj, key) => obj && obj[key], b)
    } else {
      aValue = a[sortConfig.value.key]
      bValue = b[sortConfig.value.key]
    }

    // Handle dates
    if (sortConfig.value.key === 'updatedAt' || sortConfig.value.key === 'createdAt') {
      aValue = new Date(aValue || 0).getTime()
      bValue = new Date(bValue || 0).getTime()
    }

    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.value.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue
    }

    // Handle strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.value.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    // Fallback
    return sortConfig.value.direction === 'asc' ? -1 : 1
  })

  return result
})

const paginatedBundles = computed(() => {
  const startIndex = (pagination.value.page - 1) * pagination.value.pageSize
  const endIndex = startIndex + pagination.value.pageSize
  return filteredBundles.value.slice(startIndex, endIndex)
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredBundles.value.length / pagination.value.pageSize))
)

const isAllSelected = computed(() =>
  filteredBundles.value.length > 0 && selectedBundles.value.length === filteredBundles.value.length
)

const isSomeSelected = computed(() =>
  selectedBundles.value.length > 0 && selectedBundles.value.length < filteredBundles.value.length
)

const hasSelectedBundles = computed(() => selectedBundles.value.length > 0)

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

function formatPrice(price) {
  if (price === undefined || price === null) return '-'
  return `$${parseFloat(price).toFixed(2)}`
}

function formatStatus(status) {
  if (!status) return 'Unknown'
  
  const statusMap = {
    'active': 'Active',
    'inactive': 'Inactive',
    'draft': 'Draft',
    'archived': 'Archived'
  }
  
  return statusMap[status] || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getStatusVariant(status) {
  const variants = {
    'active': 'success',
    'inactive': 'warning',
    'draft': 'secondary',
    'archived': 'outline'
  }
  return variants[status] || 'default'
}

function getInventoryStatus(bundle) {
  // If the bundle doesn't use dynamic stock, show as 'In Stock'
  if (!bundle.inventory?.dynamicStock) {
    return 'In Stock'
  }
  
  // For mock purposes, we'll calculate this based on bundle ID
  // In real usage, this would come from bundleInventory in your store
  const lastChar = bundle.id.charAt(bundle.id.length - 1)
  const num = parseInt(lastChar) || 0
  
  if (num < 3) {
    return 'Out of Stock'
  } else if (num < 6) {
    return 'Low Stock'
  } else {
    return 'In Stock'
  }
}

function getInventoryVariant(bundle) {
  const status = getInventoryStatus(bundle)
  
  if (status === 'Out of Stock') {
    return 'destructive'
  } else if (status === 'Low Stock') {
    return 'warning'
  } else {
    return 'success'
  }
}

function getCategoryLabel(value) {
  if (!value || value === 'all') return 'All Categories'
  const category = props.categories.find(c => c.id.toString() === value.toString())
  return category ? category.name : 'All Categories'
}

function getStatusLabel(value) {
  if (!value || value === 'all') return 'All Statuses'
  return formatStatus(value)
}

function getInventoryLabel(value) {
  if (!value || value === 'all') return 'All Inventory'
  
  const inventoryMap = {
    'in_stock': 'In Stock',
    'out_of_stock': 'Out of Stock',
    'low_stock': 'Low Stock'
  }
  
  return inventoryMap[value] || value
}

function getCategoryNames(bundle) {
  if (!bundle.categories || !Array.isArray(bundle.categories)) return []
  
  return bundle.categories
    .map(categoryId => {
      const category = props.categories.find(c => c.id === categoryId)
      return category ? category.name : null
    })
    .filter(Boolean)
}

function getBundleImage(bundle) {
  if (!bundle.images || !Array.isArray(bundle.images) || bundle.images.length === 0) {
    return null
  }
  
  const defaultImage = bundle.images.find(img => img.isDefault)
  return defaultImage ? defaultImage.url : bundle.images[0].url
}

function getBundleItemCount(bundle) {
  if (!bundle.bundleItems || !Array.isArray(bundle.bundleItems)) {
    return 0
  }
  
  return bundle.bundleItems.length
}

function getSelectedBundles() {
  return props.bundles.filter(bundle => selectedBundles.value.includes(bundle.id))
}

// Action functions
function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    category: 'all',
    inventory: 'all'
  }
}

function refreshData() {
  emit('refresh')
}

function toggleSelectAll(checked) {
  if (checked) {
    selectedBundles.value = filteredBundles.value.map(bundle => bundle.id)
  } else {
    selectedBundles.value = []
  }
}

function toggleBundleSelection(id) {
  const index = selectedBundles.value.indexOf(id)
  if (index === -1) {
    selectedBundles.value.push(id)
  } else {
    selectedBundles.value.splice(index, 1)
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

function viewBundleDetails(bundle) {
  emit('view-bundle', bundle)
}

function editBundle(bundle) {
  emit('edit-bundle', bundle)
}

function duplicateBundle(bundle) {
  emit('duplicate-bundle', bundle)
}

function deleteBundle(bundle) {
  emit('delete-bundle', bundle)
}

function updateStatus(bundle) {
  emit('update-status', bundle)
}

function manageBundleItems(bundle) {
  emit('manage-bundle-items', bundle)
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })
</script>