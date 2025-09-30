<template>
  <div class="space-y-6">
    <!-- Calendar Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          {{ mentorName }}'s Availability
        </h2>
        <p class="text-gray-600 mt-1">
          {{ timezoneLabel }} • Next available: {{ nextAvailableSlot }}
        </p>
      </div>
      
      <!-- View Controls -->
      <div class="flex items-center space-x-3">
        <Select v-model="selectedTimezone">
          <SelectTrigger class="w-[200px]">
            <SelectValue placeholder="Africa/Nairobi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
          </SelectContent>
        </Select>
        
        <div class="flex rounded-lg border overflow-hidden">
          <Button 
            variant="ghost" 
            size="sm"
            :class="{ 'bg-blue-50 text-blue-600': viewMode === 'week' }"
            @click="viewMode = 'week'"
          >
            Week
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            :class="{ 'bg-blue-50 text-blue-600': viewMode === 'month' }"
            @click="viewMode = 'month'"
          >
            Month
          </Button>
        </div>
      </div>
    </div>

    <!-- Calendar Navigation -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <Button variant="outline" size="sm" @click="previousPeriod">
          <ChevronLeft class="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" @click="nextPeriod">
          <ChevronRight class="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" @click="goToToday">
          Today
        </Button>
      </div>
      
      <h3 class="text-lg font-semibold">
        {{ formatPeriodTitle() }}
      </h3>
      
      <div class="flex items-center space-x-2 text-sm">
        <!-- Legend -->
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-green-400 rounded"></div>
          <span>Available</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-red-400 rounded"></div>
          <span>Booked</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-blue-400 rounded"></div>
          <span>Session</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-gray-300 rounded"></div>
          <span>Blocked</span>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="bg-white rounded-lg border overflow-hidden">
      <!-- Week View -->
      <div v-if="viewMode === 'week'" class="divide-y">
        <!-- Time Header -->
        <div class="grid grid-cols-8 divide-x bg-gray-50">
          <div class="p-3 text-sm font-medium text-gray-600">Time</div>
          <div 
            v-for="day in weekDays" 
            :key="day.date.toISOString()"
            class="p-3 text-center"
          >
            <div class="text-sm font-medium text-gray-900">
              {{ formatDayHeader(day.date) }}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ formatDateShort(day.date) }}
            </div>
          </div>
        </div>
        
        <!-- Time Slots -->
        <div class="divide-y">
          <div 
            v-for="hour in displayHours" 
            :key="hour"
            class="grid grid-cols-8 divide-x min-h-[60px]"
          >
            <!-- Hour Label -->
            <div class="p-3 text-sm text-gray-600 border-r">
              {{ formatHour(hour) }}
            </div>
            
            <!-- Day Columns -->
            <div 
              v-for="day in weekDays"
              :key="`${day.date.toISOString()}-${hour}`"
              class="relative p-1"
            >
              <!-- Available Slots -->
              <div
                v-for="slot in getHourSlots(day.date, hour)"
                :key="slot.id"
                :class="getSlotClasses(slot)"
                class="absolute inset-1 rounded cursor-pointer transition-all hover:opacity-80"
                @click="handleSlotClick(slot)"
              >
                <div class="p-2 text-xs">
                  <div class="font-medium">{{ getSlotLabel(slot) }}</div>
                </div>
              </div>
              
              <!-- Sessions -->
              <div
                v-for="session in getHourSessions(day.date, hour)"
                :key="session.id"
                class="absolute inset-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
                @click="handleSessionClick(session)"
              >
                <div class="p-2 text-xs">
                  <div class="font-medium truncate">{{ session.title }}</div>
                  <div class="opacity-75">{{ getSessionTimeRange(session) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Month View -->
      <div v-else class="p-4">
        <!-- Month Grid -->
        <div class="grid grid-cols-7 gap-px bg-gray-200">
          <!-- Day Headers -->
          <div 
            v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
            :key="day"
            class="bg-gray-50 p-3 text-center text-sm font-medium text-gray-600"
          >
            {{ day }}
          </div>
          
          <!-- Calendar Days -->
          <div
            v-for="date in monthDates"
            :key="date.toISOString()"
            :class="{
              'bg-gray-50': !isCurrentMonth(date),
              'bg-white': isCurrentMonth(date),
              'ring-2 ring-blue-500': isToday(date)
            }"
            class="bg-white p-2 min-h-[120px] relative cursor-pointer hover:bg-gray-50"
            @click="selectDate(date)"
          >
            <div 
              :class="{
                'text-gray-400': !isCurrentMonth(date),
                'text-gray-900': isCurrentMonth(date),
                'bg-blue-600 text-white': isToday(date)
              }"
              class="text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded"
            >
              {{ date.getDate() }}
            </div>
            
            <!-- Day Availability Indicators -->
            <div class="space-y-1">
              <div
                v-for="(slot, index) in getDateSlots(date).slice(0, 3)"
                :key="slot.id"
                :class="getSlotClasses(slot)"
                class="text-xs p-1 rounded truncate"
              >
                {{ getSlotTimeLabel(slot) }}
              </div>
              <div
                v-if="getDateSlots(date).length > 3"
                class="text-xs text-gray-500"
              >
                +{{ getDateSlots(date).length - 3 }} more
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Form Modal -->
    <Dialog v-model:open="showBookingForm">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book a Session</DialogTitle>
          <DialogDescription>
            Schedule a mentoring session for {{ formatSlotDateTime(selectedSlot) }}
          </DialogDescription>
        </DialogHeader>
        
        <div v-if="selectedSlot" class="space-y-4">
          <!-- Topic -->
          <div class="space-y-2" v-if="props.topics && props.topics.length">
            <Label>Topic</Label>
            <Select v-model="bookingForm.topic">
              <SelectTrigger>
                <SelectValue placeholder="Select topic..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="t in props.topics" :key="t" :value="t">{{ t }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Platform -->
          <div class="space-y-2">
            <Label>Meeting Platform</Label>
            <Select v-model="bookingForm.platform">
              <SelectTrigger>
                <SelectValue placeholder="Select platform..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="google-meet">Google Meet</SelectItem>
                <SelectItem value="teams">Microsoft Teams</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Message -->
          <div class="space-y-2">
            <Label>Message (Optional)</Label>
            <Textarea
              v-model="bookingForm.message"
              placeholder="Let the mentor know what you'd like to discuss..."
              rows="3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showBookingForm = false">
            Cancel
          </Button>
          <Button @click="submitBooking" :loading="isSubmittingBooking">
            Request Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Session Details Modal -->
    <Dialog v-model:open="showSessionDetails">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
        </DialogHeader>
        
        <div v-if="selectedSession" class="space-y-4">
          <div>
            <h3 class="font-medium">{{ selectedSession.title }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ selectedSession.description }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Time:</span>
              <div class="font-medium">{{ getSessionTimeRange(selectedSession) }}</div>
            </div>
            <div>
              <span class="text-gray-600">Duration:</span>
              <div class="font-medium">{{ selectedSession.duration }} min</div>
            </div>
            <div>
              <span class="text-gray-600">Platform:</span>
              <div class="font-medium capitalize">{{ selectedSession.platform }}</div>
            </div>
            <div>
              <span class="text-gray-600">Status:</span>
              <Badge :variant="getSessionStatusVariant(selectedSession.status)">
                {{ formatSessionStatus(selectedSession.status) }}
              </Badge>
            </div>
          </div>

          <div v-if="selectedSession.meetingLink" class="pt-2 border-t">
            <Button 
              @click="joinSession(selectedSession)"
              :disabled="!canJoinSession(selectedSession)"
              class="w-full"
            >
              <Video class="w-4 h-4 mr-2" />
              Join Session
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showSessionDetails = false">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch, onMounted } from 'vue'
import { 
  ChevronLeft, ChevronRight, Video,
  Calendar, Clock, Users
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  mentorId: string
  mentorName?: string
  defaultTimezone?: string
  allowBooking?: boolean
  topics?: string[]
}

interface Emits {
  (e: 'slot-select', slot: any): void
  (e: 'session-select', session: any): void
  (e: 'booking-submit', booking: any): void
}

const props = withDefaults(defineProps<Props>(), {
  mentorName: 'Mentor',
  defaultTimezone: 'Africa/Nairobi',
  allowBooking: true,
  topics: () => []
})

const emit = defineEmits<Emits>()

// State
const viewMode = ref<'week' | 'month'>('week')
const selectedDate = ref(new Date())
const selectedTimezone = ref(props.defaultTimezone)
const showBookingForm = ref(false)
const showSessionDetails = ref(false)
const selectedSlot = ref<any>(null)
const selectedSession = ref<any>(null)
const isSubmittingBooking = ref(false)

// Mock data - in real app, this would come from props or API
const schedule = ref({
  timezone: 'Africa/Nairobi',
  weeklySchedule: {
    monday: { isAvailable: true, slots: [{ start: '18:00', end: '21:00' }] },
    tuesday: { isAvailable: true, slots: [{ start: '18:00', end: '21:00' }] },
    wednesday: { isAvailable: false, slots: [] },
    thursday: { isAvailable: true, slots: [{ start: '18:00', end: '21:00' }] },
    friday: { isAvailable: false, slots: [] },
    saturday: { isAvailable: true, slots: [{ start: '10:00', end: '16:00' }] },
    sunday: { isAvailable: true, slots: [{ start: '10:00', end: '14:00' }] }
  }
})

const availableSlots = ref([
  // Today's slots
  {
    id: 'slot-today-1',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    duration: 60,
    isAvailable: true,
    maxBookings: 1,
    currentBookings: 0
  },
  {
    id: 'slot-today-2',
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    duration: 60,
    isAvailable: true,
    maxBookings: 1,
    currentBookings: 0
  },
  // Tomorrow's slots
  {
    id: 'slot-tomorrow-1',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Tomorrow 10 AM
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // Tomorrow 11 AM
    duration: 60,
    isAvailable: true,
    maxBookings: 1,
    currentBookings: 0
  },
  {
    id: 'slot-tomorrow-2',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // Tomorrow 2 PM
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // Tomorrow 3 PM
    duration: 60,
    isAvailable: true,
    maxBookings: 1,
    currentBookings: 0
  },
  // This week's slots
  {
    id: 'slot-week-1',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // Day after tomorrow 9 AM
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Day after tomorrow 10 AM
    duration: 60,
    isAvailable: true,
    maxBookings: 3,
    currentBookings: 1
  }
])

const sessions = ref([
  {
    id: 'session-1',
    title: 'System Design Review',
    description: 'One-on-one session',
    scheduledStart: new Date('2024-01-30T19:00:00Z'),
    scheduledEnd: new Date('2024-01-30T20:00:00Z'),
    duration: 60,
    platform: 'zoom',
    meetingLink: 'https://zoom.us/j/123456789',
    status: 'confirmed'
  }
])

// Booking form
const bookingForm = reactive({
  topic: '',
  platform: '',
  message: ''
})

// Computed properties
const timezone = computed(() => selectedTimezone.value)
const timezoneLabel = computed(() => {
  // Only Nairobi is supported in UI now
  return 'Africa/Nairobi'
})
const nextAvailableSlot = computed(() => {
  const next = availableSlots.value
    .filter(slot => slot.isAvailable && new Date(slot.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0]
  
  return next ? formatDateTime(new Date(next.startTime)) : 'No upcoming slots'
})

const weekDays = computed(() => {
  const start = getWeekStart(selectedDate.value)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    return { date, slots: getDateSlots(date) }
  })
})

const monthDates = computed(() => {
  const year = selectedDate.value.getFullYear()
  const month = selectedDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const dates = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    dates.push(date)
  }
  
  return dates
})

const displayHours = computed(() => {
  // Show hours from 8 AM to 10 PM
  return Array.from({ length: 14 }, (_, i) => 8 + i)
})

// Methods
const formatPeriodTitle = () => {
  if (viewMode.value === 'week') {
    const start = getWeekStart(selectedDate.value)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${formatDateShort(start)} - ${formatDateShort(end)}`
  } else {
    return selectedDate.value.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }
}

const formatDayHeader = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

const formatDateShort = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatHour = (hour: number) => {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:00 ${period}`
}

const formatDateTime = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const formatSlotDateTime = (slot: any) => {
  return slot ? formatDateTime(new Date(slot.startTime)) : ''
}

const getWeekStart = (date: Date) => {
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay())
  return start
}

const isCurrentMonth = (date: Date) => {
  return date.getMonth() === selectedDate.value.getMonth()
}

const isToday = (date: Date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const selectDate = (date: Date) => {
  selectedDate.value = date
  if (viewMode.value === 'month') {
    viewMode.value = 'week'
  }
}

const previousPeriod = () => {
  const newDate = new Date(selectedDate.value)
  if (viewMode.value === 'week') {
    newDate.setDate(newDate.getDate() - 7)
  } else {
    newDate.setMonth(newDate.getMonth() - 1)
  }
  selectedDate.value = newDate
}

const nextPeriod = () => {
  const newDate = new Date(selectedDate.value)
  if (viewMode.value === 'week') {
    newDate.setDate(newDate.getDate() + 7)
  } else {
    newDate.setMonth(newDate.getMonth() + 1)
  }
  selectedDate.value = newDate
}

const goToToday = () => {
  selectedDate.value = new Date()
}

const getDateSlots = (date: Date) => {
  return availableSlots.value.filter(slot => {
    const slotDate = new Date(slot.startTime)
    return slotDate.toDateString() === date.toDateString()
  })
}

const getHourSlots = (date: Date, hour: number) => {
  return getDateSlots(date).filter(slot => {
    const slotHour = new Date(slot.startTime).getHours()
    return slotHour === hour
  })
}

const getHourSessions = (date: Date, hour: number) => {
  return sessions.value.filter(session => {
    const sessionDate = new Date(session.scheduledStart)
    return sessionDate.toDateString() === date.toDateString() &&
           sessionDate.getHours() === hour
  })
}

const getSlotClasses = (slot: any) => {
  if (!slot.isAvailable) {
    return 'bg-red-100 text-red-800 border border-red-200'
  }
  return 'bg-green-100 text-green-800 border border-green-200'
}

const getSlotLabel = (slot: any) => {
  return slot.isAvailable ? 'Available' : 'Booked'
}

const getSlotTimeLabel = (slot: any) => {
  const start = new Date(slot.startTime)
  return start.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  })
}

const getSessionTimeRange = (session: any) => {
  const start = new Date(session.scheduledStart)
  const end = new Date(session.scheduledEnd)
  return `${start.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  })} - ${end.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  })}`
}

const getSessionStatusVariant = (status: string) => {
  switch (status) {
    case 'confirmed': return 'default'
    case 'scheduled': return 'secondary'
    case 'completed': return 'outline'
    case 'cancelled': return 'destructive'
    default: return 'secondary'
  }
}

const formatSessionStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const handleSlotClick = (slot: any) => {
  if (slot.isAvailable && props.allowBooking) {
    selectedSlot.value = slot
    showBookingForm.value = true
    emit('slot-select', slot)
  }
}

const handleSessionClick = (session: any) => {
  selectedSession.value = session
  showSessionDetails.value = true
  emit('session-select', session)
}

const canJoinSession = (session: any) => {
  const now = new Date()
  const sessionStart = new Date(session.scheduledStart)
  const sessionEnd = new Date(session.scheduledEnd)
  
  // Can join 10 minutes before to 10 minutes after end
  const joinWindow = 10 * 60 * 1000 // 10 minutes in ms
  return now >= (sessionStart.getTime() - joinWindow) && 
         now <= (sessionEnd.getTime() + joinWindow)
}

const joinSession = (session: any) => {
  if (session.meetingLink) {
    window.open(session.meetingLink, '_blank')
  }
}

const submitBooking = async () => {
  if (!selectedSlot.value) return
  
  isSubmittingBooking.value = true
  
  try {
    const booking = {
      mentorId: props.mentorId,
      slotId: selectedSlot.value.id,
      requestedStart: selectedSlot.value.startTime,
      requestedEnd: selectedSlot.value.endTime,
      topic: bookingForm.topic || undefined,
      platform: bookingForm.platform,
      message: bookingForm.message
    }
    
    emit('booking-submit', booking)
    showBookingForm.value = false
    
    // Reset form
    Object.assign(bookingForm, {
      platform: '',
      message: ''
    })
  } catch (error) {
    console.error('Booking error:', error)
  } finally {
    isSubmittingBooking.value = false
  }
}

// Load data on mount
onMounted(() => {
  // In real app, load mentor schedule and availability
  console.log('Loading calendar for mentor:', props.mentorId)
})
</script> 