<template>
  <DialogContent class="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Delete Item</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this item? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-4 py-2">
      <!-- Item Details -->
      <div class="border rounded-md">
        <div class="flex items-center gap-3 p-4 border-b bg-muted/20">
          <div class="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
            <PackageXIcon class="h-5 w-5 text-destructive" />
          </div>
          <div>
            <div class="font-medium">{{ item.name }}</div>
            <div class="text-xs text-muted-foreground">{{ item.sku }}</div>
          </div>
        </div>
        <div class="p-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-muted-foreground">Status</div>
            <Badge :variant="getStatusVariant(item.status)">
              {{ formatStatus(item.status) }}
            </Badge>
          </div>
          <div>
            <div class="text-muted-foreground">Stock</div>
            <div>{{ item.stockOnHand }} {{ item.unitOfMeasure }}</div>
          </div>
          <div>
            <div class="text-muted-foreground">Locations</div>
            <div>{{ item.locations.length }} locations</div>
          </div>
          <div>
            <div class="text-muted-foreground">Category</div>
            <div>{{ getCategoryName() }}</div>
          </div>
        </div>
      </div>
      
      <!-- Warning -->
      <div class="bg-destructive/10 p-3 rounded-md flex items-start gap-2 text-destructive">
        <AlertTriangleIcon class="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div>
          <div class="font-semibold">Warning:</div>
          <div class="text-sm">
            Deleting this item will permanently remove it from your inventory. Any stock level
            information and location assignments will be lost. 
            <span v-if="item.stockOnHand > 0" class="font-medium">
              This item still has stock on hand.
            </span>
          </div>
        </div>
      </div>
      
      <!-- Confirmation Checkbox -->
      <div class="flex items-center space-x-2 mt-4">
        <Checkbox id="confirm-delete" v-model:checked="confirmDelete" />
        <Label for="confirm-delete" class="font-medium">
          I understand that this action cannot be undone
        </Label>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button 
        variant="destructive" 
        @click="deleteItem" 
        :disabled="!confirmDelete || isSubmitting"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        <Trash2Icon v-else class="mr-2 h-4 w-4" />
        Delete Item
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref } from 'vue'
import {
  AlertTriangleIcon,
  Loader2Icon,
  PackageXIcon,
  Trash2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['delete', 'close'])

// State
const confirmDelete = ref(false)
const isSubmitting = ref(false)

// Helper methods
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

const getCategoryName = () => {
  if (!props.item.categoryId) return 'Uncategorized'
  
  const category = props.categories?.find(c => c.id === props.item.categoryId)
  return category ? category.name : 'Unknown Category'
}

// Delete handler
const deleteItem = async () => {
  if (!confirmDelete.value) return
  
  isSubmitting.value = true
  
  try {
    emit('delete', props.item)
  } catch (error) {
    console.error('Error during deletion:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>