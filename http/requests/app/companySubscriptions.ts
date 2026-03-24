import api from '@/http/axios'
import type { BillingInterval } from '@/http/requests/app/subscriptions'

export interface CompanySubscriptionSummary {
  id: string
  companyId: string
  companyName?: string | null
  planId?: string | null
  planName?: string | null
  billingInterval?: BillingInterval
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED'
  seatsPurchased: number
  activeSeats: number
  availableSeats: number
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
    status: string
    paymentUrl?: string | null
  } | null
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
}

export default {
  async createCompanySubscription(payload: {
    companyId: string
    planId: string
    seatCount: number
    billingInterval?: BillingInterval
    redirectSuccessUrl?: string
    redirectCancelUrl?: string
  }): Promise<{ success: boolean; message: string; data: CompanySubscriptionInvoiceResponse | null }> {
    const { data } = await api.post('/v1/company-subscriptions', payload)
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
}
