<template>
  <DialogContent class="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Approve Cycle Count</DialogTitle>
      <DialogDescription>
        Approve this cycle count and apply variance adjustments to inventory
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
            <div class="text-sm text-muted-foreground">Count Date</div>
            <div class="font-medium">{{ formatDate(cycleCount.startedAt || cycleCount.startDate) }}</div>
          </div>
        </div>
      </div>
      
      <!-- Variance summary if there are variances -->
      <div v-if="cycleCount.hasVariance" class="rounded-md border p-4 bg-amber-50 space-y-2">
        <h3 class="text-sm font-medium">Variance Summary</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-muted-foreground">Items with Variance</div>
            <div class="font-medium">{{ varianceItemsCount }}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Net Variance</div>
            <div 
              class="font-medium"
              :class="{
                'text-destructive': totalVariance < 0,
                'text-success': totalVariance > 0
              }"
            >
              {{ totalVariance > 0 ? '+' : '' }}{{ totalVariance }}
            </div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Value Impact</div>
            <div 
              class="font-medium"
              :class="{
                'text-destructive': totalVarianceValue < 0,
                'text-success': totalVarianceValue > 0
              }"
            >
              {{ formatCurrency(totalVarianceValue) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Approval notes -->
      <div class="space-y-2">
        <Label for="notes">Approval Notes</Label>
        <Textarea
          id="notes"
          v-model="notes"
          placeholder="Enter any notes about this approval"
          rows="3"
        />
      </div>
      
      <!-- Warning message -->
      <Alert variant="warning">
        <AlertCircleIcon class="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Approving this count will update inventory quantities to match the counted values.
          This action cannot be undone.
        </AlertDescription>
      </Alert>
    </div>
    
    <DialogFooter>
      <Button type="button" variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button 
        type="button" 
        :disabled="isSubmitting"
        @click="handleApprove"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Approve Count
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { AlertCircleIcon, Loader2Icon } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

const emit = defineEmits(['count-approved', 'close'])

const notes = ref('')
const isSubmitting = ref(false)

// Computed properties for variance data
const varianceItemsCount = computed(() => {
  return props.cycleCount.items?.filter(item => item.hasVariance)?.length || 0
})

const totalVariance = computed(() => {
  if (!props.cycleCount.items) return 0
  return props.cycleCount.items.reduce((total, item) => {
    return total + (item.variance || 0)
  }, 0)
})

const totalVarianceValue = computed(() => {
  if (!props.cycleCount.items) return 0
  return props.cycleCount.items.reduce((total, item) => {
    const variance = item.variance || 0
    const cost = item.cost || 0
    return total + (variance * cost)
  }, 0)
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

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

async function handleApprove() {
  isSubmitting.value = true
  
  try {
    emit('count-approved', props.cycleCount.id, { notes: notes.value })
  } catch (error) {
    console.error('Error approving cycle count:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>