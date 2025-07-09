import { ref, computed } from 'vue'
import { useWebSocketStore } from '~/store/modules/websocket'
import { useWebSocketService } from '~/composables/services/websocketService'
import { 
  KitchenOrderMessage, 
  KitchenStationStatus, 
  KitchenItemStatus, 
  StationStatus, 
  OrderPriority,
  WebSocketMessageType 
} from '~/types/websocket'

export interface KitchenDisplayService {
  // Order management
  getActiveOrders(): KitchenOrderMessage[]
  getPendingOrders(): KitchenOrderMessage[]
  getInProgressOrders(): KitchenOrderMessage[]
  getRushOrders(): KitchenOrderMessage[]
  
  // Station management
  getActiveStations(): KitchenStationStatus[]
  getStationById(stationId: string): KitchenStationStatus | null
  updateStationStatus(stationId: string, status: StationStatus): Promise<void>
  
  // Order actions
  markOrderItemComplete(orderId: string, itemId: string): Promise<void>
  markOrderItemInProgress(orderId: string, itemId: string): Promise<void>
  markOrderComplete(orderId: string): Promise<void>
  cancelOrder(orderId: string): Promise<void>
  
  // Kitchen operations
  estimateOrderTime(orderId: string): number
  getOrdersByStation(stationId: string): KitchenOrderMessage[]
  getOrdersByPriority(priority: OrderPriority): KitchenOrderMessage[]
  
  // Real-time updates
  subscribeToKitchenUpdates(): void
  unsubscribeFromKitchenUpdates(): void
}

export const useKitchenDisplayService = (): KitchenDisplayService => {
  const webSocketStore = useWebSocketStore()
  const webSocketService = useWebSocketService()
  
  const isSubscribed = ref(false)
  
  // Order management
  const getActiveOrders = (): KitchenOrderMessage[] => {
    return webSocketStore.kitchenOrders.filter(order => 
      order.items.some(item => 
        item.status === KitchenItemStatus.PENDING || 
        item.status === KitchenItemStatus.IN_PROGRESS
      )
    )
  }
  
  const getPendingOrders = (): KitchenOrderMessage[] => {
    return webSocketStore.kitchenOrders.filter(order => 
      order.items.some(item => item.status === KitchenItemStatus.PENDING)
    )
  }
  
  const getInProgressOrders = (): KitchenOrderMessage[] => {
    return webSocketStore.kitchenOrders.filter(order => 
      order.items.some(item => item.status === KitchenItemStatus.IN_PROGRESS)
    )
  }
  
  const getRushOrders = (): KitchenOrderMessage[] => {
    return webSocketStore.kitchenOrders.filter(order => order.rushOrder === true)
  }
  
  // Station management
  const getActiveStations = (): KitchenStationStatus[] => {
    return webSocketStore.kitchenStations.filter(station => station.isOnline)
  }
  
  const getStationById = (stationId: string): KitchenStationStatus | null => {
    return webSocketStore.kitchenStations.find(station => station.stationId === stationId) || null
  }
  
  const updateStationStatus = async (stationId: string, status: StationStatus): Promise<void> => {
    try {
      await webSocketService.sendKitchenStationStatus(stationId, status)
      
      // Update local state
      webSocketStore.updateKitchenStationStatus(stationId, status)
    } catch (error) {
      console.error('Failed to update station status:', error)
      throw error
    }
  }
  
  // Order actions
  const markOrderItemComplete = async (orderId: string, itemId: string): Promise<void> => {
    try {
      const order = webSocketStore.kitchenOrders.find(o => o.orderId === orderId)
      if (!order) {
        throw new Error(`Order ${orderId} not found`)
      }
      
      const item = order.items.find(i => i.id === itemId)
      if (!item) {
        throw new Error(`Item ${itemId} not found in order ${orderId}`)
      }
      
      // Update item status locally
      item.status = KitchenItemStatus.COMPLETED
      
      // Send update to server
      await webSocketService.sendKitchenOrderUpdate(orderId, KitchenItemStatus.COMPLETED)
      
      // Check if all items are completed
      const allItemsComplete = order.items.every(i => i.status === KitchenItemStatus.COMPLETED)
      if (allItemsComplete) {
        await markOrderComplete(orderId)
      }
    } catch (error) {
      console.error('Failed to mark order item complete:', error)
      throw error
    }
  }
  
  const markOrderItemInProgress = async (orderId: string, itemId: string): Promise<void> => {
    try {
      const order = webSocketStore.kitchenOrders.find(o => o.orderId === orderId)
      if (!order) {
        throw new Error(`Order ${orderId} not found`)
      }
      
      const item = order.items.find(i => i.id === itemId)
      if (!item) {
        throw new Error(`Item ${itemId} not found in order ${orderId}`)
      }
      
      // Update item status locally
      item.status = KitchenItemStatus.IN_PROGRESS
      
      // Send update to server
      await webSocketService.sendKitchenOrderUpdate(orderId, KitchenItemStatus.IN_PROGRESS)
    } catch (error) {
      console.error('Failed to mark order item in progress:', error)
      throw error
    }
  }
  
  const markOrderComplete = async (orderId: string): Promise<void> => {
    try {
      const order = webSocketStore.kitchenOrders.find(o => o.orderId === orderId)
      if (!order) {
        throw new Error(`Order ${orderId} not found`)
      }
      
      // Mark all items as completed
      order.items.forEach(item => {
        item.status = KitchenItemStatus.COMPLETED
      })
      
      // Send completion update to server
      await webSocketService.sendKitchenOrderUpdate(orderId, KitchenItemStatus.COMPLETED)
      
      // Remove from local state after a delay to allow for UI feedback
      setTimeout(() => {
        const index = webSocketStore.kitchenOrders.findIndex(o => o.orderId === orderId)
        if (index !== -1) {
          webSocketStore.kitchenOrders.splice(index, 1)
        }
      }, 2000)
    } catch (error) {
      console.error('Failed to mark order complete:', error)
      throw error
    }
  }
  
  const cancelOrder = async (orderId: string): Promise<void> => {
    try {
      const order = webSocketStore.kitchenOrders.find(o => o.orderId === orderId)
      if (!order) {
        throw new Error(`Order ${orderId} not found`)
      }
      
      // Mark all items as cancelled
      order.items.forEach(item => {
        item.status = KitchenItemStatus.CANCELLED
      })
      
      // Send cancellation update to server
      await webSocketService.sendKitchenOrderUpdate(orderId, KitchenItemStatus.CANCELLED)
      
      // Remove from local state
      const index = webSocketStore.kitchenOrders.findIndex(o => o.orderId === orderId)
      if (index !== -1) {
        webSocketStore.kitchenOrders.splice(index, 1)
      }
    } catch (error) {
      console.error('Failed to cancel order:', error)
      throw error
    }
  }
  
  // Kitchen operations
  const estimateOrderTime = (orderId: string): number => {
    const order = webSocketStore.kitchenOrders.find(o => o.orderId === orderId)
    if (!order) return 0
    
    // Calculate estimated time based on items and their cooking times
    const totalCookingTime = order.items.reduce((total, item) => {
      return total + (item.cookingTime || 10) // Default 10 minutes if not specified
    }, 0)
    
    // Consider rush orders (reduce time by 25%)
    const adjustedTime = order.rushOrder ? totalCookingTime * 0.75 : totalCookingTime
    
    return Math.round(adjustedTime)
  }
  
  const getOrdersByStation = (stationId: string): KitchenOrderMessage[] => {
    return webSocketStore.kitchenOrders.filter(order => 
      order.items.some(item => item.station === stationId)
    )
  }
  
  const getOrdersByPriority = (priority: OrderPriority): KitchenOrderMessage[] => {
    return webSocketStore.kitchenOrders.filter(order => order.priority === priority)
  }
  
  // Real-time updates
  const subscribeToKitchenUpdates = (): void => {
    if (isSubscribed.value) return
    
    // Subscribe to kitchen-specific WebSocket events
    webSocketService.subscribe(WebSocketMessageType.KITCHEN_ORDER_NEW, handleNewKitchenOrder)
    webSocketService.subscribe(WebSocketMessageType.KITCHEN_ORDER_UPDATE, handleKitchenOrderUpdate)
    webSocketService.subscribe(WebSocketMessageType.KITCHEN_ORDER_COMPLETE, handleKitchenOrderComplete)
    webSocketService.subscribe(WebSocketMessageType.KITCHEN_ORDER_CANCEL, handleKitchenOrderCancel)
    webSocketService.subscribe(WebSocketMessageType.KITCHEN_STATION_STATUS, handleKitchenStationStatus)
    webSocketService.subscribe(WebSocketMessageType.KITCHEN_PRIORITY_UPDATE, handleKitchenPriorityUpdate)
    
    isSubscribed.value = true
    console.log('Subscribed to kitchen display updates')
  }
  
  const unsubscribeFromKitchenUpdates = (): void => {
    if (!isSubscribed.value) return
    
    webSocketService.unsubscribe(WebSocketMessageType.KITCHEN_ORDER_NEW, handleNewKitchenOrder)
    webSocketService.unsubscribe(WebSocketMessageType.KITCHEN_ORDER_UPDATE, handleKitchenOrderUpdate)
    webSocketService.unsubscribe(WebSocketMessageType.KITCHEN_ORDER_COMPLETE, handleKitchenOrderComplete)
    webSocketService.unsubscribe(WebSocketMessageType.KITCHEN_ORDER_CANCEL, handleKitchenOrderCancel)
    webSocketService.unsubscribe(WebSocketMessageType.KITCHEN_STATION_STATUS, handleKitchenStationStatus)
    webSocketService.unsubscribe(WebSocketMessageType.KITCHEN_PRIORITY_UPDATE, handleKitchenPriorityUpdate)
    
    isSubscribed.value = false
    console.log('Unsubscribed from kitchen display updates')
  }
  
  // Event handlers
  const handleNewKitchenOrder = (orderData: KitchenOrderMessage) => {
    console.log('New kitchen order received:', orderData)
    
    // Play notification sound for new orders
    playNotificationSound('new-order')
    
    // Show visual notification for rush orders
    if (orderData.rushOrder) {
      showRushOrderNotification(orderData)
    }
    
    // Check for special dietary requirements
    if (orderData.dietaryRestrictions && orderData.dietaryRestrictions.length > 0) {
      showDietaryRestrictionAlert(orderData)
    }
    
    // Check for allergen warnings
    if (orderData.allergens && orderData.allergens.length > 0) {
      showAllergenWarning(orderData)
    }
  }
  
  const handleKitchenOrderUpdate = (orderData: KitchenOrderMessage) => {
    console.log('Kitchen order updated:', orderData)
    
    // Update order in local state (handled by store)
    // Additional logic can be added here for specific update types
  }
  
  const handleKitchenOrderComplete = (orderData: KitchenOrderMessage) => {
    console.log('Kitchen order completed:', orderData)
    
    // Play completion sound
    playNotificationSound('order-complete')
    
    // Show completion notification
    showOrderCompletionNotification(orderData)
  }
  
  const handleKitchenOrderCancel = (orderData: KitchenOrderMessage) => {
    console.log('Kitchen order cancelled:', orderData)
    
    // Play cancellation sound
    playNotificationSound('order-cancel')
    
    // Show cancellation notification
    showOrderCancellationNotification(orderData)
  }
  
  const handleKitchenStationStatus = (stationData: KitchenStationStatus) => {
    console.log('Kitchen station status updated:', stationData)
    
    // Show alerts for stations going offline
    if (stationData.status === StationStatus.OFFLINE) {
      showStationOfflineAlert(stationData)
    }
  }
  
  const handleKitchenPriorityUpdate = (orderData: KitchenOrderMessage) => {
    console.log('Kitchen order priority updated:', orderData)
    
    // Highlight priority changes
    if (orderData.priority === OrderPriority.URGENT) {
      showUrgentOrderAlert(orderData)
    }
  }
  
  // Utility functions
  const playNotificationSound = (type: string) => {
    try {
      const audio = new Audio(`/sounds/kitchen-${type}.wav`)
      audio.volume = 0.5
      audio.play()
    } catch (error) {
      console.warn('Failed to play notification sound:', error)
    }
  }
  
  const showRushOrderNotification = (order: KitchenOrderMessage) => {
    // Use your notification system here
    console.log(`🚨 RUSH ORDER: Table ${order.tableId} - Order ${order.orderId}`)
  }
  
  const showDietaryRestrictionAlert = (order: KitchenOrderMessage) => {
    console.log(`⚠️ DIETARY RESTRICTIONS: ${order.dietaryRestrictions?.join(', ')} - Order ${order.orderId}`)
  }
  
  const showAllergenWarning = (order: KitchenOrderMessage) => {
    console.log(`🚨 ALLERGEN WARNING: ${order.allergens?.join(', ')} - Order ${order.orderId}`)
  }
  
  const showOrderCompletionNotification = (order: KitchenOrderMessage) => {
    console.log(`✅ ORDER COMPLETED: Table ${order.tableId} - Order ${order.orderId}`)
  }
  
  const showOrderCancellationNotification = (order: KitchenOrderMessage) => {
    console.log(`❌ ORDER CANCELLED: Table ${order.tableId} - Order ${order.orderId}`)
  }
  
  const showStationOfflineAlert = (station: KitchenStationStatus) => {
    console.log(`⚠️ STATION OFFLINE: ${station.stationName} (${station.stationId})`)
  }
  
  const showUrgentOrderAlert = (order: KitchenOrderMessage) => {
    console.log(`🚨 URGENT ORDER: Table ${order.tableId} - Order ${order.orderId}`)
  }
  
  return {
    // Order management
    getActiveOrders,
    getPendingOrders,
    getInProgressOrders,
    getRushOrders,
    
    // Station management
    getActiveStations,
    getStationById,
    updateStationStatus,
    
    // Order actions
    markOrderItemComplete,
    markOrderItemInProgress,
    markOrderComplete,
    cancelOrder,
    
    // Kitchen operations
    estimateOrderTime,
    getOrdersByStation,
    getOrdersByPriority,
    
    // Real-time updates
    subscribeToKitchenUpdates,
    unsubscribeFromKitchenUpdates
  }
} 