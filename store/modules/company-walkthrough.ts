import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import companyApi, {
  type CompanyWalkthroughProgressRecord,
  type UpdateCompanyWalkthroughProgressPayload,
} from '@/http/requests/app/company'
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

const resolveProgressUserId = (
  source: Partial<CompanyWalkthroughProgress> | CompanyWalkthroughProgressRecord | null | undefined,
  fallbackUserId: string,
) => {
  if (source && 'profileId' in source && source.profileId) {
    return source.profileId
  }

  if (source && 'userId' in source && source.userId) {
    return source.userId
  }

  return fallbackUserId
}

const normalizeProgress = (
  companyId: string,
  userId: string,
  source?: Partial<CompanyWalkthroughProgress> | CompanyWalkthroughProgressRecord | null,
): CompanyWalkthroughProgress => ({
  ...createEmptyProgress(companyId, userId),
  ...(source || {}),
  version: COMPANY_ADMIN_WALKTHROUGH_VERSION,
  companyId: String(source?.companyId || companyId),
  userId: String(resolveProgressUserId(source, userId)),
  introDismissed: Boolean(source?.introDismissed),
  completedTaskIds: uniqueValues((source?.completedTaskIds || []) as CompanyWalkthroughTaskId[]),
  completedTourIds: uniqueValues((source?.completedTourIds || []) as CompanyWalkthroughTourId[]),
  lastSeenAt: source?.lastSeenAt || null,
})

const toUpdatePayload = (source: CompanyWalkthroughProgress): UpdateCompanyWalkthroughProgressPayload => ({
  version: COMPANY_ADMIN_WALKTHROUGH_VERSION,
  introDismissed: source.introDismissed,
  completedTaskIds: source.completedTaskIds,
  completedTourIds: source.completedTourIds,
})

export const useCompanyWalkthroughStore = defineStore('company-walkthrough', () => {
  const progress = ref<CompanyWalkthroughProgress | null>(null)
  const activeTourId = ref<CompanyWalkthroughTourId | null>(null)
  const isLoaded = ref(false)
  const syncError = ref<string | null>(null)
  let loadPromise: Promise<CompanyWalkthroughProgress | null> | null = null
  let loadKey: string | null = null

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

  const cacheProgress = () => {
    if (!progress.value || typeof window === 'undefined') return
    progress.value.lastSeenAt = new Date().toISOString()
    localStorage.setItem(
      buildStorageKey(progress.value.companyId, progress.value.userId),
      JSON.stringify(progress.value),
    )
  }

  const syncProgress = async () => {
    if (!progress.value) return

    const snapshot = {
      ...progress.value,
      completedTaskIds: [...progress.value.completedTaskIds],
      completedTourIds: [...progress.value.completedTourIds],
    }

    try {
      const response = await companyApi.updateWalkthroughProgress(snapshot.companyId, toUpdatePayload(snapshot))
      if (response.data.success && response.data.data) {
        progress.value = normalizeProgress(snapshot.companyId, snapshot.userId, response.data.data)
        cacheProgress()
      }
      syncError.value = null
    } catch (error: any) {
      syncError.value = error?.message || 'Unable to sync walkthrough progress.'
    }
  }

  const saveProgress = () => {
    cacheProgress()
    void syncProgress()
  }

  const readCachedProgress = (companyId: string, userId: string) => {
    if (typeof window === 'undefined') return null

    const storedValue = localStorage.getItem(buildStorageKey(companyId, userId))
    if (!storedValue) return null

    try {
      return normalizeProgress(companyId, userId, JSON.parse(storedValue) as Partial<CompanyWalkthroughProgress>)
    } catch {
      return null
    }
  }

  const loadProgress = async (companyId: string, userId: string) => {
    if (!companyId || !userId || typeof window === 'undefined') {
      progress.value = companyId && userId ? createEmptyProgress(companyId, userId) : null
      isLoaded.value = true
      return progress.value
    }

    const storageKey = buildStorageKey(companyId, userId)
    if (loadPromise && loadKey === storageKey) {
      return loadPromise
    }

    loadKey = storageKey
    isLoaded.value = false

    loadPromise = (async () => {
      progress.value = readCachedProgress(companyId, userId) || createEmptyProgress(companyId, userId)

      try {
        const response = await companyApi.getWalkthroughProgress(companyId, COMPANY_ADMIN_WALKTHROUGH_VERSION)
        if (response.data.success && response.data.data) {
          progress.value = normalizeProgress(companyId, userId, response.data.data)
          syncError.value = null
        }
      } catch (error: any) {
        syncError.value = error?.message || 'Unable to load walkthrough progress.'
      } finally {
        cacheProgress()
        isLoaded.value = true
        loadPromise = null
        loadKey = null
      }

      return progress.value
    })()

    return loadPromise
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
    if (task) {
      progress.value.completedTaskIds = uniqueValues([...progress.value.completedTaskIds, task.id])
    }
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
    syncError,
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
