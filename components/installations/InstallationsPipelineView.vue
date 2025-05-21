<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Installation Pipeline</h2>
        <p class="text-muted-foreground">Drag installations between stages to update status</p>
      </div>

      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="$emit('refresh')">
          <RefreshCwIcon class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" @click="toggleView">
          <ListIcon class="h-4 w-4 mr-2" />
          List View
        </Button>
      </div>
    </div>

    <!-- Pipeline Board -->
    <div v-if="!isLoading" class="grid grid-cols-5 gap-4 pb-6 overflow-x-auto h-[calc(100vh-220px)]">
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
            <InstallationCard
                v-for="installation in getInstallationsByStatus('pending')"
                :key="installation.id"
                :installation="installation"
                draggable="true"
                @dragstart="handleDragStart($event, installation)"
                @update-status="$emit('update-status', $event)"
                @view-installation="$emit('view-installation', $event)"
                @reschedule="$emit('reschedule', $event)"
                @assign-technician="$emit('assign-technician', $event)"
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
            <InstallationCard
                v-for="installation in getInstallationsByStatus('scheduled')"
                :key="installation.id"
                :installation="installation"
                draggable="true"
                @dragstart="handleDragStart($event, installation)"
                @update-status="$emit('update-status', $event)"
                @view-installation="$emit('view-installation', $event)"
                @reschedule="$emit('reschedule', $event)"
                @assign-technician="$emit('assign-technician', $event)"
            />
          </TransitionGroup>
        </div>
      </div>

      <!-- In Progress Column -->
      <div class="h-full flex flex-col">
        <div class="flex items-center justify-between mb-2 px-2">
          <div class="flex items-center">
            <Badge variant="primary" class="mr-2">{{ getColumnCount('in_progress') }}</Badge>
            <h3 class="font-medium">In Progress</h3>
          </div>
        </div>

        <div
            class="border rounded-md bg-muted/30 flex-1 p-2 overflow-y-auto"
            @dragover.prevent
            @drop="handleDrop($event, 'in_progress')"
        >
          <TransitionGroup name="card" tag="div" class="space-y-2">
            <InstallationCard
                v-for="installation in getInstallationsByStatus('in_progress')"
                :key="installation.id"
                :installation="installation"
                draggable="true"
                @dragstart="handleDragStart($event, installation)"
                @update-status="$emit('update-status', $event)"
                @view-installation="$emit('view-installation', $event)"
                @complete-installation="$emit('complete-installation', $event)"
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
            <InstallationCard
                v-for="installation in getInstallationsByStatus('completed')"
                :key="installation.id"
                :installation="installation"
                @view-installation="$emit('view-installation', $event)"
                @generate-report="$emit('generate-report', $event)"
            />
          </TransitionGroup>
        </div>
      </div>

      <!-- Cancelled/Delayed Column -->
      <div class="h-full flex flex-col">
        <div class="flex items-center justify-between mb-2 px-2">
          <div class="flex items-center">
            <Badge variant="destructive" class="mr-2">{{ getColumnCount('cancelled') + getColumnCount('delayed') }}</Badge>
            <h3 class="font-medium">Issues</h3>
          </div>
        </div>

        <div
            class="border rounded-md bg-muted/30 flex-1 p-2 overflow-y-auto"
            @dragover.prevent
            @drop="handleDrop($event, 'delayed')"
        >
          <TransitionGroup name="card" tag="div" class="space-y-2">
            <InstallationCard
                v-for="installation in [...getInstallationsByStatus('cancelled'), ...getInstallationsByStatus('delayed')]"
                :key="installation.id"
                :installation="installation"
                :draggable="installation.status === 'delayed'"
                @dragstart="handleDragStart($event, installation)"
                @update-status="$emit('update-status', $event)"
                @view-installation="$emit('view-installation', $event)"
                @reschedule="$emit('reschedule', $event)"
            />
          </TransitionGroup>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex justify-center items-center h-[calc(100vh-200px)]">
      <div class="flex flex-col items-center">
        <Loader2Icon class="h-10 w-10 text-primary animate-spin mb-4" />
        <p class="text-muted-foreground">Loading installation pipeline...</p>
      </div>
    </div>

    <!-- Status Update Dialog on Drop -->
    <Dialog v-model:open="statusUpdateDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Installation Status</DialogTitle>
          <DialogDescription>
            Are you sure you want to change the status of installation #{{ draggedInstallation?.installationNumber }} from {{ formatStatus(draggedInstallation?.status) }} to {{ formatStatus(targetStatus) }}?
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="statusNotes">Status Notes</Label>
              <Textarea
                  id="statusNotes"
                  v-model="statusNotes"
                  rows="3"
                  placeholder="Enter notes about this status change..."
                  @click.stop
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="cancelStatusUpdate">Cancel</Button>
          <Button @click="confirmStatusUpdate" :disabled="isUpdating">
            <Loader2Icon v-if="isUpdating" class="mr-2 h-4 w-4 animate-spin" />
            Confirm Status Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatDistance, parseISO, format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  RefreshCwIcon,
  ListIcon,
  Loader2Icon,
} from 'lucide-vue-next'
import InstallationCard from './InstallationCard.vue'

const props = defineProps({
  installations: {
    type: Array,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-installation',
  'update-status',
  'reschedule',
  'assign-technician',
  'complete-installation',
  'generate-report',
  'refresh',
  'toggle-view'
])

// Drag and drop state
const draggedInstallation = ref(null)
const targetStatus = ref(null)
const statusUpdateDialog = ref(false)
const statusNotes = ref('')
const isUpdating = ref(false)

// Helper functions
function getInstallationsByStatus(status) {
  return props.installations.filter(installation => installation.status === status)
}

function getColumnCount(status) {
  return getInstallationsByStatus(status).length
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'on_site': 'On Site',
    'delayed': 'Delayed',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }

  return statusMap[status] || status
}

function handleDragStart(event, installation) {
  draggedInstallation.value = installation
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', installation.id)

  // Add styling to the dragged element
  event.target.classList.add('opacity-50')
}

function isValidStatusTransition(fromStatus, toStatus) {
  // Define valid status transitions
  const validTransitions = {
    'pending': ['scheduled', 'cancelled', 'delayed'],
    'scheduled': ['in_progress', 'cancelled', 'delayed'],
    'in_progress': ['completed', 'delayed', 'cancelled'],
    'delayed': ['scheduled', 'in_progress', 'cancelled'],
    'completed': [], // Can't drag from completed
    'cancelled': [], // Can't drag from cancelled
  }

  return validTransitions[fromStatus]?.includes(toStatus) || false
}

function handleDrop(event, status) {
  event.preventDefault()

  // Clear any drag styling
  document.querySelectorAll('.opacity-50').forEach(el => {
    el.classList.remove('opacity-50')
  })

  if (!draggedInstallation.value) return

  const currentStatus = draggedInstallation.value.status

  // If same status, do nothing
  if (currentStatus === status) return

  // Check if the status transition is valid
  if (!isValidStatusTransition(currentStatus, status)) {
    return
  }

  // Set target status and open confirmation dialog
  targetStatus.value = status
  statusUpdateDialog.value = true
}

function cancelStatusUpdate() {
  statusUpdateDialog.value = false
  draggedInstallation.value = null
  targetStatus.value = null
  statusNotes.value = ''
}

async function confirmStatusUpdate() {
  if (!draggedInstallation.value || !targetStatus.value) {
    cancelStatusUpdate()
    return
  }

  try {
    isUpdating.value = true

    // Create status update data
    const statusUpdateData = {
      installation: draggedInstallation.value,
      previousStatus: draggedInstallation.value.status,
      newStatus: targetStatus.value,
      notes: statusNotes.value || null,
      updatedAt: new Date().toISOString()
    }

    // Emit the update event
    emit('update-status', statusUpdateData)

    // Wait a bit to show the loading state
    await new Promise(resolve => setTimeout(resolve, 500))

    // Reset state
    statusUpdateDialog.value = false
    draggedInstallation.value = null
    targetStatus.value = null
    statusNotes.value = ''
  } catch (error) {
    console.error('Error updating status:', error)
  } finally {
    isUpdating.value = false
  }
}

function toggleView() {
  emit('toggle-view')
}
</script>

<style scoped>
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