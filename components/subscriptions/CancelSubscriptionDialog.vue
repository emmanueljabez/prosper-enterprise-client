<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogDescription>
          Cancel this subscription. This will end recurring billing.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleCancel" class="py-4 space-y-4">
        <div v-if="subscription" class="rounded-md bg-muted p-4">
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
              <div><span class="text-muted-foreground">Next Renewal:</span> {{ formatDate(subscription.nextRenewalDate) }}</div>
            </div>
          </div>
        </div>

        <!-- Cancellation Options -->
        <div class="space-y-4">
          <!-- Cancellation Type -->
          <div class="space-y-2">
            <Label for="cancellationType">Cancellation Type</Label>
            <Select v-model="cancellationType" required>
              <SelectTrigger id="cancellationType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate (Cancel Now)</SelectItem>
                <SelectItem value="end_of_period">End of Current Period</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              {{ cancellationTypeDescription }}
            </p>
          </div>

          <!-- Cancellation Date -->
          <div v-if="showCustomDate" class="space-y-2">
            <Label for="cancellationDate">Cancellation Date</Label>
            <Input
                id="cancellationDate"
                v-model="cancellationDate"
                type="date"
                :min="today"
                :max="maxDate"
                required
            />
          </div>

          <!-- Reason for Cancellation -->
          <div class="space-y-2">
            <Label for="reason">Reason for Cancellation</Label>
            <Select v-model="reason" required>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="too_expensive">Too Expensive</SelectItem>
                <SelectItem value="switching_service">Switching to Another Service</SelectItem>
                <SelectItem value="not_using">Not Using the Service</SelectItem>
                <SelectItem value="missing_features">Missing Features</SelectItem>
                <SelectItem value="bad_support">Unsatisfactory Support</SelectItem>
                <SelectItem value="business_closed">Business Closed/Changed</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Additional Information -->
          <div class="space-y-2">
            <Label for="additionalInfo">Additional Information</Label>
            <Textarea
                id="additionalInfo"
                v-model="additionalInfo"
                placeholder="Please provide any additional details about the cancellation"
                rows="3"
            />
          </div>

          <!-- Offer Options -->
          <div class="space-y-2">
            <Label>Retention Offer</Label>
            <RadioGroup v-model="retentionOffer">
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="no_offer" value="none" />
                <Label for="no_offer">No retention offer</Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="discount" value="discount" />
                <Label for="discount">Offer 20% discount for 3 months</Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="downgrade" value="downgrade" />
                <Label for="downgrade">Offer plan downgrade</Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="pause" value="pause" />
                <Label for="pause">Offer to pause subscription</Label>
              </div>
            </RadioGroup>
          </div>

          <!-- Notify Customer -->
          <div class="flex items-center space-x-2">
            <Switch id="notifyCustomer" v-model="notifyCustomer" />
            <Label for="notifyCustomer">Notify customer about cancellation</Label>
          </div>
        </div>

        <div class="bg-destructive/10 rounded-md p-3 text-sm text-destructive">
          <AlertTriangleIcon class="h-4 w-4 inline-block mr-2" />
          <span>This cancellation will stop all future recurring charges for this subscription.</span>
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" @click="$emit('update:open', false)">
            Cancel
          </Button>
          <Button variant="destructive" type="submit" :disabled="isSubmitting">
            <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
            <span v-else>Confirm Cancellation</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format, parseISO, addMonths, formatISO } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import { AlertTriangleIcon, Loader2Icon } from 'lucide-vue-next'

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

const emit = defineEmits(['update:open', 'cancel'])

// Form state
const isSubmitting = ref(false)
const cancellationType = ref('end_of_period')
const cancellationDate = ref('')
const reason = ref('')
const additionalInfo = ref('')
const retentionOffer = ref('none')
const notifyCustomer = ref(true)
const showCustomDate = ref(false)

// Date formatting for input fields
const today = formatISO(new Date(), { representation: 'date' })
const maxDate = computed(() => {
  if (!props.subscription) return today

  const renewalDate = parseISO(props.subscription.nextRenewalDate)
  return formatISO(renewalDate, { representation: 'date' })
})

// Help text based on cancellation type
const cancellationTypeDescription = computed(() => {
  if (cancellationType.value === 'immediate') {
    return 'Cancel the subscription immediately. No more charges will be applied.'
  } else {
    return 'The subscription will be active until the end of the current billing period, then it will be cancelled.'
  }
})

async function handleCancel() {
  isSubmitting.value = true

  try {
    // Prepare cancellation data
    const effectiveDate = cancellationType.value === 'immediate' ?
        new Date().toISOString() : props.subscription.nextRenewalDate

    const cancellationData = {
      id: props.subscription.id,
      cancellationType: cancellationType.value,
      effectiveDate,
      reason: reason.value,
      additionalInfo: additionalInfo.value,
      retentionOfferMade: retentionOffer.value,
      notifyCustomer: notifyCustomer.value
    }

    // In a real app, you would make an API call here
    // For now we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('cancel', cancellationData)
    emit('update:open', false)
  } catch (error) {
    console.error('Error cancelling subscription:', error)
  } finally {
    isSubmitting.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM dd, yyyy')
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