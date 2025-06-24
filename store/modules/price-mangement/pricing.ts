import { defineStore } from 'pinia';
import pricingApi from '@/http/requests/app/price-management/pricing';
import { mockPricingApi } from '@/mock/mockPricing';
import { mockCustomersApi, mockCustomerPricingOverrides, mockCustomers } from '@/mock/mockCustomersData';
import type { 
  PricingState, 
  CustomerGroup, 
  SalesChannel, 
  Promotion, 
  PriceCalculationContext,
  PricingRule
} from '@/types/price-management/pricing';

// Determine if we're in development environment
const config = useRuntimeConfig() 
const environment = config.public.nodeEnv
const isDev = environment === 'development';

export const usePricingStore = defineStore('pricing', {
  state: (): PricingState => ({
    customerGroups: [],
    salesChannels: [],
    promotions: [],
    regions: [],
    currencies: [],
    pricingRules: [],
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
    getPricingRules: (state) => state.pricingRules,
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

    // Add the missing fetchPricingRules method
    async fetchPricingRules() {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // If using mock data, create pricing rules from customer pricing overrides
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Transform mockCustomerPricingOverrides into the expected format
          const pricingRules = mockCustomerPricingOverrides.map(override => {
            // Find customer and product details
            const customer = mockCustomers.find(c => c.id === override.customerId);
            const product = (mockPricingApi as any).products?.find(p => p.id === override.productId);
            
            return {
              id: override.id,
              customerId: override.customerId,
              customerName: customer?.company || `${customer?.firstName} ${customer?.lastName}` || 'Unknown Customer',
              productId: override.productId,
              productName: product?.name || 'Unknown Product',
              productPrice: product?.price || 0,
              discountType: override.compareAtPrice > override.price ? 'percentage' : 'override',
              amount: override.compareAtPrice > override.price 
                ? Math.round(((override.compareAtPrice - override.price) / override.compareAtPrice) * 100)
                : override.price,
              calculatedPrice: override.price,
              startDate: override.startDate,
              endDate: override.endDate,
              status: override.isActive ? 'active' : 'inactive',
              notes: '',
              createdAt: override.createdAt,
              updatedAt: override.updatedAt
            };
          });
          
          response = { success: true, pricingRules };
        } else {
          // In a real app, we would call the API
          response = await pricingApi.getPricingRules();
        }
        
        if (response.success) {
          this.pricingRules = response.pricingRules;
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while fetching pricing rules.';
        throw error;
      }
    },

    // Add methods for creating, updating, deleting pricing rules
    async createPricingRule(pricingRuleData) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay
          
          const newPricingRule = {
            id: `rule-${Date.now().toString().substr(-6)}`,
            ...pricingRuleData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, pricingRule: newPricingRule };
        } else {
          response = await pricingApi.createPricingRule(pricingRuleData);
        }
        
        if (response.success && response.pricingRule) {
          this.pricingRules.push(response.pricingRule);
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while creating pricing rule.';
        throw error;
      }
    },

    async updatePricingRule(updatedRule) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          const index = this.pricingRules.findIndex(rule => rule.id === updatedRule.id);
          if (index === -1) {
            throw new Error(`Pricing rule with ID ${updatedRule.id} not found`);
          }
          
          const updatedPricingRule = {
            ...this.pricingRules[index],
            ...updatedRule,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, pricingRule: updatedPricingRule };
        } else {
          response = await pricingApi.updatePricingRule(updatedRule.id, updatedRule);
        }
        
        if (response.success && response.pricingRule) {
          const index = this.pricingRules.findIndex(rule => rule.id === updatedRule.id);
          if (index !== -1) {
            this.pricingRules[index] = response.pricingRule;
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating pricing rule.';
        throw error;
      }
    },

    async deletePricingRule(ruleId) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          const index = this.pricingRules.findIndex(rule => rule.id === ruleId);
          if (index === -1) {
            throw new Error(`Pricing rule with ID ${ruleId} not found`);
          }
          
          response = { success: true };
        } else {
          response = await pricingApi.deletePricingRule(ruleId);
        }
        
        if (response.success) {
          this.pricingRules = this.pricingRules.filter(rule => rule.id !== ruleId);
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while deleting pricing rule.';
        throw error;
      }
    },

    async duplicatePricingRule(ruleId) {
      this.loading = true;
      this.error = null;
      
      try {
        const originalRule = this.pricingRules.find(rule => rule.id === ruleId);
        if (!originalRule) {
          throw new Error(`Pricing rule with ID ${ruleId} not found`);
        }
        
        // Create a copy without ID and with "Copy of" in name
        const ruleCopy = {
          ...originalRule,
          id: undefined,
          notes: `${originalRule.notes ? originalRule.notes + ' ' : ''}(Duplicated from ${ruleId})`
        };
        
        return await this.createPricingRule(ruleCopy);
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while duplicating pricing rule.';
        throw error;
      }
    },

    async updatePricingStatus(ruleId, status, reason = null) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API delay
          
          const index = this.pricingRules.findIndex(rule => rule.id === ruleId);
          if (index === -1) {
            throw new Error(`Pricing rule with ID ${ruleId} not found`);
          }
          
          const updatedRule = {
            ...this.pricingRules[index],
            status,
            statusReason: reason,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, pricingRule: updatedRule };
        } else {
          response = await pricingApi.updatePricingStatus(ruleId, status, reason);
        }
        
        if (response.success && response.pricingRule) {
          const index = this.pricingRules.findIndex(rule => rule.id === ruleId);
          if (index !== -1) {
            this.pricingRules[index] = response.pricingRule;
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating pricing status.';
        throw error;
      }
    },

    async bulkUpdatePricingRules(ruleIds, updates) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
          
          const updatedRules = this.pricingRules.map(rule => {
            if (ruleIds.includes(rule.id)) {
              return {
                ...rule,
                ...updates,
                updatedAt: new Date().toISOString()
              };
            }
            return rule;
          });
          
          response = { 
            success: true, 
            updatedCount: ruleIds.length,
            updatedIds: ruleIds
          };
          
          // Update the state
          this.pricingRules = updatedRules;
        } else {
          response = await pricingApi.bulkUpdatePricingRules(ruleIds, updates);
          
          // If successful, update our local state to match
          if (response.success) {
            const updatedRules = await pricingApi.getPricingRules();
            if (updatedRules.success) {
              this.pricingRules = updatedRules.pricingRules;
            }
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred during bulk update.';
        throw error;
      }
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
          // If using mock data, fetch from mock API
          await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API delay
          response = { success: true, salesChannels: [] };
          
          // If you have mockPricing.js with getSalesChannels method
          if (typeof mockPricingApi !== 'undefined' && typeof mockPricingApi.getSalesChannels === 'function') {
            response = await mockPricingApi.getSalesChannels();
          }
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
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // If using mock data, fetch from mock API
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          response = { success: true, promotions: [] };
          
          // If you have mockPricing, use that
          if (typeof mockPricingApi !== 'undefined' && typeof mockPricingApi.getPromotions === 'function') {
            response = await mockPricingApi.getPromotions();
          }
        } else {
          // In a real app, we would call the API
          response = await pricingApi.getPromotions();
        }
        
        if (response.success) {
          this.promotions = response.promotions;
        }
        
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

    async createPromotion(promotionData) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay
          
          const newPromotion = {
            id: `promo-${Date.now().toString().substr(-6)}`,
            ...promotionData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, promotion: newPromotion };
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

    async updatePromotion(updatedPromotion) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          const index = this.promotions.findIndex(promo => promo.id === updatedPromotion.id);
          if (index === -1) {
            throw new Error(`Promotion with ID ${updatedPromotion.id} not found`);
          }
          
          const updatedPromotionObj = {
            ...this.promotions[index],
            ...updatedPromotion,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, promotion: updatedPromotionObj };
        } else {
          response = await pricingApi.updatePromotion(updatedPromotion.id, updatedPromotion);
        }
        
        if (response.success && response.promotion) {
          const index = this.promotions.findIndex(promo => promo.id === updatedPromotion.id);
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

    async deletePromotion(promotionId) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          const index = this.promotions.findIndex(promo => promo.id === promotionId);
          if (index === -1) {
            throw new Error(`Promotion with ID ${promotionId} not found`);
          }
          
          response = { success: true };
        } else {
          response = await pricingApi.deletePromotion(promotionId);
        }
        
        if (response.success) {
          this.promotions = this.promotions.filter(promo => promo.id !== promotionId);
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while deleting promotion.';
        throw error;
      }
    },

    async duplicatePromotion(promotionId) {
      this.loading = true;
      this.error = null;
      
      try {
        const originalPromotion = this.promotions.find(promo => promo.id === promotionId);
        if (!originalPromotion) {
          throw new Error(`Promotion with ID ${promotionId} not found`);
        }
        
        // Create a copy without ID and with "Copy of" in name
        const promotionCopy = {
          ...originalPromotion,
          id: undefined,
          name: `Copy of ${originalPromotion.name}`,
          notes: `${originalPromotion.notes ? originalPromotion.notes + ' ' : ''}(Duplicated from ${promotionId})`
        };
        
        return await this.createPromotion(promotionCopy);
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while duplicating promotion.';
        throw error;
      }
    },

    async updatePromotionStatus(promotionId, status, reason = null) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API delay
          
          const index = this.promotions.findIndex(promo => promo.id === promotionId);
          if (index === -1) {
            throw new Error(`Promotion with ID ${promotionId} not found`);
          }
          
          const updatedPromotion = {
            ...this.promotions[index],
            status,
            statusReason: reason,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, promotion: updatedPromotion };
        } else {
          response = await pricingApi.updatePromotionStatus(promotionId, status, reason);
        }
        
        if (response.success && response.promotion) {
          const index = this.promotions.findIndex(promo => promo.id === promotionId);
          if (index !== -1) {
            this.promotions[index] = response.promotion;
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating promotion status.';
        throw error;
      }
    },

    async bulkUpdatePromotions(promotionIds, updates) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
          
          const updatedPromotions = this.promotions.map(promo => {
            if (promotionIds.includes(promo.id)) {
              return {
                ...promo,
                ...updates,
                updatedAt: new Date().toISOString()
              };
            }
            return promo;
          });
          
          response = { 
            success: true, 
            updatedCount: promotionIds.length,
            updatedIds: promotionIds
          };
          
          // Update the state
          this.promotions = updatedPromotions;
        } else {
          response = await pricingApi.bulkUpdatePromotions(promotionIds, updates);
          
          // If successful, update our local state to match
          if (response.success) {
            const updatedPromotions = await pricingApi.getPromotions();
            if (updatedPromotions.success) {
              this.promotions = updatedPromotions.promotions;
            }
          }
        }
        
        this.loading = false;
        return response;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred during bulk update.';
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
