<template>
  <SheetContent class="sm:max-w-2xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle>{{ mode === 'add' ? 'Create New Invoice' : 'Edit Invoice' }}</SheetTitle>
      <SheetDescription>
        {{ mode === 'add' ? 'Generate a new invoice for a customer.' : 'Update existing invoice details.' }}
      </SheetDescription>
    </SheetHeader>

    <form @submit.prevent="submitInvoice" class="space-y-6 py-6">
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
                {{ customer.name }} - {{ customer.company }}
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

      <!-- Invoice Dates -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="invoiceDate" required>Invoice Date</Label>
          <Input
              id="invoiceDate"
              type="date"
              v-model="formData.invoiceDate"
              :class="{ 'border-destructive': errors.invoiceDate }"
          />
          <p v-if="errors.invoiceDate" class="text-sm text-destructive">{{ errors.invoiceDate }}</p>
        </div>
        <div class="space-y-2">
          <Label for="dueDate" required>Due Date</Label>
          <Input
              id="dueDate"
              type="date"
              v-model="formData.dueDate"
              :class="{ 'border-destructive': errors.dueDate }"
          />
          <p v-if="errors.dueDate" class="text-sm text-destructive">{{ errors.dueDate }}</p>
        </div>
      </div>

      <!-- Invoice Items -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <Label>Invoice Items</Label>
          <Button type="button" variant="outline" size="sm" @click="addInvoiceItem">
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <Card v-if="formData.items.length === 0">
          <CardContent class="p-4 text-center text-muted-foreground">
            <p>No items added. Click "Add Item" to add an invoice item.</p>
          </CardContent>
        </Card>

        <div v-for="(item, index) in formData.items" :key="index" class="border rounded-md p-4 space-y-4">
          <div class="flex justify-between items-start">
            <Label class="text-sm font-medium">Item {{ index + 1 }}</Label>
            <Button type="button" variant="ghost" size="icon" @click="removeInvoiceItem(index)">
              <XIcon class="h-4 w-4" />
            </Button>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Input
                  id="description"
                  v-model="item.description"
                  placeholder="Item description"
                  :class="{ 'border-destructive': errors[`items.${index}.description`] }"
              />
              <p v-if="errors[`items.${index}.description`]" class="text-sm text-destructive">
                {{ errors[`items.${index}.description`] }}
              </p>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label for="quantity">Quantity</Label>
                <Input
                    id="quantity"
                    type="number"
                    min="1"
                    v-model.number="item.quantity"
                    @input="updateItemTotal(index)"
                    :class="{ 'border-destructive': errors[`items.${index}.quantity`] }"
                />
                <p v-if="errors[`items.${index}.quantity`]" class="text-sm text-destructive">
                  {{ errors[`items.${index}.quantity`] }}
                </p>
              </div>
              <div class="space-y-2">
                <Label for="price">Price (KES)</Label>
                <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    v-model.number="item.price"
                    @input="updateItemTotal(index)"
                    :class="{ 'border-destructive': errors[`items.${index}.price`] }"
                />
                <p v-if="errors[`items.${index}.price`]" class="text-sm text-destructive">
                  {{ errors[`items.${index}.price`] }}
                </p>
              </div>
              <div class="space-y-2">
                <Label for="total">Total (KES)</Label>
                <Input
                    id="total"
                    type="number"
                    disabled
                    :value="item.quantity * item.price"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Totals -->
      <Card v-if="formData.items.length > 0">
        <CardContent class="p-4 space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">Subtotal:</span>
            <span>KES {{ formatAmount(calculateSubtotal) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-muted-foreground">VAT (%):</span>
            <Input
                type="number"
                min="0"
                max="100"
                step="1"
                v-model.number="formData.vatRate"
                class="w-20 text-right"
            />
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted-foreground">VAT Amount:</span>
            <span>KES {{ formatAmount(calculateVatAmount) }}</span>
          </div>
          <div class="flex justify-between font-bold pt-2 border-t">
            <span>Total:</span>
            <span>KES {{ formatAmount(calculateTotal) }}</span>
          </div>
        </CardContent>
      </Card>

      <!-- Notes -->
      <div class="space-y-2">
        <Label for="notes">Notes</Label>
        <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Enter any additional notes for this invoice"
            rows="3"
        />
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <Button type="submit" :disabled="isSubmitting">
          <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
          {{ mode === 'add' ? 'Create Invoice' : 'Update Invoice' }}
        </Button>
      </div>
    </form>
  </SheetContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, parseISO, addDays } from 'date-fns'
import {
  SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@/components/ui/sheet'
import {
  Card, CardContent
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusIcon, XIcon, Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  mode: {
    type: String,
    default: 'add',
    validator: value => ['add', 'edit'].includes(value)
  },
  invoice: {
    type: Object,
    default: null
  },
  customers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['invoice-added', 'invoice-updated', 'close'])

// Form state
const isSubmitting = ref(false)
const errors = ref({})

// Calculate today and default due date (30 days from today)
const today = new Date()
const defaultDueDate = addDays(today, 30)

// Initialize form data
const formData = ref({
  customerId: props.invoice?.customer?.id || '',
  invoiceDate: props.invoice ? format(parseISO(props.invoice.invoiceDate), 'yyyy-MM-dd') : format(today, 'yyyy-MM-dd'),
  dueDate: props.invoice ? format(parseISO(props.invoice.dueDate), 'yyyy-MM-dd') : format(defaultDueDate, 'yyyy-MM-dd'),
  items: props.invoice ? props.invoice.items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    price: item.price
  })) : [],
  vatRate: props.invoice ? props.invoice.vatRate * 100 : 16, // Default 16% VAT for Kenya
  notes: props.invoice?.notes || ''
})

// Computed properties for customers
const businessCustomers = computed(() => {
  return props.customers.filter(customer => customer.company)
})

const individualCustomers = computed(() => {
  return props.customers.filter(customer => !customer.company)
})

const hasBusinessCustomers = computed(() => businessCustomers.value.length > 0)
const hasIndividualCustomers = computed(() => individualCustomers.value.length > 0)

// Computed properties for invoice totals
const calculateSubtotal = computed(() => {
  return formData.value.items.reduce((sum, item) => {
    return sum + (item.quantity * item.price)
  }, 0)
})

const calculateVatAmount = computed(() => {
  return calculateSubtotal.value * (formData.value.vatRate / 100)
})

const calculateTotal = computed(() => {
  return calculateSubtotal.value + calculateVatAmount.value
})

// Methods for handling invoice items
function addInvoiceItem() {
  formData.value.items.push({
    description: '',
    quantity: 1,
    price: 0
  })
}

function removeInvoiceItem(index) {
  formData.value.items.splice(index, 1)
}

function updateItemTotal(index) {
  // This is just to trigger reactivity - the total is computed in the template
  const item = formData.value.items[index]
  if (item.quantity < 1) {
    item.quantity = 1
  }
  if (item.price < 0) {
    item.price = 0
  }
}

// Form validation
function validateForm() {
  const newErrors = {}

  // Validate customer
  if (!formData.value.customerId) {
    newErrors.customerId = 'Please select a customer'
  }

  // Validate dates
  if (!formData.value.invoiceDate) {
    newErrors.invoiceDate = 'Invoice date is required'
  }

  if (!formData.value.dueDate) {
    newErrors.dueDate = 'Due date is required'
  } else if (new Date(formData.value.dueDate) < new Date(formData.value.invoiceDate)) {
    newErrors.dueDate = 'Due date must be after invoice date'
  }

  // Validate items
  if (formData.value.items.length === 0) {
    newErrors.items = 'At least one item is required'
  } else {
    formData.value.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`items.${index}.description`] = 'Description is required'
      }

      if (!item.quantity || item.quantity < 1) {
        newErrors[`items.${index}.quantity`] = 'Quantity must be at least 1'
      }

      if (item.price === undefined || item.price === null || item.price < 0) {
        newErrors[`items.${index}.price`] = 'Price must be 0 or greater'
      }
    })
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Submit form
async function submitInvoice() {
  if (!validateForm()) {
    return
  }

  try {
    isSubmitting.value = true

    // Find the selected customer
    const selectedCustomer = props.customers.find(customer => customer.id === formData.value.customerId)

    // Format the invoice data
    const invoiceData = {
      id: props.invoice?.id || `inv${Date.now()}`,
      number: props.invoice?.number || `INV-${format(new Date(), 'yyyy')}-${Math.floor(Math.random() * 90000) + 10000}`,
      customer: selectedCustomer,
      invoiceDate: new Date(formData.value.invoiceDate).toISOString(),
      dueDate: new Date(formData.value.dueDate).toISOString(),
      paidDate: props.invoice?.paidDate || null,
      status: props.invoice?.status || 'pending',
      items: formData.value.items.map(item => ({
        id: `item${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      })),
      subtotal: calculateSubtotal.value,
      vatRate: formData.value.vatRate / 100,
      vatAmount: calculateVatAmount.value,
      total: calculateTotal.value,
      notes: formData.value.notes
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    if (props.mode === 'add') {
      emit('invoice-added', invoiceData)
    } else {
      emit('invoice-updated', invoiceData)
    }

    emit('close')
  } catch (error) {
    console.error('Error saving invoice:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Helper functions
function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>