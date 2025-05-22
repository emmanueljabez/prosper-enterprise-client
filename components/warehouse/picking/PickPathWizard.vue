<template>
  <SheetContent class="sm:max-w-md" position="right">
    <SheetHeader>
      <SheetTitle>Create New Pick Path</SheetTitle>
      <SheetDescription>
        Define a new pick path to optimize your warehouse picking process.
      </SheetDescription>
    </SheetHeader>
    
    <div class="py-6">
      <!-- Step Indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="flex flex-col items-center"
          >
            <div 
              class="flex items-center justify-center w-8 h-8 rounded-full text-xs mb-1"
              :class="{
                'bg-primary text-primary-foreground': currentStep > index,
                'border-2 border-primary text-primary': currentStep === index,
                'bg-muted text-muted-foreground': currentStep < index
              }"
            >
              <CheckIcon v-if="currentStep > index" class="h-4 w-4" />
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="text-xs font-medium" :class="{
              'text-primary': currentStep >= index,
              'text-muted-foreground': currentStep < index
            }">
              {{ step.title }}
            </div>
          </div>
          
          <div class="absolute left-0 right-0 flex items-center justify-between z-0">
            <div class="w-full flex-1">
              <div class="h-1 bg-muted overflow-hidden">
                <div 
                  class="h-full bg-primary transition-all duration-300"
                  :style="{ width: `${(currentStep / (steps.length - 1)) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <!-- Step 1: Basic Info -->
      <div v-if="currentStep === 0" class="space-y-4">
        <div class="space-y-2">
          <Label for="pathName">Path Name</Label>
          <Input
            id="pathName"
            v-model="formData.name"
            placeholder="Enter a descriptive name"
          />
          <p v-if="errors.name" class="text-destructive text-sm">{{ errors.name }}</p>
        </div>

        <div class="space-y-2">
          <Label for="warehouseSelect">Warehouse</Label>
          <Select v-model="formData.warehouseId">
            <SelectTrigger id="warehouseSelect">
              <SelectValue placeholder="Select warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                {{ warehouse.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.warehouseId" class="text-destructive text-sm">{{ errors.warehouseId }}</p>
        </div>

        <div class="space-y-2">
          <Label for="pathDescription">Description (Optional)</Label>
          <Textarea
            id="pathDescription"
            v-model="formData.description"
            placeholder="Add notes about this path"
            rows="3"
          />
        </div>

        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <Checkbox id="isDefault" v-model:checked="formData.isDefault" />
            <Label for="isDefault">Make this the default pick path</Label>
          </div>
          <p class="text-sm text-muted-foreground">
            Default paths are automatically assigned to new picking tasks.
          </p>
        </div>
      </div>

      <!-- Step 2: Location Selection -->
      <div v-if="currentStep === 1" class="space-y-4">
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm font-medium">Selected Locations ({{ formData.sequence.length }})</div>
          <Button variant="outline" size="sm" @click="sortLocations">
            <ArrowUpDownIcon class="h-4 w-4 mr-2" />
            Sort by Aisle/Bay
          </Button>
        </div>

        <div 
          class="border rounded-md max-h-[300px] overflow-y-auto"
          :class="{ 'p-2': formData.sequence.length > 0 }"
        >
          <div v-if="formData.sequence.length === 0" class="text-center py-6 text-muted-foreground">
            <PackageIcon class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No locations added yet</p>
            <p class="text-sm">Add locations from the available list below</p>
          </div>

          <TransitionGroup name="list" tag="div">
            <div 
              v-for="(location, index) in formData.sequence" 
              :key="location.locationId"
              class="flex items-center justify-between p-2 rounded-md mb-1 bg-muted/50 group"
              draggable="true"
              @dragstart="dragStart(index)"
              @dragover.prevent
              @dragenter.prevent
              @drop="drop(index)"
            >
              <div class="flex items-center">
                <div class="flex items-center justify-center mr-2 text-sm bg-muted rounded w-6 h-6">
                  {{ index + 1 }}
                </div>
                <div>
                  <div class="font-medium">{{ location.locationCode }}</div>
                  <div class="text-xs text-muted-foreground">{{ location.areaName || 'No area' }}</div>
                </div>
              </div>
              <div class="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  class="opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="moveLocation(index, index - 1)"
                  :disabled="index === 0"
                >
                  <ChevronUpIcon class="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  class="opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="moveLocation(index, index + 1)"
                  :disabled="index === formData.sequence.length - 1"
                >
                  <ChevronDownIcon class="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  class="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="removeLocation(index)"
                >
                  <XIcon class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <p v-if="errors.sequence" class="text-destructive text-sm">{{ errors.sequence }}</p>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label>Available Locations</Label>
            <div class="flex items-center space-x-2">
              <Input
                v-model="locationSearch"
                placeholder="Search locations..."
                class="h-8 w-[180px]"
              />
            </div>
          </div>
          
          <div class="border rounded-md p-2 h-[200px] overflow-y-auto">
            <div v-if="filteredLocations.length === 0" class="text-center py-6 text-muted-foreground">
              <p>No matching locations found</p>
            </div>
            
            <div 
              v-for="location in filteredLocations" 
              :key="location.id"
              class="flex items-center justify-between p-2 hover:bg-muted rounded-sm cursor-pointer"
              @click="addLocation(location)"
            >
              <div>
                <div class="font-medium">{{ location.code }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ location.areaName || location.type }}
                </div>
              </div>
              <Button variant="ghost" size="icon" @click.stop="addLocation(location)">
                <PlusIcon class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Review & Finalize -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div class="space-y-2">
          <h4 class="text-sm font-medium">Path Details</h4>
          <div class="rounded-md border p-4 space-y-2">
            <div class="grid grid-cols-3 gap-2">
              <div>
                <div class="text-xs text-muted-foreground">Name</div>
                <div>{{ formData.name }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">Warehouse</div>
                <div>{{ getWarehouseName(formData.warehouseId) }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">Default</div>
                <Badge variant="outline">{{ formData.isDefault ? 'Yes' : 'No' }}</Badge>
              </div>
            </div>
            <div v-if="formData.description">
              <div class="text-xs text-muted-foreground">Description</div>
              <div class="text-sm">{{ formData.description }}</div>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium">Path Sequence ({{ formData.sequence.length }} locations)</h4>
            <Button variant="outline" size="sm" @click="previewPath">
              <EyeIcon class="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
          
          <div class="rounded-md border p-2 max-h-[300px] overflow-y-auto">
            <div 
              v-for="(location, index) in formData.sequence" 
              :key="location.locationId"
              class="flex items-center p-2 border-b last:border-0"
            >
              <div class="flex items-center justify-center mr-3 text-sm bg-muted rounded w-6 h-6">
                {{ index + 1 }}
              </div>
              <div>
                <div class="font-medium">{{ location.locationCode }}</div>
                <div class="text-xs text-muted-foreground">{{ location.areaName || 'No area' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showPathMap" class="space-y-2">
          <h4 class="text-sm font-medium">Path Map</h4>
          <div class="rounded-md border p-4 bg-muted/20 h-[200px] flex items-center justify-center">
            <div class="text-center text-muted-foreground">
              <RouteIcon class="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Interactive path map preview would be shown here</p>
              <p class="text-xs">This would show the physical layout of the selected locations</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SheetFooter class="pt-4">
      <div class="flex justify-between w-full">
        <Button
          v-if="currentStep > 0"
          variant="outline"
          @click="currentStep--"
        >
          <ChevronLeftIcon class="h-4 w-4 mr-2" />
          Back
        </Button>
        <div v-else></div>

        <div>
          <Button
            v-if="currentStep < steps.length - 1"
            variant="default"
            @click="nextStep"
          >
            Next
            <ChevronRightIcon class="h-4 w-4 ml-2" />
          </Button>
          <Button
            v-else
            variant="default"
            @click="createPath"
            :disabled="isCreating"
          >
            <SaveIcon v-if="!isCreating" class="h-4 w-4 mr-2" />
            <Loader2Icon v-else class="h-4 w-4 mr-2 animate-spin" />
            {{ isCreating ? 'Creating...' : 'Create Path' }}
          </Button>
        </div>
      </div>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XIcon,
  PlusIcon,
  EyeIcon,
  SaveIcon,
  ArrowUpDownIcon,
  PackageIcon,
  Loader2Icon,
  RouteIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'

const emit = defineEmits(['close', 'path-created'])

// Step definition
const steps = [
  { title: 'Basic Info' },
  { title: 'Locations' },
  { title: 'Review' }
]

const currentStep = ref(0)
const isCreating = ref(false)
const showPathMap = ref(false)
const locationSearch = ref('')
const draggedLocationIndex = ref(null)

// Mock data for demo purposes
const warehouses = ref([
  { id: 'wh1', name: 'Main Warehouse' },
  { id: 'wh2', name: 'Distribution Center' },
  { id: 'wh3', name: 'Fulfillment Center' }
])

const availableLocations = ref([
  { id: 'loc1', code: 'A-01-01', type: 'shelf', areaName: 'Zone A' },
  { id: 'loc2', code: 'A-01-02', type: 'shelf', areaName: 'Zone A' },
  { id: 'loc3', code: 'A-02-01', type: 'shelf', areaName: 'Zone A' },
  { id: 'loc4', code: 'A-02-02', type: 'shelf', areaName: 'Zone A' },
  { id: 'loc5', code: 'B-01-01', type: 'shelf', areaName: 'Zone B' },
  { id: 'loc6', code: 'B-01-02', type: 'shelf', areaName: 'Zone B' },
  { id: 'loc7', code: 'B-02-01', type: 'shelf', areaName: 'Zone B' },
  { id: 'loc8', code: 'B-02-02', type: 'shelf', areaName: 'Zone B' },
  { id: 'loc9', code: 'C-01-01', type: 'rack', areaName: 'Zone C' },
  { id: 'loc10', code: 'C-01-02', type: 'rack', areaName: 'Zone C' },
  { id: 'loc11', code: 'C-02-01', type: 'rack', areaName: 'Zone C' },
  { id: 'loc12', code: 'C-02-02', type: 'rack', areaName: 'Zone C' },
  { id: 'loc13', code: 'D-01-01', type: 'bin', areaName: 'Zone D' },
  { id: 'loc14', code: 'D-01-02', type: 'bin', areaName: 'Zone D' },
  { id: 'loc15', code: 'D-02-01', type: 'bin', areaName: 'Zone D' },
  { id: 'loc16', code: 'D-02-02', type: 'bin', areaName: 'Zone D' }
])

// Form data
const formData = reactive({
  name: '',
  warehouseId: '',
  description: '',
  isDefault: false,
  sequence: []
})

// Form validation
const errors = reactive({
  name: '',
  warehouseId: '',
  sequence: ''
})

// Computed properties
const filteredLocations = computed(() => {
  // Filter out locations already in the sequence
  const alreadySelected = new Set(formData.sequence.map(l => l.locationId))
  let filtered = availableLocations.value.filter(l => !alreadySelected.has(l.id))
  
  // Apply search filter
  if (locationSearch.value) {
    const searchTerm = locationSearch.value.toLowerCase()
    filtered = filtered.filter(l => 
      l.code.toLowerCase().includes(searchTerm) ||
      l.areaName?.toLowerCase().includes(searchTerm) ||
      l.type.toLowerCase().includes(searchTerm)
    )
  }
  
  return filtered
})

// Methods
function nextStep() {
  // Validate current step before proceeding
  if (currentStep.value === 0) {
    // Validate basic info
    let valid = true
    
    if (!formData.name.trim()) {
      errors.name = 'Path name is required'
      valid = false
    } else {
      errors.name = ''
    }
    
    if (!formData.warehouseId) {
      errors.warehouseId = 'Please select a warehouse'
      valid = false
    } else {
      errors.warehouseId = ''
    }
    
    if (!valid) return
  }
  
  if (currentStep.value === 1) {
    // Validate locations
    if (formData.sequence.length === 0) {
      errors.sequence = 'At least one location must be added to the path'
      return
    } else {
      errors.sequence = ''
    }
  }
  
  currentStep.value++
}

function addLocation(location) {
  formData.sequence.push({
    locationId: location.id,
    locationCode: location.code,
    areaName: location.areaName,
    order: formData.sequence.length + 1
  })
}

function removeLocation(index) {
  formData.sequence.splice(index, 1)
  
  // Update order of remaining locations
  formData.sequence.forEach((loc, i) => {
    loc.order = i + 1
  })
}

function moveLocation(fromIndex, toIndex) {
  // Check if target index is valid
  if (toIndex < 0 || toIndex >= formData.sequence.length) return
  
  // Get the location to move
  const location = formData.sequence[fromIndex]
  
  // Remove from current position
  formData.sequence.splice(fromIndex, 1)
  
  // Insert at new position
  formData.sequence.splice(toIndex, 0, location)
  
  // Update order of all locations
  formData.sequence.forEach((loc, i) => {
    loc.order = i + 1
  })
}

function sortLocations() {
  formData.sequence.sort((a, b) => a.locationCode.localeCompare(b.locationCode))
  
  // Update order after sorting
  formData.sequence.forEach((loc, i) => {
    loc.order = i + 1
  })
}

function dragStart(index) {
  draggedLocationIndex.value = index
}

function drop(index) {
  if (draggedLocationIndex.value === null) return
  
  // Move the dragged location to the drop location
  moveLocation(draggedLocationIndex.value, index)
  draggedLocationIndex.value = null
}

function previewPath() {
  showPathMap.value = !showPathMap.value
}

function getWarehouseName(id) {
  const warehouse = warehouses.value.find(w => w.id === id)
  return warehouse ? warehouse.name : 'Unknown'
}

async function createPath() {
  // Validate all data before submitting
  if (!formData.name.trim()) {
    errors.name = 'Path name is required'
    currentStep.value = 0
    return
  }
  
  if (!formData.warehouseId) {
    errors.warehouseId = 'Please select a warehouse'
    currentStep.value = 0
    return
  }
  
  if (formData.sequence.length === 0) {
    errors.sequence = 'At least one location must be added to the path'
    currentStep.value = 1
    return
  }
  
  isCreating.value = true
  
  try {
    // In a real app, this would send the data to the API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create a proper path object
    const newPath = {
      id: `path-${Date.now().toString().substr(-6)}`,
      name: formData.name,
      warehouseId: formData.warehouseId,
      description: formData.description,
      isDefault: formData.isDefault,
      sequence: formData.sequence,
      createdAt: new Date().toISOString()
    }
    
    // Emit to parent component
    emit('path-created', newPath)
  } catch (error) {
    console.error('Error creating pick path:', error)
  } finally {
    isCreating.value = false
    emit('close')
  }
}
</script>

<style scoped>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>