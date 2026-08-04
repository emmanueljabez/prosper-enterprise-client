import axiosInstance from '../../axios/index'
import type {
  CompanyMentorImportValidationResponse,
  CompanyMentorInvitePayload,
  CompanyMentorInviteResponse,
  CompanyMentorPoolResponse,
  CompanyMentorVisibilityPayload,
  CompanyMentorVisibilityResponse,
} from '~/types/company-mentors'

export default {
  getMentorPool(
    companyId: string,
    params: { page?: number; size?: number; search?: string } = {},
  ): Promise<{ data: CompanyMentorPoolResponse }> {
    return axiosInstance.get(`/v1/companies/${companyId}/mentor-pool`, { params })
  },

  inviteMentor(
    companyId: string,
    payload: CompanyMentorInvitePayload,
  ): Promise<{ data: CompanyMentorInviteResponse }> {
    return axiosInstance.post(`/v1/companies/${companyId}/mentor-invitations`, payload)
  },

  validateImport(
    companyId: string,
    file: File,
  ): Promise<{ data: CompanyMentorImportValidationResponse }> {
    const formData = new FormData()
    formData.append('file', file)

    return axiosInstance.post(`/v1/companies/${companyId}/mentor-invitations/validate-import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  importMentors(
    companyId: string,
    file: File,
  ): Promise<{ data: CompanyMentorImportValidationResponse }> {
    const formData = new FormData()
    formData.append('file', file)

    return axiosInstance.post(`/v1/companies/${companyId}/mentor-invitations/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  resendInvitation(companyId: string, invitationId: string): Promise<{ data: CompanyMentorInviteResponse }> {
    return axiosInstance.post(`/v1/companies/${companyId}/mentor-invitations/${invitationId}/resend`)
  },

  updateVisibility(
    companyId: string,
    membershipId: string,
    payload: CompanyMentorVisibilityPayload,
  ): Promise<{ data: CompanyMentorVisibilityResponse }> {
    return axiosInstance.patch(`/v1/companies/${companyId}/mentor-pool/${membershipId}/visibility`, payload)
  },

  removeMembership(companyId: string, membershipId: string): Promise<{ data: { success: boolean; message: string; data: null } }> {
    return axiosInstance.delete(`/v1/companies/${companyId}/mentor-pool/${membershipId}`)
  },
}
