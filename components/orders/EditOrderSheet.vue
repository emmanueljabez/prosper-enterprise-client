<template>
  <Sheet :open="open" @update:open="updateOpen">
    <SheetContent
        class="sm:max-w-2xl flex flex-col h-full overflow-hidden"
        position="right"
        size="xl"
        @click.stop
    >
      <SheetHeader class="flex-shrink-0">
        <SheetTitle>Edit Order</SheetTitle>
        <SheetDescription>
          Update order details for Order #{{ order?.orderNumber }}.
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto py-6 px-1" @click.stop v-if="order">
        <Form :validation-schema="schema" @submit="handleSubmit" v-slot="{ errors, isSubmitting }">
          <div class="space-y-6">
            <!-- Customer Information (Read-only) -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium">Customer Information</h3>

              <div class="border rounded-md p-3 bg-muted/20">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <p class="text-xs text-muted-foreground">Name</p>
                    <p class="text-sm font-medium">{{ order.customer.name }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Email</p>
                    <p class="text-sm font-medium">{{ order.customer.email }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Phone</p>
                    <p class="text-sm font-medium">{{ order.customer.phone }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Type</p>
                    <p class="text-sm font-medium">{{ order.customer.type === 'business' ? 'Business' : 'Individual' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Details -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium">Order Details</h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="orderDate">Order Date *</Label>
                  <Field name="orderDate" v-slot="{ field }">
                    <Input
                        type="date"
                        v-bind="field"
                        :class="{ 'border-red-500': errors.orderDate }"
                        @click.stop
                    />
                  </Field>
                  <p v-if="errors.orderDate" class="text-sm text-red-500">{{ errors.orderDate }}</p>
                </div>

                <div class="space-y-2">
                  <Label for="status">Order Status *</Label>
                  <Field name="status" v-slot="{ field, handleChange }">
                    <Select
                        :value="field.value"
                        @update:value="handleChange"
                        @click.stop
                    >
                      <SelectTrigger :class="{ 'border-red-500': errors.status }">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent @click.stop>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <p v-if="errors.status" class="text-sm text-red-500">{{ errors.status }}</p>
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

                <div class="space-y-2">
                  <Label for="paymentTerms">Payment Terms *</Label>
                  <Field name="paymentTerms" v-slot="{ field, handleChange }">
                    <Select
                        :value="field.value"
                        @update:value="handleChange"
                        @click.stop
                    >
                      <SelectTrigger :class="{ 'border-red-500': errors.paymentTerms }">
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent @click.stop>
                        <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                        <SelectItem value="net_15">Net 15 Days</SelectItem>
                        <SelectItem value="net_30">Net 30 Days</SelectItem>
                        <SelectItem value="net_60">Net 60 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <p v-if="errors.paymentTerms" class="text-sm text-red-500">{{ errors.paymentTerms }}</p>
                </div>
              </div>
            </div>

            <!-- Services -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium">Products & Services</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="addServiceItem"
                >
                  <PlusIcon class="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div v-for="(item, index) in serviceItems" :key="index" class="border rounded-md p-4 space-y-4">
                <div class="flex items-center justify-between">
                  <Label class="text-sm font-medium">Item {{ index + 1 }}</Label>
                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="h-7 w-7"
                      @click="removeServiceItem(index)"
                      :disabled="serviceItems.length === 1"
                  >
                    <XIcon class="h-4 w-4" />
                  </Button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="space-y-2 md:col-span-2">
                    <Label for="service">Service *</Label>
                    <Select
                        :value="item.service"
                        @update:value="(value) => updateServiceItem(index, value)"
                        @click.stop
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent @click.stop>
                        <SelectItem
                            v-for="service in props.services"
                            :key="service.id"
                            :value="service.id"
                            @click.stop
                        >
                          {{ service.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div class="space-y-2">
                    <Label for="quantity">Quantity *</Label>
                    <Input
                        type="number"
                        min="1"
                        :value="item.quantity"
                        @input="(e) => updateQuantity(index, e.target.value)"
                        @click.stop
                    />
                  </div>
                </div>

                <div class="flex justify-between items-center border-t pt-3">
                  <div>
                    <p class="text-xs text-muted-foreground">{{ getServiceDescription(item.service) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-muted-foreground">Price</p>
                    <p class="text-sm font-medium">{{ formatCurrency(getServicePrice(item.service), formValues.currency) }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-muted/20 p-4 rounded-md">
                <div class="flex justify-between items-center">
                  <span class="font-medium">Total</span>
                  <span class="text-lg font-bold">{{ formatCurrency(totalAmount, formValues.currency) }}</span>
                </div>
              </div>
            </div>

            <!-- Additional Notes -->
            <div class="space-y-2">
              <Label for="notes">Additional Notes (Optional)</Label>
              <Field name="notes" v-slot="{ field }">
                <Textarea
                    id="notes"
                    v-bind="field"
                    rows="3"
                    placeholder="Enter any notes or special instructions for this order..."
                    @click.stop
                />
              </Field>
            </div>

            <!-- Submit Button -->
            <Button type="submit" class="w-full" :disabled="isSubmitting">
              <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              <span>Update Order</span>
            </Button>
          </div>
        </Form>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { object, string, number } from 'yup'
import { v4 as uuidv4 } from 'uuid'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
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
import { Field, Form } from 'vee-validate'
import { Loader2Icon, PlusIcon, XIcon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  },
  services: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:open', 'order-updated'])

// Form Schema validation
const schema = object({
  orderDate: string().required('Order date is required'),
  status: string().required('Status is required'),
  currency: string().required('Currency is required'),
  paymentTerms: string().required('Payment terms is required'),
  notes: string().optional()
})

// Form handling with vee-validate
const { resetForm, handleSubmit, values: formValues } = useForm({
  validationSchema: schema
})

// Service items state
const serviceItems = ref([])
const isSubmitting = ref(false)

// Initialize service items when order changes
watch(() => props.order, (newOrder) => {
  if (newOrder) {
    serviceItems.value = newOrder.services.map(service => ({
      service: service.id,
      quantity: service.quantity
    }))

    resetForm({
      values: {
        orderDate: newOrder.orderDate,
        status: newOrder.status,
        currency: newOrder.currency,
        paymentTerms: newOrder.paymentTerms,
        notes: newOrder.notes || '',
      }
    })
  }
}, { immediate: true })

// Computed properties
const totalAmount = computed(() => {
  return serviceItems.value.reduce((total, item) => {
    const service = props.services.find(s => s.id === item.service)
    if (service) {
      return total + (service.price * item.quantity)
    }
    return total
  }, 0)
})

// Methods
function updateOpen(value) {
  emit('update:open', value)
}

function addServiceItem() {
  serviceItems.value.push({ service: '', quantity: 1 })
}

function removeServiceItem(index) {
  serviceItems.value.splice(index, 1)
}

function updateServiceItem(index, serviceId) {
  serviceItems.value[index].service = serviceId
}

function updateQuantity(index, quantity) {
  serviceItems.value[index].quantity = parseInt(quantity)
}

function getServiceDescription(serviceId) {
  const service = props.services.find(s => s.id === serviceId)
  return service?.description || ''
}

function getServicePrice(serviceId) {
  const service = props.services.find(s => s.id === serviceId)
  return service?.price || 0
}

function formatCurrency(amount, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

// Handle form submission
const onSubmit = handleSubmit(async (values) => {
  // Validate services
  if (serviceItems.value.length === 0 || serviceItems.value.some(item => !item.service)) {
    return
  }

  try {
    isSubmitting.value = true

    // Map selected services to full service objects with quantities
    const selectedServices = serviceItems.value
        .filter(item => item.service)
        .map(item => {
          const service = props.services.find(s => s.id === item.service)
          return {
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            quantity: item.quantity,
            subtotal: service.price * item.quantity
          }
        })

    // Calculate total amount
    const newTotalAmount = selectedServices.reduce((sum, item) => sum + item.subtotal, 0)

    // Determine new balance
    const amountPaid = props.order.amountPaid || 0
    const newBalance = newTotalAmount - amountPaid

    // Update payment status based on the new balance
    let paymentStatus = 'unpaid'
    if (newBalance <= 0) {
      paymentStatus = 'paid'
    } else if (amountPaid > 0) {
      paymentStatus = 'partial'
    }

    // Create the updated order object
    const updatedOrder = {
      ...props.order,
      orderDate: values.orderDate,
      status: values.status,
      currency: values.currency,
      paymentTerms: values.paymentTerms,
      services: selectedServices,
      totalAmount: newTotalAmount,
      balance: newBalance,
      paymentStatus,
      notes: values.notes || null,
      updatedAt: new Date().toISOString()
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('order-updated', updatedOrder)
    updateOpen(false)
  } catch (error) {
    console.error('Error updating order:', error)
  } finally {
    isSubmitting.value = false
  }
})
</script>