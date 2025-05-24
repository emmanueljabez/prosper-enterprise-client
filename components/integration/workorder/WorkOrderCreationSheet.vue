<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent class="sm:max-w-[600px] overflow-y-auto" position="right">
      <SheetHeader>
        <SheetTitle>Create Work Order</SheetTitle>
        <SheetDescription>
          Create a new manufacturing work order based on the selected BOM.
        </SheetDescription>
      </SheetHeader>

      <div v-if="loading" class="flex items-center justify-center my-12">
        <Loader2Icon class="h-8 w-8 animate-spin text-primary" />
      </div>

      <div v-else class="py-6 space-y-6">
        <!-- BOM Information Section -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">BOM Information</h3>
          <div class="border rounded-md p-4">
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0 h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                <LayersIcon class="h-5 w-5 text-primary" />
              </div>
              <div>
                <div class="font-medium">{{ bom?.name }}</div>
                <div class="text-sm text-muted-foreground">Version {{ bom?.version }}</div>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-y-2 text-sm">
              <div>
                <span class="font-medium">Product:</span> {{ bom?.productName }}
              </div>
              <div>
                <span class="font-medium">Status:</span> {{ formatStatus(bom?.status) }}
              </div>
              <div>
                <span class="font-medium">Components:</span> {{ bom?.components?.length || 0 }}
              </div>
              <div>
                <span class="font-medium">Batch Size:</span> {{ bom?.batchSize || 1 }}
              </div>
            </div>
          </div>
        </div>

        <!-- Work Order Details -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">Work Order Details</h3>
          
          <div class="space-y-4">
            <div>
              <Label for="orderNumber">Order Number</Label>
              <Input id="orderNumber" v-model="workOrder.orderNumber" placeholder="Enter order number" />
              <p v-if="!workOrder.orderNumber" class="text-xs text-muted-foreground mt-1">
                Leave blank to auto-generate
              </p>
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
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label for="assignedTo">Assigned To</Label>
              <Input id="assignedTo" v-model="workOrder.assignedTo" placeholder="Enter name or employee ID" />
            </div>
            
            <div>
              <Label for="notes">Notes</Label>
              <Textarea id="notes" v-model="workOrder.notes" placeholder="Additional instructions or notes" />
            </div>
          </div>
        </div>

        <!-- Material Requirements -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">Material Requirements</h3>
          
          <div v-if="!bom || !bom.components || bom.components.length === 0" class="text-center p-4 border rounded-md bg-muted/30">
            <LayersIcon class="h-8 w-8 mx-auto text-muted-foreground" />
            <p class="mt-2 text-sm text-muted-foreground">No components in this BOM</p>
          </div>
          
          <div v-else class="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="component in materialRequirements" :key="component.itemId">
                  <TableCell>
                    <div class="font-medium">{{ component.itemName }}</div>
                    <div class="text-xs text-muted-foreground">{{ component.sku }}</div>
                  </TableCell>
                  <TableCell>{{ component.requiredQuantity }} {{ component.unitOfMeasure }}</TableCell>
                  <TableCell>{{ component.availableQuantity }} {{ component.unitOfMeasure }}</TableCell>
                  <TableCell>
                    <Badge :variant="getMaterialStatusVariant(component.status)">
                      {{ formatMaterialStatus(component.status) }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div v-if="hasShortages" class="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
            <div class="flex items-center gap-2">
              <AlertTriangleIcon class="h-4 w-4" />
              <span class="font-medium">Material Shortages</span>
            </div>
            <p class="mt-1 text-sm">Some required materials are not available in sufficient quantities.</p>
          </div>
        </div>
      </div>

      <SheetFooter>
        <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
        <Button @click="createWorkOrder" :disabled="!isFormValid">Create Work Order</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { 
  LayersIcon,
  Loader2Icon,
  AlertTriangleIcon
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  bom: {
    type: Object,
    default: null
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

const emit = defineEmits(['update:open', 'create'])

// Initialize today's date and tomorrow's date
const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

// Form data
const workOrder = ref({
  orderNumber: '',
  bomId: props.bom?.id,
  bomName: props.bom?.name,
  bomVersion: props.bom?.version,
  productId: props.bom?.productId,
  productName: props.bom?.productName,
  productSku: props.bom?.productSku,
  quantity: props.bom?.batchSize || 1,
  status: 'planned',
  priority: 'medium',
  plannedStartDate: today,
  dueDate: tomorrow,
  assignedTo: '',
  notes: '',
  materialStatus: 'pending',
  completed: 0,
  rejected: 0
})

// Update workOrder when bom changes
watch(() => props.bom, (newBom) => {
  if (newBom) {
    workOrder.value.bomId = newBom.id
    workOrder.value.bomName = newBom.name
    workOrder.value.bomVersion = newBom.version
    workOrder.value.productId = newBom.productId
    workOrder.value.productName = newBom.productName
    workOrder.value.productSku = newBom.productSku
    workOrder.value.quantity = newBom.batchSize || 1
  }
}, { immediate: true })

// Calculate material requirements
const materialRequirements = computed(() => {
  if (!props.bom || !props.bom.components || !props.inventory) {
    return []
  }

  return props.bom.components.map(component => {
    // Find inventory item
    const inventoryItem = props.inventory.find(item => item.id === component.itemId)
    const availableQuantity = inventoryItem ? (inventoryItem.stock?.available || 0) : 0
    const requiredQuantity = component.quantity * workOrder.value.quantity
    
    // Determine status
    let status = 'unavailable'
    if (availableQuantity >= requiredQuantity) {
      status = 'available'
    } else if (availableQuantity > 0) {
      status = 'partial'
    }

    return {
      ...component,
      requiredQuantity,
      availableQuantity,
      status
    }
  })
})

// Check if there are any material shortages
const hasShortages = computed(() => {
  return materialRequirements.value.some(item => item.status !== 'available')
})

// Determine overall material status
watch(materialRequirements, (newRequirements) => {
  if (!newRequirements || newRequirements.length === 0) {
    workOrder.value.materialStatus = 'pending'
    return
  }

  const allAvailable = newRequirements.every(item => item.status === 'available')
  const allUnavailable = newRequirements.every(item => item.status === 'unavailable')
  
  if (allAvailable) {
    workOrder.value.materialStatus = 'available'
  } else if (allUnavailable) {
    workOrder.value.materialStatus = 'unavailable'
  } else {
    workOrder.value.materialStatus = 'partial'
  }
}, { immediate: true })

// Helper methods
const formatStatus = (status) => {
  if (!status) return ''
  if (status === 'in_progress') return 'In Progress'
  if (status === 'on_hold') return 'On Hold'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

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

// Validation
const isFormValid = computed(() => {
  return workOrder.value.quantity > 0 &&
         workOrder.value.status &&
         workOrder.value.plannedStartDate &&
         workOrder.value.dueDate
})

// Submit the form
const createWorkOrder = () => {
  if (isFormValid.value) {
    // Generate order number if not provided
    if (!workOrder.value.orderNumber) {
      const timestamp = new Date().getTime().toString().slice(-6)
      workOrder.value.orderNumber = `WO-${timestamp}`
    }
    
    // Add component allocations
    workOrder.value.components = materialRequirements.value.map(component => ({
      itemId: component.itemId,
      itemName: component.itemName,
      sku: component.sku,
      unitOfMeasure: component.unitOfMeasure,
      requiredQuantity: component.requiredQuantity,
      allocatedQuantity: Math.min(component.requiredQuantity, component.availableQuantity),
      consumedQuantity: 0,
      status: component.status
    }))
    
    emit('create', { ...workOrder.value })
    emit('update:open', false)
  }
}
</script>