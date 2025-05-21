<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Update Activation Status</DialogTitle>
        <DialogDescription>
          Change status for activation #{{ activation?.activationNumber }}.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="updateStatus" class="space-y-6 py-4">
        <div class="space-y-4">
          <!-- Current Status -->
          <div class="space-y-2">
            <Label>Current Status</Label>
            <div class="flex items-center">
              <Badge :variant="getStatusVariant(activation?.status)">
                {{ formatStatus(activation?.status) }}
              </Badge>
            </div>
          </div>

          <!-- New Status -->
          <div class="space-y-2">
            <Label for="newStatus" required>New Status</Label>
            <Select v-model="newStatus">
              <SelectTrigger id="newStatus" :class="{ 'border-red-500': errors.newStatus }">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent @click.stop>
                <SelectItem v-for="status in availableStatusOptions" :key="status.value" :value="status.value">
                  {{ status.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.newStatus" class="text-sm text-red-500">{{ errors.newStatus }}</p>
          </div>

          <!-- Notification Options -->
          <div class="space-y-2">
            <Label class="text-base">Notification Options</Label>
            <div class="flex items-center space-x-2">
              <Checkbox id="notifyCustomer" v-model="notifyCustomer" />
              <Label for="notifyCustomer" class="font-normal">Notify customer about status change</Label>
            </div>
          </div>

          <!-- Notes -->
          <div class="space-y-2">
            <Label for="notes">Status Update Notes</Label>
            <Textarea
                id="notes"
                v-model="notes"
                placeholder="Add notes about this status change"
                rows="3"
                @click.stop
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="updateOpen(false)">Cancel</Button>
          <Button type="submit" :disabled="isSubmitting">
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Update Status
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  activation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'status-updated'])

// Form state
const newStatus = ref('')
const notifyCustomer = ref(true)
const notes = ref('')
const errors = ref({})
const isSubmitting = ref(false)

// Status transition definitions
const allowedStatusTransitions = {
  'pending': ['scheduled', 'cancelled'],
  'scheduled': ['in_progress', 'pending', 'cancelled'],
  'in_progress': ['pending_test', 'cancelled'],
  'pending_test': ['test_passed', 'test_failed', 'cancelled'],
  'test_failed': ['pending_test', 'in_progress', 'cancelled'],
  'test_passed': ['awaiting_customer', 'completed', 'cancelled'],
  'awaiting_customer': ['completed', 'cancelled'],
  'completed': ['cancelled']
}

// Computed for available status options
const availableStatusOptions = computed(() => {
  if (!props.activation) return []

  const currentStatus = props.activation.status
  const allowedStatuses = allowedStatusTransitions[currentStatus] || []

  return allowedStatuses.map(status => ({
    value: status,
    label: formatStatus(status)
  }))
})

// Watch for dialog open to initialize form
watch(() => props.open, (value) => {
  if (value) {
    initializeForm()
  }
})

// Methods
function updateOpen(value) {
  emit('update:open', value)
  if (!value) {
    resetForm()
  }
}

function initializeForm() {
  newStatus.value = ''
  notifyCustomer.value = true
  notes.value = ''
  errors.value = {}
}

function resetForm() {
  newStatus.value = ''
  notifyCustomer.value = true
  notes.value = ''
  errors.value = {}
}

function validate() {
  let isValid = true
  errors.value = {}

  if (!newStatus.value) {
    errors.value.newStatus = 'New status is required'
    isValid = false
  }

  return isValid
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

function getStatusVariant(status) {
  const variantMap = {
    'pending': 'secondary',
    'scheduled': 'warning',
    'in_progress': 'primary',
    'pending_test': 'secondary',
    'test_failed': 'destructive',
    'test_passed': 'success',
    'awaiting_customer': 'warning',
    'completed': 'success',
    'cancelled': 'destructive'
  }

  return variantMap[status] || 'default'
}

async function updateStatus() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Create update data
    const updateData = {
      activation: props.activation,
      previousStatus: props.activation.status,
      newStatus: newStatus.value,
      notifyCustomer: notifyCustomer.value,
      notes: notes.value || null,
      updatedAt: new Date().toISOString()
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('status-updated', updateData)
    updateOpen(false)
  } catch (error) {
    console.error('Error updating status:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>