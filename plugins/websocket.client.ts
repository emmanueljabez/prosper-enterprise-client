import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { watch, onUnmounted } from 'vue'
import { useWebSocketStore } from '~/store/modules/websocket'
import { useAuthStore } from '~/store/modules/auth'
import type { WebSocketConfig } from '~/types/websocket'

export default defineNuxtPlugin(async () => {
  // Only run on client side
  if (process.server) return

  const webSocketStore = useWebSocketStore()
  const authStore = useAuthStore()
  
  // WebSocket configuration
  const getWebSocketConfig = (): WebSocketConfig => {
    const config = useRuntimeConfig()
    const isSecure = window.location.protocol === 'https:'
    const wsProtocol = isSecure ? 'wss:' : 'ws:'
    const host = window.location.hostname
    const port = window.location.port || (isSecure ? '443' : '80')
    
    // Determine WebSocket URL based on environment
    let wsUrl: string
    if (config.public.nodeEnv === 'development') {
      wsUrl = `${wsProtocol}//${host}:8090/ws`
    } else {
      wsUrl = `${wsProtocol}//${host}:${port}/ws`
    }
    
    return {
      url: wsUrl,
      protocols: ['restaurant-pos-protocol'],
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      enableHeartbeat: true,
      enableAutoReconnect: true,
      debugMode: config.public.nodeEnv === 'development'
    }
  }
  
  // Initialize WebSocket connection when user is authenticated
  const initializeWebSocket = async () => {
    try {
      // Check if user is authenticated
      const isAuthenticated = authStore.initializeFromStorage()
      
      if (isAuthenticated) {
        const config = getWebSocketConfig()
        console.log('Initializing WebSocket connection:', config.url)
        
        await webSocketStore.connectWebSocket(config)
        console.log('WebSocket connection established')
      } else {
        console.log('User not authenticated, skipping WebSocket initialization')
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }
  
  // Listen for authentication changes
  const handleAuthChange = async (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      // User logged in, establish WebSocket connection
      await initializeWebSocket()
    } else {
      // User logged out, disconnect WebSocket
      webSocketStore.disconnectWebSocket()
    }
  }
  
  // Watch for authentication state changes
  watch(
    () => authStore.loggedInUser,
    (newUser, oldUser) => {
      if (newUser && !oldUser) {
        // User just logged in
        handleAuthChange(true)
      } else if (!newUser && oldUser) {
        // User just logged out
        handleAuthChange(false)
      }
    },
    { immediate: true }
  )
  
  // Handle page visibility changes for connection management
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Page is hidden, we might want to reduce connection activity
      console.log('Page hidden, WebSocket connection will continue')
    } else {
      // Page is visible, ensure connection is active
      if (authStore.loggedInUser && !webSocketStore.isWebSocketConnected) {
        console.log('Page visible, reconnecting WebSocket')
        initializeWebSocket()
      }
    }
  }
  
  // Listen for visibility changes
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }
  
  // Handle connection errors
  const handleConnectionError = (error: Error) => {
    console.error('WebSocket connection error:', error)
    // You might want to show a user notification here
  }
  
  // Handle successful reconnection
  const handleReconnection = () => {
    console.log('WebSocket reconnected successfully')
    // You might want to show a user notification here
  }
  
  // Initial connection attempt
  await initializeWebSocket()
  
  // Cleanup on app unmount
  onUnmounted(() => {
    webSocketStore.disconnectWebSocket()
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  })
  
  return {
    provide: {
      websocket: {
        connect: initializeWebSocket,
        disconnect: () => webSocketStore.disconnectWebSocket(),
        isConnected: () => webSocketStore.isWebSocketConnected,
        getConnectionState: () => webSocketStore.connectionStatus
      }
    }
  }
}) 