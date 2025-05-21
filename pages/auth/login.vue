<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter } from '#app'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import { useToast } from '@/components/ui/toast'

const authStore = useAuthStore()
const router = useRouter()
const rememberMe = ref(false)
const { toast } = useToast()

const { handleSubmit, isSubmitting } = useForm()

const emailSchema = yup.string().email('Invalid email').required('Email field is required')
const passwordSchema = yup.string().required('Password field is required')

const { value: email, errorMessage: emailError } = useField<string>('email', emailSchema)
const { value: password, errorMessage: passwordError } = useField<string>('password', passwordSchema)

const login = handleSubmit(async (values) => {
  try {
    const result = await authStore.login({ username: values.email, password: values.password }) as any
    if (authStore.loggedInUser) {
      const message = result.message || 'Login successful!'
      toast({
        title: 'Success',
        description: message,
        variant: 'success',
      })
      // toast.success(result.message || 'Login successful!')
      router.push('/app/dashboard/inventory')
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
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    }
  }
})
</script>

<template>
  <div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
    <div class="hidden h-screen bg-muted lg:flex lg:items-center lg:justify-center">
      <img src="/images/pcash_logo.png" alt="Image" width="320" height="320"
        class="object-cover dark:brightness-[0.2] dark:grayscale">
    </div>
    <div class="flex items-center justify-center py-12">
      <div class="mx-auto grid w-[350px] gap-8">
        <div class="grid gap-2">
          <p class="text-xl font-semibold">
            Enter your email & password to login to your account
          </p>

        </div>
        <form @submit="login" class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" v-model="email"
              :class="{ 'border-red-500': emailError }" required />
            <span class="text-red-500">{{ emailError }}</span>
          </div>
          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input id="password" type="password" v-model="password" :class="{ 'border-red-500': passwordError }"
              required />
            <span class="text-red-500">{{ passwordError }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Checkbox id="remember" v-model="rememberMe" />
              <Label for="remember" class="text-sm">Remember me</Label>
            </div>
            <a href="/forgot-password" class="text-sm underline">
              Forgot your password?
            </a>
          </div>
          <Button type="submit" class="w-full" :disabled="isSubmitting" style="background-color: #1b1b41">
            Login
          </Button>
        </form>
        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <a href="/auth/register" class="underline">
            Sign up
          </a>
        </div>
      </div>
    </div>

  </div>
</template>