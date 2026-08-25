import api from '@/http/axios'
import type { MentorAssignmentSummaryRecord } from './companyPrograms'

export type CompanyProgramCohortStatus = 'DRAFT' | 'INTAKE_OPEN' | 'INTAKE_CLOSED' | 'PLENARY_SCHEDULED' | 'CIRCLES_FORMING' | 'CIRCLES_FINALIZED' | 'MATCHING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
export type CohortParticipantStatus = 'PENDING' | 'CONFIRMED' | 'PLENARY_ATTENDED' | 'PLACED_IN_CIRCLE' | 'ELIGIBLE_FOR_MATCHING' | 'MATCHED' | 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN' | 'REJECTED'
export type CohortParticipantSource = 'ROSTER_UPLOAD' | 'MANUAL_ADD' | 'SELF_JOIN' | 'ADMIN_TRANSFER'
export type CohortDuplicateStatus = 'CLEAR' | 'POSSIBLE_DUPLICATE' | 'RESOLVED_EXISTING_PROFILE' | 'RESOLVED_NEW_PROFILE'
export type CohortJoinRequestStatus = 'PENDING' | 'DUPLICATE_REVIEW' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED'
export type PlenaryEventType = 'SUMMIT_EVENT' | 'EXTERNAL_EVENT' | 'MANUAL_EVENT'
export type PlenaryAttendanceStatus = 'REGISTERED' | 'ATTENDED' | 'ABSENT' | 'EXCUSED'
export type PlenaryAttendanceSource = 'SUMMIT_EVENT' | 'IMPORT' | 'ADMIN_OVERRIDE'
export type CircleStatus = 'DRAFT' | 'FORMING' | 'FINALIZED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export type CircleMembershipStatus = 'PENDING_REQUEST' | 'PLACED' | 'REMOVED' | 'COMPLETED'
export type CirclePlacementSource = 'SUGGESTED' | 'MENTEE_REQUESTED' | 'ADMIN_PLACED' | 'ADMIN_MOVED'

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T | null
}

export interface CompanyProgramCohortRecord {
  id: string
  companyProgramId: string
  companyProgramName?: string | null
  companyId?: string | null
  companyName?: string | null
  name: string
  code: string
  chapter?: string | null
  region?: string | null
  status: CompanyProgramCohortStatus
  startsAt?: string | null
  endsAt?: string | null
  selfJoinEnabled: boolean
  selfJoinExpiresAt?: string | null
  selfJoinCapacity?: number | null
  circleMinSize?: number | null
  circleMaxSize?: number | null
  interestTagSet: string[]
  plenaryEventType?: PlenaryEventType | null
  plenaryEventId?: string | null
  matchingStartsAfterCirclesFinalized?: boolean | null
  participantCount: number
  pendingCount: number
  confirmedCount: number
  circleCount: number
  unplacedCount: number
  matchedCount: number
  createdByUserId?: string | null
  version?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CompanyProgramCohortParticipantRecord {
  id: string
  cohortId: string
  companyProgramId?: string | null
  companyProgramParticipantId?: string | null
  profileId?: string | null
  profileName?: string | null
  profileEmail?: string | null
  profilePhone?: string | null
  source: CohortParticipantSource
  status: CohortParticipantStatus
  chapter?: string | null
  region?: string | null
  interestTags: string[]
  duplicateStatus: CohortDuplicateStatus
  duplicateCandidateProfileId?: string | null
  confirmedByUserId?: string | null
  confirmedAt?: string | null
  version?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CompanyProgramCohortJoinRequestRecord {
  id: string
  cohortId: string
  companyProgramId?: string | null
  submittedEmail: string
  submittedPhone?: string | null
  submittedFirstName?: string | null
  submittedLastName?: string | null
  submittedChapter?: string | null
  submittedRegion?: string | null
  interestTags: string[]
  matchedProfileId?: string | null
  matchedProfileName?: string | null
  status: CohortJoinRequestStatus
  reviewedByUserId?: string | null
  reviewedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CohortSelfJoinRecord {
  joinRequestId?: string | null
  cohortId: string
  companyProgramId?: string | null
  companyId?: string | null
  companyProgramName?: string | null
  companyName?: string | null
  cohortName: string
  chapter?: string | null
  region?: string | null
  cohortStatus: CompanyProgramCohortStatus
  status?: CohortJoinRequestStatus | null
  duplicateReviewRequired?: boolean | null
  matchedProfileId?: string | null
  interestTagSet: string[]
  startsAt?: string | null
  endsAt?: string | null
}

export interface CohortPlenaryAttendanceRecord {
  id: string
  cohortId: string
  cohortParticipantId: string
  profileId?: string | null
  profileName?: string | null
  profileEmail?: string | null
  attendanceSource: PlenaryAttendanceSource
  status: PlenaryAttendanceStatus
  attendedAt?: string | null
  recordedByUserId?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CommonInterestCircleMemberRecord {
  membershipId: string
  circleId: string
  cohortParticipantId: string
  profileId?: string | null
  profileName?: string | null
  profileEmail?: string | null
  placementSource: CirclePlacementSource
  status: CircleMembershipStatus
  placedByUserId?: string | null
  placedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CommonInterestCircleRecord {
  id: string
  cohortId: string
  name: string
  theme?: string | null
  interestTags: string[]
  facilitatorProfileId?: string | null
  facilitatorName?: string | null
  minSize?: number | null
  maxSize?: number | null
  status: CircleStatus
  nextSessionAt?: string | null
  memberCount: number
  members: CommonInterestCircleMemberRecord[]
  version?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CircleSuggestionRecord {
  name: string
  theme?: string | null
  interestTags: string[]
  cohortParticipantIds: string[]
  participantNames: string[]
  participantCount: number
}

export interface CircleSuggestionResultRecord {
  cohortId: string
  suggestedCircles: CircleSuggestionRecord[]
  unplacedParticipantIds: string[]
  unplacedParticipantNames: string[]
}

export interface CohortDashboardRecord {
  cohortId: string
  enrolledCount: number
  selfJoinedCount: number
  pendingConfirmationCount: number
  duplicateReviewCount: number
  plenaryAttendedCount: number
  plenaryAttendanceRate: number
  circleCount: number
  unplacedCount: number
  matchedCount: number
  matchCompletionRate: number
  additionalSessionRequestCount: number
  feedbackResponseRate: number
  riskIndicators: string[]
}

export interface EmployeeCohortStageRecord {
  status: string
  blockedReason?: string | null
}

export interface EmployeeCohortStagesRecord {
  plenary: EmployeeCohortStageRecord
  circle: EmployeeCohortStageRecord
  oneToOne: EmployeeCohortStageRecord
}

export interface EmployeeCompanyProgramCohortRecord {
  cohortId: string
  companyProgramId: string
  cohortParticipantId: string
  companyProgramParticipantId?: string | null
  cohortName: string
  companyProgramName?: string | null
  companyName?: string | null
  chapter?: string | null
  region?: string | null
  cohortStatus: CompanyProgramCohortStatus
  participantStatus: CohortParticipantStatus
  stages: EmployeeCohortStagesRecord
  circle?: CommonInterestCircleRecord | null
  mentorAssignment?: MentorAssignmentSummaryRecord | null
}

export interface CreateCompanyProgramCohortPayload {
  name: string
  code: string
  chapter?: string | null
  region?: string | null
  startsAt?: string | null
  endsAt?: string | null
  selfJoinEnabled?: boolean | null
  selfJoinExpiresAt?: string | null
  selfJoinCapacity?: number | null
  circleMinSize?: number | null
  circleMaxSize?: number | null
  interestTagSet?: string[]
  plenaryEventType?: PlenaryEventType | null
  plenaryEventId?: string | null
  matchingStartsAfterCirclesFinalized?: boolean | null
}

export type UpdateCompanyProgramCohortPayload = Partial<CreateCompanyProgramCohortPayload>

export interface CohortSelfJoinPayload {
  email: string
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
  chapter?: string | null
  region?: string | null
  interestTags?: string[]
}

export interface CohortRosterParticipantPayload {
  profileId?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  chapter?: string | null
  region?: string | null
  interestTags?: string[]
}

export interface AddCohortRosterParticipantsPayload {
  participants: CohortRosterParticipantPayload[]
}

export interface ResolveDuplicatePayload {
  profileId: string
  duplicateStatus: CohortDuplicateStatus
}

export interface ConfirmJoinRequestPayload {
  profileId: string
}

export interface RecordPlenaryAttendancePayload {
  status?: PlenaryAttendanceStatus | null
  attendanceSource?: PlenaryAttendanceSource | null
}

export interface CreateCirclePayload {
  name: string
  theme?: string | null
  interestTags?: string[]
  facilitatorProfileId?: string | null
  minSize?: number | null
  maxSize?: number | null
  nextSessionAt?: string | null
}

export interface UpdateCirclePayload extends Partial<CreateCirclePayload> {
  status?: CircleStatus | null
}

export interface PlaceParticipantPayload {
  cohortParticipantId: string
  placementSource?: CirclePlacementSource | null
}

export interface MoveMembershipPayload {
  targetCircleId: string
}

export interface RequestCirclePayload {
  circleId: string
}

export interface CohortsData {
  companyProgramId: string
  cohorts: CompanyProgramCohortRecord[]
  count: number
}

export interface ParticipantsData {
  cohortId: string
  participants: CompanyProgramCohortParticipantRecord[]
  count: number
}

export interface JoinRequestsData {
  cohortId: string
  joinRequests: CompanyProgramCohortJoinRequestRecord[]
  count: number
}

export interface PlenaryWorkspaceData {
  cohort: CompanyProgramCohortRecord
  participants: CompanyProgramCohortParticipantRecord[]
  attendance: CohortPlenaryAttendanceRecord[]
  participantCount: number
  attendedCount: number
}

export interface CirclesData {
  cohortId: string
  circles: CommonInterestCircleRecord[]
  count: number
}

export interface EmployeeCohortsData {
  cohorts: EmployeeCompanyProgramCohortRecord[]
  count: number
}

const companyProgramCohortsApi = {
  async getCohorts(companyProgramId: string): Promise<ApiEnvelope<CohortsData>> {
    const response = await api.get(`/v1/company-programs/${companyProgramId}/cohorts`)
    return response.data
  },

  async createCohort(companyProgramId: string, payload: CreateCompanyProgramCohortPayload): Promise<ApiEnvelope<CompanyProgramCohortRecord>> {
    const response = await api.post(`/v1/company-programs/${companyProgramId}/cohorts`, payload)
    return response.data
  },

  async getCohort(cohortId: string): Promise<ApiEnvelope<CompanyProgramCohortRecord>> {
    const response = await api.get(`/v1/company-program-cohorts/${cohortId}`)
    return response.data
  },

  async updateCohort(cohortId: string, payload: UpdateCompanyProgramCohortPayload): Promise<ApiEnvelope<CompanyProgramCohortRecord>> {
    const response = await api.patch(`/v1/company-program-cohorts/${cohortId}`, payload)
    return response.data
  },

  async openIntake(cohortId: string): Promise<ApiEnvelope<CompanyProgramCohortRecord>> {
    const response = await api.post(`/v1/company-program-cohorts/${cohortId}/open-intake`)
    return response.data
  },

  async closeIntake(cohortId: string): Promise<ApiEnvelope<CompanyProgramCohortRecord>> {
    const response = await api.post(`/v1/company-program-cohorts/${cohortId}/close-intake`)
    return response.data
  },

  async getJoinPreview(joinCode: string): Promise<ApiEnvelope<CohortSelfJoinRecord>> {
    const response = await api.get(`/v1/company-program-cohorts/join/${joinCode}`)
    return response.data
  },

  async submitSelfJoin(joinCode: string, payload: CohortSelfJoinPayload): Promise<ApiEnvelope<CohortSelfJoinRecord>> {
    const response = await api.post(`/v1/company-program-cohorts/join/${joinCode}`, payload)
    return response.data
  },

  async getParticipants(cohortId: string): Promise<ApiEnvelope<ParticipantsData>> {
    const response = await api.get(`/v1/company-program-cohorts/${cohortId}/participants`)
    return response.data
  },

  async addRosterParticipants(cohortId: string, payload: AddCohortRosterParticipantsPayload): Promise<ApiEnvelope<ParticipantsData>> {
    const response = await api.post(`/v1/company-program-cohorts/${cohortId}/participants`, payload)
    return response.data
  },

  async getJoinRequests(cohortId: string): Promise<ApiEnvelope<JoinRequestsData>> {
    const response = await api.get(`/v1/company-program-cohorts/${cohortId}/join-requests`)
    return response.data
  },

  async confirmJoinRequest(joinRequestId: string, payload: ConfirmJoinRequestPayload): Promise<ApiEnvelope<CompanyProgramCohortParticipantRecord>> {
    const response = await api.post(`/v1/company-program-cohort-join-requests/${joinRequestId}/confirm`, payload)
    return response.data
  },

  async rejectJoinRequest(joinRequestId: string): Promise<ApiEnvelope<CompanyProgramCohortParticipantRecord>> {
    const response = await api.post(`/v1/company-program-cohort-join-requests/${joinRequestId}/reject`)
    return response.data
  },

  async confirmParticipant(participantId: string): Promise<ApiEnvelope<CompanyProgramCohortParticipantRecord>> {
    const response = await api.post(`/v1/company-program-cohort-participants/${participantId}/confirm`)
    return response.data
  },

  async rejectParticipant(participantId: string): Promise<ApiEnvelope<CompanyProgramCohortParticipantRecord>> {
    const response = await api.post(`/v1/company-program-cohort-participants/${participantId}/reject`)
    return response.data
  },

  async resolveDuplicate(participantId: string, payload: ResolveDuplicatePayload): Promise<ApiEnvelope<CompanyProgramCohortParticipantRecord>> {
    const response = await api.post(`/v1/company-program-cohort-participants/${participantId}/resolve-duplicate`, payload)
    return response.data
  },

  async getPlenary(cohortId: string): Promise<ApiEnvelope<PlenaryWorkspaceData>> {
    const response = await api.get(`/v1/company-program-cohorts/${cohortId}/plenary`)
    return response.data
  },

  async recordPlenaryAttendance(participantId: string, payload: RecordPlenaryAttendancePayload): Promise<ApiEnvelope<CompanyProgramCohortParticipantRecord>> {
    const response = await api.post(`/v1/company-program-cohort-participants/${participantId}/plenary-attendance`, payload)
    return response.data
  },

  async getCircles(cohortId: string): Promise<ApiEnvelope<CirclesData>> {
    const response = await api.get(`/v1/company-program-cohorts/${cohortId}/circles`)
    return response.data
  },

  async createCircle(cohortId: string, payload: CreateCirclePayload): Promise<ApiEnvelope<CommonInterestCircleRecord>> {
    const response = await api.post(`/v1/company-program-cohorts/${cohortId}/circles`, payload)
    return response.data
  },

  async updateCircle(circleId: string, payload: UpdateCirclePayload): Promise<ApiEnvelope<CommonInterestCircleRecord>> {
    const response = await api.patch(`/v1/common-interest-circles/${circleId}`, payload)
    return response.data
  },

  async suggestCircles(cohortId: string): Promise<ApiEnvelope<CircleSuggestionResultRecord>> {
    const response = await api.post(`/v1/company-program-cohorts/${cohortId}/circle-suggestions`)
    return response.data
  },

  async placeParticipant(circleId: string, payload: PlaceParticipantPayload): Promise<ApiEnvelope<CommonInterestCircleRecord>> {
    const response = await api.post(`/v1/common-interest-circles/${circleId}/members`, payload)
    return response.data
  },

  async removeMembership(membershipId: string): Promise<ApiEnvelope<CommonInterestCircleRecord>> {
    const response = await api.delete(`/v1/common-interest-circle-memberships/${membershipId}`)
    return response.data
  },

  async moveMembership(membershipId: string, payload: MoveMembershipPayload): Promise<ApiEnvelope<CommonInterestCircleRecord>> {
    const response = await api.post(`/v1/common-interest-circle-memberships/${membershipId}/move`, payload)
    return response.data
  },

  async finalizeCircles(cohortId: string): Promise<ApiEnvelope<CirclesData>> {
    const response = await api.post(`/v1/company-program-cohorts/${cohortId}/circles/finalize`)
    return response.data
  },

  async getDashboard(cohortId: string): Promise<ApiEnvelope<CohortDashboardRecord>> {
    const response = await api.get(`/v1/company-program-cohorts/${cohortId}/dashboard`)
    return response.data
  },

  async getMyCohorts(): Promise<ApiEnvelope<EmployeeCohortsData>> {
    const response = await api.get('/v1/me/company-program-cohorts')
    return response.data
  },

  async getMyCohort(cohortId: string): Promise<ApiEnvelope<EmployeeCompanyProgramCohortRecord>> {
    const response = await api.get(`/v1/me/company-program-cohorts/${cohortId}`)
    return response.data
  },

  async getMyCohortCircles(cohortId: string): Promise<ApiEnvelope<CirclesData>> {
    const response = await api.get(`/v1/me/company-program-cohorts/${cohortId}/circles`)
    return response.data
  },

  async requestCircle(cohortId: string, payload: RequestCirclePayload): Promise<ApiEnvelope<EmployeeCompanyProgramCohortRecord>> {
    const response = await api.post(`/v1/me/company-program-cohorts/${cohortId}/circle-requests`, payload)
    return response.data
  },
}

export default companyProgramCohortsApi
