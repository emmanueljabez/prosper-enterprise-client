<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Quote #{{ quote?.quoteNumber }}</DialogTitle>
        <DialogDescription>
          Detailed information about this quote.
        </DialogDescription>
      </DialogHeader>

      <div v-if="quote" class="py-4">
        <!-- Quote Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <Badge :variant="getStatusVariant(quote.status)">
              {{ formatStatus(quote.status) }}
            </Badge>
            <p class="text-sm text-muted-foreground mt-1">
              Created on {{ formatDate(quote.createdAt) }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-muted-foreground">Total Amount</p>
            <p class="text-xl font-bold">{{ formatCurrency(quote.totalAmount, quote.currency) }}</p>
          </div>
        </div>

        <!-- Customer and Quote Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-4">
            <h4 class="text-sm font-medium">Customer Information</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Name:</span>
                <span class="font-medium">{{ quote.customer.name }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Email:</span>
                <span class="font-medium">{{ quote.customer.email }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Phone:</span>
                <span class="font-medium">{{ quote.customer.phone }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Type:</span>
                <span class="font-medium">{{ quote.customer.type === 'business' ? 'Business' : 'Individual' }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-sm font-medium">Quote Information</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Quote #:</span>
                <span class="font-medium">{{ quote.quoteNumber }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Created:</span>
                <span class="font-medium">{{ formatDate(quote.createdAt) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Valid Until:</span>
                <span class="font-medium">{{ formatDate(quote.validUntil) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Currency:</span>
                <span class="font-medium">{{ quote.currency }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Line Items -->
        <div class="space-y-4 mb-6">
          <h4 class="text-sm font-medium">Line Items</h4>
          <div class="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead class="text-right">Qty</TableHead>
                  <TableHead class="text-right">Unit Price</TableHead>
                  <TableHead class="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in quote.items" :key="item.id">
                  <TableCell class="font-medium">{{ item.service }}</TableCell>
                  <TableCell>{{ item.description }}</TableCell>
                  <TableCell class="text-right">{{ item.quantity }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(item.unitPrice, quote.currency) }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(item.total, quote.currency) }}</TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colspan="4" class="text-right font-medium">Total</TableCell>
                  <TableCell class="text-right font-medium">{{ formatCurrency(quote.totalAmount, quote.currency) }}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="quote.notes" class="space-y-4">
          <h4 class="text-sm font-medium">Notes</h4>
          <div class="p-3 bg-muted rounded-md text-sm">
            {{ quote.notes }}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="updateOpen(false)">
          Close
        </Button>
        <Button @click="printQuote">
          <PrinterIcon class="h-4 w-4 mr-2" />
          Print
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { format, parseISO } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PrinterIcon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  quote: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open'])

function updateOpen(value) {
  emit('update:open', value)
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return format(parseISO(dateString), 'dd MMM yyyy')
}

function formatCurrency(amount, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

function formatStatus(status) {
  const statusMap = {
    'draft': 'Draft',
    'sent': 'Sent',
    'accepted': 'Accepted',
    'declined': 'Declined',
    'expired': 'Expired',
    'converted': 'Converted'
  }

  return statusMap[status] || status
}

function getStatusVariant(status) {
  const variantMap = {
    'draft': 'secondary',
    'sent': 'default',
    'accepted': 'success',
    'declined': 'destructive',
    'expired': 'outline',
    'converted': 'primary'
  }

  return variantMap[status] || 'default'
}

function printQuote() {
  window.print()
}
</script>