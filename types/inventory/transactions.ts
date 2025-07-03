// Enums for inventory transactions
export type TransactionType = 
  'RECEIVE' | 'ISSUE' | 'ADJUSTMENT' | 'TRANSFER' | 'COUNT' | 'RETURN' | 
  'ASSEMBLY' | 'DISASSEMBLY' | 'SCRAP' | 'REWORK' | 'ALLOCATION' | 'RESERVATION' | 
  'CONVERSION' | 'PRODUCTION_RECEIPT' | 'PRODUCTION_ISSUE' | 'WORK_ORDER_RECEIPT' | 
  'WORK_ORDER_ISSUE' | 'CYCLE_COUNT' | 'PHYSICAL_COUNT' | 'SPOT_COUNT' | 
  'QUALITY_HOLD' | 'QUALITY_RELEASE' | 'QUARANTINE' | 'RELEASE_FROM_QUARANTINE';

export type TransactionStatus = 'DRAFT' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type QualityStatus = 
  'PENDING_INSPECTION' | 'PASSED' | 'FAILED' | 'CONDITIONAL_PASS' | 'QUARANTINED' | 
  'REJECTED' | 'REWORK_REQUIRED' | 'PARTIAL_ACCEPTANCE' | 'AWAITING_DOCUMENTATION' | 
  'EXPIRED' | 'DAMAGED' | 'CONTAMINATED' | 'TEMPERATURE_COMPROMISED' | 
  'PACKAGING_DEFECT' | 'SAMPLE_TESTING' | 'THIRD_PARTY_INSPECTION' | 
  'APPROVED_WITH_CONDITIONS' | 'TEMPORARY_HOLD';

export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'EMERGENCY';

export type ReferenceType = 
  'PURCHASE_ORDER' | 'SALES_ORDER' | 'WORK_ORDER' | 'TRANSFER_ORDER' | 
  'ADJUSTMENT_ORDER' | 'QUALITY_CONTROL' | 'MANUAL' | 'INTERNAL';

export type IssueType = 
  'SALE' | 'PRODUCTION' | 'TRANSFER' | 'SAMPLE' | 'WASTE' | 'QUALITY_CONTROL' | 
  'REWORK' | 'CUSTOMER_RETURN' | 'INTERNAL_USE' | 'CONSIGNMENT';

// Multi-Item Receive Transaction
export interface MultiItemReceiveTransaction {
  id?: number;
  referenceType: ReferenceType;
  genericReferenceId?: number;
  genericReferenceNumber?: string;
  locationId: number;
  warehouseId: number;
  supplierId: number;
  transactionDate: string;
  status?: TransactionStatus;
  externalReference?: string;
  supplierReference?: string;
  packingSlipNumber?: string;
  deliveryNoteNumber?: string;
  carrierName?: string;
  trackingNumber?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  freightCost?: number;
  insuranceCost?: number;
  customsDuty?: number;
  otherCharges?: number;
  notes?: string;
  priority: Priority;
  overallQualityStatus: QualityStatus;
  requiresInspection: boolean;
  receivedBy: number;
  items: MultiItemReceiveItem[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
}

export interface MultiItemReceiveItem {
  itemId: number;
  quantity: number;
  unitCost: number;
  qualityStatus: QualityStatus;
  itemNotes?: string;
  lotNumber?: string;
  batchNumber?: string;
  expirationDate?: string;
  serialNumbers?: string[];
}

// Single Item Receive Transaction
export interface SingleItemReceiveTransaction {
  id?: number;
  itemId: number;
  locationId: number;
  quantity: number;
  unitCost: number;
  referenceNumber?: string;
  referenceType: ReferenceType;
  referenceId?: number;
  supplierId?: number;
  qualityStatus: QualityStatus;
  status?: TransactionStatus;
  expectedDate?: string;
  receivedDate: string;
  freightCost?: number;
  customsCost?: number;
  supplierReference?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
}

// Multi-Item Issue Transaction
export interface MultiItemIssueTransaction {
  id?: number;
  locationId: number;
  transactionDate: string;
  status?: TransactionStatus;
  issueType: IssueType;
  referenceType: ReferenceType;
  referenceId?: number;
  referenceNumber?: string;
  priority: Priority;
  purpose?: string;
  issuedBy: string;
  authorizedBy?: string;
  requiresQualityCheck: boolean;
  qualityNotes?: string;
  notes?: string;
  customerId?: number;
  customerReference?: string;
  items: MultiItemIssueItem[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
}

export interface MultiItemIssueItem {
  itemId: number;
  quantity: number;
  unitCost: number;
  lotNumber?: string;
  batchNumber?: string;
  qualityStatus: QualityStatus;
  qualityNotes?: string;
  itemNotes?: string;
  expirationDate?: string;
  serialNumbers?: string[];
}

// Single Item Issue Transaction
export interface SingleItemIssueTransaction {
  id?: number;
  itemId: number;
  locationId: number;
  quantity: number;
  unitCost: number;
  issueType: IssueType;
  referenceNumber?: string;
  referenceType: ReferenceType;
  status?: TransactionStatus;
  customerId?: number;
  customerReference?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
}

// Request interfaces
export interface CreateMultiItemReceiveRequest extends Omit<MultiItemReceiveTransaction, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

export interface CreateSingleItemReceiveRequest extends Omit<SingleItemReceiveTransaction, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

export interface CreateMultiItemIssueRequest extends Omit<MultiItemIssueTransaction, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

export interface CreateSingleItemIssueRequest extends Omit<SingleItemIssueTransaction, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

// Query parameters for transaction endpoints
export interface TransactionQueryParams {
  page?: number;
  size?: number;
  itemId?: number;
  locationId?: number;
  transactionType?: TransactionType;
  startDate?: string;
  endDate?: string;
  status?: TransactionStatus;
  priority?: Priority;
  qualityStatus?: QualityStatus;
  supplierId?: number;
  customerId?: number;
  referenceType?: ReferenceType;
  referenceNumber?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

// Generic transaction interface for responses
export interface Transaction {
  id: number;
  transactionType: TransactionType;
  referenceNumber?: string;
  transactionDate: string;
  status: TransactionStatus;
  locationId: number;
  notes?: string;
  totalValue?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  
  // Location details
  location?: {
    id: number;
    name: string;
    code: string;
  };
  
  // Creator details
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

// Transaction summary for dashboard and reporting
export interface TransactionSummary {
  totalTransactions: number;
  totalValue: number;
  transactionsByType: {
    [key in TransactionType]?: number;
  };
  valueByType: {
    [key in TransactionType]?: number;
  };
  transactionsByStatus: {
    [key in TransactionStatus]?: number;
  };
  recentTransactions: Transaction[];
}

// Stock movement history for an item
export interface StockMovementHistoryItem {
  transactionId: number;
  transactionType: TransactionType;
  transactionDate: string;
  quantity: number;
  locationId: number;
  locationName: string;
  referenceNumber?: string;
  notes?: string;
  unitCost?: number;
  totalValue?: number;
}

// State interface for transactions store
export interface TransactionState {
  multiItemReceives: MultiItemReceiveTransaction[];
  singleItemReceives: SingleItemReceiveTransaction[];
  multiItemIssues: MultiItemIssueTransaction[];
  singleItemIssues: SingleItemIssueTransaction[];
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  summary: TransactionSummary | null;
  stockMovementHistory: StockMovementHistoryItem[];
  loading: boolean;
  error: string | null;
  
  // Legacy support
  isLoading: boolean;
  useMockData: boolean;
  
  // Actions
  getAllTransactions: (params?: TransactionQueryParams) => Promise<PaginatedResponse<Transaction>>;
  getTransactionById: (id: number) => Promise<Transaction>;
  createMultiItemReceive: (request: CreateMultiItemReceiveRequest) => Promise<MultiItemReceiveTransaction>;
  createSingleItemReceive: (request: CreateSingleItemReceiveRequest) => Promise<SingleItemReceiveTransaction>;
  createMultiItemIssue: (request: CreateMultiItemIssueRequest) => Promise<MultiItemIssueTransaction>;
  createSingleItemIssue: (request: CreateSingleItemIssueRequest) => Promise<SingleItemIssueTransaction>;
  updateTransactionStatus: (id: number, status: TransactionStatus) => Promise<Transaction>;
  cancelTransaction: (id: number, reason: string) => Promise<Transaction>;
  getTransactionsByItem: (itemId: number, params?: TransactionQueryParams) => Promise<PaginatedResponse<Transaction>>;
  getTransactionsByLocation: (locationId: number, params?: TransactionQueryParams) => Promise<PaginatedResponse<Transaction>>;
  getStockMovementHistory: (itemId: number, locationId?: number) => Promise<StockMovementHistoryItem[]>;
  getTransactionSummary: (params?: TransactionQueryParams) => Promise<TransactionSummary>;
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