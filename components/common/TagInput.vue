<template>
  <div class="space-y-2">
    <div 
      class="flex items-center flex-wrap gap-1 p-2 rounded-md border bg-background relative"
      :class="{
        'opacity-50': readonly,
        'border-red-500': error,
        'border-primary': focused && !readonly
      }"
    >
      <Badge
        v-for="tag in modelValue"
        :key="tag"
        variant="secondary"
        class="flex items-center"
      >
        {{ tag }}
        <button
          v-if="!readonly"
          @click.prevent="removeTag(tag)"
          class="ml-1 hover:text-destructive focus:outline-none"
        >
          <XIcon class="h-3 w-3" />
        </button>
      </Badge>

      <input
        v-if="!readonly"
        ref="inputRef"
        type="text"
        v-model="inputValue"
        :placeholder="computedPlaceholder"
        :disabled="isMaxTagsReached"
        class="flex-1 min-w-[80px] focus:outline-none bg-transparent disabled:cursor-not-allowed"
        @keydown.enter.prevent="handleEnterKey"
        @keydown.backspace="handleBackspace"
        @keydown.delete="handleDelete"
        @keydown.tab="addTag"
        @keydown.comma.prevent="addTag"
        @keydown.down="selectNextSuggestion"
        @keydown.up="selectPreviousSuggestion"
        @keydown.escape="hideSuggestions"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
      />

      <!-- Readonly display -->
      <div v-if="readonly && modelValue.length === 0" class="text-muted-foreground text-sm">
        No items selected
      </div>
    </div>

    <!-- Suggestions dropdown -->
    <div
      v-if="showSuggestions && filteredSuggestions.length > 0"
      class="relative z-10 w-full bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto"
    >
      <div
        v-for="(suggestion, index) in filteredSuggestions"
        :key="suggestion"
        @click="addSuggestion(suggestion)"
        @mouseenter="hoveredIndex = index"
        class="px-3 py-2 cursor-pointer text-sm transition-colors"
        :class="{
          'bg-primary text-primary-foreground': index === hoveredIndex,
          'hover:bg-muted': index !== hoveredIndex
        }"
      >
        {{ suggestion }}
      </div>
    </div>

    <!-- Help text / Error message -->
    <div v-if="error || helperText" class="text-sm">
      <span v-if="error" class="text-red-500">{{ error }}</span>
      <span v-else-if="helperText" class="text-muted-foreground">{{ helperText }}</span>
    </div>

    <!-- Tag count -->
    <div v-if="maxTags && !readonly" class="text-xs text-muted-foreground">
      {{ modelValue.length }}/{{ maxTags }} tags
      <span v-if="isMaxTagsReached" class="text-amber-600 ml-1">(Maximum reached)</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Badge } from '@/components/ui/badge'
import { XIcon } from 'lucide-vue-next'

interface Props {
  modelValue: string[]
  suggestions?: string[]
  placeholder?: string
  readonly?: boolean
  maxTags?: number
  allowDuplicates?: boolean
  caseSensitive?: boolean
  error?: string
  helperText?: string
}

const props = withDefaults(defineProps<Props>(), {
  suggestions: () => [],
  placeholder: 'Add tag...',
  readonly: false,
  allowDuplicates: false,
  caseSensitive: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'tag-added': [tag: string]
  'tag-removed': [tag: string]
  'focus': []
  'blur': []
}>()

// Component state
const inputValue = ref('')
const inputRef = ref<HTMLInputElement>()
const focused = ref(false)
const showSuggestions = ref(false)
const hoveredIndex = ref(-1)

// Computed properties
const computedPlaceholder = computed(() => {
  if (isMaxTagsReached.value) return 'Maximum tags reached'
  if (props.modelValue.length === 0) return props.placeholder
  return ''
})

const isMaxTagsReached = computed(() => {
  return props.maxTags ? props.modelValue.length >= props.maxTags : false
})

const filteredSuggestions = computed(() => {
  if (!inputValue.value.trim() || !props.suggestions?.length) return []
  
  const searchTerm = props.caseSensitive ? inputValue.value : inputValue.value.toLowerCase()
  
  return props.suggestions.filter(suggestion => {
    const suggestionText = props.caseSensitive ? suggestion : suggestion.toLowerCase()
    const isMatch = suggestionText.includes(searchTerm)
    const isNotSelected = !props.modelValue.some(tag => 
      props.caseSensitive ? tag === suggestion : tag.toLowerCase() === suggestion.toLowerCase()
    )
    return isMatch && isNotSelected
  }).slice(0, 10) // Limit to 10 suggestions
})

// Tag management
function addTag(value?: string) {
  const tagValue = (value || inputValue.value).trim()
  
  if (!tagValue) return
  if (isMaxTagsReached.value) return
  
  // Check for duplicates
  if (!props.allowDuplicates) {
    const exists = props.modelValue.some(tag => 
      props.caseSensitive ? tag === tagValue : tag.toLowerCase() === tagValue.toLowerCase()
    )
    if (exists) {
      inputValue.value = ''
      return
    }
  }
  
  const newTags = [...props.modelValue, tagValue]
  emit('update:modelValue', newTags)
  emit('tag-added', tagValue)
  
  inputValue.value = ''
  hideSuggestions()
  
  // Focus back to input if not at max
  if (!isMaxTagsReached.value) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

function addSuggestion(suggestion: string) {
  addTag(suggestion)
}

function removeTag(tag: string) {
  const newTags = props.modelValue.filter(t => t !== tag)
  emit('update:modelValue', newTags)
  emit('tag-removed', tag)
  
  // Focus back to input
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// Keyboard navigation
function handleBackspace(e: KeyboardEvent) {
  if (inputValue.value === '' && props.modelValue.length > 0) {
    const newTags = [...props.modelValue]
    const removedTag = newTags.pop()
    emit('update:modelValue', newTags)
    if (removedTag) {
      emit('tag-removed', removedTag)
    }
  }
}

function handleDelete(e: KeyboardEvent) {
  if (inputValue.value === '' && props.modelValue.length > 0) {
    const newTags = [...props.modelValue]
    const removedTag = newTags.pop()
    emit('update:modelValue', newTags)
    if (removedTag) {
      emit('tag-removed', removedTag)
    }
  }
}

function selectNextSuggestion(e: KeyboardEvent) {
  e.preventDefault()
  if (!showSuggestions.value) return
  
  hoveredIndex.value = Math.min(hoveredIndex.value + 1, filteredSuggestions.value.length - 1)
}

function selectPreviousSuggestion(e: KeyboardEvent) {
  e.preventDefault()
  if (!showSuggestions.value) return
  
  hoveredIndex.value = Math.max(hoveredIndex.value - 1, -1)
}

// Focus management
function handleFocus() {
  focused.value = true
  emit('focus')
  if (filteredSuggestions.value.length > 0) {
    showSuggestions.value = true
  }
}

function handleBlur() {
  focused.value = false
  emit('blur')
  
  // Delay hiding suggestions to allow click events
  setTimeout(() => {
    showSuggestions.value = false
    hoveredIndex.value = -1
    
    // Add current input as tag if it has value
    if (inputValue.value.trim()) {
      addTag()
    }
  }, 150)
}

function handleInput() {
  if (filteredSuggestions.value.length > 0) {
    showSuggestions.value = true
    hoveredIndex.value = -1
  } else {
    showSuggestions.value = false
  }
}

function hideSuggestions() {
  showSuggestions.value = false
  hoveredIndex.value = -1
}

// Watch for Enter key on hovered suggestion
watch(hoveredIndex, (newIndex) => {
  if (newIndex >= 0 && filteredSuggestions.value[newIndex]) {
    // Handle Enter key for suggestion selection in parent component
  }
})

// Handle Enter key when suggestion is hovered
function handleEnterKey() {
  if (hoveredIndex.value >= 0 && filteredSuggestions.value[hoveredIndex.value]) {
    addSuggestion(filteredSuggestions.value[hoveredIndex.value])
  } else {
    addTag()
  }
}
</script>