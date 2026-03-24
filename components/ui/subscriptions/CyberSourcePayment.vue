<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import { Loader2, ShieldCheck, CreditCard } from 'lucide-vue-next'

interface CyberSourceParams {
  [key: string]: string
}

interface PaymentData {
  cybersourceEndpoint: string
  cybersourceParams: CyberSourceParams
  transactionId: string
  paymentId: string
  referenceNumber: string
  success: boolean
  message: string
}

interface Props {
  paymentData: PaymentData
}

const props = defineProps<Props>()

// Extract values from paymentData for easier access
const cybersourceUrl = props.paymentData.cybersourceEndpoint
const cybersourceParams = props.paymentData.cybersourceParams

const emit = defineEmits<{
  success: [data: any]
  failure: [data: any]
  cancel: []
}>()

/**
 * Submit form and redirect to CyberSource
 */
const redirectToCyberSource = () => {
  nextTick(() => {
    const form = document.getElementById('cybersource-redirect-form') as HTMLFormElement
    if (form) {
      const popupName = 'cybersource-payment-popup'
      const popup = window.open(
        '',
        popupName,
        'width=520,height=760,left=100,top=80,resizable=yes,scrollbars=yes'
      )

      if (!popup) {
        emit('failure', {
          message: 'Popup was blocked by your browser. Please allow popups and try again.'
        })
        return
      }

      console.log('🔄 Redirecting to CyberSource for payment...')
      console.log('📍 URL:', cybersourceUrl)
      console.log('📦 Parameters:', Object.keys(cybersourceParams))

      form.target = popupName
      form.submit()
      popup.focus()
    }
  })
}

// Lifecycle
onMounted(() => {
  // Automatically redirect on mount
  redirectToCyberSource()
})
</script>

<template>
  <div class="cybersource-payment-container">
    <!-- Redirect Loading Screen -->
    <div class="w-full flex flex-col items-center justify-center py-16">
      <!-- Animated Icon -->
      <div class="relative mb-8">
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-24 h-24 rounded-full bg-purple-100 animate-pulse"></div>
        </div>
        <div class="relative flex items-center justify-center">
          <Loader2 class="h-16 w-16 animate-spin" style="color: #9b3699;" />
          <div class="absolute">
            <CreditCard class="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      <!-- Message -->
      <h3 class="text-2xl font-semibold text-gray-800 mb-2">Redirecting to Secure Payment</h3>
      <p class="text-gray-600 mb-6 text-center max-w-md">
        Please wait while we redirect you to CyberSource for secure card payment processing...
      </p>

      <!-- Security Badge -->
      <div class="flex items-center gap-2 text-sm text-gray-500 bg-green-50 px-4 py-2 rounded-full border border-green-200">
        <ShieldCheck class="h-5 w-5 text-green-600" />
        <span class="font-medium text-green-700">256-bit SSL Encrypted Payment</span>
      </div>

      <!-- Additional Info -->
      <div class="mt-8 text-center text-xs text-gray-400">
        <p>Powered by CyberSource Secure Acceptance</p>
      </div>
    </div>

    <!-- Hidden Form for Redirect -->
    <form
      id="cybersource-redirect-form"
      :action="cybersourceUrl"
      method="post"
      class="hidden"
    >
      <input
        v-for="(value, key) in cybersourceParams"
        :key="key"
        type="hidden"
        :name="key"
        :value="value"
      />
    </form>
  </div>
</template>

<style scoped>
.cybersource-payment-container {
  min-height: 400px;
}
</style>
