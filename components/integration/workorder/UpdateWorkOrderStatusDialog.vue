<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Update Work Order Status</DialogTitle>
        <DialogDescription>
          Change the status of work order "{{ workOrder?.orderNumber }}".
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-4 space-y-4">
        <div v-if="loading" class="flex justify-center">
          <Loader2Icon class="h-6 w-6 animate-spin text-primary" />
        </div>
        
        <div v-else>
          <!-- Current Status -->
          <div class="flex items-center gap-2 mb-4">
            <div>Current Status:</div>
            <Badge :variant="getStatusVariant(workOrder?.status)">
              {{ formatStatus(workOrder?.status) }}
            </Badge>
          </div>
          
          <!-- New Status Selection -->
          <div>
            <Label for="newStatus">New Status</Label>
            <Select id="newStatus" v-model="newStatus" @update:modelValue="handleStatusChange">
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="status in availableStatuses" 
                  :key="status.value" 
                  :value="status.value"
                  :disabled="status.value === workOrder?.status"
                >
                  {{ status.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Status-specific Fields -->
          <div v-if="newStatus" class="space-y-4 mt-4">
            <!-- In Progress -->
            <div v-if="newStatus === 'in_progress'" class="space-y-4">
              <div>
                <Label for="startDate">Actual Start Date</Label>
                <Input id="startDate" type="date" v-model="statusDetails.startDate" :max="today" />
              </div>
              
              <div>
                <Label for="assignedTo">Assigned To</Label>
                <Input id="assignedTo" v-model="statusDetails.assignedTo" placeholder="Enter name or employee ID" />
              </div>
            </div>
            
            <!-- On Hold -->
            <div v-if="newStatus === 'on_hold'" class="space-y-4">
              <div>
                <Label for="reason">Reason for Hold</Label>
                <Select id="reason" v-model="statusDetails.reason">
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="material_shortage">Material Shortage</SelectItem>
                    <SelectItem value="equipment_issue">Equipment Issue</SelectItem>
                    <SelectItem value="staffing">Staffing</SelectItem>
                    <SelectItem value="quality_issue">Quality Issue</SelectItem>
                    <SelectItem value="scheduling">Scheduling Conflict</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label for="expectedResumption">Expected Resumption Date</Label>
                <Input id="expectedResumption" type="date" v-model="statusDetails.expectedResumption" :min="tomorrow" />
              </div>
              
              <div>
                <Label for="holdNotes">Notes</Label>
                <Textarea id="holdNotes" v-model="statusDetails.notes" placeholder="Additional details about the hold" />
              </div>
            </div>
            
            <!-- Completed -->
            <div v-if="newStatus === 'completed'" class="space-y-4">
              <div>
                <Label for="completionDate">Completion Date</Label>
                <Input id="completionDate" type="date" v-model="statusDetails.completionDate" :max="today" />
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label for="completed">Completed Units</Label>
                  <Input 
                    id="completed" 
                    v-model.number="statusDetails.completed" 
                    type="number" 
                    min="0" 
                    :max="workOrder?.quantity" 
                  />
                </div>
                
                <div>
                  <Label for="rejected">Rejected Units</Label>
                  <Input 
                    id="rejected" 
                    v-model.number="statusDetails.rejected" 
                    type="number" 
                    min="0" 
                  />
                </div>
              </div>
              
              <div v-if="statusDetails.completed < workOrder?.quantity">
                <Alert variant="warning">
                  <AlertTriangleIcon class="h-4 w-4" />
                  <AlertTitle>Partial Completion</AlertTitle>
                  <AlertDescription>
                    You're marking this work order as complete with fewer units than planned. The remaining units will be considered cancelled.
                  </AlertDescription>
                </Alert>
              </div>
              
              <div>
                <Label for="qualityNotes">Quality Notes</Label>
                <Textarea id="qualityNotes" v-model="statusDetails.qualityNotes" placeholder="Notes about quality or issues encountered" />
              </div>
              
              <div v-if="hasUnconsumedMaterials" class="border-t pt-4">
                <div class="flex items-center justify-between mb-2">
                  <Label>Material Consumption</Label>
                  <Button variant="outline" size="sm" @click="autoFillConsumption">Auto Fill</Button>
                </div>
                
                <div v-for="(component, index) in componentConsumption" :key="index" class="p-3 border rounded-md mb-3">
                  <div class="font-medium">{{ component.itemName }}</div>
                  <div class="text-xs text-muted-foreground mb-2">{{ component.sku }}</div>
                  
                  <div class="grid grid-cols-3 gap-3">
                    <div>
                      <Label :for="`allocated-${index}`">Allocated</Label>
                      <Input 
                        :id="`allocated-${index}`" 
                        :value="component.allocatedQuantity" 
                        type="number" 
                        readonly
                      />
                    </div>
                    <div>
                      <Label :for="`previouslyConsumed-${index}`">Previously Used</Label>
                      <Input 
                        :id="`previouslyConsumed-${index}`" 
                        :value="component.previouslyConsumed" 
                        type="number" 
                        readonly
                      />
                    </div>
                    <div>
                      <Label :for="`consumed-${index}`">Consumed Now</Label>
                      <Input 
                        :id="`consumed-${index}`" 
                        v-model.number="component.additionalConsumption" 
                        type="number" 
                        min="0" 
                        step="0.01"
                        :max="component.allocatedQuantity - component.previouslyConsumed"
                      />
                    </div>
                  </div>
                  
                  <div class="mt-1 text-xs">
                    <span class="text-muted-foreground">Unit: {{ component.unitOfMeasure }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Cancelled -->
            <div v-if="newStatus === 'cancelled'" class="space-y-4">
              <div>
                <Label for="cancellationReason">Reason for Cancellation</Label>
                <Select id="cancellationReason" v-model="statusDetails.reason">
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_request">Customer Request</SelectItem>
                    <SelectItem value="design_change">Design Change</SelectItem>
                    <SelectItem value="material_unavailable">Materials Unavailable</SelectItem>
                    <SelectItem value="equipment_issue">Equipment Issue</SelectItem>
                    <SelectItem value="obsolete">Product Obsolete</SelectItem>
                    <SelectItem value="duplicate">Duplicate Order</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label for="cancellationNotes">Notes</Label>
                <Textarea id="cancellationNotes" v-model="statusDetails.notes" placeholder="Additional details about the cancellation" />
              </div>
              
              <div v-if="hasAllocatedMaterials" class="border-t pt-4">
                <Alert>
                  <InfoIcon class="h-4 w-4" />
                  <AlertTitle>Allocated Materials</AlertTitle>
                  <AlertDescription>
                    This work order has {{ getAllocatedMaterialsCount() }} materials allocated. These will be returned to available inventory.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
        <Button 
          :disabled="!isFormValid || loading" 
          @click="updateStatus"
        >
          Update Status
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  Loader2Icon,
  AlertTriangleIcon,
  InfoIcon
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  workOrder: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'update'])

// Date helpers
const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

// Form state
const newStatus = ref('')
const statusDetails = ref({})
const componentConsumption = ref([])

// Define available statuses based on current status
const availableStatuses = computed(() => {
  if (!props.workOrder) return []
  
  const currentStatus = props.workOrder.status
  
  // Define all possible transitions
  const transitions = {
    'planned': [
      { value: 'in_progress', label: 'In Progress' },
      { value: 'on_hold', label: 'On Hold' },
      { value: 'cancelled', label: 'Cancelled' }
    ],
    'in_progress': [
      { value: 'on_hold', label: 'On Hold' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ],
    'on_hold': [
      { value: 'in_progress', label: 'In Progress' },
      { value: 'cancelled', label: 'Cancelled' }
    ],
    'completed': [
      // Usually no transitions out of completed, but could be reopened if needed
      { value: 'in_progress', label: 'Reopen (In Progress)' }
    ],
    'cancelled': [
      // Usually no transitions out of cancelled, but could be reinstated if needed
      { value: 'planned', label: 'Reinstate (Planned)' }
    ]
  }
  
  return transitions[currentStatus] || []
})

// Reset form when dialog opens or work order changes
watch(() => [props.open, props.workOrder], () => {
  if (props.open && props.workOrder) {
    newStatus.value = ''
    statusDetails.value = {}
    initializeComponentConsumption()
  }
}, { immediate: true })

// Initialize component consumption data
const initializeComponentConsumption = () => {
  if (!props.workOrder || !props.workOrder.components) {
    componentConsumption.value = []
    return
  }
  
  componentConsumption.value = props.workOrder.components.map(component => {
    const previouslyConsumed = Number(component.consumedQuantity) || 0
    return {
      ...component,
      previouslyConsumed,
      additionalConsumption: 0
    }
  })
}

// Computed properties for conditional displays
const hasUnconsumedMaterials = computed(() => {
  return componentConsumption.value.some(component => 
    (component.allocatedQuantity || 0) > (component.previouslyConsumed || 0)
  )
})

const hasAllocatedMaterials = computed(() => {
  if (!props.workOrder || !props.workOrder.components) {
    return false
  }
  
  return props.workOrder.components.some(component => 
    (component.allocatedQuantity || 0) > (component.consumedQuantity || 0)
  )
})

// Handle status change - set up appropriate defaults
const handleStatusChange = (status) => {
  statusDetails.value = {}
  
  if (status === 'in_progress') {
    statusDetails.value = {
      startDate: today,
      assignedTo: props.workOrder.assignedTo || ''
    }
  } else if (status === 'on_hold') {
    statusDetails.value = {
      reason: '',
      expectedResumption: '',
      notes: ''
    }
  } else if (status === 'completed') {
    statusDetails.value = {
      completionDate: today,
      completed: props.workOrder.completed || props.workOrder.quantity,
      rejected: props.workOrder.rejected || 0,
      qualityNotes: ''
    }
  } else if (status === 'cancelled') {
    statusDetails.value = {
      reason: '',
      notes: ''
    }
  }
}

// Auto-fill remaining materials as consumed
const autoFillConsumption = () => {
  componentConsumption.value = componentConsumption.value.map(component => {
    const remaining = (component.allocatedQuantity || 0) - (component.previouslyConsumed || 0)
    return {
      ...component,
      additionalConsumption: remaining > 0 ? remaining : 0
    }
  })
}

// Count allocated materials
const getAllocatedMaterialsCount = () => {
  if (!props.workOrder || !props.workOrder.components) {
    return 0
  }
  
  return props.workOrder.components.filter(component => 
    (component.allocatedQuantity || 0) > (component.consumedQuantity || 0)
  ).length
}

// Form validation
const isFormValid = computed(() => {
  if (!newStatus.value) return false
  
  if (newStatus.value === 'in_progress') {
    return statusDetails.value.startDate
  } else if (newStatus.value === 'on_hold') {
    return statusDetails.value.reason
  } else if (newStatus.value === 'completed') {
    return statusDetails.value.completionDate && 
           statusDetails.value.completed >= 0 &&
           statusDetails.value.completed <= props.workOrder?.quantity
  } else if (newStatus.value === 'cancelled') {
    return statusDetails.value.reason
  }
  
  return true
})

// Helper methods for formatting and display
const formatStatus = (status) => {
  if (!status) return ''
  if (status === 'in_progress') return 'In Progress'
  if (status === 'on_hold') return 'On Hold'
  return status.charAt(0).toUpperCase() + status.slice(1)
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

// Submit the status update
const updateStatus = () => {
  if (!isFormValid.value) return
  
  // Create a history entry for the status change
  const historyEntry = {
    type: 'status_change',
    timestamp: new Date().toISOString(),
    description: `Status changed from ${props.workOrder.status} to ${newStatus.value}`,
    user: 'Current User' // Replace with actual user info
  }
  
  // Add additional details to history based on status
  if (newStatus.value === 'on_hold' && statusDetails.value.reason) {
    historyEntry.details = `Reason: ${statusDetails.value.reason}`
  } else if (newStatus.value === 'cancelled' && statusDetails.value.reason) {
    historyEntry.details = `Reason: ${statusDetails.value.reason}`
  }
  
  // Prepare updated work order
  const updatedWorkOrder = {
    ...props.workOrder,
    status: newStatus.value,
    history: [...(props.workOrder.history || []), historyEntry]
  }
  
  // Add status-specific updates
  if (newStatus.value === 'in_progress') {
    updatedWorkOrder.actualStartDate = statusDetails.value.startDate
    updatedWorkOrder.assignedTo = statusDetails.value.assignedTo
  } else if (newStatus.value === 'on_hold') {
    updatedWorkOrder.holdReason = statusDetails.value.reason
    updatedWorkOrder.expectedResumptionDate = statusDetails.value.expectedResumption
    updatedWorkOrder.holdNotes = statusDetails.value.notes
  } else if (newStatus.value === 'completed') {
    updatedWorkOrder.completionDate = statusDetails.value.completionDate
    updatedWorkOrder.completed = statusDetails.value.completed
    updatedWorkOrder.rejected = statusDetails.value.rejected
    updatedWorkOrder.qualityNotes = statusDetails.value.qualityNotes
    
    // Update component consumption
    if (updatedWorkOrder.components && componentConsumption.value.length > 0) {
      updatedWorkOrder.components = updatedWorkOrder.components.map(component => {
        const consumptionData = componentConsumption.value.find(c => c.itemId === component.itemId)
        if (consumptionData) {
          return {
            ...component,
            consumedQuantity: (component.consumedQuantity || 0) + (consumptionData.additionalConsumption || 0)
          }
        }
        return component
      })
    }
  } else if (newStatus.value === 'cancelled') {
    updatedWorkOrder.cancellationReason = statusDetails.value.reason
    updatedWorkOrder.cancellationNotes = statusDetails.value.notes
  }
  
  emit('update', updatedWorkOrder)
}
</script>