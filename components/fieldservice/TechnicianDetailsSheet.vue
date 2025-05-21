<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent class="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Technician Details</SheetTitle>
        <SheetDescription>View and manage technician information</SheetDescription>
      </SheetHeader>

      <div v-if="technician" class="py-6 space-y-6">
        <!-- Technician Header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <Avatar class="h-16 w-16">
              <AvatarImage :src="technician.avatar" />
              <AvatarFallback>{{ getInitials(technician.name) }}</AvatarFallback>
            </Avatar>
            <div>
              <h3 class="text-lg font-semibold">{{ technician.name }}</h3>
              <p class="text-sm text-muted-foreground">{{ technician.id }}</p>
            </div>
          </div>

          <Badge :class="{
            'bg-green-50 text-green-700': technician.status === 'available',
            'bg-amber-50 text-amber-700': technician.status === 'on_job',
            'bg-blue-50 text-blue-700': technician.status === 'en_route',
            'bg-slate-50 text-slate-700': technician.status === 'off_duty' || technician.status === 'break',
            'bg-red-50 text-red-700': technician.status === 'delayed'
          }">
            {{ formatStatus(technician.status) }}
          </Badge>
        </div>

        <!-- Contact Information -->
        <div>
          <h4 class="text-sm font-medium mb-2">Contact Information</h4>
          <div class="space-y-2">
            <div class="flex items-center text-sm">
              <PhoneIcon class="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{{ technician.phone }}</span>
            </div>
            <div class="flex items-center text-sm">
              <MailIcon class="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{{ technician.email }}</span>
            </div>
          </div>
        </div>

        <!-- Skills and Specialties -->
        <div>
          <h4 class="text-sm font-medium mb-2">Skills & Specialties</h4>
          <div class="grid grid-cols-2 gap-y-2 text-sm">
            <div class="text-muted-foreground">Skill Level:</div>
            <div>{{ technician.skillLevel }}</div>

            <div class="text-muted-foreground">Certifications:</div>
            <div>{{ technician.certifications?.join(', ') || 'None' }}</div>
          </div>

          <div class="mt-2 flex flex-wrap gap-1">
            <Badge
                v-for="specialty in technician.specialties"
                :key="specialty"
                variant="outline"
            >
              {{ specialty }}
            </Badge>
          </div>
        </div>

        <!-- Current Assignment -->
        <div v-if="technician.currentAppointment">
          <h4 class="text-sm font-medium mb-2">Current Assignment</h4>
          <div class="bg-muted/30 rounded-md p-3">
            <div class="flex justify-between items-start">
              <div>
                <div class="font-medium">{{ technician.currentAppointment.serviceType }}</div>
                <div class="text-xs text-muted-foreground">{{ technician.currentAppointment.id }}</div>
              </div>
              <Badge :class="{
                'bg-blue-50 text-blue-700': technician.currentAppointment.status === 'en_route',
                'bg-indigo-50 text-indigo-700': technician.currentAppointment.status === 'in_progress'
              }">
                {{ formatAppointmentStatus(technician.currentAppointment.status) }}
              </Badge>
            </div>

            <div class="mt-2 text-sm">
              <div class="flex items-start text-xs">
                <MapPinIcon class="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground" />
                <div>{{ technician.currentAppointment.address }}</div>
              </div>
              <div class="flex items-center mt-1 text-xs">
                <ClockIcon class="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <div>Started: {{ formatTime(technician.currentAppointment.actualStartTime) }}</div>
              </div>
            </div>

            <div class="flex mt-3 space-x-2">
              <Button variant="outline" size="sm" class="text-xs" @click="$emit('view-appointment', technician.currentAppointment.id)">
                <EyeIcon class="h-3.5 w-3.5 mr-1" /> View Appointment
              </Button>
            </div>
          </div>
        </div>

        <!-- Today's Schedule -->
        <div>
          <h4 class="text-sm font-medium mb-2">Today's Schedule</h4>

          <div v-if="todayAppointments.length === 0" class="text-sm text-muted-foreground italic">
            No appointments scheduled for today
          </div>

          <div v-else class="space-y-3">
            <div v-for="appt in todayAppointments" :key="appt.id" class="bg-muted/20 rounded-md p-3">
              <div class="flex justify-between items-start">
                <div>
                  <div class="text-sm">{{ formatTime(appt.scheduledTime) }}</div>
                  <div class="font-medium">{{ appt.serviceType }}</div>
                </div>
                <Badge :class="{
                  'bg-slate-50 text-slate-700': appt.status === 'scheduled',
                  'bg-blue-50 text-blue-700': appt.status === 'en_route',
                  'bg-indigo-50 text-indigo-700': appt.status === 'in_progress',
                  'bg-green-50 text-green-700': appt.status === 'completed',
                  'bg-red-50 text-red-700': appt.status === 'cancelled',
                  'bg-amber-50 text-amber-700': appt.status === 'delayed'
                }">
                  {{ formatAppointmentStatus(appt.status) }}
                </Badge>
              </div>

              <div class="mt-1 text-xs text-muted-foreground">
                {{ truncateText(appt.address, 40) }}
              </div>

              <Button variant="ghost" size="sm" class="mt-2 h-7 text-xs" @click="$emit('view-appointment', appt.id)">
                <EyeIcon class="h-3.5 w-3.5 mr-1" /> View
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SheetFooter class="pt-4">
        <Button variant="outline" @click="$emit('update-status', technician.id)">
          Update Status
        </Button>
        <Button @click="$emit('contact', technician.id)">
          Contact Technician
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { computed } from 'vue';
import { format, parseISO } from 'date-fns';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  PhoneIcon, MailIcon, MapPinIcon, ClockIcon, EyeIcon
} from 'lucide-vue-next';

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  technician: {
    type: Object,
    default: null
  },
  appointments: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'update:open',
  'view-appointment',
  'update-status',
  'contact'
]);

// Get today's appointments for this technician
const todayAppointments = computed(() => {
  if (!props.technician) return [];

  return props.appointments
      .filter(appt => appt.technicianId === props.technician.id)
      .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
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
    'on_job': 'On Service Call',
    'en_route': 'En Route',
    'off_duty': 'Off Duty',
    'break': 'On Break',
    'delayed': 'Delayed'
  };
  return statusMap[status] || status;
}

function formatAppointmentStatus(status) {
  const statusMap = {
    'scheduled': 'Scheduled',
    'en_route': 'En Route',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'rescheduled': 'Rescheduled',
    'delayed': 'Delayed'
  };
  return statusMap[status] || status;
}

function formatTime(dateString) {
  return format(parseISO(dateString), 'h:mm a');
}

function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
</script>