<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, X } from 'lucide-vue-next'
import {
  VOnboardingStep,
  VOnboardingWrapper,
  useVOnboarding,
  type StepEntity,
} from 'v-onboarding'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyWalkthroughStore } from '@/store/modules/company-walkthrough'
import type { CompanyWalkthroughTourId } from '@/types/company-walkthrough'
import { resolveNextCompanyWalkthroughTask } from '@/utils/company-walkthrough-progression'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const walkthroughStore = useCompanyWalkthroughStore()
const { activeTourId, isLoaded, progress, shouldAutostartIntro, tasks } = storeToRefs(walkthroughStore)
const route = useRoute()
const router = useRouter()

const wrapper = ref<InstanceType<typeof VOnboardingWrapper> | null>(null)
const { start } = useVOnboarding(wrapper)
const lastStartedTourId = ref<CompanyWalkthroughTourId | null>(null)

const TOUR_ROUTE_BY_ID: Record<CompanyWalkthroughTourId, string> = {
  'admin-dashboard-overview': '/app/admin',
  'admin-wallet-overview': '/app/admin',
  'admin-mentees-overview': '/app/admin/employees',
  'admin-programs-overview': '/app/admin/programs',
  'admin-matches-overview': '/app/admin/matches',
  'admin-analytics-overview': '/app/admin/analytics',
}

const TOUR_STEPS: Record<CompanyWalkthroughTourId, StepEntity[]> = {
  'admin-dashboard-overview': [
    {
      attachTo: { element: '[data-walkthrough="admin-dashboard-header"]' },
      content: {
        title: 'Your admin command center',
        description: 'Start here to monitor program delivery, employee journey health, and priorities that need action.',
      },
    },
    {
      attachTo: { element: '[data-walkthrough="admin-dashboard-kpis"]' },
      content: {
        title: 'Program health at a glance',
        description: 'These cards summarize participation, coverage, retention, and session completion for the selected period.',
      },
    },
    {
      attachTo: { element: '[data-walkthrough="admin-dashboard-wallet"]' },
      content: {
        title: 'Session wallet',
        description: 'Track company-funded sessions and jump into billing when the team needs more capacity.',
      },
    },
    {
      attachTo: { element: '[data-walkthrough="admin-dashboard-employee-onboarding"]' },
      content: {
        title: 'Employee onboarding',
        description: 'Use this area to see whether invited mentees are registering and becoming active participants.',
      },
    },
  ],
  'admin-wallet-overview': [
    {
      attachTo: { element: '[data-walkthrough="admin-dashboard-wallet"]' },
      content: {
        title: 'Fund mentoring capacity',
        description: 'The wallet separates purchased, reserved, and available sessions so employer-funded allocation stays visible.',
      },
    },
    {
      attachTo: { element: '[data-walkthrough="admin-nav-billing"]' },
      content: {
        title: 'Billing workspace',
        description: 'Open Billing when you need invoices, payments, subscriptions, or session top-ups.',
      },
    },
  ],
  'admin-mentees-overview': [
    {
      attachTo: { element: '[data-walkthrough="admin-employees-header"]' },
      content: {
        title: 'Mentee management',
        description: 'This is where company employees are invited, imported, reviewed, and funded for mentoring.',
      },
    },
    {
      attachTo: { element: '[data-walkthrough="admin-employees-import"]' },
      content: {
        title: 'Bulk import',
        description: 'Use imports for a cohort launch, then review success and error results before inviting mentees.',
      },
    },
  ],
  'admin-programs-overview': [
    {
      attachTo: { element: '[data-walkthrough="admin-programs-header"]' },
      content: {
        title: 'Company programs',
        description: 'Programs organize participants, goals, mentor matching rules, and journey reporting.',
      },
    },
    {
      attachTo: { element: '[data-walkthrough="admin-programs-create"]' },
      content: {
        title: 'Create the first program',
        description: 'Start with one focused cohort and expand once participants and matching are working cleanly.',
      },
    },
  ],
  'admin-matches-overview': [
    {
      attachTo: { element: '[data-walkthrough="admin-matches-header"]' },
      content: {
        title: 'Mentor matching',
        description: 'Review eligible mentors for a program and assign mentors to active participants.',
      },
    },
    {
      attachTo: { element: '[data-walkthrough="admin-matches-program-selector"]' },
      content: {
        title: 'Select a program',
        description: 'Matching is scoped by program so assignments stay aligned with the company journey.',
      },
    },
  ],
  'admin-analytics-overview': [
    {
      attachTo: { element: '[data-walkthrough="admin-analytics-header"]' },
      content: {
        title: 'Analytics',
        description: 'Use analytics to report adoption, session outcomes, feedback coverage, pulses, and risk signals.',
      },
    },
    {
      attachTo: { element: '[data-walkthrough="admin-analytics-summary"]' },
      content: {
        title: 'Outcome summary',
        description: 'These summaries help HR understand whether the program is creating measurable mentoring momentum.',
      },
    },
  ],
}

const parseStoredJson = (key: string) => {
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

const resolveCompanyId = () => {
  const profile = parseStoredJson('profile')
  const loggedInUser = parseStoredJson('loggedInUser')

  return String(
    authStore.loggedInUser?.companyId ||
      profile?.company?.id ||
      profile?.companyId ||
      profile?.company_id ||
      loggedInUser?.company?.id ||
      loggedInUser?.companyId ||
      '',
  ).trim()
}

const resolveUserId = () => {
  const profile = parseStoredJson('profile')
  const loggedInUser = parseStoredJson('loggedInUser')

  return String(
    authStore.loggedInUser?.id ||
      profile?.id ||
      profile?.profileId ||
      loggedInUser?.id ||
      '',
  ).trim()
}

const isCompanyAdminUser = () => {
  const userRoles = authStore.loggedInUser?.roles || []
  const hasCorporateRole = userRoles.some((role: any) =>
    ['corporate_admin', 'company_admin', 'company'].includes(String(role?.name || role || '').toLowerCase()),
  )

  if (hasCorporateRole) {
    return true
  }

  const storedRole = String(localStorage.getItem('role') || '').toLowerCase()
  return ['corporate_admin', 'company_admin', 'company'].includes(storedRole) || route.path.startsWith('/app/admin')
}

const activeSteps = computed(() => activeTourId.value ? TOUR_STEPS[activeTourId.value] || [] : [])

const waitForFirstStepTarget = async (step: StepEntity | undefined) => {
  if (!step) {
    return false
  }

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const target = typeof step.attachTo.element === 'string'
      ? document.querySelector(step.attachTo.element)
      : typeof step.attachTo.element === 'function'
        ? step.attachTo.element()
        : step.attachTo.element?.value

    if (target) {
      return true
    }

    await new Promise(resolve => window.setTimeout(resolve, 100))
  }

  return false
}

const startEligibleTour = async () => {
  if (!isCompanyAdminUser()) {
    return
  }

  if (!isLoaded.value) {
    const companyId = resolveCompanyId()
    const userId = resolveUserId()
    if (companyId && userId) {
      walkthroughStore.loadProgress(companyId, userId)
    }
  }

  if (!activeTourId.value && route.path === '/app/admin' && shouldAutostartIntro.value) {
    walkthroughStore.startTour('admin-dashboard-overview')
    return
  }

  const tourId = activeTourId.value
  if (!tourId || TOUR_ROUTE_BY_ID[tourId] !== route.path || lastStartedTourId.value === tourId) {
    return
  }

  await nextTick()
  const targetReady = await waitForFirstStepTarget(activeSteps.value[0])
  if (!targetReady || activeTourId.value !== tourId) {
    return
  }

  start()
  lastStartedTourId.value = tourId
}

const startNextPendingTask = async (finishedTourId: CompanyWalkthroughTourId) => {
  const nextTask = resolveNextCompanyWalkthroughTask(
    tasks.value,
    progress.value?.completedTaskIds || [],
    finishedTourId,
  )

  if (!nextTask) {
    return
  }

  if (route.path !== nextTask.route) {
    await router.push(nextTask.route)
  }

  walkthroughStore.startTour(nextTask.tourId)
}

const finishActiveTour = async (exit: () => void) => {
  const tourId = activeTourId.value
  exit()

  if (tourId) {
    walkthroughStore.completeTour(tourId)
    lastStartedTourId.value = null
    await nextTick()
    await startNextPendingTask(tourId)
    return
  }

  lastStartedTourId.value = null
}

const skipActiveTour = (exit: () => void) => {
  exit()
  walkthroughStore.dismissIntro()
  walkthroughStore.clearActiveTour()
  lastStartedTourId.value = null
}

onMounted(() => {
  const companyId = resolveCompanyId()
  const userId = resolveUserId()

  if (companyId && userId) {
    walkthroughStore.loadProgress(companyId, userId)
  }

  startEligibleTour()
})

watch([() => route.path, activeTourId, shouldAutostartIntro, isLoaded], () => {
  if (!activeTourId.value) {
    lastStartedTourId.value = null
  }

  startEligibleTour()
})
</script>

<template>
  <VOnboardingWrapper
    ref="wrapper"
    :steps="activeSteps"
    :options="{
      overlay: {
        padding: 8,
        borderRadius: 8,
      },
      scrollToStep: {
        enabled: true,
        options: { behavior: 'smooth', block: 'center' },
      },
    }"
  >
    <template #default="{ step, next, previous, exit, isFirst, isLast }">
      <VOnboardingStep>
        <div class="company-walkthrough-step">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a4884]">Platform walkthrough</p>
              <h2 class="text-base font-semibold leading-snug text-[#1f2430]">{{ step.content.title }}</h2>
            </div>
            <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0 text-[#6f7888]" aria-label="Skip walkthrough" @click="skipActiveTour(exit)">
              <X class="h-4 w-4" />
            </Button>
          </div>

          <p v-if="step.content.description" class="mt-2 text-sm leading-relaxed text-[#5f6b7a]">
            {{ step.content.description }}
          </p>

          <div class="mt-4 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              class="h-8 border-[#d8dce4] text-[#4f5968]"
              :disabled="isFirst"
              @click="previous"
            >
              <ArrowLeft class="h-3.5 w-3.5" />
              Back
            </Button>
            <Button
              size="sm"
              class="h-8 bg-[#9a4884] text-white hover:bg-[#7f3a6d]"
              @click="isLast ? finishActiveTour(exit) : next()"
            >
              {{ isLast ? 'Finish' : 'Next' }}
              <ArrowRight class="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </VOnboardingStep>
    </template>
  </VOnboardingWrapper>
</template>

<style scoped>
.company-walkthrough-step {
  width: min(340px, calc(100vw - 32px));
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  padding: 14px;
  box-shadow: 0 22px 48px -30px rgba(31, 36, 48, 0.45);
}
</style>
