<template>
    <Dialog :open="open" @update:open="handleOpenChange">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The lead will be permanently removed from your system.
          </DialogDescription>
        </DialogHeader>
  
        <div class="py-4">
          <div v-if="lead" class="flex items-start gap-4">
            <div class="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
              <UserIcon class="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 class="font-medium">{{ lead.firstName }} {{ lead.lastName }}</h3>
              <p class="text-sm text-muted-foreground">{{ lead.email }}</p>
              <p v-if="lead.companyName" class="text-sm text-muted-foreground">{{ lead.companyName }}</p>
              <p class="text-xs mt-1"><Badge>{{ formatLeadType(lead.leadType) }}</Badge></p>
            </div>
          </div>
  
          <div v-else-if="leadsCount" class="py-2">
            <AlertCircleIcon class="h-6 w-6 text-destructive mb-2" />
            <p class="font-medium">Delete {{ leadsCount }} leads?</p>
            <p class="text-sm text-muted-foreground mt-1">
              You're about to delete {{ leadsCount }} leads from your system.
            </p>
          </div>
  
          <div class="mt-4 text-sm text-destructive">
            <AlertTriangleIcon class="h-4 w-4 inline-block mr-2" />
            Warning: This will permanently delete all associated notes and activity history.
          </div>
        </div>
  
        <DialogFooter>
          <Button variant="outline" @click="handleCancel" :disabled="isDeleting">
            Cancel
          </Button>
          <Button variant="destructive" @click="handleConfirmDelete" :disabled="isDeleting">
            <LoaderIcon v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </template>
  
  
  <script setup>
  import { ref } from 'vue'
  import { UserIcon, AlertCircleIcon, AlertTriangleIcon, LoaderIcon } from 'lucide-vue-next'
  
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
  } from '@/components/ui/dialog'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  
  // Props
  const props = defineProps({
    open: {
      type: Boolean,
      default: false
    },
    lead: {
      type: Object,
      default: null
    },
    leadsCount: {
      type: Number,
      default: 0
    }
  })
  
  // State
  const isDeleting = ref(false)
  
  // Emits
  const emit = defineEmits(['update:open', 'delete', 'cancel'])
  
  // Format lead type for display
  function formatLeadType(type) {
    if (!type) return 'Unknown';
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Handle dialog open state changes
  const handleOpenChange = (open) => {
    if (!isDeleting.value) {
      emit('update:open', open)
    }
  }
  
  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    isDeleting.value = true
    
    try {
      await emit('delete', props.lead || props.leadsCount)
    } finally {
      isDeleting.value = false
      emit('update:open', false)
    }
  }
  
  // Handle cancel
  const handleCancel = () => {
    emit('cancel')
    emit('update:open', false)
  }
  </script>