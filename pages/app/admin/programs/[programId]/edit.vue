<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import type { UpdateCompanyProgramPayload } from '@/http/requests/app/companyPrograms'
import CompanyProgramEditor from '@/components/app/admin/CompanyProgramEditor.vue'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { ArrowLeft, Pencil } from 'lucide-vue-next'

definePageMeta({
  title: 'Edit Company Program',
  description: 'Update a company mentorship program',
  requiresAuth: true,
  permissions: ['admin:programs'],
})

const route = useRoute()
const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()

const { selectedProgram, selectedProgramLoading, selectedProgramError, journeyTemplates, catalogPrograms } = storeToRefs(companyProgramsStore)

const programId = computed(() => String(route.params.programId || ''))
const isLoading = ref(false)
const loadError = ref<string | null>(null)

const loadEditorDependencies = async () => {
  if (!programId.value) {
    loadError.value = 'Program context is missing from this route.'
    return
  }

  isLoading.value = true
  loadError.value = null

  try {
    await Promise.all([
      companyProgramsStore.loadCompanyProgram(programId.value),
      companyProgramsStore.loadJourneyTemplates(),
      companyProgramsStore.loadCatalogPrograms(),
    ])
  } catch (error: any) {
    loadError.value = error?.response?.data?.message || error?.message || 'Failed to load program editor data'
    toast.error(loadError.value)
  } finally {
    isLoading.value = false
  }
}

const saveProgram = async (payload: UpdateCompanyProgramPayload) => {
  if (!programId.value) return

  try {
    await companyProgramsStore.updateCompanyProgram(programId.value, payload)
    await navigateTo(`/app/admin/programs/${programId.value}`)
  } catch {
    // store already handles toast
  }
}

watch(programId, value => {
  if (value) {
    loadEditorDependencies()
  }
}, { immediate: true })
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Edit Company Program</h1>
        <p class="text-sm text-muted-foreground">
          Update naming, journey design, and delivery settings for this program.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button variant="outline" @click="navigateTo(`/app/admin/programs/${programId}`)">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back to Program
        </Button>
        <Button variant="outline" @click="navigateTo('/app/admin/programs')">
          <Pencil class="mr-2 h-4 w-4" />
          All Programs
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Program Configuration</CardTitle>
        <CardDescription>Edit the company program and save changes to return to details.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert v-if="loadError || selectedProgramError" variant="destructive">
          <AlertDescription>{{ loadError || selectedProgramError }}</AlertDescription>
        </Alert>

        <div v-else-if="isLoading || selectedProgramLoading" class="space-y-3">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-24 w-full" />
          <Skeleton class="h-24 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>

        <CompanyProgramEditor
          v-else-if="selectedProgram"
          mode="edit"
          :program="selectedProgram"
          :catalog-programs="catalogPrograms"
          :journey-templates="journeyTemplates"
          :is-saving="companyProgramsStore.isSaving"
          submit-label="Save program"
          cancel-label="Back to program"
          @submit="saveProgram"
          @cancel="navigateTo(`/app/admin/programs/${programId}`)"
        />

        <div v-else class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Program not found.
        </div>
      </CardContent>
    </Card>
  </div>
</template>
