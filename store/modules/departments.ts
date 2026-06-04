import { defineStore } from 'pinia'
import departmentsApi, {
  type CompanyDepartmentRecord,
  type CompanyProfileRecord,
  type CreateDepartmentPayload,
  type DepartmentMemberRecord,
  type UpdateDepartmentPayload,
} from '~/http/requests/app/departments'
import { useAppToast } from '@/composables/services/toastService'

interface PaginationState {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

interface DepartmentsState {
  departmentsLoading: boolean
  departmentsSaving: boolean
  membersLoading: boolean
  membersSaving: boolean
  employeesLoading: boolean
  error: string | null
  departments: CompanyDepartmentRecord[]
  selectedDepartmentId: string | null
  members: DepartmentMemberRecord[]
  assignableEmployees: CompanyProfileRecord[]
  departmentsPagination: PaginationState
  membersPagination: PaginationState
  filters: {
    search: string
  }
  membersFilters: {
    search: string
  }
  employeeSearchQuery: string
}

const defaultPagination = {
  currentPage: 0,
  totalPages: 0,
  totalItems: 0,
  pageSize: 20,
  hasNext: false,
  hasPrevious: false,
}

const normalizeErrorMessage = (error: any, fallback: string) => {
  const status = Number(error?.response?.status || 0)
  const requestUrl = String(error?.config?.url || '')

  if (status === 404 && requestUrl.includes('/departments')) {
    return 'Departments backend is not available yet in this environment. Please deploy the latest backend APIs.'
  }

  return error?.response?.data?.message || error?.message || fallback
}

const isEmployeeRole = (role?: string | null) => {
  const normalized = String(role || '').trim().toLowerCase()
  if (!normalized) return false
  return normalized === 'employee' || normalized === 'mentee'
}

export const useDepartmentsStore = defineStore('departments', {
  state: (): DepartmentsState => ({
    departmentsLoading: false,
    departmentsSaving: false,
    membersLoading: false,
    membersSaving: false,
    employeesLoading: false,
    error: null,
    departments: [],
    selectedDepartmentId: null,
    members: [],
    assignableEmployees: [],
    departmentsPagination: { ...defaultPagination },
    membersPagination: { ...defaultPagination },
    filters: {
      search: '',
    },
    membersFilters: {
      search: '',
    },
    employeeSearchQuery: '',
  }),

  getters: {
    selectedDepartment(state): CompanyDepartmentRecord | null {
      return state.departments.find(department => department.id === state.selectedDepartmentId) || null
    },
  },

  actions: {
    async loadDepartments(params: {
      companyId: string
      page?: number
      size?: number
      search?: string
      preserveSelection?: boolean
    }) {
      this.departmentsLoading = true
      this.error = null

      try {
        const page = params.page ?? 0
        const size = params.size ?? this.departmentsPagination.pageSize
        const search = params.search ?? this.filters.search
        const preserveSelection = params.preserveSelection ?? true

        const response = await departmentsApi.getCompanyDepartments({
          companyId: params.companyId,
          page,
          size,
          search,
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load departments')
        }

        this.departments = response.data.departments || []
        this.departmentsPagination = {
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems,
          pageSize: response.data.pageSize,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious,
        }
        this.filters = {
          search,
        }

        const hasSelectedDepartment = this.departments.some(department => department.id === this.selectedDepartmentId)
        if (!preserveSelection || !hasSelectedDepartment) {
          this.selectedDepartmentId = this.departments[0]?.id || null
        }
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to load departments')
        throw error
      } finally {
        this.departmentsLoading = false
      }
    },

    async loadDepartmentMembers(params: {
      companyId: string
      departmentId: string
      page?: number
      size?: number
      search?: string
    }) {
      this.membersLoading = true
      this.error = null

      try {
        const page = params.page ?? 0
        const size = params.size ?? this.membersPagination.pageSize
        const search = params.search ?? this.membersFilters.search

        const response = await departmentsApi.getDepartmentMembers({
          companyId: params.companyId,
          departmentId: params.departmentId,
          page,
          size,
          search,
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load department members')
        }

        this.members = response.data.members || []
        this.membersPagination = {
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems,
          pageSize: response.data.pageSize,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious,
        }
        this.membersFilters = {
          search,
        }
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to load department members')
        throw error
      } finally {
        this.membersLoading = false
      }
    },

    async selectDepartment(params: {
      companyId: string
      departmentId: string | null
    }) {
      this.selectedDepartmentId = params.departmentId
      this.members = []
      this.assignableEmployees = []
      this.membersFilters.search = ''
      this.employeeSearchQuery = ''

      if (!params.departmentId) {
        return
      }

      await this.loadDepartmentMembers({
        companyId: params.companyId,
        departmentId: params.departmentId,
        page: 0,
        size: this.membersPagination.pageSize,
        search: '',
      })
    },

    async createDepartment(companyId: string, payload: CreateDepartmentPayload) {
      const toast = useAppToast()
      this.departmentsSaving = true
      this.error = null

      try {
        const response = await departmentsApi.createDepartment(companyId, payload)

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create department')
        }

        this.departments = [response.data, ...this.departments.filter(department => department.id !== response.data?.id)]
        this.departmentsPagination.totalItems = Math.max(this.departments.length, this.departmentsPagination.totalItems + 1)

        if (!this.selectedDepartmentId) {
          this.selectedDepartmentId = response.data.id
        }

        toast.success(response.message || 'Department created successfully')
        return response.data
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to create department')
        toast.error(this.error)
        throw error
      } finally {
        this.departmentsSaving = false
      }
    },

    async updateDepartment(companyId: string, departmentId: string, payload: UpdateDepartmentPayload) {
      const toast = useAppToast()
      this.departmentsSaving = true
      this.error = null

      try {
        const response = await departmentsApi.updateDepartment(companyId, departmentId, payload)

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update department')
        }

        this.departments = this.departments.map(department =>
          department.id === departmentId ? response.data as CompanyDepartmentRecord : department,
        )

        toast.success(response.message || 'Department updated successfully')
        return response.data
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to update department')
        toast.error(this.error)
        throw error
      } finally {
        this.departmentsSaving = false
      }
    },

    async deleteDepartment(companyId: string, departmentId: string) {
      const toast = useAppToast()
      this.departmentsSaving = true
      this.error = null

      try {
        const response = await departmentsApi.deleteDepartment(companyId, departmentId)

        if (!response.success) {
          throw new Error(response.message || 'Failed to delete department')
        }

        this.departments = this.departments.filter(department => department.id !== departmentId)
        this.departmentsPagination.totalItems = Math.max(0, this.departmentsPagination.totalItems - 1)

        if (this.selectedDepartmentId === departmentId) {
          this.selectedDepartmentId = this.departments[0]?.id || null
          this.members = []
          this.assignableEmployees = []

          if (this.selectedDepartmentId) {
            await this.loadDepartmentMembers({
              companyId,
              departmentId: this.selectedDepartmentId,
              page: 0,
              size: this.membersPagination.pageSize,
              search: '',
            })
          }
        }

        toast.success(response.message || 'Department deleted successfully')
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to delete department')
        toast.error(this.error)
        throw error
      } finally {
        this.departmentsSaving = false
      }
    },

    async searchAssignableEmployees(params: {
      companyId: string
      search?: string
      departmentId?: string | null
    }) {
      this.employeesLoading = true
      this.error = null

      try {
        const search = params.search ?? this.employeeSearchQuery
        const response = await departmentsApi.getCompanyProfiles({
          companyId: params.companyId,
          page: 0,
          size: 50,
          search,
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load employees')
        }

        const currentDepartmentId = params.departmentId || this.selectedDepartmentId
        const currentDepartmentMemberIds = currentDepartmentId
          ? new Set(this.members.map(member => member.profileId))
          : new Set<string>()

        const employeeProfiles = (response.data.content || []).filter(profile =>
          isEmployeeRole(profile.role)
          && !currentDepartmentMemberIds.has(profile.id),
        )

        this.employeeSearchQuery = search
        this.assignableEmployees = employeeProfiles
        return employeeProfiles
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to load employees')
        throw error
      } finally {
        this.employeesLoading = false
      }
    },

    async addEmployeesToDepartment(params: {
      companyId: string
      departmentId: string
      profileIds: string[]
    }) {
      const toast = useAppToast()

      if (!params.profileIds.length) {
        return
      }

      this.membersSaving = true
      this.error = null

      try {
        const response = await departmentsApi.addDepartmentMembers(params.companyId, params.departmentId, {
          profileIds: params.profileIds,
        })

        if (!response.success) {
          throw new Error(response.message || 'Failed to assign employees to department')
        }

        await Promise.all([
          this.loadDepartmentMembers({
            companyId: params.companyId,
            departmentId: params.departmentId,
            page: 0,
            size: this.membersPagination.pageSize,
            search: this.membersFilters.search,
          }),
          this.loadDepartments({
            companyId: params.companyId,
            page: this.departmentsPagination.currentPage,
            size: this.departmentsPagination.pageSize,
            search: this.filters.search,
            preserveSelection: true,
          }),
        ])

        toast.success(response.message || 'Employees assigned successfully')
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to assign employees to department')
        toast.error(this.error)
        throw error
      } finally {
        this.membersSaving = false
      }
    },

    async removeEmployeeFromDepartment(params: {
      companyId: string
      departmentId: string
      profileId: string
    }) {
      const toast = useAppToast()
      this.membersSaving = true
      this.error = null

      try {
        const response = await departmentsApi.removeDepartmentMember(
          params.companyId,
          params.departmentId,
          params.profileId,
        )

        if (!response.success) {
          throw new Error(response.message || 'Failed to remove employee from department')
        }

        this.members = this.members.filter(member => member.profileId !== params.profileId)
        this.membersPagination.totalItems = Math.max(0, this.membersPagination.totalItems - 1)
        this.departments = this.departments.map(department => {
          if (department.id !== params.departmentId) {
            return department
          }

          return {
            ...department,
            memberCount: Math.max(0, Number(department.memberCount || 0) - 1),
          }
        })

        toast.success(response.message || 'Employee removed from department')
      } catch (error: any) {
        this.error = normalizeErrorMessage(error, 'Failed to remove employee from department')
        toast.error(this.error)
        throw error
      } finally {
        this.membersSaving = false
      }
    },
  },
})
