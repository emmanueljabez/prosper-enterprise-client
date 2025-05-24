<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Delete Mapping</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this mapping? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 space-y-4">
      <!-- Mapping Details -->
      <div class="rounded-lg border p-4 bg-muted/30 space-y-3">
        <div class="flex flex-col">
          <div class="flex items-center justify-between">
            <h4 class="font-medium">Mapping Information</h4>
            <Badge :variant="getSyncStatusVariant(mapping.syncStatus)">
              {{ formatSyncStatus(mapping.syncStatus) }}
            </Badge>
          </div>
          <p class="text-sm text-muted-foreground">
            ID: {{ mapping.id }}
          </p>
        </div>
        
        <Separator />
        
        <div class="grid grid-cols-2 gap-4">
          <!-- Item Info -->
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <PackageIcon class="h-4 w-4 text-muted-foreground" />
              <span class="font-medium text-sm">Inventory Item</span>
            </div>
            <div class="ml-6 space-y-1">
              <p class="text-sm">{{ mapping.itemName }}</p>
              <p class="text-xs text-muted-foreground">{{ mapping.itemSku }}</p>
              <p v-if="item" class="text-xs">
                Stock: {{ item.stockOnHand }} | Available: {{ item.stockAvailable }}
              </p>
            </div>
          </div>
          
          <!-- Product Info -->
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <ShoppingBagIcon class="h-4 w-4 text-muted-foreground" />
              <span class="font-medium text-sm">Catalog Product</span>
            </div>
            <div class="ml-6 space-y-1">
              <p class="text-sm">{{ mapping.productName }}</p>
              <p class="text-xs text-muted-foreground">{{ mapping.productSku }}</p>
              <p v-if="product" class="text-xs">
                Price: ${{ formatPrice(product.price) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Warning -->
      <Alert variant="destructive">
        <AlertTriangleIcon class="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Deleting this mapping will remove the connection between the inventory item and catalog product.
          Any automated synchronization will stop working.
        </AlertDescription>
      </Alert>
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        @click="emit('close')"
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        @click="confirmDelete"
        :disabled="isDeleting"
      >
        <Loader2Icon v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
        <TrashIcon v-else class="mr-2 h-4 w-4" />
        Delete Mapping
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref } from 'vue'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  PackageIcon,
  ShoppingBagIcon,
  TrashIcon,
  Loader2Icon,
  AlertTriangleIcon
} from 'lucide-vue-next'

const props = defineProps({
  mapping: {
    type: Object,
    required: true
  },
  item: {
    type: Object,
    default: null
  },
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['delete', 'close'])

const isDeleting = ref(false)

function formatSyncStatus(status) {
  const statusMap = {
    'synced': 'Synced',
    'out_of_sync': 'Out of Sync',
    'pending': 'Pending',
    'error': 'Error'
  }
  return statusMap[status] || status
}

function getSyncStatusVariant(status) {
  const variantMap = {
    'synced': 'success',
    'out_of_sync': 'warning',
    'pending': 'secondary',
    'error': 'destructive'
  }
  return variantMap[status] || 'outline'
}

function formatPrice(price) {
  if (!price && price !== 0) return 'N/A'
  return parseFloat(price).toFixed(2)
}

async function confirmDelete() {
  isDeleting.value = true
  
  try {
    emit('delete', props.mapping)
  } catch (error) {
    console.error('Error deleting mapping:', error)
  } finally {
    isDeleting.value = false
  }
}
</script>