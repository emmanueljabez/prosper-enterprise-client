<template>
  <DialogContent class="sm:max-w-[800px]">
    <DialogHeader>
      <div class="flex items-center justify-between">
        <DialogTitle class="text-2xl">{{ item.name }}</DialogTitle>
        <Badge :variant="getStatusVariant(item.status)">
          {{ formatStatus(item.status) }}
        </Badge>
      </div>
      <DialogDescription>
        {{ item.sku }} · {{ getCategoryName(item.categoryId) }}
      </DialogDescription>
    </DialogHeader>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Basic Details -->
      <div class="space-y-4">
        <div class="rounded-md border">
          <div class="p-3 bg-muted/50 font-medium flex items-center">
            <PackageIcon class="h-4 w-4 mr-2" />
            Basic Information
          </div>
          <div class="p-4 space-y-3">
            <div>
              <div class="text-sm text-muted-foreground">Description</div>
              <div>{{ item.description || 'No description provided' }}</div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-muted-foreground">UPC/EAN</div>
                <div>{{ item.upc || 'Not specified' }}</div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground">Vendor SKU</div>
                <div>{{ item.vendorSku || 'Not specified' }}</div>
              </div>
            </div>
            <div>
              <div class="text-sm text-muted-foreground">Unit of Measure</div>
              <div>{{ formatUnitOfMeasure(item.unitOfMeasure) }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-md border">
          <div class="p-3 bg-muted/50 font-medium flex items-center">
            <BoxIcon class="h-4 w-4 mr-2" />
            Dimensions & Weight
          </div>
          <div class="p-4 space-y-3">
            <div v-if="hasDimensions" class="grid grid-cols-3 gap-2">
              <div>
                <div class="text-sm text-muted-foreground">Length</div>
                <div>{{ formatDimension(item.dimensions?.length, item.dimensions?.dimensionUnit) }}</div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground">Width</div>
                <div>{{ formatDimension(item.dimensions?.width, item.dimensions?.dimensionUnit) }}</div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground">Height</div>
                <div>{{ formatDimension(item.dimensions?.height, item.dimensions?.dimensionUnit) }}</div>
              </div>
            </div>
            <div v-if="item.dimensions?.weight">
              <div class="text-sm text-muted-foreground">Weight</div>
              <div>{{ formatWeight(item.dimensions.weight, item.dimensions.weightUnit) }}</div>
            </div>
            <div v-if="!hasDimensions && !item.dimensions?.weight" class="text-muted-foreground">
              No dimension information available
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory Information -->
      <div class="space-y-4">
        <div class="rounded-md border">
          <div class="p-3 bg-muted/50 font-medium flex items-center">
            <BarChart3Icon class="h-4 w-4 mr-2" />
            Inventory Levels
          </div>
          <div class="p-4">
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div class="text-sm text-muted-foreground">Stock on Hand</div>
                <div class="text-xl font-semibold">{{ item.stockOnHand }}</div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground">Available</div>
                <div class="text-xl font-semibold">
                  {{ item.stockAvailable }}
                  <Badge 
                    v-if="item.stockAvailable <= 0" 
                    variant="destructive" 
                    class="ml-2 text-xs"
                  >
                    Out of stock
                  </Badge>
                  <Badge 
                    v-else-if="isLowStock(item)" 
                    variant="warning" 
                    class="ml-2 text-xs"
                  >
                    Low stock
                  </Badge>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div class="text-sm text-muted-foreground">Committed</div>
                <div>{{ item.stockCommitted }}</div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground">Cost</div>
                <div>{{ formatCurrency(item.cost) }}</div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-muted-foreground">Reorder Point</div>
                <div>{{ item.reorderPoint }}</div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground">Reorder Quantity</div>
                <div>{{ item.reorderQuantity }}</div>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t">
              <div class="text-sm text-muted-foreground mb-2">Total Value</div>
              <div class="text-xl font-semibold">{{ formatCurrency(item.cost * item.stockOnHand) }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-md border">
          <div class="p-3 bg-muted/50 font-medium flex items-center">
            <MapPinIcon class="h-4 w-4 mr-2" />
            Location Assignments
          </div>
          <div class="p-4 max-h-[200px] overflow-auto">
            <div v-if="item.locations.length === 0" class="text-muted-foreground">
              No locations assigned
            </div>
            <div v-for="(location, index) in item.locations" :key="index" class="py-2 flex justify-between items-center border-b last:border-b-0">
              <div>
                <div>{{ location.name }}</div>
                <div v-if="location.bin" class="text-xs text-muted-foreground">
                  Bin: {{ location.bin }}
                </div>
              </div>
              <Badge variant="outline">{{ location.quantity }} {{ item.unitOfMeasure }}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Metadata -->
    <div class="mt-4 pt-2 text-sm text-muted-foreground border-t">
      <div class="flex justify-between">
        <div>Created: {{ formatDate(item.createdAt) }}</div>
        <div>Updated: {{ formatDate(item.updatedAt) }}</div>
      </div>
    </div>

    <DialogFooter class="flex-col sm:flex-row sm:justify-between gap-2">
      <div class="flex gap-2">
        <Button variant="outline" size="sm" @click="$emit('adjust-stock', item)">
          <ScaleIcon class="h-4 w-4 mr-2" />
          Adjust Stock
        </Button>
        <Button variant="outline" size="sm" @click="$emit('update-status', item)">
          <TagIcon class="h-4 w-4 mr-2" />
          Update Status
        </Button>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" @click="$emit('edit-item', item)">
          <PencilIcon class="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="outline" size="sm" @click="$emit('duplicate-item', item)">
          <CopyIcon class="h-4 w-4 mr-2" />
          Duplicate
        </Button>
        <Button variant="destructive" size="sm" @click="$emit('delete-item', item)">
          <Trash2Icon class="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import {
  BarChart3Icon,
  CopyIcon,
  BoxIcon,
  MapPinIcon,
  PackageIcon,
  PencilIcon,
  ScaleIcon,
  TagIcon,
  Trash2Icon
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

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'edit-item',
  'duplicate-item',
  'delete-item',
  'update-status',
  'adjust-stock',
  'close'
])

// Computed properties
const hasDimensions = computed(() => {
  const { dimensions } = props.item
  return dimensions && (
    dimensions.length || 
    dimensions.width || 
    dimensions.height
  )
})

// Formatter methods
const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'MMMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(value || 0)
}

const formatStatus = (status) => {
  switch (status) {
    case 'active':
      return 'Active'
    case 'out_of_stock':
      return 'Out of Stock'
    case 'low_stock':
      return 'Low Stock'
    case 'discontinued':
      return 'Discontinued'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'out_of_stock':
      return 'destructive'
    case 'low_stock':
      return 'warning'
    case 'discontinued':
      return 'outline'
    default:
      return 'default'
  }
}

const formatUnitOfMeasure = (unit) => {
  const unitMap = {
    'each': 'Each',
    'case': 'Case',
    'box': 'Box',
    'pair': 'Pair',
    'kg': 'Kilogram',
    'lb': 'Pound',
    'l': 'Liter',
    'm': 'Meter',
    'ft': 'Foot'
  }
  return unitMap[unit] || unit
}

const formatDimension = (value, unit) => {
  if (!value) return 'N/A'
  return `${value} ${unit || 'in'}`
}

const formatWeight = (value, unit) => {
  if (!value) return 'N/A'
  return `${value} ${unit || 'lb'}`
}

const getCategoryName = (categoryId) => {
  if (!categoryId) return 'Uncategorized'
  
  const category = props.categories.find(c => c.id === categoryId)
  return category ? category.name : 'Unknown Category'
}

const isLowStock = (item) => {
  return item.stockAvailable > 0 && item.stockAvailable <= item.reorderPoint
}
</script>