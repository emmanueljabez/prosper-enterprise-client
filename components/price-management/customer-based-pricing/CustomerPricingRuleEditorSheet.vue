<template>
  <Sheet :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <SheetContent class="sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto" :class="{ 'sm:max-w-xl md:max-w-2xl lg:max-w-3xl': selectedTab === 'products' }">
      <SheetHeader>
        <SheetTitle>{{ isEditMode ? 'Edit Pricing Rule' : 'Create Pricing Rule' }}</SheetTitle>
        <SheetDescription>
          {{ isEditMode ? 'Update the pricing rule details below.' : 'Set up a new customer pricing rule.' }}
        </SheetDescription>
      </SheetHeader>
      
      <div class="py-6">
        <Tabs v-model="selectedTab" class="w-full">
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="details">Rule Details</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" class="space-y-6 pt-4">
            <!-- Rule Details -->
            <div class="space-y-4">
              <div class="space-y-2">
                <Label for="rule-name">Rule Name <span class="text-destructive">*</span></Label>
                <Input 
                  id="rule-name"
                  v-model="formData.name"
                  placeholder="E.g., VIP Customer Discount"
                  :disabled="isProcessing"
                />
                <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
              </div>
              
              <div class="space-y-2">
                <Label for="rule-description">Description</Label>
                <Textarea
                  id="rule-description"
                  v-model="formData.description"
                  placeholder="Describe the purpose of this pricing rule"
                  rows="3"
                  :disabled="isProcessing"
                />
              </div>
              
              <div class="space-y-2">
                <Label for="rule-type">Rule Type <span class="text-destructive">*</span></Label>
                <Select 
                  v-model="formData.type"
                  :disabled="isProcessing"
                >
                  <SelectTrigger id="rule-type">
                    <SelectValue placeholder="Select a rule type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Discount</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount Discount</SelectItem>
                    <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="errors.type" class="text-sm text-destructive">{{ errors.type }}</p>
              </div>
              
              <div v-if="formData.type === 'percentage'" class="space-y-2">
                <Label for="discount-percentage">Discount Percentage <span class="text-destructive">*</span></Label>
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
              
              <div v-if="formData.type === 'fixed_amount'" class="space-y-2">
                <Label for="discount-amount">Discount Amount <span class="text-destructive">*</span></Label>
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
              
              <div v-if="formData.type === 'buy_x_get_y'" class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="buy-quantity">Buy Quantity <span class="text-destructive">*</span></Label>
                  <Input
                    id="buy-quantity"
                    v-model="formData.conditions.buyQuantity"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="E.g., 2"
                    :disabled="isProcessing"
                  />
                  <p v-if="errors['conditions.buyQuantity']" class="text-sm text-destructive">{{ errors['conditions.buyQuantity'] }}</p>
                </div>
                <div class="space-y-2">
                  <Label for="get-quantity">Get Quantity <span class="text-destructive">*</span></Label>
                  <Input
                    id="get-quantity"
                    v-model="formData.conditions.getQuantity"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="E.g., 1"
                    :disabled="isProcessing"
                  />
                  <p v-if="errors['conditions.getQuantity']" class="text-sm text-destructive">{{ errors['conditions.getQuantity'] }}</p>
                </div>
              </div>
              
              <Separator />
              
              <div class="space-y-4">
                <h3 class="text-sm font-medium">Additional Conditions</h3>
                
                <div class="space-y-2">
                  <Label for="minimum-order">Minimum Order Amount</Label>
                  <div class="relative">
                    <span class="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      id="minimum-order"
                      v-model="formData.conditions.minimumOrderAmount"
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
              
              <div class="flex items-center space-x-2">
                <Switch
                  id="rule-active"
                  v-model="formData.isActive"
                  :disabled="isProcessing"
                />
                <Label for="rule-active">Rule is active</Label>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="customers" class="space-y-6 pt-4">
            <!-- Customer Selection -->
            <div class="space-y-4">
              <div class="space-y-2">
                <Label for="customer-type">Apply to</Label>
                <RadioGroup v-model="formData.customerApplyType" class="flex flex-col space-y-1">
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="customer-type-all" />
                    <Label for="customer-type-all">All Customers</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem value="groups" id="customer-type-groups" />
                    <Label for="customer-type-groups">Specific Customer Groups</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem value="specific" id="customer-type-specific" />
                    <Label for="customer-type-specific">Specific Customers</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div v-if="formData.customerApplyType === 'groups'" class="space-y-2">
                <Label for="customer-groups">Select Customer Groups</Label>
                <Multiselect
                  v-model="selectedCustomerGroupObjects"
                  :options="customerGroups"
                  :multiple="true"
                  :close-on-select="false"
                  :clear-on-select="false"
                  :preserve-search="true"
                  placeholder="Select customer groups"
                  label="name"
                  track-by="id"
                  :disabled="isProcessing"
                  :searchable="true"
                  class="multiselect-custom"
                >
                  <template #selection="{ values, search, isOpen }">
                    <span v-if="values.length && !isOpen" class="multiselect__single">
                      {{ values.length }} group{{ values.length > 1 ? 's' : '' }} selected
                    </span>
                  </template>
                </Multiselect>
                <p v-if="errors.customerGroupIds" class="text-sm text-destructive">{{ errors.customerGroupIds }}</p>
              </div>
              
              <div v-if="formData.customerApplyType === 'specific'" class="space-y-2">
                <Label for="specific-customers">Select Customers</Label>
                <div class="space-y-2">
                  <div class="relative">
                    <Input
                      placeholder="Search customers by name, email or company..."
                      v-model="customerSearchQuery"
                      class="pr-10"
                    />
                    <Button 
                      v-if="customerSearchQuery" 
                      variant="ghost" 
                      size="icon"
                      class="absolute right-0 top-0 h-full"
                      @click="customerSearchQuery = ''"
                    >
                      <XIcon class="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div v-if="isSearchingCustomers" class="flex justify-center py-4">
                    <Loader2Icon class="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                  
                  <ScrollArea v-else-if="filteredCustomers.length > 0" class="h-[250px] rounded-md border p-2">
                    <div class="space-y-1">
                      <div 
                        v-for="customer in filteredCustomers" 
                        :key="customer.id"
                        class="flex items-center space-x-2 rounded-md p-2 hover:bg-accent"
                      >
                        <Checkbox 
                          :id="`customer-${customer.id}`"
                          :checked="selectedCustomers.includes(customer.id)"
                          @update:checked="toggleCustomer(customer.id)"
                        />
                        <div>
                          <Label 
                            :for="`customer-${customer.id}`"
                            class="text-sm font-medium leading-none cursor-pointer"
                          >
                            {{ customer.firstName }} {{ customer.lastName }}
                          </Label>
                          <p class="text-xs text-muted-foreground">{{ customer.email }}</p>
                          <p v-if="customer.company" class="text-xs text-muted-foreground">{{ customer.company }}</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  
                  <div v-else-if="customerSearchQuery" class="py-4 text-center text-sm text-muted-foreground">
                    No customers found matching "{{ customerSearchQuery }}"
                  </div>
                  
                  <div v-else class="py-4 text-center text-sm text-muted-foreground">
                    Search for customers to add them to this rule
                  </div>
                  
                  <div v-if="selectedCustomers.length > 0" class="pt-2">
                    <p class="text-sm text-muted-foreground">{{ selectedCustomers.length }} customers selected</p>
                  </div>
                </div>
                <p v-if="errors.customerIds" class="text-sm text-destructive">{{ errors.customerIds }}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="products" class="space-y-6 pt-4">
            <!-- Product Selection -->
            <div class="space-y-4">
              <div class="space-y-2">
                <Label for="product-type">Apply to</Label>
                <RadioGroup v-model="formData.productApplyType" class="flex flex-col space-y-1">
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="product-type-all" />
                    <Label for="product-type-all">All Products</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem value="categories" id="product-type-categories" />
                    <Label for="product-type-categories">Specific Categories</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem value="specific" id="product-type-specific" />
                    <Label for="product-type-specific">Specific Products</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div v-if="formData.productApplyType === 'categories'" class="space-y-2">
                <Label for="product-categories">Select Product Categories</Label>
                <Multiselect
                  v-model="selectedProductCategoryObjects"
                  :options="productCategories"
                  :multiple="true"
                  :close-on-select="false"
                  :clear-on-select="false"
                  :preserve-search="true"
                  placeholder="Select product categories"
                  label="name"
                  track-by="id"
                  :disabled="isProcessing"
                  :searchable="true"
                  class="multiselect-custom"
                >
                  <template #selection="{ values, search, isOpen }">
                    <span v-if="values.length && !isOpen" class="multiselect__single">
                      {{ values.length }} categor{{ values.length > 1 ? 'ies' : 'y' }} selected
                    </span>
                  </template>
                </Multiselect>
                <p v-if="errors.categoryIds" class="text-sm text-destructive">{{ errors.categoryIds }}</p>
              </div>
              
              <div v-if="formData.productApplyType === 'specific'" class="space-y-2">
                <Label for="specific-products">Select Products</Label>
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
                          :id="`product-${product.id}`"
                          :checked="selectedProducts.includes(product.id)"
                          @update:checked="toggleProduct(product.id)"
                        />
                        <div>
                          <Label 
                            :for="`product-${product.id}`"
                            class="text-sm font-medium leading-none cursor-pointer"
                          >
                            {{ product.name }}
                          </Label>
                          <p class="text-xs text-muted-foreground">SKU: {{ product.sku }}</p>
                          <p class="text-xs text-muted-foreground">
                            {{ formatCurrency(product.price) }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  
                  <div v-else-if="productSearchQuery" class="py-4 text-center text-sm text-muted-foreground">
                    No products found matching "{{ productSearchQuery }}"
                  </div>
                  
                  <div v-else class="py-4 text-center text-sm text-muted-foreground">
                    Search for products to add them to this rule
                  </div>
                  
                  <div v-if="selectedProducts.length > 0" class="pt-2">
                    <p class="text-sm text-muted-foreground">{{ selectedProducts.length }} products selected</p>
                  </div>
                </div>
                <p v-if="errors.productIds" class="text-sm text-destructive">{{ errors.productIds }}</p>
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
            @click="saveRule"
            :disabled="isProcessing"
          >
            <Loader2Icon
              v-if="isProcessing"
              class="mr-2 h-4 w-4 animate-spin"
            />
            {{ isEditMode ? 'Update Rule' : 'Create Rule' }}
          </Button>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive } from 'vue'
import { format } from 'date-fns'
import { 
  CalendarIcon,
  Loader2Icon,
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  editingRule: {
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
  productCategories: {
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
const selectedTab = ref('details')

// Empty form structure
const emptyForm = {
  name: '',
  description: '',
  type: 'percentage',
  discountValue: '',
  startDate: null,
  endDate: null,
  isActive: true,
  customerApplyType: 'all',
  customerGroupIds: [],
  customerIds: [],
  productApplyType: 'all',
  categoryIds: [],
  productIds: [],
  conditions: {
    minimumOrderAmount: '',
    buyQuantity: 1,
    getQuantity: 1
  }
}

// Form data
const formData = reactive({...emptyForm})

// Form validation errors
const errors = ref({})

// Customer and product selection
const selectedCustomerGroups = ref([])
const selectedCustomers = ref([])
const selectedProductCategories = ref([])
const selectedProducts = ref([])

// Search
const customerSearchQuery = ref('')
const productSearchQuery = ref('')
const isSearchingCustomers = ref(false)
const isSearchingProducts = ref(false)

// Computed properties
const isEditMode = computed(() => !!props.editingRule)

const filteredCustomers = computed(() => {
  if (!customerSearchQuery.value) return props.customers.slice(0, 10)
  
  const query = customerSearchQuery.value.toLowerCase()
  return props.customers.filter(customer => {
    return (
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(query) ||
      (customer.email && customer.email.toLowerCase().includes(query)) ||
      (customer.company && customer.company.toLowerCase().includes(query))
    )
  }).slice(0, 100) // Limit results
})

const filteredProducts = computed(() => {
  if (!productSearchQuery.value) return props.products.slice(0, 10)
  
  const query = productSearchQuery.value.toLowerCase()
  return props.products.filter(product => {
    return (
      product.name.toLowerCase().includes(query) ||
      (product.sku && product.sku.toLowerCase().includes(query))
    )
  }).slice(0, 100) // Limit results
})

const selectedCustomerGroupObjects = computed({
  get() {
    return props.customerGroups.filter(group => 
      selectedCustomerGroups.value.includes(group.id)
    );
  },
  set(newValue) {
    selectedCustomerGroups.value = newValue.map(item => item.id);
  }
});

const selectedProductCategoryObjects = computed({
  get() {
    return props.productCategories.filter(category => 
      selectedProductCategories.value.includes(category.id)
    );
  },
  set(newValue) {
    selectedProductCategories.value = newValue.map(item => item.id);
  }
});

// Methods
function formatDate(date) {
  return format(new Date(date), 'PPP')
}

function formatCurrency(value) {
  if (!value) return '$0.00'
  return `$${parseFloat(value).toFixed(2)}`
}

function toggleCustomer(customerId) {
  const index = selectedCustomers.value.indexOf(customerId)
  if (index === -1) {
    selectedCustomers.value.push(customerId)
  } else {
    selectedCustomers.value.splice(index, 1)
  }
}

function toggleProduct(productId) {
  const index = selectedProducts.value.indexOf(productId)
  if (index === -1) {
    selectedProducts.value.push(productId)
  } else {
    selectedProducts.value.splice(index, 1)
  }
}

function saveRule() {
  // Basic validation
  errors.value = {}
  
  if (!formData.name) {
    errors.value.name = 'Rule name is required'
  }
  
  if (!formData.type) {
    errors.value.type = 'Rule type is required'
  }
  
  if (formData.type === 'percentage' && (formData.discountValue <= 0 || formData.discountValue > 100)) {
    errors.value.discountValue = 'Discount percentage must be between 0 and 100'
  }
  
  if (formData.type === 'fixed_amount' && formData.discountValue <= 0) {
    errors.value.discountValue = 'Discount amount must be greater than 0'
  }
  
  if (formData.customerApplyType === 'groups' && selectedCustomerGroups.value.length === 0) {
    errors.value.customerGroupIds = 'At least one customer group must be selected'
  }
  
  if (formData.customerApplyType === 'specific' && selectedCustomers.value.length === 0) {
    errors.value.customerIds = 'At least one customer must be selected'
  }
  
  if (formData.productApplyType === 'categories' && selectedProductCategories.value.length === 0) {
    errors.value.categoryIds = 'At least one product category must be selected'
  }
  
  if (formData.productApplyType === 'specific' && selectedProducts.value.length === 0) {
    errors.value.productIds = 'At least one product must be selected'
  }
  
  // If there are errors, stop the save process
  if (Object.keys(errors.value).length > 0) {
    return
  }
  
  // Prepare data for saving
  const ruleData = {
    ...formData,
    customerGroupIds: selectedCustomerGroups.value,
    customerIds: selectedCustomers.value,
    categoryIds: selectedProductCategories.value,
    productIds: selectedProducts.value,
    startDate: formData.startDate ? new Date(formData.startDate) : null,
    endDate: formData.endDate ? new Date(formData.endDate) : null,
    discountValue: parseFloat(formData.discountValue),
    conditions: {
      ...formData.conditions,
      minimumOrderAmount: parseFloat(formData.conditions.minimumOrderAmount) || 0
    }
  }
  
  // If editing, include the rule ID
  if (isEditMode.value) {
    ruleData.id = props.editingRule.id
  }
  
  // Emit the save event with the rule data
  emit('save', ruleData)
}

// Load editing rule data
watch(props.editingRule, (newRule) => {
  if (newRule) {
    formData.name = newRule.name
    formData.description = newRule.description
    formData.type = newRule.type
    formData.discountValue = newRule.discountValue
    formData.startDate = newRule.startDate ? new Date(newRule.startDate) : null
    formData.endDate = newRule.endDate ? new Date(newRule.endDate) : null
    formData.isActive = newRule.isActive
    formData.customerApplyType = newRule.customerApplyType
    formData.productApplyType = newRule.productApplyType
    formData.conditions = {
      minimumOrderAmount: newRule.conditions.minimumOrderAmount || '',
      buyQuantity: newRule.conditions.buyQuantity || 1,
      getQuantity: newRule.conditions.getQuantity || 1
    }
    
    selectedCustomerGroups.value = newRule.customerGroupIds || []
    selectedCustomers.value = newRule.customerIds || []
    selectedProductCategories.value = newRule.categoryIds || []
    selectedProducts.value = newRule.productIds || []
  } else {
    // Reset form if no rule is being edited
    Object.assign(formData, {...emptyForm})
    selectedCustomerGroups.value = []
    selectedCustomers.value = []
    selectedProductCategories.value = []
    selectedProducts.value = []
  }
})

onMounted(() => {
  // Initialize form with editing rule data if available
  if (props.editingRule) {
    Object.assign(formData, {...props.editingRule})
  }
})
</script>

<style>
.multiselect-custom {
  --ms-border-color: hsl(var(--border));
  --ms-border-color-hover: hsl(var(--border));
  --ms-bg: hsl(var(--background));
  --ms-tag-bg: hsl(var(--primary) / 0.1);
  --ms-tag-color: hsl(var(--primary));
  --ms-option-bg-selected: hsl(var(--primary) / 0.1);
}

.multiselect {
  min-height: 40px;
  border-radius: var(--radius);
  border: 1px solid var(--ms-border-color);
}

.multiselect:hover {
  border-color: var(--ms-border-color-hover);
}

.multiselect__tags {
  min-height: 40px;
  padding: 6px 8px;
  background-color: var(--ms-bg);
  border-radius: var(--radius);
}

.multiselect__single {
  font-size: 14px;
}

.multiselect__tag {
  background-color: var(--ms-tag-bg);
  color: var(--ms-tag-color);
  margin-bottom: 2px;
}

.multiselect__option--selected {
  background-color: var(--ms-option-bg-selected);
  color: currentColor;
  font-weight: normal;
}

.multiselect__option--selected.multiselect__option--highlight {
  background-color: var(--ms-option-bg-selected);
  color: currentColor;
}

.multiselect__option--highlight {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

.multiselect__spinner {
  background-color: var(--ms-bg);
}

.multiselect--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>