// Enums for suppliers
export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL';

export type PaymentAccountType = 'INDIVIDUAL' | 'BUSINESS' | 'CORPORATE';

export type DataSource = 'LOCAL' | 'QUICKBOOKS' | 'EXTERNAL';

export type SupplierRating = 1 | 2 | 3 | 4 | 5;

export type SupplierPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'PREFERRED';

// Payment Term interface
export interface PaymentTerm {
  id: number;
  name: string;
  dueDays: number;
  description?: string;
  isActive: boolean;
  created: string;
  updated: string;
  createdBy?: number;
  updatedBy?: number;
}

// Bank interface
export interface Bank {
  id: number;
  name: string;
  code: string;
  swiftCode?: string;
  branchCode?: string;
  address?: string;
  isActive: boolean;
  created: string;
  updated: string;
}

// Supplier Group interface
export interface SupplierGroup {
  id: number;
  name: string;
  description?: string;
  parentGroupId?: number;
  isActive: boolean;
  supplierCount?: number;
  created: string;
  updated: string;
  createdBy?: number;
  updatedBy?: number;
}

// Supplier Contact interface
export interface SupplierContact {
  id?: number;
  supplierId: number;
  name: string;
  title?: string;
  email?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  isPrimary: boolean;
  department?: string;
  notes?: string;
  created?: string;
  updated?: string;
}

// Supplier Address interface
export interface SupplierAddress {
  id?: number;
  supplierId: number;
  type: 'BILLING' | 'SHIPPING' | 'MAILING' | 'OFFICE';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  created?: string;
  updated?: string;
}

// Core Supplier interface
export interface Supplier {
  id: number;
  
  // Basic Information
  name: string;
  displayName?: string;
  code?: string;
  taxId: string;
  registrationNumber?: string;
  website?: string;
  
  // Contact Information
  phoneNumber: string;
  email: string;
  contactPhoneNumber: string;
  faxNumber?: string;
  
  // Address Information
  address: string;
  billingAddress?: string;
  shippingAddress?: string;
  
  // Payment Information
  paymentAccountType: PaymentAccountType;
  bankAccountNo: string;
  tillNumber: string;
  paybillNumber: string;
  bankId: number | null;
  bank: Bank | null;
  paymentTerm: PaymentTerm;
  creditLimit?: number;
  currentBalance?: number;
  
  // Mobile Money Information
  airtimePhoneNumber: string;
  mobileMoneyProvider?: string;
  
  // Classification and Grouping
  group: SupplierGroup | null;
  category?: string;
  priority: SupplierPriority;
  rating?: SupplierRating;
  
  // Business Information
  businessType?: string;
  industry?: string;
  companySize?: string;
  yearsInBusiness?: number;
  
  // Performance Metrics
  totalOrders?: number;
  totalPurchaseValue?: number;
  averageOrderValue?: number;
  onTimeDeliveryRate?: number;
  qualityRating?: number;
  lastOrderDate?: string;
  
  // Terms and Conditions
  leadTime?: number;
  minimumOrderValue?: number;
  shippingTerms?: string;
  returnPolicy?: string;
  warrantyTerms?: string;
  
  // Data Source and Sync
  dataSource: DataSource;
  externalId: string | null;
  syncToken: string | null;
  lastSyncTime: string | null;
  local: boolean;
  quickBooks: boolean;
  
  // Status and Approval
  status: SupplierStatus;
  isApproved: boolean;
  approvedBy?: number;
  approvedAt?: string;
  isBlocked: boolean;
  blockReason?: string;
  blockedBy?: number;
  blockedAt?: string;
  
  // Additional Information
  notes?: string;
  internalNotes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  
  // Related Data
  contacts?: SupplierContact[];
  addresses?: SupplierAddress[];
  
  // System Fields
  displayId: string;
  tenantId?: string;
  created: string;
  updated: string;
  createdBy: number;
  updatedBy?: number;
  version?: number;
}

// Request interfaces
export interface CreateSupplierRequest {
  // Basic Information
  name: string;
  code?: string;
  taxId?: string;
  registrationNumber?: string;
  website?: string;
  
  // Contact Information
  phoneNumber: string;
  email: string;
  contactPhoneNumber: string;
  faxNumber?: string;
  
  // Address Information
  address: string;
  billingAddress?: string;
  shippingAddress?: string;
  
  // Payment Information
  paymentAccountType: PaymentAccountType;
  bankAccountNo?: string;
  tillNumber?: string;
  paybillNumber?: string;
  bankId?: number;
  paymentTermId: number;
  creditLimit?: number;
  
  // Mobile Money Information
  airtimePhoneNumber?: string;
  mobileMoneyProvider?: string;
  
  // Classification
  groupId?: number;
  category?: string;
  priority?: SupplierPriority;
  rating?: SupplierRating;
  
  // Business Information
  businessType?: string;
  industry?: string;
  companySize?: string;
  yearsInBusiness?: number;
  
  // Terms and Conditions
  leadTime?: number;
  minimumOrderValue?: number;
  shippingTerms?: string;
  returnPolicy?: string;
  warrantyTerms?: string;
  
  // Additional Information
  notes?: string;
  internalNotes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  
  // Contacts and Addresses
  contacts?: CreateSupplierContactRequest[];
  addresses?: CreateSupplierAddressRequest[];
}

export interface CreateSupplierContactRequest {
  name: string;
  title?: string;
  email?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  isPrimary: boolean;
  department?: string;
  notes?: string;
}

export interface CreateSupplierAddressRequest {
  type: 'BILLING' | 'SHIPPING' | 'MAILING' | 'OFFICE';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {
  id: number;
}

export interface UpdateSupplierContactRequest extends Partial<CreateSupplierContactRequest> {
  id?: number;
  supplierId: number;
}

export interface UpdateSupplierAddressRequest extends Partial<CreateSupplierAddressRequest> {
  id?: number;
  supplierId: number;
}

// Query parameters for supplier endpoints
export interface SupplierQueryParams {
  page?: number;
  pageSize?: number;
  status?: SupplierStatus | 'all';
  paymentAccountType?: PaymentAccountType | 'all';
  dataSource?: DataSource | 'all';
  bankId?: number | 'all';
  groupId?: number | 'all';
  paymentTermId?: number | 'all';
  priority?: SupplierPriority | 'all';
  rating?: SupplierRating | 'all';
  category?: string | 'all';
  local?: boolean;
  quickBooks?: boolean;
  isApproved?: boolean;
  isBlocked?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeContacts?: boolean;
  includeAddresses?: boolean;
}

// Supplier Filters interface
export interface SupplierFilters {
  status?: SupplierStatus;
  paymentAccountType?: PaymentAccountType;
  dataSource?: DataSource;
  bankId?: number;
  groupId?: number;
  paymentTermId?: number;
  priority?: SupplierPriority;
  rating?: SupplierRating;
  category?: string;
  search?: string;
  local?: boolean;
  quickBooks?: boolean;
  isApproved?: boolean;
  isBlocked?: boolean;
  minCreditLimit?: number;
  maxCreditLimit?: number;
  minTotalPurchaseValue?: number;
  maxTotalPurchaseValue?: number;
  hasContacts?: boolean;
  hasAddresses?: boolean;
  tags?: string[];
}

// Supplier Analytics interfaces
export interface SupplierSummary {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  pendingApproval: number;
  blockedSuppliers: number;
  totalPurchaseValue: number;
  averagePurchaseValue: number;
  topSuppliers: {
    supplierId: number;
    supplierName: string;
    totalPurchaseValue: number;
    orderCount: number;
    percentage: number;
  }[];
  suppliersByCategory: {
    category: string;
    count: number;
    totalValue: number;
  }[];
  suppliersByRating: {
    rating: SupplierRating;
    count: number;
    percentage: number;
  }[];
  averagePaymentTerms: number;
  averageLeadTime: number;
}

export interface SupplierMetrics {
  period: string;
  newSuppliers: number;
  totalSuppliers: number;
  supplierGrowthRate: number;
  averageSupplierRating: number;
  suppliersByPaymentType: {
    paymentType: PaymentAccountType;
    count: number;
    percentage: number;
  }[];
  suppliersByDataSource: {
    dataSource: DataSource;
    count: number;
    percentage: number;
  }[];
  performanceMetrics: {
    averageOnTimeDelivery: number;
    averageQualityRating: number;
    averageResponseTime: number;
    supplierRetentionRate: number;
  };
  topPerformingSuppliers: {
    supplierId: number;
    supplierName: string;
    performanceScore: number;
    onTimeDeliveryRate: number;
    qualityRating: number;
  }[];
}

// Supplier Performance interface
export interface SupplierPerformance {
  supplierId: number;
  supplierName: string;
  totalOrders: number;
  totalValue: number;
  averageOrderValue: number;
  onTimeDeliveryRate: number;
  qualityRating: number;
  responseTime: number;
  defectRate: number;
  returnRate: number;
  priceCompetitiveness: number;
  overallScore: number;
  period: string;
  lastUpdated: string;
}

// Supplier Approval interfaces
export interface SupplierApprovalRequest {
  supplierId: number;
  action: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'REACTIVATE';
  reason?: string;
  comments?: string;
  conditions?: string[];
}

export interface SupplierApprovalResponse {
  supplierId: number;
  status: SupplierStatus;
  approvedBy?: number;
  approvedAt?: string;
  rejectedBy?: number;
  rejectedAt?: string;
  reason?: string;
  comments?: string;
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

// Validation response interface
export interface SupplierValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedFields: Record<string, boolean>;
}

// Export/Import interfaces
export interface SupplierExport {
  suppliers: Supplier[];
  exportedAt: string;
  exportedBy: number;
  version: string;
  tenantId: string;
  includeContacts: boolean;
  includeAddresses: boolean;
  includePerformanceData: boolean;
}

export interface SupplierImport {
  suppliers: CreateSupplierRequest[];
  importMode: 'CREATE_ONLY' | 'UPDATE_ONLY' | 'CREATE_OR_UPDATE' | 'VALIDATE_ONLY';
  preserveExistingData?: boolean;
  autoApprove?: boolean;
  skipDuplicates?: boolean;
}

// State interface for supplier management
export interface SupplierState {
  suppliers: Supplier[];
  currentSupplier: Supplier | null;
  suppliersList: Supplier[];
  contacts: SupplierContact[];
  addresses: SupplierAddress[];
  groups: SupplierGroup[];
  banks: Bank[];
  paymentTerms: PaymentTerm[];
  supplierSummary: SupplierSummary | null;
  supplierMetrics: SupplierMetrics | null;
  performanceData: SupplierPerformance[];
  loading: boolean;
  error: string | null;
  validationResult: SupplierValidation | null;
  
  // Legacy support
  isLoading: boolean;
  useMockData: boolean;
  
  // Actions
  getPaginatedlSuppliers: (params?: SupplierQueryParams) => Promise<PaginatedResponse<Supplier>>;
  getAllSuppliers: (params?: SupplierQueryParams) => Promise<Supplier[]>;
  getSupplierById: (id: number) => Promise<Supplier>;
  getSupplierByCode: (code: string) => Promise<Supplier>;
  getSuppliersByGroup: (groupId: number, params?: SupplierQueryParams) => Promise<PaginatedResponse<Supplier>>;
  getSuppliersByStatus: (status: SupplierStatus, params?: SupplierQueryParams) => Promise<PaginatedResponse<Supplier>>;
  createSupplier: (supplier: CreateSupplierRequest) => Promise<Supplier>;
  updateSupplier: (id: number, supplier: UpdateSupplierRequest) => Promise<Supplier>;
  deleteSupplier: (id: number) => Promise<void>;
  blockSupplier: (id: number, reason: string) => Promise<Supplier>;
  unblockSupplier: (id: number) => Promise<Supplier>;
  searchSuppliers: (searchTerm: string, params?: SupplierQueryParams) => Promise<PaginatedResponse<Supplier>>;
  
  // Contact actions
  getSupplierContacts: (supplierId: number) => Promise<SupplierContact[]>;
  addSupplierContact: (supplierId: number, contact: CreateSupplierContactRequest) => Promise<SupplierContact>;
  updateSupplierContact: (contact: UpdateSupplierContactRequest) => Promise<SupplierContact>;
  removeSupplierContact: (supplierId: number, contactId: number) => Promise<void>;
  
  // Address actions
  getSupplierAddresses: (supplierId: number) => Promise<SupplierAddress[]>;
  addSupplierAddress: (supplierId: number, address: CreateSupplierAddressRequest) => Promise<SupplierAddress>;
  updateSupplierAddress: (address: UpdateSupplierAddressRequest) => Promise<SupplierAddress>;
  removeSupplierAddress: (supplierId: number, addressId: number) => Promise<void>;
  
  // Approval actions
  submitSupplierForApproval: (supplierId: number) => Promise<Supplier>;
  approveSupplier: (request: SupplierApprovalRequest) => Promise<SupplierApprovalResponse>;
  rejectSupplier: (request: SupplierApprovalRequest) => Promise<SupplierApprovalResponse>;
  getPendingApprovals: (params?: SupplierQueryParams) => Promise<PaginatedResponse<Supplier>>;
  
  // Group management actions
  getAllGroups: () => Promise<SupplierGroup[]>;
  createGroup: (group: Omit<SupplierGroup, 'id' | 'created' | 'updated'>) => Promise<SupplierGroup>;
  updateGroup: (id: number, group: Partial<SupplierGroup>) => Promise<SupplierGroup>;
  deleteGroup: (id: number) => Promise<void>;
  
  // Bank and payment term actions
  getAllBanks: () => Promise<Bank[]>;
  getAllPaymentTerms: () => Promise<PaymentTerm[]>;
  
  // Analytics actions
  getSupplierSummary: (dateFrom?: string, dateTo?: string) => Promise<SupplierSummary>;
  getSupplierMetrics: (period: string) => Promise<SupplierMetrics>;
  getSupplierPerformance: (supplierId?: number, period?: string) => Promise<SupplierPerformance[]>;
  
  // Utility actions
  validateSupplier: (supplier: CreateSupplierRequest) => Promise<SupplierValidation>;
  exportSuppliers: (params?: SupplierQueryParams) => Promise<SupplierExport>;
  importSuppliers: (importData: SupplierImport) => Promise<Supplier[]>;
  generateSupplierCode: (name: string) => Promise<string>;
  checkSupplierCodeAvailability: (code: string) => Promise<boolean>;
  calculateSupplierScore: (supplierId: number) => Promise<number>;
}

// Validation rules constants
export const SUPPLIER_VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  CODE_MAX_LENGTH: 20,
  TAX_ID_MAX_LENGTH: 50,
  PHONE_NUMBER_MAX_LENGTH: 20,
  EMAIL_MAX_LENGTH: 100,
  ADDRESS_MAX_LENGTH: 500,
  NOTES_MAX_LENGTH: 2000,
  INTERNAL_NOTES_MAX_LENGTH: 2000,
  MIN_CREDIT_LIMIT: 0,
  MAX_CREDIT_LIMIT: 999999999.99,
  MIN_ORDER_VALUE: 0.01,
  MAX_ORDER_VALUE: 999999999.99,
  MIN_LEAD_TIME: 0,
  MAX_LEAD_TIME: 365,
  MAX_CONTACTS: 50,
  MAX_ADDRESSES: 10,
  MAX_TAGS: 20,
  TAG_MAX_LENGTH: 50
} as const;

// Error messages for validation
export const SUPPLIER_VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  NAME_REQUIRED: 'Supplier name is required',
  EMAIL_INVALID: 'Invalid email format',
  PHONE_INVALID: 'Invalid phone number format',
  TAX_ID_INVALID: 'Invalid tax ID format',
  CODE_DUPLICATE: 'Supplier code already exists',
  EMAIL_DUPLICATE: 'Email address already exists',
  PHONE_DUPLICATE: 'Phone number already exists',
  INVALID_CREDIT_LIMIT: 'Credit limit must be zero or positive',
  INVALID_LEAD_TIME: 'Lead time must be between 0 and 365 days',
  INVALID_MINIMUM_ORDER_VALUE: 'Minimum order value must be positive',
  PAYMENT_TERM_REQUIRED: 'Payment term is required',
  BANK_ACCOUNT_REQUIRED: 'Bank account is required for bank payment type',
  TILL_NUMBER_REQUIRED: 'Till number is required for till payment type',
  PAYBILL_NUMBER_REQUIRED: 'Paybill number is required for paybill payment type',
  CONTACT_LIMIT_EXCEEDED: 'Maximum number of contacts exceeded',
  ADDRESS_LIMIT_EXCEEDED: 'Maximum number of addresses exceeded',
  PRIMARY_CONTACT_REQUIRED: 'At least one primary contact is required',
  PRIMARY_ADDRESS_REQUIRED: 'At least one primary address is required',
  SUPPLIER_NOT_FOUND: 'Supplier not found',
  SUPPLIER_BLOCKED: 'Supplier is blocked and cannot be used',
  SUPPLIER_NOT_APPROVED: 'Supplier is not approved',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action',
  SUPPLIER_HAS_ACTIVE_ORDERS: 'Cannot delete supplier with active purchase orders',
  INVALID_PERFORMANCE_PERIOD: 'Invalid performance period specified'
} as const;