<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ isMultiple ? 'Delete Customer Pricing Rules' : 'Delete Customer Pricing Rule' }}
        </DialogTitle>
        <DialogDescription>
          {{ 
            isMultiple 
              ? `Are you sure you want to delete ${selectedPricing.length} customer pricing rules?` 
              : 'Are you sure you want to delete this customer pricing rule?' 
          }}
          This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-4">
        <!-- Single pricing deletion -->
        <div v-if="!isMultiple && pricing" class="rounded-md border p-4">
          <div class="flex items-start gap-4">
            <div class="flex-1 space-y-1">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium leading-none">Customer</h3>
                <Badge :variant="getStatusVariant(pricing)">
                  {{ formatStatus(pricing) }}
                </Badge>
              </div>
              
              <div class="py-2">
                <p class="font-medium">{{ getCustomerName(pricing.customerId) }}</p>
                <p class="text-sm text-muted-foreground">{{ getCustomerEmail(pricing.customerId) }}</p>
                <p v-if="getCustomerCompany(pricing.customerId)" class="text-sm text-muted-foreground">
                  {{ getCustomerCompany(pricing.customerId) }}
                </p>
              </div>
              
              <div v-if="pricing.products && pricing.products.length > 0" class="pt-2">
                <h4 class="text-sm font-medium">Products with custom pricing:</h4>
                <ul class="mt-1 text-sm">
                  <li v-for="(product, index) in pricing.products.slice(0, 3)" :key="index" class="flex justify-between">
                    <span>{{ getProductName(product.productId) }}</span>
                    <span class="text-muted-foreground">{{ formatCurrency(product.price) }}</span>
                  </li>
                  <li v-if="pricing.products.length > 3" class="text-muted-foreground italic">
                    And {{ pricing.products.length - 3 }} more...
                  </li>
                </ul>
              </div>
              
              <div class="flex flex-wrap gap-2 pt-2" v-if="pricing.startDate || pricing.endDate">
                <div v-if="pricing.startDate" class="text-xs text-muted-foreground">
                  From: {{ formatDate(pricing.startDate) }}
                </div>
                <div v-if="pricing.endDate" class="text-xs text-muted-foreground">
                  To: {{ formatDate(pricing.endDate) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Multiple pricing deletion -->
        <div v-else-if="isMultiple && selectedPricing.length > 0" class="space-y-3">
          <p class="text-sm text-muted-foreground">
            You're about to delete custom pricing for:
          </p>
          <ScrollArea class="h-[200px] rounded-md border p-4">
            <div class="space-y-2">
              <div 
                v-for="(pricingId, index) in selectedPricing" 
                :key="pricingId" 
                class="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div>
                  <p class="text-sm font-medium">
                    {{ getCustomerName(getPricingCustomerId(pricingId)) }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ getCustomerProductCount(pricingId) }} products with custom pricing
                  </p>
                </div>
                <Badge :variant="getStatusVariant(getPricingById(pricingId))">
                  {{ formatStatus(getPricingById(pricingId)) }}
                </Badge>
              </div>
            </div>
          </ScrollArea>
        </div>
        
        <!-- Warning about reverting to group pricing -->
        <Alert variant="warning" class="mt-4">
          <AlertTriangleIcon class="h-4 w-4" />
          <AlertTitle>Pricing will revert to default</AlertTitle>
          <AlertDescription>
            {{ 
              isMultiple 
                ? 'These customers will revert to their customer group pricing rules.' 
                : 'This customer will revert to their customer group pricing rules.' 
            }}
          </AlertDescription>
        </Alert>
      </div>
      
      <DialogFooter>
        <Button
          variant="outline"
          @click="$emit('update:isOpen', false)"
          :disabled="isProcessing"
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          @click="confirmDelete"
          :disabled="isProcessing"
        >
          <Loader2Icon
            v-if="isProcessing"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{ isMultiple ? 'Delete Pricing Rules' : 'Delete Pricing Rule' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import {
  AlertTriangleIcon,
  Loader2Icon
} from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  pricing: {
    type: Object,
    default: null
  },
  selectedPricing: {
    type: Array,
    default: () => []
  },
  allPricing: {
    type: Array,
    default: () => []
  },
  customers: {
    type: Array,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:isOpen',
  'confirm-delete'
])

// Computed properties
const isMultiple = computed(() => {
  return props.selectedPricing && props.selectedPricing.length > 0
})

// Methods
function formatDate(date) {
  if (!date) return ''
  return format(new Date(date), 'PPP')
}

function formatCurrency(value) {
  if (!value) return '$0.00'
  return `$${parseFloat(value).toFixed(2)}`
}

function getCustomerName(customerId) {
  const customer = props.customers.find(c => c.id === customerId)
  return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer'
}

function getCustomerEmail(customerId) {
  const customer = props.customers.find(c => c.id === customerId)
  return customer ? customer.email : ''
}

function getCustomerCompany(customerId) {
  const customer = props.customers.find(c => c.id === customerId)
  return customer ? customer.company : ''
}

function getProductName(productId) {
  const product = props.products.find(p => p.id === productId)
  return product ? product.name : 'Unknown Product'
}

function getPricingById(pricingId) {
  return props.allPricing.find(p => p.id === pricingId) || {}
}

function getPricingCustomerId(pricingId) {
  const pricing = getPricingById(pricingId)
  return pricing.customerId || ''
}

function getCustomerProductCount(pricingId) {
  const pricing = getPricingById(pricingId)
  return pricing.products ? pricing.products.length : 0
}

function formatStatus(pricing) {
  if (!pricing) return 'Unknown'
  
  const now = new Date()
  const startDate = pricing.startDate ? new Date(pricing.startDate) : null
  const endDate = pricing.endDate ? new Date(pricing.endDate) : null
  
  if (!pricing.isActive) {
    return 'Inactive'
  }
  
  if (startDate && startDate > now) {
    return 'Scheduled'
  }
  
  if (endDate && endDate < now) {
    return 'Expired'
  }
  
  return 'Active'
}

function getStatusVariant(pricing) {
  const status = formatStatus(pricing)
  
  const variants = {
    'Active': 'success',
    'Inactive': 'secondary',
    'Scheduled': 'warning',
    'Expired': 'outline'
  }
  
  return variants[status] || 'default'
}

function confirmDelete() {
  if (isMultiple.value) {
    emit('confirm-delete', props.selectedPricing)
  } else {
    emit('confirm-delete', props.pricing.id)
  }
}
</script>