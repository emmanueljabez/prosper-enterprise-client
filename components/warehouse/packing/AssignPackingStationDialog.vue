<!-- filepath: c:\Users\user\Documents\pcash-inventory\pcash-inventory\components\warehouse\packing\AssignPackingStationDialog.vue -->
<template>
  <DialogContent class="sm:max-w-[550px]">
    <DialogHeader>
      <DialogTitle>Assign Packing Station</DialogTitle>
      <DialogDescription>
        Assign this packing task to a specific packing station
      </DialogDescription>
    </DialogHeader>

    <div class="grid gap-6 py-4">
      <!-- Task Information -->
      <div class="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-md">
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Task ID</div>
          <div class="font-medium">{{ task.id }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Order</div>
          <div class="font-medium">#{{ task.orderNumber }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Items</div>
          <div class="font-medium">{{ task.items.length }} items</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Priority</div>
          <Badge :variant="getPriorityVariant(task.priority)">
            {{ formatPriority(task.priority) }}
          </Badge>
        </div>
      </div>

      <!-- Current Assignment -->
      <div v-if="task.assignedStation" class="space-y-2">
        <h4 class="text-sm font-medium">Current Assignment</h4>
        <div class="flex items-center space-x-3 p-3 border rounded-md bg-muted/30">
          <div 
            class="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary"
          >
            <LayoutIcon class="h-4 w-4" />
          </div>
          <div>
            <div class="font-medium">{{ getStationName(task.assignedStation) }}</div>
            <div class="flex items-center text-xs text-muted-foreground">
              <Badge :variant="getStationStatusVariant(getStationStatus(task.assignedStation))">
                {{ getStationStatus(task.assignedStation) }}
              </Badge>
              <span class="ml-2">
                {{ getStationActiveTasks(task.assignedStation) }} active tasks
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Packing Station Selection -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label>Select Packing Station</Label>
          <div class="flex items-center space-x-2">
            <Input
              v-model="searchQuery"
              placeholder="Search stations..."
              class="h-8 w-[180px]"
            />
            <Button variant="outline" title="Refresh stations" @click="loadStations" :disabled="isLoading">
              <RefreshCwIcon v-if="!isLoading" class="h-4 w-4" />
              <Loader2Icon v-else class="h-4 w-4 animate-spin" />
            </Button>
          </div>
        </div>

        <div class="border rounded-md overflow-hidden">
          <div 
            v-if="isLoading" 
            class="flex items-center justify-center py-6"
          >
            <Loader2Icon class="h-5 w-5 animate-spin text-muted-foreground" />
            <span class="ml-2 text-sm text-muted-foreground">Loading stations...</span>
          </div>
          <div v-else-if="filteredStations.length === 0" class="py-6 text-center text-muted-foreground">
            <LayoutDashboardIcon class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No packing stations found</p>
            <p class="text-xs" v-if="searchQuery">Try adjusting your search</p>
          </div>
          <RadioGroup v-else v-model="selectedStationId" class="divide-y">
            <div 
              v-for="station in filteredStations" 
              :key="station.id"
              class="relative flex items-start space-x-3 p-3 transition-colors hover:bg-muted"
            >
              <RadioGroupItem :value="station.id" :id="`station-${station.id}`" class="mt-1" />
              <Label 
                :for="`station-${station.id}`"
                class="flex flex-1 items-start space-x-3 cursor-pointer"
              >
                <div 
                  class="flex items-center justify-center h-10 w-10 rounded bg-primary/10 text-primary flex-shrink-0"
                >
                  <div v-if="station.type === 'standard'">
                    <LayoutIcon class="h-5 w-5" />
                  </div>
                  <div v-else-if="station.type === 'large'">
                    <PackageOpenIcon class="h-5 w-5" />
                  </div>
                  <div v-else-if="station.type === 'special'">
                    <BoxesIcon class="h-5 w-5" />
                  </div>
                  <div v-else>
                    <LayoutDashboardIcon class="h-5 w-5" />
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between">
                    <div class="font-medium">{{ station.name }}</div>
                    <Badge :variant="getStationStatusVariant(station.status)">
                      {{ station.status }}
                    </Badge>
                  </div>
                  <div class="flex flex-col text-sm text-muted-foreground mt-1">
                    <div class="grid grid-cols-2 gap-x-4">
                      <div class="flex items-center">
                        <UserIcon class="h-3 w-3 mr-1" />
                        <span>{{ station.operator || 'Unassigned' }}</span>
                      </div>
                      <div class="flex items-center">
                        <ClipboardListIcon class="h-3 w-3 mr-1" />
                        <span>{{ station.activeTasks || 0 }} tasks</span>
                      </div>
                    </div>
                    <div class="mt-1">
                      {{ getStationFeatures(station) }}
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        <p v-if="errors.station" class="text-destructive text-sm">{{ errors.station }}</p>
      </div>

      <!-- Assignment Options -->
      <div class="space-y-4">
        <h4 class="text-sm font-medium">Assignment Options</h4>
        <div class="flex items-center justify-between px-1">
          <Label for="priority" class="flex-shrink-0 mr-4">Assignment Priority</Label>
          <div class="flex items-center flex-1 space-x-2">
            <span class="text-xs text-muted-foreground">Low</span>
            <Slider
              id="priority"
              v-model="assignmentPriority"
              :min="1"
              :max="5"
              :step="1"
              class="flex-1"
            />
            <span class="text-xs text-muted-foreground">High</span>
          </div>
          <Badge variant="outline" class="ml-2">{{ assignmentPriority }}</Badge>
        </div>
        
        <div class="flex items-center space-x-2">
          <Checkbox
            id="startImmediately"
            v-model:checked="startImmediately"
          />
          <Label for="startImmediately">Start packing immediately</Label>
        </div>
        
        <div class="flex items-center space-x-2">
          <Checkbox
            id="printPackingSlip"
            v-model:checked="printPackingSlip"
          />
          <Label for="printPackingSlip">Print packing slip on assignment</Label>
        </div>
      </div>

      <!-- Notes -->
      <div class="space-y-2">
        <Label for="assignmentNote">Assignment Note (Optional)</Label>
        <Textarea
          id="assignmentNote"
          v-model="assignmentNote"
          placeholder="Add any notes about this assignment..."
          :rows="2"
        />
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        variant="default" 
        @click="assignStation" 
        :disabled="!selectedStationId || isSubmitting"
      >
        <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        <LayoutDashboardIcon v-else class="h-4 w-4 mr-2" />
        {{ isSubmitting ? 'Assigning...' : 'Assign Station' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import {
  BoxesIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  LayoutIcon,
  Loader2Icon,
  PackageOpenIcon,
  RefreshCwIcon,
  UserIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
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
  },
  packingStations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'station-assigned'])

// State
const isLoading = ref(false)
const isSubmitting = ref(false)
const selectedStationId = ref('')
const assignmentPriority = ref(3)
const startImmediately = ref(false)
const printPackingSlip = ref(false)
const assignmentNote = ref('')
const searchQuery = ref('')
const errors = reactive({
  station: ''
})

// If the task already has an assigned station, pre-select it
onMounted(() => {
  if (props.task.assignedStation) {
    selectedStationId.value = props.task.assignedStation
  }
  
  // Set default options based on task priority
  if (props.task.priority === 'high' || props.task.priority === 'urgent') {
    assignmentPriority.value = 5
    startImmediately.value = true
  }
  
  loadStations()
})

// Computed properties
const filteredStations = computed(() => {
  if (!searchQuery.value) return props.packingStations
  
  const query = searchQuery.value.toLowerCase()
  return props.packingStations.filter(station => 
    station.name.toLowerCase().includes(query) ||
    (station.operator && station.operator.toLowerCase().includes(query)) ||
    station.type.toLowerCase().includes(query)
  )
})

// Methods
async function loadStations() {
  isLoading.value = true
  try {
    // In a real app, you might fetch fresh station data here
    await new Promise(resolve => setTimeout(resolve, 600))
    // We're using the props directly in this case
  } catch (error) {
    console.error('Error loading packing stations:', error)
  } finally {
    isLoading.value = false
  }
}

async function assignStation() {
  if (!selectedStationId.value) {
    errors.station = 'Please select a packing station'
    return
  }
  
  errors.station = ''
  isSubmitting.value = true
  
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const selectedStation = props.packingStations.find(s => s.id === selectedStationId.value)
    
    const assignmentData = {
      stationId: selectedStationId.value,
      stationName: selectedStation?.name,
      priority: assignmentPriority.value,
      startImmediately: startImmediately.value,
      printPackingSlip: printPackingSlip.value,
      note: assignmentNote.value,
      timestamp: new Date().toISOString()
    }
    
    emit('station-assigned', props.task, assignmentData)
  } catch (error) {
    console.error('Error assigning packing station:', error)
  } finally {
    isSubmitting.value = false
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

function getPriorityVariant(priority) {
  switch (priority) {
    case 'low': return 'outline'
    case 'normal': return 'secondary'
    case 'high': return 'warning'
    case 'urgent': return 'destructive'
    default: return 'outline'
  }
}

function getStationName(stationId) {
  const station = props.packingStations.find(s => s.id === stationId)
  return station ? station.name : stationId
}

function getStationStatus(stationId) {
  const station = props.packingStations.find(s => s.id === stationId)
  return station ? station.status : 'Unknown'
}

function getStationActiveTasks(stationId) {
  const station = props.packingStations.find(s => s.id === stationId)
  return station ? (station.activeTasks || 0) : 0
}

function getStationStatusVariant(status) {
  switch (status) {
    case 'available': return 'success'
    case 'busy': return 'warning'
    case 'offline': return 'outline'
    case 'maintenance': return 'destructive'
    default: return 'secondary'
  }
}

function getStationFeatures(station) {
  const features = []
  
  if (station.type === 'large') {
    features.push('Large items')
  } else if (station.type === 'special') {
    features.push('Special handling')
  }
  
  if (station.features) {
    if (station.features.includes('scale')) features.push('Integrated scale')
    if (station.features.includes('printer')) features.push('Label printer')
    if (station.features.includes('scanner')) features.push('Barcode scanner')
  }
  
  return features.join(' • ') || 'Standard packing station'
}
</script>