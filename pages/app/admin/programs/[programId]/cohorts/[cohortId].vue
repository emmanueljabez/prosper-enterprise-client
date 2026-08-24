<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useCompanyProgramCohortsStore } from '@/store/modules/company-program-cohorts'
import type {
  CircleSuggestionRecord,
  CohortParticipantStatus,
  CompanyProgramCohortParticipantRecord,
  CompanyProgramCohortRecord,
  CompanyProgramCohortStatus,
  CommonInterestCircleRecord,
  CommonInterestCircleMemberRecord,
  PlenaryAttendanceStatus,
} from '@/http/requests/app/companyProgramCohorts'
import { useAppToast } from '@/composables/services/toastService'
import CompanyProgramCohortEditorDialog from '@/components/app/admin/cohorts/CompanyProgramCohortEditorDialog.vue'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Tabs, TabsContent } from '~/components/ui/tabs'
import {
  ArrowLeft,
  CalendarRange,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Layers3,
  Link,
  Pencil,
  RefreshCw,
  ShieldAlert,
  Shuffle,
  Ticket,
  UserCheck,
  UserMinus,
  Users,
  XCircle,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Cohort Workspace',
  description: 'Operate a company program cohort',
  requiresAuth: true,
  permissions: ['admin:programs'],
})

type CircleFormModel = {
  name: string
  theme: string
  interestTags: string
  facilitatorProfileId: string
  minSize: number | null
  maxSize: number | null
  nextSessionAt: string
}

const route = useRoute()
const router = useRouter()
const cohortsStore = useCompanyProgramCohortsStore()
const toast = useAppToast()

const {
  selectedCohort,
  participants,
  circles,
  suggestions,
  dashboard,
  isLoading,
  isSaving,
  error,
} = storeToRefs(cohortsStore)

const programId = computed(() => String(route.params.programId || ''))
const cohortId = computed(() => String(route.params.cohortId || ''))
const activeTab = ref(['participants', 'plenary', 'circles', 'matching'].includes(String(route.query.tab)) ? String(route.query.tab) : 'overview')
const editDialogOpen = ref(false)
const placementCircleByParticipant = reactive<Record<string, string>>({})
const membershipTargetCircleId = reactive<Record<string, string>>({})
const newCircle = reactive<CircleFormModel>({
  name: '',
  theme: '',
  interestTags: '',
  facilitatorProfileId: '',
  minSize: 5,
  maxSize: 10,
  nextSessionAt: '',
})

const activeParticipants = computed(() =>
  participants.value.filter(participant => !['REJECTED', 'WITHDRAWN'].includes(participant.status)),
)

const reviewParticipants = computed(() =>
  participants.value.filter(participant =>
    ['PENDING', 'CONFIRMED'].includes(participant.status) || participant.duplicateStatus === 'POSSIBLE_DUPLICATE',
  ),
)

const plenaryParticipants = computed(() =>
  participants.value.filter(participant => !['REJECTED', 'WITHDRAWN'].includes(participant.status)),
)

const placedParticipantIds = computed(() => {
  const ids = new Set<string>()
  for (const circle of circles.value) {
    for (const member of circle.members || []) {
      if (member.status !== 'REMOVED') {
        ids.add(member.cohortParticipantId)
      }
    }
  }
  return ids
})

const unplacedParticipants = computed(() =>
  activeParticipants.value.filter(participant => !placedParticipantIds.value.has(participant.id)),
)

const circleCapacityLabel = (cohort?: CompanyProgramCohortRecord | null) =>
  `${cohort?.circleMinSize || 5}-${cohort?.circleMaxSize || 10}`

const statusTone = (status?: CompanyProgramCohortStatus | null) => ({
  DRAFT: 'secondary',
  INTAKE_OPEN: 'default',
  INTAKE_CLOSED: 'outline',
  PLENARY_SCHEDULED: 'secondary',
  CIRCLES_FORMING: 'default',
  CIRCLES_FINALIZED: 'secondary',
  MATCHING: 'default',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  CANCELLED: 'destructive',
  ARCHIVED: 'outline',
}[String(status || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const participantStatusTone = (status?: CohortParticipantStatus | null) => ({
  PENDING: 'secondary',
  CONFIRMED: 'default',
  PLENARY_ATTENDED: 'default',
  PLACED_IN_CIRCLE: 'secondary',
  ELIGIBLE_FOR_MATCHING: 'default',
  MATCHED: 'default',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  WITHDRAWN: 'destructive',
  REJECTED: 'destructive',
}[String(status || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const duplicateTone = (status?: string | null) => ({
  CLEAR: 'outline',
  POSSIBLE_DUPLICATE: 'destructive',
  RESOLVED_EXISTING_PROFILE: 'secondary',
  RESOLVED_NEW_PROFILE: 'secondary',
}[String(status || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const statusLabel = (status?: string | null) =>
  status ? String(status).toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()) : 'Unknown'

const formatDate = (value?: string | null) => {
  if (!value) return '-'

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatPercent = (value?: number | null) => {
  if (value === null || value === undefined) return '0%'
  return `${Math.round(Number(value) * 100)}%`
}

const toIsoOrNull = (value: string) => value ? new Date(value).toISOString() : null
const optionalNumber = (value: number | string | null) => {
  if (value === null || value === '') return null
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

const splitTags = (value: string) =>
  value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)

const participantName = (participant?: CompanyProgramCohortParticipantRecord | null) =>
  participant?.profileName || participant?.profileEmail || participant?.profilePhone || 'Cohort participant'

const memberName = (member: CommonInterestCircleMemberRecord) =>
  member.profileName || member.profileEmail || 'Circle member'

const loadCohort = async () => {
  if (!cohortId.value) return
  await cohortsStore.loadCohort(cohortId.value)
}

const loadParticipants = async () => {
  if (!cohortId.value) return
  await cohortsStore.loadParticipants(cohortId.value)
}

const loadCircles = async () => {
  if (!cohortId.value) return
  await cohortsStore.loadCircles(cohortId.value)
}

const loadDashboard = async () => {
  if (!cohortId.value) return
  await cohortsStore.loadDashboard(cohortId.value)
}

const loadWorkspace = async () => {
  if (!cohortId.value) return

  try {
    await Promise.all([
      loadCohort(),
      loadParticipants(),
      loadCircles(),
      loadDashboard(),
    ])
  } catch (workspaceError: any) {
    toast.error(workspaceError?.response?.data?.message || workspaceError?.message || 'Failed to load cohort workspace')
  }
}

const refreshAfterMutation = async () => {
  await Promise.all([
    loadCohort(),
    loadParticipants(),
    loadCircles(),
    loadDashboard(),
  ])
}

const openIntake = async () => {
  if (!cohortId.value) return

  try {
    await cohortsStore.openIntake(cohortId.value)
    toast.success('Cohort intake opened.')
    await loadDashboard()
  } catch (intakeError: any) {
    toast.error(intakeError?.response?.data?.message || intakeError?.message || 'Failed to open cohort intake')
  }
}

const closeIntake = async () => {
  if (!cohortId.value) return

  try {
    await cohortsStore.closeIntake(cohortId.value)
    toast.success('Cohort intake closed.')
    await loadDashboard()
  } catch (intakeError: any) {
    toast.error(intakeError?.response?.data?.message || intakeError?.message || 'Failed to close cohort intake')
  }
}

const confirmParticipant = async (participant: CompanyProgramCohortParticipantRecord) => {
  try {
    await cohortsStore.confirmParticipant(participant.id)
    toast.success('Participant confirmed.')
    await loadDashboard()
  } catch (participantError: any) {
    toast.error(participantError?.response?.data?.message || participantError?.message || 'Failed to confirm participant')
  }
}

const rejectParticipant = async (participant: CompanyProgramCohortParticipantRecord) => {
  try {
    await cohortsStore.rejectParticipant(participant.id)
    toast.success('Participant rejected.')
    await loadDashboard()
  } catch (participantError: any) {
    toast.error(participantError?.response?.data?.message || participantError?.message || 'Failed to reject participant')
  }
}

const resolveDuplicate = async (participant: CompanyProgramCohortParticipantRecord, mode: 'existing' | 'new') => {
  const profileId = mode === 'existing' ? participant.duplicateCandidateProfileId : participant.profileId
  if (!profileId) {
    toast.error('A profile is required to resolve this duplicate review.')
    return
  }

  try {
    await cohortsStore.resolveDuplicate(participant.id, {
      profileId,
      duplicateStatus: mode === 'existing' ? 'RESOLVED_EXISTING_PROFILE' : 'RESOLVED_NEW_PROFILE',
    })
    toast.success('Duplicate review resolved.')
    await loadDashboard()
  } catch (duplicateError: any) {
    toast.error(duplicateError?.response?.data?.message || duplicateError?.message || 'Failed to resolve duplicate review')
  }
}

const recordPlenaryAttendance = async (participant: CompanyProgramCohortParticipantRecord, status: PlenaryAttendanceStatus) => {
  try {
    await cohortsStore.recordPlenaryAttendance(participant.id, {
      status,
      attendanceSource: 'ADMIN_OVERRIDE',
    })
    toast.success('Plenary attendance recorded.')
    await loadDashboard()
  } catch (attendanceError: any) {
    toast.error(attendanceError?.response?.data?.message || attendanceError?.message || 'Failed to record plenary attendance')
  }
}

const suggestCircles = async () => {
  if (!cohortId.value) return

  try {
    await cohortsStore.suggestCircles(cohortId.value)
    activeTab.value = 'circles'
    toast.success('Circle suggestions refreshed.')
  } catch (suggestionError: any) {
    toast.error(suggestionError?.response?.data?.message || suggestionError?.message || 'Failed to suggest circles')
  }
}

const resetCircleForm = () => {
  newCircle.name = ''
  newCircle.theme = ''
  newCircle.interestTags = ''
  newCircle.facilitatorProfileId = ''
  newCircle.minSize = selectedCohort.value?.circleMinSize ?? 5
  newCircle.maxSize = selectedCohort.value?.circleMaxSize ?? 10
  newCircle.nextSessionAt = ''
}

const createCircle = async () => {
  if (!cohortId.value) return

  if (!newCircle.name.trim()) {
    toast.error('Circle name is required')
    return
  }

  try {
    await cohortsStore.createCircle(cohortId.value, {
      name: newCircle.name.trim(),
      theme: newCircle.theme.trim() || null,
      interestTags: splitTags(newCircle.interestTags),
      facilitatorProfileId: newCircle.facilitatorProfileId.trim() || null,
      minSize: optionalNumber(newCircle.minSize),
      maxSize: optionalNumber(newCircle.maxSize),
      nextSessionAt: toIsoOrNull(newCircle.nextSessionAt),
    })
    resetCircleForm()
    toast.success('Circle created.')
    await refreshAfterMutation()
  } catch (circleError: any) {
    toast.error(circleError?.response?.data?.message || circleError?.message || 'Failed to create circle')
  }
}

const createCircleFromSuggestion = async (suggestion: CircleSuggestionRecord) => {
  if (!cohortId.value) return

  try {
    const circle = await cohortsStore.createCircle(cohortId.value, {
      name: suggestion.name,
      theme: suggestion.theme || null,
      interestTags: suggestion.interestTags || [],
      minSize: selectedCohort.value?.circleMinSize ?? null,
      maxSize: selectedCohort.value?.circleMaxSize ?? null,
    })

    for (const cohortParticipantId of suggestion.cohortParticipantIds || []) {
      await cohortsStore.placeParticipant(circle.id, {
        cohortParticipantId,
        placementSource: 'SUGGESTED',
      })
    }

    toast.success('Suggested circle created.')
    await refreshAfterMutation()
  } catch (circleError: any) {
    toast.error(circleError?.response?.data?.message || circleError?.message || 'Failed to create suggested circle')
  }
}

const placeParticipant = async (participant: CompanyProgramCohortParticipantRecord) => {
  const circleId = placementCircleByParticipant[participant.id]
  if (!circleId) {
    toast.error('Choose a circle before placing this participant')
    return
  }

  try {
    await cohortsStore.placeParticipant(circleId, {
      cohortParticipantId: participant.id,
      placementSource: 'ADMIN_PLACED',
    })
    placementCircleByParticipant[participant.id] = ''
    toast.success('Participant placed in circle.')
    await refreshAfterMutation()
  } catch (placementError: any) {
    toast.error(placementError?.response?.data?.message || placementError?.message || 'Failed to place participant')
  }
}

const moveMembership = async (membershipId: string) => {
  const targetCircleId = membershipTargetCircleId[membershipId]
  if (!targetCircleId) {
    toast.error('Choose a target circle before moving this member')
    return
  }

  try {
    await cohortsStore.moveMembership(membershipId, { targetCircleId })
    membershipTargetCircleId[membershipId] = ''
    toast.success('Circle member moved.')
    await refreshAfterMutation()
  } catch (moveError: any) {
    toast.error(moveError?.response?.data?.message || moveError?.message || 'Failed to move circle member')
  }
}

const removeMembership = async (membershipId: string) => {
  try {
    await cohortsStore.removeMembership(membershipId)
    toast.success('Circle member removed.')
    await refreshAfterMutation()
  } catch (removeError: any) {
    toast.error(removeError?.response?.data?.message || removeError?.message || 'Failed to remove circle member')
  }
}

const finalizeCircles = async () => {
  if (!cohortId.value) return

  try {
    await cohortsStore.finalizeCircles(cohortId.value)
    toast.success('Circles finalized.')
    await refreshAfterMutation()
  } catch (finalizeError: any) {
    toast.error(finalizeError?.response?.data?.message || finalizeError?.message || 'Failed to finalize circles')
  }
}

const canOpenIntake = computed(() => ['DRAFT', 'INTAKE_CLOSED'].includes(String(selectedCohort.value?.status || '')))
const canCloseIntake = computed(() => selectedCohort.value?.status === 'INTAKE_OPEN')
const canFinalizeCircles = computed(() => Boolean(circles.value.length) && !unplacedParticipants.value.length)

watch(cohortId, async () => {
  await loadWorkspace()
}, { immediate: true })

watch(activeTab, value => {
  router.replace({
    query: value === 'overview' ? {} : { tab: value },
  })
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-1">
        <Button variant="ghost" class="w-fit px-0 text-muted-foreground" @click="router.push(`/app/admin/programs/${programId}?tab=cohorts`)">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back to cohorts
        </Button>
        <div class="flex flex-wrap items-center gap-2">
          <Badge v-if="selectedCohort" :variant="statusTone(selectedCohort.status)">
            {{ statusLabel(selectedCohort.status) }}
          </Badge>
          <Badge v-if="selectedCohort?.code" variant="outline">
            <Ticket class="mr-1 h-3 w-3" />
            {{ selectedCohort.code }}
          </Badge>
        </div>
        <h1 class="text-2xl font-semibold tracking-tight">{{ selectedCohort?.name || 'Cohort workspace' }}</h1>
        <p class="text-sm text-muted-foreground">
          Manage cohort intake, plenary attendance, circles, and matching readiness.
        </p>
      </div>

      <div class="cohort-actions">
        <Button variant="outline" :disabled="isLoading" @click="loadWorkspace">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <Button variant="outline" :disabled="!selectedCohort || isSaving" @click="editDialogOpen = true">
          <Pencil class="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button v-if="canOpenIntake" :disabled="isSaving" @click="openIntake">
          <Link class="mr-2 h-4 w-4" />
          Open intake
        </Button>
        <Button v-if="canCloseIntake" variant="outline" :disabled="isSaving" @click="closeIntake">
          Close intake
        </Button>
      </div>
    </div>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div v-if="isLoading && !selectedCohort" class="space-y-3">
      <Skeleton class="h-28 w-full" />
      <Skeleton class="h-12 w-full" />
    </div>

    <template v-else>
      <div class="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Participants</CardDescription>
            <CardTitle class="text-3xl">{{ dashboard?.enrolledCount ?? selectedCohort?.participantCount ?? participants.length }}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Plenary attended</CardDescription>
            <CardTitle class="text-3xl">{{ dashboard?.plenaryAttendedCount ?? 0 }}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Circles</CardDescription>
            <CardTitle class="text-3xl">{{ dashboard?.circleCount ?? circles.length }}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Match completion</CardDescription>
            <CardTitle class="text-3xl">{{ formatPercent(dashboard?.matchCompletionRate) }}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs v-model="activeTab" class="space-y-4">
        <div class="cohort-tabbar" aria-label="Cohort workspace sections">
          <button
            type="button"
            class="cohort-tab"
            :class="{ 'cohort-tab--active': activeTab === 'overview' }"
            @click="activeTab = 'overview'"
          >
            Overview
          </button>
          <button
            type="button"
            class="cohort-tab"
            :class="{ 'cohort-tab--active': activeTab === 'participants' }"
            @click="activeTab = 'participants'"
          >
            Intake
            <span>{{ reviewParticipants.length }}</span>
          </button>
          <button
            type="button"
            class="cohort-tab"
            :class="{ 'cohort-tab--active': activeTab === 'plenary' }"
            @click="activeTab = 'plenary'"
          >
            Plenary
            <span>{{ dashboard?.plenaryAttendedCount ?? 0 }}</span>
          </button>
          <button
            type="button"
            class="cohort-tab"
            :class="{ 'cohort-tab--active': activeTab === 'circles' }"
            @click="activeTab = 'circles'"
          >
            Circles
            <span>{{ circles.length }}</span>
          </button>
          <button
            type="button"
            class="cohort-tab"
            :class="{ 'cohort-tab--active': activeTab === 'matching' }"
            @click="activeTab = 'matching'"
          >
            Matching
            <span>{{ selectedCohort?.matchedCount || 0 }}</span>
          </button>
        </div>

        <TabsContent value="overview" class="space-y-4">
          <div class="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Setup</CardTitle>
                <CardDescription>Cycle configuration for this company program.</CardDescription>
              </CardHeader>
              <CardContent class="grid gap-4 md:grid-cols-2">
                <div class="cohort-detail">
                  <span>Company program</span>
                  <strong>{{ selectedCohort?.companyProgramName || '-' }}</strong>
                </div>
                <div class="cohort-detail">
                  <span>Chapter</span>
                  <strong>{{ selectedCohort?.chapter || 'Not set' }}</strong>
                </div>
                <div class="cohort-detail">
                  <span>Region</span>
                  <strong>{{ selectedCohort?.region || 'Not set' }}</strong>
                </div>
                <div class="cohort-detail">
                  <span>Dates</span>
                  <strong>{{ formatDate(selectedCohort?.startsAt) }} - {{ formatDate(selectedCohort?.endsAt) }}</strong>
                </div>
                <div class="cohort-detail">
                  <span>Circle size</span>
                  <strong>{{ circleCapacityLabel(selectedCohort) }}</strong>
                </div>
                <div class="cohort-detail">
                  <span>Matching gate</span>
                  <strong>{{ selectedCohort?.matchingStartsAfterCirclesFinalized === false ? 'Before final circles' : 'After final circles' }}</strong>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intake Link</CardTitle>
                <CardDescription>Share this join code when self-join is open.</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="rounded-lg border bg-muted/20 p-4">
                  <div class="text-xs font-medium uppercase text-muted-foreground">Join code</div>
                  <div class="mt-1 break-all text-lg font-semibold">{{ selectedCohort?.code || '-' }}</div>
                </div>
                <div class="grid gap-2 text-sm text-muted-foreground">
                  <div>Self-join: {{ selectedCohort?.selfJoinEnabled ? 'Enabled' : 'Disabled' }}</div>
                  <div>Capacity: {{ selectedCohort?.selfJoinCapacity || 'Open' }}</div>
                  <div>Expires: {{ formatDate(selectedCohort?.selfJoinExpiresAt) }}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Indicators</CardTitle>
              <CardDescription>Signals from cohort progress and matching readiness.</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="dashboard?.riskIndicators?.length" class="flex flex-wrap gap-2">
                <Badge v-for="risk in dashboard.riskIndicators" :key="risk" variant="destructive">
                  <ShieldAlert class="mr-1 h-3 w-3" />
                  {{ statusLabel(risk) }}
                </Badge>
              </div>
              <p v-else class="text-sm text-muted-foreground">No cohort risk indicators are currently reported.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intake Review</CardTitle>
              <CardDescription>Confirm self-join requests, reject ineligible requests, and resolve duplicate reviews.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-if="isLoading" class="space-y-3">
                <Skeleton class="h-12 w-full" />
                <Skeleton class="h-12 w-full" />
              </div>
              <div v-else-if="!participants.length" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No participants are attached to this cohort yet.
              </div>
              <Table v-else>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duplicate review</TableHead>
                    <TableHead>Interests</TableHead>
                    <TableHead class="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="participant in participants" :key="participant.id">
                    <TableCell>
                      <div class="space-y-1">
                        <div class="font-medium">{{ participantName(participant) }}</div>
                        <div class="text-xs text-muted-foreground">
                          {{ participant.profileEmail || participant.profilePhone || participant.source }}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge :variant="participantStatusTone(participant.status)">
                        {{ statusLabel(participant.status) }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge :variant="duplicateTone(participant.duplicateStatus)">
                        {{ statusLabel(participant.duplicateStatus) }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div class="flex flex-wrap gap-1">
                        <span v-for="tag in participant.interestTags" :key="tag" class="mini-tag">{{ tag }}</span>
                      </div>
                    </TableCell>
                    <TableCell class="text-right">
                      <div class="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          :disabled="isSaving || ['CONFIRMED', 'PLENARY_ATTENDED', 'PLACED_IN_CIRCLE', 'ELIGIBLE_FOR_MATCHING', 'MATCHED', 'ACTIVE', 'COMPLETED'].includes(participant.status)"
                          @click="confirmParticipant(participant)"
                        >
                          <UserCheck class="mr-2 h-4 w-4" />
                          Confirm
                        </Button>
                        <Button size="sm" variant="ghost" :disabled="isSaving || participant.status === 'REJECTED'" @click="rejectParticipant(participant)">
                          <UserMinus class="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          v-if="participant.duplicateStatus === 'POSSIBLE_DUPLICATE'"
                          size="sm"
                          variant="outline"
                          :disabled="isSaving || !participant.duplicateCandidateProfileId"
                          @click="resolveDuplicate(participant, 'existing')"
                        >
                          Existing profile
                        </Button>
                        <Button
                          v-if="participant.duplicateStatus === 'POSSIBLE_DUPLICATE'"
                          size="sm"
                          variant="outline"
                          :disabled="isSaving || !participant.profileId"
                          @click="resolveDuplicate(participant, 'new')"
                        >
                          New profile
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plenary" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plenary Attendance</CardTitle>
              <CardDescription>Mark who attended the cohort plenary before circle placement.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-if="!plenaryParticipants.length" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No eligible participants are ready for plenary attendance yet.
              </div>

              <Table v-else>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Chapter</TableHead>
                    <TableHead class="text-right">Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="participant in plenaryParticipants" :key="participant.id">
                    <TableCell>
                      <div class="font-medium">{{ participantName(participant) }}</div>
                      <div class="text-xs text-muted-foreground">{{ participant.profileEmail || participant.profilePhone || '-' }}</div>
                    </TableCell>
                    <TableCell>
                      <Badge :variant="participantStatusTone(participant.status)">
                        {{ statusLabel(participant.status) }}
                      </Badge>
                    </TableCell>
                    <TableCell>{{ participant.chapter || selectedCohort?.chapter || '-' }}</TableCell>
                    <TableCell class="text-right">
                      <div class="flex flex-wrap justify-end gap-2">
                        <Button size="sm" :disabled="isSaving" @click="recordPlenaryAttendance(participant, 'ATTENDED')">
                          <CheckCircle2 class="mr-2 h-4 w-4" />
                          Attended
                        </Button>
                        <Button size="sm" variant="outline" :disabled="isSaving" @click="recordPlenaryAttendance(participant, 'EXCUSED')">
                          Excused
                        </Button>
                        <Button size="sm" variant="ghost" :disabled="isSaving" @click="recordPlenaryAttendance(participant, 'ABSENT')">
                          <XCircle class="mr-2 h-4 w-4" />
                          Absent
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="circles" class="space-y-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-xl font-semibold tracking-tight">Form circles</h2>
              <p class="text-sm text-muted-foreground">Group attendees into common-interest circles of {{ circleCapacityLabel(selectedCohort) }}.</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button variant="outline" :disabled="isSaving || isLoading" @click="suggestCircles">
                <Shuffle class="mr-2 h-4 w-4" />
                Refresh suggestions
              </Button>
              <Button :disabled="isSaving || !canFinalizeCircles" @click="finalizeCircles">
                <ClipboardCheck class="mr-2 h-4 w-4" />
                Confirm circles as final
              </Button>
            </div>
          </div>

          <Alert v-if="unplacedParticipants.length">
            <AlertDescription>
              {{ unplacedParticipants.length }} participants are not placed in a circle yet.
            </AlertDescription>
          </Alert>

          <div class="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
            <div class="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Unplaced participants</CardTitle>
                  <CardDescription>Place each attendee into a circle after plenary attendance is confirmed.</CardDescription>
                </CardHeader>
                <CardContent class="space-y-3">
                  <div v-if="!unplacedParticipants.length" class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Every active participant is placed.
                  </div>
                  <div v-for="participant in unplacedParticipants" v-else :key="participant.id" class="rounded-lg border p-3">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div class="font-medium">{{ participantName(participant) }}</div>
                        <div class="mt-1 flex flex-wrap gap-1">
                          <span v-for="tag in participant.interestTags" :key="tag" class="mini-tag">{{ tag }}</span>
                        </div>
                      </div>
                      <div class="grid min-w-[260px] gap-2 sm:grid-cols-[1fr,auto]">
                        <Select v-model="placementCircleByParticipant[participant.id]" :disabled="!circles.length">
                          <SelectTrigger>
                            <SelectValue placeholder="Choose circle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem v-for="circle in circles" :key="circle.id" :value="circle.id">
                              {{ circle.name }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" :disabled="isSaving || !placementCircleByParticipant[participant.id]" @click="placeParticipant(participant)">
                          Place
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Create Circle</CardTitle>
                  <CardDescription>Add a new common-interest circle manually.</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  <div class="grid gap-3 md:grid-cols-2">
                    <div class="grid gap-2">
                      <label class="text-sm font-medium">Circle name</label>
                      <Input v-model="newCircle.name" placeholder="STEM Risers" />
                    </div>
                    <div class="grid gap-2">
                      <label class="text-sm font-medium">Theme</label>
                      <Input v-model="newCircle.theme" placeholder="STEM" />
                    </div>
                    <div class="grid gap-2">
                      <label class="text-sm font-medium">Min size</label>
                      <Input v-model="newCircle.minSize" type="number" min="1" />
                    </div>
                    <div class="grid gap-2">
                      <label class="text-sm font-medium">Max size</label>
                      <Input v-model="newCircle.maxSize" type="number" min="1" />
                    </div>
                  </div>
                  <div class="grid gap-2">
                    <label class="text-sm font-medium">Interest tags</label>
                    <Input v-model="newCircle.interestTags" placeholder="STEM, career readiness" />
                  </div>
                  <div class="grid gap-2">
                    <label class="text-sm font-medium">Next session</label>
                    <Input v-model="newCircle.nextSessionAt" type="datetime-local" />
                  </div>
                  <Button :disabled="isSaving" @click="createCircle">
                    <CircleDot class="mr-2 h-4 w-4" />
                    Create circle
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div class="space-y-4">
              <Card v-if="suggestions?.suggestedCircles?.length">
                <CardHeader>
                  <CardTitle>Suggested Groupings</CardTitle>
                  <CardDescription>Suggestions are based on shared interest tags.</CardDescription>
                </CardHeader>
                <CardContent class="space-y-3">
                  <div v-for="suggestion in suggestions.suggestedCircles" :key="suggestion.name" class="rounded-lg border p-3">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div class="font-medium">{{ suggestion.name }}</div>
                        <div class="mt-1 text-xs text-muted-foreground">
                          {{ suggestion.participantCount }} participants | {{ suggestion.participantNames.join(', ') }}
                        </div>
                        <div class="mt-2 flex flex-wrap gap-1">
                          <span v-for="tag in suggestion.interestTags" :key="tag" class="mini-tag">{{ tag }}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" :disabled="isSaving" @click="createCircleFromSuggestion(suggestion)">
                        Create
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Circles in this cohort</CardTitle>
                  <CardDescription>Review membership, move participants, or remove placements before finalizing.</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  <div v-if="!circles.length" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No circles have been created yet.
                  </div>

                  <div v-for="circle in circles" v-else :key="circle.id" class="circle-panel">
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div class="font-semibold">{{ circle.name }}</div>
                        <div class="text-sm text-muted-foreground">
                          {{ circle.memberCount || 0 }} members | {{ circle.theme || 'No theme set' }}
                        </div>
                      </div>
                      <Badge :variant="circle.memberCount < (circle.minSize || selectedCohort?.circleMinSize || 5) ? 'outline' : 'secondary'">
                        {{ circle.memberCount || 0 }} / {{ circle.minSize || selectedCohort?.circleMinSize || 5 }}-{{ circle.maxSize || selectedCohort?.circleMaxSize || 10 }}
                      </Badge>
                    </div>

                    <div class="mt-3 space-y-2">
                      <div v-if="!(circle.members || []).length" class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        No members placed yet.
                      </div>
                      <div v-for="member in circle.members || []" v-else :key="member.membershipId" class="circle-member-row">
                        <div>
                          <div class="font-medium">{{ memberName(member) }}</div>
                          <div class="text-xs text-muted-foreground">{{ statusLabel(member.placementSource) }}</div>
                        </div>
                        <div class="grid gap-2 sm:grid-cols-[180px,auto,auto]">
                          <Select v-model="membershipTargetCircleId[member.membershipId]">
                            <SelectTrigger>
                              <SelectValue placeholder="Move to" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                v-for="targetCircle in circles.filter((item: CommonInterestCircleRecord) => item.id !== circle.id)"
                                :key="targetCircle.id"
                                :value="targetCircle.id"
                              >
                                {{ targetCircle.name }}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" :disabled="isSaving || !membershipTargetCircleId[member.membershipId]" @click="moveMembership(member.membershipId)">
                            Move
                          </Button>
                          <Button size="sm" variant="ghost" :disabled="isSaving" @click="removeMembership(member.membershipId)">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="matching" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matching Readiness</CardTitle>
              <CardDescription>1:1 matching opens after cohort gates are satisfied.</CardDescription>
            </CardHeader>
            <CardContent class="grid gap-4 md:grid-cols-2">
              <div class="cohort-detail">
                <span>Confirmed participants</span>
                <strong>{{ selectedCohort?.confirmedCount || 0 }}</strong>
              </div>
              <div class="cohort-detail">
                <span>Unplaced participants</span>
                <strong>{{ selectedCohort?.unplacedCount ?? unplacedParticipants.length }}</strong>
              </div>
              <div class="cohort-detail">
                <span>Matched participants</span>
                <strong>{{ selectedCohort?.matchedCount || 0 }}</strong>
              </div>
              <div class="cohort-detail">
                <span>Feedback response rate</span>
                <strong>{{ formatPercent(dashboard?.feedbackResponseRate) }}</strong>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription>
              Matching is {{ selectedCohort?.matchingStartsAfterCirclesFinalized === false ? 'not blocked by final circle status' : 'blocked until circles are finalized' }} for this cohort.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </template>

    <CompanyProgramCohortEditorDialog
      v-if="selectedCohort"
      v-model:open="editDialogOpen"
      :program-id="programId"
      :cohort="selectedCohort"
      @saved="refreshAfterMutation"
    />
  </div>
</template>

<style scoped>
.cohort-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (min-width: 1024px) {
  .cohort-actions {
    justify-content: flex-end;
  }
}

.cohort-tabbar {
  display: inline-flex;
  width: 100%;
  align-items: center;
  gap: 4px;
  border: 1px solid #ead2e4;
  border-radius: 18px;
  background: #fff;
  padding: 4px;
}

.cohort-tab {
  display: inline-flex;
  flex: 1 1 0;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 11px;
  color: #6b5b6a;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  padding: 0 12px;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.cohort-tab span {
  display: inline-flex;
  min-width: 22px;
  height: 20px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f6edf4;
  color: #8a337f;
  font-size: 11px;
  padding: 0 6px;
}

.cohort-tab--active {
  background: #a03b93;
  color: #fff;
}

.cohort-tab--active span {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.cohort-detail {
  display: grid;
  gap: 4px;
  border: 1px solid #f1e3ed;
  border-radius: 8px;
  background: #fffafd;
  padding: 14px;
}

.cohort-detail span {
  color: #7a6d78;
  font-size: 12px;
  font-weight: 600;
}

.cohort-detail strong {
  color: #2f2930;
  font-size: 14px;
}

.mini-tag {
  display: inline-flex;
  min-height: 22px;
  align-items: center;
  border: 1px solid #ead2e4;
  border-radius: 999px;
  background: #fbf6fa;
  color: #6f2d66;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  padding: 0 8px;
}

.circle-panel {
  border: 1px solid #ead2e4;
  border-radius: 8px;
  background: #fff;
  padding: 16px;
}

.circle-member-row {
  display: grid;
  gap: 12px;
  align-items: center;
  border: 1px solid #f0e2eb;
  border-radius: 8px;
  padding: 10px;
}

@media (min-width: 768px) {
  .circle-member-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }
}
</style>
