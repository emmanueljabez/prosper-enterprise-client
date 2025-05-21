<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Cancel Maintenance</DialogTitle>
        <DialogDescription>
          Cancel the scheduled maintenance event and provide a reason.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 py-4">
        <div class="bg-muted p-3 rounded-md text-sm">
          <div><strong>Maintenance:</strong> {{ maintenance.title }}</div>
          <div><strong>Scheduled:</strong> {{ formatDateTime(maintenance.scheduledStart) }}</div>
          <div><strong>Affected customers:</strong> {{ maintenance.estimatedCustomersAffected?.toLocaleString() || 'Unknown' }}</div>
        </div>

        <div class="space-y-2">
          <Label for="reason">Cancellation Reason</Label>
          <Select id="reason" v-model="form.reason" required>
            <SelectTrigger>
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no_longer_needed">No Longer Needed</SelectItem>
              <SelectItem value="reschedule">Will Reschedule</SelectItem>
              <SelectItem value="alternative_solution">Alternative Solution Found</SelectItem>
              <SelectItem value="postponed">Postponed Indefinitely</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="notes">Additional Notes</Label>
          <Textarea
              id="notes"
              v-model="form.notes"
              placeholder="Provide details about the cancellation"
              required
              rows="3"
          />
        </div>

        <div class="pt-4">
          <div class="flex items-center space-x-2">
            <Checkbox id="notifyCustomers" v-model:checked="form.notifyCustomers" />
            <Label for="notifyCustomers">Notify affected customers about cancellation</Label>
          </div>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" @click="$emit('update:open', false)">Go Back</Button>
          <Button type="submit" variant="destructive">Cancel Maintenance</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  maintenance: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'submit'])

// Form state
const form = ref({
  reason: '',
  notes: '',
  notifyCustomers: true
})

function formatDateTime(dateString) {
  if (!dateString) return 'Not specified'

  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })
}

function handleSubmit() {
  emit('submit', {
    status: 'cancelled',
    ...form.value
  })
}
</script>