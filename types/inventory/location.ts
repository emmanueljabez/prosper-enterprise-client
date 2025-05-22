/**
 * Location type enum
 */
export enum LocationType {
  WAREHOUSE = 'warehouse',
  ZONE = 'zone',
  SHELF = 'shelf',
  BIN = 'bin',
  STORE = 'store',
  OFFICE = 'office',
  SUPPLIER = 'supplier',
  CUSTOMER = 'customer',
  VEHICLE = 'vehicle',
  OTHER = 'other'
}

/**
 * Represents a physical location in the inventory system
 */
export interface Location {
  /** Unique identifier for the location */
  id: string;
  
  /** Human-readable name of the location */
  name: string;
  
  /** Type of location (warehouse, shelf, bin, etc.) */
  type: string;
  
  /** Optional parent location ID, if this is a child location */
  parentId?: string | null;
  
  /** Whether this location is active and available for use */
  isActive: boolean;
  
  /** Optional code for the location (e.g., warehouse code, bin code) */
  code?: string;
  
  /** Optional address for the location */
  address?: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  
  /** Geographic coordinates if available */
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  
  /** Optional capacity in terms of weight */
  weightCapacity?: {
    value: number;
    unit: 'kg' | 'lb' | 'g' | 'oz' | 't';
  };
  
  /** Optional capacity in terms of volume */
  volumeCapacity?: {
    value: number;
    unit: 'm3' | 'ft3' | 'l' | 'gal';
  };
  
  /** Optional notes or description */
  description?: string;
  
  /** Optional contact information */
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  
  /** Optional custom fields for additional flexibility */
  customFields?: Record<string, any>;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
  
  /** Optional array of child locations, used for hierarchical display */
  children?: Location[];
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
  isActive?: boolean;
  type?: string;
  parentId?: string | null;
  description?: string;
  customFields?: Record<string, any>;
}

/**
 * Location filters for search and list operations
 */
export interface LocationFilters {
  search?: string;
  types?: string[];
  isActive?: boolean;
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