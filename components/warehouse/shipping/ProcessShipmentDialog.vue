<template>
  <DialogContent class="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Process Shipment</DialogTitle>
      <DialogDescription>
        Verify shipment details and generate a shipping label.
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-4 py-4">
      <!-- Shipment Info Summary -->
      <div class="rounded-lg border bg-muted/40 p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center">
            <span class="font-medium text-sm mr-2">
              Order #{{ shipment.orderId || 'N/A' }}
            </span>
            <Badge>{{ formatStatus(shipment.status) }}</Badge>
          </div>
          <Button variant="outline" size="sm" @click="toggleEditMode">
            <PencilIcon v-if="!editMode" class="h-3.5 w-3.5 mr-1" /> 
            <XIcon v-else class="h-3.5 w-3.5 mr-1" />
            {{ editMode ? 'Cancel Edit' : 'Edit Details' }}
          </Button>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <p class="text-muted-foreground">Customer:</p>
            <p class="font-medium">{{ shipment.customerName }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Items:</p>
            <p class="font-medium">{{ getItemCountText() }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Ship from:</p>
            <p class="font-medium">{{ formatWarehouseAddress() }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Ship to:</p>
            <p class="font-medium">{{ formatAddress(shipment.shipToAddress) }}</p>
          </div>
        </div>
      </div>

      <!-- Processing Form -->
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="carrier">Shipping Carrier</Label>
            <Select v-model="formData.carrierId" id="carrier">
              <SelectTrigger>
                <SelectValue placeholder="Select a carrier" />
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
            <Select v-model="formData.serviceId" id="service">
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
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
        </div>

        <div v-if="editMode" class="pt-2">
          <div class="rounded-lg border p-4 space-y-4">
            <h4 class="font-medium text-sm">Package Details</h4>
            <div class="grid grid-cols-4 gap-3">
              <div class="space-y-2">
                <Label for="weight">Weight (lb)</Label>
                <Input v-model="formData.package.weight" id="weight" type="number" step="0.1" />
              </div>
              <div class="space-y-2">
                <Label for="length">Length (in)</Label>
                <Input v-model="formData.package.length" id="length" type="number" step="0.1" />
              </div>
              <div class="space-y-2">
                <Label for="width">Width (in)</Label>
                <Input v-model="formData.package.width" id="width" type="number" step="0.1" />
              </div>
              <div class="space-y-2">
                <Label for="height">Height (in)</Label>
                <Input v-model="formData.package.height" id="height" type="number" step="0.1" />
              </div>
            </div>
          </div>
        </div>

        <div class="pt-2">
          <div class="rounded-lg border p-4 space-y-4">
            <h4 class="font-medium text-sm">Shipping Options</h4>
            <div class="space-y-3">
              <div class="flex items-center space-x-2">
                <Checkbox v-model="formData.signatureRequired" id="signature" />
                <Label for="signature">Signature Required</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox v-model="formData.insurance" id="insurance" />
                <Label for="insurance">Add Insurance</Label>
              </div>
              <div class="flex items-center space-x-2" v-if="formData.insurance">
                <Label class="w-40">Insurance Value:</Label>
                <Input 
                  v-model="formData.insuranceValue" 
                  type="number" 
                  step="1" 
                  class="max-w-[120px]" 
                  placeholder="Enter value"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Shipping Cost Summary -->
        <div class="border rounded-lg p-4 bg-muted/30 mt-4">
          <div class="text-sm font-medium mb-2">Shipping Summary</div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>Base shipping cost:</span>
              <span>{{ formatCurrency(getBaseShippingCost()) }}</span>
            </div>
            <div class="flex justify-between text-sm" v-if="formData.insurance">
              <span>Insurance:</span>
              <span>{{ formatCurrency(getInsuranceCost()) }}</span>
            </div>
            <div class="flex justify-between text-sm" v-if="formData.signatureRequired">
              <span>Signature required:</span>
              <span>{{ formatCurrency(getSignatureCost()) }}</span>
            </div>
            <Separator />
            <div class="flex justify-between font-medium">
              <span>Total shipping cost:</span>
              <span>{{ formatCurrency(getTotalShippingCost()) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        :disabled="!formData.carrierId || !formData.serviceId || isProcessing" 
        @click="processShipment"
      >
        <Loader2Icon v-if="isProcessing" class="h-4 w-4 mr-2 animate-spin" />
        <span v-else>Generate Label & Process</span>
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { 
  Loader2Icon, PencilIcon, XIcon
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  },
  carriers: {
    type: Array,
    required: true,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['close', 'shipment-processed']);

// State
const editMode = ref(false);
const isProcessing = ref(false);
const formData = ref({
  carrierId: props.shipment.carrierId || '',
  carrierName: props.shipment.carrierName || '',
  serviceId: props.shipment.serviceId || '',
  serviceName: props.shipment.serviceName || '',
  signatureRequired: props.shipment.signatureRequired || false,
  insurance: props.shipment.insurance || false,
  insuranceValue: props.shipment.insuranceValue || props.shipment.totalValue || 0,
  package: {
    weight: props.shipment.packages?.[0]?.weight || 1,
    length: props.shipment.packages?.[0]?.length || 12,
    width: props.shipment.packages?.[0]?.width || 10,
    height: props.shipment.packages?.[0]?.height || 4
  }
});

// Computed values
const availableServices = computed(() => {
  if (!formData.value.carrierId) return [];
  
  const carrier = props.carriers.find(c => c.id === formData.value.carrierId);
  if (!carrier) return [];
  
  return carrier.services || [
    { id: 'ground', name: 'Ground', cost: 9.99 },
    { id: 'priority', name: 'Priority', cost: 14.99 },
    { id: 'express', name: 'Express', cost: 24.99 }
  ];
});

// Watch for carrier changes to reset service
watch(() => formData.value.carrierId, (newValue) => {
  if (newValue) {
    const carrier = props.carriers.find(c => c.id === newValue);
    if (carrier) {
      formData.value.carrierName = carrier.name;
    }
    formData.value.serviceId = '';
    formData.value.serviceName = '';
  }
});

// Watch for service changes to update service name
watch(() => formData.value.serviceId, (newValue) => {
  if (newValue) {
    const service = availableServices.value.find(s => s.id === newValue);
    if (service) {
      formData.value.serviceName = service.name;
    }
  }
});

// Helper functions
const formatStatus = (status) => {
  if (!status) return '';
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatAddress = (address) => {
  if (!address) return 'N/A';
  return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
};

const formatWarehouseAddress = () => {
  return 'Main Warehouse, 123 Shipping Ln, Portland, OR 97201';
};

const getItemCountText = () => {
  const items = props.shipment.items || [];
  const count = items.length;
  if (count === 0) return 'No items';
  return `${count} item${count > 1 ? 's' : ''}`;
};

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const toggleEditMode = () => {
  editMode.value = !editMode.value;
};

const getBaseShippingCost = () => {
  if (!formData.value.serviceId) return 0;
  const service = availableServices.value.find(s => s.id === formData.value.serviceId);
  return service ? service.cost : 0;
};

const getInsuranceCost = () => {
  if (!formData.value.insurance) return 0;
  // Calculate insurance cost (example: 1% of declared value, minimum $3)
  const cost = (formData.value.insuranceValue * 0.01);
  return Math.max(cost, 3);
};

const getSignatureCost = () => {
  return formData.value.signatureRequired ? 3.99 : 0;
};

const getTotalShippingCost = () => {
  return getBaseShippingCost() + getInsuranceCost() + getSignatureCost();
};

// Process shipment
const processShipment = async () => {
  if (!formData.value.carrierId || !formData.value.serviceId) return;
  
  isProcessing.value = true;
  
  try {
    // Update shipment with form data
    const updatedShipment = {
      ...props.shipment,
      carrierId: formData.value.carrierId,
      carrierName: formData.value.carrierName,
      serviceId: formData.value.serviceId,
      serviceName: formData.value.serviceName,
      signatureRequired: formData.value.signatureRequired,
      insurance: formData.value.insurance,
      insuranceValue: formData.value.insurance ? formData.value.insuranceValue : 0,
      shippingCost: getTotalShippingCost(),
      packages: [
        {
          id: props.shipment.packages?.[0]?.id || `pkg-${Date.now()}`,
          weight: formData.value.package.weight,
          length: formData.value.package.length,
          width: formData.value.package.width,
          height: formData.value.package.height
        }
      ]
    };
    
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    emit('shipment-processed', updatedShipment);
  } catch (error) {
    console.error('Error processing shipment:', error);
    // You could add error handling here
  } finally {
    isProcessing.value = false;
  }
};
</script>