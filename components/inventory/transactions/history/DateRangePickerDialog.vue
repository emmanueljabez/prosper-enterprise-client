<template>
  <div class="p-6 w-full max-w-md">
    <h2 class="text-xl font-bold mb-4">Select Date Range</h2>
    
    <div class="space-y-4">
      <div>
        <label for="start-date" class="block text-sm font-medium mb-1">Start Date</label>
        <input
          id="start-date"
          type="date"
          :value="startDate"
          @input="$emit('update:startDate', $event.target.value)"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      
      <div>
        <label for="end-date" class="block text-sm font-medium mb-1">End Date</label>
        <input
          id="end-date"
          type="date"
          :value="endDate"
          @input="$emit('update:endDate', $event.target.value)"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :min="startDate"
        />
      </div>
      
      <div class="flex items-center space-x-2 mt-2">
        <Button 
          variant="outline" 
          @click="setPresetRange('today')"
          size="sm"
        >
          Today
        </Button>
        <Button 
          variant="outline" 
          @click="setPresetRange('week')"
          size="sm"
        >
          This Week
        </Button>
        <Button 
          variant="outline" 
          @click="setPresetRange('month')"
          size="sm"
        >
          This Month
        </Button>
      </div>
    </div>
    
    <div class="flex justify-end gap-2 mt-6">
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        :disabled="!isValidRange"
        @click="handleApply"
      >
        Apply
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps({
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' }
})

const emit = defineEmits(['update:startDate', 'update:endDate', 'apply', 'close'])

const isValidRange = computed(() => {
  if (!props.startDate || !props.endDate) return false
  
  const start = new Date(props.startDate)
  const end = new Date(props.endDate)
  
  return start <= end
})

function handleApply() {
  if (isValidRange.value) {
    emit('apply')
  }
}

function setPresetRange(preset) {
  const now = new Date()
  let startDate = new Date()
  
  switch (preset) {
    case 'today':
      startDate.setHours(0, 0, 0, 0)
      break
    case 'week':
      // First day of current week (Sunday)
      const day = startDate.getDay()
      startDate.setDate(startDate.getDate() - day)
      startDate.setHours(0, 0, 0, 0)
      break
    case 'month':
      // First day of current month
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
      break
  }
  
  // Format dates as YYYY-MM-DD for input fields
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  emit('update:startDate', formatDate(startDate))
  emit('update:endDate', formatDate(now))
}
</script>