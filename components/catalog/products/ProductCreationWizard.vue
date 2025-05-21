<template>
  <SheetContent class="sm:max-w-lg flex flex-col h-full overflow-hidden">
    <SheetHeader class="flex-shrink-0">
      <SheetTitle>{{ isLastStep ? 'Review Product' : `New Product - ${currentStepTitle}` }}</SheetTitle>
      <SheetDescription>
        Create a new product for your catalog.
        Required fields are marked with an asterisk (*).
      </SheetDescription>
    </SheetHeader>

    <div class="flex-1 overflow-y-auto py-6 px-1">
      <div v-if="!isLastStep" class="mb-6">
        <div class="w-full">
          <!-- Stepper header with step titles -->
          <div class="flex justify-between mb-2">
            <div
              v-for="(step, index) in steps"
              :key="step.id"
              class="text-center flex-1 relative"
              :class="{ 'cursor-pointer': index <= currentStep }"
              @click="index <= currentStep && goToStep(index)"
            >
              <span
                class="text-sm font-medium"
                :class="
                  index === currentStep
                    ? 'text-primary'
                    : index < currentStep
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                "
              >
                {{ step.title }}
              </span>
            </div>
          </div>

          <!-- Stepper progress bar -->
          <div class="relative flex items-center w-full">
            <!-- Step indicators -->
            <div class="flex w-full justify-between">
              <div
                v-for="(step, index) in steps"
                :key="`indicator-${step.id}`"
                class="flex flex-col items-center"
              >
                <!-- Step indicator circle -->
                <div
                  class="rounded-full h-8 w-8 flex items-center justify-center border transition-colors z-10"
                  :class="{
                    'bg-primary border-primary text-primary-foreground': index === currentStep,
                    'bg-primary-foreground border-primary text-primary': index < currentStep,
                    'bg-background border-muted text-muted-foreground': index > currentStep
                  }"
                  :aria-current="index === currentStep ? 'step' : null"
                >
                  <span v-if="index < currentStep" class="text-xs">✓</span>
                  <span v-else class="text-xs">{{ index + 1 }}</span>
                </div>

                <!-- Step description (only show for current step) -->
                <span
                  v-if="index === currentStep"
                  class="text-xs text-muted-foreground mt-1 absolute top-full whitespace-nowrap"
                >
                  {{ step.description }}
                </span>
              </div>
            </div>

            <!-- Connecting lines -->
            <div class="absolute top-4 left-0 w-full transform -translate-y-1/2">
              <div class="h-0.5 bg-muted"></div>
            </div>

            <!-- Active progress bar -->
            <div class="absolute top-4 left-0 transform -translate-y-1/2">
              <div
                class="h-0.5 bg-primary transition-all"
                :style="`width: ${(currentStep / (steps.length - 1)) * 100}%`"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <form @submit.prevent="nextStep" class="space-y-6">
        <!-- Step 1: Basic Information -->
        <div v-if="currentStep === 0">
          <div class="space-y-6">
            <!-- Product Type Selection -->
            <div class="space-y-3">
              <Label>Product Type <span class="text-destructive">*</span></Label>
              <RadioGroup v-model="productData.type" class="flex space-x-4">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="simple" id="simple" />
                  <Label for="simple">Simple Product</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="configurable" id="configurable" />
                  <Label for="configurable">Configurable Product</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="bundle" id="bundle" />
                  <Label for="bundle">Bundle</Label>
                </div>
              </RadioGroup>
              <p v-if="errors.type" class="text-sm text-destructive">{{ errors.type }}</p>
            </div>

            <!-- Basic Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="productName">Product Name <span class="text-destructive">*</span></Label>
                <Input
                  id="productName"
                  v-model="productData.name"
                  :class="{ 'border-destructive': errors.name }"
                />
                <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
              </div>

              <div class="space-y-2">
                <Label for="sku">SKU <span class="text-destructive">*</span></Label>
                <Input
                  id="sku"
                  v-model="productData.sku"
                  :class="{ 'border-destructive': errors.sku }"
                />
                <p v-if="errors.sku" class="text-sm text-destructive">{{ errors.sku }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="productDescription">Description <span class="text-destructive">*</span></Label>
              <Textarea
                id="productDescription"
                v-model="productData.description"
                rows="4"
                :class="{ 'border-destructive': errors.description }"
              />
              <p v-if="errors.description" class="text-sm text-destructive">{{ errors.description }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="price">Price ($) <span class="text-destructive">*</span></Label>
                <Input
                  id="price"
                  v-model="productData.price"
                  type="number"
                  step="0.01"
                  :class="{ 'border-destructive': errors.price }"
                />
                <p v-if="errors.price" class="text-sm text-destructive">{{ errors.price }}</p>
              </div>

              <div class="space-y-2">
                <Label for="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  v-model="productData.cost"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="status">Status <span class="text-destructive">*</span></Label>
              <Select v-model="productData.status">
                <SelectTrigger id="status" :class="{ 'border-destructive': errors.status }">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.status" class="text-sm text-destructive">{{ errors.status }}</p>
            </div>
          </div>
        </div>

        <!-- Step 2: Categories & Attributes -->
        <div v-if="currentStep === 1">
          <div class="space-y-6">
            <div class="space-y-3">
              <Label>Categories <span class="text-destructive">*</span></Label>
              <div class="max-h-60 overflow-y-auto border rounded-md p-2">
                <div
                  v-for="category in categories"
                  :key="category.id"
                  class="flex items-center space-x-2 py-1"
                >
                  <Checkbox
                    :id="`category-${category.id}`"
                    :checked="productData.categories.includes(category.id)"
                    @update:checked="toggleCategory(category.id)"
                  />
                  <Label :for="`category-${category.id}`" class="text-sm">{{ category.name }}</Label>
                </div>
              </div>
              <p v-if="errors.categories" class="text-sm text-destructive">{{ errors.categories }}</p>
            </div>

            <div class="space-y-2">
              <Label>Attributes</Label>
              <div class="border rounded-md p-3 space-y-4">
                <div v-for="attribute in attributes" :key="attribute.id" class="space-y-2">
                  <Label :for="`attr-${attribute.code}`">{{ attribute.name }}</Label>

                  <Select
                    v-if="attribute.type === 'select'"
                    v-model="productData.attributes[attribute.code]"
                  >
                    <SelectTrigger :id="`attr-${attribute.code}`">
                      <SelectValue :placeholder="`Select ${attribute.name.toLowerCase()}`" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="option in attribute.options"
                        :key="option.id"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Switch
                    v-else-if="attribute.type === 'boolean'"
                    :id="`attr-${attribute.code}`"
                    v-model="productData.attributes[attribute.code]"
                  />

                  <Input
                    v-else
                    :id="`attr-${attribute.code}`"
                    v-model="productData.attributes[attribute.code]"
                    :placeholder="`Enter ${attribute.name.toLowerCase()}`"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Images & Media -->
        <div v-if="currentStep === 2">
          <div class="space-y-6">
            <div class="space-y-3">
              <Label>Product Images</Label>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="(image, index) in productData.images"
                  :key="index"
                  class="border rounded-md p-3 relative"
                >
                  <div class="flex mb-2">
                    <div class="h-24 w-24 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                      <img
                        v-if="image.url"
                        :src="image.url"
                        :alt="image.alt || 'Product image'"
                        class="h-full w-full object-cover"
                      />
                      <ImageIcon v-else class="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div class="ml-3 flex-1">
                      <Input
                        v-model="image.url"
                        placeholder="Image URL"
                        class="mb-2"
                      />
                      <Input
                        v-model="image.alt"
                        placeholder="Alt text"
                      />
                    </div>
                  </div>

                  <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                      <Checkbox
                        :id="`default-image-${index}`"
                        :checked="image.isDefault"
                        @update:checked="setDefaultImage(index)"
                      />
                      <Label :for="`default-image-${index}`" class="text-sm">Default image</Label>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      @click="removeImage(index)"
                    >
                      <TrashIcon class="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                @click="addImage"
                class="mt-2"
              >
                <PlusIcon class="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </div>
          </div>
        </div>

        <!-- Step 4: Inventory & Stock -->
        <div v-if="currentStep === 3">
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="quantity">Quantity <span class="text-destructive">*</span></Label>
                <Input
                  id="quantity"
                  v-model="productData.stock.quantity"
                  type="number"
                  :class="{ 'border-destructive': errors['stock.quantity'] }"
                />
                <p v-if="errors['stock.quantity']" class="text-sm text-destructive">{{ errors['stock.quantity'] }}</p>
              </div>

              <div class="space-y-2">
                <Label for="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  v-model="productData.stock.lowStockThreshold"
                  type="number"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="backorder">Allow Backorders</Label>
                <div class="flex items-center space-x-2">
                  <Switch
                    id="backorder"
                    v-model="productData.stock.backorder"
                  />
                  <Label for="backorder">Enable backorders</Label>
                </div>
              </div>
            </div>

            <div v-if="productData.type === 'configurable'" class="space-y-3">
              <h4 class="text-sm font-medium">Variant Inventory</h4>
              <p class="text-xs text-muted-foreground">
                You'll be able to manage inventory for variants after creating the product.
              </p>
            </div>
          </div>
        </div>

        <!-- Step 5: SEO & Visibility -->
        <div v-if="currentStep === 4">
          <div class="space-y-6">
            <div class="space-y-2">
              <Label for="seoTitle">Meta Title</Label>
              <Input
                id="seoTitle"
                v-model="productData.seo.title"
                placeholder="SEO title (leave empty to use product name)"
              />
            </div>

            <div class="space-y-2">
              <Label for="seoMetaDescription">Meta Description</Label>
              <Textarea
                id="seoMetaDescription"
                v-model="productData.seo.metaDescription"
                rows="3"
                placeholder="SEO meta description"
              />
            </div>

            <div class="space-y-2">
              <Label for="seoSlug">URL Slug</Label>
              <Input
                id="seoSlug"
                v-model="productData.seo.slug"
                placeholder="product-url-slug (leave empty to auto-generate)"
              />
            </div>

            <div class="space-y-3">
              <Label>Visibility</Label>

              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="visibilityWebstore"
                    v-model:checked="productData.visibility.webstore"
                  />
                  <Label for="visibilityWebstore">Web store</Label>
                </div>

                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="visibilityB2b"
                    v-model:checked="productData.visibility.b2bPortal"
                  />
                  <Label for="visibilityB2b">B2B portal</Label>
                </div>

                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="visibilityMarketplace"
                    v-model:checked="productData.visibility.marketplace"
                  />
                  <Label for="visibilityMarketplace">Marketplace</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Review Step -->
        <div v-if="isLastStep">
          <div class="space-y-6">
            <div class="rounded-lg border p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Basic Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-muted-foreground">Product Type:</p>
                  <p>{{ formatProductType(productData.type) }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">SKU:</p>
                  <p>{{ productData.sku }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Name:</p>
                  <p>{{ productData.name }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Status:</p>
                  <p>{{ formatStatus(productData.status) }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Price:</p>
                  <p>${{ parseFloat(productData.price).toFixed(2) }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Cost:</p>
                  <p>${{ parseFloat(productData.cost || 0).toFixed(2) }}</p>
                </div>
              </div>
            </div>

            <div class="rounded-lg border p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Categories</h4>
              <div class="flex flex-wrap gap-2">
                <Badge
                  v-for="categoryId in productData.categories"
                  :key="categoryId"
                  variant="secondary"
                >
                  {{ getCategoryName(categoryId) }}
                </Badge>
                <p v-if="!productData.categories.length" class="text-sm text-muted-foreground">
                  No categories selected
                </p>
              </div>
            </div>

            <div class="rounded-lg border p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Stock Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-muted-foreground">Quantity:</p>
                  <p>{{ productData.stock.quantity || 0 }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Allow Backorders:</p>
                  <p>{{ productData.stock.backorder ? 'Yes' : 'No' }}</p>
                </div>
              </div>
            </div>

            <div class="rounded-lg border p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Description</h4>
              <p class="text-sm">{{ productData.description }}</p>
            </div>
          </div>
        </div>
      </form>
    </div>

    <SheetFooter class="flex-shrink-0 border-t pt-4">
      <div class="flex justify-between w-full">
        <Button
          v-if="!isFirstStep"
          variant="outline"
          @click="prevStep"
        >
          Back
        </Button>
        <div v-else></div>

        <div>
          <Button
            variant="outline"
            class="mr-2"
            @click="emit('close')"
          >
            Cancel
          </Button>
          <Button
            v-if="!isLastStep"
            type="submit"
            @click="nextStep"
          >
            Continue
          </Button>
          <Button
            v-else
            type="submit"
            @click="createProduct"
            :disabled="isSubmitting"
          >
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Create Product
          </Button>
        </div>
      </div>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
// import { Steps, Step } from '@/components/ui/steps'
import { Badge } from '@/components/ui/badge'
import {
  PlusIcon,
  TrashIcon,
  ImageIcon,
  Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  attributes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['product-created', 'close'])

// Wizard steps
const steps = [
  {
    id: 'basics',
    title: 'Basic Information',
    description: 'Name, type, price',
    isValid: false
  },
  {
    id: 'categories',
    title: 'Categories & Attributes',
    description: 'Categories and product attributes',
    isValid: false
  },
  {
    id: 'images',
    title: 'Images & Media',
    description: 'Product images and videos',
    isValid: true // Optional step
  },
  {
    id: 'inventory',
    title: 'Inventory',
    description: 'Stock and availability',
    isValid: false
  },
  {
    id: 'seo',
    title: 'SEO & Visibility',
    description: 'Meta data and visibility settings',
    isValid: true // Optional step
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Review and create',
    isValid: true
  }
]

// Form state
const currentStep = ref(0)
const errors = reactive({})
const isSubmitting = ref(false)

// Default product data
const productData = reactive({
  name: '',
  sku: '',
  description: '',
  price: '',
  cost: '',
  type: 'simple',
  status: 'draft',
  categories: [],
  attributes: {},
  images: [
    {
      url: '',
      alt: '',
      isDefault: true
    }
  ],
  stock: {
    quantity: 0,
    reserved: 0,
    available: 0,
    backorder: false,
    lowStockThreshold: 5
  },
  seo: {
    title: '',
    metaDescription: '',
    slug: ''
  },
  visibility: {
    webstore: true,
    b2bPortal: false,
    marketplace: false
  }
})

// Computed properties
const isFirstStep = computed(() => currentStep.value === 0)
const isLastStep = computed(() => currentStep.value === steps.length - 1)

const currentStepTitle = computed(() => {
  return steps[currentStep.value]?.title || ''
})

// Helper functions
function formatStatus(status) {
  if (!status) return 'Unknown'
  
  const statusMap = {
    'active': 'Active',
    'draft': 'Draft',
    'archived': 'Archived',
    'out_of_stock': 'Out of Stock'
  }
  
  return statusMap[status] || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatProductType(type) {
  if (!type) return 'Unknown'
  
  const typeMap = {
    'simple': 'Simple Product',
    'configurable': 'Configurable Product',
    'bundle': 'Bundle'
  }
  
  return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getCategoryName(categoryId) {
  const category = props.categories.find(c => c.id === categoryId)
  return category ? category.name : `Category ${categoryId}`
}

function toggleCategory(categoryId) {
  const index = productData.categories.indexOf(categoryId)
  if (index === -1) {
    productData.categories.push(categoryId)
  } else {
    productData.categories.splice(index, 1)
  }
}

function getStepStatus(index) {
  if (index < currentStep.value) return 'complete'
  if (index === currentStep.value) return 'current'
  return 'upcoming'
}

function goToStep(index) {
  // Only allow navigation to completed steps or current step
  if (index <= currentStep.value) {
    currentStep.value = index
  }
}

function addImage() {
  productData.images.push({
    url: '',
    alt: '',
    isDefault: false
  })
}

function removeImage(index) {
  // Don't remove last image
  if (productData.images.length <= 1) return
  
  const wasDefault = productData.images[index].isDefault
  productData.images.splice(index, 1)
  
  // If we removed the default image, make the first one default
  if (wasDefault && productData.images.length > 0) {
    productData.images[0].isDefault = true
  }
}

function setDefaultImage(index) {
  // Reset all images to non-default
  productData.images.forEach((image, idx) => {
    image.isDefault = idx === index
  })
}

// Validation functions
function validateBasicInfo() {
  const newErrors = {}
  
  if (!productData.name.trim()) {
    newErrors.name = 'Product name is required'
  }
  
  if (!productData.sku.trim()) {
    newErrors.sku = 'SKU is required'
  }
  
  if (!productData.description.trim()) {
    newErrors.description = 'Description is required'
  }
  
  if (!productData.price) {
    newErrors.price = 'Price is required'
  } else if (isNaN(parseFloat(productData.price)) || parseFloat(productData.price) < 0) {
    newErrors.price = 'Price must be a positive number'
  }
  
  if (productData.cost && (isNaN(parseFloat(productData.cost)) || parseFloat(productData.cost) < 0)) {
    newErrors.cost = 'Cost must be a positive number'
  }
  
  if (!productData.status) {
    newErrors.status = 'Status is required'
  }
  
  if (!productData.type) {
    newErrors.type = 'Product type is required'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

function validateCategoriesAndAttributes() {
  const newErrors = {}
  
  if (!productData.categories.length) {
    newErrors.categories = 'At least one category must be selected'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

function validateInventory() {
  const newErrors = {}
  
  if (productData.stock.quantity === null || productData.stock.quantity === undefined) {
    newErrors['stock.quantity'] = 'Quantity is required'
  } else if (isNaN(parseInt(productData.stock.quantity)) || parseInt(productData.stock.quantity) < 0) {
    newErrors['stock.quantity'] = 'Quantity must be a non-negative number'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Step navigation
function nextStep() {
  let isValid = true
  
  // Validate current step
  if (currentStep.value === 0) {
    isValid = validateBasicInfo()
  } else if (currentStep.value === 1) {
    isValid = validateCategoriesAndAttributes()
  } else if (currentStep.value === 3) {
    isValid = validateInventory()
  }
  
  if (isValid) {
    steps[currentStep.value].isValid = true
    if (currentStep.value < steps.length - 1) {
      currentStep.value++
    }
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

async function createProduct() {
  // Validate all required steps
  if (!validateBasicInfo() || !validateCategoriesAndAttributes() || !validateInventory()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Calculate available stock
    productData.stock.available = parseInt(productData.stock.quantity) - (productData.stock.reserved || 0)
    
    // Generate slug if not provided
    if (!productData.seo.slug) {
      productData.seo.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }
    
    // Generate meta title if not provided
    if (!productData.seo.title) {
      productData.seo.title = productData.name
    }
    
    // Add timestamps
    const now = new Date().toISOString()
    productData.createdAt = now
    productData.updatedAt = now
    
    // Emit event to create product
    emit('product-created', { ...productData })
  } catch (error) {
    console.error('Error creating product:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>