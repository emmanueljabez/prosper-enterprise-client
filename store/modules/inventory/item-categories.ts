import { defineStore } from 'pinia';
import itemCategoriesApi from '@/http/requests/app/inventory/item-categories';
import {
    type ItemCategory,
    type CreateItemCategoryRequest,
    type UpdateItemCategoryRequest,
    type ItemCategoryFilters,
    type ItemCategoryWithHierarchy,
    type CategorySearchResult,
    type CategoryStatistics,
    type CategoryImportDTO,
    type CategoryExportOptions,
    type CategoryBulkUpdateDTO,
    type CategoryBulkDeleteDTO,
    type GetCategoriesRequest,
    type SearchCategoriesRequest,
    type GetHierarchyRequest,
    type PaginatedResponse,
    type ApiResponse,
    type ItemCategoriesStoreState
} from '@/types/inventory/item-categories';

export const useItemCategoriesStore = defineStore('itemCategories', {
    state: (): ItemCategoriesStoreState => ({
        categories: [],
        paginatedCategories: null,
        selectedCategory: null,
        hierarchy: [],
        searchResults: [],
        statistics: null,
        loading: false,
        error: null,
        filters: {},
        validationResult: null,
        pagination: {
            page: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0
        }
    }),

    getters: {
        getCategories: (state) => state.categories,
        getPaginatedCategories: (state) => state.paginatedCategories,
        getSelectedCategory: (state) => state.selectedCategory,
        getHierarchy: (state) => state.hierarchy,
        getCategoryHierarchy: (state) => state.hierarchy,
        getSearchResults: (state) => state.searchResults,
        getStatistics: (state) => state.statistics,
        getIsLoading: (state) => state.loading,
        getError: (state) => state.error,
        getFilters: (state) => state.filters,
        getValidationResult: (state) => state.validationResult,
        getPagination: (state) => state.pagination,
        getTopLevelCategories: (state) => {
            return state.categories.filter(category => !category.parentCategoryId);
        },
        getActiveCategories: (state) => {
            return state.categories.filter(category => category.isActive);
        },
        getInactiveCategories: (state) => {
            return state.categories.filter(category => !category.isActive);
        },
        getCategoriesCount: (state) => state.categories.length,
        getActiveCategoriesCount: (state) => {
            return state.categories.filter(category => category.isActive).length;
        },
        getHasCategories: (state) => {
            return state.categories.length > 0;
        },
        getHasError: (state) => state.error !== null,
        getCategoryById: (state) => (id: number) => {
            return state.categories.find(category => category.id === id);
        },
        getCategoryByCode: (state) => (code: string) => {
            return state.categories.find(category => category.code === code);
        },
        getSubcategories: (state) => (parentId: number) => {
            return state.categories.filter(category => category.parentCategoryId === parentId);
        },
        getValidationErrors: (state) => state.validationResult?.errors || [],
        getValidationWarnings: (state) => state.validationResult?.warnings || [],
        getIsValidConfiguration: (state) => state.validationResult?.isValid ?? true,
    },

    actions: {
        fetchPaginatedCategories(params?: GetCategoriesRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.getPaginatedCategories(params)
                    .then((response: ApiResponse<PaginatedResponse<ItemCategory>>) => {
                        this.paginatedCategories = response.data!;
                        // Update the flat categories array for UI components that expect it
                        this.categories = response.data!.content.map(item => this.normalizeCategory(item));
                        // Populate parent relationships
                        this.populateParentRelationships();
                        // Update pagination info
                        this.pagination = {
                            page: response.data!.number,
                            size: response.data!.size,
                            totalElements: response.data!.totalElements,
                            totalPages: response.data!.totalPages
                        };
                        console.log('Fetched paginated categories:', this.paginatedCategories);
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching categories.';
                        reject(error);
                    });
            });
        },

        fetchAllCategories() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.getAllCategories()
                    .then((response: ApiResponse<ItemCategory[]>) => {
                        this.categories = response.data!.map(item => this.normalizeCategory(item));
                        // Populate parent relationships
                        this.populateParentRelationships();
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching all categories.';
                        reject(error);
                    });
            });
        },

        fetchCategoryById(id: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.getCategoryById(id)
                    .then((response: ApiResponse<ItemCategory>) => {
                        const normalizedCategory = this.normalizeCategory(response.data!);
                        
                        if (normalizedCategory.parentCategoryId) {
                            const parentCategory = this.categories.find(cat => cat.id === normalizedCategory.parentCategoryId);
                            if (parentCategory) {
                                normalizedCategory.parentCategory = parentCategory;
                            }
                        }
                        
                        this.selectedCategory = normalizedCategory;
                        
                        const existingIndex = this.categories.findIndex(cat => cat.id === id);
                        if (existingIndex !== -1) {
                            this.categories[existingIndex] = normalizedCategory;
                        } else {

                            this.categories.push(normalizedCategory);
                        }
                        
                        this.loading = false;
                        resolve(normalizedCategory);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching category.';
                        reject(error);
                    });
            });
        },

        fetchCategoryByCode(categoryCode: string) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.getCategoryByCode(categoryCode)
                    .then((response: ApiResponse<ItemCategory>) => {
                        this.selectedCategory = response.data!;
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching category by code.';
                        reject(error);
                    });
            });
        },

        searchCategories(request: SearchCategoriesRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.searchCategories(request)
                    .then((response: ApiResponse<CategorySearchResult[]>) => {
                        this.searchResults = response.data!;
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while searching categories.';
                        reject(error);
                    });
            });
        },

        fetchSubcategories(parentId: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.getSubcategories(parentId)
                    .then((response: ApiResponse<ItemCategory[]>) => {
                        // Normalize the backend response to match our interface
                        const normalizedCategories = response.data!.map(item => {
                            const normalized = this.normalizeCategory(item);
                            const { parentCategory, subCategories, level, hasChildren, fullPath, ...categoryItem } = normalized;
                            return categoryItem;
                        });
                        
                        // Integrate subcategories into existing categories array if not already present
                        normalizedCategories.forEach(subcat => {
                            const existingIndex = this.categories.findIndex(c => c.id === subcat.id);
                            if (existingIndex === -1) {
                                this.categories.push(subcat);
                            }
                        });
                        
                        // Rebuild the hierarchy from the updated flat categories array
                        if (this.categories.length > 0) {
                            const hierarchyItems = this.categories.map(cat => this.normalizeCategory(cat));
                            this.hierarchy = this.buildHierarchyFromFlat(hierarchyItems);
                        }
                        
                        this.loading = false;
                        resolve(normalizedCategories);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching subcategories.';
                        reject(error);
                    });
            });
        },

        fetchTopLevelCategories() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.getTopLevelCategories()
                    .then((response: ApiResponse<ItemCategory[]>) => {
                        const normalizedCategories = response.data!.map(item => {
                            const normalized = this.normalizeCategory(item);
                            const { parentCategory, subCategories, level, hasChildren, fullPath, ...categoryItem } = normalized;
                            return categoryItem;
                        });

                        if (this.categories.length === 0) {
                            this.categories = normalizedCategories;
                        }
                        this.loading = false;
                        resolve(normalizedCategories);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching top-level categories.';
                        reject(error);
                    });
            });
        },

        fetchCategoryHierarchy(request?: GetHierarchyRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.getCategoryHierarchy(request)
                    .then((response: any) => {
                        // Handle the new hierarchy format
                        let hierarchyData;
                        if (response?.data?.data) {
                            hierarchyData = response.data.data;
                        } else if (response?.data) {
                            hierarchyData = response.data;
                        } else {
                            hierarchyData = response;
                        }

                        // Transform the new format to the expected structure
                        const transformedHierarchy = hierarchyData.map((item: any) => {
                            const rootCategory = this.normalizeCategory(item.rootCategory);
                            const children = item.children?.map((child: any) => {
                                const childCategory = this.normalizeCategory(child.category);
                                // Set the children as subCategories to match the expected structure
                                return {
                                    ...childCategory,
                                    subCategories: [], // Initialize empty subCategories for children
                                    hasChildren: false
                                };
                            }) || [];
                            
                            return {
                                ...rootCategory,
                                subCategories: children,
                                hasChildren: children.length > 0
                            };
                        });

                        console.log('Transformed hierarchy:', transformedHierarchy);
                        this.hierarchy = transformedHierarchy;

                        // Extract flat categories for easier searching
                        const flatCategories: ItemCategory[] = [];
                        this.extractFlatCategories(transformedHierarchy, flatCategories);
                        if (flatCategories.length > 0) {
                            this.categories = flatCategories;
                        }
                        
                        this.loading = false;
                        resolve(transformedHierarchy);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching category hierarchy.';
                        reject(error);
                    });
            });
        },

        createCategory(categoryData: CreateItemCategoryRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.createCategory(categoryData)
                    .then((response: ApiResponse<ItemCategory>) => {
                        const newCategory = response.data!;
                        
                        // Normalize the new category and populate parent relationship
                        const normalizedCategory = this.normalizeCategory(newCategory);
                        
                        // If it has a parent, find and populate the parent category object
                        if (normalizedCategory.parentCategoryId) {
                            const parentCategory = this.categories.find(cat => cat.id === normalizedCategory.parentCategoryId);
                            if (parentCategory) {
                                normalizedCategory.parentCategory = parentCategory;
                            }
                        }
                        
                        this.categories.push(normalizedCategory);
                        this.loading = false;
                        resolve(normalizedCategory);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while creating category.';
                        reject(error);
                    });
            });
        },

        updateCategory(id: number, categoryData: UpdateItemCategoryRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.updateCategory(id, categoryData)
                    .then((response: ApiResponse<ItemCategory>) => {
                        const index = this.categories.findIndex(c => c.id === id);
                        if (index !== -1) {
                            this.categories[index] = response.data!;
                        }
                        if (this.selectedCategory?.id === id) {
                            this.selectedCategory = response.data!;
                        }
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while updating category.';
                        reject(error);
                    });
            });
        },

        deleteCategory(id: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.deleteCategory(id)
                    .then(() => {
                        this.categories = this.categories.filter(c => c.id !== id);
                        if (this.selectedCategory?.id === id) {
                            this.selectedCategory = null;
                        }
                        this.loading = false;
                        resolve(true);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while deleting category.';
                        reject(error);
                    });
            });
        },

        bulkUpdateCategories(data: CategoryBulkUpdateDTO) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.bulkUpdateCategories(data)
                    .then((response: ApiResponse<ItemCategory[]>) => {
                        // Update categories in the state
                        response.data!.forEach(updatedCategory => {
                            const index = this.categories.findIndex(c => c.id === updatedCategory.id);
                            if (index !== -1) {
                                this.categories[index] = updatedCategory;
                            }
                        });
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while bulk updating categories.';
                        reject(error);
                    });
            });
        },

        bulkDeleteCategories(data: CategoryBulkDeleteDTO) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.bulkDeleteCategories(data)
                    .then(() => {
                        this.categories = this.categories.filter(c => !data.categoryIds.includes(c.id));
                        if (this.selectedCategory && data.categoryIds.includes(this.selectedCategory.id)) {
                            this.selectedCategory = null;
                        }
                        this.loading = false;
                        resolve(true);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while bulk deleting categories.';
                        reject(error);
                    });
            });
        },

        fetchCategoryStatistics() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.getCategoryStatistics()
                    .then((response: ApiResponse<CategoryStatistics>) => {
                        this.statistics = response.data!;
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching category statistics.';
                        reject(error);
                    });
            });
        },

        importCategories(importData: CategoryImportDTO) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.importCategories(importData)
                    .then((response: ApiResponse<ItemCategory[]>) => {
                        // Refresh categories after import
                        this.fetchAllCategories();
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while importing categories.';
                        reject(error);
                    });
            });
        },

        exportCategories(options?: CategoryExportOptions) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.exportCategories(options)
                    .then((response: Blob) => {
                        this.loading = false;
                        resolve(response);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while exporting categories.';
                        reject(error);
                    });
            });
        },

        validateCategory(categoryData: CreateItemCategoryRequest) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.validateCategory(categoryData)
                    .then((response: ApiResponse<{ isValid: boolean; errors: string[]; warnings: string[] }>) => {
                        this.validationResult = response.data!;
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while validating category.';
                        reject(error);
                    });
            });
        },

        activateCategory(id: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.activateCategory(id)
                    .then((response: ApiResponse<ItemCategory>) => {
                        const index = this.categories.findIndex(c => c.id === id);
                        if (index !== -1) {
                            this.categories[index] = response.data!;
                        }
                        if (this.selectedCategory?.id === id) {
                            this.selectedCategory = response.data!;
                        }
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while activating category.';
                        reject(error);
                    });
            });
        },

        deactivateCategory(id: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.deactivateCategory(id)
                    .then((response: ApiResponse<ItemCategory>) => {
                        const index = this.categories.findIndex(c => c.id === id);
                        if (index !== -1) {
                            this.categories[index] = response.data!;
                        }
                        if (this.selectedCategory?.id === id) {
                            this.selectedCategory = response.data!;
                        }
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while deactivating category.';
                        reject(error);
                    });
            });
        },

        cloneCategory(id: number, newCode: string, newName?: string) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.cloneCategory(id, newCode, newName)
                    .then((response: ApiResponse<ItemCategory>) => {
                        this.categories.push(response.data!);
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while cloning category.';
                        reject(error);
                    });
            });
        },

        moveCategory(id: number, newParentId?: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.moveCategory(id, newParentId)
                    .then((response: ApiResponse<ItemCategory>) => {
                        const index = this.categories.findIndex(c => c.id === id);
                        if (index !== -1) {
                            this.categories[index] = response.data!;
                        }
                        if (this.selectedCategory?.id === id) {
                            this.selectedCategory = response.data!;
                        }
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while moving category.';
                        reject(error);
                    });
            });
        },

        getCategoryUsage(id: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.getCategoryUsage(id)
                    .then((response: ApiResponse<{ categoryId: number; itemCount: number; activeItemCount: number }>) => {
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching category usage.';
                        reject(error);
                    });
            });
        },

        getCategoryPath(id: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.getCategoryPath(id)
                    .then((response: ApiResponse<ItemCategory[]>) => {
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching category path.';
                        reject(error);
                    });
            });
        },

        checkCodeAvailability(code: string, excludeId?: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                itemCategoriesApi.checkCodeAvailability(code, excludeId)
                    .then((response: ApiResponse<{ available: boolean }>) => {
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while checking code availability.';
                        reject(error);
                    });
            });
        },

        fetchCategoryTree(categoryId: number) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                // Use the hierarchy endpoint with the specific category
                itemCategoriesApi.getCategoryHierarchy({ rootId: categoryId })
                    .then((response: any) => {
                        this.loading = false;
                        resolve(response.data);
                    })
                    .catch((error: any) => {
                        this.loading = false;
                        this.error = error.response?.data?.message || 'An error occurred while fetching category tree.';
                        reject(error);
                    });
            });
        },

        fetchStatistics() {
            return this.fetchCategoryStatistics();
        },

        // Helper method to populate parent category relationships
        populateParentRelationships() {
            (this.categories as ItemCategoryWithHierarchy[]).forEach(category => {
                if (category.parentCategoryId && !category.parentCategory) {
                    const parentCat = this.categories.find(cat => cat.id === category.parentCategoryId);
                    if (parentCat) {
                        category.parentCategory = parentCat;
                    }
                }
            });
        },

        // Helper methods for data normalization
        normalizeCategory(item: any): ItemCategoryWithHierarchy {
            const normalized = {
                id: item.id,
                code: item.code || '',
                name: item.name || item.categoryName,
                description: item.description || item.categoryDescription,
                parentCategoryId: item.parentCategoryId || item.parentCategory?.id,
                sortOrder: item.sortOrder || item.sort_order || 0,
                isActive: item.isActive !== undefined ? item.isActive : item.is_active !== undefined ? item.is_active : true,
                tenantId: item.tenantId || item.tenant_id || '',
                createdAt: item.createdAt || item.created || new Date().toISOString(),
                updatedAt: item.updatedAt || item.updated || new Date().toISOString(),
                createdBy: item.createdBy?.username || item.created_by,
                updatedBy: item.updatedBy?.username || item.updated_by,
                parentCategory: item.parentCategory,
                subCategories: [], // Will be populated by buildHierarchyFromFlat
                level: item.level || 0,
                hasChildren: item.hasChildren || false, // Will be determined by buildHierarchyFromFlat
                fullPath: item.fullPath || item.path || item.name || ''
            };

            // If we have a parentCategoryId but no parentCategory object, try to find it from existing categories
            if (normalized.parentCategoryId && !normalized.parentCategory) {
                const parentCat = this.categories.find(cat => cat.id === normalized.parentCategoryId);
                if (parentCat) {
                    normalized.parentCategory = parentCat;
                }
            }

            return normalized;
        },

        buildHierarchyFromFlat(flatItems: ItemCategoryWithHierarchy[]): ItemCategoryWithHierarchy[] {
            // Create a map for quick lookups
            const itemMap = new Map<number, ItemCategoryWithHierarchy>();
            const rootItems: ItemCategoryWithHierarchy[] = [];

            // First pass: create map and reset subCategories
            flatItems.forEach(item => {
                item.subCategories = [];
                item.hasChildren = false;
                itemMap.set(item.id, item);
            });

            // Second pass: build the hierarchy
            flatItems.forEach(item => {
                if (item.parentCategoryId) {
                    const parent = itemMap.get(item.parentCategoryId);
                    if (parent && parent.subCategories) {
                        parent.subCategories.push(item);
                        parent.hasChildren = true;
                        item.level = (parent.level || 0) + 1;
                    } else {
                        // Parent not found in current dataset, treat as root
                        rootItems.push(item);
                    }
                } else {
                    // This is a root category
                    rootItems.push(item);
                }
            });

            // Third pass: update full paths
            const updateFullPath = (items: ItemCategoryWithHierarchy[], parentPath = '') => {
                items.forEach(item => {
                    item.fullPath = parentPath ? `${parentPath} > ${item.name}` : item.name;
                    if (item.subCategories && item.subCategories.length > 0) {
                        updateFullPath(item.subCategories, item.fullPath);
                    }
                });
            };

            updateFullPath(rootItems);
            return rootItems;
        },

        extractFlatCategories(hierarchyItems: ItemCategoryWithHierarchy[], flatArray: ItemCategory[]) {
            for (const item of hierarchyItems) {
                // Add the current item (without hierarchy-specific properties)
                const { parentCategory, subCategories, level, hasChildren, fullPath, ...categoryItem } = item;
                flatArray.push(categoryItem);
                
                // Recursively add children
                if (subCategories && subCategories.length > 0) {
                    this.extractFlatCategories(subCategories, flatArray);
                }
            }
        },

        // Action to refresh categories for hierarchy view
        async refreshCategories() {
            this.clearError();
            try {
                await Promise.all([
                    this.fetchCategoryHierarchy(),
                    this.fetchTopLevelCategories()
                ]);
                return true;
            } catch (error) {
                console.error('Error refreshing categories:', error);
                return false;
            }
        },

        // Utility actions
        setFilters(filters: ItemCategoryFilters) {
            this.filters = { ...this.filters, ...filters };
        },

        clearFilters() {
            this.filters = {};
        },

        setSelectedCategory(category: ItemCategory | null) {
            this.selectedCategory = category;
        },

        refreshAllData() {
            return Promise.all([
                this.fetchPaginatedCategories(),
                this.fetchCategoryHierarchy(),
                this.fetchTopLevelCategories(),
                this.fetchCategoryStatistics()
            ]);
        },

        clearValidation() {
            this.validationResult = null;
        },

        clearError() {
            this.error = null;
        },

        clearSearchResults() {
            this.searchResults = [];
        },

        resetStore() {
            this.categories = [];
            this.paginatedCategories = null;
            this.selectedCategory = null;
            this.hierarchy = [];
            this.searchResults = [];
            this.statistics = null;
            this.validationResult = null;
            this.error = null;
            this.loading = false;
            this.filters = {};
        },

        // Initialize store
        initialize() {
            return this.refreshAllData().catch((error) => {
                console.error('Failed to initialize item categories store:', error);
            });
        }
    },
});
