<template>
  <SheetContent class="sm:max-w-xl w-full overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Create New Promotion</SheetTitle>
      <SheetDescription>
        Create special offers and discounts for your customers
      </SheetDescription>
    </SheetHeader>

    <div class="py-6">
      <!-- Step Indicator -->
      <div class="mb-8">
        <nav aria-label="Progress" class="mb-4">
          <ol role="list" class="space-y-3">
            <li v-for="(step, index) in steps" :key="index" class="relative">
              <div 
                class="group flex items-center"
                :class="{
                  'cursor-pointer hover:text-foreground': index < currentStep
                }"
                @click="index < currentStep ? goToStep(index) : null"
              >
                <span class="flex items-center justify-center">
                  <span
                    class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full"
                    :class="{
                      'bg-primary text-primary-foreground': index < currentStep,
                      'bg-primary text-primary-foreground ring-primary/20 ring-2': index === currentStep,
                      'bg-muted text-muted-foreground': index > currentStep
                    }"
                  >
                    <CheckIcon v-if="index < currentStep" class="h-5 w-5" />
                    <span v-else>{{ index + 1 }}</span>
                  </span>
                </span>
                <span class="ml-3 text-sm font-medium">
                  {{ step.label }}
                </span>
              </div>
              <div 
                v-if="index < steps.length - 1"
                class="absolute left-4 top-8 -ml-px mt-0.5 h-full w-0.5 bg-muted" 
                aria-hidden="true"
              ></div>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Step Content -->
      <div class="space-y-6">
        <!-- Step 1: Basic Details -->
        <div v-if="currentStep === 0" class="space-y-4">
          <div>
            <Label for="promotion-name">Promotion Name</Label>
            <Input
              id="promotion-name"
              v-model="promotion.name"
              placeholder="Summer Sale"
            />
            <p class="text-xs text-muted-foreground mt-1">
              A descriptive name for this promotion
            </p>
          </div>

          <div>
            <Label for="promotion-type">Promotion Type</Label>
            <Select v-model="promotion.type">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage Discount</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="bogo">Buy One Get One</SelectItem>
                <SelectItem value="shipping">Free Shipping</SelectItem>
                <SelectItem value="bundle">Bundle Discount</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">
              How the discount will be calculated
            </p>
          </div>

          <div v-if="promotion.type === 'percentage'">
            <Label for="percentage-value">Discount Percentage</Label>
            <div class="relative">
              <Input
                id="percentage-value"
                v-model.number="promotion.value"
                type="number"
                min="1"
                max="100"
                class="pr-8"
              />
              <span class="absolute right-3 top-2 text-muted-foreground">%</span>
            </div>
          </div>

          <div v-if="promotion.type === 'fixed'">
            <Label for="fixed-value">Discount Amount</Label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-muted-foreground">$</span>
              <Input
                id="fixed-value"
                v-model.number="promotion.value"
                type="number"
                min="0.01"
                step="0.01"
                class="pl-7"
              />
            </div>
          </div>

          <div v-if="promotion.type === 'bogo'" class="space-y-3">
            <div>
              <Label for="bogo-buy">Buy Quantity</Label>
              <Input
                id="bogo-buy"
                v-model.number="bogoDetails.buy"
                type="number"
                min="1"
              />
            </div>
            <div>
              <Label for="bogo-get">Get Quantity</Label>
              <Input
                id="bogo-get"
                v-model.number="bogoDetails.get"
                type="number"
                min="1"
              />
            </div>
            <div>
              <Label for="bogo-percent">Discount Percentage</Label>
              <div class="relative">
                <Input
                  id="bogo-percent"
                  v-model.number="bogoDetails.percent"
                  type="number"
                  min="1"
                  max="100"
                  class="pr-8"
                  placeholder="100 for free items"
                />
                <span class="absolute right-3 top-2 text-muted-foreground">%</span>
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                Enter 100 for free items, or a lower percentage for partial discounts
              </p>
            </div>
          </div>

          <div v-if="promotion.type === 'bundle'" class="space-y-3">
            <div>
              <Label for="bundle-quantity">Minimum Quantity</Label>
              <Input
                id="bundle-quantity"
                v-model.number="bundleDetails.quantity"
                type="number"
                min="2"
              />
              <p class="text-xs text-muted-foreground mt-1">
                Minimum number of items in the bundle
              </p>
            </div>
            <div>
              <Label for="bundle-discount">Bundle Discount</Label>
              <div class="relative">
                <Input
                  id="bundle-discount"
                  v-model.number="bundleDetails.discount"
                  type="number"
                  min="1"
                  max="100"
                  class="pr-8"
                />
                <span class="absolute right-3 top-2 text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          <div>
            <Label for="promotion-description">Description (Optional)</Label>
            <Textarea
              id="promotion-description"
              v-model="promotion.description"
              placeholder="Details about the promotion"
              rows="3"
            />
            <p class="text-xs text-muted-foreground mt-1">
              Additional information about this promotion
            </p>
          </div>
        </div>

        <!-- Step 2: Target Products -->
        <div v-if="currentStep === 1" class="space-y-4">
          <div class="space-y-2">
            <Label>Applies To</Label>
            <RadioGroup v-model="promotion.appliesTo" class="space-y-2">
              <div class="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="all" id="all-products" />
                <Label for="all-products" class="font-normal cursor-pointer">
                  All Products
                </Label>
              </div>
              <div class="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="category" id="product-category" />
                <Label for="product-category" class="font-normal cursor-pointer">
                  Product Category
                </Label>
              </div>
              <div class="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="products" id="specific-products" />
                <Label for="specific-products" class="font-normal cursor-pointer">
                  Specific Products
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div v-if="promotion.appliesTo === 'category'" class="mt-4">
            <Label for="category-select">Select Category</Label>
            <Select v-model="promotion.categoryId">
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="promotion.appliesTo === 'products'" class="mt-4 space-y-4">
            <Label>Select Products</Label>
            
            <div class="relative mb-4">
              <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                class="pl-8"
                v-model="productSearchQuery"
              />
            </div>
            
            <div class="border rounded-md divide-y max-h-[300px] overflow-y-auto">
              <div 
                v-for="product in filteredProducts" 
                :key="product.id"
                class="p-3 flex items-center space-x-3"
              >
                <Checkbox 
                  :id="`product-${product.id}`"
                  :checked="promotion.productIds.includes(product.id)"
                  @update:checked="toggleProductSelection(product.id)"
                />
                <Label :for="`product-${product.id}`" class="flex-1 cursor-pointer font-normal">
                  <div>{{ product.name }}</div>
                  <div class="text-xs text-muted-foreground">SKU: {{ product.sku }}</div>
                </Label>
                <div class="text-sm font-medium">${{ product.price.toFixed(2) }}</div>
              </div>
              
              <div v-if="filteredProducts.length === 0" class="p-4 text-center text-muted-foreground">
                No products found matching your search criteria.
              </div>
            </div>
            
            <div class="text-sm">
              <span class="font-medium">{{ promotion.productIds.length }}</span> products selected
            </div>
          </div>
        </div>

        <!-- Step 3: Conditions -->
        <div v-if="currentStep === 2" class="space-y-4">
          <div>
            <Label>Time Period</Label>
            <div class="grid gap-4 mt-2">
              <div>
                <Label for="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  v-model="promotion.startDate"
                />
              </div>
              <div>
                <Label for="end-date">End Date (Optional)</Label>
                <Input
                  id="end-date"
                  type="date"
                  v-model="promotion.endDate"
                />
                <p class="text-xs text-muted-foreground mt-1">
                  Leave blank for a promotion with no end date
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label>Customer Groups</Label>
            <div class="border rounded-md divide-y max-h-[200px] overflow-y-auto mt-2">
              <div 
                v-for="group in customerGroups" 
                :key="group.id"
                class="p-3 flex items-center space-x-3"
              >
                <Checkbox 
                  :id="`group-${group.id}`"
                  :checked="promotion.customerGroupIds.includes(group.id)"
                  @update:checked="toggleCustomerGroupSelection(group.id)"
                />
                <Label :for="`group-${group.id}`" class="flex-1 cursor-pointer font-normal">
                  {{ group.name }}
                </Label>
              </div>
              <div v-if="customerGroups.length === 0" class="p-4 text-center text-muted-foreground">
                No customer groups available.
              </div>
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              If none selected, the promotion applies to all customers
            </p>
          </div>

          <div>
            <Label>Sales Channels</Label>
            <div class="border rounded-md divide-y max-h-[200px] overflow-y-auto mt-2">
              <div 
                v-for="channel in salesChannels" 
                :key="channel.id"
                class="p-3 flex items-center space-x-3"
              >
                <Checkbox 
                  :id="`channel-${channel.id}`"
                  :checked="promotion.salesChannelIds.includes(channel.id)"
                  @update:checked="toggleSalesChannelSelection(channel.id)"
                />
                <Label :for="`channel-${channel.id}`" class="flex-1 cursor-pointer font-normal">
                  {{ channel.name }}
                </Label>
              </div>
              <div v-if="salesChannels.length === 0" class="p-4 text-center text-muted-foreground">
                No sales channels available.
              </div>
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              If none selected, the promotion applies to all sales channels
            </p>
          </div>

          <div>
            <Label for="usage-limit">Usage Limit (Optional)</Label>
            <Input
              id="usage-limit"
              type="number"
              min="0"
              v-model.number="promotion.usageLimit"
              placeholder="Unlimited"
            />
            <p class="text-xs text-muted-foreground mt-1">
              Maximum number of times this promotion can be used
            </p>
          </div>
        </div>

        <!-- Step 4: Review -->
        <div v-if="currentStep === 3" class="space-y-4">
          <div class="border rounded-md p-4 space-y-4">
            <div>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium">{{ promotion.name }}</h3>
                <Badge>{{ formatPromotionType(promotion.type) }}</Badge>
              </div>
              <p class="text-sm text-muted-foreground mt-1">{{ promotion.description || 'No description' }}</p>
            </div>
            
            <div class="pt-4 border-t grid gap-3">
              <div class="grid grid-cols-2 gap-2">
                <div class="text-sm text-muted-foreground">Value</div>
                <div class="text-sm font-medium">{{ formatPromotionValue() }}</div>
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <div class="text-sm text-muted-foreground">Applies To</div>
                <div class="text-sm font-medium">
                  <span v-if="promotion.appliesTo === 'all'">All Products</span>
                  <span v-else-if="promotion.appliesTo === 'category'">
                    {{ getCategoryName(promotion.categoryId) }}
                  </span>
                  <span v-else-if="promotion.appliesTo === 'products'">
                    {{ promotion.productIds.length }} Specific Products
                  </span>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <div class="text-sm text-muted-foreground">Date Range</div>
                <div class="text-sm font-medium">
                  {{ formatDate(promotion.startDate) }} - 
                  {{ promotion.endDate ? formatDate(promotion.endDate) : 'No end date' }}
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div class="text-sm text-muted-foreground">Status</div>
                <div class="text-sm font-medium">
                  {{ getInitialStatus() }}
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <div class="text-sm text-muted-foreground">Customer Groups</div>
                <div class="text-sm font-medium">
                  <span v-if="promotion.customerGroupIds.length === 0">All Customers</span>
                  <span v-else>{{ promotion.customerGroupIds.length }} Selected Groups</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div class="text-sm text-muted-foreground">Sales Channels</div>
                <div class="text-sm font-medium">
                  <span v-if="promotion.salesChannelIds.length === 0">All Channels</span>
                  <span v-else>{{ promotion.salesChannelIds.length }} Selected Channels</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div class="text-sm text-muted-foreground">Usage Limit</div>
                <div class="text-sm font-medium">
                  {{ promotion.usageLimit ? promotion.usageLimit : 'Unlimited' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step Navigation -->
      <div class="flex items-center justify-between mt-6">
        <Button 
          variant="outline" 
          @click="prevStep"
          :disabled="currentStep === 0"
        >
          Previous
        </Button>
        <Button 
          v-if="currentStep < steps.length - 1"
          @click="nextStep"
          :disabled="!canProceed"
        >
          Continue
        </Button>
        <Button 
          v-else
          @click="createPromotion"
          :disabled="isCreating"
        >
          <Loader2Icon v-if="isCreating" class="h-4 w-4 mr-2 animate-spin" />
          <span>{{ isCreating ? 'Creating...' : 'Create Promotion' }}</span>
        </Button>
      </div>
    </div>

    <SheetFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  CheckIcon,
  Loader2Icon,
  SearchIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  SelectValue
} from '@/components/ui/select'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'

const props = defineProps({
  products: {
    type: Array,
    required: true,
    default: () => []
  },
  customerGroups: {
    type: Array,
    required: true,
    default: () => []
  },
  salesChannels: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['promotion-created', 'close'])

// Mock categories for demonstration
const categories = ref([
  { id: 'cat1', name: 'Electronics' },
  { id: 'cat2', name: 'Clothing' },
  { id: 'cat3', name: 'Home & Kitchen' },
  { id: 'cat4', name: 'Books' },
  { id: 'cat5', name: 'Sports & Outdoors' }
])

// Wizard Steps
const steps = [
  { label: 'Basic Details' },
  { label: 'Target Products' },
  { label: 'Conditions' },
  { label: 'Review' }
]

// State
const currentStep = ref(0)
const isCreating = ref(false)
const productSearchQuery = ref('')

// Special promotion type details
const bogoDetails = ref({
  buy: 1,
  get: 1,
  percent: 100
})

const bundleDetails = ref({
  quantity: 2,
  discount: 10
})

// Promotion model
const promotion = ref({
  name: '',
  type: 'percentage',
  value: 10,
  description: '',
  appliesTo: 'all',
  categoryId: '',
  productIds: [],
  customerGroupIds: [],
  salesChannelIds: [],
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  usageLimit: null,
  status: 'active'
})

// Watch BOGO and Bundle details and update promotion value
watch(bogoDetails, () => {
  if (promotion.value.type === 'bogo') {
    promotion.value.value = { ...bogoDetails.value }
  }
}, { deep: true })

watch(bundleDetails, () => {
  if (promotion.value.type === 'bundle') {
    promotion.value.value = { ...bundleDetails.value }
  }
}, { deep: true })

// Watch promotion type and set default value
watch(() => promotion.value.type, (newType) => {
  if (newType === 'percentage') {
    promotion.value.value = 10
  } else if (newType === 'fixed') {
    promotion.value.value = 5
  } else if (newType === 'bogo') {
    promotion.value.value = { ...bogoDetails.value }
  } else if (newType === 'bundle') {
    promotion.value.value = { ...bundleDetails.value }
  } else if (newType === 'shipping') {
    promotion.value.value = 'free'
  }
})

// Computed properties
const filteredProducts = computed(() => {
  if (!productSearchQuery.value) return props.products
  
  const search = productSearchQuery.value.toLowerCase()
  return props.products.filter(product => 
    product.name.toLowerCase().includes(search) || 
    (product.sku && product.sku.toLowerCase().includes(search))
  )
})

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return promotion.value.name && promotion.value.type
  } else if (currentStep.value === 1) {
    if (promotion.value.appliesTo === 'category') {
      return !!promotion.value.categoryId
    } else if (promotion.value.appliesTo === 'products') {
      return promotion.value.productIds.length > 0
    }
    return true
  } else if (currentStep.value === 2) {
    return !!promotion.value.startDate
  }
  return true
})

// Methods
const goToStep = (step) => {
  if (step < currentStep.value) {
    currentStep.value = step
  }
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const toggleProductSelection = (productId) => {
  const index = promotion.value.productIds.indexOf(productId)
  if (index === -1) {
    promotion.value.productIds.push(productId)
  } else {
    promotion.value.productIds.splice(index, 1)
  }
}

const toggleCustomerGroupSelection = (groupId) => {
  const index = promotion.value.customerGroupIds.indexOf(groupId)
  if (index === -1) {
    promotion.value.customerGroupIds.push(groupId)
  } else {
    promotion.value.customerGroupIds.splice(index, 1)
  }
}

const toggleSalesChannelSelection = (channelId) => {
  const index = promotion.value.salesChannelIds.indexOf(channelId)
  if (index === -1) {
    promotion.value.salesChannelIds.push(channelId)
  } else {
    promotion.value.salesChannelIds.splice(index, 1)
  }
}

const formatPromotionType = (type) => {
  switch (type) {
    case 'percentage':
      return 'Percentage'
    case 'fixed':
      return 'Fixed Amount'
    case 'bogo':
      return 'Buy One Get One'
    case 'shipping':
      return 'Free Shipping'
    case 'bundle':
      return 'Bundle'
    default:
      return type
  }
}

const formatPromotionValue = () => {
  const type = promotion.value.type
  const value = promotion.value.value
  
  if (type === 'percentage') {
    return `${value}%`
  } else if (type === 'fixed') {
    return `$${parseFloat(value).toFixed(2)}`
  } else if (type === 'bogo') {
    return `Buy ${value.buy}, Get ${value.get} ${value.percent < 100 ? `${value.percent}% off` : 'Free'}`
  } else if (type === 'shipping') {
    return 'Free'
  } else if (type === 'bundle') {
    return `${value.discount}% off ${value.quantity}+ items`
  } else {
    return value.toString()
  }
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : 'Unknown Category'
}

const formatDate = (dateString) => {
  if (!dateString) return null
  try {
    return format(parseISO(dateString), 'MMM d, yyyy')
  } catch (e) {
    return dateString
  }
}

const getInitialStatus = () => {
  const today = new Date()
  const startDate = promotion.value.startDate ? new Date(promotion.value.startDate) : null
  const endDate = promotion.value.endDate ? new Date(promotion.value.endDate) : null
  
  if (startDate && startDate > today) {
    return 'Scheduled'
  } else if (endDate && endDate < today) {
    return 'Expired'
  } else {
    return 'Active'
  }
}

const createPromotion = async () => {
  isCreating.value = true
  
  try {
    // Create a copy of the promotion with enhanced fields
    const newPromotion = {
      ...promotion.value,
      status: getInitialStatus().toLowerCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    // Ensure dates are in ISO format
    if (newPromotion.startDate) {
      newPromotion.startDate = new Date(newPromotion.startDate).toISOString()
    }
    
    if (newPromotion.endDate) {
      newPromotion.endDate = new Date(newPromotion.endDate).toISOString()
    }
    
    // Emit the event with the new promotion
    emit('promotion-created', newPromotion)
  } finally {
    isCreating.value = false
  }
}
</script>