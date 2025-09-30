import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from '@/types/auth'

// Centralized token validation that's independent of store state
export const AuthChecker = {
  TOKEN_KEY: 'token',
  
  // Synchronous check that can run independently
  validateAuth(): { isAuthenticated: boolean, user: string | null } {
    // Check for browser environment
    if (typeof window === 'undefined') {
      console.log('AuthChecker: Not in browser environment')
      return { isAuthenticated: false, user: null }
    }
    
    try {
      // Check for both token and accessToken keys
      const token = localStorage.getItem(this.TOKEN_KEY) || localStorage.getItem('accessToken')
      if (!token) {
        console.log('AuthChecker: No token found in localStorage')
        return { isAuthenticated: false, user: null }
      }
      
      console.log('AuthChecker: Token found, attempting to decode...')
      const decoded = jwtDecode<JwtPayload>(token)
      const currentTime = Date.now() / 1000
      
      console.log('AuthChecker: Decoded token:', { sub: decoded.sub, exp: decoded.exp, currentTime })
      
      // Check token validity - be more lenient for development
      if (decoded.exp && decoded.exp > currentTime) {
        console.log('AuthChecker: Token is valid and not expired')
        return { 
          isAuthenticated: true, 
          user: decoded.sub || null
        }
      } else if (!decoded.exp) {
        // Token without expiration (development tokens)
        console.log('AuthChecker: Token has no expiration (development mode)')
        return { 
          isAuthenticated: true, 
          user: decoded.sub || null
        }
      }
      
      // Token expired
      console.log('AuthChecker: Token has expired')
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem('accessToken')
      return { isAuthenticated: false, user: null }
    } catch (error) {
      // Error processing token
      console.error('AuthChecker: Error validating token:', error)
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem('accessToken')
      return { isAuthenticated: false, user: null }
    }
  }
}