<template>
  <Sheet :open="isOpen" @update:open="handleSheetOpenChange">
    <SheetContent class="sm:max-w-xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{{ isEditing ? 'Edit Product' : 'Add New Product' }}</SheetTitle>
        <SheetDescription>
          {{ isEditing ? 'Update the product details' : 'Add a new product to your catalog' }}
        </SheetDescription>
      </SheetHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6 py-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <!-- Product Name -->
          <div class="sm:col-span-2">
            <Label for="name">Product Name <span class="text-destructive">*</span></Label>
            <Input id="name" v-model="formData.name" placeholder="Enter product name" :disabled="isSubmitting" />
            <p v-if="errors.name" class="text-sm text-destructive mt-1">{{ errors.name }}</p>
          </div>

          <!-- SKU & Product Type -->
          <div>
            <Label for="sku">SKU</Label>
            <Input id="sku" v-model="formData.sku" placeholder="SKU or product code" :disabled="isSubmitting" />
          </div>

          <div>
            <Label for="productType">Product Type <span class="text-destructive">*</span></Label>
            <Select v-model="formData.productType" :disabled="isSubmitting">
              <SelectTrigger id="productType">
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="category in categories" :key="category.value" :value="category.value">
                  {{ category.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.productType" class="text-sm text-destructive mt-1">{{ errors.productType }}</p>
          </div>

          <!-- Market Segment -->
          <div>
            <Label for="marketSegment">Market Segment <span class="text-destructive">*</span></Label>
            <Select v-model="formData.marketSegment" :disabled="isSubmitting">
              <SelectTrigger id="marketSegment">
                <SelectValue placeholder="Select market segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                <SelectItem value="BUSINESS">Business</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.marketSegment" class="text-sm text-destructive mt-1">{{ errors.marketSegment }}</p>
          </div>

          <!-- Status -->
          <div>
            <Label for="status">Status</Label>
            <Select v-model="formData.status" :disabled="isSubmitting">
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="NOT_ACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Track Inventory Toggle -->
          <div class="flex items-center space-x-2">
            <Switch
              id="trackInventory"
              v-model="formData.trackInventory"
              :disabled="isSubmitting"
            />
            <Label for="trackInventory">Track Inventory</Label>
          </div>
        </div>

        <!-- Internet Specific Fields -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <Label for="downloadSpeed">Download Speed (Mbps)</Label>
            <Input
              id="downloadSpeed"
              v-model.number="formData.downloadSpeed"
              type="number"
              min="0"
              placeholder="0"
              :disabled="isSubmitting"
            />
          </div>
          <div>
            <Label for="uploadSpeed">Upload Speed (Mbps)</Label>
            <Input
              id="uploadSpeed"
              v-model.number="formData.uploadSpeed"
              type="number"
              min="0"
              placeholder="0"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <!-- Product Description -->
        <div>
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="formData.description"
            placeholder="Enter product description"
            class="h-24"
            :disabled="isSubmitting"
          />
        </div>

        <!-- Pricing Section -->
        <div class="space-y-4">
          <h3 class="text-base font-medium">Pricing</h3>
          <div class="grid gap-4 sm:grid-cols-3">
            <!-- Monthly Price -->
            <div>
              <Label for="monthlyPrice">Monthly Price <span class="text-destructive">*</span></Label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-muted-foreground">KSh</span>
                <Input
                  id="monthlyPrice"
                  v-model.number="formData.monthlyPrice"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="pl-12"
                  :disabled="isSubmitting"
                />
              </div>
              <p v-if="errors.monthlyPrice" class="text-sm text-destructive mt-1">{{ errors.monthlyPrice }}</p>
            </div>

            <!-- Setup Fee -->
            <div>
              <Label for="setupFee">Setup Fee</Label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-muted-foreground">KSh</span>
                <Input
                  id="setupFee"
                  v-model.number="formData.setupFee"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="pl-12"
                  :disabled="isSubmitting"
                />
              </div>
            </div>

            <!-- Termination Fee -->
            <div>
              <Label for="terminationFee">Termination Fee</Label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-muted-foreground">KSh</span>
                <Input
                  id="terminationFee"
                  v-model.number="formData.terminationFee"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="pl-12"
                  :disabled="isSubmitting"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Geographical Pricing Toggle -->
        <div class="flex items-center space-x-2">
          <Switch
            id="geographicalPricingEnabled"
            @click="geographicalPricingEnabled = !geographicalPricingEnabled"            
            :disabled="isSubmitting"
          />
          <Label for="geographicalPricingEnabled">Enable Geographical Pricing</Label>
        </div>

        <!-- Geographical Pricing -->
        <div v-if="geographicalPricingEnabled">
          <Label class="block mb-2">Geographical Pricing</Label>
          <div class="space-y-2">
            <div
              v-for="(pricing, index) in geographicalPricing"
              :key="index"
              class="grid grid-cols-5 gap-2"
            >
              <div class="col-span-2">
                <Select v-model="pricing.serviceCoverageId" :disabled="isSubmitting">
                  <SelectTrigger>
                    <SelectValue placeholder="Select service area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="area in serviceAreas" 
                      :key="area.id" 
                      :value="area.id"
                    >
                      {{ area.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="col-span-2 relative">
                <span class="absolute left-3 top-2.5 text-muted-foreground">KSh</span>
                <Input
                  v-model.number="pricing.pricing"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="pl-12"
                  :disabled="isSubmitting"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                @click="removeGeographicalPricing(index)"
                :disabled="isSubmitting"
              >
                <MinusIcon class="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="addGeographicalPricing"
              :disabled="isSubmitting"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Area Pricing
            </Button>
          </div>
        </div>

        <!-- Promotional Pricing -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <Label>Promotional Pricing</Label>
            <Switch
              @click="hasPromotionalPricing = !hasPromotionalPricing"
              :disabled="isSubmitting"
            />
          </div>
          
          <div v-if="hasPromotionalPricing" class="space-y-4 border rounded-md p-4">
            <div>
              <Label for="promoPrice">Promotional Price</Label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-muted-foreground">KSh</span>
                <Input
                  id="promoPrice"
                  v-model.number="formData.promotionalPricing.monthlyPrice"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="pl-12"
                  :disabled="isSubmitting"
                />
              </div>
            </div>
            
            <div>
              <Label for="promoDescription">Promotion Description</Label>
              <Textarea
                id="promoDescription"
                v-model="formData.promotionalPricing.promotionDescription"
                placeholder="Enter promotion details"
                :disabled="isSubmitting"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="promoStartDate">Start Date</Label>
                <Input
                  id="promoStartDate"
                  v-model="formData.promotionalPricing.startDate"
                  type="date"
                  :disabled="isSubmitting"
                />
              </div>
              
              <div>
                <Label for="promoEndDate">End Date</Label>
                <Input
                  id="promoEndDate"
                  v-model="formData.promotionalPricing.endDate"
                  type="date"
                  :disabled="isSubmitting"
                />
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <Switch
                id="autoApply"
                v-model="formData.promotionalPricing.autoApply"
                :disabled="isSubmitting"
              />
              <Label for="autoApply">Auto Apply</Label>
            </div>
          </div>
        </div>

        <!-- Features List -->
        <div>
          <Label class="block mb-2">Features</Label>
          <div class="space-y-2">
            <div
              v-for="(feature, index) in features"
              :key="index"
              class="flex gap-2"
            >
              <Input
                v-model="feature.name"
                placeholder="Enter feature"
                :disabled="isSubmitting"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                @click="removeFeature(index)"
                :disabled="isSubmitting"
              >
                <MinusIcon class="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="addFeature"
              :disabled="isSubmitting"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </div>
        </div>

        <!-- Specifications -->
        <div>
          <Label class="block mb-2">Specifications</Label>
          <div class="space-y-2">
            <div
              v-for="(spec, index) in specifications"
              :key="index"
              class="grid grid-cols-5 gap-2"
            >
              <Input
                v-model="spec.specName"
                placeholder="Spec name"
                class="col-span-2"
                :disabled="isSubmitting"
              />
              <Input
                v-model="spec.specValue"
                placeholder="Value"
                class="col-span-2"
                :disabled="isSubmitting"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                @click="removeSpecification(index)"
                :disabled="isSubmitting"
              >
                <MinusIcon class="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="addSpecification"
              :disabled="isSubmitting"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Specification
            </Button>
          </div>
        </div>

        <!-- Service Areas -->
        <div v-if="serviceAreas.length > 0">
          <Label for="service-areas">Service Coverage Areas</Label>
          <Multiselect
            v-model="formData.serviceCoverageAreas"
            :options="serviceAreas.map(area => area.id)"
            :multiple="true"
            :custom-label="(id) => getServiceAreaName(id)"
            placeholder="Select available service areas"
            :disabled="isSubmitting"
            class="multiselect-custom"
          />
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" @click="handleCloseSheet" :disabled="isSubmitting">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            <LoaderIcon v-if="isSubmitting" class="mr-2 h-4 w-4" />
            {{ isEditing ? 'Update Product' : 'Create Product' }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  PlusIcon,
  MinusIcon,
  UploadCloudIcon,
  XIcon,
  LoaderIcon
} from 'lucide-vue-next'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import Multiselect from 'vue-multiselect'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => [
      { label: 'Internet Service', value: 'INTERNET_SERVICE' },
      { label: 'TV Service', value: 'TV_SERVICE' },
      { label: 'Phone Service', value: 'PHONE_SERVICE' },
      { label: 'Hardware', value: 'HARDWARE' },
      { label: 'Bundle', value: 'BUNDLE' }
    ]
  },
  serviceAreas: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'update:open',
  'submit',
  'cancel'
])

// State
const isSubmitting = ref(false)
const errors = ref({})
const hasPromotionalPricing = ref(false)
const features = ref([])
const specifications = ref([])
const geographicalPricing = ref([])
const geographicalPricingEnabled = ref(false)

const formData = ref({
  id: 0,
  name: '',
  sku: '',
  productType: '',
  description: '',
  uploadSpeed: null,
  downloadSpeed: null,
  monthlyPrice: null,
  setupFee: 0,
  terminationFee: 0,
  status: 'ACTIVE',
  trackInventory: false,
  marketSegment: 'RESIDENTIAL',
  geographicalPricingEnabled: false,
  promotionalPricing: {
    monthlyPrice: null,
    promotionDescription: '',
    startDate: '',
    endDate: '',
    autoApply: true
  },
  serviceCoverageAreas: []
})

// Computed properties
const isEditing = computed(() => !!props.product)

// Reset form to initial state
const resetForm = () => {
  hasPromotionalPricing.value = false
  features.value = []
  specifications.value = []
  geographicalPricing.value = []
  formData.value = {
    id: 0,
    name: '',
    sku: '',
    productType: '',
    description: '',
    uploadSpeed: null,
    downloadSpeed: null,
    monthlyPrice: null,
    setupFee: 0,
    terminationFee: 0,
    status: 'ACTIVE',
    trackInventory: false,
    marketSegment: 'RESIDENTIAL',
    geographicalPricingEnabled: false,
    promotionalPricing: {
      monthlyPrice: null,
      promotionDescription: '',
      startDate: '',
      endDate: '',
      autoApply: true
    },
    serviceCoverageAreas: []
  }
  errors.value = {}
}

// Initialize form data from product
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    formData.value = {
      id: 0,
      name: newProduct.name || '',
      sku: newProduct.sku || '',
      productType: newProduct.productType || '',
      description: newProduct.description || '',
      uploadSpeed: newProduct.uploadSpeed || null,
      downloadSpeed: newProduct.downloadSpeed || null,
      monthlyPrice: newProduct.monthlyPrice || null,
      setupFee: newProduct.setupFee || 0,
      terminationFee: newProduct.terminationFee || 0,
      status: newProduct.status || 'ACTIVE',
      trackInventory: newProduct.trackInventory || false,
      marketSegment: newProduct.marketSegment || 'RESIDENTIAL',
      geographicalPricingEnabled: newProduct.geographicalPricingEnabled || false,
      promotionalPricing: newProduct.promotionalPricing || {
        monthlyPrice: null,
        promotionDescription: '',
        startDate: '',
        endDate: '',
        autoApply: true
      },
      serviceCoverageAreas: newProduct.serviceCoverageAreas || []
    }
    
    // Set promotional pricing flag
    hasPromotionalPricing.value = !!newProduct.promotionalPricing;
    
    // Convert features array
    features.value = Array.isArray(newProduct.features) ? [...newProduct.features] : [];
    
    // Convert specifications array
    specifications.value = Array.isArray(newProduct.specifications) ? [...newProduct.specifications] : [];
    
    // Convert geographical pricing array
    geographicalPricing.value = Array.isArray(newProduct.geographicalPricing) ? [...newProduct.geographicalPricing] : [];
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => formData.value.geographicalPricingEnabled, (newValue) => {
  if (newValue && geographicalPricing.value.length === 0) {
    addGeographicalPricing()
  }
})

watch(() => hasPromotionalPricing.value, (newValue) => {
  if (newValue) {
    if (!formData.value.promotionalPricing) {
      formData.value.promotionalPricing = {
        monthlyPrice: null,
        promotionDescription: '',
        startDate: '',
        endDate: '',
        autoApply: true
      }
    }
  }
})

// Methods
const handleSheetOpenChange = (isOpen) => {
  if (!isOpen && !isSubmitting.value) {
    resetForm()
  }
  emit('update:open', isOpen)
}

const handleCloseSheet = () => {
  if (!isSubmitting.value) {
    emit('update:open', false)
    emit('cancel')
  }
}

const validate = () => {
  errors.value = {}
  let isValid = true
  
  if (!formData.value.name?.trim()) {
    errors.value.name = 'Product name is required'
    isValid = false
  }
  
  if (!formData.value.productType) {
    errors.value.productType = 'Product type is required'
    isValid = false
  }
  
  if (!formData.value.marketSegment) {
    errors.value.marketSegment = 'Market segment is required'
    isValid = false
  }
  
  if (!formData.value.monthlyPrice && formData.value.monthlyPrice !== 0) {
    errors.value.monthlyPrice = 'Monthly price is required'
    isValid = false
  } else if (isNaN(parseFloat(formData.value.monthlyPrice)) || parseFloat(formData.value.monthlyPrice) < 0) {
    errors.value.monthlyPrice = 'Monthly price must be a valid number'
    isValid = false
  }
  
  return isValid
}

const handleSubmit = async () => {
  if (!validate()) return
  
  isSubmitting.value = true
  
  try {
    // Prepare final form data
    const finalFormData = { ...formData.value }
    
    // Ensure numeric values are properly converted
    finalFormData.downloadSpeed = formData.value.downloadSpeed !== '' ? Number(formData.value.downloadSpeed || 0) : 0
    finalFormData.uploadSpeed = formData.value.uploadSpeed !== '' ? Number(formData.value.uploadSpeed || 0) : 0
    finalFormData.monthlyPrice = Number(formData.value.monthlyPrice || 0)
    finalFormData.setupFee = Number(formData.value.setupFee || 0)
    finalFormData.terminationFee = Number(formData.value.terminationFee || 0)
    
    // Handle promotional pricing
    if (!hasPromotionalPricing.value) {
      finalFormData.promotionalPricing = null
    } else {
      // Format promotional pricing values
      finalFormData.promotionalPricing = {
        monthlyPrice: Number(formData.value.promotionalPricing.monthlyPrice || 0),
        promotionDescription: formData.value.promotionalPricing.promotionDescription || '',
        startDate: formData.value.promotionalPricing.startDate || null,
        endDate: formData.value.promotionalPricing.endDate || null,
        autoApply: Boolean(formData.value.promotionalPricing.autoApply)
      }
    }
    
    // Filter out incomplete geographical pricing entries
    if (geographicalPricingEnabled) {
      finalFormData.geographicalPricingEnabled = true
      finalFormData.geographicalPricing = geographicalPricing.value
        .filter(item => item.serviceCoverageId !== null)
        .map(item => ({
          serviceCoverageId: Number(item.serviceCoverageId),
          pricing: Number(item.pricing || 0)
        }))
    } else {
      finalFormData.geographicalPricingEnabled = false
      finalFormData.geographicalPricing = []
    }
    
    // Add features and specifications
    finalFormData.features = features.value
    finalFormData.specifications = specifications.value
    
    // Add product ID if editing
    if (props.product) {
      finalFormData.id = props.product.id
    }
    
    console.log('Submitting product data:', finalFormData)
    await emit('submit', finalFormData)
    handleCloseSheet()
  } catch (error) {
    console.error('Error submitting product:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Feature list methods
const addFeature = () => {
  features.value.push({ name: '' })
}

const removeFeature = (index) => {
  features.value.splice(index, 1)
}

// Specifications methods
const addSpecification = () => {
  specifications.value.push({ specName: '', specValue: '' })
}

const removeSpecification = (index) => {
  specifications.value.splice(index, 1)
}

// Geographical pricing methods
const addGeographicalPricing = () => {
  geographicalPricing.value.push({ pricing: 0, serviceCoverageId: null })
}

const removeGeographicalPricing = (index) => {
  geographicalPricing.value.splice(index, 1)
}

// Helper to get service area name by ID
const getServiceAreaName = (id) => {
  const area = props.serviceAreas.find(area => area.id === id)
  return area ? area.name : `Area ${id}`
}
</script>

<style>
@import 'vue-multiselect/dist/vue-multiselect.css';

/* Custom styling for multiselect */
.multiselect-custom {
  @apply rounded-md border border-input bg-background;
}
</style>