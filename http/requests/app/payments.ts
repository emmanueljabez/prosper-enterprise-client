import api from '@/http/axios'

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
export type PaymentMethod = 'MPESA' | 'CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'FREE'
export type PaymentType = 'SESSION_BOOKING' | 'SUBSCRIPTION' | 'UPGRADE' | 'ADDON' | 'TOP_UP' | 'REFUND' | 'INVOICE'

export interface PaymentRecord {
  id: string
  payerId: string
  recipientId: string
  userId: string
  sessionId?: string | null
  subscriptionId?: string | null
  invoiceId?: string | null
  companyId?: string | null
  paymentType: PaymentType
  amount: number
  currency: string
  phoneNumber?: string | null
  checkoutRequestId?: string | null
  merchantRequestId?: string | null
  mpesaReceiptNumber?: string | null
  transactionDate?: string | null
  status: PaymentStatus
  paymentMethod: PaymentMethod
  description?: string | null
  resultDescription?: string | null
  resultCode?: number | null
  retryCount?: number
  errorMessage?: string | null
  metadata?: string | Record<string, unknown> | null
  gatewayTransactionId?: string | null
  gatewayReference?: string | null
  gatewayAuthCode?: string | null
  cardType?: string | null
  cardLastFour?: string | null
  createdAt: string
  updatedAt?: string | null
  completedAt?: string | null
}

export interface PaymentsListData {
  payments: PaymentRecord[]
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrevious: boolean
  filters?: Record<string, unknown>
}

export interface PaymentsListResponse {
  success: boolean
  message?: string
  data: PaymentsListData
}

export interface GetPaymentsParams {
  userId?: string
  status?: PaymentStatus
  paymentMethod?: PaymentMethod
  paymentType?: PaymentType
  companyId?: string
  invoiceId?: string
  sessionId?: string
  subscriptionId?: string
  search?: string
  page?: number
  size?: number
}

export const paymentsApi = {
  async getPayments(params: GetPaymentsParams = {}): Promise<PaymentsListResponse> {
    const { data } = await api.get('/v1/payments', { params })
    return data
  },
}

export default paymentsApi
