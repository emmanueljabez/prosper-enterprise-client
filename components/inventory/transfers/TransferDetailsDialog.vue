<template>
  <DialogContent class="sm:max-w-[700px] max-h-[85vh] flex flex-col">
    <DialogHeader class="space-y-2">
      <div class="flex justify-between items-center">
        <DialogTitle>Transfer Details</DialogTitle>
        <Badge :variant="getStatusVariant(transfer.status)">
          {{ formatStatus(transfer.status) }}
        </Badge>
      </div>
      <DialogDescription>
        View and manage transfer #{{ transfer.referenceNumber }}
      </DialogDescription>
    </DialogHeader>
    
    <div class="flex-1 overflow-y-auto space-y-5 my-4">
      <!-- Basic Info Card -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-lg">Transfer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <div class="text-sm font-medium">Type</div>
              <div>{{ formatTransferType(transfer.type) }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium">Reference Number</div>
              <div>{{ transfer.referenceNumber }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium">External Reference</div>
              <div>{{ transfer.externalReference || '—' }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium">Created</div>
              <div>{{ formatDate(transfer.createdAt) }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium">From Location</div>
              <div>{{ getLocationName(transfer.fromLocationId) }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium">To Location</div>
              <div>{{ getLocationName(transfer.toLocationId) }}</div>
            </div>
            
            <div v-if="transfer.type !== 'adjustment'">
              <div class="text-sm font-medium">Expected Ship Date</div>
              <div>{{ formatDate(transfer.expectedShipDate) }}</div>
            </div>
            
            <div v-if="transfer.type !== 'adjustment'">
              <div class="text-sm font-medium">Expected Delivery</div>
              <div>{{ formatDate(transfer.expectedDeliveryDate) || '—' }}</div>
            </div>
            
            <div v-if="transfer.shippedAt">
              <div class="text-sm font-medium">Shipped On</div>
              <div>{{ formatDate(transfer.shippedAt) }}</div>
            </div>
            
            <div v-if="transfer.receivedAt">
              <div class="text-sm font-medium">Received On</div>
              <div>{{ formatDate(transfer.receivedAt) }}</div>
            </div>
          </div>
          
          <div class="mt-3">
            <div class="text-sm font-medium">Notes</div>
            <div class="text-sm mt-0.5">{{ transfer.notes || 'No notes provided' }}</div>
          </div>
        </CardContent>
      </Card>
      
      <!-- Items Card -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-lg">Transfer Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead v-if="hasReceivedItems">Received</TableHead>
                  <TableHead>Locations</TableHead>
                  <TableHead v-if="hasItemNotes">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in transfer.items" :key="item.itemId">
                  <TableCell>
                    <div class="font-medium">{{ item.name || getItemName(item.itemId) }}</div>
                    <div class="text-sm text-muted-foreground">{{ item.sku || getItemSku(item.itemId) }}</div>
                  </TableCell>
                  <TableCell>
                    <div>{{ item.quantity }}</div>
                    <div v-if="hasDiscrepancy(item)" class="text-xs">
                      <Badge :variant="getDiscrepancyVariant(item)">
                        {{ getDiscrepancyText(item) }}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell v-if="hasReceivedItems">
                    {{ item.receivedQuantity || '—' }}
                  </TableCell>
                  <TableCell>
                    <div v-if="item.sourceBin" class="text-xs">From: {{ item.sourceBin }}</div>
                    <div v-if="item.destinationBin" class="text-xs">To: {{ item.destinationBin }}</div>
                  </TableCell>
                  <TableCell v-if="hasItemNotes">
                    <div class="text-xs">{{ item.notes || '—' }}</div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div v-if="transfer.totalValue" class="flex justify-end mt-3">
            <div class="text-right">
              <div class="text-sm font-medium">Total Value</div>
              <div class="text-lg font-semibold">{{ formatCurrency(transfer.totalValue) }}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <!-- Status History Card -->
      <Card v-if="hasStatusHistory">
        <CardHeader class="pb-2">
          <CardTitle class="text-lg">Transfer History</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <!-- Created -->
            <div class="flex items-start gap-3">
              <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <FileIcon class="h-4 w-4 text-primary" />
              </div>
              <div>
                <div class="font-medium">Transfer Created</div>
                <div class="text-sm text-muted-foreground">
                  By {{ transfer.createdBy || 'Unknown user' }} on {{ formatDateWithTime(transfer.createdAt) }}
                </div>
              </div>
            </div>
            
            <!-- Approved -->
            <div v-if="transfer.approvedAt" class="flex items-start gap-3">
              <div class="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center mt-0.5">
                <CheckIcon class="h-4 w-4 text-secondary" />
              </div>
              <div>
                <div class="font-medium">Transfer Approved</div>
                <div class="text-sm text-muted-foreground">
                  By {{ transfer.approvedBy || 'Unknown user' }} on {{ formatDateWithTime(transfer.approvedAt) }}
                </div>
                <div v-if="transfer.approvalNotes" class="text-sm mt-0.5">
                  "{{ transfer.approvalNotes }}"
                </div>
              </div>
            </div>
            
            <!-- Shipped -->
            <div v-if="transfer.shippedAt" class="flex items-start gap-3">
              <div class="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center mt-0.5">
                <TruckIcon class="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div class="font-medium">Transfer Shipped</div>
                <div class="text-sm text-muted-foreground">
                  By {{ transfer.shippedBy || 'Unknown user' }} on {{ formatDateWithTime(transfer.shippedAt) }}
                </div>
                <div v-if="transfer.shippingInfo" class="text-sm mt-0.5 space-y-1">
                  <div v-if="transfer.shippingInfo.method">Shipping method: {{ transfer.shippingInfo.method }}</div>
                  <div v-if="transfer.shippingInfo.trackingNumber">Tracking: {{ transfer.shippingInfo.trackingNumber }}</div>
                  <div v-if="transfer.shippingInfo.packageCount">Packages: {{ transfer.shippingInfo.packageCount }}</div>
                </div>
              </div>
            </div>
            
            <!-- Received -->
            <div v-if="transfer.receivedAt" class="flex items-start gap-3">
              <div class="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center mt-0.5">
                <CheckSquareIcon class="h-4 w-4 text-green-500" />
              </div>
              <div>
                <div class="font-medium">Transfer Received</div>
                <div class="text-sm text-muted-foreground">
                  By {{ transfer.receivedBy || 'Unknown user' }} on {{ formatDateWithTime(transfer.receivedAt) }}
                </div>
                <div v-if="transfer.receiptNotes" class="text-sm mt-0.5">
                  "{{ transfer.receiptNotes }}"
                </div>
              </div>
            </div>
            
            <!-- Cancelled -->
            <div v-if="transfer.cancelledAt" class="flex items-start gap-3">
              <div class="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center mt-0.5">
                <XIcon class="h-4 w-4 text-destructive" />
              </div>
              <div>
                <div class="font-medium">Transfer Cancelled</div>
                <div class="text-sm text-muted-foreground">
                  By {{ transfer.cancelledBy || 'Unknown user' }} on {{ formatDateWithTime(transfer.cancelledAt) }}
                </div>
                <div v-if="transfer.cancellationReason" class="text-sm mt-0.5">
                  "{{ transfer.cancellationReason }}"
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <DialogFooter class="space-x-2">
      <Button variant="outline" @click="$emit('close')">Close</Button>
      
      <Button v-if="canCancel" variant="destructive" @click="$emit('cancel-transfer', transfer)">
        <XIcon class="mr-2 h-4 w-4" />
        Cancel Transfer
      </Button>
      
      <Button v-if="canApprove" @click="$emit('approve-transfer', transfer)">
        <CheckIcon class="mr-2 h-4 w-4" />
        Approve Transfer
      </Button>
      
      <Button v-if="canReceive" @click="$emit('receive-transfer', transfer)">
        <CheckSquareIcon class="mr-2 h-4 w-4" />
        Receive Transfer
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import {
  CheckIcon,
  CheckSquareIcon,
  FileIcon,
  TruckIcon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const props = defineProps({
  transfer: { type: Object, required: true },
  locations: { type: Array, default: () => [] }
})

const emit = defineEmits(['approve-transfer', 'receive-transfer', 'cancel-transfer', 'close'])

// Helper functions
const formatDate = (date) => {
  if (!date) return null
  return format(new Date(date), 'PPP')
}

const formatDateWithTime = (date) => {
  if (!date) return null
  return format(new Date(date), 'PPP p')
}

const formatTransferType = (type) => {
  switch (type) {
    case 'standard': return 'Standard Transfer'
    case 'return': return 'Return Transfer'
    case 'adjustment': return 'Inventory Adjustment'
    case 'bulk': return 'Bulk Transfer'
    default: return type
  }
}

const formatStatus = (status) => {
  switch (status) {
    case 'pending': return 'Pending Approval'
    case 'approved': return 'Approved'
    case 'in_transit': return 'In Transit'
    case 'awaiting_receipt': return 'Awaiting Receipt'
    case 'completed': return 'Completed'
    case 'cancelled': return 'Cancelled'
    default: return status
  }
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'approved': return 'secondary'
    case 'in_transit': return 'info'
    case 'awaiting_receipt': return 'secondary'
    case 'completed': return 'success'
    case 'cancelled': return 'destructive'
    default: return 'default'
  }
}

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

const getLocationName = (locationId) => {
  const location = props.locations.find(loc => loc.id === locationId)
  return location ? location.name : locationId
}

// For now, these are just placeholders since we don't have the items array
const getItemName = (itemId) => {
  return itemId
}

const getItemSku = (itemId) => {
  return ''
}

// Computed properties
const hasReceivedItems = computed(() => {
  return props.transfer.status === 'completed' || props.transfer.items.some(item => item.receivedQuantity !== undefined)
})

const hasItemNotes = computed(() => {
  return props.transfer.items.some(item => item.notes)
})

const hasStatusHistory = computed(() => {
  return props.transfer.approvedAt || 
         props.transfer.shippedAt || 
         props.transfer.receivedAt || 
         props.transfer.cancelledAt
})

const canApprove = computed(() => {
  return props.transfer.status === 'pending' && props.transfer.requiresApproval
})

const canReceive = computed(() => {
  return props.transfer.status === 'in_transit' || props.transfer.status === 'awaiting_receipt'
})

const canCancel = computed(() => {
  return ['pending', 'approved', 'in_transit', 'awaiting_receipt'].includes(props.transfer.status)
})

// Discrepancy helpers
const hasDiscrepancy = (item) => {
  return item.receivedQuantity !== undefined && item.receivedQuantity !== null && 
         item.receivedQuantity !== item.quantity
}

const getDiscrepancyVariant = (item) => {
  if (!hasDiscrepancy(item)) return 'outline'
  return item.receivedQuantity > item.quantity ? 'success' : 'destructive'
}

const getDiscrepancyText = (item) => {
  if (!hasDiscrepancy(item)) return ''
  const diff = item.receivedQuantity - item.quantity
  return diff > 0 ? `+${diff}` : diff
}
</script>