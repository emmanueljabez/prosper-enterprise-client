<!-- filepath: c:\Users\user\Documents\pcash-inventory\pcash-inventory\components\warehouse\packing\PackingStationDetailsDialog.vue -->
<template>
  <DialogContent class="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle class="flex items-center">
        <LayoutDashboardIcon class="h-5 w-5 mr-2" />
        Packing Station Details
        <Badge class="ml-3" :variant="getStatusVariant(station.status)">
          {{ station.status }}
        </Badge>
      </DialogTitle>
      <DialogDescription>
        View detailed information about this packing station
      </DialogDescription>
    </DialogHeader>

    <div class="grid gap-6 py-4">
      <!-- Station Information -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Station ID</div>
          <div class="font-medium">{{ station.id }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Station Name</div>
          <div class="font-medium">{{ station.name }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Type</div>
          <div class="flex items-center">
            {{ formatStationType(station.type) }}
            <Badge 
              v-if="station.type !== 'standard'" 
              variant="outline" 
              class="ml-2"
            >
              {{ station.type }}
            </Badge>
          </div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Location</div>
          <div>{{ station.location || 'Not specified' }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Status</div>
          <div class="flex items-center">
            <Badge :variant="getStatusVariant(station.status)">
              {{ station.status }}
            </Badge>
            <span v-if="station.statusSince" class="ml-2 text-xs text-muted-foreground">
              since {{ formatDate(station.statusSince) }}
            </span>
          </div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Operator</div>
          <div v-if="station.operator">{{ station.operator }}</div>
          <Badge v-else variant="outline">Unassigned</Badge>
        </div>
      </div>

      <!-- Features and Equipment -->
      <div class="space-y-2">
        <h4 class="text-sm font-medium">Features & Equipment</h4>
        <div class="rounded-md border p-3 space-y-2">
          <div v-if="station.features && station.features.length">
            <div class="grid grid-cols-2 gap-3">
              <div class="flex items-center space-x-2">
                <CheckIcon 
                  v-if="hasFeature('scale')" 
                  class="h-4 w-4 text-success" 
                />
                <XIcon 
                  v-else 
                  class="h-4 w-4 text-muted-foreground" 
                />
                <span>Integrated Scale</span>
              </div>
              <div class="flex items-center space-x-2">
                <CheckIcon 
                  v-if="hasFeature('printer')" 
                  class="h-4 w-4 text-success" 
                />
                <XIcon 
                  v-else 
                  class="h-4 w-4 text-muted-foreground" 
                />
                <span>Label Printer</span>
              </div>
              <div class="flex items-center space-x-2">
                <CheckIcon 
                  v-if="hasFeature('scanner')" 
                  class="h-4 w-4 text-success" 
                />
                <XIcon 
                  v-else 
                  class="h-4 w-4 text-muted-foreground" 
                />
                <span>Barcode Scanner</span>
              </div>
              <div class="flex items-center space-x-2">
                <CheckIcon 
                  v-if="hasFeature('verification')" 
                  class="h-4 w-4 text-success" 
                />
                <XIcon 
                  v-else 
                  class="h-4 w-4 text-muted-foreground" 
                />
                <span>Verification System</span>
              </div>
              <div class="flex items-center space-x-2">
                <CheckIcon 
                  v-if="hasFeature('hazmat')" 
                  class="h-4 w-4 text-success" 
                />
                <XIcon 
                  v-else 
                  class="h-4 w-4 text-muted-foreground" 
                />
                <span>HAZMAT Certified</span>
              </div>
              <div class="flex items-center space-x-2">
                <CheckIcon 
                  v-if="hasFeature('fragile')" 
                  class="h-4 w-4 text-success" 
                />
                <XIcon 
                  v-else 
                  class="h-4 w-4 text-muted-foreground" 
                />
                <span>Fragile Items Handling</span>
              </div>
            </div>
          </div>
          <div v-else class="text-muted-foreground text-sm">
            Standard packing station without special features
          </div>

          <div v-if="station.equipment && station.equipment.length" class="border-t pt-2 mt-2">
            <h5 class="text-xs font-medium text-muted-foreground mb-2">Equipment</h5>
            <div class="flex flex-wrap gap-2">
              <Badge 
                v-for="item in station.equipment" 
                :key="item"
                variant="outline"
              >
                {{ item }}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Tasks -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium">Current Tasks</h4>
          <Badge 
            v-if="stationTasks.length" 
            variant="outline"
          >
            {{ stationTasks.length }} tasks
          </Badge>
        </div>
        
        <div v-if="isTasksLoading" class="flex justify-center py-8 border rounded-md">
          <Loader2Icon class="h-5 w-5 animate-spin text-muted-foreground" />
          <span class="ml-2 text-sm text-muted-foreground">Loading tasks...</span>
        </div>
        
        <div v-else-if="stationTasks.length === 0" class="py-8 text-center border rounded-md">
          <PackageOpenIcon class="h-8 w-8 mx-auto text-muted-foreground opacity-40" />
          <p class="mt-2 text-sm text-muted-foreground">No tasks currently assigned to this station</p>
        </div>
        
        <div v-else class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="task in stationTasks" :key="task.id">
                <TableCell class="font-medium">{{ task.id }}</TableCell>
                <TableCell>
                  <div class="flex flex-col">
                    <span>#{{ task.orderNumber }}</span>
                    <span class="text-xs text-muted-foreground">{{ task.customerName }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getPriorityVariant(task.priority)">
                    {{ formatPriority(task.priority) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge :variant="getTaskStatusVariant(task.status)">
                    {{ formatTaskStatus(task.status) }}
                  </Badge>
                </TableCell>
                <TableCell>{{ task.items.length }}</TableCell>
                <TableCell class="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    @click="viewTaskDetails(task)"
                  >
                    <EyeIcon class="h-3 w-3 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <!-- Usage Stats -->
      <div class="space-y-2" v-if="station.stats">
        <h4 class="text-sm font-medium">Usage Statistics</h4>
        <div class="grid grid-cols-3 gap-4">
          <div class="border rounded-md p-3 space-y-1">
            <div class="text-xs font-medium text-muted-foreground">Tasks Completed</div>
            <div class="text-xl font-semibold">{{ station.stats.tasksCompleted || 0 }}</div>
            <div class="text-xs text-muted-foreground">All time</div>
          </div>
          <div class="border rounded-md p-3 space-y-1">
            <div class="text-xs font-medium text-muted-foreground">Avg. Completion Time</div>
            <div class="text-xl font-semibold">{{ formatDuration(station.stats.avgCompletionTime) }}</div>
            <div class="text-xs text-muted-foreground">Per task</div>
          </div>
          <div class="border rounded-md p-3 space-y-1">
            <div class="text-xs font-medium text-muted-foreground">Utilization Rate</div>
            <div class="text-xl font-semibold">{{ formatPercent(station.stats.utilizationRate) }}</div>
            <div class="text-xs text-muted-foreground">Last 30 days</div>
          </div>
        </div>
      </div>

      <!-- Maintenance History -->
      <div class="space-y-2" v-if="station.maintenanceHistory && station.maintenanceHistory.length">
        <h4 class="text-sm font-medium">Maintenance History</h4>
        <div class="rounded-md border">
          <div class="p-3 border-b last:border-0" v-for="(record, index) in station.maintenanceHistory.slice(0, 3)" :key="index">
            <div class="flex justify-between">
              <div class="font-medium">{{ record.type }}</div>
              <div class="text-sm text-muted-foreground">{{ formatDate(record.date) }}</div>
            </div>
            <div class="text-sm mt-1">{{ record.description }}</div>
            <div class="text-xs text-muted-foreground mt-1">Performed by: {{ record.technician }}</div>
          </div>
          <div v-if="station.maintenanceHistory.length > 3" class="p-3 text-center text-sm">
            <Button variant="ghost" size="sm" @click="showAllMaintenance = true">
              View All {{ station.maintenanceHistory.length }} Records
            </Button>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="space-y-2" v-if="station.notes">
        <h4 class="text-sm font-medium">Notes</h4>
        <div class="rounded-md border p-3 whitespace-pre-line text-sm">
          {{ station.notes }}
        </div>
      </div>
    </div>

    <DialogFooter class="flex items-center justify-between">
      <div>
        <Button 
          v-if="station.status === 'available' || station.status === 'busy'" 
          variant="outline"
          size="sm"
          @click="$emit('assign-task', station)"
        >
          <PlusCircleIcon class="h-4 w-4 mr-2" />
          Assign Task
        </Button>
      </div>
      <div class="space-x-2">
        <Button 
          v-if="station.status !== 'maintenance'" 
          variant="outline"
          @click="$emit('set-status', station, 'maintenance')"
        >
          <WrenchIcon class="h-4 w-4 mr-2" />
          Set Maintenance
        </Button>
        <Button 
          variant="outline" 
          @click="$emit('edit-station', station)"
        >
          <Edit2Icon class="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button 
          variant="default" 
          @click="$emit('close')"
        >
          Close
        </Button>
      </div>
    </DialogFooter>

    <!-- All Maintenance History Dialog -->
    <Dialog v-model:open="showAllMaintenance">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Maintenance History</DialogTitle>
          <DialogDescription>
            Complete maintenance history for {{ station.name }}
          </DialogDescription>
        </DialogHeader>
        <div class="max-h-[400px] overflow-y-auto">
          <div class="rounded-md border">
            <div 
              class="p-3 border-b last:border-0" 
              v-for="(record, index) in station.maintenanceHistory" 
              :key="index"
            >
              <div class="flex justify-between">
                <div class="font-medium">{{ record.type }}</div>
                <div class="text-sm text-muted-foreground">{{ formatDate(record.date) }}</div>
              </div>
              <div class="text-sm mt-1">{{ record.description }}</div>
              <div class="text-xs text-muted-foreground mt-1">Performed by: {{ record.technician }}</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button @click="showAllMaintenance = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import {
  CheckIcon,
  Edit2Icon,
  EyeIcon,
  LayoutDashboardIcon,
  Loader2Icon,
  PackageOpenIcon,
  PlusCircleIcon,
  WrenchIcon,
  XIcon
} from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const props = defineProps({
  station: {
    type: Object,
    required: true
  },
  stationTasks: {
    type: Array,
    default: () => []
  },
  isTasksLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'close',
  'edit-station',
  'view-task',
  'set-status',
  'assign-task'
])

// State
const showAllMaintenance = ref(false)

// Methods
function viewTaskDetails(task) {
  emit('view-task', task)
}

function hasFeature(feature) {
  return props.station.features && props.station.features.includes(feature)
}

function formatStationType(type) {
  switch (type) {
    case 'standard': return 'Standard Packing Station'
    case 'large': return 'Large Item Packing Station'
    case 'special': return 'Special Handling Station'
    default: return type
  }
}

function formatTaskStatus(status) {
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
    case 'available': return 'success'
    case 'busy': return 'warning'
    case 'offline': return 'outline'
    case 'maintenance': return 'destructive'
    default: return 'secondary'
  }
}

function getTaskStatusVariant(status) {
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
  return format(new Date(dateString), 'MMM d, yyyy')
}

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return 'N/A'
  
  if (minutes < 60) {
    return `${minutes} min`
  } else {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }
}

function formatPercent(value) {
  if (!value && value !== 0) return 'N/A'
  return `${value}%`
}
</script>