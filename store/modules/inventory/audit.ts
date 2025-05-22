import { defineStore } from 'pinia';
import { mockAuditLogs } from '@/mock/mockInventoryData';
import auditApi from '~/http/requests/app/inventory/audit';
import type { AuditLog, AuditState, AuditFilters } from '@/types/inventory/audit';

// Determine if we're in development environment
const isDev = process.env.NODE_ENV === 'development';

export const useAuditStore = defineStore('audit', {
  state: (): AuditState => ({
    auditLogs: [],
    isLoading: false,
    error: null,
    useMockData: isDev,
    hasMoreLogs: true,
    currentPage: 1,
    pageSize: 20,
    totalCount: 0
  }),
  
  getters: {
    getAuditLogs: (state) => state.auditLogs,
    getAuditLogById: (state) => (id: string) => state.auditLogs.find(log => log.id === id),
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getTotalCount: (state) => state.totalCount,
    
    getAuditLogsByAction: (state) => (action: string) => 
      state.auditLogs.filter(log => log.action === action),
    
    getAuditLogsByUser: (state) => (userId: string) => 
      state.auditLogs.filter(log => log.userId === userId),
    
    getAuditLogsByTransactionId: (state) => (transactionId: string) => 
      state.auditLogs.filter(log => log.transactionId === transactionId),
    
    getAuditLogsByItemId: (state) => (itemId: string) => 
      state.auditLogs.filter(log => log.itemId === itemId),
    
    getAuditLogsByLocationId: (state) => (locationId: string) => 
      state.auditLogs.filter(log => log.locationId === locationId),
    
    getAuditLogsByDate: (state) => (startDate: string, endDate: string) => {
      return state.auditLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return logDate >= start && logDate <= end;
      });
    },
    
    getAuditLogsByEntityType: (state) => (entityType: string) => 
      state.auditLogs.filter(log => log.entityType === entityType),
    
    // Group audit logs by date (for timeline display)
    getAuditLogsByDateGroups: (state) => {
      const groups: Record<string, AuditLog[]> = {};
      
      state.auditLogs.forEach(log => {
        // Extract the date part
        const date = log.timestamp.split('T')[0];
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(log);
      });
      
      return groups;
    },
    
    // Get counts of different actions for reports/dashboards
    getActionCounts: (state) => {
      const counts: Record<string, number> = {};
      
      state.auditLogs.forEach(log => {
        if (!counts[log.action]) {
          counts[log.action] = 0;
        }
        counts[log.action]++;
      });
      
      return counts;
    }
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    async fetchAuditLogs(filters: AuditFilters = {}) {
      this.isLoading = true;
      this.error = null;
      this.currentPage = filters.page || 1;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Filter mock audit logs based on the provided filters
          let filteredLogs = [...mockAuditLogs];
          
          if (filters.action) {
            filteredLogs = filteredLogs.filter(
              log => log.action === filters.action
            );
          }
          
          if (filters.userId) {
            filteredLogs = filteredLogs.filter(
              log => log.userId === filters.userId
            );
          }
          
          if (filters.transactionId) {
            filteredLogs = filteredLogs.filter(
              log => log.transactionId === filters.transactionId
            );
          }
          
          if (filters.itemId) {
            filteredLogs = filteredLogs.filter(
              log => log.itemId === filters.itemId
            );
          }
          
          if (filters.locationId) {
            filteredLogs = filteredLogs.filter(
              log => log.locationId === filters.locationId
            );
          }
          
          if (filters.entityType) {
            filteredLogs = filteredLogs.filter(
              log => log.entityType === filters.entityType
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
                if (filters.startDate && filters.endDate) {
                  startDate = new Date(filters.startDate);
                  const endDate = new Date(filters.endDate);
                  filteredLogs = filteredLogs.filter(log => {
                    const logDate = new Date(log.timestamp);
                    return logDate >= startDate && logDate <= endDate;
                  });
                  break;
                }
                break;
            }
            
            if (filters.dateRange !== 'custom') {
              filteredLogs = filteredLogs.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate >= startDate && logDate <= now;
              });
            }
          }
          
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filteredLogs = filteredLogs.filter(
              log => log.details?.toLowerCase().includes(query) || 
                    log.userDisplayName?.toLowerCase().includes(query)
            );
          }
          
          // Sort by timestamp (newest first)
          filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          // Save total count
          this.totalCount = filteredLogs.length;
          
          // Implement pagination
          const start = (this.currentPage - 1) * this.pageSize;
          const end = Math.min(start + this.pageSize, filteredLogs.length);
          const paginatedLogs = filteredLogs.slice(start, end);
          
          // Check if there are more logs
          this.hasMoreLogs = end < filteredLogs.length;
          
          response = { 
            success: true, 
            auditLogs: paginatedLogs, 
            total: filteredLogs.length,
            hasMore: this.hasMoreLogs
          };
        } else {
          // Real API call
          response = await auditApi.fetchAuditLogs({
            ...filters,
            page: this.currentPage,
            pageSize: this.pageSize
          });
          
          this.hasMoreLogs = response.hasMore;
          this.totalCount = response.total;
        }
        
        if (response.success) {
          this.auditLogs = response.auditLogs;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch audit logs';
        throw error;
      }
    },
    
    async fetchMoreAuditLogs(filters: AuditFilters = {}) {
      if (!this.hasMoreLogs || this.isLoading) return;
      
      this.isLoading = true;
      this.currentPage += 1;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Filter mock audit logs (same logic as in fetchAuditLogs)
          let filteredLogs = [...mockAuditLogs];
          
          // Apply the same filters as in fetchAuditLogs
          // This would typically be extracted to a shared helper function
          // to avoid duplication, but keeping it here for clarity
          
          if (filters.action) {
            filteredLogs = filteredLogs.filter(
              log => log.action === filters.action
            );
          }
          
          // (Apply the rest of the filters...)
          
          // Sort by timestamp (newest first)
          filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          // Get next page
          const start = (this.currentPage - 1) * this.pageSize;
          const end = Math.min(start + this.pageSize, filteredLogs.length);
          
          if (start >= filteredLogs.length) {
            this.hasMoreLogs = false;
            this.isLoading = false;
            return;
          }
          
          const nextPageLogs = filteredLogs.slice(start, end);
          this.hasMoreLogs = end < filteredLogs.length;
          
          response = { 
            success: true, 
            auditLogs: nextPageLogs,
            hasMore: this.hasMoreLogs
          };
        } else {
          // Real API call
          response = await auditApi.fetchAuditLogs({
            ...filters,
            page: this.currentPage,
            pageSize: this.pageSize
          });
          
          this.hasMoreLogs = response.hasMore;
        }
        
        if (response.success) {
          this.auditLogs = [...this.auditLogs, ...response.auditLogs];
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch more audit logs';
        throw error;
      }
    },
    
    async fetchAuditLogDetails(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const auditLog = mockAuditLogs.find(log => log.id === id);
          
          if (!auditLog) {
            throw new Error(`Audit log with ID ${id} not found`);
          }
          
          response = { success: true, auditLog };
        } else {
          response = await auditApi.fetchAuditLogDetails(id);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || `Failed to fetch audit log with ID ${id}`;
        throw error;
      }
    },
    
    async exportAuditLogs(format: string, filters: AuditFilters = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // For mock mode, just simulate a delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          this.isLoading = false;
          return { success: true, message: `Audit logs would be exported in ${format} format in production.` };
        } else {
          const response = await auditApi.exportAuditLogs(format, filters);
          this.isLoading = false;
          return response;
        }
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to export audit logs';
        throw error;
      }
    },
    
    async addCustomAuditLog(logData: Partial<AuditLog>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Generate new ID and add timestamps
          const id = `audit-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
          const now = new Date();
          
          const newLog = {
            id,
            timestamp: now.toISOString(),
            ...logData
          } as AuditLog;
          
          // Add to mock data
          mockAuditLogs.unshift(newLog);
          response = { success: true, auditLog: newLog };
        } else {
          response = await auditApi.addAuditLog(logData);
        }
        
        // If real-time updates are needed, add to the store
        if (response.success && response.auditLog) {
          this.auditLogs = [response.auditLog, ...this.auditLogs];
          this.totalCount++;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to add audit log';
        throw error;
      }
    }
  }
});