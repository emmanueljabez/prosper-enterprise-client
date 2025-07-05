<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
    <TransitionGroup
      name="notification"
      tag="div"
      class="space-y-2"
    >
      <div
        v-for="notification in visibleNotifications"
        :key="notification.id"
        class="bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 relative"
        :class="getNotificationClasses(notification.type)"
      >
        <!-- Notification Icon -->
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center"
              :class="getIconBackground(notification.type)"
            >
              <component 
                :is="getNotificationIcon(notification.type)" 
                class="h-4 w-4"
                :class="getIconColor(notification.type)"
              />
            </div>
          </div>

          <!-- Notification Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-medium" :class="getTitleColor(notification.type)">
                  {{ notification.title }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {{ notification.message }}
                </p>

                <!-- Additional Data -->
                <div v-if="notification.data" class="mt-2">
                  <!-- Order Ready Notification -->
                  <div v-if="notification.type === 'order-ready'" class="text-xs text-gray-500">
                    Table {{ notification.data.tableNumber }} • {{ notification.data.itemsReady }} items ready
                  </div>

                  <!-- Payment Notification -->
                  <div v-if="notification.type === 'payment-success'" class="text-xs text-green-600">
                    KSh {{ formatCurrency(notification.data.amount) }} • {{ notification.data.method }}
                  </div>

                  <!-- Inventory Alert -->
                  <div v-if="notification.type === 'inventory-low'" class="text-xs text-yellow-600">
                    {{ notification.data.itemName }} • {{ notification.data.currentStock }} left
                  </div>
                </div>

                <!-- Timestamp -->
                <div class="text-xs text-gray-400 mt-2">
                  {{ formatTimestamp(notification.timestamp) }}
                </div>
              </div>

              <!-- Close Button -->
              <Button
                variant="ghost"
                size="sm"
                class="h-6 w-6 p-0 ml-2"
                @click="dismissNotification(notification.id)"
              >
                <X class="h-3 w-3" />
              </Button>
            </div>

            <!-- Action Buttons -->
            <div v-if="notification.actions" class="mt-3 flex space-x-2">
              <Button
                v-for="action in notification.actions"
                :key="action.id"
                :variant="action.variant || 'outline'"
                size="sm"
                @click="handleNotificationAction(notification.id, action)"
              >
                <component v-if="action.icon" :is="action.icon" class="h-3 w-3 mr-1" />
                {{ action.label }}
              </Button>
            </div>

            <!-- Progress Bar for Temporary Notifications -->
            <div 
              v-if="notification.autoHide && notification.duration" 
              class="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1"
            >
              <div
                class="h-1 rounded-full transition-all duration-100 ease-linear"
                :class="getProgressBarColor(notification.type)"
                :style="{ width: `${getProgressPercentage(notification)}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Priority Indicator -->
        <div 
          v-if="notification.priority === 'high'"
          class="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-lg"
        />
      </div>
    </TransitionGroup>

    <!-- Notification Sound (using Web Audio API for browser compatibility) -->
    <!-- Audio element removed to avoid file dependency issues -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  X,
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  DollarSign,
  Package,
  Users,
  Clock,
  Zap,
  Eye
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

// Props
const props = defineProps({
  notifications: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['dismiss', 'action'])

// Local state
const notificationTimers = ref(new Map())
const maxVisibleNotifications = 5

// Computed properties
const visibleNotifications = computed(() => {
  return props.notifications
    .slice(0, maxVisibleNotifications)
    .map(notification => ({
      ...notification,
      progressStartTime: notification.progressStartTime || Date.now()
    }))
})

// Methods
const getNotificationClasses = (type) => {
  const baseClasses = 'border-l-4'
  
  switch (type) {
    case 'success':
    case 'order-ready':
    case 'payment-success':
      return `${baseClasses} border-green-500`
    case 'error':
    case 'payment-failed':
      return `${baseClasses} border-red-500`
    case 'warning':
    case 'inventory-low':
      return `${baseClasses} border-yellow-500`
    case 'info':
    case 'order-update':
      return `${baseClasses} border-blue-500`
    default:
      return `${baseClasses} border-gray-500`
  }
}

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
    case 'order-ready':
    case 'payment-success':
      return CheckCircle
    case 'error':
    case 'payment-failed':
      return AlertTriangle
    case 'warning':
    case 'inventory-low':
      return Package
    case 'info':
    case 'order-update':
      return Info
    case 'payment':
      return DollarSign
    case 'customer':
      return Users
    case 'urgent':
      return Zap
    default:
      return Bell
  }
}

const getIconBackground = (type) => {
  switch (type) {
    case 'success':
    case 'order-ready':
    case 'payment-success':
      return 'bg-green-100 dark:bg-green-900'
    case 'error':
    case 'payment-failed':
      return 'bg-red-100 dark:bg-red-900'
    case 'warning':
    case 'inventory-low':
      return 'bg-yellow-100 dark:bg-yellow-900'
    case 'info':
    case 'order-update':
      return 'bg-blue-100 dark:bg-blue-900'
    default:
      return 'bg-gray-100 dark:bg-gray-700'
  }
}

const getIconColor = (type) => {
  switch (type) {
    case 'success':
    case 'order-ready':
    case 'payment-success':
      return 'text-green-600 dark:text-green-400'
    case 'error':
    case 'payment-failed':
      return 'text-red-600 dark:text-red-400'
    case 'warning':
    case 'inventory-low':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'info':
    case 'order-update':
      return 'text-blue-600 dark:text-blue-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

const getTitleColor = (type) => {
  switch (type) {
    case 'error':
    case 'payment-failed':
      return 'text-red-800 dark:text-red-200'
    case 'warning':
    case 'inventory-low':
      return 'text-yellow-800 dark:text-yellow-200'
    default:
      return 'text-gray-900 dark:text-white'
  }
}

const getProgressBarColor = (type) => {
  switch (type) {
    case 'success':
    case 'order-ready':
    case 'payment-success':
      return 'bg-green-500'
    case 'error':
    case 'payment-failed':
      return 'bg-red-500'
    case 'warning':
    case 'inventory-low':
      return 'bg-yellow-500'
    case 'info':
    case 'order-update':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatTimestamp = (timestamp) => {
  const now = new Date()
  const notificationTime = new Date(timestamp)
  const diffSeconds = Math.floor((now - notificationTime) / 1000)
  
  if (diffSeconds < 60) return 'Just now'
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`
  
  return notificationTime.toLocaleDateString()
}

const getProgressPercentage = (notification) => {
  if (!notification.autoHide || !notification.duration) return 100
  
  const elapsed = Date.now() - notification.progressStartTime
  const progress = (elapsed / (notification.duration * 1000)) * 100
  
  return Math.max(0, 100 - progress)
}

const dismissNotification = (notificationId) => {
  emit('dismiss', notificationId)
  
  // Clear timer if exists
  if (notificationTimers.value.has(notificationId)) {
    clearTimeout(notificationTimers.value.get(notificationId))
    notificationTimers.value.delete(notificationId)
  }
}

const handleNotificationAction = (notificationId, action) => {
  emit('action', {
    notificationId,
    actionId: action.id,
    actionData: action.data
  })
}

const playNotificationSound = (type) => {
  try {
    // Use Web Audio API to generate notification sounds without external files
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Different frequencies for different notification types
    let frequency = 800 // Default frequency
    let duration = 200 // Default duration in ms
    
    switch (type) {
      case 'success':
      case 'order-ready':
      case 'payment-success':
        frequency = 1000
        duration = 300
        break
      case 'error':
      case 'payment-failed':
        frequency = 400
        duration = 500
        break
      case 'warning':
      case 'inventory-low':
        frequency = 600
        duration = 400
        break
      case 'urgent':
        frequency = 1200
        duration = 600
        break
      default:
        frequency = 800
        duration = 200
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    oscillator.type = 'sine'
    
    // Volume based on notification type
    const volume = type === 'urgent' ? 0.3 : 0.1
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration / 1000)
    
  } catch (error) {
    console.warn('Could not play notification sound:', error)
    // Fallback: try to use the system notification sound if available
    if ('Notification' in window && Notification.permission === 'granted') {
      // Just request permission without showing notification
      // The sound will play as part of browser behavior
    }
  }
}

const setupAutoHide = (notification) => {
  if (!notification.autoHide || !notification.duration) return
  
  const timer = setTimeout(() => {
    dismissNotification(notification.id)
  }, notification.duration * 1000)
  
  notificationTimers.value.set(notification.id, timer)
}

// Watch for new notifications
watch(() => props.notifications, (newNotifications, oldNotifications) => {
  if (!oldNotifications) return
  
  // Find new notifications
  const newIds = newNotifications.map(n => n.id)
  const oldIds = oldNotifications.map(n => n.id)
  const addedNotifications = newNotifications.filter(n => !oldIds.includes(n.id))
  
  // Handle new notifications
  addedNotifications.forEach(notification => {
    // Play sound for new notifications
    if (notification.playSound !== false) {
      playNotificationSound(notification.type)
    }
    
    // Setup auto-hide timer
    setupAutoHide(notification)
  })
  
  // Clean up timers for removed notifications
  const removedIds = oldIds.filter(id => !newIds.includes(id))
  removedIds.forEach(id => {
    if (notificationTimers.value.has(id)) {
      clearTimeout(notificationTimers.value.get(id))
      notificationTimers.value.delete(id)
    }
  })
}, { deep: true })

// Cleanup on unmount
onUnmounted(() => {
  notificationTimers.value.forEach(timer => clearTimeout(timer))
  notificationTimers.value.clear()
})
</script>

<style scoped>
/* Notification animations */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Hover effects */
.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Progress bar animation */
@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.progress-bar {
  animation: progress linear;
}
</style>
