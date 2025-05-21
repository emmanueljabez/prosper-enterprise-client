<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Update Installation Status</DialogTitle>
        <DialogDescription>
          Update the status for installation #{{ installation?.installationNumber }}.
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <Form @submit="updateStatus" class="space-y-6">
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="currentStatus">Current Status</Label>
              <Badge :variant="getStatusVariant(installation?.status)">
                {{ formatStatus(installation?.status) }}
              </Badge>
            </div>

            <div class="space-y-2">
              <Label for="newStatus">New Status *</Label>
              <Select v-model="newStatus">
                <SelectTrigger id="newStatus" :class="{ 'border-red-500': errors.newStatus }">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent @click.stop>
                  <SelectItem value="pending" :disabled="!isStatusAllowed('pending')">Pending</SelectItem>
                  <SelectItem value="scheduled" :disabled="!isStatusAllowed('scheduled')">Scheduled</SelectItem>
                  <SelectItem value="in_progress" :disabled="!isStatusAllowed('in_progress')">In Progress</SelectItem>
                  <SelectItem value="on_site" :disabled="!isStatusAllowed('on_site')">On Site</SelectItem>
                  <SelectItem value="delayed" :disabled="!isStatusAllowed('delayed')">Delayed</SelectItem>
                  <SelectItem value="completed" :disabled="!isStatusAllowed('completed')">Completed</SelectItem>
                  <SelectItem value="cancelled" :disabled="!isStatusAllowed('cancelled')">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.newStatus" class="text-sm text-red-500">{{ errors.newStatus }}</p>
            </div>

            <div v-if="newStatus === 'delayed'" class="space-y-2">
              <Label for="delayReason">Reason for Delay *</Label>
              <Select v-model="delayReason">
                <SelectTrigger id="delayReason" :class="{ 'border-red-500': errors.delayReason }">
                  <SelectValue placeholder="Select reason for delay" />
                </SelectTrigger>
                <SelectContent @click.stop>
                  <SelectItem value="weather">Weather Conditions</SelectItem>
                  <SelectItem value="materials">Materials Shortage</SelectItem>
                  <SelectItem value="technician_unavailable">Technician Unavailable</SelectItem>
                  <SelectItem value="customer_request">Customer Request</SelectItem>
                  <SelectItem value="access_issues">Site Access Issues</SelectItem>
                  <SelectItem value="other">Other Reason</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.delayReason" class="text-sm text-red-500">{{ errors.delayReason }}</p>
            </div>

            <div v-if="newStatus === 'delayed' && delayReason === 'other'" class="space-y-2">
              <Label for="otherDelayReason">Specify Reason *</Label>
              <Input
                  id="otherDelayReason"
                  v-model="otherDelayReason"
                  :class="{ 'border-red-500': errors.otherDelayReason }"
                  @click.stop
              />
              <p v-if="errors.otherDelayReason" class="text-sm text-red-500">{{ errors.otherDelayReason }}</p>
            </div>

            <div v-if="newStatus === 'on_site'" class="space-y-2">
              <Label for="arrivalTime">Arrival Time *</Label>
              <Input
                  id="arrivalTime"
                  v-model="arrivalTime"
                  type="time"
                  :class="{ 'border-red-500': errors.arrivalTime }"
                  @click.stop
              />
              <p v-if="errors.arrivalTime" class="text-sm text-red-500">{{ errors.arrivalTime }}</p>
            </div>

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

            <div v-if="newStatus === 'in_progress' || newStatus === 'on_site'" class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="notifyCustomer" v-model="notifyCustomer" />
                <Label for="notifyCustomer" class="text-sm">
                  Notify customer about this status update
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="updateOpen(false)">Cancel</Button>
            <Button type="submit" :disabled="isSubmitting">
              <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              Update Status
            </Button>
          </DialogFooter>
        </Form>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Form } from 'vee-validate'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  installation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'status-updated'])

// Form data
const newStatus = ref('')
const delayReason = ref('')
const otherDelayReason = ref('')
const arrivalTime = ref('')
const statusNotes = ref('')
const notifyCustomer = ref(true)
const errors = ref({})
const isSubmitting = ref(false)

// Status workflow logic - determine which statuses are allowed based on current status
function isStatusAllowed(status) {
  if (!props.installation) return false

  const currentStatus = props.installation.status

  // Define valid status transitions
  const allowedTransitions = {
    'pending': ['scheduled', 'cancelled'],
    'scheduled': ['in_progress', 'on_site', 'delayed', 'cancelled'],
    'in_progress': ['on_site', 'delayed', 'completed', 'cancelled'],
    'on_site': ['in_progress', 'delayed', 'completed', 'cancelled'],
    'delayed': ['scheduled', 'in_progress', 'cancelled'],
    'completed': [], // No transitions from completed
    'cancelled': [] // No transitions from cancelled
  }

  // Check if the status is in the allowed transitions
  return allowedTransitions[currentStatus]?.includes(status) || false
}

// Allowed status options based on current status
const allowedStatuses = computed(() => {
  if (!props.installation) return []

  const currentStatus = props.installation.status

  // Define valid status transitions
  const allowedTransitions = {
    'pending': ['scheduled', 'cancelled'],
    'scheduled': ['in_progress', 'on_site', 'delayed', 'cancelled'],
    'in_progress': ['on_site', 'delayed', 'completed', 'cancelled'],
    'on_site': ['in_progress', 'delayed', 'completed', 'cancelled'],
    'delayed': ['scheduled', 'in_progress', 'cancelled'],
    'completed': [], // No transitions from completed
    'cancelled': [] // No transitions from cancelled
  }

  return allowedTransitions[currentStatus] || []
})

function updateOpen(value) {
  if (value && props.installation) {
    // Initialize form with current values when opening
    initializeForm()
  } else {
    // Reset form when closing
    resetForm()
  }
  emit('update:open', value)
}

function initializeForm() {
  newStatus.value = ''
  delayReason.value = ''
  otherDelayReason.value = ''
  arrivalTime.value = new Date().toTimeString().slice(0, 5) // Current time
  statusNotes.value = ''
  notifyCustomer.value = true
}

function resetForm() {
  newStatus.value = ''
  delayReason.value = ''
  otherDelayReason.value = ''
  arrivalTime.value = ''
  statusNotes.value = ''
  notifyCustomer.value = true
  errors.value = {}
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

function getStatusVariant(status) {
  const variantMap = {
    'pending': 'secondary',
    'scheduled': 'warning',
    'in_progress': 'primary',
    'on_site': 'primary',
    'delayed': 'destructive',
    'completed': 'success',
    'cancelled': 'destructive'
  }

  return variantMap[status] || 'default'
}

function validate() {
  let isValid = true
  errors.value = {}

  if (!newStatus.value) {
    errors.value.newStatus = 'New status is required'
    isValid = false
  }

  if (!isStatusAllowed(newStatus.value)) {
    errors.value.newStatus = `Cannot change from ${formatStatus(props.installation?.status)} to ${formatStatus(newStatus.value)}`
    isValid = false
  }

  if (newStatus.value === 'delayed' && !delayReason.value) {
    errors.value.delayReason = 'Reason for delay is required'
    isValid = false
  }

  if (newStatus.value === 'delayed' && delayReason.value === 'other' && !otherDelayReason.value) {
    errors.value.otherDelayReason = 'Please specify the reason for delay'
    isValid = false
  }

  if (newStatus.value === 'on_site' && !arrivalTime.value) {
    errors.value.arrivalTime = 'Arrival time is required'
    isValid = false
  }

  return isValid
}

async function updateStatus() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Get the reason for delay if applicable
    let delayReasonText = null
    if (newStatus.value === 'delayed') {
      if (delayReason.value === 'other') {
        delayReasonText = otherDelayReason.value
      } else {
        delayReasonText = getDelayReasonText(delayReason.value)
      }
    }

    // Create status update data
    const statusUpdateData = {
      installation: props.installation,
      previousStatus: props.installation.status,
      newStatus: newStatus.value,
      delayReason: delayReasonText,
      arrivalTime: newStatus.value === 'on_site' ? arrivalTime.value : null,
      notes: statusNotes.value || null,
      notifyCustomer: notifyCustomer.value,
      updatedAt: new Date().toISOString()
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('status-updated', statusUpdateData)
    updateOpen(false)
  } catch (error) {
    console.error('Error updating status:', error)
  } finally {
    isSubmitting.value = false
  }
}

function getDelayReasonText(reason) {
  const reasonMap = {
    'weather': 'Weather Conditions',
    'materials': 'Materials Shortage',
    'technician_unavailable': 'Technician Unavailable',
    'customer_request': 'Customer Request',
    'access_issues': 'Site Access Issues',
    'other': 'Other Reason'
  }

  return reasonMap[reason] || reason
}
</script>