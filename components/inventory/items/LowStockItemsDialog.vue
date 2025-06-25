<template>
  <DialogContent class="sm:max-w-[1000px]">
    <DialogHeader>
      <DialogTitle>Low Stock Items</DialogTitle>
      <DialogDescription>
        Items that have fallen below their minimum stock levels and require restocking.
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-4">
      <!-- Search and Filters -->
      <div class="flex items-center space-x-2">
        <div class="relative flex-1">
          <SearchIcon class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search low stock items..."
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
              <TableHead>Min Stock</TableHead>
              <TableHead>Shortage</TableHead>
              <TableHead>Suggested Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading">
              <TableCell colspan="8" class="text-center py-8">
                <RefreshCwIcon class="h-4 w-4 animate-spin mx-auto mb-2" />
                Loading low stock items...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="filteredItems.length === 0">
              <TableCell colspan="8" class="text-center py-8 text-muted-foreground">
                No low stock items found
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
                  <span :class="{ 'text-red-600': item.currentStock <= item.minimumStock }">
                    {{ item.currentStock }}
                  </span>
                  <span class="text-muted-foreground">{{ item.uom?.symbol }}</span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-1">
                  <span>{{ item.minimumStock }}</span>
                  <span class="text-muted-foreground">{{ item.uom?.symbol }}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="destructive">
                  -{{ item.minimumStock - item.currentStock }} {{ item.uom?.symbol }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-1">
                  <span class="font-medium">{{ calculateSuggestedOrder(item) }}</span>
                  <span class="text-muted-foreground">{{ item.uom?.symbol }}</span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    @click="$emit('reorder-item', item)"
                  >
                    <ShoppingCartIcon class="h-3 w-3 mr-1" />
                    Reorder
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedItems.length > 0" class="flex items-center justify-between p-4 bg-muted rounded-lg">
        <span class="text-sm font-medium">
          {{ selectedItems.length }} item{{ selectedItems.length > 1 ? 's' : '' }} selected
        </span>
        <div class="flex items-center space-x-2">
          <Button
            size="sm"
            @click="handleBulkReorder"
          >
            <ShoppingCartIcon class="h-3 w-3 mr-1" />
            Bulk Reorder
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
      <Button @click="handleCreatePurchaseOrder" :disabled="selectedItems.length === 0">
        <PlusIcon class="h-3 w-3 mr-1" />
        Create Purchase Order
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  SearchIcon, PackageIcon, RefreshCwIcon, ShoppingCartIcon,
  DownloadIcon, PlusIcon
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

const emit = defineEmits(['close', 'reorder-item'])

// Local state
const searchQuery = ref('')
const selectedCategory = ref('')
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
      item.itemCode.toLowerCase().includes(query)
    )
  }

  if (selectedCategory.value && selectedCategory.value !== '_all') {
    filtered = filtered.filter(item => item.category?.id === selectedCategory.value)
  }

  return filtered
})

// Methods
const calculateSuggestedOrder = (item) => {
  // Calculate suggested order quantity (minimum stock + safety buffer)
  const shortage = item.minimumStock - item.currentStock
  const safetyBuffer = Math.ceil(item.minimumStock * 0.2) // 20% safety buffer
  return shortage + safetyBuffer
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

const handleBulkReorder = () => {
  const itemsToReorder = filteredItems.value.filter(item => 
    selectedItems.value.includes(item.id)
  )
  itemsToReorder.forEach(item => emit('reorder-item', item))
}

const handleCreatePurchaseOrder = () => {
  const itemsToOrder = filteredItems.value.filter(item => 
    selectedItems.value.includes(item.id)
  )
  // This would typically navigate to purchase order creation
  console.log('Creating purchase order for items:', itemsToOrder)
  emit('close')
}

const exportSelectedItems = () => {
  const itemsToExport = filteredItems.value.filter(item => 
    selectedItems.value.includes(item.id)
  )
  
  // Create CSV content
  const headers = ['Item Code', 'Name', 'Category', 'Current Stock', 'Min Stock', 'Shortage', 'Suggested Order']
  const csvContent = [
    headers.join(','),
    ...itemsToExport.map(item => [
      item.itemCode,
      item.name,
      item.category?.name || '',
      item.currentStock,
      item.minimumStock,
      item.minimumStock - item.currentStock,
      calculateSuggestedOrder(item)
    ].join(','))
  ].join('\n')
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `low-stock-items-${new Date().toISOString().split('T')[0]}.csv`
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
