import axiosInstance from '@/http/axios';
import type { 
  TransactionFilters, 
  TransactionCreateInput, 
  VoidTransactionRequest,
  Transaction 
} from '@/types/inventory/transactions';

// Define API client for Transaction operations
export default {
  /**
   * Fetch all transactions with optional filters
   */
  fetchTransactions: (params: TransactionFilters = {}) => {
    return axiosInstance.get('/inventory/transactions', { params });
  },
  
  /**
   * Fetch a single transaction by ID
   */
  fetchTransaction: (id: string) => {
    return axiosInstance.get(`/inventory/transactions/${id}`);
  },
  
  /**
   * Create a new transaction
   */
  createTransaction: (transaction: TransactionCreateInput) => {
    return axiosInstance.post('/inventory/transactions', transaction);
  },
  
  /**
   * Update a transaction (typically only allowed for draft status)
   */
  updateTransaction: (id: string, transaction: Partial<Transaction>) => {
    return axiosInstance.put(`/inventory/transactions/${id}`, transaction);
  },
  
  /**
   * Void a transaction
   */
  voidTransaction: (id: string, payload: VoidTransactionRequest) => {
    return axiosInstance.post(`/inventory/transactions/${id}/void`, payload);
  },
  
  /**
   * Change the status of a transaction (e.g., from draft to completed)
   */
  updateTransactionStatus: (id: string, status: string) => {
    return axiosInstance.patch(`/inventory/transactions/${id}/status`, { status });
  },
  
  /**
   * Generate a document (invoice, packing slip, etc.) for a transaction
   */
  generateTransactionDocument: (id: string, type: string = 'default') => {
    return axiosInstance.get(`/inventory/transactions/${id}/document`, {
      params: { type },
      responseType: 'blob'
    });
  },
  
  /**
   * Get all transactions related to a specific item
   */
  fetchTransactionsByItem: (itemId: string, params: TransactionFilters = {}) => {
    return axiosInstance.get(`/inventory/items/${itemId}/transactions`, { params });
  },
  
  /**
   * Get all transactions related to a specific location
   */
  fetchTransactionsByLocation: (locationId: string, params: TransactionFilters = {}) => {
    return axiosInstance.get(`/inventory/locations/${locationId}/transactions`, { params });
  },
  
  /**
   * Get a summary of transactions for reporting purposes
   */
  getTransactionSummary: (params: TransactionFilters = {}) => {
    return axiosInstance.get('/inventory/transactions/summary', { params });
  },
  
  /**
   * Export transactions to CSV, Excel, or PDF format
   */
  exportTransactions: (format: 'csv' | 'excel' | 'pdf' = 'csv', filters: TransactionFilters = {}) => {
    return axiosInstance.get(`/inventory/transactions/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },
  
  /**
   * Get inventory stock movement history for an item
   */
  getItemStockMovement: (itemId: string, params: TransactionFilters = {}) => {
    return axiosInstance.get(`/inventory/items/${itemId}/stock-movement`, { params });
  },
  
  /**
   * Create a stock count transaction (specialized endpoint)
   */
  createStockCount: (payload: {
    locationId: string,
    countDate: string,
    items: Array<{
      itemId: string,
      countedQuantity: number,
      binLocation?: string,
      notes?: string
    }>,
    notes?: string
  }) => {
    return axiosInstance.post('/inventory/transactions/stock-count', payload);
  },
  
  /**
   * Create a batch of transactions (useful for importing)
   */
  createBatchTransactions: (transactions: TransactionCreateInput[]) => {
    return axiosInstance.post('/inventory/transactions/batch', { transactions });
  }
};