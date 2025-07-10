import { defineStore } from 'pinia';
import inventoryTransactionsApi from '~/http/requests/app/inventory/transactions';
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
  TransactionType,
  ApiResponse,
  PaginatedResponse
} from '~/types/inventory/transactions';

interface InventoryTransactionsStoreState {
  transactions: Transaction[];
  paginatedTransactions: PaginatedResponse<Transaction> | null;
  selectedTransaction: Transaction | null;
  multiItemReceives: MultiItemReceiveTransaction[];
  singleItemReceives: SingleItemReceiveTransaction[];
  multiItemIssues: MultiItemIssueTransaction[];
  singleItemIssues: SingleItemIssueTransaction[];
  stockMovementHistory: StockMovementHistoryItem[];
  transactionSummary: TransactionSummary | null;
  validationResult: { isValid: boolean; errors: string[]; warnings: string[] } | null;
  loading: boolean;
  error: string | null;
  filters: TransactionQueryParams;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export const useInventoryTransactionsStore = defineStore('inventoryTransactions', {
  state: (): InventoryTransactionsStoreState => ({
    transactions: [],
    paginatedTransactions: null,
    selectedTransaction: null,
    multiItemReceives: [],
    singleItemReceives: [],
    multiItemIssues: [],
    singleItemIssues: [],
    stockMovementHistory: [],
    transactionSummary: null,
    validationResult: null,
    loading: false,
    error: null,
    filters: {},
    pagination: {
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0
    }
  }),

  getters: {
    getTransactions: (state) => state.transactions,
    getPaginatedTransactions: (state) => state.paginatedTransactions,
    getSelectedTransaction: (state) => state.selectedTransaction,
    getMultiItemReceives: (state) => state.multiItemReceives,
    getSingleItemReceives: (state) => state.singleItemReceives,
    getMultiItemIssues: (state) => state.multiItemIssues,
    getSingleItemIssues: (state) => state.singleItemIssues,
    getStockMovementHistory: (state) => state.stockMovementHistory,
    getTransactionSummary: (state) => state.transactionSummary,
    getValidationResult: (state) => state.validationResult,
    getIsLoading: (state) => state.loading,
    getError: (state) => state.error,
    getFilters: (state) => state.filters,
    getPagination: (state) => state.pagination,
    
    getTransactionsCount: (state) => state.transactions.length,
    getHasTransactions: (state) => state.transactions.length > 0,
    getHasError: (state) => state.error !== null,
    
    getTransactionById: (state) => (id: number) => {
      return state.transactions.find(transaction => transaction.id === id);
    },
    
    getTransactionsByType: (state) => (type: TransactionType) => {
      return state.transactions.filter(transaction => transaction.transactionType === type);
    },
    
    getTransactionsByStatus: (state) => (status: TransactionStatus) => {
      return state.transactions.filter(transaction => transaction.status === status);
    },
    
    getTransactionsByLocation: (state) => (locationId: number) => {
      return state.transactions.filter(transaction => transaction.locationId === locationId);
    },
    
    getReceiveTransactions: (state) => {
      return state.transactions.filter(transaction => transaction.transactionType === 'RECEIVE');
    },
    
    getIssueTransactions: (state) => {
      return state.transactions.filter(transaction => transaction.transactionType === 'ISSUE');
    },
    
    getPendingTransactions: (state) => {
      return state.transactions.filter(transaction => transaction.status === 'PENDING');
    },
    
    getCompletedTransactions: (state) => {
      return state.transactions.filter(transaction => transaction.status === 'COMPLETED');
    },
    
    getRecentTransactions: (state) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return state.transactions.filter(transaction => 
        new Date(transaction.transactionDate) >= thirtyDaysAgo
      );
    },
    
    getTotalTransactionValue: (state) => {
      return state.transactions.reduce((total, transaction) => {
        return total + (transaction.totalValue || 0);
      }, 0);
    },
    
    getValidationErrors: (state) => state.validationResult?.errors || [],
    getValidationWarnings: (state) => state.validationResult?.warnings || [],
    getIsValidConfiguration: (state) => state.validationResult?.isValid ?? true
  },

  actions: {
    // Fetch operations
    fetchTransactions(params?: TransactionQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.getTransactions(params)
          .then((response: ApiResponse<PaginatedResponse<Transaction>>) => {
            this.paginatedTransactions = response.data!;
            this.transactions = response.data!.content;
            this.pagination = {
              page: response.data!.number,
              size: response.data!.size,
              totalElements: response.data!.totalElements,
              totalPages: response.data!.totalPages
            };
            console.log('Fetched transactions:', this.paginatedTransactions);
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching transactions.';
            reject(error);
          });
      });
    },

    fetchAllTransactions() {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.getTransactions({ page: 0, size: 10000 })
          .then((response: ApiResponse<PaginatedResponse<Transaction>>) => {
            this.transactions = response.data!.content;
            this.loading = false;
            resolve(response.data!.content);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching all transactions.';
            reject(error);
          });
      });
    },

    fetchTransactionById(id: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.getTransactionById(id)
          .then((response: ApiResponse<Transaction>) => {
            this.selectedTransaction = response.data!;
            
            const existingIndex = this.transactions.findIndex(transaction => transaction.id === id);
            if (existingIndex !== -1) {
              this.transactions[existingIndex] = response.data!;
            } else {
              this.transactions.push(response.data!);
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching transaction.';
            reject(error);
          });
      });
    },

    fetchTransactionsByItem(itemId: number, params?: TransactionQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.getTransactionsByItem(itemId, params)
          .then((response: ApiResponse<PaginatedResponse<Transaction>>) => {
            this.paginatedTransactions = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching transactions by item.';
            reject(error);
          });
      });
    },

    fetchTransactionsByLocation(locationId: number, params?: TransactionQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.getTransactionsByLocation(locationId, params)
          .then((response: ApiResponse<PaginatedResponse<Transaction>>) => {
            this.paginatedTransactions = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching transactions by location.';
            reject(error);
          });
      });
    },

    searchTransactions(searchTerm: string, params?: TransactionQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.searchTransactions(searchTerm, params)
          .then((response: ApiResponse<PaginatedResponse<Transaction>>) => {
            this.paginatedTransactions = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while searching transactions.';
            reject(error);
          });
      });
    },

    // Multi-Item Receive operations
    fetchMultiItemReceives(params?: TransactionQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.getMultiItemReceives(params)
          .then((response: ApiResponse<PaginatedResponse<MultiItemReceiveTransaction>>) => {
            this.multiItemReceives = response.data!.content || [];
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching multi-item receives.';
            reject(error);
          });
      });
    },

    createMultiItemReceive(request: CreateMultiItemReceiveRequest) {
      this.loading = true;
      console.log('Creating multi-item receive:', request);
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.createMultiItemReceive(request)
          .then((response: ApiResponse<MultiItemReceiveTransaction>) => {
            const newTransaction = response.data!;
            this.multiItemReceives.push(newTransaction);
            
            // Add to general transactions if it has the required fields
            if (newTransaction.id) {
              this.transactions.push({
                id: newTransaction.id,
                transactionType: 'RECEIVE',
                referenceNumber: newTransaction.genericReferenceNumber,
                transactionDate: newTransaction.transactionDate,
                status: newTransaction.status || 'COMPLETED',
                locationId: newTransaction.locationId,
                notes: newTransaction.notes,
                totalValue: newTransaction.items?.reduce((total, item) => total + (item.quantity * item.unitCost), 0),
                createdAt: newTransaction.createdAt || new Date().toISOString(),
                updatedAt: newTransaction.updatedAt || new Date().toISOString(),
                createdBy: newTransaction.createdBy || 0
              });
            }
            
            this.loading = false;
            resolve(newTransaction);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while creating multi-item receive.';
            reject(error);
          });
      });
    },

    updateMultiItemReceive(id: number, request: Partial<CreateMultiItemReceiveRequest>) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.updateMultiItemReceive(id, request)
          .then((response: ApiResponse<MultiItemReceiveTransaction>) => {
            const index = this.multiItemReceives.findIndex(transaction => transaction.id === id);
            if (index !== -1) {
              this.multiItemReceives[index] = response.data!;
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while updating multi-item receive.';
            reject(error);
          });
      });
    },

    // Single Item Receive operations
    fetchSingleItemReceives(params?: TransactionQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.getSingleItemReceives(params)
          .then((response: ApiResponse<PaginatedResponse<SingleItemReceiveTransaction>>) => {
            this.singleItemReceives = response.data!.content || [];
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching single item receives.';
            reject(error);
          });
      });
    },

    createSingleItemReceive(request: CreateSingleItemReceiveRequest) {
      this.loading = true;
      console.log('Creating single item receive:', request);
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.createSingleItemReceive(request)
          .then((response: ApiResponse<SingleItemReceiveTransaction>) => {
            const newTransaction = response.data!;
            this.singleItemReceives.push(newTransaction);
            
            // Add to general transactions
            if (newTransaction.id) {
              this.transactions.push({
                id: newTransaction.id,
                transactionType: 'RECEIVE',
                referenceNumber: newTransaction.referenceNumber,
                transactionDate: newTransaction.receivedDate,
                status: newTransaction.status || 'COMPLETED',
                locationId: newTransaction.locationId,
                notes: newTransaction.notes,
                totalValue: newTransaction.quantity * newTransaction.unitCost,
                createdAt: newTransaction.createdAt || new Date().toISOString(),
                updatedAt: newTransaction.updatedAt || new Date().toISOString(),
                createdBy: newTransaction.createdBy || 0
              });
            }
            
            this.loading = false;
            resolve(newTransaction);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while creating single item receive.';
            reject(error);
          });
      });
    },

    updateSingleItemReceive(id: number, request: Partial<CreateSingleItemReceiveRequest>) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.updateSingleItemReceive(id, request)
          .then((response: ApiResponse<SingleItemReceiveTransaction>) => {
            const index = this.singleItemReceives.findIndex(transaction => transaction.id === id);
            if (index !== -1) {
              this.singleItemReceives[index] = response.data!;
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while updating single item receive.';
            reject(error);
          });
      });
    },

    // Multi-Item Issue operations
    fetchMultiItemIssues(params?: TransactionQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.getMultiItemIssues(params)
          .then((response: ApiResponse<PaginatedResponse<MultiItemIssueTransaction>>) => {
            this.multiItemIssues = response.data!.content || [];
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching multi-item issues.';
            reject(error);
          });
      });
    },

    createMultiItemIssue(request: CreateMultiItemIssueRequest) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.createMultiItemIssue(request)
          .then((response: ApiResponse<MultiItemIssueTransaction>) => {
            const newTransaction = response.data!;
            this.multiItemIssues.push(newTransaction);
            
            // Add to general transactions
            if (newTransaction.id) {
              this.transactions.push({
                id: newTransaction.id,
                transactionType: 'ISSUE',
                referenceNumber: newTransaction.referenceNumber,
                transactionDate: newTransaction.transactionDate,
                status: newTransaction.status || 'COMPLETED',
                locationId: newTransaction.locationId,
                notes: newTransaction.notes,
                totalValue: newTransaction.items?.reduce((total, item) => total + (item.quantity * item.unitCost), 0),
                createdAt: newTransaction.createdAt || new Date().toISOString(),
                updatedAt: newTransaction.updatedAt || new Date().toISOString(),
                createdBy: newTransaction.createdBy || 0
              });
            }
            
            this.loading = false;
            resolve(newTransaction);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while creating multi-item issue.';
            reject(error);
          });
      });
    },

    updateMultiItemIssue(id: number, request: Partial<CreateMultiItemIssueRequest>) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.updateMultiItemIssue(id, request)
          .then((response: ApiResponse<MultiItemIssueTransaction>) => {
            const index = this.multiItemIssues.findIndex(transaction => transaction.id === id);
            if (index !== -1) {
              this.multiItemIssues[index] = response.data!;
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while updating multi-item issue.';
            reject(error);
          });
      });
    },

    // Single Item Issue operations
    fetchSingleItemIssues(params?: TransactionQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.getSingleItemIssues(params)
          .then((response: ApiResponse<PaginatedResponse<SingleItemIssueTransaction>>) => {
            this.singleItemIssues = response.data!.content || [];
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching single item issues.';
            reject(error);
          });
      });
    },

    createSingleItemIssue(request: CreateSingleItemIssueRequest) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.createSingleItemIssue(request)
          .then((response: ApiResponse<SingleItemIssueTransaction>) => {
            const newTransaction = response.data!;
            this.singleItemIssues.push(newTransaction);
            
            // Add to general transactions
            if (newTransaction.id) {
              this.transactions.push({
                id: newTransaction.id,
                transactionType: 'ISSUE',
                referenceNumber: newTransaction.referenceNumber,
                transactionDate: newTransaction.createdAt || new Date().toISOString(),
                status: newTransaction.status || 'COMPLETED',
                locationId: newTransaction.locationId,
                notes: newTransaction.notes,
                totalValue: newTransaction.quantity * newTransaction.unitCost,
                createdAt: newTransaction.createdAt || new Date().toISOString(),
                updatedAt: newTransaction.updatedAt || new Date().toISOString(),
                createdBy: newTransaction.createdBy || 0
              });
            }
            
            this.loading = false;
            resolve(newTransaction);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while creating single item issue.';
            reject(error);
          });
      });
    },

    updateSingleItemIssue(id: number, request: Partial<CreateSingleItemIssueRequest>) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.updateSingleItemIssue(id, request)
          .then((response: ApiResponse<SingleItemIssueTransaction>) => {
            const index = this.singleItemIssues.findIndex(transaction => transaction.id === id);
            if (index !== -1) {
              this.singleItemIssues[index] = response.data!;
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while updating single item issue.';
            reject(error);
          });
      });
    },

    // Summary and reporting
    fetchTransactionSummary(params?: TransactionQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.getTransactionSummary(params)
          .then((response: ApiResponse<TransactionSummary>) => {
            this.transactionSummary = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching transaction summary.';
            reject(error);
          });
      });
    },

    // Stock movement and history
    fetchStockMovementHistory(itemId: number, locationId?: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.getStockMovementHistory(itemId, locationId)
          .then((response: ApiResponse<StockMovementHistoryItem[]>) => {
            this.stockMovementHistory = response.data! || [];
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching stock movement history.';
            reject(error);
          });
      });
    },

    // Additional transaction operations
    cancelTransaction(id: number, reason: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.cancelTransaction(id, reason)
          .then((response: ApiResponse<Transaction>) => {
            const index = this.transactions.findIndex(transaction => transaction.id === id);
            if (index !== -1) {
              this.transactions[index] = response.data!;
            }
            if (this.selectedTransaction?.id === id) {
              this.selectedTransaction = response.data!;
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while cancelling transaction.';
            reject(error);
          });
      });
    },

    completeTransaction(id: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.completeTransaction(id)
          .then((response: ApiResponse<Transaction>) => {
            const index = this.transactions.findIndex(transaction => transaction.id === id);
            if (index !== -1) {
              this.transactions[index] = response.data!;
            }
            if (this.selectedTransaction?.id === id) {
              this.selectedTransaction = response.data!;
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while completing transaction.';
            reject(error);
          });
      });
    },

    voidTransaction(id: number, reason: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.voidTransaction(id, reason)
          .then((response: ApiResponse<Transaction>) => {
            const index = this.transactions.findIndex(transaction => transaction.id === id);
            if (index !== -1) {
              this.transactions[index] = response.data!;
            }
            if (this.selectedTransaction?.id === id) {
              this.selectedTransaction = response.data!;
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while voiding transaction.';
            reject(error);
          });
      });
    },

    // Bulk operations
    bulkUpdateStatus(transactionIds: number[], status: TransactionStatus) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.bulkUpdateStatus(transactionIds, status)
          .then((response: ApiResponse<Transaction[]>) => {
            response.data!.forEach(updatedTransaction => {
              const index = this.transactions.findIndex(transaction => transaction.id === updatedTransaction.id);
              if (index !== -1) {
                this.transactions[index] = updatedTransaction;
              }
            });
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while bulk updating transaction status.';
            reject(error);
          });
      });
    },

    bulkCancelTransactions(transactionIds: number[], reason: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.bulkCancelTransactions(transactionIds, reason)
          .then((response: ApiResponse<Transaction[]>) => {
            response.data!.forEach(updatedTransaction => {
              const index = this.transactions.findIndex(transaction => transaction.id === updatedTransaction.id);
              if (index !== -1) {
                this.transactions[index] = updatedTransaction;
              }
            });
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while bulk cancelling transactions.';
            reject(error);
          });
      });
    },

    // Export operations
    exportTransactions(options?: TransactionQueryParams & { format?: 'CSV' | 'EXCEL' | 'JSON' }) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.exportTransactions(options)
          .then((response: Blob) => {
            this.loading = false;
            resolve(response);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while exporting transactions.';
            reject(error);
          });
      });
    },

    // Validation operations
    validateTransaction(transactionData: CreateMultiItemReceiveRequest | CreateSingleItemReceiveRequest | CreateMultiItemIssueRequest | CreateSingleItemIssueRequest) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.validateTransaction(transactionData)
          .then((response: ApiResponse<{ isValid: boolean; errors: string[]; warnings: string[] }>) => {
            this.validationResult = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while validating transaction.';
            reject(error);
          });
      });
    },

    checkReferenceAvailability(referenceNumber: string, excludeId?: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryTransactionsApi.checkReferenceAvailability(referenceNumber, excludeId)
          .then((response: ApiResponse<{ available: boolean }>) => {
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while checking reference availability.';
            reject(error);
          });
      });
    },

    // Utility actions
    setFilters(filters: TransactionQueryParams) {
      this.filters = { ...this.filters, ...filters };
    },

    clearFilters() {
      this.filters = {};
    },

    setSelectedTransaction(transaction: Transaction | null) {
      this.selectedTransaction = transaction;
    },

    refreshAllData() {
      return Promise.all([
        this.fetchTransactions(),
        this.fetchAllTransactions(),
        this.fetchTransactionSummary(),
        this.fetchMultiItemReceives(),
        this.fetchSingleItemReceives(),
        this.fetchMultiItemIssues(),
        this.fetchSingleItemIssues()
      ]);
    },

    clearValidation() {
      this.validationResult = null;
    },

    clearError() {
      this.error = null;
    },

    resetStore() {
      this.transactions = [];
      this.paginatedTransactions = null;
      this.selectedTransaction = null;
      this.multiItemReceives = [];
      this.singleItemReceives = [];
      this.multiItemIssues = [];
      this.singleItemIssues = [];
      this.stockMovementHistory = [];
      this.transactionSummary = null;
      this.validationResult = null;
      this.error = null;
      this.loading = false;
      this.filters = {};
      this.pagination = {
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
      };
    },

    // Initialize store
    async initialize() {
      try {
        return await this.refreshAllData();
      } catch (error) {
        console.error('Failed to initialize inventory transactions store:', error);
        this.error = 'Failed to initialize store';
      }
    }
  },
});
