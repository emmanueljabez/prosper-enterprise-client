<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useCompanyProgramCohortsStore } from '@/store/modules/company-program-cohorts'
import type { EmployeeCohortStageRecord } from '@/http/requests/app/companyProgramCohorts'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Skeleton } from '~/components/ui/skeleton'
import { ArrowLeft, CalendarRange, Check, CircleDot, MessageSquare, RefreshCw, UserRoundCheck, Users } from 'lucide-vue-next'

definePageMeta({
  title: 'My Cohort & Circle',
  description: 'View cohort, circle, and mentor progress',
  requiresAuth: true,
  permissions: ['mentors:view'],
})

const route = useRoute()
const router = useRouter()
const cohortsStore = useCompanyProgramCohortsStore()
const toast = useAppToast()
const { selectedEmployeeCohort, employeeCircles, isLoading, isSaving, error } = storeToRefs(cohortsStore)
const selectedCircleId = ref('')

const cohortId = computed(() => String(route.params.cohortId || ''))
const currentCircle = computed(() => selectedEmployeeCohort.value?.circle || null)
const mentorAssignment = computed(() => selectedEmployeeCohort.value?.mentorAssignment || null)
const availableCircles = computed(() => employeeCircles.value.filter(circle => circle.status !== 'CANCELLED'))

const loadEmployeeCohort = async () => {
  if (!cohortId.value) return
  await cohortsStore.loadEmployeeCohort(cohortId.value)
}

const loadEmployeeCohortCircles = async () => {
  if (!cohortId.value) return
  await cohortsStore.loadEmployeeCohortCircles(cohortId.value)
}

const loadWorkspace = async () => {
  try {
    await Promise.all([
      loadEmployeeCohort(),
      loadEmployeeCohortCircles(),
    ])
  } catch (loadError: any) {
    toast.error(loadError?.response?.data?.message || loadError?.message || 'Failed to load cohort progress')
  }
}

const requestCircle = async () => {
  if (!cohortId.value || !selectedCircleId.value) {
    toast.error('Choose a circle before submitting your request')
    return
  }

  try {
    await cohortsStore.requestCircle(cohortId.value, { circleId: selectedCircleId.value })
    selectedCircleId.value = ''
    toast.success('Circle request submitted.')
    await loadWorkspace()
  } catch (requestError: any) {
    toast.error(requestError?.response?.data?.message || requestError?.message || 'Failed to request circle')
  }
}

const openSessions = () => {
  navigateTo(`/app/sessions?cohortId=${cohortId.value}`)
}

const stageTone = (stage?: EmployeeCohortStageRecord | null) => {
  if (stage?.status === 'COMPLETE') return 'complete'
  if (stage?.status === 'BLOCKED') return 'blocked'
  return 'active'
}

const stageStatusLabel = (stage?: EmployeeCohortStageRecord | null) =>
  stage?.status ? stage.status.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()) : 'Pending'

const initials = (value?: string | null) =>
  (value || 'PM')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'PM'

onMounted(() => {
  loadWorkspace()
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="space-y-1">
        <Button variant="ghost" class="w-fit px-0 text-muted-foreground" @click="router.push('/app/employee/cohorts')">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back to cohorts
        </Button>
        <p class="text-xs font-semibold uppercase tracking-wide text-primary">My cohort & circle</p>
        <h1 class="text-2xl font-semibold tracking-tight">{{ selectedEmployeeCohort?.cohortName || 'My cohort & circle' }}</h1>
        <p class="text-sm text-muted-foreground">
          {{ selectedEmployeeCohort?.companyProgramName || selectedEmployeeCohort?.companyName || 'Company mentorship program' }}
        </p>
      </div>

      <Button variant="outline" :disabled="isLoading" @click="loadWorkspace">
        <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
        Refresh
      </Button>
    </div>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div v-if="isLoading && !selectedEmployeeCohort" class="space-y-3">
      <Skeleton class="h-28 w-full" />
      <Skeleton class="h-64 w-full" />
    </div>

    <template v-else-if="selectedEmployeeCohort">
      <div class="phone-board">
        <div class="phone-header">
          <p>Hi {{ selectedEmployeeCohort.companyName || 'there' }}</p>
          <h2>{{ selectedEmployeeCohort.cohortName }}</h2>
        </div>

        <div class="stage-summary">
          <div class="stage-dot" :class="`stage-dot--${stageTone(selectedEmployeeCohort.stages.plenary)}`">
            <Check class="h-4 w-4" />
            <span>Plenary</span>
          </div>
          <div class="stage-dot" :class="`stage-dot--${stageTone(selectedEmployeeCohort.stages.circle)}`">
            <Check class="h-4 w-4" />
            <span>Circle</span>
          </div>
          <div class="stage-dot" :class="`stage-dot--${stageTone(selectedEmployeeCohort.stages.oneToOne)}`">
            <Check class="h-4 w-4" />
            <span>1:1</span>
          </div>
        </div>

        <div class="phone-card">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3>Plenary</h3>
              <p>{{ stageStatusLabel(selectedEmployeeCohort.stages.plenary) }}</p>
            </div>
            <Badge variant="outline">{{ selectedEmployeeCohort.participantStatus }}</Badge>
          </div>
        </div>

        <div class="phone-card">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3>Circle</h3>
              <p v-if="currentCircle">
                {{ currentCircle.name }}<span v-if="currentCircle.nextSessionAt"> | next session {{ new Date(currentCircle.nextSessionAt).toLocaleDateString() }}</span>
              </p>
              <p v-else>{{ selectedEmployeeCohort.stages.circle.blockedReason || 'Circle placement is pending.' }}</p>
            </div>
            <Badge :variant="currentCircle ? 'secondary' : 'outline'">{{ currentCircle ? 'Active' : stageStatusLabel(selectedEmployeeCohort.stages.circle) }}</Badge>
          </div>

          <div v-if="currentCircle?.members?.length" class="mt-3 flex flex-wrap gap-2">
            <span v-for="member in currentCircle.members" :key="member.membershipId" class="member-chip">
              {{ member.profileName || member.profileEmail || 'Circle peer' }}
            </span>
          </div>
        </div>

        <div class="phone-card">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3>1:1 Mentor</h3>
              <p v-if="mentorAssignment">
                Your 1:1 mentor is confirmed.
              </p>
              <p v-else>{{ selectedEmployeeCohort.stages.oneToOne.blockedReason || 'Your mentor match is pending.' }}</p>
            </div>
            <Badge :variant="mentorAssignment ? 'secondary' : 'outline'">{{ mentorAssignment ? 'Matched' : 'Pending' }}</Badge>
          </div>

          <div v-if="mentorAssignment" class="mentor-row">
            <div class="mentor-avatar">{{ initials(mentorAssignment.mentorName) }}</div>
            <div>
              <div class="font-medium">{{ mentorAssignment.mentorName }}</div>
              <div class="text-xs text-muted-foreground">Mentor assigned to this cohort journey</div>
            </div>
          </div>

          <Button class="mt-3" variant="outline" size="sm" @click="openSessions">
            <MessageSquare class="mr-2 h-4 w-4" />
            Request an additional session
          </Button>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Circle Request</CardTitle>
            <CardDescription>Choose a common-interest circle if your cohort is open for circle requests.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-if="currentCircle" class="rounded-lg border bg-muted/20 p-4 text-sm">
              You are already placed in {{ currentCircle.name }}.
            </div>
            <div v-else class="grid gap-3 sm:grid-cols-[1fr,auto]">
              <Select v-model="selectedCircleId" :disabled="!availableCircles.length">
                <SelectTrigger>
                  <SelectValue placeholder="Select a circle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="circle in availableCircles" :key="circle.id" :value="circle.id">
                    {{ circle.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button :disabled="isSaving || !selectedCircleId" @click="requestCircle">
                <CircleDot class="mr-2 h-4 w-4" />
                Request circle
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cohort Details</CardTitle>
            <CardDescription>Your current cycle and assignment context.</CardDescription>
          </CardHeader>
          <CardContent class="grid gap-4 md:grid-cols-2">
            <div class="detail-tile">
              <Users class="h-4 w-4" />
              <span>{{ selectedEmployeeCohort.chapter || selectedEmployeeCohort.region || 'Cohort chapter' }}</span>
            </div>
            <div class="detail-tile">
              <CalendarRange class="h-4 w-4" />
              <span>{{ selectedEmployeeCohort.cohortStatus }}</span>
            </div>
            <div class="detail-tile">
              <CircleDot class="h-4 w-4" />
              <span>{{ currentCircle?.name || 'Circle pending' }}</span>
            </div>
            <div class="detail-tile">
              <UserRoundCheck class="h-4 w-4" />
              <span>{{ mentorAssignment?.mentorName || 'Mentor pending' }}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </div>
</template>

<style scoped>
.phone-board {
  max-width: 430px;
  border: 10px solid #232023;
  border-radius: 34px;
  background: #fff;
  box-shadow: 0 18px 34px rgba(35, 32, 35, 0.12);
  overflow: hidden;
}

.phone-header {
  background: #a03b93;
  color: #fff;
  padding: 22px 24px;
}

.phone-header p {
  font-size: 13px;
  opacity: 0.8;
}

.phone-header h2 {
  margin-top: 4px;
  font-size: 18px;
  font-weight: 800;
}

.stage-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 24px;
}

.stage-dot {
  display: grid;
  justify-items: center;
  gap: 8px;
  color: #6e626c;
  font-size: 12px;
  font-weight: 700;
}

.stage-dot svg {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #f2edf1;
  color: #7a6574;
  padding: 7px;
}

.stage-dot--complete svg {
  background: #0fa36b;
  color: #fff;
}

.stage-dot--blocked svg {
  background: #f6e9e8;
  color: #a44235;
}

.stage-dot--active svg {
  background: #e6f3f0;
  color: #0f7c60;
}

.phone-card {
  margin: 0 16px 14px;
  border: 1px solid #ead2e4;
  border-radius: 8px;
  padding: 14px;
}

.phone-card h3 {
  font-size: 14px;
  font-weight: 800;
}

.phone-card p {
  margin-top: 4px;
  color: #6f626c;
  font-size: 12px;
}

.member-chip {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  border-radius: 999px;
  background: #e8f6f1;
  color: #0d6f51;
  font-size: 11px;
  font-weight: 700;
  padding: 0 9px;
}

.mentor-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.mentor-avatar {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #8a337f;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}

.detail-tile {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  gap: 8px;
  border: 1px solid #ead2e4;
  border-radius: 8px;
  padding: 12px;
  color: #3f3a3f;
  font-size: 13px;
  font-weight: 700;
}
</style>
