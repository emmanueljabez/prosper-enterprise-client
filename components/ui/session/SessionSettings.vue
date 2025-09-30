<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { useSessionManager, type SessionSettings } from '@/utils/sessionManager'
import { Settings, Clock, Shield, Monitor, MousePointer, Keyboard, Eye, Users, Save, RotateCcw } from 'lucide-vue-next'

const sessionManager = useSessionManager()
const { toast } = useToast()

// Current settings
const settings = ref<SessionSettings>({
  maxInactivityTime: 30 * 60 * 1000, // 30 minutes
  warningTime: 5 * 60 * 1000, // 5 minutes
  tokenRefreshInterval: 15 * 60 * 1000, // 15 minutes
  maxSessionDuration: 8 * 60 * 60 * 1000, // 8 hours
  trackMouseMovement: true,
  trackKeyboardActivity: true,
  trackPageVisibility: true,
  enableCrossTabSync: true,
  enableSingleSignOn: true
})

// UI state
const isLoading = ref(false)
const hasChanges = ref(false)

// Computed values for UI display
const inactivityTimeMinutes = computed({
  get: () => Math.round(settings.value.maxInactivityTime / (60 * 1000)),
  set: (value: number) => {
    settings.value.maxInactivityTime = value * 60 * 1000
    hasChanges.value = true
  }
})

const warningTimeMinutes = computed({
  get: () => Math.round(settings.value.warningTime / (60 * 1000)),
  set: (value: number) => {
    settings.value.warningTime = value * 60 * 1000
    hasChanges.value = true
  }
})

const maxSessionHours = computed({
  get: () => Math.round(settings.value.maxSessionDuration / (60 * 60 * 1000)),
  set: (value: number) => {
    settings.value.maxSessionDuration = value * 60 * 60 * 1000
    hasChanges.value = true
  }
})

const refreshIntervalMinutes = computed({
  get: () => Math.round(settings.value.tokenRefreshInterval / (60 * 1000)),
  set: (value: number) => {
    settings.value.tokenRefreshInterval = value * 60 * 1000
    hasChanges.value = true
  }
})

// Predefined timeout options
const timeoutPresets = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '4 hours', value: 240 }
]

const sessionDurationPresets = [
  { label: '4 hours', value: 4 },
  { label: '8 hours', value: 8 },
  { label: '12 hours', value: 12 },
  { label: '24 hours', value: 24 }
]

// Format time for display
const formatTime = (minutes: number) => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${minutes}m`
}

// Track changes to individual settings
const updateSetting = (key: keyof SessionSettings, value: any) => {
  (settings.value as any)[key] = value
  hasChanges.value = true
}

// Save settings
const saveSettings = async () => {
  isLoading.value = true
  try {
    // Update session manager with new settings
    sessionManager.updateSettings(settings.value)
    
    // In a real app, this would save to backend
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    
    hasChanges.value = false
    
    toast({
      title: 'Settings Saved',
      description: 'Your session preferences have been updated successfully.',
      variant: 'success'
    })
  } catch (error: any) {
    toast({
      title: 'Save Failed',
      description: error.message || 'Failed to save session settings.',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

// Reset to defaults
const resetToDefaults = () => {
  settings.value = {
    maxInactivityTime: 30 * 60 * 1000,
    warningTime: 5 * 60 * 1000,
    tokenRefreshInterval: 15 * 60 * 1000,
    maxSessionDuration: 8 * 60 * 60 * 1000,
    trackMouseMovement: true,
    trackKeyboardActivity: true,
    trackPageVisibility: true,
    enableCrossTabSync: true,
    enableSingleSignOn: true
  }
  hasChanges.value = true
}

// Load current settings
onMounted(() => {
  // In a real app, this would load from backend/localStorage
  // For now, using defaults
})
</script>

<template>
  <Card class="w-full max-w-4xl mx-auto">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Settings class="h-5 w-5" />
        Session Security Settings
      </CardTitle>
      <CardDescription>
        Configure automatic logout, security features, and session management preferences
      </CardDescription>
    </CardHeader>

    <CardContent class="space-y-8">
      <!-- Session Timeouts -->
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium flex items-center gap-2">
            <Clock class="h-4 w-4" />
            Session Timeouts
          </h3>
          <p class="text-sm text-muted-foreground">
            Control when your session expires due to inactivity
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Inactivity Timeout -->
          <div class="space-y-3">
            <Label for="inactivity-timeout">Automatic Logout After</Label>
            <div class="space-y-2">
              <Select 
                :value="inactivityTimeMinutes.toString()" 
                @update:value="(value) => inactivityTimeMinutes = parseInt(value)"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="preset in timeoutPresets" 
                    :key="preset.value"
                    :value="preset.value.toString()"
                  >
                    {{ preset.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-xs text-muted-foreground">
                Session will automatically end after {{ formatTime(inactivityTimeMinutes) }} of inactivity
              </p>
            </div>
          </div>

          <!-- Warning Time -->
          <div class="space-y-3">
            <Label for="warning-time">Warning Before Logout</Label>
            <div class="space-y-2">
              <div class="px-3 py-2 border rounded-md bg-muted">
                <Slider 
                  :model-value="[warningTimeMinutes]"
                  @update:model-value="(value) => warningTimeMinutes = value[0]"
                  :max="10"
                  :min="1"
                  :step="1"
                  class="w-full"
                />
              </div>
              <p class="text-xs text-muted-foreground">
                Show warning {{ formatTime(warningTimeMinutes) }} before automatic logout
              </p>
            </div>
          </div>
        </div>

        <!-- Maximum Session Duration -->
        <div class="space-y-3">
          <Label for="max-session">Maximum Session Duration</Label>
          <div class="space-y-2">
            <Select 
              :value="maxSessionHours.toString()" 
              @update:value="(value) => maxSessionHours = parseInt(value)"
            >
              <SelectTrigger class="max-w-xs">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="preset in sessionDurationPresets" 
                  :key="preset.value"
                  :value="preset.value.toString()"
                >
                  {{ preset.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              Force logout after {{ formatTime(maxSessionHours * 60) }} regardless of activity
            </p>
          </div>
        </div>
      </div>

      <!-- Activity Tracking -->
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium flex items-center gap-2">
            <Monitor class="h-4 w-4" />
            Activity Tracking
          </h3>
          <p class="text-sm text-muted-foreground">
            Choose what user interactions reset the inactivity timer
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-center justify-between space-x-2">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <MousePointer class="h-4 w-4" />
                <Label for="track-mouse">Mouse Movement</Label>
              </div>
              <p class="text-xs text-muted-foreground">
                Track mouse movement and clicks
              </p>
            </div>
            <Switch
              id="track-mouse"
              :checked="settings.trackMouseMovement"
              @update:checked="(value) => updateSetting('trackMouseMovement', value)"
            />
          </div>

          <div class="flex items-center justify-between space-x-2">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <Keyboard class="h-4 w-4" />
                <Label for="track-keyboard">Keyboard Activity</Label>
              </div>
              <p class="text-xs text-muted-foreground">
                Track keyboard input and shortcuts
              </p>
            </div>
            <Switch
              id="track-keyboard"
              :checked="settings.trackKeyboardActivity"
              @update:checked="(value) => updateSetting('trackKeyboardActivity', value)"
            />
          </div>

          <div class="flex items-center justify-between space-x-2">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <Eye class="h-4 w-4" />
                <Label for="track-visibility">Page Visibility</Label>
              </div>
              <p class="text-xs text-muted-foreground">
                Track when page becomes visible/hidden
              </p>
            </div>
            <Switch
              id="track-visibility"
              :checked="settings.trackPageVisibility"
              @update:checked="(value) => updateSetting('trackPageVisibility', value)"
            />
          </div>

          <div class="flex items-center justify-between space-x-2">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <Users class="h-4 w-4" />
                <Label for="cross-tab-sync">Multi-tab Sync</Label>
              </div>
              <p class="text-xs text-muted-foreground">
                Synchronize activity across browser tabs
              </p>
            </div>
            <Switch
              id="cross-tab-sync"
              :checked="settings.enableCrossTabSync"
              @update:checked="(value) => updateSetting('enableCrossTabSync', value)"
            />
          </div>
        </div>
      </div>

      <!-- Security Features -->
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium flex items-center gap-2">
            <Shield class="h-4 w-4" />
            Security Features
          </h3>
          <p class="text-sm text-muted-foreground">
            Advanced security and authentication settings
          </p>
        </div>

        <div class="space-y-4">
          <div class="space-y-3">
            <Label for="token-refresh">Token Refresh Interval</Label>
            <div class="space-y-2">
              <div class="px-3 py-2 border rounded-md bg-muted max-w-md">
                <Slider 
                  :model-value="[refreshIntervalMinutes]"
                  @update:model-value="(value) => refreshIntervalMinutes = value[0]"
                  :max="60"
                  :min="5"
                  :step="5"
                  class="w-full"
                />
              </div>
              <p class="text-xs text-muted-foreground">
                Automatically refresh authentication tokens every {{ formatTime(refreshIntervalMinutes) }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between space-x-2">
            <div class="space-y-0.5">
              <Label for="single-sign-on">Single Sign-On</Label>
              <p class="text-xs text-muted-foreground">
                Enable SSO authentication features
              </p>
            </div>
            <Switch
              id="single-sign-on"
              :checked="settings.enableSingleSignOn"
              @update:checked="(value) => updateSetting('enableSingleSignOn', value)"
            />
          </div>
        </div>
      </div>

      <!-- Security Status -->
      <Alert>
        <Shield class="h-4 w-4" />
        <AlertDescription>
          <strong>Security Status:</strong> 
          Your session is protected with {{ settings.trackMouseMovement ? 'mouse' : '' }}
          {{ settings.trackKeyboardActivity ? (settings.trackMouseMovement ? ' and keyboard' : 'keyboard') : '' }} 
          activity tracking, {{ settings.enableCrossTabSync ? 'multi-tab synchronization, ' : '' }}
          and automatic logout after {{ formatTime(inactivityTimeMinutes) }} of inactivity.
        </AlertDescription>
      </Alert>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-6 border-t">
        <Button 
          @click="resetToDefaults"
          variant="outline"
          class="flex items-center gap-2"
        >
          <RotateCcw class="h-4 w-4" />
          Reset to Defaults
        </Button>

        <div class="flex items-center gap-3">
          <Badge v-if="hasChanges" variant="secondary">
            Unsaved changes
          </Badge>
          <Button 
            @click="saveSettings"
            :disabled="!hasChanges || isLoading"
            class="flex items-center gap-2"
          >
            <Save class="h-4 w-4" />
            {{ isLoading ? 'Saving...' : 'Save Settings' }}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template> 