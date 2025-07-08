<template>
  <div class="space-y-6">
    <!-- Search and Filters -->
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
        <Select v-model="sortBy" @update:model-value="handleSortChange">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="itemName">Name</SelectItem>
            <SelectItem value="itemCode">Code</SelectItem>
            <SelectItem value="stockOnHand">Stock</SelectItem>
            <SelectItem value="standardCost">Cost</SelectItem>
            <SelectItem value="createdAt">Created</SelectItem>
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

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <Card v-for="n in 8" :key="n" class="group">
        <CardContent class="p-6">
          <!-- Item Image Skeleton -->
          <Skeleton class="aspect-square mb-4 rounded-lg" />

          <!-- Item Info Skeleton -->
          <div class="space-y-2">
            <div class="flex items-start justify-between">
              <div class="min-w-0 flex-1">
                <Skeleton class="h-4 w-[120px] mb-1" />
                <Skeleton class="h-3 w-[80px]" />
              </div>
              <Skeleton class="h-5 w-[60px]" />
            </div>

            <Skeleton class="h-3 w-full" />
            <Skeleton class="h-3 w-[80%]" />

            <!-- Category Skeleton -->
            <div class="flex items-center gap-2">
              <Skeleton class="h-5 w-[80px]" />
              <Skeleton class="h-5 w-[60px]" />
            </div>

            <!-- Stock Info Skeleton -->
            <div class="flex items-center justify-between pt-2 border-t">
              <div class="text-center">
                <Skeleton class="h-6 w-[40px] mb-1 mx-auto" />
                <Skeleton class="h-3 w-[35px] mx-auto" />
              </div>
              <div class="text-center">
                <Skeleton class="h-6 w-[60px] mb-1 mx-auto" />
                <Skeleton class="h-3 w-[55px] mx-auto" />
              </div>
              <div class="text-center">
                <Skeleton class="h-6 w-[60px] mb-1 mx-auto" />
                <Skeleton class="h-3 w-[65px] mx-auto" />
              </div>
            </div>

            <!-- Quick Actions Skeleton -->
            <div class="flex space-x-1 pt-2">
              <Skeleton class="h-8 flex-1" />
              <Skeleton class="h-8 flex-1" />
              <Skeleton class="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Items Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <Card 
        v-for="item in items" 
        :key="item.id"
        class="group hover:shadow-lg transition-shadow cursor-pointer"
        @click="$emit('view-item', item)"
      >
        <CardContent class="p-6">
          <!-- Item Image -->
          <div class="aspect-square mb-4 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              v-if="item.imageUrl" 
              :src="item.imageUrl" 
              :alt="item.name"
              class="w-full h-full object-cover"
            />
            <PackageIcon v-else class="h-16 w-16 text-muted-foreground" />
          </div>

          <!-- Item Info -->
          <div class="space-y-2">
            <div class="flex items-start justify-between">
              <div class="min-w-0 flex-1">
                <h3 class="font-semibold text-sm truncate">{{ item.name }}</h3>
                <p class="text-xs text-muted-foreground">{{ item.itemCode }}</p>
              </div>
              <Badge :variant="item.isActive ? 'default' : 'secondary'" class="text-xs">
                {{ item.isActive ? 'Active' : 'Inactive' }}
              </Badge>
            </div>

            <div v-if="item.description" class="text-xs text-muted-foreground line-clamp-2">
              {{ item.description }}
            </div>

            <!-- Category -->
            <div class="flex items-center gap-2">
              <Badge variant="outline" class="text-xs">
                {{ getCategoryName(item.categoryId) }}
              </Badge>
              <Badge v-if="getUnitName(item.baseUnitOfMeasureId)" variant="secondary" class="text-xs">
                {{ getUnitName(item.baseUnitOfMeasureId) }}
              </Badge>
            </div>

            <!-- Stock Info -->
            <div class="flex items-center justify-between pt-2 border-t">
              <div class="text-center">
                <div class="text-lg font-bold">{{ formatNumber(getTotalStock(item)) }}</div>
                <div class="text-xs text-muted-foreground">Stock</div>
                <div v-if="hasMultipleLocations(item)" class="text-xs text-blue-600">
                  {{ item.inventoryStocks.length }} locations
                </div>
                <div v-if="isLowStock(item)" class="text-xs text-orange-600 font-medium">
                  Low Stock
                </div>
                <div v-else-if="isOutOfStock(item)" class="text-xs text-red-600 font-medium">
                  Out of Stock
                </div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold">{{ formatCurrency(item.standardCost || item.averageCost || 0) }}</div>
                <div class="text-xs text-muted-foreground">Unit Price</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold">{{ formatCurrency(getItemValue(item)) }}</div>
                <div class="text-xs text-muted-foreground">Total Value</div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="flex space-x-1 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                class="flex-1 h-8"
                @click.stop="$emit('edit-item', item)"
              >
                <Pencil class="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                class="flex-1 h-8"
                @click.stop="$emit('adjust-stock', item)"
              >
                <Package class="h-3 w-3 mr-1" />
                Stock
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" class="h-8 w-8 p-0" @click.stop>
                    <MoreHorizontal class="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="$emit('view-item', item)">
                    <Eye class="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('duplicate-item', item)">
                    <Copy class="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Empty State -->
      <div v-if="items.length === 0 && !loading" class="col-span-full">
        <div class="text-center py-16">
          <PackageIcon class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-lg font-semibold mb-2">No items found</h3>
          <p class="text-muted-foreground mb-4">
            {{ searchTerm ? 'No items match your search criteria.' : 'Get started by adding your first inventory item.' }}
          </p>
          <Button @click="$emit('refresh')">
            <RefreshCw class="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    </div>

    <!-- Load More Button -->
    <div v-if="!loading && items.length > 0 && hasMoreItems" class="text-center">
      <Button variant="outline" @click="$emit('load-more')">
        Load More Items
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { 
  PackageIcon, Pencil, Package, MoreHorizontal, Eye, Copy, Power, 
  Trash, Loader2, RefreshCw, X
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
  'refresh',
  'search',
  'filter-change',
  'sort-change',
  'load-more'
])

// State
const searchTerm = ref('')
const categoryFilter = ref('_all')
const statusFilter = ref('_all')
const sortBy = ref('')
const searchTimeout = ref(null)

// Computed
const hasMoreItems = computed(() => {
  if (!props.pagination) return false
  return props.pagination.page < props.pagination.totalPages - 1
})

// Methods
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

const handleSortChange = (value) => {
  const [sortBy, sortDirection] = value.includes(':') ? value.split(':') : [value, 'ASC']
  emit('sort-change', { sortBy, sortDirection })
}

const clearFilters = () => {
  searchTerm.value = ''
  categoryFilter.value = '_all'
  statusFilter.value = '_all'
  sortBy.value = ''
  
  // Emit clear filters
  emit('search', '')
  emit('filter-change', { categoryId: null, isActive: null })
  emit('sort-change', { sortBy: null, sortDirection: 'ASC' })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
