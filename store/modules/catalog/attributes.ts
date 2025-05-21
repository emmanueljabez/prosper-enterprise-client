import { defineStore } from 'pinia';
import attributesApi from '@/http/requests/app/catalog/attributes';
import {
  attributesData,
  attributeGroups,
  attributeSets,
  variantMatrices,
  attributeDependencyRules,
  attributeUtils,
  ATTRIBUTE_TYPES,
  VALIDATION_TYPES
} from '@/mock/mockAttributeData';
import type {
  Attribute,
  AttributeGroup,
  AttributeSet,
  VariantMatrix,
  AttributeDependencyRule,
  AttributeOption,
  AttributesState
} from '@/types/catalog/attributes';
import { v4 as uuidv4 } from 'uuid';



// Determine if we're in development environment
const isDev = process.env.NODE_ENV === 'development';

export const useAttributesStore = defineStore('attributes', {
  state: (): AttributesState => ({
    attributes: [],
    attributeGroups: [],
    attributeSets: [],
    variantMatrices: [],
    attributeDependencyRules: [],
    attributeTypes: ATTRIBUTE_TYPES,
    validationTypes: VALIDATION_TYPES,
    loading: false,
    error: null,
    useMockData: isDev // Default to mock data in development
  }),

  getters: {
    getAttributes: (state) => state.attributes,
    getAttributeGroups: (state) => state.attributeGroups,
    getAttributeSets: (state) => state.attributeSets,
    getVariantMatrices: (state) => state.variantMatrices,
    getDependencyRules: (state) => state.attributeDependencyRules,
    getAttributeTypes: (state) => state.attributeTypes,
    getValidationTypes: (state) => state.validationTypes,
    getIsLoading: (state) => state.loading,
    getError: (state) => state.error,

    // Get attribute by ID
    getAttributeById: (state) => (id: string) => 
      state.attributes.find(attr => attr.id === id),
    
    // Get attribute by code
    getAttributeByCode: (state) => (code: string) => 
      state.attributes.find(attr => attr.code === code),
    
    // Get attribute group by ID
    getAttributeGroupById: (state) => (id: string) => 
      state.attributeGroups.find(group => group.id === id),
    
    // Get attribute set by ID
    getAttributeSetById: (state) => (id: string) => 
      state.attributeSets.find(set => set.id === id),
    
    // Get variant matrix by product ID
    getVariantMatrixByProductId: (state) => (productId: string) => 
      state.variantMatrices.find(matrix => matrix.productId === productId),
    
    // Get attributes by group ID
    getAttributesByGroup: (state) => (groupId: string) => 
      state.attributes.filter(attr => attr.groupId === groupId),
    
    // Get all attributes in an attribute set
    getAttributesBySet: (state) => (setId: string) => {
      const set = state.attributeSets.find(s => s.id === setId);
      if (!set) return [];
      
      // Collect all attribute IDs from groups in the set
      const attributeIds = set.attributeGroups.reduce<string[]>((acc, group) => {
        return [...acc, ...group.attributes];
      }, []);
      
      // Get the actual attribute objects
      return state.attributes.filter(attr => attributeIds.includes(attr.id));
    },
    
    // Get attributes by type
    getAttributesByType: (state) => (type: string) => 
      state.attributes.filter(attr => attr.type === type),
    
    // Get variant attributes
    getVariantAttributes: (state) => 
      state.attributes.filter(attr => attr.isVariant),
    
    // Get filterable attributes
    getFilterableAttributes: (state) => 
      state.attributes.filter(attr => attr.isFilterable),
    
    // Get searchable attributes
    getSearchableAttributes: (state) => 
      state.attributes.filter(attr => attr.isSearchable),
    
    // Get attributes with options
    getAttributesWithOptions: (state) => 
      state.attributes.filter(attr => attr.options && attr.options.length > 0),
    
    // Get default attribute set
    getDefaultAttributeSet: (state) => 
      state.attributeSets.find(set => set.isDefault),

    getVariantMatricesArray: (state) => {
      console.log("Getting variantMatrices, current value:", state.variantMatrices);
      
      if (Array.isArray(state.variantMatrices)) {
        return state.variantMatrices;
      } else if (state.variantMatrices && typeof state.variantMatrices === 'object') {
        // Transform the object into an array and ensure each matrix has an id
        return Object.entries(state.variantMatrices).map(([key, matrix]) => ({
          id: key, // Use the key as id if not present
          ...matrix
        }));
      }
      return [];
    },


  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },

    // Fetch all attributes and related data
    async fetchAttributes() {
      this.loading = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          console.log("Loading mock attribute data");
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Make sure to import and load the variantMatrices from your mock data
          this.attributes = JSON.parse(JSON.stringify(attributesData));
          this.variantMatrices = JSON.parse(JSON.stringify(variantMatrices));
          
          console.log("Loaded mock variant matrices:", this.variantMatrices);
        } else {
          // Use real API
          console.log("Using API attribute data");
          const response = await attributesApi.fetchAttributes();
          this.attributes = response.data.data.attributes;
          this.attributeGroups = response.data.data.attributeGroups;
          this.attributeSets = response.data.data.attributeSets;
          this.variantMatrices = response.data.data.variantMatrices;
          this.attributeDependencyRules = response.data.data.attributeDependencyRules;
        }
        
        this.loading = false;
        return {
          attributes: this.attributes,
          attributeGroups: this.attributeGroups,
          attributeSets: this.attributeSets
        };
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while fetching attributes.';
        throw error;
      }
    },

    // Create a new attribute
    async createAttribute(attributeData: Omit<Attribute, 'id'>) {
      this.loading = true;
      this.error = null;
      
      try {
        const newAttribute: Attribute = {
          ...attributeData,
          id: uuidv4()
        };
        
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for attribute creation");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Add to local state
          this.attributes.push(newAttribute);
          
          response = { data: { data: newAttribute } };
        } else {
          // Use real API
          response = await attributesApi.createAttribute(newAttribute);
          
          // Refresh attributes
          await this.fetchAttributes();
        }
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while creating attribute.';
        throw error;
      }
    },

    // Update an existing attribute
    async updateAttribute(attributeId: string, attributeData: Partial<Attribute>) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for attribute update");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Update local state
          const index = this.attributes.findIndex(attr => attr.id === attributeId);
          if (index !== -1) {
            this.attributes[index] = { ...this.attributes[index], ...attributeData };
            response = { data: { data: this.attributes[index] } };
          } else {
            throw new Error(`Attribute with ID ${attributeId} not found`);
          }
        } else {
          // Use real API
          response = await attributesApi.updateAttribute(attributeId, attributeData);
          
          // Refresh attributes
          await this.fetchAttributes();
        }
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating attribute.';
        throw error;
      }
    },

    // Delete an attribute
    async deleteAttribute(attributeId: string) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for attribute deletion");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Check if attribute is used in any attribute set
          const isUsedInSet = this.attributeSets.some(set => 
            set.attributeGroups.some(group => 
              group.attributes.includes(attributeId)
            )
          );
          
          // Check if attribute is used in any variant matrix
          const isUsedInVariantMatrix = this.variantMatrices.some(matrix => 
            matrix.variantAttributes.includes(attributeId)
          );
          
          if (isUsedInSet || isUsedInVariantMatrix) {
            throw new Error('Cannot delete attribute that is in use by attribute sets or variant matrices');
          }
          
          // Remove from local state
          const index = this.attributes.findIndex(attr => attr.id === attributeId);
          if (index !== -1) {
            this.attributes.splice(index, 1);
            response = { data: { success: true } };
          } else {
            throw new Error(`Attribute with ID ${attributeId} not found`);
          }
        } else {
          // Use real API
          response = await attributesApi.deleteAttribute(attributeId);
          
          // Refresh attributes
          await this.fetchAttributes();
        }
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while deleting attribute.';
        throw error;
      }
    },

    // Create a new attribute group
    async createAttributeGroup(groupData: Omit<AttributeGroup, 'id'>) {
      this.loading = true;
      this.error = null;
      
      try {
        const newGroup: AttributeGroup = {
          ...groupData,
          id: uuidv4()
        };
        
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for attribute group creation");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Add to local state
          this.attributeGroups.push(newGroup);
          
          response = { data: { data: newGroup } };
        } else {
          // Use real API
          response = await attributesApi.createAttributeGroup(newGroup);
          
          // Refresh attributes
          await this.fetchAttributes();
        }
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while creating attribute group.';
        throw error;
      }
    },

    // Update an existing attribute group
    async updateAttributeGroup(groupId: string, groupData: Partial<AttributeGroup>) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for attribute group update");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Update local state
          const index = this.attributeGroups.findIndex(group => group.id === groupId);
          if (index !== -1) {
            this.attributeGroups[index] = { ...this.attributeGroups[index], ...groupData };
            response = { data: { data: this.attributeGroups[index] } };
          } else {
            throw new Error(`Attribute group with ID ${groupId} not found`);
          }
        } else {
          // Use real API
          response = await attributesApi.updateAttributeGroup(groupId, groupData);
          
          // Refresh attributes
          await this.fetchAttributes();
        }
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating attribute group.';
        throw error;
      }
    },

    // Delete an attribute group
    async deleteAttributeGroup(groupId: string) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for attribute group deletion");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Check if group is used in any attribute set
          const isUsedInSet = this.attributeSets.some(set => 
            set.attributeGroups.some(group => group.groupId === groupId)
          );
          
          if (isUsedInSet) {
            throw new Error('Cannot delete attribute group that is in use by attribute sets');
          }
          
          // Remove from local state
          const index = this.attributeGroups.findIndex(group => group.id === groupId);
          if (index !== -1) {
            this.attributeGroups.splice(index, 1);
            
            // Update attributes that use this group
            this.attributes.forEach(attr => {
              if (attr.groupId === groupId) {
                attr.groupId = undefined;
              }
            });
            
            response = { data: { success: true } };
          } else {
            throw new Error(`Attribute group with ID ${groupId} not found`);
          }
        } else {
          // Use real API
          response = await attributesApi.deleteAttributeGroup(groupId);
          
          // Refresh attributes
          await this.fetchAttributes();
        }
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while deleting attribute group.';
        throw error;
      }
    },

    // Create a new attribute set
    async createAttributeSet(setData: Omit<AttributeSet, 'id'>) {
      this.loading = true;
      this.error = null;
      
      try {
        const newSet: AttributeSet = {
          ...setData,
          id: uuidv4()
        };
        
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for attribute set creation");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // If setting this set as default, update others
          if (newSet.isDefault) {
            this.attributeSets.forEach(set => {
              set.isDefault = false;
            });
          }
          
          // Add to local state
          this.attributeSets.push(newSet);
          
          response = { data: { data: newSet } };
        } else {
          // Use real API
          response = await attributesApi.createAttributeSet(newSet);
          
          // Refresh attributes
          await this.fetchAttributes();
        }
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while creating attribute set.';
        throw error;
      }
    },

    // Update an existing attribute set
    async updateAttributeSet(setId: string, setData: Partial<AttributeSet>) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for attribute set update");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Update local state
          const index = this.attributeSets.findIndex(set => set.id === setId);
          if (index !== -1) {
            // If setting this set as default, update others
            if (setData.isDefault) {
              this.attributeSets.forEach(set => {
                set.isDefault = false;
              });
            }
            
            this.attributeSets[index] = { ...this.attributeSets[index], ...setData };
            response = { data: { data: this.attributeSets[index] } };
          } else {
            throw new Error(`Attribute set with ID ${setId} not found`);
          }
        } else {
          // Use real API
          response = await attributesApi.updateAttributeSet(setId, setData);
          
          // Refresh attributes
          await this.fetchAttributes();
        }
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating attribute set.';
        throw error;
      }
    },

    // Delete an attribute set
    async deleteAttributeSet(setId: string) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for attribute set deletion");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Check if it's the default set
          const set = this.attributeSets.find(s => s.id === setId);
          if (set && set.isDefault) {
            throw new Error('Cannot delete the default attribute set');
          }
          
          // Remove from local state
          const index = this.attributeSets.findIndex(set => set.id === setId);
          if (index !== -1) {
            this.attributeSets.splice(index, 1);
            response = { data: { success: true } };
          } else {
            throw new Error(`Attribute set with ID ${setId} not found`);
          }
        } else {
          // Use real API
          response = await attributesApi.deleteAttributeSet(setId);
          
          // Refresh attributes
          await this.fetchAttributes();
        }
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while deleting attribute set.';
        throw error;
      }
    },

    // Create a variant matrix for a product
    async createVariantMatrix(productId: string, variantAttributes: string[]) {
      this.loading = true;
      this.error = null;
      
      try {
        // Check if a matrix already exists for this product
        const existingMatrix = this.variantMatrices.find(matrix => matrix.productId === productId);
        if (existingMatrix) {
          throw new Error(`Variant matrix already exists for product ${productId}`);
        }
        
        // Generate a new matrix with all possible combinations
        const newMatrix: VariantMatrix = {
          id: uuidv4(),
          productId,
          variantAttributes,
          excludedCombinations: [],
          variants: []
        };
        
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for variant matrix creation");
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
          
          // Generate all possible combinations for the variants
          const combinations = this.generateVariantCombinations(variantAttributes);
          
          // Create variants from combinations
          newMatrix.variants = combinations.map(combination => ({
            id: uuidv4(),
            sku: `SKU-${productId}-${Object.values(combination).join('-')}`,
            attributeValues: combination,
            stock: 0,
            isEnabled: true
          }));
          
          // Add to local state
          this.variantMatrices.push(newMatrix);
          
          response = { data: { data: newMatrix } };
        } else {
          // Use real API
          response = await attributesApi.createVariantMatrix(productId, variantAttributes);
          
          // Refresh attributes and matrices
          await this.fetchAttributes();
        }
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while creating variant matrix.';
        throw error;
      }
    },

    // Update a variant matrix
    async updateVariantMatrix(matrixId: string, updates: Partial<VariantMatrix>) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for variant matrix update");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Update local state
          const index = this.variantMatrices.findIndex(matrix => matrix.id === matrixId);
          if (index !== -1) {
            this.variantMatrices[index] = { ...this.variantMatrices[index], ...updates };
            response = { data: { data: this.variantMatrices[index] } };
          } else {
            throw new Error(`Variant matrix with ID ${matrixId} not found`);
          }
        } else {
          // Use real API
          response = await attributesApi.updateVariantMatrix(matrixId, updates);
          
          // Refresh attributes
          await this.fetchAttributes();
        }
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating variant matrix.';
        throw error;
      }
    },

    // Delete a variant matrix
    async deleteVariantMatrix(matrixId: string) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for variant matrix deletion");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Remove from local state
          const index = this.variantMatrices.findIndex(matrix => matrix.id === matrixId);
          if (index !== -1) {
            this.variantMatrices.splice(index, 1);
            response = { data: { success: true } };
          } else {
            throw new Error(`Variant matrix with ID ${matrixId} not found`);
          }
        } else {
          // Use real API
          response = await attributesApi.deleteVariantMatrix(matrixId);
          
          // Refresh attributes
          await this.fetchAttributes();
        }
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while deleting variant matrix.';
        throw error;
      }
    },

    // Generate all possible variant combinations for a set of attributes
    generateVariantCombinations(attributeIds: string[], excludedCombinations: Record<string, any>[] = []) {
      let combinations: Record<string, any>[] = [{}];
      
      // For each attribute
      for (const attrId of attributeIds) {
        const attribute = this.attributes.find(attr => attr.id === attrId);
        if (!attribute || !attribute.options) continue;
        
        // Create new combinations with each option of the current attribute
        const newCombinations: Record<string, any>[] = [];
        
        for (const combination of combinations) {
          for (const option of attribute.options) {
            newCombinations.push({
              ...combination,
              [attrId]: option.value
            });
          }
        }
        
        combinations = newCombinations;
      }
      
      // Filter out excluded combinations
      if (excludedCombinations.length > 0) {
        combinations = combinations.filter(combination => {
          return !excludedCombinations.some(excluded => {
            return Object.entries(excluded).every(([key, value]) => 
              combination[key] === value
            );
          });
        });
      }
      
      // Filter by dependency rules
      combinations = combinations.filter(combination => 
        this.isValidVariantCombination(combination)
      );
      
      return combinations;
    },

    // Check if a combination is valid based on dependency rules
    isValidVariantCombination(combination: Record<string, any>) {
      // Go through each dependency rule
      for (const rule of this.attributeDependencyRules) {
        const { if: condition, then: result } = rule;
        
        // Check if the condition applies to this combination
        const attributeValue = combination[condition.attributeId];
        
        let conditionMet = false;
        
        // Simple condition checking
        switch (condition.condition) {
          case 'equals':
            conditionMet = attributeValue === condition.value;
            break;
          case 'notEquals':
            conditionMet = attributeValue !== condition.value;
            break;
          case 'in':
            conditionMet = Array.isArray(condition.value) && condition.value.includes(attributeValue);
            break;
          case 'notIn':
            conditionMet = !Array.isArray(condition.value) || !condition.value.includes(attributeValue);
            break;
          default:
            conditionMet = false;
        }
        
        // If condition is met, check the result
        if (conditionMet) {
          // For variant generation, we care about rules that would make a combination invalid
          if (result.action === 'disable' || result.action === 'hide') {
            return false;
          }
          
          // For setValue rules, check if the combination has the correct value
          if (result.action === 'setValue' && combination[result.attributeId] !== result.value) {
            return false;
          }
          
          // For setOptions rules, check if the combination's value is in the allowed options
          if (result.action === 'setOptions' && 
              Array.isArray(result.value) && 
              !result.value.includes(combination[result.attributeId])) {
            return false;
          }
        }
      }
      
      return true;
    },

    // Update attribute options
    async updateAttributeOptions(attributeId: string, options: AttributeOption[]) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for attribute options update");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Update local state
          const index = this.attributes.findIndex(attr => attr.id === attributeId);
          if (index !== -1) {
            this.attributes[index].options = options;
            response = { data: { data: this.attributes[index] } };
          } else {
            throw new Error(`Attribute with ID ${attributeId} not found`);
          }
        } else {
          // Use real API
          response = await attributesApi.updateAttributeOptions(attributeId, options);
          
          // Refresh attributes
          await this.fetchAttributes();
        }
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating attribute options.';
        throw error;
      }
    },

    // Create a dependency rule
    async createDependencyRule(rule: Omit<AttributeDependencyRule, 'id'>) {
      this.loading = true;
      this.error = null;
      
      try {
        const newRule: AttributeDependencyRule = {
          ...rule,
          id: uuidv4()
        };
        
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for dependency rule creation");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Add to local state
          this.attributeDependencyRules.push(newRule);
          
          response = { data: { data: newRule } };
        } else {
          // Use real API
          response = await attributesApi.createDependencyRule(newRule);
          
          // Refresh attributes
          await this.fetchAttributes();
        }
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while creating dependency rule.';
        throw error;
      }
    },

    // Validate an attribute value against its validation rules
    validateAttributeValue(attributeId: string, value: any) {
      const attribute = this.attributes.find(attr => attr.id === attributeId);
      if (!attribute) {
        return { isValid: false, message: 'Attribute not found' };
      }
      
      // Required validation
      if (attribute.isRequired && (value === undefined || value === null || value === '')) {
        return { isValid: false, message: 'This field is required' };
      }
      
      // Skip other validations if empty and not required
      if (value === undefined || value === null || value === '') {
        return { isValid: true };
      }
      
      // Custom validations
      if (attribute.validations) {
        for (const validation of attribute.validations) {
          const { type, params, message } = validation;
          
          switch (type) {
            case 'min':
              if (attribute.type === ATTRIBUTE_TYPES.NUMBER && value < params) {
                return { isValid: false, message };
              }
              if ((attribute.type === ATTRIBUTE_TYPES.TEXT || attribute.type === ATTRIBUTE_TYPES.TEXTAREA) && 
                  value.length < params) {
                return { isValid: false, message };
              }
              break;
              
            case 'max':
              if (attribute.type === ATTRIBUTE_TYPES.NUMBER && value > params) {
                return { isValid: false, message };
              }
              if ((attribute.type === ATTRIBUTE_TYPES.TEXT || attribute.type === ATTRIBUTE_TYPES.TEXTAREA) && 
                  value.length > params) {
                return { isValid: false, message };
              }
              break;
              
            case 'pattern':
              if ((attribute.type === ATTRIBUTE_TYPES.TEXT || attribute.type === ATTRIBUTE_TYPES.TEXTAREA) && 
                  !new RegExp(params).test(value)) {
                return { isValid: false, message };
              }
              break;
              
            case 'email':
              if (attribute.type === ATTRIBUTE_TYPES.TEXT && 
                  !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                return { isValid: false, message };
              }
              break;
              
            case 'url':
              if (attribute.type === ATTRIBUTE_TYPES.TEXT && 
                  !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value)) {
                return { isValid: false, message };
              }
              break;
              
            case 'enum':
              if ((attribute.type === ATTRIBUTE_TYPES.SELECT || attribute.type === ATTRIBUTE_TYPES.MULTISELECT) && 
                  !params.includes(value)) {
                return { isValid: false, message };
              }
              break;
              
            default:
              break;
          }
        }
      }
      
      return { isValid: true };
    }
  }
});