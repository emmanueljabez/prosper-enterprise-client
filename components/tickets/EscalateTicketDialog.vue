<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Escalate Ticket</DialogTitle>
        <DialogDescription>
          Escalate ticket #{{ ticketId }} to a higher support tier
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="escalationReason">Escalation Reason</Label>
          <Select v-model="escalationReason">
            <SelectTrigger id="escalationReason">
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="requires_expertise">Requires Technical Expertise</SelectItem>
              <SelectItem value="complex_issue">Complex Issue</SelectItem>
              <SelectItem value="sla_at_risk">SLA at Risk</SelectItem>
              <SelectItem value="customer_request">Customer Request</SelectItem>
              <SelectItem value="recurring_issue">Recurring Issue</SelectItem>
              <SelectItem value="policy_exception">Policy Exception Needed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="escalationTier">Escalation Tier</Label>
          <Select v-model="escalationTier">
            <SelectTrigger id="escalationTier">
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tier_2">Tier 2 Support</SelectItem>
              <SelectItem value="tier_3">Tier 3 Support</SelectItem>
              <SelectItem value="network_ops">Network Operations</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="management">Management</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="escalationDetails">Additional Details</Label>
          <Textarea
              id="escalationDetails"
              v-model="escalationDetails"
              placeholder="Provide additional context about this escalation..."
              rows="4"
          />
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="notifyCustomer" v-model="notifyCustomer" />
          <Label for="notifyCustomer">Notify customer about escalation</Label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
        <Button @click="handleEscalate" :disabled="!isFormValid">Escalate</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
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
  ticketId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:open', 'confirm'])

// Form state
const escalationReason = ref('')
const escalationTier = ref('')
const escalationDetails = ref('')
const notifyCustomer = ref(false)

// Form validation
const isFormValid = computed(() => {
  return escalationReason.value && escalationTier.value
})

// Handle escalation
function handleEscalate() {
  if (!isFormValid.value) return

  const escalationData = {
    reason: escalationReason.value,
    tier: escalationTier.value,
    details: escalationDetails.value,
    notifyCustomer: notifyCustomer.value
  }

  emit('confirm', props.ticketId, escalationData)
  emit('update:open', false)

  // Reset form
  escalationReason.value = ''
  escalationTier.value = ''
  escalationDetails.value = ''
  notifyCustomer.value = false
}
</script>