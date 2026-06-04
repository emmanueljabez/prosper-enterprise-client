<script setup lang="ts">
import { onMounted, ref, computed, nextTick, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMentorsStore } from '@/store/modules/mentors'
import { useSubscriptionsStore } from '@/store/modules/subscriptions'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { storeToRefs } from 'pinia'

// UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, AlertCircle, Clock3, CreditCard, Loader2, CheckCircle2, XCircle, Linkedin } from 'lucide-vue-next'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import MentorReviews from '@/components/ui/mentors/MentorReviews.vue'
import { useAppToast } from '@/composables/services/toastService'
import {useSessionsStore} from "~/store/modules/sessions/sessions";
import type { SubscriptionPlan } from '@/http/requests/app/subscriptions'
import invoicesApi from '@/http/requests/app/invoices'

definePageMeta({
  title: 'Mentor Profile',
  requiresAuth: true,
})

const route = useRoute()
const router = useRouter()
const mentorsStore = useMentorsStore()
const sessionStore = useSessionsStore()
const subscriptionsStore = useSubscriptionsStore()
const authStore = useAuthStore()
const companyProgramsStore = useCompanyProgramsStore()
const { mentors } = storeToRefs(mentorsStore)

const mentor = ref<any | null>(null)
const isLoading = ref(true)
const isBookingSession = ref(false)
const activeTab = ref('overview')
const toast = useAppToast()
const showJourneyLoadingDialog = ref(false)
const journeyLoadingTitle = ref('Working on your booking')
const journeyLoadingMessage = ref('Please wait while we process your request...')

// Compact date picker for sidebar — driven by real availability schedule
const selectedDate = ref<Date | null>(null)
const mentorAvailability = ref<any | null>(null)

const DAY_NAME_TO_NUM: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
}

const DAY_NUM_TO_API_NAME: Record<number, string> = {
  0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY'
}

// Simple booking form (used by date-chip "Book Session for [date]" button)
const showSimpleBookingForm = ref(false)
const bookingSlot = ref<{ start: string; end: string } | null>(null)
const selectedBookingDate = ref('')
const simpleBookingForm = reactive({ topic: '', platform: '', message: '' })
const bookingSessionBalanceLoading = ref(false)
const bookingSessionBalanceLoaded = ref(false)

const bookingSessionBalance = computed(() => companyProgramsStore.employeeSessionBalance)
const bookingSubscriptionContext = computed(() => subscriptionsStore.activeSubscriptionContext)
const bookingPersonalCreditsLeft = computed(() => {
  const context = bookingSubscriptionContext.value
  if (!context) return 0
  const explicitCredits = Number(context.personalCreditsRemaining || 0)
  if (explicitCredits > 0) return explicitCredits
  return context.subscriptionSource === 'PERSONAL_CREDIT'
    ? Math.max(0, Number(context.remainingSessions || 0))
    : 0
})
const bookingSessionsAssigned = computed(() => Math.max(0, Number(bookingSessionBalance.value?.allocatedTotal || 0)))
const bookingSessionsUsed = computed(() => Math.max(0, Number(bookingSessionBalance.value?.consumedTotal || 0)))
const bookingSessionsLeft = computed(() => Math.max(0, Number(bookingSessionBalance.value?.availableBalance || 0)))
const bookingDisplayAssigned = computed(() =>
  bookingSessionsAssigned.value > 0 ? bookingSessionsAssigned.value : bookingPersonalCreditsLeft.value
)
const bookingDisplayLeft = computed(() =>
  bookingSessionsAssigned.value > 0 ? bookingSessionsLeft.value : bookingPersonalCreditsLeft.value
)
const bookingSessionCompanyName = computed(() => String(bookingSessionBalance.value?.companyName || '').trim())

const bookingSessionBalanceDescription = computed(() => {
  if (bookingSessionBalanceLoading.value && !bookingSessionBalanceLoaded.value) {
    return 'Loading your session balance...'
  }

  if (bookingPersonalCreditsLeft.value > 0 && bookingSessionsAssigned.value <= 0) {
    const credits = bookingPersonalCreditsLeft.value
    return `${credits} credited session${credits === 1 ? '' : 's'} available for rebooking.`
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
    console.warn('Could not load session balance for booking dialog:', error)
  } finally {
    bookingSessionBalanceLoading.value = false
    bookingSessionBalanceLoaded.value = true
  }
}

const normalizeMentorTopics = (value: unknown): string[] => {
  if (!value) return []

  const normalized: string[] = []

  const pushTopic = (topicValue: unknown) => {
    const topic = String(topicValue || '').trim()
    if (!topic) return
    if (!normalized.includes(topic)) {
      normalized.push(topic)
    }
  }

  if (Array.isArray(value)) {
    value.forEach((entry: any) => {
      if (typeof entry === 'string') {
        pushTopic(entry)
        return
      }

      if (entry && typeof entry === 'object') {
        pushTopic(entry.name || entry.title || entry.topic || entry.label)
      }
    })
    return normalized
  }

  if (typeof value === 'string') {
    value
      .split(',')
      .map(part => part.trim())
      .filter(Boolean)
      .forEach(pushTopic)
  }

  return normalized
}

const mentorTopicOptions = computed(() => {
  const mergedSources = [
    mentor.value?.expertiseAreas,
    mentor.value?.expertise,
    mentor.value?.mentorSpecializations,
    mentor.value?.interests,
    mentor.value?.topics,
    mentor.value?.skills,
  ]

  const topics = mergedSources.flatMap(source => normalizeMentorTopics(source))
  return normalizeMentorTopics(topics)
})

const toDateValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fromDateValue = (value: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }

  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

const buildBookingSlotFromDate = (date: Date) => {
  const now = new Date()
  const dayName = DAY_NUM_TO_API_NAME[date.getDay()]
  const daySchedule = mentorAvailability.value?.schedule?.find((s: any) => s.dayOfWeek === dayName)
  const activeSlots = (daySchedule?.timeSlots || [])
    .filter((t: any) => t.isActive)
    .map((t: any) => {
      const [sh, sm] = t.startTime.split(':').map(Number)
      const [eh, em] = t.endTime.split(':').map(Number)
      const startDate = new Date(date)
      startDate.setHours(sh, sm, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(eh, em, 0, 0)
      return { startDate, endDate }
    })
    .filter((slot: any) => slot.startDate.getTime() > now.getTime())
    .sort((a: any, b: any) => a.startDate.getTime() - b.startDate.getTime())

  if (activeSlots.length) {
    return {
      start: activeSlots[0].startDate.toISOString(),
      end: activeSlots[0].endDate.toISOString(),
    }
  }

  const startDate = new Date(date)
  const isToday = startDate.toDateString() === now.toDateString()
  if (isToday) {
    const next = new Date(now.getTime() + (30 * 60 * 1000))
    next.setSeconds(0, 0)
    const minute = next.getMinutes()
    if (minute === 0 || minute === 30) {
      startDate.setHours(next.getHours(), minute, 0, 0)
    } else if (minute < 30) {
      startDate.setHours(next.getHours(), 30, 0, 0)
    } else {
      startDate.setHours(next.getHours() + 1, 0, 0, 0)
    }
  } else {
    startDate.setHours(12, 0, 0, 0)
  }

  const endDate = new Date(startDate)
  endDate.setMinutes(endDate.getMinutes() + 60)

  return { start: startDate.toISOString(), end: endDate.toISOString() }
}

const applyBookingDate = (date: Date) => {
  selectedDate.value = new Date(date)
  selectedBookingDate.value = toDateValue(date)
  bookingSlot.value = buildBookingSlotFromDate(date)
}

const syncBookingSlotFromSelectedDateValue = (value: string) => {
  const parsed = fromDateValue(value)
  if (!parsed) {
    bookingSlot.value = null
    return
  }
  selectedDate.value = new Date(parsed)
  bookingSlot.value = buildBookingSlotFromDate(parsed)
}

watch(selectedBookingDate, syncBookingSlotFromSelectedDateValue)

const isPastCalendarDate = (date: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const candidate = new Date(date)
  candidate.setHours(0, 0, 0, 0)
  return candidate.getTime() < today.getTime()
}

const openSimpleBookingForm = () => {
  const date = selectedDate.value ?? availableDates.value[0]?.full ?? new Date()

  applyBookingDate(date)
  Object.assign(simpleBookingForm, {
    topic: mentorTopicOptions.value[0] || '',
    platform: 'google-meet',
    message: ''
  })
  void refreshBookingSessionBalance()
  showSimpleBookingForm.value = true
}

watch(showSimpleBookingForm, open => {
  if (open) {
    void refreshBookingSessionBalance(true)
  }
})

const submitSimpleBooking = async () => {
  if (!bookingSlot.value || new Date(bookingSlot.value.start).getTime() <= Date.now()) {
    toast.error('Please select a future date and time for this session.')
    return
  }

  if (mentorTopicOptions.value.length && !simpleBookingForm.topic) {
    toast.error('Please select a session topic.')
    return
  }

  startJourneyLoading(
    'Submitting Booking',
    'Checking eligibility and creating your session request...'
  )
  showSimpleBookingForm.value = false
  await nextTick()
  await handleBookingSubmit({
    requestedStart: bookingSlot.value.start,
    requestedEnd: bookingSlot.value.end,
    platform: simpleBookingForm.platform,
    message: simpleBookingForm.message,
    topic: simpleBookingForm.topic
  }, { loadingAlreadyStarted: true })
}

// Days that have at least one active slot in the mentor's weekly schedule
const availableWeekdays = computed<number[]>(() => {
  const schedule = mentorAvailability.value?.schedule
  if (!schedule?.length) return []
  return schedule
    .filter((s: any) => s.timeSlots?.some((t: any) => t.isActive))
    .map((s: any) => DAY_NAME_TO_NUM[s.dayOfWeek?.toLowerCase()] ?? -1)
    .filter((n: number) => n >= 0)
})

// Next real dates that fall on an available weekday (max 5)
const availableDates = computed(() => {
  const targets = availableWeekdays.value
  if (!targets.length) return []

  const result: { day: string; dateNum: number; month: string; full: Date }[] = []
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const cursor = new Date()

  for (let i = 0; i < 30 && result.length < 5; i++) {
    cursor.setDate(cursor.getDate() + 1)
    if (targets.includes(cursor.getDay())) {
      result.push({
        day: dayLabels[cursor.getDay()],
        dateNum: cursor.getDate(),
        month: monthLabels[cursor.getMonth()],
        full: new Date(cursor)
      })
    }
  }
  return result
})

const selectedDateLabel = computed(() => {
  const d = selectedDate.value ?? availableDates.value[0]?.full
  if (!d) return null
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d.getDate()} ${monthLabels[d.getMonth()]} ${d.getFullYear()}`
})

// Unified payment redirect state
const selectedPlanForPayment = ref<SubscriptionPlan | null>(null)
const pendingBooking = ref<any | null>(null)
const isRedirectingToPayment = ref(false)

// Error dialog state
const showErrorDialog = ref(false)
const errorDialogMessage = ref('')
const errorDialogTitle = ref('Subscription Limit Reached')
const recommendedPlans = ref<SubscriptionPlan[]>([])
const selectedRecommendedPlan = ref<string | null>(null)

// Addon options state
const addOnOption = ref<any | null>(null)
const selectedAddonQuantity = ref(1)

// Retry dialog state
const showRetryDialog = ref(false)
const isRetrying = ref(false)
const retryStatus = ref<'processing' | 'success' | 'error'>('processing')
const retryMessage = ref('')

const startJourneyLoading = (title: string, message: string) => {
  journeyLoadingTitle.value = title
  journeyLoadingMessage.value = message
  showJourneyLoadingDialog.value = true
}

const stopJourneyLoading = () => {
  showJourneyLoadingDialog.value = false
}

// Minimal fallback dataset (topics trimmed to names only)
const fallbackData = () => {
  // Reuse the list embedded in the mentors index page by keeping a minimal version here
  return [
    // Only include id, name, occupation, country, profilePicUrl, biography, topics
    // This avoids an extra import and ensures the page works standalone
    { id: '60ea94d2d5efdc75988d09f5', name: 'Thrity Engineer', occupation: '', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FPROFILE%20PIC.jpg?alt=media&token=1f9a5d98-9f0a-47ae-8c33-5bc1b0b2ab8e', biography: 'Thrity is a seasoned marketer with over 20 years experience in leading diverse teams, strategy development and brand communication. She is also an executive leadership coach.', topics: [ { name: 'How to Ace the Interview' }, { name: 'How to Build My Personal Brand' }, { name: 'Increasing My Personal Productivity' }, { name: 'How to Enjoy My Life & My Work' }, { name: 'How to Advance My Career' } ] },
    { id: '60ea94d3d5efdc75988d09fe', name: 'Achieng Butler', occupation: 'CEO - Marketing Strategist - Consultant', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2F25FBD548-14F5-4D04-B0E8-A4737F3320A1.jpeg?alt=media&token=a4584fca-69d8-4b89-8f1d-bc0e5093fa75', biography: "Founder & CEO of Digital Beehive (strategy & digital marketing: digitalbeehive.net). Seasoned marketer & keen techpreneur.", topics: [ { name: 'How to Advance My Career' }, { name: 'How to Build My Personal Brand' }, { name: 'How to Build My Online Presence' } ] },
    { id: '60ea94d6d5efdc75988d0a3f', name: 'Faith Nkatha Gitonga', occupation: '', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FBD84BAA5-BED1-468E-9EAF-60230E5E4A0E.jpeg?alt=media&token=efa8e28e-ecc2-4877-bc9b-72e49d276961', biography: 'Faith currently works for Oracle Corporation leading their Digital Transformation efforts for the Public Sector.', topics: [ { name: 'How to Build My Personal Brand' }, { name: 'How to Advance My Career' }, { name: 'How to Ace the Interview' } ] },
    { id: '60ea94d4d5efdc75988d0a21', name: 'Janice Kemoli', occupation: '', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2F0F16A019-1207-4487-B61A-9F9BD22F796B.jpeg?alt=media&token=5c21e191-43c3-4390-ad08-c70ae41f2e7c', biography: 'A thought leader in brand and marketing strategy.', topics: [ { name: 'Creating My Ability to Adapt to Change' }, { name: 'How to Advance My Career' }, { name: 'How to Find a Job' } ] },
    { id: '60ea94d4d5efdc75988d0a11', name: 'Dick Omondi', occupation: '', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosper-app.appspot.com/o/images%2FIMG-3499.JPG?alt=media&token=4129ea7a-a83e-4c51-a9cf-e5673803540c', biography: 'I work to grow people and brands through cutting edge strategies.', topics: [ { name: 'How to Show Up & Boss Up' }, { name: 'How to Strategically Network' }, { name: 'How to Build My Personal Brand' } ] },
    { id: '60ea94d4d5efdc75988d0a14', name: 'Susan Kiamba', occupation: 'Career Development Trainer', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FProfile_Pic_Susan_Kiamba001.jpg?alt=media&token=93fc6d24-f690-4e6f-8177-1fe61cb4267b', biography: 'Career development trainer who creates Aha! moments about careers and work.', topics: [ { name: 'How to Build My Personal Brand' }, { name: 'How to Advance My Career' }, { name: 'How to Build My Online Presence' } ] },
    { id: '60ea94d4d5efdc75988d0a0e', name: 'George Muriithi Weru', occupation: 'Consulting', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FGeorge%20Weru%20Photo.jpg?alt=media&token=956f26e0-5bd9-4a78-919e-8702a83925e8', biography: 'Experienced professional in accounting and finance.', topics: [ { name: 'How to Advance My Career' } ] },
    { id: '60ea94d5d5efdc75988d0a2b', name: 'Paul Muhami', occupation: 'Entrepreneur', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FIMG-20200910-WA0006.jpg?alt=media&token=f4d0792d-7e2f-4d74-9873-889752df6dc7', biography: 'Entrepreneur, certified business coach and mentor.', topics: [ { name: 'My Personal Finance' }, { name: 'How to Start a Business' }, { name: 'How to Grow My Business' } ] },
    { id: '60ea94d4d5efdc75988d0a18', name: 'Jonathan Muga', occupation: 'Banker', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosper-app.appspot.com/o/images%2FIMG-20200424-WA0031.jpg?alt=media&token=1aad57ba-9ff6-4d7c-a96f-876dc1074834', biography: '17+ years multinational experience in finance.', topics: [ { name: 'How to Negotiate the Best Deal' }, { name: 'How to Advance My Career' }, { name: 'Other' } ] },
    { id: '60ea94d3d5efdc75988d0a02', name: 'Topyster Muga', occupation: 'Founder and CEO| Digital Financial Services| On-Demand Services', country: 'Kenya', profilePicUrl: 'https://myprosper-email-assets.s3-eu-west-1.amazonaws.com/0b913452a70b4556b82c58b01707c95f.jpeg', biography: 'Founder and CEO of Prosper Mentor. Multi-national, multi-faceted career in technology.', topics: [ { name: 'How to Write a Stellar CV' }, { name: 'How to Advance My Career' }, { name: 'How to Ace the Interview' } ] },
    { id: '646515c2b42b1d68dd4d6a8f', name: 'Amos Gachuiri', occupation: 'Investment Professional', country: 'Kenya', profilePicUrl: 'https://my-prosper-public-assets.s3-eu-west-1.amazonaws.com/fc7d6f3eb56542569c6fefb028e5aac1.jpg', biography: 'Board-level leader with 20+ years’ investment experience.', topics: [ { name: 'My Personal Finance' }, { name: 'How to Negotiate the Best Deal' }, { name: 'How to Start a Business' } ] },
    // Additional mentors used in Program page
    { id: '60ea94d2d5efdc75988d09ec', name: 'James Gachie', occupation: '', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FJames%20Gachie%201.jpg?alt=media&token=64b162e0-3c93-43f8-b67b-ea65010c668a', biography: 'Sales and Strategy across Western Europe, The Balkans and Africa.', topics: [ { name: 'How to Advance My Career' }, { name: 'How to Ace the Interview' }, { name: 'How to Build My Online Presence' } ] },
    { id: '60ea94d3d5efdc75988d09f9', name: 'John N. Njathi', occupation: '', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FIMG-20200717-WA0000.jpg?alt=media&token=ef0e1144-7852-4a8f-9c81-34a9e65ff2b6', biography: '', topics: [ { name: 'How to Advance My Career' }, { name: 'Building My Personal Resilience' }, { name: 'Creating My Ability to Adapt to Change' } ] },
    { id: '60ea94d3d5efdc75988d09fa', name: 'Jonnah Owen Rao', occupation: '', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FRadekArtPhoto-9743.jpg?alt=media&token=09e23b07-7c80-4570-94ab-2915b6b42a7b', biography: 'Strategic planning, risk management and venture advisory.', topics: [ { name: 'My Personal Finance' }, { name: 'How to Advance My Career' }, { name: 'Creating My Ability to Adapt to Change' }, { name: 'Other' } ] },
    { id: '60ea94d3d5efdc75988d09f8', name: 'Vincent Wakaba', occupation: 'Banker', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FVincent%20Wakaba%20Passport%20Photo.JPG?alt=media&token=474fe036-942e-4e08-809c-a56e7dc3c66c', biography: 'DFS and mobile money experience across East and West Africa.', topics: [ { name: 'How to Advance My Career' }, { name: 'Creating My Ability to Adapt to Change' } ] },
    { id: '60ea94d3d5efdc75988d0a05', name: 'Azmina Mulji', occupation: 'Professional Coach & Mentor. HR Expert', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2F2C2CFE40-D3F6-4B50-93F9-4504FC8B480D.jpeg?alt=media&token=7eb483e5-4757-4667-93c0-9ace3ff4c099', biography: 'Coaching and mentoring to develop potential.', topics: [ { name: 'How to Advance My Career' }, { name: 'How to Enjoy My Life & My Work' }, { name: 'Discovering My Truest Self' }, { name: 'How to Show Up & Boss Up' }, { name: 'Increasing My Personal Productivity' } ] },
  ]
}

const loadAvailability = async () => {
  if (!mentor.value?.id) return
  try {
    mentorAvailability.value = await mentorsStore.getMentorAvailability(mentor.value.id)
  } catch (e) {
    console.warn('Could not load availability:', e)
  }
}

const loadMentor = async () => {
  isLoading.value = true
  const id = route.params.id as string
  try {
    // First, try to fetch from API
    try {
      const mentorProfile = await mentorsStore.getMentorProfileById(id)
      if (mentorProfile) {
        // Map API response to component format
        mentor.value = {
          id: mentorProfile.id,
          firstName: mentorProfile.firstName,
          lastName: mentorProfile.lastName,
          title: mentorProfile.industry || 'Professional Mentor',
          company: mentorProfile.location || mentorProfile.country || '',
          profilePhoto: mentorProfile.avatarUrl,
          profileSummary: mentorProfile.bio,
          expertiseAreas: mentorProfile.expertise || [],
          expertise: mentorProfile.expertise || [],
          mentorSpecializations: mentorProfile.mentorProfile?.specializations || [],
          interests: mentorProfile.interests || [],
          averageRating: 4.5,
          totalReviews: 0,
          totalSessions: 0,
          email: mentorProfile.email,
          phone: mentorProfile.phone,
          linkedInUrl: mentorProfile.linkedinUrl,
          favouriteQuote: mentorProfile.favouriteQuote,
          isVerified: mentorProfile.isVerified
        }
        return
      }
    } catch (apiError) {
      console.warn('Failed to fetch mentor from API, falling back to store/fallback data:', apiError)
    }

    // Try find in current store list
    const fromStore = mentors.value?.find((m: any) => m.id === id)
    if (fromStore) {
      mentor.value = fromStore
      return
    }

    // Fallback to embedded data (convert to simple structure compatible with template)
    const fb = fallbackData().find(m => m.id === id)
    if (fb) {
      mentor.value = {
        id: fb.id,
        firstName: fb.name,
        lastName: '',
        title: fb.occupation || 'Professional Mentor',
        company: fb.country || 'Kenya',
        profilePhoto: fb.profilePicUrl,
        profileSummary: fb.biography,
        expertiseAreas: (fb.topics || []).map((t: any) => t.name),
        expertise: (fb.topics || []).map((t: any) => t.name),
        mentorSpecializations: [],
        interests: [],
        averageRating: 4.9,
        totalReviews: 42,
        totalSessions: 128,
      }
      return
    }

    // If still not found, go back
    console.error(`Mentor with ID ${id} not found`)
    router.push('/app/mentors')
  } finally {
    isLoading.value = false
  }
}

const fullName = computed(() => `${mentor.value?.firstName || ''} ${mentor.value?.lastName || ''}`.trim())
const PENDING_BOOKING_STORAGE_KEY = 'pendingMentorBookingPayment'
const PENDING_BOOKING_STORAGE_PREFIX = 'pendingMentorBookingPayment:'
const PENDING_BOOKING_MAX_AGE_MS = 6 * 60 * 60 * 1000
const BOOKING_RETRY_MAX_ATTEMPTS = 8
const BOOKING_RETRY_DELAY_MS = 2500
const DEFAULT_SESSION_SKILL_ID = '01491e2c-849e-4420-8ab8-06271aeea5c7'

type PendingBookingRecord = {
  bookingRef: string
  mentorId: string | null
  booking: any
  createdAt: number
}

const normalizeMeetingPlatform = (value: unknown): 'GOOGLE_MEET' | 'ZOOM' => {
  const raw = String(value || '').trim()
  if (!raw) {
    return 'GOOGLE_MEET'
  }

  const normalized = raw.toUpperCase().replace(/[\s-]+/g, '_')
  if (normalized === 'ZOOM') {
    return 'ZOOM'
  }
  if (normalized === 'GOOGLE_MEET' || normalized === 'GOOGLEMEET') {
    return 'GOOGLE_MEET'
  }

  return 'GOOGLE_MEET'
}

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

const buildSessionData = (booking: any, userId: string) => {
  const programContext = programBookingContext.value

  return {
    mentorId: booking?.mentorId || mentor.value?.id,
    menteeId: userId,
    skillId: booking?.skillId || DEFAULT_SESSION_SKILL_ID,
    scheduledStart: booking.requestedStart,
    meetingPlatform: normalizeMeetingPlatform(booking?.platform),
    menteeMessage: booking.message,
    companyProgramId: normalizeOptionalString(booking?.companyProgramId) || programContext?.companyProgramId || null,
    companyProgramParticipantId: normalizeOptionalString(booking?.companyProgramParticipantId) || programContext?.companyProgramParticipantId || null,
    journeyInstanceStepId: normalizeOptionalString(booking?.journeyInstanceStepId) || programContext?.journeyInstanceStepId || null,
  }
}

const generateBookingRef = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `booking-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const normalizePendingBooking = (value: any): any | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const requestedStart = typeof value.requestedStart === 'string' ? value.requestedStart : ''
  if (!requestedStart) {
    return null
  }

  const programContext = programBookingContext.value

  return {
    requestedStart,
    requestedEnd: typeof value.requestedEnd === 'string' ? value.requestedEnd : '',
    message: typeof value.message === 'string' ? value.message : '',
    topic: typeof value.topic === 'string' ? value.topic : '',
    platform: normalizeMeetingPlatform(value.platform),
    mentorId: typeof value.mentorId === 'string' ? value.mentorId : (mentor.value?.id || ''),
    skillId: typeof value.skillId === 'string' ? value.skillId : DEFAULT_SESSION_SKILL_ID,
    companyProgramId: normalizeOptionalString(value.companyProgramId) || programContext?.companyProgramId || null,
    companyProgramParticipantId: normalizeOptionalString(value.companyProgramParticipantId) || programContext?.companyProgramParticipantId || null,
    journeyInstanceStepId: normalizeOptionalString(value.journeyInstanceStepId) || programContext?.journeyInstanceStepId || null,
    companyProgramName: normalizeOptionalString(value.companyProgramName) || programContext?.companyProgramName || null,
  }
}

const buildPendingBookingRecord = (booking: any, bookingRef?: string): PendingBookingRecord => ({
  bookingRef: bookingRef || generateBookingRef(),
  mentorId: mentor.value?.id || null,
  booking: {
    requestedStart: booking?.requestedStart,
    requestedEnd: booking?.requestedEnd,
    message: booking?.message || '',
    topic: booking?.topic || '',
    platform: normalizeMeetingPlatform(booking?.platform),
    mentorId: mentor.value?.id || '',
    skillId: DEFAULT_SESSION_SKILL_ID,
    companyProgramId: normalizeOptionalString(booking?.companyProgramId) || programBookingContext.value?.companyProgramId || null,
    companyProgramParticipantId: normalizeOptionalString(booking?.companyProgramParticipantId) || programBookingContext.value?.companyProgramParticipantId || null,
    journeyInstanceStepId: normalizeOptionalString(booking?.journeyInstanceStepId) || programBookingContext.value?.journeyInstanceStepId || null,
    companyProgramName: normalizeOptionalString(booking?.companyProgramName) || programBookingContext.value?.companyProgramName || null,
  },
  createdAt: Date.now()
})

const storePendingBooking = (booking: any, bookingRef?: string): string => {
  const record = buildPendingBookingRecord(booking, bookingRef)
  pendingBooking.value = record.booking
  if (typeof window !== 'undefined') {
    localStorage.setItem(PENDING_BOOKING_STORAGE_KEY, JSON.stringify(record))
    localStorage.setItem(`${PENDING_BOOKING_STORAGE_PREFIX}${record.bookingRef}`, JSON.stringify(record))
  }
  return record.bookingRef
}

const readPendingBookingRecord = (bookingRef?: string): PendingBookingRecord | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const candidateKeys = bookingRef
    ? [`${PENDING_BOOKING_STORAGE_PREFIX}${bookingRef}`, PENDING_BOOKING_STORAGE_KEY]
    : [PENDING_BOOKING_STORAGE_KEY]

  for (const key of candidateKeys) {
    const raw = localStorage.getItem(key)
    if (!raw) {
      continue
    }

    try {
      const parsed = JSON.parse(raw) as PendingBookingRecord
      if (!parsed?.booking || !parsed?.createdAt) {
        continue
      }

      if ((Date.now() - Number(parsed.createdAt)) > PENDING_BOOKING_MAX_AGE_MS) {
        continue
      }

      if (bookingRef && parsed?.bookingRef && parsed.bookingRef !== bookingRef) {
        continue
      }

      if (!bookingRef && parsed?.mentorId && mentor.value?.id && parsed.mentorId !== mentor.value.id) {
        continue
      }

      return parsed
    } catch {
      continue
    }
  }

  return null
}

const readStoredPendingBooking = (bookingRef?: string): any | null => {
  const record = readPendingBookingRecord(bookingRef)
  if (!record) {
    return null
  }
  return normalizePendingBooking(record.booking)
}

const clearStoredPendingBooking = (bookingRef?: string) => {
  pendingBooking.value = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PENDING_BOOKING_STORAGE_KEY)
    if (bookingRef) {
      localStorage.removeItem(`${PENDING_BOOKING_STORAGE_PREFIX}${bookingRef}`)
    }
  }
}

const resolveBookingFromPaidInvoice = async (userId: string, bookingRef: string): Promise<any | null> => {
  try {
    const response = await invoicesApi.getUserInvoices(userId)
    if (!response.success || !Array.isArray(response.data)) {
      return null
    }

    const paidInvoice = response.data.find((entry) => {
      if (!entry || entry.status !== 'PAID') {
        return false
      }

      const metadata = entry.metadata as Record<string, any> | null
      if (!metadata || typeof metadata !== 'object') {
        return false
      }

      return String(metadata.bookingRef || '').trim() === bookingRef
    })

    if (!paidInvoice) {
      return null
    }

    const metadata = paidInvoice.metadata as Record<string, any> | null
    return normalizePendingBooking(metadata?.pendingBooking)
  } catch (error) {
    console.warn('Unable to resolve pending booking from paid invoice metadata:', error)
    return null
  }
}

const wait = (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms)
})

const resolveSingleQueryValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }
  return typeof value === 'string' ? value : ''
}

const normalizeOptionalString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed || null
}

const programBookingContext = computed(() => {
  const companyProgramParticipantId = normalizeOptionalString(resolveSingleQueryValue(route.query.companyProgramParticipantId))
  if (!companyProgramParticipantId) {
    return null
  }

  return {
    companyProgramId: normalizeOptionalString(resolveSingleQueryValue(route.query.companyProgramId)),
    companyProgramParticipantId,
    journeyInstanceStepId: normalizeOptionalString(resolveSingleQueryValue(route.query.journeyInstanceStepId)),
    companyProgramName: normalizeOptionalString(resolveSingleQueryValue(route.query.companyProgramName)),
  }
})

const buildInvoiceRedirectQuery = (result: 'invoice_paid' | 'invoice_cancelled', bookingRef?: string) => {
  const params = new URLSearchParams()

  Object.entries(route.query).forEach(([key, value]) => {
    if (['invoice_paid', 'invoice_cancelled', 'booking_ref'].includes(key)) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (typeof entry === 'string' && entry.trim()) {
          params.append(key, entry)
        }
      })
      return
    }

    if (typeof value === 'string' && value.trim()) {
      params.set(key, value)
    }
  })

  params.set(result, '1')
  if (bookingRef) {
    params.set('booking_ref', bookingRef)
  }

  return params
}

const isRetryableBookingError = (error: any) => {
  const message = String(error?.response?.data?.message || error?.message || '').toLowerCase()
  const paymentRequired = Boolean(error?.response?.data?.data?.paymentRequired)
  return paymentRequired ||
    message.includes('payment') ||
    message.includes('subscription') ||
    message.includes('sessions exhausted')
}

const extractBookingErrorMessage = (error: any): string => {
  return error?.response?.data?.message || error?.message || 'Failed to finalize the session booking after payment.'
}

const finalizeBookingWithRetry = async (bookingToRetry: any, userId: string) => {
  let lastError: any = null
  for (let attempt = 1; attempt <= BOOKING_RETRY_MAX_ATTEMPTS; attempt += 1) {
    try {
      retryMessage.value = attempt === 1
        ? 'Payment confirmed. Finalizing your session booking...'
        : `Finalizing session booking... (${attempt}/${BOOKING_RETRY_MAX_ATTEMPTS})`

      const sessionData = buildSessionData(bookingToRetry, userId)
      await sessionStore.createSession(sessionData)
      await refreshBookingSessionBalance(true)
      return
    } catch (error: any) {
      lastError = error
      const shouldRetry = isRetryableBookingError(error) && attempt < BOOKING_RETRY_MAX_ATTEMPTS
      if (!shouldRetry) {
        throw error
      }

      await subscriptionsStore.fetchActiveSubscription(userId)
      await wait(BOOKING_RETRY_DELAY_MS)
    }
  }

  throw lastError
}

const showRetryErrorState = (message: string) => {
  showRetryDialog.value = true
  retryStatus.value = 'error'
  retryMessage.value = message
  isRetrying.value = false
}

const normalizeReturnedBooking = (value: any): any | null => {
  const normalized = normalizePendingBooking(value)
  if (!normalized) {
    return null
  }
  return normalized
}

const resolveBookingAfterPayment = async (userId: string, bookingRef: string): Promise<any | null> => {
  const stored = readStoredPendingBooking(bookingRef)
  if (stored) {
    return stored
  }

  const fromInvoiceMetadata = await resolveBookingFromPaidInvoice(userId, bookingRef)
  if (fromInvoiceMetadata) {
    storePendingBooking(fromInvoiceMetadata, bookingRef)
    return fromInvoiceMetadata
  }

  return null
}

type InvoiceRedirectContext = 'PLAN_PURCHASE' | 'PLAN_UPGRADE' | 'SESSION_ADDON'

const createInvoiceAndRedirect = async (context: InvoiceRedirectContext, plan?: SubscriptionPlan) => {
  if (isRedirectingToPayment.value) {
    return
  }

  const userId = resolveCurrentUserId()
  if (!userId) {
    toast.error('User session expired. Please log in again.')
    return
  }

  isRedirectingToPayment.value = true
  startJourneyLoading(
    'Preparing Payment',
    'Generating your secure payment page. Please wait...'
  )
  try {
    let amount = 0
    let currency = 'KES'
    let description = 'Mentorship payment'
    const metadata: Record<string, any> = {
      source: 'MENTOR_BOOKING'
    }

    if (context === 'SESSION_ADDON') {
      if (!addOnOption.value || !addOnOption.value.available) {
        throw new Error('Addon purchase option is not available')
      }

      const quantity = Math.max(1, selectedAddonQuantity.value || 1)
      const quote = await invoicesApi.quoteAddonInvoice({
        userId,
        quantity,
      })

      if (!quote.success || !quote.data) {
        throw new Error(quote.message || 'Failed to calculate add-on quote')
      }

      const quoteData = quote.data
      amount = Number(quoteData.amount)
      currency = quoteData.currency || addOnOption.value.currency || 'KES'
      description = quoteData.description || `Purchase ${quantity} additional mentor session${quantity > 1 ? 's' : ''}`

      metadata.invoiceContext = quoteData.context
      metadata.quantity = quoteData.quantity || quantity
      metadata.costPerSession = quoteData.costPerSession || addOnOption.value.costPerSession || null
      metadata.subscriptionId = quoteData.subscriptionId || null
    } else {
      if (!plan) {
        throw new Error('Please select a subscription plan')
      }

      const quote = await invoicesApi.quotePlanInvoice({
        userId,
        planId: plan.id,
      })

      if (!quote.success || !quote.data) {
        throw new Error(quote.message || 'Failed to calculate plan quote')
      }

      const quoteData = quote.data
      amount = Number(quoteData.amount)
      currency = quoteData.currency || plan.currency || 'KES'
      description = quoteData.description || `Subscription plan: ${plan.name}`

      metadata.invoiceContext = quoteData.context
      metadata.planId = plan.id
      metadata.planName = quoteData.planName || plan.name
      metadata.subscriptionId = quoteData.subscriptionId || null
      metadata.currentPlanId = quoteData.currentPlanId || null
    }

    if (!(amount > 0)) {
      throw new Error('Calculated invoice amount is invalid')
    }

    const pending = pendingBooking.value ? normalizePendingBooking(pendingBooking.value) : null
    const bookingRef = pending ? storePendingBooking(pending) : ''
    if (pending) {
      metadata.bookingRef = bookingRef
      metadata.pendingBooking = {
        requestedStart: pending.requestedStart,
        requestedEnd: pending.requestedEnd,
        message: pending.message || '',
        topic: pending.topic || '',
        platform: normalizeMeetingPlatform(pending.platform),
        mentorId: mentor.value?.id || '',
        skillId: DEFAULT_SESSION_SKILL_ID,
        companyProgramId: pending.companyProgramId || null,
        companyProgramParticipantId: pending.companyProgramParticipantId || null,
        journeyInstanceStepId: pending.journeyInstanceStepId || null,
        companyProgramName: pending.companyProgramName || null,
      }
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const successQuery = buildInvoiceRedirectQuery('invoice_paid', bookingRef || undefined)
    const cancelQuery = buildInvoiceRedirectQuery('invoice_cancelled', bookingRef || undefined)

    const successUrl = `${origin}${route.path}?${successQuery.toString()}`
    const cancelUrl = `${origin}${route.path}?${cancelQuery.toString()}`

    const invoiceResponse = await invoicesApi.createInvoice({
      payerUserId: userId,
      amount,
      currency,
      description,
      metadata,
      redirectSuccessUrl: successUrl,
      redirectCancelUrl: cancelUrl
    })

    if (!invoiceResponse.success || !invoiceResponse.data?.paymentUrl) {
      throw new Error(invoiceResponse.message || 'Failed to create invoice')
    }

    window.location.href = invoiceResponse.data.paymentUrl
  } catch (error: any) {
    console.error('Invoice creation failed:', error)
    toast.error(error?.response?.data?.message || error?.message || 'Failed to redirect to payment page')
    isRedirectingToPayment.value = false
    stopJourneyLoading()
  }
}

const retryPendingBookingAfterPayment = async (bookingToRetry: any) => {
  const userId = resolveCurrentUserId()
  const normalizedBooking = normalizeReturnedBooking(bookingToRetry)
  if (!normalizedBooking || !userId) {
    return
  }

  showRetryDialog.value = true
  isRetrying.value = true
  retryStatus.value = 'processing'
  retryMessage.value = 'Payment confirmed. Finalizing your session booking...'
  await nextTick()
  stopJourneyLoading()

  try {
    await finalizeBookingWithRetry(normalizedBooking, userId)

    retryStatus.value = 'success'
    retryMessage.value = 'Your session has been booked successfully! You will receive a confirmation email shortly.'
    const bookingRef = resolveSingleQueryValue(route.query.booking_ref).trim()
    clearStoredPendingBooking(bookingRef || undefined)
  } catch (error: any) {
    console.error('Retry booking error:', error)
    retryStatus.value = 'error'
    retryMessage.value = extractBookingErrorMessage(error)
  } finally {
    isRetrying.value = false
  }
}

const handleInvoiceReturn = async () => {
  const isPaid = route.query.invoice_paid === '1'
  const isCancelled = route.query.invoice_cancelled === '1'
  const bookingRef = resolveSingleQueryValue(route.query.booking_ref).trim()

  if (isPaid) {
    startJourneyLoading(
      'Finalizing Booking',
      'Payment received. Restoring your session request...'
    )
    toast.success('Payment completed successfully!')
    const userId = resolveCurrentUserId()
    const bookingToRetry = bookingRef && userId
      ? await resolveBookingAfterPayment(userId, bookingRef)
      : readStoredPendingBooking()

    if (bookingToRetry) {
      await retryPendingBookingAfterPayment(bookingToRetry)
    } else {
      stopJourneyLoading()
      showRetryErrorState('Payment completed, but we could not find your pending session details. Please book the session again.')
    }
  } else if (isCancelled) {
    stopJourneyLoading()
    toast.info('Payment was cancelled.')
  } else {
    stopJourneyLoading()
    return
  }

  const query = { ...route.query }
  delete query.invoice_paid
  delete query.invoice_cancelled
  delete query.booking_ref
  await router.replace({ query })
}

onMounted(async () => {
  const isInvoiceReturn = route.query.invoice_paid === '1' || route.query.invoice_cancelled === '1'
  if (isInvoiceReturn) {
    startJourneyLoading(
      'Processing Payment Result',
      'Please wait while we restore your booking status...'
    )
  }

  await loadMentor()
  await loadAvailability()
  void refreshBookingSessionBalance()
  await handleInvoiceReturn()
})

const handleBookingSubmit = async (booking: any, options: { loadingAlreadyStarted?: boolean } = {}) => {
  const userId = resolveCurrentUserId()
  if (!userId) {
    toast.error('User session expired. Please log in again.')
    stopJourneyLoading()
    return
  }

  const sessionData = buildSessionData(booking, userId)

  isBookingSession.value = true
  if (!options.loadingAlreadyStarted) {
    startJourneyLoading(
      'Submitting Booking',
      'Checking eligibility and creating your session request...'
    )
  }

  try {
    await sessionStore.createSession(sessionData)
    await refreshBookingSessionBalance(true)
    stopJourneyLoading()
    toast.success('Session request submitted successfully!')
  } catch (error: any) {
    console.error('Booking error:', error)

    // Check if error response indicates payment is required
    const errorResponse = error.response?.data

    if (errorResponse?.status === 'error' && errorResponse?.data?.paymentRequired) {
      // Store the pending booking to retry after payment
      storePendingBooking(booking)

      // Extract recommended plans from API response
      const apiRecommendedPlans = errorResponse?.data?.recommendedPlans || []

      if (apiRecommendedPlans.length > 0) {
        stopJourneyLoading()
        // Store recommended plans
        recommendedPlans.value = apiRecommendedPlans

        // If only one plan is recommended, auto-select it and proceed directly to payment
        if (apiRecommendedPlans.length === 1) {
          selectedPlanForPayment.value = apiRecommendedPlans[0]
          selectedRecommendedPlan.value = apiRecommendedPlans[0].id
          await createInvoiceAndRedirect('PLAN_PURCHASE', apiRecommendedPlans[0])
        } else {
          // Multiple plans available - show error dialog with plan selection
          selectedRecommendedPlan.value = apiRecommendedPlans[0].id // Pre-select first plan
          selectedPlanForPayment.value = apiRecommendedPlans[0]

          errorDialogTitle.value = 'Subscription Required'
          errorDialogMessage.value = errorResponse.message || 'Please select a subscription plan to continue.'
          showErrorDialog.value = true
        }
      } else {
        // Check if addon option is available
        const apiAddOnOption = errorResponse?.data?.addOnOption

        if (apiAddOnOption && apiAddOnOption.available) {
          stopJourneyLoading()
          // Store addon option
          addOnOption.value = apiAddOnOption
          selectedAddonQuantity.value = apiAddOnOption.recommendedQuantity || 1

          // Show error dialog with addon purchase option
          errorDialogTitle.value = 'Sessions Exhausted'
          errorDialogMessage.value = errorResponse.message || 'You have used all your sessions. Purchase additional sessions to continue.'
          showErrorDialog.value = true
        } else {
          // Fallback: No recommended plans or addons, fetch all available plans
          try {
            stopJourneyLoading()
            await subscriptionsStore.fetchPlans()

            const fallbackPlan = subscriptionsStore.activePlans[0]
            if (fallbackPlan) {
              selectedPlanForPayment.value = fallbackPlan
              errorDialogTitle.value = 'Subscription Limit Reached'
              errorDialogMessage.value = errorResponse.message || 'Subscription limit reached. Please upgrade your plan or make a payment.'
              showErrorDialog.value = true
            } else {
              toast.error('No subscription plans available. Please contact support.')
            }
          } catch (planError) {
            console.error('Error fetching plans:', planError)
            toast.error('Failed to load subscription plans. Please try again.')
          }
        }
      }
    } else {
      stopJourneyLoading()
      // Generic error handling
      toast.error(errorResponse?.message || 'Failed to submit session request. Please try again.')
    }
  } finally {
    isBookingSession.value = false
    if (!showRetryDialog.value && !isRedirectingToPayment.value) {
      stopJourneyLoading()
    }
  }
}

const handleUpgradeClick = () => {
  if (!selectedPlanForPayment.value) {
    toast.error('Please select a subscription plan.')
    return
  }

  showErrorDialog.value = false
  createInvoiceAndRedirect('PLAN_PURCHASE', selectedPlanForPayment.value)
}

const handleAddonPurchase = () => {
  // Validate that addon data is available
  if (!addOnOption.value || !addOnOption.value.available) {
    toast.error('Addon purchase information is not available')
    return
  }

  // Clear any plan selection to avoid conflicts with addon purchase
  selectedPlanForPayment.value = null
  selectedRecommendedPlan.value = null

  // Close error dialog and redirect to unified payment page
  showErrorDialog.value = false
  createInvoiceAndRedirect('SESSION_ADDON')
}

const closeRetryDialog = () => {
  showRetryDialog.value = false

  // Reset retry state after a delay
  setTimeout(() => {
    retryStatus.value = 'processing'
    retryMessage.value = ''
  }, 300)
}
</script>

<template>
  <div class="mentor-page">

    <!-- Loading -->
    <div v-if="isLoading" class="flex min-h-[60vh] items-center justify-center gap-3 text-muted-foreground">
      <Loader2 class="h-6 w-6 animate-spin" />
      <span class="text-sm font-medium">Loading mentor profile...</span>
    </div>

    <template v-else-if="mentor">

      <!-- ── Banner ── -->
      <div class="profile-banner">
        <div class="banner-waves" />
      </div>

      <div
        v-if="programBookingContext"
        class="mx-auto mt-4 w-full max-w-6xl rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900"
      >
        Booking in
        <span class="font-semibold">{{ programBookingContext.companyProgramName || 'your company program' }}</span>.
        This session will be linked to your employer mentorship journey.
      </div>

      <!-- ── Profile Header ── -->
      <div class="profile-header">
        <!-- Avatar (overlaps banner) -->
        <div class="avatar-section">
          <div class="avatar-wrap">
            <img
              v-if="mentor.profilePhoto"
              :src="mentor.profilePhoto"
              :alt="fullName"
              class="avatar-photo"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <div class="avatar-fallback">{{ (fullName || '?').charAt(0).toUpperCase() }}</div>
          </div>
        </div>

        <!-- Name + title + actions -->
        <div class="profile-meta">
          <div class="profile-name-block">
            <h1 class="profile-name">{{ fullName }}</h1>
            <p class="profile-subtitle">{{ [mentor.title, mentor.company].filter(Boolean).join(' at ') }}</p>
          </div>
          <div class="profile-actions">
            <Button size="sm" class="book-btn" @click="openSimpleBookingForm">
              {{ programBookingContext ? 'Book Program Session' : 'Book Session' }}
            </Button>
            <Button variant="outline" size="sm" class="outline-btn">Follow</Button>
            <Button variant="outline" size="sm" class="outline-btn">Connect</Button>
            <Button variant="outline" size="sm" class="outline-btn">Share</Button>
          </div>
        </div>

        <!-- Social icons -->
        <div class="social-icons">
          <a v-if="mentor.linkedInUrl" :href="mentor.linkedInUrl" target="_blank" class="social-btn">
            <Linkedin class="h-4 w-4" />
          </a>
        </div>
      </div>

      <!-- ── Tabs ── -->
      <div class="tabs-wrap">
        <Tabs v-model="activeTab">
          <TabsList class="profile-tabs">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <!-- Overview -->
          <TabsContent value="overview" class="pt-6">
            <!-- Two-column: bio/artifacts LEFT, insights RIGHT -->
            <div class="overview-grid">

              <!-- Left -->
              <div class="space-y-6">

                <!-- Bio -->
                <section>
                  <p class="bio-text">{{ mentor.profileSummary || 'No bio available.' }}</p>
                  <button class="show-more-btn">Show more</button>
                </section>

                <!-- Personal Artifacts -->
                <section>
                  <h2 class="section-heading">Personal Artifacts</h2>
                  <div class="info-card">
                    <div class="info-row">
                      <span class="info-label">My Favorite Quote:</span>
                      <span class="info-value">{{ mentor.favouriteQuote || 'Not provided' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">My Story:</span>
                      <span class="info-value">{{ mentor.profileSummary || 'Not provided' }}</span>
                    </div>
                  </div>
                </section>

                <!-- Background -->
                <section>
                  <h2 class="section-heading">Background</h2>
                  <div class="info-card">
                    <div class="info-row items-start">
                      <span class="info-label shrink-0">Expertise</span>
                      <div class="flex flex-wrap gap-2">
                        <span
                          v-for="area in (mentor.expertiseAreas || []).slice(0, 8)"
                          :key="area"
                          class="expertise-tag"
                        >{{ area }}</span>
                        <span v-if="!(mentor.expertiseAreas?.length)" class="text-sm text-muted-foreground">—</span>
                      </div>
                    </div>
                  </div>
                </section>

              </div>

              <!-- Right: Profile Insights + Available Sessions -->
              <div class="space-y-4">

                <!-- Profile Insights -->
                <div class="insights-card">
                  <h3 class="card-heading">Profile Insights</h3>
                  <div class="insights-grid">
                    <div class="stat-box">
                      <span class="stat-lbl">Sessions Completed</span>
                      <span class="stat-val">{{ mentor.totalSessions || 0 }}</span>
                    </div>
                    <div class="stat-box">
                      <span class="stat-lbl">Reviews</span>
                      <span class="stat-val">
                        {{ mentor.averageRating ? mentor.averageRating.toFixed(1) + '/5' : '—' }}
                        <span class="stat-sub" v-if="mentor.totalReviews"> {{ mentor.totalReviews }} Posts</span>
                      </span>
                    </div>
                    <div class="stat-box">
                      <span class="stat-lbl">Posts created</span>
                      <span class="stat-val">0</span>
                    </div>
                    <div class="stat-box">
                      <span class="stat-lbl">Followers</span>
                      <span class="stat-val">0</span>
                    </div>
                    <div class="stat-box">
                      <span class="stat-lbl">Connections</span>
                      <span class="stat-val">0</span>
                    </div>
                  </div>
                </div>

                <!-- Available Sessions (compact date-only) -->
                <div class="avail-card">
                  <h3 class="card-heading">Available Sessions</h3>
                  <p class="avail-subtitle">Book 1:1 sessions from the options based on your needs</p>

                  <!-- Date chips (no time) — driven by mentor's real schedule -->
                  <div class="date-chips-row">
                    <template v-if="availableDates.length">
                      <button
                        v-for="d in availableDates"
                        :key="d.dateNum + '-' + d.month"
                        class="date-chip"
                        :class="{ 'date-chip-active': (selectedDate ?? availableDates[0]?.full)?.toDateString() === d.full.toDateString() }"
                        @click="selectedDate = d.full"
                      >
                        <span class="chip-day">{{ d.day }}</span>
                        <span class="chip-date">{{ d.dateNum }} {{ d.month }}</span>
                      </button>
                    </template>
                    <span v-else class="text-xs text-muted-foreground">No upcoming slots</span>
                  </div>

                  <!-- Book button -->
                  <button v-if="selectedDateLabel" class="book-session-btn" @click="openSimpleBookingForm">
                    Book Session for {{ selectedDateLabel }}
                  </button>
                </div>

              </div>
            </div>
          </TabsContent>

          <!-- Reviews -->
          <TabsContent value="reviews" class="pt-6">
            <MentorReviews :mentor-id="mentor.id" />
          </TabsContent>

          <!-- Achievements -->
          <TabsContent value="achievements" class="pt-6">
            <div class="text-center py-16 text-sm text-muted-foreground">No achievements yet.</div>
          </TabsContent>
        </Tabs>
      </div>

    </template>

    <div v-else class="text-center text-muted-foreground py-24 text-sm">Mentor not found.</div>

    <!-- Simple Booking Form Dialog (triggered by date-chip button) -->
    <Dialog v-model:open="showSimpleBookingForm">
      <DialogContent class="mentor-booking-dialog sm:max-w-[1160px] p-0 overflow-hidden">
        <div class="mentor-booking-layout">
          <section class="mentor-booking-left">
            <div class="mentor-booking-left-body">
              <p class="mentor-booking-eyebrow">MENTORSHIP SESSION</p>
              <h2 class="mentor-booking-title">Review your session booking</h2>

              <div class="mentor-booking-card">
                <div class="mentor-booking-card-header">
                  <img
                    v-if="mentor?.profilePhoto"
                    :src="mentor.profilePhoto"
                    :alt="fullName"
                    class="mentor-booking-avatar"
                  >
                  <div v-else class="mentor-booking-avatar mentor-booking-avatar-fallback">
                    {{ (fullName || 'M').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="mentor-booking-name">{{ fullName }}</p>
                    <p class="mentor-booking-role">{{ [mentor?.title, mentor?.company].filter(Boolean).join(' at ') || 'Mentor' }}</p>
                  </div>
                </div>

                <div class="mentor-booking-duration-row">
                  <div class="mentor-booking-duration-icon">
                    <Clock3 class="h-5 w-5 text-white" />
                  </div>
                  <p class="mentor-booking-duration-label"><span class="font-semibold">60</span> min Session</p>
                </div>
              </div>
            </div>

            <div class="mentor-booking-quote">
              "{{ mentor?.favouriteQuote || 'Your growth as a leader is a journey we take together. I look forward to exploring your goals.' }}"
            </div>
          </section>

          <section class="mentor-booking-right">
            <div class="mentor-booking-right-inner">
              <div>
                <h3 class="mentor-booking-form-title">Book a Session</h3>
                <p class="mentor-booking-form-subtitle">Fill in the details to schedule your meeting.</p>
              </div>

              <div class="mentor-booking-balance-panel">
                <div class="mentor-booking-balance-head">
                  <p class="mentor-booking-balance-title">Session Allocation</p>
                  <button
                    type="button"
                    class="mentor-booking-balance-refresh"
                    :disabled="bookingSessionBalanceLoading"
                    @click="refreshBookingSessionBalance(true)"
                  >
                    {{ bookingSessionBalanceLoading ? 'Refreshing…' : 'Refresh' }}
                  </button>
                </div>
                <div class="mentor-booking-balance-grid">
                  <div class="mentor-booking-balance-item">
                    <p class="mentor-booking-balance-label">Assigned</p>
                    <p class="mentor-booking-balance-value">{{ bookingDisplayAssigned }}</p>
                  </div>
                  <div class="mentor-booking-balance-item">
                    <p class="mentor-booking-balance-label">Sessions Left</p>
                    <p class="mentor-booking-balance-value" :class="{ 'is-empty': bookingDisplayLeft <= 0 }">
                      {{ bookingDisplayLeft }}
                    </p>
                  </div>
                </div>
                <p class="mentor-booking-balance-meta">
                  {{ bookingSessionBalanceDescription }}
                </p>
              </div>

              <div class="mentor-booking-field-group">
                <Label class="mentor-booking-field-label">Select Date</Label>
                <div class="mentor-booking-date-picker">
                  <DatePicker
                    v-model="selectedBookingDate"
                    placeholder="Select date"
                    :calendar-disabled="isPastCalendarDate"
                    class="mentor-booking-date-input"
                  />
                </div>
              </div>

              <div class="mentor-booking-field-group">
                <Label class="mentor-booking-field-label">Session Topic</Label>
                <Select v-model="simpleBookingForm.topic">
                  <SelectTrigger class="mentor-booking-field-select" :disabled="!mentorTopicOptions.length">
                    <SelectValue :placeholder="mentorTopicOptions.length ? 'Select session topic...' : 'No mentor topics available'" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="topic in mentorTopicOptions" :key="topic" :value="topic">
                      {{ topic }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="mentor-booking-field-group">
                <Label class="mentor-booking-field-label">Description &amp; Goals</Label>
                <Textarea
                  v-model="simpleBookingForm.message"
                  placeholder="Briefly describe what you'd like to achieve in this session"
                  class="mentor-booking-field-textarea"
                />
              </div>

              <div class="mentor-booking-actions">
                <Button class="mentor-booking-submit" :disabled="isBookingSession || !bookingSlot" @click="submitSimpleBooking">
                  {{ isBookingSession ? 'Processing...' : 'Proceed To Pay' }}
                </Button>
                <Button variant="ghost" class="mentor-booking-cancel" :disabled="isBookingSession" @click="showSimpleBookingForm = false">
                  Cancel
                </Button>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Booking Journey Loading Dialog -->
    <Dialog v-model:open="showJourneyLoadingDialog" :close-disabled="true">
      <DialogContent class="sm:max-w-md" :close-disabled="true">
        <DialogHeader>
          <div class="flex items-center gap-3 mb-2">
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
              <Loader2 class="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <DialogTitle class="text-xl">
              {{ journeyLoadingTitle }}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div class="py-4 space-y-3">
          <p class="text-base text-muted-foreground">
            {{ journeyLoadingMessage }}
          </p>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 class="w-4 h-4 animate-spin" />
            <span>Please wait...</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Error Dialog -->
    <Dialog v-model:open="showErrorDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <div class="flex items-center gap-3 mb-2">
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
              <AlertCircle class="w-6 h-6 text-amber-600" />
            </div>
            <DialogTitle class="text-xl">{{ errorDialogTitle }}</DialogTitle>
          </div>
          <DialogDescription class="text-base pt-2">
            {{ errorDialogMessage }}
          </DialogDescription>
        </DialogHeader>

        <!-- Plan Selection (when multiple plans available) -->
        <div v-if="recommendedPlans.length > 1" class="space-y-3">
          <div class="space-y-2">
            <p class="text-sm font-medium">Choose a subscription plan:</p>
            <div class="space-y-2">
              <div
                v-for="plan in recommendedPlans"
                :key="plan.id"
                @click="selectedRecommendedPlan = plan.id; selectedPlanForPayment = plan"
                :class="{
                  'border-primary bg-primary/5': selectedRecommendedPlan === plan.id,
                  'border-border hover:border-primary/50': selectedRecommendedPlan !== plan.id
                }"
                class="border rounded-lg p-4 cursor-pointer transition-all"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <h4 class="font-semibold">{{ plan.name }}</h4>
                      <Badge variant="secondary" class="text-xs">{{ plan.code }}</Badge>
                    </div>
                    <p class="text-sm text-muted-foreground mt-1">{{ plan.description }}</p>
                    <div class="flex items-center gap-4 mt-2">
                      <span class="text-lg font-bold text-primary">{{ plan.formattedPrice }}</span>
                      <span class="text-sm text-muted-foreground">{{ plan.sessionsDescription }}</span>
                    </div>
                  </div>
                  <div
                    :class="selectedRecommendedPlan === plan.id ? 'bg-primary border-primary' : 'border-2'"
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  >
                    <div v-if="selectedRecommendedPlan === plan.id" class="w-2.5 h-2.5 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Addon Purchase Option (when addon available) -->
        <div v-else-if="addOnOption && addOnOption.available" class="space-y-4">
          <div class="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
            <div class="flex items-start gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <CreditCard class="w-5 h-5 text-primary" />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-base mb-1">Purchase Additional Sessions</h4>
                <p class="text-sm text-muted-foreground">{{ addOnOption.message }}</p>
              </div>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div class="space-y-2">
            <Label class="text-sm font-medium">Number of sessions</Label>
            <div class="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                @click="selectedAddonQuantity = Math.max(1, selectedAddonQuantity - 1)"
                :disabled="selectedAddonQuantity <= 1"
              >
                -
              </Button>
              <div class="flex-1 text-center">
                <div class="text-2xl font-bold">{{ selectedAddonQuantity }}</div>
                <div class="text-xs text-muted-foreground">sessions</div>
              </div>
              <Button
                variant="outline"
                size="icon"
                @click="selectedAddonQuantity = Math.min(20, selectedAddonQuantity + 1)"
                :disabled="selectedAddonQuantity >= 20"
              >
                +
              </Button>
            </div>
          </div>

          <!-- Price Summary -->
          <div class="bg-muted/50 rounded-lg p-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Price per session:</span>
              <span class="font-medium">{{ addOnOption.formattedPrice }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Quantity:</span>
              <span class="font-medium">{{ selectedAddonQuantity }} session{{ selectedAddonQuantity > 1 ? 's' : '' }}</span>
            </div>
            <Separator class="my-2" />
            <div class="flex justify-between">
              <span class="font-semibold">Total:</span>
              <span class="text-xl font-bold text-primary">
                {{ addOnOption.currency }} {{ (addOnOption.costPerSession * selectedAddonQuantity).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Info box (when no plan selection, no addon) -->
        <div v-else class="bg-muted/50 rounded-lg p-4 space-y-2">
          <p class="text-sm font-medium">What you can do:</p>
          <ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Upgrade your subscription plan</li>
            <li>Make a payment to continue</li>
            <li>Contact support for assistance</li>
          </ul>
        </div>

        <DialogFooter class="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            @click="showErrorDialog = false"
            class="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            v-if="addOnOption && addOnOption.available"
            @click="handleAddonPurchase"
            :disabled="isRedirectingToPayment"
            class="w-full sm:w-auto"
          >
            {{ isRedirectingToPayment ? 'Redirecting...' : `Purchase ${selectedAddonQuantity} Session${selectedAddonQuantity > 1 ? 's' : ''}` }}
          </Button>
          <Button
            v-else
            @click="handleUpgradeClick"
            :disabled="isRedirectingToPayment"
            class="w-full sm:w-auto"
          >
            {{ isRedirectingToPayment ? 'Redirecting...' : (recommendedPlans.length > 1 ? 'Continue with Selected Plan' : 'Upgrade Plan') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Retry Booking Dialog -->
    <Dialog v-model:open="showRetryDialog" :close-disabled="isRetrying">
      <DialogContent class="sm:max-w-md" :close-disabled="isRetrying">
        <DialogHeader>
          <div class="flex items-center gap-3 mb-2">
            <!-- Processing State -->
            <div v-if="retryStatus === 'processing'" class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
              <Loader2 class="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <!-- Success State -->
            <div v-else-if="retryStatus === 'success'" class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
              <CheckCircle2 class="w-6 h-6 text-green-600" />
            </div>
            <!-- Error State -->
            <div v-else-if="retryStatus === 'error'" class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <XCircle class="w-6 h-6 text-red-600" />
            </div>

            <DialogTitle class="text-xl">
              {{ retryStatus === 'processing' ? 'Booking Session' : retryStatus === 'success' ? 'Booking Confirmed' : 'Booking Failed' }}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div class="py-4">
          <p class="text-base text-muted-foreground">
            {{ retryMessage }}
          </p>

          <!-- Processing indicator -->
          <div v-if="isRetrying" class="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 class="w-4 h-4 animate-spin" />
            <span>Please wait...</span>
          </div>

          <!-- Success details -->
          <div v-if="retryStatus === 'success'" class="mt-4 bg-green-50 rounded-lg p-4 space-y-2">
            <p class="text-sm font-medium text-green-900">Next Steps:</p>
            <ul class="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li>Check your email for session details</li>
              <li>Add the session to your calendar</li>
              <li>Prepare any questions for your mentor</li>
            </ul>
          </div>

          <!-- Error details -->
          <div v-if="retryStatus === 'error'" class="mt-4 bg-red-50 rounded-lg p-4 space-y-2">
            <p class="text-sm font-medium text-red-900">What you can do:</p>
            <ul class="text-sm text-red-800 space-y-1 list-disc list-inside">
              <li>Try booking again in a few moments</li>
              <li>Contact support if the problem persists</li>
              <li>Check your subscription status</li>
            </ul>
          </div>
        </div>

        <DialogFooter v-if="!isRetrying">
          <Button
            @click="closeRetryDialog"
            class="w-full"
            :variant="retryStatus === 'error' ? 'outline' : 'default'"
          >
            {{ retryStatus === 'success' ? 'Done' : 'Close' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
/* ── Page wrapper ── */
.mentor-page {
  min-height: 100vh;
  background: #f9fafb;
}

/* ── Banner ── */
.profile-banner {
  height: 180px;
  background: linear-gradient(135deg, #0f3d34 0%, #1a5c4e 50%, #237a66 100%);
  position: relative;
  overflow: hidden;
}

.banner-waves {
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 20px,
      rgba(255,255,255,0.04) 20px,
      rgba(255,255,255,0.04) 21px
    );
}

/* ── Profile Header ── */
.profile-header {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  padding: 0 32px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

/* Avatar */
.avatar-section {
  position: relative;
  flex-shrink: 0;
  margin-top: -56px;
}

.avatar-wrap {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  border: 4px solid white;
  overflow: hidden;
  background: linear-gradient(135deg, #e9d5ff 0%, #c084fc 100%);
  position: relative;
}

.avatar-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.avatar-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #a03b93;
  color: white;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

/* Name + actions */
.profile-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 4px;
}

.profile-name {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  color: #111827;
}

.profile-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}

.profile-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.book-btn {
  background-color: #1a5c4e;
  color: white;
  border-radius: 20px;
  font-size: 13px;
}

.book-btn:hover {
  background-color: #0f3d34;
}

.outline-btn {
  border-radius: 20px;
  font-size: 13px;
}

/* Social icons */
.social-icons {
  display: flex;
  gap: 8px;
  padding-bottom: 4px;
  flex-shrink: 0;
}

.social-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
}

.social-btn:hover {
  background: #f3f4f6;
}

/* ── Tabs ── */
.tabs-wrap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 40px;
}

:deep(.profile-tabs) {
  background: transparent;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 0;
  height: auto;
  padding: 0;
  gap: 0;
  width: 100%;
  justify-content: flex-start;
}

:deep(.profile-tabs [data-state]) {
  border-radius: 0;
  background: transparent;
  border-bottom: 2px solid transparent;
  color: #6b7280;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
}

:deep(.profile-tabs [data-state="active"]) {
  border-bottom-color: #a03b93;
  color: #a03b93;
  box-shadow: none;
}

/* ── Overview layout ── */
.overview-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  margin-bottom: 32px;
}

/* Bio */
.bio-text {
  font-size: 13px;
  line-height: 1.7;
  color: #374151;
}

.show-more-btn {
  font-size: 12px;
  color: #a03b93;
  margin-top: 6px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

/* Section headings */
.section-heading {
  font-size: 14px;
  font-weight: 600;
  color: #a03b93;
  margin-bottom: 12px;
}

/* Info card */
.info-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.info-row {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #374151;
  min-width: 140px;
  flex-shrink: 0;
}

.info-value {
  color: #6b7280;
  line-height: 1.5;
}

/* Expertise tags */
.expertise-tag {
  display: inline-block;
  background: #f3f4f6;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

/* ── Profile Insights card ── */
.insights-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
}

.card-heading {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 14px;
}

.insights-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

/* Teal stat boxes matching screenshot */
.stat-box {
  background: #1a5c4e;
  border-radius: 10px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-lbl {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.3;
}

.stat-val {
  font-size: 22px;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.stat-sub {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

/* ── Compact Available Sessions ── */
.avail-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
}

.avail-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 14px;
}

.date-chips-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
}

.date-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 60px;
}

.date-chip:hover {
  border-color: #1a5c4e;
}

.date-chip-active {
  border-color: #1a5c4e;
  background: #f0faf7;
}

.chip-day {
  font-size: 10px;
  color: #6b7280;
  font-weight: 500;
}

.chip-date {
  font-size: 12px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
}

.book-session-btn {
  width: 100%;
  background: #1a5c4e;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.book-session-btn:hover {
  background: #0f3d34;
}

/* ── Mentor Booking Dialog ── */
.mentor-booking-layout {
  display: grid;
  grid-template-columns: minmax(280px, 40%) minmax(0, 60%);
  min-height: 560px;
  font-family: 'Montserrat', 'Inter', ui-sans-serif, system-ui, sans-serif;
}

.mentor-booking-left {
  background: #fbfcfc;
  border-right: 1px solid #e7eaee;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mentor-booking-left-body {
  padding: 1.75rem 1.75rem 1.25rem;
}

.mentor-booking-eyebrow {
  font-size: 11px;
  font-weight: 600;
  color: #0f6b45;
  letter-spacing: 0.16em;
  margin-bottom: 0.55rem;
}

.mentor-booking-title {
  font-size: 2rem;
  line-height: 1.12;
  font-weight: 600;
  color: #1f2430;
  max-width: 11ch;
  letter-spacing: -0.01em;
  margin: 0 0 1.25rem;
}

.mentor-booking-card {
  border: 1px solid #ebedf1;
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  max-width: 430px;
}

.mentor-booking-card-header {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.mentor-booking-avatar {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 0.75rem;
  object-fit: cover;
}

.mentor-booking-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0b8a6e;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
}

.mentor-booking-name {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.15;
  color: #222a36;
}

.mentor-booking-role {
  font-size: 0.875rem;
  color: #687386;
  margin-top: 0.2rem;
}

.mentor-booking-duration-row {
  margin-top: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.mentor-booking-duration-icon {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  background: #0a8167;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mentor-booking-duration-label {
  font-size: 0.95rem;
  color: #2d3646;
}

.mentor-booking-quote {
  border-top: 1px solid #e7eaee;
  padding: 1.25rem 1.75rem 1.45rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #677286;
}

.mentor-booking-right {
  background: white;
}

.mentor-booking-right-inner {
  padding: 1.75rem;
  max-width: 640px;
}

.mentor-booking-form-title {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: #1f2430;
}

.mentor-booking-form-subtitle {
  margin-top: 0.3rem;
  font-size: 0.875rem;
  color: #687386;
}

.mentor-booking-balance-panel {
  margin-top: 1rem;
  border: 1px solid #d8dfeb;
  border-radius: 0.75rem;
  background: #f8fbff;
  padding: 0.75rem 0.85rem;
}

.mentor-booking-balance-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.mentor-booking-balance-title {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #2e3a4d;
  text-transform: uppercase;
}

.mentor-booking-balance-refresh {
  border: none;
  background: transparent;
  color: #0a8167;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.mentor-booking-balance-refresh:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.mentor-booking-balance-grid {
  margin-top: 0.55rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.mentor-booking-balance-item {
  border-radius: 0.6rem;
  background: white;
  border: 1px solid #e0e5ef;
  padding: 0.5rem 0.6rem;
}

.mentor-booking-balance-label {
  font-size: 0.72rem;
  color: #728097;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}

.mentor-booking-balance-value {
  margin-top: 0.2rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2430;
  line-height: 1;
}

.mentor-booking-balance-value.is-empty {
  color: #b64040;
}

.mentor-booking-balance-meta {
  margin-top: 0.5rem;
  font-size: 0.78rem;
  color: #5c687a;
  line-height: 1.35;
}

.mentor-booking-field-group {
  margin-top: 1.05rem;
}

.mentor-booking-field-label {
  display: inline-block;
  margin-bottom: 0.45rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #2d3646;
}

.mentor-booking-field-static {
  min-height: 2.8rem;
  border: 1px solid #d7dce2;
  border-radius: 0.7rem;
  padding: 0.6rem 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.95rem;
  color: #1f2430;
}

.mentor-booking-date-picker :deep(.mentor-booking-date-input) {
  width: 100%;
  min-height: 2.8rem;
  border-color: #d7dce2;
  border-radius: 0.7rem;
  font-size: 0.95rem;
  color: #1f2430;
  padding-left: 0.75rem;
  font-family: inherit;
}

.mentor-booking-field-select {
  min-height: 2.8rem;
  border-color: #d7dce2;
  border-radius: 0.7rem;
  font-size: 0.95rem;
  color: #1f2430;
  padding-left: 0.75rem;
  font-family: inherit;
}

.mentor-booking-field-textarea {
  min-height: 8rem;
  border-color: #d7dce2;
  border-radius: 0.7rem;
  font-size: 0.95rem;
  line-height: 1.45;
  padding: 0.75rem 0.85rem;
  font-family: inherit;
  resize: none;
}

.mentor-booking-actions {
  margin-top: 1.35rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mentor-booking-submit {
  min-width: 11.5rem;
  height: 2.75rem;
  border-radius: 999px;
  background: #0a8167;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
}

.mentor-booking-submit:hover {
  background: #086f58;
}

.mentor-booking-cancel {
  color: #222a35;
  font-size: 0.95rem;
  font-weight: 500;
}

@media (max-width: 1100px) {
  .mentor-booking-layout {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .mentor-booking-left {
    border-right: 0;
    border-bottom: 1px solid #e7eaee;
  }

  .mentor-booking-title {
    max-width: 100%;
    margin-bottom: 1.4rem;
  }

  .mentor-booking-name {
    font-size: 1.25rem;
  }

  .mentor-booking-quote {
    padding-top: 1.2rem;
  }

  .mentor-booking-balance-grid {
    grid-template-columns: 1fr;
  }
}
</style>
