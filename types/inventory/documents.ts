/**
 * Document type identifiers used in the system
 */
export type DocumentType = 
  | 'invoice'
  | 'receipt'
  | 'packing_slip'
  | 'bill_of_lading'
  | 'purchase_order'
  | 'sales_order'
  | 'transfer_form'
  | 'shipping'
  | 'internal'
  | 'product_image'
  | 'count'
  | 'incident'
  | 'quality'
  | 'quote'
  | 'catalog'
  | 'report'
  | 'other';

/**
 * Document object representing a file in the inventory system
 */
export interface Document {
  /** Unique identifier for the document */
  id: string;
  
  /** File name with extension */
  name: string;
  
  /** Type categorization of the document */
  type: DocumentType;
  
  /** Optional description of the document contents */
  description?: string;
  
  /** File size in bytes */
  size: number;
  
  /** MIME type of the file */
  fileType: string;
  
  /** URL to access the document */
  url: string;
  
  /** Optional URL to a thumbnail image for preview */
  thumbnail?: string | null;
  
  /** Optional ID of the transaction this document is associated with */
  transactionId?: string | null;
  
  /** Optional reference number of the transaction (for display) */
  transactionReference?: string | null;
  
  /** Optional ID of the location this document is associated with */
  locationId?: string | null;
  
  /** Timestamp when the document was created */
  createdAt: string;
  
  /** Timestamp when the document was last updated */
  updatedAt: string;
  
  /** ID of the user who created the document */
  createdBy: string;
  
  /** Optional array of tags for document categorization */
  tags?: string[];
  
  /** Optional protection status (read-only, etc.) */
  protection?: 'none' | 'read-only' | 'confidential';
  
  /** Optional metadata properties as key-value pairs */
  metadata?: Record<string, any>;
}

/**
 * State structure for the documents store
 */
export interface DocumentState {
  /** Array of document objects */
  documents: Document[];
  
  /** Flag indicating if data is currently being loaded */
  isLoading: boolean;
  
  /** Any error message from the last operation */
  error: string | null;
  
  /** Flag to toggle between mock data and real API */
  useMockData: boolean;
  
  /** Flag indicating if there are more documents to load */
  hasMoreDocuments: boolean;
  
  /** Current page for pagination */
  currentPage: number;
  
  /** Number of items per page */
  pageSize: number;
}

/**
 * Date range specification for filtering documents
 */
export type DocumentDateRange = 
  | 'all'
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom';

/**
 * Parameters for filtering documents
 */
export interface DocumentFilters {
  /** Filter by document type */
  type?: DocumentType | 'all';
  
  /** Filter by associated transaction ID */
  transactionId?: string;
  
  /** Filter by associated location ID */
  locationId?: string;
  
  /** Filter by predefined date range */
  dateRange?: DocumentDateRange;
  
  /** Filter by specific start date (if dateRange is 'custom') */
  startDate?: string;
  
  /** Filter by specific end date (if dateRange is 'custom') */
  endDate?: string;
  
  /** Filter by keyword search */
  searchQuery?: string;
  
  /** Filter by tag */
  tag?: string;
  
  /** Current page for pagination */
  page?: number;
  
  /** Number of items per page */
  pageSize?: number;
  
  /** Filter by creator user ID */
  createdBy?: string;
}

/**
 * Parameters for uploading a new document
 */
export interface DocumentUploadParams {
  /** Type categorization of the document */
  type: DocumentType;
  
  /** Optional description of the document contents */
  description?: string;
  
  /** Optional ID of the transaction this document is associated with */
  transactionId?: string;
  
  /** Optional reference number of the transaction */
  transactionReference?: string;
  
  /** Optional ID of the location this document is associated with */
  locationId?: string;
  
  /** Optional array of tags for document categorization */
  tags?: string[];
  
  /** Optional protection status */
  protection?: 'none' | 'read-only' | 'confidential';
  
  /** Optional custom name override (defaults to file.name) */
  name?: string;
  
  /** Optional metadata properties */
  metadata?: Record<string, any>;
}