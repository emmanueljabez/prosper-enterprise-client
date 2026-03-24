<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { GitBranch, RefreshCw, UserCheck, Users } from 'lucide-vue-next'

definePageMeta({
  title: 'Mentor Matches',
  description: 'Review mentor assignment status across your company programs',
  requiresAuth: true,
  permissions: ['mentors:view'],
})

const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()
const router = useRouter()

const assignedCount = computed(() =>
  companyProgramsStore.employeeMatches.filter(match => match.mentorAssignment).length,
)

const pendingCount = computed(() =>
  Math.max(companyProgramsStore.employeeMatches.length - assignedCount.value, 0),
)

const participantStatusTone = (status: string) => ({
  ENROLLED: 'secondary',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  WITHDRAWN: 'destructive',
}[status] as 'default' | 'secondary' | 'outline' | 'destructive')

const canBookAssignedMentor = (match: any) =>
  Boolean(match?.mentorAssignment?.mentorId) && ['ENROLLED', 'ACTIVE'].includes(match?.participantStatus)

const openAssignedMentor = (match: any) => {
  const mentorId = match?.mentorAssignment?.mentorId
  if (!mentorId) {
    toast.error('Mentor details are not available yet.')
    return
  }

  router.push({
    path: `/app/mentors/${mentorId}`,
    query: {
      companyProgramId: match.companyProgramId,
      companyProgramParticipantId: match.participantId,
      companyProgramName: match.programName,
    },
  })
}

const formatDateRange = (startsAt?: string | null, endsAt?: string | null) => {
  if (!startsAt && !endsAt) return 'Dates will be shared when your program is scheduled.'

  const format = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'

  return `${format(startsAt)} - ${format(endsAt)}`
}

const loadMatches = async () => {
  try {
    await companyProgramsStore.loadMyCompanyProgramMatches()
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load your mentor matches')
  }
}

onMounted(() => {
  loadMatches()
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Mentor Matches</h1>
        <p class="text-sm text-muted-foreground">
          Track mentor assignment status across the company programs you are enrolled in.
        </p>
      </div>

      <Button variant="outline" @click="loadMatches" :disabled="companyProgramsStore.employeeMatchesLoading">
        <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': companyProgramsStore.employeeMatchesLoading }" />
        Refresh
      </Button>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Programs</CardDescription>
          <CardTitle class="text-3xl">{{ companyProgramsStore.employeeMatches.length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Assigned</CardDescription>
          <CardTitle class="text-3xl">{{ assignedCount }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Pending</CardDescription>
          <CardTitle class="text-3xl">{{ pendingCount }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <Alert v-if="companyProgramsStore.employeeMatchesError" variant="destructive">
      <AlertDescription>{{ companyProgramsStore.employeeMatchesError }}</AlertDescription>
    </Alert>

    <div v-if="companyProgramsStore.employeeMatchesLoading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Skeleton class="h-56 w-full" />
      <Skeleton class="h-56 w-full" />
      <Skeleton class="h-56 w-full" />
    </div>

    <div v-else-if="!companyProgramsStore.employeeMatches.length" class="rounded-lg border border-dashed p-10 text-center">
      <GitBranch class="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 class="mt-4 text-lg font-medium">No mentor match records yet</h2>
      <p class="mt-2 text-sm text-muted-foreground">
        When your employer starts matching mentors for your programs, the status will show here.
      </p>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card v-for="match in companyProgramsStore.employeeMatches" :key="match.participantId" class="h-full">
        <CardHeader class="space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <CardTitle class="text-lg">{{ match.programName }}</CardTitle>
              <CardDescription>{{ match.companyName || 'Employer program' }}</CardDescription>
            </div>
            <Badge :variant="participantStatusTone(match.participantStatus)">
              {{ companyProgramsStore.participantStatusLabel(match.participantStatus) }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2 text-sm text-muted-foreground">
            <div class="flex items-center gap-2">
              <Users class="h-4 w-4" />
              <span>{{ companyProgramsStore.matchingModeLabel(match.matchingMode) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <GitBranch class="h-4 w-4" />
              <span>{{ formatDateRange(match.startsAt, match.endsAt) }}</span>
            </div>
          </div>

          <div v-if="match.mentorAssignment" class="rounded-lg border bg-muted/30 p-4">
            <div class="flex items-center gap-2 text-sm font-medium">
              <UserCheck class="h-4 w-4" />
              {{ match.mentorAssignment.mentorName }}
            </div>
            <div class="mt-1 text-sm text-muted-foreground">
              {{ match.mentorAssignment.title || 'Mentor' }}<span v-if="match.mentorAssignment.company"> · {{ match.mentorAssignment.company }}</span>
            </div>
            <div class="mt-2 text-xs text-muted-foreground">
              Assigned {{ match.mentorAssignment.assignedAt ? new Date(match.mentorAssignment.assignedAt).toLocaleDateString() : 'recently' }}
            </div>
          </div>

          <div v-else class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Your employer is still assigning a mentor for this program.
          </div>

          <div v-if="match.mentorAssignment" class="space-y-2">
            <Button class="w-full" @click="openAssignedMentor(match)" :disabled="!canBookAssignedMentor(match)">
              Book Session
            </Button>
            <p v-if="!canBookAssignedMentor(match)" class="text-xs text-muted-foreground">
              Booking is available while your program participation is active.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
