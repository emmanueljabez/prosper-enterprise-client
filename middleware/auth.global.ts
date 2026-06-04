import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyOnboardingStore } from '@/store/modules/company-onboarding'
import { AuthChecker } from '@/utils/authChecker'
import { RoleManager } from '@/utils/roleManager'

const PUBLIC_PATH_PREFIX = '/auth/'
const PUBLIC_PAYMENT_PREFIX = '/payment/'
const PUBLIC_PATHS = new Set(['/', '/landing', '/pricing'])

console.log('Auth global middleware loaded')

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip public routes (including OAuth callbacks)
  if (to.path.startsWith(PUBLIC_PATH_PREFIX) || to.path.startsWith(PUBLIC_PAYMENT_PREFIX) || PUBLIC_PATHS.has(to.path)) {
    return
  }

  const authStore = useAuthStore()
  const authState = AuthChecker.validateAuth()

  if (!authState.isAuthenticated) {
    return navigateTo('/auth/login')
  }

  if (!authStore.loggedInUser) {
    authStore.initializeFromStorage()
  }

  if (to.path.startsWith('/app/admin')) {
    const onboardingStore = useCompanyOnboardingStore()
    const companyId = authStore.loggedInUser?.companyId || ''
    const isCompanyAdmin = RoleManager.isCorporateAdmin(authStore.loggedInUser)

    if (isCompanyAdmin && companyId) {
      if (to.path !== '/app/admin/onboarding') {
        await onboardingStore.loadOnboardingStatus(companyId)
        if (onboardingStore.requiresOnboarding) {
          return navigateTo('/app/admin/onboarding')
        }
      }

      if (to.path === '/app/admin/onboarding') {
        return
      }
    }
  }
})
