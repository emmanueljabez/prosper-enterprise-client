<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent class="sm:max-w-[600px] overflow-y-auto" position="right">
      <SheetHeader>
        <SheetTitle>Edit Work Order</SheetTitle>
        <SheetDescription>
          Make changes to work order "{{ workOrder.orderNumber }}".
        </SheetDescription>
      </SheetHeader>

      <div v-if="loading" class="flex items-center justify-center my-12">
        <Loader2Icon class="h-8 w-8 animate-spin text-primary" />
      </div>

      <div v-else class="py-6 space-y-6">
        <!-- BOM & Product Information (Read-only) -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">Product & BOM</h3>
          <div class="border rounded-md p-4">
            <div class="grid grid-cols-2 gap-y-2">
              <div>
                <Label>Product</Label>
                <div class="mt-1">{{ workOrder.productName }}</div>
                <div class="text-xs text-muted-foreground">{{ workOrder.productSku }}</div>
              </div>
              <div>
                <Label>BOM</Label>
                <div class="mt-1">{{ workOrder.bomName }}</div>
                <div class="text-xs text-muted-foreground">Version {{ workOrder.bomVersion }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Work Order Details (Editable) -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">Work Order Details</h3>
          
          <div class="space-y-4">
            <div>
              <Label for="orderNumber">Order Number</Label>
              <Input id="orderNumber" v-model="workOrder.orderNumber" placeholder="Enter order number" />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="quantity">Quantity</Label>
                <Input id="quantity" v-model.number="workOrder.quantity" type="number" min="1" />
              </div>
              
              <div>
                <Label for="priority">Priority</Label>
                <Select v-model="workOrder.priority">
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="plannedStartDate">Planned Start Date</Label>
                <Input id="plannedStartDate" v-model="workOrder.plannedStartDate" type="date" />
              </div>
              
              <div>
                <Label for="dueDate">Due Date</Label>
                <Input id="dueDate" v-model="workOrder.dueDate" type="date" />
              </div>
            </div>
            
            <div>
              <Label for="status">Status</Label>
              <Select v-model="workOrder.status">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label for="assignedTo">Assigned To</Label>
              <Input id="assignedTo" v-model="workOrder.assignedTo" placeholder="Enter name or employee ID" />
            </div>
            
            <div>
              <Label for="notes">Notes</Label>
              <Textarea id="notes" v-model="workOrder.notes" placeholder="Additional instructions or notes" rows="4" />
            </div>
          </div>
        </div>

        <!-- Production Progress -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">Production Progress</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="completed">Completed Units</Label>
              <Input 
                id="completed" 
                v-model.number="workOrder.completed" 
                type="number" 
                min="0" 
                :max="workOrder.quantity" 
              />
            </div>
            
            <div>
              <Label for="rejected">Rejected Units</Label>
              <Input 
                id="rejected" 
                v-model.number="workOrder.rejected" 
                type="number" 
                min="0" 
              />
            </div>
          </div>
          
          <div>
            <div class="flex justify-between items-center mb-2">
              <Label>Progress</Label>
              <span class="text-sm">{{ getProgressPercentage(workOrder) }}%</span>
            </div>
            <div class="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                class="h-full bg-primary" 
                :style="{width: `${getProgressPercentage(workOrder)}%`}"
              ></div>
            </div>
          </div>
        </div>

        <!-- Material Consumption -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">Material Consumption</h3>
          
          <div v-if="!workOrder.components || workOrder.components.length === 0" class="text-center p-4 border rounded-md bg-muted/30">
            <LayersIcon class="h-8 w-8 mx-auto text-muted-foreground" />
            <p class="mt-2 text-sm text-muted-foreground">No components in this work order</p>
          </div>
          
          <div v-else>
            <div v-for="(component, index) in workOrder.components" :key="component.itemId" class="p-3 border rounded-md mb-3">
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-medium">{{ component.itemName }}</div>
                  <div class="text-xs text-muted-foreground">{{ component.sku }}</div>
                </div>
                <Badge :variant="getMaterialStatusVariant(component.status)">
                  {{ formatMaterialStatus(component.status) }}
                </Badge>
              </div>
              
              <div class="mt-2 grid grid-cols-3 gap-3">
                <div>
                  <Label :for="`required-${index}`">Required</Label>
                  <Input 
                    :id="`required-${index}`" 
                    v-model.number="component.requiredQuantity" 
                    type="number" 
                    min="0" 
                    step="0.01"
                    readonly
                  />
                </div>
                <div>
                  <Label :for="`allocated-${index}`">Allocated</Label>
                  <Input 
                    :id="`allocated-${index}`" 
                    v-model.number="component.allocatedQuantity" 
                    type="number" 
                    min="0" 
                    step="0.01"
                    :max="getMaxAllocation(component)"
                    @input="updateComponentStatus(component)"
                  />
                </div>
                <div>
                  <Label :for="`consumed-${index}`">Consumed</Label>
                  <Input 
                    :id="`consumed-${index}`" 
                    v-model.number="component.consumedQuantity" 
                    type="number" 
                    min="0" 
                    step="0.01"
                    :max="component.allocatedQuantity"
                    @input="updateComponentStatus(component)"
                  />
                </div>
              </div>
              
              <div class="mt-1 text-xs">
                <span class="text-muted-foreground">Unit: {{ component.unitOfMeasure }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SheetFooter>
        <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
        <Button @click="saveWorkOrder" :disabled="!isFormValid">Save Changes</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  LayersIcon,
  Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  workOrderData: {
    type: Object,
    required: true
  },
  inventory: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'save'])

// Deep clone the work order to avoid direct mutation
const workOrder = ref(JSON.parse(JSON.stringify(props.workOrderData)))

// Watch for work order data changes
watch(() => props.workOrderData, (newVal) => {
  if (newVal) {
    workOrder.value = JSON.parse(JSON.stringify(newVal))
    
    // Ensure components array exists
    if (!workOrder.value.components) {
      workOrder.value.components = []
    }
    
    // Ensure numeric values
    workOrder.value.quantity = Number(workOrder.value.quantity) || 0
    workOrder.value.completed = Number(workOrder.value.completed) || 0
    workOrder.value.rejected = Number(workOrder.value.rejected) || 0
    
    // Initialize component quantities if not set
    workOrder.value.components.forEach(component => {
      component.requiredQuantity = Number(component.requiredQuantity) || 0
      component.allocatedQuantity = Number(component.allocatedQuantity) || 0
      component.consumedQuantity = Number(component.consumedQuantity) || 0
    })
  }
}, { deep: true })

// Helper methods
const formatMaterialStatus = (status) => {
  if (!status) return ''
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getMaterialStatusVariant = (status) => {
  switch (status) {
    case 'available': return 'success'
    case 'partial': return 'warning'
    case 'unavailable': return 'destructive'
    default: return 'default'
  }
}

const getProgressPercentage = (workOrder) => {
  if (!workOrder || !workOrder.quantity || workOrder.quantity === 0) return 0
  const completed = workOrder.completed || 0
  return Math.min(100, Math.round((completed / workOrder.quantity) * 100))
}

// Get maximum possible allocation for a component based on inventory
const getMaxAllocation = (component) => {
  const inventoryItem = props.inventory.find(item => item.id === component.itemId)
  const availableInInventory = inventoryItem ? (inventoryItem.stock?.available || 0) : 0
  
  // For existing allocations, allow the current allocation amount plus what's available in inventory
  return component.allocatedQuantity + availableInInventory
}

// Update component status based on allocation and consumption
const updateComponentStatus = (component) => {
  // Ensure numeric values
  component.requiredQuantity = Number(component.requiredQuantity) || 0
  component.allocatedQuantity = Number(component.allocatedQuantity) || 0
  component.consumedQuantity = Number(component.consumedQuantity) || 0
  
  // Validate constraints
  if (component.allocatedQuantity > getMaxAllocation(component)) {
    component.allocatedQuantity = getMaxAllocation(component)
  }
  
  if (component.consumedQuantity > component.allocatedQuantity) {
    component.consumedQuantity = component.allocatedQuantity
  }
  
  // Update status
  if (component.allocatedQuantity >= component.requiredQuantity) {
    component.status = 'available'
  } else if (component.allocatedQuantity > 0) {
    component.status = 'partial'
  } else {
    component.status = 'unavailable'
  }
  
  // Update overall material status
  updateOverallMaterialStatus()
}

// Update the overall material status of the work order
const updateOverallMaterialStatus = () => {
  if (!workOrder.value.components || workOrder.value.components.length === 0) {
    workOrder.value.materialStatus = 'pending'
    return
  }

  const allAvailable = workOrder.value.components.every(item => item.status === 'available')
  const allUnavailable = workOrder.value.components.every(item => item.status === 'unavailable')
  
  if (allAvailable) {
    workOrder.value.materialStatus = 'available'
  } else if (allUnavailable) {
    workOrder.value.materialStatus = 'unavailable'
  } else {
    workOrder.value.materialStatus = 'partial'
  }
}

// Form validation
const isFormValid = computed(() => {
  return workOrder.value.orderNumber &&
         workOrder.value.quantity > 0 &&
         workOrder.value.status &&
         workOrder.value.plannedStartDate &&
         workOrder.value.dueDate &&
         (!workOrder.value.completed || workOrder.value.completed <= workOrder.value.quantity)
})

// Auto-complete the work order if all units are marked as completed
watch(() => workOrder.value.completed, (newVal) => {
  if (newVal === workOrder.value.quantity && workOrder.value.status !== 'completed') {
    workOrder.value.status = 'completed'
  }
})

// Save changes
const saveWorkOrder = () => {
  if (isFormValid.value) {
    // Create history entry for the update
    if (!workOrder.value.history) {
      workOrder.value.history = []
    }
    
    workOrder.value.history.push({
      type: 'updated',
      timestamp: new Date().toISOString(),
      description: 'Work order updated',
      user: 'Current User' // Replace with actual user info
    })
    
    // If status changed, add a status change entry
    if (workOrder.value.status !== props.workOrderData.status) {
      workOrder.value.history.push({
        type: 'status_change',
        timestamp: new Date().toISOString(),
        description: `Status changed from ${props.workOrderData.status} to ${workOrder.value.status}`,
        user: 'Current User' // Replace with actual user info
      })
    }
    
    emit('save', JSON.parse(JSON.stringify(workOrder.value)))
  }
}
</script>