<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Schedule Installation</DialogTitle>
        <DialogDescription>
          Schedule a technician installation for Order #{{ order?.orderNumber }}.
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="scheduledDate">Installation Date *</Label>
            <Input
                id="scheduledDate"
                v-model="scheduledDate"
                type="date"
                :class="{ 'border-red-500': errors.scheduledDate }"
                :min="minDate"
                @click.stop
            />
            <p v-if="errors.scheduledDate" class="text-sm text-red-500">{{ errors.scheduledDate }}</p>
          </div>

          <div class="space-y-2">
            <Label for="timeSlot">Time Slot *</Label>
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
            <Label for="technician">Technician *</Label>
            <Select v-model="technician">
              <SelectTrigger id="technician" :class="{ 'border-red-500': errors.technician }">
                <SelectValue placeholder="Assign technician" />
              </SelectTrigger>
              <SelectContent @click.stop>
                <SelectItem value="John Maina">John Maina</SelectItem>
                <SelectItem value="Mary Njeri">Mary Njeri</SelectItem>
                <SelectItem value="Daniel Kipchoge">Daniel Kipchoge</SelectItem>
                <SelectItem value="Sarah Wangari">Sarah Wangari</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.technician" class="text-sm text-red-500">{{ errors.technician }}</p>
          </div>

          <div class="space-y-2">
            <Label for="notes">Notes (Optional)</Label>
            <Textarea
                id="notes"
                v-model="notes"
                rows="3"
                placeholder="Enter any special instructions for the installation..."
                @click.stop
            />
          </div>

          <div class="bg-muted/30 p-3 rounded-md">
            <h4 class="text-sm font-medium mb-2">Installation Address</h4>
            <div v-if="order && order.address" class="text-sm space-y-1">
              <p>{{ order.address.street }}</p>
              <p>{{ order.address.city }}{{ order.address.state ? ', ' + order.address.state : '' }} {{ order.address.postalCode }}</p>
            </div>
            <div v-else class="text-sm text-muted-foreground">
              No address provided for this order.
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="updateOpen(false)">Cancel</Button>
        <Button @click="scheduleInstallation" :disabled="isSubmitting">
          <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          <span>Schedule Installation</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format, addDays } from 'date-fns'
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
  order: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'installation-scheduled'])

// State
const scheduledDate = ref('')
const timeSlot = ref('')
const technician = ref('')
const notes = ref('')
const isSubmitting = ref(false)
const errors = ref({
  scheduledDate: '',
  timeSlot: '',
  technician: ''
})

// Computed properties
const minDate = computed(() => {
  // Allow scheduling starting from tomorrow
  const tomorrow = addDays(new Date(), 1)
  return format(tomorrow, 'yyyy-MM-dd')
})

// Methods
function updateOpen(value) {
  emit('update:open', value)

  if (!value) {
    resetForm()
  }
}

function resetForm() {
  scheduledDate.value = ''
  timeSlot.value = ''
  technician.value = ''
  notes.value = ''
  errors.value = {
    scheduledDate: '',
    timeSlot: '',
    technician: ''
  }
}

function validate() {
  let isValid = true
  errors.value = {
    scheduledDate: '',
    timeSlot: '',
    technician: ''
  }

  if (!scheduledDate.value) {
    errors.value.scheduledDate = 'Installation date is required'
    isValid = false
  }

  if (!timeSlot.value) {
    errors.value.timeSlot = 'Time slot is required'
    isValid = false
  }

  if (!technician.value) {
    errors.value.technician = 'Technician assignment is required'
    isValid = false
  }

  return isValid
}

async function scheduleInstallation() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Create a scheduled date with the selected time slot
    // This is a simple representation - in a real app, you'd create a proper datetime
    const fullScheduledDate = new Date(scheduledDate.value)

    // Create installation data
    const installationData = {
      order: props.order,
      scheduledDate: fullScheduledDate.toISOString(),
      technician: technician.value,
      timeSlot: timeSlot.value,
      notes: notes.value || null
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('installation-scheduled', installationData)
    updateOpen(false)
  } catch (error) {
    console.error('Error scheduling installation:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>