import axiosInstance from "~/http/axios";
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerQueryParams,
  CustomerFilters,
  CustomerSummary,
  CustomerStatus,
  PaginatedResponse,
  ApiResponse
} from '@/types/price-management/customers';

const BASE_URL = '/tenant/customers';

export default {
  // Fetch operations
  getCustomers(params?: CustomerQueryParams) {
    return axiosInstance.get<ApiResponse<PaginatedResponse<Customer>>>(`${BASE_URL}`, { params });
  },

  getAllCustomers(params?: CustomerQueryParams) {
    return axiosInstance.get<Customer[]>(`${BASE_URL}`, { params });
  },

  getCustomerById(id: number) {
    return axiosInstance.get<ApiResponse<Customer>>(`${BASE_URL}/${id}`);
  },

  getCustomerByDisplayId(displayId: string) {
    return axiosInstance.get<ApiResponse<Customer>>(`${BASE_URL}/display/${displayId}`);
  },

  searchCustomers(params: CustomerQueryParams & { searchTerm: string }) {
    return axiosInstance.get<ApiResponse<PaginatedResponse<Customer>>>(`${BASE_URL}/search`, { params });
  },

  getCustomersByStatus(status: CustomerStatus, params?: CustomerQueryParams) {
    return axiosInstance.get<ApiResponse<PaginatedResponse<Customer>>>(`${BASE_URL}/status/${status}`, { params });
  },

  // CRUD operations
  createCustomer(customerData: CreateCustomerRequest) {
    return axiosInstance.post<ApiResponse<Customer>>(`${BASE_URL}`, customerData);
  },

  updateCustomer(id: number, customerData: UpdateCustomerRequest) {
    return axiosInstance.put<ApiResponse<Customer>>(`${BASE_URL}/${id}`, customerData);
  },

  deleteCustomer(id: number) {
    return axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  // Status operations
  updateCustomerStatus(id: number, status: CustomerStatus, reason?: string) {
    return axiosInstance.patch<ApiResponse<Customer>>(`${BASE_URL}/${id}/status`, { status, reason });
  },

  // Validation operations
  validateCustomer(customerData: CreateCustomerRequest | UpdateCustomerRequest) {
    return axiosInstance.post<ApiResponse<{ valid: boolean; errors: string[]; warnings: string[] }>>(`${BASE_URL}/validate`, customerData);
  },

  // Summary and metrics
  getCustomerSummary() {
    return axiosInstance.get<ApiResponse<CustomerSummary>>(`${BASE_URL}/summary`);
  },

  // Bulk operations
  bulkUpdateStatus(customerIds: number[], status: CustomerStatus, reason?: string) {
    return axiosInstance.patch<ApiResponse<Customer[]>>(`${BASE_URL}/bulk/status`, { customerIds, status, reason });
  },

  bulkDelete(customerIds: number[]) {
    return axiosInstance.delete(`${BASE_URL}/bulk`, { data: { customerIds } });
  }
};