import api from '@/http/axios'

export type AccessAuditResourceType =
  | 'COMPANY_PROGRAM_PARTICIPANT_ROSTER'
  | 'PARTICIPANT_CONSENTS'
  | 'REVIEW_ALERT_QUEUE'
  | 'REVIEW_ALERT_SUMMARY'

export type AccessAuditActionType = 'VIEW' | 'UPDATE' | 'REMATCH'

export interface AccessAuditLogRecord {
  id: string
  companyId?: string | null
  companyProgramId?: string | null
  companyProgramName?: string | null
  participantId?: string | null
  participantName?: string | null
  actorId?: string | null
  actorName?: string | null
  actorRole?: string | null
  resourceType: AccessAuditResourceType
  resourceId?: string | null
  action: AccessAuditActionType
  reasonCode?: string | null
  createdAt: string
}

export interface AccessAuditSummaryRecord {
  companyId: string
  totalEvents: number
  last7DaysEvents: number
  distinctActorsLast7Days: number
  participantRosterViewsLast7Days: number
  participantConsentViewsLast7Days: number
  participantConsentUpdatesLast7Days: number
  reviewAlertViewsLast7Days: number
  rematchActionsLast7Days: number
  recentLogs: AccessAuditLogRecord[]
}

export interface AccessAuditLogsResponse {
  success: boolean
  message: string
  data: {
    companyId: string
    companyProgramId?: string | null
    logs: AccessAuditLogRecord[]
    count: number
    currentPage: number
    pageSize: number
    totalPages: number
    totalItems: number
    hasNext: boolean
    hasPrevious: boolean
    resourceType?: AccessAuditResourceType | null
    action?: AccessAuditActionType | null
  } | null
}

export interface AccessAuditSummaryResponse {
  success: boolean
  message: string
  data: AccessAuditSummaryRecord | null
}

export interface AccessAuditLogsQueryParams {
  companyId: string
  page?: number
  size?: number
  companyProgramId?: string | null
  resourceType?: AccessAuditResourceType | null
  action?: AccessAuditActionType | null
}

export default {
  async getAccessAuditSummary(companyId: string): Promise<AccessAuditSummaryResponse> {
    const { data } = await api.get(`/v1/companies/${companyId}/access-audit-logs/summary`)
    return data
  },

  async getAccessAuditLogs(params: AccessAuditLogsQueryParams): Promise<AccessAuditLogsResponse> {
    const { companyId, ...query } = params
    const { data } = await api.get(`/v1/companies/${companyId}/access-audit-logs`, { params: query })
    return data
  },
}
