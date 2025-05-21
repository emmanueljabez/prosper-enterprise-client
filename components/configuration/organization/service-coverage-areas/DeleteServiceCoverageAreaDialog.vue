<template>
    <Dialog :open="open" @update:open="$emit('update:open', $event)">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Service Area</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this service coverage area? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <div v-if="serviceArea" class="rounded-md bg-muted p-4">
            <div class="mb-3 flex items-center justify-between">
              <div class="font-medium">{{ serviceArea.name }}</div>
              <Badge :variant="getStatusVariant(serviceArea.status)">
                {{ formatStatus(serviceArea.status) }}
              </Badge>
            </div>
            <div class="text-sm space-y-1">
              <div v-if="serviceArea.description" class="flex flex-col mb-2">
                <span class="text-muted-foreground">Description:</span>
                <span>{{ serviceArea.description }}</span>
              </div>
              <div class="flex flex-col mb-2">
                <span class="text-muted-foreground">Coordinates:</span>
                <div class="grid grid-cols-2 gap-2">
                  <span class="text-xs">Lat: {{ formatCoordinate(serviceArea.latitude) }}</span>
                  <span class="text-xs">Long: {{ formatCoordinate(serviceArea.longitude) }}</span>
                </div>
              </div>
              <div class="flex items-baseline justify-between">
                <span class="text-muted-foreground">Created Date:</span>
                <span>{{ formatDate(serviceArea.created) }}</span>
              </div>
            </div>
          </div>
  
          <div v-if="hasAssociatedProducts" class="mt-4 px-4 py-2 bg-amber-50 text-amber-800 rounded-md text-sm">
            <AlertCircleIcon class="h-4 w-4 inline-block mr-2 text-amber-500" />
            <span>This service area is associated with {{ productsCount }} products. Deleting it may affect pricing configurations.</span>
          </div>
  
          <div class="mt-4 text-sm text-destructive">
            <AlertTriangleIcon class="h-4 w-4 inline-block mr-2" />
            <span>Warning: Deleting this service area will permanently remove it from the system.</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="$emit('update:open', false)">
            Cancel
          </Button>
          <Button variant="destructive" @click="handleDelete">
            <Loader2Icon v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin" />
            <span v-else>Delete Service Area</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { format } from 'date-fns'
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
  import { AlertTriangleIcon, AlertCircleIcon, Loader2Icon } from 'lucide-vue-next'
  
  const props = defineProps({
    open: {
      type: Boolean,
      required: true
    },
    serviceArea: {
      type: Object,
      default: null
    }
  })
  
  const emit = defineEmits(['update:open', 'delete'])
  
  const isDeleting = ref(false)
  
  // Show warning if this service area is associated with products
  const hasAssociatedProducts = computed(() => {
    return props.serviceArea?.products?.length > 0;
  })
  
  const productsCount = computed(() => {
    return props.serviceArea?.products?.length || 0;
  })
  
  async function handleDelete() {
    isDeleting.value = true
  
    try {
      emit('delete', props.serviceArea)
      emit('update:open', false)
    } catch (error) {
      console.error('Error deleting service area:', error)
    } finally {
      isDeleting.value = false
    }
  }
  
  function formatDate(dateString) {
    if (!dateString) return ''
    return format(new Date(dateString), 'MMM dd, yyyy')
  }
  
  function formatStatus(status) {
    if (!status) return ''
    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
  }
  
  function formatCoordinate(coord) {
    if (coord === null || coord === undefined) return 'N/A'
    return coord.toFixed(6)
  }
  
  function getStatusVariant(status) {
    if (!status) return 'default'
    
    const statusUpper = status.toUpperCase()
    if (statusUpper === 'ACTIVE') return 'success'
    if (statusUpper === 'INACTIVE') return 'secondary'
    if (statusUpper === 'PLANNED') return 'warning'
    return 'default'
  }
  </script>