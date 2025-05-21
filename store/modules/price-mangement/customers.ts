import { defineStore } from 'pinia';
import customersApi from '@/http/requests/app/price-management/customers';
import { mockCustomersApi } from '@/mock/mockCustomersData';
import type { Customer, CustomerGroup, CustomersState } from '@/types/price-management/customers';

// Determine if we're in development environment
const isDev = process.env.NODE_ENV === 'development';

export const useCustomersStore = defineStore('customers', {
  state: (): CustomersState => ({
    customers: [],
    customerGroups: [],
    loading: false,
    error: null,
    useMockData: isDev // Default to mock data in development
  }),

  getters: {
    getCustomers: (state) => state.customers,
    getCustomerGroups: (state) => state.customerGroups,
    getIsLoading: (state) => state.loading,
    getError: (state) => state.error,
    
    // Get customer by ID
    getCustomerById: (state) => (id: string) => {
      return state.customers.find(customer => customer.id === id);
    },
    
    // Get customer group by ID
    getCustomerGroupById: (state) => (id: string) => {
      return state.customerGroups.find(group => group.id === id);
    },
    
    // Get customers by group ID
    getCustomersByGroup: (state) => (groupId: string) => {
      return state.customers.filter(customer => customer.groupId === groupId);
    },
    
    // Get default customer group
    getDefaultCustomerGroup: (state) => {
      return state.customerGroups.find(group => group.isDefault) || null;
    }
  },

  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },

    // Customer CRUD operations
    async fetchCustomers() {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock customer data");
          response = await mockCustomersApi.fetchCustomers();
        } else {
          // Use real API
          console.log("Using API customer data");
          response = await customersApi.fetchCustomers();
        }
        this.customers = response.data.data.content;
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while fetching customers.';
        throw error;
      }
    },

    async createCustomer(customer: Customer) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockCustomersApi.createCustomer(customer);
        } else {
          response = await customersApi.createCustomer(customer);
        }
        
        // Add the new customer to the store
        this.customers.push(response.data.data);
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while creating customer.';
        throw error;
      }
    },

    async updateCustomer(customer: Customer) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockCustomersApi.updateCustomer(customer.id, customer);
        } else {
          response = await customersApi.updateCustomer(customer.id, customer);
        }
        
        const index = this.customers.findIndex(c => c.id === customer.id);
        if (index !== -1) {
          this.customers[index] = response.data.data;
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating customer.';
        throw error;
      }
    },

    async deleteCustomer(customerId: string) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockCustomersApi.deleteCustomer(customerId);
        } else {
          response = await customersApi.deleteCustomer(customerId);
        }
        
        this.customers = this.customers.filter(customer => customer.id !== customerId);
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while deleting customer.';
        throw error;
      }
    },

    async updateCustomerStatus(customerId: string, status: string, reason?: string) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockCustomersApi.updateCustomerStatus(customerId, status, reason);
        } else {
          response = await customersApi.updateCustomerStatus(customerId, status, reason);
        }
        
        const index = this.customers.findIndex(c => c.id === customerId);
        if (index !== -1) {
          this.customers[index].status = status;
          if (reason) {
            this.customers[index].statusReason = reason;
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating customer status.';
        throw error;
      }
    },

    async bulkUpdateCustomers(customerIds: string[], updates: any) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockCustomersApi.bulkUpdateCustomers(customerIds, updates);
        } else {
          response = await customersApi.bulkUpdateCustomers(customerIds, updates);
        }
        
        // Update customers in the store
        customerIds.forEach(id => {
          const index = this.customers.findIndex(c => c.id === id);
          if (index !== -1) {
            Object.keys(updates).forEach(key => {
              this.customers[index][key] = updates[key];
            });
          }
        });
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred during bulk customer update.';
        throw error;
      }
    },

    // Customer Group CRUD operations
    async fetchCustomerGroups() {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockCustomersApi.fetchCustomerGroups();
        } else {
          response = await customersApi.fetchCustomerGroups();
        }
        this.customerGroups = response.data.data.content;
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while fetching customer groups.';
        throw error;
      }
    },

    async createCustomerGroup(group: CustomerGroup) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockCustomersApi.createCustomerGroup(group);
        } else {
          response = await customersApi.createCustomerGroup(group);
        }
        
        // Add the new group to the store
        this.customerGroups.push(response.data.data);
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while creating customer group.';
        throw error;
      }
    },

    async updateCustomerGroup(groupId: string, updates: Partial<CustomerGroup>) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockCustomersApi.updateCustomerGroup(groupId, updates);
        } else {
          response = await customersApi.updateCustomerGroup(groupId, updates);
        }
        
        const index = this.customerGroups.findIndex(g => g.id === groupId);
        if (index !== -1) {
          this.customerGroups[index] = {
            ...this.customerGroups[index],
            ...response.data.data
          };
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating customer group.';
        throw error;
      }
    },

    async deleteCustomerGroup(groupId: string) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockCustomersApi.deleteCustomerGroup(groupId);
        } else {
          response = await customersApi.deleteCustomerGroup(groupId);
        }
        
        this.customerGroups = this.customerGroups.filter(group => group.id !== groupId);
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while deleting customer group.';
        throw error;
      }
    },

    async setDefaultCustomerGroup(groupId: string) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockCustomersApi.setDefaultCustomerGroup(groupId);
        } else {
          response = await customersApi.setDefaultCustomerGroup(groupId);
        }
        
        // Update all groups to set only the selected one as default
        this.customerGroups = this.customerGroups.map(group => ({
          ...group,
          isDefault: group.id === groupId
        }));
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while setting default customer group.';
        throw error;
      }
    },

    async assignCustomersToGroup(customerIds: string[], groupId: string) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockCustomersApi.assignCustomersToGroup(customerIds, groupId);
        } else {
          response = await customersApi.assignCustomersToGroup(customerIds, groupId);
        }
        
        // Update customers in the store
        customerIds.forEach(id => {
          const index = this.customers.findIndex(c => c.id === id);
          if (index !== -1) {
            this.customers[index].groupId = groupId;
          }
        });
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while assigning customers to group.';
        throw error;
      }
    }
  }
});