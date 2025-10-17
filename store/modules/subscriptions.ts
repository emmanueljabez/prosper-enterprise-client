import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import subscriptionsApi, {
  type SubscriptionPlan,
  type ActiveSubscription,
  type UpgradePayload,
  type PaymentInfo,
  type AddonPurchasePayload
} from '@/http/requests/app/subscriptions'

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  // State
  const plans = ref<SubscriptionPlan[]>([])
  const selectedPlan = ref<SubscriptionPlan | null>(null)
  const activeSubscription = ref<ActiveSubscription | null>(null)
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
  const fetchPlans = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await subscriptionsApi.getPlans()

      if (response.success) {
        plans.value = response.data
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

  const fetchPlanById = async (planId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await subscriptionsApi.getPlanById(planId)

      if (response.success) {
        selectedPlan.value = response.data

        // Update in plans array if exists
        const index = plans.value.findIndex(p => p.id === planId)
        if (index !== -1) {
          plans.value[index] = response.data
        } else {
          plans.value.push(response.data)
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
        // Extract the subscription from the nested data structure
        activeSubscription.value = response.data.subscription
        return response.data.subscription
      } else {
        error.value = response.message || 'Failed to fetch active subscription'
        activeSubscription.value = null
        return null
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching active subscription'
      console.error('Error fetching active subscription:', err)
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

  const resetSubscriptions = () => {
    plans.value = []
    selectedPlan.value = null
    activeSubscription.value = null
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
    fetchPlanById,
    fetchActiveSubscription,
    setSelectedPlan,
    upgradeSubscription,
    purchaseAddonSessions,
    pollPaymentStatus,
    clearError,
    resetSubscriptions
  }
})
