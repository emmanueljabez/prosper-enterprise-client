<template>
  <DialogContent class="sm:max-w-[550px]">
    <DialogHeader>
      <DialogTitle>Approve Transfer</DialogTitle>
      <DialogDescription>
        Review and approve transfer #{{ transfer.referenceNumber }}
      </DialogDescription>
    </DialogHeader>
    
    <div class="mt-4 space-y-4">
      <!-- Transfer Summary -->
      <div class="grid grid-cols-2 gap-2 border rounded-md p-4 bg-muted/30">
        <div>
          <div class="text-sm font-medium">Type</div>
          <div>{{ formatTransferType(transfer.type) }}</div>
        </div>
        
        <div>
          <div class="text-sm font-medium">Reference</div>
          <div>{{ transfer.referenceNumber }}</div>
        </div>
        
        <div>
          <div class="text-sm font-medium">From</div>
          <div>{{ getLocationName(transfer.fromLocationId) }}</div>
        </div>
        
        <div>
          <div class="text-sm font-medium">To</div>
          <div>{{ getLocationName(transfer.toLocationId) }}</div>
        </div>
        
        <div v-if="transfer.expectedShipDate">
          <div class="text-sm font-medium">Expected Ship</div>
          <div>{{ formatDate(transfer.expectedShipDate) }}</div>
        </div>
        
        <div>
          <div class="text-sm font-medium">Items</div>
          <div>{{ transfer.items?.length || 0 }}</div>
        </div>
      </div>
      
      <!-- Items Table -->
      <div class="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in transfer.items" :key="item.itemId">
              <TableCell>
                <div class="font-medium">{{ item.name || getItemName(item.itemId) }}</div>
                <div class="text-xs text-muted-foreground">{{ item.sku || '' }}</div>
              </TableCell>
              <TableCell>{{ item.quantity }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      <!-- Approval Form -->
      <form id="approval-form" @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <div class="flex justify-between items-center">
            <Label for="approvalNotes">Approval Notes</Label>
            <span class="text-xs text-muted-foreground">Optional</span>
          </div>
          <Textarea
            id="approvalNotes"
            v-model="formData.notes"
            placeholder="Add any notes for this approval (optional)"
            rows="3"
          />
        </div>
        
        <div class="flex items-center space-x-2">
          <Checkbox id="markAsShipped" v-model:checked="formData.markAsShipped" />
          <Label for="markAsShipped" class="cursor-pointer">Mark as shipped immediately</Label>
        </div>
        
        <div v-if="formData.markAsShipped" class="space-y-3 border-l-2 pl-4 border-primary/20">
          <div>
            <Label for="shippingMethod">Shipping Method</Label>
            <Select v-model="formData.shippingInfo.method">
              <SelectTrigger id="shippingMethod">
                <SelectValue placeholder="Select shipping method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company_vehicle">Company Vehicle</SelectItem>
                <SelectItem value="commercial_carrier">Commercial Carrier</SelectItem>
                <SelectItem value="hand_delivery">Hand Delivery</SelectItem>
                <SelectItem value="internal_transfer">Internal Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label for="trackingNumber">Tracking Number</Label>
            <Input
              id="trackingNumber"
              v-model="formData.shippingInfo.trackingNumber"
              placeholder="Optional tracking number"
            />
          </div>
          
          <div>
            <Label for="packageCount">Package Count</Label>
            <Input
              id="packageCount"
              v-model.number="formData.shippingInfo.packageCount"
              type="number"
              min="1"
              placeholder="Number of packages"
            />
          </div>
        </div>
      </form>
    </div>
    
    <DialogFooter class="mt-6">
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        type="submit" 
        form="approval-form" 
        :disabled="isSubmitting"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        <CheckIcon v-else class="mr-2 h-4 w-4" />
        Approve Transfer
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref } from 'vue'
import { format } from 'date-fns'
import { 
  CheckIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
  transfer: { type: Object, required: true },
  locations: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] }
})

const emit = defineEmits(['approve', 'close'])

const isSubmitting = ref(false)
const formData = ref({
  notes: '',
  markAsShipped: false,
  shippingInfo: {
    method: 'company_vehicle',
    trackingNumber: '',
    packageCount: 1
  }
})

// Helper functions
function formatDate(date) {
  if (!date) return '—'
  try {
    return format(new Date(date), 'MMM d, yyyy')
  } catch (e) {
    return date
  }
}

function formatTransferType(type) {
  switch (type) {
    case 'standard': return 'Standard Transfer'
    case 'return': return 'Return Transfer'
    case 'adjustment': return 'Inventory Adjustment'
    case 'bulk': return 'Bulk Transfer'
    default: return type
  }
}

function getLocationName(locationId) {
  const location = props.locations.find(loc => loc.id === locationId)
  return location ? location.name : locationId || '—'
}

function getItemName(itemId) {
  const item = props.items.find(item => item.id === itemId)
  return item ? item.name : itemId
}

async function handleSubmit() {
  isSubmitting.value = true
  
  try {
    const approvalData = {
      transferId: props.transfer.id,
      notes: formData.value.notes,
      markAsShipped: formData.value.markAsShipped,
      shippingInfo: formData.value.markAsShipped ? formData.value.shippingInfo : undefined
    }
    
    emit('approve', approvalData)
  } catch (error) {
    console.error('Error approving transfer:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>