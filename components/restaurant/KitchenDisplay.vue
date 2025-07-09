<template>
  <div class="kitchen-display p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="header mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Kitchen Display System</h1>
      <div class="flex items-center gap-4 mt-2">
        <div class="connection-status flex items-center gap-2">
          <div 
            :class="[
              'w-3 h-3 rounded-full',
              webSocketStore.isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'
            ]"
          ></div>
          <span class="text-sm">
            {{ webSocketStore.isWebSocketConnected ? 'Connected' : 'Disconnected' }}
          </span>
        </div>
        <div class="stats text-sm text-gray-600">
          Active Orders: {{ kitchenService.getActiveOrders().length }}
        </div>
      </div>
    </div>

    <!-- Station Status -->
    <div class="stations-grid mb-6">
      <h2 class="text-xl font-semibold mb-4">Kitchen Stations</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="station in kitchenService.getActiveStations()"
          :key="station.stationId"
          class="station-card p-4 bg-white rounded-lg shadow-md border"
          :class="getStationStatusClass(station.status)"
        >
          <h3 class="font-semibold">{{ station.stationName }}</h3>
          <p class="text-sm text-gray-600">{{ station.stationType }}</p>
          <p class="text-sm">Orders: {{ station.currentOrders }}</p>
          <p class="text-sm">Avg Time: {{ station.avgProcessingTime }}min</p>
          <div class="mt-2">
            <select 
              v-model="station.status" 
              @change="updateStationStatus(station.stationId, station.status)"
              class="text-sm border rounded px-2 py-1"
            >
              <option value="active">Active</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders Display -->
    <div class="orders-section">
      <h2 class="text-xl font-semibold mb-4">Active Orders</h2>
      
      <!-- Order Status Tabs -->
      <div class="tabs flex gap-2 mb-4">
        <button
          v-for="tab in ['pending', 'in_progress', 'rush']"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'px-4 py-2 rounded-lg font-medium',
            activeTab === tab 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ tab.replace('_', ' ').toUpperCase() }}
          <span class="ml-2 text-sm">
            ({{ getOrdersForTab(tab).length }})
          </span>
        </button>
      </div>

      <!-- Orders Grid -->
      <div class="orders-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="order in getOrdersForTab(activeTab)"
          :key="order.orderId"
          class="order-card p-4 bg-white rounded-lg shadow-md border"
          :class="getOrderPriorityClass(order.priority)"
        >
          <!-- Order Header -->
          <div class="order-header flex justify-between items-start mb-3">
            <div>
              <h3 class="font-semibold text-lg">Order #{{ order.orderId.slice(-6) }}</h3>
              <p class="text-sm text-gray-600">
                Table {{ order.tableId }} • {{ formatTime(order.estimatedTime) }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span 
                v-if="order.rushOrder"
                class="px-2 py-1 bg-red-500 text-white text-xs rounded font-semibold"
              >
                RUSH
              </span>
              <span 
                :class="[
                  'px-2 py-1 text-xs rounded font-semibold',
                  getPriorityClass(order.priority)
                ]"
              >
                {{ order.priority.toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- Order Items -->
          <div class="order-items mb-3">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="order-item flex justify-between items-center py-2 border-b border-gray-100"
            >
              <div class="flex-1">
                <p class="font-medium">{{ item.quantity }}x {{ item.menuItemName }}</p>
                <p v-if="item.modifications?.length" class="text-sm text-gray-600">
                  Mods: {{ item.modifications.join(', ') }}
                </p>
                <p v-if="item.specialInstructions" class="text-sm text-amber-600">
                  {{ item.specialInstructions }}
                </p>
              </div>
              <div class="item-controls flex gap-2">
                <button
                  v-if="item.status === 'pending'"
                  @click="startOrderItem(order.orderId, item.id)"
                  class="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                >
                  Start
                </button>
                <button
                  v-if="item.status === 'in_progress'"
                  @click="completeOrderItem(order.orderId, item.id)"
                  class="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Complete
                </button>
                <span 
                  v-if="item.status === 'completed'"
                  class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded"
                >
                  Done
                </span>
              </div>
            </div>
          </div>

          <!-- Special Instructions -->
          <div v-if="order.specialInstructions" class="special-instructions mb-3">
            <p class="text-sm text-amber-700 bg-amber-50 p-2 rounded">
              <strong>Special Instructions:</strong> {{ order.specialInstructions }}
            </p>
          </div>

          <!-- Dietary Restrictions -->
          <div v-if="order.dietaryRestrictions?.length" class="dietary-restrictions mb-3">
            <p class="text-sm text-purple-700 bg-purple-50 p-2 rounded">
              <strong>Dietary:</strong> {{ order.dietaryRestrictions.join(', ') }}
            </p>
          </div>

          <!-- Allergen Warnings -->
          <div v-if="order.allergens?.length" class="allergen-warnings mb-3">
            <p class="text-sm text-red-700 bg-red-50 p-2 rounded">
              <strong>⚠️ Allergens:</strong> {{ order.allergens.join(', ') }}
            </p>
          </div>

          <!-- Order Actions -->
          <div class="order-actions flex gap-2">
            <button
              @click="completeOrder(order.orderId)"
              :disabled="!canCompleteOrder(order)"
              class="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              Complete Order
            </button>
            <button
              @click="cancelOrder(order.orderId)"
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWebSocketStore } from '~/store/modules/websocket'
import { useKitchenDisplayService } from '~/composables/services/kitchenDisplayService'
import type { KitchenOrderMessage, StationStatus, OrderPriority } from '~/types/websocket'

const webSocketStore = useWebSocketStore()
const kitchenService = useKitchenDisplayService()

const activeTab = ref('pending')

onMounted(() => {
  // Subscribe to kitchen updates
  kitchenService.subscribeToKitchenUpdates()
})

onUnmounted(() => {
  // Unsubscribe from kitchen updates
  kitchenService.unsubscribeFromKitchenUpdates()
})

// Computed properties
const getOrdersForTab = (tab: string) => {
  switch (tab) {
    case 'pending':
      return kitchenService.getPendingOrders()
    case 'in_progress':
      return kitchenService.getInProgressOrders()
    case 'rush':
      return kitchenService.getRushOrders()
    default:
      return []
  }
}

// Methods
const updateStationStatus = async (stationId: string, status: StationStatus) => {
  try {
    await kitchenService.updateStationStatus(stationId, status)
  } catch (error) {
    console.error('Failed to update station status:', error)
  }
}

const startOrderItem = async (orderId: string, itemId: string) => {
  try {
    await kitchenService.markOrderItemInProgress(orderId, itemId)
  } catch (error) {
    console.error('Failed to start order item:', error)
  }
}

const completeOrderItem = async (orderId: string, itemId: string) => {
  try {
    await kitchenService.markOrderItemComplete(orderId, itemId)
  } catch (error) {
    console.error('Failed to complete order item:', error)
  }
}

const completeOrder = async (orderId: string) => {
  try {
    await kitchenService.markOrderComplete(orderId)
  } catch (error) {
    console.error('Failed to complete order:', error)
  }
}

const cancelOrder = async (orderId: string) => {
  try {
    await kitchenService.cancelOrder(orderId)
  } catch (error) {
    console.error('Failed to cancel order:', error)
  }
}

const canCompleteOrder = (order: KitchenOrderMessage): boolean => {
  return order.items.every(item => item.status === 'completed')
}

const formatTime = (minutes: number): string => {
  return `${minutes}min`
}

// Styling helpers
const getStationStatusClass = (status: StationStatus): string => {
  switch (status) {
    case 'active':
      return 'border-green-500 bg-green-50'
    case 'busy':
      return 'border-yellow-500 bg-yellow-50'
    case 'offline':
      return 'border-red-500 bg-red-50'
    case 'maintenance':
      return 'border-purple-500 bg-purple-50'
    default:
      return 'border-gray-300'
  }
}

const getOrderPriorityClass = (priority: OrderPriority): string => {
  switch (priority) {
    case 'urgent':
      return 'border-red-500 bg-red-50'
    case 'high':
      return 'border-orange-500 bg-orange-50'
    case 'normal':
      return 'border-blue-500 bg-blue-50'
    case 'low':
      return 'border-gray-300'
    default:
      return 'border-gray-300'
  }
}

const getPriorityClass = (priority: OrderPriority): string => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500 text-white'
    case 'high':
      return 'bg-orange-500 text-white'
    case 'normal':
      return 'bg-blue-500 text-white'
    case 'low':
      return 'bg-gray-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}
</script>

<style scoped>
.kitchen-display {
  font-family: 'Lexend', sans-serif;
}

.order-card {
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.station-card {
  transition: all 0.3s ease;
}

.station-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.order-card.rush {
  animation: pulse 2s infinite;
}
</style> 