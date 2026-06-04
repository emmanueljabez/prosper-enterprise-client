import api from '@/http/axios'

export type DepartmentStatus = 'ACTIVE' | 'INACTIVE'

export interface CompanyDepartmentRecord {
  id: string
  companyId: string
  name: string
  code?: string | null
  description?: string | null
  status?: DepartmentStatus | string | null
  isActive?: boolean | null
  memberCount?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface DepartmentMemberRecord {
  departmentId: string
  profileId: string
  profileName: string
  profileEmail?: string | null
  profileRole?: string | null
  profileAvatarUrl?: string | null
  joinedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CompanyProfileRecord {
  id: string
  email?: string | null
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  avatarUrl?: string | null
  role?: string | null
  isVerified?: boolean | null
  department?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface PagedResponseData<T> {
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrevious: boolean
  count: number
  search?: string
  [key: string]: unknown
  items?: T[]
}

export interface CompanyDepartmentsQueryParams {
  companyId: string
  page?: number
  size?: number
  search?: string
}

export interface DepartmentMembersQueryParams {
  companyId: string
  departmentId: string
  page?: number
  size?: number
  search?: string
}

export interface CompanyProfilesQueryParams {
  companyId: string
  page?: number
  size?: number
  search?: string
}

export interface CreateDepartmentPayload {
  name: string
  code?: string
  description?: string
}

export interface UpdateDepartmentPayload {
  name?: string
  code?: string
  description?: string
  isActive?: boolean
}

export interface AddDepartmentMembersPayload {
  profileIds: string[]
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
}

export interface CompanyDepartmentsData extends PagedResponseData<CompanyDepartmentRecord> {
  companyId: string
  departments: CompanyDepartmentRecord[]
}

export interface DepartmentMembersData extends PagedResponseData<DepartmentMemberRecord> {
  companyId: string
  departmentId: string
  members: DepartmentMemberRecord[]
}

export interface DepartmentMemberAssignmentResult {
  companyId: string
  departmentId: string
  assignedCount?: number | null
  skippedCount?: number | null
  members?: DepartmentMemberRecord[] | null
  skippedProfiles?: Array<{
    profileId: string
    reason?: string | null
  }> | null
}

export interface CompanyProfilesPageData {
  content: CompanyProfileRecord[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export type CompanyDepartmentsResponse = ApiResponse<CompanyDepartmentsData>
export type CompanyDepartmentResponse = ApiResponse<CompanyDepartmentRecord>
export type DepartmentMembersResponse = ApiResponse<DepartmentMembersData>
export type DepartmentMemberAssignmentResponse = ApiResponse<DepartmentMemberAssignmentResult>
export type CompanyProfilesResponse = ApiResponse<CompanyProfilesPageData>

export default {
  async getCompanyDepartments(params: CompanyDepartmentsQueryParams): Promise<CompanyDepartmentsResponse> {
    const { companyId, page = 0, size = 20, search = '' } = params
    const { data } = await api.get(`/v1/companies/${companyId}/departments`, {
      params: {
        page,
        size,
        search,
      },
    })
    return data
  },

  async createDepartment(companyId: string, payload: CreateDepartmentPayload): Promise<CompanyDepartmentResponse> {
    const { data } = await api.post(`/v1/companies/${companyId}/departments`, payload)
    return data
  },

  async updateDepartment(
    companyId: string,
    departmentId: string,
    payload: UpdateDepartmentPayload,
  ): Promise<CompanyDepartmentResponse> {
    const { data } = await api.put(`/v1/companies/${companyId}/departments/${departmentId}`, payload)
    return data
  },

  async deleteDepartment(companyId: string, departmentId: string): Promise<ApiResponse<{ departmentId: string }>> {
    const { data } = await api.delete(`/v1/companies/${companyId}/departments/${departmentId}`)
    return data
  },

  async getDepartmentMembers(params: DepartmentMembersQueryParams): Promise<DepartmentMembersResponse> {
    const { companyId, departmentId, page = 0, size = 20, search = '' } = params
    const { data } = await api.get(`/v1/companies/${companyId}/departments/${departmentId}/members`, {
      params: {
        page,
        size,
        search,
      },
    })
    return data
  },

  async addDepartmentMembers(
    companyId: string,
    departmentId: string,
    payload: AddDepartmentMembersPayload,
  ): Promise<DepartmentMemberAssignmentResponse> {
    const { data } = await api.post(`/v1/companies/${companyId}/departments/${departmentId}/members`, payload)
    return data
  },

  async removeDepartmentMember(
    companyId: string,
    departmentId: string,
    profileId: string,
  ): Promise<ApiResponse<{ departmentId: string; profileId: string }>> {
    const { data } = await api.delete(`/v1/companies/${companyId}/departments/${departmentId}/members/${profileId}`)
    return data
  },

  async getCompanyProfiles(params: CompanyProfilesQueryParams): Promise<CompanyProfilesResponse> {
    const { companyId, page = 0, size = 50, search = '' } = params
    const { data } = await api.get(`/v1/companies/${companyId}/profiles`, {
      params: {
        page,
        size,
        search,
      },
    })
    return data
  },
}
