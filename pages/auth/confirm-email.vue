<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { navigateTo, useRoute } from '#app'
import { Button } from '@/components/ui/button'
import PublicSiteHeader from '@/components/landing/PublicSiteHeader.vue'
import api from '@/http/axios'

definePageMeta({ auth: false })

const route = useRoute()
const status = ref<'pending' | 'success' | 'error'>('pending')
const errorMessage = ref('')
const FREE_TRIAL_INTENT_KEY = 'prosper:free-trial-intent'

const verifyUrl = computed(() => {
  const value = route.query.verify_url
  return typeof value === 'string' ? value : ''
})

const tokenHash = computed(() => {
  const directTokenHash = route.query.token_hash
  if (typeof directTokenHash === 'string' && directTokenHash.trim()) {
    return directTokenHash.trim()
  }

  if (!verifyUrl.value) {
    return ''
  }

  try {
    const url = new URL(verifyUrl.value)
    return url.searchParams.get('token_hash')
      || url.searchParams.get('token')
      || ''
  } catch {
    return ''
  }
})

const verificationType = computed(() => {
  const directType = route.query.type
  if (typeof directType === 'string' && directType.trim()) {
    return directType.trim()
  }

  if (!verifyUrl.value) {
    return 'signup'
  }

  try {
    const url = new URL(verifyUrl.value)
    return url.searchParams.get('type') || 'signup'
  } catch {
    return 'signup'
  }
})

const canConfirm = computed(() => Boolean(tokenHash.value))

const hasFreeTrialIntent = () => {
  if (
    String(route.query.product || '').trim().toUpperCase() === 'FREE_TRIAL'
    || String(route.query.trial || '').trim() === '1'
  ) {
    return true
  }

  if (typeof window === 'undefined') {
    return false
  }

  try {
    const raw = localStorage.getItem(FREE_TRIAL_INTENT_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return parsed?.product === 'FREE_TRIAL' || parsed?.trial === true
  } catch {
    return false
  }
}

const isFreeTrialFlow = computed(() => hasFreeTrialIntent())
const statusTitle = computed(() => {
  if (status.value === 'success') {
    return 'Email verified'
  }

  if (status.value === 'error') {
    return 'Verification failed'
  }

  return 'Verifying your email'
})
const statusDescription = computed(() => {
  if (status.value === 'success') {
    return isFreeTrialFlow.value
      ? 'Your free trial account has been confirmed. Redirecting you to sign in and book your trial session.'
      : 'Your company account has been confirmed. Redirecting you to sign in.'
  }

  if (status.value === 'error') {
    return isFreeTrialFlow.value
      ? 'We could not confirm your free trial account from this link.'
      : 'We could not confirm your company account from this link.'
  }

  return isFreeTrialFlow.value
    ? 'We are securely confirming your free trial account inside Prosper Mentor.'
    : 'We are securely confirming your company account inside Prosper Mentor Enterprise.'
})
const restartSignupLink = computed(() => ({
  path: '/auth/signup',
  query: isFreeTrialFlow.value
    ? { audience: 'mentee', trial: '1', product: 'FREE_TRIAL' }
    : {},
}))

const confirmEmail = async () => {
  if (!canConfirm.value) {
    status.value = 'error'
    errorMessage.value = 'This email verification link is invalid or incomplete.'
    return
  }

  try {
    await api.post('/v1/public/auth/confirm-email', {
      tokenHash: tokenHash.value,
      type: verificationType.value || 'signup',
    })
    status.value = 'success'
    setTimeout(() => {
      const query = isFreeTrialFlow.value
        ? { email_verified: '1', audience: 'mentee', trial: '1', product: 'FREE_TRIAL' }
        : { email_verified: '1' }
      navigateTo({
        path: '/auth/login',
        query,
      })
    }, 1200)
  } catch (error: any) {
    status.value = 'error'
    errorMessage.value = error?.response?.data?.message
      || 'Email verification link is invalid or has expired.'
  }
}

onMounted(() => {
  confirmEmail()
})
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

    <main class="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8 sm:px-6">
      <section class="w-full max-w-[460px] rounded-[28px] border border-white/30 bg-white/95 p-5 shadow-2xl sm:p-6">
        <div class="grid gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full"
            :class="status === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-[#027F63]'"
          >
            <svg v-if="status === 'pending'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" d="M12 3a9 9 0 1 1-8.49 6" />
            </svg>
            <svg v-else-if="status === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v5m0 3h.01" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.3 4.3 2.8 17.2A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.8L13.7 4.3a2 2 0 0 0-3.4 0Z" />
            </svg>
          </div>

          <p class="text-[24px] font-semibold leading-tight text-[#1f2937]">
            {{ statusTitle }}
          </p>
          <p class="text-[13px] leading-6 text-[#4b5563]">
            {{ statusDescription }}
          </p>
        </div>

        <div v-if="status === 'pending'" class="mt-5 rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] p-4 text-[13px] text-[#4b5563]">
          Please wait while we verify your email.
        </div>

        <div v-else-if="status === 'success'" class="mt-5 grid gap-3 rounded-[16px] border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-800">
          Email verified successfully.
        </div>

        <div v-else class="mt-5 grid gap-3">
          <div class="rounded-[16px] border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
            {{ errorMessage }}
          </div>
          <Button as-child class="h-10 rounded-full bg-[#027F63] text-sm font-medium text-white hover:bg-[#046f58]">
            <NuxtLink :to="restartSignupLink">Restart signup</NuxtLink>
          </Button>
        </div>
      </section>
    </main>
  </div>
</template>
