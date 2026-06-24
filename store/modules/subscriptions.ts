import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import subscriptionsApi, {
  type SubscriptionPlan,
  type ActiveSubscription,
  type ActiveSubscriptionData,
  type BillingInterval,
  type UpgradePayload,
  type PaymentInfo,
  type AddonPurchasePayload,
  type RenewNowData
} from '@/http/requests/app/subscriptions'

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  // State
  const plans = ref<SubscriptionPlan[]>([])
  const selectedPlan = ref<SubscriptionPlan | null>(null)
  const activeSubscription = ref<ActiveSubscription | null>(null)
  const activeSubscriptionContext = ref<ActiveSubscriptionData | null>(null)
  const isLoading = ref(false)
  const isLoadingActiveSubscription = ref(false)
  const isUpgrading = ref(false)
  const error = ref<string | null>(null)
  const paymentInfo = ref<PaymentInfo | null>(null)

  // Computed
  const activePlans = computed(() =>
    plans.value.filter(plan => plan.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
  )

  const getPlanByCode = (code: string) =>
    plans.value.find(plan => plan.code === code)

  const getPlanById = (id: string) =>
    plans.value.find(plan => plan.id === id)

  // Actions
  const normalizePlan = (plan: SubscriptionPlan | null | undefined): SubscriptionPlan | null => {
    if (!plan) {
      return null
    }

    return {
      ...plan,
      formattedPrice: plan.formattedPrice || (
        Number(plan.cost) === 0
          ? 'Free'
          : `${plan.currency || 'KES'} ${Number(plan.cost || 0).toLocaleString()}`
      ),
      unlimited: typeof plan.unlimited === 'boolean' ? plan.unlimited : Number(plan.sessionsPerPeriod) === -1,
      free: typeof plan.free === 'boolean' ? plan.free : Number(plan.cost) === 0,
    }
  }

  const normalizeBillingInterval = (billingInterval?: BillingInterval | null): BillingInterval =>
    billingInterval === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY'

  const normalizeActiveSubscription = (data: ActiveSubscriptionData | null): ActiveSubscription | null => {
    if (!data) {
      return null
    }

    if (data.subscription) {
      const normalizedPlan = normalizePlan(data.subscription.plan)
      return {
        ...data.subscription,
        billingInterval: normalizeBillingInterval(data.subscription.billingInterval),
        plan: normalizedPlan || data.subscription.plan,
        remainingSessionsCount: data.remainingSessions ?? data.subscription.remainingSessionsCount,
      }
    }

    if (data.subscriptionSource === 'CORPORATE' && data.companySubscription?.plan) {
      const normalizedPlan = normalizePlan(data.companySubscription.plan)
      return {
        id: data.companySubscription.id,
        userId: data.corporateSeat?.profileId || '',
        plan: normalizedPlan || data.companySubscription.plan,
        sessionsPerMonth: normalizedPlan?.sessionsPerPeriod ?? data.companySubscription.plan.sessionsPerPeriod,
        sessionsUsed: data.corporateSeat?.sessionsUsed ?? 0,
        startDate: data.companySubscription.startDate || '',
        endDate: data.companySubscription.endDate || '',
        currentPeriodStart: data.companySubscription.currentPeriodStart || '',
        currentPeriodEnd: data.companySubscription.currentPeriodEnd || '',
        status: data.companySubscription.status,
        billingInterval: normalizeBillingInterval(data.companySubscription.billingInterval),
        autoRenew: Boolean(data.companySubscription.autoRenew),
        isTrial: false,
        createdAt: data.companySubscription.createdAt || '',
        updatedAt: data.companySubscription.updatedAt || '',
        active: data.companySubscription.status === 'ACTIVE',
        remainingSessionsCount: data.remainingSessions ?? 0,
        autoRenewCardOnFile: false,
        autoRenewCardType: null,
        autoRenewCardLastFour: null,
        autoRenewTokenizedAt: null,
        autoRenewLastChargeAt: null,
        autoRenewLastFailureReason: null,
        expired: data.companySubscription.status === 'EXPIRED' || data.companySubscription.status === 'CANCELLED',
      }
    }

    return null
  }

  const normalizePlans = (sourcePlans: SubscriptionPlan[] | null | undefined): SubscriptionPlan[] =>
    (sourcePlans || []).map(plan => normalizePlan(plan) || plan)

  const mergePlans = (incomingPlans: SubscriptionPlan[]) => {
    incomingPlans.forEach((incomingPlan) => {
      const index = plans.value.findIndex(plan => plan.id === incomingPlan.id)
      if (index === -1) {
        plans.value.push(incomingPlan)
      } else {
        plans.value[index] = incomingPlan
      }
    })
  }

  const fetchPlans = async (audience?: 'INDIVIDUAL' | 'CORPORATE' | 'BOTH') => {
    isLoading.value = true
    error.value = null

    try {
      const response = await subscriptionsApi.getPlans(audience)

      if (response.success) {
        plans.value = normalizePlans(response.data)
      } else {
        error.value = response.message || 'Failed to fetch subscription plans'
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching plans'
      console.error('Error fetching plans:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchPlansForAudience = async (audience: 'INDIVIDUAL' | 'CORPORATE' | 'BOTH'): Promise<SubscriptionPlan[]> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await subscriptionsApi.getPlans(audience)

      if (response.success) {
        const normalizedPlans = normalizePlans(response.data)
        mergePlans(normalizedPlans)
        return normalizedPlans
      }

      error.value = response.message || 'Failed to fetch subscription plans'
      return []
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching plans'
      console.error('Error fetching plans:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  const fetchPlanById = async (planId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await subscriptionsApi.getPlanById(planId)

      if (response.success) {
        const normalizedPlan = normalizePlan(response.data) || response.data
        selectedPlan.value = normalizedPlan

        // Update in plans array if exists
        const index = plans.value.findIndex(p => p.id === planId)
        if (index !== -1) {
          plans.value[index] = normalizedPlan
        } else {
          plans.value.push(normalizedPlan)
        }
      } else {
        error.value = response.message || 'Failed to fetch plan details'
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching plan details'
      console.error('Error fetching plan:', err)
    } finally {
      isLoading.value = false
    }
  }

  const setSelectedPlan = (plan: SubscriptionPlan | null) => {
    selectedPlan.value = plan
  }

  const fetchActiveSubscription = async (userId: string) => {
    isLoadingActiveSubscription.value = true
    error.value = null

    try {
      const response = await subscriptionsApi.getActiveSubscription(userId)

      if (response.success && response.data) {
        activeSubscriptionContext.value = response.data
        activeSubscription.value = normalizeActiveSubscription(response.data)
        return activeSubscription.value
      } else {
        error.value = response.message || 'Failed to fetch active subscription'
        activeSubscriptionContext.value = null
        activeSubscription.value = null
        return null
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching active subscription'
      console.error('Error fetching active subscription:', err)
      activeSubscriptionContext.value = null
      activeSubscription.value = null
      return null
    } finally {
      isLoadingActiveSubscription.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const upgradeSubscription = async (payload: UpgradePayload) => {
    isUpgrading.value = true
    error.value = null
    paymentInfo.value = null

    try {
      const response = await subscriptionsApi.upgradeSubscription(payload)

      if (response.success && response.data) {
        paymentInfo.value = response.data.payment
        return response.data
      } else {
        error.value = response.message || 'Failed to upgrade subscription'
        return null
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while upgrading subscription'
      console.error('Error upgrading subscription:', err)
      return null
    } finally {
      isUpgrading.value = false
    }
  }

  const pollPaymentStatus = async (
    checkoutRequestId: string,
    maxAttempts: number = 24, // 2 minutes with 5-second intervals
    interval: number = 5000,
    onTick?: (remainingSeconds: number) => void
  ): Promise<'COMPLETED' | 'TIMEOUT'> => {
    let attempts = 0
    const totalSeconds = (maxAttempts * interval) / 1000

    return new Promise((resolve) => {
      const poll = async () => {
        try {
          attempts++
          const remainingSeconds = Math.ceil(((maxAttempts - attempts) * interval) / 1000)

          // Call the tick callback with remaining seconds
          if (onTick) {
            onTick(remainingSeconds)
          }

          const response = await subscriptionsApi.getPaymentStatus(checkoutRequestId)

          if (response.status === 'COMPLETED') {
            resolve('COMPLETED')
            return
          }

          // Continue polling even if FAILED, until timeout
          // Continue polling if within max attempts
          if (attempts < maxAttempts) {
            setTimeout(poll, interval)
          } else {
            resolve('TIMEOUT')
          }
        } catch (err) {
          console.error('Error polling payment status:', err)
          if (attempts < maxAttempts) {
            setTimeout(poll, interval)
          } else {
            resolve('TIMEOUT')
          }
        }
      }

      poll()
    })
  }

  const purchaseAddonSessions = async (payload: AddonPurchasePayload) => {
    isUpgrading.value = true
    error.value = null
    paymentInfo.value = null

    try {
      const response = await subscriptionsApi.purchaseAddonSessions(payload)

      if (response.success && response.data) {
        paymentInfo.value = response.data.payment
        return response.data
      } else {
        error.value = response.message || 'Failed to purchase addon sessions'
        return null
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while purchasing addon sessions'
      console.error('Error purchasing addon sessions:', err)
      return null
    } finally {
      isUpgrading.value = false
    }
  }

  const initiateCyberSourcePayment = async (payload: any) => {
    isUpgrading.value = true
    error.value = null

    try {
      const response = await subscriptionsApi.initiateCyberSourcePayment(payload)

      if (response.success && response.data) {
        return response
      } else {
        error.value = response.message || 'Failed to initiate card payment'
        return null
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while initiating card payment'
      console.error('Error initiating CyberSource payment:', err)
      return null
    } finally {
      isUpgrading.value = false
    }
  }

  const renewNow = async (userId: string): Promise<RenewNowData | null> => {
    isUpgrading.value = true
    error.value = null

    try {
      const response = await subscriptionsApi.renewNow({ userId })
      if (!response.success || !response.data) {
        error.value = response.message || 'Failed to initiate renewal'
        return null
      }

      if (response.data.renewed) {
        await fetchActiveSubscription(userId)
      }
      return response.data
    } catch (err: any) {
      error.value = err?.response?.data?.message || err.message || 'An error occurred while renewing subscription'
      console.error('Error renewing subscription:', err)
      return null
    } finally {
      isUpgrading.value = false
    }
  }

  const updateAutoRenewPreference = async (userId: string, autoRenew: boolean): Promise<boolean> => {
    isUpgrading.value = true
    error.value = null

    try {
      const response = await subscriptionsApi.updateAutoRenew({ userId, autoRenew })
      if (!response.success || !response.data) {
        error.value = response.message || 'Failed to update auto-renew preference'
        return false
      }

      if (activeSubscription.value && activeSubscription.value.id === response.data.id) {
        activeSubscription.value = response.data
      } else {
        await fetchActiveSubscription(userId)
      }
      return true
    } catch (err: any) {
      error.value = err?.response?.data?.message || err.message || 'An error occurred while updating auto-renew preference'
      console.error('Error updating auto-renew preference:', err)
      return false
    } finally {
      isUpgrading.value = false
    }
  }

  const cancelActiveSubscription = async (userId: string): Promise<boolean> => {
    isUpgrading.value = true
    error.value = null

    try {
      const response = await subscriptionsApi.cancelSubscription(userId)
      if (!response.success) {
        error.value = response.message || 'Failed to cancel subscription'
        return false
      }

      await fetchActiveSubscription(userId)
      return true
    } catch (err: any) {
      error.value = err?.response?.data?.message || err.message || 'An error occurred while cancelling subscription'
      console.error('Error cancelling subscription:', err)
      return false
    } finally {
      isUpgrading.value = false
    }
  }

  const resetSubscriptions = () => {
    plans.value = []
    selectedPlan.value = null
    activeSubscription.value = null
    activeSubscriptionContext.value = null
    error.value = null
    isLoading.value = false
    isLoadingActiveSubscription.value = false
    isUpgrading.value = false
    paymentInfo.value = null
  }

  return {
    // State
    plans,
    selectedPlan,
    activeSubscription,
    activeSubscriptionContext,
    isLoading,
    isLoadingActiveSubscription,
    isUpgrading,
    error,
    paymentInfo,

    // Computed
    activePlans,
    getPlanByCode,
    getPlanById,

    // Actions
    fetchPlans,
    fetchPlansForAudience,
    fetchPlanById,
    fetchActiveSubscription,
    setSelectedPlan,
    upgradeSubscription,
    purchaseAddonSessions,
    initiateCyberSourcePayment,
    renewNow,
    updateAutoRenewPreference,
    cancelActiveSubscription,
    pollPaymentStatus,
    clearError,
    resetSubscriptions
  }
})
