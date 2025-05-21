<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Products</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredProducts.length }} products found
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
            @click="$emit('bulk-edit', selectedProducts)" 
            :disabled="!hasSelectedProducts"
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
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
          <Label for="typeFilter">Type</Label>
          <Select v-model="filters.type">
            <SelectTrigger id="typeFilter">
              <SelectValue :placeholder="getTypeLabel(filters.type)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="simple">Simple</SelectItem>
              <SelectItem value="configurable">Configurable</SelectItem>
              <SelectItem value="bundle">Bundle</SelectItem>
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
                Product 
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
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('stock.available')"
              >
                Inventory 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'stock.available' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'stock.available' && sortConfig.direction === 'desc'"
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
              <div class="mt-2 text-sm text-muted-foreground">Loading products...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedProducts.length === 0" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <PackageXIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No products found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new product
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="product in paginatedProducts" :key="product.id">
            <TableCell>
              <Checkbox
                :checked="selectedProducts.includes(product.id)"
                @update:checked="() => toggleProductSelection(product.id)"
              />
            </TableCell>
            <TableCell class="min-w-[200px]">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    v-if="getProductImage(product)"
                    :src="getProductImage(product)"
                    :alt="product.name"
                    class="h-full w-full object-cover"
                  />
                  <PackageIcon v-else class="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div class="font-medium">{{ product.name }}</div>
                  <div v-if="getCategoryNames(product).length" class="text-xs text-muted-foreground">
                    {{ getCategoryNames(product).join(', ') }}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>{{ product.sku }}</TableCell>
            <TableCell>{{ formatPrice(product.price) }}</TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(product.status)">
                {{ formatStatus(product.status) }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {{ formatProductType(product.type) }}
              </Badge>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1">
                <span>{{ product.stock?.available || 0 }}</span>
                <Badge v-if="product.stock?.available <= 0" variant="destructive" class="ml-1">Out of stock</Badge>
                <Badge v-else-if="isLowStock(product)" variant="warning" class="ml-1">Low stock</Badge>
              </div>
            </TableCell>
            <TableCell>{{ formatDate(product.updatedAt) }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewProductDetails(product)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="editProduct(product)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem v-if="product.type === 'configurable'" @click="manageVariants(product)">
                    <LayersIcon class="mr-2 h-4 w-4" />
                    <span>Manage Variants</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="updateStatus(product)">
                    <TagIcon class="mr-2 h-4 w-4" />
                    <span>Update Status</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="duplicateProduct(product)">
                    <CopyIcon class="mr-2 h-4 w-4" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="deleteProduct(product)" class="text-destructive focus:text-destructive">
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredProducts.length) }}
        of {{ filteredProducts.length }} entries
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
  LayersIcon,
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
  products: {
    type: Array,
    required: true,
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
  'view-product',
  'edit-product',
  'duplicate-product',
  'delete-product',
  'update-status',
  'manage-variants',
  'refresh',
  'bulk-edit'
])

// Filters
const filters = ref({
  search: '',
  status: 'all',
  category: 'all',
  type: 'all'
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

// Selected products
const selectedProducts = ref([])

// Computed properties
const filteredProducts = computed(() => {
  let result = [...props.products]

  // Search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm))
    )
  }

  // Status filter
  if (filters.value.status && filters.value.status !== 'all') {
    result = result.filter(product => product.status === filters.value.status)
  }

  // Category filter
  if (filters.value.category && filters.value.category !== 'all') {
    const categoryId = parseInt(filters.value.category)
    result = result.filter(product => 
      product.categories && product.categories.includes(categoryId)
    )
  }

  // Type filter
  if (filters.value.type && filters.value.type !== 'all') {
    result = result.filter(product => product.type === filters.value.type)
  }

  // Sorting
  result.sort((a, b) => {
    let aValue, bValue

    // Handle nested properties like stock.available
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

const paginatedProducts = computed(() => {
  const startIndex = (pagination.value.page - 1) * pagination.value.pageSize
  const endIndex = startIndex + pagination.value.pageSize
  return filteredProducts.value.slice(startIndex, endIndex)
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProducts.value.length / pagination.value.pageSize))
)

const isAllSelected = computed(() =>
  filteredProducts.value.length > 0 && selectedProducts.value.length === filteredProducts.value.length
)

const isSomeSelected = computed(() =>
  selectedProducts.value.length > 0 && selectedProducts.value.length < filteredProducts.value.length
)

const hasSelectedProducts = computed(() => selectedProducts.value.length > 0)

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
  return `$${parseFloat(price).toFixed(2)}`
}

function formatStatus(status) {
  if (!status) return 'Unknown'
  
  const statusMap = {
    'active': 'Active',
    'draft': 'Draft',
    'archived': 'Archived',
    'out_of_stock': 'Out of Stock'
  }
  
  return statusMap[status] || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatProductType(type) {
  if (!type) return 'Unknown'
  
  const typeMap = {
    'simple': 'Simple',
    'configurable': 'Configurable',
    'bundle': 'Bundle'
  }
  
  return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getStatusVariant(status) {
  const variants = {
    'active': 'success',
    'draft': 'secondary',
    'archived': 'outline',
    'out_of_stock': 'destructive'
  }
  return variants[status] || 'default'
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

function getTypeLabel(value) {
  if (!value || value === 'all') return 'All Types'
  return formatProductType(value)
}

function getCategoryNames(product) {
  if (!product.categories || !Array.isArray(product.categories)) return []
  
  return product.categories
    .map(categoryId => {
      const category = props.categories.find(c => c.id === categoryId)
      return category ? category.name : null
    })
    .filter(Boolean)
}

function getProductImage(product) {
  if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
    return null
  }
  
  const defaultImage = product.images.find(img => img.isDefault)
  return defaultImage ? defaultImage.url : product.images[0].url
}

function isLowStock(product) {
  if (!product.stock) return false
  
  const lowStockThreshold = product.stock.lowStockThreshold || 10
  return product.stock.available > 0 && product.stock.available <= lowStockThreshold
}

// Action functions
function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    category: 'all',
    type: 'all'
  }
}

function refreshData() {
  emit('refresh')
}

function toggleSelectAll(checked) {
  if (checked) {
    selectedProducts.value = filteredProducts.value.map(product => product.id)
  } else {
    selectedProducts.value = []
  }
}

function toggleProductSelection(id) {
  const index = selectedProducts.value.indexOf(id)
  if (index === -1) {
    selectedProducts.value.push(id)
  } else {
    selectedProducts.value.splice(index, 1)
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

function viewProductDetails(product) {
  emit('view-product', product)
}

function editProduct(product) {
  emit('edit-product', product)
}

function duplicateProduct(product) {
  emit('duplicate-product', product)
}

function deleteProduct(product) {
  emit('delete-product', product)
}

function updateStatus(product) {
  emit('update-status', product)
}

function manageVariants(product) {
  emit('manage-variants', product)
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })
</script>