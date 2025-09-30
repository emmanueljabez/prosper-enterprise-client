import { useAuthStore } from '@/store/modules/auth'
import { AuthChecker } from '@/utils/authChecker'
import { navigateTo } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (process.client) {
    // Import TestAuth utility for development
    import('@/utils/testAuth').then(({ TestAuth }) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 TestAuth utility loaded for development')
        console.log('Available commands:')
        console.log('- TestAuth.loginAsEmployee()')
        console.log('- TestAuth.loginAsMentor()') 
        console.log('- TestAuth.loginAsAdmin()')
        console.log('- TestAuth.clearAuth()')
        console.log('- TestAuth.checkStatus()')
      }
    })
  }
  // This plugin only handles cross-tab sync
  window.addEventListener('storage', (event) => {
    if (event.key === 'token') {
      try {
        const authStore = useAuthStore()
        
        if (event.newValue) {
          // Token added in another tab
          const { isAuthenticated } = AuthChecker.validateAuth()
          if (isAuthenticated) {
            // Don't set loggedInUser directly since we only have JWT subject, not full user object
            // The auth store will handle proper user loading when needed
            console.log('Token synced from another tab')
          }
        } else {
          // Token removed in another tab
          authStore.loggedInUser = null
          
          // Redirect if on protected page - with safety check
          try {
            const route = useRoute()
            if (route && route.path && route.path.startsWith('/app/')) {
              navigateTo('/auth/login')
            }
          } catch (routeError) {
            // Router not available during initialization, fallback to window location
            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/app/')) {
              window.location.href = '/auth/login'
            }
          }
        }
      } catch (error) {
        // console.error('Storage event error:', error)
      }
    }
  })
})