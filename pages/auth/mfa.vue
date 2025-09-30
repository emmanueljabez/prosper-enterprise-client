<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from '#app'
import { useAuthStore } from '@/store/modules/auth'
import MFAVerification from '@/components/ui/auth/MFAVerification.vue'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Handle successful MFA verification
const handleMFAVerified = async (token: string) => {
  try {
    // Store the new token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }

    // Reinitialize auth store with new token
    await authStore.initializeFromStorage()

    // Redirect to intended destination or dashboard
    const redirect = route.query.redirect as string
    if (redirect && redirect.startsWith('/app')) {
      router.push(redirect)
    } else if (authStore.loggedInUser) {
      // Redirect based on user role
      if (authStore.loggedInUser.roles.some(role => role.name === 'corporate_admin')) {
        router.push('/app/admin/dashboard')
      } else if (authStore.loggedInUser.roles.some(role => role.name === 'mentor')) {
        router.push('/app/mentees')
      } else {
        router.push('/app/dashboard')
      }
    } else {
      router.push('/app/dashboard')
    }
  } catch (error) {
    console.error('Error handling MFA verification:', error)
    router.push('/auth/login?error=mfa_failed')
  }
}

// Handle MFA cancellation
const handleMFACancelled = () => {
  // Clear any stored tokens and redirect to login
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    localStorage.removeItem('provider')
  }
  
  authStore.setLogout()
  router.push('/auth/login')
}

// Check if MFA is required and user has a valid MFA token
onMounted(() => {
  if (!authStore.mfaRequired || !authStore.mfaToken) {
    // No MFA required or no MFA token, redirect to login
    router.push('/auth/login')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="w-full max-w-md px-4">
      <MFAVerification
        v-if="authStore.mfaToken"
        :mfa-token="authStore.mfaToken"
        :user-email="authStore.loggedInUser?.email"
        @verified="handleMFAVerified"
        @cancelled="handleMFACancelled"
      />
    </div>
  </div>
</template> 