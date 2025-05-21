<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Order Details</DialogTitle>
        <DialogDescription>
          Detailed information about this order.
        </DialogDescription>
      </DialogHeader>

      <div v-if="order" class="py-4">
        <!-- Order Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold">Order #{{ order.orderNumber }}</h3>
            <p class="text-sm text-muted-foreground">{{ formatDate(order.orderDate) }}</p>
          </div>
          <Badge :variant="getStatusVariant(order.status)">
            {{ formatStatus(order.status) }}
          </Badge>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-2 mb-6">
          <Button
              variant="outline"
              size="sm"
              @click="$emit('update-status', { order, status: 'processing' })"
              :disabled="order.status !== 'pending'"
          >
            <PlayIcon class="h-4 w-4 mr-2" />
            Process Order
          </Button>

          <Button
              variant="outline"
              size="sm"
              @click="$emit('schedule-installation', order)"
              :disabled="order.status === 'cancelled' || order.status === 'completed'"
          >
            <CalendarIcon class="h-4 w-4 mr-2" />
            Schedule Installation
          </Button>

          <Button
              variant="outline"
              size="sm"
              @click="$emit('generate-invoice', order)"
              :disabled="order.status === 'cancelled'"
          >
            <ReceiptIcon class="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>

          <Button
              variant="outline"
              size="sm"
              @click="$emit('update-status', { order, status: 'completed' })"
              :disabled="order.status === 'cancelled' || order.status === 'completed'"
          >
            <CheckCircleIcon class="h-4 w-4 mr-2" />
            Complete Order
          </Button>

          <Button
              variant="outline"
              size="sm"
              @click="$emit('update-status', { order, status: 'cancelled' })"
              :disabled="order.status === 'cancelled' || order.status === 'completed'"
          >
            <XCircleIcon class="h-4 w-4 mr-2" />
            Cancel Order
          </Button>
        </div>

        <!-- Customer Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-4">
            <h4 class="text-sm font-medium">Customer Information</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Name:</span>
                <span class="font-medium">{{ order.customer.name }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Email:</span>
                <span class="font-medium">{{ order.customer.email }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Phone:</span>
                <span class="font-medium">{{ order.customer.phone }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Type:</span>
                <span class="font-medium">{{ order.customer.type === 'business' ? 'Business' : 'Individual' }}</span>
              </div>
            </div>
          </div>

          <div v-if="order.address" class="space-y-4">
            <h4 class="text-sm font-medium">Installation Address</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Street:</span>
                <span class="font-medium">{{ order.address.street }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">City:</span>
                <span class="font-medium">{{ order.address.city }}</span>
              </div>
              <div class="flex justify-between text-sm" v-if="order.address.state">
                <span class="text-muted-foreground">County/State:</span>
                <span class="font-medium">{{ order.address.state }}</span>
              </div>
              <div class="flex justify-between text-sm" v-if="order.address.postalCode">
                <span class="text-muted-foreground">Postal Code:</span>
                <span class="font-medium">{{ order.address.postalCode }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment & Order Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-4">
            <h4 class="text-sm font-medium">Payment Information</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Status:</span>
                <Badge :variant="getPaymentStatusVariant(order.paymentStatus)">
                  {{ formatPaymentStatus(order.paymentStatus) }}
                </Badge>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Total Amount:</span>
                <span class="font-medium">{{ formatCurrency(order.totalAmount, order.currency) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Amount Paid:</span>
                <span class="font-medium">{{ formatCurrency(order.amountPaid, order.currency) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Balance:</span>
                <span class="font-medium">{{ formatCurrency(order.balance, order.currency) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Payment Terms:</span>
                <span class="font-medium">{{ formatPaymentTerms(order.paymentTerms) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Created:</span>
                <span class="font-medium">{{ formatDate(order.createdAt) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Updated:</span>
                <span class="font-medium">{{ formatDate(order.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <div v-if="order.installation" class="space-y-4">
            <h4 class="text-sm font-medium">Installation Information</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Status:</span>
                <Badge variant="outline">
                  {{ formatInstallationStatus(order.installation.status) }}
                </Badge>
              </div>
              <div class="flex justify-between text-sm" v-if="order.installation.scheduledDate">
                <span class="text-muted-foreground">Scheduled Date:</span>
                <span class="font-medium">{{ formatDate(order.installation.scheduledDate) }}</span>
              </div>
              <div class="flex justify-between text-sm" v-if="order.installation.technician">
                <span class="text-muted-foreground">Technician:</span>
                <span class="font-medium">{{ order.installation.technician }}</span>
              </div>
              <div class="flex justify-between text-sm" v-if="order.installation.completedDate">
                <span class="text-muted-foreground">Completed Date:</span>
                <span class="font-medium">{{ formatDate(order.installation.completedDate) }}</span>
              </div>
              <div class="flex justify-between text-sm" v-if="order.installation.notes">
                <span class="text-muted-foreground">Notes:</span>
                <span class="font-medium">{{ order.installation.notes }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="space-y-4 mb-6">
          <h4 class="text-sm font-medium">Order Items</h4>
          <div class="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product/Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead class="text-right">Quantity</TableHead>
                  <TableHead class="text-right">Price</TableHead>
                  <TableHead class="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(item, index) in order.services" :key="index">
                  <TableCell class="font-medium">{{ item.name }}</TableCell>
                  <TableCell>{{ item.description }}</TableCell>
                  <TableCell class="text-right">{{ item.quantity }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(item.price, order.currency) }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(item.subtotal, order.currency) }}</TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan="4" class="text-right font-medium">Total</TableCell>
                  <TableCell class="text-right font-medium">{{ formatCurrency(order.totalAmount, order.currency) }}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>

        <!-- Payment Information -->
        <div class="space-y-4 mb-6">
          <h4 class="text-sm font-medium">Payment Information</h4>
          <div class="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead class="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="!order.payments || order.payments.length === 0">
                  <TableCell colSpan="4" class="text-center py-4 text-muted-foreground">
                    No payment records found.
                  </TableCell>
                </TableRow>
                <TableRow v-for="(payment, index) in order.payments" :key="index">
                  <TableCell>{{ formatDate(payment.date) }}</TableCell>
                  <TableCell>{{ formatPaymentMethod(payment.method) }}</TableCell>
                  <TableCell>{{ payment.reference || 'N/A' }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(payment.amount, order.currency) }}</TableCell>
                </TableRow>
              </TableBody>
              <TableFooter v-if="order.payments && order.payments.length > 0">
                <TableRow>
                  <TableCell colSpan="3" class="text-right font-medium">Total Paid</TableCell>
                  <TableCell class="text-right font-medium">{{ formatCurrency(order.amountPaid, order.currency) }}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>

        <!-- Invoices -->
        <div class="space-y-4 mb-6">
          <h4 class="text-sm font-medium">Invoices</h4>
          <div class="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead class="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="!order.invoices || order.invoices.length === 0">
                  <TableCell colSpan="5" class="text-center py-4 text-muted-foreground">
                    No invoices generated yet.
                  </TableCell>
                </TableRow>
                <TableRow v-for="(invoice, index) in order.invoices" :key="index">
                  <TableCell class="font-medium">{{ invoice.invoiceNumber }}</TableCell>
                  <TableCell>{{ formatDate(invoice.invoiceDate) }}</TableCell>
                  <TableCell>{{ formatDate(invoice.dueDate) }}</TableCell>
                  <TableCell>
                    <Badge :variant="getInvoiceStatusVariant(invoice.status)">
                      {{ formatInvoiceStatus(invoice.status) }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right">{{ formatCurrency(invoice.amount, order.currency) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="order.notes" class="space-y-4">
          <h4 class="text-sm font-medium">Additional Notes</h4>
          <div class="border rounded-md p-4 bg-muted/10">
            <p class="text-sm">{{ order.notes }}</p>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import {
  PlayIcon,
  CalendarIcon,
  ReceiptIcon,
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  order: {
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

function formatDateTime(dateString) {
  if (!dateString) return 'N/A'
  return format(parseISO(dateString), 'dd MMM yyyy, HH:mm')
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
    'pending': 'Pending',
    'processing': 'Processing',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'on_hold': 'On Hold'
  }

  return statusMap[status] || status
}

function getStatusVariant(status) {
  const variantMap = {
    'pending': 'secondary',
    'processing': 'primary',
    'completed': 'success',
    'cancelled': 'destructive',
    'on_hold': 'warning'
  }

  return variantMap[status] || 'default'
}

function formatPaymentStatus(status) {
  const statusMap = {
    'paid': 'Paid',
    'unpaid': 'Unpaid',
    'partial': 'Partial'
  }

  return statusMap[status] || status
}

function getPaymentStatusVariant(status) {
  const variantMap = {
    'paid': 'success',
    'unpaid': 'destructive',
    'partial': 'warning'
  }

  return variantMap[status] || 'default'
}

function formatInvoiceStatus(status) {
  const statusMap = {
    'draft': 'Draft',
    'sent': 'Sent',
    'paid': 'Paid',
    'overdue': 'Overdue',
    'cancelled': 'Cancelled'
  }

  return statusMap[status] || status
}

function getInvoiceStatusVariant(status) {
  const variantMap = {
    'draft': 'secondary',
    'sent': 'primary',
    'paid': 'success',
    'overdue': 'destructive',
    'cancelled': 'destructive'
  }

  return variantMap[status] || 'default'
}

function formatPaymentMethod(method) {
  const methodMap = {
    'cash': 'Cash',
    'bank_transfer': 'Bank Transfer',
    'mobile_money': 'Mobile Money',
    'card': 'Card Payment',
    'check': 'Check'
  }

  return methodMap[method] || method
}

function formatInstallationStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }

  return statusMap[status] || status
}

function formatPaymentTerms(terms) {
  const termsMap = {
    'due_on_receipt': 'Due on Receipt',
    'net_15': 'Net 15 Days',
    'net_30': 'Net 30 Days',
    'net_60': 'Net 60 Days',
    'custom': 'Custom'
  }

  return termsMap[terms] || terms
}
</script>