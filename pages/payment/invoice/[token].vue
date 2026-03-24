<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  Smartphone
} from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import invoicesApi, {
  type CardInvoicePaymentData,
  type PublicInvoice
} from '@/http/requests/app/invoices'

definePageMeta({
  layout: false,
  middleware: []
})

const route = useRoute()
const token = computed(() => String(route.params.token || '').trim())

const invoice = ref<PublicInvoice | null>(null)
const loading = ref(true)
const actionLoading = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')
const selectedMethod = ref<'MPESA' | 'CARD'>('MPESA')
const phoneNumber = ref('')
const redirecting = ref(false)
const redirectCountdown = ref<number | null>(null)

const pollingTimer = ref<number | null>(null)
const countdownTimer = ref<number | null>(null)
const pollingAttempts = ref(0)
const cardPopup = ref<Window | null>(null)

const isPaid = computed(() => invoice.value?.status === 'PAID')
const isPayable = computed(() => Boolean(invoice.value?.isPayable))
const latestPaymentStatus = computed(() => invoice.value?.latestPayment?.status || '')

const formattedAmount = computed(() => {
  if (!invoice.value) {
    return ''
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.value.currency || 'KES',
      maximumFractionDigits: 2
    }).format(Number(invoice.value.amount || 0))
  } catch {
    return `${invoice.value.currency || 'KES'} ${invoice.value.amount || 0}`
  }
})

const payButtonLabel = computed(() => {
  if (actionLoading.value) {
    return selectedMethod.value === 'MPESA'
      ? 'Waiting for M-Pesa confirmation...'
      : 'Preparing secure card checkout...'
  }
  return selectedMethod.value === 'MPESA'
    ? `Pay ${formattedAmount.value} with M-Pesa`
    : `Pay ${formattedAmount.value} with Card`
})

const loadInvoice = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    await refreshInvoice()

    if (isPaid.value) {
      statusMessage.value = 'This invoice is already paid.'
      handleInvoicePaid()
    }
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || error?.message || 'Failed to load invoice'
  } finally {
    loading.value = false
  }
}

const refreshInvoice = async () => {
  if (!token.value) {
    throw new Error('Invalid invoice link')
  }

  const response = await invoicesApi.getPublicInvoiceStatus(token.value)
  if (!response.success) {
    throw new Error(response.message || 'Unable to load invoice')
  }

  invoice.value = response.data
}

const submitPayment = async () => {
  if (!invoice.value || !isPayable.value || actionLoading.value) {
    return
  }

  errorMessage.value = ''
  statusMessage.value = ''
  actionLoading.value = true

  try {
    const payload: {
      method: 'MPESA' | 'CARD'
      phoneNumber?: string
      returnUrl?: string
      cancelUrl?: string
    } = {
      method: selectedMethod.value
    }

    if (selectedMethod.value === 'MPESA') {
      const normalizedPhone = normalizePhoneNumber(phoneNumber.value)
      if (!normalizedPhone) {
        throw new Error('Enter a valid M-Pesa number (e.g. 0712345678)')
      }
      payload.phoneNumber = normalizedPhone
    }

    if (selectedMethod.value === 'CARD' && typeof window !== 'undefined') {
      const callbackBaseUrl = window.location.origin
      payload.returnUrl = `${callbackBaseUrl}/payment/cybersource/response`
      payload.cancelUrl = `${callbackBaseUrl}/payment/cybersource/cancel`
    }

    const response = await invoicesApi.payPublicInvoice(token.value, payload)
    if (!response.success) {
      throw new Error(response.message || 'Payment initiation failed')
    }

    if (response.data.method === 'MPESA') {
      statusMessage.value = 'Prompt sent to your phone. Complete payment in M-Pesa.'
      actionLoading.value = false
      startPolling(45, 4000, 'Checking M-Pesa payment status...')
      return
    }

    const cardData = response.data as CardInvoicePaymentData
    const popupOpened = openCardCheckout(cardData.cybersourceEndpoint, cardData.cybersourceParams)
    actionLoading.value = false

    if (!popupOpened) {
      throw new Error('Popup was blocked. Allow popups and try card payment again.')
    }

    statusMessage.value = 'Secure checkout opened. Complete card payment in the popup.'
  } catch (error: any) {
    actionLoading.value = false
    errorMessage.value = error?.response?.data?.message || error?.message || 'Payment failed to start'
  }
}

const normalizePhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '')
  if (!cleaned) {
    return ''
  }

  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return cleaned
  }

  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `254${cleaned.slice(1)}`
  }

  if (cleaned.length === 9) {
    return `254${cleaned}`
  }

  return ''
}

const startPolling = (maxAttempts: number, intervalMs: number, pendingMessage: string) => {
  stopPolling()
  pollingAttempts.value = 0
  statusMessage.value = pendingMessage

  const tick = async () => {
    pollingAttempts.value += 1

    try {
      await refreshInvoice()
    } catch {
      // Keep polling transient errors
    }

    if (invoice.value?.status === 'PAID') {
      handleInvoicePaid()
      return
    }

    if (latestPaymentStatus.value === 'FAILED' || latestPaymentStatus.value === 'CANCELLED') {
      stopPolling()
      statusMessage.value = ''
      errorMessage.value = 'Payment was not completed. You can try again.'
      return
    }

    if (pollingAttempts.value >= maxAttempts) {
      stopPolling()
      statusMessage.value = ''
      errorMessage.value = 'Payment confirmation timed out. Refresh this page and check invoice status.'
      return
    }

    pollingTimer.value = window.setTimeout(tick, intervalMs)
  }

  tick()
}

const stopPolling = () => {
  if (pollingTimer.value) {
    window.clearTimeout(pollingTimer.value)
    pollingTimer.value = null
  }
}

const handleInvoicePaid = () => {
  stopPolling()
  statusMessage.value = 'Payment successful.'
  errorMessage.value = ''

  if (invoice.value?.redirectSuccessUrl) {
    startRedirect(invoice.value.redirectSuccessUrl)
  }
}

const startRedirect = (targetUrl: string) => {
  if (redirecting.value) {
    return
  }

  redirecting.value = true
  redirectCountdown.value = 3

  if (countdownTimer.value) {
    window.clearInterval(countdownTimer.value)
  }

  countdownTimer.value = window.setInterval(() => {
    if (redirectCountdown.value === null) {
      return
    }

    if (redirectCountdown.value <= 1) {
      window.clearInterval(countdownTimer.value as number)
      countdownTimer.value = null
      window.location.href = targetUrl
      return
    }

    redirectCountdown.value -= 1
  }, 1000)
}

const openCardCheckout = (endpoint: string, params: Record<string, string>) => {
  if (typeof window === 'undefined') {
    return false
  }

  const popupName = 'cybersource-payment-popup'
  const popup = window.open(
    '',
    popupName,
    'width=520,height=760,left=120,top=80,resizable=yes,scrollbars=yes'
  )

  if (!popup) {
    return false
  }

  cardPopup.value = popup

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = endpoint
  form.target = popupName
  form.style.display = 'none'

  Object.entries(params).forEach(([key, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = value
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
  popup.focus()

  return true
}

const handleCardMessage = (event: MessageEvent) => {
  if (typeof window === 'undefined') {
    return
  }

  if (event.origin !== window.location.origin) {
    return
  }

  const data = (event.data || {}) as Record<string, any>
  if (!data.type) {
    return
  }

  if (data.type === 'PAYMENT_SUCCESS') {
    statusMessage.value = 'Card payment submitted. Confirming invoice status...'
    errorMessage.value = ''
    startPolling(20, 2500, 'Confirming card payment...')
    return
  }

  if (data.type === 'PAYMENT_CANCELLED') {
    statusMessage.value = ''
    errorMessage.value = data.message || 'Card payment was cancelled.'
    if (invoice.value?.redirectCancelUrl) {
      startRedirect(invoice.value.redirectCancelUrl)
    }
    return
  }

  if (data.type === 'PAYMENT_FAILED') {
    statusMessage.value = ''
    errorMessage.value = data.errorMessage || data.message || 'Card payment failed.'
  }
}

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return 'N/A'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleString()
}

const invoiceStatusClass = (status: string) => {
  if (status === 'PAID') {
    return 'bg-emerald-100 text-emerald-700'
  }
  if (status === 'OPEN') {
    return 'bg-sky-100 text-sky-700'
  }
  if (status === 'EXPIRED' || status === 'VOID' || status === 'FAILED') {
    return 'bg-rose-100 text-rose-700'
  }
  return 'bg-slate-100 text-slate-700'
}

onMounted(() => {
  loadInvoice()
  window.addEventListener('message', handleCardMessage)
})

onBeforeUnmount(() => {
  stopPolling()

  if (countdownTimer.value) {
    window.clearInterval(countdownTimer.value)
  }

  if (cardPopup.value && !cardPopup.value.closed) {
    cardPopup.value.close()
  }

  window.removeEventListener('message', handleCardMessage)
})
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <div class="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div class="mb-8 flex flex-col items-center justify-center gap-3">
        <img
          src="/images/prosper_mentor_logo.png"
          alt="ProsperMentor"
          class="h-12 w-auto"
        >
        <h1 class="text-2xl font-semibold text-slate-900">
          Complete Payment
        </h1>
      </div>

      <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2 class="mx-auto mb-3 h-6 w-6 animate-spin text-slate-500" />
        <p class="text-sm text-slate-600">
          Loading invoice details...
        </p>
      </div>

      <div v-else-if="errorMessage && !invoice" class="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <AlertCircle class="mx-auto mb-3 h-6 w-6 text-rose-600" />
        <p class="font-medium text-rose-700">
          {{ errorMessage }}
        </p>
        <button
          class="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white"
          style="background-color: #a03b93;"
          @click="loadInvoice"
        >
          Retry
        </button>
      </div>

      <div v-else-if="invoice" class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div class="mb-6 flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">
                Invoice
              </p>
              <p class="text-lg font-semibold text-slate-900">
                {{ invoice.invoiceNumber }}
              </p>
            </div>
            <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="invoiceStatusClass(invoice.status)">
              {{ invoice.status }}
            </span>
          </div>

          <div v-if="isPaid" class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div class="flex items-start gap-3">
              <CheckCircle2 class="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p class="font-medium text-emerald-700">
                  Payment received
                </p>
                <p class="text-sm text-emerald-700/90">
                  Invoice paid on {{ formatDate(invoice.paidAt) }}.
                </p>
                <p v-if="redirecting && redirectCountdown !== null" class="mt-2 text-xs text-emerald-700/90">
                  Redirecting in {{ redirectCountdown }}s...
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="!isPayable" class="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div class="flex items-start gap-3">
              <AlertCircle class="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p class="font-medium text-amber-700">
                  This invoice is not payable
                </p>
                <p class="text-sm text-amber-700/90">
                  Status: {{ invoice.status }}. Contact support if this is unexpected.
                </p>
              </div>
            </div>
          </div>

          <template v-else>
            <div class="mb-6 grid grid-cols-2 gap-3">
              <button
                class="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition"
                :class="selectedMethod === 'MPESA'
                  ? 'text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'"
                :style="selectedMethod === 'MPESA' ? 'border-color: #a03b93; background-color: #a03b93;' : ''"
                @click="selectedMethod = 'MPESA'"
              >
                <Smartphone class="h-4 w-4" />
                M-Pesa
              </button>
              <button
                class="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition"
                :class="selectedMethod === 'CARD'
                  ? 'text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'"
                :style="selectedMethod === 'CARD' ? 'border-color: #a03b93; background-color: #a03b93;' : ''"
                @click="selectedMethod = 'CARD'"
              >
                <CreditCard class="h-4 w-4" />
                Card
              </button>
            </div>

            <div v-if="selectedMethod === 'MPESA'" class="mb-6">
              <label for="phoneNumber" class="mb-2 block text-sm font-medium text-slate-700">
                M-Pesa Phone Number
              </label>
              <input
                id="phoneNumber"
                v-model="phoneNumber"
                type="tel"
                placeholder="0712345678"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              >
              <p class="mt-2 text-xs text-slate-500">
                We will send an STK prompt to this number.
              </p>
            </div>

            <div v-else class="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm text-slate-700">
                You will be redirected to CyberSource Secure Acceptance to complete your card payment.
              </p>
              <p class="mt-1 text-xs text-slate-500">
                Supported cards include Visa and Mastercard.
              </p>
              <p class="mt-1 text-xs text-slate-500">
                For subscription invoices, card details may be used for automatic renewals.
              </p>
            </div>

            <button
              class="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-400"
              style="background-color: #a03b93;"
              :disabled="!isPayable || actionLoading"
              @click="submitPayment"
            >
              <Loader2 v-if="actionLoading" class="h-4 w-4 animate-spin" />
              {{ payButtonLabel }}
            </button>

            <p class="mt-3 text-center text-xs text-slate-500">
              By proceeding, you agree to secure processing of this transaction.
            </p>
          </template>

          <div v-if="statusMessage" class="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-700">
            {{ statusMessage }}
          </div>

          <div v-if="errorMessage && invoice" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {{ errorMessage }}
          </div>
        </section>

        <aside class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p class="text-sm text-slate-500">
            Amount Due
          </p>
          <p class="mt-1 text-3xl font-semibold text-slate-900">
            {{ formattedAmount }}
          </p>

          <div class="mt-6 space-y-4 border-t border-slate-100 pt-6 text-sm">
            <div class="flex items-start justify-between gap-3">
              <span class="text-slate-500">Description</span>
              <span class="text-right font-medium text-slate-800">
                {{ invoice.description || 'Invoice payment' }}
              </span>
            </div>

            <div class="flex items-start justify-between gap-3">
              <span class="text-slate-500">Created</span>
              <span class="text-right text-slate-700">{{ formatDate(invoice.createdAt) }}</span>
            </div>

            <div class="flex items-start justify-between gap-3">
              <span class="text-slate-500">Expires</span>
              <span class="text-right text-slate-700">{{ formatDate(invoice.expiresAt) }}</span>
            </div>

            <div class="flex items-start justify-between gap-3">
              <span class="text-slate-500">Latest attempt</span>
              <span v-if="invoice.latestPayment" class="text-right text-slate-700">
                {{ invoice.latestPayment.paymentMethod }} / {{ invoice.latestPayment.status }}
              </span>
              <span v-else class="text-right text-slate-700">No attempts yet</span>
            </div>
          </div>

          <div class="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p class="font-medium text-slate-700">
              Need help?
            </p>
            <p class="mt-1">
              Keep this page open while paying. We update invoice status here in real time.
            </p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
