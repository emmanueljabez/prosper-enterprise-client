import { ref, computed, onUnmounted } from 'vue'
import { 
  WebSocketConnectionState, 
  WebSocketMessageType, 
  WebSocketConfig, 
  WebSocketMessage, 
  WebSocketEventHandlers,
  WebSocketService,
  KitchenItemStatus,
  StationStatus,
  OrderUpdateType,
  OrderStatus,
  TableStatus,
  InventoryAlertLevel,
  PaymentStatus,
  StaffNotificationMessage
} from '~/types/websocket'

// Global WebSocket instance
let websocketInstance: WebSocket | null = null
let reconnectTimer: NodeJS.Timeout | null = null
let heartbeatTimer: NodeJS.Timeout | null = null

export const useWebSocketService = (): WebSocketService => {
  const connectionState = ref<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED)
  const lastError = ref<Error | null>(null)
  const lastMessage = ref<WebSocketMessage | null>(null)
  const reconnectAttempts = ref(0)
  const eventHandlers = ref<Map<WebSocketMessageType, Function[]>>(new Map())
  
  let config: WebSocketConfig | null = null
  
  // Computed properties
  const isConnected = computed(() => connectionState.value === WebSocketConnectionState.CONNECTED)
  
  // Generate unique message ID
  const generateMessageId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  // Get tenant ID from authentication
  const getTenantId = (): string => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          return payload.tenantId || 'default'
        } catch (error) {
          console.warn('Failed to extract tenant ID from token:', error)
        }
      }
    }
    return 'default'
  }
  
  // Get user ID from authentication
  const getUserId = (): string | undefined => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          return payload.userId || payload.sub
        } catch (error) {
          console.warn('Failed to extract user ID from token:', error)
        }
      }
    }
    return undefined
  }
  
  // Create WebSocket message
  const createMessage = (type: WebSocketMessageType, data: any, metadata?: Record<string, any>): WebSocketMessage => {
    return {
      id: generateMessageId(),
      type,
      timestamp: new Date().toISOString(),
      tenantId: getTenantId(),
      userId: getUserId(),
      data,
      metadata
    }
  }
  
  // Send heartbeat
  const sendHeartbeat = () => {
    if (websocketInstance && websocketInstance.readyState === WebSocket.OPEN) {
      const heartbeatMessage = createMessage(WebSocketMessageType.SYSTEM_HEARTBEAT, { timestamp: Date.now() })
      websocketInstance.send(JSON.stringify(heartbeatMessage))
    }
  }
  
  // Start heartbeat
  const startHeartbeat = () => {
    if (config?.enableHeartbeat && config.heartbeatInterval) {
      heartbeatTimer = setInterval(sendHeartbeat, config.heartbeatInterval)
    }
  }
  
  // Stop heartbeat
  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }
  
  // Handle WebSocket message
  const handleMessage = (event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      lastMessage.value = message
      
      if (config?.debugMode) {
        console.log('WebSocket message received:', message)
      }
      
      // Call general message handler
      const generalHandlers = eventHandlers.value.get(message.type)
      if (generalHandlers) {
        generalHandlers.forEach(handler => {
          try {
            handler(message)
          } catch (error) {
            console.error('Error in message handler:', error)
          }
        })
      }
      
      // Call specific message handlers based on type
      const allHandlers = eventHandlers.value.get(message.type)
      if (allHandlers) {
        allHandlers.forEach(handler => {
          try {
            handler(message.data)
          } catch (error) {
            console.error('Error in specific message handler:', error)
          }
        })
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }
  
  // Handle WebSocket connection open
  const handleOpen = () => {
    connectionState.value = WebSocketConnectionState.CONNECTED
    reconnectAttempts.value = 0
    lastError.value = null
    
    startHeartbeat()
    
    if (config?.debugMode) {
      console.log('WebSocket connected')
    }
    
    // Call connection handlers
    const connectHandlers = eventHandlers.value.get(WebSocketMessageType.SYSTEM_HEARTBEAT)
    if (connectHandlers) {
      connectHandlers.forEach(handler => {
        try {
          handler()
        } catch (error) {
          console.error('Error in connect handler:', error)
        }
      })
    }
  }
  
  // Handle WebSocket connection close
  const handleClose = (event: CloseEvent) => {
    connectionState.value = WebSocketConnectionState.DISCONNECTED
    stopHeartbeat()
    
    if (config?.debugMode) {
      console.log('WebSocket disconnected:', event.code, event.reason)
    }
    
    // Attempt reconnection if enabled
    if (config?.enableAutoReconnect && reconnectAttempts.value < (config.maxReconnectAttempts || 5)) {
      connectionState.value = WebSocketConnectionState.RECONNECTING
      reconnectAttempts.value++
      
      reconnectTimer = setTimeout(() => {
        if (config) {
          connect(config)
        }
      }, config.reconnectInterval || 3000)
    }
  }
  
  // Handle WebSocket error
  const handleError = (event: Event) => {
    const error = new Error('WebSocket error occurred')
    lastError.value = error
    connectionState.value = WebSocketConnectionState.ERROR
    
    if (config?.debugMode) {
      console.error('WebSocket error:', event)
    }
  }
  
  // Connect to WebSocket
  const connect = async (wsConfig: WebSocketConfig): Promise<void> => {
    config = wsConfig
    
    if (websocketInstance) {
      websocketInstance.close()
    }
    
    return new Promise((resolve, reject) => {
      try {
        connectionState.value = WebSocketConnectionState.CONNECTING
        
        websocketInstance = new WebSocket(wsConfig.url, wsConfig.protocols)
        
        websocketInstance.onopen = (event) => {
          handleOpen()
          resolve()
        }
        
        websocketInstance.onmessage = handleMessage
        websocketInstance.onclose = handleClose
        websocketInstance.onerror = (event) => {
          handleError(event)
          reject(new Error('WebSocket connection failed'))
        }
        
        // Connection timeout
        setTimeout(() => {
          if (connectionState.value === WebSocketConnectionState.CONNECTING) {
            websocketInstance?.close()
            reject(new Error('WebSocket connection timeout'))
          }
        }, 10000)
        
      } catch (error) {
        lastError.value = error as Error
        connectionState.value = WebSocketConnectionState.ERROR
        reject(error)
      }
    })
  }
  
  // Disconnect from WebSocket
  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    
    stopHeartbeat()
    
    if (websocketInstance) {
      websocketInstance.close()
      websocketInstance = null
    }
    
    connectionState.value = WebSocketConnectionState.DISCONNECTED
    reconnectAttempts.value = 0
  }
  
  // Send message
  const sendMessage = async (message: WebSocketMessage): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!websocketInstance || websocketInstance.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'))
        return
      }
      
      try {
        websocketInstance.send(JSON.stringify(message))
        
        if (config?.debugMode) {
          console.log('WebSocket message sent:', message)
        }
        
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
  
  // Subscribe to event
  const subscribe = (eventType: WebSocketMessageType, handler: Function) => {
    if (!eventHandlers.value.has(eventType)) {
      eventHandlers.value.set(eventType, [])
    }
    eventHandlers.value.get(eventType)!.push(handler)
  }
  
  // Unsubscribe from event
  const unsubscribe = (eventType: WebSocketMessageType, handler: Function) => {
    const handlers = eventHandlers.value.get(eventType)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }
  
  // Get connection state
  const getConnectionState = (): WebSocketConnectionState => {
    return connectionState.value
  }
  
  // Kitchen Display Methods
  const sendKitchenOrderUpdate = async (orderId: string, status: KitchenItemStatus): Promise<void> => {
    const message = createMessage(WebSocketMessageType.KITCHEN_ORDER_UPDATE, {
      orderId,
      status,
      timestamp: new Date().toISOString()
    })
    return sendMessage(message)
  }
  
  const sendKitchenStationStatus = async (stationId: string, status: StationStatus): Promise<void> => {
    const message = createMessage(WebSocketMessageType.KITCHEN_STATION_STATUS, {
      stationId,
      status,
      timestamp: new Date().toISOString()
    })
    return sendMessage(message)
  }
  
  // Order Management Methods
  const sendOrderUpdate = async (orderId: string, updateType: OrderUpdateType, data: any): Promise<void> => {
    const message = createMessage(WebSocketMessageType.ORDER_STATUS_UPDATE, {
      orderId,
      updateType,
      ...data,
      timestamp: new Date().toISOString()
    })
    return sendMessage(message)
  }
  
  const sendOrderStatusUpdate = async (orderId: string, status: OrderStatus): Promise<void> => {
    const message = createMessage(WebSocketMessageType.ORDER_STATUS_UPDATE, {
      orderId,
      status,
      updateType: OrderUpdateType.STATUS_CHANGE,
      timestamp: new Date().toISOString()
    })
    return sendMessage(message)
  }
  
  // Table Management Methods
  const sendTableStatusUpdate = async (tableId: string, status: TableStatus): Promise<void> => {
    const message = createMessage(WebSocketMessageType.TABLE_STATUS_UPDATE, {
      tableId,
      status,
      timestamp: new Date().toISOString()
    })
    return sendMessage(message)
  }
  
  const sendTableAssignmentUpdate = async (tableId: string, assignedStaff: string): Promise<void> => {
    const message = createMessage(WebSocketMessageType.TABLE_ASSIGNMENT_UPDATE, {
      tableId,
      assignedStaff,
      timestamp: new Date().toISOString()
    })
    return sendMessage(message)
  }
  
  // Inventory Management Methods
  const sendInventoryUpdate = async (itemId: string, currentStock: number): Promise<void> => {
    const message = createMessage(WebSocketMessageType.INVENTORY_LEVEL_UPDATE, {
      itemId,
      currentStock,
      timestamp: new Date().toISOString()
    })
    return sendMessage(message)
  }
  
  const sendInventoryAlert = async (itemId: string, alertLevel: InventoryAlertLevel): Promise<void> => {
    const message = createMessage(WebSocketMessageType.INVENTORY_ITEM_LOW_STOCK, {
      itemId,
      alertLevel,
      timestamp: new Date().toISOString()
    })
    return sendMessage(message)
  }
  
  // Menu Management Methods
  const sendMenuItemAvailability = async (itemId: string, isAvailable: boolean): Promise<void> => {
    const message = createMessage(WebSocketMessageType.MENU_ITEM_AVAILABILITY, {
      itemId,
      isAvailable,
      timestamp: new Date().toISOString()
    })
    return sendMessage(message)
  }
  
  const sendMenuItemPriceUpdate = async (itemId: string, price: number): Promise<void> => {
    const message = createMessage(WebSocketMessageType.MENU_ITEM_PRICE_UPDATE, {
      itemId,
      price,
      timestamp: new Date().toISOString()
    })
    return sendMessage(message)
  }
  
  // Payment Processing Methods
  const sendPaymentUpdate = async (orderId: string, paymentId: string, status: PaymentStatus): Promise<void> => {
    const message = createMessage(WebSocketMessageType.PAYMENT_PROCESSING, {
      orderId,
      paymentId,
      status,
      timestamp: new Date().toISOString()
    })
    return sendMessage(message)
  }
  
  // Staff Notification Methods
  const sendStaffNotification = async (notification: StaffNotificationMessage): Promise<void> => {
    const message = createMessage(WebSocketMessageType.STAFF_NOTIFICATION, notification)
    return sendMessage(message)
  }
  
  const sendStaffAlert = async (alert: StaffNotificationMessage): Promise<void> => {
    const message = createMessage(WebSocketMessageType.STAFF_ALERT, alert)
    return sendMessage(message)
  }
  
  const sendManagerAlert = async (alert: StaffNotificationMessage): Promise<void> => {
    const message = createMessage(WebSocketMessageType.MANAGER_ALERT, alert)
    return sendMessage(message)
  }
  
  // Cleanup on component unmount
  onUnmounted(() => {
    disconnect()
  })
  
  return {
    // Connection methods
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    getConnectionState,
    isConnected: () => isConnected.value,
    
    // Kitchen Display methods
    sendKitchenOrderUpdate,
    sendKitchenStationStatus,
    
    // Order Management methods
    sendOrderUpdate,
    sendOrderStatusUpdate,
    
    // Table Management methods
    sendTableStatusUpdate,
    sendTableAssignmentUpdate,
    
    // Inventory Management methods
    sendInventoryUpdate,
    sendInventoryAlert,
    
    // Menu Management methods
    sendMenuItemAvailability,
    sendMenuItemPriceUpdate,
    
    // Payment Processing methods
    sendPaymentUpdate,
    
    // Staff Notification methods
    sendStaffNotification,
    sendStaffAlert,
    sendManagerAlert
  }
} 