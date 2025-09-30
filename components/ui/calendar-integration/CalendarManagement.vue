<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium">Calendar Integration</h3>
        <p class="text-sm text-muted-foreground">
          Connect your Google Calendar to sync events and manage your schedule.
        </p>
      </div>
    </div>

    <!-- Calendar Integration Status -->
    <div class="space-y-4">
      <div v-if="calendarStore.hasGoogleCalendarIntegration" class="border rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <div>
              <p class="font-medium">Google Calendar</p>
              <p class="text-sm text-muted-foreground">
                Connected {{ formatDate(googleIntegration?.connectedAt) }}
              </p>
              <p v-if="googleIntegration?.lastSyncAt" class="text-xs text-muted-foreground">
                Last sync: {{ formatDate(googleIntegration.lastSyncAt) }}
              </p>
            </div>
          </div>
          <div class="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              @click="syncCalendar"
              :disabled="calendarStore.syncInProgress"
            >
              <RefreshCw class="h-4 w-4 mr-2" :class="{ 'animate-spin': calendarStore.syncInProgress }" />
              Sync
            </Button>
            <Button variant="destructive" size="sm" @click="disconnectCalendar">
              <Unlink class="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      </div>

      <div v-else class="border border-dashed rounded-lg p-6 text-center">
        <Calendar class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h4 class="font-medium mb-2">No Calendar Connected</h4>
        <p class="text-sm text-muted-foreground mb-4">
          Connect your Google Calendar to sync events and manage your schedule seamlessly.
        </p>
        <Button @click="connectCalendar" :disabled="calendarStore.loading">
          <Calendar class="h-4 w-4 mr-2" />
          Connect Google Calendar
        </Button>
      </div>
    </div>

    <!-- Recent Events -->
    <div v-if="calendarStore.hasGoogleCalendarIntegration && upcomingEvents.length > 0">
      <h4 class="font-medium mb-3">Upcoming Events</h4>
      <div class="space-y-2">
        <div 
          v-for="event in upcomingEvents.slice(0, 5)" 
          :key="event.id"
          class="border rounded-lg p-3"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">{{ event.summary }}</p>
              <p class="text-sm text-muted-foreground">
                {{ formatEventTime(event.startTime, event.endTime) }}
              </p>
              <p v-if="event.location" class="text-xs text-muted-foreground">
                <MapPin class="h-3 w-3 inline mr-1" />
                {{ event.location }}
              </p>
            </div>
            <div class="text-right">
              <Badge variant="outline">
                {{ formatEventDate(event.startTime) }}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="calendarStore.error" class="border border-destructive rounded-lg p-4">
      <div class="flex items-center space-x-2">
        <AlertCircle class="h-4 w-4 text-destructive" />
        <p class="text-sm text-destructive">{{ calendarStore.error }}</p>
      </div>
      <Button variant="outline" size="sm" class="mt-2" @click="calendarStore.clearError()">
        Dismiss
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCalendarStore } from '@/store/modules/calendar'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  RefreshCw, 
  Unlink, 
  MapPin, 
  AlertCircle 
} from 'lucide-vue-next'

const calendarStore = useCalendarStore()
const { toast } = useToast()

const googleIntegration = computed(() => calendarStore.googleCalendarIntegration)
const upcomingEvents = computed(() => calendarStore.upcomingEvents)

const connectCalendar = async () => {
  try {
    // Store current page to return to after OAuth
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('calendar_return_url', window.location.pathname)
    }
    
    await calendarStore.initiateGoogleCalendarAuth()
  } catch (error: any) {
    toast({
      title: 'Connection Failed',
      description: error.message || 'Failed to connect Google Calendar',
      variant: 'destructive',
    })
  }
}

const disconnectCalendar = async () => {
  const integration = googleIntegration.value
  if (!integration) return

  const confirmed = confirm('Are you sure you want to disconnect your Google Calendar? This will remove all synced events.')
  if (!confirmed) return

  try {
    await calendarStore.disconnectCalendar(integration.id)
    toast({
      title: 'Calendar Disconnected',
      description: 'Google Calendar has been disconnected successfully.',
      variant: 'success',
    })
  } catch (error: any) {
    toast({
      title: 'Disconnect Failed',
      description: error.message || 'Failed to disconnect Google Calendar',
      variant: 'destructive',
    })
  }
}

const syncCalendar = async () => {
  const integration = googleIntegration.value
  if (!integration) return

  try {
    await calendarStore.syncCalendarEvents(integration.id)
    toast({
      title: 'Sync Complete',
      description: 'Calendar events have been synced successfully.',
      variant: 'success',
    })
  } catch (error: any) {
    toast({
      title: 'Sync Failed',
      description: error.message || 'Failed to sync calendar events',
      variant: 'destructive',
    })
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}

const formatEventDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    })
  }
}

const formatEventTime = (startTime: string, endTime: string) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  const startStr = start.toLocaleTimeString(undefined, { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
  const endStr = end.toLocaleTimeString(undefined, { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
  
  return `${startStr} - ${endStr}`
}

onMounted(() => {
  calendarStore.initialize()
})
</script>
