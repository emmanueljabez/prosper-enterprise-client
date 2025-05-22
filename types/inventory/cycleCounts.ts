/**
 * Types for inventory cycle counts
 */

/**
 * Possible statuses for a cycle count
 */
export type CycleCountStatus = 'scheduled' | 'in_progress' | 'pending_approval' | 'completed' | 'cancelled';

/**
 * Possible recurrence patterns for scheduled counts
 */
export type RecurrencePattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Possible variance resolutions
 */
export type VarianceResolution = 'accept' | 'adjust' | 'investigate' | 'recount';

/**
 * The state structure for the cycle counts store
 */
export interface CycleCountState {
  cycleCounts: CycleCount[];
  isLoading: boolean;
  error: string | null;
  useMockData: boolean;
  currentCount: CycleCount | null;
}

/**
 * Represents a single item being counted
 */
export interface CountItem {
  itemId: string;
  sku: string;
  name: string;
  expectedQuantity: number;
  countedQuantity: number | null;
  variance?: number;
  binLocation?: string;
  hasVariance?: boolean;
  varianceResolution?: VarianceResolution;
  varianceNotes?: string;
  cost?: number;
}

/**
 * Main cycle count structure
 */
export interface CycleCount {
  id: string;
  name: string;
  description?: string;
  status: CycleCountStatus;
  startDate: string;
  scheduledEndDate?: string;
  startedAt?: string;
  completedAt?: string;
  locationId: string;
  locationName?: string;
  createdBy: string;
  createdByName?: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceFrequency?: number;
  recurrenceDayOfWeek?: number;
  recurrenceDayOfMonth?: number;
  hasVariance: boolean;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  items: CountItem[];
}

/**
 * Structure for sending variance update data
 */
export interface VarianceData {
  items: {
    itemId: string;
    resolution: VarianceResolution;
    notes?: string;
  }[];
  notes?: string;
}

/**
 * Options for scheduling a recurring count
 */
export interface ScheduleOptions {
  name: string;
  description?: string;
  locationId: string;
  startDate: string;
  recurrencePattern: RecurrencePattern;
  recurrenceFrequency: number;
  recurrenceDayOfWeek?: number;
  recurrenceDayOfMonth?: number;
}

/**
 * Parameters for filtering cycle counts
 */
export interface CycleCountFilterParams {
  status?: CycleCountStatus;
  locationId?: string;
  dateRange?: string;
  isRecurring?: boolean;
}