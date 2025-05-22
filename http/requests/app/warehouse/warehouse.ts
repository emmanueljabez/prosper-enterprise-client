import axiosInstance from '@/http/axios';
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
  Shipment
} from '@/types/warehouse/warehouse';

// Define API client
export default {
  // ======== INCOMING SHIPMENTS ========
  fetchIncomingShipments: (params = {}) => {
    return axiosInstance.get('/warehouse/shipments/incoming', { params });
  },
  
  fetchShipmentById: (id: string) => {
    return axiosInstance.get(`/warehouse/shipments/incoming/${id}`);
  },
  
  createIncomingShipment: (shipment: Partial<IncomingShipment>) => {
    return axiosInstance.post('/warehouse/shipments/incoming', shipment);
  },
  
  updateIncomingShipment: (id: string, shipment: Partial<IncomingShipment>) => {
    return axiosInstance.put(`/warehouse/shipments/incoming/${id}`, shipment);
  },
  
  updateShipmentStatus: (id: string, status: string, notes?: string) => {
    return axiosInstance.patch(`/warehouse/shipments/incoming/${id}/status`, { status, notes });
  },
  
  receiveShipment: (id: string, receivingData: any) => {
    return axiosInstance.post(`/warehouse/shipments/incoming/${id}/receive`, receivingData);
  },
  
  // ======== QUALITY INSPECTIONS ========
  fetchQualityInspections: (params = {}) => {
    return axiosInstance.get('/warehouse/quality/inspections', { params });
  },
  
  fetchInspectionById: (id: string) => {
    return axiosInstance.get(`/warehouse/quality/inspections/${id}`);
  },
  
  createQualityInspection: (inspection: Partial<QualityInspection>) => {
    return axiosInstance.post('/warehouse/quality/inspections', inspection);
  },
  
  updateQualityInspection: (id: string, inspection: Partial<QualityInspection>) => {
    return axiosInstance.put(`/warehouse/quality/inspections/${id}`, inspection);
  },
  
  completeInspection: (id: string, results: any) => {
    return axiosInstance.post(`/warehouse/quality/inspections/${id}/complete`, results);
  },
  
  fetchQualityChecklists: (params = {}) => {
    return axiosInstance.get('/warehouse/quality/checklists', { params });
  },
  
  fetchChecklistById: (id: string) => {
    return axiosInstance.get(`/warehouse/quality/checklists/${id}`);
  },
  
  createQualityChecklist: (checklist: Partial<QualityChecklist>) => {
    return axiosInstance.post('/warehouse/quality/checklists', checklist);
  },
  
  updateQualityChecklist: (id: string, checklist: Partial<QualityChecklist>) => {
    return axiosInstance.put(`/warehouse/quality/checklists/${id}`, checklist);
  },
  
  // ======== PUTAWAY TASKS ========
  fetchPutawayTasks: (params = {}) => {
    return axiosInstance.get('/warehouse/putaway', { params });
  },
  
  fetchPutawayTaskById: (id: string) => {
    return axiosInstance.get(`/warehouse/putaway/${id}`);
  },
  
  createPutawayTask: (task: Partial<PutawayTask>) => {
    return axiosInstance.post('/warehouse/putaway', task);
  },
  
  updatePutawayTask: (id: string, task: Partial<PutawayTask>) => {
    return axiosInstance.put(`/warehouse/putaway/${id}`, task);
  },
  
  updatePutawayStatus: (id: string, status: string, notes?: string) => {
    return axiosInstance.patch(`/warehouse/putaway/${id}/status`, { status, notes });
  },
  
  completePutawayTask: (id: string, completionData: any) => {
    return axiosInstance.post(`/warehouse/putaway/${id}/complete`, completionData);
  },
  
  // ======== PICK PATHS ========
  fetchPickPaths: (params = {}) => {
    return axiosInstance.get('/warehouse/picking/paths', { params });
  },
  
  fetchPickPathById: (id: string) => {
    return axiosInstance.get(`/warehouse/picking/paths/${id}`);
  },
  
  createPickPath: (path: Partial<PickPath>) => {
    return axiosInstance.post('/warehouse/picking/paths', path);
  },
  
  updatePickPath: (id: string, path: Partial<PickPath>) => {
    return axiosInstance.put(`/warehouse/picking/paths/${id}`, path);
  },
  
  deletePickPath: (id: string) => {
    return axiosInstance.delete(`/warehouse/picking/paths/${id}`);
  },
  
  // ======== PICKING TASKS ========
  fetchPickingTasks: (params = {}) => {
    return axiosInstance.get('/warehouse/picking/tasks', { params });
  },
  
  fetchPickTaskById: (id: string) => {
    return axiosInstance.get(`/warehouse/picking/tasks/${id}`);
  },
  
  createPickTask: (task: Partial<PickingTask>) => {
    return axiosInstance.post('/warehouse/picking/tasks', task);
  },
  
  updatePickTask: (id: string, task: Partial<PickingTask>) => {
    return axiosInstance.put(`/warehouse/picking/tasks/${id}`, task);
  },
  
  updatePickStatus: (id: string, status: string, notes?: string) => {
    return axiosInstance.patch(`/warehouse/picking/tasks/${id}/status`, { status, notes });
  },
  
  assignPickTask: (id: string, assigneeId: string) => {
    return axiosInstance.post(`/warehouse/picking/tasks/${id}/assign`, { assigneeId });
  },
  
  startPickTask: (id: string) => {
    return axiosInstance.post(`/warehouse/picking/tasks/${id}/start`);
  },
  
  completePickTask: (id: string, completionData: any) => {
    return axiosInstance.post(`/warehouse/picking/tasks/${id}/complete`, completionData);
  },
  
  // ======== PACKING STATIONS ========
  fetchPackingStations: (params = {}) => {
    return axiosInstance.get('/warehouse/packing/stations', { params });
  },
  
  fetchPackingStationById: (id: string) => {
    return axiosInstance.get(`/warehouse/packing/stations/${id}`);
  },
  
  createPackingStation: (station: Partial<PackingStation>) => {
    return axiosInstance.post('/warehouse/packing/stations', station);
  },
  
  updatePackingStation: (id: string, station: Partial<PackingStation>) => {
    return axiosInstance.put(`/warehouse/packing/stations/${id}`, station);
  },
  
  updateStationStatus: (id: string, status: string) => {
    return axiosInstance.patch(`/warehouse/packing/stations/${id}/status`, { status });
  },
  
  assignUserToStation: (id: string, userId: string) => {
    return axiosInstance.post(`/warehouse/packing/stations/${id}/assign-user`, { userId });
  },
  
  // ======== PACKAGING MATERIALS ========
  fetchPackagingMaterials: (params = {}) => {
    return axiosInstance.get('/warehouse/packing/materials', { params });
  },
  
  fetchPackagingMaterialById: (id: string) => {
    return axiosInstance.get(`/warehouse/packing/materials/${id}`);
  },
  
  createPackagingMaterial: (material: Partial<PackagingMaterial>) => {
    return axiosInstance.post('/warehouse/packing/materials', material);
  },
  
  updatePackagingMaterial: (id: string, material: Partial<PackagingMaterial>) => {
    return axiosInstance.put(`/warehouse/packing/materials/${id}`, material);
  },
  
  adjustMaterialStock: (id: string, adjustment: any) => {
    return axiosInstance.post(`/warehouse/packing/materials/${id}/adjust-stock`, adjustment);
  },
  
  // ======== PACKING TASKS ========
  fetchPackingTasks: (params = {}) => {
    return axiosInstance.get('/warehouse/packing/tasks', { params });
  },
  
  fetchPackTaskById: (id: string) => {
    return axiosInstance.get(`/warehouse/packing/tasks/${id}`);
  },
  
  createPackTask: (task: Partial<PackingTask>) => {
    return axiosInstance.post('/warehouse/packing/tasks', task);
  },
  
  updatePackTask: (id: string, task: Partial<PackingTask>) => {
    return axiosInstance.put(`/warehouse/packing/tasks/${id}`, task);
  },
  
  updatePackStatus: (id: string, status: string, notes?: string) => {
    return axiosInstance.patch(`/warehouse/packing/tasks/${id}/status`, { status, notes });
  },
  
  assignPackTask: (id: string, stationId: string, userId?: string) => {
    return axiosInstance.post(`/warehouse/packing/tasks/${id}/assign`, { stationId, userId });
  },
  
  startPackTask: (id: string) => {
    return axiosInstance.post(`/warehouse/packing/tasks/${id}/start`);
  },
  
  completePackTask: (id: string, completionData: any) => {
    return axiosInstance.post(`/warehouse/packing/tasks/${id}/complete`, completionData);
  },
  
  // ======== SHIPPING CARRIERS ========
  fetchShippingCarriers: (params = {}) => {
    return axiosInstance.get('/warehouse/shipping/carriers', { params });
  },
  
  fetchCarrierById: (id: string) => {
    return axiosInstance.get(`/warehouse/shipping/carriers/${id}`);
  },
  
  createShippingCarrier: (carrier: Partial<ShippingCarrier>) => {
    return axiosInstance.post('/warehouse/shipping/carriers', carrier);
  },
  
  updateShippingCarrier: (id: string, carrier: Partial<ShippingCarrier>) => {
    return axiosInstance.put(`/warehouse/shipping/carriers/${id}`, carrier);
  },
  
  // ======== SHIPPING & LABELS ========
  fetchShipments: (params = {}) => {
    return axiosInstance.get('/warehouse/shipping/shipments', { params });
  },
  
  fetchShipmentDetailsById: (id: string) => {
    return axiosInstance.get(`/warehouse/shipping/shipments/${id}`);
  },
  
  getRates: (packageData: any) => {
    return axiosInstance.post('/warehouse/shipping/rates', packageData);
  },
  
  createLabel: (taskId: string, packageId: string, shippingData: any) => {
    return axiosInstance.post(`/warehouse/shipping/labels`, { taskId, packageId, ...shippingData });
  },
  
  trackShipment: (trackingNumber: string, carrier: string) => {
    return axiosInstance.get('/warehouse/shipping/track', { 
      params: { trackingNumber, carrier } 
    });
  },

  // ======== EXPORTS ========
  exportPickingTasks: (format: string = 'csv', filters = {}) => {
    return axiosInstance.get(`/warehouse/picking/tasks/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },
  
  exportPackingTasks: (format: string = 'csv', filters = {}) => {
    return axiosInstance.get(`/warehouse/packing/tasks/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },
  
  exportShipments: (format: string = 'csv', filters = {}) => {
    return axiosInstance.get(`/warehouse/shipping/shipments/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  }
};