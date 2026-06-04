import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import companyApi, {
  type CompanyOnboardingStatus,
  type UpdateCompanyOnboardingPayload,
} from '@/http/requests/app/company'

export const useCompanyOnboardingStore = defineStore('company-onboarding', () => {
  const status = ref<CompanyOnboardingStatus | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const requiresOnboarding = computed(() => !status.value?.completed)

  const loadOnboardingStatus = async (companyId: string) => {
    if (!companyId) {
      status.value = null
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await companyApi.getCompanyOnboarding(companyId)
      status.value = response.data.data
      return status.value
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || 'Failed to load company onboarding'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const saveOnboarding = async (companyId: string, payload: UpdateCompanyOnboardingPayload) => {
    isSaving.value = true
    error.value = null

    try {
      const response = await companyApi.updateCompanyOnboarding(companyId, payload)
      status.value = response.data.data
      return status.value
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || 'Failed to save company onboarding'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  return {
    status,
    isLoading,
    isSaving,
    error,
    requiresOnboarding,
    loadOnboardingStatus,
    saveOnboarding,
  }
})
