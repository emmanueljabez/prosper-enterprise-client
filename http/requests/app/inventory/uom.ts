import axiosInstance from '~/http/axios';
import type {
  UnitOfMeasure,
  CreateUnitOfMeasureRequest,
  UpdateUnitOfMeasureRequest,
  UnitSearchParams,
  UnitConversionParams,
  BulkConversionParams,
  UnitFamily,
  UnitStatistics,
  ConversionResult,
  BulkConversionResult,
  CompatibilityResult,
  CreateUnitResponse,
  GetUnitResponse,
  GetUnitsResponse,
  GetUnitsPaginatedResponse,
  UpdateUnitResponse,
  DeleteUnitResponse,
  ConvertQuantityResponse,
  BulkConvertResponse,
  CompatibilityResponse,
  UnitFamilyResponse,
  UnitStatisticsResponse,
  PaginatedResponse
} from '~/types/inventory/uom';

const BASE_URL = '/tenant/inventory/units';

export const uomApi = {
  /**
   * Create a new base unit of measure
   */
  createBaseUnit(unit: CreateUnitOfMeasureRequest): Promise<CreateUnitResponse> {
    return axiosInstance.post(`${BASE_URL}`, unit);
  },

  /**
   * Create a new conversion unit of measure
   */
  createConversionUnit(unit: CreateUnitOfMeasureRequest): Promise<CreateUnitResponse> {
    return axiosInstance.post(`${BASE_URL}`, unit);
  },

  /**
   * Create a new unit of measure (legacy endpoint - determines type based on isBaseUnit flag)
   */
  createUnit(unit: CreateUnitOfMeasureRequest): Promise<CreateUnitResponse> {
    return axiosInstance.post(BASE_URL, unit);
  },

  /**
   * Get all units (paginated)
   */
  getUnitsPaginated(params?: { page?: number; size?: number }): Promise<PaginatedResponse<UnitOfMeasure>> {
    return axiosInstance.get(BASE_URL, { params });
  },

  /**
   * Get all units (no pagination)
   */
  getAllUnits(): Promise<UnitOfMeasure[]> {
    return axiosInstance.get(`${BASE_URL}/all`);
  },
  /**
   * Get unit by ID
   */
  getUnitById(id: number): Promise<GetUnitResponse> {
    return axiosInstance.get(`${BASE_URL}/${id}`);
  },

  /**
   * Get unit by code
   */
  getUnitByCode(code: string): Promise<GetUnitResponse> {
    return axiosInstance.get(`${BASE_URL}/code/${code}`);
  },

  /**
   * Update an existing unit
   */
  updateUnit(id: number, unit: UpdateUnitOfMeasureRequest): Promise<UpdateUnitResponse> {
    return axiosInstance.put(`${BASE_URL}/${id}`, unit);
  },

  /**
   * Delete a unit (soft delete - sets isActive to false)
   */
  deleteUnit(id: number): Promise<DeleteUnitResponse> {
    return axiosInstance.delete(`${BASE_URL}/${id}`);
  },
  /**
   * Search units by name, code, or description
   */
  searchUnits(searchTerm: string): Promise<GetUnitsResponse> {
    return axiosInstance.get(`${BASE_URL}/search`, {
      params: { searchTerm }
    });
  },

  /**
   * Get all base units
   */
  getBaseUnits(): Promise<GetUnitsResponse> {
    return axiosInstance.get(`${BASE_URL}/base`);
  },

  /**
   * Get conversion units for a specific base unit
   */
  getConversionUnits(baseUnitId: number): Promise<GetUnitsResponse> {
    return axiosInstance.get(`${BASE_URL}/base/${baseUnitId}/conversions`);
  },

  /**
   * Get complete unit family (base unit + all conversions)
   */
  getUnitFamily(baseUnitId: number): Promise<UnitFamilyResponse> {
    return axiosInstance.get(`${BASE_URL}/family/${baseUnitId}`);
  },

  /**
   * Get UOM hierarchy with base units and their children
   */
  getUOMHierarchy(): Promise<Array<{
    baseUnit: UnitOfMeasure;
    children: Array<{
      unit: UnitOfMeasure;
      cumulativeConversionFactor: number;
    }>;
  }>> {
    return axiosInstance.get(`${BASE_URL}/hierarchy`);
  },

  /**
   * Get units by category
   */
  getUnitsByCategory(category: string): Promise<GetUnitsResponse> {
    return axiosInstance.get(`${BASE_URL}/category/${category}`);
  },
  /**
   * Convert quantity between units using unit IDs
   */
  convertQuantity(params: UnitConversionParams): Promise<ConvertQuantityResponse> {
    const { quantity, fromUnitId, toUnitId } = params;
    return axiosInstance.post(`${BASE_URL}/convert`, null, {
      params: { quantity, fromUnitId, toUnitId }
    });
  },

  /**
   * Convert quantity between units using unit codes
   */
  convertQuantityByCode(params: UnitConversionParams): Promise<ConvertQuantityResponse> {
    const { quantity, fromUnitCode, toUnitCode } = params;
    return axiosInstance.post(`${BASE_URL}/convert-by-code`, null, {
      params: { quantity, fromUnitCode, toUnitCode }
    });
  },

  /**
   * Check if two units are compatible for conversion
   */
  checkCompatibility(fromUnitId: number, toUnitId: number): Promise<CompatibilityResponse> {
    return axiosInstance.get(`${BASE_URL}/compatible`, {
      params: { fromUnitId, toUnitId }
    });
  },

  /**
   * Convert quantity to multiple target units
   */
  bulkConvert(params: BulkConversionParams): Promise<BulkConvertResponse> {
    const { quantity, fromUnitId, toUnitIds } = params;
    return axiosInstance.post(`${BASE_URL}/bulk-convert`, null, {
      params: { 
        quantity, 
        fromUnitId, 
        toUnitIds: toUnitIds.join(',') 
      }
    });
  },

  /**
   * Get comprehensive statistics about units
   */
  getStatistics(): Promise<UnitStatisticsResponse> {
    return axiosInstance.get(`${BASE_URL}/statistics`);
  },

  /**
   * Get most frequently used units
   */
  getMostUsedUnits(limit?: number): Promise<UnitOfMeasure[]> {
    return axiosInstance.get(`${BASE_URL}/most-used`, {
      params: { limit }
    });
  },

  /**
   * Advanced search with multiple filters
   */
  advancedSearch(params: UnitSearchParams): Promise<UnitOfMeasure[]> {
    return axiosInstance.get(`${BASE_URL}/advanced-search`, { params });
  },

  /**
   * Get all available categories
   */
  getCategories(): Promise<string[]> {
    return axiosInstance.get(`${BASE_URL}/categories`);
  },

  /**
   * Bulk create multiple units
   */
  bulkCreateUnits(units: CreateUnitOfMeasureRequest[]): Promise<number[]> {
    return axiosInstance.post(`${BASE_URL}/bulk-create`, { units });
  },

  /**
   * Bulk update multiple units
   */
  bulkUpdateUnits(updates: Array<{ id: number; unit: UpdateUnitOfMeasureRequest }>): Promise<UnitOfMeasure[]> {
    return axiosInstance.post(`${BASE_URL}/bulk-update`, { updates });
  },

  /**
   * Bulk delete multiple units
   */
  bulkDeleteUnits(ids: number[]): Promise<string[]> {
    return axiosInstance.post(`${BASE_URL}/bulk-delete`, { ids });
  },

  /**
   * Activate a unit (set isActive to true)
   */
  activateUnit(id: number): Promise<UnitOfMeasure> {
    return axiosInstance.post(`${BASE_URL}/${id}/activate`);
  },

  /**
   * Deactivate a unit (set isActive to false)
   */
  deactivateUnit(id: number): Promise<UnitOfMeasure> {
    return axiosInstance.post(`${BASE_URL}/${id}/deactivate`);
  },

  /**
   * Clone an existing unit
   */
  cloneUnit(id: number, newCode: string, newName?: string): Promise<UnitOfMeasure> {
    return axiosInstance.post(`${BASE_URL}/${id}/clone`, { 
      newCode, 
      newName 
    });
  },

  /**
   * Validate unit configuration before creation/update
   */
  validateUnit(unit: CreateUnitOfMeasureRequest): Promise<{ isValid: boolean; warnings: string[]; errors: string[] }> {
    return axiosInstance.post(`${BASE_URL}/validate`, unit);
  },

  /**
   * Get conversion history for a unit
   */
  getConversionHistory(unitId: number): Promise<Array<{ 
    fromUnit: UnitOfMeasure; 
    toUnit: UnitOfMeasure; 
    quantity: number; 
    result: number; 
    timestamp: string 
  }>> {
    return axiosInstance.get(`${BASE_URL}/${unitId}/conversion-history`);
  },

  /**
   * Export units configuration
   */
  exportUnits(format: 'json' | 'csv' | 'excel' = 'json'): Promise<Blob> {
    return axiosInstance.get(`${BASE_URL}/export`, {
      params: { format },
      responseType: 'blob'
    });
  },

  /**
   * Import units from file
   */
  importUnits(file: File, format: 'json' | 'csv' | 'excel' = 'json'): Promise<{ 
    imported: number; 
    skipped: number; 
    errors: string[] 
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    
    return axiosInstance.post(`${BASE_URL}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  /**
   * Get unit dependencies (what uses this unit)
   */
  getUnitDependencies(id: number): Promise<{
    products: Array<{ id: number; name: string }>;
    recipes: Array<{ id: number; name: string }>;
    transactions: number;
    canDelete: boolean;
  }> {
    return axiosInstance.get(`${BASE_URL}/${id}/dependencies`);
  },

  /**
   * Get conversion chain between two units
   */
  getConversionChain(fromUnitId: number, toUnitId: number): Promise<{
    path: UnitOfMeasure[];
    totalFactor: number;
    steps: Array<{ from: UnitOfMeasure; to: UnitOfMeasure; factor: number }>;
  }> {
    return axiosInstance.get(`${BASE_URL}/conversion-chain`, {
      params: { fromUnitId, toUnitId }
    });
  },

  /**
   * Get units with similar names or codes (for duplicate detection)
   */
  findSimilarUnits(code: string, name: string): Promise<UnitOfMeasure[]> {
    return axiosInstance.get(`${BASE_URL}/find-similar`, {
      params: { code, name }
    });
  },

  /**
   * Get unit usage analytics
   */
  getUnitAnalytics(unitId: number, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    unit: UnitOfMeasure;
    usageCount: number;
    conversionCount: number;
    topConversions: Array<{ toUnit: UnitOfMeasure; count: number }>;
    timeline: Array<{ date: string; usage: number }>;
  }> {
    return axiosInstance.get(`${BASE_URL}/${unitId}/analytics`, {
      params: { period }
    });
  },

  /**
   * Set default units for categories
   */
  setDefaultUnits(defaults: Record<string, number>): Promise<void> {
    return axiosInstance.post(`${BASE_URL}/set-defaults`, { defaults });
  },

  /**
   * Get default units for categories
   */
  getDefaultUnits(): Promise<Record<string, UnitOfMeasure>> {
    return axiosInstance.get(`${BASE_URL}/defaults`);
  },

  /**
   * Test conversion accuracy
   */
  testConversion(fromUnitId: number, toUnitId: number, testQuantities: number[]): Promise<{
    results: Array<{ quantity: number; converted: number; accuracy: number }>;
    averageAccuracy: number;
    passed: boolean;
  }> {
    return axiosInstance.post(`${BASE_URL}/test-conversion`, {
      fromUnitId,
      toUnitId,
      testQuantities
    });
  },

  /**
   * Get unit templates for common industries
   */
  getUnitTemplates(industry?: string): Promise<Array<{
    name: string;
    description: string;
    units: CreateUnitOfMeasureRequest[];
  }>> {
    return axiosInstance.get(`${BASE_URL}/templates`, {
      params: { industry }
    });
  },

  /**
   * Apply unit template
   */
  applyUnitTemplate(templateName: string): Promise<UnitOfMeasure[]> {
    return axiosInstance.post(`${BASE_URL}/apply-template`, { templateName });
  },

  /**
   * Get audit trail for unit changes
   */
  getAuditTrail(unitId: number): Promise<Array<{
    action: string;
    changes: Record<string, { old: any; new: any }>;
    timestamp: string;
    user: { id: number; username: string };
  }>> {
    return axiosInstance.get(`${BASE_URL}/${unitId}/audit`);
  },

  /**
   * Backup units configuration
   */
  backupUnits(): Promise<{ backupId: string; timestamp: string }> {
    return axiosInstance.post(`${BASE_URL}/backup`);
  },

  /**
   * Restore units from backup
   */
  restoreUnits(backupId: string): Promise<{ restored: number; message: string }> {
    return axiosInstance.post(`${BASE_URL}/restore`, { backupId });
  },

  /**
   * Get system health check for units
   */
  getHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    checks: Array<{ name: string; status: string; message?: string }>;
    recommendations: string[];
  }> {
    return axiosInstance.get(`${BASE_URL}/health`);
  }
};

export default uomApi;
