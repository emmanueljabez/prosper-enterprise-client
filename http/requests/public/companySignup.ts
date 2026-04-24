import api from '@/http/axios'

export interface PublicCompanySignupIntentPayload {
  companyName: string
  workEmail: string
  phoneNumber: string
  firstName: string
  lastName: string
  planId?: string | null
  sessionCount?: number | null
}

export interface PublicCompanySignupIntentResponse {
  success: boolean
  message: string
  data: {
    token: string
    companyRegistrationToken?: string | null
    companyName: string
    workEmail: string
    firstName: string
    lastName: string
    planId?: string | null
    sessionCount?: number | null
    status: string
    expiresAt?: string | null
  } | null
}

export default {
  async createIntent(payload: PublicCompanySignupIntentPayload): Promise<PublicCompanySignupIntentResponse> {
    const { data } = await api.post('/v1/public/company-signup-intents', payload)
    return data
  },

  async getIntent(token: string): Promise<PublicCompanySignupIntentResponse> {
    const { data } = await api.get(`/v1/public/company-signup-intents/${token}`)
    return data
  },

  async completeIntent(token: string, payload: {
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber: string
    dateOfBirth?: string
  }) {
    const { data } = await api.post(`/v1/public/company-signup-intents/${token}/complete`, payload)
    return data
  },

  async resumePurchase(token: string, payload: {
    sessionCount?: number | null
    redirectSuccessUrl: string
    redirectCancelUrl: string
  }) {
    const { data } = await api.post(`/v1/public/company-signup-intents/${token}/resume-purchase`, payload)
    return data
  },
}
