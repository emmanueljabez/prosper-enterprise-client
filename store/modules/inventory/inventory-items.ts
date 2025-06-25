import { defineStore } from 'pinia';
import type {
  InventoryItem,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  InventoryItemQueryParams,
  CreateStockAdjustmentRequest,
  StockAdjustment,
  InventoryItemSummary,
  LowStockItem,
  ReorderRequiredItem,
  ItemLocation,
  InventoryItemValidation,
  InventoryItemImport,
  PaginatedResponse,
  ApiResponse
} from '~/types/inventory/items';
import { inventoryItemsApi } from '~/http/requests/app/inventory/items';

interface InventoryItemsStoreState {
  items: InventoryItem[];
  paginatedItems: PaginatedResponse<InventoryItem> | null;
  selectedItem: InventoryItem | null;
  lowStockItems: LowStockItem[];
  reorderItems: ReorderRequiredItem[];
  itemSummary: InventoryItemSummary | null;
  searchResults: InventoryItem[];
  validationResult: InventoryItemValidation | null;
  loading: boolean;
  error: string | null;
  filters: InventoryItemQueryParams;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export const useInventoryItemsStore = defineStore('inventoryItems', {
  state: (): InventoryItemsStoreState => ({
    items: [],
    paginatedItems: null,
    selectedItem: null,
    lowStockItems: [],
    reorderItems: [],
    itemSummary: null,
    searchResults: [],
    validationResult: null,
    loading: false,
    error: null,
    filters: {},
    pagination: {
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0
    }
  }),

  getters: {
    getItems: (state) => state.items,
    getPaginatedItems: (state) => state.paginatedItems,
    getSelectedItem: (state) => state.selectedItem,
    getLowStockItems: (state) => state.lowStockItems,
    getReorderItems: (state) => state.reorderItems,
    getItemSummary: (state) => state.itemSummary,
    getSearchResults: (state) => state.searchResults,
    getValidationResult: (state) => state.validationResult,
    getIsLoading: (state) => state.loading,
    getError: (state) => state.error,
    getFilters: (state) => state.filters,
    getPagination: (state) => state.pagination,
    
    getActiveItems: (state) => {
      return state.items.filter(item => item.isActive);
    },
    getInactiveItems: (state) => {
      return state.items.filter(item => !item.isActive);
    },
    getItemsCount: (state) => state.items.length,
    getActiveItemsCount: (state) => {
      return state.items.filter(item => item.isActive).length;
    },
    getHasItems: (state) => {
      return state.items.length > 0;
    },
    getHasError: (state) => state.error !== null,
    
    getItemById: (state) => (id: number) => {
      return state.items.find(item => item.id === id);
    },
    getItemByCode: (state) => (itemCode: string) => {
      return state.items.find(item => item.itemCode === itemCode);
    },
    getItemsByCategory: (state) => (categoryId: number) => {
      return state.items.filter(item => item.categoryId === categoryId);
    },
    
    getValidationErrors: (state) => state.validationResult?.errors || [],
    getValidationWarnings: (state) => state.validationResult?.warnings || [],
    getIsValidConfiguration: (state) => state.validationResult?.isValid ?? true,
    
    getTotalInventoryValue: (state) => {
      return state.items.reduce((total, item) => {
        const cost = item.standardCost || item.averageCost || item.lastCost || 0;
        const quantity = item.stockOnHand || 0;
        return total + (cost * quantity);
      }, 0);
    },
    
    getOutOfStockItems: (state) => {
      return state.items.filter(item => (item.stockOnHand || 0) === 0 && item.isActive);
    },
    
    getCriticalStockItems: (state) => {
      return state.items.filter(item => {
        const stock = item.stockOnHand || 0;
        const reorderPoint = item.reorderPoint || 0;
        return stock <= reorderPoint && item.isActive;
      });
    }
  },

  actions: {
    // Fetch operations
    fetchItems(params?: InventoryItemQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.getItems(params)
          .then((response: ApiResponse<PaginatedResponse<InventoryItem>>) => {
            this.paginatedItems = response.data!;
            this.items = response.data!.content;
            this.pagination = {
              page: response.data!.number,
              size: response.data!.size,
              totalElements: response.data!.totalElements,
              totalPages: response.data!.totalPages
            };
            console.log('Fetched items:', this.paginatedItems);
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching items.';
            reject(error);
          });
      });
    },

    fetchAllItems() {
      // Use getItems without pagination parameters to get all items
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.getItems({ page: 0, size: 10000 }) // Large size to get all items
          .then((response: ApiResponse<PaginatedResponse<InventoryItem>>) => {
            this.items = response.data!.content;
            this.loading = false;
            resolve(response.data!.content);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching all items.';
            reject(error);
          });
      });
    },

    fetchItemById(id: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.getItemById(id)
          .then((response: ApiResponse<InventoryItem>) => {
            this.selectedItem = response.data!;
            
            const existingIndex = this.items.findIndex(item => item.id === id);
            if (existingIndex !== -1) {
              this.items[existingIndex] = response.data!;
            } else {
              this.items.push(response.data!);
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching item.';
            reject(error);
          });
      });
    },

    fetchItemByCode(itemCode: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.getItemByCode(itemCode)
          .then((response: ApiResponse<InventoryItem>) => {
            this.selectedItem = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching item by code.';
            reject(error);
          });
      });
    },

    fetchItemByBarcode(barcode: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.getItemByBarcode(barcode)
          .then((response: ApiResponse<InventoryItem>) => {
            this.selectedItem = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching item by barcode.';
            reject(error);
          });
      });
    },

    searchItems(params: InventoryItemQueryParams & { searchTerm: string }) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.searchItems(params)
          .then((response: ApiResponse<PaginatedResponse<InventoryItem>>) => {
            this.searchResults = response.data!.content || [];
            this.paginatedItems = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while searching items.';
            reject(error);
          });
      });
    },

    fetchItemsByCategory(categoryId: number, params?: InventoryItemQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.getItemsByCategory(categoryId, params)
          .then((response: ApiResponse<PaginatedResponse<InventoryItem>>) => {
            this.paginatedItems = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching items by category.';
            reject(error);
          });
      });
    },

    fetchLowStockItems(params?: InventoryItemQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.getLowStockItems(params)
          .then((response: ApiResponse<PaginatedResponse<LowStockItem>>) => {
            this.lowStockItems = response.data!.content || [];
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching low stock items.';
            reject(error);
          });
      });
    },

    fetchReorderRequiredItems(params?: InventoryItemQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.getReorderRequiredItems(params)
          .then((response: ApiResponse<PaginatedResponse<ReorderRequiredItem>>) => {
            this.reorderItems = response.data!.content || [];
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching reorder required items.';
            reject(error);
          });
      });
    },

    // CRUD operations
    createItem(itemData: CreateInventoryItemRequest) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.createItem(itemData)
          .then((response: ApiResponse<InventoryItem>) => {
            const newItem = response.data!;
            this.items.push(newItem);
            
            // Update paginated items if they exist
            if (this.paginatedItems) {
              this.paginatedItems.content.push(newItem);
              this.paginatedItems.totalElements++;
            }
            
            this.loading = false;
            resolve(newItem);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while creating item.';
            reject(error);
          });
      });
    },

    updateItem(id: number, itemData: UpdateInventoryItemRequest) {
      this.loading = true;
      console.log('Updating item with ID:', id, 'Data:', itemData);
      return new Promise((resolve, reject) => {
        inventoryItemsApi.updateItem(id, itemData)
          .then((response: ApiResponse<InventoryItem>) => {
            const index = this.items.findIndex(item => item.id === id);
            if (index !== -1) {
              this.items[index] = response.data!;
            }
            if (this.selectedItem?.id === id) {
              this.selectedItem = response.data!;
            }
            
            // Update in paginated items
            if (this.paginatedItems) {
              const paginatedIndex = this.paginatedItems.content.findIndex(item => item.id === id);
              if (paginatedIndex !== -1) {
                this.paginatedItems.content[paginatedIndex] = response.data!;
              }
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while updating item.';
            reject(error);
          });
      });
    },

    deleteItem(id: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.deleteItem(id)
          .then(() => {
            this.items = this.items.filter(item => item.id !== id);
            if (this.selectedItem?.id === id) {
              this.selectedItem = null;
            }
            
            // Remove from paginated items
            if (this.paginatedItems) {
              this.paginatedItems.content = this.paginatedItems.content.filter(item => item.id !== id);
              this.paginatedItems.totalElements--;
            }
            
            this.loading = false;
            resolve(true);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while deleting item.';
            reject(error);
          });
      });
    },

    bulkUpdateItems(itemIds: number[], updates: Partial<InventoryItem>) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.bulkUpdateItems(itemIds, updates)
          .then((response: ApiResponse<InventoryItem[]>) => {
            // Update items in the state
            response.data!.forEach(updatedItem => {
              const index = this.items.findIndex(item => item.id === updatedItem.id);
              if (index !== -1) {
                this.items[index] = updatedItem;
              }
            });
            
            // Update paginated items if they exist
            if (this.paginatedItems) {
              response.data!.forEach(updatedItem => {
                const paginatedIndex = this.paginatedItems!.content.findIndex(item => item.id === updatedItem.id);
                if (paginatedIndex !== -1) {
                  this.paginatedItems!.content[paginatedIndex] = updatedItem;
                }
              });
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while bulk updating items.';
            reject(error);
          });
      });
    },

    bulkDeleteItems(itemIds: number[]) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.bulkDeleteItems(itemIds)
          .then(() => {
            this.items = this.items.filter(item => !itemIds.includes(item.id!));
            if (this.selectedItem && itemIds.includes(this.selectedItem.id!)) {
              this.selectedItem = null;
            }
            
            // Remove from paginated items
            if (this.paginatedItems) {
              this.paginatedItems.content = this.paginatedItems.content.filter(item => !itemIds.includes(item.id!));
              this.paginatedItems.totalElements -= itemIds.length;
            }
            
            this.loading = false;
            resolve(true);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while bulk deleting items.';
            reject(error);
          });
      });
    },

    // Stock management
    adjustStock(adjustment: CreateStockAdjustmentRequest) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.createStockAdjustment(adjustment)
          .then((response: ApiResponse<StockAdjustment>) => {
            // After adjustment, fetch the updated item
            this.fetchItemById(adjustment.itemId);
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error: any) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while adjusting stock.';
            reject(error);
          });
      });
    },

    // Item lifecycle operations
    activateItem(id: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.activateItem(id)
          .then((response: ApiResponse<InventoryItem>) => {
            const index = this.items.findIndex(item => item.id === id);
            if (index !== -1) {
              this.items[index] = response.data!;
            }
            if (this.selectedItem?.id === id) {
              this.selectedItem = response.data!;
            }
            
            // Update in paginated items
            if (this.paginatedItems) {
              const paginatedIndex = this.paginatedItems.content.findIndex(item => item.id === id);
              if (paginatedIndex !== -1) {
                this.paginatedItems.content[paginatedIndex] = response.data!;
              }
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while activating item.';
            reject(error);
          });
      });
    },

    deactivateItem(id: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.deactivateItem(id)
          .then((response: ApiResponse<InventoryItem>) => {
            const index = this.items.findIndex(item => item.id === id);
            if (index !== -1) {
              this.items[index] = response.data!;
            }
            if (this.selectedItem?.id === id) {
              this.selectedItem = response.data!;
            }
            
            // Update in paginated items
            if (this.paginatedItems) {
              const paginatedIndex = this.paginatedItems.content.findIndex(item => item.id === id);
              if (paginatedIndex !== -1) {
                this.paginatedItems.content[paginatedIndex] = response.data!;
              }
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while deactivating item.';
            reject(error);
          });
      });
    },

    duplicateItem(id: number, newItemCode: string) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.duplicateItem(id, newItemCode)
          .then((response: ApiResponse<InventoryItem>) => {
            this.items.push(response.data!);
            
            // Update paginated items if they exist
            if (this.paginatedItems) {
              this.paginatedItems.content.push(response.data!);
              this.paginatedItems.totalElements++;
            }
            
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while duplicating item.';
            reject(error);
          });
      });
    },

    // Summary and analytics
    fetchItemSummary() {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.getInventorySummary()
          .then((response: ApiResponse<InventoryItemSummary>) => {
            this.itemSummary = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error: any) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching item summary.';
            reject(error);
          });
      });
    },

    // Import/Export operations
    importItems(importData: InventoryItemImport) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.importItems(importData)
          .then((response: ApiResponse<InventoryItem[]>) => {
            // Refresh items after import
            this.fetchAllItems();
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while importing items.';
            reject(error);
          });
      });
    },

    exportItems(options?: InventoryItemQueryParams & { format?: 'CSV' | 'EXCEL' | 'JSON' }) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.exportItems(options)
          .then((response: Blob) => {
            this.loading = false;
            resolve(response);
          })
          .catch((error: any) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while exporting items.';
            reject(error);
          });
      });
    },

    // Validation operations
    validateItem(itemData: CreateInventoryItemRequest) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.validateItem(itemData)
          .then((response: ApiResponse<InventoryItemValidation>) => {
            this.validationResult = response.data!;
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while validating item.';
            reject(error);
          });
      });
    },

    checkCodeAvailability(itemCode: string, excludeId?: number) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        inventoryItemsApi.checkCodeAvailability(itemCode, excludeId)
          .then((response: ApiResponse<{ available: boolean }>) => {
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while checking code availability.';
            reject(error);
          });
      });
    },

    fetchStatistics() {
      return this.fetchItemSummary();
    },

    // Utility actions
    setFilters(filters: InventoryItemQueryParams) {
      this.filters = { ...this.filters, ...filters };
    },

    clearFilters() {
      this.filters = {};
    },

    setSelectedItem(item: InventoryItem | null) {
      this.selectedItem = item;
    },

    refreshAllData() {
      return Promise.all([
        this.fetchItems(),
        this.fetchAllItems(),
        this.fetchItemSummary(),
        this.fetchLowStockItems(),
        this.fetchReorderRequiredItems()
      ]);
    },

    clearValidation() {
      this.validationResult = null;
    },

    clearError() {
      this.error = null;
    },

    clearSearchResults() {
      this.searchResults = [];
    },

    resetStore() {
      this.items = [];
      this.paginatedItems = null;
      this.selectedItem = null;
      this.lowStockItems = [];
      this.reorderItems = [];
      this.itemSummary = null;
      this.searchResults = [];
      this.validationResult = null;
      this.error = null;
      this.loading = false;
      this.filters = {};
      this.pagination = {
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
      };
    },

    // Initialize store
    initialize() {
      return this.refreshAllData().catch((error) => {
        console.error('Failed to initialize inventory items store:', error);
        this.error = 'Failed to initialize store';
      });
    }
  },
});
