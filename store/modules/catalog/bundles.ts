import { defineStore } from 'pinia';
import bundlesApi from '@/http/requests/app/catalog/bundles';
import { bundlesData, bundleUtils } from '@/mock/mockBundlesData';
import type { Bundle, BundlesState, BundleItem, BundleInventory } from '@/types/catalog/bundles';
import { useProductsStore } from './products';

// Determine if we're in development environment
const isDev = process.env.NODE_ENV === 'development';

// Mock API implementation
const mockBundlesApi = {
  fetchBundles: async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return { 
      data: { 
        data: { 
          content: bundlesData 
        } 
      } 
    };
  },
  
  getBundleById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const bundle = bundlesData.find(b => b.id === id);
    if (!bundle) {
      throw new Error('Bundle not found');
    }
    return { data: { data: bundle } };
  },
  
  createBundle: async (bundle: Bundle) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newBundle = {
      ...bundle,
      id: `bundle-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return { data: { data: newBundle } };
  },
  
  updateBundle: async (id: string, bundle: Bundle) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const updatedBundle = {
      ...bundle,
      id,
      updatedAt: new Date().toISOString()
    };
    return { data: { data: updatedBundle } };
  },
  
  deleteBundle: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { data: { success: true } };
  },
  
  updateBundleStatus: async (id: string, status: string, reason?: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { 
      data: { 
        data: { 
          id, 
          status, 
          statusReason: reason,
          updatedAt: new Date().toISOString()
        } 
      } 
    };
  },
  
  duplicateBundle: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const bundle = bundlesData.find(b => b.id === id);
    if (!bundle) {
      throw new Error('Bundle not found');
    }
    
    const newBundle = {
      ...JSON.parse(JSON.stringify(bundle)),
      id: `bundle-${Date.now()}`,
      name: `${bundle.name} (Copy)`,
      sku: `${bundle.sku}-COPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return { data: { data: newBundle } };
  },
  
  updateBundleItems: async (id: string, items: BundleItem[]) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      data: { 
        data: { 
          id, 
          bundleItems: items,
          updatedAt: new Date().toISOString()
        } 
      } 
    };
  },
  
  bulkUpdateBundles: async (ids: string[], updates: any) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return { 
      data: { 
        success: true,
        updatedBundles: ids
      } 
    };
  }
};

export const useBundlesStore = defineStore('bundles', {
  state: (): BundlesState => ({
    bundles: [],
    bundleInventory: {},
    loading: false,
    error: null,
    useMockData: isDev // Default to mock data in development
  }),

  getters: {
    getBundles: (state) => state.bundles,
    getIsLoading: (state) => state.loading,
    getError: (state) => state.error,
    
    getBundleById: (state) => (id: string) => {
      return state.bundles.find(bundle => bundle.id === id);
    },
    
    getAvailableBundles: (state) => {
      return state.bundles.filter(bundle => {
        const inventory = state.bundleInventory[bundle.id];
        return inventory && inventory.isAvailable;
      });
    },
    
    getLowStockBundles: (state) => {
      return state.bundles.filter(bundle => {
        const inventory = state.bundleInventory[bundle.id];
        return inventory && inventory.isLowStock;
      });
    },
    
    getBundleInventory: (state) => (id: string) => {
      return state.bundleInventory[id] || null;
    }
  },

  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },

    async fetchBundles() {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock bundle data");
          response = await mockBundlesApi.fetchBundles();
        } else {
          // Use real API
          console.log("Using API bundle data");
          response = await bundlesApi.fetchBundles();
        }
        this.bundles = response.data.data.content;
        
        // Calculate inventory for all bundles
        await this.updateAllBundleInventory();
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while fetching bundles.';
        throw error;
      }
    },
    
    async updateAllBundleInventory() {
      // Only run if using mock data, otherwise this would be handled by the backend
      if (!this.useMockData) return;
      
      const productsStore = useProductsStore();
      const products = productsStore.getProducts;
      
      // Calculate inventory for each bundle
      this.bundles.forEach(bundle => {
        if (bundle.inventory?.dynamicStock) {
          const inventory = bundleUtils.calculateBundleAvailability(bundle, products);
          if (inventory) {
            this.bundleInventory[bundle.id] = inventory;
          }
        }
      });
    },

    async createBundle(bundle: Bundle) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockBundlesApi.createBundle(bundle);
        } else {
          response = await bundlesApi.createBundle(bundle);
        }
        
        // Add the new bundle to the store
        const newBundle = response.data.data;
        this.bundles.push(newBundle);
        
        // Calculate inventory for the new bundle
        if (this.useMockData && newBundle.inventory?.dynamicStock) {
          const productsStore = useProductsStore();
          const products = productsStore.getProducts;
          const inventory = bundleUtils.calculateBundleAvailability(newBundle, products);
          if (inventory) {
            this.bundleInventory[newBundle.id] = inventory;
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while creating bundle.';
        throw error;
      }
    },

    async updateBundle(bundle: Bundle) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockBundlesApi.updateBundle(bundle.id, bundle);
        } else {
          response = await bundlesApi.updateBundle(bundle.id, bundle);
        }
        
        const index = this.bundles.findIndex(b => b.id === bundle.id);
        if (index !== -1) {
          this.bundles[index] = response.data.data;
          
          // Update inventory calculation
          if (this.useMockData && bundle.inventory?.dynamicStock) {
            const productsStore = useProductsStore();
            const products = productsStore.getProducts;
            const inventory = bundleUtils.calculateBundleAvailability(bundle, products);
            if (inventory) {
              this.bundleInventory[bundle.id] = inventory;
            }
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating bundle.';
        throw error;
      }
    },

    async deleteBundle(bundleId: string) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockBundlesApi.deleteBundle(bundleId);
        } else {
          response = await bundlesApi.deleteBundle(bundleId);
        }
        
        this.bundles = this.bundles.filter(bundle => bundle.id !== bundleId);
        
        // Remove inventory data
        if (this.bundleInventory[bundleId]) {
          delete this.bundleInventory[bundleId];
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while deleting bundle.';
        throw error;
      }
    },

    async updateBundleStatus(bundleId: string, status: string, reason?: string) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockBundlesApi.updateBundleStatus(bundleId, status, reason);
        } else {
          response = await bundlesApi.updateBundleStatus(bundleId, status, reason);
        }
        
        const index = this.bundles.findIndex(b => b.id === bundleId);
        if (index !== -1) {
          this.bundles[index].status = status;
          if (reason) {
            this.bundles[index].statusReason = reason;
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating bundle status.';
        throw error;
      }
    },

    async duplicateBundle(bundleId: string) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockBundlesApi.duplicateBundle(bundleId);
        } else {
          response = await bundlesApi.duplicateBundle(bundleId);
        }
        
        // Add the new bundle to the store
        const newBundle = response.data.data;
        this.bundles.push(newBundle);
        
        // Calculate inventory for the new bundle
        if (this.useMockData && newBundle.inventory?.dynamicStock) {
          const productsStore = useProductsStore();
          const products = productsStore.getProducts;
          const inventory = bundleUtils.calculateBundleAvailability(newBundle, products);
          if (inventory) {
            this.bundleInventory[newBundle.id] = inventory;
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while duplicating bundle.';
        throw error;
      }
    },

    async updateBundleItems(bundleId: string, items: BundleItem[]) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockBundlesApi.updateBundleItems(bundleId, items);
        } else {
          response = await bundlesApi.updateBundleItems(bundleId, items);
        }
        
        // Update the bundle with the new items
        const index = this.bundles.findIndex(b => b.id === bundleId);
        if (index !== -1) {
          this.bundles[index].bundleItems = items;
          
          // Recalculate inventory
          if (this.useMockData && this.bundles[index].inventory?.dynamicStock) {
            const productsStore = useProductsStore();
            const products = productsStore.getProducts;
            const inventory = bundleUtils.calculateBundleAvailability(this.bundles[index], products);
            if (inventory) {
              this.bundleInventory[bundleId] = inventory;
            }
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating bundle items.';
        throw error;
      }
    },

    async bulkUpdateBundles(bundleIds: string[], updates: any) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockBundlesApi.bulkUpdateBundles(bundleIds, updates);
        } else {
          response = await bundlesApi.bulkUpdateBundles(bundleIds, updates);
        }
        
        // Update bundles in the store
        bundleIds.forEach(id => {
          const index = this.bundles.findIndex(b => b.id === id);
          if (index !== -1) {
            Object.keys(updates).forEach(key => {
              this.bundles[index][key] = updates[key];
            });
          }
        });
        
        // Recalculate inventory if needed
        if (this.useMockData && updates.inventory?.dynamicStock !== undefined) {
          await this.updateAllBundleInventory();
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred during bulk update.';
        throw error;
      }
    },

    // Calculate price with selected options
    calculateBundlePriceWithOptions(bundleId: string, selectedOptions: Record<string, number>) {
      const bundle = this.bundles.find(b => b.id === bundleId);
      if (!bundle) return null;
      
      return bundleUtils.calculateBundlePriceWithOptions(bundle, selectedOptions);
    },
    
    // Get detailed bundle components with product information
    getBundleComponents(bundleId: string) {
      const bundle = this.bundles.find(b => b.id === bundleId);
      if (!bundle) return [];
      
      const productsStore = useProductsStore();
      const products = productsStore.getProducts;
      
      return bundleUtils.getBundleComponents(bundle, products);
    }
  }
});