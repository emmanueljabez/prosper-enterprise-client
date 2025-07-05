<template>
  <div class="space-y-6">
    <!-- Bartender Header -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h2 class="text-lg font-semibold">Bartender Station</h2>
          <Badge variant="outline" class="flex items-center space-x-1">
            <Coffee class="h-3 w-3" />
            <span>{{ pendingDrinks.length }} Pending</span>
          </Badge>
          <Badge 
            v-if="happyHourActive" 
            variant="secondary" 
            class="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            🍻 Happy Hour Active
          </Badge>
        </div>

        <div class="flex items-center space-x-3">
          <!-- Quick Inventory Check -->
          <Button variant="outline" size="sm" @click="showInventoryModal = true">
            <Package class="h-4 w-4 mr-2" />
            Check Stock
          </Button>

          <!-- Drink Specials -->
          <Button variant="outline" size="sm" @click="showSpecialsModal = true">
            <Star class="h-4 w-4 mr-2" />
            Specials
          </Button>

          <!-- Settings -->
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings class="h-4 w-4 mr-2" />
                Settings
                <ChevronDown class="h-3 w-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="toggleHappyHour">
                <Clock class="h-4 w-4 mr-2" />
                {{ happyHourActive ? 'End' : 'Start' }} Happy Hour
              </DropdownMenuItem>
              <DropdownMenuItem @click="viewBarStats">
                <BarChart3 class="h-4 w-4 mr-2" />
                Bar Statistics
              </DropdownMenuItem>
              <DropdownMenuItem @click="manageRecipes">
                <Book class="h-4 w-4 mr-2" />
                Drink Recipes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Bar Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Coffee class="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Drinks Made</p>
            <p class="text-sm font-semibold">{{ drinksMadeToday }}</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <TrendingUp class="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Avg. Time</p>
            <p class="text-sm font-semibold">{{ avgDrinkTime }}m</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
            <AlertTriangle class="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Low Stock Items</p>
            <p class="text-sm font-semibold">{{ lowStockCount }}</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <Star class="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Top Drink</p>
            <p class="text-sm font-semibold">{{ topDrinkToday }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Drink Orders Queue -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <!-- Priority Orders -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <div class="p-4 border-b bg-red-50 dark:bg-red-900/20">
          <div class="flex items-center space-x-2">
            <AlertTriangle class="h-5 w-5 text-red-600 dark:text-red-400" />
            <h3 class="font-semibold text-red-800 dark:text-red-200">Priority Orders</h3>
            <Badge variant="destructive" class="text-xs">
              {{ priorityOrders.length }}
            </Badge>
          </div>
        </div>
        
        <div class="p-4 space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="order in priorityOrders"
            :key="order.id"
            class="border border-red-200 rounded-lg p-3 bg-red-50 dark:bg-red-900/10"
          >
            <DrinkOrderCard
              :order="order"
              :is-priority="true"
              :inventory-levels="inventoryLevels"
              @mark-ready="handleDrinkReady"
              @check-recipe="showRecipe"
              @report-issue="reportIssue"
            />
          </div>
          
          <div v-if="priorityOrders.length === 0" class="text-center py-8">
            <CheckCircle class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-gray-300">No priority orders</p>
          </div>
        </div>
      </div>

      <!-- Regular Orders -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <div class="p-4 border-b">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Coffee class="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 class="font-semibold">Regular Orders</h3>
              <Badge variant="outline" class="text-xs">
                {{ regularOrders.length }}
              </Badge>
            </div>
            
            <Button variant="ghost" size="sm" @click="sortOrders">
              <ArrowUpDown class="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div class="p-4 space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="order in regularOrders"
            :key="order.id"
            class="border rounded-lg p-3"
          >
            <DrinkOrderCard
              :order="order"
              :is-priority="false"
              :inventory-levels="inventoryLevels"
              @mark-ready="handleDrinkReady"
              @check-recipe="showRecipe"
              @report-issue="reportIssue"
            />
          </div>
          
          <div v-if="regularOrders.length === 0" class="text-center py-8">
            <Coffee class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-gray-300">No pending orders</p>
          </div>
        </div>
      </div>

      <!-- Completed Orders -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <div class="p-4 border-b">
          <div class="flex items-center space-x-2">
            <CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 class="font-semibold">Recently Completed</h3>
            <Badge variant="secondary" class="text-xs">
              {{ completedOrders.length }}
            </Badge>
          </div>
        </div>
        
        <div class="p-4 space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="order in completedOrders"
            :key="order.id"
            class="border border-green-200 rounded-lg p-3 bg-green-50 dark:bg-green-900/10 opacity-75"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-sm">Table {{ order.tableNumber }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-300">
                  {{ order.drinkNames.join(', ') }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs text-green-600 dark:text-green-400 font-medium">
                  Completed
                </div>
                <div class="text-xs text-gray-500">
                  {{ getCompletedTime(order.completedAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Bar -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
      <div class="flex items-center justify-between">
        <h3 class="font-medium">Quick Actions</h3>
        
        <div class="flex items-center space-x-2">
          <!-- Quick Stock Check Buttons -->
          <div class="flex items-center space-x-2">
            <Button
              v-for="spirit in quickCheckItems"
              :key="spirit.id"
              variant="outline"
              size="sm"
              @click="quickInventoryCheck(spirit)"
              :class="getStockLevelClass(spirit.level)"
            >
              {{ spirit.name }}
              <Badge :variant="getStockBadgeVariant(spirit.level)" class="ml-2 text-xs">
                {{ spirit.level }}
              </Badge>
            </Button>
          </div>

          <!-- Emergency Actions -->
          <div class="flex items-center space-x-2 border-l pl-3">
            <Button variant="outline" size="sm" @click="requestRestock">
              <Package class="h-4 w-4 mr-2" />
              Request Restock
            </Button>
            
            <Button variant="outline" size="sm" @click="reportEquipmentIssue">
              <AlertTriangle class="h-4 w-4 mr-2" />
              Equipment Issue
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recipe Modal -->
    <Dialog v-model:open="showRecipeModal">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ selectedRecipe?.name }} Recipe</DialogTitle>
        </DialogHeader>
        
        <div v-if="selectedRecipe" class="space-y-4">
          <!-- Ingredients -->
          <div>
            <h4 class="font-medium mb-2">Ingredients:</h4>
            <ul class="space-y-1">
              <li
                v-for="ingredient in selectedRecipe.ingredients"
                :key="ingredient.id"
                class="flex justify-between text-sm"
              >
                <span>{{ ingredient.name }}</span>
                <span class="font-medium">{{ ingredient.amount }}</span>
              </li>
            </ul>
          </div>

          <!-- Instructions -->
          <div>
            <h4 class="font-medium mb-2">Instructions:</h4>
            <ol class="space-y-1 text-sm">
              <li
                v-for="(step, index) in selectedRecipe.instructions"
                :key="index"
                class="flex"
              >
                <span class="mr-2 font-medium">{{ index + 1 }}.</span>
                <span>{{ step }}</span>
              </li>
            </ol>
          </div>

          <!-- Garnish -->
          <div v-if="selectedRecipe.garnish">
            <h4 class="font-medium mb-2">Garnish:</h4>
            <p class="text-sm">{{ selectedRecipe.garnish }}</p>
          </div>
        </div>

        <DialogFooter>
          <Button @click="showRecipeModal = false">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Inventory Check Modal -->
    <Dialog v-model:open="showInventoryModal">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bar Inventory Levels</DialogTitle>
        </DialogHeader>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div
              v-for="item in inventoryItems"
              :key="item.id"
              class="border rounded-lg p-3"
              :class="getInventoryCardClass(item.level)"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-sm">{{ item.name }}</span>
                <Badge :variant="getStockBadgeVariant(item.level)" class="text-xs">
                  {{ item.level }}
                </Badge>
              </div>
              
              <div class="space-y-1">
                <div class="flex justify-between text-xs">
                  <span>Current:</span>
                  <span>{{ item.currentStock }} {{ item.unit }}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span>Min Level:</span>
                  <span>{{ item.minLevel }} {{ item.unit }}</span>
                </div>
              </div>

              <div class="mt-2">
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="getStockBarColor(item.level)"
                    :style="{ width: `${getStockPercentage(item)}%` }"
                  />
                </div>
              </div>

              <Button
                v-if="item.level === 'low' || item.level === 'out'"
                variant="outline"
                size="sm"
                class="w-full mt-2"
                @click="requestRestock(item)"
              >
                Request Restock
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button @click="showInventoryModal = false">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Coffee,
  Package,
  Star,
  Settings,
  ChevronDown,
  Clock,
  BarChart3,
  Book,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowUpDown
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'

// Import custom component
import DrinkOrderCard from './DrinkOrderCard.vue'

// Props
const props = defineProps({
  drinkOrders: {
    type: Array,
    default: () => []
  },
  inventoryLevels: {
    type: Object,
    default: () => ({})
  },
  happyHourActive: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'mark-drink-ready',
  'check-inventory',
  'update-special-pricing'
])

// Computed properties
const pendingDrinks = computed(() => {
  return props.drinkOrders.filter(order => order.status === 'pending' || order.status === 'preparing')
})

// Local state
const showRecipeModal = ref(false)
const showInventoryModal = ref(false)
const showSpecialsModal = ref(false)
const selectedRecipe = ref(null)

// Bar statistics
const drinksMadeToday = ref(127)
const avgDrinkTime = ref(3.2)
const lowStockCount = ref(5)
const topDrinkToday = ref('Mojito')

// Quick check items
const quickCheckItems = ref([
  { id: 1, name: 'Vodka', level: 'good' },
  { id: 2, name: 'Whiskey', level: 'low' },
  { id: 3, name: 'Gin', level: 'good' },
  { id: 4, name: 'Rum', level: 'out' },
  { id: 5, name: 'Tequila', level: 'good' }
])

// Inventory items
const inventoryItems = ref([
  { id: 1, name: 'Premium Vodka', currentStock: 2.5, minLevel: 2, unit: 'L', level: 'good' },
  { id: 2, name: 'Single Malt Whiskey', currentStock: 0.8, minLevel: 1.5, unit: 'L', level: 'low' },
  { id: 3, name: 'London Dry Gin', currentStock: 3.2, minLevel: 2, unit: 'L', level: 'good' },
  { id: 4, name: 'White Rum', currentStock: 0, minLevel: 1, unit: 'L', level: 'out' },
  { id: 5, name: 'Lime Juice', currentStock: 0.5, minLevel: 1, unit: 'L', level: 'low' },
  { id: 6, name: 'Simple Syrup', currentStock: 2, minLevel: 0.5, unit: 'L', level: 'good' }
])

// Computed properties
const priorityOrders = computed(() => {
  return props.drinkOrders.filter(order => 
    order.priority === 'rush' || order.priority === 'high'
  )
})

const regularOrders = computed(() => {
  return props.drinkOrders.filter(order => 
    order.status === 'pending' && 
    order.priority !== 'rush' && 
    order.priority !== 'high'
  )
})

const completedOrders = computed(() => {
  return props.drinkOrders
    .filter(order => order.status === 'completed')
    .slice(0, 10) // Show only recent 10
})

// Methods
const handleDrinkReady = (orderId, drinkId) => {
  emit('mark-drink-ready', orderId, drinkId)
}

const showRecipe = (drinkId) => {
  // Mock recipe data
  selectedRecipe.value = {
    name: 'Classic Mojito',
    ingredients: [
      { id: 1, name: 'White Rum', amount: '60ml' },
      { id: 2, name: 'Fresh Lime Juice', amount: '30ml' },
      { id: 3, name: 'Simple Syrup', amount: '20ml' },
      { id: 4, name: 'Fresh Mint Leaves', amount: '8-10 leaves' },
      { id: 5, name: 'Soda Water', amount: 'Top up' },
      { id: 6, name: 'Ice', amount: 'Cubes' }
    ],
    instructions: [
      'Gently muddle mint leaves in the bottom of a highball glass',
      'Add lime juice and simple syrup',
      'Fill glass with ice cubes',
      'Add white rum and stir gently',
      'Top with soda water',
      'Stir once more to combine'
    ],
    garnish: 'Fresh mint sprig and lime wheel'
  }
  showRecipeModal.value = true
}

const reportIssue = (issue) => {
  console.log('Reporting issue:', issue)
}

const getStockLevelClass = (level) => {
  switch (level) {
    case 'out':
      return 'border-red-200 bg-red-50 dark:bg-red-900/20'
    case 'low':
      return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
    default:
      return ''
  }
}

const getStockBadgeVariant = (level) => {
  switch (level) {
    case 'out':
      return 'destructive'
    case 'low':
      return 'secondary'
    default:
      return 'outline'
  }
}

const getInventoryCardClass = (level) => {
  switch (level) {
    case 'out':
      return 'border-red-200 bg-red-50 dark:bg-red-900/20'
    case 'low':
      return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
    default:
      return 'border-gray-200'
  }
}

const getStockBarColor = (level) => {
  switch (level) {
    case 'out':
      return 'bg-red-500'
    case 'low':
      return 'bg-yellow-500'
    default:
      return 'bg-green-500'
  }
}

const getStockPercentage = (item) => {
  if (item.level === 'out') return 0
  const percentage = (item.currentStock / (item.minLevel * 2)) * 100
  return Math.min(100, Math.max(0, percentage))
}

const getCompletedTime = (timestamp) => {
  const now = new Date()
  const completed = new Date(timestamp)
  const diffMinutes = Math.floor((now - completed) / (1000 * 60))
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  
  const hours = Math.floor(diffMinutes / 60)
  return `${hours}h ago`
}

const quickInventoryCheck = (item) => {
  emit('check-inventory', item.id)
}

const requestRestock = (item = null) => {
  if (item) {
    console.log('Requesting restock for:', item.name)
  } else {
    console.log('Requesting general restock')
  }
}

const reportEquipmentIssue = () => {
  console.log('Reporting equipment issue')
}

const toggleHappyHour = () => {
  emit('toggle-happy-hour')
}

const viewBarStats = () => {
  console.log('Viewing bar statistics')
}

const manageRecipes = () => {
  console.log('Managing drink recipes')
}

const sortOrders = () => {
  console.log('Sorting orders')
}
</script>
