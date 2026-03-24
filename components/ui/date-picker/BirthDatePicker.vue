<!--
  BirthDatePicker Component

  A date picker optimized for selecting birth dates using separate dropdowns for year, month, and day.
  Provides better UX than a calendar picker for dates far in the past.

  Usage:
  <BirthDatePicker
    v-model="birthDate"
    placeholder="Select your date of birth"
  />

  Props:
  - modelValue: string (YYYY-MM-DD format)
  - placeholder: string (default: "Select date of birth")
  - disabled: boolean (default: false)
  - minYear: number (default: 1900)
  - maxYear: number (default: current year - 13, for age restriction)

  Emits:
  - update:modelValue: string (YYYY-MM-DD format)
-->
<template>
  <div class="grid grid-cols-3 gap-2">
    <!-- Month Select -->
    <div class="col-span-1">
      <Select v-model="selectedMonth" :disabled="disabled">
        <SelectTrigger>
          <SelectValue :placeholder="monthPlaceholder" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="month in months" :key="month.value" :value="month.value">
            {{ month.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Day Select -->
    <div class="col-span-1">
      <Select v-model="selectedDay" :disabled="disabled || !selectedMonth">
        <SelectTrigger>
          <SelectValue :placeholder="dayPlaceholder" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="day in availableDays" :key="day" :value="day">
            {{ day }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Year Select -->
    <div class="col-span-1">
      <Select v-model="selectedYear" :disabled="disabled">
        <SelectTrigger>
          <SelectValue :placeholder="yearPlaceholder" />
        </SelectTrigger>
        <SelectContent class="max-h-[200px]">
          <SelectItem v-for="year in years" :key="year" :value="year">
            {{ year }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  minYear?: number
  maxYear?: number
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select date of birth',
  disabled: false,
  minYear: 1900,
  maxYear: new Date().getFullYear() - 13, // Default to 13 years ago for age restriction
})

const emit = defineEmits<Emits>()

const selectedMonth = ref<string>('')
const selectedDay = ref<string>('')
const selectedYear = ref<string>('')

// Month options
const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

// Generate year options (most recent first for easier selection)
const years = computed(() => {
  const yearList: string[] = []
  for (let year = props.maxYear; year >= props.minYear; year--) {
    yearList.push(year.toString())
  }
  return yearList
})

// Calculate available days based on selected month and year
const availableDays = computed(() => {
  if (!selectedMonth.value) return []

  const month = parseInt(selectedMonth.value)
  const year = selectedYear.value ? parseInt(selectedYear.value) : new Date().getFullYear()

  // Get number of days in the month
  const daysInMonth = new Date(year, month, 0).getDate()

  const dayList: string[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    dayList.push(day.toString().padStart(2, '0'))
  }
  return dayList
})

// Placeholders
const monthPlaceholder = computed(() => selectedMonth.value ? months.find(m => m.value === selectedMonth.value)?.label : 'Month')
const dayPlaceholder = computed(() => selectedDay.value || 'Day')
const yearPlaceholder = computed(() => selectedYear.value || 'Year')

// Parse initial value
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = newValue.split('-')
    selectedYear.value = year
    selectedMonth.value = month
    selectedDay.value = day
  } else if (!newValue) {
    selectedYear.value = ''
    selectedMonth.value = ''
    selectedDay.value = ''
  }
}, { immediate: true })

// Update modelValue when any part changes
watch([selectedYear, selectedMonth, selectedDay], () => {
  // Only emit if all parts are selected
  if (selectedYear.value && selectedMonth.value && selectedDay.value) {
    // Validate that the day is valid for the selected month/year
    const day = parseInt(selectedDay.value)
    const maxDay = availableDays.value.length

    if (day > maxDay) {
      // If selected day is invalid for new month, reset it
      selectedDay.value = ''
      return
    }

    const dateString = `${selectedYear.value}-${selectedMonth.value}-${selectedDay.value}`
    emit('update:modelValue', dateString)
  } else {
    // Clear the value if not all parts are selected
    emit('update:modelValue', '')
  }
})

// Watch month/year changes to validate day
watch([selectedMonth, selectedYear], () => {
  if (selectedDay.value && selectedMonth.value) {
    const day = parseInt(selectedDay.value)
    const maxDay = availableDays.value.length

    if (day > maxDay) {
      // Reset day if it's invalid for the new month
      selectedDay.value = ''
    }
  }
})
</script>
