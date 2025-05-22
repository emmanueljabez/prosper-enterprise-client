<template>
  <DialogContent class="sm:max-w-[600px]">
    <DialogHeader>
      <div class="flex items-center justify-between">
        <DialogTitle>{{ promotion.name }}</DialogTitle>
        <Badge :variant="getStatusBadgeVariant(promotion.status)">
          {{ promotion.status }}
        </Badge>
      </div>
      <DialogDescription>
        {{ promotion.description || 'No description provided' }}
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 space-y-6">
      <!-- Promotion Details -->
      <div class="space-y-6">
        <!-- Main Details -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 class="text-sm font-medium text-muted-foreground mb-1">Promotion Type</h4>
            <p>{{ formatPromotionType(promotion.type) }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-muted-foreground mb-1">Value</h4>
            <p>{{ formatPromotionValue(promotion.value, promotion.type) }}</p>
          </div>
        </div>

        <!-- Date Range -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 class="text-sm font-medium text-muted-foreground mb-1">Start Date</h4>
            <p>{{ formatDate(promotion.startDate) }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-muted-foreground mb-1">End Date</h4>
            <p>{{ promotion.endDate ? formatDate(promotion.endDate) : 'No end date' }}</p>
          </div>
        </div>

        <!-- Applied To -->
        <div>
          <h4 class="text-sm font-medium text-muted-foreground mb-1">Applies To</h4>
          <div class="space-y-1">
            <p v-if="promotion.appliesTo === 'all'">All Products</p>
            <p v-else-if="promotion.appliesTo === 'category'">
              Category: {{ promotion.categoryName || 'Unknown Category' }}
            </p>
            <p v-else-if="promotion.appliesTo === 'products' && promotion.productIds">
              {{ promotion.productIds.length }} Specific Products
              <Button variant="link" size="sm" class="p-0 h-auto" @click="showProductsExpanded = !showProductsExpanded">
                {{ showProductsExpanded ? 'Hide' : 'Show' }} Products
              </Button>
            </p>
          </div>

          <!-- Expanded Product List -->
          <div v-if="showProductsExpanded && promotion.appliesTo === 'products' && promotion.productIds" class="mt-2">
            <div class="border rounded-md max-h-[200px] overflow-y-auto">
              <div v-if="productsList.length > 0" class="divide-y">
                <div v-for="product in productsList" :key="product.id" class="p-2 text-sm">
                  {{ product.name }}
                </div>
              </div>
              <div v-else class="p-3 text-sm text-muted-foreground text-center">
                No product details available
              </div>
            </div>
          </div>
        </div>

        <!-- Eligibility -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 class="text-sm font-medium text-muted-foreground mb-1">Customer Groups</h4>
            <p v-if="!promotion.customerGroupIds || promotion.customerGroupIds.length === 0">
              All Customers
            </p>
            <p v-else>
              {{ promotion.customerGroupIds.length }} Selected Groups
              <Button variant="link" size="sm" class="p-0 h-auto" @click="showGroupsExpanded = !showGroupsExpanded">
                {{ showGroupsExpanded ? 'Hide' : 'Show' }} Groups
              </Button>
            </p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-muted-foreground mb-1">Sales Channels</h4>
            <p v-if="!promotion.salesChannelIds || promotion.salesChannelIds.length === 0">
              All Sales Channels
            </p>
            <p v-else>
              {{ promotion.salesChannelIds.length }} Selected Channels
              <Button variant="link" size="sm" class="p-0 h-auto" @click="showChannelsExpanded = !showChannelsExpanded">
                {{ showChannelsExpanded ? 'Hide' : 'Show' }} Channels
              </Button>
            </p>
          </div>
        </div>

        <!-- Expanded Customer Groups List -->
        <div v-if="showGroupsExpanded && promotion.customerGroupIds && promotion.customerGroupIds.length > 0" class="mt-2">
          <div class="border rounded-md max-h-[150px] overflow-y-auto">
            <div v-if="customerGroupsList.length > 0" class="divide-y">
              <div v-for="group in customerGroupsList" :key="group.id" class="p-2 text-sm">
                {{ group.name }}
              </div>
            </div>
            <div v-else class="p-3 text-sm text-muted-foreground text-center">
              No customer group details available
            </div>
          </div>
        </div>

        <!-- Expanded Sales Channels List -->
        <div v-if="showChannelsExpanded && promotion.salesChannelIds && promotion.salesChannelIds.length > 0" class="mt-2">
          <div class="border rounded-md max-h-[150px] overflow-y-auto">
            <div v-if="salesChannelsList.length > 0" class="divide-y">
              <div v-for="channel in salesChannelsList" :key="channel.id" class="p-2 text-sm">
                {{ channel.name }}
              </div>
            </div>
            <div v-else class="p-3 text-sm text-muted-foreground text-center">
              No sales channel details available
            </div>
          </div>
        </div>

        <!-- Usage Info -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 class="text-sm font-medium text-muted-foreground mb-1">Usage Limit</h4>
            <p>{{ promotion.usageLimit ? promotion.usageLimit : 'Unlimited' }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-muted-foreground mb-1">Usage Count</h4>
            <p>{{ promotion.usageCount || 0 }} uses</p>
          </div>
        </div>

        <!-- Meta Info -->
        <div class="pt-4 border-t text-sm text-muted-foreground">
          <div class="flex items-center justify-between">
            <span>ID: {{ promotion.id }}</span>
            <span>Created: {{ formatDate(promotion.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter class="flex items-center justify-between sm:justify-between">
      <div class="flex space-x-2">
        <Button variant="outline" size="sm" @click="$emit('delete-promotion', promotion)">
          <TrashIcon class="h-4 w-4 mr-2" />
          Delete
        </Button>
        <Button variant="outline" size="sm" @click="$emit('duplicate-promotion', promotion)">
          <CopyIcon class="h-4 w-4 mr-2" />
          Duplicate
        </Button>
      </div>
      <div class="flex space-x-2">
        <Button variant="outline" @click="$emit('update-status', promotion)">
          <ToggleLeftIcon class="h-4 w-4 mr-2" />
          Change Status
        </Button>
        <Button @click="$emit('edit-promotion', promotion)">
          <PencilIcon class="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format, parseISO } from 'date-fns'
import { 
  TrashIcon,
  CopyIcon,
  PencilIcon,
  ToggleLeftIcon
} from 'lucide-vue-next'
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
  promotion: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'edit-promotion', 
  'duplicate-promotion', 
  'delete-promotion', 
  'update-status', 
  'close'
])

// UI state
const showProductsExpanded = ref(false)
const showGroupsExpanded = ref(false)
const showChannelsExpanded = ref(false)

// Generate lists of associated entities
const productsList = computed(() => {
  if (!props.promotion.productIds || !props.promotion.products) return []
  
  // If the promotion already has a products array (denormalized)
  if (Array.isArray(props.promotion.products)) {
    return props.promotion.products
  }
  
  // Otherwise simulate for the demo
  return props.promotion.productIds.map(id => ({
    id,
    name: `Product ${id.substring(0, 4).toUpperCase()}`,
    sku: `SKU-${id.substring(0, 6)}`
  }))
})

const customerGroupsList = computed(() => {
  if (!props.promotion.customerGroupIds || !props.promotion.customerGroups) return []
  
  // If the promotion already has a customerGroups array (denormalized)
  if (Array.isArray(props.promotion.customerGroups)) {
    return props.promotion.customerGroups
  }
  
  // Otherwise simulate for the demo
  return props.promotion.customerGroupIds.map(id => ({
    id,
    name: `Group ${id.substring(0, 4).toUpperCase()}`
  }))
})

const salesChannelsList = computed(() => {
  if (!props.promotion.salesChannelIds || !props.promotion.salesChannels) return []
  
  // If the promotion already has a salesChannels array (denormalized)
  if (Array.isArray(props.promotion.salesChannels)) {
    return props.promotion.salesChannels
  }
  
  // Otherwise simulate for the demo
  return props.promotion.salesChannelIds.map(id => ({
    id,
    name: `Channel ${id.substring(0, 4).toUpperCase()}`
  }))
})

// Helper methods
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return format(parseISO(dateString), 'MMM d, yyyy')
  } catch (e) {
    return dateString
  }
}

const formatPromotionType = (type) => {
  switch (type) {
    case 'percentage':
      return 'Percentage Discount'
    case 'fixed':
      return 'Fixed Amount'
    case 'bogo':
      return 'Buy One Get One'
    case 'shipping':
      return 'Free Shipping'
    case 'bundle':
      return 'Bundle Discount'
    default:
      return type
  }
}

const formatPromotionValue = (value, type) => {
  if (type === 'percentage') {
    return `${value}%`
  } else if (type === 'fixed') {
    return `$${parseFloat(value).toFixed(2)}`
  } else if (type === 'bogo') {
    return `Buy ${value.buy}, Get ${value.get} ${value.percent < 100 ? `${value.percent}% off` : 'Free'}`
  } else if (type === 'shipping') {
    return 'Free'
  } else if (type === 'bundle') {
    return `${value.discount}% off ${value.quantity}+ items`
  } else {
    return value.toString()
  }
}

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    case 'scheduled':
      return 'warning'
    case 'expired':
      return 'outline'
    default:
      return 'outline'
  }
}
</script>