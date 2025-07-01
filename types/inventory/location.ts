// ============= WAREHOUSE MANAGEMENT TYPES =============

/**
 * Warehouse location type for warehouse hierarchy
 */
export type WarehouseLocationType = 'ZONE' | 'AISLE' | 'SHELF' | 'BIN';

/**
 * Warehouse statistics interface
 */
export interface LocationStats {
  /** Number of active warehouses */
  warehouses: number;
  
  /** Total number of zones */
  zones: number;
  
  /** Number of zones currently in use (with items) */
  zonesInUse: number;
  
  /** Total number of aisles */
  aisles: number;
  
  /** Total number of bins */
  bins: number;
  
  /** Number of bins currently in use (with items) */
  binsInUse: number;
  
  /** Total storage capacity across all locations */
  totalCapacity: number;
  
  /** Total number of items currently stored */
  itemsStored: number;
  
  /** Number of unique sites (cities with warehouses) */
  sites: number;
}

/**
 * State interface for the locations store
 */
export interface LocationState {
  // Warehouse management
  warehouses: Warehouse[];
  paginatedWarehouses: PaginatedResponse<Warehouse> | null;
  selectedWarehouse: Warehouse | null;
  warehouseHierarchy: WarehouseHierarchy | null;
  locationTreeStructure: WarehouseLocationNode[];
  zones: Zone[];
  aisles: Aisle[];
  shelves: Shelf[];
  
  /** Loading status flag */
  isLoading: boolean;
  
  /** Error information if any */
  error: string | null;
  
  /** Flag to use mock data instead of API calls */
  useMockData: boolean;
  
  /** Warehouse statistics */
  locationStats: LocationStats;
}

/**
 * Warehouse location interface for locations within a warehouse
 */
export interface WarehouseLocation {
  id: number;
  name: string;
  code: string;
  description?: string;
  parentLocation?: WarehouseLocation | null;
  locationType: WarehouseLocationType;
  barcode?: string | null;
  isActive: boolean;
  maxCapacity?: number;
  currentCapacity?: number;
  aisle?: string | null;
  rowCode?: string | null;
  binCode?: string | null;
  pickable: boolean;
  created: string;
  updated: string;
}

/**
 * Main warehouse interface
 */
export interface Warehouse {
  id?: number;
  code: string;
  name: string;
  description?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  isActive: boolean;
  isMainWarehouse?: boolean;
  created?: string;
  updated?: string;
  locations?: WarehouseLocation[];
  activeLocations?: WarehouseLocation[];
  rootLocations?: WarehouseLocation[];
  activeLocationCount?: number;
  locationCount?: number;
}

/**
 * Zone interface
 */
export interface Zone {
  id?: number;
  name: string;
  code: string;
  description?: string;
  locationType: WarehouseLocationType;
  isActive: boolean;
  maxCapacity?: number;
  currentCapacity?: number;
  pickable: boolean;
}

/**
 * Aisle interface
 */
export interface Aisle {
  id?: number;
  name: string;
  code: string;
  description?: string;
  parentLocationId?: number;
  locationType: WarehouseLocationType;
  aisle: string;
  isActive: boolean;
  maxCapacity?: number;
  currentCapacity?: number;
  pickable: boolean;
}

/**
 * Shelf interface
 */
export interface Shelf {
  id?: number;
  name: string;
  code: string;
  description?: string;
  parentLocationId?: number;
  locationType: WarehouseLocationType;
  aisle: string;
  rowCode: string;
  isActive: boolean;
  maxCapacity?: number;
  currentCapacity?: number;
  pickable: boolean;
}

/**
 * Warehouse location node for hierarchy
 */
export interface WarehouseLocationNode {
  id: number;
  code: string;
  name: string;
  description?: string;
  warehouseId?: number | null;
  warehouseName?: string | null;
  locationType: WarehouseLocationType;
  barcode?: string | null;
  isActive: boolean;
  parentLocationId?: number | null;
  parentLocationName?: string | null;
  depth: number;
  path: string;
  fullPath?: string | null;
  maxCapacity?: number;
  currentCapacity?: number;
  availableCapacity?: number;
  capacityUtilization?: number;
  canReceive?: boolean;
  canPick?: boolean;
  pickable?: boolean;
  aisle?: string | null;
  rowCode?: string | null;
  binCode?: string | null;
  createdByUsername?: string;
  updatedByUsername?: string | null;
  created?: string;
  updated?: string;
  children?: WarehouseLocationNode[];
  totalDescendants?: number;
  activeDescendants?: number;
  totalCapacityInSubtree?: number;
  usedCapacityInSubtree?: number;
  hasChildren?: boolean;
  isLeaf?: boolean;
  isRoot?: boolean | null;
  totalChildren?: number | null;
}

/**
 * Complete warehouse hierarchy
 */
export interface WarehouseHierarchy {
  id?: number;
  code: string;
  name: string;
  description?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  isMainWarehouse?: boolean;
  isActive: boolean;
  createdByUsername?: string;
  updatedByUsername?: string;
  created?: string;
  updated?: string;
  locationHierarchy?: WarehouseLocationNode[];
  totalLocations?: number;
  activeLocations?: number;
  rootLocations?: number;
  maxDepth?: number;
  pickableLocations?: number;
  receivableLocations?: number;
  totalCapacity?: number;
  usedCapacity?: number;
  availableCapacity?: number;
  capacityUtilization?: number;
}

/**
 * Request interface for creating main warehouse
 */
export interface CreateMainWarehouseRequest {
  code: string;
  name: string;
  description?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  isActive: boolean;
  isMainWarehouse?: boolean;
  locationType?: string;
}

/**
 * Request interface for creating zone
 */
export interface CreateZoneRequest {
  name: string;
  code: string;
  description?: string;
  warehouseId: number;
  parentLocationId: number;
  locationType: WarehouseLocationType;
  isActive: boolean;
  maxCapacity?: number;
  currentCapacity?: number;
  pickable: boolean;
}

/**
 * Request interface for creating aisle
 */
export interface CreateAisleRequest {
  name: string;
  code: string;
  description?: string;
  warehouseId: number;
  parentLocationId: number;
  locationType: WarehouseLocationType;
  aisle: string;
  isActive: boolean;
  maxCapacity?: number;
  currentCapacity?: number;
  pickable: boolean;
}

/**
 * Request interface for creating shelf
 */
export interface CreateShelfRequest {
  name: string;
  code: string;
  description?: string;
  warehouseId: number;
  parentLocationId: number;
  locationType: WarehouseLocationType;
  aisle: string;
  rowCode: string;
  isActive: boolean;
  maxCapacity?: number;
  currentCapacity?: number;
  pickable: boolean;
}

/**
 * Request interface for updating warehouse
 */
export interface UpdateWarehouseRequest extends CreateMainWarehouseRequest {
  id: number;
}

/**
 * Request interface for deactivating warehouse
 */
export interface DeactivateWarehouseRequest extends CreateMainWarehouseRequest {
  id: number;
  isActive: false;
}

/**
 * Query parameters for warehouse operations
 */
export interface WarehouseQueryParams {
  page?: number;
  pageSize?: number;
  size?: number; // Backend uses 'size' for page size
  search?: string;
  sortBy?: 'name' | 'code' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response interface
 */
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

/**
 * Generic API response interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}