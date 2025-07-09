import { defineStore } from 'pinia'
import { 
  WebSocketConnectionState, 
  WebSocketMessageType, 
  WebSocketMessage, 
  WebSocketConfig,
  WebSocketState,
  KitchenOrderMessage,
  KitchenStationStatus,
  OrderUpdateMessage,
  TableUpdateMessage,
  InventoryUpdateMessage,
  MenuUpdateMessage,
  PaymentUpdateMessage,
  StaffNotificationMessage,
  KitchenItemStatus,
  StationStatus,
  OrderStatus,
  TableStatus,
  InventoryAlertLevel,
  PaymentStatus,
  NotificationPriority
} from '~/types/websocket'
import { useWebSocketService } from '~/composables/services/websocketService'

export const useWebSocketStore = defineStore('websocket', {
  state: (): WebSocketState => ({
    connectionState: WebSocketConnectionState.DISCONNECTED,
    isConnected: false,
    reconnectAttempts: 0,
    lastError: null,
    lastMessage: null,
    
    // Kitchen Display State
    kitchenOrders: [],
    kitchenStations: [],
    
    // Order Management State
    activeOrders: [],
    orderUpdates: [],
    
    // Table Management State
    tables: [],
    
    // Inventory State
    inventoryAlerts: [],
    
    // Menu State
    menuUpdates: [],
    
    // Payment State
    paymentUpdates: [],
    
    // Staff Notifications
    notifications: [],
    alerts: []
  }),

  getters: {
    // Connection getters
    isWebSocketConnected: (state) => state.isConnected,
    connectionStatus: (state) => state.connectionState,
    hasConnectionError: (state) => state.lastError !== null,
    connectionErrorMessage: (state) => state.lastError?.message || '',
    
    // Kitchen Display getters
    pendingKitchenOrders: (state) => state.kitchenOrders.filter(order => 
      order.items.some(item => item.status === KitchenItemStatus.PENDING)
    ),
    inProgressKitchenOrders: (state) => state.kitchenOrders.filter(order => 
      order.items.some(item => item.status === KitchenItemStatus.IN_PROGRESS)
    ),
    completedKitchenOrders: (state) => state.kitchenOrders.filter(order => 
      order.items.every(item => item.status === KitchenItemStatus.COMPLETED)
    ),
    rushOrders: (state) => state.kitchenOrders.filter(order => order.rushOrder),
    
    activeKitchenStations: (state) => state.kitchenStations.filter(station => 
      station.status === StationStatus.ACTIVE
    ),
    offlineKitchenStations: (state) => state.kitchenStations.filter(station => 
      station.status === StationStatus.OFFLINE
    ),
    busyKitchenStations: (state) => state.kitchenStations.filter(station => 
      station.status === StationStatus.BUSY
    ),
    
    // Order Management getters
    pendingOrders: (state) => state.activeOrders.filter(order => 
      order.status === OrderStatus.PENDING
    ),
    confirmedOrders: (state) => state.activeOrders.filter(order => 
      order.status === OrderStatus.CONFIRMED
    ),
    inProgressOrders: (state) => state.activeOrders.filter(order => 
      order.status === OrderStatus.IN_PROGRESS
    ),
    readyOrders: (state) => state.activeOrders.filter(order => 
      order.status === OrderStatus.READY
    ),
    completedOrders: (state) => state.activeOrders.filter(order => 
      order.status === OrderStatus.COMPLETED
    ),
    
    // Table Management getters
    availableTables: (state) => state.tables.filter(table => 
      table.status === TableStatus.AVAILABLE
    ),
    occupiedTables: (state) => state.tables.filter(table => 
      table.status === TableStatus.OCCUPIED
    ),
    reservedTables: (state) => state.tables.filter(table => 
      table.status === TableStatus.RESERVED
    ),
    tablesNeedingCleaning: (state) => state.tables.filter(table => 
      table.status === TableStatus.CLEANING
    ),
    
    // Inventory getters
    criticalInventoryAlerts: (state) => state.inventoryAlerts.filter(alert => 
      alert.alertLevel === InventoryAlertLevel.CRITICAL
    ),
    lowStockAlerts: (state) => state.inventoryAlerts.filter(alert => 
      alert.alertLevel === InventoryAlertLevel.LOW
    ),
    outOfStockAlerts: (state) => state.inventoryAlerts.filter(alert => 
      alert.alertLevel === InventoryAlertLevel.OUT_OF_STOCK
    ),
    
    // Menu getters
    unavailableMenuItems: (state) => state.menuUpdates.filter(item => 
      !item.isAvailable
    ),
    recentMenuUpdates: (state) => state.menuUpdates.slice(-10),
    
    // Payment getters
    pendingPayments: (state) => state.paymentUpdates.filter(payment => 
      payment.status === PaymentStatus.PENDING
    ),
    failedPayments: (state) => state.paymentUpdates.filter(payment => 
      payment.status === PaymentStatus.FAILED
    ),
    
    // Staff Notification getters
    unreadNotifications: (state) => state.notifications.filter(notification => 
      !notification.id.includes('read')
    ),
    urgentAlerts: (state) => state.alerts.filter(alert => 
      alert.priority === NotificationPriority.URGENT
    ),
    highPriorityAlerts: (state) => state.alerts.filter(alert => 
      alert.priority === NotificationPriority.HIGH
    ),
    
    // Summary getters
    totalActiveOrders: (state) => state.activeOrders.length,
    totalKitchenOrders: (state) => state.kitchenOrders.length,
    totalOccupiedTables: (state) => state.tables.filter(table => 
      table.status === TableStatus.OCCUPIED
    ).length,
    totalInventoryAlerts: (state) => state.inventoryAlerts.length,
    totalUnreadNotifications: (state) => state.notifications.filter(notification => 
      !notification.id.includes('read')
    ).length
  },

  actions: {
    // Connection actions
    async connectWebSocket(config: WebSocketConfig) {
      const webSocketService = useWebSocketService()
      
      try {
        this.connectionState = WebSocketConnectionState.CONNECTING
        this.lastError = null
        
        await webSocketService.connect(config)
        
        this.connectionState = WebSocketConnectionState.CONNECTED
        this.isConnected = true
        this.reconnectAttempts = 0
        
        this.setupEventHandlers(webSocketService)
        
      } catch (error) {
        this.connectionState = WebSocketConnectionState.ERROR
        this.lastError = error as Error
        this.isConnected = false
        throw error
      }
    },
    
    disconnectWebSocket() {
      const webSocketService = useWebSocketService()
      webSocketService.disconnect()
      
      this.connectionState = WebSocketConnectionState.DISCONNECTED
      this.isConnected = false
      this.reconnectAttempts = 0
      this.lastError = null
    },
    
    // Setup event handlers
    setupEventHandlers(webSocketService: any) {
      // Kitchen Display handlers
      webSocketService.subscribe(WebSocketMessageType.KITCHEN_ORDER_NEW, this.handleKitchenOrderNew)
      webSocketService.subscribe(WebSocketMessageType.KITCHEN_ORDER_UPDATE, this.handleKitchenOrderUpdate)
      webSocketService.subscribe(WebSocketMessageType.KITCHEN_ORDER_COMPLETE, this.handleKitchenOrderComplete)
      webSocketService.subscribe(WebSocketMessageType.KITCHEN_STATION_STATUS, this.handleKitchenStationStatus)
      
      // Order Management handlers
      webSocketService.subscribe(WebSocketMessageType.ORDER_STATUS_UPDATE, this.handleOrderStatusUpdate)
      webSocketService.subscribe(WebSocketMessageType.ORDER_ITEM_UPDATE, this.handleOrderItemUpdate)
      webSocketService.subscribe(WebSocketMessageType.ORDER_PAYMENT_UPDATE, this.handleOrderPaymentUpdate)
      
      // Table Management handlers
      webSocketService.subscribe(WebSocketMessageType.TABLE_STATUS_UPDATE, this.handleTableStatusUpdate)
      webSocketService.subscribe(WebSocketMessageType.TABLE_ASSIGNMENT_UPDATE, this.handleTableAssignmentUpdate)
      
      // Inventory Management handlers
      webSocketService.subscribe(WebSocketMessageType.INVENTORY_LEVEL_UPDATE, this.handleInventoryLevelUpdate)
      webSocketService.subscribe(WebSocketMessageType.INVENTORY_ITEM_LOW_STOCK, this.handleInventoryAlert)
      webSocketService.subscribe(WebSocketMessageType.INVENTORY_ITEM_OUT_OF_STOCK, this.handleInventoryAlert)
      
      // Menu Management handlers
      webSocketService.subscribe(WebSocketMessageType.MENU_ITEM_AVAILABILITY, this.handleMenuItemAvailability)
      webSocketService.subscribe(WebSocketMessageType.MENU_ITEM_PRICE_UPDATE, this.handleMenuItemPriceUpdate)
      
      // Payment Processing handlers
      webSocketService.subscribe(WebSocketMessageType.PAYMENT_PROCESSING, this.handlePaymentUpdate)
      webSocketService.subscribe(WebSocketMessageType.PAYMENT_COMPLETED, this.handlePaymentUpdate)
      webSocketService.subscribe(WebSocketMessageType.PAYMENT_FAILED, this.handlePaymentUpdate)
      
      // Staff Notification handlers
      webSocketService.subscribe(WebSocketMessageType.STAFF_NOTIFICATION, this.handleStaffNotification)
      webSocketService.subscribe(WebSocketMessageType.STAFF_ALERT, this.handleStaffAlert)
      webSocketService.subscribe(WebSocketMessageType.MANAGER_ALERT, this.handleManagerAlert)
    },
    
    // Kitchen Display handlers
    handleKitchenOrderNew(message: WebSocketMessage) {
      const orderData = message.data as KitchenOrderMessage
      this.kitchenOrders.push(orderData)
      this.lastMessage = message
    },
    
    handleKitchenOrderUpdate(message: WebSocketMessage) {
      const orderData = message.data as KitchenOrderMessage
      const index = this.kitchenOrders.findIndex(order => order.orderId === orderData.orderId)
      
      if (index !== -1) {
        this.kitchenOrders[index] = orderData
      } else {
        this.kitchenOrders.push(orderData)
      }
      
      this.lastMessage = message
    },
    
    handleKitchenOrderComplete(message: WebSocketMessage) {
      const orderData = message.data as KitchenOrderMessage
      const index = this.kitchenOrders.findIndex(order => order.orderId === orderData.orderId)
      
      if (index !== -1) {
        this.kitchenOrders.splice(index, 1)
      }
      
      this.lastMessage = message
    },
    
    handleKitchenStationStatus(message: WebSocketMessage) {
      const stationData = message.data as KitchenStationStatus
      const index = this.kitchenStations.findIndex(station => station.stationId === stationData.stationId)
      
      if (index !== -1) {
        this.kitchenStations[index] = stationData
      } else {
        this.kitchenStations.push(stationData)
      }
      
      this.lastMessage = message
    },
    
    // Order Management handlers
    handleOrderStatusUpdate(message: WebSocketMessage) {
      const orderData = message.data as OrderUpdateMessage
      const index = this.activeOrders.findIndex(order => order.orderId === orderData.orderId)
      
      if (index !== -1) {
        this.activeOrders[index] = orderData
      } else {
        this.activeOrders.push(orderData)
      }
      
      this.orderUpdates.push(orderData)
      this.lastMessage = message
    },
    
    handleOrderItemUpdate(message: WebSocketMessage) {
      const orderData = message.data as OrderUpdateMessage
      const index = this.activeOrders.findIndex(order => order.orderId === orderData.orderId)
      
      if (index !== -1) {
        this.activeOrders[index] = orderData
      }
      
      this.orderUpdates.push(orderData)
      this.lastMessage = message
    },
    
    handleOrderPaymentUpdate(message: WebSocketMessage) {
      const orderData = message.data as OrderUpdateMessage
      const index = this.activeOrders.findIndex(order => order.orderId === orderData.orderId)
      
      if (index !== -1) {
        this.activeOrders[index] = orderData
      }
      
      this.lastMessage = message
    },
    
    // Table Management handlers
    handleTableStatusUpdate(message: WebSocketMessage) {
      const tableData = message.data as TableUpdateMessage
      const index = this.tables.findIndex(table => table.tableId === tableData.tableId)
      
      if (index !== -1) {
        this.tables[index] = tableData
      } else {
        this.tables.push(tableData)
      }
      
      this.lastMessage = message
    },
    
    handleTableAssignmentUpdate(message: WebSocketMessage) {
      const tableData = message.data as TableUpdateMessage
      const index = this.tables.findIndex(table => table.tableId === tableData.tableId)
      
      if (index !== -1) {
        this.tables[index] = tableData
      }
      
      this.lastMessage = message
    },
    
    // Inventory Management handlers
    handleInventoryLevelUpdate(message: WebSocketMessage) {
      const inventoryData = message.data as InventoryUpdateMessage
      const index = this.inventoryAlerts.findIndex(alert => alert.itemId === inventoryData.itemId)
      
      if (index !== -1) {
        this.inventoryAlerts[index] = inventoryData
      } else {
        this.inventoryAlerts.push(inventoryData)
      }
      
      this.lastMessage = message
    },
    
    handleInventoryAlert(message: WebSocketMessage) {
      const inventoryData = message.data as InventoryUpdateMessage
      const index = this.inventoryAlerts.findIndex(alert => alert.itemId === inventoryData.itemId)
      
      if (index !== -1) {
        this.inventoryAlerts[index] = inventoryData
      } else {
        this.inventoryAlerts.push(inventoryData)
      }
      
      this.lastMessage = message
    },
    
    // Menu Management handlers
    handleMenuItemAvailability(message: WebSocketMessage) {
      const menuData = message.data as MenuUpdateMessage
      const index = this.menuUpdates.findIndex(item => item.itemId === menuData.itemId)
      
      if (index !== -1) {
        this.menuUpdates[index] = menuData
      } else {
        this.menuUpdates.push(menuData)
      }
      
      this.lastMessage = message
    },
    
    handleMenuItemPriceUpdate(message: WebSocketMessage) {
      const menuData = message.data as MenuUpdateMessage
      const index = this.menuUpdates.findIndex(item => item.itemId === menuData.itemId)
      
      if (index !== -1) {
        this.menuUpdates[index] = menuData
      } else {
        this.menuUpdates.push(menuData)
      }
      
      this.lastMessage = message
    },
    
    // Payment Processing handlers
    handlePaymentUpdate(message: WebSocketMessage) {
      const paymentData = message.data as PaymentUpdateMessage
      const index = this.paymentUpdates.findIndex(payment => payment.paymentId === paymentData.paymentId)
      
      if (index !== -1) {
        this.paymentUpdates[index] = paymentData
      } else {
        this.paymentUpdates.push(paymentData)
      }
      
      this.lastMessage = message
    },
    
    // Staff Notification handlers
    handleStaffNotification(message: WebSocketMessage) {
      const notificationData = message.data as StaffNotificationMessage
      this.notifications.push(notificationData)
      this.lastMessage = message
    },
    
    handleStaffAlert(message: WebSocketMessage) {
      const alertData = message.data as StaffNotificationMessage
      this.alerts.push(alertData)
      this.lastMessage = message
    },
    
    handleManagerAlert(message: WebSocketMessage) {
      const alertData = message.data as StaffNotificationMessage
      this.alerts.push(alertData)
      this.lastMessage = message
    },
    
    // Utility actions
    clearKitchenOrders() {
      this.kitchenOrders = []
    },
    
    clearOrderUpdates() {
      this.orderUpdates = []
    },
    
    clearNotifications() {
      this.notifications = []
    },
    
    clearAlerts() {
      this.alerts = []
    },
    
    markNotificationAsRead(notificationId: string) {
      const index = this.notifications.findIndex(notification => notification.id === notificationId)
      if (index !== -1) {
        this.notifications[index].id = `${notificationId}-read`
      }
    },
    
    removeAlert(alertId: string) {
      const index = this.alerts.findIndex(alert => alert.id === alertId)
      if (index !== -1) {
        this.alerts.splice(index, 1)
      }
    },
    
    // Kitchen Display actions
    updateKitchenOrderStatus(orderId: string, status: KitchenItemStatus) {
      const order = this.kitchenOrders.find(order => order.orderId === orderId)
      if (order) {
        order.items.forEach(item => {
          if (item.status !== KitchenItemStatus.COMPLETED) {
            item.status = status
          }
        })
      }
    },
    
    updateKitchenStationStatus(stationId: string, status: StationStatus) {
      const station = this.kitchenStations.find(station => station.stationId === stationId)
      if (station) {
        station.status = status
        station.lastUpdate = new Date().toISOString()
      }
    },
    
    // Order Management actions
    updateOrderStatus(orderId: string, status: OrderStatus) {
      const order = this.activeOrders.find(order => order.orderId === orderId)
      if (order) {
        order.status = status
        order.timestamp = new Date().toISOString()
      }
    },
    
    // Table Management actions
    updateTableStatus(tableId: string, status: TableStatus) {
      const table = this.tables.find(table => table.tableId === tableId)
      if (table) {
        table.status = status
      }
    },
    
    // Inventory Management actions
    updateInventoryLevel(itemId: string, currentStock: number) {
      const alert = this.inventoryAlerts.find(alert => alert.itemId === itemId)
      if (alert) {
        alert.currentStock = currentStock
        alert.lastUpdated = new Date().toISOString()
      }
    },
    
    // Menu Management actions
    updateMenuItemAvailability(itemId: string, isAvailable: boolean) {
      const item = this.menuUpdates.find(item => item.itemId === itemId)
      if (item) {
        item.isAvailable = isAvailable
      }
    },
    
    updateMenuItemPrice(itemId: string, price: number) {
      const item = this.menuUpdates.find(item => item.itemId === itemId)
      if (item) {
        item.price = price
      }
    }
  }
}) 