import api from '@/http/axios'

export interface Feature {
  id: string
  name: string
  code: string
  description: string | null
  type: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PlanFeature {
  id: string
  feature: Feature
  limitValue: number
  enabled: boolean
  metadata: any | null
  createdAt: string
  available: boolean
  unlimited: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  code: string
  description: string
  cost: number
  currency: string
  sessionsPerPeriod: number
  durationMonths: number
  isActive: boolean
  displayOrder: number
  features: string[] | null
  billingType: 'RECURRING' | 'ONE_TIME'
  yearlyCost: number | null
  allowsAddons: boolean
  addonSessionCost: number | null
  planFeatures: PlanFeature[]
  createdAt: string
  updatedAt: string
  formattedPrice: string
  unlimited: boolean
  free: boolean
}

export interface SubscriptionPlansResponse {
  success: boolean
  message: string
  data: SubscriptionPlan[]
}

export interface ActiveSubscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  sessionsPerMonth: number
  sessionsUsed: number
  startDate: string
  endDate: string
  currentPeriodStart: string
  currentPeriodEnd: string
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING'
  autoRenew: boolean
  isTrial: boolean
  createdAt: string
  updatedAt: string
  active: boolean
  remainingSessionsCount: number
  expired: boolean
}

export interface ActiveSubscriptionData {
  subscription: ActiveSubscription
  remainingSessions: number
  canBookSession: boolean
}

export interface ActiveSubscriptionResponse {
  success: boolean
  message: string
  data: ActiveSubscriptionData | null
}

export interface PaymentInfo {
  paymentId: string
  checkoutRequestId: string
  amount: string
  currency: string
  phoneNumber: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  description: string
}

export interface UpgradePayload {
  userId: string
  newPlanId: string
  phoneNumber: string
}

export interface UpgradeResponse {
  success: boolean
  message: string
  data: {
    subscription: ActiveSubscription
    payment: PaymentInfo
    proratedAmount: number
    message: string
  }
}

export interface PaymentStatusData {
  id: string
  payerId: string
  recipientId: string
  userId: string
  sessionId: string | null
  subscriptionId: string | null
  paymentType: string
  amount: number
  currency: string
  phoneNumber: string
  checkoutRequestId: string
  merchantRequestId: string
  mpesaReceiptNumber: string | null
  transactionDate: string | null
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  paymentMethod: string
  description: string
  resultDescription: string | null
  resultCode: number | null
  retryCount: number
  errorMessage: string | null
  metadata: any | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
  completed: boolean
}

export interface PaymentStatusResponse {
  success: boolean
  payment: PaymentStatusData
  mpesaReceiptNumber: string | null
  transactionDate: string | null
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  isCompleted: boolean
}

export interface AddonPurchasePayload {
  userId: string
  quantity: number
  phoneNumber: string
}

export interface AddonPurchaseData {
  id: string
  subscription: ActiveSubscription
  addonType: string
  addonName: string
  quantity: number
  used: number
  totalCost: number
  currency: string
  purchasedAt: string
  expiresAt: string
  status: string
  paymentId: string
  createdAt: string
  updatedAt: string
  active: boolean
  remaining: number
  expired: boolean
}

export interface AddonPurchaseResponse {
  success: boolean
  message: string
  data: {
    addon: AddonPurchaseData
    payment: PaymentInfo
  }
}

export const subscriptionsApi = {
  /**
   * Get all subscription plans
   */
  async getPlans(): Promise<SubscriptionPlansResponse> {
    const { data } = await api.get('/v1/subscriptions/plans')
    return data
  },

  /**
   * Get a single plan by ID
   */
  async getPlanById(planId: string): Promise<{
    success: boolean
    message: string
    data: SubscriptionPlan
  }> {
    const { data } = await api.get(`/v1/subscriptions/plans/${planId}`)
    return data
  },

  /**
   * Get user's active subscription
   */
  async getActiveSubscription(userId: string): Promise<ActiveSubscriptionResponse> {
    const { data } = await api.get('/v1/subscriptions/active', {
      params: { userId }
    })
    return data
  },

  /**
   * Upgrade subscription plan
   */
  async upgradeSubscription(payload: UpgradePayload): Promise<UpgradeResponse> {
    const { data } = await api.put('/v1/subscriptions/upgrade', payload)
    return data
  },

  /**
   * Get payment status by checkout request ID
   */
  async getPaymentStatus(checkoutRequestId: string): Promise<PaymentStatusResponse> {
    const { data } = await api.get(`/v1/payments/status/${checkoutRequestId}`)
    return data
  },

  /**
   * Purchase addon sessions
   */
  async purchaseAddonSessions(payload: AddonPurchasePayload): Promise<AddonPurchaseResponse> {
    const { data } = await api.post('/v1/subscriptions/addons/purchase', payload)
    return data
  }
}

export default subscriptionsApi
