<template>
  <div class="space-y-6">
    <!-- Order Header -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">
          {{ selectedTable ? `Table ${selectedTable.number}` : 'Order Taking' }}
        </h2>
        <div class="flex items-center space-x-2">
          <Badge v-if="currentOrder" variant="outline">
            {{ currentOrder.items.length }} Items
          </Badge>
          <Badge v-if="currentOrder" variant="secondary">
            KSh {{ formatCurrency(currentOrder.total || 0) }}
          </Badge>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" @click="showFavoritesModal = true">
          <Star class="h-4 w-4 mr-2" />
          Favorites
        </Button>
        <Button variant="outline" size="sm" @click="showSpecialsModal = true">
          <Sparkles class="h-4 w-4 mr-2" />
          Today's Specials
        </Button>
        <Button variant="outline" size="sm" @click="showCustomItemModal = true">
          <Plus class="h-4 w-4 mr-2" />
          Custom Item
        </Button>
        <Button variant="outline" size="sm" @click="loadDraftOrder">
          <FileText class="h-4 w-4 mr-2" />
          Load Draft
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Menu Categories and Items -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Category Tabs -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div class="border-b p-4">
            <div class="flex items-center justify-between">
              <h3 class="font-medium">Menu Categories</h3>
              <div class="flex items-center space-x-2">
                <!-- Search -->
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    v-model="searchTerm"
                    placeholder="Search items..."
                    class="pl-10 w-64"
                    @input="filterItems"
                  />
                </div>
                <!-- View Toggle -->
                <Button
                  variant="ghost"
                  size="sm"
                  @click="menuViewMode = menuViewMode === 'grid' ? 'list' : 'grid'"
                >
                  <component :is="menuViewMode === 'grid' ? List : LayoutGrid" class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Category Tabs -->
          <div class="flex overflow-x-auto border-b bg-gray-50 dark:bg-gray-900">
            <button
              v-for="category in categories"
              :key="category.id"
              class="px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
              :class="selectedCategory?.id === category.id 
                ? 'border-primary text-primary bg-white dark:bg-gray-800' 
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50'"
              @click="selectCategory(category)"
            >
              {{ category.name }}
              <span class="ml-2 text-xs text-gray-400">
                ({{ getItemCountForCategory(category.id) }})
              </span>
            </button>
          </div>

          <!-- Menu Items -->
          <div class="p-4">
            <!-- Grid View -->
            <div v-if="menuViewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <div
                v-for="item in filteredItems"
                :key="item.id"
                class="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                :class="{ 'opacity-50': !item.available }"
                @click="addItemToOrder(item)"
              >
                <!-- Item Image -->
                <div class="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 relative overflow-hidden">
                  <img
                    v-if="item.imageUrl"
                    :src="item.imageUrl"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="flex items-center justify-center h-full">
                    <Package class="h-8 w-8 text-gray-400" />
                  </div>
                  
                  <!-- Availability Badge -->
                  <div v-if="!item.available" class="absolute top-2 right-2">
                    <Badge variant="destructive" class="text-xs">
                      Out of Stock
                    </Badge>
                  </div>
                  
                  <!-- Quick Add Button -->
                  <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" class="h-8 w-8 p-0" @click.stop="quickAddItem(item)">
                      <Plus class="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <!-- Item Info -->
                <div>
                  <h4 class="font-medium text-sm mb-1 line-clamp-2">{{ item.name }}</h4>
                  <p class="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                    {{ item.description }}
                  </p>
                  <div class="flex items-center justify-between">
                    <span class="font-semibold text-primary">
                      KSh {{ formatCurrency(item.price) }}
                    </span>
                    <div class="flex items-center space-x-1">
                      <Badge v-if="item.isSpicy" variant="destructive" class="text-xs">
                        🌶️
                      </Badge>
                      <Badge v-if="item.isVegetarian" variant="secondary" class="text-xs">
                        🥬
                      </Badge>
                      <Badge v-if="item.isPopular" variant="default" class="text-xs">
                        ⭐
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- List View -->
            <div v-else class="space-y-2">
              <div
                v-for="item in filteredItems"
                :key="item.id"
                class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                :class="{ 'opacity-50': !item.available }"
                @click="addItemToOrder(item)"
              >
                <div class="flex items-center space-x-3">
                  <!-- Item Image -->
                  <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                    <img
                      v-if="item.imageUrl"
                      :src="item.imageUrl"
                      :alt="item.name"
                      class="w-full h-full object-cover rounded-lg"
                    />
                    <div v-else class="flex items-center justify-center h-full">
                      <Package class="h-6 w-6 text-gray-400" />
                    </div>
                  </div>

                  <!-- Item Details -->
                  <div class="flex-1">
                    <div class="flex items-center space-x-2">
                      <h4 class="font-medium">{{ item.name }}</h4>
                      <div class="flex items-center space-x-1">
                        <Badge v-if="item.isSpicy" variant="destructive" class="text-xs">🌶️</Badge>
                        <Badge v-if="item.isVegetarian" variant="secondary" class="text-xs">🥬</Badge>
                        <Badge v-if="item.isPopular" variant="default" class="text-xs">⭐</Badge>
                      </div>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                      {{ item.description }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center space-x-3">
                  <span class="font-semibold text-primary">
                    KSh {{ formatCurrency(item.price) }}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    :disabled="!item.available"
                    @click.stop="quickAddItem(item)"
                  >
                    <Plus class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredItems.length === 0" class="text-center py-12">
              <Package class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No items found
              </h3>
              <p class="text-gray-600 dark:text-gray-300">
                {{ searchTerm ? 'Try adjusting your search terms' : 'No items available in this category' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Order -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border sticky top-4">
          <div class="border-b p-4">
            <div class="flex items-center justify-between">
              <h3 class="font-medium">Current Order</h3>
              <div class="flex items-center space-x-2">
                <Button
                  v-if="currentOrder?.items.length > 0"
                  variant="ghost"
                  size="sm"
                  @click="clearOrder"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
                <Button
                  v-if="currentOrder?.items.length > 0"
                  variant="ghost"
                  size="sm"
                  @click="$emit('save-draft')"
                >
                  <Save class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="p-4">
            <div v-if="!currentOrder || currentOrder.items.length === 0" class="text-center py-8">
              <ClipboardList class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-600 dark:text-gray-300">No items added yet</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(orderItem, index) in currentOrder.items"
                :key="orderItem.id"
                class="border rounded-lg p-3"
              >
                <!-- Item Header -->
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <h4 class="font-medium text-sm">{{ orderItem.name }}</h4>
                    <p class="text-xs text-gray-600 dark:text-gray-300">
                      KSh {{ formatCurrency(orderItem.price) }} each
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    @click="removeItemFromOrder(index)"
                  >
                    <X class="h-3 w-3" />
                  </Button>
                </div>

                <!-- Quantity Controls -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      class="h-6 w-6 p-0"
                      @click="decreaseQuantity(index)"
                    >
                      <Minus class="h-3 w-3" />
                    </Button>
                    <span class="text-sm font-medium px-2">{{ orderItem.quantity }}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      class="h-6 w-6 p-0"
                      @click="increaseQuantity(index)"
                    >
                      <Plus class="h-3 w-3" />
                    </Button>
                  </div>
                  <span class="text-sm font-semibold">
                    KSh {{ formatCurrency(orderItem.price * orderItem.quantity) }}
                  </span>
                </div>

                <!-- Modifiers -->
                <div v-if="orderItem.modifiers?.length > 0" class="mt-2">
                  <div class="text-xs text-gray-600 dark:text-gray-300">
                    <div v-for="modifier in orderItem.modifiers" :key="modifier.id" class="flex justify-between">
                      <span>+ {{ modifier.name }}</span>
                      <span>KSh {{ formatCurrency(modifier.price) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Special Instructions -->
                <div v-if="orderItem.specialInstructions" class="mt-2">
                  <p class="text-xs text-gray-600 dark:text-gray-300 italic">
                    Note: {{ orderItem.specialInstructions }}
                  </p>
                </div>

                <!-- Modify Button -->
                <div class="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="text-xs"
                    @click="modifyOrderItem(index)"
                  >
                    <Edit class="h-3 w-3 mr-1" />
                    Modify
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div v-if="currentOrder?.items.length > 0" class="border-t p-4">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Subtotal:</span>
                <span>KSh {{ formatCurrency(currentOrder.subtotal || 0) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Tax (16%):</span>
                <span>KSh {{ formatCurrency(currentOrder.tax || 0) }}</span>
              </div>
              <div class="flex justify-between font-semibold text-base border-t pt-2">
                <span>Total:</span>
                <span>KSh {{ formatCurrency(currentOrder.total || 0) }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-4 space-y-2">
              <Button class="w-full" @click="$emit('submit-order')" :disabled="!selectedTable">
                <Send class="h-4 w-4 mr-2" />
                {{ selectedTable ? 'Send to Kitchen' : 'Select Table First' }}
              </Button>
              <div class="grid grid-cols-2 gap-2">
                <Button variant="outline" @click="$emit('save-draft')">
                  <Save class="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button variant="outline" @click="addSpecialInstructions">
                  <MessageSquare class="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Item Customization Dialog -->
    <Dialog v-model:open="showItemCustomization">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customize {{ selectedMenuItem?.name }}</DialogTitle>
        </DialogHeader>
        
        <div class="space-y-6">
          <!-- Quantity -->
          <div>
            <Label>Quantity</Label>
            <div class="flex items-center space-x-3 mt-2">
              <Button variant="outline" @click="customQuantity = Math.max(1, customQuantity - 1)">
                <Minus class="h-4 w-4" />
              </Button>
              <span class="px-4 py-2 border rounded">{{ customQuantity }}</span>
              <Button variant="outline" @click="customQuantity++">
                <Plus class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <!-- Modifiers -->
          <div v-if="availableModifiers.length > 0">
            <Label>Modifiers</Label>
            <div class="space-y-2 mt-2">
              <div
                v-for="modifier in availableModifiers"
                :key="modifier.id"
                class="flex items-center justify-between p-3 border rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <Checkbox
                    :id="modifier.id"
                    v-model="selectedModifiers"
                    :value="modifier.id"
                  />
                  <Label :for="modifier.id" class="cursor-pointer">
                    {{ modifier.name }}
                  </Label>
                </div>
                <span class="text-sm font-medium">
                  + KSh {{ formatCurrency(modifier.price) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Special Instructions -->
          <div>
            <Label>Special Instructions</Label>
            <Textarea
              v-model="customInstructions"
              placeholder="Any special requests..."
              rows="3"
              class="mt-2"
            />
          </div>

          <!-- Price Summary -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Base Price:</span>
                <span>KSh {{ formatCurrency((selectedMenuItem?.price || 0) * customQuantity) }}</span>
              </div>
              <div v-if="getSelectedModifiersTotal() > 0" class="flex justify-between">
                <span>Modifiers:</span>
                <span>KSh {{ formatCurrency(getSelectedModifiersTotal() * customQuantity) }}</span>
              </div>
              <div class="flex justify-between font-semibold border-t pt-2">
                <span>Total:</span>
                <span>KSh {{ formatCurrency(getCustomItemTotal()) }}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showItemCustomization = false">
            Cancel
          </Button>
          <Button @click="addCustomizedItem">
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Star,
  Sparkles,
  Plus,
  FileText,
  Search,
  List,
  LayoutGrid,
  Package,
  ClipboardList,
  Trash2,
  Save,
  X,
  Minus,
  Edit,
  Send,
  MessageSquare
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'

// Props
const props = defineProps({
  menuItems: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  currentOrder: {
    type: Object,
    default: null
  },
  selectedTable: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'add-item',
  'remove-item',
  'modify-item',
  'submit-order',
  'save-draft'
])

// Local state
const menuViewMode = ref('grid')
const searchTerm = ref('')
const selectedCategory = ref(null)
const showItemCustomization = ref(false)
const selectedMenuItem = ref(null)
const customQuantity = ref(1)
const selectedModifiers = ref([])
const customInstructions = ref('')
const showFavoritesModal = ref(false)
const showSpecialsModal = ref(false)
const showCustomItemModal = ref(false)

// Mock data for modifiers (in real app, this would come from API)
const availableModifiers = ref([
  { id: 1, name: 'Extra Cheese', price: 50 },
  { id: 2, name: 'No Onions', price: 0 },
  { id: 3, name: 'Extra Spicy', price: 0 },
  { id: 4, name: 'Extra Sauce', price: 30 }
])

// Computed properties
const filteredItems = computed(() => {
  let items = props.menuItems

  // Filter by category
  if (selectedCategory.value) {
    items = items.filter(item => item.categoryId === selectedCategory.value.id)
  }

  // Filter by search term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    items = items.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    )
  }

  return items
})

// Methods
const selectCategory = (category) => {
  selectedCategory.value = category
}

const getItemCountForCategory = (categoryId) => {
  return props.menuItems.filter(item => item.categoryId === categoryId).length
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const quickAddItem = (item) => {
  emit('add-item', item, [], 1)
}

const addItemToOrder = (item) => {
  // Check if item has customization options
  if (item.hasModifiers || item.allowCustomization) {
    selectedMenuItem.value = item
    customQuantity.value = 1
    selectedModifiers.value = []
    customInstructions.value = ''
    showItemCustomization.value = true
  } else {
    quickAddItem(item)
  }
}

const addCustomizedItem = () => {
  const modifiers = availableModifiers.value.filter(mod =>
    selectedModifiers.value.includes(mod.id)
  )

  emit('add-item', selectedMenuItem.value, modifiers, customQuantity.value, customInstructions.value)
  showItemCustomization.value = false
}

const getSelectedModifiersTotal = () => {
  return availableModifiers.value
    .filter(mod => selectedModifiers.value.includes(mod.id))
    .reduce((total, mod) => total + mod.price, 0)
}

const getCustomItemTotal = () => {
  const basePrice = (selectedMenuItem.value?.price || 0) * customQuantity.value
  const modifiersPrice = getSelectedModifiersTotal() * customQuantity.value
  return basePrice + modifiersPrice
}

const removeItemFromOrder = (index) => {
  emit('remove-item', index)
}

const increaseQuantity = (index) => {
  const item = props.currentOrder.items[index]
  emit('modify-item', item.id, { quantity: item.quantity + 1 })
}

const decreaseQuantity = (index) => {
  const item = props.currentOrder.items[index]
  if (item.quantity > 1) {
    emit('modify-item', item.id, { quantity: item.quantity - 1 })
  }
}

const modifyOrderItem = (index) => {
  // Open customization dialog for existing order item
  const item = props.currentOrder.items[index]
  selectedMenuItem.value = props.menuItems.find(mi => mi.id === item.menuItemId)
  customQuantity.value = item.quantity
  customInstructions.value = item.specialInstructions || ''
  selectedModifiers.value = item.modifiers?.map(m => m.id) || []
  showItemCustomization.value = true
}

const clearOrder = () => {
  if (confirm('Are you sure you want to clear the current order?')) {
    emit('clear-order')
  }
}

const addSpecialInstructions = () => {
  const instructions = prompt('Enter special instructions for this order:')
  if (instructions) {
    emit('add-order-instructions', instructions)
  }
}

const filterItems = () => {
  // Filtering is handled by computed property
}

const loadDraftOrder = () => {
  // Implementation for loading draft orders
  console.log('Loading draft order...')
}

// Initialize with first category
watch(() => props.categories, (newCategories) => {
  if (newCategories.length > 0 && !selectedCategory.value) {
    selectedCategory.value = newCategories[0]
  }
}, { immediate: true })
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
