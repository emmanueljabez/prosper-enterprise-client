<template>
  <DialogContent class="sm:max-w-[800px]">
    <DialogHeader>
      <DialogTitle>{{ cycleCount.name }}</DialogTitle>
      <DialogDescription v-if="cycleCount.description">
        {{ cycleCount.description }}
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6 py-2">
      <!-- Status Badge -->
      <div class="flex items-center justify-between">
        <Badge :variant="getStatusVariant(cycleCount.status)">
          {{ formatStatus(cycleCount.status) }}
        </Badge>
        <Badge v-if="cycleCount.isRecurring" variant="outline">
          {{ formatRecurrence(cycleCount.recurrencePattern) }}
        </Badge>
      </div>
      
      <!-- Details Card -->
      <div class="rounded-md border p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-muted-foreground">Location</div>
            <div>{{ getLocationName(cycleCount.locationId) }}</div>
          </div>
          
          <div>
            <div class="text-sm text-muted-foreground">Scheduled Date</div>
            <div>{{ formatDate(cycleCount.startDate) }}</div>
          </div>
          
          <div v-if="cycleCount.startedAt">
            <div class="text-sm text-muted-foreground">Started At</div>
            <div>{{ formatDateTime(cycleCount.startedAt) }}</div>
          </div>
          
          <div v-if="cycleCount.completedAt">
            <div class="text-sm text-muted-foreground">Completed At</div>
            <div>{{ formatDateTime(cycleCount.completedAt) }}</div>
          </div>
          
          <div>
            <div class="text-sm text-muted-foreground">Created By</div>
            <div>{{ cycleCount.createdByName || cycleCount.createdBy }}</div>
          </div>
          
          <div v-if="cycleCount.isRecurring">
            <div class="text-sm text-muted-foreground">Recurrence</div>
            <div>
              {{ formatRecurrenceDetails(cycleCount) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Count Items -->
      <div v-if="cycleCount.items && cycleCount.items.length > 0">
        <h3 class="text-sm font-medium mb-2">Count Items</h3>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Counted</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in cycleCount.items" :key="item.itemId">
                <TableCell>
                  <div class="font-medium">{{ item.name }}</div>
                  <div class="text-xs text-muted-foreground">{{ item.sku }}</div>
                </TableCell>
                <TableCell>{{ item.expectedQuantity }}</TableCell>
                <TableCell>{{ item.countedQuantity !== null ? item.countedQuantity : '—' }}</TableCell>
                <TableCell>
                  <span 
                    :class="{
                      'text-destructive': item.variance < 0,
                      'text-success': item.variance > 0,
                    }"
                  >
                    {{ item.variance !== undefined ? (item.variance > 0 ? '+' + item.variance : item.variance) : '—' }}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    v-if="item.hasVariance" 
                    :variant="item.varianceResolution ? 'outline' : 'warning'"
                  >
                    {{ item.varianceResolution ? formatResolution(item.varianceResolution) : 'Unresolved' }}
                  </Badge>
                  <Badge v-else-if="item.countedQuantity !== null" variant="success">
                    Matched
                  </Badge>
                  <Badge v-else variant="outline">
                    Not Counted
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
      
      <!-- Variance Summary -->
      <div v-if="hasVariances">
        <h3 class="text-sm font-medium mb-2">Variance Summary</h3>
        <div class="rounded-md border p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="text-sm text-muted-foreground">Total Items</div>
            <div>{{ cycleCount.items?.length || 0 }}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Items with Variance</div>
            <div>{{ varianceItemsCount }}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Total Net Variance</div>
            <div>{{ totalVariance }}</div>
          </div>
        </div>
      </div>
      
      <!-- Approval Information -->
      <div v-if="cycleCount.approvedBy">
        <h3 class="text-sm font-medium mb-2">Approval Information</h3>
        <div class="rounded-md border p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-muted-foreground">Approved By</div>
              <div>{{ cycleCount.approvedBy }}</div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Approved At</div>
              <div>{{ formatDateTime(cycleCount.approvedAt) }}</div>
            </div>
            <div v-if="cycleCount.approvalNotes" class="md:col-span-2">
              <div class="text-sm text-muted-foreground">Notes</div>
              <div>{{ cycleCount.approvalNotes }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Cancellation Information -->
      <div v-if="cycleCount.cancelledBy">
        <h3 class="text-sm font-medium mb-2">Cancellation Information</h3>
        <div class="rounded-md border p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-muted-foreground">Cancelled By</div>
            <div>{{ cycleCount.cancelledBy }}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Cancelled At</div>
            <div>{{ formatDateTime(cycleCount.cancelledAt) }}</div>
          </div>
          <div v-if="cycleCount.cancellationReason" class="md:col-span-2">
            <div class="text-sm text-muted-foreground">Reason</div>
            <div>{{ cycleCount.cancellationReason }}</div>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <div class="flex space-x-2">
          <Button variant="outline" @click="$emit('close')">
            Close
          </Button>
          
          <!-- Conditional buttons based on status -->
          <Button 
            v-if="cycleCount.status === 'scheduled'"
            @click="$emit('start-count', cycleCount)"
          >
            Start Count
          </Button>
          
          <Button 
            v-if="cycleCount.status === 'in_progress'"
            @click="$emit('continue-count', cycleCount)"
          >
            Continue Count
          </Button>
          
          <Button 
            v-if="cycleCount.status === 'pending_approval'"
            @click="$emit('review-variances', cycleCount)"
          >
            Review Variances
          </Button>
          
          <Button 
            v-if="cycleCount.status === 'pending_approval'"
            @click="$emit('approve-count', cycleCount)"
          >
            Approve
          </Button>
        </div>
      </DialogFooter>
    </div>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
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
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

const props = defineProps({
  cycleCount: { type: Object, required: true },
  locations: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'start-count', 'continue-count', 'review-variances', 'approve-count'])

// Computed properties for variance data
const hasVariances = computed(() => {
  return props.cycleCount.items?.some(item => item.hasVariance) || false
})

const varianceItemsCount = computed(() => {
  return props.cycleCount.items?.filter(item => item.hasVariance)?.length || 0
})

const totalVariance = computed(() => {
  if (!props.cycleCount.items) return 0
  return props.cycleCount.items.reduce((total, item) => {
    return total + (item.variance || 0)
  }, 0)
})

// Helper functions
function getLocationName(locationId) {
  const location = props.locations.find(loc => loc.id === locationId)
  return location ? location.name : locationId
}

function formatDate(dateString) {
  if (!dateString) return '—'
  return format(new Date(dateString), 'MMM d, yyyy')
}

function formatDateTime(dateString) {
  if (!dateString) return '—'
  return format(new Date(dateString), 'MMM d, yyyy h:mm a')
}

function formatStatus(status) {
  if (!status) return '—'
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStatusVariant(status) {
  switch (status) {
    case 'scheduled': return 'outline'
    case 'in_progress': return 'secondary'
    case 'pending_approval': return 'warning'
    case 'completed': return 'success'
    case 'cancelled': return 'destructive'
    default: return 'outline'
  }
}

function formatRecurrence(pattern) {
  switch (pattern) {
    case 'daily': return 'Daily'
    case 'weekly': return 'Weekly'
    case 'biweekly': return 'Bi-weekly'
    case 'monthly': return 'Monthly'
    case 'quarterly': return 'Quarterly'
    case 'yearly': return 'Yearly'
    default: return pattern || 'Custom'
  }
}

function formatRecurrenceDetails(count) {
  if (!count.isRecurring) return 'One-time'
  
  let details = formatRecurrence(count.recurrencePattern)
  
  if (count.recurrenceFrequency > 1) {
    details = `Every ${count.recurrenceFrequency} ${count.recurrencePattern}`
  }
  
  if (count.recurrenceDayOfWeek !== undefined) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    details += ` on ${days[count.recurrenceDayOfWeek]}`
  }
  
  if (count.recurrenceDayOfMonth !== undefined) {
    details += ` on day ${count.recurrenceDayOfMonth}`
  }
  
  return details
}

function formatResolution(resolution) {
  switch (resolution) {
    case 'accept': return 'Accepted'
    case 'adjust': return 'Adjusted'
    case 'investigate': return 'Investigating'
    case 'recount': return 'Recounted'
    default: return resolution
  }
}
</script>