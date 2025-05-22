import { defineStore } from 'pinia';
import { mockCycleCounts } from '@/mock/mockInventoryData';
import cycleCountApi from '~/http/requests/app/inventory/cycleCounts';
import type { 
  CycleCount, 
  CycleCountState, 
  CountItem, 
  VarianceData, 
  ScheduleOptions 
} from '@/types/inventory/cycleCounts';

// Determine if we're in development environment
const isDev = process.env.NODE_ENV === 'development';

export const useCycleCountsStore = defineStore('cycleCounts', {
  state: (): CycleCountState => ({
    cycleCounts: [],
    isLoading: false,
    error: null,
    useMockData: isDev,
    currentCount: null
  }),
  
  getters: {
    getCycleCounts: (state) => state.cycleCounts,
    getCycleCountById: (state) => (id: string) => 
      state.cycleCounts.find(count => count.id === id),
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getCurrentCount: (state) => state.currentCount,
    
    // Status-based getters
    getScheduledCounts: (state) => 
      state.cycleCounts.filter(count => count.status === 'scheduled'),
    getInProgressCounts: (state) => 
      state.cycleCounts.filter(count => count.status === 'in_progress'),
    getPendingApprovalCounts: (state) => 
      state.cycleCounts.filter(count => count.status === 'pending_approval'),
    getCompletedCounts: (state) => 
      state.cycleCounts.filter(count => count.status === 'completed'),
    getCancelledCounts: (state) => 
      state.cycleCounts.filter(count => count.status === 'cancelled'),
    
    // Location-based getters
    getCountsByLocation: (state) => (locationId: string) => 
      state.cycleCounts.filter(count => count.locationId === locationId),
    
    // Date-based getters
    getRecentCounts: (state) => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      return state.cycleCounts.filter(count => {
        const countDate = new Date(count.startDate);
        return countDate >= thirtyDaysAgo;
      });
    },
    
    // Variance-related getters
    getCountsWithVariance: (state) => 
      state.cycleCounts.filter(count => count.hasVariance === true),
    
    // Recurring counts
    getRecurringCounts: (state) => 
      state.cycleCounts.filter(count => count.isRecurring === true),
    
    // Utility getters
    getTotalCountsByStatus: (state) => {
      const counts = {
        scheduled: 0,
        in_progress: 0,
        pending_approval: 0,
        completed: 0,
        cancelled: 0
      };
      
      state.cycleCounts.forEach(count => {
        if (counts.hasOwnProperty(count.status)) {
          counts[count.status as keyof typeof counts]++;
        }
      });
      
      return counts;
    },
    
    getCompletedCountsThisMonth: (state) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      return state.cycleCounts.filter(count => {
        if (count.status !== 'completed' || !count.completedAt) return false;
        
        const completedDate = new Date(count.completedAt);
        return completedDate.getMonth() === currentMonth && 
               completedDate.getFullYear() === currentYear;
      });
    }
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    async fetchCycleCounts(params = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Apply filters if needed
          let filteredCounts = [...mockCycleCounts];
          
          if (params.status) {
            filteredCounts = filteredCounts.filter(count => 
              count.status === params.status
            );
          }
          
          if (params.locationId) {
            filteredCounts = filteredCounts.filter(count => 
              count.locationId === params.locationId
            );
          }
          
          // Handle date range filter
          if (params.dateRange) {
            const now = new Date();
            let startDate;
            
            switch (params.dateRange) {
              case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
              case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
              case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
              case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
              default:
                startDate = null;
            }
            
            if (startDate) {
              filteredCounts = filteredCounts.filter(count => {
                const countDate = new Date(count.startDate);
                return countDate >= startDate;
              });
            }
          }
          
          response = { success: true, cycleCounts: filteredCounts };
        } else {
          // Real API call
          response = await cycleCountApi.fetchCycleCounts(params);
        }
        
        if (response.success) {
          this.cycleCounts = response.cycleCounts;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch cycle counts';
        throw error;
      }
    },
    
    async fetchCycleCount(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const count = mockCycleCounts.find(count => count.id === id);
          
          if (!count) {
            throw new Error(`Cycle count with ID ${id} not found`);
          }
          
          response = { success: true, cycleCount: count };
        } else {
          response = await cycleCountApi.fetchCycleCount(id);
        }
        
        if (response.success) {
          this.currentCount = response.cycleCount;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || `Failed to fetch cycle count with ID ${id}`;
        throw error;
      }
    },
    
    async createCycleCount(newCount: Partial<CycleCount>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Generate new ID and add timestamps
          const createdCount = {
            ...newCount,
            id: `count-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: [], // Initialize with empty items array
            hasVariance: false
          } as CycleCount;
          
          response = { success: true, cycleCount: createdCount };
        } else {
          response = await cycleCountApi.createCycleCount(newCount);
        }
        
        if (response.success && response.cycleCount) {
          this.cycleCounts.push(response.cycleCount);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to create cycle count';
        throw error;
      }
    },
    
    async scheduleRecurringCount(scheduleOptions: ScheduleOptions) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Generate new ID and add timestamps
          const createdCount = {
            id: `count-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            name: scheduleOptions.name,
            description: scheduleOptions.description,
            locationId: scheduleOptions.locationId,
            status: 'scheduled',
            startDate: scheduleOptions.startDate,
            isRecurring: true,
            recurrencePattern: scheduleOptions.recurrencePattern,
            recurrenceFrequency: scheduleOptions.recurrenceFrequency,
            recurrenceDayOfWeek: scheduleOptions.recurrenceDayOfWeek,
            recurrenceDayOfMonth: scheduleOptions.recurrenceDayOfMonth,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: [],
            hasVariance: false
          } as CycleCount;
          
          response = { success: true, cycleCount: createdCount };
        } else {
          response = await cycleCountApi.scheduleRecurringCount(scheduleOptions);
        }
        
        if (response.success && response.cycleCount) {
          this.cycleCounts.push(response.cycleCount);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to schedule recurring count';
        throw error;
      }
    },
    
    async startCycleCount(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Find the count
          const countIndex = this.cycleCounts.findIndex(count => count.id === id);
          if (countIndex === -1) throw new Error('Cycle count not found');
          
          // Update the count
          const updatedCount = {
            ...this.cycleCounts[countIndex],
            status: 'in_progress',
            startedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, cycleCount: updatedCount };
        } else {
          response = await cycleCountApi.startCycleCount(id);
        }
        
        if (response.success && response.cycleCount) {
          const index = this.cycleCounts.findIndex(count => count.id === id);
          if (index !== -1) {
            this.cycleCounts[index] = response.cycleCount;
          }
          this.currentCount = response.cycleCount;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to start cycle count';
        throw error;
      }
    },
    
    async saveCycleCountProgress(id: string, countData: { items: CountItem[] }) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the count
          const countIndex = this.cycleCounts.findIndex(count => count.id === id);
          if (countIndex === -1) throw new Error('Cycle count not found');
          
          // Update the count with progress
          const updatedCount = {
            ...this.cycleCounts[countIndex],
            items: countData.items,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, cycleCount: updatedCount };
        } else {
          response = await cycleCountApi.saveCycleCountProgress(id, countData);
        }
        
        if (response.success && response.cycleCount) {
          const index = this.cycleCounts.findIndex(count => count.id === id);
          if (index !== -1) {
            this.cycleCounts[index] = response.cycleCount;
          }
          this.currentCount = response.cycleCount;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to save cycle count progress';
        throw error;
      }
    },
    
    async completeCycleCount(id: string, countData: { items: CountItem[] }) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the count
          const countIndex = this.cycleCounts.findIndex(count => count.id === id);
          if (countIndex === -1) throw new Error('Cycle count not found');
          
          // Calculate variances
          const items = countData.items.map(item => {
            const variance = item.countedQuantity - item.expectedQuantity;
            return {
              ...item,
              variance,
              hasVariance: variance !== 0
            };
          });
          
          const hasVariance = items.some(item => item.hasVariance);
          
          // Update the count
          const updatedCount = {
            ...this.cycleCounts[countIndex],
            items,
            status: hasVariance ? 'pending_approval' : 'completed',
            completedAt: hasVariance ? null : new Date().toISOString(),
            hasVariance,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, cycleCount: updatedCount };
        } else {
          response = await cycleCountApi.completeCycleCount(id, countData);
        }
        
        if (response.success && response.cycleCount) {
          const index = this.cycleCounts.findIndex(count => count.id === id);
          if (index !== -1) {
            this.cycleCounts[index] = response.cycleCount;
          }
          this.currentCount = response.cycleCount;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to complete cycle count';
        throw error;
      }
    },
    
    async updateVariances(id: string, varianceData: VarianceData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the count
          const countIndex = this.cycleCounts.findIndex(count => count.id === id);
          if (countIndex === -1) throw new Error('Cycle count not found');
          
          // Update the count with variance decisions
          const updatedItems = this.cycleCounts[countIndex].items.map(item => {
            const varianceDecision = varianceData.items.find(v => v.itemId === item.itemId);
            if (varianceDecision) {
              return {
                ...item,
                varianceResolution: varianceDecision.resolution,
                varianceNotes: varianceDecision.notes
              };
            }
            return item;
          });
          
          const updatedCount = {
            ...this.cycleCounts[countIndex],
            items: updatedItems,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, cycleCount: updatedCount };
        } else {
          response = await cycleCountApi.updateVariances(id, varianceData);
        }
        
        if (response.success && response.cycleCount) {
          const index = this.cycleCounts.findIndex(count => count.id === id);
          if (index !== -1) {
            this.cycleCounts[index] = response.cycleCount;
          }
          this.currentCount = response.cycleCount;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update variances';
        throw error;
      }
    },
    
    async approveCycleCount(id: string, approvalData: { notes?: string }) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the count
          const countIndex = this.cycleCounts.findIndex(count => count.id === id);
          if (countIndex === -1) throw new Error('Cycle count not found');
          
          // Update the count
          const updatedCount = {
            ...this.cycleCounts[countIndex],
            status: 'completed',
            completedAt: new Date().toISOString(),
            approvedAt: new Date().toISOString(),
            approvedBy: 'mock-user-id', // In real app, this would be the current user
            approvalNotes: approvalData.notes || '',
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, cycleCount: updatedCount };
        } else {
          response = await cycleCountApi.approveCycleCount(id, approvalData);
        }
        
        if (response.success && response.cycleCount) {
          const index = this.cycleCounts.findIndex(count => count.id === id);
          if (index !== -1) {
            this.cycleCounts[index] = response.cycleCount;
          }
          this.currentCount = response.cycleCount;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to approve cycle count';
        throw error;
      }
    },
    
    async cancelCycleCount(id: string, reason: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the count
          const countIndex = this.cycleCounts.findIndex(count => count.id === id);
          if (countIndex === -1) throw new Error('Cycle count not found');
          
          // Update the count
          const updatedCount = {
            ...this.cycleCounts[countIndex],
            status: 'cancelled',
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
            cancelledBy: 'mock-user-id', // In real app, this would be the current user
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, cycleCount: updatedCount };
        } else {
          response = await cycleCountApi.cancelCycleCount(id, reason);
        }
        
        if (response.success && response.cycleCount) {
          const index = this.cycleCounts.findIndex(count => count.id === id);
          if (index !== -1) {
            this.cycleCounts[index] = response.cycleCount;
          }
          this.currentCount = response.cycleCount;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to cancel cycle count';
        throw error;
      }
    },
    
    async generateCountSheet(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the count
          const count = this.cycleCounts.find(count => count.id === id);
          if (!count) throw new Error('Cycle count not found');
          
          // Generate a dummy PDF blob
          const text = `Count Sheet for ${count.name}\nDate: ${new Date().toLocaleDateString()}\n\n`;
          const blob = new Blob([text], { type: 'application/pdf' });
          
          response = { 
            success: true, 
            data: blob,
            filename: `count-sheet-${count.id}.pdf`
          };
        } else {
          response = await cycleCountApi.generateCountSheet(id);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to generate count sheet';
        throw error;
      }
    },
    
    // Helper methods
    hasUnresolvedVariances(count: CycleCount): boolean {
      if (!count.items) return false;
      return count.items.some(item => 
        item.hasVariance && !item.varianceResolution
      );
    },
    
    calculateTotalVariance(count: CycleCount): number {
      if (!count.items) return 0;
      return count.items.reduce((total, item) => {
        const variance = (item.countedQuantity - item.expectedQuantity) || 0;
        return total + variance;
      }, 0);
    },
    
    calculateVarianceValue(count: CycleCount): number {
      if (!count.items) return 0;
      return count.items.reduce((total, item) => {
        const variance = (item.countedQuantity - item.expectedQuantity) || 0;
        return total + (variance * (item.cost || 0));
      }, 0);
    }
  }
});