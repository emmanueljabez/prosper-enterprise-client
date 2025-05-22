<template>
  <DialogContent class="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Cancel Shipment</DialogTitle>
      <DialogDescription>
        Are you sure you want to cancel this shipment? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-4 py-4">
      <!-- Shipment Summary -->
      <div class="rounded-lg border bg-muted/40 p-4">
        <div class="flex justify-between mb-2">
          <div class="font-medium">Shipment #{{ shipment.id.slice(0, 8) }}</div>
          <Badge :variant="getStatusVariant(shipment.status)">
            {{ formatStatus(shipment.status) }}
          </Badge>
        </div>
        
        <div class="grid grid-cols-2 gap-3 text-sm mb-2">
          <div>
            <p class="text-muted-foreground">Order:</p>
            <p class="font-medium">{{ shipment.orderId || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Customer:</p>
            <p class="font-medium">{{ shipment.customerName }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Carrier:</p>
            <p class="font-medium">{{ shipment.carrierName || 'Not assigned' }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Created on:</p>
            <p class="font-medium">{{ formatDate(shipment.createdAt) }}</p>
          </div>
        </div>
      </div>
      
      <!-- Warning -->
      <Alert variant="warning">
        <AlertCircleIcon class="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Cancelling a shipment will update your inventory and order status. If a label has already been created, it may still be charged to your account.
        </AlertDescription>
      </Alert>
      
      <!-- Cancellation Reason -->
      <div class="space-y-2">
        <Label for="cancel-reason">Cancellation Reason <span class="text-destructive">*</span></Label>
        <Select v-model="cancellationReason" required>
          <SelectTrigger id="cancel-reason" :class="{ 'border-destructive': showErrors && !cancellationReason }">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer_request">Customer Requested Cancellation</SelectItem>
            <SelectItem value="out_of_stock">Item(s) Out of Stock</SelectItem>
            <SelectItem value="shipping_address">Invalid Shipping Address</SelectItem>
            <SelectItem value="duplicate">Duplicate Order</SelectItem>
            <SelectItem value="fraud">Suspected Fraud</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <p v-if="showErrors && !cancellationReason" class="text-xs text-destructive mt-1">
          Please select a cancellation reason
        </p>
      </div>
      
      <!-- Additional Notes -->
      <div class="space-y-2">
        <Label for="notes">Additional Notes</Label>
        <Textarea id="notes" v-model="notes" placeholder="Enter any additional information about this cancellation" rows="3" />
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button variant="destructive" @click="confirmCancellation" :disabled="isProcessing">
        <Loader2Icon v-if="isProcessing" class="h-4 w-4 mr-2 animate-spin" />
        <span>{{ isProcessing ? 'Cancelling...' : 'Confirm Cancellation' }}</span>
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref } from 'vue';
import {
  AlertCircleIcon,
  Loader2Icon
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

// Props
const props = defineProps({
  shipment: {
    type: Object,
    required: true
  }
});

// Emits
const emit = defineEmits(['close', 'shipment-cancelled']);

// State
const cancellationReason = ref('');
const notes = ref('');
const showErrors = ref(false);
const isProcessing = ref(false);

// Helper functions
const formatStatus = (status) => {
  if (!status) return '';
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric'
  }).format(dateObj);
};

const getStatusVariant = (status) => {
  const variantMap = {
    'pending': 'outline',
    'processing': 'secondary',
    'label_created': 'secondary',
    'shipped': 'default',
    'in_transit': 'default',
    'out_for_delivery': 'default',
    'delivered': 'success',
    'cancelled': 'destructive',
    'voided': 'destructive'
  };
  
  return variantMap[status] || 'outline';
};

// Handle confirmation
const confirmCancellation = async () => {
  if (!cancellationReason.value) {
    showErrors.value = true;
    return;
  }
  
  isProcessing.value = true;
  
  try {
    // Prepare cancellation data
    const cancellationData = {
      ...props.shipment,
      cancellationReason: cancellationReason.value,
      cancellationNotes: notes.value,
      cancelledAt: new Date().toISOString()
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    emit('shipment-cancelled', cancellationData);
  } catch (error) {
    console.error('Error cancelling shipment:', error);
    // Error handling could be added here
  } finally {
    isProcessing.value = false;
  }
};
</script>