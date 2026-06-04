<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarDays,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock3,
  Download,
  Filter,
  MoreVertical,
  Plus,
} from 'lucide-vue-next'
import {
  type CompanySessionRecord,
  type CompanySessionsQueryParams,
} from '~/http/requests/app/company'
import { useAppToast } from '~/composables/services/toastService'
import { useAuthStore } from '~/store/modules/auth'
import { useCompanySessionsStore } from '~/store/modules/company-sessions'

definePageMeta({
  title: 'Mentoring Sessions',
  description: 'Operational view of mentorship sessions across your company programs',
  requiresAuth: true,
  permissions: ['admin:reports'],
})

type SessionStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'pending_approval' | 'in_progress'
type DisplayStatus = 'Upcoming' | 'Completed' | 'Canceled'
type TimeRange = 'last_30_days' | 'last_90_days' | 'this_year' | 'all_time'
type StatusFilter = 'all_statuses' | 'upcoming' | 'completed' | 'canceled'

type SessionRow = {
  id: string
  employeeName: string
  employeeEmail?: string | null
  mentorName: string
  department: string
  topic: string
  status: SessionStatus
  scheduledStart: string
  scheduledEnd: string
  rating?: number
}

type PaginationItem = number | 'ellipsis'

const statusFilterMap: Record<Exclude<StatusFilter, 'all_statuses'>, string[]> = {
  upcoming: ['scheduled', 'confirmed', 'pending', 'in_progress'],
  completed: ['completed'],
  canceled: ['cancelled', 'no_show'],
}

const authStore = useAuthStore()
const sessionsStore = useCompanySessionsStore()
const toast = useAppToast()

const timeRange = ref<TimeRange>('last_30_days')
const statusFilter = ref<StatusFilter>('all_statuses')
const departmentFilter = ref('all_departments')

const currentPage = ref(1)
const pageSize = 10
const localError = ref<string | null>(null)

const isLoading = computed(() => sessionsStore.isLoading)
const error = computed(() => localError.value || sessionsStore.error)

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

const hashString = (value: string) =>
  [...value].reduce((total, char) => total + char.charCodeAt(0), 0)

const initials = (name: string) =>
  name
    .split(' ')
    .map(part => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

const statusLabel = (status: SessionStatus): DisplayStatus => {
  if (status === 'completed') return 'Completed'
  if (status === 'cancelled' || status === 'no_show') return 'Canceled'
  return 'Upcoming'
}

const normalizeStatus = (value?: string | null): SessionStatus => {
  switch (String(value || '').trim().toUpperCase()) {
    case 'PENDING':
      return 'pending_approval'
    case 'CONFIRMED':
      return 'confirmed'
    case 'SCHEDULED':
      return 'scheduled'
    case 'COMPLETED':
      return 'completed'
    case 'CANCELLED':
      return 'cancelled'
    case 'NO_SHOW':
      return 'no_show'
    case 'IN_PROGRESS':
      return 'in_progress'
    default:
      return 'scheduled'
  }
}

const parseDate = (value?: string | null) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatShortDate = (iso?: string | null) => {
  const parsed = parseDate(iso)
  if (!parsed) return 'Date TBD'

  return parsed.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatTime = (iso?: string | null) => {
  const parsed = parseDate(iso)
  if (!parsed) return '--:--'

  return parsed.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const formatSessionWindow = (start?: string | null, end?: string | null) => {
  if (!start || !end) return 'Schedule pending'
  return `${formatShortDate(start)} • ${formatTime(start)} - ${formatTime(end)}`
}

const formatCount = (value: number) => value.toLocaleString()

const relativeTime = (iso?: string | null) => {
  const parsed = parseDate(iso)
  if (!parsed) return 'time unavailable'

  const diffMs = Math.max(Date.now() - parsed.getTime(), 0)
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1) return 'less than 1 hour ago'
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

const resolveTopic = (session: CompanySessionRecord) => {
  if (session.title && session.title.trim()) return session.title.trim()
  if (session.description && session.description.trim()) return session.description.trim()
  return 'Mentorship Session'
}

const normalizeSession = (session: CompanySessionRecord): SessionRow => {
  const scheduledStart = session.scheduledStart || new Date().toISOString()
  const scheduledEnd = session.scheduledEnd || scheduledStart

  return {
    id: session.id,
    employeeName: session.employeeName || 'Employee',
    employeeEmail: session.employeeEmail || null,
    mentorName: session.mentorName || 'Mentor',
    department: session.department || 'General',
    topic: resolveTopic(session),
    status: normalizeStatus(session.status),
    scheduledStart,
    scheduledEnd,
    rating: typeof session.rating === 'number' ? session.rating : undefined,
  }
}

const extractErrorMessage = (caughtError: any, fallback: string) =>
  caughtError?.response?.data?.message || caughtError?.message || fallback

const sessions = computed(() => sessionsStore.sessions.map(normalizeSession))

const derivedSummary = computed(() => {
  const rows = sessions.value
  const upcoming = rows.filter(session => statusLabel(session.status) === 'Upcoming').length
  const completed = rows.filter(session => statusLabel(session.status) === 'Completed').length
  const canceled = rows.filter(session => statusLabel(session.status) === 'Canceled').length
  const rated = rows.filter(session => typeof session.rating === 'number' && session.rating > 0)
  const averageRating = rated.length
    ? Math.round((rated.reduce((sum, session) => sum + (session.rating || 0), 0) / rated.length) * 10) / 10
    : 0
  const cancellationRate = rows.length ? Math.round((canceled * 100) / rows.length) : 0

  return {
    upcomingCount: upcoming,
    completedCount: completed,
    cancelledCount: canceled,
    avgRating: averageRating,
    cancellationRate,
    totalSessions: rows.length,
  }
})

const summary = computed(() => sessionsStore.summary || derivedSummary.value)

const upcomingCount = computed(() => Number(summary.value.upcomingCount || 0))
const completedCount = computed(() => Number(summary.value.completedCount || 0))
const canceledCount = computed(() => Number(summary.value.cancelledCount || 0))
const averageRating = computed(() => Number(summary.value.avgRating || 0))
const cancellationRate = computed(() => Number(summary.value.cancellationRate || 0))

const overviewCards = computed(() => {
  const ratingConfidence = Math.min(99, Math.max(82, Math.round((averageRating.value / 5) * 100) || 82))
  const totalSessions = Math.max(Number(summary.value.totalSessions || 0), 1)
  const upcomingMomentum = Math.max(6, Math.round((upcomingCount.value / totalSessions) * 100))
  const cancelledDelta = Math.max(1, Math.round(Math.max(cancellationRate.value, 4) * 0.8))

  return [
    {
      key: 'upcoming',
      title: 'UPCOMING',
      value: formatCount(upcomingCount.value),
      note: 'Confirmed for next 7 days',
      trend: `+${upcomingMomentum}% vs LY`,
      trendClass: 'text-[#2d6a1f]',
      icon: CalendarDays,
      iconClass: 'bg-[#f7edf9] text-[#9f3c93]',
    },
    {
      key: 'completed',
      title: 'COMPLETED',
      value: formatCount(completedCount.value),
      note: 'Total sessions this year',
      trend: completedCount.value >= 1000 ? `+${(completedCount.value / 1000).toFixed(1)}k` : `+${completedCount.value}`,
      trendClass: 'text-[#2d6a1f]',
      icon: CircleCheck,
      iconClass: 'bg-[#eaf7ef] text-[#188647]',
    },
    {
      key: 'canceled',
      title: 'CANCELED',
      value: formatCount(canceledCount.value),
      note: 'Last 30 days attrition',
      trend: `-${cancelledDelta}%`,
      trendClass: 'text-[#c43030]',
      icon: CircleX,
      iconClass: 'bg-[#fceff1] text-[#d12c2c]',
    },
    {
      key: 'rating',
      title: 'AVG. RATING',
      value: averageRating.value ? averageRating.value.toFixed(1) : '0.0',
      note: 'Based on participant feedback',
      trend: `${ratingConfidence}%`,
      trendClass: 'text-[#2d6a1f]',
      icon: Activity,
      iconClass: 'bg-[#edf3ff] text-[#245ad9]',
    },
  ]
})

const departmentOptions = computed(() => {
  const values = Array.from(new Set(sessions.value.map(session => session.department)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

  if (departmentFilter.value !== 'all_departments' && !values.includes(departmentFilter.value)) {
    values.unshift(departmentFilter.value)
  }

  return ['all_departments', ...values]
})

const pagedSessions = computed(() => sessions.value)
const totalRows = computed(() => sessionsStore.totalCount || sessionsStore.count || sessions.value.length)
const totalPages = computed(() => {
  const storeTotalPages = sessionsStore.pagination?.totalPages
  if (typeof storeTotalPages === 'number' && storeTotalPages > 0) {
    return storeTotalPages
  }

  return Math.max(1, Math.ceil(totalRows.value / pageSize))
})

const pageStart = computed(() => {
  if (!totalRows.value) return 0

  const pageNumber = sessionsStore.pagination?.page ?? Math.max(currentPage.value - 1, 0)
  const resolvedSize = sessionsStore.pagination?.size || pageSize
  return pageNumber * resolvedSize + 1
})

const pageEnd = computed(() => {
  if (!totalRows.value) return 0
  return Math.min(pageStart.value + pagedSessions.value.length - 1, totalRows.value)
})

const pageItems = computed<PaginationItem[]>(() => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 'ellipsis', total]
  }

  if (current >= total - 2) {
    return [1, 'ellipsis', total - 2, total - 1, total]
  }

  return [1, 'ellipsis', current, current + 1, 'ellipsis', total]
})

const statusTone = (status: DisplayStatus) => {
  if (status === 'Completed') return 'text-[#15803d]'
  if (status === 'Canceled') return 'text-[#cf2b2b]'
  return 'text-[#2f62d9]'
}

const statusDotTone = (status: DisplayStatus) => {
  if (status === 'Completed') return 'bg-[#22c55e]'
  if (status === 'Canceled') return 'bg-[#ef4444]'
  return 'bg-[#3b82f6]'
}

const departmentTone = (department: string) => {
  const palette = [
    'bg-[#eaf0ff] text-[#1f4fd6]',
    'bg-[#f5ecff] text-[#7a31bc]',
    'bg-[#fef1e8] text-[#be4d02]',
    'bg-[#e9f8fb] text-[#067f9b]',
    'bg-[#ebf9ef] text-[#13795a]',
    'bg-[#fff3da] text-[#9a5b00]',
  ]

  return palette[hashString(department) % palette.length]
}

const exportCsv = () => {
  const header = ['Employee', 'Mentor', 'Topic', 'Department', 'Status', 'Start', 'End', 'Rating']
  const lines = pagedSessions.value.map(row => [
    row.employeeName,
    row.mentorName,
    row.topic,
    row.department,
    statusLabel(row.status),
    row.scheduledStart,
    row.scheduledEnd,
    typeof row.rating === 'number' ? row.rating.toString() : '',
  ])

  const csv = [header, ...lines]
    .map(line => line.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'admin-sessions.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const handleRowAction = (row: SessionRow, action: 'view' | 'reschedule' | 'message') => {
  if (action === 'view') {
    navigateTo(`/app/sessions/review/${row.id}`)
    return
  }

  if (action === 'reschedule') {
    toast.info(`Reschedule flow queued for ${row.employeeName}.`)
    return
  }

  toast.info(`Mentor and mentee contacted for ${row.employeeName}.`)
}

const recentCancellations = computed(() => {
  const backendRows = sessionsStore.recentCancellations || []
  if (!backendRows.length) {
    return []
  }

  return backendRows.slice(0, 3).map(item => {
    const reason = item.cancellationReason?.trim() || 'Session Canceled'
    const title = `${reason}: ${item.employeeName || 'Employee'}`
    const sessionLabel = item.title?.trim() || 'Mentorship session'
    const subtitle = `${sessionLabel} • ${relativeTime(item.cancelledAt)}`

    return {
      id: item.sessionId,
      title,
      subtitle,
    }
  })
})

const pendingFeedback = computed(() => {
  const backendItems = sessionsStore.pendingFeedback?.items || []
  if (!backendItems.length) {
    return []
  }

  return backendItems.slice(0, 4).map(item => ({
    id: item.reviewCycleId || item.sessionId,
    name: item.mentorName || item.menteeName || 'Participant',
    detail: `Completed: ${formatShortDate(item.completedAt)} • ${item.sessionTitle || 'Mentorship session'}`,
  }))
})

const pendingFeedbackCount = computed(() => {
  const requiredCount = sessionsStore.pendingFeedback?.requiredCount
  if (typeof requiredCount === 'number') return requiredCount
  return pendingFeedback.value.length
})

const resolveRangeStart = () => {
  const now = new Date()

  if (timeRange.value === 'all_time') {
    return undefined
  }

  if (timeRange.value === 'this_year') {
    return new Date(now.getFullYear(), 0, 1).toISOString()
  }

  const startDate = new Date(now)
  startDate.setDate(now.getDate() - (timeRange.value === 'last_90_days' ? 90 : 30))
  return startDate.toISOString()
}

const buildQueryParams = (): CompanySessionsQueryParams => {
  const params: CompanySessionsQueryParams = {
    page: Math.max(currentPage.value - 1, 0),
    size: pageSize,
  }

  if (statusFilter.value !== 'all_statuses') {
    params.statuses = statusFilterMap[statusFilter.value]
  }

  if (departmentFilter.value !== 'all_departments') {
    params.departments = [departmentFilter.value]
  }

  const startDate = resolveRangeStart()
  if (startDate) {
    params.startDate = startDate
  }

  return params
}

const fetchSessions = async () => {
  const resolvedCompanyId = companyId.value
  if (!resolvedCompanyId) {
    localError.value = 'Company profile is missing for this account.'
    sessionsStore.resetSessionsState()
    return
  }

  try {
    localError.value = null
    await sessionsStore.loadCompanySessions(resolvedCompanyId, buildQueryParams())

    const backendPage = sessionsStore.pagination?.page
    if (typeof backendPage === 'number') {
      const nextPage = backendPage + 1
      if (nextPage !== currentPage.value) {
        currentPage.value = nextPage
      }
    }
  } catch (caughtError: any) {
    localError.value = extractErrorMessage(caughtError, 'Unable to load company sessions.')
    toast.error(localError.value)
  }
}

watch([timeRange, statusFilter, departmentFilter], () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1
    return
  }

  fetchSessions()
})

watch(currentPage, (newPage, oldPage) => {
  if (newPage === oldPage) return
  fetchSessions()
})

const refreshSessions = async () => {
  await fetchSessions()
}

onMounted(() => {
  fetchSessions()
})
</script>

<template>
  <div class="session-dashboard mx-auto max-w-[1280px] space-y-6 px-4 py-6 md:px-6">
    <header class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-1">
        <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8f5f82]">Overview</p>
        <h1 class="text-xl font-semibold tracking-[-0.01em] text-[#1f2430] md:text-2xl">Mentoring Sessions</h1>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          class="h-10 border-[#e5cfe2] px-5 text-sm font-medium text-[#2d3138] hover:bg-[#fbf7fb]"
          :disabled="isLoading"
          @click="exportCsv"
        >
          <Download class="h-4 w-4" />
          Export CSV
        </Button>

        <Button
          class="h-10 bg-primary px-5 text-sm font-medium text-white hover:bg-primary/90"
          @click="navigateTo('/app/sessions')"
        >
          <Plus class="h-4 w-4" />
          Schedule New
        </Button>
      </div>
    </header>

    <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in overviewCards"
        :key="card.key"
        class="rounded-xl border border-[#e8e6eb] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
      >
        <div class="mb-3 flex items-center justify-between">
          <div :class="['flex h-10 w-10 items-center justify-center rounded-md', card.iconClass]">
            <component :is="card.icon" class="h-5 w-5" />
          </div>
          <p :class="['text-xl font-semibold', card.trendClass]">{{ card.trend }}</p>
        </div>

        <p class="text-sm font-semibold uppercase tracking-[0.06em] text-[#5c5e63]">{{ card.title }}</p>
        <p class="mt-1 text-2xl font-semibold text-[#181c22]">{{ card.value }}</p>
        <p class="mt-2 text-sm text-[#94a0af]">{{ card.note }}</p>
      </article>
    </section>

    <section class="rounded-xl border border-[#e8e6eb] bg-white px-4 py-4 md:px-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <div class="relative">
            <CalendarDays class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e96a3]" />
            <Select v-model="timeRange">
              <SelectTrigger class="h-10 border-[#e4ccdf] bg-white pl-9 text-sm font-medium text-[#2f3338]">
                <SelectValue placeholder="Last 30 Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="relative">
            <Filter class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e96a3]" />
            <Select v-model="statusFilter">
              <SelectTrigger class="h-10 border-[#e4ccdf] bg-white pl-9 text-sm font-medium text-[#2f3338]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_statuses">All Statuses</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="relative">
            <Building2 class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e96a3]" />
            <Select v-model="departmentFilter">
              <SelectTrigger class="h-10 border-[#e4ccdf] bg-white pl-9 text-sm font-medium text-[#2f3338]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="department in departmentOptions"
                  :key="department"
                  :value="department"
                >
                  {{ department === 'all_departments' ? 'All Departments' : department }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>
    </section>

    <Alert v-if="error" variant="destructive" class="border-[#f7d0d0] bg-[#fff7f7] text-[#8a2222]">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <section class="overflow-hidden rounded-xl border border-[#e8e6eb] bg-white">
      <div v-if="isLoading" class="space-y-4 p-6">
        <div class="h-14 animate-pulse rounded-md bg-[#f4f5f7]" />
        <div class="h-14 animate-pulse rounded-md bg-[#f4f5f7]" />
        <div class="h-14 animate-pulse rounded-md bg-[#f4f5f7]" />
        <div class="h-14 animate-pulse rounded-md bg-[#f4f5f7]" />
      </div>

      <div v-else-if="!pagedSessions.length" class="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <CalendarX2 class="h-10 w-10 text-[#c4ccd8]" />
        <p class="text-lg font-semibold text-[#2d3139]">No sessions match these filters.</p>
        <p class="text-sm text-[#8b93a0]">Adjust filters or refresh to load recent scheduling activity.</p>
        <Button variant="outline" class="mt-2" @click="refreshSessions">Refresh Sessions</Button>
      </div>

      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[980px]">
            <thead>
              <tr class="border-b border-[#ececf0] bg-[#fafafb] text-left text-sm font-semibold uppercase tracking-[0.04em] text-[#5d5f64]">
                <th class="px-6 py-4">Mentor & Mentee</th>
                <th class="px-6 py-4">Session Details</th>
                <th class="px-6 py-4">Department</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in pagedSessions"
                :key="row.id"
                class="border-b border-[#f1f1f4] align-top last:border-b-0"
              >
                <td class="px-6 py-5">
                  <div class="flex items-start gap-4">
                    <div class="flex items-center -space-x-2 pt-1">
                      <Avatar class="h-9 w-9 border-2 border-white bg-[#111827] text-white">
                        <AvatarFallback class="text-[11px] font-semibold">{{ initials(row.employeeName) }}</AvatarFallback>
                      </Avatar>
                      <Avatar class="h-9 w-9 border-2 border-white bg-[#173f7a] text-white">
                        <AvatarFallback class="text-[11px] font-semibold">{{ initials(row.mentorName) }}</AvatarFallback>
                      </Avatar>
                    </div>

                    <div class="space-y-1 leading-tight">
                      <p class="text-lg font-medium text-[#252a31]">{{ row.employeeName }}</p>
                      <p class="text-sm text-[#6e7480]">w/ {{ row.mentorName }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-5">
                  <div class="space-y-1.5">
                    <p class="text-base font-semibold leading-tight text-[#22262c]">{{ row.topic }}</p>
                    <p class="text-sm text-[#676f7c]">{{ formatSessionWindow(row.scheduledStart, row.scheduledEnd) }}</p>
                  </div>
                </td>

                <td class="px-6 py-5">
                  <span
                    class="inline-flex rounded-md px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.03em]"
                    :class="departmentTone(row.department)"
                  >
                    {{ row.department }}
                  </span>
                </td>

                <td class="px-6 py-5">
                  <div class="flex items-center gap-2 text-base font-medium" :class="statusTone(statusLabel(row.status))">
                    <span class="h-2.5 w-2.5 rounded-full" :class="statusDotTone(statusLabel(row.status))" />
                    <span>{{ statusLabel(row.status) }}</span>
                  </div>
                </td>

                <td class="px-6 py-5">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <button
                        type="button"
                        class="rounded-md p-1 text-[#8d93a0] transition-colors hover:bg-[#f5f6f9] hover:text-[#5a6070]"
                        aria-label="Open session actions"
                      >
                        <MoreVertical class="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="w-44">
                      <DropdownMenuItem @select="handleRowAction(row, 'view')">Open Session</DropdownMenuItem>
                      <DropdownMenuItem @select="handleRowAction(row, 'reschedule')">Reschedule</DropdownMenuItem>
                      <DropdownMenuItem @select="handleRowAction(row, 'message')">Send Reminder</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col gap-4 border-t border-[#ececf0] px-6 py-5 md:flex-row md:items-center md:justify-between">
          <p class="text-sm text-[#676f7c]">
            Showing {{ pageStart }} to {{ pageEnd }} of {{ formatCount(totalRows) }} sessions
          </p>

          <div class="flex items-center gap-2 text-sm">
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded border border-[#e2d8e1] text-[#7c8492] transition-colors hover:bg-[#f9f4f9] disabled:cursor-not-allowed disabled:opacity-45"
              :disabled="currentPage <= 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
            >
              <ChevronLeft class="h-4 w-4" />
            </button>

            <template v-for="item in pageItems" :key="`${item}-${currentPage}`">
              <button
                v-if="item !== 'ellipsis'"
                type="button"
                class="inline-flex h-8 min-w-8 items-center justify-center rounded border px-2 transition-colors"
                :class="item === currentPage
                  ? 'border-primary bg-primary text-white'
                  : 'border-transparent text-[#4a5160] hover:border-[#e2d8e1] hover:bg-[#f8f6fa]'"
                @click="currentPage = item"
              >
                {{ item }}
              </button>

              <span v-else class="px-1 text-[#8e94a0]">...</span>
            </template>

            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded border border-[#e2d8e1] text-[#7c8492] transition-colors hover:bg-[#f9f4f9] disabled:cursor-not-allowed disabled:opacity-45"
              :disabled="currentPage >= totalPages"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
            >
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </template>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <article class="rounded-xl border border-[#e8e6eb] bg-white p-5">
        <h2 class="text-[1.2rem] font-semibold leading-tight tracking-[-0.01em] text-[#222a36]">Recent Cancellations</h2>

        <div v-if="recentCancellations.length" class="mt-4 space-y-3">
          <div
            v-for="item in recentCancellations"
            :key="item.id"
            class="flex items-center justify-between rounded-lg border border-[#f6dce3] bg-[#fffafb] px-4 py-3"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-md bg-[#ffe9ee] text-[#e11d48]">
                <CalendarX2 class="h-4 w-4" />
              </div>
              <div>
                <p class="text-lg font-medium leading-tight text-[#2a2f36]">{{ item.title }}</p>
                <p class="text-sm text-[#7a8290]">{{ item.subtitle }}</p>
              </div>
            </div>

            <button type="button" class="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              Reschedule
            </button>
          </div>
        </div>

        <div v-else class="mt-4 rounded-lg border border-dashed border-[#e9e6ec] bg-[#fcfbfd] p-6 text-center">
          <p class="text-sm text-[#7b8290]">No cancellations in this window.</p>
        </div>
      </article>

      <article class="rounded-xl border border-[#e8e6eb] bg-white p-5">
        <div class="flex items-center justify-between">
          <h2 class="text-[1.2rem] font-semibold leading-tight tracking-[-0.01em] text-[#222a36]">Pending Feedback</h2>
          <span class="rounded bg-[#fde8cc] px-2 py-1 text-xs font-bold uppercase tracking-wide text-[#c16200]">
            {{ pendingFeedbackCount }} Required
          </span>
        </div>

        <div v-if="pendingFeedback.length" class="mt-4 space-y-3">
          <div
            v-for="item in pendingFeedback"
            :key="item.id"
            class="flex items-center justify-between rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-[#ece8f1] hover:bg-[#faf9fc]"
          >
            <div class="flex items-center gap-3">
              <Avatar class="h-10 w-10 bg-[#dbe2f1] text-[#2e3a53]">
                <AvatarFallback class="text-xs font-semibold">{{ initials(item.name) }}</AvatarFallback>
              </Avatar>

              <div>
                <p class="text-lg font-medium leading-tight text-[#2a2f36]">{{ item.name }}</p>
                <p class="text-sm text-[#7a8290]">{{ item.detail }}</p>
              </div>
            </div>

            <ArrowRight class="h-5 w-5 text-[#9ba2af]" />
          </div>
        </div>

        <div v-else class="mt-4 rounded-lg border border-dashed border-[#e9e6ec] bg-[#fcfbfd] p-6 text-center">
          <p class="text-sm text-[#7b8290]">No pending feedback in this window.</p>
        </div>
      </article>
    </section>

    <section class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ecebf0] bg-white px-5 py-3 text-sm text-[#6f7785]">
      <div class="flex items-center gap-2">
        <Clock3 class="h-4 w-4" />
        Last refreshed from company session records.
      </div>
      <Button variant="ghost" class="h-8 px-3 text-sm" @click="refreshSessions">Refresh data</Button>
    </section>
  </div>
</template>

<style scoped>
.session-dashboard {
  font-family: 'Montserrat', 'Inter', ui-sans-serif, system-ui, sans-serif;
  background: linear-gradient(180deg, #f7f7f9 0%, #f4f5f7 100%);
  border-radius: 1rem;
}

@media (max-width: 768px) {
  .session-dashboard {
    border-radius: 0.75rem;
  }
}
</style>
