<!--
  DatePicker Component
  
  A shadcn-vue compatible date picker component that uses a popover with calendar.
  
  Usage:
  <DatePicker 
    v-model="dateValue" 
    placeholder="Select a date"
    :calendar-disabled="(date) => date < new Date()"
  />
  
  Props:
  - modelValue: string (YYYY-MM-DD format)
  - placeholder: string (default: "Pick a date")
  - disabled: boolean (default: false)
  - class: string (additional CSS classes)
  - calendarDisabled: function to disable specific dates
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
          {{ modelValue ? format(parseISO(modelValue), 'PPP') : placeholder }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="start">
        <Calendar
          mode="single"
          :model-value="selectedDate"
          @update:model-value="onDateSelect"
          :is-date-disabled="isDateDisabled"
          initial-focus
        />
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pick a date',
  disabled: false,
  class: '',
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)

// Convert string date to DateValue for the calendar
const selectedDate = computed(() => {
  if (!props.modelValue) return undefined
  
  try {
    // Use parseDate to convert YYYY-MM-DD string to DateValue
    return parseDate(props.modelValue)
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
      
      emit('update:modelValue', dateString)
      isOpen.value = false
    } catch (error) {
      console.error('Error converting date:', error)
    }
  }
}
</script>
