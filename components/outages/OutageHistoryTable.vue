<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-wrap gap-2">
      <Select v-model="filters.severity" class="w-36">
        <SelectTrigger>
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Severities</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="major">Major</SelectItem>
          <SelectItem value="minor">Minor</SelectItem>
          <SelectItem value="degraded">Degraded</SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="filters.serviceType" class="w-36">
        <SelectTrigger>
          <SelectValue placeholder="Service Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Services</SelectItem>
          <SelectItem value="fiber">Fiber</SelectItem>
          <SelectItem value="wireless">Wireless</SelectItem>
          <SelectItem value="backbone">Backbone/Core</SelectItem>
          <SelectItem value="data_center">Data Center</SelectItem>
        </SelectContent>
      </Select>

      <DateRangePicker
          v-model="filters.dateRange"
          class="w-72"
          placeholder="Select date range"
      />

      <div class="flex-1"></div>

      <Input
          v-model="filters.search"
          placeholder="Search outage history..."
          class="w-64"
      />
    </div>

    <!-- Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Outage</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Resolved</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Root Cause</TableHead>
            <TableHead>Impact</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="outage in filteredOutages" :key="outage.id">
            <TableCell>
              <div class="font-medium">{{ outage.title }}</div>
              <div class="text-xs text-muted-foreground mt-0.5">{{ formatServiceType(outage.serviceType) }}</div>
            </TableCell>
            <TableCell>
              <Badge
                  :variant="outage.severity === 'critical' ? 'destructive' : outage.severity === 'major' ? 'warning' : outage.severity === 'minor' ? 'info' : 'secondary'"
              >
                {{ formatSeverity(outage.severity) }}
              </Badge>
            </TableCell>
            <TableCell>
              <div>{{ formatDate(outage.startedAt) }}</div>
              <div class="text-xs text-muted-foreground">{{ formatTime(outage.startedAt) }}</div>
            </TableCell>
            <TableCell>
              <div>{{ formatDate(outage.resolvedAt) }}</div>
              <div class="text-xs text-muted-foreground">{{ formatTime(outage.resolvedAt) }}</div>
            </TableCell>
            <TableCell>
              {{ formatDuration(outage) }}
            </TableCell>
            <TableCell>
              <div class="max-w-xs truncate">{{ outage.rootCause || 'Not specified' }}</div>
            </TableCell>
            <TableCell>
              <div>{{ outage.estimatedCustomersAffected?.toLocaleString() || 'Unknown' }} customers</div>
              <div class="flex flex-wrap gap-1 mt-1">
                <Badge
                    v-for="area in outage.affectedAreas?.slice(0, 1)"
                    :key="area"
                    variant="outline"
                    class="text-xs"
                >
                  {{ area }}
                </Badge>
                <Badge
                    v-if="outage.affectedAreas?.length > 1"
                    variant="outline"
                    class="text-xs"
                >
                  +{{ outage.affectedAreas.length - 1 }} more
                </Badge>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" size="sm" @click="$emit('view', outage)">
                <EyeIcon class="h-4 w-4 mr-1" />
                Details
              </Button>
            </TableCell>
          </TableRow>

          <TableRow v-if="filteredOutages.length === 0">
            <TableCell colspan="8" class="h-24 text-center">
              No historical outages match your filter criteria
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format, formatDistance, isWithinInterval } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { EyeIcon } from 'lucide-vue-next'
import DateRangePicker from '@/components/ui/date-range-picker/DateRangePicker.vue'

const props = defineProps({
  outages: {
    type: Array,
    required: true
  }
})

defineEmits(['view'])

// Filters
const filters = ref({
  severity: 'all',
  serviceType: 'all',
  dateRange: null,
  search: ''
})

// Computed filtered outages
const filteredOutages = computed(() => {
  return props.outages
      .filter(outage => {
        // Only include resolved outages
        if (outage.status !== 'resolved' || !outage.resolvedAt) {
          return false
        }

        // Severity filter
        if (filters.value.severity !== 'all' && outage.severity !== filters.value.severity) {
          return false
        }

        // Service type filter
        if (filters.value.serviceType !== 'all' && outage.serviceType !== filters.value.serviceType) {
          return false
        }

        // Date range filter
        if (filters.value.dateRange && filters.value.dateRange.from && filters.value.dateRange.to) {
          const outageDate = new Date(outage.startedAt)
          const fromDate = new Date(filters.value.dateRange.from)
          const toDate = new Date(filters.value.dateRange.to)

          // Set time to end of day for the to date
          toDate.setHours(23, 59, 59, 999)

          if (!isWithinInterval(outageDate, { start: fromDate, end: toDate })) {
            return false
          }
        }

        // Search filter
        if (filters.value.search) {
          const searchTerm = filters.value.search.toLowerCase()
          const searchFields = [
            outage.title || '',
            outage.description || '',
            outage.rootCause || '',
            outage.resolution || '',
            ...(outage.affectedAreas || []),
            ...(outage.affectedServices || [])
          ].map(field => field.toLowerCase())

          return searchFields.some(field => field.includes(searchTerm))
        }

        return true
      })
      .sort((a, b) => {
        // Sort by date (newest first)
        return new Date(b.startedAt) - new Date(a.startedAt)
      })
})

// Helper functions
function formatDate(dateString) {
  if (!dateString) return ''
  return format(new Date(dateString), 'MMM dd, yyyy')
}

function formatTime(dateString) {
  if (!dateString) return ''
  return format(new Date(dateString), 'h:mm a')
}

function formatDuration(outage) {
  if (!outage.startedAt || !outage.resolvedAt) return 'Unknown'

  const start = new Date(outage.startedAt)
  const end = new Date(outage.resolvedAt)

  return formatDistance(start, end)
}

function formatSeverity(severity) {
  const severityMap = {
    'critical': 'Critical',
    'major': 'Major',
    'minor': 'Minor',
    'degraded': 'Degraded'
  }
  return severityMap[severity] || severity
}

function formatServiceType(type) {
  const typeMap = {
    'fiber': 'Fiber',
    'wireless': 'Wireless',
    'backbone': 'Backbone',
    'data_center': 'Data Center'
  }
  return typeMap[type] || type
}
</script>