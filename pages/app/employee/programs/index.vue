<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { useAppToast } from '@/composables/services/toastService'
import type {
  EmployeeCompanyProgramRecord,
  ProsperCatalogProgramRecord,
} from '~/http/requests/app/companyPrograms'

import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Skeleton } from '~/components/ui/skeleton'
import { BookOpen, Compass, RefreshCw, Search, Users } from 'lucide-vue-next'

definePageMeta({
  title: 'My Programs',
  description: 'View the company mentorship programs you are enrolled in',
  requiresAuth: true,
  permissions: ['mentors:view'],
})

type ProgramCardKind = 'employee' | 'catalog'

interface ProgramCard {
  key: string
  kind: ProgramCardKind
  name: string
  description: string
  imageUrl?: string | null
  programId?: string | null
  badgeLabel: string
  durationLabel: string
  contextLabel: string
  detailLabel: string
  primaryActionLabel: string
  secondaryActionLabel?: string
  searchText: string
  employeeProgram?: EmployeeCompanyProgramRecord
  catalogProgram?: ProsperCatalogProgramRecord
  enrolledProgram?: EmployeeCompanyProgramRecord
}

const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()
const route = useRoute()
const router = useRouter()

const activeTab = ref(route.query.view === 'all' ? 'all' : 'mine')
const searchQuery = ref('')

const normalizeText = (value?: string | null) =>
  (value || '').replace(/"/g, '').trim()

const formatDateRange = (startsAt?: string | null, endsAt?: string | null) => {
  if (!startsAt && !endsAt) return 'Dates will be shared when scheduled'

  const format = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'

  return `${format(startsAt)} - ${format(endsAt)}`
}

const formatEnrolledDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently'

const loadPrograms = async () => {
  try {
    await Promise.all([
      companyProgramsStore.loadMyCompanyPrograms(),
      companyProgramsStore.loadCatalogPrograms(),
    ])
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load your programs')
  }
}

const catalogProgramsById = computed(() => {
  const mapping = new Map<string, ProsperCatalogProgramRecord>()

  for (const program of companyProgramsStore.catalogPrograms) {
    mapping.set(program.id, program)
    if (program.legacyId) {
      mapping.set(program.legacyId, program)
    }
  }

  return mapping
})

const catalogProgramIdsForEmployeeProgram = (program: EmployeeCompanyProgramRecord) => {
  const stageProgramIds = program.catalogStages?.map(stage => stage.programId).filter(Boolean) || []

  if (stageProgramIds.length) {
    return stageProgramIds
  }

  return program.templateProgramId ? [program.templateProgramId] : []
}

const catalogProgramForEmployeeProgram = (program: EmployeeCompanyProgramRecord) => {
  for (const programId of catalogProgramIdsForEmployeeProgram(program)) {
    const catalogProgram = catalogProgramsById.value.get(programId)
    if (catalogProgram) {
      return catalogProgram
    }
  }

  return null
}

const enrolledProgramsByCatalogProgramId = computed(() => {
  const mapping = new Map<string, EmployeeCompanyProgramRecord>()

  for (const program of companyProgramsStore.employeePrograms) {
    for (const programId of catalogProgramIdsForEmployeeProgram(program)) {
      if (!mapping.has(programId)) {
        mapping.set(programId, program)
      }
    }

    const catalogProgram = catalogProgramForEmployeeProgram(program)
    if (catalogProgram && !mapping.has(catalogProgram.id)) {
      mapping.set(catalogProgram.id, program)
    }
  }

  return mapping
})

const employeeProgramCards = computed<ProgramCard[]>(() =>
  companyProgramsStore.employeePrograms.map(program => {
    const catalogProgram = catalogProgramForEmployeeProgram(program)
    const catalogProgramId = catalogProgram?.id || catalogProgramIdsForEmployeeProgram(program)[0] || null
    const journeyLabel = companyProgramsStore.catalogJourneyLabel(program.catalogStages, program.catalogJourneySummary)
    const description = normalizeText(
      program.objective
      || program.targetAudienceDescription
      || catalogProgram?.description
      || 'Your company has opened this mentorship program for employee growth.',
    )
    const statusLabel = companyProgramsStore.participantStatusLabel(program.participantStatus)

    return {
      key: program.participantId,
      kind: 'employee',
      name: program.name,
      description,
      imageUrl: catalogProgram?.imageUrl || null,
      programId: catalogProgramId,
      badgeLabel: statusLabel,
      durationLabel: 'My Program',
      contextLabel: program.companyName || 'Employer program',
      detailLabel: journeyLabel,
      primaryActionLabel: 'Open My Program',
      secondaryActionLabel: catalogProgramId ? 'See Details' : undefined,
      employeeProgram: program,
      catalogProgram: catalogProgram || undefined,
      searchText: [
        program.name,
        program.companyName,
        description,
        journeyLabel,
        statusLabel,
        companyProgramsStore.matchingModeLabel(program.matchingMode),
      ].join(' ').toLowerCase(),
    }
  }),
)

const catalogProgramCards = computed<ProgramCard[]>(() =>
  companyProgramsStore.catalogPrograms.map(program => {
    const enrolledProgram = enrolledProgramsByCatalogProgramId.value.get(program.id)
      || (program.legacyId ? enrolledProgramsByCatalogProgramId.value.get(program.legacyId) : undefined)
    const mentorCount = companyProgramsStore.catalogMentorCount(program)
    const focusLabel = program.focusAreas?.slice(0, 2).join(', ') || 'General growth program'
    const description = normalizeText(program.description || 'Explore this ProsperMentor program and the mentors attached to it.')

    return {
      key: program.id,
      kind: 'catalog',
      name: program.name,
      description,
      imageUrl: program.imageUrl || null,
      programId: program.id,
      badgeLabel: enrolledProgram ? 'Enrolled' : 'Available',
      durationLabel: mentorCount ? `${mentorCount} mentor${mentorCount === 1 ? '' : 's'}` : 'Prosper',
      contextLabel: enrolledProgram?.companyName ? `Employer-sponsored in ${enrolledProgram.companyName}` : 'Prosper catalog',
      detailLabel: focusLabel,
      primaryActionLabel: 'See Details',
      secondaryActionLabel: enrolledProgram ? 'Open My Program' : undefined,
      catalogProgram: program,
      enrolledProgram,
      searchText: [
        program.name,
        description,
        focusLabel,
        enrolledProgram?.companyName,
        enrolledProgram ? 'enrolled' : 'available',
      ].join(' ').toLowerCase(),
    }
  }),
)

const activeProgramCards = computed(() =>
  activeTab.value === 'mine' ? employeeProgramCards.value : catalogProgramCards.value
)

const filteredProgramCards = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return activeProgramCards.value
  }

  return activeProgramCards.value.filter(program => program.searchText.includes(query))
})

const heroProgram = computed(() =>
  filteredProgramCards.value[0] || activeProgramCards.value[0] || null
)

const activeProgramLoading = computed(() =>
  activeTab.value === 'mine'
    ? companyProgramsStore.employeeProgramsLoading
    : companyProgramsStore.catalogProgramsLoading
)

const isRefreshing = computed(() =>
  companyProgramsStore.employeeProgramsLoading || companyProgramsStore.catalogProgramsLoading
)

const activeProgramError = computed(() =>
  activeTab.value === 'mine'
    ? companyProgramsStore.employeeProgramsError
    : companyProgramsStore.catalogProgramsError
)

const emptyStateTitle = computed(() =>
  searchQuery.value
    ? 'No programs found'
    : activeTab.value === 'mine'
      ? 'No enrolled programs yet'
      : 'No catalog programs available'
)

const emptyStateDescription = computed(() =>
  searchQuery.value
    ? 'Try a different search term'
    : activeTab.value === 'mine'
      ? 'When your employer enrolls you into a mentorship program, it will show up here with status and timing.'
      : 'Prosper catalog programs will show up here when they are available.'
)

const searchResultLabel = computed(() => {
  const count = filteredProgramCards.value.length
  return `${count} result${count === 1 ? '' : 's'} for "${searchQuery.value}"`
})

const selectProgramView = (value: 'mine' | 'all') => {
  activeTab.value = value
}

const viewCatalogProgram = (programId: string) => {
  router.push(`/app/mentors/programs/${programId}`)
}

const openEnrolledProgram = (companyProgramId?: string | null) => {
  if (!companyProgramId) {
    return
  }

  router.push(`/app/employee/programs/${companyProgramId}`)
}

const openPrimaryAction = (program: ProgramCard) => {
  if (program.kind === 'employee') {
    openEnrolledProgram(program.employeeProgram?.companyProgramId)
    return
  }

  if (program.programId) {
    viewCatalogProgram(program.programId)
  }
}

const openSecondaryAction = (program: ProgramCard) => {
  if (program.kind === 'employee' && program.programId) {
    viewCatalogProgram(program.programId)
    return
  }

  if (program.kind === 'catalog' && program.enrolledProgram) {
    openEnrolledProgram(program.enrolledProgram.companyProgramId)
  }
}

const handleProgramImageError = (event: Event) => {
  const image = event.target as HTMLImageElement
  image.style.display = 'none'
}

watch(activeTab, value => {
  const nextQuery = { ...route.query }

  if (value === 'all') {
    nextQuery.view = 'all'
  } else {
    delete nextQuery.view
  }

  router.replace({ query: nextQuery })
})

onMounted(() => {
  loadPrograms()
})
</script>

<template>
  <div class="page-wrapper">
    <div class="flex flex-col gap-4 mb-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">My Programs</h1>
        <p class="text-sm text-muted-foreground mt-1">
          View your employer-sponsored journeys and the wider Prosper program catalog.
        </p>
      </div>

      <div class="header-actions">
        <div class="program-view-toggle" aria-label="Program view">
          <button
            type="button"
            class="program-view-tab"
            :class="{ 'program-view-tab--active': activeTab === 'mine' }"
            @click="selectProgramView('mine')"
          >
            My Programs
            <span>{{ employeeProgramCards.length }}</span>
          </button>
          <button
            type="button"
            class="program-view-tab"
            :class="{ 'program-view-tab--active': activeTab === 'all' }"
            @click="selectProgramView('all')"
          >
            All Programs
            <span>{{ catalogProgramCards.length }}</span>
          </button>
        </div>

        <div class="relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search"
            class="w-full pl-9 sm:w-52"
          />
        </div>

        <Button
          variant="outline"
          class="refresh-btn"
          :disabled="isRefreshing"
          @click="loadPrograms"
        >
          <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': isRefreshing }" />
          <span class="sr-only">Refresh programs</span>
        </Button>
      </div>
    </div>

    <Alert v-if="activeProgramError" variant="destructive" class="mb-6">
      <AlertDescription>{{ activeProgramError }}</AlertDescription>
    </Alert>

    <div v-if="employeeProgramCards.length" class="company-recommendations-banner mb-6">
      <p class="company-recommendations-label">Employer-sponsored</p>
      <h2 class="company-recommendations-title">
        {{ employeeProgramCards.length }} program{{ employeeProgramCards.length === 1 ? '' : 's' }} assigned to your growth journey
      </h2>
      <div class="company-recommendations-list">
        <button
          v-for="program in employeeProgramCards"
          :key="`assigned-${program.key}`"
          type="button"
          class="company-recommendation-chip"
          @click="openEnrolledProgram(program.employeeProgram?.companyProgramId)"
        >
          {{ program.name }}
        </button>
      </div>
    </div>

    <div v-if="!searchQuery && heroProgram" class="hero-banner mb-8">
      <img
        v-if="heroProgram.imageUrl"
        :src="heroProgram.imageUrl"
        class="hero-bg-image"
        :alt="heroProgram.name"
        @error="handleProgramImageError"
      />
      <div class="hero-overlay" />
      <div class="hero-content">
        <p class="hero-context">{{ heroProgram.contextLabel }}</p>
        <h2 class="text-xl font-bold leading-snug text-white">
          {{ heroProgram.name }}
        </h2>
        <p class="mt-1 max-w-sm line-clamp-2 text-sm text-white/80">
          {{ heroProgram.description }}
        </p>
      </div>
    </div>

    <p v-if="searchQuery && !activeProgramLoading" class="mb-4 text-sm text-muted-foreground">
      <template v-if="filteredProgramCards.length">
        {{ searchResultLabel }}
      </template>
    </p>

    <div v-if="activeProgramLoading" class="programs-grid">
      <div v-for="i in 8" :key="i" class="program-card">
        <Skeleton class="aspect-video w-full" />
        <div class="space-y-2 p-4">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-3 w-full" />
          <Skeleton class="h-3 w-5/6" />
          <div class="flex gap-2 pt-1">
            <Skeleton class="h-8 w-24 rounded-md" />
            <Skeleton class="h-8 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="filteredProgramCards.length === 0" class="empty-state">
      <Search v-if="searchQuery" class="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
      <BookOpen v-else class="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
      <p class="text-base font-medium text-foreground">{{ emptyStateTitle }}</p>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ emptyStateDescription }}
      </p>
      <Button
        v-if="searchQuery"
        variant="outline"
        size="sm"
        class="mt-4"
        @click="searchQuery = ''"
      >
        Clear search
      </Button>
    </div>

    <div v-else class="programs-grid">
      <div
        v-for="program in filteredProgramCards"
        :key="program.key"
        class="program-card"
        :class="{ 'program-card--recommended': program.kind === 'employee' || program.enrolledProgram }"
        @click="openPrimaryAction(program)"
      >
        <div class="relative aspect-video overflow-hidden program-card-media">
          <img
            v-if="program.imageUrl"
            :src="program.imageUrl"
            :alt="program.name"
            class="h-full w-full object-cover transition-transform duration-300"
            @error="handleProgramImageError"
          />
          <span class="recommended-badge">
            {{ program.badgeLabel }}
          </span>
          <span class="duration-badge">
            {{ program.durationLabel }}
          </span>
        </div>

        <div class="flex flex-1 flex-col gap-3 p-4">
          <div>
            <h3 class="line-clamp-2 text-sm font-semibold leading-snug">
              {{ program.name }}
            </h3>
            <p class="mt-1 text-[11px] font-medium text-[#8a337f]">
              {{ program.contextLabel }}
            </p>
            <p class="mt-1 line-clamp-3 text-xs text-muted-foreground">
              {{ program.description }}
            </p>
          </div>

          <div class="program-meta">
            <template v-if="program.kind === 'employee' && program.employeeProgram">
              <div class="program-meta-row">
                <Users class="h-4 w-4" />
                <span>{{ companyProgramsStore.matchingModeLabel(program.employeeProgram.matchingMode) }}</span>
              </div>
              <div class="program-meta-row">
                <BookOpen class="h-4 w-4" />
                <span>{{ formatDateRange(program.employeeProgram.startsAt, program.employeeProgram.endsAt) }}</span>
              </div>
              <div class="program-meta-row">
                <RefreshCw class="h-4 w-4" />
                <span>Enrolled {{ formatEnrolledDate(program.employeeProgram.enrolledAt) }}</span>
              </div>
            </template>
            <template v-else-if="program.catalogProgram">
              <div class="program-meta-row">
                <Users class="h-4 w-4" />
                <span>{{ companyProgramsStore.catalogMentorCount(program.catalogProgram) }} mentors attached</span>
              </div>
              <div class="program-meta-row">
                <Compass class="h-4 w-4" />
                <span>{{ program.detailLabel }}</span>
              </div>
            </template>
          </div>

          <div class="mt-auto flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              class="see-details-btn"
              @click.stop="openPrimaryAction(program)"
            >
              {{ program.primaryActionLabel }}
            </Button>
            <Button
              v-if="program.secondaryActionLabel"
              variant="outline"
              size="sm"
              class="secondary-action-btn"
              @click.stop="openSecondaryAction(program)"
            >
              {{ program.secondaryActionLabel }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 24px;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}

.program-view-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid #ead2e4;
  border-radius: 12px;
  background: #fff;
  padding: 4px;
}

.program-view-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 9px;
  color: #6b5b6a;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  padding: 9px 11px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.program-view-tab span {
  border-radius: 999px;
  background: #f6edf4;
  color: #8a337f;
  font-size: 11px;
  padding: 3px 7px;
}

.program-view-tab--active {
  background: #a03b93;
  color: white;
}

.program-view-tab--active span {
  background: rgba(255, 255, 255, 0.22);
  color: white;
}

.refresh-btn {
  width: 40px;
  height: 40px;
  padding: 0;
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
}

.hero-banner {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  height: 220px;
  background: linear-gradient(135deg, #6b21a8 0%, #9333ea 60%, #c026d3 100%);
}

.hero-bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(88, 28, 135, 0.75) 0%, rgba(88, 28, 135, 0.35) 100%);
}

.hero-content {
  position: absolute;
  bottom: 28px;
  left: 28px;
  max-width: calc(100% - 56px);
}

.hero-context {
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.company-recommendations-banner {
  border: 1px solid #ead2e4;
  border-radius: 18px;
  background: linear-gradient(135deg, #fcf4fa 0%, #fff9fd 100%);
  padding: 20px 22px;
}

.company-recommendations-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a337f;
}

.company-recommendations-title {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 700;
  color: #2d1730;
}

.company-recommendations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.company-recommendation-chip {
  border: 1px solid #d8abd0;
  border-radius: 999px;
  background: #fff;
  color: #8a337f;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 12px;
}

.programs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .programs-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .programs-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.program-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  display: flex;
  flex-direction: column;
}

.program-card--recommended {
  border-color: rgba(160, 59, 147, 0.32);
  box-shadow: 0 18px 48px -24px rgba(160, 59, 147, 0.45);
}

.program-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.program-card:hover img {
  transform: scale(1.05);
}

.program-card-media {
  background: linear-gradient(135deg, #6b21a8 0%, #9333ea 60%, #c026d3 100%);
}

.recommended-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  border-radius: 999px;
  background: rgba(160, 59, 147, 0.94);
  color: white;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 6px 10px;
}

.duration-badge {
  position: absolute;
  right: 8px;
  bottom: 8px;
  max-width: calc(100% - 16px);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  color: #111;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
}

.program-meta {
  display: grid;
  gap: 7px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.program-meta-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.program-meta-row svg {
  flex-shrink: 0;
  color: #8a337f;
}

.program-meta-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.see-details-btn {
  background-color: #a03b93;
  color: white;
  font-size: 12px;
  height: 32px;
  padding: 0 14px;
}

.see-details-btn:hover {
  background-color: #882f7c;
}

.secondary-action-btn {
  height: 32px;
  border-color: #ead2e4;
  color: #8a337f;
  font-size: 12px;
  padding: 0 14px;
}

.secondary-action-btn:hover {
  background-color: #fcf4fa;
  color: #8a337f;
}

@media (max-width: 640px) {
  .page-wrapper {
    padding: 24px 16px;
  }

  .header-actions {
    align-items: stretch;
    width: 100%;
  }

  .program-view-toggle,
  .program-view-tab {
    flex: 1;
  }

  .program-view-tab {
    justify-content: center;
  }

  .programs-grid {
    grid-template-columns: 1fr;
  }

  .hero-banner {
    height: 200px;
  }
}
</style>
