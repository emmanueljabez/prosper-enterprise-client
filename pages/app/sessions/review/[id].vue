<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionsStore } from '@/store/modules/sessions/sessions'
import { useAppToast } from '@/composables/services/toastService'

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  Trash2
} from 'lucide-vue-next'

definePageMeta({
  title: 'Review Session Request',
  description: 'Review and respond to session request',
  layout: 'default',
  requiresAuth: false
})

// Router and store
const route = useRoute()
const router = useRouter()
const sessionsStore = useSessionsStore()
const toast = useAppToast()

// State
const sessionId = computed(() => route.params.id as string)
const actionParam = computed(() => route.query.action as string | undefined)
const session = ref<any>(null)
const isLoadingSession = ref(false)
const isSubmitting = ref(false)
const mentorResponse = ref('')
const mentorPreferredTime = ref('')
const preferredTimeError = ref('')
const declineReason = ref('')
const selectedAction = ref<'accept' | 'decline' | null>(null)
const actionCompleted = ref(false)
const completedAction = ref<'accepted' | 'declined' | 'completed' | null>(null)

type OutcomeActionItemForm = {
  description: string
  ownerType: 'MENTEE' | 'MENTOR' | 'SHARED'
  dueAt: string
}

const outcomeSummary = ref('')
const reflectionPrompt = ref('')
const mentorPrivateNotes = ref('')
const outcomeActionItems = ref<OutcomeActionItemForm[]>([
  { description: '', ownerType: 'MENTEE', dueAt: '' },
])

// Format date and time
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  })
}

const getDisplayName = (
  person?: { firstName?: string | null; lastName?: string | null } | null,
  fallbackName?: string | null
) => {
  const firstName = person?.firstName?.trim() || ''
  const lastName = person?.lastName?.trim() || ''
  const fullName = `${firstName} ${lastName}`.trim()

  if (fullName) {
    return fullName
  }

  return fallbackName?.trim() || 'Unknown'
}

const getTimeInputValue = (dateString: string) => {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const getDateTimeLocalValue = (dateString?: string | null) => {
  if (!dateString) {
    return ''
  }

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const sessionDurationMinutes = computed(() => {
  const duration = Number(session.value?.durationMinutes)
  return Number.isFinite(duration) && duration > 0 ? duration : 60
})

const buildConfirmedStart = (baseDateString: string, timeValue: string) => {
  const [hours, minutes] = timeValue.split(':').map(Number)
  const baseDate = new Date(baseDateString)
  const scheduledStart = new Date(baseDate)
  scheduledStart.setHours(hours, minutes, 0, 0)

  return scheduledStart.toISOString()
}

const buildConfirmedSchedulePreview = (confirmedStart: string) => {
  const scheduledStart = new Date(confirmedStart)

  const scheduledEnd = new Date(scheduledStart)
  scheduledEnd.setMinutes(scheduledEnd.getMinutes() + sessionDurationMinutes.value)

  return {
    scheduledStart: confirmedStart,
    scheduledEnd: scheduledEnd.toISOString()
  }
}

const confirmedSchedulePreview = computed(() => {
  if (!session.value || !mentorPreferredTime.value) {
    return null
  }

  return buildConfirmedSchedulePreview(
    buildConfirmedStart(session.value.scheduledStart, mentorPreferredTime.value)
  )
})

const isPendingSession = computed(() => session.value?.status === 'PENDING')
const hasSessionEnded = computed(() => {
  const scheduledEnd = session.value?.scheduledEnd
  if (!scheduledEnd) {
    return false
  }

  return new Date(scheduledEnd).getTime() <= Date.now()
})

const canMarkComplete = computed(() => {
  const status = String(session.value?.status || '').toUpperCase()
  return hasSessionEnded.value && ['CONFIRMED', 'SCHEDULED', 'IN_PROGRESS'].includes(status)
})

const validatePreferredTime = () => {
  preferredTimeError.value = mentorPreferredTime.value ? '' : 'Please select a preferred time'
  return !preferredTimeError.value
}

// Get status badge variant
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'CONFIRMED':
    case 'SCHEDULED':
    case 'IN_PROGRESS':
      return 'success'
    case 'CANCELLED':
      return 'destructive'
    case 'COMPLETED':
      return 'default'
    default:
      return 'secondary'
  }
}

const hydrateOutcomeForm = (sessionData: any) => {
  const outcome = sessionData?.outcome
  outcomeSummary.value = outcome?.summary || ''
  reflectionPrompt.value = outcome?.reflectionPrompt || ''
  mentorPrivateNotes.value = ''

  const existingItems = Array.isArray(outcome?.actionItems)
    ? outcome.actionItems.map((item: any) => ({
        description: item?.description || '',
        ownerType: item?.ownerType || 'MENTEE',
        dueAt: getDateTimeLocalValue(item?.dueAt),
      }))
    : []

  outcomeActionItems.value = existingItems.length
    ? existingItems
    : [{ description: '', ownerType: 'MENTEE', dueAt: '' }]
}

const addOutcomeActionItem = () => {
  outcomeActionItems.value.push({
    description: '',
    ownerType: 'MENTEE',
    dueAt: '',
  })
}

const removeOutcomeActionItem = (index: number) => {
  outcomeActionItems.value.splice(index, 1)

  if (!outcomeActionItems.value.length) {
    addOutcomeActionItem()
  }
}

const buildCompletePayload = () => ({
  outcomeSummary: outcomeSummary.value.trim() || null,
  reflectionPrompt: reflectionPrompt.value.trim() || null,
  mentorPrivateNotes: mentorPrivateNotes.value.trim() || null,
  actionItems: outcomeActionItems.value
    .filter(item => item.description.trim())
    .map(item => ({
      description: item.description.trim(),
      ownerType: item.ownerType,
      dueAt: item.dueAt ? new Date(item.dueAt).toISOString() : null,
    })),
})

// Load session details
const loadSession = async () => {
  isLoadingSession.value = true
  try {
    const response = await sessionsStore.getSessionById(sessionId.value)
    session.value = response
    mentorPreferredTime.value = getTimeInputValue(response?.scheduledStart || '')
    preferredTimeError.value = ''
    hydrateOutcomeForm(response)

    // Set initial action based on query parameter
    if (actionParam.value === 'accept') {
      selectedAction.value = 'accept'
    } else if (actionParam.value === 'decline') {
      selectedAction.value = 'decline'
    }
  } catch (error) {
    console.error('Error loading session:', error)
    toast.error('Failed to load session details')
  } finally {
    isLoadingSession.value = false
  }
}

// Handle accept session
const handleAccept = async () => {
  if (!session.value) return
  if (!validatePreferredTime()) {
    toast.error(preferredTimeError.value)
    return
  }

  const confirmedScheduledStart = buildConfirmedStart(session.value.scheduledStart, mentorPreferredTime.value)
  const confirmedSchedule = buildConfirmedSchedulePreview(confirmedScheduledStart)

  isSubmitting.value = true
  try {
    await sessionsStore.confirmSession(sessionId.value, {
      mentorResponse: mentorResponse.value,
      scheduledStart: confirmedScheduledStart
    })

    // Show success state instead of redirecting
    actionCompleted.value = true
    completedAction.value = 'accepted'

    // Update session status locally
    session.value.status = 'CONFIRMED'
    session.value.scheduledStart = confirmedSchedule.scheduledStart
    session.value.scheduledEnd = confirmedSchedule.scheduledEnd
  } catch (error) {
    console.error('Error confirming session:', error)
    // Error toast already shown by store
  } finally {
    isSubmitting.value = false
  }
}

// Handle decline session
const handleDecline = async () => {
  if (!session.value) return

  if (!declineReason.value.trim()) {
    toast.error('Please provide a reason for declining')
    return
  }

  isSubmitting.value = true
  try {
    await sessionsStore.declineSession(sessionId.value, declineReason.value)

    // Show success state instead of redirecting
    actionCompleted.value = true
    completedAction.value = 'declined'

    // Update session status locally
    session.value.status = 'CANCELLED'
  } catch (error) {
    console.error('Error declining session:', error)
    // Error toast already shown by store
  } finally {
    isSubmitting.value = false
  }
}

const handleComplete = async () => {
  if (!session.value) return

  isSubmitting.value = true
  try {
    await sessionsStore.completeSession(sessionId.value, buildCompletePayload())

    actionCompleted.value = true
    completedAction.value = 'completed'
    session.value.status = 'COMPLETED'
    session.value.outcome = {
      summary: outcomeSummary.value.trim() || null,
      reflectionPrompt: reflectionPrompt.value.trim() || null,
      actionItems: buildCompletePayload().actionItems.map((item: any, index: number) => ({
        id: `${index}`,
        description: item.description,
        ownerType: item.ownerType,
        dueAt: item.dueAt,
        completedAt: null,
        completed: false,
      })),
    }
  } catch (error) {
    console.error('Error completing session:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Set selected action
const setAction = (action: 'accept' | 'decline') => {
  selectedAction.value = action
}

// Mount lifecycle
onMounted(() => {
  loadSession()
})
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-4xl space-y-6">
      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <img src="/images/prosper_mentor_logo.png" alt="Prosper Mentor" width="120" height="120" class="object-contain">
      </div>

      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold tracking-tight">Review Session Request</h1>
        <p class="text-muted-foreground mt-2">Review the session details and respond to the request</p>
      </div>

    <!-- Loading State -->
    <div v-if="isLoadingSession" class="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton class="h-8 w-3/4" />
          <Skeleton class="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent class="space-y-4">
          <Skeleton class="h-20 w-full" />
          <Skeleton class="h-20 w-full" />
          <Skeleton class="h-20 w-full" />
        </CardContent>
      </Card>
    </div>

    <!-- Success State -->
    <div v-if="actionCompleted && session" class="space-y-6">
      <Card
        class="border-2"
        :class="completedAction === 'accepted'
          ? 'border-green-500'
          : completedAction === 'completed'
            ? 'border-blue-500'
            : 'border-orange-500'"
      >
        <CardContent class="pt-10 pb-10">
          <div class="flex flex-col items-center justify-center text-center space-y-6">
            <!-- Success Icon -->
            <div
              class="rounded-full p-6"
              :class="completedAction === 'accepted'
                ? 'bg-green-100'
                : completedAction === 'completed'
                  ? 'bg-blue-100'
                  : 'bg-orange-100'"
            >
              <CheckCircle
                v-if="completedAction === 'accepted' || completedAction === 'completed'"
                class="h-16 w-16"
                :class="completedAction === 'completed' ? 'text-blue-600' : 'text-green-600'"
              />
              <XCircle
                v-else
                class="h-16 w-16 text-orange-600"
              />
            </div>

            <!-- Success Message -->
            <div class="space-y-3">
              <h2 class="text-3xl font-bold tracking-tight">
                <span v-if="completedAction === 'accepted'">Session Confirmed!</span>
                <span v-else-if="completedAction === 'completed'">Session Completed</span>
                <span v-else>Session Declined</span>
              </h2>
              <p class="text-lg text-muted-foreground max-w-md">
                <span v-if="completedAction === 'accepted'">
                  The session has been confirmed successfully. Meeting details and calendar invites have been sent to both you and the mentee.
                </span>
                <span v-else-if="completedAction === 'completed'">
                  The session has been marked as completed. A WhatsApp feedback request has been sent to the mentee.
                </span>
                <span v-else>
                  The session request has been declined. The mentee has been notified with your reason.
                </span>
              </p>
            </div>

            <!-- Session Summary -->
            <div class="w-full max-w-md pt-4 border-t">
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Session:</span>
                  <span class="font-medium">{{ session.title }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Mentee:</span>
                  <span class="font-medium">{{ getDisplayName(session.mentee, session.menteeName) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Date:</span>
                  <span class="font-medium">{{ formatDate(session.scheduledStart) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Time:</span>
                  <span class="font-medium">{{ formatTime(session.scheduledStart) }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="pt-4">
              <Button variant="outline" @click="router.push('/app/sessions')" class="gap-2">
                Go to My Sessions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Session Details -->
    <div v-else-if="session" class="space-y-6">
      <!-- Status Alert -->
      <Alert v-if="session.status !== 'PENDING'" variant="default">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>
          This session request has already been {{ session.status.toLowerCase() }}.
          <span v-if="session.status === 'CONFIRMED'"> Meeting details have been sent to both parties.</span>
          <span v-if="session.status === 'SCHEDULED' || session.status === 'IN_PROGRESS'"> This session is already underway in the lifecycle.</span>
          <span v-if="session.status === 'CANCELLED'"> The mentee has been notified.</span>
          <span v-if="session.status === 'COMPLETED'"> A feedback request has been sent to the mentee.</span>
        </AlertDescription>
      </Alert>

      <!-- Session Information Card -->
      <Card>
        <CardHeader>
          <div class="flex items-start justify-between">
            <div>
              <CardTitle class="text-2xl">{{ session.title }}</CardTitle>
              <CardDescription class="mt-2">Session request from mentee</CardDescription>
            </div>
            <Badge :variant="getStatusBadgeVariant(session.status)">
              {{ session.status }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Mentee Information -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm font-medium">
              <User class="h-4 w-4 text-muted-foreground" />
              <span>Mentee</span>
            </div>
            <div class="ml-6 text-sm">
              <p class="font-medium">{{ getDisplayName(session.mentee, session.menteeName) }}</p>
              <p class="text-muted-foreground" v-if="session.mentee?.email">
                {{ session.mentee.email }}
              </p>
            </div>
          </div>

          <!-- Topic/Skill -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm font-medium">
              <BookOpen class="h-4 w-4 text-muted-foreground" />
              <span>Topic</span>
            </div>
            <div class="ml-6 text-sm">
              <p>{{ session.skill?.name || session.skillName || session.title }}</p>
            </div>
          </div>

          <!-- Schedule -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm font-medium">
              <Calendar class="h-4 w-4 text-muted-foreground" />
              <span>{{ isPendingSession ? 'Selected Date' : 'Scheduled Date & Time' }}</span>
            </div>
            <div class="ml-6 space-y-1">
              <p class="text-sm">{{ formatDate(session.scheduledStart) }}</p>
              <p v-if="!isPendingSession" class="text-sm text-muted-foreground">
                {{ formatTime(session.scheduledStart) }} - {{ formatTime(session.scheduledEnd) }}
              </p>
              <p v-else class="text-sm text-muted-foreground">
                Exact time will be confirmed by the mentor below.
              </p>
              <p class="text-xs text-muted-foreground">Duration: {{ session.durationMinutes || 60 }} minutes</p>
            </div>
          </div>

          <!-- Mentee Message -->
          <div v-if="session.menteeMessage" class="space-y-2">
            <div class="flex items-center gap-2 text-sm font-medium">
              <MessageSquare class="h-4 w-4 text-muted-foreground" />
              <span>Message from Mentee</span>
            </div>
            <div class="ml-6">
              <Card class="bg-muted/50">
                <CardContent class="pt-4">
                  <p class="text-sm whitespace-pre-wrap">{{ session.menteeMessage }}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Action Selection (only show if status is PENDING) -->
      <Card v-if="session.status === 'PENDING'">
        <CardHeader>
          <CardTitle>Your Response</CardTitle>
          <CardDescription>Accept or decline this session request</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Action Buttons -->
          <div class="flex gap-4">
            <Button
              @click="setAction('accept')"
              :variant="selectedAction === 'accept' ? 'default' : 'outline'"
              class="flex-1"
              size="lg"
            >
              <CheckCircle class="mr-2 h-5 w-5" />
              Accept Session
            </Button>
            <Button
              @click="setAction('decline')"
              :variant="selectedAction === 'decline' ? 'destructive' : 'outline'"
              class="flex-1"
              size="lg"
            >
              <XCircle class="mr-2 h-5 w-5" />
              Decline Session
            </Button>
          </div>

          <!-- Accept Form -->
          <div v-if="selectedAction === 'accept'" class="space-y-4 pt-4 border-t">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label>Selected Date</Label>
                <div class="flex min-h-10 items-center rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  {{ formatDate(session.scheduledStart) }}
                </div>
                <p class="text-xs text-muted-foreground">
                  The mentee has already selected this date.
                </p>
              </div>

              <div class="space-y-2">
                <Label for="mentor-preferred-time">Preferred Time *</Label>
                <Input
                  id="mentor-preferred-time"
                  v-model="mentorPreferredTime"
                  type="time"
                  step="1800"
                  :disabled="isSubmitting"
                  @update:model-value="preferredTimeError = ''"
                />
                <p v-if="preferredTimeError" class="text-xs text-destructive">
                  {{ preferredTimeError }}
                </p>
                <p v-else-if="confirmedSchedulePreview" class="text-xs text-muted-foreground">
                  Session will be confirmed for
                  {{ formatTime(confirmedSchedulePreview.scheduledStart) }} -
                  {{ formatTime(confirmedSchedulePreview.scheduledEnd) }}.
                </p>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="mentor-response">Your Message (Optional)</Label>
              <Textarea
                id="mentor-response"
                v-model="mentorResponse"
                placeholder="Add a message for the mentee (e.g., topics to prepare, materials needed, etc.)"
                rows="4"
                :disabled="isSubmitting"
              />
              <p class="text-xs text-muted-foreground">
                This message will be included in the confirmation email sent to the mentee.
              </p>
            </div>

            <Alert>
              <CheckCircle class="h-4 w-4" />
              <AlertDescription>
                By accepting, a meeting link will be automatically generated and shared with both you and the mentee.
                Calendar invites will also be sent.
              </AlertDescription>
            </Alert>

            <Button
              @click="handleAccept"
              :disabled="isSubmitting || !mentorPreferredTime"
              class="w-full"
              size="lg"
            >
              <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              <CheckCircle v-else class="mr-2 h-4 w-4" />
              {{ isSubmitting ? 'Confirming...' : 'Confirm & Accept Session' }}
            </Button>
          </div>

          <!-- Decline Form -->
          <div v-if="selectedAction === 'decline'" class="space-y-4 pt-4 border-t">
            <div class="space-y-2">
              <Label for="decline-reason">Reason for Declining *</Label>
              <Textarea
                id="decline-reason"
                v-model="declineReason"
                placeholder="Please provide a reason for declining this session request"
                rows="4"
                :disabled="isSubmitting"
                required
              />
              <p class="text-xs text-muted-foreground">
                This reason will be shared with the mentee to help them understand your decision.
              </p>
            </div>

            <Alert variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <AlertDescription>
                The mentee will be notified that you have declined this session request.
              </AlertDescription>
            </Alert>

            <Button
              @click="handleDecline"
              :disabled="isSubmitting || !declineReason.trim()"
              variant="destructive"
              class="w-full"
              size="lg"
            >
              <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              <XCircle v-else class="mr-2 h-4 w-4" />
              {{ isSubmitting ? 'Declining...' : 'Decline Session Request' }}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card v-else-if="canMarkComplete">
        <CardHeader>
          <CardTitle>Complete Session</CardTitle>
          <CardDescription>Capture the mentor summary, next steps, and send the mentee the feedback form.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <Alert>
            <CheckCircle class="h-4 w-4" />
            <AlertDescription>
              Marking this session as complete will trigger the WhatsApp feedback template for the mentee.
            </AlertDescription>
          </Alert>

          <div class="space-y-2">
            <Label for="outcome-summary">Outcome Summary</Label>
            <Textarea
              id="outcome-summary"
              v-model="outcomeSummary"
              placeholder="Summarize what the mentee achieved or clarified in this session."
              rows="4"
              :disabled="isSubmitting"
            />
          </div>

          <div class="space-y-2">
            <Label for="reflection-prompt">Reflection Prompt</Label>
            <Textarea
              id="reflection-prompt"
              v-model="reflectionPrompt"
              placeholder="Leave the mentee with a question or reflection to think about before the next session."
              rows="3"
              :disabled="isSubmitting"
            />
          </div>

          <div class="space-y-2">
            <Label for="mentor-private-notes">Mentor Private Notes</Label>
            <Textarea
              id="mentor-private-notes"
              v-model="mentorPrivateNotes"
              placeholder="Optional mentor-only notes for your own follow-up."
              rows="3"
              :disabled="isSubmitting"
            />
            <p class="text-xs text-muted-foreground">
              Private notes are stored for internal follow-up and are not shown in the employee journey view.
            </p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <div>
                <Label>Action Items</Label>
                <p class="text-xs text-muted-foreground">
                  Add concrete follow-ups for the mentee, mentor, or both.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" @click="addOutcomeActionItem" :disabled="isSubmitting">
                <Plus class="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div class="space-y-3">
              <div
                v-for="(actionItem, index) in outcomeActionItems"
                :key="index"
                class="rounded-lg border p-4"
              >
                <div class="grid gap-3 md:grid-cols-[1.6fr_0.8fr_1fr_auto]">
                  <div class="space-y-2">
                    <Label :for="`action-item-description-${index}`">Description</Label>
                    <Input
                      :id="`action-item-description-${index}`"
                      v-model="actionItem.description"
                      placeholder="Follow up with a concrete next step"
                      :disabled="isSubmitting"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label :for="`action-item-owner-${index}`">Owner</Label>
                    <select
                      :id="`action-item-owner-${index}`"
                      v-model="actionItem.ownerType"
                      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      :disabled="isSubmitting"
                    >
                      <option value="MENTEE">Mentee</option>
                      <option value="MENTOR">Mentor</option>
                      <option value="SHARED">Shared</option>
                    </select>
                  </div>

                  <div class="space-y-2">
                    <Label :for="`action-item-due-at-${index}`">Due Date</Label>
                    <Input
                      :id="`action-item-due-at-${index}`"
                      v-model="actionItem.dueAt"
                      type="datetime-local"
                      :disabled="isSubmitting"
                    />
                  </div>

                  <div class="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      @click="removeOutcomeActionItem(index)"
                      :disabled="isSubmitting || outcomeActionItems.length === 1"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            @click="handleComplete"
            :disabled="isSubmitting"
            class="w-full"
            size="lg"
          >
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            <CheckCircle v-else class="mr-2 h-4 w-4" />
            {{ isSubmitting ? 'Completing...' : 'Mark Session as Complete' }}
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Error State -->
    <Alert v-else variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription>
        Failed to load session details. Please try again or contact support.
      </AlertDescription>
    </Alert>
    </div>
  </div>
</template>
