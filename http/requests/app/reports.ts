import api from '@/http/axios'

export interface ReportQueryParams {
  page?: number
  size?: number
  search?: string
  startDate?: string
  endDate?: string
  status?: string | null
}

export interface ReportList<T> {
  rows: T[]
  count: number
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ProgramReportRow {
  id: string
  name: string
  status?: string | null
  matchingMode?: string | null
  objective?: string | null
  targetAudienceDescription?: string | null
  startsAt?: string | null
  endsAt?: string | null
  maxParticipants?: number | null
  createdAt?: string | null
}

export interface ParticipantReportRow {
  id: string
  companyProgramId: string
  companyProgramName: string
  profileId: string
  profileName: string
  profileEmail?: string | null
  profileRole?: string | null
  department?: string | null
  status?: string | null
  mentorName?: string | null
  matchStatus?: string | null
  enrolledAt?: string | null
  createdAt?: string | null
}

export interface MatchReportRow {
  participantId: string
  companyProgramId: string
  companyProgramName: string
  participantName: string
  participantEmail?: string | null
  participantStatus?: string | null
  matchingMode?: string | null
  matchStatus?: string | null
  mentorName?: string | null
  mentorEmail?: string | null
  shortlistCount?: number | null
  selectionDeadlineAt?: string | null
  assignedAt?: string | null
  resolvedAt?: string | null
}

export interface SessionReportRow {
  id: string
  employeeName: string
  employeeEmail?: string | null
  department?: string | null
  mentorName: string
  title?: string | null
  status?: string | null
  platformDisplayName?: string | null
  scheduledStart?: string | null
  scheduledEnd?: string | null
  durationMin?: number | null
  rating?: number | null
  reviewStatus: string
}

export interface PulseCoverageReportRow {
  companyProgramId: string
  companyProgramName?: string | null
  totalPulses: number
  completedPulses: number
  pendingPulses: number
  expiredPulses: number
  baselinePulses: number
  programEndPulses: number
  completionRate?: number | null
}

export interface RiskSignalReportRow {
  id: string
  alertType?: string | null
  severity?: string | null
  status?: string | null
  companyProgramName?: string | null
  participantName?: string | null
  participantEmail?: string | null
  mentorName?: string | null
  questionCode?: string | null
  scoreValue?: number | null
  details?: string | null
  createdAt?: string | null
}

export interface BillingTransactionReportRow {
  id: string
  paymentType?: string | null
  paymentMethod?: string | null
  status?: string | null
  amount?: number | null
  currency?: string | null
  invoiceId?: string | null
  sessionId?: string | null
  mpesaReceiptNumber?: string | null
  gatewayReference?: string | null
  createdAt?: string | null
  completedAt?: string | null
}

type ApiListData = Record<string, any> | null | undefined

const pageParams = (params: ReportQueryParams = {}) => ({
  page: params.page ?? 0,
  size: params.size ?? 100,
  ...(params.search ? { search: params.search } : {}),
  ...(params.startDate ? { startDate: params.startDate } : {}),
  ...(params.endDate ? { endDate: params.endDate } : {}),
  ...(params.status ? { status: params.status } : {}),
})

const buildReportList = <T>(rows: T[], data?: ApiListData): ReportList<T> => ({
  rows,
  count: Number(data?.count ?? rows.length),
  currentPage: Number(data?.currentPage ?? 0),
  pageSize: Number(data?.pageSize ?? rows.length),
  totalPages: Number(data?.totalPages ?? (rows.length ? 1 : 0)),
  totalItems: Number(data?.totalItems ?? rows.length),
  hasNext: Boolean(data?.hasNext),
  hasPrevious: Boolean(data?.hasPrevious),
})

const getReport = async <T>(companyId: string, reportPath: string, params: ReportQueryParams = {}) => {
  const { data } = await api.get(`/v1/companies/${companyId}/reports/${reportPath}`, {
    params: pageParams(params),
  })

  const payload = data?.data || null
  return buildReportList((payload?.rows || []) as T[], payload)
}

export default {
  async getProgramReport(companyId: string, params: ReportQueryParams = {}) {
    return getReport<ProgramReportRow>(companyId, 'programs', params)
  },

  async getParticipantReport(companyId: string, params: ReportQueryParams = {}) {
    return getReport<ParticipantReportRow>(companyId, 'participants', params)
  },

  async getMatchReport(companyId: string, params: ReportQueryParams = {}) {
    return getReport<MatchReportRow>(companyId, 'matches', params)
  },

  async getSessionReport(companyId: string, params: ReportQueryParams = {}) {
    return getReport<SessionReportRow>(companyId, 'sessions', params)
  },

  async getPulseCoverageReport(companyId: string, params: ReportQueryParams = {}) {
    return getReport<PulseCoverageReportRow>(companyId, 'pulses', params)
  },

  async getRiskSignalsReport(companyId: string, params: ReportQueryParams = {}) {
    return getReport<RiskSignalReportRow>(companyId, 'risk-signals', params)
  },

  async getBillingTransactionsReport(companyId: string, params: ReportQueryParams = {}) {
    return getReport<BillingTransactionReportRow>(companyId, 'billing-transactions', params)
  },
}
