<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

definePageMeta({
  layout: false,
  middleware: []
})

const router = useRouter()
const route = useRoute()
const cancellationMessage = ref('Payment was cancelled by user')

onMounted(async () => {
  const token = (route.query.token as string) || ''
  if (token) {
    try {
      const finalizeRequestBody = { token }
      const finalizeViaFrontendRoute = () => $fetch<{
        decision: string
        message: string
      }>('/payment/cybersource/finalize', {
        method: 'POST',
        body: finalizeRequestBody
      })

      const finalizeViaApiRoute = () => $fetch<{
        decision: string
        message: string
      }>('/api/cybersource/finalize', {
        method: 'POST',
        body: finalizeRequestBody
      })

      let result
      try {
        result = await finalizeViaFrontendRoute()
      } catch (frontendRouteError) {
        console.warn('Finalize via /payment route failed, falling back to /api route', frontendRouteError)
        result = await finalizeViaApiRoute()
      }

      if (result?.message) {
        cancellationMessage.value = result.message
      }
    } catch (error) {
      console.error('Failed to finalize cancelled payment:', error)
    }
  }

  // Notify parent window (for iframe/popup integration)
  notifyParent()

  // Auto-close/redirect after 3 seconds
  setTimeout(() => {
    closeOrRedirect()
  }, 3000)
})

const notifyParent = () => {
  try {
    const parentOrigin = window.location.origin

    const messageData = {
      type: 'PAYMENT_CANCELLED',
      message: cancellationMessage.value
    }

    // Try to notify parent window (for popup)
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(messageData, parentOrigin)
      console.log('Notified opener window of cancellation')
    }

    // Try to notify parent iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(messageData, parentOrigin)
      console.log('Notified parent iframe of cancellation')
    }
  } catch (error) {
    console.error('Error notifying parent:', error)
  }
}

const closeOrRedirect = () => {
  // If opened in popup, close it
  if (window.opener && !window.opener.closed) {
    window.close()
  } else {
    // Otherwise redirect to dashboard
    router.push('/app/dashboard')
  }
}

const closeNow = () => {
  closeOrRedirect()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
        <svg class="h-10 w-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </div>

      <h2 class="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
      <p class="text-gray-600 mb-6">You have cancelled the payment process.</p>

      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <p class="text-sm text-gray-700">No charges have been made to your card.</p>
      </div>

      <p class="text-sm text-gray-500 mb-4">This window will close automatically in 3 seconds...</p>

      <button
        @click="closeNow"
        class="w-full bg-indigo-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-indigo-700 transition-colors"
      >
        Close Now
      </button>
    </div>
  </div>
</template>
