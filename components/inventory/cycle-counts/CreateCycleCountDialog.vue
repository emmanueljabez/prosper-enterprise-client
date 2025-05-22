<template>
  <DialogContent class="sm:max-w-[550px]">
    <DialogHeader>
      <DialogTitle>Create Cycle Count</DialogTitle>
      <DialogDescription>
        Create a new inventory cycle count for physical verification.
      </DialogDescription>
    </DialogHeader>
    
    <form @submit.prevent="handleSubmit" class="space-y-4 py-2">
      <div class="grid grid-cols-1 gap-4">
        <!-- Count Name -->
        <div class="space-y-2">
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
        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="formData.description"
            placeholder="Enter count description"
            :disabled="isSubmitting"
            rows="3"
          />
        </div>
        
        <!-- Location -->
        <div class="space-y-2">
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
        
        <!-- Count Date -->
        <div class="space-y-2">
          <Label for="startDate">Count Date</Label>
          <Input
            id="startDate"
            v-model="formData.startDate"
            type="date"
            :min="todayFormatted"
            :disabled="isSubmitting"
            required
          />
        </div>
        
        <!-- Count Type -->
        <div class="space-y-2">
          <Label for="isRecurring">Count Type</Label>
          <RadioGroup v-model="formData.isRecurring" class="flex gap-4">
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="one-time" value="false" />
              <Label for="one-time">One-time</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="recurring" value="true" />
              <Label for="recurring">Recurring</Label>
            </div>
          </RadioGroup>
        </div>
        
        <!-- Filter Options -->
        <div class="space-y-2">
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
      
      <DialogFooter>
        <Button type="button" variant="outline" @click="$emit('close')" :disabled="isSubmitting">
          Cancel
        </Button>
        <Button type="submit" :disabled="!isFormValid || isSubmitting">
          <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          Create Count
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
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
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

const props = defineProps({
  locations: { type: Array, default: () => [] }
})

const emit = defineEmits(['count-created', 'close'])

const isSubmitting = ref(false)

const formData = ref({
  name: '',
  description: '',
  locationId: '',
  startDate: '',
  isRecurring: 'false', // String for RadioGroup compatibility
  filterType: 'all'
})

const isFormValid = computed(() => {
  return (
    formData.value.name &&
    formData.value.locationId &&
    formData.value.startDate
  )
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
    const cycleCountData = {
      name: formData.value.name,
      description: formData.value.description || '',
      locationId: formData.value.locationId,
      startDate: new Date(formData.value.startDate).toISOString(),
      isRecurring: formData.value.isRecurring === 'true',
      filterType: formData.value.filterType
    }

    emit('count-created', cycleCountData)
  } catch (error) {
    console.error('Error in form submission:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>