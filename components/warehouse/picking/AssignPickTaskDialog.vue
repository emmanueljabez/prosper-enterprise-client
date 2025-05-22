<template>
  <DialogContent class="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Assign Picking Task</DialogTitle>
      <DialogDescription>
        Assign this picking task to a warehouse staff member
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
          <div class="font-medium">{{ task.items.length }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground">Priority</div>
          <Badge :variant="getPriorityVariant(task.priority)">
            {{ formatPriority(task.priority) }}
          </Badge>
        </div>
      </div>

      <!-- Current Assignment -->
      <div v-if="task.assignedTo" class="space-y-2">
        <h4 class="text-sm font-medium">Current Assignment</h4>
        <div class="flex items-center space-x-3 p-3 border rounded-md bg-muted/30">
          <div 
            class="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary"
          >
            <UserIcon class="h-4 w-4" />
          </div>
          <div>
            <div class="font-medium">{{ task.assignedTo }}</div>
            <div class="text-xs text-muted-foreground">
              Assigned {{ task.assignedAt ? formatRelativeTime(task.assignedAt) : 'previously' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Staff Selection -->
      <div class="space-y-2">
        <Label for="staffSelect">Assign To</Label>
        
        <div class="flex items-center space-x-2">
          <div class="relative flex-1">
            <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              id="staffSearch"
              placeholder="Search staff..."
              class="pl-8"
              v-model="searchQuery"
            />
          </div>
          <Button variant="outline" title="Refresh staff list" @click="fetchStaffMembers">
            <RefreshCwIcon class="h-4 w-4" />
          </Button>
        </div>
        
        <div class="border rounded-md overflow-hidden">
          <div 
            v-if="isLoading" 
            class="flex items-center justify-center py-6"
          >
            <Loader2Icon class="h-5 w-5 animate-spin text-muted-foreground" />
            <span class="ml-2 text-sm text-muted-foreground">Loading staff...</span>
          </div>
          <div v-else-if="filteredStaff.length === 0" class="py-6 text-center text-muted-foreground">
            <UserXIcon class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No staff members found</p>
          </div>
          <RadioGroup v-else v-model="selectedStaffId" class="divide-y">
            <div 
              v-for="staff in filteredStaff" 
              :key="staff.id"
              class="relative flex items-center space-x-3 p-3 transition-colors hover:bg-muted"
            >
              <RadioGroupItem :value="staff.id" :id="`staff-${staff.id}`" />
              <Label 
                :for="`staff-${staff.id}`"
                class="flex flex-1 items-center space-x-3 cursor-pointer"
              >
                <div class="flex-shrink-0">
                  <div 
                    v-if="staff.avatar" 
                    class="h-8 w-8 rounded-full overflow-hidden"
                  >
                    <img :src="staff.avatar" alt="" class="h-full w-full object-cover" />
                  </div>
                  <div 
                    v-else
                    class="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary"
                  >
                    {{ getInitials(staff.name) }}
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-medium">{{ staff.name }}</div>
                  <div class="flex items-center text-xs text-muted-foreground">
                    <div>{{ staff.role }}</div>
                    <Badge 
                      v-if="staff.activeTasks" 
                      variant="secondary" 
                      class="ml-2"
                    >
                      {{ staff.activeTasks }} active tasks
                    </Badge>
                  </div>
                </div>
                <Badge 
                  v-if="staff.status" 
                  :variant="getStaffStatusVariant(staff.status)"
                  class="ml-auto"
                >
                  {{ staff.status }}
                </Badge>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <!-- Assignment Note -->
      <div class="space-y-2">
        <Label for="assignmentNote">Note (Optional)</Label>
        <Textarea
          id="assignmentNote"
          v-model="assignmentNote"
          placeholder="Add a note about this assignment..."
          :rows="2"
        />
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        variant="default" 
        @click="assignTask" 
        :disabled="!selectedStaffId || isSubmitting"
      >
        <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        <UserCheckIcon v-else class="h-4 w-4 mr-2" />
        {{ isSubmitting ? 'Assigning...' : 'Assign Task' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Loader2Icon,
  RefreshCwIcon,
  Search,
  UserCheckIcon,
  UserIcon,
  UserXIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  }
})

const emit = defineEmits(['close', 'task-assigned'])

// State
const isLoading = ref(false)
const isSubmitting = ref(false)
const staffMembers = ref([])
const selectedStaffId = ref('')
const assignmentNote = ref('')
const searchQuery = ref('')

// Mock staff data for demo purposes
const mockStaffMembers = [
  { 
    id: 'staff-1', 
    name: 'John Doe', 
    role: 'Warehouse Associate',
    avatar: null,
    status: 'available',
    activeTasks: 2
  },
  { 
    id: 'staff-2', 
    name: 'Jane Smith', 
    role: 'Senior Picker',
    avatar: null,
    status: 'available',
    activeTasks: 0
  },
  { 
    id: 'staff-3', 
    name: 'Mike Johnson', 
    role: 'Warehouse Associate',
    avatar: null,
    status: 'busy',
    activeTasks: 5
  },
  { 
    id: 'staff-4', 
    name: 'Sarah Williams', 
    role: 'Team Lead',
    avatar: null,
    status: 'available',
    activeTasks: 1
  },
  { 
    id: 'staff-5', 
    name: 'Robert Brown', 
    role: 'Warehouse Associate',
    avatar: null,
    status: 'offline',
    activeTasks: 0
  }
]

// Computed properties
const filteredStaff = computed(() => {
  if (!searchQuery.value) return staffMembers.value
  
  const query = searchQuery.value.toLowerCase()
  return staffMembers.value.filter(staff => 
    staff.name.toLowerCase().includes(query) ||
    staff.role.toLowerCase().includes(query)
  )
})

// Methods
async function fetchStaffMembers() {
  isLoading.value = true
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 800))
    staffMembers.value = mockStaffMembers
    
    // If the task is already assigned, pre-select that staff member
    if (props.task.assignedTo) {
      const assignedStaff = staffMembers.value.find(
        staff => staff.name === props.task.assignedTo
      )
      if (assignedStaff) {
        selectedStaffId.value = assignedStaff.id
      }
    }
  } catch (error) {
    console.error('Error fetching staff members:', error)
  } finally {
    isLoading.value = false
  }
}

async function assignTask() {
  if (!selectedStaffId.value) return
  
  isSubmitting.value = true
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const selectedStaff = staffMembers.value.find(staff => staff.id === selectedStaffId.value)
    
    const assignmentData = {
      staffId: selectedStaffId.value,
      staffName: selectedStaff?.name,
      note: assignmentNote.value,
      timestamp: new Date().toISOString()
    }
    
    emit('task-assigned', props.task, selectedStaff?.name)
  } catch (error) {
    console.error('Error assigning task:', error)
  } finally {
    isSubmitting.value = false
  }
}

function formatRelativeTime(dateString) {
  if (!dateString) return ''
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
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

function getStaffStatusVariant(status) {
  switch (status) {
    case 'available': return 'success'
    case 'busy': return 'warning'
    case 'offline': return 'outline'
    default: return 'secondary'
  }
}

function getInitials(name) {
  if (!name) return ''
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Initialize component
onMounted(() => {
  fetchStaffMembers()
})
</script>