<template>
  <div class="space-y-4">
    <!-- Category Tabs - FIXED for dynamic icons -->
    <div class="border-b">
      <div class="flex space-x-2 overflow-x-auto hide-scrollbar">
        <Button 
          v-for="category in categories" 
          :key="category.value"
          variant="ghost"
          :class="[
            'px-4 py-2 rounded-none border-b-2 transition-colors',
            selectedCategory === category.value 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          ]"
          @click="handleCategoryChange(category.value)"
        >
          <component 
            :is="getComponentForIcon(category.icon)" 
            v-if="category.icon" 
            class="h-4 w-4 mr-2" 
          />
          {{ category.label }}
          <Badge 
            v-if="category.count" 
            variant="outline" 
            class="ml-2"
          >
            {{ category.count }}
          </Badge>
        </Button>
      </div>
    </div>

    <!-- Search and Filters Bar -->
    <div class="flex flex-col sm:flex-row justify-between gap-3">
      <div class="relative w-full sm:w-80">
        <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          class="w-full pl-9"
          placeholder="Search products..."
          type="search"
          @input="handleSearchChange"
        />
      </div>

      <div class="flex gap-2 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" class="h-10">
              <SlidersIcon class="h-4 w-4 mr-2" />
              Filters
              <Badge v-if="activeFiltersCount > 0" variant="secondary" class="ml-2">
                {{ activeFiltersCount }}
              </Badge>
              <ChevronDownIcon class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-[280px]">
            <DropdownMenuLabel>Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <!-- Status Filter -->
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <BadgeCheckIcon class="h-4 w-4 mr-2" />
                Status
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  v-for="status in statusOptions"
                  :key="status.value"
                  :checked="selectedStatuses.includes(status.value)"
                  @select="toggleStatusFilter(status.value)"
                >
                  {{ status.label }}
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <!-- Price Range Filter (in dollars for display) -->
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <DollarSignIcon class="h-4 w-4 mr-2" />
                Price Range
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent class="p-4">
                <div class="space-y-4">
                  <div class="flex gap-2 items-center">
                    <Input
                      v-model="priceRange.min"
                      type="number"
                      placeholder="Min"
                      class="h-8"
                    />
                    <span>to</span>
                    <Input
                      v-model="priceRange.max"
                      type="number"
                      placeholder="Max"
                      class="h-8"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    class="w-full" 
                    @click="applyPriceRange"
                  >
                    Apply
                  </Button>
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <DropdownMenuSeparator />
            <Button 
              variant="ghost" 
              class="w-full justify-start text-destructive" 
              size="sm"
              @click="clearAllFilters"
            >
              <XIcon class="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" class="h-10" @click="toggleViewMode">
          <GridIcon v-if="viewMode === 'list'" class="h-4 w-4" />
          <ListIcon v-else class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="activeFiltersCount > 0" class="flex flex-wrap items-center gap-2">
      <span class="text-sm text-muted-foreground">Active filters:</span>
      
      <!-- Category Filter -->
      <Badge 
        v-if="selectedCategory !== 'all'" 
        variant="secondary" 
        class="flex items-center gap-1"
      >
        Category: {{ getCategoryLabel(selectedCategory) }}
        <XCircleIcon 
          class="h-3.5 w-3.5 ml-1 cursor-pointer" 
          @click="handleCategoryChange('all')" 
        />
      </Badge>
      
      <!-- Search Query Filter -->
      <Badge 
        v-if="searchQuery" 
        variant="secondary" 
        class="flex items-center gap-1"
      >
        Search: {{ searchQuery }}
        <XCircleIcon 
          class="h-3.5 w-3.5 ml-1 cursor-pointer" 
          @click="clearSearch" 
        />
      </Badge>
      
      <!-- Status Filters -->
      <Badge 
        v-for="status in selectedStatuses" 
        :key="status" 
        variant="secondary" 
        class="flex items-center gap-1"
      >
        Status: {{ getStatusLabel(status) }}
        <XCircleIcon 
          class="h-3.5 w-3.5 ml-1 cursor-pointer" 
          @click="toggleStatusFilter(status)" 
        />
      </Badge>
      
      <!-- Price Range Filter -->
      <Badge 
        v-if="isActivePriceFilter" 
        variant="secondary" 
        class="flex items-center gap-1"
      >
        Price: {{ formatCurrencyWithSymbol(appliedPriceRange.min) }} - {{ formatCurrencyWithSymbol(appliedPriceRange.max) }}
        <XCircleIcon 
          class="h-3.5 w-3.5 ml-1 cursor-pointer" 
          @click="clearPriceFilter" 
        />
      </Badge>
      
      <Button variant="ghost" size="sm" class="h-8 px-2" @click="clearAllFilters">
        Clear all
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  SearchIcon, 
  FilterIcon, 
  XIcon, 
  ChevronDownIcon,
  BadgeCheckIcon,
  DollarSignIcon,
  XCircleIcon,
  GridIcon,
  ListIcon,
  SlidersIcon,
  WifiIcon,
  TvIcon,
  PhoneIcon,
  PackageIcon,
  RouterIcon,
  LayersIcon
} from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'

// Component registry for dynamic icons
// FIXED: Renamed to camelCase for consistency
const dynamicComponents = {
  WifiIcon,
  TvIcon,
  PhoneIcon,
  PackageIcon,
  RouterIcon,
  LayersIcon
}

// ADDED: Helper function to get the actual component from string name
const getComponentForIcon = (iconName) => {
  return dynamicComponents[iconName]
}

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      category: 'all',
      search: '',
      statuses: [],
      priceRange: { min: null, max: null },
      viewMode: 'list'
    })
  },
  categories: {
    type: Array,
    default: () => [
      { label: 'All Products', value: 'all', icon: 'LayersIcon' },
      { label: 'Internet', value: 'INTERNET_SERVICE', icon: 'WifiIcon' },
      { label: 'TV & Streaming', value: 'TV_SERVICE', icon: 'TvIcon' },
      { label: 'Phone', value: 'PHONE_SERVICE', icon: 'PhoneIcon' },
      { label: 'Hardware', value: 'HARDWARE', icon: 'RouterIcon' },
      { label: 'Bundles', value: 'BUNDLE', icon: 'PackageIcon' }
    ]
  },
  statusOptions: {
    type: Array,
    default: () => [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Draft', value: 'DRAFT' },
      { label: 'Archived', value: 'ARCHIVED' }
    ]
  },
  currency: {
    type: String,
    default: 'KES'
  }
})

// Emits definition
const emit = defineEmits(['update:modelValue', 'filter-change'])

// Local state
const selectedCategory = ref(props.modelValue.category)
const searchQuery = ref(props.modelValue.search)
const selectedStatuses = ref(props.modelValue.statuses || [])
const viewMode = ref(props.modelValue.viewMode || 'list')
const priceRange = ref({
  min: props.modelValue.priceRange?.min ? props.modelValue.priceRange.min / 100 : null,
  max: props.modelValue.priceRange?.max ? props.modelValue.priceRange.max / 100 : null
})
const appliedPriceRange = ref({
  min: props.modelValue.priceRange?.min ? props.modelValue.priceRange.min / 100 : null,
  max: props.modelValue.priceRange?.max ? props.modelValue.priceRange.max / 100 : null
})

// Computed properties
const activeFiltersCount = computed(() => {
  let count = 0
  if (selectedCategory.value !== 'all') count++
  if (searchQuery.value) count++
  count += selectedStatuses.value.length
  if (isActivePriceFilter.value) count++
  return count
})

const isActivePriceFilter = computed(() => {
  return appliedPriceRange.value.min !== null || appliedPriceRange.value.max !== null
})

// Helper methods
const getCategoryLabel = (value) => {
  const category = props.categories.find(cat => cat.value === value)
  return category ? category.label : value
}

const getStatusLabel = (value) => {
  const status = props.statusOptions.find(status => status.value === value)
  return status ? status.label : formatProductType(value)
}

const formatProductType = (type) => {
  if (!type) return 'Unknown';
  
  // Convert SNAKE_CASE to Title Case with spaces
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}

const formatCurrencyValue = (value) => {
  if (value === null || value === undefined) return '-';
  return value.toFixed(2);
}

const formatCurrencyWithSymbol = (value) => {
  if (value === null || value === undefined) return '-';
  
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    KES: 'KSh',
  };
  
  const symbol = currencySymbols[props.currency] || props.currency;
  return `${symbol} ${formatCurrencyValue(value)}`;
}

// Event handlers
const handleCategoryChange = (category) => {
  selectedCategory.value = category
  emitFilterChange()
}

const handleSearchChange = () => {
  emitFilterChange()
}

const toggleStatusFilter = (status) => {
  if (selectedStatuses.value.includes(status)) {
    selectedStatuses.value = selectedStatuses.value.filter(s => s !== status)
  } else {
    selectedStatuses.value.push(status)
  }
  emitFilterChange()
}

const applyPriceRange = () => {
  appliedPriceRange.value = { ...priceRange.value }
  emitFilterChange()
}

const clearPriceFilter = () => {
  priceRange.value = { min: null, max: null }
  appliedPriceRange.value = { min: null, max: null }
  emitFilterChange()
}

const clearSearch = () => {
  searchQuery.value = ''
  emitFilterChange()
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list'
  emitFilterChange()
}

const clearAllFilters = () => {
  selectedCategory.value = 'all'
  searchQuery.value = ''
  selectedStatuses.value = []
  priceRange.value = { min: null, max: null }
  appliedPriceRange.value = { min: null, max: null }
  emitFilterChange()
}

// Emit the combined filter state
// FIXED: Added error handling and explicit null checks
const emitFilterChange = () => {
  try {
    const filterState = {
      category: selectedCategory.value,
      search: searchQuery.value,
      statuses: [...selectedStatuses.value],
      priceRange: { 
        min: appliedPriceRange.value.min !== null ? Math.round(appliedPriceRange.value.min * 100) : null,
        max: appliedPriceRange.value.max !== null ? Math.round(appliedPriceRange.value.max * 100) : null
      },
      viewMode: viewMode.value
    }
    
    emit('update:modelValue', filterState)
    emit('filter-change', filterState)
  } catch (error) {
    console.error('Error emitting filter change:', error)
  }
}

// Watch for external changes to modelValue
// FIXED: Added null check and fallback values
watch(() => props.modelValue, (newValue) => {
  if (!newValue) return;
  
  selectedCategory.value = newValue.category || 'all'
  searchQuery.value = newValue.search || ''
  selectedStatuses.value = newValue.statuses || []
  
  // Convert cents to dollars for UI display with proper null checks
  appliedPriceRange.value = {
    min: newValue.priceRange?.min ? newValue.priceRange.min / 100 : null,
    max: newValue.priceRange?.max ? newValue.priceRange.max / 100 : null
  }
  priceRange.value = { ...appliedPriceRange.value }
  viewMode.value = newValue.viewMode || 'list'
}, { deep: true })
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>