<template>
  <DialogContent class="sm:max-w-[800px] max-h-[90vh] flex flex-col">
    <DialogHeader class="flex-shrink-0">
      <DialogTitle>Bundle Details</DialogTitle>
      <DialogDescription>
        Detailed information about this bundle and its components.
      </DialogDescription>
    </DialogHeader>

    <div v-if="bundle" class="space-y-4 my-2 overflow-y-auto pr-2 flex-1">
      <!-- Basic Information -->
      <Accordion type="single" collapsible default-value="basicInfo">
        <AccordionItem value="basicInfo">
          <AccordionTrigger class="py-2 px-3 bg-muted rounded-t-lg border border-b-0">
            <div class="flex justify-between w-full items-center">
              <h3 class="font-medium">Basic Information</h3>
              <Button variant="ghost" size="sm" @click.stop="$emit('edit-bundle', bundle)" class="h-8">
                <PencilIcon class="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent class="p-4 border rounded-b-lg border-t-0">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-muted-foreground">Name</div>
                <div class="font-medium">{{ bundle.name }}</div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground">SKU</div>
                <div class="font-medium">{{ bundle.sku }}</div>
              </div>
              <div class="col-span-2">
                <div class="text-sm text-muted-foreground">Description</div>
                <div>{{ bundle.description || 'No description provided' }}</div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground">Status</div>
                <div class="flex items-center">
                  <Badge :variant="getStatusVariant(bundle.status)" class="mt-1">
                    {{ formatStatus(bundle.status) }}
                  </Badge>
                </div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground">Categories</div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <Badge v-for="category in getCategoryNames(bundle)" :key="category" variant="outline">
                    {{ category }}
                  </Badge>
                  <span v-if="!getCategoryNames(bundle).length">No categories</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <!-- Pricing -->
      <Accordion type="single" collapsible>
        <AccordionItem value="pricing">
          <AccordionTrigger class="py-2 px-3 bg-muted rounded-t-lg border border-b-0">
            <h3 class="font-medium">Pricing</h3>
          </AccordionTrigger>
          <AccordionContent class="p-4 border rounded-b-lg border-t-0">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-muted-foreground">Price</div>
                <div class="font-medium">{{ formatPrice(bundle.price) }}</div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground">Compare at Price</div>
                <div class="font-medium">
                  {{ bundle.compareAtPrice ? formatPrice(bundle.compareAtPrice) : 'Not set' }}
                </div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground">Savings</div>
                <div v-if="bundle.compareAtPrice && bundle.price < bundle.compareAtPrice">
                  {{ formatPrice(bundle.compareAtPrice - bundle.price) }} 
                  ({{ Math.round((1 - bundle.price / bundle.compareAtPrice) * 100) }}% off)
                </div>
                <div v-else>No savings</div>
              </div>
              <div v-if="bundle.cost">
                <div class="text-sm text-muted-foreground">Cost</div>
                <div>{{ formatPrice(bundle.cost) }}</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <!-- Bundle Components -->
      <Accordion type="single" collapsible default-value="components">
        <AccordionItem value="components">
          <AccordionTrigger class="py-2 px-3 bg-muted rounded-t-lg border border-b-0">
            <div class="flex justify-between w-full items-center">
              <h3 class="font-medium">Components ({{ bundle.bundleItems?.length || 0 }})</h3>
              <Button variant="ghost" size="sm" @click.stop="$emit('edit-bundle', bundle)" class="h-8">
                <PackageIcon class="h-4 w-4 mr-2" />
                Manage
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent class="border rounded-b-lg border-t-0 p-0">
            <div class="divide-y max-h-[250px] overflow-y-auto">
              <div v-if="!bundle.bundleItems || bundle.bundleItems.length === 0" class="p-4 text-center">
                <p class="text-sm text-muted-foreground">This bundle has no components.</p>
              </div>
              <div v-for="(item, index) in bundle.bundleItems" :key="index" class="p-4">
                <div class="flex items-start gap-4">
                  <div class="h-12 w-12 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      v-if="getProductImage(item.productId)"
                      :src="getProductImage(item.productId)"
                      :alt="getProductName(item.productId)"
                      class="h-full w-full object-cover"
                    />
                    <PackageIcon v-else class="h-6 w-6 text-muted-foreground" />
                  </div>
                  
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h4 class="font-medium">
                        {{ getProductName(item.productId) }}
                        <span v-if="item.variantId" class="text-sm font-normal text-muted-foreground">
                          ({{ getVariantName(item.productId, item.variantId) }})
                        </span>
                      </h4>
                      <div class="text-sm">{{ formatPrice(getProductPrice(item.productId, item.variantId)) }}</div>
                    </div>
                    
                    <div class="mt-1 grid grid-cols-3 gap-2">
                      <div class="text-sm">
                        <span class="text-muted-foreground">Quantity:</span> {{ item.quantity }}
                      </div>
                      <div class="text-sm">
                        <span class="text-muted-foreground">Required:</span> {{ item.isRequired ? 'Yes' : 'No' }}
                      </div>
                      <div class="text-sm">
                        <span class="text-muted-foreground">Variable:</span> {{ item.isVariable ? 'Yes' : 'No' }}
                      </div>
                    </div>
                    
                    <div v-if="item.isVariable && item.variableOptions" class="mt-2">
                      <div class="text-sm text-muted-foreground">Customer can choose from:</div>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <Badge v-for="option in item.variableOptions.options" :key="option.variantId" variant="outline">
                          {{ option.label }}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <!-- Inventory Settings -->
      <Accordion type="single" collapsible>
        <AccordionItem value="inventory">
          <AccordionTrigger class="py-2 px-3 bg-muted rounded-t-lg border border-b-0">
            <h3 class="font-medium">Inventory</h3>
          </AccordionTrigger>
          <AccordionContent class="p-4 border rounded-b-lg border-t-0">
            <div class="space-y-2">
              <div>
                <span class="text-sm text-muted-foreground">Dynamic Stock: </span>
                <span>{{ bundle.inventory?.dynamicStock ? 'Enabled' : 'Disabled' }}</span>
              </div>
              
              <div v-if="bundle.inventory?.dynamicStock">
                <div>
                  <span class="text-sm text-muted-foreground">Min Component Quantity: </span>
                  <span>{{ bundle.inventory.minComponentQuantity }}</span>
                </div>
                <div>
                  <span class="text-sm text-muted-foreground">Low Stock Threshold: </span>
                  <span>{{ bundle.inventory.lowStockThreshold }}</span>
                </div>
              </div>
              
              <!-- Inventory Status -->
              <div class="mt-4">
                <span class="text-sm text-muted-foreground">Current Availability: </span>
                <Badge :variant="getInventoryVariant(getBundleInventoryStatus())">
                  {{ getBundleInventoryStatus() }}
                </Badge>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <!-- Visibility & SEO -->
      <Accordion type="single" collapsible>
        <AccordionItem value="visibility">
          <AccordionTrigger class="py-2 px-3 bg-muted rounded-t-lg border border-b-0">
            <h3 class="font-medium">Visibility & SEO</h3>
          </AccordionTrigger>
          <AccordionContent class="p-4 border rounded-b-lg border-t-0">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-muted-foreground">Visibility</div>
                <div class="flex flex-wrap gap-2 mt-1">
                  <Badge v-if="bundle.visibility?.webstore" variant="outline">Web Store</Badge>
                  <Badge v-if="bundle.visibility?.b2bPortal" variant="outline">B2B Portal</Badge>
                  <Badge v-if="bundle.visibility?.marketplace" variant="outline">Marketplace</Badge>
                  <span v-if="!isVisibleAnywhere">Not visible anywhere</span>
                </div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground">SEO</div>
                <div class="text-sm">
                  <div><span class="text-muted-foreground">Title:</span> {{ bundle.seo?.title || bundle.name }}</div>
                  <div class="mt-1">
                    <span class="text-muted-foreground">URL:</span> {{ bundle.seo?.slug || 'Not set' }}
                  </div>
                </div>
              </div>
              <div class="col-span-2">
                <div class="text-sm text-muted-foreground">Meta Description</div>
                <div>{{ bundle.seo?.metaDescription || 'No meta description set' }}</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <!-- Dates -->
      <Accordion type="single" collapsible>
        <AccordionItem value="dates">
          <AccordionTrigger class="py-2 px-3 bg-muted rounded-t-lg border border-b-0">
            <h3 class="font-medium">Dates</h3>
          </AccordionTrigger>
          <AccordionContent class="p-4 border rounded-b-lg border-t-0">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-muted-foreground">Created</div>
                <div>{{ formatDate(bundle.createdAt) }}</div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground">Last Updated</div>
                <div>{{ formatDate(bundle.updatedAt) }}</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>

    <DialogFooter class="flex-shrink-0 mt-2">
      <Button variant="outline" @click="$emit('close')">Close</Button>
      <Button @click="$emit('edit-bundle', bundle)">Edit Bundle</Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import {
  PencilIcon,
  PackageIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

const props = defineProps({
  bundle: {
    type: Object,
    required: true
  },
  products: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'edit-bundle'])

// Computed
const isVisibleAnywhere = computed(() => {
  if (!props.bundle.visibility) return false
  return props.bundle.visibility.webstore || 
         props.bundle.visibility.b2bPortal || 
         props.bundle.visibility.marketplace
})

// Utilities
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'PPP')
  } catch (e) {
    return dateString
  }
}

function formatPrice(price) {
  if (price === undefined || price === null) return '-'
  return `$${parseFloat(price).toFixed(2)}`
}

function formatStatus(status) {
  if (!status) return 'Unknown'
  
  const statusMap = {
    'active': 'Active',
    'inactive': 'Inactive',
    'draft': 'Draft',
    'archived': 'Archived'
  }
  
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

function getStatusVariant(status) {
  const variants = {
    'active': 'success',
    'inactive': 'warning',
    'draft': 'secondary',
    'archived': 'outline'
  }
  return variants[status] || 'default'
}

function getCategoryNames(bundle) {
  if (!bundle.categories || !Array.isArray(bundle.categories)) return []
  
  return bundle.categories
    .map(categoryId => {
      const category = props.categories?.find(c => 
        c.id === categoryId || c.id === parseInt(categoryId)
      )
      return category ? category.name : null
    })
    .filter(Boolean)
}

function getProductName(productId) {
  const product = props.products.find(p => p.id === productId)
  return product ? product.name : 'Unknown Product'
}

function getProductImage(productId) {
  const product = props.products.find(p => p.id === productId)
  if (!product || !product.images || !product.images.length) return null
  
  const defaultImage = product.images.find(img => img.isDefault)
  return defaultImage ? defaultImage.url : product.images[0].url
}

function getVariantName(productId, variantId) {
  const product = props.products.find(p => p.id === productId)
  if (!product || !product.variants) return 'Unknown Variant'
  
  const variant = product.variants.find(v => v.id === variantId)
  return variant ? (variant.name || variant.sku) : 'Unknown Variant'
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

function getBundleInventoryStatus() {
  // This would ideally come from your store's bundleInventory
  // For this example, we'll base it on bundle ID as a demo placeholder
  if (!props.bundle.inventory?.dynamicStock) {
    return 'In Stock'
  }
  
  const lastChar = props.bundle.id.charAt(props.bundle.id.length - 1)
  const num = parseInt(lastChar) || 0
  
  if (num < 3) {
    return 'Out of Stock'
  } else if (num < 6) {
    return 'Low Stock'
  } else {
    return 'In Stock'
  }
}

function getInventoryVariant(status) {
  if (status === 'Out of Stock') {
    return 'destructive'
  } else if (status === 'Low Stock') {
    return 'warning'
  } else {
    return 'success'
  }
}
</script>

<style scoped>
/* Custom scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>