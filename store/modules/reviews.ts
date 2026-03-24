import { defineStore } from 'pinia'
import reviewsApi, { type MyReviewRecord, type MyReviewSummaryRecord } from '@/http/requests/app/reviews'

interface ReviewsState {
  loading: boolean
  error: string | null
  summary: MyReviewSummaryRecord | null
  reviews: MyReviewRecord[]
}

export const useReviewsStore = defineStore('reviews', {
  state: (): ReviewsState => ({
    loading: false,
    error: null,
    summary: null,
    reviews: [],
  }),

  actions: {
    async loadMyReviews() {
      this.loading = true
      this.error = null

      try {
        const response = await reviewsApi.getMyReviews()

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load review workspace')
        }

        this.summary = response.data.summary
        this.reviews = response.data.reviews
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || 'Failed to load review workspace'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
