<template>
  <DialogContent class="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Cancel Cycle Count</DialogTitle>
      <DialogDescription>
        Cancel this cycle count and provide a reason for cancellation
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-4 py-2">
      <!-- Basic count information -->
      <div class="rounded-md border p-4 space-y-3">
        <div class="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <div class="text-sm text-muted-foreground">Name</div>
            <div class="font-medium">{{ cycleCount.name }}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Location</div>
            <div class="font-medium">{{ cycleCount.locationName || cycleCount.locationId }}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Status</div>
            <Badge :variant="getStatusVariant(cycleCount.status)">
              {{ formatStatus(cycleCount.status) }}
            </Badge>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Scheduled Date</div>
            <div class="font-medium">{{ formatDate(cycleCount.startDate) }}</div>
          </div>
        </div>
      </div>
      
      <!-- Reason for cancellation -->
      <div class="space-y-2">
        <Label for="reason">Reason for Cancellation</Label>
        <Select v-model="reasonType" required>
          <SelectTrigger id="reasonType">
            <SelectValue placeholder="Select reason type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rescheduled">Rescheduled for Later Date</SelectItem>
            <SelectItem value="staffing">Staffing Issues</SelectItem>
            <SelectItem value="priority">Changed Priority</SelectItem>
            <SelectItem value="technical">Technical Issues</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div class="space-y-2">
        <Label for="details">Additional Details</Label>
        <Textarea
          id="details"
          v-model="reasonDetails"
          placeholder="Provide more details about the cancellation"
          rows="3"
          required
        />
      </div>
      
      <!-- Warning message -->
      <Alert variant="destructive">
        <AlertTriangleIcon class="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Cancelling this count will permanently change its status to "Cancelled".
          Any progress made on this count will be lost.
        </AlertDescription>
      </Alert>
    </div>
    
    <DialogFooter>
      <Button type="button" variant="outline" @click="$emit('close')">
        Go Back
      </Button>
      <Button 
        type="button" 
        variant="destructive"
        :disabled="!isFormValid || isSubmitting"
        @click="handleCancel"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Cancel Count
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { AlertTriangleIcon, Loader2Icon } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

const props = defineProps({
  cycleCount: { type: Object, required: true }
})

const emit = defineEmits(['count-cancelled', 'close'])

const reasonType = ref('')
const reasonDetails = ref('')
const isSubmitting = ref(false)

const isFormValid = computed(() => {
  return reasonType.value && reasonDetails.value.trim().length > 0
})

// Helper functions
function formatDate(dateString) {
  if (!dateString) return '—'
  return format(new Date(dateString), 'MMM d, yyyy')
}

function formatStatus(status) {
  if (!status) return '—'
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStatusVariant(status) {
  switch (status) {
    case 'scheduled': return 'outline'
    case 'in_progress': return 'secondary'
    case 'pending_approval': return 'warning'
    case 'completed': return 'success'
    case 'cancelled': return 'destructive'
    default: return 'outline'
  }
}

async function handleCancel() {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    const fullReason = `[${formatReasonType(reasonType.value)}] ${reasonDetails.value}`
    emit('count-cancelled', props.cycleCount.id, fullReason)
  } catch (error) {
    console.error('Error cancelling cycle count:', error)
  } finally {
    isSubmitting.value = false
  }
}

function formatReasonType(type) {
  switch (type) {
    case 'rescheduled': return 'Rescheduled'
    case 'staffing': return 'Staffing Issues'
    case 'priority': return 'Changed Priority'
    case 'technical': return 'Technical Issues'
    case 'other': return 'Other'
    default: return type
  }
}
</script>