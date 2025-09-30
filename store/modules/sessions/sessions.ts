import { defineStore } from 'pinia';
import sessionsApi from '~/http/requests/app/sessions/sessions';

import type {
  LocationState,
  LocationStats,
  Warehouse,
  Zone,
  Aisle,
  Shelf,
  WarehouseHierarchy,
  WarehouseLocationNode,
  CreateMainWarehouseRequest,
  CreateZoneRequest,
  CreateAisleRequest,
  CreateShelfRequest,
  UpdateWarehouseRequest,
  DeactivateWarehouseRequest,
  WarehouseQueryParams,
  PaginatedResponse,
  ApiResponse
} from '@/types/inventory/location';

// Determine if we're in development environment
const config = useRuntimeConfig() 
const environment = config.public.nodeEnv
const isDev = environment === 'development';

export const useSessionsStore = defineStore('sessions', {
  state: (): LocationState => ({
    // Warehouse management - primary data structure
    warehouses: [],
    paginatedWarehouses: null,
    selectedWarehouse: null,
    warehouseHierarchy: null,
    locationTreeStructure: [],
    zones: [],
    aisles: [],
    shelves: [],
    
    isLoading: false,
    error: null,
    useMockData: isDev, // Default to mock data in development
    locationStats: {
      warehouses: 0,
      zones: 0,
      zonesInUse: 0,
      aisles: 0,
      bins: 0,
      binsInUse: 0,
      totalCapacity: 0,
      itemsStored: 0,
      sites: 0
    } as LocationStats
  }),
  
  getters: {

  },
  
  actions: {
    // CRUD operations
    createSession(sessionData: any) {
      console.log("Saving session data")
      this.isLoading = true;
      this.error = null;
      return new Promise((resolve, reject) => {
        sessionsApi.createSession(sessionData)
          .then(response => {
            resolve(response.data);
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while creating warehouse.';
            reject(error);
          });
      });
    }
  }
});