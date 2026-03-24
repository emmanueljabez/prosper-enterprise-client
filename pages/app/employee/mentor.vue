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
import { RefreshCw, Star, UserCheck } from 'lucide-vue-next'

definePageMeta({
  title: 'My Mentor',
  description: 'View the mentors assigned to your company programs',
  requiresAuth: true,
  permissions: ['mentors:view'],
})

const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()
const router = useRouter()

const assignedMatches = computed(() =>
  companyProgramsStore.employeeMatches.filter(match => match.mentorAssignment),
)

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

const loadMatches = async () => {
  try {
    await companyProgramsStore.loadMyCompanyProgramMatches()
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load your assigned mentors')
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
        <h1 class="text-2xl font-semibold tracking-tight">My Mentor</h1>
        <p class="text-sm text-muted-foreground">
          These are the mentors currently assigned to your company programs.
        </p>
      </div>

      <Button variant="outline" @click="loadMatches" :disabled="companyProgramsStore.employeeMatchesLoading">
        <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': companyProgramsStore.employeeMatchesLoading }" />
        Refresh
      </Button>
    </div>

    <Alert v-if="companyProgramsStore.employeeMatchesError" variant="destructive">
      <AlertDescription>{{ companyProgramsStore.employeeMatchesError }}</AlertDescription>
    </Alert>

    <div v-if="companyProgramsStore.employeeMatchesLoading" class="grid gap-4 md:grid-cols-2">
      <Skeleton class="h-64 w-full" />
      <Skeleton class="h-64 w-full" />
    </div>

    <div v-else-if="!assignedMatches.length" class="rounded-lg border border-dashed p-10 text-center">
      <UserCheck class="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 class="mt-4 text-lg font-medium">No mentors assigned yet</h2>
      <p class="mt-2 text-sm text-muted-foreground">
        When a mentor is assigned to one of your programs, their profile summary will appear here.
      </p>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2">
      <Card v-for="match in assignedMatches" :key="match.participantId" class="h-full">
        <CardHeader class="space-y-3">
          <div class="space-y-1">
            <CardTitle class="text-lg">{{ match.mentorAssignment?.mentorName }}</CardTitle>
            <CardDescription>{{ match.programName }}</CardDescription>
          </div>
          <Badge variant="outline">{{ match.companyName || 'Employer program' }}</Badge>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <div class="text-sm font-medium">
              {{ match.mentorAssignment?.title || 'Mentor' }}
              <span v-if="match.mentorAssignment?.company" class="text-muted-foreground"> · {{ match.mentorAssignment?.company }}</span>
            </div>
            <div class="text-sm text-muted-foreground">
              {{ match.mentorAssignment?.mentorEmail || 'Contact details available once sessions are booked.' }}
            </div>
          </div>

          <div class="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <div>
              <div class="font-medium text-foreground">Experience</div>
              <div>{{ match.mentorAssignment?.yearsExperience ?? '—' }} years</div>
            </div>
            <div>
              <div class="font-medium text-foreground">Sessions</div>
              <div>{{ match.mentorAssignment?.totalSessions ?? '—' }}</div>
            </div>
            <div>
              <div class="font-medium text-foreground">Rating</div>
              <div class="flex items-center gap-1">
                <Star class="h-4 w-4" />
                {{ match.mentorAssignment?.rating ?? '—' }}
              </div>
            </div>
            <div>
              <div class="font-medium text-foreground">Assigned</div>
              <div>{{ match.mentorAssignment?.assignedAt ? new Date(match.mentorAssignment.assignedAt).toLocaleDateString() : 'Recently' }}</div>
            </div>
          </div>

          <div v-if="match.mentorAssignment?.specializations?.length" class="flex flex-wrap gap-2">
            <Badge v-for="specialization in match.mentorAssignment.specializations" :key="specialization" variant="secondary">
              {{ specialization }}
            </Badge>
          </div>

          <div class="space-y-2">
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
