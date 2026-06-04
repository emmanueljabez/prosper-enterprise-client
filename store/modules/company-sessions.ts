import { defineStore } from 'pinia'
import companyApi, {
  type CompanyPendingFeedbackPayload,
  type CompanyRecentCancellation,
  type CompanySessionRecord,
  type CompanySessionsPagination,
  type CompanySessionsQueryParams,
  type CompanySessionsSummary,
} from '~/http/requests/app/company'

interface CompanySessionsState {
  isLoading: boolean
  error: string | null
  sessions: CompanySessionRecord[]
  count: number
  totalCount: number
  displayedCount: number
  pagination: CompanySessionsPagination | null
  summary: CompanySessionsSummary | null
  recentCancellations: CompanyRecentCancellation[]
  pendingFeedback: CompanyPendingFeedbackPayload
  appliedFilters: Record<string, any>
}

const emptyPendingFeedback: CompanyPendingFeedbackPayload = {
  requiredCount: 0,
  items: [],
}

export const useCompanySessionsStore = defineStore('company-sessions', {
  state: (): CompanySessionsState => ({
    isLoading: false,
    error: null,
    sessions: [],
    count: 0,
    totalCount: 0,
    displayedCount: 0,
    pagination: null,
    summary: null,
    recentCancellations: [],
    pendingFeedback: { ...emptyPendingFeedback },
    appliedFilters: {},
  }),

  actions: {
    async loadCompanySessions(companyId: string, params?: CompanySessionsQueryParams) {
      this.isLoading = true
      this.error = null

      try {
        const response = await companyApi.getCompanySessions(companyId, params)

        if (!response.data.success || !response.data.data) {
          throw new Error(response.data.message || 'Failed to load company sessions')
        }

        const payload = response.data.data

        this.sessions = payload.sessions || []
        this.count = typeof payload.count === 'number' ? payload.count : this.sessions.length
        this.totalCount = typeof payload.totalCount === 'number' ? payload.totalCount : this.count
        this.displayedCount = typeof payload.displayedCount === 'number' ? payload.displayedCount : this.sessions.length
        this.pagination = payload.pagination || null
        this.summary = payload.summary || null
        this.recentCancellations = payload.recentCancellations || []
        this.pendingFeedback = payload.pendingFeedback || { ...emptyPendingFeedback }
        this.appliedFilters = payload.appliedFilters || {}

        return payload
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || 'Failed to load company sessions'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    resetSessionsState() {
      this.sessions = []
      this.count = 0
      this.totalCount = 0
      this.displayedCount = 0
      this.pagination = null
      this.summary = null
      this.recentCancellations = []
      this.pendingFeedback = { ...emptyPendingFeedback }
      this.appliedFilters = {}
    },
  },
})
