<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">My Sessions</h2>
        <p class="text-gray-600 mt-1">
          Manage your mentoring sessions and bookings
        </p>
      </div>
      
      <div class="flex items-center space-x-3">
        <Select v-model="selectedFilter">
          <SelectTrigger class="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="pending">Pending Approval</SelectItem>
          </SelectContent>
        </Select>
        
        <Button @click="$emit('book-session')">
          <Plus class="w-4 h-4 mr-2" />
          Book Session
        </Button>
      </div>
    </div>

    <!-- Session Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-lg border">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <Calendar class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Upcoming</p>
            <p class="text-2xl font-bold">{{ sessionStats.upcoming }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded-lg border">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <CheckCircle class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Completed</p>
            <p class="text-2xl font-bold">{{ sessionStats.completed }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded-lg border">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-amber-100 rounded-lg">
            <Clock class="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Pending</p>
            <p class="text-2xl font-bold">{{ sessionStats.pending }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded-lg border">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-purple-100 rounded-lg">
            <Star class="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Avg Rating</p>
            <p class="text-2xl font-bold">{{ sessionStats.averageRating.toFixed(1) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sessions List -->
    <div class="space-y-4">
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white p-6 rounded-lg border">
          <Skeleton class="h-4 w-1/4 mb-3" />
          <Skeleton class="h-4 w-3/4 mb-2" />
          <Skeleton class="h-4 w-1/2" />
        </div>
      </div>

      <div v-else-if="filteredSessions.length === 0" 
        class="text-center py-12 bg-white rounded-lg border">
        <Calendar class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
        <p class="text-gray-600">
          {{ getEmptyStateMessage() }}
        </p>
      </div>

      <div v-else class="space-y-4">
        <MentorSessionCard
          v-for="session in filteredSessions"
          :key="session.id"
          :session="session"
          :user-role="userRole"
          @join="handleJoinSession"
          @reschedule="handleRescheduleSession"
          @cancel="handleCancelSession"
          @review="handleReviewSession"
          @view-details="handleViewDetails"
        />
      </div>

      <!-- Load More -->
      <div v-if="hasMore" class="text-center">
        <Button @click="loadMoreSessions" variant="outline" :loading="isLoadingMore">
          Load More Sessions
        </Button>
      </div>
    </div>

    <!-- Session Details Modal -->
    <Dialog v-model:open="showSessionDetails">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
        </DialogHeader>
        
        <div v-if="selectedSession" class="space-y-6">
          <!-- Session Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm text-gray-600">Session Type</Label>
              <p class="font-medium">{{ formatSessionType(selectedSession.sessionType) }}</p>
            </div>
            <div>
              <Label class="text-sm text-gray-600">Duration</Label>
              <p class="font-medium">{{ selectedSession.duration }} minutes</p>
            </div>
            <div>
              <Label class="text-sm text-gray-600">Platform</Label>
              <p class="font-medium capitalize">{{ selectedSession.platform }}</p>
            </div>
            <div>
              <Label class="text-sm text-gray-600">Status</Label>
              <Badge :variant="getSessionStatusVariant(selectedSession.status)">
                {{ formatSessionStatus(selectedSession.status) }}
              </Badge>
            </div>
          </div>

          <!-- Meeting Details -->
          <div v-if="selectedSession.meetingLink" class="space-y-2">
            <Label class="text-sm text-gray-600">Meeting Information</Label>
            <div class="bg-gray-50 p-4 rounded-lg space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm">Meeting Link:</span>
                <Button size="sm" @click="copyMeetingLink(selectedSession.meetingLink)">
                  <Copy class="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
              <p class="text-sm text-gray-600 break-all">{{ selectedSession.meetingLink }}</p>
            </div>
          </div>

          <!-- Description -->
          <div v-if="selectedSession.description" class="space-y-2">
            <Label class="text-sm text-gray-600">Description</Label>
            <p class="text-sm">{{ selectedSession.description }}</p>
          </div>

          <!-- Preparation Materials -->
          <div v-if="selectedSession.preparationMaterials?.length" class="space-y-2">
            <Label class="text-sm text-gray-600">Preparation Materials</Label>
            <ul class="text-sm space-y-1">
              <li v-for="material in selectedSession.preparationMaterials" :key="material">
                • {{ material }}
              </li>
            </ul>
          </div>

          <!-- Session Notes -->
          <div v-if="selectedSession.sessionNotes" class="space-y-2">
            <Label class="text-sm text-gray-600">Session Notes</Label>
            <p class="text-sm bg-gray-50 p-3 rounded">{{ selectedSession.sessionNotes }}</p>
          </div>

          <!-- Action Items -->
          <div v-if="selectedSession.actionItems?.length" class="space-y-2">
            <Label class="text-sm text-gray-600">Action Items</Label>
            <ul class="text-sm space-y-1">
              <li v-for="item in selectedSession.actionItems" :key="item">
                ✓ {{ item }}
              </li>
            </ul>
          </div>

          <!-- Payment Info -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label class="text-sm text-gray-600">Amount</Label>
              <p class="font-medium">${{ selectedSession.amount }} {{ selectedSession.currency }}</p>
            </div>
            <div>
              <Label class="text-sm text-gray-600">Payment Status</Label>
              <Badge :variant="getPaymentStatusVariant(selectedSession.paymentStatus)">
                {{ formatPaymentStatus(selectedSession.paymentStatus) }}
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showSessionDetails = false">
            Close
          </Button>
          <Button 
            v-if="selectedSession && canJoinSession(selectedSession)"
            @click="handleJoinSession(selectedSession)"
          >
            <Video class="w-4 h-4 mr-2" />
            Join Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Reschedule Modal -->
    <Dialog v-model:open="showRescheduleModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Session</DialogTitle>
          <DialogDescription>
            Request to reschedule your session with {{ selectedSession?.title }}
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Reason for rescheduling</Label>
            <Textarea 
              v-model="rescheduleReason"
              placeholder="Please provide a reason for rescheduling..."
              rows="3"
            />
          </div>
          
          <div class="space-y-2">
            <Label>Preferred new dates/times</Label>
            <Textarea 
              v-model="reschedulePreferences"
              placeholder="Please suggest alternative dates and times..."
              rows="2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showRescheduleModal = false">Cancel</Button>
          <Button @click="submitRescheduleRequest" :disabled="!rescheduleReason.trim()">
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Cancel Modal -->
    <Dialog v-model:open="showCancelModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Session</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this session? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Reason for cancellation</Label>
            <Select v-model="cancellationReason">
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="schedule-conflict">Schedule conflict</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="illness">Illness</SelectItem>
                <SelectItem value="technical-issues">Technical issues</SelectItem>
                <SelectItem value="no-longer-needed">No longer needed</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div v-if="cancellationReason === 'other'" class="space-y-2">
            <Label>Please specify</Label>
            <Textarea 
              v-model="cancellationDetails"
              placeholder="Please provide more details..."
              rows="2"
            />
          </div>

          <!-- Cancellation Policy -->
          <div class="bg-amber-50 p-3 rounded-lg text-sm">
            <p class="font-medium text-amber-800 mb-1">Cancellation Policy:</p>
            <p class="text-amber-700">
              Cancellations within 24 hours may incur a fee. Free cancellations are allowed up to 48 hours before the session.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showCancelModal = false">Keep Session</Button>
          <Button 
            variant="destructive" 
            @click="submitCancellation"
            :disabled="!cancellationReason"
          >
            Cancel Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { 
  Calendar, CheckCircle, Clock, Star, Plus, Video, Copy,
  Edit, Trash, MessageSquare
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import MentorSessionCard from './MentorSessionCard.vue'
import type { MentorSession } from '@/types/mentor'

interface Props {
  sessions: MentorSession[]
  userRole: 'mentor' | 'mentee'
  isLoading?: boolean
  hasMore?: boolean
}

interface Emits {
  (e: 'book-session'): void
  (e: 'join-session', sessionId: string): void
  (e: 'reschedule-session', sessionId: string, reason: string, preferences: string): void
  (e: 'cancel-session', sessionId: string, reason: string, details?: string): void
  (e: 'review-session', sessionId: string): void
  (e: 'load-more'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  hasMore: false
})

const emit = defineEmits<Emits>()

// State
const selectedFilter = ref('all')
const showSessionDetails = ref(false)
const showRescheduleModal = ref(false)
const showCancelModal = ref(false)
const selectedSession = ref<MentorSession | null>(null)
const isLoadingMore = ref(false)

// Form state
const rescheduleReason = ref('')
const reschedulePreferences = ref('')
const cancellationReason = ref('')
const cancellationDetails = ref('')

// Computed properties
const sessionStats = computed(() => {
  const stats = {
    upcoming: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    total: props.sessions.length,
    averageRating: 0
  }
  
  let totalRating = 0
  let ratedSessions = 0
  
  props.sessions.forEach(session => {
    switch (session.status) {
      case 'scheduled':
      case 'confirmed':
        stats.upcoming++
        break
      case 'completed':
        stats.completed++
        break
      case 'cancelled':
        stats.cancelled++
        break
      default:
        stats.pending++
    }
    
    const rating = props.userRole === 'mentor' ? session.menteeRating : session.mentorRating
    if (rating) {
      totalRating += rating
      ratedSessions++
    }
  })
  
  stats.averageRating = ratedSessions > 0 ? totalRating / ratedSessions : 0
  
  return stats
})

const filteredSessions = computed(() => {
  if (selectedFilter.value === 'all') return props.sessions
  
  return props.sessions.filter(session => {
    switch (selectedFilter.value) {
      case 'upcoming':
        return ['scheduled', 'confirmed'].includes(session.status)
      case 'completed':
        return session.status === 'completed'
      case 'cancelled':
        return session.status === 'cancelled'
      case 'pending':
        return session.status === 'in-progress'
      default:
        return true
    }
  })
})

// Methods
const getEmptyStateMessage = () => {
  switch (selectedFilter.value) {
    case 'upcoming': return 'No upcoming sessions scheduled.'
    case 'completed': return 'No completed sessions yet.'
    case 'cancelled': return 'No cancelled sessions.'
    case 'pending': return 'No pending sessions.'
    default: return 'No sessions found. Book your first session to get started!'
  }
}

const formatSessionType = (type: string) => {
  return type.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatSessionStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')
}

const formatPaymentStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getSessionStatusVariant = (status: string) => {
  switch (status) {
    case 'confirmed': return 'default'
    case 'scheduled': return 'secondary'
    case 'completed': return 'outline'
    case 'cancelled': return 'destructive'
    case 'in-progress': return 'default'
    default: return 'secondary'
  }
}

const getPaymentStatusVariant = (status: string) => {
  switch (status) {
    case 'paid': return 'default'
    case 'pending': return 'secondary'
    case 'refunded': return 'outline'
    case 'disputed': return 'destructive'
    default: return 'secondary'
  }
}

const canJoinSession = (session: MentorSession) => {
  const now = new Date()
  const sessionStart = new Date(session.scheduledStart)
  const sessionEnd = new Date(session.scheduledEnd)
  
  // Can join 10 minutes before to 10 minutes after end
  const joinWindow = 10 * 60 * 1000 // 10 minutes in ms
  return now >= (sessionStart.getTime() - joinWindow) && 
         now <= (sessionEnd.getTime() + joinWindow) &&
         session.status === 'confirmed'
}

const copyMeetingLink = async (link: string) => {
  try {
    await navigator.clipboard.writeText(link)
    // Show toast notification
    console.log('Meeting link copied to clipboard')
  } catch (err) {
    console.error('Failed to copy meeting link:', err)
  }
}

const handleJoinSession = (session: MentorSession) => {
  emit('join-session', session.id)
  if (session.meetingLink) {
    window.open(session.meetingLink, '_blank')
  }
}

const handleRescheduleSession = (session: MentorSession) => {
  selectedSession.value = session
  showRescheduleModal.value = true
}

const handleCancelSession = (session: MentorSession) => {
  selectedSession.value = session
  showCancelModal.value = true
}

const handleReviewSession = (session: MentorSession) => {
  emit('review-session', session.id)
}

const handleViewDetails = (session: MentorSession) => {
  selectedSession.value = session
  showSessionDetails.value = true
}

const submitRescheduleRequest = () => {
  if (selectedSession.value && rescheduleReason.value.trim()) {
    emit('reschedule-session', 
      selectedSession.value.id, 
      rescheduleReason.value, 
      reschedulePreferences.value
    )
    showRescheduleModal.value = false
    rescheduleReason.value = ''
    reschedulePreferences.value = ''
  }
}

const submitCancellation = () => {
  if (selectedSession.value && cancellationReason.value) {
    emit('cancel-session', 
      selectedSession.value.id, 
      cancellationReason.value,
      cancellationDetails.value || undefined
    )
    showCancelModal.value = false
    cancellationReason.value = ''
    cancellationDetails.value = ''
  }
}

const loadMoreSessions = () => {
  isLoadingMore.value = true
  emit('load-more')
  // Reset loading state after a delay (in real app, this would be handled by parent)
  setTimeout(() => {
    isLoadingMore.value = false
  }, 1000)
}
</script> 