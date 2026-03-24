<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

definePageMeta({
  layout: false,
  middleware: []
})

const route = useRoute()
const router = useRouter()

const status = ref<'processing' | 'success' | 'failed' | 'review'>('processing')
const message = ref('Processing your payment...')
const decision = ref<string>('')
const transactionId = ref<string>('')
const authCode = ref<string>('')
const errorMessage = ref<string>('')

const applyDecisionState = (decisionValue: string, responseMessage: string, reasonCode: string) => {
  const normalizedDecision = decisionValue.toUpperCase()
  decision.value = normalizedDecision

  if (normalizedDecision === 'ACCEPT') {
    status.value = 'success'
    message.value = 'Payment successful!'
    errorMessage.value = ''
    return
  }

  if (normalizedDecision === 'REVIEW') {
    status.value = 'review'
    message.value = 'Payment is under review'
    errorMessage.value = responseMessage || 'Your payment is being reviewed. We will notify you once it is processed.'
    return
  }

  status.value = 'failed'
  message.value = normalizedDecision === 'DECLINE' ? 'Payment declined' : 'Payment failed'
  errorMessage.value = responseMessage || (reasonCode ? `Reason: ${reasonCode}` : 'An error occurred during payment processing')
}

const finalizeFromToken = async (token: string) => {
  try {
    const finalizeRequestBody = { token }
    const finalizeViaFrontendRoute = () => $fetch<{
      success: boolean
      decision: string
      transactionId: string
      authCode: string
      reasonCode: string
      message: string
    }>('/payment/cybersource/finalize', {
      method: 'POST',
      body: finalizeRequestBody
    })

    const finalizeViaApiRoute = () => $fetch<{
      success: boolean
      decision: string
      transactionId: string
      authCode: string
      reasonCode: string
      message: string
    }>('/api/cybersource/finalize', {
      method: 'POST',
      body: finalizeRequestBody
    })

    let result
    try {
      result = await finalizeViaFrontendRoute()
    } catch (frontendRouteError: any) {
      console.warn('Finalize via /payment route failed, falling back to /api route', frontendRouteError)
      result = await finalizeViaApiRoute()
    }

    transactionId.value = result.transactionId || ''
    authCode.value = result.authCode || ''
    applyDecisionState(result.decision || '', result.message || '', result.reasonCode || '')
  } catch (error: any) {
    status.value = 'failed'
    message.value = 'Payment processing failed'
    errorMessage.value = error?.data?.statusMessage || error?.message || 'Unable to finalize payment'
  }
}

const hydrateFromLegacyQuery = () => {
  const params = route.query
  const queryDecision = (params.decision as string) || ''
  transactionId.value = (params.transaction_id as string) || ''
  authCode.value = (params.auth_code as string) || ''
  const reasonCode = (params.reason_code as string) || ''
  const responseMessage = (params.message as string) || ''

  applyDecisionState(queryDecision, responseMessage, reasonCode)
}

onMounted(async () => {
  const token = (route.query.token as string) || ''

  if (token) {
    await finalizeFromToken(token)
  } else {
    hydrateFromLegacyQuery()
  }

  // Notify parent window (for popup integration)
  notifyParent()

  // Auto-redirect after 3 seconds
  setTimeout(() => {
    redirectToDashboard()
  }, 3000)
})

const notifyParent = () => {
  try {
    const parentOrigin = window.location.origin

    const messageData = {
      type: status.value === 'success' ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
      decision: decision.value,
      transactionId: transactionId.value,
      authCode: authCode.value,
      message: message.value,
      errorMessage: errorMessage.value
    }

    // Try to notify parent window (for popup)
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(messageData, parentOrigin)
      console.log('Notified opener window')
    }

    // Try to notify parent iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(messageData, parentOrigin)
      console.log('Notified parent iframe')
    }
  } catch (error) {
    console.error('Error notifying parent:', error)
  }
}

const redirectToDashboard = () => {
  // If opened in popup, close it
  if (window.opener && !window.opener.closed) {
    window.close()
  } else {
    // Otherwise redirect to dashboard
    router.push('/app/dashboard')
  }
}

const closeNow = () => {
  if (window.opener && !window.opener.closed) {
    window.close()
  } else {
    router.push('/app/dashboard')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <!-- Success State -->
      <div v-if="status === 'success'" class="text-center">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg class="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ message }}</h2>
        <p class="text-gray-600 mb-4">Your payment has been processed successfully.</p>

        <div v-if="transactionId" class="bg-gray-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-500 mb-1">Transaction ID</p>
          <p class="text-sm font-mono text-gray-900">{{ transactionId }}</p>
        </div>

        <p class="text-sm text-gray-500">Redirecting in 3 seconds...</p>
      </div>

      <!-- Failed State -->
      <div v-else-if="status === 'failed'" class="text-center">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <svg class="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ message }}</h2>
        <p class="text-gray-600 mb-4">{{ errorMessage }}</p>

        <div class="bg-red-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-red-800">Please check your card details and try again, or use a different payment method.</p>
        </div>

        <button
          @click="closeNow"
          class="w-full bg-indigo-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-indigo-700 transition-colors"
        >
          Close
        </button>
      </div>

      <!-- Review State -->
      <div v-else-if="status === 'review'" class="text-center">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
          <svg class="h-10 w-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ message }}</h2>
        <p class="text-gray-600 mb-4">{{ errorMessage }}</p>

        <p class="text-sm text-gray-500 mb-6">This window will close automatically...</p>

        <button
          @click="closeNow"
          class="w-full bg-indigo-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-indigo-700 transition-colors"
        >
          Close
        </button>
      </div>

      <!-- Processing State -->
      <div v-else class="text-center">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ message }}</h2>
        <p class="text-gray-600">Please wait...</p>
      </div>
    </div>
  </div>
</template>
