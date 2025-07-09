// WebSocket Connection States
export enum WebSocketConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// WebSocket Message Types
export enum WebSocketMessageType {
  // Kitchen Display System
  KITCHEN_ORDER_NEW = 'kitchen.order.new',
  KITCHEN_ORDER_UPDATE = 'kitchen.order.update',
  KITCHEN_ORDER_COMPLETE = 'kitchen.order.complete',
  KITCHEN_ORDER_CANCEL = 'kitchen.order.cancel',
  KITCHEN_STATION_STATUS = 'kitchen.station.status',
  KITCHEN_PRIORITY_UPDATE = 'kitchen.priority.update',
  
  // Restaurant Orders
  ORDER_STATUS_UPDATE = 'order.status.update',
  ORDER_ITEM_UPDATE = 'order.item.update',
  ORDER_PAYMENT_UPDATE = 'order.payment.update',
  ORDER_SPLIT_UPDATE = 'order.split.update',
  ORDER_MERGE_UPDATE = 'order.merge.update',
  
  // Table Management
  TABLE_STATUS_UPDATE = 'table.status.update',
  TABLE_ASSIGNMENT_UPDATE = 'table.assignment.update',
  TABLE_OCCUPANCY_UPDATE = 'table.occupancy.update',
  
  // Inventory Management
  INVENTORY_LEVEL_UPDATE = 'inventory.level.update',
  INVENTORY_ITEM_OUT_OF_STOCK = 'inventory.item.out_of_stock',
  INVENTORY_ITEM_LOW_STOCK = 'inventory.item.low_stock',
  INVENTORY_ITEM_RESTOCK = 'inventory.item.restock',
  
  // Menu Management
  MENU_ITEM_AVAILABILITY = 'menu.item.availability',
  MENU_ITEM_PRICE_UPDATE = 'menu.item.price.update',
  MENU_CATEGORY_UPDATE = 'menu.category.update',
  
  // Payment Processing
  PAYMENT_PROCESSING = 'payment.processing',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUND = 'payment.refund',
  
  // Staff Notifications
  STAFF_NOTIFICATION = 'staff.notification',
  STAFF_ALERT = 'staff.alert',
  MANAGER_ALERT = 'manager.alert',
  
  // System Events
  SYSTEM_HEARTBEAT = 'system.heartbeat',
  SYSTEM_MAINTENANCE = 'system.maintenance',
  SYSTEM_ERROR = 'system.error'
}

// Base WebSocket Message Interface
export interface WebSocketMessage {
  id: string
  type: WebSocketMessageType
  timestamp: string
  tenantId: string
  userId?: string
  data: any
  metadata?: Record<string, any>
}

// Kitchen Display System Types
export interface KitchenOrderMessage {
  orderId: string
  tableId?: string
  stationId: string
  items: KitchenOrderItem[]
  priority: OrderPriority
  estimatedTime: number
  specialInstructions?: string
  dietaryRestrictions?: string[]
  allergens?: string[]
  rushOrder?: boolean
}

export interface KitchenOrderItem {
  id: string
  menuItemId: string
  menuItemName: string
  quantity: number
  modifications?: string[]
  specialInstructions?: string
  cookingTime?: number
  station?: string
  status: KitchenItemStatus
}

export enum KitchenItemStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum OrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface KitchenStationStatus {
  stationId: string
  stationName: string
  stationType: string
  status: StationStatus
  currentOrders: number
  avgProcessingTime: number
  isOnline: boolean
  lastUpdate: string
}

export enum StationStatus {
  ACTIVE = 'active',
  BUSY = 'busy',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance'
}

// Order Management Types
export interface OrderUpdateMessage {
  orderId: string
  tableId?: string
  status: OrderStatus
  items?: OrderItem[]
  totalAmount?: number
  paymentStatus?: PaymentStatus
  updateType: OrderUpdateType
  updatedBy: string
  timestamp: string
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum OrderUpdateType {
  STATUS_CHANGE = 'status_change',
  ITEM_ADDED = 'item_added',
  ITEM_REMOVED = 'item_removed',
  ITEM_MODIFIED = 'item_modified',
  PAYMENT_UPDATE = 'payment_update',
  SPLIT_ORDER = 'split_order',
  MERGE_ORDER = 'merge_order'
}

export interface OrderItem {
  id: string
  menuItemId: string
  menuItemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  modifications?: string[]
  specialInstructions?: string
  status: KitchenItemStatus
}

// Table Management Types
export interface TableUpdateMessage {
  tableId: string
  tableNumber: string
  status: TableStatus
  occupancy?: number
  capacity?: number
  assignedStaff?: string
  orderId?: string
  estimatedTurnTime?: number
  reservationId?: string
}

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
  OUT_OF_ORDER = 'out_of_order'
}

// Inventory Management Types
export interface InventoryUpdateMessage {
  itemId: string
  itemName: string
  currentStock: number
  minimumStock: number
  maximumStock: number
  unit: string
  location?: string
  lastUpdated: string
  alertLevel?: InventoryAlertLevel
}

export enum InventoryAlertLevel {
  NORMAL = 'normal',
  LOW = 'low',
  CRITICAL = 'critical',
  OUT_OF_STOCK = 'out_of_stock'
}

// Menu Management Types
export interface MenuUpdateMessage {
  itemId: string
  itemName: string
  categoryId: string
  price?: number
  isAvailable: boolean
  estimatedPrepTime?: number
  description?: string
  allergens?: string[]
  dietaryInfo?: string[]
}

// Payment Processing Types
export interface PaymentUpdateMessage {
  orderId: string
  paymentId: string
  amount: number
  paymentMethod: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  errorMessage?: string
  splitPayments?: SplitPayment[]
  tip?: number
  changeAmount?: number
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  MOBILE_PAYMENT = 'mobile_payment',
  DIGITAL_WALLET = 'digital_wallet'
}

export interface SplitPayment {
  id: string
  amount: number
  paymentMethod: PaymentMethod
  status: PaymentStatus
  customerId?: string
}

// Staff Notification Types
export interface StaffNotificationMessage {
  id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  targetRoles?: string[]
  targetUsers?: string[]
  actionRequired?: boolean
  actionUrl?: string
  expiresAt?: string
}

export enum NotificationType {
  ORDER_READY = 'order_ready',
  KITCHEN_DELAY = 'kitchen_delay',
  INVENTORY_ALERT = 'inventory_alert',
  PAYMENT_ISSUE = 'payment_issue',
  SYSTEM_ALERT = 'system_alert',
  MANAGER_APPROVAL = 'manager_approval',
  STAFF_REQUEST = 'staff_request'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// WebSocket Event Handlers
export interface WebSocketEventHandlers {
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  onReconnect?: () => void
  onMessage?: (message: WebSocketMessage) => void
  
  // Kitchen Display Handlers
  onKitchenOrderNew?: (message: KitchenOrderMessage) => void
  onKitchenOrderUpdate?: (message: KitchenOrderMessage) => void
  onKitchenOrderComplete?: (message: KitchenOrderMessage) => void
  onKitchenStationStatus?: (message: KitchenStationStatus) => void
  
  // Order Management Handlers
  onOrderStatusUpdate?: (message: OrderUpdateMessage) => void
  onOrderItemUpdate?: (message: OrderUpdateMessage) => void
  onOrderPaymentUpdate?: (message: OrderUpdateMessage) => void
  
  // Table Management Handlers
  onTableStatusUpdate?: (message: TableUpdateMessage) => void
  onTableAssignmentUpdate?: (message: TableUpdateMessage) => void
  
  // Inventory Management Handlers
  onInventoryLevelUpdate?: (message: InventoryUpdateMessage) => void
  onInventoryAlert?: (message: InventoryUpdateMessage) => void
  
  // Menu Management Handlers
  onMenuItemAvailability?: (message: MenuUpdateMessage) => void
  onMenuItemPriceUpdate?: (message: MenuUpdateMessage) => void
  
  // Payment Processing Handlers
  onPaymentProcessing?: (message: PaymentUpdateMessage) => void
  onPaymentCompleted?: (message: PaymentUpdateMessage) => void
  onPaymentFailed?: (message: PaymentUpdateMessage) => void
  
  // Staff Notification Handlers
  onStaffNotification?: (message: StaffNotificationMessage) => void
  onStaffAlert?: (message: StaffNotificationMessage) => void
  onManagerAlert?: (message: StaffNotificationMessage) => void
}

// WebSocket Configuration
export interface WebSocketConfig {
  url: string
  protocols?: string[]
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  enableHeartbeat?: boolean
  enableAutoReconnect?: boolean
  debugMode?: boolean
}

// WebSocket Store State
export interface WebSocketState {
  connectionState: WebSocketConnectionState
  isConnected: boolean
  reconnectAttempts: number
  lastError: Error | null
  lastMessage: WebSocketMessage | null
  
  // Kitchen Display State
  kitchenOrders: KitchenOrderMessage[]
  kitchenStations: KitchenStationStatus[]
  
  // Order Management State
  activeOrders: OrderUpdateMessage[]
  orderUpdates: OrderUpdateMessage[]
  
  // Table Management State
  tables: TableUpdateMessage[]
  
  // Inventory State
  inventoryAlerts: InventoryUpdateMessage[]
  
  // Menu State
  menuUpdates: MenuUpdateMessage[]
  
  // Payment State
  paymentUpdates: PaymentUpdateMessage[]
  
  // Staff Notifications
  notifications: StaffNotificationMessage[]
  alerts: StaffNotificationMessage[]
}

// WebSocket Service Interface
export interface WebSocketService {
  connect(config: WebSocketConfig): Promise<void>
  disconnect(): void
  sendMessage(message: WebSocketMessage): Promise<void>
  subscribe(eventType: WebSocketMessageType, handler: Function): void
  unsubscribe(eventType: WebSocketMessageType, handler: Function): void
  getConnectionState(): WebSocketConnectionState
  isConnected(): boolean
  
  // Kitchen Display Methods
  sendKitchenOrderUpdate(orderId: string, status: KitchenItemStatus): Promise<void>
  sendKitchenStationStatus(stationId: string, status: StationStatus): Promise<void>
  
  // Order Management Methods
  sendOrderUpdate(orderId: string, updateType: OrderUpdateType, data: any): Promise<void>
  sendOrderStatusUpdate(orderId: string, status: OrderStatus): Promise<void>
  
  // Table Management Methods
  sendTableStatusUpdate(tableId: string, status: TableStatus): Promise<void>
  sendTableAssignmentUpdate(tableId: string, assignedStaff: string): Promise<void>
  
  // Inventory Management Methods
  sendInventoryUpdate(itemId: string, currentStock: number): Promise<void>
  sendInventoryAlert(itemId: string, alertLevel: InventoryAlertLevel): Promise<void>
  
  // Menu Management Methods
  sendMenuItemAvailability(itemId: string, isAvailable: boolean): Promise<void>
  sendMenuItemPriceUpdate(itemId: string, price: number): Promise<void>
  
  // Payment Processing Methods
  sendPaymentUpdate(orderId: string, paymentId: string, status: PaymentStatus): Promise<void>
  
  // Staff Notification Methods
  sendStaffNotification(notification: StaffNotificationMessage): Promise<void>
  sendStaffAlert(alert: StaffNotificationMessage): Promise<void>
  sendManagerAlert(alert: StaffNotificationMessage): Promise<void>
} 