<template>
  <!-- Position next to the floating action button with spacing -->
  <div class="fixed bottom-6 z-40 
              right-24 sm:right-28 lg:right-32 xl:right-36 2xl:right-40
              transition-all duration-200">
    <!-- Responsive spacing to stay next to the + button -->
    <div 
      class="bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2 sm:p-3 flex items-center space-x-2 sm:space-x-3 transition-all duration-300 max-w-xs"
      :class="getStatusClasses()"
    >
      <!-- Connection Indicator -->
      <div class="flex items-center space-x-2">
        <div 
          class="relative"
          :class="isConnected ? 'text-green-600' : 'text-red-600'"
        >
          <!-- WiFi Icon with animation -->
          <Wifi 
            class="h-5 w-5"
            :class="!isConnected && 'animate-pulse'"
          />
          
          <!-- Connection pulse effect -->
          <div 
            v-if="isConnected"
            class="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping"
          />
        </div>
        
        <div class="text-xs sm:text-sm">
          <div class="font-medium" :class="isConnected ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'">
            {{ getConnectionStatus() }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-300">
            {{ getConnectionDetails() }}
          </div>
        </div>
      </div>

      <!-- Retry Button (when disconnected) -->
      <div v-if="!isConnected" class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="handleRetry"
          :disabled="isRetrying"
        >
          <RefreshCw 
            class="h-3 w-3 mr-1" 
            :class="isRetrying && 'animate-spin'"
          />
          {{ isRetrying ? 'Retrying...' : 'Retry' }}
        </Button>
        
        <!-- Retry count indicator -->
        <div v-if="retryCount > 0" class="text-xs text-gray-500">
          Attempt {{ retryCount }}/5
        </div>
      </div>

      <!-- Signal Strength Indicator -->
      <div v-if="isConnected" class="flex items-center space-x-1">
        <div class="flex items-end space-x-0.5">
          <div 
            class="w-1 h-2 bg-green-500 rounded-sm"
            :class="signalStrength >= 1 ? 'opacity-100' : 'opacity-30'"
          />
          <div 
            class="w-1 h-3 bg-green-500 rounded-sm"
            :class="signalStrength >= 2 ? 'opacity-100' : 'opacity-30'"
          />
          <div 
            class="w-1 h-4 bg-green-500 rounded-sm"
            :class="signalStrength >= 3 ? 'opacity-100' : 'opacity-30'"
          />
          <div 
            class="w-1 h-5 bg-green-500 rounded-sm"
            :class="signalStrength >= 4 ? 'opacity-100' : 'opacity-30'"
          />
        </div>
        <span class="text-xs text-gray-600 dark:text-gray-300">
          {{ getSignalStrengthText() }}
        </span>
      </div>

      <!-- Offline Mode Indicator -->
      <div v-if="isOfflineMode" class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <span class="text-xs text-yellow-600 dark:text-yellow-400">
          Offline Mode
        </span>
      </div>

      <!-- Sync Status -->
      <div v-if="pendingSyncCount > 0" class="flex items-center space-x-2">
        <div class="relative">
          <Upload class="h-4 w-4 text-blue-600" />
          <div v-if="isSyncing" class="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping" />
        </div>
        <span class="text-xs text-blue-600 dark:text-blue-400">
          {{ pendingSyncCount }} pending
        </span>
      </div>
    </div>

    <!-- Expanded Details Panel -->
    <div 
      v-if="showDetails"
      class="mt-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 w-80"
    >
      <div class="space-y-3">
        <!-- Connection Details -->
        <div>
          <h4 class="text-sm font-medium mb-2">Connection Details</h4>
          <div class="space-y-1 text-xs text-gray-600 dark:text-gray-300">
            <div class="flex justify-between">
              <span>Status:</span>
              <span :class="isConnected ? 'text-green-600' : 'text-red-600'">
                {{ getConnectionStatus() }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Last Update:</span>
              <span>{{ lastConnectionUpdate }}</span>
            </div>
            <div class="flex justify-between">
              <span>Latency:</span>
              <span>{{ latency }}ms</span>
            </div>
            <div v-if="!isConnected" class="flex justify-between">
              <span>Next Retry:</span>
              <span>{{ nextRetryTime }}</span>
            </div>
          </div>
        </div>

        <!-- System Status -->
        <div>
          <h4 class="text-sm font-medium mb-2">System Status</h4>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span>POS Server</span>
              <div class="flex items-center space-x-1">
                <div class="w-2 h-2 rounded-full" :class="serverStatus.pos ? 'bg-green-500' : 'bg-red-500'" />
                <span>{{ serverStatus.pos ? 'Online' : 'Offline' }}</span>
              </div>
            </div>
            
            <div class="flex items-center justify-between text-xs">
              <span>Payment Gateway</span>
              <div class="flex items-center space-x-1">
                <div class="w-2 h-2 rounded-full" :class="serverStatus.payment ? 'bg-green-500' : 'bg-red-500'" />
                <span>{{ serverStatus.payment ? 'Online' : 'Offline' }}</span>
              </div>
            </div>
            
            <div class="flex items-center justify-between text-xs">
              <span>Kitchen Display</span>
              <div class="flex items-center space-x-1">
                <div class="w-2 h-2 rounded-full" :class="serverStatus.kitchen ? 'bg-green-500' : 'bg-red-500'" />
                <span>{{ serverStatus.kitchen ? 'Online' : 'Offline' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-2 pt-2 border-t">
          <Button variant="outline" size="sm" @click="runDiagnostics">
            <Activity class="h-3 w-3 mr-1" />
            Diagnostics
          </Button>
          
          <Button variant="outline" size="sm" @click="forceSync">
            <RefreshCw class="h-3 w-3 mr-1" />
            Force Sync
          </Button>
        </div>
      </div>
    </div>

    <!-- Toggle Details Button -->
    <Button
      variant="ghost"
      size="sm"
      class="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 border shadow-sm"
      @click="showDetails = !showDetails"
    >
      <ChevronDown 
        class="h-3 w-3 transition-transform duration-200"
        :class="showDetails ? 'rotate-180' : ''"
      />
    </Button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  Wifi,
  RefreshCw,
  Upload,
  Activity,
  ChevronDown
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

// Props
const props = defineProps({
  isConnected: {
    type: Boolean,
    default: true
  },
  retryCount: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['retry'])

// Local state
const showDetails = ref(false)
const isRetrying = ref(false)
const isOfflineMode = ref(false)
const isSyncing = ref(false)
const pendingSyncCount = ref(0)
const signalStrength = ref(4)
const latency = ref(45)

const lastConnectionUpdate = ref('')
const nextRetryTime = ref('')

const serverStatus = ref({
  pos: true,
  payment: true,
  kitchen: false
})

// Auto-update connection details
let updateInterval = null

// Computed properties
const getConnectionStatus = () => {
  if (props.isConnected) {
    return 'Connected'
  } else if (isRetrying.value) {
    return 'Reconnecting...'
  } else if (isOfflineMode.value) {
    return 'Offline Mode'
  } else {
    return 'Disconnected'
  }
}

const getConnectionDetails = () => {
  if (props.isConnected) {
    return `Signal: ${getSignalStrengthText()}`
  } else if (props.retryCount > 0) {
    return `Retry ${props.retryCount}/5`
  } else {
    return 'No connection'
  }
}

const getStatusClasses = () => {
  if (props.isConnected) {
    return 'border-green-200 bg-green-50 dark:bg-green-900/20'
  } else if (isRetrying.value) {
    return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
  } else {
    return 'border-red-200 bg-red-50 dark:bg-red-900/20'
  }
}

const getSignalStrengthText = () => {
  switch (signalStrength.value) {
    case 4:
      return 'Excellent'
    case 3:
      return 'Good'
    case 2:
      return 'Fair'
    case 1:
      return 'Poor'
    default:
      return 'No Signal'
  }
}

// Methods
const handleRetry = async () => {
  isRetrying.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate retry delay
    emit('retry')
  } finally {
    isRetrying.value = false
  }
}

const runDiagnostics = async () => {
  console.log('Running network diagnostics...')
  
  // Simulate diagnostics
  const diagnostics = {
    latency: Math.random() * 100 + 20,
    packetLoss: Math.random() * 5,
    bandwidth: Math.random() * 100 + 50
  }
  
  console.log('Diagnostics results:', diagnostics)
}

const forceSync = async () => {
  if (isSyncing.value) return
  
  isSyncing.value = true
  pendingSyncCount.value = Math.floor(Math.random() * 5) + 1
  
  // Simulate sync process
  const syncInterval = setInterval(() => {
    if (pendingSyncCount.value > 0) {
      pendingSyncCount.value--
    } else {
      clearInterval(syncInterval)
      isSyncing.value = false
    }
  }, 1000)
}

const updateConnectionDetails = () => {
  lastConnectionUpdate.value = new Date().toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  if (!props.isConnected) {
    const nextRetry = new Date(Date.now() + 30000) // 30 seconds from now
    nextRetryTime.value = nextRetry.toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
  
  // Simulate latency fluctuation
  if (props.isConnected) {
    latency.value = Math.floor(Math.random() * 100) + 20
    signalStrength.value = Math.floor(Math.random() * 4) + 1
  }
  
  // Simulate server status changes
  if (Math.random() > 0.95) { // 5% chance of status change
    const servers = ['pos', 'payment', 'kitchen']
    const randomServer = servers[Math.floor(Math.random() * servers.length)]
    serverStatus.value[randomServer] = !serverStatus.value[randomServer]
  }
}

const simulateOfflineMode = () => {
  if (!props.isConnected && props.retryCount >= 3) {
    isOfflineMode.value = true
    pendingSyncCount.value = Math.floor(Math.random() * 10) + 5
  } else {
    isOfflineMode.value = false
  }
}

// Lifecycle
onMounted(() => {
  updateConnectionDetails()
  updateInterval = setInterval(updateConnectionDetails, 5000) // Update every 5 seconds
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

// Watch for connection changes
watch(() => props.isConnected, (newValue) => {
  simulateOfflineMode()
  updateConnectionDetails()
  
  if (newValue) {
    // Connection restored
    isOfflineMode.value = false
    if (pendingSyncCount.value > 0) {
      forceSync()
    }
  }
})

watch(() => props.retryCount, () => {
  simulateOfflineMode()
})
</script>

<style scoped>
/* Custom animations */
@keyframes connection-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.connection-pulse {
  animation: connection-pulse 2s infinite;
}

/* Signal strength bars animation */
.signal-bar {
  transition: opacity 0.3s ease;
}

/* Smooth transitions */
.status-indicator {
  transition: all 0.3s ease;
}
</style>
