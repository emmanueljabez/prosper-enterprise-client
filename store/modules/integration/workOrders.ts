import { defineStore } from 'pinia';
import { mockWorkOrders } from '@/mock/mockWorkOrders';
import type { WorkOrder, WorkOrderState } from '@/types/integrations/workOrder';

export const useWorkOrdersStore = defineStore('workOrders', {
  state: (): WorkOrderState => ({
    workOrders: [],
    isLoading: false,
    error: null,
    useMockData: true // Default to mock data
  }),
  
  getters: {
    getWorkOrders: (state) => state.workOrders,
    getWorkOrderById: (state) => (id: string) => state.workOrders.find(order => order.id === id),
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    
    // Status getters
    getWorkOrdersByStatus: (state) => (status: string) => 
      state.workOrders.filter(order => order.status === status),
    getPlannedWorkOrders: (state) => 
      state.workOrders.filter(order => order.status === 'planned'),
    getInProgressWorkOrders: (state) => 
      state.workOrders.filter(order => order.status === 'in_progress'),
    getCompletedWorkOrders: (state) => 
      state.workOrders.filter(order => order.status === 'completed'),
    getCancelledWorkOrders: (state) => 
      state.workOrders.filter(order => order.status === 'cancelled'),
    getOnHoldWorkOrders: (state) => 
      state.workOrders.filter(order => order.status === 'on_hold'),
      
    // BOM related getters
    getWorkOrdersByBomId: (state) => (bomId: string) => 
      state.workOrders.filter(order => order.bomId === bomId),
    
    // Product related getters
    getWorkOrdersByProductId: (state) => (productId: string) => 
      state.workOrders.filter(order => order.productId === productId),
      
    // Material status getters
    getWorkOrdersByMaterialStatus: (state) => (status: string) => 
      state.workOrders.filter(order => order.materialStatus === status),
      
    // Stats
    getTotalPlannedQuantity: (state) => 
      state.workOrders.reduce((total, order) => 
        order.status !== 'cancelled' ? total + order.quantity : total, 0),
        
    getTotalCompletedQuantity: (state) => 
      state.workOrders.reduce((total, order) => total + (order.completed || 0), 0),
      
    getTotalRejectedQuantity: (state) => 
      state.workOrders.reduce((total, order) => total + (order.rejected || 0), 0),
      
    getAverageCompletionRate: (state) => {
      const completedOrders = state.workOrders.filter(o => o.status === 'completed');
      if (completedOrders.length === 0) return 0;
      
      const totalCompleted = completedOrders.reduce((sum, o) => sum + o.completed, 0);
      const totalPlanned = completedOrders.reduce((sum, o) => sum + o.quantity, 0);
      
      return totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0;
    }
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    // Work Order CRUD operations
    async fetchWorkOrders() {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          this.workOrders = [...mockWorkOrders];
        } else {
          // Real API call would go here
          const response = await fetch('/api/work-orders');
          if (!response.ok) throw new Error('Failed to fetch work orders');
          this.workOrders = await response.json();
        }
        
        this.isLoading = false;
        return this.workOrders;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async fetchWorkOrder(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let workOrder;
        
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          workOrder = mockWorkOrders.find(order => order.id === id);
          
          if (!workOrder) {
            throw new Error(`Work order with ID ${id} not found`);
          }
        } else {
          // Real API call would go here
          const response = await fetch(`/api/work-orders/${id}`);
          if (!response.ok) throw new Error(`Failed to fetch work order with ID ${id}`);
          workOrder = await response.json();
        }
        
        this.isLoading = false;
        return workOrder;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async createWorkOrder(newWorkOrder: Partial<WorkOrder>) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let createdWorkOrder;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Generate new ID and add timestamps
          const orderNumber = `WO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
          
          createdWorkOrder = {
            ...newWorkOrder,
            id: `wo-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            orderNumber,
            status: newWorkOrder.status || 'planned',
            materialStatus: newWorkOrder.materialStatus || 'pending',
            completed: 0,
            rejected: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            materials: newWorkOrder.materials || [],
            operations: newWorkOrder.operations || []
          } as WorkOrder;
          
          this.workOrders.push(createdWorkOrder);
        } else {
          // Real API call would go here
          const response = await fetch('/api/work-orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newWorkOrder)
          });
          
          if (!response.ok) throw new Error('Failed to create work order');
          createdWorkOrder = await response.json();
          this.workOrders.push(createdWorkOrder);
        }
        
        this.isLoading = false;
        return createdWorkOrder;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async updateWorkOrder(updatedWorkOrder: Partial<WorkOrder> & { id: string }) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let resultWorkOrder;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update the work order in the array
          const index = this.workOrders.findIndex(order => order.id === updatedWorkOrder.id);
          if (index === -1) throw new Error('Work order not found');
          
          // Update timestamp
          resultWorkOrder = {
            ...this.workOrders[index],
            ...updatedWorkOrder,
            updatedAt: new Date().toISOString()
          };
          
          this.workOrders[index] = resultWorkOrder;
        } else {
          // Real API call would go here
          const response = await fetch(`/api/work-orders/${updatedWorkOrder.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedWorkOrder)
          });
          
          if (!response.ok) throw new Error('Failed to update work order');
          resultWorkOrder = await response.json();
          
          const index = this.workOrders.findIndex(order => order.id === updatedWorkOrder.id);
          if (index !== -1) {
            this.workOrders[index] = resultWorkOrder;
          }
        }
        
        this.isLoading = false;
        return resultWorkOrder;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async deleteWorkOrder(workOrderId: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if work order exists
          const index = this.workOrders.findIndex(order => order.id === workOrderId);
          if (index === -1) throw new Error('Work order not found');
          
          // Remove the work order from the array
          this.workOrders = this.workOrders.filter(order => order.id !== workOrderId);
        } else {
          // Real API call would go here
          const response = await fetch(`/api/work-orders/${workOrderId}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete work order');
          
          // Remove the work order from the array
          this.workOrders = this.workOrders.filter(order => order.id !== workOrderId);
        }
        
        this.isLoading = false;
        return { success: true };
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async updateWorkOrderStatus(workOrderId: string, status: string, notes: string = '') {
      this.isLoading = true;
      this.error = null;
      
      try {
        let updatedWorkOrder;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find and update the work order
          const index = this.workOrders.findIndex(order => order.id === workOrderId);
          if (index === -1) throw new Error('Work order not found');
          
          const currentTime = new Date().toISOString();
          updatedWorkOrder = {
            ...this.workOrders[index],
            status,
            notes: notes ? `${this.workOrders[index].notes || ''}\n${notes}` : this.workOrders[index].notes,
            updatedAt: currentTime
          };
          
          // Add additional timestamps based on status
          if (status === 'in_progress' && !updatedWorkOrder.actualStartDate) {
            updatedWorkOrder.actualStartDate = currentTime;
          } else if (status === 'completed' && !updatedWorkOrder.actualEndDate) {
            updatedWorkOrder.actualEndDate = currentTime;
            updatedWorkOrder.completedAt = currentTime;
          }
          
          this.workOrders[index] = updatedWorkOrder;
        } else {
          // Real API call would go here
          const response = await fetch(`/api/work-orders/${workOrderId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, notes })
          });
          
          if (!response.ok) throw new Error('Failed to update work order status');
          updatedWorkOrder = await response.json();
          
          const index = this.workOrders.findIndex(order => order.id === workOrderId);
          if (index !== -1) {
            this.workOrders[index] = updatedWorkOrder;
          }
        }
        
        this.isLoading = false;
        return updatedWorkOrder;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    },
    
    async updateCompletionQuantities(workOrderId: string, completed: number, rejected: number = 0) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let updatedWorkOrder;
        
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find and update the work order
          const index = this.workOrders.findIndex(order => order.id === workOrderId);
          if (index === -1) throw new Error('Work order not found');
          
          updatedWorkOrder = {
            ...this.workOrders[index],
            completed,
            rejected,
            updatedAt: new Date().toISOString()
          };
          
          // Auto-complete if all items are finished
          if (completed >= updatedWorkOrder.quantity && updatedWorkOrder.status !== 'completed') {
            updatedWorkOrder.status = 'completed';
            updatedWorkOrder.completedAt = new Date().toISOString();
          }
          
          this.workOrders[index] = updatedWorkOrder;
        } else {
          // Real API call would go here
          const response = await fetch(`/api/work-orders/${workOrderId}/completion`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed, rejected })
          });
          
          if (!response.ok) throw new Error('Failed to update completion quantities');
          updatedWorkOrder = await response.json();
          
          const index = this.workOrders.findIndex(order => order.id === workOrderId);
          if (index !== -1) {
            this.workOrders[index] = updatedWorkOrder;
          }
        }
        
        this.isLoading = false;
        return updatedWorkOrder;
      } catch (error) {
        this.isLoading = false;
        this.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    }
  }
});