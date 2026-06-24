<script setup lang="ts">
import { Country } from 'country-state-city'
import type { ICountry } from 'country-state-city'
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from '#app'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyOnboardingStore } from '@/store/modules/company-onboarding'
import type { UpdateCompanyOnboardingPayload } from '@/http/requests/app/company'
import { useAppToast } from '@/composables/services/toastService'
import PublicSiteHeader from '@/components/landing/PublicSiteHeader.vue'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({
  title: 'Company Setup',
  description: 'Complete company setup before entering your workspace',
  requiresAuth: true,
  permissions: ['admin:dashboard:view'],
})

const router = useRouter()
const authStore = useAuthStore()
const onboardingStore = useCompanyOnboardingStore()
const toast = useAppToast()

const setupSteps = [
  {
    stepLabel: 'Step 1',
    title: 'Company profile',
    description: 'Add the company context used for program setup.',
  },
]

const currentStep = ref(0)
const countryDropdownOpen = ref(false)
const countrySearch = ref('')

const form = reactive<UpdateCompanyOnboardingPayload>({
  industry: '',
  companySizeBand: '',
  country: 'Kenya',
  timezone: 'Africa/Nairobi',
})

const isBootstrapping = ref(false)
const formError = ref<string | null>(null)

const companyId = computed(() => {
  if (authStore.loggedInUser?.companyId) {
    return authStore.loggedInUser.companyId
  }

  if (typeof window === 'undefined') {
    return ''
  }

  try {
    const parsedProfile = JSON.parse(localStorage.getItem('profile') || '{}')
    return parsedProfile?.company?.id || parsedProfile?.companyId || parsedProfile?.company_id || ''
  } catch {
    return ''
  }
})

const currentStepMeta = computed(() => setupSteps[currentStep.value])
const stepNumber = computed(() => currentStep.value + 1)
const isLastStep = computed(() => currentStep.value === setupSteps.length - 1)

const baseIndustryOptions = [
  'Aviation',
  'Banking',
  'Consulting',
  'Education',
  'Energy',
  'Financial Services',
  'Government',
  'Healthcare',
  'Hospitality',
  'Insurance',
  'Logistics',
  'Manufacturing',
  'Media',
  'Non-profit',
  'Professional Services',
  'Retail',
  'Technology',
  'Telecommunications',
  'Other',
]

const industryOptions = computed(() => {
  const currentIndustry = String(form.industry || '').trim()
  if (!currentIndustry || baseIndustryOptions.includes(currentIndustry)) {
    return baseIndustryOptions
  }

  return [currentIndustry, ...baseIndustryOptions]
})

const countryOptions = Country.getAllCountries()
  .filter(country => country.name && country.isoCode)
  .sort((firstCountry, secondCountry) => firstCountry.name.localeCompare(secondCountry.name))

const findCountryOption = (countryValue?: string | null) => {
  const normalizedValue = String(countryValue || '').trim().toLowerCase()
  if (!normalizedValue) {
    return null
  }

  return countryOptions.find(country =>
    country.name.toLowerCase() === normalizedValue ||
    country.isoCode.toLowerCase() === normalizedValue,
  ) || null
}

const selectedCountry = computed(() => findCountryOption(form.country))
const countryTimezones = computed(() => selectedCountry.value?.timezones || [])
const filteredCountryOptions = computed(() => {
  const searchTerm = countrySearch.value.trim().toLowerCase()

  if (!searchTerm) {
    return countryOptions
  }

  return countryOptions.filter(country =>
    country.name.toLowerCase().includes(searchTerm) ||
    country.isoCode.toLowerCase().includes(searchTerm),
  )
})
const hasMultipleTimezones = computed(() => countryTimezones.value.length > 1)

const formatCountryLabel = (country: ICountry) => `${country.flag ? `${country.flag} ` : ''}${country.name}`

const formatTimezoneLabel = (timezone: NonNullable<ICountry['timezones']>[number]) => {
  const details = [timezone.gmtOffsetName, timezone.abbreviation].filter(Boolean).join(' · ')
  return details ? `${timezone.zoneName} (${details})` : timezone.zoneName
}

const openCountryDropdown = () => {
  countrySearch.value = form.country || ''
  countryDropdownOpen.value = true
}

const closeCountryDropdown = () => {
  countryDropdownOpen.value = false
}

const handleCountryFocusOut = (event: FocusEvent) => {
  const wrapper = event.currentTarget as HTMLElement
  const nextTarget = event.relatedTarget as Node | null

  if (nextTarget && wrapper.contains(nextTarget)) {
    return
  }

  closeCountryDropdown()
}

const selectCountry = (country: ICountry) => {
  form.country = country.name
  countrySearch.value = country.name

  const inferredTimezone = country.timezones?.[0]?.zoneName
  if (inferredTimezone) {
    form.timezone = inferredTimezone
  }

  closeCountryDropdown()
}

const hydrateForm = () => {
  const status = onboardingStore.status
  if (!status) {
    return
  }

  form.industry = status.industry || ''
  form.companySizeBand = status.companySizeBand || ''
  const hydratedCountry = findCountryOption(status.country || 'Kenya')
  form.country = hydratedCountry?.name || status.country || 'Kenya'
  form.timezone = status.timezone || hydratedCountry?.timezones?.[0]?.zoneName || 'Africa/Nairobi'
}

const validateStep = (step = currentStep.value) => {
  const stepValidations = [[
    ['industry', form.industry, 'Industry is required.'],
    ['companySizeBand', form.companySizeBand, 'Company size is required.'],
    ['country', form.country, 'Country is required.'],
    ['timezone', form.timezone, 'Timezone is required.'],
  ]]

  const missing = stepValidations[step]?.find(([, value]) => !String(value || '').trim())
  if (missing) {
    return String(missing[2])
  }

  return null
}

const validateForm = () => {
  for (let index = 0; index < setupSteps.length; index += 1) {
    const validationError = validateStep(index)
    if (validationError) {
      currentStep.value = index
      return validationError
    }
  }

  return null
}

const goToStep = (step: number) => {
  if (step <= currentStep.value) {
    currentStep.value = step
    formError.value = null
    return
  }

  const validationError = validateStep(currentStep.value)
  if (validationError) {
    formError.value = validationError
    toast.error(validationError)
    return
  }

  currentStep.value = step
  formError.value = null
}

const nextStep = () => {
  const validationError = validateStep()
  if (validationError) {
    formError.value = validationError
    toast.error(validationError)
    return
  }

  if (!isLastStep.value) {
    currentStep.value += 1
    formError.value = null
  }
}

const loadSetup = async () => {
  if (!companyId.value) {
    formError.value = 'Company context is missing for this account. Sign in again to continue.'
    return
  }

  isBootstrapping.value = true
  formError.value = null

  try {
    await Promise.all([
      onboardingStore.loadOnboardingStatus(companyId.value),
    ])
    hydrateForm()
  } catch (error: any) {
    formError.value = error?.response?.data?.message || error?.message || 'Failed to load company setup.'
  } finally {
    isBootstrapping.value = false
  }
}

const saveOnboarding = async () => {
  const validationError = validateForm()
  if (validationError) {
    formError.value = validationError
    toast.error(validationError)
    return
  }

  formError.value = null

  try {
    const payload: UpdateCompanyOnboardingPayload = {
      ...form,
    }
    await onboardingStore.saveOnboarding(companyId.value, payload)

    if (onboardingStore.requiresOnboarding) {
      formError.value = 'Some required setup details are still missing.'
      return
    }

    toast.success('Company setup saved. Your admin workspace is ready.')
    await router.push('/app/admin')
  } catch (error: any) {
    formError.value = error?.response?.data?.message || error?.message || 'Failed to save company setup.'
    toast.error(formError.value)
  }
}

watch(() => companyId.value, value => {
  if (value) {
    loadSetup()
  }
}, { immediate: true })

watch(() => form.country, value => {
  countrySearch.value = value || ''
}, { immediate: true })
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
      <section class="w-full max-w-[760px] rounded-[28px] border border-white/30 bg-white/95 p-4 shadow-2xl sm:p-5">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div class="space-y-2">
            <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#027F63]">
              Company setup
            </p>
            <h1 class="text-[24px] font-semibold leading-tight text-[#1f2937]">
              Finish setting up your workspace
            </h1>
            <p class="max-w-[520px] text-[13px] leading-relaxed text-[#4b5563]">
              Add the company context ProsperMentor needs to prepare your corporate mentorship workspace.
            </p>
          </div>
          <div class="rounded-full border border-[#d1d5db] bg-white px-3 py-1.5 text-xs font-medium text-[#027F63]">
            Step {{ stepNumber }} of {{ setupSteps.length }}
          </div>
        </div>

        <div class="mt-4 grid gap-2 sm:grid-cols-1">
          <button
            v-for="(step, index) in setupSteps"
            :key="step.title"
            type="button"
            class="rounded-[18px] border p-3 text-left transition"
            :class="index === currentStep ? 'border-[#027F63] bg-[#f0faf7]' : 'border-[#e5e7eb] bg-white hover:border-[#9bd1c3]'"
            @click="goToStep(index)"
          >
            <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#027F63]">
              {{ step.stepLabel }}
            </span>
            <span class="mt-1 block text-sm font-semibold text-[#1f2937]">
              {{ step.title }}
            </span>
          </button>
        </div>

        <Alert v-if="formError || onboardingStore.error" variant="destructive" class="mt-4">
          <AlertDescription>{{ formError || onboardingStore.error }}</AlertDescription>
        </Alert>

        <div v-if="isBootstrapping" class="mt-4 space-y-3 rounded-[18px] border border-[#e5e7eb] bg-white p-4">
          <Skeleton class="h-8 w-1/2" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-20 w-full" />
        </div>

        <form v-else class="mt-4 grid gap-4" @submit.prevent="saveOnboarding">
          <div class="border-t border-[#e5e7eb] pt-4">
            <h2 class="text-[18px] font-semibold text-[#1f2937]">
              {{ currentStepMeta.title }}
            </h2>
            <p class="mt-1 text-[13px] leading-relaxed text-[#4b5563]">
              {{ currentStepMeta.description }}
            </p>
          </div>

          <section v-if="currentStep === 0" class="grid gap-3 md:grid-cols-2">
            <div class="grid gap-1.5">
              <Label for="industry" class="text-xs font-medium text-[#6b7280]">Industry</Label>
                <select
                  id="industry"
                  v-model="form.industry"
                  class="h-10 rounded-[14px] border border-[#d1d5db] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#027F63] focus:ring-2 focus:ring-[#027F63]/20"
                >
                  <option value="">Select industry</option>
                  <option
                    v-for="industry in industryOptions"
                    :key="industry"
                    :value="industry"
                  >
                    {{ industry }}
                  </option>
                </select>
            </div>

            <div class="grid gap-1.5">
              <Label for="companySizeBand" class="text-xs font-medium text-[#6b7280]">Company size</Label>
                <select
                  id="companySizeBand"
                  v-model="form.companySizeBand"
                  class="h-10 rounded-[14px] border border-[#d1d5db] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#027F63] focus:ring-2 focus:ring-[#027F63]/20"
                >
                  <option value="">Select size</option>
                  <option value="1-50">1-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-1000">201-1,000 employees</option>
                  <option value="1001-5000">1,001-5,000 employees</option>
                  <option value="5000+">5,000+ employees</option>
                </select>
            </div>

            <div class="grid gap-1.5">
              <Label for="country" class="text-xs font-medium text-[#6b7280]">Country</Label>
                <div class="relative" @focusout="handleCountryFocusOut">
                  <button
                    id="country"
                    type="button"
                    class="flex h-10 w-full items-center justify-between rounded-[14px] border border-[#d1d5db] bg-white px-3 text-left text-sm text-[#111827] transition hover:bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#027F63]/25"
                    :aria-expanded="countryDropdownOpen"
                    aria-haspopup="listbox"
                    @click="countryDropdownOpen ? closeCountryDropdown() : openCountryDropdown()"
                  >
                    <span :class="form.country ? 'text-foreground' : 'text-muted-foreground'">
                      {{ selectedCountry ? formatCountryLabel(selectedCountry) : form.country || 'Search and select country' }}
                    </span>
                    <span class="text-xs text-[#6b7280]">⌄</span>
                  </button>

                  <div
                    v-if="countryDropdownOpen"
                    class="absolute z-50 mt-2 w-full overflow-hidden rounded-[16px] border border-[#d1d5db] bg-white shadow-xl"
                  >
                    <div class="border-b border-[#e5e7eb] p-2">
                      <Input
                        v-model="countrySearch"
                        placeholder="Search country..."
                        class="h-9 rounded-[12px] border-[#d1d5db] text-sm focus-visible:ring-[#027F63]/25"
                        @keydown.escape.prevent="closeCountryDropdown"
                      />
                    </div>
                    <div
                      v-if="filteredCountryOptions.length"
                      class="max-h-64 overflow-y-auto p-1"
                      role="listbox"
                    >
                      <button
                        v-for="country in filteredCountryOptions"
                        :key="country.isoCode"
                        type="button"
                        class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[#111827] hover:bg-[#f3faf8]"
                        :aria-selected="country.name === form.country"
                        role="option"
                        @click="selectCountry(country)"
                      >
                        <span>{{ formatCountryLabel(country) }}</span>
                        <span v-if="country.name === form.country" class="text-xs font-semibold text-[#027F63]">Selected</span>
                      </button>
                    </div>
                    <div v-else class="px-3 py-6 text-center text-sm text-[#6b7280]">
                      No country found.
                    </div>
                  </div>
                </div>
            </div>

            <div class="grid gap-1.5">
              <Label for="timezone" class="text-xs font-medium text-[#6b7280]">Timezone</Label>
                <select
                  v-if="countryTimezones.length"
                  id="timezone"
                  v-model="form.timezone"
                  class="h-10 rounded-[14px] border border-[#d1d5db] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#027F63] focus:ring-2 focus:ring-[#027F63]/20"
                >
                  <option value="">Select timezone</option>
                  <option
                    v-for="timezone in countryTimezones"
                    :key="timezone.zoneName"
                    :value="timezone.zoneName"
                  >
                    {{ formatTimezoneLabel(timezone) }}
                  </option>
                </select>
                <Input
                  v-else
                  id="timezone"
                  v-model="form.timezone"
                  placeholder="Africa/Nairobi"
                  class="h-10 rounded-[14px] border-[#d1d5db] text-sm focus-visible:ring-[#027F63]/25"
                />
                <p class="text-xs leading-relaxed text-[#6b7280]">
                  <span v-if="selectedCountry && hasMultipleTimezones">
                    Inferred from {{ selectedCountry.name }}. Confirm the timezone that fits this company.
                  </span>
                  <span v-else-if="selectedCountry">
                    Inferred from {{ selectedCountry.name }}.
                  </span>
                  <span v-else>
                    Select a country to infer timezone.
                  </span>
                </p>
            </div>
          </section>

          <div class="flex flex-col gap-3 border-t border-[#e5e7eb] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs leading-relaxed text-[#6b7280]">
              You can update company details later from admin settings.
            </p>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                v-if="!isLastStep"
                type="button"
                class="h-10 rounded-full bg-[#027F63] px-6 text-sm font-medium text-white hover:bg-[#046f58]"
                @click="nextStep"
              >
                Next
              </Button>
              <Button
                v-else
                type="submit"
                class="h-10 rounded-full bg-[#027F63] px-6 text-sm font-medium text-white hover:bg-[#046f58]"
                :disabled="onboardingStore.isSaving"
              >
                {{ onboardingStore.isSaving ? 'Saving...' : 'Finish Setup' }}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </main>
  </div>
</template>
