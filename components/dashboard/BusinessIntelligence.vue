<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Header with date and filters -->
    <header class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Business Intelligence</h1>
          <p class="text-muted-foreground">
            {{ formattedDate }} • Data insights across {{ dataSourceCount }} modules
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Select v-model="selectedTimeframe">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="Last 30 Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last Quarter</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
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

    <!-- Top KPI Cards -->
    <div class="grid gap-4 md:grid-cols-4">
      <!-- Inventory Turnover Ratio -->
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
          <div class="text-2xl font-bold">{{ biStats.inventoryTurnover.toFixed(1) }}x</div>
          <p class="text-xs text-muted-foreground">
            <span :class="biStats.inventoryTurnoverChange > 0 ? 'text-green-500' : 'text-red-500'">
              <ArrowUp v-if="biStats.inventoryTurnoverChange > 0" class="h-4 w-4 inline" />
              <ArrowDown v-else class="h-4 w-4 inline" />
              {{ Math.abs(biStats.inventoryTurnoverChange) }}%
            </span>
            from previous period
          </p>
        </CardContent>
      </Card>

      <!-- Gross Margin ROI -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">GMROII</CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ biStats.gmroii.toFixed(2) }}</div>
          <p class="text-xs text-muted-foreground">
            <span :class="biStats.gmroiiChange > 0 ? 'text-green-500' : 'text-red-500'">
              <ArrowUp v-if="biStats.gmroiiChange > 0" class="h-4 w-4 inline" />
              <ArrowDown v-else class="h-4 w-4 inline" />
              {{ Math.abs(biStats.gmroiiChange) }}%
            </span>
            from previous period
          </p>
        </CardContent>
      </Card>

      <!-- On-Time Delivery Rate -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">On-Time Delivery</CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ biStats.onTimeDelivery }}%</div>
          <Progress :value="biStats.onTimeDelivery" class="h-2 mt-2" />
          <p class="text-xs text-muted-foreground mt-2">
            {{ biStats.ordersOnTime }} of {{ biStats.totalOrders }} orders delivered on time
          </p>
        </CardContent>
      </Card>

      <!-- Forecast Accuracy -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Forecast Accuracy</CardTitle>
          <BarChart class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ biStats.forecastAccuracy }}%</div>
          <Progress :value="biStats.forecastAccuracy" class="h-2 mt-2" />
          <p class="text-xs text-muted-foreground mt-2">
            {{ biStats.forecastCategory }} accuracy
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Cross-Module Analytics Charts -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Sales vs Inventory Correlation -->
      <Card>
        <CardHeader>
          <CardTitle>Sales vs Inventory Correlation</CardTitle>
          <CardDescription>Relationship between inventory levels and sales performance</CardDescription>
        </CardHeader>
        <CardContent class="h-[350px] relative">
          <div v-if="isLoading || !chartsLoaded" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <canvas ref="salesInventoryCorrelationChart" v-show="chartsLoaded"></canvas>
        </CardContent>
      </Card>

      <!-- Vendor Performance Analysis -->
      <Card>
        <CardHeader>
          <CardTitle>Vendor Performance Analysis</CardTitle>
          <CardDescription>Evaluation of vendor delivery times and cost efficiency</CardDescription>
        </CardHeader>
        <CardContent class="h-[350px] relative">
          <div v-if="isLoading || !chartsLoaded" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <canvas ref="vendorPerformanceChart" v-show="chartsLoaded"></canvas>
        </CardContent>
      </Card>
    </div>

    <!-- Profitability Analysis -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Profitability Analysis</CardTitle>
            <CardDescription>Profit margins by product, category, and location</CardDescription>
          </div>
          <Tabs v-model="profitabilityView" class="w-[400px]">
            <TabsList class="grid w-full grid-cols-3">
              <TabsTrigger value="product">By Product</TabsTrigger>
              <TabsTrigger value="category">By Category</TabsTrigger>
              <TabsTrigger value="location">By Location</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div class="h-[400px] relative">
          <div v-if="isLoading || !chartsLoaded" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <canvas ref="profitabilityChart" v-show="chartsLoaded"></canvas>
        </div>
      </CardContent>
    </Card>

    <!-- Forecasting & Predictive Analytics -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Demand Forecasting</CardTitle>
            <CardDescription>Projected demand for the next 12 weeks</CardDescription>
          </div>
          <Select v-model="selectedForecastCategory">
            <SelectTrigger class="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="cabling">Cabling</SelectItem>
              <SelectItem value="cpe">Customer Premise Equipment</SelectItem>
              <SelectItem value="networking">Network Termination</SelectItem>
              <SelectItem value="tools">Tools</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div class="h-[350px] relative">
          <div v-if="isLoading || !chartsLoaded" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <canvas ref="forecastChart" v-show="chartsLoaded"></canvas>
        </div>
      </CardContent>
    </Card>

    <!-- Anomaly Detection and Alerts -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Anomaly Detection</CardTitle>
            <CardDescription>Unusual patterns requiring attention</CardDescription>
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
              <DropdownMenuCheckboxItem v-model="filterStockAdjustments">
                Stock Adjustments
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model="filterReturns">
                Product Returns
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model="filterShrinkage">
                Inventory Shrinkage
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model="filterVendorDelays">
                Vendor Delays
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model="filterSalesDrops">
                Sales Drops
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div v-for="anomaly in filteredAnomalies" :key="anomaly.id" 
               class="flex items-start space-x-4 p-3 rounded-md border"
               :class="{ 'opacity-60': anomaly.isRead }">
            <div :class="`flex h-9 w-9 items-center justify-center rounded-full ${getAnomalyIconClass(anomaly.type)}`">
              <component :is="getAnomalyIcon(anomaly.type)" class="h-5 w-5 text-white" />
            </div>
            <div class="flex-1 space-y-1">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium">{{ anomaly.title }}</p>
                <span class="text-xs text-muted-foreground">{{ anomaly.time }}</span>
              </div>
              <p class="text-sm text-muted-foreground">{{ anomaly.description }}</p>
              <div class="flex items-center space-x-2 pt-1">
                <Badge :variant="getAnomalyVariant(anomaly.type)">{{ anomaly.severity }}</Badge>
                <Button size="sm" variant="ghost" class="h-8 px-2 text-xs" @click="investigateAnomaly(anomaly)">
                  Investigate
                </Button>
                <Button size="sm" variant="ghost" class="h-8 px-2 text-xs" @click="dismissAnomaly(anomaly)">
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
          <div v-if="filteredAnomalies.length === 0" class="p-8 text-center text-muted-foreground">
            No anomalies match your current filter settings
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Custom Reports -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Custom Reports</CardTitle>
            <CardDescription>Available reports and analytics</CardDescription>
          </div>
          <Button size="sm" @click="createNewReport">
            <PlusCircle class="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="report in customReports" :key="report.id">
              <TableCell>{{ report.name }}</TableCell>
              <TableCell>{{ report.module }}</TableCell>
              <TableCell>{{ report.lastRun }}</TableCell>
              <TableCell>
                <Badge :variant="getReportStatusVariant(report.status)">
                  {{ report.status }}
                </Badge>
              </TableCell>
              <TableCell>{{ report.schedule }}</TableCell>
              <TableCell>
                <div class="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" @click="runReport(report)" 
                          :disabled="report.status === 'In Progress'">
                    <Play class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="editReport(report)">
                    <Edit class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="downloadReport(report)" 
                          :disabled="report.status !== 'Completed'">
                    <Download class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  
    <!-- Report Edit Dialog -->
    <Dialog :open="showReportDialog" @update:open="showReportDialog = $event">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{ selectedReport ? 'Edit Report' : 'Create New Report' }}</DialogTitle>
          <DialogDescription>
            Modify report details and scheduling options
          </DialogDescription>
        </DialogHeader>
        <div v-if="selectedReport" class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="report-name" class="text-right">Name</Label>
            <Input id="report-name" v-model="selectedReport.name" class="col-span-3" />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="report-module" class="text-right">Module</Label>
            <Select v-model="selectedReport.module" class="col-span-3">
              <SelectTrigger id="report-module">
                <SelectValue :placeholder="selectedReport.module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inventory">Inventory</SelectItem>
                <SelectItem value="Procurement">Procurement</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="report-schedule" class="text-right">Schedule</Label>
            <Select v-model="selectedReport.schedule" class="col-span-3">
              <SelectTrigger id="report-schedule">
                <SelectValue :placeholder="selectedReport.schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Never">Never (Manual Run)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="report-format" class="text-right">Format</Label>
            <Select v-model="selectedReport.formatType" class="col-span-3">
              <SelectTrigger id="report-format">
                <SelectValue :placeholder="selectedReport.formatType" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="Excel">Excel</SelectItem>
                <SelectItem value="CSV">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="report-description" class="text-right">Description</Label>
            <Textarea id="report-description" v-model="selectedReport.description" class="col-span-3" />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="report-recipients" class="text-right">Recipients</Label>
            <Input id="report-recipients" 
                   v-model="recipientsString" 
                   placeholder="Enter email addresses separated by commas"
                   class="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showReportDialog = false">Cancel</Button>
          <Button @click="saveReportChanges" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Anomaly Investigation Dialog -->
    <Dialog :open="showAnomalyDialog" @update:open="showAnomalyDialog = $event">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Investigate Anomaly</DialogTitle>
          <DialogDescription>
            Review details and take action on this anomaly
          </DialogDescription>
        </DialogHeader>
        <div v-if="selectedAnomaly" class="space-y-4 py-4">
          <div class="flex items-start space-x-4">
            <div :class="`flex h-12 w-12 items-center justify-center rounded-full ${getAnomalyIconClass(selectedAnomaly.type)}`">
              <component :is="getAnomalyIcon(selectedAnomaly.type)" class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="text-lg font-medium">{{ selectedAnomaly.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ selectedAnomaly.time }}</p>
            </div>
            <Badge :variant="getAnomalyVariant(selectedAnomaly.type)" class="ml-auto">
              {{ selectedAnomaly.severity }}
            </Badge>
          </div>
          
          <div class="rounded-md bg-muted p-4">
            <p>{{ selectedAnomaly.description }}</p>
          </div>
          
          <div class="space-y-2">
            <h4 class="text-sm font-medium">Affected Items</h4>
            <div class="flex flex-wrap gap-2">
              <Badge variant="outline" v-for="item in selectedAnomaly.affectedItems" :key="item">
                {{ item }}
              </Badge>
            </div>
          </div>
          
          <div class="space-y-2">
            <h4 class="text-sm font-medium">Location</h4>
            <p class="text-sm">{{ selectedAnomaly.location }}</p>
          </div>
          
          <div class="space-y-2" v-if="selectedAnomaly.type === 'vendor_delay'">
            <h4 class="text-sm font-medium">Vendor</h4>
            <p class="text-sm">{{ getVendorName(selectedAnomaly.vendorId) }}</p>
          </div>
          
          <div class="rounded-md border p-4">
            <h4 class="text-sm font-medium mb-2">Action Notes</h4>
            <Textarea v-model="anomalyActionNotes" placeholder="Enter your investigation notes and action plan here..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showAnomalyDialog = false">Cancel</Button>
          <Button variant="destructive" @click="resolveAnomaly" v-if="selectedAnomaly">
            Mark as Resolved
          </Button>
          <Button @click="assignAnomaly" v-if="selectedAnomaly">
            Assign for Further Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { format, parseISO } from 'date-fns'

// Import mock data
import { 
  biStats as defaultBiStats, 
  anomaliesData, 
  reportsData, 
  vendorPerformanceData, 
  profitabilityData, 
  correlationData, 
  forecastData,
  timeframeData
} from '@/mock/mockBusinessIntelligence'

// UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectValue, SelectTrigger, SelectContent, SelectItem
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuCheckboxItem, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'

// Icons
import {
  RefreshCw, TrendingUp, Clock, BarChart, ArrowUp, ArrowDown,
  Filter, ChevronDown, PlusCircle, Play, Download, Edit,
  AlertTriangle, AlertOctagon, Truck, TrendingDown, LineChart,
  PieChart, DollarSign, Activity, ShoppingCart, Package,
  Loader2, CheckCircle
} from 'lucide-vue-next'

// Get toast
const { toast } = useToast()

// State
const isLoading = ref(false)
const chartsLoaded = ref(false)
const selectedTimeframe = ref('30')
const selectedForecastCategory = ref('all')
const profitabilityView = ref('product')
const dataSourceCount = ref(4) // Number of data modules integrated
const showReportDialog = ref(false)
const selectedReport = ref(null)
const showAnomalyDialog = ref(false)
const selectedAnomaly = ref(null)
const anomalyActionNotes = ref('')

// Chart refs
const salesInventoryCorrelationChart = ref(null)
const vendorPerformanceChart = ref(null)
const profitabilityChart = ref(null)
const forecastChart = ref(null)

// Chart instances
let salesInventoryChartInstance = null
let vendorPerformanceChartInstance = null
let profitabilityChartInstance = null
let forecastChartInstance = null

// Filter states for anomalies
const filterStockAdjustments = ref(true)
const filterReturns = ref(true)
const filterShrinkage = ref(true)
const filterVendorDelays = ref(true)
const filterSalesDrops = ref(true)

// Data
const anomalies = ref(JSON.parse(JSON.stringify(anomaliesData)))
const customReports = ref(JSON.parse(JSON.stringify(reportsData)))

// Format current date
const formattedDate = computed(() => {
  return format(new Date(), 'MMMM d, yyyy')
})

// Get KPI stats based on selected timeframe
const biStats = computed(() => {
  return timeframeData[selectedTimeframe.value] || timeframeData['30']
})

// Recipient emails string for the form (convert array to comma-separated string for UI)
const recipientsString = computed({
  get: () => {
    return selectedReport.value?.recipients?.join(', ') || ''
  },
  set: (value) => {
    if (selectedReport.value) {
      selectedReport.value.recipients = value.split(',').map(email => email.trim()).filter(Boolean)
    }
  }
})

// Filtered anomalies based on selection
const filteredAnomalies = computed(() => {
  return anomalies.value.filter(anomaly => {
    if (anomaly.type === 'stock_adjustment' && !filterStockAdjustments.value) return false
    if (anomaly.type === 'returns' && !filterReturns.value) return false
    if (anomaly.type === 'shrinkage' && !filterShrinkage.value) return false
    if (anomaly.type === 'vendor_delay' && !filterVendorDelays.value) return false
    if (anomaly.type === 'sales_drop' && !filterSalesDrops.value) return false
    return true
  })
})

// Helper to format dates
const formatDate = (dateString) => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy')
  } catch (e) {
    return dateString
  }
}

// Helper for anomaly icon
const getAnomalyIcon = (type) => {
  switch (type) {
    case 'stock_adjustment': return AlertTriangle
    case 'returns': return TrendingDown
    case 'shrinkage': return AlertOctagon
    case 'vendor_delay': return Truck
    case 'sales_drop': return TrendingDown
    default: return AlertTriangle
  }
}

// Helper for anomaly icon class
const getAnomalyIconClass = (type) => {
  switch (type) {
    case 'stock_adjustment': return 'bg-yellow-500'
    case 'returns': return 'bg-orange-500'
    case 'shrinkage': return 'bg-red-500'
    case 'vendor_delay': return 'bg-purple-500'
    case 'sales_drop': return 'bg-blue-500'
    default: return 'bg-gray-500'
  }
}

// Helper for anomaly variant
const getAnomalyVariant = (type) => {
  switch (type) {
    case 'stock_adjustment': return 'warning'
    case 'returns': return 'warning'
    case 'shrinkage': return 'destructive'
    case 'vendor_delay': return 'secondary'
    case 'sales_drop': return 'default'
    default: return 'outline'
  }
}

// Helper for report status variant
const getReportStatusVariant = (status) => {
  switch (status) {
    case 'Completed': return 'success'
    case 'In Progress': return 'secondary'
    case 'Failed': return 'destructive'
    case 'Scheduled': return 'outline'
    default: return 'outline'
  }
}

// Helper to get vendor name from ID
const getVendorName = (vendorId) => {
  const vendor = vendorPerformanceData.find(v => v.id === vendorId)
  return vendor ? vendor.name : 'Unknown Vendor'
}

// Refresh data function
const refreshData = () => {
  isLoading.value = true
  
  // Simulate API call
  setTimeout(() => {
    // Update charts if needed
    if (forecastChartInstance) {
      const categoryData = forecastData[selectedForecastCategory.value] || forecastData.all
      
      forecastChartInstance.data.datasets[0].data = categoryData.historical
      forecastChartInstance.data.datasets[1].data = categoryData.forecast
      forecastChartInstance.data.datasets[2].data = categoryData.upperBound
      forecastChartInstance.data.datasets[3].data = categoryData.lowerBound
      forecastChartInstance.update()
    }
    
    isLoading.value = false
    
    toast({
      title: "Data Refreshed",
      description: "Latest business intelligence metrics have been loaded.",
      variant: "default"
    })
  }, 1000)
}

// Report actions
const createNewReport = () => {
  selectedReport.value = {
    id: customReports.value.length + 1,
    name: "New Report",
    module: "Inventory",
    lastRun: "",
    status: "Scheduled",
    schedule: "Monthly",
    createdBy: "Current User",
    description: "Description of the report",
    formatType: "PDF",
    recipients: [],
    parameters: {
      dateRange: 'Last Month',
      locations: ['All Locations'],
      categories: ['All Categories']
    }
  }
  showReportDialog.value = true
}

const editReport = (report) => {
  selectedReport.value = JSON.parse(JSON.stringify(report))
  showReportDialog.value = true
}

const saveReportChanges = () => {
  isLoading.value = true
  
  // Simulate API call
  setTimeout(() => {
    if (selectedReport.value.id) {
      // Update existing report
      const index = customReports.value.findIndex(r => r.id === selectedReport.value.id)
      if (index !== -1) {
        customReports.value[index] = selectedReport.value
      } else {
        // Add new report
        customReports.value.push(selectedReport.value)
      }
    }
    
    showReportDialog.value = false
    isLoading.value = false
    
    toast({
      title: "Report Saved",
      description: `${selectedReport.value.name} has been updated successfully.`,
      variant: "success"
    })
  }, 800)
}

const runReport = (report) => {
  isLoading.value = true
  
  // Update report status
  const index = customReports.value.findIndex(r => r.id === report.id)
  if (index !== -1) {
    customReports.value[index].status = 'In Progress'
  }
  
  // Simulate API call
  setTimeout(() => {
    // Update report last run date
    if (index !== -1) {
      customReports.value[index].lastRun = format(new Date(), 'yyyy-MM-dd')
      customReports.value[index].status = 'Completed'
    }
    
    isLoading.value = false
    
    toast({
      title: "Report Generated",
      description: `${report.name} has been successfully executed.`,
      variant: "success"
    })
  }, 2000)
}

const downloadReport = (report) => {
  // Simulate download
  const link = document.createElement('a')
  link.href = '#'
  link.download = `${report.name.toLowerCase().replace(/ /g, '_')}.${report.formatType.toLowerCase()}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  toast({
    title: "Report Downloaded",
    description: `${report.name} has been downloaded in ${report.formatType} format.`,
    variant: "success"
  })
}

// Anomaly actions
const investigateAnomaly = (anomaly) => {
  selectedAnomaly.value = JSON.parse(JSON.stringify(anomaly))
  anomalyActionNotes.value = ''
  showAnomalyDialog.value = true
}

const dismissAnomaly = (anomaly) => {
  // Mark anomaly as read
  const index = anomalies.value.findIndex(a => a.id === anomaly.id)
  if (index !== -1) {
    anomalies.value[index].isRead = true
  }
  
  toast({
    title: "Anomaly Dismissed",
    description: `${anomaly.title} has been marked as read.`,
    variant: "success"
  })
}

const resolveAnomaly = () => {
  if (!selectedAnomaly.value) return
  
  isLoading.value = true
  
  // Simulate API call
  setTimeout(() => {
    // Remove anomaly from list
    const index = anomalies.value.findIndex(a => a.id === selectedAnomaly.value.id)
    if (index !== -1) {
      anomalies.value.splice(index, 1)
    }
    
    showAnomalyDialog.value = false
    isLoading.value = false
    
    toast({
      title: "Anomaly Resolved",
      description: `${selectedAnomaly.value.title} has been marked as resolved.`,
      variant: "success"
    })
  }, 800)
}

const assignAnomaly = () => {
  if (!selectedAnomaly.value) return
  
  isLoading.value = true
  
  // Simulate API call
  setTimeout(() => {
    // Mark anomaly as assigned
    const index = anomalies.value.findIndex(a => a.id === selectedAnomaly.value.id)
    if (index !== -1) {
      anomalies.value[index].isAssigned = true
      anomalies.value[index].assignedNotes = anomalyActionNotes.value
    }
    
    showAnomalyDialog.value = false
    isLoading.value = false
    
    toast({
      title: "Anomaly Assigned",
      description: `${selectedAnomaly.value.title} has been assigned for further review.`,
      variant: "success"
    })
  }, 800)
}

// Initialize charts
const initializeCharts = async () => {
  try {
    // Dynamic import of Chart.js
    const ChartModule = await import('chart.js/auto')
    const Chart = ChartModule.default

    // Sales vs Inventory Correlation Chart
    if (salesInventoryCorrelationChart.value) {
      const ctx = salesInventoryCorrelationChart.value.getContext('2d')
      salesInventoryChartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Product Categories',
            data: correlationData,
            backgroundColor: [
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#8b5cf6',
              '#ef4444'
            ],
            pointRadius: 10,
            pointHoverRadius: 12
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Inventory Level (units)'
              },
              ticks: {
                callback: function(value) {
                  return value + ' u';
                }
              }
            },
            y: {
              title: {
                display: true,
                text: 'Sales Performance (%)'
              },
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  const point = context.raw;
                  return `${point.category}: ${point.x} units, ${point.y}% sales rate`;
                }
              }
            },
            legend: {
              display: false
            }
          }
        }
      })
    }

    // Vendor Performance Chart
    if (vendorPerformanceChart.value) {
      const ctx = vendorPerformanceChart.value.getContext('2d')
      vendorPerformanceChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: vendorPerformanceData.map(vendor => vendor.name),
          datasets: [
            {
              label: 'Delivery Time (days)',
              data: vendorPerformanceData.map(vendor => vendor.deliveryTime),
              backgroundColor: '#3b82f6',
              yAxisID: 'y'
            },
            {
              label: 'Cost Efficiency (0-100)',
              data: vendorPerformanceData.map(vendor => vendor.costEfficiency),
              backgroundColor: '#10b981',
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              type: 'linear',
              position: 'left',
              title: {
                display: true,
                text: 'Avg. Delivery Time (days)'
              },
              min: 0
            },
            y1: {
              type: 'linear',
              position: 'right',
              title: {
                display: true,
                text: 'Cost Efficiency Score'
              },
              min: 0,
              max: 100,
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      })
    }

    // Profitability Chart
    if (profitabilityChart.value) {
      const updateProfitabilityChart = () => {
        if (profitabilityChartInstance) {
          profitabilityChartInstance.destroy();
        }

        const ctx = profitabilityChart.value.getContext('2d');
        const currentView = profitabilityView.value;
        const data = profitabilityData[currentView];
        
        profitabilityChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.map(item => item.name),
            datasets: [{
              label: 'Gross Profit Margin (%)',
              data: data.map(item => item.margin),
              backgroundColor: [
                '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Margin (%)'
                },
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  }
                }
              }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `Profit Margin: ${context.raw}%`;
                  }
                }
              }
            }
          }
        });
      };

      // Initial render
      updateProfitabilityChart();

      // Watch for changes in view type
      watch(profitabilityView, () => {
        updateProfitabilityChart();
      });
    }

    // Forecast Chart
    if (forecastChart.value) {
      const updateForecastChart = () => {
        if (forecastChartInstance) {
          forecastChartInstance.destroy();
        }

        const ctx = forecastChart.value.getContext('2d');
        const categoryData = forecastData[selectedForecastCategory.value] || forecastData.all;
        
        forecastChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
            datasets: [
              {
                label: 'Historical Demand',
                data: categoryData.historical,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
              },
              {
                label: 'Forecasted Demand',
                data: categoryData.forecast,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderDash: [5, 5],
                borderWidth: 2,
                fill: false,
                tension: 0.1
              },
              {
                label: 'Confidence Interval (Upper)',
                data: categoryData.upperBound,
                borderColor: 'rgba(16, 185, 129, 0.3)',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                borderWidth: 1,
                pointRadius: 0,
                fill: '+1'
              },
              {
                label: 'Confidence Interval (Lower)',
                data: categoryData.lowerBound,
                borderColor: 'rgba(16, 185, 129, 0.3)',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                borderWidth: 1,
                pointRadius: 0,
                fill: false
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                title: {
                  display: true,
                  text: 'Units'
                },
                beginAtZero: false
              }
            },
            plugins: {
              tooltip: {
                mode: 'index',
                intersect: false
              },
              legend: {
                position: 'top',
                labels: {
                  filter: function(legendItem, data) {
                    // Hide confidence interval legend items
                    return !legendItem.text.includes('Confidence');
                  }
                }
              },
              filler: {
                propagate: false
              }
            }
          }
        });
      };
      
      // Initial render
      updateForecastChart();
      
      // Watch for forecast category changes
      watch(selectedForecastCategory, () => {
        isLoading.value = true;
        setTimeout(() => {
          updateForecastChart();
          isLoading.value = false;
        }, 800);
      });
    }

    chartsLoaded.value = true
  } catch (error) {
    console.error('Failed to initialize charts:', error)
    toast({
      title: "Chart Error",
      description: "Failed to initialize charts. Please refresh the page.",
      variant: "destructive"
    })
  }
}

// Watch for timeframe changes
watch(selectedTimeframe, () => {
  isLoading.value = true
  
  // Simulate API call delay
  setTimeout(() => {
    isLoading.value = false
    
    toast({
      title: "Timeframe Updated",
      description: `Data now showing for ${timeframeData[selectedTimeframe.value]?.title || 'selected period'}.`,
      variant: "default"
    })
  }, 800)
})

// Initialize on component mount
onMounted(() => {
  refreshData()
  setTimeout(() => {
    initializeCharts()
  }, 300) // Small delay to ensure DOM is ready
})

// Clean up on unmount
onUnmounted(() => {
  if (salesInventoryChartInstance) {
    salesInventoryChartInstance.destroy()
  }
  if (vendorPerformanceChartInstance) {
    vendorPerformanceChartInstance.destroy()
  }
  if (profitabilityChartInstance) {
    profitabilityChartInstance.destroy()
  }
  if (forecastChartInstance) {
    forecastChartInstance.destroy()
  }
})
</script>