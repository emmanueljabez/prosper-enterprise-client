<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Send Invoice</DialogTitle>
        <DialogDescription>
          Send this invoice to the customer via email.
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSend" class="py-4 space-y-4">
        <div v-if="invoice" class="rounded-md bg-muted p-4 mb-4">
          <div class="mb-3 flex items-center justify-between">
            <div class="font-medium">{{ invoice.number }}</div>
            <Badge
                :variant="invoice.status === 'paid' ? 'success' :
                       invoice.status === 'overdue' ? 'destructive' : 'secondary'"
            >
              {{ formatStatus(invoice.status) }}
            </Badge>
          </div>
          <div class="text-sm text-muted-foreground grid gap-1">
            <div class="flex justify-between">
              <span>Customer:</span>
              <span>{{ invoice.customer.name }}</span>
            </div>
            <div class="flex justify-between">
              <span>Email:</span>
              <span>{{ invoice.customer.email }}</span>
            </div>
            <div class="flex justify-between">
              <span>Total:</span>
              <span>KES {{ formatAmount(invoice.total) }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="to">Email Address</Label>
          <Input
              id="to"
              v-model="formData.to"
              placeholder="Enter email address"
              :class="{ 'border-destructive': errors.to }"
          />
          <p v-if="errors.to" class="text-sm text-destructive">{{ errors.to }}</p>
        </div>

        <div class="space-y-2">
          <Label for="subject">Subject</Label>
          <Input
              id="subject"
              v-model="formData.subject"
              placeholder="Email subject"
              :class="{ 'border-destructive': errors.subject }"
          />
          <p v-if="errors.subject" class="text-sm text-destructive">{{ errors.subject }}</p>
        </div>

        <div class="space-y-2">
          <Label for="message">Message</Label>
          <Textarea
              id="message"
              v-model="formData.message"
              rows="5"
              placeholder="Enter email message"
              :class="{ 'border-destructive': errors.message }"
          />
          <p v-if="errors.message" class="text-sm text-destructive">{{ errors.message }}</p>
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="attachPdf" v-model:checked="formData.attachPdf" />
          <Label for="attachPdf" class="text-sm">Attach invoice as PDF</Label>
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" @click="$emit('update:open', false)">Cancel</Button>
          <Button
              type="submit"
              :disabled="isSending"
          >
            <Loader2Icon v-if="isSending" class="h-4 w-4 mr-2 animate-spin" />
            <MailIcon v-else class="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { format, parseISO } from 'date-fns'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2Icon, MailIcon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  invoice: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'send'])

const isSending = ref(false)
const errors = ref({})

// Form data
const formData = ref({
  to: '',
  subject: '',
  message: '',
  attachPdf: true
})

// Update form data when invoice changes
watch(() => props.invoice, (newInvoice) => {
  if (newInvoice) {
    formData.value.to = newInvoice.customer.email || ''
    formData.value.subject = `Invoice #${newInvoice.number} from ISP Kenya`

    // Create a default message based on invoice data
    const dueDate = newInvoice.dueDate ? format(parseISO(newInvoice.dueDate), 'MMMM dd, yyyy') : ''
    const amount = newInvoice.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    formData.value.message = `Dear ${newInvoice.customer.name},

We have attached your invoice #${newInvoice.number} for KES ${amount}.
The payment is due on ${dueDate}.

Thank you for your business.

Best regards,
ISP Kenya Team`
  }
}, { immediate: true })

// Form validation
function validateForm() {
  const newErrors = {}

  // Validate email
  if (!formData.value.to) {
    newErrors.to = 'Email address is required'
  } else if (!isValidEmail(formData.value.to)) {
    newErrors.to = 'Please enter a valid email address'
  }

  // Validate subject
  if (!formData.value.subject.trim()) {
    newErrors.subject = 'Subject is required'
  }

  // Validate message
  if (!formData.value.message.trim()) {
    newErrors.message = 'Message is required'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Send the invoice
async function handleSend() {
  if (!validateForm() || !props.invoice) return

  try {
    isSending.value = true

    // Prepare data for sending
    const sendData = {
      invoiceId: props.invoice.id,
      to: formData.value.to,
      subject: formData.value.subject,
      message: formData.value.message,
      attachPdf: formData.value.attachPdf
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200))

    emit('send', props.invoice)
    emit('update:open', false)
  } catch (error) {
    console.error('Error sending invoice:', error)
  } finally {
    isSending.value = false
  }
}

// Helper functions
function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatStatus(status) {
  const statusMap = {
    'paid': 'Paid',
    'pending': 'Pending',
    'overdue': 'Overdue'
  }
  return statusMap[status] || status
}
</script>