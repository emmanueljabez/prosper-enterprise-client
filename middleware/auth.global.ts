import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyOnboardingStore } from '@/store/modules/company-onboarding'
import { AuthChecker } from '@/utils/authChecker'
import { RoleManager } from '@/utils/roleManager'

const PUBLIC_PATH_PREFIX = '/auth/'
const PUBLIC_PAYMENT_PREFIX = '/payment/'
const PUBLIC_APP_PATH_PREFIXES = ['/app/sessions/review/', '/app/sessions/proposals/', '/app/employee/cohorts/join']
const PUBLIC_PATHS = new Set(['/', '/landing', '/pricing', '/forgot-password', '/reset-password'])

console.log('Auth global middleware loaded')

const isMissingOnboardingEndpoint = (error: unknown) => {
  const maybeError = error as { response?: { status?: number }, status?: number, statusCode?: number }
  return maybeError.response?.status === 404 || maybeError.status === 404 || maybeError.statusCode === 404
}

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip public routes (including OAuth callbacks)
  if (
    to.path.startsWith(PUBLIC_PATH_PREFIX)
    || to.path.startsWith(PUBLIC_PAYMENT_PREFIX)
    || PUBLIC_APP_PATH_PREFIXES.some(prefix => to.path.startsWith(prefix))
    || PUBLIC_PATHS.has(to.path)
  ) {
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
        try {
          await onboardingStore.loadOnboardingStatus(companyId)
        } catch (onboardingError) {
          if (!isMissingOnboardingEndpoint(onboardingError)) {
            throw onboardingError
          }
          console.warn('Company onboarding status endpoint returned 404; continuing without onboarding redirect.')
          return
        }

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
