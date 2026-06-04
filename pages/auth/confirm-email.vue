<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { navigateTo, useRoute } from '#app'
import { Button } from '@/components/ui/button'
import AuthSplitShell from '@/components/auth/AuthSplitShell.vue'
import api from '@/http/axios'

definePageMeta({ auth: false })

const route = useRoute()
const status = ref<'pending' | 'success' | 'error'>('pending')
const errorMessage = ref('')

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
      navigateTo({
        path: '/auth/login',
        query: { email_verified: '1' },
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
  <AuthSplitShell>
    <div class="grid gap-3">
      <p class="text-xl font-semibold">
        {{ status === 'success' ? 'Email verified' : status === 'error' ? 'Verification failed' : 'Verifying your email' }}
      </p>
      <p class="text-sm text-muted-foreground">
        <span v-if="status === 'success'">
          Your company account has been confirmed. Redirecting you to sign in.
        </span>
        <span v-else-if="status === 'error'">
          We could not confirm your company account from this link.
        </span>
        <span v-else>
          We are securely confirming your company account inside Prosper Mentor Enterprise.
        </span>
      </p>
    </div>

    <div v-if="status === 'pending'" class="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
      Please wait while we verify your email.
    </div>

    <div v-else-if="status === 'success'" class="grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
      Email verified successfully.
    </div>

    <div v-else class="grid gap-3">
      <div class="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {{ errorMessage }}
      </div>
      <Button as-child>
        <NuxtLink to="/auth/signup">Restart signup</NuxtLink>
      </Button>
    </div>
  </AuthSplitShell>
</template>
