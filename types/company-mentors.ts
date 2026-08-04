export type CompanyMentorVisibilityMode =
  | 'COMPANY_PRIVATE'
  | 'PROGRAM_RESTRICTED'
  | 'PUBLIC_REQUESTED'
  | 'PUBLIC_APPROVED'

export type CompanyMentorInvitationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'FAILED_DELIVERY'

export type CompanyMentorDeliveryStatus =
  | 'NOT_ATTEMPTED'
  | 'SENT'
  | 'FAILED'
  | 'DELIVERED'

export type CompanyMentorMembershipStatus =
  | 'PENDING_INVITE'
  | 'ACTIVE'
  | 'REMOVED'
  | 'SUSPENDED'

export type CompanyMentorPublicApprovalStatus =
  | 'NOT_REQUESTED'
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'

export interface CompanyMentorApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface CompanyMentorInvitation {
  id: string
  companyId: string
  companyName?: string | null
  email: string
  phone: string
  firstName?: string | null
  lastName?: string | null
  title?: string | null
  department?: string | null
  tags?: string[]
  defaultVisibility: CompanyMentorVisibilityMode
  programOrCohortReference?: string | null
  status: CompanyMentorInvitationStatus
  emailDeliveryStatus: CompanyMentorDeliveryStatus
  whatsappDeliveryStatus: CompanyMentorDeliveryStatus
  acceptedProfileId?: string | null
  acceptedAt?: string | null
  lastSentAt?: string | null
  invitationTokenExpiresAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CompanyMentorProgramScope {
  id?: string | null
  companyProgramId?: string | null
  companyProgramName?: string | null
  cohortId?: string | null
}

export interface CompanyMentorPoolMember {
  id: string
  companyId: string
  mentorProfileId: string
  sourceInvitationId?: string | null
  mentorName?: string | null
  mentorEmail?: string | null
  phone?: string | null
  title?: string | null
  department?: string | null
  tags?: string[]
  visibilityMode: CompanyMentorVisibilityMode
  membershipStatus: CompanyMentorMembershipStatus
  profileComplete: boolean
  availabilityComplete: boolean
  companyBookable: boolean
  publicApprovalStatus: CompanyMentorPublicApprovalStatus
  publicListingPreexisting: boolean
  programScopes?: CompanyMentorProgramScope[]
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CompanyMentorPoolMetrics {
  totalCompanyMentors: number
  pendingInvites: number
  acceptedIncompleteProfile: number
  profileCompleteNoAvailability: number
  companyBookable: number
  publicRequested: number
  publicApproved: number
  failedEmailDeliveries: number
  failedWhatsappDeliveries: number
}

export interface CompanyMentorPool {
  invitations: CompanyMentorInvitation[]
  members: CompanyMentorPoolMember[]
  metrics: CompanyMentorPoolMetrics
}

export type CompanyMentorPoolResponse = CompanyMentorApiResponse<CompanyMentorPool>

export interface CompanyMentorInvitePayload {
  email: string
  phone: string
  firstName?: string | null
  lastName?: string | null
  title?: string | null
  department?: string | null
  tags?: string[]
  defaultVisibility?: CompanyMentorVisibilityMode | null
  companyProgramIds?: string[]
  cohortReference?: string | null
}

export type CompanyMentorInviteResponse = CompanyMentorApiResponse<CompanyMentorInvitation>

export interface CompanyMentorImportRowError {
  rowNumber: number
  field: string
  value?: string | null
  reason: string
}

export interface CompanyMentorImportRow {
  rowNumber: number
  email?: string | null
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
  title?: string | null
  department?: string | null
  tags?: string[]
  visibility?: CompanyMentorVisibilityMode | null
  programOrCohortReference?: string | null
  existingProsperMentor: boolean
  errors: CompanyMentorImportRowError[]
}

export interface CompanyMentorImportValidation {
  valid: boolean
  totalRows: number
  validRows: number
  errorRows: number
  rows: CompanyMentorImportRow[]
  errors: CompanyMentorImportRowError[]
}

export type CompanyMentorImportValidationResponse = CompanyMentorApiResponse<CompanyMentorImportValidation>

export interface CompanyMentorVisibilityPayload {
  visibilityMode: CompanyMentorVisibilityMode
  companyProgramIds?: string[]
  cohortIds?: string[]
}

export type CompanyMentorVisibilityResponse = CompanyMentorApiResponse<CompanyMentorPoolMember>
