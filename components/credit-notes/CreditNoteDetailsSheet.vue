<template>
  <SheetContent class="sm:max-w-xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Credit Note Details</SheetTitle>
      <SheetDescription>
        View credit note information and refund status
      </SheetDescription>
    </SheetHeader>

    <div v-if="creditNote" class="py-6 space-y-6">
      <!-- Credit Note Header -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-lg">{{ creditNote.number }}</h3>
          <Badge
              :variant="getRefundStatusBadgeVariant(creditNote.refundStatus)"
          >
            {{ formatRefundStatus(creditNote.refundStatus) }}
          </Badge>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Date</p>
            <p>{{ formatDate(creditNote.date) }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Amount</p>
            <p class="text-lg font-medium">KES {{ formatAmount(creditNote.total) }}</p>
          </div>
        </div>

        <div>
          <p class="text-sm text-muted-foreground">Reason</p>
          <p>{{ creditNote.reason }}</p>
        </div>
      </div>

      <Separator />

      <!-- Customer Information -->
      <div class="space-y-3">
        <h3 class="font-medium">Customer</h3>
        <div class="space-y-2">
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Name:</span>
            <span class="font-medium">{{ creditNote.customer.name }}</span>
          </div>
          <div v-if="creditNote.customer.company" class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Company:</span>
            <span>{{ creditNote.customer.company }}</span>
          </div>
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Email:</span>
            <span>{{ creditNote.customer.email }}</span>
          </div>
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Phone:</span>
            <span>{{ creditNote.customer.phone }}</span>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Original Invoice Information -->
      <div v-if="creditNote.invoice" class="space-y-3">
        <h3 class="font-medium">Related Invoice</h3>
        <div class="space-y-2">
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Invoice Number:</span>
            <span class="font-medium">{{ creditNote.invoice.number }}</span>
          </div>
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Invoice Date:</span>
            <span>{{ formatDate(creditNote.invoice.invoiceDate) }}</span>
          </div>
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Invoice Amount:</span>
            <span>KES {{ formatAmount(creditNote.invoice.total) }}</span>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Items -->
      <div class="space-y-3">
        <h3 class="font-medium">Items</h3>
        <div class="border rounded-md">
          <table class="min-w-full">
            <thead class="bg-muted text-xs uppercase">
            <tr>
              <th class="p-2 text-left">Description</th>
              <th class="p-2 text-right">Qty</th>
              <th class="p-2 text-right">Price</th>
              <th class="p-2 text-right">Total</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-border text-sm">
            <tr v-for="(item, index) in creditNote.items" :key="index" class="hover:bg-muted/50">
              <td class="p-2">{{ item.description }}</td>
              <td class="p-2 text-right">{{ item.quantity }}</td>
              <td class="p-2 text-right">{{ formatAmount(item.price) }}</td>
              <td class="p-2 text-right font-medium">{{ formatAmount(item.total) }}</td>
            </tr>
            </tbody>
            <tfoot class="text-sm border-t">
            <tr>
              <td class="p-2 text-right font-medium" colspan="3">Subtotal:</td>
              <td class="p-2 text-right">{{ formatAmount(creditNote.subtotal) }}</td>
            </tr>
            <tr>
              <td class="p-2 text-right font-medium" colspan="3">VAT (16%):</td>
              <td class="p-2 text-right">{{ formatAmount(creditNote.vatAmount) }}</td>
            </tr>
            <tr class="font-bold">
              <td class="p-2 text-right" colspan="3">Total:</td>
              <td class="p-2 text-right">{{ formatAmount(creditNote.total) }}</td>
            </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Refund Information -->
      <div v-if="creditNote.refundStatus !== 'not_applicable'" class="space-y-3">
        <h3 class="font-medium">Refund Details</h3>
        <div class="space-y-2">
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Status:</span>
            <Badge :variant="getRefundStatusBadgeVariant(creditNote.refundStatus)">
              {{ formatRefundStatus(creditNote.refundStatus) }}
            </Badge>
          </div>
          <div class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Refund Method:</span>
            <span>{{ formatRefundMethod(creditNote.refundMethod) }}</span>
          </div>
          <div v-if="creditNote.refundStatus === 'completed'" class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Refund Date:</span>
            <span>{{ formatDate(creditNote.refundDate) }}</span>
          </div>
          <div v-if="creditNote.refundReference" class="text-sm flex items-baseline justify-between">
            <span class="text-muted-foreground">Reference:</span>
            <span>{{ creditNote.refundReference }}</span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="creditNote.notes" class="space-y-3">
        <h3 class="font-medium">Notes</h3>
        <p class="text-sm">{{ creditNote.notes }}</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 flex justify-end space-x-2">
      <Button variant="outline" @click="$emit('view-pdf', creditNote)">
        <FileTextIcon class="h-4 w-4 mr-2" />
        View PDF
      </Button>
      <Button variant="default" @click="$emit('edit-credit-note', creditNote)">
        <EditIcon class="h-4 w-4 mr-2" />
        Edit
      </Button>
    </div>
  </SheetContent>
</template>

<script setup>
import { format, parseISO } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileTextIcon, EditIcon } from 'lucide-vue-next'

const props = defineProps({
  creditNote: {
    type: Object,
    default: null
  }
})

defineEmits(['edit-credit-note', 'view-pdf', 'close'])

// Helper functions
function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getRefundStatusBadgeVariant(status) {
  const variantMap = {
    'pending': 'outline',
    'processing': 'secondary',
    'completed': 'success',
    'not_applicable': 'secondary'
  }
  return variantMap[status] || 'outline'
}

function formatRefundStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'processing': 'Processing',
    'completed': 'Completed',
    'not_applicable': 'Not Applicable'
  }
  return statusMap[status] || status
}

function formatRefundMethod(method) {
  if (!method) return 'N/A'

  const methodMap = {
    'original_payment_method': 'Original Payment Method',
    'bank_transfer': 'Bank Transfer',
    'mobile_money': 'Mobile Money',
    'account_credit': 'Account Credit'
  }
  return methodMap[method] || method
}
</script>