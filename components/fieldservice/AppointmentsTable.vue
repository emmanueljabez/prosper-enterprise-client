<template>
  <div class="w-full overflow-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Scheduled</TableHead>
          <TableHead>Technician</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="appointment in appointments" :key="appointment.id"
                  :class="{'bg-amber-50': isAtRisk(appointment), 'bg-red-50': isSlaBreached(appointment)}">
          <TableCell class="font-medium">{{ appointment.id }}</TableCell>
          <TableCell>
            <div class="flex flex-col">
              <span>{{ appointment.customerName }}</span>
              <span class="text-xs text-muted-foreground">{{ truncateText(appointment.address, 20) }}</span>
            </div>
          </TableCell>
          <TableCell>{{ appointment.serviceType }}</TableCell>
          <TableCell>
            <div class="flex flex-col">
              <span>{{ formatDate(appointment.scheduledTime) }}</span>
              <span class="text-xs text-muted-foreground">{{ formatTime(appointment.scheduledTime) }}</span>
            </div>
          </TableCell>
          <TableCell>
            <div class="flex items-center gap-2">
              <span>{{ appointment.technicianName || 'Unassigned' }}</span>
              <Button v-if="!appointment.technicianId" size="sm" variant="outline" class="h-7 px-2" @click="$emit('assign', appointment)">
                <UserPlusIcon class="h-3.5 w-3.5 mr-1" />
                Assign
              </Button>
            </div>
          </TableCell>
          <TableCell>
            <Badge :class="{
              'bg-slate-50 text-slate-700': appointment.status === 'scheduled',
              'bg-blue-50 text-blue-700': appointment.status === 'en_route',
              'bg-indigo-50 text-indigo-700': appointment.status === 'in_progress',
              'bg-green-50 text-green-700': appointment.status === 'completed',
              'bg-red-50 text-red-700': appointment.status === 'cancelled',
              'bg-amber-50 text-amber-700': appointment.status === 'delayed'
            }">
              {{ formatStatus(appointment.status) }}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge :class="{
              'bg-red-50 text-red-700': appointment.priority === 'urgent',
              'bg-amber-50 text-amber-700': appointment.priority === 'high',
              'bg-blue-50 text-blue-700': appointment.priority === 'normal',
              'bg-green-50 text-green-700': appointment.priority === 'low'
            }">
              {{ appointment.priority }}
            </Badge>
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                  <MoreHorizontalIcon class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="$emit('view', appointment)">
                  <EyeIcon class="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem @click="$emit('reassign', appointment)">
                  <UserPlusIcon class="h-4 w-4 mr-2" />
                  Reassign
                </DropdownMenuItem>
                <DropdownMenuItem @click="$emit('update-status', appointment, 'in_progress')">
                  <PlayIcon class="h-4 w-4 mr-2" />
                  Mark In Progress
                </DropdownMenuItem>
                <DropdownMenuItem @click="$emit('update-status', appointment, 'completed')">
                  <CheckIcon class="h-4 w-4 mr-2" />
                  Mark Completed
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="$emit('update-status', appointment, 'cancelled')" class="text-red-600">
                  <XIcon class="h-4 w-4 mr-2" />
                  Cancel Appointment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<script setup>
import { format, isToday, isPast, parseISO, addHours } from 'date-fns';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontalIcon, EyeIcon, UserPlusIcon, CheckIcon, XIcon, PlayIcon
} from 'lucide-vue-next';

defineProps({
  appointments: {
    type: Array,
    required: true
  }
});

defineEmits(['view', 'assign', 'reassign', 'update-status']);

function formatDate(dateString) {
  const date = parseISO(dateString);
  return isToday(date) ? 'Today' : format(date, 'MMM d, yyyy');
}

function formatTime(dateString) {
  return format(parseISO(dateString), 'h:mm a');
}

function formatStatus(status) {
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

function isAtRisk(appointment) {
  return appointment.slaStatus === 'at_risk' && !appointment.slaBreached;
}

function isSlaBreached(appointment) {
  return appointment.slaBreached;
}

function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
</script>