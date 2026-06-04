<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { useMentorsStore } from '@/store/modules/mentors'
import { useAppToast } from '@/composables/services/toastService'
import type {
  CompanyProgramJourneyStepActionRecord,
  EmployeeCompanyProgramJourneyStepRecord,
  JourneyStepActionType,
  MentorAssignmentSummaryRecord,
} from '~/http/requests/app/companyPrograms'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Skeleton } from '~/components/ui/skeleton'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Clock,
  Compass,
  CreditCard,
  Milestone,
  RefreshCw,
  Search,
  Target,
  UserCheck,
  Users,
} from 'lucide-vue-next'

definePageMeta({
  title: 'My Program',
  description: 'View an employer-sponsored mentorship program',
  requiresAuth: true,
  permissions: ['mentors:view'],
})

const route = useRoute()
const router = useRouter()
const companyProgramsStore = useCompanyProgramsStore()
const mentorsStore = useMentorsStore()
const toast = useAppToast()
const showMentorSelectionDialog = ref(false)
const mentorSelectionSearch = ref('')
const selectedMarketplaceMentorId = ref('')
const activeMentorSelectionStep = ref<EmployeeCompanyProgramJourneyStepRecord | null>(null)
const activeMentorSelectionAction = ref<JourneyStepAction | null>(null)

const programId = computed(() => {
  const value = route.params.programId
  return Array.isArray(value) ? value[0] : String(value || '')
})

const program = computed(() =>
  companyProgramsStore.employeePrograms.find(item => item.companyProgramId === programId.value) || null
)

const journey = computed(() =>
  companyProgramsStore.employeeJourneys.find(item => item.companyProgramId === programId.value) || null
)

const match = computed(() =>
  companyProgramsStore.employeeMatches.find(item => item.companyProgramId === programId.value) || null
)

const mentorAssignment = computed(() =>
  journey.value?.mentorAssignment || match.value?.mentorAssignment || null
)

const isLoading = computed(() =>
  companyProgramsStore.employeeProgramsLoading
  || companyProgramsStore.employeeJourneysLoading
  || companyProgramsStore.employeeMatchesLoading
  || companyProgramsStore.employeeSessionBalanceLoading
)

const pageError = computed(() =>
  companyProgramsStore.employeeProgramsError
  || companyProgramsStore.employeeJourneysError
  || companyProgramsStore.employeeMatchesError
  || companyProgramsStore.employeeSessionBalanceError
)

const programDescription = computed(() =>
  program.value?.objective
  || program.value?.targetAudienceDescription
  || 'Your company has enrolled you in this mentorship program.'
)

const journeyLabel = computed(() =>
  companyProgramsStore.catalogJourneyLabel(program.value?.catalogStages, program.value?.catalogJourneySummary)
)

const progressPercent = computed(() =>
  Math.max(0, Math.min(journey.value?.progressPercent || 0, 100))
)

const openActionItems = computed(() =>
  journey.value?.actionItems?.filter(item => !item.completed) || []
)

const recentSessions = computed(() => journey.value?.recentSessions || [])

const marketplaceMentors = computed(() => mentorsStore.mentorProfiles || [])

const selectedMarketplaceMentor = computed(() =>
  marketplaceMentors.value.find((mentor: any) => mentor.id === selectedMarketplaceMentorId.value) || null
)

const mentorSelectionParticipantId = computed(() =>
  activeMentorSelectionAction.value?.companyProgramParticipantId
  || journey.value?.participantId
  || program.value?.participantId
  || match.value?.participantId
  || ''
)

const mentorSelectionProgramName = computed(() =>
  program.value?.name || journey.value?.programName || match.value?.programName || 'this program'
)

const availableBalance = computed(() =>
  Math.max(0, Number(companyProgramsStore.employeeSessionBalance?.availableBalance || 0))
)

const hasAssignedSessionAllocation = computed(() =>
  Number(companyProgramsStore.employeeSessionBalance?.allocatedTotal || 0) > 0
)

const journeyStepsWithActions = computed(() =>
  (journey.value?.steps || []).map(step => ({
    step,
    action: resolveJourneyStepAction(step),
  }))
)

const isJourneyStepBookingAction = (action?: JourneyStepAction | null) =>
  action?.type === 'BOOK_SESSION'
  || action?.type === 'BUY_SESSION'
  || action?.type === 'VIEW_SESSIONS'

const mentorAssignmentForStep = (step: EmployeeCompanyProgramJourneyStepRecord): MentorAssignmentSummaryRecord | null =>
  step.mentorAssignment || null

const shouldShowMentorOnJourneyStep = (
  step: EmployeeCompanyProgramJourneyStepRecord,
  action?: JourneyStepAction | null,
) => Boolean(mentorAssignmentForStep(step)?.mentorId)
  && step.status === 'READY'
  && step.stepType === 'SESSION'
  && (
    isJourneyStepBookingAction(action)
    || (action?.type === 'WAIT' && Boolean(action?.mentorId))
  )

const statusLabel = (value?: string | null) =>
  String(value || 'Pending')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())

const participantStatusTone = (status?: string | null) => ({
  ENROLLED: 'secondary',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  WITHDRAWN: 'destructive',
}[String(status)] as 'default' | 'secondary' | 'outline' | 'destructive' || 'secondary')

const stepTone = (status?: string | null) => ({
  READY: 'secondary',
  COMPLETED: 'outline',
  BLOCKED: 'destructive',
  SKIPPED: 'outline',
  PENDING: 'secondary',
}[String(status)] as 'default' | 'secondary' | 'outline' | 'destructive' || 'secondary')

const stepRequirementLabel = (step: EmployeeCompanyProgramJourneyStepRecord) =>
  step.required ? 'Required' : 'Optional'

const stepSessionRequirementLabel = (step: EmployeeCompanyProgramJourneyStepRecord) => {
  if (step.stepType === 'SESSION') {
    return step.required ? 'Session required' : 'Optional session'
  }

  return 'No session required'
}

const stepCompletionOwnerLabel = (step: EmployeeCompanyProgramJourneyStepRecord) =>
  step.canBeCompletedByEmployee ? 'You can complete this' : 'Managed by program team'

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'TBD'
  }

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'To be scheduled'
  }

  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatDateRange = (startsAt?: string | null, endsAt?: string | null) => {
  if (!startsAt && !endsAt) {
    return 'Dates will be shared when scheduled'
  }

  return `${formatDate(startsAt)} - ${formatDate(endsAt)}`
}

const stepTimelineDateLabel = (step: EmployeeCompanyProgramJourneyStepRecord) => {
  if (step.dueAt && !step.completedAt) {
    return `Due ${formatDate(step.dueAt)}`
  }

  if (step.completedAt) {
    return `Completed ${formatDateTime(step.completedAt)}`
  }

  return 'No due date'
}

const stepBlockedOrSkippedReason = (step: EmployeeCompanyProgramJourneyStepRecord) =>
  step.blockedReason || step.skippedReason || null

interface JourneyStepAction {
  type: JourneyStepActionType
  label: string
  description: string
  disabled?: boolean
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'
  targetRoute?: string | null
  journeyInstanceStepId?: string | null
  mentorId?: string | null
  companyProgramId?: string | null
  companyProgramParticipantId?: string | null
}

const journeyActionFallbackLabel = (type: JourneyStepActionType) => ({
  BOOK_SESSION: 'Book session',
  BUY_SESSION: 'Buy session',
  COMPLETE_STEP: 'Mark complete',
  VIEW_MATCHES: 'View matches',
  VIEW_SESSIONS: 'View sessions',
  WAIT: 'Waiting',
}[type])

const journeyActionVariant = (type: JourneyStepActionType): JourneyStepAction['variant'] =>
  type === 'WAIT' || type === 'VIEW_MATCHES' || type === 'VIEW_SESSIONS' ? 'outline' : 'default'

const normalizeBackendJourneyStepAction = (
  action?: CompanyProgramJourneyStepActionRecord | null,
  step?: EmployeeCompanyProgramJourneyStepRecord,
): JourneyStepAction | null => {
  if (!action?.actionType) {
    return null
  }

  return {
    type: action.actionType,
    label: action.label || journeyActionFallbackLabel(action.actionType),
    description: action.description || action.disabledReason || '',
    disabled: action.enabled === false
      || (action.actionType === 'COMPLETE_STEP' && step?.journeyInstanceStepId
        ? companyProgramsStore.isJourneyStepSaving(step.journeyInstanceStepId)
        : false),
    variant: journeyActionVariant(action.actionType),
    targetRoute: action.targetRoute,
    journeyInstanceStepId: action.journeyInstanceStepId || step?.journeyInstanceStepId || null,
    mentorId: action.mentorId,
    companyProgramId: action.companyProgramId,
    companyProgramParticipantId: action.companyProgramParticipantId,
  }
}

const sessionBalanceDescription = () => {
  if (availableBalance.value > 0) {
    return `${availableBalance.value} company-funded session${availableBalance.value === 1 ? '' : 's'} available.`
  }

  return hasAssignedSessionAllocation.value
    ? 'Your assigned company-funded sessions are depleted. Buy a session to continue.'
    : 'Buy a session to continue with your assigned mentor.'
}

const resolveJourneyStepAction = (step: EmployeeCompanyProgramJourneyStepRecord): JourneyStepAction | null => {
  const backendAction = normalizeBackendJourneyStepAction(step.primaryAction, step)
  if (backendAction) {
    return backendAction
  }

  if (step.status === 'COMPLETED' || step.status === 'SKIPPED') {
    if (step.stepType === 'SESSION') {
      return {
        type: 'VIEW_SESSIONS',
        label: 'View sessions',
        description: 'Review session history and outcomes for this program.',
        variant: 'outline',
      }
    }

    return null
  }

  if (step.status !== 'READY') {
    if (step.blockedReason === 'Waiting for mentor assignment') {
      return {
        type: 'VIEW_MATCHES',
        label: 'View matches',
        description: 'A mentor must be assigned before this session milestone can move forward.',
        variant: 'outline',
      }
    }

    return {
      type: 'WAIT',
      label: 'Waiting',
      description: stepBlockedOrSkippedReason(step) || 'Complete earlier milestones before this action unlocks.',
      disabled: true,
      variant: 'outline',
    }
  }

  if (step.stepType === 'SESSION') {
    const stepMentorAssignment = mentorAssignmentForStep(step)

    if (!stepMentorAssignment?.mentorId) {
      return {
        type: 'VIEW_MATCHES',
        label: 'Choose mentor',
        description: 'Select or wait for your assigned mentor before booking this program session.',
        variant: 'outline',
        journeyInstanceStepId: step.journeyInstanceStepId,
        companyProgramId: journey.value?.companyProgramId || program.value?.companyProgramId || match.value?.companyProgramId || programId.value,
        companyProgramParticipantId: journey.value?.participantId || program.value?.participantId || match.value?.participantId,
      }
    }

    return availableBalance.value > 0
      ? {
          type: 'BOOK_SESSION',
          label: 'Book session',
          description: sessionBalanceDescription(),
          journeyInstanceStepId: step.journeyInstanceStepId,
          mentorId: stepMentorAssignment.mentorId,
          companyProgramId: journey.value?.companyProgramId || program.value?.companyProgramId || match.value?.companyProgramId || programId.value,
          companyProgramParticipantId: journey.value?.participantId || program.value?.participantId || match.value?.participantId,
        }
      : {
          type: 'BUY_SESSION',
          label: 'Buy session',
          description: sessionBalanceDescription(),
          journeyInstanceStepId: step.journeyInstanceStepId,
          mentorId: stepMentorAssignment.mentorId,
          companyProgramId: journey.value?.companyProgramId || program.value?.companyProgramId || match.value?.companyProgramId || programId.value,
          companyProgramParticipantId: journey.value?.participantId || program.value?.participantId || match.value?.participantId,
        }
  }

  if (step.canBeCompletedByEmployee) {
    return {
      type: 'COMPLETE_STEP',
      label: 'Mark complete',
      description: 'Confirm that you have completed this milestone.',
      disabled: companyProgramsStore.isJourneyStepSaving(step.journeyInstanceStepId),
    }
  }

  if (step.stepType === 'SURVEY') {
    return {
      type: 'WAIT',
      label: 'Awaiting pulse',
      description: 'This milestone will open when the program pulse is ready.',
      disabled: true,
      variant: 'outline',
    }
  }

  return {
    type: 'WAIT',
    label: 'Managed by program team',
    description: 'The program team or mentor will update this milestone.',
    disabled: true,
    variant: 'outline',
  }
}

const loadMentorProfiles = async () => {
  await mentorsStore.loadMentorProfiles({
    page: 0,
    size: 8,
    searchTerm: mentorSelectionSearch.value.trim() || undefined,
  })
}

const loadMoreMentorProfiles = async () => {
  await mentorsStore.loadMoreMentorProfiles(mentorSelectionSearch.value.trim() || undefined)
}

const openMentorSelectionDialog = async (
  step: EmployeeCompanyProgramJourneyStepRecord,
  action: JourneyStepAction | null,
) => {
  activeMentorSelectionStep.value = step
  activeMentorSelectionAction.value = action
  selectedMarketplaceMentorId.value = ''
  showMentorSelectionDialog.value = true

  try {
    await loadMentorProfiles()
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load mentors')
  }
}

const confirmMarketplaceMentorSelection = async () => {
  if (!mentorSelectionParticipantId.value) {
    toast.error('Program participant details are not available yet.')
    return
  }

  if (!selectedMarketplaceMentorId.value) {
    toast.error('Select a mentor before continuing.')
    return
  }

  await companyProgramsStore.selectMyMarketplaceMentor(
    mentorSelectionParticipantId.value,
    selectedMarketplaceMentorId.value,
    activeMentorSelectionStep.value?.journeyInstanceStepId,
  )
  showMentorSelectionDialog.value = false
  activeMentorSelectionStep.value = null
  activeMentorSelectionAction.value = null
  selectedMarketplaceMentorId.value = ''
}

const loadProgramContext = async () => {
  try {
    await Promise.all([
      companyProgramsStore.loadMyCompanyPrograms(),
      companyProgramsStore.loadMyCompanyProgramMatches(),
      companyProgramsStore.loadMyCompanyProgramJourneys(),
      companyProgramsStore.loadMySessionBalance(),
    ])
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load this program')
  }
}

const openPrograms = () => {
  router.push('/app/employee/programs')
}

const openJourney = () => {
  router.push('/app/employee/journey')
}

const openMatches = () => {
  router.push('/app/employee/matches')
}

const openSessions = () => {
  router.push('/app/sessions')
}

const openAssignedMentorBooking = (
  action?: JourneyStepAction | null,
  step?: EmployeeCompanyProgramJourneyStepRecord,
) => {
  const companyProgramParticipantId = action?.companyProgramParticipantId
    || journey.value?.participantId
    || program.value?.participantId
    || match.value?.participantId
  const companyProgramId = action?.companyProgramId
    || journey.value?.companyProgramId
    || program.value?.companyProgramId
    || match.value?.companyProgramId
    || programId.value
  const companyProgramName = program.value?.name || journey.value?.programName || match.value?.programName || 'Company program'
  const mentorId = action?.mentorId || (step ? mentorAssignmentForStep(step)?.mentorId : null)
  const journeyInstanceStepId = action?.journeyInstanceStepId || step?.journeyInstanceStepId || null

  if (!mentorId && !action?.targetRoute) {
    toast.error('A mentor must be assigned before booking this program session.')
    openMatches()
    return
  }

  if (!companyProgramParticipantId) {
    toast.error('Program booking context is not available yet.')
    return
  }

  router.push({
    path: action?.targetRoute || `/app/mentors/${mentorId}`,
    query: {
      companyProgramId,
      companyProgramParticipantId,
      companyProgramName,
      ...(journeyInstanceStepId ? { journeyInstanceStepId } : {}),
    },
  })
}

const completeJourneyStep = async (step: EmployeeCompanyProgramJourneyStepRecord) => {
  if (!step.journeyInstanceStepId) {
    toast.error('Journey step details are not available yet.')
    return
  }

  await companyProgramsStore.completeJourneyStep(step.journeyInstanceStepId)
}

const handleJourneyStepAction = async (step: EmployeeCompanyProgramJourneyStepRecord, action: JourneyStepAction | null) => {
  if (!action || action.disabled) {
    return
  }

  if (action.type === 'BOOK_SESSION' || action.type === 'BUY_SESSION') {
    openAssignedMentorBooking(action, step)
    return
  }

  if (action.type === 'COMPLETE_STEP') {
    await completeJourneyStep(step)
    return
  }

  if (action.type === 'VIEW_MATCHES') {
    if (action.label.toLowerCase().includes('choose mentor')) {
      await openMentorSelectionDialog(step, action)
      return
    }

    if (action.targetRoute) {
      router.push(action.targetRoute)
      return
    }

    openMatches()
    return
  }

  if (action.type === 'VIEW_SESSIONS') {
    if (action.targetRoute) {
      router.push(action.targetRoute)
      return
    }

    openSessions()
  }
}

onMounted(() => {
  loadProgramContext()
})
</script>

<template>
  <div class="program-detail-page">
    <Button variant="ghost" class="back-button" @click="openPrograms">
      <ArrowLeft class="h-4 w-4" />
      <span>Programs</span>
    </Button>

    <div class="detail-hero">
      <div class="hero-copy">
        <p class="hero-eyebrow">{{ program?.companyName || 'Employer program' }}</p>
        <h1>{{ program?.name || 'My Program' }}</h1>
        <p>{{ programDescription }}</p>
        <div v-if="program" class="hero-actions">
          <Button @click="openJourney">
            <BookOpen class="h-4 w-4" />
            <span>Open Journey</span>
          </Button>
          <Button variant="outline" @click="openMatches">
            <UserCheck class="h-4 w-4" />
            <span>Mentor Matches</span>
          </Button>
        </div>
      </div>

      <div v-if="program" class="hero-progress">
        <span>Journey progress</span>
        <strong>{{ progressPercent }}%</strong>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
        </div>
        <p>
          {{ journey?.completedJourneySteps || 0 }} of {{ journey?.totalJourneySteps || 0 }} milestones completed
        </p>
      </div>
    </div>

    <Alert v-if="pageError" variant="destructive" class="mt-6">
      <AlertDescription>{{ pageError }}</AlertDescription>
    </Alert>

    <div v-if="isLoading" class="loading-grid">
      <Skeleton class="h-32 w-full rounded-xl" />
      <Skeleton class="h-32 w-full rounded-xl" />
      <Skeleton class="h-72 w-full rounded-xl lg:col-span-2" />
    </div>

    <div v-else-if="!program" class="empty-state">
      <Target class="mx-auto h-10 w-10 text-muted-foreground" />
      <h2>Program not found</h2>
      <p>This program was not found in your enrolled company programs.</p>
      <Button class="mt-4" @click="openPrograms">
        <ArrowLeft class="h-4 w-4" />
        <span>Back to Programs</span>
      </Button>
    </div>

    <template v-else>
      <section class="summary-grid">
        <div class="summary-tile">
          <span>Status</span>
          <strong>{{ companyProgramsStore.participantStatusLabel(program.participantStatus) }}</strong>
        </div>
        <div class="summary-tile">
          <span>Timeline</span>
          <strong>{{ formatDateRange(program.startsAt, program.endsAt) }}</strong>
        </div>
        <div class="summary-tile">
          <span>Matching</span>
          <strong>{{ companyProgramsStore.matchingModeLabel(program.matchingMode) }}</strong>
        </div>
      </section>

      <div class="detail-layout">
        <section class="detail-panel">
          <div class="section-heading">
            <Target class="h-5 w-5" />
            <div>
              <h2>Program Overview</h2>
              <p>{{ program.companyName || 'Employer program' }}</p>
            </div>
          </div>
          <p class="panel-copy">{{ programDescription }}</p>

          <dl class="detail-list">
            <div>
              <dt>Program</dt>
              <dd>{{ program.name }}</dd>
            </div>
            <div>
              <dt>Prosper journey</dt>
              <dd>{{ journeyLabel }}</dd>
            </div>
            <div>
              <dt>Journey template</dt>
              <dd>{{ program.journeyTemplateName || 'Not assigned' }}</dd>
            </div>
            <div>
              <dt>Enrolled</dt>
              <dd>{{ formatDate(program.enrolledAt) }}</dd>
            </div>
          </dl>
        </section>

        <section class="detail-panel">
          <div class="section-heading">
            <UserCheck class="h-5 w-5" />
            <div>
              <h2>Mentor Status</h2>
              <p>{{ statusLabel(match?.matchWorkspace?.status || program.participantStatus) }}</p>
            </div>
          </div>

          <div class="status-block status-block--compact">
            <Users class="h-8 w-8 text-muted-foreground" />
            <h3>{{ mentorAssignment ? 'Mentor selected' : 'Mentor assignment pending' }}</h3>
            <p>
              {{
                mentorAssignment
                  ? 'Your selected mentor appears on the session stage in your journey progress.'
                  : 'Your mentor status will update here when matching is ready for this program.'
              }}
            </p>
          </div>

          <Button variant="outline" class="mt-5 w-full" @click="openMatches">
            <Compass class="h-4 w-4" />
            <span>View Matches</span>
          </Button>
        </section>
      </div>

      <section v-if="program.catalogStages?.length" class="detail-panel full-panel">
        <div class="section-heading">
          <BookOpen class="h-5 w-5" />
          <div>
            <h2>Prosper Program Path</h2>
            <p>{{ program.catalogStages.length }} stage{{ program.catalogStages.length === 1 ? '' : 's' }}</p>
          </div>
        </div>
        <div class="stage-list">
          <div v-for="stage in program.catalogStages" :key="`${stage.programId}-${stage.journeyOrder}`" class="stage-row">
            <span>{{ stage.journeyOrder }}</span>
            <div>
              <strong>{{ stage.programName || `Stage ${stage.journeyOrder}` }}</strong>
              <p v-if="stage.journeyStageName">{{ stage.journeyStageName }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="detail-panel full-panel">
        <div class="section-heading">
          <Milestone class="h-5 w-5" />
          <div>
            <h2>Journey Progress</h2>
            <p>{{ progressPercent }}% complete</p>
          </div>
        </div>

        <div class="progress-track progress-track--large">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
        </div>

        <div v-if="journeyStepsWithActions.length" class="journey-timeline">
          <article
            v-for="({ step, action }, index) in journeyStepsWithActions"
            :key="step.journeyInstanceStepId"
            class="timeline-step"
            :class="`timeline-step--${String(step.status).toLowerCase()}`"
          >
            <div class="timeline-rail">
              <span class="timeline-dot">{{ step.defaultSequence || index + 1 }}</span>
            </div>

            <div class="timeline-card">
              <div class="timeline-card-header">
                <div>
                  <p class="timeline-step-kicker">
                    Step {{ step.defaultSequence || index + 1 }}<span v-if="step.stepKey"> - {{ step.stepKey }}</span>
                  </p>
                  <h3>{{ step.title }}</h3>
                  <p>{{ step.description || 'No description added for this journey step.' }}</p>
                </div>
                <Badge :variant="stepTone(step.status)">{{ statusLabel(step.status) }}</Badge>
              </div>

              <div class="timeline-badges">
                <Badge variant="outline">{{ companyProgramsStore.journeyStepTypeLabel(step.stepType) }}</Badge>
                <Badge variant="outline">{{ stepRequirementLabel(step) }}</Badge>
                <Badge variant="outline">{{ stepSessionRequirementLabel(step) }}</Badge>
              </div>

              <dl class="timeline-details">
                <div>
                  <dt>Timing</dt>
                  <dd>{{ stepTimelineDateLabel(step) }}</dd>
                </div>
                <div>
                  <dt>Completion</dt>
                  <dd>{{ stepCompletionOwnerLabel(step) }}</dd>
                </div>
                <div>
                  <dt>Sequence</dt>
                  <dd>{{ step.defaultSequence || 'Not set' }}</dd>
                </div>
                <div>
                  <dt>Condition</dt>
                  <dd>{{ stepBlockedOrSkippedReason(step) || 'No blocker or skip reason recorded' }}</dd>
                </div>
              </dl>

              <div v-if="shouldShowMentorOnJourneyStep(step, action) && step.mentorAssignment" class="timeline-mentor">
                <div v-if="step.mentorAssignment.avatarUrl" class="timeline-mentor-avatar">
                  <img :src="step.mentorAssignment.avatarUrl" :alt="step.mentorAssignment.mentorName" />
                </div>
                <div v-else class="timeline-mentor-avatar timeline-mentor-avatar--fallback">
                  {{ step.mentorAssignment.mentorName.charAt(0) }}
                </div>
                <div class="timeline-mentor-copy">
                  <span>Assigned mentor</span>
                  <strong>{{ step.mentorAssignment.mentorName }}</strong>
                  <p>
                    {{ step.mentorAssignment.title || 'Mentor' }}<span v-if="step.mentorAssignment.company"> - {{ step.mentorAssignment.company }}</span>
                  </p>
                  <p v-if="step.mentorAssignment.specializations?.length">
                    {{ step.mentorAssignment.specializations.slice(0, 3).join(', ') }}
                  </p>
                </div>
              </div>

              <div v-if="action" class="timeline-action">
                <div>
                  <strong>{{ action.label }}</strong>
                  <p>{{ action.description }}</p>
                </div>
                <Button
                  :variant="action.variant || 'default'"
                  :disabled="action.disabled"
                  @click="handleJourneyStepAction(step, action)"
                >
                  <CalendarPlus v-if="action.type === 'BOOK_SESSION'" class="h-4 w-4" />
                  <CreditCard v-else-if="action.type === 'BUY_SESSION'" class="h-4 w-4" />
                  <CheckCircle2 v-else-if="action.type === 'COMPLETE_STEP'" class="h-4 w-4" />
                  <UserCheck v-else-if="action.type === 'VIEW_MATCHES'" class="h-4 w-4" />
                  <Calendar v-else-if="action.type === 'VIEW_SESSIONS'" class="h-4 w-4" />
                  <Clock v-else class="h-4 w-4" />
                  <span>{{ action.label }}</span>
                </Button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="status-block status-block--compact">
          <ClipboardList class="h-8 w-8 text-muted-foreground" />
          <h3>No milestones yet</h3>
          <p>Milestones will show after your company program journey is configured.</p>
        </div>
      </section>

      <div class="detail-layout">
        <section class="detail-panel">
          <div class="section-heading">
            <Calendar class="h-5 w-5" />
            <div>
              <h2>Sessions</h2>
              <p>{{ journey?.completedSessions || 0 }} completed</p>
            </div>
          </div>

          <div v-if="journey?.nextSession" class="session-block">
            <Clock class="h-5 w-5" />
            <div>
              <h3>{{ journey.nextSession.title }}</h3>
              <p>{{ formatDateTime(journey.nextSession.scheduledStart) }}</p>
              <Badge variant="secondary">{{ statusLabel(journey.nextSession.status) }}</Badge>
            </div>
          </div>
          <div v-else class="status-block status-block--compact">
            <Calendar class="h-8 w-8 text-muted-foreground" />
            <h3>No upcoming session</h3>
            <p>Upcoming sessions for this program will appear here.</p>
          </div>

          <div v-if="recentSessions.length" class="recent-list">
            <div v-for="session in recentSessions.slice(0, 3)" :key="session.sessionId" class="recent-row">
              <span>{{ formatDate(session.scheduledStart) }}</span>
              <strong>{{ session.title }}</strong>
            </div>
          </div>

          <Button variant="outline" class="mt-5 w-full" @click="openSessions">
            <Calendar class="h-4 w-4" />
            <span>My Sessions</span>
          </Button>
        </section>

        <section class="detail-panel">
          <div class="section-heading">
            <CheckCircle2 class="h-5 w-5" />
            <div>
              <h2>Follow Through</h2>
              <p>{{ openActionItems.length }} open action item{{ openActionItems.length === 1 ? '' : 's' }}</p>
            </div>
          </div>

          <div v-if="openActionItems.length" class="action-list">
            <div v-for="item in openActionItems.slice(0, 4)" :key="item.actionItemId" class="action-row">
              <div>
                <strong>{{ item.description }}</strong>
                <p>{{ item.sessionTitle || 'Program action item' }}</p>
              </div>
              <span>{{ formatDate(item.dueAt) }}</span>
            </div>
          </div>

          <div v-else class="status-block status-block--compact">
            <CheckCircle2 class="h-8 w-8 text-muted-foreground" />
            <h3>No open action items</h3>
            <p>Action items from mentor sessions will appear here.</p>
          </div>

          <Button variant="outline" class="mt-5 w-full" @click="openJourney">
            <BookOpen class="h-4 w-4" />
            <span>Open Journey</span>
          </Button>
        </section>
      </div>
    </template>

    <Dialog :open="showMentorSelectionDialog" @update:open="showMentorSelectionDialog = $event">
      <DialogContent class="mentor-selection-dialog sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose Mentor</DialogTitle>
          <DialogDescription>
            Select a marketplace mentor for {{ mentorSelectionProgramName }}. After selection, your journey will refresh and booking will unlock.
          </DialogDescription>
        </DialogHeader>

        <div class="mentor-selection-search">
          <Input
            v-model="mentorSelectionSearch"
            placeholder="Search mentors by name, expertise, or location"
            @keyup.enter="loadMentorProfiles"
          />
          <Button variant="outline" @click="loadMentorProfiles" :disabled="mentorsStore.mentorProfilesLoading">
            <Search class="h-4 w-4" />
            <span>Search</span>
          </Button>
        </div>

        <Alert v-if="mentorsStore.mentorProfilesError || companyProgramsStore.employeeMatchOptionsError" variant="destructive">
          <AlertDescription>
            {{ mentorsStore.mentorProfilesError || companyProgramsStore.employeeMatchOptionsError }}
          </AlertDescription>
        </Alert>

        <div v-if="mentorsStore.mentorProfilesLoading && !marketplaceMentors.length" class="mentor-selection-grid mentor-selection-grid--loading">
          <Skeleton class="h-48 w-full rounded-lg" />
          <Skeleton class="h-48 w-full rounded-lg" />
          <Skeleton class="h-48 w-full rounded-lg" />
        </div>

        <div v-else-if="!marketplaceMentors.length" class="status-block status-block--compact">
          <Users class="h-8 w-8 text-muted-foreground" />
          <h3>No mentors found</h3>
          <p>Try another search term or clear your search to view all available mentors.</p>
        </div>

        <div v-else class="mentor-selection-grid">
          <button
            v-for="mentor in marketplaceMentors"
            :key="mentor.id"
            type="button"
            class="mentor-selection-card"
            :class="{ 'mentor-selection-card--selected': selectedMarketplaceMentorId === mentor.id }"
            @click="selectedMarketplaceMentorId = mentor.id"
          >
            <div class="mentor-selection-card-header">
              <div v-if="mentor.profilePhoto" class="mentor-avatar">
                <img :src="mentor.profilePhoto" :alt="mentor.name" />
              </div>
              <div v-else class="mentor-avatar mentor-avatar--fallback">
                {{ mentor.name?.charAt(0) || 'M' }}
              </div>
              <Badge :variant="selectedMarketplaceMentorId === mentor.id ? 'default' : 'outline'">
                {{ selectedMarketplaceMentorId === mentor.id ? 'Selected' : 'Select' }}
              </Badge>
            </div>
            <div class="mentor-selection-card-body">
              <strong>{{ mentor.name }}</strong>
              <p>{{ mentor.title || 'Mentor' }}<span v-if="mentor.company"> - {{ mentor.company }}</span></p>
              <p v-if="mentor.expertiseAreas?.length">
                {{ mentor.expertiseAreas.slice(0, 3).join(', ') }}
              </p>
            </div>
          </button>
        </div>

        <div class="mentor-selection-pagination">
          <span>
            Showing {{ marketplaceMentors.length }} of {{ mentorsStore.mentorProfilesPagination.totalItems || marketplaceMentors.length }} mentors
          </span>
          <Button
            variant="outline"
            @click="loadMoreMentorProfiles"
            :disabled="!mentorsStore.mentorProfilesPagination.hasNext || mentorsStore.mentorProfilesLoading"
          >
            <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': mentorsStore.mentorProfilesLoading }" />
            <span>Load more</span>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showMentorSelectionDialog = false">Cancel</Button>
          <Button
            @click="confirmMarketplaceMentorSelection"
            :disabled="!selectedMarketplaceMentor || companyProgramsStore.isEmployeeMatchSelectionSaving(mentorSelectionParticipantId)"
          >
            <UserCheck class="h-4 w-4" />
            <span>Confirm Mentor</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.program-detail-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 24px 44px;
}

.back-button {
  gap: 8px;
  margin-bottom: 16px;
  padding-left: 0;
}

.detail-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 24px;
  align-items: stretch;
  border: 1px solid #ead2e4;
  border-radius: 18px;
  background: linear-gradient(135deg, #fff 0%, #fbf2f8 54%, #eff7f0 100%);
  padding: 28px;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 12px;
}

.hero-eyebrow {
  color: #8a337f;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.hero-copy h1 {
  max-width: 760px;
  color: #241524;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.12;
}

.hero-copy p:not(.hero-eyebrow) {
  max-width: 720px;
  color: #665b65;
  font-size: 14px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.hero-actions button,
.detail-panel button,
.empty-state button,
.timeline-action button {
  gap: 8px;
}

.hero-progress {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid rgba(160, 59, 147, 0.18);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  padding: 20px;
}

.hero-progress span,
.summary-tile span {
  color: #766b75;
  font-size: 12px;
  font-weight: 700;
}

.hero-progress strong {
  color: #241524;
  font-size: 38px;
  font-weight: 800;
  line-height: 1;
  margin: 12px 0;
}

.hero-progress p {
  color: #766b75;
  font-size: 12px;
  margin-top: 10px;
}

.progress-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #ead2e4;
}

.progress-track--large {
  height: 10px;
  margin: 18px 0;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #a03b93 0%, #2f9b68 100%);
}

.loading-grid,
.summary-grid {
  display: grid;
  gap: 14px;
  margin-top: 20px;
}

.summary-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.loading-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-tile,
.detail-panel {
  border: 1px solid #ead2e4;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 14px 34px rgba(49, 28, 48, 0.05);
}

.summary-tile {
  padding: 18px;
}

.summary-tile strong {
  display: block;
  color: #241524;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.35;
  margin-top: 6px;
}

.detail-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.detail-panel {
  padding: 22px;
}

.full-panel {
  margin-top: 18px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #8a337f;
}

.section-heading h2 {
  color: #241524;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.2;
}

.section-heading p {
  color: #766b75;
  font-size: 12px;
  margin-top: 4px;
}

.panel-copy {
  color: #514851;
  font-size: 14px;
  line-height: 1.7;
  margin-top: 18px;
}

.detail-list {
  display: grid;
  gap: 14px;
  margin-top: 20px;
}

.detail-list div {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 12px;
  border-top: 1px solid #f1e4ee;
  padding-top: 14px;
}

.detail-list dt {
  color: #766b75;
  font-size: 12px;
  font-weight: 700;
}

.detail-list dd {
  color: #241524;
  font-size: 14px;
  font-weight: 700;
}

.mentor-block {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-top: 20px;
  border-radius: 12px;
  background: #f7f8fb;
  padding: 16px;
}

.mentor-avatar {
  width: 54px;
  height: 54px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 50%;
  background: #f6edf4;
}

.mentor-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mentor-avatar--fallback {
  display: grid;
  place-items: center;
  color: #8a337f;
  font-size: 18px;
  font-weight: 800;
}

.mentor-block h3,
.status-block h3,
.session-block h3 {
  color: #241524;
  font-size: 15px;
  font-weight: 800;
}

.mentor-block p,
.status-block p,
.session-block p,
.recent-row span,
.action-row p,
.action-row span,
.stage-row p,
.timeline-card p,
.timeline-details dt,
.timeline-step-kicker {
  color: #766b75;
  font-size: 12px;
}

.mentor-specializations {
  margin-top: 6px;
}

.mentor-selection-search {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.mentor-selection-search button,
.mentor-selection-pagination button {
  gap: 8px;
}

.mentor-selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  max-height: min(58vh, 520px);
  overflow: auto;
  padding: 2px 4px 2px 2px;
}

.mentor-selection-card {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  align-content: start;
  gap: 12px;
  width: 100%;
  min-height: 190px;
  border: 1px solid #ead2e4;
  border-radius: 8px;
  background: #fff;
  padding: 14px;
  text-align: left;
  transition: border-color 0.16s ease, background 0.16s ease, box-shadow 0.16s ease;
}

.mentor-selection-card:hover {
  border-color: #d3a7ca;
  box-shadow: 0 10px 24px rgba(49, 28, 48, 0.07);
}

.mentor-selection-card--selected {
  border-color: #8a337f;
  background: #fbf2f8;
  box-shadow: 0 0 0 2px rgba(138, 51, 127, 0.12);
}

.mentor-selection-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.mentor-selection-card-body {
  min-width: 0;
}

.mentor-selection-card strong {
  color: #241524;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.mentor-selection-card p {
  color: #766b75;
  font-size: 12px;
  line-height: 1.45;
  margin-top: 3px;
  overflow-wrap: anywhere;
}

.mentor-selection-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #766b75;
  font-size: 12px;
}

.status-block {
  display: grid;
  place-items: center;
  text-align: center;
  gap: 8px;
  border: 1px dashed #ead2e4;
  border-radius: 12px;
  margin-top: 20px;
  padding: 28px;
}

.status-block--compact {
  padding: 24px;
}

.stage-list,
.journey-timeline,
.recent-list,
.action-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.stage-row,
.recent-row,
.action-row,
.session-block {
  border: 1px solid #f1e4ee;
  border-radius: 12px;
  background: #fff;
  padding: 14px;
}

.stage-row,
.session-block {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.stage-row span {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #f6edf4;
  color: #8a337f;
  font-size: 12px;
  font-weight: 800;
}

.stage-row strong,
.recent-row strong,
.action-row strong {
  color: #241524;
  font-size: 14px;
  font-weight: 800;
}

.action-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.journey-timeline {
  position: relative;
  gap: 0;
}

.journey-timeline::before {
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 17px;
  width: 2px;
  content: '';
  background: #ead2e4;
}

.timeline-step {
  position: relative;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 14px;
  padding-bottom: 18px;
}

.timeline-step:last-child {
  padding-bottom: 0;
}

.timeline-rail {
  position: relative;
  display: flex;
  justify-content: center;
  padding-top: 2px;
}

.timeline-dot {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 2px solid #ead2e4;
  border-radius: 999px;
  background: #fff;
  color: #8a337f;
  font-size: 12px;
  font-weight: 800;
}

.timeline-step--completed .timeline-dot {
  border-color: #2f9b68;
  background: #e9f7ef;
  color: #236d4d;
}

.timeline-step--blocked .timeline-dot {
  border-color: #f1b8b8;
  background: #fff1f1;
  color: #b42323;
}

.timeline-card {
  border: 1px solid #f1e4ee;
  border-radius: 14px;
  background: #fff;
  padding: 16px;
}

.timeline-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.timeline-step-kicker {
  margin-bottom: 4px;
  font-weight: 700;
}

.timeline-card h3 {
  color: #241524;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.35;
}

.timeline-card p {
  line-height: 1.55;
  margin-top: 4px;
}

.timeline-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.timeline-details {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.timeline-details div {
  border-radius: 10px;
  background: #faf7fa;
  padding: 10px;
}

.timeline-details dt {
  font-weight: 700;
}

.timeline-details dd {
  color: #241524;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
  margin-top: 4px;
}

.timeline-mentor {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #ead2e4;
  border-radius: 12px;
  background: #fbf2f8;
  margin-top: 14px;
  padding: 12px;
}

.timeline-mentor-avatar {
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 50%;
  background: #f6edf4;
}

.timeline-mentor-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.timeline-mentor-avatar--fallback {
  display: grid;
  place-items: center;
  color: #8a337f;
  font-size: 16px;
  font-weight: 800;
}

.timeline-mentor-copy {
  min-width: 0;
}

.timeline-mentor-copy span {
  display: block;
  color: #8a337f;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.timeline-mentor-copy strong {
  display: block;
  color: #241524;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
  margin-top: 3px;
}

.timeline-mentor-copy p {
  color: #766b75;
  font-size: 12px;
  line-height: 1.45;
  margin-top: 2px;
  overflow-wrap: anywhere;
}

.timeline-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-top: 1px solid #f1e4ee;
  margin-top: 14px;
  padding-top: 14px;
}

.timeline-action strong {
  color: #241524;
  font-size: 13px;
  font-weight: 800;
}

.timeline-action p {
  max-width: 620px;
  margin-top: 3px;
}

.timeline-action button {
  flex: 0 0 auto;
  white-space: nowrap;
}

.recent-row {
  display: grid;
  gap: 4px;
}

.empty-state {
  border: 1px dashed #ead2e4;
  border-radius: 14px;
  margin-top: 24px;
  padding: 54px 24px;
  text-align: center;
}

.empty-state h2 {
  color: #241524;
  font-size: 18px;
  font-weight: 800;
  margin-top: 12px;
}

.empty-state p {
  color: #766b75;
  font-size: 14px;
  margin-top: 6px;
}

@media (max-width: 900px) {
  .program-detail-page {
    padding: 22px 16px 36px;
  }

  .detail-hero,
  .detail-layout,
  .loading-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mentor-selection-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .detail-hero {
    padding: 22px;
  }

  .hero-copy h1 {
    font-size: 26px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .mentor-selection-search,
  .mentor-selection-grid {
    grid-template-columns: 1fr;
  }

  .mentor-selection-search button,
  .mentor-selection-pagination button {
    justify-content: center;
    width: 100%;
  }

  .mentor-selection-pagination {
    align-items: stretch;
    flex-direction: column;
  }

  .detail-list div,
  .timeline-details,
  .action-row {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .timeline-card-header {
    flex-direction: column;
  }

  .timeline-action {
    align-items: stretch;
    flex-direction: column;
  }

  .timeline-action button {
    justify-content: center;
    width: 100%;
  }
}
</style>
