<template>
  <Sheet :open="open" @update:open="updateOpen">
    <SheetContent
        class="sm:max-w-2xl flex flex-col h-full overflow-hidden"
        position="right"
        size="xl"
        @click.stop
    >
      <SheetHeader class="flex-shrink-0">
        <SheetTitle>Create New Order</SheetTitle>
        <SheetDescription>
          Create a new customer order. Fields marked with an asterisk (*) are required.
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

            <!-- Customer Address -->
            <div v-if="selectedCustomer && selectedCustomer.addresses && selectedCustomer.addresses.length > 0" class="space-y-4">
              <h3 class="text-sm font-medium">Installation Address</h3>

              <div class="space-y-2">
                <Label for="addressId">Address *</Label>
                <Field name="addressId" v-slot="{ field, handleChange }">
                  <Select
                      :value="field.value"
                      @update:value="handleChange"
                      @click.stop
                  >
                    <SelectTrigger :class="{ 'border-red-500': errors.addressId }">
                      <SelectValue placeholder="Select an address" />
                    </SelectTrigger>
                    <SelectContent @click.stop>
                      <SelectItem
                          v-for="(address, index) in selectedCustomer.addresses"
                          :key="index"
                          :value="address.id"
                          @click.stop
                      >
                        {{ address.street }}, {{ address.city }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <p v-if="errors.addressId" class="text-sm text-red-500">{{ errors.addressId }}</p>
              </div>

              <div v-if="selectedAddress" class="border rounded-md p-3 bg-muted/20">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <p class="text-xs text-muted-foreground">Street</p>
                    <p class="text-sm font-medium">{{ selectedAddress.street }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">City</p>
                    <p class="text-sm font-medium">{{ selectedAddress.city }}</p>
                  </div>
                  <div v-if="selectedAddress.state">
                    <p class="text-xs text-muted-foreground">State/County</p>
                    <p class="text-sm font-medium">{{ selectedAddress.state }}</p>
                  </div>
                  <div v-if="selectedAddress.postalCode">
                    <p class="text-xs text-muted-foreground">Postal Code</p>
                    <p class="text-sm font-medium">{{ selectedAddress.postalCode }}</p>
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
                        id="orderDate"
                        type="date"
                        v-bind="field"
                        :class="{ 'border-red-500': errors.orderDate }"
                        @click.stop
                    />
                  </Field>
                  <p v-if="errors.orderDate" class="text-sm text-red-500">{{ errors.orderDate }}</p>
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
                    @click.stop
                >
                  <PlusIcon class="h-4 w-4 mr-1" />
                  Add Service
                </Button>
              </div>

              <div v-if="serviceItems.length === 0" class="text-center py-8 border rounded-md bg-muted/20">
                <PackageIcon class="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p class="text-sm text-muted-foreground">No services added yet.</p>
                <p class="text-xs text-muted-foreground mt-1">Click "Add Service" to add products or services.</p>
              </div>

              <div v-for="(item, index) in serviceItems" :key="index" class="border rounded-md p-4">
                <div class="flex justify-between items-start mb-4">
                  <Label :for="`service-${index}`" class="text-sm">Service *</Label>
                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6"
                      @click="removeServiceItem(index)"
                      :disabled="serviceItems.length === 1"
                      @click.stop
                  >
                    <XIcon class="h-4 w-4" />
                  </Button>
                </div>

                <div class="space-y-4">
                  <Select
                      :value="item.service"
                      @update:value="(value) => updateServiceItem(index, value)"
                      @click.stop
                  >
                    <SelectTrigger :id="`service-${index}`">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent @click.stop>
                      <SelectItem
                          v-for="service in props.services"
                          :key="service.id"
                          :value="service.id"
                          @click.stop
                      >
                        {{ service.name }} ({{ formatCurrency(service.price) }})
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div v-if="item.service" class="text-sm text-muted-foreground">
                    {{ getServiceDescription(item.service) }}
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <Label :for="`quantity-${index}`" class="text-sm">Quantity</Label>
                      <Input
                          :id="`quantity-${index}`"
                          type="number"
                          :value="item.quantity"
                          @input="(e) => updateQuantity(index, e.target.value)"
                          min="1"
                          @click.stop
                      />
                    </div>
                    <div>
                      <Label class="text-sm">Subtotal</Label>
                      <div class="h-9 px-3 py-1 rounded-md border bg-muted/50 flex items-center">
                        {{ item.service ? formatCurrency(getServicePrice(item.service) * item.quantity) : formatCurrency(0) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="serviceItems.some(item => item.service)" class="flex justify-end space-x-4 items-center border-t pt-4">
                <span class="font-medium">Total:</span>
                <span class="text-lg font-bold">{{ formatCurrency(totalAmount) }}</span>
              </div>
            </div>

            <!-- Additional Notes -->
            <div class="space-y-2">
              <Label for="notes">Notes (Optional)</Label>
              <Field name="notes" v-slot="{ field }">
                <Textarea
                    id="notes"
                    v-bind="field"
                    placeholder="Enter any special instructions or notes for this order..."
                    rows="3"
                    @click.stop
                />
              </Field>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end">
              <Button type="submit" :disabled="isSubmitting">
                <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                <span>Create Order</span>
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useForm, Field } from 'vee-validate'
import * as yup from 'yup'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
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
import { PlusIcon, XIcon, PackageIcon, Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
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

const emit = defineEmits(['update:open', 'order-created'])

// Initialize form validation
const schema = yup.object({
  customerId: yup.string().required('Customer is required'),
  addressId: yup.string().when('customerId', {
    is: (val) => {
      const customer = props.customers.find(c => c.id === val)
      return customer && customer.addresses && customer.addresses.length > 0
    },
    then: () => yup.string().required('Address is required'),
    otherwise: () => yup.string().notRequired()
  }),
  orderDate: yup.string().required('Order date is required'),
  currency: yup.string().required('Currency is required'),
  paymentTerms: yup.string().required('Payment terms are required'),
  notes: yup.string().notRequired()
})

const { resetForm, values } = useForm({
  validationSchema: schema,
  initialValues: {
    customerId: '',
    addressId: '',
    orderDate: new Date().toISOString().split('T')[0],
    currency: 'KES',
    paymentTerms: 'due_on_receipt',
    notes: ''
  }
})

// State
const customerSearch = ref('')
const serviceItems = ref([{ service: '', quantity: 1 }])
const selectedCustomer = ref(null)
const selectedAddress = ref(null)
const isSubmitting = ref(false)

// Computed properties
const filteredCustomers = computed(() => {
  if (!customerSearch.value) {
    return props.customers
  }

  const search = customerSearch.value.toLowerCase()
  return props.customers.filter(customer =>
      customer.name.toLowerCase().includes(search) ||
      (customer.email && customer.email.toLowerCase().includes(search)) ||
      (customer.phone && customer.phone.includes(search))
  )
})

const totalAmount = computed(() => {
  return serviceItems.value.reduce((sum, item) => {
    if (item.service) {
      const service = props.services.find(s => s.id === item.service)
      return sum + (service?.price || 0) * item.quantity
    }
    return sum
  }, 0)
})

// Watch for changes to customerId and addressId
watch(() => values.customerId, (newVal) => {
  if (newVal) {
    selectedCustomer.value = props.customers.find(c => c.id === newVal)
    selectedAddress.value = null
    values.addressId = ''
  } else {
    selectedCustomer.value = null
    selectedAddress.value = null
  }
})

watch(() => values.addressId, (newVal) => {
  if (newVal && selectedCustomer.value) {
    selectedAddress.value = selectedCustomer.value.addresses.find(a => a.id === newVal)
  } else {
    selectedAddress.value = null
  }
})

// Methods
function updateOpen(value) {
  emit('update:open', value)

  if (!value) {
    resetForm()
    serviceItems.value = [{ service: '', quantity: 1 }]
    selectedCustomer.value = null
    selectedAddress.value = null
    customerSearch.value = ''
  }
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

async function handleSubmit(values) {
  // Validate services
  if (serviceItems.value.length === 0 || serviceItems.value.some(item => !item.service)) {
    return
  }

  try {
    isSubmitting.value = true

    // Get customer and address
    const customer = props.customers.find(c => c.id === values.customerId)
    let address = null
    if (values.addressId) {
      address = customer.addresses.find(a => a.id === values.addressId)
    }

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
    const totalAmount = selectedServices.reduce((sum, item) => sum + item.subtotal, 0)

    // Generate a random order ID with ORD-K prefix for Kenya
    const orderId = `ORD-K${Math.floor(10000 + Math.random() * 90000)}`
    const orderNumber = orderId

    // Create the order object
    const order = {
      id: orderId,
      orderNumber,
      customerId: customer.id,
      customer,
      address,
      orderDate: values.orderDate,
      currency: values.currency,
      services: selectedServices,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentTerms: values.paymentTerms,
      totalAmount,
      amountPaid: 0,
      balance: totalAmount,
      notes: values.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('order-created', order)
    updateOpen(false)
  } catch (error) {
    console.error('Error creating order:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>