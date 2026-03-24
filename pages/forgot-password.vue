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
          <p class="text-xl font-semibold">Forgot password</p>
          <p class="text-sm text-muted-foreground">
            Enter your email address and we will send you a reset link.
          </p>
        </div>

        <div
          v-if="isSubmitted"
          class="grid gap-4 rounded-xl border border-[#ead8e6] bg-white p-6 shadow-sm"
        >
          <p class="text-sm text-slate-700">
            If an account exists for <span class="font-medium">{{ submittedEmail }}</span>,
            a password reset link has been sent.
          </p>
          <p class="text-sm text-muted-foreground">
            Open the email on the same device and follow the link to set a new password.
          </p>
          <div class="flex gap-3">
            <Button as-child class="flex-1" style="background-color:#a03b93">
              <NuxtLink to="/auth/login">Back to login</NuxtLink>
            </Button>
            <Button variant="outline" class="flex-1" @click="isSubmitted = false">
              Send again
            </Button>
          </div>
        </div>

        <form v-else @submit="requestReset" class="grid gap-4">
          <Alert v-if="requestError" variant="destructive">
            <AlertDescription>{{ requestError }}</AlertDescription>
          </Alert>

          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              :class="{ 'border-red-500': emailError }"
              required
            />
            <span class="text-red-500 text-sm">{{ emailError }}</span>
          </div>

          <Button type="submit" class="w-full" :disabled="isSubmitting" style="background-color:#a03b93">
            {{ isSubmitting ? 'Sending...' : 'Send reset link' }}
          </Button>
        </form>

        <div class="text-center text-sm">
          Remembered your password?
          <NuxtLink to="/auth/login" class="underline">
            Login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
