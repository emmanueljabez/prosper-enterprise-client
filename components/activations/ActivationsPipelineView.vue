<template>
  <!-- Pipeline Board -->
  <div v-if="!isLoading" class="grid grid-cols-5 gap-4 pb-6 overflow-x-auto h-[calc(100vh-280px)]">
    <!-- Pending Column -->
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between mb-2 px-2">
        <div class="flex items-center">
          <Badge variant="secondary" class="mr-2">{{ getColumnCount('pending') }}</Badge>
          <h3 class="font-medium">Pending</h3>
        </div>
      </div>

      <div
          class="border rounded-md bg-muted/30 flex-1 p-2 overflow-y-auto"
          @dragover.prevent
          @drop="handleDrop($event, 'pending')"
      >
        <TransitionGroup name="card" tag="div" class="space-y-2">
          <ActivationCard
              v-for="activation in getActivationsByStatus('pending')"
              :key="activation.id"
              :activation="activation"
              draggable="true"
              @dragstart="handleDragStart($event, activation)"
              @update-status="$emit('update-status', $event)"
              @view-activation="$emit('view-activation', $event)"
              @schedule-activation="$emit('schedule-activation', $event)"
          />
        </TransitionGroup>
      </div>
    </div>

    <!-- Scheduled Column -->
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between mb-2 px-2">
        <div class="flex items-center">
          <Badge variant="warning" class="mr-2">{{ getColumnCount('scheduled') }}</Badge>
          <h3 class="font-medium">Scheduled</h3>
        </div>
      </div>

      <div
          class="border rounded-md bg-muted/30 flex-1 p-2 overflow-y-auto"
          @dragover.prevent
          @drop="handleDrop($event, 'scheduled')"
      >
        <TransitionGroup name="card" tag="div" class="space-y-2">
          <ActivationCard
              v-for="activation in getActivationsByStatus('scheduled')"
              :key="activation.id"
              :activation="activation"
              draggable="true"
              @dragstart="handleDragStart($event, activation)"
              @update-status="$emit('update-status', $event)"
              @view-activation="$emit('view-activation', $event)"
              @perform-test="$emit('perform-test', $event)"
          />
        </TransitionGroup>
      </div>
    </div>

    <!-- Testing Column (combines in_progress, pending_test, test_failed) -->
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between mb-2 px-2">
        <div class="flex items-center">
          <Badge variant="primary" class="mr-2">{{ getColumnCount(['in_progress', 'pending_test', 'test_failed']) }}</Badge>
          <h3 class="font-medium">Testing</h3>
        </div>
      </div>

      <div
          class="border rounded-md bg-muted/30 flex-1 p-2 overflow-y-auto"
          @dragover.prevent
          @drop="handleDrop($event, 'testing')"
      >
        <TransitionGroup name="card" tag="div" class="space-y-2">
          <ActivationCard
              v-for="activation in getActivationsByStatus(['in_progress', 'pending_test', 'test_failed'])"
              :key="activation.id"
              :activation="activation"
              draggable="true"
              @dragstart="handleDragStart($event, activation)"
              @update-status="$emit('update-status', $event)"
              @view-activation="$emit('view-activation', $event)"
              @perform-test="$emit('perform-test', $event)"
          />
        </TransitionGroup>
      </div>
    </div>

    <!-- Approval Column (combines test_passed, awaiting_customer) -->
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between mb-2 px-2">
        <div class="flex items-center">
          <Badge variant="success" class="mr-2">{{ getColumnCount(['test_passed', 'awaiting_customer']) }}</Badge>
          <h3 class="font-medium">Ready for Completion</h3>
        </div>
      </div>

      <div
          class="border rounded-md bg-muted/30 flex-1 p-2 overflow-y-auto"
          @dragover.prevent
          @drop="handleDrop($event, 'approval')"
      >
        <TransitionGroup name="card" tag="div" class="space-y-2">
          <ActivationCard
              v-for="activation in getActivationsByStatus(['test_passed', 'awaiting_customer'])"
              :key="activation.id"
              :activation="activation"
              draggable="true"
              @dragstart="handleDragStart($event, activation)"
              @update-status="$emit('update-status', $event)"
              @view-activation="$emit('view-activation', $event)"
              @complete-activation="$emit('complete-activation', $event)"
          />
        </TransitionGroup>
      </div>
    </div>

    <!-- Completed Column -->
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between mb-2 px-2">
        <div class="flex items-center">
          <Badge variant="success" class="mr-2">{{ getColumnCount('completed') }}</Badge>
          <h3 class="font-medium">Completed</h3>
        </div>
      </div>

      <div
          class="border rounded-md bg-muted/30 flex-1 p-2 overflow-y-auto"
          @dragover.prevent
          @drop="handleDrop($event, 'completed')"
      >
        <TransitionGroup name="card" tag="div" class="space-y-2">
          <ActivationCard
              v-for="activation in getActivationsByStatus('completed')"
              :key="activation.id"
              :activation="activation"
              draggable="true"
              @dragstart="handleDragStart($event, activation)"
              @view-activation="$emit('view-activation', $event)"
              @generate-certificate="$emit('generate-certificate', $event)"
          />
        </TransitionGroup>
      </div>
    </div>

    <!-- Status Update Confirmation Dialog -->
    <Dialog :open="showStatusDialog" @update:open="showStatusDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Activation Status</DialogTitle>
          <DialogDescription>
            Change status from <strong>{{ formatStatus(draggedActivation?.status) }}</strong> to <strong>{{ formatStatus(targetStatus) }}</strong>
          </DialogDescription>
        </DialogHeader>

        <div class="py-4">
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="statusNotes">Notes (Optional)</Label>
              <Textarea
                  id="statusNotes"
                  v-model="statusUpdateNotes"
                  rows="3"
                  placeholder="Enter any notes about this status change"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="cancelStatusUpdate">Cancel</Button>
          <Button @click="confirmStatusUpdate" :disabled="isUpdating">
            <Loader2Icon v-if="isUpdating" class="mr-2 h-4 w-4 animate-spin" />
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>

  <!-- Loading State -->
  <div v-else class="flex items-center justify-center h-[calc(100vh-280px)]">
    <div class="text-center">
      <Loader2Icon class="h-8 w-8 animate-spin mx-auto text-primary" />
      <p class="mt-2">Loading activation pipeline...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format, parseISO } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2Icon } from 'lucide-vue-next'
import ActivationCard from './ActivationCard.vue'

const props = defineProps({
  activations: {
    type: Array,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-activation',
  'schedule-activation',
  'perform-test',
  'update-status',
  'complete-activation',
  'generate-certificate'
])

// Status update dialog state
const showStatusDialog = ref(false)
const draggedActivation = ref(null)
const targetStatus = ref('')
const statusUpdateNotes = ref('')
const isUpdating = ref(false)

// Status mapping for pipeline columns
const columnStatusMap = {
  'pending': ['pending'],
  'scheduled': ['scheduled'],
  'testing': ['in_progress', 'pending_test', 'test_failed'],
  'approval': ['test_passed', 'awaiting_customer'],
  'completed': ['completed']
}

// Allowed status transitions
const allowedStatusTransitions = {
  'pending': ['scheduled'],
  'scheduled': ['in_progress', 'pending_test'],
  'in_progress': ['pending_test', 'test_failed', 'test_passed'],
  'pending_test': ['test_failed', 'test_passed'],
  'test_failed': ['pending_test', 'test_passed'],
  'test_passed': ['awaiting_customer', 'completed'],
  'awaiting_customer': ['completed']
}

// Methods
function getActivationsByStatus(status) {
  if (Array.isArray(status)) {
    return props.activations.filter(activation => status.includes(activation.status))
  }
  return props.activations.filter(activation => activation.status === status)
}

function getColumnCount(status) {
  if (Array.isArray(status)) {
    return props.activations.filter(activation => status.includes(activation.status)).length
  }
  return props.activations.filter(activation => activation.status === status).length
}

function handleDragStart(event, activation) {
  draggedActivation.value = activation
  event.dataTransfer.setData('text/plain', activation.id)

  // Set drag image (optional)
  const dragImage = document.createElement('div')
  dragImage.textContent = activation.activationNumber
  dragImage.className = 'bg-background border rounded p-2 shadow-md'
  dragImage.style.position = 'absolute'
  dragImage.style.top = '-1000px'
  document.body.appendChild(dragImage)
  event.dataTransfer.setDragImage(dragImage, 0, 0)

  // Remove the element after drag starts
  setTimeout(() => {
    document.body.removeChild(dragImage)
  }, 0)
}

function handleDrop(event, columnName) {
  event.preventDefault()

  if (!draggedActivation.value) return

  // Determine the target status based on the column and current status
  let newStatus

  if (columnName === 'testing') {
    // If current status is already in the testing column, keep it
    if (columnStatusMap.testing.includes(draggedActivation.value.status)) {
      newStatus = draggedActivation.value.status
    } else {
      // Otherwise set to first status in testing column
      newStatus = 'in_progress'
    }
  } else if (columnName === 'approval') {
    // If current status is already in the approval column, keep it
    if (columnStatusMap.approval.includes(draggedActivation.value.status)) {
      newStatus = draggedActivation.value.status
    } else {
      // Otherwise set to first status in approval column
      newStatus = 'test_passed'
    }
  } else {
    // For other columns, there's only one status per column
    newStatus = columnStatusMap[columnName][0]
  }

  // Check if the status transition is allowed
  if (isValidStatusTransition(draggedActivation.value.status, newStatus)) {
    targetStatus.value = newStatus
    showStatusDialog.value = true
  } else {
    // Reset drag operation if transition is not allowed
    draggedActivation.value = null
  }
}

function isValidStatusTransition(currentStatus, newStatus) {
  // If status isn't changing, it's valid
  if (currentStatus === newStatus) return true

  // Check allowed transitions
  return allowedStatusTransitions[currentStatus]?.includes(newStatus) || false
}

function cancelStatusUpdate() {
  showStatusDialog.value = false
  draggedActivation.value = null
  targetStatus.value = ''
  statusUpdateNotes.value = ''
}

async function confirmStatusUpdate() {
  if (!draggedActivation.value || !targetStatus.value) return

  try {
    isUpdating.value = true

    // Create update data
    const updateData = {
      activation: draggedActivation.value,
      newStatus: targetStatus.value,
      notes: statusUpdateNotes.value || null,
      updatedAt: new Date().toISOString()
    }

    // Emit the update event
    emit('update-status', updateData)

    // Close dialog and reset state
    showStatusDialog.value = false
    draggedActivation.value = null
    targetStatus.value = ''
    statusUpdateNotes.value = ''
  } catch (error) {
    console.error('Error updating status:', error)
  } finally {
    isUpdating.value = false
  }
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'pending_test': 'Pending Test',
    'test_failed': 'Test Failed',
    'test_passed': 'Test Passed',
    'awaiting_customer': 'Awaiting Customer',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }

  return statusMap[status] || status
}
</script>

<style scoped>
/* Card animation */
.card-enter-active,
.card-leave-active {
  transition: all 0.3s ease;
}

.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>