import { defineStore } from 'pinia';
import { mockLocations, getLocationStats } from '@/mock/mockInventoryData';
import locationsApi from '~/http/requests/app/inventory/locations';
import type { Location, LocationState } from '@/types/inventory/location';

// Determine if we're in development environment
const config = useRuntimeConfig() 
const environment = config.public.nodeEnv
const isDev = environment === 'development';

export const useLocationsStore = defineStore('locations', {
  state: (): LocationState => ({
    locations: [],
    isLoading: false,
    error: null,
    useMockData: isDev, // Default to mock data in development
    locationStats: {} 
  }),
  
  getters: {
    getLocations: (state) => state.locations,
    getLocationById: (state) => (id: string) => state.locations.find(location => location.id === id),
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getLocationStats: (state) => state.locationStats,
    
    // Get locations by type
    getWarehouses: (state) => state.locations.filter(location => location.type === 'warehouse' && location.status === 'active'),
    getZones: (state) => state.locations.filter(location => location.type === 'zone' && location.status === 'active'),
    getAisles: (state) => state.locations.filter(location => location.type === 'aisle' && location.status === 'active'),
    getBins: (state) => state.locations.filter(location => location.type === 'bin' && location.status === 'active'),
    
    // Get child locations
    getChildLocations: (state) => (parentId: string) => 
      state.locations.filter(location => location.parentId === parentId && location.status === 'active'),
    
    // Get locations by warehouse
    getZonesByWarehouse: (state) => (warehouseId: string) =>
      state.locations.filter(location => location.parentId === warehouseId && location.type === 'zone' && location.status === 'active'),
    
    // Get locations by zone
    getAislesByZone: (state) => (zoneId: string) =>
      state.locations.filter(location => location.parentId === zoneId && location.type === 'aisle' && location.status === 'active'),
    
    // Get locations by aisle
    getBinsByAisle: (state) => (aisleId: string) =>
      state.locations.filter(location => location.parentId === aisleId && location.type === 'bin' && location.status === 'active'),
    
    // Get location tree hierarchical structure
    getLocationTree: (state) => {
      // Create a hierarchical structure of locations
      const rootLocations = state.locations.filter(location => !location.parentId && location.status === 'active');
      
      const buildTree = (parentLocations: Location[]) => {
        return parentLocations.map(parent => {
          const children = state.locations.filter(location => 
            location.parentId === parent.id && location.status === 'active');
          return {
            ...parent,
            children: children.length > 0 ? buildTree(children) : []
          };
        });
      };
      
      return buildTree(rootLocations);
    }
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    async fetchLocations(params = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          response = { 
            success: true, 
            locations: [...mockLocations],
            stats: getLocationStats()
          };
        } else {
          // Real API call
          response = await locationsApi.fetchLocations(params);
        }
        
        if (response.success) {
          this.locations = response.locations;
          this.locationStats = response.stats || {};
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch locations';
        throw error;
      }
    },
    
    async fetchLocationsByType(type: string, params = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));
          const filteredLocations = mockLocations.filter(location => location.type === type);
          response = { success: true, locations: filteredLocations };
        } else {
          // Add type to params
          const typeParams = { ...params, type };
          response = await locationsApi.fetchLocations(typeParams);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || `Failed to fetch ${type} locations`;
        throw error;
      }
    },
    
    async fetchWarehouseHierarchy(warehouseId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 400));
          
          // Get the warehouse
          const warehouse = mockLocations.find(loc => loc.id === warehouseId);
          
          if (!warehouse) {
            throw new Error(`Warehouse with ID ${warehouseId} not found`);
          }
          
          // Get all zones, aisles, and bins that belong to this warehouse
          const zones = mockLocations.filter(loc => loc.parentId === warehouseId && loc.type === 'zone');
          
          // Get all aisles for each zone
          const zoneWithAisles = zones.map(zone => {
            const aisles = mockLocations.filter(loc => loc.parentId === zone.id && loc.type === 'aisle');
            
            // Get bins for each aisle
            const aislesWithBins = aisles.map(aisle => {
              const bins = mockLocations.filter(loc => loc.parentId === aisle.id && loc.type === 'bin');
              return { ...aisle, children: bins };
            });
            
            return { ...zone, children: aislesWithBins };
          });
          
          // Construct the full hierarchy
          const warehouseHierarchy = {
            ...warehouse,
            children: zoneWithAisles
          };
          
          response = { success: true, hierarchy: warehouseHierarchy };
        } else {
          response = await locationsApi.fetchWarehouseHierarchy(warehouseId);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || `Failed to fetch warehouse hierarchy`;
        throw error;
      }
    },
    
    async fetchZones(warehouseId?: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          let zones;
          if (warehouseId) {
            // Get zones for specific warehouse
            zones = mockLocations.filter(
              loc => loc.type === 'zone' && loc.parentId === warehouseId
            );
          } else {
            // Get all zones
            zones = mockLocations.filter(loc => loc.type === 'zone');
          }
          
          response = { success: true, zones };
        } else {
          const params = warehouseId ? { parentId: warehouseId } : {};
          response = await locationsApi.fetchLocationsByType('zone', params);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch zones';
        throw error;
      }
    },
    
    async fetchAisles(zoneId?: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          let aisles;
          if (zoneId) {
            // Get aisles for specific zone
            aisles = mockLocations.filter(
              loc => loc.type === 'aisle' && loc.parentId === zoneId
            );
          } else {
            // Get all aisles
            aisles = mockLocations.filter(loc => loc.type === 'aisle');
          }
          
          response = { success: true, aisles };
        } else {
          const params = zoneId ? { parentId: zoneId } : {};
          response = await locationsApi.fetchLocationsByType('aisle', params);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch aisles';
        throw error;
      }
    },
    
    async fetchBins(aisleId?: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          let bins;
          if (aisleId) {
            // Get bins for specific aisle
            bins = mockLocations.filter(
              loc => loc.type === 'bin' && loc.parentId === aisleId
            );
          } else {
            // Get all bins
            bins = mockLocations.filter(loc => loc.type === 'bin');
          }
          
          response = { success: true, bins };
        } else {
          const params = aisleId ? { parentId: aisleId } : {};
          response = await locationsApi.fetchLocationsByType('bin', params);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch bins';
        throw error;
      }
    },

    // Rest of the existing methods remain the same...
    // ...
  }
});