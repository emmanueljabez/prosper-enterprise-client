<!--
  DatePicker Component
  
  A shadcn-vue compatible date picker component that uses a popover with calendar and optional time picker.
  
  Usage:
  <DatePicker 
    v-model="dateValue" 
    placeholder="Select a date"
    :calendar-disabled="(date) => date < new Date()"
    :include-time="true"
  />
  
  Props:
  - modelValue: string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss format)
  - placeholder: string (default: "Pick a date")
  - disabled: boolean (default: false)
  - class: string (additional CSS classes)
  - calendarDisabled: function to disable specific dates
  - includeTime: boolean (default: false) - whether to include time picker
-->
<template>
  <div>
    <Popover v-model:open="isOpen">
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          :class="cn('w-full justify-start text-left font-normal', !modelValue && 'text-muted-foreground', props.class)"
          :disabled="disabled"
        >
          <CalendarIcon class="mr-2 h-4 w-4" />
          {{ displayValue }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="start">
        <div class="p-3">
          <Calendar
            mode="single"
            :model-value="selectedDate"
            @update:model-value="onDateSelect"
            :is-date-disabled="isDateDisabled"
            initial-focus
          />
          
          <!-- Time picker section -->
          <div v-if="includeTime" class="border-t pt-3 mt-3">
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium">Time:</label>
              <div class="flex items-center space-x-1">
                <input
                  v-model="hours"
                  type="number"
                  min="0"
                  max="23"
                  class="w-16 px-2 py-1 text-sm border rounded text-center"
                  placeholder="00"
                  @input="onTimeChange"
                />
                <span class="text-sm">:</span>
                <input
                  v-model="minutes"
                  type="number"
                  min="0"
                  max="59"
                  class="w-16 px-2 py-1 text-sm border rounded text-center"
                  placeholder="00"
                  @input="onTimeChange"
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { format, parseISO } from 'date-fns'
import { CalendarIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { parseDate, toCalendarDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  class?: string
  calendarDisabled?: (date: Date) => boolean
  includeTime?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pick a date',
  disabled: false,
  class: '',
  includeTime: false,
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)

// Time state
const hours = ref('00')
const minutes = ref('00')

// Display value for the button
const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder
  
  try {
    if (props.includeTime && props.modelValue.includes('T')) {
      // Format datetime as "MMM dd, yyyy at HH:mm"
      return format(parseISO(props.modelValue), 'PPP \'at\' HH:mm')
    } else {
      // Format date only as "MMM dd, yyyy"
      return format(parseISO(props.modelValue), 'PPP')
    }
  } catch (error) {
    console.warn('Failed to format date:', props.modelValue)
    return props.modelValue
  }
})

// Parse current time from modelValue
const parseCurrentTime = () => {
  if (props.modelValue && props.includeTime && props.modelValue.includes('T')) {
    try {
      const timePart = props.modelValue.split('T')[1]
      if (timePart) {
        const [h, m] = timePart.split(':')
        hours.value = h?.padStart(2, '0') || '00'
        minutes.value = m?.padStart(2, '0') || '00'
      }
    } catch (error) {
      console.warn('Failed to parse time:', props.modelValue)
    }
  } else if (props.includeTime && !props.modelValue?.includes('T')) {
    // If includeTime is true but no time is provided, default to 00:00
    hours.value = '00'
    minutes.value = '00'
  }
}

// Initialize time when component mounts or modelValue changes
watchEffect(() => {
  parseCurrentTime()
})

// Convert string date to DateValue for the calendar
const selectedDate = computed(() => {
  if (!props.modelValue) return undefined
  
  try {
    // Extract date part if it's a datetime string
    const datePart = props.modelValue.includes('T') ? props.modelValue.split('T')[0] : props.modelValue
    return parseDate(datePart)
  } catch (error) {
    console.warn('Failed to parse date:', props.modelValue)
    return undefined
  }
})

// Convert calendarDisabled function to work with DateValue
const isDateDisabled = computed(() => {
  if (!props.calendarDisabled) return undefined
  
  return (dateValue: DateValue) => {
    try {
      // Convert DateValue to Date for the callback
      const jsDate = new Date(dateValue.year, dateValue.month - 1, dateValue.day)
      return props.calendarDisabled!(jsDate)
    } catch (error) {
      console.warn('Error in calendarDisabled:', error)
      return false
    }
  }
})

const onDateSelect = (dateValue: DateValue | undefined) => {
  if (dateValue) {
    try {
      // Convert DateValue back to YYYY-MM-DD string
      const year = dateValue.year.toString().padStart(4, '0')
      const month = dateValue.month.toString().padStart(2, '0')
      const day = dateValue.day.toString().padStart(2, '0')
      const dateString = `${year}-${month}-${day}`
      
      // If time is included, append it with seconds
      if (props.includeTime) {
        const timeString = `${hours.value.padStart(2, '0')}:${minutes.value.padStart(2, '0')}:00`
        emit('update:modelValue', `${dateString}T${timeString}`)
      } else {
        emit('update:modelValue', dateString)
        isOpen.value = false
      }
    } catch (error) {
      console.error('Error converting date:', error)
    }
  }
}

const onTimeChange = () => {
  // Validate and format time inputs
  const h = Math.max(0, Math.min(23, parseInt(hours.value) || 0))
  const m = Math.max(0, Math.min(59, parseInt(minutes.value) || 0))
  
  hours.value = h.toString().padStart(2, '0')
  minutes.value = m.toString().padStart(2, '0')
  
  // If we have a selected date, update the datetime value
  if (selectedDate.value && props.includeTime) {
    const dateValue = selectedDate.value
    const year = dateValue.year.toString().padStart(4, '0')
    const month = dateValue.month.toString().padStart(2, '0')
    const day = dateValue.day.toString().padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    const timeString = `${hours.value}:${minutes.value}:00`
    
    emit('update:modelValue', `${dateString}T${timeString}`)
  }
}
</script>
