<template>
  <DialogContent class="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle class="flex items-center">
        <ClipboardListIcon class="h-5 w-5 mr-2" />
        Picking Task Details
        <Badge class="ml-3" :variant="getStatusVariant(task.status)">
          {{ formatStatus(task.status) }}
        </Badge>
      </DialogTitle>
      <DialogDescription>
        View and manage details for this picking task
      </DialogDescription>
    </DialogHeader>

    <div class="grid gap-6 py-4">
      <!-- Task Information -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Task ID</div>
          <div class="font-medium">{{ task.id }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Order</div>
          <div class="font-medium">#{{ task.orderNumber }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Customer</div>
          <div class="font-medium">{{ task.customerName || 'N/A' }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Priority</div>
          <Badge :variant="getPriorityVariant(task.priority)">
            {{ formatPriority(task.priority) }}
          </Badge>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Created At</div>
          <div>{{ formatDate(task.createdAt) }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Due Date</div>
          <div class="flex items-center">
            {{ formatDate(task.dueDate) }}
            <Badge 
              v-if="isOverdue(task)" 
              variant="destructive" 
              class="ml-2"
            >
              Overdue
            </Badge>
            <Badge 
              v-else-if="isDueSoon(task)" 
              variant="warning" 
              class="ml-2"
            >
              Due Soon
            </Badge>
          </div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Assigned To</div>
          <div v-if="task.assignedTo">{{ task.assignedTo }}</div>
          <Badge v-else variant="outline">Unassigned</Badge>
        </div>
        <div v-if="task.pathId" class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Pick Path</div>
          <div>{{ task.pathName || task.pathId }}</div>
        </div>
      </div>

      <!-- Items to Pick -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium">Items to Pick ({{ task.items.length }})</h4>
          <Button 
            variant="outline" 
            size="sm" 
            v-if="task.status === 'pending' || task.status === 'in_progress'"
          >
            <PrinterIcon class="h-4 w-4 mr-2" />
            Print Pick List
          </Button>
        </div>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in task.items" :key="item.lineItemId">
                <TableCell>
                  <div class="flex items-center space-x-3">
                    <div class="h-10 w-10 rounded-md border flex items-center justify-center bg-muted/50">
                      <PackageIcon class="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>{{ item.name }}</div>
                  </div>
                </TableCell>
                <TableCell>{{ item.sku }}</TableCell>
                <TableCell>
                  <Badge variant="outline">{{ item.locationId || 'No location' }}</Badge>
                </TableCell>
                <TableCell>
                  <div class="font-medium">{{ item.quantity }}</div>
                  <div v-if="item.pickedQuantity" class="text-xs text-muted-foreground">
                    {{ item.pickedQuantity }} picked
                  </div>
                </TableCell>
                <TableCell>
                  <Badge v-if="item.status" :variant="getStatusVariant(item.status)">
                    {{ formatStatus(item.status) }}
                  </Badge>
                  <Badge v-else variant="secondary">Pending</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <!-- Notes -->
      <div class="space-y-2" v-if="task.notes">
        <h4 class="text-sm font-medium">Notes</h4>
        <div class="rounded-md border p-3 whitespace-pre-line text-sm">
          {{ task.notes }}
        </div>
      </div>

      <!-- Pick History -->
      <div class="space-y-2" v-if="task.history && task.history.length > 0">
        <h4 class="text-sm font-medium">Activity History</h4>
        <div class="rounded-md border p-2">
          <div v-for="(entry, index) in task.history" :key="index" class="py-2 px-1 border-b last:border-0">
            <div class="flex items-start justify-between">
              <div class="flex items-start">
                <ActivityIcon class="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                <div>
                  <div class="text-sm">{{ entry.action }}</div>
                  <div class="text-xs text-muted-foreground">{{ formatDate(entry.timestamp) }}</div>
                </div>
              </div>
              <div class="text-sm text-muted-foreground">
                {{ entry.user || 'System' }}
              </div>
            </div>
            <div v-if="entry.details" class="mt-1 ml-6 text-xs text-muted-foreground">
              {{ entry.details }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter class="flex items-center justify-between">
      <div>
        <Button 
          v-if="task.status !== 'completed' && task.status !== 'cancelled'"
          variant="outline"
          size="sm"
          @click="$emit('assign-task', task)"
        >
          <UserIcon class="h-4 w-4 mr-2" />
          {{ task.assignedTo ? 'Reassign' : 'Assign' }}
        </Button>
      </div>
      <div class="space-x-2">
        <Button variant="outline" @click="$emit('close')">Close</Button>
        <Button 
          v-if="task.status === 'pending'" 
          variant="default" 
          @click="$emit('start-task', task)"
        >
          <PlayIcon class="h-4 w-4 mr-2" />
          Start Picking
        </Button>
        <Button 
          v-if="task.status === 'in_progress'" 
          variant="default"
          @click="$emit('complete-task', task)"
        >
          <CheckIcon class="h-4 w-4 mr-2" />
          Complete
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { format, isPast, addDays } from 'date-fns'
import {
  ActivityIcon,
  CheckIcon,
  ClipboardListIcon,
  PackageIcon,
  PlayIcon,
  PrinterIcon,
  UserIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

defineEmits(['close', 'start-task', 'complete-task', 'assign-task'])

// Helper functions
function formatStatus(status) {
  switch (status) {
    case 'pending': return 'Pending'
    case 'in_progress': return 'In Progress'
    case 'completed': return 'Completed'
    case 'cancelled': return 'Cancelled'
    default: return status
  }
}

function formatPriority(priority) {
  switch (priority) {
    case 'low': return 'Low'
    case 'normal': return 'Normal'
    case 'high': return 'High'
    case 'urgent': return 'Urgent'
    default: return priority
  }
}

function getStatusVariant(status) {
  switch (status) {
    case 'pending': return 'secondary'
    case 'in_progress': return 'default'
    case 'completed': return 'success'
    case 'cancelled': return 'destructive'
    default: return 'outline'
  }
}

function getPriorityVariant(priority) {
  switch (priority) {
    case 'low': return 'outline'
    case 'normal': return 'secondary'
    case 'high': return 'warning'
    case 'urgent': return 'destructive'
    default: return 'outline'
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'MMM d, yyyy h:mm a')
}

function isOverdue(task) {
  if (task.status === 'completed' || task.status === 'cancelled') return false
  return isPast(new Date(task.dueDate))
}

function isDueSoon(task) {
  if (task.status === 'completed' || task.status === 'cancelled') return false
  
  const today = new Date()
  const dueDate = new Date(task.dueDate)
  const threeDaysFromNow = addDays(today, 3)
  
  return !isPast(dueDate) && dueDate <= threeDaysFromNow
}
</script>