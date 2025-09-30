import { ref, computed } from 'vue'
import type {
  MentorProfile,
  MentorMatchingCriteria,
  MentorRecommendation,
  MatchReason,
  CompatibilityFactor,
  MentorListingCard,
  SessionType,
  CommunicationStyle
} from '@/types/mentor'

// Weights for different matching factors (out of 100)
const MATCHING_WEIGHTS = {
  expertiseMatch: 25,
  skillsMatch: 20,
  industryMatch: 15,
  experienceLevel: 10,
  communicationStyle: 10,
  sessionType: 8,
  availability: 5,
  budget: 5,
  language: 2
} as const

// Minimum thresholds for recommendations
const THRESHOLDS = {
  minMatchScore: 60, // Minimum overall match score (0-100)
  minExpertiseMatch: 0.3, // At least 30% expertise overlap
  maxBudgetVariance: 1.5, // Maximum 50% over budget
  minSkillsMatch: 0.2 // At least 20% skills overlap
} as const

// Experience level mappings
const EXPERIENCE_LEVELS = {
  entry: { min: 0, max: 3 },
  mid: { min: 3, max: 7 },
  senior: { min: 7, max: 12 },
  executive: { min: 12, max: 999 }
} as const

/**
 * Mentor Discovery Service
 * Provides intelligent mentor matching and recommendation algorithms
 */
export const useMentorDiscoveryService = () => {
  // Cache for computed scores to avoid recalculation
  const scoreCache = new Map<string, number>()

  /**
   * Calculate match score between mentor and criteria
   */
  const calculateMatchScore = (
    mentor: MentorProfile,
    criteria: MentorMatchingCriteria
  ): number => {
    const cacheKey = `${mentor.id}-${JSON.stringify(criteria)}`
    if (scoreCache.has(cacheKey)) {
      return scoreCache.get(cacheKey)!
    }

    // Calculate individual factor scores
    const expertiseScore = calculateExpertiseScore(mentor, criteria)
    const skillsScore = calculateSkillsScore(mentor, criteria)
    const industryScore = calculateIndustryScore(mentor, criteria)
    const experienceScore = calculateExperienceScore(mentor, criteria)
    const communicationScore = calculateCommunicationScore(mentor, criteria)
    const sessionTypeScore = calculateSessionTypeScore(mentor, criteria)
    const availabilityScore = calculateAvailabilityScore(mentor, criteria)
    const budgetScore = calculateBudgetScore(mentor, criteria)
    const languageScore = calculateLanguageScore(mentor, criteria)

    // Apply weights to each factor
    const weightedScore = 
      (expertiseScore * MATCHING_WEIGHTS.expertiseMatch) +
      (skillsScore * MATCHING_WEIGHTS.skillsMatch) +
      (industryScore * MATCHING_WEIGHTS.industryMatch) +
      (experienceScore * MATCHING_WEIGHTS.experienceLevel) +
      (communicationScore * MATCHING_WEIGHTS.communicationStyle) +
      (sessionTypeScore * MATCHING_WEIGHTS.sessionType) +
      (availabilityScore * MATCHING_WEIGHTS.availability) +
      (budgetScore * MATCHING_WEIGHTS.budget) +
      (languageScore * MATCHING_WEIGHTS.language)

    // Normalize to 0-100 scale
    const finalScore = Math.round(weightedScore)
    
    // Cache the result
    scoreCache.set(cacheKey, finalScore)
    
    return finalScore
  }

  /**
   * Calculate expertise area match score
   */
  const calculateExpertiseScore = (
    mentor: MentorProfile,
    criteria: MentorMatchingCriteria
  ): number => {
    const mentorExpertise = new Set(mentor.expertiseAreas.map(e => e.toLowerCase()))
    const criteriaExpertise = new Set(criteria.goals.map(g => g.toLowerCase()))

    if (criteriaExpertise.size === 0) return 1 // No specific requirements

    const matches = [...criteriaExpertise].filter(g => mentorExpertise.has(g))
    const matchRatio = matches.length / criteriaExpertise.size

    if (matchRatio < THRESHOLDS.minExpertiseMatch) return 0
    return matchRatio
  }

  /**
   * Calculate skills match score
   */
  const calculateSkillsScore = (
    mentor: MentorProfile,
    criteria: MentorMatchingCriteria
  ): number => {
    const mentorSkills = new Set(mentor.skills.map(s => s.toLowerCase()))
    const criteriaSkills = new Set(criteria.skillsToLearn.map(s => s.toLowerCase()))

    if (criteriaSkills.size === 0) return 1 // No specific requirements

    const matches = [...criteriaSkills].filter(s => mentorSkills.has(s))
    const matchRatio = matches.length / criteriaSkills.size

    if (matchRatio < THRESHOLDS.minSkillsMatch) return 0
    return matchRatio
  }

  /**
   * Calculate industry match score
   */
  const calculateIndustryScore = (
    mentor: MentorProfile,
    criteria: MentorMatchingCriteria
  ): number => {
    if (!criteria.industry) return 1 // No specific industry requirement
    return mentor.industry.toLowerCase() === criteria.industry.toLowerCase() ? 1 : 0.3
  }

  /**
   * Calculate experience level match score
   */
  const calculateExperienceScore = (
    mentor: MentorProfile,
    criteria: MentorMatchingCriteria
  ): number => {
    const targetLevel = EXPERIENCE_LEVELS[criteria.experienceLevel]
    const mentorYears = mentor.experienceYears

    if (mentorYears >= targetLevel.min && mentorYears <= targetLevel.max) {
      return 1 // Perfect match
    }

    // Calculate distance from target range
    const distanceFromRange = Math.min(
      Math.abs(mentorYears - targetLevel.min),
      Math.abs(mentorYears - targetLevel.max)
    )

    // Penalize based on distance
    return Math.max(0, 1 - (distanceFromRange / 5)) // -0.2 per year difference
  }

  /**
   * Calculate communication style match score
   */
  const calculateCommunicationScore = (
    mentor: MentorProfile,
    criteria: MentorMatchingCriteria
  ): number => {
    if (!criteria.preferredCommunicationStyle.length) return 1

    return criteria.preferredCommunicationStyle.includes(mentor.communicationStyle) ? 1 : 0.5
  }

  /**
   * Calculate session type match score
   */
  const calculateSessionTypeScore = (
    mentor: MentorProfile,
    criteria: MentorMatchingCriteria
  ): number => {
    if (!criteria.sessionPreferences.length) return 1

    const mentorTypes = new Set(mentor.preferredSessionTypes)
    const matches = criteria.sessionPreferences.filter(type => mentorTypes.has(type))
    return matches.length / criteria.sessionPreferences.length
  }

  /**
   * Calculate availability match score
   */
  const calculateAvailabilityScore = (
    mentor: MentorProfile,
    criteria: MentorMatchingCriteria
  ): number => {
    if (!criteria.availabilityPreferences) return 1

    let score = 0
    
    // Timezone match
    if (mentor.timezone === criteria.availabilityPreferences.timezone) {
      score += 0.5
    }

    // Preferred times match
    const mentorSlots = getAvailableTimeSlots(mentor) // Helper function to get mentor's slots
    const preferredSlots = new Set(criteria.availabilityPreferences.preferredTimes)
    const matchingSlots = [...preferredSlots].filter(slot => mentorSlots.has(slot))
    
    score += 0.5 * (matchingSlots.length / preferredSlots.size)
    
    return score
  }

  /**
   * Calculate budget match score
   */
  const calculateBudgetScore = (
    mentor: MentorProfile,
    criteria: MentorMatchingCriteria
  ): number => {
    if (!criteria.budgetRange) return 1

    const { min, max } = criteria.budgetRange
    const rate = mentor.hourlyRate

    if (rate >= min && rate <= max) return 1
    if (rate > max * THRESHOLDS.maxBudgetVariance) return 0

    // Partial score based on how far outside the range
    return Math.max(0, 1 - Math.abs(rate - max) / max)
  }

  /**
   * Calculate language match score
   */
  const calculateLanguageScore = (
    mentor: MentorProfile,
    criteria: MentorMatchingCriteria
  ): number => {
    // Assuming English is always acceptable if no preference
    if (!criteria.availabilityPreferences?.preferredLanguages?.length) return 1

    const mentorLanguages = new Set(mentor.preferredLanguages)
    const matches = criteria.availabilityPreferences.preferredLanguages.filter(
      (lang: string) => mentorLanguages.has(lang)
    )
    return matches.length > 0 ? 1 : 0
  }

  /**
   * Generate detailed match reasons
   */
  const generateMatchReasons = (
    mentor: MentorProfile,
    criteria: MentorMatchingCriteria,
    matchScore: number
  ): MatchReason[] => {
    const reasons: MatchReason[] = []

    // Expertise match
    const expertiseScore = calculateExpertiseScore(mentor, criteria)
    if (expertiseScore > THRESHOLDS.minExpertiseMatch) {
      reasons.push({
        factor: 'expertise',
        description: `Strong expertise match in ${getMatchingExpertise(mentor, criteria).join(', ')}`,
        score: expertiseScore * 100
      })
    }

    // Experience level
    const experienceScore = calculateExperienceScore(mentor, criteria)
    if (experienceScore > 0.7) {
      reasons.push({
        factor: 'experience',
        description: `${mentor.experienceYears} years of experience aligns with ${criteria.experienceLevel} level needs`,
        score: experienceScore * 100
      })
    }

    // Communication style
    const communicationScore = calculateCommunicationScore(mentor, criteria)
    if (communicationScore > 0.8) {
      reasons.push({
        factor: 'communication',
        description: `Preferred ${mentor.communicationStyle} communication style`,
        score: communicationScore * 100
      })
    }

    // Availability
    const availabilityScore = calculateAvailabilityScore(mentor, criteria)
    if (availabilityScore > 0.7) {
      reasons.push({
        factor: 'availability',
        description: 'Schedule compatibility with preferred times',
        score: availabilityScore * 100
      })
    }

    // Price match
    const budgetScore = calculateBudgetScore(mentor, criteria)
    if (budgetScore > 0.8) {
      reasons.push({
        factor: 'price',
        description: 'Rate within budget range',
        score: budgetScore * 100
      })
    }

    // Reviews and ratings
    if (mentor.averageRating >= 4.5) {
      reasons.push({
        factor: 'reviews',
        description: `Highly rated mentor (${mentor.averageRating}/5) with ${mentor.totalReviews} reviews`,
        score: 95
      })
    }

    return reasons.sort((a, b) => b.score - a.score)
  }

  /**
   * Generate compatibility factors
   */
  const generateCompatibilityFactors = (
    mentor: MentorProfile,
    criteria: MentorMatchingCriteria
  ): CompatibilityFactor[] => {
    const factors: CompatibilityFactor[] = []

    // Expertise alignment
    const expertiseScore = calculateExpertiseScore(mentor, criteria)
    factors.push({
      name: 'Expertise Alignment',
      score: expertiseScore * 100,
      description: `${Math.round(expertiseScore * 100)}% alignment with your learning goals`
    })

    // Skills coverage
    const skillsScore = calculateSkillsScore(mentor, criteria)
    factors.push({
      name: 'Skills Coverage',
      score: skillsScore * 100,
      description: `${Math.round(skillsScore * 100)}% coverage of desired skills`
    })

    // Industry experience
    const industryScore = calculateIndustryScore(mentor, criteria)
    factors.push({
      name: 'Industry Experience',
      score: industryScore * 100,
      description: industryScore > 0.8 
        ? 'Direct industry experience'
        : 'Related industry background'
    })

    // Communication fit
    const communicationScore = calculateCommunicationScore(mentor, criteria)
    factors.push({
      name: 'Communication Fit',
      score: communicationScore * 100,
      description: `${mentor.communicationStyle} style matches preferences`
    })

    // Session format
    const sessionScore = calculateSessionTypeScore(mentor, criteria)
    factors.push({
      name: 'Session Format',
      score: sessionScore * 100,
      description: `${Math.round(sessionScore * 100)}% match in preferred session types`
    })

    return factors.sort((a, b) => b.score - a.score)
  }

  /**
   * Get matching expertise areas
   */
  const getMatchingExpertise = (
    mentor: MentorProfile,
    criteria: MentorMatchingCriteria
  ): string[] => {
    const mentorExpertise = new Set(mentor.expertiseAreas.map(e => e.toLowerCase()))
    return criteria.goals
      .filter(g => mentorExpertise.has(g.toLowerCase()))
  }

  /**
   * Helper function to get mentor's available time slots
   */
  const getAvailableTimeSlots = (mentor: MentorProfile): Set<string> => {
    // This would be implemented based on the mentor's availability data structure
    // For now, returning an empty set
    return new Set<string>()
  }

  /**
   * Generate mentor recommendations based on criteria
   */
  const generateRecommendations = (
    mentors: MentorProfile[],
    criteria: MentorMatchingCriteria
  ): MentorRecommendation[] => {
    const recommendations: MentorRecommendation[] = []

    for (const mentor of mentors) {
      const matchScore = calculateMatchScore(mentor, criteria)
      
      // Only include mentors above minimum threshold
      if (matchScore >= THRESHOLDS.minMatchScore) {
        const matchReasons = generateMatchReasons(mentor, criteria, matchScore)
        const compatibilityFactors = generateCompatibilityFactors(mentor, criteria)
        
        recommendations.push({
          mentor: formatMentorCard(mentor),
          matchScore,
          matchReasons,
          compatibilityFactors,
          estimatedFit: getEstimatedFit(matchScore)
        })
      }
    }

    // Sort by match score descending
    return recommendations.sort((a, b) => b.matchScore - a.matchScore)
  }

  /**
   * Format mentor profile as listing card
   */
  const formatMentorCard = (mentor: MentorProfile): MentorListingCard => {
    return {
      id: mentor.id,
      firstName: mentor.firstName,
      lastName: mentor.lastName,
      title: mentor.title,
      company: mentor.company,
      industry: mentor.industry,
      profilePhoto: mentor.profilePhoto,
      profileSummary: mentor.profileSummary,
      expertiseAreas: mentor.expertiseAreas,
      skills: mentor.skills,
      averageRating: mentor.averageRating,
      totalReviews: mentor.totalReviews,
      totalSessions: mentor.totalSessions,
      hourlyRate: mentor.hourlyRate,
      currency: mentor.currency,
      responseTime: mentor.responseTime,
      responseRate: mentor.responseRate,
      verificationBadges: mentor.verificationBadges,
      isAvailable: mentor.isAvailable,
      timezone: mentor.timezone,
      preferredSessionTypes: mentor.preferredSessionTypes,
      featured: mentor.featured
    }
  }

  /**
   * Get estimated fit based on match score
   */
  const getEstimatedFit = (matchScore: number): 'excellent' | 'good' | 'fair' => {
    if (matchScore >= 85) return 'excellent'
    if (matchScore >= 70) return 'good'
    return 'fair'
  }

  /**
   * Clear score cache
   */
  const clearScoreCache = () => {
    scoreCache.clear()
  }

  return {
    calculateMatchScore,
    generateRecommendations,
    generateMatchReasons,
    generateCompatibilityFactors,
    formatMentorCard,
    clearScoreCache
  }
} 