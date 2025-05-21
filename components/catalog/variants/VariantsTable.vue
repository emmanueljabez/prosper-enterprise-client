<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Variants</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredVariants.length }} variants found
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            @click="$emit('refresh')" 
            :disabled="loading"
          >
            <RefreshCw v-if="!loading" class="h-4 w-4 mr-2" />
            <Loader2 v-else class="h-4 w-4 mr-2 animate-spin" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            @click="resetFilters"
          >
            <X class="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            @click="$emit('bulk-edit', selectedVariants)" 
            :disabled="selectedVariants.length === 0"
          >
            <Edit class="h-4 w-4 mr-2" />
            Bulk Edit
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="space-y-2">
          <Label for="search">Search</Label>
          <Input
            id="search"
            v-model="search"
            placeholder="Search by SKU, product, or attributes..."
          />
        </div>
        <div class="space-y-2">
          <Label for="stockFilter">Inventory</Label>
          <Select v-model="stockFilter">
            <SelectTrigger id="stockFilter">
              <SelectValue placeholder="Filter by inventory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock Levels</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="statusFilter">Status</Label>
          <Select v-model="statusFilter">
            <SelectTrigger id="statusFilter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="enabled">Enabled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="sortBy">Sort By</Label>
          <Select v-model="sortBy">
            <SelectTrigger id="sortBy">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sku">SKU</SelectItem>
              <SelectItem value="product">Product Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Main Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[50px]">
              <Checkbox 
                :checked="isAllSelected" 
                @update:checked="toggleSelectAll"
                :indeterminate="selectedVariants.length > 0 && !isAllSelected"
              />
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="updateSort('product')"
              >
                Product 
                <ArrowUp
                  v-if="sortBy === 'product' && sortDirection === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDown
                  v-if="sortBy === 'product' && sortDirection === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="updateSort('sku')"
              >
                SKU 
                <ArrowUp
                  v-if="sortBy === 'sku' && sortDirection === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDown
                  v-if="sortBy === 'sku' && sortDirection === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Attributes</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="updateSort('price')"
              >
                Price 
                <ArrowUp
                  v-if="sortBy === 'price' && sortDirection === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDown
                  v-if="sortBy === 'price' && sortDirection === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="updateSort('stock')"
              >
                Stock 
                <ArrowUp
                  v-if="sortBy === 'stock' && sortDirection === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDown
                  v-if="sortBy === 'stock' && sortDirection === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody v-if="loading">
          <TableRow v-for="i in 5" :key="i" class="h-16">
            <TableCell v-for="j in 8" :key="j">
              <Skeleton class="h-4 w-full" />
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody v-else-if="filteredVariants.length === 0">
          <TableRow class="h-24">
            <TableCell colSpan="8" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <PackageX class="h-10 w-10 text-muted-foreground mb-2" />
                <div class="text-lg font-medium">No variants found</div>
                <div class="text-sm text-muted-foreground mt-1">
                  {{ search ? 'Try adjusting your search or filters' : 'Get started by creating a variant' }}
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody v-else>
          <TableRow 
            v-for="variant in paginatedVariants" 
            :key="variant.id"
            :class="{ 'opacity-60': !variant.isEnabled }"
          >
            <TableCell>
              <Checkbox 
                :checked="isSelected(variant)"
                @update:checked="toggleSelect(variant)"
              />
            </TableCell>
            <TableCell>
              <div class="flex flex-col">
                <span class="font-medium">{{ variant.productName }}</span>
                <span class="text-xs text-muted-foreground">ID: {{ variant.productId }}</span>
              </div>
            </TableCell>
            <TableCell>
              <div class="font-mono text-sm">{{ variant.sku }}</div>
            </TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-1">
                <Badge 
                  v-for="(value, key) in variant.attributeValues" 
                  :key="key"
                  variant="outline"
                  class="whitespace-nowrap"
                >
                  {{ formatAttributeName(key) }}: {{ formatAttributeValue(key, value) }}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <div class="font-medium">{{ formatPrice(variant.price) }}</div>
              <div v-if="variant.priceAdjustment" class="text-xs text-muted-foreground">
                {{ variant.priceAdjustment > 0 ? '+' : '' }}{{ variant.priceAdjustment }}%
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                :variant="getStockVariant(variant.stock)" 
                class="whitespace-nowrap"
              >
                {{ variant.stock }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge 
                :variant="variant.isEnabled ? 'success' : 'secondary'"
              >
                {{ variant.isEnabled ? 'Active' : 'Disabled' }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="$emit('view-variant', variant)">
                    <Eye class="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-variant', variant)">
                    <Edit class="h-4 w-4 mr-2" />
                    Edit Variant
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('update-stock', variant)">
                    <Package class="h-4 w-4 mr-2" />
                    Update Stock
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    @click="$emit('delete-variant', variant)"
                    class="text-destructive focus:text-destructive"
                  >
                    <Trash class="h-4 w-4 mr-2" />
                    Delete Variant
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
        Showing {{ itemsPerPage * (currentPage - 1) + 1 }} to
        {{ Math.min(itemsPerPage * currentPage, filteredVariants.length) }}
        of {{ filteredVariants.length }} variants
      </div>
      <div class="flex items-center space-x-2">
        <div class="flex items-center space-x-2">
          <p class="text-sm font-medium">Rows per page</p>
          <Select
            v-model="itemsPerPage"
            @update:modelValue="currentPage = 1"
          >
            <SelectTrigger class="h-8 w-[70px]">
              <SelectValue :placeholder="itemsPerPage" />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem :value="10">10</SelectItem>
              <SelectItem :value="20">20</SelectItem>
              <SelectItem :value="50">50</SelectItem>
              <SelectItem :value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <ChevronLeft class="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
        >
          Next
          <ChevronRight class="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Filter, RefreshCw, Edit, ChevronDown, Trash, Eye, Package, PackageX,
  MoreHorizontal, ChevronLeft, ChevronRight, X, Loader2, ArrowUp, ArrowDown
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps({
  variants: {
    type: Array,
    required: true
  },
  products: {
    type: Array,
    default: () => []
  },
  attributes: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'view-variant', 
  'edit-variant', 
  'delete-variant', 
  'update-stock', 
  'refresh',
  'bulk-edit'
])

// Local state
const search = ref('')
const sortBy = ref('sku')
const sortDirection = ref('asc')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const selectedVariants = ref([])
const stockFilter = ref('all')
const statusFilter = ref('all')

// Convert old filters to new filter system
const filters = computed(() => ({
  showInStock: stockFilter.value === 'all' || stockFilter.value === 'in_stock',
  showOutOfStock: stockFilter.value === 'all' || stockFilter.value === 'out_of_stock',
  showDisabled: statusFilter.value === 'all' || statusFilter.value === 'disabled'
}))

// Reset page when search or filters change
watch([search, stockFilter, statusFilter, sortBy], () => {
  currentPage.value = 1
})

// Reset selection when variants change
watch(() => props.variants, () => {
  selectedVariants.value = []
})

// Computed properties
const filteredVariants = computed(() => {
  let result = [...props.variants]
  
  // Apply search
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    result = result.filter(variant => 
      variant.sku?.toLowerCase().includes(searchLower) ||
      variant.productName?.toLowerCase().includes(searchLower) ||
      Object.entries(variant.attributeValues || {}).some(([key, value]) => {
        const attrName = formatAttributeName(key).toLowerCase()
        const attrValue = String(value).toLowerCase()
        return attrName.includes(searchLower) || attrValue.includes(searchLower)
      })
    )
  }
  
  // Apply stock filter
  if (stockFilter.value === 'in_stock') {
    result = result.filter(variant => variant.stock > 0)
  } else if (stockFilter.value === 'out_of_stock') {
    result = result.filter(variant => variant.stock <= 0)
  } else if (stockFilter.value === 'low_stock') {
    result = result.filter(variant => variant.stock > 0 && variant.stock <= 10)
  }
  
  // Apply status filter
  if (statusFilter.value === 'enabled') {
    result = result.filter(variant => variant.isEnabled !== false)
  } else if (statusFilter.value === 'disabled') {
    result = result.filter(variant => variant.isEnabled === false)
  }
  
  // Apply sorting
  result.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy.value) {
      case 'sku':
        comparison = (a.sku || '').localeCompare(b.sku || '')
        break
      case 'product':
        comparison = (a.productName || '').localeCompare(b.productName || '')
        break
      case 'price':
        comparison = (a.price || 0) - (b.price || 0)
        break
      case 'stock':
        comparison = (a.stock || 0) - (b.stock || 0)
        break
      default:
        comparison = 0
        break
    }
    
    return sortDirection.value === 'desc' ? -comparison : comparison
  })
  
  return result
})

const paginatedVariants = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredVariants.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredVariants.value.length / itemsPerPage.value))
})

const isAllSelected = computed(() => {
  return paginatedVariants.value.length > 0 && 
         paginatedVariants.value.every(variant => isSelected(variant))
})

// Methods
const formatAttributeName = (attributeId) => {
  const attribute = props.attributes.find(attr => attr.id === attributeId)
  return attribute ? attribute.name : attributeId
}

const formatAttributeValue = (attributeId, value) => {
  const attribute = props.attributes.find(attr => attr.id === attributeId)
  
  if (!attribute) return value
  
  if (attribute.type === 'select' || attribute.type === 'multiselect') {
    const option = attribute.options?.find(opt => opt.id === value || opt.value === value)
    return option ? option.label : value
  }
  
  if (attribute.type === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  
  return value
}

const formatPrice = (price) => {
  if (price === undefined || price === null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

const getStockVariant = (stock) => {
  if (stock === undefined || stock === null) return 'outline'
  if (stock <= 0) return 'destructive'
  if (stock < 10) return 'warning'
  return 'success'
}

const isSelected = (variant) => {
  return selectedVariants.value.some(v => v.id === variant.id)
}

const toggleSelect = (variant) => {
  if (isSelected(variant)) {
    selectedVariants.value = selectedVariants.value.filter(v => v.id !== variant.id)
  } else {
    selectedVariants.value.push(variant)
  }
}

const toggleSelectAll = (checked) => {
  if (checked) {
    // Select all visible variants on current page
    selectedVariants.value = [
      ...selectedVariants.value.filter(v => 
        !paginatedVariants.value.some(pv => pv.id === v.id)
      ),
      ...paginatedVariants.value
    ]
  } else {
    // Deselect all visible variants on current page
    const pageVariantIds = paginatedVariants.value.map(v => v.id)
    selectedVariants.value = selectedVariants.value.filter(v => 
      !pageVariantIds.includes(v.id)
    )
  }
}

const updateSort = (column) => {
  if (sortBy.value === column) {
    // Toggle direction if same column
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Set new column and default to ascending
    sortBy.value = column
    sortDirection.value = 'asc'
  }
}

const resetFilters = () => {
  search.value = ''
  stockFilter.value = 'all'
  statusFilter.value = 'all'
  sortBy.value = 'sku'
  sortDirection.value = 'asc'
}
</script>