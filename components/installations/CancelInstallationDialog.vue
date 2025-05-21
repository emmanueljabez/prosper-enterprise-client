<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Cancel Installation</DialogTitle>
        <DialogDescription>
          Cancel installation #{{ installation?.installationNumber }}. This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <form @submit.prevent="cancelInstallation" class="space-y-6">
          <div class="space-y-4">
            <!-- Simplified alert -->
            <div class="p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
              <div class="flex items-center">
                <span class="font-medium">Warning</span>
              </div>
              <p class="text-sm mt-1">
                Cancelling this installation may incur cancellation fees and cannot be undone.
                The customer will be notified of this cancellation.
              </p>
            </div>

            <div class="space-y-2">
              <Label for="cancellationReason">Cancellation Reason *</Label>
              <select
                  id="cancellationReason"
                  v-model="cancellationReason"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  :class="{ 'border-red-500': errors.cancellationReason }"
              >
                <option value="">Select cancellation reason</option>
                <option value="customer_request">Customer Request</option>
                <option value="payment_issues">Payment Issues</option>
                <option value="scheduling_conflict">Scheduling Conflict</option>
                <option value="technical_constraints">Technical Constraints</option>
                <option value="material_shortage">Material Shortage</option>
                <option value="duplicate_order">Duplicate Order</option>
                <option value="other">Other</option>
              </select>
              <p v-if="errors.cancellationReason" class="text-sm text-red-500">{{ errors.cancellationReason }}</p>
            </div>

            <div v-if="cancellationReason === 'other'" class="space-y-2">
              <Label for="otherReason">Please Specify *</Label>
              <Input
                  id="otherReason"
                  v-model="otherReason"
                  placeholder="Specify cancellation reason"
                  :class="{ 'border-red-500': errors.otherReason }"
              />
              <p v-if="errors.otherReason" class="text-sm text-red-500">{{ errors.otherReason }}</p>
            </div>

            <div class="space-y-2">
              <Label for="cancellationNotes">Additional Notes</Label>
              <Textarea
                  id="cancellationNotes"
                  v-model="cancellationNotes"
                  rows="3"
                  placeholder="Add any additional notes about this cancellation"
              />
            </div>

            <div class="flex items-center space-x-2">
              <input
                  type="checkbox"
                  id="notifyCustomer"
                  v-model="notifyCustomer"
                  class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label for="notifyCustomer" class="text-sm font-normal">Notify customer about cancellation</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="updateOpen(false)">Cancel</Button>
            <Button type="submit" variant="destructive" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="mr-2">Loading...</span>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import {ref, watch} from 'vue'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter} from '@/components/ui/dialog'
import {Label} from '@/components/ui/label'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {Textarea} from '@/components/ui/textarea'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  installation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'installation-cancelled'])

// Form state
const cancellationReason = ref('')
const otherReason = ref('')
const cancellationNotes = ref('')
const notifyCustomer = ref(true)
const errors = ref({})
const isSubmitting = ref(false)

// Watch for changes in props
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
  cancellationReason.value = ''
  otherReason.value = ''
  cancellationNotes.value = ''
  notifyCustomer.value = true
  errors.value = {}
}

function resetForm() {
  cancellationReason.value = ''
  otherReason.value = ''
  cancellationNotes.value = ''
  notifyCustomer.value = true
  errors.value = {}
}

function validate() {
  let isValid = true
  errors.value = {}

  if (!cancellationReason.value) {
    errors.value.cancellationReason = 'Cancellation reason is required'
    isValid = false
  }

  if (cancellationReason.value === 'other' && !otherReason.value) {
    errors.value.otherReason = 'Please specify the cancellation reason'
    isValid = false
  }

  return isValid
}

async function cancelInstallation() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Get the cancellation reason text
    let reasonText = cancellationReason.value
    if (cancellationReason.value === 'other') {
      reasonText = otherReason.value
    } else {
      reasonText = getCancellationReasonText(cancellationReason.value)
    }

    // Create cancellation data
    const cancellationData = {
      installation: props.installation,
      reason: reasonText,
      notes: cancellationNotes.value || null,
      notifyCustomer: notifyCustomer.value,
      cancelledAt: new Date().toISOString()
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('installation-cancelled', cancellationData)
    updateOpen(false)
  } catch (error) {
    console.error('Error cancelling installation:', error)
  } finally {
    isSubmitting.value = false
  }
}

function getCancellationReasonText(reason) {
  const reasonMap = {
    'customer_request': 'Customer Request',
    'payment_issues': 'Payment Issues',
    'scheduling_conflict': 'Scheduling Conflict',
    'technical_constraints': 'Technical Constraints',
    'material_shortage': 'Material Shortage',
    'duplicate_order': 'Duplicate Order',
    'other': 'Other'
  }

  return reasonMap[reason] || reason
}
</script>