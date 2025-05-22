import axiosInstance from '@/http/axios';
import type { 
  Supplier, 
  SupplierFilters
} from '@/types/inventory/suppliers';

// Define API client for Supplier operations
export default {
  /**
   * Fetch all suppliers with optional filters
   */
  fetchSuppliers: (params: SupplierFilters = {}) => {
    return axiosInstance.get('/inventory/suppliers', { params });
  },
  
  /**
   * Fetch a single supplier by ID
   */
  fetchSupplier: (id: string) => {
    return axiosInstance.get(`/inventory/suppliers/${id}`);
  },
  
  /**
   * Create a new supplier
   */
  createSupplier: (supplier: Partial<Supplier>) => {
    return axiosInstance.post('/inventory/suppliers', supplier);
  },
  
  /**
   * Update a supplier
   */
  updateSupplier: (id: string, supplier: Partial<Supplier>) => {
    return axiosInstance.put(`/inventory/suppliers/${id}`, supplier);
  },
  
  /**
   * Delete a supplier
   */
  deleteSupplier: (id: string) => {
    return axiosInstance.delete(`/inventory/suppliers/${id}`);
  },
  
  /**
   * Update supplier status (active/inactive)
   */
  updateSupplierStatus: (id: string, status: 'active' | 'inactive') => {
    return axiosInstance.patch(`/inventory/suppliers/${id}/status`, { status });
  },
  
  /**
   * Update supplier rating
   */
  updateSupplierRating: (id: string, rating: number) => {
    return axiosInstance.patch(`/inventory/suppliers/${id}/rating`, { rating });
  },
  
  /**
   * Get suppliers by category
   */
  fetchSuppliersByCategory: (category: string, params: SupplierFilters = {}) => {
    return axiosInstance.get(`/inventory/suppliers/by-category/${category}`, { params });
  },
  
  /**
   * Get preferred suppliers (rating >= 4, active)
   */
  fetchPreferredSuppliers: (params: SupplierFilters = {}) => {
    return axiosInstance.get('/inventory/suppliers/preferred', { params });
  },
  
  /**
   * Export suppliers to CSV, Excel, or PDF format
   */
  exportSuppliers: (format: 'csv' | 'excel' | 'pdf' = 'csv', filters: SupplierFilters = {}) => {
    return axiosInstance.get(`/inventory/suppliers/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },
  
  /**
   * Add a contact to a supplier
   */
  addSupplierContact: (id: string, contact: {
    name: string,
    title: string,
    email: string,
    phone: string,
    isPrimary: boolean
  }) => {
    return axiosInstance.post(`/inventory/suppliers/${id}/contacts`, contact);
  },
  
  /**
   * Update a supplier contact
   */
  updateSupplierContact: (supplierId: string, contactId: string, contact: {
    name?: string,
    title?: string,
    email?: string,
    phone?: string,
    isPrimary?: boolean
  }) => {
    return axiosInstance.put(`/inventory/suppliers/${supplierId}/contacts/${contactId}`, contact);
  },
  
  /**
   * Delete a supplier contact
   */
  deleteSupplierContact: (supplierId: string, contactId: string) => {
    return axiosInstance.delete(`/inventory/suppliers/${supplierId}/contacts/${contactId}`);
  },
  
  /**
   * Get supplier performance metrics
   */
  getSupplierPerformance: (id: string, params: {
    timeframe?: 'quarter' | 'year' | 'all',
    from?: string,
    to?: string
  } = {}) => {
    return axiosInstance.get(`/inventory/suppliers/${id}/performance`, { params });
  },
  
  /**
   * Get all purchase orders for a supplier
   */
  getSupplierPurchaseOrders: (id: string, params: {
    status?: string,
    from?: string,
    to?: string,
    limit?: number,
    offset?: number
  } = {}) => {
    return axiosInstance.get(`/inventory/suppliers/${id}/purchase-orders`, { params });
  },
  
  /**
   * Add supplier document (contract, certificate, etc.)
   */
  addSupplierDocument: (id: string, document: FormData) => {
    return axiosInstance.post(`/inventory/suppliers/${id}/documents`, document, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  /**
   * Get supplier documents
   */
  getSupplierDocuments: (id: string) => {
    return axiosInstance.get(`/inventory/suppliers/${id}/documents`);
  },
  
  /**
   * Delete supplier document
   */
  deleteSupplierDocument: (supplierId: string, documentId: string) => {
    return axiosInstance.delete(`/inventory/suppliers/${supplierId}/documents/${documentId}`);
  },
  
  /**
   * Bulk import suppliers from CSV/Excel
   */
  bulkImportSuppliers: (file: FormData) => {
    return axiosInstance.post('/inventory/suppliers/import', file, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  /**
   * Get supplier statistics for dashboard
   */
  getSupplierStats: () => {
    return axiosInstance.get('/inventory/suppliers/stats');
  },
  
  /**
   * Find items supplied by a specific supplier
   */
  getSupplierItems: (id: string, params: {
    category?: string,
    search?: string,
    limit?: number,
    offset?: number
  } = {}) => {
    return axiosInstance.get(`/inventory/suppliers/${id}/items`, { params });
  }
};