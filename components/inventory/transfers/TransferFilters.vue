<template>
  <div class="rounded-lg border bg-card">
    <div class="p-6">
      <h3 class="text-lg font-medium mb-4">Filter Transfers</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="space-y-2">
          <Label for="statusFilter">Status</Label>
          <Select :modelValue="status" @update:modelValue="updateStatus">
            <SelectTrigger id="statusFilter">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="awaiting_receipt">Awaiting Receipt</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="fromLocationFilter">From Location</Label>
          <Select :modelValue="fromLocation" @update:modelValue="updateFromLocation">
            <SelectTrigger id="fromLocationFilter">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectGroup v-for="group in locationGroups" :key="group.type">
                <SelectLabel>{{ formatLocationType(group.type) }}</SelectLabel>
                <SelectItem 
                  v-for="location in group.locations" 
                  :key="location.id" 
                  :value="location.id"
                >
                  {{ location.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div class="space-y-2">
          <Label for="toLocationFilter">To Location</Label>
          <Select :modelValue="toLocation" @update:modelValue="updateToLocation">
            <SelectTrigger id="toLocationFilter">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectGroup v-for="group in locationGroups" :key="group.type">
                <SelectLabel>{{ formatLocationType(group.type) }}</SelectLabel>
                <SelectItem 
                  v-for="location in group.locations" 
                  :key="location.id" 
                  :value="location.id"
                >
                  {{ location.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="dateRangeFilter">Date Range</Label>
          <Select :modelValue="dateRange" @update:modelValue="updateDateRange">
            <SelectTrigger id="dateRangeFilter">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div v-if="dateRange === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div class="space-y-2">
          <Label for="startDate">Start Date</Label>
          <Input
            id="startDate"
            v-model="customDateRange.start"
            type="date"
            @change="handleCustomDateChange"
          />
        </div>
        <div class="space-y-2">
          <Label for="endDate">End Date</Label>
          <Input
            id="endDate"
            v-model="customDateRange.end"
            type="date"
            @change="handleCustomDateChange"
          />
        </div>
      </div>
      
      <div class="flex justify-end mt-4 space-x-2">
        <Button variant="outline" @click="resetFilters">
          <RefreshCwIcon class="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
        <Button @click="applyFilters">
          <FilterIcon class="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FilterIcon, RefreshCwIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  status: { type: String, default: 'all' },
  fromLocation: { type: String, default: 'all' },
  toLocation: { type: String, default: 'all' },
  dateRange: { type: String, default: 'all' },
  locations: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:status', 'update:from-location', 'update:to-location', 'update:date-range', 'filter-change'])

const customDateRange = ref({
  start: '',
  end: ''
})

// Group locations by type
const locationGroups = computed(() => {
  const groups = {}

  props.locations.forEach(location => {
    if (!groups[location.type]) {
      groups[location.type] = {
        type: location.type,
        locations: []
      }
    }
    groups[location.type].locations.push(location)
  })

  return Object.values(groups)
})

// Update methods for v-model binding
const updateStatus = (value) => {
  emit('update:status', value)
}

const updateFromLocation = (value) => {
  emit('update:from-location', value)
}

const updateToLocation = (value) => {
  emit('update:to-location', value)
}

const updateDateRange = (value) => {
  emit('update:date-range', value)
}

const handleCustomDateChange = () => {
  if (customDateRange.value.start && customDateRange.value.end) {
    // Could emit custom date values in the future
    // For now just letting the parent know filters changed
    applyFilters()
  }
}

const formatLocationType = (type) => {
  if (!type) return 'Unknown'
  
  // Format type from snake_case or kebab-case to Title Case
  return type
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const applyFilters = () => {
  emit('filter-change')
}

const resetFilters = () => {
  emit('update:status', 'all')
  emit('update:from-location', 'all')
  emit('update:to-location', 'all')
  emit('update:date-range', 'all')
  customDateRange.value = { start: '', end: '' }
  
  // Trigger a filter after reset
  setTimeout(() => {
    emit('filter-change')
  }, 0)
}
</script>