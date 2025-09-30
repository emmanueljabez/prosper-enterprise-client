import { defineStore } from 'pinia'
import type { 
  CalendarState, 
  CalendarIntegration, 
  CalendarEvent, 
  CalendarSyncData, 
  CreateCalendarEventData,
  GoogleCalendarProvider 
} from '@/types/calendar'
import calendarApi from '@/http/requests/calendar'

export const useCalendarStore = defineStore('calendar', {
  state: (): CalendarState => ({
    integrations: [],
    events: [],
    loading: false,
    error: null,
    syncInProgress: false
  }),

  getters: {
    hasGoogleCalendarIntegration: (state) => 
      state.integrations.some(integration => 
        integration.provider === 'google-calendar' && integration.isActive
      ),
    
    activeIntegrations: (state) => 
      state.integrations.filter(integration => integration.isActive),
    
    googleCalendarIntegration: (state) => 
      state.integrations.find(integration => 
        integration.provider === 'google-calendar' && integration.isActive
      ),

    upcomingEvents: (state) => {
      const now = new Date()
      return state.events
        .filter(event => new Date(event.startTime) > now)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    }
  },

  actions: {
    // Initialize Google Calendar OAuth
    async initiateGoogleCalendarAuth() {
      try {
        this.loading = true
        this.error = null

        const googleCalendarProvider: GoogleCalendarProvider = {
          id: 'google-calendar',
          name: 'Google Calendar',
          clientId: process.env.GOOGLE_CLIENT_ID || "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
          redirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'http://localhost:3000/auth/callback/google-calendar',
          scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
          ]
        }

        const params = new URLSearchParams({
          client_id: googleCalendarProvider.clientId,
          redirect_uri: googleCalendarProvider.redirectUri,
          scope: googleCalendarProvider.scopes.join(' '),
          response_type: 'code',
          access_type: 'offline',
          prompt: 'consent',
          state: `calendar_auth_${Date.now()}`
        })

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
        window.location.href = authUrl
      } catch (error: any) {
        this.error = error.message || 'Failed to initiate Google Calendar authentication'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Connect calendar after OAuth callback
    async connectCalendar(calendarData: CalendarSyncData) {
      try {
        this.loading = true
        this.error = null

        const response = await calendarApi.connectCalendar(calendarData)
        
        if (response?.data) {
          const integration: CalendarIntegration = response.data
          
          // Add or update integration
          const existingIndex = this.integrations.findIndex(
            int => int.provider === integration.provider && int.userId === integration.userId
          )
          
          if (existingIndex >= 0) {
            this.integrations[existingIndex] = integration
          } else {
            this.integrations.push(integration)
          }

          // Sync events after connecting
          await this.syncCalendarEvents(integration.id)
          
          return integration
        }
        
        throw new Error('Invalid calendar connection response')
      } catch (error: any) {
        this.error = error.message || 'Failed to connect calendar'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Disconnect calendar integration
    async disconnectCalendar(integrationId: string) {
      try {
        this.loading = true
        this.error = null

        await calendarApi.disconnectCalendar(integrationId)
        
        // Remove from local state
        this.integrations = this.integrations.filter(
          integration => integration.id !== integrationId
        )
        
        // Remove associated events
        this.events = this.events.filter(
          event => event.calendarId !== integrationId
        )
      } catch (error: any) {
        this.error = error.message || 'Failed to disconnect calendar'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Load calendar integrations
    async loadCalendarIntegrations() {
      try {
        this.loading = true
        this.error = null

        const response = await calendarApi.getCalendarIntegrations()
        
        if (response?.data) {
          this.integrations = response.data
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to load calendar integrations'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Sync calendar events
    async syncCalendarEvents(integrationId: string) {
      try {
        this.syncInProgress = true
        this.error = null

        await calendarApi.syncCalendarEvents(integrationId)
        
        // Reload events after sync
        await this.loadCalendarEvents(integrationId)
        
        // Update last sync time
        const integration = this.integrations.find(int => int.id === integrationId)
        if (integration) {
          integration.lastSyncAt = new Date().toISOString()
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to sync calendar events'
        throw error
      } finally {
        this.syncInProgress = false
      }
    },

    // Load calendar events
    async loadCalendarEvents(integrationId: string, startDate?: string, endDate?: string) {
      try {
        this.loading = true
        this.error = null

        const response = await calendarApi.getCalendarEvents(integrationId, startDate, endDate)
        
        if (response?.data) {
          // Replace events for this calendar
          this.events = [
            ...this.events.filter(event => event.calendarId !== integrationId),
            ...response.data.map((event: any) => ({
              ...event,
              calendarId: integrationId
            }))
          ]
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to load calendar events'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Create calendar event
    async createCalendarEvent(integrationId: string, eventData: CreateCalendarEventData) {
      try {
        this.loading = true
        this.error = null

        const response = await calendarApi.createCalendarEvent(integrationId, eventData)
        
        if (response?.data) {
          const newEvent: CalendarEvent = {
            ...response.data,
            calendarId: integrationId
          }
          
          this.events.push(newEvent)
          return newEvent
        }
        
        throw new Error('Invalid event creation response')
      } catch (error: any) {
        this.error = error.message || 'Failed to create calendar event'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update calendar event
    async updateCalendarEvent(integrationId: string, eventId: string, eventData: Partial<CreateCalendarEventData>) {
      try {
        this.loading = true
        this.error = null

        const response = await calendarApi.updateCalendarEvent(integrationId, eventId, eventData)
        
        if (response?.data) {
          const eventIndex = this.events.findIndex(event => event.id === eventId)
          if (eventIndex >= 0) {
            this.events[eventIndex] = {
              ...this.events[eventIndex],
              ...response.data
            }
          }
          
          return this.events[eventIndex]
        }
        
        throw new Error('Invalid event update response')
      } catch (error: any) {
        this.error = error.message || 'Failed to update calendar event'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Delete calendar event
    async deleteCalendarEvent(integrationId: string, eventId: string) {
      try {
        this.loading = true
        this.error = null

        await calendarApi.deleteCalendarEvent(integrationId, eventId)
        
        // Remove from local state
        this.events = this.events.filter(event => event.id !== eventId)
      } catch (error: any) {
        this.error = error.message || 'Failed to delete calendar event'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Refresh calendar token
    async refreshCalendarToken(integrationId: string) {
      try {
        this.loading = true
        this.error = null

        const response = await calendarApi.refreshCalendarToken(integrationId)
        
        if (response?.data) {
          const integrationIndex = this.integrations.findIndex(int => int.id === integrationId)
          if (integrationIndex >= 0) {
            this.integrations[integrationIndex] = {
              ...this.integrations[integrationIndex],
              ...response.data
            }
          }
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to refresh calendar token'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Clear error state
    clearError() {
      this.error = null
    },

    // Initialize store
    async initialize() {
      await this.loadCalendarIntegrations()
    }
  }
})
