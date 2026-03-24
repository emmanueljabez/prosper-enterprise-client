import { defineStore } from 'pinia'
import pulsesApi, {
  type ParticipantPulseRecord,
  type ParticipantPulseSummaryRecord,
} from '@/http/requests/app/pulses'

interface PulsesState {
  loading: boolean
  error: string | null
  summary: ParticipantPulseSummaryRecord | null
  pulses: ParticipantPulseRecord[]
}

export const usePulsesStore = defineStore('pulses', {
  state: (): PulsesState => ({
    loading: false,
    error: null,
    summary: null,
    pulses: [],
  }),

  actions: {
    async loadMyPulses() {
      this.loading = true
      this.error = null

      try {
        const response = await pulsesApi.getMyPulses()

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load pulse workspace')
        }

        this.summary = response.data.summary
        this.pulses = response.data.pulses
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || 'Failed to load pulse workspace'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
