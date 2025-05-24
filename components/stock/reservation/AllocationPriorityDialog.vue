<template>
  <DialogContent class="sm:max-w-[800px]">
    <DialogHeader>
      <DialogTitle>Allocation Priorities</DialogTitle>
      <DialogDescription>
        Configure how inventory is allocated when multiple orders compete for the same items
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium">Priority Rules</h3>
          <p class="text-sm text-muted-foreground">
            Drag to reorder. Higher items in the list have higher priority.
          </p>
        </div>
        <Button @click="addPriority" variant="outline" size="sm">
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[50px]">Priority</TableHead>
              <TableHead>Rule Name</TableHead>
              <TableHead>Criteria</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="editedPriorities.length === 0">
              <TableCell colSpan="6" class="text-center">
                <div class="flex flex-col items-center justify-center py-6">
                  <LayersIcon class="h-8 w-8 text-muted-foreground mb-2" />
                  <p class="text-muted-foreground">No allocation rules defined yet</p>
                  <Button @click="addPriority" variant="outline" size="sm" class="mt-2">
                    <PlusIcon class="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow 
              v-for="(priority, index) in editedPriorities" 
              :key="priority.id"
              class="group"
              :class="{ 'border-l-4 border-l-primary': priority.isEditing }"
            >
              <TableCell>
                <div class="flex items-center">
                  <Badge>{{ index + 1 }}</Badge>
                  <div 
                    v-if="!priority.isEditing" 
                    class="ml-2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
                    @mousedown="startDrag(index)"
                  >
                    <MoveIcon class="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Input
                  v-if="priority.isEditing"
                  v-model="priority.name"
                  placeholder="Rule name"
                  class="max-w-[200px]"
                />
                <div v-else class="font-medium">{{ priority.name }}</div>
              </TableCell>
              <TableCell>
                <div v-if="priority.isEditing">
                  <Select v-model="priority.criteriaType">
                    <SelectTrigger class="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orderDate">Order Date (Oldest First)</SelectItem>
                      <SelectItem value="orderDateNewest">Order Date (Newest First)</SelectItem>
                      <SelectItem value="customerType">Customer Type</SelectItem>
                      <SelectItem value="orderValue">Order Value</SelectItem>
                      <SelectItem value="shippingMethod">Shipping Method</SelectItem>
                      <SelectItem value="manualPriority">Manual Priority Level</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div v-if="priority.criteriaType === 'customerType'" class="mt-2">
                    <Select v-model="priority.customerType">
                      <SelectTrigger class="w-[180px]">
                        <SelectValue placeholder="Select customer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vip">VIP Customers</SelectItem>
                        <SelectItem value="wholesale">Wholesale Customers</SelectItem>
                        <SelectItem value="retail">Retail Customers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div v-if="priority.criteriaType === 'shippingMethod'" class="mt-2">
                    <Select v-model="priority.shippingMethod">
                      <SelectTrigger class="w-[180px]">
                        <SelectValue placeholder="Select shipping method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="express">Express Shipping</SelectItem>
                        <SelectItem value="priority">Priority Shipping</SelectItem>
                        <SelectItem value="standard">Standard Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div v-else>
                  <Badge variant="outline">
                    {{ formatCriteria(priority) }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Textarea
                  v-if="priority.isEditing"
                  v-model="priority.description"
                  placeholder="Describe this rule"
                  class="max-h-[100px]"
                  rows="2"
                />
                <div v-else class="text-sm text-muted-foreground">
                  {{ priority.description || 'No description' }}
                </div>
              </TableCell>
              <TableCell>
                <div v-if="priority.isEditing">
                  <Select v-model="priority.status">
                    <SelectTrigger class="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div v-else>
                  <Badge :variant="priority.status === 'active' ? 'success' : 'secondary'">
                    {{ priority.status === 'active' ? 'Active' : 'Inactive' }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell class="text-right">
                <div v-if="priority.isEditing" class="flex justify-end space-x-2">
                  <Button 
                    @click="savePriority(index)" 
                    size="sm" 
                    variant="outline" 
                    class="h-8 px-2 text-green-600"
                  >
                    <CheckIcon class="h-4 w-4" />
                  </Button>
                  <Button 
                    @click="cancelEdit(index)" 
                    size="sm" 
                    variant="outline" 
                    class="h-8 px-2 text-muted-foreground"
                  >
                    <XIcon class="h-4 w-4" />
                  </Button>
                </div>
                <div v-else class="flex justify-end space-x-2">
                  <Button 
                    @click="editPriority(index)" 
                    size="sm" 
                    variant="ghost" 
                    class="h-8 w-8 p-0"
                  >
                    <EditIcon class="h-4 w-4" />
                  </Button>
                  <Button 
                    @click="confirmDeletePriority(index)" 
                    size="sm" 
                    variant="ghost" 
                    class="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2Icon class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Separator />

      <div class="space-y-4">
        <h3 class="text-lg font-medium">Allocation Settings</h3>
        
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-2">
            <Label>Default Allocation Strategy</Label>
            <Select v-model="allocationSettings.defaultStrategy">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fifo">First In, First Out (FIFO)</SelectItem>
                <SelectItem value="priority">Priority Based</SelectItem>
                <SelectItem value="partial">Allow Partial Allocations</SelectItem>
                <SelectItem value="complete">Complete Orders Only</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              Strategy used when no specific rules match
            </p>
          </div>

          <div class="space-y-2">
            <Label>Out of Stock Handling</Label>
            <Select v-model="allocationSettings.outOfStockHandling">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waitlist">Add to Waitlist</SelectItem>
                <SelectItem value="backorder">Allow Backorders</SelectItem>
                <SelectItem value="reject">Reject Order</SelectItem>
                <SelectItem value="substitute">Suggest Substitutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Switch v-model="allocationSettings.enableAutoAllocation" />
              <Label>Enable Automatic Allocation</Label>
            </div>
            <p class="text-xs text-muted-foreground">
              Automatically allocate inventory when orders are created
            </p>
          </div>

          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Switch v-model="allocationSettings.reserveForExistingCarts" />
              <Label>Reserve Stock for Existing Carts</Label>
            </div>
            <p class="text-xs text-muted-foreground">
              Prioritize active cart reservations over new orders
            </p>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="cancelChanges">Cancel</Button>
      <Button 
        @click="savePriorities" 
        :disabled="isSubmitting || hasPriorityError"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Save Changes
      </Button>
    </DialogFooter>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="showDeleteConfirmation">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Priority Rule</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this allocation priority rule? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteConfirmation = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="deletePriority" class="bg-destructive text-destructive-foreground">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </DialogContent>
</template>

<script setup>
import { ref, computed, toRaw } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { 
  PlusIcon, CheckIcon, XIcon, EditIcon, 
  Trash2Icon, LayersIcon, Loader2Icon, MoveIcon 
} from 'lucide-vue-next'
import { 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const props = defineProps({
  priorities: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['close', 'priorities-updated'])

// State management
const editedPriorities = ref([])
const priorityToDeleteIndex = ref(null)
const showDeleteConfirmation = ref(false)
const isSubmitting = ref(false)

// Drag and drop state
const draggedItemIndex = ref(null)

// Allocation settings
const allocationSettings = ref({
  defaultStrategy: 'fifo',
  outOfStockHandling: 'waitlist',
  enableAutoAllocation: true,
  reserveForExistingCarts: true
})

// Initialize from props
const initializePriorities = () => {
  // Deep clone the priorities and add isEditing flag
  editedPriorities.value = props.priorities.map(priority => ({
    ...priority,
    isEditing: false,
    originalData: { ...priority } // Keep original data for cancel
  }))
  
  // If we have settings in the first priority, use them
  if (props.priorities.length > 0 && props.priorities[0].allocationSettings) {
    allocationSettings.value = { ...props.priorities[0].allocationSettings }
  }
}

// Initialize on component creation
initializePriorities()

// Computed properties
const hasPriorityError = computed(() => {
  return editedPriorities.value.some(priority => {
    return !priority.name || !priority.criteriaType
  })
})

// Helper functions
function formatCriteria(priority) {
  if (!priority.criteriaType) return 'Not defined'
  
  const criteriaMap = {
    orderDate: 'Oldest Orders First',
    orderDateNewest: 'Newest Orders First',
    customerType: priority.customerType ? `${formatCustomerType(priority.customerType)} Customers` : 'Customer Type',
    orderValue: 'Highest Order Value',
    shippingMethod: priority.shippingMethod ? formatShippingMethod(priority.shippingMethod) : 'Shipping Method',
    manualPriority: 'Manual Priority Level'
  }
  
  return criteriaMap[priority.criteriaType] || priority.criteriaType
}

function formatCustomerType(type) {
  const types = {
    vip: 'VIP',
    wholesale: 'Wholesale',
    retail: 'Retail'
  }
  return types[type] || type
}

function formatShippingMethod(method) {
  const methods = {
    express: 'Express Shipping',
    priority: 'Priority Shipping',
    standard: 'Standard Shipping'
  }
  return methods[method] || method
}

// Drag and drop handlers
function startDrag(index) {
  draggedItemIndex.value = index
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e) {
  // This is a placeholder for drag movement logic
  // In a real implementation, you would use e.clientY to determine position
}

function stopDrag() {
  draggedItemIndex.value = null
  
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

function movePriority(fromIndex, toIndex) {
  if (
    fromIndex === null || 
    toIndex === null || 
    fromIndex === toIndex || 
    fromIndex < 0 || 
    toIndex < 0 || 
    fromIndex >= editedPriorities.value.length || 
    toIndex >= editedPriorities.value.length
  ) {
    return
  }
  
  const item = editedPriorities.value[fromIndex]
  editedPriorities.value.splice(fromIndex, 1)
  editedPriorities.value.splice(toIndex, 0, item)
}

// Action handlers
function addPriority() {
  const newPriority = {
    id: `priority-${uuidv4()}`,
    name: 'New Allocation Rule',
    criteriaType: 'orderDate',
    description: '',
    status: 'active',
    order: editedPriorities.value.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEditing: true,
    originalData: null
  }
  
  editedPriorities.value.push(newPriority)
}

function editPriority(index) {
  // Store original data for cancellation
  editedPriorities.value[index].originalData = { ...toRaw(editedPriorities.value[index]) }
  
  // Set isEditing to true
  editedPriorities.value[index].isEditing = true
}

function savePriority(index) {
  const priority = editedPriorities.value[index]
  
  // Validate priority
  if (!priority.name || !priority.criteriaType) {
    return
  }
  
  // Update timestamp and order
  priority.updatedAt = new Date().toISOString()
  priority.order = index + 1
  
  // Clear original data and exit edit mode
  priority.originalData = null
  priority.isEditing = false
}

function cancelEdit(index) {
  const priority = editedPriorities.value[index]
  
  if (priority.originalData) {
    // Restore original data
    Object.assign(priority, priority.originalData)
    priority.originalData = null
    priority.isEditing = false
  } else {
    // If it's a new priority without original data, remove it
    editedPriorities.value.splice(index, 1)
  }
}

function confirmDeletePriority(index) {
  priorityToDeleteIndex.value = index
  showDeleteConfirmation.value = true
}

function deletePriority() {
  if (priorityToDeleteIndex.value !== null) {
    editedPriorities.value.splice(priorityToDeleteIndex.value, 1)
    priorityToDeleteIndex.value = null
  }
  
  showDeleteConfirmation.value = false
}

function cancelChanges() {
  emit('close')
}

function savePriorities() {
  isSubmitting.value = true
  
  try {
    // Prepare priorities for saving
    const prioritiesToSave = editedPriorities.value.map((priority, index) => {
      // Remove temporary properties
      const { isEditing, originalData, ...cleanPriority } = priority
      
      // Update order to match current index
      cleanPriority.order = index + 1
      
      return cleanPriority
    })
    
    // Add allocation settings to the first priority
    if (prioritiesToSave.length > 0) {
      prioritiesToSave[0].allocationSettings = { ...allocationSettings.value }
    }
    
    // Emit update event
    emit('priorities-updated', prioritiesToSave)
  } catch (error) {
    console.error('Error saving allocation priorities:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.dragging {
  opacity: 0.5;
  background: var(--muted);
}
</style>