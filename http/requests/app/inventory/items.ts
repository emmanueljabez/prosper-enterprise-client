import axiosInstance from '~/http/axios';
import type {
  InventoryItem,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  InventoryItemQueryParams,
  StockAdjustment,
  CreateStockAdjustmentRequest,
  ItemLocation,
  CostCalculationRequest,
  CostCalculationResponse,
  LowStockItem,
  ReorderRequiredItem,
  ItemProductMapping,
  CreateItemProductMappingRequest,
  SyncConflict,
  InventoryItemSummary,
  InventoryItemValidation,
  InventoryItemExport,
  InventoryItemImport,
  PaginatedResponse,
  ApiResponse
} from '~/types/inventory/items';

const BASE_URL = '/tenant/inventory/items';

export const inventoryItemsApi = {
  /**
   * Get items (with pagination support)
   */
  getItems(params?: InventoryItemQueryParams): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    return axiosInstance.get(BASE_URL, { params });
  },

  /**
   * Get item by ID
   */
  getItemById(id: number): Promise<ApiResponse<InventoryItem>> {
    return axiosInstance.get(`${BASE_URL}/${id}`);
  },

  /**
   * Get item by unique code
   */
  getItemByCode(itemCode: string): Promise<ApiResponse<InventoryItem>> {
    return axiosInstance.get(`${BASE_URL}/code/${itemCode}`);
  },

  /**
   * Get item by barcode
   */
  getItemByBarcode(barcode: string): Promise<ApiResponse<InventoryItem>> {
    return axiosInstance.get(`${BASE_URL}/barcode/${barcode}`);
  },

  /**
   * Search items by term
   */
  searchItems(params: InventoryItemQueryParams & { searchTerm: string }): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    return axiosInstance.get(`${BASE_URL}/search`, { params });
  },

  /**
   * Get items by category
   */
  getItemsByCategory(categoryId: number, params?: InventoryItemQueryParams): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    return axiosInstance.get(`${BASE_URL}/category/${categoryId}`, { params });
  },

  /**
   * Get low stock items
   */
  getLowStockItems(params?: InventoryItemQueryParams): Promise<ApiResponse<PaginatedResponse<LowStockItem>>> {
    return axiosInstance.get(`${BASE_URL}/low-stock`, { params });
  },

  /**
   * Get items requiring reorder
   */
  getReorderRequiredItems(params?: InventoryItemQueryParams): Promise<ApiResponse<PaginatedResponse<ReorderRequiredItem>>> {
    return axiosInstance.get(`${BASE_URL}/reorder-required`, { params });
  },

  /**
   * Create new inventory item
   */
  createItem(item: CreateInventoryItemRequest): Promise<ApiResponse<InventoryItem>> {
    return axiosInstance.post(BASE_URL, item);
  },

  /**
   * Update existing item
   */
  updateItem(id: number, item: UpdateInventoryItemRequest): Promise<ApiResponse<InventoryItem>> {
    return axiosInstance.put(`${BASE_URL}/${id}`, item);
  },

  /**
   * Delete item
   */
  deleteItem(id: number): Promise<ApiResponse<null>> {
    return axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Activate item
   */
  activateItem(id: number): Promise<ApiResponse<InventoryItem>> {
    return axiosInstance.put(`${BASE_URL}/${id}/activate`);
  },

  /**
   * Deactivate item
   */
  deactivateItem(id: number): Promise<ApiResponse<InventoryItem>> {
    return axiosInstance.put(`${BASE_URL}/${id}/deactivate`);
  },

  /**
   * Calculate cost for quantity
   */
  calculateCost(id: number, request: CostCalculationRequest): Promise<ApiResponse<CostCalculationResponse>> {
    return axiosInstance.post(`${BASE_URL}/${id}/calculate-cost`, request);
  },

  /**
   * Get item stock adjustments
   */
  getStockAdjustments(itemId?: number, params?: InventoryItemQueryParams): Promise<ApiResponse<PaginatedResponse<StockAdjustment>>> {
    const url = itemId ? `${BASE_URL}/${itemId}/adjustments` : `${BASE_URL}/adjustments`;
    return axiosInstance.get(url, { params });
  },

  /**
   * Create stock adjustment
   */
  createStockAdjustment(adjustment: CreateStockAdjustmentRequest): Promise<ApiResponse<StockAdjustment>> {
    return axiosInstance.post(`${BASE_URL}/adjustments`, adjustment);
  },

  /**
   * Get item locations and stock levels
   */
  getItemLocations(itemId: number): Promise<ApiResponse<ItemLocation[]>> {
    return axiosInstance.get(`${BASE_URL}/${itemId}/locations`);
  },

  /**
   * Update item stock at specific location
   */
  updateItemLocation(itemId: number, locationId: number, stockData: Partial<ItemLocation>): Promise<ApiResponse<ItemLocation>> {
    return axiosInstance.put(`${BASE_URL}/${itemId}/locations/${locationId}`, stockData);
  },

  /**
   * Bulk update multiple items
   */
  bulkUpdateItems(itemIds: number[], updates: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem[]>> {
    return axiosInstance.post(`${BASE_URL}/bulk-update`, {
      itemIds,
      updates
    });
  },

  /**
   * Bulk delete multiple items
   */
  bulkDeleteItems(itemIds: number[]): Promise<ApiResponse<null>> {
    return axiosInstance.post(`${BASE_URL}/bulk-delete`, {
      itemIds
    });
  },

  /**
   * Duplicate/clone item
   */
  duplicateItem(id: number, newItemCode: string, newItemName?: string): Promise<ApiResponse<InventoryItem>> {
    return axiosInstance.post(`${BASE_URL}/${id}/duplicate`, {
      itemCode: newItemCode,
      itemName: newItemName
    });
  },

  /**
   * Transfer stock between locations
   */
  transferStock(itemId: number, fromLocationId: number, toLocationId: number, quantity: number, notes?: string): Promise<ApiResponse<StockAdjustment[]>> {
    return axiosInstance.post(`${BASE_URL}/${itemId}/transfer`, {
      fromLocationId,
      toLocationId,
      quantity,
      notes
    });
  },

  /**
   * Get inventory summary/dashboard data
   */
  getInventorySummary(): Promise<ApiResponse<InventoryItemSummary>> {
    return axiosInstance.get(`${BASE_URL}/summary`);
  },

  /**
   * Validate item data before creation/update
   */
  validateItem(item: CreateInventoryItemRequest): Promise<ApiResponse<InventoryItemValidation>> {
    return axiosInstance.post(`${BASE_URL}/validate`, item);
  },

  /**
   * Export items
   */
  exportItems(params?: InventoryItemQueryParams & { format?: 'CSV' | 'EXCEL' | 'JSON' }): Promise<Blob> {
    return axiosInstance.get(`${BASE_URL}/export`, {
      params,
      responseType: 'blob'
    });
  },

  /**
   * Import items from file/data
   */
  importItems(importData: InventoryItemImport): Promise<ApiResponse<InventoryItem[]>> {
    return axiosInstance.post(`${BASE_URL}/import`, importData);
  },

  /**
   * Import items from file upload
   */
  importItemsFromFile(formData: FormData): Promise<ApiResponse<InventoryItem[]>> {
    return axiosInstance.post(`${BASE_URL}/import/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Get item usage statistics
   */
  getItemUsage(id: number): Promise<ApiResponse<{ itemId: number; salesCount: number; adjustmentCount: number; transferCount: number }>> {
    return axiosInstance.get(`${BASE_URL}/${id}/usage`);
  },

  /**
   * Check if item code is available
   */
  checkCodeAvailability(itemCode: string, excludeId?: number): Promise<ApiResponse<{ available: boolean }>> {
    return axiosInstance.get(`${BASE_URL}/check-code`, {
      params: { itemCode, excludeId }
    });
  },

  /**
   * Check if barcode is available
   */
  checkBarcodeAvailability(barcode: string, excludeId?: number): Promise<ApiResponse<{ available: boolean }>> {
    return axiosInstance.get(`${BASE_URL}/check-barcode`, {
      params: { barcode, excludeId }
    });
  },

  /**
   * Check if SKU is available
   */
  checkSkuAvailability(sku: string, excludeId?: number): Promise<ApiResponse<{ available: boolean }>> {
    return axiosInstance.get(`${BASE_URL}/check-sku`, {
      params: { sku, excludeId }
    });
  },

  /**
   * Get suggested items based on query
   */
  getSuggestedItems(query: string, limit?: number): Promise<ApiResponse<InventoryItem[]>> {
    return axiosInstance.get(`${BASE_URL}/suggestions`, {
      params: { query, limit }
    });
  },

  /**
   * Get items by brand
   */
  getItemsByBrand(brand: string, params?: InventoryItemQueryParams): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    return axiosInstance.get(`${BASE_URL}/brand/${encodeURIComponent(brand)}`, { params });
  },

  /**
   * Get items by manufacturer
   */
  getItemsByManufacturer(manufacturer: string, params?: InventoryItemQueryParams): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    return axiosInstance.get(`${BASE_URL}/manufacturer/${encodeURIComponent(manufacturer)}`, { params });
  },

  /**
   * Get items requiring attention (low stock, expired, etc.)
   */
  getItemsRequiringAttention(): Promise<ApiResponse<{
    lowStock: LowStockItem[];
    reorderRequired: ReorderRequiredItem[];
    expired: InventoryItem[];
    expiringSoon: InventoryItem[];
  }>> {
    return axiosInstance.get(`${BASE_URL}/attention-required`);
  },

  /**
   * Update reorder settings for item
   */
  updateReorderSettings(id: number, settings: {
    reorderPoint?: number;
    reorderQuantity?: number;
    minStockLevel?: number;
    maxStockLevel?: number;
    leadTimeDays?: number;
  }): Promise<ApiResponse<InventoryItem>> {
    return axiosInstance.put(`${BASE_URL}/${id}/reorder-settings`, settings);
  },

  /**
   * Get item history/audit trail
   */
  getItemHistory(id: number): Promise<ApiResponse<Array<{
    action: string;
    timestamp: string;
    userId: number;
    userName?: string;
    changes: Record<string, any>;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
  }>>> {
    return axiosInstance.get(`${BASE_URL}/${id}/history`);
  },

  /**
   * Archive item (soft delete)
   */
  archiveItem(id: number): Promise<ApiResponse<InventoryItem>> {
    return axiosInstance.post(`${BASE_URL}/${id}/archive`);
  },

  /**
   * Restore archived item
   */
  restoreItem(id: number): Promise<ApiResponse<InventoryItem>> {
    return axiosInstance.post(`${BASE_URL}/${id}/restore`);
  },

  /**
   * Get archived items
   */
  getArchivedItems(params?: InventoryItemQueryParams): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    return axiosInstance.get(`${BASE_URL}/archived`, { params });
  },

  /**
   * Get items with zero stock
   */
  getZeroStockItems(params?: InventoryItemQueryParams): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    return axiosInstance.get(`${BASE_URL}/zero-stock`, { params });
  },

  /**
   * Get items with negative stock
   */
  getNegativeStockItems(params?: InventoryItemQueryParams): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    return axiosInstance.get(`${BASE_URL}/negative-stock`, { params });
  },

  /**
   * Get recently modified items
   */
  getRecentlyModified(limit?: number): Promise<ApiResponse<InventoryItem[]>> {
    return axiosInstance.get(`${BASE_URL}/recent`, { params: { limit } });
  },

  /**
   * Get recently created items
   */
  getRecentlyCreated(limit?: number): Promise<ApiResponse<InventoryItem[]>> {
    return axiosInstance.get(`${BASE_URL}/recent-created`, { params: { limit } });
  },

  /**
   * Get item template for creation
   */
  getItemTemplate(): Promise<ApiResponse<CreateInventoryItemRequest>> {
    return axiosInstance.get(`${BASE_URL}/template`);
  },

  /**
   * Get items by cost range
   */
  getItemsByCostRange(minCost: number, maxCost: number, params?: InventoryItemQueryParams): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    return axiosInstance.get(`${BASE_URL}/cost-range`, {
      params: { minCost, maxCost, ...params }
    });
  },

  /**
   * Update item pricing
   */
  updateItemPricing(id: number, pricing: {
    standardCost?: number;
    averageCost?: number;
    lastCost?: number;
    sellingPrice?: number;
  }): Promise<ApiResponse<InventoryItem>> {
    return axiosInstance.put(`${BASE_URL}/${id}/pricing`, pricing);
  },

  /**
   * Recalculate average cost for item
   */
  recalculateAverageCost(id: number): Promise<ApiResponse<{ itemId: number; oldAverageCost: number; newAverageCost: number }>> {
    return axiosInstance.post(`${BASE_URL}/${id}/recalculate-average-cost`);
  },

  // Product mapping endpoints
  /**
   * Create item-product mapping
   */
  createMapping(mapping: CreateItemProductMappingRequest): Promise<ApiResponse<ItemProductMapping>> {
    return axiosInstance.post(`${BASE_URL}/mappings`, mapping);
  },

  /**
   * Get mappings for item
   */
  getItemMappings(itemId: number): Promise<ApiResponse<ItemProductMapping[]>> {
    return axiosInstance.get(`${BASE_URL}/${itemId}/mappings`);
  },

  /**
   * Get all mappings
   */
  getAllMappings(params?: InventoryItemQueryParams): Promise<ApiResponse<PaginatedResponse<ItemProductMapping>>> {
    return axiosInstance.get(`${BASE_URL}/mappings`, { params });
  },

  /**
   * Update mapping
   */
  updateMapping(mappingId: number, mapping: Partial<ItemProductMapping>): Promise<ApiResponse<ItemProductMapping>> {
    return axiosInstance.put(`${BASE_URL}/mappings/${mappingId}`, mapping);
  },

  /**
   * Delete mapping
   */
  deleteMapping(mappingId: number): Promise<ApiResponse<null>> {
    return axiosInstance.delete(`${BASE_URL}/mappings/${mappingId}`);
  },

  /**
   * Sync mapping with product catalog
   */
  syncMapping(mappingId: number): Promise<ApiResponse<ItemProductMapping>> {
    return axiosInstance.post(`${BASE_URL}/mappings/${mappingId}/sync`);
  },

  /**
   * Get sync conflicts
   */
  getSyncConflicts(mappingId?: number): Promise<ApiResponse<SyncConflict[]>> {
    const url = mappingId ? `${BASE_URL}/mappings/${mappingId}/conflicts` : `${BASE_URL}/sync-conflicts`;
    return axiosInstance.get(url);
  },

  /**
   * Resolve sync conflict
   */
  resolveSyncConflict(conflictId: number, resolution: 'USE_ITEM' | 'USE_PRODUCT' | 'MANUAL_REVIEW', notes?: string): Promise<ApiResponse<SyncConflict>> {
    return axiosInstance.post(`${BASE_URL}/sync-conflicts/${conflictId}/resolve`, {
      resolution,
      notes
    });
  },

  /**
   * Bulk sync all mappings
   */
  bulkSyncMappings(): Promise<ApiResponse<{ processed: number; successful: number; failed: number; conflicts: number }>> {
    return axiosInstance.post(`${BASE_URL}/mappings/bulk-sync`);
  }
};

export default inventoryItemsApi;