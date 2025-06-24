import { defineStore } from 'pinia'
import jwt from '@/http/requests/auth/jwt'
import type { AuthState, RegistrationData, LoginData, JwtPayload } from '@/types/auth'
import { useRouter } from 'vue-router'
import { navigateTo } from 'nuxt/app'
import { jwtDecode } from 'jwt-decode'

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
    networkType: null
  }),

  getters: {
    registrationEmail: (state) => state.registrationData.emailAddress,
  },

  actions: {
    initializeFromStorage() {
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token')
          if (!token) {
            this.loggedInUser = null
            return false
          }

          const decoded = jwtDecode<JwtPayload>(token)
          const currentTime = Date.now() / 1000

          if (decoded.exp && decoded.exp > currentTime) {
            this.loggedInUser = decoded.sub
            return true
          } else {
            localStorage.removeItem('token')
            this.loggedInUser = null
            return false
          }
        } else {
          this.loggedInUser = null;
          return false;
        }
      } catch (error) {
        // console.error('Auth store initialization error:', error)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
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
    
    login(loginData: LoginData) {
      this.loading = true
      return new Promise((resolve, reject) => {
        jwt.login(loginData)
          .then((response) => {

            if (response && response.data) {
              // Handle the decrypted response structure
              const responseData = response.data.data || response.data
              console.log('Decrypted response data:', responseData)
              this.loggedInUser = responseData.name || responseData.tenantId

              if (responseData.jwtToken&& typeof window !== 'undefined') {
                localStorage.setItem('token', responseData.jwtToken)
                // localStorage.setItem('tenantId', responseData.tenantId)
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
    
    register(userData: RegistrationData) {
      this.loading = true

      return new Promise((resolve, reject) => {
        jwt.register(userData)
          .then((response) => {
            // Since axios interceptor handles decryption, response.data is already decrypted
            if (response && response.data) {
              const responseData = response.data.data || response.data
              this.loggedInUser = responseData.name || responseData.tenantId

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