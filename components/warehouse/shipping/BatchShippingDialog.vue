<template>
  <DialogContent class="sm:max-w-[800px]">
    <DialogHeader>
      <DialogTitle>Batch Process Shipments</DialogTitle>
      <DialogDescription>
        Process multiple shipments simultaneously to save time.
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-6 py-4">
      <!-- Shipment Selection Section -->
      <div v-if="!processingStarted">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium">Select Shipments to Process</h3>
          <div class="flex items-center space-x-2">
            <Button variant="ghost" size="sm" @click="toggleAllShipments">
              {{ allShipmentsSelected ? 'Deselect All' : 'Select All' }}
            </Button>
            <Select v-model="filterStatus" class="w-36">
              <SelectTrigger size="sm">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="label_created">Label Created</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <!-- Shipments List -->
        <div class="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">
                  <Checkbox
                    id="select-all"
                    :checked="allShipmentsSelected"
                    @update:checked="toggleAllShipments"
                  />
                </TableHead>
                <TableHead>Order/Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="shipment in filteredPendingShipments" :key="shipment.id">
                <TableCell class="p-2">
                  <Checkbox
                    :id="`shipment-${shipment.id}`"
                    v-model="selectedShipments[shipment.id]"
                  />
                </TableCell>
                <TableCell>
                  <div class="flex flex-col">
                    <span class="font-medium">{{ shipment.orderId || 'N/A' }}</span>
                    <span class="text-xs text-muted-foreground">{{ shipment.customerName }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(shipment.status)">
                    {{ formatStatus(shipment.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  {{ getItemCount(shipment) }}
                </TableCell>
                <TableCell>
                  {{ formatAddress(shipment.shipToAddress) }}
                </TableCell>
                <TableCell>
                  {{ formatDate(shipment.createdAt) }}
                </TableCell>
              </TableRow>
              
              <TableRow v-if="filteredPendingShipments.length === 0">
                <TableCell colspan="6" class="h-32 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <PackageIcon class="h-8 w-8 text-muted-foreground opacity-40 mb-2" />
                    <span class="text-muted-foreground">No shipments available for batch processing</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <!-- Summary and Batch Settings -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Batch Processing Settings -->
          <div class="rounded-lg border p-4">
            <h3 class="text-sm font-medium mb-3">Batch Settings</h3>
            <div class="space-y-4">
              <div class="space-y-2">
                <Label for="carrier">Shipping Carrier</Label>
                <Select v-model="batchSettings.carrierId">
                  <SelectTrigger id="carrier">
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="carrier in carriers" 
                      :key="carrier.id" 
                      :value="carrier.id"
                    >
                      {{ carrier.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div class="space-y-2">
                <Label for="service">Shipping Service</Label>
                <Select v-model="batchSettings.serviceId" :disabled="!batchSettings.carrierId">
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="service in availableServices" 
                      :key="service.id" 
                      :value="service.id"
                    >
                      {{ service.name }} - {{ formatCurrency(service.cost) }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div class="flex items-center space-x-2">
                <Checkbox id="auto-print" v-model="batchSettings.autoPrintLabels" />
                <Label for="auto-print">Auto-print shipping labels</Label>
              </div>
            </div>
          </div>
          
          <!-- Selection Summary -->
          <div class="rounded-lg border p-4">
            <h3 class="text-sm font-medium mb-3">Selection Summary</h3>
            <div class="space-y-1">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Total shipments:</span>
                <span class="font-medium">{{ filteredPendingShipments.length }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Selected shipments:</span>
                <span class="font-medium">{{ selectedShipmentCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Estimated time:</span>
                <span class="font-medium">{{ getEstimatedProcessingTime() }}</span>
              </div>
            </div>
            
            <Separator class="my-3" />
            
            <div class="rounded-md bg-muted/50 p-3 text-sm">
              <p v-if="selectedShipmentCount > 0">
                You are about to process <span class="font-bold">{{ selectedShipmentCount }}</span> shipments. 
                This will generate labels and update all shipment statuses to "Processing".
              </p>
              <p v-else class="text-muted-foreground italic">
                No shipments selected for processing.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Processing Screen -->
      <div v-else class="space-y-6">
        <div class="text-center pb-2">
          <h3 class="text-lg font-medium mb-1">Processing Shipments</h3>
          <p class="text-muted-foreground">Please wait while we process your shipments</p>
        </div>
        
        <!-- Overall Progress -->
        <div class="space-y-2">
          <div class="flex justify-between text-sm mb-1">
            <span>Overall Progress</span>
            <span>{{ processedCount }} of {{ shipmentsToProcess.length }} processed</span>
          </div>
          <div class="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary transition-all duration-300 ease-in-out" 
              :style="{width: `${(processedCount / shipmentsToProcess.length) * 100}%`}"
            ></div>
          </div>
        </div>
        
        <!-- Processing List -->
        <div class="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader class="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead class="w-[200px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="shipment in shipmentsToProcess" :key="shipment.id">
                <TableCell>{{ shipment.orderId || shipment.id.slice(0, 8) }}</TableCell>
                <TableCell>{{ shipment.customerName }}</TableCell>
                <TableCell>
                  <div v-if="processingStatus[shipment.id] === 'waiting'" class="flex items-center text-muted-foreground">
                    <ClockIcon class="h-4 w-4 mr-2" />
                    <span>Waiting</span>
                  </div>
                  <div v-else-if="processingStatus[shipment.id] === 'processing'" class="flex items-center text-blue-500">
                    <Loader2Icon class="h-4 w-4 mr-2 animate-spin" />
                    <span>Processing</span>
                  </div>
                  <div v-else-if="processingStatus[shipment.id] === 'complete'" class="flex items-center text-green-500">
                    <CheckIcon class="h-4 w-4 mr-2" />
                    <span>Complete</span>
                  </div>
                  <div v-else-if="processingStatus[shipment.id] === 'error'" class="flex items-center text-red-500">
                    <XIcon class="h-4 w-4 mr-2" />
                    <span>Error</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <!-- Completion Summary (shown when done) -->
        <div v-if="processingComplete" class="rounded-lg border p-4 bg-muted/30">
          <h3 class="text-sm font-medium mb-2">Processing Complete</h3>
          <div class="space-y-1">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Total processed:</span>
              <span class="font-medium">{{ processedCount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Successful:</span>
              <span class="font-medium text-green-600">{{ successCount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Failed:</span>
              <span class="font-medium text-red-600">{{ failedCount }}</span>
            </div>
            <div v-if="batchSettings.autoPrintLabels && successCount > 0" class="pt-2 text-sm">
              <InfoIcon class="h-4 w-4 inline-block mr-1 text-blue-500" />
              {{ successCount }} shipping labels have been sent to your printer.
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <DialogFooter>
      <div v-if="!processingStarted">
        <Button 
          variant="outline" 
          @click="$emit('close')"
        >
          Cancel
        </Button>
        <Button 
          variant="default" 
          class="ml-2" 
          @click="startBatchProcessing" 
          :disabled="selectedShipmentCount === 0 || !canStartProcessing"
        >
          Process {{ selectedShipmentCount }} Shipments
        </Button>
      </div>
      <div v-else>
        <Button 
          variant="outline" 
          @click="$emit('close')" 
          :disabled="!processingComplete && isProcessing"
        >
          {{ processingComplete ? 'Close' : 'Cancel' }}
        </Button>
        <Button 
          v-if="processingComplete" 
          variant="default" 
          class="ml-2" 
          @click="downloadReport"
        >
          Download Report
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { 
  CheckIcon, XIcon, PackageIcon, ClockIcon, 
  Loader2Icon, InfoIcon
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
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
  pendingShipments: {
    type: Array,
    required: true,
    default: () => []
  },
  carriers: {
    type: Array,
    required: true,
    default: () => []
  },
});

// Emits
const emit = defineEmits(['close', 'batch-processed']);

// State
const selectedShipments = ref({});
const filterStatus = ref('all');
const processingStarted = ref(false);
const isProcessing = ref(false);
const processingComplete = ref(false);
const shipmentsToProcess = ref([]);
const processingStatus = ref({});
const processedCount = ref(0);
const successCount = ref(0);
const failedCount = ref(0);

const batchSettings = ref({
  carrierId: '',
  carrierName: '',
  serviceId: '',
  serviceName: '',
  autoPrintLabels: true
});

// Computed values
const filteredPendingShipments = computed(() => {
  if (filterStatus.value === 'all') {
    return props.pendingShipments;
  }
  return props.pendingShipments.filter(shipment => shipment.status === filterStatus.value);
});

const allShipmentsSelected = computed(() => {
  if (filteredPendingShipments.value.length === 0) return false;
  return filteredPendingShipments.value.every(shipment => selectedShipments.value[shipment.id]);
});

const selectedShipmentCount = computed(() => {
  return Object.values(selectedShipments.value).filter(selected => selected).length;
});

const availableServices = computed(() => {
  if (!batchSettings.value.carrierId) return [];
  
  const carrier = props.carriers.find(c => c.id === batchSettings.value.carrierId);
  if (!carrier) return [];
  
  return carrier.services || [
    { id: 'ground', name: 'Ground', cost: 9.99 },
    { id: 'priority', name: 'Priority', cost: 14.99 },
    { id: 'express', name: 'Express', cost: 24.99 }
  ];
});

const canStartProcessing = computed(() => {
  return batchSettings.value.carrierId && batchSettings.value.serviceId;
});

// Watch for carrier changes to reset service
watch(() => batchSettings.value.carrierId, (newValue) => {
  if (newValue) {
    const carrier = props.carriers.find(c => c.id === newValue);
    if (carrier) {
      batchSettings.value.carrierName = carrier.name;
    }
    batchSettings.value.serviceId = '';
    batchSettings.value.serviceName = '';
  }
});

// Watch for service changes to update service name
watch(() => batchSettings.value.serviceId, (newValue) => {
  if (newValue) {
    const service = availableServices.value.find(s => s.id === newValue);
    if (service) {
      batchSettings.value.serviceName = service.name;
    }
  }
});

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

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const formatAddress = (address) => {
  if (!address) return 'N/A';
  return `${address.city}, ${address.state} ${address.postalCode}`;
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

const getItemCount = (shipment) => {
  const items = shipment.items || [];
  if (items.length === 0) return 'No items';
  
  const totalQuantity = items.reduce((total, item) => total + (item.quantity || 1), 0);
  return `${items.length} item${items.length !== 1 ? 's' : ''} (${totalQuantity} units)`;
};

const toggleAllShipments = () => {
  const newValue = !allShipmentsSelected.value;
  filteredPendingShipments.value.forEach(shipment => {
    selectedShipments.value[shipment.id] = newValue;
  });
};

const getEstimatedProcessingTime = () => {
  // Rough estimate based on selected shipments
  const baseTimePerShipment = 2; // seconds
  const totalSeconds = selectedShipmentCount.value * baseTimePerShipment;
  
  if (totalSeconds < 60) {
    return `${totalSeconds} seconds`;
  } else {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} min ${seconds} sec`;
  }
};

// Process a single shipment
const processShipment = async (shipment) => {
  try {
    processingStatus.value[shipment.id] = 'processing';
    
    // Update shipment with batch settings
    const updatedShipment = {
      ...shipment,
      carrierId: batchSettings.value.carrierId,
      carrierName: batchSettings.value.carrierName,
      serviceId: batchSettings.value.serviceId,
      serviceName: batchSettings.value.serviceName
    };
    
    // Simulate processing time (1-2 seconds per shipment)
    const processingTime = 1000 + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate success rate (90% success)
    const success = Math.random() < 0.9;
    
    if (success) {
      processingStatus.value[shipment.id] = 'complete';
      successCount.value++;
    } else {
      processingStatus.value[shipment.id] = 'error';
      failedCount.value++;
    }
    
    processedCount.value++;
    
    return { shipment: updatedShipment, success };
  } catch (error) {
    console.error(`Error processing shipment ${shipment.id}:`, error);
    processingStatus.value[shipment.id] = 'error';
    failedCount.value++;
    processedCount.value++;
    return { shipment, success: false, error };
  }
};

// Start batch processing
const startBatchProcessing = async () => {
  processingStarted.value = true;
  isProcessing.value = true;
  
  // Get selected shipments
  shipmentsToProcess.value = filteredPendingShipments.value.filter(
    shipment => selectedShipments.value[shipment.id]
  );
  
  // Initialize processing status
  shipmentsToProcess.value.forEach(shipment => {
    processingStatus.value[shipment.id] = 'waiting';
  });
  
  // Process shipments one by one
  const processedShipments = [];
  
  for (const shipment of shipmentsToProcess.value) {
    const result = await processShipment(shipment);
    if (result.success) {
      processedShipments.push(result.shipment);
    }
  }
  
  // Complete processing
  isProcessing.value = false;
  processingComplete.value = true;
  
  // If there are successfully processed shipments, emit the event
  if (processedShipments.length > 0) {
    emit('batch-processed', processedShipments);
  }
};

// Download batch processing report
const downloadReport = () => {
  // Create report data
  const reportData = {
    date: new Date().toISOString(),
    totalProcessed: processedCount.value,
    successful: successCount.value,
    failed: failedCount.value,
    carrier: batchSettings.value.carrierName,
    service: batchSettings.value.serviceName,
    shipments: Object.entries(processingStatus.value).map(([id, status]) => {
      const shipment = shipmentsToProcess.value.find(s => s.id === id);
      return {
        id,
        orderId: shipment?.orderId,
        customer: shipment?.customerName,
        status
      };
    })
  };
  
  // Convert to CSV
  const headers = ['ID', 'Order ID', 'Customer', 'Status'];
  const csvRows = [headers];
  
  reportData.shipments.forEach(shipment => {
    csvRows.push([
      shipment.id,
      shipment.orderId,
      shipment.customer,
      shipment.status
    ]);
  });
  
  // Create CSV content
  const csvContent = csvRows.map(row => row.join(',')).join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `batch-shipment-report-${new Date().toISOString().slice(0, 10)}.csv`);
  a.click();
};
</script>