<template>
  <div class="space-y-4">
    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <Input
          v-model="searchTerm"
          placeholder="Search items by code, name, or description..."
          class="max-w-sm"
          @input="handleSearchChange"
        />
      </div>
      <div class="flex gap-2">
        <Select v-model="categoryFilter" @update:model-value="handleCategoryFilterChange">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Categories</SelectItem>
            <SelectItem v-for="category in categories" :key="category.id" :value="category.id.toString()">
              {{ category.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="statusFilter" @update:model-value="handleStatusFilterChange">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" @click="clearFilters">
          <X class="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button variant="outline" size="sm" @click="$emit('refresh')">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-12">
              <Checkbox 
                :checked="isAllSelected" 
                @update:checked="toggleSelectAll"
              />
            </TableHead>
            <TableHead class="w-[100px]">Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead class="text-right">Stock</TableHead>
            <TableHead class="text-right">Unit Price</TableHead>
            <TableHead class="text-right">Value</TableHead>
            <TableHead>UOM</TableHead>
            <TableHead class="text-center">Status</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="10" class="h-24">
              <div class="space-y-3">
                <div class="flex items-center space-x-4">
                  <Skeleton class="h-4 w-4" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[200px]" />
                  <Skeleton class="h-4 w-[120px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[80px]" />
                </div>
                <div class="flex items-center space-x-4">
                  <Skeleton class="h-4 w-4" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[200px]" />
                  <Skeleton class="h-4 w-[120px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[80px]" />
                </div>
                <div class="flex items-center space-x-4">
                  <Skeleton class="h-4 w-4" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[200px]" />
                  <Skeleton class="h-4 w-[120px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[80px]" />
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="items.length === 0">
            <TableCell colspan="10" class="h-24 text-center text-muted-foreground">
              No inventory items found.
            </TableCell>
          </TableRow>
          <TableRow 
            v-else
            v-for="item in items" 
            :key="item.id"
            class="hover:bg-muted/50"
          >
            <TableCell>
              <Checkbox 
                :checked="selectedItems.includes(item.id)"
                @update:checked="toggleItemSelection(item.id)"
              />
            </TableCell>
            <TableCell class="font-medium">
              <div class="flex items-center space-x-2">
                <span>{{ item.itemCode }}</span>
                <Badge v-if="item.barcode" variant="outline" class="text-xs">
                  {{ item.barcode }}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex items-center space-x-3">
                <Avatar class="h-8 w-8">
                  <AvatarImage v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
                  <AvatarFallback>
                    <PackageIcon class="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div class="font-medium">{{ item.name }}</div>
                  <div v-if="item.description" class="text-sm text-muted-foreground truncate max-w-[200px]">
                    {{ item.description }}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{{ getCategoryName(item.categoryId) }}</Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex flex-col items-end">
                <span class="font-medium">{{ formatNumber(getTotalStock(item)) }}</span>
                <span v-if="hasMultipleLocations(item)" class="text-xs text-blue-600 cursor-help" 
                      :title="`Stock across ${item.inventoryStocks.length} locations`">
                  {{ item.inventoryStocks.length }} locations
                </span>
                <span v-if="isLowStock(item)" class="text-xs text-orange-600">
                  Low Stock
                </span>
                <span v-else-if="isOutOfStock(item)" class="text-xs text-red-600">
                  Out of Stock
                </span>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <span class="font-medium">{{ formatCurrency(item.standardCost || item.averageCost || 0) }}</span>
            </TableCell>
            <TableCell class="text-right">
              <span class="font-medium">{{ formatCurrency(getItemValue(item)) }}</span>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{{ getUnitName(item.baseUnitOfMeasureId || item.unitOfMeasureId) }}</Badge>
            </TableCell>
            <TableCell class="text-center">
              <Badge :variant="item.isActive ? 'default' : 'secondary'">
                {{ item.isActive ? 'Active' : 'Inactive' }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="$emit('view-item', item)">
                    <Eye class="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-item', item)">
                    <Pencil class="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('adjust-stock', item)">
                    <Package class="mr-2 h-4 w-4" />
                    Adjust Stock
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('view-stock-history', item)">
                    <History class="mr-2 h-4 w-4" />
                    Stock History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('duplicate-item', item)">
                    <Copy class="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    v-if="item.isActive"
                    @click="$emit('deactivate-item', item)"
                  >
                    <Power class="mr-2 h-4 w-4" />
                    Deactivate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    v-else
                    @click="$emit('activate-item', item)"
                  >
                    <Power class="mr-2 h-4 w-4" />
                    Activate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    @click="$emit('delete-item', item)"
                    class="text-red-600"
                  >
                    <Trash class="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedItems.length > 0" class="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
      <span class="text-sm text-muted-foreground">
        {{ selectedItems.length }} item(s) selected
      </span>
      <div class="flex space-x-2">
        <Button size="sm" variant="outline" @click="$emit('bulk-edit', getSelectedItems())">
          <Edit class="mr-2 h-4 w-4" />
          Bulk Edit
        </Button>
        <Button size="sm" variant="outline" @click="bulkDeactivate">
          <Power class="mr-2 h-4 w-4" />
          Bulk Deactivate
        </Button>
        <Button size="sm" variant="destructive" @click="bulkDelete">
          <Trash class="mr-2 h-4 w-4" />
          Bulk Delete
        </Button>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        {{ selectedItems.length }} of {{ props.pagination.totalElements }} selected
      </div>
      
      <div class="flex items-center space-x-2">
        <span class="text-sm text-muted-foreground">
          Showing {{ Math.min((props.pagination.page) * props.pagination.size + 1, props.pagination.totalElements) }} to 
          {{ Math.min((props.pagination.page + 1) * props.pagination.size, props.pagination.totalElements) }} of 
          {{ props.pagination.totalElements }} results
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="props.pagination.page <= 0"
          @click="handlePageChange(props.pagination.page)"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="props.pagination.page >= totalPages - 1"
          @click="handlePageChange(props.pagination.page + 2)"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { 
  Eye, Pencil, Trash, MoreHorizontal, Package, History, Copy, Power, 
  Edit, X, Loader2, PackageIcon, RefreshCw
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
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

// Props
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  units: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    default: () => ({
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'view-item',
  'edit-item',
  'duplicate-item',
  'delete-item',
  'activate-item',
  'deactivate-item',
  'adjust-stock',
  'view-stock-history',
  'refresh',
  'bulk-edit',
  'search',
  'filter-change',
  'sort-change',
  'page-change',
  'size-change'
])

// State
const selectedItems = ref([])
const searchTerm = ref('')
const categoryFilter = ref('_all')
const statusFilter = ref('_all')
const searchTimeout = ref(null)

// Computed
const totalPages = computed(() => {
  return Math.ceil(props.pagination.totalElements / props.pagination.size)
})

const isAllSelected = computed(() => {
  return props.items.length > 0 && selectedItems.value.length === props.items.length
})

// Methods
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value = []
  } else {
    selectedItems.value = props.items.map(item => item.id)
  }
}

const toggleItemSelection = (itemId) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
}

const getSelectedItems = () => {
  return props.items.filter(item => selectedItems.value.includes(item.id))
}

// Filter and search handlers
const handleSearchChange = () => {
  // Debounce search to avoid too many API calls
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    emit('search', searchTerm.value)
  }, 500)
}

const handleCategoryFilterChange = (value) => {
  const categoryId = value === '_all' ? null : parseInt(value)
  emit('filter-change', { categoryId })
}

const handleStatusFilterChange = (value) => {
  const isActive = value === '_all' ? null : value === 'true'
  emit('filter-change', { isActive })
}

const handlePageSizeChange = (newSize) => {
  emit('size-change', parseInt(newSize))
}

const handlePageChange = (newPage) => {
  emit('page-change', newPage)
}

const clearFilters = () => {
  searchTerm.value = ''
  categoryFilter.value = '_all'
  statusFilter.value = '_all'
  
  // Emit clear filters
  emit('search', '')
  emit('filter-change', { categoryId: null, isActive: null })
}

const bulkDeactivate = () => {
  // Implement bulk deactivate
  console.log('Bulk deactivate:', selectedItems.value)
}

const bulkDelete = () => {
  // Implement bulk delete
  console.log('Bulk delete:', selectedItems.value)
}

const getTotalStock = (item) => {
  if (item.inventoryStocks && Array.isArray(item.inventoryStocks)) {
    return item.inventoryStocks.reduce((total, stock) => {
      return total + (stock.quantityAvailable || 0)
    }, 0)
  }
  return item.stockOnHand || item.currentStock || 0
}

const getStockByLocation = (item) => {
  if (item.inventoryStocks && Array.isArray(item.inventoryStocks)) {
    return item.inventoryStocks.map(stock => ({
      locationName: stock.location?.name || 'Unknown',
      locationCode: stock.location?.code || '',
      quantity: stock.quantityAvailable || 0,
      reserved: stock.quantityReserved || 0,
      allocated: stock.quantityAllocated || 0
    }))
  }
  return []
}

const hasMultipleLocations = (item) => {
  return item.inventoryStocks && Array.isArray(item.inventoryStocks) && item.inventoryStocks.length > 1
}

const isLowStock = (item) => {
  const stock = getTotalStock(item)
  const reorderPoint = item.reorderPoint || item.reorderLevel || 0
  const minStock = item.minStockLevel || item.minimumStock || 0
  return stock <= Math.max(reorderPoint, minStock) && stock > 0
}

const isOutOfStock = (item) => {
  return getTotalStock(item) === 0
}

const getItemValue = (item) => {
  const cost = item.standardCost || item.averageCost || item.lastCost || 0
  const quantity = getTotalStock(item)
  return cost * quantity
}

const formatNumber = (value) => {
  return new Intl.NumberFormat().format(value)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES'
  }).format(value)
}

const getCategoryName = (categoryId) => {
  if (!categoryId) return 'Uncategorized'
  const category = props.categories.find(cat => cat.id === categoryId)
  return category?.name || 'Uncategorized'
}

const getUnitName = (unitId) => {
  if (!unitId) return 'N/A'
  const unit = props.units.find(u => u.id === unitId)
  return unit?.name || unit?.code || 'N/A'
}

</script>
