<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { useSessionsStore } from '@/store/modules/sessions/sessions'
import { useAppToast } from '@/composables/services/toastService'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

// Icons
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  ExternalLink,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Star,
  MapPin,
  FileText,
  Users,
  Zap,
  CalendarClock,
  LifeBuoy
} from 'lucide-vue-next'

definePageMeta({
  title: 'My Sessions',
  description: 'Manage your mentoring sessions',
  layout: 'default'
})

// Stores
const authStore = useAuthStore()
const sessionsStore = useSessionsStore()
const router = useRouter()
const toast = useAppToast()

// State
const selectedTab = ref<'all' | 'today' | 'upcoming' | 'past'>('upcoming')
const selectedSession = ref(null)
const showSessionDetails = ref(false)
const completingSessionId = ref<string | null>(null)
const respondingProposalId = ref<string | null>(null)
const supportRequestingSessionId = ref<string | null>(null)
const proposalResponses = ref<Record<string, string>>({})
const supportMessages = ref<Record<string, string>>({})

// Get mentee ID from localStorage
const getMenteeId = () => {
  const loggedInUser = localStorage.getItem('loggedInUser')
  if (loggedInUser) {
    try {
      const user = JSON.parse(loggedInUser)
      return user.id
    } catch (e) {
      console.error('Error parsing loggedInUser from localStorage:', e)
    }
  }
  return null
}

// Computed
const sessions = computed(() => sessionsStore.sessions)
const isLoading = computed(() => sessionsStore.isLoading)
const pagination = computed(() => sessionsStore.pagination)
const sessionStats = computed(() => sessionsStore.sessionStats)

const currentSessions = computed(() => {
  const now = new Date()

  switch (selectedTab.value) {
    case 'all':
      return sessions.value
    case 'upcoming':
      return sessions.value.filter(s => {
        const sessionDate = new Date(s.scheduledStart)
        return sessionDate > now && !['CANCELLED', 'COMPLETED'].includes(s.status)
      })
    case 'past':
      return sessions.value.filter(s => {
        const sessionDate = new Date(s.scheduledStart)
        return sessionDate < now || s.status === 'COMPLETED' || s.status === 'CANCELLED'
      })
    case 'today':
      return sessions.value.filter(s => {
        const sessionDate = new Date(s.scheduledStart)
        return sessionDate.toDateString() === now.toDateString()
      })
    default:
      return sessions.value
  }
})

// Methods
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const formatDateTime = (date) => {
  return `${formatDate(date)} at ${formatTime(date)}`
}

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

const getStatusVariant = (status: string) => {
  switch (status.toUpperCase()) {
    case 'CONFIRMED': return 'default'
    case 'SCHEDULED': return 'default'
    case 'IN_PROGRESS': return 'default'
    case 'PENDING': return 'secondary'
    case 'COMPLETED': return 'outline'
    case 'CANCELLED': return 'destructive'
    default: return 'secondary'
  }
}

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'CONFIRMED': return 'text-green-600'
    case 'SCHEDULED': return 'text-green-600'
    case 'IN_PROGRESS': return 'text-green-600'
    case 'PENDING': return 'text-blue-600'
    case 'COMPLETED': return 'text-gray-600'
    case 'CANCELLED': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'zoom': return Video
    case 'google_meet':
    case 'google-meet': return Video
    case 'teams': return Video
    case 'phone': return Phone
    default: return Video
  }
}

const canJoinSession = (session: any) => {
  const now = new Date()
  const sessionStart = new Date(session.scheduledStart)
  const sessionEnd = new Date(session.scheduledEnd)

  // Can join 15 minutes before to 15 minutes after end
  const joinWindow = 15 * 60 * 1000 // 15 minutes in ms
  return now >= (sessionStart.getTime() - joinWindow) &&
         now <= (sessionEnd.getTime() + joinWindow) &&
         session.status === 'CONFIRMED'
}

const joinSession = (session: any) => {
  if (session.meetingUrl) {
    window.open(session.meetingUrl, '_blank')
    toast.success('Opening session meeting...')
  } else {
    toast.error('Meeting link not available')
  }
}

const hasPendingProposal = (session: any) => {
  return session?.activeProposal?.status === 'PENDING_MENTEE_RESPONSE' &&
         Array.isArray(session.activeProposal.slots) &&
         session.activeProposal.slots.length > 0
}

const getProposalResponse = (sessionId: string) => {
  return proposalResponses.value[sessionId] || ''
}

const setProposalResponse = (sessionId: string, value: string) => {
  proposalResponses.value = {
    ...proposalResponses.value,
    [sessionId]: value
  }
}

const getSupportMessage = (sessionId: string) => {
  return supportMessages.value[sessionId] || ''
}

const setSupportMessage = (sessionId: string, value: string) => {
  supportMessages.value = {
    ...supportMessages.value,
    [sessionId]: value
  }
}

const handleAcceptProposal = async (session: any, slot: any) => {
  if (!session?.activeProposal?.id || !slot?.id) return

  respondingProposalId.value = session.activeProposal.id
  try {
    await sessionsStore.acceptProposal(session.id, session.activeProposal.id, {
      slotId: slot.id,
      response: getProposalResponse(session.id).trim() || null
    })

    session.status = 'CONFIRMED'
    session.scheduledStart = slot.scheduledStart
    session.scheduledEnd = slot.scheduledEnd
    session.activeProposal = {
      ...session.activeProposal,
      status: 'ACCEPTED',
      acceptedSlotId: slot.id
    }
  } catch (error) {
    console.error('Error accepting proposal:', error)
  } finally {
    respondingProposalId.value = null
  }
}

const handleDeclineProposal = async (session: any) => {
  if (!session?.activeProposal?.id) return

  respondingProposalId.value = session.activeProposal.id
  try {
    await sessionsStore.declineProposal(session.id, session.activeProposal.id, {
      response: getProposalResponse(session.id).trim() || null
    })

    session.activeProposal = {
      ...session.activeProposal,
      status: 'DECLINED',
      menteeResponse: getProposalResponse(session.id).trim() || null
    }
  } catch (error) {
    console.error('Error declining proposal:', error)
  } finally {
    respondingProposalId.value = null
  }
}

const handleContactSupport = async (session: any) => {
  supportRequestingSessionId.value = session.id
  try {
    await sessionsStore.contactSupport(session.id, {
      requesterType: 'MENTEE',
      message: getSupportMessage(session.id).trim() || null
    })
    supportMessages.value = {
      ...supportMessages.value,
      [session.id]: ''
    }
  } catch (error) {
    console.error('Error requesting support contact:', error)
  } finally {
    supportRequestingSessionId.value = null
  }
}

const viewAlternativeMentors = (session: any) => {
  router.push({
    path: '/app/mentors',
    query: {
      fromSession: session.id,
      excludeMentorId: session.mentorId,
      skillId: session.skillId
    }
  })
}

const viewSessionDetails = (session: any) => {
  selectedSession.value = session
  showSessionDetails.value = true
}

const rescheduleSession = (session: any) => {
  // TODO: Implement reschedule functionality
  toast.info('Reschedule feature coming soon!')
}

const cancelSession = (session: any) => {
  // TODO: Implement cancel functionality
  toast.info('Cancel feature coming soon!')
}

const canMarkComplete = (session: any) => {
  const scheduledEnd = new Date(session.scheduledEnd).getTime()
  const normalizedStatus = String(session.status || '').toUpperCase()

  return !Number.isNaN(scheduledEnd) &&
         scheduledEnd <= Date.now() &&
         ['CONFIRMED', 'SCHEDULED', 'IN_PROGRESS'].includes(normalizedStatus)
}

const handleCompleteSession = async (session: any) => {
  completingSessionId.value = session.id

  try {
    const response = await sessionsStore.completeSession(session.id)
    const updatedSession = response?.data || response?.session || null

    session.status = 'COMPLETED'

    if (updatedSession) {
      Object.assign(session, updatedSession)
    }

    if (selectedSession.value?.id === session.id) {
      selectedSession.value = {
        ...selectedSession.value,
        ...(updatedSession || {}),
        status: 'COMPLETED'
      }
    }
  } catch (error) {
    console.error('Error marking session as completed:', error)
  } finally {
    completingSessionId.value = null
  }
}

const isUpcoming = (session: any) => {
  return new Date(session.scheduledStart) > new Date() &&
         !['CANCELLED', 'COMPLETED'].includes(session.status)
}

const timeUntilSession = (session: any) => {
  const now = new Date()
  const sessionStart = new Date(session.scheduledStart)
  const diffMs = sessionStart.getTime() - now.getTime()

  if (diffMs < 0) return 'Started'

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffDays > 0) return `in ${diffDays}d`
  if (diffHours > 0) return `in ${diffHours}h ${diffMinutes}m`
  return `in ${diffMinutes}m`
}

const loadMoreSessions = async () => {
  const menteeId = getMenteeId()
  if (!menteeId) return
  await sessionsStore.loadMoreSessions(menteeId)
}

// Watch for tab changes
watch(selectedTab, async (newTab) => {
  const menteeId = getMenteeId()
  if (!menteeId) return

  // Map tab values to filter values
  const filterMap: Record<string, 'all' | 'today' | 'upcoming' | 'past'> = {
    'all': 'all',
    'upcoming': 'upcoming',
    'today': 'today',
    'past': 'past'
  }

  const filter = filterMap[newTab] || 'all'
  await sessionsStore.changeFilter(menteeId, filter)
})

// Lifecycle
onMounted(async () => {
  console.log('📅 Loading sessions page...')
  const menteeId = getMenteeId()

  if (!menteeId) {
    console.error('No mentee ID found in localStorage')
    toast.error('Unable to load sessions. Please log in again.')
    return
  }

  // Load sessions with 'all' filter initially
  await sessionsStore.loadSessions({
    menteeId,
    filter: 'all',
    page: 0,
    size: 10
  })

  console.log('📊 Session stats:', sessionStats.value)
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">My Sessions</h1>
        <p class="text-muted-foreground">
          Manage your mentoring sessions and upcoming meetings
        </p>
      </div>
    </div>

    <!-- Session Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Sessions</CardTitle>
          <Calendar class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ sessionStats.total }}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Upcoming</CardTitle>
          <Clock class="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-blue-600">{{ sessionStats.upcoming }}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Today</CardTitle>
          <Zap class="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-orange-600">{{ sessionStats.today }}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Completed</CardTitle>
          <CheckCircle class="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">{{ sessionStats.completed }}</div>
        </CardContent>
      </Card>
    </div>

    <!-- Sessions List -->
    <Card>
      <CardHeader>
        <Tabs v-model="selectedTab" class="w-full">
          <TabsList class="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="past">Past Sessions</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <!-- Loading State -->
        <div v-if="isLoading && currentSessions.length === 0" class="space-y-4">
          <div v-for="i in 3" :key="i" class="border rounded-lg p-4">
            <div class="flex items-start space-x-4">
              <Skeleton class="h-12 w-12 rounded-full" />
              <div class="flex-1 space-y-2">
                <Skeleton class="h-5 w-3/4" />
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="currentSessions.length === 0" class="text-center py-12">
          <Calendar class="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-semibold mb-2">No sessions found</h3>
          <p class="text-muted-foreground mb-4">
            <span v-if="selectedTab === 'all'">You don't have any sessions yet.</span>
            <span v-else-if="selectedTab === 'upcoming'">You don't have any upcoming sessions.</span>
            <span v-else-if="selectedTab === 'today'">No sessions scheduled for today.</span>
            <span v-else>No past sessions to display.</span>
          </p>
          <Button v-if="selectedTab === 'upcoming' || selectedTab === 'all'" @click="router.push('/app/mentors')">
            Find Mentors
          </Button>
        </div>

        <!-- Sessions List -->
        <div v-else class="space-y-4">
          <div
            v-for="session in currentSessions"
            :key="session.id"
            class="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <!-- Session Info -->
              <div class="flex space-x-4 flex-1">
                <!-- Skill Icon/Avatar -->
                <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users class="h-6 w-6 text-primary" />
                </div>

                <!-- Session Details -->
                <div class="flex-1 space-y-2">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold">{{ session.title }}</h3>
                    <div class="flex items-center space-x-2">
                      <Badge :variant="getStatusVariant(session.status)">
                        {{ session.status.charAt(0).toUpperCase() + session.status.slice(1).toLowerCase() }}
                      </Badge>
                      <Badge v-if="isUpcoming(session)" variant="outline" class="text-xs">
                        {{ timeUntilSession(session) }}
                      </Badge>
                    </div>
                  </div>

                  <div v-if="session.companyProgramName">
                    <Badge variant="outline" class="text-xs">{{ session.companyProgramName }}</Badge>
                  </div>

                  <div class="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div v-if="session.skill" class="flex items-center space-x-1">
                      <FileText class="h-4 w-4" />
                      <span>{{ session.skill.name }}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <Calendar class="h-4 w-4" />
                      <span>{{ formatDate(session.scheduledStart) }}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <Clock class="h-4 w-4" />
                      <span>{{ formatTime(session.scheduledStart) }} - {{ formatTime(session.scheduledEnd) }}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <component :is="getPlatformIcon(session.meetingPlatform)" class="h-4 w-4" />
                      <span class="capitalize">{{ session.meetingPlatform.replace('_', ' ').toLowerCase() }}</span>
                    </div>
                  </div>

                  <p v-if="session.description" class="text-sm text-muted-foreground">
                    {{ session.description }}
                  </p>

                  <div v-if="session.menteeMessage" class="text-sm">
                    <span class="font-medium">Your message: </span>
                    <span class="text-muted-foreground">{{ session.menteeMessage }}</span>
                  </div>

                  <div
                    v-if="hasPendingProposal(session)"
                    class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/70 p-4"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="flex items-center gap-2 font-medium text-emerald-900">
                          <CalendarClock class="h-4 w-4" />
                          Mentor proposed an alternative time
                        </div>
                        <p v-if="session.activeProposal.mentorMessage" class="mt-1 text-sm text-emerald-800">
                          {{ session.activeProposal.mentorMessage }}
                        </p>
                      </div>
                      <Badge variant="outline" class="bg-white text-emerald-700">
                        Awaiting response
                      </Badge>
                    </div>

                    <div class="mt-3 grid gap-2 md:grid-cols-2">
                      <div
                        v-for="slot in session.activeProposal.slots"
                        :key="slot.id"
                        class="rounded-md border bg-white p-3"
                      >
                        <div class="text-sm font-medium">{{ formatDateTime(slot.scheduledStart) }}</div>
                        <div class="text-xs text-muted-foreground">
                          Ends {{ formatTime(slot.scheduledEnd) }}
                        </div>
                        <Button
                          class="mt-3 w-full"
                          size="sm"
                          @click="handleAcceptProposal(session, slot)"
                          :disabled="respondingProposalId === session.activeProposal.id"
                        >
                          <CheckCircle class="mr-2 h-4 w-4" />
                          Accept this time
                        </Button>
                      </div>
                    </div>

                    <div class="mt-3 space-y-2">
                      <Label :for="`proposal-response-${session.id}`">Response (Optional)</Label>
                      <Textarea
                        :id="`proposal-response-${session.id}`"
                        :model-value="getProposalResponse(session.id)"
                        placeholder="Add a short response for your mentor."
                        rows="2"
                        @update:model-value="setProposalResponse(session.id, String($event || ''))"
                      />
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        @click="handleDeclineProposal(session)"
                        :disabled="respondingProposalId === session.activeProposal.id"
                      >
                        <X class="mr-2 h-4 w-4" />
                        Decline proposed time
                      </Button>
                      <Button variant="outline" size="sm" @click="viewAlternativeMentors(session)">
                        <Users class="mr-2 h-4 w-4" />
                        View alternative mentors
                      </Button>
                    </div>

                    <div class="mt-3 space-y-2 border-t border-emerald-100 pt-3">
                      <Label :for="`support-message-${session.id}`">Support Message (Optional)</Label>
                      <Textarea
                        :id="`support-message-${session.id}`"
                        :model-value="getSupportMessage(session.id)"
                        placeholder="Ask the Mentee Experience team to contact you."
                        rows="2"
                        @update:model-value="setSupportMessage(session.id, String($event || ''))"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        @click="handleContactSupport(session)"
                        :disabled="supportRequestingSessionId === session.id"
                      >
                        <LifeBuoy class="mr-2 h-4 w-4" />
                        {{ supportRequestingSessionId === session.id ? 'Sending...' : 'Contact support' }}
                      </Button>
                    </div>
                  </div>

                  <!-- Cancellation Reason -->
                  <Alert v-if="session.status === 'CANCELLED' && session.cancellationReason" variant="destructive" class="mt-2">
                    <AlertCircle class="h-4 w-4" />
                    <AlertDescription>
                      Cancelled: {{ session.cancellationReason }}
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex flex-col space-y-2 ml-4">
                <Button
                  v-if="canJoinSession(session)"
                  @click="joinSession(session)"
                  size="sm"
                  class="bg-green-600 hover:bg-green-700"
                >
                  <Video class="h-4 w-4 mr-2" />
                  Join Session
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  @click="viewSessionDetails(session)"
                >
                  <Eye class="h-4 w-4 mr-2" />
                  View Details
                </Button>

                <Button
                  v-if="canMarkComplete(session)"
                  variant="outline"
                  size="sm"
                  @click="handleCompleteSession(session)"
                  :disabled="completingSessionId === session.id"
                >
                  <CheckCircle class="h-4 w-4 mr-2" />
                  {{ completingSessionId === session.id ? 'Completing...' : 'Mark Complete' }}
                </Button>
                
                <div v-if="isUpcoming(session)" class="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="rescheduleSession(session)"
                    class="flex-1"
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    @click="cancelSession(session)"
                    class="flex-1 text-red-600 hover:text-red-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.hasNext" class="flex justify-center pt-6">
            <Button
              @click="loadMoreSessions"
              :disabled="isLoading"
              variant="outline"
              size="lg"
            >
              {{ isLoading ? 'Loading...' : 'Load More Sessions' }}
            </Button>
            <p class="text-sm text-muted-foreground ml-4 flex items-center">
              Showing {{ currentSessions.length }} of {{ pagination.totalSessions }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Session Details Modal -->
    <Dialog v-model:open="showSessionDetails">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
          <DialogDescription v-if="selectedSession">
            {{ selectedSession.title }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedSession" class="space-y-6">
          <!-- Basic Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h4 class="font-semibold mb-2">Session Information</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Date:</span>
                  <span>{{ formatDate(selectedSession.scheduledStart) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Time:</span>
                  <span>{{ formatTime(selectedSession.scheduledStart) }} - {{ formatTime(selectedSession.scheduledEnd) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Duration:</span>
                  <span>{{ formatDuration(selectedSession.durationMinutes) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Platform:</span>
                  <span class="capitalize">{{ selectedSession.meetingPlatform.replace('_', ' ').toLowerCase() }}</span>
                </div>
                <div v-if="selectedSession.companyProgramName" class="flex justify-between">
                  <span class="text-muted-foreground">Program:</span>
                  <span>{{ selectedSession.companyProgramName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Status:</span>
                  <Badge :variant="getStatusVariant(selectedSession.status)">
                    {{ selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1).toLowerCase() }}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-semibold mb-2">Skill</h4>
              <div v-if="selectedSession.skill" class="space-y-2 text-sm">
                <p class="font-medium">{{ selectedSession.skill.name }}</p>
              </div>
              <div v-if="selectedSession.price" class="mt-4">
                <h4 class="font-semibold mb-2">Payment</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Price:</span>
                    <span>{{ selectedSession.currency }} {{ selectedSession.price }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Status:</span>
                    <Badge :variant="selectedSession.paid ? 'default' : 'secondary'">
                      {{ selectedSession.paid ? 'Paid' : selectedSession.paymentStatus }}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Description -->
          <div v-if="selectedSession.description">
            <h4 class="font-semibold mb-2">Description</h4>
            <p class="text-sm text-muted-foreground">{{ selectedSession.description }}</p>
          </div>

          <!-- Mentee Message -->
          <div v-if="selectedSession.menteeMessage">
            <h4 class="font-semibold mb-2">Your Message</h4>
            <p class="text-sm text-muted-foreground">{{ selectedSession.menteeMessage }}</p>
          </div>

          <!-- Mentor Response -->
          <div v-if="selectedSession.mentorResponse">
            <h4 class="font-semibold mb-2">Mentor Response</h4>
            <p class="text-sm text-muted-foreground">{{ selectedSession.mentorResponse }}</p>
          </div>

          <div v-if="hasPendingProposal(selectedSession)" class="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
            <div class="flex items-center gap-2 font-medium text-emerald-900">
              <CalendarClock class="h-4 w-4" />
              Proposed Alternative Time
            </div>
            <p v-if="selectedSession.activeProposal.mentorMessage" class="mt-1 text-sm text-emerald-800">
              {{ selectedSession.activeProposal.mentorMessage }}
            </p>
            <div class="mt-3 grid gap-2">
              <div
                v-for="slot in selectedSession.activeProposal.slots"
                :key="slot.id"
                class="flex items-center justify-between gap-3 rounded-md border bg-white p-3"
              >
                <div>
                  <div class="text-sm font-medium">{{ formatDateTime(slot.scheduledStart) }}</div>
                  <div class="text-xs text-muted-foreground">Ends {{ formatTime(slot.scheduledEnd) }}</div>
                </div>
                <Button
                  size="sm"
                  @click="handleAcceptProposal(selectedSession, slot)"
                  :disabled="respondingProposalId === selectedSession.activeProposal.id"
                >
                  Accept
                </Button>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="handleDeclineProposal(selectedSession)"
                :disabled="respondingProposalId === selectedSession.activeProposal.id"
              >
                Decline proposed time
              </Button>
              <Button variant="outline" size="sm" @click="viewAlternativeMentors(selectedSession)">
                View alternative mentors
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="handleContactSupport(selectedSession)"
                :disabled="supportRequestingSessionId === selectedSession.id"
              >
                Contact support
              </Button>
            </div>
          </div>

          <!-- Session Notes (for completed sessions) -->
          <div v-if="selectedSession.notes">
            <h4 class="font-semibold mb-2">Session Notes</h4>
            <p class="text-sm text-muted-foreground">{{ selectedSession.notes }}</p>
          </div>

          <!-- Feedback (for completed sessions) -->
          <div v-if="selectedSession.feedback || selectedSession.rating" class="space-y-2">
            <h4 class="font-semibold mb-2">Session Feedback</h4>
            <div v-if="selectedSession.rating" class="flex items-center space-x-1">
              <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span class="text-sm font-medium">{{ selectedSession.rating }}/5</span>
            </div>
            <p v-if="selectedSession.feedback" class="text-sm text-muted-foreground">{{ selectedSession.feedback }}</p>
          </div>

          <!-- Cancellation Info -->
          <div v-if="selectedSession.status === 'CANCELLED'" class="space-y-2">
            <h4 class="font-semibold mb-2">Cancellation Details</h4>
            <div class="text-sm space-y-1">
              <div v-if="selectedSession.cancelledBy">
                <span class="text-muted-foreground">Cancelled by:</span>
                <span class="ml-2">{{ selectedSession.cancelledBy }}</span>
              </div>
              <div v-if="selectedSession.cancelledAt">
                <span class="text-muted-foreground">Cancelled at:</span>
                <span class="ml-2">{{ formatDate(selectedSession.cancelledAt) }}</span>
              </div>
              <div v-if="selectedSession.cancellationReason">
                <span class="text-muted-foreground">Reason:</span>
                <span class="ml-2">{{ selectedSession.cancellationReason }}</span>
              </div>
            </div>
          </div>

          <!-- Meeting Link -->
          <div v-if="selectedSession.meetingUrl && isUpcoming(selectedSession)">
            <Button
              @click="joinSession(selectedSession)"
              :disabled="!canJoinSession(selectedSession)"
              class="w-full"
            >
              <Video class="h-4 w-4 mr-2" />
              Join Session
            </Button>
          </div>

          <div v-if="canMarkComplete(selectedSession)">
            <Button
              @click="handleCompleteSession(selectedSession)"
              :disabled="completingSessionId === selectedSession.id"
              class="w-full"
            >
              <CheckCircle class="h-4 w-4 mr-2" />
              {{ completingSessionId === selectedSession.id ? 'Completing...' : 'Mark Session as Complete' }}
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
