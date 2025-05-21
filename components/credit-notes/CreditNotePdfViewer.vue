<template>
  <Dialog :open="true" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-4xl print:shadow-none print:border-none">
      <DialogHeader>
        <DialogTitle>Credit Note</DialogTitle>
        <DialogDescription>
          Credit Note {{ creditNote.number }}
        </DialogDescription>
      </DialogHeader>

      <div class="p-6 bg-white">
        <div id="credit-note-pdf" class="space-y-8">
          <!-- Company Header -->
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold">Your Company Name</h1>
              <div class="text-sm text-muted-foreground">
                <p>123 Business Street, Nairobi, Kenya</p>
                <p>Email: accounts@yourcompany.com | Phone: +254 123 456 789</p>
                <p>VAT Reg: KE123456789</p>
              </div>
            </div>
            <div class="text-right">
              <h2 class="text-xl font-bold text-primary">CREDIT NOTE</h2>
              <p class="font-medium">#{{ creditNote.number }}</p>
            </div>
          </div>

          <!-- Customer and Credit Note Details -->
          <div class="flex justify-between">
            <div class="space-y-1">
              <h3 class="font-medium">Customer:</h3>
              <p class="font-semibold">{{ creditNote.customer.name }}</p>
              <p v-if="creditNote.customer.company">{{ creditNote.customer.company }}</p>
              <p v-if="creditNote.customer.address">{{ creditNote.customer.address }}</p>
              <p>{{ creditNote.customer.email }}</p>
              <p>{{ creditNote.customer.phone }}</p>
            </div>
            <div class="space-y-1 text-right">
              <p><span class="font-medium">Date:</span> {{ formatDate(creditNote.date) }}</p>
              <p><span class="font-medium">Credit Note No:</span> {{ creditNote.number }}</p>
              <p v-if="creditNote.invoice">
                <span class="font-medium">Related Invoice:</span> {{ creditNote.invoice.number }}
              </p>
              <p><span class="font-medium">Reason:</span> {{ creditNote.reason }}</p>
            </div>
          </div>

          <!-- Items Table -->
          <div class="border rounded-md overflow-hidden">
            <table class="min-w-full divide-y divide-border">
              <thead>
              <tr class="bg-muted">
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  Unit Price
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  Amount
                </th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-border">
              <tr v-for="(item, index) in creditNote.items" :key="index">
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ item.description }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  {{ item.quantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  {{ formatAmount(item.price) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-medium">
                  {{ formatAmount(item.total) }}
                </td>
              </tr>
              </tbody>
              <tfoot>
              <tr>
                <td colspan="3" class="px-6 py-3 text-right font-medium">
                  Subtotal:
                </td>
                <td class="px-6 py-3 text-right">
                  {{ formatAmount(creditNote.subtotal) }}
                </td>
              </tr>
              <tr>
                <td colspan="3" class="px-6 py-3 text-right font-medium">
                  VAT (16%):
                </td>
                <td class="px-6 py-3 text-right">
                  {{ formatAmount(creditNote.vatAmount) }}
                </td>
              </tr>
              <tr class="font-bold">
                <td colspan="3" class="px-6 py-3 text-right">
                  TOTAL CREDIT:
                </td>
                <td class="px-6 py-3 text-right">
                  {{ formatAmount(creditNote.total) }}
                </td>
              </tr>
              </tfoot>
            </table>
          </div>

          <!-- Refund Details -->
          <div v-if="creditNote.refundStatus !== 'not_applicable'" class="space-y-2">
            <h3 class="font-medium">Refund Details</h3>
            <p><span class="font-medium">Status:</span> {{ formatRefundStatus(creditNote.refundStatus) }}</p>
            <p><span class="font-medium">Method:</span> {{ formatRefundMethod(creditNote.refundMethod) }}</p>
            <p v-if="creditNote.refundDate">
              <span class="font-medium">Refund Date:</span> {{ formatDate(creditNote.refundDate) }}
            </p>
            <p v-if="creditNote.refundReference">
              <span class="font-medium">Reference:</span> {{ creditNote.refundReference }}
            </p>
          </div>

          <!-- Notes -->
          <div v-if="creditNote.notes" class="space-y-2">
            <h3 class="font-medium">Notes</h3>
            <p class="text-sm">{{ creditNote.notes }}</p>
          </div>

          <!-- Terms and Legal -->
          <div class="text-sm text-muted-foreground border-t pt-4">
            <p class="font-medium">Terms & Conditions</p>
            <p>This credit note is issued subject to our standard terms and conditions.</p>
            <p>For further information or queries related to this credit note, please contact our accounts department.</p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="print">
          <PrinterIcon class="h-4 w-4 mr-2" />
          Print Credit Note
        </Button>
        <Button @click="$emit('close')">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
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
import { PrinterIcon } from 'lucide-vue-next'

const props = defineProps({
  creditNote: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMMM dd, yyyy')
}

function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

function print() {
  window.print()
}
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #credit-note-pdf, #credit-note-pdf * {
    visibility: visible;
  }
  #credit-note-pdf {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}
</style>