<template>
  <SheetContent class="w-full md:max-w-[500px] overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Edit Variant</SheetTitle>
      <SheetDescription>
        Update variant information for {{ product?.name }}
      </SheetDescription>
    </SheetHeader>

    <div class="py-6 space-y-6">
      <div v-if="!variant || !product" class="flex items-center justify-center h-32">
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
      
      <form v-else @submit.prevent="submitForm" class="space-y-6">
        <!-- Basic Information -->
        <div>
          <h3 class="text-sm font-medium mb-2">Basic Information</h3>
          <div class="rounded-md border p-4 space-y-4">
            <div>
              <div class="flex items-center mb-1">
                <span class="text-sm font-medium text-muted-foreground">Product:</span>
              </div>
              <div class="text-base font-medium">{{ product.name }}</div>
              <div class="text-xs text-muted-foreground mt-1 font-mono">ID: {{ product.id }}</div>
            </div>
            
            <div class="space-y-2">
              <Label for="variant-sku">SKU <span class="text-destructive">*</span></Label>
              <Input 
                id="variant-sku"
                v-model="form.sku"
                placeholder="e.g. TSHIRT-BLU-M"
                :disabled="isSubmitting"
              />
              <p v-if="errors.sku" class="text-sm text-destructive">{{ errors.sku }}</p>
            </div>
          </div>
        </div>

        <!-- Attributes -->
        <div>
          <h3 class="text-sm font-medium mb-2">Attributes</h3>
          <div class="rounded-md border p-4 space-y-4">
            <div v-for="attribute in variantAttributes" :key="attribute.id" class="space-y-2">
              <Label :for="`attr-${attribute.id}`">
                {{ attribute.name }}
                <span v-if="attribute.isRequired" class="text-destructive">*</span>
              </Label>
              
              <Select 
                v-if="attribute.type === 'select'"
                v-model="form.attributeValues[attribute.id]"
                :disabled="isSubmitting"
              >
                <SelectTrigger :id="`attr-${attribute.id}`">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="option in attribute.options" 
                    :key="option.id" 
                    :value="option.id"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <div v-else-if="attribute.type === 'color'" class="space-y-3">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="option in attribute.options"
                    :key="option.id"
                    type="button"
                    class="relative w-8 h-8 rounded-full border"
                    :class="{ 'ring-2 ring-primary ring-offset-2': form.attributeValues[attribute.id] === option.id }"
                    :style="{ backgroundColor: option.metadata?.color || '#ccc' }"
                    @click="form.attributeValues[attribute.id] = option.id"
                  >
                    <span v-if="form.attributeValues[attribute.id] === option.id" class="absolute inset-0 flex items-center justify-center">
                      <Check class="h-4 w-4 text-white drop-shadow-lg" />
                    </span>
                  </button>
                </div>
                <div class="text-sm">
                  {{ getAttributeOptionLabel(attribute.id, form.attributeValues[attribute.id]) }}
                </div>
              </div>
              
              <Input 
                v-else
                :id="`attr-${attribute.id}`"
                v-model="form.attributeValues[attribute.id]"
                :placeholder="`Enter ${attribute.name.toLowerCase()}`"
                :disabled="isSubmitting"
              />
              
              <p v-if="errors[`attr_${attribute.id}`]" class="text-sm text-destructive">
                {{ errors[`attr_${attribute.id}`] }}
              </p>
            </div>
            
            <div v-if="variantAttributes.length === 0" class="text-sm text-muted-foreground italic">
              No variant attributes configured for this product.
            </div>
          </div>
        </div>

        <!-- Pricing -->
        <div>
          <h3 class="text-sm font-medium mb-2">Pricing</h3>
          <div class="rounded-md border p-4 space-y-4">
            <div class="flex items-center space-x-2 mb-2">
              <div class="text-sm font-medium">Product Base Price: {{ formatPrice(product.price) }}</div>
            </div>
            
            <div class="space-y-2">
              <RadioGroup v-model="pricingType" class="space-y-3">
                <div class="flex items-start space-x-2">
                  <RadioGroupItem value="specific" id="specific-price" />
                  <div class="space-y-1">
                    <Label for="specific-price">Specific Price</Label>
                    <p class="text-xs text-muted-foreground">
                      Set an exact price for this variant
                    </p>
                  </div>
                </div>
                <div class="flex items-start space-x-2">
                  <RadioGroupItem value="adjustment" id="price-adjustment" />
                  <div class="space-y-1">
                    <Label for="price-adjustment">Price Adjustment</Label>
                    <p class="text-xs text-muted-foreground">
                      Apply a percentage adjustment to the product's base price
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div v-if="pricingType === 'specific'" class="space-y-2">
              <Label for="variant-price">Variant Price <span class="text-destructive">*</span></Label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input 
                  id="variant-price"
                  v-model="form.price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="pl-8"
                  placeholder="0.00"
                  :disabled="isSubmitting"
                />
              </div>
              <p v-if="errors.price" class="text-sm text-destructive">{{ errors.price }}</p>
            </div>
            
            <div v-else class="space-y-2">
              <Label for="price-adjustment-value">Price Adjustment (%)</Label>
              <div class="relative">
                <Input 
                  id="price-adjustment-value"
                  v-model="form.priceAdjustment"
                  type="number"
                  step="0.1"
                  class="pr-8"
                  placeholder="0"
                  :disabled="isSubmitting"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
              <p class="text-sm text-muted-foreground mt-1">
                Adjusted price: {{ formatPrice(adjustedPrice) }}
                <span class="text-xs">
                  ({{ form.priceAdjustment > 0 ? '+' : '' }}{{ form.priceAdjustment }}%)
                </span>
              </p>
              <p v-if="errors.priceAdjustment" class="text-sm text-destructive">{{ errors.priceAdjustment }}</p>
            </div>
          </div>
        </div>

        <!-- Inventory -->
        <div>
          <h3 class="text-sm font-medium mb-2">Inventory</h3>
          <div class="rounded-md border p-4 space-y-4">
            <div class="space-y-2">
              <Label for="variant-stock">Stock Quantity</Label>
              <Input 
                id="variant-stock"
                v-model="form.stock"
                type="number"
                min="0"
                placeholder="0"
                :disabled="isSubmitting"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="variant-low-stock">Low Stock Threshold</Label>
              <Input 
                id="variant-low-stock"
                v-model="form.lowStockThreshold"
                type="number"
                min="0"
                placeholder="5"
                :disabled="isSubmitting"
              />
              <p class="text-xs text-muted-foreground">
                System will alert when stock falls below this level
              </p>
            </div>
            
            <div class="flex items-center space-x-2 mt-2">
              <Checkbox 
                id="variant-track-inventory" 
                v-model:checked="form.trackInventory"
                :disabled="isSubmitting"
              />
              <div>
                <Label for="variant-track-inventory">Track Inventory</Label>
                <p class="text-xs text-muted-foreground">
                  Enable inventory tracking for this variant
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div>
          <h3 class="text-sm font-medium mb-2">Status</h3>
          <div class="rounded-md border p-4 space-y-4">
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="variant-enabled" 
                v-model:checked="form.isEnabled"
                :disabled="isSubmitting"
              />
              <div>
                <Label for="variant-enabled">Enable Variant</Label>
                <p class="text-xs text-muted-foreground">
                  Disabled variants are not visible to customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>

    <SheetFooter>
      <Button variant="outline" @click="$emit('close')" :disabled="isSubmitting">
        Cancel
      </Button>
      <Button @click="submitForm" :disabled="isSubmitting || !isValid">
        <Loader2 v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        Save Changes
      </Button>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Loader2, Check } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const props = defineProps({
  variant: {
    type: Object,
    required: true
  },
  product: {
    type: Object,
    required: true
  },
  attributes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['variant-updated', 'close'])

// Form state
const form = ref({
  id: '',
  sku: '',
  price: '',
  priceAdjustment: 0,
  stock: 0,
  lowStockThreshold: 5,
  trackInventory: true,
  isEnabled: true,
  attributeValues: {}
})

const originalForm = ref({})
const pricingType = ref('specific')
const errors = ref({})
const isSubmitting = ref(false)

// Initialize form with variant data
onMounted(() => {
  if (props.variant) {
    form.value = {
      id: props.variant.id,
      sku: props.variant.sku || '',
      price: props.variant.price || props.product.price || 0,
      priceAdjustment: props.variant.priceAdjustment || 0,
      stock: props.variant.stock || 0,
      lowStockThreshold: props.variant.lowStockThreshold || 5,
      trackInventory: props.variant.trackInventory !== false,
      isEnabled: props.variant.isEnabled !== false,
      attributeValues: { ...props.variant.attributeValues } || {}
    }
    
    // Determine pricing type
    pricingType.value = props.variant.priceAdjustment !== undefined ? 'adjustment' : 'specific'
    
    // Keep a copy for comparison
    originalForm.value = JSON.parse(JSON.stringify(form.value))
  }
})

// Watch for pricing type changes
watch(pricingType, (newType) => {
  if (newType === 'specific') {
    form.value.priceAdjustment = 0
  } else {
    // Calculate adjustment based on current price
    if (props.product.price && form.value.price) {
      const adjustment = ((form.value.price - props.product.price) / props.product.price) * 100
      form.value.priceAdjustment = Math.round(adjustment * 10) / 10
    } else {
      form.value.priceAdjustment = 0
    }
  }
})

// Computed properties
const variantAttributes = computed(() => {
  return props.attributes.filter(attr => attr.isVariant)
})

const isValid = computed(() => {
  return !!form.value.sku.trim() && 
    (form.value.price > 0 || (props.product.price > 0 && form.value.priceAdjustment !== null))
})

const adjustedPrice = computed(() => {
  if (!props.product.price) return 0
  const adjustment = props.product.price * (form.value.priceAdjustment / 100)
  return props.product.price + adjustment
})

// Validation
const validateForm = () => {
  const newErrors = {}
  
  if (!form.value.sku.trim()) {
    newErrors.sku = 'SKU is required'
  }
  
  if (pricingType.value === 'specific' && !form.value.price) {
    newErrors.price = 'Price is required'
  }
  
  // Validate required attributes
  variantAttributes.value.forEach(attr => {
    if (attr.isRequired && !form.value.attributeValues[attr.id]) {
      newErrors[`attr_${attr.id}`] = `${attr.name} is required`
    }
  })
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Utility methods
const formatPrice = (price) => {
  if (price === undefined || price === null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

const getAttributeOptionLabel = (attributeId, optionId) => {
  if (!optionId) return ''
  
  const attribute = props.attributes.find(attr => attr.id === attributeId)
  if (!attribute || !attribute.options) return optionId
  
  const option = attribute.options.find(opt => opt.id === optionId)
  return option ? option.label : optionId
}

// Submit handler
const submitForm = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    // Create the updated variant data object
    const updatedVariant = {
      id: form.value.id,
      sku: form.value.sku.trim(),
      attributeValues: form.value.attributeValues,
      trackInventory: form.value.trackInventory,
      lowStockThreshold: parseInt(form.value.lowStockThreshold) || 5,
      stock: parseInt(form.value.stock) || 0,
      isEnabled: form.value.isEnabled
    }
    
    // Add pricing fields based on pricing type
    if (pricingType.value === 'specific') {
      updatedVariant.price = parseFloat(form.value.price) || 0
      updatedVariant.priceAdjustment = undefined
    } else {
      updatedVariant.price = undefined
      updatedVariant.priceAdjustment = parseFloat(form.value.priceAdjustment) || 0
    }
    
    // Add product and matrix info for the update
    updatedVariant.productId = props.product.id
    updatedVariant.matrixId = props.variant.matrixId
    
    // Emit the event with the updated variant data
    emit('variant-updated', updatedVariant)
  } catch (error) {
    console.error('Error updating variant:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>