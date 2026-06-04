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
  title: 'Session Report',
  description: 'Row-based mentorship session report',
  requiresAuth: true,
  permissions: ['admin:reports'],
})

const authStore = useAuthStore()
const reportsStore = useReportsStore()
const toast = useAppToast()

const { sessionRows } = storeToRefs(reportsStore)

const companyId = computed(() => resolveCompanyId(authStore.loggedInUser))
const isLoading = computed(() => reportsStore.loading.session)
const error = computed(() => reportsStore.errors.session)

const loadReport = async () => {
  if (!companyId.value) return

  try {
    await reportsStore.loadSessionReport(companyId.value)
  } catch (loadError: any) {
    toast.error(loadError?.response?.data?.message || loadError?.message || 'Failed to load session report')
  }
}

const exportCsv = () => {
  downloadReportCsv(
    reportFilename('session-report'),
    ['Session ID', 'Employee', 'Employee Email', 'Department', 'Mentor', 'Title', 'Status', 'Platform', 'Scheduled Start', 'Scheduled End', 'Duration Minutes', 'Rating', 'Review Status'],
    sessionRows.value.map(row => [
      row.id,
      row.employeeName,
      row.employeeEmail || '',
      row.department || '',
      row.mentorName,
      row.title || '',
      humanizeReportValue(row.status),
      row.platformDisplayName || '',
      formatReportDateTime(row.scheduledStart),
      formatReportDateTime(row.scheduledEnd),
      row.durationMin ?? '',
      row.rating ?? '',
      humanizeReportValue(row.reviewStatus),
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
      <h1 class="text-2xl font-semibold tracking-tight">Session Report</h1>
      <div class="flex gap-2">
        <Button variant="outline" @click="loadReport" :disabled="isLoading">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <Button variant="outline" @click="exportCsv" :disabled="!sessionRows.length">
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
            <TableHead>Session</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Mentor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scheduled Start</TableHead>
            <TableHead>Scheduled End</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Review Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="9">Loading session rows...</TableCell>
          </TableRow>
          <TableRow v-else-if="!sessionRows.length">
            <TableCell colspan="9">No session rows found.</TableCell>
          </TableRow>
          <template v-else>
            <TableRow v-for="row in sessionRows" :key="row.id">
              <TableCell>
                <div class="font-medium">{{ row.title || 'Mentorship Session' }}</div>
                <div class="text-xs text-muted-foreground">{{ row.platformDisplayName || '-' }}</div>
              </TableCell>
              <TableCell>
                <div>{{ row.employeeName }}</div>
                <div class="text-xs text-muted-foreground">{{ row.employeeEmail || row.department || '-' }}</div>
              </TableCell>
              <TableCell>{{ row.mentorName }}</TableCell>
              <TableCell>
                <Badge variant="outline">{{ humanizeReportValue(row.status) || '-' }}</Badge>
              </TableCell>
              <TableCell>{{ formatReportDateTime(row.scheduledStart) }}</TableCell>
              <TableCell>{{ formatReportDateTime(row.scheduledEnd) }}</TableCell>
              <TableCell>{{ row.durationMin ?? '-' }}</TableCell>
              <TableCell>{{ row.rating ?? '-' }}</TableCell>
              <TableCell>{{ humanizeReportValue(row.reviewStatus) }}</TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
