<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Work Order</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this work order? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-4">
        <div v-if="loading" class="flex justify-center">
          <Loader2Icon class="h-6 w-6 animate-spin text-primary" />
        </div>
        <div v-else-if="workOrder" class="border rounded-md p-4">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0 h-10 w-10 rounded-md bg-red-50 flex items-center justify-center">
              <ClipboardIcon class="h-5 w-5 text-red-500" />
            </div>
            <div>
              <div class="font-medium">{{ workOrder.orderNumber }}</div>
              <div class="text-sm text-muted-foreground">
                {{ workOrder.productName }} | {{ formatStatus(workOrder.status) }}
              </div>
            </div>
          </div>
          
          <div class="mt-4 text-sm">
            <p class="text-muted-foreground">This will delete:</p>
            <ul class="list-disc list-inside mt-2 space-y-1">
              <li>Work order details and all associated records</li>
              <li>Production history and progress tracking</li>
              <li>{{ workOrder.components?.length || 0 }} material allocations</li>
            </ul>
            
            <div v-if="workOrder.status !== 'planned' && workOrder.status !== 'cancelled'" class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
              <div class="flex items-center gap-2">
                <AlertTriangleIcon class="h-4 w-4" />
                <span class="font-medium">Warning</span>
              </div>
              <p class="mt-1">This work order is {{ formatStatus(workOrder.status).toLowerCase() }}. Deleting it may affect production scheduling and inventory allocations.</p>
            </div>
            
            <div v-if="hasInventoryImpact" class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
              <div class="flex items-center gap-2">
                <AlertTriangleIcon class="h-4 w-4" />
                <span class="font-medium">Inventory Impact</span>
              </div>
              <p class="mt-1">
                This work order has allocated materials. Deleting it will return these materials to available inventory.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
        <Button 
          variant="destructive" 
          :disabled="loading" 
          @click="confirmDelete"
        >
          <Trash2Icon v-if="!loading" class="h-4 w-4 mr-1" />
          <Loader2Icon v-else class="h-4 w-4 mr-1 animate-spin" />
          Delete Work Order
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { 
  Trash2Icon, 
  ClipboardIcon, 
  AlertTriangleIcon,
  Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  workOrder: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'delete'])

const hasInventoryImpact = computed(() => {
  if (!props.workOrder || !props.workOrder.components) {
    return false
  }
  
  return props.workOrder.components.some(component => 
    component.allocatedQuantity > 0 || component.consumedQuantity > 0
  )
})

const formatStatus = (status) => {
  if (!status) return ''
  if (status === 'in_progress') return 'In Progress'
  if (status === 'on_hold') return 'On Hold'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const confirmDelete = () => {
  emit('delete', props.workOrder.id)
}
</script>