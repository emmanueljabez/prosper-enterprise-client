<template>
  <DialogContent class="sm:max-w-[1000px]">
    <DialogHeader>
      <DialogTitle>Items Requiring Reorder</DialogTitle>
      <DialogDescription>
        Items that are below their reorder points and need to be restocked through purchase orders.
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-4">
      <!-- Search and Filters -->
      <div class="flex items-center space-x-2">
        <div class="relative flex-1">
          <SearchIcon class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search reorder items..."
            class="pl-8"
          />
        </div>
        <Select v-model="selectedCategory">
          <SelectTrigger class="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Categories</SelectItem>
            <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="priorityFilter">
          <SelectTrigger class="w-[150px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Items Table -->
      <div class="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-12">
                <Checkbox
                  :checked="selectedItems.length === filteredItems.length && filteredItems.length > 0"
                  @update:checked="toggleSelectAll"
                />
              </TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Reorder Point</TableHead>
              <TableHead>Suggested Qty</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Estimated Cost</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading">
              <TableCell colspan="10" class="text-center py-8">
                <RefreshCwIcon class="h-4 w-4 animate-spin mx-auto mb-2" />
                Loading reorder items...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="filteredItems.length === 0">
              <TableCell colspan="10" class="text-center py-8 text-muted-foreground">
                No items requiring reorder found
              </TableCell>
            </TableRow>
            <TableRow v-for="item in filteredItems" :key="item.id">
              <TableCell>
                <Checkbox
                  :checked="selectedItems.includes(item.id)"
                  @update:checked="toggleItemSelection(item.id)"
                />
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-2">
                  <PackageIcon class="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div class="font-medium">{{ item.name }}</div>
                    <div class="text-sm text-muted-foreground">{{ item.itemCode }}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{{ item.category?.name || 'Uncategorized' }}</Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-1">
                  <span :class="{ 'text-red-600': item.currentStock <= item.reorderPoint }">
                    {{ item.currentStock }}
                  </span>
                  <span class="text-muted-foreground">{{ item.uom?.symbol }}</span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-1">
                  <span>{{ item.reorderPoint }}</span>
                  <span class="text-muted-foreground">{{ item.uom?.symbol }}</span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-1">
                  <span class="font-medium">{{ calculateSuggestedQuantity(item) }}</span>
                  <span class="text-muted-foreground">{{ item.uom?.symbol }}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  :variant="getPriorityVariant(item.priority)"
                  class="capitalize"
                >
                  {{ item.priority || 'medium' }}
                </Badge>
              </TableCell>
              <TableCell>
                <div v-if="item.supplier" class="text-sm">
                  <div class="font-medium">{{ item.supplier.name }}</div>
                  <div class="text-muted-foreground">{{ item.supplier.code }}</div>
                </div>
                <span v-else class="text-muted-foreground">No supplier</span>
              </TableCell>
              <TableCell>
                <div class="text-sm">
                  <div class="font-medium">${{ calculateEstimatedCost(item).toFixed(2) }}</div>
                  <div class="text-muted-foreground">{{ calculateSuggestedQuantity(item) }} units</div>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    @click="createQuickPO(item)"
                  >
                    <ShoppingCartIcon class="h-3 w-3 mr-1" />
                    Quick PO
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    @click="$emit('view-suppliers', item)"
                  >
                    <UsersIcon class="h-3 w-3 mr-1" />
                    Suppliers
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600">{{ highPriorityCount }}</div>
          <div class="text-sm text-muted-foreground">High Priority</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">{{ mediumPriorityCount }}</div>
          <div class="text-sm text-muted-foreground">Medium Priority</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ lowPriorityCount }}</div>
          <div class="text-sm text-muted-foreground">Low Priority</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">${{ totalEstimatedCost.toLocaleString() }}</div>
          <div class="text-sm text-muted-foreground">Total Est. Cost</div>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedItems.length > 0" class="flex items-center justify-between p-4 bg-muted rounded-lg">
        <span class="text-sm font-medium">
          {{ selectedItems.length }} item{{ selectedItems.length > 1 ? 's' : '' }} selected
        </span>
        <div class="flex items-center space-x-2">
          <Button
            size="sm"
            @click="handleBulkCreatePO"
          >
            <ShoppingCartIcon class="h-3 w-3 mr-1" />
            Create Combined PO
          </Button>
          <Button
            size="sm"
            variant="outline"
            @click="handleBulkCreateSeparatePOs"
          >
            <PlusIcon class="h-3 w-3 mr-1" />
            Create Separate POs
          </Button>
          <Button
            size="sm"
            variant="outline"
            @click="exportSelectedItems"
          >
            <DownloadIcon class="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">
        Close
      </Button>
      <Button @click="handleCreateMasterPO" :disabled="filteredItems.length === 0">
        <PlusIcon class="h-3 w-3 mr-1" />
        Create Master PO
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  SearchIcon, PackageIcon, RefreshCwIcon, ShoppingCartIcon,
  UsersIcon, DownloadIcon, PlusIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'create-purchase-order', 'view-suppliers'])

// Local state
const searchQuery = ref('')
const selectedCategory = ref('')
const priorityFilter = ref('')
const selectedItems = ref([])

// Mock categories
const categories = ref([
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Hardware' },
  { id: '3', name: 'Software' },
  { id: '4', name: 'Accessories' }
])

// Computed properties
const filteredItems = computed(() => {
  let filtered = props.items

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.itemCode.toLowerCase().includes(query) ||
      (item.supplier?.name && item.supplier.name.toLowerCase().includes(query))
    )
  }

  if (selectedCategory.value && selectedCategory.value !== '_all') {
    filtered = filtered.filter(item => item.category?.id === selectedCategory.value)
  }

  if (priorityFilter.value && priorityFilter.value !== '_all') {
    filtered = filtered.filter(item => (item.priority || 'medium') === priorityFilter.value)
  }

  return filtered
})

const highPriorityCount = computed(() => {
  return props.items.filter(item => (item.priority || 'medium') === 'high').length
})

const mediumPriorityCount = computed(() => {
  return props.items.filter(item => (item.priority || 'medium') === 'medium').length
})

const lowPriorityCount = computed(() => {
  return props.items.filter(item => (item.priority || 'medium') === 'low').length
})

const totalEstimatedCost = computed(() => {
  return props.items.reduce((total, item) => {
    return total + calculateEstimatedCost(item)
  }, 0)
})

// Methods
const calculateSuggestedQuantity = (item) => {
  // Calculate suggested order quantity based on economic order quantity (EOQ) or minimum order
  const shortage = (item.reorderPoint || 0) - item.currentStock
  const minOrder = item.minimumOrderQuantity || 1
  const maxStock = item.maximumStock || (item.reorderPoint || 0) * 2
  
  // Order enough to reach max stock level or minimum order quantity, whichever is higher
  const suggestedQty = Math.max(maxStock - item.currentStock, minOrder)
  return Math.max(suggestedQty, shortage)
}

const calculateEstimatedCost = (item) => {
  const quantity = calculateSuggestedQuantity(item)
  const unitCost = item.unitCost || item.unitPrice || 0
  return quantity * unitCost
}

const getPriorityVariant = (priority) => {
  switch (priority) {
    case 'high':
      return 'destructive'
    case 'medium':
      return 'outline'
    case 'low':
      return 'secondary'
    default:
      return 'outline'
  }
}

const toggleSelectAll = (checked) => {
  if (checked) {
    selectedItems.value = filteredItems.value.map(item => item.id)
  } else {
    selectedItems.value = []
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

const createQuickPO = (item) => {
  const poData = {
    type: 'quick',
    items: [{
      ...item,
      quantity: calculateSuggestedQuantity(item),
      estimatedCost: calculateEstimatedCost(item)
    }]
  }
  emit('create-purchase-order', poData)
}

const handleBulkCreatePO = () => {
  const itemsToOrder = filteredItems.value.filter(item => 
    selectedItems.value.includes(item.id)
  ).map(item => ({
    ...item,
    quantity: calculateSuggestedQuantity(item),
    estimatedCost: calculateEstimatedCost(item)
  }))
  
  const poData = {
    type: 'combined',
    items: itemsToOrder
  }
  emit('create-purchase-order', poData)
}

const handleBulkCreateSeparatePOs = () => {
  const itemsToOrder = filteredItems.value.filter(item => 
    selectedItems.value.includes(item.id)
  )
  
  itemsToOrder.forEach(item => {
    const poData = {
      type: 'separate',
      items: [{
        ...item,
        quantity: calculateSuggestedQuantity(item),
        estimatedCost: calculateEstimatedCost(item)
      }]
    }
    emit('create-purchase-order', poData)
  })
}

const handleCreateMasterPO = () => {
  const allItems = filteredItems.value.map(item => ({
    ...item,
    quantity: calculateSuggestedQuantity(item),
    estimatedCost: calculateEstimatedCost(item)
  }))
  
  const poData = {
    type: 'master',
    items: allItems
  }
  emit('create-purchase-order', poData)
  emit('close')
}

const exportSelectedItems = () => {
  const itemsToExport = filteredItems.value.filter(item => 
    selectedItems.value.includes(item.id)
  )
  
  // Create CSV content
  const headers = [
    'Item Code', 'Name', 'Category', 'Current Stock', 'Reorder Point', 
    'Suggested Qty', 'Priority', 'Supplier', 'Estimated Cost'
  ]
  const csvContent = [
    headers.join(','),
    ...itemsToExport.map(item => [
      item.itemCode,
      item.name,
      item.category?.name || '',
      item.currentStock,
      item.reorderPoint || 0,
      calculateSuggestedQuantity(item),
      item.priority || 'medium',
      item.supplier?.name || '',
      calculateEstimatedCost(item).toFixed(2)
    ].join(','))
  ].join('\n')
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `reorder-items-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Watch for prop changes
watch(() => props.items, () => {
  selectedItems.value = []
})
</script>
