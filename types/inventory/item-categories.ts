
/**
 * Base Item Category interface representing the core category data
 */
export interface ItemCategory {
  id: number
  code: string
  name: string
  description?: string
  parentCategoryId?: number
  sortOrder: number
  isActive: boolean
  tenantId: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

/**
 * Request payload for creating new item categories
 */
export interface CreateItemCategoryRequest {
  code: string
  name: string
  description?: string
  parentCategoryId?: number
  sortOrder?: number
  isActive?: boolean
}

/**
 * Request payload for updating existing item categories
 */
export interface UpdateItemCategoryRequest {
  code?: string
  name?: string
  description?: string
  parentCategoryId?: number
  sortOrder?: number
  isActive?: boolean
}

/**
 * Item Category with additional hierarchy information
 */
export interface ItemCategoryWithHierarchy extends ItemCategory {
  parentCategory?: ItemCategory
  subCategories?: ItemCategoryWithHierarchy[]
  level: number
  hasChildren: boolean
  fullPath: string
}

/**
 * Search filters for item categories
 */
export interface ItemCategoryFilters {
  searchTerm?: string
  parentId?: number
  isActive?: boolean
  level?: number
  sortBy?: 'name' | 'code' | 'sortOrder' | 'createdAt' | 'updatedAt'
  sortDirection?: 'asc' | 'desc'
}

/**
 * Pagination parameters for category listing
 */
export interface CategoryPaginationParams {
  page?: number
  size?: number
  sort?: string[]
}

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
  timestamp: string
  path?: string
  status: number
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  content: T[]
  pageable: {
    sort: {
      sorted: boolean
      unsorted: boolean
      empty: boolean
    }
    pageNumber: number
    pageSize: number
    offset: number
    paged: boolean
    unpaged: boolean
  }
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  numberOfElements: number
  size: number
  number: number
  sort: {
    sorted: boolean
    unsorted: boolean
    empty: boolean
  }
  empty: boolean
}

/**
 * API Response types for different endpoints
 */
export type CategoryApiResponse = ApiResponse<ItemCategory>
export type CategoriesApiResponse = ApiResponse<ItemCategory[]>
export type PaginatedCategoriesResponse = ApiResponse<PaginatedResponse<ItemCategory>>
export type CategoryHierarchyResponse = ApiResponse<ItemCategoryWithHierarchy[]>

/**
 * Error response structure
 */
export interface CategoryErrorResponse {
  success: false
  error: string
  message: string
  details?: Record<string, string[]>
  timestamp: string
  path: string
  status: number
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string
  rejectedValue: any
  message: string
  code: string
}

/**
 * Category search results with highlighting
 */
export interface CategorySearchResult extends ItemCategory {
  matchScore: number
  matchedFields: string[]
  highlighted?: {
    name?: string
    code?: string
    description?: string
  }
}

/**
 * Category statistics for dashboard/reporting
 */
export interface CategoryStatistics {
  totalCategories: number
  activeCategories: number
  inactiveCategories: number
  topLevelCategories: number
  maxDepth: number
  categoriesWithItems: number
  categoriesWithoutItems: number
  averageSubcategoriesPerParent: number
}

/**
 * Category tree node for UI components
 */
export interface CategoryTreeNode {
  key: string
  label: string
  data: ItemCategory
  children?: CategoryTreeNode[]
  expanded?: boolean
  selected?: boolean
  icon?: string
  disabled?: boolean
}

/**
 * Category import/export structures
 */
export interface CategoryImportDTO {
  categories: CreateItemCategoryRequest[]
  preserveHierarchy: boolean
  skipDuplicates: boolean
  updateExisting: boolean
}

export interface CategoryExportOptions {
  includeInactive?: boolean
  format: 'json' | 'csv' | 'xlsx'
  includeHierarchy?: boolean
  includeStatistics?: boolean
}

/**
 * Category bulk operations
 */
export interface CategoryBulkUpdateDTO {
  categoryIds: number[]
  updates: Partial<UpdateItemCategoryRequest>
}

export interface CategoryBulkDeleteDTO {
  categoryIds: number[]
  force?: boolean
}

/**
 * Category validation rules
 */
export interface CategoryValidationRules {
  codePattern?: string
  nameMaxLength: number
  descriptionMaxLength: number
  maxHierarchyDepth: number
  allowDuplicateNames: boolean
  requiredFields: string[]
}

/**
 * Request/Response types for specific endpoints
 */

// GET /categories (paginated)
export interface GetCategoriesRequest extends CategoryPaginationParams {
  filters?: ItemCategoryFilters
}

// GET /search
export interface SearchCategoriesRequest {
  searchTerm: string
  filters?: Omit<ItemCategoryFilters, 'searchTerm'>
  limit?: number
  includeInactive?: boolean
}

// GET /hierarchy
export interface GetHierarchyRequest {
  rootId?: number
  maxDepth?: number
  includeInactive?: boolean
}

// POST / (create category)
export type CreateCategoryRequest = CreateItemCategoryRequest
export type CreateCategoryResponse = CategoryApiResponse

// PUT /{id} (update category)
export type UpdateCategoryRequest = UpdateItemCategoryRequest
export type UpdateCategoryResponse = CategoryApiResponse

// GET /{id} (get category by id)
export type GetCategoryResponse = CategoryApiResponse

// DELETE /{id} (delete category)
export interface DeleteCategoryResponse extends ApiResponse<null> {
  deletedItemsCount?: number
}

// GET /code/{categoryCode} (get by code)
export type GetCategoryByCodeResponse = CategoryApiResponse

// GET /parent/{parentId} (get subcategories)
export type GetSubcategoriesResponse = CategoriesApiResponse

// GET /top-level (get root categories)
export type GetTopLevelCategoriesResponse = CategoriesApiResponse

/**
 * Frontend state management types
 */
export interface CategoryState {
  categories: ItemCategory[]
  selectedCategory: ItemCategory | null
  hierarchy: ItemCategoryWithHierarchy[]
  loading: boolean
  error: string | null
  filters: ItemCategoryFilters
  pagination: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
  statistics: CategoryStatistics | null
}

/**
 * Comprehensive store state interface for item categories
 */
export interface ItemCategoriesStoreState {
  categories: ItemCategory[]
  paginatedCategories: PaginatedResponse<ItemCategory> | null
  selectedCategory: ItemCategory | null
  hierarchy: ItemCategoryWithHierarchy[]
  searchResults: CategorySearchResult[]
  statistics: CategoryStatistics | null
  loading: boolean
  error: string | null
  filters: ItemCategoryFilters
  validationResult: { isValid: boolean; errors: string[]; warnings: string[] } | null
  pagination: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

export interface CategoryActions {
  fetchCategories(params?: GetCategoriesRequest): Promise<void>
  fetchCategoryById(id: number): Promise<ItemCategory | null>
  fetchCategoryByCode(code: string): Promise<ItemCategory | null>
  createCategory(data: CreateItemCategoryRequest): Promise<ItemCategory>
  updateCategory(id: number, data: UpdateItemCategoryRequest): Promise<ItemCategory>
  deleteCategory(id: number): Promise<void>
  searchCategories(request: SearchCategoriesRequest): Promise<CategorySearchResult[]>
  fetchHierarchy(request?: GetHierarchyRequest): Promise<ItemCategoryWithHierarchy[]>
  fetchSubcategories(parentId: number): Promise<ItemCategory[]>
  fetchTopLevelCategories(): Promise<ItemCategory[]>
  bulkUpdate(data: CategoryBulkUpdateDTO): Promise<void>
  bulkDelete(data: CategoryBulkDeleteDTO): Promise<void>
  setFilters(filters: ItemCategoryFilters): void
  clearError(): void
}

/**
 * Utility types for form validation
 */
export type CategoryFormData = CreateItemCategoryRequest | UpdateItemCategoryRequest
export type CategoryFormErrors = Partial<Record<keyof CategoryFormData, string>>

/**
 * Constants and enums
 */
export const CATEGORY_VALIDATION_LIMITS = {
  CODE_MAX_LENGTH: 50,
  NAME_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_HIERARCHY_DEPTH: 10,
  MIN_SORT_ORDER: 0,
  MAX_SORT_ORDER: 9999
} as const

export const CATEGORY_SORT_OPTIONS = [
  { value: 'name,asc', label: 'Name (A-Z)' },
  { value: 'name,desc', label: 'Name (Z-A)' },
  { value: 'code,asc', label: 'Code (A-Z)' },
  { value: 'code,desc', label: 'Code (Z-A)' },
  { value: 'sortOrder,asc', label: 'Sort Order (Low-High)' },
  { value: 'sortOrder,desc', label: 'Sort Order (High-Low)' },
  { value: 'createdAt,desc', label: 'Newest First' },
  { value: 'createdAt,asc', label: 'Oldest First' }
] as const

export type CategorySortOption = typeof CATEGORY_SORT_OPTIONS[number]['value']
