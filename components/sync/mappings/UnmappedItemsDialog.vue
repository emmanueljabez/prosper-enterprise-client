<template>
  <DialogContent class="sm:max-w-4xl">
    <DialogHeader>
      <DialogTitle>Unmapped Inventory Items</DialogTitle>
      <DialogDescription>
        These inventory items do not have associated catalog products. Create mappings to enable synchronization.
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 space-y-4">
      <!-- Search and filter controls -->
      <div class="flex space-x-2">
        <div class="flex-1">
          <Input
            v-model="searchQuery"
            placeholder="Search items by name, SKU..."
          />
        </div>
        <Select v-model="filterBy">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="active">Active Items Only</SelectItem>
            <SelectItem value="low-stock">Low Stock Items</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock Items</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="sortBy">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="sku-asc">SKU (A-Z)</SelectItem>
            <SelectItem value="sku-desc">SKU (Z-A)</SelectItem>
            <SelectItem value="stock-asc">Stock (Low to High)</SelectItem>
            <SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Items table -->
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading" class="h-24">
              <TableCell colSpan="5" class="text-center">
                <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                <div class="mt-2 text-sm text-muted-foreground">Loading items...</div>
              </TableCell>
            </TableRow>
            <TableRow v-else-if="filteredItems.length === 0" class="h-24">
              <TableCell colSpan="5" class="text-center">
                <div class="flex flex-col items-center justify-center">
                  <BoxesIcon class="h-10 w-10 text-muted-foreground" />
                  <div class="mt-2">No unmapped items found</div>
                  <div class="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or filter settings
                  </div>
                </div>
              </TableCell>
            </TableRow>
            <TableRow 
              v-for="item in paginatedItems" 
              :key="item.id"
              :class="{ 
                'bg-muted/20': selectedItems.includes(item.id),
                'hover:bg-muted/40': selectedItems.includes(item.id)
              }"
            >
              <TableCell>
                <div class="flex items-start space-x-3">
                  <Checkbox
                    :checked="selectedItems.includes(item.id)"
                    @update:checked="toggleItemSelection(item.id)"
                    class="mt-0.5"
                  />
                  <div>
                    <div class="font-medium">{{ item.name }}</div>
                    <div class="text-xs text-muted-foreground truncate max-w-[300px]">
                      {{ item.description || 'No description available' }}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{{ item.sku }}</TableCell>
              <TableCell>
                <div class="flex flex-col">
                  <span>{{ item.stockOnHand }}</span>
                  <span class="text-xs text-muted-foreground">
                    {{ item.stockAvailable }} available
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(item.status)">
                  {{ formatStatus(item.status) }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  @click="openQuickMapDialog(item)"
                >
                  <LinkIcon class="h-4 w-4 mr-2" />
                  Map
                </Button>
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
          of {{ filteredItems.length }} items
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

      <!-- Bulk actions -->
      <div v-if="selectedItems.length > 0" class="pt-2">
        <div class="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="default"
            @click="openBulkMappingDialog"
          >
            <LinkIcon class="h-4 w-4 mr-2" />
            Map Selected Items ({{ selectedItems.length }})
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            @click="selectedItems = []"
          >
            <XIcon class="h-4 w-4 mr-2" />
            Clear Selection
          </Button>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="emit('close')">
        Close
      </Button>
    </DialogFooter>

    <!-- Quick Mapping Dialog -->
    <Dialog v-model:open="showQuickMapDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Map Item</DialogTitle>
          <DialogDescription>
            Select a product to map with "{{ itemToMap?.name || '' }}".
          </DialogDescription>
        </DialogHeader>

        <div class="py-4 space-y-4">
          <div class="space-y-2">
            <Label>Selected Item</Label>
            <div class="rounded-md border p-3 bg-muted/20">
              <div class="flex items-start space-x-3">
                <div class="h-10 w-10 rounded flex items-center justify-center bg-background border">
                  <PackageIcon class="h-5 w-5 text-muted-foreground" />
                </div>
                <div class="flex-1 space-y-1">
                  <p class="font-medium">{{ itemToMap?.name || 'No item selected' }}</p>
                  <div class="flex flex-wrap gap-2">
                    <Badge variant="outline">{{ itemToMap?.sku || 'N/A' }}</Badge>
                    <Badge variant="secondary">
                      Stock: {{ itemToMap?.stockOnHand || '0' }}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label>Select Product <span class="text-destructive">*</span></Label>
            <Combobox 
              v-model="selectedProductId"
              :options="products.map(product => ({ label: `${product.name} (${product.sku})`, value: product.id }))"
              :filter="true"
              :clearable="true"
              placeholder="Search and select a product..."
              :disabled="products.length === 0"
            />
            <p v-if="quickMapError" class="text-sm text-destructive">{{ quickMapError }}</p>
          </div>

          <div v-if="selectedProduct" class="rounded-md border p-3 bg-muted/20">
            <div class="flex items-start space-x-3">
              <div class="h-10 w-10 rounded overflow-hidden bg-background border">
                <img v-if="selectedProduct.imageUrl" :src="selectedProduct.imageUrl" class="h-full w-full object-cover" />
                <ShoppingBagIcon v-else class="h-5 w-5 m-2.5 text-muted-foreground" />
              </div>
              <div class="flex-1 space-y-1">
                <p class="font-medium">{{ selectedProduct.name }}</p>
                <div class="flex flex-wrap gap-2">
                  <Badge variant="outline">{{ selectedProduct.sku }}</Badge>
                  <Badge v-if="selectedProduct.price" variant="secondary">
                    ${{ formatPrice(selectedProduct.price) }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showQuickMapDialog = false">
            Cancel
          </Button>
          <Button 
            type="submit" 
            @click="createQuickMapping"
            :disabled="!canCreateQuickMapping"
          >
            <LinkIcon class="h-4 w-4 mr-2" />
            Create Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Bulk Mapping Dialog -->
    <Dialog v-model:open="showBulkMapDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Map Items</DialogTitle>
          <DialogDescription>
            Map {{ selectedItems.length }} selected items to products.
          </DialogDescription>
        </DialogHeader>

        <div class="py-4 space-y-4">
          <Alert>
            <AlertTitle>Auto-Matching</AlertTitle>
            <AlertDescription>
              Select an option to automatically match items with products based on SKUs or names.
              Or manually map each item below.
            </AlertDescription>
          </Alert>

          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                @click="autoMatchBySku"
              >
                <ScanIcon  class="h-4 w-4 mr-2" />
                Auto-Match by SKU
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                @click="autoMatchByName"
              >
                <TextIcon class="h-4 w-4 mr-2" />
                Auto-Match by Name
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                @click="clearAllMatches"
              >
                <XIcon class="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          <div class="rounded-md border overflow-y-auto max-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Product</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="itemId in selectedItems" :key="itemId">
                  <TableCell>
                    <div class="font-medium">{{ getItemById(itemId)?.name }}</div>
                    <div class="text-xs text-muted-foreground">{{ getItemById(itemId)?.sku }}</div>
                  </TableCell>
                  <TableCell>
                    <Combobox 
                      v-model="bulkMappings[itemId]"
                      :options="products.map(product => ({ label: `${product.name} (${product.sku})`, value: product.id }))"
                      :filter="true"
                      :clearable="true"
                      placeholder="Select a product..."
                      :disabled="products.length === 0"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div class="flex items-center justify-between text-sm">
            <div class="text-muted-foreground">
              {{ Object.values(bulkMappings).filter(Boolean).length }} of {{ selectedItems.length }} items mapped
            </div>
            <div>
              <Button 
                variant="ghost" 
                size="sm"
                @click="removeEmptyMappings"
                :disabled="Object.values(bulkMappings).filter(Boolean).length === 0"
              >
                Remove unmapped items
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showBulkMapDialog = false">
            Cancel
          </Button>
          <Button 
            type="submit" 
            @click="createBulkMappings"
            :disabled="Object.values(bulkMappings).filter(Boolean).length === 0"
          >
            <LinkIcon class="h-4 w-4 mr-2" />
            Create {{ Object.values(bulkMappings).filter(Boolean).length }} Mappings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </DialogContent>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Dialog
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Combobox } from '@/components/ui/combobox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  BoxesIcon,
  LinkIcon,
  Loader2Icon,
  PackageIcon,
  ShoppingBagIcon,
  XIcon,
  ScanIcon ,
  TextIcon
} from 'lucide-vue-next'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  products: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['create-mapping', 'close'])

// State
const searchQuery = ref('')
const filterBy = ref('all')
const sortBy = ref('name-asc')
const selectedItems = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10
})

// Quick mapping state
const showQuickMapDialog = ref(false)
const itemToMap = ref(null)
const selectedProductId = ref('')
const quickMapError = ref('')

// Bulk mapping state
const showBulkMapDialog = ref(false)
const bulkMappings = reactive({})

// Computed properties
const filteredItems = computed(() => {
  let result = [...props.items]
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    )
  }
  
  // Apply status filter
  if (filterBy.value === 'active') {
    result = result.filter(item => item.status === 'active')
  } else if (filterBy.value === 'low-stock') {
    result = result.filter(item => item.stockOnHand <= item.reorderPoint)
  } else if (filterBy.value === 'out-of-stock') {
    result = result.filter(item => item.stockAvailable === 0)
  }
  
  // Apply sorting
  if (sortBy.value === 'name-asc') {
    result.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy.value === 'name-desc') {
    result.sort((a, b) => b.name.localeCompare(a.name))
  } else if (sortBy.value === 'sku-asc') {
    result.sort((a, b) => a.sku.localeCompare(b.sku))
  } else if (sortBy.value === 'sku-desc') {
    result.sort((a, b) => b.sku.localeCompare(a.sku))
  } else if (sortBy.value === 'stock-asc') {
    result.sort((a, b) => a.stockOnHand - b.stockOnHand)
  } else if (sortBy.value === 'stock-desc') {
    result.sort((a, b) => b.stockOnHand - a.stockOnHand)
  }
  
  return result
})

const paginatedItems = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredItems.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / pagination.pageSize)
})

const selectedProduct = computed(() => {
  if (!selectedProductId.value) return null
  return props.products.find(product => product.id === selectedProductId.value)
})

const canCreateQuickMapping = computed(() => {
  return itemToMap.value && selectedProductId.value
})

// Methods
function toggleItemSelection(itemId) {
  const index = selectedItems.value.indexOf(itemId)
  if (index === -1) {
    selectedItems.value.push(itemId)
  } else {
    selectedItems.value.splice(index, 1)
  }
}

function getItemById(itemId) {
  return props.items.find(item => item.id === itemId)
}

function formatStatus(status) {
  const statusMap = {
    'active': 'Active',
    'discontinued': 'Discontinued',
    'pending': 'Pending',
    'out_of_stock': 'Out of Stock'
  }
  return statusMap[status] || status
}

function getStatusVariant(status) {
  const variantMap = {
    'active': 'success',
    'discontinued': 'destructive',
    'pending': 'secondary',
    'out_of_stock': 'warning'
  }
  return variantMap[status] || 'outline'
}

function formatPrice(price) {
  if (!price && price !== 0) return 'N/A'
  return parseFloat(price).toFixed(2)
}

function openQuickMapDialog(item) {
  itemToMap.value = item
  selectedProductId.value = ''
  quickMapError.value = ''
  showQuickMapDialog.value = true
}

function createQuickMapping() {
  if (!itemToMap.value || !selectedProductId.value) {
    quickMapError.value = 'Please select a product to map with this item'
    return
  }
  
  emit('create-mapping', itemToMap.value.id, selectedProductId.value)
  showQuickMapDialog.value = false
  
  // Remove the mapped item from selection if it was selected
  const index = selectedItems.value.indexOf(itemToMap.value.id)
  if (index !== -1) {
    selectedItems.value.splice(index, 1)
  }
}

function openBulkMappingDialog() {
  // Initialize the bulk mappings object
  bulkMappings = {}
  selectedItems.value.forEach(itemId => {
    bulkMappings[itemId] = ''
  })
  
  showBulkMapDialog.value = true
}

function autoMatchBySku() {
  // For each selected item, try to find a product with matching SKU
  selectedItems.value.forEach(itemId => {
    const item = getItemById(itemId)
    if (!item) return
    
    const matchingProduct = props.products.find(product => 
      product.sku.toLowerCase() === item.sku.toLowerCase()
    )
    
    if (matchingProduct) {
      bulkMappings[itemId] = matchingProduct.id
    }
  })
}

function autoMatchByName() {
  // For each selected item, try to find a product with similar name
  selectedItems.value.forEach(itemId => {
    const item = getItemById(itemId)
    if (!item) return
    
    // First look for exact match
    let matchingProduct = props.products.find(product => 
      product.name.toLowerCase() === item.name.toLowerCase()
    )
    
    // If no exact match, look for products that contain the item name or vice versa
    if (!matchingProduct) {
      matchingProduct = props.products.find(product => 
        product.name.toLowerCase().includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(product.name.toLowerCase())
      )
    }
    
    if (matchingProduct) {
      bulkMappings[itemId] = matchingProduct.id
    }
  })
}

function clearAllMatches() {
  // Reset all bulk mappings
  Object.keys(bulkMappings).forEach(itemId => {
    bulkMappings[itemId] = ''
  })
}

function removeEmptyMappings() {
  // Keep only the items that have a product mapping
  const validMappings = {}
  
  for (const [itemId, productId] of Object.entries(bulkMappings)) {
    if (productId) {
      validMappings[itemId] = productId
    }
  }
  
  // Replace the bulkMappings object
  Object.keys(bulkMappings).forEach(key => {
    delete bulkMappings[key]
  })
  
  Object.entries(validMappings).forEach(([itemId, productId]) => {
    bulkMappings[itemId] = productId
  })
}

function createBulkMappings() {
  // For each valid mapping, create a mapping
  for (const [itemId, productId] of Object.entries(bulkMappings)) {
    if (productId) {
      emit('create-mapping', itemId, productId)
    }
  }
  
  // Remove the mapped items from selection
  selectedItems.value = selectedItems.value.filter(itemId => !bulkMappings[itemId])
  
  showBulkMapDialog.value = false
}
</script>