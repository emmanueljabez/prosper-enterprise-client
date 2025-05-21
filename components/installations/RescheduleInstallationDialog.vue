<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Reschedule Installation</DialogTitle>
        <DialogDescription>
          Reschedule installation #{{ installation?.installationNumber }}.
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <Form @submit="rescheduleInstallation" class="space-y-6">
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="scheduledDate">New Installation Date *</Label>
              <Input
                  id="scheduledDate"
                  v-model="scheduledDate"
                  type="date"
                  :min="minDate"
                  :class="{ 'border-red-500': errors.scheduledDate }"
                  @click.stop
              />
              <p v-if="errors.scheduledDate" class="text-sm text-red-500">{{ errors.scheduledDate }}</p>
            </div>

            <div class="space-y-2">
              <Label for="timeSlot">New Time Slot *</Label>
              <Select v-model="timeSlot">
                <SelectTrigger id="timeSlot" :class="{ 'border-red-500': errors.timeSlot }">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent @click.stop>
                  <SelectItem value="morning">Morning (8:00 AM - 12:00 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (1:00 PM - 5:00 PM)</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.timeSlot" class="text-sm text-red-500">{{ errors.timeSlot }}</p>
            </div>

            <div class="space-y-2">
              <Label for="reason">Reason for Rescheduling *</Label>
              <Select v-model="reason">
                <SelectTrigger id="reason" :class="{ 'border-red-500': errors.reason }">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent @click.stop>
                  <SelectItem value="customer_request">Customer Request</SelectItem>
                  <SelectItem value="technician_unavailable">Technician Unavailable</SelectItem>
                  <SelectItem value="weather_conditions">Weather Conditions</SelectItem>
                  <SelectItem value="equipment_delay">Equipment/Inventory Delay</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.reason" class="text-sm text-red-500">{{ errors.reason }}</p>
            </div>

            <div class="space-y-2" v-if="reason === 'other'">
              <Label for="otherReason">Specify Reason *</Label>
              <Input
                  id="otherReason"
                  v-model="otherReason"
                  :class="{ 'border-red-500': errors.otherReason }"
                  @click.stop
              />
              <p v-if="errors.otherReason" class="text-sm text-red-500">{{ errors.otherReason }}</p>
            </div>

            <div class="space-y-2">
              <Label for="notes">Additional Notes</Label>
              <Textarea
                  id="notes"
                  v-model="notes"
                  rows="3"
                  placeholder="Enter any additional notes..."
                  @click.stop
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="updateOpen(false)">Cancel</Button>
            <Button type="submit" :disabled="isSubmitting">
              <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              Reschedule
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

const emit = defineEmits(['update:open', 'installation-rescheduled'])

// Form data
const scheduledDate = ref('')
const timeSlot = ref('')
const reason = ref('')
const otherReason = ref('')
const notes = ref('')
const errors = ref({})
const isSubmitting = ref(false)

// Set minimum date to today
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
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
  if (props.installation) {
    // Set default values based on current installation
    scheduledDate.value = ''
    timeSlot.value = props.installation.timeSlot || 'morning'
    reason.value = ''
    otherReason.value = ''
    notes.value = ''
  }
}

function resetForm() {
  scheduledDate.value = ''
  timeSlot.value = ''
  reason.value = ''
  otherReason.value = ''
  notes.value = ''
  errors.value = {}
}

function validate() {
  let isValid = true
  errors.value = {}

  if (!scheduledDate.value) {
    errors.value.scheduledDate = 'Installation date is required'
    isValid = false
  }

  if (!timeSlot.value) {
    errors.value.timeSlot = 'Time slot is required'
    isValid = false
  }

  if (!reason.value) {
    errors.value.reason = 'Reason is required'
    isValid = false
  }

  if (reason.value === 'other' && !otherReason.value.trim()) {
    errors.value.otherReason = 'Please specify the reason'
    isValid = false
  }

  return isValid
}

async function rescheduleInstallation() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Get the actual reason text
    const reasonText = reason.value === 'other'
        ? otherReason.value
        : getReasonsMap()[reason.value]

    // Create rescheduling data
    const reschedulingData = {
      installation: props.installation,
      oldScheduledDate: props.installation.scheduledDate,
      oldTimeSlot: props.installation.timeSlot,
      newScheduledDate: scheduledDate.value,
      newTimeSlot: timeSlot.value,
      reason: reasonText,
      notes: notes.value || null,
      rescheduledAt: new Date().toISOString()
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('installation-rescheduled', reschedulingData)
    updateOpen(false)
  } catch (error) {
    console.error('Error rescheduling installation:', error)
  } finally {
    isSubmitting.value = false
  }
}

function getReasonsMap() {
  return {
    'customer_request': 'Customer Request',
    'technician_unavailable': 'Technician Unavailable',
    'weather_conditions': 'Weather Conditions',
    'equipment_delay': 'Equipment/Inventory Delay',
    'other': 'Other'
  }
}
</script>