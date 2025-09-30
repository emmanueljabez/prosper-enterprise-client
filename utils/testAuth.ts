import { DUMMY_TOKENS, DUMMY_USER_DATA } from './dummyTokens'

/**
 * Test authentication utility for development and debugging
 */
export class TestAuth {
  /**
   * Set a test user token in localStorage for testing
   * @param userType - The type of user to simulate
   */
  static setTestUser(userType: keyof typeof DUMMY_TOKENS) {
    if (typeof window === 'undefined') {
      console.warn('TestAuth: Cannot set test user - not in browser environment')
      return
    }

    const token = DUMMY_TOKENS[userType]
    const userData = DUMMY_USER_DATA[userType]

    if (!token || !userData) {
      console.error('TestAuth: Invalid user type:', userType)
      return
    }

    // Set token in localStorage
    localStorage.setItem('token', token)
    localStorage.setItem('loggedInUser', JSON.stringify(userData))
    localStorage.setItem('provider', userData.provider)

    console.log(`TestAuth: Set test user as ${userType}:`, userData.name)
    console.log('TestAuth: Token stored in localStorage')
    
    // Optionally reload the page to trigger auth middleware
    if (confirm('Test user set! Reload page to see authentication take effect?')) {
      window.location.reload()
    }
  }

  /**
   * Clear all authentication data
   */
  static clearAuth() {
    if (typeof window === 'undefined') {
      console.warn('TestAuth: Cannot clear auth - not in browser environment')
      return
    }

    localStorage.removeItem('token')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('loggedInUser')
    localStorage.removeItem('provider')
    localStorage.removeItem('tenantId')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')

    console.log('TestAuth: All authentication data cleared')
    
    // Optionally reload the page
    if (confirm('Authentication cleared! Reload page?')) {
      window.location.reload()
    }
  }

  /**
   * Check current authentication status
   */
  static checkStatus() {
    if (typeof window === 'undefined') {
      console.warn('TestAuth: Cannot check status - not in browser environment')
      return
    }

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
    const loggedInUser = localStorage.getItem('loggedInUser')

    console.log('TestAuth: Current Status:')
    console.log('- Token:', token ? 'Present' : 'Not found')
    console.log('- Logged in user:', loggedInUser ? JSON.parse(loggedInUser) : 'Not found')
    
    return {
      hasToken: !!token,
      token: token,
      user: loggedInUser ? JSON.parse(loggedInUser) : null
    }
  }

  /**
   * Quick login as employee for testing
   */
  static loginAsEmployee() {
    this.setTestUser('employee')
  }

  /**
   * Quick login as mentor for testing
   */
  static loginAsMentor() {
    this.setTestUser('mentor')
  }

  /**
   * Quick login as corporate admin for testing
   */
  static loginAsAdmin() {
    this.setTestUser('corporate_admin')
  }
}

// Make it available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).TestAuth = TestAuth
  console.log('TestAuth utility available globally. Use TestAuth.loginAsEmployee(), TestAuth.loginAsMentor(), or TestAuth.loginAsAdmin() to test authentication.')
} 