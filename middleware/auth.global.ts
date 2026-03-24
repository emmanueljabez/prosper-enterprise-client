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
})