import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  COMPANY_ADMIN_WALKTHROUGH_TASKS,
  COMPANY_ADMIN_WALKTHROUGH_VERSION,
  type CompanyWalkthroughProgress,
  type CompanyWalkthroughTaskId,
  type CompanyWalkthroughTourId,
} from '@/types/company-walkthrough'

const buildStorageKey = (companyId: string, userId: string) =>
  `prosper:company-admin-walkthrough:${COMPANY_ADMIN_WALKTHROUGH_VERSION}:${companyId}:${userId}`

const createEmptyProgress = (companyId: string, userId: string): CompanyWalkthroughProgress => ({
  version: COMPANY_ADMIN_WALKTHROUGH_VERSION,
  companyId,
  userId,
  introDismissed: false,
  completedTaskIds: [],
  completedTourIds: [],
  lastSeenAt: null,
})

const uniqueValues = <T extends string>(values: T[]) => [...new Set(values)]

export const useCompanyWalkthroughStore = defineStore('company-walkthrough', () => {
  const progress = ref<CompanyWalkthroughProgress | null>(null)
  const activeTourId = ref<CompanyWalkthroughTourId | null>(null)
  const isLoaded = ref(false)

  const tasks = computed(() => COMPANY_ADMIN_WALKTHROUGH_TASKS)
  const completedTaskIds = computed(() => new Set(progress.value?.completedTaskIds || []))
  const completedTourIds = computed(() => new Set(progress.value?.completedTourIds || []))
  const completedTasks = computed(() => tasks.value.filter(task => completedTaskIds.value.has(task.id)))
  const pendingTasks = computed(() => tasks.value.filter(task => !completedTaskIds.value.has(task.id)))
  const completionPercent = computed(() => {
    if (!tasks.value.length) return 0
    return Math.round((completedTasks.value.length / tasks.value.length) * 100)
  })
  const shouldAutostartIntro = computed(() =>
    isLoaded.value &&
    Boolean(progress.value) &&
    !progress.value?.introDismissed &&
    !completedTourIds.value.has('admin-dashboard-overview'),
  )

  const saveProgress = () => {
    if (!progress.value || typeof window === 'undefined') return
    progress.value.lastSeenAt = new Date().toISOString()
    localStorage.setItem(
      buildStorageKey(progress.value.companyId, progress.value.userId),
      JSON.stringify(progress.value),
    )
  }

  const loadProgress = (companyId: string, userId: string) => {
    if (!companyId || !userId || typeof window === 'undefined') {
      progress.value = companyId && userId ? createEmptyProgress(companyId, userId) : null
      isLoaded.value = true
      return progress.value
    }

    const storageKey = buildStorageKey(companyId, userId)
    const storedValue = localStorage.getItem(storageKey)

    if (!storedValue) {
      progress.value = createEmptyProgress(companyId, userId)
      isLoaded.value = true
      saveProgress()
      return progress.value
    }

    try {
      const parsed = JSON.parse(storedValue) as Partial<CompanyWalkthroughProgress>
      progress.value = {
        ...createEmptyProgress(companyId, userId),
        ...parsed,
        version: COMPANY_ADMIN_WALKTHROUGH_VERSION,
        companyId,
        userId,
        completedTaskIds: uniqueValues((parsed.completedTaskIds || []) as CompanyWalkthroughTaskId[]),
        completedTourIds: uniqueValues((parsed.completedTourIds || []) as CompanyWalkthroughTourId[]),
      }
    } catch {
      progress.value = createEmptyProgress(companyId, userId)
      saveProgress()
    }

    isLoaded.value = true
    return progress.value
  }

  const markTaskComplete = (taskId: CompanyWalkthroughTaskId) => {
    if (!progress.value) return
    progress.value.completedTaskIds = uniqueValues([...progress.value.completedTaskIds, taskId])
    saveProgress()
  }

  const completeTour = (tourId: CompanyWalkthroughTourId) => {
    if (!progress.value) return
    const task = tasks.value.find(item => item.tourId === tourId)
    progress.value.completedTourIds = uniqueValues([...progress.value.completedTourIds, tourId])
    progress.value.introDismissed = true
    if (task) markTaskComplete(task.id)
    saveProgress()
    activeTourId.value = null
  }

  const dismissIntro = () => {
    if (!progress.value) return
    progress.value.introDismissed = true
    saveProgress()
    activeTourId.value = null
  }

  const startTour = (tourId: CompanyWalkthroughTourId) => {
    activeTourId.value = tourId
  }

  const clearActiveTour = () => {
    activeTourId.value = null
  }

  const resetProgress = () => {
    if (!progress.value) return
    progress.value = createEmptyProgress(progress.value.companyId, progress.value.userId)
    saveProgress()
  }

  return {
    progress,
    activeTourId,
    isLoaded,
    tasks,
    completedTasks,
    pendingTasks,
    completionPercent,
    shouldAutostartIntro,
    loadProgress,
    markTaskComplete,
    completeTour,
    dismissIntro,
    startTour,
    clearActiveTour,
    resetProgress,
  }
})
