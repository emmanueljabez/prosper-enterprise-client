<template>
  <div class="w-full flex items-center gap-4">
    <Sheet>
      <SheetTrigger as-child>
        <Button variant="outline" size="icon" class="shrink-0 md:hidden">
          <Menu class="h-5 w-5" />
          <span class="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
    </Sheet>

    <div class="flex min-w-0 flex-1 items-center">
      <img
        :src="companyLogoUrl || '/images/prosper_mentor_logo.png'"
        alt="Company logo"
        class="h-14 w-[260px] object-contain object-left md:h-16 md:w-[340px]"
      />
    </div>

    <div class="navbar-items flex items-center justify-end gap-4">

      <!-- Notifications -->
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" size="icon" class="rounded-full">
            <BellRing class="h-5 w-5" />
            <span class="sr-only">Notifications</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[300px] p-0">
          <div class="flex flex-col">
            <div class="p-4 border-b">
              <h4 class="text-sm font-medium">Notifications</h4>
            </div>
            <ScrollArea className="h-[300px]">
              <div class="p-4">
                <p class="text-sm text-muted-foreground">No new notifications</p>
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      <!-- User Menu -->
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" class="rounded-full">
            <User2 class="h-5 w-5" />
            <span class="sr-only">User menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="handleCalendarIntegration" class="cursor-pointer">
            <Calendar class="mr-2 h-4 w-4" />
            <span v-if="calendarStore.hasGoogleCalendarIntegration">
              Manage Calendar
            </span>
            <span v-else>
              Connect Calendar
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <NuxtLink  @click="logout">Logout</NuxtLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Menu,
  User2,
  BellRing,
  Calendar
} from 'lucide-vue-next'
import { useAuthStore } from '@/store/modules/auth'
import { useCalendarStore } from '@/store/modules/calendar'
import { useToast } from '@/components/ui/toast'


const authStore = useAuthStore()
const calendarStore = useCalendarStore()
const { toast } = useToast()

const companyLogoUrl = computed(() => {
  try {
    const profileStr = localStorage.getItem('profile')
    if (!profileStr) return null
    const profile = JSON.parse(profileStr)
    return profile?.company?.logoUrl || null
  } catch {
    return null
  }
})

// Initialize calendar store on mount
onMounted(() => {
  calendarStore.initialize()
})

const logout = async () => {
  try {
    await authStore.signOut()
    // const message = 'Login successful!'
    //   toast({
    //     title: 'Success',
    //     description: message,
    //     variant: 'success',
    //   })
  } catch (error: any) {
    console.error(error)
    // const errorMessage = 'Logout failed'
    // toast({
    //   title: 'Error',
    //   description: errorMessage,
    //   variant: 'destructive',
    // })
  }
}

const handleCalendarIntegration = async () => {
  try {
    if (calendarStore.hasGoogleCalendarIntegration) {
      // If already connected, show management options or disconnect
      const integration = calendarStore.googleCalendarIntegration
      if (integration) {
        const confirmed = confirm('Do you want to disconnect your Google Calendar?')
        if (confirmed) {
          await calendarStore.disconnectCalendar(integration.id)
          toast({
            title: 'Calendar Disconnected',
            description: 'Google Calendar has been disconnected successfully.',
            variant: 'success',
          })
        }
      }
    } else {
      // Store current page to return to after OAuth
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('calendar_return_url', window.location.pathname)
      }
      
      // Initiate Google Calendar OAuth
      await calendarStore.initiateGoogleCalendarAuth()
    }
  } catch (error: any) {
    console.error('Calendar integration error:', error)
    toast({
      title: 'Calendar Error',
      description: error.message || 'Failed to handle calendar integration',
      variant: 'destructive',
    })
  }
}
</script>

<style scoped>
.navbar-items {
  position: fixed;
  right: 1.5rem;
  top: 1rem;
  width: auto;
  z-index: 50;
  background-color: transparent;
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .navbar-items {
    position: relative;
    right: auto;
    top: auto;
  }
}
</style>
