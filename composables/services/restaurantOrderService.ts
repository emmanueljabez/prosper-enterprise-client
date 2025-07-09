import { ref, computed } from 'vue'
import { useWebSocketStore } from '~/store/modules/websocket'
import { useWebSocketService } from '~/composables/services/websocketService'
import { 
  OrderUpdateMessage, 
  TableUpdateMessage, 
  PaymentUpdateMessage,
  InventoryUpdateMessage,
  MenuUpdateMessage,
  OrderStatus, 
  TableStatus,
  PaymentStatus,
  OrderUpdateType,
  InventoryAlertLevel,
  WebSocketMessageType 
} from '~/types/websocket'

export interface RestaurantOrderService {
  // Order management
  getActiveOrders(): OrderUpdateMessage[]
  getOrdersByStatus(status: OrderStatus): OrderUpdateMessage[]
  getOrdersByTable(tableId: string): OrderUpdateMessage[]
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>
  addOrderItem(orderId: string, itemData: any): Promise<void>
  removeOrderItem(orderId: string, itemId: string): Promise<void>
  splitOrder(orderId: string, splitData: any): Promise<void>
  mergeOrders(orderIds: string[]): Promise<void>
  
  // Table management
  getAvailableTables(): TableUpdateMessage[]
  getTablesByStatus(status: TableStatus): TableUpdateMessage[]
  updateTableStatus(tableId: string, status: TableStatus): Promise<void>
  assignTableToStaff(tableId: string, staffId: string): Promise<void>
  
  // Payment management
  getPendingPayments(): PaymentUpdateMessage[]
  getPaymentsByStatus(status: PaymentStatus): PaymentUpdateMessage[]
  processPayment(paymentData: any): Promise<void>
  
  // Inventory management
  getInventoryAlerts(): InventoryUpdateMessage[]
  getCriticalStockItems(): InventoryUpdateMessage[]
  updateInventoryLevel(itemId: string, newLevel: number): Promise<void>
  
  // Menu management
  getUnavailableMenuItems(): MenuUpdateMessage[]
  updateMenuItemAvailability(itemId: string, isAvailable: boolean): Promise<void>
  
  // Real-time updates
  subscribeToOrderUpdates(): void
  unsubscribeFromOrderUpdates(): void
}

export const useRestaurantOrderService = (): RestaurantOrderService => {
  const webSocketStore = useWebSocketStore()
  const webSocketService = useWebSocketService()
  
  const isSubscribed = ref(false)
  
  // Order management
  const getActiveOrders = (): OrderUpdateMessage[] => {
    return webSocketStore.activeOrders.filter(order => 
      order.status !== OrderStatus.COMPLETED && 
      order.status !== OrderStatus.CANCELLED
    )
  }
  
  const getOrdersByStatus = (status: OrderStatus): OrderUpdateMessage[] => {
    return webSocketStore.activeOrders.filter(order => order.status === status)
  }
  
  const getOrdersByTable = (tableId: string): OrderUpdateMessage[] => {
    return webSocketStore.activeOrders.filter(order => order.tableId === tableId)
  }
  
  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    try {
      await webSocketService.sendOrderStatusUpdate(orderId, status)
      
      // Update local state
      webSocketStore.updateOrderStatus(orderId, status)
    } catch (error) {
      console.error('Failed to update order status:', error)
      throw error
    }
  }
  
  const addOrderItem = async (orderId: string, itemData: any): Promise<void> => {
    try {
      await webSocketService.sendOrderUpdate(orderId, OrderUpdateType.ITEM_ADDED, {
        item: itemData
      })
    } catch (error) {
      console.error('Failed to add order item:', error)
      throw error
    }
  }
  
  const removeOrderItem = async (orderId: string, itemId: string): Promise<void> => {
    try {
      await webSocketService.sendOrderUpdate(orderId, OrderUpdateType.ITEM_REMOVED, {
        itemId
      })
    } catch (error) {
      console.error('Failed to remove order item:', error)
      throw error
    }
  }
  
  const splitOrder = async (orderId: string, splitData: any): Promise<void> => {
    try {
      await webSocketService.sendOrderUpdate(orderId, OrderUpdateType.SPLIT_ORDER, splitData)
    } catch (error) {
      console.error('Failed to split order:', error)
      throw error
    }
  }
  
  const mergeOrders = async (orderIds: string[]): Promise<void> => {
    try {
      await webSocketService.sendOrderUpdate(orderIds[0], OrderUpdateType.MERGE_ORDER, {
        orderIds
      })
    } catch (error) {
      console.error('Failed to merge orders:', error)
      throw error
    }
  }
  
  // Table management
  const getAvailableTables = (): TableUpdateMessage[] => {
    return webSocketStore.tables.filter(table => table.status === TableStatus.AVAILABLE)
  }
  
  const getTablesByStatus = (status: TableStatus): TableUpdateMessage[] => {
    return webSocketStore.tables.filter(table => table.status === status)
  }
  
  const updateTableStatus = async (tableId: string, status: TableStatus): Promise<void> => {
    try {
      await webSocketService.sendTableStatusUpdate(tableId, status)
      
      // Update local state
      webSocketStore.updateTableStatus(tableId, status)
    } catch (error) {
      console.error('Failed to update table status:', error)
      throw error
    }
  }
  
  const assignTableToStaff = async (tableId: string, staffId: string): Promise<void> => {
    try {
      await webSocketService.sendTableAssignmentUpdate(tableId, staffId)
    } catch (error) {
      console.error('Failed to assign table to staff:', error)
      throw error
    }
  }
  
  // Payment management
  const getPendingPayments = (): PaymentUpdateMessage[] => {
    return webSocketStore.paymentUpdates.filter(payment => 
      payment.status === PaymentStatus.PENDING
    )
  }
  
  const getPaymentsByStatus = (status: PaymentStatus): PaymentUpdateMessage[] => {
    return webSocketStore.paymentUpdates.filter(payment => payment.status === status)
  }
  
  const processPayment = async (paymentData: any): Promise<void> => {
    try {
      await webSocketService.sendPaymentUpdate(
        paymentData.orderId, 
        paymentData.paymentId, 
        PaymentStatus.PROCESSING
      )
    } catch (error) {
      console.error('Failed to process payment:', error)
      throw error
    }
  }
  
  // Inventory management
  const getInventoryAlerts = (): InventoryUpdateMessage[] => {
    return webSocketStore.inventoryAlerts.filter(alert => 
      alert.alertLevel !== InventoryAlertLevel.NORMAL
    )
  }
  
  const getCriticalStockItems = (): InventoryUpdateMessage[] => {
    return webSocketStore.inventoryAlerts.filter(alert => 
      alert.alertLevel === InventoryAlertLevel.CRITICAL || 
      alert.alertLevel === InventoryAlertLevel.OUT_OF_STOCK
    )
  }
  
  const updateInventoryLevel = async (itemId: string, newLevel: number): Promise<void> => {
    try {
      await webSocketService.sendInventoryUpdate(itemId, newLevel)
      
      // Update local state
      webSocketStore.updateInventoryLevel(itemId, newLevel)
    } catch (error) {
      console.error('Failed to update inventory level:', error)
      throw error
    }
  }
  
  // Menu management
  const getUnavailableMenuItems = (): MenuUpdateMessage[] => {
    return webSocketStore.menuUpdates.filter(item => !item.isAvailable)
  }
  
  const updateMenuItemAvailability = async (itemId: string, isAvailable: boolean): Promise<void> => {
    try {
      await webSocketService.sendMenuItemAvailability(itemId, isAvailable)
      
      // Update local state
      webSocketStore.updateMenuItemAvailability(itemId, isAvailable)
    } catch (error) {
      console.error('Failed to update menu item availability:', error)
      throw error
    }
  }
  
  // Real-time updates
  const subscribeToOrderUpdates = (): void => {
    if (isSubscribed.value) return
    
    // Subscribe to order-related WebSocket events
    webSocketService.subscribe(WebSocketMessageType.ORDER_STATUS_UPDATE, handleOrderStatusUpdate)
    webSocketService.subscribe(WebSocketMessageType.ORDER_ITEM_UPDATE, handleOrderItemUpdate)
    webSocketService.subscribe(WebSocketMessageType.ORDER_PAYMENT_UPDATE, handleOrderPaymentUpdate)
    webSocketService.subscribe(WebSocketMessageType.ORDER_SPLIT_UPDATE, handleOrderSplitUpdate)
    webSocketService.subscribe(WebSocketMessageType.ORDER_MERGE_UPDATE, handleOrderMergeUpdate)
    
    // Subscribe to table-related events
    webSocketService.subscribe(WebSocketMessageType.TABLE_STATUS_UPDATE, handleTableStatusUpdate)
    webSocketService.subscribe(WebSocketMessageType.TABLE_ASSIGNMENT_UPDATE, handleTableAssignmentUpdate)
    webSocketService.subscribe(WebSocketMessageType.TABLE_OCCUPANCY_UPDATE, handleTableOccupancyUpdate)
    
    // Subscribe to payment-related events
    webSocketService.subscribe(WebSocketMessageType.PAYMENT_PROCESSING, handlePaymentProcessing)
    webSocketService.subscribe(WebSocketMessageType.PAYMENT_COMPLETED, handlePaymentCompleted)
    webSocketService.subscribe(WebSocketMessageType.PAYMENT_FAILED, handlePaymentFailed)
    webSocketService.subscribe(WebSocketMessageType.PAYMENT_REFUND, handlePaymentRefund)
    
    // Subscribe to inventory-related events
    webSocketService.subscribe(WebSocketMessageType.INVENTORY_LEVEL_UPDATE, handleInventoryLevelUpdate)
    webSocketService.subscribe(WebSocketMessageType.INVENTORY_ITEM_LOW_STOCK, handleInventoryLowStock)
    webSocketService.subscribe(WebSocketMessageType.INVENTORY_ITEM_OUT_OF_STOCK, handleInventoryOutOfStock)
    
    // Subscribe to menu-related events
    webSocketService.subscribe(WebSocketMessageType.MENU_ITEM_AVAILABILITY, handleMenuItemAvailability)
    webSocketService.subscribe(WebSocketMessageType.MENU_ITEM_PRICE_UPDATE, handleMenuItemPriceUpdate)
    
    isSubscribed.value = true
    console.log('Subscribed to restaurant order updates')
  }
  
  const unsubscribeFromOrderUpdates = (): void => {
    if (!isSubscribed.value) return
    
    // Unsubscribe from all events
    webSocketService.unsubscribe(WebSocketMessageType.ORDER_STATUS_UPDATE, handleOrderStatusUpdate)
    webSocketService.unsubscribe(WebSocketMessageType.ORDER_ITEM_UPDATE, handleOrderItemUpdate)
    webSocketService.unsubscribe(WebSocketMessageType.ORDER_PAYMENT_UPDATE, handleOrderPaymentUpdate)
    webSocketService.unsubscribe(WebSocketMessageType.ORDER_SPLIT_UPDATE, handleOrderSplitUpdate)
    webSocketService.unsubscribe(WebSocketMessageType.ORDER_MERGE_UPDATE, handleOrderMergeUpdate)
    
    webSocketService.unsubscribe(WebSocketMessageType.TABLE_STATUS_UPDATE, handleTableStatusUpdate)
    webSocketService.unsubscribe(WebSocketMessageType.TABLE_ASSIGNMENT_UPDATE, handleTableAssignmentUpdate)
    webSocketService.unsubscribe(WebSocketMessageType.TABLE_OCCUPANCY_UPDATE, handleTableOccupancyUpdate)
    
    webSocketService.unsubscribe(WebSocketMessageType.PAYMENT_PROCESSING, handlePaymentProcessing)
    webSocketService.unsubscribe(WebSocketMessageType.PAYMENT_COMPLETED, handlePaymentCompleted)
    webSocketService.unsubscribe(WebSocketMessageType.PAYMENT_FAILED, handlePaymentFailed)
    webSocketService.unsubscribe(WebSocketMessageType.PAYMENT_REFUND, handlePaymentRefund)
    
    webSocketService.unsubscribe(WebSocketMessageType.INVENTORY_LEVEL_UPDATE, handleInventoryLevelUpdate)
    webSocketService.unsubscribe(WebSocketMessageType.INVENTORY_ITEM_LOW_STOCK, handleInventoryLowStock)
    webSocketService.unsubscribe(WebSocketMessageType.INVENTORY_ITEM_OUT_OF_STOCK, handleInventoryOutOfStock)
    
    webSocketService.unsubscribe(WebSocketMessageType.MENU_ITEM_AVAILABILITY, handleMenuItemAvailability)
    webSocketService.unsubscribe(WebSocketMessageType.MENU_ITEM_PRICE_UPDATE, handleMenuItemPriceUpdate)
    
    isSubscribed.value = false
    console.log('Unsubscribed from restaurant order updates')
  }
  
  // Event handlers
  const handleOrderStatusUpdate = (orderData: OrderUpdateMessage) => {
    console.log('Order status updated:', orderData)
    
    // Show status update notification
    showOrderStatusNotification(orderData)
    
    // Play sound for ready orders
    if (orderData.status === OrderStatus.READY) {
      playNotificationSound('order-ready')
    }
  }
  
  const handleOrderItemUpdate = (orderData: OrderUpdateMessage) => {
    console.log('Order item updated:', orderData)
    
    // Show item update notification
    showOrderItemNotification(orderData)
  }
  
  const handleOrderPaymentUpdate = (orderData: OrderUpdateMessage) => {
    console.log('Order payment updated:', orderData)
    
    // Show payment update notification
    showPaymentUpdateNotification(orderData)
  }
  
  const handleOrderSplitUpdate = (orderData: OrderUpdateMessage) => {
    console.log('Order split:', orderData)
    
    // Show split notification
    showOrderSplitNotification(orderData)
  }
  
  const handleOrderMergeUpdate = (orderData: OrderUpdateMessage) => {
    console.log('Order merged:', orderData)
    
    // Show merge notification
    showOrderMergeNotification(orderData)
  }
  
  const handleTableStatusUpdate = (tableData: TableUpdateMessage) => {
    console.log('Table status updated:', tableData)
    
    // Show table status notification
    showTableStatusNotification(tableData)
  }
  
  const handleTableAssignmentUpdate = (tableData: TableUpdateMessage) => {
    console.log('Table assignment updated:', tableData)
    
    // Show assignment notification
    showTableAssignmentNotification(tableData)
  }
  
  const handleTableOccupancyUpdate = (tableData: TableUpdateMessage) => {
    console.log('Table occupancy updated:', tableData)
    
    // Show occupancy notification
    showTableOccupancyNotification(tableData)
  }
  
  const handlePaymentProcessing = (paymentData: PaymentUpdateMessage) => {
    console.log('Payment processing:', paymentData)
    
    // Show processing notification
    showPaymentProcessingNotification(paymentData)
  }
  
  const handlePaymentCompleted = (paymentData: PaymentUpdateMessage) => {
    console.log('Payment completed:', paymentData)
    
    // Show completion notification
    showPaymentCompletedNotification(paymentData)
    
    // Play success sound
    playNotificationSound('payment-success')
  }
  
  const handlePaymentFailed = (paymentData: PaymentUpdateMessage) => {
    console.log('Payment failed:', paymentData)
    
    // Show failure notification
    showPaymentFailedNotification(paymentData)
    
    // Play error sound
    playNotificationSound('payment-error')
  }
  
  const handlePaymentRefund = (paymentData: PaymentUpdateMessage) => {
    console.log('Payment refunded:', paymentData)
    
    // Show refund notification
    showPaymentRefundNotification(paymentData)
  }
  
  const handleInventoryLevelUpdate = (inventoryData: InventoryUpdateMessage) => {
    console.log('Inventory level updated:', inventoryData)
    
    // Check for low stock alerts
    if (inventoryData.alertLevel === InventoryAlertLevel.LOW) {
      showInventoryLowStockAlert(inventoryData)
    }
  }
  
  const handleInventoryLowStock = (inventoryData: InventoryUpdateMessage) => {
    console.log('Inventory low stock:', inventoryData)
    
    // Show low stock alert
    showInventoryLowStockAlert(inventoryData)
    
    // Play warning sound
    playNotificationSound('inventory-warning')
  }
  
  const handleInventoryOutOfStock = (inventoryData: InventoryUpdateMessage) => {
    console.log('Inventory out of stock:', inventoryData)
    
    // Show out of stock alert
    showInventoryOutOfStockAlert(inventoryData)
    
    // Play critical sound
    playNotificationSound('inventory-critical')
  }
  
  const handleMenuItemAvailability = (menuData: MenuUpdateMessage) => {
    console.log('Menu item availability updated:', menuData)
    
    // Show availability notification
    showMenuItemAvailabilityNotification(menuData)
  }
  
  const handleMenuItemPriceUpdate = (menuData: MenuUpdateMessage) => {
    console.log('Menu item price updated:', menuData)
    
    // Show price update notification
    showMenuItemPriceNotification(menuData)
  }
  
  // Utility functions
  const playNotificationSound = (type: string) => {
    try {
      const audio = new Audio(`/sounds/restaurant-${type}.wav`)
      audio.volume = 0.5
      audio.play()
    } catch (error) {
      console.warn('Failed to play notification sound:', error)
    }
  }
  
  const showOrderStatusNotification = (order: OrderUpdateMessage) => {
    console.log(`📝 ORDER STATUS: ${order.status} - Table ${order.tableId} - Order ${order.orderId}`)
  }
  
  const showOrderItemNotification = (order: OrderUpdateMessage) => {
    console.log(`🍽️ ORDER ITEM: ${order.updateType} - Table ${order.tableId} - Order ${order.orderId}`)
  }
  
  const showPaymentUpdateNotification = (order: OrderUpdateMessage) => {
    console.log(`💳 PAYMENT: ${order.paymentStatus} - Table ${order.tableId} - Order ${order.orderId}`)
  }
  
  const showOrderSplitNotification = (order: OrderUpdateMessage) => {
    console.log(`🔀 ORDER SPLIT: Table ${order.tableId} - Order ${order.orderId}`)
  }
  
  const showOrderMergeNotification = (order: OrderUpdateMessage) => {
    console.log(`🔗 ORDER MERGE: Table ${order.tableId} - Order ${order.orderId}`)
  }
  
  const showTableStatusNotification = (table: TableUpdateMessage) => {
    console.log(`🪑 TABLE STATUS: ${table.status} - Table ${table.tableNumber}`)
  }
  
  const showTableAssignmentNotification = (table: TableUpdateMessage) => {
    console.log(`👨‍💼 TABLE ASSIGNMENT: ${table.assignedStaff} - Table ${table.tableNumber}`)
  }
  
  const showTableOccupancyNotification = (table: TableUpdateMessage) => {
    console.log(`👥 TABLE OCCUPANCY: ${table.occupancy}/${table.capacity} - Table ${table.tableNumber}`)
  }
  
  const showPaymentProcessingNotification = (payment: PaymentUpdateMessage) => {
    console.log(`🔄 PAYMENT PROCESSING: $${payment.amount} - Order ${payment.orderId}`)
  }
  
  const showPaymentCompletedNotification = (payment: PaymentUpdateMessage) => {
    console.log(`✅ PAYMENT COMPLETED: $${payment.amount} - Order ${payment.orderId}`)
  }
  
  const showPaymentFailedNotification = (payment: PaymentUpdateMessage) => {
    console.log(`❌ PAYMENT FAILED: $${payment.amount} - Order ${payment.orderId}`)
  }
  
  const showPaymentRefundNotification = (payment: PaymentUpdateMessage) => {
    console.log(`💰 PAYMENT REFUND: $${payment.amount} - Order ${payment.orderId}`)
  }
  
  const showInventoryLowStockAlert = (inventory: InventoryUpdateMessage) => {
    console.log(`⚠️ LOW STOCK: ${inventory.itemName} - ${inventory.currentStock} ${inventory.unit}`)
  }
  
  const showInventoryOutOfStockAlert = (inventory: InventoryUpdateMessage) => {
    console.log(`🚨 OUT OF STOCK: ${inventory.itemName}`)
  }
  
  const showMenuItemAvailabilityNotification = (menu: MenuUpdateMessage) => {
    const status = menu.isAvailable ? 'Available' : 'Unavailable'
    console.log(`📋 MENU ITEM: ${menu.itemName} is now ${status}`)
  }
  
  const showMenuItemPriceNotification = (menu: MenuUpdateMessage) => {
    console.log(`💰 PRICE UPDATE: ${menu.itemName} - $${menu.price}`)
  }
  
  return {
    // Order management
    getActiveOrders,
    getOrdersByStatus,
    getOrdersByTable,
    updateOrderStatus,
    addOrderItem,
    removeOrderItem,
    splitOrder,
    mergeOrders,
    
    // Table management
    getAvailableTables,
    getTablesByStatus,
    updateTableStatus,
    assignTableToStaff,
    
    // Payment management
    getPendingPayments,
    getPaymentsByStatus,
    processPayment,
    
    // Inventory management
    getInventoryAlerts,
    getCriticalStockItems,
    updateInventoryLevel,
    
    // Menu management
    getUnavailableMenuItems,
    updateMenuItemAvailability,
    
    // Real-time updates
    subscribeToOrderUpdates,
    unsubscribeFromOrderUpdates
  }
} 