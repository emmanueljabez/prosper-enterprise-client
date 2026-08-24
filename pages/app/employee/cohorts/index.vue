<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCompanyProgramCohortsStore } from '@/store/modules/company-program-cohorts'
import type { EmployeeCompanyProgramCohortRecord } from '@/http/requests/app/companyProgramCohorts'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Skeleton } from '~/components/ui/skeleton'
import { CalendarRange, CircleDot, Link, RefreshCw, UserRoundCheck, Users } from 'lucide-vue-next'

definePageMeta({
  title: 'My Cohorts',
  description: 'View your company program cohort and circle progress',
  requiresAuth: true,
  permissions: ['mentors:view'],
})

const cohortsStore = useCompanyProgramCohortsStore()
const toast = useAppToast()
const { employeeCohorts, isLoading, error } = storeToRefs(cohortsStore)
const joinCode = ref('')

const activeCohorts = computed(() =>
  employeeCohorts.value.filter(cohort => !['COMPLETED', 'CANCELLED', 'ARCHIVED'].includes(cohort.cohortStatus)),
)

const loadEmployeeCohorts = async () => {
  try {
    await cohortsStore.loadEmployeeCohorts()
  } catch (loadError: any) {
    toast.error(loadError?.response?.data?.message || loadError?.message || 'Failed to load your cohorts')
  }
}

const openCohort = (cohort: EmployeeCompanyProgramCohortRecord) => {
  navigateTo(`/app/employee/cohorts/${cohort.cohortId}`)
}

const joinWithCode = () => {
  const code = joinCode.value.trim()
  if (!code) {
    toast.error('Enter a cohort join code')
    return
  }

  navigateTo({
    path: '/app/employee/cohorts/join',
    query: { code },
  })
}

const statusLabel = (status?: string | null) =>
  status ? String(status).toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()) : 'Unknown'

const stageLabel = (cohort: EmployeeCompanyProgramCohortRecord) => {
  if (cohort.stages.oneToOne.status === 'COMPLETE' || cohort.mentorAssignment) return '1:1 mentor'
  if (cohort.stages.circle.status === 'COMPLETE' || cohort.circle) return 'Circle'
  return 'Plenary'
}

const formatDateRange = (startsAt?: string | null, endsAt?: string | null) => {
  const format = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'

  return startsAt || endsAt ? `${format(startsAt)} - ${format(endsAt)}` : 'Dates will be shared'
}

onMounted(() => {
  loadEmployeeCohorts()
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">My Cohort & Circle</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Track your current cohort, common-interest circle, and 1:1 mentor status.
        </p>
      </div>

      <div class="join-code-panel">
        <Input v-model="joinCode" placeholder="Enter join code" @keyup.enter="joinWithCode" />
        <Button @click="joinWithCode">
          <Link class="mr-2 h-4 w-4" />
          Join with code
        </Button>
        <Button variant="outline" :disabled="isLoading" @click="loadEmployeeCohorts">
          <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          <span class="sr-only">Refresh cohorts</span>
        </Button>
      </div>
    </div>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Active cohorts</CardDescription>
          <CardTitle class="text-3xl">{{ activeCohorts.length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Circle placements</CardDescription>
          <CardTitle class="text-3xl">{{ employeeCohorts.filter(cohort => cohort.circle).length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>1:1 mentors</CardDescription>
          <CardTitle class="text-3xl">{{ employeeCohorts.filter(cohort => cohort.mentorAssignment).length }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <div v-if="isLoading" class="grid gap-4 lg:grid-cols-2">
      <Skeleton class="h-52 w-full" />
      <Skeleton class="h-52 w-full" />
    </div>

    <div v-else-if="!employeeCohorts.length" class="rounded-lg border border-dashed p-10 text-center">
      <CircleDot class="mx-auto h-10 w-10 text-muted-foreground" />
      <p class="mt-3 text-sm font-medium">No cohort cycles are assigned yet.</p>
      <p class="mt-1 text-sm text-muted-foreground">
        Use a join code if your program coordinator has shared one with you.
      </p>
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <Card
        v-for="cohort in employeeCohorts"
        :key="cohort.cohortId"
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
              <CardTitle class="text-base">{{ cohort.cohortName }}</CardTitle>
              <CardDescription>{{ cohort.companyProgramName || cohort.companyName || 'Company program' }}</CardDescription>
            </div>
            <Badge variant="outline">{{ statusLabel(cohort.participantStatus) }}</Badge>
          </div>
          <div class="flex flex-wrap gap-2">
            <Badge variant="secondary">{{ stageLabel(cohort) }}</Badge>
            <Badge variant="outline">{{ cohort.chapter || cohort.region || 'Cohort cycle' }}</Badge>
          </div>
        </CardHeader>

        <CardContent class="space-y-4">
          <div class="grid gap-3 text-sm sm:grid-cols-3">
            <div class="cohort-fact">
              <CalendarRange class="h-4 w-4 text-muted-foreground" />
              <span>{{ formatDateRange(null, null) }}</span>
            </div>
            <div class="cohort-fact">
              <Users class="h-4 w-4 text-muted-foreground" />
              <span>{{ cohort.circle?.memberCount || 0 }} circle peers</span>
            </div>
            <div class="cohort-fact">
              <UserRoundCheck class="h-4 w-4 text-muted-foreground" />
              <span>{{ cohort.mentorAssignment?.mentorName || 'Mentor pending' }}</span>
            </div>
          </div>

          <div class="stage-strip">
            <span :class="{ 'stage-chip--done': cohort.stages.plenary.status === 'COMPLETE' }">Plenary</span>
            <span :class="{ 'stage-chip--done': cohort.stages.circle.status === 'COMPLETE' || cohort.circle }">Circle</span>
            <span :class="{ 'stage-chip--done': cohort.stages.oneToOne.status === 'COMPLETE' || cohort.mentorAssignment }">1:1</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.join-code-panel {
  display: grid;
  gap: 10px;
}

@media (min-width: 640px) {
  .join-code-panel {
    grid-template-columns: minmax(180px, 260px) auto auto;
  }
}

.cohort-card {
  border-radius: 8px;
}

.cohort-fact {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  color: #3f3a3f;
}

.stage-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.stage-strip span {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid #ead2e4;
  border-radius: 8px;
  color: #71576d;
  font-size: 12px;
  font-weight: 700;
}

.stage-strip .stage-chip--done {
  border-color: #bfe8d8;
  background: #eaf8f2;
  color: #137a55;
}
</style>
