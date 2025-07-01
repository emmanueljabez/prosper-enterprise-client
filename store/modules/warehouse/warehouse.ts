import { defineStore } from 'pinia';
import { 
  mockIncomingShipments, 
  mockQualityInspections, 
  mockQualityChecklists,
  mockPutawayTasks,
  mockPickPaths,
  mockPickingTasks,
  mockPackingStations,
  mockPackagingMaterials,
  mockPackingTasks,
  mockShippingCarriers,
  mockShipments
} from '@/mock/mockWarehouseData.js';

import type { 
  IncomingShipment, 
  QualityInspection, 
  QualityChecklist,
  PutawayTask,
  PickPath,
  PickingTask,
  PackingStation,
  PackagingMaterial,
  PackingTask,
  ShippingCarrier,
  Shipment,
  Status,
  Priority,
  QCStatus
} from '@/types/warehouse/warehouse';

import warehouseApi from '@/http/requests/app/warehouse/warehouse';

// Determine if we're in development environment
const config = useRuntimeConfig() 
const environment = config.public.nodeEnv
const isDev = environment === 'development';

// Define warehouse state type
interface WarehouseState {
  incomingShipments: IncomingShipment[];
  qualityInspections: QualityInspection[];
  qualityChecklists: QualityChecklist[];
  putawayTasks: PutawayTask[];
  pickPaths: PickPath[];
  pickingTasks: PickingTask[];
  packingStations: PackingStation[];
  packagingMaterials: PackagingMaterial[];
  packingTasks: PackingTask[];
  shippingCarriers: ShippingCarrier[];
  shipments: Shipment[];
  isLoading: boolean;
  error: string | null;
  useMockData: boolean;
}

export const useWarehouseStore = defineStore('warehouse', {
  state: (): WarehouseState => ({
    incomingShipments: [],
    qualityInspections: [],
    qualityChecklists: [],
    putawayTasks: [],
    pickPaths: [],
    pickingTasks: [],
    packingStations: [],
    packagingMaterials: [],
    packingTasks: [],
    shippingCarriers: [],
    shipments: [],
    isLoading: false,
    error: null,
    useMockData: isDev // Default to mock data in development
  }),
  
  getters: {
    // Incoming Shipments
    getIncomingShipments: (state) => state.incomingShipments,
    getShipmentById: (state) => (id: string) => state.incomingShipments.find(shipment => shipment.id === id),
    getScheduledShipments: (state) => state.incomingShipments.filter(shipment => shipment.status === 'scheduled'),
    getInTransitShipments: (state) => state.incomingShipments.filter(shipment => shipment.status === 'in_transit'),
    getRecentlyReceivedShipments: (state) => state.incomingShipments.filter(shipment => 
      shipment.status === 'received' || shipment.status === 'completed'
    ),
    
    // Quality Inspections
    getQualityInspections: (state) => state.qualityInspections,
    getInspectionById: (state) => (id: string) => state.qualityInspections.find(inspection => inspection.id === id),
    getPendingInspections: (state) => state.qualityInspections.filter(inspection => inspection.status === 'pending'),
    getHighPriorityInspections: (state) => state.qualityInspections.filter(inspection => 
      inspection.priority === 'high' && inspection.status === 'pending'
    ),
    
    // Picking
    getPickingTasks: (state) => state.pickingTasks,
    getPickTaskById: (state) => (id: string) => state.pickingTasks.find(task => task.id === id),
    getPendingPickTasks: (state) => state.pickingTasks.filter(task => task.status === 'pending'),
    getInProgressPickTasks: (state) => state.pickingTasks.filter(task => task.status === 'in_progress'),
    
    // Packing
    getPackingTasks: (state) => state.packingTasks,
    getPackTaskById: (state) => (id: string) => state.packingTasks.find(task => task.id === id),
    getPendingPackTasks: (state) => state.packingTasks.filter(task => task.status === 'pending'),
    getInProgressPackTasks: (state) => state.packingTasks.filter(task => task.status === 'in_progress'),
    
    // Shipping
    getShipments: (state) => state.shipments,
    getShipmentDetailsById: (state) => (id: string) => state.shipments.find(shipment => shipment.id === id),
    getRecentShipments: (state) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return state.shipments.filter(shipment => new Date(shipment.createdAt) >= sevenDaysAgo);
    },
    
    // Additional Getters
    getPendingShipments: (state) => state.shipments.filter(shipment => 
      ['pending', 'label_created'].includes(shipment.status)
    ),
    getProcessingShipments: (state) => state.shipments.filter(shipment => 
      ['processing'].includes(shipment.status)
    ),
    getShippedShipments: (state) => state.shipments.filter(shipment => 
      ['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(shipment.status)
    ),
    getShipmentsShippedToday: (state) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return state.shipments.filter(shipment => {
        if (shipment.shippedAt) {
          const shippedDate = new Date(shipment.shippedAt);
          shippedDate.setHours(0, 0, 0, 0);
          return shipment.status === 'shipped' && shippedDate.getTime() === today.getTime();
        }
        return false;
      });
    },
    getCarrierById: (state) => (id: string) => state.shippingCarriers.find(carrier => carrier.id === id),
    getActiveCarriers: (state) => state.shippingCarriers.filter(carrier => carrier.active),
    getTrackingEvents: (state) => (id: string) => {
      const shipment = state.shipments.find(s => s.id === id);
      return shipment?.events || [];
    }
  },
  
  actions: {    setUseMockData(useMock: boolean): void {
      this.useMockData = useMock;
    },
    
    // ======== RECEIVING OPERATIONS ========
    async fetchIncomingShipments(params = {}): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 500));
          response = { success: true, shipments: [...mockIncomingShipments] };
        } else {
          response = await warehouseApi.fetchIncomingShipments(params);
        }
        
        if (response.success) {
          this.incomingShipments = response.shipments;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch incoming shipments';
        throw error;
      }
    },
    
    async createIncomingShipment(shipmentData: Partial<IncomingShipment>): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Generate new ID and add timestamps
          const createdShipment = {
            ...shipmentData,
            id: `rcv-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            status: 'scheduled' as Status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as IncomingShipment;
          
          response = { success: true, shipment: createdShipment };
        } else {
          response = await warehouseApi.createIncomingShipment(shipmentData);
        }
        
        if (response.success && response.shipment) {
          this.incomingShipments.push(response.shipment);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to create incoming shipment';
        throw error;
      }
    },
    
    async receiveShipment(id: string, receivingData: any): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 700));
          
          const index = this.incomingShipments.findIndex(shipment => shipment.id === id);
          if (index === -1) throw new Error('Shipment not found');
          
          const updatedShipment = {
            ...this.incomingShipments[index],
            status: 'received' as Status,
            actualArrival: new Date().toISOString(),
            receivedBy: receivingData.userId,
            updatedAt: new Date().toISOString()
          };
          
          // Update received quantities
          if (receivingData.items && Array.isArray(receivingData.items)) {
            updatedShipment.items = updatedShipment.items.map(item => {
              const receivedItem = receivingData.items.find((ri: any) => ri.itemId === item.itemId);
              if (receivedItem) {
                return {
                  ...item,
                  receivedQuantity: receivedItem.receivedQuantity,
                  qualityCheckStatus: receivedItem.qualityCheckRequired ? 'pending' : undefined
                };
              }
              return item;
            });
          }
          
          response = { success: true, shipment: updatedShipment };
          
          // Create quality inspection tasks if needed
          if (receivingData.createQualityInspections) {
            updatedShipment.items.forEach(item => {
              if (item.qualityCheckStatus === 'pending') {
                const inspection: QualityInspection = {
                  id: `qi-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
                  shipmentId: id,
                  itemId: item.itemId,
                  itemName: item.name,
                  status: 'pending' as QCStatus,
                  priority: 'normal' as Priority,
                  inspectionType: 'receiving',
                  dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  createdAt: new Date().toISOString(),
                  poNumber: updatedShipment.poNumber
                };
                
                this.qualityInspections.push(inspection);
              }
            });
          }
        } else {
          response = await warehouseApi.receiveShipment(id, receivingData);
        }
        
        if (response.success && response.shipment) {
          const index = this.incomingShipments.findIndex(shipment => shipment.id === id);
          if (index !== -1) {
            this.incomingShipments[index] = response.shipment;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to receive shipment';
        throw error;
      }
    },
    
    // ======== QUALITY CONTROL ========
    async fetchQualityInspections(params = {}): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          response = { success: true, inspections: [...mockQualityInspections] };
        } else {
          response = await warehouseApi.fetchQualityInspections(params);
        }
        
        if (response.success) {
          this.qualityInspections = response.inspections;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch quality inspections';
        throw error;
      }
    },
    
    async completeQualityInspection(id: string, results: any): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const index = this.qualityInspections.findIndex(inspection => inspection.id === id);
          if (index === -1) throw new Error('Inspection not found');
          
          const updatedInspection = {
            ...this.qualityInspections[index],
            status: results.passed ? 'passed' : 'failed' as QCStatus,
            results: results.checkResults,
            decision: results.decision,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, inspection: updatedInspection };
          
          // Update the shipment item's quality check status
          if (updatedInspection.shipmentId && updatedInspection.itemId) {
            const shipmentIndex = this.incomingShipments.findIndex(
              shipment => shipment.id === updatedInspection.shipmentId
            );
            
            if (shipmentIndex !== -1) {
              const itemIndex = this.incomingShipments[shipmentIndex].items.findIndex(
                item => item.itemId === updatedInspection.itemId
              );
              
              if (itemIndex !== -1) {
                this.incomingShipments[shipmentIndex].items[itemIndex].qualityCheckStatus = 
                  updatedInspection.status;
              }
            }
          }
        } else {
          response = await warehouseApi.completeInspection(id, results);
        }
        
        if (response.success && response.inspection) {
          const index = this.qualityInspections.findIndex(inspection => inspection.id === id);
          if (index !== -1) {
            this.qualityInspections[index] = response.inspection;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to complete quality inspection';
        throw error;
      }
    },
    
    // ======== PICKING ========
    async fetchPickingTasks(params = {}): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 500));
          response = { success: true, tasks: [...mockPickingTasks] };
        } else {
          response = await warehouseApi.fetchPickingTasks(params);
        }
        
        if (response.success) {
          this.pickingTasks = response.tasks;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch picking tasks';
        throw error;
      }
    },
    
    async assignPickTask(id: string, assigneeId: string): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const index = this.pickingTasks.findIndex(task => task.id === id);
          if (index === -1) throw new Error('Task not found');
          
          const updatedTask = {
            ...this.pickingTasks[index],
            assignedTo: assigneeId,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, task: updatedTask };
        } else {
          response = await warehouseApi.assignPickTask(id, assigneeId);
        }
        
        if (response.success && response.task) {
          const index = this.pickingTasks.findIndex(task => task.id === id);
          if (index !== -1) {
            this.pickingTasks[index] = response.task;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to assign picking task';
        throw error;
      }
    },
    
    async completePickTask(id: string, completionData: any): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const index = this.pickingTasks.findIndex(task => task.id === id);
          if (index === -1) throw new Error('Task not found');
          
          const updatedTask = {
            ...this.pickingTasks[index],
            status: 'completed' as Status,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Update picked quantities
          if (completionData.items && Array.isArray(completionData.items)) {
            updatedTask.items = updatedTask.items.map(item => {
              const pickedItem = completionData.items.find((pi: any) => pi.lineItemId === item.lineItemId);
              if (pickedItem) {
                return {
                  ...item,
                  pickedQuantity: pickedItem.pickedQuantity,
                  status: 'completed' as Status
                };
              }
              return item;
            });
          }
          
          response = { success: true, task: updatedTask };
          
          // Create packing task automatically if specified
          if (completionData.createPackingTask) {
            const packingTask: PackingTask = {
              id: `pack-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
              orderId: updatedTask.orderId,
              status: 'pending' as Status,
              priority: updatedTask.priority,
              pickCompleted: true,
              createdAt: new Date().toISOString(),
              dueDate: updatedTask.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              requiresCustomPackaging: false,
              items: updatedTask.items.map(item => ({
                lineItemId: item.lineItemId,
                itemId: item.itemId,
                sku: item.sku,
                name: item.name,
                quantity: item.pickedQuantity || 0
              }))
            };
            
            this.packingTasks.push(packingTask);
          }
        } else {
          response = await warehouseApi.completePickTask(id, completionData);
        }
        
        if (response.success && response.task) {
          const index = this.pickingTasks.findIndex(task => task.id === id);
          if (index !== -1) {
            this.pickingTasks[index] = response.task;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to complete picking task';
        throw error;
      }
    },
    
    // ======== PACKING ========
    async fetchPackingTasks(params = {}): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 500));
          response = { success: true, tasks: [...mockPackingTasks] };
        } else {
          response = await warehouseApi.fetchPackingTasks(params);
        }
        
        if (response.success) {
          this.packingTasks = response.tasks;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch packing tasks';
        throw error;
      }
    },
    
    async completePackingTask(id: string, completionData: any): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const index = this.packingTasks.findIndex(task => task.id === id);
          if (index === -1) throw new Error('Packing task not found');
          
          const updatedTask = {
            ...this.packingTasks[index],
            status: 'completed' as Status,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Update package information
          if (completionData.packages && Array.isArray(completionData.packages)) {
            updatedTask.packages = completionData.packages.map((pkg: any) => ({
              ...pkg,
              status: 'completed',
              shippingLabelPrinted: true
            }));
          }
          
          response = { success: true, task: updatedTask };
          
          // Create a shipment record
          if (updatedTask.packages && updatedTask.packages.length > 0) {
            const shipment = {
              id: `ship-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
              orderId: updatedTask.orderId,
              status: completionData.createLabelOnly ? 'label_created' : 'shipped' as Status,
              carrierId: completionData.carrierId,
              carrierName: completionData.carrierName,
              serviceId: completionData.serviceId,
              serviceName: completionData.serviceName,
              trackingNumber: completionData.trackingNumber || `TRK${Date.now().toString().slice(-7)}`,
              createdAt: new Date().toISOString(),
              shippedAt: completionData.createLabelOnly ? null : new Date().toISOString(),
              packages: updatedTask.packages,
              shipToAddress: completionData.shipToAddress
            };
            
            this.shipments.push(shipment);
          }
        } else {
          response = await warehouseApi.completePackingTask(id, completionData);
        }
        
        if (response.success && response.task) {
          const index = this.packingTasks.findIndex(task => task.id === id);
          if (index !== -1) {
            this.packingTasks[index] = response.task;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to complete packing task';
        throw error;
      }
    },
    
    // ======== SHIPPING ========
    async fetchShipments(params = {}): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 500));
          response = { success: true, shipments: [...mockShipments] };
        } else {
          response = await warehouseApi.fetchShipments(params);
        }
        
        if (response.success) {
          this.shipments = response.shipments;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch shipments';
        throw error;
      }
    },
    
    async fetchShippingCarriers(): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          response = { success: true, carriers: [...mockShippingCarriers] };
        } else {
          response = await warehouseApi.fetchShippingCarriers();
        }
        
        if (response.success) {
          this.shippingCarriers = response.carriers;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch shipping carriers';
        throw error;
      }
    },
    
    async getShippingRates(packageData: any): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 700));
          
          // Create mock shipping rates based on carriers
          const rates = [];
          
          if (packageData.carriers.includes('fedex')) {
            rates.push({
              carrierId: 'fedex',
              carrierName: 'FedEx',
              serviceId: 'fedex-ground',
              serviceName: 'FedEx Ground',
              rate: 12.99,
              currency: 'USD',
              estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              transitDays: '2-3'
            });
            
            rates.push({
              carrierId: 'fedex',
              carrierName: 'FedEx',
              serviceId: 'fedex-express',
              serviceName: 'FedEx Express',
              rate: 24.99,
              currency: 'USD',
              estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
              transitDays: '1'
            });
          }
          
          if (packageData.carriers.includes('ups')) {
            rates.push({
              carrierId: 'ups',
              carrierName: 'UPS',
              serviceId: 'ups-ground',
              serviceName: 'UPS Ground',
              rate: 11.99,
              currency: 'USD',
              estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              transitDays: '2-3'
            });
          }
          
          response = { success: true, rates };
        } else {
          response = await warehouseApi.getShippingRates(packageData);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to get shipping rates';
        throw error;
      }
    },
    
    // Initialize data store
    async initialize(): Promise<void> {
      if (this.useMockData) {
        this.incomingShipments = [...mockIncomingShipments];
        this.qualityInspections = [...mockQualityInspections];
        this.qualityChecklists = [...mockQualityChecklists];
        this.putawayTasks = [...mockPutawayTasks];
        this.pickPaths = [...mockPickPaths];
        this.pickingTasks = [...mockPickingTasks];
        this.packingStations = [...mockPackingStations];
        this.packagingMaterials = [...mockPackagingMaterials];
        this.packingTasks = [...mockPackingTasks];
        this.shippingCarriers = [...mockShippingCarriers];
        this.shipments = [...mockShipments];
      } else {
        try {
          await Promise.all([
            this.fetchIncomingShipments(),
            this.fetchQualityInspections(),
            this.fetchPickingTasks(),
            this.fetchPackingTasks(),
            this.fetchShipments(),
            this.fetchShippingCarriers(),
            this.fetchPickPaths(),        // Add this
            this.fetchPackingStations(),  // Add this
            this.fetchPackagingMaterials() // Add this
          ]);
        } catch (error) {
          console.error('Failed to initialize warehouse store:', error);
        }
      }
    },
    
    async fetchPickPaths(params = {}): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 400));
          response = { success: true, pickPaths: [...mockPickPaths] };
        } else {
          response = await warehouseApi.fetchPickPaths(params);
        }
        
        if (response.success) {
          this.pickPaths = response.pickPaths;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch pick paths';
        throw error;
      }
    },
    
    async fetchPackingStations(params = {}): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 400));
          response = { success: true, stations: [...mockPackingStations] };
        } else {
          response = await warehouseApi.fetchPackingStations(params);
        }
        
        if (response.success) {
          this.packingStations = response.stations;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch packing stations';
        throw error;
      }
    },
    
    async fetchPackagingMaterials(params = {}): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 400));
          response = { success: true, materials: [...mockPackagingMaterials] };
        } else {
          response = await warehouseApi.fetchPackagingMaterials(params);
        }
        
        if (response.success) {
          this.packagingMaterials = response.materials;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch packaging materials';
        throw error;
      }
    },
    
    // ======== SHIPPING OPERATIONS ========
    async createShipment(shipmentData: Partial<Shipment>): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 600));
          
          // Generate new ID and add timestamps
          const createdShipment = {
            ...shipmentData,
            id: `ship-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            status: 'pending' as Status,
            createdAt: new Date().toISOString(),
            events: [
              {
                timestamp: new Date().toISOString(),
                status: 'created',
                description: 'Shipment created',
                location: 'Warehouse'
              }
            ]
          } as Shipment;
          
          response = { success: true, shipment: createdShipment };
        } else {
          response = await warehouseApi.createShipment(shipmentData);
        }
        
        if (response.success && response.shipment) {
          this.shipments.push(response.shipment);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to create shipment';
        throw error;
      }
    },
    
    async processShipment(id: string): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 700));
          
          const index = this.shipments.findIndex(shipment => shipment.id === id);
          if (index === -1) throw new Error('Shipment not found');
          
          const updatedShipment = {
            ...this.shipments[index],
            status: 'processing' as Status,
            updatedAt: new Date().toISOString()
          };
          
          // Add event to tracking history
          if (!updatedShipment.events) {
            updatedShipment.events = [];
          }
          
          updatedShipment.events.push({
            timestamp: new Date().toISOString(),
            status: 'processing',
            description: 'Shipment processing started',
            location: 'Warehouse'
          });
          
          response = { success: true, shipment: updatedShipment };
        } else {
          response = await warehouseApi.processShipment(id);
        }
        
        if (response.success && response.shipment) {
          const index = this.shipments.findIndex(shipment => shipment.id === id);
          if (index !== -1) {
            this.shipments[index] = response.shipment;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to process shipment';
        throw error;
      }
    },
    
    async updateShipmentStatus(id: string, status: Status): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 400));
          
          const index = this.shipments.findIndex(shipment => shipment.id === id);
          if (index === -1) throw new Error('Shipment not found');
          
          const updatedShipment = {
            ...this.shipments[index],
            status: status,
            updatedAt: new Date().toISOString()
          };
          
          // Add event to tracking history
          if (!updatedShipment.events) {
            updatedShipment.events = [];
          }
          
          updatedShipment.events.push({
            timestamp: new Date().toISOString(),
            status: status,
            description: `Status updated to ${status}`,
            location: 'Warehouse'
          });
          
          // If status is shipped, add shipped timestamp
          if (status === 'shipped') {
            updatedShipment.shippedAt = new Date().toISOString();
            // Add 3-5 days for estimated delivery
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + 3 + Math.floor(Math.random() * 3));
            updatedShipment.estimatedDelivery = deliveryDate.toISOString();
          }
          
          response = { success: true, shipment: updatedShipment };
        } else {
          response = await warehouseApi.updateShipmentStatus(id, status);
        }
        
        if (response.success && response.shipment) {
          const index = this.shipments.findIndex(shipment => shipment.id === id);
          if (index !== -1) {
            this.shipments[index] = response.shipment;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update shipment status';
        throw error;
      }
    },
    
    async voidShippingLabel(id: string): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const index = this.shipments.findIndex(shipment => shipment.id === id);
          if (index === -1) throw new Error('Shipment not found');
          
          // Can only void if not shipped yet
          const shipment = this.shipments[index];
          if (shipment.status === 'shipped' || shipment.status === 'delivered') {
            throw new Error('Cannot void label for shipment that has already been shipped or delivered');
          }
          
          const updatedShipment = {
            ...shipment,
            status: 'voided' as Status,
            updatedAt: new Date().toISOString()
          };
          
          // Add event to tracking history
          if (!updatedShipment.events) {
            updatedShipment.events = [];
          }
          
          updatedShipment.events.push({
            timestamp: new Date().toISOString(),
            status: 'voided',
            description: 'Shipping label voided',
            location: 'Warehouse'
          });
          
          response = { success: true, shipment: updatedShipment };
        } else {
          response = await warehouseApi.voidShippingLabel(id);
        }
        
        if (response.success && response.shipment) {
          const index = this.shipments.findIndex(shipment => shipment.id === id);
          if (index !== -1) {
            this.shipments[index] = response.shipment;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to void shipping label';
        throw error;
      }
    },
    
    async cancelShipment(id: string): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const index = this.shipments.findIndex(shipment => shipment.id === id);
          if (index === -1) throw new Error('Shipment not found');
          
          // Can only cancel if not already shipped or delivered
          const shipment = this.shipments[index];
          if (shipment.status === 'delivered') {
            throw new Error('Cannot cancel shipment that has already been delivered');
          }
          
          const updatedShipment = {
            ...shipment,
            status: 'cancelled' as Status,
            updatedAt: new Date().toISOString()
          };
          
          // Add event to tracking history
          if (!updatedShipment.events) {
            updatedShipment.events = [];
          }
          
          updatedShipment.events.push({
            timestamp: new Date().toISOString(),
            status: 'cancelled',
            description: 'Shipment cancelled',
            location: 'Warehouse'
          });
          
          response = { success: true, shipment: updatedShipment };
        } else {
          response = await warehouseApi.cancelShipment(id);
        }
        
        if (response.success && response.shipment) {
          const index = this.shipments.findIndex(shipment => shipment.id === id);
          if (index !== -1) {
            this.shipments[index] = response.shipment;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to cancel shipment';
        throw error;
      }
    },
    
    async createReturnLabel(returnInfo: any): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Find original shipment
          const originalShipment = this.shipments.find(s => s.id === returnInfo.originalShipmentId);
          if (!originalShipment) throw new Error('Original shipment not found');
          
          // Create a return shipment
          const returnShipment = {
            id: `return-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            orderId: originalShipment.orderId,
            customerName: originalShipment.customerName,
            status: 'return_label_created' as Status,
            carrierId: returnInfo.carrierId || originalShipment.carrierId,
            carrierName: returnInfo.carrierName || originalShipment.carrierName,
            serviceId: returnInfo.serviceId || originalShipment.serviceId,
            serviceName: returnInfo.serviceName || originalShipment.serviceName,
            trackingNumber: `RTN${Date.now().toString().slice(-7)}`,
            createdAt: new Date().toISOString(),
            shipToAddress: returnInfo.returnToAddress,
            shipFromAddress: originalShipment.shipToAddress,
            isReturn: true,
            originalShipmentId: originalShipment.id,
            packages: returnInfo.packages || originalShipment.packages.map(pkg => ({
              ...pkg,
              trackingNumber: `RTN${Date.now().toString().slice(-7)}`,
              returnReason: returnInfo.reason
            })),
            returnReason: returnInfo.reason,
            shippingCost: returnInfo.shippingCost || 0,
            currency: 'USD',
            events: [
              {
                timestamp: new Date().toISOString(),
                status: 'return_label_created',
                description: 'Return shipping label created',
                location: 'Warehouse'
              }
            ]
          };
          
          response = { success: true, returnShipment };
        } else {
          response = await warehouseApi.createReturnLabel(returnInfo);
        }
        
        if (response.success && response.returnShipment) {
          this.shipments.push(response.returnShipment);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to create return label';
        throw error;
      }
    },
    
    async getShipmentTracking(id: string): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 600));
          
          const shipment = this.shipments.find(s => s.id === id);
          if (!shipment) throw new Error('Shipment not found');
          
          // If events already exist, return them
          if (shipment.events && shipment.events.length > 0) {
            response = { 
              success: true, 
              tracking: {
                trackingNumber: shipment.trackingNumber,
                carrierName: shipment.carrierName,
                status: shipment.status,
                estimatedDelivery: shipment.estimatedDelivery,
                events: shipment.events
              }
            };
          } else {
            // Create mock tracking events based on status
            const events = [];
            const now = new Date();
            
            events.push({
              timestamp: shipment.createdAt,
              status: 'label_created',
              description: 'Shipping label created',
              location: 'Warehouse'
            });
            
            if (['processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(shipment.status)) {
              const processedDate = new Date(now);
              processedDate.setHours(now.getHours() - 24);
              events.push({
                timestamp: processedDate.toISOString(),
                status: 'processing',
                description: 'Shipment processing started',
                location: 'Warehouse'
              });
            }
            
            if (['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(shipment.status)) {
              const shippedDate = new Date(now);
              shippedDate.setHours(now.getHours() - 20);
              events.push({
                timestamp: shippedDate.toISOString(),
                status: 'shipped',
                description: 'Picked up by carrier',
                location: 'Warehouse'
              });
            }
            
            if (['in_transit', 'out_for_delivery', 'delivered'].includes(shipment.status)) {
              const transitDate = new Date(now);
              transitDate.setHours(now.getHours() - 16);
              events.push({
                timestamp: transitDate.toISOString(),
                status: 'in_transit',
                description: 'In transit',
                location: 'Carrier facility'
              });
            }
            
            if (['out_for_delivery', 'delivered'].includes(shipment.status)) {
              const outForDeliveryDate = new Date(now);
              outForDeliveryDate.setHours(now.getHours() - 4);
              events.push({
                timestamp: outForDeliveryDate.toISOString(),
                status: 'out_for_delivery',
                description: 'Out for delivery',
                location: shipment.shipToAddress.city
              });
            }
            
            if (shipment.status === 'delivered') {
              const deliveredDate = new Date(now);
              deliveredDate.setHours(now.getHours() - 1);
              events.push({
                timestamp: deliveredDate.toISOString(),
                status: 'delivered',
                description: 'Delivered',
                location: `${shipment.shipToAddress.city}, ${shipment.shipToAddress.state}`
              });
            }
            
            response = { 
              success: true, 
              tracking: {
                trackingNumber: shipment.trackingNumber,
                carrierName: shipment.carrierName,
                status: shipment.status,
                estimatedDelivery: shipment.estimatedDelivery,
                events: events
              }
            };
          }
        } else {
          response = await warehouseApi.getShipmentTracking(id);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to get shipment tracking';
        throw error;
      }
    },
    
    async updateShippingCarrier(carrier: Partial<ShippingCarrier>): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const index = this.shippingCarriers.findIndex(c => c.id === carrier.id);
          if (index === -1) throw new Error('Carrier not found');
          
          const updatedCarrier = {
            ...this.shippingCarriers[index],
            ...carrier,
            updatedAt: new Date().toISOString()
          };
          
          response = { success: true, carrier: updatedCarrier };
        } else {
          response = await warehouseApi.updateShippingCarrier(carrier);
        }
        
        if (response.success && response.carrier) {
          const index = this.shippingCarriers.findIndex(c => c.id === carrier.id);
          if (index !== -1) {
            this.shippingCarriers[index] = response.carrier;
          }
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update shipping carrier';
        throw error;
      }
    },
    
    async addShippingCarrier(carrier: Partial<ShippingCarrier>): Promise<any> {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 600));
          
          // Generate new ID and add timestamps
          const newCarrier = {
            ...carrier,
            id: `carrier-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            active: true
          } as ShippingCarrier;
          
          response = { success: true, carrier: newCarrier };
        } else {
          response = await warehouseApi.addShippingCarrier(carrier);
        }
        
        if (response.success && response.carrier) {
          this.shippingCarriers.push(response.carrier);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to add shipping carrier';
        throw error;
      }
    }
  }
});