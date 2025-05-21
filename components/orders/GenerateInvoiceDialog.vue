<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Generate Invoice</DialogTitle>
        <DialogDescription>
          Create an invoice for Order #{{ order?.orderNumber }}.
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="invoiceDate">Invoice Date *</Label>
            <Input
                id="invoiceDate"
                v-model="invoiceDate"
                type="date"
                :class="{ 'border-red-500': errors.invoiceDate }"
                @click.stop
            />
            <p v-if="errors.invoiceDate" class="text-sm text-red-500">{{ errors.invoiceDate }}</p>
          </div>

          <div class="space-y-2">
            <Label for="dueDate">Due Date *</Label>
            <Input
                id="dueDate"
                v-model="dueDate"
                type="date"
                :class="{ 'border-red-500': errors.dueDate }"
                @click.stop
            />
            <p v-if="errors.dueDate" class="text-sm text-red-500">{{ errors.dueDate }}</p>
          </div>

          <div class="space-y-2">
            <Label for="status">Invoice Status *</Label>
            <Select v-model="status">
              <SelectTrigger id="status" :class="{ 'border-red-500': errors.status }">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent @click.stop>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.status" class="text-sm text-red-500">{{ errors.status }}</p>
          </div>

          <div class="space-y-2">
            <Label for="notes">Additional Notes (Optional)</Label>
            <Textarea
                id="notes"
                v-model="notes"
                rows="3"
                placeholder="Enter any additional notes for the invoice..."
                @click.stop
            />
          </div>

          <div class="border rounded-md p-4">
            <h4 class="text-sm font-medium mb-2">Invoice Summary</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Order Total:</span>
                <span class="font-medium">{{ order ? formatCurrency(order.totalAmount, order.currency) : 'N/A' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Amount Paid:</span>
                <span class="font-medium">{{ order ? formatCurrency(order.amountPaid, order.currency) : 'N/A' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Balance Due:</span>
                <span class="font-medium font-bold">{{ order ? formatCurrency(order.balance, order.currency) : 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="updateOpen(false)">Cancel</Button>
        <Button @click="generateInvoice" :disabled="isSubmitting">
          <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          <span>Generate Invoice</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { format, parseISO } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
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
    default: false
  },
  order: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'invoice-generated'])

// State
const invoiceDate = ref(format(new Date(), 'yyyy-MM-dd'))
const dueDate = ref('')
const status = ref('draft')
const notes = ref('')
const isSubmitting = ref(false)
const errors = ref({
  invoiceDate: '',
  dueDate: '',
  status: ''
})

// Methods
function updateOpen(value) {
  emit('update:open', value)

  if (!value) {
    resetForm()
  }
}

function resetForm() {
  invoiceDate.value = format(new Date(), 'yyyy-MM-dd')
  dueDate.value = ''
  status.value = 'draft'
  notes.value = ''
  errors.value = {
    invoiceDate: '',
    dueDate: '',
    status: ''
  }
}

function validate() {
  let isValid = true
  errors.value = {
    invoiceDate: '',
    dueDate: '',
    status: ''
  }

  if (!invoiceDate.value) {
    errors.value.invoiceDate = 'Invoice date is required'
    isValid = false
  }

  if (!dueDate.value) {
    errors.value.dueDate = 'Due date is required'
    isValid = false
  }

  if (!status.value) {
    errors.value.status = 'Status is required'
    isValid = false
  }

  return isValid
}

function formatCurrency(amount, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

async function generateInvoice() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Generate invoice number (format: INV-K12345)
    const invoiceNumber = `INV-K${Math.floor(10000 + Math.random() * 90000)}`

    // Create invoice data
    const invoice = {
      id: `inv-${uuidv4().slice(0, 8)}`,
      invoiceNumber,
      orderId: props.order.id,
      invoiceDate: invoiceDate.value,
      dueDate: dueDate.value,
      status: status.value,
      amount: props.order.balance, // Invoice for remaining balance
      currency: props.order.currency,
      notes: notes.value || null,
      lineItems: props.order.services,
      createdAt: new Date().toISOString()
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('invoice-generated', {
      order: props.order,
      invoice
    })

    updateOpen(false)
  } catch (error) {
    console.error('Error generating invoice:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>