<!-- filepath: c:\Users\user\Documents\pcash-inventory\pcash-inventory\components\warehouse\packing\PackTaskDetailsDialog.vue -->
<template>
  <DialogContent class="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle class="flex items-center">
        <PackageIcon class="h-5 w-5 mr-2" />
        Packing Task Details
        <Badge class="ml-3" :variant="getStatusVariant(task.status)">
          {{ formatStatus(task.status) }}
        </Badge>
      </DialogTitle>
      <DialogDescription>
        View and manage details for this packing task
      </DialogDescription>
    </DialogHeader>

    <div class="grid gap-6 py-4">
      <!-- Task Information -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Task ID</div>
          <div class="font-medium">{{ task.id }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Order</div>
          <div class="font-medium">#{{ task.orderNumber }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Customer</div>
          <div class="font-medium">{{ task.customerName || 'N/A' }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Priority</div>
          <Badge :variant="getPriorityVariant(task.priority)">
            {{ formatPriority(task.priority) }}
          </Badge>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Shipping Method</div>
          <div class="flex flex-col">
            <span>{{ formatShippingMethod(task.shippingMethod) }}</span>
            <span v-if="task.carrier" class="text-xs text-muted-foreground">
              {{ task.carrier }}
            </span>
          </div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Due Date</div>
          <div class="flex items-center">
            {{ formatDate(task.dueDate) }}
            <Badge 
              v-if="isOverdue(task)" 
              variant="destructive" 
              class="ml-2"
            >
              Overdue
            </Badge>
          </div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Picked By</div>
          <div>{{ task.pickedBy || 'N/A' }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Packing Station</div>
          <div v-if="task.assignedStation">
            <Badge variant="outline">
              {{ getStationName(task.assignedStation) }}
            </Badge>
          </div>
          <Badge v-else variant="secondary">Unassigned</Badge>
        </div>
      </div>

      <!-- Items to Pack -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium">Items to Pack ({{ task.items.length }})</h4>
          <Button 
            variant="outline" 
            size="sm" 
            v-if="task.status === 'pending' || task.status === 'in_progress'"
            @click="printPackingSlip"
          >
            <PrinterIcon class="h-4 w-4 mr-2" />
            Print Packing Slip
          </Button>
        </div>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Special Handling</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in task.items" :key="item.lineItemId">
                <TableCell>
                  <div class="flex items-center space-x-3">
                    <div class="h-10 w-10 rounded-md border flex items-center justify-center bg-muted/50">
                      <PackageIcon class="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>{{ item.name }}</div>
                  </div>
                </TableCell>
                <TableCell>{{ item.sku }}</TableCell>
                <TableCell>
                  <div class="font-medium">{{ item.quantity }}</div>
                  <div v-if="item.pickedQuantity && item.pickedQuantity < item.quantity" class="text-xs text-destructive">
                    Only {{ item.pickedQuantity }} picked
                  </div>
                </TableCell>
                <TableCell>
                  <Badge v-if="item.status" :variant="getStatusVariant(item.status)">
                    {{ formatStatus(item.status) }}
                  </Badge>
                  <Badge v-else variant="secondary">Pending</Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    v-if="item.isFragile"
                    variant="warning" 
                    class="mr-1"
                  >
                    Fragile
                  </Badge>
                  <Badge 
                    v-if="item.requiresCooling"
                    variant="default" 
                    class="mr-1"
                  >
                    Cold Pack
                  </Badge>
                  <Badge 
                    v-if="item.isHazardous"
                    variant="destructive" 
                    class="mr-1"
                  >
                    Hazardous
                  </Badge>
                  <span v-if="!item.isFragile && !item.requiresCooling && !item.isHazardous">None</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <!-- Package Information -->
      <div class="space-y-2" v-if="task.packaging">
        <h4 class="text-sm font-medium">Packaging Requirements</h4>
        <div class="rounded-md border p-3 space-y-3">
          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-1">
              <div class="text-xs font-medium text-muted-foreground">Package Type</div>
              <div>{{ task.packaging.type || 'Standard Box' }}</div>
            </div>
            <div class="space-y-1">
              <div class="text-xs font-medium text-muted-foreground">Package Size</div>
              <div>{{ task.packaging.size || 'Medium' }}</div>
            </div>
            <div class="space-y-1">
              <div class="text-xs font-medium text-muted-foreground">Estimated Weight</div>
              <div>{{ task.packaging.weight ? `${task.packaging.weight} kg` : 'N/A' }}</div>
            </div>
          </div>
          <div class="space-y-1" v-if="task.packaging.specialInstructions">
            <div class="text-xs font-medium text-muted-foreground">Special Instructions</div>
            <div class="text-sm">{{ task.packaging.specialInstructions }}</div>
          </div>
          <div class="space-y-1" v-if="task.packaging.materials && task.packaging.materials.length">
            <div class="text-xs font-medium text-muted-foreground">Required Materials</div>
            <div class="flex flex-wrap gap-2">
              <Badge 
                v-for="material in task.packaging.materials" 
                :key="material"
                variant="outline"
              >
                {{ material }}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <!-- Shipping Information -->
      <div class="space-y-2">
        <h4 class="text-sm font-medium">Shipping Information</h4>
        <div class="rounded-md border p-3 space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <div class="text-xs font-medium text-muted-foreground">Shipping Method</div>
              <div>{{ formatShippingMethod(task.shippingMethod) }}</div>
            </div>
            <div class="space-y-1">
              <div class="text-xs font-medium text-muted-foreground">Carrier</div>
              <div>{{ task.carrier || 'Not specified' }}</div>
            </div>
            <div class="space-y-1">
              <div class="text-xs font-medium text-muted-foreground">Tracking Number</div>
              <div>{{ task.trackingNumber || 'Not generated yet' }}</div>
            </div>
            <div class="space-y-1">
              <div class="text-xs font-medium text-muted-foreground">Shipping Label</div>
              <div>
                <Badge 
                  v-if="task.labelGenerated" 
                  variant="success"
                >
                  Generated
                </Badge>
                <Badge 
                  v-else 
                  variant="secondary"
                >
                  Not Generated
                </Badge>
              </div>
            </div>
          </div>
          <div class="border-t pt-3">
            <div class="text-xs font-medium text-muted-foreground mb-1">Shipping Address</div>
            <div class="text-sm whitespace-pre-line">
              {{ formatAddress(task.shippingAddress) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="space-y-2" v-if="task.notes">
        <h4 class="text-sm font-medium">Notes</h4>
        <div class="rounded-md border p-3 whitespace-pre-line text-sm">
          {{ task.notes }}
        </div>
      </div>

      <!-- Activity History -->
      <div class="space-y-2" v-if="task.history && task.history.length > 0">
        <h4 class="text-sm font-medium">Activity History</h4>
        <div class="rounded-md border p-2">
          <div v-for="(entry, index) in task.history" :key="index" class="py-2 px-1 border-b last:border-0">
            <div class="flex items-start justify-between">
              <div class="flex items-start">
                <ActivityIcon class="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                <div>
                  <div class="text-sm">{{ entry.action }}</div>
                  <div class="text-xs text-muted-foreground">{{ formatDate(entry.timestamp, true) }}</div>
                </div>
              </div>
              <div class="text-sm text-muted-foreground">
                {{ entry.user || 'System' }}
              </div>
            </div>
            <div v-if="entry.details" class="mt-1 ml-6 text-xs text-muted-foreground">
              {{ entry.details }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter class="flex items-center justify-between">
      <div>
        <Button 
          v-if="task.status !== 'completed' && task.status !== 'cancelled'"
          variant="outline"
          size="sm"
          @click="$emit('assign-station', task)"
        >
          <LayoutIcon class="h-4 w-4 mr-2" />
          {{ task.assignedStation ? 'Reassign Station' : 'Assign Station' }}
        </Button>
      </div>
      <div class="space-x-2">
        <Button variant="outline" @click="$emit('close')">Close</Button>
        <Button 
          v-if="task.status === 'completed' || task.status === 'in_progress'"
          variant="outline" 
          @click="$emit('print-label', task)"
        >
          <PrinterIcon class="h-4 w-4 mr-2" />
          Print Shipping Label
        </Button>
        <Button 
          v-if="task.status === 'pending'" 
          variant="default" 
          @click="$emit('start-task', task)"
        >
          <PlayIcon class="h-4 w-4 mr-2" />
          Start Packing
        </Button>
        <Button 
          v-if="task.status === 'in_progress'" 
          variant="default"
          @click="$emit('complete-task', task)"
        >
          <CheckIcon class="h-4 w-4 mr-2" />
          Complete
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { format, isPast } from 'date-fns'
import {
  ActivityIcon,
  CheckIcon,
  LayoutIcon,
  PackageIcon,
  PlayIcon,
  PrinterIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  packingStations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'close',
  'start-task', 
  'complete-task', 
  'assign-station', 
  'print-label'
])

function printPackingSlip() {
  console.log(`Printing packing slip for task ${props.task.id}, order #${props.task.orderNumber}`)
  // In a real implementation, this would trigger a print action
}

// Helper functions
function formatStatus(status) {
  switch (status) {
    case 'pending': return 'Pending'
    case 'in_progress': return 'In Progress'
    case 'completed': return 'Completed'
    case 'cancelled': return 'Cancelled'
    default: return status
  }
}

function formatPriority(priority) {
  switch (priority) {
    case 'low': return 'Low'
    case 'normal': return 'Normal'
    case 'high': return 'High'
    case 'urgent': return 'Urgent'
    default: return priority
  }
}

function formatShippingMethod(method) {
  switch (method) {
    case 'standard': return 'Standard'
    case 'express': return 'Express'
    case 'priority': return 'Priority'
    case 'economy': return 'Economy'
    default: return method || 'Not specified'
  }
}

function getStatusVariant(status) {
  switch (status) {
    case 'pending': return 'secondary'
    case 'in_progress': return 'default'
    case 'completed': return 'success'
    case 'cancelled': return 'destructive'
    default: return 'outline'
  }
}

function getPriorityVariant(priority) {
  switch (priority) {
    case 'low': return 'outline'
    case 'normal': return 'secondary'
    case 'high': return 'warning'
    case 'urgent': return 'destructive'
    default: return 'outline'
  }
}

function formatDate(dateString, includeTime = false) {
  if (!dateString) return 'N/A'
  return includeTime 
    ? format(new Date(dateString), 'MMM d, yyyy h:mm a')
    : format(new Date(dateString), 'MMM d, yyyy')
}

function isOverdue(task) {
  if (task.status === 'completed' || task.status === 'cancelled') return false
  return isPast(new Date(task.dueDate))
}

function getStationName(stationId) {
  const station = props.packingStations.find(s => s.id === stationId)
  return station ? station.name : stationId
}

function formatAddress(address) {
  if (!address) return 'No address provided'
  
  let formattedAddress = ''
  if (address.name) formattedAddress += `${address.name}\n`
  if (address.company) formattedAddress += `${address.company}\n`
  if (address.line1) formattedAddress += `${address.line1}\n`
  if (address.line2) formattedAddress += `${address.line2}\n`
  if (address.city) formattedAddress += `${address.city}, `
  if (address.state) formattedAddress += `${address.state} `
  if (address.postalCode) formattedAddress += `${address.postalCode}\n`
  if (address.country) formattedAddress += `${address.country}`
  
  return formattedAddress
}
</script>