<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ isMultiple ? 'Delete Pricing Rules' : 'Delete Pricing Rule' }}
        </DialogTitle>
        <DialogDescription>
          {{ 
            isMultiple 
              ? `Are you sure you want to delete ${selectedRules.length} pricing rules?` 
              : 'Are you sure you want to delete this pricing rule?' 
          }}
          This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-4">
        <div v-if="!isMultiple && rule" class="rounded-md border p-4">
          <div class="flex items-start gap-4">
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium leading-none">{{ rule.name }}</p>
              <p v-if="rule.description" class="text-sm text-muted-foreground">
                {{ rule.description }}
              </p>
              
              <div class="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">
                  {{ formatRuleType(rule.type) }}
                </Badge>
                <Badge :variant="getStatusVariant(rule)">
                  {{ formatStatus(rule) }}
                </Badge>
                <Badge variant="secondary" v-if="rule.discountValue">
                  {{ formatDiscount(rule) }}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="isMultiple && selectedRules.length > 0" class="space-y-3">
          <p class="text-sm text-muted-foreground">
            You're about to delete the following pricing rules:
          </p>
          <ScrollArea class="h-[200px] rounded-md border p-4">
            <div class="space-y-2">
              <div 
                v-for="(ruleId, index) in selectedRules" 
                :key="ruleId" 
                class="flex items-center justify-between py-1"
              >
                <span class="text-sm">
                  {{ getRuleName(ruleId) || `Rule #${index + 1}` }}
                </span>
                <Badge variant="outline" class="ml-2">
                  {{ formatRuleType(getRuleType(ruleId)) }}
                </Badge>
              </div>
            </div>
          </ScrollArea>
        </div>
        
        <Alert variant="destructive" class="mt-4">
          <AlertCircleIcon class="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Deleting a pricing rule will immediately remove any active discounts for customers.
            {{ 
              isMultiple 
                ? 'This will affect multiple customers and products.' 
                : '' 
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
          {{ isMultiple ? 'Delete Rules' : 'Delete Rule' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import {
  AlertCircleIcon,
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
  rule: {
    type: Object,
    default: null
  },
  selectedRules: {
    type: Array,
    default: () => []
  },
  rules: {
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
  return props.selectedRules && props.selectedRules.length > 0
})

// Methods
function getRuleName(ruleId) {
  const rule = props.rules.find(r => r.id === ruleId)
  return rule ? rule.name : null
}

function getRuleType(ruleId) {
  const rule = props.rules.find(r => r.id === ruleId)
  return rule ? rule.type : null
}

function formatRuleType(type) {
  if (!type) return 'Unknown'
  
  const typeMap = {
    'percentage': 'Percentage',
    'fixed_amount': 'Fixed Amount',
    'buy_x_get_y': 'Buy X Get Y',
    'free_shipping': 'Free Shipping',
    'customer_based': 'Customer Based',
    'customer_group': 'Customer Group'
  }
  
  return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatDiscount(rule) {
  if (!rule.type) return '-'
  
  switch (rule.type) {
    case 'percentage':
      return `${rule.discountValue}%`
    case 'fixed_amount':
      return `$${parseFloat(rule.discountValue).toFixed(2)}`
    case 'buy_x_get_y':
      return `Buy ${rule.conditions?.buyQuantity || 'X'}, Get ${rule.conditions?.getQuantity || 'Y'}`
    case 'free_shipping':
      return 'Free Shipping'
    default:
      return rule.discountValue ? `${rule.discountValue}` : '-'
  }
}

function formatStatus(rule) {
  if (!rule) return 'Unknown'
  
  const now = new Date()
  const startDate = rule.startDate ? new Date(rule.startDate) : null
  const endDate = rule.endDate ? new Date(rule.endDate) : null
  
  if (!rule.isActive) {
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

function getStatusVariant(rule) {
  const status = formatStatus(rule)
  
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
    emit('confirm-delete', props.selectedRules)
  } else {
    emit('confirm-delete', props.rule.id)
  }
}
</script>