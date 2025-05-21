<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Resolve Ticket</DialogTitle>
        <DialogDescription>
          Mark ticket #{{ ticketId }} as resolved
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="resolutionMethod">Resolution Method</Label>
          <Select v-model="resolutionMethod">
            <SelectTrigger id="resolutionMethod">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="remote_fix">Remote Fix</SelectItem>
              <SelectItem value="onsite_repair">Onsite Repair</SelectItem>
              <SelectItem value="equipment_replacement">Equipment Replacement</SelectItem>
              <SelectItem value="customer_education">Customer Education</SelectItem>
              <SelectItem value="software_update">Software/Firmware Update</SelectItem>
              <SelectItem value="configuration_change">Configuration Change</SelectItem>
              <SelectItem value="no_issue_found">No Issue Found</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="resolution">Resolution Details</Label>
          <Textarea
              id="resolution"
              v-model="resolution"
              placeholder="Describe how the issue was resolved..."
              rows="4"
          />
        </div>

        <div class="space-y-2" v-if="resolutionMethod === 'equipment_replacement'">
          <Label for="replacementDetails">Replacement Equipment Details</Label>
          <Textarea
              id="replacementDetails"
              v-model="replacementDetails"
              placeholder="Specify the replacement equipment details..."
              rows="2"
          />
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="followUp" v-model="followUp" />
          <Label for="followUp">Schedule follow-up in 48 hours</Label>
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="notifyCustomer" v-model="notifyCustomer" />
          <Label for="notifyCustomer">Send resolution notification to customer</Label>
        </div>

        <div class="space-y-2" v-if="notifyCustomer">
          <Label for="customerMessage">Custom Message for Customer</Label>
          <Textarea
              id="customerMessage"
              v-model="customerMessage"
              placeholder="Add optional custom message to the customer notification..."
              rows="2"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
        <Button @click="handleResolve" :disabled="!isFormValid">Resolve Ticket</Button>
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
const resolutionMethod = ref('')
const resolution = ref('')
const replacementDetails = ref('')
const followUp = ref(false)
const notifyCustomer = ref(true)
const customerMessage = ref('')

// Form validation
const isFormValid = computed(() => {
  return resolutionMethod.value && resolution.value &&
      (resolutionMethod.value !== 'equipment_replacement' || replacementDetails.value)
})

// Handle resolution
function handleResolve() {
  if (!isFormValid.value) return

  const resolutionData = {
    method: resolutionMethod.value,
    resolution: resolution.value,
    replacementDetails: replacementDetails.value,
    followUp: followUp.value,
    notifyCustomer: notifyCustomer.value,
    customerMessage: customerMessage.value
  }

  emit('confirm', props.ticketId, resolutionData)
  emit('update:open', false)

  // Reset form
  resolutionMethod.value = ''
  resolution.value = ''
  replacementDetails.value = ''
  followUp.value = false
  notifyCustomer.value = true
  customerMessage.value = ''
}
</script>