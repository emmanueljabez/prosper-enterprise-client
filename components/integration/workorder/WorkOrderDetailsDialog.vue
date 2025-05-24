<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <ClipboardIcon class="h-5 w-5" />
          {{ workOrder?.orderNumber || 'Work Order Details' }}
          <Badge :variant="getStatusVariant(workOrder?.status)">
            {{ formatStatus(workOrder?.status) }}
          </Badge>
        </DialogTitle>
        <DialogDescription>
          Last updated: {{ formatDate(workOrder?.updatedAt) }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="loading" class="py-6 flex justify-center items-center">
        <Loader2Icon class="h-8 w-8 animate-spin text-primary" />
      </div>

      <div v-else-if="!workOrder" class="py-6 text-center">
        <div class="text-muted-foreground">No work order data available</div>
      </div>

      <div v-else class="space-y-6">
        <!-- Summary Card -->
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div class="rounded-lg border p-3">
            <div class="text-xs font-medium text-muted-foreground">Quantity</div>
            <div class="mt-1 flex items-center gap-1">
              <div class="text-2xl font-bold">{{ workOrder.completed || 0 }}/{{ workOrder.quantity }}</div>
              <Badge v-if="workOrder.rejected > 0" variant="destructive" class="ml-1">
                {{ workOrder.rejected }} rejected
              </Badge>
            </div>
            <div class="mt-1 text-xs text-muted-foreground">
              {{ getProgressPercentage(workOrder) }}% complete
            </div>
          </div>
          
          <div class="rounded-lg border p-3">
            <div class="text-xs font-medium text-muted-foreground">Priority</div>
            <div class="mt-1 flex items-center">
              <Badge :variant="getPriorityVariant(workOrder.priority)">
                {{ formatPriority(workOrder.priority) }}
              </Badge>
            </div>
            <div class="mt-1 text-xs text-muted-foreground">Assigned to: {{ workOrder.assignedTo || 'Unassigned' }}</div>
          </div>
          
          <div class="rounded-lg border p-3">
            <div class="text-xs font-medium text-muted-foreground">Materials</div>
            <div class="mt-1 flex items-center">
              <Badge :variant="getMaterialStatusVariant(workOrder.materialStatus)">
                {{ formatMaterialStatus(workOrder.materialStatus) }}
              </Badge>
            </div>
            <div class="mt-1 text-xs text-muted-foreground">
              {{ workOrder.components?.length || 0 }} components
            </div>
          </div>
          
          <div class="rounded-lg border p-3">
            <div class="text-xs font-medium text-muted-foreground">Timeline</div>
            <div class="mt-1 flex items-center">
              <CalendarIcon class="h-4 w-4 mr-1" :class="{'text-destructive': isOverdue(workOrder)}" />
              <div :class="{'text-destructive': isOverdue(workOrder)}">
                {{ formatDate(workOrder.dueDate) }}
              </div>
            </div>
            <div class="mt-1 text-xs text-muted-foreground">
              Started: {{ formatDate(workOrder.plannedStartDate) }}
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
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

        <Separator />

        <!-- Product & BOM Information -->
        <div>
          <h3 class="text-lg font-medium mb-2">Product & BOM Information</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Product</Label>
              <div class="flex items-center gap-2 mt-1">
                <div class="h-8 w-8 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                  <PackageIcon class="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div>{{ workOrder.productName }}</div>
                  <div class="text-xs text-muted-foreground">{{ workOrder.productSku }}</div>
                </div>
              </div>
            </div>
            <div>
              <Label>BOM</Label>
              <div class="flex items-center gap-2 mt-1">
                <div class="h-8 w-8 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                  <LayersIcon class="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div>{{ workOrder.bomName }}</div>
                  <div class="text-xs text-muted-foreground">Version {{ workOrder.bomVersion }}</div>
                </div>
              </div>
            </div>
            <div class="col-span-2">
              <Label>Notes</Label>
              <div class="mt-1 p-3 border rounded-md text-sm whitespace-pre-line">
                {{ workOrder.notes || 'No notes provided' }}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <!-- Materials -->
        <div>
          <h3 class="text-lg font-medium mb-2 flex items-center justify-between">
            <span>Materials</span>
            <Button v-if="workOrder.components?.length > 0" variant="outline" size="sm" @click="expandedSections.materials = !expandedSections.materials">
              {{ expandedSections.materials ? 'Collapse' : 'Expand' }}
            </Button>
          </h3>
          
          <div v-if="!workOrder.components || workOrder.components.length === 0" class="text-center p-4 border rounded-md bg-muted/30">
            <LayersIcon class="h-8 w-8 mx-auto text-muted-foreground" />
            <p class="mt-2 text-sm text-muted-foreground">No component information available</p>
          </div>
          
          <div v-else-if="!expandedSections.materials" class="text-center p-4 border rounded-md">
            <p>This work order requires {{ workOrder.components.length }} components</p>
            <Button variant="link" @click="expandedSections.materials = true">Click to view</Button>
          </div>
          
          <div v-else class="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Allocated</TableHead>
                  <TableHead>Consumed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="component in workOrder.components" :key="component.itemId">
                  <TableCell>
                    <div class="font-medium">{{ component.itemName }}</div>
                    <div class="text-xs text-muted-foreground">{{ component.sku }}</div>
                  </TableCell>
                  <TableCell>{{ component.requiredQuantity }} {{ component.unitOfMeasure }}</TableCell>
                  <TableCell>{{ component.allocatedQuantity }} {{ component.unitOfMeasure }}</TableCell>
                  <TableCell>{{ component.consumedQuantity || 0 }} {{ component.unitOfMeasure }}</TableCell>
                  <TableCell>
                    <Badge :variant="getMaterialStatusVariant(component.status)">
                      {{ formatMaterialStatus(component.status) }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <Separator />

        <!-- Work Order History -->
        <div>
          <h3 class="text-lg font-medium mb-2">Work Order History</h3>
          
          <div v-if="!workOrder.history || workOrder.history.length === 0" class="text-center p-4 border rounded-md bg-muted/30">
            <HistoryIcon class="h-8 w-8 mx-auto text-muted-foreground" />
            <p class="mt-2 text-sm text-muted-foreground">No history records available</p>
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="(entry, index) in workOrder.history" :key="index" class="flex items-start gap-3 p-3 border rounded-md">
              <div class="mt-0.5 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <component :is="getHistoryIcon(entry.type)" class="h-4 w-4 text-primary" />
              </div>
              <div class="flex-1">
                <div class="text-sm font-medium">{{ entry.description }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ formatDate(entry.timestamp, true) }} by {{ entry.user || 'System' }}
                </div>
                <div v-if="entry.details" class="mt-1 text-sm">
                  {{ entry.details }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <div class="flex space-x-2">
          <Button variant="outline" @click="$emit('update:open', false)">Close</Button>
          <Button variant="outline" @click="$emit('edit', workOrder)">
            <PencilIcon class="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            v-if="workOrder?.status !== 'completed' && workOrder?.status !== 'cancelled'"
            variant="default" 
            @click="$emit('update-status', workOrder)"
          >
            <CheckCircleIcon class="h-4 w-4 mr-1" />
            Update Status
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { 
  ClipboardIcon, 
  LayersIcon,
  CalendarIcon,
  PackageIcon,
  Loader2Icon,
  PencilIcon,
  CheckCircleIcon,
  HistoryIcon,
  UserIcon,
  AlertTriangleIcon,
  CheckIcon,
  ArrowRightIcon,
  PauseIcon,
  XIcon
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  workOrderId: {
    type: String,
    default: null
  },
  workOrderData: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'edit', 'update-status'])

// State
const workOrder = ref(null)
const expandedSections = ref({
  materials: true
})

// Watch for work order data changes
watch(() => props.workOrderData, (newVal) => {
  if (newVal) {
    workOrder.value = { ...newVal }
  }
}, { immediate: true })

// Helper methods
const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return null
  const date = new Date(dateString)
  if (includeTime) {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date)
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

const getPriorityVariant = (priority) => {
  switch (priority) {
    case 'low': return 'secondary'
    case 'medium': return 'default'
    case 'high': return 'warning'
    case 'urgent': return 'destructive'
    default: return 'default'
  }
}

const getMaterialStatusVariant = (status) => {
  switch (status) {
    case 'available': return 'success'
    case 'partial': return 'warning'
    case 'unavailable': return 'destructive'
    default: return 'default'
  }
}

const formatStatus = (status) => {
  if (!status) return ''
  if (status === 'in_progress') return 'In Progress'
  if (status === 'on_hold') return 'On Hold'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatPriority = (priority) => {
  if (!priority) return ''
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

const formatMaterialStatus = (status) => {
  if (!status) return ''
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getProgressPercentage = (workOrder) => {
  if (!workOrder || !workOrder.quantity || workOrder.quantity === 0) return 0
  const completed = workOrder.completed || 0
  return Math.min(100, Math.round((completed / workOrder.quantity) * 100))
}

const isOverdue = (workOrder) => {
  if (!workOrder || !workOrder.dueDate || workOrder.status === 'completed' || workOrder.status === 'cancelled') return false
  return new Date(workOrder.dueDate) < new Date()
}

const getHistoryIcon = (type) => {
  switch (type) {
    case 'created': return ClipboardIcon
    case 'updated': return PencilIcon
    case 'status_change': return ArrowRightIcon
    case 'started': return PlayIcon
    case 'paused': return PauseIcon
    case 'completed': return CheckIcon
    case 'cancelled': return XIcon
    case 'user_assignment': return UserIcon
    case 'issue': return AlertTriangleIcon
    default: return HistoryIcon
  }
}
</script>