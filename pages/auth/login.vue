<script setup lang="ts">
import { useAuthStore } from '@/store/modules/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from '#app'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import { useToast } from '@/components/ui/toast'
import { useCompanyOnboardingStore } from '@/store/modules/company-onboarding'
import { useCompanySignupStore } from '@/store/modules/company-signup'
import PublicSiteHeader from '@/components/landing/PublicSiteHeader.vue'

const authStore = useAuthStore()
const companyOnboardingStore = useCompanyOnboardingStore()
const companySignupStore = useCompanySignupStore()
const router = useRouter()
const { toast } = useToast()

const { handleSubmit, isSubmitting } = useForm()

const emailSchema = yup.string().email('Invalid email').required('Email field is required')
const passwordSchema = yup.string().required('Password field is required')

const { value: email, errorMessage: emailError } = useField<string>('email', emailSchema)
const { value: password, errorMessage: passwordError } = useField<string>('password', passwordSchema)

const login = handleSubmit(async (values) => {
  try {
    const result = await authStore.login({ email: values.email, password: values.password }) as any
    if (authStore.loggedInUser) {
      const message = result.message || 'Login successful!'
      let role = result.profile.role
      toast({
        title: 'Success',
        description: message,
        variant: 'success',
      })
      if(role === "mentee") {
        router.push('/app/dashboard')
      } else if (['company', 'company_admin', 'corporate_admin'].includes(String(role || '').toLowerCase())) {
        const companyId = authStore.loggedInUser?.companyId || result.profile?.company?.id || result.profile?.companyId || result.company?.companyId
        if (companyId) {
          await companyOnboardingStore.loadOnboardingStatus(companyId)
          if (companyOnboardingStore.requiresOnboarding) {
            router.push('/app/admin/onboarding')
            return
          }
        }
        companySignupStore.clearPurchaseState()
        router.push('/app/admin')
      }
    }
  } catch (error: any) {
    console.error(error)
    if (error.statusCode === 400) {
      // toast.warning(error.message || 'Validation error')
      const errorMessage = error.data?.message || 'Validation error'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } else if (error.statusCode >= 500) {
      toast({
        title: 'Error',
        description: 'Server error. Please try again later.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }
})

const loginWithGoogle = async () => {
  try {
    await authStore.initiateGoogleAuth()
  } catch (error: any) {
    console.error('Google SSO error:', error)
    toast({
      title: 'Error',
      description: error.message || 'Google authentication failed',
      variant: 'destructive',
    })
  }
}

const loginWithMicrosoft = async () => {
  try {
    await authStore.initiateMicrosoftAuth()
  } catch (error: any) {
    console.error('Microsoft SSO error:', error)
    toast({
      title: 'Error',
      description: error.message || 'Microsoft authentication failed',
      variant: 'destructive',
    })
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden" style="font-family: 'Montserrat', 'Inter', ui-sans-serif, system-ui, sans-serif;">
    <img
      src="/img_2.jpg"
      alt="ProsperMentor background"
      class="absolute inset-0 h-full w-full object-cover"
    >
    <div class="absolute inset-0 bg-[#0f3f35]/60" />

    <PublicSiteHeader />

    <main class="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8 sm:px-6">
      <section class="w-full max-w-[460px] rounded-[28px] border border-white/30 bg-white/95 p-4 shadow-2xl sm:p-5">
        <div class="space-y-2">
          <h1 class="text-[24px] font-semibold leading-tight text-[#1f2937]">
            Ready to accelerate your
            <span class="text-[#027F63]">Growth</span>
          </h1>
          <p class="text-[13px] leading-relaxed text-[#4b5563]">
            Get access to our expert community of mentors in leadership development, personal branding, and global growth.
          </p>
        </div>

        <div class="mt-4 grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            @click="loginWithGoogle"
            :disabled="isSubmitting"
            class="h-10 justify-center rounded-full border-[#d1d5db] px-2 text-[11px] text-[#4b5563] hover:bg-[#f9fafb]"
          >
            <svg class="mr-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.6 0 6.8 1.2 9.4 3.6l7-7C36.3 2.4 30.6 0 24 0 14.7 0 6.7 5.3 2.7 13.1l8.1 6.3C12.6 13.3 17.9 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.1 24.5c0-1.7-.2-3.3-.5-4.9H24v9.2h12.4c-.5 2.9-2.2 5.4-4.7 7.1l7.5 5.8c4.4-4.1 6.9-10.1 6.9-17.2z" />
              <path fill="#FBBC05" d="M10.8 28.6c-.6-1.7-1-3.5-1-5.4s.4-3.7 1-5.4l-8.1-6.3C1 15 0 19.1 0 23.2s1 8.2 2.7 11.7l8.1-6.3z" />
              <path fill="#34A853" d="M24 48c6.6 0 12.3-2.2 16.4-6l-7.5-5.8c-2.1 1.4-4.8 2.3-8.9 2.3-6.1 0-11.4-3.8-13.2-9.1l-8.1 6.3C6.7 42.7 14.7 48 24 48z" />
            </svg>
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            @click="loginWithMicrosoft"
            :disabled="isSubmitting"
            class="h-10 justify-center rounded-full border-[#d1d5db] px-2 text-[11px] text-[#4b5563] hover:bg-[#f9fafb]"
          >
            <svg class="mr-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Continue with Microsoft
          </Button>
        </div>

        <div class="my-4 h-px bg-[#e5e7eb]" />

        <form @submit="login" class="space-y-2.5">
          <div class="grid gap-2">
            <Label for="email" class="text-xs font-medium text-[#6b7280]">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              required
              :class="[
                'h-11 rounded-[14px] border-[#d1d5db] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9ca3af]',
                emailError ? 'border-red-500 focus-visible:ring-red-200' : 'focus-visible:ring-[#027F63]/25'
              ]"
            />
            <span v-if="emailError" class="text-xs text-red-500">{{ emailError }}</span>
          </div>
          <div class="grid gap-2">
            <Label for="password" class="text-xs font-medium text-[#6b7280]">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              required
              :class="[
                'h-11 rounded-[14px] border-[#d1d5db] bg-white px-3 text-sm text-[#111827]',
                passwordError ? 'border-red-500 focus-visible:ring-red-200' : 'focus-visible:ring-[#027F63]/25'
              ]"
            />
            <span v-if="passwordError" class="text-xs text-red-500">{{ passwordError }}</span>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-2.5">
            <Button
              type="submit"
              :disabled="isSubmitting"
              class="h-10 min-w-[145px] rounded-full bg-[#027F63] px-6 text-sm font-medium text-white hover:bg-[#046f58]"
            >
              Continue
            </Button>
            <p class="text-xs text-[#6b7280]">
              Don't have an account?
              <NuxtLink to="/auth/signup" class="font-medium text-[#027F63] hover:underline">
                Register
              </NuxtLink>
            </p>
          </div>
          <NuxtLink to="/forgot-password" class="inline-flex text-xs text-[#6b7280] transition hover:text-[#027F63] hover:underline">
            Forgot Password
          </NuxtLink>
        </form>
      </section>
    </main>
  </div>
</template>
