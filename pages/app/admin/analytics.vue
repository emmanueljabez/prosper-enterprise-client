<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/modules/auth'
import { useReviewAlertsStore } from '@/store/modules/review-alerts'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Activity, AlertTriangle, GitBranch, RefreshCw, ShieldAlert, TrendingUp } from 'lucide-vue-next'

definePageMeta({
  title: 'Analytics',
  description: 'Review operations and mentorship alert analytics',
  requiresAuth: true,
  permissions: ['admin:reports'],
})

const authStore = useAuthStore()
const reviewAlertsStore = useReviewAlertsStore()
const toast = useAppToast()

const { summary, summaryLoading, error } = storeToRefs(reviewAlertsStore)
const loading = computed(() => summaryLoading.value)

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

const refreshing = ref(false)

const alertTypeTone = (type?: string | null) => ({
  LOW_MENTOR_SCORE: 'destructive',
  LOW_MENTEE_SCORE: 'secondary',
  LOW_FIT_SCORE: 'destructive',
  DO_NOT_CONTINUE: 'destructive',
}[String(type || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const severityTone = (severity?: string | null) => ({
  HIGH: 'destructive',
  MEDIUM: 'secondary',
}[String(severity || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const humanize = (value?: string | null) =>
  String(value || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())

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

const loadSummary = async () => {
  if (!companyId.value) return

  refreshing.value = true
  try {
    await reviewAlertsStore.loadSummary(companyId.value)
  } catch (loadError: any) {
    toast.error(loadError?.response?.data?.message || loadError?.message || 'Failed to load review analytics')
  } finally {
    refreshing.value = false
  }
}

watch(companyId, value => {
  if (value) {
    loadSummary()
  }
}, { immediate: true })

onMounted(() => {
  if (companyId.value) {
    loadSummary()
  }
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Review Analytics</h1>
        <p class="text-sm text-muted-foreground">
          Track review completion, low-score risk, and rematch demand across company mentorship programs.
        </p>
      </div>

      <div class="flex gap-2">
        <Button variant="outline" @click="navigateTo('/app/admin/trust')">
          <ShieldAlert class="mr-2 h-4 w-4" />
          Open Trust Queue
        </Button>
        <Button variant="outline" @click="loadSummary" :disabled="refreshing || loading">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': refreshing || loading }" />
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
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Review Cycles</CardDescription>
          <CardTitle class="text-3xl">{{ summary?.totalReviewCycles || 0 }}</CardTitle>
        </CardHeader>
        <CardContent class="text-sm text-muted-foreground">
          {{ summary?.revealedReviewCycles || 0 }} revealed · {{ summary?.pendingReviewCycles || 0 }} pending
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Open Alerts</CardDescription>
          <CardTitle class="text-3xl">{{ summary?.openAlerts || 0 }}</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle class="h-4 w-4" />
          {{ summary?.highSeverityAlerts || 0 }} high severity
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Do Not Continue</CardDescription>
          <CardTitle class="text-3xl">{{ summary?.doNotContinueAlerts || 0 }}</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <GitBranch class="h-4 w-4" />
          {{ summary?.rematchRecommendedAlerts || 0 }} rematch recommendations
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Low Score Signals</CardDescription>
          <CardTitle class="text-3xl">{{ (summary?.lowMentorScoreAlerts || 0) + (summary?.lowMenteeScoreAlerts || 0) + (summary?.lowFitAlerts || 0) }}</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp class="h-4 w-4" />
          Mentor {{ summary?.lowMentorScoreAlerts || 0 }} · Mentee {{ summary?.lowMenteeScoreAlerts || 0 }} · Fit {{ summary?.lowFitAlerts || 0 }}
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Recent Alert Activity</CardTitle>
        <CardDescription>The latest review signals that need operational follow-up.</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="space-y-3">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>

        <div v-else-if="!summary?.recentAlerts?.length" class="rounded-lg border border-dashed p-8 text-center">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Activity class="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 class="mt-4 text-lg font-medium">No alert activity yet</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Review alerts will appear here once session ratings start surfacing risk signals.
          </p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Signal</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Raised</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="alert in summary?.recentAlerts || []" :key="alert.id">
              <TableCell>
                <div class="space-y-1">
                  <Badge :variant="alertTypeTone(alert.alertType)">
                    {{ humanize(alert.alertType) }}
                  </Badge>
                  <div class="text-xs text-muted-foreground">
                    {{ alert.details || humanize(alert.questionCode) || 'Review signal captured' }}
                  </div>
                </div>
              </TableCell>
              <TableCell>{{ alert.companyProgramName || 'Program' }}</TableCell>
              <TableCell>{{ alert.participantName || 'Employee' }}</TableCell>
              <TableCell>{{ alert.mentorName || 'Unassigned' }}</TableCell>
              <TableCell>
                <div class="space-y-1">
                  <Badge :variant="severityTone(alert.severity)">{{ humanize(alert.severity) }}</Badge>
                  <div class="text-xs text-muted-foreground">{{ humanize(alert.status) }}</div>
                </div>
              </TableCell>
              <TableCell>{{ formatDate(alert.createdAt) }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
