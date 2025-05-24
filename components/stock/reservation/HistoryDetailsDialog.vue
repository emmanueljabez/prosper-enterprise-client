<template>
  <DialogContent class="sm:max-w-[700px] max-h-[90vh] flex flex-col">
    <DialogHeader class="flex-shrink-0">
      <DialogTitle class="flex items-center space-x-2">
        <span>Reservation History Details</span>
        <Badge :variant="getStatusVariant(reservation.status)">
          {{ formatStatus(reservation.status) }}
        </Badge>
      </DialogTitle>
      <DialogDescription>
        Details for completed reservation {{ reservation.reference }}
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6 py-4 overflow-y-auto flex-grow">
      <!-- Header info -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <p class="text-sm font-medium leading-none">Reference</p>
          <p class="font-medium">{{ reservation.reference }}</p>
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium leading-none">Type</p>
          <Badge :variant="getTypeVariant(reservation.type)">
            {{ formatType(reservation.type) }}
          </Badge>
        </div>
      </div>

      <Separator />

      <!-- Timeline -->
      <div class="space-y-2">
        <h3 class="text-base font-medium">Timeline</h3>
        <div class="space-y-3 pl-2">
          <div class="flex items-start">
            <div class="flex h-8 w-8 items-center justify-center rounded-full border bg-background">
              <CalendarPlusIcon class="h-4 w-4" />
            </div>
            <div class="ml-4 space-y-1">
              <p class="text-sm font-medium">Created</p>
              <p class="text-sm text-muted-foreground">{{ formatDateTime(reservation.createdAt) }}</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="flex h-8 w-8 items-center justify-center rounded-full border bg-background">
              <ClockIcon class="h-4 w-4" />
            </div>
            <div class="ml-4 space-y-1">
              <p class="text-sm font-medium">Planned Expiry</p>
              <p class="text-sm text-muted-foreground">{{ formatDateTime(reservation.expiresAt) }}</p>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex h-8 w-8 items-center justify-center rounded-full border" 
                 :class="getCompletionIconClass(reservation.status)">
              <component :is="getCompletionIcon(reservation.status)" class="h-4 w-4" />
            </div>
            <div class="ml-4 space-y-1">
              <p class="text-sm font-medium">{{ getCompletionTitle(reservation.status) }}</p>
              <p class="text-sm text-muted-foreground">{{ formatDateTime(reservation.completedAt) }}</p>
              <p v-if="reservation.completionReason" class="text-sm text-muted-foreground">
                Reason: {{ reservation.completionReason }}
              </p>
            </div>
          </div>

          <div v-if="reservation.completedBy" class="flex items-start">
            <div class="flex h-8 w-8 items-center justify-center rounded-full border bg-background">
              <UserIcon class="h-4 w-4" />
            </div>
            <div class="ml-4 space-y-1">
              <p class="text-sm font-medium">Completed By</p>
              <p class="text-sm text-muted-foreground">{{ reservation.completedBy }}</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Customer & Location Info -->
      <div class="grid grid-cols-2 gap-6">
        <!-- Customer column -->
        <div>
          <h3 class="font-medium text-sm mb-2">Customer Information</h3>
          <div class="space-y-2">
            <div class="space-y-1">
              <p class="text-sm font-medium leading-none">Name</p>
              <p class="text-sm text-muted-foreground">{{ reservation.customerName || 'No customer' }}</p>
            </div>
            <div v-if="reservation.customerId" class="space-y-1">
              <p class="text-sm font-medium leading-none">Customer ID</p>
              <p class="text-sm text-muted-foreground">{{ reservation.customerId }}</p>
            </div>
          </div>
        </div>

        <!-- Location column -->
        <div>
          <h3 class="font-medium text-sm mb-2">Location Information</h3>
          <div class="space-y-2">
            <div class="space-y-1">
              <p class="text-sm font-medium leading-none">Location</p>
              <p class="text-sm text-muted-foreground">{{ reservation.locationName || 'Unknown' }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-medium leading-none">Hold Policy</p>
              <p class="text-sm text-muted-foreground">{{ reservation.holdPolicyName || 'Standard policy' }}</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Reserved Items -->
      <div>
        <h3 class="font-medium text-base mb-3">Reserved Items</h3>
        <div class="rounded-md border">
          <div class="max-h-[200px] overflow-y-auto">
            <Table>
              <TableHeader class="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead class="text-right">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in reservation.items" :key="item.id || item.itemId">
                  <TableCell>{{ item.itemName }}</TableCell>
                  <TableCell>{{ item.sku }}</TableCell>
                  <TableCell class="text-right">{{ item.quantity }}</TableCell>
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
                  <TableCell class="text-right">{{ getTotalItems() }}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="reservation.notes">
        <h3 class="font-medium text-base mb-2">Notes</h3>
        <div class="rounded-md border p-3">
          <p class="text-sm">{{ reservation.notes }}</p>
        </div>
      </div>

      <!-- Activity Log -->
      <div v-if="reservation.activityLog && reservation.activityLog.length > 0">
        <h3 class="font-medium text-base mb-2">Activity Log</h3>
        <div class="rounded-md border">
          <div class="max-h-[200px] overflow-y-auto">
            <Table>
              <TableHeader class="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(log, index) in reservation.activityLog" :key="index">
                  <TableCell>{{ formatDateTime(log.timestamp) }}</TableCell>
                  <TableCell>{{ log.action }}</TableCell>
                  <TableCell>{{ log.user }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter class="flex-shrink-0">
      <Button variant="outline" @click="$emit('close')">Close</Button>
      <Button variant="outline" @click="$emit('export', reservation)">
        <DownloadIcon class="mr-2 h-4 w-4" />
        Export Details
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { 
  CalendarPlusIcon, ClockIcon, UserIcon, CheckCircleIcon,
  XCircleIcon, AlertCircleIcon, DownloadIcon, TrashIcon
} from 'lucide-vue-next'
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
  reservation: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'export'])

// Helper functions
function formatDateTime(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}

function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy')
  } catch (e) {
    return dateString
  }
}

function formatType(type) {
  const types = {
    manual: 'Manual Hold',
    service: 'Service Hold',
    project: 'Project Hold',
    customer: 'Customer Hold'
  }
  return types[type] || type
}

function getTypeVariant(type) {
  const variants = {
    manual: 'outline',
    service: 'secondary',
    project: 'default',
    customer: 'info'
  }
  return variants[type] || 'outline'
}

function formatStatus(status) {
  const statuses = {
    expired: 'Expired',
    completed: 'Completed',
    cancelled: 'Cancelled',
    released: 'Released'
  }
  return statuses[status] || status
}

function getStatusVariant(status) {
  const variants = {
    expired: 'warning',
    completed: 'success',
    cancelled: 'destructive',
    released: 'info'
  }
  return variants[status] || 'outline'
}

function getCompletionIcon(status) {
  const icons = {
    expired: AlertCircleIcon,
    completed: CheckCircleIcon,
    cancelled: XCircleIcon,
    released: TrashIcon
  }
  return icons[status] || CheckCircleIcon
}

function getCompletionIconClass(status) {
  const classes = {
    expired: 'bg-yellow-50 text-yellow-600',
    completed: 'bg-green-50 text-green-600',
    cancelled: 'bg-red-50 text-red-600',
    released: 'bg-blue-50 text-blue-600'
  }
  return classes[status] || 'bg-background'
}

function getCompletionTitle(status) {
  const titles = {
    expired: 'Expired',
    completed: 'Completed',
    cancelled: 'Cancelled',
    released: 'Released'
  }
  return titles[status] || 'Completed'
}

function getItemStatusText(item) {
  return item.status || 'Released'
}

function getItemStatusVariant(item) {
  const variants = {
    reserved: 'success',
    partial: 'warning',
    released: 'info',
    failed: 'destructive'
  }
  return variants[item.status] || 'outline'
}

function getTotalItems() {
  return props.reservation.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
}
</script>