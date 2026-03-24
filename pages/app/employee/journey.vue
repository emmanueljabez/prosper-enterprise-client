<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { Calendar, CheckCircle2, ClipboardList, Milestone, RefreshCw, Target, UserCheck } from 'lucide-vue-next'

definePageMeta({
  title: 'My Journey',
  description: 'Track your company-program mentorship progress and action items',
  requiresAuth: true,
  permissions: ['sessions:view'],
})

const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()

const journeyStats = computed(() => ({
  programs: companyProgramsStore.employeeJourneys.length,
  completedSessions: companyProgramsStore.employeeJourneys.reduce((sum, journey) => sum + (journey.completedSessions || 0), 0),
  completedMilestones: companyProgramsStore.employeeJourneys.reduce((sum, journey) => sum + (journey.completedJourneySteps || 0), 0),
  openActionItems: companyProgramsStore.employeeJourneys.reduce((sum, journey) => sum + (journey.openActionItemCount || 0), 0),
}))

const participantStatusTone = (status: string) => ({
  ENROLLED: 'secondary',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  WITHDRAWN: 'destructive',
}[status] as 'default' | 'secondary' | 'outline' | 'destructive')

const sessionStatusTone = (status: string) => ({
  COMPLETED: 'outline',
  CONFIRMED: 'default',
  SCHEDULED: 'default',
  IN_PROGRESS: 'default',
  PENDING: 'secondary',
  CANCELLED: 'destructive',
}[status] as 'default' | 'secondary' | 'outline' | 'destructive')

const journeyStepTone = (status: string) => ({
  READY: 'secondary',
  COMPLETED: 'outline',
  BLOCKED: 'destructive',
  SKIPPED: 'outline',
  PENDING: 'secondary',
}[status] as 'default' | 'secondary' | 'outline' | 'destructive')

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

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'No due date'
  }

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const loadJourneys = async () => {
  try {
    await companyProgramsStore.loadMyCompanyProgramJourneys()
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load your journey progress')
  }
}

const toggleActionItem = async (actionItem: any) => {
  if (!actionItem?.canBeCompletedByEmployee) {
    return
  }

  try {
    await companyProgramsStore.updateJourneyActionItem(actionItem.actionItemId, !actionItem.completed)
  } catch {
    // Toast is handled in the store.
  }
}

const completeJourneyStep = async (step: any) => {
  if (!step?.canBeCompletedByEmployee || step?.status !== 'READY') {
    return
  }

  try {
    await companyProgramsStore.completeJourneyStep(step.journeyInstanceStepId)
  } catch {
    // Toast is handled in the store.
  }
}

const stepTypeLabel = (value?: string | null) =>
  String(value || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())

onMounted(() => {
  loadJourneys()
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">My Journey</h1>
        <p class="text-sm text-muted-foreground">
          Track your mentorship progress, next sessions, and follow-through across company programs.
        </p>
      </div>

      <Button variant="outline" @click="loadJourneys" :disabled="companyProgramsStore.employeeJourneysLoading">
        <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': companyProgramsStore.employeeJourneysLoading }" />
        Refresh
      </Button>
    </div>

    <div class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Programs</CardDescription>
          <CardTitle class="text-3xl">{{ journeyStats.programs }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Completed Sessions</CardDescription>
          <CardTitle class="text-3xl">{{ journeyStats.completedSessions }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Milestones Completed</CardDescription>
          <CardTitle class="text-3xl">{{ journeyStats.completedMilestones }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Open Action Items</CardDescription>
          <CardTitle class="text-3xl">{{ journeyStats.openActionItems }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <Alert v-if="companyProgramsStore.employeeJourneysError" variant="destructive">
      <AlertDescription>{{ companyProgramsStore.employeeJourneysError }}</AlertDescription>
    </Alert>

    <div v-if="companyProgramsStore.employeeJourneysLoading" class="grid gap-4 xl:grid-cols-2">
      <Skeleton class="h-[420px] w-full" />
      <Skeleton class="h-[420px] w-full" />
    </div>

    <div v-else-if="!companyProgramsStore.employeeJourneys.length" class="rounded-lg border border-dashed p-10 text-center">
      <Target class="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 class="mt-4 text-lg font-medium">No journey activity yet</h2>
      <p class="mt-2 text-sm text-muted-foreground">
        Once your employer launches a program and sessions start happening, your milestones and action items will appear here.
      </p>
    </div>

    <div v-else class="grid gap-4 xl:grid-cols-2">
      <Card v-for="journey in companyProgramsStore.employeeJourneys" :key="journey.participantId" class="h-full">
        <CardHeader class="space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <CardTitle class="text-lg">{{ journey.programName }}</CardTitle>
              <CardDescription>{{ journey.companyName || 'Employer program' }}</CardDescription>
              <div v-if="journey.journeyTemplateName" class="text-xs text-muted-foreground">
                {{ journey.journeyTemplateName }}
              </div>
              <div v-if="journey.catalogJourneySummary" class="text-xs text-muted-foreground">
                Prosper journey: {{ journey.catalogJourneySummary }}
              </div>
            </div>
            <Badge :variant="participantStatusTone(journey.participantStatus)">
              {{ companyProgramsStore.participantStatusLabel(journey.participantStatus) }}
            </Badge>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Journey progress</span>
              <span class="font-medium">{{ journey.progressPercent || 0 }}%</span>
            </div>
            <div class="h-2 rounded-full bg-muted">
              <div
                class="h-2 rounded-full bg-primary transition-all"
                :style="{ width: `${Math.max(0, Math.min(journey.progressPercent || 0, 100))}%` }"
              />
            </div>
            <div class="text-xs text-muted-foreground">
              {{ journey.completedJourneySteps || 0 }} of {{ journey.totalJourneySteps || 0 }} milestones completed
            </div>
          </div>
        </CardHeader>

        <CardContent class="space-y-5">
          <div v-if="journey.mentorAssignment" class="rounded-lg border bg-muted/30 p-4">
            <div class="flex items-center gap-2 text-sm font-medium">
              <UserCheck class="h-4 w-4" />
              {{ journey.mentorAssignment.mentorName }}
            </div>
            <div class="mt-1 text-sm text-muted-foreground">
              {{ journey.mentorAssignment.title || 'Mentor' }}<span v-if="journey.mentorAssignment.company"> · {{ journey.mentorAssignment.company }}</span>
            </div>
          </div>

          <div v-if="journey.nextSession" class="space-y-2">
            <div class="flex items-center gap-2 text-sm font-medium">
              <Calendar class="h-4 w-4 text-muted-foreground" />
              <span>Next Session</span>
            </div>
            <div class="rounded-lg border p-4 text-sm">
              <div class="font-medium">{{ journey.nextSession.title }}</div>
              <div class="mt-1 text-muted-foreground">{{ formatDateTime(journey.nextSession.scheduledStart) }}</div>
              <Badge class="mt-3" :variant="sessionStatusTone(journey.nextSession.status)">
                {{ journey.nextSession.status }}
              </Badge>
            </div>
          </div>

          <div v-if="journey.latestOutcomeSummary || journey.latestReflectionPrompt" class="space-y-2">
            <div class="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 class="h-4 w-4 text-muted-foreground" />
              <span>Latest Mentor Summary</span>
            </div>
            <div class="rounded-lg border p-4 text-sm text-muted-foreground">
              <p v-if="journey.latestOutcomeSummary">{{ journey.latestOutcomeSummary }}</p>
              <p v-if="journey.latestReflectionPrompt" class="mt-3">
                <span class="font-medium text-foreground">Reflection prompt:</span>
                {{ journey.latestReflectionPrompt }}
              </p>
            </div>
          </div>

          <div v-if="journey.steps?.length" class="space-y-3">
            <div class="flex items-center gap-2 text-sm font-medium">
              <Milestone class="h-4 w-4 text-muted-foreground" />
              <span>Journey Milestones</span>
            </div>

            <div class="space-y-3">
              <div
                v-for="step in journey.steps"
                :key="step.journeyInstanceStepId"
                class="rounded-lg border p-4"
              >
                <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div class="space-y-2">
                    <div class="flex flex-wrap items-center gap-2">
                      <Badge :variant="journeyStepTone(step.status)">{{ step.status }}</Badge>
                      <Badge variant="outline">{{ stepTypeLabel(step.stepType) }}</Badge>
                      <Badge v-if="step.required" variant="outline">Required</Badge>
                    </div>
                    <div>
                      <div class="font-medium">{{ step.title }}</div>
                      <div v-if="step.description" class="text-sm text-muted-foreground">
                        {{ step.description }}
                      </div>
                    </div>
                    <div class="text-xs text-muted-foreground">
                      <span v-if="step.completedAt">Completed {{ formatDateTime(step.completedAt) }}</span>
                      <span v-else-if="step.dueAt">Due {{ formatDate(step.dueAt) }}</span>
                      <span v-else>No due date</span>
                    </div>
                    <div v-if="step.blockedReason && step.status === 'BLOCKED'" class="text-xs text-muted-foreground">
                      {{ step.blockedReason }}
                    </div>
                  </div>

                  <Button
                    v-if="step.canBeCompletedByEmployee"
                    size="sm"
                    variant="outline"
                    @click="completeJourneyStep(step)"
                    :disabled="step.status !== 'READY' || companyProgramsStore.isJourneyStepSaving(step.journeyInstanceStepId)"
                  >
                    Mark complete
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="journey.actionItems?.length" class="space-y-3">
            <div class="flex items-center gap-2 text-sm font-medium">
              <ClipboardList class="h-4 w-4 text-muted-foreground" />
              <span>Action Items</span>
            </div>

            <div class="space-y-3">
              <div
                v-for="actionItem in journey.actionItems"
                :key="actionItem.actionItemId"
                class="rounded-lg border p-4"
              >
                <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div class="space-y-2">
                    <div class="flex flex-wrap items-center gap-2">
                      <Badge :variant="actionItem.completed ? 'outline' : 'secondary'">
                        {{ actionItem.completed ? 'Completed' : 'Open' }}
                      </Badge>
                      <Badge variant="outline">{{ actionItem.ownerType }}</Badge>
                      <Badge v-if="actionItem.sessionTitle" variant="outline">{{ actionItem.sessionTitle }}</Badge>
                    </div>
                    <p class="text-sm">{{ actionItem.description }}</p>
                    <p class="text-xs text-muted-foreground">
                      Due {{ formatDate(actionItem.dueAt) }}
                    </p>
                  </div>

                  <Button
                    v-if="actionItem.canBeCompletedByEmployee"
                    size="sm"
                    variant="outline"
                    @click="toggleActionItem(actionItem)"
                    :disabled="companyProgramsStore.isJourneyActionItemSaving(actionItem.actionItemId)"
                  >
                    {{ actionItem.completed ? 'Reopen' : 'Mark Done' }}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="journey.recentSessions?.length" class="space-y-3">
            <div class="text-sm font-medium">Recent Sessions</div>
            <div class="space-y-3">
              <div
                v-for="session in journey.recentSessions"
                :key="session.sessionId"
                class="rounded-lg border p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-medium">{{ session.title }}</div>
                    <div class="text-xs text-muted-foreground">
                      {{ formatDateTime(session.scheduledStart) }}
                    </div>
                  </div>
                  <Badge :variant="sessionStatusTone(session.status)">{{ session.status }}</Badge>
                </div>

                <p v-if="session.outcomeSummary" class="mt-3 text-sm text-muted-foreground">
                  {{ session.outcomeSummary }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
