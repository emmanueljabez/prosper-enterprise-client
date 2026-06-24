import api from '@/http/axios'

export interface SessionContextDocumentRecord {
  id: string
  name: string
  storedName: string
  size: number
  type?: string | null
  url: string
}

export interface SessionContextDocumentUploadResponse {
  status: string
  message: string
  data: SessionContextDocumentRecord
}

export default {
  async upload(file: File): Promise<SessionContextDocumentUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.post('/v1/sessions/context-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return data
  },
}
