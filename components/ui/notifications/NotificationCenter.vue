<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/toast'
import { useNotificationStore } from '@/store/modules/notifications'
import { 
  Bell, 
  BellOff, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  Settings, 
  Calendar,
  MessageSquare,
  Users,
  DollarSign,
  AlertTriangle,
  Info,
  Clock
} from 'lucide-vue-next'
import type { Notification, NotificationType } from '@/types/notifications'

interface Props {
  showBadge?: boolean
  maxNotifications?: number
}

const props = withDefaults(defineProps<Props>(), {
  showBadge: true,
  maxNotifications: 10
})

const emit = defineEmits<{
  notificationClicked: [notification: Notification]
  settingsRequested: []
}>()

const { toast } = useToast()
const notificationStore = useNotificationStore()

// Component state
const isOpen = ref(false)
const isLoading = ref(false)

// Computed
const unreadCount = computed(() => notificationStore.unreadCount)
const recentNotifications = computed(() => 
  notificationStore.recentNotifications.slice(0, props.maxNotifications)
)
const hasNotifications = computed(() => recentNotifications.value.length > 0)
const showUnreadBadge = computed(() => props.showBadge && unreadCount.value > 0)

// Format notification timestamp
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return date.toLocaleDateString()
}

// Get notification icon based on type
const getNotificationIcon = (type: NotificationType) => {
  const iconMap: Record<string, any> = {
    session_: Calendar,
    message_: MessageSquare,
    mentor_: Users,
    mentee_: Users,
    payment_: DollarSign,
    platform_: Info,
    feature_: Info,
    maintenance_: AlertTriangle,
    weekly_: Clock,
    monthly_: Clock,
    goal_: Clock,
    user_: Users,
    verification_: AlertTriangle
  }
  
  // Find the first matching prefix
  const prefix = Object.keys(iconMap).find(key => type.startsWith(key.replace('_', '')))
  return prefix ? iconMap[prefix] : Bell
}

// Get notification priority color
const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    low: 'text-gray-500',
    normal: 'text-blue-500',
    high: 'text-amber-500',
    critical: 'text-red-500'
  }
  return colorMap[priority] || colorMap.normal
}

// Handle notification click
const handleNotificationClick = async (notification: Notification) => {
  // Mark as read if not already read
  if (!notification.readAt) {
    await notificationStore.markAsRead(notification.id)
  }
  
  emit('notificationClicked', notification)
  
  // Close popover for navigation notifications
  if (notification.data?.url) {
    isOpen.value = false
  }
}

// Mark all as read
const markAllAsRead = async () => {
  isLoading.value = true
  try {
    await notificationStore.markAllAsRead()
    toast({
      title: 'Success',
      description: 'All notifications marked as read',
      variant: 'success'
    })
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to mark notifications as read',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

// Clear all notifications
const clearAllNotifications = async () => {
  if (!confirm('Are you sure you want to clear all notifications?')) return
  
  isLoading.value = true
  try {
    await notificationStore.clearAllNotifications()
    toast({
      title: 'Success',
      description: 'All notifications cleared',
      variant: 'success'
    })
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to clear notifications',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

// Delete individual notification
const deleteNotification = async (notification: Notification, event: Event) => {
  event.stopPropagation()
  
  try {
    await notificationStore.deleteNotification(notification.id)
    toast({
      title: 'Success',
      description: 'Notification deleted',
      variant: 'success'
    })
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to delete notification',
      variant: 'destructive'
    })
  }
}

// Request notification settings
const openSettings = () => {
  isOpen.value = false
  emit('settingsRequested')
}

// Auto-refresh notifications
let refreshInterval: NodeJS.Timeout | null = null

const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    if (!isOpen.value) {
      notificationStore.fetchNotifications(10, 0)
    }
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
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <Button 
        variant="ghost" 
        size="sm" 
        class="relative h-8 w-8 p-0"
        :aria-label="`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`"
      >
        <Bell class="h-4 w-4" />
        
        <!-- Notification badge -->
        <Badge
          v-if="showUnreadBadge"
          variant="destructive"
          class="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center min-w-[1.25rem]"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </Badge>
      </Button>
    </PopoverTrigger>
    
    <PopoverContent 
      class="w-80 p-0" 
      align="end"
      :side-offset="8"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <div class="flex items-center gap-2">
          <Bell class="h-4 w-4" />
          <h3 class="font-semibold">Notifications</h3>
          <Badge v-if="unreadCount > 0" variant="secondary" class="text-xs">
            {{ unreadCount }}
          </Badge>
        </div>
        
        <div class="flex items-center gap-1">
          <Button
            v-if="hasNotifications"
            @click="markAllAsRead"
            size="sm"
            variant="ghost"
            class="h-7 w-7 p-0"
            :disabled="isLoading || unreadCount === 0"
            title="Mark all as read"
          >
            <CheckCheck class="h-3 w-3" />
          </Button>
          
          <Button
            @click="openSettings"
            size="sm"
            variant="ghost"
            class="h-7 w-7 p-0"
            title="Notification settings"
          >
            <Settings class="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <!-- Notifications list -->
      <ScrollArea class="max-h-96">
        <div v-if="!hasNotifications" class="p-8 text-center">
          <div class="flex flex-col items-center gap-2 text-muted-foreground">
            <BellOff class="h-8 w-8" />
            <p class="text-sm">No notifications</p>
            <p class="text-xs">You're all caught up!</p>
          </div>
        </div>
        
        <div v-else class="space-y-1 p-2">
          <div
            v-for="notification in recentNotifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            class="relative group cursor-pointer rounded-md p-3 hover:bg-muted/50 transition-colors"
            :class="{
              'bg-muted/20': !notification.readAt,
              'opacity-75': notification.readAt
            }"
          >
            <!-- Unread indicator -->
            <div
              v-if="!notification.readAt"
              class="absolute top-3 left-1 w-2 h-2 bg-primary rounded-full"
            />
            
            <div class="flex gap-3 pl-4">
              <!-- Icon -->
              <div class="flex-shrink-0 mt-0.5">
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center"
                  :class="getPriorityColor(notification.priority)"
                >
                  <component 
                    :is="getNotificationIcon(notification.type)" 
                    class="h-4 w-4" 
                  />
                </div>
              </div>
              
              <!-- Content -->
              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex items-start justify-between">
                  <h4 class="text-sm font-medium leading-tight line-clamp-2">
                    {{ notification.title }}
                  </h4>
                  
                  <!-- Delete button -->
                  <Button
                    @click="deleteNotification(notification, $event)"
                    size="sm"
                    variant="ghost"
                    class="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 ml-2 flex-shrink-0"
                    title="Delete notification"
                  >
                    <X class="h-3 w-3" />
                  </Button>
                </div>
                
                <p class="text-xs text-muted-foreground line-clamp-2">
                  {{ notification.message }}
                </p>
                
                <div class="flex items-center justify-between">
                  <span class="text-xs text-muted-foreground">
                    {{ formatTimestamp(notification.sentAt) }}
                  </span>
                  
                  <!-- Priority indicator -->
                  <Badge
                    v-if="notification.priority === 'critical'"
                    variant="destructive"
                    class="text-xs px-1 py-0"
                  >
                    Critical
                  </Badge>
                  <Badge
                    v-else-if="notification.priority === 'high'"
                    variant="secondary"
                    class="text-xs px-1 py-0"
                  >
                    High
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      
      <!-- Footer -->
      <div v-if="hasNotifications" class="p-2 border-t">
        <div class="flex items-center justify-between">
          <Button
            @click="clearAllNotifications"
            size="sm"
            variant="ghost"
            :disabled="isLoading"
            class="text-xs text-muted-foreground hover:text-foreground"
          >
            <Trash2 class="h-3 w-3 mr-1" />
            Clear all
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            class="text-xs text-muted-foreground hover:text-foreground"
            @click="isOpen = false"
          >
            View all notifications
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 