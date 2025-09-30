import { z } from 'zod'

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/,
  name: /^[a-zA-Z\s\-\.\']{2,50}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  zipCode: /^[0-9]{5}(-[0-9]{4})?$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  currency: /^\d+(\.\d{2})?$/,
  timezone: /^[A-Za-z_\/]+$/
}

// Validation error messages
export const ValidationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  url: 'Please enter a valid URL',
  linkedin: 'Please enter a valid LinkedIn profile URL',
  twitter: 'Please enter a valid Twitter profile URL',
  name: 'Name must contain only letters, spaces, hyphens, dots, and apostrophes (2-50 characters)',
  password: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be no more than ${max}`,
  fileSize: (maxMB: number) => `File size must be less than ${maxMB}MB`,
  fileType: (types: string[]) => `File must be one of: ${types.join(', ')}`
}

// Data sanitization utilities
export class DataSanitizer {
  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHtml(content: string): string {
    // Comprehensive HTML sanitization without external dependencies
    
    // Remove script tags and their content
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    
    // Remove iframe tags and their content
    content = content.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    
    // Remove object and embed tags
    content = content.replace(/<(object|embed|form|input|textarea|select|button)\b[^>]*>.*?<\/\1>/gi, '')
    
    // Remove event handlers
    content = content.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    content = content.replace(/on\w+\s*=\s*[^>\s]+/gi, '')
    
    // Remove javascript: and data: URLs
    content = content.replace(/(href|src|action)\s*=\s*["']?(javascript|data|vbscript):[^"'>\s]*/gi, '$1=""')
    
    // Remove style attributes (potential for CSS injection)
    content = content.replace(/style\s*=\s*["'][^"']*["']/gi, '')
    
    // Allow only safe tags
    const allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre']
    const tagPattern = /<\/?(\w+)(?:\s[^>]*)?>|<\w+\s*\/>/gi
    
    content = content.replace(tagPattern, (match, tagName) => {
      if (tagName && allowedTags.includes(tagName.toLowerCase())) {
        // For allowed tags, still sanitize attributes
        if (tagName.toLowerCase() === 'a') {
          // For links, only allow href and target attributes
          return match.replace(/\s+(?!href|target)\w+\s*=\s*["'][^"']*["']/gi, '')
        }
        // For other allowed tags, remove all attributes except basic ones
        return match.replace(/\s+\w+\s*=\s*["'][^"']*["']/gi, '')
      }
      return '' // Remove disallowed tags
    })
    
    // Final cleanup - remove any remaining potentially dangerous content
    content = content.replace(/<!--[\s\S]*?-->/g, '') // Remove comments
    content = content.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '') // Remove CDATA
    
    return this.sanitizeText(content)
  }

  /**
   * Sanitize plain text input
   */
  static sanitizeText(text: string): string {
    return text
      .trim()
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
  }

  /**
   * Sanitize URL input
   */
  static sanitizeUrl(url: string): string {
    const sanitized = this.sanitizeText(url)
    
    // Remove javascript: and data: protocols
    if (sanitized.toLowerCase().startsWith('javascript:') || 
        sanitized.toLowerCase().startsWith('data:')) {
      return ''
    }
    
    // Ensure HTTP/HTTPS protocol
    if (sanitized && !sanitized.match(/^https?:\/\//)) {
      return `https://${sanitized}`
    }
    
    return sanitized
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string {
    return this.sanitizeText(email).toLowerCase()
  }

  /**
   * Sanitize phone number
   */
  static sanitizePhone(phone: string): string {
    return phone.replace(/[^\d\+\-\s\(\)]/g, '').trim()
  }

  /**
   * Sanitize file name
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255)
  }
}

// Base profile validation schema
const BaseProfileSchema = z.object({
  firstName: z.string()
    .min(1, ValidationMessages.required)
    .min(2, ValidationMessages.minLength(2))
    .max(50, ValidationMessages.maxLength(50))
    .regex(ValidationPatterns.name, ValidationMessages.name)
    .transform(DataSanitizer.sanitizeText),
    
  lastName: z.string()
    .min(1, ValidationMessages.required)
    .min(2, ValidationMessages.minLength(2))
    .max(50, ValidationMessages.maxLength(50))
    .regex(ValidationPatterns.name, ValidationMessages.name)
    .transform(DataSanitizer.sanitizeText),
    
  email: z.string()
    .min(1, ValidationMessages.required)
    .email(ValidationMessages.email)
    .max(254, ValidationMessages.maxLength(254))
    .transform(DataSanitizer.sanitizeEmail),
    
  phoneNumber: z.string()
    .optional()
    .transform(val => val ? DataSanitizer.sanitizePhone(val) : val)
    .refine(
      val => !val || ValidationPatterns.phone.test(val),
      ValidationMessages.phone
    ),
    
  jobTitle: z.string()
    .max(100, ValidationMessages.maxLength(100))
    .optional()
    .transform(val => val ? DataSanitizer.sanitizeText(val) : val),
    
  department: z.string()
    .max(100, ValidationMessages.maxLength(100))
    .optional()
    .transform(val => val ? DataSanitizer.sanitizeText(val) : val),
    
  location: z.string()
    .max(200, ValidationMessages.maxLength(200))
    .optional()
    .transform(val => val ? DataSanitizer.sanitizeText(val) : val),
    
  bio: z.string()
    .max(500, ValidationMessages.maxLength(500))
    .optional()
    .transform(val => val ? DataSanitizer.sanitizeHtml(val) : val),
    
  timezone: z.string()
    .regex(ValidationPatterns.timezone, 'Invalid timezone')
    .default('UTC'),
    
  preferredLanguage: z.string()
    .min(2).max(5)
    .default('en'),
    
  linkedinUrl: z.string()
    .optional()
    .transform(val => val ? DataSanitizer.sanitizeUrl(val) : val)
    .refine(
      val => !val || ValidationPatterns.linkedin.test(val),
      ValidationMessages.linkedin
    ),
    
  twitterUrl: z.string()
    .optional()
    .transform(val => val ? DataSanitizer.sanitizeUrl(val) : val)
    .refine(
      val => !val || ValidationPatterns.twitter.test(val),
      ValidationMessages.twitter
    ),
    
  websiteUrl: z.string()
    .optional()
    .transform(val => val ? DataSanitizer.sanitizeUrl(val) : val)
    .refine(
      val => !val || ValidationPatterns.url.test(val),
      ValidationMessages.url
    )
})

// Mentor profile validation schema
const MentorProfileSchema = BaseProfileSchema.extend({
  title: z.string()
    .min(1, ValidationMessages.required)
    .max(100, ValidationMessages.maxLength(100))
    .transform(DataSanitizer.sanitizeText),
    
  company: z.string()
    .min(1, ValidationMessages.required)
    .max(100, ValidationMessages.maxLength(100))
    .transform(DataSanitizer.sanitizeText),
    
  industry: z.string()
    .max(50, ValidationMessages.maxLength(50))
    .optional()
    .transform(val => val ? DataSanitizer.sanitizeText(val) : val),
    
  experienceYears: z.number()
    .min(0, ValidationMessages.min(0))
    .max(50, ValidationMessages.max(50)),
    
  hourlyRate: z.number()
    .min(25, ValidationMessages.min(25))
    .max(1000, ValidationMessages.max(1000)),
    
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    .default('USD'),
    
  minSessionDuration: z.number()
    .min(15, ValidationMessages.min(15))
    .max(180, ValidationMessages.max(180)),
    
  maxSessionDuration: z.number()
    .min(30, ValidationMessages.min(30))
    .max(300, ValidationMessages.max(300)),
    
  maxMentees: z.number()
    .min(1, ValidationMessages.min(1))
    .max(50, ValidationMessages.max(50)),
    
  expertiseAreas: z.array(z.string().transform(DataSanitizer.sanitizeText))
    .min(1, 'Please select at least one area of expertise')
    .max(10, 'Maximum 10 expertise areas allowed'),
    
  skills: z.array(z.string().transform(DataSanitizer.sanitizeText))
    .max(15, 'Maximum 15 skills allowed'),
    
  mentorshipFocus: z.array(z.string().transform(DataSanitizer.sanitizeText))
    .max(8, 'Maximum 8 focus areas allowed'),
    
  profileSummary: z.string()
    .min(1, ValidationMessages.required)
    .min(50, ValidationMessages.minLength(50))
    .max(500, ValidationMessages.maxLength(500))
    .transform(DataSanitizer.sanitizeHtml),
    
  mentoringPhilosophy: z.string()
    .max(300, ValidationMessages.maxLength(300))
    .optional()
    .transform(val => val ? DataSanitizer.sanitizeHtml(val) : val),
    
  communicationStyle: z.enum([
    'direct', 'supportive', 'analytical', 
    'collaborative', 'structured', 'flexible'
  ]).optional(),
    
  preferredSessionTypes: z.array(z.string().transform(DataSanitizer.sanitizeText))
    .max(8, 'Maximum 8 session types allowed'),
    
  // Education validation
  education: z.array(z.object({
    degree: z.string()
      .min(1, ValidationMessages.required)
      .max(100, ValidationMessages.maxLength(100))
      .transform(DataSanitizer.sanitizeText),
    institution: z.string()
      .min(1, ValidationMessages.required)
      .max(100, ValidationMessages.maxLength(100))
      .transform(DataSanitizer.sanitizeText),
    year: z.string()
      .regex(/^\d{4}$/, 'Please enter a valid year')
      .transform(DataSanitizer.sanitizeText),
    field: z.string()
      .max(100, ValidationMessages.maxLength(100))
      .optional()
      .transform(val => val ? DataSanitizer.sanitizeText(val) : val)
  })).max(5, 'Maximum 5 education entries allowed'),
    
  // Certifications validation
  certifications: z.array(z.object({
    name: z.string()
      .min(1, ValidationMessages.required)
      .max(100, ValidationMessages.maxLength(100))
      .transform(DataSanitizer.sanitizeText),
    issuer: z.string()
      .min(1, ValidationMessages.required)
      .max(100, ValidationMessages.maxLength(100))
      .transform(DataSanitizer.sanitizeText),
    year: z.string()
      .regex(/^\d{4}$/, 'Please enter a valid year')
      .transform(DataSanitizer.sanitizeText),
    credentialUrl: z.string()
      .optional()
      .transform(val => val ? DataSanitizer.sanitizeUrl(val) : val)
      .refine(
        val => !val || ValidationPatterns.url.test(val),
        ValidationMessages.url
      )
  })).max(10, 'Maximum 10 certifications allowed'),
    
  // Work experience validation
  workExperience: z.array(z.object({
    title: z.string()
      .min(1, ValidationMessages.required)
      .max(100, ValidationMessages.maxLength(100))
      .transform(DataSanitizer.sanitizeText),
    company: z.string()
      .min(1, ValidationMessages.required)
      .max(100, ValidationMessages.maxLength(100))
      .transform(DataSanitizer.sanitizeText),
    startYear: z.string()
      .regex(/^\d{4}$/, 'Please enter a valid year')
      .transform(DataSanitizer.sanitizeText),
    endYear: z.string()
      .regex(/^(\d{4}|Present)$/, 'Please enter a valid year or "Present"')
      .transform(DataSanitizer.sanitizeText),
    description: z.string()
      .max(300, ValidationMessages.maxLength(300))
      .optional()
      .transform(val => val ? DataSanitizer.sanitizeHtml(val) : val)
  })).max(10, 'Maximum 10 work experience entries allowed')
})

// Authentication validation schemas
export const AuthValidationSchemas = {
  login: z.object({
    email: z.string()
      .min(1, ValidationMessages.required)
      .email(ValidationMessages.email)
      .transform(DataSanitizer.sanitizeEmail),
    password: z.string()
      .min(1, ValidationMessages.required)
  }),
  
  register: z.object({
    firstName: z.string()
      .min(1, ValidationMessages.required)
      .min(2, ValidationMessages.minLength(2))
      .max(50, ValidationMessages.maxLength(50))
      .regex(ValidationPatterns.name, ValidationMessages.name)
      .transform(DataSanitizer.sanitizeText),
    lastName: z.string()
      .min(1, ValidationMessages.required)
      .min(2, ValidationMessages.minLength(2))
      .max(50, ValidationMessages.maxLength(50))
      .regex(ValidationPatterns.name, ValidationMessages.name)
      .transform(DataSanitizer.sanitizeText),
    email: z.string()
      .min(1, ValidationMessages.required)
      .email(ValidationMessages.email)
      .transform(DataSanitizer.sanitizeEmail),
    password: z.string()
      .min(8, ValidationMessages.minLength(8))
      .regex(ValidationPatterns.password, ValidationMessages.password),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  }),
  
  changePassword: z.object({
    currentPassword: z.string()
      .min(1, ValidationMessages.required),
    newPassword: z.string()
      .min(8, ValidationMessages.minLength(8))
      .regex(ValidationPatterns.password, ValidationMessages.password),
    confirmPassword: z.string()
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  }),
  
  resetPassword: z.object({
    email: z.string()
      .min(1, ValidationMessages.required)
      .email(ValidationMessages.email)
      .transform(DataSanitizer.sanitizeEmail)
  }),
  
  mfaCode: z.object({
    code: z.string()
      .min(6, 'Please enter a 6-digit code')
      .max(6, 'Please enter a 6-digit code')
      .regex(/^\d{6}$/, 'Code must be 6 digits')
  })
}

// Profile validation schemas
export const ProfileValidationSchemas = {
  base: BaseProfileSchema,
  mentor: MentorProfileSchema,
  
  // Photo upload validation
  photo: z.object({
    file: z.any()
      .refine(file => file instanceof File, 'Please select a file')
      .refine(
        file => file.size <= 5 * 1024 * 1024,
        ValidationMessages.fileSize(5)
      )
      .refine(
        file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
        ValidationMessages.fileType(['JPEG', 'PNG', 'WebP'])
      )
  })
}

// File validation utilities
export class FileValidator {
  static validateImage(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      errors.push(ValidationMessages.fileType(['JPEG', 'PNG', 'WebP']))
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      errors.push(ValidationMessages.fileSize(5))
    }
    
    // Check file name
    if (file.name.length > 255) {
      errors.push('File name too long')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  static validateDocument(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(ValidationMessages.fileType(['PDF', 'DOC', 'DOCX', 'TXT']))
    }
    
    // Check file size (10MB max for documents)
    if (file.size > 10 * 1024 * 1024) {
      errors.push(ValidationMessages.fileSize(10))
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Validation helper functions
export class ValidationHelpers {
  /**
   * Validate form data and return errors
   */
  static validateForm<T>(schema: z.ZodSchema<T>, data: any): {
    success: boolean
    data?: T
    errors: Record<string, string>
  } {
    try {
      const result = schema.parse(data)
      return {
        success: true,
        data: result,
        errors: {}
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach(err => {
          const path = err.path.join('.')
          errors[path] = err.message
        })
        return {
          success: false,
          errors
        }
      }
      return {
        success: false,
        errors: { general: 'Validation failed' }
      }
    }
  }
  
  /**
   * Validate individual field
   */
  static validateField<T>(
    schema: z.ZodSchema<T>, 
    fieldName: string, 
    value: any
  ): { valid: boolean; error?: string } {
    try {
      const fieldSchema = (schema as any).shape[fieldName]
      if (!fieldSchema) {
        return { valid: true }
      }
      
      fieldSchema.parse(value)
      return { valid: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          error: error.errors[0]?.message || 'Invalid value'
        }
      }
      return {
        valid: false,
        error: 'Validation failed'
      }
    }
  }
  
  /**
   * Get validation schema based on user role
   */
  static getProfileSchema(userRole: 'employee' | 'mentor' | 'corporate_admin') {
    switch (userRole) {
      case 'mentor':
        return ProfileValidationSchemas.mentor
      case 'employee':
      case 'corporate_admin':
      default:
        return ProfileValidationSchemas.base
    }
  }
  
  /**
   * Debounced validation for real-time feedback
   */
  static createDebouncedValidator<T>(
    schema: z.ZodSchema<T>,
    delay = 300
  ) {
    let timeoutId: NodeJS.Timeout
    
    return (data: any, callback: (result: ReturnType<typeof ValidationHelpers.validateForm>) => void) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const result = ValidationHelpers.validateForm(schema, data)
        callback(result)
      }, delay)
    }
  }
}

// Security utilities
export class SecurityUtils {
  /**
   * Generate secure random string
   */
  static generateSecureRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(length)
      crypto.getRandomValues(array)
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length]
      }
    } else {
      // Fallback for environments without crypto.getRandomValues
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)]
      }
    }
    
    return result
  }
  
  /**
   * Hash sensitive data (client-side hashing for additional security)
   */
  static async hashData(data: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }
    
    // Fallback - not recommended for production
    return btoa(data)
  }
  
  /**
   * Validate file content security
   */
  static async validateFileContent(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        // Check for suspicious content patterns
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /vbscript:/i,
          /data:text\/html/i,
          /<?php/i,
          /<%/i
        ]
        
        const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
          pattern.test(content)
        )
        
        resolve(!hasSuspiciousContent)
      }
      
      reader.onerror = () => resolve(false)
      reader.readAsText(file.slice(0, 1024)) // Read first 1KB
    })
  }
}

export default {
  ValidationPatterns,
  ValidationMessages,
  DataSanitizer,
  AuthValidationSchemas,
  ProfileValidationSchemas,
  FileValidator,
  ValidationHelpers,
  SecurityUtils
} 