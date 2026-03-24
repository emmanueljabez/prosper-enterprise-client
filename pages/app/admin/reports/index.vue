<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import dashboardApi from '@/http/requests/app/dashboard'
import companyProgramsApi, { type CompanyProgramRecord } from '@/http/requests/app/companyPrograms'
import pulsesApi, { type CompanyParticipantPulseSummaryRecord } from '@/http/requests/app/pulses'
import reviewAlertsApi, { type ReviewAlertSummaryRecord } from '@/http/requests/app/reviewAlerts'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  Download,
  GitBranch,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Reports',
  description: 'Operational reporting for company mentorship programs',
  requiresAuth: true,
  permissions: ['admin:reports'],
})

type CompanyDashboardStats = {
  totalSessions?: number
  participationRate?: number
  feedbackCoverage?: number
  completionRate?: number
  pulseCompletionRate?: number
  participatingEmployees?: number
  registeredEmployees?: number
  upcomingSessions?: number
  cancelledSessions?: number
  totalPulses?: number
  completedPulses?: number
  pendingPulses?: number
}

type CompanyDashboardData = {
  company?: {
    id?: string | null
    name?: string | null
  } | null
  snapshotAt?: string | null
  period?: string | null
  stats?: CompanyDashboardStats | null
}

const authStore = useAuthStore()
const toast = useAppToast()

const dashboard = ref<CompanyDashboardData | null>(null)
const allPrograms = ref<CompanyProgramRecord[]>([])
const programTotal = ref(0)
const pulseSummary = ref<CompanyParticipantPulseSummaryRecord | null>(null)
const reviewSummary = ref<ReviewAlertSummaryRecord | null>(null)
const allAlerts = ref<ReviewAlertSummaryRecord['recentAlerts']>([])
const alertTotal = ref(0)

const isLoading = ref(false)
const error = ref<string | null>(null)

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

const stats = computed<Required<CompanyDashboardStats>>(() => ({
  totalSessions: Number(dashboard.value?.stats?.totalSessions || 0),
  participationRate: Number(dashboard.value?.stats?.participationRate || 0),
  feedbackCoverage: Number(dashboard.value?.stats?.feedbackCoverage || 0),
  completionRate: Number(dashboard.value?.stats?.completionRate || 0),
  pulseCompletionRate: Number(pulseSummary.value?.completionRate ?? dashboard.value?.stats?.pulseCompletionRate ?? 0),
  participatingEmployees: Number(dashboard.value?.stats?.participatingEmployees || 0),
  registeredEmployees: Number(dashboard.value?.stats?.registeredEmployees || 0),
  upcomingSessions: Number(dashboard.value?.stats?.upcomingSessions || 0),
  cancelledSessions: Number(dashboard.value?.stats?.cancelledSessions || 0),
  totalPulses: Number(pulseSummary.value?.totalPulses ?? dashboard.value?.stats?.totalPulses ?? 0),
  completedPulses: Number(pulseSummary.value?.completedPulses ?? dashboard.value?.stats?.completedPulses ?? 0),
  pendingPulses: Number(pulseSummary.value?.pendingPulses ?? dashboard.value?.stats?.pendingPulses ?? 0),
}))

const programs = computed(() => allPrograms.value.slice(0, 6))
const recentAlerts = computed(() => (reviewSummary.value?.recentAlerts || []).slice(0, 5))
const reportTimestamp = computed(() => dashboard.value?.snapshotAt || null)

const healthCards = computed(() => [
  {
    label: 'Program Portfolio',
    value: programTotal.value,
    description: `${programs.value.filter(program => program.status === 'LIVE').length} live`,
    icon: BarChart3,
  },
  {
    label: 'Participation',
    value: `${stats.value.participationRate.toFixed(0)}%`,
    description: `${stats.value.participatingEmployees} of ${stats.value.registeredEmployees} employees active`,
    icon: Users,
  },
  {
    label: 'Feedback Coverage',
    value: `${stats.value.feedbackCoverage.toFixed(0)}%`,
    description: `${reviewSummary.value?.pendingReviewCycles || 0} review cycles pending`,
    icon: ShieldCheck,
  },
  {
    label: 'Pulse Coverage',
    value: `${stats.value.pulseCompletionRate.toFixed(0)}%`,
    description: `${stats.value.completedPulses} of ${stats.value.totalPulses} completed`,
    icon: Calendar,
  },
  {
    label: 'Open Risk Signals',
    value: reviewSummary.value?.openAlerts || 0,
    description: `${reviewSummary.value?.highSeverityAlerts || 0} high severity`,
    icon: AlertTriangle,
  },
])

const workstreams = computed(() => [
  {
    title: 'Overview Dashboard',
    description: 'Utilization, employees, session load, and activity trends.',
    route: '/app/admin',
    icon: Activity,
  },
  {
    title: 'Review Analytics',
    description: 'Completion, low-score trends, and recent review signals.',
    route: '/app/admin/analytics',
    icon: ShieldCheck,
  },
  {
    title: 'Trust Queue',
    description: 'Acknowledge alerts, resolve them, or trigger rematch actions.',
    route: '/app/admin/trust',
    icon: ShieldAlert,
  },
  {
    title: 'Employee Operations',
    description: 'Work through enrollments, assignments, and cohort execution.',
    route: '/app/admin/participants',
    icon: Users,
  },
])

const humanize = (value?: string | null) =>
  String(value || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())

const statusTone = (status?: string | null) => ({
  DRAFT: 'secondary',
  LIVE: 'default',
  PAUSED: 'outline',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
  ARCHIVED: 'outline',
}[String(status || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const severityTone = (severity?: string | null) => ({
  HIGH: 'destructive',
  MEDIUM: 'secondary',
}[String(severity || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const alertTone = (alertType?: string | null) => ({
  LOW_MENTOR_SCORE: 'destructive',
  LOW_MENTEE_SCORE: 'secondary',
  LOW_FIT_SCORE: 'destructive',
  DO_NOT_CONTINUE: 'destructive',
}[String(alertType || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const formatDate = (value?: string | null) => {
  if (!value) return 'Flexible dates'

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '—'

  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const escapeCsv = (value: unknown) => {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

const downloadTextFile = (filename: string, content: string, type = 'text/csv;charset=utf-8;') => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const buildFilename = (slug: string) => {
  const companySlug = String(dashboard.value?.company?.name || 'company')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'company'
  const date = new Date().toISOString().slice(0, 10)
  return `${companySlug}-${slug}-${date}.csv`
}

const exportSummaryCsv = () => {
  const rows = [
    ['Metric', 'Value'],
    ['Company', dashboard.value?.company?.name || '—'],
    ['Snapshot At', reportTimestamp.value ? formatDateTime(reportTimestamp.value) : '—'],
    ['Programs Total', programTotal.value],
    ['Programs Live', allPrograms.value.filter(program => program.status === 'LIVE').length],
    ['Sessions Total', stats.value.totalSessions],
    ['Participation Rate', `${stats.value.participationRate.toFixed(0)}%`],
    ['Feedback Coverage', `${stats.value.feedbackCoverage.toFixed(0)}%`],
    ['Completion Rate', `${stats.value.completionRate.toFixed(0)}%`],
    ['Pulse Completion', `${stats.value.pulseCompletionRate.toFixed(0)}%`],
    ['Employees Active', stats.value.participatingEmployees],
    ['Employees Registered', stats.value.registeredEmployees],
    ['Upcoming Sessions', stats.value.upcomingSessions],
    ['Cancelled Sessions', stats.value.cancelledSessions],
    ['Total Pulses', stats.value.totalPulses],
    ['Completed Pulses', stats.value.completedPulses],
    ['Pending Pulses', stats.value.pendingPulses],
    ['Review Cycles Pending', reviewSummary.value?.pendingReviewCycles || 0],
    ['Review Alerts Open', reviewSummary.value?.openAlerts || 0],
    ['Review Alerts High Severity', reviewSummary.value?.highSeverityAlerts || 0],
    ['Rematch Recommended', reviewSummary.value?.rematchRecommendedAlerts || 0],
  ]

  const csv = rows.map(row => row.map(escapeCsv).join(',')).join('\n')
  downloadTextFile(buildFilename('mentorship-summary'), csv)
  toast.success('Summary export started')
}

const exportProgramsCsv = () => {
  const rows = [
    ['Program', 'Status', 'Matching Mode', 'Objective', 'Target Audience', 'Start Date', 'End Date', 'Capacity', 'Created At'],
    ...allPrograms.value.map(program => [
      program.name,
      humanize(program.status),
      humanize(program.matchingMode),
      program.objective || '',
      program.targetAudienceDescription || '',
      formatDate(program.startsAt),
      program.endsAt ? formatDate(program.endsAt) : '',
      program.maxParticipants || 'Open',
      formatDateTime(program.createdAt),
    ]),
  ]

  const csv = rows.map(row => row.map(escapeCsv).join(',')).join('\n')
  downloadTextFile(buildFilename('program-portfolio'), csv)
  toast.success('Program portfolio export started')
}

const exportReviewSignalsCsv = () => {
  const rows = [
    ['Alert Type', 'Severity', 'Status', 'Program', 'Employee', 'Mentor', 'Question', 'Details', 'Raised At'],
    ...allAlerts.value.map(alert => [
      humanize(alert.alertType),
      humanize(alert.severity),
      humanize(alert.status),
      alert.companyProgramName || '',
      alert.participantName || '',
      alert.mentorName || '',
      humanize(alert.questionCode),
      alert.details || '',
      formatDateTime(alert.createdAt),
    ]),
  ]

  const csv = rows.map(row => row.map(escapeCsv).join(',')).join('\n')
  downloadTextFile(buildFilename('review-signals'), csv)
  toast.success('Review signal export started')
}

const exportPulseCoverageCsv = () => {
  const rows = [
    ['Program', 'Total Pulses', 'Completed', 'Pending', 'Expired', 'Baseline', 'Program End', 'Completion Rate'],
    ...((pulseSummary.value?.programs || []).map(program => [
      program.companyProgramName || '',
      program.totalPulses,
      program.completedPulses,
      program.pendingPulses,
      program.expiredPulses,
      program.baselinePulses,
      program.programEndPulses,
      `${Number(program.completionRate || 0).toFixed(0)}%`,
    ])),
  ]

  const csv = rows.map(row => row.map(escapeCsv).join(',')).join('\n')
  downloadTextFile(buildFilename('pulse-coverage'), csv)
  toast.success('Pulse coverage export started')
}

const loadReportsWorkspace = async () => {
  if (!companyId.value) {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const [dashboardResponse, programsResponse, pulseSummaryResponse, reviewSummaryResponse, reviewAlertsResponse] = await Promise.allSettled([
      dashboardApi.getCompanyDashboard(companyId.value),
      companyProgramsApi.getCompanyPrograms({
        companyId: companyId.value,
        page: 0,
        size: 50,
        search: '',
        status: null,
        liveOnly: false,
      }),
      pulsesApi.getCompanyPulseSummary(companyId.value),
      reviewAlertsApi.getReviewAlertSummary(companyId.value),
      reviewAlertsApi.getReviewAlerts({
        companyId: companyId.value,
        page: 0,
        size: 100,
        status: null,
        severity: null,
        alertType: null,
      }),
    ])

    if (dashboardResponse.status === 'fulfilled') {
      dashboard.value = dashboardResponse.value?.data?.data || null
    }

    if (programsResponse.status === 'fulfilled') {
      allPrograms.value = programsResponse.value?.data?.programs || []
      programTotal.value = Number(programsResponse.value?.data?.totalItems || 0)
    }

    if (pulseSummaryResponse.status === 'fulfilled') {
      pulseSummary.value = pulseSummaryResponse.value?.data || null
    }

    if (reviewSummaryResponse.status === 'fulfilled') {
      reviewSummary.value = reviewSummaryResponse.value?.data || null
    }

    if (reviewAlertsResponse.status === 'fulfilled') {
      allAlerts.value = reviewAlertsResponse.value?.data?.alerts || []
      alertTotal.value = Number(reviewAlertsResponse.value?.data?.totalItems || 0)
    }

    const failures = [
      dashboardResponse,
      programsResponse,
      pulseSummaryResponse,
      reviewSummaryResponse,
      reviewAlertsResponse,
    ].filter(result => result.status === 'rejected')

    if (failures.length === 4) {
      throw new Error('Failed to load reports workspace')
    }

    if (failures.length > 0) {
      error.value = 'Some report sections could not be loaded. Refresh to retry.'
    }
  } catch (workspaceError: any) {
    error.value = workspaceError?.response?.data?.message || workspaceError?.message || 'Failed to load reports workspace'
    toast.error(error.value)
  } finally {
    isLoading.value = false
  }
}

watch(companyId, value => {
  if (value) {
    loadReportsWorkspace()
  }
}, { immediate: true })

onMounted(() => {
  if (companyId.value) {
    loadReportsWorkspace()
  }
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Reports & Operations</h1>
        <p class="text-sm text-muted-foreground">
          Read the current health of company mentorship programs without leaving the admin workspace.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button variant="outline" @click="navigateTo('/app/admin')">
          <Activity class="mr-2 h-4 w-4" />
          Overview
        </Button>
        <Button variant="outline" @click="navigateTo('/app/admin/analytics')">
          <ShieldCheck class="mr-2 h-4 w-4" />
          Review Analytics
        </Button>
        <Button variant="outline" @click="loadReportsWorkspace" :disabled="isLoading">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
      </div>
    </div>

    <Alert v-if="!companyId">
      <AlertDescription>Company context is missing for this account. Sign in again and retry.</AlertDescription>
    </Alert>

    <Alert v-else-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card v-for="card in healthCards" :key="card.label">
        <CardHeader class="pb-2">
          <CardDescription>{{ card.label }}</CardDescription>
          <CardTitle class="text-3xl">{{ card.value }}</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <component :is="card.icon" class="h-4 w-4" />
          {{ card.description }}
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Exports</CardTitle>
        <CardDescription>
          Download the current live reporting snapshot for finance, operations, or leadership reviews.
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-3 md:flex-row">
        <Button variant="outline" @click="exportSummaryCsv" :disabled="isLoading">
          <Download class="mr-2 h-4 w-4" />
          Export Summary CSV
        </Button>
        <Button variant="outline" @click="exportProgramsCsv" :disabled="isLoading || !allPrograms.length">
          <Download class="mr-2 h-4 w-4" />
          Export Programs CSV
        </Button>
        <Button variant="outline" @click="exportPulseCoverageCsv" :disabled="isLoading || !(pulseSummary?.programs?.length)">
          <Download class="mr-2 h-4 w-4" />
          Export Pulse CSV
        </Button>
        <Button variant="outline" @click="exportReviewSignalsCsv" :disabled="isLoading || !allAlerts.length">
          <Download class="mr-2 h-4 w-4" />
          Export Review Signals CSV
        </Button>
        <div class="text-sm text-muted-foreground md:ml-auto md:self-center">
          Snapshot: {{ reportTimestamp ? formatDateTime(reportTimestamp) : 'Live on demand' }}
        </div>
      </CardContent>
    </Card>

    <div class="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Operational Workstreams</CardTitle>
          <CardDescription>Move from reporting into the action surface that owns the metric.</CardDescription>
        </CardHeader>
        <CardContent class="grid gap-3">
          <button
            v-for="workstream in workstreams"
            :key="workstream.title"
            class="flex items-start justify-between rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
            @click="navigateTo(workstream.route)"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2 font-medium">
                <component :is="workstream.icon" class="h-4 w-4 text-muted-foreground" />
                {{ workstream.title }}
              </div>
              <p class="text-sm text-muted-foreground">
                {{ workstream.description }}
              </p>
            </div>
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reporting Notes</CardTitle>
          <CardDescription>What this workspace can and cannot tell you today.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3 text-sm text-muted-foreground">
          <div class="rounded-lg border p-4">
            Participation, completion, session volume, and review-signal risk are live and tied to actual platform data.
          </div>
          <div class="rounded-lg border p-4">
            Promotion and retention outcomes are intentionally not shown here until an HRIS integration exists.
          </div>
          <div class="rounded-lg border p-4">
            WhatsApp feedback remains the primary collection channel. This page is for reporting and operational follow-up.
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Pulse Checkpoints</CardTitle>
        <CardDescription>Baseline and end-of-program pulse coverage across company programs.</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="space-y-3">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>

        <div v-else-if="!(pulseSummary?.programs?.length)" class="rounded-lg border border-dashed p-8 text-center">
          <h3 class="text-lg font-medium">No pulse data yet</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Pulse coverage will appear here once baseline or end-of-program checkpoints have been opened for employees.
          </p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Program</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead>Baseline</TableHead>
              <TableHead>Program End</TableHead>
              <TableHead>Coverage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="program in pulseSummary?.programs || []" :key="program.companyProgramId">
              <TableCell>{{ program.companyProgramName || 'Program' }}</TableCell>
              <TableCell>{{ program.totalPulses }}</TableCell>
              <TableCell>{{ program.completedPulses }}</TableCell>
              <TableCell>{{ program.pendingPulses }}</TableCell>
              <TableCell>{{ program.baselinePulses }}</TableCell>
              <TableCell>{{ program.programEndPulses }}</TableCell>
              <TableCell>{{ Number(program.completionRate || 0).toFixed(0) }}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <div class="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Program Portfolio Snapshot</CardTitle>
          <CardDescription>Current company programs and where they sit in the lifecycle.</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="isLoading" class="space-y-3">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
          </div>

          <div v-else-if="!programs.length" class="rounded-lg border border-dashed p-8 text-center">
            <h3 class="text-lg font-medium">No company programs yet</h3>
            <p class="mt-2 text-sm text-muted-foreground">
              Launch a program first, then this workspace will show portfolio and risk reporting.
            </p>
          </div>

          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Matching</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Capacity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="program in programs" :key="program.id">
                <TableCell>
                  <div class="space-y-1">
                    <div class="font-medium">{{ program.name }}</div>
                    <div class="text-xs text-muted-foreground">
                      {{ program.objective || program.targetAudienceDescription || 'No objective captured yet' }}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="statusTone(program.status)">
                    {{ humanize(program.status) }}
                  </Badge>
                </TableCell>
                <TableCell>{{ humanize(program.matchingMode) }}</TableCell>
                <TableCell>{{ formatDate(program.startsAt) }}<span v-if="program.endsAt"> - {{ formatDate(program.endsAt) }}</span></TableCell>
                <TableCell>{{ program.maxParticipants || 'Open' }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Review Signals</CardTitle>
          <CardDescription>The latest issues surfaced through WhatsApp review cycles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="isLoading" class="space-y-3">
            <Skeleton class="h-16 w-full" />
            <Skeleton class="h-16 w-full" />
            <Skeleton class="h-16 w-full" />
          </div>

          <div v-else-if="!recentAlerts.length" class="rounded-lg border border-dashed p-8 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ShieldCheck class="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 class="mt-4 text-lg font-medium">No review alerts yet</h3>
            <p class="mt-2 text-sm text-muted-foreground">
              Risk signals will appear here once session reviews start surfacing low scores or do-not-continue outcomes.
            </p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="alert in recentAlerts"
              :key="alert.id"
              class="rounded-lg border p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <Badge :variant="alertTone(alert.alertType)">
                      {{ humanize(alert.alertType) }}
                    </Badge>
                    <Badge :variant="severityTone(alert.severity)">
                      {{ humanize(alert.severity) }}
                    </Badge>
                  </div>
                  <div class="text-sm font-medium">
                    {{ alert.companyProgramName || 'Program' }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    {{ alert.participantName || 'Employee' }} with {{ alert.mentorName || 'mentor pending' }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ alert.details || humanize(alert.questionCode) || 'Review signal captured' }}
                  </div>
                </div>

                <div class="text-right text-xs text-muted-foreground">
                  <div>{{ humanize(alert.status) }}</div>
                  <div>{{ formatDateTime(alert.createdAt) }}</div>
                </div>
              </div>
            </div>

            <Button variant="outline" class="w-full" @click="navigateTo('/app/admin/trust')">
              <GitBranch class="mr-2 h-4 w-4" />
              Open Trust Queue ({{ alertTotal }})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Session Operations Snapshot</CardTitle>
        <CardDescription>Live execution indicators pulled from the company dashboard service.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 md:grid-cols-4">
        <div class="rounded-lg border p-4">
          <div class="text-xs uppercase tracking-wide text-muted-foreground">Total Sessions</div>
          <div class="mt-2 flex items-center gap-2 text-2xl font-semibold">
            <Calendar class="h-5 w-5 text-muted-foreground" />
            {{ stats.totalSessions }}
          </div>
        </div>
        <div class="rounded-lg border p-4">
          <div class="text-xs uppercase tracking-wide text-muted-foreground">Completion Rate</div>
          <div class="mt-2 text-2xl font-semibold">{{ stats.completionRate.toFixed(0) }}%</div>
        </div>
        <div class="rounded-lg border p-4">
          <div class="text-xs uppercase tracking-wide text-muted-foreground">Upcoming Sessions</div>
          <div class="mt-2 text-2xl font-semibold">{{ stats.upcomingSessions }}</div>
        </div>
        <div class="rounded-lg border p-4">
          <div class="text-xs uppercase tracking-wide text-muted-foreground">Cancelled Sessions</div>
          <div class="mt-2 text-2xl font-semibold">{{ stats.cancelledSessions }}</div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
