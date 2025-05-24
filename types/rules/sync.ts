// Enum types for rule configuration options
export enum SyncRuleTriggerType {
  STOCK_CHANGE = 'stock_change',
  THRESHOLD = 'threshold',
  SCHEDULED = 'scheduled',
  MANUAL = 'manual'
}

export enum SyncRuleScope {
  GLOBAL = 'global',
  CATEGORY = 'category',
  PRODUCT = 'product',
  ITEM = 'item'
}

export enum SyncRuleAction {
  UPDATE_INVENTORY = 'update_inventory',
  NOTIFY_ONLY = 'notify_only',
  HIDE_PRODUCT = 'hide_product',
  SHOW_PRODUCT = 'show_product',
  CHANGE_STATUS = 'change_status'
}

export enum ScheduleFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

export enum SyncScheduleType {
  REALTIME = 'realtime',
  BATCH_HIGH = 'batch_high',
  BATCH_MEDIUM = 'batch_medium',
  BATCH_LOW = 'batch_low',
  MANUAL = 'manual'
}

// Threshold condition for triggering rules
export interface ThresholdCondition {
  type: 'absolute' | 'percentage';
  value: number;
  operator: 'less_than' | 'less_than_equal' | 'equal' | 'greater_than_equal' | 'greater_than';
}

// Schedule configuration for scheduled triggers
export interface ScheduleConfig {
  frequency: ScheduleFrequency;
  time?: string; // ISO time string for daily/weekly/monthly
  dayOfWeek?: number; // 0-6, 0 is Sunday (for weekly)
  dayOfMonth?: number; // 1-31 (for monthly)
  customCron?: string; // For custom schedules using cron syntax
}

// Notification options
export interface NotificationConfig {
  enabled: boolean;
  channels: ('email' | 'sms' | 'push' | 'webhook')[];
  recipients?: string[]; // User IDs or email addresses
  webhookUrl?: string;
  template?: string;
}

// Main SyncRule interface
export interface SyncRule {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  priority: number;
  scope: SyncRuleScope;
  categoryIds?: string[]; // Used when scope is CATEGORY
  productIds?: string[]; // Used when scope is PRODUCT
  itemIds?: string[]; // Used when scope is ITEM
  
  // Trigger configuration
  triggerType: SyncRuleTriggerType;
  thresholdCondition?: ThresholdCondition; // Used when triggerType is THRESHOLD
  scheduleConfig?: ScheduleConfig; // Used when triggerType is SCHEDULED
  
  // Action configuration
  action: SyncRuleAction;
  actionConfig?: {
    status?: string; // Used when action is CHANGE_STATUS
    notifyStaff?: boolean;
    updateDisplayed?: boolean;
    redirectToAlternative?: boolean;
    alternativeProductId?: string;
  };
  
  // Notification settings
  notifications?: NotificationConfig;
  
  // Metadata
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Sync Schedule interface
export interface SyncSchedule {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  type: SyncScheduleType;
  
  // Schedule settings
  schedule: ScheduleConfig;
  
  // Scope configuration
  scope: SyncRuleScope;
  categoryIds?: string[]; // Used when scope is CATEGORY
  productIds?: string[]; // Used when scope is PRODUCT
  itemIds?: string[]; // Used when scope is ITEM
  
  // Performance settings
  batchSize?: number;
  maxRuntime?: number; // in seconds
  retryCount?: number;
  priority?: number;
  
  // Conflict resolution
  conflictResolution?: 'skip' | 'overwrite' | 'merge';
  
  // Notification settings
  notifications?: NotificationConfig;
  
  // Error handling
  errorHandling?: {
    stopOnError: boolean;
    logErrors: boolean;
    alertOnError: boolean;
  };
  
  // Metadata
  lastRunAt?: string;
  nextRunAt?: string;
  lastRunStatus?: 'success' | 'partial' | 'failed' | 'cancelled';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  
  // Performance optimization
  optimizationReviewed?: boolean;
  optimizationSuggested?: boolean;
  optimizationMessage?: string;
}

// Sync Schedule execution history
export interface SyncScheduleExecution {
  id: string;
  scheduleId: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  itemsProcessed?: number;
  itemsSucceeded?: number;
  itemsFailed?: number;
  errorMessage?: string;
  logs?: string[];
}

// Request types for API operations
export interface CreateSyncRuleRequest extends Omit<SyncRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> {}

export interface UpdateSyncRuleRequest extends Partial<Omit<SyncRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>> {}

export interface BulkUpdateSyncRuleRequest {
  ids: string[];
  updates: UpdateSyncRuleRequest;
}

// Schedule request types
export interface CreateSyncScheduleRequest extends Omit<SyncSchedule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'lastRunAt' | 'nextRunAt' | 'lastRunStatus'> {}

export interface UpdateSyncScheduleRequest extends Partial<Omit<SyncSchedule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'lastRunAt' | 'nextRunAt' | 'lastRunStatus'>> {}

export interface BulkUpdateSyncScheduleRequest {
  scheduleIds: string[];
  updates: UpdateSyncScheduleRequest;
}

// Response types for API operations
export interface SyncRuleResponse {
  rule: SyncRule;
}

export interface SyncRulesResponse {
  rules: SyncRule[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SyncRuleUpdateResponse {
  success: boolean;
  rule: SyncRule;
}

export interface BulkSyncRuleUpdateResponse {
  success: boolean;
  updatedCount: number;
  failedIds?: string[];
}

// Schedule response types
export interface SyncScheduleResponse {
  schedule: SyncSchedule;
}

export interface SyncSchedulesResponse {
  schedules: SyncSchedule[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SyncScheduleUpdateResponse {
  success: boolean;
  schedule: SyncSchedule;
}

export interface BulkSyncScheduleUpdateResponse {
  success: boolean;
  updatedCount: number;
  failedIds?: string[];
}

export interface SyncScheduleExecutionResponse {
  execution: SyncScheduleExecution;
}

export interface SyncScheduleExecutionsResponse {
  executions: SyncScheduleExecution[];
  total: number;
  page: number;
  pageSize: number;
}