<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { CheckCircle2, ClipboardList, RefreshCw, Target, TimerReset } from 'lucide-vue-next'

definePageMeta({
  title: 'Goals',
  description: 'Program goals and follow-through workspace',
  requiresAuth: true,
  permissions: ['profile:view'],
})

const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()

const allActionItems = computed(() =>
  companyProgramsStore.employeeJourneys.flatMap(journey =>
    journey.actionItems.map(actionItem => ({
      ...actionItem,
      programName: journey.programName,
      companyName: journey.companyName,
      mentorName: journey.mentorAssignment?.mentorName || null,
      progressPercent: journey.progressPercent,
      latestOutcomeSummary: journey.latestOutcomeSummary,
    })),
  ),
)

const openActionItems = computed(() => allActionItems.value.filter(item => !item.completed))
const completedActionItems = computed(() => allActionItems.value.filter(item => item.completed))

const loadGoalsWorkspace = async () => {
  try {
    await companyProgramsStore.loadMyCompanyProgramJourneys()
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to load goals workspace')
  }
}

const toggleActionItem = async (actionItem: any) => {
  if (!actionItem?.canBeCompletedByEmployee) {
    return
  }

  try {
    await companyProgramsStore.updateJourneyActionItem(actionItem.actionItemId, !actionItem.completed)
  } catch {
    // Store handles toast.
  }
}

const formatDate = (value?: string | null) => {
  if (!value) return 'No due date'

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

onMounted(loadGoalsWorkspace)
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Goals</h1>
        <p class="text-sm text-muted-foreground">
          Turn mentorship sessions into follow-through by tracking the action items attached to your company-program journey.
        </p>
      </div>

      <Button variant="outline" @click="loadGoalsWorkspace" :disabled="companyProgramsStore.employeeJourneysLoading">
        <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': companyProgramsStore.employeeJourneysLoading }" />
        Refresh
      </Button>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Programs In Flight</CardDescription>
          <CardTitle class="text-3xl">{{ companyProgramsStore.employeeJourneys.length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Open Action Items</CardDescription>
          <CardTitle class="text-3xl">{{ openActionItems.length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Completed Follow-Through</CardDescription>
          <CardTitle class="text-3xl">{{ completedActionItems.length }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <Alert v-if="companyProgramsStore.employeeJourneysError" variant="destructive">
      <AlertDescription>{{ companyProgramsStore.employeeJourneysError }}</AlertDescription>
    </Alert>

    <div v-if="companyProgramsStore.employeeJourneysLoading" class="space-y-3">
      <Skeleton class="h-24 w-full" />
      <Skeleton class="h-24 w-full" />
      <Skeleton class="h-24 w-full" />
    </div>

    <div v-else-if="!companyProgramsStore.employeeJourneys.length" class="rounded-lg border border-dashed p-10 text-center">
      <Target class="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 class="mt-4 text-lg font-medium">No goals have been activated yet</h2>
      <p class="mt-2 text-sm text-muted-foreground">
        As soon as your company-program sessions generate action items, they will show up here with due dates and completion controls.
      </p>
    </div>

    <div v-else class="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Current Focus</CardTitle>
          <CardDescription>Your open action items across all active company programs.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-if="!openActionItems.length" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No open action items right now.
          </div>

          <div
            v-for="actionItem in openActionItems"
            :key="actionItem.actionItemId"
            class="rounded-lg border p-4"
          >
            <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div class="space-y-2">
                <div class="font-medium">{{ actionItem.description }}</div>
                <div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{{ actionItem.programName }}</Badge>
                  <Badge variant="outline">{{ actionItem.ownerType }}</Badge>
                  <Badge v-if="actionItem.sessionTitle" variant="outline">{{ actionItem.sessionTitle }}</Badge>
                </div>
                <div class="text-xs text-muted-foreground">
                  Due {{ formatDate(actionItem.dueAt) }}
                  <span v-if="actionItem.mentorName"> · With {{ actionItem.mentorName }}</span>
                </div>
              </div>

              <Button
                v-if="actionItem.canBeCompletedByEmployee"
                size="sm"
                variant="outline"
                @click="toggleActionItem(actionItem)"
                :disabled="companyProgramsStore.isJourneyActionItemSaving(actionItem.actionItemId)"
              >
                Mark Done
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Program Momentum</CardTitle>
            <CardDescription>Progress across your active mentorship journeys.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div
              v-for="journey in companyProgramsStore.employeeJourneys"
              :key="journey.participantId"
              class="rounded-lg border p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="font-medium">{{ journey.programName }}</div>
                  <div class="text-sm text-muted-foreground">{{ journey.companyName || 'Employer program' }}</div>
                </div>
                <Badge variant="outline">{{ journey.progressPercent || 0 }}%</Badge>
              </div>

              <div class="mt-3 h-2 rounded-full bg-muted">
                <div
                  class="h-2 rounded-full bg-primary transition-all"
                  :style="{ width: `${Math.max(0, Math.min(journey.progressPercent || 0, 100))}%` }"
                />
              </div>

              <div class="mt-3 text-xs text-muted-foreground">
                {{ journey.completedSessions || 0 }} completed sessions · {{ journey.openActionItemCount || 0 }} open action items
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently Completed</CardTitle>
            <CardDescription>Follow-through you’ve already closed out.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-if="!completedActionItems.length" class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Completed items will appear here once you start closing goals.
            </div>

            <div
              v-for="actionItem in completedActionItems.slice(0, 5)"
              :key="actionItem.actionItemId"
              class="rounded-lg border p-4"
            >
              <div class="flex items-start gap-3">
                <CheckCircle2 class="mt-0.5 h-4 w-4 text-green-600" />
                <div class="space-y-1">
                  <div class="font-medium">{{ actionItem.description }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ actionItem.programName }} · Completed
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <TimerReset class="h-4 w-4" />
          <AlertDescription>
            These goals come from mentor session outcomes and journey follow-through, not from a separate goal-setting form.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  </div>
</template>
