<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionsStore } from '@/store/modules/sessions/sessions'
import { useAppToast } from '@/composables/services/toastService'
import PublicSiteHeader from '@/components/landing/PublicSiteHeader.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  AlertCircle,
  Calendar,
  CalendarClock,
  CheckCircle,
  Clock,
  LifeBuoy,
  Loader2,
  MessageSquare,
  Users,
  X,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Review Proposed Time',
  description: 'Review and respond to mentor proposed alternative time slots',
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const sessionsStore = useSessionsStore()
const toast = useAppToast()

const sessionId = computed(() => route.params.id as string)
const session = ref<any>(null)
const activeProposal = ref<any>(null)
const isLoading = ref(false)
const submittingSlotId = ref<string | null>(null)
const isDeclining = ref(false)
const isContactingSupport = ref(false)
const selectedSlotId = ref('')
const responseMessage = ref('')
const declineReason = ref('')
const supportMessage = ref('')
const completedAction = ref<'accepted' | 'declined' | 'support' | null>(null)

const unwrapApiData = (response: any) => response?.data || response

const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const formatTime = (date: string) => new Date(date).toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const formatDateTime = (date: string) => `${formatDate(date)} at ${formatTime(date)}`

const hasPendingProposal = computed(() => {
  return activeProposal.value?.status === 'PENDING_MENTEE_RESPONSE' &&
    Array.isArray(activeProposal.value.slots) &&
    activeProposal.value.slots.length > 0
})

const loadSession = async () => {
  isLoading.value = true
  try {
    const loadedSession = unwrapApiData(await sessionsStore.getSessionById(sessionId.value))
    const loadedProposal = loadedSession?.activeProposal
      ? loadedSession.activeProposal
      : unwrapApiData(await sessionsStore.getActiveProposal(sessionId.value))

    session.value = {
      ...loadedSession,
      activeProposal: loadedProposal || null,
    }
    activeProposal.value = loadedProposal || null
    selectedSlotId.value = loadedProposal?.slots?.[0]?.id || ''
  } catch (error) {
    console.error('Error loading proposed times:', error)
    toast.error('Failed to load proposed times')
  } finally {
    isLoading.value = false
  }
}

const handleAcceptProposal = async (slot: any) => {
  if (!session.value?.id || !activeProposal.value?.id || !slot?.id) return

  submittingSlotId.value = slot.id
  try {
    const response = await sessionsStore.acceptProposal(session.value.id, activeProposal.value.id, {
      slotId: slot.id,
      response: responseMessage.value.trim() || null,
    })
    session.value = unwrapApiData(response) || {
      ...session.value,
      status: 'CONFIRMED',
      scheduledStart: slot.scheduledStart,
      scheduledEnd: slot.scheduledEnd,
    }
    activeProposal.value = {
      ...activeProposal.value,
      status: 'ACCEPTED',
      acceptedSlotId: slot.id,
    }
    completedAction.value = 'accepted'
  } catch (error) {
    console.error('Error accepting proposal:', error)
  } finally {
    submittingSlotId.value = null
  }
}

const handleDeclineProposal = async () => {
  if (!session.value?.id || !activeProposal.value?.id) return

  isDeclining.value = true
  try {
    await sessionsStore.declineProposal(session.value.id, activeProposal.value.id, {
      response: declineReason.value.trim() || null,
    })
    activeProposal.value = {
      ...activeProposal.value,
      status: 'DECLINED',
      menteeResponse: declineReason.value.trim() || null,
    }
    completedAction.value = 'declined'
  } catch (error) {
    console.error('Error declining proposal:', error)
  } finally {
    isDeclining.value = false
  }
}

const handleContactSupport = async () => {
  if (!session.value?.id) return

  isContactingSupport.value = true
  try {
    await sessionsStore.contactSupport(session.value.id, {
      requesterType: 'MENTEE',
      message: supportMessage.value.trim() || null,
    })
    supportMessage.value = ''
    completedAction.value = 'support'
  } catch (error) {
    console.error('Error requesting support contact:', error)
  } finally {
    isContactingSupport.value = false
  }
}

const viewAlternativeMentors = () => {
  if (!session.value) return
  router.push({
    path: '/app/mentors',
    query: {
      fromSession: session.value.id,
      excludeMentorId: session.value.mentorId,
      skillId: session.value.skillId,
    },
  })
}

onMounted(loadSession)
</script>

<template>
  <div class="relative min-h-screen overflow-hidden" style="font-family: 'Montserrat', 'Inter', ui-sans-serif, system-ui, sans-serif;">
    <img
      src="/img_2.jpg"
      alt="ProsperMentor background"
      class="absolute inset-0 h-full w-full object-cover"
    >
    <div class="absolute inset-0 bg-[#0f3f35]/60" />

    <PublicSiteHeader />

    <main class="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <section class="w-full max-w-[1180px] rounded-[28px] border border-white/30 bg-white/95 p-4 shadow-2xl sm:p-5 lg:p-6">
          <div class="mb-5 flex flex-col gap-1.5 text-center sm:text-left">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#027F63]">Mentorship Session</p>
            <h1 class="text-[24px] font-semibold leading-tight text-[#1f2937] sm:text-[28px]">Review Proposed Times</h1>
            <p class="text-[13px] leading-relaxed text-[#4b5563]">Choose a time proposed by your mentor or request another option.</p>
          </div>

          <div v-if="isLoading" class="grid gap-5 lg:grid-cols-2">
            <Skeleton class="h-96 w-full" />
            <Skeleton class="h-96 w-full" />
          </div>

          <Alert v-else-if="!session" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>Session could not be loaded.</AlertDescription>
          </Alert>

          <Card v-else-if="completedAction" class="rounded-[20px] border-[#e5e7eb] bg-white shadow-sm">
            <CardContent class="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle class="size-12 text-[#027F63]" />
              <div class="flex flex-col gap-2">
                <h2 class="text-[22px] font-semibold text-[#1f2937]">
                  <span v-if="completedAction === 'accepted'">Proposed Time Accepted</span>
                  <span v-else-if="completedAction === 'declined'">Proposed Time Declined</span>
                  <span v-else>Support Request Sent</span>
                </h2>
                <p class="max-w-xl text-[13px] text-[#6b7280]">
                  We will keep both you and your mentor updated as the session workflow progresses.
                </p>
              </div>
              <Button variant="outline" class="rounded-full" @click="router.push('/app/sessions')">Go to My Sessions</Button>
            </CardContent>
          </Card>

          <div v-else class="grid gap-5 lg:grid-cols-2 lg:items-start">
            <Card class="min-w-0 rounded-[20px] border-[#e5e7eb] bg-white shadow-sm">
              <CardHeader class="pb-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle class="text-[20px] font-semibold leading-tight text-[#1f2937]">
                      {{ session.title || session.skillName || 'Mentorship Session' }}
                    </CardTitle>
                    <CardDescription class="mt-1 text-[13px] text-[#6b7280]">Session request awaiting your response</CardDescription>
                  </div>
                  <Badge variant="outline">{{ session.status }}</Badge>
                </div>
              </CardHeader>
              <CardContent class="flex flex-col gap-4 text-sm">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2 font-medium">
                    <Calendar class="size-4 text-muted-foreground" />
                    <span>Original Selected Date</span>
                  </div>
                  <div class="ml-6 flex flex-col gap-1">
                    <p>{{ formatDate(session.scheduledStart) }}</p>
                    <p class="text-muted-foreground">{{ formatTime(session.scheduledStart) }} - {{ formatTime(session.scheduledEnd) }}</p>
                  </div>
                </div>

                <Alert v-if="activeProposal?.mentorMessage">
                  <MessageSquare class="h-4 w-4" />
                  <AlertDescription>{{ activeProposal.mentorMessage }}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card class="min-w-0 rounded-[20px] border-[#e5e7eb] bg-white shadow-sm">
              <CardHeader class="pb-3">
                <CardTitle class="flex items-center gap-2 text-[20px] font-semibold leading-tight text-[#1f2937]">
                  <CalendarClock class="size-5 text-[#027F63]" />
                  Alternative Time Proposed
                </CardTitle>
                <CardDescription class="text-[13px] text-[#6b7280]">Select one of the mentor's proposed slots.</CardDescription>
              </CardHeader>
              <CardContent class="flex flex-col gap-4">
                <Alert v-if="!hasPendingProposal" variant="destructive">
                  <AlertCircle class="h-4 w-4" />
                  <AlertDescription>No pending proposed time slots were found for this session.</AlertDescription>
                </Alert>

                <div v-else class="grid gap-3">
                  <button
                    v-for="slot in activeProposal.slots"
                    :key="slot.id"
                    type="button"
                    class="rounded-[16px] border p-4 text-left transition"
                    :class="selectedSlotId === slot.id ? 'border-[#027F63] bg-[#027F63]/10' : 'border-[#e5e7eb] bg-white hover:border-[#027F63]/60'"
                    @click="selectedSlotId = slot.id"
                  >
                    <div class="flex items-center justify-between gap-4">
                      <div>
                        <p class="text-sm font-semibold text-[#1f2937]">{{ formatDateTime(slot.scheduledStart) }}</p>
                        <p class="text-xs text-[#6b7280]">Ends {{ formatTime(slot.scheduledEnd) }}</p>
                      </div>
                      <CheckCircle v-if="selectedSlotId === slot.id" class="size-5 text-[#027F63]" />
                    </div>
                  </button>
                </div>

                <div class="flex flex-col gap-2">
                  <Label for="proposal-response" class="text-xs font-medium text-[#6b7280]">Response Message (Optional)</Label>
                  <Textarea
                    id="proposal-response"
                    v-model="responseMessage"
                    rows="3"
                    placeholder="Add a short response for your mentor."
                    class="rounded-[14px] border-[#d1d5db] text-[13px]"
                  />
                </div>

                <Button
                  class="h-10 rounded-full bg-[#027F63] text-[13px] font-medium text-white hover:bg-[#046f58]"
                  :disabled="!selectedSlotId || Boolean(submittingSlotId)"
                  @click="handleAcceptProposal(activeProposal.slots.find(slot => slot.id === selectedSlotId))"
                >
                  <Loader2 v-if="submittingSlotId" class="mr-2 size-4 animate-spin" />
                  <CheckCircle v-else class="mr-2 size-4" />
                  Accept Proposed Time
                </Button>

                <div class="grid gap-4 border-t border-[#e5e7eb] pt-4">
                  <div class="flex flex-col gap-2">
                    <Label for="decline-reason" class="text-xs font-medium text-[#6b7280]">Decline Message (Optional)</Label>
                    <Textarea
                      id="decline-reason"
                      v-model="declineReason"
                      rows="3"
                      placeholder="Tell your mentor why these slots do not work."
                      class="rounded-[14px] border-[#d1d5db] text-[13px]"
                    />
                    <Button variant="outline" class="h-10 rounded-full text-[13px]" :disabled="isDeclining || !hasPendingProposal" @click="handleDeclineProposal">
                      <Loader2 v-if="isDeclining" class="mr-2 size-4 animate-spin" />
                      <X v-else class="mr-2 size-4" />
                      Decline Proposed Times
                    </Button>
                  </div>

                  <Button variant="outline" class="h-10 rounded-full text-[13px]" @click="viewAlternativeMentors">
                    <Users class="mr-2 size-4" />
                    View Alternative Mentors
                  </Button>

                  <div class="flex flex-col gap-2">
                    <Label for="support-message" class="text-xs font-medium text-[#6b7280]">Support Message (Optional)</Label>
                    <Textarea
                      id="support-message"
                      v-model="supportMessage"
                      rows="3"
                      placeholder="Ask the Mentee Experience team to contact you."
                      class="rounded-[14px] border-[#d1d5db] text-[13px]"
                    />
                    <Button class="h-10 rounded-full bg-[#027F63] text-[13px] font-medium text-white hover:bg-[#046f58]" :disabled="isContactingSupport" @click="handleContactSupport">
                      <Loader2 v-if="isContactingSupport" class="mr-2 size-4 animate-spin" />
                      <LifeBuoy v-else class="mr-2 size-4" />
                      Contact Mentee Experience Rep
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
      </section>
    </main>
  </div>
</template>
