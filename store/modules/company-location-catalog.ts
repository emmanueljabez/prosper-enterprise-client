import { defineStore } from 'pinia'
import companyLocationCatalogApi, {
  type CompanyChapterRecord,
  type CompanyRegionRecord,
  type CreateChapterPayload,
  type CreateRegionPayload,
  type UpdateChapterPayload,
  type UpdateRegionPayload,
} from '~/http/requests/app/companyLocationCatalog'
import { useAppToast } from '@/composables/services/toastService'

interface PaginationState {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

interface CompanyLocationCatalogState {
  regionsLoading: boolean
  regionsSaving: boolean
  chaptersLoading: boolean
  chaptersSaving: boolean
  error: string | null
  regions: CompanyRegionRecord[]
  chapters: CompanyChapterRecord[]
  regionsPagination: PaginationState
  chaptersPagination: PaginationState
  filters: {
    regionSearch: string
    chapterSearch: string
    chapterRegionId: string | null
  }
}

const defaultPagination: PaginationState = {
  currentPage: 0,
  totalPages: 0,
  totalItems: 0,
  pageSize: 100,
  hasNext: false,
  hasPrevious: false,
}

const normalizeErrorMessage = (error: any, fallback: string) => {
  const status = Number(error?.response?.status || 0)
  const requestUrl = String(error?.config?.url || '')

  if (status === 404 && (requestUrl.includes('/regions') || requestUrl.includes('/chapters'))) {
    return 'Location catalog backend is not available yet in this environment. Please deploy the latest backend APIs.'
  }

  return error?.response?.data?.message || error?.message || fallback
}

const activeOnly = <T extends { isActive?: boolean | null; status?: string | null }>(records: T[]) =>
  records.filter(record => record.isActive !== false && String(record.status || 'ACTIVE') === 'ACTIVE')

const toPagination = (data: {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}): PaginationState => ({
  currentPage: data.currentPage,
  totalPages: data.totalPages,
  totalItems: data.totalItems,
  pageSize: data.pageSize,
  hasNext: data.hasNext,
  hasPrevious: data.hasPrevious,
})

export const useCompanyLocationCatalogStore = defineStore('company-location-catalog', {
  state: (): CompanyLocationCatalogState => ({
    regionsLoading: false,
    regionsSaving: false,
    chaptersLoading: false,
    chaptersSaving: false,
    error: null,
    regions: [],
    chapters: [],
    regionsPagination: { ...defaultPagination },
    chaptersPagination: { ...defaultPagination },
    filters: {
      regionSearch: '',
      chapterSearch: '',
      chapterRegionId: null,
    },
  }),

  getters: {
    activeRegions(state): CompanyRegionRecord[] {
      return activeOnly(state.regions)
    },

    activeChapters(state): CompanyChapterRecord[] {
      return activeOnly(state.chapters)
    },
  },

  actions: {
    async loadRegions(params: {
      companyId: string
      page?: number
      size?: number
      search?: string
    }) {
      this.regionsLoading = true
      this.error = null

      try {
        const page = params.page ?? 0
        const size = params.size ?? this.regionsPagination.pageSize
        const search = params.search ?? this.filters.regionSearch
        const response = await companyLocationCatalogApi.getCompanyRegions({
          companyId: params.companyId,
          page,
          size,
          search,
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load regions')
        }

        this.regions = response.data.regions || []
        this.regionsPagination = toPagination(response.data)
        this.filters.regionSearch = search
        return this.regions
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to load regions')
        throw error
      } finally {
        this.regionsLoading = false
      }
    },

    async createRegion(companyId: string, payload: CreateRegionPayload) {
      const toast = useAppToast()
      this.regionsSaving = true
      this.error = null

      try {
        const response = await companyLocationCatalogApi.createRegion(companyId, payload)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create region')
        }

        this.regions = [response.data, ...this.regions.filter(region => region.id !== response.data?.id)]
        this.regionsPagination.totalItems = Math.max(this.regions.length, this.regionsPagination.totalItems + 1)
        toast.success(response.message || 'Region created successfully')
        return response.data
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to create region')
        toast.error(this.error)
        throw error
      } finally {
        this.regionsSaving = false
      }
    },

    async updateRegion(companyId: string, regionId: string, payload: UpdateRegionPayload) {
      const toast = useAppToast()
      this.regionsSaving = true
      this.error = null

      try {
        const response = await companyLocationCatalogApi.updateRegion(companyId, regionId, payload)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update region')
        }

        this.regions = this.regions.map(region =>
          region.id === regionId ? response.data as CompanyRegionRecord : region,
        )
        toast.success(response.message || 'Region updated successfully')
        return response.data
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to update region')
        toast.error(this.error)
        throw error
      } finally {
        this.regionsSaving = false
      }
    },

    async deleteRegion(companyId: string, regionId: string) {
      const toast = useAppToast()
      this.regionsSaving = true
      this.error = null

      try {
        const response = await companyLocationCatalogApi.deleteRegion(companyId, regionId)
        if (!response.success) {
          throw new Error(response.message || 'Failed to delete region')
        }

        this.regions = this.regions.filter(region => region.id !== regionId)
        this.chapters = this.chapters.map(chapter =>
          chapter.regionId === regionId ? { ...chapter, regionId: null, regionName: null } : chapter,
        )
        this.regionsPagination.totalItems = Math.max(0, this.regionsPagination.totalItems - 1)
        toast.success(response.message || 'Region deleted successfully')
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to delete region')
        toast.error(this.error)
        throw error
      } finally {
        this.regionsSaving = false
      }
    },

    async loadChapters(params: {
      companyId: string
      page?: number
      size?: number
      search?: string
      regionId?: string | null
    }) {
      this.chaptersLoading = true
      this.error = null

      try {
        const page = params.page ?? 0
        const size = params.size ?? this.chaptersPagination.pageSize
        const search = params.search ?? this.filters.chapterSearch
        const regionId = params.regionId ?? this.filters.chapterRegionId
        const response = await companyLocationCatalogApi.getCompanyChapters({
          companyId: params.companyId,
          page,
          size,
          search,
          regionId,
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load chapters')
        }

        this.chapters = response.data.chapters || []
        this.chaptersPagination = toPagination(response.data)
        this.filters.chapterSearch = search
        this.filters.chapterRegionId = regionId
        return this.chapters
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to load chapters')
        throw error
      } finally {
        this.chaptersLoading = false
      }
    },

    async createChapter(companyId: string, payload: CreateChapterPayload) {
      const toast = useAppToast()
      this.chaptersSaving = true
      this.error = null

      try {
        const response = await companyLocationCatalogApi.createChapter(companyId, payload)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create chapter')
        }

        this.chapters = [response.data, ...this.chapters.filter(chapter => chapter.id !== response.data?.id)]
        this.chaptersPagination.totalItems = Math.max(this.chapters.length, this.chaptersPagination.totalItems + 1)
        toast.success(response.message || 'Chapter created successfully')
        return response.data
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to create chapter')
        toast.error(this.error)
        throw error
      } finally {
        this.chaptersSaving = false
      }
    },

    async updateChapter(companyId: string, chapterId: string, payload: UpdateChapterPayload) {
      const toast = useAppToast()
      this.chaptersSaving = true
      this.error = null

      try {
        const response = await companyLocationCatalogApi.updateChapter(companyId, chapterId, payload)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update chapter')
        }

        this.chapters = this.chapters.map(chapter =>
          chapter.id === chapterId ? response.data as CompanyChapterRecord : chapter,
        )
        toast.success(response.message || 'Chapter updated successfully')
        return response.data
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to update chapter')
        toast.error(this.error)
        throw error
      } finally {
        this.chaptersSaving = false
      }
    },

    async deleteChapter(companyId: string, chapterId: string) {
      const toast = useAppToast()
      this.chaptersSaving = true
      this.error = null

      try {
        const response = await companyLocationCatalogApi.deleteChapter(companyId, chapterId)
        if (!response.success) {
          throw new Error(response.message || 'Failed to delete chapter')
        }

        this.chapters = this.chapters.filter(chapter => chapter.id !== chapterId)
        this.chaptersPagination.totalItems = Math.max(0, this.chaptersPagination.totalItems - 1)
        toast.success(response.message || 'Chapter deleted successfully')
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to delete chapter')
        toast.error(this.error)
        throw error
      } finally {
        this.chaptersSaving = false
      }
    },
  },
})
