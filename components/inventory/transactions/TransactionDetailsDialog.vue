<template>
  <DialogContent class="sm:max-w-3xl">
    <DialogHeader>
      <DialogTitle class="flex items-center justify-between">
        <div class="flex items-center">
          <span>Transaction Details</span>
          <Badge v-if="transaction.isVoided" variant="destructive" class="ml-2">
            Voided
          </Badge>
          <Badge 
            v-else
            :variant="getStatusVariant(transaction.status)" 
            class="ml-2"
          >
            {{ formatStatus(transaction.status) }}
          </Badge>
        </div>
        <div class="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            @click="handlePrintDocument" 
            class="text-sm"
          >
            <PrinterIcon class="h-3.5 w-3.5 mr-1.5" />
            Print
          </Button>
          <Button
            v-if="!transaction.isVoided"
            variant="destructive"
            size="sm"
            @click="handleVoidClick" 
            class="text-sm"
          >
            <BanIcon class="h-3.5 w-3.5 mr-1.5" />
            Void
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            @click="$emit('close')"
          >
            <XIcon class="h-4 w-4" />
          </Button>
        </div>
      </DialogTitle>
      <DialogDescription>
        Transaction #{{ transaction.referenceNumber }}
      </DialogDescription>
    </DialogHeader>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
      <!-- Transaction Information -->
      <div class="space-y-4">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Transaction Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="text-muted-foreground">Type:</div>
              <div>
                <Badge :variant="getTypeVariant(transaction.type)">
                  {{ formatTransactionType(transaction.type) }}
                </Badge>
              </div>
              
              <div class="text-muted-foreground">Reference #:</div>
              <div class="font-medium">{{ transaction.referenceNumber }}</div>
              
              <div v-if="transaction.externalReference" class="text-muted-foreground">External Ref:</div>
              <div v-if="transaction.externalReference">{{ transaction.externalReference }}</div>
              
              <div v-if="transaction.purchaseOrderId" class="text-muted-foreground">Purchase Order:</div>
              <div v-if="transaction.purchaseOrderId" class="font-medium text-blue-600">
                PO-{{ transaction.purchaseOrderId }}
              </div>
              
              <div class="text-muted-foreground">Date:</div>
              <div>{{ formatDate(transaction.transactionDate) }}</div>
              
              <div class="text-muted-foreground">Status:</div>
              <div>{{ formatStatus(transaction.status) }}</div>
              
              <div v-if="transaction.reason" class="text-muted-foreground">Reason:</div>
              <div v-if="transaction.reason">{{ formatAdjustmentReason(transaction.reason) }}</div>
              
              <div v-if="transaction.isVoided" class="text-muted-foreground">Voided At:</div>
              <div v-if="transaction.isVoided" class="text-destructive">{{ formatDate(transaction.voidedAt) }}</div>
              
              <div v-if="transaction.isVoided" class="text-muted-foreground">Void Reason:</div>
              <div v-if="transaction.isVoided" class="text-destructive">{{ transaction.voidReason }}</div>
              
              <div class="text-muted-foreground">Created By:</div>
              <div>{{ transaction.createdBy }}</div>
              
              <div class="text-muted-foreground">Created At:</div>
              <div>{{ formatDate(transaction.createdAt) }}</div>
            </div>
          </CardContent>
        </Card>
        
        <!-- Warehouse Details -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Warehouse Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <template v-if="transaction.type === 'receive'">
                <div class="text-muted-foreground">From:</div>
                <div>{{ getWarehouseName(transaction.sourceWarehouseId) }}</div>
                <div class="text-muted-foreground">To:</div>
                <div>{{ getWarehouseName(transaction.destinationWarehouseId) }}</div>
              </template>
              
              <template v-else-if="transaction.type === 'issue'">
                <div class="text-muted-foreground">From:</div>
                <div>{{ getWarehouseName(transaction.sourceWarehouseId) }}</div>
                <div class="text-muted-foreground">To:</div>
                <div>{{ getWarehouseName(transaction.destinationWarehouseId) }}</div>
              </template>
              
              <template v-else-if="transaction.type === 'transfer'">
                <div class="text-muted-foreground">From:</div>
                <div>{{ getWarehouseName(transaction.sourceWarehouseId) }}</div>
                <div class="text-muted-foreground">To:</div>
                <div>{{ getWarehouseName(transaction.destinationWarehouseId) }}</div>
              </template>
              
              <template v-else>
                <div class="text-muted-foreground">Warehouse:</div>
                <div>{{ getWarehouseName(transaction.destinationWarehouseId) }}</div>
              </template>
            </div>
          </CardContent>
        </Card>
        
        <!-- Notes -->
        <Card v-if="transaction.notes">
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm">{{ transaction.notes }}</p>
          </CardContent>
        </Card>
      </div>
      
      <!-- Items Section -->
      <div>
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-base flex items-center justify-between">
              <span>Items ({{ transaction.items.length }})</span>
              <span class="text-muted-foreground text-sm">
                Total: {{ formatCurrency(transaction.totalValue || calculateTotal()) }}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent class="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in transaction.items" :key="item.itemId">
                  <TableCell>
                    <div class="font-medium">{{ getItemName(item.itemId) }}</div>
                    <div v-if="item.lot" class="text-xs text-muted-foreground">
                      Lot: {{ item.lot }}
                    </div>
                    <div v-if="item.expirationDate" class="text-xs text-muted-foreground">
                      Expires: {{ formatDate(item.expirationDate) }}
                    </div>
                    <div v-if="item.binLocation || item.sourceBin || item.destinationBin" class="text-xs text-muted-foreground">
                      <template v-if="item.binLocation">
                        Bin: {{ item.binLocation }}
                      </template>
                      <template v-else-if="transaction.type === 'transfer'">
                        From: {{ item.sourceBin }} → To: {{ item.destinationBin }}
                      </template>
                    </div>
                  </TableCell>
                  <TableCell>{{ item.quantity }}</TableCell>
                  <TableCell>{{ formatCurrency(item.cost) }}</TableCell>
                  <TableCell>{{ formatCurrency(item.subtotal || (item.quantity * (item.cost || 0))) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <!-- Serial Numbers -->
        <Card v-if="hasSerialNumbers" class="mt-4">
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Serial Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-wrap gap-2">
              <Badge 
                v-for="(serial, index) in allSerialNumbers" 
                :key="index" 
                variant="outline"
              >
                {{ serial }}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import {
  BanIcon,
  PrinterIcon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const props = defineProps({
  transaction: {
    type: Object,
    required: true
  },
  warehouses: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'void-transaction', 'print-document'])

// Computed properties
const hasSerialNumbers = computed(() => {
  return props.transaction.items.some(item => 
    item.serialNumbers && item.serialNumbers.length > 0
  )
})

const allSerialNumbers = computed(() => {
  const serials = []
  props.transaction.items.forEach(item => {
    if (item.serialNumbers && item.serialNumbers.length > 0) {
      serials.push(...item.serialNumbers)
    }
  })
  return serials
})

// Methods
const handleVoidClick = () => {
  emit('void-transaction', props.transaction)
}

const handlePrintDocument = () => {
  emit('print-document', props.transaction)
}

const calculateTotal = () => {
  return props.transaction.items.reduce((total, item) => {
    const itemCost = item.cost || 0
    const itemQuantity = item.quantity || 0
    return total + (itemCost * itemQuantity)
  }, 0)
}

const getWarehouseName = (warehouseId) => {
  if (!warehouseId) return 'N/A'
  const warehouse = props.warehouses.find(w => w.id === warehouseId)
  return warehouse ? warehouse.name : 'Unknown Warehouse'
}

const getItemName = (itemId) => {
  if (!itemId) return 'Unknown Item'
  const item = props.items.find(i => i.id === itemId)
  return item ? item.name : 'Unknown Item'
}

// Formatters
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(value || 0)
}

const formatTransactionType = (type) => {
  switch (type) {
    case 'receive': return 'Receive'
    case 'issue': return 'Issue'
    case 'transfer': return 'Transfer'
    case 'adjustment': return 'Adjustment'
    case 'count': return 'Count'
    case 'return': return 'Return'
    default: return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

const formatStatus = (status) => {
  switch (status) {
    case 'completed': return 'Completed'
    case 'pending': return 'Pending'
    case 'in_progress': return 'In Progress'
    case 'draft': return 'Draft'
    case 'cancelled': return 'Cancelled'
    default: return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

const formatAdjustmentReason = (reason) => {
  switch (reason) {
    case 'damage': return 'Damage'
    case 'loss': return 'Loss'
    case 'theft': return 'Theft'
    case 'expiration': return 'Expiration'
    case 'count': return 'Inventory Count'
    case 'quality': return 'Quality Control'
    case 'other': return 'Other'
    default: return reason ? reason.charAt(0).toUpperCase() + reason.slice(1) : 'N/A'
  }
}

const getTypeVariant = (type) => {
  switch (type) {
    case 'receive': return 'success'
    case 'issue': return 'blue'
    case 'transfer': return 'purple'
    case 'adjustment': return 'yellow'
    case 'count': return 'secondary'
    case 'return': return 'pink'
    default: return 'default'
  }
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'pending': return 'warning'
    case 'in_progress': return 'info'
    case 'draft': return 'outline'
    case 'cancelled': return 'destructive'
    default: return 'default'
  }
}
</script>