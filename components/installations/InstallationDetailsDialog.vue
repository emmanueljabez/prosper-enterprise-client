<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Installation Details</DialogTitle>
        <DialogDescription>
          Detailed information about this installation.
        </DialogDescription>
      </DialogHeader>

      <div v-if="installation" class="py-4">
        <!-- Installation Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold">Installation #{{ installation.installationNumber }}</h3>
            <p class="text-sm text-muted-foreground">Created on {{ formatDate(installation.createdAt) }}</p>
          </div>
          <Badge :variant="getStatusVariant(installation.status)">
            {{ formatStatus(installation.status) }}
          </Badge>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-2 mb-6">
          <Button
              variant="outline"
              size="sm"
              @click="$emit('update-status', installation)"
              :disabled="installation.status === 'completed' || installation.status === 'cancelled'"
          >
            <ActivityIcon class="h-4 w-4 mr-2" />
            Update Status
          </Button>

          <Button
              variant="outline"
              size="sm"
              @click="$emit('reschedule', installation)"
              :disabled="installation.status === 'completed' || installation.status === 'cancelled'"
          >
            <CalendarIcon class="h-4 w-4 mr-2" />
            Reschedule
          </Button>

          <Button
              variant="outline"
              size="sm"
              @click="$emit('assign-technician', installation)"
              :disabled="installation.status === 'completed' || installation.status === 'cancelled'"
          >
            <UserIcon class="h-4 w-4 mr-2" />
            Assign Technician
          </Button>

          <Button
              variant="outline"
              size="sm"
              @click="$emit('complete-installation', installation)"
              :disabled="installation.status === 'completed' || installation.status === 'cancelled' ||
              (installation.status !== 'in_progress' && installation.status !== 'on_site')"
          >
            <CheckCircleIcon class="h-4 w-4 mr-2" />
            Mark Complete
          </Button>

          <Button
              variant="outline"
              size="sm"
              @click="$emit('generate-report', installation)"
              :disabled="installation.status !== 'completed'"
          >
            <FileTextIcon class="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        <!-- Installation Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Customer Information -->
          <div class="space-y-4">
            <h4 class="text-sm font-medium">Customer Information</h4>
            <div class="border rounded-md p-4 bg-muted/10">
              <div class="grid grid-cols-1 gap-2">
                <div>
                  <p class="text-xs text-muted-foreground">Name</p>
                  <p class="text-sm font-medium">{{ installation.customer.name }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Contact Person</p>
                  <p class="text-sm font-medium">{{ installation.customer.contact || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Phone</p>
                  <p class="text-sm font-medium">{{ installation.customer.phone || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Email</p>
                  <p class="text-sm font-medium">{{ installation.customer.email || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Schedule Information -->
          <div class="space-y-4">
            <h4 class="text-sm font-medium">Installation Schedule</h4>
            <div class="border rounded-md p-4 bg-muted/10">
              <div class="grid grid-cols-1 gap-2">
                <div>
                  <p class="text-xs text-muted-foreground">Scheduled Date</p>
                  <p class="text-sm font-medium">{{ formatDate(installation.scheduledDate) }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Time Slot</p>
                  <p class="text-sm font-medium">{{ formatTimeSlot(installation.timeSlot) }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Technician</p>
                  <p class="text-sm font-medium">{{ installation.technician ? installation.technician.name : 'Not assigned' }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Installation Location</p>
                  <p class="text-sm font-medium">{{ installation.location?.address || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Details -->
        <div class="space-y-4 mb-6">
          <h4 class="text-sm font-medium">Order Details</h4>
          <div class="border rounded-md p-4 bg-muted/10">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-muted-foreground">Order Number</p>
                <p class="text-sm font-medium">{{ installation.order.orderNumber }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Order Date</p>
                <p class="text-sm font-medium">{{ formatDate(installation.order.orderDate) }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Order Status</p>
                <p class="text-sm font-medium">{{ formatStatus(installation.order.status) }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Order Total</p>
                <p class="text-sm font-medium">{{ formatCurrency(installation.order.totalAmount) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Services to be Installed -->
        <div class="space-y-4 mb-6">
          <h4 class="text-sm font-medium">Services to be Installed</h4>
          <div class="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead class="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="service in installation.services" :key="service.id">
                  <TableCell>{{ service.name }}</TableCell>
                  <TableCell class="text-right font-medium">{{ formatCurrency(service.price) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <!-- Completion Details Section (if completed) -->
        <div v-if="installation.status === 'completed' && installation.completionDetails" class="space-y-4 mb-6">
          <h4 class="text-sm font-medium">Completion Details</h4>
          <div class="border rounded-md p-4 bg-muted/10">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-muted-foreground">Completion Date</p>
                <p class="text-sm font-medium">{{ formatDate(installation.completionDate) }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Installation Time</p>
                <p class="text-sm font-medium">{{ installation.completionDetails.installationTime }} hours</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Customer Feedback</p>
                <p class="text-sm font-medium">{{ installation.completionDetails.customerFeedback || 'Not provided' }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Materials Used</p>
                <div class="text-sm">
                  <ul class="list-disc pl-4">
                    <li v-for="(material, index) in installation.completionDetails.materialsUsed" :key="index">
                      {{ material }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="mt-4">
              <p class="text-xs text-muted-foreground">Completion Notes</p>
              <p class="text-sm">{{ installation.completionDetails.notes || 'No notes provided' }}</p>
            </div>
          </div>
        </div>

        <!-- Cancellation Details Section (if cancelled) -->
        <div v-if="installation.status === 'cancelled'" class="space-y-4 mb-6">
          <h4 class="text-sm font-medium">Cancellation Details</h4>
          <div class="border rounded-md p-4 bg-muted/10">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-muted-foreground">Cancellation Date</p>
                <p class="text-sm font-medium">{{ formatDate(installation.cancellationDate) }}</p>
              </div>
            </div>

            <div class="mt-4">
              <p class="text-xs text-muted-foreground">Cancellation Reason</p>
              <p class="text-sm">{{ installation.cancellationReason || 'No reason provided' }}</p>
            </div>
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
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import {
  CalendarIcon,
  UserIcon,
  ActivityIcon,
  CheckCircleIcon,
  FileTextIcon
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  installation: {
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

function formatTimeSlot(timeSlot) {
  const timeSlotMap = {
    'morning': 'Morning (8:00 AM - 12:00 PM)',
    'afternoon': 'Afternoon (1:00 PM - 5:00 PM)'
  }

  return timeSlotMap[timeSlot] || timeSlot
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'on_site': 'On Site',
    'delayed': 'Delayed',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'failed': 'Failed',
    'processing': 'Processing'
  }

  return statusMap[status] || status
}

function getStatusVariant(status) {
  const variantMap = {
    'pending': 'secondary',
    'scheduled': 'warning',
    'in_progress': 'primary',
    'on_site': 'primary',
    'delayed': 'destructive',
    'completed': 'success',
    'cancelled': 'destructive',
    'failed': 'destructive'
  }

  return variantMap[status] || 'default'
}

function formatCurrency(amount, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}
</script>