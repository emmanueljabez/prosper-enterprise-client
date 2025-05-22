<template>
  <DialogContent class="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Update Item Status</DialogTitle>
      <DialogDescription>
        Change the status for {{ item.name }} ({{ item.sku }})
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-4 py-2">
      <!-- Item Badge -->
      <div class="flex items-center justify-between bg-muted/40 p-3 rounded-md">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
            <BoxIcon class="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div class="font-medium">{{ item.name }}</div>
            <div class="text-xs text-muted-foreground">{{ item.sku }}</div>
          </div>
        </div>
        <Badge :variant="getStatusVariant(item.status)">
          {{ formatStatus(item.status) }}
        </Badge>
      </div>
      
      <!-- Status Selection -->
      <div class="space-y-2">
        <Label for="status" required>New Status</Label>
        <Select v-model="selectedStatus" :error="errors.status">
          <SelectTrigger id="status">
            <SelectValue placeholder="Select new status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="status in availableStatuses" 
              :key="status.value" 
              :value="status.value"
              :disabled="status.value === item.status"
            >
              {{ status.label }}
              <span v-if="status.value === item.status" class="ml-2 text-xs text-muted-foreground">
                (Current)
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        <p v-if="errors.status" class="text-sm text-destructive">{{ errors.status }}</p>
      </div>
      
      <!-- Status Description -->
      <div v-if="selectedStatus" class="bg-muted/30 p-3 rounded-md">
        <div class="font-medium mb-1">{{ getStatusDescription(selectedStatus).title }}</div>
        <p class="text-sm text-muted-foreground">
          {{ getStatusDescription(selectedStatus).description }}
        </p>
      </div>
      
      <!-- Reason -->
      <div class="space-y-2">
        <Label for="reason" :required="isReasonRequired">Reason for Change</Label>
        <Textarea
          id="reason"
          v-model="statusReason"
          placeholder="Explain why you're changing the status"
          rows="3"
          :error="errors.reason"
        />
        <p v-if="errors.reason" class="text-sm text-destructive">{{ errors.reason }}</p>
        <p v-if="isReasonRequired" class="text-xs text-muted-foreground">
          A reason is required when discontinuing or deactivating an item
        </p>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button @click="updateStatus" :disabled="isSubmitting" :variant="getButtonVariant()">
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Update Status
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  BoxIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['status-updated', 'close'])

// Form data
const selectedStatus = ref('')
const statusReason = ref('')

// Form validation errors
const errors = reactive({
  status: '',
  reason: ''
})

// Submission state
const isSubmitting = ref(false)

// Available statuses
const availableStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'discontinued', label: 'Discontinued' }
]

// Computed properties
const isReasonRequired = computed(() => {
  return selectedStatus.value === 'discontinued'
})

// Helper methods
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

const getButtonVariant = () => {
  if (selectedStatus.value === 'discontinued') {
    return 'destructive'
  }
  return 'default'
}

const getStatusDescription = (status) => {
  switch (status) {
    case 'active':
      return {
        title: 'Active',
        description: 'Item is available for sale and will appear in all relevant listings.'
      }
    case 'low_stock':
      return {
        title: 'Low Stock',
        description: 'Item is available but inventory is low. Will appear with low stock warning.'
      }
    case 'out_of_stock':
      return {
        title: 'Out of Stock',
        description: 'Item is temporarily unavailable due to stock level, but will be restocked.'
      }
    case 'discontinued':
      return {
        title: 'Discontinued',
        description: 'Item will be permanently removed from active inventory and won\'t be restocked.'
      }
    default:
      return {
        title: 'Unknown',
        description: 'Status description not available.'
      }
  }
}

// Validation
const validateForm = () => {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  if (!selectedStatus.value) {
    errors.status = 'Status is required'
    isValid = false
  }
  
  if (isReasonRequired.value && !statusReason.value.trim()) {
    errors.reason = 'Reason is required when discontinuing an item'
    isValid = false
  }
  
  return isValid
}

// Form submission
const updateStatus = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    emit('status-updated', {
      item: props.item,
      status: selectedStatus.value,
      reason: statusReason.value
    })
  } catch (error) {
    console.error('Error updating status:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>