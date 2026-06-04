import { defineStore } from 'pinia'
import companySubscriptionsApi, {
  type CompanyBillingDashboardData,
  type CompanyBillingTrendPoint,
  type CompanyBillingTransaction,
  type CompanySubscriptionSummary,
} from '~/http/requests/app/companySubscriptions'
import paymentsApi, { type PaymentRecord } from '~/http/requests/app/payments'
import invoicesApi, { type PublicInvoice } from '~/http/requests/app/invoices'

type BillingDashboardQueryParams = {
  page?: number
  size?: number
}

interface CompanyBillingState {
  isLoading: boolean
  isCreatingTopUpInvoice: boolean
  isUpdatingAutoRefill: boolean
  error: string | null
  dashboard: CompanyBillingDashboardData | null
  lastParams: Required<BillingDashboardQueryParams>
}

const defaultParams: Required<BillingDashboardQueryParams> = {
  page: 0,
  size: 10,
}

const LEGACY_DASHBOARD_FALLBACK_STATUS = 404
const USD_EXCHANGE_RATE = 133
const BILLING_TREND_MONTHS = 6

const toNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalizeCurrency = (value?: string | null) => {
  const trimmed = String(value || '').trim()
  return trimmed ? trimmed.toUpperCase() : 'KES'
}

const resolvePrimarySubscription = (subscriptions: CompanySubscriptionSummary[]) => {
  if (!subscriptions.length) return null

  return subscriptions.find(subscription => subscription.status === 'ACTIVE')
    || subscriptions.find(subscription => subscription.status === 'PENDING_PAYMENT')
    || subscriptions[0]
}

const buildTransactionCode = (id?: string | null) => {
  const raw = String(id || '').replace(/-/g, '').toUpperCase()
  if (!raw) return 'TX-UNKNOWN'
  return `TX-${raw.slice(0, 8)}`
}

const resolvePaymentDescription = (payment: PaymentRecord) => {
  if (payment.description) return payment.description

  switch (payment.paymentType) {
    case 'TOP_UP':
      return 'Wallet top-up'
    case 'SUBSCRIPTION':
      return 'Subscription payment'
    case 'INVOICE':
      return 'Invoice payment'
    case 'SESSION_BOOKING':
      return 'Mentoring session charge'
    case 'UPGRADE':
      return 'Plan upgrade'
    case 'ADDON':
      return 'Plan add-on'
    case 'REFUND':
      return 'Refund'
    default:
      return 'Corporate wallet transaction'
  }
}

const buildMonthlySpendTrendFromInvoices = (invoices: PublicInvoice[]): CompanyBillingTrendPoint[] => {
  const monthTotals = new Map<string, number>()
  const now = new Date()

  for (let i = BILLING_TREND_MONTHS - 1; i >= 0; i -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
    monthTotals.set(key, 0)
  }

  for (const invoice of invoices) {
    if (!invoice?.createdAt) continue
    const date = new Date(invoice.createdAt)
    if (Number.isNaN(date.getTime())) continue

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthTotals.has(key)) continue

    monthTotals.set(key, monthTotals.get(key)! + toNumber(invoice.amount))
  }

  return Array.from(monthTotals.entries()).map(([month, amount]) => {
    const monthDate = new Date(`${month}-01T00:00:00`)
    return {
      month,
      label: monthDate.toLocaleDateString('en-KE', { month: 'short' }).toUpperCase(),
      sessions: 0,
      amount,
    }
  })
}

const buildTransactions = (payments: PaymentRecord[], invoicesById: Map<string, PublicInvoice>): CompanyBillingTransaction[] => {
  return payments.map((payment) => {
    const invoice = payment.invoiceId ? invoicesById.get(payment.invoiceId) : undefined
    const transactionCode = buildTransactionCode(payment.id)
    const reference = payment.gatewayReference
      || payment.mpesaReceiptNumber
      || payment.checkoutRequestId
      || transactionCode

    return {
      id: payment.id,
      transactionId: transactionCode,
      date: payment.createdAt,
      description: resolvePaymentDescription(payment),
      amount: payment.amount,
      currency: normalizeCurrency(payment.currency),
      status: payment.status || 'PENDING',
      paymentType: payment.paymentType,
      paymentMethod: payment.paymentMethod,
      reference,
      invoiceId: payment.invoiceId || null,
      invoiceNumber: invoice?.invoiceNumber || null,
      invoiceStatus: invoice?.status || null,
      invoiceUrl: invoice?.paymentUrl || null,
    }
  })
}

export const useCompanyBillingStore = defineStore('company-billing', {
  state: (): CompanyBillingState => ({
    isLoading: false,
    isCreatingTopUpInvoice: false,
    isUpdatingAutoRefill: false,
    error: null,
    dashboard: null,
    lastParams: { ...defaultParams },
  }),

  actions: {
    async loadLegacyCompanyBillingDashboard(companyId: string) {
      const [subscriptionsResponse, paymentsResponse, invoicesResponse] = await Promise.all([
        companySubscriptionsApi.getCompanySubscriptions(companyId),
        paymentsApi.getPayments({
          companyId,
          page: this.lastParams.page,
          size: this.lastParams.size,
        }),
        invoicesApi.getCompanyInvoices(companyId).catch(() => ({ success: false, data: [] as PublicInvoice[] })),
      ])

      if (!subscriptionsResponse.success) {
        throw new Error(subscriptionsResponse.message || 'Failed to load company billing dashboard.')
      }

      if (!paymentsResponse.success) {
        throw new Error(paymentsResponse.message || 'Failed to load company billing dashboard.')
      }

      const subscriptions = subscriptionsResponse.data || []
      const subscription = resolvePrimarySubscription(subscriptions)
      const wallet = subscription?.wallet || null

      const pricePerSession = toNumber(wallet?.pricePerSession)
      const sessionsPurchased = Math.max(0, toNumber(wallet?.sessionsPurchased ?? subscription?.seatsPurchased ?? 0))
      const sessionsAllocated = Math.max(0, toNumber(wallet?.sessionsAllocated ?? 0))
      const sessionsReturned = Math.max(0, toNumber(wallet?.sessionsReturned ?? 0))
      const sessionsAvailable = Math.max(0, toNumber(wallet?.sessionsAvailable ?? 0))
      const sessionsReserved = Math.max(0, sessionsAllocated - sessionsReturned)
      const sessionsUsed = Math.max(0, sessionsPurchased - sessionsAvailable)
      const capacityPercent = sessionsPurchased > 0 ? Math.round((sessionsUsed / sessionsPurchased) * 100) : 0
      const availableBalance = sessionsAvailable * pricePerSession
      const usedBalance = sessionsUsed * pricePerSession

      const invoices = invoicesResponse.success ? (invoicesResponse.data || []) : []
      const invoicesById = new Map(invoices.map(invoice => [invoice.id, invoice]))
      const transactions = buildTransactions(paymentsResponse.data?.payments || [], invoicesById)
      const monthlyTrend = buildMonthlySpendTrendFromInvoices(invoices)

      const currency = normalizeCurrency(
        invoices[0]?.currency
        || (subscription?.latestInvoice as any)?.currency
        || 'KES',
      )

      const triggerSessions = sessionsPurchased > 0
        ? Math.max(1, Math.ceil(sessionsPurchased * 0.2))
        : 10
      const topUpSessions = Math.max(1, toNumber(subscription?.seatsPurchased || triggerSessions * 2))

      const payload: CompanyBillingDashboardData = {
        companyId,
        companyName: subscription?.companyName || 'Your company',
        subscription,
        wallet: {
          pricePerSession,
          currency,
          sessionsPurchased,
          sessionsAllocated,
          sessionsReturned,
          sessionsReserved,
          sessionsAvailable,
          sessionsUsed,
          capacityPercent,
          availableBalance,
          usedBalance,
          availableBalanceUsd: availableBalance / USD_EXCHANGE_RATE,
          balanceChangePercent: 0,
        },
        projectedUsage: {
          windowDays: 30,
          sessionsInWindow: 0,
          projectedSessions: 0,
          projectedSpend: 0,
          activeEmployees: Math.max(0, toNumber(subscription?.activeSeats || 0)),
        },
        autoRefill: {
          enabled: Boolean(subscription?.autoRenew),
          triggerSessions,
          triggerAmount: triggerSessions * pricePerSession,
          topUpSessions,
          topUpAmount: topUpSessions * pricePerSession,
          currency,
        },
        recentTransactions: transactions,
        recentTransactionsPagination: {
          page: Math.max(0, toNumber(paymentsResponse.data?.currentPage)),
          size: Math.max(1, toNumber(paymentsResponse.data?.pageSize || this.lastParams.size)),
          totalItems: Math.max(0, toNumber(paymentsResponse.data?.totalItems)),
          totalPages: Math.max(1, toNumber(paymentsResponse.data?.totalPages || 1)),
          hasNext: Boolean(paymentsResponse.data?.hasNext),
          hasPrevious: Boolean(paymentsResponse.data?.hasPrevious),
        },
        monthlySpendTrend: monthlyTrend,
        departmentAllocation: [],
        snapshotAt: new Date().toISOString(),
      }

      return payload
    },

    async loadCompanyBillingDashboard(companyId: string, params: BillingDashboardQueryParams = {}) {
      if (!companyId) {
        this.error = 'Company context not found. Sign in again and retry.'
        return null
      }

      this.isLoading = true
      this.error = null
      this.lastParams = {
        page: typeof params.page === 'number' ? params.page : this.lastParams.page,
        size: typeof params.size === 'number' ? params.size : this.lastParams.size,
      }

      try {
        const response = await companySubscriptionsApi.getCompanyBillingDashboard(companyId, this.lastParams)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load company billing dashboard.')
        }

        this.dashboard = response.data
        return this.dashboard
      } catch (loadError: any) {
        if (loadError?.response?.status === LEGACY_DASHBOARD_FALLBACK_STATUS) {
          const fallbackData = await this.loadLegacyCompanyBillingDashboard(companyId)
          this.dashboard = fallbackData
          this.error = null
          return this.dashboard
        }

        this.error =
          loadError?.response?.data?.message
          || loadError?.message
          || 'Failed to load company billing dashboard.'
        throw loadError
      } finally {
        this.isLoading = false
      }
    },

    async refreshCompanyBillingDashboard(companyId: string) {
      return this.loadCompanyBillingDashboard(companyId, { ...this.lastParams })
    },

    async createTopUpInvoice(payload: {
      companyId: string
      planId: string
      sessionCount: number
      redirectSuccessUrl?: string
      redirectCancelUrl?: string
    }) {
      this.isCreatingTopUpInvoice = true

      try {
        const response = await companySubscriptionsApi.createCompanySubscription(payload)
        if (!response.success || !response.data?.paymentUrl) {
          throw new Error(response.message || 'Failed to create top-up invoice.')
        }
        return response.data
      } finally {
        this.isCreatingTopUpInvoice = false
      }
    },

    async updateAutoRefillPreference(payload: {
      companySubscriptionId: string
      autoRenew: boolean
      companyId?: string
    }) {
      this.isUpdatingAutoRefill = true

      try {
        const response = await companySubscriptionsApi.updateAutoRenew(
          payload.companySubscriptionId,
          payload.autoRenew,
        )

        if (!response.success) {
          throw new Error(response.message || 'Failed to update auto-refill preference.')
        }

        if (this.dashboard) {
          this.dashboard.autoRefill = {
            ...this.dashboard.autoRefill,
            enabled: payload.autoRenew,
          }
          this.dashboard.subscription = response.data || this.dashboard.subscription
        }

        if (payload.companyId) {
          await this.refreshCompanyBillingDashboard(payload.companyId)
        }

        return response.data
      } catch (updateError: any) {
        if (updateError?.response?.status === LEGACY_DASHBOARD_FALLBACK_STATUS) {
          throw new Error('Auto-refill updates require the latest billing backend deployment.')
        }
        throw updateError
      } finally {
        this.isUpdatingAutoRefill = false
      }
    },

    resetCompanyBillingState() {
      this.dashboard = null
      this.error = null
      this.lastParams = { ...defaultParams }
    },
  },
})
