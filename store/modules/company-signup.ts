import { defineStore } from 'pinia'
import { ref } from 'vue'
import companySignupApi from '@/http/requests/public/companySignup'

interface PendingSelection {
  planId: string
  sessionCount: number
}

interface CreateIntentPayload {
  companyName: string
  workEmail: string
  phoneNumber: string
  firstName: string
  lastName: string
}

interface CompleteIntentPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  dateOfBirth?: string
}

const PENDING_SELECTION_KEY = 'companySignupPendingSelection'
const INTENT_TOKEN_KEY = 'companySignupIntentToken'
const COMPANY_EMAIL_EXISTS_MESSAGE = 'A company with this email address already exists'

const resolveSignupErrorMessage = (err: any, fallback: string) => {
  return err?.response?.data?.message
    || err?.response?.data?.error
    || (err?.response?.status === 409 ? COMPANY_EMAIL_EXISTS_MESSAGE : null)
    || err.message
    || fallback
}

export const useCompanySignupStore = defineStore('company-signup', () => {
  const pendingSelection = ref<PendingSelection | null>(null)
  const intentToken = ref<string | null>(null)
  const intent = ref<Record<string, any> | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const savePendingSelection = (selection: PendingSelection) => {
    pendingSelection.value = selection
    if (typeof window !== 'undefined') {
      localStorage.setItem(PENDING_SELECTION_KEY, JSON.stringify(selection))
    }
  }

  const hydratePendingSelection = () => {
    if (typeof window === 'undefined') {
      return
    }
    const raw = localStorage.getItem(PENDING_SELECTION_KEY)
    pendingSelection.value = raw ? JSON.parse(raw) : null
  }

  const clearPendingSelection = () => {
    pendingSelection.value = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PENDING_SELECTION_KEY)
    }
  }

  const hydrateIntentToken = () => {
    if (typeof window === 'undefined') {
      return
    }
    intentToken.value = localStorage.getItem(INTENT_TOKEN_KEY)
  }

  const createIntent = async (payload: CreateIntentPayload) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await companySignupApi.createIntent(payload)

      intentToken.value = response.data?.token || null
      intent.value = response.data || null

      if (intentToken.value && typeof window !== 'undefined') {
        localStorage.setItem(INTENT_TOKEN_KEY, intentToken.value)
      }

      return response
    } catch (err: any) {
      const message = resolveSignupErrorMessage(err, 'Failed to create company signup intent')
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  const completeIntent = async (payload: CompleteIntentPayload) => {
    if (!intentToken.value) {
      throw new Error('No signup intent token available')
    }

    isLoading.value = true
    error.value = null
    try {
      const response = await companySignupApi.completeIntent(intentToken.value, payload)
      intent.value = response?.data || response
      return response
    } catch (err: any) {
      const message = resolveSignupErrorMessage(err, 'Failed to complete company signup intent')
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  const clearIntent = () => {
    intentToken.value = null
    intent.value = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(INTENT_TOKEN_KEY)
    }
  }

  const clearPurchaseState = () => {
    clearPendingSelection()
    clearIntent()
  }

  return {
    pendingSelection,
    intentToken,
    intent,
    isLoading,
    error,
    savePendingSelection,
    hydratePendingSelection,
    clearPendingSelection,
    hydrateIntentToken,
    createIntent,
    completeIntent,
    clearIntent,
    clearPurchaseState,
  }
})
