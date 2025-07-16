import { defineStore } from 'pinia'
import { usersApi } from '@/http/requests/app/users/users'
import type { User } from '@/types/users'

interface UsersState {
  users: User[]
  loading: boolean
  error: string | null
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    loading: false,
    error: null
  }),

  getters: {
    getAllUsers: (state) => state.users,
    getUsersCount: (state) => state.users.length,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    getError: (state) => state.error,
    
    // Get user by ID
    getUserById: (state) => (id: number) => {
      return state.users.find(user => user.id === id)
    },
    
    // Get users by department
    getUsersByDepartment: (state) => (departmentId: number) => {
      return state.users.filter(user => 
        user.departments?.some(dept => dept.id === departmentId)
      )
    },
    
    // Get active users
    getActiveUsers: (state) => {
      return state.users.filter(user => user.status === 'ACTIVE')
    }
  },

  actions: {
    /**
     * Fetch all tenant users
     */
    fetchTenantUsers() {
      this.loading = true
      return new Promise((resolve, reject) => {
        usersApi.fetchTenantUsers()
          .then((response) => {
            this.users = response.data || []
            this.loading = false
            resolve(response.data)
          })
          .catch((error) => {
            this.loading = false
            this.error = error.response?.data?.message || 'An error occurred while fetching users.'
            reject(error)
          })
      })
    },

    /**
     * Clear users data
     */
    clearUsers() {
      this.users = []
      this.error = null
    },

    /**
     * Reset store state
     */
    resetState() {
      this.users = []
      this.loading = false
      this.error = null
    }
  }
})
