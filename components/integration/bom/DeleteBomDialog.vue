<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Bill of Materials</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this BOM? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-4">
        <div v-if="loading" class="flex justify-center">
          <Loader2Icon class="h-6 w-6 animate-spin text-primary" />
        </div>
        <div v-else-if="bom" class="border rounded-md p-4">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0 h-10 w-10 rounded-md bg-red-50 flex items-center justify-center">
              <LayersIcon class="h-5 w-5 text-red-500" />
            </div>
            <div>
              <div class="font-medium">{{ bom.name }}</div>
              <div class="text-sm text-muted-foreground">Version {{ bom.version }} | {{ bom.productName }}</div>
            </div>
          </div>
          
          <div class="mt-4 text-sm">
            <p class="text-muted-foreground">This will delete:</p>
            <ul class="list-disc list-inside mt-2 space-y-1">
              <li>The BOM definition and all its versions</li>
              <li>{{ bom.components?.length || 0 }} component references</li>
              <li>{{ bom.steps?.length || 0 }} assembly steps</li>
              <li>{{ bom.qualityChecks?.length || 0 }} quality checks</li>
            </ul>
            
            <div v-if="hasAssociatedWorkOrders" class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
              <div class="flex items-center gap-2">
                <AlertTriangleIcon class="h-4 w-4" />
                <span class="font-medium">Warning</span>
              </div>
              <p class="mt-1">This BOM is used in active work orders. Deleting it may affect production planning.</p>
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
          Delete BOM
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
  LayersIcon, 
  AlertTriangleIcon,
  Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  bom: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  workOrders: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:open', 'delete'])

const hasAssociatedWorkOrders = computed(() => {
  if (!props.bom || !props.workOrders || props.workOrders.length === 0) {
    return false
  }
  return props.workOrders.some(wo => wo.bomId === props.bom.id && wo.status !== 'completed' && wo.status !== 'cancelled')
})

const confirmDelete = () => {
  emit('delete', props.bom.id)
}
</script>