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
import KpiSummaryCard from '@/components/ui/dashboard/KpiSummaryCard.vue'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  MessageCircleMore,
  RefreshCw,
  Route,
  Target,
  TrendingUp,
  UserRoundCheck,
} from 'lucide-vue-next'

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

const totalOpenActionItems = computed(() =>
  employeeJourneys.value.reduce((count, journey) => count + Number(journey.openActionItemCount || 0), 0),
)

const totalJourneySteps = computed(() =>
  employeeJourneys.value.reduce((count, journey) => count + Number(journey.totalJourneySteps || 0), 0),
)

const completedJourneySteps = computed(() =>
  employeeJourneys.value.reduce((count, journey) => count + Number(journey.completedJourneySteps || 0), 0),
)

const readyJourneySteps = computed(() =>
  employeeJourneys.value.reduce((count, journey) => count + Number(journey.readyJourneySteps || 0), 0),
)

const journeyProgressPercent = computed(() => {
  if (!totalJourneySteps.value) {
    return employeePrograms.value.length ? 0 : 100
  }

  return Math.round((completedJourneySteps.value / totalJourneySteps.value) * 100)
})

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
    .flatMap(journey => (journey.actionItems || [])
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

const programStatusCards = computed(() => [
  {
    label: 'Enrolled',
    value: employeePrograms.value.length,
    description: 'Company programs assigned to you',
  },
  {
    label: 'Mentor assigned',
    value: assignedMentorCount.value,
    description: 'Confirmed program mentor relationships',
  },
  {
    label: 'Ready steps',
    value: readyJourneySteps.value,
    description: 'Journey milestones waiting for action',
  },
  {
    label: 'Upcoming sessions',
    value: nextSessions.value.length,
    description: 'Scheduled mentor touchpoints',
  },
])

const reviewStatusCards = computed(() => [
  {
    label: 'Action required',
    value: reviewSummary.value?.actionRequired || 0,
  },
  {
    label: 'Awaiting reveal',
    value: reviewSummary.value?.awaitingReveal || 0,
  },
  {
    label: 'Revealed',
    value: reviewSummary.value?.revealed || 0,
  },
])

const employeeDashboardKpis = computed(() => [
  {
    id: 'programs',
    title: 'Enrolled Programs',
    value: formatNumber(employeePrograms.value.length),
    subtitle: 'Corporate mentorship cohorts you belong to.',
    progress: employeePrograms.value.length ? 100 : 0,
    icon: BookOpen,
    tone: 'brand' as const,
    deltaText: employeePrograms.value.length ? 'Active' : 'Pending',
    deltaTone: employeePrograms.value.length ? 'up' as const : 'neutral' as const,
    healthTone: employeePrograms.value.length ? 'healthy' as const : 'watch' as const,
  },
  {
    id: 'mentors',
    title: 'Assigned Mentors',
    value: formatNumber(assignedMentorCount.value),
    subtitle: 'Matches currently confirmed for your programs.',
    progress: employeeMatches.value.length
      ? Math.round((assignedMentorCount.value / employeeMatches.value.length) * 100)
      : 0,
    icon: UserRoundCheck,
    tone: assignedMentorCount.value ? 'success' as const : 'warning' as const,
    deltaText: assignedMentorCount.value ? 'Matched' : 'Waiting',
    deltaTone: assignedMentorCount.value ? 'up' as const : 'neutral' as const,
    healthTone: assignedMentorCount.value ? 'healthy' as const : 'watch' as const,
  },
  {
    id: 'actions',
    title: 'Open Action Items',
    value: formatNumber(totalOpenActionItems.value),
    subtitle: 'Follow-through from past sessions.',
    progress: totalOpenActionItems.value ? 50 : 100,
    icon: ClipboardList,
    tone: totalOpenActionItems.value ? 'warning' as const : 'success' as const,
    deltaText: totalOpenActionItems.value ? 'To do' : 'Clear',
    deltaTone: totalOpenActionItems.value ? 'neutral' as const : 'up' as const,
    healthTone: totalOpenActionItems.value ? 'watch' as const : 'healthy' as const,
  },
  {
    id: 'reviews',
    title: 'Reviews Waiting',
    value: formatNumber(actionRequiredReviews.value),
    subtitle: 'WhatsApp review tasks that need your response.',
    progress: actionRequiredReviews.value ? 35 : 100,
    icon: MessageCircleMore,
    tone: actionRequiredReviews.value ? 'danger' as const : 'success' as const,
    deltaText: actionRequiredReviews.value ? 'Due' : 'Clear',
    deltaTone: actionRequiredReviews.value ? 'down' as const : 'up' as const,
    healthTone: actionRequiredReviews.value ? 'risk' as const : 'healthy' as const,
  },
])

const visiblePrograms = computed(() => employeePrograms.value.slice(0, 4))

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-KE').format(Number(value || 0))

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('en-KE', {
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

const programDisplayName = (program: { name?: string | null; programName?: string | null; templateProgramName?: string | null }) =>
  program.name || program.programName || program.templateProgramName || 'Company program'

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
  <div class="employee-dashboard container mx-auto space-y-5 px-4 py-5">
    <div class="space-y-3">
      <div class="space-y-1">
        <h1 class="text-xl font-semibold tracking-[-0.01em] text-[#1f2430] md:text-2xl">Your Mentorship Dashboard</h1>
        <p class="text-sm text-[#687386]">
          Track your company programs, mentor relationships, journey progress, and WhatsApp review follow-up in one place.
        </p>
      </div>

      <div class="dashboard-filter-shell">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8f5f82]">Workspace</p>
            <p class="text-sm font-medium text-[#1f2430]">Mentee overview</p>
          </div>
          <Button
            variant="outline"
            class="h-9 rounded-md border-[#d8dce4] bg-white px-3 text-[#4f5968] hover:bg-[#f8f7fb]"
            :disabled="loading"
            @click="loadDashboard"
          >
            <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': loading }" />
            Refresh
          </Button>
        </div>
        <p class="mt-2 text-xs text-[#7b4b6d]">
          Showing your current program participation, sessions, journey steps, and review status.
        </p>
      </div>
    </div>

    <Alert v-if="loading">
      <RefreshCw class="h-4 w-4 animate-spin" />
      <AlertDescription>Refreshing your mentorship dashboard...</AlertDescription>
    </Alert>

    <Alert v-if="dashboardError" variant="destructive">
      <AlertTriangle class="h-4 w-4" />
      <AlertDescription>{{ dashboardError }}</AlertDescription>
    </Alert>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiSummaryCard
        v-for="kpi in employeeDashboardKpis"
        :key="kpi.id"
        :title="kpi.title"
        :value="kpi.value"
        :subtitle="kpi.subtitle"
        :progress="kpi.progress"
        :icon="kpi.icon"
        :tone="kpi.tone"
        :delta-text="kpi.deltaText"
        :delta-tone="kpi.deltaTone"
        :health-tone="kpi.healthTone"
      />
    </div>

    <div v-if="loading && !employeePrograms.length" class="space-y-5">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton v-for="index in 4" :key="`employee-kpi-${index}`" class="h-36 w-full" />
      </div>
      <div class="grid gap-5 xl:grid-cols-2">
        <Skeleton class="h-[320px] w-full" />
        <Skeleton class="h-[320px] w-full" />
      </div>
    </div>

    <template v-else>
      <Card v-if="!employeePrograms.length" class="dashboard-card">
        <CardHeader class="dashboard-card__header">
          <CardTitle class="dashboard-section-title">
            <BookOpen class="h-5 w-5 text-[#9a4884]" />
            No active company programs yet
          </CardTitle>
          <CardDescription class="dashboard-section-description">
            Once your employer enrolls you in a mentorship program, your sessions, journeys, and review tasks will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent class="dashboard-card__content">
          <Button class="bg-[#9a4884] text-white hover:bg-[#7f3a6d]" @click="navigateTo('/app/employee/programs')">
            Open My Programs
          </Button>
        </CardContent>
      </Card>

      <div v-else class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card class="dashboard-card">
          <CardHeader class="dashboard-card__header">
            <div class="flex items-center justify-between gap-3">
              <CardTitle class="dashboard-section-title">
                <TrendingUp class="h-5 w-5 text-[#9a4884]" />
                Program Snapshot
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                class="h-8 px-2 text-xs font-semibold text-[#9a4884] hover:bg-[#f6eaf3] hover:text-[#7f3a6d]"
                @click="navigateTo('/app/employee/programs')"
              >
                View all
                <ArrowRight class="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
            <CardDescription class="dashboard-section-description">Your current company program participation.</CardDescription>
          </CardHeader>
          <CardContent class="dashboard-card__content space-y-3">
            <div
              v-for="program in visiblePrograms"
              :key="program.participantId"
              class="rounded-lg border border-[#e9e4eb] bg-[#fcfcfe] p-4"
            >
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="min-w-0 space-y-1">
                  <p class="truncate font-semibold text-[#222b36]">{{ programDisplayName(program) }}</p>
                  <p class="text-sm text-[#687386]">{{ program.companyName || 'Employer program' }}</p>
                  <p class="text-xs text-[#8b95a4]">Enrolled {{ formatDate(program.enrolledAt) }}</p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <Badge variant="outline">{{ humanize(program.participantStatus) }}</Badge>
                  <Badge variant="secondary">{{ humanize(program.status) }}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="dashboard-card">
          <CardHeader class="dashboard-card__header">
            <CardTitle class="dashboard-section-title">
              <Target class="h-5 w-5 text-[#9a4884]" />
              Journey Health
            </CardTitle>
            <CardDescription class="dashboard-section-description">
              Progress across your active mentorship milestones.
            </CardDescription>
          </CardHeader>
          <CardContent class="dashboard-card__content space-y-5">
            <div class="grid gap-3 sm:grid-cols-2">
              <div
                v-for="card in programStatusCards"
                :key="card.label"
                class="dashboard-stat-chip rounded-lg border p-4"
              >
                <p class="text-sm text-muted-foreground">{{ card.label }}</p>
                <p class="mt-1 text-2xl font-semibold">{{ formatNumber(card.value) }}</p>
                <p class="text-xs text-muted-foreground">{{ card.description }}</p>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-[#2d3646]">Journey progress</span>
                <span class="text-[#7b4b6d]">{{ journeyProgressPercent }}%</span>
              </div>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-[#efe5ee]">
                <div
                  class="h-full rounded-full bg-[#9a4884] transition-all duration-300"
                  :style="{ width: `${journeyProgressPercent}%` }"
                />
              </div>
              <p class="mt-2 text-xs text-[#7c8595]">
                {{ formatNumber(completedJourneySteps) }} of {{ formatNumber(totalJourneySteps) }} journey steps completed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-5 xl:grid-cols-2">
        <Card class="dashboard-card">
          <CardHeader class="dashboard-card__header">
            <div class="flex items-center justify-between gap-3">
              <CardTitle class="dashboard-section-title">
                <CalendarClock class="h-5 w-5 text-[#9a4884]" />
                Upcoming Sessions
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                class="h-8 rounded-md border-[#dedde4] bg-white px-3 text-[11px] font-medium text-[#4b5565] hover:bg-[#f8f7fb]"
                @click="navigateTo('/app/sessions')"
              >
                My Sessions
              </Button>
            </div>
            <CardDescription class="dashboard-section-description">Your next confirmed mentorship touchpoints.</CardDescription>
          </CardHeader>
          <CardContent class="dashboard-card__content space-y-3">
            <div v-if="!nextSessions.length" class="rounded-xl border border-dashed border-[#decce0] bg-[#faf7fb] p-5 text-sm text-[#707b8b]">
              No upcoming company-program sessions yet.
            </div>

            <div
              v-for="session in nextSessions"
              :key="`${session.companyProgramName}-${session.scheduledStart}`"
              class="rounded-lg border border-[#e9e4eb] bg-[#fcfcfe] p-4"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <p class="truncate font-semibold text-[#222b36]">{{ session.sessionTitle }}</p>
                  <p class="mt-1 text-sm text-[#687386]">{{ session.companyProgramName }} | {{ session.mentorName }}</p>
                </div>
                <Badge variant="outline">{{ humanize(session.status) }}</Badge>
              </div>
              <div class="mt-3 flex items-center gap-2 text-xs text-[#8b95a4]">
                <Clock class="h-4 w-4" />
                {{ formatDate(session.scheduledStart) }}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="dashboard-card">
          <CardHeader class="dashboard-card__header">
            <div class="flex items-center justify-between gap-3">
              <CardTitle class="dashboard-section-title">
                <ClipboardList class="h-5 w-5 text-[#9a4884]" />
                Journey Follow-Through
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                class="h-8 rounded-md border-[#dedde4] bg-white px-3 text-[11px] font-medium text-[#4b5565] hover:bg-[#f8f7fb]"
                @click="navigateTo('/app/employee/journey')"
              >
                Open Journey
              </Button>
            </div>
            <CardDescription class="dashboard-section-description">The next action items from your mentorship sessions.</CardDescription>
          </CardHeader>
          <CardContent class="dashboard-card__content space-y-3">
            <div v-if="!openActionItems.length" class="rounded-xl border border-dashed border-[#decce0] bg-[#faf7fb] p-5 text-sm text-[#707b8b]">
              No open action items right now.
            </div>

            <div
              v-for="item in openActionItems"
              :key="item.actionItemId"
              class="rounded-lg border border-[#e9e4eb] bg-[#fcfcfe] p-4"
            >
              <p class="font-semibold text-[#222b36]">{{ item.description }}</p>
              <p class="mt-1 text-sm text-[#687386]">{{ item.programName }} | {{ humanize(item.ownerType) }}</p>
              <p class="mt-3 text-xs text-[#8b95a4]">Due {{ formatDate(item.dueAt) }}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card class="dashboard-card">
        <CardHeader class="dashboard-card__header">
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle class="dashboard-section-title">
                <MessageCircleMore class="h-5 w-5 text-[#9a4884]" />
                Review Status
              </CardTitle>
              <CardDescription class="dashboard-section-description">
                WhatsApp-first review workflow across your recent sessions.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="h-8 rounded-md border-[#dedde4] bg-white px-3 text-[11px] font-medium text-[#4b5565] hover:bg-[#f8f7fb]"
              @click="navigateTo('/app/employee/pulses')"
            >
              Open Reviews
            </Button>
          </div>
        </CardHeader>
        <CardContent class="dashboard-card__content space-y-4">
          <div class="grid gap-3 sm:grid-cols-3">
            <div
              v-for="card in reviewStatusCards"
              :key="card.label"
              class="dashboard-stat-chip rounded-lg border p-4"
            >
              <p class="text-sm text-muted-foreground">{{ card.label }}</p>
              <p class="mt-1 text-2xl font-semibold">{{ formatNumber(card.value) }}</p>
            </div>
          </div>

          <Alert>
            <Route class="h-4 w-4" />
            <AlertDescription>
              Session reviews are completed in WhatsApp, then tracked here for reveal and completion status.
            </AlertDescription>
          </Alert>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-[#ece6ee] bg-[#f9f8fb] p-3 text-sm">
              <div class="flex items-center gap-2">
                <CheckCircle2 class="h-4 w-4 text-[#2f8f83]" />
                <span class="font-medium text-[#2d3646]">Completed reveals</span>
              </div>
              <p class="mt-1 text-xs text-[#7c8595]">{{ formatNumber(reviewSummary?.revealed || 0) }} review cycles revealed.</p>
            </div>
            <div class="rounded-lg border border-[#ece6ee] bg-[#f9f8fb] p-3 text-sm">
              <div class="flex items-center gap-2">
                <AlertTriangle class="h-4 w-4 text-[#b45309]" />
                <span class="font-medium text-[#2d3646]">Delivery issues</span>
              </div>
              <p class="mt-1 text-xs text-[#7c8595]">{{ formatNumber(reviewSummary?.deliveryIssues || 0) }} review messages need attention.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>

<style scoped>
.employee-dashboard {
  font-family: 'Montserrat', 'Inter', ui-sans-serif, system-ui, sans-serif;
  color: #1f2430;
}

.dashboard-filter-shell {
  border-radius: 0.8rem;
  border: 1px solid #e4d4e1;
  background: linear-gradient(180deg, #fefafd 0%, #f8f2f7 100%);
  padding: 0.85rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}

.dashboard-card {
  border-radius: 0.9rem;
  border-color: #e2dde6;
  background: #fff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.05),
    0 18px 38px -34px rgba(31, 36, 48, 0.35);
}

.dashboard-card__header {
  padding-bottom: 0.85rem;
}

.dashboard-card__content {
  padding-top: 0;
}

.dashboard-section-title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: #222a36;
}

.dashboard-section-description {
  color: #677286;
}

.dashboard-stat-chip {
  border-color: #e8e1ea;
  background: #fcfcfe;
}
</style>
