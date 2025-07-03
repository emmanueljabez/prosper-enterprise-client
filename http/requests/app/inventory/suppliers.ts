import axiosInstance from '~/http/axios';
import type {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierQueryParams,
  SupplierFilters,
  SupplierContact,
  CreateSupplierContactRequest,
  UpdateSupplierContactRequest,
  SupplierAddress,
  CreateSupplierAddressRequest,
  UpdateSupplierAddressRequest,
  SupplierGroup,
  Bank,
  PaymentTerm,
  SupplierSummary,
  SupplierMetrics,
  SupplierPerformance,
  SupplierApprovalRequest,
  SupplierApprovalResponse,
  SupplierValidation,
  SupplierExport,
  SupplierImport,
  ApiResponse,
  PaginatedResponse
} from '@/types/inventory/suppliers';

const BASE_URL = '/tenant/suppliers';

export const suppliersApi = {
  /**
   * Get suppliers (with pagination support)
   */
  getSuppliers(params?: SupplierQueryParams): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(BASE_URL, { params });
  },

  /**
   * Get all suppliers without pagination
   */
  getAllSuppliers(params?: SupplierQueryParams): Promise<ApiResponse<Supplier[]>> {
    return axiosInstance.get(`${BASE_URL}`, { params });
  },

  /**
   * Get supplier by ID
   */
  getSupplierById(id: number): Promise<ApiResponse<Supplier>> {
    return axiosInstance.get(`${BASE_URL}/${id}`);
  },

  /**
   * Get supplier by code
   */
  getSupplierByCode(code: string): Promise<ApiResponse<Supplier>> {
    return axiosInstance.get(`${BASE_URL}/code/${code}`);
  },

  /**
   * Get supplier by display ID
   */
  getSupplierByDisplayId(displayId: string): Promise<ApiResponse<Supplier>> {
    return axiosInstance.get(`${BASE_URL}/display/${displayId}`);
  },

  /**
   * Search suppliers by term
   */
  searchSuppliers(params: SupplierQueryParams & { searchTerm: string }): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(`${BASE_URL}/search`, { params });
  },

  /**
   * Get suppliers by group
   */
  getSuppliersByGroup(groupId: number, params?: SupplierQueryParams): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(`${BASE_URL}/group/${groupId}`, { params });
  },

  /**
   * Get suppliers by status
   */
  getSuppliersByStatus(status: string, params?: SupplierQueryParams): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(`${BASE_URL}/status/${status}`, { params });
  },

  /**
   * Get suppliers by payment account type
   */
  getSuppliersByPaymentType(paymentType: string, params?: SupplierQueryParams): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(`${BASE_URL}/payment-type/${paymentType}`, { params });
  },

  /**
   * Get suppliers by bank
   */
  getSuppliersByBank(bankId: number, params?: SupplierQueryParams): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(`${BASE_URL}/bank/${bankId}`, { params });
  },

  /**
   * Get suppliers by payment term
   */
  getSuppliersByPaymentTerm(paymentTermId: number, params?: SupplierQueryParams): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(`${BASE_URL}/payment-term/${paymentTermId}`, { params });
  },

  /**
   * Get suppliers by priority
   */
  getSuppliersByPriority(priority: string, params?: SupplierQueryParams): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(`${BASE_URL}/priority/${priority}`, { params });
  },

  /**
   * Get suppliers by rating
   */
  getSuppliersByRating(rating: number, params?: SupplierQueryParams): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(`${BASE_URL}/rating/${rating}`, { params });
  },

  /**
   * Get preferred suppliers
   */
  getPreferredSuppliers(params?: SupplierQueryParams): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(`${BASE_URL}/preferred`, { params });
  },

  /**
   * Get top performing suppliers
   */
  getTopPerformingSuppliers(params?: SupplierQueryParams): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(`${BASE_URL}/top-performing`, { params });
  },

  /**
   * Get suppliers pending approval
   */
  getPendingApprovals(params?: SupplierQueryParams): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(`${BASE_URL}/pending-approval`, { params });
  },

  /**
   * Get blocked suppliers
   */
  getBlockedSuppliers(params?: SupplierQueryParams): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(`${BASE_URL}/blocked`, { params });
  },

  /**
   * Create new supplier
   */
  createSupplier(supplier: CreateSupplierRequest): Promise<ApiResponse<Supplier>> {
    return axiosInstance.post(BASE_URL, supplier);
  },

  /**
   * Update existing supplier
   */
  updateSupplier(id: number, supplier: UpdateSupplierRequest): Promise<ApiResponse<Supplier>> {
    return axiosInstance.put(`${BASE_URL}/${id}`, supplier);
  },

  /**
   * Delete supplier
   */
  deleteSupplier(id: number): Promise<ApiResponse<null>> {
    return axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Block supplier
   */
  blockSupplier(id: number, reason: string): Promise<ApiResponse<Supplier>> {
    return axiosInstance.put(`${BASE_URL}/${id}/block`, { reason });
  },

  /**
   * Unblock supplier
   */
  unblockSupplier(id: number): Promise<ApiResponse<Supplier>> {
    return axiosInstance.put(`${BASE_URL}/${id}/unblock`);
  },

  /**
   * Activate supplier
   */
  activateSupplier(id: number): Promise<ApiResponse<Supplier>> {
    return axiosInstance.put(`${BASE_URL}/${id}/activate`);
  },

  /**
   * Deactivate supplier
   */
  deactivateSupplier(id: number): Promise<ApiResponse<Supplier>> {
    return axiosInstance.put(`${BASE_URL}/${id}/deactivate`);
  },

  /**
   * Submit supplier for approval
   */
  submitForApproval(id: number): Promise<ApiResponse<Supplier>> {
    return axiosInstance.post(`${BASE_URL}/${id}/submit-approval`);
  },

  /**
   * Approve/reject supplier
   */
  processApproval(request: SupplierApprovalRequest): Promise<ApiResponse<SupplierApprovalResponse>> {
    return axiosInstance.post(`${BASE_URL}/approval`, request);
  },

  /**
   * Update supplier rating
   */
  updateSupplierRating(id: number, rating: number, notes?: string): Promise<ApiResponse<Supplier>> {
    return axiosInstance.put(`${BASE_URL}/${id}/rating`, { rating, notes });
  },

  /**
   * Update supplier priority
   */
  updateSupplierPriority(id: number, priority: string): Promise<ApiResponse<Supplier>> {
    return axiosInstance.put(`${BASE_URL}/${id}/priority`, { priority });
  },

  // Contact Management
  /**
   * Get supplier contacts
   */
  getSupplierContacts(supplierId: number): Promise<ApiResponse<SupplierContact[]>> {
    return axiosInstance.get(`${BASE_URL}/${supplierId}/contacts`);
  },

  /**
   * Add supplier contact
   */
  addSupplierContact(supplierId: number, contact: CreateSupplierContactRequest): Promise<ApiResponse<SupplierContact>> {
    return axiosInstance.post(`${BASE_URL}/${supplierId}/contacts`, contact);
  },

  /**
   * Update supplier contact
   */
  updateSupplierContact(contact: UpdateSupplierContactRequest): Promise<ApiResponse<SupplierContact>> {
    return axiosInstance.put(`${BASE_URL}/${contact.supplierId}/contacts/${contact.id}`, contact);
  },

  /**
   * Remove supplier contact
   */
  removeSupplierContact(supplierId: number, contactId: number): Promise<ApiResponse<null>> {
    return axiosInstance.delete(`${BASE_URL}/${supplierId}/contacts/${contactId}`);
  },

  // Address Management
  /**
   * Get supplier addresses
   */
  getSupplierAddresses(supplierId: number): Promise<ApiResponse<SupplierAddress[]>> {
    return axiosInstance.get(`${BASE_URL}/${supplierId}/addresses`);
  },

  /**
   * Add supplier address
   */
  addSupplierAddress(supplierId: number, address: CreateSupplierAddressRequest): Promise<ApiResponse<SupplierAddress>> {
    return axiosInstance.post(`${BASE_URL}/${supplierId}/addresses`, address);
  },

  /**
   * Update supplier address
   */
  updateSupplierAddress(address: UpdateSupplierAddressRequest): Promise<ApiResponse<SupplierAddress>> {
    return axiosInstance.put(`${BASE_URL}/${address.supplierId}/addresses/${address.id}`, address);
  },

  /**
   * Remove supplier address
   */
  removeSupplierAddress(supplierId: number, addressId: number): Promise<ApiResponse<null>> {
    return axiosInstance.delete(`${BASE_URL}/${supplierId}/addresses/${addressId}`);
  },

  // Group Management
  /**
   * Get all supplier groups
   */
  getAllGroups(): Promise<ApiResponse<SupplierGroup[]>> {
    return axiosInstance.get(`${BASE_URL}/groups`);
  },

  /**
   * Create supplier group
   */
  createGroup(group: Omit<SupplierGroup, 'id' | 'created' | 'updated'>): Promise<ApiResponse<SupplierGroup>> {
    return axiosInstance.post(`${BASE_URL}/groups`, group);
  },

  /**
   * Update supplier group
   */
  updateGroup(id: number, group: Partial<SupplierGroup>): Promise<ApiResponse<SupplierGroup>> {
    return axiosInstance.put(`${BASE_URL}/groups/${id}`, group);
  },

  /**
   * Delete supplier group
   */
  deleteGroup(id: number): Promise<ApiResponse<null>> {
    return axiosInstance.delete(`${BASE_URL}/groups/${id}`);
  },

  // Banks and Payment Terms
  /**
   * Get all banks
   */
  getAllBanks(): Promise<ApiResponse<Bank[]>> {
    return axiosInstance.get(`${BASE_URL}/banks`);
  },

  /**
   * Get all payment terms
   */
  getAllPaymentTerms(): Promise<ApiResponse<PaymentTerm[]>> {
    return axiosInstance.get(`${BASE_URL}/payment-terms`);
  },

  // Performance and Analytics
  /**
   * Get supplier performance
   */
  getSupplierPerformance(supplierId?: number, period?: string): Promise<ApiResponse<SupplierPerformance[]>> {
    const params = supplierId ? { supplierId, period } : { period };
    return axiosInstance.get(`${BASE_URL}/performance`, { params });
  },

  /**
   * Get supplier summary
   */
  getSupplierSummary(dateFrom?: string, dateTo?: string): Promise<ApiResponse<SupplierSummary>> {
    return axiosInstance.get(`${BASE_URL}/summary`, { 
      params: { dateFrom, dateTo } 
    });
  },

  /**
   * Get supplier metrics
   */
  getSupplierMetrics(period: string): Promise<ApiResponse<SupplierMetrics>> {
    return axiosInstance.get(`${BASE_URL}/metrics`, { 
      params: { period } 
    });
  },

  /**
   * Calculate supplier score
   */
  calculateSupplierScore(supplierId: number): Promise<ApiResponse<{ score: number; breakdown: Record<string, number> }>> {
    return axiosInstance.post(`${BASE_URL}/${supplierId}/calculate-score`);
  },

  // Bulk Operations
  /**
   * Bulk update multiple suppliers
   */
  bulkUpdateSuppliers(supplierIds: number[], updates: Partial<Supplier>): Promise<ApiResponse<Supplier[]>> {
    return axiosInstance.post(`${BASE_URL}/bulk-update`, {
      supplierIds,
      updates
    });
  },

  /**
   * Bulk delete multiple suppliers
   */
  bulkDeleteSuppliers(supplierIds: number[]): Promise<ApiResponse<null>> {
    return axiosInstance.post(`${BASE_URL}/bulk-delete`, {
      supplierIds
    });
  },

  /**
   * Bulk approve suppliers
   */
  bulkApproveSuppliers(supplierIds: number[], comments?: string): Promise<ApiResponse<Supplier[]>> {
    return axiosInstance.post(`${BASE_URL}/bulk-approve`, {
      supplierIds,
      comments
    });
  },

  /**
   * Bulk block suppliers
   */
  bulkBlockSuppliers(supplierIds: number[], reason: string): Promise<ApiResponse<Supplier[]>> {
    return axiosInstance.post(`${BASE_URL}/bulk-block`, {
      supplierIds,
      reason
    });
  },

  // Validation and Utilities
  /**
   * Validate supplier data before creation/update
   */
  validateSupplier(supplier: CreateSupplierRequest): Promise<ApiResponse<SupplierValidation>> {
    return axiosInstance.post(`${BASE_URL}/validate`, supplier);
  },

  /**
   * Check if supplier code is available
   */
  checkCodeAvailability(code: string, excludeId?: number): Promise<ApiResponse<{ available: boolean }>> {
    return axiosInstance.get(`${BASE_URL}/check-code`, {
      params: { code, excludeId }
    });
  },

  /**
   * Check if supplier email is available
   */
  checkEmailAvailability(email: string, excludeId?: number): Promise<ApiResponse<{ available: boolean }>> {
    return axiosInstance.get(`${BASE_URL}/check-email`, {
      params: { email, excludeId }
    });
  },

  /**
   * Check if supplier phone is available
   */
  checkPhoneAvailability(phoneNumber: string, excludeId?: number): Promise<ApiResponse<{ available: boolean }>> {
    return axiosInstance.get(`${BASE_URL}/check-phone`, {
      params: { phoneNumber, excludeId }
    });
  },

  /**
   * Generate supplier code
   */
  generateSupplierCode(name: string): Promise<ApiResponse<{ code: string }>> {
    return axiosInstance.post(`${BASE_URL}/generate-code`, { name });
  },

  /**
   * Get suggested suppliers based on query
   */
  getSuggestedSuppliers(query: string, limit?: number): Promise<ApiResponse<Supplier[]>> {
    return axiosInstance.get(`${BASE_URL}/suggestions`, {
      params: { query, limit }
    });
  },

  // Import/Export
  /**
   * Export suppliers
   */
  exportSuppliers(params?: SupplierQueryParams & { format?: 'CSV' | 'EXCEL' | 'JSON' }): Promise<Blob> {
    return axiosInstance.get(`${BASE_URL}/export`, {
      params,
      responseType: 'blob'
    });
  },

  /**
   * Import suppliers from data
   */
  importSuppliers(importData: SupplierImport): Promise<ApiResponse<Supplier[]>> {
    return axiosInstance.post(`${BASE_URL}/import`, importData);
  },

  /**
   * Import suppliers from file upload
   */
  importSuppliersFromFile(formData: FormData): Promise<ApiResponse<Supplier[]>> {
    return axiosInstance.post(`${BASE_URL}/import/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Document Management
  /**
   * Get supplier documents
   */
  getSupplierDocuments(supplierId: number): Promise<ApiResponse<Array<{
    id: number;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
    uploadedBy: number;
    url: string;
  }>>> {
    return axiosInstance.get(`${BASE_URL}/${supplierId}/documents`);
  },

  /**
   * Upload supplier document
   */
  uploadSupplierDocument(supplierId: number, formData: FormData): Promise<ApiResponse<{
    id: number;
    name: string;
    type: string;
    size: number;
    url: string;
  }>> {
    return axiosInstance.post(`${BASE_URL}/${supplierId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Delete supplier document
   */
  deleteSupplierDocument(supplierId: number, documentId: number): Promise<ApiResponse<null>> {
    return axiosInstance.delete(`${BASE_URL}/${supplierId}/documents/${documentId}`);
  },

  // Purchase Order Integration
  /**
   * Get supplier purchase orders
   */
  getSupplierPurchaseOrders(supplierId: number, params?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    return axiosInstance.get(`${BASE_URL}/${supplierId}/purchase-orders`, { params });
  },

  /**
   * Get supplier purchase order summary
   */
  getSupplierPurchaseOrderSummary(supplierId: number, period?: string): Promise<ApiResponse<{
    totalOrders: number;
    totalValue: number;
    averageOrderValue: number;
    lastOrderDate: string;
    onTimeDeliveryRate: number;
  }>> {
    return axiosInstance.get(`${BASE_URL}/${supplierId}/purchase-orders/summary`, {
      params: { period }
    });
  },

  // History and Audit
  /**
   * Get supplier history/audit trail
   */
  getSupplierHistory(id: number): Promise<ApiResponse<Array<{
    action: string;
    timestamp: string;
    userId: number;
    userName?: string;
    changes: Record<string, any>;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
  }>>> {
    return axiosInstance.get(`${BASE_URL}/${id}/history`);
  },

  // Recently Modified/Created
  /**
   * Get recently modified suppliers
   */
  getRecentlyModified(limit?: number): Promise<ApiResponse<Supplier[]>> {
    return axiosInstance.get(`${BASE_URL}/recent`, { params: { limit } });
  },

  /**
   * Get recently created suppliers
   */
  getRecentlyCreated(limit?: number): Promise<ApiResponse<Supplier[]>> {
    return axiosInstance.get(`${BASE_URL}/recent-created`, { params: { limit } });
  },

  // Archive/Restore
  /**
   * Archive supplier (soft delete)
   */
  archiveSupplier(id: number): Promise<ApiResponse<Supplier>> {
    return axiosInstance.post(`${BASE_URL}/${id}/archive`);
  },

  /**
   * Restore archived supplier
   */
  restoreSupplier(id: number): Promise<ApiResponse<Supplier>> {
    return axiosInstance.post(`${BASE_URL}/${id}/restore`);
  },

  /**
   * Get archived suppliers
   */
  getArchivedSuppliers(params?: SupplierQueryParams): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(`${BASE_URL}/archived`, { params });
  },

  // Templates and Defaults
  /**
   * Get supplier template for creation
   */
  getSupplierTemplate(): Promise<ApiResponse<CreateSupplierRequest>> {
    return axiosInstance.get(`${BASE_URL}/template`);
  },

  /**
   * Get default supplier settings
   */
  getDefaultSupplierSettings(): Promise<ApiResponse<{
    defaultPaymentTermId: number;
    defaultPriority: string;
    defaultCreditLimit: number;
    autoApprovalEnabled: boolean;
  }>> {
    return axiosInstance.get(`${BASE_URL}/defaults`);
  },

  // Category Management
  /**
   * Get suppliers by category
   */
  getSuppliersByCategory(category: string, params?: SupplierQueryParams): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return axiosInstance.get(`${BASE_URL}/category/${encodeURIComponent(category)}`, { params });
  },

  /**
   * Get all supplier categories
   */
  getSupplierCategories(): Promise<ApiResponse<Array<{
    category: string;
    count: number;
    totalValue: number;
  }>>> {
    return axiosInstance.get(`${BASE_URL}/categories`);
  },

  // Statistics and Dashboard
  /**
   * Get supplier statistics for dashboard
   */
  getSupplierStats(): Promise<ApiResponse<{
    totalSuppliers: number;
    activeSuppliers: number;
    pendingApproval: number;
    blockedSuppliers: number;
    totalPurchaseValue: number;
    averageRating: number;
    topSuppliers: Array<{
      id: number;
      name: string;
      totalValue: number;
      rating: number;
    }>;
  }>> {
    return axiosInstance.get(`${BASE_URL}/stats`);
  },

  // Data Sync (QuickBooks, External Systems)
  /**
   * Sync with QuickBooks
   */
  syncWithQuickBooks(): Promise<ApiResponse<{
    processed: number;
    successful: number;
    failed: number;
    errors: string[];
  }>> {
    return axiosInstance.post(`${BASE_URL}/sync/quickbooks`);
  },

  /**
   * Get sync status
   */
  getSyncStatus(): Promise<ApiResponse<{
    lastSync: string;
    isRunning: boolean;
    nextSync: string;
    totalSynced: number;
    errors: number;
  }>> {
    return axiosInstance.get(`${BASE_URL}/sync/status`);
  },

  /**
   * Force sync supplier
   */
  forceSyncSupplier(id: number): Promise<ApiResponse<Supplier>> {
    return axiosInstance.post(`${BASE_URL}/${id}/sync`);
  }
};

export default suppliersApi;