<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import dashboardApi from '@/http/requests/app/dashboard'
import companyApi from '@/http/requests/app/company'
import companySubscriptionsApi, {
  type CompanySubscriptionSummary,
  type CompanySubscriptionMember,
} from '@/http/requests/app/companySubscriptions'
import { useAppToast } from '@/composables/services/toastService'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

import StatsCard from '@/components/ui/dashboard/StatsCard.vue'
import ActivityFeed from '@/components/ui/dashboard/ActivityFeed.vue'

import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  Shield,
  Star,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
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
  company?: {
    id?: string | null
    name?: string | null
  } | null
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
  title: string
  description: string
  timestamp: string
  priority?: 'high' | 'medium' | 'low'
}

type ActivityItem = ActivityResponse & {
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
const resolveAdminTab = (value?: unknown) => {
  const normalized = String(Array.isArray(value) ? value[0] : value || '').trim().toLowerCase()
  return ['overview', 'employees', 'analytics'].includes(normalized) ? normalized : 'overview'
}

const isLoading = ref(false)
const loadMessage = ref('')
const error = ref<string | null>(null)
const activeTab = ref(resolveAdminTab(route.query.tab))
const storedCompanyName = ref('Your company')
const dashboardData = ref<CompanyDashboardResponse | null>(null)
const isLoadingBilling = ref(false)
const billingError = ref<string | null>(null)
const companySubscriptions = ref<CompanySubscriptionSummary[]>([])
const selectedCompanySubscriptionId = ref('')
const companySubscriptionMembers = ref<CompanySubscriptionMember[]>([])
const companyProfiles = ref<DashboardProfile[]>([])
const billingActionId = ref('')

const formatNumber = (value: number | string) =>
  new Intl.NumberFormat('en-KE').format(Number(value || 0))

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const roundTo = (value: number, digits = 1) => {
  const factor = 10 ** digits
  return Math.round((Number(value) || 0) * factor) / factor
}

const formatHours = (value: number) => {
  const rounded = roundTo(value, 1)
  return Number.isInteger(rounded) ? formatNumber(rounded) : rounded.toFixed(1)
}

const toDate = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
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

const getComparisonMeta = (current: number, previous: number, periodDays: number, suffix = '') => {
  const diff = roundTo(current - previous, 1)

  if (diff === 0) {
    return {
      change: `No change vs prev ${periodDays}d`,
      trend: 'neutral' as const,
    }
  }

  const sign = diff > 0 ? '+' : ''
  const displayValue = Number.isInteger(diff) ? formatNumber(diff) : diff.toFixed(1)

  return {
    change: `${sign}${displayValue}${suffix} vs prev ${periodDays}d`,
    trend: diff > 0 ? ('up' as const) : ('down' as const),
  }
}

const stats = computed<CompanyDashboardStats>(() => ({
  ...DEFAULT_STATS,
  ...(dashboardData.value?.stats || {}),
}))

const periodDays = computed(() => stats.value.periodDays || 30)
const companyName = computed(() => dashboardData.value?.company?.name || storedCompanyName.value)
const lastRefreshedAt = computed(() => dashboardData.value?.snapshotAt || null)
const hasLoadedData = computed(() => dashboardData.value !== null)
const primaryCompanySubscription = computed(() =>
  companySubscriptions.value.find(subscription => subscription.status === 'ACTIVE') ||
  companySubscriptions.value[0] ||
  null,
)
const managedCompanySubscription = computed(() =>
  companySubscriptions.value.find(subscription => subscription.id === activeCompanySubscriptionId.value) ||
  primaryCompanySubscription.value,
)
const managedCompanyWallet = computed(() => managedCompanySubscription.value?.wallet || null)
const activeCompanySubscriptionId = computed(() =>
  selectedCompanySubscriptionId.value || primaryCompanySubscription.value?.id || '',
)
const getWalletReservedSessions = (wallet = managedCompanyWallet.value) =>
  Math.max(0, Number(wallet?.sessionsAllocated || 0) - Number(wallet?.sessionsReturned || 0))
const memberMapByProfileId = computed(() => {
  const map = new Map<string, CompanySubscriptionMember>()
  companySubscriptionMembers.value.forEach(member => {
    if (member.status === 'ACTIVE') {
      map.set(member.profileId, member)
    }
  })
  return map
})
const companyProfileRows = computed(() => {
  const dashboardProfiles = recentRegistrations.value
  if (!companyProfiles.value.length) {
    return dashboardProfiles
  }
  return companyProfiles.value
})

const sessionLoadSummary = computed<SessionLoadSummary>(() => ({
  ...DEFAULT_LOAD_SUMMARY,
  ...(dashboardData.value?.loadSummary || {}),
}))

const employeeAggregates = computed<EmployeeAggregate[]>(() =>
  Array.isArray(dashboardData.value?.employeeAggregates) ? dashboardData.value?.employeeAggregates || [] : [],
)

const topEmployees = computed(() =>
  employeeAggregates.value.filter(employee => employee.sessions > 0).slice(0, 6),
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

const recentActivity = computed<ActivityItem[]>(() =>
  (dashboardData.value?.recentActivity || []).map(activity => ({
    ...activity,
    icon: activityIconMap[activity.type] || Calendar,
    color: activityColorMap[activity.type] || 'text-blue-600',
  })),
)

const totalSessionsCount = computed(() => stats.value.totalSessions)
const completedSessionsCount = computed(() => stats.value.completedSessions)
const upcomingSessionsCount = computed(() => stats.value.upcomingSessions)
const pendingSessionsCount = computed(() => stats.value.pendingSessions)
const cancelledSessionsCount = computed(() => stats.value.cancelledSessions)
const paidSessionsCount = computed(() => stats.value.paidSessionsCount)
const unpaidSessionsCount = computed(() => stats.value.unpaidSessionsCount)
const totalHours = computed(() => roundTo(stats.value.totalHours, 1))
const averageRating = computed(() => roundTo(stats.value.averageRating, 1))
const completionRate = computed(() => stats.value.completionRate)
const feedbackCoverage = computed(() => stats.value.feedbackCoverage)
const whitelistTotal = computed(() => stats.value.whitelistTotal)
const verifiedEmployeesCount = computed(() => stats.value.verifiedEmployees)
const registeredEmployeesCount = computed(() => stats.value.registeredEmployees)
const invitesSentCount = computed(() => stats.value.invitesSentCount)
const acceptedInvitesCount = computed(() => stats.value.acceptedInvitesCount)
const pendingInvitationSendCount = computed(() => stats.value.pendingInvitationSendCount)
const awaitingAcceptanceCount = computed(() => stats.value.awaitingAcceptanceCount)
const invitationAcceptanceRate = computed(() => stats.value.invitationAcceptanceRate)
const verificationRate = computed(() => stats.value.verificationRate)
const walletAvailableSessions = computed(() => Number(managedCompanyWallet.value?.sessionsAvailable || 0))
const walletPurchasedSessions = computed(() => Number(managedCompanyWallet.value?.sessionsPurchased || 0))
const walletReservedSessions = computed(() => getWalletReservedSessions())
const walletPricePerSession = computed(() => Number(managedCompanyWallet.value?.pricePerSession || 0))
const hasCompanyWallet = computed(() => Boolean(managedCompanyWallet.value))
const walletActionLabel = computed(() => (hasCompanyWallet.value ? 'Manage Billing' : 'Buy Sessions'))

const overviewStats = computed(() => {
  const activeEmployeeDelta = getComparisonMeta(
    stats.value.activeEmployeesCurrentPeriod,
    stats.value.activeEmployeesPreviousPeriod,
    periodDays.value,
  )

  const sessionDelta = getComparisonMeta(
    stats.value.sessionsCurrentPeriod,
    stats.value.sessionsPreviousPeriod,
    periodDays.value,
  )

  const hoursDelta = getComparisonMeta(
    stats.value.hoursCurrentPeriod,
    stats.value.hoursPreviousPeriod,
    periodDays.value,
    'h',
  )

  return [
    {
      title: 'Registered Employees',
      value: formatNumber(stats.value.registeredEmployees),
      change: stats.value.newEmployeesLastPeriod > 0
        ? `+${formatNumber(stats.value.newEmployeesLastPeriod)} new in ${periodDays.value}d`
        : `No new employees in ${periodDays.value}d`,
      trend: stats.value.newEmployeesLastPeriod > 0 ? ('up' as const) : ('neutral' as const),
      icon: Users,
      color: 'blue' as const,
      description: 'Employees with company profiles',
    },
    {
      title: 'Participating Employees',
      value: formatNumber(stats.value.participatingEmployees),
      change: activeEmployeeDelta.change,
      trend: activeEmployeeDelta.trend,
      icon: UserCheck,
      color: 'green' as const,
      description: `${stats.value.participationRate}% participation overall`,
    },
    {
      title: `Sessions (Last ${periodDays.value} Days)`,
      value: formatNumber(stats.value.sessionsCurrentPeriod),
      change: sessionDelta.change,
      trend: sessionDelta.trend,
      icon: Calendar,
      color: 'orange' as const,
      description: `Session activity in the trailing ${periodDays.value} days`,
    },
    {
      title: `Hours Delivered (Last ${periodDays.value} Days)`,
      value: formatHours(stats.value.hoursCurrentPeriod),
      change: hoursDelta.change,
      trend: hoursDelta.trend,
      icon: Clock,
      color: 'blue' as const,
      description: `Total mentoring time delivered in the trailing ${periodDays.value} days`,
    },
  ]
})

const employeeTabStats = computed(() => [
  {
    title: 'Verified Employees',
    value: formatNumber(stats.value.verifiedEmployees),
    icon: Shield,
    color: 'green' as const,
    description: `${stats.value.verificationRate}% of registered employees`,
  },
  {
    title: 'Invites Sent',
    value: formatNumber(stats.value.invitesSentCount),
    icon: UserPlus,
    color: 'blue' as const,
    description: `${formatNumber(stats.value.pendingInvitationSendCount)} still unsent`,
  },
  {
    title: 'Accepted Invites',
    value: formatNumber(stats.value.acceptedInvitesCount),
    icon: CheckCircle,
    color: 'orange' as const,
    description: `${stats.value.invitationAcceptanceRate}% acceptance rate`,
  },
  {
    title: 'Awaiting Acceptance',
    value: formatNumber(stats.value.awaitingAcceptanceCount),
    icon: AlertTriangle,
    color: 'orange' as const,
    description: 'Invited users who have not completed signup',
  },
])

const dashboardAlerts = computed<DashboardAlert[]>(() => {
  const alerts: DashboardAlert[] = []

  if (sessionLoadSummary.value.failedEmployees > 0) {
    alerts.push({
      id: 'session-load-gap',
      title: 'Partial session coverage',
      message: `Session data failed for ${formatNumber(sessionLoadSummary.value.failedEmployees)} ${pluralize(sessionLoadSummary.value.failedEmployees, 'employee')}. Counts below may be understated until those requests succeed.`,
      icon: AlertTriangle,
      variant: 'destructive',
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
      icon: FileText,
    })
  }

  return alerts
})

const goToPaymentUrl = (url?: string | null) => {
  if (!url) return
  window.location.assign(url)
}

const loadCompanyWalletSummary = async (resolvedCompanyId: string) => {
  if (!resolvedCompanyId) {
    billingError.value = 'Company ID not found. Log in again and retry.'
    companySubscriptions.value = []
    return
  }

  try {
    const subscriptionsResponse = await companySubscriptionsApi.getCompanySubscriptions(resolvedCompanyId)

    if (!subscriptionsResponse.success) {
      throw new Error(subscriptionsResponse.message || 'Failed to load company wallet summary.')
    }

    companySubscriptions.value = subscriptionsResponse.data || []

    if (!selectedCompanySubscriptionId.value && companySubscriptions.value.length) {
      selectedCompanySubscriptionId.value =
        companySubscriptions.value.find(subscription => subscription.status === 'ACTIVE')?.id
        || companySubscriptions.value[0].id
    }

    billingError.value = null
  } catch (walletError: any) {
    console.error('Failed to load company wallet summary:', walletError)
    billingError.value =
      walletError?.response?.data?.message ||
      walletError?.message ||
      'Failed to load company wallet summary.'
    companySubscriptions.value = []
  }
}

const loadBillingData = async () => {
  const resolvedCompanyId = companyId.value
  if (!resolvedCompanyId) {
    billingError.value = 'Company ID not found. Log in again and retry.'
    return
  }

  isLoadingBilling.value = true
  billingError.value = null

  try {
    const [subscriptionsResponse, profilesResponse] = await Promise.all([
      companySubscriptionsApi.getCompanySubscriptions(resolvedCompanyId),
      companyApi.getCompanyProfiles({
        companyId: resolvedCompanyId,
        page: 0,
        size: 100,
        search: '',
      }),
    ])

    if (!subscriptionsResponse.success) {
      throw new Error(subscriptionsResponse.message || 'Failed to load company subscriptions.')
    }

    companySubscriptions.value = subscriptionsResponse.data || []

    if (!selectedCompanySubscriptionId.value && companySubscriptions.value.length) {
      selectedCompanySubscriptionId.value = companySubscriptions.value[0].id
    }

    const profilesPayload = profilesResponse?.data
    if (!profilesPayload?.success) {
      throw new Error(profilesPayload?.message || 'Failed to load company profiles.')
    }
    const profilePage = profilesPayload?.data
    companyProfiles.value = Array.isArray(profilePage?.content) ? profilePage.content : []
  } catch (loadError: any) {
    console.error('Failed to load company billing:', loadError)
    billingError.value =
      loadError?.response?.data?.message ||
      loadError?.message ||
      'Failed to load company billing data.'
  } finally {
    isLoadingBilling.value = false
  }
}

const loadCompanySubscriptionMembers = async (companySubscriptionId: string) => {
  if (!companySubscriptionId) {
    companySubscriptionMembers.value = []
    return
  }

  try {
    const response = await companySubscriptionsApi.getMembers(companySubscriptionId)
    if (!response.success) {
      throw new Error(response.message || 'Failed to load seat assignments.')
    }
    companySubscriptionMembers.value = response.data || []
  } catch (memberError: any) {
    console.error('Failed to load company subscription members:', memberError)
    billingError.value =
      memberError?.response?.data?.message ||
      memberError?.message ||
      'Failed to load seat assignments.'
  }
}

const assignSeat = async (profileId: string) => {
  const companySubscriptionId = activeCompanySubscriptionId.value
  if (!companySubscriptionId) {
    toast.error('No company subscription selected.')
    return
  }

  billingActionId.value = `assign-${profileId}`
  try {
    const response = await companySubscriptionsApi.assignSeat(companySubscriptionId, profileId)
    if (!response.success) {
      throw new Error(response.message || 'Failed to assign seat.')
    }
    toast.success('Seat assigned successfully.')
    await Promise.all([loadBillingData(), loadCompanySubscriptionMembers(companySubscriptionId)])
  } catch (assignError: any) {
    toast.error(assignError?.response?.data?.message || assignError?.message || 'Failed to assign seat.')
  } finally {
    billingActionId.value = ''
  }
}

const revokeSeat = async (profileId: string) => {
  const companySubscriptionId = activeCompanySubscriptionId.value
  if (!companySubscriptionId) {
    toast.error('No company subscription selected.')
    return
  }

  billingActionId.value = `revoke-${profileId}`
  try {
    const response = await companySubscriptionsApi.revokeSeat(companySubscriptionId, profileId)
    if (!response.success) {
      throw new Error(response.message || 'Failed to revoke seat.')
    }
    toast.success('Seat revoked successfully.')
    await Promise.all([loadBillingData(), loadCompanySubscriptionMembers(companySubscriptionId)])
  } catch (revokeError: any) {
    toast.error(revokeError?.response?.data?.message || revokeError?.message || 'Failed to revoke seat.')
  } finally {
    billingActionId.value = ''
  }
}

const renewCompanySubscription = async () => {
  const companySubscriptionId = activeCompanySubscriptionId.value
  if (!companySubscriptionId) {
    toast.error('No company subscription selected.')
    return
  }

  billingActionId.value = `renew-${companySubscriptionId}`
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const response = await companySubscriptionsApi.renew(companySubscriptionId, {
      redirectSuccessUrl: `${origin}/app/admin/settings?tab=billing&invoice_paid=1&context=company_subscription`,
      redirectCancelUrl: `${origin}/app/admin/settings?tab=billing&invoice_cancelled=1&context=company_subscription`,
    })

    if (!response.success || !response.data?.paymentUrl) {
      throw new Error(response.message || 'Failed to create renewal invoice.')
    }

    toast.success('Renewal invoice created. Redirecting to payment...')
    goToPaymentUrl(response.data.paymentUrl)
  } catch (renewError: any) {
    toast.error(renewError?.response?.data?.message || renewError?.message || 'Failed to create renewal invoice.')
  } finally {
    billingActionId.value = ''
  }
}

const openBillingWorkspace = async () => {
  await router.push('/app/admin/settings?tab=billing')
}

const refreshDashboard = async () => {
  const resolvedCompanyId = companyId.value
  if (!resolvedCompanyId) {
    error.value = 'Company ID not found. Log in again and retry.'
    return
  }

  isLoading.value = true
  error.value = null
  loadMessage.value = 'Loading company dashboard...'

  try {
    const [dashboardResult] = await Promise.all([
      dashboardApi.getCompanyDashboard(resolvedCompanyId),
      loadCompanyWalletSummary(resolvedCompanyId),
    ])
    const response = dashboardResult
    const payload = response?.data

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

watch(activeCompanySubscriptionId, async (value) => {
  if (value) {
    await loadCompanySubscriptionMembers(value)
  } else {
    companySubscriptionMembers.value = []
  }
})

watch(() => route.query.tab, (value) => {
  const resolvedTab = resolveAdminTab(value)
  if (activeTab.value !== resolvedTab) {
    activeTab.value = resolvedTab
  }
})

watch(activeTab, async (value) => {
  const resolvedTab = resolveAdminTab(value)
  const currentTab = resolveAdminTab(route.query.tab)

  if (resolvedTab === currentTab) {
    return
  }

  const query = { ...route.query }
  if (resolvedTab === 'overview') {
    delete query.tab
  } else {
    query.tab = resolvedTab
  }

  await router.replace({ query })
})

onMounted(() => {
  if (
    route.query.tab === 'billing'
    || route.query.context === 'company_subscription'
    || route.query.invoice_paid === '1'
    || route.query.invoice_cancelled === '1'
  ) {
    router.replace({
      path: '/app/admin/settings',
      query: {
        ...route.query,
        tab: 'billing',
      },
    })
    return
  }

  const storedProfile = getStoredProfile()
  storedCompanyName.value = storedProfile?.company?.name || storedCompanyName.value
  refreshDashboard()
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      <div class="space-y-4">
        <div class="space-y-1">
          <h1 class="text-3xl font-bold tracking-tight">Corporate Admin Dashboard</h1>
          <p class="text-muted-foreground">
            Live mentorship reporting for {{ companyName }} based on current employee, invite, and session data.
          </p>
          <p v-if="lastRefreshedAt" class="text-xs text-muted-foreground">
            Last refreshed {{ formatDateTime(lastRefreshedAt) }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <Button @click="refreshDashboard" :disabled="isLoading">
            <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
            Refresh
          </Button>
        </div>
      </div>

      <Card class="xl:justify-self-end">
        <CardHeader class="space-y-2 p-4 pb-2">
          <div class="flex items-start justify-between gap-3">
            <div>
              <CardTitle class="flex items-center gap-1.5 text-sm">
                <Wallet class="h-3.5 w-3.5" />
                Session Wallet
              </CardTitle>
            </div>
            <Badge v-if="managedCompanySubscription" variant="secondary" class="max-w-[120px] truncate px-2 py-0 text-[11px]">
              {{ managedCompanySubscription.planName || 'Enterprise Standard' }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-3 p-4 pt-0">
          <Alert v-if="billingError" variant="destructive">
            <AlertTriangle class="h-4 w-4" />
            <AlertDescription>{{ billingError }}</AlertDescription>
          </Alert>

          <template v-else-if="hasCompanyWallet">
            <div class="flex items-end justify-between gap-3 rounded-xl border bg-muted/30 px-3 py-2.5">
              <div>
                <p class="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Available</p>
                <p class="mt-1 text-2xl font-semibold leading-none">{{ formatNumber(walletAvailableSessions) }}</p>
                <p class="mt-1 text-xs text-muted-foreground">
                  {{ formatNumber(walletReservedSessions) }} reserved
                  <span class="mx-1">•</span>
                  {{ formatNumber(walletPurchasedSessions) }} purchased
                </p>
              </div>
              <div class="text-right">
                <p class="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Price</p>
                <p class="mt-1 text-base font-semibold">{{ formatCurrency(walletPricePerSession) }}</p>
                <p class="mt-0.5 text-[11px] text-muted-foreground">per session</p>
              </div>
            </div>
          </template>

          <div v-else class="rounded-xl border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
            No active company session wallet yet. Buy sessions to unlock company-funded booking.
          </div>

          <div class="flex justify-end border-t pt-2">
            <Button size="sm" @click="openBillingWorkspace">
              {{ walletActionLabel }}
            </Button>
          </div>
        </CardContent>
      </Card>
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
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton v-for="index in 4" :key="index" class="h-32 w-full" />
      </div>
      <div class="grid gap-6 lg:grid-cols-2">
        <Skeleton class="h-80 w-full" />
        <Skeleton class="h-80 w-full" />
      </div>
    </div>

    <Tabs v-else v-model="activeTab" class="space-y-6">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="employees">Employee Management</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            v-for="stat in overviewStats"
            :key="stat.title"
            :title="stat.title"
            :value="stat.value"
            :change="stat.change"
            :trend="stat.trend"
            :icon="stat.icon"
            :color="stat.color"
            :description="stat.description"
          />
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <TrendingUp class="h-5 w-5" />
                Session Health
              </CardTitle>
              <CardDescription>
                Current program throughput and session quality.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-5">
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-lg border p-4">
                  <p class="text-sm text-muted-foreground">Completed Sessions</p>
                  <p class="mt-2 text-2xl font-semibold">{{ formatNumber(completedSessionsCount) }}</p>
                </div>
                <div class="rounded-lg border p-4">
                  <p class="text-sm text-muted-foreground">Upcoming Sessions</p>
                  <p class="mt-2 text-2xl font-semibold">{{ formatNumber(upcomingSessionsCount) }}</p>
                </div>
                <div class="rounded-lg border p-4">
                  <p class="text-sm text-muted-foreground">Average Rating</p>
                  <p class="mt-2 flex items-center gap-2 text-2xl font-semibold">
                    <Star class="h-5 w-5 text-yellow-500" />
                    {{ averageRating ? averageRating.toFixed(1) : '—' }}
                  </p>
                </div>
                <div class="rounded-lg border p-4">
                  <p class="text-sm text-muted-foreground">Total Hours Delivered</p>
                  <p class="mt-2 text-2xl font-semibold">{{ formatHours(totalHours) }}h</p>
                </div>
              </div>

              <div class="space-y-4">
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-medium">Completion Rate</span>
                    <span class="text-muted-foreground">{{ completionRate }}%</span>
                  </div>
                  <Progress :value="completionRate" class="h-2" />
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-medium">Feedback Coverage</span>
                    <span class="text-muted-foreground">{{ feedbackCoverage }}%</span>
                  </div>
                  <Progress :value="feedbackCoverage" class="h-2" />
                </div>

                <div class="grid gap-3 sm:grid-cols-3 text-sm">
                  <div class="rounded-lg bg-muted/40 p-3">
                    <p class="text-muted-foreground">Pending</p>
                    <p class="mt-1 font-medium">{{ formatNumber(pendingSessionsCount) }}</p>
                  </div>
                  <div class="rounded-lg bg-muted/40 p-3">
                    <p class="text-muted-foreground">Cancelled</p>
                    <p class="mt-1 font-medium">{{ formatNumber(cancelledSessionsCount) }}</p>
                  </div>
                  <div class="rounded-lg bg-muted/40 p-3">
                    <p class="text-muted-foreground">Paid Sessions</p>
                    <p class="mt-1 font-medium">{{ formatNumber(paidSessionsCount) }}</p>
                  </div>
                </div>
              </div>

              <p class="text-xs text-muted-foreground">
                Dashboard coverage includes {{ formatNumber(sessionLoadSummary.loadedEmployees) }} of
                {{ formatNumber(sessionLoadSummary.requestedEmployees) }} employees.
                <span v-if="sessionLoadSummary.failedEmployees > 0">
                  {{ formatNumber(sessionLoadSummary.failedEmployees) }} failed.
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Shield class="h-5 w-5" />
                Employee Onboarding
              </CardTitle>
              <CardDescription>
                Registration funnel from invitation to active company profile.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-5">
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-lg border p-4">
                  <p class="text-sm text-muted-foreground">Whitelist Entries</p>
                  <p class="mt-2 text-2xl font-semibold">{{ formatNumber(whitelistTotal) }}</p>
                </div>
                <div class="rounded-lg border p-4">
                  <p class="text-sm text-muted-foreground">Verified Employees</p>
                  <p class="mt-2 text-2xl font-semibold">{{ formatNumber(verifiedEmployeesCount) }}</p>
                </div>
                <div class="rounded-lg border p-4">
                  <p class="text-sm text-muted-foreground">Invites Sent</p>
                  <p class="mt-2 text-2xl font-semibold">{{ formatNumber(invitesSentCount) }}</p>
                </div>
                <div class="rounded-lg border p-4">
                  <p class="text-sm text-muted-foreground">Accepted Invites</p>
                  <p class="mt-2 text-2xl font-semibold">{{ formatNumber(acceptedInvitesCount) }}</p>
                </div>
              </div>

              <div class="space-y-4">
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-medium">Invite Acceptance</span>
                    <span class="text-muted-foreground">{{ invitationAcceptanceRate }}%</span>
                  </div>
                  <Progress :value="invitationAcceptanceRate" class="h-2" />
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-medium">Verification Rate</span>
                    <span class="text-muted-foreground">{{ verificationRate }}%</span>
                  </div>
                  <Progress :value="verificationRate" class="h-2" />
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2 text-sm">
                <div class="rounded-lg bg-muted/40 p-3">
                  <p class="text-muted-foreground">Unsent Invites</p>
                  <p class="mt-1 font-medium">{{ formatNumber(pendingInvitationSendCount) }}</p>
                </div>
                <div class="rounded-lg bg-muted/40 p-3">
                  <p class="text-muted-foreground">Awaiting Acceptance</p>
                  <p class="mt-1 font-medium">{{ formatNumber(awaitingAcceptanceCount) }}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <UserCheck class="h-5 w-5" />
                Most Active Employees
              </CardTitle>
              <CardDescription>
                Employees with the highest mentorship engagement so far.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="topEmployees.length" class="space-y-3">
                <div
                  v-for="employee in topEmployees"
                  :key="employee.id"
                  class="rounded-lg border p-4"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <p class="font-medium">{{ employee.name }}</p>
                      <p class="text-sm text-muted-foreground">{{ employee.meta }}</p>
                    </div>
                    <Badge variant="secondary">{{ employee.sessions }} sessions</Badge>
                  </div>
                  <div class="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
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

          <ActivityFeed
            :activities="recentActivity"
            title="Recent Activity"
            :max-items="6"
            :show-view-all="false"
          />
        </div>
      </TabsContent>

      <TabsContent value="employees" class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            v-for="stat in employeeTabStats"
            :key="stat.title"
            :title="stat.title"
            :value="stat.value"
            :icon="stat.icon"
            :color="stat.color"
            :description="stat.description"
          />
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Users class="h-5 w-5" />
                Recent Employee Registrations
              </CardTitle>
              <CardDescription>
                Most recently created employee profiles in the company workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="recentRegistrations.length" class="space-y-3">
                <div
                  v-for="profile in recentRegistrations"
                  :key="profile.id"
                  class="flex items-center justify-between rounded-lg border p-4"
                >
                  <div class="space-y-1">
                    <p class="font-medium">{{ getProfileDisplayName(profile) }}</p>
                    <p class="text-sm text-muted-foreground">{{ getProfileMeta(profile) }}</p>
                  </div>
                  <div class="text-right">
                    <Badge :variant="profile.isVerified ? 'secondary' : 'outline'">
                      {{ profile.isVerified ? 'Verified' : 'Pending' }}
                    </Badge>
                    <p class="mt-2 text-xs text-muted-foreground">{{ formatDate(profile.createdAt) }}</p>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-muted-foreground">No employee profiles found.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <UserPlus class="h-5 w-5" />
                Invitation Funnel
              </CardTitle>
              <CardDescription>
                Where employees are dropping out between whitelist and activation.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium">Unsent whitelist entries</span>
                  <span class="text-muted-foreground">{{ formatNumber(pendingInvitationSendCount) }}</span>
                </div>
                <Progress
                  :value="whitelistTotal ? Math.round((pendingInvitationSendCount / whitelistTotal) * 100) : 0"
                  class="h-2"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium">Invited but not accepted</span>
                  <span class="text-muted-foreground">{{ formatNumber(awaitingAcceptanceCount) }}</span>
                </div>
                <Progress
                  :value="whitelistTotal ? Math.round((awaitingAcceptanceCount / whitelistTotal) * 100) : 0"
                  class="h-2"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium">Accepted invites</span>
                  <span class="text-muted-foreground">{{ formatNumber(acceptedInvitesCount) }}</span>
                </div>
                <Progress
                  :value="whitelistTotal ? Math.round((acceptedInvitesCount / whitelistTotal) * 100) : 0"
                  class="h-2"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium">Verified employee profiles</span>
                  <span class="text-muted-foreground">{{ formatNumber(verifiedEmployeesCount) }}</span>
                </div>
                <Progress
                  :value="registeredEmployeesCount ? Math.round((verifiedEmployeesCount / registeredEmployeesCount) * 100) : 0"
                  class="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <UserCheck class="h-5 w-5" />
              Participation Leaderboard
            </CardTitle>
            <CardDescription>
              Employees ranked by total session engagement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="employeeAggregates.length" class="space-y-3">
              <div
                v-for="employee in employeeAggregates.slice(0, 10)"
                :key="employee.id"
                class="rounded-lg border p-4"
              >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p class="font-medium">{{ employee.name }}</p>
                    <p class="text-sm text-muted-foreground">{{ employee.meta }}</p>
                  </div>
                  <div class="flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary">{{ employee.sessions }} sessions</Badge>
                    <Badge variant="outline">{{ employee.completed }} completed</Badge>
                    <Badge variant="outline">{{ formatHours(employee.hours) }}h</Badge>
                    <Badge v-if="employee.averageRating" variant="outline">
                      {{ employee.averageRating.toFixed(1) }}/5
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground">No employee participation data available yet.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <TrendingUp class="h-5 w-5" />
              Monthly Session Trends
            </CardTitle>
            <CardDescription>
              The last six months of company session volume, completions, and delivered hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="monthlyTrends.some(trend => trend.sessions > 0)" class="space-y-4">
              <div
                v-for="trend in monthlyTrends"
                :key="trend.label"
                class="rounded-lg border p-4"
              >
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <p class="font-medium">{{ trend.label }}</p>
                    <p class="text-sm text-muted-foreground">{{ trend.completed }} completed</p>
                  </div>
                  <div class="flex gap-6 text-sm">
                    <div class="text-right">
                      <p class="font-medium">{{ trend.sessions }}</p>
                      <p class="text-muted-foreground">Sessions</p>
                    </div>
                    <div class="text-right">
                      <p class="font-medium">{{ formatHours(trend.hours) }}h</p>
                      <p class="text-muted-foreground">Hours</p>
                    </div>
                  </div>
                </div>
                <Progress :value="trend.width" class="mt-3 h-2" />
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground">No monthly session trend data yet.</p>
          </CardContent>
        </Card>

        <div class="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <BookOpen class="h-5 w-5" />
                Top Topics
              </CardTitle>
              <CardDescription>
                Topics employees are booking most often across all sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="topTopics.length" class="space-y-3">
                <div
                  v-for="topic in topTopics"
                  :key="topic.label"
                  class="rounded-lg border p-4"
                >
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <p class="font-medium">{{ topic.label }}</p>
                      <p class="text-sm text-muted-foreground">{{ topic.completed }} completed sessions</p>
                    </div>
                    <div class="text-right text-sm">
                      <p class="font-medium">{{ topic.sessions }} bookings</p>
                      <p class="text-muted-foreground">{{ formatHours(topic.hours) }}h</p>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-muted-foreground">No topic breakdown is available yet.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Star class="h-5 w-5" />
                Mentor Leaderboard
              </CardTitle>
              <CardDescription>
                Mentors delivering the most employee sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="mentorLeaderboard.length" class="space-y-3">
                <div
                  v-for="mentor in mentorLeaderboard"
                  :key="mentor.id"
                  class="rounded-lg border p-4"
                >
                  <div class="flex items-start justify-between gap-4">
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
              </div>
              <p v-else class="text-sm text-muted-foreground">No mentor analytics available yet.</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <BarChart3 class="h-5 w-5" />
              Session Distribution
            </CardTitle>
            <CardDescription>
              Current status mix across all company sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="totalSessionsCount" class="space-y-4">
              <div
                v-for="status in statusBreakdown"
                :key="status.key"
                class="space-y-2"
              >
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium">{{ status.label }}</span>
                  <span class="text-muted-foreground">
                    {{ formatNumber(status.count) }} ({{ status.percentage }}%)
                  </span>
                </div>
                <Progress :value="status.percentage" class="h-2" />
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground">No session distribution to report yet.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
