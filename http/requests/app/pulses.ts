import api from '@/http/axios'

export type ParticipantPulseType = 'BASELINE' | 'MIDPOINT' | 'PROGRAM_END' | 'D30' | 'D60' | 'D90'
export type ParticipantPulseStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED'

export interface ParticipantPulseSummaryRecord {
  totalPulses: number
  pendingPulses: number
  completedPulses: number
  expiredPulses: number
  baselinePendingPulses: number
  programEndPendingPulses: number
  completionRate?: number | null
  averageConfidenceScore?: number | null
  averageSatisfactionScore?: number | null
  averageGoalClarityScore?: number | null
}

export interface ParticipantPulseRecord {
  id: string
  participantId?: string | null
  companyProgramId?: string | null
  companyProgramName?: string | null
  sessionId?: string | null
  pulseType: ParticipantPulseType
  status: ParticipantPulseStatus
  confidenceScore?: number | null
  satisfactionScore?: number | null
  goalClarityScore?: number | null
  freeTextFeedback?: string | null
  sentAt?: string | null
  expiresAt?: string | null
  completedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface MyParticipantPulsesResponse {
  success: boolean
  message: string
  data: {
    summary: ParticipantPulseSummaryRecord
    pulses: ParticipantPulseRecord[]
    count: number
  } | null
}

export interface CompanyProgramPulseSummaryRecord {
  companyProgramId: string
  companyProgramName?: string | null
  totalPulses: number
  pendingPulses: number
  completedPulses: number
  expiredPulses: number
  baselinePulses: number
  programEndPulses: number
  completionRate?: number | null
}

export interface CompanyParticipantPulseSummaryRecord {
  companyId: string
  totalPulses: number
  pendingPulses: number
  completedPulses: number
  expiredPulses: number
  completionRate?: number | null
  averageConfidenceScore?: number | null
  averageSatisfactionScore?: number | null
  averageGoalClarityScore?: number | null
  programs: CompanyProgramPulseSummaryRecord[]
}

export interface CompanyParticipantPulseSummaryResponse {
  success: boolean
  message: string
  data: CompanyParticipantPulseSummaryRecord | null
}

export default {
  async getMyPulses(): Promise<MyParticipantPulsesResponse> {
    const { data } = await api.get('/v1/me/participant-pulses')
    return data
  },

  async getCompanyPulseSummary(companyId: string): Promise<CompanyParticipantPulseSummaryResponse> {
    const { data } = await api.get(`/v1/companies/${companyId}/participant-pulses/summary`)
    return data
  },
}
