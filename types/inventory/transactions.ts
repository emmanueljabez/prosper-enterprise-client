/**
 * Transaction type enum
 */
export enum TransactionType {
  RECEIVE = 'receive',
  ISSUE = 'issue',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  COUNT = 'count',
  RETURN = 'return'
}

/**
 * Transaction status enum
 */
export enum TransactionStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Adjustment reason enum
 */
export enum AdjustmentReason {
  DAMAGE = 'damage',
  LOSS = 'loss',
  THEFT = 'theft',
  EXPIRATION = 'expiration',
  COUNT = 'count',
  QUALITY = 'quality',
  OTHER = 'other'
}

/**
 * Represents an inventory transaction
 */
export interface Transaction {
  /** Unique identifier for the transaction */
  id: string;
  
  /** Human-readable reference number */
  referenceNumber: string;
  
  /** Type of transaction (receive, issue, transfer, etc.) */
  type: string;
  
  /** Source location ID (for transfers, issues) */
  sourceLocationId?: string | null;
  
  /** Destination location ID (for receives, transfers) */
  destinationLocationId?: string | null;
  
  /** Date and time of the transaction */
  transactionDate: string;
  
  /** Current status of the transaction */
  status: string;
  
  /** Whether the transaction has been voided */
  isVoided: boolean;
  
  /** Reason for voiding the transaction (if voided) */
  voidReason?: string;
  
  /** Date when the transaction was voided */
  voidedAt?: string;
  
  /** User who created the transaction */
  createdBy: string;
  
  /** Notes or comments about the transaction */
  notes?: string;
  
  /** External reference number (PO, SO, etc.) */
  externalReference?: string;
  
  /** Reason for adjustment (if type is 'adjustment') */
  reason?: string;
  
  /** Line items in the transaction */
  items: TransactionItem[];
  
  /** Total value of the transaction */
  totalValue?: number;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
  
  /** Optional custom fields for additional flexibility */
  customFields?: Record<string, any>;
}

/**
 * Represents an item in a transaction
 */
export interface TransactionItem {
  /** Item ID */
  itemId: string;
  
  /** Quantity being transacted */
  quantity: number;
  
  /** Cost per unit */
  cost?: number;
  
  /** Lot or batch number */
  lot?: string;
  
  /** Expiration date */
  expirationDate?: string;
  
  /** Bin location for received or sourced items */
  binLocation?: string;
  
  /** Source bin for transfers */
  sourceBin?: string;
  
  /** Destination bin for transfers */
  destinationBin?: string;
  
  /** Serial numbers for serialized items */
  serialNumbers?: string[];
  
  /** Additional notes for this specific item */
  notes?: string;
  
  /** Line subtotal (quantity * cost) */
  subtotal?: number;
}

/**
 * State interface for the transactions store
 */
export interface TransactionState {
  /** Array of all transactions */
  transactions: Transaction[];
  
  /** Loading status flag */
  isLoading: boolean;
  
  /** Error information if any */
  error: string | null;
  
  /** Flag to use mock data instead of API calls */
  useMockData: boolean;
}

/**
 * Filters for transaction list
 */
export interface TransactionFilters {
  /** Filter by date range (today, yesterday, thisWeek, thisMonth, lastMonth, custom) */
  dateRange?: string;
  
  /** Filter by transaction type */
  transactionType?: string;
  
  /** Filter by location */
  location?: string;
  
  /** For custom date range: start date */
  startDate?: string;
  
  /** For custom date range: end date */
  endDate?: string;
  
  /** Search by reference number or notes */
  search?: string;
  
  /** Filter by transaction status */
  status?: string;
  
  /** Show only voided or non-voided transactions */
  isVoided?: boolean;
}

/**
 * Transaction create input
 */
export type TransactionCreateInput = Omit<
  Transaction, 
  'id' | 'createdAt' | 'updatedAt' | 'isVoided' | 'voidedAt' | 'status'
>;

/**
 * Void transaction request
 */
export interface VoidTransactionRequest {
  /** Reason for voiding the transaction */
  reason: string;
}

/**
 * Document generation response
 */
export interface DocumentGenerationResponse {
  success: boolean;
  documentUrl?: string;
  documentBlob?: Blob;
  documentType?: string;
  message?: string;
}

/**
 * Transaction summary for dashboard and reporting
 */
export interface TransactionSummary {
  /** Total transaction count */
  totalCount: number;
  
  /** Breakdown by transaction type */
  byType: {
    [key: string]: number;
  };
  
  /** Total value of all transactions */
  totalValue: number;
  
  /** Value breakdown by transaction type */
  valueByType: {
    [key: string]: number;
  };
}

/**
 * Stock movement history for an item
 */
export interface StockMovementHistoryItem {
  transactionId: string;
  transactionType: string;
  transactionDate: string;
  quantity: number;
  locationId: string;
  locationName: string;
  referenceNumber: string;
}