<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Schedule Field Service Appointment</DialogTitle>
        <DialogDescription>
          Create a new appointment for {{ ticket ? 'ticket #' + ticket.id : 'a customer' }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Service Type -->
          <div class="md:col-span-2">
            <Label for="serviceType">Service Type</Label>
            <Select v-model="formData.serviceType">
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fiber Installation">Fiber Installation</SelectItem>
                <SelectItem value="Equipment Repair">Equipment Repair</SelectItem>
                <SelectItem value="Equipment Replacement">Equipment Replacement</SelectItem>
                <SelectItem value="Line Repair">Line Repair</SelectItem>
                <SelectItem value="Service Upgrade">Service Upgrade</SelectItem>
                <SelectItem value="Service Relocation">Service Relocation</SelectItem>
                <SelectItem value="Signal Troubleshooting">Signal Troubleshooting</SelectItem>
                <SelectItem value="Network Extension">Network Extension</SelectItem>
                <SelectItem value="Routine Maintenance">Routine Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Appointment Type -->
          <div>
            <Label for="type">Appointment Type</Label>
            <Select v-model="formData.type">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="upgrade">Upgrade</SelectItem>
                <SelectItem value="relocation">Relocation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Priority -->
          <div>
            <Label for="priority">Priority</Label>
            <Select v-model="formData.priority">
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Appointment Date -->
          <div>
            <Label for="appointmentDate">Appointment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" class="w-full justify-start text-left font-normal">
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ formData.appointmentDate ? format(formData.appointmentDate, 'PPP') : 'Pick a date' }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0" align="start">
                <Calendar mode="single" v-model="formData.appointmentDate" />
              </PopoverContent>
            </Popover>
          </div>

          <!-- Appointment Time -->
          <div>
            <Label for="appointmentTime">Appointment Time</Label>
            <Select v-model="formData.appointmentTime">
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup v-for="(times, period) in availableTimes" :key="period">
                  <SelectLabel>{{ period }}</SelectLabel>
                  <SelectItem v-for="time in times" :key="time.value" :value="time.value">
                    {{ time.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <!-- Estimated Duration -->
          <div>
            <Label for="estimatedDuration">Estimated Duration (minutes)</Label>
            <Input
                type="number"
                v-model="formData.estimatedDuration"
                min="30"
                step="15"
            />
          </div>

          <!-- Assign Technician -->
          <div class="md:col-span-2">
            <Label for="technicianId">Assign Technician</Label>
            <Select v-model="formData.technicianId">
              <SelectTrigger>
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Assign Later</SelectItem>
                <SelectItem
                    v-for="tech in availableTechnicians"
                    :key="tech.id"
                    :value="tech.id"
                >
                  {{ tech.name }} ({{ formatTechnicianStatus(tech.status) }})
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-sm text-muted-foreground mt-1">
              Optional: You can assign a technician now or later
            </p>
          </div>

          <!-- Equipment Needed -->
          <div class="md:col-span-2">
            <Label>Equipment Needed</Label>
            <div class="space-y-2">
              <div v-for="(item, index) in formData.equipmentNeeded" :key="index" class="flex gap-2">
                <Select
                    v-model="item.id"
                    class="flex-1"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                        v-for="eq in availableEquipment"
                        :key="eq.id"
                        :value="eq.id"
                    >
                      {{ eq.name }} ({{ eq.stockLevel }} in stock)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Input
                    type="number"
                    v-model="item.quantity"
                    min="1"
                    class="w-20"
                />
                <Button type="button" variant="ghost" size="icon" @click="removeEquipmentItem(index)">
                  <XIcon class="h-4 w-4" />
                </Button>
              </div>
              <Button type="button" variant="outline" size="sm" @click="addEquipmentItem">
                <PlusIcon class="h-4 w-4 mr-1" /> Add Equipment
              </Button>
            </div>
            <p class="text-sm text-muted-foreground mt-1">
              Select equipment required for this appointment
            </p>
          </div>

          <!-- Notes -->
          <div class="md:col-span-2">
            <Label for="notes">Notes</Label>
            <Textarea
                v-model="formData.notes"
                placeholder="Add any additional information or special instructions..."
                class="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)">
            Cancel
          </Button>
          <Button type="button" @click="handleSubmit" :disabled="isSubmitting">
            Schedule Appointment
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { format, parseISO, addDays } from 'date-fns';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '#components'; // Adjust these imports to match your project structure
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
  SelectTrigger, SelectValue
} from '#components';
import { Popover, PopoverContent, PopoverTrigger } from '#components';
import { Calendar } from '#components';
import { Button } from '#components';
import { Input } from '#components';
import { Textarea } from '#components';
import { Label } from '#components';
import {
  CalendarIcon, PlusIcon, XIcon
} from 'lucide-vue-next';

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  ticket: {
    type: Object,
    default: null
  },
  technicians: {
    type: Array,
    default: () => []
  },
  inventory: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:open', 'schedule']);

// Form data
const formData = ref({
  serviceType: '',
  type: '',
  priority: 'normal',
  appointmentDate: addDays(new Date(), 1),
  appointmentTime: '09:00',
  estimatedDuration: 60,
  technicianId: '',
  equipmentNeeded: [],
  notes: ''
});

const isSubmitting = ref(false);

// Prepopulate form data from ticket if available
watch(() => props.ticket, (newTicket) => {
  if (newTicket) {
    formData.value = {
      ...formData.value,
      type: newTicket.type || formData.value.type,
      priority: newTicket.priority || formData.value.priority,
      notes: newTicket.description ? `From ticket: ${newTicket.description}` : formData.value.notes
    };
  }
}, { immediate: true });

// Reset form when dialog is opened/closed
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    // Reset form when dialog closes
    formData.value = {
      serviceType: '',
      type: '',
      priority: 'normal',
      appointmentDate: addDays(new Date(), 1),
      appointmentTime: '09:00',
      estimatedDuration: 60,
      technicianId: '',
      equipmentNeeded: [],
      notes: ''
    };
  }
});

// Available times for appointment selection
const availableTimes = {
  'Morning': [
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' }
  ],
  'Afternoon': [
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' }
  ],
  'Evening': [
    { value: '17:00', label: '5:00 PM' },
    { value: '18:00', label: '6:00 PM' }
  ]
};

// Filter available technicians (not off duty)
const availableTechnicians = computed(() => {
  return props.technicians.filter(tech => tech.status !== 'off_duty');
});

// Filter available equipment (in stock)
const availableEquipment = computed(() => {
  return props.inventory.filter(item => item.stockLevel > 0);
});

// Equipment functions
function addEquipmentItem() {
  formData.value.equipmentNeeded.push({
    id: '',
    quantity: 1
  });
}

function removeEquipmentItem(index) {
  formData.value.equipmentNeeded.splice(index, 1);
}

function formatTechnicianStatus(status) {
  const statusMap = {
    'available': 'Available',
    'on_job': 'On Service Call',
    'en_route': 'En Route',
    'break': 'On Break',
    'delayed': 'Delayed'
  };
  return statusMap[status] || status;
}

// Form submission
function handleSubmit() {
  if (!formData.value.serviceType || !formData.value.type || !formData.value.appointmentDate || !formData.value.appointmentTime) {
    alert('Please fill out all required fields');
    return;
  }

  isSubmitting.value = true;

  try {
    // Combine date and time
    const dateTimeStr = `${format(formData.value.appointmentDate, 'yyyy-MM-dd')}T${formData.value.appointmentTime}:00`;
    const scheduledTime = new Date(dateTimeStr);

    // Create appointment object
    const appointment = {
      ...formData.value,
      scheduledTime: scheduledTime.toISOString(),
      status: 'scheduled',
      customerId: props.ticket?.customer?.id || '',
      customerName: props.ticket?.customer?.name || '',
      address: props.ticket?.customer?.address || '',
      contactPhone: props.ticket?.customer?.phone || '',
      ticketId: props.ticket?.id
    };

    // Add equipment details with names
    appointment.equipmentNeeded = formData.value.equipmentNeeded.map(item => {
      const equipment = availableEquipment.value.find(e => e.id === item.id);
      return {
        id: item.id,
        name: equipment ? equipment.name : 'Unknown Equipment',
        quantity: item.quantity
      };
    });

    // Add technician name if assigned
    if (formData.value.technicianId) {
      const technician = availableTechnicians.value.find(t => t.id === formData.value.technicianId);
      if (technician) {
        appointment.technicianName = technician.name;
      }
    }

    // Add initial note if provided
    if (formData.value.notes) {
      appointment.notes = [{
        content: formData.value.notes,
        timestamp: new Date().toISOString(),
        author: 'Scheduler'
      }];
    } else {
      appointment.notes = [];
    }

    // Emit schedule event
    emit('schedule', appointment);

    // Close dialog
    emit('update:open', false);
  } catch (error) {
    console.error('Error scheduling appointment:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>