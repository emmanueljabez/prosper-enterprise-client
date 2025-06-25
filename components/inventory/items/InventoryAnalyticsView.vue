<template>
  <div class="space-y-6">
    <!-- Overview Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Items</CardTitle>
          <PackageIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ summary?.totalItems || 0 }}</div>
          <p class="text-xs text-muted-foreground">
            {{ summary?.activeItems || 0 }} active, {{ (summary?.totalItems || 0) - (summary?.activeItems || 0) }} inactive
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Value</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatCurrency(summary?.totalValue || 0) }}</div>
          <p class="text-xs text-muted-foreground">
            Total inventory value
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Low Stock Items</CardTitle>
          <AlertTriangle class="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-orange-600">{{ lowStockItems?.length || 0 }}</div>
          <p class="text-xs text-muted-foreground">
            Items below reorder point
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Out of Stock</CardTitle>
          <XCircle class="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">{{ summary?.outOfStockItems || 0 }}</div>
          <p class="text-xs text-muted-foreground">
            Items with zero stock
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Stock Status Distribution -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Stock Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="flex items-center justify-center h-64">
            <Loader2 class="h-8 w-8 animate-spin" />
          </div>
          <div v-else class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <span class="text-sm">In Stock</span>
              </div>
              <span class="text-sm font-medium">{{ getInStockCount() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                <span class="text-sm">Low Stock</span>
              </div>
              <span class="text-sm font-medium">{{ lowStockItems?.length || 0 }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <span class="text-sm">Out of Stock</span>
              </div>
              <span class="text-sm font-medium">{{ summary?.outOfStockItems || 0 }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Top Categories by Value -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Top Categories by Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="flex items-center justify-center h-64">
            <Loader2 class="h-8 w-8 animate-spin" />
          </div>
          <div v-else class="space-y-4">
            <div 
              v-for="category in topCategories" 
              :key="category.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-2">
                <Badge variant="outline">{{ category.name }}</Badge>
              </div>
              <span class="text-sm font-medium">{{ formatCurrency(category.value) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Critical Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Low Stock Alert -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle class="text-lg flex items-center">
            <AlertTriangle class="h-5 w-5 text-orange-500 mr-2" />
            Low Stock Alert
          </CardTitle>
          <Button variant="outline" size="sm" @click="$emit('view-low-stock')">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="flex items-center justify-center h-32">
            <Loader2 class="h-6 w-6 animate-spin" />
          </div>
          <div v-else-if="!lowStockItems || lowStockItems.length === 0" class="text-center py-8">
            <CheckCircle class="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">All items are well stocked!</p>
          </div>
          <div v-else class="space-y-3">
            <div 
              v-for="item in lowStockItems.slice(0, 5)" 
              :key="item.id"
              class="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
            >
              <div>
                <div class="font-medium text-sm">{{ item.name }}</div>
                <div class="text-xs text-muted-foreground">{{ item.itemCode }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-orange-600">{{ item.stockOnHand }}</div>
                <div class="text-xs text-muted-foreground">{{ item.unitOfMeasureName }}</div>
              </div>
            </div>
            <div v-if="lowStockItems.length > 5" class="text-center pt-2">
              <Button variant="ghost" size="sm" @click="$emit('view-low-stock')">
                +{{ lowStockItems.length - 5 }} more items
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Reorder Required -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle class="text-lg flex items-center">
            <ShoppingCart class="h-5 w-5 text-blue-500 mr-2" />
            Reorder Required
          </CardTitle>
          <Button variant="outline" size="sm" @click="$emit('view-reorder-required')">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="flex items-center justify-center h-32">
            <Loader2 class="h-6 w-6 animate-spin" />
          </div>
          <div v-else-if="!reorderItems || reorderItems.length === 0" class="text-center py-8">
            <CheckCircle class="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p class="text-sm text-muted-foreground">No items need reordering!</p>
          </div>
          <div v-else class="space-y-3">
            <div 
              v-for="item in reorderItems.slice(0, 5)" 
              :key="item.id"
              class="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
            >
              <div>
                <div class="font-medium text-sm">{{ item.name }}</div>
                <div class="text-xs text-muted-foreground">{{ item.itemCode }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-blue-600">Order {{ item.suggestedOrderQuantity }}</div>
                <div class="text-xs text-muted-foreground">{{ item.unitOfMeasureName }}</div>
              </div>
            </div>
            <div v-if="reorderItems.length > 5" class="text-center pt-2">
              <Button variant="ghost" size="sm" @click="$emit('view-reorder-required')">
                +{{ reorderItems.length - 5 }} more items
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Activity -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle class="text-lg">Recent Stock Movements</CardTitle>
        <Button variant="outline" size="sm" @click="$emit('refresh')">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center justify-center h-32">
          <Loader2 class="h-6 w-6 animate-spin" />
        </div>
        <div v-else class="space-y-4">
          <div 
            v-for="movement in recentMovements" 
            :key="movement.id"
            class="flex items-center justify-between p-3 border rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="p-2 rounded-full" :class="getMovementIconClass(movement.type)">
                <component :is="getMovementIcon(movement.type)" class="h-4 w-4" />
              </div>
              <div>
                <div class="font-medium text-sm">{{ movement.itemName }}</div>
                <div class="text-xs text-muted-foreground">{{ movement.type }} • {{ formatDate(movement.date) }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium" :class="movement.quantity > 0 ? 'text-green-600' : 'text-red-600'">
                {{ movement.quantity > 0 ? '+' : '' }}{{ movement.quantity }}
              </div>
              <div class="text-xs text-muted-foreground">{{ movement.unitOfMeasure }}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  PackageIcon, DollarSign, AlertTriangle, XCircle, Loader2, CheckCircle, 
  ShoppingCart, RefreshCw, TrendingUp, TrendingDown, Package
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Props
const props = defineProps({
  summary: {
    type: Object,
    default: () => null
  },
  lowStockItems: {
    type: Array,
    default: () => []
  },
  reorderItems: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'view-low-stock',
  'view-reorder-required',
  'refresh'
])

// Mock data for recent movements and categories
const recentMovements = computed(() => [
  {
    id: 1,
    itemName: 'Widget A',
    type: 'Stock In',
    quantity: 100,
    unitOfMeasure: 'PCS',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: 2,
    itemName: 'Widget B',
    type: 'Stock Out',
    quantity: -25,
    unitOfMeasure: 'PCS',
    date: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
  },
  {
    id: 3,
    itemName: 'Widget C',
    type: 'Adjustment',
    quantity: 5,
    unitOfMeasure: 'PCS',
    date: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 hours ago
  }
])

const topCategories = computed(() => [
  { id: 1, name: 'Electronics', value: 125000 },
  { id: 2, name: 'Office Supplies', value: 85000 },
  { id: 3, name: 'Hardware', value: 62000 },
  { id: 4, name: 'Software', value: 45000 },
  { id: 5, name: 'Accessories', value: 28000 }
])

// Methods
const getInStockCount = () => {
  const total = props.summary?.totalItems || 0
  const lowStock = props.lowStockItems?.length || 0
  const outOfStock = props.summary?.outOfStockItems || 0
  return total - lowStock - outOfStock
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

const formatDate = (date) => {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.round((date - new Date()) / (1000 * 60 * 60)), 'hour'
  )
}

const getMovementIcon = (type) => {
  switch (type) {
    case 'Stock In':
      return TrendingUp
    case 'Stock Out':
      return TrendingDown
    case 'Adjustment':
      return Package
    default:
      return Package
  }
}

const getMovementIconClass = (type) => {
  switch (type) {
    case 'Stock In':
      return 'bg-green-100 text-green-600'
    case 'Stock Out':
      return 'bg-red-100 text-red-600'
    case 'Adjustment':
      return 'bg-blue-100 text-blue-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}
</script>
