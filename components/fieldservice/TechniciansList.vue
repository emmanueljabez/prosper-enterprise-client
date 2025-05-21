<template>
  <div class="divide-y">
    <div v-for="technician in technicians" :key="technician.id"
         class="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
         @click="$emit('view', technician)">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="relative">
            <Avatar>
              <AvatarImage :src="technician.avatar" />
              <AvatarFallback>{{ getInitials(technician.name) }}</AvatarFallback>
            </Avatar>
            <div :class="{
                'absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white': true,
                'bg-green-500': technician.status === 'available',
                'bg-amber-500': technician.status === 'on_job' || technician.status === 'en_route',
                'bg-slate-400': technician.status === 'off_duty' || technician.status === 'break',
                'bg-red-500': technician.status === 'delayed'
              }">
            </div>
          </div>
          <div>
            <div class="font-medium">{{ technician.name }}</div>
            <div class="text-xs text-muted-foreground">{{ formatTechnicianId(technician.id) }}</div>
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

      <div class="mt-2 grid grid-cols-2 gap-x-1 text-xs">
        <div class="text-muted-foreground">Skill Level:</div>
        <div>{{ technician.skillLevel || 'N/A' }}</div>

        <div class="text-muted-foreground">Specialties:</div>
        <div>{{ technician.specialties && technician.specialties.length > 0 ? technician.specialties.join(', ') : 'None' }}</div>

        <div v-if="technician.currentLocation" class="text-muted-foreground">Location:</div>
        <div v-if="technician.currentLocation">{{ truncateText(technician.currentLocation, 25) }}</div>
      </div>

      <div v-if="technician.nextAppointment" class="mt-2 text-xs">
        <div class="text-muted-foreground">Next Appointment:</div>
        <div>{{ technician.nextAppointment }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Badge } from '#components';
import { Avatar, AvatarImage, AvatarFallback } from '#components';

defineProps({
  technicians: {
    type: Array,
    required: true
  }
});

defineEmits(['view']);

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

function getInitials(name) {
  if (!name) return '';
  return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
}

function formatTechnicianId(id) {
  if (!id) return '';
  return id.startsWith('TECH-') ? id : `TECH-${id}`;
}

function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
</script>