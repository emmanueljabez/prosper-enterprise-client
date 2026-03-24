import api from '@/http/axios'

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  bio: string | null
  phone: string
  location: string | null
  role: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
  expertise: string | null
  interests: string | null
  dob: string | null
  gender: string | null
  industry: string | null
  howDidYouKnowAboutUs: string | null
  linkedinUrl: string | null
  favouriteQuote: string | null
  country: string | null
  company?: {
    id: string
    name?: string | null
  } | null
}

export interface UserProfileResponse {
  success: boolean
  message: string
  data: UserProfile
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  bio?: string
  phone?: string
  location?: string
  expertise?: string
  interests?: string
  dob?: string
  gender?: string
  industry?: string
  linkedinUrl?: string
  favouriteQuote?: string
  country?: string
}

export const profileApi = {
  /**
   * Get user profile by user ID
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const { data } = await api.get(`/auth/profile/${userId}`)
    return data
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, profileData: UpdateProfileRequest): Promise<UserProfile> {
    const { data } = await api.put(`/auth/profile/${userId}`, profileData)
    return data
  },

  /**
   * Upload user avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    formData.append('avatar', file)

    const { data } = await api.post(`/auth/profile/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  },

  /**
   * Delete user avatar
   */
  async deleteAvatar(userId: string): Promise<void> {
    await api.delete(`/auth/profile/${userId}/avatar`)
  }
}

export default profileApi
