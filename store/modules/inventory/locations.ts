import { defineStore } from 'pinia';
import { mockLocations } from '@/mock/mockInventoryData';
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
    useMockData: isDev // Default to mock data in development
  }),
  
  getters: {
    getLocations: (state) => state.locations,
    getLocationById: (state) => (id: string) => state.locations.find(location => location.id === id),
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getActiveLocations: (state) => state.locations.filter(location => location.isActive),
    getParentLocations: (state) => state.locations.filter(location => !location.parentId),
    getChildLocations: (state) => (parentId: string) => 
      state.locations.filter(location => location.parentId === parentId),
    getLocationsByType: (state) => (type: string) => 
      state.locations.filter(location => location.type === type),
    getLocationTree: (state) => {
      // Create a hierarchical structure of locations
      const rootLocations = state.locations.filter(location => !location.parentId);
      
      const buildTree = (parentLocations: Location[]) => {
        return parentLocations.map(parent => {
          const children = state.locations.filter(location => location.parentId === parent.id);
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
          response = { success: true, locations: [...mockLocations] };
        } else {
          // Real API call
          response = await locationsApi.fetchLocations(params);
        }
        
        if (response.success) {
          this.locations = response.locations;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch locations';
        throw error;
      }
    },
    
    async fetchLocation(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const location = mockLocations.find(location => location.id === id);
          
          if (!location) {
            throw new Error(`Location with ID ${id} not found`);
          }
          
          response = { success: true, location };
        } else {
          response = await locationsApi.fetchLocation(id);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || `Failed to fetch location with ID ${id}`;
        throw error;
      }
    },
    
    async createLocation(newLocation: Partial<Location>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Generate new ID and add timestamps
          const createdLocation = {
            ...newLocation,
            id: `loc-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: newLocation.isActive ?? true
          } as Location;
          
          response = { success: true, location: createdLocation };
        } else {
          response = await locationsApi.createLocation(newLocation);
        }
        
        if (response.success && response.location) {
          this.locations.push(response.location);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to create location';
        throw error;
      }
    },
    
    async updateLocation(updatedLocation: Partial<Location> & { id: string }) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update the location in the array
          const index = this.locations.findIndex(location => location.id === updatedLocation.id);
          if (index === -1) throw new Error('Location not found');
          
          // Update timestamp
          const updatedLocationObj = {
            ...this.locations[index],
            ...updatedLocation,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, location: updatedLocationObj };
        } else {
          response = await locationsApi.updateLocation(updatedLocation.id, updatedLocation);
        }
        
        if (response.success && response.location) {
          const index = this.locations.findIndex(location => location.id === updatedLocation.id);
          if (index !== -1) {
            this.locations[index] = response.location;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update location';
        throw error;
      }
    },
    
    async deleteLocation(locationId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if location has children
          const hasChildren = this.locations.some(location => location.parentId === locationId);
          if (hasChildren) {
            throw new Error('Cannot delete location with child locations');
          }
          
          // Remove the location from the array
          const index = this.locations.findIndex(location => location.id === locationId);
          if (index === -1) throw new Error('Location not found');
          
          response = { success: true };
        } else {
          response = await locationsApi.deleteLocation(locationId);
        }
        
        if (response.success) {
          this.locations = this.locations.filter(location => location.id !== locationId);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to delete location';
        throw error;
      }
    },
    
    async bulkUpdateLocations(locationIds: string[], updates: any) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update each location
          const updatedLocations = this.locations.map(location => {
            if (locationIds.includes(location.id)) {
              const updatedLocation = { ...location };
              
              // Apply the updates
              Object.keys(updates).forEach(key => {
                if (key === 'isActive' && updates.isActive !== undefined) {
                  updatedLocation.isActive = updates.isActive;
                }
                if (key === 'type' && updates.type) {
                  updatedLocation.type = updates.type;
                }
                if (key === 'parentId' && updates.parentId !== undefined) {
                  updatedLocation.parentId = updates.parentId;
                }
                // Handle other properties
              });
              
              updatedLocation.updatedAt = new Date().toISOString();
              return updatedLocation;
            }
            return location;
          });
          
          response = { 
            success: true, 
            updatedCount: locationIds.length,
            updatedIds: locationIds
          };
          
          // Update the state
          this.locations = updatedLocations;
        } else {
          response = await locationsApi.bulkUpdateLocations(locationIds, updates);
          
          // If successful, refresh the locations list
          if (response.success) {
            await this.fetchLocations();
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to bulk update locations';
        throw error;
      }
    },
    
    async deactivateLocation(locationId: string) {
      return this.updateLocation({ id: locationId, isActive: false });
    },
    
    async activateLocation(locationId: string) {
      return this.updateLocation({ id: locationId, isActive: true });
    },
    
    async moveLocation(locationId: string, newParentId: string | null) {
      return this.updateLocation({ id: locationId, parentId: newParentId });
    },
    
    // Get location full path (e.g., "Warehouse A > Zone 1 > Shelf B")
    getLocationPath(locationId: string): string {
      const location = this.getLocationById(locationId);
      if (!location) return '';
      
      const path: string[] = [location.name];
      let currentParentId = location.parentId;
      
      // Prevent infinite loops by limiting depth
      let maxDepth = 10;
      
      while (currentParentId && maxDepth > 0) {
        const parent = this.getLocationById(currentParentId);
        if (!parent) break;
        
        path.unshift(parent.name);
        currentParentId = parent.parentId;
        maxDepth--;
      }
      
      return path.join(' > ');
    },
    
    // Check if a location is a child of another location
    isChildOf(childId: string, parentId: string): boolean {
      const child = this.getLocationById(childId);
      if (!child) return false;
      
      let currentParentId = child.parentId;
      
      // Prevent infinite loops
      let maxDepth = 10;
      
      while (currentParentId && maxDepth > 0) {
        if (currentParentId === parentId) return true;
        
        const parent = this.getLocationById(currentParentId);
        if (!parent) break;
        
        currentParentId = parent.parentId;
        maxDepth--;
      }
      
      return false;
    },
    
    // Get all descendants of a location (children, grandchildren, etc.)
    getAllDescendants(locationId: string): Location[] {
      const directChildren = this.getChildLocations(locationId);
      
      let allDescendants = [...directChildren];
      
      directChildren.forEach(child => {
        const childDescendants = this.getAllDescendants(child.id);
        allDescendants = [...allDescendants, ...childDescendants];
      });
      
      return allDescendants;
    },
    
    // Export locations to CSV or JSON
    async exportLocations(format: string = 'csv', filters = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // For mock data, we'll just simulate the API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Create a dummy blob for download
          const jsonData = JSON.stringify(this.locations.filter(location => {
            // Apply filters if needed
            return true;
          }));
          
          const blob = new Blob([jsonData], { type: 'application/json' });
          response = { success: true, data: blob };
        } else {
          response = await locationsApi.exportLocations(format, filters);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to export locations';
        throw error;
      }
    },
    
    // Import locations from CSV or JSON
    async importLocations(formData: FormData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful import
          response = { 
            success: true, 
            importedCount: 3, 
            message: '3 locations were successfully imported' 
          };
          
          // Refresh locations after import
          await this.fetchLocations();
        } else {
          response = await locationsApi.importLocations(formData);
          
          // Refresh locations after successful import
          if (response.success) {
            await this.fetchLocations();
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to import locations';
        throw error;
      }
    }
  }
});