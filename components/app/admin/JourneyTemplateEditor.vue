<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import type {
  JourneyDependencyType,
  JourneyStepType,
  JourneyTemplateRecord,
  JourneyTemplateUpsertPayload,
} from '@/http/requests/app/companyPrograms'
import { useAppToast } from '@/composables/services/toastService'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { Textarea } from '~/components/ui/textarea'
import { ArrowDown, ArrowUp, GitBranch, Plus, Trash2 } from 'lucide-vue-next'

type StepForm = {
  stepKey: string
  title: string
  description: string
  stepType: JourneyStepType
  required: boolean
  defaultDueOffsetDays: string | number | null
}

type DependencyForm = {
  fromStepKey: string
  toStepKey: string
  dependencyType: JourneyDependencyType
}

const props = withDefaults(defineProps<{
  template?: JourneyTemplateRecord | null
  isSaving?: boolean
  submitLabel?: string
  cancelLabel?: string
  showCancel?: boolean
}>(), {
  template: null,
  isSaving: false,
  submitLabel: 'Save template',
  cancelLabel: 'Cancel',
  showCancel: true,
})

const emit = defineEmits<{
  submit: [payload: JourneyTemplateUpsertPayload]
  cancel: []
}>()

const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()

const form = reactive({
  name: '',
  programType: '',
  description: '',
  defaultDurationWeeks: '',
  active: true,
})

const steps = ref<StepForm[]>([])
const dependencies = ref<DependencyForm[]>([])

const stepTypeOptions: JourneyStepType[] = ['SESSION', 'CHECK_IN', 'ACTION_ITEM', 'SURVEY', 'REFLECTION']
const dependencyTypeOptions: JourneyDependencyType[] = ['FINISH_TO_START', 'OPTIONAL_GATE']

const createEmptyStep = (index = 1): StepForm => ({
  stepKey: `step_${index}`,
  title: '',
  description: '',
  stepType: 'SESSION',
  required: true,
  defaultDueOffsetDays: '',
})

const createEmptyDependency = (): DependencyForm => ({
  fromStepKey: '',
  toStepKey: '',
  dependencyType: 'FINISH_TO_START',
})

const resetForm = () => {
  form.name = ''
  form.programType = ''
  form.description = ''
  form.defaultDurationWeeks = ''
  form.active = true
  steps.value = [createEmptyStep(1)]
  dependencies.value = []
}

const populateForm = (template?: JourneyTemplateRecord | null) => {
  if (!template) {
    resetForm()
    return
  }

  form.name = template.name || ''
  form.programType = template.programType || ''
  form.description = template.description || ''
  form.defaultDurationWeeks = template.defaultDurationWeeks != null ? String(template.defaultDurationWeeks) : ''
  form.active = template.active !== false

  steps.value = (template.steps?.length
    ? template.steps
        .slice()
        .sort((left, right) => Number(left.defaultSequence || 0) - Number(right.defaultSequence || 0))
        .map((step, index) => ({
          stepKey: step.stepKey || `step_${index + 1}`,
          title: step.title || '',
          description: step.description || '',
          stepType: step.stepType,
          required: step.required !== false,
          defaultDueOffsetDays: step.defaultDueOffsetDays != null ? String(step.defaultDueOffsetDays) : '',
        }))
    : [createEmptyStep(1)])

  dependencies.value = (template.dependencies?.length
    ? template.dependencies.map(dependency => ({
        fromStepKey: dependency.fromStepKey,
        toStepKey: dependency.toStepKey,
        dependencyType: dependency.dependencyType,
      }))
    : [])
}

watch(() => props.template, template => {
  populateForm(template)
}, { immediate: true })

const availableStepOptions = computed(() =>
  steps.value.map((step, index) => ({
    key: step.stepKey.trim(),
    label: step.title.trim() || `Step ${index + 1}`,
  })).filter(step => Boolean(step.key)),
)

const addStep = () => {
  steps.value = [...steps.value, createEmptyStep(steps.value.length + 1)]
}

const removeStep = (index: number) => {
  const removedKey = steps.value[index]?.stepKey
  if (steps.value.length === 1) {
    steps.value = [createEmptyStep(1)]
    dependencies.value = []
    return
  }

  steps.value = steps.value.filter((_, stepIndex) => stepIndex !== index)
  if (removedKey) {
    dependencies.value = dependencies.value.filter(dependency =>
      dependency.fromStepKey !== removedKey && dependency.toStepKey !== removedKey,
    )
  }
}

const moveStep = (index: number, direction: -1 | 1) => {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= steps.value.length) {
    return
  }

  const nextSteps = [...steps.value]
  const [moved] = nextSteps.splice(index, 1)
  nextSteps.splice(nextIndex, 0, moved)
  steps.value = nextSteps
}

const addDependency = () => {
  dependencies.value = [...dependencies.value, createEmptyDependency()]
}

const removeDependency = (index: number) => {
  dependencies.value = dependencies.value.filter((_, dependencyIndex) => dependencyIndex !== index)
}

const applyLinearDependencies = () => {
  if (steps.value.length <= 1) {
    dependencies.value = []
    return
  }

  dependencies.value = steps.value.slice(0, -1).map((step, index) => ({
    fromStepKey: step.stepKey,
    toStepKey: steps.value[index + 1].stepKey,
    dependencyType: 'FINISH_TO_START',
  }))
}

const optionalNumber = (value: string | number | null | undefined) => {
  const trimmedValue = String(value ?? '').trim()
  return trimmedValue ? Number(trimmedValue) : null
}

const submitForm = () => {
  const trimmedSteps = steps.value.map(step => ({
    stepKey: step.stepKey.trim(),
    title: step.title.trim(),
    description: step.description.trim() || null,
    stepType: step.stepType,
    required: step.required,
    defaultDueOffsetDays: optionalNumber(step.defaultDueOffsetDays),
  }))

  if (!form.name.trim()) {
    toast.error('Template name is required')
    return
  }

  if (!trimmedSteps.length || trimmedSteps.some(step => !step.stepKey || !step.title)) {
    toast.error('Every journey step needs both a step key and a title')
    return
  }

  const stepKeySet = new Set(trimmedSteps.map(step => step.stepKey))
  if (stepKeySet.size !== trimmedSteps.length) {
    toast.error('Step keys must be unique within a journey template')
    return
  }

  const trimmedDependencies = dependencies.value
    .map(dependency => ({
      fromStepKey: dependency.fromStepKey.trim(),
      toStepKey: dependency.toStepKey.trim(),
      dependencyType: dependency.dependencyType,
    }))
    .filter(dependency => dependency.fromStepKey && dependency.toStepKey)

  const invalidDependency = trimmedDependencies.find(dependency =>
    dependency.fromStepKey === dependency.toStepKey
    || !stepKeySet.has(dependency.fromStepKey)
    || !stepKeySet.has(dependency.toStepKey),
  )

  if (invalidDependency) {
    toast.error('Each dependency must link two different valid steps')
    return
  }

  emit('submit', {
    name: form.name.trim(),
    programType: form.programType.trim() || null,
    description: form.description.trim() || null,
    defaultDurationWeeks: optionalNumber(form.defaultDurationWeeks),
    active: form.active,
    steps: trimmedSteps.map(step => ({
      ...step,
      defaultDueOffsetDays: step.defaultDueOffsetDays,
    })),
    dependencies: trimmedDependencies,
  })
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submitForm">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="grid gap-2">
        <label class="text-sm font-medium">Template name</label>
        <Input v-model="form.name" placeholder="New Hire Onboarding Journey" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Program type</label>
        <Input v-model="form.programType" placeholder="ONBOARDING" />
      </div>
    </div>

    <div class="grid gap-2">
      <label class="text-sm font-medium">Description</label>
      <Textarea v-model="form.description" placeholder="What outcome should this journey help employees reach?" />
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="grid gap-2">
        <label class="text-sm font-medium">Default duration (weeks)</label>
        <Input v-model="form.defaultDurationWeeks" type="number" min="1" placeholder="6" />
      </div>

      <div class="flex items-center justify-between rounded-lg border px-4 py-3">
        <div>
          <div class="text-sm font-medium">Active template</div>
          <p class="text-xs text-muted-foreground">Active templates can be attached to company programs.</p>
        </div>
        <Switch :checked="form.active" @update:checked="value => (form.active = Boolean(value))" />
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-medium">Journey steps</h3>
          <p class="text-sm text-muted-foreground">Define the milestones employees move through in this guided journey.</p>
        </div>
        <Button type="button" variant="outline" size="sm" @click="addStep">
          <Plus class="mr-2 h-4 w-4" />
          Add step
        </Button>
      </div>

      <div class="space-y-3">
        <div
          v-for="(step, index) in steps"
          :key="`${step.stepKey}-${index}`"
          class="rounded-lg border p-4"
        >
          <div class="mb-3 flex items-center justify-between">
            <div class="text-sm font-medium">Step {{ index + 1 }}</div>
            <div class="flex gap-2">
              <Button type="button" size="icon" variant="ghost" @click="moveStep(index, -1)" :disabled="index === 0">
                <ArrowUp class="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" @click="moveStep(index, 1)" :disabled="index === steps.length - 1">
                <ArrowDown class="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" @click="removeStep(index)">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="grid gap-2">
              <label class="text-sm font-medium">Step title</label>
              <Input v-model="step.title" placeholder="Kickoff Session" />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Step key</label>
              <Input v-model="step.stepKey" placeholder="kickoff_session" />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Step type</label>
              <Select v-model="step.stepType">
                <SelectTrigger>
                  <SelectValue placeholder="Select step type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="stepType in stepTypeOptions"
                    :key="stepType"
                    :value="stepType"
                  >
                    {{ companyProgramsStore.journeyStepTypeLabel(stepType) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Due offset (days)</label>
              <Input v-model="step.defaultDueOffsetDays" type="number" min="0" placeholder="Optional" />
            </div>
          </div>

          <div class="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr),220px]">
            <div class="grid gap-2">
              <label class="text-sm font-medium">Step description</label>
              <Textarea v-model="step.description" placeholder="Describe what should happen at this stage." />
            </div>

            <div class="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <div class="text-sm font-medium">Required</div>
                <p class="text-xs text-muted-foreground">Required steps count toward journey completion.</p>
              </div>
              <Switch :checked="step.required" @update:checked="value => (step.required = Boolean(value))" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-medium">Step dependencies</h3>
          <p class="text-sm text-muted-foreground">Control how a step unlocks. If you leave this empty, the backend will create a linear sequence from the step order.</p>
        </div>
        <div class="flex gap-2">
          <Button type="button" variant="outline" size="sm" @click="applyLinearDependencies" :disabled="steps.length <= 1">
            <GitBranch class="mr-2 h-4 w-4" />
            Auto-build linear path
          </Button>
          <Button type="button" variant="outline" size="sm" @click="addDependency" :disabled="availableStepOptions.length <= 1">
            <Plus class="mr-2 h-4 w-4" />
            Add dependency
          </Button>
        </div>
      </div>

      <div v-if="!dependencies.length" class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        No explicit dependencies added yet. The template will use a simple ordered sequence by default.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(dependency, index) in dependencies"
          :key="`dependency-${index}`"
          class="grid gap-3 rounded-lg border p-4 md:grid-cols-[minmax(0,1fr),minmax(0,1fr),220px,auto]"
        >
          <div class="grid gap-2">
            <label class="text-sm font-medium">From step</label>
            <Select v-model="dependency.fromStepKey">
              <SelectTrigger>
                <SelectValue placeholder="Select source step" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="stepOption in availableStepOptions"
                  :key="`from-${stepOption.key}`"
                  :value="stepOption.key"
                >
                  {{ stepOption.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">To step</label>
            <Select v-model="dependency.toStepKey">
              <SelectTrigger>
                <SelectValue placeholder="Select target step" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="stepOption in availableStepOptions"
                  :key="`to-${stepOption.key}`"
                  :value="stepOption.key"
                >
                  {{ stepOption.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Dependency type</label>
            <Select v-model="dependency.dependencyType">
              <SelectTrigger>
                <SelectValue placeholder="Select dependency type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="dependencyType in dependencyTypeOptions"
                  :key="dependencyType"
                  :value="dependencyType"
                >
                  {{ companyProgramsStore.journeyDependencyTypeLabel(dependencyType) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-end">
            <Button type="button" size="icon" variant="ghost" @click="removeDependency(index)">
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
      <Button
        v-if="showCancel"
        type="button"
        variant="outline"
        :disabled="isSaving"
        @click="emit('cancel')"
      >
        {{ cancelLabel }}
      </Button>
      <Button type="submit" :disabled="isSaving">
        <Plus class="mr-2 h-4 w-4" />
        {{ submitLabel }}
      </Button>
    </div>
  </form>
</template>
