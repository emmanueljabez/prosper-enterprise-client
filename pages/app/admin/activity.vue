<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import dashboardApi, { type DashboardDateFilterParams } from '@/http/requests/app/dashboard'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import ActivityFeed from '@/components/ui/dashboard/ActivityFeed.vue'
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  RefreshCw,
  Users,
  XCircle,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Activity Timeline',
  description: 'Company operational activity timeline',
  requiresAuth: true,
  permissions: ['admin:dashboard:view'],
})

type ActivityResponse = {
  id: string
  type: string
  title?: string | null
  description?: string | null
  timestamp?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  occurredAt?: string | null
  eventAt?: string | null
  date?: string | null
  created_at?: string | null
  updated_at?: string | null
  occurred_at?: string | null
  event_at?: string | null
  priority?: 'high' | 'medium' | 'low'
}

type ActivityItem = Omit<ActivityResponse, 'timestamp' | 'title' | 'description'> & {
  title: string
  description: string
  timestamp: string
  icon: any
  color: string
}

type DashboardDatePreset = 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom'

const activityIconMap: Record<string, any> = {
  employee_registered: Users,
  invite_accepted: CheckCircle,
  session_completed: CheckCircle,
  session_cancelled: XCircle,
  session_requested: AlertTriangle,
  session_confirmed: Calendar,
}

const activityColorMap: Record<string, string> = {
  employee_registered: 'text-blue-600',
  invite_accepted: 'text-green-600',
  session_completed: 'text-green-600',
  session_cancelled: 'text-red-600',
  session_requested: 'text-orange-600',
  session_confirmed: 'text-blue-600',
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useAppToast()

const isLoading = ref(false)
const error = ref<string | null>(null)
const lastRefreshedAt = ref<string | null>(null)
const rawActivities = ref<ActivityResponse[]>([])
const selectedDatePreset = ref<DashboardDatePreset>('last_30_days')
const selectedStartDate = ref('')
const selectedEndDate = ref('')

const getStoredProfile = () => {
  if (typeof window === 'undefined') return null

  const rawProfile = localStorage.getItem('profile')
  if (!rawProfile) return null

  try {
    return JSON.parse(rawProfile)
  } catch (parseError) {
    console.error('Failed to parse stored profile:', parseError)
    return null
  }
}

const companyId = computed(() => {
  const storedProfile = getStoredProfile()
  return (
    storedProfile?.company?.id ||
    storedProfile?.companyId ||
    storedProfile?.company_id ||
    authStore.loggedInUser?.companyId ||
    ''
  )
})

const toEpochMs = (value?: string | null) => {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

const toIsoDateOnly = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const buildPresetDateRange = (preset: DashboardDatePreset) => {
  const totalDays = preset === 'last_7_days'
    ? 7
    : preset === 'last_90_days'
      ? 90
      : 30

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - (totalDays - 1))

  return {
    preset,
    startDate: toIsoDateOnly(startDate),
    endDate: toIsoDateOnly(endDate),
  }
}

const defaultLast30DayRange = () => buildPresetDateRange('last_30_days')

const normalizeDateQueryValue = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return ''
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? '' : value
}

const initializeDateFilterFromRoute = () => {
  const defaults = defaultLast30DayRange()
  const queryPreset = typeof route.query.preset === 'string' ? route.query.preset : defaults.preset
  const parsedPreset = ['last_7_days', 'last_30_days', 'last_90_days', 'custom'].includes(queryPreset)
    ? (queryPreset as DashboardDatePreset)
    : defaults.preset

  const startDate = normalizeDateQueryValue(route.query.startDate) || defaults.startDate
  const endDate = normalizeDateQueryValue(route.query.endDate) || defaults.endDate

  if (startDate > endDate) {
    selectedDatePreset.value = defaults.preset
    selectedStartDate.value = defaults.startDate
    selectedEndDate.value = defaults.endDate
    return
  }

  const presetRange = parsedPreset === 'custom' ? null : buildPresetDateRange(parsedPreset)
  const preset = (
    presetRange
    && (
      presetRange.startDate !== startDate
      || presetRange.endDate !== endDate
    )
  )
    ? 'custom'
    : parsedPreset

  selectedDatePreset.value = preset
  selectedStartDate.value = startDate
  selectedEndDate.value = endDate
}

const dateFilterParams = computed<DashboardDateFilterParams>(() => ({
  ...(selectedDatePreset.value !== 'custom' ? { period: selectedDatePreset.value } : {}),
  startDate: selectedStartDate.value,
  endDate: selectedEndDate.value,
}))

const resolveActivityTimestamp = (activity: ActivityResponse, fallback?: string | null) => {
  const candidates = [
    activity.timestamp,
    activity.createdAt,
    activity.updatedAt,
    activity.occurredAt,
    activity.eventAt,
    activity.date,
    activity.created_at,
    activity.updated_at,
    activity.occurred_at,
    activity.event_at,
  ]

  const firstValid = candidates.find(value => toEpochMs(value) > 0)
  if (firstValid) return firstValid as string
  if (toEpochMs(fallback) > 0) return fallback as string
  return new Date().toISOString()
}

const activities = computed<ActivityItem[]>(() =>
  [...rawActivities.value]
    .map(activity => ({
      ...activity,
      title: activity.title || 'Activity update',
      description: activity.description || 'Company activity recorded.',
      timestamp: resolveActivityTimestamp(activity, lastRefreshedAt.value || null),
      icon: activityIconMap[activity.type] || Calendar,
      color: activityColorMap[activity.type] || 'text-blue-600',
    }))
    .sort((left, right) => toEpochMs(right.timestamp) - toEpochMs(left.timestamp)),
)

const formatDateTime = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatDateOnly = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const selectedDateRangeLabel = computed(() => {
  if (!selectedStartDate.value || !selectedEndDate.value) return 'Date range unavailable'
  return `${formatDateOnly(selectedStartDate.value)} to ${formatDateOnly(selectedEndDate.value)}`
})

const refreshActivityTimeline = async () => {
  const resolvedCompanyId = companyId.value
  if (!resolvedCompanyId) {
    error.value = 'Company ID not found. Log in again and retry.'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const dashboardResult = await dashboardApi.getCompanyDashboard(resolvedCompanyId, dateFilterParams.value)
    const payload = dashboardResult?.data

    if (!payload?.success) {
      throw new Error(payload?.message || 'Failed to load activity timeline.')
    }

    rawActivities.value = payload.data?.recentActivity || []
    lastRefreshedAt.value = payload.data?.snapshotAt || null
  } catch (loadError: any) {
    console.error('Failed to load activity timeline:', loadError)
    error.value =
      loadError?.response?.data?.message ||
      loadError?.message ||
      'Failed to load activity timeline.'
    toast.error(error.value)
  } finally {
    isLoading.value = false
  }
}

const openDashboard = async () => {
  await router.push({
    path: '/app/admin',
    query: {
      preset: selectedDatePreset.value,
      startDate: selectedStartDate.value,
      endDate: selectedEndDate.value,
    },
  })
}

onMounted(() => {
  initializeDateFilterFromRoute()
  refreshActivityTimeline()
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Activity Timeline</h1>
          <p class="text-sm text-muted-foreground">
            Full operational feed for company mentorship activity and delivery updates.
          </p>
          <p class="text-xs text-muted-foreground">Range: {{ selectedDateRangeLabel }}</p>
          <p v-if="lastRefreshedAt" class="text-xs text-muted-foreground">
            Last refreshed {{ formatDateTime(lastRefreshedAt) }}
          </p>
        </div>

        <div class="flex gap-2">
          <Button variant="outline" @click="openDashboard">
            <ArrowLeft class="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button @click="refreshActivityTimeline" :disabled="isLoading">
            <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
            Refresh
          </Button>
        </div>
      </div>
    </div>

    <Alert v-if="error" variant="destructive">
      <AlertTriangle class="h-4 w-4" />
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <ActivityFeed
      :activities="activities"
      title="All Activity Records"
      :max-items="activities.length || 1"
      :show-view-all="false"
    />
  </div>
</template>
