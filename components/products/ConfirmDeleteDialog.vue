<template>
    <Dialog :open="isOpen" @update:open="handleOpenChange">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The product will be permanently removed from your catalog.
          </DialogDescription>
        </DialogHeader>
  
        <div class="py-4">
          <div v-if="product" class="flex items-start gap-4">
            <div class="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
              <Package2Icon class="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 class="font-medium">{{ product.name }}</h3>
              <p class="text-sm text-muted-foreground">{{ product.sku }}</p>
            </div>
          </div>
  
          <div v-else-if="productsCount" class="py-2">
            <AlertCircleIcon class="h-6 w-6 text-destructive mb-2" />
            <p class="font-medium">Delete {{ productsCount }} products?</p>
            <p class="text-sm text-muted-foreground mt-1">
              You're about to delete {{ productsCount }} products from your catalog.
            </p>
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
  import { Package2Icon, AlertCircleIcon, LoaderIcon } from 'lucide-vue-next'
  
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
  } from '@/components/ui/dialog'
  import { Button } from '@/components/ui/button'
  
  // Props
  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: null
    },
    productsCount: {
      type: Number,
      default: 0
    }
  })
  
  // State
  const isDeleting = ref(false)
  
  // Emits
  const emit = defineEmits(['update:open', 'confirm', 'cancel'])
  
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
      await emit('confirm', props.product || props.productsCount)
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