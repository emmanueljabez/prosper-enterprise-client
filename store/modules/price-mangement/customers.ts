import { defineStore } from 'pinia';
import customersApi from '@/http/requests/app/dashboard/customer';
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerQueryParams,
  CustomerFilters,
  CustomerGroup,
  CustomerSummary,
  CustomerStatus,
  CustomerValidation,
  PaginatedResponse,
  ApiResponse
} from '@/types/price-management/customers';

interface CustomersStoreState {
  customers: Customer[];
  paginatedCustomers: PaginatedResponse<Customer> | null;
  selectedCustomer: Customer | null;
  customersList: Customer[];
  customerGroups: CustomerGroup[];
  customerSummary: CustomerSummary | null;
  searchResults: Customer[];
  validationResult: CustomerValidation | null;
  loading: boolean;
  error: string | null;
  filters: CustomerQueryParams;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  
  // Legacy support
  isLoading: boolean;
  useMockData: boolean;
}

export const useCustomersStore = defineStore('customers', {
  state: (): CustomersStoreState => ({
    customers: [],
    paginatedCustomers: null,
    selectedCustomer: null,
    customersList: [],
    customerGroups: [],
    customerSummary: null,
    searchResults: [],
    validationResult: null,
    loading: false,
    error: null,
    filters: {},
    pagination: {
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0
    },
    
    // Legacy support
    isLoading: false,
    useMockData: false
  }),

  getters: {
    getCustomers: (state) => state.customers,
    getPaginatedCustomers: (state) => state.paginatedCustomers,
    getSelectedCustomer: (state) => state.selectedCustomer,
    getCustomersList: (state) => state.customersList,
    getCustomerGroups: (state) => state.customerGroups,
    getCustomerSummary: (state) => state.customerSummary,
    getSearchResults: (state) => state.searchResults,
    getValidationResult: (state) => state.validationResult,
    getIsLoading: (state) => state.loading || state.isLoading,
    getError: (state) => state.error,
    getFilters: (state) => state.filters,
    getPagination: (state) => state.pagination,
    
    // Status-based getters
    getActiveCustomers: (state) => {
      return state.customers.filter(customer => customer.status === 'ACTIVE');
    },
    getInactiveCustomers: (state) => {
      return state.customers.filter(customer => customer.status === 'INACTIVE');
    },
    getSuspendedCustomers: (state) => {
      return state.customers.filter(customer => customer.status === 'SUSPENDED');
    },
    getPendingApprovalCustomers: (state) => {
      return state.customers.filter(customer => customer.status === 'PENDING_APPROVAL');
    },
    
    // Type-based getters
    getIndividualCustomers: (state) => {
      return state.customers.filter(customer => customer.customerType === 'INDIVIDUAL');
    },
    getBusinessCustomers: (state) => {
      return state.customers.filter(customer => customer.customerType === 'BUSINESS');
    },
    getCorporateCustomers: (state) => {
      return state.customers.filter(customer => customer.customerType === 'CORPORATE');
    },
    
    // Data source based getters
    getLocalCustomers: (state) => {
      return state.customers.filter(customer => customer.local);
    },
    getQuickBooksCustomers: (state) => {
      return state.customers.filter(customer => customer.quickBooks);
    },
    
    // Tax-based getters
    getTaxEligibleCustomers: (state) => {
      return state.customers.filter(customer => customer.taxEligibilityStatus === 'ENROLLED');
    },
    getTaxExemptCustomers: (state) => {
      return state.customers.filter(customer => customer.taxEligibilityStatus === 'EXEMPT');
    },
    
    // Group-based getters
    getCustomersByGroup: (state) => (groupId: number) => {
      return state.customers.filter(customer => customer.groupId === groupId);
    },
    getDefaultCustomerGroup: (state) => {
      return state.customerGroups.find(group => group.isDefault) || null;
    },
    
    // Statistical getters
    getCustomersCount: (state) => state.customers.length,
    getActiveCustomersCount: (state) => {
      return state.customers.filter(customer => customer.status === 'ACTIVE').length;
    },
    getHasCustomers: (state) => {
      return state.customers.length > 0;
    },
    getHasError: (state) => state.error !== null,
    
    // Finder getters
    getCustomerById: (state) => (id: number) => {
      return state.customers.find(customer => customer.id === id);
    },
    getCustomerByDisplayId: (state) => (displayId: string) => {
      return state.customers.find(customer => customer.displayId === displayId);
    },
    getCustomerGroupById: (state) => (id: number) => {
      return state.customerGroups.find(group => group.id === id);
    },
    
    // Validation getters
    getValidationErrors: (state) => state.validationResult?.errors || [],
    getValidationWarnings: (state) => state.validationResult?.warnings || [],
    getIsValidConfiguration: (state) => state.validationResult?.isValid ?? true,
  },

  actions: {
    // Fetch operations
    fetchCustomers(params?: CustomerQueryParams) {
      this.loading = true;
      this.isLoading = true;
      return new Promise((resolve, reject) => {
        customersApi.getCustomers(params)
          .then((response) => {
            this.paginatedCustomers = response.data.data!;
            this.customers = response.data.data!.content;
            this.customersList = response.data.data!.content;
            this.pagination = {
              page: response.data.data!.number,
              size: response.data.data!.size,
              totalElements: response.data.data!.totalElements,
              totalPages: response.data.data!.totalPages
            };
            
            console.log('Fetched customers:', this.paginatedCustomers);
            this.loading = false;
            this.isLoading = false;
            resolve(response.data.data);
          })
          .catch((error) => {
            this.loading = false;
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching customers.';
            reject(error);
          });
      });
    },

    fetchAllCustomers(params?: CustomerQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        customersApi.getAllCustomers(params)
          .then((response) => {
            this.customers = response.data;
            this.customersList = response.data;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching all customers.';
            reject(error);
          });
      });
    },

    fetchCustomerById(id: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        customersApi.getCustomerById(id)
          .then((response) => {
            this.selectedCustomer = response.data.data!;
            
            // Update in customers list if it exists
            const existingIndex = this.customers.findIndex(customer => customer.id === id);
            if (existingIndex !== -1) {
              this.customers[existingIndex] = response.data.data!;
            } else {
              this.customers.push(response.data.data!);
            }
            
            this.loading = false;
            resolve(response.data.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching customer.';
            reject(error);
          });
      });
    },

    fetchCustomerByDisplayId(displayId: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        customersApi.getCustomerByDisplayId(displayId)
          .then((response) => {
            this.selectedCustomer = response.data.data!;
            this.loading = false;
            resolve(response.data.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching customer by display ID.';
            reject(error);
          });
      });
    },

    searchCustomers(params: CustomerQueryParams & { searchTerm: string }) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        customersApi.searchCustomers(params)
          .then((response) => {
            this.searchResults = response.data.data!.content || [];
            this.paginatedCustomers = response.data.data!;
            this.loading = false;
            resolve(response.data.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while searching customers.';
            reject(error);
          });
      });
    },

    fetchCustomersByStatus(status: CustomerStatus, params?: CustomerQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        customersApi.getCustomersByStatus(status, params)
          .then((response) => {
            this.paginatedCustomers = response.data.data!;
            this.loading = false;
            resolve(response.data.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching customers by status.';
            reject(error);
          });
      });
    },

    // CRUD operations
    createCustomer(customerData: CreateCustomerRequest) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        customersApi.createCustomer(customerData)
          .then((response) => {
            const newCustomer = response.data.data!;
            this.customers.push(newCustomer);
            this.customersList.push(newCustomer);
            
            // Update paginated customers if they exist
            if (this.paginatedCustomers) {
              this.paginatedCustomers.content.unshift(newCustomer);
              this.paginatedCustomers.totalElements++;
            }
            
            this.loading = false;
            resolve(newCustomer);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while creating customer.';
            reject(error);
          });
      });
    },

    updateCustomer(id: number, customerData: UpdateCustomerRequest) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        customersApi.updateCustomer(id, customerData)
          .then((response) => {
            const updatedCustomer = response.data.data!;
            
            // Update in customers list
            const index = this.customers.findIndex(customer => customer.id === id);
            if (index !== -1) {
              this.customers[index] = updatedCustomer;
            }
            
            // Update in customers list
            const listIndex = this.customersList.findIndex(customer => customer.id === id);
            if (listIndex !== -1) {
              this.customersList[listIndex] = updatedCustomer;
            }
            
            // Update selected customer if it's the same
            if (this.selectedCustomer?.id === id) {
              this.selectedCustomer = updatedCustomer;
            }
            
            // Update in paginated customers
            if (this.paginatedCustomers) {
              const paginatedIndex = this.paginatedCustomers.content.findIndex(customer => customer.id === id);
              if (paginatedIndex !== -1) {
                this.paginatedCustomers.content[paginatedIndex] = updatedCustomer;
              }
            }
            
            this.loading = false;
            resolve(response.data.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while updating customer.';
            reject(error);
          });
      });
    },

    deleteCustomer(id: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        customersApi.deleteCustomer(id)
          .then(() => {
            this.customers = this.customers.filter(customer => customer.id !== id);
            this.customersList = this.customersList.filter(customer => customer.id !== id);
            
            if (this.selectedCustomer?.id === id) {
              this.selectedCustomer = null;
            }
            
            // Remove from paginated customers
            if (this.paginatedCustomers) {
              this.paginatedCustomers.content = this.paginatedCustomers.content.filter(customer => customer.id !== id);
              this.paginatedCustomers.totalElements--;
            }
            
            this.loading = false;
            resolve(true);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while deleting customer.';
            reject(error);
          });
      });
    },

    // Status operations
    updateCustomerStatus(id: number, status: CustomerStatus, reason?: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        customersApi.updateCustomerStatus(id, status, reason)
          .then((response) => {
            const updatedCustomer = response.data.data!;
            
            // Update in customers list
            const index = this.customers.findIndex(customer => customer.id === id);
            if (index !== -1) {
              this.customers[index] = updatedCustomer;
            }
            
            // Update in customers list
            const listIndex = this.customersList.findIndex(customer => customer.id === id);
            if (listIndex !== -1) {
              this.customersList[listIndex] = updatedCustomer;
            }
            
            // Update selected customer if it's the same
            if (this.selectedCustomer?.id === id) {
              this.selectedCustomer = updatedCustomer;
            }
            
            // Update in paginated customers
            if (this.paginatedCustomers) {
              const paginatedIndex = this.paginatedCustomers.content.findIndex(customer => customer.id === id);
              if (paginatedIndex !== -1) {
                this.paginatedCustomers.content[paginatedIndex] = updatedCustomer;
              }
            }
            
            this.loading = false;
            resolve(response.data.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while updating customer status.';
            reject(error);
          });
      });
    },

    // Validation operations
    validateCustomer(customerData: CreateCustomerRequest | UpdateCustomerRequest) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        customersApi.validateCustomer(customerData)
          .then((response) => {
            this.validationResult = {
              isValid: response.data.data!.valid,
              errors: response.data.data!.errors,
              warnings: response.data.data!.warnings,
              validatedFields: {}
            };
            this.loading = false;
            resolve(response.data.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while validating customer.';
            reject(error);
          });
      });
    },

    // Summary and metrics
    fetchCustomerSummary() {
      this.loading = true;
      return new Promise((resolve, reject) => {
        customersApi.getCustomerSummary()
          .then((response) => {
            this.customerSummary = response.data.data!;
            this.loading = false;
            resolve(response.data.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching customer summary.';
            reject(error);
          });
      });
    },

    // Bulk operations
    bulkUpdateStatus(customerIds: number[], status: CustomerStatus, reason?: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        customersApi.bulkUpdateStatus(customerIds, status, reason)
          .then((response) => {
            const updatedCustomers = response.data.data!;
            
            // Update customers in all lists
            updatedCustomers.forEach(updatedCustomer => {
              const index = this.customers.findIndex(customer => customer.id === updatedCustomer.id);
              if (index !== -1) {
                this.customers[index] = updatedCustomer;
              }
              
              const listIndex = this.customersList.findIndex(customer => customer.id === updatedCustomer.id);
              if (listIndex !== -1) {
                this.customersList[listIndex] = updatedCustomer;
              }
              
              if (this.paginatedCustomers) {
                const paginatedIndex = this.paginatedCustomers.content.findIndex(customer => customer.id === updatedCustomer.id);
                if (paginatedIndex !== -1) {
                  this.paginatedCustomers.content[paginatedIndex] = updatedCustomer;
                }
              }
            });
            
            this.loading = false;
            resolve(updatedCustomers);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while bulk updating customer status.';
            reject(error);
          });
      });
    },

    bulkDeleteCustomers(customerIds: number[]) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        customersApi.bulkDelete(customerIds)
          .then(() => {
            // Remove customers from all lists
            this.customers = this.customers.filter(customer => !customerIds.includes(customer.id));
            this.customersList = this.customersList.filter(customer => !customerIds.includes(customer.id));
            
            if (this.paginatedCustomers) {
              this.paginatedCustomers.content = this.paginatedCustomers.content.filter(customer => !customerIds.includes(customer.id));
              this.paginatedCustomers.totalElements -= customerIds.length;
            }
            
            // Clear selected customer if it was deleted
            if (this.selectedCustomer && customerIds.includes(this.selectedCustomer.id)) {
              this.selectedCustomer = null;
            }
            
            this.loading = false;
            resolve(true);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while bulk deleting customers.';
            reject(error);
          });
      });
    },

    // Utility actions
    setSelectedCustomer(customer: Customer | null) {
      this.selectedCustomer = customer;
    },

    clearError() {
      this.error = null;
    },

    clearCustomers() {
      this.customers = [];
      this.customersList = [];
      this.paginatedCustomers = null;
      this.selectedCustomer = null;
      this.searchResults = [];
    },

    setFilters(filters: CustomerQueryParams) {
      this.filters = filters;
    },

    clearFilters() {
      this.filters = {};
    },

    // Legacy support methods
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    }
  }
});