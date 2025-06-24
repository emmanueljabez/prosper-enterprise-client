import { defineStore } from 'pinia';
import inventorySettingsApi from '@/http/requests/app/inventory/settings';
import {
    type InventorySettings,
    type CreateInventorySettingsRequest,
    type UpdateInventorySettingsRequest,
    type InventorySettingsQueryParams,
    type InventorySettingsHistory,
    type InventorySettingsSummary,
    type InventorySettingsValidation,
    type InventorySettingsExport,
    type InventorySettingsImport,
    type InventorySettingsPreset,
    CONSERVATIVE_PRESET,
    AGGRESSIVE_PRESET
} from '@/types/inventory/settings';

// Define the state interface for the store
interface InventorySettingsStoreState {
    settings: InventorySettings | null;
    settingsList: InventorySettings[];
    settingsHistory: InventorySettingsHistory[];
    settingsSummary: InventorySettingsSummary | null;
    loading: boolean;
    error: string | null;
    validationResult: InventorySettingsValidation | null;
    presets: InventorySettingsPreset[];
}

export const useInventorySettingsStore = defineStore('inventorySettings', {
    state: (): InventorySettingsStoreState => ({
        settings: null,
        settingsList: [],
        settingsHistory: [],
        settingsSummary: null,
        loading: false,
        error: null,
        validationResult: null,
        presets: [CONSERVATIVE_PRESET, AGGRESSIVE_PRESET]
    }),

    getters: {
        getSettings: (state) => state.settings,
        getSettingsList: (state) => state.settingsList,
        getSettingsHistory: (state) => state.settingsHistory,
        getSettingsSummary: (state) => state.settingsSummary,
        getIsLoading: (state) => state.loading,
        getError: (state) => state.error,
        getValidationResult: (state) => state.validationResult,
        getPresets: (state) => state.presets,
        getActiveSettings: (state) => {
            return state.settingsList.find(s => s.isActive) || state.settings;
        },
        getHasSettings: (state) => {
            return state.settings !== null || state.settingsList.length > 0;
        },
        getSettingsCount: (state) => state.settingsList.length,
        getValidationErrors: (state) => state.validationResult?.errors || [],
        getValidationWarnings: (state) => state.validationResult?.warnings || [],
        getIsValidConfiguration: (state) => state.validationResult?.isValid ?? true,
    },
    actions: {

        fetchActiveSettings() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.getActiveSettings()
                    .then((response: any) => {

                        const decryptedData = response.data;
                        this.settings = decryptedData;
                        console.log('Active settings fetched:', decryptedData);
                        this.loading = false;
                        resolve(decryptedData);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching active settings.';
                        reject(error);
                    });
            });
        },

        fetchSettingsById(id: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.getSettingsById(id)
                    .then((response: InventorySettings) => {
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching settings.';
                        reject(error);
                    });
            });
        }, fetchAllSettings() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.getAllSettings()
                    .then((response: InventorySettings[]) => {
                        this.settingsList = response;
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching all settings.';
                        reject(error);
                    });
            });
        },

        fetchSettingsHistory(params?: InventorySettingsQueryParams) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.getSettingsHistory(params)
                    .then((response: InventorySettingsHistory[]) => {
                        this.settingsHistory = response;
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching settings history.';
                        reject(error);
                    });
            });
        },

        createSettings(settingsData: CreateInventorySettingsRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.createSettings(settingsData)
                    .then((response: InventorySettings) => {
                        this.settingsList.push(response);
                        if (response.isActive) {
                            this.settings = response;
                        }
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while creating settings.';
                        reject(error);
                    });
            });
        }, updateSettings(id: number, settingsData: UpdateInventorySettingsRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.updateSettings(id, settingsData)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const decryptedData = response.data;
                        const index = this.settingsList.findIndex(s => s.id === id);
                        if (index !== -1) {
                            this.settingsList[index] = decryptedData;
                        }
                        if (decryptedData.isActive) {
                            this.settings = decryptedData;
                        }
                        this.loading = false;
                        resolve(decryptedData);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while updating settings.';
                        reject(error);
                    });
            });
        }, initializeSettings() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.initializeSettings()
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const decryptedData = response.data;
                        this.settings = decryptedData;
                        this.settingsList.push(decryptedData);
                        this.loading = false;
                        resolve(decryptedData);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while initializing settings.';
                        reject(error);
                    });
            });
        },

        resetSettings() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.resetSettings()
                    .then((response: InventorySettings) => {
                        this.settings = response;
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while resetting settings.';
                        reject(error);
                    });
            });
        },

        validateSettings(settingsData: CreateInventorySettingsRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.validateSettings(settingsData)
                    .then((response: InventorySettingsValidation) => {
                        this.validationResult = response;
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while validating settings.';
                        reject(error);
                    });
            });
        }, exportSettings() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.exportSettings()
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const decryptedData = response.data;
                        this.loading = false;
                        resolve(decryptedData);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while exporting settings.';
                        reject(error);
                    });
            });
        },

        importSettings(importData: InventorySettingsImport) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.importSettings(importData)
                    .then((response: InventorySettings) => {
                        // Refresh settings after import
                        this.fetchAllSettings();
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while importing settings.';
                        reject(error);
                    });
            });
        }, fetchSettingsSummary() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.getSettingsSummary()
                    .then((response: InventorySettingsSummary) => {
                        this.settingsSummary = response;
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching settings summary.';
                        reject(error);
                    });
            });
        },

        deleteSettings(id: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.deleteSettings(id)
                    .then(() => {
                        this.settingsList = this.settingsList.filter(s => s.id !== id);
                        if (this.settings?.id === id) {
                            this.settings = null;
                        }
                        this.loading = false;
                        resolve(true);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while deleting settings.';
                        reject(error);
                    });
            });
        },

        activateSettings(id: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.activateSettings(id)
                    .then((response: InventorySettings) => {
                        // Update local state - deactivate others and activate this one
                        this.settingsList = this.settingsList.map(s => ({
                            ...s,
                            isActive: s.id === id
                        }));
                        this.settings = response;
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while activating settings.';
                        reject(error);
                    });
            });
        },

        deactivateSettings(id: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.deactivateSettings(id)
                    .then((response: InventorySettings) => {
                        const index = this.settingsList.findIndex(s => s.id === id);
                        if (index !== -1) {
                            this.settingsList[index] = response;
                        }
                        if (this.settings?.id === id) {
                            this.settings = response;
                        }
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while deactivating settings.';
                        reject(error);
                    });
            });
        },

        cloneSettings(id: number, name?: string) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.cloneSettings(id, name)
                    .then((response: InventorySettings) => {
                        this.settingsList.push(response);
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while cloning settings.';
                        reject(error);
                    });
            });
        },

        bulkUpdateSettings(updates: Array<{ id: number; settings: Partial<UpdateInventorySettingsRequest> }>) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.bulkUpdateSettings(updates)
                    .then((response: InventorySettings[]) => {
                        // Update settings in the state
                        response.forEach(updatedSettings => {
                            const index = this.settingsList.findIndex(s => s.id === updatedSettings.id);
                            if (index !== -1) {
                                this.settingsList[index] = updatedSettings;
                            }
                        });
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while bulk updating settings.';
                        reject(error);
                    });
            });
        },

        compareSettings(settingsId1: number, settingsId2: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.compareSettings(settingsId1, settingsId2)
                    .then((response: { differences: Record<string, { old: any; new: any }> }) => {
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while comparing settings.';
                        reject(error);
                    });
            });
        },

        testSettings(settingsData: CreateInventorySettingsRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.testSettings(settingsData)
                    .then((response: { isValid: boolean; warnings: string[]; errors: string[] }) => {
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while testing settings.';
                        reject(error);
                    });
            });
        }, fetchDefaultSettings() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.getDefaultSettings()
                    .then((response: CreateInventorySettingsRequest) => {
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching default settings.';
                        reject(error);
                    });
            });
        },

        saveAsTemplate(id: number, templateName: string, description?: string) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.saveAsTemplate(id, templateName, description)
                    .then(() => {
                        this.loading = false;
                        resolve(true);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while saving as template.';
                        reject(error);
                    });
            });
        },

        applyTemplate(templateId: string) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.applyTemplate(templateId)
                    .then((response: InventorySettings) => {
                        this.settingsList.push(response);
                        if (response.isActive) {
                            this.settings = response;
                        }
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while applying template.';
                        reject(error);
                    });
            });
        },

        fetchAuditTrail(settingsId: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.getAuditTrail(settingsId)
                    .then((response: InventorySettingsHistory[]) => {
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching audit trail.';
                        reject(error);
                    });
            });
        },

        rollbackSettings(settingsId: number, targetVersion: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.rollbackSettings(settingsId, targetVersion)
                    .then((response: InventorySettings) => {
                        const index = this.settingsList.findIndex(s => s.id === settingsId);
                        if (index !== -1) {
                            this.settingsList[index] = response;
                        }
                        if (response.isActive) {
                            this.settings = response;
                        }
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while rolling back settings.';
                        reject(error);
                    });
            });
        },

        previewChanges(id: number, changes: Partial<UpdateInventorySettingsRequest>) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.previewChanges(id, changes)
                    .then((response: { preview: InventorySettings; impact: string[] }) => {
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while previewing changes.';
                        reject(error);
                    });
            });
        },

        scheduleUpdate(id: number, settings: UpdateInventorySettingsRequest, scheduledAt: string) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.scheduleUpdate(id, settings, scheduledAt)
                    .then(() => {
                        this.loading = false;
                        resolve(true);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while scheduling update.';
                        reject(error);
                    });
            });
        }, fetchScheduledUpdates() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.getScheduledUpdates()
                    .then((response: Array<{ id: number; settings: UpdateInventorySettingsRequest; scheduledAt: string; status: string }>) => {
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching scheduled updates.';
                        reject(error);
                    });
            });
        },

        cancelScheduledUpdate(scheduleId: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                inventorySettingsApi.cancelScheduledUpdate(scheduleId)
                    .then(() => {
                        this.loading = false;
                        resolve(true);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while canceling scheduled update.';
                        reject(error);
                    });
            });
        },

        // Utility actions
        applyPreset(preset: InventorySettingsPreset) {
            return this.createSettings(preset.settings);
        },

        refreshActiveSettings() {
            return this.fetchActiveSettings();
        },

        refreshAllData() {
            return Promise.all([this.fetchActiveSettings(),
            this.fetchAllSettings(),
            this.fetchSettingsSummary()
            ]);
        },

        clearValidation() {
            this.validationResult = null;
        },

        clearError() {
            this.error = null;
        },

        resetStore() {
            this.settings = null;
            this.settingsList = [];
            this.settingsHistory = [];
            this.settingsSummary = null;
            this.validationResult = null;
            this.error = null;
            this.loading = false;
        },

        // Initialize store
        initialize() {
            return this.refreshAllData().catch((error) => {
                console.error('Failed to initialize inventory settings store:', error);
            });
        }
    },
});
