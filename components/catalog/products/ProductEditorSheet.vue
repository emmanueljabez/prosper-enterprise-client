<template>
  <SheetContent class="sm:max-w-lg flex flex-col h-full overflow-hidden">
    <SheetHeader class="flex-shrink-0">
      <SheetTitle>Edit Product</SheetTitle>
      <SheetDescription>
        Update details for {{ productData.name }}.
        Required fields are marked with an asterisk (*).
      </SheetDescription>
    </SheetHeader>

    <div class="flex-1 overflow-y-auto py-6 px-1">
      <Tabs defaultValue="basic" class="w-full">
        <TabsList class="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        
        <!-- Basic Information Tab -->
        <TabsContent value="basic" class="space-y-6">
          <div class="space-y-4">
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
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.status" class="text-sm text-destructive">{{ errors.status }}</p>
            </div>

            <div v-if="productData.status === 'out_of_stock'" class="space-y-2">
              <Label for="statusReason">Reason (optional)</Label>
              <Textarea
                id="statusReason"
                v-model="productData.statusReason"
                rows="2"
                placeholder="Reason why the product is out of stock"
              />
            </div>
          </div>
        </TabsContent>
        
        <!-- Categories Tab -->
        <TabsContent value="categories" class="space-y-6">
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
        </TabsContent>
        
        <!-- Images Tab -->
        <TabsContent value="images" class="space-y-6">
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
        </TabsContent>
        
        <!-- Inventory Tab -->
        <TabsContent value="inventory" class="space-y-6">
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
                <Label for="reserved">Reserved</Label>
                <Input
                  id="reserved"
                  v-model="productData.stock.reserved"
                  type="number"
                />
              </div>

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
              <Alert variant="info">
                <AlertTitle>Variant Inventory</AlertTitle>
                <AlertDescription>
                  To manage inventory for individual variants, use the Variant Manager.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>
        
        <!-- SEO & Visibility Tab -->
        <TabsContent value="seo" class="space-y-6">
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
                placeholder="product-url-slug"
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
        </TabsContent>
      </Tabs>
    </div>

    <SheetFooter class="flex-shrink-0 border-t pt-4">
      <div class="flex justify-between w-full">
        <Button 
          variant="outline" 
          class="text-destructive hover:text-destructive"
          @click="$emit('close')"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          @click="updateProduct"
          :disabled="isSubmitting"
        >
          <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          Save Changes
        </Button>
      </div>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import {
  PlusIcon,
  TrashIcon,
  ImageIcon,
  Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  },
  attributes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['product-updated', 'close'])

// Clone the product to avoid direct mutations
const productData = reactive(JSON.parse(JSON.stringify(props.product)))

// Form state
const errors = reactive({})
const isSubmitting = ref(false)

// Helper functions
function toggleCategory(categoryId) {
  const index = productData.categories.indexOf(categoryId)
  if (index === -1) {
    productData.categories.push(categoryId)
  } else {
    productData.categories.splice(index, 1)
  }
}

function addImage() {
  productData.images.push({
    url: '',
    alt: '',
    isDefault: false,
    sortOrder: productData.images.length
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
  
  // Update sort orders
  productData.images.forEach((image, idx) => {
    image.sortOrder = idx
  })
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
  
  return newErrors
}

function validateCategoriesAndAttributes() {
  const newErrors = {}
  
  if (!productData.categories.length) {
    newErrors.categories = 'At least one category must be selected'
  }
  
  return newErrors
}

function validateInventory() {
  const newErrors = {}
  
  if (productData.stock.quantity === null || productData.stock.quantity === undefined) {
    newErrors['stock.quantity'] = 'Quantity is required'
  } else if (isNaN(parseInt(productData.stock.quantity)) || parseInt(productData.stock.quantity) < 0) {
    newErrors['stock.quantity'] = 'Quantity must be a non-negative number'
  }
  
  if (productData.stock.reserved && (isNaN(parseInt(productData.stock.reserved)) || parseInt(productData.stock.reserved) < 0)) {
    newErrors['stock.reserved'] = 'Reserved quantity must be a non-negative number'
  }
  
  return newErrors
}

function validateAll() {
  const basicErrors = validateBasicInfo()
  const categoryErrors = validateCategoriesAndAttributes()
  const inventoryErrors = validateInventory()
  
  Object.assign(errors, {
    ...basicErrors,
    ...categoryErrors,
    ...inventoryErrors
  })
  
  return Object.keys(errors).length === 0
}

async function updateProduct() {
  if (!validateAll()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Calculate available stock
    productData.stock.available = parseInt(productData.stock.quantity) - (parseInt(productData.stock.reserved) || 0)
    
    // Generate slug if not provided
    if (!productData.seo.slug) {
      productData.seo.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }
    
    // Update timestamp
    productData.updatedAt = new Date().toISOString()
    
    // Emit event to update product
    emit('product-updated', { ...productData })
  } catch (error) {
    console.error('Error updating product:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>