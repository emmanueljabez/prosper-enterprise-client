<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/modules/auth'
import { useReviewAlertsStore } from '@/store/modules/review-alerts'
import accessAuditApi, { type AccessAuditLogRecord, type AccessAuditSummaryRecord } from '@/http/requests/app/accessAudit'
import { useAppToast } from '@/composables/services/toastService'
import type { ReviewAlertSeverity, ReviewAlertStatus, ReviewAlertType } from '@/http/requests/app/reviewAlerts'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { CheckCircle2, GitBranch, RefreshCw, ShieldAlert, ShieldCheck, Siren, Users } from 'lucide-vue-next'

definePageMeta({
  title: 'Trust & Safety',
  description: 'Review alert queue and auditable access controls',
  requiresAuth: true,
  permissions: ['admin:settings'],
})

const authStore = useAuthStore()
const reviewAlertsStore = useReviewAlertsStore()
const toast = useAppToast()

const { alerts, alertsLoading, summary, summaryLoading, error, actionLoadingIds } = storeToRefs(reviewAlertsStore)

const accessAuditSummary = ref<AccessAuditSummaryRecord | null>(null)
const accessAuditLogs = ref<AccessAuditLogRecord[]>([])
const accessAuditLoading = ref(false)
const accessAuditError = ref<string | null>(null)

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

const statusFilter = ref<ReviewAlertStatus | 'ALL'>('OPEN')
const severityFilter = ref<ReviewAlertSeverity | 'ALL'>('ALL')
const alertTypeFilter = ref<ReviewAlertType | 'ALL'>('ALL')

const combinedError = computed(() => error.value || accessAuditError.value || null)
const isRefreshing = computed(() => alertsLoading.value || summaryLoading.value || accessAuditLoading.value)

const humanize = (value?: string | null) =>
  String(value || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())

const severityTone = (severity?: string | null) => ({
  HIGH: 'destructive',
  MEDIUM: 'secondary',
}[String(severity || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const statusTone = (status?: string | null) => ({
  OPEN: 'destructive',
  ACKNOWLEDGED: 'secondary',
  RESOLVED: 'outline',
}[String(status || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const auditActionTone = (action?: string | null) => ({
  UPDATE: 'secondary',
  REMATCH: 'destructive',
}[String(action || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

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

const loadAccessAudit = async () => {
  if (!companyId.value) return

  accessAuditLoading.value = true
  accessAuditError.value = null

  try {
    const [summaryResponse, logsResponse] = await Promise.all([
      accessAuditApi.getAccessAuditSummary(companyId.value),
      accessAuditApi.getAccessAuditLogs({
        companyId: companyId.value,
        page: 0,
        size: 10,
      }),
    ])

    if (!summaryResponse.success || !summaryResponse.data) {
      throw new Error(summaryResponse.message || 'Failed to load access audit summary')
    }

    if (!logsResponse.success || !logsResponse.data) {
      throw new Error(logsResponse.message || 'Failed to load access audit logs')
    }

    accessAuditSummary.value = summaryResponse.data
    accessAuditLogs.value = logsResponse.data.logs
  } catch (loadError: any) {
    accessAuditError.value = loadError?.response?.data?.message || loadError?.message || 'Failed to load access audit workspace'
    throw loadError
  } finally {
    accessAuditLoading.value = false
  }
}

const loadWorkspace = async () => {
  if (!companyId.value) return

  const results = await Promise.allSettled([
    reviewAlertsStore.loadSummary(companyId.value),
    reviewAlertsStore.loadAlerts({
      companyId: companyId.value,
      page: 0,
      size: 50,
      status: statusFilter.value,
      severity: severityFilter.value,
      alertType: alertTypeFilter.value,
    }),
    loadAccessAudit(),
  ])

  const rejected = results.find(result => result.status === 'rejected') as PromiseRejectedResult | undefined
  if (rejected) {
    toast.error(rejected.reason?.response?.data?.message || rejected.reason?.message || 'Failed to load trust workspace')
  }
}

const updateStatus = async (alertId: string, status: ReviewAlertStatus) => {
  if (!companyId.value) return

  try {
    await reviewAlertsStore.updateStatus(companyId.value, alertId, status)
    await Promise.all([
      reviewAlertsStore.loadSummary(companyId.value),
      loadAccessAudit(),
    ])
  } catch {
    // store already handles toast
  }
}

const triggerRematch = async (alertId: string) => {
  if (!companyId.value) return

  if (!confirm('Remove the current mentor assignment for this alert and move the employee back into rematch?')) {
    return
  }

  try {
    await reviewAlertsStore.triggerRematch(companyId.value, alertId)
    await loadWorkspace()
  } catch {
    // store already handles toast
  }
}

const isActionLoading = (alertId: string) => actionLoadingIds.value.includes(alertId)

watch(companyId, value => {
  if (value) {
    loadWorkspace()
  }
}, { immediate: true })

watch([statusFilter, severityFilter, alertTypeFilter], () => {
  if (companyId.value) {
    reviewAlertsStore.loadAlerts({
      companyId: companyId.value,
      page: 0,
      size: 50,
      status: statusFilter.value,
      severity: severityFilter.value,
      alertType: alertTypeFilter.value,
    }).catch(() => {})
  }
})

onMounted(() => {
  if (companyId.value) {
    loadWorkspace()
  }
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Trust & Safety</h1>
        <p class="text-sm text-muted-foreground">
          Operate low-score and fit-risk alerts while keeping access to sensitive employee data auditable.
        </p>
      </div>

      <div class="flex gap-2">
        <Button variant="outline" @click="navigateTo('/app/admin/analytics')">
          <ShieldCheck class="mr-2 h-4 w-4" />
          Review Analytics
        </Button>
        <Button variant="outline" @click="loadWorkspace" :disabled="isRefreshing">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isRefreshing }" />
          Refresh
        </Button>
      </div>
    </div>

    <Alert v-if="!companyId">
      <AlertDescription>Company context is missing for this account. Sign in again and retry.</AlertDescription>
    </Alert>

    <Alert v-else-if="combinedError" variant="destructive">
      <AlertDescription>{{ combinedError }}</AlertDescription>
    </Alert>

    <div class="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Open Alerts</CardDescription>
          <CardTitle class="text-3xl">{{ summary?.openAlerts || 0 }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>High Severity</CardDescription>
          <CardTitle class="text-3xl">{{ summary?.highSeverityAlerts || 0 }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Rematch Candidates</CardDescription>
          <CardTitle class="text-3xl">{{ summary?.rematchRecommendedAlerts || 0 }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Audit Events (7d)</CardDescription>
          <CardTitle class="text-3xl">{{ accessAuditSummary?.last7DaysEvents || 0 }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Distinct Actors (7d)</CardDescription>
          <CardTitle class="text-3xl">{{ accessAuditSummary?.distinctActorsLast7Days || 0 }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Consent Updates (7d)</CardDescription>
          <CardTitle class="text-3xl">{{ accessAuditSummary?.participantConsentUpdatesLast7Days || 0 }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Alert Queue</CardTitle>
        <CardDescription>Filter operational review signals and take follow-up actions.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-3 md:grid-cols-3">
          <Select v-model="statusFilter">
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="severityFilter">
            <SelectTrigger>
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All severities</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="alertTypeFilter">
            <SelectTrigger>
              <SelectValue placeholder="Filter by alert type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All alert types</SelectItem>
              <SelectItem value="LOW_MENTOR_SCORE">Low mentor score</SelectItem>
              <SelectItem value="LOW_MENTEE_SCORE">Low mentee score</SelectItem>
              <SelectItem value="LOW_FIT_SCORE">Low fit score</SelectItem>
              <SelectItem value="DO_NOT_CONTINUE">Do not continue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="alertsLoading" class="space-y-3">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>

        <div v-else-if="!alerts.length" class="rounded-lg border border-dashed p-8 text-center">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ShieldAlert class="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 class="mt-4 text-lg font-medium">No alerts match this filter</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Change the filter set or wait for new review activity to generate actionable trust signals.
          </p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Alert</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Raised</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="alert in alerts" :key="alert.id">
              <TableCell>
                <div class="space-y-1">
                  <div class="flex flex-wrap gap-2">
                    <Badge :variant="severityTone(alert.severity)">{{ humanize(alert.severity) }}</Badge>
                    <Badge variant="outline">{{ humanize(alert.alertType) }}</Badge>
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ alert.details || humanize(alert.questionCode) || 'Review signal captured' }}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div class="font-medium">{{ alert.participantName || 'Employee' }}</div>
                <div class="text-xs text-muted-foreground">{{ alert.participantEmail || alert.participantStatus || 'No employee detail' }}</div>
              </TableCell>
              <TableCell>{{ alert.mentorName || 'Unassigned' }}</TableCell>
              <TableCell>{{ alert.companyProgramName || 'Program' }}</TableCell>
              <TableCell>
                <Badge :variant="statusTone(alert.status)">{{ humanize(alert.status) }}</Badge>
              </TableCell>
              <TableCell>{{ formatDate(alert.createdAt) }}</TableCell>
              <TableCell>
                <div class="flex justify-end gap-2">
                  <Button
                    v-if="alert.status === 'OPEN'"
                    size="sm"
                    variant="outline"
                    :disabled="isActionLoading(alert.id)"
                    @click="updateStatus(alert.id, 'ACKNOWLEDGED')"
                  >
                    <Siren class="mr-2 h-4 w-4" />
                    Acknowledge
                  </Button>

                  <Button
                    v-if="alert.status !== 'RESOLVED'"
                    size="sm"
                    variant="outline"
                    :disabled="isActionLoading(alert.id)"
                    @click="updateStatus(alert.id, 'RESOLVED')"
                  >
                    <CheckCircle2 class="mr-2 h-4 w-4" />
                    Resolve
                  </Button>

                  <Button
                    v-if="alert.status !== 'RESOLVED' && alert.mentorAssignmentId"
                    size="sm"
                    variant="destructive"
                    :disabled="isActionLoading(alert.id)"
                    @click="triggerRematch(alert.id)"
                  >
                    <GitBranch class="mr-2 h-4 w-4" />
                    Rematch
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Access Audit</CardTitle>
        <CardDescription>Recent access to employee rosters, consent workspaces, and review operations.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="accessAuditLoading" class="space-y-3">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>

        <template v-else>
          <div class="grid gap-4 md:grid-cols-4">
            <div class="rounded-lg border p-4">
              <div class="text-sm text-muted-foreground">Roster Views (7d)</div>
              <div class="mt-2 text-2xl font-semibold">{{ accessAuditSummary?.participantRosterViewsLast7Days || 0 }}</div>
            </div>
            <div class="rounded-lg border p-4">
              <div class="text-sm text-muted-foreground">Consent Views (7d)</div>
              <div class="mt-2 text-2xl font-semibold">{{ accessAuditSummary?.participantConsentViewsLast7Days || 0 }}</div>
            </div>
            <div class="rounded-lg border p-4">
              <div class="text-sm text-muted-foreground">Review Views (7d)</div>
              <div class="mt-2 text-2xl font-semibold">{{ accessAuditSummary?.reviewAlertViewsLast7Days || 0 }}</div>
            </div>
            <div class="rounded-lg border p-4">
              <div class="text-sm text-muted-foreground">Rematch Actions (7d)</div>
              <div class="mt-2 text-2xl font-semibold">{{ accessAuditSummary?.rematchActionsLast7Days || 0 }}</div>
            </div>
          </div>

          <div v-if="!accessAuditLogs.length" class="rounded-lg border border-dashed p-8 text-center">
            <Users class="mx-auto h-8 w-8 text-muted-foreground" />
            <p class="mt-3 text-sm text-muted-foreground">
              No access audit events have been recorded yet.
            </p>
          </div>

          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>Actor</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="log in accessAuditLogs" :key="log.id">
                <TableCell>
                  <div class="font-medium">{{ log.actorName || 'Unknown actor' }}</div>
                  <div class="text-xs text-muted-foreground">{{ humanize(log.actorRole) || 'Unknown role' }}</div>
                </TableCell>
                <TableCell>
                  <div class="font-medium">{{ humanize(log.resourceType) }}</div>
                  <div class="text-xs text-muted-foreground">{{ humanize(log.reasonCode) || 'No reason code' }}</div>
                </TableCell>
                <TableCell>
                  <div class="font-medium">{{ log.participantName || log.companyProgramName || 'Company workspace' }}</div>
                  <div class="text-xs text-muted-foreground">{{ log.companyProgramName || 'Cross-program view' }}</div>
                </TableCell>
                <TableCell>
                  <Badge :variant="auditActionTone(log.action)">{{ humanize(log.action) }}</Badge>
                </TableCell>
                <TableCell>{{ formatDate(log.createdAt) }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
