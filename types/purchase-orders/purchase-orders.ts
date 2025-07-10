// Enums for purchase orders
export type PurchaseOrderStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED' | 'CLOSED';

export type PurchaseOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type PaymentTerms = 'NET_30' | 'NET_60' | 'NET_90' | 'COD' | 'PREPAID' | 'DUE_ON_RECEIPT';

export type PaymentAccountType = 'PAYBILL' | 'BANK_ACCOUNT' | 'CASH';

export type ReceivingStatus = 'NOT_RECEIVED' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED' | 'OVER_RECEIVED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUIRES_REAPPROVAL';

export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIALLY_PAID';

// Supplier interface
export interface Supplier {
  id: number;
  name: string;
  phoneNumber: string;
  tillNumber: string;
  bankAccountNo: string;
  taxId?: number;
  address: string;
  created: string;
  updated: string;
  paymentAccountType: PaymentAccountType;
  email?: string;
  contactPhoneNumber?: string;
  bankId?: number;
  group?: string;
  paymentTerm?: string;
  lastSyncItem?: number;
  local?: boolean;
  quickBooks?: boolean;
  displayId?: string;
}

// Purchase Order Line Item interface
export interface PurchaseOrderLineItem {
  id?: number;
  purchaseOrderId?: number;
  itemId: number;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity?: number;
  remainingQuantity?: number;
  notes?: string;
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  taxAmount?: number;
  lineTotal: number;
  
  // Related data
  item?: {
    id: number;
    itemCode: string;
    itemName: string;
    description?: string;
    baseUnitOfMeasure?: string;
  };
  
  // System fields
  createdAt?: string;
  updatedAt?: string;
}

// Core Purchase Order interface
export interface PurchaseOrder {
  id?: number;
  
  // Basic Information
  orderNumber: string;
  supplierId: number;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  
  // Status and Priority
  status: PurchaseOrderStatus;
  priority: PurchaseOrderPriority;
  approvalStatus: ApprovalStatus;
  
  // Financial Information
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  
  // Payment and Terms
  paymentTerms: PaymentTerms;
  paymentDueDate?: string;
  currencyCode: string;
  exchangeRate?: number;
  
  // Delivery Information
  deliveryAddress?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  
  // Additional Information
  notes?: string;
  internalNotes?: string;
  referenceNumber?: string;
  requisitionNumber?: string;
  
  // Line Items
  lineItems: PurchaseOrderLineItem[];
  
  // Related Data
  supplier?: Supplier;
  
  // Approval Information
  requestedBy?: number;
  approvedBy?: number;
  approvedAt?: string;
  rejectedBy?: number;
  rejectedAt?: string;
  rejectionReason?: string;
  
  // Receiving Information
  receivingStatus: ReceivingStatus;
  partialReceivingAllowed: boolean;
  
  // System fields
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  version?: number;
}

// Request interfaces
export interface CreatePurchaseOrderRequest {
  orderNumber?: string; // Auto-generated if not provided
  supplierId: number;
  orderDate: string;
  expectedDeliveryDate?: string;
  status?: PurchaseOrderStatus;
  priority?: PurchaseOrderPriority;
  paymentTerms: PaymentTerms;
  currencyCode: string;
  exchangeRate?: number;
  deliveryAddress?: string;
  shippingMethod?: string;
  notes?: string;
  internalNotes?: string;
  referenceNumber?: string;
  requisitionNumber?: string;
  partialReceivingAllowed?: boolean;
  lineItems: CreatePurchaseOrderLineItemRequest[];
}

export interface CreatePurchaseOrderLineItemRequest {
  itemId: number;
  quantity: number;
  unitCost: number;
  notes?: string;
  discountPercent?: number;
  taxPercent?: number;
}

export interface UpdatePurchaseOrderRequest extends Partial<CreatePurchaseOrderRequest> {
  id: number;
}

export interface UpdatePurchaseOrderLineItemRequest extends Partial<CreatePurchaseOrderLineItemRequest> {
  id?: number;
  purchaseOrderId: number;
}

// Query parameters for purchase order endpoints
export interface PurchaseOrderQueryParams {
  page: number | 0;
  pageSize: number | 0;
  startCreatedDate: string | 'all';
  endCreatedDate: string | 'all';
  raisedById: number | 'all';
  vendorId: number | 'all';
  status: PurchaseOrderStatus | 'all';
  startDueDate: string | 'all';
  paymentTermsId: number | 0;
  endDueDate: string | 'all';
  requisitionId: number | 0;
  approvalStatus: ApprovalStatus | 'all';
  deliveryStatus: ReceivingStatus | 'all';
  paymentStatus: PaymentStatus | 'all';
}

// Purchase Order Receiving interfaces
export interface PurchaseOrderReceiving {
  id?: number;
  purchaseOrderId: number;
  receivingNumber: string;
  receivingDate: string;
  receivedBy: number;
  notes?: string;
  
  // Line items received
  receivedItems: PurchaseOrderReceivingItem[];
  
  // Related data
  purchaseOrder?: {
    id: number;
    orderNumber: string;
    supplierName: string;
  };
  receivedByUser?: {
    id: number;
    name: string;
  };
  
  // System fields
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderReceivingItem {
  id?: number;
  receivingId?: number;
  purchaseOrderLineItemId: number;
  itemId: number;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  damageQuantity?: number;
  shortageQuantity?: number;
  notes?: string;
  
  // Related data
  item?: {
    id: number;
    itemCode: string;
    itemName: string;
  };
  
  // System fields
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePurchaseOrderReceivingRequest {
  purchaseOrderId: number;
  receivingDate: string;
  notes?: string;
  receivedItems: CreatePurchaseOrderReceivingItemRequest[];
}

export interface CreatePurchaseOrderReceivingItemRequest {
  purchaseOrderLineItemId: number;
  quantityReceived: number;
  damageQuantity?: number;
  shortageQuantity?: number;
  notes?: string;
}

// Purchase Order Approval interfaces
export interface PurchaseOrderApprovalRequest {
  purchaseOrderId: number;
  action: 'APPROVE' | 'REJECT';
  comments?: string;
  approvalLevel?: number;
}

export interface PurchaseOrderApprovalResponse {
  purchaseOrderId: number;
  approvalStatus: ApprovalStatus;
  approvedBy?: number;
  approvedAt?: string;
  rejectedBy?: number;
  rejectedAt?: string;
  comments?: string;
}

// Purchase Order Analytics interfaces
export interface PurchaseOrderSummary {
  totalOrders: number;
  totalValue: number;
  ordersByStatus: {
    status: PurchaseOrderStatus;
    count: number;
    totalValue: number;
  }[];
  ordersBySupplier: {
    supplierId: number;
    supplierName: string;
    orderCount: number;
    totalValue: number;
  }[];
  averageOrderValue: number;
  averageLeadTime: number;
  onTimeDeliveryRate: number;
  pendingApprovals: number;
  overdueOrders: number;
}

export interface PurchaseOrderMetrics {
  period: string;
  totalPurchases: number;
  totalAmount: number;
  averageOrderValue: number;
  topSuppliers: {
    supplierId: number;
    supplierName: string;
    orderCount: number;
    totalAmount: number;
    percentage: number;
  }[];
  ordersByMonth: {
    month: string;
    orderCount: number;
    totalAmount: number;
  }[];
  deliveryPerformance: {
    onTime: number;
    late: number;
    early: number;
    onTimePercentage: number;
  };
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
export interface PurchaseOrderValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedFields: Record<string, boolean>;
}

// Export/Import interfaces
export interface PurchaseOrderExport {
  orders: PurchaseOrder[];
  exportedAt: string;
  exportedBy: number;
  version: string;
  tenantId: string;
  includeLineItems: boolean;
  includeSupplierData: boolean;
}

export interface PurchaseOrderImport {
  orders: CreatePurchaseOrderRequest[];
  importMode: 'CREATE_ONLY' | 'UPDATE_ONLY' | 'CREATE_OR_UPDATE' | 'VALIDATE_ONLY';
  preserveExistingData?: boolean;
  autoApprove?: boolean;
}

// State interface for purchase order management
export interface PurchaseOrderState {
  orders: PurchaseOrder[];
  currentOrder: PurchaseOrder | null;
  ordersList: PurchaseOrder[];
  receivings: PurchaseOrderReceiving[];
  suppliers: Supplier[];
  orderSummary: PurchaseOrderSummary | null;
  orderMetrics: PurchaseOrderMetrics | null;
  loading: boolean;
  error: string | null;
  validationResult: PurchaseOrderValidation | null;
  
  // Legacy support
  isLoading: boolean;
  useMockData: boolean;
  
  // Actions
  getAllOrders: (params?: PurchaseOrderQueryParams) => Promise<PaginatedResponse<PurchaseOrder>>;
  getOrderById: (id: number) => Promise<PurchaseOrder>;
  getOrderByNumber: (orderNumber: string) => Promise<PurchaseOrder>;
  getOrdersBySupplier: (supplierId: number, params?: PurchaseOrderQueryParams) => Promise<PaginatedResponse<PurchaseOrder>>;
  getOrdersByStatus: (status: PurchaseOrderStatus, params?: PurchaseOrderQueryParams) => Promise<PaginatedResponse<PurchaseOrder>>;
  createOrder: (order: CreatePurchaseOrderRequest) => Promise<PurchaseOrder>;
  updateOrder: (id: number, order: UpdatePurchaseOrderRequest) => Promise<PurchaseOrder>;
  deleteOrder: (id: number) => Promise<void>;
  cancelOrder: (id: number, reason?: string) => Promise<PurchaseOrder>;
  closeOrder: (id: number) => Promise<PurchaseOrder>;
  searchOrders: (searchTerm: string, params?: PurchaseOrderQueryParams) => Promise<PaginatedResponse<PurchaseOrder>>;
  
  // Line item actions
  addLineItem: (orderId: number, lineItem: CreatePurchaseOrderLineItemRequest) => Promise<PurchaseOrderLineItem>;
  updateLineItem: (lineItem: UpdatePurchaseOrderLineItemRequest) => Promise<PurchaseOrderLineItem>;
  removeLineItem: (orderId: number, lineItemId: number) => Promise<void>;
  
  // Approval actions
  submitForApproval: (orderId: number) => Promise<PurchaseOrder>;
  approveOrder: (request: PurchaseOrderApprovalRequest) => Promise<PurchaseOrderApprovalResponse>;
  rejectOrder: (request: PurchaseOrderApprovalRequest) => Promise<PurchaseOrderApprovalResponse>;
  getPendingApprovals: (params?: PurchaseOrderQueryParams) => Promise<PaginatedResponse<PurchaseOrder>>;
  
  // Receiving actions
  receiveOrder: (receiving: CreatePurchaseOrderReceivingRequest) => Promise<PurchaseOrderReceiving>;
  getReceivings: (orderId?: number, params?: PurchaseOrderQueryParams) => Promise<PaginatedResponse<PurchaseOrderReceiving>>;
  getReceivingById: (id: number) => Promise<PurchaseOrderReceiving>;
  
  // Supplier actions
  getAllSuppliers: () => Promise<Supplier[]>;
  getSupplierById: (id: number) => Promise<Supplier>;
  
  // Analytics actions
  getOrderSummary: (dateFrom?: string, dateTo?: string) => Promise<PurchaseOrderSummary>;
  getOrderMetrics: (period: string) => Promise<PurchaseOrderMetrics>;
  
  // Utility actions
  validateOrder: (order: CreatePurchaseOrderRequest) => Promise<PurchaseOrderValidation>;
  exportOrders: (params?: PurchaseOrderQueryParams) => Promise<PurchaseOrderExport>;
  importOrders: (importData: PurchaseOrderImport) => Promise<PurchaseOrder[]>;
  generateOrderNumber: () => Promise<string>;
  calculateOrderTotals: (lineItems: CreatePurchaseOrderLineItemRequest[]) => {
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
  };
}

// Validation rules constants
export const PURCHASE_ORDER_VALIDATION_RULES = {
  ORDER_NUMBER_MAX_LENGTH: 50,
  REFERENCE_NUMBER_MAX_LENGTH: 100,
  REQUISITION_NUMBER_MAX_LENGTH: 100,
  NOTES_MAX_LENGTH: 2000,
  INTERNAL_NOTES_MAX_LENGTH: 2000,
  MIN_POSITIVE_VALUE: 0.01,
  MIN_NON_NEGATIVE_VALUE: 0,
  MAX_LINE_ITEMS: 1000,
  MIN_QUANTITY: 0.01,
  MAX_QUANTITY: 999999.99,
  MAX_UNIT_COST: 999999.99,
  MAX_DISCOUNT_PERCENT: 100,
  MAX_TAX_PERCENT: 100
} as const;

// Error messages for validation
export const PURCHASE_ORDER_VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  ORDER_NUMBER_REQUIRED: 'Order number is required',
  SUPPLIER_REQUIRED: 'Supplier is required',
  ORDER_DATE_REQUIRED: 'Order date is required',
  LINE_ITEMS_REQUIRED: 'At least one line item is required',
  INVALID_QUANTITY: 'Quantity must be greater than zero',
  INVALID_UNIT_COST: 'Unit cost must be zero or positive',
  INVALID_DISCOUNT: 'Discount percent must be between 0 and 100',
  INVALID_TAX: 'Tax percent must be between 0 and 100',
  DUPLICATE_ORDER_NUMBER: 'Order number already exists',
  SUPPLIER_NOT_FOUND: 'Supplier not found',
  ITEM_NOT_FOUND: 'Item not found',
  INVALID_DATE: 'Invalid date format',
  EXPECTED_DELIVERY_BEFORE_ORDER: 'Expected delivery date cannot be before order date',
  ORDER_ALREADY_APPROVED: 'Order is already approved',
  ORDER_ALREADY_RECEIVED: 'Order is already fully received',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action',
  ORDER_CANNOT_BE_MODIFIED: 'Order cannot be modified in current status'
} as const;