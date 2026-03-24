import { defineStore } from 'pinia'
import companyApi from '~/http/requests/app/company'
import { useAppToast } from '@/composables/services/toastService'

interface BulkUploadResult {
    totalProcessed: number
    successCount: number
    failureCount: number
    duplicateCount: number
    successEmails: string[]
    errors: Array<{ email?: string; reason: string }>
}

interface Company {
    id: string
    name: string
    emailAddress: string
    phoneNumber: string
    logoUrl: string
    isActive: boolean
    registrationToken: string
    registrationTokenExpiry: string
    registrationCompleted: boolean
    createdAt: string
    updatedAt: string
}

interface Profile {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    avatarUrl: string | null
    bio: string | null
    phone: string | null
    company: Company
    location: string | null
    role: string
    isVerified: boolean
    createdAt: string
    updatedAt: string
    expertise: string | null
    interests: string | null
    dob: string | null
    gender: string | null
    industry: string | null
    howDidYouKnowAboutUs: string | null
    linkedinUrl: string | null
    favouriteQuote: string | null
    country: string | null
    mentorProfile: any | null
}

interface WhitelistEntry {
    id: string
    company: Company
    email: string
    isUsed: boolean
    notes: string | null
    addedBy: string
    invitationToken: string | null
    invitationTokenExpiry: string | null
    invitationSent: boolean
    invitationAccepted: boolean
    profile: Profile | null
    createdAt: string
    updatedAt: string
}

interface Pageable {
    pageNumber: number
    pageSize: number
    sort: {
        empty: boolean
        sorted: boolean
        unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
}

interface WhitelistPagination {
    content: WhitelistEntry[]
    pageable: Pageable
    last: boolean
    totalPages: number
    totalElements: number
    first: boolean
    size: number
    number: number
    sort: {
        empty: boolean
        sorted: boolean
        unsorted: boolean
    }
    numberOfElements: number
    empty: boolean
}

interface ProfilesPagination {
    content: Profile[]
    pageable: Pageable
    last: boolean
    totalPages: number
    totalElements: number
    first: boolean
    size: number
    number: number
    sort: {
        empty: boolean
        sorted: boolean
        unsorted: boolean
    }
    numberOfElements: number
    empty: boolean
}

interface CompanyState {
    isLoading: boolean
    error: string | null
    lastUploadResult: BulkUploadResult | null
    whitelist: WhitelistEntry[]
    whitelistPagination: {
        currentPage: number
        totalPages: number
        totalElements: number
        pageSize: number
        hasNext: boolean
        hasPrevious: boolean
    }
    searchQuery: string
    profiles: Profile[]
    profilesPagination: {
        currentPage: number
        totalPages: number
        totalElements: number
        pageSize: number
        hasNext: boolean
        hasPrevious: boolean
    }
    profilesSearchQuery: string
    profilesLoading: boolean
}

export const useCompanyStore = defineStore('company', {
    state: (): CompanyState => ({
        isLoading: false,
        error: null,
        lastUploadResult: null,
        whitelist: [],
        whitelistPagination: {
            currentPage: 0,
            totalPages: 0,
            totalElements: 0,
            pageSize: 10,
            hasNext: false,
            hasPrevious: false
        },
        searchQuery: '',
        profiles: [],
        profilesPagination: {
            currentPage: 0,
            totalPages: 0,
            totalElements: 0,
            pageSize: 20,
            hasNext: false,
            hasPrevious: false
        },
        profilesSearchQuery: '',
        profilesLoading: false
    }),

    actions: {
        async bulkUploadWhitelist(companyId: string, file: File) {
            const toast = useAppToast()
            this.isLoading = true
            this.error = null

            try {
                const response = await companyApi.bulkUploadWhitelist(companyId, file)

                if (response.data.success) {
                    this.lastUploadResult = response.data.data
                    toast.success(response.data.message || 'Bulk upload completed successfully')
                    return response.data.data
                } else {
                    throw new Error(response.data.message || 'Upload failed')
                }
            } catch (err: any) {
                console.error('Error uploading whitelist:', err)
                this.error = err.response?.data?.message || 'Failed to upload file. Please try again.'
                toast.error(this.error)
                throw err
            } finally {
                this.isLoading = false
            }
        },

        clearUploadResult() {
            this.lastUploadResult = null
            this.error = null
        },

        async loadWhitelist(params: {
            companyId: string
            page?: number
            size?: number
            search?: string
        }) {
            const toast = useAppToast()
            this.isLoading = true
            this.error = null

            try {
                const page = params.page ?? 0
                const size = params.size ?? this.whitelistPagination.pageSize
                const search = params.search ?? this.searchQuery

                const response = await companyApi.getCompanyWhitelist({
                    companyId: params.companyId,
                    page,
                    size,
                    search
                })

                if (response.data.success) {
                    const data: WhitelistPagination = response.data.data

                    // For first page, replace whitelist. For subsequent pages, append
                    if (page === 0) {
                        this.whitelist = data.content
                    } else {
                        this.whitelist.push(...data.content)
                    }

                    this.whitelistPagination = {
                        currentPage: data.number,
                        totalPages: data.totalPages,
                        totalElements: data.totalElements,
                        pageSize: data.size,
                        hasNext: !data.last,
                        hasPrevious: !data.first
                    }
                }
            } catch (err: any) {
                console.error('Error loading whitelist:', err)
                this.error = 'Failed to load whitelist. Please try again.'
                toast.error('Failed to load whitelist')
            } finally {
                this.isLoading = false
            }
        },

        async loadMoreWhitelist(companyId: string) {
            if (!this.whitelistPagination.hasNext || this.isLoading) {
                return
            }

            await this.loadWhitelist({
                companyId,
                page: this.whitelistPagination.currentPage + 1,
                size: this.whitelistPagination.pageSize,
                search: this.searchQuery
            })
        },

        async searchWhitelist(companyId: string, query: string) {
            this.searchQuery = query
            await this.loadWhitelist({
                companyId,
                page: 0,
                size: this.whitelistPagination.pageSize,
                search: query
            })
        },

        async addToWhitelist(companyId: string, data: {
            email?: string
            emailAddress?: string
            notes?: string
        }) {
            const toast = useAppToast()
            this.isLoading = true
            this.error = null

            try {
                // Transform to API format (use emailAddress)
                const payload = {
                    emailAddress: data.emailAddress || data.email || '',
                    notes: data.notes
                }
                const response = await companyApi.addToWhitelist(companyId, payload)

                if (response.data.success) {
                    toast.success('Email added to whitelist successfully')
                    // Reload the whitelist
                    await this.loadWhitelist({
                        companyId,
                        page: 0,
                        size: this.whitelistPagination.pageSize,
                        search: this.searchQuery
                    })
                    return response.data.data
                }
            } catch (err: any) {
                console.error('Error adding to whitelist:', err)
                this.error = err.response?.data?.message || 'Failed to add email to whitelist'
                toast.error(this.error)
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async removeFromWhitelist(companyId: string, whitelistId: string) {
            const toast = useAppToast()
            this.isLoading = true
            this.error = null

            try {
                const response = await companyApi.removeFromWhitelist(companyId, whitelistId)

                if (response.data.success) {
                    toast.success('Email removed from whitelist')
                    // Remove from local state
                    this.whitelist = this.whitelist.filter(entry => entry.id !== whitelistId)
                    this.whitelistPagination.totalElements--
                    return response.data
                }
            } catch (err: any) {
                console.error('Error removing from whitelist:', err)
                this.error = err.response?.data?.message || 'Failed to remove email from whitelist'
                toast.error(this.error)
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async sendInvitation(companyId: string, whitelistId: string) {
            const toast = useAppToast()
            this.isLoading = true
            this.error = null

            try {
                const response = await companyApi.sendInvitation(companyId, whitelistId)

                if (response.data.success) {
                    toast.success('Invitation sent successfully')
                    // Update the whitelist entry locally
                    const entry = this.whitelist.find(e => e.id === whitelistId)
                    if (entry) {
                        entry.invitationSent = true
                    }
                    return response.data
                }
            } catch (err: any) {
                console.error('Error sending invitation:', err)
                this.error = err.response?.data?.message || 'Failed to send invitation'
                toast.error(this.error)
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async resendInvitation(companyId: string, whitelistId: string) {
            const toast = useAppToast()
            this.isLoading = true
            this.error = null

            try {
                const response = await companyApi.resendInvitation(companyId, whitelistId)

                if (response.data.success) {
                    toast.success('Invitation resent successfully')
                    // Update the whitelist entry locally
                    const entry = this.whitelist.find(e => e.id === whitelistId)
                    if (entry) {
                        entry.invitationSent = true
                    }
                    return response.data
                }
            } catch (err: any) {
                console.error('Error resending invitation:', err)
                this.error = err.response?.data?.message || 'Failed to resend invitation'
                toast.error(this.error)
                throw err
            } finally {
                this.isLoading = false
            }
        },

        clearWhitelist() {
            this.whitelist = []
            this.whitelistPagination = {
                currentPage: 0,
                totalPages: 0,
                totalElements: 0,
                pageSize: 10,
                hasNext: false,
                hasPrevious: false
            }
            this.searchQuery = ''
            this.error = null
        },

        async loadProfiles(params: {
            companyId: string
            page?: number
            size?: number
            search?: string
        }) {
            const toast = useAppToast()
            this.profilesLoading = true
            this.error = null

            try {
                const page = params.page ?? 0
                const size = params.size ?? this.profilesPagination.pageSize
                const search = params.search ?? this.profilesSearchQuery

                const response = await companyApi.getCompanyProfiles({
                    companyId: params.companyId,
                    page,
                    size,
                    search
                })

                if (response.data.success) {
                    const data: ProfilesPagination = response.data.data

                    // For first page, replace profiles. For subsequent pages, append
                    if (page === 0) {
                        this.profiles = data.content
                    } else {
                        this.profiles.push(...data.content)
                    }

                    this.profilesPagination = {
                        currentPage: data.number,
                        totalPages: data.totalPages,
                        totalElements: data.totalElements,
                        pageSize: data.size,
                        hasNext: !data.last,
                        hasPrevious: !data.first
                    }
                }
            } catch (err: any) {
                console.error('Error loading profiles:', err)
                this.error = 'Failed to load profiles. Please try again.'
                toast.error('Failed to load profiles')
            } finally {
                this.profilesLoading = false
            }
        },

        async loadMoreProfiles(companyId: string) {
            if (!this.profilesPagination.hasNext || this.profilesLoading) {
                return
            }

            await this.loadProfiles({
                companyId,
                page: this.profilesPagination.currentPage + 1,
                size: this.profilesPagination.pageSize,
                search: this.profilesSearchQuery
            })
        },

        async searchProfiles(companyId: string, query: string) {
            this.profilesSearchQuery = query
            await this.loadProfiles({
                companyId,
                page: 0,
                size: this.profilesPagination.pageSize,
                search: query
            })
        },

        clearProfiles() {
            this.profiles = []
            this.profilesPagination = {
                currentPage: 0,
                totalPages: 0,
                totalElements: 0,
                pageSize: 20,
                hasNext: false,
                hasPrevious: false
            }
            this.profilesSearchQuery = ''
        }
    }
})
