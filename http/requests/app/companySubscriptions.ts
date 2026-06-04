import api from '@/http/axios'
import type { BillingInterval } from '@/http/requests/app/subscriptions'

export interface CompanySessionWalletSummary {
  walletId: string
  companySubscriptionId: string
  companyId: string
  pricePerSession: number | string
  sessionsPurchased: number
  sessionsAllocated: number
  sessionsReturned: number
  sessionsAvailable: number
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CompanySubscriptionSummary {
  id: string
  companyId: string
  companyName?: string | null
  planId?: string | null
  planName?: string | null
  billingInterval?: BillingInterval
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED'
  seatsPurchased?: number
  activeSeats?: number
  availableSeats?: number
  autoRenew: boolean
  createdByUserId?: string | null
  latestInvoiceId?: string | null
  startDate?: string | null
  endDate?: string | null
  currentPeriodStart?: string | null
  currentPeriodEnd?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  latestInvoice?: {
    invoiceId: string
    invoiceNumber: string
    publicToken?: string | null
    status: string
    sessionCount?: number | null
    paymentUrl?: string | null
  } | null
  wallet?: CompanySessionWalletSummary | null
  members?: CompanySubscriptionMember[]
}

export interface CompanySubscriptionMember {
  id: string
  profileId: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  status: 'ACTIVE' | 'REVOKED'
  sessionsUsed: number
  remainingSessions: number
  assignedAt?: string | null
  revokedAt?: string | null
  assignedByUserId?: string | null
  companySubscriptionId: string
}

export interface CompanySubscriptionInvoiceResponse {
  companySubscription: CompanySubscriptionSummary
  invoiceId: string
  invoiceNumber: string
  publicToken: string
  paymentUrl: string
  amount: number
  currency: string
  sessionCount?: number
  pricePerSession?: number | string | null
  changeType?: string | null
}

export interface CompanyBillingWalletMetrics {
  pricePerSession: number | string
  currency: string
  sessionsPurchased: number
  sessionsAllocated: number
  sessionsReturned: number
  sessionsReserved: number
  sessionsAvailable: number
  sessionsUsed: number
  capacityPercent: number
  availableBalance: number | string
  usedBalance: number | string
  availableBalanceUsd: number | string
  balanceChangePercent: number | string
}

export interface CompanyBillingProjectedUsage {
  windowDays: number
  sessionsInWindow: number
  projectedSessions: number
  projectedSpend: number | string
  activeEmployees: number
}

export interface CompanyBillingAutoRefill {
  enabled: boolean
  triggerSessions: number
  triggerAmount: number | string
  topUpSessions: number
  topUpAmount: number | string
  currency: string
}

export interface CompanyBillingTransaction {
  id: string
  transactionId: string
  date: string
  description: string
  amount: number | string
  currency: string
  status: string
  paymentType?: string | null
  paymentMethod?: string | null
  reference?: string | null
  invoiceId?: string | null
  invoiceNumber?: string | null
  invoiceStatus?: string | null
  invoiceUrl?: string | null
}

export interface CompanyBillingTransactionsPagination {
  page: number
  size: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface CompanyBillingTrendPoint {
  month: string
  label: string
  sessions: number
  amount: number | string
}

export interface CompanyBillingDepartmentAllocation {
  department: string
  sessions: number
  amount: number | string
  percentage: number
}

export interface CompanyBillingDashboardData {
  companyId: string
  companyName: string
  subscription: CompanySubscriptionSummary | null
  wallet: CompanyBillingWalletMetrics
  projectedUsage: CompanyBillingProjectedUsage
  autoRefill: CompanyBillingAutoRefill
  recentTransactions: CompanyBillingTransaction[]
  recentTransactionsPagination: CompanyBillingTransactionsPagination
  monthlySpendTrend: CompanyBillingTrendPoint[]
  departmentAllocation: CompanyBillingDepartmentAllocation[]
  snapshotAt?: string | null
}

export interface CompanyBillingDashboardResponse {
  success: boolean
  message: string
  data: CompanyBillingDashboardData
}

export default {
  async createCompanySubscription(payload: {
    companyId: string
    planId: string
    sessionCount?: number
    seatCount?: number
    billingInterval?: BillingInterval
    redirectSuccessUrl?: string
    redirectCancelUrl?: string
  }): Promise<{ success: boolean; message: string; data: CompanySubscriptionInvoiceResponse | null }> {
    const normalizedPayload = {
      ...payload,
      sessionCount: payload.sessionCount ?? payload.seatCount,
      // Backward compatibility: older corporate billing validators still require
      // seatCount even though the product model now treats this as session count.
      seatCount: payload.seatCount ?? payload.sessionCount,
    }
    const { data } = await api.post('/v1/company-subscriptions', normalizedPayload)
    return data
  },

  async getCompanySubscriptions(companyId: string): Promise<{ success: boolean; message: string; data: CompanySubscriptionSummary[] }> {
    const { data } = await api.get(`/v1/company-subscriptions/company/${companyId}`)
    return data
  },

  async getCompanySubscription(companySubscriptionId: string): Promise<{ success: boolean; message: string; data: CompanySubscriptionSummary }> {
    const { data } = await api.get(`/v1/company-subscriptions/${companySubscriptionId}`)
    return data
  },

  async getMembers(companySubscriptionId: string): Promise<{ success: boolean; message: string; data: CompanySubscriptionMember[] }> {
    const { data } = await api.get(`/v1/company-subscriptions/${companySubscriptionId}/members`)
    return data
  },

  async assignSeat(companySubscriptionId: string, profileId: string): Promise<{ success: boolean; message: string; data: { member: CompanySubscriptionMember; subscription: CompanySubscriptionSummary } | null }> {
    const { data } = await api.post(`/v1/company-subscriptions/${companySubscriptionId}/members`, { profileId })
    return data
  },

  async revokeSeat(companySubscriptionId: string, profileId: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/v1/company-subscriptions/${companySubscriptionId}/members/${profileId}`)
    return data
  },

  async renew(companySubscriptionId: string, payload?: {
    billingInterval?: BillingInterval
    redirectSuccessUrl?: string
    redirectCancelUrl?: string
  }): Promise<{ success: boolean; message: string; data: CompanySubscriptionInvoiceResponse | null }> {
    const { data } = await api.post(`/v1/company-subscriptions/${companySubscriptionId}/renew`, payload || {})
    return data
  },

  async getCompanyBillingDashboard(companyId: string, params?: {
    page?: number
    size?: number
  }): Promise<CompanyBillingDashboardResponse> {
    const { data } = await api.get(`/v1/company-subscriptions/company/${companyId}/billing-dashboard`, { params })
    return data
  },

  async updateAutoRenew(companySubscriptionId: string, autoRenew: boolean): Promise<{
    success: boolean
    message: string
    data: CompanySubscriptionSummary
  }> {
    const { data } = await api.patch(`/v1/company-subscriptions/${companySubscriptionId}/auto-renew`, { autoRenew })
    return data
  },
}
