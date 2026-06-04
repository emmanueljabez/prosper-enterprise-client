<script setup lang="ts">
import { computed } from 'vue'
import type { JourneyTemplateRecord } from '@/http/requests/app/companyPrograms'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { CalendarRange, CheckCircle2, Clock3, GitBranch, Layers3, Route } from 'lucide-vue-next'

const props = defineProps<{
  template: JourneyTemplateRecord
}>()

const companyProgramsStore = useCompanyProgramsStore()

const sortedSteps = computed(() =>
  (props.template.steps || [])
    .slice()
    .sort((left, right) => Number(left.defaultSequence || 0) - Number(right.defaultSequence || 0)),
)

const stepTitleByKey = computed(() =>
  new Map(sortedSteps.value.map(step => [step.stepKey, step.title || step.stepKey])),
)

const dependencyRows = computed(() =>
  (props.template.dependencies || []).map(dependency => ({
    ...dependency,
    fromLabel: dependency.fromStepTitle || stepTitleByKey.value.get(dependency.fromStepKey) || dependency.fromStepKey,
    toLabel: dependency.toStepTitle || stepTitleByKey.value.get(dependency.toStepKey) || dependency.toStepKey,
  })),
)

const formatDueOffset = (value?: number | null) => {
  if (value == null) {
    return 'Flexible timing'
  }

  if (value === 0) {
    return 'Due immediately when unlocked'
  }

  return `Due ${value} day${value === 1 ? '' : 's'} after unlock`
}
</script>

<template>
  <div class="space-y-6">
    <Card>
      <div v-if="template.coverImageUrl" class="overflow-hidden rounded-t-xl border-b">
        <img
          :src="template.coverImageUrl"
          alt="Journey template cover"
          class="h-52 w-full object-cover"
        >
      </div>
      <CardHeader class="space-y-4">
        <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div class="space-y-2">
            <CardTitle>{{ template.name }}</CardTitle>
            <CardDescription>
              {{ template.description || 'No description added yet for this journey template.' }}
            </CardDescription>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <Badge :variant="template.active === false ? 'outline' : 'default'">
              {{ template.active === false ? 'Inactive' : 'Active' }}
            </Badge>
            <Badge v-if="template.programType" variant="secondary">
              {{ template.programType }}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent class="grid gap-4 md:grid-cols-3">
        <div class="rounded-lg border px-4 py-3">
          <div class="flex items-start gap-3">
            <Layers3 class="mt-0.5 h-4 w-4 text-foreground" />
            <div>
              <div class="text-sm font-medium">Milestones</div>
              <p class="text-sm text-muted-foreground">
                {{ template.stepCount || sortedSteps.length || 0 }} authored milestones in this template.
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border px-4 py-3">
          <div class="flex items-start gap-3">
            <GitBranch class="mt-0.5 h-4 w-4 text-foreground" />
            <div>
              <div class="text-sm font-medium">Dependency Graph</div>
              <p class="text-sm text-muted-foreground">
                {{ template.dependencyCount || dependencyRows.length || 0 }} explicit unlock dependencies.
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border px-4 py-3">
          <div class="flex items-start gap-3">
            <CalendarRange class="mt-0.5 h-4 w-4 text-foreground" />
            <div>
              <div class="text-sm font-medium">Default Duration</div>
              <p class="text-sm text-muted-foreground">
                {{ template.defaultDurationWeeks ? `${template.defaultDurationWeeks} weeks` : 'Flexible duration' }}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Milestone Sequence</CardTitle>
        <CardDescription>
          Review the ordered steps employees will move through when this journey template is attached to a company program.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="!sortedSteps.length" class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No steps have been authored yet.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(step, index) in sortedSteps"
            :key="step.id || `${step.stepKey}-${index}`"
            class="rounded-lg border p-4"
          >
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">Step {{ index + 1 }}</Badge>
                  <div class="font-medium">{{ step.title }}</div>
                </div>
                <div class="text-xs text-muted-foreground">
                  Key: {{ step.stepKey }}
                </div>
                <p v-if="step.description" class="text-sm text-muted-foreground">
                  {{ step.description }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Route class="mr-1 h-3 w-3" />
                  {{ companyProgramsStore.journeyStepTypeLabel(step.stepType) }}
                </Badge>
                <Badge :variant="step.required === false ? 'outline' : 'default'">
                  <CheckCircle2 class="mr-1 h-3 w-3" />
                  {{ step.required === false ? 'Optional' : 'Required' }}
                </Badge>
                <Badge variant="outline">
                  <Clock3 class="mr-1 h-3 w-3" />
                  {{ formatDueOffset(step.defaultDueOffsetDays) }}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Dependency Rules</CardTitle>
        <CardDescription>
          These rules control how milestones unlock. If empty, the backend falls back to a simple linear order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="!dependencyRows.length" class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No explicit dependencies. This template will unlock milestones in the authored step order.
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>From Step</TableHead>
              <TableHead>To Step</TableHead>
              <TableHead>Rule</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="dependency in dependencyRows" :key="dependency.id || `${dependency.fromStepKey}-${dependency.toStepKey}`">
              <TableCell>
                <div class="font-medium">{{ dependency.fromLabel }}</div>
                <div class="text-xs text-muted-foreground">{{ dependency.fromStepKey }}</div>
              </TableCell>
              <TableCell>
                <div class="font-medium">{{ dependency.toLabel }}</div>
                <div class="text-xs text-muted-foreground">{{ dependency.toStepKey }}</div>
              </TableCell>
              <TableCell>{{ companyProgramsStore.journeyDependencyTypeLabel(dependency.dependencyType) }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
