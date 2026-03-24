<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePulsesStore } from '@/store/modules/pulses'
import { useReviewsStore } from '@/store/modules/reviews'
import { useAppToast } from '@/composables/services/toastService'
import type { MyReviewRecord } from '@/http/requests/app/reviews'
import type { ParticipantPulseRecord } from '@/http/requests/app/pulses'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { CheckCircle2, Clock3, Gauge, ListTodo, MessageCircleMore, RefreshCw, ShieldAlert, TimerReset } from 'lucide-vue-next'

definePageMeta({
  title: 'Feedback & Pulses',
  description: 'WhatsApp review status workspace',
  requiresAuth: true,
  permissions: ['profile:view'],
})

const reviewsStore = useReviewsStore()
const pulsesStore = usePulsesStore()
const toast = useAppToast()

const {
  loading: reviewsLoading,
  error: reviewsError,
  summary: reviewSummary,
  reviews,
} = storeToRefs(reviewsStore)
const {
  loading: pulsesLoading,
  error: pulsesError,
  summary: pulseSummary,
  pulses,
} = storeToRefs(pulsesStore)

const loading = computed(() => reviewsLoading.value || pulsesLoading.value)
const error = computed(() => reviewsError.value || pulsesError.value)

const actionableReviews = computed(() => reviews.value.filter(review => review.actionRequired))
const historyReviews = computed(() => reviews.value.filter(review => !review.actionRequired))

const humanize = (value?: string | null) =>
  String(value || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase())

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

const scoreLabel = (review: MyReviewRecord) => {
  if (typeof review.overallScore === 'number') {
    return `${review.overallScore.toFixed(1)}/5 submitted`
  }
  if (review.submittedAt) {
    return 'Submitted'
  }
  if (review.deliveryIssue) {
    return 'Delivery issue'
  }
  return 'Waiting for response'
}

const statusLabel = (review: MyReviewRecord) => {
  if (review.deliveryIssue) return 'WhatsApp delivery issue'
  if (review.actionRequired) return 'Action required'
  if (review.awaitingReveal) return 'Awaiting reveal'
  if (review.revealed) return 'Revealed'
  if (review.expired) return 'Closed'
  return humanize(review.requestStatus)
}

const statusTone = (review: MyReviewRecord) => {
  if (review.deliveryIssue) return 'destructive'
  if (review.actionRequired) return 'default'
  if (review.awaitingReveal) return 'secondary'
  if (review.revealed) return 'outline'
  if (review.expired) return 'secondary'
  return 'outline'
}

const pulseStatusLabel = (pulse: ParticipantPulseRecord) => {
  if (pulse.status === 'COMPLETED') return 'Completed'
  if (pulse.status === 'EXPIRED') return 'Expired'
  return 'Pending in WhatsApp'
}

const pulseStatusTone = (pulse: ParticipantPulseRecord) => {
  if (pulse.status === 'COMPLETED') return 'outline'
  if (pulse.status === 'EXPIRED') return 'secondary'
  return 'default'
}

const pulseScoreLabel = (pulse: ParticipantPulseRecord) => {
  const parts = [
    pulse.confidenceScore ? `Confidence ${pulse.confidenceScore}/5` : null,
    pulse.satisfactionScore ? `Satisfaction ${pulse.satisfactionScore}/5` : null,
    pulse.goalClarityScore ? `Goal clarity ${pulse.goalClarityScore}/5` : null,
  ].filter(Boolean)

  return parts.length ? parts.join(' · ') : 'Awaiting response'
}

const loadWorkspace = async () => {
  try {
    await Promise.all([
      reviewsStore.loadMyReviews(),
      pulsesStore.loadMyPulses(),
    ])
  } catch (loadError: any) {
    toast.error(loadError?.response?.data?.message || loadError?.message || 'Failed to load feedback workspace')
  }
}

onMounted(loadWorkspace)
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Feedback & Pulses</h1>
        <p class="text-sm text-muted-foreground">
          Reviews and pulse check-ins are collected in WhatsApp. This workspace shows what still needs your response and what has already been completed.
        </p>
      </div>

      <Button variant="outline" @click="loadWorkspace" :disabled="loading">
        <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': loading }" />
        Refresh
      </Button>
    </div>

    <Alert>
      <MessageCircleMore class="h-4 w-4" />
      <AlertTitle>WhatsApp-first reviews</AlertTitle>
      <AlertDescription>
        When a session closes, your review request is delivered on WhatsApp. Baseline and end-of-program pulse check-ins are also administered there.
        Submit them in WhatsApp, then come back here to track reveal and completion status.
      </AlertDescription>
    </Alert>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Action Required</CardDescription>
          <CardTitle class="text-3xl">{{ reviewSummary?.actionRequired || 0 }}</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <TimerReset class="h-4 w-4" />
          Pending or failed review requests
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Awaiting Reveal</CardDescription>
          <CardTitle class="text-3xl">{{ reviewSummary?.awaitingReveal || 0 }}</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 class="h-4 w-4" />
          Submitted and waiting on the other side
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Revealed</CardDescription>
          <CardTitle class="text-3xl">{{ reviewSummary?.revealed || 0 }}</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 class="h-4 w-4" />
          Fully completed review cycles
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Delivery Issues</CardDescription>
          <CardTitle class="text-3xl">{{ reviewSummary?.deliveryIssues || 0 }}</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldAlert class="h-4 w-4" />
          Needs resend or ops follow-up
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Pending Pulses</CardDescription>
          <CardTitle class="text-3xl">{{ pulseSummary?.pendingPulses || 0 }}</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <ListTodo class="h-4 w-4" />
          Baseline or program-end checkpoints awaiting response
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Pulse Completion</CardDescription>
          <CardTitle class="text-3xl">{{ Number(pulseSummary?.completionRate || 0).toFixed(0) }}%</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 class="h-4 w-4" />
          {{ pulseSummary?.completedPulses || 0 }} of {{ pulseSummary?.totalPulses || 0 }} completed
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Average Confidence</CardDescription>
          <CardTitle class="text-3xl">
            {{ pulseSummary?.averageConfidenceScore ? `${pulseSummary.averageConfidenceScore.toFixed(1)}/5` : '—' }}
          </CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2 text-sm text-muted-foreground">
          <Gauge class="h-4 w-4" />
          From completed pulse check-ins
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Pulse Checkpoints</CardTitle>
        <CardDescription>Baseline and end-of-program checkpoints sent to WhatsApp.</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="space-y-3">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>

        <div v-else-if="!pulses.length" class="rounded-lg border border-dashed p-8 text-center">
          <h3 class="text-lg font-medium">No pulse checkpoints yet</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Baseline and end-of-program checkpoints will appear here once they have been opened for your company program.
          </p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Program</TableHead>
              <TableHead>Checkpoint</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scores</TableHead>
              <TableHead>Window</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="pulse in pulses" :key="pulse.id">
              <TableCell>{{ pulse.companyProgramName || 'Company program' }}</TableCell>
              <TableCell>{{ humanize(pulse.pulseType) }}</TableCell>
              <TableCell>
                <Badge :variant="pulseStatusTone(pulse)">{{ pulseStatusLabel(pulse) }}</Badge>
              </TableCell>
              <TableCell>{{ pulseScoreLabel(pulse) }}</TableCell>
              <TableCell>
                <div class="space-y-1 text-xs text-muted-foreground">
                  <div>Sent {{ formatDate(pulse.sentAt) }}</div>
                  <div v-if="pulse.expiresAt">Expires {{ formatDate(pulse.expiresAt) }}</div>
                  <div v-if="pulse.completedAt">Completed {{ formatDate(pulse.completedAt) }}</div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Needs Your Attention</CardTitle>
        <CardDescription>Review requests that are still open or had delivery issues.</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="space-y-3">
          <Skeleton class="h-20 w-full" />
          <Skeleton class="h-20 w-full" />
        </div>

        <div v-else-if="!actionableReviews.length" class="rounded-lg border border-dashed p-8 text-center">
          <h3 class="text-lg font-medium">No pending reviews</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Your next review request will appear here after a session is completed and the WhatsApp review window opens.
            Pulse checkpoints are listed separately above.
          </p>
        </div>

        <div v-else class="grid gap-3">
          <div
            v-for="review in actionableReviews"
            :key="review.reviewRequestId"
            class="rounded-lg border p-4"
          >
            <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div class="space-y-1">
                <div class="font-medium">
                  {{ review.sessionTitle || review.companyProgramName || 'Mentorship review' }}
                </div>
                <div class="text-sm text-muted-foreground">
                  With {{ review.targetName || 'your mentor match' }}
                </div>
                <div class="text-xs text-muted-foreground">
                  Sent {{ formatDate(review.sentAt) }} · Expires {{ formatDate(review.expiresAt) }}
                </div>
              </div>

              <Badge :variant="statusTone(review)">{{ statusLabel(review) }}</Badge>
            </div>

            <div class="mt-3 text-sm text-muted-foreground">
              Complete this review in WhatsApp. If nothing arrived, wait a moment and refresh. Ops can resend failed deliveries.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Review History</CardTitle>
        <CardDescription>Past review cycles and your submitted status.</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="space-y-3">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>

        <div v-else-if="!reviews.length" class="rounded-lg border border-dashed p-8 text-center">
          <h3 class="text-lg font-medium">No review history yet</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Session reviews will start appearing here once WhatsApp review requests have been sent for your completed sessions.
          </p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Session</TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>My Response</TableHead>
              <TableHead>Window</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="review in reviews" :key="review.reviewRequestId">
              <TableCell>
                <div class="space-y-1">
                  <div class="font-medium">{{ review.sessionTitle || review.companyProgramName || 'Mentorship review' }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ review.companyProgramName || humanize(review.reviewType) || 'Session review' }}
                  </div>
                </div>
              </TableCell>
              <TableCell>{{ review.targetName || 'Unknown' }}</TableCell>
              <TableCell>
                <Badge :variant="statusTone(review)">
                  {{ statusLabel(review) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="space-y-1">
                  <div>{{ scoreLabel(review) }}</div>
                  <div v-if="review.recommendContinue !== null && review.recommendContinue !== undefined" class="text-xs text-muted-foreground">
                    Continue: {{ review.recommendContinue ? 'Yes' : 'No' }}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div class="space-y-1 text-xs text-muted-foreground">
                  <div>Expires {{ formatDate(review.expiresAt) }}</div>
                  <div v-if="review.revealedAt">Revealed {{ formatDate(review.revealedAt) }}</div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
