<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useToast } from '@/components/ui/toast'
import { useAuthStore } from '@/store/modules/auth'
import { RoleManager } from '@/utils/roleManager'
import { 
  Bell, 
  BellOff, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Clock,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Calendar,
  Users,
  DollarSign,
  BarChart,
  Shield,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-vue-next'
import type { 
  NotificationSettings, 
  NotificationCategory, 
  NotificationType,
  NotificationChannel,
  NotificationFrequency
} from '@/types/notifications'
import { 
  NOTIFICATION_CATEGORIES, 
  getDefaultNotificationSettings,
  isNotificationAllowed 
} from '@/types/notifications'

interface Props {
  userId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  settingsUpdated: [settings: NotificationSettings]
  testNotification: [type: NotificationType, channel: NotificationChannel]
}>()

const authStore = useAuthStore()
const { toast } = useToast()

// Component state
const isLoading = ref(false)
const isSaving = ref(false)
const hasChanges = ref(false)
const expandedCategories = ref<Set<string>>(new Set(['sessions', 'communication']))
const testingNotifications = ref<Set<string>>(new Set())

// Form data
const settings = ref<NotificationSettings>({} as NotificationSettings)
const originalSettings = ref<NotificationSettings>({} as NotificationSettings)

// Current user info
const currentUser = computed(() => {
  return authStore.loggedInUser
})

const userRole = computed(() => {
  if (!currentUser.value?.roles?.length) return 'employee'
  const primaryRole = currentUser.value.roles[0].name
  return primaryRole as 'employee' | 'mentor' | 'corporate_admin'
})

// Filter categories based on user role
const availableCategories = computed(() => {
  return NOTIFICATION_CATEGORIES.filter(category => {
    // Hide admin category for non-admins
    if (category.id === 'admin' && !RoleManager.isCorporateAdmin(currentUser.value)) {
      return false
    }
    
    // Hide payments category for employees
    if (category.id === 'payments' && !RoleManager.isMentor(currentUser.value)) {
      return false
    }
    
    return true
  })
})

// Computed notification summary
const notificationSummary = computed(() => {
  if (!settings.value.preferences) return { enabled: 0, total: 0, channels: { email: 0, push: 0, sms: 0 } }
  
  const enabled = Object.values(settings.value.preferences).filter(p => p.enabled).length
  const total = Object.keys(settings.value.preferences).length
  
  const channels = {
    email: Object.values(settings.value.preferences).filter(p => p.enabled && p.channels.email).length,
    push: Object.values(settings.value.preferences).filter(p => p.enabled && p.channels.push).length,
    sms: Object.values(settings.value.preferences).filter(p => p.enabled && p.channels.sms).length
  }
  
  return { enabled, total, channels }
})

// Available time options
const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return { value: `${hour}:00`, label: `${hour}:00` }
})

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
]

// Category management
const toggleCategory = (categoryId: string) => {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId)
  } else {
    expandedCategories.value.add(categoryId)
  }
}

const toggleCategoryEnabled = (category: NotificationCategory, enabled: boolean) => {
  category.types.forEach(type => {
    if (settings.value.preferences[type]) {
      settings.value.preferences[type].enabled = enabled
    }
  })
  hasChanges.value = true
}

// Channel management
const toggleChannelForCategory = (category: NotificationCategory, channel: NotificationChannel, enabled: boolean) => {
  category.types.forEach(type => {
    if (settings.value.preferences[type]) {
      settings.value.preferences[type].channels[channel] = enabled
    }
  })
  hasChanges.value = true
}

// Individual preference management
const updatePreference = (type: NotificationType, updates: Partial<typeof settings.value.preferences[NotificationType]>) => {
  if (settings.value.preferences[type]) {
    Object.assign(settings.value.preferences[type], updates)
    hasChanges.value = true
  }
}

// Global toggles
const toggleGlobalNotifications = (enabled: boolean) => {
  settings.value.globallyEnabled = enabled
  hasChanges.value = true
}

const toggleEmailDigest = (frequency: 'daily' | 'weekly' | 'disabled') => {
  settings.value.emailSettings.digestFrequency = frequency
  hasChanges.value = true
}

// Test notification functionality
const testNotification = async (type: NotificationType, channel: NotificationChannel) => {
  const testKey = `${type}-${channel}`
  testingNotifications.value.add(testKey)
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('testNotification', type, channel)
    
    toast({
      title: 'Test Notification Sent',
      description: `Test ${channel} notification for ${type} has been sent`,
      variant: 'success'
    })
  } catch (error: any) {
    toast({
      title: 'Test Failed',
      description: error.message || 'Failed to send test notification',
      variant: 'destructive'
    })
  } finally {
    testingNotifications.value.delete(testKey)
  }
}

// Load settings
const loadSettings = async () => {
  isLoading.value = true
  try {
    // In a real app, this would fetch from API
    const defaultSettings = getDefaultNotificationSettings(userRole.value)
    
    // For demo, load from localStorage or use defaults
    const savedSettings = localStorage.getItem('notificationSettings')
    if (savedSettings) {
      settings.value = { ...defaultSettings, ...JSON.parse(savedSettings) }
    } else {
      settings.value = defaultSettings
    }
    
    // Set email address from user profile
    if (currentUser.value?.email) {
      settings.value.emailSettings.address = currentUser.value.email
    }
    
    originalSettings.value = JSON.parse(JSON.stringify(settings.value))
    hasChanges.value = false
  } catch (error: any) {
    toast({
      title: 'Load Failed',
      description: error.message || 'Failed to load notification settings',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

// Save settings
const saveSettings = async () => {
  isSaving.value = true
  try {
    // Update timestamp
    settings.value.lastUpdated = new Date().toISOString()
    
    // In a real app, this would save to API
    const response = await fetch('/api/notifications/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(settings.value)
    })
    
    // For demo, save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(settings.value))
    
    originalSettings.value = JSON.parse(JSON.stringify(settings.value))
    hasChanges.value = false
    
    emit('settingsUpdated', settings.value)
    
    toast({
      title: 'Settings Saved',
      description: 'Your notification preferences have been updated',
      variant: 'success'
    })
  } catch (error: any) {
    toast({
      title: 'Save Failed',
      description: error.message || 'Failed to save notification settings',
      variant: 'destructive'
    })
  } finally {
    isSaving.value = false
  }
}

// Reset settings
const resetSettings = () => {
  const confirmed = confirm('Are you sure you want to reset all notification preferences to default values?')
  if (confirmed) {
    settings.value = getDefaultNotificationSettings(userRole.value)
    if (currentUser.value?.email) {
      settings.value.emailSettings.address = currentUser.value.email
    }
    hasChanges.value = true
    
    toast({
      title: 'Settings Reset',
      description: 'All notification preferences have been reset to defaults',
      variant: 'success'
    })
  }
}

// Cancel changes
const cancelChanges = () => {
  settings.value = JSON.parse(JSON.stringify(originalSettings.value))
  hasChanges.value = false
  
  toast({
    title: 'Changes Cancelled',
    description: 'Your notification preferences have been reverted',
    variant: 'success'
  })
}

// Helper functions
const getCategoryIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    calendar: Calendar,
    'message-circle': MessageSquare,
    users: Users,
    'dollar-sign': DollarSign,
    bell: Bell,
    'bar-chart': BarChart,
    shield: Shield
  }
  return iconMap[iconName] || Bell
}

const getChannelIcon = (channel: NotificationChannel) => {
  const iconMap: Record<NotificationChannel, any> = {
    email: Mail,
    push: Smartphone,
    sms: MessageSquare,
    in_app: Bell
  }
  return iconMap[channel]
}

const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-amber-100 text-amber-800',
    critical: 'bg-red-100 text-red-800'
  }
  return colorMap[priority] || colorMap.normal
}

// Watch for changes
watch(() => settings.value, () => {
  // hasChanges.value will be set by individual update functions
}, { deep: true })

// Initialize
onMounted(() => {
  loadSettings()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Notification Preferences</h1>
        <p class="text-muted-foreground">
          Customize how and when you receive notifications
        </p>
      </div>
      
      <div class="flex items-center gap-2">
        <Button
          v-if="hasChanges"
          @click="cancelChanges"
          variant="outline"
          :disabled="isSaving"
        >
          <RotateCcw class="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          @click="resetSettings"
          variant="outline"
          :disabled="isSaving"
        >
          Reset to Defaults
        </Button>
        <Button
          @click="saveSettings"
          :disabled="!hasChanges || isSaving"
          class="flex items-center gap-2"
        >
          <Save class="h-4 w-4" />
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </Button>
      </div>
    </div>

    <!-- Summary Card -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Settings class="h-5 w-5" />
          Notification Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary">
              {{ notificationSummary.enabled }}/{{ notificationSummary.total }}
            </div>
            <div class="text-sm text-muted-foreground">Notifications Enabled</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">
              {{ notificationSummary.channels.email }}
            </div>
            <div class="text-sm text-muted-foreground">Email Notifications</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">
              {{ notificationSummary.channels.push }}
            </div>
            <div class="text-sm text-muted-foreground">Push Notifications</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">
              {{ notificationSummary.channels.sms }}
            </div>
            <div class="text-sm text-muted-foreground">SMS Notifications</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Global Settings -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Bell class="h-5 w-5" />
          Global Settings
        </CardTitle>
        <CardDescription>
          Master controls for all notifications
        </CardDescription>
      </CardHeader>
      
      <CardContent class="space-y-6">
        <!-- Master Toggle -->
        <div class="flex items-center justify-between space-x-2 p-4 border rounded-lg">
          <div class="space-y-0.5">
            <Label class="text-base font-medium">Enable All Notifications</Label>
            <p class="text-sm text-muted-foreground">
              Master toggle to enable or disable all notifications
            </p>
          </div>
          <Switch
            :checked="settings.globallyEnabled"
            @update:checked="toggleGlobalNotifications"
          />
        </div>

        <!-- Quiet Hours -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Moon class="h-4 w-4" />
              <Label class="text-base font-medium">Quiet Hours</Label>
            </div>
            <Switch
              :checked="settings.quietHours?.enabled || false"
              @update:checked="(enabled) => { settings.quietHours.enabled = enabled; hasChanges = true }"
            />
          </div>
          
          <div v-if="settings.quietHours?.enabled" class="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
            <div class="space-y-2">
              <Label for="startTime">Start Time</Label>
              <Select
                :model-value="settings.quietHours.startTime"
                @update:model-value="(value) => { settings.quietHours.startTime = value; hasChanges = true }"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="time in timeOptions"
                    :key="time.value"
                    :value="time.value"
                  >
                    {{ time.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="endTime">End Time</Label>
              <Select
                :model-value="settings.quietHours.endTime"
                @update:model-value="(value) => { settings.quietHours.endTime = value; hasChanges = true }"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="time in timeOptions"
                    :key="time.value"
                    :value="time.value"
                  >
                    {{ time.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="timezone">Timezone</Label>
              <Select
                :model-value="settings.quietHours.timezone"
                @update:model-value="(value) => { settings.quietHours.timezone = value; hasChanges = true }"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="tz in timezones"
                    :key="tz.value"
                    :value="tz.value"
                  >
                    {{ tz.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Channel Settings -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Smartphone class="h-5 w-5" />
          Channel Settings
        </CardTitle>
        <CardDescription>
          Configure individual notification channels
        </CardDescription>
      </CardHeader>
      
      <CardContent class="space-y-6">
        <!-- Email Settings -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Mail class="h-4 w-4" />
              <Label class="text-base font-medium">Email Notifications</Label>
            </div>
            <Switch
              :checked="settings.emailSettings?.enabled || false"
              @update:checked="(enabled) => { settings.emailSettings.enabled = enabled; hasChanges = true }"
            />
          </div>
          
          <div v-if="settings.emailSettings?.enabled" class="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
            <div class="space-y-2">
              <Label for="emailAddress">Email Address</Label>
              <Input
                id="emailAddress"
                type="email"
                :model-value="settings.emailSettings.address"
                @update:model-value="(value) => { settings.emailSettings.address = value; hasChanges = true }"
                placeholder="your-email@example.com"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="digestFrequency">Digest Frequency</Label>
              <Select
                :model-value="settings.emailSettings.digestFrequency"
                @update:model-value="(value) => { settings.emailSettings.digestFrequency = value; hasChanges = true }"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="digestTime">Digest Time</Label>
              <Select
                :model-value="settings.emailSettings.digestTime"
                @update:model-value="(value) => { settings.emailSettings.digestTime = value; hasChanges = true }"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="time in timeOptions"
                    :key="time.value"
                    :value="time.value"
                  >
                    {{ time.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <!-- Push Notifications -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Smartphone class="h-4 w-4" />
              <Label class="text-base font-medium">Push Notifications</Label>
            </div>
            <Switch
              :checked="settings.pushSettings?.enabled || false"
              @update:checked="(enabled) => { settings.pushSettings.enabled = enabled; hasChanges = true }"
            />
          </div>
          
          <div v-if="settings.pushSettings?.enabled" class="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
            <div class="flex items-center justify-between space-x-2">
              <Label class="flex items-center gap-2">
                <Volume2 class="h-4 w-4" />
                Sound
              </Label>
              <Switch
                :checked="settings.pushSettings.soundEnabled"
                @update:checked="(enabled) => { settings.pushSettings.soundEnabled = enabled; hasChanges = true }"
              />
            </div>
            
            <div class="flex items-center justify-between space-x-2">
              <Label class="flex items-center gap-2">
                <Smartphone class="h-4 w-4" />
                Vibration
              </Label>
              <Switch
                :checked="settings.pushSettings.vibrationEnabled"
                @update:checked="(enabled) => { settings.pushSettings.vibrationEnabled = enabled; hasChanges = true }"
              />
            </div>
            
            <div class="flex items-center justify-between space-x-2">
              <Label class="flex items-center gap-2">
                <Badge class="h-4 w-4" />
                Badge
              </Label>
              <Switch
                :checked="settings.pushSettings.badgeEnabled"
                @update:checked="(enabled) => { settings.pushSettings.badgeEnabled = enabled; hasChanges = true }"
              />
            </div>
          </div>
        </div>

        <Separator />

        <!-- SMS Settings -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <MessageSquare class="h-4 w-4" />
              <Label class="text-base font-medium">SMS Notifications</Label>
            </div>
            <Switch
              :checked="settings.smsSettings?.enabled || false"
              @update:checked="(enabled) => { settings.smsSettings.enabled = enabled; hasChanges = true }"
            />
          </div>
          
          <div v-if="settings.smsSettings?.enabled" class="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
            <div class="space-y-2">
              <Label for="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                :model-value="settings.smsSettings.phoneNumber"
                @update:model-value="(value) => { settings.smsSettings.phoneNumber = value; hasChanges = true }"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div class="flex items-center justify-between space-x-2">
              <Label class="flex items-center gap-2">
                <AlertTriangle class="h-4 w-4" />
                Emergency Only
              </Label>
              <Switch
                :checked="settings.smsSettings.emergencyOnly"
                @update:checked="(enabled) => { settings.smsSettings.emergencyOnly = enabled; hasChanges = true }"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Notification Categories -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Notification Categories</h2>
      
      <div
        v-for="category in availableCategories"
        :key="category.id"
        class="border rounded-lg"
      >
        <Collapsible>
          <CollapsibleTrigger
            @click="toggleCategory(category.id)"
            class="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <component :is="getCategoryIcon(category.icon)" class="h-5 w-5" />
              <div class="text-left">
                <h3 class="font-medium">{{ category.name }}</h3>
                <p class="text-sm text-muted-foreground">{{ category.description }}</p>
              </div>
              <Badge :class="getPriorityColor(category.priority)" class="ml-2">
                {{ category.priority }}
              </Badge>
            </div>
            
            <div class="flex items-center gap-2">
              <Badge variant="outline">
                {{ category.types.filter(type => settings.preferences?.[type]?.enabled).length }}/{{ category.types.length }}
              </Badge>
              <ChevronRight
                v-if="!expandedCategories.has(category.id)"
                class="h-4 w-4"
              />
              <ChevronDown
                v-else
                class="h-4 w-4"
              />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent v-if="expandedCategories.has(category.id)">
            <div class="p-4 pt-0 space-y-4">
              <!-- Category Controls -->
              <div class="flex items-center gap-4 p-3 bg-muted/30 rounded-md">
                <Button
                  @click="toggleCategoryEnabled(category, true)"
                  size="sm"
                  variant="outline"
                >
                  Enable All
                </Button>
                <Button
                  @click="toggleCategoryEnabled(category, false)"
                  size="sm"
                  variant="outline"
                >
                  Disable All
                </Button>
                
                <Separator orientation="vertical" class="h-6" />
                
                <div class="flex items-center gap-2">
                  <Label class="text-sm">Channels:</Label>
                  <Button
                    @click="toggleChannelForCategory(category, 'email', true)"
                    size="sm"
                    variant="ghost"
                    class="h-7 w-7 p-0"
                  >
                    <Mail class="h-3 w-3" />
                  </Button>
                  <Button
                    @click="toggleChannelForCategory(category, 'push', true)"
                    size="sm"
                    variant="ghost"
                    class="h-7 w-7 p-0"
                  >
                    <Smartphone class="h-3 w-3" />
                  </Button>
                  <Button
                    @click="toggleChannelForCategory(category, 'sms', true)"
                    size="sm"
                    variant="ghost"
                    class="h-7 w-7 p-0"
                  >
                    <MessageSquare class="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <!-- Individual Notification Types -->
              <div class="space-y-3">
                <div
                  v-for="type in category.types"
                  :key="type"
                  class="flex items-center justify-between p-3 border rounded-md"
                >
                  <div class="flex items-center gap-3">
                    <Switch
                      :checked="settings.preferences?.[type]?.enabled || false"
                      @update:checked="(enabled) => updatePreference(type, { enabled })"
                    />
                    <div>
                      <Label class="font-medium capitalize">
                        {{ type.replace(/_/g, ' ') }}
                      </Label>
                    </div>
                  </div>
                  
                  <div v-if="settings.preferences?.[type]?.enabled" class="flex items-center gap-2">
                    <!-- Channel toggles -->
                    <div class="flex items-center gap-1">
                      <Button
                        @click="updatePreference(type, { channels: { ...settings.preferences[type].channels, email: !settings.preferences[type].channels.email } })"
                        size="sm"
                        :variant="settings.preferences[type].channels.email ? 'default' : 'ghost'"
                        class="h-7 w-7 p-0"
                      >
                        <Mail class="h-3 w-3" />
                      </Button>
                      <Button
                        @click="updatePreference(type, { channels: { ...settings.preferences[type].channels, push: !settings.preferences[type].channels.push } })"
                        size="sm"
                        :variant="settings.preferences[type].channels.push ? 'default' : 'ghost'"
                        class="h-7 w-7 p-0"
                      >
                        <Smartphone class="h-3 w-3" />
                      </Button>
                      <Button
                        @click="updatePreference(type, { channels: { ...settings.preferences[type].channels.sms: !settings.preferences[type].channels.sms } })"
                        size="sm"
                        :variant="settings.preferences[type].channels.sms ? 'default' : 'ghost'"
                        class="h-7 w-7 p-0"
                      >
                        <MessageSquare class="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <!-- Test button -->
                    <Button
                      @click="testNotification(type, 'push')"
                      size="sm"
                      variant="outline"
                      :disabled="testingNotifications.has(`${type}-push`)"
                    >
                      {{ testingNotifications.has(`${type}-push`) ? 'Testing...' : 'Test' }}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>

    <!-- Status Messages -->
    <Alert v-if="hasChanges">
      <AlertTriangle class="h-4 w-4" />
      <AlertDescription>
        You have unsaved changes. Make sure to save your notification preferences before leaving this page.
      </AlertDescription>
    </Alert>

    <Alert v-if="!settings.globallyEnabled">
      <BellOff class="h-4 w-4" />
      <AlertDescription>
        All notifications are currently disabled. Enable global notifications to receive updates.
      </AlertDescription>
    </Alert>

    <Alert v-if="!hasChanges && !isLoading">
      <CheckCircle class="h-4 w-4" />
      <AlertDescription>
        Your notification preferences are up to date.
      </AlertDescription>
    </Alert>
  </div>
</template> 