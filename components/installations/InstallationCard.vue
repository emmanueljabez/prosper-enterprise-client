<template>
  <div
      class="border rounded-md shadow-sm bg-background p-3 hover:shadow-md transition-shadow cursor-pointer"
      :class="{ 'opacity-50': isDragging }"
      :draggable="draggable"
      @dragstart="$emit('dragstart', $event)"
      @dragend="isDragging = false"
  >
    <!-- Installation Header -->
    <div class="flex items-start justify-between mb-2">
      <div>
        <div class="flex items-center">
          <Badge :variant="getStatusVariant(installation.status)" class="mr-2">
            {{ formatStatus(installation.status) }}
          </Badge>
          <span class="text-xs text-muted-foreground">
            #{{ installation.installationNumber }}
          </span>
        </div>
        <h4 class="font-medium truncate">{{ installation.customer.name }}</h4>
      </div>

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger as="button" class="p-1 rounded-md hover:bg-muted focus:outline-none">
            <MoreVerticalIcon class="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" @click.stop>
            <DropdownMenuItem @click="$emit('view-installation', installation)">
              <EyeIcon class="h-4 w-4 mr-2" />
              <span>View Details</span>
            </DropdownMenuItem>

            <DropdownMenuItem
                v-if="installation.status !== 'completed' && installation.status !== 'cancelled'"
                @click="$emit('update-status', installation)"
            >
              <ActivityIcon class="h-4 w-4 mr-2" />
              <span>Update Status</span>
            </DropdownMenuItem>

            <DropdownMenuItem
                v-if="installation.status === 'pending' || installation.status === 'scheduled' || installation.status === 'delayed'"
                @click="$emit('reschedule', installation)"
            >
              <CalendarIcon class="h-4 w-4 mr-2" />
              <span>Reschedule</span>
            </DropdownMenuItem>

            <DropdownMenuItem
                v-if="installation.status === 'pending' || installation.status === 'scheduled'"
                @click="$emit('assign-technician', installation)"
            >
              <UserIcon class="h-4 w-4 mr-2" />
              <span>Assign Technician</span>
            </DropdownMenuItem>

            <DropdownMenuItem
                v-if="installation.status === 'in_progress'"
                @click="$emit('complete-installation', installation)"
            >
              <CheckCircleIcon class="h-4 w-4 mr-2" />
              <span>Mark Complete</span>
            </DropdownMenuItem>

            <DropdownMenuItem
                v-if="installation.status === 'completed'"
                @click="$emit('generate-report', installation)"
            >
              <FileTextIcon class="h-4 w-4 mr-2" />
              <span>Generate Report</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Installation Content -->
    <div class="space-y-2 text-sm">
      <!-- Date Information -->
      <div class="flex items-center">
        <CalendarIcon class="h-3.5 w-3.5 mr-1 text-muted-foreground" />
        <span>
          {{ installation.scheduledDate ? formatDate(installation.scheduledDate) : 'Not scheduled' }}
          {{ installation.timeSlot ? ` (${formatTimeSlot(installation.timeSlot)})` : '' }}
        </span>
      </div>

      <!-- Location -->
      <div class="flex items-center">
        <MapPinIcon class="h-3.5 w-3.5 mr-1 text-muted-foreground" />
        <span class="truncate">{{ installation.location.address }}</span>
      </div>

      <!-- Services -->
      <div v-if="installation.services && installation.services.length > 0" class="space-y-1 mt-2">
        <div class="text-xs text-muted-foreground">Services:</div>
        <div class="flex flex-wrap gap-1">
          <Badge
              v-for="service in installation.services.slice(0, 2)"
              :key="service.id"
              variant="outline"
              class="text-xs"
          >
            {{ service.name }}
          </Badge>
          <Badge v-if="installation.services.length > 2" variant="outline" class="text-xs">
            +{{ installation.services.length - 2 }} more
          </Badge>
        </div>
      </div>

      <!-- Technician info if assigned -->
      <div v-if="installation.technician" class="flex items-center border-t pt-2 mt-2">
        <Avatar class="h-5 w-5 mr-2">
          <AvatarImage :src="installation.technician.avatar" />
          <AvatarFallback>{{ installation.technician.initials }}</AvatarFallback>
        </Avatar>
        <span class="text-xs">{{ installation.technician.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from '@/components/ui/avatar'
import {
  MoreVerticalIcon,
  CalendarIcon,
  MapPinIcon,
  EyeIcon,
  ActivityIcon,
  UserIcon,
  CheckCircleIcon,
  FileTextIcon
} from 'lucide-vue-next'

const props = defineProps({
  installation: {
    type: Object,
    required: true
  },
  draggable: {
    type: [Boolean, String],
    default: false
  }
})

const emit = defineEmits([
  'dragstart',
  'view-installation',
  'update-status',
  'reschedule',
  'assign-technician',
  'complete-installation',
  'generate-report'
])

const isDragging = ref(false)

function formatDate(dateString) {
  if (!dateString) return 'Not scheduled'
  return format(parseISO(dateString), 'dd MMM yyyy')
}

function formatTimeSlot(timeSlot) {
  const timeSlotMap = {
    'morning': 'Morning',
    'afternoon': 'Afternoon'
  }

  return timeSlotMap[timeSlot] || timeSlot
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'on_site': 'On Site',
    'delayed': 'Delayed',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }

  return statusMap[status] || status
}

function getStatusVariant(status) {
  const variantMap = {
    'pending': 'secondary',
    'scheduled': 'warning',
    'in_progress': 'primary',
    'on_site': 'primary',
    'delayed': 'destructive',
    'completed': 'success',
    'cancelled': 'destructive'
  }

  return variantMap[status] || 'default'
}
</script>