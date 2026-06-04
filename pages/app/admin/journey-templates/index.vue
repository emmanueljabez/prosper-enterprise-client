<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import type { JourneyTemplateRecord, JourneyTemplateUpsertPayload } from '@/http/requests/app/companyPrograms'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import {
  CheckCircle2,
  Copy,
  Eye,
  Flag,
  GitBranch,
  Pencil,
  Plus,
  RefreshCw,
  Route,
  Users,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Journey Templates',
  description: 'Design and manage structured curriculum pathways for your mentoring pairs.',
  requiresAuth: true,
  permissions: ['admin:programs'],
})

const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()

const templates = computed(() => companyProgramsStore.adminJourneyTemplates)

const sortedTemplates = computed(() =>
  templates.value
    .slice()
    .sort((left, right) => {
      const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime()
      const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime()
      return rightTime - leftTime
    }),
)

const featuredTemplate = computed(() =>
  sortedTemplates.value.find(template => template.active !== false && template.coverImageUrl)
  || sortedTemplates.value.find(template => template.active !== false)
  || sortedTemplates.value[0]
  || null,
)

const secondaryTemplates = computed(() =>
  sortedTemplates.value.filter(template => template.id !== featuredTemplate.value?.id),
)

const activeTemplateCount = computed(() =>
  templates.value.filter(template => template.active !== false).length,
)

const totalMilestones = computed(() =>
  templates.value.reduce((count, template) => count + Number(template.stepCount || 0), 0),
)

const dependencyCoverageRate = computed(() => {
  if (!templates.value.length) return 0
  const templatesWithDependencies = templates.value.filter(template => Number(template.dependencyCount || 0) > 0).length
  return Math.round((templatesWithDependencies / templates.value.length) * 1000) / 10
})

const loadTemplates = async () => {
  try {
    await companyProgramsStore.loadAdminJourneyTemplates()
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load journey templates')
  }
}

const formatRelativeUpdate = (value?: string | null) => {
  if (!value) return 'Updated recently'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Updated recently'

  const diffMs = Math.max(Date.now() - parsed.getTime(), 0)
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1) return 'Updated less than 1 hour ago'
  if (hours < 24) return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  return `Updated ${days} day${days === 1 ? '' : 's'} ago`
}

const templateDurationLabel = (template: JourneyTemplateRecord) => {
  const weeks = Number(template.defaultDurationWeeks || 0)
  if (!weeks) return 'CUSTOM'

  if (weeks >= 4) {
    const months = Math.max(1, Math.round(weeks / 4))
    return `${months} MONTH${months === 1 ? '' : 'S'}`
  }

  return `${weeks} WEEK${weeks === 1 ? '' : 'S'}`
}

const templateDescription = (template: JourneyTemplateRecord) =>
  template.description || 'Structured mentorship pathway for guided employee growth.'

const templateSurfaceStyle = (template: JourneyTemplateRecord) => {
  if (template.coverImageUrl) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(12,16,24,0.05) 0%, rgba(12,16,24,0.58) 100%), url('${template.coverImageUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }

  const gradients = [
    'linear-gradient(135deg, #0b111f 0%, #1f2e3b 50%, #41586a 100%)',
    'linear-gradient(135deg, #092032 0%, #0d3a60 45%, #1f78a6 100%)',
    'linear-gradient(135deg, #172033 0%, #2e3f5c 52%, #687792 100%)',
  ]

  const seed = template.name
    .split('')
    .reduce((sum, character) => sum + character.charCodeAt(0), 0)

  return {
    backgroundImage: gradients[seed % gradients.length],
  }
}

const openTemplate = (templateId: string, mode: 'view' | 'edit') => {
  if (mode === 'view') {
    navigateTo(`/app/admin/journey-templates/view/${templateId}`)
    return
  }

  navigateTo(`/app/admin/journey-templates/${templateId}`)
}

const duplicateTemplate = async (template: JourneyTemplateRecord) => {
  try {
    const detail = await companyProgramsStore.loadJourneyTemplateDetail(template.id)
    if (!detail || !detail.steps?.length) {
      toast.error('Could not duplicate this template because milestones are missing.')
      return
    }

    const payload: JourneyTemplateUpsertPayload = {
      name: `${detail.name} (Copy)`,
      programType: detail.programType || null,
      description: detail.description || null,
      coverImageUrl: detail.coverImageUrl || null,
      defaultDurationWeeks: detail.defaultDurationWeeks || null,
      active: detail.active !== false,
      steps: detail.steps.map(step => ({
        stepKey: step.stepKey,
        title: step.title,
        description: step.description || null,
        stepType: step.stepType,
        required: step.required !== false,
        defaultDueOffsetDays: step.defaultDueOffsetDays ?? null,
        stepConfigJson: step.stepConfigJson || null,
      })),
      dependencies: (detail.dependencies || []).map(dependency => ({
        fromStepKey: dependency.fromStepKey,
        toStepKey: dependency.toStepKey,
        dependencyType: dependency.dependencyType,
      })),
    }

    const cloned = await companyProgramsStore.createJourneyTemplate(payload)
    if (cloned?.id) {
      await navigateTo(`/app/admin/journey-templates/${cloned.id}`)
    }
  } catch {
    // store handles detailed errors
  }
}

onMounted(() => {
  loadTemplates()
})
</script>

<template>
  <div class="journey-template-dashboard mx-auto max-w-[1280px] space-y-5 px-4 py-5 md:px-6">
    <header class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-1">
        <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8f5f82]">Portal / Journey Templates</p>
        <h1 class="text-lg font-semibold tracking-[-0.01em] text-[#1f2430] md:text-xl">Journey Templates</h1>
        <p class="text-sm text-[#687386]">Design and manage structured curriculum pathways for your mentoring pairs.</p>
      </div>

      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          class="h-10 border-[#e5cfe2] px-4 text-sm font-medium text-[#2d3138] hover:bg-[#fbf7fb]"
          :disabled="companyProgramsStore.adminJourneyTemplatesLoading"
          @click="loadTemplates"
        >
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': companyProgramsStore.adminJourneyTemplatesLoading }" />
          Refresh
        </Button>

        <Button class="h-10 bg-primary px-5 text-sm font-medium text-white hover:bg-primary/90" @click="navigateTo('/app/admin/journey-templates/new')">
          <Plus class="mr-2 h-4 w-4" />
          Create New Template
        </Button>
      </div>
    </header>

    <section class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <article class="rounded-xl border border-[#e8e6eb] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8f5f82]">Active Templates</p>
        <p class="mt-2 text-2xl font-semibold text-[#181c22]">{{ activeTemplateCount }}</p>
        <p class="mt-1 text-xs font-semibold text-[#1f7a36]">{{ templates.length ? `Across ${templates.length} total templates` : 'Start by creating your first template' }}</p>
      </article>

      <article class="rounded-xl border border-[#e8e6eb] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8f5f82]">Milestones Defined</p>
            <p class="mt-2 text-2xl font-semibold text-[#181c22]">{{ totalMilestones }}</p>
            <p class="mt-1 text-xs font-semibold text-[#7f2f75]">Reusable guidance map for company programs</p>
          </div>
          <div class="rounded-lg bg-[#edf3ff] p-2 text-[#245ad9]">
            <Users class="h-5 w-5" />
          </div>
        </div>
      </article>

      <article class="rounded-xl border border-[#e8e6eb] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div class="flex items-start justify-between gap-4">
          <div class="w-full">
            <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8f5f82]">Dependency Coverage</p>
            <p class="mt-2 text-2xl font-semibold text-[#181c22]">{{ dependencyCoverageRate }}%</p>
            <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#eceef3]">
              <div class="h-full rounded-full bg-primary" :style="{ width: `${Math.min(100, Math.max(0, dependencyCoverageRate))}%` }" />
            </div>
          </div>
          <div class="rounded-lg bg-[#eaf7ef] p-2 text-[#188647]">
            <CheckCircle2 class="h-5 w-5" />
          </div>
        </div>
      </article>
    </section>

    <Alert v-if="companyProgramsStore.adminJourneyTemplatesError" variant="destructive" class="border-[#f7d0d0] bg-[#fff7f7] text-[#8a2222]">
      <AlertDescription>{{ companyProgramsStore.adminJourneyTemplatesError }}</AlertDescription>
    </Alert>

    <section v-if="companyProgramsStore.adminJourneyTemplatesLoading" class="space-y-3">
      <Skeleton class="h-60 w-full rounded-2xl" />
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton class="h-72 w-full rounded-2xl" />
        <Skeleton class="h-72 w-full rounded-2xl" />
        <Skeleton class="h-72 w-full rounded-2xl" />
      </div>
    </section>

    <section v-else-if="featuredTemplate" class="space-y-5">
      <article class="relative overflow-hidden rounded-2xl border border-[#e2e4e8] p-7 text-white shadow-[0_24px_64px_-34px_rgba(22,29,45,0.58)]">
        <div class="absolute inset-0" :style="templateSurfaceStyle(featuredTemplate)" />
        <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,20,30,0.18)_0%,rgba(16,20,30,0.78)_100%)]" />

        <div class="relative z-[1] flex min-h-[210px] flex-col justify-end">
          <div class="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium">
            <span class="rounded bg-[#b520c9] px-2 py-1 uppercase tracking-[0.08em]">Recommended</span>
            <span class="text-[#d7dbe4]">{{ formatRelativeUpdate(featuredTemplate.updatedAt || featuredTemplate.createdAt) }}</span>
          </div>

          <h2 class="text-[1.4rem] font-semibold leading-tight tracking-[-0.01em] md:text-[1.75rem]">{{ featuredTemplate.name }}</h2>
          <p class="mt-2 max-w-3xl text-sm text-[#e7eaf0]">{{ templateDescription(featuredTemplate) }}</p>

          <div class="mt-6 flex flex-wrap gap-2">
            <Button class="bg-white px-5 text-sm font-semibold text-[#1e2430] hover:bg-white/90" @click="openTemplate(featuredTemplate.id, 'edit')">
              Edit Structure
            </Button>
            <Button variant="outline" class="border-white/35 bg-white/10 px-5 text-sm font-medium text-white hover:bg-white/20" @click="openTemplate(featuredTemplate.id, 'view')">
              View Details
            </Button>
          </div>
        </div>
      </article>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="template in secondaryTemplates"
          :key="template.id"
          class="overflow-hidden rounded-2xl border border-[#e2e4e8] bg-white shadow-[0_10px_32px_-22px_rgba(28,34,48,0.4)]"
        >
          <div class="relative h-44" :style="templateSurfaceStyle(template)">
            <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,16,24,0.08)_0%,rgba(12,16,24,0.6)_100%)]" />
            <Badge variant="secondary" class="absolute right-3 top-3 border-transparent bg-white/90 text-[11px] font-semibold tracking-[0.08em] text-[#7f2f75]">
              {{ templateDurationLabel(template) }}
            </Badge>
          </div>

          <div class="space-y-3 p-4">
            <div>
              <h3 class="text-base font-semibold leading-tight tracking-[-0.01em] text-[#1f2430]">{{ template.name }}</h3>
              <p class="mt-2 text-sm text-[#6b7280]">{{ templateDescription(template) }}</p>
            </div>

            <div class="space-y-1 text-sm text-[#6b7280]">
              <div class="flex items-center gap-2">
                <Flag class="h-3.5 w-3.5 text-[#9f3c93]" />
                <span>{{ template.stepCount || 0 }} milestones defined</span>
              </div>
              <div class="flex items-center gap-2">
                <GitBranch class="h-3.5 w-3.5 text-[#9f3c93]" />
                <span>
                  {{ template.dependencyCount || 0 }} dependency rules
                </span>
              </div>
              <div class="flex items-center gap-2">
                <Route class="h-3.5 w-3.5 text-[#9f3c93]" />
                <span>{{ formatRelativeUpdate(template.updatedAt || template.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-[#eceff3] px-4 py-3">
            <Badge :variant="template.active === false ? 'outline' : 'default'" class="text-[11px] uppercase tracking-[0.08em]">
              {{ template.active === false ? 'Inactive' : 'Active' }}
            </Badge>

            <div class="flex items-center gap-1">
              <Button size="icon" variant="ghost" class="h-8 w-8" @click="openTemplate(template.id, 'edit')">
                <Pencil class="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" class="h-8 w-8" @click="openTemplate(template.id, 'view')">
                <Eye class="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" class="h-8 w-8" @click="duplicateTemplate(template)">
                <Copy class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </article>

        <button
          type="button"
          class="flex h-full min-h-[340px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#d7dce5] bg-[#fbfcfe] p-6 text-center transition-colors hover:border-[#b867ad] hover:bg-[#fdf8fd]"
          @click="navigateTo('/app/admin/journey-templates/new')"
        >
          <div class="rounded-full bg-[#f4e9f3] p-3 text-primary">
            <Plus class="h-5 w-5" />
          </div>
          <p class="text-base font-semibold leading-tight tracking-[-0.01em] text-[#222938]">Create custom template</p>
          <p class="text-sm text-[#7b8390]">Start from scratch with your own cover, milestones, and unlock logic.</p>
        </button>
      </div>
    </section>

    <section v-else class="rounded-2xl border border-dashed border-[#d7dce5] bg-[#fbfcfe] px-8 py-16 text-center">
      <h3 class="text-lg font-semibold text-[#1f2430]">No journey templates yet</h3>
      <p class="mt-2 text-sm text-[#687386]">Create your first template to define structured mentorship pathways and reusable milestones.</p>
      <Button class="mt-5 bg-primary text-white hover:bg-primary/90" @click="navigateTo('/app/admin/journey-templates/new')">
        <Plus class="mr-2 h-4 w-4" />
        Create Journey Template
      </Button>
    </section>
  </div>
</template>

<style scoped>
.journey-template-dashboard {
  font-family: 'Montserrat', 'Inter', ui-sans-serif, system-ui, sans-serif;
  background: linear-gradient(180deg, #f7f7f9 0%, #f4f5f7 100%);
  border-radius: 1rem;
}

@media (max-width: 768px) {
  .journey-template-dashboard {
    border-radius: 0.75rem;
  }
}
</style>
