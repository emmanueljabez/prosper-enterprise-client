import axiosInstance from "../../../axios/index"
import type { Lead } from '@/types/sales/leads'

export default {
    fetchLeads() {
        return axiosInstance.get('/api/leads')
    },

    fetchLeadById(leadId: number) {
        return axiosInstance.get(`/sales/lead/${leadId}`)
    },

    createLead(lead: Lead) {
        return axiosInstance.post('/api/leads', lead)
    },

    updateLead(leadId: number, lead: Lead) {
        return axiosInstance.put(`/sales/editLead/${leadId}`, lead)
    },

    deleteLead(leadId: number) {
        return axiosInstance.delete(`/sales/deleteLead/${leadId}`)
    },

}