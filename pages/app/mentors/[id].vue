<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMentorsStore } from '@/store/modules/mentors'
import { storeToRefs } from 'pinia'

// UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ExternalLink, ArrowLeft, Users } from 'lucide-vue-next'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import MentorAvailabilityCalendar from '@/components/ui/mentors/MentorAvailabilityCalendar.vue'
import MentorReviews from '@/components/ui/mentors/MentorReviews.vue'
import { useAppToast } from '@/composables/services/toastService'
import {useSessionsStore} from "~/store/modules/sessions/sessions";

definePageMeta({
  title: 'Mentor Profile',
  requiresAuth: true,
})

const route = useRoute()
const router = useRouter()
const mentorsStore = useMentorsStore()
const sessionStore = useSessionsStore()
const { mentors } = storeToRefs(mentorsStore)

const mentor = ref<any | null>(null)
const isLoading = ref(true)
const activeTab = ref('availability')
const toast = useAppToast()

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
    // Try find in current store list first
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
    router.push('/app/mentors')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadMentor)

const fullName = computed(() => `${mentor.value?.firstName || ''} ${mentor.value?.lastName || ''}`.trim())

const handleBookingSubmit = (booking: any) => {
  let sessionData = {
    "mentorId": "0c1022c3-a876-4b51-baaf-2c9fb9879183",
    "menteeId": "00386b78-4609-4859-a0d4-16425a4c216c",
    "skillId": "01491e2c-849e-4420-8ab8-06271aeea5c7",
    "scheduledStart": "2025-09-16T10:10:00Z",
    "meetingPlatform": "GOOGLE_MEET",
    "menteeMessage": booking.message
  }

  console.log(sessionData)

  sessionStore.createSession(sessionData)
      .then(response => {
        console.log(response)
        toast.success('Session request submitted successfully!')
      })
      .catch(console.error)

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
  </div>
</template>

<style scoped>
.container { max-width: 1000px; }
</style>