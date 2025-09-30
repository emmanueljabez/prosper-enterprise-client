import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type {
  MentorProfile,
  MentorSearchParams,
  MentorSearchResult,
  MentorListingCard,
  MentorRecommendation,
  MentorMatchingCriteria,
  MentorDiscoveryState,
  MentorSortOption,
  SearchFilters,
  FilterOption,
  MentorMarketplaceStats,
  MentorProfilePublic
} from '@/types/mentor'
import mentorsApi from '@/http/requests/app/mentors'
import {mockMentors} from "~/mock/mockMentorData";

export const useMentorsStore = defineStore('mentors', () => {
  // Helper function for user notifications (to be replaced with actual toast)
  const showToast = (message: { title: string; description: string; variant: string }) => {
    console.log(`Toast: ${message.title} - ${message.description}`)
    // TODO: Replace with actual toast implementation
  }

  // State
  const state = ref<MentorDiscoveryState>({
    searchParams: {
      query: '',
      page: 1,
      limit: 12,
      sortBy: 'relevance',
      sortOrder: 'desc'
    },
    searchResults: null,
    isLoading: false,
    isSearching: false,
    error: null,
    selectedFilters: {},
    activeSort: 'relevance',
    viewMode: 'grid',
    favorites: [],
    recentlyViewed: [],
    recommendations: [],
    searchHistory: []
  })

  // Additional state for mentor details and caching
  const mentorCache = ref<Map<string, MentorProfilePublic>>(new Map())
  const availableFilters = ref<SearchFilters | null>(null)
  const marketplaceStats = ref<MentorMarketplaceStats | null>(null)
  const featuredMentors = ref<MentorListingCard[]>([])
  const trendingMentors = ref<MentorListingCard[]>([])

  // Computed properties
  const searchResults = computed(() => state.value.searchResults)
  const mentors = computed(() => searchResults.value?.mentors || [])
  const totalCount = computed(() => searchResults.value?.totalCount || 0)
  const hasMore = computed(() => searchResults.value?.hasMore || false)
  const currentPage = computed(() => state.value.searchParams.page || 1)
  const isLoading = computed(() => state.value.isLoading)
  const isSearching = computed(() => state.value.isSearching)
  const error = computed(() => state.value.error)
  const viewMode = computed(() => state.value.viewMode)
  const activeFilters = computed(() => state.value.selectedFilters)
  const hasActiveFilters = computed(() => 
    Object.values(state.value.selectedFilters).some(filters => filters.length > 0)
  )

  // Search and Discovery Actions
  const searchMentors = async (params?: Partial<MentorSearchParams>) => {
    console.log('🔍 searchMentors called with params:', params)
    console.log('🔍 mentorsApi available:', !!mentorsApi)
    console.log('🔍 mentorsApi.discovery available:', !!mentorsApi?.discovery)
    console.log('🔍 mentorsApi.discovery.searchMentors available:', !!mentorsApi?.discovery?.searchMentors)
    
    state.value.isSearching = true
    state.value.error = null

    try {
      // Merge with existing search params
      const searchParams = {
        ...state.value.searchParams,
        ...params
      }
      console.log('🔍 Final search params:', searchParams)

      // Update state
      state.value.searchParams = searchParams

      // Add to search history if there's a query
      if (searchParams.query && !state.value.searchHistory.includes(searchParams.query)) {
        state.value.searchHistory.unshift(searchParams.query)
        // Keep only last 10 searches
        state.value.searchHistory = state.value.searchHistory.slice(0, 10)
      }

      console.log('🔍 About to make API call...')
      // Make API call
      const result = await mentorsApi.discovery.searchMentors(searchParams)
      console.log('🔍 API call completed, result:', result)
      console.log('🔍 Result mentors count:', result?.mentors?.length)
      
      // Update state with proper structure
      state.value.searchResults = {
        mentors: result.mentors,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / (searchParams.limit || 12)),
        currentPage: searchParams.page || 1,
        hasMore: (searchParams.page || 1) * (searchParams.limit || 12) < result.totalCount,
        filters: availableFilters.value || {} as any
      }
      
      console.log('🔍 Search results set:', state.value.searchResults)
      console.log('🔍 Search results mentors count:', state.value.searchResults.mentors?.length)
      
      // Cache mentors for quick access
      result.mentors.forEach(mentor => {
        mentorCache.value.set(mentor.id, mentor as any)
      })

    } catch (error: any) {
      console.error('❌ Error searching mentors:', error)
      state.value.error = 'Failed to search mentors. Please try again.'
      showToast({
        title: 'Search Failed',
        description: 'Unable to search mentors at this time.',
        variant: 'destructive'
      })
    } finally {
      state.value.isSearching = false
      console.log('🔍 searchMentors finished, final state:', {
        searchResults: !!state.value.searchResults,
        mentorsCount: state.value.searchResults?.mentors?.length || 0,
        isSearching: state.value.isSearching,
        error: state.value.error
      })
    }
  }

  // Program-based mentor filtering
  const searchMentorsByProgram = async (programName: string, category?: string) => {
    console.log('🎯 Searching mentors by program:', { programName, category })
    
    // Map program names to expertise areas for filtering
    const expertiseMapping: Record<string, string[]> = {
      'Software Engineering Mastery': ['Software Engineering', 'Mobile Development', 'Full-Stack Development'],
      'Product Management Excellence': ['Product Management', 'Product Strategy', 'Agile'],
      'UX Design for Africa': ['UX Design', 'Product Design', 'Design Systems'],
      'Data Science for African Markets': ['Data Science', 'Machine Learning', 'Analytics'],
      'Fintech Innovation & Mobile Money': ['Fintech', 'Financial Innovation', 'Mobile Money']
    }
    
    const categoryMapping: Record<string, string[]> = {
      'technology': ['Software Engineering', 'Mobile Development', 'Technical Skills'],
      'business': ['Product Management', 'Business Development', 'Strategy'],
      'design': ['UX Design', 'Product Design', 'Design Systems'],
      'data': ['Data Science', 'Machine Learning', 'Analytics'],
      'leadership': ['Team Leadership', 'Leadership', 'Management'],
      'innovation': ['Entrepreneurship', 'Innovation', 'Startup']
    }
    
    const searchTerms = []
    
    // Add program-specific expertise areas
    if (expertiseMapping[programName]) {
      searchTerms.push(...expertiseMapping[programName])
    }
    
    // Add category-specific terms
    if (category && categoryMapping[category]) {
      searchTerms.push(...categoryMapping[category])
    }
    
    // Create search query from terms
    const query = searchTerms.length > 0 ? searchTerms.join(' OR ') : programName
    
    // Search with enhanced parameters
    await searchMentors({
      query,
      expertiseAreas: searchTerms.length > 0 ? searchTerms : undefined,
      page: 1
    })
  }

  const loadMoreMentors = async () => {
    if (!hasMore.value || state.value.isLoading) return

    state.value.isLoading = true

    try {
      const nextPage = currentPage.value + 1
      const params = {
        ...state.value.searchParams,
        page: nextPage
      }

      const result = await mentorsApi.discovery.searchMentors(params)
      
      if (state.value.searchResults) {
        // Append new mentors to existing results
        state.value.searchResults.mentors.push(...result.mentors)
        state.value.searchResults.currentPage = nextPage
        state.value.searchResults.hasMore = nextPage * (params.limit || 12) < result.totalCount
      }

      // Update search params
      state.value.searchParams.page = nextPage

      // Cache new mentors
      result.mentors.forEach(mentor => {
        mentorCache.value.set(mentor.id, mentor as any)
      })

    } catch (error: any) {
      console.error('Error loading more mentors:', error)
      showToast({
        title: 'Load Failed',
        description: 'Unable to load more mentors.',
        variant: 'destructive'
      })
    } finally {
      state.value.isLoading = false
    }
  }

  const getRecommendations = async (criteria: MentorMatchingCriteria) => {
    state.value.isLoading = true

    try {
      const recommendations = await mentorsApi.discovery.getRecommendations(criteria)
      state.value.recommendations = recommendations

      // Cache recommended mentors
      recommendations.forEach(rec => {
        mentorCache.value.set(rec.mentor.id, rec.mentor as any)
      })

    } catch (error: any) {
      console.error('Error getting recommendations:', error)
      showToast({
        title: 'Recommendations Failed',
        description: 'Unable to get mentor recommendations.',
        variant: 'destructive'
      })
    } finally {
      state.value.isLoading = false
    }
  }

  // Filter Management
  const updateFilters = async (filterKey: string, values: string[]) => {
    state.value.selectedFilters[filterKey] = values
    
    // Apply filters to search
    const filterParams: Partial<MentorSearchParams> = {}
    
    // Map filter keys to search params
    if (state.value.selectedFilters.expertiseAreas?.length) {
      filterParams.expertiseAreas = state.value.selectedFilters.expertiseAreas
    }
    if (state.value.selectedFilters.skills?.length) {
      filterParams.skills = state.value.selectedFilters.skills
    }
    if (state.value.selectedFilters.industries?.length) {
      filterParams.industries = state.value.selectedFilters.industries
    }
    if (state.value.selectedFilters.sessionTypes?.length) {
      filterParams.sessionTypes = state.value.selectedFilters.sessionTypes as any
    }
    if (state.value.selectedFilters.communicationStyles?.length) {
      filterParams.communicationStyles = state.value.selectedFilters.communicationStyles as any
    }
    if (state.value.selectedFilters.languages?.length) {
      filterParams.languages = state.value.selectedFilters.languages
    }
    if (state.value.selectedFilters.verificationBadges?.length) {
      filterParams.verificationBadges = state.value.selectedFilters.verificationBadges as any
    }

    // Reset to first page when filters change
    await searchMentors({ ...filterParams, page: 1 })
  }

  const clearFilters = async () => {
    state.value.selectedFilters = {}
    await searchMentors({ page: 1 })
  }

  const loadFilters = async () => {
    try {
      const filters = await mentorsApi.discovery.getSearchFilters(state.value.searchParams)
      availableFilters.value = filters
    } catch (error: any) {
      console.error('Error loading filters:', error)
    }
  }

  // Sorting
  const updateSort = async (sortBy: MentorSortOption, sortOrder: 'asc' | 'desc' = 'desc') => {
    state.value.activeSort = sortBy
    await searchMentors({ 
      sortBy, 
      sortOrder, 
      page: 1 // Reset to first page when sorting
    })
  }

  // View Mode
  const setViewMode = (mode: 'grid' | 'list') => {
    state.value.viewMode = mode
  }

  // Mentor Details
  const getMentorDetails = async (mentorId: string) => {
    // Check cache first
    if (mentorCache.value.has(mentorId)) {
      return mentorCache.value.get(mentorId)!
    }

    try {
      const mentor = await mentorsApi.profile.getMentorProfile(mentorId)
      mentorCache.value.set(mentorId, mentor)
      
      // Track view
      await trackMentorView(mentorId)
      
      return mentor
    } catch (error: any) {
      console.error('Error getting mentor details:', error)
      throw new Error('Failed to load mentor details')
    }
  }

  const trackMentorView = async (mentorId: string) => {
    try {
      await mentorsApi.favorites.trackProfileView(mentorId)
      
      // Add to recently viewed if not already there
      if (!state.value.recentlyViewed.includes(mentorId)) {
        state.value.recentlyViewed.unshift(mentorId)
        // Keep only last 10 viewed
        state.value.recentlyViewed = state.value.recentlyViewed.slice(0, 10)
      }
    } catch (error: any) {
      console.error('Error tracking mentor view:', error)
    }
  }

  // Favorites Management
  const addToFavorites = async (mentorId: string) => {
    try {
      await mentorsApi.favorites.addToFavorites(mentorId)
      
      if (!state.value.favorites.includes(mentorId)) {
        state.value.favorites.push(mentorId)
      }

      showToast({
        title: 'Added to Favorites',
        description: 'Mentor has been added to your favorites.',
        variant: 'success'
      })
    } catch (error: any) {
      console.error('Error adding to favorites:', error)
      showToast({
        title: 'Failed to Add',
        description: 'Unable to add mentor to favorites.',
        variant: 'destructive'
      })
    }
  }

  const removeFromFavorites = async (mentorId: string) => {
    try {
      await mentorsApi.favorites.removeFromFavorites(mentorId)
      
      const index = state.value.favorites.indexOf(mentorId)
      if (index > -1) {
        state.value.favorites.splice(index, 1)
      }

      showToast({
        title: 'Removed from Favorites',
        description: 'Mentor has been removed from your favorites.',
        variant: 'success'
      })
    } catch (error: any) {
      console.error('Error removing from favorites:', error)
      showToast({
        title: 'Failed to Remove',
        description: 'Unable to remove mentor from favorites.',
        variant: 'destructive'
      })
    }
  }

  const loadFavorites = async () => {
    try {
      const favorites = await mentorsApi.favorites.getFavorites()
      state.value.favorites = favorites.map(mentor => mentor.id)
      
      // Cache favorite mentors
      favorites.forEach(mentor => {
        mentorCache.value.set(mentor.id, mentor as any)
      })
    } catch (error: any) {
      console.error('Error loading favorites:', error)
    }
  }

  const isFavorite = (mentorId: string) => {
    return state.value.favorites.includes(mentorId)
  }

  // Featured and Trending Mentors
  const loadFeaturedMentors = async (limit = 6) => {
    try {
      const mentors = await mentorsApi.discovery.getFeaturedMentors(limit)
      featuredMentors.value = mentors
      
      // Cache featured mentors
      mentors.forEach(mentor => {
        mentorCache.value.set(mentor.id, mentor as any)
      })
    } catch (error: any) {
      console.error('Error loading featured mentors:', error)
    }
  }

  const loadTrendingMentors = async (limit = 6) => {
    try {
      const mentors = await mentorsApi.discovery.getTrendingMentors(limit)
      trendingMentors.value = mentors
      
      // Cache trending mentors
      mentors.forEach(mentor => {
        mentorCache.value.set(mentor.id, mentor as any)
      })
    } catch (error: any) {
      console.error('Error loading trending mentors:', error)
    }
  }

  const loadMarketplaceStats = async () => {
    try {
      const stats = await mentorsApi.discovery.getMarketplaceStats()
      marketplaceStats.value = stats
    } catch (error: any) {
      console.error('Error loading marketplace stats:', error)
    }
  }

  // Search Suggestions
  const getSearchSuggestions = async (query: string) => {
    try {
      return await mentorsApi.discovery.getSearchSuggestions(query)
    } catch (error: any) {
      console.error('Error getting search suggestions:', error)
      return []
    }
  }

  // Recently Viewed
  const loadRecentlyViewed = async () => {
    try {
      const mentors = await mentorsApi.favorites.getRecentlyViewed()
      state.value.recentlyViewed = mentors.map(mentor => mentor.id)
      
      // Cache recently viewed mentors
      mentors.forEach(mentor => {
        mentorCache.value.set(mentor.id, mentor as any)
      })
    } catch (error: any) {
      console.error('Error loading recently viewed:', error)
    }
  }

  /**
   * Get all available mentors
   */
  const getAllMentors = async (): Promise<MentorProfile[]> => {
    state.value.isLoading = true
    state.value.error = null

    try {
      // Get all mentors from the API (returns MentorProfile[] directly, not wrapped in data)
      const mentors = mockMentors as any[]

      // Cache mentors for quick access
      mentors.forEach((mentor: any) => {
        mentorCache.value.set(mentor.id, mentor)
      })

      return mentors

    } catch (err: any) {
      console.error('Error getting all mentors:', err)
      state.value.error = 'Failed to load mentors. Please try again.'
      throw err
    } finally {
      state.value.isLoading = false
    }
  }

  // Utility Actions
  const clearSearch = () => {
    state.value.searchParams.query = ''
    state.value.searchResults = null
    state.value.selectedFilters = {}
    state.value.error = null
  }

  const clearError = () => {
    state.value.error = null
  }

  // Debug method to set search results directly
  const setSearchResults = (mentors: any[]) => {
    console.log('🔧 setSearchResults called with:', mentors.length, 'mentors')
    state.value.searchResults = {
      mentors: mentors,
      totalCount: mentors.length,
      totalPages: 1,
      currentPage: 1,
      hasMore: false,
      filters: availableFilters.value || {} as any
    }
    console.log('🔧 Search results set successfully:', state.value.searchResults)
  }

  const resetStore = () => {
    state.value = {
      searchParams: {
        query: '',
        page: 1,
        limit: 12,
        sortBy: 'relevance',
        sortOrder: 'desc'
      },
      searchResults: null,
      isLoading: false,
      isSearching: false,
      error: null,
      selectedFilters: {},
      activeSort: 'relevance',
      viewMode: 'grid',
      favorites: [],
      recentlyViewed: [],
      recommendations: [],
      searchHistory: []
    }
    mentorCache.value.clear()
    availableFilters.value = null
    marketplaceStats.value = null
    featuredMentors.value = []
    trendingMentors.value = []
  }

  // Initialize store with common data
  const initializeStore = async () => {
    await Promise.allSettled([
      loadFeaturedMentors(),
      loadTrendingMentors(),
      loadMarketplaceStats(),
      loadFilters(),
      loadFavorites(),
      loadRecentlyViewed()
    ])
  }

  return {
    // State
    state: readonly(state),
    
    // Computed properties (getters)
    mentors,
    searchResults,
    searchQuery: computed(() => state.value.searchParams.query),
    activeFilters,
    activeSort: computed(() => state.value.activeSort),
    isLoading,
    isSearching,
    error,
    totalCount,
    currentPage,
    totalPages: computed(() => state.value.searchResults?.totalPages || 0),
    hasMore,
    viewMode,
    hasActiveFilters,
    availableFilters: readonly(availableFilters),
    featuredMentors: readonly(featuredMentors),
    trendingMentors: readonly(trendingMentors),
    marketplaceStats: readonly(marketplaceStats),
    favorites: readonly(state.value.favorites),
    recentlyViewed: readonly(state.value.recentlyViewed),

    // Actions
    searchMentors,
    loadMoreMentors,
    getRecommendations,
    updateFilters,
    clearFilters,
    loadFilters,
    updateSort,
    setViewMode,
    getMentorDetails,
    trackMentorView,
    addToFavorites,
    removeFromFavorites,
    loadFavorites,
    isFavorite,
    loadFeaturedMentors,
    loadTrendingMentors,
    loadMarketplaceStats,
    getSearchSuggestions,
    loadRecentlyViewed,
    getAllMentors,
    clearSearch,
    clearError,
    resetStore,
    initializeStore,
    setSearchResults,
    searchMentorsByProgram
  }
}) 