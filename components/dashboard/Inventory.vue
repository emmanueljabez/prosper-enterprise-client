<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Header with date and filters -->
    <header class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p class="text-muted-foreground">
            {{ formattedDate }} • {{ totalItems }} items in stock
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Select v-model="selectedLocation">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="warehouse-a">Warehouse A</SelectItem>
              <SelectItem value="secure-storage-b">Secure Storage B</SelectItem>
              <SelectItem value="tool-storage">Tool Storage</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" @click="refreshData">
            <RefreshCw class="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download class="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </header>

    <!-- Inventory Overview Cards -->
    <div class="grid gap-4 md:grid-cols-4">
      <!-- Total Inventory Value -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Inventory Value</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">KES {{ formatCurrency(inventoryStats.totalValue) }}</div>
          <p class="text-xs text-muted-foreground">
            <span :class="inventoryStats.valueChange > 0 ? 'text-green-500' : 'text-red-500'">
              <ArrowUp v-if="inventoryStats.valueChange > 0" class="h-4 w-4 inline" />
              <ArrowDown v-else class="h-4 w-4 inline" />
              {{ Math.abs(inventoryStats.valueChange) }}%
            </span>
            from previous month
          </p>
        </CardContent>
      </Card>

      <!-- Units in Stock -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Units in Stock</CardTitle>
          <Package class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ inventoryStats.totalUnits }}</div>
          <p class="text-xs text-muted-foreground">
            <span :class="inventoryStats.unitsChange > 0 ? 'text-green-500' : 'text-red-500'">
              <ArrowUp v-if="inventoryStats.unitsChange > 0" class="h-4 w-4 inline" />
              <ArrowDown v-else class="h-4 w-4 inline" />
              {{ Math.abs(inventoryStats.unitsChange) }}%
            </span>
            from previous month
          </p>
        </CardContent>
      </Card>

      <!-- Stock Status -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Stock Status</CardTitle>
          <AlertCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="flex items-center gap-3 text-sm">
            <div class="flex items-center">
              <div class="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
              <span>{{ inventoryStats.inStock }}</span>
            </div>
            <div class="flex items-center">
              <div class="h-3 w-3 rounded-full bg-yellow-500 mr-1"></div>
              <span>{{ inventoryStats.lowStock }}</span>
            </div>
            <div class="flex items-center">
              <div class="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
              <span>{{ inventoryStats.outOfStock }}</span>
            </div>
          </div>
          <div class="mt-3 text-xs text-muted-foreground">
            {{ inventoryStats.lowStock }} items below minimum levels
          </div>
        </CardContent>
      </Card>

      <!-- Inventory Turnover -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Inventory Turnover</CardTitle>
          <RefreshCw class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ inventoryStats.turnoverRatio.toFixed(1) }}x</div>
          <p class="text-xs text-muted-foreground">
            <span :class="inventoryStats.turnoverChange > 0 ? 'text-green-500' : 'text-red-500'">
              <ArrowUp v-if="inventoryStats.turnoverChange > 0" class="h-4 w-4 inline" />
              <ArrowDown v-else class="h-4 w-4 inline" />
              {{ Math.abs(inventoryStats.turnoverChange) }}%
            </span>
            from previous period
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Charts Section -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Stock Distribution by Location -->
      <Card>
        <CardHeader>
          <CardTitle>Stock Distribution by Location</CardTitle>
          <CardDescription>Inventory breakdown by storage location</CardDescription>
        </CardHeader>
        <CardContent class="h-[350px] relative">
          <div v-if="isLoading || !chartsLoaded" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <canvas ref="locationDistributionChart" v-show="chartsLoaded"></canvas>
        </CardContent>
      </Card>

      <!-- Stock Distribution by Category -->
      <Card>
        <CardHeader>
          <CardTitle>Stock Distribution by Category</CardTitle>
          <CardDescription>Inventory breakdown by product category</CardDescription>
        </CardHeader>
        <CardContent class="h-[350px] relative">
          <div v-if="isLoading || !chartsLoaded" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <canvas ref="categoryDistributionChart" v-show="chartsLoaded"></canvas>
        </CardContent>
      </Card>
    </div>

    <!-- KPI Cards Section -->
    <div class="grid gap-4 md:grid-cols-3">
      <!-- Days of Inventory Remaining -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Days of Inventory</CardTitle>
          <Calendar class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ inventoryStats.daysOfInventory }} days</div>
          <Progress :value="(inventoryStats.daysOfInventory / inventoryStats.targetDays) * 100" class="h-2 mt-2" />
          <p class="text-xs text-muted-foreground mt-2">
            Target: {{ inventoryStats.targetDays }} days
          </p>
        </CardContent>
      </Card>

      <!-- Stock Accuracy -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Stock Accuracy</CardTitle>
          <CheckSquare class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ inventoryStats.stockAccuracy }}%</div>
          <Progress :value="inventoryStats.stockAccuracy" class="h-2 mt-2" />
          <p class="text-xs text-muted-foreground mt-2">
            Based on last cycle count ({{ inventoryStats.lastCycleCount }})
          </p>
        </CardContent>
      </Card>

      <!-- Order Fulfillment Rate -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Order Fulfillment Rate</CardTitle>
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ inventoryStats.fulfillmentRate }}%</div>
          <Progress :value="inventoryStats.fulfillmentRate" class="h-2 mt-2" />
          <p class="text-xs text-muted-foreground mt-2">
            {{ inventoryStats.ordersCompleted }} of {{ inventoryStats.totalOrders }} orders fulfilled completely
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Alerts & Notifications Panel -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Alerts & Notifications</CardTitle>
            <CardDescription>Critical inventory alerts requiring attention</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter class="h-4 w-4 mr-2" />
                Filter
                <ChevronDown class="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem v-model="filterLowStock">
                Low Stock Alerts
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model="filterOverstock">
                Overstock Alerts
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model="filterExpiring">
                Expiring Items
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model="filterPendingOrders">
                Pending Orders
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div v-for="(alert, index) in filteredAlerts" :key="index" class="flex items-start space-x-4 p-3 rounded-md border">
            <div :class="`flex h-9 w-9 items-center justify-center rounded-full ${getAlertIconClass(alert.type)}`">
              <component :is="getAlertIcon(alert.type)" class="h-5 w-5 text-white" />
            </div>
            <div class="flex-1 space-y-1">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium">{{ alert.title }}</p>
                <span class="text-xs text-muted-foreground">{{ alert.time }}</span>
              </div>
              <p class="text-sm text-muted-foreground">{{ alert.description }}</p>
              <div class="flex items-center space-x-2 pt-1">
                <Badge :variant="getAlertVariant(alert.type)">{{ alert.tag }}</Badge>
                <Button size="sm" variant="ghost" class="h-8 px-2 text-xs">
                  View
                </Button>
                <Button size="sm" variant="ghost" class="h-8 px-2 text-xs">
                  Resolve
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Recent Transactions Panel -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Recent stock movements and adjustments</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter class="h-4 w-4 mr-2" />
                Filter
                <ChevronDown class="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem v-model="filterStockIn">
                Stock In
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model="filterStockOut">
                Stock Out
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model="filterAdjustments">
                Adjustments
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model="filterTransfers">
                Transfers
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>User</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="transaction in filteredTransactions" :key="transaction.id">
              <TableCell>
                <div class="text-sm">{{ transaction.date }}</div>
                <div class="text-xs text-muted-foreground">{{ transaction.time }}</div>
              </TableCell>
              <TableCell>
                <Badge :variant="getTransactionVariant(transaction.type)">
                  {{ transaction.type }}
                </Badge>
              </TableCell>
              <TableCell>{{ transaction.item }}</TableCell>
              <TableCell>
                <span :class="transaction.quantityChange > 0 ? 'text-green-500' : 'text-red-500'">
                  {{ transaction.quantityChange > 0 ? '+' : '' }}{{ transaction.quantityChange }}
                </span>
              </TableCell>
              <TableCell>{{ transaction.location }}</TableCell>
              <TableCell>{{ transaction.user }}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t px-6 py-4">
        <div className="text-xs text-muted-foreground">
          Showing <strong>10</strong> of <strong>{{ transactions.length }}</strong> transactions
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>

    <!-- Low Stock Items -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Critical Stock Levels</CardTitle>
            <CardDescription>Items below minimum threshold levels</CardDescription>
          </div>
          <Button size="sm">
            <ShoppingCart class="h-4 w-4 mr-2" />
            Create PO
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Min. Level</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Ordered</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in lowStockItems" :key="item.id">
              <TableCell>{{ item.name }}</TableCell>
              <TableCell>{{ item.category }}</TableCell>
              <TableCell>{{ item.stockLevel }}</TableCell>
              <TableCell>{{ item.minStockLevel }}</TableCell>
              <TableCell>{{ item.location }}</TableCell>
              <TableCell>
                <Badge :variant="getStockStatusVariant(item.status)">
                  {{ formatStockStatus(item.status) }}
                </Badge>
              </TableCell>
              <TableCell>{{ formatDate(item.lastOrdered) }}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  Reorder
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { format, parseISO } from 'date-fns'

// UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectValue, SelectTrigger, SelectContent, SelectItem
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuCheckboxItem, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

// Icons
import {
  DollarSign, Package, AlertCircle, RefreshCw, ArrowUp, ArrowDown,
  Calendar, CheckSquare, CheckCircle, Filter, ChevronDown,
  MoreHorizontal, ShoppingCart, ArchiveX, AlertOctagon, ClipboardCheck,
  Truck, MoveHorizontal, FileText, Eye, Edit, Trash2, Undo2, PackagePlus
} from 'lucide-vue-next'

// Import mock data
// Note: In a real application, you would fetch this from an API or store
import { mockInventoryData } from '@/mock/mockInventoryData'

// State
const isLoading = ref(false)
const selectedLocation = ref('all')
const chartsLoaded = ref(false)

// Chart refs
const locationDistributionChart = ref(null)
const categoryDistributionChart = ref(null)

// Chart instances
let locationChartInstance = null
let categoryChartInstance = null

// Filter states for alerts
const filterLowStock = ref(true)
const filterOverstock = ref(true)
const filterExpiring = ref(true)
const filterPendingOrders = ref(true)

// Filter states for transactions
const filterStockIn = ref(true)
const filterStockOut = ref(true)
const filterAdjustments = ref(true)
const filterTransfers = ref(true)

// Computed total items
const totalItems = computed(() => {
  return mockInventoryData.reduce((sum, item) => sum + item.stockLevel, 0)
})

// Mock data for inventory statistics
const inventoryStats = ref({
  totalValue: 27540.75,
  totalUnits: 150,
  inStock: 10,
  lowStock: 3,
  outOfStock: 0,
  valueChange: 5.2,
  unitsChange: 3.8,
  turnoverRatio: 4.5,
  turnoverChange: -1.2,
  daysOfInventory: 45,
  targetDays: 60,
  stockAccuracy: 97,
  lastCycleCount: '2023-07-15',
  fulfillmentRate: 95,
  ordersCompleted: 38,
  totalOrders: 40
})

// Mock alerts data
const alerts = ref([
  {
    type: 'low_stock',
    title: 'Low Stock Alert',
    description: 'Fiber Splice Kit is below minimum stock level (4 units available, 5 minimum)',
    time: '10 minutes ago',
    tag: 'Tools'
  },
  {
    type: 'low_stock',
    title: 'Low Stock Alert',
    description: 'Backup UPS is below minimum stock level (1 unit available, 2 minimum)',
    time: '25 minutes ago',
    tag: 'Power Equipment'
  },
  {
    type: 'pending_order',
    title: 'Pending Purchase Order',
    description: 'PO #4523 for 10x Wi-Fi 6 Routers has not been delivered. Expected: Jul 20',
    time: '1 hour ago',
    tag: 'Customer Premise Equipment'
  },
  {
    type: 'overstock',
    title: 'Overstock Warning',
    description: 'Fiber Patch Cable 50ft inventory exceeds optimal levels (42 units, 30 optimal)',
    time: '2 hours ago',
    tag: 'Cabling'
  },
  {
    type: 'pending_order',
    title: 'Order Ready for Fulfillment',
    description: 'Order #9876 for Residential Fiber ONT ready to be processed',
    time: '3 hours ago',
    tag: 'Network Termination'
  }
])

// Mock transactions data
const transactions = ref([
  {
    id: 1,
    date: '2023-07-24',
    time: '14:35',
    type: 'stock_in',
    item: 'Wi-Fi 6 Router',
    quantityChange: 10,
    location: 'Warehouse A',
    user: 'John Doe',
    reference: 'PO-45632'
  },
  {
    id: 2,
    date: '2023-07-24',
    time: '13:22',
    type: 'stock_out',
    item: 'Residential Fiber ONT',
    quantityChange: -1,
    location: 'Warehouse A',
    user: 'Mary Smith',
    reference: 'ORD-78901'
  },
  {
    id: 3,
    date: '2023-07-24',
    time: '11:05',
    type: 'adjustment',
    item: 'Fiber Patch Cable 50ft',
    quantityChange: -2,
    location: 'Warehouse A',
    user: 'Robert Jones',
    reference: 'ADJ-34521'
  },
  {
    id: 4,
    date: '2023-07-24',
    time: '09:47',
    type: 'transfer',
    item: 'Signal Analyzer',
    quantityChange: 0,
    location: 'Tool Storage → Service Van #5',
    user: 'David Ochieng',
    reference: 'TRF-67890'
  },
  {
    id: 5,
    date: '2023-07-23',
    time: '16:33',
    type: 'stock_in',
    item: 'Managed Switch',
    quantityChange: 5,
    location: 'Secure Storage B',
    user: 'John Doe',
    reference: 'PO-45580'
  },
  {
    id: 6,
    date: '2023-07-23',
    time: '14:15',
    type: 'stock_out',
    item: 'Business-class Router',
    quantityChange: -1,
    location: 'Secure Storage B',
    user: 'Mary Smith',
    reference: 'ORD-78890'
  },
  {
    id: 7,
    date: '2023-07-23',
    time: '11:22',
    type: 'adjustment',
    item: 'Signal Meter',
    quantityChange: 1,
    location: 'Tool Storage',
    user: 'Robert Jones',
    reference: 'ADJ-34510'
  },
  {
    id: 8,
    date: '2023-07-23',
    time: '09:08',
    type: 'transfer',
    item: 'Fiber Splice Kit',
    quantityChange: 0,
    location: 'Tool Storage → Service Van #3',
    user: 'Thomas Maina',
    reference: 'TRF-67850'
  },
  {
    id: 9,
    date: '2023-07-22',
    time: '15:40',
    type: 'stock_in',
    item: 'Residential Fiber ONT',
    quantityChange: 15,
    location: 'Warehouse A',
    user: 'John Doe',
    reference: 'PO-45530'
  },
  {
    id: 10,
    date: '2023-07-22',
    time: '13:15',
    type: 'stock_out',
    item: 'Fiber Cable 100ft',
    quantityChange: -2,
    location: 'Warehouse A',
    user: 'Mary Smith',
    reference: 'ORD-78850'
  }
])

// Get low stock items from mock data
const lowStockItems = computed(() => {
  return mockInventoryData.filter(item => item.status === 'low_stock')
})

// Format date
const formattedDate = computed(() => {
  return format(new Date(), 'MMMM d, yyyy')
})

// Filtered alerts based on selection
const filteredAlerts = computed(() => {
  return alerts.value.filter(alert => {
    if (alert.type === 'low_stock' && !filterLowStock.value) return false
    if (alert.type === 'overstock' && !filterOverstock.value) return false
    if (alert.type === 'expiring' && !filterExpiring.value) return false
    if (alert.type === 'pending_order' && !filterPendingOrders.value) return false
    return true
  })
})

// Filtered transactions based on selection
const filteredTransactions = computed(() => {
  return transactions.value.filter(transaction => {
    if (transaction.type === 'stock_in' && !filterStockIn.value) return false
    if (transaction.type === 'stock_out' && !filterStockOut.value) return false
    if (transaction.type === 'adjustment' && !filterAdjustments.value) return false
    if (transaction.type === 'transfer' && !filterTransfers.value) return false
    return true
  })
})

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Helper to format dates
const formatDate = (dateString) => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy')
  } catch (e) {
    return dateString
  }
}

// Helper to format stock status
const formatStockStatus = (status) => {
  switch (status) {
    case 'in_stock': return 'In Stock'
    case 'low_stock': return 'Low Stock'
    case 'out_of_stock': return 'Out of Stock'
    default: return status
  }
}

// Helper for alert icon
const getAlertIcon = (type) => {
  switch (type) {
    case 'low_stock': return AlertOctagon
    case 'overstock': return ArchiveX
    case 'expiring': return Calendar
    case 'pending_order': return ClipboardCheck
    default: return AlertCircle
  }
}

// Helper for alert icon class
const getAlertIconClass = (type) => {
  switch (type) {
    case 'low_stock': return 'bg-yellow-500'
    case 'overstock': return 'bg-blue-500'
    case 'expiring': return 'bg-orange-500'
    case 'pending_order': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

// Helper for alert variant
const getAlertVariant = (type) => {
  switch (type) {
    case 'low_stock': return 'warning'
    case 'overstock': return 'default'
    case 'expiring': return 'destructive'
    case 'pending_order': return 'secondary'
    default: return 'outline'
  }
}

// Helper for transaction variant
const getTransactionVariant = (type) => {
  switch (type) {
    case 'stock_in': return 'success'
    case 'stock_out': return 'destructive'
    case 'adjustment': return 'warning'
    case 'transfer': return 'secondary'
    default: return 'outline'
  }
}

// Helper for stock status variant
const getStockStatusVariant = (status) => {
  switch (status) {
    case 'in_stock': return 'success'
    case 'low_stock': return 'warning'
    case 'out_of_stock': return 'destructive'
    default: return 'outline'
  }
}

// Refresh data function
const refreshData = () => {
  isLoading.value = true
  
  // Simulate API call
  setTimeout(() => {
    // Update with slightly different values to simulate real data refresh
    inventoryStats.value = {
      ...inventoryStats.value,
      totalValue: inventoryStats.value.totalValue + (Math.random() * 500 - 250),
      totalUnits: inventoryStats.value.totalUnits + Math.floor(Math.random() * 5 - 2)
    }
    
    isLoading.value = false
  }, 1000)
}

// Initialize charts
const initializeCharts = async () => {
  try {
    // Dynamic import of Chart.js
    const ChartModule = await import('chart.js/auto')
    const Chart = ChartModule.default

    // Location distribution chart
    if (locationDistributionChart.value) {
      const ctx = locationDistributionChart.value.getContext('2d')
      locationChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Warehouse A', 'Secure Storage B', 'Tool Storage'],
          datasets: [{
            data: [65, 20, 15],
            backgroundColor: [
              '#3b82f6', // blue
              '#10b981', // green
              '#8b5cf6'  // purple
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 15,
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${percentage}% (${Math.round(inventoryStats.value.totalUnits * value / 100)} units)`;
                }
              }
            }
          }
        }
      })
    }

    // Category distribution chart
    if (categoryDistributionChart.value) {
      const ctx = categoryDistributionChart.value.getContext('2d')
      categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Network Termination', 'Customer Premise Equipment', 'Cabling', 'Tools', 'Power Equipment'],
          datasets: [{
            data: [30, 25, 20, 15, 10],
            backgroundColor: [
              '#3b82f6', // blue
              '#10b981', // green
              '#f59e0b', // amber
              '#8b5cf6', // purple
              '#ef4444'  // red
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 15,
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                  const percentage = Math.round((value / total) * 100);
                  const inventoryValue = Math.round(inventoryStats.value.totalValue * value / 100 / 1000);
                  return `${label}: ${percentage}% (KES ${inventoryValue}K)`;
                }
              }
            }
          },
          cutout: '60%'
        }
      })
    }

    chartsLoaded.value = true
  } catch (error) {
    console.error('Failed to initialize charts:', error)
  }
}

// Initialize on component mount
onMounted(() => {
  refreshData()
  setTimeout(() => {
    initializeCharts()
  }, 300) // Small delay to ensure DOM is ready
})

// Clean up on unmount
onUnmounted(() => {
  if (locationChartInstance) {
    locationChartInstance.destroy()
  }
  if (categoryChartInstance) {
    categoryChartInstance.destroy()
  }
})
</script>