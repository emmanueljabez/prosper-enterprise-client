import api from '@/http/axios'

export type CompanyProgramStatus = 'DRAFT' | 'LIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
export type CompanyProgramMatchingMode = 'ADMIN_ASSIGN' | 'EMPLOYEE_SELECT' | 'SYSTEM_ASSIGN'
export type CompanyProgramParticipantStatus = 'ENROLLED' | 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN'
export type JourneyActionItemOwnerType = 'MENTEE' | 'MENTOR' | 'SHARED'
export type JourneyStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
export type JourneyStepType = 'SESSION' | 'CHECK_IN' | 'ACTION_ITEM' | 'SURVEY' | 'REFLECTION'
export type JourneyStepStatus = 'PENDING' | 'READY' | 'COMPLETED' | 'SKIPPED' | 'BLOCKED'
export type JourneyDependencyType = 'FINISH_TO_START' | 'OPTIONAL_GATE'
export type ParticipantConsentType = 'PROGRAM_PARTICIPATION' | 'AGGREGATED_ANALYTICS' | 'EMPLOYER_PROGRESS_VISIBILITY'
export type ParticipantConsentStatus = 'GRANTED' | 'REVOKED'
export type CompanyProgramCatalogStageType = 'CORE' | 'OPTIONAL'

export interface ProsperCatalogProgramRecord {
  id: string
  legacyId?: string | null
  name: string
  description?: string | null
  imageUrl?: string | null
  videoUrl?: string | null
  status?: string | null
  orderId?: number | null
  tips?: string[] | null
  focusAreas?: string[] | null
  mentors?: Array<{ mentorId?: string | null } | Record<string, any>> | null
}

export interface CompanyProgramCatalogStageRecord {
  id?: string | null
  programId: string
  programName?: string | null
  programDescription?: string | null
  journeyOrder: number
  journeyStageName?: string | null
  stageType?: CompanyProgramCatalogStageType | null
}

export interface JourneyTemplateRecord {
  id: string
  name: string
  programType?: string | null
  description?: string | null
  defaultDurationWeeks?: number | null
  templateVersion?: number | null
  active?: boolean | null
  stepCount?: number | null
  dependencyCount?: number | null
  createdAt?: string | null
  updatedAt?: string | null
  steps?: JourneyTemplateStepRecord[] | null
  dependencies?: JourneyTemplateDependencyRecord[] | null
}

export interface JourneyTemplateStepRecord {
  id?: string | null
  stepKey: string
  defaultSequence?: number | null
  title: string
  description?: string | null
  stepType: JourneyStepType
  required?: boolean | null
  defaultDueOffsetDays?: number | null
  stepConfigJson?: string | null
}

export interface JourneyTemplateDependencyRecord {
  id?: string | null
  fromStepId?: string | null
  fromStepKey: string
  fromStepTitle?: string | null
  toStepId?: string | null
  toStepKey: string
  toStepTitle?: string | null
  dependencyType: JourneyDependencyType
}

export interface ParticipantConsentDecisionRecord {
  consentType: ParticipantConsentType
  status?: ParticipantConsentStatus | null
  capturedAt?: string | null
  expiresAt?: string | null
  pending: boolean
}

export interface ParticipantConsentSummaryRecord {
  participantId: string
  programParticipationStatus?: ParticipantConsentStatus | null
  aggregatedAnalyticsStatus?: ParticipantConsentStatus | null
  employerProgressVisibilityStatus?: ParticipantConsentStatus | null
  grantedCount: number
  revokedCount: number
  pendingCount: number
  programParticipationGranted: boolean
  aggregatedAnalyticsGranted: boolean
  employerProgressVisibilityGranted: boolean
}

export interface CompanyProgramRecord {
  id: string
  companyId: string
  companyName?: string | null
  templateProgramId?: string | null
  templateProgramName?: string | null
  catalogJourneySummary?: string | null
  catalogProgramCount?: number | null
  catalogStages?: CompanyProgramCatalogStageRecord[] | null
  journeyTemplateId?: string | null
  journeyTemplateName?: string | null
  name: string
  objective?: string | null
  targetAudienceDescription?: string | null
  status: CompanyProgramStatus
  matchingMode: CompanyProgramMatchingMode
  visibilityPolicyCode?: string | null
  maxParticipants?: number | null
  startsAt?: string | null
  endsAt?: string | null
  createdByUserId?: string | null
  version?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CompanyProgramsResponse {
  success: boolean
  message: string
  data: {
    companyId: string
    programs: CompanyProgramRecord[]
    count: number
    currentPage: number
    pageSize: number
    totalPages: number
    totalItems: number
    hasNext: boolean
    hasPrevious: boolean
    search?: string
    status?: CompanyProgramStatus | null
    liveOnly?: boolean
  } | null
}

export interface CompanyProgramResponse {
  success: boolean
  message: string
  data: CompanyProgramRecord | null
}

export interface JourneyTemplatesResponse {
  success: boolean
  message: string
  data: {
    templates: JourneyTemplateRecord[]
    count: number
  } | null
}

export interface JourneyTemplateResponse {
  success: boolean
  message: string
  data: JourneyTemplateRecord | null
}

export interface CompanyProgramParticipantRecord {
  id: string
  companyProgramId: string
  profileId: string
  profileName: string
  profileEmail?: string | null
  profileRole?: string | null
  department?: string | null
  status: CompanyProgramParticipantStatus
  consentSummary?: ParticipantConsentSummaryRecord | null
  mentorAssignment?: MentorAssignmentSummaryRecord | null
  enrolledAt?: string | null
  enrolledByUserId?: string | null
  version?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface MentorAssignmentSummaryRecord {
  assignmentId: string
  mentorId: string
  mentorName: string
  mentorEmail?: string | null
  title?: string | null
  company?: string | null
  yearsExperience?: number | null
  rating?: number | string | null
  totalSessions?: number | null
  avatarUrl?: string | null
  specializations?: string[] | null
  isAvailable?: boolean | null
  assignedAt?: string | null
}

export interface CompanyProgramMentorCandidateRecord {
  mentorId: string
  mentorName: string
  mentorEmail?: string | null
  title?: string | null
  company?: string | null
  yearsExperience?: number | null
  rating?: number | string | null
  totalSessions?: number | null
  avatarUrl?: string | null
  specializations?: string[] | null
  isAvailable?: boolean | null
  source?: 'PROGRAM_POOL' | 'GLOBAL_POOL' | string | null
}

export interface CompanyProgramParticipantsResponse {
  success: boolean
  message: string
  data: {
    companyProgramId: string
    participants: CompanyProgramParticipantRecord[]
    count: number
    currentPage: number
    pageSize: number
    totalPages: number
    totalItems: number
    hasNext: boolean
    hasPrevious: boolean
    search?: string
    status?: CompanyProgramParticipantStatus | null
  } | null
}

export interface CompanyProgramParticipantEnrollmentResult {
  companyProgramId: string
  enrolledCount: number
  skippedCount: number
  totalParticipants: number
  enrolledParticipants: CompanyProgramParticipantRecord[]
  skippedParticipants: Array<{
    profileId: string
    reason: string
  }>
}

export interface CompanyProgramParticipantEnrollmentResponse {
  success: boolean
  message: string
  data: CompanyProgramParticipantEnrollmentResult | null
}

export interface CompanyProgramMentorCandidatesResponse {
  success: boolean
  message: string
  data: {
    companyProgramId: string
    candidates: CompanyProgramMentorCandidateRecord[]
    count: number
    search?: string
  } | null
}

export interface MentorAssignmentResponse {
  success: boolean
  message: string
  data: MentorAssignmentSummaryRecord | null
}

export interface MyCompanyProgramsResponse {
  success: boolean
  message: string
  data: {
    programs: EmployeeCompanyProgramRecord[]
    count: number
  } | null
}

export interface EmployeeCompanyProgramMatchRecord {
  participantId: string
  companyProgramId: string
  companyId: string
  companyName?: string | null
  programName: string
  templateProgramName?: string | null
  catalogJourneySummary?: string | null
  catalogStages?: CompanyProgramCatalogStageRecord[] | null
  programStatus: CompanyProgramStatus
  matchingMode: CompanyProgramMatchingMode
  participantStatus: CompanyProgramParticipantStatus
  startsAt?: string | null
  endsAt?: string | null
  mentorAssignment?: MentorAssignmentSummaryRecord | null
}

export interface MyCompanyProgramMatchesResponse {
  success: boolean
  message: string
  data: {
    matches: EmployeeCompanyProgramMatchRecord[]
    count: number
  } | null
}

export interface CompanyProgramJourneySessionRecord {
  sessionId: string
  title: string
  scheduledStart?: string | null
  scheduledEnd?: string | null
  status: string
  outcomeSummary?: string | null
  reflectionPrompt?: string | null
  actionItemCount?: number | null
}

export interface CompanyProgramJourneyActionItemRecord {
  actionItemId: string
  sessionId?: string | null
  sessionTitle?: string | null
  description: string
  ownerType: JourneyActionItemOwnerType
  dueAt?: string | null
  completedAt?: string | null
  completed: boolean
  canBeCompletedByEmployee: boolean
}

export interface CompanyProgramJourneyStepRecord {
  journeyInstanceStepId: string
  journeyStepId: string
  stepKey: string
  defaultSequence?: number | null
  title: string
  description?: string | null
  stepType: JourneyStepType
  required: boolean
  status: JourneyStepStatus
  dueAt?: string | null
  completedAt?: string | null
  skippedReason?: string | null
  blockedReason?: string | null
  canBeCompletedByEmployee: boolean
}

export interface EmployeeCompanyProgramJourneyRecord {
  participantId: string
  companyProgramId: string
  companyId: string
  companyName?: string | null
  programName: string
  templateProgramName?: string | null
  catalogJourneySummary?: string | null
  catalogStages?: CompanyProgramCatalogStageRecord[] | null
  journeyTemplateId?: string | null
  journeyTemplateName?: string | null
  journeyInstanceId?: string | null
  journeyStatus?: JourneyStatus | null
  programStatus: CompanyProgramStatus
  participantStatus: CompanyProgramParticipantStatus
  mentorAssignment?: MentorAssignmentSummaryRecord | null
  totalSessions: number
  completedSessions: number
  totalJourneySteps: number
  completedJourneySteps: number
  readyJourneySteps: number
  openActionItemCount: number
  completedActionItemCount: number
  progressPercent: number
  latestOutcomeSummary?: string | null
  latestReflectionPrompt?: string | null
  nextSession?: CompanyProgramJourneySessionRecord | null
  recentSessions: CompanyProgramJourneySessionRecord[]
  steps: CompanyProgramJourneyStepRecord[]
  actionItems: CompanyProgramJourneyActionItemRecord[]
}

export interface MyCompanyProgramJourneysResponse {
  success: boolean
  message: string
  data: {
    journeys: EmployeeCompanyProgramJourneyRecord[]
    count: number
  } | null
}

export interface UpdateJourneyActionItemPayload {
  completed: boolean
}

export interface JourneyActionItemResponse {
  success: boolean
  message: string
  data: CompanyProgramJourneyActionItemRecord | null
}

export interface JourneyStepResponse {
  success: boolean
  message: string
  data: CompanyProgramJourneyStepRecord | null
}

export interface EmployeeCompanyProgramRecord {
  participantId: string
  participantStatus: CompanyProgramParticipantStatus
  enrolledAt?: string | null
  companyProgramId: string
  companyId: string
  companyName?: string | null
  templateProgramId?: string | null
  templateProgramName?: string | null
  catalogJourneySummary?: string | null
  catalogStages?: CompanyProgramCatalogStageRecord[] | null
  journeyTemplateId?: string | null
  journeyTemplateName?: string | null
  name: string
  objective?: string | null
  targetAudienceDescription?: string | null
  status: CompanyProgramStatus
  matchingMode: CompanyProgramMatchingMode
  consentSummary?: ParticipantConsentSummaryRecord | null
  maxParticipants?: number | null
  startsAt?: string | null
  endsAt?: string | null
}

export interface ParticipantConsentWorkspaceRecord {
  participantId: string
  companyProgramId: string
  companyProgramName?: string | null
  participantStatus: CompanyProgramParticipantStatus
  summary: ParticipantConsentSummaryRecord
  consents: ParticipantConsentDecisionRecord[]
}

export interface ParticipantConsentWorkspaceResponse {
  success: boolean
  message: string
  data: ParticipantConsentWorkspaceRecord | null
}

export interface MyCompanyProgramConsentsResponse {
  success: boolean
  message: string
  data: {
    consents: ParticipantConsentWorkspaceRecord[]
    count: number
  } | null
}

export interface UpdateParticipantConsentPayload {
  consentType: ParticipantConsentType
  status: ParticipantConsentStatus
  expiresAt?: string | null
}

export interface CompanyProgramsQueryParams {
  companyId: string
  page?: number
  size?: number
  search?: string
  status?: CompanyProgramStatus | null
  liveOnly?: boolean
}

export interface CompanyProgramParticipantsQueryParams {
  companyProgramId: string
  page?: number
  size?: number
  search?: string
  status?: CompanyProgramParticipantStatus | null
}

export interface CreateCompanyProgramPayload {
  programId?: string | null
  catalogStages?: Array<{
    programId: string
    journeyStageName?: string | null
    stageType?: CompanyProgramCatalogStageType | null
  }>
  journeyTemplateId?: string | null
  name: string
  objective?: string | null
  targetAudienceDescription?: string | null
  matchingMode?: CompanyProgramMatchingMode
  visibilityPolicyCode?: string | null
  maxParticipants?: number | null
  startsAt?: string | null
  endsAt?: string | null
}

export interface UpdateCompanyProgramPayload {
  programId?: string | null
  catalogStages?: Array<{
    programId: string
    journeyStageName?: string | null
    stageType?: CompanyProgramCatalogStageType | null
  }>
  journeyTemplateId?: string | null
  name?: string
  objective?: string | null
  targetAudienceDescription?: string | null
  matchingMode?: CompanyProgramMatchingMode
  visibilityPolicyCode?: string | null
  maxParticipants?: number | null
  startsAt?: string | null
  endsAt?: string | null
}

export interface JourneyTemplateUpsertPayload {
  name: string
  programType?: string | null
  description?: string | null
  defaultDurationWeeks?: number | null
  active?: boolean | null
  steps: Array<{
    stepKey: string
    title: string
    description?: string | null
    stepType: JourneyStepType
    required?: boolean | null
    defaultDueOffsetDays?: number | null
    stepConfigJson?: string | null
  }>
  dependencies?: Array<{
    fromStepKey: string
    toStepKey: string
    dependencyType: JourneyDependencyType
  }>
}

export interface EnrollCompanyProgramParticipantsPayload {
  profileIds: string[]
}

export interface AssignCompanyProgramMentorPayload {
  mentorId: string
}

export interface ProsperCatalogProgramsResponse {
  success: boolean
  count: number
  programs: ProsperCatalogProgramRecord[]
}

const postStatusAction = (companyProgramId: string, action: 'launch' | 'pause' | 'complete' | 'cancel') =>
  api.post(`/v1/company-programs/${companyProgramId}/${action}`)

export default {
  async getCompanyPrograms(params: CompanyProgramsQueryParams): Promise<CompanyProgramsResponse> {
    const { companyId, ...query } = params
    const { data } = await api.get(`/v1/companies/${companyId}/programs`, { params: query })
    return data
  },

  async createCompanyProgram(companyId: string, payload: CreateCompanyProgramPayload): Promise<CompanyProgramResponse> {
    const { data } = await api.post(`/v1/companies/${companyId}/programs`, payload)
    return data
  },

  async getProsperCatalogPrograms(): Promise<ProsperCatalogProgramsResponse> {
    const { data } = await api.get('/v1/programs/live')
    return data
  },

  async getJourneyTemplates(): Promise<JourneyTemplatesResponse> {
    const { data } = await api.get('/v1/journey-templates')
    return data
  },

  async getAdminJourneyTemplates(): Promise<JourneyTemplatesResponse> {
    const { data } = await api.get('/v1/admin/journey-templates')
    return data
  },

  async getAdminJourneyTemplate(journeyTemplateId: string): Promise<JourneyTemplateResponse> {
    const { data } = await api.get(`/v1/admin/journey-templates/${journeyTemplateId}`)
    return data
  },

  async createJourneyTemplate(payload: JourneyTemplateUpsertPayload): Promise<JourneyTemplateResponse> {
    const { data } = await api.post('/v1/admin/journey-templates', payload)
    return data
  },

  async updateJourneyTemplate(journeyTemplateId: string, payload: JourneyTemplateUpsertPayload): Promise<JourneyTemplateResponse> {
    const { data } = await api.patch(`/v1/admin/journey-templates/${journeyTemplateId}`, payload)
    return data
  },

  async updateCompanyProgram(companyProgramId: string, payload: UpdateCompanyProgramPayload): Promise<CompanyProgramResponse> {
    const { data } = await api.patch(`/v1/company-programs/${companyProgramId}`, payload)
    return data
  },

  async getCompanyProgram(companyProgramId: string): Promise<CompanyProgramResponse> {
    const { data } = await api.get(`/v1/company-programs/${companyProgramId}`)
    return data
  },

  async getCompanyProgramParticipants(params: CompanyProgramParticipantsQueryParams): Promise<CompanyProgramParticipantsResponse> {
    const { companyProgramId, ...query } = params
    const { data } = await api.get(`/v1/company-programs/${companyProgramId}/participants`, { params: query })
    return data
  },

  async getCompanyProgramMentorCandidates(companyProgramId: string, search?: string): Promise<CompanyProgramMentorCandidatesResponse> {
    const { data } = await api.get(`/v1/company-programs/${companyProgramId}/mentor-candidates`, {
      params: { search },
    })
    return data
  },

  async enrollCompanyProgramParticipants(
    companyProgramId: string,
    payload: EnrollCompanyProgramParticipantsPayload,
  ): Promise<CompanyProgramParticipantEnrollmentResponse> {
    const { data } = await api.post(`/v1/company-programs/${companyProgramId}/participants`, payload)
    return data
  },

  async removeCompanyProgramParticipant(participantId: string): Promise<{ success: boolean; message: string; data: null }> {
    const { data } = await api.delete(`/v1/company-program-participants/${participantId}`)
    return data
  },

  async assignMentorToParticipant(
    participantId: string,
    payload: AssignCompanyProgramMentorPayload,
  ): Promise<MentorAssignmentResponse> {
    const { data } = await api.put(`/v1/company-program-participants/${participantId}/mentor-assignment`, payload)
    return data
  },

  async removeMentorAssignment(participantId: string): Promise<{ success: boolean; message: string; data: null }> {
    const { data } = await api.delete(`/v1/company-program-participants/${participantId}/mentor-assignment`)
    return data
  },

  async getMyCompanyPrograms(): Promise<MyCompanyProgramsResponse> {
    const { data } = await api.get('/v1/me/company-programs')
    return data
  },

  async getMyCompanyProgramConsents(): Promise<MyCompanyProgramConsentsResponse> {
    const { data } = await api.get('/v1/me/company-program-consents')
    return data
  },

  async getParticipantConsents(participantId: string): Promise<ParticipantConsentWorkspaceResponse> {
    const { data } = await api.get(`/v1/participants/${participantId}/consents`)
    return data
  },

  async updateParticipantConsent(
    participantId: string,
    payload: UpdateParticipantConsentPayload,
  ): Promise<ParticipantConsentWorkspaceResponse> {
    const { data } = await api.post(`/v1/participants/${participantId}/consents`, payload)
    return data
  },

  async getMyCompanyProgramMatches(): Promise<MyCompanyProgramMatchesResponse> {
    const { data } = await api.get('/v1/me/company-program-matches')
    return data
  },

  async getMyCompanyProgramJourneys(): Promise<MyCompanyProgramJourneysResponse> {
    const { data } = await api.get('/v1/me/company-program-journeys')
    return data
  },

  async updateMyJourneyActionItem(
    actionItemId: string,
    payload: UpdateJourneyActionItemPayload,
  ): Promise<JourneyActionItemResponse> {
    const { data } = await api.patch(`/v1/me/company-program-action-items/${actionItemId}`, payload)
    return data
  },

  async completeMyJourneyStep(journeyInstanceStepId: string): Promise<JourneyStepResponse> {
    const { data } = await api.post(`/v1/me/company-program-journey-steps/${journeyInstanceStepId}/complete`)
    return data
  },

  async launchCompanyProgram(companyProgramId: string): Promise<CompanyProgramResponse> {
    const { data } = await postStatusAction(companyProgramId, 'launch')
    return data
  },

  async pauseCompanyProgram(companyProgramId: string): Promise<CompanyProgramResponse> {
    const { data } = await postStatusAction(companyProgramId, 'pause')
    return data
  },

  async completeCompanyProgram(companyProgramId: string): Promise<CompanyProgramResponse> {
    const { data } = await postStatusAction(companyProgramId, 'complete')
    return data
  },

  async cancelCompanyProgram(companyProgramId: string): Promise<CompanyProgramResponse> {
    const { data } = await postStatusAction(companyProgramId, 'cancel')
    return data
  },
}
