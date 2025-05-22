import { defineStore } from 'pinia';
import { mockTransactions, mockTransfers } from '@/mock/mockInventoryData';
import transactionsApi from '~/http/requests/app/inventory/transactions';
import transfersApi from '~/http/requests/app/inventory/transfers';
import type { Transaction, TransactionState, TransactionFilters } from '@/types/inventory/transactions';
import type { Transfer, TransferState, TransferFilters } from '@/types/inventory/transfers';

// Determine if we're in development environment
const isDev = process.env.NODE_ENV === 'development';

// Transactions Store
export const useTransactionsStore = defineStore('transactions', {
  state: (): TransactionState => ({
    transactions: [],
    isLoading: false,
    error: null,
    useMockData: isDev // Default to mock data in development
  }),
  
  getters: {
    getTransactions: (state) => state.transactions,
    getTransactionById: (state) => (id: string) => state.transactions.find(transaction => transaction.id === id),
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getTransactionsByType: (state) => (type: string) => 
      state.transactions.filter(transaction => transaction.type === type),
    getTransactionsByDate: (state) => (startDate: string, endDate: string) => {
      return state.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.transactionDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return transactionDate >= start && transactionDate <= end;
      });
    },
    getTransactionsByLocation: (state) => (locationId: string) => 
      state.transactions.filter(transaction => 
        transaction.sourceLocationId === locationId || transaction.destinationLocationId === locationId),
    getVoidedTransactions: (state) => 
      state.transactions.filter(transaction => transaction.isVoided)
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    async fetchTransactions(filters: TransactionFilters = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Filter mock transactions based on the provided filters
          let filteredTransactions = [...mockTransactions];
          
          if (filters.transactionType && filters.transactionType !== 'all') {
            filteredTransactions = filteredTransactions.filter(
              t => t.type === filters.transactionType
            );
          }
          
          if (filters.location && filters.location !== 'all') {
            filteredTransactions = filteredTransactions.filter(
              t => t.sourceLocationId === filters.location || t.destinationLocationId === filters.location
            );
          }
          
          if (filters.dateRange && filters.dateRange !== 'all') {
            const now = new Date();
            let startDate = new Date();
            
            // Set start date based on range
            switch (filters.dateRange) {
              case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'yesterday':
                startDate.setDate(now.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'thisWeek':
                startDate.setDate(now.getDate() - now.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'thisMonth':
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'lastMonth':
                startDate.setMonth(now.getMonth() - 1);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
              default:
                // Custom date range would be handled here
                break;
            }
            
            filteredTransactions = filteredTransactions.filter(t => {
              const transactionDate = new Date(t.transactionDate);
              return transactionDate >= startDate && transactionDate <= now;
            });
          }
          
          response = { success: true, transactions: filteredTransactions };
        } else {
          // Real API call
          response = await transactionsApi.fetchTransactions(filters);
        }
        
        if (response.success) {
          this.transactions = response.transactions;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch transactions';
        throw error;
      }
    },
    
    async fetchTransaction(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const transaction = mockTransactions.find(transaction => transaction.id === id);
          
          if (!transaction) {
            throw new Error(`Transaction with ID ${id} not found`);
          }
          
          response = { success: true, transaction };
        } else {
          response = await transactionsApi.fetchTransaction(id);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || `Failed to fetch transaction with ID ${id}`;
        throw error;
      }
    },
    
    async createTransaction(transaction: any) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Generate new ID and add timestamps
          const id = `trx-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
          const now = new Date();
          
          const newTransaction = {
            ...transaction,
            id,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            status: 'completed',
            isVoided: false,
            referenceNumber: id
          };
          
          response = { success: true, transaction: newTransaction };
          
          // Add to mock data
          mockTransactions.unshift(newTransaction);
        } else {
          response = await transactionsApi.createTransaction(transaction);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to create transaction';
        throw error;
      }
    },
    
    async voidTransaction(id: string, reason: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          // Find and update the transaction
          const index = mockTransactions.findIndex(t => t.id === id);
          if (index === -1) throw new Error('Transaction not found');
          
          mockTransactions[index] = {
            ...mockTransactions[index],
            isVoided: true,
            voidReason: reason,
            voidedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, transaction: mockTransactions[index] };
        } else {
          response = await transactionsApi.voidTransaction(id, { reason });
        }
        
        // Update the transaction in state
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
          this.transactions[index] = response.transaction;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to void transaction';
        throw error;
      }
    },
    
    async generateTransactionDocument(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In mock mode, we just pretend to generate a document
          response = { 
            success: true, 
            documentUrl: `https://example.com/documents/${id}.pdf`
          };
        } else {
          response = await transactionsApi.generateTransactionDocument(id);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to generate document';
        throw error;
      }
    }
  }
});

// Transfers Store
export const useTransfersStore = defineStore('transfers', {
  state: (): TransferState => ({
    transfers: [],
    isLoading: false,
    error: null,
    useMockData: isDev
  }),
  
  getters: {
    getTransfers: (state) => state.transfers,
    getTransferById: (state) => (id: string) => 
      state.transfers.find(transfer => transfer.id === id),
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    
    // Status-based getters
    getPendingTransfers: (state) => 
      state.transfers.filter(transfer => transfer.status === 'pending'),
    getInTransitTransfers: (state) => 
      state.transfers.filter(transfer => transfer.status === 'in_transit'),
    getAwaitingReceiptTransfers: (state) => 
      state.transfers.filter(transfer => transfer.status === 'awaiting_receipt'),
    getCompletedTransfers: (state) => 
      state.transfers.filter(transfer => transfer.status === 'completed'),
    getCancelledTransfers: (state) => 
      state.transfers.filter(transfer => transfer.status === 'cancelled'),
    
    // Location-based getters
    getTransfersFromLocation: (state) => (locationId: string) => 
      state.transfers.filter(transfer => transfer.fromLocationId === locationId),
    getTransfersToLocation: (state) => (locationId: string) => 
      state.transfers.filter(transfer => transfer.toLocationId === locationId),
    
    // Type-based getters
    getStandardTransfers: (state) => 
      state.transfers.filter(transfer => transfer.type === 'standard'),
    getReturnTransfers: (state) => 
      state.transfers.filter(transfer => transfer.type === 'return'),
    getAdjustmentTransfers: (state) => 
      state.transfers.filter(transfer => transfer.type === 'adjustment'),
    getBulkTransfers: (state) => 
      state.transfers.filter(transfer => transfer.type === 'bulk'),
      
    // Date-based getters
    getRecentTransfers: (state) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return state.transfers.filter(transfer => 
        new Date(transfer.createdAt) >= thirtyDaysAgo
      );
    },
    
    // Item-based getters
    getTransfersByItem: (state) => (itemId: string) => 
      state.transfers.filter(transfer => 
        transfer.items.some(item => item.itemId === itemId)
      )
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    async fetchTransfers(filters: TransferFilters = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Filter mock transfers based on the provided filters
          let filteredTransfers = [...mockTransfers];
          
          if (filters.status && filters.status !== 'all') {
            filteredTransfers = filteredTransfers.filter(
              t => t.status === filters.status
            );
          }
          
          if (filters.fromLocationId && filters.fromLocationId !== 'all') {
            filteredTransfers = filteredTransfers.filter(
              t => t.fromLocationId === filters.fromLocationId
            );
          }
          
          if (filters.toLocationId && filters.toLocationId !== 'all') {
            filteredTransfers = filteredTransfers.filter(
              t => t.toLocationId === filters.toLocationId
            );
          }
          
          if (filters.dateRange && filters.dateRange !== 'all') {
            const now = new Date();
            let startDate = new Date();
            
            // Set start date based on range
            switch (filters.dateRange) {
              case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'week':
                startDate.setDate(now.getDate() - now.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'month':
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'quarter':
                const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
                startDate.setMonth(quarterMonth);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
              default:
                // Custom date range would be handled here
                break;
            }
            
            filteredTransfers = filteredTransfers.filter(t => {
              const transferDate = new Date(t.createdAt);
              return transferDate >= startDate && transferDate <= now;
            });
          }
          
          response = { success: true, transfers: filteredTransfers };
        } else {
          // Real API call
          response = await transfersApi.fetchTransfers(filters);
        }
        
        if (response.success) {
          this.transfers = response.transfers;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch transfers';
        throw error;
      }
    },
    
    async fetchTransfer(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const transfer = mockTransfers.find(transfer => transfer.id === id);
          
          if (!transfer) {
            throw new Error(`Transfer with ID ${id} not found`);
          }
          
          response = { success: true, transfer };
        } else {
          response = await transfersApi.fetchTransfer(id);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || `Failed to fetch transfer with ID ${id}`;
        throw error;
      }
    },
    
    async createTransfer(transfer: any) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Generate new ID and add timestamps
          const id = `tr-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
          const now = new Date();
          
          const newTransfer = {
            ...transfer,
            id,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            status: 'pending',
            referenceNumber: id
          };
          
          response = { success: true, transfer: newTransfer };
          
          // Add to mock data
          mockTransfers.unshift(newTransfer);
        } else {
          response = await transfersApi.createTransfer(transfer);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to create transfer';
        throw error;
      }
    },
    
    async approveTransfer(id: string, approvalData: any) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          // Find and update the transfer
          const index = mockTransfers.findIndex(t => t.id === id);
          if (index === -1) throw new Error('Transfer not found');
          
          mockTransfers[index] = {
            ...mockTransfers[index],
            status: 'in_transit',
            approvedBy: approvalData.approvedBy || 'mock-user',
            approvedAt: new Date().toISOString(),
            approvalNotes: approvalData.notes || '',
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, transfer: mockTransfers[index] };
        } else {
          response = await transfersApi.approveTransfer(id, approvalData);
        }
        
        // Update the transfer in state
        const index = this.transfers.findIndex(t => t.id === id);
        if (index !== -1) {
          this.transfers[index] = response.transfer;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to approve transfer';
        throw error;
      }
    },
    
    async receiveTransfer(id: string, receiptData: any) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          // Find and update the transfer
          const index = mockTransfers.findIndex(t => t.id === id);
          if (index === -1) throw new Error('Transfer not found');
          
          // Update items with received quantities and discrepancies
          const items = mockTransfers[index].items.map(item => ({
            ...item,
            receivedQuantity: receiptData.items?.find(i => i.itemId === item.itemId)?.receivedQuantity || item.quantity,
            hasDiscrepancy: receiptData.items?.find(i => i.itemId === item.itemId)?.hasDiscrepancy || false,
            discrepancyReason: receiptData.items?.find(i => i.itemId === item.itemId)?.discrepancyReason || ''
          }));
          
          mockTransfers[index] = {
            ...mockTransfers[index],
            status: 'completed',
            receivedBy: receiptData.receivedBy || 'mock-user',
            receivedAt: new Date().toISOString(),
            receiptNotes: receiptData.notes || '',
            items,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, transfer: mockTransfers[index] };
        } else {
          response = await transfersApi.receiveTransfer(id, receiptData);
        }
        
        // Update the transfer in state
        const index = this.transfers.findIndex(t => t.id === id);
        if (index !== -1) {
          this.transfers[index] = response.transfer;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to receive transfer';
        throw error;
      }
    },
    
    async cancelTransfer(id: string, reason: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          // Find and update the transfer
          const index = mockTransfers.findIndex(t => t.id === id);
          if (index === -1) throw new Error('Transfer not found');
          
          mockTransfers[index] = {
            ...mockTransfers[index],
            status: 'cancelled',
            cancelledBy: 'mock-user',
            cancelledAt: new Date().toISOString(),
            cancellationReason: reason,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, transfer: mockTransfers[index] };
        } else {
          response = await transfersApi.cancelTransfer(id, { reason });
        }
        
        // Update the transfer in state
        const index = this.transfers.findIndex(t => t.id === id);
        if (index !== -1) {
          this.transfers[index] = response.transfer;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to cancel transfer';
        throw error;
      }
    },
    
    async generateTransferDocument(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In mock mode, we just pretend to generate a document
          response = { 
            success: true, 
            documentUrl: `https://example.com/transfers/${id}.pdf`
          };
        } else {
          response = await transfersApi.generateTransferDocument(id);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to generate document';
        throw error;
      }
    }
  }
});