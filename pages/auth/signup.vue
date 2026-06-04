<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from '#app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AuthSplitShell from '@/components/auth/AuthSplitShell.vue'
import { useToast } from '@/components/ui/toast'
import { useCompanySignupStore } from '@/store/modules/company-signup'

definePageMeta({ auth: false })

const router = useRouter()
const companySignupStore = useCompanySignupStore()
const { toast } = useToast()

type SignupField = 'companyName' | 'name' | 'workEmail' | 'phoneNumber' | 'password'

const form = reactive({
  companyName: '',
  workEmail: '',
  phoneNumber: '',
  name: '',
  password: '',
})

const errors = reactive<Record<SignupField, string>>({
  companyName: '',
  name: '',
  workEmail: '',
  phoneNumber: '',
  password: '',
})

const isSubmitting = computed(() => companySignupStore.isLoading)

const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, ' ')

const splitName = () => {
  const nameParts = normalizeWhitespace(form.name).split(' ').filter(Boolean)
  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' '),
  }
}

const validateField = (field: SignupField) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phonePattern = /^\+?[0-9][0-9\s().-]{6,}$/

  if (field === 'companyName') {
    errors.companyName = normalizeWhitespace(form.companyName).length >= 2
      ? ''
      : 'Enter your company name.'
  }

  if (field === 'name') {
    const { firstName, lastName } = splitName()
    errors.name = firstName && lastName
      ? ''
      : 'Enter your first and last name.'
  }

  if (field === 'workEmail') {
    errors.workEmail = emailPattern.test(form.workEmail.trim())
      ? ''
      : 'Enter a valid work email address.'
  }

  if (field === 'phoneNumber') {
    errors.phoneNumber = phonePattern.test(form.phoneNumber.trim())
      ? ''
      : 'Enter a valid phone number.'
  }

  if (field === 'password') {
    errors.password = form.password.length >= 8
      ? ''
      : 'Password must be at least 8 characters.'
  }

  return !errors[field]
}

const validateForm = () => {
  const fields: SignupField[] = ['companyName', 'name', 'workEmail', 'phoneNumber', 'password']
  return fields.every(validateField)
}

const clearFieldError = (field: SignupField) => {
  if (errors[field]) {
    errors[field] = ''
  }
}

const clearAuthSession = () => {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.removeItem('token')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('loggedInUser')
  localStorage.removeItem('profile')
  localStorage.removeItem('role')
}

const submit = async () => {
  if (!validateForm()) {
    return
  }

  const { firstName, lastName } = splitName()

  try {
    await companySignupStore.createIntent({
      companyName: normalizeWhitespace(form.companyName),
      workEmail: form.workEmail.trim(),
      phoneNumber: form.phoneNumber.trim(),
      firstName,
      lastName,
    })

    await companySignupStore.completeIntent({
      email: form.workEmail.trim(),
      password: form.password,
      firstName,
      lastName,
      phoneNumber: form.phoneNumber.trim(),
    })

    clearAuthSession()

    toast({
      title: 'Success',
      description: 'Company account created. Verify your email, then sign in to continue.',
      variant: 'success',
    })

    await router.push({
      path: '/auth/email-verification',
      query: { email: form.workEmail.trim() },
    })
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to create company account.',
      variant: 'destructive',
    })
  }
}
</script>

<template>
  <AuthSplitShell>
    <div class="grid gap-2">
      <p class="text-xl font-semibold">
        Create your company account
      </p>
      <p class="text-sm text-muted-foreground">
        Set up your company workspace, then sign in to complete onboarding.
      </p>
    </div>

    <form class="grid gap-4" novalidate @submit.prevent="submit">
      <div class="grid gap-2">
        <Label for="companyName">Company name</Label>
        <Input
          id="companyName"
          v-model="form.companyName"
          autocomplete="organization"
          :aria-invalid="Boolean(errors.companyName)"
          aria-describedby="companyName-error"
          required
          @blur="validateField('companyName')"
          @input="clearFieldError('companyName')"
        />
        <p v-if="errors.companyName" id="companyName-error" class="text-xs text-destructive">
          {{ errors.companyName }}
        </p>
      </div>

      <div class="grid gap-2">
        <Label for="name">Name</Label>
        <Input
          id="name"
          v-model="form.name"
          autocomplete="name"
          placeholder="First and last name"
          :aria-invalid="Boolean(errors.name)"
          aria-describedby="name-error"
          required
          @blur="validateField('name')"
          @input="clearFieldError('name')"
        />
        <p v-if="errors.name" id="name-error" class="text-xs text-destructive">
          {{ errors.name }}
        </p>
      </div>

      <div class="grid gap-2">
        <Label for="workEmail">Work email</Label>
        <Input
          id="workEmail"
          v-model="form.workEmail"
          autocomplete="email"
          type="email"
          :aria-invalid="Boolean(errors.workEmail)"
          aria-describedby="workEmail-error"
          required
          @blur="validateField('workEmail')"
          @input="clearFieldError('workEmail')"
        />
        <p v-if="errors.workEmail" id="workEmail-error" class="text-xs text-destructive">
          {{ errors.workEmail }}
        </p>
      </div>

      <div class="grid gap-2">
        <Label for="phoneNumber">Phone number</Label>
        <Input
          id="phoneNumber"
          v-model="form.phoneNumber"
          autocomplete="tel"
          inputmode="tel"
          :aria-invalid="Boolean(errors.phoneNumber)"
          aria-describedby="phoneNumber-error"
          required
          @blur="validateField('phoneNumber')"
          @input="clearFieldError('phoneNumber')"
        />
        <p v-if="errors.phoneNumber" id="phoneNumber-error" class="text-xs text-destructive">
          {{ errors.phoneNumber }}
        </p>
      </div>

      <div class="grid gap-2">
        <Label for="password">Password</Label>
        <Input
          id="password"
          v-model="form.password"
          autocomplete="new-password"
          type="password"
          :aria-invalid="Boolean(errors.password)"
          aria-describedby="password-error"
          required
          @blur="validateField('password')"
          @input="clearFieldError('password')"
        />
        <p v-if="errors.password" id="password-error" class="text-xs text-destructive">
          {{ errors.password }}
        </p>
      </div>

      <Button type="submit" class="w-full" style="background-color:#a03b93" :disabled="isSubmitting">
        {{ isSubmitting ? 'Creating account...' : 'Create account' }}
      </Button>
    </form>

    <div class="text-center text-sm">
      Already have a company account?
      <NuxtLink to="/auth/login" class="underline">
        Sign in
      </NuxtLink>
    </div>
  </AuthSplitShell>
</template>
