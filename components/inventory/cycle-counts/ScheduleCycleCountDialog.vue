<template>
  <DialogContent class="sm:max-w-[550px] max-h-[90vh] flex flex-col overflow-hidden">
    <DialogHeader class="flex-shrink-0">
      <DialogTitle>Schedule Recurring Cycle Count</DialogTitle>
      <DialogDescription>
        Create a recurring cycle count schedule for regular inventory verification.
      </DialogDescription>
    </DialogHeader>
    
    <div class="overflow-y-auto py-2 flex-grow">
      <form @submit.prevent="handleSubmit" class="space-y-3">
        <div class="grid grid-cols-1 gap-3">
          <!-- Count Name -->
          <div class="space-y-1.5">
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Enter count name"
              :disabled="isSubmitting"
              required
            />
          </div>
          
          <!-- Description -->
          <div class="space-y-1.5">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="formData.description"
              placeholder="Enter count description"
              :disabled="isSubmitting"
              rows="2"
            />
          </div>
          
          <!-- Location -->
          <div class="space-y-1.5">
            <Label for="location">Location</Label>
            <Select
              v-model="formData.locationId"
              :disabled="isSubmitting || !locations.length"
              required
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="location in locations" 
                  :key="location.id" 
                  :value="location.id"
                >
                  {{ location.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="!locations.length" class="text-xs text-destructive">
              No locations available. Please create a location first.
            </p>
          </div>
          
          <!-- Recurrence Pattern -->
          <div class="space-y-1.5">
            <Label for="recurrencePattern">Recurrence Pattern</Label>
            <Select
              v-model="formData.recurrencePattern"
              :disabled="isSubmitting"
              required
            >
              <SelectTrigger id="recurrencePattern">
                <SelectValue placeholder="Select recurrence pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="pattern in recurrencePatterns" 
                  :key="pattern.value" 
                  :value="pattern.value"
                >
                  {{ pattern.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Frequency -->
          <div class="space-y-1.5">
            <Label for="frequency">Frequency</Label>
            <div class="flex items-center gap-2">
              <span>Every</span>
              <Input
                id="frequency"
                v-model="formData.recurrenceFrequency"
                type="number"
                min="1"
                max="99"
                class="w-16"
                :disabled="isSubmitting"
                required
              />
              <span>{{ frequencyLabel }}</span>
            </div>
          </div>
          
          <!-- Day of Week (for weekly recurrence) -->
          <div v-if="formData.recurrencePattern === 'weekly' || formData.recurrencePattern === 'biweekly'" class="space-y-1.5">
            <Label for="dayOfWeek">Day of Week</Label>
            <Select
              v-model="formData.recurrenceDayOfWeek"
              :disabled="isSubmitting"
              required
            >
              <SelectTrigger id="dayOfWeek">
                <SelectValue placeholder="Select day of week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="(day, index) in daysOfWeek" :key="index" :value="index">
                  {{ day }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Day of Month (for monthly recurrence) -->
          <div v-if="formData.recurrencePattern === 'monthly'" class="space-y-1.5">
            <Label for="dayOfMonth">Day of Month</Label>
            <Select
              v-model="formData.recurrenceDayOfMonth"
              :disabled="isSubmitting"
              required
            >
              <SelectTrigger id="dayOfMonth">
                <SelectValue placeholder="Select day of month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="day in 31" :key="day" :value="day">
                  {{ day }}
                </SelectItem>
                <SelectItem value="-1">Last day of month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Start Date -->
          <div class="space-y-1.5">
            <Label for="startDate">Start Date</Label>
            <Input
              id="startDate"
              v-model="formData.startDate"
              type="date"
              :min="todayFormatted"
              :disabled="isSubmitting"
              required
            />
          </div>
          
          <!-- Filter Options -->
          <div class="space-y-1.5">
            <Label for="filterType">Items to Count</Label>
            <Select v-model="formData.filterType" :disabled="isSubmitting">
              <SelectTrigger id="filterType">
                <SelectValue placeholder="Select items to include" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="high_value">High-Value Items</SelectItem>
                <SelectItem value="high_turnover">High-Turnover Items</SelectItem>
                <SelectItem value="categories">Selected Categories</SelectItem>
                <SelectItem value="custom">Custom Selection</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>
    </div>
      
    <DialogFooter class="flex-shrink-0 pt-3 border-t mt-3">
      <Button type="button" variant="outline" @click="$emit('close')" :disabled="isSubmitting">
        Cancel
      </Button>
      <Button type="button" @click="handleSubmit" :disabled="!isFormValid || isSubmitting">
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Schedule Cycle Count
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Loader2Icon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

const props = defineProps({
  scheduleType: { type: String, default: 'weekly' },
  locations: { type: Array, default: () => [] }
})

const emit = defineEmits(['schedule-created', 'close'])

const isSubmitting = ref(false)

// Default form values based on the schedule type
const formData = ref({
  name: '',
  description: '',
  locationId: '',
  startDate: '',
  recurrencePattern: '',
  recurrenceFrequency: 1,
  recurrenceDayOfWeek: 1, // Monday by default
  recurrenceDayOfMonth: 1,
  filterType: 'all'
})

// Set default values based on the schedule type
onMounted(() => {
  formData.value.recurrencePattern = props.scheduleType === 'annual' ? 'yearly' : props.scheduleType
  
  // Set default name based on schedule type
  switch (props.scheduleType) {
    case 'weekly':
      formData.value.name = 'Weekly Cycle Count'
      formData.value.description = 'Regular weekly inventory verification'
      break
    case 'monthly':
      formData.value.name = 'Monthly Cycle Count'
      formData.value.description = 'Monthly inventory reconciliation'
      break
    case 'quarterly':
      formData.value.name = 'Quarterly Inventory Audit'
      formData.value.description = 'Comprehensive quarterly inventory verification'
      break
    case 'annual':
      formData.value.name = 'Annual Full Inventory Count'
      formData.value.description = 'Complete annual inventory verification for year-end reporting'
      break
  }
  
  // Set default day based on schedule type
  const today = new Date()
  formData.value.recurrenceDayOfWeek = today.getDay()
  formData.value.recurrenceDayOfMonth = today.getDate()
})

const recurrencePatterns = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
]

const daysOfWeek = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

const isFormValid = computed(() => {
  const requiredFields = [
    'name', 'locationId', 'startDate', 'recurrencePattern', 'recurrenceFrequency'
  ]
  
  const hasRequiredFields = requiredFields.every(field => !!formData.value[field])
  
  // Check pattern-specific required fields
  if (hasRequiredFields) {
    if (
      (formData.value.recurrencePattern === 'weekly' || formData.value.recurrencePattern === 'biweekly') && 
      formData.value.recurrenceDayOfWeek === undefined
    ) {
      return false
    }
    
    if (
      formData.value.recurrencePattern === 'monthly' && 
      formData.value.recurrenceDayOfMonth === undefined
    ) {
      return false
    }
  }
  
  return hasRequiredFields
})

const frequencyLabel = computed(() => {
  switch (formData.value.recurrencePattern) {
    case 'daily': return 'day(s)'
    case 'weekly': return 'week(s)'
    case 'biweekly': return 'bi-week(s)'
    case 'monthly': return 'month(s)'
    case 'quarterly': return 'quarter(s)'
    case 'yearly': return 'year(s)'
    default: return 'occurrence(s)'
  }
})

const todayFormatted = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

async function handleSubmit() {
  if (!isFormValid.value) return

  isSubmitting.value = true

  try {
    // Transform form data for API
    const scheduleData = {
      name: formData.value.name,
      description: formData.value.description || '',
      locationId: formData.value.locationId,
      startDate: new Date(formData.value.startDate).toISOString(),
      recurrencePattern: formData.value.recurrencePattern,
      recurrenceFrequency: parseInt(formData.value.recurrenceFrequency),
      filterType: formData.value.filterType
    }
    
    // Add pattern-specific fields
    if (formData.value.recurrencePattern === 'weekly' || formData.value.recurrencePattern === 'biweekly') {
      scheduleData.recurrenceDayOfWeek = parseInt(formData.value.recurrenceDayOfWeek)
    }
    
    if (formData.value.recurrencePattern === 'monthly') {
      scheduleData.recurrenceDayOfMonth = parseInt(formData.value.recurrenceDayOfMonth)
    }

    emit('schedule-created', scheduleData)
  } catch (error) {
    console.error('Error in form submission:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>