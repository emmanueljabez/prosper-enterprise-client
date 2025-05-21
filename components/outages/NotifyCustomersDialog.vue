<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Notify Affected Customers</DialogTitle>
        <DialogDescription>
          Send a notification to customers affected by this outage or maintenance.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 py-4">
        <div class="bg-muted p-3 rounded-md text-sm">
          <div><strong>Affected customers:</strong> {{ item.estimatedCustomersAffected?.toLocaleString() || 'Unknown' }}</div>
          <div><strong>Affected areas:</strong> {{ item.affectedAreas?.join(', ') || 'Not specified' }}</div>
        </div>

        <div class="space-y-2">
          <Label for="notificationType">Notification Method</Label>
          <Select id="notificationType" v-model="form.notificationType" required>
            <SelectTrigger>
              <SelectValue placeholder="Select notification method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="app">Mobile App Notification</SelectItem>
              <SelectItem value="all">All Methods</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="subject">Subject</Label>
          <Input id="subject" v-model="form.subject" required placeholder="Notification subject" />
        </div>

        <div class="space-y-2">
          <Label for="message">Message</Label>
          <Textarea
              id="message"
              v-model="form.message"
              placeholder="Message to send to affected customers"
              required
              rows="4"
          />
          <div class="text-xs text-muted-foreground">
            Include details about the issue, what customers can expect, and when service will be restored.
          </div>
        </div>

        <div class="pt-2">
          <div class="flex items-center space-x-2">
            <Checkbox id="includeTicketLink" v-model:checked="form.includeTicketLink" />
            <Label for="includeTicketLink">Include link to status page</Label>
          </div>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" @click="$emit('update:open', false)">Cancel</Button>
          <Button type="submit">Send Notification</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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
  item: {
    type: Object,
    default: null
  },
  type: {
    type: String,
    default: 'outage',
    validator: (value) => ['outage', 'maintenance'].includes(value)
  }
})

const emit = defineEmits(['update:open', 'submit'])

// Form state
const form = ref({
  notificationType: 'all',
  subject: '',
  message: '',
  includeTicketLink: true
})

// Generate default subject and message based on the item type and details
watch(() => props.item, (newItem) => {
  if (!newItem) return

  if (props.type === 'outage') {
    const isResolved = newItem.status === 'resolved'

    form.value.subject = isResolved
        ? `Service Restored: ${newItem.title}`
        : `Service Disruption: ${newItem.title}`

    form.value.message = isResolved
        ? `We've resolved the service issue affecting ${newItem.affectedAreas?.join(', ') || 'your area'}. ${newItem.resolution || ''} Thank you for your patience.`
        : `We're currently experiencing a service disruption in ${newItem.affectedAreas?.join(', ') || 'your area'} that may affect your internet connection. Our technical team is working to resolve this issue as quickly as possible. We apologize for any inconvenience this may cause.`
  } else {
    // Maintenance notification
    const isScheduled = newItem.status === 'scheduled'

    form.value.subject = isScheduled
        ? `Scheduled Maintenance: ${newItem.title}`
        : `Maintenance Update: ${newItem.title}`

    form.value.message = isScheduled
        ? `We will be performing scheduled maintenance on ${formatDateTime(newItem.scheduledStart)} that may affect your service. The maintenance is expected to last ${formatDuration(newItem)} and will improve network reliability and performance. We apologize for any inconvenience this may cause.`
        : `This is an update regarding our maintenance activity: ${newItem.title}. ${newItem.status === 'completed' ? 'The maintenance has been completed.' : newItem.status === 'in_progress' ? 'The maintenance is currently in progress.' : newItem.status === 'delayed' ? 'The maintenance has been delayed.' : 'The maintenance schedule has been updated.'} Thank you for your understanding.`
  }
}, { immediate: true })

function formatDateTime(dateString) {
  if (!dateString) return 'the scheduled time'

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

function formatDuration(maintenance) {
  if (!maintenance.scheduledStart || !maintenance.scheduledEnd) return 'the scheduled duration'

  const start = new Date(maintenance.scheduledStart)
  const end = new Date(maintenance.scheduledEnd)
  const minutes = Math.round((end - start) / (1000 * 60))

  if (minutes < 60) {
    return `approximately ${minutes} minutes`
  } else if (minutes < 1440) { // Less than 24 hours
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `approximately ${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` and ${remainingMinutes} minutes` : ''}`
  } else {
    const days = Math.floor(minutes / 1440)
    const remainingHours = Math.floor((minutes % 1440) / 60)
    return `approximately ${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` and ${remainingHours} hours` : ''}`
  }
}

function handleSubmit() {
  emit('submit', {
    ...form.value,
    itemId: props.item?.id,
    itemType: props.type
  })
}
</script>