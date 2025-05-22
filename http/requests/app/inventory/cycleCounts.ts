import axiosInstance from '@/http/axios';
import type { 
  CycleCount, 
  CycleCountFilterParams, 
  CountItem, 
  VarianceData, 
  ScheduleOptions
} from '@/types/inventory/cycleCounts';

// Define API client for Cycle Count operations
export default {
  /**
   * Fetch all cycle counts with optional filters
   */
  fetchCycleCounts: (params: CycleCountFilterParams = {}) => {
    return axiosInstance.get('/inventory/cycle-counts', { params });
  },
  
  /**
   * Fetch a single cycle count by ID
   */
  fetchCycleCount: (id: string) => {
    return axiosInstance.get(`/inventory/cycle-counts/${id}`);
  },
  
  /**
   * Create a new cycle count
   */
  createCycleCount: (cycleCount: Partial<CycleCount>) => {
    return axiosInstance.post('/inventory/cycle-counts', cycleCount);
  },
  
  /**
   * Update an existing cycle count (typically only for 'scheduled' status)
   */
  updateCycleCount: (id: string, cycleCount: Partial<CycleCount>) => {
    return axiosInstance.put(`/inventory/cycle-counts/${id}`, cycleCount);
  },
  
  /**
   * Start a cycle count (transition from 'scheduled' to 'in_progress')
   */
  startCycleCount: (id: string) => {
    return axiosInstance.post(`/inventory/cycle-counts/${id}/start`);
  },
  
  /**
   * Save progress during a cycle count without completing it
   */
  saveCycleCountProgress: (id: string, data: { items: CountItem[] }) => {
    return axiosInstance.post(`/inventory/cycle-counts/${id}/progress`, data);
  },
  
  /**
   * Complete a cycle count (transition from 'in_progress' to 'pending_approval' or 'completed')
   */
  completeCycleCount: (id: string, data: { items: CountItem[] }) => {
    return axiosInstance.post(`/inventory/cycle-counts/${id}/complete`, data);
  },
  
  /**
   * Update variance decisions for items in a cycle count
   */
  updateVariances: (id: string, data: VarianceData) => {
    return axiosInstance.post(`/inventory/cycle-counts/${id}/variances`, data);
  },
  
  /**
   * Approve a cycle count with variances (transition from 'pending_approval' to 'completed')
   */
  approveCycleCount: (id: string, data: { notes?: string }) => {
    return axiosInstance.post(`/inventory/cycle-counts/${id}/approve`, data);
  },
  
  /**
   * Cancel a cycle count
   */
  cancelCycleCount: (id: string, reason: string) => {
    return axiosInstance.post(`/inventory/cycle-counts/${id}/cancel`, { reason });
  },
  
  /**
   * Schedule a recurring cycle count
   */
  scheduleRecurringCount: (scheduleOptions: ScheduleOptions) => {
    return axiosInstance.post('/inventory/cycle-counts/schedule', scheduleOptions);
  },
  
  /**
   * Update a recurring cycle count schedule
   */
  updateRecurringSchedule: (id: string, scheduleOptions: Partial<ScheduleOptions>) => {
    return axiosInstance.put(`/inventory/cycle-counts/${id}/schedule`, scheduleOptions);
  },
  
  /**
   * Delete a scheduled recurring cycle count
   */
  deleteRecurringSchedule: (id: string) => {
    return axiosInstance.delete(`/inventory/cycle-counts/${id}/schedule`);
  },
  
  /**
   * Generate a printable count sheet for performing physical counts
   */
  generateCountSheet: (id: string, format: 'pdf' | 'excel' = 'pdf') => {
    return axiosInstance.get(`/inventory/cycle-counts/${id}/count-sheet`, {
      params: { format },
      responseType: 'blob'
    });
  },
  
  /**
   * Generate a variance report for a completed count
   */
  generateVarianceReport: (id: string, format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
    return axiosInstance.get(`/inventory/cycle-counts/${id}/variance-report`, {
      params: { format },
      responseType: 'blob'
    });
  },
  
  /**
   * Export cycle counts to CSV, Excel, or PDF format
   */
  exportCycleCounts: (format: 'csv' | 'excel' | 'pdf' = 'csv', filters: CycleCountFilterParams = {}) => {
    return axiosInstance.get(`/inventory/cycle-counts/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },
  
  /**
   * Get cycle counts for a specific location
   */
  fetchCycleCountsByLocation: (locationId: string, params: CycleCountFilterParams = {}) => {
    return axiosInstance.get(`/inventory/locations/${locationId}/cycle-counts`, { params });
  },
  
  /**
   * Get cycle counts for a specific item
   */
  fetchCycleCountsByItem: (itemId: string, params: CycleCountFilterParams = {}) => {
    return axiosInstance.get(`/inventory/items/${itemId}/cycle-counts`, { params });
  },
  
  /**
   * Get cycle count statistics
   */
  getCycleCountStats: (params: CycleCountFilterParams = {}) => {
    return axiosInstance.get('/inventory/cycle-counts/stats', { params });
  },
  
  /**
   * Assign users to a cycle count
   */
  assignUsers: (id: string, userIds: string[]) => {
    return axiosInstance.post(`/inventory/cycle-counts/${id}/assign-users`, { userIds });
  },
  
  /**
   * Submit recount for specific items in a cycle count
   */
  submitRecount: (id: string, data: { items: { itemId: string, countedQuantity: number }[] }) => {
    return axiosInstance.post(`/inventory/cycle-counts/${id}/recount`, data);
  },
  
  /**
   * Get the audit history for a cycle count
   */
  getCycleCountAuditHistory: (id: string) => {
    return axiosInstance.get(`/inventory/cycle-counts/${id}/audit-history`);
  }
};