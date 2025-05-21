<template>
  <DialogContent>
    <DialogHeader>
      <DialogTitle class="text-destructive">Delete Product</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this product? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-6">
      <div class="space-y-6">
        <div class="border rounded-md p-4 bg-muted/20">
          <div class="flex items-start gap-4">
            <div class="h-12 w-12 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
              <img
                v-if="productImage"
                :src="productImage"
                :alt="product.name"
                class="h-full w-full object-cover"
              />
              <PackageIcon v-else class="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 class="font-medium">{{ product.name }}</h3>
              <p class="text-sm text-muted-foreground">SKU: {{ product.sku }}</p>
              <Badge 
                v-if="product.status" 
                :variant="getStatusVariant(product.status)"
                class="mt-1"
              >
                {{ formatStatus(product.status) }}
              </Badge>
            </div>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertCircleIcon class="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            <p>Deleting this product will:</p>
            <ul class="list-disc list-inside mt-2 space-y-1">
              <li>Remove it from all catalogs and sales channels</li>
              <li>Delete all associated data including images and variants</li>
              <li>Make it unavailable for future orders</li>
              <li>Potentially affect reports and historical data</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <div v-if="hasAssociations" class="border rounded-md p-4 bg-muted/20">
          <h4 class="font-medium mb-2">Product Associations</h4>
          <p class="text-sm text-muted-foreground mb-2">
            This product has associations that will be affected:
          </p>
          <ul class="list-disc list-inside text-sm space-y-1">
            <li v-if="product.type === 'configurable' && product.variants?.length">
              {{ product.variants.length }} variant{{ product.variants.length !== 1 ? 's' : '' }}
            </li>
            <li v-if="product.type === 'bundle' && product.bundleItems?.length">
              {{ product.bundleItems.length }} bundle item{{ product.bundleItems.length !== 1 ? 's' : '' }}
            </li>
            <li v-if="product.images?.length">
              {{ product.images.length }} image{{ product.images.length !== 1 ? 's' : '' }}
            </li>
            <li v-if="orderCount > 0">
              Used in {{ orderCount }} order{{ orderCount !== 1 ? 's' : '' }}
            </li>
          </ul>
        </div>
        
        <div class="space-y-2">
          <Label for="confirmDelete">Type "DELETE" to confirm</Label>
          <Input
            id="confirmDelete"
            v-model="confirmText"
            placeholder="DELETE"
          />
        </div>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="onCancel">Cancel</Button>
      <Button 
        variant="destructive" 
        @click="deleteProduct" 
        :disabled="isDeleting || confirmText !== 'DELETE'"
      >
        <Loader2Icon v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
        Delete Product
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  AlertCircleIcon,
  Loader2Icon,
  PackageIcon
} from 'lucide-vue-next'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  orderCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['delete', 'cancel'])

// Form state
const confirmText = ref('')
const isDeleting = ref(false)

// Computed properties
const productImage = computed(() => {
  if (!props.product.images || !props.product.images.length) return null
  
  const defaultImage = props.product.images.find(img => img.isDefault)
  return defaultImage ? defaultImage.url : props.product.images[0].url
})

const hasAssociations = computed(() => {
  return (
    (props.product.type === 'configurable' && props.product.variants?.length) ||
    (props.product.type === 'bundle' && props.product.bundleItems?.length) ||
    props.product.images?.length ||
    props.orderCount > 0
  )
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

function getStatusVariant(status) {
  const variants = {
    'active': 'success',
    'draft': 'secondary',
    'archived': 'outline',
    'out_of_stock': 'destructive'
  }
  return variants[status] || 'default'
}

// Actions
async function deleteProduct() {
  if (confirmText.value !== 'DELETE') return
  
  isDeleting.value = true
  
  try {
    emit('delete', props.product.id)
  } catch (error) {
    console.error('Error deleting product:', error)
  } finally {
    isDeleting.value = false
  }
}

function onCancel() {
  emit('cancel')
}
</script>