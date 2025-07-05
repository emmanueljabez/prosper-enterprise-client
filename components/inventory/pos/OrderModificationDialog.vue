<template>
  <div class="space-y-6">
    <DialogHeader>
      <DialogTitle class="flex items-center gap-2">
        <Edit class="h-5 w-5" />
        Modify Order #{{ order?.orderNumber }}
      </DialogTitle>
      <DialogDescription>
        Make changes to items, quantities, or special instructions
      </DialogDescription>
    </DialogHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Current Order Items -->
      <div class="space-y-4">
        <h3 class="font-medium">Current Items</h3>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="(item, index) in modifiedOrder.items"
            :key="`${item.id}-${index}`"
            class="flex items-center justify-between p-3 border rounded-lg"
          >
            <div class="flex-1">
              <p class="font-medium">{{ item.name }}</p>
              <p class="text-sm text-muted-foreground">
                ${{ item.price }} each
              </p>
              <p v-if="item.specialInstructions" class="text-xs text-blue-600">
                Note: {{ item.specialInstructions }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <!-- Quantity Controls -->
              <div class="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  @click="decrementQuantity(index)"
                  :disabled="item.quantity <= 1"
                >
                  <Minus class="h-3 w-3" />
                </Button>
                <span class="w-8 text-center">{{ item.quantity }}</span>
                <Button
                  variant="outline"
                  size="sm"
                  @click="incrementQuantity(index)"
                >
                  <Plus class="h-3 w-3" />
                </Button>
              </div>
              
              <!-- Actions -->
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem @click="editItemInstructions(index)">
                    <Edit class="mr-2 h-4 w-4" />
                    Edit Instructions
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="removeItem(index)">
                    <Trash2 class="mr-2 h-4 w-4" />
                    Remove Item
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <!-- Add New Items -->
      <div class="space-y-4">
        <h3 class="font-medium">Add Items</h3>
        
        <!-- Category Filter -->
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="category in categories"
            :key="category.id"
            variant="outline"
            size="sm"
            :class="{ 'bg-primary text-primary-foreground': selectedCategory === category.id }"
            @click="selectedCategory = category.id"
          >
            {{ category.name }}
          </Button>
        </div>

        <!-- Menu Items -->
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="item in filteredMenuItems"
            :key="item.id"
            class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            @click="addItem(item)"
          >
            <div>
              <p class="font-medium">{{ item.name }}</p>
              <p class="text-sm text-muted-foreground">${{ item.price }}</p>
            </div>
            <Plus class="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>

    <!-- Order Summary -->
    <div class="border-t pt-4 space-y-3">
      <div class="flex justify-between">
        <span>Subtotal</span>
        <span>${{ orderSummary.subtotal.toFixed(2) }}</span>
      </div>
      <div class="flex justify-between">
        <span>Tax</span>
        <span>${{ orderSummary.tax.toFixed(2) }}</span>
      </div>
      <div class="flex justify-between font-bold">
        <span>Total</span>
        <span>${{ orderSummary.total.toFixed(2) }}</span>
      </div>
      
      <!-- Change Indicator -->
      <div v-if="hasChanges" class="text-sm text-orange-600 flex items-center gap-1">
        <AlertCircle class="h-4 w-4" />
        Order has been modified
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <Button variant="outline" @click="cancel">
        Cancel
      </Button>
      <Button
        :disabled="!hasChanges"
        @click="saveChanges"
      >
        <Save class="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>

    <!-- Special Instructions Dialog -->
    <Dialog v-model:open="showInstructionsDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Special Instructions</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <Textarea
            v-model="currentInstructions"
            placeholder="Enter special instructions for this item..."
            rows="3"
          />
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="showInstructionsDialog = false">
              Cancel
            </Button>
            <Button @click="saveInstructions">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Edit,
  Plus,
  Minus,
  MoreVertical,
  Trash2,
  Save,
  AlertCircle
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'

const { toast } = useToast()

// Props
const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  menuItems: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['save-changes', 'cancel'])

// State
const modifiedOrder = ref({ ...props.order })
const selectedCategory = ref(null)
const showInstructionsDialog = ref(false)
const currentInstructions = ref('')
const editingItemIndex = ref(-1)

// Computed
const categories = computed(() => {
  const categoryMap = new Map()
  props.menuItems.forEach(item => {
    if (item.category && !categoryMap.has(item.categoryId)) {
      categoryMap.set(item.categoryId, {
        id: item.categoryId,
        name: item.category
      })
    }
  })
  return Array.from(categoryMap.values())
})

const filteredMenuItems = computed(() => {
  if (!selectedCategory.value) return props.menuItems
  return props.menuItems.filter(item => item.categoryId === selectedCategory.value)
})

const orderSummary = computed(() => {
  const subtotal = modifiedOrder.value.items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  )
  const tax = subtotal * 0.08 // 8% tax rate
  const total = subtotal + tax
  
  return { subtotal, tax, total }
})

const hasChanges = computed(() => {
  return JSON.stringify(modifiedOrder.value) !== JSON.stringify(props.order)
})

// Methods
const incrementQuantity = (index) => {
  modifiedOrder.value.items[index].quantity += 1
}

const decrementQuantity = (index) => {
  if (modifiedOrder.value.items[index].quantity > 1) {
    modifiedOrder.value.items[index].quantity -= 1
  }
}

const removeItem = (index) => {
  modifiedOrder.value.items.splice(index, 1)
  toast({
    title: 'Item removed',
    description: 'Item has been removed from the order'
  })
}

const addItem = (item) => {
  const existingItem = modifiedOrder.value.items.find(i => i.id === item.id)
  
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    modifiedOrder.value.items.push({
      ...item,
      quantity: 1,
      specialInstructions: ''
    })
  }
  
  toast({
    title: 'Item added',
    description: `${item.name} has been added to the order`
  })
}

const editItemInstructions = (index) => {
  editingItemIndex.value = index
  currentInstructions.value = modifiedOrder.value.items[index].specialInstructions || ''
  showInstructionsDialog.value = true
}

const saveInstructions = () => {
  if (editingItemIndex.value >= 0) {
    modifiedOrder.value.items[editingItemIndex.value].specialInstructions = currentInstructions.value
  }
  showInstructionsDialog.value = false
  editingItemIndex.value = -1
  currentInstructions.value = ''
}

const saveChanges = () => {
  emit('save-changes', {
    ...modifiedOrder.value,
    summary: orderSummary.value,
    modifiedAt: new Date().toISOString()
  })
  
  toast({
    title: 'Order updated',
    description: 'Order modifications have been saved'
  })
}

const cancel = () => {
  emit('cancel')
}
</script>

<style scoped>
/* Custom styles for order modification dialog */
</style>
