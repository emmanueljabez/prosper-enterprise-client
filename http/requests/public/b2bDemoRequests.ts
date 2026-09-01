import api from '@/http/axios'

export interface PublicB2BDemoRequestPayload {
  fullName: string
  workEmail: string
  organisation: string
  phoneNumber?: string
  partnershipType?: string
  cohortSize?: string
  timeline?: string
  details?: string
  sourcePage?: string
}

export interface PublicB2BDemoRequestResponse {
  success: boolean
  message: string
  data?: null
}

export default {
  async createRequest(payload: PublicB2BDemoRequestPayload): Promise<PublicB2BDemoRequestResponse> {
    const { data } = await api.post('/v1/public/b2b-demo-requests', payload)
    return data
  },
}
