<!-- filepath: c:\Users\user\Documents\pcash-inventory\pcash-inventory\components\warehouse\picking\PickingTasksTable.vue -->
<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Picking Tasks</h3>
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
          <Button 
            variant="default" 
            size="sm" 
            @click="$emit('batch-pick', selectedTasks)" 
            :disabled="!hasSelectedTasks"
          >
            <ClipboardListIcon class="h-4 w-4 mr-2" />
            Batch Pick
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="space-y-2">
          <Label for="search">Search</Label>
          <Input
            id="search"
            v-model="filters.search"
            placeholder="Search by ID, order, or items..."
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
          <Label for="priorityFilter">Priority</Label>
          <Select v-model="filters.priority">
            <SelectTrigger id="priorityFilter">
              <SelectValue :placeholder="getPriorityLabel(filters.priority)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="assignedFilter">Assignment</Label>
          <Select v-model="filters.assigned">
            <SelectTrigger id="assignedFilter">
              <SelectValue :placeholder="getAssignmentLabel(filters.assigned)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
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
            <TableHead class="w-[50px]">
              <Checkbox 
                :checked="isAllSelected" 
                :indeterminate="isSomeSelected && !isAllSelected"
                @update:checked="toggleSelectAll"
              />
            </TableHead>
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
            <TableHead>Location</TableHead>
            <TableHead>Assigned To</TableHead>
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
            <TableCell colSpan="10" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading tasks...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedTasks.length === 0" class="h-24">
            <TableCell colSpan="10" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <PackageXIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No picking tasks found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or create a new picking task
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="task in paginatedTasks" :key="task.id">
            <TableCell>
              <Checkbox
                :checked="selectedTasks.includes(task.id)"
                @update:checked="() => toggleTaskSelection(task.id)"
              />
            </TableCell>
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
                <span>{{ task.items.length }}</span>
                <span class="text-xs text-muted-foreground">
                  ({{ getTotalQuantity(task) }} units)
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-col">
                <span>{{ getLocationName(task.locationId) || 'Unknown' }}</span>
                <span v-if="task.pathId" class="text-xs text-muted-foreground">
                  Path: {{ getPathName(task.pathId) || 'Custom' }}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge v-if="task.assignedTo" variant="outline">
                {{ task.assignedTo }}
              </Badge>
              <Badge v-else variant="secondary">Unassigned</Badge>
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
                <Badge 
                  v-else-if="isDueSoon(task)" 
                  variant="warning" 
                  class="ml-1"
                >
                  Soon
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
                    <span>Start Picking</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    v-if="task.status === 'in_progress'" 
                    @click="completeTask(task)"
                  >
                    <CheckIcon class="mr-2 h-4 w-4" />
                    <span>Complete</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="assignTask(task)">
                    <UserIcon class="mr-2 h-4 w-4" />
                    <span>Assign</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    v-if="task.pathId" 
                    @click="$emit('optimize-path', task.pathId)"
                  >
                    <RouteIcon class="mr-2 h-4 w-4" />
                    <span>Optimize Path</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="printTaskSheet(task)">
                    <PrinterIcon class="mr-2 h-4 w-4" />
                    <span>Print Pick Sheet</span>
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
import { format, isPast, addDays } from 'date-fns'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  EyeIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PackageXIcon,
  PlayIcon,
  PrinterIcon,
  RefreshCwIcon,
  RouteIcon,
  UserIcon,
  XIcon,
  ClipboardListIcon,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  pickingTasks: {
    type: Array,
    required: true,
    default: () => []
  },
  pickPaths: {
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
  'assign-task',
  'optimize-path',
  'refresh',
  'batch-pick',
  'print-task'
])

// Filters
const filters = ref({
  search: '',
  status: 'all',
  priority: 'all',
  assigned: 'all'
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

// Selected tasks
const selectedTasks = ref([])

// Computed properties
const hasSelectedTasks = computed(() => selectedTasks.value.length > 0)

const filteredTasks = computed(() => {
  let result = [...props.pickingTasks]
  
  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(task => 
      task.id.toLowerCase().includes(searchTerm) ||
      task.orderNumber.toLowerCase().includes(searchTerm) ||
      (task.customerName && task.customerName.toLowerCase().includes(searchTerm)) ||
      task.items.some(item => 
        item.sku.toLowerCase().includes(searchTerm) ||
        item.name.toLowerCase().includes(searchTerm)
      )
    )
  }
  
  // Apply status filter
  if (filters.value.status !== 'all') {
    result = result.filter(task => task.status === filters.value.status)
  }
  
  // Apply priority filter
  if (filters.value.priority !== 'all') {
    result = result.filter(task => task.priority === filters.value.priority)
  }
  
  // Apply assignment filter
  if (filters.value.assigned !== 'all') {
    if (filters.value.assigned === 'assigned') {
      result = result.filter(task => !!task.assignedTo)
    } else {
      result = result.filter(task => !task.assignedTo)
    }
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

const isAllSelected = computed(() => {
  return paginatedTasks.value.length > 0 && paginatedTasks.value.every(task => 
    selectedTasks.value.includes(task.id)
  )
})

const isSomeSelected = computed(() => {
  return selectedTasks.value.length > 0 && !isAllSelected.value
})

// Methods
function refreshData() {
  selectedTasks.value = []
  emit('refresh')
}

function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    priority: 'all',
    assigned: 'all'
  }
}

function toggleSelectAll(checked) {
  if (checked) {
    selectedTasks.value = paginatedTasks.value.map(task => task.id)
  } else {
    selectedTasks.value = []
  }
}

function toggleTaskSelection(id) {
  const index = selectedTasks.value.indexOf(id)
  if (index === -1) {
    selectedTasks.value.push(id)
  } else {
    selectedTasks.value.splice(index, 1)
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

function assignTask(task) {
  emit('assign-task', task)
}

function printTaskSheet(task) {
  emit('print-task', task)
  
  // In a real implementation, you might handle printing directly here
  // or you might emit an event to be handled by the parent component
  
  // Example of direct implementation:
  // const printWindow = window.open('', '_blank')
  // printWindow.document.write(`
  //   <html>
  //     <head><title>Picking Task #${task.id}</title></head>
  //     <body>
  //       <h1>Picking Task #${task.id}</h1>
  //       <p>Order: ${task.orderNumber}</p>
  //       <p>Due: ${formatDate(task.dueDate)}</p>
  //       <table>
  //         <thead>
  //           <tr>
  //             <th>SKU</th>
  //             <th>Item</th>
  //             <th>Quantity</th>
  //             <th>Location</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           ${task.items.map(item => `
  //             <tr>
  //               <td>${item.sku}</td>
  //               <td>${item.name}</td>
  //               <td>${item.quantity}</td>
  //               <td>${item.locationId}</td>
  //             </tr>
  //           `).join('')}
  //         </tbody>
  //       </table>
  //     </body>
  //   </html>
  // `)
  // printWindow.document.close()
  // printWindow.print()
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

function getPriorityLabel(priority) {
  switch (priority) {
    case 'all': return 'All Priorities'
    case 'low': return 'Low'
    case 'normal': return 'Normal'
    case 'high': return 'High'
    case 'urgent': return 'Urgent'
    default: return priority
  }
}

function getAssignmentLabel(assigned) {
  switch (assigned) {
    case 'all': return 'All Tasks'
    case 'assigned': return 'Assigned Only'
    case 'unassigned': return 'Unassigned Only'
    default: return assigned
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

function isDueSoon(task) {
  if (task.status === 'completed' || task.status === 'cancelled') return false
  
  const today = new Date()
  const dueDate = new Date(task.dueDate)
  const threeDaysFromNow = addDays(today, 3)
  
  return !isPast(dueDate) && dueDate <= threeDaysFromNow
}

function getTotalQuantity(task) {
  return task.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
}

function getLocationName(locationId) {
  // This would ideally be replaced with a lookup from a locations store
  return locationId
}

function getPathName(pathId) {
  const path = props.pickPaths.find(path => path.id === pathId)
  return path ? path.name : null
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })
</script>