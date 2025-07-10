/**
 * Date and DateTime utility functions for the inventory system
 */

/**
 * Format current date and time as YYYY-MM-DDTHH:mm:ss
 * @returns Formatted datetime string
 */
export function formatCurrentDateTime(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

/**
 * Format current date as YYYY-MM-DD
 * @returns Formatted date string
 */
export function formatCurrentDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Convert a datetime string to date-only string
 * @param datetime - Datetime string in YYYY-MM-DDTHH:mm format
 * @returns Date string in YYYY-MM-DD format
 */
export function extractDate(datetime: string): string {
  if (!datetime) return ''
  return datetime.includes('T') ? datetime.split('T')[0] : datetime
}

/**
 * Convert a datetime string to time-only string
 * @param datetime - Datetime string in YYYY-MM-DDTHH:mm format
 * @returns Time string in HH:mm format
 */
export function extractTime(datetime: string): string {
  if (!datetime || !datetime.includes('T')) return ''
  return datetime.split('T')[1] || ''
}

/**
 * Combine date and time strings into datetime string
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:mm format
 * @returns Combined datetime string in YYYY-MM-DDTHH:mm:ss format
 */
export function combineDateAndTime(date: string, time: string): string {
  if (!date) return ''
  if (!time) return date
  // Add seconds if not provided
  const timeWithSeconds = time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time
  return `${date}T${timeWithSeconds}`
}

/**
 * Parse a date/datetime string and return a Date object
 * @param dateString - Date or datetime string
 * @returns Date object or null if parsing fails
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null
  
  try {
    // Handle both YYYY-MM-DD and YYYY-MM-DDTHH:mm formats
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  } catch (error) {
    console.warn('Failed to parse date:', dateString)
    return null
  }
}

/**
 * Format a date object as YYYY-MM-DD
 * @param date - Date object
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Format a date object as YYYY-MM-DDTHH:mm:ss
 * @param date - Date object
 * @returns Formatted datetime string
 */
export function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

/**
 * Ensure a date string is in the format YYYY-MM-DDTHH:mm:ss
 * This function guarantees that all date fields sent to the API are properly formatted
 * @param dateString - Input date string in various formats
 * @returns Formatted datetime string or null if invalid
 */
export function ensureDateTimeFormat(dateString: string | null | undefined): string | null {
  if (!dateString) return null
  
  // If it's already in the correct format with seconds, return as is
  if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
    return dateString
  }
  
  // If it's date only (YYYY-MM-DD), add time
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return `${dateString}T00:00:00`
  }
  
  // If it's datetime without seconds (YYYY-MM-DDTHH:mm), add seconds
  if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
    return `${dateString}:00`
  }
  
  // Try to parse and reformat
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    
    return formatDateTime(date)
  } catch (error) {
    console.warn('Failed to format date:', dateString)
    return null
  }
}
