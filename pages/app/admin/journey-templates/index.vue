<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Eye, Pencil, Plus, RefreshCw, Route, Sparkles } from 'lucide-vue-next'

definePageMeta({
  title: 'Journey Templates',
  description: 'Create and manage guided journey templates',
  requiresAuth: true,
  permissions: ['admin:programs'],
})

const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()

const templates = computed(() => companyProgramsStore.adminJourneyTemplates)
const activeTemplates = computed(() => templates.value.filter(template => template.active !== false))

const loadTemplates = async () => {
  try {
    await companyProgramsStore.loadAdminJourneyTemplates()
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load journey templates')
  }
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  loadTemplates()
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Journey Templates</h1>
        <p class="text-sm text-muted-foreground">
          Author the guided milestone templates that company programs can attach and run for employees.
        </p>
      </div>

      <div class="flex gap-2">
        <Button variant="outline" @click="loadTemplates" :disabled="companyProgramsStore.adminJourneyTemplatesLoading">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': companyProgramsStore.adminJourneyTemplatesLoading }" />
          Refresh
        </Button>
        <Button @click="navigateTo('/app/admin/journey-templates/new')">
          <Plus class="mr-2 h-4 w-4" />
          New Journey Template
        </Button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Total Templates</CardDescription>
          <CardTitle class="text-3xl">{{ templates.length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Active Templates</CardDescription>
          <CardTitle class="text-3xl">{{ activeTemplates.length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Total Milestones</CardDescription>
          <CardTitle class="text-3xl">{{ templates.reduce((count, template) => count + Number(template.stepCount || 0), 0) }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Template Workspace</CardTitle>
        <CardDescription>
          Keep your journey catalog aligned with the programs, milestones, and dependency patterns you want company cohorts to follow.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Alert v-if="companyProgramsStore.adminJourneyTemplatesError" variant="destructive">
          <AlertDescription>{{ companyProgramsStore.adminJourneyTemplatesError }}</AlertDescription>
        </Alert>

        <div v-if="companyProgramsStore.adminJourneyTemplatesLoading" class="space-y-3">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>

        <div v-else-if="!templates.length" class="rounded-lg border border-dashed p-8 text-center">
          <h3 class="text-lg font-medium">No journey templates yet</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Create a template so company programs can run with milestones, dependencies, and guided employee follow-through.
          </p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Milestones</TableHead>
              <TableHead>Dependencies</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="template in templates" :key="template.id">
              <TableCell>
                <div class="space-y-1">
                  <div class="font-medium">{{ template.name }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ template.description || template.programType || 'No description added yet' }}
                  </div>
                  <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span v-if="template.programType" class="inline-flex items-center gap-1">
                      <Sparkles class="h-3.5 w-3.5" />
                      {{ template.programType }}
                    </span>
                    <span v-if="template.defaultDurationWeeks" class="inline-flex items-center gap-1">
                      <Route class="h-3.5 w-3.5" />
                      {{ template.defaultDurationWeeks }} weeks
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="template.active === false ? 'outline' : 'default'">
                  {{ template.active === false ? 'Inactive' : 'Active' }}
                </Badge>
              </TableCell>
              <TableCell>{{ template.stepCount || 0 }}</TableCell>
              <TableCell>{{ template.dependencyCount || 0 }}</TableCell>
              <TableCell>{{ formatDate(template.updatedAt || template.createdAt) }}</TableCell>
              <TableCell>
                <div class="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" @click="navigateTo(`/app/admin/journey-templates/view/${template.id}`)">
                    <Eye class="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" @click="navigateTo(`/app/admin/journey-templates/${template.id}`)">
                    <Pencil class="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
