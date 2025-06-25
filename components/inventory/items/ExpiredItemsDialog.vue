<template>
  <DialogContent class="sm:max-w-[800px]">
    <DialogHeader>
      <DialogTitle>Expired Items</DialogTitle>
      <DialogDescription>
        Items that have passed their expiration date and require attention.
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-4">
      <!-- Filters -->
      <div class="flex items-center space-x-2">
        <div class="relative flex-1">
          <SearchIcon class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search expired items..."
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
        <Select v-model="expiryFilter">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="All Items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Items</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
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
              <TableHead>Batch/Lot</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Days Overdue</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading">
              <TableCell colspan="8" class="text-center py-8">
                <RefreshCwIcon class="h-4 w-4 animate-spin mx-auto mb-2" />
                Loading expired items...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="filteredItems.length === 0">
              <TableCell colspan="8" class="text-center py-8 text-muted-foreground">
                No expired items found
              </TableCell>
            </TableRow>
            <TableRow v-for="item in filteredItems" :key="`${item.id}-${item.batchNumber}`">
              <TableCell>
                <Checkbox
                  :checked="selectedItems.includes(`${item.id}-${item.batchNumber}`)"
                  @update:checked="toggleItemSelection(`${item.id}-${item.batchNumber}`)"
                />
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-2">
                  <AlertTriangleIcon 
                    class="h-4 w-4"
                    :class="getExpiryStatusColor(item.expiryDate)"
                  />
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
                <div class="font-mono text-sm">{{ item.batchNumber || 'N/A' }}</div>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-2">
                  <span>{{ formatDate(item.expiryDate) }}</span>
                  <Badge 
                    :variant="getExpiryBadgeVariant(item.expiryDate)"
                    class="text-xs"
                  >
                    {{ getExpiryStatus(item.expiryDate) }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <span 
                  :class="getDaysOverdueColor(item.expiryDate)"
                  class="font-medium"
                >
                  {{ getDaysOverdue(item.expiryDate) }}
                </span>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-1">
                  <span>{{ item.currentStock }}</span>
                  <span class="text-muted-foreground">{{ item.uom?.symbol }}</span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    @click="$emit('mark-disposed', item)"
                  >
                    <TrashIcon class="h-3 w-3 mr-1" />
                    Dispose
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    @click="$emit('request-return', item)"
                  >
                    <UndoIcon class="h-3 w-3 mr-1" />
                    Return
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600">{{ expiredCount }}</div>
          <div class="text-sm text-muted-foreground">Expired Items</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">{{ expiringSoonCount }}</div>
          <div class="text-sm text-muted-foreground">Expiring Soon</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">${{ totalValue.toLocaleString() }}</div>
          <div class="text-sm text-muted-foreground">Total Value at Risk</div>
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
            variant="destructive"
            @click="handleBulkDispose"
          >
            <TrashIcon class="h-3 w-3 mr-1" />
            Bulk Dispose
          </Button>
          <Button
            size="sm"
            variant="outline"
            @click="handleBulkReturn"
          >
            <UndoIcon class="h-3 w-3 mr-1" />
            Bulk Return
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
      <Button @click="handleGenerateReport">
        <FileTextIcon class="h-3 w-3 mr-1" />
        Generate Report
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  SearchIcon, AlertTriangleIcon, RefreshCwIcon, TrashIcon,
  UndoIcon, DownloadIcon, FileTextIcon
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

const emit = defineEmits(['close', 'mark-disposed', 'request-return'])

// Local state
const searchQuery = ref('')
const selectedCategory = ref('')
const expiryFilter = ref('')
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
      (item.batchNumber && item.batchNumber.toLowerCase().includes(query))
    )
  }

  if (selectedCategory.value && selectedCategory.value !== '_all') {
    filtered = filtered.filter(item => item.category?.id === selectedCategory.value)
  }

  if (expiryFilter.value && expiryFilter.value !== '_all') {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    filtered = filtered.filter(item => {
      const expiryDate = new Date(item.expiryDate)
      
      if (expiryFilter.value === 'expired') {
        return expiryDate < now
      } else if (expiryFilter.value === 'expiring-soon') {
        return expiryDate >= now && expiryDate <= thirtyDaysFromNow
      }
      
      return true
    })
  }

  return filtered
})

const expiredCount = computed(() => {
  const now = new Date()
  return props.items.filter(item => new Date(item.expiryDate) < now).length
})

const expiringSoonCount = computed(() => {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  return props.items.filter(item => {
    const expiryDate = new Date(item.expiryDate)
    return expiryDate >= now && expiryDate <= thirtyDaysFromNow
  }).length
})

const totalValue = computed(() => {
  return props.items.reduce((total, item) => {
    return total + (item.currentStock * (item.unitPrice || 0))
  }, 0)
})

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getExpiryStatus = (expiryDate) => {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  if (expiry < now) {
    return 'Expired'
  } else if (expiry <= thirtyDaysFromNow) {
    return 'Expiring Soon'
  }
  return 'Valid'
}

const getExpiryBadgeVariant = (expiryDate) => {
  const status = getExpiryStatus(expiryDate)
  switch (status) {
    case 'Expired':
      return 'destructive'
    case 'Expiring Soon':
      return 'outline'
    default:
      return 'secondary'
  }
}

const getExpiryStatusColor = (expiryDate) => {
  const status = getExpiryStatus(expiryDate)
  switch (status) {
    case 'Expired':
      return 'text-red-600'
    case 'Expiring Soon':
      return 'text-orange-600'
    default:
      return 'text-green-600'
  }
}

const getDaysOverdue = (expiryDate) => {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = now - expiry
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays > 0) {
    return `${diffDays} days`
  } else if (diffDays === 0) {
    return 'Today'
  } else {
    return `${Math.abs(diffDays)} days left`
  }
}

const getDaysOverdueColor = (expiryDate) => {
  const now = new Date()
  const expiry = new Date(expiryDate)
  
  if (expiry < now) {
    return 'text-red-600'
  } else if (expiry <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
    return 'text-orange-600'
  }
  return 'text-green-600'
}

const toggleSelectAll = (checked) => {
  if (checked) {
    selectedItems.value = filteredItems.value.map(item => `${item.id}-${item.batchNumber}`)
  } else {
    selectedItems.value = []
  }
}

const toggleItemSelection = (itemKey) => {
  const index = selectedItems.value.indexOf(itemKey)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemKey)
  }
}

const handleBulkDispose = () => {
  const itemsToDispose = filteredItems.value.filter(item => 
    selectedItems.value.includes(`${item.id}-${item.batchNumber}`)
  )
  itemsToDispose.forEach(item => emit('mark-disposed', item))
  selectedItems.value = []
}

const handleBulkReturn = () => {
  const itemsToReturn = filteredItems.value.filter(item => 
    selectedItems.value.includes(`${item.id}-${item.batchNumber}`)
  )
  itemsToReturn.forEach(item => emit('request-return', item))
  selectedItems.value = []
}

const handleGenerateReport = () => {
  // This would typically generate a detailed expiry report
  console.log('Generating expiry report for items:', filteredItems.value)
  emit('close')
}

const exportSelectedItems = () => {
  const itemsToExport = filteredItems.value.filter(item => 
    selectedItems.value.includes(`${item.id}-${item.batchNumber}`)
  )
  
  // Create CSV content
  const headers = ['Item Code', 'Name', 'Category', 'Batch/Lot', 'Expiry Date', 'Days Overdue', 'Current Stock', 'Value']
  const csvContent = [
    headers.join(','),
    ...itemsToExport.map(item => [
      item.itemCode,
      item.name,
      item.category?.name || '',
      item.batchNumber || '',
      formatDate(item.expiryDate),
      getDaysOverdue(item.expiryDate),
      item.currentStock,
      (item.currentStock * (item.unitPrice || 0)).toFixed(2)
    ].join(','))
  ].join('\n')
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `expired-items-${new Date().toISOString().split('T')[0]}.csv`
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
