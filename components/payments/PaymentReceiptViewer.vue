<template>
  <Dialog :open="true" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-3xl print:shadow-none print:border-none">
      <DialogHeader>
        <DialogTitle>Payment Receipt</DialogTitle>
        <DialogDescription>
          Receipt for payment {{ payment.number }}
        </DialogDescription>
      </DialogHeader>

      <div class="p-6 bg-white">
        <div id="receipt" class="space-y-8">
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
              <h2 class="text-xl font-bold text-primary">RECEIPT</h2>
              <p class="font-medium">#{{ payment.number }}</p>
            </div>
          </div>

          <!-- Customer Details -->
          <div class="flex justify-between">
            <div class="space-y-1">
              <h3 class="font-medium">Received From:</h3>
              <p class="font-semibold">{{ payment.customer.name }}</p>
              <p v-if="payment.customer.company">{{ payment.customer.company }}</p>
              <p v-if="payment.customer.address">{{ payment.customer.address }}</p>
              <p>{{ payment.customer.email }}</p>
              <p>{{ payment.customer.phone }}</p>
            </div>
            <div class="space-y-1 text-right">
              <p><span class="font-medium">Date:</span> {{ formatDate(payment.date) }}</p>
              <p><span class="font-medium">Receipt No:</span> {{ payment.number }}</p>
              <p v-if="payment.invoiceNumber">
                <span class="font-medium">Invoice:</span> {{ payment.invoiceNumber }}
              </p>
            </div>
          </div>

          <!-- Payment Details -->
          <div class="border rounded-md overflow-hidden">
            <table class="min-w-full divide-y divide-border">
              <thead>
              <tr class="bg-muted">
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  Amount
                </th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-border">
              <tr>
                <td class="px-6 py-4">
                  <div class="font-medium">
                    Payment received via {{ formatPaymentMethod(payment.method) }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    Reference: {{ payment.reference }}
                  </div>
                  <div v-if="payment.invoiceNumber" class="text-sm text-muted-foreground">
                    For invoice: {{ payment.invoiceNumber }}
                  </div>
                </td>
                <td class="px-6 py-4 text-right font-medium">
                  KES {{ formatAmount(payment.amount) }}
                </td>
              </tr>
              </tbody>
              <tfoot>
              <tr class="bg-muted">
                <th scope="row" class="px-6 py-3 text-right text-sm font-medium">
                  Total Amount Received:
                </th>
                <td class="px-6 py-3 text-right text-sm font-bold">
                  KES {{ formatAmount(payment.amount) }}
                </td>
              </tr>
              </tfoot>
            </table>
          </div>

          <!-- Notes & Signature -->
          <div class="space-y-6">
            <div v-if="payment.notes" class="border-t pt-4">
              <h3 class="font-medium mb-2">Notes:</h3>
              <p class="text-sm">{{ payment.notes }}</p>
            </div>

            <div class="flex justify-between items-end mt-12">
              <div>
                <p class="text-xs text-muted-foreground mt-8">
                  This is a computer-generated receipt and doesn't require a signature.
                </p>
              </div>
              <div class="text-center">
                <div class="border-t border-dashed w-48 mt-8 pt-1">
                  <p class="text-sm font-medium">Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="print">
          <PrinterIcon class="h-4 w-4 mr-2" />
          Print Receipt
        </Button>
        <Button variant="default" @click="$emit('close')">Close</Button>
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
  payment: {
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

function print() {
  window.print()
}
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #receipt, #receipt * {
    visibility: visible;
  }
  #receipt {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}
</style>