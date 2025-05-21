import axiosInstance from "../../../../../axios/index"
import type { ServiceArea } from '@/types/administration/configuration/organization/service-coverage-areas';

export default {
    fetchServiceAreas() {
        return axiosInstance.get('/settings/serviceCoverageAreas')
    },

    createServiceArea(serviceArea: ServiceArea) {
        return axiosInstance.post('/settings/createCoverageArea', serviceArea)
    },

    updateServiceArea(serviceAreaId: number, serviceArea: ServiceArea) {
        return axiosInstance.put(`/settings/editCoverageArea/${serviceAreaId}`, serviceArea)
    },

    deleteServiceArea(serviceAreaId: number) {
        return axiosInstance.delete(`/settings/deleteCoverageArea/${serviceAreaId}`)
    },

    getServiceAreaById(serviceAreaId: number) {
        return axiosInstance.get(`/settings/serviceCoverageArea/${serviceAreaId}`)
    }
}