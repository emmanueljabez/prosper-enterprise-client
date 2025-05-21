<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Send Quote #{{ quote?.quoteNumber }}</DialogTitle>
        <DialogDescription>
          Send this quote to the customer.
        </DialogDescription>
      </DialogHeader>

      <div v-if="quote" class="py-4">
        <div class="mb-4">
          <h3 class="text-sm font-medium mb-2">Quote Information</h3>
          <div class="text-sm">
            <p><span class="text-muted-foreground">Customer:</span> {{ quote.customer.name }}</p>
            <p><span class="text-muted-foreground">Email:</span> {{ quote.customer.email }}</p>
            <p><span class="text-muted-foreground">Total:</span> {{ formatCurrency(quote.totalAmount, quote.currency) }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="sendMethod">Send Method *</Label>
            <Select v-model="sendMethod">
              <SelectTrigger id="sendMethod">
                <SelectValue placeholder="Select send method" />
              </SelectTrigger>
              <SelectContent @click.stop>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="methodError" class="text-sm text-red-500">{{ methodError }}</p>
          </div>

          <div v-if="sendMethod === 'email'" class="space-y-2">
            <Label for="emailSubject">Email Subject *</Label>
            <Input
                id="emailSubject"
                v-model="emailSubject"
                placeholder="Quote for your requested services"
                @click.stop
            />
            <p v-if="subjectError" class="text-sm text-red-500">{{ subjectError }}</p>
          </div>

          <div class="space-y-2">
            <Label for="message">Message *</Label>
            <Textarea
                id="message"
                v-model="message"
                placeholder="Enter a message to include with this quote..."
                rows="4"
                @click.stop
            />
            <p v-if="messageError" class="text-sm text-red-500">{{ messageError }}</p>
          </div>

          <div class="flex items-center space-x-2">
            <Checkbox id="attachment" v-model:checked="includeAttachment" @click.stop />
            <Label for="attachment">Include PDF attachment</Label>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="updateOpen(false)">Cancel</Button>
        <Button type="submit" @click="sendQuote" :disabled="isSubmitting">
          <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          <span>Send Quote</span>
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2Icon } from 'lucide-vue-next'

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

const emit = defineEmits(['update:open', 'quote-sent'])

// Form state
const sendMethod = ref('email')
const emailSubject = ref('')
const message = ref('')
const includeAttachment = ref(true)
const isSubmitting = ref(false)

// Validation errors
const methodError = ref('')
const subjectError = ref('')
const messageError = ref('')

function updateOpen(value) {
  emit('update:open', value)

  if (!value) {
    resetForm()
  } else {
    initializeForm()
  }
}

function resetForm() {
  sendMethod.value = 'email'
  emailSubject.value = ''
  message.value = ''
  includeAttachment.value = true

  methodError.value = ''
  subjectError.value = ''
  messageError.value = ''
}

function initializeForm() {
  if (props.quote) {
    emailSubject.value = `Quote #${props.quote.quoteNumber} from ISP Services`

    // Default message based on customer and quote details
    message.value = `Dear ${props.quote.customer.name},\n\nPlease find attached your quote #${props.quote.quoteNumber} for the services you requested. This quote is valid until ${formatDate(props.quote.validUntil)}.\n\nPlease let us know if you have any questions or would like to proceed.\n\nRegards,\nISP Services Team`
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

  methodError.value = ''
  subjectError.value = ''
  messageError.value = ''

  if (!sendMethod.value) {
    methodError.value = 'Please select a send method'
    isValid = false
  }

  if (sendMethod.value === 'email' && !emailSubject.value.trim()) {
    subjectError.value = 'Email subject is required'
    isValid = false
  }

  if (!message.value.trim()) {
    messageError.value = 'Message is required'
    isValid = false
  }

  return isValid
}

async function sendQuote() {
  if (!props.quote) return

  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    emit('quote-sent', {
      quote: props.quote,
      method: sendMethod.value,
      message: message.value,
      includeAttachment: includeAttachment.value,
      emailSubject: emailSubject.value
    })

    updateOpen(false)
  } catch (error) {
    console.error('Error sending quote:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>