<template>
  <div class="space-y-6 p-6">
    <!-- Header with Title and Button -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Installations</h2>
        <p class="text-muted-foreground">Manage and track installation services</p>
      </div>
      <div class="flex items-center space-x-2">
        <!-- View Toggle Buttons -->
        <div class="flex items-center space-x-2 mr-2">
          <Button
              size="sm"
              variant="outline"
              :class="{ 'bg-primary text-primary-foreground': currentView === 'table' }"
              @click="currentView = 'table'"
          >
            <ListIcon class="h-4 w-4 mr-2" />
            List View
          </Button>
          <Button
              size="sm"
              variant="outline"
              :class="{ 'bg-primary text-primary-foreground': currentView === 'pipeline' }"
              @click="currentView = 'pipeline'"
          >
            <LayoutIcon class="h-4 w-4 mr-2" />
            Pipeline View
          </Button>
        </div>

        <Button @click="$emit('refresh')" variant="outline" size="icon">
          <RefreshCwIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Table View -->
    <div v-if="currentView === 'table'">
      <!-- Filter Controls -->
      <div class="mb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="col-span-2">
          <Input placeholder="Search by customer or installation number..." v-model="filters.search" />
        </div>
        <div>
          <Select v-model="filters.status">
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent @click.stop>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_site">On Site</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select v-model="filters.timeSlot">
            <SelectTrigger>
              <SelectValue placeholder="Filter by time slot" />
            </SelectTrigger>
            <SelectContent @click.stop>
              <SelectItem value="all">All Time Slots</SelectItem>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="afternoon">Afternoon</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button variant="outline" class="w-full" @click="resetFilters">
            <XIcon class="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>

      <!-- Installations Table -->
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Installation #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Services</TableHead>
              <TableHead class="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading" class="h-24">
              <TableCell colspan="7" class="text-center">
                <Loader2Icon class="h-6 w-6 animate-spin mx-auto" />
                <div class="mt-2">Loading installations...</div>
              </TableCell>
            </TableRow>
            <TableRow v-else-if="filteredInstallations.length === 0" class="h-24">
              <TableCell colspan="7" class="text-center">
                <div>
                  <CalendarXIcon class="h-8 w-8 mx-auto text-muted-foreground" />
                  <h3 class="mt-2 text-lg font-medium">No installations found</h3>
                  <p class="text-sm text-muted-foreground mt-1">
                    {{ hasFilters ? 'Try changing your filters' : 'Create new installations to get started' }}
                  </p>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-for="installation in filteredInstallations" :key="installation.id" @click="$emit('view-installation', installation)" class="cursor-pointer hover:bg-muted/50">
              <TableCell class="font-medium">#{{ installation.installationNumber }}</TableCell>
              <TableCell>{{ installation.customer.name }}</TableCell>
              <TableCell>
                <div class="flex items-center">
                  <CalendarIcon class="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{{ formatDate(installation.scheduledDate) }}</span>
                  <Badge variant="outline" size="sm" class="ml-2">{{ formatTimeSlot(installation.timeSlot) }}</Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(installation.status)">
                  {{ formatStatus(installation.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div v-if="installation.technician" class="flex items-center">
                  <Avatar class="h-6 w-6 mr-2">
                    <AvatarImage :src="installation.technician.avatar" />
                    <AvatarFallback>{{ installation.technician.initials }}</AvatarFallback>
                  </Avatar>
                  <span>{{ installation.technician.name }}</span>
                </div>
                <span v-else class="text-muted-foreground">Not assigned</span>
              </TableCell>
              <TableCell>
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
                    +{{ installation.services.length - 2 }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild @click.stop>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontalIcon class="h-4 w-4" />
                      </Button>
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
                          v-if="installation.status === 'pending' || installation.status === 'scheduled' || installation.status === 'delayed'"
                          @click="$emit('assign-technician', installation)"
                      >
                        <UserIcon class="h-4 w-4 mr-2" />
                        <span>Assign Technician</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                          v-if="installation.status === 'in_progress' || installation.status === 'on_site'"
                          @click="$emit('complete-installation', installation)"
                      >
                        <CheckCircleIcon class="h-4 w-4 mr-2" />
                        <span>Mark Complete</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                          v-if="installation.status !== 'completed' && installation.status !== 'cancelled'"
                          @click="$emit('cancel-installation', installation)"
                      >
                        <XCircleIcon class="h-4 w-4 mr-2" />
                        <span>Cancel Installation</span>
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
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Pipeline View -->
    <InstallationsPipelineView
        v-else
        :installations="filteredInstallations"
        :isLoading="isLoading"
        @view-installation="$emit('view-installation', $event)"
        @update-status="$emit('update-status', $event)"
        @reschedule="$emit('reschedule', $event)"
        @assign-technician="$emit('assign-technician', $event)"
        @complete-installation="$emit('complete-installation', $event)"
        @generate-report="$emit('generate-report', $event)"
        @refresh="$emit('refresh')"
        @toggle-view="currentView = 'table'"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from '@/components/ui/avatar'
import {
  MoreHorizontalIcon,
  RefreshCwIcon,
  Loader2Icon,
  XIcon,
  CalendarIcon,
  CalendarXIcon,
  EyeIcon,
  ActivityIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  FileTextIcon,
  ListIcon,
  LayoutIcon
} from 'lucide-vue-next'
import InstallationsPipelineView from '@/components/installations/InstallationsPipelineView.vue'

const props = defineProps({
  installations: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  defaultView: {
    type: String,
    default: 'table' // 'table' or 'pipeline'
  }
})

const emit = defineEmits([
  'refresh',
  'view-installation',
  'update-status',
  'reschedule',
  'assign-technician',
  'complete-installation',
  'cancel-installation',
  'generate-report'
])

// View state
const currentView = ref(props.defaultView)

// Filters
const filters = ref({
  search: '',
  status: 'all',
  timeSlot: 'all'
})

// Reset filters
function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    timeSlot: 'all'
  }
}

// Computed properties
const hasFilters = computed(() => {
  return filters.value.search !== '' ||
      filters.value.status !== 'all' ||
      filters.value.timeSlot !== 'all'
})

const filteredInstallations = computed(() => {
  if (!props.installations.length) return []

  let result = [...props.installations]

  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(installation =>
        installation.customer.name.toLowerCase().includes(searchTerm) ||
        installation.installationNumber.toLowerCase().includes(searchTerm) ||
        installation.location.address.toLowerCase().includes(searchTerm)
    )
  }

  // Apply status filter
  if (filters.value.status !== 'all') {
    result = result.filter(installation => installation.status === filters.value.status)
  }

  // Apply time slot filter
  if (filters.value.timeSlot !== 'all') {
    result = result.filter(installation => installation.timeSlot === filters.value.timeSlot)
  }

  return result
})

// Formatting helpers
function formatDate(dateString) {
  if (!dateString) return 'Not scheduled'
  return format(parseISO(dateString), 'dd MMM yyyy')
}

function formatTimeSlot(timeSlot) {
  const timeSlotMap = {
    'morning': 'Morning (8:00 AM - 12:00 PM)',
    'afternoon': 'Afternoon (1:00 PM - 5:00 PM)'
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
    'cancelled': 'Cancelled',
    'failed': 'Failed'
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
    'cancelled': 'destructive',
    'failed': 'destructive'
  }

  return variantMap[status] || 'default'
}
</script>