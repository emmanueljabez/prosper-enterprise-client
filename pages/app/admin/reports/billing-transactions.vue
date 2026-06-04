<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/modules/auth'
import { useReportsStore } from '@/store/modules/reports'
import { useAppToast } from '@/composables/services/toastService'
import {
  downloadReportCsv,
  formatReportDateTime,
  humanizeReportValue,
  reportFilename,
  resolveCompanyId,
} from '@/utils/reports'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Download, RefreshCw } from 'lucide-vue-next'

definePageMeta({
  title: 'Billing Transactions Report',
  description: 'Row-based company billing transaction report',
  requiresAuth: true,
  permissions: ['admin:reports'],
})

const authStore = useAuthStore()
const reportsStore = useReportsStore()
const toast = useAppToast()

const { billingTransactionRows } = storeToRefs(reportsStore)

const companyId = computed(() => resolveCompanyId(authStore.loggedInUser))
const isLoading = computed(() => reportsStore.loading.billingTransactions)
const error = computed(() => reportsStore.errors.billingTransactions)

const formatMoney = (amount?: number | null, currency?: string | null) => {
  const value = Number(amount || 0)
  return `${currency || 'KES'} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const loadReport = async () => {
  if (!companyId.value) return

  try {
    await reportsStore.loadBillingTransactionsReport(companyId.value)
  } catch (loadError: any) {
    toast.error(loadError?.response?.data?.message || loadError?.message || 'Failed to load billing transactions report')
  }
}

const exportCsv = () => {
  downloadReportCsv(
    reportFilename('billing-transactions-report'),
    ['Payment ID', 'Type', 'Method', 'Status', 'Amount', 'Currency', 'Invoice ID', 'Session ID', 'M-Pesa Receipt', 'Gateway Reference', 'Created At', 'Completed At'],
    billingTransactionRows.value.map(row => [
      row.id,
      humanizeReportValue(row.paymentType),
      humanizeReportValue(row.paymentMethod),
      humanizeReportValue(row.status),
      row.amount ?? '',
      row.currency || '',
      row.invoiceId || '',
      row.sessionId || '',
      row.mpesaReceiptNumber || '',
      row.gatewayReference || '',
      formatReportDateTime(row.createdAt),
      formatReportDateTime(row.completedAt),
    ]),
  )
}

watch(companyId, value => {
  if (value) {
    loadReport()
  }
}, { immediate: true })
</script>

<template>
  <div class="container mx-auto flex flex-col gap-6 px-4 py-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <h1 class="text-2xl font-semibold tracking-tight">Billing Transactions Report</h1>
      <div class="flex gap-2">
        <Button variant="outline" @click="loadReport" :disabled="isLoading">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <Button variant="outline" @click="exportCsv" :disabled="!billingTransactionRows.length">
          <Download class="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>

    <Alert v-if="!companyId">
      <AlertDescription>Company context is missing for this account. Sign in again and retry.</AlertDescription>
    </Alert>

    <Alert v-else-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div class="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Completed At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="9">Loading billing transaction rows...</TableCell>
          </TableRow>
          <TableRow v-else-if="!billingTransactionRows.length">
            <TableCell colspan="9">No billing transaction rows found.</TableCell>
          </TableRow>
          <template v-else>
            <TableRow v-for="row in billingTransactionRows" :key="row.id">
              <TableCell>{{ row.id }}</TableCell>
              <TableCell>{{ humanizeReportValue(row.paymentType) || '-' }}</TableCell>
              <TableCell>{{ humanizeReportValue(row.paymentMethod) || '-' }}</TableCell>
              <TableCell>
                <Badge variant="outline">{{ humanizeReportValue(row.status) || '-' }}</Badge>
              </TableCell>
              <TableCell>{{ formatMoney(row.amount, row.currency) }}</TableCell>
              <TableCell>{{ row.invoiceId || '-' }}</TableCell>
              <TableCell>{{ row.mpesaReceiptNumber || row.gatewayReference || '-' }}</TableCell>
              <TableCell>{{ formatReportDateTime(row.createdAt) }}</TableCell>
              <TableCell>{{ formatReportDateTime(row.completedAt) }}</TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
