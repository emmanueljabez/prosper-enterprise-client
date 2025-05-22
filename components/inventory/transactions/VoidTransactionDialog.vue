<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Void Transaction</DialogTitle>
      <DialogDescription>
        Are you sure you want to void this transaction? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-4 py-4">
      <div class="rounded-md bg-muted p-4">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="text-muted-foreground">Reference:</div>
          <div class="font-medium">{{ transaction.referenceNumber }}</div>
          
          <div class="text-muted-foreground">Type:</div>
          <div>
            <Badge :variant="getTypeVariant(transaction.type)">
              {{ formatTransactionType(transaction.type) }}
            </Badge>
          </div>
          
          <div class="text-muted-foreground">Date:</div>
          <div>{{ formatDate(transaction.transactionDate) }}</div>
          
          <div class="text-muted-foreground">Value:</div>
          <div>{{ formatCurrency(transaction.totalValue) }}</div>
        </div>
      </div>
      
      <div class="space-y-2">
        <Label for="void-reason" class="text-left">Reason for Voiding <span class="text-destructive">*</span></Label>
        <Textarea 
          id="void-reason" 
          v-model="voidReason" 
          placeholder="Please explain why this transaction is being voided..." 
          :class="{ 'border-destructive focus-visible:ring-destructive': reasonError }"
          rows="3"
          required
        />
        <p v-if="reasonError" class="text-sm text-destructive">
          {{ reasonError }}
        </p>
      </div>
    </div>
    
    <DialogFooter>
      <div class="flex w-full justify-between sm:justify-end gap-2">
        <Button variant="outline" @click="$emit('close')">
          Cancel
        </Button>
        <Button 
          variant="destructive" 
          @click="handleVoidConfirm"
          :disabled="isSubmitting"
        >
          <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          <span>{{ isSubmitting ? 'Voiding...' : 'Void Transaction' }}</span>
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref } from 'vue'
import { format } from 'date-fns'
import { Loader2Icon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const props = defineProps({
  transaction: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'void-confirmed'])

// State
const voidReason = ref('')
const reasonError = ref('')
const isSubmitting = ref(false)

// Methods
const handleVoidConfirm = () => {
  // Validate reason
  if (!voidReason.value.trim()) {
    reasonError.value = 'Please provide a reason for voiding this transaction'
    return
  }
  
  if (voidReason.value.trim().length < 5) {
    reasonError.value = 'Reason must be at least 5 characters'
    return
  }
  
  reasonError.value = ''
  isSubmitting.value = true
  
  // Emit event to parent with transaction ID and reason
  emit('void-confirmed', props.transaction.id, voidReason.value.trim())
  
  // Note: The actual API call happens in the parent component
  // We'll set isSubmitting back to false once the parent component completes the operation
}

// Formatters
const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString || 'N/A'
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(value || 0)
}

const formatTransactionType = (type) => {
  switch (type) {
    case 'receive': return 'Receive'
    case 'issue': return 'Issue'
    case 'transfer': return 'Transfer'
    case 'adjustment': return 'Adjustment'
    case 'count': return 'Count'
    case 'return': return 'Return'
    default: return type?.charAt(0).toUpperCase() + type?.slice(1) || 'Unknown'
  }
}

const getTypeVariant = (type) => {
  switch (type) {
    case 'receive': return 'success'
    case 'issue': return 'blue'
    case 'transfer': return 'purple'
    case 'adjustment': return 'yellow'
    case 'count': return 'secondary'
    case 'return': return 'pink'
    default: return 'default'
  }
}
</script>