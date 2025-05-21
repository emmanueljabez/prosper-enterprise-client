<template>
  <SheetContent class="sm:max-w-2xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle>{{ mode === 'add' ? 'New Subscription' : 'Edit Subscription' }}</SheetTitle>
      <SheetDescription>
        {{ mode === 'add' ? 'Create a new subscription for a customer.' : 'Update subscription details.' }}
      </SheetDescription>
    </SheetHeader>

    <form @submit.prevent="submitSubscription" class="space-y-6 py-6">
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

          <!-- Plan Selection -->
          <div class="space-y-2">
            <Label for="plan" required>Subscription Plan</Label>
            <Select v-model="formData.planId" required>
              <SelectTrigger id="plan" :class="{ 'border-destructive': errors.planId }">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                    v-for="plan in plans"
                    :key="plan.id"
                    :value="plan.id"
                >
                  {{ plan.name }} - KES {{ formatAmount(plan.amount) }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.planId" class="text-sm text-destructive">{{ errors.planId }}</p>
          </div>

          <!-- Billing Cycle -->
          <div class="space-y-2">
            <Label for="billingCycle" required>Billing Cycle</Label>
            <Select v-model="formData.billingCycle" required>
              <SelectTrigger id="billingCycle" :class="{ 'border-destructive': errors.billingCycle }">
                <SelectValue placeholder="Select billing cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="semi-annually">Semi-Annually (6 months)</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.billingCycle" class="text-sm text-destructive">{{ errors.billingCycle }}</p>
          </div>

          <!-- Custom Amount (Calculated from Plan or Custom) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="amount" required>Amount</Label>
              <div class="flex items-center space-x-2">
                <Label
                    for="useCustomAmount"
                    class="text-xs cursor-pointer"
                >Custom amount</Label>
                <Switch
                    id="useCustomAmount"
                    v-model="useCustomAmount"
                />
              </div>
            </div>
            <Input
                id="amount"
                v-model="formData.amount"
                type="number"
                :disabled="!useCustomAmount"
                min="0"
                step="0.01"
                required
                :class="{ 'border-destructive': errors.amount }"
            />
            <p class="text-xs text-muted-foreground">
              {{ useCustomAmount ? 'Custom amount per billing cycle' : 'Amount from selected plan' }}
            </p>
            <p v-if="errors.amount" class="text-sm text-destructive">{{ errors.amount }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Start Date -->
          <div class="space-y-2">
            <Label for="startDate" required>Start Date</Label>
            <Input
                id="startDate"
                v-model="formData.startDate"
                type="date"
                required
                :class="{ 'border-destructive': errors.startDate }"
            />
            <p v-if="errors.startDate" class="text-sm text-destructive">{{ errors.startDate }}</p>
          </div>

          <!-- Status -->
          <div class="space-y-2">
            <Label for="status" required>Status</Label>
            <Select v-model="formData.status" required>
              <SelectTrigger id="status" :class="{ 'border-destructive': errors.status }">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.status" class="text-sm text-destructive">{{ errors.status }}</p>
          </div>

          <!-- Auto Renew -->
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Switch id="autoRenew" v-model="formData.autoRenew" />
              <Label for="autoRenew">Auto Renew</Label>
            </div>
            <p class="text-xs text-muted-foreground">
              Automatically renew this subscription at the end of each billing cycle
            </p>
          </div>

          <!-- Payment Method -->
          <div class="space-y-2">
            <Label for="paymentMethod" required>Payment Method</Label>
            <Select v-model="formData.paymentMethod" required>
              <SelectTrigger id="paymentMethod" :class="{ 'border-destructive': errors.paymentMethod }">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="standing_order">Standing Order</SelectItem>
                <SelectItem value="direct_debit">Direct Debit</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.paymentMethod" class="text-sm text-destructive">{{ errors.paymentMethod }}</p>
          </div>

          <!-- Notes -->
          <div class="space-y-2">
            <Label for="notes">Notes</Label>
            <Textarea
                id="notes"
                v-model="formData.notes"
                placeholder="Add any additional details about this subscription"
            />
          </div>
        </div>
      </div>

      <!-- Selected Plan Preview -->
      <div v-if="selectedPlan" class="border rounded-md bg-muted/50 p-4 mt-6">
        <h4 class="font-medium mb-2">Selected Plan: {{ selectedPlan.name }}</h4>
        <div class="text-sm text-muted-foreground">{{ selectedPlan.description }}</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <p class="text-sm font-medium">Features:</p>
            <ul class="text-sm list-disc list-inside">
              <li v-for="feature in selectedPlan.features" :key="feature">{{ feature }}</li>
            </ul>
          </div>
          <div>
            <p class="text-sm font-medium">Regular Price:</p>
            <p>KES {{ formatAmount(selectedPlan.amount) }} per month</p>
            <p v-if="formData.billingCycle && formData.billingCycle !== 'monthly'" class="text-sm mt-1">
              <span class="font-medium">{{ formatBillingCycle(formData.billingCycle) }} Price:</span>
              KES {{ formatAmount(calculateCycleTotalPrice()) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-2">
        <Button type="button" variant="outline" @click="$emit('close')">
          Cancel
        </Button>
        <Button type="submit" :disabled="isSubmitting">
          <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
          {{ mode === 'add' ? 'Create Subscription' : 'Update Subscription' }}
        </Button>
      </div>
    </form>
  </SheetContent>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { format } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  mode: {
    type: String,
    default: 'add', // 'add' or 'edit'
    validator: (value) => ['add', 'edit'].includes(value)
  },
  subscription: {
    type: Object,
    default: null
  },
  customers: {
    type: Array,
    default: () => []
  },
  plans: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'subscription-added',
  'subscription-updated',
  'close'
])

// Form state
const isSubmitting = ref(false)
const errors = ref({})
const useCustomAmount = ref(false)

// Filter customers for better selection UI
const businessCustomers = computed(() =>
    props.customers.filter(customer => customer.company)
)

const individualCustomers = computed(() =>
    props.customers.filter(customer => !customer.company)
)

const hasBusinessCustomers = computed(() => businessCustomers.value.length > 0)
const hasIndividualCustomers = computed(() => individualCustomers.value.length > 0)

// Get selected plan details
const selectedPlan = computed(() => {
  if (!formData.value.planId) return null
  return props.plans.find(plan => plan.id === formData.value.planId)
})

// Initialize form data
const formData = ref({
  customerId: '',
  planId: '',
  billingCycle: 'monthly',
  amount: '',
  startDate: format(new Date(), 'yyyy-MM-dd'),
  status: 'active',
  autoRenew: true,
  paymentMethod: 'bank_transfer',
  notes: ''
})

// If editing, populate form with subscription data
if (props.mode === 'edit' && props.subscription) {
  formData.value = {
    customerId: props.subscription.customer.id,
    planId: props.subscription.plan.id,
    billingCycle: props.subscription.billingCycle,
    amount: props.subscription.amount,
    startDate: props.subscription.startDate ? format(new Date(props.subscription.startDate), 'yyyy-MM-dd') : '',
    status: props.subscription.status,
    autoRenew: props.subscription.autoRenew,
    paymentMethod: props.subscription.paymentMethod,
    notes: props.subscription.notes || ''
  }

  // Check if amount differs from plan amount
  useCustomAmount.value = props.subscription.amount !== props.subscription.plan.amount
}

// Update amount when plan changes
watch(() => formData.value.planId, (newPlanId) => {
  if (!useCustomAmount.value && newPlanId) {
    const plan = props.plans.find(p => p.id === newPlanId)
    if (plan) {
      formData.value.amount = plan.amount
    }
  }
})

// Update amount when billing cycle changes
watch(() => formData.value.billingCycle, () => {
  if (!useCustomAmount.value && formData.value.planId) {
    formData.value.amount = calculateCycleTotalPrice()
  }
})

// Calculate total price based on billing cycle
function calculateCycleTotalPrice() {
  if (!selectedPlan.value) return 0

  let multiplier = 1

  switch (formData.value.billingCycle) {
    case 'monthly':
      multiplier = 1
      break
    case 'quarterly':
      multiplier = 3
      break
    case 'semi-annually':
      multiplier = 6
      break
    case 'annually':
      multiplier = 12
      break
  }

  // Apply discount for longer billing cycles
  let discount = 0
  if (formData.value.billingCycle === 'quarterly') {
    discount = 0.05 // 5% discount
  } else if (formData.value.billingCycle === 'semi-annually') {
    discount = 0.10 // 10% discount
  } else if (formData.value.billingCycle === 'annually') {
    discount = 0.15 // 15% discount
  }

  const basePrice = selectedPlan.value.amount * multiplier
  return basePrice * (1 - discount)
}

// Validate form
function validateForm() {
  const newErrors = {}

  if (!formData.value.customerId) {
    newErrors.customerId = 'Customer is required'
  }

  if (!formData.value.planId) {
    newErrors.planId = 'Subscription plan is required'
  }

  if (!formData.value.billingCycle) {
    newErrors.billingCycle = 'Billing cycle is required'
  }

  if (!formData.value.amount || formData.value.amount <= 0) {
    newErrors.amount = 'Amount must be greater than zero'
  }

  if (!formData.value.startDate) {
    newErrors.startDate = 'Start date is required'
  }

  if (!formData.value.status) {
    newErrors.status = 'Status is required'
  }

  if (!formData.value.paymentMethod) {
    newErrors.paymentMethod = 'Payment method is required'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Submit form
async function submitSubscription() {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    // Find customer and plan objects
    const customer = props.customers.find(c => c.id === formData.value.customerId)
    const plan = props.plans.find(p => p.id === formData.value.planId)

    if (!customer || !plan) {
      throw new Error('Customer or plan not found')
    }

    // Prepare subscription data
    const subscriptionData = {
      id: props.mode === 'edit' ? props.subscription.id : `sub-${Date.now()}`,
      customer,
      plan,
      planName: plan.name,
      startDate: new Date(formData.value.startDate).toISOString(),
      status: formData.value.status,
      billingCycle: formData.value.billingCycle,
      amount: parseFloat(formData.value.amount),
      paymentMethod: formData.value.paymentMethod,
      autoRenew: formData.value.autoRenew,
      notes: formData.value.notes,
    }

    // Calculate next renewal date
    const startDate = new Date(formData.value.startDate)
    const nextRenewalDate = new Date(startDate)

    if (formData.value.billingCycle === 'monthly') {
      nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1)
    } else if (formData.value.billingCycle === 'quarterly') {
      nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 3)
    } else if (formData.value.billingCycle === 'semi-annually') {
      nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 6)
    } else if (formData.value.billingCycle === 'annually') {
      nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1)
    }

    subscriptionData.nextRenewalDate = nextRenewalDate.toISOString()

    // For edit mode, preserve existing payment history and cancelled date
    if (props.mode === 'edit') {
      subscriptionData.paymentHistory = props.subscription.paymentHistory || []
      subscriptionData.cancelledDate = props.subscription.cancelledDate || null
    } else {
      subscriptionData.paymentHistory = []
      subscriptionData.cancelledDate = null
    }

    // In a real app, you would make an API call here
    // For now we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 600))

    if (props.mode === 'add') {
      emit('subscription-added', subscriptionData)
    } else {
      emit('subscription-updated', subscriptionData)
    }

    emit('close')
  } catch (error) {
    console.error('Error submitting subscription:', error)
    // Handle error
  } finally {
    isSubmitting.value = false
  }
}

// Helper functions
function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatBillingCycle(cycle) {
  const cycleMap = {
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'semi-annually': 'Semi-Annual',
    'annually': 'Annual'
  }
  return cycleMap[cycle] || cycle
}
</script>