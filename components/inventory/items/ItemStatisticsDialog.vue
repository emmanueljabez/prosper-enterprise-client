<template>
  <DialogContent class="max-w-4xl max-h-[90vh] overflow-hidden">
    <DialogHeader>
      <DialogTitle class="flex items-center space-x-2">
        <BarChart3 class="h-5 w-5" />
        <span>Inventory Statistics</span>
      </DialogTitle>
      <DialogDescription>
        Comprehensive inventory analytics and insights
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6 max-h-[70vh] overflow-auto p-1">
      <!-- Overview Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent class="p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ summary?.totalItems || 0 }}</div>
            <div class="text-sm text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{{ formatCurrency(summary?.totalValue || 0) }}</div>
            <div class="text-sm text-muted-foreground">Total Value</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-4 text-center">
            <div class="text-2xl font-bold text-orange-600">{{ summary?.lowStockItems || 0 }}</div>
            <div class="text-sm text-muted-foreground">Low Stock</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-4 text-center">
            <div class="text-2xl font-bold text-red-600">{{ summary?.outOfStockItems || 0 }}</div>
            <div class="text-sm text-muted-foreground">Out of Stock</div>
          </CardContent>
        </Card>
      </div>

      <!-- Detailed Statistics -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Stock Status Distribution -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Stock Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="loading" class="flex items-center justify-center h-32">
              <Loader2 class="h-8 w-8 animate-spin" />
            </div>
            <div v-else class="space-y-4">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                    <span class="text-sm">Well Stocked</span>
                  </div>
                  <div class="text-right">
                    <div class="font-medium">{{ getWellStockedCount() }}</div>
                    <div class="text-xs text-muted-foreground">{{ getWellStockedPercentage() }}%</div>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span class="text-sm">Low Stock</span>
                  </div>
                  <div class="text-right">
                    <div class="font-medium">{{ summary?.lowStockItems || 0 }}</div>
                    <div class="text-xs text-muted-foreground">{{ getLowStockPercentage() }}%</div>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full bg-red-500"></div>
                    <span class="text-sm">Out of Stock</span>
                  </div>
                  <div class="text-right">
                    <div class="font-medium">{{ summary?.outOfStockItems || 0 }}</div>
                    <div class="text-xs text-muted-foreground">{{ getOutOfStockPercentage() }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Value Distribution -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Value Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="loading" class="flex items-center justify-center h-32">
              <Loader2 class="h-8 w-8 animate-spin" />
            </div>
            <div v-else class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Average Item Value:</span>
                <span class="font-medium">{{ formatCurrency(getAverageItemValue()) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Highest Value Item:</span>
                <span class="font-medium">{{ formatCurrency(getHighestItemValue()) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Lowest Value Item:</span>
                <span class="font-medium">{{ formatCurrency(getLowestItemValue()) }}</span>
              </div>
              <div class="pt-2 border-t">
                <div class="flex justify-between">
                  <span class="text-sm text-muted-foreground">Standard Cost Total:</span>
                  <span class="font-medium">{{ formatCurrency(summary?.standardCostTotal || 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-muted-foreground">List Price Total:</span>
                  <span class="font-medium">{{ formatCurrency(summary?.listPriceTotal || 0) }}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Category Breakdown -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="loading" class="flex items-center justify-center h-32">
              <Loader2 class="h-8 w-8 animate-spin" />
            </div>
            <div v-else class="space-y-3">
              <div 
                v-for="category in topCategories" 
                :key="category.id"
                class="flex items-center justify-between"
              >
                <div>
                  <div class="font-medium text-sm">{{ category.name }}</div>
                  <div class="text-xs text-muted-foreground">{{ category.itemCount }} items</div>
                </div>
                <div class="text-right">
                  <div class="font-medium">{{ formatCurrency(category.totalValue) }}</div>
                  <div class="text-xs text-muted-foreground">{{ getCategoryPercentage(category.totalValue) }}%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Activity Summary -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="loading" class="flex items-center justify-center h-32">
              <Loader2 class="h-8 w-8 animate-spin" />
            </div>
            <div v-else class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Items Added (30 days):</span>
                <span class="font-medium text-green-600">+{{ activityStats.itemsAdded }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Items Modified (30 days):</span>
                <span class="font-medium text-blue-600">{{ activityStats.itemsModified }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Stock Movements (30 days):</span>
                <span class="font-medium">{{ activityStats.stockMovements }}</span>
              </div>
              <div class="pt-2 border-t">
                <div class="flex justify-between">
                  <span class="text-sm text-muted-foreground">Last Stock Update:</span>
                  <span class="font-medium">{{ formatDate(activityStats.lastStockUpdate) }}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Alerts and Recommendations -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg flex items-center">
            <AlertTriangle class="h-5 w-5 text-orange-500 mr-2" />
            Alerts & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="flex items-center justify-center h-24">
            <Loader2 class="h-6 w-6 animate-spin" />
          </div>
          <div v-else class="space-y-3">
            <div v-if="summary?.lowStockItems > 0" class="flex items-start space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle class="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-orange-900">Low Stock Alert</p>
                <p class="text-xs text-orange-700">
                  {{ summary.lowStockItems }} items are below their reorder point. Consider restocking soon.
                </p>
              </div>
            </div>

            <div v-if="summary?.outOfStockItems > 0" class="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle class="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-red-900">Out of Stock Alert</p>
                <p class="text-xs text-red-700">
                  {{ summary.outOfStockItems }} items are completely out of stock. Immediate attention required.
                </p>
              </div>
            </div>

            <div v-if="getInactiveItemsCount() > 0" class="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info class="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-blue-900">Inactive Items</p>
                <p class="text-xs text-blue-700">
                  {{ getInactiveItemsCount() }} items are marked as inactive. Review if they should be archived or reactivated.
                </p>
              </div>
            </div>

            <div v-if="getNoMovementItemsCount() > 0" class="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock class="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-yellow-900">Slow Moving Items</p>
                <p class="text-xs text-yellow-700">
                  {{ getNoMovementItemsCount() }} items have had no stock movement in the last 90 days.
                </p>
              </div>
            </div>

            <div v-if="getHighValueItemsCount() > 0" class="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <TrendingUp class="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-green-900">High Value Items</p>
                <p class="text-xs text-green-700">
                  {{ getHighValueItemsCount() }} items represent 80% of your total inventory value. Monitor these closely.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Export Options -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Export Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" @click="exportReport('summary')">
              <FileText class="h-4 w-4 mr-2" />
              Summary Report
            </Button>
            <Button variant="outline" size="sm" @click="exportReport('detailed')">
              <FileSpreadsheet class="h-4 w-4 mr-2" />
              Detailed Analysis
            </Button>
            <Button variant="outline" size="sm" @click="exportReport('alerts')">
              <AlertTriangle class="h-4 w-4 mr-2" />
              Alerts Report
            </Button>
            <Button variant="outline" size="sm" @click="exportReport('categories')">
              <BarChart3 class="h-4 w-4 mr-2" />
              Category Breakdown
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="refreshStats">
        <RefreshCw class="h-4 w-4 mr-2" />
        Refresh
      </Button>
      <Button variant="outline" @click="$emit('close')">
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  BarChart3, Loader2, AlertTriangle, XCircle, Info, Clock, TrendingUp,
  FileText, FileSpreadsheet, RefreshCw
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'

// Props
const props = defineProps({
  summary: {
    type: Object,
    default: () => null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close'])

// State
const activityStats = ref({
  itemsAdded: 12,
  itemsModified: 28,
  stockMovements: 156,
  lastStockUpdate: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
})

const topCategories = ref([
  { id: 1, name: 'Electronics', itemCount: 45, totalValue: 125000 },
  { id: 2, name: 'Office Supplies', itemCount: 78, totalValue: 85000 },
  { id: 3, name: 'Hardware', itemCount: 32, totalValue: 62000 },
  { id: 4, name: 'Software', itemCount: 15, totalValue: 45000 },
  { id: 5, name: 'Accessories', itemCount: 56, totalValue: 28000 }
])

// Computed
const getWellStockedCount = () => {
  const total = props.summary?.totalItems || 0
  const lowStock = props.summary?.lowStockItems || 0
  const outOfStock = props.summary?.outOfStockItems || 0
  return Math.max(0, total - lowStock - outOfStock)
}

const getWellStockedPercentage = () => {
  const total = props.summary?.totalItems || 0
  if (total === 0) return 0
  return Math.round((getWellStockedCount() / total) * 100)
}

const getLowStockPercentage = () => {
  const total = props.summary?.totalItems || 0
  if (total === 0) return 0
  return Math.round(((props.summary?.lowStockItems || 0) / total) * 100)
}

const getOutOfStockPercentage = () => {
  const total = props.summary?.totalItems || 0
  if (total === 0) return 0
  return Math.round(((props.summary?.outOfStockItems || 0) / total) * 100)
}

const getAverageItemValue = () => {
  const total = props.summary?.totalItems || 0
  const value = props.summary?.totalValue || 0
  return total > 0 ? value / total : 0
}

const getHighestItemValue = () => {
  return props.summary?.highestItemValue || 0
}

const getLowestItemValue = () => {
  return props.summary?.lowestItemValue || 0
}

const getCategoryPercentage = (value) => {
  const total = props.summary?.totalValue || 0
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

const getInactiveItemsCount = () => {
  return props.summary?.inactiveItems || 0
}

const getNoMovementItemsCount = () => {
  return props.summary?.slowMovingItems || 0
}

const getHighValueItemsCount = () => {
  return props.summary?.highValueItems || 0
}

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.round((date - new Date()) / (1000 * 60 * 60)), 'hour'
  )
}

const refreshStats = () => {
  // Emit refresh event or reload data
  emit('refresh')
}

const exportReport = (type) => {
  // Implement export functionality based on type
  console.log(`Exporting ${type} report...`)
  
  // Create mock CSV content based on type
  let csvContent = ''
  let filename = ''

  switch (type) {
    case 'summary':
      csvContent = [
        'Metric,Value',
        `Total Items,${props.summary?.totalItems || 0}`,
        `Total Value,${props.summary?.totalValue || 0}`,
        `Low Stock Items,${props.summary?.lowStockItems || 0}`,
        `Out of Stock Items,${props.summary?.outOfStockItems || 0}`,
        `Active Items,${props.summary?.activeItems || 0}`,
        `Inactive Items,${props.summary?.inactiveItems || 0}`
      ].join('\n')
      filename = 'inventory-summary-report.csv'
      break
    
    case 'categories':
      csvContent = [
        'Category,Item Count,Total Value,Percentage',
        ...topCategories.value.map(cat => 
          `${cat.name},${cat.itemCount},${cat.totalValue},${getCategoryPercentage(cat.totalValue)}%`
        )
      ].join('\n')
      filename = 'inventory-category-breakdown.csv'
      break
    
    default:
      csvContent = 'Report data not implemented'
      filename = `inventory-${type}-report.csv`
  }

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Initialize
onMounted(() => {
  // Component is ready
})
</script>
