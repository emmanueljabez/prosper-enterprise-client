<template>
  <div class="space-y-6">
    <!-- Manager Dashboard Header -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">Manager Dashboard</h1>
          <p class="text-gray-600 dark:text-gray-300">
            Real-time restaurant overview for {{ currentDate }}
          </p>
        </div>
        
        <div class="flex items-center space-x-3">
          <!-- Time Range Selector -->
          <Select v-model="selectedTimeRange">
            <SelectTrigger class="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <!-- Refresh Button -->
          <Button variant="outline" @click="refreshDashboard">
            <RefreshCw class="h-4 w-4 mr-2" :class="isRefreshing ? 'animate-spin' : ''" />
            Refresh
          </Button>

          <!-- Export Button -->
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download class="h-4 w-4 mr-2" />
                Export
                <ChevronDown class="h-3 w-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem @click="exportReport('pdf')">
                <FileText class="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem @click="exportReport('excel')">
                <FileSpreadsheet class="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600">
            KSh {{ formatCurrency(salesData.todayRevenue || 0) }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-300">Today's Revenue</div>
          <div class="text-xs text-green-600 mt-1">
            +{{ salesData.revenueGrowth || 0 }}% vs yesterday
          </div>
        </div>
        
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">
            {{ salesData.ordersCount || 0 }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-300">Orders Today</div>
          <div class="text-xs text-blue-600 mt-1">
            {{ salesData.avgOrderValue || 0 }} avg. value
          </div>
        </div>
        
        <div class="text-center">
          <div class="text-3xl font-bold text-purple-600">
            {{ salesData.customersServed || 0 }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-300">Customers Served</div>
          <div class="text-xs text-purple-600 mt-1">
            {{ salesData.tableUtilization || 0 }}% table utilization
          </div>
        </div>
        
        <div class="text-center">
          <div class="text-3xl font-bold text-yellow-600">
            {{ realTimeMetrics.waitTime || 0 }}m
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-300">Avg. Wait Time</div>
          <div class="text-xs" :class="realTimeMetrics.waitTime > 15 ? 'text-red-600' : 'text-green-600'">
            {{ realTimeMetrics.waitTime > 15 ? 'Above target' : 'On target' }}
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Real-Time Operations -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Live Orders -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div class="p-4 border-b">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">Live Orders</h3>
              <Badge variant="outline">{{ liveOrders.length }} Active</Badge>
            </div>
          </div>
          
          <div class="p-4">
            <div class="space-y-3 max-h-96 overflow-y-auto">
              <div
                v-for="order in liveOrders"
                :key="order.id"
                class="flex items-center justify-between p-3 border rounded-lg"
                :class="getOrderStatusClass(order)"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-3 h-3 rounded-full" :class="getOrderStatusColor(order.status)" />
                  <div>
                    <div class="font-medium">Table {{ order.tableNumber }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">
                      {{ order.items.length }} items • KSh {{ formatCurrency(order.total) }}
                    </div>
                  </div>
                </div>
                
                <div class="text-right">
                  <div class="text-sm font-medium">{{ getOrderElapsedTime(order.timestamp) }}</div>
                  <Badge :variant="getOrderPriorityVariant(order.priority)" class="text-xs">
                    {{ order.status }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Staff Performance -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div class="p-4 border-b">
            <h3 class="font-semibold">Staff Performance Today</h3>
          </div>
          
          <div class="p-4">
            <div class="space-y-4">
              <div
                v-for="staff in staffPerformance"
                :key="staff.id"
                class="flex items-center justify-between p-3 border rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <Avatar class="h-10 w-10">
                    <AvatarImage :src="staff.avatar" :alt="staff.name" />
                    <AvatarFallback>{{ staff.name.charAt(0) }}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div class="font-medium">{{ staff.name }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">{{ staff.role }}</div>
                  </div>
                </div>
                
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div class="text-lg font-semibold">{{ staff.ordersServed }}</div>
                    <div class="text-xs text-gray-600">Orders</div>
                  </div>
                  <div>
                    <div class="text-lg font-semibold">KSh {{ formatCurrency(staff.salesAmount) }}</div>
                    <div class="text-xs text-gray-600">Sales</div>
                  </div>
                  <div>
                    <div class="text-lg font-semibold">{{ staff.rating }}/5</div>
                    <div class="text-xs text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sales Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div class="p-4 border-b">
            <h3 class="font-semibold">Sales Trend</h3>
          </div>
          
          <div class="p-4">
            <div class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="text-center">
                <BarChart3 class="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p class="text-gray-600 dark:text-gray-300">Sales chart would be displayed here</p>
                <p class="text-xs text-gray-500">Integration with charting library required</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Info -->
      <div class="space-y-6">
        <!-- Pending Approvals -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div class="p-4 border-b">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">Pending Approvals</h3>
              <Badge variant="destructive" v-if="pendingApprovals.length > 0">
                {{ pendingApprovals.length }}
              </Badge>
            </div>
          </div>
          
          <div class="p-4">
            <div v-if="pendingApprovals.length === 0" class="text-center py-8">
              <CheckCircle class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-600 dark:text-gray-300">No pending approvals</p>
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="approval in pendingApprovals"
                :key="approval.id"
                class="border rounded-lg p-3"
              >
                <div class="flex items-center justify-between mb-2">
                  <Badge :variant="approval.type === 'discount' ? 'secondary' : 'destructive'">
                    {{ approval.type }}
                  </Badge>
                  <span class="text-xs text-gray-500">{{ getTimeAgo(approval.timestamp) }}</span>
                </div>
                
                <div class="text-sm mb-3">
                  <div class="font-medium">Table {{ approval.tableNumber }}</div>
                  <div class="text-gray-600 dark:text-gray-300">{{ approval.reason }}</div>
                  <div class="font-medium text-primary">
                    KSh {{ formatCurrency(approval.amount) }}
                  </div>
                </div>
                
                <div class="flex space-x-2">
                  <Button
                    size="sm"
                    @click="approveRequest(approval.id, true)"
                    class="flex-1"
                  >
                    <Check class="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    @click="approveRequest(approval.id, false)"
                    class="flex-1"
                  >
                    <X class="h-3 w-3 mr-1" />
                    Deny
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Alerts -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div class="p-4 border-b">
            <h3 class="font-semibold">System Alerts</h3>
          </div>
          
          <div class="p-4">
            <div class="space-y-3">
              <div
                v-for="alert in systemAlerts"
                :key="alert.id"
                class="flex items-start space-x-3 p-3 rounded-lg"
                :class="getAlertClass(alert.severity)"
              >
                <component :is="getAlertIcon(alert.type)" class="h-5 w-5 mt-0.5" />
                <div class="flex-1">
                  <div class="font-medium text-sm">{{ alert.title }}</div>
                  <div class="text-xs text-gray-600 dark:text-gray-300">{{ alert.message }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ getTimeAgo(alert.timestamp) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div class="p-4 border-b">
            <h3 class="font-semibold">Quick Actions</h3>
          </div>
          
          <div class="p-4 space-y-2">
            <Button variant="outline" class="w-full justify-start" @click="viewReports('sales')">
              <BarChart3 class="h-4 w-4 mr-2" />
              View Sales Reports
            </Button>
            
            <Button variant="outline" class="w-full justify-start" @click="viewReports('inventory')">
              <Package class="h-4 w-4 mr-2" />
              Inventory Report
            </Button>
            
            <Button variant="outline" class="w-full justify-start" @click="viewReports('staff')">
              <Users class="h-4 w-4 mr-2" />
              Staff Report
            </Button>
            
            <Button variant="outline" class="w-full justify-start" @click="manageDiscounts">
              <Percent class="h-4 w-4 mr-2" />
              Manage Discounts
            </Button>
            
            <Button variant="outline" class="w-full justify-start" @click="systemSettings">
              <Settings class="h-4 w-4 mr-2" />
              System Settings
            </Button>
            
            <Button variant="outline" class="w-full justify-start" @click="exportDailyReport">
              <Download class="h-4 w-4 mr-2" />
              Export Daily Report
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Emergency Actions Modal -->
    <Dialog v-model:open="showEmergencyModal">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="text-red-600">Emergency Stop</DialogTitle>
        </DialogHeader>
        
        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            This will pause all operations and alert staff. Only use in emergency situations.
          </p>
          
          <div>
            <Label>Reason for emergency stop</Label>
            <Textarea
              v-model="emergencyReason"
              placeholder="Enter reason..."
              rows="3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showEmergencyModal = false">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmEmergencyStop">
            Emergency Stop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  RefreshCw,
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  CheckCircle,
  Check,
  X,
  BarChart3,
  Package,
  Users,
  Percent,
  Settings,
  AlertTriangle,
  Wifi,
  Server
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// Props
const props = defineProps({
  salesData: {
    type: Object,
    default: () => ({})
  },
  staffPerformance: {
    type: Array,
    default: () => []
  },
  realTimeMetrics: {
    type: Object,
    default: () => ({})
  },
  pendingApprovals: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'approve-discount',
  'approve-void',
  'view-reports'
])

// Local state
const selectedTimeRange = ref('today')
const isRefreshing = ref(false)
const showEmergencyModal = ref(false)
const emergencyReason = ref('')

// Mock data for demo
const liveOrders = ref([
  {
    id: 1,
    tableNumber: 12,
    status: 'preparing',
    priority: 'normal',
    items: [{ name: 'Burger' }, { name: 'Fries' }],
    total: 1250,
    timestamp: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    id: 2,
    tableNumber: 8,
    status: 'ready',
    priority: 'high',
    items: [{ name: 'Pizza' }],
    total: 2100,
    timestamp: new Date(Date.now() - 8 * 60000).toISOString()
  },
  {
    id: 3,
    tableNumber: 5,
    status: 'pending',
    priority: 'rush',
    items: [{ name: 'Salad' }, { name: 'Drink' }],
    total: 850,
    timestamp: new Date(Date.now() - 25 * 60000).toISOString()
  }
])

const systemAlerts = ref([
  {
    id: 1,
    type: 'inventory',
    severity: 'warning',
    title: 'Low Stock Alert',
    message: 'Chicken breast is running low (2 portions left)',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 2,
    type: 'system',
    severity: 'info',
    title: 'System Update',
    message: 'Scheduled maintenance at 3:00 AM',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString()
  },
  {
    id: 3,
    type: 'payment',
    severity: 'error',
    title: 'Payment Gateway',
    message: 'M-Pesa service temporarily unavailable',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString()
  }
])

// Computed properties
const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const getOrderStatusClass = (order) => {
  switch (order.status) {
    case 'ready':
      return 'border-green-200 bg-green-50 dark:bg-green-900/20'
    case 'preparing':
      return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
    case 'pending':
      return order.priority === 'rush' 
        ? 'border-red-200 bg-red-50 dark:bg-red-900/20' 
        : 'border-gray-200'
    default:
      return 'border-gray-200'
  }
}

const getOrderStatusColor = (status) => {
  switch (status) {
    case 'ready':
      return 'bg-green-500'
    case 'preparing':
      return 'bg-blue-500'
    case 'pending':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-400'
  }
}

const getOrderPriorityVariant = (priority) => {
  switch (priority) {
    case 'rush':
      return 'destructive'
    case 'high':
      return 'secondary'
    default:
      return 'outline'
  }
}

const getOrderElapsedTime = (timestamp) => {
  const now = new Date()
  const orderTime = new Date(timestamp)
  const diffMinutes = Math.floor((now - orderTime) / (1000 * 60))
  
  if (diffMinutes < 1) return '0m'
  if (diffMinutes < 60) return `${diffMinutes}m`
  
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  return `${hours}h ${minutes}m`
}

const getTimeAgo = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMinutes = Math.floor((now - time) / (1000 * 60))
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60)
    return `${hours}h ago`
  }
  
  const days = Math.floor(diffMinutes / 1440)
  return `${days}d ago`
}

const getAlertClass = (severity) => {
  switch (severity) {
    case 'error':
      return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
    case 'info':
      return 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
    default:
      return 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
  }
}

const getAlertIcon = (type) => {
  switch (type) {
    case 'inventory':
      return Package
    case 'system':
      return Server
    case 'payment':
      return Wifi
    default:
      return AlertTriangle
  }
}

const refreshDashboard = async () => {
  isRefreshing.value = true
  // Simulate API call
  setTimeout(() => {
    isRefreshing.value = false
  }, 2000)
}

const exportReport = (format) => {
  console.log(`Exporting report as ${format}`)
}

const approveRequest = (requestId, approved) => {
  if (approved) {
    emit('approve-discount', requestId, true)
  } else {
    emit('approve-void', requestId, false)
  }
}

const viewReports = (reportType) => {
  emit('view-reports', reportType)
}

const manageDiscounts = () => {
  console.log('Managing discounts...')
}

const systemSettings = () => {
  console.log('Opening system settings...')
}

const exportDailyReport = () => {
  console.log('Exporting daily report...')
}

const confirmEmergencyStop = () => {
  console.log('Emergency stop activated:', emergencyReason.value)
  showEmergencyModal.value = false
  emergencyReason.value = ''
}

// Initialize dashboard
onMounted(() => {
  refreshDashboard()
})
</script>
