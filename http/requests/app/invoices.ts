import api from '@/http/axios'
import type { BillingInterval } from '@/http/requests/app/subscriptions'

export type InvoiceStatus = 'DRAFT' | 'OPEN' | 'PAID' | 'EXPIRED' | 'VOID' | 'FAILED'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
export type PaymentMethod = 'MPESA' | 'CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'FREE'

export interface PublicInvoiceLatestPayment {
  paymentId: string
  status: PaymentStatus
  paymentMethod: PaymentMethod
  checkoutRequestId: string | null
  gatewayTransactionId: string | null
  gatewayReference: string | null
  createdAt: string
  completedAt: string | null
}

export interface PublicInvoice {
  id: string
  publicToken: string
  invoiceNumber: string
  amount: number
  currency: string
  companyId?: string | null
  status: InvoiceStatus
  description: string | null
  metadata: Record<string, unknown> | null
  redirectSuccessUrl: string | null
  redirectCancelUrl: string | null
  expiresAt: string | null
  paidAt: string | null
  createdAt: string
  isPayable: boolean
  paymentUrl: string
  latestPayment: PublicInvoiceLatestPayment | null
}

export interface PublicInvoiceResponse {
  success: boolean
  message?: string
  data: PublicInvoice
}

export interface UserInvoicesResponse {
  success: boolean
  message?: string
  data: PublicInvoice[]
}

export interface CompanyInvoicesResponse {
  success: boolean
  message?: string
  data: PublicInvoice[]
}

export interface InvoicePaymentRequest {
  method: 'MPESA' | 'CARD'
  phoneNumber?: string
  returnUrl?: string
  cancelUrl?: string
}

export interface MpesaInvoicePaymentData {
  method: 'MPESA'
  paymentId: string
  checkoutRequestId: string
  status: PaymentStatus
  invoiceStatus: InvoiceStatus
}

export interface CardInvoicePaymentData {
  method: 'CARD'
  paymentId: string
  status: PaymentStatus
  invoiceStatus: InvoiceStatus
  cybersourceEndpoint: string
  cybersourceParams: Record<string, string>
  transactionId: string
  referenceNumber: string
}

export interface InvoicePaymentResponse {
  success: boolean
  message: string
  data: MpesaInvoicePaymentData | CardInvoicePaymentData
}

export interface CreateInvoiceRequest {
  payerUserId: string
  amount: number
  currency?: string
  description?: string
  metadata?: Record<string, unknown>
  redirectSuccessUrl?: string
  redirectCancelUrl?: string
  expiresAt?: string
}

export interface CreateInvoiceResponse {
  success: boolean
  message: string
  data: {
    invoiceId: string
    invoiceNumber: string
    publicToken: string
    status: InvoiceStatus
    amount: number
    currency: string
    paymentUrl: string
    expiresAt: string | null
  }
}

export interface PlanInvoiceQuoteRequest {
  userId: string
  planId: string
  billingInterval?: BillingInterval
}

export interface AddonInvoiceQuoteRequest {
  userId: string
  quantity: number
}

export type InvoiceQuoteContext = 'PLAN_PURCHASE' | 'PLAN_UPGRADE' | 'SESSION_ADDON'

export interface InvoiceQuoteData {
  context: InvoiceQuoteContext
  amount: number
  currency: string
  description: string
  requiresPayment?: boolean
  billingInterval?: BillingInterval
  currentBillingInterval?: BillingInterval | null
  userId: string
  planId?: string
  planName?: string
  subscriptionId?: string | null
  currentPlanId?: string | null
  quantity?: number
  costPerSession?: number
}

export interface InvoiceQuoteResponse {
  success: boolean
  message: string
  data: InvoiceQuoteData
}

export const invoicesApi = {
  async createInvoice(payload: CreateInvoiceRequest): Promise<CreateInvoiceResponse> {
    const { data } = await api.post('/v1/invoices', payload)
    return data
  },

  async quotePlanInvoice(payload: PlanInvoiceQuoteRequest): Promise<InvoiceQuoteResponse> {
    const { data } = await api.post('/v1/invoices/quotes/plan', payload)
    return data
  },

  async quoteAddonInvoice(payload: AddonInvoiceQuoteRequest): Promise<InvoiceQuoteResponse> {
    const { data } = await api.post('/v1/invoices/quotes/addon', payload)
    return data
  },

  async getPublicInvoice(publicToken: string): Promise<PublicInvoiceResponse> {
    const { data } = await api.get(`/v1/invoices/public/${publicToken}`)
    return data
  },

  async getPublicInvoiceStatus(publicToken: string): Promise<PublicInvoiceResponse> {
    const { data } = await api.get(`/v1/invoices/public/${publicToken}/status`)
    return data
  },

  async payPublicInvoice(publicToken: string, payload: InvoicePaymentRequest): Promise<InvoicePaymentResponse> {
    const { data } = await api.post(`/v1/invoices/public/${publicToken}/pay`, payload)
    return data
  },

  async getUserInvoices(userId: string): Promise<UserInvoicesResponse> {
    const { data } = await api.get(`/v1/invoices/user/${userId}`)
    return data
  },

  async getCompanyInvoices(companyId: string): Promise<CompanyInvoicesResponse> {
    const { data } = await api.get(`/v1/invoices/company/${companyId}`)
    return data
  }
}

export default invoicesApi
