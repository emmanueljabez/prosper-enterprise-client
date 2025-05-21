<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Assign Ticket</DialogTitle>
        <DialogDescription>
          Assign ticket #{{ ticketId }} to a technician
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="technicianSelect">Technician</Label>
          <Select v-model="selectedTechnician">
            <SelectTrigger id="technicianSelect">
              <SelectValue placeholder="Select technician" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="tech in technicians" :key="tech.id" :value="tech.name">
                {{ tech.name }} ({{ tech.activeTickets }} active)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="selectedTechnician" class="bg-muted/50 rounded-md p-3">
          <div class="text-sm font-medium">{{ selectedTechnician }}</div>
          <div class="text-xs text-muted-foreground mt-1">
            {{ getTechnicianDetails().department }} • {{ getTechnicianDetails().skills.join(', ') }}
          </div>
          <div class="text-xs mt-2">
            Current load: {{ getTechnicianDetails().activeTickets }} tickets
          </div>
        </div>

        <div class="space-y-2">
          <Label for="assignmentNote">Assignment Note</Label>
          <Textarea
              id="assignmentNote"
              v-model="assignmentNote"
              placeholder="Add a note for the technician..."
              rows="3"
          />
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="highPriority" v-model="highPriority" />
          <Label for="highPriority">Mark as high priority for this technician</Label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
        <Button @click="handleAssign" :disabled="!selectedTechnician">Assign Ticket</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
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
  technicians: {
    type: Array,
    required: true,
    default: () => [
      {
        id: 1,
        name: 'David Ochieng',
        department: 'Field Service',
        skills: ['Fiber', 'Router Configuration', 'Installations'],
        activeTickets: 3
      },
      {
        id: 2,
        name: 'Jane Wambui',
        department: 'Technical Support',
        skills: ['Networking', 'Troubleshooting', 'Customer Service'],
        activeTickets: 5
      },
      {
        id: 3,
        name: 'Michael Odinga',
        department: 'Field Service',
        skills: ['Installations', 'Repairs', 'Fiber'],
        activeTickets: 2
      }
    ]
  }
})

const emit = defineEmits(['update:open', 'confirm'])

// Form state
const selectedTechnician = ref('')
const assignmentNote = ref('')
const highPriority = ref(false)

// Get details for selected technician
function getTechnicianDetails() {
  return props.technicians.find(tech => tech.name === selectedTechnician.value) || {}
}

// Handle assignment
function handleAssign() {
  if (!selectedTechnician.value) return

  const assignmentData = {
    technician: selectedTechnician.value,
    note: assignmentNote.value,
    highPriority: highPriority.value
  }

  emit('confirm', props.ticketId, assignmentData)
  emit('update:open', false)

  // Reset form
  selectedTechnician.value = ''
  assignmentNote.value = ''
  highPriority.value = false
}
</script>