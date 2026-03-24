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
          <span v-if="!isLoadingAvailability" class="ml-2 text-sm text-gray-500">
            ({{ availableSlots.length }} slots available)
          </span>
        </p>
      </div>
      
      <!-- Timezone selector -->
      <div class="flex items-center space-x-3">
        <Select v-model="selectedTimezone">
          <SelectTrigger class="w-[200px]">
            <SelectValue placeholder="Africa/Nairobi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
          </SelectContent>
        </Select>
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
      <!-- Loading State -->
      <div v-if="isLoadingAvailability" class="p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading availability...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!isLoadingAvailability && availableSlots.length === 0" class="p-12 text-center">
        <Calendar class="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Availability</h3>
        <p class="text-gray-600">This mentor has no available time slots for the selected period.</p>
      </div>

      <!-- Week View -->
      <div v-else-if="viewMode === 'week'" class="divide-y">
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
                :style="getSlotStyle(slot, hour)"
                class="rounded cursor-pointer transition-all hover:opacity-80"
                @click="handleSlotClick(slot)"
              >
                <div class="p-2 text-xs whitespace-pre-line">
                  <div class="font-medium">{{ getSlotLabel(slot, hour) }}</div>
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
              'bg-gray-50 opacity-50': !isCurrentMonth(date),
              'bg-white': isCurrentMonth(date),
              'ring-2 ring-blue-500': isToday(date),
              'cursor-pointer hover:bg-green-50': isCurrentMonth(date) && getDateSlots(date).filter(s => !s.isPast && s.isAvailable).length > 0,
              'cursor-default': !isCurrentMonth(date) || !getDateSlots(date).filter(s => !s.isPast && s.isAvailable).length
            }"
            class="p-2 min-h-[100px] relative"
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

            <!-- Day Availability Indicator (date only, no times) -->
            <div v-if="getDateSlots(date).filter(s => !s.isPast && s.isAvailable).length > 0" class="mt-1">
              <div class="text-xs p-1 rounded bg-green-100 text-green-800 text-center font-medium">
                Available
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
            Request a mentoring session on {{ formatSlotDate(selectedSlot) }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedSlot" class="space-y-4">
          <!-- Time confirmation note -->
          <div class="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p class="text-xs text-blue-700">
              The exact session time will be confirmed once the mentor accepts your booking request.
            </p>
          </div>
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
                <SelectItem value="google-meet">Google Meet</SelectItem>
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
          <Button variant="outline" @click="showBookingForm = false" :disabled="props.isLoading || isSubmittingBooking">
            Cancel
          </Button>
          <Button @click="submitBooking" :disabled="props.isLoading || isSubmittingBooking">
            <span v-if="props.isLoading || isSubmittingBooking" class="inline-block animate-spin mr-2">⏳</span>
            {{ props.isLoading || isSubmittingBooking ? 'Processing...' : 'Request Session' }}
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
import { useMentorsStore } from '@/store/modules/mentors'

interface Props {
  mentorId: string
  mentorName?: string
  defaultTimezone?: string
  allowBooking?: boolean
  topics?: string[]
  isLoading?: boolean
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
  topics: () => [],
  isLoading: false
})

const emit = defineEmits<Emits>()

// Store
const mentorsStore = useMentorsStore()

// State
const viewMode = ref<'week' | 'month'>('month')
const selectedDate = ref(new Date())
const selectedTimezone = ref(props.defaultTimezone)
const showBookingForm = ref(false)
const showSessionDetails = ref(false)
const selectedSlot = ref<any>(null)
const selectedSession = ref<any>(null)
const isSubmittingBooking = ref(false)
const isLoadingAvailability = ref(false)

// Availability data from API
const weeklyAvailabilityData = ref<any>(null)
const availableSlots = ref<any[]>([])

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
  if (!next) return 'No upcoming slots'
  const d = new Date(next.startTime)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
})

const formatSlotDate = (slot: any) => {
  if (!slot) return ''
  return new Date(slot.startTime).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })
}

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

// Helper Functions
/**
 * Convert API weekly schedule to calendar slots for the current and upcoming weeks
 * Generates slots for 8 weeks ahead to ensure there's always availability to show
 */
const convertWeeklyScheduleToSlots = (weeklyData: any) => {
  if (!weeklyData || !weeklyData.schedule) {
    console.log('⚠️ No weekly data or schedule:', weeklyData)
    return []
  }

  const slots: any[] = []
  const now = new Date()
  const currentWeekStart = getWeekStart(selectedDate.value)

  console.log('🔍 Converting schedule to slots')
  console.log('Current week start:', currentWeekStart)
  console.log('Now:', now)

  // Day of week mapping (API returns uppercase day names)
  const dayMapping: Record<string, number> = {
    'SUNDAY': 0,
    'MONDAY': 1,
    'TUESDAY': 2,
    'WEDNESDAY': 3,
    'THURSDAY': 4,
    'FRIDAY': 5,
    'SATURDAY': 6
  }

  // Generate slots for multiple weeks (8 weeks ahead to ensure availability)
  const weeksAhead = 8
  for (let weekOffset = 0; weekOffset < weeksAhead; weekOffset++) {
    // Process each day in the schedule
    weeklyData.schedule.forEach((daySchedule: any) => {
      if (weekOffset === 0) {
        console.log('📅 Processing day:', daySchedule.dayOfWeek, 'with', daySchedule.timeSlots?.length, 'slots')
      }

      const dayOfWeek = dayMapping[daySchedule.dayOfWeek]
      if (dayOfWeek === undefined) {
        console.log('⚠️ Unknown day of week:', daySchedule.dayOfWeek)
        return
      }

      // Calculate the date for this day in the target week
      const date = new Date(currentWeekStart)
      date.setDate(currentWeekStart.getDate() + (weekOffset * 7) + dayOfWeek)

      if (weekOffset === 0) {
        console.log('Date for', daySchedule.dayOfWeek, ':', date)
      }

      // Process each time slot for this day
      daySchedule.timeSlots.forEach((timeSlot: any) => {
        if (weekOffset === 0) {
          console.log('⏰ Processing time slot:', timeSlot)
        }

        if (!timeSlot.isActive) {
          if (weekOffset === 0) {
            console.log('⚠️ Slot is not active, skipping')
          }
          return
        }

        // Parse start and end times (format: "HH:mm:ss")
        const [startHour, startMin] = timeSlot.startTime.split(':').map(Number)
        const [endHour, endMin] = timeSlot.endTime.split(':').map(Number)

        // Create start and end Date objects
        const startTime = new Date(date)
        startTime.setHours(startHour, startMin, 0, 0)

        const endTime = new Date(date)
        endTime.setHours(endHour, endMin, 0, 0)

        if (weekOffset === 0) {
          console.log('Slot time range:', startTime, 'to', endTime)
          console.log('Is in future?', startTime > now)
        }

        // Include all slots, but mark past slots as unavailable
        const isPast = startTime <= now
        const newSlot = {
          id: `slot-${timeSlot.id}-${date.toISOString()}`,
          apiId: timeSlot.id,
          startTime: startTime,
          endTime: endTime,
          duration: timeSlot.durationInMinutes,
          isAvailable: !isPast, // Past slots are not available
          isPast: isPast,
          maxBookings: 1,
          currentBookings: 0,
          dayOfWeek: daySchedule.dayOfWeek
        }

        if (weekOffset === 0) {
          console.log(isPast ? '⏮️ Adding past slot (grayed):' : '✅ Adding future slot:', newSlot)
        }
        slots.push(newSlot)
      })
    })
  }

  return slots
}

/**
 * Load mentor availability from API
 */
const loadMentorAvailability = async () => {
  isLoadingAvailability.value = true

  try {
    const data = await mentorsStore.getMentorAvailability(props.mentorId, true)
    weeklyAvailabilityData.value = data

    // Convert weekly schedule to calendar slots
    availableSlots.value = convertWeeklyScheduleToSlots(data)

  } catch (error) {
    console.error('Failed to load mentor availability:', error)
    // Keep empty array on error
    availableSlots.value = []
  } finally {
    isLoadingAvailability.value = false
  }
}

/**
 * Refresh slots when the selected date/week changes
 */
const refreshSlotsForSelectedWeek = () => {
  if (weeklyAvailabilityData.value) {
    availableSlots.value = convertWeeklyScheduleToSlots(weeklyAvailabilityData.value)
  }
}

// Watch for date changes to refresh slots
watch(selectedDate, () => {
  refreshSlotsForSelectedWeek()
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
  const slots = getDateSlots(date).filter((s: any) => !s.isPast && s.isAvailable)
  if (!slots.length) return
  const slot = slots[0]
  const formattedSlot = {
    ...slot,
    startTime: new Date(slot.startTime).toISOString(),
    endTime: new Date(slot.endTime).toISOString()
  }
  selectedSlot.value = formattedSlot
  showBookingForm.value = true
  emit('slot-select', formattedSlot)
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
  const filtered = availableSlots.value.filter(slot => {
    const slotDate = new Date(slot.startTime)
    const matches = slotDate.toDateString() === date.toDateString()
    if (matches) {
    }
    return matches
  })
  return filtered
}

const getHourSlots = (date: Date, hour: number) => {
  // Only show slots that START in this hour to avoid duplication
  // The slot will visually span multiple hours via CSS
  return getDateSlots(date).filter(slot => {
    const startTime = new Date(slot.startTime)
    const slotStartHour = startTime.getHours()

    // Only include if it starts in this hour
    return slotStartHour === hour
  })
}

const getHourSessions = (date: Date, hour: number) => {
  return sessions.value.filter(session => {
    const sessionDate = new Date(session.scheduledStart)
    return sessionDate.toDateString() === date.toDateString() &&
           sessionDate.getHours() === hour
  })
}

/**
 * Calculate slot styling based on its duration and position within the hour
 * The slot will span multiple hour cells visually
 */
const getSlotStyle = (slot: any, currentHour: number) => {
  const startTime = new Date(slot.startTime)
  const endTime = new Date(slot.endTime)
  const slotStartHour = startTime.getHours()
  const slotStartMinute = startTime.getMinutes()
  const slotEndHour = endTime.getHours()
  const slotEndMinute = endTime.getMinutes()

  // Calculate the total duration in minutes
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)

  // Calculate top offset as percentage of the hour cell (60px typically)
  const topOffset = (slotStartMinute / 60) * 100

  // Calculate total height needed (in pixels, assuming 60px per hour)
  // We need to span multiple hour rows if duration > 60 minutes
  const hourCellHeight = 60 // This should match min-h-[60px] in the template
  const totalHeightInPixels = (durationMinutes / 60) * hourCellHeight

  // Calculate how much of the first hour cell we use
  const firstHourPercentage = ((60 - slotStartMinute) / 60) * 100

  return {
    top: `${topOffset}%`,
    height: `${totalHeightInPixels}px`,
    position: 'absolute',
    left: '4px',
    right: '4px',
    zIndex: 10
  }
}

const getSlotClasses = (slot: any) => {
  // Past slots - grayed out and not clickable
  if (slot.isPast) {
    return 'bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed opacity-60'
  }

  // Unavailable/booked slots
  if (!slot.isAvailable) {
    return 'bg-red-100 text-red-800 border border-red-200'
  }

  // Available future slots
  return 'bg-green-100 text-green-800 border border-green-200'
}

const getSlotLabel = (slot: any, currentHour: number) => {
  const startTime = new Date(slot.startTime)
  const endTime = new Date(slot.endTime)
  const slotStartHour = startTime.getHours()

  // Only show the label on the starting hour to avoid duplicates
  if (slotStartHour !== currentHour) {
    return ''
  }

  const start = startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  const end = endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const durationMinutes = slot.duration || Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

  // Add "Past" indicator for past slots
  const pastLabel = slot.isPast ? 'Past\n' : ''

  return `${pastLabel}${start} - ${end}\n(${durationMinutes} min)`
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
  // Don't allow booking past slots
  if (slot.isPast) {
    return
  }

  if (slot.isAvailable && props.allowBooking) {
    // Format the slot data with ISO 8601 timestamps
    const formattedSlot = {
      ...slot,
      startTime: new Date(slot.startTime).toISOString(), // Format: 2025-09-16T10:10:00Z
      endTime: new Date(slot.endTime).toISOString()
    }

    selectedSlot.value = formattedSlot
    showBookingForm.value = true
    emit('slot-select', formattedSlot)
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
      requestedStart: selectedSlot.value.startTime, // Already in ISO 8601 format
      requestedEnd: selectedSlot.value.endTime, // Already in ISO 8601 format
      topic: bookingForm.topic || undefined,
      platform: bookingForm.platform,
      message: bookingForm.message
    }

    console.log('📅 Submitting booking with ISO 8601 timestamps:', {
      requestedStart: booking.requestedStart,
      requestedEnd: booking.requestedEnd
    })

    emit('booking-submit', booking)

    // Note: Parent will handle the booking submission and show appropriate messages
    // We'll keep the dialog open during processing via the isLoading prop
  } catch (error) {
    console.error('Booking error:', error)
  } finally {
    isSubmittingBooking.value = false
  }
}

// Watch for when parent stops loading to close dialog on success
watch(() => props.isLoading, (newLoading, oldLoading) => {
  // If loading changed from true to false and dialog is still open
  if (oldLoading && !newLoading && showBookingForm.value) {
    // Close the booking form dialog - parent has finished processing
    showBookingForm.value = false

    // Reset form
    Object.assign(bookingForm, {
      topic: '',
      platform: '',
      message: ''
    })
  }
})

// Load data on mount
onMounted(async () => {
  await loadMentorAvailability()
})
</script> 