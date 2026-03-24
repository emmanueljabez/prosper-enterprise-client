<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { GitBranch, RefreshCw, Search, ShieldCheck, UserCheck, UserRoundPlus, XCircle } from 'lucide-vue-next'

definePageMeta({
  title: 'Mentor Matches',
  description: 'Assign mentors to company program employees',
  requiresAuth: true,
  permissions: ['admin:programs'],
})

const authStore = useAuthStore()
const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()

const {
  programs,
  isLoading,
  participants,
  participantsLoading,
  participantsError,
  mentorCandidates,
  mentorCandidatesLoading,
  mentorCandidatesError,
  mentorAssignmentSaving,
} = storeToRefs(companyProgramsStore)

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

const selectedProgramId = ref('')
const participantSearch = ref('')
const mentorSearch = ref('')
const selectedMentorByParticipant = reactive<Record<string, string>>({})

const selectedProgram = computed(() => programs.value.find(program => program.id === selectedProgramId.value) || null)

const visibleParticipants = computed(() => {
  const search = participantSearch.value.trim().toLowerCase()
  if (!search) return participants.value

  return participants.value.filter(participant =>
    [participant.profileName, participant.profileEmail, participant.mentorAssignment?.mentorName]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(search)),
  )
})

const visibleMentorCandidates = computed(() => {
  const search = mentorSearch.value.trim().toLowerCase()
  if (!search) return mentorCandidates.value

  return mentorCandidates.value.filter(candidate =>
    [
      candidate.mentorName,
      candidate.mentorEmail,
      candidate.title,
      candidate.company,
      ...(candidate.specializations || []),
    ]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(search)),
  )
})

const assignedCount = computed(() => participants.value.filter(participant => participant.mentorAssignment).length)
const unassignedCount = computed(() => Math.max(participants.value.length - assignedCount.value, 0))

const participantStatusTone = (status: string) => ({
  ENROLLED: 'secondary',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  WITHDRAWN: 'destructive',
}[status] as 'default' | 'secondary' | 'outline' | 'destructive')

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatRating = (value?: number | string | null) => value ?? '—'

const syncSelectedMentors = () => {
  for (const participant of participants.value) {
    const assignedMentorId = participant.mentorAssignment?.mentorId || ''
    if (assignedMentorId) {
      selectedMentorByParticipant[participant.id] = assignedMentorId
      continue
    }

    if (!selectedMentorByParticipant[participant.id]) {
      selectedMentorByParticipant[participant.id] = ''
    }
  }
}

const loadPrograms = async () => {
  if (!companyId.value) return

  try {
    await companyProgramsStore.loadCompanyPrograms({
      companyId: companyId.value,
      page: 0,
      size: 50,
      status: 'ALL',
    })

    if (!selectedProgramId.value && programs.value.length) {
      selectedProgramId.value = programs.value[0].id
    }
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load company programs')
  }
}

const loadProgramMatching = async () => {
  if (!selectedProgramId.value) {
    companyProgramsStore.clearParticipantsState()
    return
  }

  try {
    await Promise.all([
      companyProgramsStore.loadProgramParticipants({
        companyProgramId: selectedProgramId.value,
        page: 0,
        size: 100,
        status: 'ALL',
      }),
      companyProgramsStore.loadMentorCandidates(selectedProgramId.value),
    ])
    syncSelectedMentors()
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load mentor matching data')
  }
}

const assignMentor = async (participantId: string) => {
  const mentorId = selectedMentorByParticipant[participantId]
  if (!mentorId) {
    toast.error('Select a mentor before assigning')
    return
  }

  try {
    await companyProgramsStore.assignMentorToParticipant(participantId, mentorId)
  } catch {
    // store already handles toast
  }
}

const removeAssignment = async (participantId: string) => {
  if (!confirm('Remove the current mentor assignment for this participant?')) {
    return
  }

  try {
    await companyProgramsStore.removeParticipantMentorAssignment(participantId)
  } catch {
    // store already handles toast
  }
}

watch(companyId, value => {
  if (value) {
    loadPrograms()
  }
}, { immediate: true })

watch(selectedProgramId, () => {
  loadProgramMatching()
})

watch(participants, () => {
  syncSelectedMentors()
}, { deep: true })
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Mentor Matches</h1>
        <p class="text-sm text-muted-foreground">
          Review the mentor pool for a company program and assign mentors to employees manually.
        </p>
      </div>

      <div class="flex gap-2">
        <Button variant="outline" @click="loadPrograms" :disabled="isLoading">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh programs
        </Button>
        <Button variant="outline" @click="loadProgramMatching" :disabled="participantsLoading || mentorCandidatesLoading || !selectedProgramId">
          <GitBranch class="mr-2 h-4 w-4" :class="{ 'animate-spin': participantsLoading || mentorCandidatesLoading }" />
          Refresh matches
        </Button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Employees</CardDescription>
          <CardTitle class="text-3xl">{{ participants.length }}</CardTitle>
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
          <CardTitle class="text-3xl">{{ unassignedCount }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Mentor Candidates</CardDescription>
          <CardTitle class="text-3xl">{{ mentorCandidates.length }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Program Context</CardTitle>
        <CardDescription>Select the company program you want to assign mentors for.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Alert v-if="!companyId">
          <AlertDescription>Company context is missing for this account. Refresh your profile or sign in again.</AlertDescription>
        </Alert>

        <div v-else class="grid gap-3 md:grid-cols-[minmax(0,1fr),220px]">
          <Select v-model="selectedProgramId">
            <SelectTrigger>
              <SelectValue placeholder="Select a company program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="program in programs" :key="program.id" :value="program.id">
                {{ program.name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Input v-model="participantSearch" placeholder="Filter employees" />
        </div>

        <div v-if="selectedProgram" class="rounded-lg border bg-muted/30 p-4 text-sm">
          <div class="flex flex-wrap items-center gap-2">
            <div class="font-medium">{{ selectedProgram.name }}</div>
            <Badge variant="outline">{{ companyProgramsStore.matchingModeLabel(selectedProgram.matchingMode) }}</Badge>
          </div>
          <div class="mt-1 text-muted-foreground">
            {{ selectedProgram.objective || selectedProgram.targetAudienceDescription || 'No program objective captured yet.' }}
          </div>
        </div>
      </CardContent>
    </Card>

    <div class="grid gap-6 xl:grid-cols-[1fr,1.35fr]">
      <Card>
        <CardHeader>
          <CardTitle>Mentor Pool</CardTitle>
          <CardDescription>Available mentors for this company program.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input v-model="mentorSearch" class="pl-9" placeholder="Search mentor candidates" />
          </div>

          <Alert v-if="mentorCandidatesError" variant="destructive">
            <AlertDescription>{{ mentorCandidatesError }}</AlertDescription>
          </Alert>

          <div v-if="mentorCandidatesLoading" class="space-y-3">
            <Skeleton class="h-16 w-full" />
            <Skeleton class="h-16 w-full" />
            <Skeleton class="h-16 w-full" />
          </div>

          <div v-else-if="!visibleMentorCandidates.length" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No mentor candidates are currently available for this program.
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="candidate in visibleMentorCandidates"
              :key="candidate.mentorId"
              class="rounded-lg border p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="font-medium">{{ candidate.mentorName }}</div>
                  <div class="text-sm text-muted-foreground">
                    {{ candidate.title || 'Mentor' }}<span v-if="candidate.company"> · {{ candidate.company }}</span>
                  </div>
                </div>
                <Badge variant="outline">{{ companyProgramsStore.mentorCandidateSourceLabel(candidate.source) }}</Badge>
              </div>

              <div class="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Rating: {{ formatRating(candidate.rating) }}</span>
                <span>Sessions: {{ candidate.totalSessions ?? '—' }}</span>
                <span>Experience: {{ candidate.yearsExperience ?? '—' }} yrs</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Workspace</CardTitle>
          <CardDescription>Assign mentors to employees one by one and override when needed.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <Alert v-if="participantsError" variant="destructive">
            <AlertDescription>{{ participantsError }}</AlertDescription>
          </Alert>

          <div v-if="participantsLoading" class="space-y-3">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
          </div>

          <div v-else-if="!visibleParticipants.length" class="rounded-lg border border-dashed p-8 text-center">
            <ShieldCheck class="mx-auto h-8 w-8 text-muted-foreground" />
            <p class="mt-3 text-sm text-muted-foreground">
              No employees matched the current filter for this program.
            </p>
          </div>

          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Mentor</TableHead>
                <TableHead>Choose Mentor</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="participant in visibleParticipants" :key="participant.id">
                <TableCell>
                  <div class="space-y-1">
                    <div class="font-medium">{{ participant.profileName }}</div>
                    <div class="text-xs text-muted-foreground">
                      {{ participant.profileEmail || participant.department || 'Company employee' }}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="participantStatusTone(participant.status)">
                    {{ companyProgramsStore.participantStatusLabel(participant.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div v-if="participant.mentorAssignment" class="space-y-1">
                    <div class="font-medium">{{ participant.mentorAssignment.mentorName }}</div>
                    <div class="text-xs text-muted-foreground">
                      Assigned {{ formatDate(participant.mentorAssignment.assignedAt) }}
                    </div>
                  </div>
                  <span v-else class="text-sm text-muted-foreground">Pending assignment</span>
                </TableCell>
                <TableCell class="min-w-[220px]">
                  <Select v-model="selectedMentorByParticipant[participant.id]">
                    <SelectTrigger>
                      <SelectValue placeholder="Select mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="candidate in visibleMentorCandidates"
                        :key="candidate.mentorId"
                        :value="candidate.mentorId"
                      >
                        {{ candidate.mentorName }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button
                      size="sm"
                      @click="assignMentor(participant.id)"
                      :disabled="mentorAssignmentSaving || !selectedMentorByParticipant[participant.id]"
                    >
                      <UserRoundPlus class="mr-2 h-4 w-4" />
                      {{ participant.mentorAssignment ? 'Reassign' : 'Assign' }}
                    </Button>
                    <Button
                      v-if="participant.mentorAssignment"
                      variant="ghost"
                      size="sm"
                      @click="removeAssignment(participant.id)"
                      :disabled="mentorAssignmentSaving"
                    >
                      <XCircle class="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
