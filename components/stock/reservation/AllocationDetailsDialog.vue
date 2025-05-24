<template>
  <DialogContent class="sm:max-w-[700px] max-h-[90vh] flex flex-col">
    <DialogHeader class="flex-shrink-0">
      <DialogTitle class="flex items-center space-x-2">
        <span>Order Allocation Details</span>
        <Badge :variant="getStatusVariant(allocation.status)">
          {{ formatStatus(allocation.status) }}
        </Badge>
      </DialogTitle>
      <DialogDescription>
        View and manage allocation information for order {{ allocation.orderReference }}
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6 py-4 overflow-y-auto flex-grow">
      <!-- Header info -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <p class="text-sm font-medium leading-none">Order ID</p>
          <p class="text-sm text-muted-foreground">{{ allocation.orderId }}</p>
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium leading-none">Date Created</p>
          <p class="text-sm text-muted-foreground">{{ formatDate(allocation.createdAt) }}</p>
        </div>
      </div>

      <Separator />

      <!-- Order & Customer Info -->
      <div class="grid grid-cols-2 gap-6">
        <!-- Order column -->
        <div class="space-y-4">
          <div>
            <h3 class="font-medium text-sm mb-2">Order Information</h3>
            <div class="space-y-2">
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">Reference</p>
                <p class="text-sm text-muted-foreground">{{ allocation.orderReference }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">Order Date</p>
                <p class="text-sm text-muted-foreground">{{ formatDate(allocation.orderDate) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">Order Total</p>
                <p class="text-sm text-muted-foreground">
                  {{ formatCurrency(allocation.orderTotal) }}
                </p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">Shipping Method</p>
                <p class="text-sm text-muted-foreground">{{ allocation.shippingMethod }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer column -->
        <div class="space-y-4">
          <div>
            <h3 class="font-medium text-sm mb-2">Customer Information</h3>
            <div class="space-y-2">
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">Name</p>
                <p class="text-sm text-muted-foreground">{{ allocation.customerName }}</p>
              </div>
              <div v-if="allocation.customerId" class="space-y-1">
                <p class="text-sm font-medium leading-none">Customer ID</p>
                <p class="text-sm text-muted-foreground">{{ allocation.customerId }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">Customer Type</p>
                <p class="text-sm text-muted-foreground">{{ allocation.customerType }}</p>
              </div>
              <div v-if="allocation.notes" class="space-y-1">
                <p class="text-sm font-medium leading-none">Notes</p>
                <p class="text-sm text-muted-foreground">{{ allocation.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Allocation Info -->
      <div>
        <h3 class="font-medium text-sm mb-2">Allocation Details</h3>
        <div class="space-y-2">
          <div class="space-y-1">
            <p class="text-sm font-medium leading-none">Allocated From</p>
            <p class="text-sm text-muted-foreground">{{ allocation.locationName || 'Multiple locations' }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium leading-none">Allocation Date</p>
            <p class="text-sm text-muted-foreground">{{ formatDate(allocation.allocatedAt) }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium leading-none">Allocation Method</p>
            <p class="text-sm text-muted-foreground">{{ formatAllocationType(allocation.allocationType) }}</p>
          </div>
          <div v-if="allocation.priority" class="space-y-1">
            <p class="text-sm font-medium leading-none">Priority Level</p>
            <p class="text-sm text-muted-foreground">{{ allocation.priority }}</p>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Allocated Items -->
      <div>
        <h3 class="font-medium text-base mb-3">Allocated Items</h3>
        <div class="rounded-md border">
          <div class="max-h-[200px] overflow-y-auto">
            <Table>
              <TableHeader class="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead class="text-right">Requested</TableHead>
                  <TableHead class="text-right">Allocated</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in allocation.items" :key="item.itemId">
                  <TableCell>{{ item.itemName }}</TableCell>
                  <TableCell>{{ item.sku }}</TableCell>
                  <TableCell class="text-right">{{ item.requestedQuantity }}</TableCell>
                  <TableCell class="text-right">{{ item.allocatedQuantity }}</TableCell>
                  <TableCell>
                    <Badge :variant="getItemStatusVariant(item)">
                      {{ getItemStatusText(item) }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableFooter class="sticky bottom-0 bg-background z-10">
                <TableRow>
                  <TableCell colSpan="2">Total</TableCell>
                  <TableCell class="text-right">{{ getTotalRequested() }}</TableCell>
                  <TableCell class="text-right">{{ getTotalAllocated() }}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter class="flex-shrink-0">
      <Button variant="outline" @click="$emit('close')">Close</Button>
      <div class="flex gap-2">
        <Button 
          @click="$emit('modify-allocation', allocation)"
          variant="outline"
        >
          <EditIcon class="mr-2 h-4 w-4" />
          Modify Allocation
        </Button>
        <Button 
          @click="$emit('override-allocation', allocation)"
          variant="default"
        >
          <ShieldIcon class="mr-2 h-4 w-4" />
          Override Rules
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>
<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { EditIcon, ShieldIcon } from 'lucide-vue-next'
import { 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const props = defineProps({
  allocation: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'modify-allocation', 'override-allocation'])

// Helper functions
function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}

function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '$0.00'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function formatStatus(status) {
  const statuses = {
    pending: 'Pending',
    allocated: 'Allocated',
    partially_allocated: 'Partially Allocated',
    fulfilled: 'Fulfilled',
    cancelled: 'Cancelled'
  }
  return statuses[status] || status
}

function getStatusVariant(status) {
  const variants = {
    pending: 'warning',
    allocated: 'success',
    partially_allocated: 'info',
    fulfilled: 'default',
    cancelled: 'destructive'
  }
  return variants[status] || 'outline'
}

function formatAllocationType(type) {
  const types = {
    auto: 'Automatic',
    manual: 'Manual',
    priority: 'Priority-based',
    fifo: 'First In, First Out',
    override: 'Manual Override'
  }
  return types[type] || type
}

function getItemStatusText(item) {
  if (item.allocatedQuantity === 0) return 'Unallocated'
  if (item.allocatedQuantity < item.requestedQuantity) return 'Partial'
  return 'Allocated'
}

function getItemStatusVariant(item) {
  if (item.allocatedQuantity === 0) return 'destructive'
  if (item.allocatedQuantity < item.requestedQuantity) return 'warning'
  return 'success'
}

function getTotalRequested() {
  return props.allocation.items.reduce((sum, item) => sum + (item.requestedQuantity || 0), 0)
}

function getTotalAllocated() {
  return props.allocation.items.reduce((sum, item) => sum + (item.allocatedQuantity || 0), 0)
}
</script>