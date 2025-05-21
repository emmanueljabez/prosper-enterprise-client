<template>
  <DialogContent class="sm:max-w-[900px]">
    <DialogHeader>
      <DialogTitle>Manage Bundle Components</DialogTitle>
      <DialogDescription>
        Add, remove, and configure the products in this bundle.
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-4 space-y-4">
      <!-- Bundle Info Summary -->
      <div class="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
        <div class="h-16 w-16 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
          <img
            v-if="getBundleImage()"
            :src="getBundleImage()"
            :alt="bundle.name"
            class="h-full w-full object-cover"
          />
          <PackageIcon v-else class="h-8 w-8 text-muted-foreground" />
        </div>
        
        <div class="flex-1">
          <h3 class="text-lg font-semibold">{{ bundle.name }}</h3>
          <p class="text-sm text-muted-foreground">SKU: {{ bundle.sku }}</p>
          <div class="mt-1 flex items-center gap-2">
            <Badge>{{ bundle.bundleItems?.length || 0 }} components</Badge>
            <Badge variant="outline">{{ formatPrice(bundle.price) }}</Badge>
          </div>
        </div>
        
        <Button size="sm" variant="outline" @click="showProductSelector = true">
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Products
        </Button>
      </div>
      
      <!-- Bundle Items List -->
      <div class="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Variable</TableHead>
              <TableHead>Price</TableHead>
              <TableHead class="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="bundleItems.length === 0">
              <TableCell colspan="6" class="h-24 text-center">
                <div class="flex flex-col items-center justify-center">
                  <PackageIcon class="h-8 w-8 text-muted-foreground mb-2" />
                  <p class="text-sm text-muted-foreground">No products in this bundle yet.</p>
                  <Button variant="outline" size="sm" class="mt-2" @click="showProductSelector = true">
                    <PlusIcon class="h-4 w-4 mr-2" />
                    Add Products
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow 
              v-for="(item, index) in bundleItems" 
              :key="index"
              class="group"
            >
              <TableCell>
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      v-if="getProductImage(item.productId)"
                      :src="getProductImage(item.productId)"
                      :alt="getProductName(item.productId)"
                      class="h-full w-full object-cover"
                    />
                    <PackageIcon v-else class="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div class="font-medium">{{ getProductName(item.productId) }}</div>
                    <div class="text-xs text-muted-foreground">SKU: {{ getProductSku(item.productId) }}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Input 
                  v-model="item.quantity" 
                  type="number"
                  min="1" 
                  class="w-16 h-8"
                />
              </TableCell>
              <TableCell>
                <Checkbox v-model="item.isRequired" />
              </TableCell>
              <TableCell>
                <div class="space-y-1">
                  <Checkbox 
                    v-model="item.isVariable"
                    :disabled="!hasVariantOptions(item.productId)"
                  />
                  
                  <!-- Variant selection for variable items -->
                  <Select 
                    v-if="item.isVariable && hasVariantOptions(item.productId)"
                    v-model="item.variantId"
                    class="w-40"
                  >
                    <SelectTrigger class="h-8">
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                        v-for="variant in getProductVariants(item.productId)" 
                        :key="variant.id" 
                        :value="variant.id"
                      >
                        {{ variant.name || variant.sku || 'Variant' }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
              <TableCell>
                {{ formatPrice(getProductPrice(item.productId, item.variantId)) }}
              </TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="icon" @click="removeItem(index)">
                  <Trash2Icon class="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      <!-- Product Selector Dialog -->
      <Dialog v-model:open="showProductSelector">
        <DialogContent class="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Products to Bundle</DialogTitle>
            <DialogDescription>
              Select products to add to your bundle.
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
                        :checked="isProductSelected(product.id)" 
                        @update:checked="toggleProductSelection(product.id)"
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
    
    <Alert v-if="showAlert" :variant="alertVariant">
      <AlertTitle>{{ alertTitle }}</AlertTitle>
      <AlertDescription>{{ alertMessage }}</AlertDescription>
    </Alert>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button @click="saveChanges" :disabled="isSubmitting">
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Save Changes
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  PackageIcon, 
  PlusIcon, 
  Trash2Icon,
  Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'

const props = defineProps({
  bundle: {
    type: Object,
    required: true
  },
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['items-updated', 'close'])

// Clone bundle items to avoid directly mutating props
const bundleItems = ref([...(props.bundle.bundleItems || [])].map(item => ({...item})))

// UI state
const showProductSelector = ref(false)
const productSearch = ref('')
const selectedProductIds = ref([])
const isSubmitting = ref(false)
const showAlert = ref(false)
const alertVariant = ref('default')
const alertTitle = ref('')
const alertMessage = ref('')

// Computed
const filteredProducts = computed(() => {
  let result = props.products

  // Filter out bundle products - can't add bundles to bundles
  result = result.filter(product => product.type !== 'bundle')
  
  // Filter out products already in the bundle
  const existingProductIds = bundleItems.value.map(item => item.productId)
  result = result.filter(product => !existingProductIds.includes(product.id))

  if (productSearch.value) {
    const searchTerm = productSearch.value.toLowerCase()
    result = result.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm)
    )
  }

  return result
})

// Methods
function formatPrice(price) {
  if (price === undefined || price === null) return '-'
  return `$${parseFloat(price).toFixed(2)}`
}

function getBundleImage() {
  if (!props.bundle.images || !Array.isArray(props.bundle.images) || props.bundle.images.length === 0) {
    return null
  }
  
  const defaultImage = props.bundle.images.find(img => img.isDefault)
  return defaultImage ? defaultImage.url : props.bundle.images[0].url
}

function getProductName(productId) {
  const product = props.products.find(p => p.id === productId)
  return product ? product.name : 'Unknown Product'
}

function getProductSku(productId) {
  const product = props.products.find(p => p.id === productId)
  return product ? product.sku : 'N/A'
}

function getProductImage(productId) {
  const product = props.products.find(p => p.id === productId)
  if (!product || !product.images || !product.images.length) return null
  
  const defaultImage = product.images.find(img => img.isDefault)
  return defaultImage ? defaultImage.url : product.images[0].url
}

function getProductVariants(productId) {
  const product = props.products.find(p => p.id === productId)
  return product && product.variants ? product.variants : []
}

function hasVariantOptions(productId) {
  const product = props.products.find(p => p.id === productId)
  return product && product.variants && product.variants.length > 0
}

function getProductPrice(productId, variantId) {
  const product = props.products.find(p => p.id === productId)
  if (!product) return 0
  
  if (variantId && product.variants) {
    const variant = product.variants.find(v => v.id === variantId)
    if (variant && variant.price !== undefined) {
      return variant.price
    }
  }
  
  return product.price || 0
}

function isProductSelected(productId) {
  return selectedProductIds.value.includes(productId)
}

function toggleProductSelection(productId) {
  const index = selectedProductIds.value.indexOf(productId)
  if (index === -1) {
    selectedProductIds.value.push(productId)
  } else {
    selectedProductIds.value.splice(index, 1)
  }
}

function addSelectedProducts() {
  for (const productId of selectedProductIds.value) {
    const product = props.products.find(p => p.id === productId)
    if (product) {
      const newItem = {
        productId: product.id,
        quantity: 1,
        isRequired: true,
        isVariable: false
      }
      
      // If product has variants, set the first one as default
      if (hasVariantOptions(product.id)) {
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

function showSuccessAlert() {
  alertVariant.value = 'success'
  alertTitle.value = 'Success'
  alertMessage.value = 'Bundle components have been updated successfully.'
  showAlert.value = true
}

function showErrorAlert(error) {
  alertVariant.value = 'destructive'
  alertTitle.value = 'Error'
  alertMessage.value = error || 'An error occurred while updating bundle components.'
  showAlert.value = true
}

function saveChanges() {
  isSubmitting.value = true
  showAlert.value = false
  
  // Validate items
  for (const item of bundleItems.value) {
    // Ensure quantity is a number and at least 1
    item.quantity = parseInt(item.quantity) || 1
    if (item.quantity < 1) {
      item.quantity = 1
    }
    
    // If item is variable, ensure it has a variantId
    if (item.isVariable && hasVariantOptions(item.productId) && !item.variantId) {
      const variants = getProductVariants(item.productId)
      if (variants.length > 0) {
        item.variantId = variants[0].id
      }
    }
    
    // If item is not variable, remove variantId
    if (!item.isVariable) {
      delete item.variantId
    }
  }
  
  // Simulate API call
  setTimeout(() => {
    emit('items-updated', props.bundle.id, bundleItems.value)
    isSubmitting.value = false
    showSuccessAlert()
  }, 800)
}
</script>