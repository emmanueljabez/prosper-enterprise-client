import api from '@/http/axios'

export type BillingInterval = 'MONTHLY' | 'ANNUAL'

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
  features: string[] | string | null
  billingType: 'RECURRING' | 'ONE_TIME'
  yearlyCost: number | null
  allowsAddons: boolean
  addonSessionCost: number | null
  planAudience?: 'INDIVIDUAL' | 'CORPORATE' | 'BOTH'
  sessionDurationMinutes?: number | null
  minSeats?: number
  defaultSeats?: number
  maxSeats?: number | null
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
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED' | 'TRIAL'
  billingInterval: BillingInterval
  autoRenew: boolean
  autoRenewCardOnFile?: boolean
  autoRenewCardType?: string | null
  autoRenewCardLastFour?: string | null
  autoRenewTokenizedAt?: string | null
  autoRenewLastChargeAt?: string | null
  autoRenewLastFailureReason?: string | null
  isTrial: boolean
  createdAt: string
  updatedAt: string
  active: boolean
  remainingSessionsCount: number
  expired: boolean
}

export interface ActiveSubscriptionData {
  subscriptionSource?: 'INDIVIDUAL' | 'CORPORATE' | 'PERSONAL_CREDIT'
  subscription?: ActiveSubscription | null
  companySubscription?: {
    id: string
    company?: {
      id: string
      name?: string | null
    } | null
    plan: SubscriptionPlan
    billingInterval?: BillingInterval
    seatsPurchased: number
    status: 'PENDING_PAYMENT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED'
    startDate: string | null
    endDate: string | null
    currentPeriodStart: string | null
    currentPeriodEnd: string | null
    autoRenew: boolean
    createdByUserId?: string | null
    createdAt?: string | null
    updatedAt?: string | null
  } | null
  corporateSeat?: {
    memberId: string
    sessionsUsed: number
    profileId?: string | null
  } | null
  remainingSessions: number
  addonSessionsRemaining?: number
  personalCreditsRemaining?: number
  sessionDurationMinutes?: number | null
  canBookSession: boolean
  nextBillingDate?: string | null
  companyId?: string | null
  companySubscriptionId?: string | null
  message?: string
  reason?: string
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
  billingInterval?: BillingInterval
}

export interface CreateSubscriptionPayload {
  userId: string
  planId: string
  isTrial?: boolean
  phoneNumber?: string
  currency?: string
  billingInterval?: BillingInterval
}

export interface SubscriptionCreationData {
  subscription: ActiveSubscription
  payment: PaymentInfo | null
  requiresPayment: boolean
}

export interface SubscriptionCreationResponse {
  success: boolean
  message: string
  data: SubscriptionCreationData | null
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

export interface RenewNowPayload {
  userId: string
}

export interface RenewNowData {
  chargedAutomatically: boolean
  invoiceId: string | null
  invoiceNumber: string | null
  paymentUrl: string | null
  paymentId: string | null
  transactionId: string | null
  renewed: boolean
  requiresManualPayment: boolean
}

export interface RenewNowResponse {
  success: boolean
  message: string
  data: RenewNowData | null
}

export interface AutoRenewPayload {
  userId: string
  autoRenew: boolean
}

export interface AutoRenewResponse {
  success: boolean
  message: string
  data: ActiveSubscription | null
}

export interface CancelSubscriptionResponse {
  success: boolean
  message: string
  data: null
}

export interface SessionData {
  id: string
  mentorId: string
  menteeId: string
  skillId: string
  title: string
  description: string
  scheduledStart: string
  scheduledEnd: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  meetingPlatform: string
  meetingUrl: string | null
  meetingId: string | null
  meetingPassword: string | null
  notes: string | null
  rating: number | null
  feedback: string | null
  price: number | null
  currency: string
  paymentStatus: string
  paid: boolean
  reminderSent: boolean
  menteeMessage: string | null
  mentorResponse: string | null
  calendarEventId: string | null
  confirmedAt: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  cancelledBy: string | null
  menteeNotificationSent: boolean
  mentorNotificationSent: boolean
  mentor: any | null
  mentee: any | null
  skill: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  } | null
  createdAt: string
  updatedAt: string
  futureSession: boolean
  durationMinutes: number
}

export interface MenteeSessionsResponse {
  success: boolean
  message: string
  data: {
    filter: string
    sessions: SessionData[]
    totalSessions: number
    totalPages: number
    hasPrevious: boolean
    hasNext: boolean
    currentPage: number
  }
}

export const subscriptionsApi = {
  /**
   * Get all subscription plans
   */
  async getPlans(audience?: 'INDIVIDUAL' | 'CORPORATE' | 'BOTH'): Promise<SubscriptionPlansResponse> {
    const { data } = await api.get('/v1/subscriptions/plans', {
      params: audience ? { audience } : undefined,
    })
    return data
  },

  /**
   * Get mentee sessions with filtering and pagination
   */
  async getMenteeSessions(params: {
    menteeId: string
    filter: 'all' | 'today' | 'upcoming' | 'past'
    page: number
    size: number
  }): Promise<MenteeSessionsResponse> {
    const { data } = await api.get('/v1/subscriptions/mentee/sessions', {
      params
    })
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
   * Create or activate a subscription directly.
   */
  async createSubscription(payload: CreateSubscriptionPayload): Promise<SubscriptionCreationResponse> {
    const { data } = await api.post('/v1/subscriptions', payload)
    return data
  },

  /**
   * Apply a plan change immediately when no payment is required.
   */
  async applyPlanChange(payload: {
    userId: string
    planId: string
    billingInterval?: BillingInterval
  }): Promise<{
    success: boolean
    message: string
    data: ActiveSubscription | null
  }> {
    const { data } = await api.post('/v1/subscriptions/apply-plan', payload)
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
  },

  /**
   * Initiate CyberSource card payment
   */
  async initiateCyberSourcePayment(payload: any): Promise<any> {
    const { data } = await api.post('/v1/payments/cybersource/initiate', payload)
    return data
  },

  /**
   * Trigger invoice-first subscription renewal
   */
  async renewNow(payload: RenewNowPayload): Promise<RenewNowResponse> {
    const { data } = await api.post('/v1/subscriptions/renew-now', payload)
    return data
  },

  /**
   * Update subscription auto-renew preference
   */
  async updateAutoRenew(payload: AutoRenewPayload): Promise<AutoRenewResponse> {
    const { data } = await api.patch('/v1/subscriptions/auto-renew', payload)
    return data
  },

  /**
   * Cancel active subscription
   */
  async cancelSubscription(userId: string): Promise<CancelSubscriptionResponse> {
    const { data } = await api.delete('/v1/subscriptions/cancel', {
      data: { userId }
    })
    return data
  }
}

export default subscriptionsApi
