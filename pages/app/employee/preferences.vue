<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { useReviewsStore } from '@/store/modules/reviews'
import type {
  ParticipantConsentDecisionRecord,
  ParticipantConsentStatus,
  ParticipantConsentType,
} from '@/http/requests/app/companyPrograms'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { BriefcaseBusiness, GitBranch, RefreshCw, Settings2, ShieldCheck, UserRoundCheck } from 'lucide-vue-next'

definePageMeta({
  title: 'Preferences',
  description: 'Mentorship preferences and participation settings',
  requiresAuth: true,
  permissions: ['profile:view'],
})

const companyProgramsStore = useCompanyProgramsStore()
const reviewsStore = useReviewsStore()
const toast = useAppToast()

const consentDefinitions: Array<{
  type: ParticipantConsentType
  title: string
  description: string
  required?: boolean
}> = [
  {
    type: 'PROGRAM_PARTICIPATION',
    title: 'Program participation',
    description: 'Required before you can book company-program sessions with your assigned mentor.',
    required: true,
  },
  {
    type: 'AGGREGATED_ANALYTICS',
    title: 'Aggregated analytics',
    description: 'Allows anonymized participation and outcome reporting to appear in employer analytics.',
  },
  {
    type: 'EMPLOYER_PROGRESS_VISIBILITY',
    title: 'Employer progress visibility',
    description: 'Lets your employer see milestone and completion progress without exposing private review comments.',
  },
]

const loading = computed(() =>
  companyProgramsStore.employeeProgramsLoading
  || companyProgramsStore.employeeConsentsLoading
  || companyProgramsStore.employeeMatchesLoading
  || reviewsStore.loading,
)

const workspaceError = computed(() =>
  companyProgramsStore.employeeProgramsError
  || companyProgramsStore.employeeConsentsError
  || companyProgramsStore.employeeMatchesError
  || reviewsStore.error
  || null,
)

const assignedMatches = computed(() =>
  companyProgramsStore.employeeMatches.filter(match => Boolean(match.mentorAssignment)),
)

const adminAssignedCount = computed(() =>
  companyProgramsStore.employeePrograms.filter(program => program.matchingMode === 'ADMIN_ASSIGN').length,
)

const employeeSelectedCount = computed(() =>
  companyProgramsStore.employeePrograms.filter(program => program.matchingMode === 'EMPLOYEE_SELECT').length,
)

const systemAssignedCount = computed(() =>
  companyProgramsStore.employeePrograms.filter(program => program.matchingMode === 'SYSTEM_ASSIGN').length,
)

const consentedProgramsCount = computed(() =>
  companyProgramsStore.employeePrograms.filter(program => program.consentSummary?.programParticipationGranted).length,
)

const participantConsentSavingIds = computed(() => companyProgramsStore.participantConsentSavingIds)

const consentWorkspacesByParticipantId = computed(() =>
  new Map(companyProgramsStore.employeeConsents.map(workspace => [workspace.participantId, workspace])),
)

const loadWorkspace = async () => {
  try {
    await Promise.all([
      companyProgramsStore.loadMyCompanyPrograms(),
      companyProgramsStore.loadMyCompanyProgramConsents(),
      companyProgramsStore.loadMyCompanyProgramMatches(),
      reviewsStore.loadMyReviews(),
    ])
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load preferences workspace')
  }
}

const humanize = (value?: string | null) =>
  String(value || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase())

const formatDate = (value?: string | null) => {
  if (!value) return 'Flexible schedule'

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getConsentDecision = (participantId: string, consentType: ParticipantConsentType) =>
  consentWorkspacesByParticipantId.value
    .get(participantId)
    ?.consents.find(consent => consent.consentType === consentType)

const consentBadgeVariant = (decision?: ParticipantConsentDecisionRecord | null) => {
  if (!decision || decision.pending) return 'outline'
  if (decision.status === 'GRANTED') return 'secondary'
  return 'destructive'
}

const consentBadgeLabel = (decision?: ParticipantConsentDecisionRecord | null) => {
  if (!decision || decision.pending) return 'Pending'
  return humanize(decision.status)
}

const isConsentSaving = (participantId: string) =>
  participantConsentSavingIds.value.includes(participantId)

const updateConsent = async (participantId: string, consentType: ParticipantConsentType, granted: boolean) => {
  try {
    await companyProgramsStore.updateParticipantConsent(
      participantId,
      consentType,
      granted ? 'GRANTED' : 'REVOKED',
    )
  } catch {
    // store already handles toast
  }
}

onMounted(loadWorkspace)
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Preferences</h1>
        <p class="text-sm text-muted-foreground">
          Manage consent, visibility, and matching expectations across your company mentorship programs.
        </p>
      </div>

      <Button variant="outline" @click="loadWorkspace" :disabled="loading">
        <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': loading }" />
        Refresh
      </Button>
    </div>

    <Alert v-if="workspaceError" variant="destructive">
      <AlertDescription>{{ workspaceError }}</AlertDescription>
    </Alert>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Programs</CardDescription>
          <CardTitle class="text-3xl">{{ companyProgramsStore.employeePrograms.length }}</CardTitle>
        </CardHeader>
        <CardContent class="text-sm text-muted-foreground">
          Active company-program memberships
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Assigned Mentors</CardDescription>
          <CardTitle class="text-3xl">{{ assignedMatches.length }}</CardTitle>
        </CardHeader>
        <CardContent class="text-sm text-muted-foreground">
          Matches currently confirmed
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Participation Ready</CardDescription>
          <CardTitle class="text-3xl">{{ consentedProgramsCount }}</CardTitle>
        </CardHeader>
        <CardContent class="text-sm text-muted-foreground">
          Programs with participation consent granted
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Reviews Waiting</CardDescription>
          <CardTitle class="text-3xl">{{ reviewsStore.summary?.actionRequired || 0 }}</CardTitle>
        </CardHeader>
        <CardContent class="text-sm text-muted-foreground">
          WhatsApp reviews still requiring your response
        </CardContent>
      </Card>
    </div>

    <div v-if="loading" class="space-y-3">
      <Skeleton class="h-32 w-full" />
      <Skeleton class="h-32 w-full" />
      <Skeleton class="h-32 w-full" />
    </div>

    <template v-else>
      <Alert>
        <Settings2 class="h-4 w-4" />
        <AlertDescription>
          Program participation consent is now a real gate for company-program booking. Grant it for any program where you want to schedule mentorship sessions.
        </AlertDescription>
      </Alert>

      <div class="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Matching Setup</CardTitle>
            <CardDescription>How your current company programs are assigning mentors.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-lg border p-4">
                <div class="text-sm text-muted-foreground">Admin assigned</div>
                <div class="mt-2 text-2xl font-semibold">{{ adminAssignedCount }}</div>
              </div>
              <div class="rounded-lg border p-4">
                <div class="text-sm text-muted-foreground">Employee selected</div>
                <div class="mt-2 text-2xl font-semibold">{{ employeeSelectedCount }}</div>
              </div>
              <div class="rounded-lg border p-4">
                <div class="text-sm text-muted-foreground">System assigned</div>
                <div class="mt-2 text-2xl font-semibold">{{ systemAssignedCount }}</div>
              </div>
            </div>

            <div v-if="!companyProgramsStore.employeePrograms.length" class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              You are not enrolled in any company programs yet, so there are no matching preferences in effect.
            </div>

            <div
              v-for="program in companyProgramsStore.employeePrograms"
              :key="program.participantId"
              class="rounded-lg border p-4"
            >
              <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div class="space-y-1">
                  <div class="font-medium">{{ program.name }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ program.objective || program.targetAudienceDescription || 'No objective shared yet' }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ formatDate(program.startsAt) }} - {{ formatDate(program.endsAt) }}
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <Badge variant="outline">{{ humanize(program.matchingMode) }}</Badge>
                  <Badge variant="secondary">{{ humanize(program.participantStatus) }}</Badge>
                  <Badge :variant="program.consentSummary?.programParticipationGranted ? 'secondary' : 'outline'">
                    {{ program.consentSummary?.programParticipationGranted ? 'Consent ready' : 'Consent pending' }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consent & Visibility</CardTitle>
              <CardDescription>Grant or revoke company-program specific consent decisions.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-if="!companyProgramsStore.employeePrograms.length" class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No company programs are available yet, so there are no consent decisions to manage.
              </div>

              <div
                v-for="program in companyProgramsStore.employeePrograms"
                :key="`${program.participantId}-consent`"
                class="rounded-lg border p-4"
              >
                <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div class="font-medium">{{ program.name }}</div>
                    <div class="text-sm text-muted-foreground">
                      {{ program.companyName || 'Employer-managed mentorship program' }}
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {{ program.consentSummary?.grantedCount || 0 }} granted
                    </Badge>
                    <Badge v-if="program.consentSummary?.pendingCount" variant="secondary">
                      {{ program.consentSummary?.pendingCount }} pending
                    </Badge>
                  </div>
                </div>

                <div class="mt-4 space-y-3">
                  <div
                    v-for="consent in consentDefinitions"
                    :key="`${program.participantId}-${consent.type}`"
                    class="rounded-lg border bg-muted/20 p-3"
                  >
                    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div class="space-y-1">
                        <div class="flex items-center gap-2">
                          <div class="font-medium">{{ consent.title }}</div>
                          <Badge v-if="consent.required" variant="outline">Required</Badge>
                        </div>
                        <div class="text-sm text-muted-foreground">
                          {{ consent.description }}
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        <Badge :variant="consentBadgeVariant(getConsentDecision(program.participantId, consent.type))">
                          {{ consentBadgeLabel(getConsentDecision(program.participantId, consent.type)) }}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          :disabled="isConsentSaving(program.participantId)"
                          @click="updateConsent(program.participantId, consent.type, true)"
                        >
                          Grant
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          :disabled="isConsentSaving(program.participantId)"
                          @click="updateConsent(program.participantId, consent.type, false)"
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Current Mentor Assignments</CardTitle>
              <CardDescription>Assignments already confirmed inside your company programs.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-3">
              <div v-if="!assignedMatches.length" class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No mentor assignments have been confirmed yet.
              </div>

              <div
                v-for="match in assignedMatches"
                :key="match.participantId"
                class="rounded-lg border p-4"
              >
                <div class="flex items-start gap-3">
                  <UserRoundCheck class="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div class="space-y-1">
                    <div class="font-medium">{{ match.mentorAssignment?.mentorName }}</div>
                    <div class="text-sm text-muted-foreground">
                      {{ match.programName }}<span v-if="match.mentorAssignment?.title"> · {{ match.mentorAssignment?.title }}</span>
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ match.mentorAssignment?.company || 'Mentor company not provided' }}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Participation Rules</CardTitle>
              <CardDescription>The operational settings currently affecting you.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-3">
              <div class="rounded-lg border p-4">
                <div class="flex items-start gap-3">
                  <BriefcaseBusiness class="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div class="space-y-1 text-sm">
                    <div class="font-medium">Program setup is employer managed</div>
                    <div class="text-muted-foreground">
                      Enrollment, matching mode, and company-program visibility defaults are currently controlled by your employer’s admin team.
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-lg border p-4">
                <div class="flex items-start gap-3">
                  <GitBranch class="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div class="space-y-1 text-sm">
                    <div class="font-medium">Rematch decisions use review signals</div>
                    <div class="text-muted-foreground">
                      Low-fit or do-not-continue review responses are escalated into the admin trust queue before mentor assignments are changed.
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-lg border p-4">
                <div class="flex items-start gap-3">
                  <ShieldCheck class="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div class="space-y-1 text-sm">
                    <div class="font-medium">Reviews remain WhatsApp-first</div>
                    <div class="text-muted-foreground">
                      Session reviews and fit reviews are delivered and completed in WhatsApp, then reflected back in your in-app review status.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>
