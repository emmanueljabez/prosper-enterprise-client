<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Info,
  Lock,
  Shield
} from 'lucide-vue-next'
import { DataSanitizer } from '@/utils/validation'

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'textarea'
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  maxLength?: number
  minLength?: number
  error?: string
  success?: string
  hint?: string
  sanitize?: boolean
  showPasswordToggle?: boolean
  securityLevel?: 'low' | 'medium' | 'high'
  rows?: number
  autoResize?: boolean
  debounce?: number
  validateOnBlur?: boolean
  validateOnInput?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  readonly: false,
  sanitize: true,
  showPasswordToggle: false,
  securityLevel: 'medium',
  rows: 3,
  autoResize: false,
  debounce: 300,
  validateOnBlur: true,
  validateOnInput: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': []
  'focus': []
  'input': [value: string | number]
  'validated': [isValid: boolean, error?: string]
}>()

// Component state
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement>()
const isFocused = ref(false)
const showPassword = ref(false)
const charCount = ref(0)
const isValidating = ref(false)
const internalError = ref<string>()

// Validation timeout
let validationTimeout: NodeJS.Timeout | null = null

// Computed properties
const inputType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text'
  }
  return props.type === 'textarea' ? undefined : props.type
})

const hasError = computed(() => !!(props.error || internalError.value))
const hasSuccess = computed(() => !!props.success && !hasError.value)
const errorMessage = computed(() => props.error || internalError.value)

const isSecureField = computed(() => 
  props.type === 'password' || props.securityLevel === 'high'
)

const characterCountDisplay = computed(() => {
  if (!props.maxLength) return null
  const current = charCount.value
  const max = props.maxLength
  const percentage = (current / max) * 100
  
  return {
    current,
    max,
    percentage,
    isWarning: percentage > 80,
    isError: percentage > 100
  }
})

const securityBadgeColor = computed(() => {
  switch (props.securityLevel) {
    case 'high': return 'destructive'
    case 'medium': return 'secondary'
    case 'low': return 'outline'
    default: return 'secondary'
  }
})

// Input handling
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  let value = target.value
  
  // Apply sanitization if enabled
  if (props.sanitize && typeof value === 'string') {
    switch (props.type) {
      case 'email':
        value = DataSanitizer.sanitizeEmail(value)
        break
      case 'url':
        value = DataSanitizer.sanitizeUrl(value)
        break
      case 'tel':
        value = DataSanitizer.sanitizePhone(value)
        break
      default:
        value = DataSanitizer.sanitizeText(value)
    }
    
    // Update the input value if sanitization changed it
    if (target.value !== value) {
      target.value = value
    }
  }
  
  // Convert to number if needed
  const finalValue = props.type === 'number' ? Number(value) : value
  
  // Update character count
  charCount.value = value.length
  
  // Emit events
  emit('update:modelValue', finalValue)
  emit('input', finalValue)
  
  // Validate on input if enabled
  if (props.validateOnInput) {
    debouncedValidate(finalValue)
  }
}

const handleBlur = () => {
  isFocused.value = false
  emit('blur')
  
  // Validate on blur if enabled
  if (props.validateOnBlur) {
    validateInput(props.modelValue)
  }
}

const handleFocus = () => {
  isFocused.value = true
  emit('focus')
  
  // Clear errors on focus for better UX
  internalError.value = undefined
}

// Validation
const validateInput = async (value: any) => {
  if (props.disabled || props.readonly) return

  isValidating.value = true
  
  try {
    // Basic validation
    if (props.required && (!value || String(value).trim() === '')) {
      internalError.value = 'This field is required'
      emit('validated', false, internalError.value)
      return
    }
    
    // Length validation
    const stringValue = String(value || '')
    if (props.minLength && stringValue.length < props.minLength) {
      internalError.value = `Minimum length is ${props.minLength} characters`
      emit('validated', false, internalError.value)
      return
    }
    
    if (props.maxLength && stringValue.length > props.maxLength) {
      internalError.value = `Maximum length is ${props.maxLength} characters`
      emit('validated', false, internalError.value)
      return
    }
    
    // Type-specific validation
    switch (props.type) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          internalError.value = 'Please enter a valid email address'
          emit('validated', false, internalError.value)
          return
        }
        break
        
      case 'url':
        if (value && !/^https?:\/\/.+/.test(value)) {
          internalError.value = 'Please enter a valid URL'
          emit('validated', false, internalError.value)
          return
        }
        break
        
      case 'tel':
        if (value && !/^[\+]?[\d\s\-\(\)]+$/.test(value)) {
          internalError.value = 'Please enter a valid phone number'
          emit('validated', false, internalError.value)
          return
        }
        break
    }
    
    // Clear error if validation passes
    internalError.value = undefined
    emit('validated', true)
    
  } catch (error) {
    console.error('Validation error:', error)
    internalError.value = 'Validation failed'
    emit('validated', false, internalError.value)
  } finally {
    isValidating.value = false
  }
}

const debouncedValidate = (value: any) => {
  if (validationTimeout) {
    clearTimeout(validationTimeout)
  }
  
  validationTimeout = setTimeout(() => {
    validateInput(value)
  }, props.debounce)
}

// Password visibility toggle
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Auto-resize for textarea
const autoResizeTextarea = () => {
  if (props.type === 'textarea' && props.autoResize && inputRef.value) {
    const textarea = inputRef.value as HTMLTextAreaElement
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }
}

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    charCount.value = String(newValue).length
    autoResizeTextarea()
  }
})

// Initialize
onMounted(() => {
  if (props.modelValue) {
    charCount.value = String(props.modelValue).length
    autoResizeTextarea()
  }
})
</script>

<template>
  <div class="space-y-2">
    <!-- Label -->
    <div v-if="label" class="flex items-center justify-between">
      <Label 
        :for="$attrs.id || undefined"
        :class="{ 
          'text-destructive': hasError,
          'text-green-600': hasSuccess 
        }"
        class="flex items-center gap-2"
      >
        {{ label }}
        <span v-if="required" class="text-destructive">*</span>
        
        <!-- Security badge -->
        <Badge 
          v-if="isSecureField" 
          :variant="securityBadgeColor"
          class="text-xs flex items-center gap-1"
        >
          <Shield class="h-3 w-3" />
          {{ securityLevel.toUpperCase() }}
        </Badge>
      </Label>
      
      <!-- Character count -->
      <div 
        v-if="characterCountDisplay" 
        class="text-xs"
        :class="{
          'text-muted-foreground': !characterCountDisplay.isWarning,
          'text-amber-600': characterCountDisplay.isWarning && !characterCountDisplay.isError,
          'text-destructive': characterCountDisplay.isError
        }"
      >
        {{ characterCountDisplay.current }}/{{ characterCountDisplay.max }}
      </div>
    </div>

    <!-- Input container -->
    <div class="relative">
      <!-- Text Input -->
      <Input
        v-if="type !== 'textarea'"
        ref="inputRef"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxLength"
        :class="{
          'border-destructive focus:border-destructive': hasError,
          'border-green-500 focus:border-green-500': hasSuccess,
          'pr-10': type === 'password' && showPasswordToggle
        }"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      
      <!-- Textarea -->
      <Textarea
        v-else
        ref="inputRef"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxLength"
        :rows="rows"
        :class="{
          'border-destructive focus:border-destructive': hasError,
          'border-green-500 focus:border-green-500': hasSuccess,
          'resize-none': autoResize
        }"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      
      <!-- Password toggle button -->
      <button
        v-if="type === 'password' && showPasswordToggle"
        type="button"
        @click="togglePasswordVisibility"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        :disabled="disabled"
      >
        <Eye v-if="!showPassword" class="h-4 w-4" />
        <EyeOff v-else class="h-4 w-4" />
      </button>
      
      <!-- Validation indicator -->
      <div 
        v-if="hasError || hasSuccess || isValidating"
        class="absolute right-3 top-1/2 transform -translate-y-1/2"
        :class="{ 'right-10': type === 'password' && showPasswordToggle }"
      >
        <div 
          v-if="isValidating"
          class="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-primary rounded-full"
        />
        <AlertTriangle 
          v-else-if="hasError" 
          class="h-4 w-4 text-destructive" 
        />
        <CheckCircle 
          v-else-if="hasSuccess" 
          class="h-4 w-4 text-green-600" 
        />
      </div>
    </div>

    <!-- Error message -->
    <Alert v-if="errorMessage" variant="destructive" class="py-2">
      <AlertTriangle class="h-4 w-4" />
      <AlertDescription class="text-sm">
        {{ errorMessage }}
      </AlertDescription>
    </Alert>

    <!-- Success message -->
    <Alert v-else-if="success" class="py-2 border-green-200 bg-green-50">
      <CheckCircle class="h-4 w-4 text-green-600" />
      <AlertDescription class="text-sm text-green-800">
        {{ success }}
      </AlertDescription>
    </Alert>

    <!-- Hint message -->
    <div v-else-if="hint" class="flex items-start gap-2 text-xs text-muted-foreground">
      <Info class="h-3 w-3 mt-0.5 flex-shrink-0" />
      <span>{{ hint }}</span>
    </div>

    <!-- Security notice for high security fields -->
    <Alert v-if="securityLevel === 'high' && isFocused" class="py-2">
      <Lock class="h-4 w-4" />
      <AlertDescription class="text-xs">
        This field contains sensitive information and is encrypted for your security.
      </AlertDescription>
    </Alert>
  </div>
</template>

<style scoped>
.resize-none {
  resize: none;
}
</style> 