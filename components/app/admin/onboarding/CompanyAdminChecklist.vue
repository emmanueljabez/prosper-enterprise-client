<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, CheckCircle2, Circle, RotateCcw, X } from 'lucide-vue-next'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyWalkthroughStore } from '@/store/modules/company-walkthrough'
import type { CompanyWalkthroughTask } from '@/types/company-walkthrough'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const authStore = useAuthStore()
const walkthroughStore = useCompanyWalkthroughStore()
const { completedTasks, completionPercent, progress, tasks } = storeToRefs(walkthroughStore)
const route = useRoute()
const router = useRouter()

const parseStoredJson = (key: string) => {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = localStorage.getItem(key)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    return null
  }
}

const storedProfile = computed(() => parseStoredJson('profile'))
const storedLoggedInUser = computed(() => parseStoredJson('loggedInUser'))

const companyId = computed(() =>
  String(
    authStore.loggedInUser?.companyId ||
      storedProfile.value?.company?.id ||
      storedProfile.value?.companyId ||
      storedProfile.value?.company_id ||
      storedLoggedInUser.value?.company?.id ||
      storedLoggedInUser.value?.companyId ||
      '',
  ).trim(),
)

const userId = computed(() =>
  String(
    authStore.loggedInUser?.id ||
      storedProfile.value?.id ||
      storedProfile.value?.profileId ||
      storedLoggedInUser.value?.id ||
      '',
  ).trim(),
)

const completedTaskIds = computed(() => new Set(progress.value?.completedTaskIds || []))
const completedCount = computed(() => completedTasks.value.length)
const totalCount = computed(() => tasks.value.length)
const isChecklistComplete = computed(() => completedCount.value === totalCount.value)
const shouldShowChecklist = computed(() => !isChecklistComplete.value || !progress.value?.introDismissed)

const loadProgress = () => {
  if (!companyId.value || !userId.value) {
    return
  }

  walkthroughStore.loadProgress(companyId.value, userId.value)
}

const openTask = async (task: CompanyWalkthroughTask) => {
  loadProgress()

  if (route.path !== task.route) {
    await router.push(task.route)
  }

  walkthroughStore.startTour(task.tourId)
}

const replayDashboardTour = async () => {
  loadProgress()

  if (route.path !== '/app/admin') {
    await router.push('/app/admin')
  }

  walkthroughStore.startTour('admin-dashboard-overview')
}

const dismissChecklist = () => {
  loadProgress()
  walkthroughStore.dismissIntro()
}

onMounted(loadProgress)

watch([companyId, userId], loadProgress)
</script>

<template>
  <Card v-if="shouldShowChecklist" class="dashboard-card border-[#e7d9e4] bg-[#fffafe]" data-walkthrough="admin-dashboard-checklist">
    <CardHeader class="space-y-3 p-4 pb-2">
      <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <CardTitle class="text-sm font-semibold text-[#1f2430]">Company setup checklist</CardTitle>
            <Badge :variant="isChecklistComplete ? 'success' : 'secondary'">
              {{ completedCount }} of {{ totalCount }}
            </Badge>
          </div>
          <CardDescription class="max-w-2xl text-xs leading-relaxed text-[#6f7888]">
            Finish the first admin pass through ProsperMentor so your company can launch a program, invite mentees, match mentors, and monitor outcomes.
          </CardDescription>
        </div>

        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" class="h-8 border-[#d8dce4] text-[#4f5968]" @click="replayDashboardTour">
            <RotateCcw class="h-3.5 w-3.5" />
            Replay
          </Button>
          <Button variant="ghost" size="icon" class="h-8 w-8 text-[#6f7888]" aria-label="Dismiss checklist" @click="dismissChecklist">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs text-[#7c8595]">
          <span>Getting Started</span>
          <span>{{ completionPercent }}%</span>
        </div>
        <Progress :model-value="completionPercent" class="h-2 bg-[#f1e8ef]" />
      </div>
    </CardHeader>

    <CardContent class="grid gap-2 p-4 pt-2 lg:grid-cols-3">
      <button
        v-for="task in tasks"
        :key="task.id"
        type="button"
        class="group flex min-h-[104px] flex-col justify-between rounded-md border bg-white p-3 text-left transition hover:border-[#9a4884]/50 hover:bg-[#fff7fc]"
        :class="completedTaskIds.has(task.id) ? 'border-[#b6dfd1]' : 'border-[#edf0f4]'"
        @click="openTask(task)"
      >
        <span class="flex items-start justify-between gap-3">
          <span>
            <span class="block text-sm font-semibold text-[#1f2430]">{{ task.title }}</span>
            <span class="mt-1 block text-xs leading-relaxed text-[#6f7888]">{{ task.description }}</span>
          </span>
          <CheckCircle2 v-if="completedTaskIds.has(task.id)" class="h-4 w-4 shrink-0 text-[#00856f]" />
          <Circle v-else class="h-4 w-4 shrink-0 text-[#9a4884]" />
        </span>
        <span class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9a4884]">
          {{ task.ctaLabel }}
          <ArrowRight class="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </button>
    </CardContent>
  </Card>
</template>
