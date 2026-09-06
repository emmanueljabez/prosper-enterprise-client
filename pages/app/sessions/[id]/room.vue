<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionsStore } from '@/store/modules/sessions/sessions'
import { useAppToast } from '@/composables/services/toastService'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Loader2,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  RefreshCw,
  ShieldCheck,
  Users,
  Video,
  VideoOff,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Session Room',
  description: 'Join your Prosper Mentor session',
  layout: 'default',
})

type AgoraTokenPayload = {
  appId: string
  channelName: string
  uid: string
  token: string
  expiresAt: string
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

let AgoraRTC: any = null
let client: any = null
let localAudioTrack: any = null
let localVideoTrack: any = null
let screenVideoTrack: any = null

const participantName = computed(() => {
  return session.value?.mentorName || session.value?.menteeName || 'Session participant'
})

const roomTitle = computed(() => session.value?.title || 'Mentorship Session')

const roomStatus = computed(() => {
  if (roomError.value) return 'Needs attention'
  if (isJoined.value) return 'Live room'
  if (isJoining.value) return 'Joining'
  return 'Preparing'
})

const formatTime = (value?: string) => {
  if (!value) return ''
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const unwrapApiData = (response: any) => response?.data || response

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
        await nextTick()
        user.videoTrack?.play(`remote-player-${user.uid}`)
      }

      if (mediaType === 'audio') {
        user.audioTrack?.play()
      }
    })

    client.on('user-unpublished', () => {
      remoteUsers.value = client.remoteUsers.slice()
    })

    client.on('user-left', () => {
      remoteUsers.value = client.remoteUsers.slice()
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

    await nextTick()
    localVideoTrack.play(localPlayer.value)
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
    const screenTrackResult = await agora.createScreenVideoTrack({ encoderConfig: '1080p_1' }, 'auto')
    screenVideoTrack = Array.isArray(screenTrackResult) ? screenTrackResult[0] : screenTrackResult

    if (localVideoTrack) {
      await client.unpublish(localVideoTrack)
    }

    await client.publish(screenVideoTrack)
    await nextTick()
    screenVideoTrack.play(localPlayer.value)
    screenSharing.value = true
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
      await nextTick()
      localVideoTrack.play(localPlayer.value)
    }
  } catch (error) {
    console.error('Error stopping screen share:', error)
  } finally {
    screenSharing.value = false
  }
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
    if (redirect) {
      await router.push('/app/sessions')
    }
  }
}

onMounted(() => {
  void loadSessionAndJoin()
})

onBeforeUnmount(() => {
  void leaveRoom(false)
})
</script>

<template>
  <ClientOnly>
    <main class="min-h-[calc(100vh-5rem)] bg-slate-950 text-white">
      <div class="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <Button
              variant="ghost"
              class="border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              @click="router.push('/app/sessions')"
            >
              <ArrowLeft class="mr-2 h-4 w-4" />
              Sessions
            </Button>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="text-xl font-semibold tracking-normal sm:text-2xl">{{ roomTitle }}</h1>
                <Badge class="border-[#016f56] bg-[#016f56] text-white">{{ roomStatus }}</Badge>
              </div>
              <p class="mt-1 text-sm text-white/65">
                {{ participantName }}
                <span v-if="session?.scheduledStart"> · {{ formatTime(session.scheduledStart) }} - {{ formatTime(session.scheduledEnd) }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 text-sm text-white/70">
            <ShieldCheck class="h-4 w-4 text-[#dd63c4]" />
            <span>Secure Agora session</span>
          </div>
        </div>

        <Alert v-if="roomError" class="border-[#dd63c4]/40 bg-[#dd63c4]/10 text-white">
          <AlertDescription>{{ roomError }}</AlertDescription>
        </Alert>

        <section class="grid min-h-[56vh] gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div class="relative overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl">
            <div
              ref="localPlayer"
              class="h-[58vh] min-h-[320px] w-full bg-gradient-to-br from-[#016f56] via-slate-950 to-[#dd63c4]/50"
            />
            <div v-if="!isJoined && !roomError" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
              <Loader2 class="h-8 w-8 animate-spin text-[#dd63c4]" />
              <p class="text-sm text-white/75">{{ isJoining ? 'Joining room...' : 'Preparing room...' }}</p>
            </div>
            <div class="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium">
              You
            </div>
          </div>

          <aside class="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold uppercase tracking-[0.12em] text-white/70">Participants</h2>
              <div class="flex items-center gap-1 text-sm text-white/70">
                <Users class="h-4 w-4" />
                <span>{{ remoteUsers.length + (isJoined ? 1 : 0) }}</span>
              </div>
            </div>

            <div class="mt-4 space-y-3">
              <div class="rounded-md border border-white/10 bg-white/[0.05] p-3">
                <p class="text-sm font-medium">You</p>
                <p class="text-xs text-white/55">{{ micEnabled ? 'Microphone on' : 'Microphone muted' }}</p>
              </div>

              <div
                v-for="user in remoteUsers"
                :key="user.uid"
                class="overflow-hidden rounded-md border border-white/10 bg-black"
              >
                <div :id="`remote-player-${user.uid}`" class="h-40 w-full bg-slate-900" />
                <div class="p-3">
                  <p class="text-sm font-medium">Participant {{ user.uid }}</p>
                  <p class="text-xs text-white/55">Connected</p>
                </div>
              </div>

              <div v-if="isJoined && remoteUsers.length === 0" class="rounded-md border border-dashed border-white/15 p-4 text-sm text-white/60">
                Waiting for the other participant to join.
              </div>
            </div>
          </aside>
        </section>

        <div class="sticky bottom-4 mx-auto flex w-full max-w-2xl flex-wrap items-center justify-center gap-3 rounded-full border border-white/10 bg-slate-900/95 p-3 shadow-2xl backdrop-blur">
          <Button
            :variant="micEnabled ? 'secondary' : 'destructive'"
            class="rounded-full"
            :disabled="!isJoined"
            @click="toggleMic"
          >
            <Mic v-if="micEnabled" class="h-4 w-4" />
            <MicOff v-else class="h-4 w-4" />
          </Button>
          <Button
            :variant="cameraEnabled ? 'secondary' : 'destructive'"
            class="rounded-full"
            :disabled="!isJoined"
            @click="toggleCamera"
          >
            <Video v-if="cameraEnabled" class="h-4 w-4" />
            <VideoOff v-else class="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            class="rounded-full"
            :disabled="!isJoined"
            @click="screenSharing ? stopScreenShare() : startScreenShare()"
          >
            <MonitorUp class="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            class="rounded-full"
            :disabled="isJoining"
            @click="joinRoom"
          >
            <RefreshCw class="h-4 w-4" />
          </Button>
          <Button
            class="rounded-full bg-red-600 text-white hover:bg-red-700"
            @click="leaveRoom(true)"
          >
            <PhoneOff class="mr-2 h-4 w-4" />
            Leave
          </Button>
        </div>
      </div>
    </main>

    <template #fallback>
      <main class="flex min-h-[50vh] items-center justify-center">
        <Loader2 class="h-8 w-8 animate-spin text-[#dd63c4]" />
      </main>
    </template>
  </ClientOnly>
</template>
