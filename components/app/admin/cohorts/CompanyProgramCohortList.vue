<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCompanyProgramCohortsStore } from '@/store/modules/company-program-cohorts'
import type { CompanyProgramCohortRecord, CompanyProgramCohortStatus } from '@/http/requests/app/companyProgramCohorts'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { CalendarRange, ChevronRight, CircleDot, RefreshCw, Ticket, UserPlus, Users } from 'lucide-vue-next'
import CompanyProgramCohortEditorDialog from './CompanyProgramCohortEditorDialog.vue'

const props = defineProps<{
  programId: string
}>()

const cohortsStore = useCompanyProgramCohortsStore()
const { cohorts, isLoading, error } = storeToRefs(cohortsStore)
const showCreateDialog = ref(false)

const totalParticipants = computed(() =>
  cohorts.value.reduce((total, cohort) => total + (cohort.participantCount || 0), 0),
)
const totalCircles = computed(() =>
  cohorts.value.reduce((total, cohort) => total + (cohort.circleCount || 0), 0),
)
const activeCycleCount = computed(() =>
  cohorts.value.filter(cohort => ['INTAKE_OPEN', 'PLENARY_SCHEDULED', 'CIRCLES_FORMING', 'CIRCLES_FINALIZED', 'MATCHING', 'ACTIVE'].includes(cohort.status)).length,
)

const loadCohorts = async () => {
  if (!props.programId) return
  await cohortsStore.loadCohorts(props.programId)
}

const openCohort = (cohort: CompanyProgramCohortRecord) => {
  const programId = props.programId
  navigateTo(`/app/admin/programs/${programId}/cohorts/${cohort.id}`)
}

const statusTone = (status: CompanyProgramCohortStatus) => ({
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
}[status] as 'default' | 'secondary' | 'outline' | 'destructive')

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

const formatDateRange = (startsAt?: string | null, endsAt?: string | null) => {
  if (!startsAt && !endsAt) return 'Flexible dates'
  return `${formatDate(startsAt)} - ${formatDate(endsAt)}`
}

const cohortLocation = (cohort: CompanyProgramCohortRecord) =>
  [cohort.chapter, cohort.region].filter(Boolean).join(' | ') || 'No location set'

const visibleInterestTags = (cohort: CompanyProgramCohortRecord) =>
  (cohort.interestTagSet || []).slice(0, 5)

const hiddenInterestTagCount = (cohort: CompanyProgramCohortRecord) =>
  Math.max((cohort.interestTagSet || []).length - 5, 0)

watch(() => props.programId, async programId => {
  if (programId) {
    await loadCohorts()
  }
}, { immediate: true })
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold tracking-tight">Cohorts & cycles</h2>
        <p class="text-sm text-muted-foreground">
          Run multiple cohort cycles inside this company program, then move attendees through plenary, circles, and 1:1 matching.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button variant="outline" :disabled="isLoading || !programId" @click="loadCohorts">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <Button :disabled="!programId" @click="showCreateDialog = true">
          <UserPlus class="mr-2 h-4 w-4" />
          Create cohort
        </Button>
      </div>
    </div>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Active cycles</CardDescription>
          <CardTitle class="text-3xl">{{ activeCycleCount }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Cohort participants</CardDescription>
          <CardTitle class="text-3xl">{{ totalParticipants }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Common-interest circles</CardDescription>
          <CardTitle class="text-3xl">{{ totalCircles }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <div v-if="isLoading" class="grid gap-4 lg:grid-cols-2">
      <Skeleton class="h-44 w-full" />
      <Skeleton class="h-44 w-full" />
    </div>

    <div v-else-if="!cohorts.length" class="rounded-lg border border-dashed p-10 text-center">
      <CircleDot class="mx-auto h-9 w-9 text-muted-foreground" />
      <p class="mt-3 text-sm font-medium">No cohorts are configured yet.</p>
      <p class="mt-1 text-sm text-muted-foreground">
        Create the first cycle for this company program before opening intake.
      </p>
      <Button class="mt-4" :disabled="!programId" @click="showCreateDialog = true">
        <UserPlus class="mr-2 h-4 w-4" />
        Create cohort
      </Button>
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <Card
        v-for="cohort in cohorts"
        :key="cohort.id"
        class="cohort-card cursor-pointer transition hover:border-primary/50 hover:shadow-sm"
        role="button"
        tabindex="0"
        @click="openCohort(cohort)"
        @keydown.enter.prevent="openCohort(cohort)"
        @keydown.space.prevent="openCohort(cohort)"
      >
        <CardHeader class="space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <CardTitle class="text-base">{{ cohort.name }}</CardTitle>
              <CardDescription>{{ cohortLocation(cohort) }}</CardDescription>
            </div>
            <Badge :variant="statusTone(cohort.status)">{{ statusLabel(cohort.status) }}</Badge>
          </div>

          <div class="flex flex-wrap gap-2">
            <Badge variant="outline">
              <Ticket class="mr-1 h-3 w-3" />
              {{ cohort.code }}
            </Badge>
            <Badge v-if="cohort.selfJoinEnabled" variant="secondary">Self-join enabled</Badge>
            <Badge v-else variant="outline">Admin intake</Badge>
          </div>
        </CardHeader>

        <CardContent class="space-y-4">
          <div class="grid gap-3 text-sm sm:grid-cols-3">
            <div class="cohort-fact">
              <Users class="h-4 w-4 text-muted-foreground" />
              <span>{{ cohort.participantCount || 0 }} participants</span>
            </div>
            <div class="cohort-fact">
              <CircleDot class="h-4 w-4 text-muted-foreground" />
              <span>{{ cohort.circleCount || 0 }} circles</span>
            </div>
            <div class="cohort-fact">
              <CalendarRange class="h-4 w-4 text-muted-foreground" />
              <span>{{ formatDateRange(cohort.startsAt, cohort.endsAt) }}</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in visibleInterestTags(cohort)"
              :key="tag"
              class="cohort-tag"
            >
              {{ tag }}
            </span>
            <span v-if="hiddenInterestTagCount(cohort)" class="cohort-tag">+{{ hiddenInterestTagCount(cohort) }}</span>
          </div>

          <div class="flex items-center justify-between border-t pt-3 text-sm">
            <span class="text-muted-foreground">
              {{ cohort.unplacedCount || 0 }} unplaced · {{ cohort.matchedCount || 0 }} matched
            </span>
            <span class="inline-flex items-center font-medium text-primary">
              Open workspace
              <ChevronRight class="ml-1 h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </div>

    <CompanyProgramCohortEditorDialog
      v-model:open="showCreateDialog"
      :program-id="programId"
      @created="loadCohorts"
    />
  </section>
</template>

<style scoped>
.cohort-card {
  border-radius: 8px;
}

.cohort-fact {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: #3f3a3f;
}

.cohort-tag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border: 1px solid #ead2e4;
  border-radius: 999px;
  background: #fbf6fa;
  color: #6f2d66;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  padding: 0 10px;
}
</style>
