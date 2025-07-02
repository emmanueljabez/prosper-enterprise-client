import axiosInstance from '~/http/axios';
import type {
  PurchaseOrder,
  PurchaseOrderQueryParams,
  PaginatedResponse,
  ApiResponse
} from '~/types/purchase-orders/purchase-orders';

const BASE_URL = '/tenant/bills';

export const purchaseOrdersApi = {
  /**
   * Get purchase orders (with pagination support)
   */
  getPurchaseOrders(params?: PurchaseOrderQueryParams): Promise<ApiResponse<PaginatedResponse<PurchaseOrder>>> {
    return axiosInstance.get(BASE_URL, { params });
  }
};

export default purchaseOrdersApi;