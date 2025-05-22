<template>
  <DialogContent class="sm:max-w-[550px]">
    <DialogHeader>
      <DialogTitle>Add Shipping Carrier</DialogTitle>
      <DialogDescription>
        Connect a new shipping carrier to your warehouse system.
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-4 py-4">
      <!-- Carrier Template Selection -->
      <div v-if="step === 1" class="space-y-4">
        <div class="space-y-2">
          <Label>Select Carrier Type</Label>
          <div class="grid grid-cols-2 gap-3">
            <div 
              v-for="template in carrierTemplates" 
              :key="template.id" 
              class="border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors"
              :class="{'border-primary bg-primary/5': selectedTemplate === template.id}"
              @click="selectTemplate(template.id)"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                  <TruckIcon v-if="template.logo === 'truck'" class="h-4 w-4" />
                  <PackageIcon v-else-if="template.logo === 'package'" class="h-4 w-4" />
                  <GlobeIcon v-else-if="template.logo === 'globe'" class="h-4 w-4" />
                  <PlaneIcon v-else-if="template.logo === 'plane'" class="h-4 w-4" />
                  <ShipIcon v-else-if="template.logo === 'ship'" class="h-4 w-4" />
                </div>
                <div>
                  <div class="font-medium">{{ template.name }}</div>
                  <div class="text-xs text-muted-foreground">{{ template.description }}</div>
                </div>
              </div>
            </div>
            
            <div 
              class="border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors"
              :class="{'border-primary bg-primary/5': selectedTemplate === 'custom'}"
              @click="selectTemplate('custom')"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                  <PlusIcon class="h-4 w-4" />
                </div>
                <div>
                  <div class="font-medium">Custom Carrier</div>
                  <div class="text-xs text-muted-foreground">Configure a carrier from scratch</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="selectedTemplate === 'custom'" class="pt-4 space-y-3">
          <div class="space-y-2">
            <Label for="custom-name">Carrier Name <span class="text-destructive">*</span></Label>
            <Input 
              id="custom-name" 
              v-model="formData.name" 
              placeholder="Enter carrier name" 
              :class="{ 'border-destructive': submitted && !formData.name }"
            />
            <p v-if="submitted && !formData.name" class="text-xs text-destructive">
              Carrier name is required
            </p>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label for="custom-code">Carrier Code <span class="text-destructive">*</span></Label>
              <Input 
                id="custom-code" 
                v-model="formData.code"
                placeholder="e.g. FEDEX" 
                :class="{ 'border-destructive': submitted && !formData.code }"
              />
              <p v-if="submitted && !formData.code" class="text-xs text-destructive">
                Carrier code is required
              </p>
            </div>
            
            <div class="space-y-2">
              <Label for="custom-logo">Icon</Label>
              <Select v-model="formData.logo">
                <SelectTrigger id="custom-logo">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="package">Package</SelectItem>
                  <SelectItem value="globe">Globe</SelectItem>
                  <SelectItem value="plane">Plane</SelectItem>
                  <SelectItem value="ship">Ship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div v-if="selectedTemplate && selectedTemplate !== 'custom'" class="border rounded-lg p-4 mt-4">
          <h3 class="text-sm font-medium mb-2">Template Information</h3>
          <p class="text-sm text-muted-foreground mb-3">
            {{ getSelectedTemplateInfo().description }}
          </p>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Available services:</span>
              <span>{{ getSelectedTemplateInfo().services.length }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">API integration:</span>
              <span>{{ getSelectedTemplateInfo().hasAPI ? 'Yes' : 'No' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Tracking support:</span>
              <span>{{ getSelectedTemplateInfo().hasTracking ? 'Yes' : 'No' }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Configuration Step -->
      <div v-if="step === 2" class="space-y-4">
        <div class="space-y-2">
          <Label for="account-number">Account Number <span class="text-red-500">*</span></Label>
          <Input 
            id="account-number" 
            v-model="formData.accountSettings.accountNumber"
            placeholder="Enter account number" 
            :class="{ 'border-destructive': submitted && !formData.accountSettings.accountNumber }"
          />
          <p v-if="submitted && !formData.accountSettings.accountNumber" class="text-xs text-destructive">
            Account number is required
          </p>
        </div>
        
        <div class="space-y-2">
          <Label for="api-key">API Key</Label>
          <div class="flex space-x-2">
            <Input 
              id="api-key" 
              v-model="formData.accountSettings.apiKey"
              placeholder="Enter API key" 
              class="flex-1"
            />
            <Button variant="outline" size="icon" @click="generateApiKey">
              <RefreshCwIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div class="space-y-2">
          <Label for="api-secret">API Secret</Label>
          <div class="flex space-x-2">
            <Input 
              id="api-secret" 
              v-model="formData.accountSettings.apiSecret"
              placeholder="Enter API secret" 
              class="flex-1"
            />
            <Button variant="outline" size="icon" @click="generateApiSecret">
              <RefreshCwIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div class="space-y-2">
          <Label>API Environment</Label>
          <div class="flex rounded-md overflow-hidden border">
            <Button 
              type="button" 
              variant="ghost" 
              class="flex-1 rounded-none border-r border-r-border"
              :class="{ 'bg-primary text-primary-foreground': formData.accountSettings.environment === 'sandbox' }"
              @click="formData.accountSettings.environment = 'sandbox'"
            >
              Sandbox
            </Button>
            <Button 
              type="button" 
              variant="ghost"
              class="flex-1 rounded-none"
              :class="{ 'bg-primary text-primary-foreground': formData.accountSettings.environment === 'production' }"
              @click="formData.accountSettings.environment = 'production'"
            >
              Production
            </Button>
          </div>
        </div>
        
        <Alert class="mt-4">
          <InfoIcon class="h-4 w-4" />
          <AlertTitle>Setup Information</AlertTitle>
          <AlertDescription>
            <p>You can find your account number and API credentials in your carrier portal or by contacting their support team.</p>
            <p class="mt-1">For testing purposes, you can use the sandbox environment with test credentials.</p>
          </AlertDescription>
        </Alert>
      </div>
      
      <!-- Summary Step -->
      <div v-if="step === 3" class="space-y-4">
        <div class="rounded-lg border p-4">
          <h3 class="text-sm font-medium mb-3">Carrier Summary</h3>
          <div class="space-y-2">
            <div class="flex items-center">
              <div class="w-8 h-8 rounded-md bg-muted flex items-center justify-center mr-2">
                <TruckIcon v-if="formData.logo === 'truck'" class="h-4 w-4" />
                <PackageIcon v-else-if="formData.logo === 'package'" class="h-4 w-4" />
                <GlobeIcon v-else-if="formData.logo === 'globe'" class="h-4 w-4" />
                <PlaneIcon v-else-if="formData.logo === 'plane'" class="h-4 w-4" />
                <ShipIcon v-else-if="formData.logo === 'ship'" class="h-4 w-4" />
              </div>
              <div class="text-lg font-medium">{{ formData.name }}</div>
            </div>
            
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
              <div>
                <span class="text-muted-foreground">Carrier Code:</span>
                <span class="ml-1">{{ formData.code }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">Account Number:</span>
                <span class="ml-1">{{ formData.accountSettings.accountNumber }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">API Environment:</span>
                <span class="ml-1 capitalize">{{ formData.accountSettings.environment }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">Services:</span>
                <span class="ml-1">{{ formData.services.length }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="rounded-lg border p-4">
          <h3 class="text-sm font-medium mb-3">Services</h3>
          <div v-if="formData.services.length === 0" class="text-center py-3">
            <p class="text-muted-foreground">No services configured</p>
            <p class="text-xs text-muted-foreground">You can add services after carrier creation</p>
          </div>
          <div v-else class="space-y-2">
            <div 
              v-for="service in formData.services" 
              :key="service.id" 
              class="flex justify-between items-center py-1.5 border-b last:border-0"
            >
              <div>
                <div class="font-medium">{{ service.name }}</div>
                <div class="text-xs text-muted-foreground">{{ service.code }}</div>
              </div>
              <div class="text-right">
                <div>{{ formatCurrency(service.cost) }}</div>
                <div class="text-xs text-muted-foreground">{{ service.deliveryDescription || '-' }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <Alert variant="success">
          <CheckIcon class="h-4 w-4" />
          <AlertTitle>Ready to Add</AlertTitle>
          <AlertDescription>
            Your carrier is ready to be added to your shipping options. You can edit all settings later.
          </AlertDescription>
        </Alert>
      </div>
      
      <!-- Progress dots -->
      <div class="flex justify-center space-x-2 pt-2">
        <button 
          v-for="i in 3" 
          :key="`step-${i}`" 
          @click="setStep(i)"
          class="w-2.5 h-2.5 rounded-full transition-colors"
          :class="step === i ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'"
        ></button>
      </div>
    </div>
    
    <DialogFooter>
      <div class="flex justify-between w-full">
        <Button 
          v-if="step > 1" 
          variant="outline" 
          @click="setStep(step - 1)"
        >
          Previous
        </Button>
        <div v-else></div>
        
        <div>
          <Button variant="outline" class="mr-2" @click="$emit('close')">Cancel</Button>
          <Button 
            v-if="step < 3" 
            @click="nextStep"
          >
            Continue
          </Button>
          <Button 
            v-else 
            @click="addCarrier"
            :disabled="isAdding"
          >
            <Loader2Icon v-if="isAdding" class="h-4 w-4 mr-2 animate-spin" />
            <span>{{ isAdding ? 'Adding...' : 'Add Carrier' }}</span>
          </Button>
        </div>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, reactive } from 'vue';
import {
  Loader2Icon, TruckIcon, PackageIcon, GlobeIcon, PlusIcon,
  RefreshCwIcon, PlaneIcon, ShipIcon, InfoIcon, CheckIcon
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/components/ui/toast';

// Emits
const emit = defineEmits(['close', 'carrier-added']);

// Toast for notifications
const { toast } = useToast();

// State
const step = ref(1);
const selectedTemplate = ref(null);
const submitted = ref(false);
const isAdding = ref(false);

// Default form data
const formData = reactive({
  name: '',
  code: '',
  description: '',
  logo: 'truck',
  active: true,
  services: [],
  accountSettings: {
    accountNumber: '',
    apiKey: '',
    apiSecret: '',
    environment: 'sandbox'
  }
});

// Predefined carrier templates
const carrierTemplates = [
  {
    id: 'fedex',
    name: 'FedEx',
    code: 'FEDEX',
    logo: 'plane',
    description: 'FedEx shipping services integration',
    hasAPI: true,
    hasTracking: true,
    services: [
      { id: 'fedex_ground', name: 'FedEx Ground', code: 'GROUND', cost: 9.99, deliveryDays: 3, deliveryDescription: '1-5 Business Days', active: true, domestic: true, international: false },
      { id: 'fedex_express', name: 'FedEx Express', code: 'EXPRESS', cost: 24.99, deliveryDays: 1, deliveryDescription: '1-2 Business Days', active: true, domestic: true, international: false },
      { id: 'fedex_intl', name: 'FedEx International', code: 'INTL', cost: 49.99, deliveryDays: 5, deliveryDescription: '3-5 Business Days', active: true, domestic: false, international: true }
    ]
  },
  {
    id: 'ups',
    name: 'UPS',
    code: 'UPS',
    logo: 'truck',
    description: 'UPS shipping services integration',
    hasAPI: true,
    hasTracking: true,
    services: [
      { id: 'ups_ground', name: 'UPS Ground', code: 'GROUND', cost: 8.99, deliveryDays: 3, deliveryDescription: '1-5 Business Days', active: true, domestic: true, international: false },
      { id: 'ups_3day', name: 'UPS 3-Day Select', code: '3DAY', cost: 14.99, deliveryDays: 3, deliveryDescription: '3 Business Days', active: true, domestic: true, international: false },
      { id: 'ups_2day', name: 'UPS 2nd Day Air', code: '2DAY', cost: 19.99, deliveryDays: 2, deliveryDescription: '2 Business Days', active: true, domestic: true, international: false },
      { id: 'ups_next', name: 'UPS Next Day Air', code: 'NEXT', cost: 29.99, deliveryDays: 1, deliveryDescription: 'Next Business Day', active: true, domestic: true, international: false }
    ]
  },
  {
    id: 'usps',
    name: 'USPS',
    code: 'USPS',
    logo: 'package',
    description: 'United States Postal Service integration',
    hasAPI: true,
    hasTracking: true,
    services: [
      { id: 'usps_first', name: 'First-Class Mail', code: 'FIRST', cost: 3.99, deliveryDays: 3, deliveryDescription: '1-3 Business Days', active: true, domestic: true, international: false },
      { id: 'usps_priority', name: 'Priority Mail', code: 'PRIORITY', cost: 7.99, deliveryDays: 2, deliveryDescription: '1-3 Business Days', active: true, domestic: true, international: false },
      { id: 'usps_express', name: 'Priority Mail Express', code: 'EXPRESS', cost: 24.99, deliveryDays: 1, deliveryDescription: '1-2 Business Days', active: true, domestic: true, international: false }
    ]
  },
  {
    id: 'dhl',
    name: 'DHL',
    code: 'DHL',
    logo: 'globe',
    description: 'DHL international shipping services',
    hasAPI: true,
    hasTracking: true,
    services: [
      { id: 'dhl_express', name: 'DHL Express', code: 'EXPRESS', cost: 39.99, deliveryDays: 3, deliveryDescription: '1-3 Business Days', active: true, domestic: false, international: true },
      { id: 'dhl_worldwide', name: 'DHL Worldwide', code: 'WORLDWIDE', cost: 49.99, deliveryDays: 5, deliveryDescription: '3-5 Business Days', active: true, domestic: false, international: true }
    ]
  }
];

// Format currency
const formatCurrency = (value) => {
  if (value === undefined || value === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

// Get selected template info
const getSelectedTemplateInfo = () => {
  return carrierTemplates.find(t => t.id === selectedTemplate.value) || 
    { description: '', services: [], hasAPI: false, hasTracking: false };
};

// Select a template
const selectTemplate = (templateId) => {
  selectedTemplate.value = templateId;
  
  if (templateId !== 'custom') {
    const template = carrierTemplates.find(t => t.id === templateId);
    if (template) {
      formData.name = template.name;
      formData.code = template.code;
      formData.logo = template.logo;
      formData.description = template.description;
      formData.services = [...template.services];
    }
  } else {
    // Reset for custom carrier
    formData.name = '';
    formData.code = '';
    formData.logo = 'truck';
    formData.description = '';
    formData.services = [];
  }
};

// Generate random API key
const generateApiKey = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 24;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  formData.accountSettings.apiKey = result;
};

// Generate random API secret
const generateApiSecret = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 32;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  formData.accountSettings.apiSecret = result;
};

// Set step
const setStep = (newStep) => {
  if (newStep >= 1 && newStep <= 3) {
    step.value = newStep;
  }
};

// Next step with validation
const nextStep = () => {
  submitted.value = true;
  
  if (step.value === 1) {
    if (!selectedTemplate.value) {
      toast({
        title: 'Please select a carrier',
        description: 'You must select a carrier type to continue',
        variant: 'destructive'
      });
      return;
    }
    
    if (selectedTemplate.value === 'custom' && (!formData.name || !formData.code)) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
  }
  
  if (step.value === 2) {
    if (!formData.accountSettings.accountNumber) {
      toast({
        title: 'Missing information',
        description: 'Account number is required',
        variant: 'destructive'
      });
      return;
    }
  }
  
  step.value++;
  submitted.value = false;
};

// Add carrier
const addCarrier = async () => {
  isAdding.value = true;
  
  try {
    // Generate a unique ID for the carrier
    const newCarrier = {
      ...formData,
      id: `carrier-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Emit event with new carrier data
    emit('carrier-added', newCarrier);
    
    toast({
      title: 'Carrier Added',
      description: `${formData.name} has been added successfully`,
      variant: 'success'
    });
  } catch (error) {
    console.error('Error adding carrier:', error);
    toast({
      title: 'Error',
      description: 'Failed to add carrier',
      variant: 'destructive'
    });
  } finally {
    isAdding.value = false;
  }
};
</script>