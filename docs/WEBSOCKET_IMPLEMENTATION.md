# WebSocket Implementation for Restaurant POS System

## Overview

This document describes the comprehensive WebSocket implementation for real-time communication in the restaurant POS system. The implementation provides real-time updates for kitchen displays, order management, table status, inventory levels, and payment processing.

## Architecture

### Components

1. **WebSocket Types** (`types/websocket.ts`)
   - Comprehensive type definitions for all WebSocket messages
   - Enums for connection states, message types, and status values
   - Interfaces for event handlers and service contracts

2. **WebSocket Service** (`composables/services/websocketService.ts`)
   - Core WebSocket connection management
   - Message handling and event subscription
   - Automatic reconnection and heartbeat functionality

3. **WebSocket Store** (`store/modules/websocket.ts`)
   - Pinia store for WebSocket state management
   - Reactive state for kitchen orders, tables, inventory, etc.
   - Event handlers for real-time updates

4. **WebSocket Plugin** (`plugins/websocket.client.ts`)
   - Nuxt plugin for automatic WebSocket initialization
   - Authentication-aware connection management
   - Page visibility handling for connection optimization

5. **Kitchen Display Service** (`composables/services/kitchenDisplayService.ts`)
   - Kitchen-specific WebSocket operations
   - Order and station management
   - Real-time notifications and alerts

6. **Restaurant Order Service** (`composables/services/restaurantOrderService.ts`)
   - Order, table, and payment management
   - Inventory and menu updates
   - Comprehensive event handling

## Features

### Real-time Kitchen Display System
- **Order Management**: New orders, updates, completions, and cancellations
- **Station Status**: Kitchen station online/offline status and workload
- **Priority Handling**: Rush orders and priority queue management
- **Special Requirements**: Dietary restrictions and allergen warnings
- **Time Tracking**: Estimated preparation times and completion tracking

### Order Management
- **Status Updates**: Real-time order status changes
- **Item Management**: Add, remove, and modify order items
- **Order Splitting**: Split bills between multiple payments
- **Order Merging**: Combine multiple orders for same table
- **Payment Integration**: Payment processing and status updates

### Table Management
- **Status Tracking**: Available, occupied, reserved, cleaning states
- **Staff Assignment**: Real-time staff assignment updates
- **Occupancy Monitoring**: Track table capacity and turnover
- **Reservation Integration**: Real-time reservation updates

### Inventory Management
- **Stock Levels**: Real-time inventory level updates
- **Low Stock Alerts**: Automatic notifications for low stock items
- **Out of Stock**: Immediate alerts for depleted items
- **Restock Notifications**: Alerts when items are restocked

### Menu Management
- **Item Availability**: Real-time menu item availability updates
- **Price Updates**: Dynamic pricing changes
- **Category Management**: Menu category updates
- **Preparation Time**: Estimated preparation time adjustments

### Payment Processing
- **Payment Status**: Real-time payment processing updates
- **Split Payments**: Multiple payment method support
- **Tips and Gratuity**: Tip calculation and processing
- **Refunds**: Refund processing and notifications

## Configuration

### Environment Variables

```env
# WebSocket Configuration
NUXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8090/ws
NUXT_PUBLIC_WEBSOCKET_PROTOCOL=restaurant-pos-protocol
NUXT_PUBLIC_WEBSOCKET_RECONNECT_INTERVAL=3000
NUXT_PUBLIC_WEBSOCKET_MAX_RECONNECT_ATTEMPTS=5
NUXT_PUBLIC_WEBSOCKET_HEARTBEAT_INTERVAL=30000
NUXT_PUBLIC_WEBSOCKET_DEBUG=true
```

### Backend Integration

The WebSocket implementation expects the Spring Boot backend to have:

1. **WebSocket Configuration** (`src/main/java/co/ke/pettycash/config/websocket/`)
   - WebSocket endpoint at `/ws`
   - Protocol support for `restaurant-pos-protocol`
   - Authentication integration

2. **Message Handlers** 
   - Kitchen display message routing
   - Order update broadcasting
   - Table status synchronization
   - Inventory level notifications

3. **Security Integration**
   - JWT token validation for WebSocket connections
   - Tenant-based message filtering
   - Role-based access control

## Usage Examples

### Kitchen Display Component

```vue
<template>
  <div class="kitchen-display">
    <KitchenDisplay />
  </div>
</template>

<script setup>
import KitchenDisplay from '~/components/restaurant/KitchenDisplay.vue'
</script>
```

### Using WebSocket Services

```typescript
// In a Vue component
import { useKitchenDisplayService } from '~/composables/services/kitchenDisplayService'
import { useRestaurantOrderService } from '~/composables/services/restaurantOrderService'

export default {
  setup() {
    const kitchenService = useKitchenDisplayService()
    const orderService = useRestaurantOrderService()
    
    onMounted(() => {
      // Subscribe to updates
      kitchenService.subscribeToKitchenUpdates()
      orderService.subscribeToOrderUpdates()
    })
    
    onUnmounted(() => {
      // Cleanup subscriptions
      kitchenService.unsubscribeFromKitchenUpdates()
      orderService.unsubscribeFromOrderUpdates()
    })
    
    // Use services
    const markOrderComplete = async (orderId: string) => {
      await kitchenService.markOrderComplete(orderId)
    }
    
    return {
      markOrderComplete
    }
  }
}
```

### Custom Event Handlers

```typescript
// Custom event handling
const webSocketService = useWebSocketService()

// Subscribe to specific events
webSocketService.subscribe(WebSocketMessageType.KITCHEN_ORDER_NEW, (orderData) => {
  console.log('New kitchen order:', orderData)
  // Custom logic here
})

// Send custom messages
await webSocketService.sendMessage({
  id: 'custom-message-id',
  type: WebSocketMessageType.KITCHEN_ORDER_UPDATE,
  timestamp: new Date().toISOString(),
  tenantId: 'tenant-123',
  data: {
    orderId: 'order-456',
    status: 'completed'
  }
})
```

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file with WebSocket configuration:

```env
NUXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8090/ws
NUXT_PUBLIC_WEBSOCKET_DEBUG=true
```

### 3. Backend Requirements

Ensure your Spring Boot backend has:
- WebSocket configuration enabled
- Endpoint `/ws` configured
- Authentication integration
- Message broadcasting implementation

### 4. Start Development Server

```bash
npm run dev
```

## Testing

### WebSocket Connection Testing

```typescript
// Test WebSocket connection
const testConnection = async () => {
  const webSocketStore = useWebSocketStore()
  const config = {
    url: 'ws://localhost:8090/ws',
    protocols: ['restaurant-pos-protocol'],
    enableHeartbeat: true,
    debugMode: true
  }
  
  try {
    await webSocketStore.connectWebSocket(config)
    console.log('WebSocket connected successfully')
  } catch (error) {
    console.error('WebSocket connection failed:', error)
  }
}
```

### Message Testing

```typescript
// Test message sending
const testMessage = async () => {
  const webSocketService = useWebSocketService()
  
  await webSocketService.sendKitchenOrderUpdate('order-123', 'completed')
  await webSocketService.sendTableStatusUpdate('table-456', 'available')
  await webSocketService.sendInventoryUpdate('item-789', 50)
}
```

## Security Considerations

1. **Authentication**: WebSocket connections require valid JWT tokens
2. **Tenant Isolation**: Messages are filtered by tenant ID
3. **Rate Limiting**: Implement rate limiting on WebSocket messages
4. **Message Validation**: Validate all incoming messages
5. **Connection Limits**: Set maximum concurrent connections per tenant

## Performance Optimization

1. **Connection Pooling**: Reuse WebSocket connections
2. **Message Batching**: Batch multiple updates when possible
3. **Heartbeat Management**: Optimize heartbeat intervals
4. **Memory Management**: Clean up old messages and events
5. **Network Efficiency**: Compress messages when possible

## Monitoring and Debugging

### Debug Mode
Enable debug mode to see detailed WebSocket logs:
```env
NUXT_PUBLIC_WEBSOCKET_DEBUG=true
```

### Connection Monitoring
Monitor WebSocket connection status:
```typescript
const webSocketStore = useWebSocketStore()
console.log('Connection State:', webSocketStore.connectionStatus)
console.log('Is Connected:', webSocketStore.isWebSocketConnected)
console.log('Last Error:', webSocketStore.lastError)
```

### Message Monitoring
Log all WebSocket messages:
```typescript
const webSocketService = useWebSocketService()
webSocketService.subscribe(WebSocketMessageType.SYSTEM_HEARTBEAT, (message) => {
  console.log('WebSocket Message:', message)
})
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check WebSocket URL and port
   - Verify backend WebSocket configuration
   - Check authentication token validity

2. **Messages Not Received**
   - Verify event subscriptions
   - Check message filtering
   - Confirm tenant ID matching

3. **Reconnection Issues**
   - Check reconnection settings
   - Verify network connectivity
   - Monitor connection state

### Debug Steps

1. Enable debug mode
2. Check browser console for errors
3. Verify WebSocket handshake in Network tab
4. Test backend WebSocket endpoint directly
5. Check authentication token validity

## Future Enhancements

1. **Message Persistence**: Store messages for offline handling
2. **Advanced Filtering**: More sophisticated message filtering
3. **Performance Metrics**: WebSocket performance monitoring
4. **Clustering Support**: Multi-instance WebSocket handling
5. **Mobile Optimization**: Mobile-specific WebSocket handling

## Contributing

When contributing to WebSocket functionality:

1. Follow existing type definitions
2. Add comprehensive error handling
3. Include proper cleanup in components
4. Test connection scenarios thoroughly
5. Document new message types and handlers

For questions or issues, refer to the main project documentation or create an issue in the project repository. 