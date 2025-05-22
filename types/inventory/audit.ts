/**
 * Audit log severity levels
 */
export type AuditSeverity = 'info' | 'warning' | 'critical';

/**
 * Common audit action types in the inventory system
 */
export type AuditAction = 
  // Item actions
  | 'item_created'
  | 'item_updated'
  | 'item_deleted'
  | 'item_status_changed'
  
  // Stock actions
  | 'stock_increased'
  | 'stock_decreased'
  | 'stock_transferred'
  | 'low_stock_alert'
  
  // Transaction actions
  | 'transaction_created'
  | 'transaction_updated' 
  | 'transaction_completed'
  | 'transaction_voided'
  
  // Document actions
  | 'document_uploaded'
  | 'document_updated'
  | 'document_deleted'
  | 'document_viewed'
  
  // Cycle count actions
  | 'count_started'
  | 'count_updated'
  | 'count_completed'
  | 'variance_approved'
  
  // Location actions
  | 'location_created'
  | 'location_updated'
  | 'location_deleted'
  | 'location_activated'
  | 'location_deactivated'
  
  // User actions
  | 'user_login'
  | 'user_logout'
  | 'failed_login_attempt'
  | 'user_locked'
  | 'user_unlocked'
  | 'user_role_changed'
  
  // Other
  | 'custom';

/**
 * Entity types that can be tracked in audit logs
 */
export type AuditEntityType = 
  | 'item'
  | 'transaction'
  | 'document'
  | 'cycle_count'
  | 'location'
  | 'user'
  | 'report'
  | 'system'
  | 'other';

/**
 * Represents a single audit log entry in the system
 */
export interface AuditLog {
  /** Unique identifier for the audit log */
  id: string;
  
  /** ISO timestamp when the action occurred */
  timestamp: string;
  
  /** ID of the user who performed the action */
  userId: string;
  
  /** Display name of the user for UI presentation */
  userDisplayName?: string;
  
  /** The action that was performed */
  action: AuditAction;
  
  /** Type of entity that was affected */
  entityType: AuditEntityType;
  
  /** ID of the entity that was affected */
  entityId?: string;
  
  /** ID of the related transaction (if applicable) */
  transactionId?: string;
  
  /** Reference number of the transaction (if applicable) */
  transactionReference?: string;
  
  /** ID of the related item (if applicable) */
  itemId?: string;
  
  /** ID of the related location (if applicable) */
  locationId?: string;
  
  /** For transfers, the source location ID */
  sourceLocationId?: string;
  
  /** For transfers, the destination location ID */
  destinationLocationId?: string;
  
  /** Detailed description of what happened */
  details: string;
  
  /** IP address where the action originated */
  ipAddress?: string;
  
  /** Browser or client information */
  browser?: string;
  
  /** For change events, the previous value */
  previousValue?: string;
  
  /** For change events, the new value */
  newValue?: string;
  
  /** Severity level of the log entry */
  severity: AuditSeverity;
  
  /** Whether this log has been reviewed (for critical events) */
  reviewed?: boolean;
  
  /** Notes from the reviewer (if reviewed) */
  reviewerNotes?: string;
  
  /** ID of the user who reviewed this log */
  reviewedBy?: string;
  
  /** Timestamp when this log was reviewed */
  reviewedAt?: string;
}

/**
 * State structure for the audit store
 */
export interface AuditState {
  /** Array of audit log objects */
  auditLogs: AuditLog[];
  
  /** Flag indicating if data is currently being loaded */
  isLoading: boolean;
  
  /** Any error message from the last operation */
  error: string | null;
  
  /** Flag to toggle between mock data and real API */
  useMockData: boolean;
  
  /** Flag indicating if there are more logs to load */
  hasMoreLogs: boolean;
  
  /** Current page for pagination */
  currentPage: number;
  
  /** Number of items per page */
  pageSize: number;
  
  /** Total count of logs matching the current filter */
  totalCount: number;
}

/**
 * Date range specification for filtering audit logs
 */
export type AuditDateRange = 
  | 'all'
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom';

/**
 * Parameters for filtering audit logs
 */
export interface AuditFilters {
  /** Filter by action type */
  action?: AuditAction;
  
  /** Filter by entity type */
  entityType?: AuditEntityType;
  
  /** Filter by entity ID */
  entityId?: string;
  
  /** Filter by user ID */
  userId?: string;
  
  /** Filter by transaction ID */
  transactionId?: string;
  
  /** Filter by item ID */
  itemId?: string;
  
  /** Filter by location ID */
  locationId?: string;
  
  /** Filter by severity level */
  severity?: AuditSeverity;
  
  /** Filter by predefined date range */
  dateRange?: AuditDateRange;
  
  /** Filter by specific start date (if dateRange is 'custom') */
  startDate?: string;
  
  /** Filter by specific end date (if dateRange is 'custom') */
  endDate?: string;
  
  /** Filter by keyword search */
  searchQuery?: string;
  
  /** Filter to show only reviewed or unreviewed logs */
  reviewed?: boolean;
  
  /** Current page for pagination */
  page?: number;
  
  /** Number of items per page */
  pageSize?: number;
}

/**
 * Summary of audit activity for reporting
 */
export interface AuditActivitySummary {
  /** Total count of actions in the period */
  totalActions: number;
  
  /** Breakdown of actions by type */
  actionCounts: Record<AuditAction, number>;
  
  /** Breakdown of actions by entity type */
  entityCounts: Record<AuditEntityType, number>;
  
  /** Breakdown of actions by user */
  userCounts: Record<string, number>;
  
  /** Breakdown of logs by severity */
  severityCounts: Record<AuditSeverity, number>;
  
  /** Breakdown of actions by time period (hourly, daily, etc.) */
  timeSeries: Array<{
    timeLabel: string;
    count: number;
  }>;
}