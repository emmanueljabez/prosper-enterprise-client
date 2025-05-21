<template>
  <SheetContent class="flex flex-col h-full w-full sm:max-w-lg">
    <div class="flex items-center justify-between border-b px-6 py-4">
      <div>
        <h2 class="text-lg font-semibold">Create New Bundle</h2>
        <p class="text-sm text-muted-foreground">
          Step {{ currentStep }} of {{ totalSteps }}: {{ currentStepTitle }}
        </p>
      </div>
      <Button variant="ghost" size="icon" @click="$emit('close')">
        <XIcon class="h-4 w-4" />
      </Button>
    </div>

    <div class="flex-1 overflow-y-auto p-6">
      <!-- Step 1: Basic Information -->
      <div v-if="currentStep === 1" class="space-y-6">
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="bundle-name">Bundle Name <span class="text-destructive">*</span></Label>
            <Input 
              id="bundle-name" 
              v-model="bundleData.name" 
              placeholder="Enter bundle name"
              :class="{ 'border-destructive': validationErrors.name }"
            />
            <p v-if="validationErrors.name" class="text-sm text-destructive">
              {{ validationErrors.name }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="bundle-sku">SKU <span class="text-destructive">*</span></Label>
            <Input 
              id="bundle-sku" 
              v-model="bundleData.sku" 
              placeholder="Enter SKU"
              :class="{ 'border-destructive': validationErrors.sku }"
            />
            <p v-if="validationErrors.sku" class="text-sm text-destructive">
              {{ validationErrors.sku }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="bundle-description">Description</Label>
            <Textarea 
              id="bundle-description" 
              v-model="bundleData.description" 
              placeholder="Enter bundle description"
              rows="4"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="bundle-price">Price <span class="text-destructive">*</span></Label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                <Input 
                  id="bundle-price" 
                  v-model="bundleData.price" 
                  type="number" 
                  step="0.01"
                  class="pl-7"
                  :class="{ 'border-destructive': validationErrors.price }"
                />
              </div>
              <p v-if="validationErrors.price" class="text-sm text-destructive">
                {{ validationErrors.price }}
              </p>
            </div>

            <div class="space-y-2">
              <Label for="bundle-compare-price">Compare at Price</Label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                <Input 
                  id="bundle-compare-price" 
                  v-model="bundleData.compareAtPrice" 
                  type="number" 
                  step="0.01"
                  placeholder="Optional"
                  class="pl-7"
                />
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="bundle-status">Status</Label>
            <Select v-model="bundleData.status">
              <SelectTrigger id="bundle-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Categories</Label>
            <Multiselect
              v-model="bundleData.categories"
              :options="categoriesOptions"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Select categories"
              label="label"
              track-by="value"
              :internal-search="true"
              :show-labels="false"
              class="multiselect-custom"
            >
              <template #tag="{ option, remove }">
                <span class="multiselect__tag">
                  <span>{{ option.label }}</span>
                  <i class="multiselect__tag-icon" @click="remove(option)"></i>
                </span>
              </template>
              <template #option="{ option }">
                <span>{{ option.label }}</span>
              </template>
            </Multiselect>
          </div>
        </div>
      </div>

      <!-- Step 2: Bundle Components -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-base font-medium">Bundle Components</h3>
          <Button size="sm" @click="showProductSelector = true">
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <Alert v-if="bundleItems.length === 0" variant="default">
          <AlertDescription>
            Add products to your bundle by clicking the "Add Product" button above.
          </AlertDescription>
        </Alert>

        <div v-else class="space-y-4">
          <Card v-for="(item, index) in bundleItems" :key="index" class="relative">
            <Button 
              variant="destructive" 
              size="icon"
              class="absolute top-2 right-2 h-6 w-6"
              @click="removeItem(index)"
            >
              <XIcon class="h-3 w-3" />
            </Button>
            
            <CardContent class="pt-6">
              <div class="flex items-start gap-4">
                <div class="h-12 w-12 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    v-if="getProductImage(item.product)"
                    :src="getProductImage(item.product)"
                    :alt="item.product.name"
                    class="h-full w-full object-cover"
                  />
                  <PackageIcon v-else class="h-6 w-6 text-muted-foreground" />
                </div>
                
                <div class="flex-1">
                  <h4 class="font-medium">{{ item.product.name }}</h4>
                  <p class="text-sm text-muted-foreground">SKU: {{ item.product.sku }}</p>
                  
                  <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="space-y-1">
                      <Label :for="`quantity-${index}`" class="text-xs">Quantity</Label>
                      <Input 
                        :id="`quantity-${index}`" 
                        v-model="item.quantity" 
                        type="number" 
                        min="1"
                        class="h-8"
                      />
                    </div>
                    
                    <div class="space-y-1">
                      <Label :for="`required-${index}`" class="text-xs">Required</Label>
                      <div class="flex items-center space-x-2 h-8 mt-2">
                        <Checkbox :id="`required-${index}`" v-model="item.isRequired" />
                        <label 
                          :for="`required-${index}`" 
                          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Required item
                        </label>
                      </div>
                    </div>
                    
                    <div class="space-y-1">
                      <Label :for="`variable-${index}`" class="text-xs">Variable</Label>
                      <div class="flex items-center space-x-2 h-8 mt-2">
                        <Checkbox 
                          :id="`variable-${index}`" 
                          v-model="item.isVariable" 
                          :disabled="!hasVariantOptions(item.product)"
                        />
                        <label 
                          :for="`variable-${index}`" 
                          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Customer can choose options
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Variant selection for variable items -->
                  <div v-if="item.isVariable && hasVariantOptions(item.product)" class="mt-4">
                    <div class="text-xs font-medium mb-2">Default Variant</div>
                    <Select 
                      v-model="item.variantId" 
                      :disabled="!item.isVariable"
                    >
                      <SelectTrigger class="h-8">
                        <SelectValue placeholder="Select default variant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem 
                          v-for="variant in item.product.variants" 
                          :key="variant.id" 
                          :value="variant.id"
                        >
                          {{ variant.name || `${item.product.name} - ${variant.sku}` }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Product Selector Modal -->
        <Dialog v-model:open="showProductSelector">
          <DialogContent class="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Select Products</DialogTitle>
              <DialogDescription>
                Choose products to add to your bundle.
              </DialogDescription>
            </DialogHeader>
            
            <div class="py-4">
              <Input 
                v-model="productSearch" 
                placeholder="Search products..."
                class="mb-4"
              />
              
              <div class="max-h-[300px] overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead class="w-[50px]"></TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="product in filteredProducts" :key="product.id">
                      <TableCell>
                        <Checkbox 
                          :checked="isProductSelected(product)" 
                          @update:checked="toggleProductSelection(product)"
                        />
                      </TableCell>
                      <TableCell>
                        <div class="font-medium">{{ product.name }}</div>
                      </TableCell>
                      <TableCell>{{ product.sku }}</TableCell>
                      <TableCell>{{ formatPrice(product.price) }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" @click="showProductSelector = false">Cancel</Button>
              <Button @click="addSelectedProducts">Add Selected Products</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <!-- Step 3: Inventory Settings -->
      <div v-if="currentStep === 3" class="space-y-6">
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox id="dynamic-stock" v-model="bundleData.inventory.dynamicStock" />
            <Label for="dynamic-stock" class="font-medium">
              Use dynamic stock calculation
            </Label>
          </div>
          <p class="text-sm text-muted-foreground">
            Bundle availability will be calculated based on component stock levels
          </p>
        </div>

        <div class="space-y-4" v-if="bundleData.inventory.dynamicStock">
          <div class="space-y-2">
            <Label for="min-component-quantity">Minimum Component Quantity</Label>
            <Input 
              id="min-component-quantity" 
              v-model="bundleData.inventory.minComponentQuantity" 
              type="number" 
              min="1"
            />
            <p class="text-xs text-muted-foreground">
              Minimum number of components needed to create one bundle
            </p>
          </div>

          <div class="space-y-2">
            <Label for="low-stock-threshold">Low Stock Threshold</Label>
            <Input 
              id="low-stock-threshold" 
              v-model="bundleData.inventory.lowStockThreshold" 
              type="number" 
              min="1"
            />
            <p class="text-xs text-muted-foreground">
              Number of bundles when "Low Stock" warning will be shown
            </p>
          </div>
        </div>
      </div>

      <!-- Step 4: Visibility & SEO -->
      <div v-if="currentStep === 4" class="space-y-6">
        <div class="space-y-4">
          <h3 class="text-base font-medium">Visibility</h3>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="webstore-visibility" v-model="bundleData.visibility.webstore" />
              <Label for="webstore-visibility">Show in Web Store</Label>
            </div>
            <p class="text-sm text-muted-foreground">
              Make this bundle visible to customers on your web store
            </p>
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="b2b-visibility" v-model="bundleData.visibility.b2bPortal" />
              <Label for="b2b-visibility">Show in B2B Portal</Label>
            </div>
            <p class="text-sm text-muted-foreground">
              Make this bundle visible to B2B customers in your portal
            </p>
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="marketplace-visibility" v-model="bundleData.visibility.marketplace" />
              <Label for="marketplace-visibility">Show in Marketplace</Label>
            </div>
            <p class="text-sm text-muted-foreground">
              List this bundle in marketplace channels
            </p>
          </div>
        </div>

        <Separator />

        <div class="space-y-4">
          <h3 class="text-base font-medium">SEO Settings</h3>
          
          <div class="space-y-2">
            <Label for="seo-title">SEO Title</Label>
            <Input 
              id="seo-title" 
              v-model="bundleData.seo.title" 
              placeholder="SEO Title (defaults to bundle name)"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="seo-description">Meta Description</Label>
            <Textarea 
              id="seo-description" 
              v-model="bundleData.seo.metaDescription" 
              rows="3"
              placeholder="Brief description for search engines"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="seo-slug">URL Slug</Label>
            <Input 
              id="seo-slug" 
              v-model="bundleData.seo.slug" 
              placeholder="product-url-slug"
            />
            <p class="text-xs text-muted-foreground">
              The URL-friendly version of the bundle name
            </p>
          </div>
        </div>
      </div>

      <!-- Step 5: Review & Create -->
      <div v-if="currentStep === 5" class="space-y-6">
        <h3 class="text-base font-medium">Review Bundle Information</h3>
        
        <div class="rounded-lg border overflow-hidden">
          <div class="bg-muted px-4 py-2">
            <h4 class="font-medium">Basic Information</h4>
          </div>
          <div class="p-4 space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <div class="text-sm font-medium">Name</div>
                <div>{{ bundleData.name }}</div>
              </div>
              <div>
                <div class="text-sm font-medium">SKU</div>
                <div>{{ bundleData.sku }}</div>
              </div>
            </div>
            <div>
              <div class="text-sm font-medium">Description</div>
              <div>{{ bundleData.description || 'No description provided' }}</div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <div class="text-sm font-medium">Price</div>
                <div>{{ formatPrice(bundleData.price) }}</div>
              </div>
              <div>
                <div class="text-sm font-medium">Compare at Price</div>
                <div>{{ bundleData.compareAtPrice ? formatPrice(bundleData.compareAtPrice) : 'N/A' }}</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <div class="text-sm font-medium">Status</div>
                <div>{{ formatStatus(bundleData.status) }}</div>
              </div>
              <div>
                <div class="text-sm font-medium">Categories</div>
                <div>{{ getCategoryNames(bundleData).join(', ') || 'None' }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="rounded-lg border overflow-hidden">
          <div class="bg-muted px-4 py-2">
            <h4 class="font-medium">Bundle Components ({{ bundleItems.length }})</h4>
          </div>
          <div class="divide-y">
            <div v-for="(item, index) in bundleItems" :key="index" class="p-4">
              <div class="flex justify-between">
                <div>
                  <div class="font-medium">{{ item.product.name }}</div>
                  <div class="text-sm text-muted-foreground">
                    Quantity: {{ item.quantity }} • 
                    {{ item.isRequired ? 'Required' : 'Optional' }} • 
                    {{ item.isVariable ? 'Variable' : 'Fixed' }}
                  </div>
                </div>
                <div class="text-right">
                  <div>{{ formatPrice(item.product.price) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="rounded-lg border overflow-hidden">
          <div class="bg-muted px-4 py-2">
            <h4 class="font-medium">Inventory Settings</h4>
          </div>
          <div class="p-4">
            <div class="space-y-2">
              <div>
                <span class="text-sm font-medium">Dynamic Stock: </span>
                <span>{{ bundleData.inventory.dynamicStock ? 'Enabled' : 'Disabled' }}</span>
              </div>
              <div v-if="bundleData.inventory.dynamicStock">
                <div>
                  <span class="text-sm font-medium">Min Component Quantity: </span>
                  <span>{{ bundleData.inventory.minComponentQuantity }}</span>
                </div>
                <div>
                  <span class="text-sm font-medium">Low Stock Threshold: </span>
                  <span>{{ bundleData.inventory.lowStockThreshold }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="rounded-lg border overflow-hidden">
          <div class="bg-muted px-4 py-2">
            <h4 class="font-medium">Visibility & SEO</h4>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <span class="text-sm font-medium">Web Store: </span>
                <span>{{ bundleData.visibility.webstore ? 'Visible' : 'Hidden' }}</span>
              </div>
              <div>
                <span class="text-sm font-medium">B2B Portal: </span>
                <span>{{ bundleData.visibility.b2bPortal ? 'Visible' : 'Hidden' }}</span>
              </div>
              <div>
                <span class="text-sm font-medium">Marketplace: </span>
                <span>{{ bundleData.visibility.marketplace ? 'Visible' : 'Hidden' }}</span>
              </div>
            </div>
            <div class="mt-4 space-y-1">
              <div>
                <span class="text-sm font-medium">SEO Title: </span>
                <span>{{ bundleData.seo.title || bundleData.name }}</span>
              </div>
              <div>
                <span class="text-sm font-medium">Meta Description: </span>
                <span>{{ bundleData.seo.metaDescription || 'None' }}</span>
              </div>
              <div>
                <span class="text-sm font-medium">URL Slug: </span>
                <span>{{ bundleData.seo.slug || generateSlug(bundleData.name) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center border-t px-6 py-4">
      <Button
        variant="outline"
        @click="prevStep"
        :disabled="currentStep === 1"
      >
        <ArrowLeftIcon class="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <div class="flex space-x-2">
        <Button
          v-if="currentStep < totalSteps"
          @click="nextStep"
        >
          Continue
          <ArrowRightIcon class="h-4 w-4 ml-2" />
        </Button>
        <Button
          v-else
          @click="createBundle"
          :disabled="isSubmitting"
        >
          <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
          <span v-else>Create Bundle</span>
        </Button>
      </div>
    </div>
  </SheetContent>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { 
  XIcon, 
  PlusIcon, 
  PackageIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { SheetContent } from '@/components/ui/sheet' // Add this import
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['bundle-created', 'close'])

// Wizard steps
const currentStep = ref(1)
const totalSteps = 5
const currentStepTitle = computed(() => {
  const titles = {
    1: 'Basic Information',
    2: 'Bundle Components',
    3: 'Inventory Settings',
    4: 'Visibility & SEO',
    5: 'Review & Create'
  }
  return titles[currentStep.value] || ''
})

// Form state
const bundleData = reactive({
  name: '',
  sku: '',
  description: '',
  price: null,
  compareAtPrice: null,
  status: 'draft',
  categories: [],
  seo: {
    title: '',
    metaDescription: '',
    slug: ''
  },
  visibility: {
    webstore: true,
    b2bPortal: true,
    marketplace: false
  },
  inventory: {
    dynamicStock: true,
    minComponentQuantity: 1,
    lowStockThreshold: 5
  }
})

const bundleItems = ref([])
const validationErrors = reactive({})
const isSubmitting = ref(false)

// Product selector state
const showProductSelector = ref(false)
const productSearch = ref('')
const selectedProductIds = ref([])

// Computed properties
const categoriesOptions = computed(() => {
  return props.categories.map(category => ({
    value: category.id,
    label: category.name
  }))
})

const filteredProducts = computed(() => {
  let result = props.products

  if (productSearch.value) {
    const searchTerm = productSearch.value.toLowerCase()
    result = result.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm)
    )
  }

  // Filter out bundle products - can't add bundles to bundles
  result = result.filter(product => product.type !== 'bundle')

  return result
})

// Utility functions
function formatPrice(price) {
  if (price === undefined || price === null) return '-'
  return `$${parseFloat(price).toFixed(2)}`
}

function formatStatus(status) {
  if (!status) return 'Unknown'
  
  const statusMap = {
    'active': 'Active',
    'draft': 'Draft',
    'inactive': 'Inactive',
    'archived': 'Archived'
  }
  
  return statusMap[status] || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getCategoryNames(item) {
  // Modified to work with vue-multiselect objects
  if (!item.categories || !Array.isArray(item.categories)) return []
  
  return item.categories.map(category => 
    typeof category === 'object' && category.label ? category.label : null
  ).filter(Boolean)
}

function getProductImage(product) {
  if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
    return null
  }
  
  const defaultImage = product.images.find(img => img.isDefault)
  return defaultImage ? defaultImage.url : product.images[0].url
}

function hasVariantOptions(product) {
  return product && product.variants && product.variants.length > 0
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

// Product selection functions
function isProductSelected(product) {
  return selectedProductIds.value.includes(product.id)
}

function toggleProductSelection(product) {
  const index = selectedProductIds.value.indexOf(product.id)
  if (index === -1) {
    selectedProductIds.value.push(product.id)
  } else {
    selectedProductIds.value.splice(index, 1)
  }
}

function addSelectedProducts() {
  for (const productId of selectedProductIds.value) {
    const product = props.products.find(p => p.id === productId)
    if (product && !bundleItems.value.some(item => item.productId === productId)) {
      const newItem = {
        productId: product.id,
        product: product, // Keep reference for UI purposes
        quantity: 1,
        isRequired: true,
        isVariable: false
      }
      
      // If the product has variants, add the first one as default
      if (hasVariantOptions(product) && product.variants.length > 0) {
        newItem.variantId = product.variants[0].id
      }
      
      bundleItems.value.push(newItem)
    }
  }
  
  selectedProductIds.value = []
  showProductSelector.value = false
}

function removeItem(index) {
  bundleItems.value.splice(index, 1)
}

// Validation
function validateStep(step) {
  validationErrors.name = ''
  validationErrors.sku = ''
  validationErrors.price = ''
  
  if (step === 1) {
    if (!bundleData.name) {
      validationErrors.name = 'Bundle name is required'
    }
    
    if (!bundleData.sku) {
      validationErrors.sku = 'SKU is required'
    }
    
    if (!bundleData.price) {
      validationErrors.price = 'Price is required'
    } else if (bundleData.price <= 0) {
      validationErrors.price = 'Price must be greater than zero'
    }
    
    return !validationErrors.name && !validationErrors.sku && !validationErrors.price
  }
  
  if (step === 2) {
    return bundleItems.value.length > 0
  }
  
  return true
}

// Navigation
function nextStep() {
  if (validateStep(currentStep.value)) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Final submission
function createBundle() {
  if (!validateStep(currentStep.value)) {
    return
  }
  
  isSubmitting.value = true
  
  // Prepare bundle items without the full product reference
  const preparedItems = bundleItems.value.map(item => {
    const result = {
      productId: item.productId,
      quantity: parseInt(item.quantity) || 1,
      isRequired: item.isRequired,
      isVariable: item.isVariable
    }
    
    if (item.variantId) {
      result.variantId = item.variantId
    }
    
    if (item.isVariable && hasVariantOptions(item.product)) {
      // Get attribute information for variable options
      const variantOptions = {
        attributeId: `attr-${item.productId}`, // This should be replaced with actual attribute ID
        options: []
      }
      
      // Add available variants as options
      if (item.product.variants) {
        item.product.variants.forEach(variant => {
          variantOptions.options.push({
            variantId: variant.id,
            label: variant.name || `${variant.sku}`
          })
        })
      }
      
      if (variantOptions.options.length > 0) {
        result.variableOptions = variantOptions
      }
    }
    
    return result
  })
  
  // Prepare final bundle data
  const finalBundle = {
    ...bundleData,
    // Extract category IDs from the category objects provided by vue-multiselect
    categories: bundleData.categories.map(cat => typeof cat === 'object' ? cat.value : cat),
    price: parseFloat(bundleData.price),
    compareAtPrice: bundleData.compareAtPrice ? parseFloat(bundleData.compareAtPrice) : null,
    type: 'bundle',
    images: [],
    bundleItems: preparedItems
  }
  
  // If SEO data is not provided, use defaults
  if (!finalBundle.seo.title) {
    finalBundle.seo.title = finalBundle.name
  }
  
  if (!finalBundle.seo.slug) {
    finalBundle.seo.slug = generateSlug(finalBundle.name)
  }
  
  // Convert categories to numbers if they are strings
  finalBundle.categories = finalBundle.categories.map(cat => 
    typeof cat === 'string' ? parseInt(cat) : cat
  )
  
  // Emit the bundle data
  setTimeout(() => {
    emit('bundle-created', finalBundle)
    isSubmitting.value = false
  }, 500)
}

// Auto-generate SEO fields based on name
watch(() => bundleData.name, (newName) => {
  if (newName && !bundleData.seo.title) {
    bundleData.seo.title = newName
  }
  
  if (newName && !bundleData.seo.slug) {
    bundleData.seo.slug = generateSlug(newName)
  }
})
</script>

<style>
/* Custom styles for vue-multiselect to match your UI */
.multiselect-custom {
  border-radius: 0.375rem;
  min-height: 38px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.multiselect-custom.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f8fafc;
}

.multiselect-custom .multiselect__tags {
  min-height: 38px;
  padding: 6px 40px 0 8px;
  border-radius: 0.375rem;
  border: none;
  background: transparent;
}

.multiselect-custom .multiselect__tag {
  background: #e2e8f0;
  color: #334155;
  margin-bottom: 4px;
  padding: 4px 26px 4px 10px;
  border-radius: 4px;
}

.multiselect-custom .multiselect__tag-icon {
  line-height: 1.8;
}

.multiselect-custom .multiselect__tag-icon:after {
  color: #64748b;
}

.multiselect-custom .multiselect__tag-icon:hover {
  background: #cbd5e1;
}

.multiselect-custom .multiselect__tag-icon:hover:after {
  color: #334155;
}

.multiselect-custom .multiselect__placeholder {
  color: #94a3b8;
  margin-bottom: 6px;
  padding-top: 0;
  padding-left: 2px;
}

.multiselect-custom .multiselect__input,
.multiselect-custom .multiselect__single {
  background: transparent;
  margin-bottom: 6px;
}

.multiselect-custom .multiselect__content-wrapper {
  border: 1px solid #e2e8f0;
  border-top: none;
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.multiselect-custom .multiselect__option {
  padding: 10px 12px;
}

.multiselect-custom .multiselect__option--highlight {
  background: #f1f5f9;
  color: #0f172a;
}

.multiselect-custom .multiselect__option--selected {
  background: #dbeafe;
  color: #1e40af;
  font-weight: 500;
}

.multiselect-custom .multiselect__option--selected.multiselect__option--highlight {
  background: #bfdbfe;
  color: #1e40af;
}
</style>