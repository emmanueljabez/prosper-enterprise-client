<template>
  <DialogContent class="sm:max-w-5xl max-h-[90vh] flex flex-col">
    <DialogHeader class="flex-shrink-0">
      <DialogTitle class="flex items-center justify-between">
        <div class="flex items-center">
          <span>Transaction Details</span>
          <Badge v-if="transaction.isReversed" variant="destructive" class="ml-2">
            Reversed
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
            v-if="!transaction.isReversed"
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
        Transaction #{{ transaction.transactionNumber }}
      </DialogDescription>
    </DialogHeader>
    
    <!-- Status Banner -->
    <div v-if="transaction.isReversed" class="flex-shrink-0 bg-destructive/10 border-l-4 border-destructive p-3 mb-4">
      <div class="flex items-center">
        <BanIcon class="h-5 w-5 text-destructive mr-2" />
        <div>
          <div class="font-medium text-destructive">This transaction has been reversed</div>
          <div v-if="transaction.reversalReason" class="text-sm text-destructive/80">
            Reason: {{ transaction.reversalReason }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex-1 overflow-hidden">
      <Tabs default-value="overview" class="w-full h-full flex flex-col">
        <TabsList class="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>
        
        <!-- Overview Tab -->
        <TabsContent value="overview" class="flex-1 overflow-y-auto mt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Transaction Information -->
            <Card>
              <CardHeader>
                <CardTitle class="text-lg flex items-center">
                  <FileTextIcon class="h-5 w-5 mr-2" />
                  Transaction Information
                </CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="text-muted-foreground">Type:</div>
                  <div>
                    <Badge :variant="getTypeVariant(transaction.transactionType)">
                      {{ formatTransactionType(transaction.transactionType) }}
                    </Badge>
                  </div>
                  
                  <div class="text-muted-foreground">Transaction #:</div>
                  <div class="font-medium">{{ transaction.transactionNumber }}</div>
                  
                  <div v-if="transaction.referenceNumber" class="text-muted-foreground">Reference #:</div>
                  <div v-if="transaction.referenceNumber" class="font-medium">{{ transaction.referenceNumber }}</div>
                  
                  <div v-if="transaction.referenceType" class="text-muted-foreground">Reference Type:</div>
                  <div v-if="transaction.referenceType">{{ transaction.referenceType }}</div>
                  
                  <div v-if="transaction.purchaseOrderNumber" class="text-muted-foreground">Purchase Order:</div>
                  <div v-if="transaction.purchaseOrderNumber" class="font-medium text-blue-600">
                    {{ transaction.purchaseOrderNumber }}
                  </div>
                  
                  <div class="text-muted-foreground">Date:</div>
                  <div>{{ formatDate(transaction.transactionDate) }}</div>
                  
                  <div class="text-muted-foreground">Status:</div>
                  <div>
                    <Badge :variant="getStatusVariant(transaction.status)">
                      {{ formatStatus(transaction.status) }}
                    </Badge>
                  </div>
                  
                  <div class="text-muted-foreground">Quantity:</div>
                  <div>
                    <Badge :variant="getQuantityVariant(transaction.quantity)" class="text-sm">
                      {{ transaction.quantity > 0 ? '+' : '' }}{{ transaction.quantity || 0 }} units
                    </Badge>
                  </div>
                  
                  <div class="text-muted-foreground">Unit Cost:</div>
                  <div class="font-medium">{{ formatCurrency(transaction.unitCost || 0) }}</div>
                  
                  <div class="text-muted-foreground">Total Cost:</div>
                  <div class="font-semibold text-lg">{{ formatCurrency(transaction.totalCost || transaction.totalLandedCost || 0) }}</div>
                  
                  <div v-if="transaction.qualityStatus" class="text-muted-foreground">Quality Status:</div>
                  <div v-if="transaction.qualityStatus">
                    <Badge :variant="getQualityVariant(transaction.qualityStatus)">
                      {{ transaction.qualityStatus }}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <!-- Document References -->
            <Card v-if="transaction.deliveryNoteNumber || transaction.invoiceNumber || transaction.purchaseOrderNumber">
              <CardHeader>
                <CardTitle class="text-lg flex items-center">
                  <ClipboardListIcon class="h-5 w-5 mr-2" />
                  Document References
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <div v-if="transaction.deliveryNoteNumber" class="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span class="text-sm font-medium">Delivery Note</span>
                    <Badge variant="outline">{{ transaction.deliveryNoteNumber }}</Badge>
                  </div>
                  <div v-if="transaction.invoiceNumber" class="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span class="text-sm font-medium">Invoice</span>
                    <Badge variant="outline">{{ transaction.invoiceNumber }}</Badge>
                  </div>
                  <div v-if="transaction.purchaseOrderNumber" class="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span class="text-sm font-medium">Purchase Order</span>
                    <Badge variant="secondary">{{ transaction.purchaseOrderNumber }}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <!-- Additional Costs -->
            <Card v-if="transaction.freightCost || transaction.insuranceCost || transaction.customsDuty || transaction.otherCharges">
              <CardHeader>
                <CardTitle class="text-lg flex items-center">
                  <DollarSignIcon class="h-5 w-5 mr-2" />
                  Additional Costs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <div v-if="transaction.freightCost" class="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span class="text-sm font-medium">Freight</span>
                    <Badge variant="outline">{{ formatCurrency(transaction.freightCost) }}</Badge>
                  </div>
                  <div v-if="transaction.insuranceCost" class="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span class="text-sm font-medium">Insurance</span>
                    <Badge variant="outline">{{ formatCurrency(transaction.insuranceCost) }}</Badge>
                  </div>
                  <div v-if="transaction.customsDuty" class="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span class="text-sm font-medium">Customs Duty</span>
                    <Badge variant="outline">{{ formatCurrency(transaction.customsDuty) }}</Badge>
                  </div>
                  <div v-if="transaction.otherCharges" class="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span class="text-sm font-medium">Other Charges</span>
                    <Badge variant="outline">{{ formatCurrency(transaction.otherCharges) }}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <!-- Notes -->
            <Card v-if="transaction.notes">
              <CardHeader>
                <CardTitle class="text-lg flex items-center">
                  <StickyNoteIcon class="h-5 w-5 mr-2" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="p-3 bg-muted/30 rounded-lg">
                  <p class="text-sm">{{ transaction.notes }}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <!-- Items Tab -->
        <TabsContent value="items" class="flex-1 overflow-y-auto mt-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg flex items-center justify-between">
                <div class="flex items-center">
                  <PackageIcon class="h-5 w-5 mr-2" />
                  Transaction Items
                </div>
                <Badge variant="outline">1 Item</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Details</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Tracking</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div class="space-y-1">
                          <div class="font-medium">Transaction Item</div>
                          <div v-if="transaction.expiryDate" class="text-xs text-muted-foreground">
                            Expires: {{ formatDateShort(transaction.expiryDate) }}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge :variant="getQuantityVariant(transaction.quantity)" class="text-sm">
                          {{ transaction.quantity > 0 ? '+' : '' }}{{ transaction.quantity || 0 }}
                        </Badge>
                      </TableCell>
                      <TableCell class="font-medium">
                        {{ formatCurrency(transaction.unitCost || 0) }}
                      </TableCell>
                      <TableCell class="font-semibold">
                        {{ formatCurrency(transaction.totalCost || transaction.totalLandedCost || 0) }}
                      </TableCell>
                      <TableCell>
                        <Badge v-if="transaction.qualityStatus" :variant="getQualityVariant(transaction.qualityStatus)" class="text-xs">
                          {{ transaction.qualityStatus }}
                        </Badge>
                        <span v-else class="text-muted-foreground text-xs">-</span>
                      </TableCell>
                      <TableCell>
                        <div class="space-y-1">
                          <div v-if="transaction.lotNumber" class="text-xs">
                            <span class="text-muted-foreground">Lot:</span> {{ transaction.lotNumber }}
                          </div>
                          <div v-if="transaction.batchNumber" class="text-xs">
                            <span class="text-muted-foreground">Batch:</span> {{ transaction.batchNumber }}
                          </div>
                          <div v-if="transaction.serialNumber" class="text-xs">
                            <span class="text-muted-foreground">Serial:</span> {{ transaction.serialNumber }}
                          </div>
                          <span v-if="!transaction.lotNumber && !transaction.batchNumber && !transaction.serialNumber" class="text-muted-foreground text-xs">-</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <!-- Locations Tab -->
        <TabsContent value="locations" class="flex-1 overflow-y-auto mt-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg flex items-center">
                <MapPinIcon class="h-5 w-5 mr-2" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-4">
                    <h4 class="font-semibold text-base">Primary Location</h4>
                    <div class="p-4 border rounded-lg space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium">Name:</span>
                        <span class="text-sm">{{ transaction.effectiveLocation?.name || 'Unknown' }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium">Code:</span>
                        <Badge variant="outline" class="text-xs">{{ transaction.effectiveLocation?.code || 'N/A' }}</Badge>
                      </div>
                      <div v-if="transaction.effectiveLocation?.description" class="flex items-center justify-between">
                        <span class="text-sm font-medium">Description:</span>
                        <span class="text-sm">{{ transaction.effectiveLocation.description }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium">Type:</span>
                        <Badge variant="secondary" class="text-xs">{{ transaction.effectiveLocation?.locationType || 'N/A' }}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <!-- Audit Trail Tab -->
        <TabsContent value="audit" class="flex-1 overflow-y-auto mt-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg flex items-center">
                <ClockIcon class="h-5 w-5 mr-2" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                  <div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div class="flex-1 space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium">Transaction Created</span>
                      <span class="text-xs text-muted-foreground">{{ formatDate(transaction.created) }}</span>
                    </div>
                    <div class="text-xs text-muted-foreground">
                      Transaction #{{ transaction.transactionNumber }} was created
                    </div>
                  </div>
                </div>
                
                <div v-if="transaction.updated !== transaction.created" class="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                  <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div class="flex-1 space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium">Transaction Updated</span>
                      <span class="text-xs text-muted-foreground">{{ formatDate(transaction.updated) }}</span>
                    </div>
                    <div class="text-xs text-muted-foreground">
                      Transaction details were modified
                    </div>
                  </div>
                </div>
                
                <div v-if="transaction.isReversed" class="flex items-start space-x-3 p-3 bg-destructive/10 rounded-lg border-l-2 border-destructive">
                  <div class="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <div class="flex-1 space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-destructive">Transaction Reversed</span>
                      <span class="text-xs text-muted-foreground">{{ formatDate(transaction.updated) }}</span>
                    </div>
                    <div class="text-xs text-destructive/80">
                      {{ transaction.reversalReason || 'Transaction was reversed' }}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import {
  BanIcon,
  PrinterIcon,
  XIcon,
  FileTextIcon,
  ClipboardListIcon,
  DollarSignIcon,
  StickyNoteIcon,
  PackageIcon,
  MapPinIcon,
  ClockIcon
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
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
const hasSerialNumber = computed(() => {
  return transaction.serialNumber && transaction.serialNumber.length > 0
})

// Methods
const handleVoidClick = () => {
  emit('void-transaction', props.transaction)
}

const handlePrintDocument = () => {
  emit('print-document', props.transaction)
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

const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'MMM d, yyyy')
  } catch (e) {
    return dateString
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'KES' 
  }).format(value || 0)
}

const formatTransactionType = (type) => {
  switch (type) {
    case 'RECEIVE': return 'Receive'
    case 'ISSUE': return 'Issue'
    case 'TRANSFER': return 'Transfer'
    case 'ADJUSTMENT': return 'Adjustment'
    case 'COUNT': return 'Count'
    case 'RETURN': return 'Return'
    default: return type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : 'Unknown'
  }
}

const formatStatus = (status) => {
  switch (status) {
    case 'COMPLETED': return 'Completed'
    case 'PENDING': return 'Pending'
    case 'IN_PROGRESS': return 'In Progress'
    case 'DRAFT': return 'Draft'
    case 'CANCELLED': return 'Cancelled'
    case 'APPROVED': return 'Approved'
    default: return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Unknown'
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
    case 'RECEIVE': return 'success'
    case 'ISSUE': return 'blue'
    case 'TRANSFER': return 'purple'
    case 'ADJUSTMENT': return 'yellow'
    case 'COUNT': return 'secondary'
    case 'RETURN': return 'pink'
    default: return 'default'
  }
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'COMPLETED': return 'success'
    case 'PENDING': return 'warning'
    case 'IN_PROGRESS': return 'info'
    case 'DRAFT': return 'outline'
    case 'CANCELLED': return 'destructive'
    case 'APPROVED': return 'success'
    default: return 'default'
  }
}

const getQuantityVariant = (quantity) => {
  if (quantity > 0) return 'success'
  if (quantity < 0) return 'destructive'
  return 'secondary'
}

const getQualityVariant = (quality) => {
  switch (quality?.toLowerCase()) {
    case 'good': 
    case 'passed': 
    case 'approved': return 'success'
    case 'poor': 
    case 'failed': 
    case 'rejected': return 'destructive'
    case 'pending': 
    case 'review': return 'warning'
    default: return 'secondary'
  }
}
</script>