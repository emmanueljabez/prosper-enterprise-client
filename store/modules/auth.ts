import { defineStore } from 'pinia'
import jwt from '@/http/requests/auth/jwt'
import type { AuthState, RegistrationData, LoginData, JwtPayload, SSOLoginData, SSOProvider, User, MFAData } from '@/types/auth'
import { useRouter } from 'vue-router'
import { navigateTo } from 'nuxt/app'
import { jwtDecode } from 'jwt-decode'
import { DEFAULT_ROLES } from '@/utils/roleManager'

// Dummy JWT tokens for testing different roles
// These are pre-generated tokens with embedded role data

export const DUMMY_TOKENS = {
  // Employee Token - Sarah Njeri Kamau
  employee: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbXBsb3llZS0wMDEiLCJlbWFpbCI6InNhcmFoLm5qZXJpQGV4YW1wbGUuY29tIiwibmFtZSI6IlNhcmFoIE5qZXJpIEthbWF1IiwicGljdHVyZSI6Ii9pbWFnZXMvYXZhdGFycy9zYXJhaC5qcGciLCJwcm92aWRlciI6ImxvY2FsIiwicm9sZXMiOlsiZW1wbG95ZWUiXSwiaXNWZXJpZmllZCI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyMy0wMS0xNVQwOTowMDowMC4wMDBaIiwibGFzdExvZ2luQXQiOiIyMDI1LTA3LTIyVDA5OjI4OjIxLjk5MloiLCJpYXQiOjE3NTMxNzY1MDEsImV4cCI6MTc1MzI2MjkwMX0.YEfJayY2UM5cma1bYZ1kmDpYZMI60aUBgjZv7oyZMiE",

  // Mentor Token - Grace Wanjiku Mwangi
  mentor: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtZW50b3ItMDAxIiwiZW1haWwiOiJncmFjZS53YW5qaWt1QHNhZmFyaWNvbS5jby5rZSIsIm5hbWUiOiJHcmFjZSBXYW5qaWt1IE13YW5naSIsInBpY3R1cmUiOiIvaW1hZ2VzL2F2YXRhcnMvZ3JhY2UuanBnIiwicHJvdmlkZXIiOiJsb2NhbCIsInJvbGVzIjpbIm1lbnRvciJdLCJpc1ZlcmlmaWVkIjp0cnVlLCJjcmVhdGVkQXQiOiIyMDIyLTA2LTEwVDA5OjAwOjAwLjAwMFoiLCJsYXN0TG9naW5BdCI6IjIwMjUtMDctMjJUMDk6Mjg6MjEuOTkyWiIsImlhdCI6MTc1MzE3NjUwMSwiZXhwIjoxNzUzMjYyOTAxfQ.3KzFzldQloadZAzIOv2BRtdnJEvBvpYBWw9_fgAX94Y",

  // Corporate Admin Token - Dr. James Kiprotich Mutai
  corporate_admin: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi0wMDEiLCJlbWFpbCI6ImphbWVzLmtpcHJvdGljaEBwcm9zcGVybWVudG9yLmNvbSIsIm5hbWUiOiJEci4gSmFtZXMgS2lwcm90aWNoIE11dGFpIiwicGljdHVyZSI6Ii9pbWFnZXMvYXZhdGFycy9qYW1lcy5qcGciLCJwcm92aWRlciI6ImxvY2FsIiwicm9sZXMiOlsiY29ycG9yYXRlX2FkbWluIl0sImlzVmVyaWZpZWQiOnRydWUsImNyZWF0ZWRBdCI6IjIwMjItMDEtMDFUMDk6MDA6MDAuMDAwWiIsImxhc3RMb2dpbkF0IjoiMjAyNS0wNy0yMlQwOToyODoyMS45OTJaIiwiaWF0IjoxNzUzMTc2NTAxLCJleHAiOjE3NTMyNjI5MDF9.GpCMhWY7hJyiYWsk9c_128jZuTQQsfznLjWlFSqjOFI",

  // Multi-role Token - Someone with both mentor and employee roles
  mentor_employee: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtdWx0aS0wMDEiLCJlbWFpbCI6Im1hcnkub25qYWxhQHRlY2guY29tIiwibmFtZSI6Ik1hcnkgT25qYWxhIEtpbWFuaSIsInBpY3R1cmUiOiIvaW1hZ2VzL2F2YXRhcnMvbWFyeS5qcGciLCJwcm92aWRlciI6Imdvb2dsZSIsInJvbGVzIjpbIm1lbnRvciIsImVtcGxveWVlIl0sImlzVmVyaWZpZWQiOnRydWUsImNyZWF0ZWRBdCI6IjIwMjMtMDMtMTVUMDk6MDA6MDAuMDAwWiIsImxhc3RMb2dpbkF0IjoiMjAyNS0wNy0yMlQwOToyODoyMS45OTJaIiwiaWF0IjoxNzUzMTc2NTAxLCJleHAiOjE3NTMyNjI5MDF9.Xnh4MFw2ggivJiXbu-LUS24S3E2ZpRZcmSBwaF89RHE",

  // Google SSO Employee Token - Peter Mwangi
  google_employee: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnb29nbGUtZW1wLTAwMSIsImVtYWlsIjoicGV0ZXIubXdhbmdpQGdtYWlsLmNvbSIsIm5hbWUiOiJQZXRlciBNd2FuZ2kgS2FyYW5qYSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKOXh4eCIsInByb3ZpZGVyIjoiZ29vZ2xlIiwicm9sZXMiOlsiZW1wbG95ZWUiXSwiaXNWZXJpZmllZCI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyMy0wOC0yMFQwOTowMDowMC4wMDBaIiwibGFzdExvZ2luQXQiOiIyMDI1LTA3LTIyVDA5OjI4OjIxLjk5MloiLCJpYXQiOjE3NTMxNzY1MDEsImV4cCI6MTc1MzI2MjkwMX0.nOHL52uGE9ihQZ0Fuy2cHvpE3CeOnw_-o_fB6hId4Oc",

  // Microsoft SSO Mentor Token - Dr. Amina Hassan
  microsoft_mentor: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtc2Z0LW1lbnRvci0wMDEiLCJlbWFpbCI6ImFtaW5hLmhhc3NhbkB1b24uYWMua2UiLCJuYW1lIjoiRHIuIEFtaW5hIEhhc3NhbiBBYmRpIiwicGljdHVyZSI6Imh0dHBzOi8vZ3JhcGgubWljcm9zb2Z0LmNvbS92MS4wL21lL3Bob3RvLyRjb250ZW50IiwicHJvdmlkZXIiOiJtaWNyb3NvZnQiLCJyb2xlcyI6WyJtZW50b3IiXSwiaXNWZXJpZmllZCI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyMi0xMS0wNVQwOTowMDowMC4wMDBaIiwibGFzdExvZ2luQXQiOiIyMDI1LTA3LTIyVDA5OjI4OjIxLjk5MloiLCJpYXQiOjE3NTMxNzY1MDEsImV4cCI6MTc1MzI2MjkwMX0.M4jJFdIisqZ9u34fBmnCS21F5zDWlOFx9scLpvwQalI"
}

// Decoded payload examples for reference
export const DUMMY_USER_DATA = {
  employee: {
    id: "employee-001",
    email: "sarah.njeri@example.com",
    name: "Sarah Njeri Kamau",
    picture: "/images/avatars/sarah.jpg",
    provider: "local" as const,
    roles: [DEFAULT_ROLES.employee],
    isVerified: true,
    createdAt: "2023-01-15T09:00:00.000Z",
    lastLoginAt: "2024-01-19T08:30:00.000Z"
  },

  mentor: {
    id: "mentor-001",
    email: "grace.wanjiku@safaricom.co.ke",
    name: "Grace Wanjiku Mwangi",
    picture: "/images/avatars/grace.jpg",
    provider: "local" as const,
    roles: [DEFAULT_ROLES.mentor],
    isVerified: true,
    createdAt: "2022-06-10T09:00:00.000Z",
    lastLoginAt: "2024-01-19T07:45:00.000Z"
  },

  corporate_admin: {
    id: "admin-001",
    email: "james.kiprotich@prospermentor.com",
    name: "Dr. James Kiprotich Mutai",
    picture: "/images/avatars/james.jpg",
    provider: "local" as const,
    roles: [DEFAULT_ROLES.corporate_admin],
    isVerified: true,
    createdAt: "2022-01-01T09:00:00.000Z",
    lastLoginAt: "2024-01-19T06:30:00.000Z"
  },

  mentor_employee: {
    id: "multi-001",
    email: "mary.onjala@tech.com",
    name: "Mary Onjala Kimani",
    picture: "/images/avatars/mary.jpg",
    provider: "google" as const,
    roles: [DEFAULT_ROLES.mentor, DEFAULT_ROLES.employee],
    isVerified: true,
    createdAt: "2023-03-15T09:00:00.000Z",
    lastLoginAt: "2024-01-19T10:15:00.000Z"
  },

  google_employee: {
    id: "google-emp-001",
    email: "peter.mwangi@gmail.com",
    name: "Peter Mwangi Karanja",
    picture: "https://lh3.googleusercontent.com/a/ACg8ocJ9xxx",
    provider: "google" as const,
    roles: [DEFAULT_ROLES.employee],
    isVerified: true,
    createdAt: "2023-08-20T09:00:00.000Z",
    lastLoginAt: "2024-01-19T09:10:00.000Z"
  },

  microsoft_mentor: {
    id: "msft-mentor-001",
    email: "amina.hassan@uon.ac.ke",
    name: "Dr. Amina Hassan Abdi",
    picture: "https://graph.microsoft.com/v1.0/me/photo/$content",
    provider: "microsoft" as const,
    roles: [DEFAULT_ROLES.mentor],
    isVerified: true,
    createdAt: "2022-11-05T09:00:00.000Z",
    lastLoginAt: "2024-01-19T07:20:00.000Z"
  }
}

const normalizeFrontendRoleName = (roleName?: string): 'employee' | 'mentor' | 'corporate_admin' => {
  const normalized = String(roleName || '').trim().toLowerCase()

  if (normalized === 'mentor') {
    return 'mentor'
  }

  if (['company', 'company_admin', 'corporate_admin'].includes(normalized)) {
    return 'corporate_admin'
  }

  return 'employee'
}

const resolveStoredCompanyId = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    const storedProfile = localStorage.getItem('profile')
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile)
      const profileCompanyId = parsedProfile?.companyId || parsedProfile?.company_id || parsedProfile?.company?.id
      if (profileCompanyId) {
        return profileCompanyId
      }
    }

    const storedUser = localStorage.getItem('loggedInUser')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      const userCompanyId = parsedUser?.companyId || parsedUser?.company_id || parsedUser?.company?.id
      if (userCompanyId) {
        return userCompanyId
      }
    }
  } catch (error) {
    console.warn('Failed to hydrate stored company context', error)
  }

  return undefined
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    loggedInUser: null,
    loading: false,
    error: null,
    registrationData: {
      firstName: null,
      lastName: null,
      password: null,
      companyName: null,
      phoneNumber: null,
      emailAddress: null,
      noOfEmployees: null
    },
    currentStep: 1,
    networkType: null,
    ssoProviders: [
      {
        id: 'google',
        name: 'Google',
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback/google',
        scopes: ['openid', 'email', 'profile']
      },
      {
        id: 'microsoft',
        name: 'Microsoft',
        clientId: process.env.MICROSOFT_CLIENT_ID || "",
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
        redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/auth/callback/microsoft',
        scopes: ['openid', 'email', 'profile', 'User.Read']
      }
    ],
    mfaRequired: false,
    mfaToken: null
  }),

  getters: {
    registrationEmail: (state) => state.registrationData.emailAddress,
  },

  actions: {
    initializeFromStorage() {
      console.log('🔍 Auth Store: initializeFromStorage called');
      try {
        if (typeof window !== 'undefined') {
          // Check for both 'token' and 'accessToken' keys for compatibility
          const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
          console.log('🔍 Auth Store: Token from localStorage:', token ? 'Present' : 'Not found');
          if (!token) {
            this.loggedInUser = null
            return false
          }

          console.log('🔍 Auth Store: Attempting to decode JWT...');
          const decoded = jwtDecode<JwtPayload>(token)
          console.log('🔍 Auth Store: Decoded JWT payload:', decoded);

          // Remove expiration check - tokens never expire
          // Create a User object from the decoded token
          console.log('🔍 Auth Store: Raw roles from JWT:', decoded.roles);
          const mappedRoles = decoded.roles?.map(roleName => {
            const role = normalizeFrontendRoleName(roleName)
            console.log('🔍 Auth Store: Mapping role:', roleName, 'to:', DEFAULT_ROLES[role]);
            return DEFAULT_ROLES[role] || DEFAULT_ROLES.employee
          }) || [DEFAULT_ROLES.employee]
          
          console.log('🔍 Auth Store: Final mapped roles:', mappedRoles);
          
          this.loggedInUser = {
            id: decoded.sub,
            email: decoded.email || '',
            name: decoded.name || decoded.sub,
            picture: decoded.picture,
            provider: decoded.provider as 'local' | 'google' | 'microsoft' || 'local',
            roles: mappedRoles,
            isVerified: true,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            companyId: resolveStoredCompanyId()
          }
          console.log('🔍 Auth Store: Created loggedInUser:', this.loggedInUser);
          return true
        } else {
          console.log('🔍 Auth Store: Not in browser environment');
          this.loggedInUser = null;
          return false;
        }
      } catch (error) {
        console.error('🔍 Auth Store: Initialization error:', error)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('accessToken')
        }
        this.loggedInUser = null
        return false
      }
    },

    async navigateToStep(router: any) {
      const routes: { [key: number]: string } = {
        1: '/auth/register',
        2: '/auth/password',
        3: '/auth/about',
        4: '/auth/employees',
        5: '/auth/email-verification'
      }
      await router.push(routes[this.currentStep])
    },

    async setRegistrationEmail(email: string, router: any) {
      this.loading = true
      try {
        this.registrationData.emailAddress = email
        this.currentStep = 2
        await this.navigateToStep(router)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async setRegistrationPhoneNumber(phoneNumber: string, router: any) {
      this.loading = true
      try {
        this.registrationData.phoneNumber = phoneNumber
        this.currentStep = 2
        await this.navigateToStep(router)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updatePassword(password: string, router: any) {
      this.loading = true
      try {
        this.registrationData.password = password
        this.currentStep = 3
        await this.navigateToStep(router)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updatePersonalDetails(data: { firstName: string, lastName: string }, router: any) {
      this.loading = true
      try {
        this.registrationData.firstName = data.firstName
        this.registrationData.lastName = data.lastName
        this.currentStep = 4
        await this.navigateToStep(router)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async completeRegistration(data: { companyName: string, noOfEmployees: string }, router: any) {
      this.loading = true
      let registrationResponse: any = null;

      try {
        this.registrationData.companyName = data.companyName
        this.registrationData.noOfEmployees = data.noOfEmployees

        registrationResponse = await this.register(this.registrationData)
          .then((response) => {
            this.currentStep = 5
            this.navigateToStep(router)
            return response;
          })
          .catch((error) => {
            this.error = error.message
            throw error;
          })

        return registrationResponse;
      } catch (error: any) {
        this.error = error.message
        throw error;
      } finally {
        this.loading = false
      }
    },

    async setupNetwork(type: string) {
      this.loading = true
      try {
        this.networkType = type
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        return Promise.resolve()
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // SSO Authentication Methods
    async initiateGoogleAuth() {
      const provider = this.ssoProviders.find(p => p.id === 'google')
      if (!provider) throw new Error('Google SSO not configured')

      const params = new URLSearchParams({
        client_id: provider.clientId,
        redirect_uri: provider.redirectUri,
        response_type: 'code',
        scope: provider.scopes.join(' '),
        access_type: 'offline',
        prompt: 'consent'
      })

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
      window.location.href = authUrl
    },

    async initiateMicrosoftAuth() {
      const provider = this.ssoProviders.find(p => p.id === 'microsoft')
      if (!provider) throw new Error('Microsoft SSO not configured')

      const params = new URLSearchParams({
        client_id: provider.clientId,
        redirect_uri: provider.redirectUri,
        response_type: 'code',
        scope: provider.scopes.join(' '),
        response_mode: 'query',
        state: Math.random().toString(36).substring(7)
      })

      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`
      window.location.href = authUrl
    },

    async ssoLogin(ssoData: SSOLoginData) {
      this.loading = true
      try {
        const response = await jwt.ssoLogin(ssoData)
        
        if (response && response.data) {
          const responseData = response.data.data || response.data
          
          // Create User object from SSO response
          this.loggedInUser = {
            id: responseData.id || responseData.sub,
            email: responseData.email,
            name: responseData.name,
            firstName: responseData.firstName || responseData.given_name,
            lastName: responseData.lastName || responseData.family_name,
            picture: responseData.picture,
            provider: ssoData.provider,
            roles: responseData.roles?.map((roleName: string) => {
              const role = normalizeFrontendRoleName(roleName)
              return DEFAULT_ROLES[role] || DEFAULT_ROLES.employee
            }) || [DEFAULT_ROLES.employee],
            isVerified: true,
            createdAt: responseData.createdAt || new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            companyId: responseData.companyId
          }

          if (responseData.jwtToken && typeof window !== 'undefined') {
            localStorage.setItem('token', responseData.jwtToken)
            localStorage.setItem('name', this.loggedInUser.name)
            localStorage.setItem('provider', ssoData.provider)
          }

          return response.data
        } else {
          throw new Error('Invalid SSO response format')
        }
      } catch (error: any) {
        this.error = error.message || 'SSO authentication failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async verifyMFA(mfaData: MFAData) {
      this.loading = true
      try {
        const response = await jwt.verifyMFA(mfaData)
        
        if (response && response.data) {
          const responseData = response.data.data || response.data
          
          // Update user with verified MFA
          if (this.loggedInUser) {
            this.loggedInUser.lastLoginAt = new Date().toISOString()
          }

          this.mfaRequired = false
          this.mfaToken = null

          if (responseData.jwtToken && typeof window !== 'undefined') {
            localStorage.setItem('token', responseData.jwtToken)
          }

          return response.data
        } else {
          throw new Error('Invalid MFA response format')
        }
      } catch (error: any) {
        this.error = error.message || 'MFA verification failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    // MFA Management Methods
    async checkMFARequirement(user: User): Promise<boolean> {
      // Corporate admins require MFA
      const requiresMFA = user.roles.some(role => role.name === 'corporate_admin')
      
      if (requiresMFA && !user.mfaEnabled) {
        this.mfaRequired = true
        return true
      }
      
      return false
    },

    async setupMFA(userId: string, email: string) {
      this.loading = true
      try {
        const response = await jwt.setupMFA(userId, email)
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Failed to setup MFA'
        throw error
      } finally {
        this.loading = false
      }
    },

    async verifyMFASetup(userId: string, secret: string, code: string) {
      this.loading = true
      try {
        const response = await jwt.verifyMFASetup(userId, secret, code)
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Failed to verify MFA setup'
        throw error
      } finally {
        this.loading = false
      }
    },

    async completeMFASetup(userId: string, secret: string) {
      this.loading = true
      try {
        const response = await jwt.completeMFASetup(userId, secret)
        
        // Update user MFA status
        if (this.loggedInUser) {
          this.loggedInUser.mfaEnabled = true
          this.loggedInUser.mfaSetupAt = new Date().toISOString()
        }
        
        this.mfaRequired = false
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Failed to complete MFA setup'
        throw error
      } finally {
        this.loading = false
      }
    },

    async disableMFA(userId: string, password: string) {
      this.loading = true
      try {
        const response = await jwt.disableMFA(userId, password)
        
        // Update user MFA status
        if (this.loggedInUser) {
          this.loggedInUser.mfaEnabled = false
          this.loggedInUser.mfaSetupAt = undefined
          this.loggedInUser.mfaRecoveryCodesCount = 0
        }
        
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Failed to disable MFA'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getMFAStatus(userId: string) {
      try {
        const response = await jwt.getMFAStatus(userId)
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Failed to get MFA status'
        throw error
      }
    },

    login(loginData: LoginData) {
      this.loading = true
      return new Promise((resolve, reject) => {
        jwt.login(loginData)
            .then((response) => {
              if (response && response.data) {
                const responseData = response.data.data || response.data
                const responseUser = responseData?.user || response.data?.user || {}
                const responseProfile = responseData?.profile || response.data?.profile || {}

                const roleNames: string[] = Array.isArray(responseUser.roles)
                  ? responseUser.roles
                  : responseProfile?.role
                    ? [responseProfile.role]
                    : ['employee']

                const mappedRoles = roleNames.map((roleName: string) => {
                  const normalizedRole = normalizeFrontendRoleName(roleName)
                  return DEFAULT_ROLES[normalizedRole]
                })

                const firstName = responseProfile.firstName || responseUser?.user_metadata?.first_name
                const lastName = responseProfile.lastName || responseUser?.user_metadata?.last_name
                const fallbackName = [firstName, lastName].filter(Boolean).join(' ').trim()
                const resolvedName = responseUser.name || fallbackName || responseUser.email || loginData.email
                const resolvedUserId = responseUser.id || responseData.id || responseProfile.id || ''

                this.loggedInUser = {
                  id: resolvedUserId,
                  email: responseUser.email || loginData.email,
                  name: resolvedName,
                  firstName: firstName || undefined,
                  lastName: lastName || undefined,
                  provider: 'local',
                  roles: mappedRoles.length > 0 ? mappedRoles : [DEFAULT_ROLES.employee],
                  isVerified: true,
                  createdAt: responseUser.created_at || new Date().toISOString(),
                  lastLoginAt: new Date().toISOString(),
                  companyId: responseProfile.companyId || responseProfile.company_id || responseProfile.company?.id
                }

                if (typeof window !== 'undefined') {
                  const authToken = responseData?.access_token || response.data?.access_token || responseData?.jwtToken || response.data?.jwtToken
                  if (authToken) {
                    localStorage.setItem('token', authToken)
                  }
                  localStorage.setItem('provider', 'local')
                  localStorage.setItem('loggedInUser', JSON.stringify(this.loggedInUser))
                  if (responseProfile && Object.keys(responseProfile).length > 0) {
                    localStorage.setItem('profile', JSON.stringify(responseProfile))
                    if (responseProfile.role) {
                      localStorage.setItem('role', responseProfile.role)
                    }
                  }
                }

                if (!this.loggedInUser.id) {
                  this.initializeFromStorage()
                }

                resolve(response.data)
              } else {
                reject({
                  message: "Invalid response format",
                  success: false
                })
              }
            })
            .catch((error) => {
              console.log(error)
              if (error.response) {
                const statusCode = error.response.status
                const errorData = error.response.data || {}

                this.error = errorData.error || "An error occurred"

                reject({
                  message: this.error,
                  success: false,
                  statusCode
                })
              } else {
                this.error = "Network error. Please try again"
                reject({
                  message: this.error,
                  success: false
                })
              }
            })
            .finally(() => {
              this.loading = false
            })
      })
    },
      
    register(userData: RegistrationData) {
      this.loading = true

      return new Promise((resolve, reject) => {
        const signupPayload = {
          ...userData,
          email: userData.email || userData.emailAddress,
          role: userData.role || 'mentee',
        }

        jwt.register(signupPayload)
          .then((response) => {
            // Since axios interceptor handles decryption, response.data is already decrypted
            if (response && response.data) {
              const responseData = response.data.data || response.data
              const responseUser = responseData?.user || response.data?.user || {}
              const responseProfile = responseData?.profile || response.data?.profile || {}
              const resolvedEmail = responseUser.email || userData.email || userData.emailAddress || ''
              const resolvedUserId = responseUser.id || responseData.id || responseProfile.id || ''
              
              // Create User object from registration response
              this.loggedInUser = {
                id: resolvedUserId || responseData.tenantId || responseData.sub,
                email: resolvedEmail,
                name: responseData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
                firstName: userData.firstName || undefined,
                lastName: userData.lastName || undefined,
                provider: 'local',
                roles: (responseData.roles || (responseProfile.role ? [responseProfile.role] : null))?.map((roleName: string) => {
                  const role = normalizeFrontendRoleName(roleName)
                  return DEFAULT_ROLES[role] || DEFAULT_ROLES.employee
                }) || [DEFAULT_ROLES.employee],
                isVerified: false, // Email verification required
                createdAt: responseData.createdAt || new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                companyId: responseData.tenantId || responseProfile.companyId || responseProfile.company_id
              }

              // Token handling can be uncommented if needed
              // if (responseData.authToken && typeof window !== 'undefined') {
              //   localStorage.setItem('token', responseData.authToken)
              // }

              resolve(response.data)
            } else {
              reject({
                message: "Invalid response format",
                success: false
              })
            }
          })
          .catch((error) => {
            if (error.response) {
              const statusCode = error.response.status
              const errorData = error.response.data || {}

              this.error = errorData.message || "An error occurred"

              reject({
                message: this.error,
                success: false,
                statusCode
              })
            } else {
              this.error = "Network error. Please try again"
              reject({
                message: this.error,
                success: false
              })
            }
          })
          .finally(() => {
            this.loading = false
          })
      })
    }, 

    requestPasswordReset(email: string, redirectTo?: string) {
      this.loading = true

      return new Promise((resolve, reject) => {
        jwt.forgotPassword({ email, redirectTo })
          .then((response) => {
            if (response && response.data) {
              resolve(response.data)
            } else {
              reject({
                message: 'Invalid response format',
                success: false,
              })
            }
          })
          .catch((error) => {
            if (error.response) {
              const errorData = error.response.data || {}
              this.error = errorData.error || errorData.message || 'Failed to send password reset email'
              reject({
                message: this.error,
                success: false,
                statusCode: error.response.status,
              })
            } else {
              this.error = 'Network error. Please try again'
              reject({
                message: this.error,
                success: false,
              })
            }
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    resetPasswordWithRecoveryToken(accessToken: string, password: string) {
      this.loading = true

      return new Promise((resolve, reject) => {
        jwt.resetPassword({ accessToken, password })
          .then((response) => {
            if (response && response.data) {
              resolve(response.data)
            } else {
              reject({
                message: 'Invalid response format',
                success: false,
              })
            }
          })
          .catch((error) => {
            if (error.response) {
              const errorData = error.response.data || {}
              this.error = errorData.error || errorData.message || 'Failed to reset password'
              reject({
                message: this.error,
                success: false,
                statusCode: error.response.status,
              })
            } else {
              this.error = 'Network error. Please try again'
              reject({
                message: this.error,
                success: false,
              })
            }
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    async confirmEmail(token: string) {
      this.loading = true;
      let confirmEmailResponse: any = null;

      try {
        confirmEmailResponse = await jwt.confirmEmail(token)
          .then((response) => {
            // Since axios interceptor handles decryption, response.data is already decrypted
            return response.data;
          })
          .catch((error) => {
            this.error = error.message
            throw error;
          })

        return confirmEmailResponse;
      } catch (error: any) {
        this.error = error.message
        throw error;
      } finally {
        this.loading = false
      }
    },

    async completeInvitationSignup(data: {
      email: string;
      password: string;
      invitationToken: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      dateOfBirth?: string;
    }) {
      this.loading = true

      return new Promise((resolve, reject) => {
        jwt.completeInvitationSignup(data)
          .then((response) => {
            if (response && response.data) {
              const responseData = response.data.data || response.data

              // Create User object from invitation signup response
              this.loggedInUser = {
                id: responseData.user?.id || responseData.id,
                email: data.email,
                name: responseData.user?.name || `${data.firstName} ${data.lastName}`,
                firstName: data.firstName,
                lastName: data.lastName,
                provider: 'local',
                roles: responseData.profile?.role
                  ? [DEFAULT_ROLES[normalizeFrontendRoleName(responseData.profile.role)] || DEFAULT_ROLES.employee]
                  : [DEFAULT_ROLES.employee],
                isVerified: true,
                createdAt: responseData.user?.createdAt || new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                companyId: responseData.profile?.companyId
              }

              // Store auth tokens
              if (response.data.access_token && typeof window !== 'undefined') {
                localStorage.setItem('token', response.data.access_token)
                localStorage.setItem('loggedInUser', JSON.stringify(response.data.user))

                if (response.data.profile) {
                  localStorage.setItem('profile', JSON.stringify(response.data.profile))
                  localStorage.setItem('role', response.data.profile.role || 'mentee')
                }
              }

              resolve(response.data)
            } else {
              reject({
                message: "Invalid response format",
                success: false
              })
            }
          })
          .catch((error) => {
            console.error('Complete invitation signup error:', error)
            if (error.response) {
              const statusCode = error.response.status
              const errorData = error.response.data || {}

              this.error = errorData.error || errorData.message || "An error occurred"

              reject({
                message: this.error,
                success: false,
                statusCode
              })
            } else {
              this.error = "Network error. Please try again"
              reject({
                message: this.error,
                success: false
              })
            }
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    async completeCompanyRegistrationSignup(data: {
      email: string;
      password: string;
      registrationToken: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      dateOfBirth?: string;
    }) {
      this.loading = true

      return new Promise((resolve, reject) => {
        jwt.completeCompanyRegistration(data)
          .then((response) => {
            if (response && response.data) {
              this.applyAuthenticatedSession(response.data, {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
              })

              resolve(response.data)
            } else {
              reject(new Error('Invalid response from server'))
            }
          })
          .catch((error) => {
            const message = error.response?.data?.error || error.message || 'Failed to complete company registration'
            this.error = message
            reject(new Error(message))
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    applyAuthenticatedSession(payload: any, fallback: { email: string; firstName: string; lastName: string }) {
      const responseData = payload.data || payload

      this.loggedInUser = {
        id: responseData.user?.id || responseData.id,
        email: fallback.email,
        name: responseData.user?.name || `${fallback.firstName} ${fallback.lastName}`,
        firstName: fallback.firstName,
        lastName: fallback.lastName,
        provider: 'local',
        roles: responseData.profile?.role
          ? [DEFAULT_ROLES[normalizeFrontendRoleName(responseData.profile.role)] || DEFAULT_ROLES.corporate_admin]
          : [DEFAULT_ROLES.corporate_admin],
        isVerified: true,
        createdAt: responseData.user?.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        companyId: responseData.profile?.company?.id || responseData.company?.companyId
      }

      if (payload.access_token && typeof window !== 'undefined') {
        localStorage.setItem('token', payload.access_token)
        localStorage.setItem('loggedInUser', JSON.stringify(payload.user))

        if (payload.profile) {
          localStorage.setItem('profile', JSON.stringify(payload.profile))
          localStorage.setItem('role', payload.profile.role || 'company')
        } else if (responseData.profile) {
          localStorage.setItem('profile', JSON.stringify(responseData.profile))
          localStorage.setItem('role', responseData.profile.role || 'company')
        } else {
          localStorage.setItem('role', 'company')
        }
      }
    },

    async goToDashboard(router: any) {
      try {
        await router.push('/app/dashboard')
      } catch (error: any) {
        this.error = error.message
        throw error
      }
    },

    resetRegistration() {
      this.registrationData = {
        emailAddress: null,
        password: null,
        firstName: null,
        lastName: null,
        companyName: null,
        phoneNumber: null,
        noOfEmployees: null
      }
      this.currentStep = 1
      this.networkType = null
      this.error = null
    },

    setLogout() {
      this.loggedInUser = null
      this.loading = false
      this.error = null
      this.resetRegistration()
    },

    signOut() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('tenantId')
        navigateTo('/auth/login')
      }
      this.setLogout()
    }
  }
})
