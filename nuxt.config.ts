import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  // Development server configuration for better hot reload
  devServer: {
    port: 3000,
    host: 'localhost'
  },
  
  // Vite configuration for hot module replacement
  vite: {
    server: {
      hmr: {
        port: 24678,
        host: 'localhost'
      },
      watch: {
        usePolling: false,
        interval: 300
      }
    },
    optimizeDeps: {
      include: ['vue', 'vue-router']
    }
  },
  
  runtimeConfig: {
    public: {
      // mapboxToken: process.env.NUXT_PUBLIC_MAPBOX_TOKEN
      nodeEnv: process.env.NODE_ENV,
      googleMapsApiKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      // websocketUrl: process.env.NUXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8090/ws',
      // websocketProtocol: process.env.NUXT_PUBLIC_WEBSOCKET_PROTOCOL || 'restaurant-pos-protocol',
      // websocketReconnectInterval: process.env.NUXT_PUBLIC_WEBSOCKET_RECONNECT_INTERVAL || 3000,
      // websocketMaxReconnectAttempts: process.env.NUXT_PUBLIC_WEBSOCKET_MAX_RECONNECT_ATTEMPTS || 5,
      // websocketHeartbeatInterval: process.env.NUXT_PUBLIC_WEBSOCKET_HEARTBEAT_INTERVAL || 30000,
      // websocketDebugMode: process.env.NUXT_PUBLIC_WEBSOCKET_DEBUG || false,
    }
  },
  ssr: false,
  css: [
    '@/assets/css/global.css',
  ],
  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@vee-validate/nuxt',
    '@pinia/nuxt'
  ],
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
  plugins: [
    // '~/plugins/websocket.client.ts',
    // '~/plugins/pinia.ts',
    // '~/plugins/sidebar.ts'
  ],
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap'
        },
        { 
          rel: 'icon',
          type: 'image/x-icon',
          href: '/images/favicon-32x32.png'
        }
      ]
    }
  },
})