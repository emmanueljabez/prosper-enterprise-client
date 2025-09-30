import { useAuthStore } from '@/store/modules/auth'
import { ref, computed } from 'vue'

export interface SessionSettings {
  // Session timeouts in milliseconds
  maxInactivityTime: number // Default: 30 minutes
  warningTime: number // Default: 5 minutes before logout
  tokenRefreshInterval: number // Default: 15 minutes
  maxSessionDuration: number // Default: 8 hours
  
  // Activity tracking
  trackMouseMovement: boolean
  trackKeyboardActivity: boolean
  trackPageVisibility: boolean
  
  // Multi-tab session management
  enableCrossTabSync: boolean
  enableSingleSignOn: boolean
}

export class SessionManager {
  private static instance: SessionManager
  private settings: SessionSettings
  private activityTimestamp: number = Date.now()
  private sessionStartTime: number = Date.now()
  private warningTimer: ReturnType<typeof setTimeout> | null = null
  private logoutTimer: ReturnType<typeof setTimeout> | null = null
  private refreshTimer: ReturnType<typeof setTimeout> | null = null
  private activityListeners: Array<() => void> = []
  private isWarningShown = ref(false)
  private timeRemaining = ref(0)
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null
  
  // Cross-tab communication
  private broadcastChannel: BroadcastChannel | null = null
  private storageEventListener: ((event: StorageEvent) => void) | null = null
  
  private constructor(settings: Partial<SessionSettings> = {}) {
    this.settings = {
      maxInactivityTime: 30 * 60 * 1000, // 30 minutes
      warningTime: 5 * 60 * 1000, // 5 minutes
      tokenRefreshInterval: 15 * 60 * 1000, // 15 minutes
      maxSessionDuration: 8 * 60 * 60 * 1000, // 8 hours
      trackMouseMovement: true,
      trackKeyboardActivity: true,
      trackPageVisibility: true,
      enableCrossTabSync: true,
      enableSingleSignOn: true,
      ...settings
    }
    
    this.initializeSessionManagement()
  }
  
  public static getInstance(settings?: Partial<SessionSettings>): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager(settings)
    }
    return SessionManager.instance
  }
  
  // Initialize session management
  private initializeSessionManagement(): void {
    if (typeof window === 'undefined') return
    
    this.setupActivityTracking()
    this.setupTokenRefresh()
    this.setupCrossTabCommunication()
    this.setupPageVisibilityTracking()
    this.startSessionHeartbeat()
    this.scheduleSessionTimeout()
  }
  
  // Activity tracking
  private setupActivityTracking(): void {
    if (typeof window === 'undefined') return
    
    const updateActivity = this.throttle(() => {
      this.updateLastActivity()
    }, 1000) // Throttle to once per second
    
    if (this.settings.trackMouseMovement) {
      const mouseListener = () => updateActivity()
      document.addEventListener('mousemove', mouseListener, { passive: true })
      document.addEventListener('mousedown', mouseListener, { passive: true })
      this.activityListeners.push(() => {
        document.removeEventListener('mousemove', mouseListener)
        document.removeEventListener('mousedown', mouseListener)
      })
    }
    
    if (this.settings.trackKeyboardActivity) {
      const keyboardListener = () => updateActivity()
      document.addEventListener('keydown', keyboardListener, { passive: true })
      document.addEventListener('keypress', keyboardListener, { passive: true })
      this.activityListeners.push(() => {
        document.removeEventListener('keydown', keyboardListener)
        document.removeEventListener('keypress', keyboardListener)
      })
    }
    
    // Track page focus/blur
    const focusListener = () => updateActivity()
    const blurListener = () => this.handlePageBlur()
    window.addEventListener('focus', focusListener)
    window.addEventListener('blur', blurListener)
    this.activityListeners.push(() => {
      window.removeEventListener('focus', focusListener)
      window.removeEventListener('blur', blurListener)
    })
  }
  
  // Page visibility tracking
  private setupPageVisibilityTracking(): void {
    if (typeof document === 'undefined' || !this.settings.trackPageVisibility) return
    
    const visibilityListener = () => {
      if (document.visibilityState === 'visible') {
        this.updateLastActivity()
        this.scheduleSessionTimeout()
      } else {
        this.handlePageHidden()
      }
    }
    
    document.addEventListener('visibilitychange', visibilityListener)
    this.activityListeners.push(() => {
      document.removeEventListener('visibilitychange', visibilityListener)
    })
  }
  
  // Cross-tab communication
  private setupCrossTabCommunication(): void {
    if (typeof window === 'undefined' || !this.settings.enableCrossTabSync) return
    
    // Use BroadcastChannel for modern browsers
    if ('BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('session-sync')
      this.broadcastChannel.addEventListener('message', (event) => {
        this.handleCrossTabMessage(event.data)
      })
    }
    
    // Fallback to localStorage events
    this.storageEventListener = (event: StorageEvent) => {
      if (event.key === 'session-activity') {
        this.handleCrossTabActivity(event.newValue)
      } else if (event.key === 'session-logout') {
        this.handleCrossTabLogout()
      }
    }
    
    window.addEventListener('storage', this.storageEventListener)
  }
  
  // Token refresh management
  private setupTokenRefresh(): void {
    this.scheduleTokenRefresh()
  }
  
  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }
    
    this.refreshTimer = setTimeout(async () => {
      await this.refreshToken()
      this.scheduleTokenRefresh() // Schedule next refresh
    }, this.settings.tokenRefreshInterval)
  }
  
  private async refreshToken(): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) return
      
      // Check if token is close to expiration
      const payload = this.parseJWTPayload(token)
      if (!payload || !payload.exp) return
      
      const currentTime = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = payload.exp - currentTime
      
      // Refresh if token expires within next 10 minutes
      if (timeUntilExpiry < 600) {
        console.log('Refreshing token...')
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          // Use fetch directly for token refresh
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ refreshToken })
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.token) {
              localStorage.setItem('token', data.token)
              console.log('Token refreshed successfully')
            }
          } else {
            throw new Error('Token refresh failed')
          }
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      // If refresh fails and token is expired, logout
      this.handleTokenExpired()
    }
  }
  
  // Session timeout management
  private scheduleSessionTimeout(): void {
    this.clearTimers()
    
    const currentTime = Date.now()
    const timeSinceLastActivity = currentTime - this.activityTimestamp
    const timeUntilWarning = Math.max(0, this.settings.maxInactivityTime - this.settings.warningTime - timeSinceLastActivity)
    const timeUntilLogout = Math.max(0, this.settings.maxInactivityTime - timeSinceLastActivity)
    
    // Check maximum session duration
    const sessionDuration = currentTime - this.sessionStartTime
    if (sessionDuration >= this.settings.maxSessionDuration) {
      this.handleSessionExpired()
      return
    }
    
    // Schedule warning
    if (timeUntilWarning > 0) {
      this.warningTimer = setTimeout(() => {
        this.showSessionWarning()
      }, timeUntilWarning)
    } else if (!this.isWarningShown.value) {
      this.showSessionWarning()
    }
    
    // Schedule logout
    if (timeUntilLogout > 0) {
      this.logoutTimer = setTimeout(() => {
        this.handleInactivityLogout()
      }, timeUntilLogout)
    } else {
      this.handleInactivityLogout()
    }
  }
  
  // Session warning
  private showSessionWarning(): void {
    this.isWarningShown.value = true
    this.startWarningCountdown()
    this.broadcastToOtherTabs('session-warning', { timestamp: this.activityTimestamp })
  }
  
  private startWarningCountdown(): void {
    const updateCountdown = () => {
      const currentTime = Date.now()
      const timeSinceLastActivity = currentTime - this.activityTimestamp
      const remaining = Math.max(0, this.settings.maxInactivityTime - timeSinceLastActivity)
      
      this.timeRemaining.value = Math.ceil(remaining / 1000)
      
      if (remaining > 0 && this.isWarningShown.value) {
        setTimeout(updateCountdown, 1000)
      }
    }
    
    updateCountdown()
  }
  
  // Activity updates
  private updateLastActivity(): void {
    const now = Date.now()
    this.activityTimestamp = now
    
    if (this.isWarningShown.value) {
      this.hideSessionWarning()
    }
    
    this.scheduleSessionTimeout()
    this.broadcastToOtherTabs('activity-update', { timestamp: now })
    
    // Update localStorage for cross-tab sync
    if (typeof window !== 'undefined') {
      localStorage.setItem('session-activity', now.toString())
    }
  }
  
  private hideSessionWarning(): void {
    this.isWarningShown.value = false
    this.timeRemaining.value = 0
  }
  
  // Logout handlers
  private async handleInactivityLogout(): Promise<void> {
    console.log('Session expired due to inactivity')
    await this.logout('inactivity')
  }
  
  private async handleSessionExpired(): Promise<void> {
    console.log('Session expired due to maximum duration')
    await this.logout('session-expired')
  }
  
  private async handleTokenExpired(): Promise<void> {
    console.log('Session expired due to token expiration')
    await this.logout('token-expired')
  }
  
  private async logout(reason: string): Promise<void> {
    try {
      this.cleanup()
      this.broadcastToOtherTabs('session-logout', { reason })
      
      const authStore = useAuthStore()
      await authStore.signOut()
      
      // Navigate to login with reason using navigateTo
      if (typeof window !== 'undefined') {
        await navigateTo(`/auth/login?reason=${reason}`)
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  // Cross-tab communication handlers
  private handleCrossTabMessage(data: any): void {
    switch (data.type) {
      case 'activity-update':
        if (data.timestamp > this.activityTimestamp) {
          this.activityTimestamp = data.timestamp
          this.hideSessionWarning()
          this.scheduleSessionTimeout()
        }
        break
      case 'session-warning':
        if (!this.isWarningShown.value) {
          this.showSessionWarning()
        }
        break
      case 'session-logout':
        this.handleCrossTabLogout()
        break
    }
  }
  
  private handleCrossTabActivity(timestamp: string | null): void {
    if (timestamp) {
      const activityTime = parseInt(timestamp, 10)
      if (activityTime > this.activityTimestamp) {
        this.activityTimestamp = activityTime
        this.hideSessionWarning()
        this.scheduleSessionTimeout()
      }
    }
  }
  
  private async handleCrossTabLogout(): Promise<void> {
    // Another tab logged out, sync this tab
    this.cleanup()
    const authStore = useAuthStore()
    authStore.setLogout()
    
    if (typeof window !== 'undefined') {
      await navigateTo('/auth/login?reason=cross-tab-logout')
    }
  }
  
  private broadcastToOtherTabs(type: string, data: any): void {
    const message = { type, ...data }
    
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message)
    }
    
    // Also use localStorage as fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem(`session-${type}`, JSON.stringify(message))
      // Clean up immediately to avoid storage bloat
      setTimeout(() => {
        localStorage.removeItem(`session-${type}`)
      }, 1000)
    }
  }
  
  // Page lifecycle handlers
  private handlePageBlur(): void {
    // Page lost focus, but don't immediately start logout timer
    // Keep current activity timestamp
  }
  
  private handlePageHidden(): void {
    // Page is hidden, save current state
    if (typeof window !== 'undefined') {
      localStorage.setItem('session-last-activity', this.activityTimestamp.toString())
      localStorage.setItem('session-start-time', this.sessionStartTime.toString())
    }
  }
  
  // Session heartbeat
  private startSessionHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat()
    }, 60000) // Every minute
  }
  
  private async sendHeartbeat(): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      // Send heartbeat to server to maintain session
      await fetch('/api/auth/heartbeat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timestamp: Date.now(),
          lastActivity: this.activityTimestamp
        })
      })
    } catch (error) {
      console.error('Heartbeat failed:', error)
    }
  }
  
  // Utility methods
  private parseJWTPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    } catch (error) {
      return null
    }
  }
  
  private throttle(func: Function, limit: number): Function {
    let inThrottle: boolean
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
  
  private clearTimers(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
      this.warningTimer = null
    }
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer)
      this.logoutTimer = null
    }
  }
  
  // Public API
  public extendSession(): void {
    this.updateLastActivity()
  }
  
  public getTimeRemaining(): number {
    return this.timeRemaining.value
  }
  
  public isSessionWarningActive(): boolean {
    return this.isWarningShown.value
  }
  
  public async forceLogout(): Promise<void> {
    await this.logout('manual')
  }
  
  public updateSettings(newSettings: Partial<SessionSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.scheduleSessionTimeout()
  }
  
  public restoreSession(): void {
    if (typeof window === 'undefined') return
    
    const lastActivity = localStorage.getItem('session-last-activity')
    const startTime = localStorage.getItem('session-start-time')
    
    if (lastActivity) {
      this.activityTimestamp = parseInt(lastActivity, 10)
    }
    if (startTime) {
      this.sessionStartTime = parseInt(startTime, 10)
    }
    
    this.scheduleSessionTimeout()
  }
  
  public cleanup(): void {
    // Clear all timers
    this.clearTimers()
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    
    // Remove event listeners
    this.activityListeners.forEach(cleanup => cleanup())
    this.activityListeners = []
    
    // Close broadcast channel
    if (this.broadcastChannel) {
      this.broadcastChannel.close()
      this.broadcastChannel = null
    }
    
    // Remove storage listener
    if (this.storageEventListener && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageEventListener)
      this.storageEventListener = null
    }
    
    // Clear warning state
    this.hideSessionWarning()
  }
}

// Reactive composable for session state
export function useSessionManager(settings?: Partial<SessionSettings>) {
  const sessionManager = SessionManager.getInstance(settings)
  
  return {
    isWarningShown: computed(() => sessionManager.isSessionWarningActive()),
    timeRemaining: computed(() => sessionManager.getTimeRemaining()),
    extendSession: () => sessionManager.extendSession(),
    forceLogout: () => sessionManager.forceLogout(),
    updateSettings: (newSettings: Partial<SessionSettings>) => sessionManager.updateSettings(newSettings)
  }
} 