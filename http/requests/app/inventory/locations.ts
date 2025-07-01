import axiosInstance from '@/http/axios';
import type { 
  Warehouse,
  Zone,
  Aisle,
  Shelf,
  WarehouseHierarchy,
  WarehouseLocationNode,
  CreateMainWarehouseRequest,
  CreateZoneRequest,
  CreateAisleRequest,
  CreateShelfRequest,
  UpdateWarehouseRequest,
  DeactivateWarehouseRequest,
  WarehouseQueryParams,
  PaginatedResponse,
  ApiResponse
} from '@/types/inventory/location';

const BASE_URL = '/tenant/inventory';

// Define API client for Warehouse Management operations
export default {
  // ======== WAREHOUSE MANAGEMENT ========
  
  /**
   * Create main warehouse
   */
  createMainWareHouse(warehouse: CreateMainWarehouseRequest): Promise<ApiResponse<Warehouse>> {
    return axiosInstance.post(`${BASE_URL}/warehouses`, warehouse);
  },

  /**
   * Create zone
   */
  createZone(id: number, zone: CreateZoneRequest): Promise<ApiResponse<Zone>> {
    return axiosInstance.post(`${BASE_URL}/warehouses/${id}/locations`, zone);
  },

  /**
   * Create aisle
   */
  createAisle(id: number, aisle: CreateAisleRequest): Promise<ApiResponse<Aisle>> {
    return axiosInstance.post(`${BASE_URL}/warehouses/${id}/locations`, aisle);
  },

  /**
   * Create shelf
   */
  createShelf(id: number, shelf: CreateShelfRequest): Promise<ApiResponse<Shelf>> {
    return axiosInstance.post(`${BASE_URL}/warehouses/${id}/locations`, shelf);
  },

  /**
   * Update warehouse
   */
  updateWarehouse(id: number, warehouse: UpdateWarehouseRequest): Promise<ApiResponse<Warehouse>> {
    return axiosInstance.put(`${BASE_URL}/warehouses/${id}`, warehouse);
  },

  /**
   * Deactivate warehouse
   */
  deactivateWarehouse(id: number, warehouse: DeactivateWarehouseRequest): Promise<ApiResponse<Warehouse>> {
    return axiosInstance.put(`${BASE_URL}/warehouses/${id}`, warehouse);
  },

  /**
   * Delete warehouse
   */
  deleteWarehouse(id: number): Promise<ApiResponse<null>> {
    return axiosInstance.delete(`${BASE_URL}/warehouses/${id}`);
  },

  /**
   * Fetch paginated warehouses
   */
  fetchWarehousesPaginated(params?: WarehouseQueryParams): Promise<ApiResponse<PaginatedResponse<Warehouse>>> {

    const queryParams: any = {
      page: params?.page ?? 0,
      size: params?.pageSize ?? params?.size ?? 10
    };
    
    // Add other query parameters if provided
    if (params?.search) {
      queryParams.search = params.search;
    }
    if (params?.sortBy) {
      queryParams.sortBy = params.sortBy;
    }
    if (params?.sortOrder) {
      queryParams.sortOrder = params.sortOrder;
    }
    
    return axiosInstance.get(`${BASE_URL}/warehouses`, { params: queryParams });
  },

  /**
   * Fetch all warehouses
   */
  fetchAllWarehouses(): Promise<ApiResponse<Warehouse[]>> {
    return axiosInstance.get(`${BASE_URL}/warehouses`);
  },

  /**
   * Fetch warehouse by ID
   */
  fetchWarehouseById(id: number): Promise<ApiResponse<Warehouse>> {
    return axiosInstance.get(`${BASE_URL}/warehouses/${id}`);
  },

  /**
   * Fetch complete warehouse hierarchy
   */
  fetchCompleteWarehouseHierarchy(id: number): Promise<ApiResponse<WarehouseHierarchy>> {
    return axiosInstance.get(`${BASE_URL}/warehouses/${id}/hierarchy`);
  },

  /**
   * Fetch location tree structure
   */
  fetchLocationTreeStructure(warehouseId: number): Promise<ApiResponse<WarehouseLocationNode[]>> {
    return axiosInstance.get(`${BASE_URL}/warehouses/${warehouseId}/locations/tree`);
  }
};