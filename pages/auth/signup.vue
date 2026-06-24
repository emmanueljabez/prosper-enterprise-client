<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from '#app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { useCompanySignupStore } from '@/store/modules/company-signup'
import { useAuthStore } from '@/store/modules/auth'
import PublicSiteHeader from '@/components/landing/PublicSiteHeader.vue'

definePageMeta({ auth: false })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const companySignupStore = useCompanySignupStore()
const { toast } = useToast()

type SignupField = 'companyName' | 'name' | 'workEmail' | 'phoneNumber' | 'password'

type CountryDialCode = {
  name: string
  iso2: string
  dialCode: string
  flag: string
}

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

const FREE_TRIAL_INTENT_KEY = 'prosper:free-trial-intent'

const countries: CountryDialCode[] = [
  { name: 'Kenya', iso2: 'KE', dialCode: '+254', flag: '🇰🇪' },
  { name: 'Uganda', iso2: 'UG', dialCode: '+256', flag: '🇺🇬' },
  { name: 'Tanzania', iso2: 'TZ', dialCode: '+255', flag: '🇹🇿' },
  { name: 'Rwanda', iso2: 'RW', dialCode: '+250', flag: '🇷🇼' },
  { name: 'Ethiopia', iso2: 'ET', dialCode: '+251', flag: '🇪🇹' },
  { name: 'South Africa', iso2: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Nigeria', iso2: 'NG', dialCode: '+234', flag: '🇳🇬' },
  { name: 'Ghana', iso2: 'GH', dialCode: '+233', flag: '🇬🇭' },
  { name: 'United States', iso2: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'Canada', iso2: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'United Kingdom', iso2: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'United Arab Emirates', iso2: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'India', iso2: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'Pakistan', iso2: 'PK', dialCode: '+92', flag: '🇵🇰' },
  { name: 'Germany', iso2: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', iso2: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Netherlands', iso2: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'Australia', iso2: 'AU', dialCode: '+61', flag: '🇦🇺' },
]

const selectedCountry = ref<CountryDialCode>(countries[0])
const countrySearch = ref('')
const isCountrySelectorOpen = ref(false)

const routeProduct = computed(() => String(route.query.product || '').trim().toUpperCase())
const routeAudience = computed(() => String(route.query.audience || '').trim().toLowerCase())
const isFreeTrialSignup = computed(() =>
  routeProduct.value === 'FREE_TRIAL'
  || String(route.query.trial || '').trim() === '1'
)
const isMenteeSignup = computed(() => routeAudience.value === 'mentee' || isFreeTrialSignup.value)
const isSubmitting = computed(() => companySignupStore.isLoading || authStore.loading)
const pageTitle = computed(() => {
  if (isFreeTrialSignup.value) {
    return 'Create your free trial account'
  }

  return isMenteeSignup.value ? 'Create your mentee account' : 'Create your company account'
})
const pageDescription = computed(() => {
  if (isFreeTrialSignup.value) {
    return 'Start your free trial, then choose an available mentor.'
  }

  return isMenteeSignup.value
    ? 'Create your account to continue with Prosper Mentor.'
    : 'Set up your company workspace, then sign in to complete onboarding.'
})
const filteredCountries = computed(() => {
  const query = countrySearch.value.trim().toLowerCase()
  if (!query) {
    return countries
  }

  return countries.filter(country =>
    country.name.toLowerCase().includes(query)
    || country.iso2.toLowerCase().includes(query)
    || country.dialCode.includes(query),
  )
})
const normalizedPhoneNumber = computed(() => {
  const dialDigits = selectedCountry.value.dialCode.replace(/\D/g, '')
  let digits = form.phoneNumber.replace(/\D/g, '')

  if (digits.startsWith(dialDigits)) {
    digits = digits.slice(dialDigits.length)
  }

  digits = digits.replace(/^0+/, '')
  return digits ? `${selectedCountry.value.dialCode}${digits}` : ''
})

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
    if (isMenteeSignup.value) {
      errors.companyName = ''
      return true
    }

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
    errors.phoneNumber = phonePattern.test(normalizedPhoneNumber.value)
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
  const fields: SignupField[] = isMenteeSignup.value
    ? ['name', 'workEmail', 'phoneNumber', 'password']
    : ['companyName', 'name', 'workEmail', 'phoneNumber', 'password']
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

const persistFreeTrialIntent = () => {
  if (typeof window === 'undefined' || !isFreeTrialSignup.value) {
    return
  }

  localStorage.setItem(FREE_TRIAL_INTENT_KEY, JSON.stringify({
    audience: 'mentee',
    product: 'FREE_TRIAL',
    trial: true,
  }))
}

const selectCountry = (country: CountryDialCode) => {
  selectedCountry.value = country
  isCountrySelectorOpen.value = false
  countrySearch.value = ''
  clearFieldError('phoneNumber')
}

const signupWithGoogle = async () => {
  try {
    persistFreeTrialIntent()
    await authStore.initiateGoogleAuth()
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Google authentication failed',
      variant: 'destructive',
    })
  }
}

const signupWithMicrosoft = async () => {
  try {
    persistFreeTrialIntent()
    await authStore.initiateMicrosoftAuth()
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Microsoft authentication failed',
      variant: 'destructive',
    })
  }
}

const submit = async () => {
  if (!validateForm()) {
    return
  }

  const { firstName, lastName } = splitName()

  try {
    if (isMenteeSignup.value) {
      persistFreeTrialIntent()

      await authStore.register({
        email: form.workEmail.trim(),
        emailAddress: form.workEmail.trim(),
        password: form.password,
        firstName,
        lastName,
        phoneNumber: normalizedPhoneNumber.value,
        companyName: null,
        noOfEmployees: null,
        role: 'mentee',
        audience: 'mentee',
        product: isFreeTrialSignup.value ? 'FREE_TRIAL' : null,
        trial: isFreeTrialSignup.value,
      })

      clearAuthSession()

      toast({
        title: 'Success',
        description: isFreeTrialSignup.value
          ? 'Account created. Verify your email, then sign in to book your free trial.'
          : 'Account created. Verify your email, then sign in to continue.',
        variant: 'success',
      })

      await router.push({
        path: '/auth/email-verification',
        query: {
          email: form.workEmail.trim(),
          audience: 'mentee',
          ...(isFreeTrialSignup.value ? { trial: '1', product: 'FREE_TRIAL' } : {}),
        },
      })
      return
    }

    await companySignupStore.createIntent({
      companyName: normalizeWhitespace(form.companyName),
      workEmail: form.workEmail.trim(),
      phoneNumber: normalizedPhoneNumber.value,
      firstName,
      lastName,
    })

    await companySignupStore.completeIntent({
      email: form.workEmail.trim(),
      password: form.password,
      firstName,
      lastName,
      phoneNumber: normalizedPhoneNumber.value,
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
  <div class="relative min-h-screen overflow-hidden" style="font-family: 'Montserrat', 'Inter', ui-sans-serif, system-ui, sans-serif;">
    <img
      src="/img_2.jpg"
      alt="ProsperMentor background"
      class="absolute inset-0 h-full w-full object-cover"
    >
    <div class="absolute inset-0 bg-[#0f3f35]/60" />

    <PublicSiteHeader />

    <main class="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8 sm:px-6">
      <section class="w-full max-w-[500px] rounded-[28px] border border-white/30 bg-white/95 p-4 shadow-2xl sm:p-5">
        <div class="space-y-2">
          <h1 class="text-[24px] font-semibold leading-tight text-[#1f2937]">
            {{ pageTitle }}
          </h1>
          <p class="text-[13px] leading-relaxed text-[#4b5563]">
            {{ pageDescription }}
          </p>
        </div>

        <div class="mt-4 grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            :disabled="isSubmitting"
            class="h-10 justify-center rounded-full border-[#d1d5db] px-2 text-[11px] text-[#4b5563] hover:bg-[#f9fafb]"
            @click="signupWithGoogle"
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
            :disabled="isSubmitting"
            class="h-10 justify-center rounded-full border-[#d1d5db] px-2 text-[11px] text-[#4b5563] hover:bg-[#f9fafb]"
            @click="signupWithMicrosoft"
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

        <form class="space-y-2.5" novalidate @submit.prevent="submit">
          <div v-if="!isMenteeSignup" class="grid gap-1.5">
            <Label for="companyName" class="text-xs font-medium text-[#6b7280]">Company name</Label>
            <Input
              id="companyName"
              v-model="form.companyName"
              autocomplete="organization"
              :aria-invalid="Boolean(errors.companyName)"
              aria-describedby="companyName-error"
              required
              :class="[
                'h-10 rounded-[14px] border-[#d1d5db] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9ca3af]',
                errors.companyName ? 'border-red-500 focus-visible:ring-red-200' : 'focus-visible:ring-[#027F63]/25'
              ]"
              @blur="validateField('companyName')"
              @input="clearFieldError('companyName')"
            />
            <p v-if="errors.companyName" id="companyName-error" class="text-xs text-red-500">
              {{ errors.companyName }}
            </p>
          </div>

          <div class="grid gap-1.5">
            <Label for="name" class="text-xs font-medium text-[#6b7280]">Name</Label>
            <Input
              id="name"
              v-model="form.name"
              autocomplete="name"
              placeholder="First and last name"
              :aria-invalid="Boolean(errors.name)"
              aria-describedby="name-error"
              required
              :class="[
                'h-10 rounded-[14px] border-[#d1d5db] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9ca3af]',
                errors.name ? 'border-red-500 focus-visible:ring-red-200' : 'focus-visible:ring-[#027F63]/25'
              ]"
              @blur="validateField('name')"
              @input="clearFieldError('name')"
            />
            <p v-if="errors.name" id="name-error" class="text-xs text-red-500">
              {{ errors.name }}
            </p>
          </div>

          <div class="grid gap-1.5">
            <Label for="workEmail" class="text-xs font-medium text-[#6b7280]">
              {{ isMenteeSignup ? 'Email' : 'Work email' }}
            </Label>
            <Input
              id="workEmail"
              v-model="form.workEmail"
              autocomplete="email"
              type="email"
              :aria-invalid="Boolean(errors.workEmail)"
              aria-describedby="workEmail-error"
              required
              :class="[
                'h-10 rounded-[14px] border-[#d1d5db] bg-white px-3 text-sm text-[#111827] placeholder:text-[#9ca3af]',
                errors.workEmail ? 'border-red-500 focus-visible:ring-red-200' : 'focus-visible:ring-[#027F63]/25'
              ]"
              @blur="validateField('workEmail')"
              @input="clearFieldError('workEmail')"
            />
            <p v-if="errors.workEmail" id="workEmail-error" class="text-xs text-red-500">
              {{ errors.workEmail }}
            </p>
          </div>

          <div class="grid gap-1.5">
            <Label for="phoneNumber" class="text-xs font-medium text-[#6b7280]">Phone number</Label>
            <div class="relative">
              <div
                class="flex h-10 rounded-[14px] border bg-white"
                :class="errors.phoneNumber ? 'border-red-500' : 'border-[#d1d5db]'"
              >
                <button
                  type="button"
                  class="flex min-w-[116px] items-center justify-center gap-2 rounded-l-[14px] border-r border-[#e5e7eb] px-3 text-sm text-[#111827] transition hover:bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#027F63]/25"
                  aria-label="Select country code"
                  @click="isCountrySelectorOpen = !isCountrySelectorOpen"
                >
                  <span aria-hidden="true">{{ selectedCountry.flag }}</span>
                  <span>{{ selectedCountry.dialCode }}</span>
                  <span class="text-[#6b7280]" aria-hidden="true">⌄</span>
                </button>
                <input
                  id="phoneNumber"
                  v-model="form.phoneNumber"
                  autocomplete="tel-national"
                  inputmode="tel"
                  class="min-w-0 flex-1 rounded-r-[14px] border-0 bg-transparent px-3 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af] focus:ring-0"
                  placeholder="712 345 678"
                  :aria-invalid="Boolean(errors.phoneNumber)"
                  aria-describedby="phoneNumber-error"
                  required
                  @blur="validateField('phoneNumber')"
                  @input="clearFieldError('phoneNumber')"
                >
              </div>

              <div
                v-if="isCountrySelectorOpen"
                class="absolute left-0 top-[46px] z-50 w-full overflow-hidden rounded-[16px] border border-[#d1d5db] bg-white shadow-xl"
              >
                <div class="border-b border-[#e5e7eb] p-2">
                  <input
                    v-model="countrySearch"
                    type="search"
                    class="h-9 w-full rounded-[12px] border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#027F63] focus:ring-2 focus:ring-[#027F63]/20"
                    placeholder="Search country or code"
                    aria-label="Search country code"
                  >
                </div>
                <div class="max-h-52 overflow-y-auto py-1">
                  <button
                    v-for="country in filteredCountries"
                    :key="country.iso2"
                    type="button"
                    class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[#111827] hover:bg-[#f3faf8]"
                    @mousedown.prevent="selectCountry(country)"
                  >
                    <span class="text-base" aria-hidden="true">{{ country.flag }}</span>
                    <span class="flex-1">{{ country.name }}</span>
                    <span class="text-[#6b7280]">{{ country.dialCode }}</span>
                  </button>
                  <p v-if="!filteredCountries.length" class="px-3 py-4 text-center text-xs text-[#6b7280]">
                    No countries found.
                  </p>
                </div>
              </div>
            </div>
            <p v-if="errors.phoneNumber" id="phoneNumber-error" class="text-xs text-red-500">
              {{ errors.phoneNumber }}
            </p>
          </div>

          <div class="grid gap-1.5">
            <Label for="password" class="text-xs font-medium text-[#6b7280]">Password</Label>
            <Input
              id="password"
              v-model="form.password"
              autocomplete="new-password"
              type="password"
              :aria-invalid="Boolean(errors.password)"
              aria-describedby="password-error"
              required
              :class="[
                'h-10 rounded-[14px] border-[#d1d5db] bg-white px-3 text-sm text-[#111827]',
                errors.password ? 'border-red-500 focus-visible:ring-red-200' : 'focus-visible:ring-[#027F63]/25'
              ]"
              @blur="validateField('password')"
              @input="clearFieldError('password')"
            />
            <p v-if="errors.password" id="password-error" class="text-xs text-red-500">
              {{ errors.password }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 pt-2">
            <Button
              type="submit"
              :disabled="isSubmitting"
              class="h-10 min-w-[178px] rounded-full bg-[#027F63] px-6 text-sm font-medium text-white hover:bg-[#046f58]"
            >
              {{ isSubmitting ? 'Creating account...' : (isFreeTrialSignup ? 'Create free trial account' : 'Create account') }}
            </Button>
            <p class="text-xs text-[#6b7280]">
              {{ isMenteeSignup ? 'Already have an account?' : 'Already have a company account?' }}
              <NuxtLink
                :to="isFreeTrialSignup ? '/auth/login?audience=mentee&trial=1&product=FREE_TRIAL' : '/auth/login'"
                class="font-medium text-[#027F63] hover:underline"
              >
                Sign in
              </NuxtLink>
            </p>
          </div>
        </form>
      </section>
    </main>
  </div>
</template>
