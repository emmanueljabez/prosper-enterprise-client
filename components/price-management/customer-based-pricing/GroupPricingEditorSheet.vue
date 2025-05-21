<template>
  <Sheet :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <SheetContent class="sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{{ isEditMode ? 'Edit Group Pricing' : 'Create Group Pricing' }}</SheetTitle>
        <SheetDescription>
          {{ isEditMode ? 'Update pricing for this customer group.' : 'Set up pricing rules for this customer group.' }}
        </SheetDescription>
      </SheetHeader>
      
      <div class="py-6">
        <Tabs v-model="selectedTab" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Pricing</TabsTrigger>
            <TabsTrigger value="products">Product Overrides</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" class="space-y-6 pt-4">
            <!-- Basic Group Pricing -->
            <div class="space-y-4">
              <!-- Group Info (read-only) -->
              <div class="rounded-md bg-muted p-4">
                <div class="space-y-1">
                  <h3 class="text-sm font-medium">Customer Group</h3>
                  <div class="flex items-center">
                    <div class="font-medium">{{ group?.name || 'Selected Group' }}</div>
                    <Badge 
                      v-if="group?.isDefault" 
                      variant="default" 
                      class="ml-2"
                    >
                      Default
                    </Badge>
                    <Badge 
                      v-if="group?.customerCount" 
                      variant="secondary" 
                      class="ml-2"
                    >
                      {{ group?.customerCount }} customers
                    </Badge>
                  </div>
                  <p v-if="group?.description" class="text-sm text-muted-foreground">
                    {{ group.description }}
                  </p>
                </div>
              </div>
              
              <!-- Basic Discount Settings -->
              <div class="space-y-2">
                <Label for="discount-type">Discount Type</Label>
                <Select 
                  v-model="formData.discountType"
                  :disabled="isProcessing"
                >
                  <SelectTrigger id="discount-type">
                    <SelectValue placeholder="Select a discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Discount</SelectItem>
                    <SelectItem value="percentage">Percentage Discount</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div v-if="formData.discountType === 'percentage'" class="space-y-2">
                <Label for="discount-percentage">Discount Percentage</Label>
                <div class="relative">
                  <Input
                    id="discount-percentage"
                    v-model="formData.discountValue"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Enter discount percentage"
                    :disabled="isProcessing"
                    class="pr-8"
                  />
                  <span class="absolute right-3 top-2.5 text-muted-foreground">%</span>
                </div>
                <p v-if="errors.discountValue" class="text-sm text-destructive">{{ errors.discountValue }}</p>
              </div>
              
              <div v-if="formData.discountType === 'fixed_amount'" class="space-y-2">
                <Label for="discount-amount">Discount Amount</Label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input
                    id="discount-amount"
                    v-model="formData.discountValue"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter discount amount"
                    :disabled="isProcessing"
                    class="pl-8"
                  />
                </div>
                <p v-if="errors.discountValue" class="text-sm text-destructive">{{ errors.discountValue }}</p>
              </div>
              
              <Separator />
              
              <!-- Additional Pricing Settings -->
              <div class="space-y-4">
                <h3 class="text-sm font-medium">Additional Settings</h3>
                
                <div class="space-y-2">
                  <Label for="pricing-tier">Pricing Tier</Label>
                  <Select 
                    v-model="formData.pricingTier"
                    :disabled="isProcessing"
                  >
                    <SelectTrigger id="pricing-tier">
                      <SelectValue placeholder="Select a pricing tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Default Tier</SelectItem>
                      <SelectItem 
                        v-for="tier in pricingTiers" 
                        :key="tier.id" 
                        :value="tier.id"
                      >
                        {{ tier.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div class="space-y-2">
                  <Label for="minimum-order">Minimum Order Amount</Label>
                  <div class="relative">
                    <span class="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      id="minimum-order"
                      v-model="formData.minimumOrderAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="No minimum"
                      :disabled="isProcessing"
                      class="pl-8"
                    />
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label for="start-date">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          class="w-full justify-start text-left font-normal"
                          :disabled="isProcessing"
                        >
                          <CalendarIcon class="mr-2 h-4 w-4" />
                          {{ formData.startDate ? formatDate(formData.startDate) : "Select date" }}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-0">
                        <Calendar
                          v-model="formData.startDate"
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div class="space-y-2">
                    <Label for="end-date">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          class="w-full justify-start text-left font-normal"
                          :disabled="isProcessing"
                        >
                          <CalendarIcon class="mr-2 h-4 w-4" />
                          {{ formData.endDate ? formatDate(formData.endDate) : "No end date" }}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-0">
                        <Calendar
                          v-model="formData.endDate"
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              <!-- Status Toggle -->
              <div class="flex items-center space-x-2">
                <Switch
                  id="pricing-active"
                  v-model="formData.isActive"
                  :disabled="isProcessing"
                />
                <Label for="pricing-active">Pricing rule is active</Label>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="products" class="space-y-6 pt-4">
            <!-- Product-specific Pricing -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium">Product-Specific Pricing</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  @click="addProductPricing"
                  :disabled="isProcessing"
                >
                  <PlusIcon class="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
              
              <p class="text-sm text-muted-foreground">
                Set custom pricing for specific products for this customer group.
                These will override the general group discount.
              </p>
              
              <div v-if="formData.productPricing.length === 0" class="rounded-md border border-dashed p-8 text-center">
                <PackageIcon class="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 class="mt-2 text-sm font-medium">No product pricing</h3>
                <p class="text-sm text-muted-foreground mt-1">
                  Add product-specific pricing overrides for this customer group.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  @click="addProductPricing"
                  class="mt-4"
                  :disabled="isProcessing"
                >
                  <PlusIcon class="h-4 w-4 mr-2" />
                  Add Product Pricing
                </Button>
              </div>
              
              <div v-else class="space-y-4">
                <div 
                  v-for="(product, index) in formData.productPricing" 
                  :key="index"
                  class="rounded-md border p-4"
                >
                  <div class="flex items-start justify-between">
                    <div class="space-y-1 flex-1">
                      <div class="flex items-center">
                        <h4 class="text-sm font-medium">{{ getProductName(product.productId) }}</h4>
                        <Badge variant="outline" class="ml-2">{{ getProductSku(product.productId) }}</Badge>
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4 mt-4">
                        <div class="space-y-2">
                          <Label :for="`product-price-${index}`">Custom Price</Label>
                          <div class="relative">
                            <span class="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input
                              :id="`product-price-${index}`"
                              v-model="product.price"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Custom price"
                              :disabled="isProcessing"
                              class="pl-8"
                            />
                          </div>
                        </div>
                        
                        <div class="space-y-2">
                          <Label :for="`product-compare-at-${index}`">Compare At Price</Label>
                          <div class="relative">
                            <span class="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input
                              :id="`product-compare-at-${index}`"
                              v-model="product.compareAtPrice"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Compare at price"
                              :disabled="isProcessing"
                              class="pl-8"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div class="mt-4">
                        <div class="flex items-center space-x-2">
                          <Switch
                            :id="`product-active-${index}`"
                            v-model="product.isActive"
                            :disabled="isProcessing"
                          />
                          <Label :for="`product-active-${index}`">Product pricing is active</Label>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      @click="removeProductPricing(index)"
                      :disabled="isProcessing"
                    >
                      <XIcon class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <SheetFooter>
        <div class="w-full flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            @click="$emit('update:isOpen', false)"
            :disabled="isProcessing"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            @click="saveGroupPricing"
            :disabled="isProcessing"
          >
            <Loader2Icon
              v-if="isProcessing"
              class="mr-2 h-4 w-4 animate-spin"
            />
            {{ isEditMode ? 'Update Pricing' : 'Save Pricing' }}
          </Button>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>
  
  <!-- Product Selection Dialog -->
  <Dialog :open="isProductDialogOpen" @update:open="isProductDialogOpen = $event">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add Product Pricing</DialogTitle>
        <DialogDescription>
          Select products to add custom pricing for this customer group.
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-4 space-y-4">
        <div class="space-y-2">
          <div class="relative">
            <Input
              placeholder="Search products by name or SKU..."
              v-model="productSearchQuery"
              class="pr-10"
            />
            <Button 
              v-if="productSearchQuery" 
              variant="ghost" 
              size="icon"
              class="absolute right-0 top-0 h-full"
              @click="productSearchQuery = ''"
            >
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
          
          <div v-if="isSearchingProducts" class="flex justify-center py-4">
            <Loader2Icon class="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
          
          <ScrollArea v-else-if="filteredProducts.length > 0" class="h-[250px] rounded-md border p-2">
            <div class="space-y-1">
              <div 
                v-for="product in filteredProducts" 
                :key="product.id"
                class="flex items-center space-x-2 rounded-md p-2 hover:bg-accent"
              >
                <Checkbox 
                  :id="`product-select-${product.id}`"
                  :checked="selectedProducts.includes(product.id)"
                  @update:checked="toggleProductSelection(product.id)"
                  :disabled="isProductAlreadyAdded(product.id)"
                />
                <div>
                  <Label 
                    :for="`product-select-${product.id}`"
                    class="text-sm font-medium leading-none cursor-pointer"
                  >
                    {{ product.name }}
                  </Label>
                  <p class="text-xs text-muted-foreground">SKU: {{ product.sku }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatCurrency(product.price) }}
                  </p>
                </div>
                <Badge 
                  v-if="isProductAlreadyAdded(product.id)"
                  variant="outline"
                  class="ml-auto"
                >
                  Added
                </Badge>
              </div>
            </div>
          </ScrollArea>
          
          <div v-else-if="productSearchQuery" class="py-4 text-center text-sm text-muted-foreground">
            No products found matching "{{ productSearchQuery }}"
          </div>
          
          <div v-else class="py-4 text-center text-sm text-muted-foreground">
            Search for products to add custom pricing
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button
          variant="outline"
          @click="isProductDialogOpen = false"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          @click="addSelectedProducts"
          :disabled="selectedProducts.length === 0"
        >
          Add {{ selectedProducts.length }} Products
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { format } from 'date-fns'
import { 
  CalendarIcon,
  Loader2Icon,
  PackageIcon,
  PlusIcon,
  XIcon
} from 'lucide-vue-next'
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'
import { 
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  group: {
    type: Object,
    default: null
  },
  groupPricing: {
    type: Object,
    default: null
  },
  products: {
    type: Array,
    default: () => []
  },
  pricingTiers: {
    type: Array,
    default: () => []
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:isOpen',
  'save',
  'search-products'
])

// Form tabs
const selectedTab = ref('basic')

// Empty form structure
const emptyForm = {
  groupId: '',
  discountType: 'none',
  discountValue: '',
  pricingTier: '',
  minimumOrderAmount: '',
  startDate: null,
  endDate: null,
  isActive: true,
  productPricing: []
}

// Form data
const formData = reactive({...emptyForm})

// Form validation errors
const errors = ref({})

// Product selection
const isProductDialogOpen = ref(false)
const productSearchQuery = ref('')
const selectedProducts = ref([])
const isSearchingProducts = ref(false)

// Computed properties
const isEditMode = computed(() => !!props.groupPricing)

const filteredProducts = computed(() => {
  if (!productSearchQuery.value) {
    return props.products.slice(0, 20)
  }
  
  const query = productSearchQuery.value.toLowerCase()
  return props.products.filter(product => {
    return (
      product.name.toLowerCase().includes(query) ||
      (product.sku && product.sku.toLowerCase().includes(query))
    )
  }).slice(0, 100) // Limit results
})

// Methods
function formatDate(date) {
  if (!date) return ''
  return format(new Date(date), 'PPP')
}

function formatCurrency(value) {
  if (!value) return '$0.00'
  return `$${parseFloat(value).toFixed(2)}`
}

function getProductName(productId) {
  const product = props.products.find(p => p.id === productId)
  return product ? product.name : 'Unknown Product'
}

function getProductSku(productId) {
  const product = props.products.find(p => p.id === productId)
  return product ? product.sku : 'N/A'
}

function isProductAlreadyAdded(productId) {
  return formData.productPricing.some(p => p.productId === productId)
}

function toggleProductSelection(productId) {
  const index = selectedProducts.value.indexOf(productId)
  if (index === -1) {
    selectedProducts.value.push(productId)
  } else {
    selectedProducts.value.splice(index, 1)
  }
}

function addProductPricing() {
  selectedProducts.value = []
  isProductDialogOpen.value = true
}

function addSelectedProducts() {
  // Get product details and add to form
  selectedProducts.value.forEach(productId => {
    if (!isProductAlreadyAdded(productId)) {
      const product = props.products.find(p => p.id === productId)
      
      formData.productPricing.push({
        productId,
        price: product?.price || '',
        compareAtPrice: product?.compareAtPrice || '',
        isActive: true
      })
    }
  })
  
  // Close dialog and clear selection
  isProductDialogOpen.value = false
  selectedProducts.value = []
}

function removeProductPricing(index) {
  formData.productPricing.splice(index, 1)
}

function resetForm() {
  Object.assign(formData, {...emptyForm})
  errors.value = {}
  selectedTab.value = 'basic'
  
  // Set group ID if available
  if (props.group) {
    formData.groupId = props.group.id
  }
}

function validateForm() {
  const newErrors = {}
  
  // Required fields validation
  if (!formData.groupId) {
    newErrors.groupId = 'Group is required'
  }
  
  if ((formData.discountType === 'percentage' || formData.discountType === 'fixed_amount') && !formData.discountValue) {
    newErrors.discountValue = 'Discount value is required when a discount type is selected'
  }
  
  if (formData.discountType === 'percentage' && (formData.discountValue < 0 || formData.discountValue > 100)) {
    newErrors.discountValue = 'Percentage must be between 0 and 100'
  }
  
  // Date validation
  if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
    newErrors.dates = 'End date must be after start date'
  }
  
  // Validate product pricing
  formData.productPricing.forEach((product, index) => {
    if (!product.price && product.isActive) {
      newErrors[`product.${index}.price`] = 'Price is required for active product pricing'
    }
  })
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

function prepareFormData() {
  const result = { ...formData }
  
  // Convert string values to numbers where needed
  if (result.discountValue) {
    result.discountValue = parseFloat(result.discountValue)
  }
  
  if (result.minimumOrderAmount) {
    result.minimumOrderAmount = parseFloat(result.minimumOrderAmount)
  } else {
    result.minimumOrderAmount = 0
  }
  
  // Process product pricing
  result.productPricing = result.productPricing.map(product => ({
    ...product,
    price: product.price ? parseFloat(product.price) : null,
    compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null
  }))
  
  return result
}

function saveGroupPricing() {
  if (!validateForm()) {
    // Switch to the tab with errors
    if (errors.value.discountValue || errors.value.dates) {
      selectedTab.value = 'basic'
    } else {
      // If there are product pricing errors
      for (const key in errors.value) {
        if (key.startsWith('product.')) {
          selectedTab.value = 'products'
          break
        }
      }
    }
    return
  }
  
  const finalData = prepareFormData()
  
  // Add ID if in edit mode
  if (isEditMode.value && props.groupPricing.id) {
    finalData.id = props.groupPricing.id
  }
  
  emit('save', finalData)
}

// Watch for search queries to trigger search
watch(productSearchQuery, (query) => {
  if (query.length > 2) {
    isSearchingProducts.value = true
    emit('search-products', query)
    // Simulate search completion
    setTimeout(() => {
      isSearchingProducts.value = false
    }, 500)
  }
})

// Watch for prop changes to populate form
watch(() => props.groupPricing, (pricing) => {
  if (pricing) {
    // Reset form and populate with pricing data
    resetForm()
    
    // Basic details
    formData.groupId = pricing.groupId || (props.group ? props.group.id : '')
    formData.discountType = pricing.discountType || 'none'
    formData.discountValue = pricing.discountValue || ''
    formData.pricingTier = pricing.pricingTier || ''
    formData.minimumOrderAmount = pricing.minimumOrderAmount || ''
    formData.startDate = pricing.startDate ? new Date(pricing.startDate) : null
    formData.endDate = pricing.endDate ? new Date(pricing.endDate) : null
    formData.isActive = pricing.isActive !== undefined ? pricing.isActive : true
    
    // Product pricing
    if (pricing.productPricing && pricing.productPricing.length > 0) {
      formData.productPricing = pricing.productPricing.map(p => ({
        productId: p.productId,
        price: p.price || '',
        compareAtPrice: p.compareAtPrice || '',
        isActive: p.isActive !== undefined ? p.isActive : true
      }))
    } else {
      formData.productPricing = []
    }
  } else {
    // Reset form when not in edit mode
    resetForm()
    
    // Set group ID if available
    if (props.group) {
      formData.groupId = props.group.id
    }
  }
}, { immediate: true, deep: true })

// Reset form when dialog is opened
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && !props.groupPricing) {
    resetForm()
    
    // Set group ID if available
    if (props.group) {
      formData.groupId = props.group.id
    }
  }
})
</script>