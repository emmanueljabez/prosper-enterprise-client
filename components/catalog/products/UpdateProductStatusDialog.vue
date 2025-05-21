<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Update Product Status</DialogTitle>
      <DialogDescription>
        Change the status of "{{ product.name }}" ({{ product.sku }})
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-6">
      <div class="space-y-6">
        <div>
          <Label>Current Status</Label>
          <div class="flex items-center mt-1.5">
            <Badge :variant="getStatusVariant(product.status)">
              {{ formatStatus(product.status) }}
            </Badge>
          </div>
        </div>
        
        <div class="space-y-2">
          <Label for="newStatus">New Status</Label>
          <Select v-model="newStatus">
            <SelectTrigger id="newStatus">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div v-if="showReasonField" class="space-y-2">
          <Label for="statusReason">
            Reason
            <span v-if="newStatus === 'archived'" class="text-destructive">*</span>
          </Label>
          <Textarea
            id="statusReason"
            v-model="reason"
            :placeholder="getReasonPlaceholder()"
            rows="3"
            :class="{ 'border-destructive': reasonError }"
          />
          <p v-if="reasonError" class="text-sm text-destructive">{{ reasonError }}</p>
        </div>
        
        <Alert v-if="showWarning" :variant="warningType">
          <AlertCircleIcon v-if="warningType === 'destructive'" class="h-4 w-4" />
          <AlertTriangleIcon v-else class="h-4 w-4" />
          <AlertTitle>{{ warningTitle }}</AlertTitle>
          <AlertDescription>
            {{ warningDescription }}
          </AlertDescription>
        </Alert>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="onCancel">Cancel</Button>
      <Button 
        @click="updateStatus" 
        :disabled="isUpdating || (showReasonField && newStatus === 'archived' && !reason)"
        :variant="newStatus === 'archived' ? 'destructive' : 'default'"
      >
        <Loader2Icon v-if="isUpdating" class="mr-2 h-4 w-4 animate-spin" />
        Update Status
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'cancel'])

// Form state
const newStatus = ref(props.product.status)
const reason = ref(props.product.statusReason || '')
const reasonError = ref('')
const isUpdating = ref(false)

// Show reason field for certain status changes
const showReasonField = computed(() => {
  return newStatus.value === 'archived' || newStatus.value === 'out_of_stock'
})

// Warnings for status changes
const showWarning = computed(() => {
  if (newStatus.value === 'archived' && props.product.status !== 'archived') {
    return true
  }
  
  if (newStatus.value === 'active' && props.product.stock?.available <= 0) {
    return true
  }
  
  return false
})

const warningType = computed(() => {
  if (newStatus.value === 'archived') {
    return 'destructive'
  }
  return 'warning'
})

const warningTitle = computed(() => {
  if (newStatus.value === 'archived') {
    return 'Archive Product'
  }
  if (newStatus.value === 'active' && props.product.stock?.available <= 0) {
    return 'Insufficient Stock'
  }
  return 'Warning'
})

const warningDescription = computed(() => {
  if (newStatus.value === 'archived') {
    return 'Archived products will be hidden from all sales channels. This action is reversible, but may affect existing links and references.'
  }
  if (newStatus.value === 'active' && props.product.stock?.available <= 0) {
    return 'This product has no available stock. Setting it to active may lead to order issues unless backorders are enabled.'
  }
  return ''
})

// Helper functions
function formatStatus(status) {
  if (!status) return 'Unknown'
  
  const statusMap = {
    'active': 'Active',
    'draft': 'Draft',
    'archived': 'Archived',
    'out_of_stock': 'Out of Stock'
  }
  
  return statusMap[status] || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getStatusVariant(status) {
  const variants = {
    'active': 'success',
    'draft': 'secondary',
    'archived': 'outline',
    'out_of_stock': 'destructive'
  }
  return variants[status] || 'default'
}

function getReasonPlaceholder() {
  if (newStatus.value === 'archived') {
    return 'Why is this product being archived?'
  }
  if (newStatus.value === 'out_of_stock') {
    return 'Optional: Why is this product out of stock? (e.g., "Supplier delay", "Discontinued")'
  }
  return 'Reason for status change'
}

function validateForm() {
  let isValid = true
  reasonError.value = ''
  
  if (newStatus.value === 'archived' && !reason.value.trim()) {
    reasonError.value = 'A reason is required when archiving a product'
    isValid = false
  }
  
  return isValid
}

// Action handlers
async function updateStatus() {
  if (!validateForm()) return
  
  isUpdating.value = true
  
  try {
    emit('update', {
      id: props.product.id,
      status: newStatus.value,
      reason: reason.value
    })
  } catch (error) {
    console.error('Error updating product status:', error)
  } finally {
    isUpdating.value = false
  }
}

function onCancel() {
  emit('cancel')
}
</script>