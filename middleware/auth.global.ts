import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '@/store/modules/auth'
import { AuthChecker } from '@/utils/authChecker'
import { RoleManager } from '@/utils/roleManager'

const PUBLIC_PATH_PREFIX = '/auth/'

console.log('Auth global middleware loaded')

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip public routes (including OAuth callbacks)
  if (to.path.startsWith(PUBLIC_PATH_PREFIX)) {
    return
  }

  const queryParams = to.query
  const authParams = ['token', 'username', 'tenantId', 'userId', 'accessToken']
  let hasAuthParams = false

  // Check if any auth parameters exist in the query
  authParams.forEach(param => {
    if (queryParams[param]) {
      // Map 'token' to 'accessToken' for localStorage consistency
      const storageKey = param === 'token' ? 'accessToken' : param
      hasAuthParams = true

      localStorage.setItem(storageKey, queryParams[param] as string)
    }
  })

  console.log('Has auth params:', hasAuthParams)

  // For protected routes (/app/)
  if (to.path.startsWith('/app/') || hasAuthParams) {
    const authStore = useAuthStore()

    // Initialize the store from localStorage
    const isInitialized = await authStore.initializeFromStorage()
    console.log('Auth store initialized:', isInitialized)

    // If store initialization failed, use AuthChecker as fallback
    if (!isInitialized) {
      const { isAuthenticated } = AuthChecker.validateAuth()
      console.log('AuthChecker result:', isAuthenticated)
      
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login')
        return navigateTo('/auth/login')
      }
    }

    // Check if user is authenticated
    if (!authStore.loggedInUser) {
      console.log('No logged in user, redirecting to login')
      return navigateTo('/auth/login')
    }

    // Check for MFA requirement
    if (authStore.mfaRequired && !to.path.includes('/auth/mfa')) {
      console.log('MFA required, redirecting to MFA page')
      return navigateTo('/auth/mfa')
    }

    // Role-based route protection using RoleManager
    if (!RoleManager.canAccessRoute(authStore.loggedInUser, to.path)) {
      console.log('Access denied for route:', to.path)
      // Redirect based on user role
      if (RoleManager.isCorporateAdmin(authStore.loggedInUser)) {
        return navigateTo('/app/dashboard/corporate-admin')
      } else if (RoleManager.isMentor(authStore.loggedInUser)) {
        return navigateTo('/app/dashboard')
      } else {
        return navigateTo('/app/dashboard')
      }
    }

    console.log('Authentication successful for user:', authStore.loggedInUser.email)
  }
})