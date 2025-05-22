<template>
  <DialogContent class="sm:max-w-[650px] max-h-[90vh] flex flex-col">
    <DialogHeader class="flex-shrink-0">
      <DialogTitle>Shipment Tracking</DialogTitle>
      <DialogDescription>
        Track the current status and history of shipment #{{ shipment?.id?.slice(0, 8) || 'Unknown' }}
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-5 py-4 relative overflow-y-auto flex-grow">
      <!-- Loading state -->
      <div v-if="loading" class="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
        <div class="flex flex-col items-center">
          <Loader2Icon class="h-8 w-8 animate-spin text-primary mb-2" />
          <p class="text-sm text-muted-foreground">Loading tracking information...</p>
        </div>
      </div>
      
      <!-- Shipment Summary -->
      <div class="rounded-lg border p-4 bg-muted/40">
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <p class="text-sm text-muted-foreground">Carrier</p>
            <p class="font-medium">{{ shipment?.carrierName || 'Unknown' }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Tracking Number</p>
            <div class="flex items-center gap-1.5">
              <p class="font-medium">{{ shipment?.trackingNumber || 'Unknown' }}</p>
              <Button variant="ghost" size="icon" class="h-5 w-5" @click="copyTrackingNumber">
                <CopyIcon class="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Status</p>
            <Badge :variant="getStatusVariant(shipment?.status)">
              {{ formatStatus(shipment?.status) }}
            </Badge>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Est. Delivery</p>
            <p v-if="shipment?.estimatedDelivery" class="font-medium">
              {{ formatDate(shipment.estimatedDelivery) }}
            </p>
            <p v-else class="text-muted-foreground text-sm italic">Not available</p>
          </div>
        </div>
        
        <!-- Carrier Tracking Link -->
        <div class="mt-4 pt-3 border-t">
          <Button 
            variant="outline" 
            class="w-full justify-between" 
            @click="openCarrierTracking"
          >
            <span>View on {{ shipment?.carrierName || 'carrier' }} website</span>
            <ExternalLinkIcon class="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
      
      <!-- Shipment Progress -->
      <div>
        <h3 class="text-sm font-medium mb-3">Shipment Progress</h3>
        
        <!-- Progress Bar -->
        <div class="relative pt-2 pb-8">
          <div class="overflow-hidden rounded-full bg-muted h-2.5">
            <div 
              class="h-full bg-primary transition-all duration-500" 
              :style="{ width: `${getProgressPercentage()}%` }"
            ></div>
          </div>
          
          <div class="flex items-center justify-between mt-2 text-xs">
            <span>Order Created</span>
            <span>Processing</span>
            <span>Shipped</span>
            <span>Out for Delivery</span>
            <span>Delivered</span>
          </div>
        </div>
        
        <!-- Tracking Timeline -->
        <div class="space-y-4 mt-6">
          <div v-if="!trackingEvents.length" class="text-center py-6">
            <PackageIcon class="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
            <p class="text-muted-foreground">No tracking events available yet</p>
          </div>
          
          <div 
            v-for="(event, index) in trackingEvents" 
            :key="index"
            class="flex"
          >
            <div class="mr-4 flex flex-col items-center">
              <div 
                class="rounded-full h-9 w-9 flex items-center justify-center flex-shrink-0"
                :class=" [
                  index === 0 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                ]"
              >
                <CheckIcon v-if="event.status === 'delivered'" class="h-5 w-5" />
                <PackageXIcon v-else-if="event.status === 'cancelled'" class="h-5 w-5" />
                <TruckIcon v-else-if="event.status === 'out_for_delivery'" class="h-5 w-5" />
                <BoxIcon v-else-if="event.status === 'shipped'" class="h-5 w-5" />
                <HourglassIcon v-else-if="event.status === 'processing'" class="h-5 w-5" />
                <FilePenIcon v-else-if="event.status === 'label_created'" class="h-5 w-5" />
                <CircleDotIcon v-else class="h-5 w-5" />
              </div>
              
              <div v-if="index !== trackingEvents.length - 1" class="h-full w-px bg-muted mt-1"></div>
            </div>
            
            <div class="pb-6">
              <div class="text-sm font-medium">{{ formatStatus(event.status) }}</div>
              <div class="text-muted-foreground text-xs mb-1.5">
                {{ formatDateTime(event.timestamp) }}
              </div>
              <div class="text-sm">{{ event.description }}</div>
              <div class="text-xs text-muted-foreground mt-1">{{ event.location }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Delivery Information -->
      <div class="rounded-lg border p-4">
        <h3 class="text-sm font-medium mb-3">Delivery Information</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <h4 class="text-xs text-muted-foreground mb-1.5">Shipping Address</h4>
            <p v-if="shipment?.shipToAddress" class="text-sm font-medium">
              {{ shipment.shipToAddress?.name || shipment.customerName || 'Unknown' }}
            </p>
            <p v-if="shipment?.shipToAddress?.street" class="text-sm">
              {{ shipment.shipToAddress.street }}
            </p>
            <p v-if="shipment?.shipToAddress" class="text-sm">
              {{ shipment.shipToAddress.city || '' }}, {{ shipment.shipToAddress.state || '' }} 
              {{ shipment.shipToAddress.postalCode || '' }}
            </p>
            <p v-if="shipment?.shipToAddress" class="text-sm">
              {{ shipment.shipToAddress.country || 'United States' }}
            </p>
            <p v-else class="text-sm text-muted-foreground">Address not available</p>
          </div>
          <div>
            <h4 class="text-xs text-muted-foreground mb-1.5">Shipping Details</h4>
            <div class="space-y-1">
              <div class="flex justify-between text-sm">
                <span>Service:</span>
                <span class="font-medium">{{ shipment?.serviceName || 'N/A' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span>Shipped date:</span>
                <span class="font-medium">{{ formatDate(shipment?.shippedAt) || 'Pending' }}</span>
              </div>
              <div class="flex justify-between text-sm" v-if="shipment?.signatureRequired">
                <span>Signature:</span>
                <span class="font-medium">Required</span>
              </div>
              <div class="flex justify-between text-sm" v-if="shipment?.insurance">
                <span>Insurance:</span>
                <span class="font-medium">{{ formatCurrency(shipment.insuranceValue) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <DialogFooter class="flex flex-col sm:flex-row gap-2 flex-shrink-0 mt-2">
      <Button variant="outline" @click="refreshTracking" :disabled="loading">
        <RefreshCwIcon v-if="!loading" class="h-4 w-4 mr-2" />
        <Loader2Icon v-else class="h-4 w-4 mr-2 animate-spin" />
        Refresh Tracking
      </Button>
      <Button @click="$emit('close')">Done</Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { 
  Loader2Icon, CopyIcon, ExternalLinkIcon, CheckIcon,
  PackageIcon, TruckIcon, BoxIcon, HourglassIcon, 
  FilePenIcon, CircleDotIcon, RefreshCwIcon, PackageXIcon
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useWarehouseStore } from '@/store/modules/warehouse/warehouse';

// Props
const props = defineProps({
  shipment: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

// Emits
const emit = defineEmits(['close']);

// Store
const warehouseStore = useWarehouseStore();
const { toast } = useToast();

// State
const loading = ref(true);
const trackingEvents = ref([]);

// Helper functions
const formatStatus = (status) => {
  if (!status) return 'Unknown';
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

const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(dateObj);
};

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
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
    'voided': 'destructive',
    'return_label_created': 'warning',
    'return_in_transit': 'warning',
    'returned': 'success'
  };
  
  return variantMap[status] || 'outline';
};

const getProgressPercentage = () => {
  const statusMap = {
    'pending': 0,
    'processing': 25,
    'label_created': 25,
    'shipped': 50,
    'in_transit': 60,
    'out_for_delivery': 85,
    'delivered': 100,
    'cancelled': 0,
    'voided': 0
  };
  
  return statusMap[props.shipment?.status] || 0;
};

const copyTrackingNumber = () => {
  if (!props.shipment?.trackingNumber) return;
  
  navigator.clipboard.writeText(props.shipment.trackingNumber);
  toast({
    title: 'Tracking number copied',
    description: 'Tracking number copied to clipboard.',
    variant: 'success'
  });
};

const openCarrierTracking = () => {
  if (!props.shipment?.trackingNumber || !props.shipment?.carrierName) {
    toast({
      title: 'Unable to track',
      description: 'Tracking information is not available.',
      variant: 'destructive'
    });
    return;
  }
  
  // Map of carrier tracking URLs
  const carrierUrls = {
    'USPS': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${props.shipment.trackingNumber}`,
    'UPS': `https://www.ups.com/track?tracknum=${props.shipment.trackingNumber}`,
    'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${props.shipment.trackingNumber}`,
    'DHL': `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${props.shipment.trackingNumber}`
  };
  
  let url = carrierUrls[props.shipment.carrierName];
  // Default fallback if carrier not in the map
  if (!url) {
    url = `https://www.google.com/search?q=${props.shipment.carrierName}+tracking+${props.shipment.trackingNumber}`;
  }
  
  window.open(url, '_blank');
};

const fetchTrackingEvents = async () => {
  if (!props.shipment?.id) {
    loading.value = false;
    return;
  }
  
  loading.value = true;
  
  try {
    const response = await warehouseStore.getShipmentTracking(props.shipment.id);
    
    if (response?.success && response?.tracking?.events) {
      trackingEvents.value = response.tracking.events.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
    } else {
      trackingEvents.value = [];
    }
  } catch (error) {
    console.error('Error fetching tracking information:', error);
    toast({
      title: 'Error',
      description: 'Could not load tracking information. Please try again.',
      variant: 'destructive'
    });
    trackingEvents.value = [];
  } finally {
    loading.value = false;
  }
};

const refreshTracking = () => {
  fetchTrackingEvents();
};

// Initialize component
onMounted(() => {
  fetchTrackingEvents();
});
</script>