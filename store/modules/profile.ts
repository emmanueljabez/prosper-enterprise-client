import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import profileApi, { type UserProfile, type UpdateProfileRequest } from '@/http/requests/app/profile'

export const useProfileStore = defineStore('profile', () => {
  // State
  const profile = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const fullName = computed(() => {
    if (!profile.value) return ''
    return `${profile.value.firstName} ${profile.value.lastName}`.trim()
  })

  const initials = computed(() => {
    if (!profile.value) return ''
    const firstInitial = profile.value.firstName?.charAt(0) || ''
    const lastInitial = profile.value.lastName?.charAt(0) || ''
    return `${firstInitial}${lastInitial}`.toUpperCase()
  })

  const isProfileComplete = computed(() => {
    if (!profile.value) return false

    const requiredFields = [
      profile.value.firstName,
      profile.value.lastName,
      profile.value.email,
      profile.value.phone
    ]

    const optionalFields = [
      profile.value.bio,
      profile.value.location,
      profile.value.industry,
      profile.value.avatarUrl
    ]

    const requiredComplete = requiredFields.every(field => field && field.trim() !== '')
    const optionalComplete = optionalFields.filter(field => field && field.trim() !== '').length

    // Calculate completion percentage
    const totalFields = requiredFields.length + optionalFields.length
    const completedFields = requiredFields.filter(field => field && field.trim() !== '').length + optionalComplete

    return {
      isComplete: requiredComplete,
      percentage: Math.round((completedFields / totalFields) * 100)
    }
  })

  // Actions
  const fetchProfile = async (userId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await profileApi.getUserProfile(userId)
      profile.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching profile'
      console.error('Error fetching profile:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (userId: string, profileData: UpdateProfileRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await profileApi.updateUserProfile(userId, profileData)
      profile.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'An error occurred while updating profile'
      console.error('Error updating profile:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const uploadAvatar = async (userId: string, file: File) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await profileApi.uploadAvatar(userId, file)

      // Update profile with new avatar URL
      if (profile.value) {
        profile.value.avatarUrl = data.avatarUrl
      }

      return data
    } catch (err: any) {
      error.value = err.message || 'An error occurred while uploading avatar'
      console.error('Error uploading avatar:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteAvatar = async (userId: string) => {
    isLoading.value = true
    error.value = null

    try {
      await profileApi.deleteAvatar(userId)

      // Remove avatar URL from profile
      if (profile.value) {
        profile.value.avatarUrl = null
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while deleting avatar'
      console.error('Error deleting avatar:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const resetProfile = () => {
    profile.value = null
    error.value = null
    isLoading.value = false
  }

  return {
    // State
    profile,
    isLoading,
    error,

    // Computed
    fullName,
    initials,
    isProfileComplete,

    // Actions
    fetchProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    clearError,
    resetProfile
  }
})
