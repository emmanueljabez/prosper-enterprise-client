<!-- filepath: c:\Users\user\Documents\pcash-inventory\pcash-inventory\components\warehouse\packing\PackingStationsGrid.vue -->
<template>
  <div class="space-y-6">
    <!-- Header and Controls -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium">Packing Stations</h3>
        <p class="text-sm text-muted-foreground">
          {{ availableStations }} of {{ packingStations?.length || 0 }} stations available
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Select v-model="filter" class="w-[180px]">
          <SelectTrigger>
            <SelectValue :placeholder="getFilterLabel(filter)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stations</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" @click="refreshStations" :disabled="isLoading">
          <RefreshCwIcon v-if="!isLoading" class="h-4 w-4" />
          <Loader2Icon v-else class="h-4 w-4 animate-spin" />
        </Button>
        <Button variant="outline" @click="$emit('create-station')">
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Station
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid place-items-center h-64">
      <div class="flex flex-col items-center">
        <Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
        <p class="mt-2 text-sm text-muted-foreground">Loading packing stations...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!packingStations?.length" class="text-center py-8">
      <div class="flex flex-col items-center max-w-sm mx-auto">
        <LayoutDashboardIcon class="h-10 w-10 text-muted-foreground opacity-50" />
        <h3 class="mt-4 text-lg font-medium">No packing stations found</h3>
        <p class="mt-2 text-sm text-muted-foreground">
          {{ filter === 'all' 
            ? 'Get started by adding your first packing station to the warehouse.' 
            : 'No stations match the current filter. Try changing the filter or refreshing the view.' 
          }}
        </p>
        <Button 
          v-if="filter !== 'all'" 
          variant="outline" 
          size="sm" 
          @click="filter = 'all'" 
          class="mt-4"
        >
          <FilterXIcon class="h-4 w-4 mr-2" />
          Clear Filter
        </Button>
        <Button 
          v-else
          variant="default" 
          @click="$emit('create-station')" 
          class="mt-4"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Packing Station
        </Button>
      </div>
    </div>

    <!-- Stations Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="station in filteredStations" 
        :key="station.id" 
        class="border rounded-lg overflow-hidden"
      >
        <!-- Station Header -->
        <div class="p-4 flex justify-between items-start border-b">
          <div>
            <h4 class="font-medium flex items-center">
              <span>{{ station.name }}</span>
              <Badge 
                v-if="station.type === 'large'" 
                variant="outline" 
                class="ml-2"
              >
                Large
              </Badge>
              <Badge 
                v-if="station.type === 'special'" 
                variant="outline" 
                class="ml-2"
              >
                Special
              </Badge>
            </h4>
            <div class="flex items-center mt-1">
              <Badge :variant="getStatusVariant(station.status)">
                {{ station.status }}
              </Badge>
              <span v-if="station.lastUpdated" class="text-xs text-muted-foreground ml-2">
                Updated {{ formatRelativeTime(station.lastUpdated) }}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVerticalIcon class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="viewStationDetails(station)">
                <EyeIcon class="mr-2 h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem @click="editStation(station)">
                <Edit2Icon class="mr-2 h-4 w-4" />
                <span>Edit Station</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                v-if="station.status !== 'offline'" 
                @click="setStationStatus(station, 'offline')"
              >
                <PowerOffIcon class="mr-2 h-4 w-4" />
                <span>Set Offline</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                v-if="station.status !== 'available'" 
                @click="setStationStatus(station, 'available')"
              >
                <CheckIcon class="mr-2 h-4 w-4" />
                <span>Set Available</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                v-if="station.status !== 'maintenance'" 
                @click="setStationStatus(station, 'maintenance')"
              >
                <WrenchIcon class="mr-2 h-4 w-4" />
                <span>Set Maintenance</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                v-if="!station.activeTasks" 
                @click="deleteStation(station)"
                class="text-destructive focus:text-destructive"
              >
                <TrashIcon class="mr-2 h-4 w-4" />
                <span>Delete Station</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- Station Content -->
        <div class="p-4 space-y-3">
          <!-- Operator Info -->
          <div class="flex items-center">
            <div class="bg-muted/60 p-2 rounded-full mr-3">
              <UserIcon class="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div class="text-sm font-medium">Operator</div>
              <div class="text-sm text-muted-foreground">
                {{ station.operator || 'Unassigned' }}
              </div>
            </div>
          </div>

          <!-- Task Info -->
          <div class="flex items-center">
            <div class="bg-muted/60 p-2 rounded-full mr-3">
              <ClipboardListIcon class="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div class="text-sm font-medium">Active Tasks</div>
              <div class="flex items-center">
                <span class="text-sm text-muted-foreground">
                  {{ station.activeTasks || 0 }} tasks assigned
                </span>
                <Button 
                  v-if="station.activeTasks" 
                  variant="ghost" 
                  size="sm" 
                  class="h-6 text-xs ml-2"
                  @click="viewStationTasks(station)"
                >
                  View
                </Button>
              </div>
            </div>
          </div>

          <!-- Station Features -->
          <div class="flex items-center">
            <div class="bg-muted/60 p-2 rounded-full mr-3">
              <SettingsIcon class="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div class="text-sm font-medium">Features</div>
              <div class="flex flex-wrap gap-1 mt-1">
                <Badge 
                  v-for="feature in getStationFeatures(station)" 
                  :key="feature"
                  variant="outline" 
                  class="text-xs"
                >
                  {{ feature }}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <!-- Station Footer -->
        <div class="border-t p-3 flex justify-between items-center bg-muted/10">
          <Button 
            v-if="station.status === 'available' || station.status === 'busy'" 
            variant="outline" 
            size="sm"
            @click="assignTask(station)"
          >
            <PlusCircleIcon class="h-3 w-3 mr-2" />
            Assign Task
          </Button>
          <Button 
            v-else-if="station.status === 'offline'" 
            variant="outline" 
            size="sm"
            @click="setStationStatus(station, 'available')"
          >
            <PowerIcon class="h-3 w-3 mr-2" />
            Set Online
          </Button>
          <Button 
            v-else-if="station.status === 'maintenance'" 
            variant="outline" 
            size="sm"
            @click="completeMaintenanceTask(station)"
          >
            <CheckCircleIcon class="h-3 w-3 mr-2" />
            Complete Maintenance
          </Button>
          <div v-else></div>

          <Button 
            variant="ghost" 
            size="sm"
            @click="viewStationDetails(station)"
          >
            More Details
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import {
  CheckIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  Edit2Icon,
  EyeIcon,
  FilterXIcon,
  LayoutDashboardIcon,
  Loader2Icon,
  MoreVerticalIcon,
  PlusIcon,
  PlusCircleIcon,
  PowerIcon,
  PowerOffIcon,
  RefreshCwIcon,
  SettingsIcon,
  TrashIcon,
  UserIcon,
  WrenchIcon
} from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Add proper prop definitions with defaults
const props = defineProps({
  packingStations: {
    type: Array,
    default: () => []
  },
  packingTasks: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'refresh',
  'view-details',
  'edit-station',
  'set-status',
  'delete-station',
  'create-station',
  'assign-task',
  'view-tasks'
])

// Local state
const filter = ref('all')

// Computed properties
const filteredStations = computed(() => {
  if (filter.value === 'all') return props.packingStations
  return props.packingStations.filter(station => station.status === filter.value)
})

const availableStations = computed(() => {
  if (!props.packingStations) return 0;
  return props.packingStations.filter(station => station.status === 'available').length;
})

// Methods
function refreshStations() {
  emit('refresh')
}

function viewStationDetails(station) {
  emit('view-details', station)
}

function editStation(station) {
  emit('edit-station', station)
}

function setStationStatus(station, status) {
  emit('set-status', station, status)
}

function deleteStation(station) {
  if (station.activeTasks && station.activeTasks > 0) {
    // Don't allow deletion if there are active tasks
    return
  }
  emit('delete-station', station)
}

function assignTask(station) {
  emit('assign-task', station)
}

function viewStationTasks(station) {
  emit('view-tasks', station)
}

function completeMaintenanceTask(station) {
  // This is a shortcut to set status to available after maintenance
  setStationStatus(station, 'available')
}

function getFilterLabel(filterValue) {
  switch (filterValue) {
    case 'all': return 'All Stations'
    case 'available': return 'Available'
    case 'busy': return 'Busy'
    case 'offline': return 'Offline'
    case 'maintenance': return 'Maintenance'
    default: return filterValue
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

function formatRelativeTime(dateString) {
  if (!dateString) return ''
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

function getStationFeatures(station) {
  const features = []
  
  if (station.type === 'large') {
    features.push('Large Items')
  } else if (station.type === 'special') {
    features.push('Special Handling')
  }
  
  if (station.features) {
    if (station.features.includes('scale')) features.push('Scale')
    if (station.features.includes('printer')) features.push('Printer')
    if (station.features.includes('scanner')) features.push('Scanner')
    if (station.features.includes('verification')) features.push('Verification')
    if (station.features.includes('hazmat')) features.push('HAZMAT')
    if (station.features.includes('fragile')) features.push('Fragile Items')
  }
  
  return features.length > 0 ? features : ['Standard']
}

onMounted(() => {
  if (props.packingStations.length === 0 && !props.isLoading) {
    refreshStations()
  }
})
</script>