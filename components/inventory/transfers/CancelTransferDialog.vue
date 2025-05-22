<template>
  <DialogContent class="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Cancel Transfer</DialogTitle>
      <DialogDescription>
        Are you sure you want to cancel transfer #{{ transfer.referenceNumber }}?
      </DialogDescription>
    </DialogHeader>
    
    <div class="mt-4 space-y-4">
      <!-- Transfer Summary Card -->
      <Card>
        <CardContent class="pt-4 space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <div class="text-sm font-medium">Type</div>
              <div>{{ formatTransferType(transfer.type) }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium">Status</div>
              <Badge :variant="getStatusVariant(transfer.status)">
                {{ formatStatus(transfer.status) }}
              </Badge>
            </div>
            
            <div>
              <div class="text-sm font-medium">From</div>
              <div>{{ getLocationName(transfer.fromLocationId) }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium">To</div>
              <div>{{ getLocationName(transfer.toLocationId) }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium">Date Created</div>
              <div>{{ formatDate(transfer.createdAt) }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium">Items</div>
              <div>{{ transfer.items.length }}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert variant="destructive">
        <AlertCircleIcon class="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Cancelling a transfer cannot be undone. This will revert all inventory allocations.
        </AlertDescription>
      </Alert>
      
      <!-- Cancellation Form -->
      <form id="cancel-form" @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <div class="flex justify-between items-center">
            <Label for="cancellationReason">Reason for Cancellation</Label>
            <span class="text-xs text-destructive">* Required</span>
          </div>
          <Textarea
            id="cancellationReason"
            v-model="formData.reason"
            placeholder="Explain why this transfer is being cancelled"
            rows="3"
            required
            :class="{'border-destructive focus:border-destructive': submitted && !formData.reason}"
          />
          <div v-if="submitted && !formData.reason" class="text-xs text-destructive mt-1">
            Cancellation reason is required
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <Checkbox 
            id="confirmCancellation" 
            v-model:checked="formData.confirmed"
            required
          />
          <Label for="confirmCancellation" class="cursor-pointer">
            I understand that this action cannot be undone
          </Label>
        </div>
      </form>
    </div>
    
    <DialogFooter class="mt-6">
      <Button variant="outline" @click="$emit('close')">Back</Button>
      <Button 
        variant="destructive" 
        type="submit" 
        form="cancel-form" 
        :disabled="isSubmitting || !isFormValid"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        <XIcon v-else class="mr-2 h-4 w-4" />
        Cancel Transfer
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { 
  AlertCircleIcon,
  Loader2Icon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent
} from '@/components/ui/card'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const props = defineProps({
  transfer: { type: Object, required: true },
  locations: { type: Array, default: () => [] }
})

const emit = defineEmits(['cancel', 'close'])

const isSubmitting = ref(false)
const submitted = ref(false)
const formData = ref({
  reason: '',
  confirmed: false
})

const isFormValid = computed(() => {
  return formData.value.reason.trim() !== '' && formData.value.confirmed
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

function formatStatus(status) {
  switch (status) {
    case 'pending': return 'Pending Approval'
    case 'approved': return 'Approved'
    case 'in_transit': return 'In Transit'
    case 'awaiting_receipt': return 'Awaiting Receipt'
    default: return status
  }
}

function getStatusVariant(status) {
  switch (status) {
    case 'pending': return 'warning'
    case 'approved': return 'secondary'
    case 'in_transit': return 'info'
    case 'awaiting_receipt': return 'secondary'
    default: return 'default'
  }
}

function getLocationName(locationId) {
  const location = props.locations.find(loc => loc.id === locationId)
  return location ? location.name : locationId || '—'
}

async function handleSubmit() {
  submitted.value = true
  
  if (!isFormValid.value) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    const cancelData = {
      transferId: props.transfer.id,
      reason: formData.value.reason
    }
    
    emit('cancel', cancelData)
  } catch (error) {
    console.error('Error cancelling transfer:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>