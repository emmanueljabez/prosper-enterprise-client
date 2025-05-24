// Reservation types for inventory hold system

// Base item type used in various reservation contexts
export interface ReservationItem {
  itemId: string;
  itemName: string;
  sku: string;
  quantity: number;
  availableQuantity?: number; // For active reservations
}

// Allocation item has some additional fields
export interface AllocationItem extends ReservationItem {
  allocatedQuantity: number;
  backorderQuantity?: number;
}

// Manual reservation/hold
export interface Reservation {
  id: string;
  type: 'manual' | 'service' | 'project' | 'customer';
  status: 'active' | 'pending' | 'expired' | 'completed' | 'cancelled' | 'released';
  reference: string;
  customerId?: string;
  customerName?: string;
  createdAt: string;
  expiresAt: string;
  createdBy: string;
  createdByName: string;
  notes?: string;
  locationId: string;
  locationName: string;
  items: ReservationItem[];
  holdPolicyId?: string;
  extendedAt?: string;
  extendedBy?: string;
  extendedByName?: string;
  extensionNotes?: string;
}

// Shopping cart reservation
export interface CartReservation {
  id: string;
  cartId: string;
  customerId?: string;
  customerName?: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'abandoned' | 'expired' | 'completed';
  sessionId: string;
  items: ReservationItem[];
  cartPolicyId?: string;
  extendedAt?: string;
  extendedBy?: string;
  extensionReason?: string;
  overrideApplied?: boolean;
  overrideReason?: string;
  overrideBy?: string;
  overrideAt?: string;
}

// Order allocation (stock allocated to an order)
export interface OrderAllocation {
  id: string;
  orderId: string;
  orderReference: string;
  customerId: string;
  customerName: string;
  status: 'pending' | 'allocated' | 'partially_allocated' | 'fulfilled' | 'cancelled';
  createdAt: string;
  allocatedBy?: string;
  allocatedByName?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  locationId: string;
  locationName: string;
  items: AllocationItem[];
  updatedAt?: string;
  overrideApplied?: boolean;
  overrideReason?: string;
  overrideBy?: string;
  overrideAt?: string;
}

// Historical record of a completed reservation
export interface ReservationHistory {
  id: string;
  reservationId: string;
  type: 'manual' | 'service' | 'project' | 'customer';
  reference: string;
  customerId?: string;
  customerName?: string;
  status: 'expired' | 'completed' | 'cancelled' | 'released';
  createdAt: string;
  expiresAt: string;
  completedAt: string;
  createdBy: string;
  createdByName: string;
  notes?: string;
  locationId: string;
  locationName: string;
  items: ReservationItem[];
  holdPolicyId?: string;
  releaseReason?: string;
}

// Policy for how long items can be reserved
export interface HoldPolicy {
  id: string;
  name: string;
  description: string;
  durationType: 'hours' | 'days';
  duration: number;
  applicableTypes: Array<'manual' | 'service' | 'project' | 'customer'>;
  renewalAllowed: boolean;
  maxRenewals: number;
  renewalDuration: number;
  autoExpire: boolean;
  notifyBefore: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Policy for cart reservation durations
export interface CartPolicy {
  id: string;
  name: string;
  description: string;
  durationType: 'hours' | 'days';
  duration: number;
  applicableCustomerGroups: string[];
  applicableItems: string[];
  overrideAllowed: boolean;
  maxOverrideDuration: number;
  abandonedCartThreshold: number;
  autoNotify: boolean;
  notifyBefore: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Rule for allocation priority
export interface AllocationRule {
  type: 'customer_group' | 'order_type' | 'payment_method' | 'custom';
  value: string;
  priority: number;
}

// Priority settings for order allocation
export interface AllocationPriority {
  id: string;
  name: string;
  description: string;
  rules: AllocationRule[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Cart duration override record
export interface CartOverride {
  id: string;
  cartId: string;
  customerId?: string;
  customerName?: string;
  originalExpiryTime: string;
  newExpiryTime: string;
  reason: string;
  appliedBy: string;
  appliedByName: string;
  appliedAt: string;
  status: 'active' | 'completed';
  completedAt?: string;
  outcome?: 'purchase_completed' | 'expired' | 'cancelled';
}

// Statistics about the reservation system
export interface ReservationStats {
  activeHolds: number;
  expiringToday: number;
  itemsReserved: number;
  uniqueSkus: number;
  cartReservations: number;
  abandonedCarts: number;
  orderAllocations: number;
  pendingAllocations: number;
}

// For creating a new reservation
export interface CreateReservationRequest {
  type: 'manual' | 'service' | 'project' | 'customer';
  reference?: string;
  customerId?: string;
  customerName?: string;
  notes?: string;
  locationId: string;
  items: {
    itemId: string;
    quantity: number;
  }[];
  holdPolicyId?: string;
}

// For extending a reservation
export interface ExtendReservationRequest {
  days?: number;
  hours?: number;
  notes?: string;
}

// For overriding a cart expiration
export interface CartOverrideRequest {
  expiresAt: string;
  reason: string;
}

// For overriding an allocation
export interface AllocationOverrideRequest {
  items: {
    itemId: string;
    allocatedQuantity: number;
    backorderQuantity?: number;
  }[];
  reason: string;
}