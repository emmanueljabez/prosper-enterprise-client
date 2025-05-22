<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Header with date and actions -->
    <header class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Receiving Dashboard</h1>
          <p class="text-muted-foreground">
            {{ formattedDate }} • {{ totalShipments }} shipments tracked
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="refreshData" :disabled="isLoading">
            <RefreshCw v-if="!isLoading" class="h-4 w-4 mr-2" />
            <Loader2 v-else class="h-4 w-4 mr-2 animate-spin" />
            Refresh
          </Button>
          <Button>
            <Download class="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </header>

    <!-- KPI Cards -->
    <div class="grid gap-4 md:grid-cols-4">
      <!-- Expected Arrivals Today -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Expected Today</CardTitle>
          <TruckIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ kpiData.arrivingToday }}</div>
          <p class="text-xs text-muted-foreground">
            {{ kpiData.arrivingToday === 1 ? 'shipment' : 'shipments' }} scheduled today
          </p>
          <div class="mt-4 flex items-center gap-2 text-xs">
            <span :class="kpiData.arrivingTodayChange >= 0 ? 'text-green-500' : 'text-red-500'" class="flex items-center">
              <component :is="kpiData.arrivingTodayChange >= 0 ? ArrowUp : ArrowDown" class="h-3 w-3 mr-1" />
              {{ Math.abs(kpiData.arrivingTodayChange) }}%
            </span>
            <span class="text-muted-foreground">vs. yesterday</span>
          </div>
        </CardContent>
      </Card>

      <!-- In Transit -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">In Transit</CardTitle>
          <Route class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ kpiData.inTransit }}</div>
          <p class="text-xs text-muted-foreground">
            {{ kpiData.inTransit === 1 ? 'shipment' : 'shipments' }} currently in transit
          </p>
          <div class="mt-4">
            <Progress :value="kpiData.inTransitPercentage" class="h-2" />
            <p class="mt-1 text-xs text-muted-foreground">{{kpiData.inTransitPercentage}}% of open orders</p>
          </div>
        </CardContent>
      </Card>

      <!-- Pending Quality Checks -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Pending QC</CardTitle>
          <ClipboardCheck class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ kpiData.pendingQC }}</div>
          <p class="text-xs text-muted-foreground">
            {{ kpiData.pendingQC === 1 ? 'item' : 'items' }} awaiting quality inspection
          </p>
          <div class="mt-4 grid grid-cols-3 gap-1 text-xs">
            <div>
              <div class="font-medium">{{ kpiData.highPriorityQC }}</div>
              <p class="text-muted-foreground">High</p>
            </div>
            <div>
              <div class="font-medium">{{ kpiData.mediumPriorityQC }}</div>
              <p class="text-muted-foreground">Medium</p>
            </div>
            <div>
              <div class="font-medium">{{ kpiData.lowPriorityQC }}</div>
              <p class="text-muted-foreground">Low</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Putaway Tasks -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Putaway Tasks</CardTitle>
          <PackageCheck class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ kpiData.pendingPutaway }}</div>
          <p class="text-xs text-muted-foreground">
            {{ kpiData.pendingPutaway === 1 ? 'task' : 'tasks' }} requiring completion
          </p>
          <div class="mt-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted-foreground">Completion rate</span>
              <span class="font-medium">{{ kpiData.putawayCompletionRate }}%</span>
            </div>
            <Progress :value="kpiData.putawayCompletionRate" class="h-2 mt-1" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Scheduled Arrivals -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Upcoming Arrivals</CardTitle>
            <CardDescription>Expected shipments in the next 7 days</CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <Select v-model="locationFilter">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="loc-001">Warehouse A</SelectItem>
                <SelectItem value="loc-002">Secure Storage B</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter class="h-4 w-4 mr-2" />
                  Filter
                  <ChevronDown class="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem v-model="filterScheduled">
                  Scheduled
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem v-model="filterInTransit">
                  In Transit
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem v-model="filterHighPriority">
                  High Priority
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expected Arrival</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="shipment in filteredUpcomingShipments" :key="shipment.id">
              <TableCell>{{ shipment.poNumber }}</TableCell>
              <TableCell>{{ shipment.supplierName }}</TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(shipment.status)">
                  {{ formatStatus(shipment.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="font-medium">{{ formatDate(shipment.expectedArrival) }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ getRelativeTime(shipment.expectedArrival) }}
                </div>
              </TableCell>
              <TableCell>{{ shipment.totalItems }} ({{ shipment.totalQuantity }} units)</TableCell>
              <TableCell>
                <Badge 
                  :variant="shipment.priority === 'high' ? 'destructive' : (shipment.priority === 'normal' ? 'default' : 'outline')"
                >
                  {{ shipment.priority }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal class="h-4 w-4" />
                      <span class="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="viewShipmentDetails(shipment)">
                      <Eye class="mr-2 h-4 w-4" />
                      <span>View Details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil class="mr-2 h-4 w-4" />
                      <span>Update Status</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem v-if="shipment.status === 'in_transit'">
                      <CheckCircle class="mr-2 h-4 w-4" />
                      <span>Mark as Received</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <FileText class="mr-2 h-4 w-4" />
                      <span>Print Documents</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="filteredUpcomingShipments.length === 0">
              <TableCell colspan="7" class="h-24 text-center">
                No upcoming shipments found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Recently Received -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Recently Received</CardTitle>
            <CardDescription>Shipments received in the last 7 days</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <History class="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received Date</TableHead>
              <TableHead>Received By</TableHead>
              <TableHead>Quality Check</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="shipment in receivedShipments" :key="shipment.id">
              <TableCell>{{ shipment.poNumber }}</TableCell>
              <TableCell>{{ shipment.supplierName }}</TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(shipment.status)">
                  {{ formatStatus(shipment.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="font-medium">{{ formatDate(shipment.actualArrival) }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ getRelativeTime(shipment.actualArrival) }}
                </div>
              </TableCell>
              <TableCell>{{ shipment.receivedBy }}</TableCell>
              <TableCell>
                <Badge 
                  v-for="item in shipment.items" 
                  :key="item.itemId"
                  :variant="getQcStatusVariant(item.qualityCheckStatus)"
                  class="mr-1 mb-1"
                >
                  {{ formatQcStatus(item.qualityCheckStatus) }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal class="h-4 w-4" />
                      <span class="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="viewShipmentDetails(shipment)">
                      <Eye class="mr-2 h-4 w-4" />
                      <span>View Details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText class="mr-2 h-4 w-4" />
                      <span>Receipt Documents</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem v-if="shipment.status === 'exception'">
                      <AlertTriangle class="mr-2 h-4 w-4" />
                      <span>View Exceptions</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="receivedShipments.length === 0">
              <TableCell colspan="7" class="h-24 text-center">
                No recently received shipments found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Split View: Quality Inspections and Putaway Tasks -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Quality Inspections -->
      <Card>
        <CardHeader>
          <CardTitle>Quality Inspections</CardTitle>
          <CardDescription>Pending inspection tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            <div v-for="inspection in qualityInspections" :key="inspection.id" class="flex items-start space-x-4 p-3 border rounded-md">
              <div :class="`flex h-9 w-9 items-center justify-center rounded-full ${getInspectionPriorityClass(inspection.priority)}`">
                <ClipboardCheck class="h-5 w-5 text-white" />
              </div>
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium">{{ inspection.itemName }}</p>
                  <Badge :variant="getInspectionPriorityVariant(inspection.priority)">
                    {{ inspection.priority }}
                  </Badge>
                </div>
                <p class="text-xs text-muted-foreground">PO: {{ inspection.poNumber }}</p>
                <p class="text-xs text-muted-foreground">Type: {{ inspection.inspectionType }}</p>
                <div class="pt-2 flex items-center justify-between">
                  <div class="text-xs text-muted-foreground">
                    Due: {{ formatDate(inspection.dueDate) }}
                  </div>
                  <div class="flex items-center space-x-2">
                    <Button size="sm" variant="outline" class="h-8">
                      Assign
                    </Button>
                    <Button size="sm" class="h-8">
                      Start
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="qualityInspections.length === 0" class="text-center py-8">
              <ClipboardCheck class="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
              <p class="text-sm text-muted-foreground mt-2">No pending quality inspections</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Putaway Tasks -->
      <Card>
        <CardHeader>
          <CardTitle>Putaway Tasks</CardTitle>
          <CardDescription>Items awaiting putaway assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            <div v-for="task in putawayTasks" :key="task.id" class="flex items-start space-x-4 p-3 border rounded-md">
              <div :class="`flex h-9 w-9 items-center justify-center rounded-full ${getPutawayPriorityClass(task.priority)}`">
                <PackageCheck class="h-5 w-5 text-white" />
              </div>
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium">{{ task.locationId }}</p>
                  <Badge :variant="getPutawayStatusVariant(task.status)">
                    {{ formatPutawayStatus(task.status) }}
                  </Badge>
                </div>
                <p class="text-xs text-muted-foreground">
                  {{ task.items.length }} {{ task.items.length === 1 ? 'item' : 'items' }} • 
                  {{ getTotalQuantity(task) }} units
                </p>
                <div class="pt-2 flex items-center justify-between">
                  <div class="text-xs text-muted-foreground">
                    Created: {{ formatDate(task.createdAt) }}
                  </div>
                  <div class="flex items-center space-x-2">
                    <Button size="sm" variant="outline" class="h-8" 
                           :disabled="task.status !== 'pending'">
                      Assign
                    </Button>
                    <Button size="sm" class="h-8" 
                           :disabled="task.status !== 'pending'">
                      Start
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="putawayTasks.length === 0" class="text-center py-8">
              <PackageCheck class="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
              <p class="text-sm text-muted-foreground mt-2">No pending putaway tasks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format, formatDistance, parseISO } from 'date-fns'

// UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
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
  RefreshCw, Download, TruckIcon, Route, ClipboardCheck, PackageCheck,
  Filter, ChevronDown, History, MoreHorizontal, Eye, Pencil, FileText,
  CheckCircle, AlertTriangle, Loader2, ArrowUp, ArrowDown
} from 'lucide-vue-next'

// Import mock data
import { 
  mockIncomingShipments, 
  mockQualityInspections, 
  mockPutawayTasks 
} from '@/mock/mockWarehouseData.js'

// Toast notifications
const { toast } = useToast()

// State
const isLoading = ref(false)
const locationFilter = ref('all')
const filterScheduled = ref(true)
const filterInTransit = ref(true)
const filterHighPriority = ref(true)

// Computed data
const formattedDate = computed(() => {
  return format(new Date(), 'MMMM d, yyyy')
})

const totalShipments = computed(() => {
  return mockIncomingShipments.length
})

// Calculate KPI data
const kpiData = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const arrivingToday = mockIncomingShipments.filter(shipment => {
    const arrivalDate = new Date(shipment.expectedArrival)
    arrivalDate.setHours(0, 0, 0, 0)
    return arrivalDate.getTime() === today.getTime() && (shipment.status === 'scheduled' || shipment.status === 'in_transit')
  }).length
  
  const inTransit = mockIncomingShipments.filter(shipment => 
    shipment.status === 'in_transit'
  ).length
  
  const totalOpen = mockIncomingShipments.filter(shipment => 
    shipment.status === 'scheduled' || shipment.status === 'in_transit'
  ).length
  
  const inTransitPercentage = totalOpen ? Math.round((inTransit / totalOpen) * 100) : 0
  
  const pendingQC = mockQualityInspections.filter(inspection => 
    inspection.status === 'pending'
  ).length
  
  const highPriorityQC = mockQualityInspections.filter(inspection => 
    inspection.status === 'pending' && inspection.priority === 'high'
  ).length
  
  const mediumPriorityQC = mockQualityInspections.filter(inspection => 
    inspection.status === 'pending' && inspection.priority === 'medium'
  ).length
  
  const lowPriorityQC = mockQualityInspections.filter(inspection => 
    inspection.status === 'pending' && (inspection.priority === 'low' || !inspection.priority)
  ).length
  
  const pendingPutaway = mockPutawayTasks.filter(task => 
    task.status === 'pending' || task.status === 'in_progress'
  ).length
  
  // Calculate putaway completion rate
  const totalPutawayTasks = mockPutawayTasks.length
  const completedPutawayTasks = mockPutawayTasks.filter(task => task.status === 'completed').length
  const putawayCompletionRate = totalPutawayTasks ? Math.round((completedPutawayTasks / totalPutawayTasks) * 100) : 0
  
  return {
    arrivingToday,
    // Mock value for demo
    arrivingTodayChange: 20,
    inTransit,
    inTransitPercentage,
    pendingQC,
    highPriorityQC,
    mediumPriorityQC,
    lowPriorityQC,
    pendingPutaway,
    putawayCompletionRate
  }
})

// Filter upcoming shipments
const filteredUpcomingShipments = computed(() => {
  // Get current date
  const now = new Date()
  // Get date 7 days from now
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
  
  return mockIncomingShipments.filter(shipment => {
    // Check date range
    const arrivalDate = new Date(shipment.expectedArrival)
    const isInDateRange = arrivalDate >= now && arrivalDate <= sevenDaysFromNow
    
    // Apply location filter
    const matchesLocation = locationFilter.value === 'all' || 
                           shipment.destinationLocationId === locationFilter.value
    
    // Apply status filters
    const matchesStatus = (shipment.status === 'scheduled' && filterScheduled.value) ||
                          (shipment.status === 'in_transit' && filterInTransit.value)
    
    // Apply priority filter                    
    const matchesPriority = !filterHighPriority.value || 
                           (filterHighPriority.value && shipment.priority === 'high')
    
    return isInDateRange && matchesLocation && matchesStatus && matchesPriority
  }).sort((a, b) => {
    // Sort by expected arrival date (ascending)
    return new Date(a.expectedArrival) - new Date(b.expectedArrival)
  })
})

// Get recently received shipments
const receivedShipments = computed(() => {
  // Get date 7 days ago
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  return mockIncomingShipments.filter(shipment => {
    // Only include received or exception status shipments
    return (shipment.status === 'received' || shipment.status === 'completed' || 
            shipment.status === 'exception') && 
           // Filter by location if needed
           (locationFilter.value === 'all' || shipment.destinationLocationId === locationFilter.value) &&
           // Only include those received in last 7 days
           shipment.actualArrival && new Date(shipment.actualArrival) >= sevenDaysAgo
  }).sort((a, b) => {
    // Sort by actual arrival date (descending)
    return new Date(b.actualArrival) - new Date(a.actualArrival)
  })
})

// Get quality inspection tasks
const qualityInspections = computed(() => {
  return mockQualityInspections.filter(inspection => 
    inspection.status === 'pending' &&
    (locationFilter.value === 'all' || true) // We don't have location in inspection model
  ).sort((a, b) => {
    // Sort by priority (high first) then by due date
    if (a.priority === 'high' && b.priority !== 'high') return -1
    if (a.priority !== 'high' && b.priority === 'high') return 1
    return new Date(a.dueDate) - new Date(b.dueDate)
  }).slice(0, 3) // Limit to 3 for UI
})

// Get putaway tasks
const putawayTasks = computed(() => {
  return mockPutawayTasks.filter(task => 
    (task.status === 'pending' || task.status === 'in_progress') &&
    (locationFilter.value === 'all' || task.locationId === locationFilter.value)
  ).sort((a, b) => {
    // Sort by priority (high first) then by creation date
    if (a.priority === 'high' && b.priority !== 'high') return -1
    if (a.priority !== 'high' && b.priority === 'high') return 1
    return new Date(a.createdAt) - new Date(b.createdAt)
  }).slice(0, 3) // Limit to 3 for UI
})

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return '—'
  return format(parseISO(dateString), 'MMM d, yyyy')
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  return format(parseISO(dateString), 'h:mm a')
}

const getRelativeTime = (dateString) => {
  if (!dateString) return ''
  return formatDistance(parseISO(dateString), new Date(), { addSuffix: true })
}

const formatStatus = (status) => {
  const statusMap = {
    'scheduled': 'Scheduled',
    'in_transit': 'In Transit',
    'received': 'Received',
    'completed': 'Completed',
    'exception': 'Exception'
  }
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

const formatQcStatus = (status) => {
  const statusMap = {
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'passed': 'Passed',
    'failed': 'Failed'
  }
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

const formatPutawayStatus = (status) => {
  const statusMap = {
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'completed': 'Completed'
  }
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

const getStatusVariant = (status) => {
  const variantMap = {
    'scheduled': 'outline',
    'in_transit': 'default',
    'received': 'success',
    'completed': 'success',
    'exception': 'destructive'
  }
  return variantMap[status] || 'outline'
}

const getQcStatusVariant = (status) => {
  const variantMap = {
    'pending': 'outline',
    'in_progress': 'default',
    'passed': 'success',
    'failed': 'destructive'
  }
  return variantMap[status] || 'outline'
}

const getPutawayStatusVariant = (status) => {
  const variantMap = {
    'pending': 'outline',
    'in_progress': 'default',
    'completed': 'success'
  }
  return variantMap[status] || 'outline'
}

const getInspectionPriorityClass = (priority) => {
  const classMap = {
    'high': 'bg-red-500',
    'medium': 'bg-amber-500',
    'low': 'bg-blue-500'
  }
  return classMap[priority] || 'bg-blue-500'
}

const getInspectionPriorityVariant = (priority) => {
  const variantMap = {
    'high': 'destructive',
    'medium': 'default',
    'low': 'outline'
  }
  return variantMap[priority] || 'outline'
}

const getPutawayPriorityClass = (priority) => {
  const classMap = {
    'high': 'bg-red-500',
    'normal': 'bg-blue-500',
    'low': 'bg-slate-500'
  }
  return classMap[priority] || 'bg-blue-500'
}

const getTotalQuantity = (task) => {
  return task.items.reduce((total, item) => total + item.quantity, 0)
}

// Actions
const refreshData = () => {
  isLoading.value = true
  
  // Simulate API call delay
  setTimeout(() => {
    isLoading.value = false
    toast({
      title: "Data refreshed",
      description: "The dashboard has been updated with the latest data.",
    })
  }, 1000)
}

const viewShipmentDetails = (shipment) => {
  toast({
    title: "Viewing shipment details",
    description: `PO: ${shipment.poNumber} from ${shipment.supplierName}`,
  })
}

// Initialize
onMounted(() => {
  refreshData()
})
</script>