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
  title: 'Participant Report',
  description: 'Row-based company program participant report',
  requiresAuth: true,
  permissions: ['admin:reports'],
})

const authStore = useAuthStore()
const reportsStore = useReportsStore()
const toast = useAppToast()

const { participantRows } = storeToRefs(reportsStore)

const companyId = computed(() => resolveCompanyId(authStore.loggedInUser))
const isLoading = computed(() => reportsStore.loading.participant)
const error = computed(() => reportsStore.errors.participant)

const loadReport = async () => {
  if (!companyId.value) return

  try {
    await reportsStore.loadParticipantReport(companyId.value)
  } catch (loadError: any) {
    toast.error(loadError?.response?.data?.message || loadError?.message || 'Failed to load participant report')
  }
}

const exportCsv = () => {
  downloadReportCsv(
    reportFilename('participant-report'),
    ['Participant ID', 'Program', 'Employee', 'Email', 'Role', 'Department', 'Status', 'Mentor', 'Match Status', 'Enrolled At'],
    participantRows.value.map(row => [
      row.id,
      row.companyProgramName,
      row.profileName,
      row.profileEmail || '',
      row.profileRole || '',
      row.department || '',
      humanizeReportValue(row.status),
      row.mentorName || '',
      humanizeReportValue(row.matchStatus),
      formatReportDateTime(row.enrolledAt || row.createdAt),
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
      <h1 class="text-2xl font-semibold tracking-tight">Participant Report</h1>
      <div class="flex gap-2">
        <Button variant="outline" @click="loadReport" :disabled="isLoading">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <Button variant="outline" @click="exportCsv" :disabled="!participantRows.length">
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
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Mentor</TableHead>
            <TableHead>Match Status</TableHead>
            <TableHead>Enrolled At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="8">Loading participant rows...</TableCell>
          </TableRow>
          <TableRow v-else-if="!participantRows.length">
            <TableCell colspan="8">No participant rows found.</TableCell>
          </TableRow>
          <template v-else>
            <TableRow v-for="row in participantRows" :key="row.id">
              <TableCell>{{ row.companyProgramName }}</TableCell>
              <TableCell>{{ row.profileName }}</TableCell>
              <TableCell>{{ row.profileEmail || '-' }}</TableCell>
              <TableCell>{{ row.department || '-' }}</TableCell>
              <TableCell>
                <Badge variant="outline">{{ humanizeReportValue(row.status) || '-' }}</Badge>
              </TableCell>
              <TableCell>{{ row.mentorName || 'Unassigned' }}</TableCell>
              <TableCell>{{ humanizeReportValue(row.matchStatus) || '-' }}</TableCell>
              <TableCell>{{ formatReportDateTime(row.enrolledAt || row.createdAt) }}</TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
