import { defineStore } from 'pinia';
import { 
  mockStockVisibilityRules, 
  mockBackorderSettings, 
  mockProductAlternatives 
} from '@/mock/mockInventoryData';
import rulesApi from '~/http/requests/app/rules/visibility';
import type { 
  StockVisibilityRule, 
  BackorderSetting, 
  ProductAlternative,
  VisibilityRulesState
} from '@/types/rules/visibility';

// Determine if we're in development environment
const config = useRuntimeConfig() 
const environment = config.public.nodeEnv
const isDev = environment === 'development';

export const useVisibilityRulesStore = defineStore('visibilityRules', {
  state: (): VisibilityRulesState => ({
    stockVisibilityRules: [],
    backorderSettings: [],
    productAlternatives: [],
    isLoading: false,
    error: null,
    useMockData: isDev // Default to mock data in development
  }),
  
  getters: {
    // Stock visibility rule getters
    getStockVisibilityRules: (state) => state.stockVisibilityRules,
    getStockVisibilityRuleById: (state) => (id: string) => 
      state.stockVisibilityRules.find(rule => rule.id === id),
    getActiveStockVisibilityRules: (state) => 
      state.stockVisibilityRules.filter(rule => rule.active),
    getGlobalStockVisibilityRules: (state) => 
      state.stockVisibilityRules.filter(rule => rule.scope === 'global'),
    getCategoryStockVisibilityRules: (state) => (categoryId: string) => 
      state.stockVisibilityRules.filter(rule => 
        rule.scope === 'category' && rule.categoryIds?.includes(categoryId)
      ),
    getProductStockVisibilityRules: (state) => (productId: string) => 
      state.stockVisibilityRules.filter(rule => 
        rule.scope === 'product' && rule.productIds?.includes(productId)
      ),
    getItemStockVisibilityRules: (state) => (itemId: string) => 
      state.stockVisibilityRules.filter(rule => 
        rule.scope === 'item' && rule.itemIds?.includes(itemId)
      ),
    
    // Backorder settings getters
    getBackorderSettings: (state) => state.backorderSettings,
    getBackorderSettingById: (state) => (id: string) => 
      state.backorderSettings.find(setting => setting.id === id),
    getActiveBackorderSettings: (state) => 
      state.backorderSettings.filter(setting => setting.active),
    getGlobalBackorderSettings: (state) => 
      state.backorderSettings.filter(setting => setting.scope === 'global'),
    getCategoryBackorderSettings: (state) => (categoryId: string) => 
      state.backorderSettings.filter(setting => 
        setting.scope === 'category' && setting.categoryIds?.includes(categoryId)
      ),
    getProductBackorderSettings: (state) => (productId: string) => 
      state.backorderSettings.filter(setting => 
        setting.scope === 'product' && setting.productIds?.includes(productId)
      ),
    getItemBackorderSettings: (state) => (itemId: string) => 
      state.backorderSettings.filter(setting => 
        setting.scope === 'item' && setting.itemIds?.includes(itemId)
      ),
    
    // Product alternatives getters
    getProductAlternatives: (state) => state.productAlternatives,
    getProductAlternativeById: (state) => (id: string) => 
      state.productAlternatives.find(alt => alt.id === id),
    getActiveProductAlternatives: (state) => 
      state.productAlternatives.filter(alt => alt.active),
    getProductAlternativesByPrimaryProduct: (state) => (productId: string) => 
      state.productAlternatives.filter(alt => alt.primaryProductId === productId),
    getProductAlternativesByAlternativeProduct: (state) => (productId: string) => 
      state.productAlternatives.filter(alt => alt.alternativeProductId === productId),
    getProductAlternativesByRelationship: (state) => (relationship: string) => 
      state.productAlternatives.filter(alt => alt.relationship === relationship),
    
    // Loading and error state getters
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    // Fetch all rules
    async fetchRules() {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          this.stockVisibilityRules = [...mockStockVisibilityRules];
          this.backorderSettings = [...mockBackorderSettings];
          this.productAlternatives = [...mockProductAlternatives];
          
          this.isLoading = false;
          return { success: true };
        } else {
          // Fetch from API
          const [visibilityResponse, backorderResponse, alternativesResponse] = await Promise.all([
            rulesApi.fetchStockVisibilityRules(),
            rulesApi.fetchBackorderSettings(),
            rulesApi.fetchProductAlternatives()
          ]);
          
          if (visibilityResponse.success) {
            this.stockVisibilityRules = visibilityResponse.rules;
          }
          
          if (backorderResponse.success) {
            this.backorderSettings = backorderResponse.settings;
          }
          
          if (alternativesResponse.success) {
            this.productAlternatives = alternativesResponse.alternatives;
          }
          
          this.isLoading = false;
          return { success: true };
        }
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch visibility rules';
        throw error;
      }
    },
    
    // Stock Visibility Rules CRUD Operations
    async fetchStockVisibilityRules() {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          response = { success: true, rules: [...mockStockVisibilityRules] };
        } else {
          response = await rulesApi.fetchStockVisibilityRules();
        }
        
        if (response.success) {
          this.stockVisibilityRules = response.rules;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch stock visibility rules';
        throw error;
      }
    },
    
    async createStockVisibilityRule(rule: Partial<StockVisibilityRule>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Create new rule with ID and timestamps
          const newRule = {
            ...rule,
            id: `rule-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as StockVisibilityRule;
          
          response = { success: true, rule: newRule };
        } else {
          response = await rulesApi.createStockVisibilityRule(rule);
        }
        
        if (response.success && response.rule) {
          this.stockVisibilityRules.push(response.rule);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to create stock visibility rule';
        throw error;
      }
    },
    
    async updateStockVisibilityRule(rule: Partial<StockVisibilityRule> & { id: string }) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the rule in the store
          const index = this.stockVisibilityRules.findIndex(r => r.id === rule.id);
          if (index === -1) throw new Error('Rule not found');
          
          // Update the rule
          const updatedRule = {
            ...this.stockVisibilityRules[index],
            ...rule,
            updatedAt: new Date().toISOString()
          } as StockVisibilityRule;
          
          response = { success: true, rule: updatedRule };
        } else {
          response = await rulesApi.updateStockVisibilityRule(rule.id, rule);
        }
        
        if (response.success && response.rule) {
          const index = this.stockVisibilityRules.findIndex(r => r.id === rule.id);
          if (index !== -1) {
            this.stockVisibilityRules[index] = response.rule;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update stock visibility rule';
        throw error;
      }
    },
    
    async deleteStockVisibilityRule(ruleId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if the rule exists
          const index = this.stockVisibilityRules.findIndex(rule => rule.id === ruleId);
          if (index === -1) throw new Error('Rule not found');
          
          response = { success: true };
        } else {
          response = await rulesApi.deleteStockVisibilityRule(ruleId);
        }
        
        if (response.success) {
          this.stockVisibilityRules = this.stockVisibilityRules.filter(rule => rule.id !== ruleId);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to delete stock visibility rule';
        throw error;
      }
    },
    
    // Backorder Settings CRUD Operations
    async fetchBackorderSettings() {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          response = { success: true, settings: [...mockBackorderSettings] };
        } else {
          response = await rulesApi.fetchBackorderSettings();
        }
        
        if (response.success) {
          this.backorderSettings = response.settings;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch backorder settings';
        throw error;
      }
    },
    
    async createBackorderSetting(setting: Partial<BackorderSetting>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Create new setting with ID and timestamps
          const newSetting = {
            ...setting,
            id: `backorder-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as BackorderSetting;
          
          response = { success: true, setting: newSetting };
        } else {
          response = await rulesApi.createBackorderSetting(setting);
        }
        
        if (response.success && response.setting) {
          this.backorderSettings.push(response.setting);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to create backorder setting';
        throw error;
      }
    },
    
    async updateBackorderSetting(setting: Partial<BackorderSetting> & { id: string }) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the setting in the store
          const index = this.backorderSettings.findIndex(s => s.id === setting.id);
          if (index === -1) throw new Error('Setting not found');
          
          // Update the setting
          const updatedSetting = {
            ...this.backorderSettings[index],
            ...setting,
            updatedAt: new Date().toISOString()
          } as BackorderSetting;
          
          response = { success: true, setting: updatedSetting };
        } else {
          response = await rulesApi.updateBackorderSetting(setting.id, setting);
        }
        
        if (response.success && response.setting) {
          const index = this.backorderSettings.findIndex(s => s.id === setting.id);
          if (index !== -1) {
            this.backorderSettings[index] = response.setting;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update backorder setting';
        throw error;
      }
    },
    
    async deleteBackorderSetting(settingId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if the setting exists
          const index = this.backorderSettings.findIndex(setting => setting.id === settingId);
          if (index === -1) throw new Error('Setting not found');
          
          response = { success: true };
        } else {
          response = await rulesApi.deleteBackorderSetting(settingId);
        }
        
        if (response.success) {
          this.backorderSettings = this.backorderSettings.filter(setting => setting.id !== settingId);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to delete backorder setting';
        throw error;
      }
    },
    
    // Product Alternatives CRUD Operations
    async fetchProductAlternatives() {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          response = { success: true, alternatives: [...mockProductAlternatives] };
        } else {
          response = await rulesApi.fetchProductAlternatives();
        }
        
        if (response.success) {
          this.productAlternatives = response.alternatives;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch product alternatives';
        throw error;
      }
    },
    
    async createProductAlternative(alternative: Partial<ProductAlternative>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Create new alternative with ID and timestamps
          const newAlternative = {
            ...alternative,
            id: `alt-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as ProductAlternative;
          
          response = { success: true, alternative: newAlternative };
        } else {
          response = await rulesApi.createProductAlternative(alternative);
        }
        
        if (response.success && response.alternative) {
          this.productAlternatives.push(response.alternative);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to create product alternative';
        throw error;
      }
    },
    
    async updateProductAlternative(alternative: Partial<ProductAlternative> & { id: string }) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the alternative in the store
          const index = this.productAlternatives.findIndex(a => a.id === alternative.id);
          if (index === -1) throw new Error('Alternative not found');
          
          // Update the alternative
          const updatedAlternative = {
            ...this.productAlternatives[index],
            ...alternative,
            updatedAt: new Date().toISOString()
          } as ProductAlternative;
          
          response = { success: true, alternative: updatedAlternative };
        } else {
          response = await rulesApi.updateProductAlternative(alternative.id, alternative);
        }
        
        if (response.success && response.alternative) {
          const index = this.productAlternatives.findIndex(a => a.id === alternative.id);
          if (index !== -1) {
            this.productAlternatives[index] = response.alternative;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update product alternative';
        throw error;
      }
    },
    
    async deleteProductAlternative(alternativeId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if the alternative exists
          const index = this.productAlternatives.findIndex(alt => alt.id === alternativeId);
          if (index === -1) throw new Error('Alternative not found');
          
          response = { success: true };
        } else {
          response = await rulesApi.deleteProductAlternative(alternativeId);
        }
        
        if (response.success) {
          this.productAlternatives = this.productAlternatives.filter(alt => alt.id !== alternativeId);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to delete product alternative';
        throw error;
      }
    },
    
    // Helper methods for applying rules
    getVisibilityActionForProduct(productId: string) {
      // Find all applicable rules for this product, sorted by priority
      const applicableRules = this.stockVisibilityRules
        .filter(rule => 
          rule.active && (
            rule.scope === 'global' ||
            (rule.scope === 'product' && rule.productIds?.includes(productId))
          )
        )
        .sort((a, b) => b.priority - a.priority);
      
      // Return the action from the highest priority rule, or 'show' if none apply
      return applicableRules.length > 0 ? applicableRules[0].action : 'show';
    },
    
    getBackorderSettingForProduct(productId: string) {
      // Find all applicable settings for this product, sorted by priority
      const applicableSettings = this.backorderSettings
        .filter(setting => 
          setting.active && (
            setting.scope === 'global' ||
            (setting.scope === 'product' && setting.productIds?.includes(productId))
          )
        )
        .sort((a, b) => b.priority - a.priority);
      
      // Return the highest priority setting, or null if none apply
      return applicableSettings.length > 0 ? applicableSettings[0] : null;
    },
    
    getAlternativesForProduct(productId: string) {
      // Return all active alternatives for this product
      return this.productAlternatives
        .filter(alt => alt.active && alt.primaryProductId === productId)
        .sort((a, b) => a.displayOrder - b.displayOrder);
    }
  }
});