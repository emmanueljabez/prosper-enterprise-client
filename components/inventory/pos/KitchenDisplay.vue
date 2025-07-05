<template>
  <div class="space-y-6">
    <!-- Kitchen Header -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h2 class="text-lg font-semibold">Kitchen Display</h2>
          <Badge variant="outline" class="flex items-center space-x-1">
            <Clock class="h-3 w-3" />
            <span>{{ activeOrders.length }} Active Orders</span>
          </Badge>
        </div>

        <div class="flex items-center space-x-3">
          <!-- Station Filter -->
          <Select v-model="selectedStation">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="All Stations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stations</SelectItem>
              <SelectItem v-for="station in stations" :key="station.id" :value="station.id">
                {{ station.name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- Priority Filter -->
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter class="h-4 w-4 mr-2" />
                Priority
                <ChevronDown class="h-3 w-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem @click="priorityFilter = 'all'">
                All Orders
              </DropdownMenuItem>
              <DropdownMenuItem @click="priorityFilter = 'rush'">
                Rush Orders Only
              </DropdownMenuItem>
              <DropdownMenuItem @click="priorityFilter = 'delayed'">
                Delayed Orders
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- Auto-refresh Toggle -->
          <Button
            variant="outline"
            size="sm"
            @click="toggleAutoRefresh"
            :class="autoRefresh ? 'bg-green-50 border-green-200' : ''"
          >
            <RefreshCw 
              class="h-4 w-4 mr-2" 
              :class="autoRefresh ? 'animate-spin' : ''" 
            />
            Auto-refresh
          </Button>
        </div>
      </div>

      <!-- Kitchen Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Clock class="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Avg. Prep Time</p>
            <p class="text-sm font-semibold">{{ avgPrepTime }}m</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <TrendingUp class="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Orders/Hour</p>
            <p class="text-sm font-semibold">{{ ordersPerHour }}</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
            <AlertTriangle class="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Delayed Orders</p>
            <p class="text-sm font-semibold">{{ delayedOrdersCount }}</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <Target class="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">On-time Rate</p>
            <p class="text-sm font-semibold">{{ onTimeRate }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Kitchen Orders by Station -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="station in filteredStations"
        :key="station.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border"
      >
        <!-- Station Header -->
        <div class="p-4 border-b">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div 
                class="w-3 h-3 rounded-full"
                :class="getStationStatusColor(station.status)"
              />
              <h3 class="font-semibold">{{ station.name }}</h3>
              <Badge variant="outline" class="text-xs">
                {{ getStationOrderCount(station.id) }} orders
              </Badge>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="pauseStation(station.id)">
                  <Pause class="h-4 w-4 mr-2" />
                  Pause Station
                </DropdownMenuItem>
                <DropdownMenuItem @click="rushAllOrders(station.id)">
                  <Zap class="h-4 w-4 mr-2" />
                  Rush All Orders
                </DropdownMenuItem>
                <DropdownMenuItem @click="viewStationStats(station.id)">
                  <BarChart3 class="h-4 w-4 mr-2" />
                  Station Stats
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <!-- Station Orders -->
        <div class="p-4 space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="order in getOrdersForStation(station.id)"
            :key="order.id"
            class="border rounded-lg p-3 transition-all duration-200"
            :class="getOrderCardClasses(order)"
          >
            <!-- Order Header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-lg">
                  Table {{ order.tableNumber }}
                </span>
                <Badge 
                  :variant="getOrderPriorityVariant(order.priority)"
                  class="text-xs"
                >
                  {{ order.priority }}
                </Badge>
              </div>
              
              <div class="text-right">
                <div class="text-sm font-medium">
                  {{ getOrderTime(order.timestamp) }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Order #{{ order.orderNumber }}
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="space-y-2">
              <div
                v-for="item in getStationItems(order.items, station.id)"
                :key="item.id"
                class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <span class="font-medium">{{ item.quantity }}x</span>
                    <span>{{ item.name }}</span>
                    <Badge
                      v-if="item.status === 'ready'"
                      variant="default"
                      class="text-xs bg-green-500"
                    >
                      Ready
                    </Badge>
                    <Badge
                      v-else-if="item.status === 'preparing'"
                      variant="secondary"
                      class="text-xs bg-yellow-500"
                    >
                      Preparing
                    </Badge>
                  </div>
                  
                  <!-- Special Instructions -->
                  <div v-if="item.specialInstructions" class="mt-1">
                    <p class="text-xs text-red-600 dark:text-red-400 font-medium">
                      ⚠️ {{ item.specialInstructions }}
                    </p>
                  </div>

                  <!-- Modifiers -->
                  <div v-if="item.modifiers?.length > 0" class="mt-1">
                    <p class="text-xs text-gray-600 dark:text-gray-300">
                      {{ item.modifiers.map(m => m.name).join(', ') }}
                    </p>
                  </div>
                </div>

                <!-- Item Actions -->
                <div class="flex items-center space-x-1">
                  <Button
                    v-if="item.status === 'pending'"
                    variant="outline"
                    size="sm"
                    @click="markItemStarted(order.id, item.id)"
                  >
                    <Play class="h-3 w-3" />
                  </Button>
                  
                  <Button
                    v-if="item.status === 'preparing'"
                    variant="default"
                    size="sm"
                    class="bg-green-600 hover:bg-green-700"
                    @click="markItemReady(order.id, item.id)"
                  >
                    <Check class="h-3 w-3" />
                  </Button>

                  <Button
                    v-if="item.status === 'ready'"
                    variant="secondary"
                    size="sm"
                    disabled
                  >
                    <CheckCircle class="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <!-- Order Actions -->
            <div class="flex items-center justify-between mt-3 pt-3 border-t">
              <div class="flex items-center space-x-2">
                <!-- Timing Info -->
                <div class="text-xs text-gray-600 dark:text-gray-300">
                  <div class="flex items-center space-x-1">
                    <Clock class="h-3 w-3" />
                    <span>{{ getElapsedTime(order.timestamp) }} elapsed</span>
                  </div>
                  <div v-if="order.estimatedTime" class="flex items-center space-x-1">
                    <Timer class="h-3 w-3" />
                    <span>{{ order.estimatedTime }}m est.</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-1">
                <!-- Priority Actions -->
                <Button
                  v-if="order.priority !== 'rush'"
                  variant="outline"
                  size="sm"
                  @click="markAsRush(order.id)"
                >
                  <Zap class="h-3 w-3" />
                </Button>

                <!-- Update Timing -->
                <Button
                  variant="outline"
                  size="sm"
                  @click="updateOrderTiming(order.id)"
                >
                  <Clock class="h-3 w-3" />
                </Button>

                <!-- Complete Order -->
                <Button
                  v-if="isOrderReady(order)"
                  variant="default"
                  size="sm"
                  class="bg-green-600 hover:bg-green-700"
                  @click="completeOrder(order.id)"
                >
                  <CheckCircle class="h-3 w-3 mr-1" />
                  Complete
                </Button>
              </div>
            </div>

            <!-- Order Progress Bar -->
            <div class="mt-3">
              <div class="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                <span>Progress</span>
                <span>{{ getOrderProgress(order) }}%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  class="bg-primary h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${getOrderProgress(order)}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="getOrdersForStation(station.id).length === 0" class="text-center py-8">
            <CheckCircle class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-gray-300">No pending orders</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Timing Dialog -->
    <Dialog v-model:open="showTimingDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Timing</DialogTitle>
        </DialogHeader>
        
        <div class="space-y-4">
          <div>
            <Label>Estimated completion time (minutes)</Label>
            <Input
              v-model="estimatedTime"
              type="number"
              min="1"
              max="120"
              placeholder="Enter estimated time"
            />
          </div>

          <div>
            <Label>Reason for delay (optional)</Label>
            <Textarea
              v-model="delayReason"
              placeholder="Enter reason for delay..."
              rows="3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showTimingDialog = false">
            Cancel
          </Button>
          <Button @click="confirmTimingUpdate">
            Update Timing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Clock,
  Filter,
  ChevronDown,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Target,
  MoreVertical,
  Pause,
  Zap,
  BarChart3,
  Play,
  Check,
  CheckCircle,
  Timer
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// Props
const props = defineProps({
  orders: {
    type: Array,
    default: () => []
  },
  stations: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'mark-ready',
  'mark-started',
  'update-timing',
  'priority-change'
])

// Local state
const selectedStation = ref('all')
const priorityFilter = ref('all')
const autoRefresh = ref(true)
const showTimingDialog = ref(false)
const selectedOrderForTiming = ref(null)
const estimatedTime = ref('')
const delayReason = ref('')

// Kitchen statistics
const avgPrepTime = ref(15)
const ordersPerHour = ref(24)
const delayedOrdersCount = ref(3)
const onTimeRate = ref(87)

// Auto-refresh interval
let refreshInterval = null

// Computed properties
const activeOrders = computed(() => {
  return props.orders.filter(order => order.status !== 'completed')
})

const filteredStations = computed(() => {
  if (selectedStation.value === 'all') {
    return props.stations
  }
  return props.stations.filter(station => station.id === selectedStation.value)
})

// Methods
const getStationStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-500'
    case 'busy':
      return 'bg-yellow-500'
    case 'paused':
      return 'bg-red-500'
    default:
      return 'bg-gray-400'
  }
}

const getStationOrderCount = (stationId) => {
  return activeOrders.value.filter(order =>
    order.items.some(item => item.stationId === stationId && item.status !== 'ready')
  ).length
}

const getOrdersForStation = (stationId) => {
  return activeOrders.value.filter(order =>
    order.items.some(item => item.stationId === stationId)
  ).sort((a, b) => {
    // Sort by priority, then by time
    if (a.priority === 'rush' && b.priority !== 'rush') return -1
    if (b.priority === 'rush' && a.priority !== 'rush') return 1
    return new Date(a.timestamp) - new Date(b.timestamp)
  })
}

const getStationItems = (orderItems, stationId) => {
  return orderItems.filter(item => item.stationId === stationId)
}

const getOrderCardClasses = (order) => {
  const baseClasses = 'transition-all duration-200'
  
  if (order.priority === 'rush') {
    return `${baseClasses} border-red-200 bg-red-50 dark:bg-red-900/20`
  }
  
  const elapsedMinutes = getElapsedTimeInMinutes(order.timestamp)
  if (elapsedMinutes > 20) {
    return `${baseClasses} border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20`
  }
  
  return `${baseClasses} border-gray-200 bg-white dark:bg-gray-700`
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

const getOrderTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getElapsedTime = (timestamp) => {
  const elapsed = getElapsedTimeInMinutes(timestamp)
  if (elapsed < 60) {
    return `${elapsed}m`
  }
  const hours = Math.floor(elapsed / 60)
  const minutes = elapsed % 60
  return `${hours}h ${minutes}m`
}

const getElapsedTimeInMinutes = (timestamp) => {
  const now = new Date()
  const orderTime = new Date(timestamp)
  return Math.floor((now - orderTime) / (1000 * 60))
}

const getOrderProgress = (order) => {
  const totalItems = order.items.length
  const readyItems = order.items.filter(item => item.status === 'ready').length
  return Math.round((readyItems / totalItems) * 100)
}

const isOrderReady = (order) => {
  return order.items.every(item => item.status === 'ready')
}

const markItemStarted = (orderId, itemId) => {
  emit('mark-started', orderId, itemId)
}

const markItemReady = (orderId, itemId) => {
  emit('mark-ready', orderId, itemId)
}

const markAsRush = (orderId) => {
  emit('priority-change', orderId, 'rush')
}

const updateOrderTiming = (orderId) => {
  selectedOrderForTiming.value = orderId
  estimatedTime.value = ''
  delayReason.value = ''
  showTimingDialog.value = true
}

const confirmTimingUpdate = () => {
  if (estimatedTime.value && selectedOrderForTiming.value) {
    emit('update-timing', selectedOrderForTiming.value, {
      estimatedTime: parseInt(estimatedTime.value),
      delayReason: delayReason.value
    })
  }
  showTimingDialog.value = false
}

const completeOrder = (orderId) => {
  emit('complete-order', orderId)
}

const pauseStation = (stationId) => {
  console.log('Pausing station:', stationId)
}

const rushAllOrders = (stationId) => {
  const stationOrders = getOrdersForStation(stationId)
  stationOrders.forEach(order => {
    if (order.priority !== 'rush') {
      emit('priority-change', order.id, 'rush')
    }
  })
}

const viewStationStats = (stationId) => {
  console.log('Viewing stats for station:', stationId)
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  
  if (autoRefresh.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    // Refresh orders data
    emit('refresh-orders')
  }, 30000) // Refresh every 30 seconds
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Lifecycle
onMounted(() => {
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
@keyframes pulse-red {
  0%, 100% {
    background-color: rgb(254 242 242);
    border-color: rgb(254 202 202);
  }
  50% {
    background-color: rgb(254 226 226);
    border-color: rgb(252 165 165);
  }
}

.rush-order {
  animation: pulse-red 2s infinite;
}

.station-card {
  max-height: 80vh;
  overflow-y: auto;
}

.order-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
