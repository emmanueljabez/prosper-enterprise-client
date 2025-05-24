import axiosInstance from '@/http/axios';
import type { 
  StockVisibilityRule, 
  BackorderSetting, 
  ProductAlternative 
} from '@/types/rules/visibility';

// Define API client for visibility rules
export default {
  // Stock Visibility Rules
  fetchStockVisibilityRules: (params = {}) => {
    return axiosInstance.get('/rules/visibility/stock', { params });
  },
  
  fetchStockVisibilityRule: (id: string) => {
    return axiosInstance.get(`/rules/visibility/stock/${id}`);
  },
  
  createStockVisibilityRule: (rule: Partial<StockVisibilityRule>) => {
    return axiosInstance.post('/rules/visibility/stock', rule);
  },
  
  updateStockVisibilityRule: (id: string, rule: Partial<StockVisibilityRule>) => {
    return axiosInstance.put(`/rules/visibility/stock/${id}`, rule);
  },
  
  deleteStockVisibilityRule: (id: string) => {
    return axiosInstance.delete(`/rules/visibility/stock/${id}`);
  },
  
  // Backorder Settings
  fetchBackorderSettings: (params = {}) => {
    return axiosInstance.get('/rules/visibility/backorder', { params });
  },
  
  fetchBackorderSetting: (id: string) => {
    return axiosInstance.get(`/rules/visibility/backorder/${id}`);
  },
  
  createBackorderSetting: (setting: Partial<BackorderSetting>) => {
    return axiosInstance.post('/rules/visibility/backorder', setting);
  },
  
  updateBackorderSetting: (id: string, setting: Partial<BackorderSetting>) => {
    return axiosInstance.put(`/rules/visibility/backorder/${id}`, setting);
  },
  
  deleteBackorderSetting: (id: string) => {
    return axiosInstance.delete(`/rules/visibility/backorder/${id}`);
  },
  
  // Product Alternatives
  fetchProductAlternatives: (params = {}) => {
    return axiosInstance.get('/rules/visibility/alternatives', { params });
  },
  
  fetchProductAlternative: (id: string) => {
    return axiosInstance.get(`/rules/visibility/alternatives/${id}`);
  },
  
  createProductAlternative: (alternative: Partial<ProductAlternative>) => {
    return axiosInstance.post('/rules/visibility/alternatives', alternative);
  },
  
  updateProductAlternative: (id: string, alternative: Partial<ProductAlternative>) => {
    return axiosInstance.put(`/rules/visibility/alternatives/${id}`, alternative);
  },
  
  deleteProductAlternative: (id: string) => {
    return axiosInstance.delete(`/rules/visibility/alternatives/${id}`);
  },
  
  // Batch operations
  bulkUpdateStockVisibilityRules: (ruleIds: string[], updates: any) => {
    return axiosInstance.patch('/rules/visibility/stock/bulk-update', { ruleIds, updates });
  },
  
  bulkUpdateBackorderSettings: (settingIds: string[], updates: any) => {
    return axiosInstance.patch('/rules/visibility/backorder/bulk-update', { settingIds, updates });
  },
  
  bulkUpdateProductAlternatives: (alternativeIds: string[], updates: any) => {
    return axiosInstance.patch('/rules/visibility/alternatives/bulk-update', { alternativeIds, updates });
  },
  
  // Export operations
  exportStockVisibilityRules: (format: string = 'csv', filters = {}) => {
    return axiosInstance.get(`/rules/visibility/stock/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },
  
  exportBackorderSettings: (format: string = 'csv', filters = {}) => {
    return axiosInstance.get(`/rules/visibility/backorder/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },
  
  exportProductAlternatives: (format: string = 'csv', filters = {}) => {
    return axiosInstance.get(`/rules/visibility/alternatives/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },
  
  // Import operations
  importStockVisibilityRules: (formData: FormData) => {
    return axiosInstance.post('/rules/visibility/stock/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  importBackorderSettings: (formData: FormData) => {
    return axiosInstance.post('/rules/visibility/backorder/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  importProductAlternatives: (formData: FormData) => {
    return axiosInstance.post('/rules/visibility/alternatives/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Rule application testing endpoints
  testStockVisibilityRule: (ruleId: string, productId: string) => {
    return axiosInstance.get(`/rules/visibility/stock/${ruleId}/test`, {
      params: { productId }
    });
  },
  
  testBackorderSetting: (settingId: string, productId: string) => {
    return axiosInstance.get(`/rules/visibility/backorder/${settingId}/test`, {
      params: { productId }
    });
  },
  
  getApplicableRules: (productId: string) => {
    return axiosInstance.get('/rules/visibility/applicable-rules', {
      params: { productId }
    });
  }
};