<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Delete Payment</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this payment? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <div v-if="payment" class="rounded-md bg-muted p-4">
          <div class="mb-3 flex items-center justify-between">
            <div class="font-medium">{{ payment.number }}</div>
            <Badge variant="success">{{ formatAmount(payment.amount) }}</Badge>
          </div>
          <div class="text-sm space-y-1">
            <div class="flex items-baseline justify-between">
              <span class="text-muted-foreground">Customer:</span>
              <span>{{ payment.customer.name }}</span>
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-muted-foreground">Date:</span>
              <span>{{ formatDate(payment.date) }}</span>
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-muted-foreground">Method:</span>
              <span>{{ formatPaymentMethod(payment.method) }}</span>
            </div>
            <div v-if="payment.invoiceNumber" class="flex items-baseline justify-between">
              <span class="text-muted-foreground">Invoice:</span>
              <span>{{ payment.invoiceNumber }}</span>
            </div>
          </div>
        </div>

        <div class="mt-4 text-sm text-destructive">
          <AlertTriangleIcon class="h-4 w-4 inline-block mr-2" />
          <span>Warning: Deleting this payment may affect related invoices and reporting.</span>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Cancel
        </Button>
        <Button variant="destructive" @click="handleDelete">
          <Loader2Icon v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin" />
          <span v-else>Delete Payment</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { format, parseISO } from 'date-fns'
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
  payment: {
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

    emit('delete', props.payment)
    emit('update:open', false)
  } catch (error) {
    console.error('Error deleting payment:', error)
  } finally {
    isDeleting.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

function formatAmount(amount) {
  return `KES ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatPaymentMethod(method) {
  const methodMap = {
    'bank_transfer': 'Bank Transfer',
    'mobile_money': 'Mobile Money',
    'credit_card': 'Credit Card',
    'cash': 'Cash',
    'cheque': 'Cheque'
  }
  return methodMap[method] || method
}
</script>