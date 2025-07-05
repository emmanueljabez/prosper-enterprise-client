<template>
  <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
    <!-- Order Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <span class="font-semibold text-lg">
          Table {{ order.tableNumber }}
        </span>
        <Badge 
          :variant="isPriority ? 'destructive' : 'outline'"
          class="text-xs"
        >
          {{ order.priority }}
        </Badge>
        <Badge v-if="isDelayed" variant="secondary" class="text-xs bg-yellow-100 text-yellow-800">
          Delayed
        </Badge>
      </div>
      
      <div class="text-right">
        <div class="text-sm font-medium">
          {{ getOrderTime(order.timestamp) }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {{ getElapsedTime(order.timestamp) }} ago
        </div>
      </div>
    </div>

    <!-- Drinks List -->
    <div class="space-y-2 mb-4">
      <div
        v-for="drink in order.drinks"
        :key="drink.id"
        class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
      >
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <span class="font-medium">{{ drink.quantity }}x</span>
            <span>{{ drink.name }}</span>
            
            <!-- Drink Status Badge -->
            <Badge
              v-if="drink.status === 'ready'"
              variant="default"
              class="text-xs bg-green-500"
            >
              Ready
            </Badge>
            <Badge
              v-else-if="drink.status === 'preparing'"
              variant="secondary"
              class="text-xs bg-blue-500"
            >
              Preparing
            </Badge>
            
            <!-- Stock Warning -->
            <Badge
              v-if="isLowStock(drink.ingredients)"
              variant="destructive"
              class="text-xs"
            >
              ⚠️ Low Stock
            </Badge>
          </div>
          
          <!-- Special Instructions -->
          <div v-if="drink.specialInstructions" class="mt-1">
            <p class="text-xs text-orange-600 dark:text-orange-400 font-medium">
              📝 {{ drink.specialInstructions }}
            </p>
          </div>

          <!-- Modifiers -->
          <div v-if="drink.modifiers?.length > 0" class="mt-1">
            <p class="text-xs text-gray-600 dark:text-gray-300">
              {{ drink.modifiers.map(m => m.name).join(', ') }}
            </p>
          </div>
        </div>

        <!-- Drink Actions -->
        <div class="flex items-center space-x-1">
          <!-- Recipe Button -->
          <Button
            variant="ghost"
            size="sm"
            @click="$emit('check-recipe', drink.id)"
            class="h-6 w-6 p-0"
          >
            <Book class="h-3 w-3" />
          </Button>

          <!-- Action Button -->
          <Button
            v-if="drink.status === 'pending'"
            variant="outline"
            size="sm"
            @click="startDrink(drink.id)"
            :disabled="!canMakeDrink(drink)"
          >
            <Play class="h-3 w-3 mr-1" />
            Start
          </Button>
          
          <Button
            v-else-if="drink.status === 'preparing'"
            variant="default"
            size="sm"
            class="bg-green-600 hover:bg-green-700"
            @click="markDrinkReady(drink.id)"
          >
            <Check class="h-3 w-3 mr-1" />
            Ready
          </Button>

          <Button
            v-else-if="drink.status === 'ready'"
            variant="secondary"
            size="sm"
            disabled
          >
            <CheckCircle class="h-3 w-3 mr-1" />
            Done
          </Button>

          <!-- Issue Button -->
          <Button
            v-if="drink.status !== 'ready'"
            variant="ghost"
            size="sm"
            @click="reportDrinkIssue(drink.id)"
            class="h-6 w-6 p-0 text-red-500 hover:text-red-600"
          >
            <AlertTriangle class="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Order Progress -->
    <div class="mb-3">
      <div class="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
        <span>Progress</span>
        <span>{{ orderProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          class="h-2 rounded-full transition-all duration-300"
          :class="progressBarColor"
          :style="{ width: `${orderProgress}%` }"
        />
      </div>
    </div>

    <!-- Order Footer -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <!-- Customer Info -->
        <div v-if="order.customerName" class="text-xs text-gray-600 dark:text-gray-300">
          👤 {{ order.customerName }}
        </div>
        
        <!-- Server Info -->
        <div v-if="order.serverName" class="text-xs text-gray-600 dark:text-gray-300">
          🍽️ {{ order.serverName }}
        </div>
      </div>

      <div class="flex items-center space-x-1">
        <!-- Priority Actions -->
        <Button
          v-if="!isPriority && order.status !== 'completed'"
          variant="outline"
          size="sm"
          @click="markAsRush"
        >
          <Zap class="h-3 w-3 mr-1" />
          Rush
        </Button>

        <!-- Complete Order -->
        <Button
          v-if="isOrderReady"
          variant="default"
          size="sm"
          class="bg-green-600 hover:bg-green-700"
          @click="completeOrder"
        >
          <CheckCircle class="h-3 w-3 mr-1" />
          Complete
        </Button>

        <!-- Send Notification -->
        <Button
          v-if="hasReadyDrinks"
          variant="outline"
          size="sm"
          @click="notifyServer"
        >
          <Bell class="h-3 w-3" />
        </Button>
      </div>
    </div>

    <!-- Happy Hour Pricing Info -->
    <div 
      v-if="hasHappyHourDrinks" 
      class="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs"
    >
      🍻 Happy Hour pricing applied to {{ happyHourDrinksCount }} drink(s)
    </div>

    <!-- Missing Ingredients Alert -->
    <div 
      v-if="missingIngredients.length > 0" 
      class="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"
    >
      <div class="flex items-center space-x-2 text-red-800 dark:text-red-200">
        <AlertTriangle class="h-4 w-4" />
        <span class="text-xs font-medium">Missing Ingredients:</span>
      </div>
      <p class="text-xs text-red-600 dark:text-red-400 mt-1">
        {{ missingIngredients.join(', ') }}
      </p>
      <Button
        variant="outline"
        size="sm"
        class="mt-2 text-xs"
        @click="requestIngredients"
      >
        Request Restock
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Book,
  Play,
  Check,
  CheckCircle,
  AlertTriangle,
  Zap,
  Bell
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Props
const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  isPriority: {
    type: Boolean,
    default: false
  },
  inventoryLevels: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits([
  'mark-ready',
  'check-recipe',
  'report-issue'
])

// Computed properties
const orderProgress = computed(() => {
  const totalDrinks = props.order.drinks.length
  const readyDrinks = props.order.drinks.filter(drink => drink.status === 'ready').length
  return Math.round((readyDrinks / totalDrinks) * 100)
})

const progressBarColor = computed(() => {
  if (orderProgress.value === 100) return 'bg-green-500'
  if (orderProgress.value >= 50) return 'bg-blue-500'
  return 'bg-yellow-500'
})

const isOrderReady = computed(() => {
  return props.order.drinks.every(drink => drink.status === 'ready')
})

const hasReadyDrinks = computed(() => {
  return props.order.drinks.some(drink => drink.status === 'ready')
})

const isDelayed = computed(() => {
  const orderTime = new Date(props.order.timestamp)
  const now = new Date()
  const elapsedMinutes = (now - orderTime) / (1000 * 60)
  return elapsedMinutes > 10 // Delayed if more than 10 minutes
})

const hasHappyHourDrinks = computed(() => {
  return props.order.drinks.some(drink => drink.happyHourPrice)
})

const happyHourDrinksCount = computed(() => {
  return props.order.drinks.filter(drink => drink.happyHourPrice).length
})

const missingIngredients = computed(() => {
  const missing = []
  props.order.drinks.forEach(drink => {
    if (drink.ingredients) {
      drink.ingredients.forEach(ingredient => {
        const level = props.inventoryLevels[ingredient.id]
        if (level === 'out' && !missing.includes(ingredient.name)) {
          missing.push(ingredient.name)
        }
      })
    }
  })
  return missing
})

// Methods
const getOrderTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getElapsedTime = (timestamp) => {
  const now = new Date()
  const orderTime = new Date(timestamp)
  const diffMinutes = Math.floor((now - orderTime) / (1000 * 60))
  
  if (diffMinutes < 1) return '0m'
  if (diffMinutes < 60) return `${diffMinutes}m`
  
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  return `${hours}h ${minutes}m`
}

const isLowStock = (ingredients) => {
  if (!ingredients) return false
  
  return ingredients.some(ingredient => {
    const level = props.inventoryLevels[ingredient.id]
    return level === 'low' || level === 'out'
  })
}

const canMakeDrink = (drink) => {
  if (!drink.ingredients) return true
  
  return !drink.ingredients.some(ingredient => {
    const level = props.inventoryLevels[ingredient.id]
    return level === 'out'
  })
}

const startDrink = (drinkId) => {
  emit('start-drink', props.order.id, drinkId)
}

const markDrinkReady = (drinkId) => {
  emit('mark-ready', props.order.id, drinkId)
}

const reportDrinkIssue = (drinkId) => {
  emit('report-issue', {
    orderId: props.order.id,
    drinkId,
    type: 'preparation_issue'
  })
}

const markAsRush = () => {
  emit('mark-as-rush', props.order.id)
}

const completeOrder = () => {
  emit('complete-order', props.order.id)
}

const notifyServer = () => {
  emit('notify-server', props.order.id)
}

const requestIngredients = () => {
  emit('request-ingredients', {
    orderId: props.order.id,
    ingredients: missingIngredients.value
  })
}
</script>
