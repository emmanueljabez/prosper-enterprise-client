import { ref, reactive, computed, watch, nextTick } from 'vue'
import { z } from 'zod'
import { 
  ValidationHelpers, 
  AuthValidationSchemas, 
  ProfileValidationSchemas,
  DataSanitizer 
} from '@/utils/validation'
import { useAuthStore } from '@/store/modules/auth'
import { RoleManager } from '@/utils/roleManager'

export interface ValidationState {
  isValid: boolean
  isValidating: boolean
  errors: Record<string, string>
  touchedFields: Set<string>
  hasChanges: boolean
}

export interface ValidationOptions {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  debounceMs?: number
  sanitizeInput?: boolean
  showErrorsOnTouch?: boolean
}

export function useValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialData: T,
  options: ValidationOptions = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    sanitizeInput = true,
    showErrorsOnTouch = true
  } = options

  // State
  const formData = reactive<T>({ ...initialData })
  const originalData = ref<T>({ ...initialData })
  const state = reactive<ValidationState>({
    isValid: false,
    isValidating: false,
    errors: {},
    touchedFields: new Set(),
    hasChanges: false
  })

  // Validation timeout for debouncing
  let validationTimeout: NodeJS.Timeout | null = null

  // Computed properties
  const isFormValid = computed(() => 
    state.isValid && Object.keys(state.errors).length === 0
  )

  const hasErrors = computed(() => 
    Object.keys(state.errors).length > 0
  )

  const changedFields = computed(() => {
    const changed: string[] = []
    for (const key in formData) {
      if (JSON.stringify(formData[key]) !== JSON.stringify(originalData.value[key])) {
        changed.push(key)
      }
    }
    return changed
  })

  const visibleErrors = computed(() => {
    if (!showErrorsOnTouch) return state.errors
    
    const visible: Record<string, string> = {}
    for (const field of state.touchedFields) {
      if (state.errors[field]) {
        visible[field] = state.errors[field]
      }
    }
    return visible
  })

  // Validation functions
  const validateForm = async (): Promise<boolean> => {
    state.isValidating = true
    
    try {
      const result = ValidationHelpers.validateForm(schema, formData)
      
      state.errors = result.errors
      state.isValid = result.success
      
      if (result.success && result.data) {
        // Update form data with sanitized values
        Object.assign(formData, result.data)
      }
      
      return result.success
    } catch (error) {
      console.error('Validation error:', error)
      state.isValid = false
      return false
    } finally {
      state.isValidating = false
    }
  }

  const validateField = async (fieldName: string, value: any): Promise<boolean> => {
    try {
      const result = ValidationHelpers.validateField(schema, fieldName, value)
      
      if (result.valid) {
        delete state.errors[fieldName]
      } else {
        state.errors[fieldName] = result.error || 'Invalid value'
      }
      
      return result.valid
    } catch (error) {
      state.errors[fieldName] = 'Validation failed'
      return false
    }
  }

  const debouncedValidateForm = () => {
    if (validationTimeout) {
      clearTimeout(validationTimeout)
    }
    
    validationTimeout = setTimeout(async () => {
      await validateForm()
    }, debounceMs)
  }

  const debouncedValidateField = (fieldName: string, value: any) => {
    if (validationTimeout) {
      clearTimeout(validationTimeout)
    }
    
    validationTimeout = setTimeout(async () => {
      await validateField(fieldName, value)
    }, debounceMs)
  }

  // Field interaction handlers
  const touchField = (fieldName: string) => {
    state.touchedFields.add(fieldName)
  }

  const untouchField = (fieldName: string) => {
    state.touchedFields.delete(fieldName)
  }

  const clearFieldError = (fieldName: string) => {
    delete state.errors[fieldName]
  }

  const setFieldError = (fieldName: string, error: string) => {
    state.errors[fieldName] = error
  }

  // Form data manipulation
  const updateField = (fieldName: string, value: any) => {
    // Sanitize input if enabled
    if (sanitizeInput && typeof value === 'string') {
      value = DataSanitizer.sanitizeText(value)
    }
    
    (formData as any)[fieldName] = value
    
    // Mark field as touched
    touchField(fieldName)
    
    // Update hasChanges flag
    state.hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData.value)
    
    // Validate on change if enabled
    if (validateOnChange) {
      debouncedValidateField(fieldName, value)
    }
  }

  const handleFieldBlur = (fieldName: string) => {
    touchField(fieldName)
    
    if (validateOnBlur) {
      validateField(fieldName, (formData as any)[fieldName])
    }
  }

  const handleFieldFocus = (fieldName: string) => {
    // Clear error on focus for better UX
    clearFieldError(fieldName)
  }

  // Form actions
  const reset = () => {
    Object.assign(formData, originalData.value)
    state.errors = {}
    state.touchedFields.clear()
    state.hasChanges = false
    state.isValid = false
  }

  const setOriginalData = (data: T) => {
    originalData.value = { ...data }
    Object.assign(formData, data)
    state.hasChanges = false
  }

  const setFormData = (data: Partial<T>) => {
    Object.assign(formData, data)
    state.hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData.value)
  }

  const getFieldProps = (fieldName: string) => ({
    modelValue: (formData as any)[fieldName],
    'onUpdate:modelValue': (value: any) => updateField(fieldName, value),
    onBlur: () => handleFieldBlur(fieldName),
    onFocus: () => handleFieldFocus(fieldName),
    error: visibleErrors.value[fieldName],
    hasError: !!visibleErrors.value[fieldName]
  })

  // Watch for changes and validate
  watch(
    formData,
    () => {
      state.hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData.value)
      
      if (validateOnChange) {
        debouncedValidateForm()
      }
    },
    { deep: true }
  )

  // Initial validation
  nextTick(() => {
    validateForm()
  })

  return {
    // Data
    formData,
    state,
    
    // Computed
    isFormValid,
    hasErrors,
    changedFields,
    visibleErrors,
    
    // Actions
    validateForm,
    validateField,
    updateField,
    touchField,
    untouchField,
    clearFieldError,
    setFieldError,
    handleFieldBlur,
    handleFieldFocus,
    reset,
    setOriginalData,
    setFormData,
    getFieldProps
  }
}

// Specialized validation composables
export function useProfileValidation(userRole: 'employee' | 'mentor' | 'corporate_admin') {
  const authStore = useAuthStore()
  const currentUser = authStore.loggedInUser
  
  const schema = ValidationHelpers.getProfileSchema(userRole)
  
  const initialData = {
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phoneNumber: '',
    jobTitle: '',
    department: '',
    location: '',
    bio: '',
    timezone: 'UTC',
    preferredLanguage: 'en',
    linkedinUrl: '',
    twitterUrl: '',
    websiteUrl: ''
  }

  return useValidation(schema, initialData, {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300,
    sanitizeInput: true,
    showErrorsOnTouch: true
  })
}

export function useAuthValidation(type: 'login' | 'register' | 'changePassword' | 'resetPassword') {
  const schema = AuthValidationSchemas[type]
  
  const getInitialData = () => {
    switch (type) {
      case 'login':
        return { email: '', password: '' }
      case 'register':
        return { 
          firstName: '', 
          lastName: '', 
          email: '', 
          password: '', 
          confirmPassword: '' 
        }
      case 'changePassword':
        return { 
          currentPassword: '', 
          newPassword: '', 
          confirmPassword: '' 
        }
      case 'resetPassword':
        return { email: '' }
      default:
        return {}
    }
  }

  return useValidation(schema, getInitialData() as any, {
    validateOnChange: false,
    validateOnBlur: true,
    debounceMs: 500,
    sanitizeInput: true,
    showErrorsOnTouch: false
  })
}

// File validation composable
export function useFileValidation() {
  const validateFile = (file: File, type: 'image' | 'document' = 'image') => {
    const { FileValidator } = require('@/utils/validation')
    
    if (type === 'image') {
      return FileValidator.validateImage(file)
    } else {
      return FileValidator.validateDocument(file)
    }
  }

  const validateFiles = (files: File[], type: 'image' | 'document' = 'image') => {
    const results = files.map(file => ({
      file,
      ...validateFile(file, type)
    }))
    
    return {
      allValid: results.every(r => r.valid),
      results
    }
  }

  return {
    validateFile,
    validateFiles
  }
}

// Custom validation rules
export function useCustomValidation() {
  const addCustomRule = <T>(
    schema: z.ZodSchema<T>,
    fieldName: string,
    validator: (value: any) => boolean | Promise<boolean>,
    errorMessage: string
  ) => {
    // This would extend the schema with custom validation
    // Implementation depends on specific needs
  }

  const createAsyncValidator = (
    validator: (value: any) => Promise<boolean>,
    errorMessage: string,
    debounceMs = 500
  ) => {
    return {
      validator,
      errorMessage,
      debounceMs
    }
  }

  return {
    addCustomRule,
    createAsyncValidator
  }
}

export default useValidation 