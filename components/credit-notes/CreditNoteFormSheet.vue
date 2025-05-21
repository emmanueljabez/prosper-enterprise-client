<template>
  <SheetContent class="sm:max-w-2xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle>{{ mode === 'add' ? 'Create Credit Note' : 'Edit Credit Note' }}</SheetTitle>
      <SheetDescription>
        {{ mode === 'add' ? 'Issue a credit note for refunds or invoice adjustments.' : 'Update credit note details.' }}
      </SheetDescription>
    </SheetHeader>

    <form @submit.prevent="submitCreditNote" class="space-y-6 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <!-- Customer Selection -->
          <div class="space-y-2">
            <Label for="customer" required>Customer</Label>
            <Select v-model="formData.customerId" required :disabled="mode === 'edit'">
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

          <!-- Related Invoice (Optional) -->
          <div class="space-y-2">
            <Label for="invoice">Related Invoice (Optional)</Label>
            <Select v-model="formData.invoiceId" :disabled="mode === 'edit'">
              <SelectTrigger id="invoice">
                <SelectValue placeholder="Select an invoice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No related invoice</SelectItem>
                <SelectItem
                    v-for="invoice in customerInvoices"
                    :key="invoice.id"
                    :value="invoice.id"
                >
                  {{ invoice.number }} ({{ formatAmount(invoice.total) }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Credit Note Date -->
          <div class="space-y-2">
            <Label for="creditNoteDate" required>Date</Label>
            <Input
                id="creditNoteDate"
                type="date"
                v-model="formData.date"
                :class="{ 'border-destructive': errors.date }"
                required
            />
            <p v-if="errors.date" class="text-sm text-destructive">{{ errors.date }}</p>
          </div>

          <!-- Reason -->
          <div class="space-y-2">
            <Label for="reason" required>Reason</Label>
            <Select v-model="formData.reason" required>
              <SelectTrigger id="reason" :class="{ 'border-destructive': errors.reason }">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Returned Goods">Returned Goods</SelectItem>
                <SelectItem value="Pricing Error">Pricing Error</SelectItem>
                <SelectItem value="Damaged Product">Damaged Product</SelectItem>
                <SelectItem value="Duplicate Charge">Duplicate Charge</SelectItem>
                <SelectItem value="Service Not Rendered">Service Not Rendered</SelectItem>
                <SelectItem value="Cancelled Service">Cancelled Service</SelectItem>
                <SelectItem value="Quality Issue">Quality Issue</SelectItem>
                <SelectItem value="Goodwill Adjustment">Goodwill Adjustment</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.reason" class="text-sm text-destructive">{{ errors.reason }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Refund Status -->
          <div class="space-y-2">
            <Label for="refundStatus" required>Refund Status</Label>
            <Select v-model="formData.refundStatus" required>
              <SelectTrigger id="refundStatus" :class="{ 'border-destructive': errors.refundStatus }">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="not_applicable">Not Applicable</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.refundStatus" class="text-sm text-destructive">{{ errors.refundStatus }}</p>
          </div>

          <!-- Refund Method (Only if refund is applicable) -->
          <div v-if="formData.refundStatus !== 'not_applicable'" class="space-y-2">
            <Label for="refundMethod" required>Refund Method</Label>
            <Select v-model="formData.refundMethod" required>
              <SelectTrigger id="refundMethod" :class="{ 'border-destructive': errors.refundMethod }">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original_payment_method">Original Payment Method</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="account_credit">Account Credit</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.refundMethod" class="text-sm text-destructive">{{ errors.refundMethod }}</p>
          </div>

          <!-- Refund Date (Only if status is completed) -->
          <div v-if="formData.refundStatus === 'completed'" class="space-y-2">
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

          <!-- Refund Reference -->
          <div v-if="formData.refundStatus !== 'not_applicable'" class="space-y-2">
            <Label for="refundReference">Refund Reference</Label>
            <Input id="refundReference" v-model="formData.refundReference" />
          </div>

          <!-- Notes -->
          <div class="space-y-2">
            <Label for="notes">Notes</Label>
            <Textarea id="notes" v-model="formData.notes" rows="3" />
          </div>
        </div>
      </div>

      <Separator />

      <!-- Line Items -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-medium">Credit Note Items</h3>
          <Button
              type="button"
              variant="outline"
              size="sm"
              @click="addLineItem"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div class="space-y-4">
          <div
              v-for="(item, index) in formData.items"
              :key="index"
              class="grid grid-cols-12 gap-4 items-start border rounded-md p-4 relative"
          >
            <Button
                type="button"
                variant="ghost"
                size="icon"
                class="absolute top-2 right-2 h-6 w-6"
                @click="removeLineItem(index)"
            >
              <XIcon class="h-4 w-4" />
            </Button>

            <div class="col-span-12 md:col-span-6 space-y-2">
              <Label :for="`item-${index}-description`" required>Description</Label>
              <Input
                  :id="`item-${index}-description`"
                  v-model="item.description"
                  :class="{ 'border-destructive': getItemError(index, 'description') }"
                  required
              />
              <p v-if="getItemError(index, 'description')" class="text-sm text-destructive">
                {{ getItemError(index, 'description') }}
              </p>
            </div>

            <div class="col-span-4 md:col-span-2 space-y-2">
              <Label :for="`item-${index}-quantity`" required>Quantity</Label>
              <Input
                  :id="`item-${index}-quantity`"
                  type="number"
                  v-model="item.quantity"
                  min="1"
                  step="1"
                  :class="{ 'border-destructive': getItemError(index, 'quantity') }"
                  required
                  @input="calculateItemTotal(index)"
              />
              <p v-if="getItemError(index, 'quantity')" class="text-sm text-destructive">
                {{ getItemError(index, 'quantity') }}
              </p>
            </div>

            <div class="col-span-4 md:col-span-2 space-y-2">
              <Label :for="`item-${index}-price`" required>Unit Price</Label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-muted-foreground">KES</span>
                <Input
                    :id="`item-${index}-price`"
                    type="number"
                    min="0"
                    step="0.01"
                    v-model="item.price"
                    class="pl-12"
                    :class="{ 'border-destructive': getItemError(index, 'price') }"
                    required
                    @input="calculateItemTotal(index)"
                />
              </div>
              <p v-if="getItemError(index, 'price')" class="text-sm text-destructive">
                {{ getItemError(index, 'price') }}
              </p>
            </div>

            <div class="col-span-4 md:col-span-2 space-y-2">
              <Label :for="`item-${index}-total`">Total</Label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-muted-foreground">KES</span>
                <Input
                    :id="`item-${index}-total`"
                    :value="formatAmount(item.total)"
                    class="pl-12"
                    readonly
                />
              </div>
            </div>
          </div>
        </div>

        <p v-if="errors.items" class="text-sm text-destructive mt-2">{{ errors.items }}</p>
      </div>

      <!-- Totals -->
      <div class="space-y-2 ml-auto w-full max-w-xs">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Subtotal:</span>
          <span>KES {{ formatAmount(calculateSubtotal) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">VAT (16%):</span>
          <span>KES {{ formatAmount(calculateVAT) }}</span>
        </div>
        <div class="flex justify-between font-bold">
          <span>Total:</span>
          <span>KES {{ formatAmount(calculateTotal) }}</span>
        </div>
      </div>

      <SheetFooter>
        <Button type="button" variant="outline" @click="$emit('close')">
          Cancel
        </Button>
        <Button type="submit" :disabled="isSubmitting">
          <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          {{ mode === 'add' ? 'Create Credit Note' : 'Update Credit Note' }}
        </Button>
      </SheetFooter>
    </form>
  </SheetContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  PlusIcon,
  XIcon,
  Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  mode: {
    type: String,
    default: 'add',
    validator: (value) => ['add', 'edit'].includes(value)
  },
  creditNote: {
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

const emit = defineEmits(['credit-note-added', 'credit-note-updated', 'close'])

// Form state
const isSubmitting = ref(false)
const errors = ref({})

// Initial form data
const formData = ref({
  customerId: '',
  invoiceId: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  reason: '',
  refundStatus: 'pending',
  refundMethod: '',
  refundDate: '',
  refundReference: '',
  notes: '',
  items: [
    {
      description: '',
      quantity: 1,
      price: 0,
      total: 0
    }
  ]
})

// Fill form with existing data if in edit mode
if (props.mode === 'edit' && props.creditNote) {
  const cn = props.creditNote
  formData.value = {
    customerId: cn.customer.id,
    invoiceId: cn.invoice ? cn.invoice.id : '',
    date: format(parseISO(cn.date), 'yyyy-MM-dd'),
    reason: cn.reason,
    refundStatus: cn.refundStatus,
    refundMethod: cn.refundMethod || '',
    refundDate: cn.refundDate ? format(parseISO(cn.refundDate), 'yyyy-MM-dd') : '',
    refundReference: cn.refundReference || '',
    notes: cn.notes || '',
    items: cn.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      total: item.total
    }))
  }
}

// Computed properties for customer selection
const businessCustomers = computed(() => {
  return props.customers.filter(customer => customer.type === 'business')
})

const individualCustomers = computed(() => {
  return props.customers.filter(customer => customer.type === 'individual')
})

const hasBusinessCustomers = computed(() => businessCustomers.value.length > 0)
const hasIndividualCustomers = computed(() => individualCustomers.value.length > 0)

// Filter invoices based on selected customer
const customerInvoices = computed(() => {
  if (!formData.value.customerId) return []
  return props.invoices.filter(invoice => invoice.customer.id === formData.value.customerId)
})

// Line item methods
function addLineItem() {
  formData.value.items.push({
    description: '',
    quantity: 1,
    price: 0,
    total: 0
  })
}

function removeLineItem(index) {
  if (formData.value.items.length > 1) {
    formData.value.items.splice(index, 1)
  }
}

function calculateItemTotal(index) {
  const item = formData.value.items[index]
  const quantity = parseFloat(item.quantity) || 0
  const price = parseFloat(item.price) || 0
  item.total = quantity * price
}

function getItemError(index, field) {
  if (!errors.value.itemErrors) return null
  return errors.value.itemErrors[index]?.[field] || null
}

// Calculate totals
const calculateSubtotal = computed(() => {
  return formData.value.items.reduce((sum, item) => {
    return sum + (parseFloat(item.total) || 0)
  }, 0)
})

const calculateVAT = computed(() => {
  return calculateSubtotal.value * 0.16 // 16% VAT
})

const calculateTotal = computed(() => {
  return calculateSubtotal.value + calculateVAT.value
})

// Form validation
function validateForm() {
  const newErrors = {}
  const itemErrors = []

  // Basic validation
  if (!formData.value.customerId) {
    newErrors.customerId = 'Customer is required'
  }

  if (!formData.value.date) {
    newErrors.date = 'Credit note date is required'
  }

  if (!formData.value.reason) {
    newErrors.reason = 'Reason is required'
  }

  if (!formData.value.refundStatus) {
    newErrors.refundStatus = 'Refund status is required'
  }

  if (formData.value.refundStatus !== 'not_applicable' && !formData.value.refundMethod) {
    newErrors.refundMethod = 'Refund method is required'
  }

  if (formData.value.refundStatus === 'completed' && !formData.value.refundDate) {
    newErrors.refundDate = 'Refund date is required for completed refunds'
  }

  // Validate line items
  if (formData.value.items.length === 0) {
    newErrors.items = 'At least one item is required'
  } else {
    let hasItemErrors = false

    formData.value.items.forEach((item, index) => {
      const itemError = {}

      if (!item.description) {
        itemError.description = 'Description is required'
        hasItemErrors = true
      }

      if (!item.quantity || item.quantity <= 0) {
        itemError.quantity = 'Valid quantity is required'
        hasItemErrors = true
      }

      if (item.price < 0) {
        itemError.price = 'Price cannot be negative'
        hasItemErrors = true
      }

      if (Object.keys(itemError).length > 0) {
        itemErrors[index] = itemError
      }
    })

    if (hasItemErrors) {
      newErrors.itemErrors = itemErrors
    }
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Form submission
async function submitCreditNote() {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    // Get selected customer
    const customer = props.customers.find(c => c.id === formData.value.customerId)

    // Get invoice if one is selected
    const invoice = formData.value.invoiceId ?
        props.invoices.find(inv => inv.id === formData.value.invoiceId) : null

    // Calculate totals
    const subtotal = calculateSubtotal.value
    const vatRate = 0.16
    const vatAmount = calculateVAT.value
    const total = calculateTotal.value

    // Create credit note object
    const creditNoteData = {
      id: props.mode === 'edit' && props.creditNote ? props.creditNote.id : `cn${Date.now()}`,
      number: props.mode === 'edit' && props.creditNote ? props.creditNote.number :
          `CN-${format(new Date(), 'yyyy')}-${Math.floor(10000 + Math.random() * 90000)}`,
      customer,
      invoice,
      date: new Date(formData.value.date).toISOString(),
      reason: formData.value.reason,
      refundStatus: formData.value.refundStatus,
      refundMethod: formData.value.refundStatus !== 'not_applicable' ? formData.value.refundMethod : null,
      refundDate: formData.value.refundStatus === 'completed' && formData.value.refundDate ?
          new Date(formData.value.refundDate).toISOString() : null,
      refundReference: formData.value.refundReference || null,
      notes: formData.value.notes,
      items: formData.value.items.map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity),
        price: parseFloat(item.price),
        total: parseFloat(item.quantity) * parseFloat(item.price)
      })),
      subtotal,
      vatRate,
      vatAmount,
      total
    }

    // In a real app, you would make an API call here
    // For now we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 600))

    if (props.mode === 'add') {
      emit('credit-note-added', creditNoteData)
    } else {
      emit('credit-note-updated', creditNoteData)
    }

    emit('close')
  } catch (error) {
    console.error('Error submitting credit note:', error)
    // Handle error
  } finally {
    isSubmitting.value = false
  }
}

// Helper function
function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Watch for changes in refund status
watch(() => formData.value.refundStatus, (newStatus) => {
  if (newStatus === 'not_applicable') {
    formData.value.refundMethod = ''
    formData.value.refundDate = ''
    formData.value.refundReference = ''
  }
})
</script>