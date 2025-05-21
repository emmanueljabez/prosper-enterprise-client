<template>
  <SheetContent class="sm:max-w-xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Payment Details</SheetTitle>
      <SheetDescription>
        View payment information and related invoice
      </SheetDescription>
    </SheetHeader>

    <div v-if="payment" class="py-6 space-y-6">
      <!-- Payment Summary -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-lg">{{ payment.number }}</h3>
          <Badge
              :variant="payment.status === 'completed' ? 'success' : 'secondary'"
          >
            {{ formatStatus(payment.status) }}
          </Badge>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Amount</p>
            <p class="text-lg font-medium">KES {{ formatAmount(payment.amount) }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Date</p>
            <p>{{ formatDate(payment.date) }}</p>
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
            <span class="font-medium">{{ payment.customer.name }}</span>
          </div>
          <div v-if="payment.customer.company" class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Company:</span>
            <span>{{ payment.customer.company }}</span>
          </div>
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Email:</span>
            <span>{{ payment.customer.email }}</span>
          </div>
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Phone:</span>
            <span>{{ payment.customer.phone }}</span>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Payment Method Details -->
      <div class="space-y-3">
        <h3 class="font-medium">Payment Method</h3>

        <div class="space-y-2">
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Method:</span>
            <span>{{ formatPaymentMethod(payment.method) }}</span>
          </div>
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Reference:</span>
            <span>{{ payment.reference }}</span>
          </div>

          <!-- Bank Transfer Details -->
          <template v-if="payment.method === 'bank_transfer' && payment.additionalDetails">
            <div class="text-sm flex items-baseline justify-between">
              <span class="text-muted-foreground">Bank:</span>
              <span>{{ payment.additionalDetails.bank }}</span>
            </div>
            <div class="text-sm flex items-baseline justify-between">
              <span class="text-muted-foreground">Account Number:</span>
              <span>{{ payment.additionalDetails.accountNumber }}</span>
            </div>
            <div class="text-sm flex items-baseline justify-between">
              <span class="text-muted-foreground">Transfer ID:</span>
              <span>{{ payment.additionalDetails.transferId }}</span>
            </div>
          </template>

          <!-- Mobile Money Details -->
          <template v-if="payment.method === 'mobile_money' && payment.additionalDetails">
            <div class="text-sm flex items-baseline justify-between">
              <span class="text-muted-foreground">Provider:</span>
              <span>{{ payment.additionalDetails.provider }}</span>
            </div>
            <div class="text-sm flex items-baseline justify-between">
              <span class="text-muted-foreground">Phone Number:</span>
              <span>{{ payment.additionalDetails.phoneNumber }}</span>
            </div>
            <div class="text-sm flex items-baseline justify-between">
              <span class="text-muted-foreground">Transaction ID:</span>
              <span>{{ payment.additionalDetails.transactionId }}</span>
            </div>
          </template>

          <!-- Credit Card Details -->
          <template v-if="payment.method === 'credit_card' && payment.additionalDetails">
            <div class="text-sm flex items-baseline justify-between">
              <span class="text-muted-foreground">Card Type:</span>
              <span>{{ payment.additionalDetails.cardType }}</span>
            </div>
            <div class="text-sm flex items-baseline justify-between">
              <span class="text-muted-foreground">Last Four Digits:</span>
              <span>{{ payment.additionalDetails.lastFourDigits }}</span>
            </div>
            <div class="text-sm flex items-baseline justify-between">
              <span class="text-muted-foreground">Authorization Code:</span>
              <span>{{ payment.additionalDetails.authorizationCode }}</span>
            </div>
          </template>

          <!-- Cash Details -->
          <template v-if="payment.method === 'cash' && payment.additionalDetails">
            <div class="text-sm flex items-baseline justify-between">
              <span class="text-muted-foreground">Received By:</span>
              <span>{{ payment.additionalDetails.receivedBy }}</span>
            </div>
            <div class="text-sm flex items-baseline justify-between">
              <span class="text-muted-foreground">Location:</span>
              <span>{{ payment.additionalDetails.location }}</span>
            </div>
          </template>

          <!-- Cheque Details -->
          <template v-if="payment.method === 'cheque' && payment.additionalDetails">
            <div class="text-sm flex items-baseline justify-between">
              <span class="text-muted-foreground">Bank:</span>
              <span>{{ payment.additionalDetails.bank }}</span>
            </div>
            <div class="text-sm flex items-baseline justify-between">
              <span class="text-muted-foreground">Cheque Number:</span>
              <span>{{ payment.additionalDetails.chequeNumber }}</span>
            </div>
            <div class="text-sm flex items-baseline justify-between">
              <span class="text-muted-foreground">Clearance Date:</span>
              <span>{{ formatDate(payment.additionalDetails.clearanceDate) }}</span>
            </div>
          </template>
        </div>
      </div>

      <Separator />

      <!-- Invoice Information (if allocated) -->
      <div v-if="payment.invoiceId" class="space-y-3">
        <h3 class="font-medium">Invoice</h3>

        <div class="rounded-md border p-4">
          <div class="flex items-center justify-between mb-2">
            <Button variant="link" class="p-0 h-auto">
              {{ payment.invoiceNumber }}
            </Button>
            <Badge v-if="invoice" :variant="getInvoiceStatusVariant(invoice.status)">
              {{ formatInvoiceStatus(invoice?.status) }}
            </Badge>
          </div>

          <div v-if="invoice" class="text-sm space-y-2">
            <div class="flex items-baseline justify-between">
              <span class="text-muted-foreground">Invoice Date:</span>
              <span>{{ formatDate(invoice.invoiceDate) }}</span>
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-muted-foreground">Due Date:</span>
              <span>{{ formatDate(invoice.dueDate) }}</span>
            </div>
            <div class="flex items-baseline justify-between font-medium">
              <span class="text-muted-foreground">Total:</span>
              <span>KES {{ formatAmount(invoice.total) }}</span>
            </div>
          </div>

          <div v-else class="text-sm text-muted-foreground text-center py-2">
            Invoice details not available
          </div>
        </div>
      </div>
      <div v-else class="space-y-3">
        <div class="flex items-center">
          <AlertCircleIcon class="h-4 w-4 text-amber-500 mr-2" />
          <h3 class="font-medium">Unallocated Payment</h3>
        </div>
        <p class="text-sm text-muted-foreground">
          This payment has not been allocated to any invoice.
        </p>
      </div>

      <!-- Notes -->
      <div v-if="payment.notes" class="space-y-3">
        <h3 class="font-medium">Notes</h3>
        <p class="text-sm">{{ payment.notes }}</p>
      </div>
    </div>

    <!-- Actions -->
    <SheetFooter>
      <div class="flex items-center justify-between w-full">
        <div>
          <Button variant="outline" size="sm" @click="$emit('view-receipt', payment)">
            <FileTextIcon class="h-4 w-4 mr-2" />
            View Receipt
          </Button>
        </div>
        <div class="space-x-2">
          <Button variant="secondary" size="sm" @click="$emit('edit-payment', payment)">
            <EditIcon class="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="default" size="sm" @click="$emit('close')">
            Close
          </Button>
        </div>
      </div>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { format, parseISO } from 'date-fns'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { EditIcon, FileTextIcon, AlertCircleIcon } from 'lucide-vue-next'

const props = defineProps({
  payment: {
    type: Object,
    default: null
  },
  invoice: {
    type: Object,
    default: null
  }
})

defineEmits(['edit-payment', 'view-receipt', 'close'])

// Helper functions
function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

function formatStatus(status) {
  const statusMap = {
    'completed': 'Completed',
    'pending': 'Pending',
    'failed': 'Failed'
  }
  return statusMap[status] || status
}

function formatInvoiceStatus(status) {
  const statusMap = {
    'paid': 'Paid',
    'pending': 'Pending',
    'overdue': 'Overdue'
  }
  return statusMap[status] || status
}

function getInvoiceStatusVariant(status) {
  const variantMap = {
    'paid': 'success',
    'pending': 'secondary',
    'overdue': 'destructive'
  }
  return variantMap[status] || 'secondary'
}
</script>