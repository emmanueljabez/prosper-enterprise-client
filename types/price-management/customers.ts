/**
 * Customer and Customer Group related type definitions for the price management module
 */

/**
 * Customer State for store
 */
export interface CustomersState {
  customers: Customer[];
  customerGroups: CustomerGroup[];
  loading: boolean;
  error: string | null;
  useMockData: boolean;
}

/**
 * Customer data structure
 */
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  groupId?: string;
  tags?: string[];
  status: CustomerStatus;
  statusReason?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  notes?: string;
  taxExempt?: boolean;
  taxId?: string;
  totalSpent?: number;
  orderCount?: number;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  paymentTerms?: PaymentTerms;
  creditLimit?: number;
  accountManager?: string;
}

/**
 * Customer Group data structure
 */
export interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  customerCount?: number;
  discountType?: DiscountType;
  discountValue?: number;
  minimumOrderAmount?: number;
  taxExempt?: boolean;
  paymentTerms?: PaymentTerms;
  pricingTier?: string;
  orderApprovalRequired?: boolean;
  customerTags?: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

/**
 * Address data structure
 */
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

/**
 * Payment Terms data structure
 */
export interface PaymentTerms {
  type: PaymentTermType;
  days?: number;
  dueDate?: string;
  discountPercentage?: number;
  discountDays?: number;
}

/**
 * Customer status enum
 */
export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  BLOCKED = 'blocked'
}

/**
 * Payment term types
 */
export enum PaymentTermType {
  NET = 'net',
  DUE_ON_RECEIPT = 'due_on_receipt',
  END_OF_MONTH = 'end_of_month',
  END_OF_NEXT_MONTH = 'end_of_next_month',
  CUSTOM = 'custom'
}

/**
 * Discount types
 */
export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
  NONE = 'none'
}

/**
 * API response for customer data
 */
export interface CustomersResponse {
  success: boolean;
  data: {
    content: Customer[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
  message?: string;
}

/**
 * API response for customer group data
 */
export interface CustomerGroupsResponse {
  success: boolean;
  data: {
    content: CustomerGroup[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
  message?: string;
}

/**
 * API response for single customer data
 */
export interface CustomerResponse {
  success: boolean;
  data: Customer;
  message?: string;
}

/**
 * API response for single customer group data
 */
export interface CustomerGroupResponse {
  success: boolean;
  data: CustomerGroup;
  message?: string;
}

/**
 * Customer pricing tier interface
 */
export interface CustomerPricingTier {
  id: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  productCategories?: string[];
  specificProducts?: string[];
  minimumOrderAmount?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

/**
 * Customer specific price override
 */
export interface CustomerPriceOverride {
  id: string;
  customerId: string;
  productId: string;
  price: number;
  compareAtPrice?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}