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

// Define mapping types
export interface ItemProductMapping {
  id: string;
  itemId: string;
  productId: string;
  itemName: string;
  itemSku: string;
  itemDescription?: string;
  productName: string;
  productSku: string;
  productDescription?: string;
  mappingType: 'manual' | 'automatic';
  syncStatus: 'synced' | 'out_of_sync' | 'pending' | 'error';
  lastSyncTime?: string;
  syncError?: string;
  syncOptions: {
    inventory: boolean;
    pricing: boolean;
    metadata: boolean;
    bidirectional: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SyncConflict {
  id: string;
  mappingId: string;
  itemId: string;
  productId: string;
  itemName: string;
  productName: string;
  type: string;
  details: string;
  inventoryItem: any;
  catalogProduct: any;
  detectedAt: string;
  status: 'resolved' | 'unresolved';
}

// Update the state interface to include mappings
export interface ExtendedInventoryState extends InventoryState {
  mappings: ItemProductMapping[];
  syncConflicts: SyncConflict[];
  mappingsLoading: boolean;
  mappingsError: string | null;
}
