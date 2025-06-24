import axiosInstance from '~/http/axios';
import type {
  InventorySettings,
  CreateInventorySettingsRequest,
  UpdateInventorySettingsRequest,
  InventorySettingsQueryParams,
  InventorySettingsHistory,
  InventorySettingsSummary,
  InventorySettingsValidation,
  InventorySettingsExport,
  InventorySettingsImport
} from '~/types/inventory/settings';

const BASE_URL = '/tenant/inventory/settings';

export const inventorySettingsApi = {
  /**
   * Get active inventory settings
   */
  getActiveSettings(): Promise<InventorySettings> {
    return axiosInstance.get(`${BASE_URL}/active`);
  },

  /**
   * Get inventory settings by ID
   */
  getSettingsById(id: number): Promise<InventorySettings> {
    return axiosInstance.get(`${BASE_URL}/${id}`);
  },

  /**
   * Get all inventory settings
   */
  getAllSettings(): Promise<InventorySettings[]> {
    return axiosInstance.get(BASE_URL);
  },

  /**
   * Get inventory settings history
   */
  getSettingsHistory(params?: InventorySettingsQueryParams): Promise<InventorySettingsHistory[]> {
    return axiosInstance.get(`${BASE_URL}/history`, { params });
  },

  /**
   * Create new inventory settings
   */
  createSettings(settings: CreateInventorySettingsRequest): Promise<InventorySettings> {
    return axiosInstance.post(BASE_URL, settings);
  },

  /**
   * Update existing inventory settings
   */
  updateSettings(id: number, settings: UpdateInventorySettingsRequest): Promise<InventorySettings> {
    return axiosInstance.put(`${BASE_URL}/${id}`, settings);
  },

  /**
   * Initialize default inventory settings for new tenant
   */
  initializeSettings(): Promise<InventorySettings> {
    return axiosInstance.post(`${BASE_URL}/initialize`);
  },

  /**
   * Reset inventory settings to default values
   */
  resetSettings(): Promise<InventorySettings> {
    return axiosInstance.post(`${BASE_URL}/reset`);
  },

  /**
   * Validate inventory settings configuration
   */
  validateSettings(settings: CreateInventorySettingsRequest): Promise<InventorySettingsValidation> {
    return axiosInstance.post(`${BASE_URL}/validate`, settings);
  },

  /**
   * Export inventory settings configuration
   */
  exportSettings(): Promise<InventorySettingsExport> {
    return axiosInstance.get(`${BASE_URL}/export`);
  },

  /**
   * Import inventory settings configuration
   */
  importSettings(importData: InventorySettingsImport): Promise<InventorySettings> {
    return axiosInstance.post(`${BASE_URL}/import`, importData);
  },

  /**
   * Get inventory settings summary for dashboard
   */
  getSettingsSummary(): Promise<InventorySettingsSummary> {
    return axiosInstance.get(`${BASE_URL}/summary`);
  },

  /**
   * Delete inventory settings (if supported)
   */
  deleteSettings(id: number): Promise<void> {
    return axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Activate specific inventory settings
   */
  activateSettings(id: number): Promise<InventorySettings> {
    return axiosInstance.post(`${BASE_URL}/${id}/activate`);
  },

  /**
   * Deactivate specific inventory settings
   */
  deactivateSettings(id: number): Promise<InventorySettings> {
    return axiosInstance.post(`${BASE_URL}/${id}/deactivate`);
  },

  /**
   * Clone existing inventory settings
   */
  cloneSettings(id: number, name?: string): Promise<InventorySettings> {
    return axiosInstance.post(`${BASE_URL}/${id}/clone`, { name });
  },

  /**
   * Bulk update multiple settings
   */
  bulkUpdateSettings(updates: Array<{ id: number; settings: Partial<UpdateInventorySettingsRequest> }>): Promise<InventorySettings[]> {
    return axiosInstance.post(`${BASE_URL}/bulk-update`, { updates });
  },

  /**
   * Compare two settings configurations
   */
  compareSettings(settingsId1: number, settingsId2: number): Promise<{ differences: Record<string, { old: any; new: any }> }> {
    return axiosInstance.get(`${BASE_URL}/compare`, {
      params: { settings1: settingsId1, settings2: settingsId2 }
    });
  },

  /**
   * Get settings by tenant (if multi-tenant support)
   */
  getSettingsByTenant(tenantId: string): Promise<InventorySettings[]> {
    return axiosInstance.get(`${BASE_URL}/tenant/${tenantId}`);
  },

  /**
   * Test settings configuration
   */
  testSettings(settings: CreateInventorySettingsRequest): Promise<{ isValid: boolean; warnings: string[]; errors: string[] }> {
    return axiosInstance.post(`${BASE_URL}/test`, settings);
  },

  /**
   * Get default settings template
   */
  getDefaultSettings(): Promise<CreateInventorySettingsRequest> {
    return axiosInstance.get(`${BASE_URL}/defaults`);
  },

  /**
   * Save settings as template
   */
  saveAsTemplate(id: number, templateName: string, description?: string): Promise<void> {
    return axiosInstance.post(`${BASE_URL}/${id}/save-template`, {
      name: templateName,
      description
    });
  },

  /**
   * Apply settings template
   */
  applyTemplate(templateId: string): Promise<InventorySettings> {
    return axiosInstance.post(`${BASE_URL}/apply-template/${templateId}`);
  },

  /**
   * Get audit trail for specific settings
   */
  getAuditTrail(settingsId: number): Promise<InventorySettingsHistory[]> {
    return axiosInstance.get(`${BASE_URL}/${settingsId}/audit`);
  },

  /**
   * Rollback to previous settings version
   */
  rollbackSettings(settingsId: number, targetVersion: number): Promise<InventorySettings> {
    return axiosInstance.post(`${BASE_URL}/${settingsId}/rollback`, { targetVersion });
  },

  /**
   * Preview settings changes before applying
   */
  previewChanges(id: number, changes: Partial<UpdateInventorySettingsRequest>): Promise<{ preview: InventorySettings; impact: string[] }> {
    return axiosInstance.post(`${BASE_URL}/${id}/preview`, changes);
  },

  /**
   * Schedule settings update
   */
  scheduleUpdate(id: number, settings: UpdateInventorySettingsRequest, scheduledAt: string): Promise<void> {
    return axiosInstance.post(`${BASE_URL}/${id}/schedule`, {
      settings,
      scheduledAt
    });
  },

  /**
   * Get scheduled updates
   */
  getScheduledUpdates(): Promise<Array<{ id: number; settings: UpdateInventorySettingsRequest; scheduledAt: string; status: string }>> {
    return axiosInstance.get(`${BASE_URL}/scheduled`);
  },

  /**
   * Cancel scheduled update
   */
  cancelScheduledUpdate(scheduleId: number): Promise<void> {
    return axiosInstance.delete(`${BASE_URL}/scheduled/${scheduleId}`);
  }
};

export default inventorySettingsApi;
