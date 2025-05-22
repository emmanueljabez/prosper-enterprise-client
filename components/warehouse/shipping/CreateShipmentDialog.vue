<template>
  <DialogContent class="sm:max-w-3xl">
    <DialogHeader>
      <DialogTitle>Create New Shipment</DialogTitle>
      <DialogDescription>
        Enter shipment details and select a shipping carrier to create a new shipment.
      </DialogDescription>
    </DialogHeader>

    <div class="overflow-y-auto max-h-[70vh]">
      <Tabs defaultValue="details" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="details">Shipment Details</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
        </TabsList>
        
        <!-- Shipment Details Tab -->
        <TabsContent value="details" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="orderReference">Order Reference</Label>
              <Input 
                id="orderReference" 
                v-model="shipmentData.orderId" 
                placeholder="Order #123456"
              />
            </div>
            <div>
              <Label for="customerName">Customer Name</Label>
              <Input 
                id="customerName" 
                v-model="shipmentData.customerName" 
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label for="carrier">Shipping Carrier</Label>
              <Select v-model="shipmentData.carrierId">
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
            <div>
              <Label for="service">Shipping Service</Label>
              <Select v-model="shipmentData.serviceId" :disabled="!shipmentData.carrierId">
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="service in availableServices" 
                    :key="service.id" 
                    :value="service.id"
                  >
                    {{ service.name }} - {{ service.estimatedDays }} days
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <Label for="notes">Shipment Notes</Label>
              <Textarea 
                id="notes" 
                v-model="shipmentData.notes" 
                placeholder="Any special handling instructions or notes about this shipment"
                rows="3"
              />
            </div>
            
            <div class="border rounded-md p-4 bg-muted/20 space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-medium">Shipping Options</h3>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    id="requireSignature" 
                    v-model:checked="shipmentData.requireSignature"
                  />
                  <Label for="requireSignature">Require Signature</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    id="insurance" 
                    v-model:checked="shipmentData.insurance.enabled"
                  />
                  <Label for="insurance">Add Insurance</Label>
                </div>
                <div v-if="shipmentData.insurance.enabled">
                  <Label for="insuranceValue">Insurance Value ($)</Label>
                  <Input
                    id="insuranceValue"
                    v-model="shipmentData.insurance.value"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    id="saturdayDelivery" 
                    v-model:checked="shipmentData.saturdayDelivery"
                  />
                  <Label for="saturdayDelivery">Saturday Delivery</Label>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <!-- Addresses Tab -->
        <TabsContent value="addresses" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Ship From Address -->
            <div class="space-y-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-base font-medium">Ship From Address</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  @click="useDefaultWarehouseAddress"
                >
                  Use Default
                </Button>
              </div>
              <div class="space-y-3 border rounded-md p-4 bg-muted/20">
                <div>
                  <Label for="shipFromName">Contact Name</Label>
                  <Input 
                    id="shipFromName" 
                    v-model="shipmentData.shipFromAddress.name" 
                    placeholder="Warehouse Contact"
                  />
                </div>
                <div>
                  <Label for="shipFromCompany">Company</Label>
                  <Input 
                    id="shipFromCompany" 
                    v-model="shipmentData.shipFromAddress.company" 
                    placeholder="Your Company"
                  />
                </div>
                <div>
                  <Label for="shipFromPhone">Phone</Label>
                  <Input 
                    id="shipFromPhone" 
                    v-model="shipmentData.shipFromAddress.phone" 
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label for="shipFromAddress1">Address Line 1</Label>
                  <Input 
                    id="shipFromAddress1" 
                    v-model="shipmentData.shipFromAddress.address1" 
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <Label for="shipFromAddress2">Address Line 2</Label>
                  <Input 
                    id="shipFromAddress2" 
                    v-model="shipmentData.shipFromAddress.address2" 
                    placeholder="Apt, Suite, etc."
                  />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <Label for="shipFromCity">City</Label>
                    <Input 
                      id="shipFromCity" 
                      v-model="shipmentData.shipFromAddress.city" 
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label for="shipFromState">State</Label>
                    <Input 
                      id="shipFromState" 
                      v-model="shipmentData.shipFromAddress.state" 
                      placeholder="State"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <Label for="shipFromPostalCode">Postal Code</Label>
                    <Input 
                      id="shipFromPostalCode" 
                      v-model="shipmentData.shipFromAddress.postalCode" 
                      placeholder="Postal code"
                    />
                  </div>
                  <div>
                    <Label for="shipFromCountry">Country</Label>
                    <Select v-model="shipmentData.shipFromAddress.country">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="MX">Mexico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Ship To Address -->
            <div class="space-y-4">
              <h3 class="text-base font-medium mb-2">Ship To Address</h3>
              <div class="space-y-3 border rounded-md p-4 bg-muted/20">
                <div>
                  <Label for="shipToName">Contact Name</Label>
                  <Input 
                    id="shipToName" 
                    v-model="shipmentData.shipToAddress.name" 
                    placeholder="Recipient name"
                  />
                </div>
                <div>
                  <Label for="shipToCompany">Company</Label>
                  <Input 
                    id="shipToCompany" 
                    v-model="shipmentData.shipToAddress.company" 
                    placeholder="Recipient company (optional)"
                  />
                </div>
                <div>
                  <Label for="shipToPhone">Phone</Label>
                  <Input 
                    id="shipToPhone" 
                    v-model="shipmentData.shipToAddress.phone" 
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label for="shipToAddress1">Address Line 1</Label>
                  <Input 
                    id="shipToAddress1" 
                    v-model="shipmentData.shipToAddress.address1" 
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <Label for="shipToAddress2">Address Line 2</Label>
                  <Input 
                    id="shipToAddress2" 
                    v-model="shipmentData.shipToAddress.address2" 
                    placeholder="Apt, Suite, etc."
                  />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <Label for="shipToCity">City</Label>
                    <Input 
                      id="shipToCity" 
                      v-model="shipmentData.shipToAddress.city" 
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label for="shipToState">State</Label>
                    <Input 
                      id="shipToState" 
                      v-model="shipmentData.shipToAddress.state" 
                      placeholder="State"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <Label for="shipToPostalCode">Postal Code</Label>
                    <Input 
                      id="shipToPostalCode" 
                      v-model="shipmentData.shipToAddress.postalCode" 
                      placeholder="Postal code"
                    />
                  </div>
                  <div>
                    <Label for="shipToCountry">Country</Label>
                    <Select v-model="shipmentData.shipToAddress.country">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="MX">Mexico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label for="shipToEmail">Email</Label>
                  <Input 
                    id="shipToEmail" 
                    v-model="shipmentData.shipToAddress.email" 
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <!-- Packages Tab -->
        <TabsContent value="packages" class="space-y-4">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-base font-medium">Packages ({{ shipmentData.packages.length }})</h3>
            <Button size="sm" variant="outline" @click="addPackage">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </div>
          
          <div v-if="shipmentData.packages.length === 0" class="border rounded-md p-6 text-center">
            <PackageIcon class="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <h3 class="text-lg font-medium">No packages added</h3>
            <p class="text-sm text-muted-foreground mb-4">
              Add at least one package to create a shipment
            </p>
            <Button variant="default" @click="addPackage">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="(pkg, index) in shipmentData.packages" 
              :key="index" 
              class="border rounded-md p-4 bg-muted/20 relative"
            >
              <Button 
                variant="ghost" 
                size="icon" 
                class="absolute top-2 right-2" 
                @click="removePackage(index)"
              >
                <XIcon class="h-4 w-4" />
              </Button>
              
              <h4 class="font-medium mb-3">Package {{ index + 1 }}</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label :for="`packageType-${index}`">Package Type</Label>
                  <Select v-model="pkg.packageType">
                    <SelectTrigger>
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom Box</SelectItem>
                      <SelectItem value="envelope">Envelope</SelectItem>
                      <SelectItem value="pak">Pak</SelectItem>
                      <SelectItem value="tube">Tube</SelectItem>
                      <SelectItem value="box_small">Small Box</SelectItem>
                      <SelectItem value="box_medium">Medium Box</SelectItem>
                      <SelectItem value="box_large">Large Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label :for="`packageWeight-${index}`">Weight (lbs)</Label>
                  <Input 
                    :id="`packageWeight-${index}`" 
                    v-model="pkg.weight" 
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <Label :for="`packageLength-${index}`">Length (in)</Label>
                  <Input 
                    :id="`packageLength-${index}`" 
                    v-model="pkg.dimensions.length" 
                    type="number" 
                    min="0.1" 
                    step="0.1" 
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label :for="`packageWidth-${index}`">Width (in)</Label>
                  <Input 
                    :id="`packageWidth-${index}`" 
                    v-model="pkg.dimensions.width" 
                    type="number" 
                    min="0.1" 
                    step="0.1" 
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label :for="`packageHeight-${index}`">Height (in)</Label>
                  <Input 
                    :id="`packageHeight-${index}`" 
                    v-model="pkg.dimensions.height" 
                    type="number" 
                    min="0.1" 
                    step="0.1" 
                    placeholder="0.0"
                  />
                </div>
              </div>
              
              <div class="mt-4">
                <Label :for="`packageDescription-${index}`">Package Contents</Label>
                <Textarea 
                  :id="`packageDescription-${index}`" 
                  v-model="pkg.description" 
                  placeholder="Brief description of package contents"
                  rows="2"
                />
              </div>
            </div>
          </div>
          
          <!-- Rate estimates section (conditionally shown when ready to calculate) -->
          <div v-if="showRateEstimates && shipmentData.packages.length > 0" class="mt-4 border rounded-md p-4 bg-muted/10">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">Shipping Rate Estimates</h4>
              <Button variant="outline" size="sm" @click="calculateRates">
                <RefreshCwIcon class="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
            
            <div v-if="isCalculatingRates" class="flex justify-center py-4">
              <Loader2Icon class="h-8 w-8 animate-spin text-primary" />
            </div>
            
            <div v-else-if="rateEstimates.length > 0" class="space-y-2">
              <RadioGroup v-model="selectedRateId">
                <div v-for="rate in rateEstimates" :key="rate.id" class="flex items-center justify-between p-2 border rounded-md">
                  <div class="flex items-center">
                    <RadioGroupItem :value="rate.id" />
                    <div class="ml-3">
                      <p class="font-medium">{{ rate.serviceName }}</p>
                      <p class="text-sm text-muted-foreground">{{ rate.deliveryDays }} days</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-medium">${{ rate.rate.toFixed(2) }}</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div v-else class="text-center py-2">
              <p class="text-sm text-muted-foreground">No rate estimates available. Please check your shipment details.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="cancel">Cancel</Button>
      <Button 
        @click="createShipment" 
        :disabled="isSubmitting || !isFormValid"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Create Shipment
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  PlusIcon,
  XIcon,
  PackageIcon,
  RefreshCwIcon,
  Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  carriers: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['shipment-created', 'close'])

// Form state
const isSubmitting = ref(false)
const isCalculatingRates = ref(false)
const showRateEstimates = ref(false)
const selectedRateId = ref(null)
const rateEstimates = ref([])

// Default empty shipment data
const shipmentData = reactive({
  orderId: '',
  customerName: '',
  carrierId: '',
  serviceId: '',
  notes: '',
  requireSignature: false,
  saturdayDelivery: false,
  insurance: {
    enabled: false,
    value: '0.00'
  },
  shipFromAddress: {
    name: '',
    company: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  },
  shipToAddress: {
    name: '',
    company: '',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  },
  packages: []
})

// Computed properties
const availableServices = computed(() => {
  if (!shipmentData.carrierId) return []
  
  const carrier = props.carriers.find(c => c.id === shipmentData.carrierId)
  return carrier?.services || []
})

const isFormValid = computed(() => {
  // Basic validation rules
  return (
    shipmentData.orderId && 
    shipmentData.customerName &&
    shipmentData.carrierId &&
    shipmentData.serviceId &&
    shipmentData.shipFromAddress.name &&
    shipmentData.shipFromAddress.address1 &&
    shipmentData.shipFromAddress.city &&
    shipmentData.shipFromAddress.state &&
    shipmentData.shipFromAddress.postalCode &&
    shipmentData.shipToAddress.name &&
    shipmentData.shipToAddress.address1 &&
    shipmentData.shipToAddress.city &&
    shipmentData.shipToAddress.state &&
    shipmentData.shipToAddress.postalCode &&
    shipmentData.packages.length > 0
  )
})

// Methods
function addPackage() {
  shipmentData.packages.push({
    packageType: 'custom',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    description: ''
  })
}

function removePackage(index) {
  shipmentData.packages.splice(index, 1)
}

function useDefaultWarehouseAddress() {
  // Set the warehouse address from a stored default
  shipmentData.shipFromAddress = {
    name: 'Warehouse Manager',
    company: 'PCASH Inventory',
    phone: '(555) 123-4567',
    address1: '123 Warehouse Blvd',
    address2: 'Suite 100',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
    country: 'US'
  }
}

async function calculateRates() {
  if (!isFormValid.value) return
  
  isCalculatingRates.value = true
  showRateEstimates.value = true
  
  try {
    // In a real implementation, you'd call an API to get shipping rates
    // This is a mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    rateEstimates.value = [
      {
        id: 'rate1',
        serviceName: 'Ground',
        deliveryDays: '3-5',
        rate: 12.99
      },
      {
        id: 'rate2',
        serviceName: 'Express',
        deliveryDays: '2',
        rate: 24.99
      },
      {
        id: 'rate3',
        serviceName: 'Priority',
        deliveryDays: '1',
        rate: 39.99
      }
    ]
    
    selectedRateId.value = rateEstimates.value[0].id
  } catch (error) {
    console.error('Error calculating shipping rates:', error)
  } finally {
    isCalculatingRates.value = false
  }
}

async function createShipment() {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    // Prepare the shipment data
    const newShipment = {
      ...shipmentData,
      // Add any calculated or selected rate info
      shippingRate: selectedRateId.value 
        ? rateEstimates.value.find(r => r.id === selectedRateId.value)?.rate 
        : null,
      shippingCost: selectedRateId.value 
        ? rateEstimates.value.find(r => r.id === selectedRateId.value)?.rate 
        : null
    }
    
    // Emit the shipment data to be created
    emit('shipment-created', newShipment)
  } catch (error) {
    console.error('Error creating shipment:', error)
  } finally {
    isSubmitting.value = false
  }
}

function cancel() {
  emit('close')
}

// Watch for carrier changes to reset selected service
watch(() => shipmentData.carrierId, () => {
  shipmentData.serviceId = ''
})

// Initialize
function init() {
  addPackage() // Start with one empty package
}

init()
</script>