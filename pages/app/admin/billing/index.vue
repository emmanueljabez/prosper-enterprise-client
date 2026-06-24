<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyBillingStore } from '@/store/modules/company-billing'
import { useAppToast } from '@/composables/services/toastService'
import type { CompanyBillingTransaction } from '@/http/requests/app/companySubscriptions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  RefreshCw,
  Settings2,
  Wallet,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Billing & Session Wallet',
  description: 'Manage your corporate mentoring budget and session allocations.',
  requiresAuth: true,
  permissions: ['admin:billing'],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const billingStore = useCompanyBillingStore()
const toast = useAppToast()

const topUpDialogOpen = ref(false)
const refillDialogOpen = ref(false)
const topUpSessionCount = ref(100)
const transactionStatus = ref('ALL')
const transactionSearch = ref('')
const refillEnabledDraft = ref(false)

const companyContext = computed(() => {
  const authCompanyId = authStore.loggedInUser?.companyId
  const fallbackContext = {
    companyId: authCompanyId || '',
    companyName: 'Your company',
  }

  if (typeof window !== 'undefined') {
    const rawProfile = localStorage.getItem('profile')
    if (rawProfile) {
      try {
        const parsed = JSON.parse(rawProfile)
        return {
          companyId: authCompanyId || parsed?.company?.id || parsed?.companyId || parsed?.company_id || '',
          companyName: parsed?.company?.name || 'Your company',
        }
      } catch {
        return fallbackContext
      }
    }

    const rawUser = localStorage.getItem('loggedInUser')
    if (rawUser) {
      try {
        const parsedUser = JSON.parse(rawUser)
        return {
          companyId: authCompanyId || parsedUser?.company?.id || parsedUser?.companyId || parsedUser?.company_id || '',
          companyName: parsedUser?.company?.name || 'Your company',
        }
      } catch {
        return fallbackContext
      }
    }
  }

  return fallbackContext
})

const dashboard = computed(() => billingStore.dashboard)
const isLoading = computed(() => billingStore.isLoading)
const error = computed(() => billingStore.error)
const isCreatingTopUpInvoice = computed(() => billingStore.isCreatingTopUpInvoice)
const isUpdatingAutoRefill = computed(() => billingStore.isUpdatingAutoRefill)

const subscription = computed(() => dashboard.value?.subscription || null)
const wallet = computed(() => dashboard.value?.wallet || null)
const projectedUsage = computed(() => dashboard.value?.projectedUsage || null)
const autoRefill = computed(() => dashboard.value?.autoRefill || null)
const transactions = computed(() => dashboard.value?.recentTransactions || [])
const transactionPagination = computed(() => dashboard.value?.recentTransactionsPagination || null)
const monthlyTrend = computed(() => dashboard.value?.monthlySpendTrend || [])
const departmentAllocation = computed(() => dashboard.value?.departmentAllocation || [])

const monthlyTrendMaxAmount = computed(() => {
  return monthlyTrend.value.reduce((maxAmount, point) => {
    const amount = Number(point.amount || 0)
    return amount > maxAmount ? amount : maxAmount
  }, 0)
})

const totalTransactionCount = computed(() => Number(transactionPagination.value?.totalItems || 0))
const transactionPage = computed(() => Number(transactionPagination.value?.page || 0) + 1)
const transactionTotalPages = computed(() => Math.max(1, Number(transactionPagination.value?.totalPages || 1)))

const filteredTransactions = computed(() => {
  const search = transactionSearch.value.trim().toLowerCase()

  return transactions.value.filter((transaction: CompanyBillingTransaction) => {
    if (transactionStatus.value !== 'ALL' && transaction.status !== transactionStatus.value) {
      return false
    }

    if (!search) {
      return true
    }

    return [
      transaction.transactionId,
      transaction.reference,
      transaction.description,
      transaction.invoiceNumber,
      transaction.status,
    ].some(value => String(value || '').toLowerCase().includes(search))
  })
})

const currency = computed(() => wallet.value?.currency || autoRefill.value?.currency || 'KES')

const formatCurrency = (amount: number | string, selectedCurrency = currency.value) => {
  const numericAmount = Number(amount || 0)

  if (!Number.isFinite(numericAmount)) {
    return `${selectedCurrency} 0`
  }

  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount)
  } catch {
    return `${selectedCurrency} ${numericAmount.toLocaleString()}`
  }
}

const formatPercent = (value: number | string) => {
  const numericValue = Number(value || 0)
  const prefix = numericValue > 0 ? '+' : ''
  return `${prefix}${numericValue.toFixed(1)}%`
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return '—'

  return parsedDate.toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatNumber = (value: number | string) => Number(value || 0).toLocaleString('en-KE')

const statusClass = (status?: string | null) => {
  switch (String(status || '').toUpperCase()) {
    case 'COMPLETED':
    case 'PAID':
      return 'bg-[#e9f8ee] text-[#15803d]'
    case 'PENDING':
    case 'OPEN':
      return 'bg-[#fff5e6] text-[#b45309]'
    case 'FAILED':
    case 'CANCELLED':
    case 'EXPIRED':
    case 'VOID':
      return 'bg-[#fdecec] text-[#b42318]'
    default:
      return 'bg-[#f3f4f6] text-[#4b5563]'
  }
}

const exportTransactionsCsv = () => {
  const header = ['Transaction ID', 'Date', 'Description', 'Amount', 'Status', 'Invoice']
  const rows = filteredTransactions.value.map(transaction => [
    transaction.transactionId,
    formatDate(transaction.date),
    transaction.description || 'Wallet transaction',
    formatCurrency(transaction.amount, transaction.currency || currency.value),
    transaction.status || 'PENDING',
    transaction.invoiceNumber || '—',
  ])

  const csv = [header, ...rows]
    .map(line => line.map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'company-billing-transactions.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const routeToCompanyPlanSetup = async () => {
  topUpDialogOpen.value = false
  toast.info('Select a company plan to create your wallet first.')
  await router.push({
    path: '/app/admin/settings',
    query: { tab: 'subscription' },
  })
}

const openTopUpDialog = async () => {
  if (!subscription.value?.planId) {
    await routeToCompanyPlanSetup()
    return
  }

  const suggestedSessions = Number(autoRefill.value?.topUpSessions || subscription.value?.seatsPurchased || 100)
  topUpSessionCount.value = Math.max(1, suggestedSessions)
  topUpDialogOpen.value = true
}

const openRefillDialog = () => {
  refillEnabledDraft.value = Boolean(autoRefill.value?.enabled)
  refillDialogOpen.value = true
}

const loadDashboard = async (page = 0) => {
  if (!companyContext.value.companyId) {
    return
  }

  try {
    await billingStore.loadCompanyBillingDashboard(companyContext.value.companyId, {
      page,
      size: transactionPagination.value?.size || 10,
    })
  } catch (loadError: any) {
    toast.error(loadError?.response?.data?.message || loadError?.message || 'Failed to load billing dashboard.')
  }
}

const refreshDashboard = async () => {
  if (!companyContext.value.companyId) {
    return
  }

  try {
    await billingStore.refreshCompanyBillingDashboard(companyContext.value.companyId)
  } catch (refreshError: any) {
    toast.error(refreshError?.response?.data?.message || refreshError?.message || 'Failed to refresh billing dashboard.')
  }
}

const submitTopUp = async () => {
  if (!companyContext.value.companyId) {
    toast.error('Company context not found. Sign in again and retry.')
    return
  }

  const planId = subscription.value?.planId
  if (!planId) {
    await routeToCompanyPlanSetup()
    return
  }

  const sessions = Math.max(1, Math.round(Number(topUpSessionCount.value || 0)))
  topUpSessionCount.value = sessions

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const response = await billingStore.createTopUpInvoice({
      companyId: companyContext.value.companyId,
      planId,
      sessionCount: sessions,
      redirectSuccessUrl: `${origin}/app/admin/billing?invoice_paid=1&context=company_subscription`,
      redirectCancelUrl: `${origin}/app/admin/billing?invoice_cancelled=1&context=company_subscription`,
    })

    if (!response?.paymentUrl) {
      throw new Error('Payment URL missing from top-up invoice response.')
    }

    window.location.assign(response.paymentUrl)
  } catch (topUpError: any) {
    toast.error(topUpError?.response?.data?.message || topUpError?.message || 'Failed to create top-up invoice.')
  }
}

const saveAutoRefillPreference = async () => {
  const companySubscriptionId = subscription.value?.id
  if (!companySubscriptionId) {
    toast.error('No active company subscription found.')
    return
  }

  try {
    await billingStore.updateAutoRefillPreference({
      companySubscriptionId,
      autoRenew: refillEnabledDraft.value,
      companyId: companyContext.value.companyId,
    })

    toast.success(`Auto-refill ${refillEnabledDraft.value ? 'enabled' : 'disabled'}.`)
    refillDialogOpen.value = false
  } catch (updateError: any) {
    toast.error(updateError?.response?.data?.message || updateError?.message || 'Failed to update auto-refill preference.')
  }
}

const goToTransactionPage = async (nextPage: number) => {
  const zeroBasedPage = nextPage - 1
  if (zeroBasedPage < 0 || zeroBasedPage >= transactionTotalPages.value) {
    return
  }

  await loadDashboard(zeroBasedPage)
}

const clearBillingReturnQueryParams = async () => {
  const query = { ...route.query }
  delete query.invoice_paid
  delete query.invoice_cancelled
  delete query.context
  await router.replace({ query })
}

const handleBillingReturn = async () => {
  if (route.query.invoice_paid === '1') {
    toast.success('Payment completed successfully.')
    await clearBillingReturnQueryParams()
    return
  }

  if (route.query.invoice_cancelled === '1') {
    toast.info('Payment was cancelled.')
    await clearBillingReturnQueryParams()
  }
}

onMounted(async () => {
  await handleBillingReturn()

  if (!companyContext.value.companyId) {
    return
  }

  await loadDashboard(0)
})
</script>

<template>
  <div class="billing-dashboard mx-auto max-w-[1280px] space-y-5 px-4 py-5 md:px-6">
    <header class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-1">
        <h1 class="text-xl font-semibold tracking-[-0.01em] text-[#1f2430] md:text-2xl">Billing &amp; Session Wallet</h1>
        <p class="text-sm text-[#687386]">
          Manage your corporate mentoring budget and session allocations.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          class="h-10 gap-2 border-[#d8dce4] bg-white px-4 text-sm text-[#2f3338] hover:bg-[#f9f7fb]"
          :disabled="isLoading"
          @click="openRefillDialog"
        >
          <Settings2 class="h-4 w-4" />
          Manage Billing
        </Button>

        <Button
          class="h-10 gap-2 bg-primary px-4 text-sm text-white hover:bg-primary/90"
          :disabled="isLoading || isCreatingTopUpInvoice"
          @click="openTopUpDialog"
        >
          <Wallet class="h-4 w-4" />
          Top up Wallet
        </Button>
      </div>
    </header>

    <Alert v-if="!companyContext.companyId" variant="destructive" class="border-[#f6d4d4] bg-[#fff8f8] text-[#9b1c1c]">
      <AlertDescription>
        Company context was not found in your session. Sign in again and retry.
      </AlertDescription>
    </Alert>

    <Alert v-else-if="error" variant="destructive" class="border-[#f6d4d4] bg-[#fff8f8] text-[#9b1c1c]">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <section class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
      <article class="rounded-xl border border-[#e8e6eb] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div v-if="isLoading" class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton class="h-36 w-full" />
          <Skeleton class="h-36 w-full" />
        </div>

        <div v-else class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div class="space-y-3 border-b border-[#ececf0] pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-5">
            <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8f5f82]">Available Balance</p>
            <p class="text-[2.35rem] font-medium leading-none text-[#181c22]">
              {{ formatNumber(wallet?.availableBalance || 0) }}
              <span class="text-[1.35rem] font-medium text-[#5b6069]">{{ currency }}</span>
            </p>
            <p class="text-sm text-[#7d8694]">≈ ${{ formatNumber(wallet?.availableBalanceUsd || 0) }} USD</p>
            <div class="inline-flex rounded-full bg-[#eaf8ee] px-3 py-1 text-xs font-semibold text-[#1f7a36]">
              {{ formatPercent(wallet?.balanceChangePercent || 0) }} vs last month
            </div>
          </div>

          <div class="space-y-3">
            <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8f5f82]">Sessions Remaining</p>
            <p class="text-[2.35rem] font-medium leading-none text-[#181c22]">
              {{ formatNumber(wallet?.sessionsAvailable || 0) }}
              <span class="text-[1.35rem] font-medium text-[#5b6069]">Sessions</span>
            </p>
            <div class="space-y-2">
              <div class="h-2.5 overflow-hidden rounded-full bg-[#eceef3]">
                <div
                  class="h-full rounded-full bg-primary transition-all duration-300"
                  :style="{ width: `${Math.min(100, Math.max(0, Number(wallet?.capacityPercent || 0)))}%` }"
                />
              </div>
              <div class="flex items-center justify-between text-xs text-[#7d8694]">
                <span>Used {{ formatNumber(wallet?.sessionsUsed || 0) }} / {{ formatNumber(wallet?.sessionsPurchased || 0) }}</span>
                <span>{{ formatNumber(wallet?.capacityPercent || 0) }}% Capacity</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <div class="space-y-4">
        <article class="rounded-xl border border-[#e8e6eb] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-2">
              <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8f5f82]">Projected Usage</p>
              <p class="text-2xl font-semibold text-[#181c22]">{{ formatCurrency(projectedUsage?.projectedSpend || 0) }}</p>
              <p class="text-sm text-[#7b8390]">
                Estimated spend next 30 days based on {{ projectedUsage?.sessionsInWindow || 0 }} completed sessions.
              </p>
            </div>
            <Badge variant="outline" class="border-[#e3dbe8] bg-[#f8f6fb] text-[10px] uppercase tracking-[0.12em] text-[#5b6270]">
              {{ projectedUsage?.activeEmployees || 0 }} active employees
            </Badge>
          </div>

          <div class="mt-4 flex items-center justify-between border-t border-[#ececf0] pt-3 text-xs text-[#6c7380]">
            <span>Plan Type</span>
            <span class="font-semibold text-[#232934]">{{ subscription?.planName || 'Not set' }}</span>
          </div>
        </article>

        <article class="rounded-xl border border-[#0f1d37] bg-[#0d1628] p-4 text-white shadow-[0_1px_2px_rgba(15,23,42,0.2)]">
          <div class="flex items-center gap-2 text-sm font-semibold">
            <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1f2f4d] text-[11px]">i</span>
            {{ autoRefill?.enabled ? 'Auto-Refill Active' : 'Auto-Refill Paused' }}
          </div>
          <p class="mt-2 text-sm text-[#d2d9e6]">
            {{ autoRefill?.enabled
              ? `Top-up of ${formatCurrency(autoRefill.topUpAmount || 0, autoRefill.currency || currency)} will trigger when balance falls below ${formatCurrency(autoRefill.triggerAmount || 0, autoRefill.currency || currency)}.`
              : 'Enable auto-refill to keep your wallet funded when balance runs low.' }}
          </p>
          <Button
            variant="secondary"
            class="mt-4 h-9 w-full bg-[#1b2b49] text-sm text-white hover:bg-[#22385f]"
            :disabled="isUpdatingAutoRefill"
            @click="openRefillDialog"
          >
            {{ isUpdatingAutoRefill ? 'Saving…' : 'Edit Refill Settings' }}
          </Button>
        </article>
      </div>
    </section>

    <section class="rounded-xl border border-[#e8e6eb] bg-white">
      <div class="flex flex-col gap-3 border-b border-[#ececf0] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 class="text-[1.2rem] font-semibold leading-tight tracking-[-0.01em] text-[#222a36]">Recent Transactions</h2>

        <div class="flex flex-wrap items-center gap-2">
          <Input
            v-model="transactionSearch"
            class="h-9 w-[220px] border-[#e3dbe8] text-sm"
            placeholder="Search transaction"
          />

          <Select v-model="transactionStatus">
            <SelectTrigger class="h-9 w-[150px] border-[#e3dbe8] text-sm">
              <Filter class="mr-2 h-3.5 w-3.5" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" class="h-9 gap-2 border-[#e3dbe8] text-sm" @click="exportTransactionsCsv">
            <Download class="h-3.5 w-3.5" />
            Export
          </Button>

          <Button variant="outline" class="h-9 gap-2 border-[#e3dbe8] text-sm" :disabled="isLoading" @click="refreshDashboard">
            <RefreshCw class="h-3.5 w-3.5" :class="isLoading ? 'animate-spin' : ''" />
            Refresh
          </Button>
        </div>
      </div>

      <div v-if="isLoading" class="space-y-3 p-5">
        <Skeleton class="h-11 w-full" />
        <Skeleton class="h-11 w-full" />
        <Skeleton class="h-11 w-full" />
        <Skeleton class="h-11 w-full" />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[980px]">
          <thead>
            <tr class="border-b border-[#ececf0] bg-[#fafafb] text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
              <th class="px-5 py-3">Transaction ID</th>
              <th class="px-5 py-3">Date</th>
              <th class="px-5 py-3">Description</th>
              <th class="px-5 py-3">Amount</th>
              <th class="px-5 py-3">Status</th>
              <th class="px-5 py-3">Invoice</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredTransactions.length" class="border-b border-[#f1f1f4]">
              <td colspan="6" class="px-5 py-12 text-center text-sm text-[#7c8494]">
                No transactions match the selected filters.
              </td>
            </tr>

            <tr
              v-for="transaction in filteredTransactions"
              :key="transaction.id"
              class="border-b border-[#f1f1f4] align-top last:border-b-0"
            >
              <td class="px-5 py-4 text-sm font-medium text-[#202630]">#{{ transaction.transactionId }}</td>
              <td class="px-5 py-4 text-sm text-[#667085]">{{ formatDate(transaction.date) }}</td>
              <td class="px-5 py-4 text-sm text-[#202630]">{{ transaction.description || 'Wallet transaction' }}</td>
              <td class="px-5 py-4 text-sm font-semibold text-[#202630]">
                {{ formatCurrency(transaction.amount, transaction.currency || currency) }}
              </td>
              <td class="px-5 py-4">
                <span class="inline-flex rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]" :class="statusClass(transaction.status)">
                  {{ transaction.status }}
                </span>
              </td>
              <td class="px-5 py-4 text-sm">
                <a
                  v-if="transaction.invoiceUrl"
                  :href="transaction.invoiceUrl"
                  class="inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80"
                >
                  {{ transaction.invoiceNumber ? 'View Invoice' : 'Open' }}
                  <ArrowUpRight class="h-3.5 w-3.5" />
                </a>
                <span v-else class="text-[#98a1b2]">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-3 border-t border-[#ececf0] px-5 py-4 md:flex-row md:items-center md:justify-between">
        <p class="text-sm text-[#667085]">
          Showing {{ filteredTransactions.length }} of {{ formatNumber(totalTransactionCount) }} transactions
        </p>

        <div class="flex items-center gap-2 text-sm">
          <Button
            variant="outline"
            class="h-8 w-8 border-[#e2d8e1] p-0"
            :disabled="!transactionPagination?.hasPrevious || isLoading"
            @click="goToTransactionPage(transactionPage - 1)"
          >
            <ChevronLeft class="h-4 w-4" />
          </Button>

          <span class="px-2 text-[#4a5160]">{{ transactionPage }}</span>
          <span class="text-[#8e94a0]">/</span>
          <span class="text-[#4a5160]">{{ transactionTotalPages }}</span>

          <Button
            variant="outline"
            class="h-8 w-8 border-[#e2d8e1] p-0"
            :disabled="!transactionPagination?.hasNext || isLoading"
            @click="goToTransactionPage(transactionPage + 1)"
          >
            <ChevronRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <article class="rounded-xl border border-[#e8e6eb] bg-white p-5">
        <h2 class="text-[1.2rem] font-semibold leading-tight tracking-[-0.01em] text-[#222a36]">Monthly Spend Trends</h2>

        <div v-if="!monthlyTrend.length" class="mt-5 rounded-lg border border-dashed border-[#e8e6eb] p-8 text-center text-sm text-[#7b8290]">
          Spend trends will appear once session transactions are recorded.
        </div>

        <div v-else class="mt-4">
          <div class="flex h-40 items-end gap-2">
            <div
              v-for="point in monthlyTrend"
              :key="point.month"
              class="group flex flex-1 flex-col items-stretch justify-end"
            >
              <div
                class="rounded-t-md bg-[#e9edf3] transition-colors group-hover:bg-[#dfe4ec]"
                :class="point === monthlyTrend[monthlyTrend.length - 1] ? 'bg-primary/90 group-hover:bg-primary' : ''"
                :style="{
                  height: `${Math.max(16, Math.round((Number(point.amount || 0) / Math.max(monthlyTrendMaxAmount, 1)) * 100))}%`,
                }"
              />
            </div>
          </div>

          <div class="mt-3 grid grid-cols-6 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98a2b3]">
            <span v-for="point in monthlyTrend" :key="`${point.month}-label`">{{ point.label }}</span>
          </div>
        </div>
      </article>

      <article class="rounded-xl border border-[#e8e6eb] bg-white p-5">
        <h2 class="text-[1.2rem] font-semibold leading-tight tracking-[-0.01em] text-[#222a36]">Allocation by Department</h2>

        <div v-if="!departmentAllocation.length" class="mt-5 rounded-lg border border-dashed border-[#e8e6eb] p-8 text-center text-sm text-[#7b8290]">
          Department allocation appears once completed sessions are available.
        </div>

        <div v-else class="mt-4 space-y-4">
          <div v-for="department in departmentAllocation" :key="department.department" class="space-y-1.5">
            <div class="flex items-center justify-between text-sm">
              <p class="font-medium text-[#202630]">{{ department.department }}</p>
              <p class="text-[#667085]">{{ formatCurrency(department.amount, currency) }} ({{ department.percentage }}%)</p>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-[#eceef3]">
              <div class="h-full rounded-full bg-primary" :style="{ width: `${Math.min(100, Math.max(0, department.percentage))}%` }" />
            </div>
          </div>
        </div>
      </article>
    </section>

    <Dialog v-model:open="topUpDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top up company wallet</DialogTitle>
          <DialogDescription>
            Add more company-funded sessions to your shared wallet.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-[#374151]">Session count</label>
            <Input v-model.number="topUpSessionCount" type="number" min="1" inputmode="numeric" />
          </div>

          <div class="rounded-md border border-[#ebe5ef] bg-[#faf8fc] px-3 py-2 text-sm text-[#667085]">
            Estimated total: <strong class="text-[#202630]">{{ formatCurrency((Number(topUpSessionCount || 0) * Number(wallet?.pricePerSession || 0)), currency) }}</strong>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" :disabled="isCreatingTopUpInvoice" @click="topUpDialogOpen = false">Cancel</Button>
          <Button class="bg-primary text-white hover:bg-primary/90" :disabled="isCreatingTopUpInvoice" @click="submitTopUp">
            {{ isCreatingTopUpInvoice ? 'Preparing invoice…' : 'Proceed to Payment' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="refillDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Refill settings</DialogTitle>
          <DialogDescription>
            Control whether your company wallet automatically refills when balance is low.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div class="rounded-md border border-[#ebe5ef] bg-[#faf8fc] p-3 text-sm text-[#667085]">
            Trigger threshold: <strong class="text-[#202630]">{{ formatCurrency(autoRefill?.triggerAmount || 0, autoRefill?.currency || currency) }}</strong><br>
            Top-up amount: <strong class="text-[#202630]">{{ formatCurrency(autoRefill?.topUpAmount || 0, autoRefill?.currency || currency) }}</strong>
          </div>

          <div class="flex items-center justify-between rounded-md border border-[#ebe5ef] px-3 py-2">
            <p class="text-sm font-medium text-[#202630]">Enable auto-refill</p>
            <Button
              type="button"
              variant="outline"
              class="h-8 border-[#d8dce4] px-3 text-xs"
              @click="refillEnabledDraft = !refillEnabledDraft"
            >
              {{ refillEnabledDraft ? 'Enabled' : 'Disabled' }}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" :disabled="isUpdatingAutoRefill" @click="refillDialogOpen = false">Cancel</Button>
          <Button class="bg-primary text-white hover:bg-primary/90" :disabled="isUpdatingAutoRefill" @click="saveAutoRefillPreference">
            {{ isUpdatingAutoRefill ? 'Saving…' : 'Save preference' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.billing-dashboard {
  font-family: 'Montserrat', 'Inter', ui-sans-serif, system-ui, sans-serif;
  background: linear-gradient(180deg, #f7f7f9 0%, #f4f5f7 100%);
  border-radius: 1rem;
}

@media (max-width: 768px) {
  .billing-dashboard {
    border-radius: 0.75rem;
  }
}
</style>
