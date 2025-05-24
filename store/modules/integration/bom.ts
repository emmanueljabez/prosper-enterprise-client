import { defineStore } from 'pinia';
import { mockBoms } from '@/mock/mockBomData';
import type { Bom, BomComponent, BomStep, QualityCheck, BomAttachment, BomState } from '@/types/integrations/bom';



export const useBomsStore = defineStore('boms', {
  state: (): BomState => ({
    boms: [],
    isLoading: false,
    error: null,
    useMockData: true // Default to mock data
  }),
  
  getters: {
    getBoms: (state) => state.boms,
    getBomById: (state) => (id: string) => state.boms.find(bom => bom.id === id),
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    
    // BOM status getters
    getActiveBoms: (state) => state.boms.filter(bom => bom.status === 'active'),
    getDraftBoms: (state) => state.boms.filter(bom => bom.status === 'draft'),
    getArchivedBoms: (state) => state.boms.filter(bom => bom.status === 'archived'),
    getBomsByStatus: (state) => (status: string) => state.boms.filter(bom => bom.status === status),
    
    // Product-related getters
    getBomsByProductId: (state) => (productId: string) => 
      state.boms.filter(bom => bom.productId === productId),
    
    // Component-related getters
    getComponentsByBomId: (state) => (bomId: string) => {
      const bom = state.boms.find(b => b.id === bomId);
      return bom ? bom.components : [];
    },
    
    getBomsByComponentItemId: (state) => (itemId: string) => 
      state.boms.filter(bom => 
        bom.components.some(component => component.itemId === itemId)
      ),
    
    // Steps-related getters
    getStepsByBomId: (state) => (bomId: string) => {
      const bom = state.boms.find(b => b.id === bomId);
      return bom ? bom.steps : [];
    },
    
    // Quality checks getters
    getQualityChecksByBomId: (state) => (bomId: string) => {
      const bom = state.boms.find(b => b.id === bomId);
      return bom ? bom.qualityChecks : [];
    },
    
    // Attachments getters
    getAttachmentsByBomId: (state) => (bomId: string) => {
      const bom = state.boms.find(b => b.id === bomId);
      return bom ? bom.attachments : [];
    },
    
    // Stats getters
    getTotalComponentsCount: (state) => {
      return state.boms.reduce((total, bom) => {
        return total + bom.components.reduce((sum, comp) => sum + comp.quantity, 0);
      }, 0);
    },
    
    getTotalStepsCount: (state) => {
      return state.boms.reduce((total, bom) => total + (bom.steps?.length || 0), 0);
    },
    
    getTotalQualityChecksCount: (state) => {
      return state.boms.reduce((total, bom) => total + (bom.qualityChecks?.length || 0), 0);
    },
    
    getAverageStepsPerBom: (state) => {
      if (state.boms.length === 0) return 0;
      return state.boms.reduce((total, bom) => total + (bom.steps?.length || 0), 0) / state.boms.length;
    }
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    // BOM CRUD operations
    async fetchBoms() {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          this.boms = [...mockBoms];
        } else {
          // Real API call would go here
          const response = await fetch('/api/boms');
          if (!response.ok) throw new Error('Failed to fetch BOMs');
          this.boms = await response.json();
        }
        
        this.isLoading = false;
        return this.boms;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async fetchBom(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let bom;
        
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          bom = mockBoms.find(bom => bom.id === id);
          
          if (!bom) {
            throw new Error(`BOM with ID ${id} not found`);
          }
        } else {
          // Real API call would go here
          const response = await fetch(`/api/boms/${id}`);
          if (!response.ok) throw new Error(`Failed to fetch BOM with ID ${id}`);
          bom = await response.json();
        }
        
        this.isLoading = false;
        return bom;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async createBom(newBom: Partial<Bom>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let createdBom;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Generate new ID and add timestamps
          createdBom = {
            ...newBom,
            id: `bom-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            components: newBom.components || [],
            steps: newBom.steps || [],
            qualityChecks: newBom.qualityChecks || [],
            attachments: newBom.attachments || []
          } as Bom;
          
          this.boms.push(createdBom);
        } else {
          // Real API call would go here
          const response = await fetch('/api/boms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBom)
          });
          
          if (!response.ok) throw new Error('Failed to create BOM');
          createdBom = await response.json();
          this.boms.push(createdBom);
        }
        
        this.isLoading = false;
        return createdBom;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async updateBom(updatedBom: Partial<Bom> & { id: string }) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let resultBom;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update the BOM in the array
          const index = this.boms.findIndex(bom => bom.id === updatedBom.id);
          if (index === -1) throw new Error('BOM not found');
          
          // Update timestamp
          resultBom = {
            ...this.boms[index],
            ...updatedBom,
            updatedAt: new Date().toISOString()
          };
          
          this.boms[index] = resultBom;
        } else {
          // Real API call would go here
          const response = await fetch(`/api/boms/${updatedBom.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedBom)
          });
          
          if (!response.ok) throw new Error('Failed to update BOM');
          resultBom = await response.json();
          
          const index = this.boms.findIndex(bom => bom.id === updatedBom.id);
          if (index !== -1) {
            this.boms[index] = resultBom;
          }
        }
        
        this.isLoading = false;
        return resultBom;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async deleteBom(bomId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if BOM exists
          const index = this.boms.findIndex(bom => bom.id === bomId);
          if (index === -1) throw new Error('BOM not found');
          
          // Remove the BOM from the array
          this.boms = this.boms.filter(bom => bom.id !== bomId);
        } else {
          // Real API call would go here
          const response = await fetch(`/api/boms/${bomId}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete BOM');
          
          // Remove the BOM from the array
          this.boms = this.boms.filter(bom => bom.id !== bomId);
        }
        
        this.isLoading = false;
        return { success: true };
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async updateBomStatus(bomId: string, status: 'draft' | 'active' | 'archived', reason: string = '') {
      this.isLoading = true;
      this.error = null;
      
      try {
        let updatedBom;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find and update the BOM
          const index = this.boms.findIndex(bom => bom.id === bomId);
          if (index === -1) throw new Error('BOM not found');
          
          updatedBom = {
            ...this.boms[index],
            status,
            notes: reason ? `${this.boms[index].notes}\nStatus changed to ${status}: ${reason}` : this.boms[index].notes,
            updatedAt: new Date().toISOString()
          };
          
          this.boms[index] = updatedBom;
        } else {
          // Real API call would go here
          const response = await fetch(`/api/boms/${bomId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, reason })
          });
          
          if (!response.ok) throw new Error('Failed to update BOM status');
          updatedBom = await response.json();
          
          const index = this.boms.findIndex(bom => bom.id === bomId);
          if (index !== -1) {
            this.boms[index] = updatedBom;
          }
        }
        
        this.isLoading = false;
        return updatedBom;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async addBomComponent(bomId: string, component: Partial<BomComponent>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let updatedBom;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the BOM
          const index = this.boms.findIndex(bom => bom.id === bomId);
          if (index === -1) throw new Error('BOM not found');
          
          // Create a deep copy of the BOM
          const bomCopy = JSON.parse(JSON.stringify(this.boms[index]));
          
          // Add the component
          bomCopy.components.push(component);
          bomCopy.updatedAt = new Date().toISOString();
          
          updatedBom = bomCopy;
          this.boms[index] = updatedBom;
        } else {
          // Real API call would go here
          const response = await fetch(`/api/boms/${bomId}/components`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(component)
          });
          
          if (!response.ok) throw new Error('Failed to add BOM component');
          updatedBom = await response.json();
          
          const index = this.boms.findIndex(bom => bom.id === bomId);
          if (index !== -1) {
            this.boms[index] = updatedBom;
          }
        }
        
        this.isLoading = false;
        return updatedBom;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async updateBomComponent(bomId: string, componentIndex: number, updatedComponent: Partial<BomComponent>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let updatedBom;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the BOM
          const bomIndex = this.boms.findIndex(bom => bom.id === bomId);
          if (bomIndex === -1) throw new Error('BOM not found');
          
          // Create a deep copy of the BOM
          const bomCopy = JSON.parse(JSON.stringify(this.boms[bomIndex]));
          
          // Check if component exists
          if (componentIndex < 0 || componentIndex >= bomCopy.components.length) {
            throw new Error('Component not found in BOM');
          }
          
          // Update the component
          bomCopy.components[componentIndex] = {
            ...bomCopy.components[componentIndex],
            ...updatedComponent
          };
          
          bomCopy.updatedAt = new Date().toISOString();
          
          updatedBom = bomCopy;
          this.boms[bomIndex] = updatedBom;
        } else {
          // Real API call would go here
          const response = await fetch(`/api/boms/${bomId}/components/${componentIndex}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedComponent)
          });
          
          if (!response.ok) throw new Error('Failed to update BOM component');
          updatedBom = await response.json();
          
          const index = this.boms.findIndex(bom => bom.id === bomId);
          if (index !== -1) {
            this.boms[index] = updatedBom;
          }
        }
        
        this.isLoading = false;
        return updatedBom;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async removeBomComponent(bomId: string, componentIndex: number) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let updatedBom;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the BOM
          const bomIndex = this.boms.findIndex(bom => bom.id === bomId);
          if (bomIndex === -1) throw new Error('BOM not found');
          
          // Create a deep copy of the BOM
          const bomCopy = JSON.parse(JSON.stringify(this.boms[bomIndex]));
          
          // Check if component exists
          if (componentIndex < 0 || componentIndex >= bomCopy.components.length) {
            throw new Error('Component not found in BOM');
          }
          
          // Remove the component
          bomCopy.components.splice(componentIndex, 1);
          bomCopy.updatedAt = new Date().toISOString();
          
          updatedBom = bomCopy;
          this.boms[bomIndex] = updatedBom;
        } else {
          // Real API call would go here
          const response = await fetch(`/api/boms/${bomId}/components/${componentIndex}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to remove BOM component');
          updatedBom = await response.json();
          
          const index = this.boms.findIndex(bom => bom.id === bomId);
          if (index !== -1) {
            this.boms[index] = updatedBom;
          }
        }
        
        this.isLoading = false;
        return updatedBom;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async addBomStep(bomId: string, step: Partial<BomStep>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let updatedBom;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the BOM
          const index = this.boms.findIndex(bom => bom.id === bomId);
          if (index === -1) throw new Error('BOM not found');
          
          // Create a deep copy of the BOM
          const bomCopy = JSON.parse(JSON.stringify(this.boms[index]));
          
          // Add the step
          if (!bomCopy.steps) bomCopy.steps = [];
          bomCopy.steps.push(step);
          bomCopy.updatedAt = new Date().toISOString();
          
          updatedBom = bomCopy;
          this.boms[index] = updatedBom;
        } else {
          // Real API call would go here
          const response = await fetch(`/api/boms/${bomId}/steps`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(step)
          });
          
          if (!response.ok) throw new Error('Failed to add BOM step');
          updatedBom = await response.json();
          
          const index = this.boms.findIndex(bom => bom.id === bomId);
          if (index !== -1) {
            this.boms[index] = updatedBom;
          }
        }
        
        this.isLoading = false;
        return updatedBom;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async addQualityCheck(bomId: string, qualityCheck: Partial<QualityCheck>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let updatedBom;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the BOM
          const index = this.boms.findIndex(bom => bom.id === bomId);
          if (index === -1) throw new Error('BOM not found');
          
          // Create a deep copy of the BOM
          const bomCopy = JSON.parse(JSON.stringify(this.boms[index]));
          
          // Add the quality check
          if (!bomCopy.qualityChecks) bomCopy.qualityChecks = [];
          bomCopy.qualityChecks.push(qualityCheck);
          bomCopy.updatedAt = new Date().toISOString();
          
          updatedBom = bomCopy;
          this.boms[index] = updatedBom;
        } else {
          // Real API call would go here
          const response = await fetch(`/api/boms/${bomId}/quality-checks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(qualityCheck)
          });
          
          if (!response.ok) throw new Error('Failed to add quality check');
          updatedBom = await response.json();
          
          const index = this.boms.findIndex(bom => bom.id === bomId);
          if (index !== -1) {
            this.boms[index] = updatedBom;
          }
        }
        
        this.isLoading = false;
        return updatedBom;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async addAttachment(bomId: string, attachment: Partial<BomAttachment>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let updatedBom;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the BOM
          const index = this.boms.findIndex(bom => bom.id === bomId);
          if (index === -1) throw new Error('BOM not found');
          
          // Create a deep copy of the BOM
          const bomCopy = JSON.parse(JSON.stringify(this.boms[index]));
          
          // Add the attachment with additional metadata
          const fullAttachment = {
            ...attachment,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'current-user' // In a real app, this would be from auth
          };
          
          if (!bomCopy.attachments) bomCopy.attachments = [];
          bomCopy.attachments.push(fullAttachment);
          bomCopy.updatedAt = new Date().toISOString();
          
          updatedBom = bomCopy;
          this.boms[index] = updatedBom;
        } else {
          // Real API call would go here
          const response = await fetch(`/api/boms/${bomId}/attachments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(attachment)
          });
          
          if (!response.ok) throw new Error('Failed to add attachment');
          updatedBom = await response.json();
          
          const index = this.boms.findIndex(bom => bom.id === bomId);
          if (index !== -1) {
            this.boms[index] = updatedBom;
          }
        }
        
        this.isLoading = false;
        return updatedBom;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async duplicateBom(bomId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let duplicatedBom;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the BOM to duplicate
          const originalBom = this.boms.find(bom => bom.id === bomId);
          if (!originalBom) throw new Error('BOM not found');
          
          // Create a deep copy
          const bomCopy = JSON.parse(JSON.stringify(originalBom));
          
          // Update fields for the duplicate
          duplicatedBom = {
            ...bomCopy,
            id: `bom-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            name: `${originalBom.name} (Copy)`,
            version: `${originalBom.version}-copy`,
            status: 'draft', // Always start as draft
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'current-user' // In a real app, this would be from auth
          };
          
          this.boms.push(duplicatedBom);
        } else {
          // Real API call would go here
          const response = await fetch(`/api/boms/${bomId}/duplicate`, {
            method: 'POST'
          });
          
          if (!response.ok) throw new Error('Failed to duplicate BOM');
          duplicatedBom = await response.json();
          this.boms.push(duplicatedBom);
        }
        
        this.isLoading = false;
        return duplicatedBom;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    }
  }
});