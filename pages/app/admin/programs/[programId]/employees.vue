<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyStore } from '@/store/modules/company'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import type { CompanyProgramParticipantStatus } from '@/http/requests/app/companyPrograms'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { ArrowLeft, RefreshCw, Search, Trash2, UserPlus, Users } from 'lucide-vue-next'

definePageMeta({
  title: 'Program Employees',
  description: 'Manage the employees enrolled in a company program',
  requiresAuth: true,
  permissions: ['admin:users'],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()

const { profiles, profilesLoading } = storeToRefs(companyStore)
const {
  programs,
  isLoading,
  participants,
  participantsLoading,
  participantsSaving,
  participantsError,
  participantsPagination,
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

const programId = computed(() => String(route.params.programId || ''))
const employeeSearch = ref('')
const participantSearch = ref('')
const participantStatus = ref<CompanyProgramParticipantStatus | 'ALL'>('ALL')
const selectedProfileIds = ref<string[]>([])
const employeeSearchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)
const participantSearchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)

const selectedProgram = computed(() =>
  programs.value.find(program => program.id === programId.value) || null,
)

const participantProfileIds = computed(() => new Set(participants.value.map(participant => participant.profileId)))

const availableEmployees = computed(() => {
  return (profiles.value || []).filter((profile: any) => {
    const normalizedRole = String(profile?.role || '').trim().toLowerCase()
    return ['employee', 'mentee'].includes(normalizedRole)
  })
})

const selectedCount = computed(() => selectedProfileIds.value.length)

const employeeName = (profile: any) => {
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
  return fullName || profile?.username || profile?.email || 'Employee'
}

const employeeSecondary = (profile: any) => {
  const bits = [profile?.email, profile?.industry || profile?.location].filter(Boolean)
  return bits.join(' • ') || 'Company employee'
}

const participantStatusTone = (status: CompanyProgramParticipantStatus) => ({
  ENROLLED: 'secondary',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  WITHDRAWN: 'destructive',
}[status] as 'default' | 'secondary' | 'outline' | 'destructive')

const consentTone = (status?: string | null) => ({
  GRANTED: 'secondary',
  REVOKED: 'destructive',
}[String(status || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const consentLabel = (status?: string | null) =>
  status
    ? String(status).toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())
    : 'Pending'

const formatDate = (value?: string | null) => {
  if (!value) return '—'

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load company programs')
  }
}

const loadEmployees = async () => {
  if (!companyId.value) return

  try {
    await companyStore.loadProfiles({
      companyId: companyId.value,
      page: 0,
      size: 100,
      search: employeeSearch.value,
    })
  } catch {
    // company store already handles toast
  }
}

const loadParticipants = async () => {
  if (!programId.value) {
    companyProgramsStore.clearParticipantsState()
    return
  }

  try {
    await companyProgramsStore.loadProgramParticipants({
      companyProgramId: programId.value,
      page: 0,
      size: 50,
      search: participantSearch.value,
      status: participantStatus.value,
    })
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load program employees')
  }
}

const refreshWorkspace = async () => {
  await Promise.all([
    loadPrograms(),
    loadEmployees(),
    loadParticipants(),
  ])
}

const toggleSelectedProfile = (profileId: string, checked: boolean | 'indeterminate') => {
  if (checked !== true) {
    selectedProfileIds.value = selectedProfileIds.value.filter(id => id !== profileId)
    return
  }

  if (!selectedProfileIds.value.includes(profileId)) {
    selectedProfileIds.value = [...selectedProfileIds.value, profileId]
  }
}

const enrollSelectedEmployees = async () => {
  if (!programId.value) {
    toast.error('Program context is missing')
    return
  }

  if (!selectedProfileIds.value.length) {
    toast.error('Select at least one employee to enroll')
    return
  }

  try {
    await companyProgramsStore.enrollProgramParticipants(programId.value, selectedProfileIds.value)
    selectedProfileIds.value = []
    await loadParticipants()
  } catch {
    // store already handles toast
  }
}

const removeParticipant = async (participantId: string) => {
  if (!confirm('Remove this employee from the program?')) {
    return
  }

  try {
    await companyProgramsStore.removeProgramParticipant(participantId)
    await loadParticipants()
  } catch {
    // store already handles toast
  }
}

watch(companyId, async value => {
  if (!value) {
    companyProgramsStore.clearParticipantsState()
    return
  }

  await refreshWorkspace()
}, { immediate: true })

watch(programId, async () => {
  selectedProfileIds.value = []
  await loadParticipants()
})

watch(employeeSearch, () => {
  if (employeeSearchDebounce.value) {
    clearTimeout(employeeSearchDebounce.value)
  }

  employeeSearchDebounce.value = setTimeout(async () => {
    await loadEmployees()
  }, 350)
})

watch(participantSearch, () => {
  if (participantSearchDebounce.value) {
    clearTimeout(participantSearchDebounce.value)
  }

  participantSearchDebounce.value = setTimeout(async () => {
    await loadParticipants()
  }, 350)
})

watch(participantStatus, async () => {
  await loadParticipants()
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="space-y-1">
        <Button variant="ghost" class="w-fit px-0 text-muted-foreground" @click="router.push('/app/admin/programs')">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back to Company Programs
        </Button>
        <h1 class="text-2xl font-semibold tracking-tight">{{ selectedProgram?.name || 'Program Employees' }}</h1>
        <p class="text-sm text-muted-foreground">
          Manage the employees enrolled in this company program.
        </p>
      </div>

      <div class="flex gap-2">
        <Button variant="outline" @click="refreshWorkspace" :disabled="isLoading || participantsLoading">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading || participantsLoading }" />
          Refresh
        </Button>
        <Button @click="enrollSelectedEmployees" :disabled="participantsSaving || !selectedCount || !programId">
          <UserPlus class="mr-2 h-4 w-4" />
          Enroll {{ selectedCount || '' }}
        </Button>
      </div>
    </div>

    <div v-if="selectedProgram" class="rounded-lg border bg-muted/30 p-4 text-sm">
      <div class="font-medium">{{ selectedProgram.name }}</div>
      <div class="mt-1 text-muted-foreground">
        {{ selectedProgram.objective || selectedProgram.targetAudienceDescription || 'No objective captured yet.' }}
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Employees Loaded</CardDescription>
          <CardTitle class="text-3xl">{{ availableEmployees.length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Roster Size</CardDescription>
          <CardTitle class="text-3xl">{{ participantsPagination.totalItems }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Selected For Enrolment</CardDescription>
          <CardTitle class="text-3xl">{{ selectedCount }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.1fr,1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Available Employees</CardTitle>
          <CardDescription>Select employees from your company and enroll them into this program.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input v-model="employeeSearch" class="pl-9" placeholder="Search employees by name or email" />
          </div>

          <div v-if="profilesLoading" class="space-y-3">
            <Skeleton class="h-14 w-full" />
            <Skeleton class="h-14 w-full" />
            <Skeleton class="h-14 w-full" />
          </div>

          <div v-else-if="!availableEmployees.length" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No employee profiles matched this search.
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="profile in availableEmployees"
              :key="profile.id"
              class="flex items-start gap-3 rounded-lg border p-3"
            >
              <Checkbox
                :checked="selectedProfileIds.includes(profile.id)"
                :disabled="participantProfileIds.has(profile.id)"
                @update:checked="value => toggleSelectedProfile(profile.id, value)"
              />

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="font-medium">{{ employeeName(profile) }}</div>
                  <Badge v-if="participantProfileIds.has(profile.id)" variant="outline">Already enrolled</Badge>
                </div>
                <div class="text-sm text-muted-foreground">{{ employeeSecondary(profile) }}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Roster</CardTitle>
          <CardDescription>Track who is already attached to this company program.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <Alert v-if="participantsError" variant="destructive">
            <AlertDescription>{{ participantsError }}</AlertDescription>
          </Alert>

          <div class="grid gap-3 md:grid-cols-[1fr,180px]">
            <div class="relative">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input v-model="participantSearch" class="pl-9" placeholder="Search enrolled employees" />
            </div>

            <Select v-model="participantStatus">
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="ENROLLED">Enrolled</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="participantsLoading" class="space-y-3">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
          </div>

          <div v-else-if="!participants.length" class="rounded-lg border border-dashed p-8 text-center">
            <Users class="mx-auto h-8 w-8 text-muted-foreground" />
            <p class="mt-3 text-sm text-muted-foreground">
              No employees are enrolled in this program yet.
            </p>
          </div>

          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Consent</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead class="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="participant in participants" :key="participant.id">
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
                  <div class="flex flex-col gap-1">
                    <Badge :variant="consentTone(participant.consentSummary?.programParticipationStatus)">
                      Participation {{ consentLabel(participant.consentSummary?.programParticipationStatus) }}
                    </Badge>
                    <div class="text-xs text-muted-foreground">
                      {{ participant.consentSummary?.grantedCount || 0 }} granted · {{ participant.consentSummary?.pendingCount || 0 }} pending
                    </div>
                  </div>
                </TableCell>
                <TableCell>{{ formatDate(participant.enrolledAt) }}</TableCell>
                <TableCell class="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="removeParticipant(participant.id)"
                    :disabled="participantsSaving"
                  >
                    <Trash2 class="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
