<template>
  <div class="bg-white p-6 rounded-lg border">
    <!-- Review Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-start space-x-4">
        <!-- Reviewer Avatar -->
        <div class="flex-shrink-0">
          <img 
            v-if="!review.isAnonymous && review.reviewer?.avatar"
            :src="review.reviewer.avatar" 
            :alt="review.reviewer.name"
            class="w-10 h-10 rounded-full"
          />
          <div v-else class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User class="w-5 h-5 text-gray-600" />
          </div>
        </div>
        
        <!-- Reviewer Info -->
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-1">
            <h4 class="font-medium text-gray-900">
              {{ review.isAnonymous ? 'Anonymous' : (review.reviewer?.name || 'Unknown') }}
            </h4>
            <Badge v-if="review.isVerified" variant="secondary" class="text-xs">
              <CheckCircle class="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
          
          <!-- Rating -->
          <div class="flex items-center space-x-2 mb-2">
            <div class="flex items-center space-x-1">
              <Star v-for="i in 5" :key="i"
                :class="i <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                class="w-4 h-4"
              />
            </div>
            <span class="text-sm text-gray-600">
              {{ formatDate(review.createdAt) }}
            </span>
          </div>
          
          <!-- Session Details -->
          <div v-if="review.sessionDetails" class="text-xs text-gray-500 mb-2">
            {{ review.sessionDetails.sessionType }} • {{ review.sessionDetails.duration }}min • 
            {{ review.sessionDetails.topics.join(', ') }}
          </div>
        </div>
      </div>
      
      <!-- Review Actions -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="sm">
            <MoreHorizontal class="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="showReportDialog = true">
            <Flag class="w-4 h-4 mr-2" />
            Report Review
          </DropdownMenuItem>
          <DropdownMenuItem v-if="canEdit" @click="editReview">
            <Edit class="w-4 h-4 mr-2" />
            Edit Review
          </DropdownMenuItem>
          <DropdownMenuItem v-if="canDelete" @click="deleteReview" class="text-red-600">
            <Trash class="w-4 h-4 mr-2" />
            Delete Review
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    
    <!-- Review Title -->
    <h3 v-if="review.title" class="font-semibold text-lg mb-3">
      {{ review.title }}
    </h3>
    
    <!-- Review Content -->
    <div class="mb-4">
      <p class="text-gray-700 leading-relaxed">
        {{ review.content }}
      </p>
    </div>
    
    <!-- Category Ratings -->
    <div v-if="review.categoryRatings" class="mb-4">
      <h4 class="text-sm font-medium text-gray-900 mb-2">Detailed Ratings</h4>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div v-for="(rating, category) in review.categoryRatings" :key="category"
          class="flex items-center justify-between text-sm">
          <span class="text-gray-600 capitalize">{{ formatCategoryName(category) }}</span>
          <div class="flex items-center space-x-1">
            <Star v-for="i in rating" :key="i" 
              class="w-3 h-3 text-yellow-400 fill-current" />
            <span class="text-gray-500 ml-1">{{ rating }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Review Actions -->
    <div class="flex items-center justify-between pt-4 border-t">
      <div class="flex items-center space-x-4">
        <!-- Helpful/Not Helpful -->
        <div class="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            @click="markHelpful(true)"
            :class="{ 'bg-green-50 text-green-600': userHelpfulVote === true }"
          >
            <ThumbsUp class="w-4 h-4 mr-1" />
            {{ review.helpfulCount }}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            @click="markHelpful(false)"
            :class="{ 'bg-red-50 text-red-600': userHelpfulVote === false }"
          >
            <ThumbsDown class="w-4 h-4 mr-1" />
            {{ review.notHelpfulCount }}
          </Button>
        </div>
        
        <!-- Reply Button for Mentors -->
        <Button 
          v-if="canReply && !review.mentorResponse" 
          variant="ghost" 
          size="sm"
          @click="showReplyDialog = true"
        >
          <MessageSquare class="w-4 h-4 mr-1" />
          Reply
        </Button>
      </div>
      
      <div class="text-xs text-gray-500">
        {{ review.replyCount > 0 ? `${review.replyCount} replies` : '' }}
      </div>
    </div>
    
    <!-- Mentor Response -->
    <div v-if="review.mentorResponse" class="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <Badge variant="outline" class="text-blue-600 border-blue-600">
            Mentor
          </Badge>
        </div>
        <div class="flex-1">
          <p class="text-gray-700 mb-2">{{ review.mentorResponse.content }}</p>
          <p class="text-xs text-gray-500">
            {{ formatDate(review.mentorResponse.createdAt) }}
            <span v-if="review.mentorResponse.isEdited" class="ml-1">(edited)</span>
          </p>
        </div>
      </div>
    </div>
    
    <!-- Report Dialog -->
    <Dialog v-model:open="showReportDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Review</DialogTitle>
          <DialogDescription>
            Help us maintain a safe community by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Reason for reporting</Label>
            <Select v-model="reportReason">
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                <SelectItem value="fake">Fake review</SelectItem>
                <SelectItem value="offensive">Offensive language</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="report-description">Additional details (optional)</Label>
            <Textarea 
              id="report-description"
              v-model="reportDescription"
              placeholder="Provide more details about why you're reporting this review..."
              rows="3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showReportDialog = false">Cancel</Button>
          <Button @click="submitReport" :disabled="!reportReason">
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <!-- Reply Dialog -->
    <Dialog v-model:open="showReplyDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reply to Review</DialogTitle>
          <DialogDescription>
            Your response will be visible to all users and shows your commitment to mentee feedback.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="reply-content">Your response</Label>
            <Textarea 
              id="reply-content"
              v-model="replyContent"
              placeholder="Thank the reviewer and address any feedback..."
              rows="4"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showReplyDialog = false">Cancel</Button>
          <Button @click="submitReply" :disabled="!replyContent.trim()">
            Post Reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  Star, User, CheckCircle, MoreHorizontal, Flag, Edit, Trash,
  ThumbsUp, ThumbsDown, MessageSquare
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { MentorReview } from '@/types/mentor'

interface Props {
  review: MentorReview
  currentUserId?: string
  canReply?: boolean
  showModeration?: boolean
}

interface Emits {
  (e: 'helpful', reviewId: string, isHelpful: boolean): void
  (e: 'report', reviewId: string, reason: string, description?: string): void
  (e: 'mentor-reply', reviewId: string, content: string): void
  (e: 'edit', reviewId: string): void
  (e: 'delete', reviewId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  canReply: false,
  showModeration: false
})

const emit = defineEmits<Emits>()

// Local state
const showReportDialog = ref(false)
const showReplyDialog = ref(false)
const reportReason = ref('')
const reportDescription = ref('')
const replyContent = ref('')
const userHelpfulVote = ref<boolean | null>(null) // Track user's helpful vote

// Computed properties
const canEdit = computed(() => 
  props.currentUserId === props.review.reviewerId
)

const canDelete = computed(() => 
  props.currentUserId === props.review.reviewerId || props.showModeration
)

// Methods
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const formatCategoryName = (category: string) => {
  return category.replace(/([A-Z])/g, ' $1').trim()
}

const markHelpful = (isHelpful: boolean) => {
  // Toggle if clicking same button, otherwise set new value
  const newVote = userHelpfulVote.value === isHelpful ? null : isHelpful
  userHelpfulVote.value = newVote
  
  if (newVote !== null) {
    emit('helpful', props.review.id, newVote)
  }
}

const submitReport = () => {
  if (reportReason.value) {
    emit('report', props.review.id, reportReason.value, reportDescription.value || undefined)
    showReportDialog.value = false
    reportReason.value = ''
    reportDescription.value = ''
  }
}

const submitReply = () => {
  if (replyContent.value.trim()) {
    emit('mentor-reply', props.review.id, replyContent.value.trim())
    showReplyDialog.value = false
    replyContent.value = ''
  }
}

const editReview = () => {
  emit('edit', props.review.id)
}

const deleteReview = () => {
  if (confirm('Are you sure you want to delete this review?')) {
    emit('delete', props.review.id)
  }
}
</script> 