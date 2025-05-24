<template>
  <DialogContent class="sm:max-w-2xl max-h-[90vh] flex flex-col">
    <DialogHeader>
      <DialogTitle>Location Details</DialogTitle>
      <DialogDescription>
        View detailed information about this inventory location.
      </DialogDescription>
    </DialogHeader>
    
    <div v-if="!location" class="flex items-center justify-center py-10 flex-1 overflow-y-auto">
      <div class="flex flex-col items-center">
        <MapPinOffIcon class="h-10 w-10 text-muted-foreground" />
        <p class="mt-4 text-sm text-muted-foreground">Location details not found</p>
      </div>
    </div>
    
    <div v-else class="space-y-6 my-4 overflow-y-auto pr-2 flex-1">
      <!-- Location Header -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <Badge variant="outline" class="h-6 px-3">
              {{ formatLocationType(location.type) }}
            </Badge>
            <Badge :variant="getStatusVariant(location.status)" class="h-6 px-3">
              {{ formatLocationStatus(location.status) }}
            </Badge>
          </div>
          <h3 class="text-lg font-semibold mt-2">{{ location.name }}</h3>
          <p class="text-sm text-muted-foreground">{{ location.code }}</p>
        </div>
        
        <div class="text-sm text-right space-y-1">
          <div>
            <span class="text-muted-foreground">Items Stocked:</span>
            <span class="ml-1 font-medium">{{ locationItems.length }} items</span>
          </div>
          <div>
            <span class="text-muted-foreground">Total Quantity:</span>
            <span class="ml-1 font-medium">{{ getTotalQuantity() }} units</span>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <!-- Location Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Basic Information -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium">Basic Information</h4>
          <Card>
            <CardContent class="p-4">
              <div class="space-y-2">
                <div class="flex justify-between py-1 border-b">
                  <span class="text-muted-foreground">Address</span>
                  <span class="font-medium">{{ location.address || 'No address' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b">
                  <span class="text-muted-foreground">Contact</span>
                  <span class="font-medium">{{ location.contact || 'N/A' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b">
                  <span class="text-muted-foreground">Capacity</span>
                  <span class="font-medium">{{ location.capacity ? `${location.capacity} units` : 'Unlimited' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b">
                  <span class="text-muted-foreground">Capacity Used</span>
                  <span class="font-medium">{{ formatCapacityUsed() }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span class="text-muted-foreground">Status</span>
                  <Badge :variant="location.status === 'active' ? 'success' : 'secondary'">
                    {{ formatLocationStatus(location.status) }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <!-- Stock Status -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium">Stock Status</h4>
          <Card>
            <CardContent class="p-4">
              <div class="space-y-4">
                <div class="grid grid-cols-3 gap-3">
                  <div class="flex flex-col items-center p-3 rounded-md bg-muted/40">
                    <span class="text-sm text-muted-foreground">In Stock</span>
                    <span class="text-xl font-semibold">{{ stockLevels.inStock }}</span>
                  </div>
                  <div class="flex flex-col items-center p-3 rounded-md bg-muted/40">
                    <span class="text-sm text-muted-foreground">Low Stock</span>
                    <span class="text-xl font-semibold">{{ stockLevels.lowStock }}</span>
                  </div>
                  <div class="flex flex-col items-center p-3 rounded-md bg-muted/40">
                    <span class="text-sm text-muted-foreground">Critical</span>
                    <span class="text-xl font-semibold">{{ stockLevels.criticalStock }}</span>
                  </div>
                </div>
                
                <div class="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div class="flex h-full">
                    <div class="bg-success h-full" :style="`width: ${getStockPercentage(stockLevels.inStock)}%`"></div>
                    <div class="bg-warning h-full" :style="`width: ${getStockPercentage(stockLevels.lowStock)}%`"></div>
                    <div class="bg-destructive h-full" :style="`width: ${getStockPercentage(stockLevels.criticalStock)}%`"></div>
                  </div>
                </div>
                
                <div class="flex items-center justify-between text-xs text-muted-foreground">
                  <div class="flex items-center">
                    <div class="h-2 w-2 rounded-full bg-success mr-1"></div>
                    <span>In Stock</span>
                  </div>
                  <div class="flex items-center">
                    <div class="h-2 w-2 rounded-full bg-warning mr-1"></div>
                    <span>Low Stock</span>
                  </div>
                  <div class="flex items-center">
                    <div class="h-2 w-2 rounded-full bg-destructive mr-1"></div>
                    <span>Critical</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <!-- Top Items -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium">Top Items by Quantity</h4>
          <Button variant="outline" size="sm">
            <ListFilterIcon class="h-4 w-4 mr-2" />
            View All Items
          </Button>
        </div>
        
        <Card class="overflow-hidden">
          <div class="max-h-[250px] overflow-auto">
            <Table>
              <TableHeader class="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Stock Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in topItems" :key="item.id" class="cursor-pointer hover:bg-muted/50">
                  <TableCell class="font-medium">{{ item.name }}</TableCell>
                  <TableCell>{{ item.sku }}</TableCell>
                  <TableCell>{{ formatCategoryName(item.categoryId) }}</TableCell>
                  <TableCell>{{ getItemQuantityAtLocation(item) }}</TableCell>
                  <TableCell>
                    <Badge :variant="getItemStockLevelVariant(item)">
                      {{ getItemStockLevelLabel(item) }}
                    </Badge>
                  </TableCell>
                </TableRow>
                
                <TableRow v-if="locationItems.length === 0">
                  <TableCell colspan="5" class="text-center py-4 text-muted-foreground">
                    No items stocked at this location
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
      
      <!-- Recent Transactions -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium">Recent Transactions</h4>
          <Button variant="outline" size="sm">
            <HistoryIcon class="h-4 w-4 mr-2" />
            View All Transactions
          </Button>
        </div>
        
        <Card class="overflow-hidden">
          <div class="max-h-[250px] overflow-auto">
            <Table>
              <TableHeader class="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="tx in recentTransactions" :key="tx.id" class="cursor-pointer hover:bg-muted/50">
                  <TableCell class="font-medium">{{ tx.referenceNumber }}</TableCell>
                  <TableCell>
                    <Badge :variant="getTypeVariant(tx.type)">
                      {{ formatTransactionType(tx.type) }}
                    </Badge>
                  </TableCell>
                  <TableCell>{{ formatDate(tx.createdAt) }}</TableCell>
                  <TableCell>{{ tx.items.length }}</TableCell>
                  <TableCell>
                    <Badge :variant="getStatusVariant(tx.status)">
                      {{ formatTransactionStatus(tx.status) }}
                    </Badge>
                  </TableCell>
                </TableRow>
                
                <TableRow v-if="locationTransactions.length === 0">
                  <TableCell colspan="5" class="text-center py-4 text-muted-foreground">
                    No transactions for this location
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
    
    <DialogFooter class="mt-2 pt-2 border-t">
      <div class="flex justify-between w-full items-center">
        <div class="flex space-x-2">
          <Button variant="outline" size="sm">
            <DownloadIcon class="h-4 w-4 mr-2" />
            Export Data
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
  MapPinOffIcon, ListFilterIcon, HistoryIcon, PrinterIcon,
  DownloadIcon
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps({
  location: {
    type: Object,
    default: null
  },
  items: {
    type: Array,
    default: () => []
  },
  transactions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

// Computed properties
const locationItems = computed(() => {
  return Array.isArray(props.items) ? props.items : []
})

const locationTransactions = computed(() => {
  return Array.isArray(props.transactions) ? props.transactions : []
})

// Get only the 5 most recent transactions
const recentTransactions = computed(() => {
  return locationTransactions.value
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

// Get top 5 items by quantity
const topItems = computed(() => {
  return locationItems.value
    .sort((a, b) => {
      const aQuantity = getItemQuantityAtLocation(a)
      const bQuantity = getItemQuantityAtLocation(b)
      return bQuantity - aQuantity
    })
    .slice(0, 5)
})

// Calculate stock levels for the location
const stockLevels = computed(() => {
  const levels = {
    inStock: 0,
    lowStock: 0,
    criticalStock: 0,
    outOfStock: 0
  }
  
  locationItems.value.forEach(item => {
    const stockLevel = getItemStockLevelLabel(item)
    
    if (stockLevel === 'In Stock') {
      levels.inStock++
    } else if (stockLevel === 'Low Stock') {
      levels.lowStock++
    } else if (stockLevel === 'Critical') {
      levels.criticalStock++
    } else if (stockLevel === 'Out of Stock') {
      levels.outOfStock++
    }
  })
  
  return levels
})

// Methods
function formatLocationType(type) {
  const types = {
    'warehouse': 'Warehouse',
    'store': 'Store',
    'dc': 'Distribution Center',
    'manufacturing': 'Manufacturing',
    'zone': 'Zone'
  }
  return types[type] || 'Other'
}

function formatLocationStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getStatusVariant(status) {
  const variants = {
    'active': 'success',
    'inactive': 'secondary',
    'maintenance': 'warning',
    'closed': 'destructive'
  }
  return variants[status] || 'outline'
}

function getTotalQuantity() {
  if (!locationItems.value.length) return 0
  
  return locationItems.value.reduce((total, item) => {
    return total + getItemQuantityAtLocation(item)
  }, 0)
}

function formatCapacityUsed() {
  if (!props.location || !props.location.capacity) return 'N/A'
  
  const totalQuantity = getTotalQuantity()
  const percentage = (totalQuantity / props.location.capacity) * 100
  
  return `${totalQuantity} / ${props.location.capacity} (${Math.round(percentage)}%)`
}

function getStockPercentage(count) {
  const total = locationItems.value.length
  if (total === 0) return 0
  return (count / total) * 100
}

function formatCategoryName(categoryId) {
  const categories = {
    'cat-001': 'Tools',
    'cat-002': 'Customer Premise Equipment',
    'cat-003': 'Network Termination',
    'cat-004': 'Cabling'
  }
  return categories[categoryId] || 'Uncategorized'
}

function getItemQuantityAtLocation(item) {
  if (!item || !item.locations) return 0
  
  const locationStock = item.locations.find(loc => loc.id === props.location.id)
  return locationStock ? locationStock.quantity : 0
}

function getItemStockLevelLabel(item) {
  if (!item) return 'Unknown'
  
  const quantity = getItemQuantityAtLocation(item)
  
  if (quantity <= 0) return 'Out of Stock'
  if (quantity <= 2) return 'Critical'
  if (quantity <= 5) return 'Low Stock'
  return 'In Stock'
}

function getItemStockLevelVariant(item) {
  if (!item) return 'outline'
  
  const quantity = getItemQuantityAtLocation(item)
  
  if (quantity <= 0) return 'destructive'
  if (quantity <= 2) return 'destructive'
  if (quantity <= 5) return 'warning'
  return 'success'
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

function formatTransactionStatus(status) {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
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

function formatDate(dateTime) {
  if (!dateTime) return 'N/A'
  return format(new Date(dateTime), 'MMM d, yyyy')
}
</script>