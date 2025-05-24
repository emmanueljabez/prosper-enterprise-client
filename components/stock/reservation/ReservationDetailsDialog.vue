<template>
  <DialogContent class="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle class="flex items-center space-x-2">
        <span>Reservation Details</span>
        <Badge :variant="getTypeVariant(reservation.type)">
          {{ formatType(reservation.type) }}
        </Badge>
      </DialogTitle>
      <DialogDescription>
        View and manage reservation information
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6 py-4">
      <!-- Header info -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <p class="text-sm font-medium leading-none">Reference</p>
          <p class="text-sm text-muted-foreground">{{ reservation.reference }}</p>
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium leading-none">Status</p>
          <p class="flex items-center">
            <Badge variant="outline" class="mr-2">{{ reservation.status }}</Badge>
            <span v-if="isExpired" class="text-xs text-destructive">Expired</span>
            <span v-else-if="isExpiringToday" class="text-xs text-warning">Expires today</span>
          </p>
        </div>
      </div>

      <Separator />

      <!-- Customer & Reservation Info -->
      <div class="grid grid-cols-2 gap-6">
        <!-- Customer column -->
        <div class="space-y-4">
          <div>
            <h3 class="font-medium text-sm mb-2">Customer Information</h3>
            <div class="space-y-2">
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">Name</p>
                <p class="text-sm text-muted-foreground">{{ reservation.customerName || 'Not specified' }}</p>
              </div>
              <div v-if="reservation.customerId" class="space-y-1">
                <p class="text-sm font-medium leading-none">Customer ID</p>
                <p class="text-sm text-muted-foreground">{{ reservation.customerId }}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="font-medium text-sm mb-2">Created By</h3>
            <div class="space-y-1">
              <p class="text-sm text-muted-foreground">{{ reservation.createdByName }}</p>
              <p class="text-sm text-muted-foreground">{{ formatDate(reservation.createdAt) }}</p>
            </div>
          </div>

          <div v-if="reservation.notes" class="space-y-1">
            <p class="text-sm font-medium leading-none">Notes</p>
            <p class="text-sm text-muted-foreground whitespace-pre-line">{{ reservation.notes }}</p>
          </div>
        </div>

        <!-- Reservation details column -->
        <div class="space-y-4">
          <div>
            <h3 class="font-medium text-sm mb-2">Reservation Details</h3>
            <div class="space-y-2">
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">Location</p>
                <p class="text-sm text-muted-foreground">{{ reservation.locationName }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">Created</p>
                <p class="text-sm text-muted-foreground">{{ formatDate(reservation.createdAt) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none">Expires</p>
                <p class="text-sm text-muted-foreground">
                  {{ formatDate(reservation.expiresAt) }} 
                  <span v-if="daysUntilExpiry !== null">
                    ({{ getDaysUntilExpiryText() }})
                  </span>
                </p>
              </div>
              <div v-if="reservation.extendedAt" class="space-y-1">
                <p class="text-sm font-medium leading-none">Extended</p>
                <p class="text-sm text-muted-foreground">
                  {{ formatDate(reservation.extendedAt) }} by {{ reservation.extendedByName }}
                </p>
                <p v-if="reservation.extensionNotes" class="text-xs text-muted-foreground italic">
                  "{{ reservation.extensionNotes }}"
                </p>
              </div>
            </div>
          </div>

          <div v-if="holdPolicy" class="space-y-1">
            <p class="text-sm font-medium leading-none">Hold Policy</p>
            <p class="text-sm text-muted-foreground">{{ holdPolicy.name }}</p>
            <p class="text-xs text-muted-foreground">
              {{ formatDuration(holdPolicy) }}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Reserved Items -->
      <div>
        <h3 class="font-medium text-base mb-3">Reserved Items</h3>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead class="text-right">Quantity</TableHead>
                <TableHead class="text-right">Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in reservation.items" :key="item.itemId">
                <TableCell>{{ item.itemName }}</TableCell>
                <TableCell>{{ item.sku }}</TableCell>
                <TableCell class="text-right">{{ item.quantity }}</TableCell>
                <TableCell class="text-right">{{ item.availableQuantity }}</TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan="2">Total</TableCell>
                <TableCell class="text-right">{{ getTotalItems() }}</TableCell>
                <TableCell class="text-right"></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>

    <DialogFooter class="flex justify-between sm:justify-between">
      <div>
        <Button 
          variant="destructive" 
          @click="$emit('release')"
        >
          <Trash2Icon class="mr-2 h-4 w-4" />
          Release Hold
        </Button>
      </div>
      <div class="flex gap-2">
        <Button 
          variant="outline" 
          @click="$emit('close')"
        >
          Close
        </Button>
        <Button 
          @click="$emit('extend')"
          :disabled="isExpired"
        >
          <ClockIcon class="mr-2 h-4 w-4" />
          Extend Hold
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { format, formatDistance, parseISO, isToday, differenceInDays, isPast } from 'date-fns'
import { ClockIcon, Trash2Icon } from 'lucide-vue-next'
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
import { useReservationStore } from '@/store/modules/inventory/reservations'

const props = defineProps({
  reservation: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'extend', 'release'])

const reservationStore = useReservationStore()

// Computed properties
const holdPolicy = computed(() => {
  if (!props.reservation?.holdPolicyId) return null
  return reservationStore.getHoldPolicyById(props.reservation.holdPolicyId)
})

const isExpired = computed(() => {
  if (!props.reservation?.expiresAt) return false
  return isPast(new Date(props.reservation.expiresAt))
})

const isExpiringToday = computed(() => {
  if (!props.reservation?.expiresAt) return false
  return isToday(new Date(props.reservation.expiresAt))
})

const daysUntilExpiry = computed(() => {
  if (!props.reservation?.expiresAt) return null
  
  const expiryDate = new Date(props.reservation.expiresAt)
  const today = new Date()
  
  if (isPast(expiryDate)) {
    return -1 * differenceInDays(expiryDate, today)
  }
  
  return differenceInDays(expiryDate, today)
})

// Helper functions
function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}

function formatDateDistance(dateString) {
  try {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true })
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

function formatDuration(policy) {
  if (!policy) return ''
  
  if (policy.durationType === 'days') {
    return policy.duration === 1 ? '1 day' : `${policy.duration} days`
  } else if (policy.durationType === 'hours') {
    return policy.duration === 1 ? '1 hour' : `${policy.duration} hours`
  }
  
  return `${policy.duration} ${policy.durationType}`
}

function getTotalItems() {
  if (!props.reservation?.items) return 0
  return props.reservation.items.reduce((sum, item) => sum + item.quantity, 0)
}

function getDaysUntilExpiryText() {
  if (daysUntilExpiry.value === 0) {
    return 'Expires today'
  } else if (daysUntilExpiry.value === 1) {
    return 'Expires tomorrow'
  } else if (daysUntilExpiry.value > 1) {
    return `Expires in ${daysUntilExpiry.value} days`
  } else if (daysUntilExpiry.value === -1) {
    return 'Expired yesterday'
  } else {
    return `Expired ${Math.abs(daysUntilExpiry.value)} days ago`
  }
}
</script>