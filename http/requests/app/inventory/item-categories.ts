import axiosInstance from '~/http/axios';
import type {
  ItemCategory,
  CreateItemCategoryRequest,
  UpdateItemCategoryRequest,
  ItemCategoryFilters,
  ItemCategoryWithHierarchy,
  CategorySearchResult,
  CategoryStatistics,
  CategoryImportDTO,
  CategoryExportOptions,
  CategoryBulkUpdateDTO,
  CategoryBulkDeleteDTO,
  GetCategoriesRequest,
  SearchCategoriesRequest,
  GetHierarchyRequest,
  PaginatedResponse,
  ApiResponse
} from '~/types/inventory/item-categories';

const BASE_URL = '/tenant/inventory/categories';

export const itemCategoriesApi = {
  /**
   * Get categories (paginated)
   */
  getPaginatedCategories(params?: GetCategoriesRequest): Promise<ApiResponse<PaginatedResponse<ItemCategory>>> {
    return axiosInstance.get(BASE_URL, { params });
  },

  /**
   * Get all categories (non-paginated)
   */
  getAllCategories(): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.get(`${BASE_URL}/all`);
  },

  /**
   * Get category by ID
   */
  getCategoryById(id: number): Promise<ApiResponse<ItemCategory>> {
    return axiosInstance.get(`${BASE_URL}/${id}`);
  },

  /**
   * Get category by unique code
   */
  getCategoryByCode(categoryCode: string): Promise<ApiResponse<ItemCategory>> {
    return axiosInstance.get(`${BASE_URL}/code/${categoryCode}`);
  },

  /**
   * Search categories by term
   */
  searchCategories(request: SearchCategoriesRequest): Promise<ApiResponse<CategorySearchResult[]>> {
    return axiosInstance.get(`${BASE_URL}/search`, { params: request });
  },

  /**
   * Get sub-categories of a parent
   */
  getSubcategories(parentId: number): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.get(`${BASE_URL}/parent/${parentId}`);
  },

  /**
   * Get root-level categories only
   */
  getTopLevelCategories(): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.get(`${BASE_URL}/top-level`);
  },

  /**
   * Get complete category hierarchy
   */
  getCategoryHierarchy(request?: GetHierarchyRequest): Promise<ApiResponse<Array<{
    rootCategory: ItemCategory;
    children: Array<{
      category: ItemCategory;
    }>;
  }>>> {
    return axiosInstance.get(`${BASE_URL}/hierarchy`, { params: request });
  },

  /**
   * Create new item category
   */
  createCategory(category: CreateItemCategoryRequest): Promise<ApiResponse<ItemCategory>> {
    return axiosInstance.post(BASE_URL, category);
  },

  /**
   * Update existing category
   */
  updateCategory(id: number, category: UpdateItemCategoryRequest): Promise<ApiResponse<ItemCategory>> {
    return axiosInstance.put(`${BASE_URL}/${id}`, category);
  },

  /**
   * Delete category
   */
  deleteCategory(id: number): Promise<ApiResponse<null>> {
    return axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Bulk update multiple categories
   */
  bulkUpdateCategories(data: CategoryBulkUpdateDTO): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.post(`${BASE_URL}/bulk-update`, data);
  },

  /**
   * Bulk delete multiple categories
   */
  bulkDeleteCategories(data: CategoryBulkDeleteDTO): Promise<ApiResponse<null>> {
    return axiosInstance.post(`${BASE_URL}/bulk-delete`, data);
  },

  /**
   * Get category statistics
   */
  getCategoryStatistics(): Promise<ApiResponse<CategoryStatistics>> {
    return axiosInstance.get(`${BASE_URL}/statistics`);
  },

  /**
   * Import categories from file/data
   */
  importCategories(importData: CategoryImportDTO): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.post(`${BASE_URL}/import`, importData);
  },

  /**
   * Export categories
   */
  exportCategories(options?: CategoryExportOptions): Promise<Blob> {
    return axiosInstance.get(`${BASE_URL}/export`, {
      params: options,
      responseType: 'blob'
    });
  },

  /**
   * Validate category data before creation/update
   */
  validateCategory(category: CreateItemCategoryRequest): Promise<ApiResponse<{ isValid: boolean; errors: string[]; warnings: string[] }>> {
    return axiosInstance.post(`${BASE_URL}/validate`, category);
  },

  /**
   * Activate category
   */
  activateCategory(id: number): Promise<ApiResponse<ItemCategory>> {
    return axiosInstance.post(`${BASE_URL}/${id}/activate`);
  },

  /**
   * Deactivate category
   */
  deactivateCategory(id: number): Promise<ApiResponse<ItemCategory>> {
    return axiosInstance.post(`${BASE_URL}/${id}/deactivate`);
  },

  /**
   * Clone/duplicate category
   */
  cloneCategory(id: number, newCode: string, newName?: string): Promise<ApiResponse<ItemCategory>> {
    return axiosInstance.post(`${BASE_URL}/${id}/clone`, {
      code: newCode,
      name: newName
    });
  },

  /**
   * Move category to different parent
   */
  moveCategory(id: number, newParentId?: number): Promise<ApiResponse<ItemCategory>> {
    return axiosInstance.post(`${BASE_URL}/${id}/move`, {
      parentCategoryId: newParentId
    });
  },

  /**
   * Get categories by parent with pagination
   */
  getCategoriesByParent(parentId: number, params?: GetCategoriesRequest): Promise<ApiResponse<PaginatedResponse<ItemCategory>>> {
    return axiosInstance.get(`${BASE_URL}/parent/${parentId}/paginated`, { params });
  },

  /**
   * Reorder categories within same parent
   */
  reorderCategories(parentId: number | null, categoryOrders: Array<{ id: number; sortOrder: number }>): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.post(`${BASE_URL}/reorder`, {
      parentId,
      orders: categoryOrders
    });
  },

  /**
   * Get category usage statistics (how many items use this category)
   */
  getCategoryUsage(id: number): Promise<ApiResponse<{ categoryId: number; itemCount: number; activeItemCount: number }>> {
    return axiosInstance.get(`${BASE_URL}/${id}/usage`);
  },

  /**
   * Get category path from root to specific category
   */
  getCategoryPath(id: number): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.get(`${BASE_URL}/${id}/path`);
  },

  /**
   * Check if category code is available
   */
  checkCodeAvailability(code: string, excludeId?: number): Promise<ApiResponse<{ available: boolean }>> {
    return axiosInstance.get(`${BASE_URL}/check-code`, {
      params: { code, excludeId }
    });
  },

  /**
   * Get suggested categories based on name/description
   */
  getSuggestedCategories(query: string, limit?: number): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.get(`${BASE_URL}/suggestions`, {
      params: { query, limit }
    });
  },

  /**
   * Merge two categories (move all items from source to target)
   */
  mergeCategories(sourceId: number, targetId: number): Promise<ApiResponse<{ merged: ItemCategory; itemsMoved: number }>> {
    return axiosInstance.post(`${BASE_URL}/${sourceId}/merge/${targetId}`);
  },

  /**
   * Get categories with item counts
   */
  getCategoriesWithCounts(): Promise<ApiResponse<Array<ItemCategory & { itemCount: number; activeItemCount: number }>>> {
    return axiosInstance.get(`${BASE_URL}/with-counts`);
  },

  /**
   * Get category history/audit trail
   */
  getCategoryHistory(id: number): Promise<ApiResponse<Array<{ action: string; timestamp: string; userId: string; changes: Record<string, any> }>>> {
    return axiosInstance.get(`${BASE_URL}/${id}/history`);
  },

  /**
   * Get orphaned categories (categories without parent that should have one)
   */
  getOrphanedCategories(): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.get(`${BASE_URL}/orphaned`);
  },

  /**
   * Get empty categories (categories with no items)
   */
  getEmptyCategories(): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.get(`${BASE_URL}/empty`);
  },

  /**
   * Get categories by level in hierarchy
   */
  getCategoriesByLevel(level: number): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.get(`${BASE_URL}/level/${level}`);
  },

  /**
   * Get maximum hierarchy depth
   */
  getMaxDepth(): Promise<ApiResponse<{ maxDepth: number }>> {
    return axiosInstance.get(`${BASE_URL}/max-depth`);
  },

  /**
   * Rebuild category hierarchy (fix any inconsistencies)
   */
  rebuildHierarchy(): Promise<ApiResponse<{ categoriesProcessed: number; issuesFixed: number }>> {
    return axiosInstance.post(`${BASE_URL}/rebuild-hierarchy`);
  },

  /**
   * Get category template for creation
   */
  getCategoryTemplate(): Promise<ApiResponse<CreateItemCategoryRequest>> {
    return axiosInstance.get(`${BASE_URL}/template`);
  },

  /**
   * Apply bulk sort order update
   */
  updateSortOrders(updates: Array<{ id: number; sortOrder: number }>): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.post(`${BASE_URL}/update-sort-orders`, { updates });
  },

  /**
   * Get recently modified categories
   */
  getRecentlyModified(limit?: number): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.get(`${BASE_URL}/recent`, { params: { limit } });
  },

  /**
   * Get categories by tenant (if multi-tenant support)
   */
  getCategoriesByTenant(tenantId: string): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.get(`${BASE_URL}/tenant/${tenantId}`);
  },

  /**
   * Archive category (soft delete with items preservation)
   */
  archiveCategory(id: number): Promise<ApiResponse<ItemCategory>> {
    return axiosInstance.post(`${BASE_URL}/${id}/archive`);
  },

  /**
   * Restore archived category
   */
  restoreCategory(id: number): Promise<ApiResponse<ItemCategory>> {
    return axiosInstance.post(`${BASE_URL}/${id}/restore`);
  },

  /**
   * Get archived categories
   */
  getArchivedCategories(): Promise<ApiResponse<ItemCategory[]>> {
    return axiosInstance.get(`${BASE_URL}/archived`);
  }
};

export default itemCategoriesApi;
