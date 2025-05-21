<template>
  <div class="border rounded-md">
    <!-- Calendar header -->
    <div class="p-4 border-b bg-muted/40">
      <div class="flex justify-between items-center">
        <h3 class="font-medium">{{ calendarTitle }}</h3>
        <div class="flex items-center space-x-2">
          <Button size="sm" variant="outline" @click="handlePrevMonth">
            <ChevronLeftIcon class="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" @click="handleNextMonth">
            <ChevronRightIcon class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Calendar table -->
    <table class="w-full border-collapse">
      <thead>
      <tr>
        <th v-for="day in weekdays" :key="day" class="p-2 text-xs font-medium text-muted-foreground border-b">
          {{ day }}
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(week, weekIndex) in calendarWeeks" :key="weekIndex">
        <td
            v-for="(day, dayIndex) in week"
            :key="`${weekIndex}-${dayIndex}`"
            class="p-2 border-b border-r h-[100px] align-top"
            :class="{
              'border-l': dayIndex === 0,
              'bg-muted/30': !day.currentMonth,
              'bg-accent/5': isToday(day.date)
            }"
        >
          <div
              class="text-xs font-medium mb-2"
              :class="{ 'text-muted-foreground': !day.currentMonth }"
          >
            {{ format(day.date, 'd') }}
          </div>

          <div class="space-y-1">
            <div
                v-for="event in getEventsForDay(day.date)"
                :key="event.id"
                class="text-xs rounded px-1 py-0.5 truncate cursor-pointer"
                :class="{
                  'bg-blue-100 text-blue-800': event.status === 'scheduled',
                  'bg-amber-100 text-amber-800': event.status === 'in_progress' || event.status === 'delayed',
                  'bg-green-100 text-green-800': event.status === 'completed',
                  'bg-gray-100 text-gray-800': event.status === 'cancelled'
                }"
                @click="$emit('select', event)"
            >
              {{ event.title }}
            </div>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday as dateFnsIsToday,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameDay,
  addDays
} from 'date-fns'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'

const props = defineProps({
  maintenanceEvents: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['select'])

// Current month being displayed
const currentMonth = ref(new Date())

// Days of week for header
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Calendar title (Month YYYY)
const calendarTitle = computed(() => {
  return format(currentMonth.value, 'MMMM yyyy')
})

// Calculate days grouped by week for the calendar
const calendarWeeks = computed(() => {
  const monthStart = startOfMonth(currentMonth.value)
  const monthEnd = endOfMonth(currentMonth.value)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  // Get all days in the calendar range
  const daysArray = eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map(date => ({
    date,
    currentMonth: isSameMonth(date, monthStart)
  }))

  // Group days into weeks
  const weeks = []
  let currentWeek = []

  daysArray.forEach((day, index) => {
    currentWeek.push(day)

    if (index % 7 === 6 || index === daysArray.length - 1) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  return weeks
})

// Check if a date is today
function isToday(date) {
  return dateFnsIsToday(date)
}

// Get maintenance events for a specific day
function getEventsForDay(date) {
  return props.maintenanceEvents.filter(event => {
    if (!event || !event.scheduledStart) return false

    const eventDate = new Date(event.scheduledStart)
    return isSameDay(date, eventDate)
  })
}

// Navigate to previous month
function handlePrevMonth() {
  currentMonth.value = subMonths(currentMonth.value, 1)
}

// Navigate to next month
function handleNextMonth() {
  currentMonth.value = addMonths(currentMonth.value, 1)
}
</script>