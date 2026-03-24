<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { useReviewsStore } from '@/store/modules/reviews'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { BookOpen, CalendarClock, ClipboardList, MessageCircleMore, RefreshCw, Route, UserRoundCheck } from 'lucide-vue-next'

definePageMeta({
  title: 'Employee Dashboard',
  description: 'Your corporate mentorship dashboard',
  requiresAuth: true,
  permissions: ['dashboard:view'],
})

const companyProgramsStore = useCompanyProgramsStore()
const reviewsStore = useReviewsStore()
const toast = useAppToast()

const {
  employeePrograms,
  employeeProgramsLoading,
  employeeProgramsError,
  employeeMatches,
  employeeMatchesLoading,
  employeeMatchesError,
  employeeJourneys,
  employeeJourneysLoading,
  employeeJourneysError,
} = storeToRefs(companyProgramsStore)

const { summary: reviewSummary, loading: reviewsLoading, error: reviewsError } = storeToRefs(reviewsStore)

const loading = computed(() =>
  employeeProgramsLoading.value
  || employeeMatchesLoading.value
  || employeeJourneysLoading.value
  || reviewsLoading.value,
)

const dashboardError = computed(() =>
  employeeProgramsError.value
  || employeeMatchesError.value
  || employeeJourneysError.value
  || reviewsError.value
  || null,
)

const nextSessions = computed(() =>
  employeeJourneys.value
    .filter(journey => journey.nextSession?.scheduledStart)
    .map(journey => ({
      companyProgramName: journey.programName,
      mentorName: journey.mentorAssignment?.mentorName || 'Mentor pending',
      sessionTitle: journey.nextSession?.title || 'Upcoming session',
      scheduledStart: journey.nextSession?.scheduledStart || null,
      status: journey.nextSession?.status || null,
    }))
    .sort((left, right) => new Date(left.scheduledStart || '').getTime() - new Date(right.scheduledStart || '').getTime())
    .slice(0, 3),
)

const openActionItems = computed(() =>
  employeeJourneys.value
    .flatMap(journey => journey.actionItems
      .filter(item => !item.completed)
      .map(item => ({
        ...item,
        programName: journey.programName,
      })))
    .slice(0, 5),
)

const assignedMentorCount = computed(() =>
  employeeMatches.value.filter(match => Boolean(match.mentorAssignment)).length,
)

const actionRequiredReviews = computed(() => reviewSummary.value?.actionRequired || 0)

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const humanize = (value?: string | null) =>
  String(value || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())

const loadDashboard = async () => {
  try {
    await Promise.all([
      companyProgramsStore.loadMyCompanyPrograms(),
      companyProgramsStore.loadMyCompanyProgramMatches(),
      companyProgramsStore.loadMyCompanyProgramJourneys(),
      reviewsStore.loadMyReviews(),
    ])
  } catch (loadError: any) {
    toast.error(loadError?.response?.data?.message || loadError?.message || 'Failed to load your dashboard')
  }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Your Mentorship Dashboard</h1>
        <p class="text-sm text-muted-foreground">
          Track your company programs, mentor relationships, journey progress, and WhatsApp review follow-up in one place.
        </p>
      </div>

      <Button variant="outline" @click="loadDashboard" :disabled="loading">
        <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': loading }" />
        Refresh
      </Button>
    </div>

    <Alert v-if="dashboardError" variant="destructive">
      <AlertDescription>{{ dashboardError }}</AlertDescription>
    </Alert>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Enrolled Programs</CardDescription>
          <CardTitle class="text-3xl">{{ employeePrograms.length }}</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen class="h-4 w-4" />
          Corporate mentorship cohorts you belong to
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Assigned Mentors</CardDescription>
          <CardTitle class="text-3xl">{{ assignedMentorCount }}</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <UserRoundCheck class="h-4 w-4" />
          Matches currently confirmed for your programs
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Open Action Items</CardDescription>
          <CardTitle class="text-3xl">
            {{ employeeJourneys.reduce((count, journey) => count + journey.openActionItemCount, 0) }}
          </CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <ClipboardList class="h-4 w-4" />
          Follow-through from past sessions
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Reviews Waiting</CardDescription>
          <CardTitle class="text-3xl">{{ actionRequiredReviews }}</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageCircleMore class="h-4 w-4" />
          WhatsApp review tasks that still need your response
        </CardContent>
      </Card>
    </div>

    <div v-if="loading" class="space-y-3">
      <Skeleton class="h-32 w-full" />
      <Skeleton class="h-32 w-full" />
      <Skeleton class="h-32 w-full" />
    </div>

    <template v-else>
      <Card v-if="!employeePrograms.length">
        <CardHeader>
          <CardTitle>No active company programs yet</CardTitle>
          <CardDescription>
            Once your employer enrolls you in a mentorship program, your sessions, journeys, and review tasks will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button @click="navigateTo('/app/employee/programs')">Open My Programs</Button>
        </CardContent>
      </Card>

      <div v-else class="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card>
          <CardHeader class="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Program Snapshot</CardTitle>
              <CardDescription>Your current company program participation.</CardDescription>
            </div>
            <Button variant="outline" size="sm" @click="navigateTo('/app/employee/programs')">View all</Button>
          </CardHeader>
          <CardContent class="grid gap-3">
            <div
              v-for="program in employeePrograms.slice(0, 3)"
              :key="program.participantId"
              class="rounded-lg border p-4"
            >
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="space-y-1">
                  <div class="font-medium">{{ program.programName }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ program.companyName || 'Employer program' }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    Enrolled {{ formatDate(program.enrolledAt) }}
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <Badge variant="outline">{{ humanize(program.participantStatus) }}</Badge>
                  <Badge variant="secondary">{{ humanize(program.programStatus) }}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your next confirmed mentorship touchpoints.</CardDescription>
            </div>
            <Button variant="outline" size="sm" @click="navigateTo('/app/sessions')">My Sessions</Button>
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-if="!nextSessions.length" class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No upcoming company-program sessions yet.
            </div>

            <div
              v-for="session in nextSessions"
              :key="`${session.companyProgramName}-${session.scheduledStart}`"
              class="rounded-lg border p-4"
            >
              <div class="font-medium">{{ session.sessionTitle }}</div>
              <div class="mt-1 text-sm text-muted-foreground">
                {{ session.companyProgramName }} · {{ session.mentorName }}
              </div>
              <div class="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock class="h-4 w-4" />
                {{ formatDate(session.scheduledStart) }}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Journey Follow-Through</CardTitle>
              <CardDescription>The next action items from your mentorship sessions.</CardDescription>
            </div>
            <Button variant="outline" size="sm" @click="navigateTo('/app/employee/journey')">Open Journey</Button>
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-if="!openActionItems.length" class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No open action items right now.
            </div>

            <div
              v-for="item in openActionItems"
              :key="item.actionItemId"
              class="rounded-lg border p-4"
            >
              <div class="font-medium">{{ item.description }}</div>
              <div class="mt-1 text-sm text-muted-foreground">
                {{ item.programName }} · {{ humanize(item.ownerType) }}
              </div>
              <div class="mt-2 text-xs text-muted-foreground">
                Due {{ formatDate(item.dueAt) }}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Review Status</CardTitle>
              <CardDescription>WhatsApp review workflow across your recent sessions.</CardDescription>
            </div>
            <Button variant="outline" size="sm" @click="navigateTo('/app/employee/pulses')">Open Reviews</Button>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-lg border p-4">
                <div class="text-sm text-muted-foreground">Action required</div>
                <div class="mt-2 text-2xl font-semibold">{{ reviewSummary?.actionRequired || 0 }}</div>
              </div>
              <div class="rounded-lg border p-4">
                <div class="text-sm text-muted-foreground">Awaiting reveal</div>
                <div class="mt-2 text-2xl font-semibold">{{ reviewSummary?.awaitingReveal || 0 }}</div>
              </div>
              <div class="rounded-lg border p-4">
                <div class="text-sm text-muted-foreground">Revealed</div>
                <div class="mt-2 text-2xl font-semibold">{{ reviewSummary?.revealed || 0 }}</div>
              </div>
            </div>

            <Alert>
              <Route class="h-4 w-4" />
              <AlertDescription>
                Session reviews are completed in WhatsApp, then tracked here for reveal and completion status.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </template>
  </div>
</template>
