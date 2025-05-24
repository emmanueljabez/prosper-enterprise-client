<template>
  <div class="space-y-4">
    <!-- Table Filters -->
    <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div class="flex items-center space-x-2">
        <div>
          <Select v-model="typeFilter" class="w-[200px]">
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="batch_high">High Frequency</SelectItem>
              <SelectItem value="batch_medium">Medium Frequency</SelectItem>
              <SelectItem value="batch_low">Low Frequency</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select v-model="statusFilter" class="w-[160px]">
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input 
            placeholder="Search schedules..." 
            v-model="searchQuery"
            class="w-[200px]"
          />
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          @click="$emit('refresh')"
        >
          <RefreshCcw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
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
                @click="sortBy('name')"
              >
                Name 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'name' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'name' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('type')"
              >
                Type 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'type' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'type' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('schedule.frequency')"
              >
                Frequency 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'schedule.frequency' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'schedule.frequency' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('scope')"
              >
                Scope 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'scope' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'scope' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next Run</TableHead>
            <TableHead>Last Run Status</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody v-if="!loading">
          <TableRow 
            v-for="schedule in paginatedSchedules" 
            :key="schedule.id"
            :class="{ 'bg-muted/50': selectedSchedules.includes(schedule.id) }"
          >
            <TableCell>
              <Checkbox 
                :checked="selectedSchedules.includes(schedule.id)" 
                @update:checked="toggleSelectSchedule(schedule.id)"
              />
            </TableCell>
            <TableCell class="font-medium">
              {{ schedule.name }}
              <div v-if="schedule.optimizationSuggested" class="text-xs text-yellow-600 mt-1">
                {{ schedule.optimizationMessage }}
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getTypeBadgeVariant(schedule.type)">
                {{ formatType(schedule.type) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatFrequency(schedule.schedule) }}</TableCell>
            <TableCell>{{ formatScope(schedule.scope, schedule) }}</TableCell>
            <TableCell>
              <Badge :variant="schedule.active ? 'success' : 'secondary'">
                {{ schedule.active ? 'Active' : 'Inactive' }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatNextRun(schedule.nextRunAt) }}</TableCell>
            <TableCell>
              <Badge v-if="schedule.lastRunStatus" :variant="getStatusBadgeVariant(schedule.lastRunStatus)">
                {{ formatStatus(schedule.lastRunStatus) }}
              </Badge>
              <span v-else class="text-muted-foreground text-sm">Never Run</span>
            </TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="$emit('view-schedule', schedule)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-schedule', schedule)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('toggle-status', schedule)">
                    <ToggleLeftIcon v-if="schedule.active" class="mr-2 h-4 w-4" />
                    <ToggleRightIcon v-else class="mr-2 h-4 w-4" />
                    <span>{{ schedule.active ? 'Deactivate' : 'Activate' }}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('duplicate-schedule', schedule)">
                    <CopyIcon class="mr-2 h-4 w-4" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="runScheduleNow(schedule)">
                    <PlayIcon class="mr-2 h-4 w-4" />
                    <span>Run Now</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('delete-schedule', schedule)" class="text-destructive focus:text-destructive">
                    <TrashIcon class="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          <TableRow v-if="filteredSchedules.length === 0" class="h-24">
            <TableCell colspan="9" class="text-center py-6">
              <div class="flex flex-col items-center justify-center">
                <Clock class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No sync schedules found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or create your first sync schedule
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody v-else>
          <TableRow v-for="i in 5" :key="i">
            <TableCell v-for="j in 9" :key="j">
              <Skeleton class="h-4 w-full" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="flex-1 text-sm text-muted-foreground">
        {{ selectedSchedules.length > 0 ? `${selectedSchedules.length} schedule(s) selected` : `${filteredSchedules.length} schedules` }}
      </div>
      <div class="flex items-center space-x-6">
        <div class="flex items-center space-x-2">
          <p class="text-sm font-medium">Rows per page</p>
          <Select v-model="pageSize" class="w-[70px]">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="10">10</SelectItem>
              <SelectItem :value="20">20</SelectItem>
              <SelectItem :value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {{ currentPage }} of {{ totalPages || 1 }}
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <ChevronLeftIcon class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            <ChevronRightIcon class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedSchedules.length > 0" class="flex items-center justify-end space-x-2 border-t pt-4">
      <Button 
        variant="outline" 
        size="sm" 
        @click="$emit('bulk-edit', getSelectedSchedules())"
      >
        <PencilIcon class="h-4 w-4 mr-2" />
        Bulk Edit
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        @click="$emit('bulk-delete', getSelectedSchedules())"
        class="text-destructive hover:text-destructive"
      >
        <TrashIcon class="h-4 w-4 mr-2" />
        Delete Selected
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns'
import { 
  RefreshCcw, MoreHorizontal, ArrowUpIcon, ArrowDownIcon,
  EyeIcon, PencilIcon, TrashIcon, CopyIcon, 
  ToggleLeftIcon, ToggleRightIcon, PlayIcon,
  ChevronLeftIcon, ChevronRightIcon, Clock
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'

const props = defineProps({
  schedules: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-schedule', 
  'edit-schedule', 
  'duplicate-schedule', 
  'delete-schedule', 
  'toggle-status', 
  'refresh', 
  'bulk-edit',
  'bulk-delete',
  'run-schedule'
])

// Toast
const { toast } = useToast()

// Local state
const selectedSchedules = ref([])
const searchQuery = ref('')
const typeFilter = ref('all')
const statusFilter = ref('all')
const sortConfig = ref({ key: 'priority', direction: 'desc' })
const currentPage = ref(1)
const pageSize = ref(10)
const filteredSchedules = ref([])

// Reset pagination when filters change
watch([searchQuery, typeFilter, statusFilter], () => {
  currentPage.value = 1
  filterSchedules()
})

// Update filtered schedules when props change
watch(() => props.schedules, () => {
  filterSchedules()
}, { immediate: true })

// Computed properties
const isAllSelected = computed(() => {
  return filteredSchedules.value.length > 0 && 
         selectedSchedules.value.length === filteredSchedules.value.length
})

const isSomeSelected = computed(() => {
  return selectedSchedules.value.length > 0 && 
         selectedSchedules.value.length < filteredSchedules.value.length
})

const totalPages = computed(() => {
  return Math.ceil(filteredSchedules.value.length / pageSize.value)
})

const paginatedSchedules = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSchedules.value.slice(start, end)
})

// Methods
function filterSchedules() {
  let result = [...props.schedules]
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(schedule => 
      schedule.name.toLowerCase().includes(query) || 
      schedule.description?.toLowerCase().includes(query) ||
      (schedule.tags && schedule.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }
  
  // Apply type filter
  if (typeFilter.value !== 'all') {
    result = result.filter(schedule => schedule.type === typeFilter.value)
  }
  
  // Apply status filter
  if (statusFilter.value !== 'all') {
    const isActive = statusFilter.value === 'active'
    result = result.filter(schedule => schedule.active === isActive)
  }
  
  // Apply sorting
  result.sort((a, b) => {
    // Handle nested properties
    const aValue = sortConfig.value.key.includes('.')
      ? sortConfig.value.key.split('.').reduce((obj, key) => obj?.[key], a)
      : a[sortConfig.value.key]
    
    const bValue = sortConfig.value.key.includes('.')
      ? sortConfig.value.key.split('.').reduce((obj, key) => obj?.[key], b)
      : b[sortConfig.value.key]
      
    // Compare values
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.value.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    } else {
      if (aValue === bValue) return 0
      if (aValue === undefined || aValue === null) return 1
      if (bValue === undefined || bValue === null) return -1
      
      return sortConfig.value.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue
    }
  })
  
  filteredSchedules.value = result
}

function sortBy(key) {
  // Toggle direction if same key, otherwise set to ascending
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
  
  filterSchedules()
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedSchedules.value = []
  } else {
    selectedSchedules.value = filteredSchedules.value.map(schedule => schedule.id)
  }
}

function toggleSelectSchedule(scheduleId) {
  const index = selectedSchedules.value.indexOf(scheduleId)
  if (index === -1) {
    selectedSchedules.value.push(scheduleId)
  } else {
    selectedSchedules.value.splice(index, 1)
  }
}

function getSelectedSchedules() {
  return props.schedules.filter(schedule => selectedSchedules.value.includes(schedule.id))
}

function formatType(type) {
  switch (type) {
    case 'realtime': return 'Real-time'
    case 'batch_high': return 'High Frequency'
    case 'batch_medium': return 'Medium Frequency'
    case 'batch_low': return 'Low Frequency'
    case 'manual': return 'Manual'
    default: return type
  }
}

function getTypeBadgeVariant(type) {
  switch (type) {
    case 'realtime': return 'default'
    case 'batch_high': return 'info'
    case 'batch_medium': return 'secondary'
    case 'batch_low': return 'outline'
    case 'manual': return 'warning'
    default: return 'outline'
  }
}

function formatFrequency(scheduleConfig) {
  if (!scheduleConfig) return 'Not set'
  
  const { frequency, time, dayOfWeek, dayOfMonth, customCron } = scheduleConfig
  
  switch (frequency) {
    case 'hourly': return 'Every hour'
    case 'daily': return time ? `Daily at ${time.substring(0, 5)}` : 'Daily'
    case 'weekly': {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const day = dayOfWeek !== undefined ? days[dayOfWeek] : 'Monday'
      return time ? `Weekly on ${day} at ${time.substring(0, 5)}` : `Weekly on ${day}`
    }
    case 'monthly': {
      const day = dayOfMonth || 1
      return time ? `Monthly on day ${day} at ${time.substring(0, 5)}` : `Monthly on day ${day}`
    }
    case 'custom': return customCron ? `Custom (${customCron})` : 'Custom'
    default: return frequency
  }
}

function formatScope(scope, schedule) {
  switch (scope) {
    case 'global': return 'Global'
    case 'category': {
      const count = schedule.categoryIds?.length || 0
      return `Category (${count})`
    }
    case 'product': {
      const count = schedule.productIds?.length || 0
      return `Product (${count})`
    }
    case 'item': {
      const count = schedule.itemIds?.length || 0
      return `Item (${count})`
    }
    default: return scope
  }
}

function formatNextRun(nextRunAt) {
  if (!nextRunAt) return 'Not scheduled'
  
  try {
    const date = parseISO(nextRunAt)
    if (!isValid(date)) return 'Invalid date'
    
    const now = new Date()
    if (date < now) return 'Overdue'
    
    return formatDistanceToNow(date, { addSuffix: true })
  } catch (e) {
    return nextRunAt
  }
}

function formatStatus(status) {
  switch (status) {
    case 'success': return 'Success'
    case 'partial': return 'Partial'
    case 'failed': return 'Failed'
    case 'cancelled': return 'Cancelled'
    default: return status
  }
}

function getStatusBadgeVariant(status) {
  switch (status) {
    case 'success': return 'success'
    case 'partial': return 'warning'
    case 'failed': return 'destructive'
    case 'cancelled': return 'secondary'
    default: return 'outline'
  }
}

function runScheduleNow(schedule) {
  emit('run-schedule', schedule)
  toast({
    title: 'Schedule triggered',
    description: `${schedule.name} has been triggered to run.`,
    duration: 3000
  })
}
</script>