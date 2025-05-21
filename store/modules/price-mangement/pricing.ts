import { defineStore } from 'pinia';
import pricingApi from '@/http/requests/app/price-management/pricing';
import { mockPricingApi } from '@/mock/mockPricing';
import type { 
  PricingState, 
  CustomerGroup, 
  SalesChannel, 
  Promotion, 
  PriceCalculationContext 
} from '@/types/price-management/pricing';

// Determine if we're in development environment
const isDev = process.env.NODE_ENV === 'development';

export const usePricingStore = defineStore('pricing', {
  state: (): PricingState => ({
    customerGroups: [],
    salesChannels: [],
    promotions: [],
    regions: [],
    currencies: [],
    loading: false,
    error: null,
    useMockData: isDev // Default to mock data in development
  }),

  getters: {
    getCustomerGroups: (state) => state.customerGroups,
    getSalesChannels: (state) => state.salesChannels,
    getPromotions: (state) => state.promotions,
    getRegions: (state) => state.regions,
    getCurrencies: (state) => state.currencies,
    getIsLoading: (state) => state.loading,
    getError: (state) => state.error,
    
    getActivePromotions: (state) => state.promotions.filter(promo => promo.isActive),
    
    getDefaultCustomerGroup: (state) => state.customerGroups.find(group => group.isDefault) || null,
    
    getDefaultSalesChannel: (state) => state.salesChannels.find(channel => channel.isDefault) || null,
    
    getDefaultRegion: (state) => state.regions.find(region => region.id === 'us') || state.regions[0] || null,
    
    getDefaultCurrency: (state) => state.currencies.find(currency => currency.isDefault) || null
  },

  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },

    async fetchCustomerGroups() {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockPricingApi.getCustomerGroups();
        } else {
          response = await pricingApi.getCustomerGroups();
        }
        this.customerGroups = response.success ? response.customerGroups : [];
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while fetching customer groups.';
        throw error;
      }
    },

    async fetchSalesChannels() {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockPricingApi.getSalesChannels();
        } else {
          response = await pricingApi.getSalesChannels();
        }
        this.salesChannels = response.success ? response.salesChannels : [];
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while fetching sales channels.';
        throw error;
      }
    },

    async fetchPromotions(activeOnly: boolean = false) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockPricingApi.getPromotions(activeOnly);
        } else {
          response = await pricingApi.getPromotions(activeOnly);
        }
        this.promotions = response.success ? response.promotions : [];
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while fetching promotions.';
        throw error;
      }
    },

    async fetchPricingData() {
      this.loading = true;
      try {
        // Fetch all pricing related data in parallel
        const [customerGroups, salesChannels, promotions, regions, currencies] = await Promise.all([
          this.fetchCustomerGroups(),
          this.fetchSalesChannels(),
          this.fetchPromotions(),
          this.fetchRegions(),
          this.fetchCurrencies()
        ]);
        
        this.loading = false;
        return {
          customerGroups,
          salesChannels,
          promotions,
          regions,
          currencies,
          success: true
        };
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while fetching pricing data.';
        throw error;
      }
    },

    async fetchRegions() {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          // Assuming regions are part of the mock pricing API
          response = { success: true, regions: mockPricingApi.regions || [] };
        } else {
          response = await pricingApi.getRegions();
        }
        this.regions = response.success ? response.regions : [];
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while fetching regions.';
        throw error;
      }
    },

    async fetchCurrencies() {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          // Assuming currencies are part of the mock pricing API
          response = { success: true, currencies: mockPricingApi.currencies || [] };
        } else {
          response = await pricingApi.getCurrencies();
        }
        this.currencies = response.success ? response.currencies : [];
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while fetching currencies.';
        throw error;
      }
    },

    async calculateProductPrice(productId: string, context: PriceCalculationContext) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockPricingApi.calculatePrice(productId, context);
        } else {
          response = await pricingApi.calculatePrice(productId, context);
        }
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while calculating product price.';
        throw error;
      }
    },

    async findApplicablePromotions(productId: string, context: PriceCalculationContext) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockPricingApi.getApplicablePromotions(productId, context);
        } else {
          response = await pricingApi.getApplicablePromotions(productId, context);
        }
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while finding applicable promotions.';
        throw error;
      }
    },

    async simulatePriceChanges(productIds: string[], percentChange: number, filters = {}) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockPricingApi.simulatePriceChanges(productIds, percentChange, filters);
        } else {
          response = await pricingApi.simulatePriceChanges(productIds, percentChange, filters);
        }
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while simulating price changes.';
        throw error;
      }
    },

    async createPromotion(promotionData: Partial<Promotion>) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockPricingApi.createPromotion(promotionData);
        } else {
          response = await pricingApi.createPromotion(promotionData);
        }
        
        if (response.success && response.promotion) {
          this.promotions.push(response.promotion);
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while creating promotion.';
        throw error;
      }
    },

    async updatePromotion(promotionId: string, updates: Partial<Promotion>) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockPricingApi.updatePromotion(promotionId, updates);
        } else {
          response = await pricingApi.updatePromotion(promotionId, updates);
        }
        
        if (response.success && response.promotion) {
          const index = this.promotions.findIndex(p => p.id === promotionId);
          if (index !== -1) {
            this.promotions[index] = response.promotion;
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating promotion.';
        throw error;
      }
    },

    async deletePromotion(promotionId: string) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = await mockPricingApi.deletePromotion(promotionId);
        } else {
          response = await pricingApi.deletePromotion(promotionId);
        }
        
        if (response.success) {
          this.promotions = this.promotions.filter(promotion => promotion.id !== promotionId);
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while deleting promotion.';
        throw error;
      }
    },

    async createCustomerGroup(customerGroup: Partial<CustomerGroup>) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = { 
            success: true, 
            customerGroup: { 
              id: `cg-${Date.now()}`, 
              ...customerGroup 
            } 
          };
        } else {
          response = await pricingApi.createCustomerGroup(customerGroup);
        }
        
        if (response.success && response.customerGroup) {
          this.customerGroups.push(response.customerGroup);
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while creating customer group.';
        throw error;
      }
    },

    async updateCustomerGroup(groupId: string, updates: Partial<CustomerGroup>) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          const index = this.customerGroups.findIndex(g => g.id === groupId);
          if (index === -1) {
            throw new Error(`Customer group with ID ${groupId} not found`);
          }
          
          const updatedGroup = { ...this.customerGroups[index], ...updates };
          response = { success: true, customerGroup: updatedGroup };
        } else {
          response = await pricingApi.updateCustomerGroup(groupId, updates);
        }
        
        if (response.success && response.customerGroup) {
          const index = this.customerGroups.findIndex(g => g.id === groupId);
          if (index !== -1) {
            this.customerGroups[index] = response.customerGroup;
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating customer group.';
        throw error;
      }
    },

    async deleteCustomerGroup(groupId: string) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          const index = this.customerGroups.findIndex(g => g.id === groupId);
          if (index === -1) {
            throw new Error(`Customer group with ID ${groupId} not found`);
          }
          
          response = { success: true };
        } else {
          response = await pricingApi.deleteCustomerGroup(groupId);
        }
        
        if (response.success) {
          this.customerGroups = this.customerGroups.filter(group => group.id !== groupId);
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while deleting customer group.';
        throw error;
      }
    },

    async createSalesChannel(salesChannel: Partial<SalesChannel>) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          response = { 
            success: true, 
            salesChannel: { 
              id: `sc-${Date.now()}`, 
              ...salesChannel 
            } 
          };
        } else {
          response = await pricingApi.createSalesChannel(salesChannel);
        }
        
        if (response.success && response.salesChannel) {
          this.salesChannels.push(response.salesChannel);
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while creating sales channel.';
        throw error;
      }
    },

    async updateSalesChannel(channelId: string, updates: Partial<SalesChannel>) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          const index = this.salesChannels.findIndex(c => c.id === channelId);
          if (index === -1) {
            throw new Error(`Sales channel with ID ${channelId} not found`);
          }
          
          const updatedChannel = { ...this.salesChannels[index], ...updates };
          response = { success: true, salesChannel: updatedChannel };
        } else {
          response = await pricingApi.updateSalesChannel(channelId, updates);
        }
        
        if (response.success && response.salesChannel) {
          const index = this.salesChannels.findIndex(c => c.id === channelId);
          if (index !== -1) {
            this.salesChannels[index] = response.salesChannel;
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating sales channel.';
        throw error;
      }
    },

    async deleteSalesChannel(channelId: string) {
      this.loading = true;
      try {
        let response;
        if (this.useMockData) {
          const index = this.salesChannels.findIndex(c => c.id === channelId);
          if (index === -1) {
            throw new Error(`Sales channel with ID ${channelId} not found`);
          }
          
          response = { success: true };
        } else {
          response = await pricingApi.deleteSalesChannel(channelId);
        }
        
        if (response.success) {
          this.salesChannels = this.salesChannels.filter(channel => channel.id !== channelId);
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while deleting sales channel.';
        throw error;
      }
    },

    // Utility method to format a price with the proper currency
    formatPrice(price: number, currencyCode: string = 'USD') {
      const currency = this.currencies.find(c => c.code === currencyCode) || this.currencies.find(c => c.isDefault) || { code: 'USD', symbol: '$' };
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    }
  }
});