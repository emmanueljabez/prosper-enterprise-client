<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BirthDatePicker } from '@/components/ui/date-picker'
import { useRouter, useRoute } from '#app'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import { useToast } from '@/components/ui/toast'
import companyApi from '@/http/requests/app/company'

// Allow unauthenticated access (public page)
definePageMeta({
  auth: false
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { toast } = useToast()

const invitationToken = ref<string>('')
const invitationData = ref<any>(null)
const isVerifying = ref(true)
const isValid = ref(false)
const signupMode = ref<'invitation' | 'company_registration'>('invitation')

// Form validation
const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  dateOfBirth: yup.string(),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required')
})

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: schema
})

// Form fields
const { value: email, errorMessage: emailError } = useField<string>('email', schema.fields.email)
const { value: firstName, errorMessage: firstNameError } = useField<string>('firstName', schema.fields.firstName)
const { value: lastName, errorMessage: lastNameError } = useField<string>('lastName', schema.fields.lastName)
const { value: phoneNumber, errorMessage: phoneNumberError } = useField<string>('phoneNumber', schema.fields.phoneNumber)
const { value: dateOfBirth, errorMessage: dateOfBirthError } = useField<string>('dateOfBirth', schema.fields.dateOfBirth)
const { value: password, errorMessage: passwordError } = useField<string>('password', schema.fields.password)
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField<string>('confirmPassword', schema.fields.confirmPassword)

// Verify invitation token
onMounted(async () => {
  invitationToken.value = route.query.token as string

  if (!invitationToken.value) {
    toast({
      title: 'Error',
      description: 'Invalid invitation link',
      variant: 'destructive',
    })
    router.push('/auth/login')
    return
  }

  try {
    const invitationResponse = await companyApi.verifyInvitation(invitationToken.value)

    if (invitationResponse.data && invitationResponse.data.success) {
      signupMode.value = 'invitation'
      invitationData.value = invitationResponse.data.data
      email.value = invitationData.value.email
      isValid.value = true
      return
    }
  } catch (error: any) {
    try {
      const companyRegistrationResponse = await companyApi.verifyCompanyRegistration(invitationToken.value)

      if (companyRegistrationResponse.data && companyRegistrationResponse.data.success) {
        signupMode.value = 'company_registration'
        invitationData.value = {
          companyId: companyRegistrationResponse.data.data?.id,
          companyName: companyRegistrationResponse.data.data?.name,
          email: companyRegistrationResponse.data.data?.emailAddress,
          phoneNumber: companyRegistrationResponse.data.data?.phoneNumber
        }
        email.value = invitationData.value.email
        isValid.value = true
        return
      }
    } catch (companyError: any) {
      console.error('Error verifying company registration token:', companyError)
    }

    console.error('Error verifying invitation:', error)
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Invalid or expired signup link. Please contact support.',
      variant: 'destructive',
    })
    router.push('/auth/login')
  } finally {
    isVerifying.value = false
  }
})

// Handle complete signup
const handleCompleteSignup = handleSubmit(async (values) => {
  try {
    const response = signupMode.value === 'company_registration'
      ? await authStore.completeCompanyRegistrationSignup({
        email: values.email,
        password: values.password,
        registrationToken: invitationToken.value,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth
      })
      : await authStore.completeInvitationSignup({
        email: values.email,
        password: values.password,
        invitationToken: invitationToken.value,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth
      })

    if (response) {
      toast({
        title: 'Success',
        description: signupMode.value === 'company_registration'
          ? 'Company admin account created successfully! Redirecting to your admin portal...'
          : 'Account created successfully! Redirecting to dashboard...',
        variant: 'success',
      })

      setTimeout(() => {
        if (signupMode.value === 'company_registration') {
          router.push('/app/admin')
          return
        }

        const role = localStorage.getItem('role')
        router.push(['company', 'company_admin', 'corporate_admin'].includes(String(role || '').toLowerCase()) ? '/app/admin' : '/app/dashboard')
      }, 1500)
    }
  } catch (error: any) {
    console.error('Signup error:', error)
    const errorMessage = error.message || 'Failed to create account'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    })
  }
})
</script>

<template>
  <div class="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
    <div class="hidden h-screen bg-muted lg:flex lg:items-center lg:justify-center">
      <img src="/images/prosper_mentor_logo.png" alt="Image" width="150" height="150"
        class="object-cover dark:brightness-[0.2] dark:grayscale">
    </div>

    <div class="flex items-center justify-center py-12">
      <!-- Verifying State -->
      <div v-if="isVerifying" class="mx-auto grid w-[350px] gap-8">
        <div class="text-center">
          <p class="text-xl font-semibold">Verifying invitation...</p>
          <div class="mt-4 flex justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>

      <!-- Invalid Invitation State -->
      <div v-else-if="!isValid" class="mx-auto grid w-[350px] gap-8">
        <div class="grid gap-2">
          <p class="text-xl font-semibold text-red-500">Invalid Invitation</p>
          <p class="text-sm text-gray-600">This invitation link is invalid or has expired.</p>
        </div>
        <div class="mt-4 text-center text-sm">
          <a href="/auth/login" class="underline">
            Back to Login
          </a>
        </div>
      </div>

      <!-- Signup Form -->
      <div v-else class="mx-auto grid w-[450px] gap-8">
        <div class="grid gap-2">
          <p class="text-xl font-semibold">
            {{ signupMode === 'company_registration' ? 'Set up your company admin account' : 'Complete your account setup' }}
          </p>
          <p class="text-sm text-muted-foreground">
            <span v-if="signupMode === 'company_registration'">
              You're setting up access for <strong>{{ invitationData?.companyName }}</strong>
            </span>
            <span v-else>
              You've been invited by <strong>{{ invitationData?.companyName }}</strong>
            </span>
          </p>
        </div>

        <form @submit="handleCompleteSignup" class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" v-model="email" disabled class="bg-muted" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="firstName">First Name *</Label>
              <Input id="firstName" type="text" v-model="firstName"
                :class="{ 'border-red-500': firstNameError }" required />
              <span v-if="firstNameError" class="text-red-500 text-sm">{{ firstNameError }}</span>
            </div>

            <div class="grid gap-2">
              <Label for="lastName">Last Name *</Label>
              <Input id="lastName" type="text" v-model="lastName"
                :class="{ 'border-red-500': lastNameError }" required />
              <span v-if="lastNameError" class="text-red-500 text-sm">{{ lastNameError }}</span>
            </div>
          </div>

          <div class="grid gap-2">
            <Label for="phoneNumber">Phone Number *</Label>
            <Input id="phoneNumber" type="tel" v-model="phoneNumber"
              :class="{ 'border-red-500': phoneNumberError }" required />
            <span v-if="phoneNumberError" class="text-red-500 text-sm">{{ phoneNumberError }}</span>
          </div>

          <div class="grid gap-2">
            <Label for="dateOfBirth">Date of Birth (Optional)</Label>
            <BirthDatePicker
              v-model="dateOfBirth"
              placeholder="Select your date of birth"
            />
            <span v-if="dateOfBirthError" class="text-red-500 text-sm">{{ dateOfBirthError }}</span>
          </div>

          <div class="grid gap-2">
            <Label for="password">Password *</Label>
            <Input id="password" type="password" v-model="password"
              :class="{ 'border-red-500': passwordError }" required />
            <span v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</span>
          </div>

          <div class="grid gap-2">
            <Label for="confirmPassword">Confirm Password *</Label>
            <Input id="confirmPassword" type="password" v-model="confirmPassword"
              :class="{ 'border-red-500': confirmPasswordError }" required />
            <span v-if="confirmPasswordError" class="text-red-500 text-sm">{{ confirmPasswordError }}</span>
          </div>

          <Button type="submit" class="w-full" :disabled="isSubmitting" style="background-color:#a03b93">
            {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
          </Button>
        </form>

        <div class="mt-4 text-center text-sm">
          Already have an account?
          <a href="/auth/login" class="underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
