<template>
  <DialogContent class="sm:max-w-[550px] max-h-[90vh] flex flex-col overflow-hidden">
    <DialogHeader class="flex-shrink-0">
      <DialogTitle>Create Return Label</DialogTitle>
      <DialogDescription>
        Generate a return shipping label for order #{{ shipment?.orderId || 'Unknown' }}.
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-4 py-4 overflow-y-auto flex-grow">
      <!-- Original Shipment Info -->
      <div class="rounded-lg border p-4 bg-muted/40 mb-4">
        <h3 class="text-sm font-medium mb-2">Original Shipment Details</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-muted-foreground">Order #:</p>
            <p class="font-medium">{{ shipment?.orderId || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Delivered:</p>
            <p class="font-medium">{{ formatDate(shipment?.deliveredAt) || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Customer:</p>
            <p class="font-medium">{{ shipment?.customerName || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Tracking #:</p>
            <p class="font-medium">{{ shipment?.trackingNumber || 'N/A' }}</p>
          </div>
        </div>
      </div>
      
      <!-- Return Form -->
      <div class="space-y-4">
        <!-- Return Reason -->
        <div class="space-y-2">
          <Label for="return-reason">Return Reason <span class="text-destructive">*</span></Label>
          <Select v-model="returnData.reason" required>
            <SelectTrigger id="return-reason" :class="{ 'border-destructive': showErrors && !returnData.reason }">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wrong_item">Wrong Item Received</SelectItem>
              <SelectItem value="defective">Defective Product</SelectItem>
              <SelectItem value="damaged">Damaged in Transit</SelectItem>
              <SelectItem value="not_as_described">Not as Described</SelectItem>
              <SelectItem value="unwanted">No Longer Wanted</SelectItem>
              <SelectItem value="wrong_size">Wrong Size</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="showErrors && !returnData.reason" class="text-xs text-destructive mt-1">
            Please select a return reason
          </p>
        </div>
        
        <!-- Return Items -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label>Return Items</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              class="h-8" 
              @click="toggleAllItems"
              :disabled="!returnData.items || returnData.items.length === 0"
            >
              {{ allItemsSelected ? 'Deselect All' : 'Select All' }}
            </Button>
          </div>
          <div class="rounded-lg border p-2 max-h-[200px] overflow-y-auto">
            <div 
              v-if="returnData.items && returnData.items.length > 0" 
              v-for="(item, index) in returnData.items" 
              :key="index" 
              class="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded"
            >
              <Checkbox v-model="returnData.items[index].selected" :id="`item-${index}`" />
              <Label :for="`item-${index}`" class="flex-1 flex items-center cursor-pointer">
                <div class="flex-1">
                  <p>{{ item.name }}</p>
                  <p class="text-xs text-muted-foreground">SKU: {{ item.sku || 'N/A' }}</p>
                </div>
                <div class="text-right">
                  <p>{{ item.quantity || 1 }}x</p>
                  <p class="text-xs text-muted-foreground">{{ formatCurrency(item.price) }}</p>
                </div>
              </Label>
            </div>
            <p v-else class="text-center text-sm text-muted-foreground p-2">
              No items found in this shipment
            </p>
          </div>
        </div>
        
        <!-- Return Shipping Options -->
        <div class="rounded-lg border p-4 space-y-4">
          <h3 class="text-sm font-medium">Return Shipping Options</h3>
          
          <div class="space-y-2">
            <Label for="return-carrier">Carrier</Label>
            <Select v-model="returnData.carrierId">
              <SelectTrigger id="return-carrier">
                <SelectValue :placeholder="getCarrierName() || 'Select carrier'" />
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
            <Label for="return-service">Service</Label>
            <Select v-model="returnData.serviceId">
              <SelectTrigger id="return-service">
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
            <Checkbox id="customer-pays" v-model="returnData.customerPays" />
            <Label for="customer-pays">Customer pays for return shipping</Label>
          </div>
        </div>
        
        <!-- Notes/Instructions -->
        <div class="space-y-2">
          <Label for="instructions">Return Instructions (will appear on label)</Label>
          <Textarea 
            id="instructions" 
            v-model="returnData.instructions" 
            placeholder="Enter any specific return instructions" 
            rows="2"
          />
        </div>
      </div>
    </div>
    
    <DialogFooter class="flex-shrink-0 mt-2">
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button @click="createReturnLabel" :disabled="isProcessing">
        <Loader2Icon v-if="isProcessing" class="h-4 w-4 mr-2 animate-spin" />
        <span>{{ isProcessing ? 'Creating...' : 'Create Return Label' }}</span>
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Loader2Icon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
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
    required: true,
    default: () => ({
      // Provide default values for required properties
      id: '',
      orderId: '',
      items: [] // Ensure items is always at least an empty array
    })
  },
  carriers: {
    type: Array,
    required: true,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['close', 'return-created']);

// State
const showErrors = ref(false);
const isProcessing = ref(false);
const returnData = ref({
  originalShipmentId: props.shipment.id || '',
  reason: '',
  items: [],  // Initialize as empty array
  carrierId: props.shipment.carrierId || '',
  carrierName: props.shipment.carrierName || '',
  serviceId: '',
  serviceName: '',
  customerPays: false,
  instructions: '',
  returnToAddress: {
    street: '123 Warehouse Blvd',
    city: 'Portland',
    state: 'OR',
    postalCode: '97201',
    country: 'US'
  }
});

// Initialize return items from shipment items - Fix the undefined error
onMounted(() => {
  // Safely map items or create empty array if no items
  returnData.value.items = Array.isArray(props.shipment.items) 
    ? props.shipment.items.map(item => ({
        ...item,
        selected: false
      }))
    : [];
});

// Computed values - Fix potential undefined errors
const allItemsSelected = computed(() => {
  if (!returnData.value.items || returnData.value.items.length === 0) return false;
  return returnData.value.items.every(item => item.selected);
});

const availableServices = computed(() => {
  if (!returnData.value.carrierId) return [];
  
  const carrier = props.carriers.find(c => c.id === returnData.value.carrierId);
  if (!carrier) return [];
  
  // Return carriers often have different return services
  return carrier.services?.filter(s => s.returnsEligible) || [
    { id: 'return_ground', name: 'Return Ground', cost: 7.99, returnsEligible: true },
    { id: 'return_priority', name: 'Return Priority', cost: 11.99, returnsEligible: true }
  ];
});

const selectedItems = computed(() => {
  return returnData.value.items.filter(item => item.selected);
});

// Watch for carrier changes to reset service
watch(() => returnData.value.carrierId, (newValue) => {
  if (newValue) {
    const carrier = props.carriers.find(c => c.id === newValue);
    if (carrier) {
      returnData.value.carrierName = carrier.name;
    }
    returnData.value.serviceId = '';
    returnData.value.serviceName = '';
  }
});

// Watch for service changes to update service name
watch(() => returnData.value.serviceId, (newValue) => {
  if (newValue) {
    const service = availableServices.value.find(s => s.id === newValue);
    if (service) {
      returnData.value.serviceName = service.name;
    }
  }
});

// Helper functions
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

const toggleAllItems = () => {
  if (!returnData.value.items) {
    returnData.value.items = [];
    return;
  }
  
  const newValue = !allItemsSelected.value;
  returnData.value.items.forEach(item => {
    item.selected = newValue;
  });
};

const getCarrierName = () => {
  if (returnData.value.carrierId) {
    const carrier = props.carriers.find(c => c.id === returnData.value.carrierId);
    return carrier?.name;
  }
  return null;
};

const validateForm = () => {
  if (!returnData.value.reason) {
    showErrors.value = true;
    return false;
  }
  
  if (selectedItems.value.length === 0) {
    alert('Please select at least one item to return');
    return false;
  }
  
  if (!returnData.value.carrierId || !returnData.value.serviceId) {
    alert('Please select a carrier and service');
    return false;
  }
  
  return true;
};

// Create return label
const createReturnLabel = async () => {
  if (!validateForm()) return;
  
  isProcessing.value = true;
  
  try {
    // Prepare return data
    const returnInfo = {
      ...returnData.value,
      items: selectedItems.value,
      returnType: 'customer_return',
      createdAt: new Date().toISOString()
    };
    
    // Calculate shipping cost
    const service = availableServices.value.find(s => s.id === returnData.value.serviceId);
    returnInfo.shippingCost = service?.cost || 0;
    
    if (returnData.value.customerPays) {
      returnInfo.shippingCost = 0; // Company doesn't pay if customer pays
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    emit('return-created', returnInfo);
  } catch (error) {
    console.error('Error creating return label:', error);
    // Error handling could be added here
  } finally {
    isProcessing.value = false;
  }
};
</script>