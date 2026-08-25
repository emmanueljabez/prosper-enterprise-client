<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCompanyProgramCohortsStore } from '@/store/modules/company-program-cohorts'
import { useCompanyLocationCatalogStore } from '@/store/modules/company-location-catalog'
import type {
  CompanyProgramCohortRecord,
  CreateCompanyProgramCohortPayload,
  PlenaryEventType,
  UpdateCompanyProgramCohortPayload,
} from '@/http/requests/app/companyProgramCohorts'
import { useAppToast } from '@/composables/services/toastService'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'

type CohortFormModel = {
  name: string
  code: string
  chapter: string
  region: string
  startsAt: string
  endsAt: string
  selfJoinEnabled: boolean
  selfJoinExpiresAt: string
  selfJoinCapacity: number | null
  circleMinSize: number | null
  circleMaxSize: number | null
  interestTags: string
  plenaryEventType: PlenaryEventType | 'NONE'
  plenaryEventId: string
  matchingStartsAfterCirclesFinalized: boolean
}

const props = withDefaults(defineProps<{
  open: boolean
  programId: string
  companyId?: string
  cohort?: CompanyProgramCohortRecord | null
}>(), {
  companyId: '',
  cohort: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  created: [cohort: CompanyProgramCohortRecord]
  saved: [cohort: CompanyProgramCohortRecord]
}>()

const cohortsStore = useCompanyProgramCohortsStore()
const locationCatalogStore = useCompanyLocationCatalogStore()
const {
  activeRegions,
  activeChapters,
  regionsLoading,
  chaptersLoading,
} = storeToRefs(locationCatalogStore)
const toast = useAppToast()

const NO_REGION = '__NO_REGION__'
const NO_CHAPTER = '__NO_CHAPTER__'
const CURRENT_REGION = '__CURRENT_REGION__'
const CURRENT_CHAPTER = '__CURRENT_CHAPTER__'
const selectedRegionId = ref(NO_REGION)
const selectedChapterId = ref(NO_CHAPTER)

const form = reactive<CohortFormModel>({
  name: '',
  code: '',
  chapter: '',
  region: '',
  startsAt: '',
  endsAt: '',
  selfJoinEnabled: true,
  selfJoinExpiresAt: '',
  selfJoinCapacity: null,
  circleMinSize: 5,
  circleMaxSize: 10,
  interestTags: '',
  plenaryEventType: 'NONE',
  plenaryEventId: '',
  matchingStartsAfterCirclesFinalized: true,
})

const isEditing = computed(() => Boolean(props.cohort?.id))
const title = computed(() => isEditing.value ? 'Edit cohort' : 'Create cohort')
const submitLabel = computed(() => isEditing.value ? 'Save cohort' : 'Create cohort')
const dialogOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const toLocalDateTime = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 16)
}

const toIsoOrNull = (value: string) => value ? new Date(value).toISOString() : null
const optionalNumber = (value: number | string | null) => {
  if (value === null || value === '') return null
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

const splitTags = (value: string) =>
  value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)

const normalizeCatalogName = (value?: string | null) => String(value || '').trim().toLowerCase()

const selectedRegionRecord = computed(() =>
  activeRegions.value.find(region => region.id === selectedRegionId.value) || null,
)

const regionOptions = computed(() => {
  const currentRegion = form.region.trim()
  const hasCurrentRegion = currentRegion
    ? activeRegions.value.some(region => normalizeCatalogName(region.name) === normalizeCatalogName(currentRegion))
    : true

  return hasCurrentRegion
    ? activeRegions.value
    : [{
        id: CURRENT_REGION,
        companyId: props.companyId || '',
        name: currentRegion,
        code: null,
        description: null,
        isActive: true,
        status: 'ACTIVE',
      }, ...activeRegions.value]
})

const filteredChapterOptions = computed(() => {
  const selectedRegionName = selectedRegionRecord.value?.name || (selectedRegionId.value === CURRENT_REGION ? form.region : '')
  const chapters = selectedRegionId.value === NO_REGION
    ? activeChapters.value
    : activeChapters.value.filter(chapter =>
        chapter.regionId === selectedRegionId.value
        || normalizeCatalogName(chapter.regionName) === normalizeCatalogName(selectedRegionName),
      )

  const currentChapter = form.chapter.trim()
  const hasCurrentChapter = currentChapter
    ? chapters.some(chapter => normalizeCatalogName(chapter.name) === normalizeCatalogName(currentChapter))
    : true

  return hasCurrentChapter
    ? chapters
    : [{
        id: CURRENT_CHAPTER,
        companyId: props.companyId || '',
        name: currentChapter,
        code: null,
        description: null,
        regionId: selectedRegionId.value === NO_REGION ? null : selectedRegionId.value,
        regionName: form.region || null,
        isActive: true,
        status: 'ACTIVE',
      }, ...chapters]
})

const syncRegionSelectionFromValue = () => {
  const currentRegion = form.region.trim()
  const match = activeRegions.value.find(region =>
    normalizeCatalogName(region.name) === normalizeCatalogName(currentRegion),
  )
  selectedRegionId.value = match?.id || (currentRegion ? CURRENT_REGION : NO_REGION)
}

const syncChapterSelectionFromValue = () => {
  const currentChapter = form.chapter.trim()
  const match = filteredChapterOptions.value.find(chapter =>
    normalizeCatalogName(chapter.name) === normalizeCatalogName(currentChapter),
  )
  selectedChapterId.value = match?.id || (currentChapter ? CURRENT_CHAPTER : NO_CHAPTER)
}

const generateCode = (name: string) =>
  name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32)

const resetForm = () => {
  if (props.cohort) {
    form.name = props.cohort.name || ''
    form.code = props.cohort.code || ''
    form.chapter = props.cohort.chapter || ''
    form.region = props.cohort.region || ''
    form.startsAt = toLocalDateTime(props.cohort.startsAt)
    form.endsAt = toLocalDateTime(props.cohort.endsAt)
    form.selfJoinEnabled = props.cohort.selfJoinEnabled !== false
    form.selfJoinExpiresAt = toLocalDateTime(props.cohort.selfJoinExpiresAt)
    form.selfJoinCapacity = props.cohort.selfJoinCapacity ?? null
    form.circleMinSize = props.cohort.circleMinSize ?? 5
    form.circleMaxSize = props.cohort.circleMaxSize ?? 10
    form.interestTags = (props.cohort.interestTagSet || []).join(', ')
    form.plenaryEventType = props.cohort.plenaryEventType || 'NONE'
    form.plenaryEventId = props.cohort.plenaryEventId || ''
    form.matchingStartsAfterCirclesFinalized = props.cohort.matchingStartsAfterCirclesFinalized !== false
    syncRegionSelectionFromValue()
    syncChapterSelectionFromValue()
    return
  }

  form.name = ''
  form.code = ''
  form.chapter = ''
  form.region = ''
  form.startsAt = ''
  form.endsAt = ''
  form.selfJoinEnabled = true
  form.selfJoinExpiresAt = ''
  form.selfJoinCapacity = null
  form.circleMinSize = 5
  form.circleMaxSize = 10
  form.interestTags = ''
  form.plenaryEventType = 'NONE'
  form.plenaryEventId = ''
  form.matchingStartsAfterCirclesFinalized = true
  selectedRegionId.value = NO_REGION
  selectedChapterId.value = NO_CHAPTER
}

const loadLocationCatalog = async () => {
  if (!props.companyId) return

  try {
    await Promise.all([
      locationCatalogStore.loadRegions({
        companyId: props.companyId,
        page: 0,
        size: 100,
        search: '',
      }),
      locationCatalogStore.loadChapters({
        companyId: props.companyId,
        page: 0,
        size: 100,
        search: '',
      }),
    ])
    syncRegionSelectionFromValue()
    syncChapterSelectionFromValue()
  } catch (catalogError: any) {
    toast.error(catalogError?.response?.data?.message || catalogError?.message || 'Failed to load regions and chapters')
  }
}

const buildPayload = (): CreateCompanyProgramCohortPayload | UpdateCompanyProgramCohortPayload => ({
  name: form.name.trim(),
  code: (form.code.trim() || generateCode(form.name) || 'COHORT').toUpperCase(),
  chapter: form.chapter.trim() || null,
  region: form.region.trim() || null,
  startsAt: toIsoOrNull(form.startsAt),
  endsAt: toIsoOrNull(form.endsAt),
  selfJoinEnabled: form.selfJoinEnabled,
  selfJoinExpiresAt: form.selfJoinEnabled ? toIsoOrNull(form.selfJoinExpiresAt) : null,
  selfJoinCapacity: form.selfJoinEnabled ? optionalNumber(form.selfJoinCapacity) : null,
  circleMinSize: optionalNumber(form.circleMinSize),
  circleMaxSize: optionalNumber(form.circleMaxSize),
  interestTagSet: splitTags(form.interestTags),
  plenaryEventType: form.plenaryEventType === 'NONE' ? null : form.plenaryEventType,
  plenaryEventId: form.plenaryEventId.trim() || null,
  matchingStartsAfterCirclesFinalized: form.matchingStartsAfterCirclesFinalized,
})

const submit = async () => {
  if (!props.programId) {
    toast.error('Program context is missing')
    return
  }

  if (!form.name.trim()) {
    toast.error('Cohort name is required')
    return
  }

  const minSize = optionalNumber(form.circleMinSize)
  const maxSize = optionalNumber(form.circleMaxSize)
  if (minSize && maxSize && minSize > maxSize) {
    toast.error('Circle minimum size cannot be greater than maximum size')
    return
  }

  try {
    const payload = buildPayload()
    const savedCohort = isEditing.value && props.cohort?.id
      ? await cohortsStore.updateCohort(props.cohort.id, payload)
      : await cohortsStore.createCohort(props.programId, payload as CreateCompanyProgramCohortPayload)

    toast.success(isEditing.value ? 'Cohort updated.' : 'Cohort created.')
    if (isEditing.value) {
      emit('saved', savedCohort)
    } else {
      emit('created', savedCohort)
    }
    emit('update:open', false)
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to save cohort')
  }
}

watch(() => props.open, isOpen => {
  if (isOpen) {
    resetForm()
    loadLocationCatalog()
  }
})

watch(() => props.cohort, () => {
  if (props.open) {
    resetForm()
  }
})

watch(selectedRegionId, value => {
  if (value === NO_REGION) {
    form.region = ''
  } else if (value === CURRENT_REGION) {
    form.region = form.region.trim()
  } else {
    form.region = activeRegions.value.find(region => region.id === value)?.name || ''
  }

  const selectedChapter = filteredChapterOptions.value.find(chapter => chapter.id === selectedChapterId.value)
  if (selectedChapterId.value !== NO_CHAPTER && !selectedChapter) {
    selectedChapterId.value = NO_CHAPTER
    form.chapter = ''
  }
})

watch(selectedChapterId, value => {
  if (value === NO_CHAPTER) {
    form.chapter = ''
  } else if (value === CURRENT_CHAPTER) {
    form.chapter = form.chapter.trim()
  } else {
    form.chapter = filteredChapterOptions.value.find(chapter => chapter.id === value)?.name || ''
  }
})

watch([activeRegions, activeChapters], () => {
  if (props.open) {
    syncRegionSelectionFromValue()
    syncChapterSelectionFromValue()
  }
})
</script>

<template>
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          Configure a cohort cycle, intake settings, plenary gate, and circle formation defaults.
        </DialogDescription>
      </DialogHeader>

      <div class="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="grid gap-2">
            <label class="text-sm font-medium">Cohort name</label>
            <Input v-model="form.name" placeholder="G4G Nairobi - Q3 2026" />
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Cohort code</label>
            <Input v-model="form.code" placeholder="G4G-NAIROBI-Q3-2026" />
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Region</label>
            <Select v-model="selectedRegionId" :disabled="regionsLoading || !companyId">
              <SelectTrigger>
                <SelectValue :placeholder="regionsLoading ? 'Loading regions...' : 'Select region'" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="NO_REGION">No region</SelectItem>
                <SelectItem v-for="region in regionOptions" :key="region.id" :value="region.id">
                  {{ region.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Chapter</label>
            <Select v-model="selectedChapterId" :disabled="chaptersLoading || !companyId">
              <SelectTrigger>
                <SelectValue :placeholder="chaptersLoading ? 'Loading chapters...' : 'Select chapter'" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="NO_CHAPTER">No chapter</SelectItem>
                <SelectItem v-for="chapter in filteredChapterOptions" :key="chapter.id" :value="chapter.id">
                  {{ chapter.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Starts</label>
            <Input v-model="form.startsAt" type="datetime-local" />
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Ends</label>
            <Input v-model="form.endsAt" type="datetime-local" />
          </div>
        </div>

        <div class="rounded-lg border p-4">
          <div class="flex items-start gap-3">
            <Checkbox
              :checked="form.selfJoinEnabled"
              @update:checked="value => form.selfJoinEnabled = value === true"
            />
            <div class="space-y-1">
              <div class="text-sm font-medium">Enable self-join intake</div>
              <p class="text-xs text-muted-foreground">
                Employees can join this cohort through a shareable join code until the capacity or expiry is reached.
              </p>
            </div>
          </div>

          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <div class="grid gap-2">
              <label class="text-sm font-medium">Join expires</label>
              <Input v-model="form.selfJoinExpiresAt" type="datetime-local" :disabled="!form.selfJoinEnabled" />
            </div>

            <div class="grid gap-2">
              <label class="text-sm font-medium">Join capacity</label>
              <Input v-model="form.selfJoinCapacity" type="number" min="1" placeholder="Optional" :disabled="!form.selfJoinEnabled" />
            </div>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="grid gap-2">
            <label class="text-sm font-medium">Circle minimum size</label>
            <Input v-model="form.circleMinSize" type="number" min="1" placeholder="5" />
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Circle maximum size</label>
            <Input v-model="form.circleMaxSize" type="number" min="1" placeholder="10" />
          </div>
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-medium">Interest tags</label>
          <Textarea v-model="form.interestTags" placeholder="STEM, career readiness, public speaking" />
          <p class="text-xs text-muted-foreground">Separate tags with commas. These tags seed suggested circles.</p>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="grid gap-2">
            <label class="text-sm font-medium">Plenary source</label>
            <Select v-model="form.plenaryEventType">
              <SelectTrigger>
                <SelectValue placeholder="Select plenary source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">No linked plenary</SelectItem>
                <SelectItem value="SUMMIT_EVENT">Summit event</SelectItem>
                <SelectItem value="EXTERNAL_EVENT">External event</SelectItem>
                <SelectItem value="MANUAL_EVENT">Manual event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Plenary event ID</label>
            <Input v-model="form.plenaryEventId" placeholder="Optional event reference" />
          </div>
        </div>

        <div class="rounded-lg border p-4">
          <div class="flex items-start gap-3">
            <Checkbox
              :checked="form.matchingStartsAfterCirclesFinalized"
              @update:checked="value => form.matchingStartsAfterCirclesFinalized = value === true"
            />
            <div class="space-y-1">
              <div class="text-sm font-medium">Start 1:1 matching after circles are final</div>
              <p class="text-xs text-muted-foreground">
                Keeps mentor matching blocked until attendees have been placed into common-interest circles.
              </p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="cohortsStore.isSaving" @click="emit('update:open', false)">Cancel</Button>
        <Button :disabled="cohortsStore.isSaving" @click="submit">{{ submitLabel }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
