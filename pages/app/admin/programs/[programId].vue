<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyStore } from '@/store/modules/company'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import type { CompanyProgramParticipantStatus, CompanyProgramStatus } from '@/http/requests/app/companyPrograms'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Tabs, TabsContent } from '~/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import {
  ArrowLeft,
  CalendarRange,
  GitBranch,
  Layers3,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  StopCircle,
  Target,
  Trash2,
  Trophy,
  UserPlus,
  UserRoundPlus,
  Users,
  XCircle,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Company Program Details',
  description: 'Operate a company mentorship program',
  requiresAuth: true,
  permissions: ['admin:programs'],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()

const { profiles, profilesLoading } = storeToRefs(companyStore)
const {
  selectedProgram,
  selectedProgramLoading,
  selectedProgramError,
  participants,
  participantsLoading,
  participantsSaving,
  participantsError,
  participantsPagination,
  mentorCandidates,
  mentorCandidatesLoading,
  mentorCandidatesError,
  mentorAssignmentSaving,
  journeyTemplates,
} = storeToRefs(companyProgramsStore)

const companyId = computed(() => {
  if (typeof window !== 'undefined') {
    const rawProfile = localStorage.getItem('profile')
    if (rawProfile) {
      try {
        const parsedProfile = JSON.parse(rawProfile)
        return parsedProfile?.company?.id || parsedProfile?.companyId || parsedProfile?.company_id || ''
      } catch {
        return authStore.loggedInUser?.companyId || ''
      }
    }
  }

  return authStore.loggedInUser?.companyId || ''
})

const programId = computed(() => String(route.params.programId || ''))
const activeTab = ref(['employees', 'matching', 'journey'].includes(String(route.query.tab)) ? String(route.query.tab) : 'overview')
const employeeSearch = ref('')
const participantSearch = ref('')
const participantStatus = ref<CompanyProgramParticipantStatus | 'ALL'>('ALL')
const mentorSearch = ref('')
const journeyTemplateSelection = ref('NONE')
const selectedProfileIds = ref<string[]>([])
const showEnrollEmployeesDialog = ref(false)
const selectedMentorByParticipant = reactive<Record<string, string>>({})
const employeeSearchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)
const participantSearchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)

const participantProfileIds = computed(() => new Set(participants.value.map(participant => participant.profileId)))
const selectedCount = computed(() => selectedProfileIds.value.length)
const assignedCount = computed(() => participants.value.filter(participant => participant.mentorAssignment).length)
const unassignedCount = computed(() => Math.max(participants.value.length - assignedCount.value, 0))
const activeParticipantCount = computed(() => participants.value.filter(participant => participant.status === 'ACTIVE').length)
const completedParticipantCount = computed(() => participants.value.filter(participant => participant.status === 'COMPLETED').length)
const programCatalogStages = computed(() => selectedProgram.value?.catalogStages || [])
const programHasLifecycleActions = computed(() =>
  canLaunch(selectedProgram.value?.status)
  || canPause(selectedProgram.value?.status)
  || canComplete(selectedProgram.value?.status)
  || canCancel(selectedProgram.value?.status),
)

const availableEmployees = computed(() =>
  (profiles.value || []).filter((profile: any) => {
    const normalizedRole = String(profile?.role || '').trim().toLowerCase()
    return ['employee', 'mentee'].includes(normalizedRole)
  }),
)
const enrollableEmployees = computed(() =>
  availableEmployees.value.filter((profile: any) => !participantProfileIds.value.has(profile.id)),
)

const visibleParticipants = computed(() => {
  const search = participantSearch.value.trim().toLowerCase()
  if (!search) return participants.value

  return participants.value.filter(participant =>
    [participant.profileName, participant.profileEmail, participant.department, participant.mentorAssignment?.mentorName]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(search)),
  )
})

const visibleMentorCandidates = computed(() => {
  const search = mentorSearch.value.trim().toLowerCase()
  if (!search) return mentorCandidates.value

  return mentorCandidates.value.filter(candidate =>
    [
      candidate.mentorName,
      candidate.mentorEmail,
      candidate.title,
      candidate.company,
      ...(candidate.specializations || []),
    ]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(search)),
  )
})

const statusTone = (status?: CompanyProgramStatus | null) => ({
  DRAFT: 'secondary',
  LIVE: 'default',
  PAUSED: 'outline',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
  ARCHIVED: 'outline',
}[String(status || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const participantStatusTone = (status: CompanyProgramParticipantStatus) => ({
  ENROLLED: 'secondary',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  WITHDRAWN: 'destructive',
}[status] as 'default' | 'secondary' | 'outline' | 'destructive')

const consentTone = (status?: string | null) => ({
  GRANTED: 'secondary',
  REVOKED: 'destructive',
}[String(status || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const workspaceStatusTone = (status?: string | null) => ({
  ASSIGNED: 'secondary',
  PENDING_EMPLOYEE_SELECTION: 'default',
  ADMIN_REVIEW: 'secondary',
  EXPIRED_NO_CANDIDATE: 'destructive',
  INACTIVE: 'outline',
}[String(status || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const statusLabel = (status?: string | null) => status ? status.replace('_', ' ') : 'Unknown'
const canLaunch = (status?: CompanyProgramStatus | null) => ['DRAFT', 'PAUSED'].includes(String(status || ''))
const canPause = (status?: CompanyProgramStatus | null) => status === 'LIVE'
const canComplete = (status?: CompanyProgramStatus | null) => ['LIVE', 'PAUSED'].includes(String(status || ''))
const canCancel = (status?: CompanyProgramStatus | null) => ['DRAFT', 'LIVE', 'PAUSED'].includes(String(status || ''))

const consentLabel = (status?: string | null) =>
  status
    ? String(status).toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())
    : 'Pending'

const workspaceStatusLabel = (status?: string | null) =>
  status
    ? String(status).toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
    : 'Not initialized'

const formatDate = (value?: string | null) => {
  if (!value) return '-'

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatDateRange = (startsAt?: string | null, endsAt?: string | null) => {
  if (!startsAt && !endsAt) return 'Flexible dates'
  return `${formatDate(startsAt)} - ${formatDate(endsAt)}`
}

const employeeName = (profile: any) => {
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
  return fullName || profile?.username || profile?.email || 'Employee'
}

const employeeSecondary = (profile: any) => {
  const bits = [profile?.email, profile?.industry || profile?.location].filter(Boolean)
  return bits.join(' | ') || 'Company employee'
}

const formatRating = (value?: number | string | null) => value ?? '-'

const syncSelectedMentors = () => {
  for (const participant of participants.value) {
    const assignedMentorId = participant.mentorAssignment?.mentorId || ''
    selectedMentorByParticipant[participant.id] = assignedMentorId || selectedMentorByParticipant[participant.id] || ''
  }
}

const loadProgramDetail = async () => {
  if (!programId.value) return

  try {
    const program = await companyProgramsStore.loadCompanyProgram(programId.value)
    journeyTemplateSelection.value = program.journeyTemplateId || 'NONE'
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load program details')
  }
}

const loadEmployees = async () => {
  if (!companyId.value) return

  try {
    await companyStore.loadProfiles({
      companyId: companyId.value,
      page: 0,
      size: 100,
      search: employeeSearch.value,
    })
  } catch {
    // company store already handles toast
  }
}

const loadParticipants = async () => {
  if (!programId.value) {
    companyProgramsStore.clearParticipantsState()
    return
  }

  try {
    await companyProgramsStore.loadProgramParticipants({
      companyProgramId: programId.value,
      page: 0,
      size: 100,
      search: participantSearch.value,
      status: participantStatus.value,
    })
    syncSelectedMentors()
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load program employees')
  }
}

const loadMentorCandidates = async () => {
  if (!programId.value) return

  try {
    await companyProgramsStore.loadMentorCandidates(programId.value, mentorSearch.value)
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load mentor candidates')
  }
}

const refreshWorkspace = async () => {
  await Promise.all([
    loadProgramDetail(),
    loadEmployees(),
    loadParticipants(),
    loadMentorCandidates(),
    companyProgramsStore.loadJourneyTemplates(),
  ])
}

const toggleSelectedProfile = (profileId: string, checked: boolean | 'indeterminate') => {
  if (checked !== true) {
    selectedProfileIds.value = selectedProfileIds.value.filter(id => id !== profileId)
    return
  }

  if (!selectedProfileIds.value.includes(profileId)) {
    selectedProfileIds.value = [...selectedProfileIds.value, profileId]
  }
}

const enrollSelectedEmployees = async () => {
  if (!programId.value) {
    toast.error('Program context is missing')
    return
  }

  if (!selectedProfileIds.value.length) {
    toast.error('Select at least one employee to enroll')
    return
  }

  try {
    await companyProgramsStore.enrollProgramParticipants(programId.value, selectedProfileIds.value)
    selectedProfileIds.value = []
    showEnrollEmployeesDialog.value = false
    await loadParticipants()
  } catch {
    // store already handles toast
  }
}

const openEnrollEmployeesDialog = async () => {
  showEnrollEmployeesDialog.value = true
  selectedProfileIds.value = []
  await loadEmployees()
}

const removeParticipant = async (participantId: string) => {
  if (!confirm('Remove this employee from the program?')) {
    return
  }

  try {
    await companyProgramsStore.removeProgramParticipant(participantId)
    await loadParticipants()
  } catch {
    // store already handles toast
  }
}

const assignMentor = async (participantId: string) => {
  const mentorId = selectedMentorByParticipant[participantId]
  if (!mentorId) {
    toast.error('Select a mentor before assigning')
    return
  }

  try {
    await companyProgramsStore.assignMentorToParticipant(participantId, mentorId)
  } catch {
    // store already handles toast
  }
}

const removeAssignment = async (participantId: string) => {
  if (!confirm('Remove the current mentor assignment for this participant?')) {
    return
  }

  try {
    await companyProgramsStore.removeParticipantMentorAssignment(participantId)
  } catch {
    // store already handles toast
  }
}

const refreshParticipantMatchWorkspace = async (participantId: string) => {
  try {
    await companyProgramsStore.refreshParticipantMatchWorkspace(participantId)
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to refresh participant matching workspace')
  }
}

const autoAssignParticipantMentor = async (participantId: string) => {
  try {
    await companyProgramsStore.autoAssignParticipantMentor(participantId)
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to auto-assign mentor')
  }
}

const runStatusAction = async (action: 'launch' | 'pause' | 'complete' | 'cancel') => {
  if (!programId.value) return

  try {
    await companyProgramsStore.updateCompanyProgramStatus(programId.value, action)
    await loadProgramDetail()
  } catch {
    // store already handles the toast
  }
}

const saveJourneyTemplate = async () => {
  if (!programId.value || journeyTemplateSelection.value === 'NONE') {
    toast.error('Select a journey template first')
    return
  }

  try {
    await companyProgramsStore.updateCompanyProgram(programId.value, {
      journeyTemplateId: journeyTemplateSelection.value,
    })
    await loadProgramDetail()
  } catch {
    // store already handles toast
  }
}

const openEditProgramPage = () => {
  if (!programId.value) return
  navigateTo(`/app/admin/programs/${programId.value}/edit`)
}

watch(companyId, async value => {
  if (!value) {
    companyProgramsStore.clearParticipantsState()
    return
  }

  await refreshWorkspace()
}, { immediate: true })

watch(programId, async () => {
  selectedProfileIds.value = []
  await refreshWorkspace()
})

watch(activeTab, value => {
  router.replace({
    query: value === 'overview' ? {} : { tab: value },
  })
})

watch(employeeSearch, () => {
  if (employeeSearchDebounce.value) {
    clearTimeout(employeeSearchDebounce.value)
  }

  employeeSearchDebounce.value = setTimeout(async () => {
    await loadEmployees()
  }, 350)
})

watch(participantSearch, () => {
  if (participantSearchDebounce.value) {
    clearTimeout(participantSearchDebounce.value)
  }

  participantSearchDebounce.value = setTimeout(async () => {
    await loadParticipants()
  }, 350)
})

watch(participantStatus, async () => {
  await loadParticipants()
})

watch(participants, () => {
  syncSelectedMentors()
}, { deep: true })

watch(showEnrollEmployeesDialog, isOpen => {
  if (!isOpen) {
    selectedProfileIds.value = []
  }
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div class="space-y-1">
        <Button variant="ghost" class="w-fit px-0 text-muted-foreground" @click="router.push('/app/admin/programs')">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back to Company Programs
        </Button>
        <h1 class="text-2xl font-semibold tracking-tight">{{ selectedProgram?.name || 'Company Program' }}</h1>
        <p class="text-sm text-muted-foreground">
          Operate this program from one workspace.
        </p>
      </div>

      <div class="detail-header-actions">
        <Button variant="outline" @click="refreshWorkspace" :disabled="selectedProgramLoading || participantsLoading || mentorCandidatesLoading">
          <RefreshCw
            class="mr-2 h-4 w-4"
            :class="{ 'animate-spin': selectedProgramLoading || participantsLoading || mentorCandidatesLoading }"
          />
          Refresh
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button :disabled="companyProgramsStore.isSaving || !selectedProgram">
              <MoreHorizontal class="mr-2 h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuItem :disabled="!selectedProgram" @click="openEditProgramPage">
              <Layers3 class="mr-2 h-4 w-4" />
              Edit program
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              v-if="canLaunch(selectedProgram?.status)"
              :disabled="companyProgramsStore.isSaving"
              @click="runStatusAction('launch')"
            >
              <PlayCircle class="mr-2 h-4 w-4" />
              Launch program
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="canPause(selectedProgram?.status)"
              :disabled="companyProgramsStore.isSaving"
              @click="runStatusAction('pause')"
            >
              <PauseCircle class="mr-2 h-4 w-4" />
              Pause program
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="canComplete(selectedProgram?.status)"
              :disabled="companyProgramsStore.isSaving"
              @click="runStatusAction('complete')"
            >
              <Trophy class="mr-2 h-4 w-4" />
              Complete program
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="canCancel(selectedProgram?.status)"
              :disabled="companyProgramsStore.isSaving"
              class="text-destructive focus:text-destructive"
              @click="runStatusAction('cancel')"
            >
              <StopCircle class="mr-2 h-4 w-4" />
              Cancel program
            </DropdownMenuItem>
            <DropdownMenuItem v-if="!programHasLifecycleActions" disabled>
              No lifecycle actions available
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="activeTab = 'employees'">
              <Users class="mr-2 h-4 w-4" />
              Manage employees
            </DropdownMenuItem>
            <DropdownMenuItem @click="activeTab = 'matching'">
              <GitBranch class="mr-2 h-4 w-4" />
              Mentor matching
            </DropdownMenuItem>
            <DropdownMenuItem @click="activeTab = 'journey'">
              <Target class="mr-2 h-4 w-4" />
              Journey setup
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <Alert v-if="!companyId">
      <AlertDescription>Company context is missing for this account. Refresh your profile or sign in again.</AlertDescription>
    </Alert>

    <Alert v-else-if="selectedProgramError" variant="destructive">
      <AlertDescription>{{ selectedProgramError }}</AlertDescription>
    </Alert>

    <div v-if="selectedProgramLoading" class="space-y-3">
      <Skeleton class="h-28 w-full" />
      <Skeleton class="h-12 w-full" />
    </div>

    <template v-else>
      <div v-if="selectedProgram" class="program-hero">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <Badge :variant="statusTone(selectedProgram.status)">
              {{ statusLabel(selectedProgram.status) }}
            </Badge>
            <Badge variant="outline">{{ companyProgramsStore.matchingModeLabel(selectedProgram.matchingMode) }}</Badge>
          </div>
          <h2 class="mt-4 text-2xl font-semibold tracking-tight">{{ selectedProgram.name }}</h2>
          <p class="mt-2 max-w-3xl text-sm text-muted-foreground">
            {{ selectedProgram.objective || selectedProgram.targetAudienceDescription || 'No objective captured yet.' }}
          </p>
        </div>
        <div class="grid gap-2 text-sm text-muted-foreground">
          <div class="flex items-center gap-2">
            <CalendarRange class="h-4 w-4" />
            <span>{{ formatDateRange(selectedProgram.startsAt, selectedProgram.endsAt) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Users class="h-4 w-4" />
            <span>{{ selectedProgram.maxParticipants || 'Open' }} capacity</span>
          </div>
          <div class="flex items-center gap-2">
            <Layers3 class="h-4 w-4" />
            <span>{{ companyProgramsStore.catalogJourneyLabel(selectedProgram.catalogStages, selectedProgram.catalogJourneySummary) }}</span>
          </div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Employees</CardDescription>
            <CardTitle class="text-3xl">{{ participantsPagination.totalItems }}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Assigned Mentors</CardDescription>
            <CardTitle class="text-3xl">{{ assignedCount }}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Pending Matches</CardDescription>
            <CardTitle class="text-3xl">{{ unassignedCount }}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Mentor Candidates</CardDescription>
            <CardTitle class="text-3xl">{{ mentorCandidates.length }}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs v-model="activeTab" class="space-y-4">
        <div class="program-workspace-toolbar">
          <div class="program-view-toggle" aria-label="Program detail sections">
            <button
              type="button"
              class="program-view-tab"
              :class="{ 'program-view-tab--active': activeTab === 'overview' }"
              @click="activeTab = 'overview'"
            >
              Overview
              <span>4</span>
            </button>
            <button
              type="button"
              class="program-view-tab"
              :class="{ 'program-view-tab--active': activeTab === 'employees' }"
              @click="activeTab = 'employees'"
            >
              Employees
              <span>{{ participantsPagination.totalItems || participants.length }}</span>
            </button>
            <button
              type="button"
              class="program-view-tab"
              :class="{ 'program-view-tab--active': activeTab === 'matching' }"
              @click="activeTab = 'matching'"
            >
              Mentor Matching
              <span>{{ unassignedCount }}</span>
            </button>
            <button
              type="button"
              class="program-view-tab"
              :class="{ 'program-view-tab--active': activeTab === 'journey' }"
              @click="activeTab = 'journey'"
            >
              Journey
              <span>{{ selectedProgram?.catalogProgramCount || programCatalogStages.length || 0 }}</span>
            </button>
          </div>
        </div>

        <TabsContent value="overview" class="space-y-4">
          <div class="overview-grid">
            <Card class="overview-card overview-card--wide">
              <CardHeader>
                <CardTitle>Program Details</CardTitle>
                <CardDescription>Core setup and positioning for this company program.</CardDescription>
              </CardHeader>
              <CardContent class="space-y-5">
                <div class="overview-detail-block">
                  <div class="overview-label">Objective</div>
                  <p class="overview-copy">
                    {{ selectedProgram?.objective || 'No objective captured yet.' }}
                  </p>
                </div>

                <div class="overview-detail-block">
                  <div class="overview-label">Target audience</div>
                  <p class="overview-copy">
                    {{ selectedProgram?.targetAudienceDescription || 'No target audience description captured yet.' }}
                  </p>
                </div>

                <div class="overview-detail-grid">
                  <div class="overview-fact">
                    <span>Status</span>
                    <strong>{{ statusLabel(selectedProgram?.status) }}</strong>
                  </div>
                  <div class="overview-fact">
                    <span>Matching mode</span>
                    <strong>{{ selectedProgram ? companyProgramsStore.matchingModeLabel(selectedProgram.matchingMode) : '-' }}</strong>
                  </div>
                  <div class="overview-fact">
                    <span>Selection window</span>
                    <strong>{{ selectedProgram?.employeeSelectionWindowHours || 48 }} hours</strong>
                  </div>
                  <div class="overview-fact">
                    <span>Shortlist size</span>
                    <strong>{{ selectedProgram?.employeeSelectionShortlistSize || 5 }} mentors</strong>
                  </div>
                  <div class="overview-fact">
                    <span>Visibility policy</span>
                    <strong>{{ selectedProgram?.visibilityPolicyCode || 'Default' }}</strong>
                  </div>
                  <div class="overview-fact">
                    <span>Capacity</span>
                    <strong>{{ selectedProgram?.maxParticipants || 'Open' }}</strong>
                  </div>
                  <div class="overview-fact">
                    <span>Session gating</span>
                    <strong>{{ selectedProgram?.requiresMentorForSessionSteps === false ? 'Mentor optional' : 'Mentor required before session milestones' }}</strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card class="overview-card">
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>Planned schedule and record history.</CardDescription>
              </CardHeader>
              <CardContent class="overview-list">
                <div class="overview-list-row">
                  <span>Start date</span>
                  <strong>{{ formatDate(selectedProgram?.startsAt) }}</strong>
                </div>
                <div class="overview-list-row">
                  <span>End date</span>
                  <strong>{{ formatDate(selectedProgram?.endsAt) }}</strong>
                </div>
                <div class="overview-list-row">
                  <span>Created</span>
                  <strong>{{ formatDate(selectedProgram?.createdAt) }}</strong>
                </div>
                <div class="overview-list-row">
                  <span>Last updated</span>
                  <strong>{{ formatDate(selectedProgram?.updatedAt) }}</strong>
                </div>
              </CardContent>
            </Card>

            <Card class="overview-card">
              <CardHeader>
                <CardTitle>Participation</CardTitle>
                <CardDescription>Current roster and matching progress.</CardDescription>
              </CardHeader>
              <CardContent class="overview-metrics">
                <div class="overview-metric">
                  <span>Total employees</span>
                  <strong>{{ participantsPagination.totalItems }}</strong>
                </div>
                <div class="overview-metric">
                  <span>Active</span>
                  <strong>{{ activeParticipantCount }}</strong>
                </div>
                <div class="overview-metric">
                  <span>Assigned mentors</span>
                  <strong>{{ assignedCount }}</strong>
                </div>
                <div class="overview-metric">
                  <span>Completed</span>
                  <strong>{{ completedParticipantCount }}</strong>
                </div>
              </CardContent>
            </Card>

            <Card class="overview-card overview-card--wide">
              <CardHeader>
                <CardTitle>Journey & Catalog</CardTitle>
                <CardDescription>Program template, guided journey, and Prosper catalog stages.</CardDescription>
              </CardHeader>
              <CardContent class="space-y-5">
                <div class="overview-detail-grid">
                  <div class="overview-fact">
                    <span>Journey template</span>
                    <strong>{{ selectedProgram?.journeyTemplateName || 'Not attached' }}</strong>
                  </div>
                  <div class="overview-fact">
                    <span>Template program</span>
                    <strong>{{ selectedProgram?.templateProgramName || 'Custom company program' }}</strong>
                  </div>
                  <div class="overview-fact">
                    <span>Catalog programs</span>
                    <strong>{{ selectedProgram?.catalogProgramCount || programCatalogStages.length || 0 }}</strong>
                  </div>
                  <div class="overview-fact">
                    <span>Version</span>
                    <strong>{{ selectedProgram?.version || '-' }}</strong>
                  </div>
                </div>

                <div class="overview-detail-block">
                  <div class="overview-label">Journey summary</div>
                  <p class="overview-copy">
                    {{ companyProgramsStore.catalogJourneyLabel(selectedProgram?.catalogStages, selectedProgram?.catalogJourneySummary) }}
                  </p>
                </div>

                <div v-if="programCatalogStages.length" class="overview-stage-list">
                  <div
                    v-for="stage in programCatalogStages"
                    :key="stage.id || `${stage.programId}-${stage.journeyOrder}`"
                    class="overview-stage"
                  >
                    <div>
                      <span>Stage {{ stage.journeyOrder }}</span>
                      <strong>{{ stage.journeyStageName || stage.programName || 'Catalog stage' }}</strong>
                      <p>{{ stage.programDescription || 'No stage description captured yet.' }}</p>
                    </div>
                    <Badge variant="outline">{{ stage.stageType || 'CORE' }}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" class="space-y-4">
          <Card>
            <CardHeader class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Enrolled Employees</CardTitle>
                <CardDescription>Track who is already attached to this company program.</CardDescription>
              </div>
              <Button @click="openEnrollEmployeesDialog" :disabled="participantsSaving || !programId">
                <UserPlus class="mr-2 h-4 w-4" />
                Add employees
              </Button>
            </CardHeader>
            <CardContent class="space-y-4">
              <Alert v-if="participantsError" variant="destructive">
                <AlertDescription>{{ participantsError }}</AlertDescription>
              </Alert>

              <div class="grid gap-3 md:grid-cols-[1fr,180px]">
                <div class="relative">
                  <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input v-model="participantSearch" class="pl-9" placeholder="Search enrolled employees" />
                </div>

                <Select v-model="participantStatus">
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="ENROLLED">Enrolled</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div v-if="participantsLoading" class="space-y-3">
                <Skeleton class="h-12 w-full" />
                <Skeleton class="h-12 w-full" />
                <Skeleton class="h-12 w-full" />
              </div>

              <div v-else-if="!participants.length" class="rounded-lg border border-dashed p-8 text-center">
                <Users class="mx-auto h-8 w-8 text-muted-foreground" />
                <p class="mt-3 text-sm text-muted-foreground">No employees are enrolled in this program yet.</p>
              </div>

              <Table v-else>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Match Workspace</TableHead>
                    <TableHead>Consent</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead class="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="participant in participants" :key="participant.id">
                    <TableCell>
                      <div class="space-y-1">
                        <div class="font-medium">{{ participant.profileName }}</div>
                        <div class="text-xs text-muted-foreground">
                          {{ participant.profileEmail || participant.department || 'Company employee' }}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge :variant="participantStatusTone(participant.status)">
                        {{ companyProgramsStore.participantStatusLabel(participant.status) }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div class="space-y-1">
                        <Badge v-if="participant.matchWorkspace?.status" :variant="workspaceStatusTone(participant.matchWorkspace.status)">
                          {{ workspaceStatusLabel(participant.matchWorkspace.status) }}
                        </Badge>
                        <div v-if="participant.matchWorkspace?.selectionDeadlineAt" class="text-xs text-muted-foreground">
                          Deadline {{ formatDate(participant.matchWorkspace.selectionDeadlineAt) }}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div class="flex flex-col gap-1">
                        <Badge :variant="consentTone(participant.consentSummary?.programParticipationStatus)">
                          Participation {{ consentLabel(participant.consentSummary?.programParticipationStatus) }}
                        </Badge>
                        <div class="text-xs text-muted-foreground">
                          {{ participant.consentSummary?.grantedCount || 0 }} granted | {{ participant.consentSummary?.pendingCount || 0 }} pending
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{{ formatDate(participant.enrolledAt) }}</TableCell>
                    <TableCell class="text-right">
                      <Button variant="ghost" size="sm" @click="removeParticipant(participant.id)" :disabled="participantsSaving">
                        <Trash2 class="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog :open="showEnrollEmployeesDialog" @update:open="showEnrollEmployeesDialog = $event">
            <DialogContent class="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add employees to this program</DialogTitle>
                <DialogDescription>Select one or more employees to enroll in this company program.</DialogDescription>
              </DialogHeader>

              <div class="space-y-4">
                <div class="relative">
                  <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input v-model="employeeSearch" class="pl-9" placeholder="Search employees by name or email" />
                </div>

                <div v-if="profilesLoading" class="space-y-3">
                  <Skeleton class="h-12 w-full" />
                  <Skeleton class="h-12 w-full" />
                  <Skeleton class="h-12 w-full" />
                </div>

                <div v-else-if="!enrollableEmployees.length" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No available employees matched this search.
                </div>

                <div v-else class="max-h-[380px] overflow-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead class="w-12">Select</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow v-for="profile in enrollableEmployees" :key="profile.id">
                        <TableCell>
                          <Checkbox
                            :checked="selectedProfileIds.includes(profile.id)"
                            @update:checked="value => toggleSelectedProfile(profile.id, value)"
                          />
                        </TableCell>
                        <TableCell class="font-medium">{{ employeeName(profile) }}</TableCell>
                        <TableCell class="text-xs text-muted-foreground">{{ employeeSecondary(profile) }}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" @click="showEnrollEmployeesDialog = false">Cancel</Button>
                <Button @click="enrollSelectedEmployees" :disabled="participantsSaving || !selectedCount || !programId">
                  Add selected {{ selectedCount || '' }}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="matching" class="space-y-4">
          <Alert>
            <AlertDescription>
              <div class="space-y-1">
                <p class="text-sm font-semibold text-foreground">How Mentor Matching Works</p>
                <p class="text-sm text-muted-foreground">
                  Use this workspace to evaluate mentor candidates, assign or reassign mentors to enrolled employees, and keep pairings aligned with program progress.
                </p>
                <p class="text-xs text-muted-foreground">
                  Employee selection window: {{ selectedProgram?.employeeSelectionWindowHours || 48 }}h · Shortlist: {{ selectedProgram?.employeeSelectionShortlistSize || 5 }} mentors · Session milestones {{ selectedProgram?.requiresMentorForSessionSteps === false ? 'do not require' : 'require' }} mentor assignment.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div class="grid gap-6 xl:grid-cols-[1fr,1.35fr]">
            <Card>
              <CardHeader>
                <CardTitle>Mentor Pool</CardTitle>
                <CardDescription>Available mentors for this company program.</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="relative">
                  <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input v-model="mentorSearch" class="pl-9" placeholder="Search mentor candidates" @keyup.enter="loadMentorCandidates" />
                </div>

                <Alert v-if="mentorCandidatesError" variant="destructive">
                  <AlertDescription>{{ mentorCandidatesError }}</AlertDescription>
                </Alert>

                <div v-if="mentorCandidatesLoading" class="space-y-3">
                  <Skeleton class="h-16 w-full" />
                  <Skeleton class="h-16 w-full" />
                  <Skeleton class="h-16 w-full" />
                </div>

                <div v-else-if="!visibleMentorCandidates.length" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No mentor candidates are currently available for this program.
                </div>

                <div v-else class="space-y-3">
                  <div v-for="candidate in visibleMentorCandidates" :key="candidate.mentorId" class="rounded-lg border p-4">
                    <div class="flex items-start justify-between gap-3">
                      <div class="space-y-1">
                        <div class="font-medium">{{ candidate.mentorName }}</div>
                        <div class="text-sm text-muted-foreground">
                          {{ candidate.title || 'Mentor' }}<span v-if="candidate.company"> | {{ candidate.company }}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{{ companyProgramsStore.mentorCandidateSourceLabel(candidate.source) }}</Badge>
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Rating: {{ formatRating(candidate.rating) }}</span>
                      <span>Sessions: {{ candidate.totalSessions ?? '-' }}</span>
                      <span>Experience: {{ candidate.yearsExperience ?? '-' }} yrs</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assignment Workspace</CardTitle>
                <CardDescription>Assign mentors to employees one by one and override when needed.</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <Alert v-if="participantsError" variant="destructive">
                  <AlertDescription>{{ participantsError }}</AlertDescription>
                </Alert>

                <div v-if="participantsLoading" class="space-y-3">
                  <Skeleton class="h-12 w-full" />
                  <Skeleton class="h-12 w-full" />
                  <Skeleton class="h-12 w-full" />
                </div>

                <div v-else-if="!visibleParticipants.length" class="rounded-lg border border-dashed p-8 text-center">
                  <ShieldCheck class="mx-auto h-8 w-8 text-muted-foreground" />
                  <p class="mt-3 text-sm text-muted-foreground">No employees matched the current filter for this program.</p>
                </div>

                <Table v-else>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Match Workspace</TableHead>
                      <TableHead>Current Mentor</TableHead>
                      <TableHead>Choose Mentor</TableHead>
                      <TableHead class="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="participant in visibleParticipants" :key="participant.id">
                      <TableCell>
                        <div class="space-y-1">
                          <div class="font-medium">{{ participant.profileName }}</div>
                          <div class="text-xs text-muted-foreground">
                            {{ participant.profileEmail || participant.department || 'Company employee' }}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge :variant="participantStatusTone(participant.status)">
                          {{ companyProgramsStore.participantStatusLabel(participant.status) }}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div class="space-y-1">
                          <Badge v-if="participant.matchWorkspace?.status" :variant="workspaceStatusTone(participant.matchWorkspace.status)">
                            {{ workspaceStatusLabel(participant.matchWorkspace.status) }}
                          </Badge>
                          <div v-if="participant.matchWorkspace?.selectionDeadlineAt" class="text-xs text-muted-foreground">
                            Deadline {{ formatDate(participant.matchWorkspace.selectionDeadlineAt) }}
                          </div>
                          <div class="text-xs text-muted-foreground">
                            Shortlist {{ participant.matchWorkspace?.shortlistCount ?? 0 }}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div v-if="participant.mentorAssignment" class="space-y-1">
                          <div class="font-medium">{{ participant.mentorAssignment.mentorName }}</div>
                          <div class="text-xs text-muted-foreground">
                            Assigned {{ formatDate(participant.mentorAssignment.assignedAt) }}
                          </div>
                        </div>
                        <span v-else class="text-sm text-muted-foreground">Pending assignment</span>
                      </TableCell>
                      <TableCell class="min-w-[220px]">
                        <Select v-model="selectedMentorByParticipant[participant.id]">
                          <SelectTrigger>
                            <SelectValue placeholder="Select mentor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem v-for="candidate in visibleMentorCandidates" :key="candidate.mentorId" :value="candidate.mentorId">
                              {{ candidate.mentorName }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell class="text-right">
                        <div class="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            @click="refreshParticipantMatchWorkspace(participant.id)"
                            :disabled="companyProgramsStore.isParticipantMatchWorkspaceSaving(participant.id)"
                          >
                            Refresh
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            @click="autoAssignParticipantMentor(participant.id)"
                            :disabled="mentorAssignmentSaving || companyProgramsStore.isParticipantMatchWorkspaceSaving(participant.id)"
                          >
                            Auto-assign
                          </Button>
                          <Button size="sm" @click="assignMentor(participant.id)" :disabled="mentorAssignmentSaving || !selectedMentorByParticipant[participant.id]">
                            <UserRoundPlus class="mr-2 h-4 w-4" />
                            {{ participant.mentorAssignment ? 'Reassign' : 'Assign' }}
                          </Button>
                          <Button v-if="participant.mentorAssignment" variant="ghost" size="sm" @click="removeAssignment(participant.id)" :disabled="mentorAssignmentSaving">
                            <XCircle class="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journey" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journey</CardTitle>
              <CardDescription>Attach the guided journey this program should run.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-if="selectedProgram" class="rounded-lg border bg-muted/20 p-4">
                <div class="font-medium">{{ selectedProgram.journeyTemplateName || 'No journey template attached' }}</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  {{ companyProgramsStore.catalogJourneyLabel(selectedProgram.catalogStages, selectedProgram.catalogJourneySummary) }}
                </div>
              </div>

              <div class="grid gap-3 md:grid-cols-[1fr,auto]">
                <Select v-model="journeyTemplateSelection">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a journey template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="template in journeyTemplates" :key="template.id" :value="template.id">
                      {{ template.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" @click="saveJourneyTemplate" :disabled="companyProgramsStore.isSaving || journeyTemplateSelection === 'NONE'">
                  <Target class="mr-2 h-4 w-4" />
                  Save journey
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>

<style scoped>
.detail-header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}

@media (min-width: 768px) {
  .detail-header-actions {
    justify-content: flex-end;
  }
}

.program-hero {
  display: grid;
  gap: 20px;
  border: 1px solid #ead2e4;
  border-radius: 18px;
  background: linear-gradient(135deg, #fcf4fa 0%, #fff9fd 100%);
  padding: 22px;
}

@media (min-width: 768px) {
  .program-hero {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }
}

.program-workspace-toolbar {
  display: flex;
  justify-content: flex-start;
  width: 100%;
}

.program-view-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  border: 1px solid #ead2e4;
  border-radius: 18px;
  background: #fff;
  padding: 4px;
}

.program-view-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 0;
  gap: 8px;
  min-height: 38px;
  border-radius: 11px;
  color: #6b5b6a;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  padding: 0 12px;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.program-view-tab span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  border-radius: 999px;
  background: #f6edf4;
  color: #8a337f;
  font-size: 11px;
  padding: 0 6px;
}

.program-view-tab--active {
  background: #a03b93;
  color: white;
}

.program-view-tab--active span {
  background: rgba(255, 255, 255, 0.22);
  color: white;
}

.overview-grid {
  display: grid;
  gap: 16px;
}

@media (min-width: 1024px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.overview-card {
  min-width: 0;
}

.overview-card--wide {
  grid-column: 1 / -1;
}

.overview-detail-block {
  display: grid;
  gap: 6px;
}

.overview-label,
.overview-fact span,
.overview-list-row span,
.overview-metric span,
.overview-stage span {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.overview-copy {
  color: hsl(var(--foreground));
  font-size: 14px;
  line-height: 1.65;
}

.overview-detail-grid {
  display: grid;
  gap: 12px;
}

@media (min-width: 768px) {
  .overview-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.overview-fact,
.overview-metric {
  min-width: 0;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--muted) / 0.18);
  padding: 14px;
}

.overview-fact strong,
.overview-list-row strong,
.overview-metric strong,
.overview-stage strong {
  display: block;
  min-width: 0;
  overflow-wrap: anywhere;
  color: hsl(var(--foreground));
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}

.overview-list {
  display: grid;
  gap: 12px;
}

.overview-list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid hsl(var(--border));
  padding-bottom: 12px;
}

.overview-list-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.overview-metrics {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.overview-metric strong {
  margin-top: 6px;
  font-size: 28px;
}

.overview-stage-list {
  display: grid;
  gap: 10px;
}

.overview-stage {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  padding: 14px;
}

.overview-stage p {
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .program-workspace-toolbar,
  .program-view-toggle {
    width: 100%;
  }

  .program-view-toggle {
    flex-wrap: wrap;
  }

  .program-view-tab {
    flex: 1 1 calc(50% - 3px);
    min-width: calc(50% - 3px);
    white-space: normal;
    text-align: center;
    padding: 6px 8px;
  }
}
</style>
