<template>
  <Card class="h-full">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Zap class="h-5 w-5" />
        Quick Service
      </CardTitle>
      <CardDescription>
        Fast ordering for counter service and takeout
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Quick Categories -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button
          v-for="category in quickCategories"
          :key="category.id"
          variant="outline"
          size="sm"
          class="h-16 flex-col gap-1"
          @click="selectQuickCategory(category)"
        >
          <component :is="category.icon" class="h-5 w-5" />
          <span class="text-xs">{{ category.name }}</span>
        </Button>
      </div>

      <!-- Popular Items -->
      <div class="space-y-2">
        <h4 class="font-medium">Popular Items</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          <div
            v-for="item in popularItems"
            :key="item.id"
            class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            @click="addQuickItem(item)"
          >
            <div class="flex-1">
              <p class="font-medium text-sm">{{ item.name }}</p>
              <p class="text-xs text-muted-foreground">${{ item.price }}</p>
            </div>
            <Badge v-if="item.isSpecial" variant="secondary">Special</Badge>
            <Plus class="h-4 w-4 ml-2 text-muted-foreground" />
          </div>
        </div>
      </div>

      <!-- Current Quick Order -->
      <div v-if="quickOrder.items.length > 0" class="space-y-2">
        <h4 class="font-medium">Current Order</h4>
        <div class="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
          <div
            v-for="(item, index) in quickOrder.items"
            :key="`${item.id}-${index}`"
            class="flex items-center justify-between text-sm"
          >
            <span>{{ item.quantity }}x {{ item.name }}</span>
            <div class="flex items-center gap-2">
              <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
              <Button
                variant="ghost"
                size="sm"
                @click="removeQuickItem(index)"
              >
                <X class="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Separator />
          <div class="flex justify-between font-medium">
            <span>Total</span>
            <span>${{ quickOrder.total.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex gap-2">
        <Button
          class="flex-1"
          :disabled="quickOrder.items.length === 0"
          @click="processQuickOrder"
        >
          <CreditCard class="mr-2 h-4 w-4" />
          Pay Now
        </Button>
        <Button
          variant="outline"
          :disabled="quickOrder.items.length === 0"
          @click="saveDraftQuickOrder"
        >
          <Save class="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button
          variant="ghost"
          :disabled="quickOrder.items.length === 0"
          @click="clearQuickOrder"
        >
          <Trash2 class="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Zap,
  Plus,
  X,
  CreditCard,
  Save,
  Trash2,
  Coffee,
  Sandwich,
  IceCream,
  Pizza
} from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/toast'

const { toast } = useToast()

// Props
const props = defineProps({
  menuItems: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['quick-order', 'save-draft'])

// State
const quickOrder = ref({
  items: [],
  total: 0
})

// Quick categories for fast access
const quickCategories = ref([
  { id: 1, name: 'Coffee', icon: Coffee },
  { id: 2, name: 'Sandwiches', icon: Sandwich },
  { id: 3, name: 'Desserts', icon: IceCream },
  { id: 4, name: 'Pizza', icon: Pizza }
])

// Popular items (could be computed from sales data)
const popularItems = computed(() => {
  return props.menuItems
    .filter(item => item.isPopular)
    .slice(0, 8)
    .map(item => ({
      ...item,
      isSpecial: item.specialOffer || false
    }))
})

// Methods
const selectQuickCategory = (category) => {
  // Filter items by category and show them
  toast({
    title: `${category.name} selected`,
    description: 'Showing items from this category'
  })
}

const addQuickItem = (item) => {
  const existingItem = quickOrder.value.items.find(i => i.id === item.id)
  
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    quickOrder.value.items.push({
      ...item,
      quantity: 1
    })
  }
  
  updateTotal()
  
  toast({
    title: 'Item added',
    description: `${item.name} added to quick order`
  })
}

const removeQuickItem = (index) => {
  quickOrder.value.items.splice(index, 1)
  updateTotal()
}

const updateTotal = () => {
  quickOrder.value.total = quickOrder.value.items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  )
}

const processQuickOrder = () => {
  if (quickOrder.value.items.length === 0) return
  
  emit('quick-order', {
    ...quickOrder.value,
    type: 'quick-service',
    timestamp: new Date().toISOString()
  })
  
  clearQuickOrder()
  
  toast({
    title: 'Order processed',
    description: 'Quick service order sent to kitchen'
  })
}

const saveDraftQuickOrder = () => {
  emit('save-draft', quickOrder.value)
  
  toast({
    title: 'Draft saved',
    description: 'Quick order saved as draft'
  })
}

const clearQuickOrder = () => {
  quickOrder.value.items = []
  quickOrder.value.total = 0
}
</script>

<style scoped>
/* Custom styles for quick service interface */
</style>
