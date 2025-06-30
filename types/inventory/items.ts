// Enums for inventory items
export type ValuationMethod = 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'STANDARD_COST';

export type ItemStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DRAFT';

export type UnitOfMeasure = 'EACH' | 'DOZEN' | 'CASE' | 'POUND' | 'KILOGRAM' | 'LITER' | 'GALLON' | 'METER' | 'FOOT';

export type StockAdjustmentReason = 'COUNT_ADJUSTMENT' | 'DAMAGE' | 'THEFT' | 'SPOILAGE' | 'CORRECTION' | 'OTHER';

// Core inventory item interface
export interface InventoryItem {
  id?: number;
  
  // Basic Item Information
  itemCode: string;
  itemName: string;
  description?: string;
  categoryId: number;
  baseUnitOfMeasureId: number;
  
  // Identification & Codes
  barcode?: string;
  sku?: string;
  brand?: string;
  manufacturer?: string;
  
  // Cost & Pricing
  standardCost?: number;
  averageCost?: number;
  lastCost?: number;
  sellingPrice?: number;
  valuationMethod?: ValuationMethod;
  
  // Stock Management
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  leadTimeDays?: number;
  
  // Tracking Options
  trackLotNumber?: boolean;
  trackSerialNumber?: boolean;
  trackExpirationDate?: boolean;
  
  // Item Characteristics
  perishable?: boolean;
  hazardous?: boolean;
  controlledSubstance?: boolean;
  
  // Physical Dimensions
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  volume?: number;
  
  // Additional Information
  notes?: string;
  isActive?: boolean;
  
  // Image URL (TODO: Enable when backend supports it)
  // imageUrl?: string;
  
  // Related Data (populated in responses)
  category?: {
    id: number;
    name: string;
    code?: string;
  };
  baseUnitOfMeasure?: {
    id: number;
    name: string;
    abbreviation?: string;
  };
  
  // Current Stock Information (from stock levels)
  stockOnHand?: number;
  stockCommitted?: number;
  stockAvailable?: number;
  stockReserved?: number;
  
  // System fields
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  version?: number;
}

// Request interfaces
export interface CreateInventoryItemRequest {
  itemCode: string;
  itemName: string;
  description?: string;
  categoryId: number;
  baseUnitOfMeasureId: number;
  barcode?: string;
  sku?: string;
  brand?: string;
  manufacturer?: string;
  standardCost?: number;
  averageCost?: number;
  lastCost?: number;
  sellingPrice?: number;
  valuationMethod?: ValuationMethod;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  leadTimeDays?: number;
  trackLotNumber?: boolean;
  trackSerialNumber?: boolean;
  trackExpirationDate?: boolean;
  perishable?: boolean;
  hazardous?: boolean;
  controlledSubstance?: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  volume?: number;
  notes?: string;
  isActive?: boolean;
  // imageUrl?: string; // TODO: Enable when backend supports it
}

export interface UpdateInventoryItemRequest extends Partial<CreateInventoryItemRequest> {
  id: number;
}

// Query parameters for item endpoints
export interface InventoryItemQueryParams {
  page?: number;
  size?: number;
  searchTerm?: string;
  categoryId?: number;
  isActive?: boolean;
  trackStock?: boolean;
  perishable?: boolean;
  hazardous?: boolean;
  lowStock?: boolean;
  reorderRequired?: boolean;
  brand?: string;
  manufacturer?: string;
  minCost?: number;
  maxCost?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

// Stock adjustment interfaces
export interface StockAdjustment {
  id?: number;
  itemId: number;
  locationId?: number;
  adjustmentType: 'IN' | 'OUT' | 'TRANSFER';
  quantity: number;
  reason: StockAdjustmentReason;
  reasonDescription?: string;
  notes?: string;
  referenceNumber?: string;
  adjustmentDate?: string;
  costPerUnit?: number;
  totalCost?: number;
  approvedBy?: number;
  approvedAt?: string;
  
  // Related data
  item?: {
    id: number;
    itemCode: string;
    itemName: string;
  };
  location?: {
    id: number;
    name: string;
    code: string;
  };
  
  // System fields
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface CreateStockAdjustmentRequest {
  itemId: number;
  locationId?: number;
  adjustmentType: 'IN' | 'OUT' | 'TRANSFER';
  quantity: number;
  reason: StockAdjustmentReason;
  reasonDescription?: string;
  notes?: string;
  referenceNumber?: string;
  adjustmentDate?: string;
  costPerUnit?: number;
}

// Item location and stock level interfaces
export interface ItemLocation {
  id?: number;
  itemId: number;
  locationId: number;
  binLocation?: string;
  stockOnHand: number;
  stockCommitted: number;
  stockAvailable: number;
  stockReserved: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  
  // Related data
  location?: {
    id: number;
    name: string;
    code: string;
    type: string;
  };
  
  // System fields
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Cost calculation interfaces
export interface CostCalculationRequest {
  itemId: number;
  quantity: number;
  calculateDate?: string;
  includeFreight?: boolean;
  includeTax?: boolean;
}

export interface CostCalculationResponse {
  itemId: number;
  quantity: number;
  unitCost: number;
  totalCost: number;
  valuationMethod: ValuationMethod;
  calculationDate: string;
  breakdown: {
    materialCost: number;
    laborCost?: number;
    overheadCost?: number;
    freightCost?: number;
    taxCost?: number;
  };
}

// Low stock and reorder interfaces
export interface LowStockItem {
  id: number;
  itemCode: string;
  itemName: string;
  categoryName: string;
  currentStock: number;
  minStockLevel: number;
  stockDeficit: number;
  daysOfStockRemaining?: number;
  locationName?: string;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ReorderRequiredItem {
  id: number;
  itemCode: string;
  itemName: string;
  categoryName: string;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  leadTimeDays: number;
  estimatedStockoutDate?: string;
  suggestedOrderQuantity: number;
  supplier?: {
    id: number;
    name: string;
    leadTimeDays: number;
  };
}

// Item mapping interfaces for product catalog integration
export interface ItemProductMapping {
  id?: number;
  itemId: number;
  productId: number;
  mappingType: 'MANUAL' | 'AUTOMATIC';
  syncStatus: 'SYNCED' | 'OUT_OF_SYNC' | 'PENDING' | 'ERROR';
  lastSyncTime?: string;
  syncError?: string;
  syncOptions: {
    inventory: boolean;
    pricing: boolean;
    metadata: boolean;
    bidirectional: boolean;
  };
  
  // Related data
  item?: {
    id: number;
    itemCode: string;
    itemName: string;
  };
  product?: {
    id: number;
    sku: string;
    name: string;
  };
  
  // System fields
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface CreateItemProductMappingRequest {
  itemId: number;
  productId: number;
  mappingType: 'MANUAL' | 'AUTOMATIC';
  syncOptions: {
    inventory: boolean;
    pricing: boolean;
    metadata: boolean;
    bidirectional: boolean;
  };
}

export interface SyncConflict {
  id?: number;
  mappingId: number;
  itemId: number;
  productId: number;
  conflictType: 'INVENTORY' | 'PRICING' | 'METADATA' | 'NAMING';
  conflictDetails: string;
  itemValue: any;
  productValue: any;
  recommendedAction: 'USE_ITEM' | 'USE_PRODUCT' | 'MANUAL_REVIEW';
  status: 'UNRESOLVED' | 'RESOLVED' | 'IGNORED';
  resolvedBy?: number;
  resolvedAt?: string;
  resolutionNotes?: string;
  
  // Related data
  item?: {
    id: number;
    itemCode: string;
    itemName: string;
  };
  product?: {
    id: number;
    sku: string;
    name: string;
  };
  
  // System fields
  tenantId?: string;
  detectedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Generic API response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Paginated response interface
export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Item summary for dashboard
export interface InventoryItemSummary {
  totalItems: number;
  activeItems: number;
  inactiveItems: number;
  lowStockItems: number;
  reorderRequiredItems: number;
  totalInventoryValue: number;
  averageItemCost: number;
  topCategoriesByValue: {
    categoryId: number;
    categoryName: string;
    itemCount: number;
    totalValue: number;
  }[];
  recentActivity: {
    newItems: number;
    adjustments: number;
    transfers: number;
  };
}

// Validation response interface
export interface InventoryItemValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedFields: Record<string, boolean>;
}

// Export/Import interfaces
export interface InventoryItemExport {
  items: InventoryItem[];
  exportedAt: string;
  exportedBy: number;
  version: string;
  tenantId: string;
  includeStockLevels: boolean;
  includeCostData: boolean;
}

export interface InventoryItemImport {
  items: CreateInventoryItemRequest[];
  importMode: 'CREATE_ONLY' | 'UPDATE_ONLY' | 'CREATE_OR_UPDATE' | 'VALIDATE_ONLY';
  preserveExistingData?: boolean;
  updateStockLevels?: boolean;
}

// State interface for inventory item management
export interface InventoryItemState {
  items: InventoryItem[];
  currentItem: InventoryItem | null;
  itemsList: InventoryItem[];
  stockAdjustments: StockAdjustment[];
  itemLocations: ItemLocation[];
  lowStockItems: LowStockItem[];
  reorderItems: ReorderRequiredItem[];
  mappings: ItemProductMapping[];
  syncConflicts: SyncConflict[];
  itemSummary: InventoryItemSummary | null;
  loading: boolean;
  error: string | null;
  validationResult: InventoryItemValidation | null;
  
  // Legacy support
  isLoading: boolean;
  useMockData: boolean;
  
  // Actions
  getAllItems: (params?: InventoryItemQueryParams) => Promise<PaginatedResponse<InventoryItem>>;
  getItemById: (id: number) => Promise<InventoryItem>;
  getItemByCode: (itemCode: string) => Promise<InventoryItem>;
  getItemByBarcode: (barcode: string) => Promise<InventoryItem>;
  getItemsByCategory: (categoryId: number, params?: InventoryItemQueryParams) => Promise<PaginatedResponse<InventoryItem>>;
  createItem: (item: CreateInventoryItemRequest) => Promise<InventoryItem>;
  updateItem: (id: number, item: UpdateInventoryItemRequest) => Promise<InventoryItem>;
  deleteItem: (id: number) => Promise<void>;
  activateItem: (id: number) => Promise<InventoryItem>;
  deactivateItem: (id: number) => Promise<InventoryItem>;
  searchItems: (searchTerm: string, params?: InventoryItemQueryParams) => Promise<PaginatedResponse<InventoryItem>>;
  getLowStockItems: (params?: InventoryItemQueryParams) => Promise<PaginatedResponse<LowStockItem>>;
  getReorderRequiredItems: (params?: InventoryItemQueryParams) => Promise<PaginatedResponse<ReorderRequiredItem>>;
  calculateCost: (request: CostCalculationRequest) => Promise<CostCalculationResponse>;
  adjustStock: (adjustment: CreateStockAdjustmentRequest) => Promise<StockAdjustment>;
  getStockAdjustments: (itemId?: number, params?: InventoryItemQueryParams) => Promise<PaginatedResponse<StockAdjustment>>;
  getItemLocations: (itemId: number) => Promise<ItemLocation[]>;
  validateItem: (item: CreateInventoryItemRequest) => Promise<InventoryItemValidation>;
  exportItems: (params?: InventoryItemQueryParams) => Promise<InventoryItemExport>;
  importItems: (importData: InventoryItemImport) => Promise<InventoryItem[]>;
  getItemSummary: () => Promise<InventoryItemSummary>;
  
  // Mapping actions
  createMapping: (mapping: CreateItemProductMappingRequest) => Promise<ItemProductMapping>;
  getMappings: (itemId?: number) => Promise<ItemProductMapping[]>;
  syncMapping: (mappingId: number) => Promise<ItemProductMapping>;
  getSyncConflicts: (mappingId?: number) => Promise<SyncConflict[]>;
  resolveSyncConflict: (conflictId: number, resolution: string) => Promise<SyncConflict>;
}

// Validation rules constants
export const ITEM_VALIDATION_RULES = {
  ITEM_CODE_MAX_LENGTH: 50,
  ITEM_NAME_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 1000,
  SKU_MAX_LENGTH: 100,
  BARCODE_MAX_LENGTH: 50,
  BRAND_MAX_LENGTH: 100,
  MANUFACTURER_MAX_LENGTH: 100,
  NOTES_MAX_LENGTH: 2000,
  MIN_POSITIVE_VALUE: 0.01,
  MIN_NON_NEGATIVE_VALUE: 0,
  MAX_LEAD_TIME_DAYS: 365,
  MAX_WEIGHT_KG: 10000,
  MAX_DIMENSION_CM: 1000
} as const;

// Error messages for validation
export const ITEM_VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  ITEM_CODE_REQUIRED: 'Item code is required',
  ITEM_NAME_REQUIRED: 'Item name is required',
  CATEGORY_REQUIRED: 'Category is required',
  UNIT_OF_MEASURE_REQUIRED: 'Unit of measure is required',
  INVALID_COST: 'Cost must be zero or positive',
  INVALID_STOCK_LEVEL: 'Stock level must be zero or positive',
  INVALID_LEAD_TIME: 'Lead time must be between 0 and 365 days',
  DUPLICATE_ITEM_CODE: 'Item code already exists',
  DUPLICATE_BARCODE: 'Barcode already exists',
  DUPLICATE_SKU: 'SKU already exists',
  INVALID_DIMENSIONS: 'Dimensions must be positive values',
  CATEGORY_NOT_FOUND: 'Category not found',
  UNIT_NOT_FOUND: 'Unit of measure not found'
} as const;
