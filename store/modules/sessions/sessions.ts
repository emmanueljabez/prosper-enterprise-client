import { defineStore } from 'pinia';
import sessionsApi from '~/http/requests/app/sessions/sessions';
import { useAppToast } from '@/composables/services/toastService';

import type {
  LocationState,
  LocationStats,
  Warehouse,
  Zone,
  Aisle,
  Shelf,
  WarehouseHierarchy,
  WarehouseLocationNode,
  CreateMainWarehouseRequest,
  CreateZoneRequest,
  CreateAisleRequest,
  CreateShelfRequest,
  UpdateWarehouseRequest,
  DeactivateWarehouseRequest,
  WarehouseQueryParams,
  PaginatedResponse,
  ApiResponse
} from '@/types/inventory/location';

// Session types
interface SessionData {
  id: string
  mentorId: string
  menteeId: string
  skillId: string
  title: string
  description: string
  scheduledStart: string
  scheduledEnd: string
  status: 'PENDING' | 'CONFIRMED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  meetingPlatform: string
  meetingUrl: string | null
  meetingId: string | null
  meetingPassword: string | null
  notes: string | null
  rating: number | null
  feedback: string | null
  price: number | null
  currency: string
  paymentStatus: string
  paid: boolean
  reminderSent: boolean
  menteeMessage: string | null
  companyProgramId?: string | null
  companyProgramParticipantId?: string | null
  companyProgramName?: string | null
  outcome?: SessionOutcomeData | null
  mentorResponse: string | null
  calendarEventId: string | null
  confirmedAt: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  cancelledBy: string | null
  menteeNotificationSent: boolean
  mentorNotificationSent: boolean
  mentor: any | null
  mentee: any | null
  skill: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  } | null
  createdAt: string
  updatedAt: string
  futureSession: boolean
  durationMinutes: number
}

interface ConfirmSessionPayload {
  mentorResponse?: string
  scheduledStart?: string
}

interface CreateSessionPayload {
  mentorId: string
  menteeId: string
  skillId: string
  scheduledStart: string
  meetingPlatform?: string
  menteeMessage?: string | null
  companyProgramId?: string | null
  companyProgramParticipantId?: string | null
}

interface SessionOutcomeActionItemData {
  id: string
  description: string
  ownerType: 'MENTEE' | 'MENTOR' | 'SHARED'
  dueAt?: string | null
  completedAt?: string | null
  completed: boolean
}

interface SessionOutcomeData {
  id: string
  summary?: string | null
  reflectionPrompt?: string | null
  recordedAt?: string | null
  openActionItemCount?: number | null
  actionItems?: SessionOutcomeActionItemData[]
}

interface CompleteSessionPayload {
  outcomeSummary?: string | null
  reflectionPrompt?: string | null
  mentorPrivateNotes?: string | null
  actionItems?: Array<{
    description: string
    ownerType?: 'MENTEE' | 'MENTOR' | 'SHARED'
    dueAt?: string | null
  }>
}

interface SessionsState extends LocationState {
  sessions: SessionData[]
  currentFilter: 'all' | 'today' | 'upcoming' | 'past'
  pagination: {
    currentPage: number
    totalPages: number
    totalSessions: number
    hasNext: boolean
    hasPrevious: boolean
    pageSize: number
  }
}

// Determine if we're in development environment
const config = useRuntimeConfig()
const environment = config.public.nodeEnv
const isDev = environment === 'development';

export const useSessionsStore = defineStore('sessions', {
  state: (): SessionsState => ({
    // Warehouse management - primary data structure (legacy)
    warehouses: [],
    paginatedWarehouses: null,
    selectedWarehouse: null,
    warehouseHierarchy: null,
    locationTreeStructure: [],
    zones: [],
    aisles: [],
    shelves: [],

    // Sessions management
    sessions: [],
    currentFilter: 'all',
    pagination: {
      currentPage: 0,
      totalPages: 0,
      totalSessions: 0,
      hasNext: false,
      hasPrevious: false,
      pageSize: 10
    },

    isLoading: false,
    error: null,
    useMockData: isDev, // Default to mock data in development
    locationStats: {
      warehouses: 0,
      zones: 0,
      zonesInUse: 0,
      aisles: 0,
      bins: 0,
      binsInUse: 0,
      totalCapacity: 0,
      itemsStored: 0,
      sites: 0
    } as LocationStats
  }),

  getters: {
    sessionStats: (state) => {
      const all = state.sessions
      const today = all.filter(s => {
        const sessionDate = new Date(s.scheduledStart)
        const now = new Date()
        return sessionDate.toDateString() === now.toDateString()
      })
      const upcoming = all.filter(s => {
        const sessionDate = new Date(s.scheduledStart)
        const now = new Date()
        return sessionDate > now && !['CANCELLED', 'COMPLETED'].includes(s.status)
      })
      const completed = all.filter(s => s.status === 'COMPLETED')

      return {
        total: all.length,
        today: today.length,
        upcoming: upcoming.length,
        completed: completed.length
      }
    }
  },

  actions: {
    // Session booking
    createSession(sessionData: CreateSessionPayload) {
      console.log("Saving session data")
      this.isLoading = true;
      this.error = null;
      return new Promise((resolve, reject) => {
        sessionsApi.createSession(sessionData)
          .then(response => {
            resolve(response.data);
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while creating session.';
            reject(error);
          });
      });
    },

    // Load sessions
    async loadSessions(params: {
      menteeId: string
      filter?: 'all' | 'today' | 'upcoming' | 'past'
      page?: number
      size?: number
    }) {
      const toast = useAppToast()
      this.isLoading = true
      this.error = null

      try {
        const filter = params.filter || this.currentFilter
        const page = params.page ?? 0
        const size = params.size ?? this.pagination.pageSize

        this.currentFilter = filter

        const response = await sessionsApi.getMenteeSessions({
          menteeId: params.menteeId,
          filter,
          page,
          size
        })

        if (response.data.success) {
          // For first page, replace sessions. For subsequent pages, append
          if (page === 0) {
            this.sessions = response.data.data.sessions
          } else {
            this.sessions.push(...response.data.data.sessions)
          }

          this.pagination = {
            currentPage: response.data.data.currentPage,
            totalPages: response.data.data.totalPages,
            totalSessions: response.data.data.totalSessions,
            hasNext: response.data.data.hasNext,
            hasPrevious: response.data.data.hasPrevious,
            pageSize: size
          }
        }
      } catch (err: any) {
        console.error('Error loading sessions:', err)
        this.error = 'Failed to load sessions. Please try again.'
        toast.error('Failed to load sessions')
      } finally {
        this.isLoading = false
      }
    },

    async loadMoreSessions(menteeId: string) {
      if (!this.pagination.hasNext || this.isLoading) {
        return
      }

      const toast = useAppToast()
      this.isLoading = true

      try {
        const nextPage = this.pagination.currentPage + 1
        const response = await sessionsApi.getMenteeSessions({
          menteeId,
          filter: this.currentFilter,
          page: nextPage,
          size: this.pagination.pageSize
        })

        if (response.data.success) {
          this.sessions.push(...response.data.data.sessions)

          this.pagination = {
            currentPage: response.data.data.currentPage,
            totalPages: response.data.data.totalPages,
            totalSessions: response.data.data.totalSessions,
            hasNext: response.data.data.hasNext,
            hasPrevious: response.data.data.hasPrevious,
            pageSize: this.pagination.pageSize
          }
        }
      } catch (err: any) {
        console.error('Error loading more sessions:', err)
        toast.error('Failed to load more sessions')
      } finally {
        this.isLoading = false
      }
    },

    async changeFilter(menteeId: string, filter: 'all' | 'today' | 'upcoming' | 'past') {
      this.currentFilter = filter
      await this.loadSessions({
        menteeId,
        filter,
        page: 0,
        size: this.pagination.pageSize
      })
    },

    clearSessions() {
      this.sessions = []
      this.error = null
      this.currentFilter = 'all'
      this.pagination = {
        currentPage: 0,
        totalPages: 0,
        totalSessions: 0,
        hasNext: false,
        hasPrevious: false,
        pageSize: 10
      }
    },

    // Get session by ID
    async getSessionById(sessionId: string) {
      const toast = useAppToast()
      this.isLoading = true
      this.error = null

      try {
        const response = await sessionsApi.getSessionById(sessionId)
        return response.data
      } catch (err: any) {
        console.error('Error loading session:', err)
        this.error = 'Failed to load session details. Please try again.'
        toast.error('Failed to load session details')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    // Confirm session
    async confirmSession(sessionId: string, payload: ConfirmSessionPayload = {}) {
      const toast = useAppToast()
      this.isLoading = true
      this.error = null

      try {
        const response = await sessionsApi.confirmSession(sessionId, payload)
        toast.success('Session confirmed successfully!')
        return response.data
      } catch (err: any) {
        console.error('Error confirming session:', err)
        const errorMessage = err.response?.data?.message || 'Failed to confirm session. Please try again.'
        this.error = errorMessage
        toast.error(errorMessage)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    // Decline session
    async declineSession(sessionId: string, reason?: string) {
      const toast = useAppToast()
      this.isLoading = true
      this.error = null

      try {
        const response = await sessionsApi.declineSession(sessionId, reason)
        toast.success('Session declined successfully')
        return response.data
      } catch (err: any) {
        console.error('Error declining session:', err)
        const errorMessage = err.response?.data?.message || 'Failed to decline session. Please try again.'
        this.error = errorMessage
        toast.error(errorMessage)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async completeSession(sessionId: string, payload: CompleteSessionPayload = {}) {
      const toast = useAppToast()
      this.isLoading = true
      this.error = null

      try {
        const response = await sessionsApi.completeSession(sessionId, payload)
        const updatedSession = response.data?.data

        if (updatedSession?.id) {
          const sessionIndex = this.sessions.findIndex(session => session.id === updatedSession.id)
          if (sessionIndex !== -1) {
            this.sessions[sessionIndex] = {
              ...this.sessions[sessionIndex],
              ...updatedSession
            }
          }
        }

        toast.success('Session marked as completed. Feedback request sent.')
        return response.data
      } catch (err: any) {
        console.error('Error completing session:', err)
        const errorMessage = err.response?.data?.message || 'Failed to mark session as completed. Please try again.'
        this.error = errorMessage
        toast.error(errorMessage)
        throw err
      } finally {
        this.isLoading = false
      }
    }
  }
});
