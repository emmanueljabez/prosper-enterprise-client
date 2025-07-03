/**
 * Customer and Customer Group related type definitions for the price management module
 * Based on the API response structure: page=0&size=10
 */

// Enums for customers
export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL';

export type CustomerType = 'INDIVIDUAL' | 'BUSINESS' | 'CORPORATE';

export type DataSource = 'LOCAL' | 'QUICKBOOKS' | 'EXTERNAL';

export type TaxEligibilityStatus = 'ENROLLED' | 'EXEMPT' | 'PENDING' | 'NOT_APPLICABLE';

// Core Customer interface - matches API response structure
export interface Customer {
  id: number;
  name: string;
  phoneNumber: string | null;
  email: string;
  billingAddress: string | null;
  customerId: string | null;
  taxId: string | null;
  created: string;
  updated: string;
  createdBy: number;
  taxEligibilityStatus: TaxEligibilityStatus;
  customerType: CustomerType;
  dataSource: DataSource;
  externalId: string | null;
  externalSystem: string | null;
  syncToken: string | null;
  lastSyncTime: string | null;
  local: boolean;
  quickBooks: boolean;
  displayId: string;
  status: CustomerStatus;
  groupId?: number;
}

// Customer Group interface
export interface CustomerGroup {
  id: number;
  name: string;
  description?: string;
  isDefault?: boolean;
  customerCount?: number;
  discountPercentage?: number;
  created: string;
  updated: string;
  createdBy?: number;
  updatedBy?: number;
}

// Customer Contact interface
export interface CustomerContact {
  id?: number;
  customerId: number;
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

// Customer Address interface
export interface CustomerAddress {
  id?: number;
  customerId: number;
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

// Request interfaces
export interface CreateCustomerRequest {
  name: string;
  phoneNumber?: string | null;
  email: string;
  billingAddress?: string | null;
  customerId?: string | null;
  taxId?: string | null;
  taxEligibilityStatus?: TaxEligibilityStatus;
  customerType: CustomerType;
  dataSource?: DataSource;
  externalId?: string | null;
  externalSystem?: string | null;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  id: number;
}

// Query parameters for customer endpoints - matches page=0&size=10 pattern
export interface CustomerQueryParams {
  page?: number;
  size?: number;
  status?: CustomerStatus | 'all';
  customerType?: CustomerType | 'all';
  dataSource?: DataSource | 'all';
  taxEligibilityStatus?: TaxEligibilityStatus | 'all';
  local?: boolean;
  quickBooks?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Customer Filters interface
export interface CustomerFilters {
  status?: CustomerStatus;
  customerType?: CustomerType;
  dataSource?: DataSource;
  taxEligibilityStatus?: TaxEligibilityStatus;
  local?: boolean;
  quickBooks?: boolean;
  search?: string;
  hasEmail?: boolean;
  hasPhoneNumber?: boolean;
  hasBillingAddress?: boolean;
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

// Customer Analytics interfaces
export interface CustomerSummary {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  pendingApproval: number;
  customersByType: {
    customerType: CustomerType;
    count: number;
    percentage: number;
  }[];
  customersByDataSource: {
    dataSource: DataSource;
    count: number;
    percentage: number;
  }[];
  customersByTaxStatus: {
    taxEligibilityStatus: TaxEligibilityStatus;
    count: number;
    percentage: number;
  }[];
}

// State interface for customer management
export interface CustomersState {
  customers: Customer[];
  paginatedCustomers: PaginatedResponse<Customer> | null;
  selectedCustomer: Customer | null;
  customersList: Customer[];
  contacts: CustomerContact[];
  addresses: CustomerAddress[];
  groups: CustomerGroup[];
  customerSummary: CustomerSummary | null;
  searchResults: Customer[];
  loading: boolean;
  error: string | null;
  filters: CustomerQueryParams;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  
  // Legacy support
  isLoading: boolean;
  useMockData: boolean;

  getUnpaginatedCustomers: () => Promise<Customer[]>;
}

// Validation response interface
export interface CustomerValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedFields: Record<string, boolean>;
}

// Export/Import interfaces
export interface CustomerExport {
  customers: Customer[];
  exportedAt: string;
  exportedBy: number;
  version: string;
  tenantId: string;
}

export interface CustomerImport {
  customers: CreateCustomerRequest[];
  importMode: 'CREATE_ONLY' | 'UPDATE_ONLY' | 'CREATE_OR_UPDATE' | 'VALIDATE_ONLY';
  preserveExistingData?: boolean;
  skipDuplicates?: boolean;
}

// Validation rules constants
export const CUSTOMER_VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  CUSTOMER_ID_MAX_LENGTH: 20,
  TAX_ID_MAX_LENGTH: 50,
  PHONE_NUMBER_MAX_LENGTH: 20,
  EMAIL_MAX_LENGTH: 100,
  ADDRESS_MAX_LENGTH: 500,
  DISPLAY_ID_MAX_LENGTH: 50
} as const;

// Error messages for validation
export const CUSTOMER_VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  NAME_REQUIRED: 'Customer name is required',
  EMAIL_INVALID: 'Invalid email format',
  EMAIL_REQUIRED: 'Email is required',
  PHONE_INVALID: 'Invalid phone number format',
  TAX_ID_INVALID: 'Invalid tax ID format',
  CUSTOMER_ID_DUPLICATE: 'Customer ID already exists',
  EMAIL_DUPLICATE: 'Email address already exists',
  PHONE_DUPLICATE: 'Phone number already exists',
  CUSTOMER_NOT_FOUND: 'Customer not found',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action',
  CUSTOMER_HAS_ACTIVE_ORDERS: 'Cannot delete customer with active orders'
} as const;