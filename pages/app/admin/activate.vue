<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from '#app'
import AuthSplitShell from '@/components/auth/AuthSplitShell.vue'
import { Button } from '@/components/ui/button'
import { useAppToast } from '@/composables/services/toastService'
import { useAuthStore } from '@/store/modules/auth'
import { useCompanyActivationStore } from '@/store/modules/company-activation'
import { useCompanySignupStore } from '@/store/modules/company-signup'
import { useSubscriptionsStore } from '@/store/modules/subscriptions'

definePageMeta({
  requiresAuth: true,
  permissions: ['admin:dashboard:view'],
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useAppToast()
const companyActivationStore = useCompanyActivationStore()
const companySignupStore = useCompanySignupStore()
const subscriptionsStore = useSubscriptionsStore()
const sessionCount = ref(25)
const isSubmitting = ref(false)

const companyId = computed(() => authStore.loggedInUser?.companyId || '')
const corporatePlan = computed(() =>
  subscriptionsStore.activePlans.find(plan => plan.planAudience === 'CORPORATE' || plan.planAudience === 'BOTH') || null,
)
const pendingSubscription = computed(() =>
  companyActivationStore.companySubscriptions.find(subscription =>
    subscription.status === 'PENDING_PAYMENT' && subscription.latestInvoice,
  ) || null,
)
const pendingInvoice = computed(() => pendingSubscription.value?.latestInvoice || null)
const pendingInvoiceSessionCount = computed(() => {
  const invoiceCount = Number(pendingInvoice.value?.sessionCount || 0)
  if (invoiceCount > 0) {
    return invoiceCount
  }

  const subscriptionCount = Number(pendingSubscription.value?.seatsPurchased || 0)
  if (subscriptionCount > 0) {
    return subscriptionCount
  }

  const pendingSelectionCount = Number(companySignupStore.pendingSelection?.sessionCount || 0)
  return pendingSelectionCount > 0 ? pendingSelectionCount : 25
})
const hasPendingInvoiceCountChanged = computed(() =>
  Boolean(pendingInvoice.value) && sessionCount.value !== pendingInvoiceSessionCount.value,
)
const selectedPlanId = computed(() => companySignupStore.pendingSelection?.planId || corporatePlan.value?.id || '')
const ctaLabel = computed(() => {
  if (!pendingInvoice.value) {
    return 'Buy Sessions'
  }

  return hasPendingInvoiceCountChanged.value ? 'Update Sessions and Continue' : 'Continue Payment'
})
const pricePerSession = computed(() => Number(corporatePlan.value?.cost || 0))
const totalAmount = computed(() => pricePerSession.value * sessionCount.value)

const normalizeSessionCount = (value: number | string) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return 1
  }

  return Math.max(1, Math.round(parsed))
}

const updateSessionCount = (value: number | string) => {
  sessionCount.value = normalizeSessionCount(value)
}

const normalizePaymentUrl = (paymentUrl?: string | null, publicToken?: string | null) => {
  if (typeof window === 'undefined') {
    return paymentUrl || (publicToken ? `/payment/invoice/${publicToken}` : null)
  }

  const origin = window.location.origin

  if ((!paymentUrl || !paymentUrl.trim()) && publicToken) {
    return `${origin}/payment/invoice/${publicToken}`
  }

  if (!paymentUrl) {
    return null
  }

  try {
    const parsedUrl = new URL(paymentUrl, origin)
    const currentUrl = new URL(origin)
    const isLocalTarget = ['localhost', '127.0.0.1'].includes(parsedUrl.hostname)
    const isCurrentNonLocal = !['localhost', '127.0.0.1'].includes(currentUrl.hostname)

    if (isLocalTarget && isCurrentNonLocal) {
      return `${currentUrl.origin}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
    }

    return parsedUrl.toString()
  } catch {
    return publicToken ? `${origin}/payment/invoice/${publicToken}` : paymentUrl
  }
}

onMounted(async () => {
  companySignupStore.hydratePendingSelection()
  sessionCount.value = normalizeSessionCount(companySignupStore.pendingSelection?.sessionCount || 25)

  await subscriptionsStore.fetchPlans('CORPORATE')

  if (companyId.value) {
    companySignupStore.clearIntent()
    await companyActivationStore.loadActivationState(companyId.value)
    sessionCount.value = pendingInvoiceSessionCount.value
    if (route.query.invoice_paid === '1' && !companyActivationStore.requiresActivation) {
      await router.push('/app/admin')
    }
  }
})

const resolvePurchaseErrorMessage = (error: any) => String(
  error?.response?.data?.message
  || error?.response?.data?.error
  || error?.message
  || '',
)

const purchase = async () => {
  const pendingPaymentUrl = normalizePaymentUrl(pendingInvoice.value?.paymentUrl, pendingInvoice.value?.publicToken)
  if (pendingInvoice.value && !hasPendingInvoiceCountChanged.value && pendingPaymentUrl) {
    window.location.href = pendingPaymentUrl
    return
  }

  if (!companyId.value) {
    toast.error('Company context not found. Refresh your session and try again.')
    return
  }

  if (!selectedPlanId.value) {
    toast.error('Corporate pricing is not available right now. Refresh the page and try again.')
    return
  }

  isSubmitting.value = true
  try {
    const origin = window.location.origin
    const successUrl = `${origin}/app/admin/activate?invoice_paid=1`
    const cancelUrl = `${origin}/app/admin/activate?invoice_cancelled=1`

    companySignupStore.savePendingSelection({
      planId: selectedPlanId.value,
      sessionCount: sessionCount.value,
    })

    const createDirectPurchase = () =>
      companyActivationStore.createDirectPurchase(companyId.value, selectedPlanId.value, sessionCount.value, successUrl, cancelUrl)

    const response = await createDirectPurchase()

    const paymentUrl = normalizePaymentUrl(response?.data?.paymentUrl, response?.data?.publicToken)

    if (!paymentUrl) {
      throw new Error('Failed to start company purchase.')
    }

    window.location.href = paymentUrl
  } catch (error: any) {
    toast.error(resolvePurchaseErrorMessage(error) || 'Failed to redirect to payment page.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthSplitShell content-class="w-full max-w-3xl px-4 lg:px-8" align="center">
    <div class="rounded-[28px] border border-[#d0d5dd] bg-white p-8 shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-[0.18em] text-[#027F63]">
        Activation
      </p>
      <h1 class="mt-3 text-3xl font-semibold text-[#101828]">
        Buy sessions to activate your company workspace.
      </h1>
      <p class="mt-4 max-w-2xl text-sm leading-6 text-[#475467]">
        Your company admin account is ready. Purchase the initial session balance to unlock the
        corporate workspace and start allocating sessions across employees and programs.
      </p>

      <div class="mt-8 grid gap-6 rounded-[24px] bg-[#f7faf8] p-6">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-[#667085]">Corporate offer</p>
            <p class="mt-1 text-xl font-semibold text-[#101828]">
              {{ corporatePlan?.name || 'Enterprise Standard' }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-[#667085]">Price per session</p>
            <p class="mt-1 text-xl font-semibold text-[#101828]">
              KES {{ pricePerSession.toLocaleString() }}
            </p>
          </div>
        </div>

        <div class="grid gap-4 rounded-2xl border border-[#d0d5dd] bg-white p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-[#667085]">Session count</p>
              <p class="mt-1 text-sm text-[#475467]">
                Choose how many company-funded sessions to add to the shared wallet.
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-[#667085]">Total</p>
              <p class="mt-1 text-xl font-semibold text-[#101828]">
                KES {{ totalAmount.toLocaleString() }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <button
              type="button"
              class="flex h-11 w-11 items-center justify-center rounded-full border border-[#d0d5dd] text-lg text-[#101828]"
              @click="updateSessionCount(sessionCount - 1)"
            >
              -
            </button>
            <input
              :value="sessionCount"
              type="number"
              min="1"
              step="1"
              inputmode="numeric"
              class="h-12 w-28 rounded-2xl border border-[#d0d5dd] bg-white px-4 text-center text-lg font-semibold text-[#101828]"
              @input="updateSessionCount(($event.target as HTMLInputElement).value)"
              @blur="updateSessionCount(sessionCount)"
            >
            <button
              type="button"
              class="flex h-11 w-11 items-center justify-center rounded-full border border-[#d0d5dd] text-lg text-[#101828]"
              @click="updateSessionCount(sessionCount + 1)"
            >
              +
            </button>
          </div>

          <p v-if="pendingInvoice" class="text-sm text-[#475467]">
            <span v-if="hasPendingInvoiceCountChanged">
              Changing the session count will create a fresh invoice with the new total.
            </span>
            <span v-else>
              An invoice is already open for {{ pendingInvoiceSessionCount }} sessions. Continue payment or change the count to regenerate it.
            </span>
          </p>
        </div>

        <div class="rounded-2xl bg-white p-5 text-sm text-[#344054]">
          <p>Shared company wallet across all live company programs.</p>
          <p class="mt-2">If payment was already initiated, you can continue it below.</p>
        </div>

        <Button
          type="button"
          class="h-12 w-full"
          :disabled="isSubmitting"
          style="background-color:#027F63"
          @click="purchase"
        >
          {{ ctaLabel }}
        </Button>
      </div>
    </div>
  </AuthSplitShell>
</template>
