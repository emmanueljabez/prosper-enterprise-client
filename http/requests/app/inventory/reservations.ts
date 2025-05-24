import axiosInstance from '@/http/axios';
import type { 
  Reservation, 
  CartReservation, 
  OrderAllocation, 
  ReservationHistory,
  HoldPolicy,
  CartPolicy,
  AllocationPriority,
  CartOverride,
  CreateReservationRequest,
  ExtendReservationRequest,
  CartOverrideRequest,
  AllocationOverrideRequest
} from '@/types/inventory/reservations';

// Define API client for reservation operations
export default {
  // ===== RESERVATIONS =====
  fetchReservations: (params = {}) => {
    return axiosInstance.get('/inventory/reservations', { params });
  },
  
  createReservation: (reservation: CreateReservationRequest) => {
    return axiosInstance.post('/inventory/reservations', reservation);
  },
  
  extendReservation: (id: string, extension: ExtendReservationRequest) => {
    return axiosInstance.patch(`/inventory/reservations/${id}/extend`, extension);
  },
  
  releaseReservation: (id: string, reason: string) => {
    return axiosInstance.post(`/inventory/reservations/${id}/release`, { reason });
  },
  
  // ===== CART RESERVATIONS =====
  fetchCartReservations: (params = {}) => {
    return axiosInstance.get('/inventory/cart-reservations', { params });
  },
  
  extendCartReservation: (id: string, extension: { hours: number, reason: string }) => {
    return axiosInstance.patch(`/inventory/cart-reservations/${id}/extend`, extension);
  },
  
  overrideCartReservation: (id: string, override: CartOverrideRequest) => {
    return axiosInstance.patch(`/inventory/cart-reservations/${id}/override`, override);
  },
  
  releaseCartReservation: (id: string) => {
    return axiosInstance.post(`/inventory/cart-reservations/${id}/release`);
  },
  
  // ===== ORDER ALLOCATIONS =====
  fetchOrderAllocations: (params = {}) => {
    return axiosInstance.get('/inventory/order-allocations', { params });
  },
  
  modifyAllocation: (id: string, changes: any) => {
    return axiosInstance.patch(`/inventory/order-allocations/${id}`, changes);
  },
  
  overrideAllocation: (id: string, override: AllocationOverrideRequest) => {
    return axiosInstance.patch(`/inventory/order-allocations/${id}/override`, override);
  },
  
  // ===== RESERVATION HISTORY =====
  fetchReservationHistory: (params = {}) => {
    return axiosInstance.get('/inventory/reservation-history', { params });
  },
  
  // ===== POLICIES =====
  fetchHoldPolicies: () => {
    return axiosInstance.get('/inventory/hold-policies');
  },
  
  updateHoldPolicies: (policies: HoldPolicy[]) => {
    return axiosInstance.put('/inventory/hold-policies', { policies });
  },
  
  fetchCartPolicies: () => {
    return axiosInstance.get('/inventory/cart-policies');
  },
  
  updateCartPolicies: (policies: CartPolicy[]) => {
    return axiosInstance.put('/inventory/cart-policies', { policies });
  },
  
  fetchAllocationPriorities: () => {
    return axiosInstance.get('/inventory/allocation-priorities');
  },
  
  updateAllocationPriorities: (priorities: AllocationPriority[]) => {
    return axiosInstance.put('/inventory/allocation-priorities', { priorities });
  },
  
  // ===== CART OVERRIDES =====
  fetchCartOverrides: (params = {}) => {
    return axiosInstance.get('/inventory/cart-overrides', { params });
  },
  
  // ===== STATS =====
  fetchReservationStats: () => {
    return axiosInstance.get('/inventory/reservation-stats');
  },
  
  // ===== BULK OPERATIONS =====
  bulkReleaseReservations: (reservationIds: string[], reason: string) => {
    return axiosInstance.post('/inventory/reservations/bulk-release', { 
      reservationIds, 
      reason 
    });
  },
  
  bulkExtendReservations: (reservationIds: string[], extension: ExtendReservationRequest) => {
    return axiosInstance.post('/inventory/reservations/bulk-extend', { 
      reservationIds, 
      ...extension 
    });
  },
  
  exportReservations: (format: string = 'csv', filters = {}) => {
    return axiosInstance.get(`/inventory/reservations/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  }
};