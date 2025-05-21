<template>
  <Sheet :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <SheetContent class="sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{{ isEditMode ? 'Edit Customer Pricing' : 'Create Customer Pricing' }}</SheetTitle>
        <SheetDescription>
          {{ isEditMode ? 'Update pricing for this specific customer.' : 'Set up custom pricing for a specific customer.' }}
        </SheetDescription>
      </SheetHeader>
      
      <div class="py-6">
        <Tabs v-model="selectedTab" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" class="space-y-6 pt-4">
            <!-- Basic Customer Pricing Settings -->
            <div class="space-y-4">
              <!-- Customer Selection (if creating new) -->
              <div v-if="!isEditMode" class="space-y-2">
                <Label for="customer-selection">Customer <span class="text-destructive">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      class="w-full justify-between"
                      :disabled="isProcessing"
                    >
                      <span v-if="selectedCustomer">
                        {{ selectedCustomer.firstName }} {{ selectedCustomer.lastName }}
                      </span>
                      <span v-else>Select customer</span>
                      <ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-full p-0">
                    <div class="p-2">
                      <div class="relative">
                        <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search customers..."
                          v-model="customerSearchQuery"
                          class="pl-8"
                        />
                      </div>
                    </div>
                    <div v-if="isSearchingCustomers" class="flex justify-center py-6">
                      <Loader2Icon class="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                    <CommandEmpty v-else-if="filteredCustomers.length === 0 && customerSearchQuery">
                      No customers found
                    </CommandEmpty>
                    <CommandGroup v-else>
                      <ScrollArea class="h-[200px]">
                        <CommandItem
                          v-for="customer in filteredCustomers"
                          :key="customer.id"
                          @click="selectCustomer(customer)"
                        >
                          <div class="flex flex-col">
                            <span>{{ customer.firstName }} {{ customer.lastName }}</span>
                            <span class="text-xs text-muted-foreground">{{ customer.email }}</span>
                            <span v-if="customer.company" class="text-xs text-muted-foreground">{{ customer.company }}</span>
                          </div>
                          <CheckIcon
                            v-if="selectedCustomer && selectedCustomer.id === customer.id"
                            class="ml-auto h-4 w-4"
                          />
                        </CommandItem>
                      </ScrollArea>
                    </CommandGroup>
                  </PopoverContent>
                </Popover>
                <p v-if="errors.customerId" class="text-sm text-destructive">{{ errors.customerId }}</p>
              </div>
              
              <!-- Customer Info (read-only if editing) -->
              <div v-else class="rounded-md bg-muted p-4">
                <div class="space-y-1">
                  <h3 class="text-sm font-medium">Customer</h3>
                  <div class="font-medium">{{ selectedCustomer?.firstName }} {{ selectedCustomer?.lastName }}</div>
                  <p class="text-sm text-muted-foreground">{{ selectedCustomer?.email }}</p>
                  <p v-if="selectedCustomer?.company" class="text-sm text-muted-foreground">{{ selectedCustomer?.company }}</p>
                  <div class="mt-2" v-if="customerGroup">
                    <Badge variant="secondary">{{ customerGroup.name }}</Badge>
                  </div>
                </div>
              </div>
              
              <!-- Date Range Settings -->
              <div class="space-y-2">
                <h3 class="text-sm font-medium">Pricing Schedule</h3>
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
                <p v-if="errors.dates" class="text-sm text-destructive">{{ errors.dates }}</p>
              </div>
              
              <Separator />
              
              <!-- Status Toggle -->
              <div class="flex items-center space-x-2">
                <Switch
                  id="pricing-active"
                  v-model="formData.isActive"
                  :disabled="isProcessing"
                />
                <Label for="pricing-active">Pricing is active</Label>
              </div>
              
              <Alert v-if="!formData.isActive">
                <AlertCircleIcon class="h-4 w-4" />
                <AlertTitle>Inactive Pricing</AlertTitle>
                <AlertDescription>
                  When inactive, regular pricing rules will apply to this customer.
                </AlertDescription>
              </Alert>
              
              <Alert v-else-if="formData.startDate && new Date(formData.startDate) > new Date()">
                <CalendarIcon class="h-4 w-4" />
                <AlertTitle>Scheduled Pricing</AlertTitle>
                <AlertDescription>
                  This pricing will automatically activate on {{ formatDate(formData.startDate) }}.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="products" class="space-y-6 pt-4">
            <!-- Product Pricing -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium">Product Pricing</h3>
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
                Set custom pricing for products for this specific customer.
              </p>
              
              <div v-if="formData.products.length === 0" class="rounded-md border border-dashed p-8 text-center">
                <PackageIcon class="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 class="mt-2 text-sm font-medium">No products added</h3>
                <p class="text-sm text-muted-foreground mt-1">
                  Add products to set custom pricing for this customer.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  @click="addProductPricing"
                  class="mt-4"
                  :disabled="isProcessing"
                >
                  <PlusIcon class="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
              
              <div v-else class="space-y-4">
                <div 
                  v-for="(product, index) in formData.products" 
                  :key="index"
                  class="rounded-md border p-4"
                >
                  <div class="flex items-start justify-between">
                    <div class="space-y-1 flex-1">
                      <div class="flex items-center">
                        <h4 class="text-sm font-medium">{{ getProductName(product.productId) }}</h4>
                        <Badge variant="outline" class="ml-2">{{ getProductSku(product.productId) }}</Badge>
                      </div>
                      
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div class="space-y-2">
                          <Label :for="`regular-price-${index}`">Standard Price</Label>
                          <div class="relative">
                            <span class="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input
                              :id="`regular-price-${index}`"
                              :value="getProductRegularPrice(product.productId)"
                              disabled
                              class="pl-8 bg-muted"
                            />
                          </div>
                        </div>
                        
                        <div class="space-y-2">
                          <Label :for="`customer-price-${index}`">Custom Price <span class="text-destructive">*</span></Label>
                          <div class="relative">
                            <span class="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input
                              :id="`customer-price-${index}`"
                              v-model="product.price"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Customer price"
                              :disabled="isProcessing"
                              class="pl-8"
                            />
                          </div>
                          <p v-if="errors[`products.${index}.price`]" class="text-sm text-destructive">
                            {{ errors[`products.${index}.price`] }}
                          </p>
                        </div>
                        
                        <div class="space-y-2">
                          <Label :for="`compare-at-${index}`">Compare At Price</Label>
                          <div class="relative">
                            <span class="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input
                              :id="`compare-at-${index}`"
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
                      
                      <div v-if="product.price" class="mt-2">
                        <Badge :variant="getPriceBadgeVariant(product)">
                          {{ calculatePriceChange(product) }}
                        </Badge>
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
            @click="saveCustomerPricing"
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
        <DialogTitle>Add Products</DialogTitle>
        <DialogDescription>
          Select products to add custom pricing for this customer.
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
  AlertCircleIcon,
  CalendarIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  Loader2Icon,
  PackageIcon,
  PlusIcon,
  SearchIcon,
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
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  CommandEmpty,
  CommandGroup,
  CommandItem
} from '@/components/ui/command'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  editingPricing: {
    type: Object,
    default: null
  },
  customers: {
    type: Array,
    default: () => []
  },
  customerGroups: {
    type: Array,
    default: () => []
  },
  products: {
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
  'search-customers',
  'search-products'
])

// Form tabs
const selectedTab = ref('basic')

// Empty form structure
const emptyForm = {
  customerId: '',
  startDate: null,
  endDate: null,
  isActive: true,
  products: []
}

// Form data
const formData = reactive({...emptyForm})

// Form validation errors
const errors = ref({})

// Customer selection
const selectedCustomer = ref(null)
const customerSearchQuery = ref('')
const isSearchingCustomers = ref(false)

// Product selection
const isProductDialogOpen = ref(false)
const productSearchQuery = ref('')
const selectedProducts = ref([])
const isSearchingProducts = ref(false)

// Computed properties
const isEditMode = computed(() => !!props.editingPricing)

const filteredCustomers = computed(() => {
  if (!customerSearchQuery.value) {
    return props.customers.slice(0, 10)
  }
  
  const query = customerSearchQuery.value.toLowerCase()
  return props.customers.filter(customer => {
    return (
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(query) ||
      (customer.email && customer.email.toLowerCase().includes(query)) ||
      (customer.company && customer.company.toLowerCase().includes(query))
    )
  }).slice(0, 50) // Limit results
})

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

const customerGroup = computed(() => {
  if (!selectedCustomer.value || !selectedCustomer.value.groupId) return null
  return props.customerGroups.find(g => g.id === selectedCustomer.value.groupId) || null
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

function selectCustomer(customer) {
  selectedCustomer.value = customer
  formData.customerId = customer.id
}

function getProductName(productId) {
  const product = props.products.find(p => p.id === productId)
  return product ? product.name : 'Unknown Product'
}

function getProductSku(productId) {
  const product = props.products.find(p => p.id === productId)
  return product ? product.sku : 'N/A'
}

function getProductRegularPrice(productId) {
  const product = props.products.find(p => p.id === productId)
  return product?.price || '0.00'
}

function isProductAlreadyAdded(productId) {
  return formData.products.some(p => p.productId === productId)
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
      
      formData.products.push({
        productId,
        price: '',
        compareAtPrice: product?.compareAtPrice || ''
      })
    }
  })
  
  // Close dialog and clear selection
  isProductDialogOpen.value = false
  selectedProducts.value = []
}

function removeProductPricing(index) {
  formData.products.splice(index, 1)
}

function calculatePriceChange(product) {
  const regularPrice = parseFloat(getProductRegularPrice(product.productId))
  const customPrice = parseFloat(product.price)
  
  if (isNaN(regularPrice) || isNaN(customPrice) || regularPrice === 0) {
    return ''
  }
  
  const difference = regularPrice - customPrice
  const percentChange = (difference / regularPrice) * 100
  
  if (difference > 0) {
    return `${percentChange.toFixed(1)}% discount`
  } else if (difference < 0) {
    return `${Math.abs(percentChange).toFixed(1)}% markup`
  } else {
    return 'No change'
  }
}

function getPriceBadgeVariant(product) {
  const regularPrice = parseFloat(getProductRegularPrice(product.productId))
  const customPrice = parseFloat(product.price)
  
  if (isNaN(regularPrice) || isNaN(customPrice)) {
    return 'secondary'
  }
  
  if (customPrice < regularPrice) {
    return 'success'
  } else if (customPrice > regularPrice) {
    return 'destructive'
  } else {
    return 'secondary'
  }
}

function resetForm() {
  Object.assign(formData, {...emptyForm})
  selectedCustomer.value = null
  errors.value = {}
  selectedTab.value = 'basic'
  customerSearchQuery.value = ''
}

function validateForm() {
  const newErrors = {}
  
  // Required fields validation
  if (!formData.customerId) {
    newErrors.customerId = 'Customer is required'
  }
  
  // Date validation
  if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
    newErrors.dates = 'End date must be after start date'
  }
  
  // Validate product pricing
  formData.products.forEach((product, index) => {
    if (!product.price) {
      newErrors[`products.${index}.price`] = 'Price is required'
    }
  })
  
  // Make sure at least one product is added
  if (formData.products.length === 0) {
    newErrors.products = 'At least one product is required'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

function prepareFormData() {
  const result = { ...formData }
  
  // Process product pricing
  result.products = result.products.map(product => ({
    ...product,
    price: parseFloat(product.price),
    compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null
  }))
  
  return result
}

function saveCustomerPricing() {
  if (!validateForm()) {
    // Switch to the tab with errors
    if (errors.value.customerId || errors.value.dates) {
      selectedTab.value = 'basic'
    } else if (errors.value.products || Object.keys(errors.value).some(k => k.startsWith('products.'))) {
      selectedTab.value = 'products'
    }
    return
  }
  
  const finalData = prepareFormData()
  
  // Add ID if in edit mode
  if (isEditMode.value && props.editingPricing.id) {
    finalData.id = props.editingPricing.id
  }
  
  emit('save', finalData)
}

// Watch for search queries to trigger search
watch(customerSearchQuery, (query) => {
  if (query.length > 2) {
    isSearchingCustomers.value = true
    emit('search-customers', query)
    // Simulate search completion
    setTimeout(() => {
      isSearchingCustomers.value = false
    }, 500)
  }
})

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
watch(() => props.editingPricing, (pricing) => {
  if (pricing) {
    // Reset form and populate with pricing data
    resetForm()
    
    // Basic details
    formData.customerId = pricing.customerId || ''
    formData.startDate = pricing.startDate ? new Date(pricing.startDate) : null
    formData.endDate = pricing.endDate ? new Date(pricing.endDate) : null
    formData.isActive = pricing.isActive !== undefined ? pricing.isActive : true
    
    // Find customer
    const customer = props.customers.find(c => c.id === pricing.customerId)
    if (customer) {
      selectedCustomer.value = customer
    }
    
    // Product pricing
    if (pricing.products && pricing.products.length > 0) {
      formData.products = pricing.products.map(p => ({
        productId: p.productId,
        price: p.price || '',
        compareAtPrice: p.compareAtPrice || ''
      }))
    } else {
      formData.products = []
    }
  } else {
    // Reset form when not in edit mode
    resetForm()
  }
}, { immediate: true, deep: true })

// Reset form when dialog is opened
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && !props.editingPricing) {
    resetForm()
  }
})
</script>