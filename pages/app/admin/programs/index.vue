<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import type {
  CompanyProgramRecord,
  CompanyProgramStatus,
  CreateCompanyProgramPayload,
  UpdateCompanyProgramPayload,
} from '@/http/requests/app/companyPrograms'
import { useAppToast } from '@/composables/services/toastService'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Textarea } from '~/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Skeleton } from '~/components/ui/skeleton'
import { ArrowDown, ArrowUp, CalendarRange, Layers3, PauseCircle, Pencil, PlayCircle, Plus, RefreshCw, Search, StopCircle, Target, Trash2, Trophy } from 'lucide-vue-next'

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

type CatalogStageForm = {
  programId: string
  journeyStageName: string
}

const showProgramDialog = ref(false)
const showJourneyDialog = ref(false)
const journeyProgramId = ref('')
const journeyTemplateSelection = ref('NONE')
const editingProgramId = ref<string | null>(null)
const programJourneyTemplateSelection = ref('NONE')
const filters = reactive({
  search: '',
  status: 'ALL' as CompanyProgramStatus | 'ALL',
})

const programForm = reactive<CreateCompanyProgramPayload & UpdateCompanyProgramPayload>({
  name: '',
  objective: '',
  targetAudienceDescription: '',
  matchingMode: 'ADMIN_ASSIGN',
  maxParticipants: null,
  startsAt: '',
  endsAt: '',
})
const catalogStages = ref<CatalogStageForm[]>([
  {
    programId: '',
    journeyStageName: '',
  },
])

const isEditingProgram = computed(() => Boolean(editingProgramId.value))

const selectedJourneyProgram = computed(() =>
  companyProgramsStore.programs.find(program => program.id === journeyProgramId.value) || null,
)

const selectedCatalogPrograms = computed(() =>
  catalogStages.value
    .map(stage => companyProgramsStore.catalogPrograms.find(program => program.id === stage.programId))
    .filter((program): program is NonNullable<typeof program> => Boolean(program)),
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

const createEmptyCatalogStage = (): CatalogStageForm => ({
  programId: '',
  journeyStageName: '',
})

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

const resetProgramForm = () => {
  editingProgramId.value = null
  programForm.name = ''
  programForm.objective = ''
  programForm.targetAudienceDescription = ''
  programForm.matchingMode = 'ADMIN_ASSIGN'
  programForm.maxParticipants = null
  programForm.startsAt = ''
  programForm.endsAt = ''
  programJourneyTemplateSelection.value = 'NONE'
  catalogStages.value = [createEmptyCatalogStage()]
}

const openCreateDialog = () => {
  resetProgramForm()
  showProgramDialog.value = true
}

const openEditDialog = (program: CompanyProgramRecord) => {
  editingProgramId.value = program.id
  programForm.name = program.name || ''
  programForm.objective = program.objective || ''
  programForm.targetAudienceDescription = program.targetAudienceDescription || ''
  programForm.matchingMode = program.matchingMode || 'ADMIN_ASSIGN'
  programForm.maxParticipants = program.maxParticipants ?? null
  programForm.startsAt = program.startsAt ? new Date(program.startsAt).toISOString().slice(0, 16) : ''
  programForm.endsAt = program.endsAt ? new Date(program.endsAt).toISOString().slice(0, 16) : ''
  programJourneyTemplateSelection.value = program.journeyTemplateId || 'NONE'
  catalogStages.value = (program.catalogStages?.length
    ? program.catalogStages
        .slice()
        .sort((left, right) => (left.journeyOrder || 0) - (right.journeyOrder || 0))
        .map(stage => ({
          programId: stage.programId,
          journeyStageName: stage.journeyStageName || '',
        }))
    : program.templateProgramId
      ? [{ programId: program.templateProgramId, journeyStageName: '' }]
      : [createEmptyCatalogStage()])
  showProgramDialog.value = true
}

const addCatalogStage = () => {
  catalogStages.value = [...catalogStages.value, createEmptyCatalogStage()]
}

const removeCatalogStage = (index: number) => {
  if (catalogStages.value.length === 1) {
    catalogStages.value = [createEmptyCatalogStage()]
    return
  }

  catalogStages.value = catalogStages.value.filter((_, stageIndex) => stageIndex !== index)
}

const moveCatalogStage = (index: number, direction: -1 | 1) => {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= catalogStages.value.length) {
    return
  }

  const nextStages = [...catalogStages.value]
  const [moved] = nextStages.splice(index, 1)
  nextStages.splice(nextIndex, 0, moved)
  catalogStages.value = nextStages
}

const updateCatalogStageProgram = (index: number, programId: string) => {
  const nextStages = [...catalogStages.value]
  nextStages[index] = {
    ...nextStages[index],
    programId: programId === 'NONE' ? '' : programId,
  }
  catalogStages.value = nextStages
}

const buildCatalogStagesPayload = () =>
  catalogStages.value
    .map(stage => ({
      programId: stage.programId,
      journeyStageName: stage.journeyStageName?.trim() || null,
      stageType: 'CORE' as const,
    }))
    .filter(stage => Boolean(stage.programId))

const saveProgram = async () => {
  if (!companyId.value) {
    toast.error('Company context is missing')
    return
  }

  const catalogStagePayload = buildCatalogStagesPayload()
  if (!catalogStagePayload.length) {
    toast.error('Select at least one Prosper program for this company journey')
    return
  }

  const payload = {
    ...programForm,
    catalogStages: catalogStagePayload,
    journeyTemplateId: programJourneyTemplateSelection.value !== 'NONE' ? programJourneyTemplateSelection.value : null,
    maxParticipants: programForm.maxParticipants ? Number(programForm.maxParticipants) : null,
    startsAt: programForm.startsAt || null,
    endsAt: programForm.endsAt || null,
  }

  try {
    if (editingProgramId.value) {
      await companyProgramsStore.updateCompanyProgram(editingProgramId.value, payload)
    } else {
      await companyProgramsStore.createCompanyProgram(companyId.value, payload)
    }
    await loadPrograms()
    showProgramDialog.value = false
    resetProgramForm()
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
        <Button @click="openCreateDialog">
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
          <DialogTitle>{{ isEditingProgram ? 'Edit company program' : 'Create company program' }}</DialogTitle>
          <DialogDescription>
            Build an employer-facing journey from one or more Prosper programs, then attach matching and guidance.
          </DialogDescription>
        </DialogHeader>

        <form class="grid gap-4 py-2" @submit.prevent="saveProgram">
          <div class="grid gap-2">
            <label class="text-sm font-medium">Program name</label>
            <Input v-model="programForm.name" placeholder="Onboarding Mentorship Cohort" />
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Objective</label>
            <Textarea v-model="programForm.objective" placeholder="What business problem should this program solve?" />
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Target audience</label>
            <Textarea v-model="programForm.targetAudienceDescription" placeholder="Who should participate in this cohort?" />
          </div>

          <div class="grid gap-3">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium">Prosper program journey</label>
                <p class="text-xs text-muted-foreground">Order one or more Prosper programs to form this company journey.</p>
              </div>
              <Button type="button" variant="outline" size="sm" @click="addCatalogStage">
                <Plus class="mr-2 h-4 w-4" />
                Add stage
              </Button>
            </div>

            <div class="space-y-3">
              <div
                v-for="(stage, index) in catalogStages"
                :key="`catalog-stage-${index}`"
                class="rounded-lg border p-4"
              >
                <div class="mb-3 flex items-center justify-between">
                  <div class="text-sm font-medium">Stage {{ index + 1 }}</div>
                  <div class="flex gap-2">
                    <Button type="button" size="icon" variant="ghost" @click="moveCatalogStage(index, -1)" :disabled="index === 0">
                      <ArrowUp class="h-4 w-4" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" @click="moveCatalogStage(index, 1)" :disabled="index === catalogStages.length - 1">
                      <ArrowDown class="h-4 w-4" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" @click="removeCatalogStage(index)">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div class="grid gap-3 md:grid-cols-[minmax(0,1fr),220px]">
                  <div class="grid gap-2">
                    <label class="text-sm font-medium">Prosper program</label>
                    <Select :model-value="stage.programId || 'NONE'" @update:model-value="value => updateCatalogStageProgram(index, value)">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Prosper program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Select a Prosper program</SelectItem>
                        <SelectItem
                          v-for="catalogProgram in companyProgramsStore.catalogPrograms"
                          :key="catalogProgram.id"
                          :value="catalogProgram.id"
                        >
                          {{ catalogProgram.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div class="grid gap-2">
                    <label class="text-sm font-medium">Stage label</label>
                    <Input v-model="stage.journeyStageName" placeholder="Optional stage label" />
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-lg border bg-muted/20 p-4 text-sm">
              <div class="font-medium">Journey preview</div>
              <div class="mt-1 text-muted-foreground">
                {{ companyProgramsStore.catalogJourneyLabel(
                  selectedCatalogPrograms.map((program, index) => ({
                    programId: program.id,
                    programName: program.name,
                    journeyOrder: index + 1,
                  })),
                  'No Prosper program selected yet',
                ) }}
              </div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="grid gap-2">
              <label class="text-sm font-medium">Matching mode</label>
              <Select v-model="programForm.matchingMode">
                <SelectTrigger>
                  <SelectValue placeholder="Select matching mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN_ASSIGN">Admin assign</SelectItem>
                  <SelectItem value="EMPLOYEE_SELECT">Employee select</SelectItem>
                  <SelectItem value="SYSTEM_ASSIGN">System assign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="grid gap-2">
              <label class="text-sm font-medium">Journey template</label>
              <Select v-model="programJourneyTemplateSelection">
                <SelectTrigger>
                  <SelectValue placeholder="Attach a guided journey" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">No guided journey yet</SelectItem>
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

            <div class="grid gap-2">
              <label class="text-sm font-medium">Max participants</label>
              <Input v-model="programForm.maxParticipants" type="number" min="1" placeholder="Optional capacity" />
            </div>
          </div>

          <div
            v-if="companyProgramsStore.journeyTemplates.find(template => template.id === programJourneyTemplateSelection)"
            class="rounded-lg border bg-muted/20 p-4 text-sm"
          >
            <div class="font-medium">
              {{ companyProgramsStore.journeyTemplates.find(template => template.id === programJourneyTemplateSelection)?.name }}
            </div>
            <div class="mt-1 text-muted-foreground">
              {{ companyProgramsStore.journeyTemplates.find(template => template.id === programJourneyTemplateSelection)?.description }}
            </div>
            <div class="mt-3 text-xs text-muted-foreground">
              {{ companyProgramsStore.journeyTemplates.find(template => template.id === programJourneyTemplateSelection)?.stepCount || 0 }} milestones
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="grid gap-2">
              <label class="text-sm font-medium">Start date</label>
              <Input v-model="programForm.startsAt" type="datetime-local" />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">End date</label>
              <Input v-model="programForm.endsAt" type="datetime-local" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showProgramDialog = false" :disabled="companyProgramsStore.isSaving">
              Cancel
            </Button>
            <Button type="submit" :disabled="companyProgramsStore.isSaving || !programForm.name.trim()">
              <Plus class="mr-2 h-4 w-4" />
              {{ isEditingProgram ? 'Save changes' : 'Create company program' }}
            </Button>
          </DialogFooter>
        </form>
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
