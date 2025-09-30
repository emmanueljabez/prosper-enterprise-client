export interface GoogleCalendarProvider {
  id: 'google-calendar'
  name: 'Google Calendar'
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export interface CalendarIntegration {
  id: string
  userId: string
  provider: 'google-calendar'
  accessToken: string
  refreshToken: string
  expiresAt: string
  scope: string[]
  connectedAt: string
  lastSyncAt?: string
  isActive: boolean
}

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  attendees?: CalendarAttendee[]
  createdBy?: string
  meetingLink?: string
  calendarId: string
}

export interface CalendarAttendee {
  email: string
  displayName?: string
  responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted'
}

export interface GoogleCalendarAuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
  token_type: string
}

export interface CalendarSyncData {
  provider: 'google-calendar'
  code: string
  state?: string
}

export interface CalendarState {
  integrations: CalendarIntegration[]
  events: CalendarEvent[]
  loading: boolean
  error: string | null
  syncInProgress: boolean
}

export interface CreateCalendarEventData {
  summary: string
  description?: string
  startTime: string
  endTime: string
  attendees?: string[]
  location?: string
}

// Google Calendar API Response Types
export interface GoogleCalendarEventResponse {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus: string
  }>
  htmlLink?: string
  hangoutLink?: string
}

export interface GoogleCalendarListResponse {
  items: GoogleCalendarEventResponse[]
  nextPageToken?: string
}
