<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Update Promotion Status</DialogTitle>
      <DialogDescription>
        Change the status of "{{ promotion.name }}"
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-6">
      <div class="space-y-6">
        <div>
          <Label>Current Status</Label>
          <div class="flex items-center mt-1.5">
            <Badge :variant="getStatusVariant(promotion.status)">
              {{ formatStatus(promotion.status) }}
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
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div v-if="showReasonField" class="space-y-2">
          <Label for="statusReason">
            Reason
            <span v-if="newStatus === 'inactive'" class="text-destructive">*</span>
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
        
        <div v-if="newStatus === 'scheduled'" class="space-y-3">
          <div>
            <Label for="scheduled-start-date">Start Date</Label>
            <Input
              id="scheduled-start-date"
              type="date"
              v-model="startDate"
              :min="today"
            />
          </div>
          
          <div>
            <Label for="scheduled-end-date">End Date (Optional)</Label>
            <Input
              id="scheduled-end-date"
              type="date"
              v-model="endDate"
              :min="startDate || today"
            />
          </div>
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
        :disabled="isUpdating || (newStatus === 'inactive' && showReasonField && !reason)"
        :variant="newStatus === 'inactive' ? 'destructive' : 'default'"
      >
        <Loader2Icon v-if="isUpdating" class="mr-2 h-4 w-4 animate-spin" />
        Update Status
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
import { Input } from '@/components/ui/input'
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { format } from 'date-fns'

const props = defineProps({
  promotion: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['status-updated', 'close'])

// Form state
const newStatus = ref(props.promotion.status)
const reason = ref(props.promotion.statusReason || '')
const reasonError = ref('')
const isUpdating = ref(false)

// Date handling for scheduled promotions
const today = format(new Date(), 'yyyy-MM-dd')
const startDate = ref('')
const endDate = ref('')

// Initialize dates from the promotion if it exists
onMounted(() => {
  if (props.promotion.startDate) {
    try {
      const date = new Date(props.promotion.startDate)
      startDate.value = format(date, 'yyyy-MM-dd')
    } catch (e) {
      console.error('Invalid start date', e)
    }
  }
  
  if (props.promotion.endDate) {
    try {
      const date = new Date(props.promotion.endDate)
      endDate.value = format(date, 'yyyy-MM-dd')
    } catch (e) {
      console.error('Invalid end date', e)
    }
  }
})

// Show reason field for certain status changes
const showReasonField = computed(() => {
  return newStatus.value === 'inactive' && props.promotion.status !== 'inactive'
})

// Warnings for status changes
const showWarning = computed(() => {
  if (newStatus.value === 'inactive' && props.promotion.status === 'active') {
    return true
  }
  
  if (newStatus.value === 'active' && props.promotion.usageCount > 0) {
    return true
  }
  
  return false
})

const warningType = computed(() => {
  if (newStatus.value === 'inactive') {
    return 'destructive'
  }
  return 'warning'
})

const warningTitle = computed(() => {
  if (newStatus.value === 'inactive') {
    return 'Deactivate Promotion'
  }
  if (newStatus.value === 'active' && props.promotion.usageCount > 0) {
    return 'Usage Warning'
  }
  return 'Warning'
})

const warningDescription = computed(() => {
  if (newStatus.value === 'inactive' && props.promotion.status === 'active') {
    return 'Deactivating this promotion will immediately stop it from applying to any orders. Customers may have active carts with this promotion applied.'
  }
  if (newStatus.value === 'active' && props.promotion.usageCount > 0) {
    return `This promotion has already been used ${props.promotion.usageCount} times. Reactivating it may exceed intended usage limits.`
  }
  return ''
})

// Helper functions
function formatStatus(status) {
  if (!status) return 'Unknown'
  
  const statusMap = {
    'active': 'Active',
    'inactive': 'Inactive',
    'scheduled': 'Scheduled',
    'expired': 'Expired'
  }
  
  return statusMap[status] || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getStatusVariant(status) {
  const variants = {
    'active': 'success',
    'inactive': 'secondary',
    'scheduled': 'warning',
    'expired': 'outline'
  }
  return variants[status] || 'default'
}

function getReasonPlaceholder() {
  if (newStatus.value === 'inactive') {
    return 'Why is this promotion being deactivated?'
  }
  return 'Reason for status change'
}

function validateForm() {
  let isValid = true
  reasonError.value = ''
  
  if (newStatus.value === 'inactive' && showReasonField.value && !reason.value.trim()) {
    reasonError.value = 'A reason is required when deactivating a promotion'
    isValid = false
  }
  
  if (newStatus.value === 'scheduled' && !startDate.value) {
    reasonError.value = 'Start date is required for scheduled promotions'
    isValid = false
  }
  
  return isValid
}

// Action handlers
async function updateStatus() {
  if (!validateForm()) return
  
  isUpdating.value = true
  
  try {
    // Create the update payload
    const updateData = {
      promotion: props.promotion,
      status: newStatus.value,
      reason: reason.value
    }
    
    // Add dates for scheduled status
    if (newStatus.value === 'scheduled') {
      updateData.startDate = startDate.value
      updateData.endDate = endDate.value
    }
    
    emit('status-updated', updateData)
  } catch (error) {
    console.error('Error updating promotion status:', error)
  } finally {
    isUpdating.value = false
  }
}

function onCancel() {
  emit('close')
}
</script>