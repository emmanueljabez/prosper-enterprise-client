import api from '@/http/axios'

export type MyReviewType = 'SESSION' | 'FIT'
export type MyReviewRole = 'MENTOR' | 'MENTEE'
export type MyReviewRequestStatus = 'PENDING' | 'SENT' | 'DELIVERY_FAILED' | 'SUBMITTED' | 'EXPIRED' | 'CANCELLED'
export type MyReviewCycleStatus = 'OPEN' | 'PARTIALLY_SUBMITTED' | 'REVEALED' | 'EXPIRED_PARTIAL' | 'EXPIRED_EMPTY' | 'CANCELLED'

export interface MyReviewSummaryRecord {
  totalReviews: number
  actionRequired: number
  awaitingReveal: number
  revealed: number
  expired: number
  deliveryIssues: number
}

export interface MyReviewRecord {
  reviewRequestId: string
  reviewCycleId?: string | null
  companyProgramId?: string | null
  companyProgramName?: string | null
  participantId?: string | null
  sessionId?: string | null
  sessionTitle?: string | null
  sessionScheduledStart?: string | null
  reviewType?: MyReviewType | null
  reviewerRole?: MyReviewRole | null
  targetName?: string | null
  requestStatus: MyReviewRequestStatus
  cycleStatus?: MyReviewCycleStatus | null
  sentAt?: string | null
  submittedAt?: string | null
  expiresAt?: string | null
  revealedAt?: string | null
  answeredQuestions?: number | null
  overallScore?: number | null
  recommendContinue?: boolean | null
  optionalComment?: string | null
  actionRequired: boolean
  awaitingReveal: boolean
  revealed: boolean
  expired: boolean
  deliveryIssue: boolean
}

export interface MyReviewsResponse {
  success: boolean
  message: string
  data: {
    summary: MyReviewSummaryRecord
    reviews: MyReviewRecord[]
    count: number
  } | null
}

export default {
  async getMyReviews(): Promise<MyReviewsResponse> {
    const { data } = await api.get('/v1/me/reviews')
    return data
  },
}
