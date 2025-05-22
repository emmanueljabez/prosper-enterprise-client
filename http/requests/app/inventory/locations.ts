import axiosInstance from '@/http/axios';
import type { 
  Location, 
  LocationCreateInput, 
  LocationUpdateInput, 
  BulkLocationUpdate,
  LocationFilters 
} from '@/types/inventory/location';

// Define API client for Location operations
export default {
  fetchLocations: (params: LocationFilters = {}) => {
    return axiosInstance.get('/inventory/locations', { params });
  },
  
  fetchLocation: (id: string) => {
    return axiosInstance.get(`/inventory/locations/${id}`);
  },
  
  createLocation: (location: LocationCreateInput) => {
    return axiosInstance.post('/inventory/locations', location);
  },
  
  updateLocation: (id: string, location: LocationUpdateInput) => {
    return axiosInstance.put(`/inventory/locations/${id}`, location);
  },
  
  deleteLocation: (id: string) => {
    return axiosInstance.delete(`/inventory/locations/${id}`);
  },
  
  activateLocation: (id: string) => {
    return axiosInstance.patch(`/inventory/locations/${id}/activate`);
  },
  
  deactivateLocation: (id: string) => {
    return axiosInstance.patch(`/inventory/locations/${id}/deactivate`);
  },
  
  moveLocation: (id: string, parentId: string | null) => {
    return axiosInstance.patch(`/inventory/locations/${id}/move`, { parentId });
  },
  
  bulkUpdateLocations: (locationIds: string[], updates: BulkLocationUpdate) => {
    return axiosInstance.patch('/inventory/locations/bulk-update', { locationIds, updates });
  },
  
  getLocationTree: () => {
    return axiosInstance.get('/inventory/locations/tree');
  },
  
  getLocationPath: (id: string) => {
    return axiosInstance.get(`/inventory/locations/${id}/path`);
  },
  
  getLocationCapacity: (id: string) => {
    return axiosInstance.get(`/inventory/locations/${id}/capacity`);
  },
  
  updateLocationCapacity: (id: string, capacity: {
    weightCapacity?: { value: number, unit: string },
    volumeCapacity?: { value: number, unit: string }
  }) => {
    return axiosInstance.patch(`/inventory/locations/${id}/capacity`, capacity);
  },
  
  getLocationItems: (id: string, params = {}) => {
    return axiosInstance.get(`/inventory/locations/${id}/items`, { params });
  },
  
  exportLocations: (format: string = 'csv', filters: LocationFilters = {}) => {
    return axiosInstance.get(`/inventory/locations/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },
  
  importLocations: (formData: FormData) => {
    return axiosInstance.post('/inventory/locations/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  validateLocation: (locationData: Partial<Location>) => {
    return axiosInstance.post('/inventory/locations/validate', locationData);
  },
  
  searchLocations: (query: string, params: LocationFilters = {}) => {
    return axiosInstance.get('/inventory/locations/search', {
      params: {
        query,
        ...params
      }
    });
  }
};