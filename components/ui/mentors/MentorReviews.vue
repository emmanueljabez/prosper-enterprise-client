<template>
  <div class="space-y-6">
    <!-- Review Summary Stats -->
    <div v-if="summary" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg border">
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-1">
            <Star v-for="i in 5" :key="i" 
              :class="i <= Math.round(summary.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'" 
              class="w-5 h-5" />
          </div>
          <span class="text-2xl font-bold">{{ summary.averageRating.toFixed(1) }}</span>
        </div>
        <p class="text-sm text-gray-600 mt-2">
          Based on {{ summary.totalReviews }} reviews
        </p>
      </div>
      
      <div class="bg-white p-6 rounded-lg border">
        <div class="space-y-2">
          <div v-for="(count, rating) in summary.ratingDistribution" :key="rating" 
            class="flex items-center space-x-3">
            <span class="text-sm font-medium w-3">{{ rating }}</span>
            <Star class="w-4 h-4 text-yellow-400 fill-current" />
            <div class="flex-1 bg-gray-200 rounded-full h-2">
              <div class="bg-yellow-400 h-2 rounded-full" 
                :style="`width: ${(count / summary.totalReviews) * 100}%`">
              </div>
            </div>
            <span class="text-sm text-gray-600 w-8">{{ count }}</span>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg border">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Response Rate</span>
            <span class="font-semibold">{{ summary.responseRate }}%</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Verified Reviews</span>
            <span class="font-semibold">{{ summary.verifiedPercentage }}%</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Avg Response Time</span>
            <span class="font-semibold">{{ summary.averageResponseTime }}h</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Sort -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div class="flex flex-wrap items-center space-x-4">
        <Select v-model="localFilters.sortBy">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest_rating">Highest Rated</SelectItem>
            <SelectItem value="lowest_rating">Lowest Rated</SelectItem>
            <SelectItem value="most_helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="ratingFilter">
          <SelectTrigger class="w-[150px]">
            <SelectValue placeholder="All ratings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
          </SelectContent>
        </Select>

        <div class="flex items-center space-x-2">
          <Checkbox 
            id="verified-only" 
            v-model="localFilters.verified"
          />
          <Label for="verified-only" class="text-sm">Verified only</Label>
        </div>
      </div>

      <Button @click="$emit('write-review')" variant="outline">
        <PenTool class="w-4 h-4 mr-2" />
        Write Review
      </Button>
    </div>

    <!-- Reviews List -->
    <div class="space-y-6">
      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white p-6 rounded-lg border">
          <Skeleton class="h-4 w-1/4 mb-3" />
          <Skeleton class="h-4 w-3/4 mb-2" />
          <Skeleton class="h-4 w-1/2 mb-4" />
          <Skeleton class="h-20 w-full" />
        </div>
      </div>

      <div v-else-if="reviews.length === 0" 
        class="text-center py-12 bg-white rounded-lg border">
        <MessageSquare class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
        <p class="text-gray-600">Be the first to review this mentor!</p>
      </div>

      <div v-else class="space-y-6">
        <MentorReviewCard
          v-for="review in reviews"
          :key="review.id"
          :review="review"
          :current-user-id="currentUserId"
          @helpful="handleHelpful"
          @report="handleReport"
          @mentor-reply="handleMentorReply"
        />
      </div>

      <!-- Load More -->
      <div v-if="hasMore" class="text-center">
        <Button @click="$emit('load-more')" variant="outline" :loading="isLoading">
          Load More Reviews
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { Star, MessageSquare, PenTool } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import MentorReviewCard from './MentorReviewCard.vue'
import type { MentorReview } from '@/types/mentor'

interface ReviewSummary {
  totalReviews: number
  averageRating: number
  ratingDistribution: Record<string, number>
  responseRate: number
  verifiedPercentage: number
  averageResponseTime: number
}

interface ReviewFilters {
  sortBy?: string
  rating?: number[]
  verified?: boolean
  page?: number
  limit?: number
}

interface Props {
  mentorId: string
  reviews: MentorReview[]
  summary?: ReviewSummary
  isLoading?: boolean
  hasMore?: boolean
  currentUserId?: string
}

interface Emits {
  (e: 'filter-change', filters: ReviewFilters): void
  (e: 'load-more'): void
  (e: 'write-review'): void
  (e: 'helpful', reviewId: string, isHelpful: boolean): void
  (e: 'report', reviewId: string, reason: string, description?: string): void
  (e: 'mentor-reply', reviewId: string, content: string): void
}

const props = withDefaults(defineProps<Props>(), {
  reviews: () => [],
  isLoading: false,
  hasMore: false
})

const emit = defineEmits<Emits>()

// Local filter state
const localFilters = ref<ReviewFilters>({
  sortBy: 'newest',
  verified: false,
  page: 1,
  limit: 10
})

const ratingFilter = ref('all')

// Watch for filter changes and emit to parent
watch([localFilters, ratingFilter], () => {
  const filters: ReviewFilters = {
    ...localFilters.value
  }
  
  // Convert rating filter to array
  if (ratingFilter.value !== 'all') {
    const rating = parseInt(ratingFilter.value)
    filters.rating = rating === 5 ? [5] : 
                   rating === 4 ? [4, 5] :
                   rating === 3 ? [3, 4, 5] :
                   rating === 2 ? [2, 3, 4, 5] : undefined
  }
  
  emit('filter-change', filters)
}, { deep: true })

// Event handlers
const handleHelpful = (reviewId: string, isHelpful: boolean) => {
  emit('helpful', reviewId, isHelpful)
}

const handleReport = (reviewId: string, reason: string, description?: string) => {
  emit('report', reviewId, reason, description)
}

const handleMentorReply = (reviewId: string, content: string) => {
  emit('mentor-reply', reviewId, content)
}
</script> 