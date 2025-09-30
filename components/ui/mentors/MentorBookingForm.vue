<template>
  <div class="bg-white p-6 rounded-lg border">
    <div class="mb-6">
      <h3 class="text-xl font-semibold mb-2">Book a Session</h3>
      <p class="text-gray-600">
        Schedule a mentoring session with {{ mentorName }}
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Date and Time Selection -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label class="text-base font-medium">Preferred Date *</Label>
          <div class="relative">
            <Button
              variant="outline"
              type="button"
              @click="showDatePicker = !showDatePicker"
              class="w-full justify-start text-left font-normal"
            >
              <Calendar class="w-4 h-4 mr-2" />
              {{ formData.selectedDate ? formatDate(formData.selectedDate) : 'Select date' }}
            </Button>
            
            <!-- Simple date picker (in real app, use a proper date picker component) -->
            <div v-if="showDatePicker" class="absolute top-full left-0 z-10 mt-1 bg-white border rounded-lg shadow-lg p-4">
              <div class="grid grid-cols-7 gap-1 text-center text-sm">
                <div v-for="day in nextTwoWeeks" :key="day.toISOString()" 
                  :class="{
                    'bg-blue-100 text-blue-900': formData.selectedDate?.toDateString() === day.toDateString(),
                    'text-gray-400': !isDayAvailable(day),
                    'hover:bg-gray-100 cursor-pointer': isDayAvailable(day)
                  }"
                  class="p-2 rounded"
                  @click="selectDate(day)"
                >
                  {{ day.getDate() }}
                </div>
              </div>
              <Button variant="outline" size="sm" @click="showDatePicker = false" class="mt-3 w-full">
                Close
              </Button>
            </div>
          </div>
          <p v-if="errors.selectedDate" class="text-sm text-red-600">{{ errors.selectedDate }}</p>
        </div>

        <div class="space-y-2">
          <Label class="text-base font-medium">Available Times *</Label>
          <Select v-model="formData.selectedTimeSlot" :disabled="!formData.selectedDate">
            <SelectTrigger>
              <SelectValue placeholder="Select time..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="slot in availableTimeSlots"
                :key="slot.id"
                :value="slot.id"
              >
                {{ formatTimeSlot(slot) }}
                <span v-if="slot.specialPricing" class="ml-2 text-amber-600">
                  (${{ slot.specialPricing.rate }})
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.selectedTimeSlot" class="text-sm text-red-600">{{ errors.selectedTimeSlot }}</p>
        </div>
      </div>

      <!-- Session Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label class="text-base font-medium">Session Type *</Label>
          <Select v-model="formData.sessionType">
            <SelectTrigger>
              <SelectValue placeholder="Select session type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one-on-one">One-on-One Mentoring</SelectItem>
              <SelectItem value="career-coaching">Career Coaching</SelectItem>
              <SelectItem value="portfolio-review">Portfolio Review</SelectItem>
              <SelectItem value="interview-prep">Interview Preparation</SelectItem>
              <SelectItem value="skill-assessment">Skill Assessment</SelectItem>
              <SelectItem value="goal-setting">Goal Setting Session</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.sessionType" class="text-sm text-red-600">{{ errors.sessionType }}</p>
        </div>

        <div class="space-y-2">
          <Label class="text-base font-medium">Duration</Label>
          <Select v-model="formData.duration">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
              <SelectItem value="120">120 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Meeting Platform -->
      <div class="space-y-2">
        <Label class="text-base font-medium">Meeting Platform *</Label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label
            v-for="platform in meetingPlatforms"
            :key="platform.value"
            :class="{
              'border-blue-500 bg-blue-50': formData.platform === platform.value,
              'border-gray-200': formData.platform !== platform.value
            }"
            class="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:border-gray-300"
          >
            <input
              type="radio"
              :value="platform.value"
              v-model="formData.platform"
              class="sr-only"
            />
            <component :is="platform.icon" class="w-5 h-5" />
            <span class="text-sm font-medium">{{ platform.label }}</span>
          </label>
        </div>
        <p v-if="errors.platform" class="text-sm text-red-600">{{ errors.platform }}</p>
      </div>

      <!-- Session Goals -->
      <div class="space-y-2">
        <Label class="text-base font-medium">What would you like to discuss? *</Label>
        <Textarea
          v-model="formData.sessionGoals"
          placeholder="Please describe what you'd like to focus on during the session. This helps the mentor prepare and provide better guidance."
          rows="4"
          :class="{ 'border-red-500': errors.sessionGoals }"
        />
        <div class="flex justify-between items-center">
          <p v-if="errors.sessionGoals" class="text-sm text-red-600">{{ errors.sessionGoals }}</p>
          <span class="text-sm text-gray-500">
            {{ formData.sessionGoals.length }}/500
          </span>
        </div>
      </div>

      <!-- Preparation Materials -->
      <div class="space-y-2">
        <Label class="text-base font-medium">Preparation Materials (Optional)</Label>
        <Textarea
          v-model="formData.preparationMaterials"
          placeholder="Share any documents, links, or materials you'd like the mentor to review beforehand..."
          rows="3"
        />
        <p class="text-sm text-gray-500">
          Examples: GitHub repos, portfolio links, resume, specific questions, etc.
        </p>
      </div>

      <!-- Experience Level -->
      <div class="space-y-2">
        <Label class="text-base font-medium">Your Experience Level</Label>
        <Select v-model="formData.experienceLevel">
          <SelectTrigger>
            <SelectValue placeholder="Select your experience level..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
            <SelectItem value="intermediate">Intermediate (2-4 years)</SelectItem>
            <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
            <SelectItem value="senior">Senior (8+ years)</SelectItem>
            <SelectItem value="executive">Executive/Leadership</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Special Requests -->
      <div class="space-y-3">
        <Label class="text-base font-medium">Special Requests</Label>
        
        <div class="flex items-center space-x-2">
          <Checkbox 
            id="urgent" 
            v-model="formData.isUrgent"
          />
          <Label for="urgent" class="text-sm">
            This is an urgent request (may incur additional fees)
          </Label>
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox 
            id="recording" 
            v-model="formData.requestRecording"
          />
          <Label for="recording" class="text-sm">
            Request session recording (subject to mentor approval)
          </Label>
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox 
            id="followup" 
            v-model="formData.requestFollowUp"
          />
          <Label for="followup" class="text-sm">
            Request follow-up summary with action items
          </Label>
        </div>
      </div>

      <!-- Pricing Summary -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="font-medium text-gray-900 mb-3">Session Summary</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Base rate ({{ formData.duration }} min):</span>
            <span>${{ baseRate }}</span>
          </div>
          <div v-if="urgentFee > 0" class="flex justify-between text-amber-600">
            <span>Urgent request fee:</span>
            <span>+${{ urgentFee }}</span>
          </div>
          <div v-if="recordingFee > 0" class="flex justify-between text-blue-600">
            <span>Recording fee:</span>
            <span>+${{ recordingFee }}</span>
          </div>
          <div class="border-t pt-2 font-medium">
            <div class="flex justify-between">
              <span>Total:</span>
              <span class="text-lg">${{ totalCost }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="space-y-3">
        <div class="flex items-start space-x-2">
          <Checkbox 
            id="terms" 
            v-model="formData.acceptTerms"
          />
          <Label for="terms" class="text-sm leading-relaxed">
            I agree to the 
            <a href="#" class="text-blue-600 hover:underline">Terms of Service</a>
            and 
            <a href="#" class="text-blue-600 hover:underline">Cancellation Policy</a>
          </Label>
        </div>
        <p v-if="errors.acceptTerms" class="text-sm text-red-600">{{ errors.acceptTerms }}</p>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-between pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          @click="$emit('cancel')"
          :disabled="isSubmitting"
        >
          Cancel
        </Button>
        
        <div class="space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            @click="saveDraft"
            :disabled="isSubmitting"
          >
            Save Draft
          </Button>
          <Button 
            type="submit" 
            :loading="isSubmitting"
            :disabled="!isFormValid"
          >
            {{ requiresApproval ? 'Send Request' : 'Book Session' }}
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Calendar, Video, Phone, Monitor, Users } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BookingFormData {
  selectedDate: Date | null
  selectedTimeSlot: string
  sessionType: string
  duration: string
  platform: string
  sessionGoals: string
  preparationMaterials: string
  experienceLevel: string
  isUrgent: boolean
  requestRecording: boolean
  requestFollowUp: boolean
  acceptTerms: boolean
}

interface Props {
  mentorId: string
  mentorName?: string
  hourlyRate?: number
  requiresApproval?: boolean
  isSubmitting?: boolean
}

interface Emits {
  (e: 'submit', data: BookingFormData): void
  (e: 'cancel'): void
  (e: 'save-draft', data: BookingFormData): void
}

const props = withDefaults(defineProps<Props>(), {
  mentorName: 'Mentor',
  hourlyRate: 150,
  requiresApproval: false,
  isSubmitting: false
})

const emit = defineEmits<Emits>()

// Form state
const formData = reactive<BookingFormData>({
  selectedDate: null,
  selectedTimeSlot: '',
  sessionType: '',
  duration: '60',
  platform: '',
  sessionGoals: '',
  preparationMaterials: '',
  experienceLevel: '',
  isUrgent: false,
  requestRecording: false,
  requestFollowUp: false,
  acceptTerms: false
})

const errors = reactive({
  selectedDate: '',
  selectedTimeSlot: '',
  sessionType: '',
  platform: '',
  sessionGoals: '',
  acceptTerms: ''
})

const showDatePicker = ref(false)

// Constants
const meetingPlatforms = [
  { value: 'zoom', label: 'Zoom', icon: Video },
  { value: 'google-meet', label: 'Google Meet', icon: Video },
  { value: 'teams', label: 'Teams', icon: Monitor },
  { value: 'phone', label: 'Phone', icon: Phone }
]

// Mock available slots - in real app, this would come from API
const availableSlots = ref([
  {
    id: 'slot-1',
    startTime: '09:00',
    endTime: '10:00',
    date: new Date('2024-02-01'),
    isAvailable: true
  },
  {
    id: 'slot-2',
    startTime: '14:00',
    endTime: '15:00',
    date: new Date('2024-02-01'),
    isAvailable: true,
    specialPricing: { rate: 200, reason: 'Peak hours' }
  }
])

// Computed properties
const nextTwoWeeks = computed(() => {
  const dates = []
  const today = new Date()
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dates.push(date)
  }
  return dates
})

const availableTimeSlots = computed(() => {
  if (!formData.selectedDate) return []
  
  return availableSlots.value.filter(slot => 
    slot.date.toDateString() === formData.selectedDate?.toDateString()
  )
})

const baseRate = computed(() => {
  const duration = parseInt(formData.duration) || 60
  const hourlyRate = props.hourlyRate
  return Math.round((duration / 60) * hourlyRate)
})

const urgentFee = computed(() => {
  return formData.isUrgent ? Math.round(baseRate.value * 0.25) : 0
})

const recordingFee = computed(() => {
  return formData.requestRecording ? 25 : 0
})

const totalCost = computed(() => {
  return baseRate.value + urgentFee.value + recordingFee.value
})

const isFormValid = computed(() => {
  return formData.selectedDate &&
         formData.selectedTimeSlot &&
         formData.sessionType &&
         formData.platform &&
         formData.sessionGoals.trim().length >= 10 &&
         formData.acceptTerms &&
         Object.values(errors).every(error => !error)
})

// Methods
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTimeSlot = (slot: any) => {
  return `${slot.startTime} - ${slot.endTime}`
}

const isDayAvailable = (date: Date) => {
  // Mock logic - in real app, check mentor's schedule
  const dayOfWeek = date.getDay()
  return dayOfWeek !== 0 && dayOfWeek !== 6 // Not weekends
}

const selectDate = (date: Date) => {
  if (isDayAvailable(date)) {
    formData.selectedDate = date
    formData.selectedTimeSlot = '' // Reset time slot
    showDatePicker.value = false
    validateSelectedDate()
  }
}

const validateSelectedDate = () => {
  errors.selectedDate = !formData.selectedDate ? 'Please select a date' : ''
}

const validateSelectedTimeSlot = () => {
  errors.selectedTimeSlot = !formData.selectedTimeSlot ? 'Please select a time slot' : ''
}

const validateSessionType = () => {
  errors.sessionType = !formData.sessionType ? 'Please select a session type' : ''
}

const validatePlatform = () => {
  errors.platform = !formData.platform ? 'Please select a meeting platform' : ''
}

const validateSessionGoals = () => {
  if (!formData.sessionGoals.trim()) {
    errors.sessionGoals = 'Please describe what you\'d like to discuss'
  } else if (formData.sessionGoals.length < 10) {
    errors.sessionGoals = 'Please provide more details (minimum 10 characters)'
  } else if (formData.sessionGoals.length > 500) {
    errors.sessionGoals = 'Please keep description under 500 characters'
  } else {
    errors.sessionGoals = ''
  }
}

const validateAcceptTerms = () => {
  errors.acceptTerms = !formData.acceptTerms ? 'Please accept the terms and conditions' : ''
}

const handleSubmit = () => {
  // Validate all fields
  validateSelectedDate()
  validateSelectedTimeSlot()
  validateSessionType()
  validatePlatform()
  validateSessionGoals()
  validateAcceptTerms()

  if (isFormValid.value) {
    emit('submit', { ...formData })
  }
}

const saveDraft = () => {
  emit('save-draft', { ...formData })
}

// Watch for validation
watch(() => formData.selectedDate, validateSelectedDate)
watch(() => formData.selectedTimeSlot, validateSelectedTimeSlot)
watch(() => formData.sessionType, validateSessionType)
watch(() => formData.platform, validatePlatform)
watch(() => formData.sessionGoals, validateSessionGoals)
watch(() => formData.acceptTerms, validateAcceptTerms)
</script> 