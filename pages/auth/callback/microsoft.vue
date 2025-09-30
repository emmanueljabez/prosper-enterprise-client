<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from '#app'
import { useAuthStore } from '@/store/modules/auth'
import { useToast } from '@/components/ui/toast'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { toast } = useToast()

onMounted(async () => {
  try {
    const code = route.query.code as string
    const state = route.query.state as string
    const error = route.query.error as string
    const errorDescription = route.query.error_description as string

    if (error) {
      throw new Error(`Authentication failed: ${error} - ${errorDescription || ''}`)
    }

    if (!code) {
      throw new Error('No authorization code received')
    }

    // Exchange code for tokens and login
    await authStore.ssoLogin({
      provider: 'microsoft',
      code,
      state
    })

    if (authStore.loggedInUser) {
      toast({
        title: 'Success',
        description: 'Successfully logged in with Microsoft!',
        variant: 'success',
      })
      
      // Redirect to dashboard
      router.push('/app/dashboard/inventory')
    } else {
      throw new Error('Authentication failed')
    }
  } catch (error: any) {
    console.error('Microsoft OAuth callback error:', error)
    
    toast({
      title: 'Authentication Failed',
      description: error.message || 'Failed to authenticate with Microsoft',
      variant: 'destructive',
    })
    
    // Redirect back to login with error
    router.push('/auth/login?error=sso_failed')
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p class="text-muted-foreground">Completing Microsoft authentication...</p>
    </div>
  </div>
</template> 