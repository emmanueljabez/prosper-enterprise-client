<template>
  <div class="bg-white p-6 rounded-lg border">
    <div class="mb-6">
      <h3 class="text-xl font-semibold mb-2">
        {{ existingReview ? 'Edit Your Review' : 'Write a Review' }}
      </h3>
      <p class="text-gray-600">
        Share your experience to help others find the right mentor.
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Overall Rating -->
      <div class="space-y-2">
        <Label class="text-base font-medium">Overall Rating *</Label>
        <div class="flex items-center space-x-2">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            @click="setRating(star)"
            @mouseover="hoverRating = star"
            @mouseleave="hoverRating = 0"
            class="focus:outline-none"
          >
            <Star
              :class="star <= (hoverRating || formData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'"
              class="w-8 h-8 transition-colors cursor-pointer"
            />
          </button>
          <span v-if="formData.rating" class="ml-3 text-sm text-gray-600">
            {{ ratingLabels[formData.rating - 1] }}
          </span>
        </div>
        <p v-if="errors.rating" class="text-sm text-red-600">{{ errors.rating }}</p>
      </div>

      <!-- Review Title -->
      <div class="space-y-2">
        <Label for="title" class="text-base font-medium">Review Title *</Label>
        <Input
          id="title"
          v-model="formData.title"
          placeholder="Summarize your experience in a few words..."
          :class="{ 'border-red-500': errors.title }"
        />
        <p v-if="errors.title" class="text-sm text-red-600">{{ errors.title }}</p>
      </div>

      <!-- Review Content -->
      <div class="space-y-2">
        <Label for="content" class="text-base font-medium">Your Review *</Label>
        <Textarea
          id="content"
          v-model="formData.content"
          placeholder="Tell others about your mentoring experience. What did you learn? How did the mentor help you?"
          rows="5"
          :class="{ 'border-red-500': errors.content }"
        />
        <div class="flex justify-between items-center">
          <p v-if="errors.content" class="text-sm text-red-600">{{ errors.content }}</p>
          <span class="text-sm text-gray-500">
            {{ formData.content.length }}/{{ maxContentLength }}
          </span>
        </div>
      </div>

      <!-- Category Ratings -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <Label class="text-base font-medium">Detailed Ratings</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            @click="showCategoryRatings = !showCategoryRatings"
          >
            {{ showCategoryRatings ? 'Hide' : 'Show' }} Details
            <ChevronDown 
              :class="{ 'rotate-180': showCategoryRatings }"
              class="w-4 h-4 ml-1 transition-transform"
            />
          </Button>
        </div>

        <div v-if="showCategoryRatings" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(label, category) in categoryLabels" :key="category" class="space-y-2">
            <Label class="text-sm font-medium">{{ label }}</Label>
            <div class="flex items-center space-x-1">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="setCategoryRating(category, star)"
                class="focus:outline-none"
              >
                <Star
                  :class="star <= (formData.categoryRatings[category] || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                  class="w-5 h-5 transition-colors cursor-pointer"
                />
              </button>
              <span class="ml-2 text-sm text-gray-600">
                {{ formData.categoryRatings[category] || 0 }}/5
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Session Context (if available) -->
      <div v-if="sessionDetails" class="bg-gray-50 p-4 rounded-lg">
        <h4 class="font-medium text-gray-900 mb-2">Session Details</h4>
        <div class="text-sm text-gray-600 space-y-1">
          <p><strong>Type:</strong> {{ sessionDetails.type }}</p>
          <p><strong>Duration:</strong> {{ sessionDetails.duration }} minutes</p>
          <p><strong>Date:</strong> {{ formatDate(sessionDetails.date) }}</p>
          <p v-if="sessionDetails.topics?.length"><strong>Topics:</strong> {{ sessionDetails.topics.join(', ') }}</p>
        </div>
      </div>

      <!-- Privacy Options -->
      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <Checkbox 
            id="anonymous" 
            v-model="formData.isAnonymous"
          />
          <Label for="anonymous" class="text-sm">
            Post this review anonymously
          </Label>
        </div>
        <p class="text-xs text-gray-500">
          Anonymous reviews help maintain your privacy while still providing valuable feedback.
        </p>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-between pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          @click="$emit('cancel')"
          :disabled="isSubmitting"
        >
          Cancel
        </Button>
        
        <div class="space-x-3">
          <Button 
            v-if="existingReview"
            type="button" 
            variant="outline" 
            @click="handleDelete"
            :disabled="isSubmitting"
            class="text-red-600 hover:text-red-700"
          >
            Delete Review
          </Button>
          <Button 
            type="submit" 
            :loading="isSubmitting"
            :disabled="!isFormValid"
          >
            {{ existingReview ? 'Update Review' : 'Submit Review' }}
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Star, ChevronDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { MentorReview } from '@/types/mentor'

interface ReviewFormData {
  rating: number
  title: string
  content: string
  categoryRatings: Record<string, number>
  isAnonymous: boolean
}

interface SessionDetails {
  type: string
  duration: number
  date: Date
  topics?: string[]
}

interface Props {
  mentorId: string
  sessionId?: string
  sessionDetails?: SessionDetails
  existingReview?: MentorReview
  isSubmitting?: boolean
}

interface Emits {
  (e: 'submit', data: ReviewFormData): void
  (e: 'cancel'): void
  (e: 'delete'): void
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false
})

const emit = defineEmits<Emits>()

// Constants
const maxContentLength = 2000
const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
const categoryLabels = {
  communication: 'Communication',
  expertise: 'Expertise',
  helpfulness: 'Helpfulness',
  availability: 'Availability',
  valueForMoney: 'Value for Money'
}

// Reactive state
const formData = reactive<ReviewFormData>({
  rating: props.existingReview?.rating || 0,
  title: props.existingReview?.title || '',
  content: props.existingReview?.content || '',
  categoryRatings: props.existingReview?.categoryRatings || {},
  isAnonymous: props.existingReview?.isAnonymous || false
})

const errors = reactive({
  rating: '',
  title: '',
  content: ''
})

const hoverRating = ref(0)
const showCategoryRatings = ref(false)

// Computed properties
const isFormValid = computed(() => {
  return formData.rating > 0 && 
         formData.title.trim().length > 0 && 
         formData.content.trim().length >= 10 &&
         formData.content.length <= maxContentLength &&
         Object.keys(errors).every(key => !errors[key as keyof typeof errors])
})

// Methods
const setRating = (rating: number) => {
  formData.rating = rating
  validateRating()
}

const setCategoryRating = (category: string, rating: number) => {
  formData.categoryRatings[category] = rating
}

const validateRating = () => {
  errors.rating = formData.rating === 0 ? 'Please select a rating' : ''
}

const validateTitle = () => {
  if (!formData.title.trim()) {
    errors.title = 'Please enter a review title'
  } else if (formData.title.length > 100) {
    errors.title = 'Title must be less than 100 characters'
  } else {
    errors.title = ''
  }
}

const validateContent = () => {
  if (!formData.content.trim()) {
    errors.content = 'Please write your review'
  } else if (formData.content.trim().length < 10) {
    errors.content = 'Review must be at least 10 characters long'
  } else if (formData.content.length > maxContentLength) {
    errors.content = `Review must be less than ${maxContentLength} characters`
  } else {
    errors.content = ''
  }
}

const handleSubmit = () => {
  // Validate all fields
  validateRating()
  validateTitle()
  validateContent()

  if (isFormValid.value) {
    emit('submit', { ...formData })
  }
}

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
    emit('delete')
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Watch for validation
watch(() => formData.title, validateTitle)
watch(() => formData.content, validateContent)
</script> 