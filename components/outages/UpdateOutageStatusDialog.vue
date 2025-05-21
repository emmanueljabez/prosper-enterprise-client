<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Update Outage Status</DialogTitle>
        <DialogDescription>
          Update the current status of the outage and provide additional details.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="status">Current Status</Label>
          <Select id="status" v-model="form.status" required>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="identified">Identified</SelectItem>
              <SelectItem value="monitoring">Monitoring</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="mitigated">Mitigated</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="notes">Update Notes</Label>
          <Textarea
              id="notes"
              v-model="form.notes"
              placeholder="Provide details about the current status"
              required
              rows="3"
          />
        </div>

        <!-- Root Cause and Resolution fields for Resolved status -->
        <div v-if="form.status === 'resolved'" class="space-y-4">
          <div class="space-y-2">
            <Label for="rootCause">Root Cause</Label>
            <Input id="rootCause" v-model="form.rootCause" placeholder="What caused the outage?" />
          </div>

          <div class="space-y-2">
            <Label for="resolution">Resolution</Label>
            <Textarea
                id="resolution"
                v-model="form.resolution"
                placeholder="How was the issue resolved?"
                rows="2"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" @click="$emit('update:open', false)">Cancel</Button>
          <Button type="submit">Update Status</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
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
  outage: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'submit'])

// Form state
const form = ref({
  status: 'investigating',
  notes: '',
  rootCause: '',
  resolution: ''
})

// Watch for outage prop changes
watch(() => props.outage, (newOutage) => {
  if (newOutage) {
    form.value.status = newOutage.status || 'investigating'
    form.value.rootCause = newOutage.rootCause || ''
    form.value.resolution = newOutage.resolution || ''
  }
}, { immediate: true })

function handleSubmit() {
  emit('submit', { ...form.value })
}
</script>