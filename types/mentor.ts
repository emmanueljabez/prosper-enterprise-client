// Base mentor information types
export interface MentorProfile {
  id: string
  userId: string
  
  // Basic Information
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  profilePhoto?: string
  
  // Professional Information
  title: string
  company: string
  industry: string
  experienceYears: number
  location: string
  timezone: string
  
  // Mentoring Details
  hourlyRate: number
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'
  minSessionDuration: number // in minutes
  maxSessionDuration: number // in minutes
  maxMentees: number
  currentMentees: number
  
  // Profile Content
  profileSummary: string
  mentoringPhilosophy?: string
  communicationStyle: CommunicationStyle
  
  // Skills and Expertise
  expertiseAreas: string[]
  skills: string[]
  mentorshipFocus: string[]
  preferredSessionTypes: SessionType[]
  
  // Education and Credentials
  education: Education[]
  certifications: Certification[]
  workExperience: WorkExperience[]
  
  // Social Links
  linkedinUrl?: string
  twitterUrl?: string
  websiteUrl?: string
  
  // Verification and Status
  verificationStatus: VerificationStatus
  verificationBadges: VerificationBadge[]
  isActive: boolean
  isAvailable: boolean
  lastActiveAt: Date
  
  // Ratings and Reviews
  averageRating: number
  totalReviews: number
  totalSessions: number
  responseRate: number // percentage
  responseTime: number // in hours
  
  // Preferences
  preferredLanguages: string[]
  availableForEmergency: boolean
  acceptsGroupSessions: boolean
  
  // Marketplace Data
  joinedAt: Date
  profileCompleteness: number // percentage
  featured: boolean
  profileViews: number
  
  // Settings
  publicProfile: boolean
  allowDirectBooking: boolean
  requiresApproval: boolean
  autoAcceptRequests: boolean
}

export interface Education {
  id: string
  degree: string
  institution: string
  year: string
  field?: string
  gpa?: string
  honors?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  year: string
  credentialUrl?: string
  expirationDate?: Date
  verified: boolean
}

export interface WorkExperience {
  id: string
  title: string
  company: string
  startYear: string
  endYear: string
  description?: string
  achievements?: string[]
  current: boolean
}

// Verification and Badges
export type VerificationStatus = 
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'under_review'
  | 'incomplete'

export interface VerificationBadge {
  id: string
  type: VerificationBadgeType
  name: string
  description: string
  iconUrl?: string
  earnedAt: Date
  verified: boolean
}

export type VerificationBadgeType =
  | 'identity_verified'
  | 'education_verified'
  | 'certification_verified'
  | 'background_check'
  | 'top_rated'
  | 'rising_star'
  | 'expert_certified'
  | 'industry_leader'
  | 'community_favorite'

// Communication and Session Types
export type CommunicationStyle =
  | 'direct'
  | 'supportive' 
  | 'analytical'
  | 'collaborative'
  | 'structured'
  | 'flexible'

export type SessionType =
  | 'video_call'
  | 'phone_call'
  | 'chat_only'
  | 'screen_sharing'
  | 'code_review'
  | 'presentation'
  | 'workshop'
  | 'office_hours'

// Search and Discovery Types
export interface MentorSearchParams {
  query?: string
  expertiseAreas?: string[]
  skills?: string[]
  industries?: string[]
  experienceYears?: {
    min?: number
    max?: number
  }
  hourlyRate?: {
    min?: number
    max?: number
  }
  rating?: {
    min?: number
  }
  availability?: {
    timezone?: string
    preferredTimes?: string[]
    emergencyAvailable?: boolean
  }
  sessionTypes?: SessionType[]
  communicationStyles?: CommunicationStyle[]
  languages?: string[]
  verificationStatus?: VerificationStatus[]
  verificationBadges?: VerificationBadgeType[]
  location?: {
    country?: string
    city?: string
    timezone?: string
  }
  sortBy?: MentorSortOption
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
  featured?: boolean
}

export type MentorSortOption =
  | 'relevance'
  | 'rating'
  | 'price_low_to_high'
  | 'price_high_to_low'
  | 'experience'
  | 'newest'
  | 'most_popular'
  | 'response_time'
  | 'availability'

export interface MentorSearchResult {
  mentors: MentorListingCard[]
  totalCount: number
  totalPages: number
  currentPage: number
  hasMore: boolean
  filters: SearchFilters
  suggestions?: SearchSuggestion[]
}

export interface MentorListingCard {
  id: string
  firstName: string
  lastName: string
  title: string
  company: string
  industry: string
  profilePhoto?: string
  profileSummary: string
  expertiseAreas: string[]
  skills: string[]
  averageRating: number
  totalReviews: number
  totalSessions: number
  hourlyRate: number
  currency: string
  responseTime: number
  responseRate: number
  verificationBadges: VerificationBadge[]
  isAvailable: boolean
  timezone: string
  preferredSessionTypes: SessionType[]
  featured: boolean
  matchScore?: number // relevance score from 0-100
}

// Filter Options and Facets
export interface SearchFilters {
  expertiseAreas: FilterOption[]
  skills: FilterOption[]
  industries: FilterOption[]
  experienceRanges: FilterOption[]
  priceRanges: FilterOption[]
  ratingRanges: FilterOption[]
  sessionTypes: FilterOption[]
  communicationStyles: FilterOption[]
  languages: FilterOption[]
  verificationBadges: FilterOption[]
  timezones: FilterOption[]
  availability: FilterOption[]
}

export interface FilterOption {
  value: string
  label: string
  count: number
  selected: boolean
}

export interface SearchSuggestion {
  type: 'expertise' | 'skill' | 'industry' | 'mentor'
  value: string
  label: string
  count?: number
}

// Mentor Matching and Recommendations
export interface MentorMatchingCriteria {
  goals: string[]
  currentRole: string
  industry: string
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive'
  skillsToLearn: string[]
  preferredCommunicationStyle: CommunicationStyle[]
  availabilityPreferences: {
    timezone: string
    preferredTimes: string[]
    frequency: 'weekly' | 'biweekly' | 'monthly'
    preferredLanguages?: string[] // Added for language preferences
  }
  budgetRange: {
    min: number
    max: number
    currency: string
  }
  sessionPreferences: SessionType[]
  mentorPreferences: {
    experienceYears?: number
    sameIndustry?: boolean
    diverseBackground?: boolean
    genderPreference?: string
  }
}

export interface MentorRecommendation {
  mentor: MentorListingCard
  matchScore: number
  matchReasons: MatchReason[]
  compatibilityFactors: CompatibilityFactor[]
  estimatedFit: 'excellent' | 'good' | 'fair'
}

export interface MatchReason {
  factor: 'expertise' | 'experience' | 'communication' | 'availability' | 'price' | 'reviews'
  description: string
  score: number
}

export interface CompatibilityFactor {
  name: string
  score: number
  description: string
}

// Marketplace Analytics and Insights
export interface MentorMarketplaceStats {
  totalMentors: number
  activeMentors: number
  verifiedMentors: number
  averageRating: number
  totalSessions: number
  popularExpertiseAreas: {
    area: string
    mentorCount: number
    demandScore: number
  }[]
  priceRangeDistribution: {
    range: string
    count: number
    percentage: number
  }[]
  industryDistribution: {
    industry: string
    count: number
    percentage: number
  }[]
}

// Mentor Discovery UI State
export interface MentorDiscoveryState {
  searchParams: MentorSearchParams
  searchResults: MentorSearchResult | null
  isLoading: boolean
  isSearching: boolean
  error: string | null
  selectedFilters: Record<string, string[]>
  activeSort: MentorSortOption
  viewMode: 'grid' | 'list'
  favorites: string[]
  recentlyViewed: string[]
  recommendations: MentorRecommendation[]
  searchHistory: string[]
}

// Mentor Availability Types
export interface MentorAvailability {
  mentorId: string
  timezone: string
  weeklySchedule: WeeklySchedule
  exceptions: AvailabilityException[]
  blackoutDates: DateRange[]
  automaticBooking: boolean
  bufferTime: number // minutes between sessions
  advanceBookingLimit: number // days in advance
  cancellationPolicy: CancellationPolicy
}

export interface WeeklySchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export interface DaySchedule {
  available: boolean
  timeSlots: TimeSlot[]
}

export interface TimeSlot {
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  available: boolean
  sessionType?: SessionType
}

export interface AvailabilityException {
  date: Date
  available: boolean
  customSchedule?: DaySchedule
  reason?: string
}

export interface DateRange {
  startDate: Date
  endDate: Date
  reason?: string
}

export interface CancellationPolicy {
  allowCancellation: boolean
  advanceNoticeHours: number
  refundPolicy: 'full' | 'partial' | 'none'
  rescheduleAllowed: boolean
}

// API Response Types
export interface MentorApiResponse {
  mentor: MentorProfile
  availability?: MentorAvailability
  reviews?: MentorReview[]
  sessions?: MentorSession[]
}

// Review and Rating Types
export interface MentorReview {
  id: string
  mentorId: string
  reviewerId: string
  sessionId?: string
  
  // Review Content
  rating: number // 1-5 stars
  title: string
  content: string
  
  // Review Categories (optional detailed ratings)
  categoryRatings?: {
    communication: number
    expertise: number
    helpfulness: number
    availability: number
    valueForMoney: number
  }
  
  // Review Metadata
  isVerified: boolean // verified purchase/session
  isAnonymous: boolean
  createdAt: Date
  updatedAt?: Date
  
  // Moderation
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  moderationNotes?: string
  moderatedBy?: string
  moderatedAt?: Date
  
  // Engagement
  helpfulCount: number
  notHelpfulCount: number
  replyCount: number
  
  // Reviewer Information (when not anonymous)
  reviewer?: {
    id: string
    name: string
    avatar?: string
    isVerifiedPurchaser: boolean
    totalReviews: number
  }
  
  // Mentor Response
  mentorResponse?: {
    content: string
    createdAt: Date
    isEdited: boolean
  }
  
  // Additional Context
  sessionDetails?: {
    duration: number // minutes
    sessionType: SessionType
    topics: string[]
    completionDate: Date
  }
}

export interface ReviewSubmission {
  mentorId: string
  sessionId?: string
  rating: number
  title: string
  content: string
  categoryRatings?: {
    communication: number
    expertise: number
    helpfulness: number
    availability: number
    valueForMoney: number
  }
  isAnonymous: boolean
  tags?: string[]
}

export interface ReviewFilters {
  rating?: number[] // e.g., [4, 5] for 4+ stars
  verified?: boolean
  hasContent?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  categories?: string[]
  sortBy?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful'
  limit?: number
  offset?: number
}

export interface ReviewSummary {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  categoryAverages?: {
    communication: number
    expertise: number
    helpfulness: number
    availability: number
    valueForMoney: number
  }
  verifiedReviewsCount: number
  verifiedPercentage: number
  responseRate: number // percentage of reviews mentor has responded to
  averageResponseTime: number // hours
  recommendationPercentage: number
}

export interface ReviewAnalytics {
  mentor: {
    id: string
    name: string
    totalReviews: number
    averageRating: number
    responseRate: number
  }
  timeframes: {
    last30Days: ReviewSummary
    last90Days: ReviewSummary
    last12Months: ReviewSummary
    allTime: ReviewSummary
  }
  trends: {
    ratingTrend: Array<{
      period: string
      averageRating: number
      reviewCount: number
    }>
    categoryTrends: {
      communication: Array<{ period: string; rating: number }>
      expertise: Array<{ period: string; rating: number }>
      helpfulness: Array<{ period: string; rating: number }>
      availability: Array<{ period: string; rating: number }>
      valueForMoney: Array<{ period: string; rating: number }>
    }
  }
  insights: {
    mostCommonPositives: string[]
    mostCommonNegatives: string[]
    improvementAreas: string[]
    strengths: string[]
  }
}

export interface ReviewModerationQueue {
  reviews: Array<MentorReview & {
    flagReasons?: string[]
    flaggedBy?: string[]
    priority: 'low' | 'medium' | 'high'
  }>
  stats: {
    pending: number
    flagged: number
    totalToday: number
    averageProcessingTime: number
  }
}

export interface ReviewHelpfulness {
  reviewId: string
  userId: string
  isHelpful: boolean
  createdAt: Date
}

export interface ReviewReport {
  reviewId: string
  reporterId: string
  reason: 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'other'
  description?: string
  createdAt: Date
  status: 'pending' | 'reviewed' | 'resolved'
}

// Review Display Components Types
export interface ReviewListProps {
  mentorId: string
  reviews?: MentorReview[]
  isLoading?: boolean
  filters?: ReviewFilters
  onFilterChange?: (filters: ReviewFilters) => void
  onReviewHelpful?: (reviewId: string, isHelpful: boolean) => void
  onReportReview?: (reviewId: string, reason: string, description?: string) => void
  showModeration?: boolean
}

export interface ReviewFormProps {
  mentorId: string
  sessionId?: string
  onSubmit?: (review: ReviewSubmission) => void
  onCancel?: () => void
  isSubmitting?: boolean
  existingReview?: MentorReview
}

export interface ReviewStatsProps {
  summary: ReviewSummary
  showDetails?: boolean
  compact?: boolean
}

export interface ReviewCardProps {
  review: MentorReview
  onHelpful?: (isHelpful: boolean) => void
  onReport?: (reason: string, description?: string) => void
  onMentorReply?: (content: string) => void
  showModeration?: boolean
  showMentorResponse?: boolean
  currentUserId?: string
}

// Review Validation
export interface ReviewValidation {
  isValid: boolean
  errors: {
    rating?: string
    title?: string
    content?: string
    categoryRatings?: Record<string, string>
  }
}

// Review Settings
export interface ReviewSettings {
  allowAnonymous: boolean
  requireVerifiedPurchase: boolean
  autoApprove: boolean
  enableCategoryRatings: boolean
  enableMentorResponses: boolean
  minimumContentLength: number
  maximumContentLength: number
  moderationKeywords: string[]
  responseTimeLimit: number // days
}

// Mentor Onboarding Types
export interface MentorOnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
  order: number
}

export interface MentorOnboardingProgress {
  mentorId: string
  currentStep: number
  totalSteps: number
  percentComplete: number
  steps: MentorOnboardingStep[]
  submittedAt?: Date
  approvedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
}

// Export helper types
export type CreateMentorProfileRequest = Omit<
  MentorProfile, 
  'id' | 'userId' | 'averageRating' | 'totalReviews' | 'totalSessions' | 
  'responseRate' | 'responseTime' | 'joinedAt' | 'profileViews' | 'currentMentees'
>

export type UpdateMentorProfileRequest = Partial<CreateMentorProfileRequest>

export type MentorProfilePublic = Omit<
  MentorProfile,
  'email' | 'phoneNumber' | 'requiresApproval' | 'autoAcceptRequests'
>

// Utility functions types
export interface MentorUtils {
  calculateMatchScore: (mentor: MentorProfile, criteria: MentorMatchingCriteria) => number
  formatMentorCard: (mentor: MentorProfile) => MentorListingCard
  buildSearchQuery: (params: MentorSearchParams) => string
  validateMentorProfile: (profile: Partial<MentorProfile>) => ValidationResult
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  completeness: number
}

// Program/Topic Types for Mentorship Programs
export interface MentorProgram {
  id: string
  name: string
  description: string
  category: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all'
  duration?: string // e.g., "4-6 weeks", "3 months"
  mentorCount: number
  totalSessions: number
  averageRating: number
  tags: string[]
  icon?: string
  imageUrl?: string
  isPopular?: boolean
  isFeatured?: boolean
  learningOutcomes: string[]
  prerequisites?: string[]
  relatedSkills: string[]
}

export interface ProgramCategory {
  id: string
  name: string
  description: string
  icon?: string
  programCount: number
  mentorCount: number
  color?: string
}

export interface ProgramSearchParams {
  query?: string
  category?: string
  skillLevel?: string[]
  tags?: string[]
  sortBy?: 'popularity' | 'mentorCount' | 'rating' | 'newest'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  page?: number
}

export interface ProgramSearchResult {
  programs: MentorProgram[]
  categories: ProgramCategory[]
  totalCount: number
  hasMore: boolean
  currentPage: number
}

export interface ProgramMentorFilter {
  programId: string
  programName: string
  mentorIds: string[]
  searchParams?: MentorSearchParams
}

export default {
  // Export all types for easy importing
} 

// Scheduling and Availability Types
export interface MentorSchedule {
  id: string
  mentorId: string
  
  // Weekly recurring schedule
  weeklySchedule: WeeklySchedule
  
  // Timezone information
  timezone: string
  timezoneOffset: number // UTC offset in minutes
  
  // Booking settings
  bookingSettings: {
    advanceBookingDays: number // How far in advance can sessions be booked
    minAdvanceHours: number // Minimum advance notice required
    maxSessionsPerDay: number
    maxSessionsPerWeek: number
    bufferBetweenSessions: number // Minutes between sessions
    allowBackToBackSessions: boolean
    autoAcceptBookings: boolean
    requireApproval: boolean
  }
  
  // Break settings
  breakSettings: {
    lunchBreak?: {
      startTime: string // HH:mm format
      endTime: string
      enabled: boolean
    }
    shortBreaks?: {
      duration: number // minutes
      frequency: number // every X sessions
      enabled: boolean
    }
  }
  
  // Availability overrides
  exceptions: AvailabilityException[]
  
  // Schedule preferences
  preferences: {
    preferredSessionLengths: number[] // [30, 45, 60, 90] minutes
    allowedSessionTypes: SessionType[]
    maxConsecutiveSessions: number
    preferredMeetingPlatforms: string[] // ['zoom', 'google-meet', 'teams']
  }
  
  // Sync settings
  calendarSync: {
    enabled: boolean
    provider?: 'google' | 'outlook' | 'apple'
    calendarId?: string
    syncBusyTimes: boolean
    createEventsAutomatically: boolean
    lastSyncAt?: Date
  }
  
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MentorSession {
  id: string
  mentorId: string
  menteeId: string
  
  // Session details
  title: string
  description?: string
  sessionType: SessionType
  
  // Timing
  scheduledStart: Date
  scheduledEnd: Date
  actualStart?: Date
  actualEnd?: Date
  duration: number // planned duration in minutes
  
  // Location/Platform
  platform: 'zoom' | 'google-meet' | 'teams' | 'phone' | 'in-person'
  meetingLink?: string
  meetingId?: string
  dialInNumber?: string
  location?: string // for in-person meetings
  
  // Booking information
  bookedAt: Date
  bookedBy: string // mentee ID
  bookingNotes?: string
  
  // Session status
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled'
  cancellationReason?: string
  cancellationFee?: number
  rescheduledFrom?: string // original session ID
  
  // Preparation and follow-up
  preparationMaterials?: string[]
  sessionNotes?: string
  actionItems?: string[]
  followUpRequired: boolean
  followUpDate?: Date
  
  // Payment
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'disputed'
  amount: number
  currency: string
  paymentMethod?: string
  transactionId?: string
  
  // Ratings and feedback
  mentorRating?: number
  menteeRating?: number
  mentorFeedback?: string
  menteeFeedback?: string
  
  // Reminders
  reminders: SessionReminder[]
  
  createdAt: Date
  updatedAt: Date
}

export interface SessionReminder {
  id: string
  sessionId: string
  recipientId: string
  type: 'email' | 'sms' | 'push' | 'in-app'
  scheduledFor: Date
  sentAt?: Date
  status: 'pending' | 'sent' | 'failed'
  template: 'session-reminder-24h' | 'session-reminder-1h' | 'session-starting' | 'session-followup'
}

export interface BookingRequest {
  id: string
  mentorId: string
  menteeId: string
  
  // Requested session details
  requestedStart: Date
  requestedEnd: Date
  sessionType: SessionType
  platform: string
  message?: string
  urgentRequest: boolean
  
  // Booking status
  status: 'pending' | 'approved' | 'declined' | 'expired'
  response?: string
  respondedAt?: Date
  expiresAt: Date
  
  // Alternative times (if declined)
  suggestedTimes?: Array<{
    start: Date
    end: Date
    note?: string
  }>
  
  // Payment information
  estimatedCost: number
  currency: string
  
  createdAt: Date
  updatedAt: Date
}

export interface AvailabilitySlot {
  id: string
  mentorId: string
  
  // Time slot
  startTime: Date
  endTime: Date
  duration: number // minutes
  
  // Availability status
  isAvailable: boolean
  isRecurring: boolean
  recurrenceRule?: string // RRULE format
  
  // Booking restrictions
  maxBookings: number
  currentBookings: number
  allowedSessionTypes: SessionType[]
  
  // Pricing (if different from default)
  specialPricing?: {
    rate: number
    currency: string
    reason: string // e.g., "peak hours", "weekend premium"
  }
  
  // Override information
  isException: boolean
  exceptionReason?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  allDay: boolean
  
  // Event type
  type: 'session' | 'break' | 'blocked' | 'personal' | 'external'
  
  // Related entities
  sessionId?: string
  mentorId?: string
  menteeId?: string
  
  // Meeting details
  meetingLink?: string
  location?: string
  attendees: string[]
  
  // Sync information
  externalId?: string
  provider?: 'google' | 'outlook' | 'apple'
  lastSyncAt?: Date
  
  // Status
  status: 'tentative' | 'confirmed' | 'cancelled'
  
  // Reminders
  reminders: Array<{
    type: 'email' | 'popup'
    minutesBefore: number
  }>
  
  createdAt: Date
  updatedAt: Date
}

// Component Props Types
export interface AvailabilityCalendarProps {
  mentorId: string
  selectedDate?: Date
  viewMode: 'week' | 'month'
  timeZone?: string
  onSlotSelect?: (slot: AvailabilitySlot) => void
  onSessionSelect?: (session: MentorSession) => void
  showBookingForm?: boolean
  allowBooking?: boolean
}

export interface BookingFormProps {
  mentorId: string
  selectedSlot?: AvailabilitySlot
  onSubmit?: (booking: BookingRequest) => void
  onCancel?: () => void
  isSubmitting?: boolean
}

export interface SessionManagerProps {
  mentorId?: string
  menteeId?: string
  sessions: MentorSession[]
  isLoading?: boolean
  onReschedule?: (sessionId: string, newTime: Date) => void
  onCancel?: (sessionId: string, reason: string) => void
  onJoin?: (sessionId: string) => void
}

// Scheduling Utilities
export interface TimeSlot {
  start: string // HH:mm format
  end: string // HH:mm format
  isAvailable: boolean
  reason?: string // if not available
}

export interface SchedulingConflict {
  type: 'existing-session' | 'blocked-time' | 'break' | 'outside-hours' | 'too-close'
  conflictingSessionId?: string
  conflictingEventId?: string
  message: string
  suggestedAlternatives?: Date[]
}

export interface AvailabilityCheck {
  isAvailable: boolean
  conflicts: SchedulingConflict[]
  nextAvailableSlot?: Date
  suggestedTimes: Date[]
}

// Bulk Operations
export interface BulkScheduleUpdate {
  operation: 'block' | 'unblock' | 'set-available' | 'set-unavailable'
  dateRange: {
    start: Date
    end: Date
  }
  timeRange?: {
    start: string // HH:mm
    end: string // HH:mm
  }
  reason?: string
  affectedDays?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[]
}

// Analytics and Reporting
export interface SchedulingAnalytics {
  period: {
    start: Date
    end: Date
  }
  
  utilization: {
    totalAvailableHours: number
    totalBookedHours: number
    utilizationRate: number // percentage
    peakHours: Array<{
      hour: number
      bookingCount: number
    }>
    peakDays: Array<{
      dayOfWeek: number
      bookingCount: number
    }>
  }
  
  bookings: {
    total: number
    confirmed: number
    cancelled: number
    noShows: number
    cancellationRate: number
    noShowRate: number
    averageAdvanceBooking: number // days
  }
  
  revenue: {
    totalPotential: number
    totalEarned: number
    averageSessionValue: number
    missedRevenue: number // from cancellations/no-shows
  }
  
  satisfaction: {
    averageRating: number
    totalRatings: number
    repeatBookingRate: number
  }
}

// Calendar Integration Types
export interface CalendarIntegration {
  id: string
  mentorId: string
  provider: 'google' | 'outlook' | 'apple'
  
  // Auth information
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  
  // Sync settings
  calendarId: string
  calendarName: string
  syncDirection: 'one-way' | 'two-way'
  syncFrequency: number // minutes
  
  // Sync rules
  syncSettings: {
    createEventsForSessions: boolean
    blockTimeForPersonalEvents: boolean
    syncBusyTimes: boolean
    eventPrefix?: string
    defaultEventDuration: number // minutes
    includeSessionNotes: boolean
    inviteAttendeesAutomatically: boolean
  }
  
  // Status
  isActive: boolean
  lastSyncAt?: Date
  lastSyncStatus: 'success' | 'error' | 'partial'
  lastSyncError?: string
  
  // Statistics
  eventsSynced: number
  conflictsDetected: number
  
  createdAt: Date
  updatedAt: Date
} 