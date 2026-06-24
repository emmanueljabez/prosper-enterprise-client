import { defineStore } from 'pinia'
import sessionContextDocumentsApi, {
  type SessionContextDocumentRecord,
} from '@/http/requests/app/sessionContextDocuments'

interface SessionContextDocumentsState {
  isUploading: boolean
  error: string | null
}

export const useSessionContextDocumentsStore = defineStore('sessionContextDocuments', {
  state: (): SessionContextDocumentsState => ({
    isUploading: false,
    error: null,
  }),

  actions: {
    async upload(file: File): Promise<SessionContextDocumentRecord> {
      this.isUploading = true
      this.error = null

      try {
        const response = await sessionContextDocumentsApi.upload(file)
        if (response.status !== 'success' || !response.data) {
          throw new Error(response.message || 'Failed to upload file')
        }
        return response.data
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Failed to upload file'
        this.error = message
        throw new Error(message)
      } finally {
        this.isUploading = false
      }
    },

    clearError() {
      this.error = null
    },
  },
})
