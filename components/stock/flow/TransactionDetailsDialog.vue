<template>
  <DialogContent class="sm:max-w-2xl">
    <DialogHeader>
      <DialogTitle>Transaction Details</DialogTitle>
      <DialogDescription>
        View information about this inventory transaction.
      </DialogDescription>
    </DialogHeader>
    
    <div v-if="!transaction" class="flex items-center justify-center py-10">
      <div class="flex flex-col items-center">
        <FileSearchIcon class="h-10 w-10 text-muted-foreground" />
        <p class="mt-4 text-sm text-muted-foreground">Transaction details not found</p>
      </div>
    </div>
    
    <div v-else class="space-y-6 my-4">
      <!-- Transaction Header -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <div class="flex items-center">
            <Badge :variant="getTypeVariant(transaction.type)" class="mr-2 h-6 px-3">
              {{ formatTransactionType(transaction.type) }}
            </Badge>
            <Badge :variant="getStatusVariant(transaction.status)" class="h-6 px-3">
              {{ formatTransactionStatus(transaction.status) }}
            </Badge>
          </div>
          <h3 class="text-lg font-semibold mt-2">{{ transaction.referenceNumber }}</h3>
        </div>
        
        <div class="text-sm text-right space-y-1">
          <div>
            <span class="text-muted-foreground">Created:</span>
            <span class="ml-1 font-medium">{{ formatDateTime(transaction.createdAt) }}</span>
          </div>
          <div v-if="transaction.completedAt">
            <span class="text-muted-foreground">Completed:</span>
            <span class="ml-1 font-medium">{{ formatDateTime(transaction.completedAt) }}</span>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <!-- Location Information -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium">Location Details</h4>
        
        <div v-if="transaction.type === 'transfer'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Source Location -->
          <Card>
            <CardContent class="p-4">
              <div class="flex items-center">
                <div class="p-2 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  <ArrowUpRightIcon class="h-5 w-5" />
                </div>
                <div class="ml-3">
                  <p class="text-sm text-muted-foreground">Source Location</p>
                  <p class="font-medium">{{ getLocationName(transaction.fromLocationId || transaction.sourceLocationId) }}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <!-- Destination Location -->
          <Card>
            <CardContent class="p-4">
              <div class="flex items-center">
                <div class="p-2 rounded-md bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <ArrowDownRightIcon class="h-5 w-5" />
                </div>
                <div class="ml-3">
                  <p class="text-sm text-muted-foreground">Destination Location</p>
                  <p class="font-medium">{{ getLocationName(transaction.toLocationId || transaction.destinationLocationId) }}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div v-else>
          <Card>
            <CardContent class="p-4">
              <div class="flex items-center">
                <div class="p-2 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  <MapPinIcon class="h-5 w-5" />
                </div>
                <div class="ml-3">
                  <p class="text-sm text-muted-foreground">Location</p>
                  <p class="font-medium">{{ getLocationName(transaction.locationId) }}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <!-- Transaction Items -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium">Transaction Items</h4>
          <Badge variant="outline">
            {{ transaction.items.length }} {{ transaction.items.length === 1 ? 'item' : 'items' }}
          </Badge>
        </div>
        
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Previous Stock</TableHead>
                <TableHead>New Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(item, index) in transaction.items" :key="index">
                <TableCell class="font-medium">{{ getItemName(item.itemId) }}</TableCell>
                <TableCell>{{ getItemSku(item.itemId) }}</TableCell>
                <TableCell>
                  <span :class="getQuantityClass(item.quantity)">
                    {{ item.quantity > 0 ? '+' : '' }}{{ item.quantity }}
                  </span>
                </TableCell>
                <TableCell>
                  {{ calculatePreviousStock(item) }}
                </TableCell>
                <TableCell>
                  {{ calculateNewStock(item) }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
      
      <!-- Transaction Notes -->
      <div v-if="transaction.notes" class="space-y-3">
        <h4 class="text-sm font-medium">Notes</h4>
        <Card>
          <CardContent class="p-4 text-sm">
            {{ transaction.notes }}
          </CardContent>
        </Card>
      </div>
      
      <!-- Audit Information -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium">Audit Information</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="text-sm">
            <div class="flex justify-between py-1 border-b">
              <span class="text-muted-foreground">Created By</span>
              <span>{{ transaction.createdBy || 'System User' }}</span>
            </div>
            <div class="flex justify-between py-1 border-b">
              <span class="text-muted-foreground">Created At</span>
              <span>{{ formatDateTime(transaction.createdAt) }}</span>
            </div>
            <div class="flex justify-between py-1 border-b">
              <span class="text-muted-foreground">Transaction Type</span>
              <span>{{ formatTransactionType(transaction.type) }}</span>
            </div>
          </div>
          
          <div class="text-sm">
            <div class="flex justify-between py-1 border-b">
              <span class="text-muted-foreground">Status</span>
              <span>{{ formatTransactionStatus(transaction.status) }}</span>
            </div>
            <div v-if="transaction.completedAt" class="flex justify-between py-1 border-b">
              <span class="text-muted-foreground">Completed At</span>
              <span>{{ formatDateTime(transaction.completedAt) }}</span>
            </div>
            <div v-if="transaction.completedBy" class="flex justify-between py-1 border-b">
              <span class="text-muted-foreground">Completed By</span>
              <span>{{ transaction.completedBy }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <DialogFooter>
      <div class="flex justify-between w-full items-center">
        <div class="flex space-x-2">
          <Button v-if="canProcess" variant="outline" size="sm">
            <CheckIcon class="h-4 w-4 mr-2" />
            Complete
          </Button>
          <Button v-if="canCancel" variant="outline" size="sm" class="text-destructive">
            <XIcon class="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
        
        <div class="flex space-x-2">
          <Button variant="outline" size="sm" @click="printTransaction">
            <PrinterIcon class="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button @click="$emit('close')">Close</Button>
        </div>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { 
  FileSearchIcon, ArrowUpRightIcon, ArrowDownRightIcon, MapPinIcon,
  CheckIcon, XIcon, PrinterIcon
} from 'lucide-vue-next'
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'

const props = defineProps({
  transaction: {
    type: Object,
    default: null
  },
  items: {
    type: Array,
    default: () => []
  },
  locations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

// Computed properties
const canProcess = computed(() => {
  return props.transaction && ['pending', 'in_transit', 'awaiting_receipt'].includes(props.transaction.status)
})

const canCancel = computed(() => {
  return props.transaction && ['pending', 'in_transit', 'awaiting_receipt'].includes(props.transaction.status)
})

// Methods
function formatDateTime(dateTime) {
  if (!dateTime) return 'N/A'
  return format(new Date(dateTime), 'PPP p')
}

function formatTransactionType(type) {
  const types = {
    receipt: 'Receipt',
    issue: 'Issue',
    adjustment: 'Adjustment',
    transfer: 'Transfer',
    return: 'Return',
    bulk: 'Bulk Transfer'
  }
  return types[type] || type
}

function formatTransactionStatus(status) {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function getTypeVariant(type) {
  const variants = {
    receipt: 'success',
    issue: 'destructive',
    adjustment: 'warning',
    transfer: 'default',
    return: 'secondary',
    bulk: 'default'
  }
  return variants[type] || 'outline'
}

function getStatusVariant(status) {
  const variants = {
    pending: 'warning',
    in_transit: 'info',
    awaiting_receipt: 'info',
    completed: 'success',
    cancelled: 'destructive'
  }
  return variants[status] || 'outline'
}

function getLocationName(locationId) {
  const location = props.locations.find(loc => loc.id === locationId)
  return location ? location.name : 'Unknown Location'
}

function getItemName(itemId) {
  const item = props.items.find(i => i.id === itemId)
  return item ? item.name : 'Unknown Item'
}

function getItemSku(itemId) {
  const item = props.items.find(i => i.id === itemId)
  return item ? item.sku : 'N/A'
}

function getQuantityClass(quantity) {
  if (quantity > 0) return 'text-success'
  if (quantity < 0) return 'text-destructive'
  return ''
}

function calculatePreviousStock(transactionItem) {
  const item = props.items.find(i => i.id === transactionItem.itemId)
  if (!item) return 'N/A'
  
  let locationId
  if (props.transaction.type === 'transfer') {
    locationId = props.transaction.fromLocationId || props.transaction.sourceLocationId
  } else {
    locationId = props.transaction.locationId
  }
  
  const locationStock = item.locations.find(loc => loc.id === locationId)
  if (!locationStock) return 'N/A'
  
  // Calculate previous stock based on transaction type
  if (props.transaction.type === 'receipt' || props.transaction.type === 'adjustment' && transactionItem.quantity > 0) {
    return locationStock.quantity - transactionItem.quantity
  } else if (props.transaction.type === 'issue' || props.transaction.type === 'adjustment' && transactionItem.quantity < 0) {
    return locationStock.quantity + Math.abs(transactionItem.quantity)
  } else if (props.transaction.type === 'transfer') {
    if (props.transaction.status === 'completed') {
      return locationStock.quantity + transactionItem.quantity
    } else {
      return locationStock.quantity
    }
  }
  
  return locationStock.quantity
}

function calculateNewStock(transactionItem) {
  const item = props.items.find(i => i.id === transactionItem.itemId)
  if (!item) return 'N/A'
  
  let locationId
  if (props.transaction.type === 'transfer') {
    locationId = props.transaction.fromLocationId || props.transaction.sourceLocationId
  } else {
    locationId = props.transaction.locationId
  }
  
  const locationStock = item.locations.find(loc => loc.id === locationId)
  if (!locationStock) return 'N/A'
  
  return locationStock.quantity
}

function printTransaction() {
  // In a real app, this would generate a printable version
  console.log('Printing transaction:', props.transaction.referenceNumber)
  
  // Example of how this might be implemented
  window.print()
}
</script>

<style scoped>
/* Add custom colors for status badges */
:deep(.text-info) {
  color: hsl(214, 100%, 60%);
}

:deep(.bg-info) {
  background-color: hsl(214, 100%, 60%);
}

:deep(.text-warning) {
  color: hsl(38, 92%, 50%);
}

:deep(.bg-warning) {
  background-color: hsl(38, 92%, 50%);
}
</style>