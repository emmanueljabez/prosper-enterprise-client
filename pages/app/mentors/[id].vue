<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMentorsStore } from '@/store/modules/mentors'
import { useSubscriptionsStore } from '@/store/modules/subscriptions'
import { storeToRefs } from 'pinia'

// UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ExternalLink, ArrowLeft, Users, AlertCircle, CreditCard, Loader2, CheckCircle2, XCircle } from 'lucide-vue-next'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import MentorAvailabilityCalendar from '@/components/ui/mentors/MentorAvailabilityCalendar.vue'
import MentorReviews from '@/components/ui/mentors/MentorReviews.vue'
import PaymentDialog from '@/components/ui/subscriptions/PaymentDialog.vue'
import { useAppToast } from '@/composables/services/toastService'
import {useSessionsStore} from "~/store/modules/sessions/sessions";
import type { SubscriptionPlan } from '@/http/requests/app/subscriptions'

definePageMeta({
  title: 'Mentor Profile',
  requiresAuth: true,
})

const route = useRoute()
const router = useRouter()
const mentorsStore = useMentorsStore()
const sessionStore = useSessionsStore()
const subscriptionsStore = useSubscriptionsStore()
const { mentors } = storeToRefs(mentorsStore)

const mentor = ref<any | null>(null)
const isLoading = ref(true)
const isBookingSession = ref(false)
const activeTab = ref('availability')
const toast = useAppToast()

// Payment dialog state
const showPaymentDialog = ref(false)
const selectedPlanForPayment = ref<SubscriptionPlan | null>(null)
const pendingBooking = ref<any | null>(null)

// Error dialog state
const showErrorDialog = ref(false)
const errorDialogMessage = ref('')
const errorDialogTitle = ref('Subscription Limit Reached')
const recommendedPlans = ref<SubscriptionPlan[]>([])
const selectedRecommendedPlan = ref<string | null>(null)

// Addon options state
const addOnOption = ref<any | null>(null)
const selectedAddonQuantity = ref(1)

// Retry dialog state
const showRetryDialog = ref(false)
const isRetrying = ref(false)
const retryStatus = ref<'processing' | 'success' | 'error'>('processing')
const retryMessage = ref('')

// Minimal fallback dataset (topics trimmed to names only)
const fallbackData = () => {
  // Reuse the list embedded in the mentors index page by keeping a minimal version here
  return [
    // Only include id, name, occupation, country, profilePicUrl, biography, topics
    // This avoids an extra import and ensures the page works standalone
    { id: '60ea94d2d5efdc75988d09f5', name: 'Thrity Engineer', occupation: '', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FPROFILE%20PIC.jpg?alt=media&token=1f9a5d98-9f0a-47ae-8c33-5bc1b0b2ab8e', biography: 'Thrity is a seasoned marketer with over 20 years experience in leading diverse teams, strategy development and brand communication. She is also an executive leadership coach.', topics: [ { name: 'How to Ace the Interview' }, { name: 'How to Build My Personal Brand' }, { name: 'Increasing My Personal Productivity' }, { name: 'How to Enjoy My Life & My Work' }, { name: 'How to Advance My Career' } ] },
    { id: '60ea94d3d5efdc75988d09fe', name: 'Achieng Butler', occupation: 'CEO - Marketing Strategist - Consultant', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2F25FBD548-14F5-4D04-B0E8-A4737F3320A1.jpeg?alt=media&token=a4584fca-69d8-4b89-8f1d-bc0e5093fa75', biography: "Founder & CEO of Digital Beehive (strategy & digital marketing: digitalbeehive.net). Seasoned marketer & keen techpreneur.", topics: [ { name: 'How to Advance My Career' }, { name: 'How to Build My Personal Brand' }, { name: 'How to Build My Online Presence' } ] },
    { id: '60ea94d6d5efdc75988d0a3f', name: 'Faith Nkatha Gitonga', occupation: '', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FBD84BAA5-BED1-468E-9EAF-60230E5E4A0E.jpeg?alt=media&token=efa8e28e-ecc2-4877-bc9b-72e49d276961', biography: 'Faith currently works for Oracle Corporation leading their Digital Transformation efforts for the Public Sector.', topics: [ { name: 'How to Build My Personal Brand' }, { name: 'How to Advance My Career' }, { name: 'How to Ace the Interview' } ] },
    { id: '60ea94d4d5efdc75988d0a21', name: 'Janice Kemoli', occupation: '', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2F0F16A019-1207-4487-B61A-9F9BD22F796B.jpeg?alt=media&token=5c21e191-43c3-4390-ad08-c70ae41f2e7c', biography: 'A thought leader in brand and marketing strategy.', topics: [ { name: 'Creating My Ability to Adapt to Change' }, { name: 'How to Advance My Career' }, { name: 'How to Find a Job' } ] },
    { id: '60ea94d4d5efdc75988d0a11', name: 'Dick Omondi', occupation: '', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosper-app.appspot.com/o/images%2FIMG-3499.JPG?alt=media&token=4129ea7a-a83e-4c51-a9cf-e5673803540c', biography: 'I work to grow people and brands through cutting edge strategies.', topics: [ { name: 'How to Show Up & Boss Up' }, { name: 'How to Strategically Network' }, { name: 'How to Build My Personal Brand' } ] },
    { id: '60ea94d4d5efdc75988d0a14', name: 'Susan Kiamba', occupation: 'Career Development Trainer', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FProfile_Pic_Susan_Kiamba001.jpg?alt=media&token=93fc6d24-f690-4e6f-8177-1fe61cb4267b', biography: 'Career development trainer who creates Aha! moments about careers and work.', topics: [ { name: 'How to Build My Personal Brand' }, { name: 'How to Advance My Career' }, { name: 'How to Build My Online Presence' } ] },
    { id: '60ea94d4d5efdc75988d0a0e', name: 'George Muriithi Weru', occupation: 'Consulting', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FGeorge%20Weru%20Photo.jpg?alt=media&token=956f26e0-5bd9-4a78-919e-8702a83925e8', biography: 'Experienced professional in accounting and finance.', topics: [ { name: 'How to Advance My Career' } ] },
    { id: '60ea94d5d5efdc75988d0a2b', name: 'Paul Muhami', occupation: 'Entrepreneur', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FIMG-20200910-WA0006.jpg?alt=media&token=f4d0792d-7e2f-4d74-9873-889752df6dc7', biography: 'Entrepreneur, certified business coach and mentor.', topics: [ { name: 'My Personal Finance' }, { name: 'How to Start a Business' }, { name: 'How to Grow My Business' } ] },
    { id: '60ea94d4d5efdc75988d0a18', name: 'Jonathan Muga', occupation: 'Banker', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosper-app.appspot.com/o/images%2FIMG-20200424-WA0031.jpg?alt=media&token=1aad57ba-9ff6-4d7c-a96f-876dc1074834', biography: '17+ years multinational experience in finance.', topics: [ { name: 'How to Negotiate the Best Deal' }, { name: 'How to Advance My Career' }, { name: 'Other' } ] },
    { id: '60ea94d3d5efdc75988d0a02', name: 'Topyster Muga', occupation: 'Founder and CEO| Digital Financial Services| On-Demand Services', country: 'Kenya', profilePicUrl: 'https://myprosper-email-assets.s3-eu-west-1.amazonaws.com/0b913452a70b4556b82c58b01707c95f.jpeg', biography: 'Founder and CEO of Prosper Mentor. Multi-national, multi-faceted career in technology.', topics: [ { name: 'How to Write a Stellar CV' }, { name: 'How to Advance My Career' }, { name: 'How to Ace the Interview' } ] },
    { id: '646515c2b42b1d68dd4d6a8f', name: 'Amos Gachuiri', occupation: 'Investment Professional', country: 'Kenya', profilePicUrl: 'https://my-prosper-public-assets.s3-eu-west-1.amazonaws.com/fc7d6f3eb56542569c6fefb028e5aac1.jpg', biography: 'Board-level leader with 20+ years’ investment experience.', topics: [ { name: 'My Personal Finance' }, { name: 'How to Negotiate the Best Deal' }, { name: 'How to Start a Business' } ] },
    // Additional mentors used in Program page
    { id: '60ea94d2d5efdc75988d09ec', name: 'James Gachie', occupation: '', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FJames%20Gachie%201.jpg?alt=media&token=64b162e0-3c93-43f8-b67b-ea65010c668a', biography: 'Sales and Strategy across Western Europe, The Balkans and Africa.', topics: [ { name: 'How to Advance My Career' }, { name: 'How to Ace the Interview' }, { name: 'How to Build My Online Presence' } ] },
    { id: '60ea94d3d5efdc75988d09f9', name: 'John N. Njathi', occupation: '', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FIMG-20200717-WA0000.jpg?alt=media&token=ef0e1144-7852-4a8f-9c81-34a9e65ff2b6', biography: '', topics: [ { name: 'How to Advance My Career' }, { name: 'Building My Personal Resilience' }, { name: 'Creating My Ability to Adapt to Change' } ] },
    { id: '60ea94d3d5efdc75988d09fa', name: 'Jonnah Owen Rao', occupation: '', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FRadekArtPhoto-9743.jpg?alt=media&token=09e23b07-7c80-4570-94ab-2915b6b42a7b', biography: 'Strategic planning, risk management and venture advisory.', topics: [ { name: 'My Personal Finance' }, { name: 'How to Advance My Career' }, { name: 'Creating My Ability to Adapt to Change' }, { name: 'Other' } ] },
    { id: '60ea94d3d5efdc75988d09f8', name: 'Vincent Wakaba', occupation: 'Banker', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2FVincent%20Wakaba%20Passport%20Photo.JPG?alt=media&token=474fe036-942e-4e08-809c-a56e7dc3c66c', biography: 'DFS and mobile money experience across East and West Africa.', topics: [ { name: 'How to Advance My Career' }, { name: 'Creating My Ability to Adapt to Change' } ] },
    { id: '60ea94d3d5efdc75988d0a05', name: 'Azmina Mulji', occupation: 'Professional Coach & Mentor. HR Expert', country: 'Kenya', profilePicUrl: 'https://firebasestorage.googleapis.com/v0/b/prosperappprod.appspot.com/o/images%2F2C2CFE40-D3F6-4B50-93F9-4504FC8B480D.jpeg?alt=media&token=7eb483e5-4757-4667-93c0-9ace3ff4c099', biography: 'Coaching and mentoring to develop potential.', topics: [ { name: 'How to Advance My Career' }, { name: 'How to Enjoy My Life & My Work' }, { name: 'Discovering My Truest Self' }, { name: 'How to Show Up & Boss Up' }, { name: 'Increasing My Personal Productivity' } ] },
  ]
}

const loadMentor = async () => {
  isLoading.value = true
  const id = route.params.id as string
  try {
    // First, try to fetch from API
    try {
      const mentorProfile = await mentorsStore.getMentorProfileById(id)
      if (mentorProfile) {
        // Map API response to component format
        mentor.value = {
          id: mentorProfile.id,
          firstName: mentorProfile.firstName,
          lastName: mentorProfile.lastName,
          title: mentorProfile.industry || 'Professional Mentor',
          company: mentorProfile.location || mentorProfile.country || '',
          profilePhoto: mentorProfile.avatarUrl,
          profileSummary: mentorProfile.bio,
          expertiseAreas: mentorProfile.expertise || [],
          averageRating: 4.5,
          totalReviews: 0,
          totalSessions: 0,
          email: mentorProfile.email,
          phone: mentorProfile.phone,
          linkedInUrl: mentorProfile.linkedinUrl,
          favouriteQuote: mentorProfile.favouriteQuote,
          isVerified: mentorProfile.isVerified
        }
        return
      }
    } catch (apiError) {
      console.warn('Failed to fetch mentor from API, falling back to store/fallback data:', apiError)
    }

    // Try find in current store list
    const fromStore = mentors.value?.find((m: any) => m.id === id)
    if (fromStore) {
      mentor.value = fromStore
      return
    }

    // Fallback to embedded data (convert to simple structure compatible with template)
    const fb = fallbackData().find(m => m.id === id)
    if (fb) {
      mentor.value = {
        id: fb.id,
        firstName: fb.name,
        lastName: '',
        title: fb.occupation || 'Professional Mentor',
        company: fb.country || 'Kenya',
        profilePhoto: fb.profilePicUrl,
        profileSummary: fb.biography,
        expertiseAreas: (fb.topics || []).map((t: any) => t.name),
        averageRating: 4.9,
        totalReviews: 42,
        totalSessions: 128,
      }
      return
    }

    // If still not found, go back
    console.error(`Mentor with ID ${id} not found`)
    router.push('/app/mentors')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadMentor)

const fullName = computed(() => `${mentor.value?.firstName || ''} ${mentor.value?.lastName || ''}`.trim())

const handleBookingSubmit = async (booking: any) => {
  const userData = JSON.parse(localStorage.getItem('loggedInUser'))

  console.log(booking)
  console.log(userData)

  let sessionData = {
    "mentorId": mentor.value?.id,
    "menteeId": userData.id,
    "skillId": "01491e2c-849e-4420-8ab8-06271aeea5c7",
    "scheduledStart": booking.requestedStart,
    "meetingPlatform": "GOOGLE_MEET",
    "menteeMessage": booking.message
  }

  console.log(sessionData)

  isBookingSession.value = true

  try {
    const response = await sessionStore.createSession(sessionData)
    console.log(response)
    toast.success('Session request submitted successfully!')
  } catch (error: any) {
    console.error('Booking error:', error)

    // Check if error response indicates payment is required
    const errorResponse = error.response?.data

    if (errorResponse?.status === 'error' && errorResponse?.data?.paymentRequired) {
      // Store the pending booking to retry after payment
      pendingBooking.value = booking

      // Extract recommended plans from API response
      const apiRecommendedPlans = errorResponse?.data?.recommendedPlans || []

      if (apiRecommendedPlans.length > 0) {
        // Store recommended plans
        recommendedPlans.value = apiRecommendedPlans

        // If only one plan is recommended, auto-select it and proceed directly to payment
        if (apiRecommendedPlans.length === 1) {
          selectedPlanForPayment.value = apiRecommendedPlans[0]
          selectedRecommendedPlan.value = apiRecommendedPlans[0].id

          // Show payment dialog directly
          showPaymentDialog.value = true

          // Show a brief toast about why payment is needed
          toast.info(errorResponse.message || 'Please complete payment to continue booking.')
        } else {
          // Multiple plans available - show error dialog with plan selection
          selectedRecommendedPlan.value = apiRecommendedPlans[0].id // Pre-select first plan
          selectedPlanForPayment.value = apiRecommendedPlans[0]

          errorDialogTitle.value = 'Subscription Required'
          errorDialogMessage.value = errorResponse.message || 'Please select a subscription plan to continue.'
          showErrorDialog.value = true
        }
      } else {
        // Check if addon option is available
        const apiAddOnOption = errorResponse?.data?.addOnOption

        if (apiAddOnOption && apiAddOnOption.available) {
          // Store addon option
          addOnOption.value = apiAddOnOption
          selectedAddonQuantity.value = apiAddOnOption.recommendedQuantity || 1

          // Show error dialog with addon purchase option
          errorDialogTitle.value = 'Sessions Exhausted'
          errorDialogMessage.value = errorResponse.message || 'You have used all your sessions. Purchase additional sessions to continue.'
          showErrorDialog.value = true
        } else {
          // Fallback: No recommended plans or addons, fetch all available plans
          try {
            await subscriptionsStore.fetchPlans()

            const fallbackPlan = subscriptionsStore.activePlans[0]
            if (fallbackPlan) {
              selectedPlanForPayment.value = fallbackPlan
              errorDialogTitle.value = 'Subscription Limit Reached'
              errorDialogMessage.value = errorResponse.message || 'Subscription limit reached. Please upgrade your plan or make a payment.'
              showErrorDialog.value = true
            } else {
              toast.error('No subscription plans available. Please contact support.')
            }
          } catch (planError) {
            console.error('Error fetching plans:', planError)
            toast.error('Failed to load subscription plans. Please try again.')
          }
        }
      }
    } else {
      // Generic error handling
      toast.error(errorResponse?.message || 'Failed to submit session request. Please try again.')
    }
  } finally {
    isBookingSession.value = false
  }
}

const handleUpgradeClick = () => {
  // Close error dialog and open payment dialog
  showErrorDialog.value = false
  showPaymentDialog.value = true
}

const handleAddonPurchase = () => {
  // For addon purchases, we'll show the payment dialog
  // The payment will be handled through a custom addon purchase flow
  showErrorDialog.value = false
  showPaymentDialog.value = true
}

const handlePaymentSuccess = async () => {
  showPaymentDialog.value = false
  selectedPlanForPayment.value = null

  // Show success message
  toast.success('Payment completed successfully!')

  // Retry the booking if we have a pending one
  if (pendingBooking.value) {
    // Show retry dialog
    showRetryDialog.value = true
    isRetrying.value = true
    retryStatus.value = 'processing'
    retryMessage.value = 'Processing your session booking...'

    try {
      const userData = JSON.parse(localStorage.getItem('loggedInUser'))

      const sessionData = {
        "mentorId": mentor.value?.id,
        "menteeId": userData.id,
        "skillId": "01491e2c-849e-4420-8ab8-06271aeea5c7",
        "scheduledStart": pendingBooking.value.requestedStart,
        "meetingPlatform": "GOOGLE_MEET",
        "menteeMessage": pendingBooking.value.message
      }

      const response = await sessionStore.createSession(sessionData)

      // Success
      retryStatus.value = 'success'
      retryMessage.value = 'Your session has been booked successfully! You will receive a confirmation email shortly.'

      // Clear pending booking
      pendingBooking.value = null

    } catch (error: any) {
      console.error('Retry booking error:', error)
      retryStatus.value = 'error'
      retryMessage.value = error.response?.data?.message || 'Failed to book the session. Please try again or contact support.'
    } finally {
      isRetrying.value = false
    }
  }
}

const closeRetryDialog = () => {
  showRetryDialog.value = false

  // Reset retry state after a delay
  setTimeout(() => {
    retryStatus.value = 'processing'
    retryMessage.value = ''
  }, 300)
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <div>
      <Button variant="ghost" class="gap-2" @click="router.push('/app/mentors')">
        <ArrowLeft class="h-4 w-4" /> Back to mentors
      </Button>
    </div>

    <Card v-if="!isLoading && mentor">
      <CardHeader>
        <div class="flex items-start gap-4">
          <Avatar class="h-16 w-16">
            <AvatarImage :src="mentor.profilePhoto" :alt="fullName" />
            <AvatarFallback>{{ (fullName || '?').slice(0,2).toUpperCase() }}</AvatarFallback>
          </Avatar>
          <div class="flex-1 min-w-0">
            <CardTitle class="text-2xl">{{ fullName }}</CardTitle>
            <CardDescription class="mt-1">{{ mentor.title }} • {{ mentor.company }}</CardDescription>
            <div class="mt-3 flex flex-wrap gap-2">
              <Badge v-for="area in (mentor.expertiseAreas || []).slice(0,6)" :key="area" variant="secondary" class="text-xs">{{ area }}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <h3 class="font-semibold mb-2">About</h3>
          <p class="text-sm text-muted-foreground whitespace-pre-line">{{ mentor.profileSummary }}</p>
        </div>

        <Separator />

        <!-- Tabs: Availability, Reviews -->
        <Tabs v-model="activeTab">
          <TabsList class="grid grid-cols-2 w-full md:w-auto">
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="availability" class="pt-4">
            <MentorAvailabilityCalendar
              :mentor-id="mentor.id"
              :mentor-name="fullName"
              :topics="(mentor.expertiseAreas || [])"
              :is-loading="isBookingSession"
              @booking-submit="handleBookingSubmit"
            />
          </TabsContent>

          <TabsContent value="reviews" class="pt-4">
            <MentorReviews :mentor-id="mentor.id" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <div v-else class="text-center text-muted-foreground py-20">Loading...</div>

    <!-- Error Dialog -->
    <Dialog v-model:open="showErrorDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <div class="flex items-center gap-3 mb-2">
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
              <AlertCircle class="w-6 h-6 text-amber-600" />
            </div>
            <DialogTitle class="text-xl">{{ errorDialogTitle }}</DialogTitle>
          </div>
          <DialogDescription class="text-base pt-2">
            {{ errorDialogMessage }}
          </DialogDescription>
        </DialogHeader>

        <!-- Plan Selection (when multiple plans available) -->
        <div v-if="recommendedPlans.length > 1" class="space-y-3">
          <div class="space-y-2">
            <p class="text-sm font-medium">Choose a subscription plan:</p>
            <div class="space-y-2">
              <div
                v-for="plan in recommendedPlans"
                :key="plan.id"
                @click="selectedRecommendedPlan = plan.id; selectedPlanForPayment = plan"
                :class="{
                  'border-primary bg-primary/5': selectedRecommendedPlan === plan.id,
                  'border-border hover:border-primary/50': selectedRecommendedPlan !== plan.id
                }"
                class="border rounded-lg p-4 cursor-pointer transition-all"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <h4 class="font-semibold">{{ plan.name }}</h4>
                      <Badge variant="secondary" class="text-xs">{{ plan.code }}</Badge>
                    </div>
                    <p class="text-sm text-muted-foreground mt-1">{{ plan.description }}</p>
                    <div class="flex items-center gap-4 mt-2">
                      <span class="text-lg font-bold text-primary">{{ plan.formattedPrice }}</span>
                      <span class="text-sm text-muted-foreground">{{ plan.sessionsDescription }}</span>
                    </div>
                  </div>
                  <div
                    :class="selectedRecommendedPlan === plan.id ? 'bg-primary border-primary' : 'border-2'"
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  >
                    <div v-if="selectedRecommendedPlan === plan.id" class="w-2.5 h-2.5 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Addon Purchase Option (when addon available) -->
        <div v-else-if="addOnOption && addOnOption.available" class="space-y-4">
          <div class="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
            <div class="flex items-start gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <CreditCard class="w-5 h-5 text-primary" />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-base mb-1">Purchase Additional Sessions</h4>
                <p class="text-sm text-muted-foreground">{{ addOnOption.message }}</p>
              </div>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div class="space-y-2">
            <Label class="text-sm font-medium">Number of sessions</Label>
            <div class="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                @click="selectedAddonQuantity = Math.max(1, selectedAddonQuantity - 1)"
                :disabled="selectedAddonQuantity <= 1"
              >
                -
              </Button>
              <div class="flex-1 text-center">
                <div class="text-2xl font-bold">{{ selectedAddonQuantity }}</div>
                <div class="text-xs text-muted-foreground">sessions</div>
              </div>
              <Button
                variant="outline"
                size="icon"
                @click="selectedAddonQuantity = Math.min(20, selectedAddonQuantity + 1)"
                :disabled="selectedAddonQuantity >= 20"
              >
                +
              </Button>
            </div>
          </div>

          <!-- Price Summary -->
          <div class="bg-muted/50 rounded-lg p-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Price per session:</span>
              <span class="font-medium">{{ addOnOption.formattedPrice }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Quantity:</span>
              <span class="font-medium">{{ selectedAddonQuantity }} session{{ selectedAddonQuantity > 1 ? 's' : '' }}</span>
            </div>
            <Separator class="my-2" />
            <div class="flex justify-between">
              <span class="font-semibold">Total:</span>
              <span class="text-xl font-bold text-primary">
                {{ addOnOption.currency }} {{ (addOnOption.costPerSession * selectedAddonQuantity).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Info box (when no plan selection, no addon) -->
        <div v-else class="bg-muted/50 rounded-lg p-4 space-y-2">
          <p class="text-sm font-medium">What you can do:</p>
          <ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Upgrade your subscription plan</li>
            <li>Make a payment to continue</li>
            <li>Contact support for assistance</li>
          </ul>
        </div>

        <DialogFooter class="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            @click="showErrorDialog = false"
            class="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            v-if="addOnOption && addOnOption.available"
            @click="handleAddonPurchase"
            class="w-full sm:w-auto"
          >
            Purchase {{ selectedAddonQuantity }} Session{{ selectedAddonQuantity > 1 ? 's' : '' }}
          </Button>
          <Button
            v-else
            @click="handleUpgradeClick"
            class="w-full sm:w-auto"
          >
            {{ recommendedPlans.length > 1 ? 'Continue with Selected Plan' : 'Upgrade Plan' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Payment Dialog -->
    <PaymentDialog
      v-model:open="showPaymentDialog"
      :plan="selectedPlanForPayment"
      :addon-option="addOnOption"
      :addon-quantity="selectedAddonQuantity"
      @success="handlePaymentSuccess"
    />

    <!-- Retry Booking Dialog -->
    <Dialog v-model:open="showRetryDialog" :close-disabled="isRetrying">
      <DialogContent class="sm:max-w-md" :close-disabled="isRetrying">
        <DialogHeader>
          <div class="flex items-center gap-3 mb-2">
            <!-- Processing State -->
            <div v-if="retryStatus === 'processing'" class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
              <Loader2 class="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <!-- Success State -->
            <div v-else-if="retryStatus === 'success'" class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
              <CheckCircle2 class="w-6 h-6 text-green-600" />
            </div>
            <!-- Error State -->
            <div v-else-if="retryStatus === 'error'" class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <XCircle class="w-6 h-6 text-red-600" />
            </div>

            <DialogTitle class="text-xl">
              {{ retryStatus === 'processing' ? 'Booking Session' : retryStatus === 'success' ? 'Booking Confirmed' : 'Booking Failed' }}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div class="py-4">
          <p class="text-base text-muted-foreground">
            {{ retryMessage }}
          </p>

          <!-- Processing indicator -->
          <div v-if="isRetrying" class="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 class="w-4 h-4 animate-spin" />
            <span>Please wait...</span>
          </div>

          <!-- Success details -->
          <div v-if="retryStatus === 'success'" class="mt-4 bg-green-50 rounded-lg p-4 space-y-2">
            <p class="text-sm font-medium text-green-900">Next Steps:</p>
            <ul class="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li>Check your email for session details</li>
              <li>Add the session to your calendar</li>
              <li>Prepare any questions for your mentor</li>
            </ul>
          </div>

          <!-- Error details -->
          <div v-if="retryStatus === 'error'" class="mt-4 bg-red-50 rounded-lg p-4 space-y-2">
            <p class="text-sm font-medium text-red-900">What you can do:</p>
            <ul class="text-sm text-red-800 space-y-1 list-disc list-inside">
              <li>Try booking again in a few moments</li>
              <li>Contact support if the problem persists</li>
              <li>Check your subscription status</li>
            </ul>
          </div>
        </div>

        <DialogFooter v-if="!isRetrying">
          <Button
            @click="closeRetryDialog"
            class="w-full"
            :variant="retryStatus === 'error' ? 'outline' : 'default'"
          >
            {{ retryStatus === 'success' ? 'Done' : 'Close' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.container { max-width: 1000px; }
</style>