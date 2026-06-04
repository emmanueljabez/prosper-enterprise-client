<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyStore } from '@/store/modules/company'
import companySessionAllocationsApi, { type EmployeeSessionAllocationRecord } from '@/http/requests/app/companySessionAllocations'
import { useCompanySubscriptionAdmin } from '@/composables/useCompanySubscriptionAdmin'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Download,
  GitBranch,
  Mail,
  Minus,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Employees',
  description: 'Manage employees, whitelist, and company-funded session allocations',
  requiresAuth: true,
  permissions: ['admin:users'],
})

type AllocationMode = 'allocate' | 'withdraw'
type WorkspaceTab = 'directory' | 'whitelist'
type EmployeeProgramStatus = 'ACTIVE' | 'INACTIVE' | 'INVITED'
type ColumnKey = 'department' | 'programStatus' | 'mentorAssigned' | 'sessions' | 'availableBalance' | 'lastActivity'

const router = useRouter()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const toast = useAppToast()
const {
  isLoadingBilling,
  billingError,
  activeCompanySubscriptionId,
  managedCompanyWallet,
  loadCompanyBilling,
  getWalletReservedSessions,
} = useCompanySubscriptionAdmin()

const {
  profiles,
  profilesLoading,
  profilesPagination,
  whitelist,
  whitelistPagination,
  isLoading: whitelistLoading,
} = storeToRefs(companyStore)

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

const workspaceTab = ref<WorkspaceTab>('directory')
const employeeSearch = ref('')
const employeeSearchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)
const whitelistSearch = ref('')
const whitelistSearchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)
const selectedDepartment = ref('ALL')
const selectedStatus = ref<'ALL' | EmployeeProgramStatus>('ALL')

const allocationLookupLoading = ref(false)
const allocationError = ref<string | null>(null)
const allocationActionId = ref('')
const allocationsByProfileId = ref<Record<string, EmployeeSessionAllocationRecord>>({})
const allocationDialogOpen = ref(false)
const allocationMode = ref<AllocationMode>('allocate')
const selectedEmployee = ref<any | null>(null)
const allocationQuantity = ref(1)

const addEmployeeDialogOpen = ref(false)
const newEmployeeEmail = ref('')
const isSubmittingEmployeeInvite = ref(false)

const visibleColumns = ref<Record<ColumnKey, boolean>>({
  department: true,
  programStatus: true,
  mentorAssigned: true,
  sessions: true,
  availableBalance: false,
  lastActivity: false,
})

const columnOptions: Array<{ key: ColumnKey; label: string }> = [
  { key: 'department', label: 'Department' },
  { key: 'programStatus', label: 'Program Status' },
  { key: 'mentorAssigned', label: 'Mentor Assigned' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'availableBalance', label: 'Available Balance' },
  { key: 'lastActivity', label: 'Last Activity' },
]

const employeeProfiles = computed(() =>
  (profiles.value || []).filter((profile: any) => {
    const normalizedRole = String(profile?.role || '').trim().toLowerCase()
    return ['employee', 'mentee'].includes(normalizedRole)
  }),
)

const employeeProfileIds = computed(() => employeeProfiles.value.map(profile => profile.id))

const walletAvailableSessions = computed(() => Number(managedCompanyWallet.value?.sessionsAvailable || 0))
const walletReservedSessions = computed(() => getWalletReservedSessions(managedCompanyWallet.value))

const employeeRows = computed(() =>
  employeeProfiles.value.map(profile => ({
    profile,
    allocation: allocationsByProfileId.value[profile.id] || null,
  })),
)

const hasActiveCompanyWallet = computed(() =>
  Boolean(activeCompanySubscriptionId.value && managedCompanyWallet.value),
)

const resolveDepartment = (profile: any) =>
  String(profile?.industry || profile?.location || 'General').trim() || 'General'

const resolveMentorName = (profile: any) => {
  const mentor = profile?.mentorProfile
  if (!mentor) return null

  const fullName = [mentor?.firstName, mentor?.lastName].filter(Boolean).join(' ').trim()
  return fullName || mentor?.name || mentor?.email || mentor?.username || null
}

const resolveProgramStatus = (row: { profile: any; allocation: EmployeeSessionAllocationRecord | null }): EmployeeProgramStatus => {
  if (!row.profile?.isVerified) {
    return 'INVITED'
  }

  if (Number(row.allocation?.allocatedTotal || 0) > 0 || Number(row.allocation?.consumedTotal || 0) > 0) {
    return 'ACTIVE'
  }

  return 'INACTIVE'
}

const statusLabel = (status: EmployeeProgramStatus) => {
  if (status === 'ACTIVE') return 'Active'
  if (status === 'INVITED') return 'Invited'
  return 'Inactive'
}

const departmentOptions = computed(() => {
  const values = new Set<string>()
  employeeRows.value.forEach(row => values.add(resolveDepartment(row.profile)))
  return ['ALL', ...Array.from(values).sort((a, b) => a.localeCompare(b))]
})

const filteredEmployeeRows = computed(() =>
  employeeRows.value.filter(row => {
    if (selectedDepartment.value !== 'ALL' && resolveDepartment(row.profile) !== selectedDepartment.value) {
      return false
    }

    if (selectedStatus.value !== 'ALL' && resolveProgramStatus(row) !== selectedStatus.value) {
      return false
    }

    return true
  }),
)

const totalEmployees = computed(() => Number(profilesPagination.value.totalElements || employeeRows.value.length || 0))
const activeEmployees = computed(() => employeeRows.value.filter(row => resolveProgramStatus(row) === 'ACTIVE').length)
const activeParticipationRate = computed(() =>
  totalEmployees.value ? Number(((activeEmployees.value / totalEmployees.value) * 100).toFixed(1)) : 0,
)
const assignedMentors = computed(() => employeeRows.value.filter(row => Boolean(resolveMentorName(row.profile))).length)
const averageSessions = computed(() => {
  if (!employeeRows.value.length) return 0
  const total = employeeRows.value.reduce((sum, row) => sum + Number(row.allocation?.consumedTotal || 0), 0)
  return Number((total / employeeRows.value.length).toFixed(1))
})

const employeeDisplayName = (profile: any) => {
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
  return fullName || profile?.username || profile?.email || 'Employee'
}

const employeeSecondary = (profile: any) =>
  String(profile?.email || profile?.username || 'No email').trim()

const whitelistStatusVariant = (entry: any) => {
  if (entry.isUsed && entry.invitationAccepted) return 'secondary'
  if (entry.invitationSent && !entry.invitationAccepted) return 'outline'
  return 'default'
}

const whitelistStatusText = (entry: any) => {
  if (entry.isUsed && entry.invitationAccepted) return 'Active'
  if (entry.invitationSent && !entry.invitationAccepted) return 'Invited'
  return 'Pending'
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '—'

  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const toggleColumn = (column: ColumnKey, checked: boolean) => {
  visibleColumns.value[column] = Boolean(checked)
}

const exportEmployeesCsv = () => {
  const headers = [
    'name',
    'email',
    ...(visibleColumns.value.department ? ['department'] : []),
    ...(visibleColumns.value.programStatus ? ['program_status'] : []),
    ...(visibleColumns.value.mentorAssigned ? ['mentor_assigned'] : []),
    ...(visibleColumns.value.sessions ? ['sessions'] : []),
    ...(visibleColumns.value.availableBalance ? ['available_balance'] : []),
    ...(visibleColumns.value.lastActivity ? ['last_activity'] : []),
  ]

  const escapeCsv = (value: unknown) => {
    const safe = String(value ?? '').replace(/"/g, '""')
    return /[",\n]/.test(safe) ? `"${safe}"` : safe
  }

  const rows = filteredEmployeeRows.value.map(row => {
    const status = resolveProgramStatus(row)
    const mentorName = resolveMentorName(row.profile) || 'Not assigned'

    const values: Array<string | number> = [
      employeeDisplayName(row.profile),
      employeeSecondary(row.profile),
      ...(visibleColumns.value.department ? [resolveDepartment(row.profile)] : []),
      ...(visibleColumns.value.programStatus ? [statusLabel(status)] : []),
      ...(visibleColumns.value.mentorAssigned ? [mentorName] : []),
      ...(visibleColumns.value.sessions ? [Number(row.allocation?.consumedTotal || 0)] : []),
      ...(visibleColumns.value.availableBalance ? [Number(row.allocation?.availableBalance || 0)] : []),
      ...(visibleColumns.value.lastActivity ? [formatDateTime(row.allocation?.lastActivityAt || row.profile?.updatedAt || row.profile?.createdAt)] : []),
    ]

    return values.map(escapeCsv).join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const loadEmployees = async () => {
  if (!companyId.value) return

  try {
    await companyStore.loadProfiles({
      companyId: companyId.value,
      page: 0,
      size: 20,
      search: employeeSearch.value,
    })
  } catch {
    // company store already handles toast
  }
}

const loadWhitelistEntries = async () => {
  if (!companyId.value) return

  try {
    await companyStore.loadWhitelist({
      companyId: companyId.value,
      page: 0,
      size: 10,
      search: whitelistSearch.value,
    })
  } catch {
    // company store already handles toast
  }
}

const lookupVisibleAllocations = async () => {
  if (!companyId.value) {
    allocationsByProfileId.value = {}
    return
  }

  if (!employeeProfileIds.value.length) {
    allocationsByProfileId.value = {}
    return
  }

  allocationLookupLoading.value = true
  allocationError.value = null

  try {
    const response = await companySessionAllocationsApi.lookup(companyId.value, employeeProfileIds.value)

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to load employee session allocations')
    }

    allocationsByProfileId.value = Object.fromEntries(
      (response.data.allocations || []).map(allocation => [allocation.profileId, allocation]),
    )
  } catch (error: any) {
    allocationError.value = error?.response?.data?.message || error?.message || 'Failed to load employee session allocations'
    toast.error(allocationError.value)
  } finally {
    allocationLookupLoading.value = false
  }
}

const refreshWorkspace = async () => {
  if (!companyId.value) return

  await Promise.all([
    loadEmployees(),
    loadWhitelistEntries(),
    loadCompanyBilling(companyId.value),
  ])

  await lookupVisibleAllocations()
}

const loadMoreEmployees = async () => {
  if (!companyId.value || !profilesPagination.value.hasNext) {
    return
  }

  try {
    await companyStore.loadMoreProfiles(companyId.value)
    await lookupVisibleAllocations()
  } catch {
    // company store already handles toast
  }
}

const loadMoreWhitelist = async () => {
  if (!companyId.value || !whitelistPagination.value.hasNext) {
    return
  }

  try {
    await companyStore.loadMoreWhitelist(companyId.value)
  } catch {
    // company store already handles toast
  }
}

const sendInvitation = async (whitelistId: string) => {
  if (!companyId.value) return

  try {
    await companyStore.sendInvitation(companyId.value, whitelistId)
  } catch {
    // company store already handles toast
  }
}

const resendInvitation = async (whitelistId: string) => {
  if (!companyId.value) return

  try {
    await companyStore.resendInvitation(companyId.value, whitelistId)
  } catch {
    // company store already handles toast
  }
}

const removeFromWhitelist = async (whitelistId: string) => {
  if (!companyId.value) return

  if (!window.confirm('Are you sure you want to remove this email from the whitelist?')) {
    return
  }

  try {
    await companyStore.removeFromWhitelist(companyId.value, whitelistId)
  } catch {
    // company store already handles toast
  }
}

const openAllocationDialog = (mode: AllocationMode, profile: any) => {
  allocationMode.value = mode
  selectedEmployee.value = profile
  allocationQuantity.value = 1
  allocationDialogOpen.value = true
}

const closeAllocationDialog = () => {
  allocationDialogOpen.value = false
  selectedEmployee.value = null
  allocationQuantity.value = 1
}

const closeAddEmployeeDialog = () => {
  addEmployeeDialogOpen.value = false
  newEmployeeEmail.value = ''
}

const submitAllocationChange = async () => {
  if (!companyId.value) {
    toast.error('Company context is missing')
    return
  }

  if (!activeCompanySubscriptionId.value) {
    toast.error('Purchase company-funded sessions before allocating them to employees')
    return
  }

  if (!selectedEmployee.value?.id) {
    toast.error('Select an employee first')
    return
  }

  const quantity = Math.max(1, Math.trunc(Number(allocationQuantity.value || 0)))
  const currentAllocation = allocationsByProfileId.value[selectedEmployee.value.id]

  if (allocationMode.value === 'withdraw' && quantity > Number(currentAllocation?.availableBalance || 0)) {
    toast.error('You can only withdraw from the employee\'s unused balance')
    return
  }

  allocationActionId.value = `${allocationMode.value}-${selectedEmployee.value.id}`

  try {
    const response = allocationMode.value === 'allocate'
      ? await companySessionAllocationsApi.allocate(companyId.value, selectedEmployee.value.id, {
          companySubscriptionId: activeCompanySubscriptionId.value,
          quantity,
        })
      : await companySessionAllocationsApi.withdraw(companyId.value, selectedEmployee.value.id, {
          companySubscriptionId: activeCompanySubscriptionId.value,
          quantity,
        })

    if (!response.success) {
      throw new Error(response.message || 'Failed to update employee allocation')
    }

    toast.success(
      allocationMode.value === 'allocate'
        ? 'Employee sessions allocated successfully'
        : 'Unused employee sessions returned to the company wallet',
    )

    closeAllocationDialog()
    await Promise.all([
      loadCompanyBilling(companyId.value),
      lookupVisibleAllocations(),
    ])
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Failed to update employee allocation')
  } finally {
    allocationActionId.value = ''
  }
}

const addEmployee = async () => {
  if (!companyId.value) {
    toast.error('Company context is missing')
    return
  }

  const emailAddress = String(newEmployeeEmail.value || '').trim()
  if (!emailAddress) {
    toast.error('Email address is required')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailAddress)) {
    toast.error('Enter a valid email address')
    return
  }

  isSubmittingEmployeeInvite.value = true

  try {
    await companyStore.addToWhitelist(companyId.value, { emailAddress })
    closeAddEmployeeDialog()
  } catch {
    // company store already handles toast
  } finally {
    isSubmittingEmployeeInvite.value = false
  }
}

watch(companyId, async value => {
  if (!value) {
    allocationsByProfileId.value = {}
    return
  }

  await refreshWorkspace()
}, { immediate: true })

watch(employeeSearch, () => {
  if (employeeSearchDebounce.value) {
    clearTimeout(employeeSearchDebounce.value)
  }

  employeeSearchDebounce.value = setTimeout(async () => {
    await loadEmployees()
    await lookupVisibleAllocations()
  }, 350)
})

watch(whitelistSearch, () => {
  if (whitelistSearchDebounce.value) {
    clearTimeout(whitelistSearchDebounce.value)
  }

  whitelistSearchDebounce.value = setTimeout(async () => {
    if (!companyId.value) return
    await companyStore.searchWhitelist(companyId.value, whitelistSearch.value)
  }, 350)
})

watch(employeeProfileIds, async () => {
  await lookupVisibleAllocations()
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="space-y-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900">Employee Management</h1>
          <p class="mt-1 text-base text-muted-foreground">
            Manage and monitor your workforce mentorship programs.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button class="bg-[#8f1f75] text-white hover:bg-[#7b1a65]" @click="addEmployeeDialogOpen = true">
            <UserPlus class="mr-2 h-4 w-4" />
            Invite Employee
          </Button>
          <Button variant="outline" @click="router.push('/app/admin/users/import')">
            <Upload class="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" @click="router.push('/app/admin/settings?tab=subscription')">
            <Wallet class="mr-2 h-4 w-4" />
            Buy Sessions
          </Button>
          <Button
            variant="outline"
            @click="refreshWorkspace"
            :disabled="profilesLoading || whitelistLoading || isLoadingBilling || allocationLookupLoading"
          >
            <RefreshCw
              class="mr-2 h-4 w-4"
              :class="{ 'animate-spin': profilesLoading || whitelistLoading || isLoadingBilling || allocationLookupLoading }"
            />
            Refresh
          </Button>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card class="border-[#ead4df]">
          <CardHeader class="space-y-2 pb-2">
            <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <span>Total Employees</span>
              <Users class="h-4 w-4 text-[#8f1f75]" />
            </div>
            <CardTitle class="text-4xl">{{ totalEmployees }}</CardTitle>
            <CardDescription class="text-sm text-emerald-700">Workforce records loaded from company directory</CardDescription>
          </CardHeader>
        </Card>

        <Card class="border-[#ead4df]">
          <CardHeader class="space-y-2 pb-2">
            <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <span>Active In Program</span>
              <CheckCircle2 class="h-4 w-4 text-[#8f1f75]" />
            </div>
            <CardTitle class="text-4xl">{{ activeEmployees }}</CardTitle>
            <CardDescription class="text-sm">{{ activeParticipationRate }}% participation rate</CardDescription>
          </CardHeader>
        </Card>

        <Card class="border-[#ead4df]">
          <CardHeader class="space-y-2 pb-2">
            <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <span>Mentors Assigned</span>
              <GitBranch class="h-4 w-4 text-[#8f1f75]" />
            </div>
            <CardTitle class="text-4xl">{{ assignedMentors }}</CardTitle>
            <CardDescription class="text-sm text-[#8f1f75]">Based on employee profile mentor links</CardDescription>
          </CardHeader>
        </Card>

        <Card class="border-[#ead4df]">
          <CardHeader class="space-y-2 pb-2">
            <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <span>Avg Sessions</span>
              <BarChart3 class="h-4 w-4 text-[#8f1f75]" />
            </div>
            <CardTitle class="text-4xl">{{ averageSessions }}</CardTitle>
            <CardDescription class="text-sm">Consumed sessions per employee</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Alert>
        <Wallet class="h-4 w-4" />
        <AlertDescription>
          Company-funded sessions are reserved immediately when allocated. Wallet available: <strong>{{ walletAvailableSessions }}</strong>, reserved for employees: <strong>{{ walletReservedSessions }}</strong>.
        </AlertDescription>
      </Alert>

      <Alert v-if="billingError" variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>{{ billingError }}</AlertDescription>
      </Alert>

      <Alert v-if="allocationError" variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>{{ allocationError }}</AlertDescription>
      </Alert>

      <Alert v-if="!hasActiveCompanyWallet" variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>
          No active company session wallet found. Purchase company-funded sessions before allocating them to employees.
        </AlertDescription>
      </Alert>

      <div class="inline-flex rounded-lg border border-[#ead4df] bg-white p-1">
        <Button
          size="sm"
          :variant="workspaceTab === 'directory' ? 'default' : 'ghost'"
          :class="workspaceTab === 'directory' ? 'bg-[#8f1f75] text-white hover:bg-[#7b1a65]' : ''"
          @click="workspaceTab = 'directory'"
        >
          Directory
        </Button>
        <Button
          size="sm"
          :variant="workspaceTab === 'whitelist' ? 'default' : 'ghost'"
          :class="workspaceTab === 'whitelist' ? 'bg-[#8f1f75] text-white hover:bg-[#7b1a65]' : ''"
          @click="workspaceTab = 'whitelist'"
        >
          Whitelist
        </Button>
      </div>
    </div>

    <div v-show="workspaceTab === 'directory'" class="space-y-4">
      <Card class="border-[#ead4df]">
        <CardContent class="space-y-4 p-5">
          <div class="flex flex-wrap items-center gap-3">
            <div class="w-full min-w-[220px] sm:w-[240px]">
              <Select v-model="selectedDepartment">
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in departmentOptions" :key="option" :value="option">
                    {{ option === 'ALL' ? 'All Departments' : option }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="w-full min-w-[180px] sm:w-[220px]">
              <Select v-model="selectedStatus">
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Status: All</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="INVITED">Invited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="relative min-w-[260px] flex-1">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input v-model="employeeSearch" class="pl-9" placeholder="Search by name or email" />
            </div>

            <div class="ml-auto flex items-center gap-2">
              <Button variant="outline" class="gap-2" @click="exportEmployeesCsv">
                <Download class="h-4 w-4" />
                Export CSV
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="outline" class="gap-2">
                    <SlidersHorizontal class="h-4 w-4" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-56">
                  <DropdownMenuCheckboxItem
                    v-for="column in columnOptions"
                    :key="column.key"
                    :checked="visibleColumns[column.key]"
                    @update:checked="toggleColumn(column.key, $event)"
                  >
                    {{ column.label }}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>

        <div class="border-t border-[#ead4df]" />

        <CardContent class="p-0">
          <div v-if="profilesLoading && !employeeRows.length" class="space-y-3 p-5">
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
            <Skeleton class="h-12 w-full" />
          </div>

          <div v-else-if="!filteredEmployeeRows.length" class="rounded-lg border border-dashed p-8 text-center">
            <Users class="mx-auto h-8 w-8 text-muted-foreground" />
            <p class="mt-3 text-sm text-muted-foreground">No employees matched the selected filters.</p>
          </div>

          <Table v-else>
            <TableHeader>
              <TableRow class="bg-[#f8f1f5]">
                <TableHead>Name</TableHead>
                <TableHead v-if="visibleColumns.department">Department</TableHead>
                <TableHead v-if="visibleColumns.programStatus">Program Status</TableHead>
                <TableHead v-if="visibleColumns.mentorAssigned">Mentor Assigned</TableHead>
                <TableHead v-if="visibleColumns.sessions" class="text-right">Sessions</TableHead>
                <TableHead v-if="visibleColumns.availableBalance" class="text-right">Available</TableHead>
                <TableHead v-if="visibleColumns.lastActivity">Last Activity</TableHead>
                <TableHead class="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in filteredEmployeeRows" :key="row.profile.id" class="hover:bg-muted/40">
                <TableCell>
                  <div class="flex items-center gap-3">
                    <img
                      v-if="row.profile.avatarUrl"
                      :src="row.profile.avatarUrl"
                      :alt="employeeDisplayName(row.profile)"
                      class="h-10 w-10 rounded-full object-cover"
                    />
                    <div
                      v-else
                      class="flex h-10 w-10 items-center justify-center rounded-full bg-[#efe3ea] text-sm font-semibold text-[#8f1f75]"
                    >
                      {{ employeeDisplayName(row.profile).slice(0, 1).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-semibold text-slate-900">{{ employeeDisplayName(row.profile) }}</p>
                      <p class="text-sm text-muted-foreground">{{ employeeSecondary(row.profile) }}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell v-if="visibleColumns.department">{{ resolveDepartment(row.profile) }}</TableCell>

                <TableCell v-if="visibleColumns.programStatus">
                  <Badge
                    v-if="resolveProgramStatus(row) === 'ACTIVE'"
                    class="border-0 bg-[#c9ef92] text-[#29511b]"
                  >
                    {{ statusLabel(resolveProgramStatus(row)) }}
                  </Badge>
                  <Badge
                    v-else-if="resolveProgramStatus(row) === 'INVITED'"
                    class="border-0 bg-[#e7d5ea] text-[#7a2a68]"
                  >
                    {{ statusLabel(resolveProgramStatus(row)) }}
                  </Badge>
                  <Badge v-else class="border-0 bg-[#ececef] text-[#5b5b63]">
                    {{ statusLabel(resolveProgramStatus(row)) }}
                  </Badge>
                </TableCell>

                <TableCell v-if="visibleColumns.mentorAssigned">
                  <span v-if="resolveMentorName(row.profile)" class="font-medium">{{ resolveMentorName(row.profile) }}</span>
                  <span v-else class="text-muted-foreground">No mentor assigned</span>
                </TableCell>

                <TableCell v-if="visibleColumns.sessions" class="text-right text-lg font-semibold">
                  {{ Number(row.allocation?.consumedTotal || 0) }}
                </TableCell>

                <TableCell v-if="visibleColumns.availableBalance" class="text-right">
                  {{ Number(row.allocation?.availableBalance || 0) }}
                </TableCell>

                <TableCell v-if="visibleColumns.lastActivity">
                  {{ formatDateTime(row.allocation?.lastActivityAt || row.profile.updatedAt || row.profile.createdAt) }}
                </TableCell>

                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon" class="ml-auto">
                        <MoreVertical class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="w-48">
                      <DropdownMenuItem
                        :disabled="!hasActiveCompanyWallet || allocationActionId === `allocate-${row.profile.id}`"
                        @click="openAllocationDialog('allocate', row.profile)"
                      >
                        <Plus class="mr-2 h-4 w-4" />
                        Allocate Sessions
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        :disabled="!row.allocation?.availableBalance || allocationActionId === `withdraw-${row.profile.id}`"
                        @click="openAllocationDialog('withdraw', row.profile)"
                      >
                        <Minus class="mr-2 h-4 w-4" />
                        Withdraw Sessions
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>

        <CardContent class="flex flex-col gap-3 border-t border-[#ead4df] p-5 md:flex-row md:items-center md:justify-between">
          <p class="text-sm text-muted-foreground">
            Showing {{ filteredEmployeeRows.length }} of {{ profilesPagination.totalElements || filteredEmployeeRows.length }} employees
          </p>
          <div class="flex items-center gap-2">
            <Button
              v-if="profilesPagination.hasNext"
              variant="outline"
              @click="loadMoreEmployees"
              :disabled="profilesLoading || allocationLookupLoading"
            >
              Load More Employees
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-show="workspaceTab === 'whitelist'" class="space-y-6">
      <Card class="border-[#ead4df]">
        <CardHeader>
          <CardTitle>Company Whitelist</CardTitle>
          <CardDescription>Track invitation status, resend invites, and remove stale records.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="whitelistSearch"
              placeholder="Search by email..."
              class="pl-9"
            />
          </div>

          <div v-if="whitelistLoading && whitelist.length === 0" class="space-y-3">
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
          </div>

          <div v-else>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="entry in whitelist"
                  :key="entry.id"
                  class="hover:bg-muted/50"
                >
                  <TableCell class="font-medium">{{ entry.email }}</TableCell>
                  <TableCell>
                    <Badge :variant="whitelistStatusVariant(entry) as any">
                      {{ whitelistStatusText(entry) }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div v-if="entry.profile">
                      <div class="font-medium">{{ entry.profile.firstName }} {{ entry.profile.lastName }}</div>
                      <div class="text-xs text-muted-foreground">@{{ entry.profile.username }}</div>
                    </div>
                    <span v-else class="text-muted-foreground">—</span>
                  </TableCell>
                  <TableCell>
                    <span v-if="entry.profile">{{ entry.profile.role }}</span>
                    <span v-else class="text-muted-foreground">—</span>
                  </TableCell>
                  <TableCell>{{ entry.addedBy }}</TableCell>
                  <TableCell>{{ formatDate(entry.createdAt) }}</TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end gap-2">
                      <Button
                        v-if="!entry.invitationSent"
                        size="sm"
                        variant="outline"
                        class="gap-1"
                        @click="sendInvitation(entry.id)"
                        :disabled="whitelistLoading"
                      >
                        <Mail class="h-4 w-4" /> Send Invite
                      </Button>
                      <Button
                        v-if="entry.invitationSent && !entry.invitationAccepted"
                        size="sm"
                        variant="outline"
                        class="gap-1"
                        @click="resendInvitation(entry.id)"
                        :disabled="whitelistLoading"
                      >
                        <Mail class="h-4 w-4" /> Resend
                      </Button>
                      <Button
                        v-if="!(entry.isUsed && entry.invitationAccepted)"
                        size="sm"
                        variant="destructive"
                        class="gap-1"
                        @click="removeFromWhitelist(entry.id)"
                        :disabled="whitelistLoading"
                      >
                        <Trash2 class="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div v-if="!whitelist.length" class="rounded-lg border border-dashed p-8 text-center">
              <Users class="mx-auto h-8 w-8 text-muted-foreground" />
              <p class="mt-3 text-sm text-muted-foreground">No whitelist entries found.</p>
            </div>

            <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p class="text-sm text-muted-foreground">
                Showing {{ whitelist.length }} of {{ whitelistPagination.totalElements || whitelist.length }} whitelist entries
              </p>
              <Button
                v-if="whitelistPagination.hasNext"
                variant="outline"
                @click="loadMoreWhitelist"
                :disabled="whitelistLoading"
              >
                {{ whitelistLoading ? 'Loading...' : 'Load More' }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog v-model:open="allocationDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ allocationMode === 'allocate' ? 'Allocate sessions' : 'Withdraw sessions' }}</DialogTitle>
          <DialogDescription>
            <template v-if="allocationMode === 'allocate'">
              Reserve sessions from the shared company wallet for {{ employeeDisplayName(selectedEmployee) }}.
            </template>
            <template v-else>
              Return unused sessions from {{ employeeDisplayName(selectedEmployee) }} back to the shared company wallet.
            </template>
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <div class="rounded-lg border bg-muted/30 p-4 text-sm">
            <div class="font-medium">{{ employeeDisplayName(selectedEmployee) }}</div>
            <div class="mt-1 text-muted-foreground">{{ employeeSecondary(selectedEmployee) }}</div>
            <div class="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>Wallet available: {{ walletAvailableSessions }}</span>
              <span>Employee unused balance: {{ allocationsByProfileId[selectedEmployee?.id]?.availableBalance || 0 }}</span>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="allocation-quantity">Session quantity</Label>
            <Input
              id="allocation-quantity"
              v-model.number="allocationQuantity"
              type="number"
              min="1"
              inputmode="numeric"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeAllocationDialog">Cancel</Button>
          <Button
            :disabled="allocationActionId === `${allocationMode}-${selectedEmployee?.id}`"
            @click="submitAllocationChange"
          >
            {{ allocationMode === 'allocate' ? 'Allocate Sessions' : 'Withdraw Sessions' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="addEmployeeDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite employee</DialogTitle>
          <DialogDescription>
            Add an employee email to your company invite list. They can join your workforce and receive company-funded sessions.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <Label for="employee-email">Employee email</Label>
            <Input
              id="employee-email"
              v-model="newEmployeeEmail"
              type="email"
              placeholder="employee@company.com"
              @keyup.enter="addEmployee"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeAddEmployeeDialog">Cancel</Button>
          <Button :disabled="isSubmittingEmployeeInvite" @click="addEmployee">
            {{ isSubmittingEmployeeInvite ? 'Inviting...' : 'Invite Employee' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
