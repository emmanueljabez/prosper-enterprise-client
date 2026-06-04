<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import type {
  CompanyProgramRecord,
  CreateCompanyProgramPayload,
  JourneyTemplateUpdateScope,
  JourneyTemplateRecord,
  ProsperCatalogProgramRecord,
  UpdateCompanyProgramPayload,
} from '@/http/requests/app/companyPrograms'
import { useAppToast } from '@/composables/services/toastService'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { ArrowDown, ArrowUp, Layers3, Plus, Trash2 } from 'lucide-vue-next'

type CatalogStageForm = {
  programId: string
  journeyStageName: string
}

type ProgramFormModel = CreateCompanyProgramPayload & UpdateCompanyProgramPayload & {
  journeyTemplateUpdateScope?: JourneyTemplateUpdateScope | null
}

const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit'
  program?: CompanyProgramRecord | null
  journeyTemplates: JourneyTemplateRecord[]
  catalogPrograms: ProsperCatalogProgramRecord[]
  isSaving?: boolean
  submitLabel?: string
  cancelLabel?: string
  showCancel?: boolean
}>(), {
  mode: 'create',
  program: null,
  isSaving: false,
  submitLabel: 'Save company program',
  cancelLabel: 'Cancel',
  showCancel: true,
})

const emit = defineEmits<{
  submit: [payload: CreateCompanyProgramPayload | UpdateCompanyProgramPayload]
  cancel: []
}>()

const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()

const programForm = reactive<ProgramFormModel>({
  name: '',
  objective: '',
  targetAudienceDescription: '',
  matchingMode: 'ADMIN_ASSIGN',
  employeeSelectionWindowHours: 48,
  employeeSelectionShortlistSize: 5,
  requiresMentorForSessionSteps: true,
  journeyTemplateUpdateScope: 'FUTURE_ENROLLMENTS_ONLY',
  maxParticipants: null,
  startsAt: '',
  endsAt: '',
})
const programJourneyTemplateSelection = ref('NONE')
const catalogStages = ref<CatalogStageForm[]>([])

const createEmptyCatalogStage = (): CatalogStageForm => ({
  programId: '',
  journeyStageName: '',
})

const resetForm = () => {
  programForm.name = ''
  programForm.objective = ''
  programForm.targetAudienceDescription = ''
  programForm.matchingMode = 'ADMIN_ASSIGN'
  programForm.employeeSelectionWindowHours = 48
  programForm.employeeSelectionShortlistSize = 5
  programForm.requiresMentorForSessionSteps = true
  programForm.journeyTemplateUpdateScope = 'FUTURE_ENROLLMENTS_ONLY'
  programForm.maxParticipants = null
  programForm.startsAt = ''
  programForm.endsAt = ''
  programJourneyTemplateSelection.value = 'NONE'
  catalogStages.value = [createEmptyCatalogStage()]
}

const populateForm = (program?: CompanyProgramRecord | null) => {
  if (!program) {
    resetForm()
    return
  }

  programForm.name = program.name || ''
  programForm.objective = program.objective || ''
  programForm.targetAudienceDescription = program.targetAudienceDescription || ''
  programForm.matchingMode = program.matchingMode || 'ADMIN_ASSIGN'
  programForm.employeeSelectionWindowHours = program.employeeSelectionWindowHours ?? 48
  programForm.employeeSelectionShortlistSize = program.employeeSelectionShortlistSize ?? 5
  programForm.requiresMentorForSessionSteps = program.requiresMentorForSessionSteps !== false
  programForm.journeyTemplateUpdateScope = 'FUTURE_ENROLLMENTS_ONLY'
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
}

watch(() => props.program, program => {
  populateForm(program)
}, { immediate: true })

watch(() => props.mode, mode => {
  if (mode === 'create' && !props.program) {
    resetForm()
  }
})

const selectedCatalogPrograms = computed(() =>
  catalogStages.value
    .map(stage => props.catalogPrograms.find(program => program.id === stage.programId))
    .filter((program): program is ProsperCatalogProgramRecord => Boolean(program)),
)

const selectedJourneyTemplate = computed(() =>
  props.journeyTemplates.find(template => template.id === programJourneyTemplateSelection.value) || null,
)

const journeyTemplateChanged = computed(() =>
  props.mode === 'edit'
  && !!props.program
  && (props.program?.journeyTemplateId || 'NONE') !== (programJourneyTemplateSelection.value || 'NONE'),
)

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

const submitForm = () => {
  const catalogStagePayload = buildCatalogStagesPayload()
  if (!catalogStagePayload.length) {
    toast.error('Select at least one Prosper program for this company journey')
    return
  }

  emit('submit', {
    ...programForm,
    catalogStages: catalogStagePayload,
    journeyTemplateId: programJourneyTemplateSelection.value !== 'NONE' ? programJourneyTemplateSelection.value : null,
    journeyTemplateUpdateScope: journeyTemplateChanged.value
      ? (programForm.journeyTemplateUpdateScope || 'FUTURE_ENROLLMENTS_ONLY')
      : null,
    employeeSelectionWindowHours: programForm.employeeSelectionWindowHours
      ? Number(programForm.employeeSelectionWindowHours)
      : null,
    employeeSelectionShortlistSize: programForm.employeeSelectionShortlistSize
      ? Number(programForm.employeeSelectionShortlistSize)
      : null,
    requiresMentorForSessionSteps: programForm.requiresMentorForSessionSteps !== false,
    maxParticipants: programForm.maxParticipants ? Number(programForm.maxParticipants) : null,
    startsAt: programForm.startsAt || null,
    endsAt: programForm.endsAt || null,
  })
}

const openJourneyTemplates = () => {
  navigateTo('/app/admin/journey-templates')
}
</script>

<template>
  <form class="grid gap-4 py-2" @submit.prevent="submitForm">
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
                    v-for="catalogProgram in props.catalogPrograms"
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
        <div v-if="selectedCatalogPrograms.length" class="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <div
            v-for="program in selectedCatalogPrograms"
            :key="program.id"
            class="inline-flex items-center gap-1 rounded-full border px-2 py-1"
          >
            <Layers3 class="h-3.5 w-3.5" />
            <span>{{ program.name }}</span>
            <span>· {{ companyProgramsStore.catalogMentorCount(program) }} mentors</span>
          </div>
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
        <label class="text-sm font-medium">Selection window (hours)</label>
        <Input
          v-model="programForm.employeeSelectionWindowHours"
          type="number"
          min="1"
          max="168"
          placeholder="48"
        />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Shortlist size</label>
        <Input
          v-model="programForm.employeeSelectionShortlistSize"
          type="number"
          min="1"
          max="20"
          placeholder="5"
        />
      </div>

      <div class="grid gap-2">
        <div class="flex items-center justify-between gap-3">
          <label class="text-sm font-medium">Journey template</label>
          <Button type="button" variant="ghost" size="sm" @click="openJourneyTemplates">
            Manage templates
          </Button>
        </div>
        <Select v-model="programJourneyTemplateSelection">
          <SelectTrigger>
            <SelectValue placeholder="Attach a guided journey" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">No guided journey yet</SelectItem>
            <SelectItem
              v-for="template in props.journeyTemplates"
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

    <div class="rounded-lg border p-4">
      <div class="flex items-start gap-3">
        <Checkbox
          :checked="programForm.requiresMentorForSessionSteps !== false"
          @update:checked="value => programForm.requiresMentorForSessionSteps = value === true"
        />
        <div>
          <div class="text-sm font-medium">Block session milestones until mentor assignment</div>
          <p class="text-xs text-muted-foreground">
            When enabled, journey SESSION milestones remain blocked until this participant has an assigned mentor.
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="selectedJourneyTemplate"
      class="rounded-lg border bg-muted/20 p-4 text-sm"
    >
      <div class="font-medium">{{ selectedJourneyTemplate.name }}</div>
      <div class="mt-1 text-muted-foreground">{{ selectedJourneyTemplate.description }}</div>
      <div class="mt-3 text-xs text-muted-foreground">
        {{ selectedJourneyTemplate.stepCount || 0 }} milestones
      </div>
    </div>

    <div
      v-if="journeyTemplateChanged && props.mode === 'edit'"
      class="grid gap-2 rounded-lg border bg-muted/20 p-4"
    >
      <label class="text-sm font-medium">Template update scope</label>
      <Select v-model="programForm.journeyTemplateUpdateScope">
        <SelectTrigger>
          <SelectValue placeholder="Choose how to apply this template change" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="FUTURE_ENROLLMENTS_ONLY">Future enrollments only</SelectItem>
          <SelectItem value="MIGRATE_NOT_STARTED_PARTICIPANTS">Also migrate not-started participants</SelectItem>
        </SelectContent>
      </Select>
      <p class="text-xs text-muted-foreground">
        Participants with completed milestones are retained on their current template to preserve history.
      </p>
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

    <div class="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
      <Button
        v-if="showCancel"
        type="button"
        variant="outline"
        @click="emit('cancel')"
        :disabled="isSaving"
      >
        {{ cancelLabel }}
      </Button>
      <Button type="submit" :disabled="isSaving || !programForm.name.trim()">
        <Plus class="mr-2 h-4 w-4" />
        {{ submitLabel }}
      </Button>
    </div>
  </form>
</template>
