export type NotificationChannel = 'email' | 'in_app' | 'push' | 'sms'

export type NotificationFrequency = 'immediate' | 'daily_digest' | 'weekly_digest' | 'disabled'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical'

export type NotificationType = 
  // Session-related
  | 'session_reminder'
  | 'session_request'
  | 'session_confirmed'
  | 'session_cancelled'
  | 'session_rescheduled'
  | 'session_completed'
  
  // Communication
  | 'new_message'
  | 'message_reply'
  
  // Mentor/Mentee relationships
  | 'mentor_assigned'
  | 'mentee_assigned'
  | 'mentor_request'
  | 'mentee_application'
  
  // Payments (for mentors)
  | 'payment_received'
  | 'payment_pending'
  | 'payment_failed'
  | 'earnings_report'
  
  // Platform updates
  | 'platform_announcement'
  | 'feature_update'
  | 'maintenance_notice'
  
  // Reports and summaries
  | 'weekly_summary'
  | 'monthly_report'
  | 'goal_reminder'
  
  // Administrative (for admins)
  | 'user_registration'
  | 'mentor_verification'
  | 'payment_issue'
  | 'platform_alert'

export interface NotificationPreference {
  type: NotificationType
  channels: {
    email: boolean
    in_app: boolean
    push: boolean
    sms: boolean
  }
  frequency: NotificationFrequency
  priority: NotificationPriority
  enabled: boolean
}

export interface NotificationSettings {
  // General settings
  globallyEnabled: boolean
  quietHours: {
    enabled: boolean
    startTime: string // HH:MM format
    endTime: string   // HH:MM format
    timezone: string
  }
  
  // Channel-specific settings
  emailSettings: {
    enabled: boolean
    address: string
    digestFrequency: 'daily' | 'weekly' | 'disabled'
    digestTime: string // HH:MM format
  }
  
  pushSettings: {
    enabled: boolean
    soundEnabled: boolean
    vibrationEnabled: boolean
    badgeEnabled: boolean
  }
  
  smsSettings: {
    enabled: boolean
    phoneNumber: string
    emergencyOnly: boolean
  }
  
  // Per-notification preferences
  preferences: Record<NotificationType, NotificationPreference>
  
  // Metadata
  lastUpdated: string
  version: string
}

export interface NotificationCategory {
  id: string
  name: string
  description: string
  icon: string
  types: NotificationType[]
  defaultEnabled: boolean
  priority: NotificationPriority
}

export interface NotificationTemplate {
  type: NotificationType
  channel: NotificationChannel
  subject?: string
  title: string
  body: string
  actionText?: string
  actionUrl?: string
  variables: string[]
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  channel: NotificationChannel
  priority: NotificationPriority
  
  // Content
  title: string
  message: string
  data?: Record<string, any>
  
  // Delivery info
  sentAt: string
  readAt?: string
  clickedAt?: string
  
  // Status
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  retryCount: number
  
  // Metadata
  templateId?: string
  batchId?: string
}

export interface NotificationBatch {
  id: string
  type: NotificationType
  recipientCount: number
  sentAt: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  metadata: Record<string, any>
}

// Default notification categories
export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  {
    id: 'sessions',
    name: 'Sessions',
    description: 'Notifications about mentoring sessions',
    icon: 'calendar',
    types: [
      'session_reminder',
      'session_request',
      'session_confirmed',
      'session_cancelled',
      'session_rescheduled',
      'session_completed'
    ],
    defaultEnabled: true,
    priority: 'high'
  },
  {
    id: 'communication',
    name: 'Messages',
    description: 'Chat and messaging notifications',
    icon: 'message-circle',
    types: [
      'new_message',
      'message_reply'
    ],
    defaultEnabled: true,
    priority: 'normal'
  },
  {
    id: 'relationships',
    name: 'Mentoring Relationships',
    description: 'Mentor and mentee assignments',
    icon: 'users',
    types: [
      'mentor_assigned',
      'mentee_assigned',
      'mentor_request',
      'mentee_application'
    ],
    defaultEnabled: true,
    priority: 'high'
  },
  {
    id: 'payments',
    name: 'Payments & Earnings',
    description: 'Payment and earnings notifications',
    icon: 'dollar-sign',
    types: [
      'payment_received',
      'payment_pending',
      'payment_failed',
      'earnings_report'
    ],
    defaultEnabled: true,
    priority: 'high'
  },
  {
    id: 'platform',
    name: 'Platform Updates',
    description: 'System announcements and updates',
    icon: 'bell',
    types: [
      'platform_announcement',
      'feature_update',
      'maintenance_notice'
    ],
    defaultEnabled: true,
    priority: 'low'
  },
  {
    id: 'reports',
    name: 'Reports & Summaries',
    description: 'Progress reports and summaries',
    icon: 'bar-chart',
    types: [
      'weekly_summary',
      'monthly_report',
      'goal_reminder'
    ],
    defaultEnabled: false,
    priority: 'low'
  },
  {
    id: 'admin',
    name: 'Administrative',
    description: 'Admin-only notifications',
    icon: 'shield',
    types: [
      'user_registration',
      'mentor_verification',
      'payment_issue',
      'platform_alert'
    ],
    defaultEnabled: true,
    priority: 'critical'
  }
]

// Default notification preferences based on user role
export const getDefaultNotificationSettings = (userRole: 'employee' | 'mentor' | 'corporate_admin'): NotificationSettings => {
  const basePreferences: Record<NotificationType, NotificationPreference> = {} as any

  // Initialize all notification types with default settings
  NOTIFICATION_CATEGORIES.forEach(category => {
    category.types.forEach(type => {
      basePreferences[type] = {
        type,
        channels: {
          email: category.defaultEnabled,
          in_app: true,
          push: category.priority === 'high' || category.priority === 'critical',
          sms: category.priority === 'critical'
        },
        frequency: category.priority === 'critical' ? 'immediate' : 'immediate',
        priority: category.priority,
        enabled: category.defaultEnabled
      }
    })
  })

  // Role-specific customizations
  if (userRole === 'employee') {
    // Disable payment notifications for employees
    NOTIFICATION_CATEGORIES.find(c => c.id === 'payments')?.types.forEach(type => {
      basePreferences[type].enabled = false
    })
    
    // Disable admin notifications
    NOTIFICATION_CATEGORIES.find(c => c.id === 'admin')?.types.forEach(type => {
      basePreferences[type].enabled = false
    })
  }

  if (userRole === 'mentor') {
    // Enable all payment notifications for mentors
    NOTIFICATION_CATEGORIES.find(c => c.id === 'payments')?.types.forEach(type => {
      basePreferences[type].enabled = true
      basePreferences[type].channels.email = true
    })
    
    // Disable admin notifications
    NOTIFICATION_CATEGORIES.find(c => c.id === 'admin')?.types.forEach(type => {
      basePreferences[type].enabled = false
    })
  }

  if (userRole === 'corporate_admin') {
    // Enable all notifications for admins
    Object.values(basePreferences).forEach(pref => {
      pref.enabled = true
    })
  }

  return {
    globallyEnabled: true,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'UTC'
    },
    emailSettings: {
      enabled: true,
      address: '',
      digestFrequency: 'daily',
      digestTime: '09:00'
    },
    pushSettings: {
      enabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      badgeEnabled: true
    },
    smsSettings: {
      enabled: false,
      phoneNumber: '',
      emergencyOnly: true
    },
    preferences: basePreferences,
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  }
}

// Utility functions
export const getNotificationCategoryByType = (type: NotificationType): NotificationCategory | undefined => {
  return NOTIFICATION_CATEGORIES.find(category => category.types.includes(type))
}

export const getNotificationsByCategory = (categoryId: string): NotificationType[] => {
  const category = NOTIFICATION_CATEGORIES.find(c => c.id === categoryId)
  return category?.types || []
}

export const isNotificationAllowed = (
  settings: NotificationSettings,
  type: NotificationType,
  channel: NotificationChannel
): boolean => {
  if (!settings.globallyEnabled) return false
  
  const preference = settings.preferences[type]
  if (!preference?.enabled) return false
  
  // Check channel-specific settings
  switch (channel) {
    case 'email':
      return settings.emailSettings.enabled && preference.channels.email
    case 'push':
      return settings.pushSettings.enabled && preference.channels.push
    case 'sms':
      return settings.smsSettings.enabled && preference.channels.sms
    case 'in_app':
      return preference.channels.in_app
    default:
      return false
  }
}

export const isInQuietHours = (settings: NotificationSettings, timestamp: Date = new Date()): boolean => {
  if (!settings.quietHours.enabled) return false
  
  // This is a simplified version - in reality you'd need proper timezone handling
  const hour = timestamp.getHours()
  const startHour = parseInt(settings.quietHours.startTime.split(':')[0])
  const endHour = parseInt(settings.quietHours.endTime.split(':')[0])
  
  if (startHour <= endHour) {
    return hour >= startHour && hour < endHour
  } else {
    // Quiet hours span midnight
    return hour >= startHour || hour < endHour
  }
} 