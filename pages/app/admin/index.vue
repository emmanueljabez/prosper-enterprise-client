<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import dashboardApi, { type DashboardDateFilterParams } from '@/http/requests/app/dashboard'
import companyProgramsApi, {
  type CompanyProgramParticipantRecord,
  type CompanyProgramRecord,
} from '@/http/requests/app/companyPrograms'
import companySubscriptionsApi, {
  type CompanySubscriptionSummary,
} from '@/http/requests/app/companySubscriptions'
import reviewAlertsApi, {
  type ReviewAlertSummaryRecord,
} from '@/http/requests/app/reviewAlerts'
import pulsesApi, {
  type CompanyParticipantPulseSummaryRecord,
} from '@/http/requests/app/pulses'
import { useAppToast } from '@/composables/services/toastService'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import ActivityFeed from '@/components/ui/dashboard/ActivityFeed.vue'
import KpiSummaryCard from '@/components/ui/dashboard/KpiSummaryCard.vue'
import LineChart from '@/components/ui/chart-line/LineChart.vue'
import BarChart from '@/components/ui/chart-bar/BarChart.vue'
import DonutChart from '@/components/ui/chart-donut/DonutChart.vue'
import { VisSankey, VisSingleContainer } from '@unovis/vue'

import {
  ArrowRight,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  Shield,
  Star,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Corporate Admin Dashboard',
  description: 'Organizational oversight and platform management',
  requiresAuth: true,
  permissions: ['admin:dashboard:view'],
})

type DashboardProfile = {
  id: string
  email?: string | null
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  isVerified?: boolean
  createdAt?: string | null
  location?: string | null
  industry?: string | null
}

type EmployeeAggregate = {
  id: string
  name: string
  email: string
  meta: string
  sessions: number
  completed: number
  upcoming: number
  hours: number
  averageRating: number | null
  lastSessionAt: string | null
}

type TrendRow = {
  label: string
  sessions: number
  completed: number
  hours: number
  width: number
}

type TopicRow = {
  label: string
  sessions: number
  hours: number
  completed: number
}

type MentorLeaderboardRow = {
  id: string
  name: string
  sessions: number
  completed: number
  averageRating: number | null
}

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

type DashboardAlert = {
  id: string
  title: string
  message: string
  icon: any
  variant?: 'default' | 'destructive'
}

type SessionLoadSummary = {
  requestedEmployees: number
  loadedEmployees: number
  failedEmployees: number
}

type CompanyDashboardStats = {
  periodDays: number
  totalSessions: number
  registeredEmployees: number
  newEmployeesLastPeriod: number
  participatingEmployees: number
  participationRate: number
  activeEmployeesCurrentPeriod: number
  activeEmployeesPreviousPeriod: number
  sessionsCurrentPeriod: number
  sessionsPreviousPeriod: number
  hoursCurrentPeriod: number
  hoursPreviousPeriod: number
  totalHours: number
  averageRating: number
  completionRate: number
  feedbackCoverage: number
  completedSessions: number
  upcomingSessions: number
  pendingSessions: number
  cancelledSessions: number
  paidSessionsCount: number
  unpaidSessionsCount: number
  verifiedEmployees: number
  verificationRate: number
  whitelistTotal: number
  invitesSentCount: number
  acceptedInvitesCount: number
  pendingInvitationSendCount: number
  awaitingAcceptanceCount: number
  invitationAcceptanceRate: number
}

type StatusBreakdownRow = {
  key: string
  label: string
  count: number
  percentage: number
  color: string
}

type CompanyDashboardResponse = {
  company?: {
    id?: string | null
    name?: string | null
  } | null
  snapshotAt?: string | null
  period?: string | null
  loadSummary?: Partial<SessionLoadSummary> | null
  stats?: Partial<CompanyDashboardStats> | null
  employeeAggregates?: EmployeeAggregate[] | null
  recentRegistrations?: DashboardProfile[] | null
  monthlyTrends?: TrendRow[] | null
  topTopics?: TopicRow[] | null
  mentorLeaderboard?: MentorLeaderboardRow[] | null
  recentActivity?: ActivityResponse[] | null
  statusBreakdown?: Array<Omit<StatusBreakdownRow, 'color'>> | null
}

type DashboardKpi = {
  id: string
  title: string
  value: string
  subtitle: string
  progress: number
  tone: 'brand' | 'success' | 'warning' | 'danger'
  deltaText: string
  deltaTone: 'up' | 'down' | 'neutral'
  healthTone: 'healthy' | 'watch' | 'risk'
  sparkline: number[]
  icon: any
}

type FunnelNode = {
  id: string
  stage: string
  color: string
}

type FunnelLink = {
  source: string
  target: string
  value: number
  color: string
}

type FunnelGraph = {
  nodes: FunnelNode[]
  links: FunnelLink[]
}

type ProgramInsightsSummary = {
  programs: CompanyProgramRecord[]
  participantsByProgramId: Record<string, CompanyProgramParticipantRecord[]>
  failedPrograms: number
}

type DashboardDatePreset = 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom'

type DashboardDatePresetOption = {
  value: DashboardDatePreset
  label: string
  days?: number
}

type DashboardAppliedDateRange = {
  preset: DashboardDatePreset
  startDate: string
  endDate: string
}

const BRAND_PRIMARY = '#9a4884'
const DEFAULT_DASHBOARD_DATE_PRESET: DashboardDatePreset = 'last_30_days'
const DASHBOARD_DATE_PRESET_OPTIONS: DashboardDatePresetOption[] = [
  { value: 'last_7_days', label: 'Last 7 days', days: 7 },
  { value: 'last_30_days', label: 'Last 30 days', days: 30 },
  { value: 'last_90_days', label: 'Last 90 days', days: 90 },
  { value: 'custom', label: 'Custom range' },
]

const DEFAULT_LOAD_SUMMARY: SessionLoadSummary = {
  requestedEmployees: 0,
  loadedEmployees: 0,
  failedEmployees: 0,
}

const DEFAULT_STATS: CompanyDashboardStats = {
  periodDays: 30,
  totalSessions: 0,
  registeredEmployees: 0,
  newEmployeesLastPeriod: 0,
  participatingEmployees: 0,
  participationRate: 0,
  activeEmployeesCurrentPeriod: 0,
  activeEmployeesPreviousPeriod: 0,
  sessionsCurrentPeriod: 0,
  sessionsPreviousPeriod: 0,
  hoursCurrentPeriod: 0,
  hoursPreviousPeriod: 0,
  totalHours: 0,
  averageRating: 0,
  completionRate: 0,
  feedbackCoverage: 0,
  completedSessions: 0,
  upcomingSessions: 0,
  pendingSessions: 0,
  cancelledSessions: 0,
  paidSessionsCount: 0,
  unpaidSessionsCount: 0,
  verifiedEmployees: 0,
  verificationRate: 0,
  whitelistTotal: 0,
  invitesSentCount: 0,
  acceptedInvitesCount: 0,
  pendingInvitationSendCount: 0,
  awaitingAcceptanceCount: 0,
  invitationAcceptanceRate: 0,
}

const DEFAULT_PROGRAM_INSIGHTS: ProgramInsightsSummary = {
  programs: [],
  participantsByProgramId: {},
  failedPrograms: 0,
}

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

const statusColorMap: Record<string, string> = {
  completed: 'bg-green-500',
  upcoming: 'bg-blue-500',
  pending: 'bg-orange-500',
  cancelled: 'bg-red-500',
}

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const toast = useAppToast()

const isLoading = ref(false)
const loadMessage = ref('')
const error = ref<string | null>(null)
const insightsError = ref<string | null>(null)
const storedCompanyName = ref('Your company')
const dashboardData = ref<CompanyDashboardResponse | null>(null)
const reviewSummary = ref<ReviewAlertSummaryRecord | null>(null)
const pulseSummary = ref<CompanyParticipantPulseSummaryRecord | null>(null)
const companySubscriptions = ref<CompanySubscriptionSummary[]>([])
const programInsights = ref<ProgramInsightsSummary>({ ...DEFAULT_PROGRAM_INSIGHTS })
const programInsightsError = ref<string | null>(null)
const selectedDatePreset = ref<DashboardDatePreset>(DEFAULT_DASHBOARD_DATE_PRESET)
const selectedStartDate = ref('')
const selectedEndDate = ref('')
const appliedDateRange = ref<DashboardAppliedDateRange>({
  preset: DEFAULT_DASHBOARD_DATE_PRESET,
  startDate: '',
  endDate: '',
})

const formatNumber = (value: number | string) =>
  new Intl.NumberFormat('en-KE').format(Number(value || 0))

const roundTo = (value: number, digits = 1) => {
  const factor = 10 ** digits
  return Math.round((Number(value) || 0) * factor) / factor
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)))

const formatHours = (value: number) => {
  const rounded = roundTo(value, 1)
  return Number.isInteger(rounded) ? formatNumber(rounded) : rounded.toFixed(1)
}

const formatCurrency = (value: number | string, currency = 'KES') =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const toDate = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const toEpochMs = (value?: string | null) => {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

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

const formatDate = (value?: string | null) => {
  const date = toDate(value)
  if (!date) return '—'

  return date.toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatDateTime = (value?: string | null) => {
  const date = toDate(value)
  if (!date) return '—'

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
  const date = toDate(`${value}T00:00:00`)
  if (!date) return '—'

  return date.toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const toIsoDateOnly = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const buildPresetDateRange = (preset: DashboardDatePreset): DashboardAppliedDateRange => {
  const today = new Date()
  const selectedPreset = DASHBOARD_DATE_PRESET_OPTIONS.find(option => option.value === preset)

  if (selectedPreset?.days) {
    const endDate = new Date(today)
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - (selectedPreset.days - 1))

    return {
      preset,
      startDate: toIsoDateOnly(startDate),
      endDate: toIsoDateOnly(endDate),
    }
  }

  const todayDate = toIsoDateOnly(today)
  return {
    preset: 'custom',
    startDate: todayDate,
    endDate: todayDate,
  }
}

const syncDateInputsFromPreset = (preset: DashboardDatePreset) => {
  if (preset === 'custom') {
    selectedDatePreset.value = preset
    if (!selectedStartDate.value || !selectedEndDate.value) {
      const today = toIsoDateOnly(new Date())
      selectedStartDate.value = today
      selectedEndDate.value = today
    }
    return
  }

  const range = buildPresetDateRange(preset)
  selectedDatePreset.value = range.preset
  selectedStartDate.value = range.startDate
  selectedEndDate.value = range.endDate
}

const initializeDashboardDateRange = () => {
  const range = buildPresetDateRange(DEFAULT_DASHBOARD_DATE_PRESET)
  selectedDatePreset.value = range.preset
  selectedStartDate.value = range.startDate
  selectedEndDate.value = range.endDate
  appliedDateRange.value = { ...range }
}

const normalizeDateQueryValue = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return ''
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? '' : value
}

const initializeDashboardDateRangeFromRoute = () => {
  const defaults = buildPresetDateRange(DEFAULT_DASHBOARD_DATE_PRESET)
  const queryPreset = typeof route.query.preset === 'string' ? route.query.preset : defaults.preset
  const parsedPreset = ['last_7_days', 'last_30_days', 'last_90_days', 'custom'].includes(queryPreset)
    ? (queryPreset as DashboardDatePreset)
    : defaults.preset

  const startDate = normalizeDateQueryValue(route.query.startDate) || defaults.startDate
  const endDate = normalizeDateQueryValue(route.query.endDate) || defaults.endDate

  if (startDate > endDate) {
    initializeDashboardDateRange()
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
  appliedDateRange.value = {
    preset,
    startDate,
    endDate,
  }
}

const dashboardDateFilterParams = computed<DashboardDateFilterParams>(() => ({
  ...(appliedDateRange.value.preset !== 'custom' ? { period: appliedDateRange.value.preset } : {}),
  startDate: appliedDateRange.value.startDate,
  endDate: appliedDateRange.value.endDate,
}))

const selectedDateRangeLabel = computed(() => {
  if (!appliedDateRange.value.startDate || !appliedDateRange.value.endDate) return 'Date range unavailable'
  return `${formatDateOnly(appliedDateRange.value.startDate)} to ${formatDateOnly(appliedDateRange.value.endDate)}`
})

const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  count === 1 ? singular : plural

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

const getProfileDisplayName = (profile: DashboardProfile) => {
  const combined = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
  return combined || profile.username || profile.email || 'Employee'
}

const getProfileMeta = (profile: DashboardProfile) => {
  return profile.industry || profile.location || profile.email || 'Employee profile'
}

const stats = computed<CompanyDashboardStats>(() => ({
  ...DEFAULT_STATS,
  ...(dashboardData.value?.stats || {}),
}))

const managedCompanySubscription = computed(() =>
  companySubscriptions.value.find(subscription => subscription.status === 'ACTIVE' && subscription.wallet)
  || companySubscriptions.value.find(subscription => subscription.wallet)
  || companySubscriptions.value.find(subscription => subscription.status === 'PENDING_PAYMENT')
  || companySubscriptions.value[0]
  || null,
)

const managedCompanyWallet = computed(() => managedCompanySubscription.value?.wallet || null)
const walletAvailableSessions = computed(() => Math.max(0, Number(managedCompanyWallet.value?.sessionsAvailable || 0)))
const walletPurchasedSessions = computed(() => Math.max(0, Number(managedCompanyWallet.value?.sessionsPurchased || managedCompanySubscription.value?.seatsPurchased || 0)))
const walletAllocatedSessions = computed(() => Math.max(0, Number(managedCompanyWallet.value?.sessionsAllocated || 0)))
const walletReturnedSessions = computed(() => Math.max(0, Number(managedCompanyWallet.value?.sessionsReturned || 0)))
const walletReservedSessions = computed(() => Math.max(0, walletAllocatedSessions.value - walletReturnedSessions.value))
const walletUsedSessions = computed(() => Math.max(0, walletPurchasedSessions.value - walletAvailableSessions.value))
const walletUtilizationRate = computed(() => {
  if (!walletPurchasedSessions.value) return 0
  return clampPercent((walletUsedSessions.value / walletPurchasedSessions.value) * 100)
})
const walletCurrency = computed(() => 'KES')
const walletAvailableBalance = computed(() =>
  walletAvailableSessions.value * Number(managedCompanyWallet.value?.pricePerSession || 0),
)

const lastRefreshedAt = computed(() => dashboardData.value?.snapshotAt || null)
const hasLoadedData = computed(() => dashboardData.value !== null)

const sessionLoadSummary = computed<SessionLoadSummary>(() => ({
  ...DEFAULT_LOAD_SUMMARY,
  ...(dashboardData.value?.loadSummary || {}),
}))

const employeeAggregates = computed<EmployeeAggregate[]>(() =>
  Array.isArray(dashboardData.value?.employeeAggregates) ? dashboardData.value?.employeeAggregates || [] : [],
)

const topEmployees = computed(() =>
  employeeAggregates.value.filter(employee => employee.sessions > 0).slice(0, 5),
)

const recentRegistrations = computed<DashboardProfile[]>(() =>
  Array.isArray(dashboardData.value?.recentRegistrations) ? dashboardData.value?.recentRegistrations || [] : [],
)

const monthlyTrends = computed<TrendRow[]>(() =>
  Array.isArray(dashboardData.value?.monthlyTrends) ? dashboardData.value?.monthlyTrends || [] : [],
)

const topTopics = computed<TopicRow[]>(() =>
  Array.isArray(dashboardData.value?.topTopics) ? dashboardData.value?.topTopics || [] : [],
)

const mentorLeaderboard = computed<MentorLeaderboardRow[]>(() =>
  Array.isArray(dashboardData.value?.mentorLeaderboard) ? dashboardData.value?.mentorLeaderboard || [] : [],
)

const statusBreakdown = computed<StatusBreakdownRow[]>(() =>
  (dashboardData.value?.statusBreakdown || []).map(status => ({
    ...status,
    color: statusColorMap[status.key] || 'bg-slate-500',
  })),
)

const recentActivity = computed<ActivityItem[]>(() => {
  const fallbackTimestamp = dashboardData.value?.snapshotAt || null

  return (dashboardData.value?.recentActivity || [])
    .map(activity => ({
      ...activity,
      title: activity.title || 'Activity update',
      description: activity.description || 'Company activity recorded.',
      timestamp: resolveActivityTimestamp(activity, fallbackTimestamp),
      icon: activityIconMap[activity.type] || Calendar,
      color: activityColorMap[activity.type] || 'text-blue-600',
    }))
    .sort((left, right) => toEpochMs(right.timestamp) - toEpochMs(left.timestamp))
})

const registeredEmployeesCount = computed(() => stats.value.registeredEmployees)
const participatingEmployeesCount = computed(() => stats.value.participatingEmployees)
const totalSessionsCount = computed(() => stats.value.totalSessions)
const completedSessionsCount = computed(() => stats.value.completedSessions)
const upcomingSessionsCount = computed(() => stats.value.upcomingSessions)
const pendingSessionsCount = computed(() => stats.value.pendingSessions)
const cancelledSessionsCount = computed(() => stats.value.cancelledSessions)
const unpaidSessionsCount = computed(() => stats.value.unpaidSessionsCount)
const totalHours = computed(() => roundTo(stats.value.totalHours, 1))
const averageRating = computed(() => roundTo(stats.value.averageRating, 1))
const completionRate = computed(() => stats.value.completionRate)
const whitelistTotal = computed(() => stats.value.whitelistTotal)
const verifiedEmployeesCount = computed(() => stats.value.verifiedEmployees)
const invitesSentCount = computed(() => stats.value.invitesSentCount)
const acceptedInvitesCount = computed(() => stats.value.acceptedInvitesCount)
const pendingInvitationSendCount = computed(() => stats.value.pendingInvitationSendCount)
const invitationAcceptanceRate = computed(() => stats.value.invitationAcceptanceRate)
const verificationRate = computed(() => stats.value.verificationRate)
const onboardingProgressRate = computed(() => {
  if (whitelistTotal.value > 0) {
    return clampPercent((verifiedEmployeesCount.value / whitelistTotal.value) * 100)
  }
  return verificationRate.value
})
const trackedPrograms = computed(() => programInsights.value.programs)
const programParticipants = computed<CompanyProgramParticipantRecord[]>(() =>
  Object.values(programInsights.value.participantsByProgramId).flat(),
)
const programParticipantsTotal = computed(() => programParticipants.value.length)
const inFlightParticipantCount = computed(() =>
  programParticipants.value.filter(participant => ['ENROLLED', 'ACTIVE'].includes(participant.status)).length,
)
const activeOrCompletedParticipantCount = computed(() =>
  programParticipants.value.filter(participant => ['ACTIVE', 'COMPLETED'].includes(participant.status)).length,
)
const completedParticipantCount = computed(() =>
  programParticipants.value.filter(participant => participant.status === 'COMPLETED').length,
)
const withdrawnParticipantCount = computed(() =>
  programParticipants.value.filter(participant => participant.status === 'WITHDRAWN').length,
)
const assignedInFlightParticipantCount = computed(() =>
  programParticipants.value.filter(participant =>
    ['ENROLLED', 'ACTIVE'].includes(participant.status) && Boolean(participant.mentorAssignment?.mentorId),
  ).length,
)
const mentorCoverageRate = computed(() => {
  if (!inFlightParticipantCount.value) return 0
  return clampPercent((assignedInFlightParticipantCount.value / inFlightParticipantCount.value) * 100)
})
const participantRetentionRate = computed(() => {
  if (!programParticipantsTotal.value) return 0
  return clampPercent(((programParticipantsTotal.value - withdrawnParticipantCount.value) / programParticipantsTotal.value) * 100)
})
const totalConfiguredSeats = computed(() =>
  trackedPrograms.value.reduce((total, program) => total + Math.max(0, Number(program.maxParticipants || 0)), 0),
)
const occupiedConfiguredSeats = computed(() =>
  programParticipants.value.filter(participant => ['ENROLLED', 'ACTIVE'].includes(participant.status)).length,
)
const capacityUtilizationRate = computed(() => {
  if (!totalConfiguredSeats.value) return 0
  return clampPercent((occupiedConfiguredSeats.value / totalConfiguredSeats.value) * 100)
})
const openRiskAlerts = computed(() => reviewSummary.value?.openAlerts || 0)
const highSeverityRiskAlerts = computed(() => reviewSummary.value?.highSeverityAlerts || 0)
const rematchCandidates = computed(() => reviewSummary.value?.rematchRecommendedAlerts || 0)
const riskSignalTotal = computed(() =>
  (reviewSummary.value?.lowMentorScoreAlerts || 0)
  + (reviewSummary.value?.lowMenteeScoreAlerts || 0)
  + (reviewSummary.value?.lowFitAlerts || 0),
)
const reviewCompletionRate = computed(() => {
  const total = reviewSummary.value?.totalReviewCycles || 0
  const revealed = reviewSummary.value?.revealedReviewCycles || 0
  if (!total) return 0
  return clampPercent((revealed / total) * 100)
})

const pendingPulses = computed(() => Number(pulseSummary.value?.pendingPulses || 0))

const toTrendPercentSeries = (values: number[]) => {
  if (!values.length) return []
  const max = Math.max(...values, 1)
  return values.map(value => clampPercent((value / max) * 100))
}

const toRatePercentSeries = (values: number[]) => values.map(value => clampPercent(value))

const buildFlatSeries = (value: number, points = 6) => Array.from({ length: points }, () => clampPercent(value))

const buildDeltaBadge = (current: number, previous: number, suffix = '') => {
  const diff = roundTo(current - previous, 1)
  const normalizedValue = Number.isInteger(diff) ? formatNumber(diff) : diff.toFixed(1)
  if (diff > 0) return { text: `+${normalizedValue}${suffix}`, tone: 'up' as const }
  if (diff < 0) return { text: `${normalizedValue}${suffix}`, tone: 'down' as const }
  return { text: `0${suffix}`, tone: 'neutral' as const }
}

const inferHealthTone = (value: number): 'healthy' | 'watch' | 'risk' => {
  if (value >= 75) return 'healthy'
  if (value >= 45) return 'watch'
  return 'risk'
}

const sessionSparkline = computed(() =>
  toTrendPercentSeries(monthlyTrends.value.map(trend => trend.sessions)),
)

const completionSparkline = computed(() =>
  toRatePercentSeries(
    monthlyTrends.value.map(trend =>
      trend.sessions ? (trend.completed / trend.sessions) * 100 : 0,
    ),
  ),
)

const throughputDelta = computed(() =>
  buildDeltaBadge(stats.value.sessionsCurrentPeriod, stats.value.sessionsPreviousPeriod),
)

const mentorCoverageDelta = computed(() => {
  const unassigned = Math.max(0, inFlightParticipantCount.value - assignedInFlightParticipantCount.value)
  return {
    text: unassigned > 0 ? `${formatNumber(unassigned)} unassigned` : 'fully assigned',
    tone: unassigned > 0 ? ('down' as const) : ('up' as const),
  }
})

const retentionDelta = computed(() => {
  const withdrawn = withdrawnParticipantCount.value
  return {
    text: withdrawn > 0 ? `${formatNumber(withdrawn)} withdrawn` : '0 withdrawn',
    tone: withdrawn > 0 ? ('down' as const) : ('up' as const),
  }
})

const capacityDelta = computed(() => {
  if (!totalConfiguredSeats.value) {
    return { text: 'set seat limits', tone: 'neutral' as const }
  }
  const remaining = Math.max(0, totalConfiguredSeats.value - occupiedConfiguredSeats.value)
  return {
    text: `${formatNumber(remaining)} seats open`,
    tone: remaining === 0 ? ('neutral' as const) : ('up' as const),
  }
})

const topKpis = computed<DashboardKpi[]>(() => [
  {
    id: 'capacity',
    title: 'Capacity Utilization',
    value: `${capacityUtilizationRate.value}%`,
    subtitle: `${formatNumber(occupiedConfiguredSeats.value)} active employees across ${formatNumber(totalConfiguredSeats.value)} program seats`,
    progress: capacityUtilizationRate.value,
    tone: 'brand',
    deltaText: capacityDelta.value.text,
    deltaTone: capacityDelta.value.tone,
    healthTone: inferHealthTone(capacityUtilizationRate.value),
    sparkline: sessionSparkline.value.length ? sessionSparkline.value : buildFlatSeries(capacityUtilizationRate.value),
    icon: Users,
  },
  {
    id: 'mentor-coverage',
    title: 'Mentor Coverage',
    value: `${mentorCoverageRate.value}%`,
    subtitle: `${formatNumber(assignedInFlightParticipantCount.value)} assigned of ${formatNumber(inFlightParticipantCount.value)} active employees`,
    progress: mentorCoverageRate.value,
    tone: 'success',
    deltaText: mentorCoverageDelta.value.text,
    deltaTone: mentorCoverageDelta.value.tone,
    healthTone: inferHealthTone(mentorCoverageRate.value),
    sparkline: completionSparkline.value.length ? completionSparkline.value : buildFlatSeries(mentorCoverageRate.value),
    icon: UserCheck,
  },
  {
    id: 'retention',
    title: 'Participant Retention',
    value: `${participantRetentionRate.value}%`,
    subtitle: `${formatNumber(programParticipantsTotal.value - withdrawnParticipantCount.value)} retained of ${formatNumber(programParticipantsTotal.value)} enrolled`,
    progress: participantRetentionRate.value,
    tone: 'brand',
    deltaText: retentionDelta.value.text,
    deltaTone: retentionDelta.value.tone,
    healthTone: inferHealthTone(participantRetentionRate.value),
    sparkline: sessionSparkline.value.length ? sessionSparkline.value : buildFlatSeries(participantRetentionRate.value),
    icon: Star,
  },
  {
    id: 'session-completion',
    title: 'Session Completion',
    value: `${completionRate.value}%`,
    subtitle: `${formatNumber(completedSessionsCount.value)} completed · ${formatNumber(cancelledSessionsCount.value)} cancelled`,
    progress: clampPercent(completionRate.value),
    tone: 'success',
    deltaText: throughputDelta.value.text,
    deltaTone: throughputDelta.value.tone,
    healthTone: inferHealthTone(completionRate.value),
    sparkline: completionSparkline.value.length ? completionSparkline.value : buildFlatSeries(completionRate.value),
    icon: CheckCircle,
  },
])

const dashboardAlerts = computed<DashboardAlert[]>(() => {
  const alerts: DashboardAlert[] = []

  if (sessionLoadSummary.value.failedEmployees > 0) {
    alerts.push({
      id: 'session-load-gap',
      title: 'Partial session coverage',
      message: `Session data failed for ${formatNumber(sessionLoadSummary.value.failedEmployees)} ${pluralize(sessionLoadSummary.value.failedEmployees, 'employee')}. Counts may be understated until those requests succeed.`,
      icon: AlertTriangle,
      variant: 'destructive',
    })
  }

  if (openRiskAlerts.value > 0) {
    alerts.push({
      id: 'open-risk-alerts',
      title: 'Risk queue needs intervention',
      message: `${formatNumber(openRiskAlerts.value)} review alerts are open, including ${formatNumber(highSeverityRiskAlerts.value)} high-severity signals.`,
      icon: Shield,
    })
  }

  if (pendingSessionsCount.value > 0) {
    alerts.push({
      id: 'pending-sessions',
      title: 'Pending mentor responses',
      message: `${formatNumber(pendingSessionsCount.value)} ${pluralize(pendingSessionsCount.value, 'session')} ${pendingSessionsCount.value === 1 ? 'is' : 'are'} still awaiting a mentor response.`,
      icon: Clock,
    })
  }

  if (unpaidSessionsCount.value > 0) {
    alerts.push({
      id: 'unpaid-sessions',
      title: 'Unpaid booked sessions',
      message: `${formatNumber(unpaidSessionsCount.value)} ${pluralize(unpaidSessionsCount.value, 'session')} ${unpaidSessionsCount.value === 1 ? 'has' : 'have'} a price but are not marked as paid.`,
      icon: AlertTriangle,
    })
  }

  if (programInsights.value.failedPrograms > 0) {
    alerts.push({
      id: 'participant-coverage-gap',
      title: 'Program insights partially loaded',
      message: `Participant metrics failed to load for ${formatNumber(programInsights.value.failedPrograms)} ${pluralize(programInsights.value.failedPrograms, 'program')}. Coverage-based KPIs may be understated.`,
      icon: AlertTriangle,
    })
  }

  return alerts
})

const sessionTrendChartData = computed(() =>
  monthlyTrends.value.map(trend => ({
    month: trend.label,
    sessions: trend.sessions,
    completed: trend.completed,
    hours: roundTo(trend.hours, 1),
  })),
)

const statusDonutData = computed(() =>
  statusBreakdown.value
    .filter(status => status.count > 0)
    .map(status => ({
      label: status.label,
      value: status.count,
    })),
)

const inviteStageFunnelGraph = computed<FunnelGraph>(() => {
  const whitelistRaw = Math.max(whitelistTotal.value, invitesSentCount.value + pendingInvitationSendCount.value)
  const invitedRaw = invitesSentCount.value
  const acceptedRaw = acceptedInvitesCount.value
  const verifiedRaw = verifiedEmployeesCount.value
  const activeRaw = stats.value.participatingEmployees

  const whitelist = Math.max(whitelistRaw, 0)
  const invited = Math.max(0, Math.min(invitedRaw, whitelist))
  const accepted = Math.max(0, Math.min(acceptedRaw, invited))
  const verified = Math.max(0, Math.min(verifiedRaw, accepted))
  const active = Math.max(0, Math.min(activeRaw, verified))

  const nodes: FunnelNode[] = [
    { id: 'whitelist', stage: 'Whitelist', color: '#e8bddf' },
    { id: 'invited', stage: 'Invited', color: '#cf8fbe' },
    { id: 'accepted', stage: 'Accepted', color: '#b968a8' },
    { id: 'verified', stage: 'Verified', color: '#9a4884' },
    { id: 'active', stage: 'Active', color: '#2f8f83' },
    { id: 'drop_pre_invite', stage: 'Not Invited', color: '#f2dce8' },
    { id: 'drop_pre_accept', stage: 'Did Not Accept', color: '#f3e6ef' },
    { id: 'drop_pre_verify', stage: 'Not Verified', color: '#f6edf3' },
    { id: 'drop_pre_active', stage: 'Not Active', color: '#f8f2f6' },
  ]

  const links: FunnelLink[] = [
    { source: 'whitelist', target: 'invited', value: invited, color: '#9a4884' },
    { source: 'whitelist', target: 'drop_pre_invite', value: Math.max(0, whitelist - invited), color: '#e9c7de' },
    { source: 'invited', target: 'accepted', value: accepted, color: '#9a4884' },
    { source: 'invited', target: 'drop_pre_accept', value: Math.max(0, invited - accepted), color: '#ecd4e5' },
    { source: 'accepted', target: 'verified', value: verified, color: '#9a4884' },
    { source: 'accepted', target: 'drop_pre_verify', value: Math.max(0, accepted - verified), color: '#f0e1eb' },
    { source: 'verified', target: 'active', value: active, color: '#2f8f83' },
    { source: 'verified', target: 'drop_pre_active', value: Math.max(0, verified - active), color: '#f4ebf1' },
  ].filter(link => link.value > 0)

  return { nodes, links }
})

const participantStageFunnelGraph = computed<FunnelGraph>(() => {
  const enrolled = Math.max(programParticipantsTotal.value, 0)
  const active = Math.max(0, Math.min(activeOrCompletedParticipantCount.value, enrolled))
  const completed = Math.max(0, Math.min(completedParticipantCount.value, active))

  const nodes: FunnelNode[] = [
    { id: 'enrolled', stage: 'Enrolled', color: '#e8bddf' },
    { id: 'active', stage: 'Active', color: '#b968a8' },
    { id: 'completed', stage: 'Completed', color: '#2f8f83' },
    { id: 'not_active', stage: 'Not Active', color: '#f3e6ef' },
    { id: 'not_completed', stage: 'Not Completed', color: '#f6edf3' },
  ]

  const links: FunnelLink[] = [
    { source: 'enrolled', target: 'active', value: active, color: '#9a4884' },
    { source: 'enrolled', target: 'not_active', value: Math.max(0, enrolled - active), color: '#e9c7de' },
    { source: 'active', target: 'completed', value: completed, color: '#2f8f83' },
    { source: 'active', target: 'not_completed', value: Math.max(0, active - completed), color: '#edd7e7' },
  ].filter(link => link.value > 0)

  return { nodes, links }
})

const usesInviteFunnel = computed(() => inviteStageFunnelGraph.value.links.some(link => link.value > 0))
const employeeFunnelGraph = computed<FunnelGraph>(() =>
  usesInviteFunnel.value ? inviteStageFunnelGraph.value : participantStageFunnelGraph.value,
)
const employeeFunnelDescription = computed(() =>
  usesInviteFunnel.value
    ? 'From whitelist through activation, with visibility on where progress drops.'
    : 'From enrollment through active mentoring and completion, highlighting operational drop-off.',
)
const employeeFunnelCards = computed(() =>
  usesInviteFunnel.value
    ? [
      { label: 'Invite acceptance', value: `${invitationAcceptanceRate.value}%` },
      { label: 'Verification rate', value: `${verificationRate.value}%` },
    ]
    : [
      { label: 'Active employees', value: formatNumber(inFlightParticipantCount.value) },
      { label: 'Completed employees', value: formatNumber(completedParticipantCount.value) },
    ],
)
const hasEmployeeFunnelData = computed(() => employeeFunnelGraph.value.links.some(link => link.value > 0))
const employeeFunnelNodeValueMap = computed<Record<string, number>>(() => {
  const map: Record<string, number> = {}

  employeeFunnelGraph.value.links.forEach(link => {
    map[link.source] = Math.max(map[link.source] || 0, link.value)
    map[link.target] = Math.max(map[link.target] || 0, link.value)
  })

  return map
})

const getFunnelNodeLabel = (node: FunnelNode) => node.stage
const getFunnelNodeSubLabel = (node: FunnelNode) => formatNumber(employeeFunnelNodeValueMap.value[node.id] || 0)
const getFunnelNodeColor = (node: FunnelNode) => node.color
const getFunnelLinkColor = (link: FunnelLink) => link.color
const getFunnelLinkValue = (link: FunnelLink) => link.value

const topicChartData = computed(() =>
  topTopics.value.slice(0, 6).map(topic => ({
    topic: topic.label,
    bookings: topic.sessions,
    completed: topic.completed,
  })),
)

const riskSignalChartData = computed(() => {
  const data = [
    { label: 'Low mentor score', value: reviewSummary.value?.lowMentorScoreAlerts || 0 },
    { label: 'Low mentee score', value: reviewSummary.value?.lowMenteeScoreAlerts || 0 },
    { label: 'Low fit score', value: reviewSummary.value?.lowFitAlerts || 0 },
    { label: 'Do not continue', value: reviewSummary.value?.doNotContinueAlerts || 0 },
  ]

  return data.filter(item => item.value > 0)
})

const sessionTrendColors = [BRAND_PRIMARY, '#1d4ed8', '#059669']
const statusDonutColors = ['#16a34a', '#2563eb', '#f97316', '#ef4444']
const topicColors = [BRAND_PRIMARY, '#2f8f83']
const riskSignalColors = ['#ef4444', '#f97316', '#db2777', '#7f1d1d']

const chartAxisFormatter = (tick: number | Date) => formatNumber(Number(tick) || 0)

const loadInsightsSummary = async (resolvedCompanyId: string, dateFilter: DashboardDateFilterParams) => {
  const dateRangeParams = {
    startDate: dateFilter.startDate,
    endDate: dateFilter.endDate,
  }

  const [reviewResult, pulseResult] = await Promise.allSettled([
    reviewAlertsApi.getReviewAlertSummary(resolvedCompanyId, null, dateRangeParams),
    pulsesApi.getCompanyPulseSummary(resolvedCompanyId, dateRangeParams),
  ])

  const partialErrors: string[] = []

  if (reviewResult.status === 'fulfilled' && reviewResult.value?.success) {
    reviewSummary.value = reviewResult.value.data || null
  } else {
    reviewSummary.value = null
    partialErrors.push('review analytics')
  }

  if (pulseResult.status === 'fulfilled' && pulseResult.value?.success) {
    pulseSummary.value = pulseResult.value.data || null
  } else {
    pulseSummary.value = null
    partialErrors.push('pulse insights')
  }

  insightsError.value = partialErrors.length
    ? `Some insights are temporarily unavailable: ${partialErrors.join(' and ')}.`
    : null
}

const loadAllCompanyPrograms = async (resolvedCompanyId: string, dateFilter: DashboardDateFilterParams) => {
  const programs: CompanyProgramRecord[] = []
  const size = 50
  let page = 0
  let hasNext = true
  let safety = 0

  while (hasNext && safety < 50) {
    const response = await companyProgramsApi.getCompanyPrograms({
      companyId: resolvedCompanyId,
      page,
      size,
      status: null,
      liveOnly: false,
      ...(dateFilter.startDate ? { startDate: dateFilter.startDate } : {}),
      ...(dateFilter.endDate ? { endDate: dateFilter.endDate } : {}),
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to load company program portfolio.')
    }

    programs.push(...(response.data.programs || []))
    hasNext = Boolean(response.data.hasNext)
    page = Number(response.data.currentPage || page) + 1
    safety += 1
  }

  return programs
}

const loadProgramParticipants = async (companyProgramId: string, dateFilter: DashboardDateFilterParams) => {
  const participants: CompanyProgramParticipantRecord[] = []
  const size = 100
  let page = 0
  let hasNext = true
  let safety = 0

  while (hasNext && safety < 50) {
    const response = await companyProgramsApi.getCompanyProgramParticipants({
      companyProgramId,
      page,
      size,
      status: null,
      search: '',
      ...(dateFilter.startDate ? { startDate: dateFilter.startDate } : {}),
      ...(dateFilter.endDate ? { endDate: dateFilter.endDate } : {}),
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to load program employees.')
    }

    participants.push(...(response.data.participants || []))
    hasNext = Boolean(response.data.hasNext)
    page = Number(response.data.currentPage || page) + 1
    safety += 1
  }

  return participants
}

const loadProgramInsights = async (resolvedCompanyId: string, dateFilter: DashboardDateFilterParams) => {
  if (!resolvedCompanyId) {
    programInsights.value = { ...DEFAULT_PROGRAM_INSIGHTS }
    programInsightsError.value = 'Company ID not found. Log in again and retry.'
    return
  }

  try {
    const programs = await loadAllCompanyPrograms(resolvedCompanyId, dateFilter)
    const participantsByProgramId: Record<string, CompanyProgramParticipantRecord[]> = {}
    let failedPrograms = 0
    const chunkSize = 4

    for (let index = 0; index < programs.length; index += chunkSize) {
      const chunk = programs.slice(index, index + chunkSize)
      const chunkResults = await Promise.allSettled(
        chunk.map(async program => ({
          programId: program.id,
          participants: await loadProgramParticipants(program.id, dateFilter),
        })),
      )

      chunkResults.forEach(result => {
        if (result.status === 'fulfilled') {
          participantsByProgramId[result.value.programId] = result.value.participants
          return
        }

        failedPrograms += 1
      })
    }

    programInsights.value = {
      programs,
      participantsByProgramId,
      failedPrograms,
    }
    programInsightsError.value = failedPrograms > 0
      ? `Participant data is missing for ${formatNumber(failedPrograms)} ${pluralize(failedPrograms, 'program')}.`
      : null
  } catch (programError: any) {
    console.error('Failed to load program insights:', programError)
    programInsights.value = { ...DEFAULT_PROGRAM_INSIGHTS }
    programInsightsError.value =
      programError?.response?.data?.message ||
      programError?.message ||
      'Failed to load company program insights.'
  }
}

const openEmployeesWorkspace = async () => {
  await router.push('/app/admin/employees')
}

const openSessionsWorkspace = async () => {
  await router.push('/app/admin/sessions')
}

const openActivityWorkspace = async () => {
  await router.push({
    path: '/app/admin/activity',
    query: {
      startDate: appliedDateRange.value.startDate,
      endDate: appliedDateRange.value.endDate,
      preset: appliedDateRange.value.preset,
    },
  })
}

const openBillingWorkspace = async () => {
  await router.push('/app/admin/billing')
}

const applyDateFilter = async () => {
  if (!selectedStartDate.value || !selectedEndDate.value) {
    toast.error('Select both start and end dates.')
    return
  }

  if (selectedStartDate.value > selectedEndDate.value) {
    toast.error('Start date cannot be after end date.')
    return
  }

  const presetRange = selectedDatePreset.value === 'custom'
    ? null
    : buildPresetDateRange(selectedDatePreset.value)
  const useCustomRange = Boolean(
    presetRange
    && (
      presetRange.startDate !== selectedStartDate.value
      || presetRange.endDate !== selectedEndDate.value
    ),
  )

  appliedDateRange.value = {
    preset: useCustomRange ? 'custom' : selectedDatePreset.value,
    startDate: selectedStartDate.value,
    endDate: selectedEndDate.value,
  }

  if (useCustomRange) {
    selectedDatePreset.value = 'custom'
  }

  await refreshDashboard()
}

const onDatePresetChange = (value: string) => {
  if (!value) return
  const preset = value as DashboardDatePreset
  syncDateInputsFromPreset(preset)
}

const refreshDashboard = async () => {
  const resolvedCompanyId = companyId.value
  if (!resolvedCompanyId) {
    error.value = 'Company ID not found. Log in again and retry.'
    return
  }

  isLoading.value = true
  error.value = null
  loadMessage.value = `Loading company dashboard for ${selectedDateRangeLabel.value}...`

  try {
    const dateFilter = dashboardDateFilterParams.value
    const [dashboardResult, companySubscriptionsResult] = await Promise.all([
      dashboardApi.getCompanyDashboard(resolvedCompanyId, dateFilter),
      companySubscriptionsApi.getCompanySubscriptions(resolvedCompanyId).catch((subscriptionError) => {
        console.error('Failed to load company subscriptions:', subscriptionError)
        return { success: false, data: [] as CompanySubscriptionSummary[] }
      }),
      loadInsightsSummary(resolvedCompanyId, dateFilter),
      loadProgramInsights(resolvedCompanyId, dateFilter),
    ])

    companySubscriptions.value = companySubscriptionsResult?.success
      ? companySubscriptionsResult.data || []
      : []

    const payload = dashboardResult?.data

    if (!payload?.success) {
      throw new Error(payload?.message || 'Failed to load live dashboard data.')
    }

    dashboardData.value = payload.data || {}

    const storedProfile = getStoredProfile()
    storedCompanyName.value =
      payload?.data?.company?.name ||
      storedProfile?.company?.name ||
      storedCompanyName.value
  } catch (loadError: any) {
    console.error('Failed to load corporate dashboard:', loadError)
    error.value =
      loadError?.response?.data?.message ||
      loadError?.message ||
      'Failed to load live dashboard data.'
    toast.error(error.value)
  } finally {
    isLoading.value = false
    loadMessage.value = ''
  }
}

onMounted(() => {
  if (
    route.query.tab === 'billing'
    || route.query.context === 'company_subscription'
    || route.query.invoice_paid === '1'
    || route.query.invoice_cancelled === '1'
  ) {
    router.replace({
      path: '/app/admin/billing',
      query: route.query,
    })
    return
  }

  const storedProfile = getStoredProfile()
  storedCompanyName.value = storedProfile?.company?.name || storedCompanyName.value
  initializeDashboardDateRangeFromRoute()
  refreshDashboard()
})
</script>

<template>
  <div class="corporate-admin-dashboard container mx-auto space-y-5 px-4 py-5">
    <div class="space-y-3">
      <div class="space-y-1">
        <h1 class="text-xl font-semibold tracking-[-0.01em] text-[#1f2430] md:text-2xl">Corporate Admin Dashboard</h1>
        <p class="text-sm text-[#687386]">
          A unified dashboard for program delivery, employee journey health, and intervention priorities.
        </p>
        <p v-if="lastRefreshedAt" class="text-xs text-[#8b95a4]">
          Last refreshed {{ formatDateTime(lastRefreshedAt) }}
        </p>
      </div>

      <div class="dashboard-filter-shell">
        <div class="flex flex-wrap items-end gap-2.5">
          <div class="w-full min-w-[170px] sm:w-auto">
            <p class="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#8f5f82]">Range</p>
            <Select :model-value="selectedDatePreset" @update:model-value="onDatePresetChange">
              <SelectTrigger class="h-9 border-[#d8dce4] bg-white text-[#1f2430]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in DASHBOARD_DATE_PRESET_OPTIONS"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="min-w-[150px]">
            <p class="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#8f5f82]">From</p>
            <DatePicker
              v-model="selectedStartDate"
              placeholder="Select start date"
              class="h-9 border-[#d8dce4] bg-white text-[#1f2430]"
            />
          </div>

          <div class="min-w-[150px]">
            <p class="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#8f5f82]">To</p>
            <DatePicker
              v-model="selectedEndDate"
              placeholder="Select end date"
              class="h-9 border-[#d8dce4] bg-white text-[#1f2430]"
            />
          </div>

          <Button class="h-9 rounded-md bg-[#9a4884] px-4 text-white hover:bg-[#7f3a6d]" @click="applyDateFilter" :disabled="isLoading">
            Apply Filter
          </Button>

          <Button variant="outline" class="h-9 rounded-md border-[#d8dce4] bg-white px-3 text-[#4f5968] hover:bg-[#f8f7fb]" @click="refreshDashboard" :disabled="isLoading">
            <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
            Refresh
          </Button>
        </div>
        <p class="mt-2 text-xs text-[#7b4b6d]">
          Showing {{ selectedDateRangeLabel }}
        </p>
      </div>
    </div>

    <Alert v-if="isLoading">
      <RefreshCw class="h-4 w-4 animate-spin" />
      <AlertDescription>
        {{ loadMessage || 'Refreshing live dashboard data...' }}
      </AlertDescription>
    </Alert>

    <Alert v-if="error" variant="destructive">
      <AlertTriangle class="h-4 w-4" />
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <Alert v-if="insightsError" variant="default">
      <AlertTriangle class="h-4 w-4" />
      <AlertDescription>{{ insightsError }}</AlertDescription>
    </Alert>

    <Alert v-if="programInsightsError" variant="default">
      <AlertTriangle class="h-4 w-4" />
      <AlertDescription>{{ programInsightsError }}</AlertDescription>
    </Alert>

    <div class="space-y-3">
      <Alert
        v-for="alert in dashboardAlerts"
        :key="alert.id"
        :variant="alert.variant || 'default'"
      >
        <component :is="alert.icon" class="h-4 w-4" />
        <AlertDescription>
          <span class="font-medium">{{ alert.title }}:</span>
          {{ alert.message }}
        </AlertDescription>
      </Alert>
    </div>

    <div v-if="isLoading && !hasLoadedData" class="space-y-6">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton v-for="index in 6" :key="`kpi-${index}`" class="h-36 w-full" />
      </div>
      <div class="grid gap-6 xl:grid-cols-2">
        <Skeleton class="h-[360px] w-full" />
        <Skeleton class="h-[360px] w-full" />
      </div>
    </div>

    <template v-else>
      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiSummaryCard
            v-for="kpi in topKpis"
            :key="kpi.id"
            :title="kpi.title"
            :value="kpi.value"
            :subtitle="kpi.subtitle"
            :progress="kpi.progress"
            :icon="kpi.icon"
            :tone="kpi.tone"
            :delta-text="kpi.deltaText"
            :delta-tone="kpi.deltaTone"
            :health-tone="kpi.healthTone"
            :sparkline="kpi.sparkline"
          />
        </div>

        <Card class="dashboard-card">
          <CardHeader class="space-y-2 p-4 pb-2">
            <div class="flex items-start justify-between gap-3">
              <div>
                <CardTitle class="text-sm font-semibold text-[#1f2430]">Session Wallet</CardTitle>
                <CardDescription class="text-xs text-[#7c8595]">
                  Company-funded sessions available for employee allocation.
                </CardDescription>
              </div>
              <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e9f6f1] text-[#00856f]">
                <BookOpen class="h-4 w-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent class="space-y-4 p-4 pt-0">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-[#7c8595]">Sessions Available</p>
              <p class="mt-1 text-2xl font-semibold leading-none text-[#1f2430]">{{ formatNumber(walletAvailableSessions) }}</p>
              <p class="mt-1 text-xs text-[#7c8595]">
                {{ formatCurrency(walletAvailableBalance, walletCurrency) }} remaining value
              </p>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="rounded-md border border-[#edf0f4] bg-[#fbfcfd] p-2">
                <p class="font-medium text-[#7c8595]">Purchased</p>
                <p class="mt-1 text-sm font-semibold text-[#1f2430]">{{ formatNumber(walletPurchasedSessions) }}</p>
              </div>
              <div class="rounded-md border border-[#edf0f4] bg-[#fbfcfd] p-2">
                <p class="font-medium text-[#7c8595]">Reserved</p>
                <p class="mt-1 text-sm font-semibold text-[#1f2430]">{{ formatNumber(walletReservedSessions) }}</p>
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs text-[#7c8595]">
                <span>Wallet utilization</span>
                <span>{{ walletUtilizationRate }}%</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-[#eef1f5]">
                <div class="h-full rounded-full bg-[#00856f]" :style="{ width: `${walletUtilizationRate}%` }" />
              </div>
            </div>

            <Button class="h-9 w-full rounded-md bg-[#00856f] text-white hover:bg-[#006f5d]" @click="openBillingWorkspace">
              {{ managedCompanyWallet ? 'Manage Billing' : 'Buy Sessions' }}
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card class="dashboard-card">
          <CardContent class="dashboard-card__content p-4">
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-[#7c8595]">Registered</p>
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f4deee] text-[#9a4884]">
                <Users class="h-4 w-4" />
              </span>
            </div>
            <p class="mt-3 text-2xl font-semibold text-[#1f2430]">{{ formatNumber(registeredEmployeesCount) }}</p>
            <p class="mt-1 text-xs text-[#7c8595]">Employees listed in company workspace</p>
          </CardContent>
        </Card>

        <Card class="dashboard-card">
          <CardContent class="dashboard-card__content p-4">
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-[#7c8595]">Participating</p>
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#ebf6ee] text-[#2f8f83]">
                <UserCheck class="h-4 w-4" />
              </span>
            </div>
            <p class="mt-3 text-2xl font-semibold text-[#1f2430]">{{ formatNumber(participatingEmployeesCount) }}</p>
            <p class="mt-1 text-xs text-[#7c8595]">Employees active in mentoring programs</p>
          </CardContent>
        </Card>

        <Card class="dashboard-card">
          <CardContent class="dashboard-card__content p-4">
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-[#7c8595]">Sessions</p>
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f4deee] text-[#9a4884]">
                <Calendar class="h-4 w-4" />
              </span>
            </div>
            <p class="mt-3 text-2xl font-semibold text-[#1f2430]">{{ formatNumber(totalSessionsCount) }}</p>
            <p class="mt-1 text-xs text-[#7c8595]">Total booked sessions in selected period</p>
          </CardContent>
        </Card>

        <Card class="dashboard-card">
          <CardContent class="dashboard-card__content p-4">
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-[#7c8595]">Hours</p>
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f4deee] text-[#9a4884]">
                <Clock class="h-4 w-4" />
              </span>
            </div>
            <p class="mt-3 text-2xl font-semibold text-[#1f2430]">{{ formatHours(totalHours) }}</p>
            <p class="mt-1 text-xs text-[#7c8595]">Mentoring hours delivered</p>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-5 xl:grid-cols-2">
        <Card class="dashboard-card">
          <CardHeader class="dashboard-card__header">
            <div class="flex items-center justify-between gap-3">
              <CardTitle class="dashboard-section-title">Session Health</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                class="h-8 px-2 text-xs font-semibold text-[#9a4884] hover:bg-[#f6eaf3] hover:text-[#7f3a6d]"
                @click="openSessionsWorkspace"
              >
                View Details
                <ArrowRight class="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent class="dashboard-card__content grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-[#ece6ee] bg-[#f9f8fb] p-4">
              <p class="text-sm text-[#6f7888]">Completed</p>
              <p class="mt-2 text-3xl font-semibold text-[#9a4884]">{{ formatNumber(completedSessionsCount) }}</p>
            </div>
            <div class="rounded-lg border border-[#ece6ee] bg-[#f9f8fb] p-4">
              <p class="text-sm text-[#6f7888]">Upcoming</p>
              <p class="mt-2 text-3xl font-semibold text-[#2d3646]">{{ formatNumber(upcomingSessionsCount) }}</p>
            </div>
            <div class="rounded-lg border border-[#ece6ee] bg-[#f9f8fb] p-4">
              <p class="text-sm text-[#6f7888]">Avg Rating</p>
              <p class="mt-2 text-3xl font-semibold text-[#2d3646]">
                {{ averageRating ? averageRating.toFixed(1) : '—' }}
                <span class="text-lg font-medium text-[#4f8c3f]">/5.0</span>
              </p>
            </div>
            <div class="rounded-lg border border-[#ece6ee] bg-[#f9f8fb] p-4">
              <p class="text-sm text-[#6f7888]">Total Hours</p>
              <p class="mt-2 text-3xl font-semibold text-[#2d3646]">{{ formatHours(totalHours) }}h</p>
            </div>
          </CardContent>
        </Card>

        <Card class="dashboard-card">
          <CardHeader class="dashboard-card__header">
            <div class="flex items-center justify-between gap-3">
              <CardTitle class="dashboard-section-title">Employee Onboarding</CardTitle>
              <span class="inline-flex items-center gap-2 text-xs font-medium text-[#6f7888]">
                <span class="h-2.5 w-2.5 rounded-full bg-[#9a4884]" />
                Real-time status
              </span>
            </div>
          </CardHeader>
          <CardContent class="dashboard-card__content space-y-4">
            <div class="flex items-center justify-between rounded-lg border border-[#ece6ee] bg-[#f9f8fb] p-3">
              <div class="flex items-center gap-2">
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f4deee] text-[#9a4884]">
                  <UserPlus class="h-4 w-4" />
                </span>
                <span class="text-sm font-medium text-[#2d3646]">Whitelist</span>
              </div>
              <p class="text-3xl font-semibold text-[#2d3646]">{{ formatNumber(whitelistTotal) }}</p>
            </div>

            <div class="h-2 overflow-hidden rounded-full bg-[#efe5ee]">
              <div
                class="h-full rounded-full bg-[#9a4884] transition-all duration-300"
                :style="{ width: `${onboardingProgressRate}%` }"
              />
            </div>

            <div class="flex items-center justify-between rounded-lg border border-[#ece6ee] bg-[#f9f8fb] p-3">
              <div class="flex items-center gap-2">
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#ebf6ee] text-[#3d7f2b]">
                  <UserCheck class="h-4 w-4" />
                </span>
                <span class="text-sm font-medium text-[#2d3646]">Verified</span>
              </div>
              <p class="text-3xl font-semibold text-[#2d3646]">{{ formatNumber(verifiedEmployeesCount) }}</p>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-lg border border-[#e8d4e0] bg-white p-4">
                <p class="text-sm text-[#6f7888]">Invites Sent</p>
                <p class="mt-1 text-3xl font-semibold text-[#2d3646]">{{ formatNumber(invitesSentCount) }}</p>
              </div>
              <div class="rounded-lg border border-[#e8d4e0] bg-white p-4">
                <p class="text-sm text-[#6f7888]">Accepted Invites</p>
                <p class="mt-1 text-3xl font-semibold text-[#2d3646]">{{ formatNumber(acceptedInvitesCount) }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <Card class="dashboard-card">
          <CardHeader class="dashboard-card__header">
            <CardTitle class="dashboard-section-title">
              <TrendingUp class="h-5 w-5 text-[#9a4884]" />
              Delivery Trends
            </CardTitle>
            <CardDescription class="dashboard-section-description">
              Monthly movement of booked sessions, completed sessions, and mentoring hours.
            </CardDescription>
          </CardHeader>
          <CardContent class="dashboard-card__content">
            <LineChart
              :data="sessionTrendChartData"
              :categories="['sessions', 'completed']"
              index="month"
              :colors="sessionTrendColors"
              :y-formatter="chartAxisFormatter"
              :show-grid-line="true"
              class="h-[320px] admin-chart"
            />
          </CardContent>
        </Card>

        <Card class="dashboard-card">
          <CardHeader class="dashboard-card__header">
            <CardTitle class="dashboard-section-title">
              <BarChart3 class="h-5 w-5 text-[#9a4884]" />
              Session Mix
            </CardTitle>
            <CardDescription class="dashboard-section-description">
              Distribution of session statuses across the full company portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent class="dashboard-card__content space-y-4">
            <DonutChart
              :data="statusDonutData"
              category="value"
              index="label"
              :colors="statusDonutColors"
              :value-formatter="(tick: number) => formatNumber(tick)"
              class="h-[260px] admin-chart"
            />

            <div class="space-y-2">
              <div
                v-for="status in statusBreakdown"
                :key="status.key"
                class="flex items-center justify-between rounded-lg border border-[#ece6ee] bg-[#f8f7fa] px-3 py-2 text-sm"
              >
                <div class="flex items-center gap-2">
                  <span class="h-2.5 w-2.5 rounded-full" :class="status.color" />
                  <span>{{ status.label }}</span>
                </div>
                <span class="text-muted-foreground">{{ formatNumber(status.count) }} · {{ status.percentage }}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-5 xl:grid-cols-2">
        <Card class="dashboard-card">
          <CardHeader class="dashboard-card__header">
            <CardTitle class="dashboard-section-title">
              <UserPlus class="h-5 w-5 text-[#9a4884]" />
              Employee Funnel
            </CardTitle>
            <CardDescription class="dashboard-section-description">{{ employeeFunnelDescription }}</CardDescription>
          </CardHeader>
          <CardContent class="dashboard-card__content space-y-5">
            <div v-if="hasEmployeeFunnelData" class="h-[310px] rounded-xl border border-[#e8dde8] bg-[#fcf8fb] p-2 admin-chart">
              <VisSingleContainer :data="employeeFunnelGraph" :style="{ height: '100%' }">
                <VisSankey
                  :data="employeeFunnelGraph"
                  :duration="450"
                  :label="getFunnelNodeLabel"
                  :sub-label="getFunnelNodeSubLabel"
                  :node-color="getFunnelNodeColor"
                  :link-color="getFunnelLinkColor"
                  :link-value="getFunnelLinkValue"
                  :node-width="16"
                  :node-padding="14"
                  :node-align="'left'"
                  :label-font-size="12"
                  :sub-label-font-size="11"
                  :show-single-node="false"
                />
              </VisSingleContainer>
            </div>
            <div v-else class="rounded-xl border border-dashed border-[#decce0] bg-[#faf7fb] p-5 text-sm text-[#707b8b]">
              Funnel will appear once invite or participant progression data starts flowing.
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div
                v-for="card in employeeFunnelCards"
                :key="card.label"
                class="rounded-lg border border-[#ece6ee] bg-[#f9f8fb] p-3 text-sm"
              >
                <p class="text-muted-foreground">{{ card.label }}</p>
                <p class="mt-1 text-lg font-semibold">{{ card.value }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="dashboard-card">
          <CardHeader class="dashboard-card__header">
            <CardTitle class="dashboard-section-title">
              <BookOpen class="h-5 w-5 text-[#9a4884]" />
              Top Topics
            </CardTitle>
            <CardDescription class="dashboard-section-description">
              Most-booked learning areas, with completion depth per topic.
            </CardDescription>
          </CardHeader>
          <CardContent class="dashboard-card__content">
            <BarChart
              :data="topicChartData"
              type="grouped"
              :categories="['bookings', 'completed']"
              index="topic"
              :colors="topicColors"
              :show-grid-line="true"
              :y-formatter="chartAxisFormatter"
              class="h-[300px] admin-chart"
            />
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card class="dashboard-card">
          <CardHeader class="dashboard-card__header">
            <CardTitle class="dashboard-section-title">
              <Shield class="h-5 w-5 text-[#9a4884]" />
              Risk & Feedback Signals
            </CardTitle>
            <CardDescription class="dashboard-section-description">
              Blind-review outcomes and intervention demand from the two-way WhatsApp-first rating loop.
            </CardDescription>
          </CardHeader>
          <CardContent class="dashboard-card__content space-y-5">
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="dashboard-stat-chip rounded-lg border p-4">
                <p class="text-sm text-muted-foreground">Open alerts</p>
                <p class="mt-1 text-2xl font-semibold">{{ formatNumber(openRiskAlerts) }}</p>
                <p class="text-xs text-muted-foreground">{{ formatNumber(highSeverityRiskAlerts) }} high severity</p>
              </div>
              <div class="dashboard-stat-chip rounded-lg border p-4">
                <p class="text-sm text-muted-foreground">Rematch candidates</p>
                <p class="mt-1 text-2xl font-semibold">{{ formatNumber(rematchCandidates) }}</p>
                <p class="text-xs text-muted-foreground">{{ formatNumber(riskSignalTotal) }} low-score signals</p>
              </div>
            </div>

            <div v-if="riskSignalChartData.length" class="space-y-4">
              <DonutChart
                :data="riskSignalChartData"
                category="value"
                index="label"
                :colors="riskSignalColors"
                :value-formatter="(tick: number) => formatNumber(tick)"
                class="h-[230px] admin-chart"
              />
            </div>
            <p v-else class="text-sm text-muted-foreground">No risk signals captured yet.</p>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-lg border border-[#ece6ee] bg-[#f9f8fb] p-3 text-sm">
                <p class="text-muted-foreground">Review completion</p>
                <p class="mt-1 text-lg font-semibold">{{ reviewCompletionRate }}%</p>
              </div>
              <div class="rounded-lg border border-[#ece6ee] bg-[#f9f8fb] p-3 text-sm">
                <p class="text-muted-foreground">Pending pulses</p>
                <p class="mt-1 text-lg font-semibold">{{ formatNumber(pendingPulses) }}</p>
              </div>
            </div>

            <div class="flex gap-2">
              <Button variant="outline" class="border-[#d6dbe4] text-[#4f5968] hover:bg-[#f8f7fb]" @click="openEmployeesWorkspace">Open Employees</Button>
            </div>
          </CardContent>
        </Card>

        <ActivityFeed
          :activities="recentActivity"
          title="Recent Activity"
          :max-items="5"
          :show-view-all="true"
          @view-all="openActivityWorkspace"
        />
      </div>

      <div class="grid gap-5 xl:grid-cols-2">
        <Card class="dashboard-card">
          <CardHeader class="dashboard-card__header">
            <CardTitle class="dashboard-section-title">
              <UserCheck class="h-5 w-5 text-[#9a4884]" />
              Most Active Employees
            </CardTitle>
            <CardDescription class="dashboard-section-description">
              Employees driving session throughput and momentum.
            </CardDescription>
          </CardHeader>
          <CardContent class="dashboard-card__content">
            <div v-if="topEmployees.length" class="space-y-3">
              <div
                v-for="employee in topEmployees"
                :key="employee.id"
                class="rounded-lg border border-[#e9e4eb] bg-[#fcfcfe] p-4"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="space-y-1">
                    <p class="font-medium">{{ employee.name }}</p>
                    <p class="text-sm text-muted-foreground">{{ employee.meta }}</p>
                  </div>
                  <Badge variant="secondary">{{ employee.sessions }} sessions</Badge>
                </div>
                <div class="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{{ formatHours(employee.hours) }}h delivered</span>
                  <span>{{ employee.completed }} completed</span>
                  <span>{{ employee.upcoming }} upcoming</span>
                  <span v-if="employee.averageRating">Rated {{ employee.averageRating.toFixed(1) }}/5</span>
                  <span v-if="employee.lastSessionAt">Last session {{ formatDate(employee.lastSessionAt) }}</span>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground">No employee session activity yet.</p>
          </CardContent>
        </Card>

        <Card class="dashboard-card">
          <CardHeader class="dashboard-card__header">
            <CardTitle class="dashboard-section-title">
              <Star class="h-5 w-5 text-[#9a4884]" />
              Mentor Performance
            </CardTitle>
            <CardDescription class="dashboard-section-description">
              Mentors who are supporting the most employees across your company programs.
            </CardDescription>
          </CardHeader>
          <CardContent class="dashboard-card__content">
            <div v-if="mentorLeaderboard.length" class="space-y-3">
              <div
                v-for="mentor in mentorLeaderboard.slice(0, 6)"
                :key="mentor.id"
                class="flex items-start justify-between rounded-lg border border-[#e9e4eb] bg-[#fcfcfe] p-4"
              >
                <div class="space-y-1">
                  <p class="font-medium">{{ mentor.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ mentor.completed }} completed sessions</p>
                </div>
                <div class="text-right text-sm">
                  <p class="font-medium">{{ mentor.sessions }} sessions</p>
                  <p class="text-muted-foreground">
                    {{ mentor.averageRating ? `${mentor.averageRating.toFixed(1)}/5` : 'No ratings yet' }}
                  </p>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground">No mentor analytics available yet.</p>
          </CardContent>
        </Card>
      </div>

      <Card class="dashboard-card">
        <CardHeader class="dashboard-card__header">
          <CardTitle class="dashboard-section-title">
            <Users class="h-5 w-5 text-[#9a4884]" />
            Recent Registrations
          </CardTitle>
          <CardDescription class="dashboard-section-description">
            Latest employee profiles added to the company workspace.
          </CardDescription>
        </CardHeader>
        <CardContent class="dashboard-card__content">
          <div v-if="recentRegistrations.length" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="profile in recentRegistrations.slice(0, 6)"
              :key="profile.id"
              class="rounded-lg border border-[#e9e4eb] bg-[#fcfcfe] p-4"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="space-y-1">
                  <p class="font-medium">{{ getProfileDisplayName(profile) }}</p>
                  <p class="text-sm text-muted-foreground">{{ getProfileMeta(profile) }}</p>
                </div>
                <Badge :variant="profile.isVerified ? 'secondary' : 'outline'">
                  {{ profile.isVerified ? 'Verified' : 'Pending' }}
                </Badge>
              </div>
              <p class="mt-3 text-xs text-muted-foreground">Joined {{ formatDate(profile.createdAt) }}</p>
            </div>
          </div>
          <p v-else class="text-sm text-muted-foreground">No employee profiles found.</p>
        </CardContent>
      </Card>

    </template>
  </div>
</template>

<style scoped>
.corporate-admin-dashboard {
  font-family: 'Montserrat', 'Inter', ui-sans-serif, system-ui, sans-serif;
  color: #1f2430;
}

.dashboard-filter-shell {
  border-radius: 0.8rem;
  border: 1px solid #e4d4e1;
  background: linear-gradient(180deg, #fefafd 0%, #f8f2f7 100%);
  padding: 0.85rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}

.dashboard-card {
  border-radius: 0.9rem;
  border-color: #e2dde6;
  background: #fff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.05),
    0 18px 38px -34px rgba(31, 36, 48, 0.35);
}

.dashboard-card__header {
  padding-bottom: 0.85rem;
}

.dashboard-card__content {
  padding-top: 0;
}

.dashboard-section-title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: #222a36;
}

.dashboard-section-description {
  color: #677286;
}

.dashboard-stat-chip {
  border-color: #e8e1ea;
  background: #fcfcfe;
}

.admin-chart {
  --vis-text-color: 325 14% 30%;
  --vis-primary-color: 315 36% 44%;
  --vis-secondary-color: 170 43% 37%;
}
</style>
