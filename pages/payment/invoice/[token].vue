<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  Landmark,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  X
} from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import PublicSiteHeader from '@/components/landing/PublicSiteHeader.vue'
import SocialFooter from '@/components/landing/SocialFooter.vue'
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
const selectedMethod = ref<'MPESA' | 'CARD'>('CARD')
const selectedMpesaMethod = ref<'PAYBILL' | 'STK'>('PAYBILL')
const mpesaDialogOpen = ref(false)
const mpesaDialogStep = ref<'SELECT' | 'STK_SENT' | 'PAYBILL_WAITING'>('SELECT')
const phoneNumber = ref('')
const lastMpesaAccountReference = ref('')
const redirecting = ref(false)
const redirectCountdown = ref<number | null>(null)

const pollingTimer = ref<number | null>(null)
const countdownTimer = ref<number | null>(null)
const pollingAttempts = ref(0)
const cardPopup = ref<Window | null>(null)
const MPESA_PAYBILL_NUMBER = '4045031'

const isPaid = computed(() => invoice.value?.status === 'PAID')
const isPayable = computed(() => Boolean(invoice.value?.isPayable))
const latestPaymentStatus = computed(() => invoice.value?.latestPayment?.status || '')

const formattedAmount = computed(() => {
  if (!invoice.value) {
    return ''
  }

  const currency = (invoice.value.currency || 'KES').toUpperCase()
  const currencyLabel = currency === 'KES' ? 'KSH' : currency
  const amount = Number(invoice.value.amount || 0)

  try {
    const hasCents = Math.abs(amount % 1) > 0
    return `${currencyLabel} ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: hasCents ? 2 : 0
    }).format(amount)}`
  } catch {
    return `${currencyLabel} ${invoice.value.amount || 0}`
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

const legacyNumericMpesaAccountReference = computed(() => {
  const rawReference = invoice.value?.id || invoice.value?.invoiceNumber || ''
  const digits = rawReference.replace(/\D/g, '')
  if (!digits) {
    return ''
  }

  return `2${digits}`.slice(0, 8).padEnd(8, '0')
})

const mpesaAccountNumber = computed(() =>
  invoice.value?.mpesaAccountReference
  || lastMpesaAccountReference.value
  || invoice.value?.latestPayment?.mpesaAccountReference
  || invoice.value?.latestPayment?.gatewayReference
  || legacyNumericMpesaAccountReference.value
  || ''
)

const mpesaAccountNumberTextClass = computed(() => {
  if (mpesaAccountNumber.value.length > 32) {
    return 'text-[8px]'
  }

  if (mpesaAccountNumber.value.length > 22) {
    return 'text-[10px]'
  }

  return 'text-[12px]'
})

const maskedPhoneNumber = computed(() => {
  const cleaned = phoneNumber.value.replace(/\D/g, '')
  if (cleaned.length < 6) {
    return phoneNumber.value || 'your phone'
  }

  const local = cleaned.startsWith('254') ? `0${cleaned.slice(3)}` : cleaned
  if (local.length >= 10) {
    return `${local.slice(0, 3)}X XXX ${local.slice(-3)}`
  }

  return `${cleaned.slice(0, 3)}X XXX ${cleaned.slice(-3)}`
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
      lastMpesaAccountReference.value = response.data.mpesaAccountReference || ''
      mpesaDialogStep.value = 'STK_SENT'
      mpesaDialogOpen.value = true
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

const openMpesaDialog = () => {
  selectedMethod.value = 'MPESA'
  selectedMpesaMethod.value = 'PAYBILL'
  mpesaDialogStep.value = 'SELECT'
  errorMessage.value = ''
  mpesaDialogOpen.value = true
}

const closeMpesaDialog = () => {
  if (actionLoading.value) {
    return
  }

  mpesaDialogOpen.value = false
}

const submitMpesaDialogPayment = async () => {
  if (selectedMpesaMethod.value === 'PAYBILL') {
    mpesaDialogStep.value = 'PAYBILL_WAITING'
    errorMessage.value = ''
    statusMessage.value = 'Waiting for M-Pesa Paybill payment...'
    startPolling(90, 4000, 'Waiting for M-Pesa Paybill payment...')
    return
  }

  selectedMethod.value = 'MPESA'
  await submitPayment()
}

const submitSelectedPayment = async () => {
  if (selectedMethod.value === 'MPESA') {
    openMpesaDialog()
    return
  }

  await submitPayment()
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
  mpesaDialogOpen.value = false
  mpesaDialogStep.value = 'SELECT'
  actionLoading.value = false
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

const cancelPayment = () => {
  if (invoice.value?.redirectCancelUrl) {
    startRedirect(invoice.value.redirectCancelUrl)
    return
  }

  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back()
  }
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
  <div class="flex min-h-screen flex-col bg-[#f1f1f1] text-[#202020]" style="font-family: Montserrat, sans-serif;">
    <PublicSiteHeader />

    <main class="flex-1 bg-[#f1f1f1] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8">
      <div class="mx-auto w-full max-w-[1130px]">
        <div v-if="loading" class="rounded-[24px] bg-white p-8 text-center md:p-10">
          <Loader2 class="mx-auto mb-3 h-6 w-6 animate-spin text-[#027F63]" />
          <p class="text-sm font-medium text-[#555]">
            Loading invoice details...
          </p>
        </div>

        <div v-else-if="errorMessage && !invoice" class="rounded-[24px] border border-rose-100 bg-white p-6 text-center md:p-8">
          <AlertCircle class="mx-auto mb-3 h-6 w-6 text-rose-600" />
          <p class="font-medium text-rose-700">
            {{ errorMessage }}
          </p>
          <button
            type="button"
            class="mt-5 rounded-full bg-[#027F63] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#026e56]"
            @click="loadInvoice"
          >
            Retry
          </button>
        </div>

        <div
          v-else-if="invoice"
          class="overflow-hidden rounded-[24px] bg-white lg:grid lg:min-h-[520px] lg:grid-cols-[0.9fr_1.25fr]"
        >
          <section class="flex min-h-[340px] flex-col justify-center px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
            <p class="text-[13px] font-bold text-[#006241]">
              MENTORSHIP SESSION
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-3">
              <h1 class="text-[27px] font-bold leading-tight text-[#20242a] sm:text-[32px]">
                Complete Payment
              </h1>
              <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="invoiceStatusClass(invoice.status)">
                {{ invoice.status }}
              </span>
            </div>

            <div class="mt-5 max-w-[360px] rounded-[18px] bg-[#f4f4f4] px-5 py-5">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-[12px] font-medium text-[#3e3e3e]">
                    Invoice Number
                  </p>
                  <p class="mt-2 break-words text-[14px] font-semibold text-[#20242a]">
                    {{ invoice.invoiceNumber }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-[12px] font-medium text-[#3e3e3e]">
                    Amount Due
                  </p>
                  <p class="mt-2 text-[16px] font-bold text-[#006241]">
                    {{ formattedAmount }}
                  </p>
                </div>
              </div>

              <div class="my-4 h-px bg-[#cfcfcf]" />

              <div class="flex items-center gap-3">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#a43a9a] text-white">
                  <ShieldCheck class="h-5 w-5" aria-hidden="true" />
                </span>
                <div class="min-w-0">
                  <p class="text-[12px] font-bold leading-snug text-[#111]">
                    {{ invoice.description || 'Mentorship Session' }}
                  </p>
                  <p class="mt-1 text-[11px] leading-relaxed text-[#333]">
                    <span v-if="invoice.expiresAt">Expires {{ formatDate(invoice.expiresAt) }}</span>
                    <span v-else>Secure invoice for your Prosper Mentor session</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section class="border-t border-[#d9d9d9] px-5 py-7 sm:px-8 lg:border-l lg:border-t-0 lg:px-10 lg:py-10">
            <div class="mx-auto flex h-full w-full max-w-[455px] flex-col">
              <div class="lg:pt-[48px]">
                <template v-if="isPaid">
                  <div class="rounded-[18px] border border-emerald-200 bg-emerald-50 p-5">
                    <div class="flex items-start gap-3">
                      <CheckCircle2 class="mt-0.5 h-5 w-5 text-emerald-600" />
                      <div>
                        <p class="font-semibold text-emerald-700">
                          Payment received
                        </p>
                        <p class="mt-1 text-sm text-emerald-700/90">
                          Invoice paid on {{ formatDate(invoice.paidAt) }}.
                        </p>
                        <p v-if="redirecting && redirectCountdown !== null" class="mt-2 text-xs text-emerald-700/90">
                          Redirecting in {{ redirectCountdown }}s...
                        </p>
                      </div>
                    </div>
                  </div>
                </template>

                <template v-else-if="!isPayable">
                  <div class="rounded-[18px] border border-amber-200 bg-amber-50 p-5">
                    <div class="flex items-start gap-3">
                      <AlertCircle class="mt-0.5 h-5 w-5 text-amber-600" />
                      <div>
                        <p class="font-semibold text-amber-700">
                          This invoice is not payable
                        </p>
                        <p class="mt-1 text-sm text-amber-700/90">
                          Status: {{ invoice.status }}. Contact support if this is unexpected.
                        </p>
                      </div>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <p class="text-[18px] font-bold text-black">
                    Select Payment
                  </p>
                  <p class="mt-2 text-[16px] font-normal text-[#1f1f1f]">
                    Secure, encrypted transaction
                  </p>

                  <div class="mt-7 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      class="flex min-h-[64px] items-center gap-3 rounded-lg border bg-white px-4 text-left transition hover:border-[#027F63] focus:outline-none focus:ring-2 focus:ring-[#027F63]"
                      :class="selectedMethod === 'MPESA' ? 'border-[#027F63] ring-1 ring-[#027F63]' : 'border-[#cfcfcf]'"
                      :aria-pressed="selectedMethod === 'MPESA'"
                      @click="openMpesaDialog"
                    >
                      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#008a75] text-white">
                        <Smartphone class="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span class="text-[12px] font-medium text-black">Mpesa</span>
                    </button>

                    <button
                      type="button"
                      class="flex min-h-[64px] items-center gap-3 rounded-lg border bg-white px-4 text-left transition hover:border-[#a43a9a] focus:outline-none focus:ring-2 focus:ring-[#a43a9a]"
                      :class="selectedMethod === 'CARD' ? 'border-[#a43a9a] ring-1 ring-[#a43a9a]' : 'border-[#cfcfcf]'"
                      :aria-pressed="selectedMethod === 'CARD'"
                      @click="selectedMethod = 'CARD'"
                    >
                      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#a43a9a] text-white">
                        <CreditCard class="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span class="text-[12px] font-medium text-black">Card Payment</span>
                    </button>
                  </div>

                  <div class="mt-5 flex items-center gap-4">
                    <button
                      type="button"
                      class="inline-flex h-10 min-w-[96px] items-center justify-center gap-2 rounded-full bg-[#027F63] px-5 text-[12px] font-medium text-white transition hover:bg-[#026e56] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
                      :aria-label="payButtonLabel"
                      :disabled="!isPayable || actionLoading"
                      @click="submitSelectedPayment"
                    >
                      <Loader2 v-if="actionLoading" class="h-4 w-4 animate-spin" />
                      {{ actionLoading ? 'Processing...' : 'Continue' }}
                    </button>
                    <button
                      type="button"
                      class="text-[12px] font-medium text-black transition hover:text-[#027F63] disabled:cursor-not-allowed disabled:text-[#9ca3af]"
                      :disabled="actionLoading"
                      @click="cancelPayment"
                    >
                      Cancel
                    </button>
                  </div>

                  <div class="mt-6 border-t border-[#d9d9d9] pt-3">
                    <p class="text-[11px] leading-relaxed text-[#575757]">
                      <span v-if="selectedMethod === 'CARD'">
                        You will be redirected to CyberSource Secure Acceptance to complete your card payment.
                      </span>
                      <span v-else>
                        We will send an M-Pesa prompt to this number and update invoice status here in real time.
                      </span>
                    </p>
                  </div>
                </template>

                <div v-if="statusMessage" class="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">
                  {{ statusMessage }}
                </div>

                <div v-if="errorMessage && invoice" class="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {{ errorMessage }}
                </div>
              </div>

              <div class="mt-8 flex items-start gap-2 text-[#2b2b2b] lg:mt-auto">
                <HelpCircle class="mt-0.5 h-4 w-4 shrink-0 text-[#a43a9a]" aria-hidden="true" />
                <div>
                  <p class="text-[12px] font-bold">
                    Need Help
                  </p>
                  <p class="mt-1 max-w-[420px] text-[11px] leading-tight text-[#4f4f4f]">
                    Keep this page open while paying. We update invoice status here in real time.
                    Contact us if you experience any issues.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <div
      v-if="mpesaDialogOpen && invoice"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 px-4 py-8 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mpesa-dialog-title"
    >
      <div class="relative max-h-[calc(100vh-2rem)] w-full max-w-[390px] overflow-y-auto rounded-[22px] bg-white px-7 py-8 shadow-[0_10px_18px_rgba(0,0,0,0.22)] sm:max-w-[430px] sm:px-8">
        <button
          type="button"
          class="absolute right-7 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full text-black transition hover:bg-[#f4f4f4]"
          aria-label="Close M-Pesa dialog"
          :disabled="actionLoading"
          @click="closeMpesaDialog"
        >
          <X class="h-4 w-4" aria-hidden="true" />
        </button>

        <template v-if="mpesaDialogStep === 'SELECT'">
          <h2 id="mpesa-dialog-title" class="mt-6 text-center text-[15px] font-bold text-black">
            Choose M-PESA Payment Method
          </h2>

          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="flex min-h-[70px] items-center gap-3 rounded-lg border bg-white px-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[#027F63]"
              :class="selectedMpesaMethod === 'STK' ? 'border-[#027F63] ring-1 ring-[#027F63]' : 'border-[#d3d3d3]'"
              :aria-pressed="selectedMpesaMethod === 'STK'"
              @click="selectedMpesaMethod = 'STK'"
            >
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white"
                :class="selectedMpesaMethod === 'STK' ? 'bg-[#027F63]' : 'bg-[#666]'"
              >
                <Smartphone class="h-4 w-4" aria-hidden="true" />
              </span>
              <span class="text-[10px] font-medium leading-tight text-black">Pay With Phone Number</span>
            </button>

            <button
              type="button"
              class="flex min-h-[70px] items-center gap-3 rounded-lg border bg-white px-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[#a43a9a]"
              :class="selectedMpesaMethod === 'PAYBILL' ? 'border-[#a43a9a] ring-1 ring-[#a43a9a]' : 'border-[#d3d3d3]'"
              :aria-pressed="selectedMpesaMethod === 'PAYBILL'"
              @click="selectedMpesaMethod = 'PAYBILL'"
            >
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white"
                :class="selectedMpesaMethod === 'PAYBILL' ? 'bg-[#a43a9a]' : 'bg-[#666]'"
              >
                <Landmark class="h-4 w-4" aria-hidden="true" />
              </span>
              <span class="text-[10px] font-medium leading-tight text-black">Pay Via Paybill</span>
            </button>
          </div>

          <div class="my-4 h-px bg-[#d0d0d0]" />

          <div v-if="selectedMpesaMethod === 'PAYBILL'" class="grid gap-3 sm:grid-cols-2">
            <div>
              <p class="mb-1 text-[10px] font-medium text-[#333]">
                Paybill Number
              </p>
              <div class="flex min-h-[52px] items-center justify-center rounded-lg border border-[#d4d4d4] px-4 text-center text-[12px] font-bold text-black">
                {{ MPESA_PAYBILL_NUMBER }}
              </div>
            </div>
            <div>
              <p class="mb-1 text-[10px] font-medium text-[#333]">
                Account Number
              </p>
              <div
                class="flex min-h-[52px] items-center justify-center rounded-lg border border-[#d4d4d4] px-3 text-center font-bold leading-tight text-black"
                :class="mpesaAccountNumberTextClass"
              >
                {{ mpesaAccountNumber }}
              </div>
            </div>
          </div>

          <div v-else class="mt-1">
            <label for="mpesaDialogPhone" class="mb-1 block text-[10px] font-medium text-[#333]">
              Phone Number
            </label>
            <input
              id="mpesaDialogPhone"
              v-model="phoneNumber"
              type="tel"
              inputmode="tel"
              placeholder="0712345678"
              class="h-[52px] w-full rounded-lg border border-[#d4d4d4] bg-white px-4 text-center text-[13px] font-semibold text-black outline-none transition focus:border-[#027F63] focus:ring-1 focus:ring-[#027F63]"
            >
          </div>

          <div class="mt-4 flex min-h-[52px] items-center justify-between rounded-lg border border-[#027F63] px-5 text-[12px] text-black">
            <span>Amount to Pay</span>
            <span class="font-bold">{{ formattedAmount }}</span>
          </div>

          <div v-if="errorMessage" class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-center text-[12px] text-rose-700">
            {{ errorMessage }}
          </div>

          <div class="mt-5 flex justify-center">
            <button
              type="button"
              class="inline-flex h-10 min-w-[170px] items-center justify-center gap-2 rounded-full bg-[#008a75] px-6 text-[12px] font-medium text-white transition hover:bg-[#027F63] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
              :disabled="actionLoading"
              @click="submitMpesaDialogPayment"
            >
              <Loader2 v-if="actionLoading" class="h-4 w-4 animate-spin" />
              <MessageCircle v-else class="h-4 w-4" aria-hidden="true" />
              Continue
            </button>
          </div>

          <button
            type="button"
            class="mx-auto mt-4 block text-[11px] font-medium text-black transition hover:text-[#027F63]"
            :disabled="actionLoading"
            @click="closeMpesaDialog"
          >
            Cancel Payment
          </button>
        </template>

        <template v-else>
          <div class="mx-auto mt-10 flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[#008a75] text-white">
            <Smartphone v-if="mpesaDialogStep === 'STK_SENT'" class="h-10 w-10" aria-hidden="true" />
            <Landmark v-else class="h-10 w-10" aria-hidden="true" />
          </div>

          <h2 id="mpesa-dialog-title" class="mt-5 text-center text-[18px] font-bold text-black">
            {{ mpesaDialogStep === 'STK_SENT' ? 'STK Push Sent' : 'Waiting for Paybill Payment' }}
          </h2>
          <p class="mx-auto mt-5 max-w-[330px] text-center text-[14px] leading-tight text-black">
            <span v-if="mpesaDialogStep === 'STK_SENT'">
              We have sent a payment request to {{ maskedPhoneNumber }}. Please enter your Mpesa PIN on your phone to complete the payment.
            </span>
            <span v-else>
              Complete the payment from M-Pesa using the Paybill details below. This window will update once payment is confirmed.
            </span>
          </p>

          <div class="mt-8 rounded-lg border border-[#027F63] px-5 py-3 text-[14px] text-black">
            <div class="flex items-center justify-between gap-4 py-3">
              <span>Amount to Pay</span>
              <span class="font-bold">{{ formattedAmount }}</span>
            </div>
            <div class="h-px bg-[#e6e6e6]" />
            <div class="flex items-center justify-between gap-4 py-3">
              <span>{{ mpesaDialogStep === 'STK_SENT' ? 'Paybill / Phone' : 'Paybill Number' }}</span>
              <span class="break-all text-right font-bold">
                {{ mpesaDialogStep === 'STK_SENT' ? maskedPhoneNumber : MPESA_PAYBILL_NUMBER }}
              </span>
            </div>
            <div class="h-px bg-[#e6e6e6]" />
            <div class="flex items-center justify-between gap-4 py-3">
              <span>Account Number</span>
              <span class="break-all text-right font-bold">
                {{ mpesaAccountNumber }}
              </span>
            </div>
          </div>

          <p class="mx-auto mt-6 max-w-[250px] text-center text-[12px] leading-tight text-[#a4a4a4]">
            This window will automatically close once the payment is confirmed
          </p>

          <div class="mt-8 flex items-center justify-center gap-3 text-[13px] text-black">
            <Loader2 class="h-5 w-5 animate-spin text-[#008a75]" aria-hidden="true" />
            <span>Waiting for payment...</span>
          </div>
        </template>
      </div>
    </div>

    <SocialFooter />
  </div>
</template>
