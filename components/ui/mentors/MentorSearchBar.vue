<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useMentorsStore } from '@/store/modules/mentors'

// UI Components
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Icons
import { 
  Search, 
  X, 
  Loader2, 
  Clock, 
  TrendingUp,
  Users,
  Target,
  ArrowRight
} from 'lucide-vue-next'

interface Props {
  modelValue: string
  isSearching?: boolean
  placeholder?: string
  showSuggestions?: boolean
  showHistory?: boolean
  maxSuggestions?: number
}

const props = withDefaults(defineProps<Props>(), {
  isSearching: false,
  placeholder: 'Search for mentors, skills, or expertise...',
  showSuggestions: true,
  showHistory: true,
  maxSuggestions: 8
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
  'clear': []
  'suggestion-click': [suggestion: string]
}>()

// Store
const mentorsStore = useMentorsStore()

// Component state
const inputRef = ref<HTMLInputElement>()
const showDropdown = ref(false)
const suggestions = ref<string[]>([])
const isLoadingSuggestions = ref(false)
const selectedSuggestionIndex = ref(-1)
const searchTimeout = ref<NodeJS.Timeout>()

// Computed properties
const localValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const hasSuggestions = computed(() => 
  props.showSuggestions && suggestions.value.length > 0
)

const hasHistory = computed(() => 
  props.showHistory && mentorsStore.state.searchHistory.length > 0
)

const showDropdownMenu = computed(() => 
  showDropdown.value && (hasSuggestions.value || hasHistory.value || localValue.value.length > 0)
)

const filteredSuggestions = computed(() => 
  suggestions.value.slice(0, props.maxSuggestions)
)

const recentSearches = computed(() => 
  mentorsStore.state.searchHistory.slice(0, 5)
)

// Popular searches (could be loaded from API)
const popularSearches = [
  'Frontend Development',
  'Product Management',
  'Data Science',
  'UX Design',
  'Engineering Leadership',
  'Career Transition',
  'Startup Strategy',
  'Technical Interview'
]

// Utility functions
const highlightMatch = (text: string, query: string): string => {
  if (!query.trim()) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-800 px-0.5 rounded">$1</mark>')
}

// Event handlers
const handleInput = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  localValue.value = value
  
  // Clear previous timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  // Show dropdown when typing
  if (value.length > 0) {
    showDropdown.value = true
    await loadSuggestions(value)
  } else {
    showDropdown.value = true // Show history and popular searches
    suggestions.value = []
  }
  
  // Reset selection
  selectedSuggestionIndex.value = -1
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!showDropdownMenu.value) {
    if (event.key === 'Enter') {
      handleSearch()
    }
    return
  }

  const totalItems = getTotalDropdownItems()

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedSuggestionIndex.value = Math.min(
        selectedSuggestionIndex.value + 1,
        totalItems - 1
      )
      break
    
    case 'ArrowUp':
      event.preventDefault()
      selectedSuggestionIndex.value = Math.max(
        selectedSuggestionIndex.value - 1,
        -1
      )
      break
    
    case 'Enter':
      event.preventDefault()
      if (selectedSuggestionIndex.value >= 0) {
        const selectedItem = getSelectedItem()
        if (selectedItem) {
          selectSuggestion(selectedItem)
        }
      } else {
        handleSearch()
      }
      break
    
    case 'Escape':
      event.preventDefault()
      hideDropdown()
      break
  }
}

const handleFocus = () => {
  showDropdown.value = true
  if (localValue.value.length > 0) {
    loadSuggestions(localValue.value)
  }
}

const handleBlur = () => {
  // Delay hiding to allow clicks on dropdown items
  setTimeout(() => {
    showDropdown.value = false
    selectedSuggestionIndex.value = -1
  }, 150)
}

const handleSearch = () => {
  if (localValue.value.trim()) {
    emit('search', localValue.value.trim())
    hideDropdown()
  }
}

const handleClear = () => {
  localValue.value = ''
  suggestions.value = []
  selectedSuggestionIndex.value = -1
  emit('clear')
  inputRef.value?.focus()
}

const selectSuggestion = (suggestion: string) => {
  localValue.value = suggestion
  emit('suggestion-click', suggestion)
  emit('search', suggestion)
  hideDropdown()
}

const hideDropdown = () => {
  showDropdown.value = false
  selectedSuggestionIndex.value = -1
}

// Helper functions
const loadSuggestions = async (query: string) => {
  if (query.length < 2) {
    suggestions.value = []
    return
  }

  isLoadingSuggestions.value = true

  try {
    const results = await mentorsStore.getSearchSuggestions(query)
    suggestions.value = results
  } catch (error) {
    console.error('Error loading suggestions:', error)
    suggestions.value = []
  } finally {
    isLoadingSuggestions.value = false
  }
}

const getTotalDropdownItems = (): number => {
  let total = 0
  
  if (localValue.value.length === 0) {
    // Show recent and popular searches
    total += recentSearches.value.length
    total += popularSearches.length
  } else {
    // Show suggestions
    total += filteredSuggestions.value.length
  }
  
  return total
}

const getSelectedItem = (): string | null => {
  const index = selectedSuggestionIndex.value
  
  if (localValue.value.length === 0) {
    // Recent searches first, then popular
    if (index < recentSearches.value.length) {
      return recentSearches.value[index]
    } else {
      const popularIndex = index - recentSearches.value.length
      return popularSearches[popularIndex] || null
    }
  } else {
    // Suggestions
    return filteredSuggestions.value[index] || null
  }
}

// Focus management
const focusInput = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// Lifecycle
onMounted(() => {
  // Load initial popular suggestions if no value
  if (!localValue.value) {
    suggestions.value = popularSearches.slice(0, 4)
  }
})

// Expose focus method
defineExpose({
  focus: focusInput
})
</script>

<template>
  <div class="relative w-full">
    <!-- Search Input -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      
      <Input
        ref="inputRef"
        v-model="localValue"
        :placeholder="placeholder"
        class="pl-10 pr-20 h-12 text-base"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
        <!-- Loading Spinner -->
        <Loader2 
          v-if="isSearching || isLoadingSuggestions" 
          class="h-4 w-4 animate-spin text-muted-foreground" 
        />
        
        <!-- Clear Button -->
        <Button
          v-if="localValue && !isSearching"
          variant="ghost"
          size="sm"
          class="h-8 w-8 p-0"
          @click="handleClear"
        >
          <X class="h-4 w-4" />
        </Button>

        <!-- Search Button -->
        <Button
          size="sm"
          :disabled="!localValue.trim() || isSearching"
          @click="handleSearch"
        >
          <Search class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Dropdown Menu -->
    <Card 
      v-if="showDropdownMenu"
      class="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto"
    >
      <CardContent class="p-0">
        <!-- Current Search Action -->
        <div 
          v-if="localValue.trim()"
          class="px-4 py-3 hover:bg-muted cursor-pointer border-b"
          :class="{ 'bg-muted': selectedSuggestionIndex === -1 }"
          @click="handleSearch"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <Search class="h-4 w-4 text-muted-foreground" />
              <span>Search for "{{ localValue }}"</span>
            </div>
            <ArrowRight class="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <!-- No Input State - Show Recent and Popular -->
        <template v-if="localValue.length === 0">
          <!-- Recent Searches -->
          <div v-if="hasHistory">
            <div class="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
              <Clock class="h-3 w-3 inline mr-1" />
              Recent Searches
            </div>
            <div
              v-for="(search, index) in recentSearches"
              :key="`recent-${index}`"
              class="px-4 py-3 hover:bg-muted cursor-pointer flex items-center justify-between"
              :class="{ 'bg-muted': selectedSuggestionIndex === index }"
              @click="selectSuggestion(search)"
            >
              <div class="flex items-center space-x-3">
                <Clock class="h-4 w-4 text-muted-foreground" />
                <span>{{ search }}</span>
              </div>
            </div>
            <Separator />
          </div>

          <!-- Popular Searches -->
          <div>
            <div class="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
              <TrendingUp class="h-3 w-3 inline mr-1" />
              Popular Searches
            </div>
            <div
              v-for="(search, index) in popularSearches"
              :key="`popular-${index}`"
              class="px-4 py-3 hover:bg-muted cursor-pointer flex items-center justify-between"
              :class="{ 
                'bg-muted': selectedSuggestionIndex === (recentSearches.length + index) 
              }"
              @click="selectSuggestion(search)"
            >
              <div class="flex items-center space-x-3">
                <TrendingUp class="h-4 w-4 text-muted-foreground" />
                <span>{{ search }}</span>
              </div>
              <Badge variant="secondary" class="text-xs">Popular</Badge>
            </div>
          </div>
        </template>

        <!-- Has Input - Show Suggestions -->
        <template v-else>
          <!-- Suggestions -->
          <div v-if="hasSuggestions">
            <div class="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
              <Target class="h-3 w-3 inline mr-1" />
              Suggestions
            </div>
            <div
              v-for="(suggestion, index) in filteredSuggestions"
              :key="`suggestion-${index}`"
              class="px-4 py-3 hover:bg-muted cursor-pointer flex items-center justify-between"
              :class="{ 'bg-muted': selectedSuggestionIndex === index }"
              @click="selectSuggestion(suggestion)"
            >
              <div class="flex items-center space-x-3">
                <Search class="h-4 w-4 text-muted-foreground" />
                <span v-html="highlightMatch(suggestion, localValue)"></span>
              </div>
            </div>
          </div>

          <!-- No Suggestions -->
          <div 
            v-else-if="!isLoadingSuggestions && localValue.length >= 2"
            class="px-4 py-6 text-center text-muted-foreground"
          >
            <Users class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">No suggestions found</p>
            <p class="text-xs">Try a different search term</p>
          </div>

          <!-- Loading Suggestions -->
          <div 
            v-else-if="isLoadingSuggestions"
            class="px-4 py-6 text-center"
          >
            <Loader2 class="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
mark {
  background-color: rgb(254 240 138);
  color: rgb(133 77 14);
  padding: 0.125rem;
  border-radius: 0.25rem;
}
</style> 