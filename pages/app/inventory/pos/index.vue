<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <PosHeader 
      :current-user="currentUser"
      :active-orders="activeOrders.length"
      :table-count="tables.length"
      @switch-role="handleRoleSwitch"
      @logout="handleLogout"
    />

    <!-- Role-based Main Content -->
    <div class="flex-1 p-4">
      <!-- Server/Waiter Interface -->
      <div v-if="currentRole === 'server'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Table Management -->
        <div class="lg:col-span-1">
          <TableManagement
            :tables="tables"
            :selected-table="selectedTable"
            @table-select="handleTableSelect"
            @table-status-change="handleTableStatusChange"
            @table-merge="handleTableMerge"
            @table-split="handleTableSplit"
          />
        </div>

        <!-- Order Taking -->
        <div class="lg:col-span-2">
          <OrderTaking
            :menu-items="menuItems"
            :categories="menuCategories"
            :current-order="currentOrder"
            :selected-table="selectedTable"
            @add-item="handleAddItem"
            @remove-item="handleRemoveItem"
            @modify-item="handleModifyItem"
            @submit-order="handleSubmitOrder"
            @save-draft="handleSaveDraft"
          />
        </div>
      </div>

      <!-- Kitchen Display Interface -->
      <div v-else-if="currentRole === 'kitchen'" class="space-y-6">
        <KitchenDisplay
          :orders="kitchenOrders"
          :stations="preparationStations"
          @mark-ready="handleMarkReady"
          @mark-started="handleMarkStarted"
          @update-timing="handleUpdateTiming"
          @priority-change="handlePriorityChange"
        />
      </div>

      <!-- Bartender Interface -->
      <div v-else-if="currentRole === 'bartender'" class="space-y-6">
        <BartenderStation
          :drink-orders="drinkOrders"
          :inventory-levels="inventoryLevels"
          :happy-hour-active="happyHourActive"
          @mark-drink-ready="handleDrinkReady"
          @check-inventory="handleInventoryCheck"
          @update-special-pricing="handleSpecialPricing"
        />
      </div>

      <!-- Cashier Interface -->
      <div v-else-if="currentRole === 'cashier'" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Quick Service Order -->
        <div>
          <QuickServiceOrder
            :menu-items="menuItems"
            :categories="menuCategories"
            :current-order="currentOrder"
            @add-item="handleAddItem"
            @checkout="handleCheckout"
          />
        </div>

        <!-- Payment Processing -->
        <div>
          <PaymentInterface
            :current-order="currentOrder"
            :payment-methods="paymentMethods"
            @process-payment="handlePayment"
            @split-payment="handleSplitPayment"
            @calculate-change="handleChangeCalculation"
          />
        </div>
      </div>

      <!-- Manager Dashboard -->
      <div v-else-if="currentRole === 'manager'" class="space-y-6">
        <ManagerDashboard
          :sales-data="salesData"
          :staff-performance="staffPerformance"
          :real-time-metrics="realTimeMetrics"
          :pending-approvals="pendingApprovals"
          @approve-discount="handleApproveDiscount"
          @approve-void="handleApproveVoid"
          @view-reports="handleViewReports"
        />
      </div>
    </div>

    <!-- Floating Action Buttons -->
    <div class="fixed bottom-6 right-6 flex flex-col gap-3">
      <!-- Emergency Stop -->
      <Button
        v-if="currentRole === 'manager'"
        variant="destructive"
        size="lg"
        class="rounded-full h-14 w-14 shadow-lg"
        @click="handleEmergencyStop"
      >
        <AlertTriangle class="h-6 w-6" />
      </Button>

      <!-- Quick Actions -->
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="lg"
            class="rounded-full h-14 w-14 shadow-lg"
          >
            <Plus class="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-48">
          <DropdownMenuItem @click="handleQuickAction('new-order')">
            <PlusCircle class="mr-2 h-4 w-4" />
            New Order
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleQuickAction('new-table')">
            <Table class="mr-2 h-4 w-4" />
            Seat Table
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleQuickAction('inventory-check')">
            <Package class="mr-2 h-4 w-4" />
            Quick Inventory
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Modals and Dialogs -->
    <!-- Order Modification Dialog -->
    <Dialog v-model:open="showOrderModification">
      <DialogContent class="max-w-2xl">
        <OrderModificationDialog
          :order="orderToModify"
          :menu-items="menuItems"
          @save-changes="handleOrderModification"
          @cancel="showOrderModification = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Bill Splitting Dialog -->
    <Dialog v-model:open="showBillSplitting">
      <DialogContent class="max-w-4xl">
        <BillSplittingDialog
          :order="orderToSplit"
          @split-complete="handleBillSplitComplete"
          @cancel="showBillSplitting = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Payment Processing Dialog -->
    <Dialog v-model:open="showPaymentProcessing">
      <DialogContent class="max-w-lg">
        <PaymentProcessingDialog
          :payment-data="currentPayment"
          :payment-status="paymentStatus"
          @payment-complete="handlePaymentComplete"
          @payment-failed="handlePaymentFailed"
        />
      </DialogContent>
    </Dialog>

    <!-- Inventory Alert Dialog -->
    <Dialog v-model:open="showInventoryAlert">
      <DialogContent class="max-w-md">
        <InventoryAlertDialog
          :low-stock-items="lowStockItems"
          :out-of-stock-items="outOfStockItems"
          @acknowledge="showInventoryAlert = false"
          @adjust-inventory="handleInventoryAdjustment"
        />
      </DialogContent>
    </Dialog>

    <!-- Real-time Notifications -->
    <NotificationCenter
      :notifications="notifications"
      @dismiss="handleDismissNotification"
      @action="handleNotificationAction"
    />

    <!-- Connection Status Indicator -->
    <ConnectionStatus
      :is-connected="isConnected"
      :retry-count="retryCount"
      @retry="handleConnectionRetry"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from '@/components/ui/toast'
import {
  AlertTriangle,
  Plus,
  PlusCircle,
  Table,
  Package
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'

// Components
import PosHeader from '@/components/inventory/pos/PosHeader.vue'
import TableManagement from '@/components/inventory/pos/TableManagement.vue'
import OrderTaking from '@/components/inventory/pos/OrderTaking.vue'
import KitchenDisplay from '@/components/inventory/pos/KitchenDisplay.vue'
import BartenderStation from '@/components/inventory/pos/BartenderStation.vue'
import QuickServiceOrder from '@/components/inventory/pos/QuickServiceOrder.vue'
import PaymentInterface from '@/components/inventory/pos/PaymentInterface.vue'
import ManagerDashboard from '@/components/inventory/pos/ManagerDashboard.vue'
import OrderModificationDialog from '@/components/inventory/pos/OrderModificationDialog.vue'
import BillSplittingDialog from '@/components/inventory/pos/BillSplittingDialog.vue'
import PaymentProcessingDialog from '@/components/inventory/pos/PaymentProcessingDialog.vue'
import InventoryAlertDialog from '@/components/inventory/pos/InventoryAlertDialog.vue'
import SplitPaymentComponent from '@/components/inventory/pos/SplitPaymentComponent.vue'
import NotificationCenter from '@/components/inventory/pos/NotificationCenter.vue'
import ConnectionStatus from '@/components/inventory/pos/ConnectionStatus.vue'

// Stores
import { useAuthStore } from '@/store/modules/auth'
import { useInventoryItemsStore } from '@/store/modules/inventory/inventory-items'
import { useItemCategoriesStore } from '@/store/modules/inventory/item-categories'

// Initialize stores
const authStore = useAuthStore()
const inventoryItemsStore = useInventoryItemsStore()
const itemCategoriesStore = useItemCategoriesStore()
const { toast } = useToast()

// Page metadata
definePageMeta({
  layout: 'default'
})

// Core state
const currentRole = ref('server') // server, kitchen, bartender, cashier, manager
const currentUser = computed(() => authStore.user)
const isConnected = ref(true)
const retryCount = ref(0)

// Tables and seating
const tables = ref([])
const selectedTable = ref(null)

// Menu and inventory
const menuItems = computed(() => inventoryItemsStore.getItems)
const menuCategories = computed(() => itemCategoriesStore.getActiveCategories)
const inventoryLevels = ref({})
const lowStockItems = ref([])
const outOfStockItems = ref([])

// Orders
const activeOrders = ref([])
const currentOrder = ref(null)
const kitchenOrders = ref([])
const drinkOrders = ref([])

// Kitchen and preparation
const preparationStations = ref([])

// Payment
const paymentMethods = ref([])
const currentPayment = ref(null)
const paymentStatus = ref('idle')
const happyHourActive = ref(false)

// Manager data
const salesData = ref({})
const staffPerformance = ref([])
const realTimeMetrics = ref({})
const pendingApprovals = ref([])

// Dialog states
const showOrderModification = ref(false)
const showBillSplitting = ref(false)
const showPaymentProcessing = ref(false)
const showInventoryAlert = ref(false)

// Dialog data
const orderToModify = ref(null)
const orderToSplit = ref(null)

// Notifications
const notifications = ref([])

// WebSocket connection for real-time updates
let websocket = null

// Table Management Handlers
const handleTableSelect = (table) => {
  selectedTable.value = table
  // Load existing order for table if any
  loadTableOrder(table.id)
}

const handleTableStatusChange = async (tableId, status) => {
  try {
    // Update table status via API
    await updateTableStatus(tableId, status)
    
    // Update local state
    const table = tables.value.find(t => t.id === tableId)
    if (table) {
      table.status = status
    }

    toast({
      title: 'Table Updated',
      description: `Table ${table?.number} status changed to ${status}`
    })
  } catch (error) {
    console.error('Error updating table status:', error)
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to update table status'
    })
  }
}

const handleTableMerge = async (tableIds) => {
  try {
    await mergeTablesRequest(tableIds)
    await refreshTables()
    toast({
      title: 'Tables Merged',
      description: 'Tables successfully merged'
    })
  } catch (error) {
    console.error('Error merging tables:', error)
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to merge tables'
    })
  }
}

const handleTableSplit = async (tableId, newTableCount) => {
  try {
    await splitTableRequest(tableId, newTableCount)
    await refreshTables()
    toast({
      title: 'Table Split',
      description: `Table split into ${newTableCount} tables`
    })
  } catch (error) {
    console.error('Error splitting table:', error)
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to split table'
    })
  }
}

// Order Management Handlers
const handleAddItem = (item, modifiers = [], quantity = 1) => {
  if (!currentOrder.value) {
    currentOrder.value = createNewOrder()
  }

  const orderItem = {
    id: generateId(),
    menuItemId: item.id,
    name: item.name,
    price: item.price,
    quantity,
    modifiers,
    specialInstructions: '',
    status: 'pending'
  }

  currentOrder.value.items.push(orderItem)
  calculateOrderTotal()
}

const handleRemoveItem = (itemId) => {
  if (currentOrder.value) {
    currentOrder.value.items = currentOrder.value.items.filter(item => item.id !== itemId)
    calculateOrderTotal()
  }
}

const handleModifyItem = (itemId, modifications) => {
  if (currentOrder.value) {
    const item = currentOrder.value.items.find(item => item.id === itemId)
    if (item) {
      Object.assign(item, modifications)
      calculateOrderTotal()
    }
  }
}

const handleSubmitOrder = async () => {
  try {
    if (!currentOrder.value || !selectedTable.value) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a table and add items to the order'
      })
      return
    }

    const orderData = {
      ...currentOrder.value,
      tableId: selectedTable.value.id,
      serverId: currentUser.value.id,
      timestamp: new Date().toISOString()
    }

    await submitOrderToKitchen(orderData)
    
    // Add to active orders
    activeOrders.value.push(orderData)
    
    // Clear current order
    currentOrder.value = null
    
    toast({
      title: 'Order Submitted',
      description: `Order for table ${selectedTable.value.number} sent to kitchen`
    })
  } catch (error) {
    console.error('Error submitting order:', error)
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to submit order'
    })
  }
}

const handleSaveDraft = async () => {
  try {
    if (currentOrder.value) {
      await saveDraftOrder(currentOrder.value)
      toast({
        title: 'Draft Saved',
        description: 'Order saved as draft'
      })
    }
  } catch (error) {
    console.error('Error saving draft:', error)
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to save draft'
    })
  }
}

// Kitchen Handlers
const handleMarkReady = async (orderId, itemId) => {
  try {
    await markItemReady(orderId, itemId)
    updateKitchenOrderStatus(orderId, itemId, 'ready')
    
    // Send notification to server
    sendNotification('item-ready', {
      orderId,
      itemId,
      tableNumber: getTableByOrderId(orderId)?.number
    })
  } catch (error) {
    console.error('Error marking item ready:', error)
  }
}

const handleMarkStarted = async (orderId, itemId) => {
  try {
    await markItemStarted(orderId, itemId)
    updateKitchenOrderStatus(orderId, itemId, 'preparing')
  } catch (error) {
    console.error('Error marking item started:', error)
  }
}

const handleUpdateTiming = async (orderId, estimatedTime) => {
  try {
    await updateOrderTiming(orderId, estimatedTime)
    
    // Update local state
    const order = kitchenOrders.value.find(o => o.id === orderId)
    if (order) {
      order.estimatedTime = estimatedTime
    }
  } catch (error) {
    console.error('Error updating timing:', error)
  }
}

const handlePriorityChange = async (orderId, priority) => {
  try {
    await updateOrderPriority(orderId, priority)
    
    // Update local state and re-sort
    const order = kitchenOrders.value.find(o => o.id === orderId)
    if (order) {
      order.priority = priority
      sortKitchenOrders()
    }
  } catch (error) {
    console.error('Error updating priority:', error)
  }
}

// Bartender Handlers
const handleDrinkReady = async (orderId, drinkId) => {
  try {
    await markDrinkReady(orderId, drinkId)
    updateDrinkOrderStatus(orderId, drinkId, 'ready')
    
    // Send notification to server
    sendNotification('drink-ready', {
      orderId,
      drinkId,
      tableNumber: getTableByOrderId(orderId)?.number
    })
  } catch (error) {
    console.error('Error marking drink ready:', error)
  }
}

const handleInventoryCheck = async (itemId) => {
  try {
    const inventory = await checkInventoryLevel(itemId)
    inventoryLevels.value[itemId] = inventory
    
    if (inventory.level === 'low') {
      toast({
        variant: 'warning',
        title: 'Low Stock Alert',
        description: `${inventory.name} is running low`
      })
    }
  } catch (error) {
    console.error('Error checking inventory:', error)
  }
}

const handleSpecialPricing = (items, discountType, discountValue) => {
  // Apply happy hour or special pricing
  items.forEach(item => {
    if (discountType === 'percentage') {
      item.specialPrice = item.price * (1 - discountValue / 100)
    } else {
      item.specialPrice = Math.max(0, item.price - discountValue)
    }
  })
}

// Payment Handlers
const handleCheckout = () => {
  if (currentOrder.value) {
    showPaymentProcessing.value = true
    currentPayment.value = {
      order: currentOrder.value,
      amount: currentOrder.value.total,
      method: null
    }
  }
}

const handlePayment = async (paymentData) => {
  try {
    paymentStatus.value = 'processing'
    
    const result = await processPayment(paymentData)
    
    if (result.success) {
      paymentStatus.value = 'success'
      
      // Clear current order
      currentOrder.value = null
      
      // Print receipt if needed
      if (paymentData.printReceipt) {
        await printReceipt(result.receiptData)
      }
      
      toast({
        title: 'Payment Successful',
        description: `Payment of ${paymentData.amount} processed successfully`
      })
      
      setTimeout(() => {
        showPaymentProcessing.value = false
        paymentStatus.value = 'idle'
      }, 2000)
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Payment error:', error)
    paymentStatus.value = 'failed'
    toast({
      variant: 'destructive',
      title: 'Payment Failed',
      description: error.message || 'Payment processing failed'
    })
  }
}

const handleSplitPayment = async (splitData) => {
  try {
    const results = await Promise.all(
      splitData.payments.map(payment => processPayment(payment))
    )
    
    const allSuccessful = results.every(result => result.success)
    
    if (allSuccessful) {
      toast({
        title: 'Split Payment Successful',
        description: 'All payments processed successfully'
      })
      showBillSplitting.value = false
    } else {
      throw new Error('Some payments failed')
    }
  } catch (error) {
    console.error('Split payment error:', error)
    toast({
      variant: 'destructive',
      title: 'Split Payment Failed',
      description: 'One or more payments failed'
    })
  }
}

const handleChangeCalculation = (cashAmount, totalAmount) => {
  return Math.max(0, cashAmount - totalAmount)
}

// Manager Handlers
const handleApproveDiscount = async (requestId, approved) => {
  try {
    await approveDiscountRequest(requestId, approved)
    
    // Remove from pending approvals
    pendingApprovals.value = pendingApprovals.value.filter(
      approval => approval.id !== requestId
    )
    
    toast({
      title: approved ? 'Discount Approved' : 'Discount Denied',
      description: `Discount request ${approved ? 'approved' : 'denied'}`
    })
  } catch (error) {
    console.error('Error processing discount approval:', error)
  }
}

const handleApproveVoid = async (requestId, approved) => {
  try {
    await approveVoidRequest(requestId, approved)
    
    // Remove from pending approvals
    pendingApprovals.value = pendingApprovals.value.filter(
      approval => approval.id !== requestId
    )
    
    toast({
      title: approved ? 'Void Approved' : 'Void Denied',
      description: `Void request ${approved ? 'approved' : 'denied'}`
    })
  } catch (error) {
    console.error('Error processing void approval:', error)
  }
}

const handleViewReports = (reportType) => {
  // Navigate to reports page or open report dialog
  navigateTo(`/app/reports/${reportType}`)
}

// Quick Action Handlers
const handleQuickAction = (action) => {
  switch (action) {
    case 'new-order':
      if (!selectedTable.value) {
        toast({
          variant: 'destructive',
          title: 'Select Table',
          description: 'Please select a table before creating a new order'
        })
        return
      }
      currentOrder.value = createNewOrder()
      toast({
        title: 'New Order',
        description: `Started new order for table ${selectedTable.value.number}`
      })
      break
      
    case 'new-table':
      // Open table seating dialog or navigate to table management
      toast({
        title: 'Seat Table',
        description: 'Select an available table to seat customers'
      })
      break
      
    case 'inventory-check':
      // Open quick inventory check
      showInventoryAlert.value = true
      break
      
    default:
      console.log('Unknown quick action:', action)
  }
}

// Role and User Handlers
const handleRoleSwitch = (newRole) => {
  currentRole.value = newRole
  toast({
    title: 'Role Changed',
    description: `Switched to ${newRole} interface`
  })
}

const handleLogout = () => {
  // Clear any pending orders or data
  currentOrder.value = null
  selectedTable.value = null
  
  // Navigate to login or handle logout
  navigateTo('/auth/login')
  
  toast({
    title: 'Logged Out',
    description: 'You have been logged out successfully'
  })
}

const handleEmergencyStop = () => {
  // Emergency stop functionality for managers
  toast({
    variant: 'destructive',
    title: 'Emergency Stop',
    description: 'Emergency stop activated - all operations paused'
  })
}

// Connection Handlers
const handleConnectionRetry = () => {
  retryCount.value += 1
  setupWebSocket()
  
  toast({
    title: 'Reconnecting',
    description: `Attempting to reconnect... (${retryCount.value})`
  })
}

// Notification Handlers
const handleDismissNotification = (notificationId) => {
  notifications.value = notifications.value.filter(
    notification => notification.id !== notificationId
  )
}

const handleNotificationAction = (notification, action) => {
  // Handle notification actions based on type
  switch (notification.type) {
    case 'order-ready':
      if (action === 'view') {
        // Navigate to order or highlight it
        console.log('View order:', notification.orderId)
      }
      break
      
    case 'low-stock':
      if (action === 'restock') {
        // Open restocking interface
        showInventoryAlert.value = true
      }
      break
      
    case 'table-ready':
      if (action === 'assign') {
        // Assign table to server
        console.log('Assign table:', notification.tableId)
      }
      break
      
    default:
      console.log('Unknown notification action:', action)
  }
  
  // Dismiss notification after action
  handleDismissNotification(notification.id)
}

// Utility functions
const createNewOrder = () => ({
  id: generateId(),
  orderNumber: `ORD${Date.now()}`,
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  status: 'draft',
  createdAt: new Date().toISOString()
})

const calculateOrderTotal = () => {
  if (currentOrder.value) {
    const subtotal = currentOrder.value.items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity
      const modifiersTotal = item.modifiers?.reduce((modSum, mod) => modSum + mod.price, 0) || 0
      return sum + itemTotal + modifiersTotal
    }, 0)
    
    const tax = subtotal * 0.16 // 16% VAT
    
    currentOrder.value.subtotal = subtotal
    currentOrder.value.tax = tax
    currentOrder.value.total = subtotal + tax
  }
}

const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// WebSocket setup
const setupWebSocket = () => {
  try {
    websocket = new WebSocket(`ws://localhost:8080/ws/pos/${currentUser.value.id}`)
    
    websocket.onopen = () => {
      isConnected.value = true
      retryCount.value = 0
      console.log('WebSocket connected')
    }
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      handleWebSocketMessage(message)
    }
    
    websocket.onclose = () => {
      isConnected.value = false
      setTimeout(reconnectWebSocket, 5000)
    }
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      isConnected.value = false
    }
  } catch (error) {
    console.error('Failed to setup WebSocket:', error)
    isConnected.value = false
  }
}

const reconnectWebSocket = () => {
  if (retryCount.value < 5) {
    retryCount.value++
    setupWebSocket()
  }
}

const handleWebSocketMessage = (message) => {
  switch (message.type) {
    case 'order-update':
      handleOrderUpdate(message.data)
      break
    case 'payment-update':
      handlePaymentUpdate(message.data)
      break
    case 'inventory-alert':
      handleInventoryAlert(message.data)
      break
    case 'notification':
      addNotification(message.data)
      break
    default:
      console.log('Unknown message type:', message.type)
  }
}

// Initialize component
onMounted(async () => {
  try {
    // Load initial data
    await Promise.all([
      inventoryItemsStore.fetchItems(),
      itemCategoriesStore.fetchAllCategories(),
      loadTables(),
      loadPaymentMethods(),
      loadActiveOrders()
    ])
    
    // Setup real-time connection
    setupWebSocket()
    
  } catch (error) {
    console.error('Error initializing POS:', error)
    toast({
      variant: 'destructive',
      title: 'Initialization Error',
      description: 'Failed to initialize POS system'
    })
  }
})

onUnmounted(() => {
  if (websocket) {
    websocket.close()
  }
})

// API function stubs - these would be implemented with actual backend calls
const updateTableStatus = async (tableId, status) => {
  // Simulate API call
  return new Promise(resolve => setTimeout(resolve, 500))
}

const mergeTablesRequest = async (tableIds) => {
  // Simulate API call
  return new Promise(resolve => setTimeout(resolve, 1000))
}

const splitTableRequest = async (tableId, newTableCount) => {
  // Simulate API call
  return new Promise(resolve => setTimeout(resolve, 1000))
}

const submitOrderToKitchen = async (orderData) => {
  // Simulate API call
  return new Promise(resolve => setTimeout(resolve, 800))
}

const loadTableOrder = async (tableId) => {
  // Simulate API call to load existing order for table
  return new Promise(resolve => setTimeout(resolve, 300))
}

const refreshTables = async () => {
  // Simulate API call to refresh table data
  return new Promise(resolve => setTimeout(resolve, 500))
}

const loadTables = async () => {
  // Mock table data
  tables.value = [
    { id: 1, number: 1, capacity: 4, status: 'available', section: 'A' },
    { id: 2, number: 2, capacity: 2, status: 'occupied', section: 'A' },
    { id: 3, number: 3, capacity: 6, status: 'reserved', section: 'B' },
    { id: 4, number: 4, capacity: 4, status: 'needs-cleaning', section: 'B' }
  ]
}

const loadPaymentMethods = async () => {
  // Mock payment methods
  paymentMethods.value = [
    { id: 'cash', name: 'Cash', enabled: true },
    { id: 'card', name: 'Credit/Debit Card', enabled: true },
    { id: 'mpesa', name: 'M-Pesa', enabled: true }
  ]
}

const loadActiveOrders = async () => {
  // Mock active orders
  activeOrders.value = []
}

const approveDiscountRequest = async (requestId, approved) => {
  // Simulate API call for discount approval
  return new Promise(resolve => setTimeout(resolve, 500))
}

const approveVoidRequest = async (requestId, approved) => {
  // Simulate API call for void approval
  return new Promise(resolve => setTimeout(resolve, 500))
}
</script>

<style scoped>
/* Custom styles for POS interface */
.pos-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.table-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.kitchen-order {
  border-left: 4px solid #10b981;
  transition: all 0.3s ease;
}

.kitchen-order.urgent {
  border-left-color: #ef4444;
  background-color: #fef2f2;
}

.kitchen-order.priority {
  border-left-color: #f59e0b;
  background-color: #fffbeb;
}

@media (max-width: 768px) {
  .table-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>