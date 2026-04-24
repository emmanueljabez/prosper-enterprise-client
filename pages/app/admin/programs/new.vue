<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import type { CreateCompanyProgramPayload } from '@/http/requests/app/companyPrograms'
import { useAppToast } from '@/composables/services/toastService'
import CompanyProgramEditor from '@/components/app/admin/CompanyProgramEditor.vue'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { ArrowLeft, Compass, Layers3, Users } from 'lucide-vue-next'

definePageMeta({
  title: 'Create Company Program',
  description: 'Build a company mentorship journey from Prosper programs',
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

const isLoading = ref(false)
const loadError = ref<string | null>(null)

const loadEditorDependencies = async () => {
  if (!companyId.value) {
    loadError.value = 'Company context is missing for this account. Refresh your profile or sign in again.'
    return
  }

  isLoading.value = true
  loadError.value = null

  try {
    await Promise.all([
      companyProgramsStore.loadJourneyTemplates(),
      companyProgramsStore.loadCatalogPrograms(),
    ])
  } catch (error: any) {
    loadError.value = error?.response?.data?.message || error?.message || 'Failed to load program creation data'
    toast.error(loadError.value)
  } finally {
    isLoading.value = false
  }
}

const saveProgram = async (payload: CreateCompanyProgramPayload) => {
  if (!companyId.value) {
    toast.error('Company context is missing')
    return
  }

  try {
    await companyProgramsStore.createCompanyProgram(companyId.value, payload)
    await navigateTo('/app/admin/programs')
  } catch {
    // store already handles toast
  }
}

watch(() => companyId.value, value => {
  if (value) {
    loadEditorDependencies()
  }
}, { immediate: true })
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Create Company Program</h1>
        <p class="text-sm text-muted-foreground">
          Assemble an employer journey from Prosper programs, mentor supply, and guided milestones.
        </p>
      </div>

      <Button variant="outline" @click="navigateTo('/app/admin/programs')">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back to Programs
      </Button>
    </div>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
      <Card>
        <CardHeader>
          <CardTitle>Program Setup</CardTitle>
          <CardDescription>
            Start with one or more Prosper programs, then shape the cohort around matching, journey guidance, and capacity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert v-if="loadError" variant="destructive">
            <AlertDescription>{{ loadError }}</AlertDescription>
          </Alert>

          <div v-else-if="isLoading" class="space-y-3">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-24 w-full" />
            <Skeleton class="h-24 w-full" />
            <Skeleton class="h-12 w-full" />
          </div>

          <CompanyProgramEditor
            v-else
            mode="create"
            :catalog-programs="companyProgramsStore.catalogPrograms"
            :journey-templates="companyProgramsStore.journeyTemplates"
            :is-saving="companyProgramsStore.isSaving"
            submit-label="Create company program"
            cancel-label="Back to programs"
            @submit="saveProgram"
            @cancel="navigateTo('/app/admin/programs')"
          />
        </CardContent>
      </Card>

      <div class="space-y-4">
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-base">What you are creating</CardTitle>
            <CardDescription>A company program wraps Prosper offerings for one employer cohort.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3 text-sm text-muted-foreground">
            <div class="flex items-start gap-3">
              <Layers3 class="mt-0.5 h-4 w-4 text-foreground" />
              <p>Select one or more Prosper programs and order them as a journey for the employer.</p>
            </div>
            <div class="flex items-start gap-3">
              <Users class="mt-0.5 h-4 w-4 text-foreground" />
              <p>The mentor pool is derived from the programs you attach, then refined during matching.</p>
            </div>
            <div class="flex items-start gap-3">
              <Compass class="mt-0.5 h-4 w-4 text-foreground" />
              <p>Attach a guided journey template when you want milestones, check-ins, and action tracking from day one.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
