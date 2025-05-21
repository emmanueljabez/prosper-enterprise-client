<template>
  <DialogContent class="sm:max-w-[550px]">
    <DialogHeader>
      <DialogTitle>Variant Details</DialogTitle>
      <DialogDescription>
        View information about this product variant
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <!-- Basic Information -->
      <div>
        <h3 class="text-sm font-medium mb-2">Basic Information</h3>
        <div class="rounded-md border p-4 space-y-3">
          <div>
            <span class="text-sm font-medium text-muted-foreground">Product:</span>
            <p class="text-base font-medium mt-1">{{ product?.name || 'Unknown product' }}</p>
          </div>
          
          <div>
            <span class="text-sm font-medium text-muted-foreground">SKU:</span>
            <p class="mt-1 font-mono text-sm">{{ variant.sku }}</p>
          </div>
          
          <div>
            <span class="text-sm font-medium text-muted-foreground">ID:</span>
            <p class="mt-1 font-mono text-sm">{{ variant.id }}</p>
          </div>
        </div>
      </div>

      <!-- Attributes -->
      <div>
        <h3 class="text-sm font-medium mb-2">Variant Attributes</h3>
        <div class="rounded-md border p-4">
          <div class="flex flex-wrap gap-2">
            <Badge 
              v-for="(value, key) in variant.attributeValues" 
              :key="key"
              variant="outline"
              class="px-3 py-1"
            >
              <span class="font-medium">{{ formatAttributeName(key) }}:</span> 
              {{ formatAttributeValue(key, value) }}
            </Badge>
            
            <div v-if="!variant.attributeValues || Object.keys(variant.attributeValues).length === 0" class="text-sm text-muted-foreground italic">
              No variant attributes
            </div>
          </div>
        </div>
      </div>

      <!-- Pricing -->
      <div>
        <h3 class="text-sm font-medium mb-2">Pricing</h3>
        <div class="rounded-md border p-4 space-y-3">
          <div v-if="product">
            <span class="text-sm font-medium text-muted-foreground">Product Base Price:</span>
            <p class="mt-1">{{ formatPrice(product.price) }}</p>
          </div>
          
          <div v-if="variant.price">
            <span class="text-sm font-medium text-muted-foreground">Variant Price:</span>
            <p class="mt-1 text-lg font-medium">{{ formatPrice(variant.price) }}</p>
          </div>
          
          <div v-if="variant.priceAdjustment !== undefined">
            <span class="text-sm font-medium text-muted-foreground">Price Adjustment:</span>
            <p class="mt-1">
              {{ variant.priceAdjustment > 0 ? '+' : '' }}{{ variant.priceAdjustment }}%
              <span class="text-sm text-muted-foreground">
                ({{ formatPrice(adjustedPrice) }})
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Inventory -->
      <div>
        <h3 class="text-sm font-medium mb-2">Inventory</h3>
        <div class="rounded-md border p-4 space-y-3">
          <div>
            <span class="text-sm font-medium text-muted-foreground">Current Stock:</span>
            <p class="mt-1">
              <Badge 
                :variant="getStockVariant(variant.stock)" 
                class="px-3 py-1"
              >
                {{ variant.stock || 0 }} units
              </Badge>
            </p>
          </div>
          
          <div>
            <span class="text-sm font-medium text-muted-foreground">Track Inventory:</span>
            <p class="mt-1">
              {{ variant.trackInventory !== false ? 'Yes' : 'No' }}
            </p>
          </div>
          
          <div v-if="variant.trackInventory !== false">
            <span class="text-sm font-medium text-muted-foreground">Low Stock Threshold:</span>
            <p class="mt-1">
              {{ variant.lowStockThreshold || 5 }} units
            </p>
          </div>
        </div>
      </div>

      <!-- Status -->
      <div>
        <h3 class="text-sm font-medium mb-2">Status</h3>
        <div class="rounded-md border p-4">
          <Badge 
            :variant="variant.isEnabled !== false ? 'default' : 'secondary'"
            class="px-3 py-1"
          >
            {{ variant.isEnabled !== false ? 'Active' : 'Disabled' }}
          </Badge>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">
        Close
      </Button>
      <Button variant="default" @click="$emit('edit-variant', variant)">
        <Pencil class="h-4 w-4 mr-2" />
        Edit Variant
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { Pencil } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps({
  variant: {
    type: Object,
    required: true
  },
  product: {
    type: Object,
    default: () => ({})
  },
  attributes: {
    type: Array,
    default: () => []
  }
})

defineEmits(['edit-variant', 'close'])

// Computed properties
const adjustedPrice = computed(() => {
  if (!props.product?.price || props.variant.priceAdjustment === undefined) return props.variant.price || 0
  
  const adjustment = props.product.price * (props.variant.priceAdjustment / 100)
  return props.product.price + adjustment
})

// Utility methods
const formatPrice = (price) => {
  if (price === undefined || price === null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

const formatAttributeName = (attributeId) => {
  const attribute = props.attributes.find(attr => attr.id === attributeId)
  return attribute ? attribute.name : attributeId
}

const formatAttributeValue = (attributeId, value) => {
  const attribute = props.attributes.find(attr => attr.id === attributeId)
  
  if (!attribute) return value
  
  if (attribute.type === 'select' || attribute.type === 'multiselect') {
    const option = attribute.options?.find(opt => opt.id === value || opt.value === value)
    return option ? option.label : value
  }
  
  if (attribute.type === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  
  return value
}

const getStockVariant = (stock) => {
  if (stock === undefined || stock === null) return 'outline'
  if (stock <= 0) return 'destructive'
  if (stock < 10) return 'warning'
  return 'success'
}
</script>