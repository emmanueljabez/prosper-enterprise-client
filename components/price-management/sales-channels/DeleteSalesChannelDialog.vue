<template>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Sales Channel</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this sales channel? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    
    <div v-if="salesChannel" class="py-4">
      <div class="flex items-center space-x-3 mb-4">
        <div class="p-2 rounded-full bg-primary/10">
          <ShoppingBagIcon class="h-5 w-5 text-primary" v-if="salesChannel.type === 'online_store'" />
          <StoreIcon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'retail_store'" />
          <ShoppingCartIcon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'marketplace'" />
          <PackageIcon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'dropshipping'" />
          <Users2Icon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'wholesale'" />
          <PhoneIcon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'direct_sales'" />
          <GlobeIcon class="h-5 w-5 text-primary" v-else />
        </div>
        <div>
          <div class="font-medium">{{ salesChannel.name }}</div>
          <div class="text-xs text-muted-foreground">{{ formatChannelType(salesChannel.type) }}</div>
        </div>
      </div>
      
      <div v-if="salesChannel.description" class="text-sm mb-4">
        {{ salesChannel.description }}
      </div>
      
      <Alert variant="destructive" class="mb-4">
        <AlertCircleIcon class="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Deleting this sales channel will permanently remove all associated pricing configurations, 
          customer group mappings, and product-specific overrides.
        </AlertDescription>
      </Alert>
      
      <div v-if="dependencies.length > 0" class="mb-4">
        <h4 class="text-sm font-medium mb-2">This will also affect:</h4>
        <ul class="text-sm list-disc pl-5 space-y-1">
          <li v-if="dependencies.includes('products')">
            Product pricing specific to this channel
          </li>
          <li v-if="dependencies.includes('customers')">
            Customer orders and pricing rules
          </li>
          <li v-if="dependencies.includes('inventory')">
            Inventory allocations for this channel
          </li>
          <li v-if="dependencies.includes('reports')">
            Historical sales reports and analytics
          </li>
        </ul>
      </div>
      
      <div class="flex items-center space-x-2" v-if="allowTypeConfirmation">
        <Checkbox id="confirm-delete" v-model:checked="typeConfirmationChecked" />
        <label
          for="confirm-delete"
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I understand that this action cannot be undone
        </label>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('cancel')" :disabled="isDeleting">
        Cancel
      </Button>
      <Button 
        variant="destructive" 
        @click="handleDelete" 
        :disabled="isDeleting || (allowTypeConfirmation && !typeConfirmationChecked)"
      >
        <Loader2Icon v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin" />
        Delete Channel
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  AlertCircleIcon,
  GlobeIcon,
  Loader2Icon,
  PackageIcon,
  PhoneIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  StoreIcon,
  Users2Icon
} from 'lucide-vue-next'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'

const props = defineProps({
  salesChannel: {
    type: Object,
    required: true
  },
  dependencies: {
    type: Array,
    default: () => []
  },
  allowTypeConfirmation: {
    type: Boolean,
    default: false
  },
  isDeleting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete', 'cancel'])

const typeConfirmationChecked = ref(false)

function formatChannelType(type) {
  if (!type) return 'Unknown'
  
  const typeMap = {
    'online_store': 'Online Store',
    'marketplace': 'Marketplace',
    'retail_store': 'Retail Store',
    'wholesale': 'Wholesale',
    'dropshipping': 'Dropshipping',
    'direct_sales': 'Direct Sales'
  }
  
  return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function handleDelete() {
  emit('delete', props.salesChannel)
}
</script>