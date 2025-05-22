/**
 * Transfer type enum
 */
export enum TransferType {
  STANDARD = 'standard',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  BULK = 'bulk'
}

/**
 * Transfer status enum
 */
export enum TransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_TRANSIT = 'in_transit',
  AWAITING_RECEIPT = 'awaiting_receipt',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Represents an inventory transfer between locations
 */
export interface Transfer {
  /** Unique identifier for the transfer */
  id: string;
  
  /** Human-readable reference number */
  referenceNumber: string;
  
  /** Type of transfer (standard, return, adjustment, bulk) */
  type: string;
  
  /** Source/from location ID */
  fromLocationId: string;
  
  /** Destination/to location ID */
  toLocationId: string;
  
  /** Expected shipping date */
  expectedShipDate: string;
  
  /** Expected delivery date */
  expectedDeliveryDate?: string;
  
  /** Current status of the transfer */
  status: string;
  
  /** Notes or comments about the transfer */
  notes?: string;
  
  /** External reference number (related document numbers) */
  externalReference?: string;
  
  /** Items included in the transfer */
  items: TransferItem[];
  
  /** Whether this transfer requires approval */
  requiresApproval: boolean;
  
  /** User who created the transfer */
  createdBy: string;
  
  /** User who approved the transfer */
  approvedBy?: string;
  
  /** Date when the transfer was approved */
  approvedAt?: string;
  
  /** Notes added during approval */
  approvalNotes?: string;
  
  /** User who shipped the transfer */
  shippedBy?: string;
  
  /** Date when the transfer was shipped */
  shippedAt?: string;
  
  /** Shipping information (carrier, tracking) */
  shippingInfo?: ShippingInfo;
  
  /** User who received the transfer */
  receivedBy?: string;
  
  /** Date when the transfer was received */
  receivedAt?: string;
  
  /** Notes added during receipt */
  receiptNotes?: string;
  
  /** User who cancelled the transfer */
  cancelledBy?: string;
  
  /** Date when the transfer was cancelled */
  cancelledAt?: string;
  
  /** Reason for cancellation */
  cancellationReason?: string;
  
  /** Total value of transferred items */
  totalValue?: number;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
  
  /** Documents related to the transfer (packing slips, etc.) */
  documents?: TransferDocument[];
  
  /** Optional custom fields for additional flexibility */
  customFields?: Record<string, any>;
}

/**
 * Represents an item in a transfer
 */
export interface TransferItem {
  /** Item ID */
  itemId: string;
  
  /** Name of the item (for UI convenience) */
  name?: string;
  
  /** SKU of the item (for UI convenience) */
  sku?: string;
  
  /** Quantity being transferred */
  quantity: number;
  
  /** Quantity received at destination */
  receivedQuantity?: number;
  
  /** Whether there was a discrepancy between sent and received */
  hasDiscrepancy?: boolean;
  
  /** Reason for any discrepancy */
  discrepancyReason?: string;
  
  /** Cost per unit for valuation */
  cost?: number;
  
  /** Lot or batch number */
  lot?: string;
  
  /** Expiration date */
  expirationDate?: string;
  
  /** Source bin location */
  sourceBin?: string;
  
  /** Destination bin location */
  destinationBin?: string;
  
  /** Serial numbers for serialized items */
  serialNumbers?: string[];
  
  /** Additional notes for this specific item */
  notes?: string;
  
  /** Line subtotal (quantity * cost) */
  subtotal?: number;
}

/**
 * Information about shipping
 */
export interface ShippingInfo {
  /** Shipping carrier (UPS, FedEx, etc.) */
  carrier?: string;
  
  /** Tracking number */
  trackingNumber?: string;
  
  /** Shipping cost */
  shippingCost?: number;
  
  /** Shipping method (Ground, Express, etc.) */
  method?: string;
  
  /** Estimated delivery date provided by carrier */
  estimatedDelivery?: string;
  
  /** Weight of shipment */
  weight?: number;
  
  /** Unit of weight measurement */
  weightUnit?: string;
  
  /** Number of packages/parcels */
  packageCount?: number;
}

/**
 * Document related to a transfer
 */
export interface TransferDocument {
  /** Document ID */
  id: string;
  
  /** Document type (packing slip, bill of lading, etc.) */
  type: string;
  
  /** Document URL */
  url: string;
  
  /** Document name */
  name: string;
  
  /** Document creation date */
  createdAt: string;
  
  /** User who created the document */
  createdBy: string;
}

/**
 * State interface for the transfers store
 */
export interface TransferState {
  /** Array of all transfers */
  transfers: Transfer[];
  
  /** Loading status flag */
  isLoading: boolean;
  
  /** Error information if any */
  error: string | null;
  
  /** Flag to use mock data instead of API calls */
  useMockData: boolean;
}

/**
 * Filters for transfer list
 */
export interface TransferFilters {
  /** Filter by status */
  status?: string;
  
  /** Filter by from location */
  fromLocationId?: string;
  
  /** Filter by to location */
  toLocationId?: string;
  
  /** Filter by date range */
  dateRange?: string;
  
  /** For custom date range: start date */
  startDate?: string;
  
  /** For custom date range: end date */
  endDate?: string;
  
  /** Search by reference number or notes */
  search?: string;
  
  /** Filter by transfer type */
  type?: string;
}

/**
 * Transfer create input
 */
export type TransferCreateInput = Omit<
  Transfer, 
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'documents' | 'approvedAt' | 'approvedBy' | 'receivedAt' | 'receivedBy' | 'cancelledAt' | 'cancelledBy'
>;

/**
 * Transfer approval request
 */
export interface ApprovalRequest {
  /** User approving the transfer */
  approvedBy?: string;
  
  /** Notes for approval */
  notes?: string;
}

/**
 * Transfer receipt request
 */
export interface ReceiptRequest {
  /** User receiving the transfer */
  receivedBy?: string;
  
  /** Notes for receipt */
  notes?: string;
  
  /** Item receipt details */
  items: {
    /** Item ID */
    itemId: string;
    
    /** Quantity received */
    receivedQuantity: number;
    
    /** Whether there is a discrepancy */
    hasDiscrepancy?: boolean;
    
    /** Reason for discrepancy */
    discrepancyReason?: string;
  }[];
}

/**
 * Transfer summary for reporting
 */
export interface TransferSummary {
  /** Total transfer count */
  totalCount: number;
  
  /** Count by status */
  byStatus: {
    [key: string]: number;
  };
  
  /** Count by type */
  byType: {
    [key: string]: number;
  };
  
  /** Top origin locations */
  topOriginLocations: {
    locationId: string;
    locationName: string;
    count: number;
  }[];
  
  /** Top destination locations */
  topDestinationLocations: {
    locationId: string;
    locationName: string;
    count: number;
  }[];
  
  /** Value statistics */
  valueStats: {
    totalValue: number;
    avgValue: number;
    maxValue: number;
  };
}