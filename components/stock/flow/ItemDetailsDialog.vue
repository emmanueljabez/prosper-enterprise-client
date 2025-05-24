<template>
  <DialogContent class="sm:max-w-2xl">
    <DialogHeader>
      <DialogTitle>Item Details</DialogTitle>
      <DialogDescription>
        View detailed information about this inventory item.
      </DialogDescription>
    </DialogHeader>
    
    <div v-if="!item" class="flex items-center justify-center py-10">
      <div class="flex flex-col items-center">
        <PackageSearchIcon class="h-10 w-10 text-muted-foreground" />
        <p class="mt-4 text-sm text-muted-foreground">Item details not found</p>
      </div>
    </div>
    
    <div v-else class="space-y-6 my-4">
      <!-- Item Header -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <Badge variant="outline" class="h-6 px-3">
              {{ formatCategoryName(item.categoryId) }}
            </Badge>
            <Badge :variant="getStockLevelVariant(item)" class="h-6 px-3">
              {{ getStockLevelLabel(item) }}
            </Badge>
          </div>
          <h3 class="text-lg font-semibold mt-2">{{ item.name }}</h3>
          <p class="text-sm text-muted-foreground">{{ item.sku }}</p>
        </div>
        
        <div class="text-sm text-right space-y-1">
          <div>
            <span class="text-muted-foreground">Total Stock:</span>
            <span class="ml-1 font-medium">{{ getTotalStock(item) }} units</span>
          </div>
          <div>
            <span class="text-muted-foreground">Locations:</span>
            <span class="ml-1 font-medium">{{ item.locations.length }}</span>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <!-- Item Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Basic Information -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium">Basic Information</h4>
          <Card>
            <CardContent class="p-4">
              <div class="space-y-2">
                <div class="flex justify-between py-1 border-b">
                  <span class="text-muted-foreground">Description</span>
                  <span class="font-medium">{{ item.description || 'No description' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b">
                  <span class="text-muted-foreground">UPC/EAN</span>
                  <span class="font-medium">{{ item.upc || 'N/A' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b">
                  <span class="text-muted-foreground">Unit of Measure</span>
                  <span class="font-medium">{{ item.unitOfMeasure || 'Each' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b">
                  <span class="text-muted-foreground">Minimum Stock</span>
                  <span class="font-medium">{{ item.minimumStock || '0' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b">
                  <span class="text-muted-foreground">Maximum Stock</span>
                  <span class="font-medium">{{ item.maximumStock || 'No limit' }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span class="text-muted-foreground">Status</span>
                  <Badge :variant="item.active ? 'success' : 'secondary'">
                    {{ item.active ? 'Active' : 'Inactive' }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <!-- Stock Levels -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium">Stock Levels</h4>
          <Card>
            <CardContent class="p-4">
              <div class="space-y-3">
                <div class="grid grid-cols-3 gap-3">
                  <div class="flex flex-col items-center p-3 rounded-md bg-muted/40">
                    <span class="text-sm text-muted-foreground">Stock on Hand</span>
                    <span class="text-xl font-semibold">{{ item.stockOnHand || 0 }}</span>
                  </div>
                  <div class="flex flex-col items-center p-3 rounded-md bg-muted/40">
                    <span class="text-sm text-muted-foreground">Available</span>
                    <span class="text-xl font-semibold">{{ item.stockAvailable || 0 }}</span>
                  </div>
                  <div class="flex flex-col items-center p-3 rounded-md bg-muted/40">
                    <span class="text-sm text-muted-foreground">Reserved</span>
                    <span class="text-xl font-semibold">{{ getReservedStock(item) }}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h5 class="text-sm font-medium mb-2">Stock by Location</h5>
                  <div class="space-y-2">
                    <div v-for="loc in item.locations" :key="loc.id" class="flex justify-between items-center">
                      <div class="flex items-center">
                        <MapPinIcon class="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{{ getLocationName(loc.id) }}</span>
                      </div>
                      <Badge>{{ loc.quantity }} units</Badge>
                    </div>
                    
                    <div v-if="item.locations.length === 0" class="text-center py-2 text-sm text-muted-foreground">
                      This item is not stocked at any location
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <!-- Stock Movement Chart -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium">Stock Movement</h4>
        <Card>
          <CardContent class="p-4">
            <div v-if="itemTransactions.length === 0" class="flex items-center justify-center py-12">
              <div class="flex flex-col items-center text-center">
                <TrendingDown class="h-10 w-10 text-muted-foreground" />
                <p class="mt-4 text-sm text-muted-foreground">No transaction history available for this item</p>
              </div>
            </div>
            <div v-else class="h-64 border-b pb-4">
              <!-- Placeholder for a stock movement chart -->
              <div class="h-full flex items-center justify-center">
                <p class="text-muted-foreground">Stock movement chart would render here</p>
              </div>
            </div>
            
            <div class="mt-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Recent Activity:</span>
                <Button variant="link" size="sm" class="p-0 h-auto">View All Transactions</Button>
              </div>
              
              <div class="space-y-2">
                <div v-for="(tx, index) in recentTransactions" :key="tx.id" class="flex justify-between items-center py-1 border-b last:border-0">
                  <div class="flex items-center">
                    <Badge :variant="getTypeVariant(tx.type)" class="mr-2">
                      {{ formatTransactionType(tx.type) }}
                    </Badge>
                    <span class="text-sm">{{ tx.referenceNumber }}</span>
                  </div>
                  <div class="flex items-center">
                    <span :class="getQuantityClass(getItemQuantityInTransaction(tx, item.id))" class="text-sm mr-3">
                      {{ getItemQuantityInTransaction(tx, item.id) > 0 ? '+' : '' }}{{ getItemQuantityInTransaction(tx, item.id) }}
                    </span>
                    <span class="text-xs text-muted-foreground">{{ formatDate(tx.createdAt) }}</span>
                  </div>
                </div>
                
                <div v-if="recentTransactions.length === 0" class="text-center py-2 text-sm text-muted-foreground">
                  No recent transactions
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <!-- Product Mapping -->
      <div v-if="productMapping" class="space-y-3">
        <h4 class="text-sm font-medium">Product Association</h4>
        <Card>
          <CardContent class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">This inventory item is linked to:</p>
                <p class="font-medium">{{ productMapping.productName }}</p>
                <p class="text-xs text-muted-foreground">Product ID: {{ productMapping.productId }}</p>
              </div>
              <Button variant="outline" size="sm">
                <LinkIcon class="h-4 w-4 mr-2" />
                View Product
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    
    <DialogFooter>
      <div class="flex justify-between w-full items-center">
        <div class="flex space-x-2">
          <Button variant="outline" size="sm">
            <HistoryIcon class="h-4 w-4 mr-2" />
            View History
          </Button>
        </div>
        
        <div class="flex space-x-2">
          <Button variant="outline" size="sm">
            <PrinterIcon class="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button @click="$emit('close')">Close</Button>
        </div>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { 
  PackageSearchIcon, MapPinIcon, TrendingDown, PrinterIcon,
  HistoryIcon, LinkIcon
} from 'lucide-vue-next'
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'

const props = defineProps({
  item: {
    type: Object,
    default: null
  },
  locations: {
    type: Array,
    default: () => []
  },
  transactions: {
    type: Array,
    default: () => []
  },
  productMapping: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

// Computed properties
const itemTransactions = computed(() => {
  return Array.isArray(props.transactions) ? props.transactions : []
})

// Get only the 5 most recent transactions
const recentTransactions = computed(() => {
  return itemTransactions.value
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

// Methods
function formatCategoryName(categoryId) {
  const categories = {
    'cat-001': 'Tools',
    'cat-002': 'Customer Premise Equipment',
    'cat-003': 'Network Termination',
    'cat-004': 'Cabling'
  }
  return categories[categoryId] || 'Uncategorized'
}

function getStockLevelLabel(item) {
  if (!item) return 'Unknown'
  
  const stock = item.stockAvailable || 0
  
  if (stock <= 0) return 'Out of Stock'
  if (stock <= 2) return 'Critical'
  if (stock <= 5) return 'Low Stock'
  return 'In Stock'
}

function getStockLevelVariant(item) {
  if (!item) return 'outline'
  
  const stock = item.stockAvailable || 0
  
  if (stock <= 0) return 'destructive'
  if (stock <= 2) return 'destructive'
  if (stock <= 5) return 'warning'
  return 'success'
}

function getTotalStock(item) {
  if (!item) return 0
  return item.stockOnHand || 0
}

function getReservedStock(item) {
  if (!item) return 0
  const onHand = item.stockOnHand || 0
  const available = item.stockAvailable || 0
  return onHand - available
}

function getLocationName(locationId) {
  const location = props.locations.find(loc => loc.id === locationId)
  return location ? location.name : 'Unknown Location'
}

function formatTransactionType(type) {
  const types = {
    receipt: 'Receipt',
    issue: 'Issue',
    adjustment: 'Adjustment',
    transfer: 'Transfer',
    return: 'Return',
    bulk: 'Bulk Transfer'
  }
  return types[type] || type
}

function getTypeVariant(type) {
  const variants = {
    receipt: 'success',
    issue: 'destructive',
    adjustment: 'warning',
    transfer: 'default',
    return: 'secondary',
    bulk: 'default'
  }
  return variants[type] || 'outline'
}

function getItemQuantityInTransaction(transaction, itemId) {
  if (!transaction || !transaction.items) return 0
  
  const transactionItem = transaction.items.find(item => item.itemId === itemId)
  return transactionItem ? transactionItem.quantity : 0
}

function getQuantityClass(quantity) {
  if (quantity > 0) return 'text-success'
  if (quantity < 0) return 'text-destructive'
  return ''
}

function formatDate(dateTime) {
  if (!dateTime) return 'N/A'
  return format(new Date(dateTime), 'MMM d, yyyy')
}
</script>

<style scoped>
/* Additional custom colors for specific transaction types */
:deep(.text-warning) {
  color: hsl(38, 92%, 50%);
}

:deep(.bg-warning) {
  background-color: hsl(38, 92%, 50%);
}
</style>