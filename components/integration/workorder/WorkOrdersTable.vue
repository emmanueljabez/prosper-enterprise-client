<template>
  <div class="space-y-4">
    <!-- Actions and Filters -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Search and Filter -->
      <div class="flex flex-1 items-center space-x-2">
        <div class="relative flex-1">
          <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="filters.search"
            class="pl-8"
            placeholder="Search work orders..."
            type="search"
          />
        </div>

        <Select v-model="filters.status">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="filters.materialStatus">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Filter by material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Materials</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Bulk Actions -->
      <div class="flex items-center space-x-2">
        <Button
          v-if="selectedWorkOrders.length > 0"
          variant="outline"
          size="sm"
          @click="$emit('bulk-delete', selectedWorkOrders)"
        >
          Delete Selected
        </Button>
        <Button
          variant="outline"
          size="icon"
          @click="$emit('refresh')"
        >
          <RefreshCwIcon class="h-4 w-4" />
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
                @click="sortBy('orderNumber')"
              >
                Order # 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'orderNumber' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'orderNumber' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('quantity')"
              >
                Quantity 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'quantity' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'quantity' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Progress</TableHead>
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
              <div class="mt-2 text-sm text-muted-foreground">Loading work orders...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedWorkOrders.length === 0" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <ClipboardXIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No work orders found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or create a new work order
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="workOrder in paginatedWorkOrders" :key="workOrder.id">
            <TableCell>
              <Checkbox
                :checked="selectedWorkOrders.includes(workOrder.id)"
                @update:checked="() => toggleWorkOrderSelection(workOrder.id)"
              />
            </TableCell>
            <TableCell class="font-medium">{{ workOrder.orderNumber }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                  <PackageIcon class="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div>{{ workOrder.productName }}</div>
                  <div class="text-xs text-muted-foreground">{{ workOrder.bomName }}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(workOrder.status)">
                {{ formatStatus(workOrder.status) }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="getMaterialStatusVariant(workOrder.materialStatus)">
                {{ formatMaterialStatus(workOrder.materialStatus) }}
              </Badge>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1">
                <span>{{ workOrder.completed || 0 }}/{{ workOrder.quantity }}</span>
                <Badge v-if="workOrder.rejected > 0" variant="destructive" class="ml-1">
                  {{ workOrder.rejected }} rejected
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <div class="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  class="h-full bg-primary" 
                  :style="{width: `${getProgressPercentage(workOrder)}%`}"
                ></div>
              </div>
            </TableCell>
            <TableCell>
              <div :class="{'text-destructive': isOverdue(workOrder)}">
                {{ formatDate(workOrder.dueDate) }}
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
                  <DropdownMenuItem @click="$emit('view-work-order', workOrder)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-work-order', workOrder)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('update-status', workOrder)">
                    <ClipboardCheckIcon class="mr-2 h-4 w-4" />
                    <span>Update Status</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('duplicate-work-order', workOrder)">
                    <CopyIcon class="mr-2 h-4 w-4" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem v-if="workOrder.status !== 'completed'" @click="$emit('mark-completed', workOrder)">
                    <CheckCircleIcon class="mr-2 h-4 w-4" />
                    <span>Mark as Completed</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('delete-work-order', workOrder)" class="text-destructive focus:text-destructive">
                    <Trash2Icon class="mr-2 h-4 w-4" />
                    <span>Delete</span>
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredWorkOrders.length) }}
        of {{ filteredWorkOrders.length }} entries
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
import { 
  SearchIcon, 
  Loader2Icon,
  ClipboardXIcon,
  RefreshCwIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MoreHorizontalIcon,
  EyeIcon,
  PencilIcon,
  ClipboardCheckIcon,
  CheckCircleIcon,
  CopyIcon,
  Trash2Icon,
  PackageIcon
} from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const props = defineProps({
  workOrders: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'refresh', 
  'view-work-order', 
  'edit-work-order', 
  'delete-work-order', 
  'update-status', 
  'duplicate-work-order', 
  'mark-completed', 
  'bulk-delete'
])

// State
const selectedWorkOrders = ref([])
const filters = ref({
  search: '',
  status: 'all',
  materialStatus: 'all'
})
const pagination = ref({
  page: 1,
  pageSize: 10
})
const sortConfig = ref({
  key: 'dueDate',
  direction: 'asc'
})

// Filter and sort work orders
const filteredWorkOrders = computed(() => {
  let result = [...(props.workOrders || [])]
  
  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(wo => 
      wo.orderNumber?.toLowerCase().includes(searchTerm) ||
      wo.productName?.toLowerCase().includes(searchTerm) ||
      wo.productSku?.toLowerCase().includes(searchTerm) ||
      wo.bomName?.toLowerCase().includes(searchTerm)
    )
  }
  
  // Apply status filter
  if (filters.value.status !== 'all') {
    result = result.filter(wo => wo.status === filters.value.status)
  }
  
  // Apply material status filter
  if (filters.value.materialStatus !== 'all') {
    result = result.filter(wo => wo.materialStatus === filters.value.materialStatus)
  }
  
  // Apply sorting
  result.sort((a, b) => {
    let aValue = a[sortConfig.value.key]
    let bValue = b[sortConfig.value.key]
    
    // Handle nested properties
    if (sortConfig.value.key.includes('.')) {
      const keys = sortConfig.value.key.split('.')
      aValue = keys.reduce((obj, key) => obj?.[key], a)
      bValue = keys.reduce((obj, key) => obj?.[key], b)
    }
    
    // Handle undefined or null values
    if (aValue === undefined || aValue === null) aValue = ''
    if (bValue === undefined || bValue === null) bValue = ''
    
    // String comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    // Date comparison
    if (sortConfig.value.key === 'dueDate' || sortConfig.value.key === 'plannedStartDate' || 
        sortConfig.value.key === 'updatedAt' || sortConfig.value.key === 'createdAt') {
      return sortConfig.value.direction === 'asc' 
        ? new Date(aValue) - new Date(bValue) 
        : new Date(bValue) - new Date(aValue)
    }
    
    // Regular comparison
    if (sortConfig.value.direction === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  return result
})

// Paginate work orders
const totalPages = computed(() => Math.ceil(filteredWorkOrders.value.length / pagination.value.pageSize))
const paginatedWorkOrders = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredWorkOrders.value.slice(start, end)
})

// Selection logic
const isAllSelected = computed(() => {
  return filteredWorkOrders.value.length > 0 && selectedWorkOrders.value.length === filteredWorkOrders.value.length
})
const isSomeSelected = computed(() => {
  return selectedWorkOrders.value.length > 0 && selectedWorkOrders.value.length < filteredWorkOrders.value.length
})

// Methods
const toggleWorkOrderSelection = (workOrderId) => {
  const index = selectedWorkOrders.value.indexOf(workOrderId)
  if (index === -1) {
    selectedWorkOrders.value.push(workOrderId)
  } else {
    selectedWorkOrders.value.splice(index, 1)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedWorkOrders.value = []
  } else {
    selectedWorkOrders.value = filteredWorkOrders.value.map(wo => wo.id)
  }
}

const sortBy = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date)
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'planned': return 'secondary'
    case 'in_progress': return 'info'
    case 'on_hold': return 'warning'
    case 'completed': return 'success'
    case 'cancelled': return 'destructive'
    default: return 'default'
  }
}

const getMaterialStatusVariant = (status) => {
  switch (status) {
    case 'available': return 'success'
    case 'partial': return 'warning'
    case 'unavailable': return 'destructive'
    default: return 'default'
  }
}

const formatStatus = (status) => {
  if (status === 'in_progress') return 'In Progress'
  if (status === 'on_hold') return 'On Hold'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatMaterialStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getProgressPercentage = (workOrder) => {
  if (!workOrder.quantity || workOrder.quantity === 0) return 0
  const completed = workOrder.completed || 0
  return Math.min(100, Math.round((completed / workOrder.quantity) * 100))
}

const isOverdue = (workOrder) => {
  if (!workOrder.dueDate || workOrder.status === 'completed' || workOrder.status === 'cancelled') return false
  return new Date(workOrder.dueDate) < new Date()
}

// Reset pagination when filters change
watch(filters, () => {
  pagination.value.page = 1
}, { deep: true })

// Reset selection when work orders change
watch(() => props.workOrders, () => {
  selectedWorkOrders.value = []
})
</script>