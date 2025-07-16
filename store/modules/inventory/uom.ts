import { defineStore } from 'pinia';
import uomApi from '@/http/requests/app/inventory/uom';
import {
    type UnitOfMeasure,
    type CreateUnitOfMeasureRequest,
    type UpdateUnitOfMeasureRequest,
    type UnitSearchParams,
    type UnitConversionParams,
    type BulkConversionParams,
    type UnitFamily,
    type UnitStatistics,
    type ConversionResult,
    type BulkConversionResult,
    type PaginatedResponse,
    type UnitFilterOptions,
    UnitCategory,
    CommonUnitCodes
} from '@/types/inventory/uom';

// Define the state interface for the store
interface UomStoreState {
    units: UnitOfMeasure[];
    unitsList: UnitOfMeasure[];
    currentUnit: UnitOfMeasure | null;
    baseUnits: UnitOfMeasure[];
    categories: string[];
    unitFamily: UnitFamily | null;
    unitHierarchy: Array<{
        baseUnit: UnitOfMeasure;
        children: Array<{
            unit: UnitOfMeasure;
            cumulativeConversionFactor: number;
        }>;
    }> | null;
    statistics: UnitStatistics | null;
    conversionHistory: ConversionResult[];
    loading: boolean;
    error: string | null;
    validationResult: {
        isValid: boolean;
        warnings: string[];
        errors: string[];
    } | null;
    pagination: {
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
    filters: UnitFilterOptions;
    searchTerm: string;
    mostUsedUnits: UnitOfMeasure[];
}

export const useUomStore = defineStore('uom', {
    state: (): UomStoreState => ({
        units: [],
        unitsList: [],
        currentUnit: null,
        baseUnits: [],
        categories: Object.values(UnitCategory),
        unitFamily: null,
        unitHierarchy: null,
        statistics: null,
        conversionHistory: [],
        loading: false,
        error: null,
        validationResult: null,
        pagination: {
            page: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0
        },
        filters: {
            categories: [],
            baseUnitsOnly: false,
            activeOnly: true,
            searchTerm: ''
        },
        searchTerm: '',
        mostUsedUnits: []
    }),

    getters: {
        getUnits: (state) => state.units,
        getUnitsList: (state) => state.unitsList,
        getCurrentUnit: (state) => state.currentUnit,
        getBaseUnits: (state) => state.baseUnits,
        getCategories: (state) => state.categories,
        getUnitFamily: (state) => state.unitFamily,
        getUnitHierarchy: (state) => state.unitHierarchy,
        getStatistics: (state) => state.statistics,
        getConversionHistory: (state) => state.conversionHistory,
        getIsLoading: (state) => state.loading,
        getError: (state) => state.error,
        getValidationResult: (state) => state.validationResult,
        getPagination: (state) => state.pagination,
        getFilters: (state) => state.filters,
        getSearchTerm: (state) => state.searchTerm,
        getMostUsedUnits: (state) => state.mostUsedUnits,
        getActiveUnits: (state) => {
            return state.unitsList.filter(u => u.isActive);
        },
        getHasUnits: (state) => {
            return state.units.length > 0 || state.unitsList.length > 0;
        },
        getUnitsCount: (state) => state.unitsList.length,
        getValidationErrors: (state) => state.validationResult?.errors || [],
        getValidationWarnings: (state) => state.validationResult?.warnings || [],
        getIsValidConfiguration: (state) => state.validationResult?.isValid ?? true,
        getUnitById: (state) => (id: number) => 
            state.unitsList.find(unit => unit.id === id),
        getUnitByCode: (state) => (code: string) => 
            state.unitsList.find(unit => unit.code === code),
        getUnitsByCategory: (state) => (category: string) => 
            state.unitsList.filter(unit => unit.category === category),
    },

    actions: {
        fetchUnits() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.getAllUnits()
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const decryptedData = response.data;
                        this.unitsList = decryptedData;
                        console.log('Units fetched:', decryptedData);
                        this.loading = false;
                        resolve(decryptedData);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching units.';
                        reject(error);
                    });
            });
        },

        fetchUnitsPaginated(params?: { page?: number; size?: number }) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.getUnitsPaginated(params)
                    .then((response: PaginatedResponse<UnitOfMeasure>) => {
                        this.unitsList = response.content;
                        this.pagination = {
                            page: response.number,
                            size: response.size,
                            totalElements: response.totalElements,
                            totalPages: response.totalPages
                        };
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching paginated units.';
                        reject(error);
                    });
            });
        },

        fetchUnitById(id: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.getUnitById(id)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const decryptedData = response.data;
                        this.currentUnit = decryptedData;
                        this.loading = false;
                        resolve(decryptedData);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching unit.';
                        reject(error);
                    });
            });
        },

        fetchUnitByCode(code: string) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.getUnitByCode(code)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const decryptedData = response.data;
                        this.currentUnit = decryptedData;
                        this.loading = false;
                        resolve(decryptedData);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching unit by code.';
                        reject(error);
                    });
            });
        },

        fetchBaseUnits() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.getBaseUnits()
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const decryptedData = response.data;
                        this.baseUnits = decryptedData;
                        this.loading = false;
                        resolve(decryptedData);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching base units.';
                        reject(error);
                    });
            });
        },

        fetchUnitsByCategory(category: string) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.getUnitsByCategory(category)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const decryptedData = response.data;
                        this.loading = false;
                        resolve(decryptedData);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching units by category.';
                        reject(error);
                    });
            });
        },

        fetchUnitFamily(baseUnitId: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.getUnitFamily(baseUnitId)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const decryptedData = response.data;
                        this.unitFamily = decryptedData;
                        this.loading = false;
                        resolve(decryptedData);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching unit family.';
                        reject(error);
                    });
            });
        },

        fetchUOMHierarchy() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.getUOMHierarchy()
                    .then((response: any) => {
                        // Handle the response structure
                        let hierarchyData;
                        if (response?.data?.data) {
                            hierarchyData = response.data.data;
                        } else if (response?.data) {
                            hierarchyData = response.data;
                        } else {
                            hierarchyData = response;
                        }

                        console.log('UOM hierarchy raw response:', hierarchyData);

                        // Transform the UOM hierarchy to match expected structure
                        const transformedHierarchy = hierarchyData.map((item: any) => {
                            const baseUnit = this.normalizeUnit(item.baseUnit);
                            const children = item.children?.map((child: any) => 
                                this.normalizeUnit(child.unit)
                            ) || [];
                            
                            return {
                                ...baseUnit,
                                children: children,
                                hasChildren: children.length > 0
                            };
                        });

                        console.log('UOM hierarchy transformed:', transformedHierarchy);
                        this.unitHierarchy = transformedHierarchy;
                        this.loading = false;
                        resolve(transformedHierarchy);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching UOM hierarchy.';
                        reject(error);
                    });
            });
        },

        fetchStatistics() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.getStatistics()
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const decryptedData = response.data;
                        this.statistics = decryptedData;
                        this.loading = false;
                        resolve(decryptedData);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching statistics.';
                        reject(error);
                    });
            });
        },        
        
        createUnit(unitData: CreateUnitOfMeasureRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                // Determine which endpoint to use based on unit type
                let apiCall;
                console.log('Creating unit with data:', unitData);
                if (unitData.baseUnit) {
                    apiCall = uomApi.createBaseUnit(unitData);
                } else {
                    apiCall = uomApi.createConversionUnit(unitData);
                }

                apiCall
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const unitId = response.data;
                        this.loading = false;
                        resolve(unitId);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while creating unit.';
                        reject(error);
                    });
            });
        },

        createBaseUnit(unitData: CreateUnitOfMeasureRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.createBaseUnit(unitData)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const unitId = response.data;
                        this.loading = false;
                        resolve(unitId);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while creating base unit.';
                        reject(error);
                    });
            });
        },

        createConversionUnit(unitData: CreateUnitOfMeasureRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.createConversionUnit(unitData)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const unitId = response.data;
                        this.loading = false;
                        resolve(unitId);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while creating conversion unit.';
                        reject(error);
                    });
            });
        },

        updateUnit(id: number, unitData: UpdateUnitOfMeasureRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                 console.log('Updating unit with ID:', id, 'Data:', unitData);
                uomApi.updateUnit(id, unitData)               
                    .then((response: any) => {
                       
                        const decryptedData = response.data;
                        const index = this.unitsList.findIndex(u => u.id === id);
                        if (index !== -1) {
                            this.unitsList[index] = decryptedData;
                        }
                        if (this.currentUnit?.id === id) {
                            this.currentUnit = decryptedData;
                        }
                        this.loading = false;
                        resolve(decryptedData);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while updating unit.';
                        reject(error);
                    });
            });
        },

        deleteUnit(id: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.deleteUnit(id)
                    .then(() => {
                        this.unitsList = this.unitsList.filter(u => u.id !== id);
                        if (this.currentUnit?.id === id) {
                            this.currentUnit = null;
                        }
                        this.loading = false;
                        resolve(true);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while deleting unit.';
                        reject(error);
                    });
            });
        },

        searchUnits(searchTerm: string) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.searchUnits(searchTerm)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const decryptedData = response.data;
                        this.searchTerm = searchTerm;
                        this.loading = false;
                        resolve(decryptedData);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while searching units.';
                        reject(error);
                    });
            });
        },

        convertQuantity(params: UnitConversionParams) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.convertQuantity(params)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const convertedQuantity = response.data;
                        
                        // Add to conversion history
                        const conversionResult: ConversionResult = {
                            convertedQuantity,
                            fromUnit: this.getUnitById(params.fromUnitId!) || {} as any,
                            toUnit: this.getUnitById(params.toUnitId!) || {} as any,
                            originalQuantity: params.quantity
                        };
                        this.conversionHistory.unshift(conversionResult);
                        
                        // Keep only last 50 conversions
                        if (this.conversionHistory.length > 50) {
                            this.conversionHistory = this.conversionHistory.slice(0, 50);
                        }
                        
                        this.loading = false;
                        resolve(convertedQuantity);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while converting quantity.';
                        reject(error);
                    });
            });
        },

        convertQuantityByCode(params: UnitConversionParams) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.convertQuantityByCode(params)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const convertedQuantity = response.data;
                        this.loading = false;
                        resolve(convertedQuantity);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while converting quantity by code.';
                        reject(error);
                    });
            });
        },

        bulkConvert(params: BulkConversionParams) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.bulkConvert(params)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const conversions = response.data;
                        this.loading = false;
                        resolve(conversions);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while performing bulk conversion.';
                        reject(error);
                    });
            });
        },

        checkCompatibility(fromUnitId: number, toUnitId: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.checkCompatibility(fromUnitId, toUnitId)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const isCompatible = response.data;
                        this.loading = false;
                        resolve(isCompatible);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while checking compatibility.';
                        reject(error);
                    });
            });
        },        
        
        bulkCreateUnits(units: CreateUnitOfMeasureRequest[]) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                // Separate base units and conversion units
                const baseUnits = units.filter(unit => unit.baseUnit);
                const conversionUnits = units.filter(unit => !unit.baseUnit);
                
                // Create all units using the appropriate endpoints
                const createPromises = [];
                
                if (baseUnits.length > 0) {
                    createPromises.push(...baseUnits.map(unit => uomApi.createBaseUnit(unit)));
                }
                
                if (conversionUnits.length > 0) {
                    createPromises.push(...conversionUnits.map(unit => uomApi.createConversionUnit(unit)));
                }
                
                Promise.all(createPromises)
                    .then((responses: any[]) => {
                        const createdIds = responses.map(response => response.data);
                        
                        // Refresh units list
                        this.fetchUnits();
                        
                        this.loading = false;
                        resolve(createdIds);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while bulk creating units.';
                        reject(error);
                    });
            });
        },

        bulkUpdateUnits(updates: Array<{ id: number; unit: UpdateUnitOfMeasureRequest }>) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.bulkUpdateUnits(updates)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const updatedUnits = response.data;
                        
                        // Update units in state
                        updatedUnits.forEach((updatedUnit: UnitOfMeasure) => {
                            const index = this.unitsList.findIndex(u => u.id === updatedUnit.id);
                            if (index !== -1) {
                                this.unitsList[index] = updatedUnit;
                            }
                        });
                        
                        this.loading = false;
                        resolve(updatedUnits);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while bulk updating units.';
                        reject(error);
                    });
            });
        },

        bulkDeleteUnits(ids: number[]) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.bulkDeleteUnits(ids)
                    .then(() => {
                        this.unitsList = this.unitsList.filter(u => !ids.includes(u.id));
                        
                        if (this.currentUnit && ids.includes(this.currentUnit.id)) {
                            this.currentUnit = null;
                        }
                        
                        this.loading = false;
                        resolve(true);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while bulk deleting units.';
                        reject(error);
                    });
            });
        },

        activateUnit(id: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.activateUnit(id)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const activatedUnit = response.data;
                        
                        const index = this.unitsList.findIndex(u => u.id === id);
                        if (index !== -1) {
                            this.unitsList[index] = activatedUnit;
                        }
                        
                        this.loading = false;
                        resolve(activatedUnit);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while activating unit.';
                        reject(error);
                    });
            });
        },

        deactivateUnit(id: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.deactivateUnit(id)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const deactivatedUnit = response.data;
                        
                        const index = this.unitsList.findIndex(u => u.id === id);
                        if (index !== -1) {
                            this.unitsList[index] = deactivatedUnit;
                        }
                        
                        this.loading = false;
                        resolve(deactivatedUnit);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while deactivating unit.';
                        reject(error);
                    });
            });
        },

        validateUnit(unitData: CreateUnitOfMeasureRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.validateUnit(unitData)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const validationResult = response.data;
                        this.validationResult = validationResult;
                        this.loading = false;
                        resolve(validationResult);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while validating unit.';
                        reject(error);
                    });
            });
        },

        cloneUnit(id: number, newCode: string, newName?: string) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.cloneUnit(id, newCode, newName)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const clonedUnit = response.data;
                        this.unitsList.push(clonedUnit);
                        this.loading = false;
                        resolve(clonedUnit);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while cloning unit.';
                        reject(error);
                    });
            });
        },

        fetchMostUsedUnits(limit?: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.getMostUsedUnits(limit)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const mostUsedUnits = response.data;
                        this.mostUsedUnits = mostUsedUnits;
                        this.loading = false;
                        resolve(mostUsedUnits);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching most used units.';
                        reject(error);
                    });
            });
        },

        exportUnits(format: 'json' | 'csv' | 'excel' = 'json') {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.exportUnits(format)
                    .then((response: any) => {
                        // For file downloads, response might be a blob
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while exporting units.';
                        reject(error);
                    });
            });
        },

        importUnits(file: File, format: 'json' | 'csv' | 'excel' = 'json') {
            this.loading = true;
            return new Promise((resolve, reject) => {
                uomApi.importUnits(file, format)
                    .then((response: any) => {
                        // The axios interceptor already decrypts the data, so we use response.data
                        const importResult = response.data;
                        
                        // Refresh units after import
                        this.fetchUnits();
                        
                        this.loading = false;
                        resolve(importResult);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while importing units.';
                        reject(error);
                    });
            });
        },

        // Utility actions
        setFilters(filters: Partial<UnitFilterOptions>) {
            this.filters = { ...this.filters, ...filters };
        },

        clearFilters() {
            this.filters = {
                categories: [],
                baseUnitsOnly: false,
                activeOnly: true,
                searchTerm: ''
            };
        },

        clearError() {
            this.error = null;
        },

        clearValidation() {
            this.validationResult = null;
        },

        clearCurrentUnit() {
            this.currentUnit = null;
        },

        clearConversionHistory() {
            this.conversionHistory = [];
        },

        resetStore() {
            this.units = [];
            this.unitsList = [];
            this.currentUnit = null;
            this.baseUnits = [];
            this.unitFamily = null;
            this.unitHierarchy = null;
            this.statistics = null;
            this.conversionHistory = [];
            this.error = null;
            this.validationResult = null;
            this.loading = false;
            this.pagination = {
                page: 0,
                size: 10,
                totalElements: 0,
                totalPages: 0
            };
            this.clearFilters();
            this.searchTerm = '';
            this.mostUsedUnits = [];
        },

        // Refresh operations
        refreshUnits() {
            return this.fetchUnits();
        },

        refreshBaseUnits() {
            return this.fetchBaseUnits();
        },

        refreshStatistics() {
            return this.fetchStatistics();
        },

        refreshAllData() {
            return Promise.all([
                this.fetchUnits(),
                this.fetchBaseUnits(),
                this.fetchUOMHierarchy(),
                this.fetchStatistics(),
                this.fetchMostUsedUnits()
            ]);
        },

        // Helper methods
        normalizeUnit(item: any): UnitOfMeasure {
            return {
                id: item.id,
                code: item.code || '',
                name: item.name || item.unitName || '',
                description: item.description || null,
                category: item.category || 'OTHER',
                baseUnit: item.baseUnit !== undefined ? item.baseUnit : item.isBaseUnit !== undefined ? item.isBaseUnit : item.is_base_unit !== undefined ? item.is_base_unit : false,
                baseUnitOfMeasure: item.baseUnitOfMeasure || item.baseUnit || null,
                conversionFactor: item.conversionFactor || item.conversion_factor || 1,
                isActive: item.isActive !== undefined ? item.isActive : item.is_active !== undefined ? item.is_active : true,
                created: item.created || item.createdAt || new Date().toISOString(),
                updated: item.updated || item.updatedAt || new Date().toISOString(),
                createdBy: item.createdBy || null,
                updatedBy: item.updatedBy || null
            };
        },

        // Initialize store
        initialize() {
            return this.refreshAllData().catch((error) => {
                console.error('Failed to initialize UOM store:', error);
            });
        }
    },
});
