/**
 * Unit of Measure (UOM) Types
 * Based on UnitOfMeasureController API Documentation
 */

// Base user information type
export interface UserInfo {
  id: number
  username: string
}

// Base Unit of Measure interface
export interface UnitOfMeasure {
  id: number
  code: string
  name: string
  description: string | null
  category: string
  baseUnit: boolean
  baseUnitOfMeasure?: Pick<UnitOfMeasure, 'id' | 'code' | 'name'> | null
  conversionFactor: number
  isActive: boolean
  created: string
  updated: string
  createdBy?: UserInfo
  updatedBy?: UserInfo
}

// Create Unit of Measure request
export interface CreateUnitOfMeasureRequest {
  code: string
  name: string
  description?: string
  category: string
  baseUnit: boolean
  baseUnitOfMeasureId?: number
  conversionFactor: number
  isActive?: boolean
}

// Update Unit of Measure request
export interface UpdateUnitOfMeasureRequest extends Partial<CreateUnitOfMeasureRequest> {
  // All fields are optional for updates
}

// Unit conversion request parameters
export interface UnitConversionParams {
  quantity: number
  fromUnitId?: number
  toUnitId?: number
  fromUnitCode?: string
  toUnitCode?: string
}

// Bulk conversion request parameters
export interface BulkConversionParams {
  quantity: number
  fromUnitId: number
  toUnitIds: number[]
}

// Unit conversion result
export interface ConversionResult {
  convertedQuantity: number
  fromUnit: Pick<UnitOfMeasure, 'id' | 'code' | 'name'>
  toUnit: Pick<UnitOfMeasure, 'id' | 'code' | 'name'>
  originalQuantity: number
}

// Bulk conversion result
export interface BulkConversionResult {
  originalQuantity: number
  fromUnit: Pick<UnitOfMeasure, 'id' | 'code' | 'name'>
  conversions: Record<string, number> // unitId -> convertedQuantity
}

// Unit compatibility check result
export interface CompatibilityResult {
  compatible: boolean
  fromUnit: Pick<UnitOfMeasure, 'id' | 'code' | 'name'>
  toUnit: Pick<UnitOfMeasure, 'id' | 'code' | 'name'>
  reason?: string
}

// Unit family structure
export interface UnitFamily {
  baseUnit: UnitOfMeasure
  conversionUnits: UnitOfMeasure[]
  category: string
}

// Unit statistics
export interface UnitStatistics {
  totalUnits: number
  activeUnits: number
  inactiveUnits: number
  baseUnits: number
  conversionUnits: number
  categoryCounts: Record<string, number>
  mostUsedUnits: Array<{
    unit: Pick<UnitOfMeasure, 'id' | 'code' | 'name'>
    usageCount: number
  }>
}

// Search parameters
export interface UnitSearchParams {
  searchTerm?: string
  category?: string
  baseUnit?: boolean
  isActive?: boolean
  page?: number
  size?: number
}

// Standard API Response wrapper
export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

// Paginated response structure
export interface PageableSort {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface Pageable {
  pageNumber: number
  pageSize: number
  sort: PageableSort
  offset: number
  paged: boolean
  unpaged: boolean
}

export interface PaginatedResponse<T> {
  content: T[]
  pageable: Pageable
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  sort: PageableSort
  first: boolean
  numberOfElements: number
  empty: boolean
}

// Specific response types for UOM endpoints
export type CreateUnitResponse = ApiResponse<number> // Returns the created unit ID
export type GetUnitResponse = ApiResponse<UnitOfMeasure>
export type GetUnitsResponse = ApiResponse<UnitOfMeasure[]>
export type GetUnitsPaginatedResponse = PaginatedResponse<UnitOfMeasure>
export type UpdateUnitResponse = ApiResponse<UnitOfMeasure>
export type DeleteUnitResponse = ApiResponse<string>
export type ConvertQuantityResponse = ApiResponse<number>
export type BulkConvertResponse = ApiResponse<Record<string, number>>
export type CompatibilityResponse = ApiResponse<boolean>
export type UnitFamilyResponse = ApiResponse<UnitFamily>
export type UnitStatisticsResponse = ApiResponse<UnitStatistics>

// Common unit categories
export enum UnitCategory {
  WEIGHT = 'Weight',
  VOLUME = 'Volume',
  LENGTH = 'Length',
  AREA = 'Area',
  TIME = 'Time',
  TEMPERATURE = 'Temperature',
  COUNT = 'Count',
  CURRENCY = 'Currency'
}

// Common unit codes for reference
export enum CommonUnitCodes {
  // Weight
  KILOGRAM = 'KG',
  GRAM = 'G',
  POUND = 'LB',
  OUNCE = 'OZ',
  TON = 'TON',
  
  // Volume
  LITER = 'L',
  MILLILITER = 'ML',
  GALLON = 'GAL',
  FLUID_OUNCE = 'FL_OZ',
  CUBIC_METER = 'M3',
  
  // Length
  METER = 'M',
  CENTIMETER = 'CM',
  MILLIMETER = 'MM',
  INCH = 'IN',
  FOOT = 'FT',
  YARD = 'YD',
  
  // Count
  PIECE = 'PC',
  DOZEN = 'DOZ',
  PACK = 'PACK',
  BOX = 'BOX',
  CASE = 'CASE'
}

// Error response types
export interface ValidationError {
  field: string
  message: string
  rejectedValue?: any
}

export interface UomError {
  error: string
  message: string
  timestamp: string
  validationErrors?: ValidationError[]
}

// Filter and sort options
export interface UnitFilterOptions {
  categories?: string[]
  baseUnitsOnly?: boolean
  activeOnly?: boolean
  searchTerm?: string
}

export interface UnitSortOptions {
  field: 'code' | 'name' | 'category' | 'created' | 'updated'
  direction: 'asc' | 'desc'
}

// Form data types for UI components
export interface UnitFormData extends Omit<CreateUnitOfMeasureRequest, 'baseUnitOfMeasureId'> {
  baseUnitOfMeasureId?: number | null
}

export interface UnitSearchFormData {
  searchTerm: string
  category: string
  baseUnit: boolean | null
  isActive: boolean | null
}

// Store state interfaces for Pinia
export interface UomStoreState {
  units: UnitOfMeasure[]
  baseUnits: UnitOfMeasure[]
  categories: string[]
  currentUnit: UnitOfMeasure | null
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
  filters: UnitFilterOptions
  statistics: UnitStatistics | null
}

// Action types for store mutations
export interface UomStoreActions {
  fetchUnits: (params?: UnitSearchParams) => Promise<void>
  fetchUnitsPaginated: (params?: UnitSearchParams) => Promise<PaginatedResponse<UnitOfMeasure>>
  fetchUnitById: (id: number) => Promise<UnitOfMeasure>
  fetchUnitByCode: (code: string) => Promise<UnitOfMeasure>
  createUnit: (data: CreateUnitOfMeasureRequest) => Promise<number>
  updateUnit: (id: number, data: UpdateUnitOfMeasureRequest) => Promise<UnitOfMeasure>
  deleteUnit: (id: number) => Promise<void>
  searchUnits: (searchTerm: string) => Promise<UnitOfMeasure[]>
  fetchBaseUnits: () => Promise<UnitOfMeasure[]>
  fetchConversionUnits: (baseUnitId: number) => Promise<UnitOfMeasure[]>
  fetchUnitFamily: (baseUnitId: number) => Promise<UnitFamily>
  fetchUnitsByCategory: (category: string) => Promise<UnitOfMeasure[]>
  convertQuantity: (params: UnitConversionParams) => Promise<number>
  bulkConvert: (params: BulkConversionParams) => Promise<Record<string, number>>
  checkCompatibility: (fromUnitId: number, toUnitId: number) => Promise<boolean>
  fetchStatistics: () => Promise<UnitStatistics>
  fetchMostUsedUnits: (limit?: number) => Promise<UnitOfMeasure[]>
}

// Utility types for component props
export interface UnitSelectorProps {
  value?: number | string
  category?: string
  baseUnitsOnly?: boolean
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

export interface UnitConverterProps {
  fromUnit?: UnitOfMeasure
  toUnit?: UnitOfMeasure
  quantity?: number
  category?: string
  onConvert?: (result: ConversionResult) => void
}

export interface UnitFormProps {
  unit?: UnitOfMeasure
  mode: 'create' | 'edit' | 'view'
  onSubmit?: (data: CreateUnitOfMeasureRequest | UpdateUnitOfMeasureRequest) => void
  onCancel?: () => void
}

// Constants for validation
export const UOM_VALIDATION = {
  CODE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 10,
    PATTERN: /^[A-Z0-9_]+$/
  },
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100
  },
  DESCRIPTION: {
    MAX_LENGTH: 500
  },
  CONVERSION_FACTOR: {
    MIN: 0.000001,
    MAX: 1000000
  }
} as const

// Type guards
export function isBaseUnit(unit: UnitOfMeasure): boolean {
  return unit.baseUnit === true
}

export function isConversionUnit(unit: UnitOfMeasure): boolean {
  return unit.baseUnit === false && !!unit.baseUnitOfMeasure
}

export function isValidConversionFactor(factor: number, isBase: boolean): boolean {
  if (isBase) return factor === 1.0
  return factor > 0 && factor !== 1.0
}

export function unitsAreCompatible(unit1: UnitOfMeasure, unit2: UnitOfMeasure): boolean {
  return unit1.category === unit2.category
}

// Helper types for API endpoints
export type UomEndpoint = 
  | 'create'
  | 'getAll'
  | 'getAllPaginated'
  | 'getById'
  | 'getByCode'
  | 'update'
  | 'delete'
  | 'search'
  | 'getBaseUnits'
  | 'getConversions'
  | 'getFamily'
  | 'getByCategory'
  | 'convert'
  | 'convertByCode'
  | 'bulkConvert'
  | 'checkCompatibility'
  | 'getStatistics'
  | 'getMostUsed'

export type UomApiParams = {
  create: CreateUnitOfMeasureRequest
  getAll: never
  getAllPaginated: { page?: number; size?: number }
  getById: { id: number }
  getByCode: { code: string }
  update: { id: number; data: UpdateUnitOfMeasureRequest }
  delete: { id: number }
  search: { searchTerm: string }
  getBaseUnits: never
  getConversions: { baseUnitId: number }
  getFamily: { baseUnitId: number }
  getByCategory: { category: string }
  convert: UnitConversionParams
  convertByCode: UnitConversionParams
  bulkConvert: BulkConversionParams
  checkCompatibility: { fromUnitId: number; toUnitId: number }
  getStatistics: never
  getMostUsed: { limit?: number }
}
