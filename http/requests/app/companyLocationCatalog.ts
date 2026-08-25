import api from '@/http/axios'

export type LocationCatalogStatus = 'ACTIVE' | 'INACTIVE'

export interface CompanyRegionRecord {
  id: string
  companyId: string
  name: string
  code?: string | null
  description?: string | null
  status?: LocationCatalogStatus | string | null
  isActive?: boolean | null
  chapterCount?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CompanyChapterRecord {
  id: string
  companyId: string
  regionId?: string | null
  regionName?: string | null
  name: string
  code?: string | null
  description?: string | null
  status?: LocationCatalogStatus | string | null
  isActive?: boolean | null
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

export interface CompanyLocationsQueryParams {
  companyId: string
  page?: number
  size?: number
  search?: string
}

export interface CompanyChaptersQueryParams extends CompanyLocationsQueryParams {
  regionId?: string | null
}

export interface CreateRegionPayload {
  name: string
  code?: string
  description?: string
}

export interface UpdateRegionPayload {
  name?: string
  code?: string
  description?: string
  isActive?: boolean
}

export interface CreateChapterPayload {
  name: string
  code?: string
  description?: string
  regionId?: string | null
}

export interface UpdateChapterPayload {
  name?: string
  code?: string
  description?: string
  regionId?: string | null
  isActive?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
}

export interface CompanyRegionsData extends PagedResponseData<CompanyRegionRecord> {
  companyId: string
  regions: CompanyRegionRecord[]
}

export interface CompanyChaptersData extends PagedResponseData<CompanyChapterRecord> {
  companyId: string
  regionId?: string | null
  chapters: CompanyChapterRecord[]
}

export type CompanyRegionsResponse = ApiResponse<CompanyRegionsData>
export type CompanyRegionResponse = ApiResponse<CompanyRegionRecord>
export type CompanyChaptersResponse = ApiResponse<CompanyChaptersData>
export type CompanyChapterResponse = ApiResponse<CompanyChapterRecord>

export default {
  async getCompanyRegions(params: CompanyLocationsQueryParams): Promise<CompanyRegionsResponse> {
    const { companyId, page = 0, size = 100, search = '' } = params
    const { data } = await api.get(`/v1/companies/${companyId}/regions`, {
      params: {
        page,
        size,
        search,
      },
    })
    return data
  },

  async createRegion(companyId: string, payload: CreateRegionPayload): Promise<CompanyRegionResponse> {
    const { data } = await api.post(`/v1/companies/${companyId}/regions`, payload)
    return data
  },

  async updateRegion(
    companyId: string,
    regionId: string,
    payload: UpdateRegionPayload,
  ): Promise<CompanyRegionResponse> {
    const { data } = await api.put(`/v1/companies/${companyId}/regions/${regionId}`, payload)
    return data
  },

  async deleteRegion(companyId: string, regionId: string): Promise<ApiResponse<{ regionId: string }>> {
    const { data } = await api.delete(`/v1/companies/${companyId}/regions/${regionId}`)
    return data
  },

  async getCompanyChapters(params: CompanyChaptersQueryParams): Promise<CompanyChaptersResponse> {
    const { companyId, page = 0, size = 100, search = '', regionId } = params
    const { data } = await api.get(`/v1/companies/${companyId}/chapters`, {
      params: {
        page,
        size,
        search,
        ...(regionId ? { regionId } : {}),
      },
    })
    return data
  },

  async createChapter(companyId: string, payload: CreateChapterPayload): Promise<CompanyChapterResponse> {
    const { data } = await api.post(`/v1/companies/${companyId}/chapters`, payload)
    return data
  },

  async updateChapter(
    companyId: string,
    chapterId: string,
    payload: UpdateChapterPayload,
  ): Promise<CompanyChapterResponse> {
    const { data } = await api.put(`/v1/companies/${companyId}/chapters/${chapterId}`, payload)
    return data
  },

  async deleteChapter(companyId: string, chapterId: string): Promise<ApiResponse<{ chapterId: string }>> {
    const { data } = await api.delete(`/v1/companies/${companyId}/chapters/${chapterId}`)
    return data
  },
}
