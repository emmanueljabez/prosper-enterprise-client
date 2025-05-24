import { defineStore } from 'pinia';
import { mockItems, mockMappings, mockSyncConflicts } from '@/mock/mockInventoryData';
import inventoryApi from '~/http/requests/app/inventory/items';
import type { 
  InventoryItem, 
  StockAdjustment, 
  ItemLocation, 
  ItemProductMapping, 
  SyncConflict,
  ExtendedInventoryState 
} from '@/types/inventory/items';

// Determine if we're in development environment
const config = useRuntimeConfig() 
const environment = config.public.nodeEnv
const isDev = environment === 'development';

export const useInventoryStore = defineStore('inventory', {
  state: (): ExtendedInventoryState => ({
    items: [],
    mappings: [],
    syncConflicts: [],
    isLoading: false,
    mappingsLoading: false,
    error: null,
    mappingsError: null,
    useMockData: isDev // Default to mock data in development
  }),
  
  getters: {
    getItems: (state) => state.items,
    getItemById: (state) => (id: string) => state.items.find(item => item.id === id),
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getLowStockItems: (state) => state.items.filter(item => 
      item.stockAvailable <= item.reorderPoint && item.status !== 'discontinued'
    ),
    getOutOfStockItems: (state) => state.items.filter(item => 
      item.stockAvailable === 0 && item.status !== 'discontinued'
    ),
    getItemsByCategory: (state) => (categoryId: string) => 
      state.items.filter(item => item.categoryId === categoryId),
    getItemsByLocation: (state) => (locationId: string) => 
      state.items.filter(item => 
        item.locations.some(loc => loc.id === locationId)
      ),
    // Add more useful getters
    getActiveItems: (state) => state.items.filter(item => item.status === 'active'),
    getItemsByStatus: (state) => (status: string) => state.items.filter(item => item.status === status),
    getTotalStockValue: (state) => {
      return state.items.reduce((total, item) => total + (item.cost * item.stockOnHand), 0);
    },
    
    // Mapping getters
    getMappings: (state) => state.mappings,
    getMappingById: (state) => (id: string) => state.mappings.find(mapping => mapping.id === id),
    getMappingsByItemId: (state) => (itemId: string) => state.mappings.filter(mapping => mapping.itemId === itemId),
    getMappingsByProductId: (state) => (productId: string) => state.mappings.filter(mapping => mapping.productId === productId),
    getSyncedMappings: (state) => state.mappings.filter(mapping => mapping.syncStatus === 'synced'),
    getOutOfSyncMappings: (state) => state.mappings.filter(mapping => mapping.syncStatus === 'out_of_sync'),
    getErrorMappings: (state) => state.mappings.filter(mapping => mapping.syncStatus === 'error'),
    getSyncConflicts: (state) => state.syncConflicts
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    // Existing item actions
    async fetchItems(params = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          response = { success: true, items: [...mockItems] };
        } else {
          // Real API call
          response = await inventoryApi.fetchItems(params);
        }
        
        if (response.success) {
          this.items = response.items;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch inventory items';
        throw error;
      }
    },
    
    async fetchItem(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const item = mockItems.find(item => item.id === id);
          
          if (!item) {
            throw new Error(`Item with ID ${id} not found`);
          }
          
          response = { success: true, item };
        } else {
          response = await inventoryApi.fetchItem(id);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || `Failed to fetch item with ID ${id}`;
        throw error;
      }
    },
    
    async createItem(newItem: Partial<InventoryItem>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Generate new ID and add timestamps
          const createdItem = {
            ...newItem,
            id: `item-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as InventoryItem;
          
          response = { success: true, item: createdItem };
        } else {
          response = await inventoryApi.createItem(newItem);
        }
        
        if (response.success && response.item) {
          this.items.push(response.item);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to create inventory item';
        throw error;
      }
    },
    
    async updateItem(updatedItem: Partial<InventoryItem> & { id: string }) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update the item in the array
          const index = this.items.findIndex(item => item.id === updatedItem.id);
          if (index === -1) throw new Error('Item not found');
          
          // Update timestamp
          const updatedItemObj = {
            ...this.items[index],
            ...updatedItem,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, item: updatedItemObj };
        } else {
          response = await inventoryApi.updateItem(updatedItem.id, updatedItem);
        }
        
        if (response.success && response.item) {
          const index = this.items.findIndex(item => item.id === updatedItem.id);
          if (index !== -1) {
            this.items[index] = response.item;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update inventory item';
        throw error;
      }
    },
    
    async deleteItem(itemId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Remove the item from the array
          const index = this.items.findIndex(item => item.id === itemId);
          if (index === -1) throw new Error('Item not found');
          
          response = { success: true };
        } else {
          response = await inventoryApi.deleteItem(itemId);
        }
        
        if (response.success) {
          this.items = this.items.filter(item => item.id !== itemId);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to delete inventory item';
        throw error;
      }
    },
    
    async duplicateItem(itemId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the item to duplicate
          const originalItem = this.items.find(item => item.id === itemId);
          if (!originalItem) throw new Error('Item not found');
          
          // Create a copy with a new ID and updated timestamps
          const duplicatedItem = {
            ...JSON.parse(JSON.stringify(originalItem)),
            id: `item-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            name: `${originalItem.name} (Copy)`,
            sku: `${originalItem.sku}-COPY`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, item: duplicatedItem };
        } else {
          response = await inventoryApi.duplicateItem(itemId);
        }
        
        if (response.success && response.item) {
          this.items.push(response.item);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to duplicate inventory item';
        throw error;
      }
    },
    
    async updateItemStatus(itemId: string, status: string, reason: string = '') {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find and update the item
          const index = this.items.findIndex(item => item.id === itemId);
          if (index === -1) throw new Error('Item not found');
          
          const updatedItem = {
            ...this.items[index],
            status,
            statusReason: reason,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, item: updatedItem };
        } else {
          response = await inventoryApi.updateItemStatus(itemId, status, reason);
        }
        
        if (response.success && response.item) {
          const index = this.items.findIndex(item => item.id === itemId);
          if (index !== -1) {
            this.items[index] = response.item;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update item status';
        throw error;
      }
    },
    
    async adjustItemStock(adjustment: StockAdjustment) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { itemId, locationId, quantity, reason, notes } = adjustment;
          
          // Find the item
          const itemIndex = this.items.findIndex(item => item.id === itemId);
          if (itemIndex === -1) throw new Error('Item not found');
          
          // Deep clone the item to avoid mutation issues
          const updatedItem = JSON.parse(JSON.stringify(this.items[itemIndex]));
          
          // Update the location quantity
          let locationFound = false;
          updatedItem.locations = updatedItem.locations.map((loc: ItemLocation) => {
            if (loc.id === locationId) {
              locationFound = true;
              loc.quantity += quantity;
              return loc;
            }
            return loc;
          });
          
          // If location not found, add it
          if (!locationFound && quantity > 0) {
            updatedItem.locations.push({
              id: locationId,
              name: `Location ${locationId}`, // In a real app, get the location name
              quantity,
              bin: adjustment.bin || 'Unknown'
            });
          }
          
          // Update the overall stock numbers
          updatedItem.stockOnHand += quantity;
          updatedItem.stockAvailable += quantity;
          updatedItem.updatedAt = new Date().toISOString();
          
          // Update status if necessary
          if (updatedItem.stockAvailable <= 0) {
            updatedItem.status = 'out_of_stock';
          } else if (updatedItem.stockAvailable <= updatedItem.reorderPoint) {
            updatedItem.status = 'low_stock';
          } else if (updatedItem.status === 'out_of_stock' || updatedItem.status === 'low_stock') {
            updatedItem.status = 'active';
          }
          
          response = { success: true, item: updatedItem };
        } else {
          response = await inventoryApi.adjustItemStock(adjustment);
        }
        
        if (response.success && response.item) {
          const index = this.items.findIndex(item => item.id === adjustment.itemId);
          if (index !== -1) {
            this.items[index] = response.item;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to adjust item stock';
        throw error;
      }
    },
    
    async bulkUpdateItems(itemIds: string[], updates: any) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update each item
          const updatedItems = this.items.map(item => {
            if (itemIds.includes(item.id)) {
              const updatedItem = { ...item };
              
              // Apply the updates
              Object.keys(updates).forEach(key => {
                if (key === 'categoryId' && updates.categoryId) {
                  updatedItem.categoryId = updates.categoryId;
                }
                if (key === 'status' && updates.status) {
                  updatedItem.status = updates.status;
                  if (updates.statusReason) {
                    updatedItem.statusReason = updates.statusReason;
                  }
                }
                if (key === 'reorderPoint' && updates.reorderPoint !== undefined) {
                  updatedItem.reorderPoint = updates.reorderPoint;
                }
                if (key === 'reorderQuantity' && updates.reorderQuantity !== undefined) {
                  updatedItem.reorderQuantity = updates.reorderQuantity;
                }
                // Handle other properties
              });
              
              updatedItem.updatedAt = new Date().toISOString();
              return updatedItem;
            }
            return item;
          });
          
          response = { 
            success: true, 
            updatedCount: itemIds.length,
            updatedIds: itemIds
          };
          
          // Update the state
          this.items = updatedItems;
        } else {
          response = await inventoryApi.bulkUpdateItems(itemIds, updates);
          
          // If successful, refresh the items list
          if (response.success) {
            await this.fetchItems();
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to bulk update items';
        throw error;
      }
    },
    
    async exportItems(format: string = 'csv', filters = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // For mock data, we'll just simulate the API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Create a dummy blob for download
          const jsonData = JSON.stringify(this.items.filter(item => {
            // Apply filters if needed
            return true;
          }));
          
          const blob = new Blob([jsonData], { type: 'application/json' });
          response = { success: true, data: blob };
        } else {
          response = await inventoryApi.exportItems(format, filters);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to export items';
        throw error;
      }
    },
    
    async importItems(formData: FormData) {
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
            importedCount: 5, 
            message: '5 items were successfully imported' 
          };
          
          // Refresh items after import
          await this.fetchItems();
        } else {
          response = await inventoryApi.importItems(formData);
          
          // Refresh items after successful import
          if (response.success) {
            await this.fetchItems();
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to import items';
        throw error;
      }
    },
    
    // Helper methods
    isLowStock(item: InventoryItem): boolean {
      return item.stockAvailable <= item.reorderPoint && item.status !== 'discontinued';
    },
    
    isOutOfStock(item: InventoryItem): boolean {
      return item.stockAvailable === 0 && item.status !== 'discontinued';
    },
    
    calculateStockValue(item: InventoryItem): number {
      return item.cost * item.stockOnHand;
    },
    
    formatCost(cost: number, currencyCode: string = 'USD'): string {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(cost);
    },
    
    // New mapping actions
    async fetchMappings(params = {}) {
      this.mappingsLoading = true;
      this.mappingsError = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          response = { success: true, mappings: [...mockMappings] };
        } else {
          // Real API call would go here
          response = await inventoryApi.fetchMappings(params);
        }
        
        if (response.success) {
          this.mappings = response.mappings;
        }
        
        this.mappingsLoading = false;
        return response;
      } catch (error: any) {
        this.mappingsLoading = false;
        this.mappingsError = error.response?.data?.message || 'Failed to fetch item-product mappings';
        throw error;
      }
    },
    
    async createMapping(newMapping: Partial<ItemProductMapping>) {
      this.mappingsLoading = true;
      this.mappingsError = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find item and product details
          const item = this.items.find(i => i.id === newMapping.itemId);
          const product = { id: newMapping.productId }; // In a real implementation, fetch from products store
          
          if (!item) {
            throw new Error('Item not found');
          }
          
          // Generate new ID and timestamps
          const createdMapping = {
            ...newMapping,
            id: `map-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            itemName: item.name,
            itemSku: item.sku,
            itemDescription: item.description,
            productName: newMapping.productName || 'Product Name',
            productSku: newMapping.productSku || 'PROD-SKU',
            syncStatus: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as ItemProductMapping;
          
          response = { success: true, mapping: createdMapping };
        } else {
          // Real API call would go here
          response = await inventoryApi.createMapping(newMapping);
        }
        
        if (response.success && response.mapping) {
          this.mappings.push(response.mapping);
        }
        
        this.mappingsLoading = false;
        return response;
      } catch (error: any) {
        this.mappingsLoading = false;
        this.mappingsError = error.response?.data?.message || 'Failed to create mapping';
        throw error;
      }
    },
    
    async updateMapping(updatedMapping: Partial<ItemProductMapping> & { id: string }) {
      this.mappingsLoading = true;
      this.mappingsError = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the mapping in the array
          const index = this.mappings.findIndex(mapping => mapping.id === updatedMapping.id);
          if (index === -1) throw new Error('Mapping not found');
          
          // Update with new data
          const updatedMappingObj = {
            ...this.mappings[index],
            ...updatedMapping,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, mapping: updatedMappingObj };
        } else {
          // Real API call would go here
          response = await inventoryApi.updateMapping(updatedMapping.id, updatedMapping);
        }
        
        if (response.success && response.mapping) {
          const index = this.mappings.findIndex(mapping => mapping.id === updatedMapping.id);
          if (index !== -1) {
            this.mappings[index] = response.mapping;
          }
        }
        
        this.mappingsLoading = false;
        return response;
      } catch (error: any) {
        this.mappingsLoading = false;
        this.mappingsError = error.response?.data?.message || 'Failed to update mapping';
        throw error;
      }
    },
    
    async deleteMapping(mappingId: string) {
      this.mappingsLoading = true;
      this.mappingsError = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Remove the mapping from the array
          const index = this.mappings.findIndex(mapping => mapping.id === mappingId);
          if (index === -1) throw new Error('Mapping not found');
          
          response = { success: true };
        } else {
          // Real API call would go here
          response = await inventoryApi.deleteMapping(mappingId);
        }
        
        if (response.success) {
          this.mappings = this.mappings.filter(mapping => mapping.id !== mappingId);
        }
        
        this.mappingsLoading = false;
        return response;
      } catch (error: any) {
        this.mappingsLoading = false;
        this.mappingsError = error.response?.data?.message || 'Failed to delete mapping';
        throw error;
      }
    },
    
    async syncMapping(mappingId: string) {
      this.mappingsLoading = true;
      this.mappingsError = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the mapping
          const mappingIndex = this.mappings.findIndex(mapping => mapping.id === mappingId);
          if (mappingIndex === -1) throw new Error('Mapping not found');
          
          const mapping = this.mappings[mappingIndex];
          
          // For demonstration, sometimes return conflicts
          let conflicts = [];
          if (mapping.id === 'map-003' || mapping.id === 'map-004') {
            conflicts = mockSyncConflicts.filter(conflict => conflict.mappingId === mappingId);
            response = { 
              success: true, 
              conflicts,
              mapping: {
                ...mapping,
                syncStatus: 'error',
                lastSyncTime: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            };
          } else {
            response = { 
              success: true, 
              conflicts: [],
              mapping: {
                ...mapping,
                syncStatus: 'synced',
                lastSyncTime: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            };
          }
          
          // Update the mapping
          if (response.mapping) {
            this.mappings[mappingIndex] = response.mapping;
          }
          
          // Update conflicts
          if (conflicts.length > 0) {
            this.syncConflicts = [...this.syncConflicts.filter(c => c.mappingId !== mappingId), ...conflicts];
          }
          
        } else {
          // Real API call would go here
          response = await inventoryApi.syncMapping(mappingId);
          
          // Update the mapping if successful
          if (response.success && response.mapping) {
            const index = this.mappings.findIndex(mapping => mapping.id === mappingId);
            if (index !== -1) {
              this.mappings[index] = response.mapping;
            }
            
            // Update conflicts
            if (response.conflicts && response.conflicts.length > 0) {
              this.syncConflicts = [...this.syncConflicts.filter(c => c.mappingId !== mappingId), ...response.conflicts];
            }
          }
        }
        
        this.mappingsLoading = false;
        return response.conflicts || [];
      } catch (error: any) {
        this.mappingsLoading = false;
        this.mappingsError = error.response?.data?.message || 'Failed to sync mapping';
        throw error;
      }
    },
    
    async resolveSyncConflict(mappingId: string, resolution: any) {
      this.mappingsLoading = true;
      this.mappingsError = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the mapping
          const mappingIndex = this.mappings.findIndex(mapping => mapping.id === mappingId);
          if (mappingIndex === -1) throw new Error('Mapping not found');
          
          // Mark conflicts as resolved
          const updatedConflicts = this.syncConflicts
            .filter(conflict => conflict.mappingId === mappingId)
            .map(conflict => ({
              ...conflict,
              status: 'resolved'
            }));
          
          // Update mapping status
          const updatedMapping = {
            ...this.mappings[mappingIndex],
            syncStatus: 'synced',
            lastSyncTime: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          response = { 
            success: true, 
            mapping: updatedMapping,
            conflicts: updatedConflicts
          };
          
          // Update state
          this.mappings[mappingIndex] = updatedMapping;
          this.syncConflicts = [
            ...this.syncConflicts.filter(c => c.mappingId !== mappingId),
            ...updatedConflicts
          ];
          
        } else {
          // Real API call would go here
          response = await inventoryApi.resolveSyncConflict(mappingId, resolution);
          
          // Update the mapping and conflicts if successful
          if (response.success) {
            if (response.mapping) {
              const index = this.mappings.findIndex(mapping => mapping.id === mappingId);
              if (index !== -1) {
                this.mappings[index] = response.mapping;
              }
            }
            
            if (response.conflicts) {
              this.syncConflicts = [
                ...this.syncConflicts.filter(c => c.mappingId !== mappingId),
                ...response.conflicts
              ];
            }
          }
        }
        
        this.mappingsLoading = false;
        return response;
      } catch (error: any) {
        this.mappingsLoading = false;
        this.mappingsError = error.response?.data?.message || 'Failed to resolve sync conflict';
        throw error;
      }
    },
    
    async bulkUpdateMappings(mappingIds: string[], updates: any) {
      this.mappingsLoading = true;
      this.mappingsError = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update each mapping
          const updatedMappings = this.mappings.map(mapping => {
            if (mappingIds.includes(mapping.id)) {
              return {
                ...mapping,
                ...updates,
                updatedAt: new Date().toISOString()
              };
            }
            return mapping;
          });
          
          response = { 
            success: true, 
            updatedCount: mappingIds.length,
            updatedIds: mappingIds
          };
          
          // Update the state
          this.mappings = updatedMappings;
        } else {
          // Real API call would go here
          response = await inventoryApi.bulkUpdateMappings(mappingIds, updates);
          
          // If successful, refresh the mappings list
          if (response.success) {
            await this.fetchMappings();
          }
        }
        
        this.mappingsLoading = false;
        return response;
      } catch (error: any) {
        this.mappingsLoading = false;
        this.mappingsError = error.response?.data?.message || 'Failed to bulk update mappings';
        throw error;
      }
    },
    
    async exportMappings(format: string = 'csv', filters = {}) {
      this.mappingsLoading = true;
      this.mappingsError = null;
      
      try {
        let response;
        if (this.useMockData) {
          // For mock data, we'll just simulate the API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Create a dummy blob for download
          const jsonData = JSON.stringify(this.mappings.filter(mapping => {
            // Apply filters if needed
            return true;
          }));
          
          const blob = new Blob([jsonData], { type: 'application/json' });
          response = { success: true, data: blob };
        } else {
          // Real API call would go here
          response = await inventoryApi.exportMappings(format, filters);
        }
        
        this.mappingsLoading = false;
        return response;
      } catch (error: any) {
        this.mappingsLoading = false;
        this.mappingsError = error.response?.data?.message || 'Failed to export mappings';
        throw error;
      }
    }
  }
});