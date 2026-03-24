import { defineStore } from 'pinia'
import reviewAlertsApi, {
  type ReviewAlertRecord,
  type ReviewAlertSeverity,
  type ReviewAlertStatus,
  type ReviewAlertSummaryRecord,
  type ReviewAlertType,
} from '@/http/requests/app/reviewAlerts'
import { useAppToast } from '@/composables/services/toastService'

interface ReviewAlertsState {
  summaryLoading: boolean
  alertsLoading: boolean
  actionLoadingIds: string[]
  error: string | null
  summary: ReviewAlertSummaryRecord | null
  alerts: ReviewAlertRecord[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  filters: {
    status: ReviewAlertStatus | 'ALL'
    severity: ReviewAlertSeverity | 'ALL'
    alertType: ReviewAlertType | 'ALL'
    companyProgramId: string
  }
}

const defaultPagination = {
  currentPage: 0,
  totalPages: 0,
  totalItems: 0,
  pageSize: 20,
  hasNext: false,
  hasPrevious: false,
}

export const useReviewAlertsStore = defineStore('review-alerts', {
  state: (): ReviewAlertsState => ({
    summaryLoading: false,
    alertsLoading: false,
    actionLoadingIds: [],
    error: null,
    summary: null,
    alerts: [],
    pagination: { ...defaultPagination },
    filters: {
      status: 'ALL',
      severity: 'ALL',
      alertType: 'ALL',
      companyProgramId: '',
    },
  }),

  actions: {
    async loadSummary(companyId: string, companyProgramId?: string | null) {
      this.summaryLoading = true
      this.error = null

      try {
        const response = await reviewAlertsApi.getReviewAlertSummary(companyId, companyProgramId)

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load review summary')
        }

        this.summary = response.data
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || 'Failed to load review summary'
        throw error
      } finally {
        this.summaryLoading = false
      }
    },

    async loadAlerts(params: {
      companyId: string
      page?: number
      size?: number
      companyProgramId?: string | null
      status?: ReviewAlertStatus | 'ALL'
      severity?: ReviewAlertSeverity | 'ALL'
      alertType?: ReviewAlertType | 'ALL'
    }) {
      this.alertsLoading = true
      this.error = null

      try {
        const page = params.page ?? 0
        const size = params.size ?? this.pagination.pageSize
        const companyProgramId = params.companyProgramId ?? this.filters.companyProgramId
        const status = params.status ?? this.filters.status
        const severity = params.severity ?? this.filters.severity
        const alertType = params.alertType ?? this.filters.alertType

        const response = await reviewAlertsApi.getReviewAlerts({
          companyId: params.companyId,
          page,
          size,
          companyProgramId: companyProgramId || null,
          status: status === 'ALL' ? null : status,
          severity: severity === 'ALL' ? null : severity,
          alertType: alertType === 'ALL' ? null : alertType,
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load review alerts')
        }

        this.alerts = response.data.alerts
        this.pagination = {
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems,
          pageSize: response.data.pageSize,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious,
        }
        this.filters = {
          status,
          severity,
          alertType,
          companyProgramId: companyProgramId || '',
        }
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || 'Failed to load review alerts'
        throw error
      } finally {
        this.alertsLoading = false
      }
    },

    async updateStatus(companyId: string, alertId: string, status: ReviewAlertStatus) {
      const toast = useAppToast()
      this.actionLoadingIds = [...this.actionLoadingIds, alertId]

      try {
        const response = await reviewAlertsApi.updateReviewAlertStatus(companyId, alertId, status)

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update review alert')
        }

        this.upsertAlert(response.data)
        toast.success(response.message || 'Review alert updated successfully')
        return response.data
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Failed to update review alert'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.actionLoadingIds = this.actionLoadingIds.filter(id => id !== alertId)
      }
    },

    async triggerRematch(companyId: string, alertId: string) {
      const toast = useAppToast()
      this.actionLoadingIds = [...this.actionLoadingIds, alertId]

      try {
        const response = await reviewAlertsApi.triggerReviewAlertRematch(companyId, alertId)

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to trigger rematch')
        }

        toast.success(response.message || 'Rematch triggered successfully')
        return response.data
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Failed to trigger rematch'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.actionLoadingIds = this.actionLoadingIds.filter(id => id !== alertId)
      }
    },

    upsertAlert(alert: ReviewAlertRecord) {
      const index = this.alerts.findIndex(existing => existing.id === alert.id)
      if (index === -1) {
        this.alerts = [alert, ...this.alerts]
        return
      }

      const next = [...this.alerts]
      next[index] = alert
      this.alerts = next
    },
  },
})
