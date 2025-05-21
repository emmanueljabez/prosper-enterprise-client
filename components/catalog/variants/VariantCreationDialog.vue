<template>
  <DialogContent class="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Create New Variant</DialogTitle>
      <DialogDescription>
        Add a new variant to an existing product
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <Tabs v-model="currentTab" class="space-y-4">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="step1">1. Select Product</TabsTrigger>
          <TabsTrigger value="step2" :disabled="!selectedProduct">2. Configure Variant</TabsTrigger>
        </TabsList>
        
        <!-- Step 1: Product Selection -->
        <TabsContent value="step1" class="space-y-4">
          <div class="space-y-2">
            <Label for="product-search">Search Product</Label>
            <Input 
              id="product-search"
              v-model="productSearch"
              placeholder="Search by name, SKU or ID..."
              :disabled="isSubmitting"
            />
          </div>

          <div class="border rounded-md">
            <div class="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody v-if="filteredProducts.length">
                  <TableRow 
                    v-for="product in filteredProducts" 
                    :key="product.id"
                    :class="{ 'bg-muted/40': product.id === selectedProduct?.id }"
                  >
                    <TableCell>
                      <div class="font-medium">{{ product.name }}</div>
                      <div class="text-xs text-muted-foreground">{{ product.id }}</div>
                    </TableCell>
                    <TableCell>
                      <span class="font-mono text-sm">{{ product.sku || 'N/A' }}</span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        @click="selectProduct(product)"
                        :disabled="isSubmitting"
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableBody v-else>
                  <TableRow>
                    <TableCell colSpan="3" class="h-24 text-center">
                      <div class="flex flex-col items-center justify-center">
                        <PackageSearch class="h-8 w-8 text-muted-foreground mb-2" />
                        <div class="text-lg font-medium">No products found</div>
                        <div class="text-sm text-muted-foreground mt-1">
                          Try adjusting your search
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div v-if="selectedProduct" class="p-4 border rounded-md bg-muted/30">
            <div class="font-medium mb-1">Selected Product:</div>
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">{{ selectedProduct.name }}</div>
                <div class="text-xs text-muted-foreground">SKU: {{ selectedProduct.sku || 'N/A' }}</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                @click="selectedProduct = null"
                :disabled="isSubmitting"
              >
                Change
              </Button>
            </div>
          </div>

          <Button 
            class="w-full mt-4" 
            @click="currentTab = 'step2'"
            :disabled="!selectedProduct || isSubmitting"
          >
            Continue to Configure Variant
          </Button>
        </TabsContent>
        
        <!-- Step 2: Variant Configuration -->
        <TabsContent value="step2" class="space-y-4">
          <Alert v-if="!productVariantAttributes.length" variant="warning">
            <AlertTriangle class="h-4 w-4" />
            <AlertTitle>No variant attributes</AlertTitle>
            <AlertDescription>
              This product doesn't have any variant attributes configured.
              <p><Button variant="link" class="h-auto p-0 mt-1" @click="currentTab = 'step1'">Select a different product</Button></p>
            </AlertDescription>
          </Alert>

          <form v-if="selectedProduct" class="space-y-6" @submit.prevent="submitForm">
            <!-- Basic Information -->
            <div>
              <h3 class="text-sm font-medium mb-2">Basic Information</h3>
              <div class="rounded-md border p-4 space-y-4">
                <div class="space-y-2">
                  <Label for="variant-sku">SKU <span class="text-destructive">*</span></Label>
                  <Input 
                    id="variant-sku"
                    v-model="form.sku"
                    placeholder="e.g. TSHIRT-BLU-M"
                    :disabled="isSubmitting"
                  />
                  <p class="text-xs text-muted-foreground">
                    Must be unique across all products and variants
                  </p>
                  <p v-if="errors.sku" class="text-sm text-destructive">{{ errors.sku }}</p>
                </div>
              </div>
            </div>

            <!-- Variant Attributes -->
            <div>
              <h3 class="text-sm font-medium mb-2">Variant Attributes</h3>
              <div class="rounded-md border p-4 space-y-4">
                <div v-for="attribute in productVariantAttributes" :key="attribute.id" class="space-y-2">
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
                
                <div v-if="!productVariantAttributes.length" class="text-sm text-muted-foreground italic">
                  No variant attributes configured for this product.
                </div>
              </div>
            </div>

            <!-- Pricing -->
            <div>
              <h3 class="text-sm font-medium mb-2">Pricing</h3>
              <div class="rounded-md border p-4 space-y-4">
                <div class="flex items-center space-x-2 mb-2">
                  <div class="text-sm font-medium">Product Base Price: {{ formatPrice(selectedProduct.price) }}</div>
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
                  <Label for="variant-stock">Initial Stock</Label>
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
              <div class="rounded-md border p-4">
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
        </TabsContent>
      </Tabs>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')" :disabled="isSubmitting">
        Cancel
      </Button>
      <Button 
        v-if="currentTab === 'step1'" 
        @click="currentTab = 'step2'" 
        :disabled="!selectedProduct || isSubmitting"
      >
        Continue
      </Button>
      <Button 
        v-else 
        @click="submitForm" 
        :disabled="isSubmitting || !isValid"
      >
        <Loader2 v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        Create Variant
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Loader2, Check, AlertTriangle, PackageSearch
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps({
  products: {
    type: Array,
    default: () => []
  },
  attributes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['variant-created', 'close'])

// State
const currentTab = ref('step1')
const productSearch = ref('')
const selectedProduct = ref(null)
const pricingType = ref('specific')

// Form state
const form = ref({
  sku: '',
  price: '',
  priceAdjustment: 0,
  stock: 0,
  lowStockThreshold: 5,
  trackInventory: true,
  isEnabled: true,
  attributeValues: {}
})

const errors = ref({})
const isSubmitting = ref(false)

// Reset form when selected product changes
watch(selectedProduct, () => {
  form.value = {
    sku: '',
    price: selectedProduct.value ? selectedProduct.value.price : '',
    priceAdjustment: 0,
    stock: 0,
    lowStockThreshold: 5,
    trackInventory: true,
    isEnabled: true,
    attributeValues: {}
  }
  errors.value = {}
})

// Computed properties
const filteredProducts = computed(() => {
  if (!productSearch.value.trim()) return props.products
  
  const searchLower = productSearch.value.toLowerCase()
  return props.products.filter(product => 
    product.name.toLowerCase().includes(searchLower) ||
    (product.sku && product.sku.toLowerCase().includes(searchLower)) ||
    product.id.toLowerCase().includes(searchLower)
  )
})

const productVariantAttributes = computed(() => {
  if (!selectedProduct.value) return []
  
  return props.attributes.filter(attr => 
    attr.isVariant && 
    (!attr.isGlobal || (selectedProduct.value.attributeSetId && 
      attr.attributeSetIds?.includes(selectedProduct.value.attributeSetId)))
  )
})

const isValid = computed(() => {
  if (!selectedProduct.value) return false
  
  const skuValid = !!form.value.sku.trim()
  const priceValid = pricingType.value === 'specific' ? 
    parseFloat(form.value.price) > 0 : 
    true
  
  // Check required attributes
  const attributesValid = productVariantAttributes.value
    .filter(attr => attr.isRequired)
    .every(attr => !!form.value.attributeValues[attr.id])
    
  return skuValid && priceValid && attributesValid
})

const adjustedPrice = computed(() => {
  if (!selectedProduct.value?.price) return 0
  const adjustment = selectedProduct.value.price * (form.value.priceAdjustment / 100)
  return selectedProduct.value.price + adjustment
})

// Methods
const selectProduct = (product) => {
  selectedProduct.value = product
  currentTab.value = 'step2'
}

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

const validateForm = () => {
  const newErrors = {}
  
  if (!form.value.sku.trim()) {
    newErrors.sku = 'SKU is required'
  }
  
  if (pricingType.value === 'specific' && !parseFloat(form.value.price)) {
    newErrors.price = 'Price is required'
  }
  
  // Validate required attributes
  productVariantAttributes.value.forEach(attr => {
    if (attr.isRequired && !form.value.attributeValues[attr.id]) {
      newErrors[`attr_${attr.id}`] = `${attr.name} is required`
    }
  })
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const submitForm = async () => {
  if (!validateForm() || !selectedProduct.value) return
  
  isSubmitting.value = true
  
  try {
    // Generate a unique ID
    const variantId = 'var_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    
    // Create the new variant data object
    const newVariant = {
      id: variantId,
      sku: form.value.sku.trim(),
      attributeValues: form.value.attributeValues,
      trackInventory: form.value.trackInventory,
      lowStockThreshold: parseInt(form.value.lowStockThreshold) || 5,
      stock: parseInt(form.value.stock) || 0,
      isEnabled: form.value.isEnabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Add pricing fields based on pricing type
    if (pricingType.value === 'specific') {
      newVariant.price = parseFloat(form.value.price) || 0
    } else {
      newVariant.priceAdjustment = parseFloat(form.value.priceAdjustment) || 0
    }
    
    // Emit the event with the new variant data and product ID
    emit('variant-created', selectedProduct.value.id, newVariant)
  } catch (error) {
    console.error('Error creating variant:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>