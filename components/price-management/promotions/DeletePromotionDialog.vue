<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Delete Promotion</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this promotion?
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-6">
      <div class="space-y-4">
        <div class="p-4 border rounded-md bg-muted/50">
          <div class="font-medium">{{ promotion.name }}</div>
          <div class="text-sm text-muted-foreground">{{ promotion.description || 'No description provided' }}</div>
        </div>
        
        <Alert variant="destructive">
          <AlertCircleIcon class="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            This action cannot be undone. This will permanently delete the promotion
            and remove it from all associated products and customer accounts.
          </AlertDescription>
        </Alert>
        
        <div v-if="promotion.usageCount && promotion.usageCount > 0" class="mt-2">
          <Alert variant="warning">
            <AlertTriangleIcon class="h-4 w-4" />
            <AlertTitle>Usage Warning</AlertTitle>
            <AlertDescription>
              This promotion has been used {{ promotion.usageCount }} times. 
              Deleting it will affect historical order data and reporting.
            </AlertDescription>
          </Alert>
        </div>
        
        <div v-if="promotion.status === 'active'" class="mt-2">
          <Alert>
            <AlertTriangleIcon class="h-4 w-4" />
            <AlertTitle>Active Promotion</AlertTitle>
            <AlertDescription>
              This promotion is currently active. Deleting it will immediately 
              affect customers who may be using this promotion.
            </AlertDescription>
          </Alert>
        </div>
        
        <div class="space-y-2">
          <Label for="confirmation" class="text-destructive font-medium">Type "delete" to confirm</Label>
          <Input 
            id="confirmation"
            v-model="confirmText"
            placeholder="delete"
            :class="{ 'border-destructive': confirmationError }"
          />
          <p v-if="confirmationError" class="text-sm text-destructive">{{ confirmationError }}</p>
        </div>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        variant="destructive" 
        :disabled="confirmText.toLowerCase() !== 'delete' || isDeleting"
        @click="handleDelete"
      >
        <Loader2Icon v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
        {{ isDeleting ? 'Deleting...' : 'Delete Promotion' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref } from 'vue'
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const props = defineProps({
  promotion: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'close'])

// Form state
const confirmText = ref('')
const confirmationError = ref('')
const isDeleting = ref(false)

// Delete handler
async function handleDelete() {
  if (confirmText.value.toLowerCase() !== 'delete') {
    confirmationError.value = 'Please type "delete" to confirm'
    return
  }
  
  isDeleting.value = true
  
  try {
    // Pass promotion to parent for deletion
    emit('delete', props.promotion)
  } catch (error) {
    console.error('Error during delete preparation:', error)
    confirmationError.value = 'An error occurred. Please try again.'
  } finally {
    isDeleting.value = false
  }
}
</script>