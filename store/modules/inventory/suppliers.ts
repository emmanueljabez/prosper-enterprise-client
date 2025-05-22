import { defineStore } from 'pinia';
import suppliersApi from '@/http/requests/app/inventory/suppliers';
import { mockSuppliers } from '@/mock/mockSuppliersData';
import type { Supplier, SupplierState, SupplierFilters } from '@/types/inventory/suppliers';

// Determine if we're in development environment
const isDev = process.env.NODE_ENV === 'development';

export const useSuppliersStore = defineStore('suppliers', {
  state: (): SupplierState => ({
    suppliers: [],
    isLoading: false,
    error: null,
    useMockData: isDev // Default to mock data in development
  }),
  
  getters: {
    getSuppliers: (state) => state.suppliers || [],
    getSupplierById: (state) => (id: string) => 
      (state.suppliers || []).find(supplier => supplier.id === id),
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    
    // Status-based getters
    getActiveSuppliers: (state) => 
      (state.suppliers || []).filter(supplier => supplier.status === 'active'),
    getInactiveSuppliers: (state) => 
      (state.suppliers || []).filter(supplier => supplier.status === 'inactive'),
    
    // Category-based getters
    getSuppliersByCategory: (state) => (category: string) => 
      (state.suppliers || []).filter(supplier => 
        supplier.categories.includes(category) || supplier.primaryCategory === category
      ),
    
    // Rating-based getters
    getPreferredSuppliers: (state) => 
      (state.suppliers || []).filter(supplier => supplier.rating >= 4 && supplier.status === 'active'),
    
    // Lead time getters
    getQuickLeadTimeSuppliers: (state) => 
      (state.suppliers || []).filter(supplier => supplier.leadTime <= 5 && supplier.status === 'active')
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    async fetchSuppliers(filters: SupplierFilters = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        
        if (this.useMockData) {
          // Initialize suppliers with mock data
          this.suppliers = [...mockSuppliers]; // Make sure to clone the array
          response = { success: true, suppliers: this.suppliers };
        } else {
          response = await suppliersApi.fetchSuppliers(filters);
          response = { 
            success: true, 
            suppliers: response.data.data.content 
          };
        }
        
        if (response.success) {
          this.suppliers = response.suppliers;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.message || 'Failed to fetch suppliers';
        this.suppliers = []; // Initialize to empty array on error
        throw error;
      }
    },
    
    async fetchSupplier(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const supplier = mockSuppliers.find(supplier => supplier.id === id);
          
          if (!supplier) {
            throw new Error(`Supplier with ID ${id} not found`);
          }
          
          response = { success: true, supplier };
        } else {
          const apiResponse = await suppliersApi.fetchSupplier(id);
          response = { 
            success: true, 
            supplier: apiResponse.data.data 
          };
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || `Failed to fetch supplier with ID ${id}`;
        throw error;
      }
    },
    
    async createSupplier(supplier: Partial<Supplier>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Generate new ID and add timestamps
          const id = `sup-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`;
          const now = new Date().toISOString();
          
          const newSupplier: Supplier = {
            ...supplier as any,
            id,
            code: supplier.code || id.toUpperCase(),
            status: supplier.status || 'active',
            createdAt: now,
            updatedAt: now
          };
          
          // Add to mock data
          mockSuppliers.unshift(newSupplier);
          
          response = { success: true, supplier: newSupplier };
        } else {
          const apiResponse = await suppliersApi.createSupplier(supplier);
          response = { 
            success: true, 
            supplier: apiResponse.data.data 
          };
        }
        
        // Update store state
        this.suppliers = [response.supplier, ...this.suppliers];
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to create supplier';
        throw error;
      }
    },
    
    async updateSupplier(id: string, supplierData: Partial<Supplier>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          // Find and update the supplier
          const index = mockSuppliers.findIndex(s => s.id === id);
          if (index === -1) throw new Error('Supplier not found');
          
          const updatedSupplier = {
            ...mockSuppliers[index],
            ...supplierData,
            updatedAt: new Date().toISOString()
          };
          
          mockSuppliers[index] = updatedSupplier;
          
          response = { success: true, supplier: updatedSupplier };
        } else {
          const apiResponse = await suppliersApi.updateSupplier(id, supplierData);
          response = { 
            success: true, 
            supplier: apiResponse.data.data 
          };
        }
        
        // Update the supplier in state
        const index = this.suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
          this.suppliers[index] = response.supplier;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update supplier';
        throw error;
      }
    },
    
    async deleteSupplier(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          // Find and update the supplier (mark as inactive instead of deleting)
          const index = mockSuppliers.findIndex(s => s.id === id);
          if (index === -1) throw new Error('Supplier not found');
          
          mockSuppliers[index] = {
            ...mockSuppliers[index],
            status: 'inactive',
            updatedAt: new Date().toISOString()
          };
        } else {
          await suppliersApi.deleteSupplier(id);
        }
        
        // Update the supplier in state or remove it
        const index = this.suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
          // Option 1: Remove from array
          this.suppliers.splice(index, 1);
          
          // Option 2: Mark as inactive
          // this.suppliers[index] = {
          //   ...this.suppliers[index],
          //   status: 'inactive',
          //   updatedAt: new Date().toISOString()
          // };
        }
        
        this.isLoading = false;
        return { success: true };
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to delete supplier';
        throw error;
      }
    },
    
    async changeSupplierStatus(id: string, status: 'active' | 'inactive') {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 400));
          
          // Find and update the supplier
          const index = mockSuppliers.findIndex(s => s.id === id);
          if (index === -1) throw new Error('Supplier not found');
          
          mockSuppliers[index] = {
            ...mockSuppliers[index],
            status,
            updatedAt: new Date().toISOString()
          };
          
          response = { 
            success: true, 
            supplier: mockSuppliers[index] 
          };
        } else {
          const apiResponse = await suppliersApi.updateSupplierStatus(id, status);
          response = { 
            success: true, 
            supplier: apiResponse.data.data 
          };
        }
        
        // Update the supplier in state
        const index = this.suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
          this.suppliers[index] = response.supplier;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update supplier status';
        throw error;
      }
    },
    
    async updateSupplierRating(id: string, rating: number) {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Find and update the supplier
          const index = mockSuppliers.findIndex(s => s.id === id);
          if (index === -1) throw new Error('Supplier not found');
          
          mockSuppliers[index] = {
            ...mockSuppliers[index],
            rating,
            updatedAt: new Date().toISOString()
          };
          
          response = { 
            success: true, 
            supplier: mockSuppliers[index] 
          };
        } else {
          const apiResponse = await suppliersApi.updateSupplierRating(id, rating);
          response = { 
            success: true, 
            supplier: apiResponse.data.data 
          };
        }
        
        // Update the supplier in state
        const index = this.suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
          this.suppliers[index] = response.supplier;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update supplier rating';
        throw error;
      }
    },
    
    // Fetch suppliers in a specific category
    async fetchSuppliersByCategory(category: string, filters: SupplierFilters = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 400));
          
          // Filter by category
          const filteredSuppliers = mockSuppliers.filter(
            s => s.categories.includes(category) || s.primaryCategory === category
          );
          
          response = { success: true, suppliers: filteredSuppliers };
        } else {
          const apiResponse = await suppliersApi.fetchSuppliersByCategory(category, filters);
          response = { 
            success: true, 
            suppliers: apiResponse.data.data.content 
          };
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || `Failed to fetch suppliers in category ${category}`;
        throw error;
      }
    },
    
    // Fetch preferred suppliers (rating >= 4, active status)
    async fetchPreferredSuppliers(filters: SupplierFilters = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 400));
          
          // Filter preferred suppliers
          const preferredSuppliers = mockSuppliers.filter(
            s => s.rating >= 4 && s.status === 'active'
          );
          
          response = { success: true, suppliers: preferredSuppliers };
        } else {
          const apiResponse = await suppliersApi.fetchPreferredSuppliers(filters);
          response = { 
            success: true, 
            suppliers: apiResponse.data.data.content 
          };
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch preferred suppliers';
        throw error;
      }
    }
  }
});