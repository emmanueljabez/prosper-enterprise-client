import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from '@/types/auth'

// Centralized token validation that's independent of store state
export const AuthChecker = {
  TOKEN_KEY: 'token',
  
  // Synchronous check that can run independently
  validateAuth(): { isAuthenticated: boolean, user: string | null } {
    // Check for browser environment
    if (typeof window === 'undefined') {
      return { isAuthenticated: false, user: null }
    }
    
    try {
      const token = localStorage.getItem(this.TOKEN_KEY)
      if (!token) {
        return { isAuthenticated: false, user: null }
      }
      
      const decoded = jwtDecode<JwtPayload>(token)
      const currentTime = Date.now() / 1000
      
      // Check token validity
      if (decoded.exp && decoded.exp > currentTime) {
        return { 
          isAuthenticated: true, 
          user: decoded.sub || null
        }
      }
      
      // Token expired
      localStorage.removeItem(this.TOKEN_KEY)
      return { isAuthenticated: false, user: null }
    } catch (error) {
      // Error processing token
      // console.error('Auth validation error:', error)
      localStorage.removeItem(this.TOKEN_KEY)
      return { isAuthenticated: false, user: null }
    }
  }
}