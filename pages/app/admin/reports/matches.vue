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
  title: 'Mentor Match Report',
  description: 'Row-based mentor matching report',
  requiresAuth: true,
  permissions: ['admin:reports'],
})

const authStore = useAuthStore()
const reportsStore = useReportsStore()
const toast = useAppToast()

const { matchRows } = storeToRefs(reportsStore)

const companyId = computed(() => resolveCompanyId(authStore.loggedInUser))
const isLoading = computed(() => reportsStore.loading.match)
const error = computed(() => reportsStore.errors.match)

const loadReport = async () => {
  if (!companyId.value) return

  try {
    await reportsStore.loadMatchReport(companyId.value)
  } catch (loadError: any) {
    toast.error(loadError?.response?.data?.message || loadError?.message || 'Failed to load mentor match report')
  }
}

const exportCsv = () => {
  downloadReportCsv(
    reportFilename('mentor-match-report'),
    ['Participant ID', 'Program', 'Employee', 'Email', 'Participant Status', 'Matching Mode', 'Match Status', 'Mentor', 'Mentor Email', 'Shortlist Count', 'Selection Deadline', 'Assigned At', 'Resolved At'],
    matchRows.value.map(row => [
      row.participantId,
      row.companyProgramName,
      row.participantName,
      row.participantEmail || '',
      humanizeReportValue(row.participantStatus),
      humanizeReportValue(row.matchingMode),
      humanizeReportValue(row.matchStatus),
      row.mentorName || '',
      row.mentorEmail || '',
      row.shortlistCount ?? '',
      formatReportDateTime(row.selectionDeadlineAt),
      formatReportDateTime(row.assignedAt),
      formatReportDateTime(row.resolvedAt),
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
      <h1 class="text-2xl font-semibold tracking-tight">Mentor Match Report</h1>
      <div class="flex gap-2">
        <Button variant="outline" @click="loadReport" :disabled="isLoading">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <Button variant="outline" @click="exportCsv" :disabled="!matchRows.length">
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
            <TableHead>Employee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Matching Mode</TableHead>
            <TableHead>Match Status</TableHead>
            <TableHead>Mentor</TableHead>
            <TableHead>Shortlist</TableHead>
            <TableHead>Selection Deadline</TableHead>
            <TableHead>Assigned At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="9">Loading match rows...</TableCell>
          </TableRow>
          <TableRow v-else-if="!matchRows.length">
            <TableCell colspan="9">No match rows found.</TableCell>
          </TableRow>
          <template v-else>
            <TableRow v-for="row in matchRows" :key="row.participantId">
              <TableCell>{{ row.companyProgramName }}</TableCell>
              <TableCell>
                <div class="font-medium">{{ row.participantName }}</div>
                <div class="text-xs text-muted-foreground">{{ row.participantEmail || '-' }}</div>
              </TableCell>
              <TableCell>{{ humanizeReportValue(row.participantStatus) || '-' }}</TableCell>
              <TableCell>{{ humanizeReportValue(row.matchingMode) || '-' }}</TableCell>
              <TableCell>
                <Badge variant="outline">{{ humanizeReportValue(row.matchStatus) || '-' }}</Badge>
              </TableCell>
              <TableCell>
                <div>{{ row.mentorName || 'Unassigned' }}</div>
                <div class="text-xs text-muted-foreground">{{ row.mentorEmail || '-' }}</div>
              </TableCell>
              <TableCell>{{ row.shortlistCount ?? '-' }}</TableCell>
              <TableCell>{{ formatReportDateTime(row.selectionDeadlineAt) }}</TableCell>
              <TableCell>{{ formatReportDateTime(row.assignedAt) }}</TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
