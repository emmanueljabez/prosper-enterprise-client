<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Schedule Activation</DialogTitle>
        <DialogDescription>
          Schedule activation #{{ activation?.activationNumber }} for {{ activation?.customer?.name }}.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="scheduleActivation" class="space-y-6 py-4">
        <div class="space-y-4">
          <!-- Date Picker -->
          <div class="space-y-2">
            <Label for="scheduledDate" required>Activation Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    :class="[
                    'w-full justify-start text-left font-normal',
                    !scheduledDate && 'text-muted-foreground',
                    errors.scheduledDate && 'border-red-500'
                  ]"
                >
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ scheduledDate ? formatDate(scheduledDate) : 'Select date' }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0" @click.stop>
                <Calendar v-model="scheduledDate" :disabled-dates="{ before: new Date() }" />
              </PopoverContent>
            </Popover>
            <p v-if="errors.scheduledDate" class="text-sm text-red-500">{{ errors.scheduledDate }}</p>
          </div>

          <!-- Time Slot -->
          <div class="space-y-2">
            <Label for="timeSlot" required>Time Slot</Label>
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

          <!-- Notification Options -->
          <div class="space-y-2">
            <Label class="text-base">Notification Options</Label>
            <div class="flex items-center space-x-2">
              <Checkbox id="notifyCustomer" v-model="notifyCustomer" />
              <Label for="notifyCustomer" class="font-normal">Notify customer about activation appointment</Label>
            </div>
          </div>

          <!-- Notes -->
          <div class="space-y-2">
            <Label for="notes">Notes (Optional)</Label>
            <Textarea
                id="notes"
                v-model="notes"
                placeholder="Add any additional notes about this activation"
                rows="3"
                @click.stop
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="updateOpen(false)">Cancel</Button>
          <Button type="submit" :disabled="isSubmitting">
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Schedule Activation
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarIcon, Loader2Icon } from 'lucide-vue-next'

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

const emit = defineEmits(['update:open', 'activation-scheduled'])

// Form state
const scheduledDate = ref(null)
const timeSlot = ref('')
const notifyCustomer = ref(true)
const notes = ref('')
const errors = ref({})
const isSubmitting = ref(false)

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
  // If the activation was previously scheduled, use those values
  if (props.activation?.scheduledDate) {
    scheduledDate.value = new Date(props.activation.scheduledDate)
    timeSlot.value = props.activation.timeSlot || 'morning'
  } else {
    // Default to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    scheduledDate.value = tomorrow
    timeSlot.value = 'morning'
  }

  notifyCustomer.value = true
  notes.value = props.activation?.schedulingNotes || ''
  errors.value = {}
}

function resetForm() {
  scheduledDate.value = null
  timeSlot.value = ''
  notifyCustomer.value = true
  notes.value = ''
  errors.value = {}
}

function validate() {
  let isValid = true
  errors.value = {}

  if (!scheduledDate.value) {
    errors.value.scheduledDate = 'Activation date is required'
    isValid = false
  }

  if (!timeSlot.value) {
    errors.value.timeSlot = 'Time slot is required'
    isValid = false
  }

  return isValid
}

function formatDate(date) {
  return date ? format(date, 'PPP') : ''
}

async function scheduleActivation() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Create scheduling data
    const schedulingData = {
      activation: props.activation,
      scheduledDate: scheduledDate.value.toISOString(),
      timeSlot: timeSlot.value,
      notifyCustomer: notifyCustomer.value,
      notes: notes.value || null
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('activation-scheduled', schedulingData)
    updateOpen(false)
  } catch (error) {
    console.error('Error scheduling activation:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>