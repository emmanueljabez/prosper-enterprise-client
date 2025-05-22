<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Packing Tasks</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredTasks.length }} tasks found
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            @click="refreshData" 
            :disabled="loading"
          >
            <RefreshCwIcon v-if="!loading" class="h-4 w-4 mr-2" />
            <Loader2Icon v-else class="h-4 w-4 mr-2 animate-spin" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" @click="resetFilters">
            <XIcon class="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="space-y-2">
          <Label for="search">Search</Label>
          <Input
            id="search"
            v-model="filters.search"
            placeholder="Search by ID, order, or customer..."
          />
        </div>
        <div class="space-y-2">
          <Label for="statusFilter">Status</Label>
          <Select v-model="filters.status">
            <SelectTrigger id="statusFilter">
              <SelectValue :placeholder="getStatusLabel(filters.status)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="stationFilter">Packing Station</Label>
          <Select v-model="filters.station">
            <SelectTrigger id="stationFilter">
              <SelectValue :placeholder="getStationLabel(filters.station)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stations</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem 
                v-for="station in packingStations" 
                :key="station.id" 
                :value="station.id"
              >
                {{ station.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="shippingFilter">Shipping Method</Label>
          <Select v-model="filters.shippingMethod">
            <SelectTrigger id="shippingFilter">
              <SelectValue :placeholder="getShippingMethodLabel(filters.shippingMethod)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="express">Express</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="economy">Economy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('id')"
              >
                Task ID 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'id' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'id' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Order</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('priority')"
              >
                Priority 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'priority' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'priority' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Packing Station</TableHead>
            <TableHead>Shipping Method</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('dueDate')"
              >
                Due Date 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'dueDate' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'dueDate' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading tasks...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedTasks.length === 0" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <PackageXIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No packing tasks found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or create a new packing task
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="task in paginatedTasks" :key="task.id">
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
              <Badge :variant="getStatusVariant(task.status)">
                {{ formatStatus(task.status) }}
              </Badge>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1">
                <span>{{ task.items?.length || 0 }}</span>
                <span class="text-xs text-muted-foreground">
                  ({{ getTotalItemCount(task) }} units)
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div v-if="task.assignedStation">
                <Badge variant="outline">
                  {{ getStationName(task.assignedStation) }}
                </Badge>
                <div class="text-xs text-muted-foreground mt-1">
                  {{ getStationStatus(task.assignedStation) }}
                </div>
              </div>
              <Badge v-else variant="secondary">Unassigned</Badge>
            </TableCell>
            <TableCell>
              <div class="flex flex-col">
                <span>{{ formatShippingMethod(task.shippingMethod) }}</span>
                <span v-if="task.carrier" class="text-xs text-muted-foreground">
                  {{ task.carrier }}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1">
                <span>{{ formatDate(task.dueDate) }}</span>
                <Badge 
                  v-if="isOverdue(task)" 
                  variant="destructive" 
                  class="ml-1"
                >
                  Overdue
                </Badge>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewTaskDetails(task)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    v-if="task.status === 'pending'" 
                    @click="startTask(task)"
                  >
                    <PlayIcon class="mr-2 h-4 w-4" />
                    <span>Start Packing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    v-if="task.status === 'in_progress'" 
                    @click="completeTask(task)"
                  >
                    <CheckIcon class="mr-2 h-4 w-4" />
                    <span>Complete</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="assignStation(task)">
                    <LayoutIcon class="mr-2 h-4 w-4" />
                    <span>Assign Station</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    v-if="task.status === 'completed' || task.status === 'in_progress'" 
                    @click="printLabel(task)"
                  >
                    <PrinterIcon class="mr-2 h-4 w-4" />
                    <span>Print Label</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="printPackingSlip(task)">
                    <ClipboardIcon class="mr-2 h-4 w-4" />
                    <span>Print Packing Slip</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Showing {{ pagination.pageSize * (pagination.page - 1) + 1 }} to
        {{ Math.min(pagination.pageSize * pagination.page, filteredTasks.length) }}
        of {{ filteredTasks.length }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.page <= 1"
          @click="pagination.page--"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.page >= totalPages"
          @click="pagination.page++"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, isPast } from 'date-fns'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ClipboardIcon,
  EyeIcon,
  LayoutIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PackageXIcon,
  PlayIcon,
  PrinterIcon,
  RefreshCwIcon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const props = defineProps({
  packingTasks: {
    type: Array,
    required: true,
    default: () => []
  },
  packingStations: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-task',
  'start-task',
  'complete-task',
  'assign-station',
  'print-label',
  'refresh'
])

// Filters
const filters = ref({
  search: '',
  status: 'all',
  station: 'all',
  shippingMethod: 'all'
})

// Pagination
const pagination = ref({
  page: 1,
  pageSize: 10
})

// Sorting
const sortConfig = ref({
  key: 'dueDate',
  direction: 'asc'
})

// Computed properties
const filteredTasks = computed(() => {
  let result = [...props.packingTasks]
  
  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(task => 
      task.id.toLowerCase().includes(searchTerm) ||
      task.orderNumber.toLowerCase().includes(searchTerm) ||
      (task.customerName && task.customerName.toLowerCase().includes(searchTerm))
    )
  }
  
  // Apply status filter
  if (filters.value.status !== 'all') {
    result = result.filter(task => task.status === filters.value.status)
  }
  
  // Apply station filter
  if (filters.value.station !== 'all') {
    if (filters.value.station === 'unassigned') {
      result = result.filter(task => !task.assignedStation)
    } else {
      result = result.filter(task => task.assignedStation === filters.value.station)
    }
  }
  
  // Apply shipping method filter
  if (filters.value.shippingMethod !== 'all') {
    result = result.filter(task => task.shippingMethod === filters.value.shippingMethod)
  }
  
  // Apply sorting
  result.sort((a, b) => {
    let aValue = a[sortConfig.value.key]
    let bValue = b[sortConfig.value.key]
    
    // Handle nested properties like 'items.length'
    if (sortConfig.value.key === 'items.length') {
      aValue = a.items.length
      bValue = b.items.length
    }
    
    // Compare values
    if (aValue < bValue) {
      return sortConfig.value.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.value.direction === 'asc' ? 1 : -1
    }
    return 0
  })
  
  return result
})

const paginatedTasks = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredTasks.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredTasks.value.length / pagination.value.pageSize)
})

// Methods
function refreshData() {
  emit('refresh')
}

function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    station: 'all',
    shippingMethod: 'all'
  }
}

function sortBy(key) {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
}

function viewTaskDetails(task) {
  emit('view-task', task)
}

function startTask(task) {
  emit('start-task', task)
}

function completeTask(task) {
  emit('complete-task', task)
}

function assignStation(task) {
  emit('assign-station', task)
}

function printLabel(task) {
  emit('print-label', task)
}

function printPackingSlip(task) {
  // In a real implementation, you might handle printing directly here
  // or you might emit an event to be handled by the parent component
  
  // Example of direct printing to the console
  console.log(`Printing packing slip for task ${task.id}, order #${task.orderNumber}`)
}

// Helper functions
function getStatusLabel(status) {
  switch (status) {
    case 'all': return 'All Statuses'
    case 'pending': return 'Pending'
    case 'in_progress': return 'In Progress'
    case 'completed': return 'Completed'
    case 'cancelled': return 'Cancelled'
    default: return status
  }
}

function getStationLabel(stationId) {
  if (stationId === 'all') return 'All Stations'
  if (stationId === 'unassigned') return 'Unassigned'
  
  const station = props.packingStations.find(s => s.id === stationId)
  return station ? station.name : stationId
}

function getStationName(stationId) {
  const station = props.packingStations.find(s => s.id === stationId)
  return station ? station.name : stationId
}

function getStationStatus(stationId) {
  const station = props.packingStations.find(s => s.id === stationId)
  return station ? station.status : 'Unknown'
}

function getShippingMethodLabel(method) {
  switch (method) {
    case 'all': return 'All Methods'
    case 'standard': return 'Standard'
    case 'express': return 'Express'
    case 'priority': return 'Priority'
    case 'economy': return 'Economy'
    default: return method
  }
}

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

function formatShippingMethod(method) {
  switch (method) {
    case 'standard': return 'Standard'
    case 'express': return 'Express'
    case 'priority': return 'Priority'
    case 'economy': return 'Economy'
    default: return method || 'Not specified'
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
  return format(new Date(dateString), 'MMM d, yyyy')
}

function isOverdue(task) {
  if (task.status === 'completed' || task.status === 'cancelled') return false
  return isPast(new Date(task.dueDate))
}

function getTotalItemCount(task) {
  if (!task.items) return 0;
  return task.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })
</script>