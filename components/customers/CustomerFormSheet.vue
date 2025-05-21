<template>
  <SheetContent class="sm:max-w-xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle>{{ mode === 'add' ? 'Add New Customer' : 'Edit Customer' }}</SheetTitle>
      <SheetDescription>
        {{ mode === 'add' ? 'Enter details for the new customer.' : 'Update customer information.' }}
      </SheetDescription>
    </SheetHeader>

    <form @submit.prevent="submitCustomer" class="space-y-6 py-6">
      <div class="space-y-4">
        <!-- Customer Type (Individual/Business) -->
        <div class="space-y-2">
          <Label>Customer Type</Label>
          <RadioGroup v-model="formData.customerType" class="flex space-x-4">
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="individual" id="type-individual" />
              <Label for="type-individual" class="font-normal">Individual</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="business" id="type-business" />
              <Label for="type-business" class="font-normal">Business</Label>
            </div>
          </RadioGroup>
        </div>

        <!-- Basic Information -->
        <div class="grid grid-cols-1 gap-4">
          <div class="space-y-2">
            <Label for="name" required>Customer Name</Label>
            <Input
                id="name"
                v-model="formData.name"
                placeholder="Full name"
                :class="{ 'border-destructive': errors.name }"
            />
            <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
          </div>

          <!-- Company Name (only for business customers) -->
          <div v-if="formData.customerType === 'business'" class="space-y-2">
            <Label for="company" required>Company Name</Label>
            <Input
                id="company"
                v-model="formData.company"
                placeholder="Company name"
                :class="{ 'border-destructive': errors.company }"
            />
            <p v-if="errors.company" class="text-sm text-destructive">{{ errors.company }}</p>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="email" required>Email</Label>
            <Input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="email@example.com"
                :class="{ 'border-destructive': errors.email }"
            />
            <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
          </div>
          <div class="space-y-2">
            <Label for="phone" required>Phone</Label>
            <Input
                id="phone"
                v-model="formData.phone"
                placeholder="+254 7XX XXX XXX"
                :class="{ 'border-destructive': errors.phone }"
            />
            <p v-if="errors.phone" class="text-sm text-destructive">{{ errors.phone }}</p>
          </div>
        </div>

        <!-- Address Information -->
        <div class="space-y-4">
          <div>
            <Label class="text-base">Customer Address</Label>
          </div>

          <div class="space-y-2">
            <Label for="street" required>Street Address</Label>
            <Input
                id="street"
                v-model="formData.address.street"
                placeholder="Street address"
                :class="{ 'border-destructive': errors['address.street'] }"
            />
            <p v-if="errors['address.street']" class="text-sm text-destructive">{{ errors['address.street'] }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="city" required>City</Label>
              <Input
                  id="city"
                  v-model="formData.address.city"
                  placeholder="City"
                  :class="{ 'border-destructive': errors['address.city'] }"
              />
              <p v-if="errors['address.city']" class="text-sm text-destructive">{{ errors['address.city'] }}</p>
            </div>
            <div class="space-y-2">
              <Label for="state" required>County</Label>
              <Input
                  id="state"
                  v-model="formData.address.state"
                  placeholder="County"
                  :class="{ 'border-destructive': errors['address.state'] }"
              />
              <p v-if="errors['address.state']" class="text-sm text-destructive">{{ errors['address.state'] }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="zip" required>Postal Code</Label>
              <Input
                  id="zip"
                  v-model="formData.address.zip"
                  placeholder="Postal code"
                  :class="{ 'border-destructive': errors['address.zip'] }"
              />
              <p v-if="errors['address.zip']" class="text-sm text-destructive">{{ errors['address.zip'] }}</p>
            </div>
            <div class="space-y-2">
              <Label for="country" required>Country</Label>
              <Input
                  id="country"
                  v-model="formData.address.country"
                  placeholder="Country"
                  :class="{ 'border-destructive': errors['address.country'] }"
              />
              <p v-if="errors['address.country']" class="text-sm text-destructive">{{ errors['address.country'] }}</p>
            </div>
          </div>
        </div>

        <!-- Customer Status -->
        <div class="space-y-2">
          <Label for="status" required>Status</Label>
          <RadioGroup v-model="formData.status" class="flex space-x-4">
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="active" id="status-active" />
              <Label for="status-active" class="font-normal">Active</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="inactive" id="status-inactive" />
              <Label for="status-inactive" class="font-normal">Inactive</Label>
            </div>
          </RadioGroup>
          <p v-if="errors.status" class="text-sm text-destructive">{{ errors.status }}</p>
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <Textarea
              id="notes"
              v-model="formData.notes"
              placeholder="Customer notes..."
              rows="4"
          />
        </div>
      </div>

      <SheetFooter>
        <Button type="button" variant="outline" @click="$emit('close')">Cancel</Button>
        <Button type="submit" :disabled="isSubmitting">
          <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
          <span>{{ mode === 'add' ? 'Add Customer' : 'Update Customer' }}</span>
        </Button>
      </SheetFooter>
    </form>
  </SheetContent>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  mode: {
    type: String,
    default: 'add',
    validator: (value) => ['add', 'edit'].includes(value)
  },
  customer: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['customer-added', 'customer-updated', 'close'])

// State
const isSubmitting = ref(false)
const errors = ref({})

// Form data
const formData = ref({
  customerType: 'individual',
  name: '',
  company: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Kenya'
  },
  status: 'active',
  notes: ''
})

// Initialize form with customer data if in edit mode
onMounted(() => {
  if (props.mode === 'edit' && props.customer) {
    formData.value = {
      customerType: props.customer.company ? 'business' : 'individual',
      name: props.customer.name || '',
      company: props.customer.company || '',
      email: props.customer.email || '',
      phone: props.customer.phone || '',
      address: {
        street: props.customer.address?.street || '',
        city: props.customer.address?.city || '',
        state: props.customer.address?.state || '',
        zip: props.customer.address?.zip || '',
        country: props.customer.address?.country || 'Kenya'
      },
      status: props.customer.status || 'active',
      notes: props.customer.notes || ''
    }
  }
})

// Validation
function validate() {
  errors.value = {}
  let isValid = true

  if (!formData.value.name.trim()) {
    errors.value.name = 'Name is required'
    isValid = false
  }

  if (formData.value.customerType === 'business' && !formData.value.company.trim()) {
    errors.value.company = 'Company name is required'
    isValid = false
  }

  if (!formData.value.email.trim()) {
    errors.value.email = 'Email is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(formData.value.email)) {
    errors.value.email = 'Please enter a valid email address'
    isValid = false
  }

  if (!formData.value.phone.trim()) {
    errors.value.phone = 'Phone number is required'
    isValid = false
  }

  // Address validation
  if (!formData.value.address.street.trim()) {
    errors.value['address.street'] = 'Street address is required'
    isValid = false
  }

  if (!formData.value.address.city.trim()) {
    errors.value['address.city'] = 'City is required'
    isValid = false
  }

  if (!formData.value.address.state.trim()) {
    errors.value['address.state'] = 'County is required'
    isValid = false
  }

  if (!formData.value.address.zip.trim()) {
    errors.value['address.zip'] = 'Postal code is required'
    isValid = false
  }

  if (!formData.value.address.country.trim()) {
    errors.value['address.country'] = 'Country is required'
    isValid = false
  }

  if (!formData.value.status) {
    errors.value.status = 'Status is required'
    isValid = false
  }

  return isValid
}

async function submitCustomer() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Prepare customer data
    const customerData = {
      id: props.customer?.id || `cust${Date.now()}`,
      name: formData.value.name,
      company: formData.value.customerType === 'business' ? formData.value.company : null,
      email: formData.value.email,
      phone: formData.value.phone,
      address: { ...formData.value.address },
      status: formData.value.status,
      notes: formData.value.notes,
      services: props.customer?.services || [],
      createdAt: props.customer?.createdAt || new Date().toISOString()
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    if (props.mode === 'add') {
      emit('customer-added', customerData)
    } else {
      emit('customer-updated', customerData)
    }

    emit('close')
  } catch (error) {
    console.error('Error saving customer:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>