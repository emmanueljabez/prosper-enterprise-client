<template>
  <Card>
    <CardContent class="p-6">
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">Filter Controls</h3>
          <div class="flex space-x-2">
            <Button variant="outline" size="sm" @click="resetAll">
              <RotateCcwIcon class="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button size="sm" @click="applyFilters">
              <FilterIcon class="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Location Filter -->
          <div class="space-y-2">
            <Label for="location-filter">Location</Label>
            <Select
              v-model="localSelectedLocation"
              @update:modelValue="updateLocation"
            >
              <SelectTrigger id="location-filter">
                <SelectValue :placeholder="localSelectedLocation?.name || 'All Locations'" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">All Locations</SelectItem>
                <SelectItem
                  v-for="location in locations"
                  :key="location.id"
                  :value="location"
                >
                  {{ location.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Date Range Filter -->
          <div class="space-y-2">
            <Label for="date-range">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-range"
                  variant="outline"
                  class="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon class="h-4 w-4 mr-2" />
                  {{ formatDateRange }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0" align="start">
                <Calendar
                  v-model="localDateRange"
                  mode="range"
                  :disabled-dates="disabledDates"
                  class="border-0"
                  @update:model-value="updateDateRange"
                />
              </PopoverContent>
            </Popover>
          </div>

          <!-- Transaction Types Filter -->
          <div class="space-y-2">
            <Label for="transaction-types">Transaction Types</Label>
            <div class="border rounded-md p-3 space-y-2">
              <div class="flex items-center space-x-2" v-for="type in transactionTypes" :key="type.value">
                <Checkbox
                  :id="`type-${type.value}`"
                  :checked="localTransactionTypes.includes(type.value)"
                  @update:checked="toggleTransactionType(type.value)"
                />
                <Label :for="`type-${type.value}`" class="text-sm">{{ type.label }}</Label>
              </div>
            </div>
          </div>

          <!-- Visualization Type -->
          <div class="space-y-2">
            <Label for="visualization-type">Visualization Type</Label>
            <Select
              v-model="localVisualizationType"
              @update:modelValue="updateVisualizationType"
            >
              <SelectTrigger id="visualization-type">
                <SelectValue :placeholder="getVisualizationTypeLabel(localVisualizationType)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timeline">Timeline Chart</SelectItem>
                <SelectItem value="flowchart">Flow Diagram</SelectItem>
                <SelectItem value="heatmap">Heatmap View</SelectItem>
                <SelectItem value="sankey">Sankey Diagram</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Additional Filters (collapsed by default) -->
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" class="flex items-center w-full justify-center border-t pt-2">
              <span class="text-sm mr-1">Advanced Filters</span>
              <ChevronDownIcon class="h-4 w-4" :class="{ 'transform rotate-180': isAdvancedOpen }" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <!-- Stock Level Filter -->
              <div class="space-y-2">
                <Label for="stock-level">Stock Level</Label>
                <Select v-model="stockLevelFilter">
                  <SelectTrigger id="stock-level">
                    <SelectValue placeholder="All Stock Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock Levels</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="critical_stock">Critical Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="overstock">Overstock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Category Filter -->
              <div class="space-y-2">
                <Label for="category">Category</Label>
                <Select v-model="categoryFilter">
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="cat-001">Tools</SelectItem>
                    <SelectItem value="cat-002">Customer Premise Equipment</SelectItem>
                    <SelectItem value="cat-003">Network Termination</SelectItem>
                    <SelectItem value="cat-004">Cabling</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Time Granularity -->
              <div class="space-y-2">
                <Label for="time-granularity">Time Granularity</Label>
                <Select v-model="timeGranularity">
                  <SelectTrigger id="time-granularity">
                    <SelectValue placeholder="Select granularity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="quarter">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import { 
  FilterIcon, CalendarIcon, RotateCcwIcon,
  ChevronDownIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const props = defineProps({
  locations: {
    type: Array,
    default: () => []
  },
  selectedLocation: {
    type: Object,
    default: null
  },
  selectedDateRange: {
    type: Object,
    default: () => ({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    })
  },
  selectedTransactionTypes: {
    type: Array,
    default: () => ['receipt', 'issue', 'adjustment', 'transfer']
  },
  stockVisualizationType: {
    type: String,
    default: 'timeline'
  }
})

const emit = defineEmits([
  'update-location',
  'update-date-range',
  'update-transaction-types',
  'update-visualization-type',
  'apply-filters',
  'reset-filters'
])

// Local state
const localSelectedLocation = ref(props.selectedLocation)
const localDateRange = ref({
  from: props.selectedDateRange.start,
  to: props.selectedDateRange.end
})
const localTransactionTypes = ref([...props.selectedTransactionTypes])
const localVisualizationType = ref(props.stockVisualizationType)
const isAdvancedOpen = ref(false)

// Advanced filters
const stockLevelFilter = ref('all')
const categoryFilter = ref('all')
const timeGranularity = ref('day')

// Transaction types options
const transactionTypes = [
  { value: 'receipt', label: 'Receipts' },
  { value: 'issue', label: 'Issues' },
  { value: 'adjustment', label: 'Adjustments' },
  { value: 'transfer', label: 'Transfers' }
]

// Computed properties
const formatDateRange = computed(() => {
  if (!localDateRange.value.from) return 'Select date range'
  
  const fromDate = format(localDateRange.value.from, 'PPP')
  const toDate = localDateRange.value.to 
    ? format(localDateRange.value.to, 'PPP')
    : 'Present'
    
  return `${fromDate} - ${toDate}`
})

const disabledDates = {
  after: new Date()
}

// Methods
function updateLocation(location) {
  emit('update-location', location)
}

function updateDateRange(range) {
  const dateRange = {
    start: range.from,
    end: range.to
  }
  emit('update-date-range', dateRange)
}

function toggleTransactionType(type) {
  const index = localTransactionTypes.value.indexOf(type)
  if (index === -1) {
    localTransactionTypes.value.push(type)
  } else {
    localTransactionTypes.value.splice(index, 1)
  }
  emit('update-transaction-types', localTransactionTypes.value)
}

function updateVisualizationType(type) {
  emit('update-visualization-type', type)
}

function getVisualizationTypeLabel(type) {
  const types = {
    timeline: 'Timeline Chart',
    flowchart: 'Flow Diagram',
    heatmap: 'Heatmap View',
    sankey: 'Sankey Diagram'
  }
  return types[type] || 'Select visualization type'
}

function applyFilters() {
  emit('apply-filters')
}

function resetAll() {
  localSelectedLocation.value = null
  localDateRange.value = {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  }
  localTransactionTypes.value = ['receipt', 'issue', 'adjustment', 'transfer']
  localVisualizationType.value = 'timeline'
  stockLevelFilter.value = 'all'
  categoryFilter.value = 'all'
  timeGranularity.value = 'day'
  
  // Emit all the reset values
  emit('update-location', null)
  emit('update-date-range', { 
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
    end: new Date() 
  })
  emit('update-transaction-types', ['receipt', 'issue', 'adjustment', 'transfer'])
  emit('update-visualization-type', 'timeline')
  emit('reset-filters')
}

// Watch for prop changes
watch(() => props.selectedLocation, (newValue) => {
  localSelectedLocation.value = newValue
})

watch(() => props.selectedDateRange, (newValue) => {
  localDateRange.value = {
    from: newValue.start,
    to: newValue.end
  }
})

watch(() => props.selectedTransactionTypes, (newValue) => {
  localTransactionTypes.value = [...newValue]
})

watch(() => props.stockVisualizationType, (newValue) => {
  localVisualizationType.value = newValue
})
</script>