<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import type { JourneyTemplateUpsertPayload } from '@/http/requests/app/companyPrograms'
import JourneyTemplateEditor from '@/components/app/admin/JourneyTemplateEditor.vue'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { ArrowLeft, CalendarRange, Eye, GitBranch, Layers3 } from 'lucide-vue-next'

definePageMeta({
  title: 'Edit Journey Template',
  description: 'Manage a guided journey template',
  requiresAuth: true,
  permissions: ['admin:programs'],
})

const route = useRoute()
const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()

const templateId = computed(() => String(route.params.id || ''))
const template = computed(() => companyProgramsStore.selectedJourneyTemplate)

const loadTemplate = async () => {
  if (!templateId.value) {
    return
  }

  try {
    await companyProgramsStore.loadJourneyTemplateDetail(templateId.value)
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load journey template')
  }
}

const saveTemplate = async (payload: JourneyTemplateUpsertPayload) => {
  try {
    await companyProgramsStore.updateJourneyTemplate(templateId.value, payload)
  } catch {
    // store already handles toast
  }
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadTemplate()
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Edit Journey Template</h1>
        <p class="text-sm text-muted-foreground">
          Refine milestones, step unlock logic, and the guidance path attached to company programs.
        </p>
      </div>

      <div class="flex gap-2">
        <Button variant="outline" @click="navigateTo('/app/admin/journey-templates')">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back to Templates
        </Button>
        <Button variant="outline" @click="navigateTo(`/app/admin/journey-templates/view/${templateId}`)">
          <Eye class="mr-2 h-4 w-4" />
          View Template
        </Button>
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
      <Card>
        <CardHeader>
          <CardTitle>{{ template?.name || 'Template details' }}</CardTitle>
          <CardDescription>
            Updates here affect the reusable guided journey catalog for future company-program attachment and execution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert v-if="companyProgramsStore.journeyTemplateDetailError" variant="destructive">
            <AlertDescription>{{ companyProgramsStore.journeyTemplateDetailError }}</AlertDescription>
          </Alert>

          <div v-else-if="companyProgramsStore.journeyTemplateDetailLoading" class="space-y-3">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-24 w-full" />
            <Skeleton class="h-24 w-full" />
            <Skeleton class="h-12 w-full" />
          </div>

          <JourneyTemplateEditor
            v-else-if="template"
            :template="template"
            :is-saving="companyProgramsStore.journeyTemplateSaving"
            submit-label="Save template"
            cancel-label="Back to templates"
            @submit="saveTemplate"
            @cancel="navigateTo('/app/admin/journey-templates')"
          />

          <div v-else class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Template not found.
          </div>
        </CardContent>
      </Card>

      <div v-if="template" class="space-y-4">
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-base">Template snapshot</CardTitle>
            <CardDescription>Quick metadata for the current version of this journey.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3 text-sm text-muted-foreground">
            <div class="flex items-start gap-3">
              <Layers3 class="mt-0.5 h-4 w-4 text-foreground" />
              <p>{{ template.stepCount || 0 }} milestones across template version {{ template.templateVersion || 1 }}.</p>
            </div>
            <div class="flex items-start gap-3">
              <GitBranch class="mt-0.5 h-4 w-4 text-foreground" />
              <p>{{ template.dependencyCount || 0 }} explicit dependencies shaping the unlock path.</p>
            </div>
            <div class="flex items-start gap-3">
              <CalendarRange class="mt-0.5 h-4 w-4 text-foreground" />
              <p>Updated {{ formatDate(template.updatedAt || template.createdAt) }}.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
