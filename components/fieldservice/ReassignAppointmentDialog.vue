<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Reassign Appointment</DialogTitle>
        <DialogDescription>
          Change technician assignment for appointment {{ appointment?.id }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="appointment" class="py-4 space-y-4">
        <!-- Current Assignment -->
        <div v-if="appointment.technicianId" class="p-4 border rounded-md bg-muted/20">
          <div class="text-sm font-medium mb-2">Current Assignment</div>
          <div class="flex items-center gap-2">
            <Avatar class="h-8 w-8">
              <AvatarFallback>{{ getInitials(appointment.technicianName) }}</AvatarFallback>
            </Avatar>
            <div>
              <div>{{ appointment.technicianName }}</div>
              <div class="text-xs text-muted-foreground">{{ appointment.technicianId }}</div>
            </div>
          </div>
        </div>

        <!-- New Assignment -->
        <div>
          <Label>New Assignment</Label>
          <Select v-model="selectedTechnicianId" class="mt-2">
            <SelectTrigger>
              <SelectValue placeholder="Select a technician" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="tech in availableTechnicians" :key="tech.id" :value="tech.id">
                <div class="flex items-center">
                  <span>{{ tech.name }}</span>
                  <Badge class="ml-2" :class="{
                    'bg-green-50 text-green-700': tech.status === 'available',
                    'bg-yellow-50 text-yellow-700': tech.status === 'on_job',
                    'bg-blue-50 text-blue-700': tech.status === 'en_route'
                  }">
                    {{ formatStatus(tech.status) }}
                  </Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Technician Details -->
        <div v-if="selectedTechnician" class="p-4 border rounded-md bg-muted/20">
          <div class="flex justify-between items-start">
            <div>
              <div class="text-sm font-medium">{{ selectedTechnician.name }}</div>
              <div class="text-xs text-muted-foreground">{{ selectedTechnician.id }}</div>
            </div>
            <Badge :class="{
              'bg-green-50 text-green-700': selectedTechnician.status === 'available',
              'bg-yellow-50 text-yellow-700': selectedTechnician.status === 'on_job',
              'bg-blue-50 text-blue-700': selectedTechnician.status === 'en_route'
            }">
              {{ formatStatus(selectedTechnician.status) }}
            </Badge>
          </div>

          <div class="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <div class="text-muted-foreground">Skill Level:</div>
            <div>{{ selectedTechnician.skillLevel }}</div>

            <div class="text-muted-foreground">Specialties:</div>
            <div>{{ selectedTechnician.specialties.join(', ') }}</div>

            <div class="text-muted-foreground">Today's Jobs:</div>
            <div>{{ selectedTechnician.appointmentsToday || 0 }}</div>
          </div>

          <div v-if="selectedTechnician.currentAppointment" class="mt-2 text-xs p-2 bg-yellow-50 rounded-sm">
            <div class="font-medium text-yellow-800">Currently on job:</div>
            <div>{{ selectedTechnician.currentAppointment.serviceType }}</div>
            <div class="text-muted-foreground">{{ truncateText(selectedTechnician.currentAppointment.address, 30) }}</div>
          </div>
        </div>

        <!-- Reassignment Reason -->
        <div>
          <Label>Reason for Reassignment</Label>
          <Textarea
              v-model="reassignmentReason"
              placeholder="Enter reason for changing technician assignment"
              class="mt-2"
              rows="3"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Cancel
        </Button>
        <Button @click="handleReassign" :disabled="!selectedTechnicianId || isSubmitting">
          <LoaderIcon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          Confirm Reassignment
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { LoaderIcon } from 'lucide-vue-next';

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  appointment: {
    type: Object,
    default: null
  },
  technicians: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:open', 'reassign']);

const selectedTechnicianId = ref('');
const reassignmentReason = ref('');
const isSubmitting = ref(false);

// Reset when dialog opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    selectedTechnicianId.value = '';
    reassignmentReason.value = '';
  }
}, { immediate: true });

// Filter available technicians (not off duty)
const availableTechnicians = computed(() => {
  const technicians = props.technicians.filter(tech =>
      tech.status !== 'off_duty' && tech.id !== props.appointment?.technicianId
  );

  // Sort by availability
  return technicians.sort((a, b) => {
    if (a.status === 'available' && b.status !== 'available') return -1;
    if (a.status !== 'available' && b.status === 'available') return 1;
    return 0;
  });
});

// Get selected technician details
const selectedTechnician = computed(() => {
  return props.technicians.find(tech => tech.id === selectedTechnicianId.value);
});

function getInitials(name) {
  return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
}

function formatStatus(status) {
  const statusMap = {
    'available': 'Available',
    'on_job': 'On Job',
    'en_route': 'En Route',
    'break': 'On Break',
    'delayed': 'Delayed'
  };
  return statusMap[status] || status;
}

function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function handleReassign() {
  if (!selectedTechnicianId.value || !props.appointment) return;

  isSubmitting.value = true;

  try {
    const newAssignment = {
      appointmentId: props.appointment.id,
      previousTechnicianId: props.appointment.technicianId,
      previousTechnicianName: props.appointment.technicianName,
      newTechnicianId: selectedTechnicianId.value,
      newTechnicianName: selectedTechnician.value?.name || 'Unknown',
      reason: reassignmentReason.value,
      timestamp: new Date().toISOString()
    };

    emit('reassign', newAssignment);
    emit('update:open', false);
  } finally {
    isSubmitting.value = false;
  }
}
</script>