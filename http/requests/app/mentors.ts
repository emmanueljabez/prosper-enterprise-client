import api from '@/http/axios'
import type {
  MentorProfile,
  MentorSearchParams,
  MentorSearchResult,
  MentorListingCard,
  MentorRecommendation,
  MentorMatchingCriteria,
  MentorAvailability,
  MentorReview,
  MentorMarketplaceStats,
  MentorOnboardingProgress,
  CreateMentorProfileRequest,
  UpdateMentorProfileRequest,
  MentorProfilePublic,
  SearchFilters,
  SearchSuggestion
} from '@/types/mentor'

// Import mock data for development
import { 
  mockMentors, 
  mockMarketplaceStats, 
  mockSearchSuggestions, 
  mockFilters,
  mockReviews,
  mockReviewSummaries
} from '@/mock/mockMentorData.js'

// Helper to simulate API delay
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mentor Discovery and Search
export const mentorDiscoveryApi = {
  /**
   * Search mentors with filters, sorting, and pagination
   */
  async searchMentors(params: {
    query?: string
    page?: number
    limit?: number
    filters?: any
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{
    mentors: MentorListingCard[]
    totalCount: number
  }> {
    await simulateDelay(300)
    
    let filteredMentors = [...mockMentors]
    
    // Apply search query filter
    if (params.query) {
      const query = params.query.toLowerCase()
      filteredMentors = filteredMentors.filter((mentor: any) =>
        mentor.name?.toLowerCase().includes(query) ||
        mentor.title?.toLowerCase().includes(query) ||
        mentor.expertiseAreas?.some((area: any) => area.toLowerCase().includes(query)) ||
        mentor.skills?.some((skill: any) => skill.toLowerCase().includes(query)) ||
        mentor.industries?.some((industry: any) => industry.toLowerCase().includes(query))
      )
    }
    
    // Apply filters
    if (params.filters) {
      const { expertiseAreas, industries, priceRange, rating, sessionTypes } = params.filters
      
      if (expertiseAreas?.length) {
        filteredMentors = filteredMentors.filter((mentor: any) =>
          mentor.expertiseAreas?.some((area: any) => expertiseAreas.includes(area))
        )
      }
      
      if (industries?.length) {
        filteredMentors = filteredMentors.filter((mentor: any) =>
          mentor.industries?.some((industry: any) => industries.includes(industry))
        )
      }
      
      if (priceRange) {
        const [min, max] = priceRange
        filteredMentors = filteredMentors.filter((mentor: any) =>
          mentor.hourlyRate >= min && mentor.hourlyRate <= max
        )
      }
      
      if (rating) {
        filteredMentors = filteredMentors.filter((mentor: any) => mentor.rating >= rating)
      }
      
      if (sessionTypes?.length) {
        filteredMentors = filteredMentors.filter((mentor: any) =>
          mentor.sessionTypes?.some((type: any) => sessionTypes.includes(type))
        )
      }
    }
    
    // Apply sorting
    if (params.sortBy) {
      filteredMentors.sort((a: any, b: any) => {
        let aValue, bValue
        
        switch (params.sortBy) {
          case 'rating':
            aValue = a.rating || 0
            bValue = b.rating || 0
            break
          case 'price':
            aValue = a.hourlyRate || 0
            bValue = b.hourlyRate || 0
            break
          case 'experience':
            aValue = a.experience?.years || 0
            bValue = b.experience?.years || 0
            break
          case 'sessions':
            aValue = a.sessionCount || 0
            bValue = b.sessionCount || 0
            break
          default:
            aValue = a.name || ''
            bValue = b.name || ''
        }
        
        if (params.sortOrder === 'desc') {
          return aValue > bValue ? -1 : 1
        }
        return aValue < bValue ? -1 : 1
      })
    }
    
    // Apply pagination
    const page = params.page || 1
    const limit = params.limit || 12
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedMentors = filteredMentors.slice(startIndex, endIndex)
    
    return {
      mentors: paginatedMentors as any,
      totalCount: filteredMentors.length
    }
  },

  /**
   * Get featured mentors for homepage/spotlight
   */
  async getFeaturedMentors(limit = 6): Promise<MentorListingCard[]> {
    await simulateDelay(300)
    
    // Get featured mentors (those marked as featured)
    const featuredMentors = mockMentors
      .filter(mentor => mentor.isFeatured)
      .slice(0, limit)
    
    return featuredMentors as any
  },

  /**
   * Get trending mentors based on recent activity
   */
  async getTrendingMentors(limit = 6): Promise<MentorListingCard[]> {
    await simulateDelay(300)

    // Get trending mentors (sort by profile views and recent activity)
    const trendingMentors = mockMentors
      .filter(mentor => mentor.sessionCount > 50)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
    
    return trendingMentors as any
  },

  /**
   * Get marketplace statistics
   */
  async getMarketplaceStats(): Promise<MentorMarketplaceStats> {
    await simulateDelay(300)
    return mockMarketplaceStats as any
  },

  /**
   * Get search filters and their available options
   */
  async getSearchFilters(params?: any): Promise<SearchFilters> {
    await simulateDelay(200)
    console.log('Mock: Getting search filters', params)
    return mockFilters as any
  },

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    await simulateDelay(150)
    return mockSearchSuggestions as any
  },

  /**
   * Get similar mentors for recommendations
   */
  async getSimilarMentors(mentorId: string, limit = 4): Promise<MentorListingCard[]> {
    await simulateDelay(250)
    
    // Simple similarity based on same expertise areas
    const targetMentor = mockMentors.find(m => m.id === mentorId)
    if (!targetMentor) return []
    
    const similarMentors = mockMentors
      .filter(mentor => 
        mentor.id !== mentorId &&
        mentor.expertiseAreas.some(area => targetMentor.expertiseAreas.includes(area))
      )
      .slice(0, limit)
    
    return similarMentors as any
  },

  /**
   * Get all mentors (for admin or comprehensive views)
   */
  async getAllMentors(): Promise<MentorProfile[]> {
    await simulateDelay(400)
    return mockMentors as any
  },

  /**
   * Get mentor recommendations based on user criteria
   */
  async getRecommendations(criteria: any): Promise<any[]> {
    await simulateDelay(400)
    console.log('Mock: Getting mentor recommendations', criteria)
    
    // Return a subset of mock mentors as recommendations
    const recommendations = mockMentors.slice(0, 3).map((mentor: any) => ({
      mentor: mentor,
      matchScore: Math.random() * 100,
      matchReasons: ['Similar expertise', 'Good rating', 'Available schedule'],
      compatibilityFactors: {
        expertise: 0.9,
        communication: 0.8,
        schedule: 0.7
      }
    }))
    
    return recommendations as any
  }
}

// Mentor Profile Management
export const mentorProfileApi = {
  /**
   * Get public mentor profile by ID
   */
  async getMentorProfile(mentorId: string): Promise<MentorProfilePublic> {
    await simulateDelay(300)
    
    // Find mentor in mock data by ID
    const mentor = mockMentors.find((m: any) => m.id === mentorId)
    
    if (!mentor) {
      throw new Error('Mentor not found')
    }
    
    // Return the mentor data as-is since it already has the right structure
    return mentor as any
  },

  /**
   * Get detailed mentor profile with availability (for authenticated users)
   */
  async getMentorDetails(mentorId: string): Promise<{
    mentor: MentorProfilePublic
    availability: any
    reviews: any[]
    sessionsSummary: any[]
  }> {
    await simulateDelay(400)
    
    const mentor = mockMentors.find((m: any) => m.id === mentorId)
    if (!mentor) {
      throw new Error('Mentor not found')
    }
    
    return {
      mentor: mentor as any,
      availability: {},
      reviews: [],
      sessionsSummary: []
    }
  },

  /**
   * Get mentor's own full profile (for mentor dashboard)
   */
  async getMyMentorProfile(): Promise<any> {
    await simulateDelay(300)
    // Return first mentor as example
    return mockMentors[0] as any
  },

  /**
   * Update mentor profile
   */
  async updateMentorProfile(profileData: any): Promise<any> {
    await simulateDelay(500)
    console.log('Mock: Updating mentor profile', profileData)
    return { success: true }
  },

  /**
   * Update mentor availability
   */
  async updateAvailability(availability: any): Promise<any> {
    await simulateDelay(300)
    console.log('Mock: Updating mentor availability', availability)
    return availability
  },

  /**
   * Upload mentor profile photo
   */
  async uploadProfilePhoto(file: File): Promise<{ photoUrl: string }> {
    await simulateDelay(1000)
    console.log('Mock: Uploading profile photo', file.name)
    return { photoUrl: 'https://example.com/mock-photo.jpg' }
  },

  /**
   * Delete mentor profile photo
   */
  async deleteProfilePhoto(): Promise<void> {
    await simulateDelay(300)
    console.log('Mock: Deleting profile photo')
  },

  /**
   * Update mentor status (active/inactive)
   */
  async updateStatus(isActive: boolean): Promise<void> {
    await simulateDelay(300)
    console.log('Mock: Updating mentor status', isActive)
  },

  /**
   * Track mentor profile view
   */
  async trackProfileView(mentorId: string): Promise<void> {
    await simulateDelay(100)
    console.log('Mock: Tracking profile view for mentor', mentorId)
  }
}

// Mentor Reviews and Ratings
export const mentorReviewsApi = {
  /**
   * Get mentor reviews with pagination and filtering
   */
  async getMentorReviews(
    mentorId: string,
    filters?: {
      page?: number
      limit?: number
      rating?: number[]
      verified?: boolean
      sortBy?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful'
    }
  ): Promise<{
    reviews: MentorReview[]
    totalCount: number
    summary: any
  }> {
    // For development, use mock data
    if (process.env.NODE_ENV === 'development') {
      await simulateDelay(400)
      
      // Filter reviews for this mentor
      let mentorReviews = mockReviews.filter(review => review.mentorId === mentorId)
      
      // Apply filters
      if (filters?.rating?.length) {
        mentorReviews = mentorReviews.filter(review => 
          filters.rating!.includes(review.rating)
        )
      }
      
      if (filters?.verified !== undefined) {
        mentorReviews = mentorReviews.filter(review => 
          review.isVerified === filters.verified
        )
      }
      
      // Apply sorting
      switch (filters?.sortBy) {
        case 'oldest':
          mentorReviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          break
        case 'highest_rating':
          mentorReviews.sort((a, b) => b.rating - a.rating)
          break
        case 'lowest_rating':
          mentorReviews.sort((a, b) => a.rating - b.rating)
          break
        case 'most_helpful':
          mentorReviews.sort((a, b) => b.helpfulCount - a.helpfulCount)
          break
        case 'newest':
        default:
          mentorReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          break
      }
      
      // Apply pagination
      const page = filters?.page || 1
      const limit = filters?.limit || 10
      const startIndex = (page - 1) * limit
      const paginatedReviews = mentorReviews.slice(startIndex, startIndex + limit)
      
      return {
        reviews: paginatedReviews,
        totalCount: mentorReviews.length,
        summary: mockReviewSummaries[mentorId] || null
      }
    }
    
    // Production API call
    const { data } = await api.get(`/mentors/${mentorId}/reviews`, {
      params: filters
    })
    return data
  },

  /**
   * Submit a review for a mentor
   */
  async submitReview(reviewData: {
    mentorId: string
    sessionId?: string
    rating: number
    title: string
    content: string
    categoryRatings?: Record<string, number>
    isAnonymous?: boolean
    tags?: string[]
  }): Promise<MentorReview> {
    // For development, simulate review creation
    if (process.env.NODE_ENV === 'development') {
      await simulateDelay(600)
      
      const newReview: MentorReview = {
        id: `review-${Date.now()}`,
        mentorId: reviewData.mentorId,
        reviewerId: 'current-user',
        sessionId: reviewData.sessionId,
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        categoryRatings: reviewData.categoryRatings,
        isVerified: !!reviewData.sessionId,
        isAnonymous: reviewData.isAnonymous || false,
        createdAt: new Date(),
        status: 'approved',
        helpfulCount: 0,
        notHelpfulCount: 0,
        replyCount: 0,
        reviewer: reviewData.isAnonymous ? undefined : {
          id: 'current-user',
          name: 'You',
          isVerifiedPurchaser: !!reviewData.sessionId,
          totalReviews: 1
        }
      }
      
      return newReview
    }
    
    // Production API call
    const { data } = await api.post('/reviews', reviewData)
    return data
  },

  /**
   * Update an existing review
   */
  async updateReview(
    reviewId: string,
    updates: {
      rating?: number
      title?: string
      content?: string
      categoryRatings?: Record<string, number>
      isAnonymous?: boolean
    }
  ): Promise<MentorReview> {
    // For development, simulate update
    if (process.env.NODE_ENV === 'development') {
      await simulateDelay(400)
      
      // Find and update mock review (simulation)
      const existingReview = mockReviews.find(r => r.id === reviewId)
      if (existingReview) {
        return {
          ...existingReview,
          ...updates,
          updatedAt: new Date()
        }
      }
      throw new Error('Review not found')
    }
    
    // Production API call
    const { data } = await api.patch(`/reviews/${reviewId}`, updates)
    return data
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<void> {
    // For development, simulate deletion
    if (process.env.NODE_ENV === 'development') {
      await simulateDelay(300)
      return
    }
    
    // Production API call
    await api.delete(`/reviews/${reviewId}`)
  },

  /**
   * Mark a review as helpful or not helpful
   */
  async markReviewHelpful(
    reviewId: string,
    isHelpful: boolean
  ): Promise<void> {
    // For development, simulate action
    if (process.env.NODE_ENV === 'development') {
      await simulateDelay(200)
      return
    }
    
    // Production API call
    await api.post(`/reviews/${reviewId}/helpful`, { isHelpful })
  },

  /**
   * Report a review
   */
  async reportReview(
    reviewId: string,
    reason: 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'other',
    description?: string
  ): Promise<void> {
    // For development, simulate report
    if (process.env.NODE_ENV === 'development') {
      await simulateDelay(300)
      return
    }
    
    // Production API call
    await api.post(`/reviews/${reviewId}/report`, { reason, description })
  },

  /**
   * Get review summary/stats for a mentor
   */
  async getReviewSummary(mentorId: string): Promise<any> {
    // For development, use mock data
    if (process.env.NODE_ENV === 'development') {
      await simulateDelay(200)
      return mockReviewSummaries[mentorId] || null
    }
    
    // Production API call
    const { data } = await api.get(`/mentors/${mentorId}/reviews/summary`)
    return data
  },

  /**
   * Submit mentor response to a review
   */
  async submitMentorResponse(
    reviewId: string,
    content: string
  ): Promise<void> {
    // For development, simulate response
    if (process.env.NODE_ENV === 'development') {
      await simulateDelay(400)
      return
    }
    
    // Production API call
    await api.post(`/reviews/${reviewId}/response`, { content })
  },

  /**
   * Get reviews that need mentor responses (for mentors)
   */
  async getPendingResponses(mentorId: string): Promise<MentorReview[]> {
    // For development, filter mock reviews
    if (process.env.NODE_ENV === 'development') {
      await simulateDelay(300)
      
      return mockReviews.filter(review => 
        review.mentorId === mentorId && 
        !review.mentorResponse &&
        review.status === 'approved'
      )
    }
    
    // Production API call
    const { data } = await api.get(`/mentors/${mentorId}/reviews/pending-responses`)
    return data
  }
}

// Mentor Favorites and Collections
export const mentorFavoritesApi = {
  /**
   * Get user's favorite mentors
   */
  async getFavorites(): Promise<any[]> {
    await simulateDelay(300)
    console.log('Mock: Getting user favorites')
    return []
  },

  /**
   * Add mentor to favorites
   */
  async addToFavorites(mentorId: string): Promise<void> {
    await simulateDelay(200)
    console.log('Mock: Adding mentor to favorites', mentorId)
  },

  /**
   * Remove mentor from favorites
   */
  async removeFromFavorites(mentorId: string): Promise<void> {
    await simulateDelay(200)
    console.log('Mock: Removing mentor from favorites', mentorId)
  },

  /**
   * Get recently viewed mentors
   */
  async getRecentlyViewed(): Promise<any[]> {
    await simulateDelay(250)
    console.log('Mock: Getting recently viewed mentors')
    return []
  },

  /**
   * Track mentor profile view
   */
  async trackProfileView(mentorId: string): Promise<void> {
    await simulateDelay(100)
    console.log('Mock: Tracking profile view for mentor', mentorId)
  }
}

// Mentor Verification and Onboarding
export const mentorVerificationApi = {
  // Implementation would go here for production
}

// Mentor Analytics and Performance
export const mentorAnalyticsApi = {
  // Implementation would go here for production
}

// Mentor Availability API
export const mentorAvailabilityApi = {
  /**
   * Get mentor's weekly availability schedule
   */
  async getMentorWeeklyAvailability(mentorId: string, activeOnly: boolean = true): Promise<{
    status: string
    message: string
    data: {
      mentorId: string
      totalSlots: number
      activeSlots: number
      schedule: Array<{
        dayOfWeek: string
        timeSlots: Array<{
          id: number
          startTime: string
          endTime: string
          isActive: boolean
          durationInMinutes: number
        }>
      }>
    }
    timestamp: string
  }> {
    const { data } = await api.get(`/v1/mentors/mentor-availability/mentor/${mentorId}/weekly`, {
      params: { activeOnly }
    })
    return data
  }
}

// Admin APIs for Corporate Admins
export const mentorAdminApi = {
  // Implementation would go here for production
}

// Mentor Programs API
export const mentorProgramsApi = {
  /**
   * Get all mentorship programs with pagination and search
   */
  async getPrograms(params?: {
    page?: number
    size?: number
    searchTerm?: string
  }): Promise<{
    success: boolean
    count: number
    programs: any[]
    pagination?: {
      last: boolean
      totalPages: number
      pageSize: number
      hasPrevious: boolean
      hasNext: boolean
      currentPage: number
      first: boolean
      totalElements: number
    }
  }> {
    const { data } = await api.get('/v1/programs', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        ...(params?.searchTerm && { searchTerm: params.searchTerm })
      }
    })
    return data
  },

  async getLivePrograms(): Promise<{
    success: boolean
    count: number
    programs: any[]
  }> {
    const { data } = await api.get('/v1/programs/live')
    return data
  },

  /**
   * Get a single program by ID
   */
  async getProgramById(programId: string): Promise<any> {
    const { data } = await api.get(`/v1/programs/${programId}`)
    return data
  },

  /**
   * Get mentors for a specific program
   */
  async getProgramMentors(programId: string): Promise<any[]> {
    const { data } = await api.get(`/v1/programs/${programId}/mentors`)
    return data
  }
}

// Mentor Profiles List API
export const mentorProfilesApi = {
  /**
   * Get all mentor profiles with pagination and search
   */
  async getMentorProfiles(params?: {
    page?: number
    size?: number
    searchTerm?: string
  }): Promise<{
    totalItems: number
    success: boolean
    mentors: any[]
    totalPages: number
    hasPrevious: boolean
    hasNext: boolean
    currentPage: number
  }> {
    const { data } = await api.get('/v1/profiles/mentors', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        ...(params?.searchTerm && { searchTerm: params.searchTerm })
      }
    })
    return data
  },

  /**
   * Get a mentor profile by ID
   */
  async getMentorProfileById(mentorId: string): Promise<any> {
    const { data } = await api.get(`/v1/profiles/mentors/${mentorId}`)
    return data
  }
}

// Export all API functions
export default {
  discovery: mentorDiscoveryApi,
  profile: mentorProfileApi,
  reviews: mentorReviewsApi,
  favorites: mentorFavoritesApi,
  verification: mentorVerificationApi,
  analytics: mentorAnalyticsApi,
  admin: mentorAdminApi,
  programs: mentorProgramsApi,
  profiles: mentorProfilesApi,
  availability: mentorAvailabilityApi
}
