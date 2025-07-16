/**
 * User related type definitions based on the API response structure
 */

// Enums for users
export type UserRole = 'Administrator' | 'Team member' | 'Staff Member' | 'N/A';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export type PaymentAccountType = 'INDIVIDUAL' | 'BANK';

// Department interface
export interface Department {
  id: number;
  name: string;
  qbDepartmentId: string | null;
  pettyCashLimit: number | null;
  status: string | null;
  createdBy: number;
  created: string;
  updated: string;
}

// Supplier interface (for users who are also suppliers)
export interface UserSupplier {
  id: number;
  name: string;
  phoneNumber: string | null;
  tillNumber: string;
  paybillNumber: string;
  bankAccountNo: string;
  taxId: string | null;
  address: string | null;
  created: string;
  updated: string;
  createdBy: number;
  paymentAccountType: PaymentAccountType;
  email: string | null;
  contactPhoneNumber: string;
  bankId: number;
  bank: any | null;
  group: any | null;
  paymentTerm: any | null;
  airtimePhoneNumber: string;
  dataSource: string | null;
  externalId: string | null;
  syncToken: string | null;
  lastSyncTime: string | null;
  local: boolean;
  quickBooks: boolean;
  displayId: string | null;
}

// Core User interface - matches API response structure
export interface User {
  id: number;
  username: string;
  name: string;
  phoneNo: string;
  role: UserRole;
  status: UserStatus;
  mpesaPhoneNumber: string | null;
  bankAccountNo: string | null;
  jobTitle: string | null;
  paymentAccountType: PaymentAccountType | null;
  bankId: number | null;
  created: string | null;
  updated: string;
  createdBy: number | null;
  jwtToken: string | null;
  pushToken: string | null;
  supplier: UserSupplier | null;
  departments: Department[];
  fullName: string;
}

// Request payload for creating new users
export interface CreateUserRequest {
  username: string;
  name: string;
  phoneNo: string;
  role: UserRole;
  status?: UserStatus;
  mpesaPhoneNumber?: string;
  bankAccountNo?: string;
  jobTitle?: string;
  paymentAccountType?: PaymentAccountType;
  bankId?: number;
  departmentIds?: number[];
}

// Request payload for updating existing users
export interface UpdateUserRequest {
  username?: string;
  name?: string;
  phoneNo?: string;
  role?: UserRole;
  status?: UserStatus;
  mpesaPhoneNumber?: string;
  bankAccountNo?: string;
  jobTitle?: string;
  paymentAccountType?: PaymentAccountType;
  bankId?: number;
  departmentIds?: number[];
}

// Search filters for users
export interface UserFilters {
  searchTerm?: string;
  role?: UserRole;
  status?: UserStatus;
  departmentId?: number;
  hasSupplier?: boolean;
  sortBy?: 'name' | 'username' | 'role' | 'created' | 'updated';
  sortDirection?: 'asc' | 'desc';
}

// Pagination parameters for user listing
export interface UserPaginationParams {
  page?: number;
  size?: number;
  sort?: string[];
}

// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
  path?: string;
  status: number;
}

// Paginated response structure
export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

// API Response types for different endpoints
export type UserApiResponse = ApiResponse<User>;
export type UsersApiResponse = ApiResponse<User[]>;
export type PaginatedUsersResponse = ApiResponse<PaginatedResponse<User>>;

// Error response structure
export interface UserErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: string;
  path: string;
  status: number;
}

// User statistics for dashboard/reporting
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  inactiveUsers: number;
  usersByRole: {
    role: UserRole;
    count: number;
    percentage: number;
  }[];
  usersByDepartment: {
    departmentId: number;
    departmentName: string;
    count: number;
    percentage: number;
  }[];
  usersWithSupplierAccounts: number;
}

// Frontend state management types
export interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  filters: UserFilters;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  statistics: UserStatistics | null;
}

// Comprehensive store state interface for users
export interface UsersStoreState {
  users: User[];
  paginatedUsers: PaginatedResponse<User> | null;
  selectedUser: User | null;
  statistics: UserStatistics | null;
  loading: boolean;
  error: string | null;
  filters: UserFilters;
}

// Request/Response types for specific endpoints
export interface GetUsersRequest extends UserPaginationParams {
  filters?: UserFilters;
}

// POST / (create user)
export type CreateUserResponse = UserApiResponse;

// PUT /{id} (update user)
export type UpdateUserResponse = UserApiResponse;

// GET /{id} (get user by id)
export type GetUserResponse = UserApiResponse;

// DELETE /{id} (delete user)
export interface DeleteUserResponse extends ApiResponse<null> {
  deletedRelatedRecords?: number;
}

// GET /tenant (get tenant users)
export type GetTenantUsersResponse = UsersApiResponse;

// Utility types for form validation
export type UserFormData = CreateUserRequest | UpdateUserRequest;
export type UserFormErrors = Partial<Record<keyof UserFormData, string>>;

// Constants and enums
export const USER_VALIDATION_LIMITS = {
  USERNAME_MAX_LENGTH: 100,
  NAME_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  JOB_TITLE_MAX_LENGTH: 100,
  BANK_ACCOUNT_MAX_LENGTH: 50
} as const;

export const USER_SORT_OPTIONS = [
  { value: 'name,asc', label: 'Name (A-Z)' },
  { value: 'name,desc', label: 'Name (Z-A)' },
  { value: 'username,asc', label: 'Username (A-Z)' },
  { value: 'username,desc', label: 'Username (Z-A)' },
  { value: 'role,asc', label: 'Role (A-Z)' },
  { value: 'role,desc', label: 'Role (Z-A)' },
  { value: 'created,desc', label: 'Newest First' },
  { value: 'created,asc', label: 'Oldest First' }
] as const;

export type UserSortOption = typeof USER_SORT_OPTIONS[number]['value'];

// Validation messages for user operations
export const USER_VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  USERNAME_REQUIRED: 'Username is required',
  NAME_REQUIRED: 'Name is required',
  PHONE_REQUIRED: 'Phone number is required',
  PHONE_INVALID: 'Invalid phone number format',
  USERNAME_INVALID: 'Invalid username format',
  USERNAME_DUPLICATE: 'Username already exists',
  PHONE_DUPLICATE: 'Phone number already exists',
  USER_NOT_FOUND: 'User not found',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action',
  USER_HAS_ACTIVE_SESSIONS: 'Cannot delete user with active sessions'
} as const;
