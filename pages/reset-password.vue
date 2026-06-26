<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import { useAuthStore } from '@/store/modules/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { ValidationMessages, ValidationPatterns } from '@/utils/validation'
import PublicSiteHeader from '@/components/landing/PublicSiteHeader.vue'

definePageMeta({
  title: 'Reset Password',
  description: 'Set a new password for your account',
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { toast } = useToast()

const resetToken = ref('')
const resetError = ref<string | null>(null)
const resetSuccess = ref(false)

const { handleSubmit, isSubmitting } = useForm()

const passwordSchema = yup.string()
  .required('Password field is required')
  .min(8, ValidationMessages.minLength(8))
  .matches(ValidationPatterns.password, ValidationMessages.password)

const confirmPasswordSchema = yup.string()
  .required('Confirm password field is required')
  .oneOf([yup.ref('password')], "Passwords don't match")

const { value: password, errorMessage: passwordError } = useField<string>('password', passwordSchema)
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField<string>('confirmPassword', confirmPasswordSchema)

const canReset = computed(() => !!resetToken.value && !resetSuccess.value && !resetError.value)

const parseResetLink = () => {
  if (typeof window === 'undefined') {
    return
  }

  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  const hashParams = new URLSearchParams(hash)

  const routeToken = typeof route.query.token === 'string' ? route.query.token : ''
  const routeErrorDescription = typeof route.query.error_description === 'string' ? route.query.error_description : ''

  resetToken.value = routeToken || hashParams.get('token') || ''

  const errorDescription = hashParams.get('error_description') || routeErrorDescription

  if (errorDescription) {
    resetError.value = decodeURIComponent(errorDescription)
  } else if (!resetToken.value) {
    resetError.value = 'Reset link is invalid or has expired.'
  } else {
    resetError.value = null
  }

  const cleanUrl = new URL(window.location.href)
  ;[
    'token',
    'access_token',
    'refresh_token',
    'type',
    'expires_in',
    'expires_at',
    'token_type',
    'error',
    'error_code',
    'error_description',
    'token_hash',
  ].forEach(param => cleanUrl.searchParams.delete(param))

  window.history.replaceState({}, document.title, cleanUrl.pathname + cleanUrl.search || '/reset-password')
}

const submitReset = handleSubmit(async (values) => {
  if (!resetToken.value) {
    resetError.value = 'Reset link is invalid or has expired.'
    return
  }

  try {
    await authStore.resetPasswordWithToken(resetToken.value, values.password)
    resetSuccess.value = true
    resetError.value = null
    resetToken.value = ''

    toast({
      title: 'Password updated',
      description: 'Your password has been reset successfully. You can now log in.',
      variant: 'success',
    })
  } catch (error: any) {
    resetError.value = error.message || 'Failed to reset password'
    toast({
      title: 'Error',
      description: resetError.value,
      variant: 'destructive',
    })
  }
})

const goToLogin = async () => {
  await router.push('/auth/login')
}

onMounted(() => {
  parseResetLink()
})
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
            Change your
            <span class="text-[#027F63]">Password</span>
          </h1>
          <p class="text-[13px] leading-relaxed text-[#4b5563]">
            Set a new password for your Prosper Mentor account.
          </p>
        </div>

        <div
          v-if="resetSuccess"
          class="mt-4 grid gap-4 rounded-[18px] border border-[#d1e7df] bg-white p-5 shadow-sm"
        >
          <p class="text-sm leading-relaxed text-[#1f2937]">
            Your password has been updated successfully.
          </p>
          <Button
            class="h-10 w-full rounded-full bg-[#027F63] text-sm font-medium text-white hover:bg-[#046f58]"
            @click="goToLogin"
          >
            Go to login
          </Button>
        </div>

        <div
          v-else-if="resetError"
          class="mt-4 grid gap-4 rounded-[18px] border border-red-200 bg-red-50 p-5"
        >
          <p class="text-sm leading-relaxed text-red-700">{{ resetError }}</p>
          <div class="grid gap-3 sm:grid-cols-2">
            <Button as-child class="h-10 rounded-full bg-[#027F63] text-sm font-medium text-white hover:bg-[#046f58]">
              <NuxtLink to="/forgot-password">Request another link</NuxtLink>
            </Button>
            <Button
              as-child
              variant="outline"
              class="h-10 rounded-full border-[#d1d5db] text-sm text-[#4b5563] hover:bg-[#f9fafb]"
            >
              <NuxtLink to="/auth/login">Back to login</NuxtLink>
            </Button>
          </div>
        </div>

        <form v-else @submit="submitReset" class="mt-4 space-y-2.5">
          <div class="grid gap-2">
            <Label for="password" class="text-xs font-medium text-[#6b7280]">New password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              :class="[
                'h-11 rounded-[14px] border-[#d1d5db] bg-white px-3 text-sm text-[#111827]',
                passwordError ? 'border-red-500 focus-visible:ring-red-200' : 'focus-visible:ring-[#027F63]/25'
              ]"
              required
            />
            <span v-if="passwordError" class="text-xs text-red-500">{{ passwordError }}</span>
          </div>

          <div class="grid gap-2">
            <Label for="confirm-password" class="text-xs font-medium text-[#6b7280]">Confirm password</Label>
            <Input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              :class="[
                'h-11 rounded-[14px] border-[#d1d5db] bg-white px-3 text-sm text-[#111827]',
                confirmPasswordError ? 'border-red-500 focus-visible:ring-red-200' : 'focus-visible:ring-[#027F63]/25'
              ]"
              required
            />
            <span v-if="confirmPasswordError" class="text-xs text-red-500">{{ confirmPasswordError }}</span>
          </div>

          <Button
            type="submit"
            class="h-10 w-full rounded-full bg-[#027F63] text-sm font-medium text-white hover:bg-[#046f58]"
            :disabled="isSubmitting || !canReset"
          >
            {{ isSubmitting ? 'Updating password...' : 'Reset password' }}
          </Button>
        </form>

        <div class="mt-4 text-center text-xs text-[#6b7280]">
          <NuxtLink to="/auth/login" class="font-medium text-[#027F63] hover:underline">
            Back to login
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>
