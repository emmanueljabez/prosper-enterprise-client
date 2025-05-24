<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Set Time Range</DialogTitle>
      <DialogDescription>
        Select a date range to filter stock flow data and transactions.
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-6 py-4">
      <!-- Preset Date Ranges -->
      <div class="space-y-2">
        <Label>Quick Select</Label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Button 
            v-for="preset in presetRanges"
            :key="preset.key"
            variant="outline"
            size="sm"
            :class="{ 'bg-primary/10 border-primary': isPresetSelected(preset) }"
            @click="selectPreset(preset)"
          >
            {{ preset.label }}
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <!-- Custom Date Range -->
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-end space-y-3 sm:space-y-0 sm:space-x-4">
          <div class="flex-1 space-y-2">
            <Label for="start-date">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant="outline"
                  :class="{ 'text-muted-foreground': !localRange.start }"
                  class="w-full justify-start text-left"
                >
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ localRange.start ? formatDate(localRange.start) : 'Select date' }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar
                  v-model="calendarStart"
                  mode="single"
                  :disabled-dates="disabledDates"
                  @update:model-value="setStartDate"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div class="flex-1 space-y-2">
            <Label for="end-date">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="end-date"
                  variant="outline"
                  :class="{ 'text-muted-foreground': !localRange.end }"
                  class="w-full justify-start text-left"
                >
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ localRange.end ? formatDate(localRange.end) : 'Select date' }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar
                  v-model="calendarEnd"
                  mode="single"
                  :disabled-dates="endDateDisabled"
                  @update:model-value="setEndDate"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div class="flex items-center">
          <Switch
            id="include-today"
            v-model="includeToday"
            @update:model-value="updateEndDate"
          />
          <Label for="include-today" class="ml-2">Include today in the range</Label>
        </div>
        
        <div v-if="localRange.start && localRange.end" class="flex flex-col text-center">
          <p class="text-sm font-medium">
            {{ getDaysDifference() }} days selected
          </p>
          <span class="text-xs text-muted-foreground">
            From {{ formatDate(localRange.start) }} to {{ formatDate(localRange.end) }}
          </span>
        </div>
      </div>
      
      <Separator />
      
      <!-- Time Grouping -->
      <div class="space-y-2">
        <Label for="time-grouping">Time Grouping</Label>
        <Select v-model="timeGrouping">
          <SelectTrigger id="time-grouping">
            <SelectValue placeholder="Select time grouping" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="quarter">Quarterly</SelectItem>
          </SelectContent>
        </Select>
        <p class="text-xs text-muted-foreground">
          This setting determines how data points are grouped in timeline visualizations.
        </p>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button type="submit" @click="applyDateRange" :disabled="!isValidRange">Apply</Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { format, differenceInDays, addDays, subDays, startOfMonth, endOfMonth, startOfYear, subMonths } from 'date-fns'
import { CalendarIcon } from 'lucide-vue-next'
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps({
  dateRange: {
    type: Object,
    default: () => ({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    })
  }
})

const emit = defineEmits(['date-range-updated', 'close'])

// Local state
const localRange = ref({
  start: props.dateRange.start ? new Date(props.dateRange.start) : null,
  end: props.dateRange.end ? new Date(props.dateRange.end) : null
})

const calendarStart = ref(localRange.value.start)
const calendarEnd = ref(localRange.value.end)
const includeToday = ref(true)
const timeGrouping = ref('day')
const selectedPreset = ref(null)

// Predefined date range presets
const presetRanges = [
  { key: 'today', label: 'Today', range: () => {
    const today = new Date()
    return { start: today, end: today }
  }},
  { key: 'yesterday', label: 'Yesterday', range: () => {
    const yesterday = subDays(new Date(), 1)
    return { start: yesterday, end: yesterday }
  }},
  { key: 'last7days', label: 'Last 7 Days', range: () => ({
    start: subDays(new Date(), 6),
    end: new Date()
  })},
  { key: 'last30days', label: 'Last 30 Days', range: () => ({
    start: subDays(new Date(), 29),
    end: new Date()
  })},
  { key: 'thisMonth', label: 'This Month', range: () => {
    const now = new Date()
    return {
      start: startOfMonth(now),
      end: includeToday.value ? now : endOfMonth(now)
    }
  }},
  { key: 'lastMonth', label: 'Last Month', range: () => {
    const lastMonth = subMonths(new Date(), 1)
    return {
      start: startOfMonth(lastMonth),
      end: endOfMonth(lastMonth)
    }
  }}
]

// Computed properties
const disabledDates = computed(() => ({
  after: new Date()
}))

const endDateDisabled = computed(() => ({
  before: localRange.value.start,
  after: new Date()
}))

const isValidRange = computed(() => {
  return localRange.value.start && localRange.value.end
})

// Watch for prop changes
watch(() => props.dateRange, (newValue) => {
  localRange.value = {
    start: newValue.start ? new Date(newValue.start) : null,
    end: newValue.end ? new Date(newValue.end) : null
  }
  calendarStart.value = localRange.value.start
  calendarEnd.value = localRange.value.end
  
  // Determine if a preset matches the current range
  detectPreset()
})

// Methods
function formatDate(date) {
  if (!date) return ''
  return format(date, 'PPP')
}

function setStartDate(date) {
  if (date) {
    localRange.value.start = date
    
    // If end date is before start date, set end date to start date
    if (localRange.value.end && date > localRange.value.end) {
      localRange.value.end = date
      calendarEnd.value = date
    }
    
    // Clear the selected preset
    selectedPreset.value = null
    
    // Detect if we've matched a preset
    detectPreset()
  }
}

function setEndDate(date) {
  if (date) {
    localRange.value.end = date
    
    // Clear the selected preset
    selectedPreset.value = null
    
    // Detect if we've matched a preset
    detectPreset()
  }
}

function updateEndDate() {
  if (includeToday.value) {
    localRange.value.end = new Date()
    calendarEnd.value = new Date()
  }
}

function selectPreset(preset) {
  selectedPreset.value = preset.key
  const range = preset.range()
  
  localRange.value.start = range.start
  localRange.value.end = range.end
  
  calendarStart.value = range.start
  calendarEnd.value = range.end
}

function isPresetSelected(preset) {
  return selectedPreset.value === preset.key
}

function detectPreset() {
  if (!localRange.value.start || !localRange.value.end) return
  
  const currentStart = localRange.value.start.setHours(0, 0, 0, 0)
  const currentEnd = localRange.value.end.setHours(0, 0, 0, 0)
  
  for (const preset of presetRanges) {
    const range = preset.range()
    const presetStart = range.start.setHours(0, 0, 0, 0)
    const presetEnd = range.end.setHours(0, 0, 0, 0)
    
    if (currentStart === presetStart && currentEnd === presetEnd) {
      selectedPreset.value = preset.key
      return
    }
  }
  
  selectedPreset.value = null
}

function getDaysDifference() {
  if (!localRange.value.start || !localRange.value.end) return 0
  
  return differenceInDays(localRange.value.end, localRange.value.start) + 1
}

function applyDateRange() {
  if (isValidRange.value) {
    emit('date-range-updated', {
      start: localRange.value.start,
      end: localRange.value.end,
      grouping: timeGrouping.value
    })
  }
}

// Initialize component
onMounted(() => {
  detectPreset()
  
  // Set default time grouping based on date range span
  const days = getDaysDifference()
  if (days <= 14) {
    timeGrouping.value = 'day'
  } else if (days <= 90) {
    timeGrouping.value = 'week'
  } else {
    timeGrouping.value = 'month'
  }
})
</script>