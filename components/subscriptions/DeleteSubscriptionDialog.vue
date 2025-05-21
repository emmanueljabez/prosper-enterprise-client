<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Delete Subscription</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this subscription? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <div v-if="subscription" class="rounded-md bg-muted p-4">
          <div class="mb-3 flex items-center justify-between">
            <div class="font-medium">{{ subscription.customer.name }}</div>
            <Badge :variant="getStatusVariant(subscription.status)">
              {{ formatStatus(subscription.status) }}
            </Badge>
          </div>
          <div class="text-sm space-y-1">
            <div class="flex items-baseline justify-between">
              <span class="text-muted-foreground">Plan:</span>
              <span>{{ subscription.planName }}</span>
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-muted-foreground">Billing:</span>
              <span>KES {{ formatAmount(subscription.amount) }} / {{ formatBillingCycle(subscription.billingCycle) }}</span>
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-muted-foreground">Start Date:</span>
              <span>{{ formatDate(subscription.startDate) }}</span>
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-muted-foreground">Next Renewal:</span>
              <span :class="isOverdue(subscription.nextRenewalDate) ? 'text-destructive' : ''">
                {{ formatDate(subscription.nextRenewalDate) }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-4 text-sm text-destructive">
          <AlertTriangleIcon class="h-4 w-4 inline-block mr-2" />
          <span>Warning: Deleting this subscription will permanently remove it from the system.</span>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Cancel
        </Button>
        <Button variant="destructive" @click="handleDelete">
          <Loader2Icon v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin" />
          <span v-else>Delete Subscription</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { format, parseISO, isPast } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

const emit = defineEmits(['update:open', 'delete'])

const isDeleting = ref(false)

async function handleDelete() {
  isDeleting.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('delete', props.subscription)
    emit('update:open', false)
  } catch (error) {
    console.error('Error deleting subscription:', error)
  } finally {
    isDeleting.value = false
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

function isOverdue(dateString) {
  if (!dateString) return false
  return isPast(parseISO(dateString))
}
</script>