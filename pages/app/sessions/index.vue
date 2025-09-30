<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
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
  Zap
} from 'lucide-vue-next'

// Mock data
import { 
  mockSessions, 
  getUpcomingSessions, 
  getPastSessions, 
  getTodaysSessions 
} from '@/mock/mockSessionData.js'

definePageMeta({
  title: 'My Sessions',
  description: 'Manage your mentoring sessions',
  layout: 'default'
})

// Stores
const authStore = useAuthStore()
const router = useRouter()
const toast = useAppToast()

// State
const selectedTab = ref('upcoming')
const selectedSession = ref(null)
const showSessionDetails = ref(false)
const isLoading = ref(false)

// Data
const allSessions = ref(mockSessions)
const upcomingSessions = ref(getUpcomingSessions())
const pastSessions = ref(getPastSessions())
const todaysSessions = ref(getTodaysSessions())

// Computed
const currentSessions = computed(() => {
  switch (selectedTab.value) {
    case 'upcoming':
      return upcomingSessions.value
    case 'past':
      return pastSessions.value
    case 'today':
      return todaysSessions.value
    default:
      return upcomingSessions.value
  }
})

const sessionStats = computed(() => ({
  total: allSessions.value.length,
  upcoming: upcomingSessions.value.length,
  today: todaysSessions.value.length,
  completed: pastSessions.value.filter(s => s.status === 'completed').length
}))

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

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'confirmed': return 'default'
    case 'scheduled': return 'secondary'
    case 'completed': return 'outline'
    case 'cancelled': return 'destructive'
    case 'in-progress': return 'default'
    default: return 'secondary'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed': return 'text-green-600'
    case 'scheduled': return 'text-blue-600'
    case 'completed': return 'text-gray-600'
    case 'cancelled': return 'text-red-600'
    case 'in-progress': return 'text-orange-600'
    default: return 'text-gray-600'
  }
}

const getPlatformIcon = (platform) => {
  switch (platform) {
    case 'zoom': return Video
    case 'google-meet': return Video
    case 'teams': return Video
    case 'phone': return Phone
    default: return Video
  }
}

const canJoinSession = (session) => {
  const now = new Date()
  const sessionStart = new Date(session.scheduledStart)
  const sessionEnd = new Date(session.scheduledEnd)
  
  // Can join 15 minutes before to 15 minutes after end
  const joinWindow = 15 * 60 * 1000 // 15 minutes in ms
  return now >= (sessionStart.getTime() - joinWindow) && 
         now <= (sessionEnd.getTime() + joinWindow) &&
         session.status === 'confirmed'
}

const joinSession = (session) => {
  if (session.meetingLink) {
    window.open(session.meetingLink, '_blank')
    toast.success('Opening session meeting...')
  } else {
    toast.error('Meeting link not available')
  }
}

const viewSessionDetails = (session) => {
  selectedSession.value = session
  showSessionDetails.value = true
}

const rescheduleSession = (session) => {
  // TODO: Implement reschedule functionality
  toast.info('Reschedule feature coming soon!')
}

const cancelSession = (session) => {
  // TODO: Implement cancel functionality
  toast.info('Cancel feature coming soon!')
}

const isUpcoming = (session) => {
  return new Date(session.scheduledStart) > new Date() && 
         !['cancelled', 'completed'].includes(session.status)
}

const timeUntilSession = (session) => {
  const now = new Date()
  const sessionStart = new Date(session.scheduledStart)
  const diffMs = sessionStart - now
  
  if (diffMs < 0) return 'Started'
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffDays > 0) return `in ${diffDays}d`
  if (diffHours > 0) return `in ${diffHours}h ${diffMinutes}m`
  return `in ${diffMinutes}m`
}

// Lifecycle
onMounted(() => {
  console.log('📅 Loading sessions page...')
  // In a real app, this would load from API
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
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="past">Past Sessions</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        <div v-if="currentSessions.length === 0" class="text-center py-12">
          <Calendar class="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 class="text-lg font-semibold mb-2">No sessions found</h3>
          <p class="text-muted-foreground mb-4">
            <span v-if="selectedTab === 'upcoming'">You don't have any upcoming sessions.</span>
            <span v-else-if="selectedTab === 'today'">No sessions scheduled for today.</span>
            <span v-else>No past sessions to display.</span>
          </p>
          <Button v-if="selectedTab === 'upcoming'" @click="router.push('/app/mentors')">
            Find Mentors
          </Button>
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="session in currentSessions"
            :key="session.id"
            class="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <!-- Session Info -->
              <div class="flex space-x-4 flex-1">
                <!-- Mentor Avatar -->
                <Avatar class="h-12 w-12">
                  <AvatarImage :src="session.mentor.profilePhoto" :alt="session.mentor.name" />
                  <AvatarFallback>{{ session.mentor.name.split(' ').map(n => n[0]).join('') }}</AvatarFallback>
                </Avatar>
                
                <!-- Session Details -->
                <div class="flex-1 space-y-2">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold">{{ session.title }}</h3>
                    <div class="flex items-center space-x-2">
                      <Badge :variant="getStatusVariant(session.status)">
                        {{ session.status.charAt(0).toUpperCase() + session.status.slice(1) }}
                      </Badge>
                      <Badge v-if="isUpcoming(session)" variant="outline" class="text-xs">
                        {{ timeUntilSession(session) }}
                      </Badge>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div class="flex items-center space-x-1">
                      <Users class="h-4 w-4" />
                      <span>{{ session.mentor.name }}</span>
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
                      <component :is="getPlatformIcon(session.platform)" class="h-4 w-4" />
                      <span class="capitalize">{{ session.platform.replace('-', ' ') }}</span>
                    </div>
                  </div>
                  
                  <p v-if="session.description" class="text-sm text-muted-foreground">
                    {{ session.description }}
                  </p>
                  
                  <!-- Action Items (for completed sessions) -->
                  <div v-if="session.actionItems && session.actionItems.length > 0" class="space-y-1">
                    <p class="text-sm font-medium">Action Items:</p>
                    <ul class="text-sm text-muted-foreground space-y-1">
                      <li v-for="item in session.actionItems" :key="item" class="flex items-center space-x-2">
                        <CheckCircle class="h-3 w-3 text-green-600" />
                        <span>{{ item }}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <!-- Cancellation Reason -->
                  <Alert v-if="session.status === 'cancelled'" variant="destructive" class="mt-2">
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
        </div>
      </CardContent>
    </Card>

    <!-- Session Details Modal -->
    <Dialog v-model:open="showSessionDetails">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
          <DialogDescription v-if="selectedSession">
            {{ selectedSession.title }} with {{ selectedSession.mentor.name }}
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
                  <span>{{ formatDuration(selectedSession.duration) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Platform:</span>
                  <span class="capitalize">{{ selectedSession.platform.replace('-', ' ') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Status:</span>
                  <Badge :variant="getStatusVariant(selectedSession.status)">
                    {{ selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1) }}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 class="font-semibold mb-2">Mentor Information</h4>
              <div class="flex items-center space-x-3 mb-3">
                <Avatar class="h-10 w-10">
                  <AvatarImage :src="selectedSession.mentor.profilePhoto" :alt="selectedSession.mentor.name" />
                  <AvatarFallback>{{ selectedSession.mentor.name.split(' ').map(n => n[0]).join('') }}</AvatarFallback>
                </Avatar>
                <div>
                  <p class="font-medium">{{ selectedSession.mentor.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ selectedSession.mentor.title }}</p>
                  <p class="text-sm text-muted-foreground">{{ selectedSession.mentor.company }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-1">
                <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span class="text-sm font-medium">{{ selectedSession.mentor.rating }}</span>
              </div>
            </div>
          </div>
          
          <!-- Description -->
          <div v-if="selectedSession.description">
            <h4 class="font-semibold mb-2">Description</h4>
            <p class="text-sm text-muted-foreground">{{ selectedSession.description }}</p>
          </div>
          
          <!-- Booking Notes -->
          <div v-if="selectedSession.bookingNotes">
            <h4 class="font-semibold mb-2">Your Notes</h4>
            <p class="text-sm text-muted-foreground">{{ selectedSession.bookingNotes }}</p>
          </div>
          
          <!-- Preparation Materials -->
          <div v-if="selectedSession.preparationMaterials && selectedSession.preparationMaterials.length > 0">
            <h4 class="font-semibold mb-2">Preparation Materials</h4>
            <ul class="space-y-1">
              <li v-for="material in selectedSession.preparationMaterials" :key="material" class="flex items-center space-x-2 text-sm">
                <FileText class="h-4 w-4 text-blue-600" />
                <span>{{ material }}</span>
              </li>
            </ul>
          </div>
          
          <!-- Session Notes (for completed sessions) -->
          <div v-if="selectedSession.sessionNotes">
            <h4 class="font-semibold mb-2">Session Notes</h4>
            <p class="text-sm text-muted-foreground">{{ selectedSession.sessionNotes }}</p>
          </div>
          
          <!-- Action Items (for completed sessions) -->
          <div v-if="selectedSession.actionItems && selectedSession.actionItems.length > 0">
            <h4 class="font-semibold mb-2">Action Items</h4>
            <ul class="space-y-1">
              <li v-for="item in selectedSession.actionItems" :key="item" class="flex items-center space-x-2 text-sm">
                <CheckCircle class="h-4 w-4 text-green-600" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
          
          <!-- Feedback (for completed sessions) -->
          <div v-if="selectedSession.mentorFeedback || selectedSession.menteeFeedback" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="selectedSession.mentorFeedback">
              <h4 class="font-semibold mb-2">Mentor Feedback</h4>
              <p class="text-sm text-muted-foreground">{{ selectedSession.mentorFeedback }}</p>
              <div v-if="selectedSession.mentorRating" class="flex items-center space-x-1 mt-2">
                <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span class="text-sm font-medium">{{ selectedSession.mentorRating }}/5</span>
              </div>
            </div>
            
            <div v-if="selectedSession.menteeFeedback">
              <h4 class="font-semibold mb-2">Your Feedback</h4>
              <p class="text-sm text-muted-foreground">{{ selectedSession.menteeFeedback }}</p>
              <div v-if="selectedSession.menteeRating" class="flex items-center space-x-1 mt-2">
                <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span class="text-sm font-medium">{{ selectedSession.menteeRating }}/5</span>
              </div>
            </div>
          </div>
          
          <!-- Meeting Link -->
          <div v-if="selectedSession.meetingLink && isUpcoming(selectedSession)">
            <Button 
              @click="joinSession(selectedSession)"
              :disabled="!canJoinSession(selectedSession)"
              class="w-full"
            >
              <Video class="h-4 w-4 mr-2" />
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