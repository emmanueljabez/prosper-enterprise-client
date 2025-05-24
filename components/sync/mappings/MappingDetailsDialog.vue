<template>
  <DialogContent class="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Mapping Details</DialogTitle>
      <DialogDescription>
        Details for the connection between inventory item and catalog product
      </DialogDescription>
    </DialogHeader>

    <div v-if="mapping" class="space-y-6 py-4">
      <!-- Mapping Overview -->
      <div class="flex justify-between items-center">
        <div class="space-y-1">
          <h3 class="text-lg font-semibold">{{ mapping.itemName }} ↔ {{ mapping.productName }}</h3>
          <p class="text-sm text-muted-foreground">
            Mapping ID: {{ mapping.id }}
          </p>
        </div>
        <Badge :variant="getSyncStatusVariant(mapping.syncStatus)">
          {{ formatSyncStatus(mapping.syncStatus) }}
        </Badge>
      </div>

      <!-- Item and Product Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Item Card -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm">Inventory Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex items-start space-x-3">
                <div class="h-10 w-10 rounded flex items-center justify-center bg-muted">
                  <PackageIcon class="h-5 w-5 text-muted-foreground" />
                </div>
                <div class="space-y-1">
                  <h4 class="font-medium">{{ item?.name || 'Unknown Item' }}</h4>
                  <div class="flex flex-wrap gap-2">
                    <Badge variant="outline">{{ mapping.itemSku }}</Badge>
                    <Badge variant="secondary">
                      Stock: {{ item?.stockOnHand || 'N/A' }}
                    </Badge>
                  </div>
                </div>
              </div>
              <p class="text-sm text-muted-foreground">
                {{ item?.description || mapping.itemDescription || 'No description available' }}
              </p>
              <div v-if="item" class="pt-2">
                <div class="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                  <div>Status: <span class="font-medium">{{ item.status }}</span></div>
                  <div>Available: <span class="font-medium">{{ item.stockAvailable }}</span></div>
                  <div>Cost: <span class="font-medium">${{ formatPrice(item.cost) }}</span></div>
                  <div>UOM: <span class="font-medium">{{ item.unitOfMeasure }}</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Product Card -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm">Catalog Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex items-start space-x-3">
                <div class="h-10 w-10 rounded overflow-hidden bg-muted">
                  <img v-if="product?.imageUrl" :src="product.imageUrl" class="h-full w-full object-cover" />
                  <ShoppingBagIcon v-else class="h-5 w-5 m-2.5 text-muted-foreground" />
                </div>
                <div class="space-y-1">
                  <h4 class="font-medium">{{ product?.name || 'Unknown Product' }}</h4>
                  <div class="flex flex-wrap gap-2">
                    <Badge variant="outline">{{ mapping.productSku }}</Badge>
                    <Badge v-if="product?.price" variant="secondary">
                      ${{ formatPrice(product.price) }}
                    </Badge>
                  </div>
                </div>
              </div>
              <p class="text-sm text-muted-foreground">
                {{ product?.description || mapping.productDescription || 'No description available' }}
              </p>
              <div v-if="product" class="pt-2">
                <div class="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                  <div>Status: <span class="font-medium">{{ product.status }}</span></div>
                  <div>Type: <span class="font-medium">{{ product.type }}</span></div>
                  <div>Category: <span class="font-medium">{{ formatCategory(product.categoryId) }}</span></div>
                  <div>Featured: <span class="font-medium">{{ product.isFeatured ? 'Yes' : 'No' }}</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Mapping Info -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">Sync Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex justify-between">
              <div class="space-y-1">
                <p class="text-sm font-medium">Mapping Type</p>
                <p class="text-sm text-muted-foreground">
                  {{ formatMappingType(mapping.mappingType) }}
                </p>
              </div>
              <div class="space-y-1 text-right">
                <p class="text-sm font-medium">Last Synced</p>
                <p class="text-sm text-muted-foreground">
                  {{ mapping.lastSyncTime ? formatDate(mapping.lastSyncTime) : 'Never' }}
                </p>
              </div>
            </div>

            <Separator />

            <!-- Sync Options -->
            <div class="space-y-2">
              <p class="text-sm font-medium">Sync Options</p>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center space-x-2">
                  <CheckCircle2Icon 
                    v-if="mapping.syncOptions.inventory" 
                    class="h-4 w-4 text-green-500" 
                  />
                  <XCircleIcon 
                    v-else 
                    class="h-4 w-4 text-muted-foreground" 
                  />
                  <span class="text-sm">Inventory Levels</span>
                </div>
                <div class="flex items-center space-x-2">
                  <CheckCircle2Icon 
                    v-if="mapping.syncOptions.pricing" 
                    class="h-4 w-4 text-green-500" 
                  />
                  <XCircleIcon 
                    v-else 
                    class="h-4 w-4 text-muted-foreground" 
                  />
                  <span class="text-sm">Pricing</span>
                </div>
                <div class="flex items-center space-x-2">
                  <CheckCircle2Icon 
                    v-if="mapping.syncOptions.metadata" 
                    class="h-4 w-4 text-green-500" 
                  />
                  <XCircleIcon 
                    v-else 
                    class="h-4 w-4 text-muted-foreground" 
                  />
                  <span class="text-sm">Metadata</span>
                </div>
                <div class="flex items-center space-x-2">
                  <CheckCircle2Icon 
                    v-if="mapping.syncOptions.bidirectional" 
                    class="h-4 w-4 text-green-500" 
                  />
                  <XCircleIcon 
                    v-else 
                    class="h-4 w-4 text-muted-foreground" 
                  />
                  <span class="text-sm">Bidirectional</span>
                </div>
              </div>
            </div>

            <Separator />

            <!-- Creation Info -->
            <div class="flex justify-between text-xs text-muted-foreground">
              <div>
                Created: {{ formatDate(mapping.createdAt) }}
              </div>
              <div>
                Last Updated: {{ formatDate(mapping.updatedAt) }}
              </div>
            </div>

            <!-- Error Message (if any) -->
            <div v-if="mapping.syncStatus === 'error' && mapping.syncError" class="mt-2">
              <Alert variant="destructive">
                <AlertCircleIcon class="h-4 w-4" />
                <AlertTitle>Sync Error</AlertTitle>
                <AlertDescription>
                  {{ mapping.syncError }}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <DialogFooter class="space-x-2">
      <Button variant="outline" @click="emit('close')">
        Close
      </Button>
      <Button variant="default" @click="syncNow">
        <RefreshCwIcon class="h-4 w-4 mr-2" />
        Sync Now
      </Button>
      <Button variant="default" @click="editMapping">
        <PencilIcon class="h-4 w-4 mr-2" />
        Edit Mapping
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { format } from 'date-fns'
import {
  PackageIcon,
  ShoppingBagIcon,
  RefreshCwIcon,
  PencilIcon,
  CheckCircle2Icon,
  XCircleIcon,
  AlertCircleIcon
} from 'lucide-vue-next'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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

const emit = defineEmits(['edit-mapping', 'sync-mapping', 'close'])

// Helper Functions
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}

function formatPrice(price) {
  if (!price && price !== 0) return 'N/A'
  return parseFloat(price).toFixed(2)
}

function formatMappingType(type) {
  if (type === 'manual') return 'Manual'
  if (type === 'automatic') return 'Automatic'
  return type
}

function formatSyncStatus(status) {
  const statusMap = {
    'synced': 'Synced',
    'out_of_sync': 'Out of Sync',
    'pending': 'Pending',
    'error': 'Error'
  }
  return statusMap[status] || status
}

function formatCategory(categoryId) {
  // This would typically look up the category name from a store or prop
  return categoryId || 'Uncategorized'
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

// Event Handlers
function editMapping() {
  emit('edit-mapping', props.mapping)
}

function syncNow() {
  emit('sync-mapping', props.mapping)
}
</script>