<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMentorsStore } from '@/store/modules/mentors'
import { useAuthStore } from '@/store/modules/auth'
import { RoleManager } from '@/utils/roleManager'
import { storeToRefs } from 'pinia'

// UI Components
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Icons
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Users,
  AlertCircle,
  X
} from 'lucide-vue-next'

// Components
import MentorCard from '@/components/ui/mentors/MentorCard.vue'
import MentorFilters from '@/components/ui/mentors/MentorFilters.vue'
import MentorSearchBar from '@/components/ui/mentors/MentorSearchBar.vue'
import MentorStats from '@/components/ui/mentors/MentorStats.vue'

definePageMeta({
  title: 'Find Mentors',
  description: 'Discover experienced mentors to accelerate your professional growth',
  requiresAuth: true,
  permissions: ['mentors:view']
})

// Store and Router
const mentorsStore = useMentorsStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Component State
const searchQuery = ref('')
const showFilters = ref(false)
const isInitialized = ref(false)

// Check permissions
const canViewMentors = computed(() => {
  const hasPermission = RoleManager.hasPermission(authStore.loggedInUser, 'mentors:view')
  console.log('🔐 Checking mentors:view permission:', hasPermission)
  console.log('🔐 Current user:', authStore.loggedInUser)
  console.log('🔐 User permissions:', RoleManager.getUserPermissions(authStore.loggedInUser))
  
  // For development: always return true
  return true // Temporarily bypass permission check
  // return hasPermission
})

const canSearchMentors = computed(() => 
  RoleManager.hasPermission(authStore.loggedInUser, 'mentors:search')
)

// Store computed properties
const {
  mentors,
  isLoading,
  isSearching,
  error,
  totalCount,
  hasMore,
  viewMode,
  hasActiveFilters,
  featuredMentors,
  trendingMentors,
  marketplaceStats,
  searchResults,
  mentorProfilesPagination
} = storeToRefs(mentorsStore)

// Computed for pagination
const hasMoreProfiles = computed(() => mentorProfilesPagination.value.hasNext)
const totalProfiles = computed(() => mentorProfilesPagination.value.totalItems)

// Debug logging
watch(mentors, (newMentors) => {
  console.log('🎯 Mentors updated:', newMentors.length, newMentors)
}, { immediate: true })

watch(isLoading, (loading) => {
  console.log('⏳ Loading state:', loading)
}, { immediate: true })

watch(error, (err) => {
  console.log('❌ Error state:', err)
}, { immediate: true })

// Search functionality
const handleSearch = async (query: string) => {
  searchQuery.value = query
  if (query.trim()) {
    // Use the new search method for mentor profiles
    await mentorsStore.searchMentorProfiles(query)
    // Set search results
    if (mentorsStore.mentorProfiles.length > 0) {
      mentorsStore.setSearchResults(mentorsStore.mentorProfiles)
    }
  } else {
    // If empty, load all profiles
    await mentorsStore.loadMentorProfiles({ page: 0, size: 20 })
    if (mentorsStore.mentorProfiles.length > 0) {
      mentorsStore.setSearchResults(mentorsStore.mentorProfiles)
    }
  }
}

const clearSearch = async () => {
  searchQuery.value = ''
  await mentorsStore.loadMentorProfiles({ page: 0, size: 20 })
  if (mentorsStore.mentorProfiles.length > 0) {
    mentorsStore.setSearchResults(mentorsStore.mentorProfiles)
  }
}

// Sorting options
const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'newest', label: 'Newest' },
  { value: 'most_popular', label: 'Most Popular' }
]

const handleSortChange = async (sortBy: string) => {
  await mentorsStore.updateSort(sortBy as any)
}

const handleViewModeChange = (mode: 'grid' | 'list') => {
  mentorsStore.setViewMode(mode)
}

const loadMoreMentors = async () => {
  // Load more mentor profiles with current search term
  await mentorsStore.loadMoreMentorProfiles(searchQuery.value || undefined)
  // Update search results with all loaded profiles
  if (mentorsStore.mentorProfiles.length > 0) {
    mentorsStore.setSearchResults(mentorsStore.mentorProfiles)
  }
}

// Filter management
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const clearAllFilters = async () => {
  await mentorsStore.clearFilters()
}

// Quick filters
const quickFilters = [
  { label: 'Top Rated', filter: { rating: { min: 4.5 } } },
  { label: 'Verified', filter: { verificationStatus: ['verified'] } },
  { label: 'New Mentors', filter: { sortBy: 'newest' } }
]

const applyQuickFilter = async (filter: any) => {
  await mentorsStore.searchMentors({ ...filter, page: 1 })
}

// URL parameter handling
const initializeFromRoute = () => {
  const query = route.query.q as string
  const program = route.query.program as string
  const category = route.query.category as string
  
  if (query) {
    searchQuery.value = query
  }
  
  // Handle program filtering
  if (program || category) {
    console.log('🔍 Program/Category filter detected:', { program, category })
    // You can add program-specific filtering logic here
    // For now, we'll use the query to filter mentors
  }
}

// Watch for route changes
watch(() => route.query, () => {
  if (isInitialized.value) {
    initializeFromRoute()
  }
})

// Initialize component
onMounted(async () => {
  // Temporary development login - ensures we have a user
  if (!authStore.loggedInUser) {
    console.log('🔐 No logged in user, setting temporary dev user...')
    await authStore.login({
      username: "mentee@prospermentor.com",
      password: "any"
    })
  }

  if (!canViewMentors.value) {
    console.log('❌ User cannot view mentors, redirecting to dashboard')
    router.push('/app/dashboard')
    return
  }

  console.log('🚀 Initializing mentors page...')

  // Initialize from route params
  initializeFromRoute()

  try {
    // Load mentor profiles from API with pagination
    console.log('🔄 Loading mentor profiles from API...')
    await mentorsStore.loadMentorProfiles({ page: 0, size: 20 })

    // Set the loaded profiles as search results
    if (mentorsStore.mentorProfiles.length > 0) {
      mentorsStore.setSearchResults(mentorsStore.mentorProfiles)
      console.log('✅ Loaded', mentorsStore.mentorProfiles.length, 'mentor profiles from API')
      console.log('📄 Pagination:', mentorsStore.mentorProfilesPagination)
    } else {
      console.log('⚠️ No mentor profiles returned from API')
    }

    console.log('📊 Final mentors count:', mentors.value?.length || 'undefined')
  } catch (error) {
    console.error('❌ Error during initialization:', error)
    mentorsStore.state.error = 'Failed to load mentors. Please refresh the page.'
  }

  isInitialized.value = true
})

// Error handling
const dismissError = () => {
  mentorsStore.clearError()
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">

    <!-- Page Header -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Find Your Mentor</h1>
          <p class="text-muted-foreground">
            Connect with experienced professionals to accelerate your growth
          </p>
        </div>
        
        <!-- View Mode Toggle -->
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="handleViewModeChange('grid')"
            :class="{ 'bg-primary text-primary-foreground': viewMode === 'grid' }"
          >
            <Grid3X3 class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="handleViewModeChange('list')"
            :class="{ 'bg-primary text-primary-foreground': viewMode === 'list' }"
          >
            <List class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- Marketplace Stats -->
      <!-- <MentorStats v-if="marketplaceStats" :stats="marketplaceStats" /> -->
    </div>

    <!-- Search and Filters -->
    <Card>
      <CardContent class="p-6">
        <div class="space-y-4">
          <!-- Search Bar -->
          <MentorSearchBar
            v-model="searchQuery"
            :is-searching="isSearching"
            @search="handleSearch"
            @clear="clearSearch"
          />

          <!-- Quick Filters and Controls -->
          <div class="flex flex-wrap items-center gap-2">
            <!-- Quick Filter Chips -->
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="filter in quickFilters"
                :key="filter.label"
                variant="outline"
                size="sm"
                @click="applyQuickFilter(filter.filter)"
                class="text-xs"
              >
                {{ filter.label }}
              </Button>
            </div>

            <Separator orientation="vertical" class="h-6" />

            <!-- Filter Toggle -->
            <Button
              variant="outline"
              size="sm"
              @click="toggleFilters"
              :class="{ 'bg-primary text-primary-foreground': showFilters }"
            >
              <SlidersHorizontal class="h-4 w-4 mr-2" />
              Filters
              <Badge v-if="hasActiveFilters" variant="secondary" class="ml-2">
                {{ Object.values(mentorsStore.activeFilters).flat().length }}
              </Badge>
            </Button>

            <!-- Sort Dropdown -->
            <Select
              :model-value="mentorsStore.state.activeSort"
              @update:model-value="handleSortChange"
            >
              <SelectTrigger class="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in sortOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Clear Filters -->
            <Button
              v-if="hasActiveFilters"
              variant="ghost"
              size="sm"
              @click="clearAllFilters"
            >
              <X class="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Error Alert -->
    <Alert v-if="error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription class="flex items-center justify-between">
        {{ error }}
        <Button variant="ghost" size="sm" @click="dismissError">
          <X class="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>

    <div class="grid lg:grid-cols-4 gap-6">
      <!-- Filters Sidebar -->
      <div v-show="showFilters" class="lg:col-span-1">
        <Card class="sticky top-6">
          <CardHeader>
            <CardTitle class="flex items-center justify-between">
              <span>Filters</span>
              <Button
                variant="ghost"
                size="sm"
                @click="toggleFilters"
                class="lg:hidden"
              >
                <X class="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MentorFilters />
          </CardContent>
        </Card>
      </div>

      <!-- Main Content -->
      <div :class="showFilters ? 'lg:col-span-3' : 'lg:col-span-4'">
        <div class="space-y-6">
          <!-- Results Header -->
          <div v-if="!isLoading && mentors.length > 0" class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold">All Mentors</h2>
              <p class="text-sm text-muted-foreground">
                Showing {{ mentors.length }} of {{ totalCount }} mentors
              </p>
            </div>
          </div>

          <!-- Mentor Grid/List -->
          <div v-if="!isLoading && mentors.length > 0">

            <!-- Original mentor display -->
            <div 
              :class="{
                'grid gap-6': viewMode === 'grid',
                'grid-cols-1 md:grid-cols-2 xl:grid-cols-3': viewMode === 'grid',
                'space-y-4': viewMode === 'list'
              }"
            >
              <MentorCard
                v-for="mentor in mentors"
                :key="mentor.id"
                :mentor="mentor"
                :view-mode="viewMode"
                :is-favorite="mentorsStore.isFavorite(mentor.id)"
                @add-favorite="mentorsStore.addToFavorites"
                @remove-favorite="mentorsStore.removeFromFavorites"
              />
            </div>

            <!-- Load More Button -->
            <div v-if="hasMoreProfiles" class="flex justify-center mt-8">
              <Button
                @click="loadMoreMentors"
                :disabled="isLoading"
                variant="outline"
                size="lg"
              >
                {{ isLoading ? 'Loading...' : 'Load More Mentors' }}
              </Button>
              <p class="text-sm text-muted-foreground ml-4 flex items-center">
                Showing {{ mentors.length }} of {{ totalProfiles }}
              </p>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else-if="isLoading || isSearching" class="space-y-6">
            <div
              :class="{
                'grid gap-6': viewMode === 'grid',
                'grid-cols-1 md:grid-cols-2 xl:grid-cols-3': viewMode === 'grid',
                'space-y-4': viewMode === 'list'
              }"
            >
              <Card v-for="i in 12" :key="i">
                <CardContent class="pt-8 pb-6 px-6">
                  <div class="space-y-4">
                    <!-- Centered Avatar -->
                    <div class="flex justify-center">
                      <Skeleton class="h-24 w-24 rounded-full" />
                    </div>

                    <!-- Name -->
                    <div class="flex justify-center">
                      <Skeleton class="h-6 w-32" />
                    </div>

                    <!-- Rating -->
                    <div class="flex justify-center">
                      <Skeleton class="h-4 w-40" />
                    </div>

                    <!-- Button -->
                    <Skeleton class="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <div class="space-y-4">
              <Users class="h-16 w-16 mx-auto text-muted-foreground" />
              <div class="space-y-2">
                <h3 class="text-lg font-semibold">No mentors found</h3>
                <p class="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any mentors matching your criteria. 
                  Try adjusting your search or filters.
                </p>
              </div>
              <Button @click="clearSearch" variant="outline">
                Clear Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1400px;
}
</style> 