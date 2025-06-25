<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle class="flex items-center space-x-2 text-red-600">
        <AlertTriangle class="h-5 w-5" />
        <span>Delete Item</span>
      </DialogTitle>
      <DialogDescription>
        This action cannot be undone. The item will be permanently removed from your inventory.
      </DialogDescription>
    </DialogHeader>

    <div v-if="item" class="space-y-4">
      <!-- Item Info -->
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <PackageIcon class="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 class="font-semibold text-red-900">{{ item.name }}</h3>
            <p class="text-sm text-red-700">{{ item.itemCode }}</p>
            <p v-if="item.description" class="text-xs text-red-600 mt-1">{{ item.description }}</p>
          </div>
        </div>
      </div>

      <!-- Warning Checks -->
      <div class="space-y-3">
        <!-- Stock Warning -->
        <div v-if="hasStock" class="flex items-start space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertCircle class="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-orange-900">Stock on Hand</p>
            <p class="text-xs text-orange-700">
              This item has {{ formatNumber(item.stockOnHand) }} {{ getUnitName(item.baseUnitOfMeasureId || item.unitOfMeasureId) }} in stock.
              Consider transferring or adjusting stock before deletion.
            </p>
          </div>
        </div>

        <!-- Active Transactions Warning -->
        <div v-if="hasActiveTransactions" class="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle class="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-yellow-900">Active Transactions</p>
            <p class="text-xs text-yellow-700">
              This item may have pending orders, invoices, or other transactions. 
              Review these before proceeding.
            </p>
          </div>
        </div>

        <!-- Serial/Lot Tracking Warning -->
        <div v-if="item.isSerialTracked || item.isLotTracked" class="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info class="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-blue-900">Tracking Information</p>
            <p class="text-xs text-blue-700">
              This item has {{ item.isSerialTracked ? 'serial number' : 'lot/batch' }} tracking enabled.
              All tracking records will be deleted.
            </p>
          </div>
        </div>
      </div>

      <!-- Additional Options -->
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <Checkbox id="deleteHistory" v-model:checked="deleteOptions.includeHistory" />
          <Label for="deleteHistory" class="text-sm">Delete transaction history</Label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox id="deleteAttachments" v-model:checked="deleteOptions.includeAttachments" />
          <Label for="deleteAttachments" class="text-sm">Delete attached files and images</Label>
        </div>
      </div>

      <!-- Alternative Actions -->
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-sm font-medium text-gray-900 mb-2">Alternative Actions</p>
        <div class="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            class="w-full justify-start"
            @click="deactivateInstead"
          >
            <Power class="mr-2 h-4 w-4" />
            Deactivate instead of delete
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            class="w-full justify-start"
            @click="archiveInstead"
          >
            <Archive class="mr-2 h-4 w-4" />
            Archive for future reference
          </Button>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button 
        variant="destructive"
        @click="deleteItem"
        :disabled="deleting"
      >
        <Loader2 v-if="deleting" class="mr-2 h-4 w-4 animate-spin" />
        <Trash class="mr-2 h-4 w-4" />
        Delete Item
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { 
  AlertTriangle, AlertCircle, Info, PackageIcon, Trash, 
  Power, Archive, Loader2
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'

// Props
const props = defineProps({
  item: {
    type: Object,
    default: () => null
  },
  units: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['item-deleted', 'close'])

// State
const deleting = ref(false)

const deleteOptions = reactive({
  includeHistory: true,
  includeAttachments: true
})

// Computed
const hasStock = computed(() => {
  return props.item && (props.item.stockOnHand || 0) > 0
})

const hasActiveTransactions = computed(() => {
  return props.item?.isActive
})

// Methods
const deleteItem = async () => {
  console.log('Deleting item:', props.item)
  console.log('Item ID:', props.item?.id)
  
  if (!props.item?.id) {
    console.error('No item ID provided for deletion')
    return
  }
  
  deleting.value = true
  try {
    const deleteData = {
      itemId: props.item.id,
      options: deleteOptions
    }
    
    console.log('Delete data:', deleteData)
    emit('item-deleted', deleteData)
  } catch (error) {
    console.error('Error deleting item:', error)
  } finally {
    deleting.value = false
  }
}

const deactivateInstead = () => {
  // Emit deactivation event and close dialog
  // The parent component can handle the deactivation
  emit('close')
  // Could emit a separate event for deactivation
}

const archiveInstead = () => {
  // Emit archive event and close dialog
  emit('close')
  // Could emit a separate event for archiving
}

const formatNumber = (value) => {
  return new Intl.NumberFormat().format(value || 0)
}

const getUnitName = (unitId) => {
  if (!unitId) return 'units'
  const unit = props.units.find(u => u.id === unitId)
  return unit?.name || unit?.code || 'units'
}
</script>
