import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Notification, 
  NotificationSettings, 
  NotificationType, 
  NotificationChannel,
  NotificationBatch
} from '@/types/notifications'
import { 
  getDefaultNotificationSettings,
  isNotificationAllowed,
  isInQuietHours
} from '@/types/notifications'

export const useNotificationStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([])
  const settings = ref<NotificationSettings | null>(null)
  const isLoading = ref(false)
  const lastFetched = ref<Date | null>(null)
  const unreadCount = ref(0)
  const permissionStatus = ref<NotificationPermission>('default')
  const isSubscribedToPush = ref(false)

  // Computed
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.readAt)
  )

  const recentNotifications = computed(() =>
    notifications.value
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(0, 20)
  )

  const notificationsByType = computed(() => {
    const grouped: Record<NotificationType, Notification[]> = {} as any
    notifications.value.forEach(notification => {
      if (!grouped[notification.type]) {
        grouped[notification.type] = []
      }
      grouped[notification.type].push(notification)
    })
    return grouped
  })

  const criticalNotifications = computed(() =>
    notifications.value.filter(n => n.priority === 'critical' && !n.readAt)
  )

  // Notification permissions
  const hasNotificationPermission = computed(() => 
    permissionStatus.value === 'granted'
  )

  const canShowNotifications = computed(() => {
    if (!settings.value || !settings.value.globallyEnabled) return false
    if (isInQuietHours(settings.value)) return false
    return hasNotificationPermission.value
  })

  // Actions
  const loadSettings = async (userId?: string): Promise<void> => {
    isLoading.value = true
    try {
      const response = await fetch(`/api/notifications/settings${userId ? `?userId=${userId}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        settings.value = await response.json()
      } else {
        // Fallback to default settings
        const userRole = getUserRole() // This would come from auth store
        settings.value = getDefaultNotificationSettings(userRole)
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error)
      // Use default settings as fallback
      const userRole = getUserRole()
      settings.value = getDefaultNotificationSettings(userRole)
    } finally {
      isLoading.value = false
    }
  }

  const saveSettings = async (newSettings: NotificationSettings): Promise<void> => {
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newSettings)
      })

      if (response.ok) {
        settings.value = newSettings
        // Save to localStorage as backup
        localStorage.setItem('notificationSettings', JSON.stringify(newSettings))
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save notification settings:', error)
      throw error
    }
  }

  const fetchNotifications = async (limit = 50, offset = 0): Promise<void> => {
    isLoading.value = true
    try {
      const response = await fetch(`/api/notifications?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // If offset is 0, replace all notifications, otherwise append
        if (offset === 0) {
          notifications.value = data.notifications
        } else {
          notifications.value.push(...data.notifications)
        }
        
        unreadCount.value = data.unreadCount
        lastFetched.value = new Date()
      } else {
        throw new Error('Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const notification = notifications.value.find(n => n.id === notificationId)
        if (notification && !notification.readAt) {
          notification.readAt = new Date().toISOString()
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async (): Promise<void> => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const now = new Date().toISOString()
        notifications.value.forEach(notification => {
          if (!notification.readAt) {
            notification.readAt = now
          }
        })
        unreadCount.value = 0
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const index = notifications.value.findIndex(n => n.id === notificationId)
        if (index > -1) {
          const notification = notifications.value[index]
          notifications.value.splice(index, 1)
          
          // Update unread count if notification was unread
          if (!notification.readAt) {
            unreadCount.value = Math.max(0, unreadCount.value - 1)
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const clearAllNotifications = async (): Promise<void> => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        notifications.value = []
        unreadCount.value = 0
      }
    } catch (error) {
      console.error('Failed to clear all notifications:', error)
    }
  }

  // Push notification management
  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      permissionStatus.value = 'granted'
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      permissionStatus.value = 'denied'
      return 'denied'
    }

    // Request permission
    const permission = await Notification.requestPermission()
    permissionStatus.value = permission
    return permission
  }

  const subscribeToPushNotifications = async (): Promise<boolean> => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications are not supported')
        return false
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VAPID_PUBLIC_KEY // You'll need to set this
      })

      // Send subscription to server
      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(subscription)
      })

      if (response.ok) {
        isSubscribedToPush.value = true
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return false
    }
  }

  const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        
        // Notify server
        await fetch('/api/notifications/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })
      }

      isSubscribedToPush.value = false
      return true
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  // In-app notification display
  const showInAppNotification = (
    type: NotificationType, 
    title: string, 
    message: string, 
    data?: any
  ): void => {
    if (!settings.value || !canShowNotifications.value) return
    if (!isNotificationAllowed(settings.value, type, 'in_app')) return

    // Add to notifications list
    const notification: Notification = {
      id: `local-${Date.now()}`,
      userId: getCurrentUserId(), // This would come from auth store
      type,
      channel: 'in_app',
      priority: settings.value.preferences[type]?.priority || 'normal',
      title,
      message,
      data,
      sentAt: new Date().toISOString(),
      status: 'delivered',
      retryCount: 0
    }

    notifications.value.unshift(notification)
    unreadCount.value++

    // Trigger browser notification if enabled
    if (hasNotificationPermission.value && isNotificationAllowed(settings.value, type, 'push')) {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: type,
        requireInteraction: notification.priority === 'critical'
      })
    }
  }

  const sendTestNotification = async (
    type: NotificationType, 
    channel: NotificationChannel
  ): Promise<void> => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type, channel })
      })

      if (!response.ok) {
        throw new Error('Failed to send test notification')
      }

      // For in-app notifications, show immediately
      if (channel === 'in_app') {
        showInAppNotification(
          type,
          'Test Notification',
          `This is a test ${type.replace(/_/g, ' ')} notification.`
        )
      }
    } catch (error) {
      console.error('Failed to send test notification:', error)
      throw error
    }
  }

  // Utility functions
  const getUserRole = (): 'employee' | 'mentor' | 'corporate_admin' => {
    // This would typically come from the auth store
    // For now, return a default
    return 'employee'
  }

  const getCurrentUserId = (): string => {
    // This would typically come from the auth store
    return 'current-user-id'
  }

  // Real-time updates (WebSocket)
  const connectToRealtimeUpdates = (): void => {
    // This would set up WebSocket connection for real-time notifications
    // Implementation would depend on your WebSocket setup
  }

  const disconnectFromRealtimeUpdates = (): void => {
    // Clean up WebSocket connection
  }

  // Initialize
  const initialize = async (): Promise<void> => {
    // Check current notification permission
    if ('Notification' in window) {
      permissionStatus.value = Notification.permission
    }

    // Check if already subscribed to push
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        isSubscribedToPush.value = !!subscription
      } catch (error) {
        console.error('Failed to check push subscription:', error)
      }
    }

    // Load settings and notifications
    await Promise.all([
      loadSettings(),
      fetchNotifications()
    ])

    // Connect to real-time updates
    connectToRealtimeUpdates()
  }

  return {
    // State
    notifications,
    settings,
    isLoading,
    lastFetched,
    unreadCount,
    permissionStatus,
    isSubscribedToPush,

    // Computed
    unreadNotifications,
    recentNotifications,
    notificationsByType,
    criticalNotifications,
    hasNotificationPermission,
    canShowNotifications,

    // Actions
    loadSettings,
    saveSettings,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    requestNotificationPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    showInAppNotification,
    sendTestNotification,
    connectToRealtimeUpdates,
    disconnectFromRealtimeUpdates,
    initialize
  }
}) 