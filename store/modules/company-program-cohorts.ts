import { defineStore } from 'pinia'
import companyProgramCohortsApi, {
  type AddCohortRosterParticipantsPayload,
  type CircleSuggestionResultRecord,
  type CohortDashboardRecord,
  type CohortSelfJoinPayload,
  type CohortSelfJoinRecord,
  type CommonInterestCircleRecord,
  type ConfirmJoinRequestPayload,
  type CompanyProgramCohortJoinRequestRecord,
  type CompanyProgramCohortParticipantRecord,
  type CompanyProgramCohortRecord,
  type CreateCirclePayload,
  type CreateCompanyProgramCohortPayload,
  type EmployeeCompanyProgramCohortRecord,
  type MoveMembershipPayload,
  type PlaceParticipantPayload,
  type RecordPlenaryAttendancePayload,
  type RequestCirclePayload,
  type ResolveDuplicatePayload,
  type UpdateCirclePayload,
  type UpdateCompanyProgramCohortPayload,
} from '~/http/requests/app/companyProgramCohorts'

interface CompanyProgramCohortsState {
  isLoading: boolean
  isSaving: boolean
  error: string | null
  cohorts: CompanyProgramCohortRecord[]
  selectedCohort: CompanyProgramCohortRecord | null
  participants: CompanyProgramCohortParticipantRecord[]
  joinRequests: CompanyProgramCohortJoinRequestRecord[]
  circles: CommonInterestCircleRecord[]
  suggestions: CircleSuggestionResultRecord | null
  dashboard: CohortDashboardRecord | null
  employeeCohorts: EmployeeCompanyProgramCohortRecord[]
  selectedEmployeeCohort: EmployeeCompanyProgramCohortRecord | null
  employeeCircles: CommonInterestCircleRecord[]
  joinPreview: CohortSelfJoinRecord | null
}

function errorMessage(error: any, fallback: string) {
  return error?.response?.data?.message || error?.message || fallback
}

export const useCompanyProgramCohortsStore = defineStore('company-program-cohorts', {
  state: (): CompanyProgramCohortsState => ({
    isLoading: false,
    isSaving: false,
    error: null,
    cohorts: [],
    selectedCohort: null,
    participants: [],
    joinRequests: [],
    circles: [],
    suggestions: null,
    dashboard: null,
    employeeCohorts: [],
    selectedEmployeeCohort: null,
    employeeCircles: [],
    joinPreview: null,
  }),

  actions: {
    async loadCohorts(companyProgramId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.getCohorts(companyProgramId)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load cohorts')
        }
        this.cohorts = response.data.cohorts
        return response.data.cohorts
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to load cohorts')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async loadCohort(cohortId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.getCohort(cohortId)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load cohort')
        }
        this.selectedCohort = response.data
        this.upsertCohort(response.data)
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to load cohort')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createCohort(companyProgramId: string, payload: CreateCompanyProgramCohortPayload) {
      this.isSaving = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.createCohort(companyProgramId, payload)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create cohort')
        }
        this.cohorts = [response.data, ...this.cohorts]
        this.selectedCohort = response.data
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to create cohort')
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async updateCohort(cohortId: string, payload: UpdateCompanyProgramCohortPayload) {
      this.isSaving = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.updateCohort(cohortId, payload)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update cohort')
        }
        this.upsertCohort(response.data)
        this.selectedCohort = response.data
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to update cohort')
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async openIntake(cohortId: string) {
      return this.updateCohortFromAction(() => companyProgramCohortsApi.openIntake(cohortId), 'Failed to open cohort intake')
    },

    async closeIntake(cohortId: string) {
      return this.updateCohortFromAction(() => companyProgramCohortsApi.closeIntake(cohortId), 'Failed to close cohort intake')
    },

    async loadJoinPreview(joinCode: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.getJoinPreview(joinCode)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load cohort join preview')
        }
        this.joinPreview = response.data
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to load cohort join preview')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async submitSelfJoin(joinCode: string, payload: CohortSelfJoinPayload) {
      this.isSaving = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.submitSelfJoin(joinCode, payload)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to submit cohort join request')
        }
        this.joinPreview = response.data
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to submit cohort join request')
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async loadParticipants(cohortId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.getParticipants(cohortId)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load cohort participants')
        }
        this.participants = response.data.participants
        return response.data.participants
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to load cohort participants')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async addRosterParticipants(cohortId: string, payload: AddCohortRosterParticipantsPayload) {
      this.isSaving = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.addRosterParticipants(cohortId, payload)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to add cohort roster participants')
        }
        for (const participant of response.data.participants || []) {
          this.upsertParticipant(participant)
        }
        return response.data.participants
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to add cohort roster participants')
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async confirmParticipant(participantId: string) {
      return this.updateParticipantFromAction(
        () => companyProgramCohortsApi.confirmParticipant(participantId),
        'Failed to confirm cohort participant',
      )
    },

    async loadJoinRequests(cohortId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.getJoinRequests(cohortId)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load cohort join requests')
        }
        this.joinRequests = response.data.joinRequests
        return response.data.joinRequests
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to load cohort join requests')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async confirmJoinRequest(joinRequestId: string, payload: ConfirmJoinRequestPayload) {
      this.isSaving = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.confirmJoinRequest(joinRequestId, payload)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to confirm cohort join request')
        }
        this.joinRequests = this.joinRequests.filter(joinRequest => joinRequest.id !== joinRequestId)
        this.upsertParticipant(response.data)
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to confirm cohort join request')
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async rejectJoinRequest(joinRequestId: string) {
      this.isSaving = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.rejectJoinRequest(joinRequestId)
        if (!response.success) {
          throw new Error(response.message || 'Failed to reject cohort join request')
        }
        this.joinRequests = this.joinRequests.filter(joinRequest => joinRequest.id !== joinRequestId)
        if (response.data) {
          this.upsertParticipant(response.data)
        }
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to reject cohort join request')
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async rejectParticipant(participantId: string) {
      return this.updateParticipantFromAction(
        () => companyProgramCohortsApi.rejectParticipant(participantId),
        'Failed to reject cohort participant',
      )
    },

    async resolveDuplicate(participantId: string, payload: ResolveDuplicatePayload) {
      return this.updateParticipantFromAction(
        () => companyProgramCohortsApi.resolveDuplicate(participantId, payload),
        'Failed to resolve cohort duplicate',
      )
    },

    async recordPlenaryAttendance(participantId: string, payload: RecordPlenaryAttendancePayload) {
      return this.updateParticipantFromAction(
        () => companyProgramCohortsApi.recordPlenaryAttendance(participantId, payload),
        'Failed to record plenary attendance',
      )
    },

    async loadCircles(cohortId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.getCircles(cohortId)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load cohort circles')
        }
        this.circles = response.data.circles
        return response.data.circles
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to load cohort circles')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createCircle(cohortId: string, payload: CreateCirclePayload) {
      this.isSaving = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.createCircle(cohortId, payload)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create circle')
        }
        this.upsertCircle(response.data)
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to create circle')
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async updateCircle(circleId: string, payload: UpdateCirclePayload) {
      this.isSaving = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.updateCircle(circleId, payload)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update circle')
        }
        this.upsertCircle(response.data)
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to update circle')
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async suggestCircles(cohortId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.suggestCircles(cohortId)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to suggest circles')
        }
        this.suggestions = response.data
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to suggest circles')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async placeParticipant(circleId: string, payload: PlaceParticipantPayload) {
      return this.updateCircleFromAction(
        () => companyProgramCohortsApi.placeParticipant(circleId, payload),
        'Failed to place cohort participant',
      )
    },

    async removeMembership(membershipId: string) {
      return this.updateCircleFromAction(
        () => companyProgramCohortsApi.removeMembership(membershipId),
        'Failed to remove circle membership',
      )
    },

    async moveMembership(membershipId: string, payload: MoveMembershipPayload) {
      return this.updateCircleFromAction(
        () => companyProgramCohortsApi.moveMembership(membershipId, payload),
        'Failed to move circle membership',
      )
    },

    async finalizeCircles(cohortId: string) {
      this.isSaving = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.finalizeCircles(cohortId)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to finalize circles')
        }
        this.circles = response.data.circles
        return response.data.circles
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to finalize circles')
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async loadDashboard(cohortId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.getDashboard(cohortId)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load cohort dashboard')
        }
        this.dashboard = response.data
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to load cohort dashboard')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async loadEmployeeCohorts() {
      this.isLoading = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.getMyCohorts()
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load employee cohorts')
        }
        this.employeeCohorts = response.data.cohorts
        return response.data.cohorts
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to load employee cohorts')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async loadEmployeeCohort(cohortId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.getMyCohort(cohortId)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load employee cohort')
        }
        this.selectedEmployeeCohort = response.data
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to load employee cohort')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async loadEmployeeCohortCircles(cohortId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.getMyCohortCircles(cohortId)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load cohort circles')
        }
        this.employeeCircles = response.data.circles
        return response.data.circles
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to load cohort circles')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async requestCircle(cohortId: string, payload: RequestCirclePayload) {
      this.isSaving = true
      this.error = null

      try {
        const response = await companyProgramCohortsApi.requestCircle(cohortId, payload)
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to request circle')
        }
        this.selectedEmployeeCohort = response.data
        this.upsertEmployeeCohort(response.data)
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, 'Failed to request circle')
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async updateCohortFromAction(action: () => Promise<any>, fallback: string) {
      this.isSaving = true
      this.error = null

      try {
        const response = await action()
        if (!response.success || !response.data) {
          throw new Error(response.message || fallback)
        }
        this.upsertCohort(response.data)
        this.selectedCohort = response.data
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, fallback)
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async updateParticipantFromAction(action: () => Promise<any>, fallback: string) {
      this.isSaving = true
      this.error = null

      try {
        const response = await action()
        if (!response.success || !response.data) {
          throw new Error(response.message || fallback)
        }
        this.upsertParticipant(response.data)
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, fallback)
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async updateCircleFromAction(action: () => Promise<any>, fallback: string) {
      this.isSaving = true
      this.error = null

      try {
        const response = await action()
        if (!response.success || !response.data) {
          throw new Error(response.message || fallback)
        }
        this.upsertCircle(response.data)
        return response.data
      } catch (error: any) {
        this.error = errorMessage(error, fallback)
        throw error
      } finally {
        this.isSaving = false
      }
    },

    upsertCohort(cohort: CompanyProgramCohortRecord) {
      const index = this.cohorts.findIndex(existing => existing.id === cohort.id)
      if (index === -1) {
        this.cohorts = [cohort, ...this.cohorts]
        return
      }
      const next = [...this.cohorts]
      next[index] = cohort
      this.cohorts = next
    },

    upsertParticipant(participant: CompanyProgramCohortParticipantRecord) {
      const index = this.participants.findIndex(existing => existing.id === participant.id)
      if (index === -1) {
        this.participants = [participant, ...this.participants]
        return
      }
      const next = [...this.participants]
      next[index] = participant
      this.participants = next
    },

    upsertCircle(circle: CommonInterestCircleRecord) {
      const index = this.circles.findIndex(existing => existing.id === circle.id)
      if (index === -1) {
        this.circles = [circle, ...this.circles]
        return
      }
      const next = [...this.circles]
      next[index] = circle
      this.circles = next
    },

    upsertEmployeeCohort(cohort: EmployeeCompanyProgramCohortRecord) {
      const index = this.employeeCohorts.findIndex(existing => existing.cohortId === cohort.cohortId)
      if (index === -1) {
        this.employeeCohorts = [cohort, ...this.employeeCohorts]
        return
      }
      const next = [...this.employeeCohorts]
      next[index] = cohort
      this.employeeCohorts = next
    },
  },
})
