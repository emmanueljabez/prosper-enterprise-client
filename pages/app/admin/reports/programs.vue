<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/modules/auth'
import { useReportsStore } from '@/store/modules/reports'
import { useAppToast } from '@/composables/services/toastService'
import {
  downloadReportCsv,
  formatReportDate,
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
  title: 'Program Report',
  description: 'Row-based company program report',
  requiresAuth: true,
  permissions: ['admin:reports'],
})

const authStore = useAuthStore()
const reportsStore = useReportsStore()
const toast = useAppToast()

const { programRows } = storeToRefs(reportsStore)

const companyId = computed(() => resolveCompanyId(authStore.loggedInUser))
const isLoading = computed(() => reportsStore.loading.program)
const error = computed(() => reportsStore.errors.program)

const loadReport = async () => {
  if (!companyId.value) return

  try {
    await reportsStore.loadProgramReport(companyId.value)
  } catch (loadError: any) {
    toast.error(loadError?.response?.data?.message || loadError?.message || 'Failed to load program report')
  }
}

const exportCsv = () => {
  downloadReportCsv(
    reportFilename('program-report'),
    ['Program ID', 'Program', 'Status', 'Matching Mode', 'Objective', 'Target Audience', 'Start Date', 'End Date', 'Capacity', 'Created At'],
    programRows.value.map(row => [
      row.id,
      row.name,
      humanizeReportValue(row.status),
      humanizeReportValue(row.matchingMode),
      row.objective || '',
      row.targetAudienceDescription || '',
      formatReportDate(row.startsAt),
      formatReportDate(row.endsAt),
      row.maxParticipants || 'Open',
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
      <h1 class="text-2xl font-semibold tracking-tight">Program Report</h1>
      <div class="flex gap-2">
        <Button variant="outline" @click="loadReport" :disabled="isLoading">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <Button variant="outline" @click="exportCsv" :disabled="!programRows.length">
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
            <TableHead>Status</TableHead>
            <TableHead>Matching Mode</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="7">Loading program rows...</TableCell>
          </TableRow>
          <TableRow v-else-if="!programRows.length">
            <TableCell colspan="7">No program rows found.</TableCell>
          </TableRow>
          <template v-else>
            <TableRow v-for="row in programRows" :key="row.id">
              <TableCell>
                <div class="font-medium">{{ row.name }}</div>
                <div class="text-xs text-muted-foreground">{{ row.objective || row.targetAudienceDescription || '-' }}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{{ humanizeReportValue(row.status) || '-' }}</Badge>
              </TableCell>
              <TableCell>{{ humanizeReportValue(row.matchingMode) || '-' }}</TableCell>
              <TableCell>{{ formatReportDate(row.startsAt) }}</TableCell>
              <TableCell>{{ formatReportDate(row.endsAt) }}</TableCell>
              <TableCell>{{ row.maxParticipants || 'Open' }}</TableCell>
              <TableCell>{{ formatReportDateTime(row.createdAt) }}</TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
