import { useAuthStore } from '@/store/modules/auth'
import { AuthChecker } from '@/utils/authChecker'
import { navigateTo } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  // This plugin only handles cross-tab sync
  window.addEventListener('storage', (event) => {
    if (event.key === 'token') {
      try {
        const authStore = useAuthStore()
        
        if (event.newValue) {
          // Token added in another tab
          const { isAuthenticated, user } = AuthChecker.validateAuth()
          if (isAuthenticated && user) {
            authStore.loggedInUser = user
          }
        } else {
          // Token removed in another tab
          authStore.loggedInUser = null
          
          // Redirect if on protected page
          const route = useRoute()
          if (route.path.startsWith('/app/')) {
            navigateTo('/auth/login')
          }
        }
      } catch (error) {
        // console.error('Storage event error:', error)
      }
    }
  })
})