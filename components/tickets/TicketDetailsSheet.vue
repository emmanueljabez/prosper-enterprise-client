<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent class="sm:max-w-xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle class="flex items-center justify-between">
          <div>Ticket #{{ ticket.id }}</div>
          <Badge :class="{
            'bg-green-100 text-green-800': ticket.status === 'resolved' || ticket.status === 'closed',
            'bg-amber-100 text-amber-800': ticket.status === 'in_progress',
            'bg-red-100 text-red-800': ticket.status === 'escalated',
            'bg-blue-100 text-blue-800': ticket.status === 'open',
            'bg-purple-100 text-purple-800': ticket.status === 'pending_customer',
          }">
            {{ formatStatus(ticket.status) }}
          </Badge>
        </SheetTitle>
        <SheetDescription>{{ ticket.title }}</SheetDescription>
      </SheetHeader>

      <div class="mt-6 space-y-6">
        <!-- Ticket Details -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h4 class="text-sm font-medium mb-1">Customer</h4>
            <p class="text-sm">{{ ticket.customer.name }}</p>
            <p class="text-xs text-muted-foreground">ID: {{ ticket.customer.id }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium mb-1">Created</h4>
            <p class="text-sm">{{ formatDate(ticket.createdAt) }}</p>
            <p class="text-xs text-muted-foreground">{{ formatTimeAgo(ticket.createdAt) }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium mb-1">Type</h4>
            <Badge variant="outline">{{ ticket.type }}</Badge>
          </div>
          <div>
            <h4 class="text-sm font-medium mb-1">Priority</h4>
            <Badge :class="{
              'bg-red-100 text-red-800': ticket.priority === 'urgent',
              'bg-amber-100 text-amber-800': ticket.priority === 'high',
              'bg-blue-100 text-blue-800': ticket.priority === 'medium',
              'bg-green-100 text-green-800': ticket.priority === 'low',
            }">
              {{ ticket.priority }}
            </Badge>
          </div>
          <div>
            <h4 class="text-sm font-medium mb-1">Assigned To</h4>
            <p v-if="ticket.assignedTo" class="text-sm">{{ ticket.assignedTo }}</p>
            <p v-else class="text-sm text-muted-foreground">Unassigned</p>
          </div>
          <div>
            <h4 class="text-sm font-medium mb-1">SLA</h4>
            <Badge :variant="ticket.slaStatus === 'at_risk' ? 'destructive' : 'outline'">
              {{ ticket.slaStatus === 'at_risk' ? 'At Risk' : 'On Track' }}
            </Badge>
          </div>
        </div>

        <!-- Description -->
        <div>
          <h4 class="text-sm font-medium mb-2">Description</h4>
          <div class="text-sm bg-muted/50 p-3 rounded-md">
            {{ ticket.description }}
          </div>
        </div>

        <!-- Customer Contact -->
        <div>
          <h4 class="text-sm font-medium mb-2">Customer Contact</h4>
          <div class="text-sm space-y-1">
            <div class="flex items-center">
              <PhoneIcon class="h-4 w-4 mr-2 text-muted-foreground" />
              {{ ticket.customer.phone }}
            </div>
            <div class="flex items-center">
              <MailIcon class="h-4 w-4 mr-2 text-muted-foreground" />
              {{ ticket.customer.email }}
            </div>
            <div class="flex items-center">
              <MapPinIcon class="h-4 w-4 mr-2 text-muted-foreground" />
              {{ ticket.customer.address }}
            </div>
          </div>
        </div>

        <!-- Equipment -->
        <div v-if="ticket.equipment">
          <h4 class="text-sm font-medium mb-2">Customer Equipment</h4>
          <div class="text-sm space-y-1 bg-muted/50 p-3 rounded-md">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Type:</span>
              <span>{{ ticket.equipment.type }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Model:</span>
              <span>{{ ticket.equipment.model }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Serial:</span>
              <span>{{ ticket.equipment.serialNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">MAC:</span>
              <span>{{ ticket.equipment.macAddress }}</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-medium">Notes & Updates</h4>
            <Button size="sm" variant="outline" @click="showAddNoteForm = true" v-if="!showAddNoteForm">
              Add Note
            </Button>
          </div>

          <div v-if="showAddNoteForm" class="mb-4 bg-muted/30 p-3 rounded-md">
            <Textarea
                v-model="newNote"
                placeholder="Add a note about this ticket..."
                class="mb-2"
            />
            <div class="flex justify-end space-x-2">
              <Button size="sm" variant="outline" @click="showAddNoteForm = false">
                Cancel
              </Button>
              <Button size="sm" @click="addNote">
                Save Note
              </Button>
            </div>
          </div>

          <div class="space-y-3">
            <div v-for="note in ticket.notes" :key="note.id" class="bg-muted/30 p-3 rounded-md">
              <div class="text-sm">{{ note.content }}</div>
              <div class="text-xs text-muted-foreground mt-1 flex justify-between">
                <span>{{ note.createdBy }}</span>
                <span>{{ formatDate(note.createdAt) }}</span>
              </div>
            </div>
            <div v-if="ticket.notes.length === 0" class="text-sm text-muted-foreground text-center py-2">
              No notes yet
            </div>
          </div>
        </div>

        <!-- Activity History -->
        <div>
          <h4 class="text-sm font-medium mb-2">Activity History</h4>
          <div class="space-y-2">
            <div v-for="(activity, index) in ticket.history" :key="index"
                 class="text-xs border-l-2 border-muted pl-3 py-1">
              <div class="font-medium">{{ activity.action }}</div>
              <div v-if="activity.details" class="text-muted-foreground mt-0.5">
                {{ activity.details }}
              </div>
              <div class="text-muted-foreground mt-0.5">
                {{ formatDate(activity.timestamp) }} by {{ activity.user }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap justify-between gap-2 mt-6">
        <div class="space-x-2">
          <Button
              v-if="!ticket.assignedTo"
              variant="outline"
              @click="$emit('assign', ticket)"
          >
            <UserCheckIcon class="h-4 w-4 mr-2" />
            Assign
          </Button>
          <Button
              v-if="ticket.status !== 'escalated'"
              variant="outline"
              @click="$emit('escalate', ticket)"
          >
            <ArrowUpRightIcon class="h-4 w-4 mr-2" />
            Escalate
          </Button>
          <Button
              v-if="ticket.status !== 'resolved'"
              variant="outline"
              @click="$emit('resolve', ticket)"
          >
            <CheckIcon class="h-4 w-4 mr-2" />
            Resolve
          </Button>
        </div>
        <div class="space-x-2">
          <Button @click="$emit('schedule-visit', ticket)">
            <CalendarIcon class="h-4 w-4 mr-2" />
            Schedule Visit
          </Button>
          <Button variant="secondary" @click="$emit('customer-callback', ticket)">
            <PhoneIcon class="h-4 w-4 mr-2" />
            Call Customer
          </Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref } from 'vue'
import { format, formatDistance } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  CalendarIcon,
  UserCheckIcon,
  ArrowUpRightIcon,
  CheckIcon
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  ticket: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'update:open',
  'assign',
  'escalate',
  'resolve',
  'schedule-visit',
  'customer-callback',
  'add-note'
])

const showAddNoteForm = ref(false)
const newNote = ref('')

function formatDate(dateString) {
  return format(new Date(dateString), 'MMM d, yyyy h:mm a')
}

function formatTimeAgo(dateString) {
  return formatDistance(new Date(dateString), new Date(), { addSuffix: true })
}

function formatStatus(status) {
  const statusMap = {
    'open': 'Open',
    'in_progress': 'In Progress',
    'pending_customer': 'Pending Customer',
    'escalated': 'Escalated',
    'resolved': 'Resolved',
    'closed': 'Closed'
  }
  return statusMap[status] || status
}

function addNote() {
  if (newNote.value.trim()) {
    emit('add-note', props.ticket.id, newNote.value)
    newNote.value = ''
    showAddNoteForm.value = false
  }
}
</script>