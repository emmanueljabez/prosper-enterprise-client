<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Resolve Outage</DialogTitle>
        <DialogDescription>
          Mark this outage as resolved and provide resolution details.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="rootCause">Root Cause</Label>
          <Input id="rootCause" v-model="form.rootCause" placeholder="What caused the outage?" required />
        </div>

        <div class="space-y-2">
          <Label for="resolution">Resolution</Label>
          <Textarea
              id="resolution"
              v-model="form.resolution"
              placeholder="How was the issue resolved?"
              required
              rows="3"
          />
        </div>

        <div class="space-y-2">
          <Label for="notes">Additional Notes</Label>
          <Textarea
              id="notes"
              v-model="form.notes"
              placeholder="Any additional information about the resolution"
              rows="2"
          />
        </div>

        <div class="pt-4">
          <div class="mb-4">
            <Label>Send Notification</Label>
            <div class="mt-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="notifyCustomers" v-model:checked="form.sendNotification" />
                <Label for="notifyCustomers">Notify affected customers</Label>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" @click="$emit('update:open', false)">Cancel</Button>
          <Button type="submit">Resolve Outage</Button>
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  outage: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'submit'])

// Form state
const form = ref({
  rootCause: '',
  resolution: '',
  notes: '',
  sendNotification: true
})

function handleSubmit() {
  emit('submit', {
    status: 'resolved',
    ...form.value,
  })
}
</script>