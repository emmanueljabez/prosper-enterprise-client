<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Delete Lead Source</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this lead source? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <div v-if="leadSource" class="rounded-md bg-muted p-4">
          <div class="mb-3 flex items-center justify-between">
            <div class="font-medium">{{ leadSource.name }}</div>
            <Badge :variant="getStatusVariant(leadSource.status)">
              {{ leadSource.status }}
            </Badge>
          </div>
          <div class="text-sm space-y-1">
            <div v-if="leadSource.description" class="flex flex-col mb-2">
              <span class="text-muted-foreground">Description:</span>
              <span>{{ leadSource.description }}</span>
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-muted-foreground">Created Date:</span>
              <span>{{ formatDate(leadSource.created) }}</span>
            </div>
          </div>
        </div>

        <div class="mt-4 text-sm text-destructive">
          <AlertTriangleIcon class="h-4 w-4 inline-block mr-2" />
          <span>Warning: Deleting this lead source will permanently remove it from the system.</span>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Cancel
        </Button>
        <Button variant="destructive" @click="handleDelete">
          <Loader2Icon v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin" />
          <span v-else>Delete Lead Source</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { format, parseISO } from 'date-fns'
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
import { AlertTriangleIcon, Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  leadSource: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'delete'])

const isDeleting = ref(false)

async function handleDelete() {
  isDeleting.value = true

  try {
    emit('delete', props.leadSource)
    emit('update:open', false)
  } catch (error) {
    console.error('Error deleting lead source:', error)
  } finally {
    isDeleting.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

function getStatusVariant(status) {
  if (status.toLowerCase() === 'active') return 'success'
  if (status.toLowerCase() === 'inactive') return 'secondary'
  return 'default'
}
</script>