<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import type {
  CompanyProgramRecord,
  CompanyProgramStatus,
  UpdateCompanyProgramPayload,
} from '@/http/requests/app/companyPrograms'
import { useAppToast } from '@/composables/services/toastService'
import CompanyProgramEditor from '@/components/app/admin/CompanyProgramEditor.vue'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Skeleton } from '~/components/ui/skeleton'
import { CalendarRange, Layers3, PauseCircle, Pencil, PlayCircle, Plus, RefreshCw, Search, StopCircle, Target, Trophy, Users } from 'lucide-vue-next'

definePageMeta({
  title: 'Company Programs',
  description: 'Create and manage corporate mentorship programs',
  requiresAuth: true,
  permissions: ['admin:programs'],
})

const authStore = useAuthStore()
const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()

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

const showProgramDialog = ref(false)
const showJourneyDialog = ref(false)
const journeyProgramId = ref('')
const journeyTemplateSelection = ref('NONE')
const editingProgram = ref<CompanyProgramRecord | null>(null)
const filters = reactive({
  search: '',
  status: 'ALL' as CompanyProgramStatus | 'ALL',
})

const selectedJourneyProgram = computed(() =>
  companyProgramsStore.programs.find(program => program.id === journeyProgramId.value) || null,
)

const statusTone = (status: CompanyProgramStatus) => ({
  DRAFT: 'secondary',
  LIVE: 'default',
  PAUSED: 'outline',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
  ARCHIVED: 'outline',
}[status] as 'default' | 'secondary' | 'outline' | 'destructive')

const statusLabel = (status: CompanyProgramStatus) => status.replace('_', ' ')

const canLaunch = (status: CompanyProgramStatus) => ['DRAFT', 'PAUSED'].includes(status)
const canPause = (status: CompanyProgramStatus) => status === 'LIVE'
const canComplete = (status: CompanyProgramStatus) => ['LIVE', 'PAUSED'].includes(status)
const canCancel = (status: CompanyProgramStatus) => ['DRAFT', 'LIVE', 'PAUSED'].includes(status)

const formatDateRange = (startsAt?: string | null, endsAt?: string | null) => {
  if (!startsAt && !endsAt) return 'Flexible dates'

  const format = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'

  return `${format(startsAt)} - ${format(endsAt)}`
}

const loadPrograms = async () => {
  if (!companyId.value) return

  try {
    await Promise.all([
      companyProgramsStore.loadCompanyPrograms({
        companyId: companyId.value,
        page: 0,
        size: 20,
        search: filters.search,
        status: filters.status,
      }),
      companyProgramsStore.loadJourneyTemplates(),
      companyProgramsStore.loadCatalogPrograms(),
    ])
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load company programs')
  }
}

const openEditDialog = (program: CompanyProgramRecord) => {
  editingProgram.value = program
  showProgramDialog.value = true
}

const closeProgramDialog = () => {
  showProgramDialog.value = false
  editingProgram.value = null
}

const saveProgram = async (payload: UpdateCompanyProgramPayload) => {
  if (!companyId.value) {
    toast.error('Company context is missing')
    return
  }

  try {
    if (!editingProgram.value?.id) {
      toast.error('Select a program to edit first')
      return
    }

    await companyProgramsStore.updateCompanyProgram(editingProgram.value.id, payload)
    await loadPrograms()
    closeProgramDialog()
  } catch {
    // store already handles the toast
  }
}

const openJourneyDialog = (programId: string, journeyTemplateId?: string | null) => {
  journeyProgramId.value = programId
  journeyTemplateSelection.value = journeyTemplateId || 'NONE'
  showJourneyDialog.value = true
}

const saveJourneyTemplate = async () => {
  if (!journeyProgramId.value || journeyTemplateSelection.value === 'NONE') {
    toast.error('Select a journey template first')
    return
  }

  try {
    await companyProgramsStore.updateCompanyProgram(journeyProgramId.value, {
      journeyTemplateId: journeyTemplateSelection.value,
    })
    showJourneyDialog.value = false
    journeyProgramId.value = ''
  } catch {
    // store already handles toast
  }
}

const runStatusAction = async (companyProgramId: string, action: 'launch' | 'pause' | 'complete' | 'cancel') => {
  try {
    await companyProgramsStore.updateCompanyProgramStatus(companyProgramId, action)
  } catch {
    // store already handles the toast
  }
}

watch(() => companyId.value, value => {
  if (value) {
    loadPrograms()
  }
}, { immediate: true })

watch(() => showProgramDialog.value, isOpen => {
  if (!isOpen) {
    editingProgram.value = null
  }
})

onMounted(() => {
  if (companyId.value) {
    loadPrograms()
  }
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Company Programs</h1>
        <p class="text-sm text-muted-foreground">
          Launch mentorship programs for your company and control their lifecycle from one workspace.
        </p>
      </div>

      <div class="flex gap-2">
        <Button variant="outline" @click="loadPrograms" :disabled="companyProgramsStore.isLoading">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': companyProgramsStore.isLoading }" />
          Refresh
        </Button>
        <Button @click="navigateTo('/app/admin/programs/new')">
          <Plus class="mr-2 h-4 w-4" />
          New Company Program
        </Button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Total Programs</CardDescription>
          <CardTitle class="text-3xl">{{ companyProgramsStore.pagination.totalItems }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Live Programs</CardDescription>
          <CardTitle class="text-3xl">{{ companyProgramsStore.programs.filter(program => program.status === 'LIVE').length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Draft Programs</CardDescription>
          <CardTitle class="text-3xl">{{ companyProgramsStore.programs.filter(program => program.status === 'DRAFT').length }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Program Workspace</CardTitle>
        <CardDescription>Search current programs and move them through their lifecycle.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Alert v-if="!companyId">
          <AlertDescription>Company context is missing for this account. Refresh your profile or sign in again.</AlertDescription>
        </Alert>

        <Alert v-else-if="companyProgramsStore.error" variant="destructive">
          <AlertDescription>{{ companyProgramsStore.error }}</AlertDescription>
        </Alert>

        <div class="grid gap-3 md:grid-cols-[1fr,220px]">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model="filters.search"
              class="pl-9"
              placeholder="Search by program name or objective"
              @keyup.enter="loadPrograms"
            />
          </div>

          <Select v-model="filters.status" @update:model-value="loadPrograms">
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="LIVE">Live</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="companyProgramsStore.isLoading" class="space-y-3">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>

        <div v-else-if="!companyProgramsStore.programs.length" class="rounded-lg border border-dashed p-8 text-center">
          <h3 class="text-lg font-medium">No programs yet</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Create your first company program to start structuring mentorship beyond one-off bookings.
          </p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Program</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Matching</TableHead>
              <TableHead>Journey</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="program in companyProgramsStore.programs" :key="program.id">
              <TableCell>
                <div class="space-y-1">
                  <div class="font-medium">{{ program.name }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ program.objective || program.targetAudienceDescription || 'No objective added yet' }}
                  </div>
                  <div class="flex items-center gap-2 text-xs text-muted-foreground">
                    <Layers3 class="h-3.5 w-3.5" />
                    <span>{{ companyProgramsStore.catalogJourneyLabel(program.catalogStages, program.catalogJourneySummary) }}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="statusTone(program.status)">
                  {{ statusLabel(program.status) }}
                </Badge>
              </TableCell>
              <TableCell>{{ companyProgramsStore.matchingModeLabel(program.matchingMode) }}</TableCell>
              <TableCell>
                <div class="space-y-1">
                  <div class="font-medium">{{ program.journeyTemplateName || 'Not attached' }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ program.journeyTemplateName ? 'Guided milestones enabled' : 'Attach a journey template to structure the program' }}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarRange class="h-4 w-4" />
                  <span>{{ formatDateRange(program.startsAt, program.endsAt) }}</span>
                </div>
              </TableCell>
              <TableCell>{{ program.maxParticipants || 'Open' }}</TableCell>
              <TableCell>
                <div class="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    @click="navigateTo(`/app/admin/programs/${program.id}/employees`)"
                  >
                    <Users class="mr-2 h-4 w-4" />
                    Employees
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    @click="openEditDialog(program)"
                    :disabled="companyProgramsStore.isSaving"
                  >
                    <Pencil class="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    @click="openJourneyDialog(program.id, program.journeyTemplateId)"
                    :disabled="companyProgramsStore.isSaving || !companyProgramsStore.journeyTemplates.length"
                  >
                    <Target class="mr-2 h-4 w-4" />
                    Journey
                  </Button>
                  <Button
                    v-if="canLaunch(program.status)"
                    size="sm"
                    variant="outline"
                    @click="runStatusAction(program.id, 'launch')"
                    :disabled="companyProgramsStore.isSaving"
                  >
                    <PlayCircle class="mr-2 h-4 w-4" />
                    Launch
                  </Button>
                  <Button
                    v-if="canPause(program.status)"
                    size="sm"
                    variant="outline"
                    @click="runStatusAction(program.id, 'pause')"
                    :disabled="companyProgramsStore.isSaving"
                  >
                    <PauseCircle class="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                  <Button
                    v-if="canComplete(program.status)"
                    size="sm"
                    variant="outline"
                    @click="runStatusAction(program.id, 'complete')"
                    :disabled="companyProgramsStore.isSaving"
                  >
                    <Trophy class="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                  <Button
                    v-if="canCancel(program.status)"
                    size="sm"
                    variant="destructive"
                    @click="runStatusAction(program.id, 'cancel')"
                    :disabled="companyProgramsStore.isSaving"
                  >
                    <StopCircle class="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog v-model:open="showProgramDialog">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit company program</DialogTitle>
          <DialogDescription>
            Build an employer-facing journey from one or more Prosper programs, then attach matching and guidance.
          </DialogDescription>
        </DialogHeader>

        <CompanyProgramEditor
          mode="edit"
          :program="editingProgram"
          :catalog-programs="companyProgramsStore.catalogPrograms"
          :journey-templates="companyProgramsStore.journeyTemplates"
          :is-saving="companyProgramsStore.isSaving"
          submit-label="Save changes"
          @submit="saveProgram"
          @cancel="closeProgramDialog"
        />
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="showJourneyDialog">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Attach journey template</DialogTitle>
          <DialogDescription>
            Choose the guided journey this program should run. New employee enrollments get a live milestone plan automatically.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <div v-if="selectedJourneyProgram" class="rounded-lg border bg-muted/20 p-4">
            <div class="font-medium">{{ selectedJourneyProgram.name }}</div>
            <div class="mt-1 text-sm text-muted-foreground">
              {{ selectedJourneyProgram.objective || selectedJourneyProgram.targetAudienceDescription || 'No objective added yet' }}
            </div>
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Journey template</label>
            <Select v-model="journeyTemplateSelection">
              <SelectTrigger>
                <SelectValue placeholder="Select a journey template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="template in companyProgramsStore.journeyTemplates"
                  :key="template.id"
                  :value="template.id"
                >
                  {{ template.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div
            v-if="companyProgramsStore.journeyTemplates.find(template => template.id === journeyTemplateSelection)"
            class="rounded-lg border p-4 text-sm"
          >
            <div class="font-medium">
              {{ companyProgramsStore.journeyTemplates.find(template => template.id === journeyTemplateSelection)?.name }}
            </div>
            <div class="mt-1 text-muted-foreground">
              {{ companyProgramsStore.journeyTemplates.find(template => template.id === journeyTemplateSelection)?.description }}
            </div>
            <div class="mt-3 text-xs text-muted-foreground">
              {{ companyProgramsStore.journeyTemplates.find(template => template.id === journeyTemplateSelection)?.stepCount || 0 }} milestones ·
              {{ companyProgramsStore.journeyTemplates.find(template => template.id === journeyTemplateSelection)?.defaultDurationWeeks || 'Flexible' }} week default
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="showJourneyDialog = false" :disabled="companyProgramsStore.isSaving">
            Cancel
          </Button>
          <Button type="button" @click="saveJourneyTemplate" :disabled="companyProgramsStore.isSaving || journeyTemplateSelection === 'NONE'">
            <Target class="mr-2 h-4 w-4" />
            Save journey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
