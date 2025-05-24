import axiosInstance from '@/http/axios';
import type { 
  SyncRule, 
  CreateSyncRuleRequest, 
  UpdateSyncRuleRequest,
  BulkUpdateSyncRuleRequest
} from '@/types/rules/sync';

// Define API client for sync rules
export default {
  fetchSyncRules: (params = {}) => {
    return axiosInstance.get('/rules/sync', { params });
  },
  
  fetchSyncRule: (id: string) => {
    return axiosInstance.get(`/rules/sync/${id}`);
  },
  
  createSyncRule: (rule: CreateSyncRuleRequest) => {
    return axiosInstance.post('/rules/sync', rule);
  },
  
  updateSyncRule: (id: string, rule: UpdateSyncRuleRequest) => {
    return axiosInstance.put(`/rules/sync/${id}`, rule);
  },
  
  deleteSyncRule: (id: string) => {
    return axiosInstance.delete(`/rules/sync/${id}`);
  },
  
  updateSyncRuleStatus: (id: string, active: boolean) => {
    return axiosInstance.patch(`/rules/sync/${id}/status`, { active });
  },
  
  duplicateSyncRule: (id: string) => {
    return axiosInstance.post(`/rules/sync/${id}/duplicate`);
  },
  
  executeSyncRule: (id: string) => {
    return axiosInstance.post(`/rules/sync/${id}/execute`);
  },
  
  bulkUpdateSyncRules: (request: BulkUpdateSyncRuleRequest) => {
    return axiosInstance.patch('/rules/sync/bulk-update', request);
  },
  
  exportSyncRules: (format: string = 'csv', filters = {}) => {
    return axiosInstance.get(`/rules/sync/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },
  
  importSyncRules: (formData: FormData) => {
    return axiosInstance.post('/rules/sync/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};