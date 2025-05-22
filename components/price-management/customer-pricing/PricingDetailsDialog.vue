<template>
  <DialogContent class="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Price Rule Details</DialogTitle>
      <DialogDescription>
        View details for the price rule applied to {{ pricingRule.customerName }}
      </DialogDescription>
    </DialogHeader>

    <div class="py-4">
      <!-- Price Rule Information -->
      <div class="space-y-6">
        <!-- Header with Status -->
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">{{ pricingRule.customerName }} &mdash; {{ pricingRule.productName }}</h3>
          <Badge :variant="getStatusBadgeVariant(pricingRule.status)">
            {{ pricingRule.status }}
          </Badge>
        </div>

        <!-- Main Details -->
        <div class="grid grid-cols-2 gap-4 p-4 border rounded-md bg-muted/20">
          <div>
            <p class="text-sm text-muted-foreground">Customer</p>
            <p class="font-medium">{{ pricingRule.customerName }}</p>
            <p class="text-xs text-muted-foreground">ID: {{ pricingRule.customerId }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Product</p>
            <p class="font-medium">{{ pricingRule.productName }}</p>
            <p class="text-xs text-muted-foreground">ID: {{ pricingRule.productId }}</p>
          </div>

          <div>
            <p class="text-sm text-muted-foreground">Discount Type</p>
            <p class="font-medium">{{ formatDiscountType(pricingRule.discountType) }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Amount</p>
            <p class="font-medium">{{ formatAmount(pricingRule.amount, pricingRule.discountType) }}</p>
          </div>

          <div>
            <p class="text-sm text-muted-foreground">Regular Price</p>
            <p class="font-medium">${{ pricingRule.productPrice?.toFixed(2) || '—' }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Customer Price</p>
            <p class="font-medium text-primary">${{ pricingRule.calculatedPrice?.toFixed(2) || '—' }}</p>
            <p v-if="showSavings" class="text-xs text-muted-foreground">
              {{ savingsText }}
            </p>
          </div>

          <div>
            <p class="text-sm text-muted-foreground">Start Date</p>
            <p class="font-medium">{{ formatDate(pricingRule.startDate) }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">End Date</p>
            <p class="font-medium">{{ formatDate(pricingRule.endDate) || 'No end date' }}</p>
          </div>

          <div v-if="pricingRule.createdAt" class="col-span-2 border-t pt-2">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Created</p>
                <p class="text-sm">{{ formatDate(pricingRule.createdAt, true) }}</p>
              </div>
              <div v-if="pricingRule.updatedAt && pricingRule.updatedAt !== pricingRule.createdAt">
                <p class="text-sm text-muted-foreground">Last Updated</p>
                <p class="text-sm">{{ formatDate(pricingRule.updatedAt, true) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div v-if="pricingRule.notes" class="space-y-2">
          <h4 class="text-sm font-medium">Notes</h4>
          <div class="p-3 bg-muted rounded-md text-sm">
            {{ pricingRule.notes }}
          </div>
        </div>
      </div>
    </div>

    <DialogFooter>
      <div class="flex justify-between w-full">
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontalIcon class="h-4 w-4 mr-2" />
                Actions
                <ChevronDownIcon class="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem @click="$emit('edit-pricing', pricingRule)">
                <PencilIcon class="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem @click="$emit('duplicate-pricing', pricingRule)">
                <CopyIcon class="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="$emit('update-status', pricingRule)">
                <ToggleLeftIcon class="h-4 w-4 mr-2" />
                Change Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="$emit('delete-pricing', pricingRule)" class="text-destructive focus:text-destructive">
                <TrashIcon class="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button @click="$emit('close')">Close</Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'
import { 
  ChevronDownIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PencilIcon,
  ToggleLeftIcon,
  TrashIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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

const emit = defineEmits([
  'edit-pricing', 
  'duplicate-pricing', 
  'delete-pricing', 
  'update-status',
  'close'
])

// Format helpers
const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return null
  
  try {
    const date = parseISO(dateString)
    return format(date, includeTime ? 'MMM d, yyyy h:mm a' : 'MMM d, yyyy')
  } catch (e) {
    console.error('Error formatting date:', e)
    return dateString
  }
}

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

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    case 'scheduled':
      return 'warning'
    default:
      return 'outline'
  }
}

// Computed properties
const showSavings = computed(() => {
  if (!props.pricingRule.productPrice || !props.pricingRule.calculatedPrice) {
    return false
  }
  
  return props.pricingRule.calculatedPrice < props.pricingRule.productPrice
})

const savingsText = computed(() => {
  if (!showSavings.value) return ''
  
  const regularPrice = props.pricingRule.productPrice
  const customerPrice = props.pricingRule.calculatedPrice
  
  const savingsAmount = regularPrice - customerPrice
  const savingsPercent = (savingsAmount / regularPrice) * 100
  
  return `Saves $${savingsAmount.toFixed(2)} (${savingsPercent.toFixed(0)}%)`
})
</script>