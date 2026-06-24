<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionsStore } from '@/store/modules/sessions/sessions'
import { useAppToast } from '@/composables/services/toastService'
import PublicSiteHeader from '@/components/landing/PublicSiteHeader.vue'

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePicker } from '@/components/ui/date-picker'

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
  Trash2,
  CalendarClock,
  LifeBuoy
} from 'lucide-vue-next'

definePageMeta({
  title: 'Review Session Request',
  description: 'Review and respond to session request',
  layout: 'default',
  auth: false,
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
const mentorPreferredDateTime = ref('')
const preferredTimeError = ref('')
const declineReason = ref('')
const selectedAction = ref<'accept' | 'decline' | 'propose' | 'support' | null>(null)
const actionCompleted = ref(false)
const completedAction = ref<'accepted' | 'declined' | 'proposed' | 'support' | 'completed' | null>(null)
const proposalMessage = ref('')
const proposalSlots = ref<Array<{ scheduledStart: string }>>([
  { scheduledStart: '' },
])
const supportMessage = ref('')

type OutcomeActionItemForm = {
  description: string
  ownerType: 'MENTEE' | 'MENTOR' | 'SHARED'
  dueAt: string
}

type ContextDocumentLink = {
  name: string
  url: string
  sizeLabel?: string
}

type QuestionnaireDisplayItem = {
  key: string
  label: string
  value: string
  href?: string | null
  meta?: string | null
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

const getLocalDateKey = (date: Date) => {
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const sessionDurationMinutes = computed(() => {
  const duration = Number(session.value?.durationMinutes)
  return Number.isFinite(duration) && duration > 0 ? duration : 60
})

const selectedSessionDateKey = computed(() => {
  const date = new Date(session.value?.scheduledStart || '')
  return getLocalDateKey(date)
})

const isOutsideSelectedSessionDate = (date: Date) => {
  const selectedDate = selectedSessionDateKey.value
  return selectedDate ? getLocalDateKey(date) !== selectedDate : false
}

const buildConfirmedStart = (dateTimeValue: string) => {
  const scheduledStart = new Date(dateTimeValue)
  if (Number.isNaN(scheduledStart.getTime())) {
    return ''
  }

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

const buildSlotEnd = (slotStart: string) => {
  const scheduledStart = new Date(slotStart)
  const scheduledEnd = new Date(scheduledStart)
  scheduledEnd.setMinutes(scheduledEnd.getMinutes() + sessionDurationMinutes.value)
  return scheduledEnd.toISOString()
}

const confirmedSchedulePreview = computed(() => {
  if (!session.value || !mentorPreferredDateTime.value) {
    return null
  }

  const confirmedStart = buildConfirmedStart(mentorPreferredDateTime.value)
  return confirmedStart ? buildConfirmedSchedulePreview(confirmedStart) : null
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
  preferredTimeError.value = mentorPreferredDateTime.value ? '' : 'Please select a preferred date and time'
  return !preferredTimeError.value
}

const normalizeDisplayText = (value: unknown) => String(value || '').trim()

const parseMessageBlocks = (message?: string | null) => {
  const raw = normalizeDisplayText(message)
  if (!raw) {
    return new Map<string, string>()
  }

  return raw
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .reduce((blocks, block) => {
      const match = block.match(/^([^:]+):\s*([\s\S]*)$/)
      if (match) {
        blocks.set(match[1].trim().toLowerCase(), match[2].trim())
      }
      return blocks
    }, new Map<string, string>())
}

const buildAbsoluteUrl = (url: string) => {
  const normalized = normalizeDisplayText(url)
  if (!normalized) return ''
  if (/^https?:\/\//i.test(normalized)) return normalized
  if (typeof window === 'undefined') return normalized
  return `${window.location.origin}${normalized.startsWith('/') ? normalized : `/${normalized}`}`
}

const parseContextDocumentText = (value: unknown): ContextDocumentLink | null => {
  const text = normalizeDisplayText(value)
  if (!text) return null

  const urlMatch = text.match(/https?:\/\/\S+|\/api\/\S+|\/v1\/\S+/i)
  const url = urlMatch ? buildAbsoluteUrl(urlMatch[0]) : ''
  if (!url) return null

  const label = text
    .replace(urlMatch?.[0] || '', '')
    .replace(/\s+-\s*$/, '')
    .trim()
  const sizeMatch = label.match(/\(([^)]+)\)\s*$/)
  const name = label.replace(/\s*\([^)]+\)\s*$/, '').trim() || 'Context document'

  return {
    name,
    url,
    sizeLabel: sizeMatch?.[1],
  }
}

const resolveContextDocumentLink = (value: unknown): ContextDocumentLink | null => {
  if (!value) return null

  if (typeof value === 'string') {
    try {
      return resolveContextDocumentLink(JSON.parse(value))
    } catch {
      return parseContextDocumentText(value)
    }
  }

  if (typeof value !== 'object') {
    return null
  }

  const source = value as Record<string, unknown>
  const url = buildAbsoluteUrl(String(source.url || ''))
  if (!url) {
    return null
  }

  const name = normalizeDisplayText(source.name)
    || normalizeDisplayText(source.storedName)
    || 'Context document'
  const sizeLabel = normalizeDisplayText(source.sizeLabel)

  return {
    name,
    url,
    sizeLabel,
  }
}

const questionnaireFallbackBlocks = computed(() => parseMessageBlocks(session.value?.menteeMessage))

const getQuestionnaireText = (key: string, fallbackLabel: string) => {
  const responses = session.value?.questionnaireResponses || {}
  const responseValue = normalizeDisplayText(responses[key])
  if (responseValue) {
    return responseValue
  }

  return questionnaireFallbackBlocks.value.get(fallbackLabel.toLowerCase()) || ''
}

const contextDocumentLink = computed(() => {
  const responses = session.value?.questionnaireResponses || {}
  return resolveContextDocumentLink(responses.contextDocument)
    || parseContextDocumentText(questionnaireFallbackBlocks.value.get('context document'))
})

const questionnaireResponseItems = computed<QuestionnaireDisplayItem[]>(() => {
  const items: QuestionnaireDisplayItem[] = [
    {
      key: 'primaryGoal',
      label: 'Primary goal',
      value: getQuestionnaireText('primaryGoal', 'Primary goal'),
    },
    {
      key: 'alreadyTried',
      label: 'What they have already tried',
      value: getQuestionnaireText('alreadyTried', 'Already tried'),
    },
    {
      key: 'successLooksLike',
      label: 'What success looks like',
      value: getQuestionnaireText('successLooksLike', 'Success looks like'),
    },
  ].filter(item => item.value)

  if (contextDocumentLink.value) {
    items.push({
      key: 'contextDocument',
      label: 'Context document',
      value: contextDocumentLink.value.name,
      href: contextDocumentLink.value.url,
      meta: contextDocumentLink.value.sizeLabel || null,
    })
  }

  return items
})

const menteeMessageIntro = computed(() => {
  const message = normalizeDisplayText(session.value?.menteeMessage)
  if (!message) {
    return ''
  }

  return questionnaireFallbackBlocks.value.size ? '' : message
})

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

const resetProposalSlots = (sessionData: any) => {
  proposalSlots.value = [{
    scheduledStart: getDateTimeLocalValue(sessionData?.scheduledStart),
  }]
}

const addProposalSlot = () => {
  proposalSlots.value.push({
    scheduledStart: getDateTimeLocalValue(session.value?.scheduledStart),
  })
}

const removeProposalSlot = (index: number) => {
  proposalSlots.value.splice(index, 1)
  if (!proposalSlots.value.length) {
    addProposalSlot()
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
    mentorPreferredDateTime.value = getDateTimeLocalValue(response?.scheduledStart || '')
    preferredTimeError.value = ''
    resetProposalSlots(response)
    hydrateOutcomeForm(response)

    // Set initial action based on query parameter
    if (actionParam.value === 'accept') {
      selectedAction.value = 'accept'
    } else if (actionParam.value === 'decline') {
      selectedAction.value = 'decline'
    } else if (actionParam.value === 'propose') {
      selectedAction.value = 'propose'
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

  const confirmedScheduledStart = buildConfirmedStart(mentorPreferredDateTime.value)
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

const handleProposeAlternative = async () => {
  if (!session.value) return

  const validSlots = proposalSlots.value
    .map(slot => slot.scheduledStart)
    .filter(Boolean)

  if (!validSlots.length) {
    toast.error('Add at least one proposed time')
    return
  }

  isSubmitting.value = true
  try {
    await sessionsStore.proposeAlternative(sessionId.value, {
      mentorMessage: proposalMessage.value.trim() || null,
      slots: validSlots.map(slotStart => ({
        scheduledStart: new Date(slotStart).toISOString(),
        scheduledEnd: buildSlotEnd(slotStart),
      })),
    })

    actionCompleted.value = true
    completedAction.value = 'proposed'
  } catch (error) {
    console.error('Error proposing alternative session time:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleContactSupport = async () => {
  if (!session.value) return

  isSubmitting.value = true
  try {
    await sessionsStore.contactSupport(sessionId.value, {
      requesterType: 'MENTOR',
      message: supportMessage.value.trim() || null,
    })

    actionCompleted.value = true
    completedAction.value = 'support'
  } catch (error) {
    console.error('Error requesting support contact:', error)
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
const setAction = (action: 'accept' | 'decline' | 'propose' | 'support') => {
  selectedAction.value = action
}

// Mount lifecycle
onMounted(() => {
  loadSession()
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden" style="font-family: 'Montserrat', 'Inter', ui-sans-serif, system-ui, sans-serif;">
    <img
      src="/img_2.jpg"
      alt="ProsperMentor background"
      class="absolute inset-0 h-full w-full object-cover"
    >
    <div class="absolute inset-0 bg-[#0f3f35]/60" />

    <PublicSiteHeader />

    <main class="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <section class="w-full max-w-[1180px] rounded-[28px] border border-white/30 bg-white/95 p-4 shadow-2xl sm:p-5 lg:p-6">
        <div class="mb-5 space-y-1.5 text-center sm:text-left">
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#027F63]">Mentorship Session</p>
          <h1 class="text-[24px] font-semibold leading-tight text-[#1f2937] sm:text-[28px]">
            Review Session Request
          </h1>
          <p class="text-[13px] leading-relaxed text-[#4b5563]">
            Review the session details and respond to the request.
          </p>
        </div>

    <!-- Loading State -->
    <div v-if="isLoadingSession" class="space-y-4">
      <Card class="rounded-[20px] border-[#e5e7eb] bg-white shadow-sm">
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
    <div v-else-if="actionCompleted && session" class="space-y-6">
      <Card
        class="rounded-[20px] border-2 bg-white shadow-sm"
        :class="completedAction === 'accepted'
          ? 'border-green-500'
          : completedAction === 'completed'
            ? 'border-blue-500'
            : 'border-orange-500'"
      >
        <CardContent class="py-8">
          <div class="flex flex-col items-center justify-center space-y-5 text-center">
            <!-- Success Icon -->
            <div
              class="rounded-full p-4"
              :class="completedAction === 'accepted'
                ? 'bg-green-100'
                : completedAction === 'completed'
                  ? 'bg-blue-100'
                  : 'bg-orange-100'"
            >
              <CheckCircle
                v-if="completedAction === 'accepted' || completedAction === 'completed'"
                class="h-10 w-10"
                :class="completedAction === 'completed' ? 'text-blue-600' : 'text-green-600'"
              />
              <XCircle
                v-else
                class="h-10 w-10 text-orange-600"
              />
            </div>

            <!-- Success Message -->
            <div class="space-y-3">
              <h2 class="text-[24px] font-semibold leading-tight text-[#1f2937]">
                <span v-if="completedAction === 'accepted'">Session Confirmed!</span>
                <span v-else-if="completedAction === 'completed'">Session Completed</span>
                <span v-else-if="completedAction === 'proposed'">Alternative Time Sent</span>
                <span v-else-if="completedAction === 'support'">Support Request Sent</span>
                <span v-else>Session Declined</span>
              </h2>
              <p class="max-w-md text-[13px] leading-relaxed text-[#4b5563]">
                <span v-if="completedAction === 'accepted'">
                  The session has been confirmed successfully. Meeting details and calendar invites have been sent to both you and the mentee.
                </span>
                <span v-else-if="completedAction === 'completed'">
                  The session has been marked as completed. A WhatsApp feedback request has been sent to the mentee.
                </span>
                <span v-else-if="completedAction === 'proposed'">
                  Your proposed time has been sent to the mentee. The session will stay pending until they respond.
                </span>
                <span v-else-if="completedAction === 'support'">
                  The Mentor Experience team has been notified and will follow up with you.
                </span>
                <span v-else>
                  The session request has been declined. The mentee has been notified with your reason.
                </span>
              </p>
            </div>

            <!-- Session Summary -->
            <div class="w-full max-w-md border-t border-[#e5e7eb] pt-4">
              <div class="space-y-3 text-[13px]">
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
              <Button variant="outline" @click="router.push('/app/sessions')" class="h-10 rounded-full border-[#d1d5db] px-5 text-[13px] text-[#4b5563]">
                Go to My Sessions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Session Details -->
    <div v-else-if="session" class="space-y-5">
      <!-- Status Alert -->
      <Alert v-if="session.status && session.status !== 'PENDING'" variant="default">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>
          This session request has already been {{ session.status.toLowerCase() }}.
          <span v-if="session.status === 'CONFIRMED'"> Meeting details have been sent to both parties.</span>
          <span v-if="session.status === 'SCHEDULED' || session.status === 'IN_PROGRESS'"> This session is already underway in the lifecycle.</span>
          <span v-if="session.status === 'CANCELLED'"> The mentee has been notified.</span>
          <span v-if="session.status === 'COMPLETED'"> A feedback request has been sent to the mentee.</span>
        </AlertDescription>
      </Alert>

      <div class="grid gap-5 lg:grid-cols-2 lg:items-start">
        <!-- Session Information Card -->
        <Card class="min-w-0 rounded-[20px] border-[#e5e7eb] bg-white shadow-sm">
        <CardHeader class="pb-3">
          <div class="flex items-start justify-between">
            <div>
              <CardTitle class="text-[20px] font-semibold leading-tight text-[#1f2937]">{{ session.title }}</CardTitle>
              <CardDescription class="mt-1 text-[13px] text-[#6b7280]">Session request from mentee</CardDescription>
            </div>
            <Badge :variant="getStatusBadgeVariant(session.status)">
              {{ session.status }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
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
          <div v-if="menteeMessageIntro || questionnaireResponseItems.length" class="space-y-2">
            <div class="flex items-center gap-2 text-sm font-medium">
              <MessageSquare class="h-4 w-4 text-muted-foreground" />
              <span>Message from Mentee</span>
            </div>
            <div class="ml-6">
              <Card class="rounded-[16px] border-[#e5e7eb] bg-[#f9fafb] shadow-none">
                <CardContent class="space-y-3 p-3">
                  <p v-if="menteeMessageIntro" class="text-sm whitespace-pre-wrap">{{ menteeMessageIntro }}</p>
                  <div v-if="questionnaireResponseItems.length" class="space-y-3">
                    <div
                      v-for="item in questionnaireResponseItems"
                      :key="item.key"
                      class="rounded-[14px] border border-[#e5e7eb] bg-white p-3"
                    >
                      <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {{ item.label }}
                      </p>
                      <a
                        v-if="item.href"
                        :href="item.href"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="mt-1 inline-flex max-w-full items-center truncate text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {{ item.value }}
                      </a>
                      <p v-else class="mt-1 text-sm whitespace-pre-wrap">{{ item.value }}</p>
                      <p v-if="item.meta" class="mt-1 text-xs text-muted-foreground">{{ item.meta }}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Action Selection (only show if status is PENDING) -->
      <Card v-if="session.status === 'PENDING'" class="min-w-0 rounded-[20px] border-[#e5e7eb] bg-white shadow-sm">
        <CardHeader class="pb-3">
          <CardTitle class="text-[20px] font-semibold leading-tight text-[#1f2937]">Your Response</CardTitle>
          <CardDescription class="text-[13px] text-[#6b7280]">Choose how to respond to this session request</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Action Buttons -->
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Button
              @click="setAction('accept')"
              :variant="selectedAction === 'accept' ? 'default' : 'outline'"
              class="h-10 rounded-full text-[13px]"
            >
              <CheckCircle class="mr-2 h-5 w-5" />
              Accept
            </Button>
            <Button
              @click="setAction('propose')"
              :variant="selectedAction === 'propose' ? 'default' : 'outline'"
              class="h-10 rounded-full text-[13px]"
            >
              <CalendarClock class="mr-2 h-5 w-5" />
              Propose
            </Button>
            <Button
              @click="setAction('decline')"
              :variant="selectedAction === 'decline' ? 'destructive' : 'outline'"
              class="h-10 rounded-full text-[13px]"
            >
              <XCircle class="mr-2 h-5 w-5" />
              Decline
            </Button>
            <Button
              @click="setAction('support')"
              :variant="selectedAction === 'support' ? 'default' : 'outline'"
              class="h-10 rounded-full text-[13px]"
            >
              <LifeBuoy class="mr-2 h-5 w-5" />
              Support
            </Button>
          </div>

          <!-- Accept Form -->
          <div v-if="selectedAction === 'accept'" class="space-y-4 border-t border-[#e5e7eb] pt-4">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label class="text-xs font-medium text-[#6b7280]">Selected Date</Label>
                <div class="flex min-h-10 items-center rounded-[14px] border border-[#d1d5db] bg-[#f9fafb] px-3 py-2 text-[13px] text-[#111827]">
                  {{ formatDate(session.scheduledStart) }}
                </div>
                <p class="text-xs text-muted-foreground">
                  The mentee has already selected this date.
                </p>
              </div>

              <div class="space-y-2">
                <Label class="text-xs font-medium text-[#6b7280]">Confirmed Date & Time *</Label>
                <DatePicker
                  v-model="mentorPreferredDateTime"
                  placeholder="Select confirmed date and time"
                  :include-time="true"
                  :disabled="isSubmitting"
                  :calendar-disabled="isOutsideSelectedSessionDate"
                  class="h-10 rounded-[14px] border-[#d1d5db] bg-white px-3 text-[13px] text-[#111827] focus-visible:ring-[#027F63]/25"
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
              <Label for="mentor-response" class="text-xs font-medium text-[#6b7280]">Your Message (Optional)</Label>
              <Textarea
                id="mentor-response"
                v-model="mentorResponse"
                placeholder="Add a message for the mentee (e.g., topics to prepare, materials needed, etc.)"
                rows="4"
                class="min-h-[96px] rounded-[14px] border-[#d1d5db] bg-white px-3 py-2 text-[13px] text-[#111827] placeholder:text-[#9ca3af] focus-visible:ring-[#027F63]/25"
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
              :disabled="isSubmitting || !mentorPreferredDateTime"
              class="h-10 w-full rounded-full bg-[#027F63] text-[13px] font-medium text-white hover:bg-[#046f58]"
            >
              <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              <CheckCircle v-else class="mr-2 h-4 w-4" />
              {{ isSubmitting ? 'Confirming...' : 'Confirm & Accept Session' }}
            </Button>
          </div>

          <!-- Proposal Form -->
          <div v-if="selectedAction === 'propose'" class="space-y-4 border-t border-[#e5e7eb] pt-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <Label class="text-xs font-medium text-[#6b7280]">Alternative Time Slots</Label>
                  <p class="text-xs text-muted-foreground">
                    Add one or more times the mentee can choose from.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" class="h-9 rounded-full border-[#d1d5db] text-[12px]" @click="addProposalSlot" :disabled="isSubmitting">
                  <Plus class="mr-2 h-4 w-4" />
                  Add Slot
                </Button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(slot, index) in proposalSlots"
                  :key="index"
                  class="grid gap-3 rounded-[16px] border border-[#e5e7eb] p-3 md:grid-cols-[1fr_auto]"
                >
                  <div class="space-y-2">
                    <Label :for="`proposal-slot-${index}`" class="text-xs font-medium text-[#6b7280]">Proposed Time *</Label>
                    <DatePicker
                      v-model="slot.scheduledStart"
                      placeholder="Select proposed date and time"
                      :include-time="true"
                      :disabled="isSubmitting"
                      class="h-10 rounded-[14px] border-[#d1d5db] bg-white px-3 text-[13px] text-[#111827] focus-visible:ring-[#027F63]/25"
                    />
                    <p v-if="slot.scheduledStart" class="text-xs text-muted-foreground">
                      Duration: {{ sessionDurationMinutes }} minutes
                    </p>
                  </div>
                  <div class="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      @click="removeProposalSlot(index)"
                      :disabled="isSubmitting || proposalSlots.length === 1"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="proposal-message" class="text-xs font-medium text-[#6b7280]">Message (Optional)</Label>
              <Textarea
                id="proposal-message"
                v-model="proposalMessage"
                placeholder="Share context for the proposed time change."
                rows="4"
                class="min-h-[96px] rounded-[14px] border-[#d1d5db] bg-white px-3 py-2 text-[13px] text-[#111827] placeholder:text-[#9ca3af] focus-visible:ring-[#027F63]/25"
                :disabled="isSubmitting"
              />
            </div>

            <Alert>
              <CalendarClock class="h-4 w-4" />
              <AlertDescription>
                The mentee will be able to accept a proposed slot, decline it, view other mentors, or request support.
              </AlertDescription>
            </Alert>

            <Button
              @click="handleProposeAlternative"
              :disabled="isSubmitting || !proposalSlots.some(slot => slot.scheduledStart)"
              class="h-10 w-full rounded-full bg-[#027F63] text-[13px] font-medium text-white hover:bg-[#046f58]"
            >
              <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              <CalendarClock v-else class="mr-2 h-4 w-4" />
              {{ isSubmitting ? 'Sending...' : 'Send Proposed Time' }}
            </Button>
          </div>

          <!-- Decline Form -->
          <div v-if="selectedAction === 'decline'" class="space-y-4 border-t border-[#e5e7eb] pt-4">
            <div class="space-y-2">
              <Label for="decline-reason" class="text-xs font-medium text-[#6b7280]">Reason for Declining *</Label>
              <Textarea
                id="decline-reason"
                v-model="declineReason"
                placeholder="Please provide a reason for declining this session request"
                rows="4"
                class="min-h-[96px] rounded-[14px] border-[#d1d5db] bg-white px-3 py-2 text-[13px] text-[#111827] placeholder:text-[#9ca3af] focus-visible:ring-[#027F63]/25"
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
              class="h-10 w-full rounded-full text-[13px] font-medium"
            >
              <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              <XCircle v-else class="mr-2 h-4 w-4" />
              {{ isSubmitting ? 'Declining...' : 'Decline Session Request' }}
            </Button>
          </div>

          <!-- Support Form -->
          <div v-if="selectedAction === 'support'" class="space-y-4 border-t border-[#e5e7eb] pt-4">
            <div class="space-y-2">
              <Label for="support-message" class="text-xs font-medium text-[#6b7280]">Message (Optional)</Label>
              <Textarea
                id="support-message"
                v-model="supportMessage"
                placeholder="Share what you need help with."
                rows="4"
                class="min-h-[96px] rounded-[14px] border-[#d1d5db] bg-white px-3 py-2 text-[13px] text-[#111827] placeholder:text-[#9ca3af] focus-visible:ring-[#027F63]/25"
                :disabled="isSubmitting"
              />
            </div>

            <Alert>
              <LifeBuoy class="h-4 w-4" />
              <AlertDescription>
                The Mentor Experience team will be notified about this session.
              </AlertDescription>
            </Alert>

            <Button
              @click="handleContactSupport"
              :disabled="isSubmitting"
              class="h-10 w-full rounded-full bg-[#027F63] text-[13px] font-medium text-white hover:bg-[#046f58]"
            >
              <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              <LifeBuoy v-else class="mr-2 h-4 w-4" />
              {{ isSubmitting ? 'Sending...' : 'Request Support Contact' }}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card v-else-if="canMarkComplete" class="min-w-0 rounded-[20px] border-[#e5e7eb] bg-white shadow-sm">
        <CardHeader class="pb-3">
          <CardTitle class="text-[20px] font-semibold leading-tight text-[#1f2937]">Complete Session</CardTitle>
          <CardDescription class="text-[13px] text-[#6b7280]">Capture the mentor summary, next steps, and send the mentee the feedback form.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <Alert>
            <CheckCircle class="h-4 w-4" />
            <AlertDescription>
              Marking this session as complete will trigger the WhatsApp feedback template for the mentee.
            </AlertDescription>
          </Alert>

          <div class="space-y-2">
            <Label for="outcome-summary" class="text-xs font-medium text-[#6b7280]">Outcome Summary</Label>
            <Textarea
              id="outcome-summary"
              v-model="outcomeSummary"
              placeholder="Summarize what the mentee achieved or clarified in this session."
              rows="4"
              class="min-h-[96px] rounded-[14px] border-[#d1d5db] bg-white px-3 py-2 text-[13px] text-[#111827] placeholder:text-[#9ca3af] focus-visible:ring-[#027F63]/25"
              :disabled="isSubmitting"
            />
          </div>

          <div class="space-y-2">
            <Label for="reflection-prompt" class="text-xs font-medium text-[#6b7280]">Reflection Prompt</Label>
            <Textarea
              id="reflection-prompt"
              v-model="reflectionPrompt"
              placeholder="Leave the mentee with a question or reflection to think about before the next session."
              rows="3"
              class="min-h-[84px] rounded-[14px] border-[#d1d5db] bg-white px-3 py-2 text-[13px] text-[#111827] placeholder:text-[#9ca3af] focus-visible:ring-[#027F63]/25"
              :disabled="isSubmitting"
            />
          </div>

          <div class="space-y-2">
            <Label for="mentor-private-notes" class="text-xs font-medium text-[#6b7280]">Mentor Private Notes</Label>
            <Textarea
              id="mentor-private-notes"
              v-model="mentorPrivateNotes"
              placeholder="Optional mentor-only notes for your own follow-up."
              rows="3"
              class="min-h-[84px] rounded-[14px] border-[#d1d5db] bg-white px-3 py-2 text-[13px] text-[#111827] placeholder:text-[#9ca3af] focus-visible:ring-[#027F63]/25"
              :disabled="isSubmitting"
            />
            <p class="text-xs text-muted-foreground">
              Private notes are stored for internal follow-up and are not shown in the employee journey view.
            </p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <div>
                <Label class="text-xs font-medium text-[#6b7280]">Action Items</Label>
                <p class="text-xs text-muted-foreground">
                  Add concrete follow-ups for the mentee, mentor, or both.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" class="h-9 rounded-full border-[#d1d5db] text-[12px]" @click="addOutcomeActionItem" :disabled="isSubmitting">
                <Plus class="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div class="space-y-3">
              <div
                v-for="(actionItem, index) in outcomeActionItems"
                :key="index"
                class="rounded-[16px] border border-[#e5e7eb] p-3"
              >
                <div class="grid gap-3 md:grid-cols-[1.6fr_0.8fr_1fr_auto]">
                  <div class="space-y-2">
                    <Label :for="`action-item-description-${index}`" class="text-xs font-medium text-[#6b7280]">Description</Label>
                    <Input
                      :id="`action-item-description-${index}`"
                      v-model="actionItem.description"
                      placeholder="Follow up with a concrete next step"
                      class="h-10 rounded-[14px] border-[#d1d5db] bg-white px-3 text-[13px] text-[#111827] placeholder:text-[#9ca3af] focus-visible:ring-[#027F63]/25"
                      :disabled="isSubmitting"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label :for="`action-item-owner-${index}`" class="text-xs font-medium text-[#6b7280]">Owner</Label>
                    <select
                      :id="`action-item-owner-${index}`"
                      v-model="actionItem.ownerType"
                      class="flex h-10 w-full rounded-[14px] border border-[#d1d5db] bg-white px-3 py-2 text-[13px] text-[#111827]"
                      :disabled="isSubmitting"
                    >
                      <option value="MENTEE">Mentee</option>
                      <option value="MENTOR">Mentor</option>
                      <option value="SHARED">Shared</option>
                    </select>
                  </div>

                  <div class="space-y-2">
                    <Label :for="`action-item-due-at-${index}`" class="text-xs font-medium text-[#6b7280]">Due Date</Label>
                    <DatePicker
                      v-model="actionItem.dueAt"
                      placeholder="Select due date and time"
                      :include-time="true"
                      :disabled="isSubmitting"
                      class="h-10 rounded-[14px] border-[#d1d5db] bg-white px-3 text-[13px] text-[#111827] focus-visible:ring-[#027F63]/25"
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
            class="h-10 w-full rounded-full bg-[#027F63] text-[13px] font-medium text-white hover:bg-[#046f58]"
          >
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            <CheckCircle v-else class="mr-2 h-4 w-4" />
            {{ isSubmitting ? 'Completing...' : 'Mark Session as Complete' }}
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>

    <!-- Error State -->
    <Alert v-else variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription>
        Failed to load session details. Please try again or contact support.
      </AlertDescription>
    </Alert>
      </section>
    </main>
  </div>
</template>
