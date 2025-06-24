// Enums for inventory settings
export type ValuationMethod = 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'STANDARD_COST';

export type BarcodeFormat = 'ITM{000000000}' | 'PRD{000000}' | 'SKU{00000000}' | 'CUSTOM';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY';

export type SyncProvider = 'QUICKBOOKS' | 'XERO' | 'SAP' | 'NONE';

// Core inventory settings interface
export interface InventorySettings {
  id?: number;
  
  // Inventory Valuation Settings
  defaultValuationMethod: ValuationMethod;
  allowNegativeStock: boolean;
  autoCreatePurchaseOrders: boolean;
  
  // Reorder Point Settings
  defaultReorderPoint: number;
  defaultReorderQuantity: number;
  enableAutoReorder: boolean;
  
  // Low Stock Alert Settings
  lowStockThresholdPercentage: number;
  enableLowStockAlerts: boolean;
  lowStockAlertFrequencyHours: number;
  
  // Barcode Settings
  autoGenerateBarcodes: boolean;
  barcodePrefix: string;
  barcodeFormat: string;
  
  // Approval Settings
  requireApprovalForAdjustments: boolean;
  adjustmentApprovalThreshold: number;
  requireApprovalForTransfers: boolean;
  transferApprovalThreshold: number;
  
  // Cost Settings
  includeFreightInCost: boolean;
  includeTaxInCost: boolean;
  defaultMarkupPercentage: number;
  
  // Expiration Settings
  enableExpirationTracking: boolean;
  expirationAlertDaysBefore: number;
  enableFefoAllocation: boolean; // First Expired, First Out
  
  // Cycle Count Settings
  enableCycleCounting: boolean;
  cycleCountFrequencyDays: number;
  cycleCountVarianceThreshold: number;
  
  // Location Settings
  enforceLocationTracking: boolean;
  allowMultiLocationItems: boolean;
  
  // Reporting Settings
  defaultCurrency: Currency;
  enableRealTimeReporting: boolean;
  reportRetentionDays: number;
  
  // Integration Settings
  enableQuickbooksSync: boolean;
  syncFrequencyHours: number;
  syncProvider?: SyncProvider;
    // System fields
  isActive?: boolean;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  version?: number;
}

// Request interfaces
export interface CreateInventorySettingsRequest {
  defaultValuationMethod: ValuationMethod;
  allowNegativeStock?: boolean;
  autoCreatePurchaseOrders?: boolean;
  defaultReorderPoint?: number;
  defaultReorderQuantity?: number;
  enableAutoReorder?: boolean;
  lowStockThresholdPercentage?: number;
  enableLowStockAlerts?: boolean;
  lowStockAlertFrequencyHours?: number;
  autoGenerateBarcodes?: boolean;
  barcodePrefix?: string;
  barcodeFormat?: string;
  requireApprovalForAdjustments?: boolean;
  adjustmentApprovalThreshold?: number;
  requireApprovalForTransfers?: boolean;
  transferApprovalThreshold?: number;
  includeFreightInCost?: boolean;
  includeTaxInCost?: boolean;
  defaultMarkupPercentage?: number;
  enableExpirationTracking?: boolean;
  expirationAlertDaysBefore?: number;
  enableFefoAllocation?: boolean;
  enableCycleCounting?: boolean;
  cycleCountFrequencyDays?: number;
  cycleCountVarianceThreshold?: number;
  enforceLocationTracking?: boolean;
  allowMultiLocationItems?: boolean;
  defaultCurrency?: Currency;
  enableRealTimeReporting?: boolean;
  reportRetentionDays?: number;
  enableQuickbooksSync?: boolean;
  syncFrequencyHours?: number;
  syncProvider?: SyncProvider;
}

export interface UpdateInventorySettingsRequest extends Partial<CreateInventorySettingsRequest> {
  id: number;
}

// Query parameters for settings endpoints
export interface InventorySettingsQueryParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  valuationMethod?: ValuationMethod;
  searchQuery?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

// Settings history interface
export interface InventorySettingsHistory {
  id: number;
  settingsId: number;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE';
  changedFields: string[];
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  changedBy: number;
  changedByName?: string;
  changeReason?: string;
  timestamp: string;
}

// Settings summary for dashboard
export interface InventorySettingsSummary {
  defaultValuationMethod: ValuationMethod;
  allowNegativeStock: boolean;
  enableLowStockAlerts: boolean;
  enableAutoReorder: boolean;
  autoGenerateBarcodes: boolean;
  requireApprovalForAdjustments: boolean;
  enableExpirationTracking: boolean;
  enableCycleCounting: boolean;
  enforceLocationTracking: boolean;
  enableRealTimeReporting: boolean;
  enableQuickbooksSync: boolean;
  defaultCurrency: Currency;
  lastUpdated: string;
  totalConfiguredSettings: number;
  activeAlertsCount: number;
}

// Validation response interface
export interface InventorySettingsValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedFields: Record<string, boolean>;
}

// Export/Import interfaces
export interface InventorySettingsExport {
  settings: InventorySettings;
  exportedAt: string;
  exportedBy: number;
  version: string;
  tenantId: string;
}

export interface InventorySettingsImport {
  settings: CreateInventorySettingsRequest;
  importMode: 'REPLACE' | 'MERGE' | 'VALIDATE_ONLY';
  preserveActiveStatus?: boolean;
}



// Generic API response interface (reused from your example)
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Settings configuration presets
export interface InventorySettingsPreset {
  id: string;
  name: string;
  description: string;
  category: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE' | 'CUSTOM';
  settings: CreateInventorySettingsRequest;
}

// Conservative preset for risk-averse businesses
export const CONSERVATIVE_PRESET: InventorySettingsPreset = {
  id: 'conservative',
  name: 'Conservative Settings',
  description: 'Risk-averse configuration with strict controls',
  category: 'CONSERVATIVE',
  settings: {
    defaultValuationMethod: 'FIFO',
    allowNegativeStock: false,
    enableAutoReorder: false,
    requireApprovalForAdjustments: true,
    adjustmentApprovalThreshold: 100.0,
    requireApprovalForTransfers: true,
    transferApprovalThreshold: 500.0,
    enableLowStockAlerts: true,
    lowStockAlertFrequencyHours: 8,
    enableExpirationTracking: true,
    enableCycleCounting: true,
    enforceLocationTracking: true,
    autoGenerateBarcodes: true,
    defaultCurrency: 'USD'
  }
};

// Aggressive preset for high-velocity businesses
export const AGGRESSIVE_PRESET: InventorySettingsPreset = {
  id: 'aggressive',
  name: 'High-Velocity Settings',
  description: 'Optimized for fast-moving, high-volume operations',
  category: 'AGGRESSIVE',
  settings: {
    defaultValuationMethod: 'WEIGHTED_AVERAGE',
    allowNegativeStock: true,
    enableAutoReorder: true,
    requireApprovalForAdjustments: false,
    requireApprovalForTransfers: false,
    enableLowStockAlerts: true,
    lowStockAlertFrequencyHours: 4,
    enableRealTimeReporting: true,
    autoGenerateBarcodes: true,
    enableExpirationTracking: false,
    enableCycleCounting: false,
    enforceLocationTracking: false,
    defaultCurrency: 'USD'
  }
};

// State interface for inventory settings management
export interface InventorySettingsState {
  settings: InventorySettings | null;
  settingsList: InventorySettings[];
  settingsHistory: InventorySettingsHistory[];
  settingsSummary: InventorySettingsSummary | null;
  loading: boolean;
  error: string | null;
  validationResult: InventorySettingsValidation | null;
  presets: InventorySettingsPreset[];
    // Actions
  getActiveSettings: () => Promise<InventorySettings>;
  getSettingsById: (id: number) => Promise<InventorySettings>;
  getAllSettings: () => Promise<InventorySettings[]>;
  getSettingsHistory: (params?: InventorySettingsQueryParams) => Promise<InventorySettingsHistory[]>;
  createSettings: (settings: CreateInventorySettingsRequest) => Promise<InventorySettings>;
  updateSettings: (id: number, settings: UpdateInventorySettingsRequest) => Promise<InventorySettings>;
  initializeSettings: () => Promise<InventorySettings>;
  resetSettings: () => Promise<InventorySettings>;
  validateSettings: (settings: CreateInventorySettingsRequest) => Promise<InventorySettingsValidation>;
  exportSettings: () => Promise<InventorySettingsExport>;
  importSettings: (importData: InventorySettingsImport) => Promise<InventorySettings>;
  getSettingsSummary: () => Promise<InventorySettingsSummary>;
}

// Validation rules constants
export const VALIDATION_RULES = {
  BARCODE_PREFIX_MAX_LENGTH: 10,
  BARCODE_FORMAT_MAX_LENGTH: 20,
  CURRENCY_LENGTH: 3,
  MAX_MARKUP_PERCENTAGE: 1000,
  MAX_THRESHOLD_PERCENTAGE: 100,
  MIN_POSITIVE_VALUE: 0.01,
  MIN_NON_NEGATIVE_VALUE: 0,
  MAX_RETENTION_DAYS: 3650, // 10 years
  MIN_FREQUENCY_HOURS: 1,
  MAX_FREQUENCY_HOURS: 8760 // 1 year
} as const;

// Error messages for validation
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_VALUATION_METHOD: 'Invalid valuation method',
  NEGATIVE_NOT_ALLOWED: 'Value must be non-negative',
  POSITIVE_REQUIRED: 'Value must be positive',
  INVALID_PERCENTAGE: 'Percentage must be between 0 and 100',
  INVALID_CURRENCY: 'Currency must be exactly 3 characters',
  BARCODE_PREFIX_TOO_LONG: `Barcode prefix cannot exceed ${VALIDATION_RULES.BARCODE_PREFIX_MAX_LENGTH} characters`,
  BARCODE_FORMAT_TOO_LONG: `Barcode format cannot exceed ${VALIDATION_RULES.BARCODE_FORMAT_MAX_LENGTH} characters`,
  MARKUP_TOO_HIGH: `Markup percentage cannot exceed ${VALIDATION_RULES.MAX_MARKUP_PERCENTAGE}%`,
  RETENTION_TOO_LONG: `Retention period cannot exceed ${VALIDATION_RULES.MAX_RETENTION_DAYS} days`
} as const;
