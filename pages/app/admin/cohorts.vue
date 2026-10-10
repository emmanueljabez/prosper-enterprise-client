<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import type { CreateCompanyProgramPayload } from '@/http/requests/app/companyPrograms'
import { useAppToast } from '@/composables/services/toastService'
import CompanyProgramEditor from '@/components/app/admin/CompanyProgramEditor.vue'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { ArrowLeft, ArrowRight, CalendarCheck2, GitBranch, Layers3, Users } from 'lucide-vue-next'

definePageMeta({
  title: 'Cohorts & Circles',
  description: 'Create cohorts and mentorship circles for company programs.',
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

const creationChecklist = [
  'Choose the Prosper program stages that shape the cohort journey.',
  'Set the target audience, capacity, and launch window for this group.',
  'Pick how mentor matching should happen before employees begin sessions.',
  'Attach a journey template when the cohort needs guided milestones.',
]

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
    loadError.value = error?.response?.data?.message || error?.message || 'Failed to load cohort creation data'
    toast.error(loadError.value)
  } finally {
    isLoading.value = false
  }
}

const saveCohort = async (payload: CreateCompanyProgramPayload) => {
  if (!companyId.value) {
    toast.error('Company context is missing')
    return
  }

  try {
    const created = await companyProgramsStore.createCompanyProgram(companyId.value, payload)
    if (created?.id) {
      await navigateTo(`/app/admin/programs/${created.id}`)
      return
    }

    await navigateTo('/app/admin/programs')
  } catch {
    // store already handles the toast
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
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <Badge variant="secondary" class="mb-3">People Management</Badge>
        <h1 class="text-2xl font-semibold tracking-tight">Create Cohort</h1>
        <p class="max-w-3xl text-sm text-muted-foreground">
          Create the employer cohort, attach Prosper program stages, and prepare the group for matching and session delivery.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button variant="outline" @click="navigateTo('/app/admin/programs')">
          <ArrowLeft class="mr-2 h-4 w-4" />
          View Programs
        </Button>
        <Button variant="outline" @click="navigateTo('/app/admin/employees')">
          <Users class="mr-2 h-4 w-4" />
          Manage Mentees
        </Button>
        <Button variant="outline" @click="navigateTo('/app/admin/matches')">
          <GitBranch class="mr-2 h-4 w-4" />
          Review Matching
        </Button>
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr),340px]">
      <Card>
        <CardHeader>
          <CardTitle>Cohort Details</CardTitle>
          <CardDescription>
            Cohorts are saved through the company program workflow so matching, journeys, sessions, and reports stay connected.
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
            submit-label="Create cohort"
            cancel-label="View programs"
            @submit="saveCohort"
            @cancel="navigateTo('/app/admin/programs')"
          />
        </CardContent>
      </Card>

      <div class="space-y-4">
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-base">Cohort Launch Path</CardTitle>
            <CardDescription>
              This page creates the cohort record. Mentees and matching continue in their dedicated workspaces.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-for="item in creationChecklist" :key="item" class="flex gap-3 text-sm">
              <CalendarCheck2 class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span class="text-muted-foreground">{{ item }}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-base">After Saving</CardTitle>
            <CardDescription>Use these workspaces to move the cohort from setup into delivery.</CardDescription>
          </CardHeader>
          <CardContent class="grid gap-2">
            <Button variant="outline" class="justify-between" @click="navigateTo('/app/admin/employees')">
              Assign mentees
              <ArrowRight class="h-4 w-4" />
            </Button>
            <Button variant="outline" class="justify-between" @click="navigateTo('/app/admin/matches')">
              Prepare matching
              <ArrowRight class="h-4 w-4" />
            </Button>
            <Button variant="outline" class="justify-between" @click="navigateTo('/app/admin/reports')">
              Track progress
              <ArrowRight class="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-base">Program Connection</CardTitle>
            <CardDescription>
              Keep the cohort connected to program stages, journey templates, mentor capacity, and reporting.
            </CardDescription>
          </CardHeader>
          <CardContent class="flex gap-3 text-sm text-muted-foreground">
            <Layers3 class="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
            <p>After creation, use the program workspace to review details, add participants, and move the cohort toward launch.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
