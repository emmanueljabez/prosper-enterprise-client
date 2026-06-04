<script setup lang="ts">
import { Country } from 'country-state-city'
import type { ICountry } from 'country-state-city'
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from '#app'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyOnboardingStore } from '@/store/modules/company-onboarding'
import type { UpdateCompanyOnboardingPayload } from '@/http/requests/app/company'
import { useAppToast } from '@/composables/services/toastService'
import AuthSplitShell from '@/components/auth/AuthSplitShell.vue'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
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
  <AuthSplitShell content-class="w-full max-w-5xl px-4 lg:px-8" align="start">
    <div class="space-y-6">
      <div class="rounded-[28px] border border-[#e8d9e6] bg-white p-4 shadow-sm lg:p-5">
        <div class="grid gap-3 md:grid-cols-3">
          <button
            v-for="(step, index) in setupSteps"
            :key="step.title"
            type="button"
            class="rounded-2xl border p-4 text-left transition"
            :class="index === currentStep ? 'border-[#a03b93] bg-[#fbf1f9]' : 'border-[#e5e7eb] bg-white hover:border-[#d8b6d2]'"
            @click="goToStep(index)"
          >
            <span class="text-xs font-semibold uppercase tracking-[0.18em] text-[#a03b93]">
              {{ step.stepLabel }}
            </span>
            <span class="mt-2 block text-sm font-semibold text-[#211827]">
              {{ step.title }}
            </span>
          </button>
        </div>
      </div>

      <Alert v-if="formError || onboardingStore.error" variant="destructive">
        <AlertDescription>{{ formError || onboardingStore.error }}</AlertDescription>
      </Alert>

      <Card v-if="isBootstrapping">
        <CardContent class="space-y-4 p-6">
          <Skeleton class="h-10 w-1/2" />
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-12 w-full" />
          <Skeleton class="h-28 w-full" />
        </CardContent>
      </Card>

      <Card v-else>
        <CardHeader>
          <CardTitle>
            Step {{ stepNumber }}: {{ currentStepMeta.title }}
          </CardTitle>
          <CardDescription>
            {{ currentStepMeta.description }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form class="grid gap-6" @submit.prevent="saveOnboarding">
            <section v-if="currentStep === 0" class="grid gap-5 md:grid-cols-2">
              <div class="grid gap-2">
                <Label for="industry">Industry</Label>
                <select
                  id="industry"
                  v-model="form.industry"
                  class="h-10 rounded-md border border-input bg-background px-3 text-sm"
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

              <div class="grid gap-2">
                <Label for="companySizeBand">Company size</Label>
                <select
                  id="companySizeBand"
                  v-model="form.companySizeBand"
                  class="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select size</option>
                  <option value="1-50">1-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-1000">201-1,000 employees</option>
                  <option value="1001-5000">1,001-5,000 employees</option>
                  <option value="5000+">5,000+ employees</option>
                </select>
              </div>

              <div class="grid gap-2">
                <Label for="country">Country</Label>
                <div class="relative" @focusout="handleCountryFocusOut">
                  <button
                    id="country"
                    type="button"
                    class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm"
                    :aria-expanded="countryDropdownOpen"
                    aria-haspopup="listbox"
                    @click="countryDropdownOpen ? closeCountryDropdown() : openCountryDropdown()"
                  >
                    <span :class="form.country ? 'text-foreground' : 'text-muted-foreground'">
                      {{ selectedCountry ? formatCountryLabel(selectedCountry) : form.country || 'Search and select country' }}
                    </span>
                    <span class="text-xs text-muted-foreground">⌄</span>
                  </button>

                  <div
                    v-if="countryDropdownOpen"
                    class="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[#ead8e7] bg-white shadow-xl"
                  >
                    <div class="border-b p-2">
                      <Input
                        v-model="countrySearch"
                        placeholder="Search country..."
                        class="h-9"
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
                        class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-[#fbf1f9]"
                        :aria-selected="country.name === form.country"
                        role="option"
                        @click="selectCountry(country)"
                      >
                        <span>{{ formatCountryLabel(country) }}</span>
                        <span v-if="country.name === form.country" class="text-xs font-semibold text-[#a03b93]">Selected</span>
                      </button>
                    </div>
                    <div v-else class="px-3 py-6 text-center text-sm text-muted-foreground">
                      No country found.
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid gap-2">
                <Label for="timezone">Timezone</Label>
                <select
                  v-if="countryTimezones.length"
                  id="timezone"
                  v-model="form.timezone"
                  class="h-10 rounded-md border border-input bg-background px-3 text-sm"
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
                <Input v-else id="timezone" v-model="form.timezone" placeholder="Africa/Nairobi" />
                <p class="text-xs text-muted-foreground">
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

            <div class="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-end">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  v-if="!isLastStep"
                  type="button"
                  class="bg-[#a03b93] hover:bg-[#8a2f7d]"
                  @click="nextStep"
                >
                  Next
                </Button>
                <Button
                  v-else
                  type="submit"
                  class="bg-[#a03b93] hover:bg-[#8a2f7d]"
                  :disabled="onboardingStore.isSaving"
                >
                  Finish Setup
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </AuthSplitShell>
</template>
