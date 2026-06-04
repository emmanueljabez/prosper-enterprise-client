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
  title: 'Risk Signals Report',
  description: 'Row-based review alert and rematch signal report',
  requiresAuth: true,
  permissions: ['admin:reports'],
})

const authStore = useAuthStore()
const reportsStore = useReportsStore()
const toast = useAppToast()

const { riskSignalRows } = storeToRefs(reportsStore)

const companyId = computed(() => resolveCompanyId(authStore.loggedInUser))
const isLoading = computed(() => reportsStore.loading.riskSignals)
const error = computed(() => reportsStore.errors.riskSignals)

const loadReport = async () => {
  if (!companyId.value) return

  try {
    await reportsStore.loadRiskSignalsReport(companyId.value)
  } catch (loadError: any) {
    toast.error(loadError?.response?.data?.message || loadError?.message || 'Failed to load risk signals report')
  }
}

const exportCsv = () => {
  downloadReportCsv(
    reportFilename('risk-signals-report'),
    ['Alert ID', 'Alert Type', 'Severity', 'Status', 'Program', 'Employee', 'Employee Email', 'Mentor', 'Question', 'Score', 'Details', 'Created At'],
    riskSignalRows.value.map(row => [
      row.id,
      humanizeReportValue(row.alertType),
      humanizeReportValue(row.severity),
      humanizeReportValue(row.status),
      row.companyProgramName || '',
      row.participantName || '',
      row.participantEmail || '',
      row.mentorName || '',
      humanizeReportValue(row.questionCode),
      row.scoreValue ?? '',
      row.details || '',
      formatReportDateTime(row.createdAt),
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
      <h1 class="text-2xl font-semibold tracking-tight">Risk Signals Report</h1>
      <div class="flex gap-2">
        <Button variant="outline" @click="loadReport" :disabled="isLoading">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <Button variant="outline" @click="exportCsv" :disabled="!riskSignalRows.length">
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
            <TableHead>Signal</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Mentor</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="9">Loading risk signal rows...</TableCell>
          </TableRow>
          <TableRow v-else-if="!riskSignalRows.length">
            <TableCell colspan="9">No risk signal rows found.</TableCell>
          </TableRow>
          <template v-else>
            <TableRow v-for="row in riskSignalRows" :key="row.id">
              <TableCell>
                <Badge variant="outline">{{ humanizeReportValue(row.alertType) || '-' }}</Badge>
                <div class="mt-1 max-w-[260px] text-xs text-muted-foreground">{{ row.details || '-' }}</div>
              </TableCell>
              <TableCell>{{ humanizeReportValue(row.severity) || '-' }}</TableCell>
              <TableCell>{{ humanizeReportValue(row.status) || '-' }}</TableCell>
              <TableCell>{{ row.companyProgramName || '-' }}</TableCell>
              <TableCell>
                <div>{{ row.participantName || '-' }}</div>
                <div class="text-xs text-muted-foreground">{{ row.participantEmail || '-' }}</div>
              </TableCell>
              <TableCell>{{ row.mentorName || '-' }}</TableCell>
              <TableCell>{{ humanizeReportValue(row.questionCode) || '-' }}</TableCell>
              <TableCell>{{ row.scoreValue ?? '-' }}</TableCell>
              <TableCell>{{ formatReportDateTime(row.createdAt) }}</TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
