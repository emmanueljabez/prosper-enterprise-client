import axiosInstance from "../../axios/index"
import type { CalendarSyncData, CreateCalendarEventData, GoogleCalendarAuthResponse } from "@/types/calendar"

export default {
  // OAuth Flow
  connectCalendar(calendarData: CalendarSyncData) {
    return axiosInstance.post(`/calendar/connect`, calendarData)
  },

  // Disconnect calendar integration
  disconnectCalendar(integrationId: string) {
    return axiosInstance.delete(`/calendar/disconnect/${integrationId}`)
  },

  // Get user's calendar integrations
  getCalendarIntegrations() {
    return axiosInstance.get(`/calendar/integrations`)
  },

  // Sync calendar events
  syncCalendarEvents(integrationId: string) {
    return axiosInstance.post(`/calendar/sync/${integrationId}`)
  },

  // Get calendar events
  getCalendarEvents(integrationId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const queryString = params.toString()
    const url = `/calendar/events/${integrationId}${queryString ? `?${queryString}` : ''}`
    
    return axiosInstance.get(url)
  },

  // Create calendar event
  createCalendarEvent(integrationId: string, eventData: CreateCalendarEventData) {
    return axiosInstance.post(`/calendar/events/${integrationId}`, eventData)
  },

  // Update calendar event
  updateCalendarEvent(integrationId: string, eventId: string, eventData: Partial<CreateCalendarEventData>) {
    return axiosInstance.put(`/calendar/events/${integrationId}/${eventId}`, eventData)
  },

  // Delete calendar event
  deleteCalendarEvent(integrationId: string, eventId: string) {
    return axiosInstance.delete(`/calendar/events/${integrationId}/${eventId}`)
  },

  // Refresh access token
  refreshCalendarToken(integrationId: string) {
    return axiosInstance.post(`/calendar/refresh-token/${integrationId}`)
  }
}
