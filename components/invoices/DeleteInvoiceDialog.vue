<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this invoice? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <div v-if="invoice" class="rounded-md bg-muted p-4">
          <div class="mb-3 flex items-center justify-between">
            <div class="font-medium">{{ invoice.number }}</div>
            <Badge
                :variant="invoice.status === 'paid' ? 'success' :
                       invoice.status === 'overdue' ? 'destructive' : 'secondary'"
            >
              {{ formatStatus(invoice.status) }}
            </Badge>
          </div>
          <div class="text-sm text-muted-foreground grid gap-1">
            <div class="flex justify-between">
              <span>Customer:</span>
              <span>{{ invoice.customer.name }}</span>
            </div>
            <div class="flex justify-between">
              <span>Date:</span>
              <span>{{ formatDate(invoice.invoiceDate) }}</span>
            </div>
            <div class="flex justify-between font-medium">
              <span>Total:</span>
              <span>KES {{ formatAmount(invoice.total) }}</span>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
        <Button
            variant="destructive"
            @click="handleDelete"
            :disabled="isDeleting"
        >
          <Loader2Icon v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin" />
          Delete Invoice
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import {ref} from 'vue'
import {format, parseISO} from 'date-fns'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {Loader2Icon} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  invoice: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'delete'])

const isDeleting = ref(false)

async function handleDelete() {
  if (!props.invoice) return

  try {
    isDeleting.value = true

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('delete', props.invoice)
    emit('update:open', false)
  } catch (error) {
    console.error('Error deleting invoice:', error)
  } finally {
    isDeleting.value = false
  }
}

// Helper functions
function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

function formatAmount(amount) {
  return amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
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