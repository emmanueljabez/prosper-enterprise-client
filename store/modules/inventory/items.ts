import { defineStore } from 'pinia';
import { mockItems } from '@/mock/mockInventoryData';
import inventoryApi from '~/http/requests/app/inventory/items';
import type { InventoryItem, StockAdjustment, ItemLocation } from '@/types/inventory/items';
import type { InventoryState } from '@/types/inventory/items';


// Determine if we're in development environment
const config = useRuntimeConfig() 
const environment = config.public.nodeEnv
const isDev = environment === 'development';

export const useInventoryStore = defineStore('inventory', {
  state: (): InventoryState => ({
    items: [],
    isLoading: false,
    error: null,
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
    }
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
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
    }
  }
});