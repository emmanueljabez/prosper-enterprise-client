import { defineStore } from 'pinia';
import { 
  mockReservations, 
  mockCartReservations, 
  mockOrderAllocations, 
  mockReservationHistory,
  mockHoldPolicies,
  mockCartPolicies,
  mockAllocationPriorities,
  mockReservationStats,
  mockCartOverrides
} from '@/mock/mockInventoryData';
import inventoryApi from '~/http/requests/app/inventory/reservations';
import type { 
  Reservation,
  CartReservation,
  OrderAllocation,
  ReservationHistory,
  HoldPolicy,
  CartPolicy,
  AllocationPriority,
  ReservationStats,
  CartOverride,
  CreateReservationRequest,
  ExtendReservationRequest,
  CartOverrideRequest,
  AllocationOverrideRequest
} from '@/types/inventory/reservations';

// Determine if we're in development environment
const config = useRuntimeConfig();
const environment = config.public.nodeEnv;
const isDev = environment === 'development';

// Interface for the store state
interface ReservationState {
  activeReservations: Reservation[];
  cartReservations: CartReservation[];
  orderAllocations: OrderAllocation[];
  reservationHistory: ReservationHistory[];
  holdPolicies: HoldPolicy[];
  cartPolicies: CartPolicy[];
  allocationPriorities: AllocationPriority[];
  cartOverrides: CartOverride[];
  reservationStats: ReservationStats;
  
  isLoadingReservations: boolean;
  isLoadingCartReservations: boolean;
  isLoadingAllocations: boolean;
  isLoadingHistory: boolean;
  isLoadingPolicies: boolean;
  
  error: string | null;
  useMockData: boolean;
}

export const useReservationStore = defineStore('reservations', {
  state: (): ReservationState => ({
    activeReservations: [],
    cartReservations: [],
    orderAllocations: [],
    reservationHistory: [],
    holdPolicies: [],
    cartPolicies: [],
    allocationPriorities: [],
    cartOverrides: [],
    reservationStats: {
      activeHolds: 0,
      expiringToday: 0,
      itemsReserved: 0,
      uniqueSkus: 0,
      cartReservations: 0,
      abandonedCarts: 0,
      orderAllocations: 0,
      pendingAllocations: 0
    },
    
    isLoadingReservations: false,
    isLoadingCartReservations: false,
    isLoadingAllocations: false,
    isLoadingHistory: false,
    isLoadingPolicies: false,
    
    error: null,
    useMockData: isDev // Default to mock data in development
  }),
  
  getters: {
    // Reservations
    getActiveReservations: (state) => state.activeReservations,
    getReservationById: (state) => (id: string) => 
      state.activeReservations.find(res => res.id === id),
    getExpiringReservations: (state) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return state.activeReservations.filter(res => {
        const expiryDate = new Date(res.expiresAt);
        return expiryDate <= tomorrow;
      });
    },
    
    // Cart Reservations
    getCartReservations: (state) => state.cartReservations,
    getCartReservationById: (state) => (id: string) => 
      state.cartReservations.find(cart => cart.id === id),
    getCartByCustomerId: (state) => (customerId: string) =>
      state.cartReservations.filter(cart => cart.customerId === customerId),
    getAbandonedCarts: (state) => {
      const now = new Date();
      
      return state.cartReservations.filter(cart => {
        // Mark as abandoned if it's within 1 hour of expiry or past expiry
        const expiryDate = new Date(cart.expiresAt);
        const oneHourBefore = new Date(expiryDate);
        oneHourBefore.setHours(oneHourBefore.getHours() - 1);
        
        return now >= oneHourBefore && cart.status !== 'expired';
      });
    },
    
    // Order Allocations
    getOrderAllocations: (state) => state.orderAllocations,
    getAllocationById: (state) => (id: string) => 
      state.orderAllocations.find(alloc => alloc.id === id),
    getPendingAllocations: (state) =>
      state.orderAllocations.filter(alloc => alloc.status === 'pending'),
    getPartialAllocations: (state) =>
      state.orderAllocations.filter(alloc => alloc.status === 'partially_allocated'),
    
    // Reservation History
    getReservationHistory: (state) => state.reservationHistory,
    getHistoryById: (state) => (id: string) => 
      state.reservationHistory.find(hist => hist.id === id),
    
    // Policies
    getHoldPolicies: (state) => state.holdPolicies,
    getActiveHoldPolicies: (state) => 
      state.holdPolicies.filter(policy => policy.status === 'active'),
    getHoldPolicyById: (state) => (id: string) =>
      state.holdPolicies.find(policy => policy.id === id),
    
    getCartPolicies: (state) => state.cartPolicies,
    getActiveCartPolicies: (state) => 
      state.cartPolicies.filter(policy => policy.status === 'active'),
    getCartPolicyById: (state) => (id: string) =>
      state.cartPolicies.find(policy => policy.id === id),
    
    getAllocationPriorities: (state) => state.allocationPriorities,
    getActiveAllocationPriorities: (state) =>
      state.allocationPriorities.filter(priority => priority.status === 'active'),
    
    // Cart Overrides
    getCartOverrides: (state) => state.cartOverrides,
    getCartOverrideById: (state) => (id: string) =>
      state.cartOverrides.find(override => override.id === id),
    getCartOverridesByCartId: (state) => (cartId: string) =>
      state.cartOverrides.filter(override => override.cartId === cartId),
    
    // Stats
    getReservationStats: (state) => state.reservationStats,
    
    // Loading states
    getIsLoadingReservations: (state) => state.isLoadingReservations,
    getIsLoadingCartReservations: (state) => state.isLoadingCartReservations,
    getIsLoadingAllocations: (state) => state.isLoadingAllocations,
    getIsLoadingHistory: (state) => state.isLoadingHistory,
    getIsLoadingPolicies: (state) => state.isLoadingPolicies,
    
    // Filtered queries
    getItemReservations: (state) => (itemId: string) => {
      const reservations = state.activeReservations.filter(res => 
        res.items.some(item => item.itemId === itemId)
      );
      
      const carts = state.cartReservations.filter(cart => 
        cart.items.some(item => item.itemId === itemId)
      );
      
      const allocations = state.orderAllocations.filter(alloc => 
        alloc.items.some(item => item.itemId === itemId)
      );
      
      return {
        reservations,
        carts,
        allocations
      };
    },
    
    getReservationsByCustomer: (state) => (customerId: string) => {
      return {
        reservations: state.activeReservations.filter(res => res.customerId === customerId),
        carts: state.cartReservations.filter(cart => cart.customerId === customerId),
        allocations: state.orderAllocations.filter(alloc => alloc.customerId === customerId)
      };
    },
    
    getLocationReservations: (state) => (locationId: string) => {
      return {
        reservations: state.activeReservations.filter(res => res.locationId === locationId),
        allocations: state.orderAllocations.filter(alloc => alloc.locationId === locationId)
      };
    },
    
    // Inventory impact
    getTotalReservedQuantity: (state) => (itemId: string) => {
      let total = 0;
      
      // Add quantities from active reservations
      state.activeReservations.forEach(res => {
        const item = res.items.find(item => item.itemId === itemId);
        if (item) total += item.quantity;
      });
      
      // Add quantities from cart reservations
      state.cartReservations.forEach(cart => {
        const item = cart.items.find(item => item.itemId === itemId);
        if (item) total += item.quantity;
      });
      
      // Add quantities from allocated orders
      state.orderAllocations.forEach(alloc => {
        const item = alloc.items.find(item => item.itemId === itemId);
        if (item && item.allocatedQuantity) total += item.allocatedQuantity;
      });
      
      return total;
    }
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    // ===== ACTIVE RESERVATIONS =====
    async fetchReservations(params = {}) {
      this.isLoadingReservations = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          this.activeReservations = [...mockReservations];
          this.isLoadingReservations = false;
          return { success: true, reservations: this.activeReservations };
        } else {
          // Real API call
          const response = await inventoryApi.fetchReservations(params);
          this.activeReservations = response.reservations;
          this.isLoadingReservations = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingReservations = false;
        this.error = error.response?.data?.message || 'Failed to fetch reservations';
        throw error;
      }
    },
    
    async createReservation(newReservation: CreateReservationRequest) {
      this.isLoadingReservations = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Calculate expiry date based on hold policy
          let expiresAt = new Date();
          const policy = this.holdPolicies.find(p => p.id === newReservation.holdPolicyId);
          if (policy) {
            if (policy.durationType === 'days') {
              expiresAt.setDate(expiresAt.getDate() + policy.duration);
            } else if (policy.durationType === 'hours') {
              expiresAt.setHours(expiresAt.getHours() + policy.duration);
            }
          } else {
            // Default: 7 days
            expiresAt.setDate(expiresAt.getDate() + 7);
          }
          
          // Generate a unique ID
          const reservationId = `rsv-${Date.now().toString().substr(-6)}`;
          
          // Fetch full item details
          const items = newReservation.items.map(item => {
            // In a real app, these would come from your items store
            return {
              itemId: item.itemId,
              itemName: `Item ${item.itemId}`,
              sku: `SKU-${item.itemId}`,
              quantity: item.quantity,
              availableQuantity: item.quantity
            };
          });
          
          // Create the reservation
          const reservation: Reservation = {
            id: reservationId,
            type: newReservation.type,
            status: 'active',
            reference: newReservation.reference || `HOLD-${Date.now().toString().substr(-5)}`,
            customerId: newReservation.customerId,
            customerName: newReservation.customerName,
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString(),
            createdBy: 'user-001', // Would come from auth store
            createdByName: 'John Smith', // Would come from auth store
            notes: newReservation.notes,
            locationId: newReservation.locationId,
            locationName: 'Warehouse A', // Would come from locations store
            items: items,
            holdPolicyId: newReservation.holdPolicyId
          };
          
          this.activeReservations.push(reservation);
          
          // Update stats
          this.reservationStats.activeHolds++;
          this.reservationStats.itemsReserved += items.reduce((sum, item) => sum + item.quantity, 0);
          this.reservationStats.uniqueSkus = this.calculateUniqueSkus();
          
          this.isLoadingReservations = false;
          return { success: true, reservation };
        } else {
          // Real API call
          const response = await inventoryApi.createReservation(newReservation);
          
          if (response.success && response.reservation) {
            this.activeReservations.push(response.reservation);
            
            // Update stats
            this.reservationStats.activeHolds++;
            this.reservationStats.itemsReserved += response.reservation.items.reduce((sum, item) => sum + item.quantity, 0);
            this.reservationStats.uniqueSkus = this.calculateUniqueSkus();
          }
          
          this.isLoadingReservations = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingReservations = false;
        this.error = error.response?.data?.message || 'Failed to create reservation';
        throw error;
      }
    },
    
    async extendReservation(reservationId: string, extension: ExtendReservationRequest) {
      this.isLoadingReservations = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the reservation
          const reservationIndex = this.activeReservations.findIndex(r => r.id === reservationId);
          if (reservationIndex === -1) {
            throw new Error('Reservation not found');
          }
          
          const reservation = { ...this.activeReservations[reservationIndex] };
          
          // Calculate new expiry date
          const expiresAt = new Date(reservation.expiresAt);
          if (extension.days) {
            expiresAt.setDate(expiresAt.getDate() + extension.days);
          }
          if (extension.hours) {
            expiresAt.setHours(expiresAt.getHours() + extension.hours);
          }
          
          // Update the reservation
          const updatedReservation: Reservation = {
            ...reservation,
            expiresAt: expiresAt.toISOString(),
            extendedAt: new Date().toISOString(),
            extendedBy: 'user-001', // Would come from auth store
            extendedByName: 'John Smith', // Would come from auth store
            extensionNotes: extension.notes
          };
          
          // Update in state
          this.activeReservations[reservationIndex] = updatedReservation;
          
          this.isLoadingReservations = false;
          return { success: true, reservation: updatedReservation };
        } else {
          // Real API call
          const response = await inventoryApi.extendReservation(reservationId, extension);
          
          if (response.success && response.reservation) {
            const index = this.activeReservations.findIndex(r => r.id === reservationId);
            if (index !== -1) {
              this.activeReservations[index] = response.reservation;
            }
          }
          
          this.isLoadingReservations = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingReservations = false;
        this.error = error.response?.data?.message || 'Failed to extend reservation';
        throw error;
      }
    },
    
    async releaseReservation(reservationId: string, reason: string) {
      this.isLoadingReservations = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the reservation
          const reservationIndex = this.activeReservations.findIndex(r => r.id === reservationId);
          if (reservationIndex === -1) {
            throw new Error('Reservation not found');
          }
          
          const reservation = this.activeReservations[reservationIndex];
          
          // Move to history
          const historyEntry: ReservationHistory = {
            id: `rsv-hist-${Date.now().toString().substr(-6)}`,
            reservationId: reservation.id,
            type: reservation.type,
            reference: reservation.reference,
            customerId: reservation.customerId,
            customerName: reservation.customerName,
            status: 'released',
            createdAt: reservation.createdAt,
            expiresAt: reservation.expiresAt,
            completedAt: new Date().toISOString(),
            createdBy: reservation.createdBy,
            createdByName: reservation.createdByName,
            notes: reservation.notes,
            locationId: reservation.locationId,
            locationName: reservation.locationName,
            items: reservation.items.map(item => ({
              itemId: item.itemId,
              itemName: item.itemName,
              sku: item.sku,
              quantity: item.quantity
            })),
            holdPolicyId: reservation.holdPolicyId,
            releaseReason: reason
          };
          
          this.reservationHistory.push(historyEntry);
          
          // Calculate items released
          const itemsReleased = reservation.items.reduce((sum, item) => sum + item.quantity, 0);
          
          // Update stats
          this.reservationStats.activeHolds--;
          this.reservationStats.itemsReserved -= itemsReleased;
          this.reservationStats.uniqueSkus = this.calculateUniqueSkus();
          
          // Remove from active reservations
          this.activeReservations.splice(reservationIndex, 1);
          
          this.isLoadingReservations = false;
          return { success: true, historyEntry };
        } else {
          // Real API call
          const response = await inventoryApi.releaseReservation(reservationId, reason);
          
          if (response.success) {
            // If successful, add to history and remove from active
            if (response.historyEntry) {
              this.reservationHistory.push(response.historyEntry);
            }
            
            // Remove from active reservations
            this.activeReservations = this.activeReservations.filter(r => r.id !== reservationId);
            
            // Update stats
            this.reservationStats.activeHolds--;
            // other stats would be updated based on response
          }
          
          this.isLoadingReservations = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingReservations = false;
        this.error = error.response?.data?.message || 'Failed to release reservation';
        throw error;
      }
    },
    
    // ===== CART RESERVATIONS =====
    async fetchCartReservations(params = {}) {
      this.isLoadingCartReservations = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          this.cartReservations = [...mockCartReservations];
          this.isLoadingCartReservations = false;
          return { success: true, cartReservations: this.cartReservations };
        } else {
          // Real API call
          const response = await inventoryApi.fetchCartReservations(params);
          this.cartReservations = response.cartReservations;
          this.isLoadingCartReservations = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingCartReservations = false;
        this.error = error.response?.data?.message || 'Failed to fetch cart reservations';
        throw error;
      }
    },
    
    async extendCartReservation(cartId: string, extension: { hours: number, reason: string }) {
      this.isLoadingCartReservations = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the cart
          const cartIndex = this.cartReservations.findIndex(c => c.id === cartId);
          if (cartIndex === -1) {
            throw new Error('Cart reservation not found');
          }
          
          const cart = { ...this.cartReservations[cartIndex] };
          
          // Calculate new expiry date
          const expiresAt = new Date(cart.expiresAt);
          expiresAt.setHours(expiresAt.getHours() + extension.hours);
          
          // Update the cart
          const updatedCart: CartReservation = {
            ...cart,
            expiresAt: expiresAt.toISOString(),
            extendedAt: new Date().toISOString(),
            extendedBy: 'user-001', // Would come from auth store
            extensionReason: extension.reason
          };
          
          // Update in state
          this.cartReservations[cartIndex] = updatedCart;
          
          this.isLoadingCartReservations = false;
          return { success: true, cartReservation: updatedCart };
        } else {
          // Real API call
          const response = await inventoryApi.extendCartReservation(cartId, extension);
          
          if (response.success && response.cartReservation) {
            const index = this.cartReservations.findIndex(c => c.id === cartId);
            if (index !== -1) {
              this.cartReservations[index] = response.cartReservation;
            }
          }
          
          this.isLoadingCartReservations = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingCartReservations = false;
        this.error = error.response?.data?.message || 'Failed to extend cart reservation';
        throw error;
      }
    },
    
    async overrideCartReservation(cartId: string, override: CartOverrideRequest) {
      this.isLoadingCartReservations = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the cart
          const cartIndex = this.cartReservations.findIndex(c => c.id === cartId);
          if (cartIndex === -1) {
            throw new Error('Cart reservation not found');
          }
          
          const cart = { ...this.cartReservations[cartIndex] };
          
          // Create override record
          const cartOverride: CartOverride = {
            id: `override-${Date.now().toString().substr(-6)}`,
            cartId: cart.id,
            customerId: cart.customerId,
            customerName: cart.customerName,
            originalExpiryTime: cart.expiresAt,
            newExpiryTime: override.expiresAt,
            reason: override.reason,
            appliedBy: 'user-001', // Would come from auth store
            appliedByName: 'John Smith', // Would come from auth store
            appliedAt: new Date().toISOString(),
            status: 'active'
          };
          
          // Add to overrides
          this.cartOverrides.push(cartOverride);
          
          // Update the cart
          const updatedCart: CartReservation = {
            ...cart,
            expiresAt: override.expiresAt,
            overrideApplied: true,
            overrideReason: override.reason,
            overrideBy: 'user-001', // Would come from auth store
            overrideAt: new Date().toISOString()
          };
          
          // Update in state
          this.cartReservations[cartIndex] = updatedCart;
          
          this.isLoadingCartReservations = false;
          return { 
            success: true, 
            cartReservation: updatedCart,
            override: cartOverride 
          };
        } else {
          // Real API call
          const response = await inventoryApi.overrideCartReservation(cartId, override);
          
          if (response.success) {
            if (response.cartReservation) {
              const index = this.cartReservations.findIndex(c => c.id === cartId);
              if (index !== -1) {
                this.cartReservations[index] = response.cartReservation;
              }
            }
            
            if (response.override) {
              this.cartOverrides.push(response.override);
            }
          }
          
          this.isLoadingCartReservations = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingCartReservations = false;
        this.error = error.response?.data?.message || 'Failed to override cart reservation';
        throw error;
      }
    },
    
    async releaseCartReservation(cartId: string) {
      this.isLoadingCartReservations = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the cart
          const cartIndex = this.cartReservations.findIndex(c => c.id === cartId);
          if (cartIndex === -1) {
            throw new Error('Cart reservation not found');
          }
          
          // Calculate items released
          const itemsReleased = this.cartReservations[cartIndex].items.reduce(
            (sum, item) => sum + item.quantity, 0
          );
          
          // Update stats
          this.reservationStats.cartReservations--;
          this.reservationStats.itemsReserved -= itemsReleased;
          this.reservationStats.uniqueSkus = this.calculateUniqueSkus();
          
          // Update overrides if any
          const overrides = this.cartOverrides.filter(o => o.cartId === cartId && o.status === 'active');
          overrides.forEach(override => {
            const index = this.cartOverrides.findIndex(o => o.id === override.id);
            if (index !== -1) {
              this.cartOverrides[index] = {
                ...override,
                status: 'completed',
                completedAt: new Date().toISOString(),
                outcome: 'cancelled'
              };
            }
          });
          
          // Remove from cart reservations
          this.cartReservations.splice(cartIndex, 1);
          
          this.isLoadingCartReservations = false;
          return { success: true };
        } else {
          // Real API call
          const response = await inventoryApi.releaseCartReservation(cartId);
          
          if (response.success) {
            // Remove from cart reservations
            this.cartReservations = this.cartReservations.filter(c => c.id !== cartId);
            
            // Update stats
            this.reservationStats.cartReservations--;
            // other stats would be updated based on response
            
            // Update overrides if included in response
            if (response.overrides) {
              response.overrides.forEach((updatedOverride: CartOverride) => {
                const index = this.cartOverrides.findIndex(o => o.id === updatedOverride.id);
                if (index !== -1) {
                  this.cartOverrides[index] = updatedOverride;
                }
              });
            }
          }
          
          this.isLoadingCartReservations = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingCartReservations = false;
        this.error = error.response?.data?.message || 'Failed to release cart reservation';
        throw error;
      }
    },
    
    // ===== ORDER ALLOCATIONS =====
    async fetchOrderAllocations(params = {}) {
      this.isLoadingAllocations = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          this.orderAllocations = [...mockOrderAllocations];
          this.isLoadingAllocations = false;
          return { success: true, orderAllocations: this.orderAllocations };
        } else {
          // Real API call
          const response = await inventoryApi.fetchOrderAllocations(params);
          this.orderAllocations = response.orderAllocations;
          this.isLoadingAllocations = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingAllocations = false;
        this.error = error.response?.data?.message || 'Failed to fetch order allocations';
        throw error;
      }
    },
    
    async modifyAllocation(allocationId: string, changes: any) {
      this.isLoadingAllocations = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the allocation
          const allocationIndex = this.orderAllocations.findIndex(a => a.id === allocationId);
          if (allocationIndex === -1) {
            throw new Error('Order allocation not found');
          }
          
          const allocation = { ...this.orderAllocations[allocationIndex] };
          
          // Update the allocation
          const updatedAllocation: OrderAllocation = {
            ...allocation,
            ...changes,
            updatedAt: new Date().toISOString()
          };
          
          // Update in state
          this.orderAllocations[allocationIndex] = updatedAllocation;
          
          this.isLoadingAllocations = false;
          return { success: true, orderAllocation: updatedAllocation };
        } else {
          // Real API call
          const response = await inventoryApi.modifyAllocation(allocationId, changes);
          
          if (response.success && response.orderAllocation) {
            const index = this.orderAllocations.findIndex(a => a.id === allocationId);
            if (index !== -1) {
              this.orderAllocations[index] = response.orderAllocation;
            }
          }
          
          this.isLoadingAllocations = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingAllocations = false;
        this.error = error.response?.data?.message || 'Failed to modify order allocation';
        throw error;
      }
    },
    
    async overrideAllocation(allocationId: string, override: AllocationOverrideRequest) {
      this.isLoadingAllocations = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the allocation
          const allocationIndex = this.orderAllocations.findIndex(a => a.id === allocationId);
          if (allocationIndex === -1) {
            throw new Error('Order allocation not found');
          }
          
          const allocation = { ...this.orderAllocations[allocationIndex] };
          
          // Update the allocation
          const updatedAllocation: OrderAllocation = {
            ...allocation,
            items: override.items.map(item => {
              const existingItem = allocation.items.find(i => i.itemId === item.itemId);
              if (existingItem) {
                return {
                  ...existingItem,
                  allocatedQuantity: item.allocatedQuantity,
                  backorderQuantity: item.backorderQuantity
                };
              }
              // If it's a new item, add full details
              return {
                itemId: item.itemId,
                itemName: `Item ${item.itemId}`, // Would come from items store
                sku: `SKU-${item.itemId}`, // Would come from items store
                quantity: item.allocatedQuantity + (item.backorderQuantity || 0),
                allocatedQuantity: item.allocatedQuantity,
                backorderQuantity: item.backorderQuantity
              };
            }),
            overrideApplied: true,
            overrideReason: override.reason,
            overrideBy: 'user-001', // Would come from auth store
            overrideAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Determine status based on allocation
          const totalRequested = updatedAllocation.items.reduce((sum, item) => sum + item.quantity, 0);
          const totalAllocated = updatedAllocation.items.reduce((sum, item) => sum + item.allocatedQuantity, 0);
          
          if (totalAllocated === 0) {
            updatedAllocation.status = 'pending';
          } else if (totalAllocated < totalRequested) {
            updatedAllocation.status = 'partially_allocated';
          } else {
            updatedAllocation.status = 'allocated';
          }
          
          // Update in state
          this.orderAllocations[allocationIndex] = updatedAllocation;
          
          this.isLoadingAllocations = false;
          return { success: true, orderAllocation: updatedAllocation };
        } else {
          // Real API call
          const response = await inventoryApi.overrideAllocation(allocationId, override);
          
          if (response.success && response.orderAllocation) {
            const index = this.orderAllocations.findIndex(a => a.id === allocationId);
            if (index !== -1) {
              this.orderAllocations[index] = response.orderAllocation;
            }
          }
          
          this.isLoadingAllocations = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingAllocations = false;
        this.error = error.response?.data?.message || 'Failed to override allocation';
        throw error;
      }
    },
    
    // ===== RESERVATION HISTORY =====
    async fetchReservationHistory(params = {}) {
      this.isLoadingHistory = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          this.reservationHistory = [...mockReservationHistory];
          this.isLoadingHistory = false;
          return { success: true, reservationHistory: this.reservationHistory };
        } else {
          // Real API call
          const response = await inventoryApi.fetchReservationHistory(params);
          this.reservationHistory = response.reservationHistory;
          this.isLoadingHistory = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingHistory = false;
        this.error = error.response?.data?.message || 'Failed to fetch reservation history';
        throw error;
      }
    },
    
    // ===== HOLD POLICIES =====
    async fetchHoldPolicies() {
      this.isLoadingPolicies = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          this.holdPolicies = [...mockHoldPolicies];
          this.isLoadingPolicies = false;
          return { success: true, holdPolicies: this.holdPolicies };
        } else {
          // Real API call
          const response = await inventoryApi.fetchHoldPolicies();
          this.holdPolicies = response.holdPolicies;
          this.isLoadingPolicies = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingPolicies = false;
        this.error = error.response?.data?.message || 'Failed to fetch hold policies';
        throw error;
      }
    },
    
    async updateHoldPolicies(policies: HoldPolicy[]) {
      this.isLoadingPolicies = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update timestamps
          const updatedPolicies = policies.map(policy => ({
            ...policy,
            updatedAt: new Date().toISOString()
          }));
          
          this.holdPolicies = updatedPolicies;
          this.isLoadingPolicies = false;
          
          return { success: true, holdPolicies: this.holdPolicies };
        } else {
          // Real API call
          const response = await inventoryApi.updateHoldPolicies(policies);
          
          if (response.success) {
            this.holdPolicies = response.holdPolicies;
          }
          
          this.isLoadingPolicies = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingPolicies = false;
        this.error = error.response?.data?.message || 'Failed to update hold policies';
        throw error;
      }
    },
    
    // ===== CART POLICIES =====
    async fetchCartPolicies() {
      this.isLoadingPolicies = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          this.cartPolicies = [...mockCartPolicies];
          this.isLoadingPolicies = false;
          return { success: true, cartPolicies: this.cartPolicies };
        } else {
          // Real API call
          const response = await inventoryApi.fetchCartPolicies();
          this.cartPolicies = response.cartPolicies;
          this.isLoadingPolicies = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingPolicies = false;
        this.error = error.response?.data?.message || 'Failed to fetch cart policies';
        throw error;
      }
    },
    
    async updateCartPolicies(policies: CartPolicy[]) {
      this.isLoadingPolicies = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update timestamps
          const updatedPolicies = policies.map(policy => ({
            ...policy,
            updatedAt: new Date().toISOString()
          }));
          
          this.cartPolicies = updatedPolicies;
          this.isLoadingPolicies = false;
          
          return { success: true, cartPolicies: this.cartPolicies };
        } else {
          // Real API call
          const response = await inventoryApi.updateCartPolicies(policies);
          
          if (response.success) {
            this.cartPolicies = response.cartPolicies;
          }
          
          this.isLoadingPolicies = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingPolicies = false;
        this.error = error.response?.data?.message || 'Failed to update cart policies';
        throw error;
      }
    },
    
    // ===== ALLOCATION PRIORITIES =====
    async fetchAllocationPriorities() {
      this.isLoadingPolicies = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          this.allocationPriorities = [...mockAllocationPriorities];
          this.isLoadingPolicies = false;
          return { success: true, allocationPriorities: this.allocationPriorities };
        } else {
          // Real API call
          const response = await inventoryApi.fetchAllocationPriorities();
          this.allocationPriorities = response.allocationPriorities;
          this.isLoadingPolicies = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingPolicies = false;
        this.error = error.response?.data?.message || 'Failed to fetch allocation priorities';
        throw error;
      }
    },
    
    async updateAllocationPriorities(priorities: AllocationPriority[]) {
      this.isLoadingPolicies = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update timestamps
          const updatedPriorities = priorities.map(priority => ({
            ...priority,
            updatedAt: new Date().toISOString()
          }));
          
          this.allocationPriorities = updatedPriorities;
          this.isLoadingPolicies = false;
          
          return { success: true, allocationPriorities: this.allocationPriorities };
        } else {
          // Real API call
          const response = await inventoryApi.updateAllocationPriorities(priorities);
          
          if (response.success) {
            this.allocationPriorities = response.allocationPriorities;
          }
          
          this.isLoadingPolicies = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingPolicies = false;
        this.error = error.response?.data?.message || 'Failed to update allocation priorities';
        throw error;
      }
    },
    
    // ===== CART OVERRIDES =====
    async fetchCartOverrides(params = {}) {
      this.isLoadingCartReservations = true;
      this.error = null;
      
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          this.cartOverrides = [...mockCartOverrides];
          this.isLoadingCartReservations = false;
          return { success: true, cartOverrides: this.cartOverrides };
        } else {
          // Real API call
          const response = await inventoryApi.fetchCartOverrides(params);
          this.cartOverrides = response.cartOverrides;
          this.isLoadingCartReservations = false;
          return response;
        }
      } catch (error: any) {
        this.isLoadingCartReservations = false;
        this.error = error.response?.data?.message || 'Failed to fetch cart overrides';
        throw error;
      }
    },
    
    // ===== RESERVATION STATS =====
    async fetchReservationStats() {
      try {
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));
          this.reservationStats = { ...mockReservationStats };
          return { success: true, stats: this.reservationStats };
        } else {
          // Real API call
          const response = await inventoryApi.fetchReservationStats();
          
          if (response.success) {
            this.reservationStats = response.stats;
          }
          
          return response;
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch reservation stats';
        throw error;
      }
    },
    
    // ===== HELPER METHODS =====
    calculateUniqueSkus(): number {
      // Collect all item IDs from reservations, carts, and allocations
      const itemSet = new Set<string>();
      
      this.activeReservations.forEach(res => {
        res.items.forEach(item => {
          itemSet.add(item.itemId);
        });
      });
      
      this.cartReservations.forEach(cart => {
        cart.items.forEach(item => {
          itemSet.add(item.itemId);
        });
      });
      
      this.orderAllocations.forEach(alloc => {
        alloc.items.forEach(item => {
          itemSet.add(item.itemId);
        });
      });
      
      return itemSet.size;
    },
    
    // ===== INITIALIZE STORE =====
    async initializeStore() {
      if (this.useMockData) {
        await Promise.all([
          this.fetchReservations(),
          this.fetchCartReservations(),
          this.fetchOrderAllocations(),
          this.fetchReservationHistory(),
          this.fetchHoldPolicies(),
          this.fetchCartPolicies(),
          this.fetchAllocationPriorities(),
          this.fetchCartOverrides(),
          this.fetchReservationStats()
        ]);
      }
    }
  }
});