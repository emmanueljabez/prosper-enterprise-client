import axiosInstance from "../../axios/index"

export interface WhitelistQueryParams {
    companyId: string
    page?: number
    size?: number
    search?: string
}

export interface ProfilesQueryParams {
    companyId: string
    page?: number
    size?: number
    search?: string
}

export interface CompanyRecommendedProgram {
    id: string
    legacyId?: string | null
    name: string
    description?: string | null
    imageUrl?: string | null
    videoUrl?: string | null
    status?: string | null
    orderId?: number | null
    tips?: string[] | null
    focusAreas?: string[] | null
    createdAt?: string | null
    updatedAt?: string | null
}

export interface CompanyRecommendedProgramsResponse {
    success: boolean
    message: string
    data: {
        companyId: string
        companyName: string
        programs: CompanyRecommendedProgram[]
        count: number
    } | null
}

export interface CompanyOnboardingStatus {
    companyId: string
    companyName?: string | null
    completed: boolean
    missingFields: string[]
    industry?: string | null
    companySizeBand?: string | null
    country?: string | null
    timezone?: string | null
    mentorshipObjective?: string | null
    targetAudienceDescription?: string | null
    programDesignPreference?: string | null
    recommendedProgramIds?: string[]
    completedAt?: string | null
}

export interface CompanyOnboardingResponse {
    success: boolean
    message: string
    data: CompanyOnboardingStatus | null
}

export interface UpdateCompanyOnboardingPayload {
    industry: string
    companySizeBand: string
    country: string
    timezone: string
    mentorshipObjective: string
    targetAudienceDescription: string
    programDesignPreference?: 'PROSPER_PROGRAMS' | 'CUSTOM_MENTOR_POOL' | 'BOTH'
    recommendedProgramIds?: string[]
}

export interface CompanySessionRecord {
    id: string
    employeeId: string
    employeeName: string
    employeeEmail?: string | null
    department?: string | null
    mentorId: string
    mentorName: string
    status?: string | null
    platform?: string | null
    platformDisplayName?: string | null
    scheduledStart?: string | null
    scheduledEnd?: string | null
    durationMin?: number | null
    rating?: number | null
    cost?: number | string | null
    currency?: string | null
    paid?: boolean | null
}

export interface CompanySessionsResponse {
    success: boolean
    message: string
    data: {
        companyId: string
        companyName: string
        sessions: CompanySessionRecord[]
        count: number
    } | null
}

export interface CompanyRegistrationVerificationResponse {
    success: boolean
    message: string
    data: {
        id: string
        name: string
        emailAddress: string
        phoneNumber?: string | null
        registrationCompleted?: boolean | null
    } | null
}

export interface CompanyRecord {
    id: string
    name: string
    emailAddress: string
    phoneNumber: string
    logoUrl?: string | null
    website?: string | null
    description?: string | null
    address?: string | null
    city?: string | null
    country?: string | null
    primaryColor?: string | null
    secondaryColor?: string | null
    industry?: string | null
    companySizeBand?: string | null
    timezone?: string | null
    mentorshipObjective?: string | null
    targetAudienceDescription?: string | null
    programDesignPreference?: string | null
    onboardingCompleted?: boolean | null
    onboardingCompletedAt?: string | null
    isActive?: boolean | null
    registrationCompleted?: boolean | null
    createdAt?: string | null
    updatedAt?: string | null
}

export interface CompanyResponse {
    success: boolean
    message: string
    data: CompanyRecord | null
}

export interface UpdateCompanyPayload {
    name?: string
    emailAddress?: string
    phoneNumber?: string
    logoUrl?: string
    website?: string
    description?: string
    address?: string
    city?: string
    country?: string
    primaryColor?: string
    secondaryColor?: string
    industry?: string
    companySizeBand?: string
    timezone?: string
    mentorshipObjective?: string
    targetAudienceDescription?: string
    programDesignPreference?: string
    isActive?: boolean
}

export default {
    getCompany(companyId: string): Promise<{ data: CompanyResponse }> {
        return axiosInstance.get(`/v1/companies/${companyId}`)
    },

    updateCompany(companyId: string, payload: UpdateCompanyPayload): Promise<{ data: CompanyResponse }> {
        return axiosInstance.put(`/v1/companies/${companyId}`, payload)
    },

    getCompanyOnboarding(companyId: string): Promise<{ data: CompanyOnboardingResponse }> {
        return axiosInstance.get(`/v1/companies/${companyId}/onboarding`)
    },

    updateCompanyOnboarding(
        companyId: string,
        payload: UpdateCompanyOnboardingPayload
    ): Promise<{ data: CompanyOnboardingResponse }> {
        return axiosInstance.put(`/v1/companies/${companyId}/onboarding`, payload)
    },

    getCompanyProfiles(params: ProfilesQueryParams) {
        const { companyId, page = 0, size = 20, search = '' } = params
        return axiosInstance.get(`/v1/companies/${companyId}/profiles`, {
            params: {
                page,
                size,
                search
            }
        })
    },

    verifyInvitation(token: string) {
        return axiosInstance.get(`/v1/companies/whitelist/verify-invitation`, {
            params: { token }
        })
    },

    verifyCompanyRegistration(token: string): Promise<{ data: CompanyRegistrationVerificationResponse }> {
        return axiosInstance.get(`/v1/companies/register`, {
            params: { token }
        })
    },

    completeSignup(token: string, profileId: string) {
        return axiosInstance.post(`/v1/companies/whitelist/complete-signup`, null, {
            params: { token, profileId }
        })
    },

    bulkUploadWhitelist(companyId: string, file: File) {
        const formData = new FormData()
        formData.append('file', file)

        return axiosInstance.post(`/v1/companies/${companyId}/whitelist/bulk`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    getCompanyWhitelist(params: WhitelistQueryParams) {
        const { companyId, page = 0, size = 10, search = '' } = params
        return axiosInstance.get(`/v1/companies/${companyId}/whitelist`, {
            params: {
                page,
                size,
                search
            }
        })
    },

    addToWhitelist(companyId: string, data: {
        emailAddress: string
        notes?: string
    }) {
        return axiosInstance.post(`/v1/companies/${companyId}/whitelist`, data)
    },

    removeFromWhitelist(companyId: string, whitelistId: string) {
        return axiosInstance.delete(`/v1/companies/${companyId}/whitelist/${whitelistId}`)
    },

    sendInvitation(companyId: string, whitelistId: string) {
        return axiosInstance.post(`/v1/companies/${companyId}/whitelist/${whitelistId}/send-invitation`)
    },

    resendInvitation(companyId: string, whitelistId: string) {
        return axiosInstance.get(`/v1/companies/${companyId}/whitelist/${whitelistId}/resend-invitation`)
    },

    getRecommendedPrograms(companyId: string): Promise<{ data: CompanyRecommendedProgramsResponse }> {
        return axiosInstance.get(`/v1/companies/${companyId}/recommended-programs`)
    },

    updateRecommendedPrograms(companyId: string, programIds: string[]): Promise<{ data: CompanyRecommendedProgramsResponse }> {
        return axiosInstance.put(`/v1/companies/${companyId}/recommended-programs`, { programIds })
    },

    getCompanySessions(companyId: string): Promise<{ data: CompanySessionsResponse }> {
        return axiosInstance.get(`/v1/companies/${companyId}/sessions`)
    }
}
