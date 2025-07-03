import { defineStore } from 'pinia';
import suppliersApi from '@/http/requests/app/inventory/suppliers';
import type {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierQueryParams,
  SupplierFilters,
  SupplierContact,
  SupplierAddress,
  SupplierGroup,
  Bank,
  PaymentTerm,
  SupplierSummary,
  SupplierMetrics,
  SupplierPerformance,
  SupplierValidation,
  SupplierStatus,
  SupplierPriority,
  SupplierRating,
  PaymentAccountType,
  DataSource,
  ApiResponse,
  PaginatedResponse
} from '@/types/inventory/suppliers';

interface SuppliersStoreState {
  suppliers: Supplier[];
  paginatedSuppliers: PaginatedResponse<Supplier> | null;
  selectedSupplier: Supplier | null;
  suppliersList: Supplier[];
  contacts: SupplierContact[];
  addresses: SupplierAddress[];
  groups: SupplierGroup[];
  banks: Bank[];
  paymentTerms: PaymentTerm[];
  supplierSummary: SupplierSummary | null;
  supplierMetrics: SupplierMetrics | null;
  performanceData: SupplierPerformance[];
  searchResults: Supplier[];
  validationResult: SupplierValidation | null;
  loading: boolean;
  error: string | null;
  filters: SupplierQueryParams;
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

export const useSuppliersStore = defineStore('suppliers', {
  state: (): SuppliersStoreState => ({
    suppliers: [],
    paginatedSuppliers: null,
    selectedSupplier: null,
    suppliersList: [],
    contacts: [],
    addresses: [],
    groups: [],
    banks: [],
    paymentTerms: [],
    supplierSummary: null,
    supplierMetrics: null,
    performanceData: [],
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
    getSuppliers: (state) => state.suppliers,
    getPaginatedSuppliers: (state) => state.paginatedSuppliers,
    getSelectedSupplier: (state) => state.selectedSupplier,
    getSuppliersList: (state) => state.suppliersList,
    getContacts: (state) => state.contacts,
    getAddresses: (state) => state.addresses,
    getGroups: (state) => state.groups,
    getBanks: (state) => state.banks,
    getPaymentTerms: (state) => state.paymentTerms,
    getSupplierSummary: (state) => state.supplierSummary,
    getSupplierMetrics: (state) => state.supplierMetrics,
    getPerformanceData: (state) => state.performanceData,
    getSearchResults: (state) => state.searchResults,
    getValidationResult: (state) => state.validationResult,
    getIsLoading: (state) => state.loading || state.isLoading,
    getError: (state) => state.error,
    getFilters: (state) => state.filters,
    getPagination: (state) => state.pagination,
    
    // Status-based getters
    getActiveSuppliers: (state) => {
      return state.suppliers.filter(supplier => supplier.status === 'ACTIVE');
    },
    getInactiveSuppliers: (state) => {
      return state.suppliers.filter(supplier => supplier.status === 'INACTIVE');
    },
    getPendingApprovalSuppliers: (state) => {
      return state.suppliers.filter(supplier => supplier.status === 'PENDING_APPROVAL');
    },
    getBlockedSuppliers: (state) => {
      return state.suppliers.filter(supplier => supplier.isBlocked);
    },
    getApprovedSuppliers: (state) => {
      return state.suppliers.filter(supplier => supplier.isApproved);
    },
    
    // Priority and rating based getters
    getPreferredSuppliers: (state) => {
      return state.suppliers.filter(supplier => 
        supplier.priority === 'PREFERRED' && supplier.status === 'ACTIVE'
      );
    },
    getHighRatedSuppliers: (state) => {
      return state.suppliers.filter(supplier => 
        (supplier.rating || 0) >= 4 && supplier.status === 'ACTIVE'
      );
    },
    getTopPerformingSuppliers: (state) => {
      return state.suppliers.filter(supplier => 
        (supplier.qualityRating || 0) >= 4 && (supplier.onTimeDeliveryRate || 0) >= 90
      );
    },
    
    // Payment and data source based getters
    getSuppliersByPaymentType: (state) => (paymentType: PaymentAccountType) => {
      return state.suppliers.filter(supplier => supplier.paymentAccountType === paymentType);
    },
    getLocalSuppliers: (state) => {
      return state.suppliers.filter(supplier => supplier.local);
    },
    getQuickBooksSuppliers: (state) => {
      return state.suppliers.filter(supplier => supplier.quickBooks);
    },
    
    // Category and group based getters
    getSuppliersByCategory: (state) => (category: string) => {
      return state.suppliers.filter(supplier => supplier.category === category);
    },
    getSuppliersByGroup: (state) => (groupId: number) => {
      return state.suppliers.filter(supplier => supplier.group?.id === groupId);
    },
    
    // Statistical getters
    getSuppliersCount: (state) => state.suppliers.length,
    getActiveSuppliersCount: (state) => {
      return state.suppliers.filter(supplier => supplier.status === 'ACTIVE').length;
    },
    getHasSuppliers: (state) => {
      return state.suppliers.length > 0;
    },
    getHasError: (state) => state.error !== null,
    
    // Finder getters
    getSupplierById: (state) => (id: number) => {
      return state.suppliers.find(supplier => supplier.id === id);
    },
    getSupplierByCode: (state) => (code: string) => {
      return state.suppliers.find(supplier => supplier.code === code);
    },
    getSupplierByDisplayId: (state) => (displayId: string) => {
      return state.suppliers.find(supplier => supplier.displayId === displayId);
    },
    
    // Validation getters
    getValidationErrors: (state) => state.validationResult?.errors || [],
    getValidationWarnings: (state) => state.validationResult?.warnings || [],
    getIsValidConfiguration: (state) => state.validationResult?.isValid ?? true,
    
    // Financial getters
    getTotalPurchaseValue: (state) => {
      return state.suppliers.reduce((total, supplier) => {
        return total + (supplier.totalPurchaseValue || 0);
      }, 0);
    },
    getAverageSupplierRating: (state) => {
      const suppliersWithRating = state.suppliers.filter(s => s.rating);
      if (suppliersWithRating.length === 0) return 0;
      const totalRating = suppliersWithRating.reduce((sum, s) => sum + (s.rating || 0), 0);
      return totalRating / suppliersWithRating.length;
    },
    
    // Performance getters
    getHighPerformanceSuppliers: (state) => {
      return state.suppliers.filter(supplier => {
        const onTimeRate = supplier.onTimeDeliveryRate || 0;
        const qualityRating = supplier.qualityRating || 0;
        return onTimeRate >= 95 && qualityRating >= 4.5;
      });
    },
    
    // Contact and address getters
    getContactsBySupplier: (state) => (supplierId: number) => {
      return state.contacts.filter(contact => contact.supplierId === supplierId);
    },
    getAddressesBySupplier: (state) => (supplierId: number) => {
      return state.addresses.filter(address => address.supplierId === supplierId);
    }
  },

  actions: {
    // Fetch operations
    fetchSuppliers(params?: SupplierQueryParams) {
      this.loading = true;
      this.isLoading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getSuppliers(params)
          .then((response: ApiResponse<PaginatedResponse<Supplier>>) => {
            this.paginatedSuppliers = response.data!;
            this.suppliers = response.data!.content;
            this.suppliersList = response.data!.content;
            this.pagination = {
              page: response.data!.number,
              size: response.data!.size,
              totalElements: response.data!.totalElements,
              totalPages: response.data!.totalPages
            };
            
            console.log('Fetched suppliers:', this.paginatedSuppliers);
            this.loading = false;
            this.isLoading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching suppliers.';
            reject(error);
          });
      });
    },

    fetchAllSuppliers(params?: SupplierQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getAllSuppliers(params)
          .then((response: ApiResponse<Supplier[]>) => {
            this.suppliers = response.data!;
            this.suppliersList = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching all suppliers.';
            reject(error);
          });
      });
    },

    fetchSupplierById(id: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getSupplierById(id)
          .then((response: ApiResponse<Supplier>) => {
            this.selectedSupplier = response.data!;
            
            // Update in suppliers list if it exists
            const existingIndex = this.suppliers.findIndex(supplier => supplier.id === id);
            if (existingIndex !== -1) {
              this.suppliers[existingIndex] = response.data!;
            } else {
              this.suppliers.push(response.data!);
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching supplier.';
            reject(error);
          });
      });
    },

    fetchSupplierByCode(code: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getSupplierByCode(code)
          .then((response: ApiResponse<Supplier>) => {
            this.selectedSupplier = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching supplier by code.';
            reject(error);
          });
      });
    },

    fetchSupplierByDisplayId(displayId: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getSupplierByDisplayId(displayId)
          .then((response: ApiResponse<Supplier>) => {
            this.selectedSupplier = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching supplier by display ID.';
            reject(error);
          });
      });
    },

    searchSuppliers(params: SupplierQueryParams & { searchTerm: string }) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.searchSuppliers(params)
          .then((response: ApiResponse<PaginatedResponse<Supplier>>) => {
            this.searchResults = response.data!.content || [];
            this.paginatedSuppliers = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while searching suppliers.';
            reject(error);
          });
      });
    },

    fetchSuppliersByGroup(groupId: number, params?: SupplierQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getSuppliersByGroup(groupId, params)
          .then((response: ApiResponse<PaginatedResponse<Supplier>>) => {
            this.paginatedSuppliers = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching suppliers by group.';
            reject(error);
          });
      });
    },

    fetchSuppliersByStatus(status: SupplierStatus, params?: SupplierQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getSuppliersByStatus(status, params)
          .then((response: ApiResponse<PaginatedResponse<Supplier>>) => {
            this.paginatedSuppliers = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching suppliers by status.';
            reject(error);
          });
      });
    },

    fetchPreferredSuppliers(params?: SupplierQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getPreferredSuppliers(params)
          .then((response: ApiResponse<PaginatedResponse<Supplier>>) => {
            this.paginatedSuppliers = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching preferred suppliers.';
            reject(error);
          });
      });
    },

    fetchPendingApprovals(params?: SupplierQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getPendingApprovals(params)
          .then((response: ApiResponse<PaginatedResponse<Supplier>>) => {
            this.paginatedSuppliers = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching pending approvals.';
            reject(error);
          });
      });
    },

    // CRUD operations
    createSupplier(supplierData: CreateSupplierRequest) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.createSupplier(supplierData)
          .then((response: ApiResponse<Supplier>) => {
            const newSupplier = response.data!;
            this.suppliers.push(newSupplier);
            this.suppliersList.push(newSupplier);
            
            // Update paginated suppliers if they exist
            if (this.paginatedSuppliers) {
              this.paginatedSuppliers.content.unshift(newSupplier);
              this.paginatedSuppliers.totalElements++;
            }
            
            this.loading = false;
            resolve(newSupplier);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while creating supplier.';
            reject(error);
          });
      });
    },

    updateSupplier(id: number, supplierData: UpdateSupplierRequest) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.updateSupplier(id, supplierData)
          .then((response: ApiResponse<Supplier>) => {
            const updatedSupplier = response.data!;
            
            // Update in suppliers list
            const index = this.suppliers.findIndex(supplier => supplier.id === id);
            if (index !== -1) {
              this.suppliers[index] = updatedSupplier;
            }
            
            // Update in suppliers list
            const listIndex = this.suppliersList.findIndex(supplier => supplier.id === id);
            if (listIndex !== -1) {
              this.suppliersList[listIndex] = updatedSupplier;
            }
            
            // Update selected supplier if it's the same
            if (this.selectedSupplier?.id === id) {
              this.selectedSupplier = updatedSupplier;
            }
            
            // Update in paginated suppliers
            if (this.paginatedSuppliers) {
              const paginatedIndex = this.paginatedSuppliers.content.findIndex(supplier => supplier.id === id);
              if (paginatedIndex !== -1) {
                this.paginatedSuppliers.content[paginatedIndex] = updatedSupplier;
              }
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while updating supplier.';
            reject(error);
          });
      });
    },

    deleteSupplier(id: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.deleteSupplier(id)
          .then(() => {
            this.suppliers = this.suppliers.filter(supplier => supplier.id !== id);
            this.suppliersList = this.suppliersList.filter(supplier => supplier.id !== id);
            
            if (this.selectedSupplier?.id === id) {
              this.selectedSupplier = null;
            }
            
            // Remove from paginated suppliers
            if (this.paginatedSuppliers) {
              this.paginatedSuppliers.content = this.paginatedSuppliers.content.filter(supplier => supplier.id !== id);
              this.paginatedSuppliers.totalElements--;
            }
            
            this.loading = false;
            resolve(true);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while deleting supplier.';
            reject(error);
          });
      });
    },

    // Bulk operations
    bulkUpdateSuppliers(supplierIds: number[], updates: Partial<Supplier>) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.bulkUpdateSuppliers(supplierIds, updates)
          .then((response: ApiResponse<Supplier[]>) => {
            // Update suppliers in the state
            response.data!.forEach(updatedSupplier => {
              const index = this.suppliers.findIndex(supplier => supplier.id === updatedSupplier.id);
              if (index !== -1) {
                this.suppliers[index] = updatedSupplier;
              }
              
              const listIndex = this.suppliersList.findIndex(supplier => supplier.id === updatedSupplier.id);
              if (listIndex !== -1) {
                this.suppliersList[listIndex] = updatedSupplier;
              }
            });
            
            // Update paginated suppliers if they exist
            if (this.paginatedSuppliers) {
              response.data!.forEach(updatedSupplier => {
                const paginatedIndex = this.paginatedSuppliers!.content.findIndex(supplier => supplier.id === updatedSupplier.id);
                if (paginatedIndex !== -1) {
                  this.paginatedSuppliers!.content[paginatedIndex] = updatedSupplier;
                }
              });
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while bulk updating suppliers.';
            reject(error);
          });
      });
    },

    bulkDeleteSuppliers(supplierIds: number[]) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.bulkDeleteSuppliers(supplierIds)
          .then(() => {
            this.suppliers = this.suppliers.filter(supplier => !supplierIds.includes(supplier.id));
            this.suppliersList = this.suppliersList.filter(supplier => !supplierIds.includes(supplier.id));
            
            if (this.selectedSupplier && supplierIds.includes(this.selectedSupplier.id)) {
              this.selectedSupplier = null;
            }
            
            // Remove from paginated suppliers
            if (this.paginatedSuppliers) {
              this.paginatedSuppliers.content = this.paginatedSuppliers.content.filter(supplier => !supplierIds.includes(supplier.id));
              this.paginatedSuppliers.totalElements -= supplierIds.length;
            }
            
            this.loading = false;
            resolve(true);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while bulk deleting suppliers.';
            reject(error);
          });
      });
    },

    // Status management
    activateSupplier(id: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.activateSupplier(id)
          .then((response: ApiResponse<Supplier>) => {
            const updatedSupplier = response.data!;
            this.updateSupplierInState(id, updatedSupplier);
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while activating supplier.';
            reject(error);
          });
      });
    },

    deactivateSupplier(id: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.deactivateSupplier(id)
          .then((response: ApiResponse<Supplier>) => {
            const updatedSupplier = response.data!;
            this.updateSupplierInState(id, updatedSupplier);
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while deactivating supplier.';
            reject(error);
          });
      });
    },

    blockSupplier(id: number, reason: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.blockSupplier(id, reason)
          .then((response: ApiResponse<Supplier>) => {
            const updatedSupplier = response.data!;
            this.updateSupplierInState(id, updatedSupplier);
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while blocking supplier.';
            reject(error);
          });
      });
    },

    unblockSupplier(id: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.unblockSupplier(id)
          .then((response: ApiResponse<Supplier>) => {
            const updatedSupplier = response.data!;
            this.updateSupplierInState(id, updatedSupplier);
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while unblocking supplier.';
            reject(error);
          });
      });
    },

    // Contact management
    fetchSupplierContacts(supplierId: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getSupplierContacts(supplierId)
          .then((response: ApiResponse<SupplierContact[]>) => {
            // Update contacts for this supplier
            this.contacts = this.contacts.filter(contact => contact.supplierId !== supplierId);
            this.contacts.push(...response.data!);
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching supplier contacts.';
            reject(error);
          });
      });
    },

    // Address management
    fetchSupplierAddresses(supplierId: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getSupplierAddresses(supplierId)
          .then((response: ApiResponse<SupplierAddress[]>) => {
            // Update addresses for this supplier
            this.addresses = this.addresses.filter(address => address.supplierId !== supplierId);
            this.addresses.push(...response.data!);
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching supplier addresses.';
            reject(error);
          });
      });
    },

    // Reference data
    fetchAllGroups() {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getAllGroups()
          .then((response: ApiResponse<SupplierGroup[]>) => {
            this.groups = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching supplier groups.';
            reject(error);
          });
      });
    },

    fetchAllBanks() {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getAllBanks()
          .then((response: ApiResponse<Bank[]>) => {
            this.banks = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching banks.';
            reject(error);
          });
      });
    },

    fetchAllPaymentTerms() {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getAllPaymentTerms()
          .then((response: ApiResponse<PaymentTerm[]>) => {
            this.paymentTerms = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching payment terms.';
            reject(error);
          });
      });
    },

    // Analytics and performance
    fetchSupplierSummary(dateFrom?: string, dateTo?: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getSupplierSummary(dateFrom, dateTo)
          .then((response: ApiResponse<SupplierSummary>) => {
            this.supplierSummary = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching supplier summary.';
            reject(error);
          });
      });
    },

    fetchSupplierMetrics(period: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getSupplierMetrics(period)
          .then((response: ApiResponse<SupplierMetrics>) => {
            this.supplierMetrics = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching supplier metrics.';
            reject(error);
          });
      });
    },

    fetchSupplierPerformance(supplierId?: number, period?: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getSupplierPerformance(supplierId, period)
          .then((response: ApiResponse<SupplierPerformance[]>) => {
            this.performanceData = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching supplier performance.';
            reject(error);
          });
      });
    },

    // Validation operations
    validateSupplier(supplierData: CreateSupplierRequest) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.validateSupplier(supplierData)
          .then((response: ApiResponse<SupplierValidation>) => {
            this.validationResult = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while validating supplier.';
            reject(error);
          });
      });
    },

    checkCodeAvailability(code: string, excludeId?: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.checkCodeAvailability(code, excludeId)
          .then((response: ApiResponse<{ available: boolean }>) => {
            this.loading = false;
            resolve(response.data!.available);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while checking code availability.';
            reject(error);
          });
      });
    },

    // Import/Export operations
    exportSuppliers(options?: SupplierQueryParams & { format?: 'CSV' | 'EXCEL' | 'JSON' }) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.exportSuppliers(options)
          .then((response: Blob) => {
            this.loading = false;
            resolve(response);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while exporting suppliers.';
            reject(error);
          });
      });
    },

    // Utility actions
    setFilters(filters: SupplierQueryParams) {
      this.filters = { ...this.filters, ...filters };
    },

    clearFilters() {
      this.filters = {};
    },

    setSelectedSupplier(supplier: Supplier | null) {
      this.selectedSupplier = supplier;
    },

    updateSupplierInState(id: number, updatedSupplier: Supplier) {
      const index = this.suppliers.findIndex(supplier => supplier.id === id);
      if (index !== -1) {
        this.suppliers[index] = updatedSupplier;
      }
      
      const listIndex = this.suppliersList.findIndex(supplier => supplier.id === id);
      if (listIndex !== -1) {
        this.suppliersList[listIndex] = updatedSupplier;
      }
      
      if (this.selectedSupplier?.id === id) {
        this.selectedSupplier = updatedSupplier;
      }
      
      if (this.paginatedSuppliers) {
        const paginatedIndex = this.paginatedSuppliers.content.findIndex(supplier => supplier.id === id);
        if (paginatedIndex !== -1) {
          this.paginatedSuppliers.content[paginatedIndex] = updatedSupplier;
        }
      }
    },

    refreshAllData() {
      return new Promise((resolve, reject) => {
        Promise.all([
          this.fetchSuppliers(),
          this.fetchAllSuppliers(),
          this.fetchSupplierSummary(),
          this.fetchAllGroups(),
          this.fetchAllBanks(),
          this.fetchAllPaymentTerms()
        ])
          .then((results) => {
            resolve(results);
          })
          .catch((error) => {
            console.error('Failed to refresh all supplier data:', error);
            this.error = 'Failed to refresh data';
            reject(error);
          });
      });
    },

    clearValidation() {
      this.validationResult = null;
    },

    clearError() {
      this.error = null;
    },

    clearSearchResults() {
      this.searchResults = [];
    },

    resetStore() {
      this.suppliers = [];
      this.paginatedSuppliers = null;
      this.selectedSupplier = null;
      this.suppliersList = [];
      this.contacts = [];
      this.addresses = [];
      this.groups = [];
      this.banks = [];
      this.paymentTerms = [];
      this.supplierSummary = null;
      this.supplierMetrics = null;
      this.performanceData = [];
      this.searchResults = [];
      this.validationResult = null;
      this.error = null;
      this.loading = false;
      this.isLoading = false;
      this.filters = {};
      this.pagination = {
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
      };
    },

    // Initialize store
    initialize() {
      return new Promise((resolve, reject) => {
        this.refreshAllData()
          .then((results) => {
            resolve(results);
          })
          .catch((error) => {
            console.error('Failed to initialize suppliers store:', error);
            this.error = 'Failed to initialize store';
            reject(error);
          });
      });
    },

    // Legacy support methods
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },

    // Alias methods for backward compatibility
    async fetchSupplier(id: number) {
      return this.fetchSupplierById(id);
    },

    async createSupplier_legacy(supplier: Partial<Supplier>) {
      return this.createSupplier(supplier as CreateSupplierRequest);
    },

    async updateSupplier_legacy(id: number, supplierData: Partial<Supplier>) {
      return this.updateSupplier(id, { ...supplierData, id } as UpdateSupplierRequest);
    },

    async deleteSupplier_legacy(id: number) {
      return this.deleteSupplier(id);
    },

    async changeSupplierStatus(id: number, status: SupplierStatus) {
      if (status === 'ACTIVE') {
        return this.activateSupplier(id);
      } else {
        return this.deactivateSupplier(id);
      }
    },

    updateSupplierRating(id: number, rating: SupplierRating, notes?: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.updateSupplierRating(id, rating, notes)
          .then((response: ApiResponse<Supplier>) => {
            const updatedSupplier = response.data!;
            this.updateSupplierInState(id, updatedSupplier);
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while updating supplier rating.';
            reject(error);
          });
      });
    },

    fetchSuppliersByCategory(category: string, params?: SupplierQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        suppliersApi.getSuppliersByCategory(category, params)
          .then((response: ApiResponse<PaginatedResponse<Supplier>>) => {
            this.paginatedSuppliers = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || `Failed to fetch suppliers in category ${category}`;
            reject(error);
          });
      });
    },

    async fetchPreferredSuppliers_legacy(filters?: SupplierFilters) {
      const params: SupplierQueryParams = {
        priority: 'PREFERRED',
        ...filters
      };
      return this.fetchPreferredSuppliers(params);
    }
  }
});