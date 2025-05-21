<template>
  <div>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" class="w-[280px] justify-start text-left">
          <CalendarIcon class="mr-2 h-4 w-4" />
          {{ dateRangeText }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0">
        <Calendar
            mode="range"
            v-model:value="date"
            :number-of-months="2"
            class="border-none"
        />
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CalendarIcon } from 'lucide-vue-next'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

const date = ref({
  from: new Date(),
  to: addDays(new Date(), 7),
})

const dateRangeText = computed(() => {
  if (!date.value?.from) return 'Select date range'

  if (!date.value.to) {
    return `${formatDate(date.value.from)} - ?`
  }

  return `${formatDate(date.value.from)} - ${formatDate(date.value.to)}`
})

// Helper functions
function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
</script>