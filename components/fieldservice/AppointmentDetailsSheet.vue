<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent class="sm:max-w-xl">
      <SheetHeader>
        <SheetTitle>Appointment Details</SheetTitle>
        <SheetDescription>View and manage appointment information</SheetDescription>
      </SheetHeader>

      <div v-if="appointment" class="space-y-6 py-4">
        <!-- Appointment Status -->
        <div class="flex justify-between items-center">
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

          <Select v-model="updateStatus" :disabled="appointment.status === 'completed' || appointment.status === 'cancelled'">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Schedule</SelectItem>
              <SelectItem value="en_route">En Route</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Complete</SelectItem>
              <SelectItem value="delayed">Delay</SelectItem>
              <SelectItem value="cancelled">Cancel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Appointment ID and Type -->
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-semibold">{{ appointment.id }}</h3>
            <p class="text-muted-foreground">{{ appointment.serviceType }}</p>
          </div>

          <Badge :class="{
            'bg-red-50 text-red-700': appointment.priority === 'urgent',
            'bg-amber-50 text-amber-700': appointment.priority === 'high',
            'bg-blue-50 text-blue-700': appointment.priority === 'normal',
            'bg-green-50 text-green-700': appointment.priority === 'low'
          }">
            {{ appointment.priority }}
          </Badge>
        </div>

        <!-- Related Ticket -->
        <div v-if="appointment.ticketId" class="bg-muted/30 rounded-md p-3">
          <div class="flex justify-between items-start">
            <div>
              <h4 class="text-sm font-medium">Related Ticket</h4>
              <p class="text-xs text-muted-foreground">{{ appointment.ticketId }}</p>
            </div>
            <Button variant="ghost" size="sm" class="h-8 px-2" @click="$emit('view-ticket', appointment.ticketId)">
              <ExternalLinkIcon class="h-4 w-4 mr-1" /> View
            </Button>
          </div>
        </div>

        <!-- Customer Details -->
        <div>
          <h4 class="text-sm font-medium mb-2">Customer Information</h4>
          <div class="bg-muted/30 rounded-md p-3 space-y-2">
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ appointment.customerName }}</span>
              <Badge variant="outline">{{ appointment.customerId }}</Badge>
            </div>
            <div class="text-sm">
              <div class="flex items-start">
                <MapPinIcon class="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <div>{{ appointment.address }}</div>
              </div>
              <div class="flex items-center mt-1">
                <PhoneIcon class="h-4 w-4 mr-2 text-muted-foreground" />
                <div>{{ appointment.contactPhone }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Technician Details -->
        <div>
          <h4 class="text-sm font-medium mb-2">Assigned Technician</h4>
          <div v-if="appointment.technicianId" class="bg-muted/30 rounded-md p-3">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <Avatar class="h-8 w-8">
                  <AvatarFallback>{{ getInitials(appointment.technicianName) }}</AvatarFallback>
                </Avatar>
                <span>{{ appointment.technicianName }}</span>
              </div>
              <Button variant="outline" size="sm" @click="$emit('reassign', appointment)">
                <UserPlusIcon class="h-4 w-4 mr-1" /> Reassign
              </Button>
            </div>
          </div>
          <div v-else class="flex justify-center p-3 border border-dashed rounded-md">
            <Button variant="outline" @click="$emit('assign', appointment)">
              <UserPlusIcon class="h-4 w-4 mr-1" /> Assign Technician
            </Button>
          </div>
        </div>

        <!-- Schedule Information -->
        <div>
          <h4 class="text-sm font-medium mb-2">Schedule Information</h4>
          <div class="bg-muted/30 rounded-md p-3 space-y-2">
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="text-muted-foreground">Scheduled Time:</div>
              <div>{{ formatDateTime(appointment.scheduledTime) }}</div>

              <div class="text-muted-foreground">Estimated Duration:</div>
              <div>{{ formatDuration(appointment.estimatedDuration) }}</div>

              <template v-if="appointment.actualStartTime">
                <div class="text-muted-foreground">Actual Start:</div>
                <div>{{ formatDateTime(appointment.actualStartTime) }}</div>
              </template>

              <template v-if="appointment.actualEndTime">
                <div class="text-muted-foreground">Actual End:</div>
                <div>{{ formatDateTime(appointment.actualEndTime) }}</div>

                <div class="text-muted-foreground">Actual Duration:</div>
                <div>{{ calculateActualDuration(appointment.actualStartTime, appointment.actualEndTime) }}</div>
              </template>
            </div>
          </div>
        </div>

        <!-- Equipment Needed -->
        <div v-if="appointment.equipmentNeeded && appointment.equipmentNeeded.length > 0">
          <h4 class="text-sm font-medium mb-2">Equipment Required</h4>
          <div class="bg-muted/30 rounded-md p-3">
            <ul class="space-y-2">
              <li v-for="item in appointment.equipmentNeeded" :key="item.id" class="flex justify-between text-sm">
                <span>{{ item.name }}</span>
                <span>Qty: {{ item.quantity }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Equipment Used (if completed) -->
        <div v-if="appointment.equipmentUsed && appointment.equipmentUsed.length > 0">
          <h4 class="text-sm font-medium mb-2">Equipment Used</h4>
          <div class="bg-muted/30 rounded-md p-3">
            <ul class="space-y-2">
              <li v-for="item in appointment.equipmentUsed" :key="item.id" class="flex justify-between text-sm">
                <span>{{ item.name }}</span>
                <span>Qty: {{ item.quantity }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <h4 class="text-sm font-medium mb-2">Notes</h4>
          <div class="border rounded-md">
            <div v-if="appointment.notes && appointment.notes.length > 0" class="divide-y">
              <div v-for="(note, index) in appointment.notes" :key="index" class="p-3">
                <div class="text-sm">{{ note.content }}</div>
                <div class="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                  <span>{{ note.author }}</span>
                  <span>{{ formatDateTime(note.timestamp) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="p-3 text-sm text-muted-foreground text-center">
              No notes available
            </div>

            <!-- Add Note -->
            <div class="p-3 border-t">
              <Textarea
                  v-model="newNote"
                  placeholder="Add a note..."
                  class="min-h-[80px]"
              />
              <div class="flex justify-end mt-2">
                <Button size="sm" :disabled="!newNote" @click="addNote">
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="py-6 text-center text-muted-foreground">
        Loading appointment details...
      </div>

      <SheetFooter class="mt-6">
        <Button v-if="updateStatus" variant="default"
                @click="updateAppointmentStatus">
          Update Status
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, watch } from 'vue';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  MapPinIcon, PhoneIcon, UserPlusIcon, ExternalLinkIcon
} from 'lucide-vue-next';

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  appointment: {
    type: Object,
    default: null
  }
});

const emit = defineEmits([
  'update:open',
  'update-status',
  'add-note',
  'assign',
  'reassign',
  'view-ticket'
]);

const newNote = ref('');
const updateStatus = ref('');

watch(() => props.appointment, () => {
  // Reset state when appointment changes
  newNote.value = '';
  updateStatus.value = '';
}, { deep: true });

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

function formatDateTime(dateString) {
  return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function calculateActualDuration(startTime, endTime) {
  const duration = differenceInMinutes(parseISO(endTime), parseISO(startTime));
  return formatDuration(duration);
}

function getInitials(name) {
  return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
}

function addNote() {
  if (!newNote.value.trim()) return;

  emit('add-note', props.appointment.id, newNote.value);
  newNote.value = '';
}

function updateAppointmentStatus() {
  if (!updateStatus.value) return;

  emit('update-status', props.appointment.id, updateStatus.value, newNote.value || undefined);
  updateStatus.value = '';
  newNote.value = '';
}
</script>