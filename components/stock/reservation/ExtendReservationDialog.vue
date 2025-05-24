<template>
  <DialogContent class="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Extend Reservation</DialogTitle>
      <DialogDescription>
        Extend the hold period for this reservation
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-4 py-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label>Reference</Label>
          <div class="text-sm font-medium">{{ reservation.reference }}</div>
        </div>
        <div class="space-y-2">
          <Label>Customer</Label>
          <div class="text-sm font-medium">{{ reservation.customerName || 'No customer' }}</div>
        </div>
      </div>

      <div class="space-y-2">
        <Label>Current Expiry</Label>
        <div class="text-sm font-medium">{{ formatDate(reservation.expiresAt) }}</div>
        <div class="text-xs text-muted-foreground">{{ getDaysUntilExpiryText() }}</div>
      </div>

      <Separator />

      <div class="space-y-2">
        <Label for="extensionType">Extension Method</Label>
        <Tabs v-model="extensionType" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="policy">Use Policy</TabsTrigger>
            <TabsTrigger value="custom">Custom Duration</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div v-if="extensionType === 'policy'">
        <div class="space-y-2">
          <Label for="holdPolicy">Hold Policy</Label>
          <Select v-model="formData.holdPolicyId">
            <SelectTrigger id="holdPolicy">
              <SelectValue placeholder="Select hold policy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="policy in activeHoldPolicies" 
                :key="policy.id" 
                :value="policy.id"
              >
                {{ policy.name }} ({{ formatDuration(policy) }})
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-sm text-muted-foreground" v-if="selectedPolicy">
            Items will be held until {{ formatExpiryDate(calculateNewExpiryDate()) }}
          </p>
        </div>
      </div>

      <div v-else-if="extensionType === 'custom'">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="days">Days</Label>
              <Input 
                id="days" 
                type="number" 
                v-model.number="formData.days" 
                min="0"
                max="90"
              />
            </div>
            <div class="space-y-2">
              <Label for="hours">Hours</Label>
              <Input 
                id="hours" 
                type="number" 
                v-model.number="formData.hours" 
                min="0"
                max="23"
              />
            </div>
          </div>
          <p class="text-sm text-muted-foreground">
            Items will be held until {{ formatExpiryDate(calculateNewExpiryDate()) }}
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <Label for="notes">Extension Reason</Label>
        <Textarea
          id="notes"
          v-model="formData.notes"
          placeholder="Reason for extending this reservation"
          rows="2"
        />
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        @click="extendReservation" 
        :disabled="isSubmitting || !isFormValid"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Extend Reservation
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, addDays, addHours, differenceInDays, isPast } from 'date-fns'
import { Loader2Icon } from 'lucide-vue-next'
import { 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Tabs,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  reservation: {
    type: Object,
    required: true
  },
  holdPolicies: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'reservation-extended'])

// Form state
const extensionType = ref('policy')
const formData = ref({
  holdPolicyId: '',
  days: 3,
  hours: 0,
  notes: ''
})
const isSubmitting = ref(false)

// Computed properties
const activeHoldPolicies = computed(() => {
  return props.holdPolicies.filter(policy => policy.status === 'active')
})

const selectedPolicy = computed(() => {
  if (!formData.value.holdPolicyId) return null
  return props.holdPolicies.find(policy => policy.id === formData.value.holdPolicyId)
})

const isFormValid = computed(() => {
  if (extensionType.value === 'policy') {
    return !!formData.value.holdPolicyId
  } else {
    return (formData.value.days > 0 || formData.value.hours > 0)
  }
})

const daysUntilExpiry = computed(() => {
  if (!props.reservation?.expiresAt) return null
  
  const expiryDate = new Date(props.reservation.expiresAt)
  const today = new Date()
  
  if (isPast(expiryDate)) {
    return -1 * differenceInDays(expiryDate, today)
  }
  
  return differenceInDays(expiryDate, today)
})

// Helper functions
function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}

function formatExpiryDate(date) {
  return format(date, 'MMM d, yyyy h:mm a')
}

function formatDuration(policy) {
  if (!policy) return ''
  
  if (policy.durationType === 'days') {
    return policy.duration === 1 ? '1 day' : `${policy.duration} days`
  } else if (policy.durationType === 'hours') {
    return policy.duration === 1 ? '1 hour' : `${policy.duration} hours`
  }
  
  return `${policy.duration} ${policy.durationType}`
}

function calculateNewExpiryDate() {
  let baseDate
  
  // Decide whether to extend from current expiry or from now
  // If already expired, extend from now
  if (isPast(new Date(props.reservation.expiresAt))) {
    baseDate = new Date()
  } else {
    baseDate = new Date(props.reservation.expiresAt)
  }
  
  if (extensionType.value === 'policy' && selectedPolicy.value) {
    if (selectedPolicy.value.durationType === 'days') {
      return addDays(baseDate, selectedPolicy.value.duration)
    } else if (selectedPolicy.value.durationType === 'hours') {
      return addHours(baseDate, selectedPolicy.value.duration)
    }
  } else if (extensionType.value === 'custom') {
    let newDate = baseDate
    
    if (formData.value.days > 0) {
      newDate = addDays(newDate, formData.value.days)
    }
    
    if (formData.value.hours > 0) {
      newDate = addHours(newDate, formData.value.hours)
    }
    
    return newDate
  }
  
  return baseDate
}

function getDaysUntilExpiryText() {
  if (daysUntilExpiry.value === 0) {
    return 'Expires today'
  } else if (daysUntilExpiry.value === 1) {
    return 'Expires tomorrow'
  } else if (daysUntilExpiry.value > 1) {
    return `Expires in ${daysUntilExpiry.value} days`
  } else if (daysUntilExpiry.value === -1) {
    return 'Expired yesterday'
  } else {
    return `Expired ${Math.abs(daysUntilExpiry.value)} days ago`
  }
}

async function extendReservation() {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    const newExpiryDate = calculateNewExpiryDate()
    
    let extension = {
      expiresAt: newExpiryDate.toISOString(),
      notes: formData.value.notes
    }
    
    if (extensionType.value === 'policy') {
      extension.holdPolicyId = formData.value.holdPolicyId
    } else {
      extension.days = formData.value.days
      extension.hours = formData.value.hours
    }
    
    // Emit the extended reservation and new expiry date
    emit('reservation-extended', props.reservation, newExpiryDate.toISOString())
  } catch (error) {
    console.error('Error extending reservation:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Set default hold policy if only one exists or if reservation has a policy
watch(() => activeHoldPolicies.value, (newPolicies) => {
  if (newPolicies.length === 1 && !formData.value.holdPolicyId) {
    formData.value.holdPolicyId = newPolicies[0].id
  } else if (props.reservation.holdPolicyId) {
    formData.value.holdPolicyId = props.reservation.holdPolicyId
  }
}, { immediate: true })
</script>