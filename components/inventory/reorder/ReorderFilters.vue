<template>
  <div class="rounded-lg border bg-card">
    <div class="p-6">
      <h3 class="text-lg font-medium mb-4">Filter Reorder Rules</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="space-y-2">
          <Label for="statusFilter">Status</Label>
          <Select :modelValue="status" @update:modelValue="updateStatus">
            <SelectTrigger id="statusFilter">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="locationFilter">Location</Label>
          <Select :modelValue="location" @update:modelValue="updateLocation">
            <SelectTrigger id="locationFilter">
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
          <Label for="categoryFilter">Category</Label>
          <Select :modelValue="category" @update:modelValue="updateCategory">
            <SelectTrigger id="categoryFilter">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectGroup v-if="categoryGroups.length > 0">
                <SelectItem 
                  v-for="cat in categoryGroups" 
                  :key="cat.id" 
                  :value="cat.id"
                >
                  {{ cat.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="thresholdTypeFilter">Threshold Type</Label>
          <Select :modelValue="thresholdType" @update:modelValue="updateThresholdType">
            <SelectTrigger id="thresholdTypeFilter">
              <SelectValue placeholder="Select threshold type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="absolute">Absolute Value</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="dynamic">Dynamic</SelectItem>
            </SelectContent>
          </Select>
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
  location: { type: String, default: 'all' },
  category: { type: String, default: 'all' },
  thresholdType: { type: String, default: 'all' },
  locations: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:status', 
  'update:location', 
  'update:category', 
  'update:threshold-type', 
  'filter-change'
])

// Group locations by type for the dropdown
const locationGroups = computed(() => {
  const groups = {}
  
  props.locations.forEach(location => {
    const type = location.type || 'other'
    if (!groups[type]) {
      groups[type] = {
        type,
        locations: []
      }
    }
    groups[type].locations.push(location)
  })
  
  return Object.values(groups)
})

// Process categories for the dropdown
const categoryGroups = computed(() => {
  return props.categories.map(category => ({
    id: category.id,
    name: category.name
  }))
})

// Update methods for v-model binding
const updateStatus = (value) => {
  emit('update:status', value)
}

const updateLocation = (value) => {
  emit('update:location', value)
}

const updateCategory = (value) => {
  emit('update:category', value)
}

const updateThresholdType = (value) => {
  emit('update:threshold-type', value)
}

const applyFilters = () => {
  emit('filter-change')
}

const resetFilters = () => {
  emit('update:status', 'all')
  emit('update:location', 'all')
  emit('update:category', 'all')
  emit('update:threshold-type', 'all')
  
  // Trigger a filter after reset
  setTimeout(() => {
    emit('filter-change')
  }, 0)
}

// Helper functions
const formatLocationType = (type) => {
  switch (type) {
    case 'warehouse': return 'Warehouses'
    case 'store': return 'Stores'
    case 'supplier': return 'Suppliers'
    case 'manufacturing': return 'Manufacturing'
    case 'other': return 'Other Locations'
    default: return type.charAt(0).toUpperCase() + type.slice(1) + 's'
  }
}
</script>