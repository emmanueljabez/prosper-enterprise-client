import { defineStore } from 'pinia'
import companyProgramsApi, {
  type CompanyProgramCatalogStageRecord,
  type CompanyProgramMatchingMode,
  type CompanyProgramJourneyActionItemRecord,
  type CompanyProgramJourneyStepRecord,
  type CompanyProgramMentorCandidateRecord,
  type CompanyProgramParticipantRecord,
  type CompanyProgramParticipantStatus,
  type ParticipantConsentStatus,
  type ParticipantConsentType,
  type ParticipantConsentWorkspaceRecord,
  type CompanyProgramRecord,
  type CompanyProgramStatus,
  type CreateCompanyProgramPayload,
  type EmployeeCompanyProgramJourneyRecord,
  type EmployeeCompanyProgramMatchRecord,
  type EmployeeCompanyProgramRecord,
  type JourneyTemplateRecord,
  type MentorAssignmentSummaryRecord,
  type ProsperCatalogProgramRecord,
  type UpdateCompanyProgramPayload,
} from '~/http/requests/app/companyPrograms'
import { useAppToast } from '@/composables/services/toastService'

interface CompanyProgramsState {
  isLoading: boolean
  isSaving: boolean
  error: string | null
  programs: CompanyProgramRecord[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  filters: {
    search: string
    status: CompanyProgramStatus | 'ALL'
    liveOnly: boolean
  }
  journeyTemplatesLoading: boolean
  journeyTemplatesError: string | null
  journeyTemplates: JourneyTemplateRecord[]
  catalogProgramsLoading: boolean
  catalogProgramsError: string | null
  catalogPrograms: ProsperCatalogProgramRecord[]
  participantsLoading: boolean
  participantsSaving: boolean
  participantsError: string | null
  participants: CompanyProgramParticipantRecord[]
  participantsPagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  participantFilters: {
    search: string
    status: CompanyProgramParticipantStatus | 'ALL'
  }
  mentorCandidatesLoading: boolean
  mentorCandidatesError: string | null
  mentorCandidates: CompanyProgramMentorCandidateRecord[]
  mentorAssignmentSaving: boolean
  employeeProgramsLoading: boolean
  employeeProgramsError: string | null
  employeePrograms: EmployeeCompanyProgramRecord[]
  employeeConsentsLoading: boolean
  employeeConsentsError: string | null
  employeeConsents: ParticipantConsentWorkspaceRecord[]
  participantConsentSavingIds: string[]
  employeeMatchesLoading: boolean
  employeeMatchesError: string | null
  employeeMatches: EmployeeCompanyProgramMatchRecord[]
  employeeJourneysLoading: boolean
  employeeJourneysError: string | null
  employeeJourneys: EmployeeCompanyProgramJourneyRecord[]
  journeyActionItemSavingIds: string[]
  journeyStepSavingIds: string[]
}

const defaultPagination = {
  currentPage: 0,
  totalPages: 0,
  totalItems: 0,
  pageSize: 12,
  hasNext: false,
  hasPrevious: false,
}

const defaultParticipantsPagination = {
  currentPage: 0,
  totalPages: 0,
  totalItems: 0,
  pageSize: 20,
  hasNext: false,
  hasPrevious: false,
}

export const useCompanyProgramsStore = defineStore('company-programs', {
  state: (): CompanyProgramsState => ({
    isLoading: false,
    isSaving: false,
    error: null,
    programs: [],
    pagination: { ...defaultPagination },
    filters: {
      search: '',
      status: 'ALL',
      liveOnly: false,
    },
    journeyTemplatesLoading: false,
    journeyTemplatesError: null,
    journeyTemplates: [],
    catalogProgramsLoading: false,
    catalogProgramsError: null,
    catalogPrograms: [],
    participantsLoading: false,
    participantsSaving: false,
    participantsError: null,
    participants: [],
    participantsPagination: { ...defaultParticipantsPagination },
    participantFilters: {
      search: '',
      status: 'ALL',
    },
    mentorCandidatesLoading: false,
    mentorCandidatesError: null,
    mentorCandidates: [],
    mentorAssignmentSaving: false,
    employeeProgramsLoading: false,
    employeeProgramsError: null,
    employeePrograms: [],
    employeeConsentsLoading: false,
    employeeConsentsError: null,
    employeeConsents: [],
    participantConsentSavingIds: [],
    employeeMatchesLoading: false,
    employeeMatchesError: null,
    employeeMatches: [],
    employeeJourneysLoading: false,
    employeeJourneysError: null,
    employeeJourneys: [],
    journeyActionItemSavingIds: [],
    journeyStepSavingIds: [],
  }),

  actions: {
    async loadCompanyPrograms(params: {
      companyId: string
      page?: number
      size?: number
      search?: string
      status?: CompanyProgramStatus | 'ALL'
      liveOnly?: boolean
    }) {
      this.isLoading = true
      this.error = null

      try {
        const page = params.page ?? 0
        const size = params.size ?? this.pagination.pageSize
        const search = params.search ?? this.filters.search
        const status = params.status ?? this.filters.status
        const liveOnly = params.liveOnly ?? this.filters.liveOnly

        const response = await companyProgramsApi.getCompanyPrograms({
          companyId: params.companyId,
          page,
          size,
          search,
          status: status === 'ALL' ? null : status,
          liveOnly,
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load company programs')
        }

        this.programs = response.data.programs
        this.pagination = {
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems,
          pageSize: response.data.pageSize,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious,
        }
        this.filters = {
          search,
          status,
          liveOnly,
        }
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || 'Failed to load company programs'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createCompanyProgram(companyId: string, payload: CreateCompanyProgramPayload) {
      const toast = useAppToast()
      this.isSaving = true
      this.error = null

      try {
        const response = await companyProgramsApi.createCompanyProgram(companyId, payload)

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create company program')
        }

        this.programs = [response.data, ...this.programs]
        this.pagination.totalItems += 1
        toast.success(response.message || 'Company program created successfully')
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || 'Failed to create company program'
        toast.error(this.error)
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async updateCompanyProgram(companyProgramId: string, payload: UpdateCompanyProgramPayload) {
      const toast = useAppToast()
      this.isSaving = true
      this.error = null

      try {
        const response = await companyProgramsApi.updateCompanyProgram(companyProgramId, payload)

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update company program')
        }

        this.upsertProgram(response.data)
        toast.success(response.message || 'Company program updated successfully')
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || 'Failed to update company program'
        toast.error(this.error)
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async loadJourneyTemplates() {
      this.journeyTemplatesLoading = true
      this.journeyTemplatesError = null

      try {
        const response = await companyProgramsApi.getJourneyTemplates()

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load journey templates')
        }

        this.journeyTemplates = response.data.templates
      } catch (error: any) {
        this.journeyTemplatesError = error?.response?.data?.message || error?.message || 'Failed to load journey templates'
        throw error
      } finally {
        this.journeyTemplatesLoading = false
      }
    },

    async loadCatalogPrograms() {
      this.catalogProgramsLoading = true
      this.catalogProgramsError = null

      try {
        const response = await companyProgramsApi.getProsperCatalogPrograms()

        if (!response.success) {
          throw new Error('Failed to load Prosper programs')
        }

        this.catalogPrograms = [...(response.programs || [])].sort((left, right) => {
          const leftOrder = Number(left.orderId ?? 0)
          const rightOrder = Number(right.orderId ?? 0)
          if (leftOrder !== rightOrder) {
            return leftOrder - rightOrder
          }

          return String(left.name || '').localeCompare(String(right.name || ''))
        })
      } catch (error: any) {
        this.catalogProgramsError = error?.response?.data?.message || error?.message || 'Failed to load Prosper programs'
        throw error
      } finally {
        this.catalogProgramsLoading = false
      }
    },

    async updateCompanyProgramStatus(companyProgramId: string, action: 'launch' | 'pause' | 'complete' | 'cancel') {
      const toast = useAppToast()
      this.isSaving = true
      this.error = null

      try {
        const response = await ({
          launch: companyProgramsApi.launchCompanyProgram,
          pause: companyProgramsApi.pauseCompanyProgram,
          complete: companyProgramsApi.completeCompanyProgram,
          cancel: companyProgramsApi.cancelCompanyProgram,
        }[action](companyProgramId))

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update company program')
        }

        this.upsertProgram(response.data)
        toast.success(response.message || 'Company program updated successfully')
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || 'Failed to update company program'
        toast.error(this.error)
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async loadProgramParticipants(params: {
      companyProgramId: string
      page?: number
      size?: number
      search?: string
      status?: CompanyProgramParticipantStatus | 'ALL'
    }) {
      this.participantsLoading = true
      this.participantsError = null

      try {
        const page = params.page ?? 0
        const size = params.size ?? this.participantsPagination.pageSize
        const search = params.search ?? this.participantFilters.search
        const status = params.status ?? this.participantFilters.status

        const response = await companyProgramsApi.getCompanyProgramParticipants({
          companyProgramId: params.companyProgramId,
          page,
          size,
          search,
          status: status === 'ALL' ? null : status,
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load employees')
        }

        this.participants = response.data.participants
        this.participantsPagination = {
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems,
          pageSize: response.data.pageSize,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious,
        }
        this.participantFilters = {
          search,
          status,
        }
      } catch (error: any) {
        this.participantsError = error?.response?.data?.message || error?.message || 'Failed to load employees'
        throw error
      } finally {
        this.participantsLoading = false
      }
    },

    async enrollProgramParticipants(companyProgramId: string, profileIds: string[]) {
      const toast = useAppToast()
      this.participantsSaving = true
      this.participantsError = null

      try {
        const response = await companyProgramsApi.enrollCompanyProgramParticipants(companyProgramId, { profileIds })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to enroll employees')
        }

        const existingParticipantIds = new Set(this.participants.map(participant => participant.id))
        const newParticipants = response.data.enrolledParticipants.filter(participant => !existingParticipantIds.has(participant.id))
        this.participants = [...newParticipants, ...this.participants]
        this.participantsPagination.totalItems = response.data.totalParticipants
        toast.success(response.message || 'Employees enrolled successfully')
        return response.data
      } catch (error: any) {
        this.participantsError = error?.response?.data?.message || error?.message || 'Failed to enroll employees'
        toast.error(this.participantsError)
        throw error
      } finally {
        this.participantsSaving = false
      }
    },

    async loadMentorCandidates(companyProgramId: string, search?: string) {
      this.mentorCandidatesLoading = true
      this.mentorCandidatesError = null

      try {
        const response = await companyProgramsApi.getCompanyProgramMentorCandidates(companyProgramId, search)

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load mentor candidates')
        }

        this.mentorCandidates = response.data.candidates
      } catch (error: any) {
        this.mentorCandidatesError = error?.response?.data?.message || error?.message || 'Failed to load mentor candidates'
        throw error
      } finally {
        this.mentorCandidatesLoading = false
      }
    },

    async removeProgramParticipant(participantId: string) {
      const toast = useAppToast()
      this.participantsSaving = true
      this.participantsError = null

      try {
        const response = await companyProgramsApi.removeCompanyProgramParticipant(participantId)

        if (!response.success) {
          throw new Error(response.message || 'Failed to remove employee')
        }

        this.participants = this.participants.filter(participant => participant.id !== participantId)
        this.participantsPagination.totalItems = Math.max(this.participantsPagination.totalItems - 1, 0)
        toast.success(response.message || 'Employee removed successfully')
      } catch (error: any) {
        this.participantsError = error?.response?.data?.message || error?.message || 'Failed to remove employee'
        toast.error(this.participantsError)
        throw error
      } finally {
        this.participantsSaving = false
      }
    },

    async assignMentorToParticipant(participantId: string, mentorId: string) {
      const toast = useAppToast()
      this.mentorAssignmentSaving = true
      this.mentorCandidatesError = null

      try {
        const response = await companyProgramsApi.assignMentorToParticipant(participantId, { mentorId })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to assign mentor')
        }

        this.applyMentorAssignment(participantId, response.data)
        toast.success(response.message || 'Mentor assigned successfully')
        return response.data
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Failed to assign mentor'
        this.mentorCandidatesError = message
        toast.error(message)
        throw error
      } finally {
        this.mentorAssignmentSaving = false
      }
    },

    async removeParticipantMentorAssignment(participantId: string) {
      const toast = useAppToast()
      this.mentorAssignmentSaving = true
      this.mentorCandidatesError = null

      try {
        const response = await companyProgramsApi.removeMentorAssignment(participantId)

        if (!response.success) {
          throw new Error(response.message || 'Failed to remove mentor assignment')
        }

        this.applyMentorAssignment(participantId, null)
        toast.success(response.message || 'Mentor assignment removed successfully')
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Failed to remove mentor assignment'
        this.mentorCandidatesError = message
        toast.error(message)
        throw error
      } finally {
        this.mentorAssignmentSaving = false
      }
    },

    async loadMyCompanyPrograms() {
      this.employeeProgramsLoading = true
      this.employeeProgramsError = null

      try {
        const response = await companyProgramsApi.getMyCompanyPrograms()

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load your company programs')
        }

        this.employeePrograms = response.data.programs
      } catch (error: any) {
        this.employeeProgramsError = error?.response?.data?.message || error?.message || 'Failed to load your company programs'
        throw error
      } finally {
        this.employeeProgramsLoading = false
      }
    },

    async loadMyCompanyProgramConsents() {
      this.employeeConsentsLoading = true
      this.employeeConsentsError = null

      try {
        const response = await companyProgramsApi.getMyCompanyProgramConsents()

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load your company program consents')
        }

        this.employeeConsents = response.data.consents
        this.applyConsentWorkspaces(response.data.consents)
      } catch (error: any) {
        this.employeeConsentsError = error?.response?.data?.message || error?.message || 'Failed to load your company program consents'
        throw error
      } finally {
        this.employeeConsentsLoading = false
      }
    },

    async updateParticipantConsent(participantId: string, consentType: ParticipantConsentType, status: ParticipantConsentStatus) {
      const toast = useAppToast()
      this.participantConsentSavingIds = [...this.participantConsentSavingIds, participantId]
      this.employeeConsentsError = null
      this.participantsError = null

      try {
        const response = await companyProgramsApi.updateParticipantConsent(participantId, {
          consentType,
          status,
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update employee consent')
        }

        this.applyConsentWorkspace(response.data)
        toast.success(response.message || 'Consent updated successfully')
        return response.data
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Failed to update employee consent'
        this.employeeConsentsError = message
        this.participantsError = message
        toast.error(message)
        throw error
      } finally {
        this.participantConsentSavingIds = this.participantConsentSavingIds.filter(id => id !== participantId)
      }
    },

    async loadMyCompanyProgramMatches() {
      this.employeeMatchesLoading = true
      this.employeeMatchesError = null

      try {
        const response = await companyProgramsApi.getMyCompanyProgramMatches()

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load your mentor matches')
        }

        this.employeeMatches = response.data.matches
      } catch (error: any) {
        this.employeeMatchesError = error?.response?.data?.message || error?.message || 'Failed to load your mentor matches'
        throw error
      } finally {
        this.employeeMatchesLoading = false
      }
    },

    async loadMyCompanyProgramJourneys() {
      this.employeeJourneysLoading = true
      this.employeeJourneysError = null

      try {
        const response = await companyProgramsApi.getMyCompanyProgramJourneys()

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load your company program journeys')
        }

        this.employeeJourneys = response.data.journeys
      } catch (error: any) {
        this.employeeJourneysError = error?.response?.data?.message || error?.message || 'Failed to load your company program journeys'
        throw error
      } finally {
        this.employeeJourneysLoading = false
      }
    },

    async updateJourneyActionItem(actionItemId: string, completed: boolean) {
      const toast = useAppToast()
      this.journeyActionItemSavingIds = [...this.journeyActionItemSavingIds, actionItemId]
      this.employeeJourneysError = null

      try {
        const response = await companyProgramsApi.updateMyJourneyActionItem(actionItemId, { completed })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update journey action item')
        }

        this.applyJourneyActionItemUpdate(response.data)
        toast.success(response.message || 'Journey action item updated')
        return response.data
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Failed to update journey action item'
        this.employeeJourneysError = message
        toast.error(message)
        throw error
      } finally {
        this.journeyActionItemSavingIds = this.journeyActionItemSavingIds.filter(id => id !== actionItemId)
      }
    },

    async completeJourneyStep(journeyInstanceStepId: string) {
      const toast = useAppToast()
      this.journeyStepSavingIds = [...this.journeyStepSavingIds, journeyInstanceStepId]
      this.employeeJourneysError = null

      try {
        const response = await companyProgramsApi.completeMyJourneyStep(journeyInstanceStepId)

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to complete journey step')
        }

        await this.loadMyCompanyProgramJourneys()
        toast.success(response.message || 'Journey step completed')
        return response.data
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Failed to complete journey step'
        this.employeeJourneysError = message
        toast.error(message)
        throw error
      } finally {
        this.journeyStepSavingIds = this.journeyStepSavingIds.filter(id => id !== journeyInstanceStepId)
      }
    },

    clearParticipantsState() {
      this.participants = []
      this.participantsError = null
      this.participantsPagination = { ...defaultParticipantsPagination }
      this.participantFilters = {
        search: '',
        status: 'ALL',
      }
      this.mentorCandidates = []
      this.mentorCandidatesError = null
    },

    applyConsentWorkspaces(workspaces: ParticipantConsentWorkspaceRecord[]) {
      const byParticipantId = new Map(workspaces.map(workspace => [workspace.participantId, workspace]))

      this.employeeConsents = workspaces
      this.employeePrograms = this.employeePrograms.map(program => {
        const workspace = byParticipantId.get(program.participantId)
        return workspace
          ? {
              ...program,
              participantStatus: workspace.participantStatus,
              consentSummary: workspace.summary,
            }
          : program
      })

      this.participants = this.participants.map(participant => {
        const workspace = byParticipantId.get(participant.id)
        return workspace
          ? {
              ...participant,
              status: workspace.participantStatus,
              consentSummary: workspace.summary,
            }
          : participant
      })
    },

    applyConsentWorkspace(workspace: ParticipantConsentWorkspaceRecord) {
      const existingIndex = this.employeeConsents.findIndex(item => item.participantId === workspace.participantId)
      if (existingIndex === -1) {
        this.employeeConsents = [workspace, ...this.employeeConsents]
      } else {
        const next = [...this.employeeConsents]
        next[existingIndex] = workspace
        this.employeeConsents = next
      }

      this.employeePrograms = this.employeePrograms.map(program =>
        program.participantId === workspace.participantId
          ? {
              ...program,
              participantStatus: workspace.participantStatus,
              consentSummary: workspace.summary,
            }
          : program,
      )

      this.participants = this.participants.map(participant =>
        participant.id === workspace.participantId
          ? {
              ...participant,
              status: workspace.participantStatus,
              consentSummary: workspace.summary,
            }
          : participant,
      )
    },

    applyJourneyActionItemUpdate(actionItem: CompanyProgramJourneyActionItemRecord) {
      this.employeeJourneys = this.employeeJourneys.map(journey => {
        const actionItems = journey.actionItems.map(item =>
          item.actionItemId === actionItem.actionItemId ? actionItem : item,
        )

        if (!actionItems.some(item => item.actionItemId === actionItem.actionItemId)) {
          return journey
        }

        const openActionItemCount = actionItems.filter(item => !item.completed).length
        const completedActionItemCount = actionItems.length - openActionItemCount

        return {
          ...journey,
          actionItems,
          openActionItemCount,
          completedActionItemCount,
        }
      })
    },

    applyJourneyStepUpdate(step: CompanyProgramJourneyStepRecord) {
      this.employeeJourneys = this.employeeJourneys.map(journey => {
        const steps = journey.steps.map(existing =>
          existing.journeyInstanceStepId === step.journeyInstanceStepId ? step : existing,
        )

        if (!steps.some(existing => existing.journeyInstanceStepId === step.journeyInstanceStepId)) {
          return journey
        }

        const completedJourneySteps = steps.filter(existing => ['COMPLETED', 'SKIPPED'].includes(existing.status)).length
        const readyJourneySteps = steps.filter(existing => existing.status === 'READY').length
        const progressPercent = steps.length
          ? Math.round((completedJourneySteps * 100) / steps.length)
          : journey.progressPercent

        return {
          ...journey,
          steps,
          completedJourneySteps,
          readyJourneySteps,
          progressPercent,
          journeyStatus: completedJourneySteps >= steps.length ? 'COMPLETED' : 'IN_PROGRESS',
        }
      })
    },

    applyMentorAssignment(participantId: string, mentorAssignment: MentorAssignmentSummaryRecord | null) {
      const participant = this.participants.find(item => item.id === participantId)
      if (participant) {
        participant.mentorAssignment = mentorAssignment
      }
    },

    upsertProgram(program: CompanyProgramRecord) {
      const index = this.programs.findIndex(item => item.id === program.id)
      if (index === -1) {
        this.programs.unshift(program)
        return
      }

      this.programs.splice(index, 1, program)
    },

    matchingModeLabel(value: CompanyProgramMatchingMode) {
      switch (value) {
        case 'ADMIN_ASSIGN':
          return 'Admin assign'
        case 'EMPLOYEE_SELECT':
          return 'Employee select'
        case 'SYSTEM_ASSIGN':
          return 'System assign'
        default:
          return value
      }
    },

    participantStatusLabel(value: CompanyProgramParticipantStatus) {
      switch (value) {
        case 'ENROLLED':
          return 'Enrolled'
        case 'ACTIVE':
          return 'Active'
        case 'COMPLETED':
          return 'Completed'
        case 'WITHDRAWN':
          return 'Withdrawn'
        default:
          return value
      }
    },

    mentorCandidateSourceLabel(value?: string | null) {
      switch (value) {
        case 'PROGRAM_POOL':
          return 'Program pool'
        case 'GLOBAL_POOL':
          return 'Global pool'
        default:
          return value || 'Candidate'
      }
    },

    catalogJourneyLabel(stages?: CompanyProgramCatalogStageRecord[] | null, fallback?: string | null) {
      if (stages?.length) {
        return stages
          .map(stage => stage.programName || `Stage ${stage.journeyOrder}`)
          .join(' -> ')
      }

      return fallback || 'No Prosper program journey selected'
    },

    catalogMentorCount(program?: ProsperCatalogProgramRecord | null) {
      return Array.isArray(program?.mentors) ? program?.mentors?.length || 0 : 0
    },

    isJourneyActionItemSaving(actionItemId: string) {
      return this.journeyActionItemSavingIds.includes(actionItemId)
    },

    isJourneyStepSaving(journeyInstanceStepId: string) {
      return this.journeyStepSavingIds.includes(journeyInstanceStepId)
    },
  },
})
