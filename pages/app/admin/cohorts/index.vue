<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { useCompanyProgramCohortsStore } from '@/store/modules/company-program-cohorts'
import { useCompanyLocationCatalogStore } from '@/store/modules/company-location-catalog'
import type { CompanyProgramCohortRecord, CompanyProgramCohortStatus } from '@/http/requests/app/companyProgramCohorts'
import { useAppToast } from '@/composables/services/toastService'
import CompanyProgramCohortEditorDialog from '@/components/app/admin/cohorts/CompanyProgramCohortEditorDialog.vue'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import {
  CircleDot,
  Filter,
  GitBranch,
  RefreshCw,
  Search,
  UserPlus,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Cohorts',
  description: 'Manage company cohort cycles across programs',
  requiresAuth: true,
  permissions: ['admin:program-cohorts'],
})

const ALL_FILTER = 'ALL'
const NO_REGION_FILTER = '__NO_REGION__'
const NO_CHAPTER_FILTER = '__NO_CHAPTER__'

const route = useRoute()
const authStore = useAuthStore()
const companyProgramsStore = useCompanyProgramsStore()
const cohortsStore = useCompanyProgramCohortsStore()
const locationCatalogStore = useCompanyLocationCatalogStore()
const toast = useAppToast()

const { programs, isLoading: programsLoading } = storeToRefs(companyProgramsStore)
const { cohorts, isLoading: cohortsLoading, error } = storeToRefs(cohortsStore)
const { activeRegions, activeChapters, regionsLoading, chaptersLoading } = storeToRefs(locationCatalogStore)

const search = ref('')
const selectedProgramFilter = ref(ALL_FILTER)
const selectedStatusFilter = ref<CompanyProgramCohortStatus | typeof ALL_FILTER>(ALL_FILTER)
const selectedRegionFilter = ref(ALL_FILTER)
const selectedChapterFilter = ref(ALL_FILTER)
const createDialogOpen = ref(false)
const createProgramId = ref('')

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

const isLoading = computed(() =>
  cohortsLoading.value || programsLoading.value || regionsLoading.value || chaptersLoading.value,
)

const activeCycleStatuses = new Set<CompanyProgramCohortStatus>([
  'INTAKE_OPEN',
  'PLENARY_SCHEDULED',
  'CIRCLES_FORMING',
  'CIRCLES_FINALIZED',
  'MATCHING',
  'ACTIVE',
])

const statusOptions: Array<CompanyProgramCohortStatus | typeof ALL_FILTER> = [
  ALL_FILTER,
  'DRAFT',
  'INTAKE_OPEN',
  'INTAKE_CLOSED',
  'PLENARY_SCHEDULED',
  'CIRCLES_FORMING',
  'CIRCLES_FINALIZED',
  'MATCHING',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'ARCHIVED',
]

const programOptions = computed(() =>
  programs.value.map(program => ({
    id: program.id,
    name: program.name,
    status: program.status,
  })),
)

const normalize = (value?: string | null) => String(value || '').trim().toLowerCase()

const uniqueNames = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.map(value => String(value || '').trim()).filter(Boolean)))
    .sort((first, second) => first.localeCompare(second))

const regionOptions = computed(() =>
  uniqueNames([
    ...activeRegions.value.map(region => region.name),
    ...cohorts.value.map(cohort => cohort.region),
  ]),
)

const chapterOptions = computed(() => {
  const selectedRegionName = selectedRegionFilter.value === ALL_FILTER || selectedRegionFilter.value === NO_REGION_FILTER
    ? ''
    : selectedRegionFilter.value
  const catalogChapters = activeChapters.value
    .filter(chapter => !selectedRegionName || normalize(chapter.regionName) === normalize(selectedRegionName))
    .map(chapter => chapter.name)
  const cohortChapters = cohorts.value
    .filter(cohort => !selectedRegionName || normalize(cohort.region) === normalize(selectedRegionName))
    .map(cohort => cohort.chapter)

  return uniqueNames([...catalogChapters, ...cohortChapters])
})

const visibleCohorts = computed(() => {
  const query = normalize(search.value)

  return cohorts.value.filter((cohort) => {
    const matchesProgram = selectedProgramFilter.value === ALL_FILTER
      || cohort.companyProgramId === selectedProgramFilter.value
    const matchesStatus = selectedStatusFilter.value === ALL_FILTER
      || cohort.status === selectedStatusFilter.value
    const matchesRegion = selectedRegionFilter.value === ALL_FILTER
      || (selectedRegionFilter.value === NO_REGION_FILTER ? !cohort.region : normalize(cohort.region) === normalize(selectedRegionFilter.value))
    const matchesChapter = selectedChapterFilter.value === ALL_FILTER
      || (selectedChapterFilter.value === NO_CHAPTER_FILTER ? !cohort.chapter : normalize(cohort.chapter) === normalize(selectedChapterFilter.value))
    const matchesSearch = !query || [
      cohort.name,
      cohort.code,
      cohort.companyProgramName,
      cohort.chapter,
      cohort.region,
      cohort.status,
      (cohort.interestTagSet || []).join(' '),
    ].filter(Boolean).join(' ').toLowerCase().includes(query)

    return matchesProgram && matchesStatus && matchesRegion && matchesChapter && matchesSearch
  })
})

const activeCycleCount = computed(() =>
  cohorts.value.filter(cohort => activeCycleStatuses.has(cohort.status)).length,
)
const totalParticipants = computed(() =>
  cohorts.value.reduce((total, cohort) => total + Number(cohort.participantCount || 0), 0),
)
const totalCircles = computed(() =>
  cohorts.value.reduce((total, cohort) => total + Number(cohort.circleCount || 0), 0),
)

const statusTone = (status: CompanyProgramCohortStatus) => ({
  DRAFT: 'secondary',
  INTAKE_OPEN: 'default',
  INTAKE_CLOSED: 'outline',
  PLENARY_SCHEDULED: 'secondary',
  CIRCLES_FORMING: 'default',
  CIRCLES_FINALIZED: 'secondary',
  MATCHING: 'default',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  CANCELLED: 'destructive',
  ARCHIVED: 'outline',
}[status] as 'default' | 'secondary' | 'outline' | 'destructive')

const statusLabel = (status?: string | null) =>
  status && status !== ALL_FILTER
    ? String(status).toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
    : 'All statuses'

const formatDate = (value?: string | null) => {
  if (!value) return '-'

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatDateRange = (startsAt?: string | null, endsAt?: string | null) => {
  if (!startsAt && !endsAt) return 'Flexible dates'
  return `${formatDate(startsAt)} - ${formatDate(endsAt)}`
}

const cohortLocation = (cohort: CompanyProgramCohortRecord) =>
  [cohort.chapter, cohort.region].filter(Boolean).join(' | ') || 'No location set'

const visibleInterestTags = (cohort: CompanyProgramCohortRecord) =>
  (cohort.interestTagSet || []).slice(0, 4)

const hiddenInterestTagCount = (cohort: CompanyProgramCohortRecord) =>
  Math.max((cohort.interestTagSet || []).length - 4, 0)

const syncProgramFilterFromRoute = () => {
  const routeProgramId = Array.isArray(route.query.programId)
    ? route.query.programId[0]
    : route.query.programId
  selectedProgramFilter.value = typeof routeProgramId === 'string' && routeProgramId.trim()
    ? routeProgramId
    : ALL_FILTER
}

const loadCompanyCatalogs = async () => {
  if (!companyId.value) return

  const results = await Promise.allSettled([
    locationCatalogStore.loadRegions({
      companyId: companyId.value,
      page: 0,
      size: 100,
      search: '',
    }),
    locationCatalogStore.loadChapters({
      companyId: companyId.value,
      page: 0,
      size: 100,
      search: '',
    }),
  ])

  const failedCatalogLoad = results.find(result => result.status === 'rejected')
  if (failedCatalogLoad) {
    toast.error('Regions and chapters could not be loaded for filtering.')
  }
}

const loadStandaloneCohorts = async () => {
  if (!companyId.value) return

  try {
    await Promise.all([
      cohortsStore.loadCompanyCohorts(companyId.value),
      companyProgramsStore.loadCompanyPrograms({
        companyId: companyId.value,
        page: 0,
        size: 100,
        status: 'ALL',
      }),
    ])
    await loadCompanyCatalogs()
  } catch (loadError: any) {
    toast.error(loadError?.response?.data?.message || loadError?.message || 'Failed to load cohorts')
  }
}

const openCreateDialog = () => {
  createProgramId.value = selectedProgramFilter.value !== ALL_FILTER
    ? selectedProgramFilter.value
    : programOptions.value[0]?.id || ''
  createDialogOpen.value = true
}

const openCohort = (cohort: CompanyProgramCohortRecord) => {
  navigateTo(`/app/admin/cohorts/${cohort.id}`)
}

const handleCohortCreated = async () => {
  await loadStandaloneCohorts()
}

watch(() => route.query.programId, syncProgramFilterFromRoute, { immediate: true })

watch([selectedRegionFilter, chapterOptions], () => {
  if (
    selectedChapterFilter.value !== ALL_FILTER
    && selectedChapterFilter.value !== NO_CHAPTER_FILTER
    && !chapterOptions.value.includes(selectedChapterFilter.value)
  ) {
    selectedChapterFilter.value = ALL_FILTER
  }
})

watch(() => companyId.value, value => {
  if (value) {
    loadStandaloneCohorts()
  }
}, { immediate: true })
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-1">
        <p class="text-xs font-semibold uppercase tracking-wide text-primary">Cohort operations</p>
        <h1 class="text-2xl font-semibold tracking-tight">Cohorts</h1>
        <p class="text-sm text-muted-foreground">
          Operate cohort cycles across programs, regions, chapters, plenaries, circles, and matching readiness.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button variant="outline" :disabled="isLoading || !companyId" @click="loadStandaloneCohorts">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <Button :disabled="!programOptions.length" @click="openCreateDialog">
          <UserPlus class="mr-2 h-4 w-4" />
          Create cohort
        </Button>
      </div>
    </div>

    <Alert v-if="!companyId" variant="destructive">
      <AlertDescription>Company context is missing.</AlertDescription>
    </Alert>
    <Alert v-else-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Total cohorts</CardDescription>
          <CardTitle class="text-3xl">{{ cohorts.length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Active cycles</CardDescription>
          <CardTitle class="text-3xl">{{ activeCycleCount }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Participants</CardDescription>
          <CardTitle class="text-3xl">{{ totalParticipants }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Circles</CardDescription>
          <CardTitle class="text-3xl">{{ totalCircles }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <div class="space-y-4">
      <div class="grid gap-3 rounded-lg border bg-background p-4 lg:grid-cols-[minmax(220px,1.4fr)_repeat(4,minmax(160px,1fr))]">
        <div class="relative">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input v-model="search" class="pl-9" placeholder="Search cohorts" />
        </div>

        <Select v-model="selectedProgramFilter">
          <SelectTrigger>
            <SelectValue placeholder="Program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="ALL_FILTER">All programs</SelectItem>
            <SelectItem v-for="program in programOptions" :key="program.id" :value="program.id">
              {{ program.name }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="selectedStatusFilter">
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="status in statusOptions" :key="status" :value="status">
              {{ statusLabel(status) }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="selectedRegionFilter">
          <SelectTrigger>
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="ALL_FILTER">All regions</SelectItem>
            <SelectItem :value="NO_REGION_FILTER">No region</SelectItem>
            <SelectItem v-for="region in regionOptions" :key="region" :value="region">
              {{ region }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="selectedChapterFilter">
          <SelectTrigger>
            <SelectValue placeholder="Chapter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="ALL_FILTER">All chapters</SelectItem>
            <SelectItem :value="NO_CHAPTER_FILTER">No chapter</SelectItem>
            <SelectItem v-for="chapter in chapterOptions" :key="chapter" :value="chapter">
              {{ chapter }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter class="h-4 w-4" />
        <span>{{ visibleCohorts.length }} shown from {{ cohorts.length }} cohorts</span>
      </div>
    </div>

    <div v-if="isLoading && !cohorts.length" class="overflow-hidden rounded-lg border bg-background">
      <div class="overflow-x-auto">
        <Table class="min-w-[1120px]">
          <TableHeader>
            <TableRow>
              <TableHead>Cohort</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Circles</TableHead>
              <TableHead>Intake</TableHead>
              <TableHead class="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="index in 5" :key="index">
              <TableCell><Skeleton class="h-12 w-full" /></TableCell>
              <TableCell><Skeleton class="h-5 w-36" /></TableCell>
              <TableCell><Skeleton class="h-5 w-32" /></TableCell>
              <TableCell><Skeleton class="h-6 w-24" /></TableCell>
              <TableCell><Skeleton class="h-5 w-40" /></TableCell>
              <TableCell><Skeleton class="h-10 w-32" /></TableCell>
              <TableCell><Skeleton class="h-10 w-28" /></TableCell>
              <TableCell><Skeleton class="h-6 w-28" /></TableCell>
              <TableCell class="text-right"><Skeleton class="ml-auto h-8 w-20" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <div v-else-if="!visibleCohorts.length" class="rounded-lg border border-dashed p-10 text-center">
      <CircleDot class="mx-auto h-9 w-9 text-muted-foreground" />
      <p class="mt-3 text-sm font-medium">No cohorts match this view.</p>
      <p class="mt-1 text-sm text-muted-foreground">
        Adjust filters or create a cohort under an active company program.
      </p>
      <Button class="mt-4" :disabled="!programOptions.length" @click="openCreateDialog">
        <UserPlus class="mr-2 h-4 w-4" />
        Create cohort
      </Button>
    </div>

    <div v-else class="overflow-hidden rounded-lg border bg-background">
      <div class="overflow-x-auto">
        <Table class="min-w-[1120px]">
          <TableHeader>
            <TableRow>
              <TableHead>Cohort</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Circles</TableHead>
              <TableHead>Intake</TableHead>
              <TableHead class="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="cohort in visibleCohorts"
              :key="cohort.id"
              class="cohort-table-row cursor-pointer"
              role="button"
              tabindex="0"
              @click="openCohort(cohort)"
              @keydown.enter.prevent="openCohort(cohort)"
              @keydown.space.prevent="openCohort(cohort)"
            >
              <TableCell class="min-w-[260px] align-top">
                <div class="space-y-2">
                  <div class="font-medium text-foreground">{{ cohort.name }}</div>
                  <div class="flex flex-wrap gap-2">
                    <Badge variant="outline" class="font-mono text-[11px]">{{ cohort.code }}</Badge>
                    <span
                      v-for="tag in visibleInterestTags(cohort)"
                      :key="tag"
                      class="cohort-tag"
                    >
                      {{ tag }}
                    </span>
                    <span v-if="hiddenInterestTagCount(cohort)" class="cohort-tag">+{{ hiddenInterestTagCount(cohort) }}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell class="min-w-[180px] align-top">
                {{ cohort.companyProgramName || 'Program not set' }}
              </TableCell>
              <TableCell class="min-w-[170px] align-top text-muted-foreground">
                {{ cohortLocation(cohort) }}
              </TableCell>
              <TableCell class="align-top">
                <Badge :variant="statusTone(cohort.status)" class="w-fit">{{ statusLabel(cohort.status) }}</Badge>
              </TableCell>
              <TableCell class="min-w-[160px] align-top text-muted-foreground">
                {{ formatDateRange(cohort.startsAt, cohort.endsAt) }}
              </TableCell>
              <TableCell class="min-w-[150px] align-top">
                <div class="font-medium">{{ cohort.participantCount || 0 }} participants</div>
                <div class="text-xs text-muted-foreground">
                  {{ cohort.unplacedCount || 0 }} unplaced | {{ cohort.matchedCount || 0 }} matched
                </div>
              </TableCell>
              <TableCell class="min-w-[130px] align-top">
                <div class="font-medium">{{ cohort.circleCount || 0 }} circles</div>
                <div class="text-xs text-muted-foreground">
                  {{ cohort.circleMinSize || 5 }}-{{ cohort.circleMaxSize || 10 }} per circle
                </div>
              </TableCell>
              <TableCell class="align-top">
                <Badge v-if="cohort.selfJoinEnabled" variant="secondary">Self-join</Badge>
                <Badge v-else variant="outline">Admin</Badge>
              </TableCell>
              <TableCell class="text-right align-top">
                <Button size="sm" variant="outline" @click.stop="openCohort(cohort)">
                  Open
                  <GitBranch class="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <CompanyProgramCohortEditorDialog
      v-model:open="createDialogOpen"
      :program-id="createProgramId"
      :company-id="companyId"
      :program-options="programOptions"
      @created="handleCohortCreated"
    />
  </div>
</template>

<style scoped>
.cohort-table-row {
  transition: background-color 120ms ease, box-shadow 120ms ease;
}

.cohort-table-row:hover {
  background: #faf7fb;
}

.cohort-tag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border: 1px solid #d8e8dc;
  border-radius: 999px;
  background: #f6fbf8;
  color: #24533a;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  padding: 0 10px;
}
</style>
