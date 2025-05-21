<template>
  <DialogContent class="sm:max-w-4xl">
    <DialogHeader>
      <DialogTitle class="text-xl">{{ product.name }}</DialogTitle>
      <DialogDescription>
        SKU: {{ product.sku }} 
        <Badge class="ml-2" :variant="getStatusVariant(product.status)">{{ formatStatus(product.status) }}</Badge>
      </DialogDescription>
    </DialogHeader>

    <div class="overflow-y-auto max-h-[70vh]">
      <Tabs defaultValue="details" class="w-full">
        <TabsList class="grid w-full grid-cols-5">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
        </TabsList>
        
        <!-- Details Tab -->
        <TabsContent value="details" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-4">
              <div>
                <h4 class="text-sm font-medium mb-1 text-muted-foreground">Product Type</h4>
                <p>{{ formatProductType(product.type) }}</p>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-1 text-muted-foreground">Price</h4>
                <p class="text-lg font-semibold">${{ formatPrice(product.price) }}</p>
              </div>
              <div v-if="product.cost">
                <h4 class="text-sm font-medium mb-1 text-muted-foreground">Cost</h4>
                <p>${{ formatPrice(product.cost) }}</p>
              </div>
              <div v-if="product.tax">
                <h4 class="text-sm font-medium mb-1 text-muted-foreground">Tax</h4>
                <p>{{ product.tax.class }} ({{ product.tax.rate }}%)</p>
              </div>
            </div>
            <div>
              <div v-if="product.type === 'configurable'">
                <div class="border rounded-md p-3 bg-muted/30">
                  <h4 class="font-medium mb-2">Configurable Product</h4>
                  <p class="text-sm text-muted-foreground mb-2">
                    This product has {{ (product.variants || []).length }} variants
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    @click="manageVariants"
                  >
                    <LayersIcon class="h-4 w-4 mr-2" />
                    Manage Variants
                  </Button>
                </div>
              </div>
              <div v-if="product.type === 'bundle'">
                <div class="border rounded-md p-3 bg-muted/30">
                  <h4 class="font-medium mb-2">Bundle Items</h4>
                  <ul class="space-y-2">
                    <li v-for="item in product.bundleItems" :key="item.productId" class="text-sm flex justify-between">
                      <span>{{ item.name }} ({{ item.quantity }})</span>
                      <Badge v-if="item.isRequired" variant="outline">Required</Badge>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium mb-2 text-muted-foreground">Description</h4>
            <div class="border rounded-md p-4 bg-muted/20">
              <p class="whitespace-pre-line">{{ product.description }}</p>
            </div>
          </div>

          <div v-if="product.seo" class="border rounded-md p-4 bg-muted/30">
            <h4 class="font-medium mb-2">SEO Information</h4>
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-muted-foreground">Meta Title:</p>
                <p>{{ product.seo.title }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">URL Slug:</p>
                <p>{{ product.seo.slug }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Meta Description:</p>
                <p>{{ product.seo.metaDescription }}</p>
              </div>
            </div>
          </div>

          <div v-if="product.dimensions" class="border rounded-md p-4 bg-muted/30">
            <h4 class="font-medium mb-2">Dimensions & Weight</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-muted-foreground">Weight:</p>
                <p>{{ product.dimensions.weight }} {{ product.dimensions.unit === 'in' ? 'lbs' : 'kg' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Length:</p>
                <p>{{ product.dimensions.length }} {{ product.dimensions.unit }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Width:</p>
                <p>{{ product.dimensions.width }} {{ product.dimensions.unit }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Height:</p>
                <p>{{ product.dimensions.height }} {{ product.dimensions.unit }}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border rounded-md p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Dates</h4>
              <div class="space-y-2 text-sm">
                <div>
                  <p class="text-muted-foreground">Created:</p>
                  <p>{{ formatDate(product.createdAt) }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Last Updated:</p>
                  <p>{{ formatDate(product.updatedAt) }}</p>
                </div>
              </div>
            </div>
            <div class="border rounded-md p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Visibility</h4>
              <div v-if="product.visibility" class="space-y-1 text-sm">
                <div class="flex items-center">
                  <CheckIcon v-if="product.visibility.webstore" class="h-4 w-4 text-success mr-2" />
                  <XIcon v-else class="h-4 w-4 text-muted-foreground mr-2" />
                  <span>Web Store</span>
                </div>
                <div class="flex items-center">
                  <CheckIcon v-if="product.visibility.b2bPortal" class="h-4 w-4 text-success mr-2" />
                  <XIcon v-else class="h-4 w-4 text-muted-foreground mr-2" />
                  <span>B2B Portal</span>
                </div>
                <div class="flex items-center">
                  <CheckIcon v-if="product.visibility.marketplace" class="h-4 w-4 text-success mr-2" />
                  <XIcon v-else class="h-4 w-4 text-muted-foreground mr-2" />
                  <span>Marketplace</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <!-- Images Tab -->
        <TabsContent value="images" class="space-y-4">
          <div v-if="product.images && product.images.length > 0">
            <div class="mb-4">
              <div class="border rounded-md overflow-hidden bg-muted/40 flex justify-center">
                <img 
                  :src="selectedImage?.url || product.images[0].url" 
                  :alt="selectedImage?.alt || product.images[0].alt"
                  class="max-h-[400px] object-contain p-4"
                />
              </div>
            </div>
            <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
              <div 
                v-for="(image, index) in product.images" 
                :key="index"
                class="cursor-pointer border rounded-md overflow-hidden relative hover:border-primary transition-all"
                :class="{ 'ring-2 ring-primary': selectedImage === image }"
                @click="selectedImage = image"
              >
                <div class="aspect-square">
                  <img 
                    :src="image.url" 
                    :alt="image.alt" 
                    class="w-full h-full object-cover"
                  />
                </div>
                <Badge 
                  v-if="image.isDefault" 
                  class="absolute top-1 left-1" 
                  variant="secondary"
                  size="sm"
                >
                  Default
                </Badge>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <ImageOffIcon class="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p class="text-muted-foreground">No images available for this product.</p>
          </div>
        </TabsContent>
        
        <!-- Inventory Tab -->
        <TabsContent value="inventory" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader class="pb-2">
                <CardTitle class="text-base">Total Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ product.stock?.quantity || 0 }}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="pb-2">
                <CardTitle class="text-base">Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ product.stock?.available || 0 }}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="pb-2">
                <CardTitle class="text-base">Reserved</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ product.stock?.reserved || 0 }}</div>
              </CardContent>
            </Card>
          </div>
          
          <div class="border rounded-md p-4 bg-muted/30">
            <h4 class="font-medium mb-2">Stock Settings</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-muted-foreground">Low Stock Threshold:</p>
                <p>{{ product.stock?.lowStockThreshold || 'Not set' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Backorders:</p>
                <p>{{ product.stock?.backorder ? 'Allowed' : 'Not allowed' }}</p>
              </div>
            </div>
          </div>
          
          <div v-if="product.type === 'configurable' && product.variants?.length" class="border rounded-md p-4">
            <h4 class="font-medium mb-2">Variant Inventory</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="variant in product.variants" :key="variant.id">
                  <TableCell>{{ variant.name }}</TableCell>
                  <TableCell>{{ variant.sku }}</TableCell>
                  <TableCell>{{ variant.stock?.quantity || 0 }}</TableCell>
                  <TableCell>
                    <div class="flex items-center space-x-2">
                      <span>{{ variant.stock?.available || 0 }}</span>
                      <Badge 
                        v-if="isLowStock(variant)" 
                        variant="warning"
                      >
                        Low
                      </Badge>
                      <Badge 
                        v-if="!variant.stock?.available" 
                        variant="destructive"
                      >
                        Out
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <!-- Categories Tab -->
        <TabsContent value="categories" class="space-y-4">
          <div class="border rounded-md p-4">
            <h4 class="font-medium mb-3">Product Categories</h4>
            <div v-if="productCategories.length > 0" class="space-y-2">
              <div 
                v-for="category in productCategories" 
                :key="category.id" 
                class="flex items-center p-2 border rounded-md"
              >
                <FolderIcon class="h-5 w-5 text-muted-foreground mr-2" />
                <span>{{ category.name }}</span>
                <Badge v-if="category.parent" variant="outline" class="ml-2">
                  Sub-category
                </Badge>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <p class="text-muted-foreground">No categories assigned to this product.</p>
            </div>
          </div>
        </TabsContent>
        
        <!-- Attributes Tab -->
        <TabsContent value="attributes" class="space-y-4">
          <div class="border rounded-md p-4">
            <h4 class="font-medium mb-3">Product Attributes</h4>
            <div v-if="Object.keys(product.attributes || {}).length > 0" class="space-y-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attribute</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(value, key) in product.attributes" :key="key">
                    <TableCell class="font-medium">
                      {{ formatAttributeName(key) }}
                    </TableCell>
                    <TableCell>
                      <Badge v-if="typeof value === 'boolean'" :variant="value ? 'default' : 'outline'">
                        {{ value ? 'Yes' : 'No' }}
                      </Badge>
                      <span v-else>{{ value }}</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div v-else class="text-center py-4">
              <p class="text-muted-foreground">No attributes defined for this product.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>

    <DialogFooter class="flex justify-between">
      <div>
        <Button variant="outline" @click="deleteProduct" class="text-destructive hover:text-destructive">
          <TrashIcon class="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
      <div class="space-x-2">
        <Button variant="outline" @click="$emit('close')">
          Close
        </Button>
        <Button @click="editProduct">
          <PencilIcon class="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import {
  CheckIcon,
  FolderIcon,
  ImageOffIcon,
  LayersIcon,
  PencilIcon,
  TrashIcon,
  XIcon
} from 'lucide-vue-next'
import {
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'edit-product', 'delete-product', 'manage-variants'])

// UI state
const selectedImage = ref(props.product.images?.find(img => img.isDefault) || props.product.images?.[0] || null)

// Computed
const productCategories = computed(() => {
  if (!props.product.categories || !props.categories) return []
  
  return props.product.categories
    .map(categoryId => props.categories.find(c => c.id === categoryId))
    .filter(Boolean)
})

// Helper functions
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  
  try {
    return format(new Date(dateString), 'PPp')
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

function formatPrice(price) {
  return parseFloat(price).toFixed(2)
}

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

function getStatusVariant(status) {
  const variants = {
    'active': 'success',
    'draft': 'secondary',
    'archived': 'outline',
    'out_of_stock': 'destructive'
  }
  return variants[status] || 'default'
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

function formatAttributeName(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ')
}

function isLowStock(product) {
  if (!product.stock) return false
  
  const lowStockThreshold = product.stock.lowStockThreshold || 10
  return product.stock.available > 0 && product.stock.available <= lowStockThreshold
}

// Action handlers
function editProduct() {
  emit('edit-product', props.product)
}

function deleteProduct() {
  emit('delete-product', props.product)
}

function manageVariants() {
  emit('manage-variants', props.product)
}
</script>