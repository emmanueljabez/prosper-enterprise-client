import axiosInstance from '@/http/axios'
import type { ApiResponse, User } from '@/types/users'

const BASE_URL = '/master/getTenantUsers'

export const usersApi = {
  /**
   * Get all tenant users (no request parameters)
   */
  fetchTenantUsers(): Promise<ApiResponse<User[]>> {
    return axiosInstance.get(BASE_URL)
  }
}

export default usersApi