<template>
  <div
      class="border rounded-md shadow-sm bg-background p-3 hover:shadow-md transition-shadow cursor-pointer"
      @click="$emit('view-activation', activation)"
      :class="{
      'border-primary': dragging
    }"
      :draggable="draggable"
      @dragstart="handleDragStart"
      @dragend="dragging = false"
  >
    <!-- Card Header -->
    <div class="flex justify-between items-start mb-2">
      <div>
        <h4 class="font-medium text-sm">{{ activation?.activationNumber }}</h4>
        <p class="text-xs text-muted-foreground">
          {{ activation?.createdAt ? formatDate(activation.createdAt) : 'No date' }}
        </p>
      </div>
      <Badge :variant="getStatusVariant(activation?.status)">
        {{ formatStatus(activation?.status) }}
      </Badge>
    </div>

    <!-- Customer Info -->
    <div class="mb-2">
      <p class="text-sm font-medium">
        {{ activation?.customer?.name || 'No customer name' }}
      </p>
      <p class="text-xs text-muted-foreground truncate" :title="activation?.location?.address">
        {{ activation?.location?.address || 'No address' }}
      </p>
    </div>

    <!-- Service Info -->
    <div class="mb-2">
      <p class="text-xs"><span class="text-muted-foreground">Service:</span>
        {{ activation?.service?.name || 'Not specified' }}
      </p>
      <p class="text-xs"><span class="text-muted-foreground">Type:</span>
        {{ formatServiceType(activation?.service?.type) || 'Not specified' }}
      </p>
    </div>

    <!-- Schedule Info (if scheduled) -->
    <div v-if="activation?.scheduledDate" class="text-xs mt-2 pt-2 border-t">
      <CalendarIcon class="h-3 w-3 inline-block mr-1" />
      <span>{{ formatDate(activation.scheduledDate) }}</span>
      <span v-if="activation?.timeSlot">
        ({{ formatTimeSlot(activation.timeSlot) }})
      </span>
    </div>

    <!-- Test Result (if tested) -->
    <div v-if="activation?.lastTestDate" class="text-xs mt-2 pt-2 border-t flex items-center">
      <Badge size="sm" :variant="activation.lastTestResult === 'pass' ? 'success' : 'destructive'" class="mr-1">
        {{ activation.lastTestResult === 'pass' ? 'Passed' : 'Failed' }}
      </Badge>
      <span>{{ formatDate(activation.lastTestDate) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon } from 'lucide-vue-next'

const props = defineProps({
  activation: {
    type: Object,
    required: true
  },
  draggable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['view-activation', 'dragstart'])

const dragging = ref(false)

// Helper functions
function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

function formatTimeSlot(timeSlot) {
  const timeSlotMap = {
    'morning': 'Morning (8AM-12PM)',
    'afternoon': 'Afternoon (1PM-5PM)'
  }

  return timeSlotMap[timeSlot] || timeSlot
}

function formatStatus(status) {
  if (!status) return 'Unknown'

  const statusMap = {
    'pending': 'Pending',
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'verification_pending': 'Verification Pending',
    'verification_failed': 'Verification Failed',
    'verification_passed': 'Verification Passed',
    'awaiting_customer': 'Awaiting Customer',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }

  return statusMap[status] || status
}

function formatServiceType(type) {
  if (!type) return 'Unknown'

  const typeMap = {
    'fiber': 'Fiber Internet',
    'cable': 'Cable Internet',
    'dsl': 'DSL Internet'
  }

  return typeMap[type] || type
}

function getStatusVariant(status) {
  if (!status) return 'default'

  const variantMap = {
    'pending': 'secondary',
    'scheduled': 'warning',
    'in_progress': 'primary',
    'verification_pending': 'secondary',
    'verification_failed': 'destructive',
    'verification_passed': 'success',
    'awaiting_customer': 'warning',
    'completed': 'success',
    'cancelled': 'destructive'
  }

  return variantMap[status] || 'default'
}

function handleDragStart(event) {
  dragging.value = true
  emit('dragstart', event, props.activation)
}
</script>