<script setup lang="ts">
import { ref, computed } from 'vue'
import {DUMMY_TOKENS, DUMMY_USER_DATA, useAuthStore} from '@/store/modules/auth'
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
  <div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
    <div class="hidden h-screen bg-muted lg:flex lg:items-center lg:justify-center">
      <img src="/images/prosper_mentor_logo.png" alt="Image" width="150" height="150"
        class="object-cover dark:brightness-[0.2] dark:grayscale">
    </div>
    <div class="flex items-center justify-center py-12">
      <div class="mx-auto grid w-[350px] gap-8">
        <div class="grid gap-2">
          <p class="text-xl font-semibold">
            Login
          </p>

        </div>
        <form @submit="login" class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email"  v-model="email"
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
            <NuxtLink to="/forgot-password" class="text-sm underline">
              Forgot your password?
            </NuxtLink>
          </div>
          <Button type="submit" class="w-full" :disabled="isSubmitting" style="background-color:#a03b93">
            Login
          </Button>
        </form>
        
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            @click="loginWithGoogle"
            :disabled="isSubmitting"
            class="w-full"
          >
            <svg class="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h240z"></path>
            </svg>
            Google
          </Button>
          <Button 
            variant="outline" 
            @click="loginWithMicrosoft"
            :disabled="isSubmitting"
            class="w-full"
          >
            <svg class="mr-2 h-4 w-4" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z"/>
              <path fill="#81bc06" d="M12 1h10v10H12z"/>
              <path fill="#05a6f0" d="M1 12h10v10H1z"/>
              <path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
            Microsoft
          </Button>
        </div>
        
        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <a href="#" class="underline">
            Sign up
          </a>
        </div>
      </div>
    </div>

  </div>
</template>
