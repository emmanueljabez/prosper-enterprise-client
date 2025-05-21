<template>
  <div class="space-y-6 p-6">

    <!-- Header with Title and Button -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Internet Service Activations</h2>
        <p class="text-muted-foreground">Manage and track service activations</p>
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
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <div class="col-span-2">
          <Input placeholder="Search by customer or activation number..." v-model="filters.search" />
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
              <SelectItem value="verification_pending">Verification Pending</SelectItem>
              <SelectItem value="verification_failed">Verification Failed</SelectItem>
              <SelectItem value="verification_passed">Verification Passed</SelectItem>
              <SelectItem value="awaiting_customer">Awaiting Customer</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select v-model="filters.serviceType">
            <SelectTrigger>
              <SelectValue placeholder="Filter by service type" />
            </SelectTrigger>
            <SelectContent @click.stop>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="fiber">Fiber</SelectItem>
              <SelectItem value="cable">Cable</SelectItem>
              <SelectItem value="dsl">DSL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
<!--          <DatePicker v-model="filters.date" />-->
        </div>
      </div>

      <!-- Table -->
      <div class="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activation #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Last Diagnostic Test</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody v-if="isLoading">
            <TableRow v-for="i in 5" :key="i">
              <TableCell colSpan="7" class="h-24">
                <div class="flex items-center justify-center">
                  <Loader2Icon v-if="i === 3" class="h-6 w-6 animate-spin text-primary" />
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody v-else-if="filteredActivations.length === 0">
            <TableRow>
              <TableCell colSpan="7" class="h-24">
                <div class="flex flex-col items-center justify-center text-center">
                  <SearchXIcon class="h-10 w-10 text-muted-foreground mb-2" />
                  <p class="text-muted-foreground">No activations found matching your filters.</p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableBody v-else>
            <TableRow v-for="activation in filteredActivations" :key="activation.id">
              <TableCell>
                <span class="font-medium">{{ activation.activationNumber }}</span>
                <div class="text-xs text-muted-foreground">{{ formatDate(activation.createdAt) }}</div>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(activation.status)">
                  {{ formatStatus(activation.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div>{{ activation.customer.name }}</div>
                <div class="text-xs text-muted-foreground truncate max-w-[200px]">{{ activation.location.address }}</div>
              </TableCell>
              <TableCell>
                <div>{{ activation.service.name }}</div>
                <div class="text-xs text-muted-foreground">{{ formatServiceType(activation.service.type) }} - {{ activation.service.speed }}</div>
              </TableCell>
              <TableCell>
                <div v-if="activation.scheduledDate">
                  {{ formatDate(activation.scheduledDate) }}
                  <div class="text-xs text-muted-foreground">{{ formatTimeSlot(activation.timeSlot) }}</div>
                </div>
                <div v-else class="text-muted-foreground">Not scheduled</div>
              </TableCell>
              <TableCell>
                <div v-if="activation.lastTestDate">
                  {{ formatDate(activation.lastTestDate) }}
                  <Badge
                      :variant="activation.lastTestResult === 'pass' ? 'success' : 'destructive'"
                      class="ml-1"
                  >
                    {{ activation.lastTestResult === 'pass' ? 'Pass' : 'Fail' }}
                  </Badge>
                </div>
                <div v-else class="text-muted-foreground">No tests</div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontalIcon class="h-4 w-4" />
                      <span class="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" @click.stop>
                    <DropdownMenuItem @click="$emit('view-activation', activation)">
                      <EyeIcon class="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        v-if="activation.status === 'pending'"
                        @click="$emit('schedule-activation', activation)"
                    >
                      <CalendarIcon class="h-4 w-4 mr-2" />
                      Schedule Activation
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        v-if="['scheduled', 'in_progress', 'verification_pending', 'verification_failed'].includes(activation.status)"
                        @click="$emit('run-diagnostics', activation)"
                    >
                      <ActivityIcon class="h-4 w-4 mr-2" />
                      Run Diagnostics
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        v-if="['verification_passed', 'awaiting_customer'].includes(activation.status)"
                        @click="$emit('complete-activation', activation)"
                    >
                      <CheckCircleIcon class="h-4 w-4 mr-2" />
                      Complete Activation
                    </DropdownMenuItem>

                    <DropdownMenuItem @click="$emit('update-status', activation)">
                      <RefreshCwIcon class="h-4 w-4 mr-2" />
                      Update Status
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Pipeline View -->
    <ActivationsPipelineView
        v-else
        :activations="filteredActivations"
        :isLoading="isLoading"
        @view-activation="$emit('view-activation', $event)"
        @schedule-activation="$emit('schedule-activation', $event)"
        @run-diagnostics="$emit('run-diagnostics', $event)"
        @update-status="$emit('update-status', $event)"
        @complete-activation="$emit('complete-activation', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu'
import ActivationsPipelineView from './ActivationsPipelineView.vue'
import {
  ListIcon, LayoutIcon, RefreshCwIcon, MoreHorizontalIcon, EyeIcon, CalendarIcon,
  ActivityIcon, CheckCircleIcon, Loader2Icon, SearchXIcon
} from 'lucide-vue-next'

const props = defineProps({
  activations: {
    type: Array,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  defaultView: {
    type: String,
    default: 'table'
  }
})

const emit = defineEmits([
  'view-activation',
  'run-diagnostics',
  'update-status',
  'schedule-activation',
  'complete-activation',
  'refresh'
])

// State
const currentView = ref(props.defaultView)
const filters = ref({
  search: '',
  status: 'all',
  serviceType: 'all',
  date: null
})

// Computed
const filteredActivations = computed(() => {
  let result = [...props.activations]

  // Filter by search
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(activation =>
        activation.activationNumber.toLowerCase().includes(searchTerm) ||
        activation.customer.name.toLowerCase().includes(searchTerm) ||
        activation.location.address.toLowerCase().includes(searchTerm)
    )
  }

  // Filter by status
  if (filters.value.status !== 'all') {
    result = result.filter(activation => activation.status === filters.value.status)
  }

  // Filter by service type
  if (filters.value.serviceType !== 'all') {
    result = result.filter(activation => activation.service.type === filters.value.serviceType)
  }

  // Filter by date
  if (filters.value.date) {
    const selectedDate = format(filters.value.date, 'yyyy-MM-dd')
    result = result.filter(activation => {
      if (!activation.scheduledDate) return false
      return format(parseISO(activation.scheduledDate), 'yyyy-MM-dd') === selectedDate
    })
  }

  return result
})

// Methods
function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

function formatTimeSlot(timeSlot) {
  const timeSlotMap = {
    'morning': 'Morning (8AM-12PM)',
    'afternoon': 'Afternoon (1PM-5PM)'
  }

  return timeSlotMap[timeSlot] || timeSlot
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'verification_pending': 'Verification Pending',
    'verification_failed': 'Verification Failed',
    'verification_passed': 'Verification Passed',
    'awaiting_customer': 'Awaiting Customer',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }

  return statusMap[status] || status
}

function formatServiceType(type) {
  const typeMap = {
    'fiber': 'Fiber Internet',
    'cable': 'Cable Internet',
    'dsl': 'DSL Internet'
  }

  return typeMap[type] || type
}

function getStatusVariant(status) {
  const variantMap = {
    'pending': 'secondary',
    'scheduled': 'warning',
    'in_progress': 'primary',
    'verification_pending': 'secondary',
    'verification_failed': 'destructive',
    'verification_passed': 'success',
    'awaiting_customer': 'warning',
    'completed': 'success',
    'cancelled': 'destructive'
  }

  return variantMap[status] || 'default'
}

// Lifecycle hooks
onMounted(() => {
  // Any initialization code
})
</script>