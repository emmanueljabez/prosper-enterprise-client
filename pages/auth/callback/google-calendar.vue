<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from '#app'
import { useCalendarStore } from '@/store/modules/calendar'
import { useToast } from '@/components/ui/toast'

const route = useRoute()
const router = useRouter()
const calendarStore = useCalendarStore()
const { toast } = useToast()

onMounted(async () => {
  try {
    const code = route.query.code as string
    const state = route.query.state as string
    const error = route.query.error as string

    if (error) {
      throw new Error(`Calendar authentication failed: ${error}`)
    }

    if (!code) {
      throw new Error('No authorization code received')
    }

    // Connect calendar using the authorization code
    await calendarStore.connectCalendar({
      provider: 'google-calendar',
      code,
      state
    })

    toast({
      title: 'Success',
      description: 'Google Calendar connected successfully! Your events will be synced shortly.',
      variant: 'success',
    })
    
    // Redirect back to the page that initiated the connection
    const returnUrl = sessionStorage.getItem('calendar_return_url') || '/app/dashboard'
    sessionStorage.removeItem('calendar_return_url')
    
    router.push(returnUrl)
  } catch (error: any) {
    console.error('Google Calendar OAuth callback error:', error)
    
    toast({
      title: 'Calendar Connection Failed',
      description: error.message || 'Failed to connect Google Calendar',
      variant: 'destructive',
    })
    
    // Redirect back to the page that initiated the connection with error
    const returnUrl = sessionStorage.getItem('calendar_return_url') || '/app/dashboard'
    sessionStorage.removeItem('calendar_return_url')
    
    router.push(`${returnUrl}?calendar_error=connection_failed`)
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p class="text-muted-foreground">Connecting Google Calendar...</p>
      <p class="text-sm text-muted-foreground mt-2">Please wait while we complete the setup.</p>
    </div>
  </div>
</template>
