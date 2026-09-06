<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionsStore } from '@/store/modules/sessions/sessions'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Captions,
  ChevronUp,
  Hand,
  Info,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  MoreVertical,
  PanelRightClose,
  PhoneOff,
  Send,
  Smile,
  Sparkles,
  Users,
  Video,
  VideoOff,
  X,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Session Room',
  description: 'Join your Prosper Mentor session',
  layout: false,
})

type AgoraTokenPayload = {
  appId: string
  channelName: string
  uid: string
  token: string
  expiresAt: string
}

type MeetingPanel = 'chat' | 'participants' | null

type MeetingStreamPayload = {
  id: string
  type: 'chat' | 'reaction' | 'hand'
  senderUid: string
  senderName: string
  text?: string
  emoji?: string
  raised?: boolean
  timestamp: string
}

type MeetingMessage = {
  id: string
  senderName: string
  text: string
  timestamp: string
  isLocal: boolean
}

type ReactionBurst = {
  id: string
  emoji: string
  senderName: string
}

const route = useRoute()
const router = useRouter()
const sessionsStore = useSessionsStore()
const toast = useAppToast()

const sessionId = computed(() => String(route.params.id || ''))
const session = ref<any>(null)
const tokenPayload = ref<AgoraTokenPayload | null>(null)
const remoteUsers = ref<any[]>([])
const localPlayer = ref<HTMLElement | null>(null)
const isLoading = ref(true)
const isJoining = ref(false)
const isJoined = ref(false)
const roomError = ref('')
const micEnabled = ref(true)
const cameraEnabled = ref(true)
const screenSharing = ref(false)
const activePanel = ref<MeetingPanel>(null)
const chatDraft = ref('')
const meetingMessages = ref<MeetingMessage[]>([])
const reactionBursts = ref<ReactionBurst[]>([])
const localHandRaised = ref(false)
const showReactions = ref(false)
const showMore = ref(false)

let AgoraRTC: any = null
let client: any = null
let localAudioTrack: any = null
let localVideoTrack: any = null
let screenVideoTrack: any = null
let clockTimer: ReturnType<typeof setInterval> | null = null
const reactionTimers: ReturnType<typeof setTimeout>[] = []
const seenMeetingEventIds = new Set<string>()

const reactionOptions = ['👍', '👏', '🎉', '😊', '❤️']

const formatClock = (value: Date) => value.toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const currentTime = ref(formatClock(new Date()))

const localParticipantName = computed(() => {
  return session.value?.currentUserName
    || session.value?.participantName
    || session.value?.menteeName
    || session.value?.mentorName
    || 'You'
})

const roomTitle = computed(() => session.value?.title || 'Mentorship Session')

const roomCode = computed(() => {
  if (tokenPayload.value?.channelName) return tokenPayload.value.channelName
  if (sessionId.value) return sessionId.value.slice(0, 8)
  return 'session-room'
})

const roomStatus = computed(() => {
  if (roomError.value) return 'Needs attention'
  if (isJoined.value) return 'Live'
  if (isJoining.value) return 'Joining'
  return 'Preparing'
})

const participantCount = computed(() => remoteUsers.value.length + (isJoined.value ? 1 : 0))

const activePanelTitle = computed(() => activePanel.value === 'chat' ? 'Meeting chat' : 'Participants')

const formatTime = (value?: string) => {
  if (!value) return ''
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const formatMessageTime = (value: string) => formatTime(value)

const scheduledTimeRange = computed(() => {
  if (!session.value?.scheduledStart) return ''
  const start = formatTime(session.value.scheduledStart)
  const end = formatTime(session.value.scheduledEnd)
  return end ? `${start} - ${end}` : start
})

const unwrapApiData = (response: any) => response?.data || response

const createEventId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const isMeetingStreamPayload = (value: any): value is MeetingStreamPayload => {
  return Boolean(
    value
    && typeof value.id === 'string'
    && typeof value.type === 'string'
    && typeof value.senderUid === 'string'
    && typeof value.senderName === 'string'
    && typeof value.timestamp === 'string'
    && ['chat', 'reaction', 'hand'].includes(value.type),
  )
}

const decodeStreamPayload = (payload: Uint8Array) => {
  try {
    const decoded = new TextDecoder().decode(payload)
    const parsed = JSON.parse(decoded)
    return isMeetingStreamPayload(parsed) ? parsed : null
  } catch {
    return null
  }
}

const addReactionBurst = (emoji: string, senderName: string) => {
  const id = createEventId()
  reactionBursts.value = [...reactionBursts.value, { id, emoji, senderName }]

  const timer = setTimeout(() => {
    reactionBursts.value = reactionBursts.value.filter((reaction) => reaction.id !== id)
  }, 3200)
  reactionTimers.push(timer)
}

const handleMeetingStreamEvent = (event: MeetingStreamPayload) => {
  if (seenMeetingEventIds.has(event.id)) return
  seenMeetingEventIds.add(event.id)

  const isLocal = event.senderUid === String(tokenPayload.value?.uid || '')

  if (event.type === 'chat' && event.text?.trim()) {
    meetingMessages.value = [
      ...meetingMessages.value,
      {
        id: event.id,
        senderName: event.senderName,
        text: event.text.trim(),
        timestamp: event.timestamp,
        isLocal,
      },
    ]
  }

  if (event.type === 'reaction' && event.emoji) {
    addReactionBurst(event.emoji, isLocal ? 'You' : event.senderName)
  }

  if (event.type === 'hand' && event.raised) {
    addReactionBurst('✋', isLocal ? 'You' : event.senderName)
  }
}

const sendMeetingStreamEvent = async (payload: Pick<MeetingStreamPayload, 'type' | 'text' | 'emoji' | 'raised'>) => {
  if (!client || !isJoined.value || !tokenPayload.value) return false

  const event: MeetingStreamPayload = {
    id: createEventId(),
    senderUid: String(tokenPayload.value.uid),
    senderName: localParticipantName.value,
    timestamp: new Date().toISOString(),
    ...payload,
  }

  try {
    const encoded = new TextEncoder().encode(JSON.stringify(event))
    await client.sendStreamMessage({ payload: encoded })
    handleMeetingStreamEvent(event)
    return true
  } catch (error: any) {
    console.error('Error sending Agora stream message:', error)
    toast.error(error?.message || 'Unable to send meeting update.')
    return false
  }
}

const fetchAgoraToken = async () => {
  const token = await sessionsStore.createAgoraToken(sessionId.value)
  tokenPayload.value = token
  return token
}

const loadAgoraSdk = async () => {
  if (!AgoraRTC) {
    AgoraRTC = await import('agora-rtc-sdk-ng')
  }
  return AgoraRTC
}

const renderRemoteVideoTracks = async () => {
  await nextTick()
  remoteUsers.value.forEach((user) => {
    user.videoTrack?.play(`remote-player-${user.uid}`)
  })
}

const playLocalVideoTrack = async () => {
  await nextTick()
  const track = screenSharing.value ? screenVideoTrack : localVideoTrack
  if (track && localPlayer.value) {
    track.play(localPlayer.value)
  }
}

const joinRoom = async () => {
  isJoining.value = true
  roomError.value = ''

  try {
    if (client) {
      await leaveRoom(false)
    }

    const sdk = await loadAgoraSdk()
    const agora = sdk.default || sdk
    const tokenPayload = await fetchAgoraToken()
    client = agora.createClient({ mode: 'rtc', codec: 'vp8' })

    client.on('user-published', async (user: any, mediaType: 'audio' | 'video') => {
      await client.subscribe(user, mediaType)
      remoteUsers.value = client.remoteUsers.slice()

      if (mediaType === 'video') {
        await renderRemoteVideoTracks()
      }

      if (mediaType === 'audio') {
        user.audioTrack?.play()
      }
    })

    client.on('user-unpublished', async () => {
      remoteUsers.value = client.remoteUsers.slice()
      await renderRemoteVideoTracks()
    })

    client.on('user-left', async () => {
      remoteUsers.value = client.remoteUsers.slice()
      await renderRemoteVideoTracks()
    })

    client.on('stream-message', (_uid: string | number, payload: Uint8Array) => {
      const event = decodeStreamPayload(payload)
      if (event) {
        handleMeetingStreamEvent(event)
      }
    })

    client.on('token-privilege-will-expire', async () => {
      const renewedTokenPayload = await fetchAgoraToken()
      await client?.renewToken(renewedTokenPayload.token)
    })

    client.on('token-privilege-did-expire', async () => {
      const renewedTokenPayload = await fetchAgoraToken()
      await client?.renewToken(renewedTokenPayload.token)
    })

    await client.join(
      tokenPayload.appId,
      tokenPayload.channelName,
      tokenPayload.token,
      tokenPayload.uid,
    )

    const [microphoneTrack, cameraTrack] = await agora.createMicrophoneAndCameraTracks()
    localAudioTrack = microphoneTrack
    localVideoTrack = cameraTrack

    await playLocalVideoTrack()
    await client.publish([localAudioTrack, localVideoTrack])

    isJoined.value = true
    toast.success('Joined session room')
  } catch (error: any) {
    console.error('Error joining Agora room:', error)
    await leaveRoom(false)
    roomError.value = error?.response?.data?.message || error?.message || 'Unable to join this session room.'
    toast.error(roomError.value)
  } finally {
    isJoining.value = false
  }
}

const loadSessionAndJoin = async () => {
  isLoading.value = true
  try {
    const loadedSession = unwrapApiData(await sessionsStore.getSessionById(sessionId.value))
    session.value = loadedSession

    if (loadedSession?.meetingPlatform && loadedSession.meetingPlatform !== 'AGORA') {
      roomError.value = 'This session is not configured for Agora.'
      return
    }

    await joinRoom()
  } catch (error: any) {
    console.error('Error loading Agora session:', error)
    roomError.value = error?.response?.data?.message || 'Failed to load this session room.'
  } finally {
    isLoading.value = false
  }
}

const toggleMic = async () => {
  if (!localAudioTrack) return
  micEnabled.value = !micEnabled.value
  await localAudioTrack.setEnabled(micEnabled.value)
}

const toggleCamera = async () => {
  if (!localVideoTrack) return
  cameraEnabled.value = !cameraEnabled.value
  await localVideoTrack.setEnabled(cameraEnabled.value)
}

const startScreenShare = async () => {
  if (!client || screenSharing.value) return

  try {
    const sdk = await loadAgoraSdk()
    const agora = sdk.default || sdk
    screenVideoTrack = await agora.createScreenVideoTrack({ encoderConfig: '1080p_1' }, 'disable')

    if (localVideoTrack) {
      await client.unpublish(localVideoTrack)
    }

    await client.publish(screenVideoTrack)
    screenSharing.value = true
    await playLocalVideoTrack()
    screenVideoTrack.on('track-ended', stopScreenShare)
  } catch (error: any) {
    console.error('Error starting screen share:', error)
    toast.error(error?.message || 'Unable to start screen sharing.')
  }
}

const stopScreenShare = async () => {
  if (!client || !screenVideoTrack) return

  try {
    await client.unpublish(screenVideoTrack)
    screenVideoTrack.close()
    screenVideoTrack = null

    if (localVideoTrack) {
      await client.publish(localVideoTrack)
    }
    screenSharing.value = false
    await playLocalVideoTrack()
  } catch (error) {
    console.error('Error stopping screen share:', error)
    screenSharing.value = false
  }
}

const togglePanel = (panel: Exclude<MeetingPanel, null>) => {
  activePanel.value = activePanel.value === panel ? null : panel
  showMore.value = false
  showReactions.value = false
}

const sendChatMessage = async () => {
  const text = chatDraft.value.trim()
  if (!text) return

  const sent = await sendMeetingStreamEvent({ type: 'chat', text })
  if (sent) {
    chatDraft.value = ''
  }
}

const sendReaction = async (emoji: string) => {
  showReactions.value = false
  await sendMeetingStreamEvent({ type: 'reaction', emoji })
}

const toggleHand = async () => {
  localHandRaised.value = !localHandRaised.value
  await sendMeetingStreamEvent({
    type: 'hand',
    raised: localHandRaised.value,
  })
}

const leaveRoom = async (redirect = true) => {
  try {
    if (screenVideoTrack) {
      screenVideoTrack.close()
      screenVideoTrack = null
    }
    if (localAudioTrack) {
      localAudioTrack.close()
      localAudioTrack = null
    }
    if (localVideoTrack) {
      localVideoTrack.close()
      localVideoTrack = null
    }
    if (client) {
      await client.leave()
      client = null
    }
  } catch (error) {
    console.error('Error leaving Agora room:', error)
  } finally {
    isJoined.value = false
    remoteUsers.value = []
    if (redirect) {
      await router.push('/app/sessions')
    }
  }
}

onMounted(() => {
  clockTimer = setInterval(() => {
    currentTime.value = formatClock(new Date())
  }, 30000)

  void loadSessionAndJoin()
})

onBeforeUnmount(() => {
  if (clockTimer) {
    clearInterval(clockTimer)
  }

  reactionTimers.forEach((timer) => clearTimeout(timer))
  void leaveRoom(false)
})
</script>

<template>
  <ClientOnly>
    <main class="h-screen min-h-screen overflow-hidden bg-[#111214] text-white">
      <div class="relative flex h-full flex-col">
        <header class="flex h-16 shrink-0 items-center justify-between gap-4 px-4 sm:px-7">
          <div class="flex min-w-0 items-center gap-3 text-sm font-medium text-white/90 sm:text-base">
            <span class="shrink-0">{{ currentTime }}</span>
            <span class="h-6 w-px bg-white/35" />
            <div class="flex min-w-0 items-center gap-2">
              <span class="truncate">{{ roomCode }}</span>
              <button
                type="button"
                class="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-[#dd63c4] text-white transition hover:bg-white/10"
                title="Meeting details"
                aria-label="Meeting details"
              >
                <Info class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <div class="hidden max-w-[36vw] items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs text-white/75 sm:flex">
              <Sparkles class="h-4 w-4 text-[#dd63c4]" />
              <span class="truncate">{{ roomTitle }}</span>
            </div>
            <button
              type="button"
              class="flex h-10 items-center gap-2 rounded-full bg-white/10 px-3 text-sm font-semibold transition hover:bg-white/15"
              title="Participants"
              aria-label="Participants"
              @click="togglePanel('participants')"
            >
              <span class="grid h-7 w-7 place-items-center rounded-full bg-[#016f56] text-xs text-white">
                {{ participantCount }}
              </span>
              <Users class="h-4 w-4" />
            </button>
          </div>
        </header>

        <Alert
          v-if="roomError"
          class="mx-4 border-[#dd63c4]/40 bg-[#dd63c4]/15 text-white sm:mx-7"
        >
          <AlertDescription>{{ roomError }}</AlertDescription>
        </Alert>

        <section class="relative flex min-h-0 flex-1 px-4 pb-28 sm:px-7">
          <div class="relative flex min-h-0 flex-1 items-center justify-center">
            <div
              class="relative aspect-video max-h-[calc(100vh-10rem)] w-full max-w-[1500px] overflow-hidden rounded-[28px] bg-black shadow-[0_22px_70px_rgba(0,0,0,0.42)]"
            >
              <div
                ref="localPlayer"
                class="h-full w-full bg-gradient-to-br from-[#016f56] via-[#10241f] to-[#dd63c4]/60"
              />

              <div
                v-if="!cameraEnabled && !screenSharing"
                class="absolute inset-0 grid place-items-center bg-[#1f2328]"
              >
                <div class="grid h-28 w-28 place-items-center rounded-full bg-white/10 text-4xl font-semibold text-white sm:h-36 sm:w-36">
                  {{ localParticipantName.slice(0, 2).toUpperCase() }}
                </div>
              </div>

              <div
                v-if="!isJoined && !roomError"
                class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/65"
              >
                <Loader2 class="h-8 w-8 animate-spin text-[#dd63c4]" />
                <p class="text-sm text-white/75">
                  {{ isJoining || isLoading ? 'Joining room...' : 'Preparing room...' }}
                </p>
              </div>

              <div class="absolute bottom-5 left-5 rounded-full bg-black/50 px-3 py-1.5 text-sm font-semibold shadow-lg">
                {{ localParticipantName }}
              </div>

              <div
                v-if="screenSharing"
                class="absolute right-5 top-5 rounded-full bg-[#016f56] px-3 py-1.5 text-xs font-semibold text-white"
              >
                Presenting
              </div>
            </div>

            <div
              v-if="remoteUsers.length"
              class="absolute bottom-6 left-6 flex max-w-[calc(100%-3rem)] gap-3 overflow-x-auto pb-1"
            >
              <div
                v-for="user in remoteUsers"
                :key="user.uid"
                class="relative h-28 w-44 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-black shadow-xl"
              >
                <div :id="`remote-player-${user.uid}`" class="h-full w-full bg-[#202124]" />
                <div class="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-1 text-[11px] font-medium">
                  Participant {{ user.uid }}
                </div>
              </div>
            </div>

            <div class="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                v-for="reaction in reactionBursts"
                :key="reaction.id"
                class="absolute bottom-24 left-1/2 flex -translate-x-1/2 animate-[meeting-reaction-float_3.2s_ease-out_forwards] flex-col items-center gap-1 rounded-full bg-black/45 px-5 py-3 text-center shadow-2xl"
              >
                <span class="text-5xl leading-none">{{ reaction.emoji }}</span>
                <span class="text-xs font-semibold text-white/85">{{ reaction.senderName }}</span>
              </div>
            </div>
          </div>

          <aside
            v-if="activePanel"
            class="fixed inset-x-4 bottom-24 top-20 z-30 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-2xl sm:left-auto sm:right-7 sm:w-[390px]"
          >
            <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 class="text-base font-semibold">{{ activePanelTitle }}</h2>
                <p v-if="activePanel === 'participants'" class="text-xs text-slate-500">
                  {{ participantCount }} in call
                </p>
              </div>
              <button
                type="button"
                class="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                title="Close panel"
                aria-label="Close panel"
                @click="activePanel = null"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            <div v-if="activePanel === 'chat'" class="flex min-h-0 flex-1 flex-col">
              <div class="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
                <div v-if="meetingMessages.length === 0" class="pt-8 text-center text-sm text-slate-500">
                  No messages yet
                </div>
                <div
                  v-for="message in meetingMessages"
                  :key="message.id"
                  class="flex"
                  :class="message.isLocal ? 'justify-end' : 'justify-start'"
                >
                  <div
                    class="max-w-[82%] rounded-2xl px-4 py-3 text-sm"
                    :class="message.isLocal ? 'bg-[#016f56] text-white' : 'bg-slate-100 text-slate-900'"
                  >
                    <div class="mb-1 flex items-center gap-2 text-[11px] font-semibold opacity-80">
                      <span>{{ message.isLocal ? 'You' : message.senderName }}</span>
                      <span>{{ formatMessageTime(message.timestamp) }}</span>
                    </div>
                    <p class="whitespace-pre-wrap leading-relaxed">{{ message.text }}</p>
                  </div>
                </div>
              </div>

              <form class="border-t border-slate-200 p-4" @submit.prevent="sendChatMessage">
                <div class="flex items-end gap-2 rounded-2xl bg-slate-100 p-2">
                  <textarea
                    v-model="chatDraft"
                    rows="2"
                    class="min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500"
                    placeholder="Write a message..."
                    @keydown.enter.exact.prevent="sendChatMessage"
                  />
                  <Button
                    type="submit"
                    class="h-10 w-10 rounded-full bg-[#016f56] p-0 text-white hover:bg-[#005944]"
                    :disabled="!isJoined || !chatDraft.trim()"
                    title="Send message"
                    aria-label="Send message"
                  >
                    <Send class="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>

            <div v-else class="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
              <div class="flex items-center gap-3 rounded-2xl bg-slate-100 p-3">
                <div class="grid h-11 w-11 place-items-center rounded-full bg-[#016f56] text-sm font-semibold text-white">
                  {{ localParticipantName.slice(0, 2).toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold">{{ localParticipantName }}</p>
                  <p class="text-xs text-slate-500">
                    {{ micEnabled ? 'Microphone on' : 'Microphone muted' }}
                  </p>
                </div>
                <span
                  v-if="localHandRaised"
                  class="rounded-full bg-[#dd63c4]/15 px-2 py-1 text-xs font-semibold text-[#9c2d83]"
                >
                  Hand raised
                </span>
              </div>

              <div
                v-for="user in remoteUsers"
                :key="`participant-${user.uid}`"
                class="flex items-center gap-3 rounded-2xl border border-slate-200 p-3"
              >
                <div class="grid h-11 w-11 place-items-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                  P
                </div>
                <div>
                  <p class="text-sm font-semibold">Participant {{ user.uid }}</p>
                  <p class="text-xs text-slate-500">Connected</p>
                </div>
              </div>

              <div v-if="isJoined && remoteUsers.length === 0" class="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Waiting for the other participant to join.
              </div>
            </div>
          </aside>
        </section>

        <div class="fixed bottom-4 left-2 right-2 z-40 flex items-center gap-2 overflow-x-auto rounded-full bg-[#202124]/95 p-2 shadow-2xl backdrop-blur sm:bottom-5 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:overflow-visible">
          <div
            v-if="showMore"
            class="absolute bottom-16 left-0 w-56 rounded-2xl bg-white p-2 text-sm text-slate-900 shadow-2xl"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-medium hover:bg-slate-100"
              @click="router.push('/app/sessions')"
            >
              Back to sessions
              <ChevronUp class="h-4 w-4 rotate-[-90deg]" />
            </button>
            <div class="px-3 py-2 text-xs text-slate-500">
              {{ scheduledTimeRange || roomStatus }}
            </div>
          </div>

          <Button
            type="button"
            class="h-11 w-11 shrink-0 rounded-full bg-[#303134] p-0 text-white hover:bg-[#3c4043] sm:h-12 sm:w-12"
            title="More options"
            aria-label="More options"
            @click="showMore = !showMore; showReactions = false"
          >
            <MoreVertical class="h-5 w-5" />
          </Button>

          <Button
            type="button"
            :class="[
              'h-11 w-11 shrink-0 rounded-full p-0 text-white sm:h-12 sm:w-12',
              micEnabled ? 'bg-[#3c4043] hover:bg-[#4a4d50]' : 'bg-red-600 hover:bg-red-700',
            ]"
            :disabled="!isJoined"
            :title="micEnabled ? 'Turn microphone off' : 'Turn microphone on'"
            :aria-label="micEnabled ? 'Turn microphone off' : 'Turn microphone on'"
            @click="toggleMic"
          >
            <Mic v-if="micEnabled" class="h-5 w-5" />
            <MicOff v-else class="h-5 w-5" />
          </Button>

          <Button
            type="button"
            :class="[
              'h-11 w-11 shrink-0 rounded-full p-0 text-white sm:h-12 sm:w-12',
              cameraEnabled ? 'bg-[#3c4043] hover:bg-[#4a4d50]' : 'bg-red-600 hover:bg-red-700',
            ]"
            :disabled="!isJoined"
            :title="cameraEnabled ? 'Turn camera off' : 'Turn camera on'"
            :aria-label="cameraEnabled ? 'Turn camera off' : 'Turn camera on'"
            @click="toggleCamera"
          >
            <Video v-if="cameraEnabled" class="h-5 w-5" />
            <VideoOff v-else class="h-5 w-5" />
          </Button>

          <Button
            type="button"
            :class="[
              'h-11 w-11 shrink-0 rounded-full p-0 text-white sm:h-12 sm:w-auto sm:px-4',
              screenSharing ? 'bg-[#016f56] hover:bg-[#005944]' : 'bg-[#3c4043] hover:bg-[#4a4d50]',
            ]"
            :disabled="!isJoined"
            title="Present now"
            aria-label="Present now"
            @click="screenSharing ? stopScreenShare() : startScreenShare()"
          >
            <MonitorUp class="h-5 w-5" />
            <span class="ml-2 hidden text-sm font-semibold lg:inline">Present now</span>
          </Button>

          <div class="relative">
            <div
              v-if="showReactions"
              class="absolute bottom-16 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-white p-2 shadow-2xl"
            >
              <button
                v-for="emoji in reactionOptions"
                :key="emoji"
                type="button"
                class="grid h-10 w-10 place-items-center rounded-full text-xl transition hover:bg-slate-100"
                title="Send reaction"
                aria-label="Send reaction"
                @click="sendReaction(emoji)"
              >
                {{ emoji }}
              </button>
            </div>
            <Button
              type="button"
              class="h-12 w-12 rounded-full bg-[#3c4043] p-0 text-white hover:bg-[#4a4d50]"
              :disabled="!isJoined"
              title="Send reaction"
              aria-label="Send reaction"
              @click="showReactions = !showReactions; showMore = false"
            >
              <Smile class="h-5 w-5" />
            </Button>
          </div>

          <Button
            type="button"
            :class="[
              'h-11 w-11 shrink-0 rounded-full p-0 text-white sm:h-12 sm:w-12',
              localHandRaised ? 'bg-[#dd63c4] hover:bg-[#c94daf]' : 'bg-[#3c4043] hover:bg-[#4a4d50]',
            ]"
            :disabled="!isJoined"
            :title="localHandRaised ? 'Lower hand' : 'Raise hand'"
            :aria-label="localHandRaised ? 'Lower hand' : 'Raise hand'"
            @click="toggleHand"
          >
            <Hand class="h-5 w-5" />
          </Button>

          <Button
            type="button"
            class="hidden h-12 w-12 shrink-0 rounded-full bg-[#3c4043] p-0 text-white hover:bg-[#4a4d50] md:inline-flex"
            disabled
            title="Captions unavailable"
            aria-label="Captions unavailable"
          >
            <Captions class="h-5 w-5" />
          </Button>

          <Button
            type="button"
            class="h-11 w-14 shrink-0 rounded-full bg-red-600 p-0 text-white hover:bg-red-700 sm:h-12 sm:w-auto sm:px-6"
            title="Leave call"
            aria-label="Leave call"
            @click="leaveRoom(true)"
          >
            <PhoneOff class="h-5 w-5" />
          </Button>
        </div>

        <div class="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-[#202124]/95 p-2 shadow-2xl backdrop-blur sm:bottom-5 sm:right-7">
          <Button
            type="button"
            :class="[
              'h-12 w-12 rounded-full p-0 text-white',
              activePanel === 'chat' ? 'bg-[#016f56] hover:bg-[#005944]' : 'bg-[#3c4043] hover:bg-[#4a4d50]',
            ]"
            title="Meeting chat"
            aria-label="Meeting chat"
            @click="togglePanel('chat')"
          >
            <MessageSquare class="h-5 w-5" />
          </Button>
          <Button
            type="button"
            :class="[
              'h-12 w-12 rounded-full p-0 text-white',
              activePanel === 'participants' ? 'bg-[#016f56] hover:bg-[#005944]' : 'bg-[#3c4043] hover:bg-[#4a4d50]',
            ]"
            title="Participants"
            aria-label="Participants"
            @click="togglePanel('participants')"
          >
            <PanelRightClose class="h-5 w-5" />
          </Button>
        </div>
      </div>
    </main>

    <template #fallback>
      <main class="flex min-h-screen items-center justify-center bg-[#111214]">
        <Loader2 class="h-8 w-8 animate-spin text-[#dd63c4]" />
      </main>
    </template>
  </ClientOnly>
</template>

<style scoped>
@keyframes meeting-reaction-float {
  0% {
    opacity: 0;
    transform: translate(-50%, 20px) scale(0.85);
  }

  12% {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }

  78% {
    opacity: 1;
    transform: translate(-50%, -90px) scale(1.08);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -130px) scale(1.12);
  }
}
</style>
