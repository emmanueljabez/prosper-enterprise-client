<script setup lang="ts">
import { computed, ref } from 'vue'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import { useAuthStore } from '@/store/modules/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import PublicSiteHeader from '@/components/landing/PublicSiteHeader.vue'

definePageMeta({
  title: 'Forgot Password',
  description: 'Request a password reset link',
})

const authStore = useAuthStore()
const { toast } = useToast()
const isSubmitted = ref(false)
const submittedEmail = ref('')
const requestError = ref('')

const { handleSubmit, isSubmitting } = useForm()

const emailSchema = yup.string().email('Invalid email').required('Email field is required')
const { value: email, errorMessage: emailError } = useField<string>('email', emailSchema)

const resetRedirect = computed(() => {
  if (typeof window === 'undefined') {
    return undefined
  }

  return `${window.location.origin}/reset-password`
})

const requestReset = handleSubmit(async (values) => {
  requestError.value = ''

  try {
    await authStore.requestPasswordReset(values.email, resetRedirect.value)
    submittedEmail.value = values.email
    isSubmitted.value = true
    toast({
      title: 'Reset link sent',
      description: 'Check your email for the password reset instructions.',
      variant: 'success',
    })
  } catch (error: any) {
    requestError.value = error.message || 'Failed to send password reset email'
    toast({
      title: 'Error',
      description: requestError.value,
      variant: 'destructive',
    })
  }
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
            Reset your
            <span class="text-[#027F63]">Password</span>
          </h1>
          <p class="text-[13px] leading-relaxed text-[#4b5563]">
            Enter your email address and we will send you a secure link to set a new password.
          </p>
        </div>

        <div
          v-if="isSubmitted"
          class="mt-4 grid gap-4 rounded-[18px] border border-[#d1e7df] bg-white p-5 shadow-sm"
        >
          <p class="text-sm leading-relaxed text-[#1f2937]">
            If an account exists for <span class="font-medium">{{ submittedEmail }}</span>,
            a password reset link has been sent.
          </p>
          <p class="text-[13px] leading-relaxed text-[#6b7280]">
            Open the email on the same device and follow the link to set a new password.
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <Button as-child class="h-10 rounded-full bg-[#027F63] text-sm font-medium text-white hover:bg-[#046f58]">
              <NuxtLink to="/auth/login">Back to login</NuxtLink>
            </Button>
            <Button
              variant="outline"
              class="h-10 rounded-full border-[#d1d5db] text-sm text-[#4b5563] hover:bg-[#f9fafb]"
              @click="isSubmitted = false"
            >
              Send again
            </Button>
          </div>
        </div>

        <form v-else @submit="requestReset" class="mt-4 space-y-2.5">
          <Alert v-if="requestError" variant="destructive">
            <AlertDescription>{{ requestError }}</AlertDescription>
          </Alert>

          <div class="grid gap-2">
            <Label for="email" class="text-xs font-medium text-[#6b7280]">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              :class="[
                'h-11 rounded-[14px] border-[#d1d5db] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9ca3af]',
                emailError ? 'border-red-500 focus-visible:ring-red-200' : 'focus-visible:ring-[#027F63]/25'
              ]"
              required
            />
            <span v-if="emailError" class="text-xs text-red-500">{{ emailError }}</span>
          </div>

          <Button
            type="submit"
            class="h-10 w-full rounded-full bg-[#027F63] text-sm font-medium text-white hover:bg-[#046f58]"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Sending...' : 'Send reset link' }}
          </Button>
        </form>

        <div class="mt-4 text-center text-xs text-[#6b7280]">
          Remembered your password?
          <NuxtLink to="/auth/login" class="font-medium text-[#027F63] hover:underline">
            Login
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>
