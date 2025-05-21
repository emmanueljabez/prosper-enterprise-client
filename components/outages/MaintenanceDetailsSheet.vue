<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent class="sm:max-w-xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle>
          <div class="flex items-center">
            <div class="mr-2">
              <WrenchIcon v-if="maintenance.maintenanceType === 'planned'" class="h-4 w-4 text-blue-500" />
              <AlertCircleIcon v-else class="h-4 w-4 text-amber-500" />
            </div>
            {{ maintenance.title }}
          </div>
        </SheetTitle>
        <div class="flex items-center space-x-2">
          <Badge :variant="getMaintenanceStatusVariant(maintenance.status)">
            {{ formatMaintenanceStatus(maintenance.status) }}
          </Badge>
          <Badge variant="outline">{{ formatImpact(maintenance.impact) }}</Badge>
          <Badge variant="outline">{{ formatServiceType(maintenance.serviceType) }}</Badge>
        </div>
      </SheetHeader>

      <div class="py-6 space-y-6">
        <!-- Description -->
        <div>
          <h3 class="text-sm font-medium text-muted-foreground mb-1">Description</h3>
          <p>{{ maintenance.description }}</p>
        </div>

        <!-- Timeline -->
        <div>
          <h3 class="text-sm font-medium text-muted-foreground mb-2">Timeline</h3>
          <div class="space-y-4">
            <div class="flex items-center">
              <div class="bg-muted rounded-l-md p-2">
                <CalendarIcon class="h-4 w-4 text-muted-foreground" />
              </div>
              <div class="bg-muted/50 rounded-r-md p-2 flex-1">
                <div class="text-sm font-medium">Start Time</div>
                <div class="text-sm">{{ formatDateTime(maintenance.scheduledStart) }}</div>
              </div>
            </div>

            <div class="flex items-center">
              <div class="bg-muted rounded-l-md p-2">
                <CalendarIcon class="h-4 w-4 text-muted-foreground" />
              </div>
              <div class="bg-muted/50 rounded-r-md p-2 flex-1">
                <div class="text-sm font-medium">End Time</div>
                <div class="text-sm">{{ formatDateTime(maintenance.scheduledEnd) }}</div>
              </div>
            </div>

            <div class="flex items-center" v-if="maintenance.completedAt">
              <div class="bg-muted rounded-l-md p-2">
                <CheckCircleIcon class="h-4 w-4 text-green-500" />
              </div>
              <div class="bg-muted/50 rounded-r-md p-2 flex-1">
                <div class="text-sm font-medium">Completed At</div>
                <div class="text-sm">{{ formatDateTime(maintenance.completedAt) }}</div>
              </div>
            </div>

            <div class="mt-1 text-xs">
              <span class="font-medium">Duration:</span> {{ formatMaintenanceDuration(maintenance) }}
            </div>
          </div>
        </div>

        <!-- Impact Information -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-muted-foreground mb-1">Affected Areas</h3>
            <div class="flex flex-wrap gap-1">
              <Badge v-for="area in maintenance.affectedAreas" :key="area" variant="outline">
                {{ area }}
              </Badge>
              <span v-if="!maintenance.affectedAreas || maintenance.affectedAreas.length === 0" class="text-sm text-muted-foreground">
                None specified
              </span>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-muted-foreground mb-1">Affected Services</h3>
            <div class="flex flex-wrap gap-1">
              <Badge v-for="service in maintenance.affectedServices" :key="service" variant="outline">
                {{ service }}
              </Badge>
              <span v-if="!maintenance.affectedServices || maintenance.affectedServices.length === 0" class="text-sm text-muted-foreground">
                None
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-muted-foreground mb-1">Customers Affected</h3>
            <p>{{ maintenance.estimatedCustomersAffected?.toLocaleString() || '0' }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-muted-foreground mb-1">Assigned To</h3>
            <p>{{ maintenance.technicianAssigned || 'Not assigned' }}</p>
          </div>
        </div>

        <!-- Location Map -->
        <div v-if="maintenance.latitude && maintenance.longitude">
          <h3 class="text-sm font-medium text-muted-foreground mb-1">Location</h3>
          <div class="h-48 bg-muted rounded-md overflow-hidden">
            <!-- Map placeholder - in a real app, implement a map component here -->
            <div class="h-full w-full flex items-center justify-center bg-muted-foreground/10">
              <p class="text-xs text-muted-foreground">
                Map: {{ maintenance.latitude }}, {{ maintenance.longitude }}
              </p>
            </div>
          </div>
        </div>

        <!-- Notification Status -->
        <div>
          <h3 class="text-sm font-medium text-muted-foreground mb-1">Customer Notification</h3>
          <div class="flex items-center space-x-2">
            <div v-if="maintenance.notificationSent" class="flex items-center text-green-500">
              <CheckCircleIcon class="h-4 w-4 mr-1" />
              <span class="text-sm">Notification sent to affected customers</span>
            </div>
            <div v-else class="flex items-center text-amber-500">
              <AlertCircleIcon class="h-4 w-4 mr-1" />
              <span class="text-sm">Customer notification pending</span>
            </div>

            <Button
                v-if="!maintenance.notificationSent"
                size="sm"
                variant="outline"
                @click="$emit('send-notification', maintenance.id)"
            >
              Send Now
            </Button>
          </div>
        </div>

        <!-- Updates -->
        <div v-if="maintenance.updates && maintenance.updates.length > 0">
          <h3 class="text-sm font-medium mb-1">Updates</h3>
          <div class="space-y-3">
            <div v-for="update in sortedUpdates" :key="update.id" class="border rounded-md p-3">
              <div class="flex justify-between items-start">
                <Badge :variant="getMaintenanceStatusVariant(update.status)">
                  {{ formatMaintenanceStatus(update.status) }}
                </Badge>
                <span class="text-xs text-muted-foreground">{{ formatDateTime(update.timestamp) }}</span>
              </div>
              <p class="mt-2 text-sm">{{ update.notes }}</p>
              <p class="mt-1 text-xs text-muted-foreground">By {{ update.updatedBy }}</p>
            </div>
          </div>
        </div>

        <!-- Status Update Form -->
        <div v-if="!['completed', 'cancelled'].includes(maintenance.status)" class="border-t pt-4">
          <h3 class="text-sm font-medium mb-3">Update Status</h3>
          <form @submit.prevent="submitUpdate" class="space-y-3">
            <div class="space-y-2">
              <Label for="updateStatus">Status</Label>
              <Select id="updateStatus" v-model="updateForm.status" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="extended">Extended</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="updateNotes">Notes</Label>
              <Textarea id="updateNotes" v-model="updateForm.notes" required placeholder="Provide details about the current status" />
            </div>

            <div class="flex justify-end space-x-2">
              <Button type="submit">Submit Update</Button>
            </div>
          </form>
        </div>
      </div>

      <div class="mt-4 flex justify-between border-t pt-4">
        <Button variant="outline" @click="$emit('update:open', false)">Close</Button>
        <div class="space-x-2">
          <Button variant="outline" @click="$emit('edit', maintenance)">Edit</Button>
          <Button
              v-if="!['completed', 'cancelled'].includes(maintenance.status)"
              variant="default"
              @click="updateForm.status = 'completed'; submitUpdate()"
          >
            Mark Completed
          </Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format, formatDistance, differenceInMinutes, addMinutes } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  CalendarIcon,
  WrenchIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  maintenance: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:open', 'edit', 'status-update', 'send-notification'])

// Form for status updates
const updateForm = ref({
  status: 'in_progress',
  notes: ''
})

// Computed properties
const sortedUpdates = computed(() => {
  if (!props.maintenance.updates) return []
  return [...props.maintenance.updates].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp)
  })
})

// Methods
function formatDate(dateString) {
  if (!dateString) return ''
  return format(new Date(dateString), 'MMM dd, yyyy')
}

function formatTime(dateString) {
  if (!dateString) return ''
  return format(new Date(dateString), 'h:mm a')
}

function formatDateTime(dateString) {
  if (!dateString) return ''
  return format(new Date(dateString), 'MMM dd, yyyy h:mm a')
}

function formatMaintenanceDuration(maintenance) {
  if (!maintenance.scheduledStart || !maintenance.scheduledEnd) return 'Duration not specified'

  const start = new Date(maintenance.scheduledStart)
  const end = new Date(maintenance.scheduledEnd)
  const minutes = differenceInMinutes(end, start)

  if (minutes < 60) {
    return `${minutes} minutes`
  } else if (minutes < 1440) { // Less than 24 hours
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} min` : ''}`
  } else {
    const days = Math.floor(minutes / 1440)
    const remainingHours = Math.floor((minutes % 1440) / 60)
    return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours} hr` : ''}`
  }
}

function formatMaintenanceStatus(status) {
  const statusMap = {
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'delayed': 'Delayed',
    'extended': 'Extended',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  return statusMap[status] || status
}

function formatImpact(impact) {
  const impactMap = {
    'none': 'No Impact',
    'minor': 'Minor Impact',
    'moderate': 'Moderate Impact',
    'major': 'Major Impact'
  }
  return impactMap[impact] || impact
}

function formatServiceType(type) {
  const typeMap = {
    'fiber': 'Fiber',
    'wireless': 'Wireless',
    'backbone': 'Backbone',
    'data_center': 'Data Center'
  }
  return typeMap[type] || type
}

function getMaintenanceStatusVariant(status) {
  const variantMap = {
    'scheduled': 'secondary',
    'in_progress': 'primary',
    'delayed': 'warning',
    'extended': 'warning',
    'completed': 'success',
    'cancelled': 'destructive'
  }
  return variantMap[status] || 'secondary'
}

function submitUpdate() {
  emit('status-update', props.maintenance.id, {
    status: updateForm.value.status,
    notes: updateForm.value.notes
  })

  // Reset form
  updateForm.value = {
    status: 'in_progress',
    notes: ''
  }
}
</script>