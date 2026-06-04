import axiosInstance from '~/http/axios'

export type DashboardDateFilterParams = {
  period?: string
  startDate?: string
  endDate?: string
}

const resolveDashboardFilterParams = (periodOrFilters?: string | DashboardDateFilterParams): DashboardDateFilterParams => {
  if (typeof periodOrFilters === 'string') {
    return { period: periodOrFilters }
  }

  if (periodOrFilters) {
    return periodOrFilters
  }

  return { period: 'last_30_days' }
}

export default {
  getMyDashboard(periodOrFilters: string | DashboardDateFilterParams = 'last_30_days') {
    const filters = resolveDashboardFilterParams(periodOrFilters)

    return axiosInstance.get('/v1/dashboard/me', {
      params: {
        ...(filters.period ? { period: filters.period } : {}),
        ...(filters.startDate ? { startDate: filters.startDate } : {}),
        ...(filters.endDate ? { endDate: filters.endDate } : {}),
      },
    })
  },

  getCompanyDashboard(companyId: string, periodOrFilters: string | DashboardDateFilterParams = 'last_30_days') {
    const filters = resolveDashboardFilterParams(periodOrFilters)

    return axiosInstance.get('/v1/dashboard/company', {
      params: {
        companyId,
        ...(filters.period ? { period: filters.period } : {}),
        ...(filters.startDate ? { startDate: filters.startDate } : {}),
        ...(filters.endDate ? { endDate: filters.endDate } : {}),
      },
    })
  }
}
