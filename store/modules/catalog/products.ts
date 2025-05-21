import { defineStore } from 'pinia';
import productsApi from '@/http/requests/app/catalog/products';
import { mockProductsApi } from '@/mock/mockProducts';
import type { Product, ProductsState } from '@/types/catalog/products';

// Determine if we're in development environment
const isDev = process.env.NODE_ENV === 'development';

export const useProductsStore = defineStore('products', {
  state: (): ProductsState => ({
    products: [],
    loading: false,
    error: null,
    useMockData: isDev // Default to mock data in development
  }),

  getters: {
    getProducts: (state) => state.products,
    getIsLoading: (state) => state.loading,
    getError: (state) => state.error,
  },

  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },

    async fetchProducts() {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock product data");
          response = await mockProductsApi.fetchProducts();
        } else {
          // Use real API
          console.log("Using API product data");
          response = await productsApi.fetchProducts();
        }
        this.products = response.data.data.content;
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while fetching products.';
        throw error;
      }
    },

    async createProduct(product: Product) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockProductsApi.createProduct(product);
        } else {
          response = await productsApi.createProduct(product);
        }
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while creating product.';
        throw error;
      }
    },

    async updateProduct(product: Product) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockProductsApi.updateProduct(product.id, product);
        } else {
          response = await productsApi.updateProduct(product.id, product);
        }
        
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
          this.products[index] = response.data.data;
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating product.';
        throw error;
      }
    },

    async deleteProduct(productId: number) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockProductsApi.deleteProduct(productId);
        } else {
          response = await productsApi.deleteProduct(productId);
        }
        
        this.products = this.products.filter(product => product.id !== productId);
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while deleting product.';
        throw error;
      }
    },

    async updateProductStatus(productId: number, status: string, reason?: string) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockProductsApi.updateProductStatus(productId, status, reason);
        } else {
          response = await productsApi.updateProductStatus(productId, status, reason);
        }
        
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
          this.products[index].status = status;
          if (reason) {
            this.products[index].statusReason = reason;
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating product status.';
        throw error;
      }
    },

    async duplicateProduct(productId: number) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockProductsApi.duplicateProduct(productId);
        } else {
          response = await productsApi.duplicateProduct(productId);
        }
        
        // Add the new product to the store
        this.products.push(response.data.data);
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while duplicating product.';
        throw error;
      }
    },

    async updateProductVariants(productId: number, variants: any[]) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockProductsApi.updateProductVariants(productId, variants);
        } else {
          response = await productsApi.updateProductVariants(productId, variants);
        }
        
        // Update the product with the new variants
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
          this.products[index].variants = variants;
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating product variants.';
        throw error;
      }
    },

    async bulkUpdateProducts(productIds: number[], updates: any) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockProductsApi.bulkUpdateProducts(productIds, updates);
        } else {
          response = await productsApi.bulkUpdateProducts(productIds, updates);
        }
        
        // Update products in the store
        productIds.forEach(id => {
          const index = this.products.findIndex(p => p.id === id);
          if (index !== -1) {
            Object.keys(updates).forEach(key => {
              this.products[index][key] = updates[key];
            });
          }
        });
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred during bulk update.';
        throw error;
      }
    }
  }
});