// Basic shared types
export type Status = 'pending' | 'scheduled' | 'in_transit' | 'received' | 'in_progress' | 'completed' | 'cancelled' | 'exception' | 'label_created' | 'shipped' | 'delivered';
export type Priority = 'low' | 'medium' | 'normal' | 'high' | 'urgent';
export type QCStatus = 'pending' | 'in_progress' | 'passed' | 'failed' | 'waived';

// Warehouse Locations
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: Address;
  isActive: boolean;
  areas?: WarehouseArea[];
}

export interface WarehouseArea {
  id: string;
  warehouseId: string;
  name: string;
  code: string;
  description?: string;
  type: 'receiving' | 'storage' | 'picking' | 'packing' | 'shipping' | 'quality' | 'misc';
}

export interface StorageLocation {
  id: string;
  warehouseId: string;
  areaId?: string;
  code: string;
  name?: string;
  type: 'bin' | 'shelf' | 'rack' | 'zone' | 'aisle' | 'staging' | 'bulk';
  capacity?: number;
  capacityUnit?: string;
  isActive: boolean;
  availableSpace?: number;
  coordinates?: {
    x?: number;
    y?: number;
    z?: number;
    aisle?: string;
    bay?: string;
    level?: string;
  };
}

// Address and Contact Info
export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  type?: 'shipping' | 'billing' | 'both';
}

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
}

// Supplier
export interface Supplier {
  id: string;
  name: string;
  code: string;
  addresses: Address[];
  contacts: ContactInfo[];
  isActive: boolean;
  paymentTerms?: string;
  leadTime?: number; // in days
  notes?: string;
}

// Item in shipment or task
export interface LineItem {
  id: string;
  itemId: string;
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
  status?: Status;
  locationId?: string;
  lotNumber?: string;
  serialNumbers?: string[];
  expirationDate?: string;
}

// Receiving
export interface IncomingShipment {
  id: string;
  poNumber: string;
  reference?: string;
  supplierId: string;
  supplierName: string;
  status: Status;
  priority: Priority;
  expectedArrival: string; // ISO date
  actualArrival?: string; // ISO date
  destinationLocationId: string;
  receivedBy?: string;
  createdAt: string;
  updatedAt?: string;
  items: ShipmentLineItem[];
  attachments?: Attachment[];
  notes?: string;
  exceptions?: ShipmentException[];
  totalItems: number;
  totalQuantity: number;
}

export interface ShipmentLineItem extends LineItem {
  orderedQuantity: number;
  receivedQuantity?: number;
  damagedQuantity?: number;
  qualityCheckStatus?: QCStatus;
  receivingNotes?: string;
}

export interface ShipmentException {
  id: string;
  type: 'quantity_mismatch' | 'damaged' | 'incorrect_item' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  createdBy: string;
  itemId?: string;
  resolution?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
  uploadedAt: string;
  uploadedBy?: string;
}

// Quality Control
export interface QualityInspection {
  id: string;
  shipmentId?: string;
  itemId?: string;
  itemName: string;
  status: QCStatus;
  priority: Priority;
  inspectionType: 'receiving' | 'routine' | 'production' | 'return';
  dueDate: string;
  assignedTo?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  checklistId?: string;
  results?: QualityCheckResult[];
  notes?: string;
  attachments?: Attachment[];
  decision?: 'accept' | 'reject' | 'rework' | 'hold';
  poNumber?: string;
}

export interface QualityCheckResult {
  checkId: string;
  checkName: string;
  expected?: string | number;
  actual?: string | number;
  passed: boolean;
  notes?: string;
  attachments?: Attachment[];
}

export interface QualityChecklist {
  id: string;
  name: string;
  description?: string;
  itemCategories: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  items: QualityCheckItem[];
  version: string;
}

export interface QualityCheckItem {
  id: string;
  name: string;
  description?: string;
  type: 'visual' | 'measurement' | 'functional' | 'documentation';
  method: 'pass_fail' | 'numeric' | 'text';
  expectedValue?: string | number;
  unit?: string;
  tolerance?: {
    min?: number;
    max?: number;
  };
  required: boolean;
  order: number;
}

// Putaway
export interface PutawayTask {
  id: string;
  shipmentId: string;
  status: Status;
  priority: Priority;
  locationId: string;
  assignedTo?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  items: PutawayItem[];
}

export interface PutawayItem {
  lineItemId: string;
  itemId: string;
  sku: string;
  name: string;
  quantity: number;
  sourceLocationId: string; // Receiving location
  destinationLocationId?: string; // Storage location
  status: Status;
  notes?: string;
}

// Picking
export interface PickPath {
  id: string;
  name: string;
  description?: string;
  warehouseId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
  sequence: PickPathLocation[];
}

export interface PickPathLocation {
  locationId: string;
  order: number;
  locationCode: string;
  locationType: string;
  areaId?: string;
  areaName?: string;
}

export interface PickingTask {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName?: string;
  status: Status;
  priority: Priority;
  pathId?: string;
  locationId: string;
  assignedTo?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  dueDate: string;
  items: PickingItem[];
  notes?: string;
}

export interface PickingItem {
  lineItemId: string;
  itemId: string;
  sku: string;
  name: string;
  quantity: number;
  pickedQuantity?: number;
  locationId: string;
  status: Status;
  notes?: string;
}

// Packing
export interface PackingStation {
  id: string;
  code: string;
  name: string;
  locationId: string;
  status: 'active' | 'inactive' | 'maintenance';
  assignedUser?: string;
  capabilities: string[]; // e.g. ['regular', 'fragile', 'cold_storage']
  equipment?: string[];
  lastMaintenance?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PackagingMaterial {
  id: string;
  name: string;
  sku: string;
  type: 'box' | 'envelope' | 'bubble_wrap' | 'tape' | 'label' | 'other';
  description?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  weight?: number;
  weightUnit?: string;
  stockLevel: number;
  minStockLevel: number;
  maxStockLevel?: number;
  locationId: string;
  cost?: number;
  currency?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PackingTask {
  id: string;
  orderId: string;
  customerName?: string;
  status: Status;
  priority: Priority;
  pickCompleted: boolean;
  assignedStation?: string;
  assignedUser?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  dueDate: string;
  shippingMethod?: string;
  shippingCarrier?: string;
  requiresCustomPackaging: boolean;
  items: PackingItem[];
  packages?: Package[];
  notes?: string;
}

export interface PackingItem {
  lineItemId: string;
  itemId: string;
  sku: string;
  name: string;
  quantity: number;
  unitWeight?: number;
  weightUnit?: string;
  requiresSpecialHandling?: boolean;
  packageId?: string;
  notes?: string;
}

export interface Package {
  packageId: string;
  packageType: string;
  items: {
    lineItemId: string;
    quantity: number;
  }[];
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  weight: number;
  weightUnit: string;
  trackingNumber?: string;
  shippingLabelPrinted?: boolean;
  shippingLabelUrl?: string;
  status?: Status;
}

// Shipping
export interface ShippingCarrier {
  id: string;
  name: string;
  code: string;
  accountNumber?: string;
  services: ShippingService[];
  apiCredentials?: {
    apiKey?: string;
    username?: string;
    password?: string;
    // Other credentials as needed
  };
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ShippingService {
  id: string;
  name: string;
  code: string;
  description?: string;
  estimatedDeliveryDays?: string; // "1-2" or "3-5"
  active: boolean;
  domesticOnly?: boolean;
  internationalOnly?: boolean;
}

export interface Shipment {
  id: string;
  orderId: string;
  customerName?: string;
  status: Status;
  carrierId: string;
  carrierName: string;
  serviceId: string;
  serviceName: string;
  trackingNumber: string;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
  shipToAddress: Address;
  packages: Package[];
  shippingCost?: number;
  currency?: string;
  documents?: {
    type: string;
    url: string;
  }[];
  events?: {
    timestamp: string;
    status: string;
    description: string;
    location?: string;
  }[];
}

// ShippingRate for getting quotes
export interface ShippingRate {
  carrierId: string;
  carrierName: string;
  serviceId: string;
  serviceName: string;
  rate: number;
  currency: string;
  estimatedDelivery: string;
  transitDays: string;
  restrictions?: string[];
}