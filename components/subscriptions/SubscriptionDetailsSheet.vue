<template>
  <SheetContent class="sm:max-w-xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Subscription Details</SheetTitle>
      <SheetDescription>
        View subscription information and payment history
      </SheetDescription>
    </SheetHeader>

    <div v-if="subscription" class="py-6 space-y-6">
      <!-- Status Banner -->
      <div
          v-if="subscription.status !== 'active'"
          class="rounded-md p-3 text-sm"
          :class="{
          'bg-yellow-50 border border-yellow-200 text-yellow-800': subscription.status === 'trial',
          'bg-red-50 border border-red-200 text-red-800': subscription.status === 'past_due' || subscription.status === 'cancelled',
          'bg-gray-50 border border-gray-200 text-gray-800': subscription.status === 'expired'
        }"
      >
        <div class="flex items-center gap-2">
          <AlertCircleIcon v-if="subscription.status === 'past_due'" class="h-4 w-4" />
          <InfoIcon v-else-if="subscription.status === 'trial'" class="h-4 w-4" />
          <XCircleIcon v-else-if="subscription.status === 'cancelled'" class="h-4 w-4" />
          <ClockIcon v-else class="h-4 w-4" />

          <span>
            <template v-if="subscription.status === 'trial'">
              This subscription is in trial mode and will expire on {{ formatDate(subscription.nextRenewalDate) }}.
            </template>
            <template v-else-if="subscription.status === 'past_due'">
              This subscription is past due. Payment was expected on {{ formatDate(subscription.nextRenewalDate) }}.
            </template>
            <template v-else-if="subscription.status === 'cancelled'">
              This subscription was cancelled on {{ formatDate(subscription.cancelledDate) }}.
            </template>
            <template v-else-if="subscription.status === 'expired'">
              This subscription has expired.
            </template>
          </span>
        </div>
      </div>

      <!-- Subscription Header -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-lg">{{ subscription.customer.name }}</h3>
          <Badge :variant="getStatusVariant(subscription.status)">
            {{ formatStatus(subscription.status) }}
          </Badge>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Plan</p>
            <p class="font-medium">{{ subscription.planName }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Amount</p>
            <p class="text-lg font-medium">KES {{ formatAmount(subscription.amount) }}</p>
            <p class="text-xs text-muted-foreground">Per {{ formatBillingCycle(subscription.billingCycle) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Start Date</p>
            <p>{{ formatDate(subscription.startDate) }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Next Renewal</p>
            <p :class="isOverdue(subscription.nextRenewalDate) ? 'text-destructive' : ''">
              {{ formatDate(subscription.nextRenewalDate) }}
            </p>
            <p class="text-xs text-muted-foreground">{{ getRenewalStatus(subscription.nextRenewalDate) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Payment Method</p>
            <p>{{ formatPaymentMethod(subscription.paymentMethod) }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Auto Renew</p>
            <p>{{ subscription.autoRenew ? 'Yes' : 'No' }}</p>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Customer Information -->
      <div class="space-y-3">
        <h3 class="font-medium">Customer</h3>
        <div class="space-y-2">
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Name:</span>
            <span class="font-medium">{{ subscription.customer.name }}</span>
          </div>
          <div v-if="subscription.customer.company" class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Company:</span>
            <span>{{ subscription.customer.company }}</span>
          </div>
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Email:</span>
            <span>{{ subscription.customer.email }}</span>
          </div>
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Phone:</span>
            <span>{{ subscription.customer.phone }}</span>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Plan Information -->
      <div class="space-y-3">
        <h3 class="font-medium">Plan Details</h3>
        <div class="space-y-2">
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Plan:</span>
            <span class="font-medium">{{ subscription.planName }}</span>
          </div>
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Description:</span>
            <span>{{ subscription.plan.description }}</span>
          </div>
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Features:</span>
            <span>{{ subscription.plan.features.join(', ') }}</span>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Payment History -->
      <div class="space-y-3">
        <h3 class="font-medium">Payment History</h3>
        <div v-if="subscription.paymentHistory.length === 0" class="text-sm text-muted-foreground">
          No payment history available.
        </div>
        <div v-else class="space-y-3">
          <div
              v-for="payment in sortedPaymentHistory"
              :key="payment.id"
              class="border rounded-md p-3"
          >
            <div class="flex justify-between">
              <div>
                <p class="text-sm font-medium">{{ formatDate(payment.date) }}</p>
                <p class="text-xs text-muted-foreground">Invoice: {{ payment.invoiceNumber }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium">KES {{ formatAmount(payment.amount) }}</p>
                <Badge
                    :variant="payment.status === 'paid' ? 'success' : 'destructive'"
                    class="text-xs"
                >
                  {{ payment.status === 'paid' ? 'Paid' : 'Failed' }}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="subscription.notes" class="space-y-3">
        <h3 class="font-medium">Notes</h3>
        <p class="text-sm">{{ subscription.notes }}</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-3 mt-6">
      <Button
          v-if="subscription?.status === 'active' || subscription?.status === 'trial'"
          variant="outline"
          @click="$emit('renew-subscription', subscription)"
      >
        <RepeatIcon class="h-4 w-4 mr-2" />
        Renew
      </Button>
      <Button
          v-if="subscription?.status === 'active' || subscription?.status === 'trial'"
          variant="outline"
          @click="$emit('cancel-subscription', subscription)"
      >
        <XIcon class="h-4 w-4 mr-2" />
        Cancel
      </Button>
      <Button variant="default" @click="$emit('edit-subscription', subscription)">
        <EditIcon class="h-4 w-4 mr-2" />
        Edit
      </Button>
    </div>
  </SheetContent>
</template>

<script setup>
import { computed } from 'vue'
import { format, parseISO, differenceInDays, isPast } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  EditIcon,
  AlertCircleIcon,
  InfoIcon,
  XCircleIcon,
  ClockIcon,
  RepeatIcon,
  XIcon
} from 'lucide-vue-next'

const props = defineProps({
  subscription: {
    type: Object,
    default: null
  }
})

defineEmits(['edit-subscription', 'renew-subscription', 'cancel-subscription', 'close'])

// Sort payment history (newest first)
const sortedPaymentHistory = computed(() => {
  if (!props.subscription?.paymentHistory) return []

  return [...props.subscription.paymentHistory].sort((a, b) =>
      parseISO(b.date) - parseISO(a.date)
  )
})

// Helper functions
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

function formatPaymentMethod(method) {
  const methodMap = {
    'bank_transfer': 'Bank Transfer',
    'mobile_money': 'Mobile Money',
    'credit_card': 'Credit Card',
    'standing_order': 'Standing Order',
    'direct_debit': 'Direct Debit'
  }
  return methodMap[method] || method
}

function isOverdue(dateString) {
  if (!dateString) return false
  return isPast(parseISO(dateString))
}

function getRenewalStatus(dateString) {
  if (!dateString) return ''

  const renewalDate = parseISO(dateString)
  const today = new Date()

  if (isPast(renewalDate)) {
    return 'Overdue'
  }

  const daysUntil = differenceInDays(renewalDate, today)

  if (daysUntil === 0) {
    return 'Today'
  } else if (daysUntil === 1) {
    return 'Tomorrow'
  } else if (daysUntil <= 7) {
    return `In ${daysUntil} days`
  } else if (daysUntil <= 30) {
    return `In ${Math.ceil(daysUntil / 7)} weeks`
  } else {
    return format(renewalDate, 'MMM yyyy')
  }
}
</script>