<template>
  <DialogContent class="sm:max-w-[650px] max-h-[85vh] flex flex-col">
    <DialogHeader>
      <DialogTitle>Receive Transfer</DialogTitle>
      <DialogDescription>
        Receive transfer #{{ transfer.referenceNumber }} at {{ getLocationName(transfer.toLocationId) }}
      </DialogDescription>
    </DialogHeader>
    
    <div class="flex-1 overflow-y-auto py-2 space-y-4">
      <!-- Transfer Status -->
      <div class="border p-3 rounded-md bg-muted/30">
        <div class="flex items-center gap-2">
          <TruckIcon class="h-5 w-5 text-primary" />
          <div>
            <div class="text-sm font-medium">Current Status</div>
            <div>{{ formatStatus(transfer.status) }}</div>
          </div>
        </div>
      </div>
      
      <form id="receive-form" @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Items Table -->
        <div class="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead class="w-[100px]">Shipped</TableHead>
                <TableHead class="w-[130px]">Received</TableHead>
                <TableHead class="w-[130px]">Issue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(item, index) in formData.items" :key="index">
                <TableCell>
                  <div class="font-medium">{{ item.name || getItemName(item.itemId) }}</div>
                  <div class="text-xs text-muted-foreground">{{ item.sku || '' }}</div>
                </TableCell>
                <TableCell>{{ item.quantity }}</TableCell>
                <TableCell>
                  <Input 
                    v-model.number="item.receivedQuantity" 
                    type="number"
                    min="0"
                    required
                    :class="{'border-red-300 focus:border-red-300 focus:ring-red-300': hasDiscrepancy(item)}"
                  />
                </TableCell>
                <TableCell>
                  <div v-if="hasDiscrepancy(item)" class="text-center">
                    <Badge :variant="getDiscrepancyVariant(item)">
                      {{ getDiscrepancyText(item) }}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <!-- Discrepancy Section -->
        <div v-if="hasAnyDiscrepancy" class="border rounded-md p-4 bg-amber-50 border-amber-200">
          <div class="flex gap-3 items-start">
            <AlertTriangleIcon class="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 class="font-medium text-amber-800">Discrepancy Detected</h4>
              <p class="text-sm text-amber-700 mb-2">
                The quantities received do not match the quantities shipped. Please provide a reason for each discrepancy.
              </p>
              
              <div class="space-y-2 mt-3">
                <div v-for="(item, index) in discrepancyItems" :key="index">
                  <Label :for="`discrepancy-${index}`">
                    Reason for discrepancy on {{ item.name || getItemName(item.itemId) }} 
                    ({{ getDiscrepancyText(item) }})
                  </Label>
                  <Input 
                    :id="`discrepancy-${index}`" 
                    v-model="item.discrepancyReason" 
                    placeholder="Explain reason for discrepancy"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Receipt Notes -->
        <div>
          <div class="flex justify-between items-center">
            <Label for="receiptNotes">Receipt Notes</Label>
            <span class="text-xs text-muted-foreground">Optional</span>
          </div>
          <Textarea 
            id="receiptNotes" 
            v-model="formData.notes"
            placeholder="Add any notes about this receipt (optional)" 
            rows="3"
          />
        </div>
        
        <!-- Destination Bins -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-medium">Destination Bins</h4>
            <span class="text-xs text-muted-foreground">Optional</span>
          </div>
          
          <div v-for="(item, index) in formData.items" :key="`bin-${index}`" class="mb-2">
            <Label :for="`bin-${index}`">{{ item.name || getItemName(item.itemId) }} Location</Label>
            <div class="flex gap-2">
              <Input 
                :id="`bin-${index}`" 
                v-model="item.destinationBin"
                :placeholder="item.destinationBin || 'Enter bin/shelf location'" 
              />
            </div>
          </div>
        </div>
      </form>
    </div>
    
    <DialogFooter class="mt-6">
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        type="submit" 
        form="receive-form" 
        :disabled="isSubmitting || !isValid"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        <CheckSquareIcon v-else class="mr-2 h-4 w-4" />
        Confirm Receipt
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  AlertTriangleIcon,
  CheckSquareIcon,
  Loader2Icon,
  TruckIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

const emit = defineEmits(['receive', 'close'])

const isSubmitting = ref(false)
const formData = ref({
  notes: '',
  items: []
})

// Initialize form data with transfer items
onMounted(() => {
  formData.value.items = props.transfer.items.map(item => ({
    itemId: item.itemId,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    receivedQuantity: item.quantity, // Default to shipped quantity
    destinationBin: item.destinationBin || '',
    discrepancyReason: '',
    hasDiscrepancy: false
  }))
})

// Computed properties
const hasAnyDiscrepancy = computed(() => {
  return formData.value.items.some(item => hasDiscrepancy(item))
})

const discrepancyItems = computed(() => {
  return formData.value.items.filter(item => hasDiscrepancy(item))
})

const isValid = computed(() => {
  // All items must have receivedQuantity set
  const allItemsValid = formData.value.items.every(item => 
    item.receivedQuantity !== undefined && 
    item.receivedQuantity !== null &&
    item.receivedQuantity >= 0
  )
  
  // All discrepancy items must have a reason
  const allDiscrepanciesExplained = discrepancyItems.value.every(item => 
    !!item.discrepancyReason
  )
  
  return allItemsValid && allDiscrepanciesExplained
})

// Helper functions
function formatStatus(status) {
  switch (status) {
    case 'in_transit': return 'In Transit'
    case 'awaiting_receipt': return 'Awaiting Receipt'
    default: return status
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

function hasDiscrepancy(item) {
  return item.quantity !== item.receivedQuantity
}

function getDiscrepancyVariant(item) {
  if (!hasDiscrepancy(item)) return 'outline'
  return item.receivedQuantity > item.quantity ? 'success' : 'destructive'
}

function getDiscrepancyText(item) {
  if (!hasDiscrepancy(item)) return ''
  const diff = item.receivedQuantity - item.quantity
  return diff > 0 ? `+${diff}` : diff.toString()
}

async function handleSubmit() {
  isSubmitting.value = true
  
  try {
    // Process the form data for submission
    const receiptData = {
      transferId: props.transfer.id,
      notes: formData.value.notes,
      items: formData.value.items.map(item => ({
        itemId: item.itemId,
        receivedQuantity: item.receivedQuantity,
        destinationBin: item.destinationBin || null,
        hasDiscrepancy: hasDiscrepancy(item),
        discrepancyReason: hasDiscrepancy(item) ? item.discrepancyReason : null
      }))
    }
    
    emit('receive', receiptData)
  } catch (error) {
    console.error('Error receiving transfer:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>