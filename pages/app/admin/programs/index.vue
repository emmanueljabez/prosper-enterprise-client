<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import type {
  CompanyProgramRecord,
  CompanyProgramStatus,
  ProsperCatalogProgramRecord,
  UpdateCompanyProgramPayload,
} from '@/http/requests/app/companyPrograms'
import { useAppToast } from '@/composables/services/toastService'
import CompanyProgramEditor from '@/components/app/admin/CompanyProgramEditor.vue'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Skeleton } from '~/components/ui/skeleton'
import { Tabs, TabsContent } from '~/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { CalendarRange, Layers3, MoreHorizontal, PauseCircle, Pencil, PlayCircle, Plus, RefreshCw, Search, StopCircle, Target, Trophy, Users } from 'lucide-vue-next'

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
const activeProgramTab = ref('company')
const filters = reactive({
  search: '',
  status: 'ALL' as CompanyProgramStatus | 'ALL',
})
const catalogFilters = reactive({
  search: '',
})

const selectedJourneyProgram = computed(() =>
  companyProgramsStore.programs.find(program => program.id === journeyProgramId.value) || null,
)

const isRefreshing = computed(() =>
  companyProgramsStore.isLoading || companyProgramsStore.catalogProgramsLoading,
)

const filteredCatalogPrograms = computed(() => {
  const search = catalogFilters.search.trim().toLowerCase()

  if (!search) {
    return companyProgramsStore.catalogPrograms
  }

  return companyProgramsStore.catalogPrograms.filter(program =>
    [
      program.name,
      program.description,
      program.status,
      program.focusAreas?.join(' '),
    ].filter(Boolean).join(' ').toLowerCase().includes(search),
  )
})

const statusLabel = (status: CompanyProgramStatus) => status.replace('_', ' ')

const canLaunch = (status: CompanyProgramStatus) => ['DRAFT', 'PAUSED'].includes(status)
const canPause = (status: CompanyProgramStatus) => status === 'LIVE'
const canComplete = (status: CompanyProgramStatus) => ['LIVE', 'PAUSED'].includes(status)
const canCancel = (status: CompanyProgramStatus) => ['DRAFT', 'LIVE', 'PAUSED'].includes(status)

const selectProgramTab = (tab: 'company' | 'prosper') => {
  activeProgramTab.value = tab
}

const catalogMentorLabel = (program: ProsperCatalogProgramRecord) => {
  const mentorCount = companyProgramsStore.catalogMentorCount(program)
  return `${mentorCount} mentor${mentorCount === 1 ? '' : 's'}`
}

const catalogFocusLabel = (program: ProsperCatalogProgramRecord) =>
  program.focusAreas?.slice(0, 2).join(', ') || 'General growth program'

const handleProgramImageError = (event: Event) => {
  const image = event.target as HTMLImageElement
  image.style.display = 'none'
}

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

        <Tabs v-model="activeProgramTab" class="space-y-4">
          <div class="program-workspace-toolbar">
            <div class="program-view-toggle" aria-label="Program sections">
              <button
                type="button"
                class="program-view-tab"
                :class="{ 'program-view-tab--active': activeProgramTab === 'company' }"
                @click="selectProgramTab('company')"
              >
                Our programs
                <span>{{ companyProgramsStore.pagination.totalItems || companyProgramsStore.programs.length }}</span>
              </button>
              <button
                type="button"
                class="program-view-tab"
                :class="{ 'program-view-tab--active': activeProgramTab === 'prosper' }"
                @click="selectProgramTab('prosper')"
              >
                Prosper Mentor Programs
                <span>{{ companyProgramsStore.catalogPrograms.length }}</span>
              </button>
            </div>

            <div class="program-toolbar-actions">
              <div v-if="activeProgramTab === 'company'" class="relative program-search">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  v-model="filters.search"
                  class="pl-9"
                  placeholder="Search"
                  @keyup.enter="loadPrograms"
                />
              </div>
              <div v-else class="relative program-search">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  v-model="catalogFilters.search"
                  class="pl-9"
                  placeholder="Search"
                />
              </div>

              <Button
                variant="outline"
                class="program-refresh-btn"
                :disabled="isRefreshing"
                @click="loadPrograms"
              >
                <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': isRefreshing }" />
                <span class="sr-only">Refresh programs</span>
              </Button>
            </div>
          </div>

          <TabsContent value="company" class="space-y-4">
            <div class="program-filter-row">
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

            <div v-if="companyProgramsStore.isLoading" class="programs-grid">
              <div v-for="i in 6" :key="i" class="program-card">
                <Skeleton class="aspect-video w-full" />
                <div class="space-y-2 p-4">
                  <Skeleton class="h-4 w-3/4" />
                  <Skeleton class="h-3 w-full" />
                  <Skeleton class="h-3 w-5/6" />
                  <div class="flex gap-2 pt-1">
                    <Skeleton class="h-8 w-24 rounded-md" />
                    <Skeleton class="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="!companyProgramsStore.programs.length" class="rounded-lg border border-dashed p-8 text-center">
              <h3 class="text-lg font-medium">No programs yet</h3>
              <p class="mt-2 text-sm text-muted-foreground">
                Create your first company program to start structuring mentorship beyond one-off bookings.
              </p>
            </div>

            <div v-else class="programs-grid">
              <div
                v-for="program in companyProgramsStore.programs"
                :key="program.id"
                class="program-card"
                :class="{ 'program-card--recommended': program.status === 'LIVE' }"
                @click="navigateTo(`/app/admin/programs/${program.id}`)"
              >
                <div class="relative aspect-video overflow-hidden program-card-media">
                  <span class="recommended-badge">
                    {{ statusLabel(program.status) }}
                  </span>
                  <span class="duration-badge">
                    {{ program.maxParticipants || 'Open' }} capacity
                  </span>
                </div>

                <div class="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <button
                      type="button"
                      class="program-name-link"
                      @click.stop="navigateTo(`/app/admin/programs/${program.id}`)"
                    >
                      {{ program.name }}
                    </button>
                    <p class="mt-1 text-[11px] font-medium text-[#8a337f]">
                      {{ companyProgramsStore.catalogJourneyLabel(program.catalogStages, program.catalogJourneySummary) }}
                    </p>
                    <p class="mt-1 line-clamp-3 text-xs text-muted-foreground">
                      {{ program.objective || program.targetAudienceDescription || 'No objective added yet' }}
                    </p>
                  </div>

                  <div class="program-meta">
                    <div class="program-meta-row">
                      <Users class="h-4 w-4" />
                      <span>{{ companyProgramsStore.matchingModeLabel(program.matchingMode) }}</span>
                    </div>
                    <div class="program-meta-row">
                      <CalendarRange class="h-4 w-4" />
                      <span>{{ formatDateRange(program.startsAt, program.endsAt) }}</span>
                    </div>
                    <div class="program-meta-row">
                      <Target class="h-4 w-4" />
                      <span>{{ program.journeyTemplateName || 'Journey not attached' }}</span>
                    </div>
                  </div>

                  <div class="mt-auto flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      class="see-details-btn"
                      @click.stop="navigateTo(`/app/admin/programs/${program.id}`)"
                    >
                      Open Details
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" class="program-menu-btn" :disabled="companyProgramsStore.isSaving" @click.stop>
                          <MoreHorizontal class="h-4 w-4" />
                          <span class="sr-only">Open program actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="navigateTo(`/app/admin/programs/${program.id}`)">
                          <Layers3 class="mr-2 h-4 w-4" />
                          Open Details
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="navigateTo(`/app/admin/programs/${program.id}?tab=employees`)">
                          <Users class="mr-2 h-4 w-4" />
                          Employees
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          :disabled="companyProgramsStore.isSaving"
                          @click="openEditDialog(program)"
                        >
                          <Pencil class="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          :disabled="companyProgramsStore.isSaving || !companyProgramsStore.journeyTemplates.length"
                          @click="openJourneyDialog(program.id, program.journeyTemplateId)"
                        >
                          <Target class="mr-2 h-4 w-4" />
                          Journey
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          v-if="canLaunch(program.status)"
                          :disabled="companyProgramsStore.isSaving"
                          @click="runStatusAction(program.id, 'launch')"
                        >
                          <PlayCircle class="mr-2 h-4 w-4" />
                          Launch
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          v-if="canPause(program.status)"
                          :disabled="companyProgramsStore.isSaving"
                          @click="runStatusAction(program.id, 'pause')"
                        >
                          <PauseCircle class="mr-2 h-4 w-4" />
                          Pause
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          v-if="canComplete(program.status)"
                          :disabled="companyProgramsStore.isSaving"
                          @click="runStatusAction(program.id, 'complete')"
                        >
                          <Trophy class="mr-2 h-4 w-4" />
                          Complete
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          v-if="canCancel(program.status)"
                          :disabled="companyProgramsStore.isSaving"
                          class="text-destructive focus:text-destructive"
                          @click="runStatusAction(program.id, 'cancel')"
                        >
                          <StopCircle class="mr-2 h-4 w-4" />
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prosper" class="space-y-4">
            <Alert v-if="companyProgramsStore.catalogProgramsError" variant="destructive">
              <AlertDescription>{{ companyProgramsStore.catalogProgramsError }}</AlertDescription>
            </Alert>

            <div v-if="companyProgramsStore.catalogProgramsLoading" class="programs-grid">
              <div v-for="i in 6" :key="i" class="program-card">
                <Skeleton class="aspect-video w-full" />
                <div class="space-y-2 p-4">
                  <Skeleton class="h-4 w-3/4" />
                  <Skeleton class="h-3 w-full" />
                  <Skeleton class="h-3 w-5/6" />
                  <div class="flex gap-2 pt-1">
                    <Skeleton class="h-8 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="!filteredCatalogPrograms.length" class="rounded-lg border border-dashed p-8 text-center">
              <h3 class="text-lg font-medium">No Prosper mentor programs found</h3>
              <p class="mt-2 text-sm text-muted-foreground">
                Try a different search term or refresh the catalog.
              </p>
            </div>

            <div v-else class="programs-grid">
              <div
                v-for="program in filteredCatalogPrograms"
                :key="program.id"
                class="program-card"
                @click="navigateTo(`/app/mentors/programs/${program.id}`)"
              >
                <div class="relative aspect-video overflow-hidden program-card-media">
                  <img
                    v-if="program.imageUrl"
                    :src="program.imageUrl"
                    :alt="program.name"
                    class="program-card-image"
                    @error="handleProgramImageError"
                  />
                  <span class="recommended-badge">
                    {{ program.status || 'Catalog' }}
                  </span>
                  <span class="duration-badge">
                    {{ catalogMentorLabel(program) }}
                  </span>
                </div>

                <div class="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <button
                      type="button"
                      class="program-name-link"
                      @click.stop="navigateTo(`/app/mentors/programs/${program.id}`)"
                    >
                      {{ program.name }}
                    </button>
                    <p class="mt-1 text-[11px] font-medium text-[#8a337f]">
                      Prosper mentor program
                    </p>
                    <p class="mt-1 line-clamp-3 text-xs text-muted-foreground">
                      {{ program.description || 'ProsperMentor catalog program' }}
                    </p>
                  </div>

                  <div class="program-meta">
                    <div class="program-meta-row">
                      <Users class="h-4 w-4" />
                      <span>{{ catalogMentorLabel(program) }} attached</span>
                    </div>
                    <div class="program-meta-row">
                      <Target class="h-4 w-4" />
                      <span>{{ catalogFocusLabel(program) }}</span>
                    </div>
                    <div class="program-meta-row">
                      <Layers3 class="h-4 w-4" />
                      <span>{{ program.orderId ? `Catalog order ${program.orderId}` : 'Prosper catalog' }}</span>
                    </div>
                  </div>

                  <div class="mt-auto flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      class="see-details-btn"
                      @click.stop="navigateTo(`/app/mentors/programs/${program.id}`)"
                    >
                      Open Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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

<style scoped>
.program-workspace-toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 1024px) {
  .program-workspace-toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.program-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.program-search {
  flex: 1 1 auto;
  min-width: 220px;
}

@media (min-width: 1024px) {
  .program-search {
    width: 332px;
  }
}

.program-view-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  border: 1px solid #ead2e4;
  border-radius: 18px;
  background: #fff;
  padding: 6px;
}

.program-view-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  border-radius: 13px;
  color: #6b5b6a;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  padding: 0 18px;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.program-view-tab span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 24px;
  border-radius: 999px;
  background: #f6edf4;
  color: #8a337f;
  font-size: 12px;
  padding: 0 8px;
}

.program-view-tab--active {
  background: #a03b93;
  color: white;
}

.program-view-tab--active span {
  background: rgba(255, 255, 255, 0.22);
  color: white;
}

.program-refresh-btn {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  padding: 0;
}

.program-filter-row {
  display: flex;
  justify-content: flex-end;
}

.program-filter-row > * {
  width: 220px;
}

.programs-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 16px;
}

@media (min-width: 768px) {
  .programs-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .programs-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.program-card {
  display: flex;
  min-height: 100%;
  cursor: pointer;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.program-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.program-card--recommended {
  border-color: rgba(160, 59, 147, 0.32);
  box-shadow: 0 18px 48px -24px rgba(160, 59, 147, 0.45);
}

.program-card-media {
  background: linear-gradient(135deg, #6b21a8 0%, #9333ea 60%, #c026d3 100%);
}

.program-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.program-card:hover .program-card-image {
  transform: scale(1.05);
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

.program-name-link {
  color: #1d4ed8;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  text-align: left;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.program-name-link:hover {
  color: #1e40af;
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
  height: 32px;
  background-color: #a03b93;
  color: white;
  font-size: 12px;
  padding: 0 14px;
}

.see-details-btn:hover {
  background-color: #882f7c;
}

.program-menu-btn {
  width: 32px;
  height: 32px;
  border-color: #ead2e4;
  color: #8a337f;
}

.program-menu-btn:hover {
  background-color: #fcf4fa;
  color: #8a337f;
}

@media (max-width: 640px) {
  .program-toolbar-actions,
  .program-view-toggle {
    width: 100%;
  }

  .program-view-tab {
    flex: 1;
    padding: 0 10px;
  }

  .program-filter-row,
  .program-filter-row > * {
    width: 100%;
  }
}
</style>
