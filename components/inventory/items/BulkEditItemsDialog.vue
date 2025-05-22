<template>
  <DialogContent class="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle>Bulk Edit Items</DialogTitle>
      <DialogDescription>
        Update multiple inventory items at once.
        {{ selectedItems.length }} {{ selectedItems.length === 1 ? 'item' : 'items' }} selected.
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-6 py-4">
      <!-- Selected items summary -->
      <div class="bg-muted/40 p-3 rounded-md">
        <div class="flex items-center justify-between">
          <div class="font-medium">Selected Items</div>
          <Button 
            variant="ghost" 
            size="sm" 
            class="h-8 gap-1"
            @click="showSelectedItems = !showSelectedItems"
          >
            {{ showSelectedItems ? 'Hide' : 'Show' }}
            <ChevronDown 
              v-if="!showSelectedItems" 
              class="h-4 w-4"
            />
            <ChevronUp 
              v-else 
              class="h-4 w-4"
            />
          </Button>
        </div>
        
        <div v-if="showSelectedItems" class="mt-2 max-h-[150px] overflow-y-auto border rounded-md">
          <ul class="py-1">
            <li 
              v-for="item in selectedItems" 
              :key="item.id"
              class="px-3 py-1.5 text-sm border-b last:border-b-0 flex justify-between"
            >
              <div>
                <span class="font-medium">{{ item.name }}</span>
                <span class="text-muted-foreground ml-2">{{ item.sku }}</span>
              </div>
              <Badge :variant="getStatusVariant(item.status)">
                {{ formatStatus(item.status) }}
              </Badge>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Select fields to edit -->
      <div class="space-y-3">
        <div class="font-medium mb-2">Choose what to update</div>
        
        <div class="grid grid-cols-2 gap-3">
          <div class="flex items-center space-x-2 border rounded-md p-3">
            <Checkbox 
              id="edit-status" 
              v-model:checked="fieldsToUpdate.status"
            />
            <Label for="edit-status">Status</Label>
          </div>
          
          <div class="flex items-center space-x-2 border rounded-md p-3">
            <Checkbox 
              id="edit-category" 
              v-model:checked="fieldsToUpdate.category"
            />
            <Label for="edit-category">Category</Label>
          </div>
          
          <div class="flex items-center space-x-2 border rounded-md p-3">
            <Checkbox 
              id="edit-reorder-point" 
              v-model:checked="fieldsToUpdate.reorderPoint"
            />
            <Label for="edit-reorder-point">Reorder Point</Label>
          </div>
          
          <div class="flex items-center space-x-2 border rounded-md p-3">
            <Checkbox 
              id="edit-reorder-qty" 
              v-model:checked="fieldsToUpdate.reorderQuantity"
            />
            <Label for="edit-reorder-qty">Reorder Quantity</Label>
          </div>
        </div>
      </div>
      
      <!-- Edit fields -->
      <div class="space-y-4">
        <!-- Status update -->
        <div v-if="fieldsToUpdate.status" class="space-y-2 border rounded-md p-4">
          <Label for="bulk-status">Status</Label>
          <Select v-model="updateData.status">
            <SelectTrigger id="bulk-status">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>
          
          <div v-if="updateData.status === 'discontinued'" class="mt-3 space-y-2">
            <Label for="status-reason">Reason for Discontinuing</Label>
            <Textarea
              id="status-reason"
              v-model="updateData.statusReason"
              placeholder="Explain why these items are being discontinued"
              rows="2"
            />
          </div>
        </div>
        
        <!-- Category update -->
        <div v-if="fieldsToUpdate.category" class="space-y-2 border rounded-md p-4">
          <Label for="bulk-category">Category</Label>
          <Select v-model="updateData.categoryId">
            <SelectTrigger id="bulk-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <!-- Reorder settings update -->
        <div 
          v-if="fieldsToUpdate.reorderPoint || fieldsToUpdate.reorderQuantity"
          class="space-y-3 border rounded-md p-4"
        >
          <h3 class="font-medium">Reorder Settings</h3>
          
          <div v-if="fieldsToUpdate.reorderPoint" class="space-y-2">
            <Label for="bulk-reorder-point">Reorder Point</Label>
            <Input
              id="bulk-reorder-point"
              v-model.number="updateData.reorderPoint"
              type="number"
              min="0"
              placeholder="0"
            />
            <p class="text-xs text-muted-foreground">
              Minimum quantity before reordering
            </p>
          </div>
          
          <div v-if="fieldsToUpdate.reorderQuantity" class="space-y-2">
            <Label for="bulk-reorder-qty">Reorder Quantity</Label>
            <Input
              id="bulk-reorder-qty"
              v-model.number="updateData.reorderQuantity"
              type="number"
              min="0"
              placeholder="0"
            />
            <p class="text-xs text-muted-foreground">
              Quantity to order when reordering
            </p>
          </div>
        </div>
      </div>
      
      <!-- Warning -->
      <Alert variant="warning" v-if="hasSelectedOptions">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          This action will update {{ selectedItems.length }} {{ selectedItems.length === 1 ? 'item' : 'items' }} at once. 
          <strong>This cannot be undone</strong> and will overwrite existing values.
        </AlertDescription>
      </Alert>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        :disabled="!hasSelectedOptions || isSubmitting" 
        @click="submitBulkUpdate"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Update {{ selectedItems.length }} {{ selectedItems.length === 1 ? 'Item' : 'Items' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  selectedItems: {
    type: Array,
    required: true
  },
  locations: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['items-updated', 'close'])

// UI state
const showSelectedItems = ref(false)
const isSubmitting = ref(false)

// Fields to update
const fieldsToUpdate = reactive({
  status: false,
  category: false,
  reorderPoint: false,
  reorderQuantity: false
})

// Update data
const updateData = reactive({
  status: '',
  statusReason: '',
  categoryId: '',
  reorderPoint: null,
  reorderQuantity: null
})

// Computed properties
const hasSelectedOptions = computed(() => {
  return Object.values(fieldsToUpdate).some(value => value === true)
})

// Formatting functions
const formatStatus = (status) => {
  switch (status) {
    case 'active':
      return 'Active'
    case 'out_of_stock':
      return 'Out of Stock'
    case 'low_stock':
      return 'Low Stock'
    case 'discontinued':
      return 'Discontinued'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'out_of_stock':
      return 'destructive'
    case 'low_stock':
      return 'warning'
    case 'discontinued':
      return 'outline'
    default:
      return 'default'
  }
}

// Submit function
const submitBulkUpdate = () => {
  if (!hasSelectedOptions.value) return
  
  isSubmitting.value = true
  
  // Build the updates object with only the fields that should be updated
  const updates = {}
  
  if (fieldsToUpdate.status && updateData.status) {
    updates.status = updateData.status
    
    // Include status reason if discontinuing items
    if (updateData.status === 'discontinued' && updateData.statusReason) {
      updates.statusReason = updateData.statusReason
    }
  }
  
  if (fieldsToUpdate.category && updateData.categoryId) {
    updates.categoryId = updateData.categoryId
  }
  
  if (fieldsToUpdate.reorderPoint && updateData.reorderPoint !== null) {
    updates.reorderPoint = updateData.reorderPoint
  }
  
  if (fieldsToUpdate.reorderQuantity && updateData.reorderQuantity !== null) {
    updates.reorderQuantity = updateData.reorderQuantity
  }
  
  // Emit the updates
  emit('items-updated', props.selectedItems, updates)
  
  // Reset submission state
  setTimeout(() => {
    isSubmitting.value = false
  }, 500)
}
</script>