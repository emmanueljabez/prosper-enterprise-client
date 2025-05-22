import axiosInstance from "~/http/axios";
import type { AuditFilters } from "@/types/inventory/audit";

export default {
  // Fetch audit logs with optional filters
  fetchAuditLogs(filters: AuditFilters = {}) {
    return axiosInstance.get('/inventory/audit', { params: filters });
  },

  // Fetch a single audit log by ID
  fetchAuditLogDetails(id: string) {
    return axiosInstance.get(`/inventory/audit/${id}`);
  },

  // Fetch audit logs for a specific entity
  fetchEntityAuditLogs(entityType: string, entityId: string) {
    return axiosInstance.get(`/inventory/audit/entity/${entityType}/${entityId}`);
  },

  // Fetch audit logs for a specific user
  fetchUserAuditLogs(userId: string) {
    return axiosInstance.get(`/inventory/audit/user/${userId}`);
  },

  // Fetch audit logs for a specific transaction
  fetchTransactionAuditLogs(transactionId: string) {
    return axiosInstance.get(`/inventory/audit/transaction/${transactionId}`);
  },

  // Fetch audit logs for a specific item
  fetchItemAuditLogs(itemId: string) {
    return axiosInstance.get(`/inventory/audit/item/${itemId}`);
  },

  // Fetch audit logs for a specific location
  fetchLocationAuditLogs(locationId: string) {
    return axiosInstance.get(`/inventory/audit/location/${locationId}`);
  },

  // Export audit logs (filtered)
  exportAuditLogs(format: string, filters: AuditFilters = {}) {
    return axiosInstance.get(`/inventory/audit/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },

  // Add a custom audit log entry
  addAuditLog(logData: {
    action: string;
    entityType: string;
    entityId?: string;
    details: string;
    previousValue?: string;
    newValue?: string;
    severity?: 'info' | 'warning' | 'critical';
    [key: string]: any;
  }) {
    return axiosInstance.post('/inventory/audit', logData);
  },

  // Fetch activity summary by time period (for dashboards)
  fetchActivitySummary(period: 'day' | 'week' | 'month' | 'custom', startDate?: string, endDate?: string) {
    return axiosInstance.get('/inventory/audit/summary', { 
      params: { period, startDate, endDate }
    });
  },

  // Fetch action type counts (for charts and analytics)
  fetchActionCounts(filters: AuditFilters = {}) {
    return axiosInstance.get('/inventory/audit/counts', { params: filters });
  },

  // Fetch recent user activity
  fetchRecentUserActivity(limit: number = 10) {
    return axiosInstance.get('/inventory/audit/recent-activity', { 
      params: { limit }
    });
  },

  // Fetch security related logs (login attempts, permission changes, etc.)
  fetchSecurityLogs(filters: AuditFilters = {}) {
    return axiosInstance.get('/inventory/audit/security', { params: filters });
  },

  // Mark an audit log as reviewed
  markAsReviewed(id: string, reviewerNotes?: string) {
    return axiosInstance.patch(`/inventory/audit/${id}/review`, { 
      reviewed: true, 
      reviewerNotes
    });
  }
}