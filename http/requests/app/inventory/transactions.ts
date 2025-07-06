import axiosInstance from '~/http/axios';
import type {
  TransactionQueryParams,
  Transaction,
  TransactionSummary,
  StockMovementHistoryItem,
  CreateMultiItemReceiveRequest,
  CreateSingleItemReceiveRequest,
  CreateMultiItemIssueRequest,
  CreateSingleItemIssueRequest,
  MultiItemReceiveTransaction,
  SingleItemReceiveTransaction,
  MultiItemIssueTransaction,
  SingleItemIssueTransaction,
  TransactionStatus,
  ApiResponse,
  PaginatedResponse
} from '~/types/inventory/transactions';

const BASE_URL = '/tenant/inventory/transactions';

export const inventoryTransactionsApi = {
  /**
   * Get all transactions (with pagination support)
   */
  getTransactions(params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return axiosInstance.get(BASE_URL, { params });
  },

  /**
   * Get transaction by ID
   */
  getTransactionById(id: number): Promise<ApiResponse<Transaction>> {
    return axiosInstance.get(`${BASE_URL}/${id}`);
  },

  /**
   * Get transactions by item ID
   */
  getTransactionsByItem(itemId: number, params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return axiosInstance.get(`${BASE_URL}/item/${itemId}`, { params });
  },

  /**
   * Get transactions by location ID
   */
  getTransactionsByLocation(locationId: number, params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return axiosInstance.get(`${BASE_URL}/location/${locationId}`, { params });
  },

  /**
   * Get transactions by reference number
   */
  getTransactionsByReference(referenceNumber: string, params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return axiosInstance.get(`${BASE_URL}/reference/${encodeURIComponent(referenceNumber)}`, { params });
  },

  /**
   * Search transactions
   */
  searchTransactions(searchTerm: string, params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return axiosInstance.get(`${BASE_URL}/search`, { params: { ...params, searchTerm } });
  },

  // Multi-Item Receive endpoints
  /**
   * Create multi-item receive transaction
   */
  createMultiItemReceive(request: CreateMultiItemReceiveRequest | { type: string; payload: CreateMultiItemReceiveRequest }): Promise<ApiResponse<MultiItemReceiveTransaction>> {
    // Extract payload if wrapped, otherwise use request directly
    const payload = 'payload' in request ? request.payload : request;
    console.log('Creating multi-item receive api:', payload);
    return axiosInstance.post(`${BASE_URL}/receive/multi-item`, payload);
  },

  /**
   * Get multi-item receive transaction by ID
   */
  getMultiItemReceiveById(id: number): Promise<ApiResponse<MultiItemReceiveTransaction>> {
    return axiosInstance.get(`${BASE_URL}/multi-receive/${id}`);
  },

  /**
   * Update multi-item receive transaction
   */
  updateMultiItemReceive(id: number, request: Partial<CreateMultiItemReceiveRequest>): Promise<ApiResponse<MultiItemReceiveTransaction>> {
    return axiosInstance.put(`${BASE_URL}/multi-receive/${id}`, request);
  },

  /**
   * Get all multi-item receive transactions
   */
  getMultiItemReceives(params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<MultiItemReceiveTransaction>>> {
    return axiosInstance.get(`${BASE_URL}/multi-receive`, { params });
  },

  // Single Item Receive endpoints
  /**
   * Create single item receive transaction
   */
  createSingleItemReceive(request: CreateSingleItemReceiveRequest | { type: string; payload: CreateSingleItemReceiveRequest }): Promise<ApiResponse<SingleItemReceiveTransaction>> {
    // Extract payload if wrapped, otherwise use request directly
    const payload = 'payload' in request ? request.payload : request;
    return axiosInstance.post(`${BASE_URL}/receive`, payload);
  },

  /**
   * Get single item receive transaction by ID
   */
  getSingleItemReceiveById(id: number): Promise<ApiResponse<SingleItemReceiveTransaction>> {
    return axiosInstance.get(`${BASE_URL}/single-receive/${id}`);
  },

  /**
   * Update single item receive transaction
   */
  updateSingleItemReceive(id: number, request: Partial<CreateSingleItemReceiveRequest>): Promise<ApiResponse<SingleItemReceiveTransaction>> {
    return axiosInstance.put(`${BASE_URL}/single-receive/${id}`, request);
  },

  /**
   * Get all single item receive transactions
   */
  getSingleItemReceives(params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<SingleItemReceiveTransaction>>> {
    return axiosInstance.get(`${BASE_URL}/single-receive`, { params });
  },

  // Multi-Item Issue endpoints
  /**
   * Create multi-item issue transaction
   */
  createMultiItemIssue(request: CreateMultiItemIssueRequest): Promise<ApiResponse<MultiItemIssueTransaction>> {
    const payload = 'payload' in request ? request.payload : request;
    return axiosInstance.post(`${BASE_URL}/issue/multi-item`, payload);
  },

  /**
   * Get multi-item issue transaction by ID
   */
  getMultiItemIssueById(id: number): Promise<ApiResponse<MultiItemIssueTransaction>> {
    return axiosInstance.get(`${BASE_URL}/multi-issue/${id}`);
  },

  /**
   * Update multi-item issue transaction
   */
  updateMultiItemIssue(id: number, request: Partial<CreateMultiItemIssueRequest>): Promise<ApiResponse<MultiItemIssueTransaction>> {
    return axiosInstance.put(`${BASE_URL}/multi-issue/${id}`, request);
  },

  /**
   * Get all multi-item issue transactions
   */
  getMultiItemIssues(params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<MultiItemIssueTransaction>>> {
    return axiosInstance.get(`${BASE_URL}/multi-issue`, { params });
  },

  // Single Item Issue endpoints
  /**
   * Create single item issue transaction
   */
  createSingleItemIssue(request: CreateSingleItemIssueRequest): Promise<ApiResponse<SingleItemIssueTransaction>> {
    const payload = 'payload' in request ? request.payload : request;
    return axiosInstance.post(`${BASE_URL}/issue`, payload);
  },

  /**
   * Get single item issue transaction by ID
   */
  getSingleItemIssueById(id: number): Promise<ApiResponse<SingleItemIssueTransaction>> {
    return axiosInstance.get(`${BASE_URL}/single-issue/${id}`);
  },

  /**
   * Update single item issue transaction
   */
  updateSingleItemIssue(id: number, request: Partial<CreateSingleItemIssueRequest>): Promise<ApiResponse<SingleItemIssueTransaction>> {
    return axiosInstance.put(`${BASE_URL}/single-issue/${id}`, request);
  },

  /**
   * Get all single item issue transactions
   */
  getSingleItemIssues(params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<SingleItemIssueTransaction>>> {
    return axiosInstance.get(`${BASE_URL}/single-issue`, { params });
  },

  // Transaction status management
  /**
   * Update transaction status
   */
  updateTransactionStatus(id: number, status: TransactionStatus): Promise<ApiResponse<Transaction>> {
    return axiosInstance.put(`${BASE_URL}/${id}/status`, { status });
  },

  /**
   * Cancel transaction
   */
  cancelTransaction(id: number, reason: string): Promise<ApiResponse<Transaction>> {
    return axiosInstance.post(`${BASE_URL}/${id}/cancel`, { reason });
  },

  /**
   * Complete transaction
   */
  completeTransaction(id: number): Promise<ApiResponse<Transaction>> {
    return axiosInstance.post(`${BASE_URL}/${id}/complete`);
  },

  /**
   * Void transaction
   */
  voidTransaction(id: number, reason: string): Promise<ApiResponse<Transaction>> {
    return axiosInstance.post(`${BASE_URL}/${id}/void`, { reason });
  },

  // Stock movement and history
  /**
   * Get stock movement history for an item
   */
  getStockMovementHistory(itemId: number, locationId?: number): Promise<ApiResponse<StockMovementHistoryItem[]>> {
    const params = locationId ? { locationId } : undefined;
    return axiosInstance.get(`${BASE_URL}/stock-movement/item/${itemId}`, { params });
  },

  /**
   * Get stock movement history for a location
   */
  getLocationStockMovement(locationId: number, params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<StockMovementHistoryItem>>> {
    return axiosInstance.get(`${BASE_URL}/stock-movement/location/${locationId}`, { params });
  },

  // Summary and reporting
  /**
   * Get transaction summary for dashboard
   */
  getTransactionSummary(params?: TransactionQueryParams): Promise<ApiResponse<TransactionSummary>> {
    return axiosInstance.get(`${BASE_URL}/summary`, { params });
  },

  /**
   * Get transaction statistics
   */
  getTransactionStatistics(params?: TransactionQueryParams): Promise<ApiResponse<{
    totalTransactions: number;
    totalValue: number;
    averageValue: number;
    transactionsByDay: Array<{ date: string; count: number; value: number }>;
    topItems: Array<{ itemId: number; itemName: string; transactionCount: number; totalValue: number }>;
    topLocations: Array<{ locationId: number; locationName: string; transactionCount: number; totalValue: number }>;
  }>> {
    return axiosInstance.get(`${BASE_URL}/statistics`, { params });
  },

  // Bulk operations
  /**
   * Bulk create transactions
   */
  bulkCreateTransactions(transactions: Array<CreateMultiItemReceiveRequest | CreateSingleItemReceiveRequest | CreateMultiItemIssueRequest | CreateSingleItemIssueRequest>): Promise<ApiResponse<Transaction[]>> {
    return axiosInstance.post(`${BASE_URL}/bulk-create`, { transactions });
  },

  /**
   * Bulk update transaction status
   */
  bulkUpdateStatus(transactionIds: number[], status: TransactionStatus): Promise<ApiResponse<Transaction[]>> {
    return axiosInstance.post(`${BASE_URL}/bulk-status`, { transactionIds, status });
  },

  /**
   * Bulk cancel transactions
   */
  bulkCancelTransactions(transactionIds: number[], reason: string): Promise<ApiResponse<Transaction[]>> {
    return axiosInstance.post(`${BASE_URL}/bulk-cancel`, { transactionIds, reason });
  },

  // Document generation
  /**
   * Generate transaction document (receipt, packing slip, etc.)
   */
  generateDocument(id: number, documentType: 'RECEIPT' | 'PACKING_SLIP' | 'DELIVERY_NOTE' | 'INVOICE' = 'RECEIPT'): Promise<Blob> {
    return axiosInstance.get(`${BASE_URL}/${id}/document`, {
      params: { type: documentType },
      responseType: 'blob'
    });
  },

  /**
   * Generate batch document for multiple transactions
   */
  generateBatchDocument(transactionIds: number[], documentType: 'RECEIPT' | 'PACKING_SLIP' | 'DELIVERY_NOTE' | 'INVOICE' = 'RECEIPT'): Promise<Blob> {
    return axiosInstance.post(`${BASE_URL}/batch-document`, {
      transactionIds,
      documentType
    }, {
      responseType: 'blob'
    });
  },

  // Export and import
  /**
   * Export transactions
   */
  exportTransactions(params?: TransactionQueryParams & { format?: 'CSV' | 'EXCEL' | 'JSON' }): Promise<Blob> {
    return axiosInstance.get(`${BASE_URL}/export`, {
      params,
      responseType: 'blob'
    });
  },

  /**
   * Import transactions from file
   */
  importTransactionsFromFile(formData: FormData): Promise<ApiResponse<Transaction[]>> {
    return axiosInstance.post(`${BASE_URL}/import/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Validation and checks
  /**
   * Validate transaction data before creation
   */
  validateTransaction(transaction: CreateMultiItemReceiveRequest | CreateSingleItemReceiveRequest | CreateMultiItemIssueRequest | CreateSingleItemIssueRequest): Promise<ApiResponse<{ isValid: boolean; errors: string[]; warnings: string[] }>> {
    return axiosInstance.post(`${BASE_URL}/validate`, transaction);
  },

  /**
   * Check if reference number is available
   */
  checkReferenceAvailability(referenceNumber: string, excludeId?: number): Promise<ApiResponse<{ available: boolean }>> {
    return axiosInstance.get(`${BASE_URL}/check-reference`, {
      params: { referenceNumber, excludeId }
    });
  },

  // Recent activity
  /**
   * Get recent transactions
   */
  getRecentTransactions(limit?: number): Promise<ApiResponse<Transaction[]>> {
    return axiosInstance.get(`${BASE_URL}/recent`, { params: { limit } });
  },

  /**
   * Get pending transactions requiring attention
   */
  getPendingTransactions(params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return axiosInstance.get(`${BASE_URL}/pending`, { params });
  },

  /**
   * Get failed transactions
   */
  getFailedTransactions(params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return axiosInstance.get(`${BASE_URL}/failed`, { params });
  },

  // Quality control
  /**
   * Update quality status for transaction
   */
  updateQualityStatus(id: number, qualityStatus: string, notes?: string): Promise<ApiResponse<Transaction>> {
    return axiosInstance.put(`${BASE_URL}/${id}/quality`, { qualityStatus, notes });
  },

  /**
   * Get transactions requiring quality inspection
   */
  getTransactionsRequiringInspection(params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return axiosInstance.get(`${BASE_URL}/requiring-inspection`, { params });
  },

  // Supplier/Customer specific
  /**
   * Get transactions by supplier
   */
  getTransactionsBySupplier(supplierId: number, params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return axiosInstance.get(`${BASE_URL}/supplier/${supplierId}`, { params });
  },

  /**
   * Get transactions by customer
   */
  getTransactionsByCustomer(customerId: number, params?: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return axiosInstance.get(`${BASE_URL}/customer/${customerId}`, { params });
  },

  // Audit and history
  /**
   * Get transaction audit trail
   */
  getTransactionHistory(id: number): Promise<ApiResponse<Array<{
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

  /**
   * Get transaction template for creation
   */
  getTransactionTemplate(transactionType: 'MULTI_RECEIVE' | 'SINGLE_RECEIVE' | 'MULTI_ISSUE' | 'SINGLE_ISSUE'): Promise<ApiResponse<any>> {
    return axiosInstance.get(`${BASE_URL}/template/${transactionType}`);
  }
};

export default inventoryTransactionsApi;