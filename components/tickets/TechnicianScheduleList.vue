<template>
  <div class="divide-y">
    <div v-for="appointment in sortedAppointments" :key="appointment.id"
         class="p-4 hover:bg-muted/50 transition-colors">
      <div class="flex justify-between items-start">
        <div>
          <div class="font-medium">{{ appointment.customerName }}</div>
          <div class="text-sm text-muted-foreground">
            {{ formatTime(appointment.scheduledTime) }}
          </div>
        </div>
        <Badge :class="{
          'bg-blue-100 text-blue-800': appointment.status === 'scheduled',
          'bg-amber-100 text-amber-800': appointment.status === 'in_progress',
          'bg-green-100 text-green-800': appointment.status === 'completed',
          'bg-red-100 text-red-800': appointment.status === 'cancelled',
        }">
          {{ formatStatus(appointment.status) }}
        </Badge>
      </div>

      <div class="text-sm mt-2">
        <div class="flex items-center">
          <MapPinIcon class="h-4 w-4 mr-1 text-muted-foreground" />
          {{ appointment.address }}
        </div>
        <div class="flex items-center mt-1">
          <UserIcon class="h-4 w-4 mr-1 text-muted-foreground" />
          {{ appointment.technician }}
        </div>
      </div>

      <div class="mt-3 flex items-center space-x-2">
        <Button size="sm" @click="$emit('view-ticket', { id: appointment.ticketId })">
          View Ticket
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Update Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
                v-if="appointment.status === 'scheduled'"
                @click="updateStatus(appointment.id, 'in_progress')">
              Mark as In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
                v-if="appointment.status === 'in_progress'"
                @click="showCompletionDialog(appointment.id)">
              Mark as Completed
            </DropdownMenuItem>
            <DropdownMenuItem
                v-if="appointment.status === 'scheduled'"
                @click="showCancellationDialog(appointment.id)">
              Cancel Appointment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div v-if="appointments.length === 0" class="p-6 text-center text-muted-foreground">
      No appointments scheduled for today
    </div>

    <!-- Dialog for completion notes -->
    <Dialog v-model:open="completionDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Appointment</DialogTitle>
          <DialogDescription>
            Add notes about the completed work
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Resolution Notes</Label>
            <Textarea v-model="completionNotes" placeholder="Describe the work completed..." />
          </div>
          <div class="space-y-2">
            <Label>Customer Signature</Label>
            <div class="border rounded-md h-32 bg-muted/20 flex items-center justify-center">
              Signature Capture Area
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="completionDialogOpen = false">Cancel</Button>
          <Button @click="confirmCompletion">Confirm Completion</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Dialog for cancellation reason -->
    <Dialog v-model:open="cancellationDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Please provide a reason for cancellation
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Cancellation Reason</Label>
            <Select v-model="cancellationReason">
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer_request">Customer Requested</SelectItem>
                <SelectItem value="technician_unavailable">Technician Unavailable</SelectItem>
                <SelectItem value="weather">Weather Conditions</SelectItem>
                <SelectItem value="equipment_unavailable">Equipment Unavailable</SelectItem>
                <SelectItem value="access_issue">Access Issue</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea v-model="cancellationNotes" placeholder="Provide additional details..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="cancellationDialogOpen = false">Cancel</Button>
          <Button variant="destructive" @click="confirmCancellation">Confirm Cancellation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MapPinIcon, UserIcon } from 'lucide-vue-next'

const props = defineProps({
  appointments: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['view-ticket', 'update-status'])

// Sort appointments by scheduled time
const sortedAppointments = computed(() => {
  return [...props.appointments].sort((a, b) => {
    return new Date(a.scheduledTime) - new Date(b.scheduledTime)
  })
})

// Dialog state
const completionDialogOpen = ref(false)
const cancellationDialogOpen = ref(false)
const completionNotes = ref('')
const cancellationReason = ref('')
const cancellationNotes = ref('')
const currentAppointmentId = ref(null)

function formatTime(dateString) {
  return format(new Date(dateString), 'h:mm a')
}

function formatStatus(status) {
  const statusMap = {
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'rescheduled': 'Rescheduled'
  }
  return statusMap[status] || status
}

function updateStatus(appointmentId, newStatus) {
  emit('update-status', appointmentId, newStatus)
}

function showCompletionDialog(appointmentId) {
  currentAppointmentId.value = appointmentId
  completionNotes.value = ''
  completionDialogOpen.value = true
}

function showCancellationDialog(appointmentId) {
  currentAppointmentId.value = appointmentId
  cancellationReason.value = ''
  cancellationNotes.value = ''
  cancellationDialogOpen.value = true
}

function confirmCompletion() {
  emit('update-status', currentAppointmentId.value, 'completed', completionNotes.value)
  completionDialogOpen.value = false
}

function confirmCancellation() {
  const notes = `Reason: ${cancellationReason.value}. ${cancellationNotes.value}`
  emit('update-status', currentAppointmentId.value, 'cancelled', notes)
  cancellationDialogOpen.value = false
}
</script>