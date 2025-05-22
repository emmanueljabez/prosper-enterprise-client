<template>
  <div class="space-y-4">
    <h3 class="text-sm font-medium">Filters</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Status Filter -->
      <div>
        <Label for="status-filter">Status</Label>
        <Select
          id="status-filter"
          :model-value="status"
          @update:model-value="updateStatus"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="pending_approval">Pending Approval</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <!-- Location Filter -->
      <div>
        <Label for="location-filter">Location</Label>
        <Select
          id="location-filter"
          :model-value="location"
          @update:model-value="updateLocation"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem v-for="loc in locations" :key="loc.id" :value="loc.id">
              {{ loc.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <!-- Date Range Filter -->
      <div>
        <Label for="date-range-filter">Date Range</Label>
        <Select
          id="date-range-filter"
          :model-value="dateRange"
          @update:model-value="updateDateRange"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <!-- Active Filters -->
    <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mt-4">
      <Badge v-if="status !== 'all'" variant="outline" class="flex gap-1 items-center">
        Status: {{ formatStatus(status) }}
        <Button
          variant="ghost"
          size="icon"
          class="h-4 w-4 p-0"
          @click="updateStatus('all')"
        >
          <XIcon class="h-3 w-3" />
          <span class="sr-only">Remove filter</span>
        </Button>
      </Badge>
      
      <Badge v-if="location !== 'all'" variant="outline" class="flex gap-1 items-center">
        Location: {{ locationName }}
        <Button
          variant="ghost"
          size="icon"
          class="h-4 w-4 p-0"
          @click="updateLocation('all')"
        >
          <XIcon class="h-3 w-3" />
          <span class="sr-only">Remove filter</span>
        </Button>
      </Badge>
      
      <Badge v-if="dateRange !== 'all'" variant="outline" class="flex gap-1 items-center">
        Date: {{ formatDateRange(dateRange) }}
        <Button
          variant="ghost"
          size="icon"
          class="h-4 w-4 p-0"
          @click="updateDateRange('all')"
        >
          <XIcon class="h-3 w-3" />
          <span class="sr-only">Remove filter</span>
        </Button>
      </Badge>
      
      <Button v-if="hasActiveFilters" variant="ghost" size="sm" @click="clearAllFilters">
        Clear All Filters
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { XIcon } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  status: { type: String, default: 'all' },
  location: { type: String, default: 'all' },
  dateRange: { type: String, default: 'all' },
  locations: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:status',
  'update:location',
  'update:date-range',
  'filter-change'
])

const updateStatus = (value) => {
  emit('update:status', value)
  emit('filter-change')
}

const updateLocation = (value) => {
  emit('update:location', value)
  emit('filter-change')
}

const updateDateRange = (value) => {
  emit('update:date-range', value)
  emit('filter-change')
}

const clearAllFilters = () => {
  updateStatus('all')
  updateLocation('all')
  updateDateRange('all')
}

const hasActiveFilters = computed(() => {
  return props.status !== 'all' || props.location !== 'all' || props.dateRange !== 'all'
})

const locationName = computed(() => {
  const location = props.locations.find(loc => loc.id === props.location)
  return location ? location.name : props.location
})

function formatStatus(status) {
  if (status === 'all') return 'All'
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDateRange(range) {
  switch (range) {
    case 'today': return 'Today'
    case 'week': return 'This Week'
    case 'month': return 'This Month'
    case 'quarter': return 'This Quarter'
    case 'year': return 'This Year'
    case 'custom': return 'Custom Range'
    default: return 'All Time'
  }
}
</script>