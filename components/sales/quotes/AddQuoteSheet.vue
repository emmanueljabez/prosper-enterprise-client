<template>
  <Sheet :open="open" @update:open="updateOpen">
    <SheetContent
        class="sm:max-w-2xl flex flex-col h-full overflow-hidden"
        position="right"
        size="xl"
        @click.stop
    >
      <SheetHeader class="flex-shrink-0">
        <SheetTitle>Create New Quote</SheetTitle>
        <SheetDescription>
          Create a quote for your customer. Fields marked with an asterisk (*) are required.
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto py-6 px-1" @click.stop>
        <Form :validation-schema="schema" @submit="handleSubmit" v-slot="{ errors, isSubmitting }">
          <div class="space-y-6">
            <!-- Customer Selection -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium">Customer Information</h3>

              <div class="space-y-2">
                <Label for="customerId">Customer *</Label>
                <Field name="customerId" v-slot="{ field, handleChange }">
                  <Select
                      :value="field.value"
                      @update:value="handleChange"
                      @click.stop
                  >
                    <SelectTrigger :class="{ 'border-red-500': errors.customerId }">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent @click.stop>
                      <div class="flex items-center px-2 pb-1">
                        <Input
                            placeholder="Search customers..."
                            v-model="customerSearch"
                            class="h-8"
                            @click.stop
                        />
                      </div>
                      <SelectItem
                          v-for="customer in filteredCustomers"
                          :key="customer.id"
                          :value="customer.id"
                          @click.stop
                      >
                        {{ customer.name }} ({{ customer.type === 'business' ? 'Business' : 'Individual' }})
                      </SelectItem>
                      <div v-if="filteredCustomers.length === 0" class="p-2 text-center text-sm text-muted-foreground">
                        No customers found
                      </div>
                    </SelectContent>
                  </Select>
                </Field>
                <p v-if="errors.customerId" class="text-sm text-red-500">{{ errors.customerId }}</p>
              </div>

              <div v-if="selectedCustomer" class="border rounded-md p-3 bg-muted/20">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <p class="text-xs text-muted-foreground">Name</p>
                    <p class="text-sm font-medium">{{ selectedCustomer.name }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Email</p>
                    <p class="text-sm font-medium">{{ selectedCustomer.email }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Phone</p>
                    <p class="text-sm font-medium">{{ selectedCustomer.phone }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Type</p>
                    <p class="text-sm font-medium">{{ selectedCustomer.type === 'business' ? 'Business' : 'Individual' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quote Details -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium">Quote Details</h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="validUntil">Valid Until *</Label>
                  <Field name="validUntil" v-slot="{ field }">
                    <Input
                        type="date"
                        v-bind="field"
                        :class="{ 'border-red-500': errors.validUntil }"
                        @click.stop
                    />
                  </Field>
                  <p v-if="errors.validUntil" class="text-sm text-red-500">{{ errors.validUntil }}</p>
                </div>

                <div class="space-y-2">
                  <Label for="currency">Currency *</Label>
                  <Field name="currency" v-slot="{ field, handleChange }">
                    <Select
                        :value="field.value"
                        @update:value="handleChange"
                        @click.stop
                    >
                      <SelectTrigger :class="{ 'border-red-500': errors.currency }">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent @click.stop>
                        <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <p v-if="errors.currency" class="text-sm text-red-500">{{ errors.currency }}</p>
                </div>
              </div>
            </div>

            <!-- Line Items -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium">Line Items *</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="addLineItem"
                    @click.stop
                >
                  <PlusIcon class="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <Field name="items" v-slot="{ errorMessage }">
                <div class="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead class="w-[200px]">Service</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead class="w-[80px] text-right">Qty</TableHead>
                        <TableHead class="w-[120px] text-right">Unit Price</TableHead>
                        <TableHead class="w-[120px] text-right">Total</TableHead>
                        <TableHead class="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow v-if="lineItems.length === 0">
                        <TableCell colspan="6" class="h-24 text-center">
                          No items added. Click "Add Item" to add your first line item.
                        </TableCell>
                      </TableRow>

                      <TableRow v-for="(item, index) in lineItems" :key="index">
                        <TableCell>
                          <Select
                              v-model="item.service"
                              @update:modelValue="updateLineItemService(index, $event)"
                              @click.stop
                          >
                            <SelectTrigger class="h-8">
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent @click.stop>
                              <div class="flex items-center px-2 pb-1">
                                <Input
                                    placeholder="Search services..."
                                    v-model="serviceSearch"
                                    class="h-8"
                                    @click.stop
                                />
                              </div>
                              <SelectGroup v-for="group in serviceGroups" :key="group.category">
                                <SelectLabel>{{ formatServiceCategory(group.category) }}</SelectLabel>
                                <SelectItem
                                    v-for="service in group.services"
                                    :key="service.id"
                                    :value="service.id"
                                    @click.stop
                                >
                                  {{ service.name }}
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                              v-model="item.description"
                              placeholder="Description"
                              class="h-8"
                              @click.stop
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                              v-model.number="item.quantity"
                              type="number"
                              min="1"
                              class="h-8 text-right"
                              @input="updateLineItemTotal(index)"
                              @click.stop
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                              v-model.number="item.unitPrice"
                              type="number"
                              min="0"
                              class="h-8 text-right"
                              @input="updateLineItemTotal(index)"
                              @click.stop
                          />
                        </TableCell>
                        <TableCell class="text-right font-medium">
                          {{ formatCurrency(item.total) }}
                        </TableCell>
                        <TableCell>
                          <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              @click="removeLineItem(index)"
                              @click.stop
                              class="h-8 w-8"
                          >
                            <X class="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colspan="4" class="text-right font-medium">Total</TableCell>
                        <TableCell class="text-right font-medium">{{ formatCurrency(totalAmount) }}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
                <p v-if="errorMessage" class="text-sm text-red-500 mt-2">{{ errorMessage }}</p>
              </Field>
            </div>

            <!-- Notes -->
            <div class="space-y-2">
              <Label for="notes">Notes</Label>
              <Field name="notes" v-slot="{ field }">
                <Textarea
                    v-bind="field"
                    placeholder="Add any additional notes or terms..."
                    rows="3"
                    @click.stop
                />
              </Field>
            </div>
          </div>
        </Form>
      </div>

      <!-- Fixed footer with buttons -->
      <div class="border-t p-4 flex justify-end space-x-2 flex-shrink-0 bg-background">
        <Button type="button" variant="outline" @click="cancelForm" @click.stop>
          Cancel
        </Button>
        <Button type="submit" @click="handleSubmit" @click.stop>
          <PlusIcon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          <span>Create Quote</span>
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Form, Field } from 'vee-validate'
import * as yup from 'yup'
import { format, add } from 'date-fns'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
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
  SelectValue,
} from '@/components/ui/select'
import { PlusIcon, X } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  customers: {
    type: Array,
    default: () => []
  },
  services: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:open', 'quote-created'])

// Form state
const isSubmitting = ref(false)
const customerSearch = ref('')
const serviceSearch = ref('')
const lineItems = ref([])

// Create a default valid until date (30 days from now)
const defaultValidUntil = format(add(new Date(), { days: 30 }), 'yyyy-MM-dd')

// Validation schema
const schema = yup.object({
  customerId: yup.string().required('Please select a customer'),
  validUntil: yup.string().required('Valid until date is required'),
  currency: yup.string().required('Currency is required'),
  items: yup.array().min(1, 'Add at least one line item').of(
      yup.object({
        service: yup.string().required(),
        description: yup.string().required(),
        quantity: yup.number().required().min(1, 'Quantity must be at least 1'),
        unitPrice: yup.number().required().min(0, 'Unit price must be at least 0')
      })
  )
})

// Computed properties
const filteredCustomers = computed(() => {
  const search = customerSearch.value.toLowerCase().trim()
  if (!search) return props.customers

  return props.customers.filter(customer =>
      customer.name.toLowerCase().includes(search) ||
      customer.email.toLowerCase().includes(search)
  )
})

const selectedCustomer = computed(() => {
  const form = document.querySelector('form')
  if (!form) return null

  const customerId = form.elements.customerId?.value
  if (!customerId) return null

  return props.customers.find(c => c.id === customerId)
})

const filteredServices = computed(() => {
  const search = serviceSearch.value.toLowerCase().trim()
  if (!search) return props.services

  return props.services.filter(service =>
      service.name.toLowerCase().includes(search) ||
      service.description?.toLowerCase().includes(search)
  )
})

const serviceGroups = computed(() => {
  const services = filteredServices.value
  const groups = {}

  services.forEach(service => {
    const category = service.category || 'other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(service)
  })

  return Object.entries(groups).map(([category, services]) => ({
    category,
    services
  }))
})

const totalAmount = computed(() => {
  return lineItems.value.reduce((sum, item) => sum + item.total, 0)
})

// Methods
function updateOpen(value) {
  emit('update:open', value)
  if (!value) {
    resetForm()
  }
}

function cancelForm() {
  updateOpen(false)
}

function resetForm() {
  lineItems.value = []
  customerSearch.value = ''
  serviceSearch.value = ''
  isSubmitting.value = false
}

function formatCurrency(amount, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency || 'KES',
    minimumFractionDigits: 0
  }).format(amount || 0)
}

function formatServiceCategory(category) {
  const categories = {
    'internet': 'Internet Services',
    'tv': 'TV Services',
    'voice': 'Voice Services',
    'cloud': 'Cloud Services',
    'installation': 'Installation & Setup',
    'equipment': 'Equipment'
  }

  return categories[category] || 'Other Services'
}

function addLineItem() {
  lineItems.value.push({
    service: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
  })
}

function removeLineItem(index) {
  lineItems.value.splice(index, 1)
}

function updateLineItemService(index, serviceId) {
  const service = props.services.find(s => s.id === serviceId)
  if (service) {
    lineItems.value[index].description = service.description || ''
    lineItems.value[index].unitPrice = service.price || 0
    updateLineItemTotal(index)
  }
}

function updateLineItemTotal(index) {
  const item = lineItems.value[index]
  item.total = (item.quantity || 0) * (item.unitPrice || 0)
}

async function handleSubmit() {
  if (lineItems.value.length === 0) {
    return
  }

  try {
    isSubmitting.value = true

    // Get form values
    const form = document.querySelector('form')
    const customerId = form.elements.customerId.value
    const validUntil = form.elements.validUntil.value
    const currency = form.elements.currency.value
    const notes = form.elements.notes.value

    // Generate a random quote number with KE prefix for Kenya
    const quoteNumber = `QUO-K${Math.floor(10000 + Math.random() * 90000)}`

    // Create the quote object
    const quote = {
      id: quoteNumber,
      quoteNumber,
      customer: props.customers.find(c => c.id === customerId),
      status: 'draft',
      totalAmount: totalAmount.value,
      currency,
      validUntil,
      createdAt: new Date().toISOString(),
      items: lineItems.value.map(item => ({
        id: `item-${Math.random().toString(36).substring(2, 11)}`,
        service: props.services.find(s => s.id === item.service)?.name || item.service,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      }))
    }

    if (notes) {
      quote.notes = notes
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('quote-created', quote)
    updateOpen(false)
  } catch (error) {
    console.error('Error creating quote:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Initialize with blank line item
onMounted(() => {
  addLineItem()
})
</script>