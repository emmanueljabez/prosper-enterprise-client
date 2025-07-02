import { defineStore } from 'pinia';
import type {
  PurchaseOrder,
  PurchaseOrderQueryParams,
  PaginatedResponse,
  ApiResponse
} from '~/types/purchase-orders/purchase-orders';
import { purchaseOrdersApi } from '~/http/requests/app/purchase-orders/purchase-orders';

interface PurchaseOrdersStoreState {
  orders: PurchaseOrder[];
  paginatedOrders: PaginatedResponse<PurchaseOrder> | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export const usePurchaseOrdersStore = defineStore('purchaseOrders', {
  state: (): PurchaseOrdersStoreState => ({
    orders: [],
    paginatedOrders: null,
    loading: false,
    error: null,
    pagination: {
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0
    }
  }),

  getters: {
    getOrders: (state) => state.orders,
    getPaginatedOrders: (state) => state.paginatedOrders,
    getIsLoading: (state) => state.loading,
    getError: (state) => state.error,
    getPagination: (state) => state.pagination
  },

  actions: {
    fetchOrders(params?: PurchaseOrderQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        purchaseOrdersApi.getPurchaseOrders(params)
          .then((response: ApiResponse<PaginatedResponse<PurchaseOrder>>) => {
            this.paginatedOrders = response.data!;
            this.orders = response.data!.content;
            this.pagination = {
              page: response.data!.number,
              size: response.data!.size,
              totalElements: response.data!.totalElements,
              totalPages: response.data!.totalPages
            };
            console.log('Fetched purchase orders:', this.paginatedOrders);
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching purchase orders.';
            reject(error);
          });
      });
    },

    fetchMoreOrders(params?: PurchaseOrderQueryParams) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        purchaseOrdersApi.getPurchaseOrders(params)
          .then((response: ApiResponse<PaginatedResponse<PurchaseOrder>>) => {
            // Append new orders to existing ones
            this.orders = [...this.orders, ...response.data!.content];
            this.paginatedOrders = {
              ...response.data!,
              content: this.orders
            };
            this.pagination = {
              page: response.data!.number,
              size: response.data!.size,
              totalElements: response.data!.totalElements,
              totalPages: response.data!.totalPages
            };
            console.log('Fetched more purchase orders:', response.data!.content.length, 'new orders');
            this.loading = false;
            resolve(response.data);
          })
          .catch((error) => {
            this.loading = false;
            this.error = error.response?.data?.message || 'An error occurred while fetching more purchase orders.';
            reject(error);
          });
      });
    }
  },
});