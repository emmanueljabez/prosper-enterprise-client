<template>
  <DialogContent class="sm:max-w-[450px]">
    <DialogHeader>
      <DialogTitle class="text-destructive">Delete Variant</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete this product variant.
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 space-y-4">
      <!-- Variant Info -->
      <div class="rounded-md border border-destructive/20 bg-destructive/5 p-4 space-y-3">
        <div>
          <h3 class="font-medium">{{ product?.name }}</h3>
          <p class="text-sm text-muted-foreground">SKU: {{ variant.sku }}</p>
        </div>
        
        <div v-if="variant.attributeValues" class="flex flex-wrap gap-1.5">
          <Badge 
            v-for="(value, key) in variant.attributeValues" 
            :key="key"
            variant="outline"
            class="text-xs"
          >
            {{ formatAttributeName(key) }}: {{ formatAttributeValue(key, value) }}
          </Badge>
        </div>
        
        <div class="flex justify-between text-sm">
          <span>Price: {{ formatPrice(variantPrice) }}</span>
          <span>Stock: {{ variant.stock || 0 }}</span>
        </div>
      </div>

      <!-- Warnings -->
      <Alert variant="warning">
        <AlertTriangle class="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          <p>Deleting this variant will:</p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>Remove it from all catalogs and collections</li>
            <li>Cancel any pending orders containing this variant</li>
            <li>Permanently delete all associated inventory records</li>
          </ul>
        </AlertDescription>
      </Alert>

      <!-- Confirmation -->
      <div class="space-y-3">
        <Label for="confirm-delete" class="text-destructive font-medium">Confirmation</Label>
        <div class="flex items-center space-x-2">
          <Checkbox 
            id="confirm-delete" 
            v-model:checked="confirmed"
            :disabled="isDeleting"
          />
          <Label for="confirm-delete">
            I understand that this action cannot be undone
          </Label>
        </div>
        
        <div v-if="showDeleteReason" class="space-y-2 mt-3">
          <Label for="delete-reason">Reason for deletion (Optional)</Label>
          <Select v-model="deleteReason" :disabled="isDeleting">
            <SelectTrigger id="delete-reason">
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discontinued">Product Discontinued</SelectItem>
              <SelectItem value="error">Created in Error</SelectItem>
              <SelectItem value="duplicate">Duplicate Variant</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Textarea 
            v-if="deleteReason === 'other'"
            v-model="customReason"
            placeholder="Specify reason for deletion"
            :disabled="isDeleting"
            class="mt-2"
          />
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')" :disabled="isDeleting">
        Cancel
      </Button>
      <Button 
        variant="destructive" 
        @click="deleteVariant" 
        :disabled="isDeleting || !confirmed"
      >
        <Loader2 v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin" />
        Delete Variant
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Loader2, AlertTriangle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
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
  },
  showDeleteReason: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['delete', 'close'])

// State
const confirmed = ref(false)
const deleteReason = ref('')
const customReason = ref('')
const isDeleting = ref(false)

// Computed properties
const variantPrice = computed(() => {
  if (props.variant.price !== undefined) return props.variant.price
  
  if (props.variant.priceAdjustment !== undefined && props.product?.price) {
    const adjustment = props.product.price * (props.variant.priceAdjustment / 100)
    return props.product.price + adjustment
  }
  
  return props.product?.price || 0
})

// Methods
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

const deleteVariant = async () => {
  if (!confirmed.value) return
  
  isDeleting.value = true
  
  try {
    // In a real application, you might log the deletion reason
    const reason = deleteReason.value === 'other' ? customReason.value : deleteReason.value
    
    // Emit the delete event
    emit('delete', props.variant)
  } catch (error) {
    console.error('Error deleting variant:', error)
  } finally {
    isDeleting.value = false
  }
}
</script>