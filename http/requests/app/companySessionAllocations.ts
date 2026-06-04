import api from '@/http/axios'

export interface EmployeeSessionAllocationRecord {
  id?: string | null
  companyId?: string | null
  companyName?: string | null
  profileId: string
  profileName: string
  profileEmail?: string | null
  allocatedTotal: number
  consumedTotal: number
  availableBalance: number
  lastAllocatedAt?: string | null
  lastActivityAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

interface AllocationMutationResponse {
  allocation: EmployeeSessionAllocationRecord
}

interface AllocationLookupResponse {
  allocations: EmployeeSessionAllocationRecord[]
  requestedProfileIds?: string[]
}

interface AllocationListResponse {
  allocations: EmployeeSessionAllocationRecord[]
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrevious: boolean
  search?: string
}

export default {
  async getMyBalance(): Promise<{ success: boolean; message: string; data: EmployeeSessionAllocationRecord | null }> {
    const { data } = await api.get('/v1/employee-session-allocations/me')
    return data
  },

  async list(companyId: string, params?: {
    page?: number
    size?: number
    search?: string
  }): Promise<{ success: boolean; message: string; data: AllocationListResponse | null }> {
    const { data } = await api.get(`/v1/companies/${companyId}/employee-session-allocations`, {
      params,
    })
    return data
  },

  async lookup(companyId: string, profileIds: string[]): Promise<{ success: boolean; message: string; data: AllocationLookupResponse | null }> {
    const { data } = await api.get(`/v1/companies/${companyId}/employee-session-allocations/lookup`, {
      params: { profileIds },
      paramsSerializer: {
        indexes: null,
      },
    })
    return data
  },

  async allocate(companyId: string, profileId: string, payload: {
    companySubscriptionId: string
    quantity: number
  }): Promise<{ success: boolean; message: string; data: AllocationMutationResponse | null }> {
    const { data } = await api.post(`/v1/companies/${companyId}/employee-session-allocations/${profileId}/allocate`, payload)
    return data
  },

  async withdraw(companyId: string, profileId: string, payload: {
    companySubscriptionId: string
    quantity: number
  }): Promise<{ success: boolean; message: string; data: AllocationMutationResponse | null }> {
    const { data } = await api.post(`/v1/companies/${companyId}/employee-session-allocations/${profileId}/withdraw`, payload)
    return data
  },
}
