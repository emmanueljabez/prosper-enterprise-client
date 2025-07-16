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

  const queryParams = to.query
  const authParams = ['token', 'username', 'tenantId', 'userId']
  let hasAuthParams = false

  // Check if any auth parameters exist in the query
  authParams.forEach(param => {
    if (queryParams[param]) {
      // Map 'token' to 'accessToken' for localStorage consistency
      const storageKey = param === 'token' ? 'accessToken' : param
      hasAuthParams = true

      localStorage.setItem(param, queryParams[param])
    }
  })



  // For protected routes (/app/)
  if (to.path.startsWith('/app/') || hasAuthParams) {
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
   /* try {
      if ( !authStore.loggedInUser) {
        console.log("looking good ... ")
        authStore.loggedInUser = {
          emailAddress: authParams["username"],
          password: null,
          firstName: null,
          lastName: null,
          companyName: null,
          phoneNumber: null,
          noOfEmployees: null
        }
      }
    } catch (error) {
      console.log(error)
      // Don't redirect - we already confirmed authentication
    }*/
  }
})