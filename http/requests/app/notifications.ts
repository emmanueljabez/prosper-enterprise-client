import axios from '@/http/axios'
import type { 
  NotificationSettings, 
  Notification, 
  NotificationType, 
  NotificationChannel,
  NotificationBatch
} from '@/types/notifications'

export interface NotificationResponse {
  notifications: Notification[]
  unreadCount: number
  totalCount: number
  hasMore: boolean
}

export interface NotificationFilters {
  type?: NotificationType[]
  channel?: NotificationChannel[]
  priority?: string[]
  read?: boolean
  startDate?: string
  endDate?: string
}

// Notification Settings API
export const notificationSettingsApi = {
  // Get user notification settings
  getSettings: async (userId?: string): Promise<NotificationSettings> => {
    const params = userId ? { userId } : {}
    const response = await axios.get('/notifications/settings', { params })
    return response.data
  },

  // Update notification settings
  updateSettings: async (settings: NotificationSettings): Promise<NotificationSettings> => {
    const response = await axios.put('/notifications/settings', settings)
    return response.data
  },

  // Reset to default settings
  resetToDefaults: async (userRole: 'employee' | 'mentor' | 'corporate_admin'): Promise<NotificationSettings> => {
    const response = await axios.post('/notifications/settings/reset', { userRole })
    return response.data
  },

  // Get notification preferences by category
  getPreferencesByCategory: async (categoryId: string): Promise<any> => {
    const response = await axios.get(`/notifications/settings/categories/${categoryId}`)
    return response.data
  },

  // Update preferences for a category
  updateCategoryPreferences: async (categoryId: string, preferences: any): Promise<void> => {
    await axios.put(`/notifications/settings/categories/${categoryId}`, preferences)
  }
}

// Notifications Management API
export const notificationsApi = {
  // Get notifications with pagination and filtering
  getNotifications: async (
    limit = 50, 
    offset = 0, 
    filters?: NotificationFilters
  ): Promise<NotificationResponse> => {
    const params = {
      limit,
      offset,
      ...filters
    }
    const response = await axios.get('/notifications', { params })
    return response.data
  },

  // Get notification by ID
  getNotification: async (notificationId: string): Promise<Notification> => {
    const response = await axios.get(`/notifications/${notificationId}`)
    return response.data
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await axios.put(`/notifications/${notificationId}/read`)
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await axios.put('/notifications/read-all')
  },

  // Mark multiple notifications as read
  markManyAsRead: async (notificationIds: string[]): Promise<void> => {
    await axios.put('/notifications/read-many', { notificationIds })
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await axios.delete(`/notifications/${notificationId}`)
  },

  // Delete multiple notifications
  deleteMany: async (notificationIds: string[]): Promise<void> => {
    await axios.delete('/notifications/many', { data: { notificationIds } })
  },

  // Clear all notifications
  clearAll: async (): Promise<void> => {
    await axios.delete('/notifications')
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await axios.get('/notifications/unread-count')
    return response.data.count
  },

  // Search notifications
  searchNotifications: async (
    query: string, 
    limit = 20, 
    filters?: NotificationFilters
  ): Promise<NotificationResponse> => {
    const params = {
      q: query,
      limit,
      ...filters
    }
    const response = await axios.get('/notifications/search', { params })
    return response.data
  }
}

// Push Notifications API
export const pushNotificationsApi = {
  // Subscribe to push notifications
  subscribe: async (subscription: PushSubscription): Promise<void> => {
    await axios.post('/notifications/push/subscribe', subscription)
  },

  // Unsubscribe from push notifications
  unsubscribe: async (endpoint: string): Promise<void> => {
    await axios.post('/notifications/push/unsubscribe', { endpoint })
  },

  // Check subscription status
  getSubscriptionStatus: async (): Promise<{ isSubscribed: boolean; subscription?: PushSubscription }> => {
    const response = await axios.get('/notifications/push/status')
    return response.data
  },

  // Update push subscription
  updateSubscription: async (subscription: PushSubscription): Promise<void> => {
    await axios.put('/notifications/push/subscription', subscription)
  }
}

// Testing API
export const notificationTestingApi = {
  // Send test notification
  sendTestNotification: async (
    type: NotificationType, 
    channel: NotificationChannel
  ): Promise<void> => {
    await axios.post('/notifications/test', { type, channel })
  },

  // Send test notification to specific user (admin only)
  sendTestToUser: async (
    userId: string,
    type: NotificationType, 
    channel: NotificationChannel,
    customMessage?: string
  ): Promise<void> => {
    await axios.post('/notifications/test/user', { 
      userId, 
      type, 
      channel, 
      customMessage 
    })
  },

  // Preview notification template
  previewTemplate: async (
    type: NotificationType,
    channel: NotificationChannel,
    variables?: Record<string, any>
  ): Promise<{ title: string; body: string; subject?: string }> => {
    const response = await axios.post('/notifications/preview', {
      type,
      channel,
      variables
    })
    return response.data
  }
}

// Analytics API (for admins)
export const notificationAnalyticsApi = {
  // Get notification delivery stats
  getDeliveryStats: async (
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<any> => {
    const response = await axios.get('/notifications/analytics/delivery', {
      params: { startDate, endDate, groupBy }
    })
    return response.data
  },

  // Get notification engagement stats
  getEngagementStats: async (
    startDate: string,
    endDate: string
  ): Promise<any> => {
    const response = await axios.get('/notifications/analytics/engagement', {
      params: { startDate, endDate }
    })
    return response.data
  },

  // Get notification type performance
  getTypePerformance: async (
    startDate: string,
    endDate: string
  ): Promise<any> => {
    const response = await axios.get('/notifications/analytics/types', {
      params: { startDate, endDate }
    })
    return response.data
  },

  // Get channel performance
  getChannelPerformance: async (
    startDate: string,
    endDate: string
  ): Promise<any> => {
    const response = await axios.get('/notifications/analytics/channels', {
      params: { startDate, endDate }
    })
    return response.data
  },

  // Get user preferences summary
  getUserPreferencesSummary: async (): Promise<any> => {
    const response = await axios.get('/notifications/analytics/preferences')
    return response.data
  }
}

// Batch Operations API
export const notificationBatchApi = {
  // Get batch operations
  getBatches: async (
    limit = 20,
    offset = 0,
    status?: string
  ): Promise<{ batches: NotificationBatch[]; totalCount: number }> => {
    const params = { limit, offset, status }
    const response = await axios.get('/notifications/batches', { params })
    return response.data
  },

  // Get batch details
  getBatch: async (batchId: string): Promise<NotificationBatch> => {
    const response = await axios.get(`/notifications/batches/${batchId}`)
    return response.data
  },

  // Create batch notification
  createBatch: async (
    type: NotificationType,
    recipients: string[],
    data: any
  ): Promise<NotificationBatch> => {
    const response = await axios.post('/notifications/batches', {
      type,
      recipients,
      data
    })
    return response.data
  },

  // Cancel batch operation
  cancelBatch: async (batchId: string): Promise<void> => {
    await axios.put(`/notifications/batches/${batchId}/cancel`)
  },

  // Retry failed batch
  retryBatch: async (batchId: string): Promise<NotificationBatch> => {
    const response = await axios.post(`/notifications/batches/${batchId}/retry`)
    return response.data
  }
}

// Email Digest API
export const emailDigestApi = {
  // Get digest preferences
  getDigestPreferences: async (): Promise<any> => {
    const response = await axios.get('/notifications/digest/preferences')
    return response.data
  },

  // Update digest preferences
  updateDigestPreferences: async (preferences: any): Promise<void> => {
    await axios.put('/notifications/digest/preferences', preferences)
  },

  // Preview next digest
  previewDigest: async (frequency: 'daily' | 'weekly'): Promise<any> => {
    const response = await axios.get(`/notifications/digest/preview/${frequency}`)
    return response.data
  },

  // Send digest immediately (admin only)
  sendDigestNow: async (
    userId: string,
    frequency: 'daily' | 'weekly'
  ): Promise<void> => {
    await axios.post('/notifications/digest/send', { userId, frequency })
  },

  // Get digest history
  getDigestHistory: async (
    limit = 20,
    offset = 0
  ): Promise<any> => {
    const response = await axios.get('/notifications/digest/history', {
      params: { limit, offset }
    })
    return response.data
  }
}

// Template Management API (admin only)
export const notificationTemplateApi = {
  // Get all templates
  getTemplates: async (): Promise<any> => {
    const response = await axios.get('/notifications/templates')
    return response.data
  },

  // Get template by type and channel
  getTemplate: async (
    type: NotificationType,
    channel: NotificationChannel
  ): Promise<any> => {
    const response = await axios.get(`/notifications/templates/${type}/${channel}`)
    return response.data
  },

  // Update template
  updateTemplate: async (
    type: NotificationType,
    channel: NotificationChannel,
    template: any
  ): Promise<void> => {
    await axios.put(`/notifications/templates/${type}/${channel}`, template)
  },

  // Test template
  testTemplate: async (
    type: NotificationType,
    channel: NotificationChannel,
    variables: Record<string, any>
  ): Promise<any> => {
    const response = await axios.post('/notifications/templates/test', {
      type,
      channel,
      variables
    })
    return response.data
  }
}

// Export all APIs
export default {
  settings: notificationSettingsApi,
  notifications: notificationsApi,
  push: pushNotificationsApi,
  testing: notificationTestingApi,
  analytics: notificationAnalyticsApi,
  batch: notificationBatchApi,
  digest: emailDigestApi,
  templates: notificationTemplateApi
} 