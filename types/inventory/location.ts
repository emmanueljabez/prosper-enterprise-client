/**
 * Location type enum
 */
export enum LocationType {
  WAREHOUSE = 'warehouse',
  ZONE = 'zone',
  AISLE = 'aisle',
  BIN = 'bin',
  RETAIL = 'retail',
  MANUFACTURING = 'manufacturing',
  SUPPLIER = 'supplier',
  CUSTOMER = 'customer',
  VEHICLE = 'vehicle',
  OTHER = 'other'
}

/**
 * Location status enum
 */
export enum LocationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  RESTRICTED = 'restricted'
}

/**
 * Represents a physical location in the inventory system
 */
export interface Location {
  /** Unique identifier for the location */
  id: string;
  
  /** Human-readable name of the location */
  name: string;
  
  /** Type of location (warehouse, zone, aisle, bin, etc.) */
  type: string;
  
  /** Status of the location */
  status: string;
  
  /** Optional parent location ID, if this is a child location */
  parentId?: string | null;
  
  /** Optional code for the location (e.g., warehouse code, bin code) */
  code?: string;
  
  /** Optional address for the location */
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  
  /** Physical dimensions of the location */
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: 'ft' | 'm' | 'in' | 'cm';
  };
  
  /** Maximum capacity (number of items) */
  capacity?: number;
  
  /** Current number of items stored in this location */
  itemCount?: number;
  
  /** Optional notes or description */
  description?: string;
  
  /** Optional additional attributes */
  attributes?: Record<string, string>;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
  
  /** Optional array of child locations, used for hierarchical display */
  children?: Location[];
}

/**
 * Location statistics interface
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
  /** Array of all locations */
  locations: Location[];
  
  /** Loading status flag */
  isLoading: boolean;
  
  /** Error information if any */
  error: string | null;
  
  /** Flag to use mock data instead of API calls */
  useMockData: boolean;
  
  /** Location statistics */
  locationStats: LocationStats;
}

/**
 * Interface for location creation payload
 * Omits auto-generated fields like id, createdAt, updatedAt
 */
export type LocationCreateInput = Omit<Partial<Location>, 'id' | 'createdAt' | 'updatedAt' | 'children'>;

/**
 * Interface for location update payload
 */
export type LocationUpdateInput = Partial<Omit<Location, 'createdAt' | 'updatedAt' | 'children'>> & { id: string };

/**
 * Interface for bulk location updates
 */
export interface BulkLocationUpdate {
  status?: string;
  type?: string;
  parentId?: string | null;
  description?: string;
  capacity?: number;
  attributes?: Record<string, any>;
}

/**
 * Location filters for search and list operations
 */
export interface LocationFilters {
  search?: string;
  types?: string[];
  status?: string;
  parentId?: string | null;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
}

/**
 * Response from bulk update operations
 */
export interface BulkUpdateResponse {
  success: boolean;
  updatedCount: number;
  updatedIds: string[];
  message?: string;
}

/**
 * Import response
 */
export interface ImportResponse {
  success: boolean;
  importedCount: number;
  skippedCount?: number;
  errorCount?: number;
  message: string;
  errors?: Array<{
    row: number;
    message: string;
  }>;
}