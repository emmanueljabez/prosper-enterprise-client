import { defineStore } from 'pinia';
import { mockSyncRules, mockSyncSchedules } from '@/mock/mockInventoryData';
import syncRulesApi from '~/http/requests/app/rules/sync';
import type { 
  SyncRule, 
  CreateSyncRuleRequest,
  UpdateSyncRuleRequest,
  BulkUpdateSyncRuleRequest,
  SyncRuleResponse,
  SyncRulesResponse,
  SyncRuleUpdateResponse,
  BulkSyncRuleUpdateResponse,
  SyncSchedule,
  CreateSyncScheduleRequest,
  UpdateSyncScheduleRequest,
  BulkUpdateSyncScheduleRequest
} from '@/types/rules/sync';

// Determine if we're in development environment
const config = useRuntimeConfig() 
const environment = config.public.nodeEnv
const isDev = environment === 'development';

// Define the state interface
interface SyncRulesState {
  rules: SyncRule[];
  schedules: SyncSchedule[];
  isLoading: boolean;
  error: string | null;
  useMockData: boolean;
}

export const useInventorySyncStore = defineStore('inventorySync', {
  state: (): SyncRulesState => ({
    rules: [],
    schedules: [],
    isLoading: false,
    error: null,
    useMockData: isDev // Default to mock data in development
  }),
  
  getters: {
    // Rules getters
    getSyncRules: (state) => state.rules,
    getSyncRuleById: (state) => (id: string) => state.rules.find(rule => rule.id === id),
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getActiveRules: (state) => state.rules.filter(rule => rule.active),
    getInactiveRules: (state) => state.rules.filter(rule => !rule.active),
    getRulesByScope: (state) => (scope: string) => 
      state.rules.filter(rule => rule.scope === scope),
    getRulesByTriggerType: (state) => (triggerType: string) => 
      state.rules.filter(rule => rule.triggerType === triggerType),
    getRulesByAction: (state) => (action: string) => 
      state.rules.filter(rule => rule.action === action),
    getGlobalRules: (state) => 
      state.rules.filter(rule => rule.scope === 'global'),
    getCategoryRules: (state) => 
      state.rules.filter(rule => rule.scope === 'category'),
    getProductRules: (state) => 
      state.rules.filter(rule => rule.scope === 'product'),
    getItemRules: (state) => 
      state.rules.filter(rule => rule.scope === 'item'),
    getRulesByTag: (state) => (tag: string) =>
      state.rules.filter(rule => rule.tags?.includes(tag)),
    getHighPriorityRules: (state) =>
      state.rules.filter(rule => rule.priority >= 90),
      
    // Schedules getters
    getSyncSchedules: (state) => state.schedules,
    getSyncScheduleById: (state) => (id: string) => 
      state.schedules.find(schedule => schedule.id === id),
    getActiveSchedules: (state) => 
      state.schedules.filter(schedule => schedule.active),
    getInactiveSchedules: (state) => 
      state.schedules.filter(schedule => !schedule.active),
    getSchedulesByType: (state) => (type: string) => 
      state.schedules.filter(schedule => schedule.type === type),
    getRealTimeSchedules: (state) => 
      state.schedules.filter(schedule => schedule.type === 'realtime'),
    getBatchSchedules: (state) => 
      state.schedules.filter(schedule => schedule.type.startsWith('batch')),
    getSchedulesByFrequency: (state) => (frequency: string) => 
      state.schedules.filter(schedule => schedule.frequency === frequency),
    getSchedulesByTag: (state) => (tag: string) =>
      state.schedules.filter(schedule => schedule.tags?.includes(tag)),
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    // SYNC RULES ACTIONS
    
    async fetchSyncRules(params = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          response = { success: true, rules: [...mockSyncRules] };
        } else {
          // Real API call
          response = await syncRulesApi.fetchSyncRules(params);
        }
        
        if (response.success) {
          this.rules = response.rules;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch sync rules';
        throw error;
      }
    },
    
    async fetchSyncRule(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const rule = mockSyncRules.find(rule => rule.id === id);
          
          if (!rule) {
            throw new Error(`Sync rule with ID ${id} not found`);
          }
          
          response = { success: true, rule };
        } else {
          response = await syncRulesApi.fetchSyncRule(id);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || `Failed to fetch sync rule with ID ${id}`;
        throw error;
      }
    },
    
    async createSyncRule(newRule: CreateSyncRuleRequest) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Generate new ID and add timestamps
          const createdRule = {
            ...newRule,
            id: `sync-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as SyncRule;
          
          response = { success: true, rule: createdRule };
        } else {
          response = await syncRulesApi.createSyncRule(newRule);
        }
        
        if (response.success && response.rule) {
          this.rules.push(response.rule);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to create sync rule';
        throw error;
      }
    },
    
    async updateSyncRule(updatedRule: Partial<SyncRule> & { id: string }) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update the rule in the array
          const index = this.rules.findIndex(rule => rule.id === updatedRule.id);
          if (index === -1) throw new Error('Sync rule not found');
          
          // Update timestamp
          const updatedRuleObj = {
            ...this.rules[index],
            ...updatedRule,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, rule: updatedRuleObj };
        } else {
          response = await syncRulesApi.updateSyncRule(updatedRule.id, updatedRule);
        }
        
        if (response.success && response.rule) {
          const index = this.rules.findIndex(rule => rule.id === updatedRule.id);
          if (index !== -1) {
            this.rules[index] = response.rule;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update sync rule';
        throw error;
      }
    },
    
    async deleteSyncRule(ruleId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Remove the rule from the array
          const index = this.rules.findIndex(rule => rule.id === ruleId);
          if (index === -1) throw new Error('Sync rule not found');
          
          response = { success: true };
        } else {
          response = await syncRulesApi.deleteSyncRule(ruleId);
        }
        
        if (response.success) {
          this.rules = this.rules.filter(rule => rule.id !== ruleId);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to delete sync rule';
        throw error;
      }
    },
    
    async duplicateSyncRule(ruleId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the rule to duplicate
          const originalRule = this.rules.find(rule => rule.id === ruleId);
          if (!originalRule) throw new Error('Sync rule not found');
          
          // Create a copy with a new ID and updated timestamps
          const duplicatedRule = {
            ...JSON.parse(JSON.stringify(originalRule)),
            id: `sync-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            name: `${originalRule.name} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, rule: duplicatedRule };
        } else {
          response = await syncRulesApi.duplicateSyncRule(ruleId);
        }
        
        if (response.success && response.rule) {
          this.rules.push(response.rule);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to duplicate sync rule';
        throw error;
      }
    },
    
    async updateSyncRuleStatus(ruleId: string, active: boolean) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find and update the rule
          const index = this.rules.findIndex(rule => rule.id === ruleId);
          if (index === -1) throw new Error('Sync rule not found');
          
          const updatedRule = {
            ...this.rules[index],
            active,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, rule: updatedRule };
        } else {
          response = await syncRulesApi.updateSyncRuleStatus(ruleId, active);
        }
        
        if (response.success && response.rule) {
          const index = this.rules.findIndex(rule => rule.id === ruleId);
          if (index !== -1) {
            this.rules[index] = response.rule;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update sync rule status';
        throw error;
      }
    },
    
    async bulkUpdateSyncRules(ruleIds: string[], updates: UpdateSyncRuleRequest) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update each rule
          const updatedRules = this.rules.map(rule => {
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
          this.rules = updatedRules;
        } else {
          const bulkUpdateRequest: BulkUpdateSyncRuleRequest = {
            ids: ruleIds,
            updates
          };
          response = await syncRulesApi.bulkUpdateSyncRules(bulkUpdateRequest);
          
          // If successful, refresh the rules list
          if (response.success) {
            await this.fetchSyncRules();
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to bulk update sync rules';
        throw error;
      }
    },
    
    async executeSyncRule(ruleId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Find the rule
          const rule = this.rules.find(rule => rule.id === ruleId);
          if (!rule) throw new Error('Sync rule not found');
          
          response = { 
            success: true,
            executionId: `exec-${Math.floor(Math.random() * 100000)}`,
            message: `Rule "${rule.name}" executed successfully`,
            timestamp: new Date().toISOString()
          };
        } else {
          response = await syncRulesApi.executeSyncRule(ruleId);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to execute sync rule';
        throw error;
      }
    },
    
    async exportSyncRules(format: string = 'csv', filters = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // For mock data, we'll just simulate the API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Create a dummy blob for download
          const jsonData = JSON.stringify(this.rules.filter(rule => {
            // Apply filters if needed
            return true;
          }));
          
          const blob = new Blob([jsonData], { type: 'application/json' });
          response = { success: true, data: blob };
        } else {
          response = await syncRulesApi.exportSyncRules(format, filters);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to export sync rules';
        throw error;
      }
    },
    
    async importSyncRules(formData: FormData) {
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
            message: '5 rules were successfully imported' 
          };
          
          // Refresh rules after import
          await this.fetchSyncRules();
        } else {
          response = await syncRulesApi.importSyncRules(formData);
          
          // Refresh rules after successful import
          if (response.success) {
            await this.fetchSyncRules();
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to import sync rules';
        throw error;
      }
    },
    
    // SYNC SCHEDULES ACTIONS
    
    async fetchSyncSchedules(params = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          response = { success: true, schedules: [...mockSyncSchedules] };
        } else {
          // Real API call
          response = await syncRulesApi.fetchSyncSchedules(params);
        }
        
        if (response.success) {
          this.schedules = response.schedules;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch sync schedules';
        throw error;
      }
    },
    
    async fetchSyncSchedule(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const schedule = mockSyncSchedules.find(schedule => schedule.id === id);
          
          if (!schedule) {
            throw new Error(`Sync schedule with ID ${id} not found`);
          }
          
          response = { success: true, schedule };
        } else {
          response = await syncRulesApi.fetchSyncSchedule(id);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || `Failed to fetch sync schedule with ID ${id}`;
        throw error;
      }
    },
    
    async createSyncSchedule(newSchedule: CreateSyncScheduleRequest) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Generate new ID and add timestamps
          const createdSchedule = {
            ...newSchedule,
            id: `sched-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as SyncSchedule;
          
          response = { success: true, schedule: createdSchedule };
        } else {
          response = await syncRulesApi.createSyncSchedule(newSchedule);
        }
        
        if (response.success && response.schedule) {
          this.schedules.push(response.schedule);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to create sync schedule';
        throw error;
      }
    },
    
    async updateSyncSchedule(updatedSchedule: Partial<SyncSchedule> & { id: string }) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update the schedule in the array
          const index = this.schedules.findIndex(schedule => schedule.id === updatedSchedule.id);
          if (index === -1) throw new Error('Sync schedule not found');
          
          // Update timestamp
          const updatedScheduleObj = {
            ...this.schedules[index],
            ...updatedSchedule,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, schedule: updatedScheduleObj };
        } else {
          response = await syncRulesApi.updateSyncSchedule(updatedSchedule.id, updatedSchedule);
        }
        
        if (response.success && response.schedule) {
          const index = this.schedules.findIndex(schedule => schedule.id === updatedSchedule.id);
          if (index !== -1) {
            this.schedules[index] = response.schedule;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update sync schedule';
        throw error;
      }
    },
    
    async deleteSyncSchedule(scheduleId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Remove the schedule from the array
          const index = this.schedules.findIndex(schedule => schedule.id === scheduleId);
          if (index === -1) throw new Error('Sync schedule not found');
          
          response = { success: true };
        } else {
          response = await syncRulesApi.deleteSyncSchedule(scheduleId);
        }
        
        if (response.success) {
          this.schedules = this.schedules.filter(schedule => schedule.id !== scheduleId);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to delete sync schedule';
        throw error;
      }
    },
    
    async duplicateSyncSchedule(scheduleId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the schedule to duplicate
          const originalSchedule = this.schedules.find(schedule => schedule.id === scheduleId);
          if (!originalSchedule) throw new Error('Sync schedule not found');
          
          // Create a copy with a new ID and updated timestamps
          const duplicatedSchedule = {
            ...JSON.parse(JSON.stringify(originalSchedule)),
            id: `sched-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            name: `${originalSchedule.name} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, schedule: duplicatedSchedule };
        } else {
          response = await syncRulesApi.duplicateSyncSchedule(scheduleId);
        }
        
        if (response.success && response.schedule) {
          this.schedules.push(response.schedule);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to duplicate sync schedule';
        throw error;
      }
    },
    
    async updateSyncScheduleStatus(scheduleId: string, active: boolean) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find and update the schedule
          const index = this.schedules.findIndex(schedule => schedule.id === scheduleId);
          if (index === -1) throw new Error('Sync schedule not found');
          
          const updatedSchedule = {
            ...this.schedules[index],
            active,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, schedule: updatedSchedule };
        } else {
          response = await syncRulesApi.updateSyncScheduleStatus(scheduleId, active);
        }
        
        if (response.success && response.schedule) {
          const index = this.schedules.findIndex(schedule => schedule.id === scheduleId);
          if (index !== -1) {
            this.schedules[index] = response.schedule;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update sync schedule status';
        throw error;
      }
    },
    
    async bulkUpdateSyncSchedules(updates: BulkUpdateSyncScheduleRequest) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update each schedule
          const updatedSchedules = this.schedules.map(schedule => {
            if (updates.scheduleIds.includes(schedule.id)) {
              return {
                ...schedule,
                ...updates.updates,
                updatedAt: new Date().toISOString()
              };
            }
            return schedule;
          });
          
          response = { 
            success: true, 
            updatedCount: updates.scheduleIds.length,
            updatedIds: updates.scheduleIds
          };
          
          // Update the state
          this.schedules = updatedSchedules;
        } else {
          response = await syncRulesApi.bulkUpdateSyncSchedules(updates);
          
          // If successful, refresh the schedules list
          if (response.success) {
            await this.fetchSyncSchedules();
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to bulk update sync schedules';
        throw error;
      }
    },
    
    async bulkDeleteSyncSchedules(scheduleIds: string[]) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Delete schedules
          this.schedules = this.schedules.filter(schedule => !scheduleIds.includes(schedule.id));
          
          response = { 
            success: true, 
            deletedCount: scheduleIds.length,
            deletedIds: scheduleIds
          };
        } else {
          response = await syncRulesApi.bulkDeleteSyncSchedules(scheduleIds);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to bulk delete sync schedules';
        throw error;
      }
    },
    
    async importSyncSchedules(formData: FormData) {
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
            message: '3 schedules were successfully imported' 
          };
          
          // Refresh schedules after import
          await this.fetchSyncSchedules();
        } else {
          response = await syncRulesApi.importSyncSchedules(formData);
          
          // Refresh schedules after successful import
          if (response.success) {
            await this.fetchSyncSchedules();
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to import sync schedules';
        throw error;
      }
    },
    
    async exportSyncSchedules(format: string = 'csv', filters = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // For mock data, we'll just simulate the API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Create a dummy blob for download
          const jsonData = JSON.stringify(this.schedules.filter(schedule => {
            // Apply filters if needed
            return true;
          }));
          
          const blob = new Blob([jsonData], { type: 'application/json' });
          response = { success: true, data: blob };
        } else {
          response = await syncRulesApi.exportSyncSchedules(format, filters);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to export sync schedules';
        throw error;
      }
    },
    
    async runSyncSchedule(scheduleId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Find the schedule
          const schedule = this.schedules.find(schedule => schedule.id === scheduleId);
          if (!schedule) throw new Error('Sync schedule not found');
          
          response = { 
            success: true,
            executionId: `exec-${Math.floor(Math.random() * 100000)}`,
            message: `Schedule "${schedule.name}" executed successfully`,
            timestamp: new Date().toISOString()
          };
        } else {
          response = await syncRulesApi.runSyncSchedule(scheduleId);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to run sync schedule';
        throw error;
      }
    }
  }
});