import { defineStore } from 'pinia'
import { ref } from 'vue'
import b2bDemoRequestsApi, {
  type PublicB2BDemoRequestPayload,
  type PublicB2BDemoRequestResponse,
} from '@/http/requests/public/b2bDemoRequests'

const resolveDemoRequestErrorMessage = (err: any, fallback: string) => {
  return err?.response?.data?.message
    || err?.response?.data?.error
    || err.message
    || fallback
}

export const useB2BDemoRequestStore = defineStore('b2b-demo-requests', () => {
  const request = ref<PublicB2BDemoRequestResponse['data']>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const submitRequest = async (payload: PublicB2BDemoRequestPayload) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await b2bDemoRequestsApi.createRequest(payload)
      request.value = response.data
      return response
    } catch (err: any) {
      const message = resolveDemoRequestErrorMessage(err, 'Failed to submit demo request')
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  const clearRequest = () => {
    request.value = null
    error.value = null
  }

  return {
    request,
    isLoading,
    error,
    submitRequest,
    clearRequest,
  }
})
