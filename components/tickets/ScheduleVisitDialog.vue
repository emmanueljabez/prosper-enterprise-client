<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Schedule Technician Visit</DialogTitle>
        <DialogDescription>
          Schedule an on-site visit for ticket #{{ ticketId }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <div>
          <h4 class="text-sm font-medium mb-2">Customer</h4>
          <div class="text-sm bg-muted/50 p-3 rounded-md">
            <div class="font-medium">{{ customerName }}</div>
            <div class="text-xs mt-1">{{ customerAddress }}</div>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="visitDate">Visit Date</Label>
          <Input
              id="visitDate"
              type="date"
              v-model="visitDate"
              :min="minDate"
          />
        </div>

        <div class="space-y-2">
          <Label for="visitTimeSlot">Time Slot</Label>
          <Select v-model="visitTimeSlot">
            <SelectTrigger id="visitTimeSlot">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning (8:00 AM - 12:00 PM)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12:00 PM - 4:00 PM)</SelectItem>
              <SelectItem value="evening">Evening (4:00 PM - 7:00 PM)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="visitType">Visit Type</Label>
          <Select v-model="visitType">
            <SelectTrigger id="visitType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="installation">Installation</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="equipment_replacement">Equipment Replacement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="technician">Assign Technician</Label>
          <Select v-model="selectedTechnician">
            <SelectTrigger id="technician">
              <SelectValue placeholder="Select technician" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="tech in availableTechnicians" :key="tech.id" :value="tech.name">
                {{ tech.name }} ({{ tech.appointments }} appointments)
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="selectedTechnician" class="text-xs text-muted-foreground mt-1">
            {{ getTechnicianDetails().skills.join(', ') }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="visitNotes">Visit Notes</Label>
          <Textarea
              id="visitNotes"
              v-model="visitNotes"
              placeholder="Add notes for the technician..."
              rows="3"
          />
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="customerNotification" v-model="customerNotification" />
          <Label for="customerNotification">Send customer notification</Label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
        <Button @click="handleSchedule" :disabled="!isFormValid">Schedule Visit</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  ticketId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerAddress: {
    type: String,
    required: true
  },
  availableTechnicians: {
    type: Array,
    required: true,
    default: () => [
      {
        id: 1,
        name: 'David Ochieng',
        skills: ['Fiber', 'Router Configuration', 'Installations'],
        appointments: 2
      },
      {
        id: 2,
        name: 'Michael Odinga',
        skills: ['Installations', 'Repairs', 'Fiber'],
        appointments: 1
      },
      {
        id: 3,
        name: 'Sarah Mwangi',
        skills: ['Networking', 'Router Configuration', 'Customer Equipment'],
        appointments: 3
      }
    ]
  }
})

const emit = defineEmits(['update:open', 'schedule'])

// Form state
const visitDate = ref('')
const visitTimeSlot = ref('')
const visitType = ref('')
const selectedTechnician = ref('')
const visitNotes = ref('')
const customerNotification = ref(true)

// Minimum date is tomorrow
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return format(tomorrow, 'yyyy-MM-dd')
})

// Form validation
const isFormValid = computed(() => {
  return visitDate.value && visitTimeSlot.value && visitType.value && selectedTechnician.value
})

// Get details for selected technician
function getTechnicianDetails() {
  return props.availableTechnicians.find(tech => tech.name === selectedTechnician.value) || {}
}

// Handle schedule
function handleSchedule() {
  if (!isFormValid.value) return

  const scheduleData = {
    ticketId: props.ticketId,
    customerName: props.customerName,
    customerAddress: props.customerAddress,
    date: visitDate.value,
    timeSlot: visitTimeSlot.value,
    visitType: visitType.value,
    technician: selectedTechnician.value,
    notes: visitNotes.value,
    notifyCustomer: customerNotification.value
  }

  emit('schedule', scheduleData)
  emit('update:open', false)

  // Reset form
  visitDate.value = ''
  visitTimeSlot.value = ''
  visitType.value = ''
  selectedTechnician.value = ''
  visitNotes.value = ''
  customerNotification.value = true
}
</script>