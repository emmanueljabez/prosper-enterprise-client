<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Convert Quote to Order</DialogTitle>
        <DialogDescription>
          Convert this quote into a customer order.
        </DialogDescription>
      </DialogHeader>

      <div v-if="quote" class="py-4">
        <div class="mb-4">
          <h3 class="text-sm font-medium mb-2">Quote Information</h3>
          <div class="text-sm space-y-1">
            <p><span class="text-muted-foreground">Quote #:</span> {{ quote.quoteNumber }}</p>
            <p><span class="text-muted-foreground">Customer:</span> {{ quote.customer.name }}</p>
            <p><span class="text-muted-foreground">Total:</span> {{ formatCurrency(quote.totalAmount, quote.currency) }}</p>
            <p><span class="text-muted-foreground">Expires:</span> {{ formatDate(quote.validUntil) }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <Alert variant="info">
            <AlertCircleIcon class="h-4 w-4" />
            <AlertTitle>Converting to Order</AlertTitle>
            <AlertDescription>
              This will create a new order based on this quote. The quote status will be changed to 'Converted'.
            </AlertDescription>
          </Alert>

          <div class="space-y-2">
            <Label for="paymentTerms">Payment Terms *</Label>
            <Select v-model="paymentTerms">
              <SelectTrigger id="paymentTerms">
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent @click.stop>
                <SelectItem value="full">Full Payment</SelectItem>
                <SelectItem value="30days">30 Days</SelectItem>
                <SelectItem value="60days">60 Days</SelectItem>
                <SelectItem value="installment">Installment Plan</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="termsError" class="text-sm text-red-500">{{ termsError }}</p>
          </div>

          <div class="space-y-2">
            <Label for="scheduledDate">Installation/Service Date *</Label>
            <Input
                id="scheduledDate"
                type="date"
                v-model="scheduledDate"
                @click.stop
            />
            <p v-if="dateError" class="text-sm text-red-500">{{ dateError }}</p>
          </div>

          <div class="space-y-2">
            <Label for="notes">Additional Notes</Label>
            <Textarea
                id="notes"
                v-model="notes"
                placeholder="Enter any additional notes for this order..."
                rows="3"
                @click.stop
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="updateOpen(false)">Cancel</Button>
        <Button type="submit" @click="convertQuote" :disabled="isSubmitting">
          <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          <span>Convert to Order</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircleIcon, Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  quote: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'quote-converted'])

// Form state
const paymentTerms = ref('30days')
const scheduledDate = ref('')
const notes = ref('')
const isSubmitting = ref(false)

// Validation errors
const termsError = ref('')
const dateError = ref('')

function updateOpen(value) {
  emit('update:open', value)

  if (!value) {
    resetForm()
  } else {
    initializeForm()
  }
}

function resetForm() {
  paymentTerms.value = '30days'
  scheduledDate.value = ''
  notes.value = ''

  termsError.value = ''
  dateError.value = ''
}

function initializeForm() {
  // Set default scheduled date to 7 days from now
  const date = new Date()
  date.setDate(date.getDate() + 7)
  scheduledDate.value = date.toISOString().split('T')[0]

  // Preserve any existing quote notes
  if (props.quote && props.quote.notes) {
    notes.value = props.quote.notes
  }
}

function formatCurrency(amount, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function validate() {
  let isValid = true

  termsError.value = ''
  dateError.value = ''

  if (!paymentTerms.value) {
    termsError.value = 'Payment terms are required'
    isValid = false
  }

  if (!scheduledDate.value) {
    dateError.value = 'Installation/service date is required'
    isValid = false
  }

  return isValid
}

async function convertQuote() {
  if (!props.quote) return

  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Generate a new order ID
    const orderId = `ORD-K${Math.floor(10000 + Math.random() * 90000)}`

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    emit('quote-converted', {
      quote: props.quote,
      orderId,
      paymentTerms: paymentTerms.value,
      scheduledDate: scheduledDate.value,
      notes: notes.value
    })

    updateOpen(false)
  } catch (error) {
    console.error('Error converting quote:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>