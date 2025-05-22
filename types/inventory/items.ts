// Type definitions
export interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: null | string;
  useMockData: boolean;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  status: string;
  upc?: string;
  vendorSku?: string;
  reorderPoint: number;
  reorderQuantity: number;
  cost: number;
  stockOnHand: number;
  stockCommitted: number;
  stockAvailable: number;
  unitOfMeasure: string;
  dimensions?: ItemDimensions;
  locations: ItemLocation[];
  statusReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemDimensions {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  weightUnit?: string;
  dimensionUnit?: string;
}

export interface ItemLocation {
  id: string;
  name: string;
  quantity: number;
  bin?: string;
}

export interface StockAdjustment {
  itemId: string;
  locationId: string;
  quantity: number;
  reason?: string;
  notes?: string;
  bin?: string;
}
