import axiosInstance from "../../axios/index"

export default {
    fetchLeadSources() {
        return axiosInstance.get(`/settings/LeadSources`)
    },

    createLeadSource(leadSource: any) {
        return axiosInstance.post(`/settings/createLeadSource`, leadSource)
    },

    updateLeadSource(leadSourceId: number, leadSource: any) {
        return axiosInstance.put(`/settings/editLeadSource/${leadSourceId}`, leadSource)
    },

    deleteLeadSource(leadSourceId: number) {
        return axiosInstance.delete(`/settings/deleteLeadSource/${leadSourceId}`)
    }
}