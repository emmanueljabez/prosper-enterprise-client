import axiosInstance from '~/http/axios'

export default {
  getMyDashboard(period = 'last_30_days') {
    return axiosInstance.get('/v1/dashboard/me', {
      params: { period }
    })
  },

  getCompanyDashboard(companyId: string, period = 'last_30_days') {
    return axiosInstance.get('/v1/dashboard/company', {
      params: {
        companyId,
        period,
      },
    })
  }
}
