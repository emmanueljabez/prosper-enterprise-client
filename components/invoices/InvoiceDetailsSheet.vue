<template>
  <SheetContent class="sm:max-w-2xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Invoice Details</SheetTitle>
      <SheetDescription>
        View information for invoice #{{ invoice?.number }}
      </SheetDescription>
    </SheetHeader>

    <div v-if="!invoice" class="flex justify-center items-center py-12">
      <Loader2Icon class="h-8 w-8 animate-spin text-primary" />
    </div>

    <div v-else class="space-y-6 py-6">
      <!-- Invoice Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <Badge
              :variant="invoice.status === 'paid' ? 'success' :
                     invoice.status === 'overdue' ? 'destructive' : 'secondary'"
          >
            {{ formatStatus(invoice.status) }}
          </Badge>
          <span v-if="invoice.status === 'paid'" class="text-sm text-muted-foreground">
            Paid on {{ formatDate(invoice.paidDate) }}
          </span>
          <span v-else-if="invoice.status === 'overdue'" class="text-sm text-destructive">
            Due {{ formatDate(invoice.dueDate) }}
          </span>
          <span v-else class="text-sm text-muted-foreground">
            Due {{ formatDate(invoice.dueDate) }}
          </span>
        </div>
        <div class="flex items-center space-x-2">
          <Button size="sm" variant="outline" @click="$emit('edit-invoice', invoice)">
            <EditIcon class="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
              size="sm"
              :variant="invoice.status === 'paid' ? 'destructive' : 'default'"
              @click="$emit('mark-paid', invoice)"
          >
            <component
                :is="invoice.status === 'paid' ? BanIcon : CheckSquareIcon"
                class="h-4 w-4 mr-2"
            />
            {{ invoice.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid' }}
          </Button>
        </div>
      </div>

      <!-- Invoice Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Invoice Details Card -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-lg">Invoice Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Invoice Number:</span>
                <span class="font-medium">{{ invoice.number }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Invoice Date:</span>
                <span>{{ formatDate(invoice.invoiceDate) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Due Date:</span>
                <span>{{ formatDate(invoice.dueDate) }}</span>
              </div>
              <div v-if="invoice.status === 'paid'" class="flex justify-between">
                <span class="text-sm text-muted-foreground">Payment Date:</span>
                <span>{{ formatDate(invoice.paidDate) }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Customer Information Card -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Name:</span>
                <span class="font-medium">{{ invoice.customer.name }}</span>
              </div>
              <div v-if="invoice.customer.company" class="flex justify-between">
                <span class="text-sm text-muted-foreground">Company:</span>
                <span>{{ invoice.customer.company }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Email:</span>
                <span>{{ invoice.customer.email }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Phone:</span>
                <span>{{ invoice.customer.phone }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Invoice Items -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-lg">Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[50%]">Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price (KES)</TableHead>
                <TableHead class="text-right">Total (KES)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in invoice.items" :key="item.id">
                <TableCell>{{ item.description }}</TableCell>
                <TableCell>{{ item.quantity }}</TableCell>
                <TableCell>{{ formatAmount(item.price) }}</TableCell>
                <TableCell class="text-right">{{ formatAmount(item.total) }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <!-- Invoice Totals -->
          <div class="mt-4 space-y-2 border-t pt-4">
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">Subtotal:</span>
              <span>KES {{ formatAmount(invoice.subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">VAT ({{ (invoice.vatRate * 100).toFixed(0) }}%):</span>
              <span>KES {{ formatAmount(invoice.vatAmount) }}</span>
            </div>
            <div class="flex justify-between font-bold">
              <span>Total:</span>
              <span>KES {{ formatAmount(invoice.total) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Notes -->
      <Card v-if="invoice.notes">
        <CardHeader class="pb-2">
          <CardTitle class="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm">{{ invoice.notes }}</p>
        </CardContent>
      </Card>

      <!-- Actions -->
      <div class="flex justify-end space-x-2">
        <Button variant="outline" @click="$emit('view-pdf', invoice)">
          <FileTextIcon class="h-4 w-4 mr-2" />
          View PDF
        </Button>
        <Button variant="default" @click="$emit('send-invoice', invoice)">
          <SendIcon class="h-4 w-4 mr-2" />
          Send Invoice
        </Button>
      </div>
    </div>
  </SheetContent>
</template>

<script setup>
import { format, parseISO } from 'date-fns'
import {
  SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@/components/ui/sheet'
import {
  Card, CardHeader, CardTitle, CardContent
} from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  EditIcon, BanIcon, CheckSquareIcon, FileTextIcon,
  SendIcon, Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  invoice: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'edit-invoice',
  'mark-paid',
  'send-invoice',
  'view-pdf',
  'close'
])

// Helper functions
function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatStatus(status) {
  const statusMap = {
    'paid': 'Paid',
    'pending': 'Pending',
    'overdue': 'Overdue'
  }
  return statusMap[status] || status
}
</script>