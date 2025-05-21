import { defineStore } from 'pinia';
import leads from '@/http/requests/app/sales/leads';
import type { Lead, LeadsState } from '@/types/sales/leads';

export const useLeadsStore = defineStore('leads', {
  state: (): LeadsState => ({
    leads: [],
    loading: false,
    error: null,
  }),

  getters: {
    getLeads: (state) => state.leads,
    getIsLoading: (state) => state.loading,
    getError: (state) => state.error,
  },

  actions: {
    fetchLeads() {
      this.loading = true;
      return new Promise((resolve, reject) => {
        leads.fetchLeads()
          .then((response) => {
            this.leads = response.data.data.content;
            this.loading = false;
            resolve(response);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching leads.';
            reject(error);
          });
      });
    },

    createLead(lead: Lead) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        leads.createLead(lead)
          .then((response) => {
            this.leads.push(response.data.data);
            this.loading = false;
            resolve(response);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while creating lead.';
            reject(error);
          });
      });
    },

    updateLead(lead: Lead) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        const leadId = lead.id;
        leads.updateLead(leadId, lead)
          .then((response) => {
            const index = this.leads.findIndex(l => l.id === leadId);
            if (index !== -1) {
              this.leads[index] = response.data.data;
            }
            this.loading = false;
            resolve(response);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while updating lead.';
            reject(error);
          });
      });
    },

    deleteLead(leadId: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        leads.deleteLead(leadId)
          .then((response) => {
            this.leads = this.leads.filter(lead => lead.id !== leadId);
            this.loading = false;
            resolve(response);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while deleting lead.';
            reject(error);
          });
      });
    },

   
  },
});