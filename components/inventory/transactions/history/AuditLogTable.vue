<template>
  <div class="space-y-4">
    <div v-if="auditLogs.length === 0" class="text-center text-muted-foreground py-8">
      <div class="flex flex-col items-center">
        <HistoryIcon class="h-10 w-10 text-muted-foreground" />
        <div class="mt-2">No audit logs found</div>
        <div class="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters or selecting a different transaction.
        </div>
      </div>
    </div>
    <div v-else class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Severity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="log in auditLogs" :key="log.id">
            <TableCell class="whitespace-nowrap">{{ formatDate(log.timestamp) }}</TableCell>
            <TableCell class="whitespace-nowrap">{{ log.userDisplayName || log.userId }}</TableCell>
            <TableCell class="whitespace-nowrap capitalize">{{ log.action.replace(/_/g, ' ') }}</TableCell>
            <TableCell>{{ log.details }}</TableCell>
            <TableCell>
              <Badge
                :variant="log.severity === 'critical' ? 'destructive' : log.severity === 'warning' ? 'warning' : 'secondary'"
              >
                {{ log.severity }}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    
    <!-- Pagination -->
    <div v-if="auditLogs.length > 0" class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Showing {{ pageStart }} to {{ pageEnd }} of {{ totalLogs }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage <= 1"
          @click="$emit('prev-page')"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="!hasMoreLogs"
          @click="$emit('next-page')"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { HistoryIcon } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const props = defineProps({
  auditLogs: { type: Array, required: true },
  totalLogs: { type: Number, default: 0 },
  currentPage: { type: Number, default: 1 },
  hasMoreLogs: { type: Boolean, default: false }
})

const emit = defineEmits(['view-transaction', 'prev-page', 'next-page'])

function formatDate(date) {
  if (!date) return '—'
  return format(new Date(date), 'yyyy-MM-dd HH:mm')
}

const pageSize = 20
const pageStart = computed(() => (props.currentPage - 1) * pageSize + 1)
const pageEnd = computed(() => Math.min(props.currentPage * pageSize, props.totalLogs))
</script>