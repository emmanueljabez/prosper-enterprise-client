<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Renew Subscription</DialogTitle>
        <DialogDescription>
          Extend this subscription for another billing cycle.
        </DialogDescription>
      </DialogHeader>

      <div v-if="subscription" class="py-4 space-y-4">
        <!-- Subscription Details -->
        <div class="rounded-md bg-muted p-4">
          <div class="mb-3 space-y-2">
            <div class="flex items-center justify-between">
              <div class="font-medium">{{ subscription.customer.name }}</div>
              <Badge :variant="getStatusVariant(subscription.status)">
                {{ formatStatus(subscription.status) }}
              </Badge>
            </div>
            <div class="text-sm">
              <div><span class="text-muted-foreground">Plan:</span> {{ subscription.planName }}</div>
              <div><span class="text-muted-foreground">Amount:</span> KES {{ formatAmount(subscription.amount) }}</div>
              <div><span class="text-muted-foreground">Billing Cycle:</span> {{ formatBillingCycle(subscription.billingCycle) }}</div>
            </div>
          </div>

          <div class="text-sm space-y-1">
            <div class="flex items-baseline justify-between">
              <span class="text-muted-foreground">Current End Date:</span>
              <span>{{ formatDate(subscription.nextRenewalDate) }}</span>
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-muted-foreground">New End Date:</span>
              <span class="font-medium">{{ formatDate(calculatedNewEndDate) }}</span>
            </div>
          </div>
        </div>

        <!-- Renewal Options -->
        <div class="space-y-4">
          <!-- Duration adjustment -->
          <div class="space-y-2">
            <Label>Renewal Duration</Label>
            <div class="flex space-x-2">
              <Select v-model="renewalCycles">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="1">1 Cycle</SelectItem>
                  <SelectItem :value="2">2 Cycles</SelectItem>
                  <SelectItem :value="3">3 Cycles</SelectItem>
                  <SelectItem :value="4">4 Cycles</SelectItem>
                </SelectContent>
              </Select>
              <div class="text-sm py-2 px-3 border rounded-md bg-background">
                {{ formatBillingCycle(subscription.billingCycle) }}{{ renewalCycles > 1 ? 's' : '' }}
              </div>
            </div>
          </div>

          <!-- Apply discount -->
          <div class="flex items-center space-x-2">
            <Switch id="applyDiscount" v-model="applyDiscount" />
            <Label for="applyDiscount">Apply Discount</Label>
          </div>

          <!-- Discount amount (if enabled) -->
          <div v-if="applyDiscount" class="space-y-2">
            <Label for="discountPercentage">Discount Percentage</Label>
            <div class="flex">
              <Input
                  id="discountPercentage"
                  v-model="discountPercentage"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full"
              />
              <div class="px-3 py-2 border border-l-0 rounded-r-md text-muted-foreground">%</div>
            </div>
          </div>
        </div>

        <!-- Payment Summary -->
        <div class="border rounded-md p-3 space-y-2">
          <h3 class="font-medium">Payment Summary</h3>
          <div class="text-sm space-y-1">
            <div class="flex justify-between">
              <span>Base Amount:</span>
              <span>KES {{ formatAmount(baseAmount) }}</span>
            </div>
            <div v-if="applyDiscount" class="flex justify-between text-green-600">
              <span>Discount ({{ discountPercentage }}%):</span>
              <span>- KES {{ formatAmount(discountAmount) }}</span>
            </div>
            <div class="flex justify-between font-medium pt-1 border-t">
              <span>Total:</span>
              <span>KES {{ formatAmount(totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Send receipt -->
        <div class="flex items-center space-x-2">
          <Switch id="sendReceipt" v-model="sendReceipt" />
          <Label for="sendReceipt">Send receipt to customer</Label>
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <Textarea
              id="notes"
              v-model="notes"
              placeholder="Add any notes about this renewal"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Cancel
        </Button>
        <Button @click="handleRenew" :disabled="isRenewing">
          <Loader2Icon v-if="isRenewing" class="h-4 w-4 mr-2 animate-spin" />
          <span v-else>Renew Subscription</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format, parseISO, addMonths, addYears } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  subscription: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'renew'])

// Form state
const isRenewing = ref(false)
const renewalCycles = ref(1)
const applyDiscount = ref(false)
const discountPercentage = ref(5)
const sendReceipt = ref(true)
const notes = ref('')

// Calculate new end date based on current renewal date and billing cycle
const calculatedNewEndDate = computed(() => {
  if (!props.subscription) return null

  const currentEndDate = parseISO(props.subscription.nextRenewalDate)
  const billingCycle = props.subscription.billingCycle
  const cycles = renewalCycles.value

  if (billingCycle === 'monthly') {
    return addMonths(currentEndDate, 1 * cycles)
  } else if (billingCycle === 'quarterly') {
    return addMonths(currentEndDate, 3 * cycles)
  } else if (billingCycle === 'semi-annually') {
    return addMonths(currentEndDate, 6 * cycles)
  } else if (billingCycle === 'annually') {
    return addYears(currentEndDate, 1 * cycles)
  }

  return currentEndDate
})

// Calculate payment amounts
const baseAmount = computed(() => {
  if (!props.subscription) return 0
  return props.subscription.amount * renewalCycles.value
})

const discountAmount = computed(() => {
  if (!applyDiscount.value) return 0
  return baseAmount.value * (discountPercentage.value / 100)
})

const totalAmount = computed(() => {
  return baseAmount.value - discountAmount.value
})

// Handler for renewal
async function handleRenew() {
  if (!props.subscription) return

  isRenewing.value = true

  try {
    // Prepare renewal data
    const renewalData = {
      subscriptionId: props.subscription.id,
      customer: props.subscription.customer,
      renewalDate: new Date().toISOString(),
      endDate: calculatedNewEndDate.value.toISOString(),
      cycles: renewalCycles.value,
      baseAmount: baseAmount.value,
      discount: applyDiscount.value ? discountPercentage.value : 0,
      totalAmount: totalAmount.value,
      sendReceipt: sendReceipt.value,
      notes: notes.value
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('renew', renewalData)
    emit('update:open', false)
  } catch (error) {
    console.error('Error renewing subscription:', error)
  } finally {
    isRenewing.value = false
  }
}

// Helper functions
function formatDate(dateString) {
  if (!dateString) return ''
  return format(typeof dateString === 'string' ? parseISO(dateString) : dateString, 'MMM dd, yyyy')
}

function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getStatusVariant(status) {
  const variantMap = {
    'active': 'success',
    'trial': 'secondary',
    'past_due': 'warning',
    'cancelled': 'destructive',
    'expired': 'outline'
  }
  return variantMap[status] || 'default'
}

function formatStatus(status) {
  const statusMap = {
    'active': 'Active',
    'trial': 'Trial',
    'past_due': 'Past Due',
    'cancelled': 'Cancelled',
    'expired': 'Expired'
  }
  return statusMap[status] || status
}

function formatBillingCycle(cycle) {
  const cycleMap = {
    'monthly': 'Month',
    'quarterly': 'Quarter',
    'semi-annually': '6 Months',
    'annually': 'Year'
  }
  return cycleMap[cycle] || cycle
}
</script>