<script setup lang="ts">
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import type { JourneyTemplateUpsertPayload } from '@/http/requests/app/companyPrograms'
import JourneyTemplateEditor from '@/components/app/admin/JourneyTemplateEditor.vue'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { ArrowLeft, GitBranch, Layers3, Route } from 'lucide-vue-next'

definePageMeta({
  title: 'Create Journey Template',
  description: 'Author a guided journey template for company programs',
  requiresAuth: true,
  permissions: ['admin:programs'],
})

const companyProgramsStore = useCompanyProgramsStore()

const saveTemplate = async (payload: JourneyTemplateUpsertPayload) => {
  try {
    const created = await companyProgramsStore.createJourneyTemplate(payload)
    if (created?.id) {
      await navigateTo(`/app/admin/journey-templates/${created.id}`)
      return
    }
    await navigateTo('/app/admin/journey-templates')
  } catch {
    // store already handles toast
  }
}
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Create Journey Template</h1>
        <p class="text-sm text-muted-foreground">
          Define the milestone path, step types, and dependencies that company programs can attach for guided mentorship execution.
        </p>
      </div>

      <Button variant="outline" @click="navigateTo('/app/admin/journey-templates')">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back to Templates
      </Button>
    </div>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
      <Card>
        <CardHeader>
          <CardTitle>Template Builder</CardTitle>
          <CardDescription>
            Start with the outcome you want employees to reach, then model the milestones and step dependencies that should unlock along the way.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JourneyTemplateEditor
            :is-saving="companyProgramsStore.journeyTemplateSaving"
            submit-label="Create journey template"
            cancel-label="Back to templates"
            @submit="saveTemplate"
            @cancel="navigateTo('/app/admin/journey-templates')"
          />
        </CardContent>
      </Card>

      <div class="space-y-4">
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-base">How it fits</CardTitle>
            <CardDescription>Templates are reusable and attach directly to company programs.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3 text-sm text-muted-foreground">
            <div class="flex items-start gap-3">
              <Layers3 class="mt-0.5 h-4 w-4 text-foreground" />
              <p>Templates sit above session booking. They define the milestone structure employees move through across a company program.</p>
            </div>
            <div class="flex items-start gap-3">
              <Route class="mt-0.5 h-4 w-4 text-foreground" />
              <p>Step order plus dependencies decide which milestones become ready next when employees complete reflections, action items, and mentor sessions.</p>
            </div>
            <div class="flex items-start gap-3">
              <GitBranch class="mt-0.5 h-4 w-4 text-foreground" />
              <p>If you do not define dependencies manually, the system will create a simple linear path from the step order you set here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
