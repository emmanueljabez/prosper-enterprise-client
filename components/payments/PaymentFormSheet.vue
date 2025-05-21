<template>
  <SheetContent class="sm:max-w-xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle>{{ mode === 'add' ? 'Record New Payment' : 'Edit Payment' }}</SheetTitle>
      <SheetDescription>
        {{ mode === 'add' ? 'Record a payment received from a customer.' : 'Update existing payment details.' }}
      </SheetDescription>
    </SheetHeader>

    <form @submit.prevent="submitPayment" class="space-y-6 py-6">
      <!-- Customer Selection -->
      <div class="space-y-2">
        <Label for="customer" required>Customer</Label>
        <Select v-model="formData.customerId" required>
          <SelectTrigger id="customer" :class="{ 'border-destructive': errors.customerId }">
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup v-if="hasBusinessCustomers">
              <SelectLabel>Business Customers</SelectLabel>
              <SelectItem
                  v-for="customer in businessCustomers"
                  :key="customer.id"
                  :value="customer.id"
              >
                {{ customer.name }} ({{ customer.company }})
              </SelectItem>
            </SelectGroup>

            <SelectGroup v-if="hasIndividualCustomers">
              <SelectLabel>Individual Customers</SelectLabel>
              <SelectItem
                  v-for="customer in individualCustomers"
                  :key="customer.id"
                  :value="customer.id"
              >
                {{ customer.name }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <p v-if="errors.customerId" class="text-sm text-destructive">{{ errors.customerId }}</p>
      </div>

      <!-- Payment Date -->
      <div class="space-y-2">
        <Label for="paymentDate" required>Payment Date</Label>
        <Input
            id="paymentDate"
            type="date"
            v-model="formData.date"
            :class="{ 'border-destructive': errors.date }"
            required
        />
        <p v-if="errors.date" class="text-sm text-destructive">{{ errors.date }}</p>
      </div>

      <!-- Payment Amount -->
      <div class="space-y-2">
        <Label for="amount" required>Amount</Label>
        <div class="relative">
          <span class="absolute left-3 top-2.5 text-muted-foreground">KES</span>
          <Input
              id="amount"
              type="number"
              v-model="formData.amount"
              step="0.01"
              min="0"
              class="pl-12"
              :class="{ 'border-destructive': errors.amount }"
              required
          />
        </div>
        <p v-if="errors.amount" class="text-sm text-destructive">{{ errors.amount }}</p>
      </div>

      <!-- Payment Method -->
      <div class="space-y-2">
        <Label for="method" required>Payment Method</Label>
        <Select v-model="formData.method" required>
          <SelectTrigger id="method" :class="{ 'border-destructive': errors.method }">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="mobile_money">Mobile Money</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
        <p v-if="errors.method" class="text-sm text-destructive">{{ errors.method }}</p>
      </div>

      <!-- Method-specific fields -->
      <!-- Bank Transfer -->
      <div v-if="formData.method === 'bank_transfer'" class="space-y-4">
        <div class="space-y-2">
          <Label for="bank" required>Bank</Label>
          <Input
              id="bank"
              v-model="formData.additionalDetails.bank"
              :class="{ 'border-destructive': getNestedError('additionalDetails.bank') }"
              required
          />
          <p v-if="getNestedError('additionalDetails.bank')" class="text-sm text-destructive">
            {{ getNestedError('additionalDetails.bank') }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="accountNumber" required>Account Number</Label>
          <Input
              id="accountNumber"
              v-model="formData.additionalDetails.accountNumber"
              :class="{ 'border-destructive': getNestedError('additionalDetails.accountNumber') }"
              required
          />
          <p v-if="getNestedError('additionalDetails.accountNumber')" class="text-sm text-destructive">
            {{ getNestedError('additionalDetails.accountNumber') }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="transferId" required>Transfer ID</Label>
          <Input
              id="transferId"
              v-model="formData.additionalDetails.transferId"
              :class="{ 'border-destructive': getNestedError('additionalDetails.transferId') }"
              required
          />
          <p v-if="getNestedError('additionalDetails.transferId')" class="text-sm text-destructive">
            {{ getNestedError('additionalDetails.transferId') }}
          </p>
        </div>
      </div>

      <!-- Mobile Money -->
      <div v-if="formData.method === 'mobile_money'" class="space-y-4">
        <div class="space-y-2">
          <Label for="provider" required>Provider</Label>
          <Select v-model="formData.additionalDetails.provider" required>
            <SelectTrigger
                id="provider"
                :class="{ 'border-destructive': getNestedError('additionalDetails.provider') }"
            >
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M-PESA">M-PESA</SelectItem>
              <SelectItem value="Airtel Money">Airtel Money</SelectItem>
              <SelectItem value="T-Kash">T-Kash</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="getNestedError('additionalDetails.provider')" class="text-sm text-destructive">
            {{ getNestedError('additionalDetails.provider') }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="phoneNumber" required>Phone Number</Label>
          <Input
              id="phoneNumber"
              v-model="formData.additionalDetails.phoneNumber"
              :class="{ 'border-destructive': getNestedError('additionalDetails.phoneNumber') }"
              required
          />
          <p v-if="getNestedError('additionalDetails.phoneNumber')" class="text-sm text-destructive">
            {{ getNestedError('additionalDetails.phoneNumber') }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="transactionId" required>Transaction ID</Label>
          <Input
              id="transactionId"
              v-model="formData.additionalDetails.transactionId"
              :class="{ 'border-destructive': getNestedError('additionalDetails.transactionId') }"
              required
          />
          <p v-if="getNestedError('additionalDetails.transactionId')" class="text-sm text-destructive">
            {{ getNestedError('additionalDetails.transactionId') }}
          </p>
        </div>
      </div>

      <!-- Credit Card -->
      <div v-if="formData.method === 'credit_card'" class="space-y-4">
        <div class="space-y-2">
          <Label for="cardType" required>Card Type</Label>
          <Select v-model="formData.additionalDetails.cardType" required>
            <SelectTrigger
                id="cardType"
                :class="{ 'border-destructive': getNestedError('additionalDetails.cardType') }"
            >
              <SelectValue placeholder="Select card type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Visa">Visa</SelectItem>
              <SelectItem value="Mastercard">Mastercard</SelectItem>
              <SelectItem value="American Express">American Express</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="getNestedError('additionalDetails.cardType')" class="text-sm text-destructive">
            {{ getNestedError('additionalDetails.cardType') }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="lastFourDigits" required>Last Four Digits</Label>
          <Input
              id="lastFourDigits"
              v-model="formData.additionalDetails.lastFourDigits"
              :class="{ 'border-destructive': getNestedError('additionalDetails.lastFourDigits') }"
              maxlength="4"
              required
          />
          <p v-if="getNestedError('additionalDetails.lastFourDigits')" class="text-sm text-destructive">
            {{ getNestedError('additionalDetails.lastFourDigits') }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="authorizationCode" required>Authorization Code</Label>
          <Input
              id="authorizationCode"
              v-model="formData.additionalDetails.authorizationCode"
              :class="{ 'border-destructive': getNestedError('additionalDetails.authorizationCode') }"
              required
          />
          <p v-if="getNestedError('additionalDetails.authorizationCode')" class="text-sm text-destructive">
            {{ getNestedError('additionalDetails.authorizationCode') }}
          </p>
        </div>
      </div>

      <!-- Cash -->
      <div v-if="formData.method === 'cash'" class="space-y-4">
        <div class="space-y-2">
          <Label for="receivedBy" required>Received By</Label>
          <Input
              id="receivedBy"
              v-model="formData.additionalDetails.receivedBy"
              :class="{ 'border-destructive': getNestedError('additionalDetails.receivedBy') }"
              required
          />
          <p v-if="getNestedError('additionalDetails.receivedBy')" class="text-sm text-destructive">
            {{ getNestedError('additionalDetails.receivedBy') }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="location" required>Location</Label>
          <Input
              id="location"
              v-model="formData.additionalDetails.location"
              :class="{ 'border-destructive': getNestedError('additionalDetails.location') }"
              required
          />
          <p v-if="getNestedError('additionalDetails.location')" class="text-sm text-destructive">
            {{ getNestedError('additionalDetails.location') }}
          </p>
        </div>
      </div>

      <!-- Cheque -->
      <div v-if="formData.method === 'cheque'" class="space-y-4">
        <div class="space-y-2">
          <Label for="bank" required>Bank</Label>
          <Input
              id="bank"
              v-model="formData.additionalDetails.bank"
              :class="{ 'border-destructive': getNestedError('additionalDetails.bank') }"
              required
          />
          <p v-if="getNestedError('additionalDetails.bank')" class="text-sm text-destructive">
            {{ getNestedError('additionalDetails.bank') }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="chequeNumber" required>Cheque Number</Label>
          <Input
              id="chequeNumber"
              v-model="formData.additionalDetails.chequeNumber"
              :class="{ 'border-destructive': getNestedError('additionalDetails.chequeNumber') }"
              required
          />
          <p v-if="getNestedError('additionalDetails.chequeNumber')" class="text-sm text-destructive">
            {{ getNestedError('additionalDetails.chequeNumber') }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="clearanceDate">Clearance Date</Label>
          <Input
              id="clearanceDate"
              type="date"
              v-model="formData.additionalDetails.clearanceDate"
              :class="{ 'border-destructive': getNestedError('additionalDetails.clearanceDate') }"
          />
          <p v-if="getNestedError('additionalDetails.clearanceDate')" class="text-sm text-destructive">
            {{ getNestedError('additionalDetails.clearanceDate') }}
          </p>
        </div>
      </div>

      <!-- Reference Number -->
      <div class="space-y-2">
        <Label for="reference" required>Reference Number</Label>
        <Input
            id="reference"
            v-model="formData.reference"
            :class="{ 'border-destructive': errors.reference }"
            required
        />
        <p v-if="errors.reference" class="text-sm text-destructive">{{ errors.reference }}</p>
      </div>

      <!-- Invoice Allocation -->
      <div class="space-y-2">
        <Label for="invoiceId">Allocate to Invoice</Label>
        <Select v-model="formData.invoiceId">
          <SelectTrigger id="invoiceId" :class="{ 'border-destructive': errors.invoiceId }">
            <SelectValue placeholder="(Optional) Link to an invoice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="null">No Invoice (Unallocated Payment)</SelectItem>
            <SelectItem
                v-for="invoice in customerInvoices"
                :key="invoice.id"
                :value="invoice.id"
            >
              {{ invoice.number }} (KES {{ formatAmount(invoice.total) }})
            </SelectItem>
          </SelectContent>
        </Select>
        <p v-if="errors.invoiceId" class="text-sm text-destructive">{{ errors.invoiceId }}</p>
      </div>

      <!-- Notes -->
      <div class="space-y-2">
        <Label for="notes">Notes</Label>
        <Textarea
            id="notes"
            v-model="formData.notes"
            :class="{ 'border-destructive': errors.notes }"
            placeholder="Add any relevant notes about this payment"
            rows="3"
        />
        <p v-if="errors.notes" class="text-sm text-destructive">{{ errors.notes }}</p>
      </div>

      <!-- Actions -->
      <SheetFooter>
        <div class="flex justify-between w-full">
          <Button v-if="mode === 'edit'" type="button" variant="destructive" size="sm" @click="$emit('delete-payment')">
            <TrashIcon class="h-4 w-4 mr-2" />
            Delete
          </Button>
          <div class="space-x-2">
            <Button type="button" variant="outline" @click="$emit('close')">Cancel</Button>
            <Button type="submit" :disabled="isSubmitting">
              <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
              {{ mode === 'add' ? 'Record Payment' : 'Update Payment' }}
            </Button>
          </div>
        </div>
      </SheetFooter>
    </form>
  </SheetContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Loader2Icon, TrashIcon } from 'lucide-vue-next'

const props = defineProps({
  mode: {
    type: String,
    default: 'add',
    validator: value => ['add', 'edit'].includes(value)
  },
  payment: {
    type: Object,
    default: null
  },
  customers: {
    type: Array,
    default: () => []
  },
  invoices: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['payment-added', 'payment-updated', 'delete-payment', 'close'])

// Form state
const isSubmitting = ref(false)
const errors = ref({})

// Form data with defaults
const formData = ref({
  customerId: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  amount: '',
  method: '',
  reference: '',
  invoiceId: null,
  notes: '',
  additionalDetails: {}
})

// Initialize form with payment data if in edit mode
if (props.mode === 'edit' && props.payment) {
  const payment = props.payment

  formData.value = {
    customerId: payment.customer.id,
    date: format(new Date(payment.date), 'yyyy-MM-dd'),
    amount: payment.amount,
    method: payment.method,
    reference: payment.reference,
    invoiceId: payment.invoiceId,
    notes: payment.notes || '',
    additionalDetails: { ...payment.additionalDetails } || {}
  }
}

// Reset additionalDetails when payment method changes
watch(() => formData.value.method, (newMethod) => {
  formData.value.additionalDetails = {}
})

// Filter customers by type
const businessCustomers = computed(() => {
  return props.customers.filter(customer => customer.type === 'business')
})

const individualCustomers = computed(() => {
  return props.customers.filter(customer => customer.type === 'individual')
})

const hasBusinessCustomers = computed(() => businessCustomers.value.length > 0)
const hasIndividualCustomers = computed(() => individualCustomers.value.length > 0)

// Get invoices for the selected customer
const customerInvoices = computed(() => {
  if (!formData.value.customerId) return []

  return props.invoices.filter(invoice =>
      invoice.customer.id === formData.value.customerId &&
      (invoice.status === 'pending' || invoice.status === 'overdue')
  )
})

// Get a nested error message
function getNestedError(path) {
  const parts = path.split('.')
  let current = errors.value

  for (const part of parts) {
    if (!current[part]) return null
    current = current[part]
  }

  return current
}

// Validate form data
function validateForm() {
  const newErrors = {}

  // Basic validations
  if (!formData.value.customerId) {
    newErrors.customerId = 'Customer is required'
  }

  if (!formData.value.date) {
    newErrors.date = 'Payment date is required'
  }

  if (!formData.value.amount || formData.value.amount <= 0) {
    newErrors.amount = 'Amount must be greater than zero'
  }

  if (!formData.value.method) {
    newErrors.method = 'Payment method is required'
  }

  if (!formData.value.reference) {
    newErrors.reference = 'Reference number is required'
  }

  // Method-specific validations
  if (formData.value.method === 'bank_transfer') {
    newErrors.additionalDetails = {}

    if (!formData.value.additionalDetails.bank) {
      newErrors.additionalDetails.bank = 'Bank name is required'
    }

    if (!formData.value.additionalDetails.accountNumber) {
      newErrors.additionalDetails.accountNumber = 'Account number is required'
    }

    if (!formData.value.additionalDetails.transferId) {
      newErrors.additionalDetails.transferId = 'Transfer ID is required'
    }
  }
  else if (formData.value.method === 'mobile_money') {
    newErrors.additionalDetails = {}

    if (!formData.value.additionalDetails.provider) {
      newErrors.additionalDetails.provider = 'Provider is required'
    }

    if (!formData.value.additionalDetails.phoneNumber) {
      newErrors.additionalDetails.phoneNumber = 'Phone number is required'
    }

    if (!formData.value.additionalDetails.transactionId) {
      newErrors.additionalDetails.transactionId = 'Transaction ID is required'
    }
  }
  else if (formData.value.method === 'credit_card') {
    newErrors.additionalDetails = {}

    if (!formData.value.additionalDetails.cardType) {
      newErrors.additionalDetails.cardType = 'Card type is required'
    }

    if (!formData.value.additionalDetails.lastFourDigits) {
      newErrors.additionalDetails.lastFourDigits = 'Last four digits are required'
    }

    if (!formData.value.additionalDetails.authorizationCode) {
      newErrors.additionalDetails.authorizationCode = 'Authorization code is required'
    }
  }
  else if (formData.value.method === 'cash') {
    newErrors.additionalDetails = {}

    if (!formData.value.additionalDetails.receivedBy) {
      newErrors.additionalDetails.receivedBy = 'Received by is required'
    }

    if (!formData.value.additionalDetails.location) {
      newErrors.additionalDetails.location = 'Location is required'
    }
  }
  else if (formData.value.method === 'cheque') {
    newErrors.additionalDetails = {}

    if (!formData.value.additionalDetails.bank) {
      newErrors.additionalDetails.bank = 'Bank name is required'
    }

    if (!formData.value.additionalDetails.chequeNumber) {
      newErrors.additionalDetails.chequeNumber = 'Cheque number is required'
    }
  }

  // Check if there are any errors
  if (Object.keys(newErrors).length === 0) {
    if (newErrors.additionalDetails && Object.keys(newErrors.additionalDetails).length === 0) {
      delete newErrors.additionalDetails
    }
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Form submission
async function submitPayment() {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    // Get selected customer
    const customer = props.customers.find(c => c.id === formData.value.customerId)

    // Get invoice if one is selected
    const invoice = formData.value.invoiceId ?
        props.invoices.find(inv => inv.id === formData.value.invoiceId) : null

    // Create payment object
    const paymentData = {
      id: props.mode === 'edit' && props.payment ? props.payment.id : `pay${Date.now()}`,
      number: props.mode === 'edit' && props.payment ? props.payment.number :
          `PMT-${format(new Date(), 'yyyy')}-${Math.floor(10000 + Math.random() * 90000)}`,
      customer,
      customerId: customer.id,
      date: new Date(formData.value.date).toISOString(),
      amount: parseFloat(formData.value.amount),
      method: formData.value.method,
      reference: formData.value.reference,
      invoiceId: formData.value.invoiceId,
      invoiceNumber: invoice ? invoice.number : null,
      notes: formData.value.notes,
      status: 'completed',
      additionalDetails: { ...formData.value.additionalDetails }
    }

    // In a real app, you would make an API call here
    // For now we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 600))

    if (props.mode === 'add') {
      emit('payment-added', paymentData)
    } else {
      emit('payment-updated', paymentData)
    }

    emit('close')
  } catch (error) {
    console.error('Error submitting payment:', error)
    // Handle error
  } finally {
    isSubmitting.value = false
  }
}

// Helper function
function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>