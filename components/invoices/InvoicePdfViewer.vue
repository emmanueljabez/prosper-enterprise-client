<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="font-semibold">Invoice #{{ invoice?.number }} - PDF Preview</h2>
        <Button variant="ghost" size="icon" @click="$emit('close')">
          <XIcon class="h-5 w-5" />
        </Button>
      </div>

      <!-- PDF content (simulated) -->
      <div class="flex-1 overflow-y-auto p-8 bg-gray-100">
        <div class="bg-white shadow-md rounded-md p-8 max-w-3xl mx-auto">
          <!-- Company header -->
          <div class="flex justify-between items-start mb-8">
            <div>
              <h1 class="text-2xl font-bold text-primary">ISP Kenya</h1>
              <div class="text-sm text-muted-foreground mt-1">
                <p>Nairobi Business Park, Ngong Road</p>
                <p>Nairobi, Kenya</p>
                <p>Tel: +254 700 000 000</p>
                <p>Email: billing@ispkenya.com</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-xl font-semibold">INVOICE</div>
              <div class="text-muted-foreground mt-1">
                <p><span class="font-medium">Invoice Number:</span> {{ invoice?.number }}</p>
                <p><span class="font-medium">Date:</span> {{ formatDate(invoice?.invoiceDate) }}</p>
                <p><span class="font-medium">Due Date:</span> {{ formatDate(invoice?.dueDate) }}</p>
                <p v-if="invoice?.status === 'paid'">
                  <span class="font-medium">Paid Date:</span> {{ formatDate(invoice?.paidDate) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Status badge -->
          <div class="mb-8">
            <Badge
                class="text-base px-3 py-1"
                :variant="invoice?.status === 'paid' ? 'success' :
                       invoice?.status === 'overdue' ? 'destructive' : 'secondary'"
            >
              {{ formatStatus(invoice?.status) }}
            </Badge>
          </div>

          <!-- Bill to -->
          <div class="mb-8">
            <div class="text-muted-foreground mb-1">Bill To:</div>
            <div class="font-semibold text-lg">{{ invoice?.customer?.name }}</div>
            <div v-if="invoice?.customer?.company" class="font-medium">{{ invoice?.customer?.company }}</div>
            <div class="text-muted-foreground mt-1">
              <p>{{ invoice?.customer?.email }}</p>
              <p>{{ invoice?.customer?.phone }}</p>
            </div>
          </div>

          <!-- Invoice items -->
          <table class="w-full mb-8">
            <thead>
            <tr class="border-b border-t">
              <th class="text-left py-2">Description</th>
              <th class="text-center py-2">Qty</th>
              <th class="text-right py-2">Price</th>
              <th class="text-right py-2">Amount</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in invoice?.items" :key="index" class="border-b">
              <td class="py-3">{{ item.description }}</td>
              <td class="text-center py-3">{{ item.quantity }}</td>
              <td class="text-right py-3">{{ formatAmount(item.price) }}</td>
              <td class="text-right py-3">{{ formatAmount(item.total) }}</td>
            </tr>
            </tbody>
          </table>

          <!-- Totals -->
          <div class="w-1/2 ml-auto">
            <div class="flex justify-between py-2">
              <span>Subtotal:</span>
              <span>KES {{ formatAmount(invoice?.subtotal) }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span>VAT ({{ (invoice?.vatRate * 100).toFixed(0) }}%):</span>
              <span>KES {{ formatAmount(invoice?.vatAmount) }}</span>
            </div>
            <div class="flex justify-between py-3 font-bold text-lg">
              <span>Total:</span>
              <span>KES {{ formatAmount(invoice?.total) }}</span>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="invoice?.notes" class="mt-8 pt-4 border-t">
            <div class="font-medium mb-2">Notes:</div>
            <p class="text-muted-foreground">{{ invoice?.notes }}</p>
          </div>

          <!-- Footer -->
          <div class="mt-12 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
            <p>Payment can be made via M-PESA to Till Number: 123456 or Bank Transfer to Account: ISP Kenya, Bank: KCB, A/C: 1234567890</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-4 border-t flex justify-between">
        <Button variant="outline" @click="$emit('close')">
          Close
        </Button>
        <div class="flex gap-2">
          <Button variant="outline">
            <PrinterIcon class="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="default">
            <DownloadIcon class="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { XIcon, DownloadIcon, PrinterIcon } from 'lucide-vue-next'

const props = defineProps({
  invoice: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

// Helper functions
function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

function formatAmount(amount) {
  if (amount === undefined || amount === null) return '0.00'
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatStatus(status) {
  const statusMap = {
    'paid': 'PAID',
    'pending': 'PENDING',
    'overdue': 'OVERDUE'
  }
  return statusMap[status] || status
}
</script>