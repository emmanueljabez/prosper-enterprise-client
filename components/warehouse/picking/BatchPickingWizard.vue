<template>
  <SheetContent class="sm:max-w-md" position="right">
    <SheetHeader>
      <SheetTitle>Batch Picking</SheetTitle>
      <SheetDescription>
        Group multiple pick tasks together for efficient warehouse picking
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
      <!-- Step 1: Select Tasks -->
      <div v-if="currentStep === 0" class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium">Select Pick Tasks</h4>
          <Badge variant="outline">
            {{ selectedTasks.length }} / {{ pickingTasks.length }} selected
          </Badge>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label for="taskSearch">Search Tasks</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              @click="toggleSelectAll" 
              class="h-8 px-2 text-xs"
            >
              {{ isAllSelected ? 'Deselect All' : 'Select All' }}
            </Button>
          </div>
          <div class="relative">
            <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="taskSearch"
              v-model="filters.search"
              placeholder="Search by ID, order, customer..."
              class="pl-8"
            />
          </div>
        </div>

        <div class="border rounded-md overflow-hidden">
          <div 
            v-if="filteredTasks.length === 0" 
            class="py-6 text-center text-muted-foreground"
          >
            <PackageXIcon class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No pending pick tasks found</p>
            <p class="text-xs">Try adjusting your search criteria</p>
          </div>
          
          <div v-else class="max-h-[400px] overflow-y-auto">
            <div
              v-for="task in filteredTasks"
              :key="task.id"
              class="flex items-center p-3 border-b last:border-0 hover:bg-muted/50"
            >
              <Checkbox
                :id="'task-' + task.id"
                :checked="selectedTasks.includes(task.id)"
                @update:checked="toggleTaskSelection(task.id)"
              />
              <Label 
                :for="'task-' + task.id" 
                class="flex-1 ml-3 cursor-pointer"
              >
                <div class="grid grid-cols-2 gap-1">
                  <div>
                    <div class="font-medium text-sm">{{ task.id }}</div>
                    <div class="text-xs text-muted-foreground">Order #{{ task.orderNumber }}</div>
                  </div>
                  <div>
                    <div class="text-sm">{{ task.customerName || 'No customer' }}</div>
                    <div class="flex items-center text-xs text-muted-foreground">
                      <span>{{ task.items.length }} items</span>
                      <Badge 
                        :variant="getPriorityVariant(task.priority)" 
                        class="ml-2"
                      >
                        {{ formatPriority(task.priority) }}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Batch Options -->
      <div v-if="currentStep === 1" class="space-y-6">
        <div v-if="selectedTasks.length === 0" class="text-center py-6">
          <AlertCircleIcon class="h-8 w-8 mx-auto mb-2 text-destructive opacity-70" />
          <p>No tasks selected</p>
          <p class="text-sm text-muted-foreground mt-1">Please go back and select tasks to batch</p>
        </div>
        
        <div v-else>
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="batchName">Batch Name</Label>
              <Input
                id="batchName"
                v-model="batchOptions.name"
                placeholder="Enter a name for this batch"
              />
              <p v-if="errors.name" class="text-destructive text-sm">{{ errors.name }}</p>
            </div>
            
            <div class="space-y-2">
              <Label for="batchStrategy">Picking Strategy</Label>
              <Select v-model="batchOptions.strategy">
                <SelectTrigger id="batchStrategy">
                  <SelectValue placeholder="Select a picking strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order_based">Order-based (Pick complete orders)</SelectItem>
                  <SelectItem value="zone_based">Zone-based (Pick by warehouse zones)</SelectItem>
                  <SelectItem value="wave_picking">Wave Picking (Multiple orders at once)</SelectItem>
                  <SelectItem value="cluster_picking">Cluster Picking (Multiple totes)</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.strategy" class="text-destructive text-sm">{{ errors.strategy }}</p>
            </div>
            
            <div class="space-y-2">
              <Label for="pathSelection">Pick Path</Label>
              <Select v-model="batchOptions.pathId">
                <SelectTrigger id="pathSelection">
                  <SelectValue placeholder="Select a pick path" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto_optimize">Auto-optimize new path</SelectItem>
                  <SelectItem 
                    v-for="path in pickPaths" 
                    :key="path.id" 
                    :value="path.id"
                  >
                    {{ path.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label>Batch Options</Label>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    id="printLabels"
                    v-model:checked="batchOptions.printLabels"
                  />
                  <Label for="printLabels">Print tote/container labels</Label>
                </div>
                
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    id="useContainers"
                    v-model:checked="batchOptions.useContainers"
                  />
                  <Label for="useContainers">Use separate containers per order</Label>
                </div>
                
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    id="autoCreatePacking"
                    v-model:checked="batchOptions.autoCreatePacking" 
                  />
                  <Label for="autoCreatePacking">Auto-create packing tasks on completion</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-6 p-3 border rounded-md bg-muted/30">
            <div class="flex justify-between items-center mb-2">
              <h4 class="text-sm font-medium">Batch Summary</h4>
              <Badge variant="outline">{{ selectedTasks.length }} Tasks</Badge>
            </div>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Total items:</span>
                <span>{{ getTotalItems() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Total orders:</span>
                <span>{{ getUniqueOrderCount() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Estimated picking time:</span>
                <span>{{ getEstimatedTime() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Review & Start -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div class="space-y-2">
          <h4 class="text-sm font-medium">Batch Details</h4>
          <div class="rounded-md border p-4 space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <div class="text-xs text-muted-foreground">Batch Name</div>
                <div>{{ batchOptions.name }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">Picking Strategy</div>
                <div>{{ formatStrategy(batchOptions.strategy) }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">Pick Path</div>
                <div>
                  {{ batchOptions.pathId === 'auto_optimize' 
                    ? 'Auto-optimized'
                    : getPathName(batchOptions.pathId) }}
                </div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">Container Type</div>
                <div>
                  {{ batchOptions.useContainers 
                    ? 'Separate containers per order'
                    : 'Single container for batch' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium">Tasks in Batch ({{ selectedTasks.length }})</h4>
            <Button variant="outline" size="sm" @click="toggleTaskList">
              {{ showTaskList ? 'Hide Tasks' : 'Show Tasks' }}
            </Button>
          </div>
          
          <div v-if="showTaskList" class="rounded-md border max-h-[200px] overflow-y-auto">
            <div 
              v-for="taskId in selectedTasks" 
              :key="taskId"
              class="p-2 border-b last:border-0"
            >
              <div class="flex justify-between items-center">
                <div>
                  <div class="font-medium">{{ taskId }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ getTaskOrderNumber(taskId) }}
                  </div>
                </div>
                <Badge variant="outline">
                  {{ getTaskItemCount(taskId) }} items
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div v-if="batchOptions.pathId === 'auto_optimize'" class="space-y-2">
          <h4 class="text-sm font-medium">Optimized Pick Path</h4>
          <div class="rounded-md border p-4 bg-muted/20 h-[120px] flex items-center justify-center">
            <div class="text-center text-muted-foreground">
              <RouteIcon class="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p class="text-sm">An optimized pick path will be generated</p>
              <p class="text-xs">Based on item locations and picking strategy</p>
            </div>
          </div>
        </div>

        <Alert>
          <AlertCircleIcon class="h-4 w-4" />
          <AlertTitle>Ready to start batch picking</AlertTitle>
          <AlertDescription>
            This will create a batch picking session for {{ selectedTasks.length }} tasks. 
            Selected tasks will be marked as "in progress" and assigned to this batch.
          </AlertDescription>
        </Alert>
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
            :disabled="currentStep === 0 && selectedTasks.length === 0"
          >
            Next
            <ChevronRightIcon class="h-4 w-4 ml-2" />
          </Button>
          <Button
            v-else
            variant="default"
            @click="createBatch"
            :disabled="isCreating"
          >
            <PlayIcon v-if="!isCreating" class="h-4 w-4 mr-2" />
            <Loader2Icon v-else class="h-4 w-4 mr-2 animate-spin" />
            {{ isCreating ? 'Starting...' : 'Start Batch Picking' }}
          </Button>
        </div>
      </div>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import {
  AlertCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  PackageXIcon,
  PlayIcon,
  RouteIcon,
  Search
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'

const props = defineProps({
  pickingTasks: {
    type: Array,
    required: true
  },
  pickPaths: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'batch-created'])

// Step definition
const steps = [
  { title: 'Select Tasks' },
  { title: 'Batch Options' },
  { title: 'Review' }
]

// State management
const currentStep = ref(0)
const selectedTasks = ref([])
const isCreating = ref(false)
const showTaskList = ref(true)
const filters = reactive({
  search: ''
})

// Batch configuration options
const batchOptions = reactive({
  name: '',
  strategy: 'wave_picking',
  pathId: 'auto_optimize',
  printLabels: true,
  useContainers: true,
  autoCreatePacking: true
})

// Form validation
const errors = reactive({
  name: '',
  strategy: ''
})

// Computed properties
const filteredTasks = computed(() => {
  let tasks = [...props.pickingTasks]
  
  // Only show pending tasks that can be batched
  tasks = tasks.filter(task => task.status === 'pending')
  
  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    tasks = tasks.filter(task => 
      task.id.toLowerCase().includes(searchTerm) ||
      task.orderNumber.toLowerCase().includes(searchTerm) ||
      (task.customerName && task.customerName.toLowerCase().includes(searchTerm))
    )
  }
  
  return tasks
})

const isAllSelected = computed(() => {
  return filteredTasks.value.length > 0 && 
    filteredTasks.value.every(task => selectedTasks.value.includes(task.id))
})

// Methods
function toggleSelectAll() {
  if (isAllSelected.value) {
    // Deselect all filtered tasks
    filteredTasks.value.forEach(task => {
      const index = selectedTasks.value.indexOf(task.id)
      if (index !== -1) {
        selectedTasks.value.splice(index, 1)
      }
    })
  } else {
    // Select all filtered tasks
    filteredTasks.value.forEach(task => {
      if (!selectedTasks.value.includes(task.id)) {
        selectedTasks.value.push(task.id)
      }
    })
  }
}

function toggleTaskSelection(taskId) {
  const index = selectedTasks.value.indexOf(taskId)
  if (index === -1) {
    selectedTasks.value.push(taskId)
  } else {
    selectedTasks.value.splice(index, 1)
  }
}

function nextStep() {
  // Validate current step before proceeding
  if (currentStep.value === 0) {
    if (selectedTasks.value.length === 0) {
      return // Cannot proceed without selecting tasks
    }
  } else if (currentStep.value === 1) {
    // Validate batch options
    let valid = true
    
    if (!batchOptions.name.trim()) {
      errors.name = 'Batch name is required'
      valid = false
    } else {
      errors.name = ''
    }
    
    if (!batchOptions.strategy) {
      errors.strategy = 'Please select a picking strategy'
      valid = false
    } else {
      errors.strategy = ''
    }
    
    if (!valid) return
  }
  
  currentStep.value++
}

function toggleTaskList() {
  showTaskList.value = !showTaskList.value
}

function getTaskOrderNumber(taskId) {
  const task = props.pickingTasks.find(t => t.id === taskId)
  return task ? `Order #${task.orderNumber}` : 'Unknown order'
}

function getTaskItemCount(taskId) {
  const task = props.pickingTasks.find(t => t.id === taskId)
  return task ? task.items.length : 0
}

function getTotalItems() {
  return selectedTasks.value.reduce((total, taskId) => {
    const task = props.pickingTasks.find(t => t.id === taskId)
    return total + (task ? task.items.length : 0)
  }, 0)
}

function getUniqueOrderCount() {
  const orderNumbers = new Set()
  selectedTasks.value.forEach(taskId => {
    const task = props.pickingTasks.find(t => t.id === taskId)
    if (task) {
      orderNumbers.add(task.orderNumber)
    }
  })
  return orderNumbers.size
}

function getEstimatedTime() {
  const totalItems = getTotalItems()
  // Simple estimation: 30 seconds per item for picking
  const totalSeconds = totalItems * 30
  
  // Format as minutes and seconds
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  
  return `${minutes}m ${seconds}s`
}

function getPathName(pathId) {
  const path = props.pickPaths.find(p => p.id === pathId)
  return path ? path.name : 'Unknown path'
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

function formatStrategy(strategy) {
  switch (strategy) {
    case 'order_based': return 'Order-based'
    case 'zone_based': return 'Zone-based'
    case 'wave_picking': return 'Wave Picking'
    case 'cluster_picking': return 'Cluster Picking'
    default: return strategy
  }
}

async function createBatch() {
  // Validate before creating batch
  if (!batchOptions.name.trim()) {
    errors.name = 'Batch name is required'
    currentStep.value = 1
    return
  }
  
  isCreating.value = true
  
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create batch configuration to send to the parent component
    const batchConfig = {
      id: `batch-${Date.now().toString().substr(-6)}`,
      name: batchOptions.name,
      strategy: batchOptions.strategy,
      pathId: batchOptions.pathId,
      taskIds: [...selectedTasks.value],
      options: {
        printLabels: batchOptions.printLabels,
        useContainers: batchOptions.useContainers,
        autoCreatePacking: batchOptions.autoCreatePacking
      },
      createdAt: new Date().toISOString()
    }
    
    // Emit batch created event
    emit('batch-created', batchConfig)
  } catch (error) {
    console.error('Error creating batch:', error)
  } finally {
    isCreating.value = false
  }
}

// Auto-generate a batch name when selecting tasks
watch(selectedTasks, () => {
  if (selectedTasks.value.length > 0 && !batchOptions.name) {
    batchOptions.name = `Batch ${new Date().toLocaleDateString()} (${selectedTasks.value.length} tasks)`
  }
})
</script>