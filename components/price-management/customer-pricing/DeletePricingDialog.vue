<template>
  <DialogContent class="sm:max-w-[450px]">
    <DialogHeader>
      <DialogTitle>Delete Price Rule</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this price rule?
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 space-y-4">
      <!-- Pricing Rule Information -->
      <div class="p-4 border rounded-md bg-muted/20">
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <Badge variant="destructive" class="mb-1">
              Deleting
            </Badge>
          </div>
          
          <div class="space-y-2">
            <div>
              <p class="text-sm text-muted-foreground">Customer</p>
              <p class="font-medium">{{ pricingRule.customerName }}</p>
            </div>
            
            <div>
              <p class="text-sm text-muted-foreground">Product</p>
              <p class="font-medium">{{ pricingRule.productName }}</p>
            </div>
            
            <div class="flex justify-between items-center pt-2 border-t">
              <div>
                <p class="text-sm text-muted-foreground">Discount Type</p>
                <p class="font-medium">{{ formatDiscountType(pricingRule.discountType) }}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Amount</p>
                <p class="font-medium">{{ formatAmount(pricingRule.amount, pricingRule.discountType) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Warning message -->
      <div class="rounded-md bg-destructive/10 p-3 border border-destructive/20">
        <div class="flex items-start">
          <AlertTriangleIcon class="h-5 w-5 text-destructive mr-2 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-destructive">This action cannot be undone</p>
            <p class="text-xs text-destructive/90 mt-1">
              Deleting this price rule will remove the special pricing for this customer immediately.
              The customer will be charged regular prices for this product instead.
            </p>
          </div>
        </div>
      </div>

      <!-- Confirmation checkbox -->
      <div class="flex items-center space-x-2">
        <Checkbox id="confirm-delete" v-model:checked="confirmDelete" />
        <Label for="confirm-delete" class="text-sm">
          I understand that this action cannot be undone
        </Label>
      </div>
    </div>

    <DialogFooter>
      <div class="flex space-x-2 w-full justify-end">
        <Button variant="outline" @click="$emit('close')">Cancel</Button>
        <Button 
          variant="destructive"
          @click="handleDelete"
          :disabled="!confirmDelete || isDeleting"
          :class="{ 'opacity-50 cursor-not-allowed': !confirmDelete || isDeleting }"
        >
          <Loader2Icon v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin" />
          <TrashIcon v-else class="h-4 w-4 mr-2" />
          {{ isDeleting ? 'Deleting...' : 'Delete Price Rule' }}
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref } from 'vue'
import { 
  AlertTriangleIcon,
  Loader2Icon,
  TrashIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'

const props = defineProps({
  pricingRule: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'close'])

// State
const confirmDelete = ref(false)
const isDeleting = ref(false)

// Format helpers
const formatDiscountType = (type) => {
  switch (type) {
    case 'percentage':
      return 'Percentage Discount'
    case 'fixed':
      return 'Fixed Amount'
    case 'override':
      return 'Price Override'
    default:
      return type
  }
}

const formatAmount = (amount, type) => {
  if (type === 'percentage') {
    return `${amount}%`
  } else {
    return `$${parseFloat(amount).toFixed(2)}`
  }
}

// Methods
const handleDelete = async () => {
  if (!confirmDelete.value) return
  
  isDeleting.value = true
  
  try {
    // Emit delete event to parent
    emit('delete', props.pricingRule)
  } catch (error) {
    console.error('Error in delete dialog:', error)
  } finally {
    isDeleting.value = false
  }
}
</script>