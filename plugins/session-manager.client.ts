import { SessionManager } from '@/utils/sessionManager'
import { useAuthStore } from '@/store/modules/auth'

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (process.server) return

  // Session manager disabled - no expiration checking
  console.log('Session manager disabled - sessions will not expire')
  
  // Initialize session manager when plugin loads
  let sessionManager: SessionManager | null = null

  // Configuration based on environment
  const sessionSettings = {
    maxInactivityTime: 30 * 60 * 1000, // 30 minutes
    warningTime: 5 * 60 * 1000, // 5 minutes warning
    tokenRefreshInterval: 15 * 60 * 1000, // 15 minutes
    maxSessionDuration: 8 * 60 * 60 * 1000, // 8 hours
    trackMouseMovement: true,
    trackKeyboardActivity: true,
    trackPageVisibility: true,
    enableCrossTabSync: true,
    enableSingleSignOn: true
  }

  // Initialize session manager when user is authenticated - DISABLED
  const initializeSession = () => {
    // Session management disabled
    // if (!sessionManager) {
    //   sessionManager = SessionManager.getInstance(sessionSettings)
    //   sessionManager.restoreSession()
    //   console.log('Session manager initialized')
    // }
  }

  // Cleanup session manager - DISABLED
  const cleanupSession = () => {
    // Session management disabled
    // if (sessionManager) {
    //   sessionManager.cleanup()
    //   sessionManager = null
    //   console.log('Session manager cleaned up')
    // }
  }

  // Watch for authentication state changes
  const authStore = useAuthStore()
  
  // Initialize session management if user is already logged in - DISABLED
  // if (authStore.loggedInUser) {
  //   initializeSession()
  // }

  // Watch for login/logout events - DISABLED
  // watch(() => authStore.loggedInUser, (user) => {
  //   if (user) {
  //     initializeSession()
  //   } else {
  //     cleanupSession()
  //   }
  // })

  // Cleanup on page unload - DISABLED
  const cleanup = () => {
    // cleanupSession()
  }

  // Handle page unload/beforeunload events - DISABLED
  // if (typeof window !== 'undefined') {
  //   window.addEventListener('beforeunload', cleanup)
  //   window.addEventListener('unload', cleanup)
  // }

  // Provide session manager instance to the app
  return {
    provide: {
      sessionManager: () => sessionManager
    }
  }
}) 