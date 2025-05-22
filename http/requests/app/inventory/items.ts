import axiosInstance from '@/http/axios';
import type { InventoryItem, StockAdjustment } from '@/types/inventory/items';

// Define API client
// In a real application, you would create this in http/requests/app/inventory/items.ts
export default {
  fetchItems: (params = {}) => {
    return axiosInstance.get('/inventory/items', { params });
  },
  
  fetchItem: (id: string) => {
    return axiosInstance.get(`/inventory/items/${id}`);
  },
  
  createItem: (item: Partial<InventoryItem>) => {
    return axiosInstance.post('/inventory/items', item);
  },
  
  updateItem: (id: string, item: Partial<InventoryItem>) => {
    return axiosInstance.put(`/inventory/items/${id}`, item);
  },
  
  deleteItem: (id: string) => {
    return axiosInstance.delete(`/inventory/items/${id}`);
  },
  
  updateItemStatus: (id: string, status: string, reason?: string) => {
    return axiosInstance.patch(`/inventory/items/${id}/status`, { status, reason });
  },
  
  duplicateItem: (id: string) => {
    return axiosInstance.post(`/inventory/items/${id}/duplicate`);
  },
  
  adjustItemStock: (adjustment: StockAdjustment) => {
    return axiosInstance.post('/inventory/items/adjust-stock', adjustment);
  },
  
  bulkUpdateItems: (itemIds: string[], updates: any) => {
    return axiosInstance.patch('/inventory/items/bulk-update', { itemIds, updates });
  },
  
  exportItems: (format: string = 'csv', filters = {}) => {
    return axiosInstance.get(`/inventory/items/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },
  
  importItems: (formData: FormData) => {
    return axiosInstance.post('/inventory/items/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};