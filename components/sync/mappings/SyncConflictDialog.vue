<template>
  <DialogContent class="sm:max-w-xl">
    <DialogHeader>
      <DialogTitle>Sync Conflicts</DialogTitle>
      <DialogDescription>
        There are conflicts between inventory item and catalog product data that need to be resolved.
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 space-y-6">
      <!-- Mapping Info -->
      <div class="rounded-md border p-3 bg-muted/20">
        <div class="flex flex-col">
          <div class="flex items-center justify-between">
            <h4 class="font-medium">Mapping</h4>
            <Badge variant="destructive">Conflicts Detected</Badge>
          </div>
          <p class="text-sm">
            {{ mapping?.itemName }} ↔ {{ mapping?.productName }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ mapping?.itemSku }} ↔ {{ mapping?.productSku }}
          </p>
        </div>
      </div>

      <!-- Conflicts -->
      <div class="space-y-4">
        <h4 class="font-medium">Conflicts to Resolve</h4>
        
        <div v-if="conflicts.length === 0" class="text-center py-6">
          <AlertTriangleIcon class="mx-auto h-8 w-8 text-muted-foreground" />
          <p class="mt-2">No conflicts found</p>
          <p class="text-sm text-muted-foreground">Try refreshing the mapping</p>
        </div>
        
        <div v-for="(conflict, index) in conflicts" :key="conflict.id" class="space-y-4">
          <div class="flex items-center justify-between">
            <h5 class="font-medium text-sm">
              Conflict #{{ index + 1 }}: {{ formatConflictType(conflict.type) }}
            </h5>
            <Badge 
              :variant="conflict.status === 'resolved' ? 'success' : 'destructive'"
            >
              {{ conflict.status === 'resolved' ? 'Resolved' : 'Unresolved' }}
            </Badge>
          </div>
          
          <Alert variant="warning">
            <AlertTriangleIcon class="h-4 w-4" />
            <AlertTitle>{{ conflict.details }}</AlertTitle>
            <AlertDescription>
              Detected on {{ formatDate(conflict.detectedAt) }}
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardContent class="pt-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Inventory Data -->
                <div class="space-y-4">
                  <div class="flex items-center space-x-2">
                    <PackageIcon class="h-4 w-4 text-muted-foreground" />
                    <h6 class="font-medium text-sm">Inventory Data</h6>
                  </div>
                  <div 
                    v-if="conflict.type === 'inventory_mismatch'" 
                    class="pl-6 space-y-2"
                  >
                    <div class="flex justify-between">
                      <span class="text-sm">Stock on Hand:</span>
                      <span class="font-medium">{{ conflict.inventoryItem.stockOnHand }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm">Available:</span>
                      <span class="font-medium">{{ conflict.inventoryItem.stockAvailable }}</span>
                    </div>
                  </div>
                  <div 
                    v-else-if="conflict.type === 'price_mismatch'" 
                    class="pl-6 space-y-2"
                  >
                    <div class="flex justify-between">
                      <span class="text-sm">Cost:</span>
                      <span class="font-medium">${{ formatPrice(conflict.inventoryItem.cost) }}</span>
                    </div>
                  </div>
                  <div 
                    v-else-if="conflict.type === 'metadata_mismatch'" 
                    class="pl-6 space-y-2"
                  >
                    <div class="space-y-1">
                      <span class="text-sm">Description:</span>
                      <p class="text-sm border rounded p-2 bg-muted/30">
                        {{ conflict.inventoryItem.description || 'No description' }}
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- Catalog Data -->
                <div class="space-y-4">
                  <div class="flex items-center space-x-2">
                    <ShoppingBagIcon class="h-4 w-4 text-muted-foreground" />
                    <h6 class="font-medium text-sm">Catalog Data</h6>
                  </div>
                  <div 
                    v-if="conflict.type === 'inventory_mismatch'" 
                    class="pl-6 space-y-2"
                  >
                    <div class="flex justify-between">
                      <span class="text-sm">Stock Level:</span>
                      <span class="font-medium">{{ conflict.catalogProduct.stockLevel }}</span>
                    </div>
                  </div>
                  <div 
                    v-else-if="conflict.type === 'price_mismatch'" 
                    class="pl-6 space-y-2"
                  >
                    <div class="flex justify-between">
                      <span class="text-sm">Price:</span>
                      <span class="font-medium">${{ formatPrice(conflict.catalogProduct.price) }}</span>
                    </div>
                  </div>
                  <div 
                    v-else-if="conflict.type === 'metadata_mismatch'" 
                    class="pl-6 space-y-2"
                  >
                    <div class="space-y-1">
                      <span class="text-sm">Description:</span>
                      <p class="text-sm border rounded p-2 bg-muted/30">
                        {{ conflict.catalogProduct.description || 'No description' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Resolution controls -->
              <div 
                v-if="conflict.status !== 'resolved'" 
                class="mt-6 pt-4 border-t space-y-3"
              >
                <h6 class="font-medium text-sm">Resolve Conflict</h6>
                
                <RadioGroup v-model="resolutions[conflict.id]" class="space-y-2">
                  <div class="flex items-start space-x-2">
                    <RadioGroupItem :value="'inventory'" :id="`inventory-${conflict.id}`" />
                    <div>
                      <Label :for="`inventory-${conflict.id}`">Use inventory data</Label>
                      <p class="text-xs text-muted-foreground">
                        Update the catalog product with the inventory item's data
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start space-x-2">
                    <RadioGroupItem :value="'catalog'" :id="`catalog-${conflict.id}`" />
                    <div>
                      <Label :for="`catalog-${conflict.id}`">Use catalog data</Label>
                      <p class="text-xs text-muted-foreground">
                        Update the inventory item with the catalog product's data
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start space-x-2">
                    <RadioGroupItem :value="'manual'" :id="`manual-${conflict.id}`" />
                    <div>
                      <Label :for="`manual-${conflict.id}`">Enter manual value</Label>
                      <p class="text-xs text-muted-foreground">
                        Specify a custom value to use for both systems
                      </p>
                    </div>
                  </div>
                </RadioGroup>
                
                <!-- Manual value input for inventory mismatch -->
                <div v-if="resolutions[conflict.id] === 'manual'">
                  <div v-if="conflict.type === 'inventory_mismatch'" class="pt-2">
                    <Label>Stock Level</Label>
                    <Input 
                      type="number" 
                      v-model="manualValues[conflict.id]" 
                      min="0" 
                      class="w-40 mt-1"
                    />
                  </div>
                  <div v-else-if="conflict.type === 'price_mismatch'" class="pt-2">
                    <Label>Price</Label>
                    <div class="flex items-center mt-1">
                      <span class="mr-1">$</span>
                      <Input 
                        type="number" 
                        v-model="manualValues[conflict.id]" 
                        min="0" 
                        step="0.01" 
                        class="w-40"
                      />
                    </div>
                  </div>
                  <div v-else-if="conflict.type === 'metadata_mismatch'" class="pt-2">
                    <Label>Description</Label>
                    <Textarea 
                      v-model="manualValues[conflict.id]" 
                      rows="3" 
                      class="mt-1"
                    />
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  class="mt-2"
                  :disabled="!resolutions[conflict.id]"
                  @click="resolveConflict(conflict)"
                >
                  Resolve This Conflict
                </Button>
              </div>
              
              <div 
                v-else 
                class="mt-6 pt-4 border-t"
              >
                <div class="flex items-center space-x-2 text-green-500">
                  <CheckIcon class="h-4 w-4" />
                  <span class="font-medium text-sm">Resolved</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Separator v-if="index < conflicts.length - 1" />
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="emit('close')">
        Close
      </Button>
      <Button 
        variant="default" 
        @click="resolveAllConflicts"
        :disabled="!allConflictsHaveResolutions || allConflictsResolved"
      >
        <CheckCircle2Icon class="h-4 w-4 mr-2" />
        Resolve All Conflicts
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { format } from 'date-fns'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  PackageIcon,
  ShoppingBagIcon,
  AlertTriangleIcon,
  CheckIcon,
  CheckCircle2Icon
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
  },
  conflicts: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['resolve', 'close'])

// Resolution data
const resolutions = reactive({})
const manualValues = reactive({})

// Initialize resolutions
props.conflicts.forEach(conflict => {
  if (conflict.status !== 'resolved') {
    resolutions[conflict.id] = ''
    manualValues[conflict.id] = ''
  }
})

// Computed properties
const allConflictsHaveResolutions = computed(() => {
  const unresolvedConflicts = props.conflicts.filter(c => c.status !== 'resolved')
  if (unresolvedConflicts.length === 0) return false
  
  return unresolvedConflicts.every(conflict => !!resolutions[conflict.id])
})

const allConflictsResolved = computed(() => {
  return props.conflicts.every(conflict => conflict.status === 'resolved')
})

// Helper functions
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

function formatConflictType(type) {
  const typeMap = {
    'inventory_mismatch': 'Inventory Levels Mismatch',
    'price_mismatch': 'Price Mismatch',
    'metadata_mismatch': 'Metadata Mismatch'
  }
  return typeMap[type] || type
}

// Action methods
function resolveConflict(conflict) {
  const resolution = {
    conflictId: conflict.id,
    type: conflict.type,
    resolution: resolutions[conflict.id]
  }
  
  // Add the manual value if that resolution was chosen
  if (resolution.resolution === 'manual') {
    resolution.value = manualValues[conflict.id]
  }
  
  emit('resolve', resolution)
}

function resolveAllConflicts() {
  // Create an array of resolutions for all unresolved conflicts
  const allResolutions = props.conflicts
    .filter(conflict => conflict.status !== 'resolved')
    .map(conflict => {
      const resolution = {
        conflictId: conflict.id,
        type: conflict.type,
        resolution: resolutions[conflict.id]
      }
      
      // Add the manual value if that resolution was chosen
      if (resolution.resolution === 'manual') {
        resolution.value = manualValues[conflict.id]
      }
      
      return resolution
    })
  
  emit('resolve', allResolutions)
}
</script>