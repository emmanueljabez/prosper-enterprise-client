<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/modules/auth'
import { useReportsStore } from '@/store/modules/reports'
import { useAppToast } from '@/composables/services/toastService'
import {
  downloadReportCsv,
  reportFilename,
  resolveCompanyId,
} from '@/utils/reports'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Download, RefreshCw } from 'lucide-vue-next'

definePageMeta({
  title: 'Pulse Coverage Report',
  description: 'Row-based pulse coverage report by company program',
  requiresAuth: true,
  permissions: ['admin:reports'],
})

const authStore = useAuthStore()
const reportsStore = useReportsStore()
const toast = useAppToast()

const { pulseCoverageRows } = storeToRefs(reportsStore)

const companyId = computed(() => resolveCompanyId(authStore.loggedInUser))
const isLoading = computed(() => reportsStore.loading.pulseCoverage)
const error = computed(() => reportsStore.errors.pulseCoverage)

const formatPercent = (value?: number | null) => `${Number(value || 0).toFixed(0)}%`

const loadReport = async () => {
  if (!companyId.value) return

  try {
    await reportsStore.loadPulseCoverageReport(companyId.value)
  } catch (loadError: any) {
    toast.error(loadError?.response?.data?.message || loadError?.message || 'Failed to load pulse coverage report')
  }
}

const exportCsv = () => {
  downloadReportCsv(
    reportFilename('pulse-coverage-report'),
    ['Program ID', 'Program', 'Total Pulses', 'Completed', 'Pending', 'Expired', 'Baseline', 'Program End', 'Completion Rate'],
    pulseCoverageRows.value.map(row => [
      row.companyProgramId,
      row.companyProgramName || '',
      row.totalPulses,
      row.completedPulses,
      row.pendingPulses,
      row.expiredPulses,
      row.baselinePulses,
      row.programEndPulses,
      formatPercent(row.completionRate),
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
      <h1 class="text-2xl font-semibold tracking-tight">Pulse Coverage Report</h1>
      <div class="flex gap-2">
        <Button variant="outline" @click="loadReport" :disabled="isLoading">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <Button variant="outline" @click="exportCsv" :disabled="!pulseCoverageRows.length">
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
            <TableHead>Program</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Pending</TableHead>
            <TableHead>Expired</TableHead>
            <TableHead>Baseline</TableHead>
            <TableHead>Program End</TableHead>
            <TableHead>Completion Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="8">Loading pulse coverage rows...</TableCell>
          </TableRow>
          <TableRow v-else-if="!pulseCoverageRows.length">
            <TableCell colspan="8">No pulse coverage rows found.</TableCell>
          </TableRow>
          <template v-else>
            <TableRow v-for="row in pulseCoverageRows" :key="row.companyProgramId">
              <TableCell>{{ row.companyProgramName || 'Program' }}</TableCell>
              <TableCell>{{ row.totalPulses }}</TableCell>
              <TableCell>{{ row.completedPulses }}</TableCell>
              <TableCell>{{ row.pendingPulses }}</TableCell>
              <TableCell>{{ row.expiredPulses }}</TableCell>
              <TableCell>{{ row.baselinePulses }}</TableCell>
              <TableCell>{{ row.programEndPulses }}</TableCell>
              <TableCell>{{ formatPercent(row.completionRate) }}</TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
