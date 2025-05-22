<template>
  <DialogContent class="sm:max-w-[650px]">
    <DialogHeader>
      <DialogTitle>Shipment Details</DialogTitle>
      <DialogDescription>
        View and manage shipment information and status
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-4 space-y-5">
      <!-- Shipment overview -->
      <div class="flex justify-between items-start">
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="text-lg font-semibold">
              {{ shipment?.orderId || `Shipment #${shipment?.id?.substring(0, 8) || 'Unknown'}` }}
            </h3>
            <Badge :class="shipmentStatus === 'delivered' ? 'bg-green-500' : ''">
              {{ formatStatus(shipmentStatus) }}
            </Badge>
          </div>
          <p class="text-sm text-muted-foreground mt-1">Created on {{ formatDate(shipment?.createdAt) }}</p>
        </div>
        
        <div class="flex space-x-2">
          <Button v-if="canProcess" variant="outline" size="sm" @click="handleProcessShipment">
            <TruckIcon class="h-4 w-4 mr-2" />
            Process Shipment
          </Button>
          <Button v-if="canPrint" variant="outline" size="sm" @click="handlePrintLabel">
            <PrinterIcon class="h-4 w-4 mr-2" />
            Print Label
          </Button>
          <Button v-if="canTrack" variant="outline" size="sm" @click="handleTrackShipment">
            <RepeatIcon class="h-4 w-4 mr-2" />
            Track
          </Button>
        </div>
      </div>
      
      <!-- Tabs -->
      <Tabs :defaultValue="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <!-- Details Tab -->
        <TabsContent value="details" class="space-y-4 pt-4">
          <div class="grid grid-cols-2 gap-4">
            <!-- Customer Information -->
            <div class="space-y-3 border rounded-lg p-4">
              <h4 class="font-medium text-sm">Customer</h4>
              <div class="space-y-1">
                <p class="font-medium">{{ getCustomerName }}</p>
                <p v-if="shipment?.customer?.email" class="text-sm">{{ shipment.customer.email }}</p>
                <p v-if="shipment?.customer?.phone" class="text-sm">{{ shipment.customer.phone }}</p>
              </div>
            </div>
            
            <!-- Shipping Information -->
            <div class="space-y-3 border rounded-lg p-4">
              <h4 class="font-medium text-sm">Shipping Details</h4>
              <div v-if="shipment?.carrierId" class="text-sm">
                <span class="text-muted-foreground">Carrier:</span> 
                <span class="font-medium">{{ shipment?.carrierName }}</span>
              </div>
              <div v-if="shipment?.trackingNumber" class="text-sm">
                <span class="text-muted-foreground">Tracking:</span> 
                <span class="font-medium">{{ shipment?.trackingNumber }}</span>
              </div>
              <div v-if="shipment?.shippingCost" class="text-sm">
                <span class="text-muted-foreground">Cost:</span> 
                <span class="font-medium">{{ formatCurrency(shipment?.shippingCost) }}</span>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <!-- Ship From Address -->
            <div class="space-y-3 border rounded-lg p-4">
              <h4 class="font-medium text-sm">Ship From</h4>
              <address class="not-italic text-sm">
                <p>Main Warehouse</p>
                <p>123 Shipping Ln</p>
                <p>Portland, OR 97201</p>
              </address>
            </div>
            
            <!-- Ship To Address -->
            <div class="space-y-3 border rounded-lg p-4">
              <h4 class="font-medium text-sm">Ship To</h4>
              <address v-if="shipment?.shipToAddress" class="not-italic text-sm">
                <p>{{ shipment.shipToAddress?.name || getCustomerName }}</p>
                <p>{{ shipment.shipToAddress?.street || 'No address' }}</p>
                <p v-if="shipment.shipToAddress?.street2">{{ shipment.shipToAddress.street2 }}</p>
                <p>{{ shipment.shipToAddress?.city || '' }}, {{ shipment.shipToAddress?.state || '' }} {{ shipment.shipToAddress?.postalCode || '' }}</p>
                <p>{{ shipment.shipToAddress?.country || 'United States' }}</p>
              </address>
              <p v-else class="text-sm text-muted-foreground">No shipping address provided</p>
            </div>
          </div>
          
          <!-- Order Notes -->
          <div class="space-y-3 border rounded-lg p-4">
            <h4 class="font-medium text-sm">Notes</h4>
            <p v-if="shipment?.notes" class="text-sm">{{ shipment.notes }}</p>
            <p v-else class="text-sm text-muted-foreground italic">No notes for this shipment</p>
          </div>
        </TabsContent>
        
        <!-- Items Tab -->
        <TabsContent value="items" class="space-y-4 pt-4">
          <div v-if="shipment?.items?.length" class="space-y-3">
            <div v-for="(item, index) in shipment.items" :key="index" class="flex border rounded-lg p-3">
              <div class="h-12 w-12 bg-muted rounded flex items-center justify-center mr-3">
                <BoxIcon class="h-6 w-6 text-muted-foreground" />
              </div>
              <div class="flex-1">
                <div class="flex justify-between">
                  <h4 class="font-medium">{{ item.name }}</h4>
                  <p class="font-medium">{{ formatCurrency(item.price) }}</p>
                </div>
                <div class="flex justify-between text-sm">
                  <p class="text-muted-foreground">
                    SKU: {{ item.sku || 'N/A' }} | Qty: {{ item.quantity || 1 }}
                  </p>
                  <p v-if="item.weight" class="text-muted-foreground">
                    {{ item.weight }} lb
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-10 border rounded-lg">
            <PackageIcon class="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p class="text-muted-foreground">No items in this shipment</p>
          </div>
        </TabsContent>
        
        <!-- History Tab -->
        <TabsContent value="history" class="space-y-4 pt-4">
          <div v-if="shipment?.history?.length" class="space-y-0">
            <div v-for="(event, index) in shipment.history" :key="index" class="flex py-3 border-b last:border-0">
              <div class="mr-3 pt-0.5">
                <div class="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                  <ClockIcon v-if="event.type === 'status_change'" class="h-4 w-4" />
                  <PrinterIcon v-else-if="event.type === 'label_printed'" class="h-4 w-4" />
                  <XCircleIcon v-else-if="event.type === 'label_voided'" class="h-4 w-4" />
                  <CircleIcon v-else class="h-4 w-4" />
                </div>
              </div>
              <div>
                <p class="font-medium">{{ event.description }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ formatDate(event.timestamp) }} at {{ new Date(event.timestamp).toLocaleTimeString() }}
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-10 border rounded-lg">
            <InfoIcon class="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p class="text-muted-foreground">No history events available</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    
    <DialogFooter class="flex justify-between w-full">
      <Button v-if="canCancel" variant="outline" class="text-red-500 hover:text-red-600" @click="handleCancelShipment">
        <XCircleIcon class="h-4 w-4 mr-2" />
        Cancel Shipment
      </Button>
      <div v-else></div>
      
      <Button @click="$emit('close')">
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  Loader2Icon, CircleIcon, PackageIcon, TruckIcon,
  BoxIcon, InfoIcon, RepeatIcon, PrinterIcon, ClockIcon,
  XCircleIcon, ArrowDownCircleIcon
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
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
    required: true,
    default: () => ({})  // Add default empty object
  },
  carriers: {
    type: Array,
    required: true,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['close', 'print-label', 'void-label', 'process-shipment', 'track-shipment', 'cancel-shipment']);

// Computed 
const activeTab = ref('details');

// Use optional chaining to prevent undefined errors
const shipmentStatus = computed(() => props.shipment?.status || 'unknown');
const canProcess = computed(() => ['pending', 'ready_to_ship'].includes(props.shipment?.status));
const canPrint = computed(() => ['processing', 'label_created'].includes(props.shipment?.status));
const canVoid = computed(() => ['label_created'].includes(props.shipment?.status));
const canTrack = computed(() => ['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(props.shipment?.status));
const canCancel = computed(() => !['delivered', 'cancelled'].includes(props.shipment?.status));

// Safely get customer name with fallback
const getCustomerName = computed(() => {
  return props.shipment?.customer?.name || 
         props.shipment?.shipToAddress?.name || 
         props.shipment?.customerName || 
         'Unknown Customer';
});

// Format helper methods
const formatStatus = (status) => {
  if (!status) return '';
  return status.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

// Actions
const handleProcessShipment = () => {
  emit('process-shipment', props.shipment);
};

const handlePrintLabel = () => {
  emit('print-label', props.shipment);
};

const handleVoidLabel = () => {
  emit('void-label', props.shipment);
};

const handleTrackShipment = () => {
  emit('track-shipment', props.shipment);
};

const handleCancelShipment = () => {
  emit('cancel-shipment', props.shipment);
};
</script>