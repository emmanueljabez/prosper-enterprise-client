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
      <DialogContent class="booking-session-dialog sm:max-w-[1160px] p-0 overflow-hidden">
        <div v-if="selectedSlot" class="booking-session-layout">
          <section class="booking-session-left">
            <div class="booking-session-left-body">
              <p class="booking-session-eyebrow">MENTORSHIP SESSION</p>
              <h2 class="booking-session-title">Review your session booking</h2>

              <div class="booking-mentor-card">
                <div class="booking-mentor-header">
                  <img
                    v-if="props.mentorAvatar"
                    :src="props.mentorAvatar"
                    :alt="props.mentorName"
                    class="booking-mentor-avatar"
                  >
                  <div v-else class="booking-mentor-avatar booking-mentor-avatar-fallback">
                    {{ mentorInitials }}
                  </div>
                  <div>
                    <p class="booking-mentor-name">{{ props.mentorName }}</p>
                    <p class="booking-mentor-role">{{ props.mentorTitle || 'Mentor' }}</p>
                  </div>
                </div>

                <div class="booking-duration-row">
                  <div class="booking-duration-icon-wrap">
                    <Clock class="h-5 w-5 text-white" />
                  </div>
                  <p class="booking-duration-label"><span class="font-semibold">{{ selectedSlotDurationMinutes }}</span> min Session</p>
                </div>
              </div>
            </div>

            <div class="booking-session-quote">
              "{{ props.mentorQuote || 'Your growth as a leader is a journey we take together. I look forward to exploring your goals.' }}"
            </div>
          </section>

          <section class="booking-session-right">
            <div class="booking-session-right-inner">
              <div>
                <h3 class="booking-form-title">Book a Session</h3>
                <p class="booking-form-subtitle">Fill in the details to schedule your meeting.</p>
              </div>

              <div class="booking-balance-panel">
                <div class="booking-balance-head">
                  <p class="booking-balance-title">Session Allocation</p>
                  <button
                    type="button"
                    class="booking-balance-refresh"
                    :disabled="bookingSessionBalanceLoading"
                    @click="refreshBookingSessionBalance(true)"
                  >
                    {{ bookingSessionBalanceLoading ? 'Refreshing…' : 'Refresh' }}
                  </button>
                </div>
                <div class="booking-balance-grid">
                  <div class="booking-balance-item">
                    <p class="booking-balance-label">Assigned</p>
                    <p class="booking-balance-value">{{ bookingSessionsAssigned }}</p>
                  </div>
                  <div class="booking-balance-item">
                    <p class="booking-balance-label">Sessions Left</p>
                    <p class="booking-balance-value" :class="{ 'is-empty': bookingSessionsLeft <= 0 }">
                      {{ bookingSessionsLeft }}
                    </p>
                  </div>
                </div>
                <p class="booking-balance-meta">{{ bookingSessionBalanceDescription }}</p>
              </div>

              <div
                v-if="hasBookingPersonalBalance"
                class="booking-balance-panel booking-personal-balance-panel"
              >
                <div class="booking-balance-head">
                  <p class="booking-balance-title">Personal Session Balance</p>
                </div>
                <div class="booking-balance-grid">
                  <div class="booking-balance-item">
                    <p class="booking-balance-label">Package</p>
                    <p class="booking-balance-value is-plan-name">{{ bookingPersonalBalanceTitle }}</p>
                  </div>
                  <div class="booking-balance-item">
                    <p class="booking-balance-label">Sessions Left</p>
                    <p class="booking-balance-value" :class="{ 'is-empty': bookingPersonalBalanceLeft <= 0 }">
                      {{ bookingPersonalBalanceLeft }}
                    </p>
                  </div>
                </div>
                <p class="booking-balance-meta">{{ bookingPersonalBalanceDescription }}</p>
              </div>

              <div class="booking-field-group">
                <Label class="booking-field-label">Select Date</Label>
                <div class="booking-field-static">
                  <Calendar class="h-5 w-5 text-[#0a8167]" />
                  <span>{{ selectedSlotDateLabel }}</span>
                </div>
              </div>

              <div class="booking-field-group">
                <Label class="booking-field-label">Session Topic</Label>
                <Select v-if="props.topics && props.topics.length" v-model="bookingForm.topic">
                  <SelectTrigger class="booking-field-select">
                    <SelectValue placeholder="Select session topic..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="t in props.topics" :key="t" :value="t">{{ t }}</SelectItem>
                  </SelectContent>
                </Select>
                <div v-else class="booking-field-static">
                  <span>General Mentorship Session</span>
                </div>
              </div>

              <div class="booking-field-group">
                <Label class="booking-field-label">Description &amp; Goals</Label>
                <Textarea
                  v-model="bookingForm.message"
                  placeholder="Briefly describe what you'd like to achieve in this session"
                  class="booking-field-textarea"
                />
              </div>

              <div class="booking-actions">
                <Button
                  class="booking-submit-btn"
                  :disabled="props.isLoading || isSubmittingBooking"
                  @click="submitBooking"
                >
                  <span v-if="props.isLoading || isSubmittingBooking" class="inline-block animate-spin mr-2">⏳</span>
                  {{ props.isLoading || isSubmittingBooking ? 'Processing...' : bookingSubmitButtonLabel }}
                </Button>
                <Button
                  variant="ghost"
                  class="booking-cancel-btn"
                  :disabled="props.isLoading || isSubmittingBooking"
                  @click="showBookingForm = false"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </section>
        </div>
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
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { useSubscriptionsStore } from '@/store/modules/subscriptions'
import { useAuthStore } from '@/store/modules/auth'

interface Props {
  mentorId: string
  mentorName?: string
  mentorAvatar?: string | null
  mentorTitle?: string | null
  mentorQuote?: string | null
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
  mentorAvatar: null,
  mentorTitle: null,
  mentorQuote: null,
  defaultTimezone: 'Africa/Nairobi',
  allowBooking: true,
  topics: () => [],
  isLoading: false
})

const emit = defineEmits<Emits>()

// Store
const mentorsStore = useMentorsStore()
const companyProgramsStore = useCompanyProgramsStore()
const subscriptionsStore = useSubscriptionsStore()
const authStore = useAuthStore()

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
const bookingSessionBalanceLoading = ref(false)
const bookingSessionBalanceLoaded = ref(false)

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
  platform: 'google-meet',
  message: ''
})

const bookingSessionBalance = computed(() => companyProgramsStore.employeeSessionBalance)
const bookingSubscriptionContext = computed(() => subscriptionsStore.activeSubscriptionContext)
const bookingPersonalSubscription = computed(() => bookingSubscriptionContext.value?.subscription || null)
const bookingPersonalPlanName = computed(() => String(bookingPersonalSubscription.value?.plan?.name || '').trim())
const bookingPersonalSessionsIncluded = computed(() => {
  const subscription = bookingPersonalSubscription.value
  const explicitIncluded = Number(subscription?.sessionsPerMonth)
  if (Number.isFinite(explicitIncluded) && explicitIncluded > 0) {
    return explicitIncluded
  }

  const planIncluded = Number(subscription?.plan?.sessionsPerPeriod)
  return Number.isFinite(planIncluded) && planIncluded > 0 ? planIncluded : 0
})
const bookingPersonalSessionsUsed = computed(() =>
  Math.max(0, Number(bookingPersonalSubscription.value?.sessionsUsed || 0))
)
const bookingPersonalSubscriptionLeft = computed(() => {
  const explicitRemaining = Number(bookingPersonalSubscription.value?.remainingSessionsCount)
  if (Number.isFinite(explicitRemaining) && explicitRemaining >= 0) {
    return explicitRemaining
  }

  const included = bookingPersonalSessionsIncluded.value
  if (included <= 0) {
    return 0
  }

  return Math.max(0, included - bookingPersonalSessionsUsed.value)
})
const bookingPersonalCreditsLeft = computed(() => {
  const context = bookingSubscriptionContext.value
  if (!context) return 0
  const explicitCredits = Number(context.personalCreditsRemaining || 0)
  if (explicitCredits > 0) return explicitCredits
  return context.subscriptionSource === 'PERSONAL_CREDIT'
    ? Math.max(0, Number(context.remainingSessions || 0))
    : 0
})
const bookingPersonalBalanceLeft = computed(() =>
  bookingPersonalSubscription.value
    ? bookingPersonalSubscriptionLeft.value
    : bookingPersonalCreditsLeft.value
)
const bookingPersonalBalanceTotal = computed(() => {
  if (!bookingPersonalSubscription.value) {
    return bookingPersonalCreditsLeft.value
  }

  return Math.max(
    bookingPersonalSessionsIncluded.value,
    bookingPersonalSessionsUsed.value + bookingPersonalSubscriptionLeft.value,
  )
})
const hasBookingPersonalBalance = computed(() =>
  Boolean(bookingPersonalSubscription.value)
  || bookingPersonalSessionsIncluded.value > 0
  || bookingPersonalSubscriptionLeft.value > 0
  || bookingPersonalCreditsLeft.value > 0
)
const bookingPersonalBalanceTitle = computed(() => {
  if (bookingPersonalPlanName.value) {
    return bookingPersonalPlanName.value
  }

  return bookingPersonalCreditsLeft.value > 0
    ? 'Personal credits'
    : 'Personal package'
})
const bookingSessionsAssigned = computed(() => Math.max(0, Number(bookingSessionBalance.value?.allocatedTotal || 0)))
const bookingSessionsUsed = computed(() => Math.max(0, Number(bookingSessionBalance.value?.consumedTotal || 0)))
const bookingSessionsLeft = computed(() => Math.max(0, Number(bookingSessionBalance.value?.availableBalance || 0)))
const bookingSessionCompanyName = computed(() => String(bookingSessionBalance.value?.companyName || '').trim())
const bookingSessionBalanceDescription = computed(() => {
  if (bookingSessionBalanceLoading.value && !bookingSessionBalanceLoaded.value) {
    return 'Loading your assigned session allocation...'
  }

  if (!bookingSessionBalance.value) {
    return 'Assigned sessions are unavailable for this account.'
  }

  const assigned = bookingSessionsAssigned.value
  const used = bookingSessionsUsed.value
  const left = bookingSessionsLeft.value

  if (assigned <= 0) {
    return 'You have no assigned sessions yet.'
  }

  const companyLabel = bookingSessionCompanyName.value
    ? ` via ${bookingSessionCompanyName.value}`
    : ''

  return `${left} of ${assigned} assigned session${assigned === 1 ? '' : 's'}${companyLabel} remaining (${used} used).`
})

const bookingPersonalBalanceDescription = computed(() => {
  if (bookingPersonalSubscription.value) {
    const left = bookingPersonalSubscriptionLeft.value
    const total = bookingPersonalBalanceTotal.value
    const used = bookingPersonalSessionsUsed.value

    if (total > 0) {
      return `${left} of ${total} paid session${total === 1 ? '' : 's'} remaining (${used} used).`
    }

    return `${left} paid session${left === 1 ? '' : 's'} remaining.`
  }

  const credits = bookingPersonalCreditsLeft.value
  return `${credits} personal credited session${credits === 1 ? '' : 's'} available for rebooking.`
})
const bookingHasUsableSessionBalance = computed(() =>
  bookingSessionsLeft.value > 0 || bookingPersonalBalanceLeft.value > 0
)
const bookingSubmitButtonLabel = computed(() =>
  bookingHasUsableSessionBalance.value ? 'Book Session' : 'Proceed To Pay'
)

const resolveCurrentUserId = (): string | null => {
  const storeUserId = authStore.loggedInUser?.id
  if (storeUserId) {
    return storeUserId
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('loggedInUser')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        return parsed?.id || null
      } catch {
        return null
      }
    }
  }

  return null
}

const refreshBookingSessionBalance = async (force = false) => {
  if (bookingSessionBalanceLoading.value) {
    return
  }

  if (bookingSessionBalanceLoaded.value && !force) {
    return
  }

  bookingSessionBalanceLoading.value = true
  try {
    const userId = resolveCurrentUserId()
    await Promise.all([
      companyProgramsStore.loadMySessionBalance(),
      userId ? subscriptionsStore.fetchActiveSubscription(userId) : Promise.resolve(),
    ])
  } catch (error: any) {
    console.warn('Could not load employee session balance for booking dialog:', error)
  } finally {
    bookingSessionBalanceLoading.value = false
    bookingSessionBalanceLoaded.value = true
  }
}

// Computed properties
const timezone = computed(() => selectedTimezone.value)
const mentorInitials = computed(() => {
  const name = String(props.mentorName || '').trim()
  if (!name) return 'M'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')
})
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
const selectedSlotDateLabel = computed(() => formatSlotDate(selectedSlot.value))
const selectedSlotDurationMinutes = computed(() => {
  if (!selectedSlot.value) return 60
  if (Number(selectedSlot.value.duration) > 0) return Number(selectedSlot.value.duration)

  const start = new Date(selectedSlot.value.startTime).getTime()
  const end = new Date(selectedSlot.value.endTime).getTime()
  if (!start || !end || end <= start) return 60
  return Math.round((end - start) / (1000 * 60))
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
  prepareBookingForm()
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
    prepareBookingForm()
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
      platform: bookingForm.platform || 'google-meet',
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

const prepareBookingForm = () => {
  bookingForm.platform = 'google-meet'
  if (!bookingForm.topic && props.topics && props.topics.length) {
    bookingForm.topic = props.topics[0]
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
      platform: 'google-meet',
      message: ''
    })
  }
})

watch(() => showBookingForm.value, (isOpen) => {
  if (isOpen) {
    prepareBookingForm()
    void refreshBookingSessionBalance(true)
  }
})

// Load data on mount
onMounted(async () => {
  await loadMentorAvailability()
  void refreshBookingSessionBalance()
})
</script>

<style scoped>
.booking-session-layout {
  display: grid;
  grid-template-columns: minmax(280px, 42%) minmax(0, 58%);
  min-height: 620px;
}

.booking-session-left {
  background: #fbfcfc;
  border-right: 1px solid #e7eaee;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.booking-session-left-body {
  padding: 2.25rem 2.25rem 1.5rem;
}

.booking-session-eyebrow {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f6b45;
  letter-spacing: 0.03em;
  margin-bottom: 0.7rem;
}

.booking-session-title {
  font-size: clamp(1.9rem, 2.7vw, 3.05rem);
  line-height: 1.08;
  font-weight: 700;
  color: #191d24;
  max-width: 12ch;
  margin: 0 0 2rem;
}

.booking-mentor-card {
  border: 1px solid #ebedf1;
  background: white;
  border-radius: 1.25rem;
  padding: 1.35rem 1.25rem;
  max-width: 430px;
}

.booking-mentor-header {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.booking-mentor-avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 0.9rem;
  object-fit: cover;
}

.booking-mentor-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0b8a6e;
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
}

.booking-mentor-name {
  font-size: 1.65rem;
  font-weight: 700;
  line-height: 1.1;
  color: #191d24;
}

.booking-mentor-role {
  font-size: 1.05rem;
  color: #5f6775;
  margin-top: 0.2rem;
}

.booking-duration-row {
  margin-top: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.booking-duration-icon-wrap {
  width: 2.65rem;
  height: 2.65rem;
  border-radius: 999px;
  background: #0a8167;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.booking-duration-label {
  font-size: 1.15rem;
  color: #1f2530;
}

.booking-session-quote {
  border-top: 1px solid #e7eaee;
  padding: 1.7rem 2.25rem 1.95rem;
  font-size: 1.15rem;
  line-height: 1.45;
  color: #1f2530;
}

.booking-session-right {
  background: white;
}

.booking-session-right-inner {
  padding: 2.15rem 2.25rem 2rem;
  max-width: 670px;
}

.booking-form-title {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.15;
  color: #13171d;
}

.booking-form-subtitle {
  margin-top: 0.5rem;
  font-size: 1.2rem;
  color: #3f4653;
}

.booking-balance-panel {
  margin-top: 1rem;
  border: 1px solid #d8dfeb;
  border-radius: 0.85rem;
  background: #f8fbff;
  padding: 0.95rem 1.05rem;
}

.booking-personal-balance-panel {
  border-color: #b9e5d8;
  background: #f5fffb;
}

.booking-balance-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.booking-balance-title {
  font-size: 0.86rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #2e3a4d;
  text-transform: uppercase;
}

.booking-balance-refresh {
  border: none;
  background: transparent;
  color: #0a8167;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
}

.booking-balance-refresh:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.booking-balance-grid {
  margin-top: 0.7rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.booking-balance-item {
  border-radius: 0.7rem;
  background: white;
  border: 1px solid #e0e5ef;
  padding: 0.65rem 0.7rem;
}

.booking-balance-label {
  font-size: 0.78rem;
  color: #728097;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}

.booking-balance-value {
  margin-top: 0.25rem;
  font-size: 1.32rem;
  font-weight: 700;
  color: #1f2430;
  line-height: 1;
}

.booking-balance-value.is-plan-name {
  font-size: 0.95rem;
  line-height: 1.2;
}

.booking-balance-value.is-empty {
  color: #b64040;
}

.booking-balance-meta {
  margin-top: 0.65rem;
  font-size: 0.88rem;
  color: #5c687a;
  line-height: 1.35;
}

.booking-field-group {
  margin-top: 1.4rem;
}

.booking-field-label {
  display: inline-block;
  margin-bottom: 0.55rem;
  font-size: 1.05rem;
  font-weight: 500;
  color: #212833;
}

.booking-field-static {
  min-height: 4.15rem;
  border: 1px solid #d7dce2;
  border-radius: 0.95rem;
  padding: 0.88rem 1.05rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.28rem;
  color: #191d24;
}

.booking-field-select {
  min-height: 4.15rem;
  border-color: #d7dce2;
  border-radius: 0.95rem;
  font-size: 1.28rem;
  color: #191d24;
  padding-left: 1rem;
}

.booking-field-textarea {
  min-height: 11.5rem;
  border-color: #d7dce2;
  border-radius: 0.95rem;
  font-size: 1.2rem;
  line-height: 1.45;
  padding: 1rem 1.05rem;
  resize: none;
}

.booking-actions {
  margin-top: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.booking-submit-btn {
  min-width: 15.5rem;
  height: 3.45rem;
  border-radius: 999px;
  background: #0a8167;
  color: white;
  font-size: 1.08rem;
  font-weight: 600;
}

.booking-submit-btn:hover {
  background: #086f58;
}

.booking-cancel-btn {
  color: #222a35;
  font-size: 1.12rem;
  font-weight: 500;
}

@media (max-width: 1100px) {
  .booking-session-layout {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .booking-session-left {
    border-right: 0;
    border-bottom: 1px solid #e7eaee;
  }

  .booking-session-title {
    max-width: 100%;
    margin-bottom: 1.4rem;
  }

  .booking-mentor-name {
    font-size: 1.25rem;
  }

  .booking-session-quote {
    padding-top: 1.2rem;
  }

  .booking-balance-grid {
    grid-template-columns: 1fr;
  }
}
</style>
