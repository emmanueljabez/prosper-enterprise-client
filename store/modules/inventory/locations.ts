import { defineStore } from 'pinia';
import locationsApi from '~/http/requests/app/inventory/locations';
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

export const useLocationsStore = defineStore('locations', {
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
    // Warehouse management getters
    getWarehouses: (state) => state.warehouses,
    getPaginatedWarehouses: (state) => state.paginatedWarehouses,
    getSelectedWarehouse: (state) => state.selectedWarehouse,
    getWarehouseHierarchy: (state) => state.warehouseHierarchy,
    getLocationTreeStructure: (state) => state.locationTreeStructure,
    getZones: (state) => state.zones,
    getAisles: (state) => state.aisles,
    getShelves: (state) => state.shelves,
    getWarehouseById: (state) => (id: number) => state.warehouses.find(warehouse => warehouse.id === id),
    getActiveWarehouses: (state) => state.warehouses.filter(warehouse => warehouse.isActive),
    getMainWarehouses: (state) => state.warehouses.filter(warehouse => warehouse.isMainWarehouse),
    getWarehouseByCode: (state) => (code: string) => state.warehouses.find(warehouse => warehouse.code === code),
    
    // Loading and error getters
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getLocationStats: (state) => state.locationStats
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    // ======== WAREHOUSE MANAGEMENT ========
    
    // Fetch operations
    fetchWarehouses(params?: WarehouseQueryParams) {
      this.isLoading = true;
      this.error = null;
      return new Promise((resolve, reject) => {
        locationsApi.fetchWarehousesPaginated(params)
          .then((response: ApiResponse<PaginatedResponse<Warehouse>>) => {
            this.paginatedWarehouses = response.data!;
            this.warehouses = response.data!.content;
            this.isLoading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching warehouses.';
            reject(error);
          });
      });
    },

    fetchAllWarehouses() {
      this.isLoading = true;
      this.error = null;
      return new Promise((resolve, reject) => {
        locationsApi.fetchAllWarehouses()
          .then((response: ApiResponse<Warehouse[]>) => {
            this.warehouses = response.data!;
            this.isLoading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching all warehouses.';
            reject(error);
          });
      });
    },

    fetchWarehouseById(id: number) {
      this.isLoading = true;
      this.error = null;
      return new Promise((resolve, reject) => {
        locationsApi.fetchWarehouseById(id)
          .then((response: ApiResponse<Warehouse>) => {
            this.selectedWarehouse = response.data!;
            
            const existingIndex = this.warehouses.findIndex(warehouse => warehouse.id === id);
            if (existingIndex !== -1) {
              this.warehouses[existingIndex] = response.data!;
            } else {
              this.warehouses.push(response.data!);
            }
            
            this.isLoading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching warehouse.';
            reject(error);
          });
      });
    },

    fetchWarehouseHierarchy(id: number) {
      this.isLoading = true;
      this.error = null;
      return new Promise((resolve, reject) => {
        locationsApi.fetchCompleteWarehouseHierarchy(id)
          .then((response: ApiResponse<WarehouseHierarchy>) => {
            this.warehouseHierarchy = response.data!;
            this.isLoading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching warehouse hierarchy.';
            reject(error);
          });
      });
    },

    fetchLocationTreeStructure(warehouseId: number) {
      this.isLoading = true;
      this.error = null;
      return new Promise((resolve, reject) => {
        locationsApi.fetchLocationTreeStructure(warehouseId)
          .then((response: ApiResponse<WarehouseLocationNode[]>) => {
            this.locationTreeStructure = response.data!;
            this.isLoading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching location tree structure.';
            reject(error);
          });
      });
    },

    // CRUD operations
    createMainWarehouse(warehouseData: CreateMainWarehouseRequest) {
      this.isLoading = true;
      this.error = null;
      return new Promise((resolve, reject) => {
        locationsApi.createMainWareHouse(warehouseData)
          .then((response: ApiResponse<Warehouse>) => {
            this.warehouses.push(response.data!);
            this.selectedWarehouse = response.data!;
            this.isLoading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while creating warehouse.';
            reject(error);
          });
      });
    },

    createZone(warehouseId: number, zoneData: CreateZoneRequest) {
      this.isLoading = true;
      this.error = null;
      return new Promise((resolve, reject) => {
        locationsApi.createZone(warehouseId, zoneData)
          .then((response: ApiResponse<Zone>) => {
            this.zones.push(response.data!);
            this.isLoading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while creating zone.';
            reject(error);
          });
      });
    },

    createAisle(warehouseId: number, aisleData: CreateAisleRequest) {
      this.isLoading = true;
      this.error = null;
      return new Promise((resolve, reject) => {
        console.log('Creating aisle with data:', aisleData);
        locationsApi.createAisle(warehouseId, aisleData)
          .then((response: ApiResponse<Aisle>) => {
            this.aisles.push(response.data!);
            this.isLoading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while creating aisle.';
            reject(error);
          });
      });
    },

    createShelf(warehouseId: number, shelfData: CreateShelfRequest) {
      this.isLoading = true;
      this.error = null;
      return new Promise((resolve, reject) => {
        locationsApi.createShelf(warehouseId, shelfData)
          .then((response: ApiResponse<Shelf>) => {
            this.shelves.push(response.data!);
            this.isLoading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while creating shelf.';
            reject(error);
          });
      });
    },

    updateWarehouse(id: number, warehouseData: UpdateWarehouseRequest) {
      this.isLoading = true;
      this.error = null;
      return new Promise((resolve, reject) => {
        locationsApi.updateWarehouse(id, warehouseData)
          .then((response: ApiResponse<Warehouse>) => {
            const index = this.warehouses.findIndex(warehouse => warehouse.id === id);
            if (index !== -1) {
              this.warehouses[index] = response.data!;
            }
            if (this.selectedWarehouse?.id === id) {
              this.selectedWarehouse = response.data!;
            }
            this.isLoading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while updating warehouse.';
            reject(error);
          });
      });
    },

    deactivateWarehouse(id: number, warehouseData: DeactivateWarehouseRequest) {
      this.isLoading = true;
      this.error = null;
      return new Promise((resolve, reject) => {
        locationsApi.deactivateWarehouse(id, warehouseData)
          .then((response: ApiResponse<Warehouse>) => {
            const index = this.warehouses.findIndex(warehouse => warehouse.id === id);
            if (index !== -1) {
              this.warehouses[index] = response.data!;
            }
            if (this.selectedWarehouse?.id === id) {
              this.selectedWarehouse = response.data!;
            }
            this.isLoading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while deactivating warehouse.';
            reject(error);
          });
      });
    },

    deleteWarehouse(id: number) {
      this.isLoading = true;
      this.error = null;
      return new Promise((resolve, reject) => {
        locationsApi.deleteWarehouse(id)
          .then(() => {
            this.warehouses = this.warehouses.filter(warehouse => warehouse.id !== id);
            if (this.selectedWarehouse?.id === id) {
              this.selectedWarehouse = null;
            }
            this.isLoading = false;
            resolve(null);
          })
          .catch((error) => {
            this.isLoading = false;
            this.error = error.response?.data?.message || 'An error occurred while deleting warehouse.';
            reject(error);
          });
      });
    },

    // Utility actions for warehouse management
    setSelectedWarehouse(warehouse: Warehouse | null) {
      this.selectedWarehouse = warehouse;
    },

    clearWarehouseHierarchy() {
      this.warehouseHierarchy = null;
    },

    clearLocationTreeStructure() {
      this.locationTreeStructure = [];
    }
  }
});