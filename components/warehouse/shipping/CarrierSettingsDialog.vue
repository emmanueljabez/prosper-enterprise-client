<template>
  <DialogContent class="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Carrier Settings</DialogTitle>
      <DialogDescription>
        Configure shipping carrier settings and services.
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-5 py-4">
      <!-- Carrier Summary Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-10 h-10 flex items-center justify-center bg-muted rounded-md mr-3">
            <TruckIcon v-if="carrier.logo === 'truck'" class="h-5 w-5" />
            <PackageIcon v-else-if="carrier.logo === 'package'" class="h-5 w-5" />
            <GlobeIcon v-else-if="carrier.logo === 'globe'" class="h-5 w-5" />
            <PlaneIcon v-else-if="carrier.logo === 'plane'" class="h-5 w-5" />
            <ShipIcon v-else-if="carrier.logo === 'ship'" class="h-5 w-5" />
            <span v-else class="text-sm font-bold">{{ carrier.name.charAt(0) }}</span>
          </div>
          <div>
            <h3 class="font-medium text-lg">{{ carrier.name }}</h3>
            <p class="text-sm text-muted-foreground">{{ carrier.description || 'Shipping carrier' }}</p>
          </div>
        </div>
        <Switch
          id="carrier-active"
          v-model="formData.active"
          @update:model-value="updateActiveStatus"
        />
      </div>
      
      <Tabs defaultValue="general" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <!-- General Settings Tab -->
        <TabsContent value="general" class="space-y-4 pt-4">
          <div class="space-y-2">
            <Label for="carrier-name">Carrier Name</Label>
            <Input id="carrier-name" v-model="formData.name" />
          </div>
          
          <div class="space-y-2">
            <Label for="carrier-code">Carrier Code</Label>
            <Input id="carrier-code" v-model="formData.code" disabled />
          </div>
          
          <div class="space-y-2">
            <Label for="carrier-description">Description</Label>
            <Textarea 
              id="carrier-description" 
              v-model="formData.description" 
              placeholder="Brief description of this shipping carrier"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="carrier-logo">Icon</Label>
              <Select v-model="formData.logo">
                <SelectTrigger id="carrier-logo">
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
            
            <div class="space-y-2">
              <Label for="carrier-website">Website</Label>
              <Input 
                id="carrier-website" 
                v-model="formData.website" 
                placeholder="https://www.carrier.com"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="carrier-tracking-url">Tracking URL Format</Label>
            <Input 
              id="carrier-tracking-url" 
              v-model="formData.trackingUrlFormat" 
              placeholder="https://track.carrier.com/track?number={tracking_number}"
            />
            <p class="text-xs text-muted-foreground">
              Use {tracking_number} as a placeholder for the tracking number
            </p>
          </div>
        </TabsContent>
        
        <!-- Services Tab -->
        <TabsContent value="services" class="space-y-4 pt-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium">Available Services</h3>
            <Button variant="outline" size="sm" @click="addService">
              <PlusIcon class="h-4 w-4 mr-1" />
              Add Service
            </Button>
          </div>
          
          <div v-if="formData.services.length === 0" class="text-center py-8 border rounded-lg">
            <PackageIcon class="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p class="text-muted-foreground">No services configured</p>
            <p class="text-xs text-muted-foreground mt-1">
              Add shipping services that this carrier provides
            </p>
            <Button variant="outline" size="sm" class="mt-4" @click="addService">
              <PlusIcon class="h-4 w-4 mr-1" />
              Add First Service
            </Button>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="(service, index) in formData.services" 
              :key="index"
              class="border rounded-lg p-3 relative"
            >
              <Button 
                variant="ghost" 
                size="icon" 
                class="absolute right-2 top-2 h-6 w-6" 
                @click="removeService(index)"
              >
                <XIcon class="h-4 w-4" />
              </Button>
              
              <div class="grid grid-cols-3 gap-3">
                <div class="space-y-2">
                  <Label :for="`service-name-${index}`">Service Name</Label>
                  <Input :id="`service-name-${index}`" v-model="service.name" />
                </div>
                
                <div class="space-y-2">
                  <Label :for="`service-code-${index}`">Service Code</Label>
                  <Input :id="`service-code-${index}`" v-model="service.code" />
                </div>
                
                <div class="space-y-2">
                  <Label :for="`service-cost-${index}`">Base Cost</Label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input 
                      :id="`service-cost-${index}`" 
                      v-model="service.cost" 
                      type="number" 
                      step="0.01" 
                      class="pl-7"
                    />
                  </div>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-3 mt-3">
                <div class="space-y-2">
                  <Label :for="`service-delivery-days-${index}`">Delivery Days</Label>
                  <Input 
                    :id="`service-delivery-days-${index}`" 
                    v-model="service.deliveryDays" 
                    type="number" 
                    min="1"
                  />
                </div>
                
                <div class="space-y-2">
                  <Label :for="`service-delivery-desc-${index}`">Delivery Description</Label>
                  <Input 
                    :id="`service-delivery-desc-${index}`" 
                    v-model="service.deliveryDescription" 
                    placeholder="e.g. 1-2 Business Days"
                  />
                </div>
              </div>
              
              <div class="flex items-center space-x-4 mt-3">
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    :id="`service-active-${index}`" 
                    v-model="service.active"
                  />
                  <Label :for="`service-active-${index}`">Active</Label>
                </div>
                
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    :id="`service-domestic-${index}`" 
                    v-model="service.domestic"
                  />
                  <Label :for="`service-domestic-${index}`">Domestic</Label>
                </div>
                
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    :id="`service-international-${index}`" 
                    v-model="service.international"
                  />
                  <Label :for="`service-international-${index}`">International</Label>
                </div>
                
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    :id="`service-returns-${index}`" 
                    v-model="service.returnsEligible"
                  />
                  <Label :for="`service-returns-${index}`">Returns Eligible</Label>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <!-- Account Tab -->
        <TabsContent value="account" class="space-y-4 pt-4">
          <Alert variant="warning" class="mb-4">
            <AlertCircleIcon class="h-4 w-4" />
            <AlertTitle>API Credentials</AlertTitle>
            <AlertDescription>
              These settings control the connection to the carrier's shipping API.
              Incorrect values may cause issues with label generation and tracking.
            </AlertDescription>
          </Alert>
          
          <div class="space-y-2">
            <Label for="account-number">Account Number</Label>
            <Input 
              id="account-number" 
              v-model="formData.accountSettings.accountNumber"
              placeholder="Enter account number" 
            />
          </div>
          
          <div class="space-y-2">
            <Label for="api-key">API Key</Label>
            <div class="flex space-x-2">
              <div class="relative flex-1">
                <Input 
                  id="api-key" 
                  v-model="formData.accountSettings.apiKey"
                  :type="showApiKey ? 'text' : 'password'"
                  placeholder="Enter API key" 
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  type="button"
                  class="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  @click="showApiKey = !showApiKey"
                >
                  <EyeIcon v-if="!showApiKey" class="h-4 w-4" />
                  <EyeOffIcon v-else class="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="icon" @click="generateApiKey">
                <RefreshCwIcon class="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="api-secret">API Secret</Label>
            <div class="flex space-x-2">
              <div class="relative flex-1">
                <Input 
                  id="api-secret" 
                  v-model="formData.accountSettings.apiSecret"
                  :type="showApiSecret ? 'text' : 'password'"
                  placeholder="Enter API secret" 
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  type="button"
                  class="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  @click="showApiSecret = !showApiSecret"
                >
                  <EyeIcon v-if="!showApiSecret" class="h-4 w-4" />
                  <EyeOffIcon v-else class="h-4 w-4" />
                </Button>
              </div>
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
          
          <div class="flex items-center space-x-2 pt-2">
            <Button variant="outline" @click="testApiConnection" :disabled="isAPITesting">
              <Loader2Icon v-if="isAPITesting" class="h-4 w-4 mr-2 animate-spin" />
              <CheckCircle2Icon v-else-if="apiTestResult === 'success'" class="h-4 w-4 mr-2 text-green-500" />
              <XCircleIcon v-else-if="apiTestResult === 'error'" class="h-4 w-4 mr-2 text-red-500" />
              <CircleIcon v-else class="h-4 w-4 mr-2" />
              Test Connection
            </Button>
            <span v-if="apiTestResult === 'success'" class="text-sm text-green-500">Connection successful!</span>
            <span v-else-if="apiTestResult === 'error'" class="text-sm text-red-500">Connection failed</span>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        @click="saveCarrierSettings" 
        :disabled="isSaving"
      >
        <Loader2Icon v-if="isSaving" class="h-4 w-4 mr-2 animate-spin" />
        <span>{{ isSaving ? 'Saving...' : 'Save Changes' }}</span>
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import {
  Loader2Icon, TruckIcon, PackageIcon, GlobeIcon, PlusIcon,
  XIcon, RefreshCwIcon, EyeIcon, EyeOffIcon, PlaneIcon,
  ShipIcon, CheckCircle2Icon, XCircleIcon, CircleIcon,
  AlertCircleIcon
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';

// Props
const props = defineProps({
  carrier: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
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
    })
  }
});

// Emits
const emit = defineEmits(['close', 'save']);

// Toast for notifications
const { toast } = useToast();

// Form state - Fix the JSON parse error by safely handling undefined carrier
const formData = reactive({
  ...(props.carrier ? JSON.parse(JSON.stringify(props.carrier)) : {}),
  accountSettings: {
    ...(props.carrier?.accountSettings || {
      accountNumber: '',
      apiKey: '',
      apiSecret: '',
      environment: 'sandbox'
    })
  },
  services: [...(props.carrier?.services || [])]
});

// UI state
const showApiKey = ref(false);
const showApiSecret = ref(false);
const isSaving = ref(false);
const isAPITesting = ref(false);
const apiTestResult = ref('');

// Add a new service
const addService = () => {
  formData.services.push({
    id: `service-${Date.now()}`,
    name: '',
    code: '',
    cost: 0,
    deliveryDays: 1,
    deliveryDescription: '',
    active: true,
    domestic: true,
    international: false,
    returnsEligible: false
  });
};

// Remove a service
const removeService = (index) => {
  formData.services.splice(index, 1);
};

// Generate a random API key
const generateApiKey = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 24;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  formData.accountSettings.apiKey = result;
};

// Generate a random API secret
const generateApiSecret = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 32;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  formData.accountSettings.apiSecret = result;
};

// Test API connection
const testApiConnection = async () => {
  isAPITesting.value = true;
  apiTestResult.value = '';
  
  try {
    // Simulate API connection test with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 80% chance of success for demo purposes
    const success = Math.random() < 0.8;
    
    if (success) {
      apiTestResult.value = 'success';
    } else {
      apiTestResult.value = 'error';
    }
  } catch (error) {
    apiTestResult.value = 'error';
    console.error('API connection test error:', error);
  } finally {
    isAPITesting.value = false;
  }
};

// Update active status
const updateActiveStatus = (isActive) => {
  formData.active = isActive;
  
  if (isActive && formData.services.length > 0) {
    // Make sure at least one service is active when carrier is active
    if (!formData.services.some(s => s.active)) {
      formData.services[0].active = true;
    }
  }
};

// Save carrier settings
const saveCarrierSettings = async () => {
  isSaving.value = true;
  
  try {
    // Validate form
    if (!formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Carrier name is required',
        variant: 'destructive'
      });
      isSaving.value = false;
      return;
    }
    
    // Validate services if any are configured
    if (formData.services.length > 0) {
      const invalidServices = formData.services.filter(s => !s.name || !s.code);
      if (invalidServices.length > 0) {
        toast({
          title: 'Validation Error',
          description: 'All services must have a name and code',
          variant: 'destructive'
        });
        isSaving.value = false;
        return;
      }
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Emit save event with updated carrier data
    emit('save', formData);
    
    toast({
      title: 'Success',
      description: 'Carrier settings saved successfully',
      variant: 'success'
    });
  } catch (error) {
    console.error('Error saving carrier settings:', error);
    toast({
      title: 'Error',
      description: 'Failed to save carrier settings',
      variant: 'destructive'
    });
  } finally {
    isSaving.value = false;
  }
};
</script>