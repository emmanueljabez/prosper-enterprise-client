import { defineStore } from 'pinia'
import companyMentorsApi from '~/http/requests/app/companyMentors'
import { useAppToast } from '@/composables/services/toastService'
import type {
  CompanyMentorImportValidation,
  CompanyMentorInvitation,
  CompanyMentorInvitePayload,
  CompanyMentorPoolMember,
  CompanyMentorPoolMetrics,
  CompanyMentorVisibilityPayload,
} from '~/types/company-mentors'

interface CompanyMentorsState {
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  invitations: CompanyMentorInvitation[]
  members: CompanyMentorPoolMember[]
  metrics: CompanyMentorPoolMetrics | null
  importValidation: CompanyMentorImportValidation | null
  searchQuery: string
}

const extractErrorMessage = (error: unknown, fallback: string) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
  if (responseMessage) return responseMessage
  return error instanceof Error && error.message ? error.message : fallback
}

export const useCompanyMentorsStore = defineStore('companyMentors', {
  state: (): CompanyMentorsState => ({
    isLoading: false,
    isSubmitting: false,
    error: null,
    invitations: [],
    members: [],
    metrics: null,
    importValidation: null,
    searchQuery: '',
  }),

  actions: {
    async loadMentorPool(
      companyId: string,
      params: { page?: number; size?: number; search?: string } = {},
    ) {
      const toast = useAppToast()
      this.isLoading = true
      this.error = null

      try {
        const search = params.search ?? this.searchQuery
        const response = await companyMentorsApi.getMentorPool(companyId, {
          page: params.page ?? 0,
          size: params.size ?? 50,
          search,
        })

        if (!response.data.success || !response.data.data) {
          throw new Error(response.data.message || 'Failed to load company mentor pool')
        }

        this.searchQuery = search || ''
        this.invitations = response.data.data.invitations || []
        this.members = response.data.data.members || []
        this.metrics = response.data.data.metrics || null
        return response.data.data
      } catch (error: unknown) {
        this.error = extractErrorMessage(error, 'Failed to load company mentor pool')
        toast.error(this.error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async inviteMentor(companyId: string, payload: CompanyMentorInvitePayload) {
      const toast = useAppToast()
      this.isSubmitting = true
      this.error = null

      try {
        const response = await companyMentorsApi.inviteMentor(companyId, payload)
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to invite mentor')
        }

        toast.success(response.data.message || 'Mentor invitation sent')
        await this.loadMentorPool(companyId)
        return response.data.data
      } catch (error: unknown) {
        this.error = extractErrorMessage(error, 'Failed to invite mentor')
        toast.error(this.error)
        throw error
      } finally {
        this.isSubmitting = false
      }
    },

    async validateImport(companyId: string, file: File) {
      const toast = useAppToast()
      this.isSubmitting = true
      this.error = null

      try {
        const response = await companyMentorsApi.validateImport(companyId, file)
        if (!response.data.success || !response.data.data) {
          throw new Error(response.data.message || 'Failed to validate mentor import')
        }

        this.importValidation = response.data.data
        return response.data.data
      } catch (error: unknown) {
        this.error = extractErrorMessage(error, 'Failed to validate mentor import')
        toast.error(this.error)
        throw error
      } finally {
        this.isSubmitting = false
      }
    },

    async importMentors(companyId: string, file: File) {
      const toast = useAppToast()
      this.isSubmitting = true
      this.error = null

      try {
        const response = await companyMentorsApi.importMentors(companyId, file)
        if (!response.data.success || !response.data.data) {
          throw new Error(response.data.message || 'Failed to import mentors')
        }

        this.importValidation = response.data.data
        toast.success(response.data.message || 'Mentor import completed')
        await this.loadMentorPool(companyId)
        return response.data.data
      } catch (error: unknown) {
        this.error = extractErrorMessage(error, 'Failed to import mentors')
        toast.error(this.error)
        throw error
      } finally {
        this.isSubmitting = false
      }
    },

    async resendInvitation(companyId: string, invitationId: string) {
      const toast = useAppToast()
      this.isSubmitting = true
      this.error = null

      try {
        const response = await companyMentorsApi.resendInvitation(companyId, invitationId)
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to resend mentor invitation')
        }

        toast.success(response.data.message || 'Mentor invitation resent')
        await this.loadMentorPool(companyId)
        return response.data.data
      } catch (error: unknown) {
        this.error = extractErrorMessage(error, 'Failed to resend mentor invitation')
        toast.error(this.error)
        throw error
      } finally {
        this.isSubmitting = false
      }
    },

    async updateVisibility(companyId: string, membershipId: string, payload: CompanyMentorVisibilityPayload) {
      const toast = useAppToast()
      this.isSubmitting = true
      this.error = null

      try {
        const response = await companyMentorsApi.updateVisibility(companyId, membershipId, payload)
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to update mentor visibility')
        }

        toast.success(response.data.message || 'Mentor visibility updated')
        await this.loadMentorPool(companyId)
        return response.data.data
      } catch (error: unknown) {
        this.error = extractErrorMessage(error, 'Failed to update mentor visibility')
        toast.error(this.error)
        throw error
      } finally {
        this.isSubmitting = false
      }
    },

    async removeMembership(companyId: string, membershipId: string) {
      const toast = useAppToast()
      this.isSubmitting = true
      this.error = null

      try {
        const response = await companyMentorsApi.removeMembership(companyId, membershipId)
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to remove company mentor')
        }

        toast.success(response.data.message || 'Company mentor removed')
        await this.loadMentorPool(companyId)
      } catch (error: unknown) {
        this.error = extractErrorMessage(error, 'Failed to remove company mentor')
        toast.error(this.error)
        throw error
      } finally {
        this.isSubmitting = false
      }
    },

    clearImportValidation() {
      this.importValidation = null
      this.error = null
    },
  },
})
