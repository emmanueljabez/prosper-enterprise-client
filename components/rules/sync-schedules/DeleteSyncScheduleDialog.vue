<template>
  <DialogContent class="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Delete Sync Schedule</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this sync schedule? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>

    <div class="py-4">
      <div class="bg-muted rounded-lg p-4">
        <div class="flex items-start gap-3">
          <AlertCircle class="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <p class="font-medium">You're about to delete:</p>
            <p class="text-lg font-semibold mt-1">{{ schedule.name }}</p>
            <p v-if="schedule.description" class="text-sm text-muted-foreground mt-1">
              {{ schedule.description }}
            </p>
            <div class="flex gap-2 mt-3">
              <Badge :variant="schedule.active ? 'success' : 'secondary'">
                {{ schedule.active ? 'Active' : 'Inactive' }}
              </Badge>
              <Badge :variant="getTypeBadgeVariant(schedule.type)">
                {{ formatType(schedule.type) }}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div v-if="dependentItems.length > 0" class="mt-4 border-t pt-4">
        <p class="text-sm font-medium mb-2">This will also affect:</p>
        <ul class="text-sm space-y-1">
          <li v-for="(item, index) in dependentItems" :key="index" class="flex items-center">
            <ArrowRightIcon class="h-3 w-3 mr-2 text-muted-foreground" />
            {{ item }}
          </li>
        </ul>
      </div>

      <div class="mt-4">
        <div class="flex items-center space-x-2">
          <Checkbox 
            id="confirmDelete" 
            v-model:checked="confirmChecked"
          />
          <Label for="confirmDelete" class="text-sm">
            I understand that this action cannot be undone
          </Label>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        variant="destructive" 
        @click="confirmDelete"
        :disabled="!confirmChecked || isDeleting"
      >
        <Loader2Icon v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
        Delete Schedule
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref } from 'vue'
import { 
  AlertCircle,
  ArrowRightIcon,
  Loader2Icon
} from 'lucide-vue-next'
import {
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const props = defineProps({
  schedule: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete-confirmed', 'close'])

// State
const confirmChecked = ref(false)
const isDeleting = ref(false)

// This would normally come from API, showing dependent items that will be affected
const dependentItems = ref([
  "All associated execution history records will be deleted",
  "Any reports referencing this schedule will show it as deleted"
])

// Helper functions
function formatType(type) {
  switch (type) {
    case 'realtime': return 'Real-time'
    case 'batch_high': return 'High Frequency'
    case 'batch_medium': return 'Medium Frequency'
    case 'batch_low': return 'Low Frequency'
    case 'manual': return 'Manual'
    default: return type
  }
}

function getTypeBadgeVariant(type) {
  switch (type) {
    case 'realtime': return 'default'
    case 'batch_high': return 'info'
    case 'batch_medium': return 'secondary'
    case 'batch_low': return 'outline'
    case 'manual': return 'warning'
    default: return 'outline'
  }
}

// Confirm deletion
async function confirmDelete() {
  if (!confirmChecked.value) return

  isDeleting.value = true
  
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    emit('delete-confirmed', props.schedule)
  } catch (error) {
    console.error('Error deleting schedule:', error)
    // Would handle error here
  } finally {
    isDeleting.value = false
  }
}
</script>