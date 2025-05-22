<template>
  <SheetContent class="sm:max-w-xl w-full overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Edit Promotion</SheetTitle>
      <SheetDescription>
        Update details for "{{ promotion.name }}"
      </SheetDescription>
    </SheetHeader>

    <div class="py-4">
      <div class="space-y-5">
        <!-- Basic Details -->
        <div class="space-y-4">
          <h3 class="text-base font-medium">Basic Information</h3>
          
          <div>
            <Label for="promotion-name">Promotion Name</Label>
            <Input
              id="promotion-name"
              v-model="editedPromotion.name"
              placeholder="Summer Sale"
            />
          </div>

          <div>
            <Label for="promotion-type">Promotion Type</Label>
            <Select v-model="editedPromotion.type">
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
          </div>

          <div v-if="editedPromotion.type === 'percentage'">
            <Label for="percentage-value">Discount Percentage</Label>
            <div class="relative">
              <Input
                id="percentage-value"
                v-model.number="editedPromotion.value"
                type="number"
                min="1"
                max="100"
                class="pr-8"
              />
              <span class="absolute right-3 top-2 text-muted-foreground">%</span>
            </div>
          </div>

          <div v-if="editedPromotion.type === 'fixed'">
            <Label for="fixed-value">Discount Amount</Label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-muted-foreground">$</span>
              <Input
                id="fixed-value"
                v-model.number="editedPromotion.value"
                type="number"
                min="0.01"
                step="0.01"
                class="pl-7"
              />
            </div>
          </div>

          <div v-if="editedPromotion.type === 'bogo'" class="space-y-3">
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
            </div>
          </div>

          <div v-if="editedPromotion.type === 'bundle'" class="space-y-3">
            <div>
              <Label for="bundle-quantity">Minimum Quantity</Label>
              <Input
                id="bundle-quantity"
                v-model.number="bundleDetails.quantity"
                type="number"
                min="2"
              />
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
            <Label for="promotion-description">Description</Label>
            <Textarea
              id="promotion-description"
              v-model="editedPromotion.description"
              placeholder="Details about the promotion"
              rows="3"
            />
          </div>
        </div>

        <Separator />

        <!-- Target Products -->
        <div class="space-y-4">
          <h3 class="text-base font-medium">Target Products</h3>

          <div class="space-y-2">
            <Label>Applies To</Label>
            <RadioGroup v-model="editedPromotion.appliesTo" class="space-y-2">
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

          <div v-if="editedPromotion.appliesTo === 'category'" class="mt-4">
            <Label for="category-select">Select Category</Label>
            <Select v-model="editedPromotion.categoryId">
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

          <div v-if="editedPromotion.appliesTo === 'products'" class="mt-4 space-y-4">
            <div class="flex items-center justify-between">
              <Label>Select Products</Label>
              <span class="text-sm text-muted-foreground">
                {{ editedPromotion.productIds.length }} selected
              </span>
            </div>
            
            <div class="relative mb-4">
              <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                class="pl-8"
                v-model="productSearchQuery"
              />
            </div>
            
            <div class="border rounded-md divide-y max-h-[250px] overflow-y-auto">
              <div 
                v-for="product in filteredProducts" 
                :key="product.id"
                class="p-3 flex items-center space-x-3"
              >
                <Checkbox 
                  :id="`product-${product.id}`"
                  :checked="editedPromotion.productIds.includes(product.id)"
                  @update:checked="toggleProductSelection(product.id)"
                />
                <Label :for="`product-${product.id}`" class="flex-1 cursor-pointer font-normal">
                  <div>{{ product.name }}</div>
                  <div class="text-xs text-muted-foreground">SKU: {{ product.sku }}</div>
                </Label>
                <div class="text-sm font-medium">${{ product.price?.toFixed(2) }}</div>
              </div>
              
              <div v-if="filteredProducts.length === 0" class="p-4 text-center text-muted-foreground">
                No products found matching your search criteria.
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <!-- Time Period & Eligibility -->
        <div class="space-y-4">
          <h3 class="text-base font-medium">Time Period & Eligibility</h3>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <Label for="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                v-model="editedPromotion.startDate"
              />
            </div>
            <div>
              <Label for="end-date">End Date (Optional)</Label>
              <Input
                id="end-date"
                type="date"
                v-model="editedPromotion.endDate"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <Label>Customer Groups</Label>
              <Button variant="link" size="sm" class="h-auto p-0" @click="toggleAllCustomerGroups">
                {{ allCustomerGroupsSelected ? 'Deselect All' : 'Select All' }}
              </Button>
            </div>
            <div class="border rounded-md divide-y max-h-[200px] overflow-y-auto mt-2">
              <div 
                v-for="group in customerGroups" 
                :key="group.id"
                class="p-3 flex items-center space-x-3"
              >
                <Checkbox 
                  :id="`group-${group.id}`"
                  :checked="editedPromotion.customerGroupIds.includes(group.id)"
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
            <div class="flex items-center justify-between">
              <Label>Sales Channels</Label>
              <Button variant="link" size="sm" class="h-auto p-0" @click="toggleAllSalesChannels">
                {{ allSalesChannelsSelected ? 'Deselect All' : 'Select All' }}
              </Button>
            </div>
            <div class="border rounded-md divide-y max-h-[200px] overflow-y-auto mt-2">
              <div 
                v-for="channel in salesChannels" 
                :key="channel.id"
                class="p-3 flex items-center space-x-3"
              >
                <Checkbox 
                  :id="`channel-${channel.id}`"
                  :checked="editedPromotion.salesChannelIds.includes(channel.id)"
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
              v-model.number="editedPromotion.usageLimit"
              placeholder="Unlimited"
            />
            <p class="text-xs text-muted-foreground mt-1">
              Maximum number of times this promotion can be used
            </p>
          </div>
        </div>

        <Separator />

        <!-- Status -->
        <div class="space-y-4">
          <h3 class="text-base font-medium">Promotion Status</h3>
          
          <div class="flex items-start space-x-3">
            <div class="flex-1">
              <Label for="status">Status</Label>
              <Select v-model="editedPromotion.status">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div v-if="isStatusChanged" class="mt-7">
              <Badge>Status Changed</Badge>
            </div>
          </div>
          
          <div v-if="showStatusWarning" class="mt-2">
            <Alert variant="warning">
              <AlertCircleIcon class="h-4 w-4" />
              <AlertTitle>Status Change</AlertTitle>
              <AlertDescription>
                {{ statusWarningMessage }}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>

    <SheetFooter class="pt-4 gap-2">
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        @click="saveChanges"
        :disabled="isSaving || !hasChanges"
      >
        <Loader2Icon v-if="isSaving" class="h-4 w-4 mr-2 animate-spin" />
        <span>{{ isSaving ? 'Saving...' : 'Save Changes' }}</span>
      </Button>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  AlertCircleIcon,
  Loader2Icon,
  SearchIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
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
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'

const props = defineProps({
  promotion: {
    type: Object,
    required: true
  },
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

const emit = defineEmits(['promotion-updated', 'close'])

// Mock categories for demo
const categories = ref([
  { id: 'cat1', name: 'Electronics' },
  { id: 'cat2', name: 'Clothing' },
  { id: 'cat3', name: 'Home & Kitchen' },
  { id: 'cat4', name: 'Books' },
  { id: 'cat5', name: 'Sports & Outdoors' }
])

// Initialize edited promotion by deep copying the input promotion
const editedPromotion = ref(JSON.parse(JSON.stringify(props.promotion)))
const originalPromotion = ref(JSON.parse(JSON.stringify(props.promotion)))

// Format date strings to date input format
if (editedPromotion.value.startDate) {
  editedPromotion.value.startDate = formatDateForInput(editedPromotion.value.startDate)
}
if (editedPromotion.value.endDate) {
  editedPromotion.value.endDate = formatDateForInput(editedPromotion.value.endDate)
}

// Ensure arrays are initialized
if (!editedPromotion.value.productIds) {
  editedPromotion.value.productIds = []
}
if (!editedPromotion.value.customerGroupIds) {
  editedPromotion.value.customerGroupIds = []
}
if (!editedPromotion.value.salesChannelIds) {
  editedPromotion.value.salesChannelIds = []
}

// UI state
const isSaving = ref(false)
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

// Initialize special type details from promotion value
onMounted(() => {
  if (props.promotion.type === 'bogo' && typeof props.promotion.value === 'object') {
    bogoDetails.value = { ...props.promotion.value }
  } else if (props.promotion.type === 'bundle' && typeof props.promotion.value === 'object') {
    bundleDetails.value = { ...props.promotion.value }
  }
})

// Watch for changes in special type details and update promotion value
watch(bogoDetails, () => {
  if (editedPromotion.value.type === 'bogo') {
    editedPromotion.value.value = { ...bogoDetails.value }
  }
}, { deep: true })

watch(bundleDetails, () => {
  if (editedPromotion.value.type === 'bundle') {
    editedPromotion.value.value = { ...bundleDetails.value }
  }
}, { deep: true })

// Watch promotion type changes and update value
watch(() => editedPromotion.value.type, (newType, oldType) => {
  if (newType !== oldType) {
    if (newType === 'percentage') {
      editedPromotion.value.value = 10
    } else if (newType === 'fixed') {
      editedPromotion.value.value = 5
    } else if (newType === 'bogo') {
      editedPromotion.value.value = { ...bogoDetails.value }
    } else if (newType === 'bundle') {
      editedPromotion.value.value = { ...bundleDetails.value }
    } else if (newType === 'shipping') {
      editedPromotion.value.value = 'free'
    }
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

const hasChanges = computed(() => {
  return JSON.stringify(editedPromotion.value) !== JSON.stringify(originalPromotion.value)
})

const isStatusChanged = computed(() => {
  return editedPromotion.value.status !== originalPromotion.value.status
})

const showStatusWarning = computed(() => {
  // Show warning when changing from active to inactive
  if (originalPromotion.value.status === 'active' && editedPromotion.value.status === 'inactive') {
    return true
  }
  // Show warning when changing from any status to active, if dates are in the past
  if (editedPromotion.value.status === 'active') {
    const endDate = editedPromotion.value.endDate ? new Date(editedPromotion.value.endDate) : null
    if (endDate && endDate < new Date()) {
      return true
    }
  }
  return false
})

const statusWarningMessage = computed(() => {
  if (originalPromotion.value.status === 'active' && editedPromotion.value.status === 'inactive') {
    return 'Changing this promotion to inactive will immediately stop it from applying to any orders.'
  }
  if (editedPromotion.value.status === 'active') {
    const endDate = editedPromotion.value.endDate ? new Date(editedPromotion.value.endDate) : null
    if (endDate && endDate < new Date()) {
      return 'This promotion has an end date in the past. Setting it to active may not have the intended effect.'
    }
  }
  return ''
})

const allCustomerGroupsSelected = computed(() => {
  return props.customerGroups.length > 0 && 
    props.customerGroups.every(group => 
      editedPromotion.value.customerGroupIds.includes(group.id)
    )
})

const allSalesChannelsSelected = computed(() => {
  return props.salesChannels.length > 0 && 
    props.salesChannels.every(channel => 
      editedPromotion.value.salesChannelIds.includes(channel.id)
    )
})

// Methods
function toggleProductSelection(productId) {
  const index = editedPromotion.value.productIds.indexOf(productId)
  if (index === -1) {
    editedPromotion.value.productIds.push(productId)
  } else {
    editedPromotion.value.productIds.splice(index, 1)
  }
}

function toggleCustomerGroupSelection(groupId) {
  const index = editedPromotion.value.customerGroupIds.indexOf(groupId)
  if (index === -1) {
    editedPromotion.value.customerGroupIds.push(groupId)
  } else {
    editedPromotion.value.customerGroupIds.splice(index, 1)
  }
}

function toggleSalesChannelSelection(channelId) {
  const index = editedPromotion.value.salesChannelIds.indexOf(channelId)
  if (index === -1) {
    editedPromotion.value.salesChannelIds.push(channelId)
  } else {
    editedPromotion.value.salesChannelIds.splice(index, 1)
  }
}

function toggleAllCustomerGroups() {
  if (allCustomerGroupsSelected.value) {
    editedPromotion.value.customerGroupIds = []
  } else {
    editedPromotion.value.customerGroupIds = props.customerGroups.map(group => group.id)
  }
}

function toggleAllSalesChannels() {
  if (allSalesChannelsSelected.value) {
    editedPromotion.value.salesChannelIds = []
  } else {
    editedPromotion.value.salesChannelIds = props.salesChannels.map(channel => channel.id)
  }
}

function formatDateForInput(dateString) {
  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  } catch (e) {
    return dateString
  }
}

async function saveChanges() {
  isSaving.value = true
  
  try {
    // Create a copy of the promotion with enhanced fields
    const updatedPromotion = {
      ...editedPromotion.value,
      updatedAt: new Date().toISOString()
    }
    
    // Format dates as ISO strings
    if (updatedPromotion.startDate) {
      updatedPromotion.startDate = new Date(updatedPromotion.startDate).toISOString()
    }
    
    if (updatedPromotion.endDate) {
      updatedPromotion.endDate = new Date(updatedPromotion.endDate).toISOString()
    }
    
    // Emit the updated promotion
    emit('promotion-updated', updatedPromotion)
  } finally {
    isSaving.value = false
  }
}
</script>