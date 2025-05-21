<template>
  <SheetContent class="sm:max-w-md overflow-y-auto">
    <SheetHeader>
      <SheetTitle>{{ isEditMode ? 'Edit Sales Channel' : 'Create Sales Channel' }}</SheetTitle>
      <SheetDescription>
        {{ isEditMode ? 'Update an existing sales channel' : 'Create a new sales channel for your products' }}
      </SheetDescription>
    </SheetHeader>
    
    <form @submit.prevent="handleSubmit" class="space-y-6 py-6">
      <div class="space-y-4">
        <!-- Basic Info -->
        <div class="space-y-2">
          <Label for="name">Channel Name</Label>
          <Input 
            id="name" 
            v-model="form.name" 
            placeholder="Enter channel name" 
            :disabled="isSubmitting"
            :class="{ 'border-destructive': errors.name }"
          />
          <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea 
            id="description" 
            v-model="form.description" 
            placeholder="Enter channel description" 
            :disabled="isSubmitting"
            rows="3"
          />
        </div>
        
        <div class="space-y-2">
          <Label for="type">Channel Type</Label>
          <Select 
            v-model="form.type" 
            :disabled="isSubmitting"
          >
            <SelectTrigger id="type" :class="{ 'border-destructive': errors.type }">
              <SelectValue placeholder="Select channel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online_store">Online Store</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
              <SelectItem value="retail_store">Retail Store</SelectItem>
              <SelectItem value="wholesale">Wholesale</SelectItem>
              <SelectItem value="dropshipping">Dropshipping</SelectItem>
              <SelectItem value="direct_sales">Direct Sales</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.type" class="text-sm text-destructive">{{ errors.type }}</p>
        </div>
        
        <div class="flex items-center space-x-2">
          <Switch id="is-active" v-model="form.isActive" :disabled="isSubmitting" />
          <Label for="is-active">Active Channel</Label>
        </div>

        <Separator />

        <!-- Pricing Configuration -->
        <h3 class="text-lg font-medium">Pricing Configuration</h3>
        
        <div class="space-y-2">
          <Label for="pricing-strategy">Pricing Strategy</Label>
          <Select 
            v-model="form.pricingStrategy" 
            :disabled="isSubmitting"
          >
            <SelectTrigger id="pricing-strategy">
              <SelectValue placeholder="Select pricing strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
              <SelectItem value="b2b">B2B</SelectItem>
              <SelectItem value="wholesale">Wholesale</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div class="space-y-2">
          <Label for="markup-percentage">Markup Percentage (%)</Label>
          <div class="relative">
            <Input 
              id="markup-percentage" 
              type="number" 
              v-model="form.markupPercentage" 
              placeholder="0" 
              :disabled="isSubmitting"
              step="0.1"
              min="0"
              max="100"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span class="text-muted-foreground">%</span>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="currency">Currency</Label>
            <Select 
              v-model="form.currency" 
              :disabled="isSubmitting"
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CAD">CAD ($)</SelectItem>
                <SelectItem value="AUD">AUD ($)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="platform-fee">Platform Fee (%)</Label>
            <div class="relative">
              <Input 
                id="platform-fee" 
                type="number" 
                v-model="form.platformFee" 
                placeholder="0" 
                :disabled="isSubmitting"
                step="0.1"
                min="0"
                max="100"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span class="text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="space-y-2">
          <Label for="minimum-order">Minimum Order Amount</Label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span class="text-muted-foreground">$</span>
            </div>
            <Input 
              id="minimum-order" 
              type="number" 
              v-model="form.minimumOrderAmount" 
              placeholder="0.00" 
              :disabled="isSubmitting"
              class="pl-7"
              step="0.01"
              min="0"
            />
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <Switch id="tax-inclusive" v-model="form.taxInclusivePricing" :disabled="isSubmitting" />
          <Label for="tax-inclusive">Tax Inclusive Pricing</Label>
        </div>

        <Separator />

        <!-- Advanced Settings -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <Label for="advanced-settings">Advanced Settings</Label>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              @click="showAdvancedSettings = !showAdvancedSettings" 
              :disabled="isSubmitting"
            >
              <ChevronDownIcon v-if="!showAdvancedSettings" class="h-4 w-4" />
              <ChevronUpIcon v-else class="h-4 w-4" />
            </Button>
          </div>
          
          <div v-if="showAdvancedSettings" class="space-y-4 p-4 border rounded-md">
            <div class="space-y-2">
              <Label for="inventory-sync">Inventory Sync</Label>
              <Select 
                v-model="form.advancedSettings.inventorySync" 
                :disabled="isSubmitting"
              >
                <SelectTrigger id="inventory-sync">
                  <SelectValue placeholder="Select inventory sync option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real_time">Real-time</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="order-fulfillment">Order Fulfillment</Label>
              <Select 
                v-model="form.advancedSettings.orderFulfillment" 
                :disabled="isSubmitting"
              >
                <SelectTrigger id="order-fulfillment">
                  <SelectValue placeholder="Select order fulfillment option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="third_party">Third-party</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="flex items-center space-x-2">
              <Switch id="allow-discounts" v-model="form.advancedSettings.allowDiscounts" :disabled="isSubmitting" />
              <Label for="allow-discounts">Allow Discounts</Label>
            </div>
            
            <div class="flex items-center space-x-2">
              <Switch id="allow-coupons" v-model="form.advancedSettings.allowCoupons" :disabled="isSubmitting" />
              <Label for="allow-coupons">Allow Coupons</Label>
            </div>
          </div>
        </div>
      </div>
      
      <SheetFooter>
        <div class="flex justify-between w-full">
          <Button 
            type="button" 
            variant="outline" 
            @click="$emit('close')" 
            :disabled="isSubmitting"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            :disabled="isSubmitting || !isFormValid"
          >
            <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
            {{ isEditMode ? 'Update Channel' : 'Create Channel' }}
          </Button>
        </div>
      </SheetFooter>
    </form>
  </SheetContent>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  salesChannel: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['channel-created', 'channel-updated', 'close'])
const { toast } = useToast()

// State
const isSubmitting = ref(false)
const showAdvancedSettings = ref(false)
const errors = ref({})

// Default form state
const defaultForm = {
  name: '',
  description: '',
  type: 'online_store',
  isActive: true,
  pricingStrategy: 'standard',
  markupPercentage: 0,
  currency: 'USD',
  platformFee: 0,
  minimumOrderAmount: 0,
  taxInclusivePricing: false,
  advancedSettings: {
    inventorySync: 'real_time',
    orderFulfillment: 'automatic',
    allowDiscounts: true,
    allowCoupons: true
  }
}

// Initialize form with default values or existing channel data
const form = ref({ ...defaultForm })

// Determine if we're editing or creating
const isEditMode = computed(() => !!props.salesChannel)

// Form validation
const isFormValid = computed(() => {
  return !!form.value.name && !!form.value.type
})

// Initialize form with channel data if available
onMounted(() => {
  if (props.salesChannel) {
    // Populate form with existing channel data
    form.value = {
      ...defaultForm,
      ...props.salesChannel,
      advancedSettings: {
        ...defaultForm.advancedSettings,
        ...(props.salesChannel.advancedSettings || {})
      }
    }
    
    // Show advanced settings if they exist
    if (props.salesChannel.advancedSettings) {
      showAdvancedSettings.value = true
    }
  }
})

// Form submission handler
async function handleSubmit() {
  // Reset errors
  errors.value = {}
  
  // Validate form
  if (!form.value.name) {
    errors.value.name = 'Channel name is required'
  }
  
  if (!form.value.type) {
    errors.value.type = 'Channel type is required'
  }
  
  if (Object.keys(errors.value).length > 0) {
    return
  }
  
  // Set loading state
  isSubmitting.value = true
  
  try {
    if (isEditMode.value) {
      // Update existing channel
      emit('channel-updated', {
        ...props.salesChannel,
        ...form.value
      })
      
      toast({
        title: 'Channel updated',
        description: `${form.value.name} has been updated successfully`,
        variant: 'success'
      })
    } else {
      // Create new channel
      emit('channel-created', {
        id: generateTempId(), // In a real app, the backend would generate this
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...form.value
      })
      
      toast({
        title: 'Channel created',
        description: `${form.value.name} has been created successfully`,
        variant: 'success'
      })
    }
    
    // Close the sheet
    emit('close')
  } catch (error) {
    console.error('Error saving channel:', error)
    
    toast({
      title: 'Error',
      description: 'There was an error saving the sales channel',
      variant: 'destructive'
    })
  } finally {
    isSubmitting.value = false
  }
}

// Helper function to generate a temporary ID
function generateTempId() {
  return 'temp_' + Math.random().toString(36).substr(2, 9)
}
</script>