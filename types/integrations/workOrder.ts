export interface WorkOrderMaterial {
  id: string;
  componentId: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  required: number;
  allocated: number;
  consumed: number;
  unit: string;
  status: 'pending' | 'allocated' | 'consumed' | 'insufficient';
  locationId?: string;
  locationName?: string;
}

export interface ProductionOperation {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  assignedTo?: string;
  duration?: number; // In minutes
  notes?: string;
}

export type WorkOrderStatus = 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type MaterialStatus = 'available' | 'partial' | 'unavailable';

export interface WorkOrder {
  id: string;
  orderNumber: string;
  bomId: string;
  bomName: string;
  productId: string;
  productName: string;
  productSku: string;
  status: WorkOrderStatus;
  materialStatus: MaterialStatus;
  priority: number;
  quantity: number;
  completed: number;
  rejected: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  completedAt?: string;
  materials: WorkOrderMaterial[];
  operations?: ProductionOperation[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  notes?: string;
  qualityNotes?: string;
  dueDate: string;
}

export interface WorkOrderState {
  workOrders: WorkOrder[];
  isLoading: boolean;
  error: string | null;
  useMockData: boolean;
}
