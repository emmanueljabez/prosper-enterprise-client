<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent class="sm:max-w-xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle>
          <div class="flex items-center">
            <div class="mr-2">
              <span class="inline-block w-3 h-3 rounded-full" :class="{
                'bg-red-500': outage.severity === 'critical',
                'bg-amber-500': outage.severity === 'major',
                'bg-blue-500': outage.severity === 'minor',
                'bg-purple-500': outage.severity === 'degraded'
              }"></span>
            </div>
            {{ outage.title }}
          </div>
        </SheetTitle>
        <div class="flex items-center space-x-2">
          <Badge :variant="getStatusVariant(outage.status)">
            {{ formatStatus(outage.status) }}
          </Badge>
          <Badge variant="outline">{{ formatSeverity(outage.severity) }}</Badge>
          <Badge variant="outline">{{ formatServiceType(outage.serviceType) }}</Badge>
        </div>
      </SheetHeader>

      <div class="py-6 space-y-6">
        <!-- Description -->
        <div>
          <h3 class="text-sm font-medium text-muted-foreground mb-1">Description</h3>
          <p>{{ outage.description }}</p>
        </div>

        <!-- Timeline -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-muted-foreground">Timeline</h3>
            <div class="text-xs text-muted-foreground">
              {{ formatDuration(outage) }}
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-start">
              <div class="relative mr-3">
                <div class="h-2 w-2 rounded-full bg-primary mt-1"></div>
                <div class="absolute top-3 bottom-0 left-1 -ml-px w-px bg-border"></div>
              </div>
              <div>
                <p class="text-sm font-medium">Outage Reported</p>
                <p class="text-xs text-muted-foreground">{{ formatDateTime(outage.startedAt) }}</p>
              </div>
            </div>

            <div class="flex items-start" v-if="outage.resolvedAt">
              <div class="relative mr-3">
                <div class="h-2 w-2 rounded-full bg-green-500 mt-1"></div>
              </div>
              <div>
                <p class="text-sm font-medium">Resolved</p>
                <p class="text-xs text-muted-foreground">{{ formatDateTime(outage.resolvedAt) }}</p>
              </div>
            </div>
            <div class="flex items-start" v-else-if="outage.estimatedResolutionTime">
              <div class="relative mr-3">
                <div class="h-2 w-2 rounded-full bg-amber-500 mt-1"></div>
              </div>
              <div>
                <p class="text-sm font-medium">Estimated Resolution</p>
                <p class="text-xs text-muted-foreground">{{ formatDateTime(outage.estimatedResolutionTime) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Impact Information -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-muted-foreground mb-1">Affected Areas</h3>
            <div class="flex flex-wrap gap-1">
              <Badge v-for="area in outage.affectedAreas" :key="area" variant="outline">
                {{ area }}
              </Badge>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-muted-foreground mb-1">Affected Services</h3>
            <div class="flex flex-wrap gap-1">
              <Badge v-for="service in outage.affectedServices" :key="service" variant="outline">
                {{ service }}
              </Badge>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-muted-foreground mb-1">Customers Affected</h3>
            <p>{{ outage.estimatedCustomersAffected?.toLocaleString() || 'Unknown' }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-muted-foreground mb-1">Technicians</h3>
            <p>{{ outage.techniciansDispatched ? 'Dispatched' : 'Not Dispatched' }}</p>
          </div>
        </div>

        <!-- Location Map -->
        <div v-if="outage.latitude && outage.longitude">
          <h3 class="text-sm font-medium text-muted-foreground mb-1">Location</h3>
          <div class="h-48 bg-muted rounded-md overflow-hidden">
            <!-- Map placeholder - in a real app, implement a map component here -->
            <div class="h-full w-full flex items-center justify-center bg-muted-foreground/10">
              <p class="text-xs text-muted-foreground">
                Map: {{ outage.latitude }}, {{ outage.longitude }}
              </p>
            </div>
          </div>
        </div>

        <!-- Resolution Information -->
        <div v-if="outage.status === 'resolved'">
          <h3 class="text-sm font-medium mb-1">Resolution Details</h3>
          <div class="space-y-3 bg-muted p-3 rounded-md">
            <div>
              <h4 class="text-xs font-medium text-muted-foreground">Root Cause</h4>
              <p class="text-sm">{{ outage.rootCause || 'Not specified' }}</p>
            </div>
            <div>
              <h4 class="text-xs font-medium text-muted-foreground">Resolution</h4>
              <p class="text-sm">{{ outage.resolution || 'Not specified' }}</p>
            </div>
          </div>
        </div>

        <!-- Updates -->
        <div>
          <h3 class="text-sm font-medium mb-1">Updates</h3>
          <div class="space-y-3">
            <div v-for="update in sortedUpdates" :key="update.id" class="border rounded-md p-3">
              <div class="flex justify-between items-start">
                <Badge :variant="getStatusVariant(update.status)">
                  {{ formatStatus(update.status) }}
                </Badge>
                <span class="text-xs text-muted-foreground">{{ formatDateTime(update.timestamp) }}</span>
              </div>
              <p class="mt-2 text-sm">{{ update.notes }}</p>
              <p class="mt-1 text-xs text-muted-foreground">By {{ update.updatedBy }}</p>
            </div>

            <div v-if="!outage.updates || outage.updates.length === 0" class="text-sm text-muted-foreground text-center py-2">
              No updates yet
            </div>
          </div>
        </div>

        <!-- Status Update Form -->
        <div v-if="outage.status !== 'resolved'" class="border-t pt-4">
          <h3 class="text-sm font-medium mb-3">Add Update</h3>
          <form @submit.prevent="submitUpdate" class="space-y-3">
            <div class="space-y-2">
              <Label for="updateStatus">Status</Label>
              <Select id="updateStatus" v-model="updateForm.status" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="identified">Identified</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="mitigated">Mitigated</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="updateNotes">Notes</Label>
              <Textarea id="updateNotes" v-model="updateForm.notes" required placeholder="Provide details about the current status" />
            </div>

            <!-- Resolution fields (shown only when status is resolved) -->
            <div v-if="updateForm.status === 'resolved'" class="space-y-3 border-t pt-3">
              <div class="space-y-2">
                <Label for="rootCause">Root Cause</Label>
                <Textarea id="rootCause" v-model="updateForm.rootCause" placeholder="What caused the outage?" />
              </div>

              <div class="space-y-2">
                <Label for="resolution">Resolution</Label>
                <Textarea id="resolution" v-model="updateForm.resolution" placeholder="How was the issue resolved?" />
              </div>
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
          <Button variant="outline" @click="$emit('edit', outage)">Edit</Button>
          <Button v-if="outage.status !== 'resolved'" variant="default" @click="$emit('resolved', outage)">Mark Resolved</Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format, formatDistance } from 'date-fns'
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

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  outage: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:open', 'edit', 'status-update', 'resolved'])

// Form for status updates
const updateForm = ref({
  status: 'monitoring',
  notes: '',
  rootCause: '',
  resolution: ''
})

// Computed properties
const sortedUpdates = computed(() => {
  if (!props.outage.updates) return []
  return [...props.outage.updates].sort((a, b) => {
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

function formatDuration(outage) {
  const start = new Date(outage.startedAt)
  const end = outage.resolvedAt ? new Date(outage.resolvedAt) : new Date()

  return outage.resolvedAt ?
      `Duration: ${formatDistance(start, end)}` :
      `Ongoing for ${formatDistance(start, end)}`
}

function formatStatus(status) {
  const statusMap = {
    'investigating': 'Investigating',
    'identified': 'Identified',
    'monitoring': 'Monitoring',
    'in_progress': 'In Progress',
    'mitigated': 'Mitigated',
    'resolved': 'Resolved'
  }
  return statusMap[status] || status
}

function formatSeverity(severity) {
  const severityMap = {
    'critical': 'Critical',
    'major': 'Major',
    'minor': 'Minor',
    'degraded': 'Degraded'
  }
  return severityMap[severity] || severity
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

function getStatusVariant(status) {
  const variantMap = {
    'investigating': 'secondary',
    'identified': 'warning',
    'monitoring': 'info',
    'in_progress': 'primary',
    'mitigated': 'info',
    'resolved': 'success'
  }
  return variantMap[status] || 'secondary'
}

function submitUpdate() {
  emit('status-update', props.outage.id, {
    status: updateForm.value.status,
    notes: updateForm.value.notes,
    rootCause: updateForm.value.rootCause,
    resolution: updateForm.value.resolution
  })

  // Reset form
  updateForm.value = {
    status: 'monitoring',
    notes: '',
    rootCause: '',
    resolution: ''
  }
}
</script>