import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import companySubscriptionsApi, { type CompanySubscriptionSummary } from '@/http/requests/app/companySubscriptions'

export const useCompanyActivationStore = defineStore('company-activation', () => {
  const companySubscriptions = ref<CompanySubscriptionSummary[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const requiresActivation = computed(() =>
    !companySubscriptions.value.some(subscription =>
      subscription.status === 'ACTIVE' && Number(subscription.wallet?.sessionsPurchased || 0) > 0,
    ),
  )

  const loadActivationState = async (companyId: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await companySubscriptionsApi.getCompanySubscriptions(companyId)
      companySubscriptions.value = response.data || []
      return companySubscriptions.value
    } catch (err: any) {
      error.value = err.message || 'Failed to load company activation state'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createDirectPurchase = async (
    companyId: string,
    planId: string,
    sessionCount: number,
    redirectSuccessUrl: string,
    redirectCancelUrl: string,
  ) => companySubscriptionsApi.createCompanySubscription({
    companyId,
    planId,
    sessionCount,
    redirectSuccessUrl,
    redirectCancelUrl,
  })

  return {
    companySubscriptions,
    isLoading,
    error,
    requiresActivation,
    loadActivationState,
    createDirectPurchase,
  }
})
