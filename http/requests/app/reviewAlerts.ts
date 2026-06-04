import api from '@/http/axios'

export type ReviewAlertType = 'LOW_MENTOR_SCORE' | 'LOW_MENTEE_SCORE' | 'LOW_FIT_SCORE' | 'DO_NOT_CONTINUE'
export type ReviewAlertSeverity = 'MEDIUM' | 'HIGH'
export type ReviewAlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
export type ReviewCycleType = 'SESSION' | 'FIT'
export type ReviewRole = 'MENTOR' | 'MENTEE'

export interface ReviewAlertRecord {
  id: string
  reviewCycleId?: string | null
  reviewType?: ReviewCycleType | null
  reviewRequestId?: string | null
  reviewerRole?: ReviewRole | null
  targetRole?: ReviewRole | null
  companyProgramId?: string | null
  companyProgramName?: string | null
  participantId?: string | null
  participantName?: string | null
  participantEmail?: string | null
  participantStatus?: string | null
  mentorAssignmentId?: string | null
  mentorId?: string | null
  mentorName?: string | null
  alertType: ReviewAlertType
  severity: ReviewAlertSeverity
  status: ReviewAlertStatus
  questionCode?: string | null
  scoreValue?: number | null
  booleanValue?: boolean | null
  details?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ReviewAlertSummaryRecord {
  companyId: string
  companyProgramId?: string | null
  totalReviewCycles: number
  revealedReviewCycles: number
  pendingReviewCycles: number
  totalAlerts: number
  openAlerts: number
  acknowledgedAlerts: number
  resolvedAlerts: number
  highSeverityAlerts: number
  lowMentorScoreAlerts: number
  lowMenteeScoreAlerts: number
  lowFitAlerts: number
  doNotContinueAlerts: number
  rematchRecommendedAlerts: number
  recentAlerts: ReviewAlertRecord[]
}

export interface ReviewAlertsResponse {
  success: boolean
  message: string
  data: {
    companyId: string
    companyProgramId?: string | null
    alerts: ReviewAlertRecord[]
    count: number
    currentPage: number
    pageSize: number
    totalPages: number
    totalItems: number
    hasNext: boolean
    hasPrevious: boolean
    status?: ReviewAlertStatus | null
    severity?: ReviewAlertSeverity | null
    alertType?: ReviewAlertType | null
  } | null
}

export interface ReviewAlertSummaryResponse {
  success: boolean
  message: string
  data: ReviewAlertSummaryRecord | null
}

export interface ReviewAlertResponse {
  success: boolean
  message: string
  data: ReviewAlertRecord | null
}

export interface ReviewAlertRematchResponse {
  success: boolean
  message: string
  data: {
    alertId: string
    companyProgramId?: string | null
    participantId?: string | null
    previousMentorId?: string | null
    previousMentorName?: string | null
    resolvedAlertCount: number
    mentorAssignmentRemoved: boolean
  } | null
}

export interface ReviewAlertsQueryParams {
  companyId: string
  page?: number
  size?: number
  companyProgramId?: string | null
  status?: ReviewAlertStatus | null
  severity?: ReviewAlertSeverity | null
  alertType?: ReviewAlertType | null
}

type ReviewSummaryDateFilter = {
  startDate?: string
  endDate?: string
}

export default {
  async getReviewAlertSummary(
    companyId: string,
    companyProgramId?: string | null,
    dateFilter: ReviewSummaryDateFilter = {},
  ): Promise<ReviewAlertSummaryResponse> {
    const { data } = await api.get(`/v1/companies/${companyId}/review-alerts/summary`, {
      params: {
        companyProgramId: companyProgramId || null,
        ...(dateFilter.startDate ? { startDate: dateFilter.startDate } : {}),
        ...(dateFilter.endDate ? { endDate: dateFilter.endDate } : {}),
      },
    })
    return data
  },

  async getReviewAlerts(params: ReviewAlertsQueryParams): Promise<ReviewAlertsResponse> {
    const { companyId, ...query } = params
    const { data } = await api.get(`/v1/companies/${companyId}/review-alerts`, { params: query })
    return data
  },

  async updateReviewAlertStatus(
    companyId: string,
    alertId: string,
    status: ReviewAlertStatus,
  ): Promise<ReviewAlertResponse> {
    const { data } = await api.patch(`/v1/companies/${companyId}/review-alerts/${alertId}`, { status })
    return data
  },

  async triggerReviewAlertRematch(companyId: string, alertId: string): Promise<ReviewAlertRematchResponse> {
    const { data } = await api.post(`/v1/companies/${companyId}/review-alerts/${alertId}/rematch`)
    return data
  },
}
