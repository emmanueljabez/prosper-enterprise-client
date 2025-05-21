<template>
  <div class="divide-y">
    <div v-for="ticket in tickets" :key="ticket.id" class="p-4">
      <div class="flex items-start justify-between">
        <div>
          <div class="font-medium">{{ ticket.title }}</div>
          <div class="text-xs text-muted-foreground">{{ ticket.id }} | {{ formatTicketType(ticket.type) }}</div>
        </div>
        <Badge :class="{
          'bg-red-50 text-red-700': ticket.priority === 'urgent',
          'bg-amber-50 text-amber-700': ticket.priority === 'high',
          'bg-blue-50 text-blue-700': ticket.priority === 'normal',
          'bg-green-50 text-green-700': ticket.priority === 'low'
        }">
          {{ ticket.priority }}
        </Badge>
      </div>

      <div class="mt-2 text-sm">
        {{ truncateText(ticket.description, 100) }}
      </div>

      <div class="mt-2 text-xs text-muted-foreground">
        <div>Customer: {{ ticket.customer.name }}</div>
        <div>{{ formatAddress(ticket.customer.address) }}</div>
        <div>Created: {{ formatDate(ticket.createdAt) }}</div>
      </div>

      <div v-if="ticket.requiredSkills && ticket.requiredSkills.length > 0" class="mt-2 flex flex-wrap gap-1">
        <Badge v-for="skill in ticket.requiredSkills" :key="skill" variant="outline" class="text-xs">
          {{ skill }}
        </Badge>
      </div>

      <div class="flex mt-3 space-x-2">
        <Button variant="default" size="sm" class="text-xs" @click="$emit('schedule', ticket)">
          <CalendarIcon class="h-3 w-3 mr-1" /> Schedule
        </Button>
        <Button variant="outline" size="sm" class="text-xs" @click="$emit('view-ticket', ticket.id)">
          <EyeIcon class="h-3 w-3 mr-1" /> View Ticket
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, EyeIcon } from 'lucide-vue-next';

defineProps({
  tickets: {
    type: Array,
    required: true
  }
});

defineEmits(['schedule', 'view-ticket']);

function formatTicketType(type) {
  const typeMap = {
    'installation': 'Installation',
    'repair': 'Repair',
    'maintenance': 'Maintenance',
    'outage': 'Outage',
    'upgrade': 'Upgrade',
    'relocation': 'Relocation'
  };
  return typeMap[type] || type;
}

function formatDate(dateString) {
  return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
}

function formatAddress(address) {
  return address || 'No address provided';
}

function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
</script>