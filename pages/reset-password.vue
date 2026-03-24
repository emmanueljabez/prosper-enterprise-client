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

definePageMeta({
  title: 'Reset Password',
  description: 'Set a new password for your account',
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { toast } = useToast()

const accessToken = ref('')
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

const canReset = computed(() => !!accessToken.value && !resetSuccess.value && !resetError.value)

const parseRecoveryLink = () => {
  if (typeof window === 'undefined') {
    return
  }

  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  const hashParams = new URLSearchParams(hash)

  const routeAccessToken = typeof route.query.access_token === 'string' ? route.query.access_token : ''
  const routeType = typeof route.query.type === 'string' ? route.query.type : ''
  const routeErrorDescription = typeof route.query.error_description === 'string' ? route.query.error_description : ''

  accessToken.value = hashParams.get('access_token') || routeAccessToken || ''

  const recoveryType = hashParams.get('type') || routeType
  const errorDescription = hashParams.get('error_description') || routeErrorDescription

  if (errorDescription) {
    resetError.value = decodeURIComponent(errorDescription)
  } else if (!accessToken.value || (recoveryType && recoveryType !== 'recovery')) {
    resetError.value = 'Reset link is invalid or has expired.'
  } else {
    resetError.value = null
  }

  const cleanPath = window.location.pathname + window.location.search
    .replace(/([?&])(access_token|refresh_token|type|expires_in|expires_at|token_type|error|error_code|error_description|token_hash)=[^&]*/g, '')
    .replace(/[?&]$/, '')
  window.history.replaceState({}, document.title, cleanPath || '/reset-password')
}

const submitReset = handleSubmit(async (values) => {
  if (!accessToken.value) {
    resetError.value = 'Reset link is invalid or has expired.'
    return
  }

  try {
    await authStore.resetPasswordWithRecoveryToken(accessToken.value, values.password)
    resetSuccess.value = true
    resetError.value = null
    accessToken.value = ''

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
  parseRecoveryLink()
})
</script>

<template>
  <div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
    <div class="hidden h-screen bg-muted lg:flex lg:items-center lg:justify-center">
      <img
        src="/images/prosper_mentor_logo.png"
        alt="Prosper Mentor"
        width="150"
        height="150"
        class="object-cover dark:brightness-[0.2] dark:grayscale"
      >
    </div>

    <div class="flex items-center justify-center py-12">
      <div class="mx-auto grid w-[380px] gap-8">
        <div class="grid gap-2">
          <p class="text-xl font-semibold">Reset password</p>
          <p class="text-sm text-muted-foreground">
            Set a new password for your account.
          </p>
        </div>

        <div
          v-if="resetSuccess"
          class="grid gap-4 rounded-xl border border-[#ead8e6] bg-white p-6 shadow-sm"
        >
          <p class="text-sm text-slate-700">
            Your password has been updated successfully.
          </p>
          <Button class="w-full" style="background-color:#a03b93" @click="goToLogin">
            Go to login
          </Button>
        </div>

        <div
          v-else-if="resetError"
          class="grid gap-4 rounded-xl border border-red-200 bg-red-50 p-6"
        >
          <p class="text-sm text-red-700">{{ resetError }}</p>
          <div class="flex gap-3">
            <Button as-child class="flex-1" style="background-color:#a03b93">
              <NuxtLink to="/forgot-password">Request another link</NuxtLink>
            </Button>
            <Button as-child variant="outline" class="flex-1">
              <NuxtLink to="/auth/login">Back to login</NuxtLink>
            </Button>
          </div>
        </div>

        <form v-else @submit="submitReset" class="grid gap-4">
          <div class="grid gap-2">
            <Label for="password">New password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              :class="{ 'border-red-500': passwordError }"
              required
            />
            <span class="text-red-500 text-sm">{{ passwordError }}</span>
          </div>

          <div class="grid gap-2">
            <Label for="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              :class="{ 'border-red-500': confirmPasswordError }"
              required
            />
            <span class="text-red-500 text-sm">{{ confirmPasswordError }}</span>
          </div>

          <Button
            type="submit"
            class="w-full"
            :disabled="isSubmitting || !canReset"
            style="background-color:#a03b93"
          >
            {{ isSubmitting ? 'Updating password...' : 'Reset password' }}
          </Button>
        </form>

        <div class="text-center text-sm">
          <NuxtLink to="/auth/login" class="underline">
            Back to login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
