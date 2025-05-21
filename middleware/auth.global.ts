import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '@/store/modules/auth'
import { AuthChecker } from '@/utils/authChecker'

const PUBLIC_PATH_PREFIX = '/auth/'

console.log('Auth global middleware loaded')

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip public routes
  if (to.path.startsWith(PUBLIC_PATH_PREFIX)) {
    return
  }

  // For protected routes (/app/)
  if (to.path.startsWith('/app/')) {
    const authStore = useAuthStore()

    // Initialize the store from localStorage
    await authStore.initializeFromStorage()

    // Direct token validation - no store dependency
    const { isAuthenticated, user } = AuthChecker.validateAuth()

    if (!isAuthenticated) {
      return navigateTo('/auth/login')
    }

    // We're authenticated - now update the store
    // This won't block access, just keeps store in sync
    try {
      if (user && !authStore.loggedInUser) {
        authStore.loggedInUser = user
      }
    } catch (error) {
      // Don't redirect - we already confirmed authentication
    }
  }
})