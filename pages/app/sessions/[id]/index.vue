<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionsStore } from '@/store/modules/sessions/sessions'
import { useAppToast } from '@/composables/services/toastService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarClock,
  CheckCircle,
  Clock,
  LifeBuoy,
  Loader2,
  Users,
  X,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Session Details',
  description: 'Review session details and proposal actions',
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const sessionsStore = useSessionsStore()
const toast = useAppToast()

const sessionId = computed(() => route.params.id as string)
const session = ref<any>(null)
const isLoading = ref(false)
const respondingProposalId = ref<string | null>(null)
const supportRequesting = ref(false)
const proposalResponse = ref('')
const supportMessage = ref('')

const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const formatTime = (date: string) => new Date(date).toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const formatDateTime = (date: string) => `${formatDate(date)} at ${formatTime(date)}`
const unwrapApiData = (response: any) => response?.data || response

const hasPendingProposal = computed(() => {
  return session.value?.activeProposal?.status === 'PENDING_MENTEE_RESPONSE'
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

    if (hasPendingProposal.value) {
      await router.replace(`/app/sessions/proposals/${session.value.id}`)
    }
  } catch (error) {
    console.error('Error loading session details:', error)
    toast.error('Failed to load session details')
  } finally {
    isLoading.value = false
  }
}

const handleAcceptProposal = async (slot: any) => {
  if (!session.value?.activeProposal?.id || !slot?.id) return

  respondingProposalId.value = session.value.activeProposal.id
  try {
    await sessionsStore.acceptProposal(session.value.id, session.value.activeProposal.id, {
      slotId: slot.id,
      response: proposalResponse.value.trim() || null,
    })
    session.value.status = 'CONFIRMED'
    session.value.scheduledStart = slot.scheduledStart
    session.value.scheduledEnd = slot.scheduledEnd
    session.value.activeProposal = {
      ...session.value.activeProposal,
      status: 'ACCEPTED',
      acceptedSlotId: slot.id,
    }
  } catch (error) {
    console.error('Error accepting proposal:', error)
  } finally {
    respondingProposalId.value = null
  }
}

const handleDeclineProposal = async () => {
  if (!session.value?.activeProposal?.id) return

  respondingProposalId.value = session.value.activeProposal.id
  try {
    await sessionsStore.declineProposal(session.value.id, session.value.activeProposal.id, {
      response: proposalResponse.value.trim() || null,
    })
    session.value.activeProposal = {
      ...session.value.activeProposal,
      status: 'DECLINED',
      menteeResponse: proposalResponse.value.trim() || null,
    }
  } catch (error) {
    console.error('Error declining proposal:', error)
  } finally {
    respondingProposalId.value = null
  }
}

const handleContactSupport = async () => {
  if (!session.value?.id) return

  supportRequesting.value = true
  try {
    await sessionsStore.contactSupport(session.value.id, {
      requesterType: 'MENTEE',
      message: supportMessage.value.trim() || null,
    })
    supportMessage.value = ''
  } catch (error) {
    console.error('Error requesting support contact:', error)
  } finally {
    supportRequesting.value = false
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
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <Button variant="ghost" class="mb-4" @click="router.push('/app/sessions')">
      <ArrowLeft class="mr-2 h-4 w-4" />
      Sessions
    </Button>

    <div v-if="isLoading" class="space-y-4">
      <Skeleton class="h-12 w-2/3" />
      <Skeleton class="h-64 w-full" />
    </div>

    <Alert v-else-if="!session" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription>Session could not be loaded.</AlertDescription>
    </Alert>

    <div v-else class="space-y-6">
      <Card>
        <CardHeader>
          <div class="flex items-start justify-between gap-4">
            <div>
              <CardTitle>{{ session.title }}</CardTitle>
              <CardDescription>Session details and booking coordination</CardDescription>
            </div>
            <Badge variant="outline">{{ session.status }}</Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="flex items-center gap-2 text-sm">
              <Calendar class="h-4 w-4 text-muted-foreground" />
              <span>{{ formatDate(session.scheduledStart) }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <Clock class="h-4 w-4 text-muted-foreground" />
              <span>{{ formatTime(session.scheduledStart) }} - {{ formatTime(session.scheduledEnd) }}</span>
            </div>
          </div>
          <p v-if="session.menteeMessage" class="text-sm text-muted-foreground">
            {{ session.menteeMessage }}
          </p>
        </CardContent>
      </Card>

      <Card v-if="hasPendingProposal" class="border-emerald-200">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-emerald-900">
            <CalendarClock class="h-5 w-5" />
            Alternative Time Proposed
          </CardTitle>
          <CardDescription>Respond to the mentor's proposed time.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <p v-if="session.activeProposal.mentorMessage" class="text-sm text-emerald-800">
            {{ session.activeProposal.mentorMessage }}
          </p>

          <div class="grid gap-3 md:grid-cols-2">
            <div
              v-for="slot in session.activeProposal.slots"
              :key="slot.id"
              class="rounded-lg border p-4"
            >
              <div class="font-medium">{{ formatDateTime(slot.scheduledStart) }}</div>
              <div class="text-sm text-muted-foreground">Ends {{ formatTime(slot.scheduledEnd) }}</div>
              <Button
                class="mt-4 w-full"
                @click="handleAcceptProposal(slot)"
                :disabled="respondingProposalId === session.activeProposal.id"
              >
                <CheckCircle class="mr-2 h-4 w-4" />
                Accept this time
              </Button>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="proposal-response">Response (Optional)</Label>
            <Textarea
              id="proposal-response"
              v-model="proposalResponse"
              rows="3"
              placeholder="Add a short response for your mentor."
            />
          </div>

          <div class="flex flex-wrap gap-2">
            <Button
              variant="outline"
              @click="handleDeclineProposal"
              :disabled="respondingProposalId === session.activeProposal.id"
            >
              <X class="mr-2 h-4 w-4" />
              Decline proposed time
            </Button>
            <Button variant="outline" @click="viewAlternativeMentors">
              <Users class="mr-2 h-4 w-4" />
              View alternative mentors
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <LifeBuoy class="h-5 w-5" />
            Contact Support
          </CardTitle>
          <CardDescription>Ask the Mentee Experience team to follow up about this booking.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <Textarea v-model="supportMessage" rows="3" placeholder="Share what you need help with." />
          <Button @click="handleContactSupport" :disabled="supportRequesting">
            <Loader2 v-if="supportRequesting" class="mr-2 h-4 w-4 animate-spin" />
            <LifeBuoy v-else class="mr-2 h-4 w-4" />
            {{ supportRequesting ? 'Sending...' : 'Request Support Contact' }}
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
