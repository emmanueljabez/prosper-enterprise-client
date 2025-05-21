<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Update Refund Status</DialogTitle>
        <DialogDescription>
          Update the refund status and details for credit note {{ creditNote?.number }}.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 py-4">
        <!-- Status -->
        <div class="space-y-2">
          <Label for="status" required>Status</Label>
          <Select v-model="formData.status" required>
            <SelectTrigger id="status" :class="{ 'border-destructive': errors.status }">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="not_applicable">Not Applicable</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.status" class="text-sm text-destructive">{{ errors.status }}</p>
        </div>

        <!-- Refund Method (Only if status is not "not_applicable") -->
        <div v-if="formData.status !== 'not_applicable'" class="space-y-2">
          <Label for="method" required>Refund Method</Label>
          <Select v-model="formData.method" required>
            <SelectTrigger id="method" :class="{ 'border-destructive': errors.method }">
              <SelectValue placeholder="Select refund method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="original_payment_method">Original Payment Method</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="mobile_money">Mobile Money</SelectItem>
              <SelectItem value="account_credit">Account Credit</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.method" class="text-sm text-destructive">{{ errors.method }}</p>
        </div>

        <!-- Refund Date (Required only if status is "completed") -->
        <div v-if="formData.status === 'completed'" class="space-y-2">
          <Label for="refundDate" required>Refund Date</Label>
          <Input
              id="refundDate"
              type="date"
              v-model="formData.refundDate"
              :class="{ 'border-destructive': errors.refundDate }"
              required
          />
          <p v-if="errors.refundDate" class="text-sm text-destructive">{{ errors.refundDate }}</p>
        </div>

        <!-- Reference -->
        <div class="space-y-2">
          <Label for="reference">Reference</Label>
          <Input
              id="reference"
              v-model="formData.reference"
              placeholder="Transaction reference or ID"
          />
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <Textarea
              id="notes"
              v-model="formData.notes"
              placeholder="Additional details about the refund"
          />
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Cancel
        </Button>
        <Button type="submit" @click="handleSubmit">
          <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
          <span v-else>Update Status</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  creditNote: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'update-status'])

const isSubmitting = ref(false)
const errors = ref({})

// Initialize form data
const formData = reactive({
  status: props.creditNote?.refundStatus || 'pending',
  method: props.creditNote?.refundMethod || 'original_payment_method',
  refundDate: props.creditNote?.refundDate ? new Date(props.creditNote.refundDate).toISOString().split('T')[0] : '',
  reference: props.creditNote?.refundReference || '',
  notes: ''
})

// Validate form
function validateForm() {
  const newErrors = {}

  if (!formData.status) {
    newErrors.status = 'Status is required'
  }

  if (formData.status !== 'not_applicable' && !formData.method) {
    newErrors.method = 'Refund method is required'
  }

  if (formData.status === 'completed' && !formData.refundDate) {
    newErrors.refundDate = 'Refund date is required for completed refunds'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Submit handler
async function handleSubmit() {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    // Prepare update data
    const updateData = {
      id: props.creditNote.id,
      refundStatus: formData.status,
      refundMethod: formData.status !== 'not_applicable' ? formData.method : null,
      refundDate: formData.status === 'completed' && formData.refundDate ?
          new Date(formData.refundDate).toISOString() : null,
      refundReference: formData.reference || null,
    }

    // In a real app, you would make an API call here
    // For now we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('update-status', updateData)
    emit('update:open', false)
  } catch (error) {
    console.error('Error updating refund status:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>