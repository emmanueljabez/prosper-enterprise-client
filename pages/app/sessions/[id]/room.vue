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
  DoorOpen,
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
  Plus,
  Send,
  Smile,
  Sparkles,
  Shuffle,
  Undo2,
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

type MeetingPanel = 'chat' | 'participants' | 'breakouts' | null
type CurrentRoomKind = 'main' | 'breakout'

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

type BreakoutParticipant = {
  profileId: string
  roomId?: string | null
  roomName?: string | null
  name: string
  avatarUrl?: string | null
  status?: 'ASSIGNED' | 'JOINED' | 'LEFT' | 'RETURNED' | null
}

type BreakoutRoom = {
  id: string
  sessionId: string
  name: string
  agoraChannelName: string
  status: 'DRAFT' | 'OPEN' | 'CLOSED'
  participants: BreakoutParticipant[]
}

type BreakoutStateResponse = {
  host: boolean
  rooms: BreakoutRoom[]
  availableParticipants: BreakoutParticipant[]
  assignedRoom?: BreakoutRoom | null
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
const breakoutState = ref<BreakoutStateResponse | null>(null)
const currentRoomKind = ref<CurrentRoomKind>('main')
const currentBreakoutRoom = ref<BreakoutRoom | null>(null)
const breakoutRoomCount = ref(2)
const dismissedBreakoutRoomId = ref<string | null>(null)
const isBreakoutBusy = ref(false)
const breakoutAvailable = ref(true)

let AgoraRTC: any = null
let client: any = null
let localAudioTrack: any = null
let localVideoTrack: any = null
let screenVideoTrack: any = null
let clockTimer: ReturnType<typeof setInterval> | null = null
let breakoutPollTimer: ReturnType<typeof setInterval> | null = null
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

const activePanelTitle = computed(() => {
  if (activePanel.value === 'chat') return 'Meeting chat'
  if (activePanel.value === 'breakouts') return 'Breakout rooms'
  return 'Participants'
})

const isBreakoutHost = computed(() => Boolean(breakoutState.value?.host))

const currentRoomLabel = computed(() => {
  if (currentRoomKind.value === 'breakout') {
    return currentBreakoutRoom.value?.name || 'Breakout room'
  }
  return 'Main room'
})

const assignedBreakoutRoom = computed(() => {
  const room = breakoutState.value?.assignedRoom
  if (!room || room.status !== 'OPEN') return null
  if (currentRoomKind.value !== 'main') return null
  if (dismissedBreakoutRoomId.value === room.id) return null
  return room
})

const activeBreakoutRooms = computed(() => {
  return (breakoutState.value?.rooms || []).filter((room) => room.status !== 'CLOSED')
})

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

const fetchCurrentAgoraToken = async () => {
  if (currentRoomKind.value === 'breakout' && currentBreakoutRoom.value) {
    const token = await sessionsStore.createBreakoutRoomToken(sessionId.value, currentBreakoutRoom.value.id)
    tokenPayload.value = token
    return token
  }
  return fetchAgoraToken()
}

const loadAgoraSdk = async () => {
  if (!AgoraRTC) {
    AgoraRTC = await import('agora-rtc-sdk-ng')
  }
  return AgoraRTC
}

const AGORA_OPERATION_TIMEOUT_MS = 12000

const withAgoraTimeout = async <T>(operation: () => Promise<T>, label: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out. Please try again.`))
    }, AGORA_OPERATION_TIMEOUT_MS)
  })

  try {
    return await Promise.race([operation(), timeout])
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
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

const resetRoomMessages = () => {
  meetingMessages.value = []
  seenMeetingEventIds.clear()
}

const attachAgoraClientHandlers = () => {
  if (!client) return

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
    const renewedTokenPayload = await fetchCurrentAgoraToken()
    await client?.renewToken(renewedTokenPayload.token)
  })

  client.on('token-privilege-did-expire', async () => {
    const renewedTokenPayload = await fetchCurrentAgoraToken()
    await client?.renewToken(renewedTokenPayload.token)
  })
}

const ensureLocalMediaTracks = async (agora: any) => {
  if (localAudioTrack && localVideoTrack) return
  const [microphoneTrack, cameraTrack] = await agora.createMicrophoneAndCameraTracks()
  localAudioTrack = microphoneTrack
  localVideoTrack = cameraTrack
  await localAudioTrack.setEnabled(micEnabled.value)
  await localVideoTrack.setEnabled(cameraEnabled.value)
}

const joinAgoraChannel = async (payload: AgoraTokenPayload, room: BreakoutRoom | null = null) => {
  const sdk = await loadAgoraSdk()
  const agora = sdk.default || sdk
  client = agora.createClient({ mode: 'rtc', codec: 'vp8' })
  attachAgoraClientHandlers()

  await withAgoraTimeout(() => client.join(payload.appId, payload.channelName, payload.token, payload.uid), 'Joining the Agora room')

  await ensureLocalMediaTracks(agora)
  await playLocalVideoTrack()
  await withAgoraTimeout(() => client.publish([localAudioTrack, localVideoTrack]), 'Publishing local media')

  tokenPayload.value = payload
  currentRoomKind.value = room ? 'breakout' : 'main'
  currentBreakoutRoom.value = room
  remoteUsers.value = client.remoteUsers.slice()
  isJoined.value = true
  resetRoomMessages()
}

const switchAgoraChannel = async (payload: AgoraTokenPayload, room: BreakoutRoom | null = null) => {
  if (screenSharing.value) {
    await stopScreenShare()
  }

  try {
    if (client) {
      const tracksToUnpublish = [localAudioTrack, localVideoTrack].filter(Boolean)
      if (tracksToUnpublish.length) {
        await withAgoraTimeout(() => client.unpublish(tracksToUnpublish), 'Leaving the current room')
      }
      await withAgoraTimeout(() => client.leave(), 'Leaving the current room')
      client = null
    }
  } catch (error) {
    console.warn('Agora room cleanup did not finish before switching rooms:', error)
    client = null
  } finally {
    isJoined.value = false
    remoteUsers.value = []
  }

  await joinAgoraChannel(payload, room)
}

const joinRoom = async () => {
  isJoining.value = true
  roomError.value = ''

  try {
    if (client) {
      await leaveRoom(false)
    }

    const tokenPayload = await fetchAgoraToken()
    await joinAgoraChannel(tokenPayload)
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
    await pollBreakoutState()
    if (breakoutAvailable.value) {
      startBreakoutPolling()
    }
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
      await withAgoraTimeout(() => client.unpublish(localVideoTrack), 'Starting screen share')
    }

    await withAgoraTimeout(() => client.publish(screenVideoTrack), 'Starting screen share')
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
    await withAgoraTimeout(() => client.unpublish(screenVideoTrack), 'Stopping screen share')
    screenVideoTrack.close()
    screenVideoTrack = null

    if (localVideoTrack) {
      await withAgoraTimeout(() => client.publish(localVideoTrack), 'Restoring camera')
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

const pollBreakoutState = async () => {
  if (!sessionId.value || !isJoined.value || !breakoutAvailable.value) return

  try {
    const state = await sessionsStore.getBreakoutState(sessionId.value)
    breakoutState.value = state

    if (currentRoomKind.value === 'breakout' && currentBreakoutRoom.value) {
      const activeRoom = state.rooms.find((room: BreakoutRoom) => room.id === currentBreakoutRoom.value?.id)
      if (!activeRoom || activeRoom.status === 'CLOSED') {
        await returnToMainSessionRoom(true)
      }
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || ''
    if (error?.response?.status === 400 && String(message).includes('Breakout rooms')) {
      breakoutAvailable.value = false
      breakoutState.value = null
      if (activePanel.value === 'breakouts') {
        activePanel.value = null
      }
      if (breakoutPollTimer) {
        clearInterval(breakoutPollTimer)
        breakoutPollTimer = null
      }
      return
    }

    console.error('Error polling breakout rooms:', error)
  }
}

const startBreakoutPolling = () => {
  if (breakoutPollTimer) {
    clearInterval(breakoutPollTimer)
  }
  breakoutPollTimer = setInterval(() => {
    void pollBreakoutState()
  }, 5000)
}

const createBreakoutRooms = async () => {
  isBreakoutBusy.value = true
  try {
    breakoutState.value = await sessionsStore.createBreakoutRooms(sessionId.value, {
      count: breakoutRoomCount.value,
    })
    toast.success('Breakout rooms created')
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Unable to create breakout rooms.')
  } finally {
    isBreakoutBusy.value = false
  }
}

const autoAssignBreakoutRooms = async () => {
  isBreakoutBusy.value = true
  try {
    breakoutState.value = await sessionsStore.autoAssignBreakoutRooms(sessionId.value)
    toast.success('Participants assigned')
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Unable to assign breakout rooms.')
  } finally {
    isBreakoutBusy.value = false
  }
}

const openBreakoutRooms = async () => {
  isBreakoutBusy.value = true
  try {
    breakoutState.value = await sessionsStore.openBreakoutRooms(sessionId.value)
    toast.success('Breakout rooms opened')
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Unable to open breakout rooms.')
  } finally {
    isBreakoutBusy.value = false
  }
}

const closeBreakoutRooms = async () => {
  isBreakoutBusy.value = true
  try {
    breakoutState.value = await sessionsStore.closeBreakoutRooms(sessionId.value)
    if (currentRoomKind.value === 'breakout') {
      await returnToMainSessionRoom(true)
    }
    toast.success('Breakout rooms closed')
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Unable to close breakout rooms.')
  } finally {
    isBreakoutBusy.value = false
  }
}

const handleMoveBreakoutParticipant = async (participant: BreakoutParticipant, event: Event) => {
  const roomId = (event.target as HTMLSelectElement).value
  if (!roomId) return

  isBreakoutBusy.value = true
  try {
    breakoutState.value = await sessionsStore.moveBreakoutParticipant(sessionId.value, participant.profileId, roomId)
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Unable to move participant.')
  } finally {
    isBreakoutBusy.value = false
  }
}

const dismissBreakoutPrompt = () => {
  dismissedBreakoutRoomId.value = assignedBreakoutRoom.value?.id || null
}

const joinBreakoutRoom = async (room: BreakoutRoom) => {
  isBreakoutBusy.value = true
  try {
    const token = await sessionsStore.createBreakoutRoomToken(sessionId.value, room.id)
    await switchAgoraChannel(token, room)
    breakoutState.value = await sessionsStore.markBreakoutRoomJoined(sessionId.value, room.id)
    dismissedBreakoutRoomId.value = null
    toast.success(`Joined ${room.name}`)
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Unable to join breakout room.')
  } finally {
    isBreakoutBusy.value = false
  }
}

const returnToMainSessionRoom = async (silent = false) => {
  isBreakoutBusy.value = true
  try {
    const token = await sessionsStore.createAgoraToken(sessionId.value)
    await switchAgoraChannel(token)
    breakoutState.value = await sessionsStore.returnToMainRoom(sessionId.value)
    if (!silent) {
      toast.success('Returned to main room')
    }
  } catch (error: any) {
    if (!silent) {
      toast.error(error?.response?.data?.message || 'Unable to return to the main room.')
    }
  } finally {
    isBreakoutBusy.value = false
  }
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
      await withAgoraTimeout(() => client.leave(), 'Leaving the Agora room')
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

  if (breakoutPollTimer) {
    clearInterval(breakoutPollTimer)
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

              <div class="absolute left-5 top-5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                {{ currentRoomLabel }}
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

          <aside v-if="activePanel" class="fixed inset-x-4 bottom-24 top-20 z-50 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-2xl sm:left-auto sm:right-7 sm:w-[390px]">
            <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 class="text-base font-semibold">{{ activePanelTitle }}</h2>
                <p v-if="activePanel === 'participants'" class="text-xs text-slate-500">
                  {{ participantCount }} in call
                </p>
                <p v-else-if="activePanel === 'breakouts'" class="text-xs text-slate-500">
                  Host-managed room assignments
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

            <div v-else-if="activePanel === 'participants'" class="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
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

            <div v-else class="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div v-if="!isBreakoutHost" class="rounded-2xl border border-dashed border-slate-300 p-4 text-sm leading-relaxed text-slate-500">
                Breakout rooms will appear when the session host opens them.
              </div>

              <template v-else>
                <div class="rounded-2xl bg-slate-100 p-4">
                  <label class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500" for="breakout-room-count">
                    Rooms
                  </label>
                  <div class="mt-3 flex items-center gap-2">
                    <input
                      id="breakout-room-count"
                      v-model.number="breakoutRoomCount"
                      type="number"
                      min="1"
                      max="12"
                      class="h-10 w-20 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#016f56]"
                    >
                    <Button
                      type="button"
                      class="h-10 flex-1 rounded-xl bg-[#016f56] text-sm font-semibold text-white hover:bg-[#005944]"
                      :disabled="isBreakoutBusy"
                      @click="createBreakoutRooms"
                    >
                      <Plus class="mr-2 h-4 w-4" />
                      Create rooms
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    class="mt-3 h-10 w-full rounded-xl border-[#016f56]/40 text-sm font-semibold text-[#016f56] hover:bg-[#016f56]/10"
                    :disabled="isBreakoutBusy || activeBreakoutRooms.length === 0"
                    @click="autoAssignBreakoutRooms"
                  >
                    <Shuffle class="mr-2 h-4 w-4" />
                    Auto assign participants
                  </Button>
                </div>

                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-slate-950">Rooms</h3>
                    <span class="text-xs text-slate-500">{{ activeBreakoutRooms.length }} active</span>
                  </div>

                  <div
                    v-if="!breakoutState?.rooms?.length"
                    class="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500"
                  >
                    Create rooms to start assigning participants.
                  </div>

                  <div
                    v-for="room in breakoutState?.rooms || []"
                    :key="room.id"
                    class="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <h4 class="text-sm font-semibold text-slate-950">{{ room.name }}</h4>
                        <p class="text-xs text-slate-500">{{ room.participants.length }} assigned</p>
                      </div>
                      <span
                        class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        :class="room.status === 'OPEN' ? 'bg-[#016f56]/10 text-[#016f56]' : room.status === 'CLOSED' ? 'bg-slate-100 text-slate-500' : 'bg-[#dd63c4]/10 text-[#9c2d83]'"
                      >
                        {{ room.status.toLowerCase() }}
                      </span>
                    </div>

                    <div class="mt-3 space-y-2">
                      <div
                        v-for="participant in room.participants"
                        :key="`${room.id}-${participant.profileId}`"
                        class="flex items-center gap-2 text-xs text-slate-600"
                      >
                        <img
                          v-if="participant.avatarUrl"
                          :src="participant.avatarUrl"
                          :alt="participant.name"
                          class="h-6 w-6 rounded-full object-cover"
                        >
                        <span v-else class="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-[10px] font-semibold">
                          {{ participant.name.slice(0, 2).toUpperCase() }}
                        </span>
                        <span class="min-w-0 flex-1 truncate">{{ participant.name }}</span>
                        <span class="text-[11px] text-slate-400">{{ participant.status?.toLowerCase() }}</span>
                      </div>

                      <p v-if="room.participants.length === 0" class="text-xs text-slate-400">
                        No participants assigned yet.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="space-y-3">
                  <h3 class="text-sm font-semibold text-slate-950">Participants</h3>
                  <div
                    v-for="participant in breakoutState?.availableParticipants || []"
                    :key="participant.profileId"
                    class="flex items-center gap-3 rounded-2xl border border-slate-200 p-3"
                  >
                    <img
                      v-if="participant.avatarUrl"
                      :src="participant.avatarUrl"
                      :alt="participant.name"
                      class="h-9 w-9 rounded-full object-cover"
                    >
                    <span v-else class="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {{ participant.name.slice(0, 2).toUpperCase() }}
                    </span>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-semibold text-slate-950">{{ participant.name }}</p>
                      <p class="truncate text-xs text-slate-500">{{ participant.roomName || 'Unassigned' }}</p>
                    </div>
                    <select
                      class="h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#016f56]"
                      :value="participant.roomId || ''"
                      :disabled="isBreakoutBusy || activeBreakoutRooms.length === 0"
                      @change="handleMoveBreakoutParticipant(participant, $event)"
                    >
                      <option value="">Room</option>
                      <option
                        v-for="room in activeBreakoutRooms"
                        :key="`move-${room.id}`"
                        :value="room.id"
                      >
                        {{ room.name }}
                      </option>
                    </select>
                  </div>

                  <div
                    v-if="breakoutState?.availableParticipants?.length === 0"
                    class="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500"
                  >
                    No eligible participants were found for this group session.
                  </div>
                </div>

                <div class="sticky bottom-0 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white pt-4">
                  <Button
                    type="button"
                    class="h-10 rounded-xl bg-[#016f56] text-sm font-semibold text-white hover:bg-[#005944]"
                    :disabled="isBreakoutBusy || activeBreakoutRooms.length === 0"
                    @click="openBreakoutRooms"
                  >
                    <DoorOpen class="mr-2 h-4 w-4" />
                    Open rooms
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    class="h-10 rounded-xl border-[#dd63c4]/50 text-sm font-semibold text-[#9c2d83] hover:bg-[#dd63c4]/10"
                    :disabled="isBreakoutBusy || activeBreakoutRooms.length === 0"
                    @click="closeBreakoutRooms"
                  >
                    <Undo2 class="mr-2 h-4 w-4" />
                    Close rooms
                  </Button>
                </div>
              </template>
            </div>
          </aside>
        </section>

        <div
          v-if="assignedBreakoutRoom"
          class="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-xl rounded-3xl border border-white/15 bg-[#202124]/95 p-4 text-white shadow-2xl backdrop-blur sm:bottom-28"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#dd63c4]">Breakout assignment</p>
              <h2 class="mt-1 text-xl font-semibold">{{ assignedBreakoutRoom.name }}</h2>
              <p class="mt-1 text-sm text-white/70">The host has opened this room for your group.</p>
            </div>
            <div class="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                class="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
                :disabled="isBreakoutBusy"
                @click="dismissBreakoutPrompt"
              >
                Stay here
              </Button>
              <Button
                type="button"
                class="rounded-full bg-[#dd63c4] px-5 font-semibold text-white hover:bg-[#c94daf]"
                :disabled="isBreakoutBusy"
                @click="joinBreakoutRoom(assignedBreakoutRoom)"
              >
                Join breakout room
              </Button>
            </div>
          </div>
        </div>

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
            <button
              v-if="currentRoomKind === 'breakout'"
              type="button"
              class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-medium hover:bg-slate-100"
              @click="returnToMainSessionRoom()"
            >
              Return to main room
              <Undo2 class="h-4 w-4" />
            </button>
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
          <Button
            v-if="breakoutAvailable"
            type="button"
            :class="[
              'h-12 w-12 rounded-full p-0 text-white',
              activePanel === 'breakouts' ? 'bg-[#dd63c4] hover:bg-[#c94daf]' : 'bg-[#3c4043] hover:bg-[#4a4d50]',
            ]"
            title="Breakout rooms"
            aria-label="Breakout rooms"
            @click="togglePanel('breakouts')"
          >
            <DoorOpen class="h-5 w-5" />
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
