<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import invoicesApi, { type PublicInvoice, type InvoiceStatus } from '@/http/requests/app/invoices'
import paymentsApi, { type PaymentRecord, type PaymentStatus, type PaymentMethod, type PaymentType } from '@/http/requests/app/payments'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, RefreshCw, ArrowUpRight } from 'lucide-vue-next'

definePageMeta({
  title: 'Finance',
  description: 'Company invoices and payments',
  requiresAuth: true,
  permissions: ['admin:billing'],
})

type FinanceTab = 'payments' | 'invoices'

type CompanyContext = {
  companyId: string
  companyName: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const resolveFinanceTab = (value?: unknown): FinanceTab => {
  const normalized = String(Array.isArray(value) ? value[0] : value || '').trim().toLowerCase()
  return normalized === 'invoices' ? 'invoices' : 'payments'
}

const activeTab = ref<FinanceTab>(resolveFinanceTab(route.query.tab))
const payments = ref<PaymentRecord[]>([])
const invoices = ref<PublicInvoice[]>([])
const paymentsError = ref<string | null>(null)
const invoicesError = ref<string | null>(null)
const isLoadingPayments = ref(false)
const isLoadingInvoices = ref(false)
const paymentsPage = ref(0)
const paymentsPageSize = ref(20)
const paymentsTotalPages = ref(0)
const paymentsTotalItems = ref(0)
const paymentsHasNext = ref(false)
const paymentsHasPrevious = ref(false)

const paymentSearch = ref('')
const paymentStatus = ref<'ALL' | PaymentStatus>('ALL')
const paymentMethod = ref<'ALL' | PaymentMethod>('ALL')
const paymentType = ref<'ALL' | PaymentType>('ALL')
const invoiceSearch = ref('')
const invoiceStatus = ref<'ALL' | InvoiceStatus>('ALL')

const companyContext = computed<CompanyContext>(() => {
  if (typeof window !== 'undefined') {
    const rawProfile = localStorage.getItem('profile')
    if (rawProfile) {
      try {
        const parsed = JSON.parse(rawProfile)
        return {
          companyId: parsed?.company?.id || parsed?.companyId || parsed?.company_id || authStore.loggedInUser?.companyId || '',
          companyName: parsed?.company?.name || 'Your company',
        }
      } catch {
        return {
          companyId: authStore.loggedInUser?.companyId || '',
          companyName: 'Your company',
        }
      }
    }
  }

  return {
    companyId: authStore.loggedInUser?.companyId || '',
    companyName: 'Your company',
  }
})

const visiblePayments = computed(() => {
  const search = paymentSearch.value.trim().toLowerCase()

  return payments.value.filter(payment => {
    if (paymentStatus.value !== 'ALL' && payment.status !== paymentStatus.value) {
      return false
    }

    if (paymentMethod.value !== 'ALL' && payment.paymentMethod !== paymentMethod.value) {
      return false
    }

    if (paymentType.value !== 'ALL' && payment.paymentType !== paymentType.value) {
      return false
    }

    if (!search) {
      return true
    }

    return [
      payment.description,
      payment.gatewayReference,
      payment.mpesaReceiptNumber,
      payment.cardLastFour,
      payment.invoiceId,
      payment.id,
    ].some(value => String(value || '').toLowerCase().includes(search))
  })
})

const visibleInvoices = computed(() => {
  const search = invoiceSearch.value.trim().toLowerCase()

  return invoices.value.filter(invoice => {
    if (invoiceStatus.value !== 'ALL' && invoice.status !== invoiceStatus.value) {
      return false
    }

    if (!search) {
      return true
    }

    return [
      invoice.invoiceNumber,
      invoice.description,
      invoice.publicToken,
      invoice.latestPayment?.gatewayReference,
      invoice.latestPayment?.checkoutRequestId,
    ].some(value => String(value || '').toLowerCase().includes(search))
  })
})

const totalVisiblePaymentsAmount = computed(() =>
  visiblePayments.value.reduce((total, payment) => total + Number(payment.amount || 0), 0)
)

const totalOpenInvoicesAmount = computed(() =>
  invoices.value
    .filter(invoice => invoice.status === 'OPEN')
    .reduce((total, invoice) => total + Number(invoice.amount || 0), 0)
)

const formatCurrency = (amount: number, currency = 'KES') =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))

const formatDate = (value?: string | null) => {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusVariant = (status?: string | null) => {
  switch (status) {
    case 'COMPLETED':
    case 'PAID':
      return 'default'
    case 'PENDING':
    case 'OPEN':
      return 'secondary'
    case 'FAILED':
    case 'CANCELLED':
    case 'EXPIRED':
    case 'VOID':
      return 'destructive'
    default:
      return 'outline'
  }
}

const getPaymentReference = (payment: PaymentRecord) =>
  payment.gatewayReference
  || payment.mpesaReceiptNumber
  || payment.checkoutRequestId
  || payment.invoiceId
  || payment.id

const fetchPayments = async (page = paymentsPage.value) => {
  if (!companyContext.value.companyId) {
    paymentsError.value = 'Company context was not found. Sign in again and retry.'
    return
  }

  isLoadingPayments.value = true
  paymentsError.value = null

  try {
    const response = await paymentsApi.getPayments({
      companyId: companyContext.value.companyId,
      page,
      size: paymentsPageSize.value,
    })

    if (!response.success) {
      throw new Error(response.message || 'Failed to load company payments.')
    }

    payments.value = response.data?.payments || []
    paymentsPage.value = response.data?.currentPage || 0
    paymentsPageSize.value = response.data?.pageSize || paymentsPageSize.value
    paymentsTotalPages.value = response.data?.totalPages || 0
    paymentsTotalItems.value = response.data?.totalItems || 0
    paymentsHasNext.value = Boolean(response.data?.hasNext)
    paymentsHasPrevious.value = Boolean(response.data?.hasPrevious)
  } catch (loadError: any) {
    console.error('Failed to load company payments:', loadError)
    paymentsError.value =
      loadError?.response?.data?.message
      || loadError?.message
      || 'Failed to load company payments.'
  } finally {
    isLoadingPayments.value = false
  }
}

const fetchInvoices = async () => {
  if (!companyContext.value.companyId) {
    invoicesError.value = 'Company context was not found. Sign in again and retry.'
    return
  }

  isLoadingInvoices.value = true
  invoicesError.value = null

  try {
    const response = await invoicesApi.getCompanyInvoices(companyContext.value.companyId)
    if (!response.success) {
      throw new Error(response.message || 'Failed to load company invoices.')
    }

    invoices.value = response.data || []
  } catch (loadError: any) {
    console.error('Failed to load company invoices:', loadError)
    invoicesError.value =
      loadError?.response?.data?.message
      || loadError?.message
      || 'Failed to load company invoices.'
  } finally {
    isLoadingInvoices.value = false
  }
}

const refreshFinanceData = async () => {
  await Promise.all([
    fetchPayments(activeTab.value === 'payments' ? 0 : paymentsPage.value),
    fetchInvoices(),
  ])
}

const goToInvoicePayment = (invoice: PublicInvoice) => {
  if (!invoice.paymentUrl) {
    return
  }

  window.location.assign(invoice.paymentUrl)
}

watch(() => route.query.tab, value => {
  const nextTab = resolveFinanceTab(value)
  if (activeTab.value !== nextTab) {
    activeTab.value = nextTab
  }
})

watch(activeTab, async value => {
  if (resolveFinanceTab(route.query.tab) !== value) {
    await router.replace({
      query: {
        ...route.query,
        tab: value,
      },
    })
  }

  if (value === 'payments' && !payments.value.length && !isLoadingPayments.value) {
    await fetchPayments(0)
    return
  }

  if (value === 'invoices' && !invoices.value.length && !isLoadingInvoices.value) {
    await fetchInvoices()
  }
})

onMounted(async () => {
  if (!companyContext.value.companyId) {
    return
  }

  await Promise.all([
    fetchPayments(0),
    fetchInvoices(),
  ])
})
</script>

<template>
  <div class="space-y-6 px-4 py-6 md:px-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 rounded-full border border-[#e8c9e2] bg-[#fcf5fa] px-3 py-1 text-xs font-medium text-[#7f2f75]">
          <Building2 class="h-3.5 w-3.5" />
          {{ companyContext.companyName }}
        </div>
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900">Finance</h1>
          <p class="text-sm text-muted-foreground">
            Review company invoices and payments from one workspace.
          </p>
        </div>
      </div>

      <Button variant="outline" class="gap-2" :disabled="isLoadingPayments || isLoadingInvoices" @click="refreshFinanceData">
        <RefreshCw class="h-4 w-4" :class="(isLoadingPayments || isLoadingInvoices) ? 'animate-spin' : ''" />
        Refresh
      </Button>
    </div>

    <Alert v-if="!companyContext.companyId" variant="destructive">
      <AlertDescription>
        Company context was not found in your session. Sign in again and retry.
      </AlertDescription>
    </Alert>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Payments on Current Page</CardDescription>
          <CardTitle class="text-2xl">{{ visiblePayments.length }}</CardTitle>
        </CardHeader>
        <CardContent class="text-sm text-muted-foreground">
          {{ formatCurrency(totalVisiblePaymentsAmount) }} across visible results
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Open Invoices</CardDescription>
          <CardTitle class="text-2xl">{{ invoices.filter(invoice => invoice.status === 'OPEN').length }}</CardTitle>
        </CardHeader>
        <CardContent class="text-sm text-muted-foreground">
          {{ formatCurrency(totalOpenInvoicesAmount) }} awaiting payment
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Total Company Invoices</CardDescription>
          <CardTitle class="text-2xl">{{ invoices.length }}</CardTitle>
        </CardHeader>
        <CardContent class="text-sm text-muted-foreground">
          Includes paid, open, expired, and failed invoices
        </CardContent>
      </Card>
    </div>

    <Tabs v-model="activeTab" class="space-y-6">
      <TabsList class="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
      </TabsList>

      <TabsContent value="payments" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Payments</CardTitle>
            <CardDescription>
              Transactions received against company invoices and subscriptions.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <Alert v-if="paymentsError" variant="destructive">
              <AlertDescription>{{ paymentsError }}</AlertDescription>
            </Alert>

            <div class="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
              <Input v-model="paymentSearch" placeholder="Search by description, reference, receipt, or invoice ID" />

              <Select v-model="paymentStatus">
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select v-model="paymentMethod">
                <SelectTrigger>
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All methods</SelectItem>
                  <SelectItem value="MPESA">M-Pesa</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank transfer</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                  <SelectItem value="FREE">Free</SelectItem>
                </SelectContent>
              </Select>

              <Select v-model="paymentType">
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All types</SelectItem>
                  <SelectItem value="INVOICE">Invoice</SelectItem>
                  <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                  <SelectItem value="UPGRADE">Upgrade</SelectItem>
                  <SelectItem value="ADDON">Add-on</SelectItem>
                  <SelectItem value="SESSION_BOOKING">Session booking</SelectItem>
                  <SelectItem value="TOP_UP">Top-up</SelectItem>
                  <SelectItem value="REFUND">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div v-if="isLoadingPayments" class="space-y-3">
              <Skeleton class="h-12 w-full" />
              <Skeleton class="h-12 w-full" />
              <Skeleton class="h-12 w-full" />
            </div>

            <div v-else class="overflow-x-auto">
              <Table>
                <TableCaption v-if="!visiblePayments.length">No payments found for the selected filters.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead class="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="payment in visiblePayments" :key="payment.id">
                    <TableCell>
                      <div class="font-medium text-slate-900">{{ getPaymentReference(payment) }}</div>
                      <div class="text-xs text-muted-foreground">{{ payment.description || payment.id }}</div>
                    </TableCell>
                    <TableCell>{{ payment.paymentMethod }}</TableCell>
                    <TableCell>{{ payment.paymentType }}</TableCell>
                    <TableCell>
                      <Badge :variant="getStatusVariant(payment.status)">{{ payment.status }}</Badge>
                    </TableCell>
                    <TableCell>{{ formatDate(payment.createdAt) }}</TableCell>
                    <TableCell class="text-right font-medium">{{ formatCurrency(Number(payment.amount || 0), payment.currency) }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div class="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-sm text-muted-foreground">
                Page {{ paymentsPage + 1 }} of {{ Math.max(paymentsTotalPages, 1) }} · {{ paymentsTotalItems }} payment{{ paymentsTotalItems === 1 ? '' : 's' }}
              </p>

              <div class="flex items-center gap-2">
                <Button variant="outline" :disabled="!paymentsHasPrevious || isLoadingPayments" @click="fetchPayments(paymentsPage - 1)">
                  Previous
                </Button>
                <Button variant="outline" :disabled="!paymentsHasNext || isLoadingPayments" @click="fetchPayments(paymentsPage + 1)">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="invoices" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Invoices</CardTitle>
            <CardDescription>
              Invoices raised specifically for {{ companyContext.companyName }}.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <Alert v-if="invoicesError" variant="destructive">
              <AlertDescription>{{ invoicesError }}</AlertDescription>
            </Alert>

            <div class="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_240px]">
              <Input v-model="invoiceSearch" placeholder="Search by invoice number, description, token, or reference" />

              <Select v-model="invoiceStatus">
                <SelectTrigger>
                  <SelectValue placeholder="Invoice status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="VOID">Void</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div v-if="isLoadingInvoices" class="space-y-3">
              <Skeleton class="h-12 w-full" />
              <Skeleton class="h-12 w-full" />
              <Skeleton class="h-12 w-full" />
            </div>

            <div v-else class="overflow-x-auto">
              <Table>
                <TableCaption v-if="!visibleInvoices.length">No company invoices found for the selected filters.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Latest Payment</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead class="text-right">Amount</TableHead>
                    <TableHead class="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="invoice in visibleInvoices" :key="invoice.id">
                    <TableCell>
                      <div class="font-medium text-slate-900">{{ invoice.invoiceNumber }}</div>
                      <div class="text-xs text-muted-foreground">{{ invoice.description || invoice.publicToken }}</div>
                    </TableCell>
                    <TableCell>
                      <Badge :variant="getStatusVariant(invoice.status)">{{ invoice.status }}</Badge>
                    </TableCell>
                    <TableCell>
                      <div class="text-sm text-slate-900">{{ invoice.latestPayment?.paymentMethod || '—' }}</div>
                      <div class="text-xs text-muted-foreground">{{ invoice.latestPayment?.status || 'No payment yet' }}</div>
                    </TableCell>
                    <TableCell>{{ formatDate(invoice.createdAt) }}</TableCell>
                    <TableCell class="text-right font-medium">{{ formatCurrency(Number(invoice.amount || 0), invoice.currency) }}</TableCell>
                    <TableCell class="text-right">
                      <Button
                        v-if="invoice.status === 'OPEN' && invoice.paymentUrl"
                        size="sm"
                        variant="outline"
                        class="gap-1"
                        @click="goToInvoicePayment(invoice)"
                      >
                        <ArrowUpRight class="h-4 w-4" />
                        Pay
                      </Button>
                      <span v-else class="text-xs text-muted-foreground">—</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
