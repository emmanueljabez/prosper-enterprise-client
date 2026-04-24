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
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { AlertCircle, Minus, Plus, RefreshCw, Search, Upload, UserPlus, Users, Wallet } from 'lucide-vue-next'

definePageMeta({
  title: 'Employees',
  description: 'Allocate company-funded sessions to employees',
  requiresAuth: true,
  permissions: ['admin:users'],
})

type AllocationMode = 'allocate' | 'withdraw'

const router = useRouter()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const toast = useAppToast()
const {
  isLoadingBilling,
  billingError,
  activeCompanySubscriptionId,
  managedCompanySubscription,
  managedCompanyWallet,
  loadCompanyBilling,
  getWalletReservedSessions,
} = useCompanySubscriptionAdmin()

const { profiles, profilesLoading, profilesPagination } = storeToRefs(companyStore)

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

const employeeSearch = ref('')
const employeeSearchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)
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

const employeeProfiles = computed(() =>
  (profiles.value || []).filter((profile: any) => {
    const normalizedRole = String(profile?.role || '').trim().toLowerCase()
    return ['employee', 'mentee'].includes(normalizedRole)
  }),
)

const employeeProfileIds = computed(() => employeeProfiles.value.map(profile => profile.id))

const walletAvailableSessions = computed(() => Number(managedCompanyWallet.value?.sessionsAvailable || 0))
const walletPurchasedSessions = computed(() => Number(managedCompanyWallet.value?.sessionsPurchased || 0))
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

const employeeDisplayName = (profile: any) => {
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
  return fullName || profile?.username || profile?.email || 'Employee'
}

const employeeSecondary = (profile: any) => {
  const details = [profile?.email, profile?.industry || profile?.location].filter(Boolean)
  return details.join(' • ') || 'Company employee'
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
    toast.error('You can only withdraw from the employee’s unused balance')
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

watch(employeeProfileIds, async () => {
  await lookupVisibleAllocations()
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Employees</h1>
        <p class="text-sm text-muted-foreground">
          Allocate company-funded sessions to employees. Reserved sessions can be used across any live company program.
        </p>
      </div>

      <div class="flex gap-2">
        <Button variant="outline" @click="router.push('/app/admin/users/import')">
          <Upload class="mr-2 h-4 w-4" />
          Import Employees
        </Button>
        <Button variant="outline" @click="addEmployeeDialogOpen = true">
          <UserPlus class="mr-2 h-4 w-4" />
          Add Employee
        </Button>
        <Button variant="outline" @click="refreshWorkspace" :disabled="profilesLoading || isLoadingBilling || allocationLookupLoading">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': profilesLoading || isLoadingBilling || allocationLookupLoading }" />
          Refresh
        </Button>
        <Button variant="outline" @click="router.push('/app/admin/settings?tab=subscription')">
          <Wallet class="mr-2 h-4 w-4" />
          Buy Sessions
        </Button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Employees Loaded</CardDescription>
          <CardTitle class="text-3xl">{{ employeeRows.length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Wallet Available</CardDescription>
          <CardTitle class="text-3xl">{{ walletAvailableSessions }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Reserved For Employees</CardDescription>
          <CardTitle class="text-3xl">{{ walletReservedSessions }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Purchased Lifetime</CardDescription>
          <CardTitle class="text-3xl">{{ walletPurchasedSessions }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <Alert>
      <Wallet class="h-4 w-4" />
      <AlertDescription>
        Company-funded sessions are reserved immediately when allocated. Unused allocations can be withdrawn and returned to the shared wallet.
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
        No active company session wallet found yet. Purchase company-funded sessions from Settings before allocating them to employees.
      </AlertDescription>
    </Alert>

    <Alert>
      <UserPlus class="h-4 w-4" />
      <AlertDescription>
        Add individual employees by email or import them in bulk from this page, then allocate company-funded sessions once they are in your workforce list.
      </AlertDescription>
    </Alert>

    <Card>
      <CardHeader>
        <CardTitle>Employee Allocation Workspace</CardTitle>
        <CardDescription>
          Search employees, review current balances, and reserve or withdraw company-funded sessions.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="relative">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="employeeSearch"
            class="pl-9"
            placeholder="Search employees by name or email"
          />
        </div>

        <div v-if="profilesLoading && !employeeRows.length" class="space-y-3">
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
        </div>

        <div v-else-if="!employeeRows.length" class="rounded-lg border border-dashed p-8 text-center">
          <Users class="mx-auto h-8 w-8 text-muted-foreground" />
          <p class="mt-3 text-sm text-muted-foreground">No employees matched this search.</p>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Allocated</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in employeeRows" :key="row.profile.id">
              <TableCell>
                <div class="space-y-1">
                  <div class="font-medium">{{ employeeDisplayName(row.profile) }}</div>
                  <div class="text-xs text-muted-foreground">{{ employeeSecondary(row.profile) }}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{{ row.allocation?.allocatedTotal || 0 }}</Badge>
              </TableCell>
              <TableCell>{{ row.allocation?.consumedTotal || 0 }}</TableCell>
              <TableCell>{{ row.allocation?.availableBalance || 0 }}</TableCell>
              <TableCell>{{ formatDateTime(row.allocation?.lastActivityAt || row.profile.createdAt) }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    :disabled="!hasActiveCompanyWallet || allocationActionId === `allocate-${row.profile.id}`"
                    @click="openAllocationDialog('allocate', row.profile)"
                  >
                    <Plus class="mr-2 h-4 w-4" />
                    Allocate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    :disabled="!row.allocation?.availableBalance || allocationActionId === `withdraw-${row.profile.id}`"
                    @click="openAllocationDialog('withdraw', row.profile)"
                  >
                    <Minus class="mr-2 h-4 w-4" />
                    Withdraw
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div v-if="profilesPagination.hasNext" class="flex justify-center">
          <Button variant="outline" @click="loadMoreEmployees" :disabled="profilesLoading || allocationLookupLoading">
            Load More Employees
          </Button>
        </div>
      </CardContent>
    </Card>

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
          <DialogTitle>Add employee</DialogTitle>
          <DialogDescription>
            Add an employee email to your company invite list. They can join the workforce and then receive company-funded session allocations.
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
            {{ isSubmittingEmployeeInvite ? 'Adding...' : 'Add Employee' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
