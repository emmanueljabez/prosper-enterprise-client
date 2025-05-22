import axiosInstance from '@/http/axios';
import type { 
  TransferFilters, 
  TransferCreateInput, 
  ApprovalRequest,
  ReceiptRequest,
  Transfer 
} from '@/types/inventory/transfers';

// Define API client for Transfer operations
export default {
  /**
   * Fetch all transfers with optional filters
   */
  fetchTransfers: (params: TransferFilters = {}) => {
    return axiosInstance.get('/inventory/transfers', { params });
  },
  
  /**
   * Fetch a single transfer by ID
   */
  fetchTransfer: (id: string) => {
    return axiosInstance.get(`/inventory/transfers/${id}`);
  },
  
  /**
   * Create a new transfer
   */
  createTransfer: (transfer: TransferCreateInput) => {
    return axiosInstance.post('/inventory/transfers', transfer);
  },
  
  /**
   * Update a transfer (typically only allowed for pending status)
   */
  updateTransfer: (id: string, transfer: Partial<Transfer>) => {
    return axiosInstance.put(`/inventory/transfers/${id}`, transfer);
  },
  
  /**
   * Approve a transfer
   */
  approveTransfer: (id: string, payload: ApprovalRequest) => {
    return axiosInstance.post(`/inventory/transfers/${id}/approve`, payload);
  },
  
  /**
   * Ship a transfer (optional if system tracks shipping separately)
   */
  shipTransfer: (id: string, shippingInfo: any) => {
    return axiosInstance.post(`/inventory/transfers/${id}/ship`, shippingInfo);
  },
  
  /**
   * Receive a transfer
   */
  receiveTransfer: (id: string, payload: ReceiptRequest) => {
    return axiosInstance.post(`/inventory/transfers/${id}/receive`, payload);
  },
  
  /**
   * Cancel a transfer
   */
  cancelTransfer: (id: string, payload: { reason: string }) => {
    return axiosInstance.post(`/inventory/transfers/${id}/cancel`, payload);
  },
  
  /**
   * Generate a transfer document (packing slip, transfer form, etc.)
   */
  generateTransferDocument: (id: string, type: string = 'default') => {
    return axiosInstance.get(`/inventory/transfers/${id}/document`, {
      params: { type },
      responseType: 'blob'
    });
  },
  
  /**
   * Get all transfers related to a specific item
   */
  fetchTransfersByItem: (itemId: string, params: TransferFilters = {}) => {
    return axiosInstance.get(`/inventory/items/${itemId}/transfers`, { params });
  },
  
  /**
   * Get all transfers related to a specific location (from or to)
   */
  fetchTransfersByLocation: (locationId: string, direction: 'from' | 'to' | 'both' = 'both', params: TransferFilters = {}) => {
    return axiosInstance.get(`/inventory/locations/${locationId}/transfers`, { 
      params: { ...params, direction } 
    });
  },
  
  /**
   * Get a summary of transfers for reporting purposes
   */
  getTransferSummary: (params: TransferFilters = {}) => {
    return axiosInstance.get('/inventory/transfers/summary', { params });
  },
  
  /**
   * Export transfers to CSV, Excel, or PDF format
   */
  exportTransfers: (format: 'csv' | 'excel' | 'pdf' = 'csv', filters: TransferFilters = {}) => {
    return axiosInstance.get(`/inventory/transfers/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },
  
  /**
   * Create a batch adjustment transfer
   */
  createBatchAdjustment: (payload: {
    locationId: string,
    adjustmentDate: string,
    items: Array<{
      itemId: string,
      quantity: number,
      reason: string,
      notes?: string
    }>,
    notes?: string
  }) => {
    return axiosInstance.post('/inventory/transfers/batch-adjustment', payload);
  },
  
  /**
   * Get transfer statistics for dashboard
   */
  getTransferStats: (timeframe: 'day' | 'week' | 'month' | 'year' = 'month') => {
    return axiosInstance.get('/inventory/transfers/stats', { 
      params: { timeframe } 
    });
  },
  
  /**
   * Get pending transfers that require approval
   */
  getPendingApprovals: () => {
    return axiosInstance.get('/inventory/transfers/pending-approvals');
  },
  
  /**
   * Get transfers that are awaiting receipt
   */
  getAwaitingReceipt: (locationId?: string) => {
    return axiosInstance.get('/inventory/transfers/awaiting-receipt', {
      params: locationId ? { locationId } : undefined
    });
  },
  
  /**
   * Create a bulk transfer for multiple items
   */
  createBulkTransfer: (payload: TransferCreateInput & { bulkItems: boolean }) => {
    return axiosInstance.post('/inventory/transfers/bulk', payload);
  }
};