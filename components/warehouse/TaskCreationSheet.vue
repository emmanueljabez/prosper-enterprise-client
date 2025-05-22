<!-- filepath: c:\Users\user\Documents\pcash-inventory\pcash-inventory\components\warehouse\TaskCreationSheet.vue -->
<template>
  <SheetContent class="sm:max-w-[600px]" position="right">
    <SheetHeader>
      <SheetTitle>Create Warehouse Task</SheetTitle>
      <SheetDescription>
        Create a new task for warehouse operations
      </SheetDescription>
    </SheetHeader>

    <div class="py-6 space-y-6">
      <!-- Task Type Selection -->
      <div class="space-y-2">
        <Label class="text-base">Task Type</Label>
        <RadioGroup v-model="formData.taskType" class="grid grid-cols-3 gap-3">
          <div v-for="type in taskTypes" :key="type.value">
            <Label 
              :for="`task-type-${type.value}`" 
              class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <RadioGroupItem 
                :value="type.value" 
                :id="`task-type-${type.value}`" 
                class="sr-only" 
              />
              <div v-if="type.value === 'picking'">
                <PackageSearchIcon class="mb-3 h-6 w-6" />
              </div>
              <div v-else-if="type.value === 'packing'">
                <PackageIcon class="mb-3 h-6 w-6" />
              </div>
              <div v-else-if="type.value === 'inventory'">
                <ClipboardListIcon class="mb-3 h-6 w-6" />
              </div>
              <div v-else-if="type.value === 'replenishment'">
                <PackagePlusIcon class="mb-3 h-6 w-6" />
              </div>
              <div v-else-if="type.value === 'shipping'">
                <TruckIcon class="mb-3 h-6 w-6" />
              </div>
              <div v-else>
                <CircleDotIcon class="mb-3 h-6 w-6" />
              </div>
              <div class="text-sm font-medium">{{ type.label }}</div>
            </Label>
          </div>
        </RadioGroup>
        <p v-if="errors.taskType" class="text-destructive text-sm mt-1">{{ errors.taskType }}</p>
      </div>

      <!-- Dynamic Form Based on Task Type -->
      <div v-if="formData.taskType" class="border-t pt-6">
        <!-- Picking Task Form -->
        <div v-if="formData.taskType === 'picking'" class="space-y-4">
          <h3 class="text-base font-medium">Picking Task Details</h3>
          
          <div class="space-y-2">
            <Label for="orderNumber">Order Number *</Label>
            <div class="flex space-x-2">
              <Input
                id="orderNumber"
                v-model="formData.orderNumber"
                placeholder="Enter order number"
              />
              <Button 
                type="button" 
                variant="outline" 
                @click="lookupOrder"
                :disabled="isOrderLookupLoading"
              >
                <SearchIcon v-if="!isOrderLookupLoading" class="h-4 w-4 mr-2" />
                <Loader2Icon v-else class="h-4 w-4 mr-2 animate-spin" />
                Lookup
              </Button>
            </div>
            <p v-if="errors.orderNumber" class="text-destructive text-sm">{{ errors.orderNumber }}</p>
          </div>

          <div v-if="orderDetails" class="p-3 border rounded-md bg-muted/30 space-y-2">
            <div class="flex justify-between items-start">
              <div>
                <div class="font-medium">Order #{{ orderDetails.orderNumber }}</div>
                <div class="text-sm text-muted-foreground">{{ orderDetails.customerName }}</div>
              </div>
              <Badge :variant="getOrderStatusVariant(orderDetails.status)">
                {{ orderDetails.status }}
              </Badge>
            </div>
            <div class="text-sm">
              <span class="text-muted-foreground">Items:</span> {{ orderDetails.items.length }}
            </div>
            <div v-if="orderDetails.status !== 'pending'" class="text-amber-600 text-sm flex items-center">
              <AlertTriangleIcon class="h-4 w-4 mr-1" />
              This order is already {{ orderDetails.status.toLowerCase() }}
            </div>
          </div>

          <div class="space-y-2">
            <Label for="pickingPriority">Priority</Label>
            <Select v-model="formData.priority">
              <SelectTrigger id="pickingPriority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="pickingDeadline">Deadline</Label>
            <Input
              id="pickingDeadline"
              v-model="formData.deadline"
              type="datetime-local"
            />
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>Items to Pick</Label>
              <Badge variant="outline">{{ orderItems.length }} items</Badge>
            </div>
            <div v-if="orderItems.length === 0" class="p-4 text-center border rounded-md">
              <PackageXIcon class="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p class="text-sm text-muted-foreground">No items available</p>
              <p class="text-xs text-muted-foreground">Please enter a valid order number</p>
            </div>
            <div v-else class="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-12">
                      <Checkbox
                        id="selectAll"
                        :checked="isAllSelected"
                        @update:checked="toggleSelectAll"
                      />
                    </TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(item, index) in orderItems" :key="item.id">
                    <TableCell>
                      <Checkbox
                        :id="`item-${item.id}`"
                        v-model:checked="item.selected"
                      />
                    </TableCell>
                    <TableCell>
                      <Label :for="`item-${item.id}`" class="cursor-pointer">
                        {{ item.name }}
                      </Label>
                    </TableCell>
                    <TableCell>{{ item.sku }}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        v-model="item.quantity"
                        class="w-20"
                        min="1"
                        :max="item.availableQuantity"
                        :disabled="!item.selected"
                      />
                    </TableCell>
                    <TableCell>{{ item.location || 'Unknown' }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <p v-if="errors.items" class="text-destructive text-sm">{{ errors.items }}</p>
          </div>

          <div class="space-y-2">
            <Label for="pickingNotes">Notes (Optional)</Label>
            <Textarea
              id="pickingNotes"
              v-model="formData.notes"
              placeholder="Add any notes or special instructions..."
              :rows="3"
            />
          </div>
        </div>

        <!-- Packing Task Form -->
        <div v-if="formData.taskType === 'packing'" class="space-y-4">
          <h3 class="text-base font-medium">Packing Task Details</h3>
          
          <div class="space-y-2">
            <Label for="packingOrderNumber">Order Number *</Label>
            <div class="flex space-x-2">
              <Input
                id="packingOrderNumber"
                v-model="formData.orderNumber"
                placeholder="Enter order number"
              />
              <Button 
                type="button" 
                variant="outline" 
                @click="lookupOrder"
                :disabled="isOrderLookupLoading"
              >
                <SearchIcon v-if="!isOrderLookupLoading" class="h-4 w-4 mr-2" />
                <Loader2Icon v-else class="h-4 w-4 mr-2 animate-spin" />
                Lookup
              </Button>
            </div>
            <p v-if="errors.orderNumber" class="text-destructive text-sm">{{ errors.orderNumber }}</p>
          </div>
          
          <div v-if="orderDetails" class="p-3 border rounded-md bg-muted/30 space-y-2">
            <div class="flex justify-between items-start">
              <div>
                <div class="font-medium">Order #{{ orderDetails.orderNumber }}</div>
                <div class="text-sm text-muted-foreground">{{ orderDetails.customerName }}</div>
              </div>
              <Badge :variant="getOrderStatusVariant(orderDetails.status)">
                {{ orderDetails.status }}
              </Badge>
            </div>
            <div class="text-sm">
              <span class="text-muted-foreground">Items:</span> {{ orderDetails.items.length }}
            </div>
            <div v-if="!orderDetails.isPicked" class="text-amber-600 text-sm flex items-center">
              <AlertTriangleIcon class="h-4 w-4 mr-1" />
              This order has not been picked yet
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="packingPriority">Priority</Label>
            <Select v-model="formData.priority">
              <SelectTrigger id="packingPriority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="shippingMethod">Shipping Method</Label>
            <Select v-model="formData.shippingMethod">
              <SelectTrigger id="shippingMethod">
                <SelectValue placeholder="Select shipping method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="economy">Economy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="packingStation">Packing Station (Optional)</Label>
            <Select v-model="formData.stationId">
              <SelectTrigger id="packingStation">
                <SelectValue placeholder="Assign to station" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                <SelectItem v-for="station in packingStations" :key="station.id" :value="station.id">
                  {{ station.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="packingNotes">Notes (Optional)</Label>
            <Textarea
              id="packingNotes"
              v-model="formData.notes"
              placeholder="Add any notes or special instructions..."
              :rows="3"
            />
          </div>
        </div>

        <!-- Inventory Task Form -->
        <div v-if="formData.taskType === 'inventory'" class="space-y-4">
          <h3 class="text-base font-medium">Inventory Task Details</h3>
          
          <div class="space-y-2">
            <Label for="inventoryType">Inventory Type *</Label>
            <Select v-model="formData.inventoryType">
              <SelectTrigger id="inventoryType">
                <SelectValue placeholder="Select inventory task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cycle_count">Cycle Count</SelectItem>
                <SelectItem value="full_count">Full Inventory Count</SelectItem>
                <SelectItem value="discrepancy">Discrepancy Resolution</SelectItem>
                <SelectItem value="audit">Inventory Audit</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.inventoryType" class="text-destructive text-sm">{{ errors.inventoryType }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="inventoryLocation">Location</Label>
            <Select v-model="formData.location">
              <SelectTrigger id="inventoryLocation">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Entire Warehouse</SelectItem>
                <SelectItem value="a1">Zone A1</SelectItem>
                <SelectItem value="a2">Zone A2</SelectItem>
                <SelectItem value="b1">Zone B1</SelectItem>
                <SelectItem value="b2">Zone B2</SelectItem>
                <SelectItem value="c1">Zone C1</SelectItem>
                <SelectItem value="c2">Zone C2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="inventoryDeadline">Due Date</Label>
            <Input
              id="inventoryDeadline"
              v-model="formData.deadline"
              type="date"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="inventoryAssignee">Assign To (Optional)</Label>
            <Select v-model="formData.assigneeId">
              <SelectTrigger id="inventoryAssignee">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                <SelectItem v-for="user in warehouseStaff" :key="user.id" :value="user.id">
                  {{ user.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="inventoryNotes">Instructions (Optional)</Label>
            <Textarea
              id="inventoryNotes"
              v-model="formData.notes"
              placeholder="Add any notes or special instructions..."
              :rows="3"
            />
          </div>
        </div>
        
        <!-- Replenishment Task Form -->
        <div v-if="formData.taskType === 'replenishment'" class="space-y-4">
          <h3 class="text-base font-medium">Replenishment Task Details</h3>
          
          <div class="space-y-2">
            <Label for="replenishmentMethod">Replenishment Method</Label>
            <Select v-model="formData.replenishmentMethod">
              <SelectTrigger id="replenishmentMethod">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="min_level">Minimum Level Triggered</SelectItem>
                <SelectItem value="scheduled">Scheduled Replenishment</SelectItem>
                <SelectItem value="demand">Demand-Based</SelectItem>
                <SelectItem value="manual">Manual Request</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>Items to Replenish</Label>
              <Button variant="outline" size="sm" @click="addReplenishmentItem">
                <PlusIcon class="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            
            <div v-if="formData.replenishmentItems.length === 0" class="p-4 text-center border rounded-md">
              <PackagePlusIcon class="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p class="text-sm text-muted-foreground">No items added</p>
              <p class="text-xs text-muted-foreground">Click "Add Item" to add items for replenishment</p>
            </div>
            
            <div v-else class="space-y-3">
              <div 
                v-for="(item, index) in formData.replenishmentItems" 
                :key="index"
                class="flex items-start space-x-2 p-3 border rounded-md"
              >
                <div class="flex-1 grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <Label :for="`item-sku-${index}`" class="text-xs">SKU/Product</Label>
                    <Input
                      :id="`item-sku-${index}`"
                      v-model="item.sku"
                      placeholder="Enter SKU"
                    />
                  </div>
                  <div class="space-y-1">
                    <Label :for="`item-qty-${index}`" class="text-xs">Quantity</Label>
                    <Input
                      :id="`item-qty-${index}`"
                      v-model="item.quantity"
                      type="number"
                      min="1"
                    />
                  </div>
                  <div class="space-y-1">
                    <Label :for="`item-source-${index}`" class="text-xs">Source Location</Label>
                    <Input
                      :id="`item-source-${index}`"
                      v-model="item.sourceLocation"
                      placeholder="e.g. Bulk Storage"
                    />
                  </div>
                  <div class="space-y-1">
                    <Label :for="`item-dest-${index}`" class="text-xs">Destination</Label>
                    <Input
                      :id="`item-dest-${index}`"
                      v-model="item.destinationLocation"
                      placeholder="e.g. Picking Zone A1"
                    />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  @click="removeReplenishmentItem(index)"
                >
                  <XIcon class="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p v-if="errors.replenishmentItems" class="text-destructive text-sm">{{ errors.replenishmentItems }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="replenishmentPriority">Priority</Label>
            <Select v-model="formData.priority">
              <SelectTrigger id="replenishmentPriority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="replenishmentDeadline">Deadline</Label>
            <Input
              id="replenishmentDeadline"
              v-model="formData.deadline"
              type="datetime-local"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="replenishmentNotes">Notes (Optional)</Label>
            <Textarea
              id="replenishmentNotes"
              v-model="formData.notes"
              placeholder="Add any notes or special instructions..."
              :rows="3"
            />
          </div>
        </div>
        
        <!-- Shipping Task Form -->
        <div v-if="formData.taskType === 'shipping'" class="space-y-4">
          <h3 class="text-base font-medium">Shipping Task Details</h3>
          
          <div class="space-y-2">
            <Label for="shipmentType">Shipment Type *</Label>
            <Select v-model="formData.shipmentType">
              <SelectTrigger id="shipmentType">
                <SelectValue placeholder="Select shipment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outbound">Outbound Orders</SelectItem>
                <SelectItem value="return">Return Processing</SelectItem>
                <SelectItem value="transfer">Warehouse Transfer</SelectItem>
                <SelectItem value="special">Special Shipment</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.shipmentType" class="text-destructive text-sm">{{ errors.shipmentType }}</p>
          </div>
          
          <div class="space-y-2">
            <Label>Orders to Ship</Label>
            <div class="flex flex-col space-y-2">
              <div class="flex items-start space-x-2">
                <Input
                  v-model="newOrderNumber"
                  placeholder="Enter order number"
                  class="flex-1"
                />
                <Button 
                  variant="outline" 
                  @click="addOrderToShipment"
                >
                  Add
                </Button>
              </div>
              
              <div v-if="formData.orderNumbers.length === 0" class="p-4 text-center border rounded-md">
                <TruckIcon class="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p class="text-sm text-muted-foreground">No orders added to shipment</p>
                <p class="text-xs text-muted-foreground">Add at least one order number</p>
              </div>
              
              <div v-else class="border rounded-md">
                <div 
                  v-for="(orderNum, index) in formData.orderNumbers" 
                  :key="index"
                  class="flex items-center justify-between p-3 border-b last:border-0"
                >
                  <div class="font-medium">Order #{{ orderNum }}</div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    @click="removeOrderFromShipment(index)"
                  >
                    <XIcon class="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p v-if="errors.orderNumbers" class="text-destructive text-sm">{{ errors.orderNumbers }}</p>
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="carrier">Carrier</Label>
            <Select v-model="formData.carrier">
              <SelectTrigger id="carrier">
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ups">UPS</SelectItem>
                <SelectItem value="fedex">FedEx</SelectItem>
                <SelectItem value="usps">USPS</SelectItem>
                <SelectItem value="dhl">DHL</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="shippingPriority">Priority</Label>
            <Select v-model="formData.priority">
              <SelectTrigger id="shippingPriority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="shippingDeadline">Ship By Date</Label>
            <Input
              id="shippingDeadline"
              v-model="formData.deadline"
              type="date"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="shippingNotes">Special Instructions (Optional)</Label>
            <Textarea
              id="shippingNotes"
              v-model="formData.notes"
              placeholder="Add any notes or special instructions..."
              :rows="3"
            />
          </div>
        </div>
      </div>
    </div>

    <SheetFooter class="pt-2">
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        variant="default" 
        @click="createTask" 
        :disabled="isSubmitting || !formData.taskType"
      >
        <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        <PlusIcon v-else class="h-4 w-4 mr-2" />
        {{ isSubmitting ? 'Creating...' : 'Create Task' }}
      </Button>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  AlertTriangleIcon,
  CircleDotIcon,
  ClipboardListIcon,
  Loader2Icon,
  PackageIcon,
  PackagePlusIcon,
  PackageSearchIcon,
  PackageXIcon,
  PlusIcon,
  SearchIcon,
  TruckIcon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'

const props = defineProps({
  packingStations: {
    type: Array,
    default: () => []
  },
  warehouseStaff: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'task-created'])

// Available task types
const taskTypes = [
  { value: 'picking', label: 'Picking' },
  { value: 'packing', label: 'Packing' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'replenishment', label: 'Replenishment' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'other', label: 'Other' }
]

// Form data
const formData = reactive({
  taskType: '',
  
  // Common fields
  priority: 'normal',
  deadline: '',
  notes: '',
  
  // Picking & Packing
  orderNumber: '',
  
  // Inventory
  inventoryType: '',
  location: '',
  assigneeId: '',
  
  // Replenishment
  replenishmentMethod: 'min_level',
  replenishmentItems: [],
  
  // Shipping
  shipmentType: '',
  carrier: '',
  orderNumbers: [],
  
  // Packing specific
  shippingMethod: 'standard',
  stationId: ''
})

// State management
const isOrderLookupLoading = ref(false)
const isSubmitting = ref(false)
const orderDetails = ref(null)
const orderItems = ref([])
const newOrderNumber = ref('')
const errors = reactive({
  taskType: '',
  orderNumber: '',
  items: '',
  inventoryType: '',
  shipmentType: '',
  replenishmentItems: '',
  orderNumbers: ''
})

// Computed properties
const isAllSelected = computed(() => {
  return orderItems.value.length > 0 && orderItems.value.every(item => item.selected)
})

// Methods
function toggleSelectAll(value) {
  orderItems.value.forEach(item => {
    item.selected = value
  })
}

async function lookupOrder() {
  if (!formData.orderNumber) {
    errors.orderNumber = 'Please enter an order number'
    return
  }
  
  errors.orderNumber = ''
  isOrderLookupLoading.value = true
  
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Simulate order data
    orderDetails.value = {
      orderNumber: formData.orderNumber,
      customerName: 'John Doe',
      status: 'pending',
      isPicked: false,
      items: [
        { id: 1, name: 'T-Shirt', sku: 'TS-001', quantity: 2, availableQuantity: 10, location: 'A1-B2' },
        { id: 2, name: 'Jeans', sku: 'JN-002', quantity: 1, availableQuantity: 5, location: 'A2-C3' },
        { id: 3, name: 'Hat', sku: 'HT-003', quantity: 3, availableQuantity: 15, location: 'B1-D4' }
      ]
    }
    
    // Prepare items for the form
    orderItems.value = orderDetails.value.items.map(item => ({
      ...item,
      selected: true
    }))
  } catch (error) {
    console.error('Error looking up order:', error)
  } finally {
    isOrderLookupLoading.value = false
  }
}

function addReplenishmentItem() {
  formData.replenishmentItems.push({
    sku: '',
    quantity: 1,
    sourceLocation: '',
    destinationLocation: ''
  })
}

function removeReplenishmentItem(index) {
  formData.replenishmentItems.splice(index, 1)
}

function addOrderToShipment() {
  if (newOrderNumber.value && !formData.orderNumbers.includes(newOrderNumber.value)) {
    formData.orderNumbers.push(newOrderNumber.value)
    newOrderNumber.value = ''
  }
}

function removeOrderFromShipment(index) {
  formData.orderNumbers.splice(index, 1)
}

function getOrderStatusVariant(status) {
  switch (status) {
    case 'pending': return 'secondary'
    case 'processing': return 'default'
    case 'shipped': return 'success'
    case 'cancelled': return 'destructive'
    default: return 'outline'
  }
}

function validateForm() {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  // Validate task type
  if (!formData.taskType) {
    errors.taskType = 'Please select a task type'
    isValid = false
  }
  
  // Task type specific validation
  if (formData.taskType === 'picking' || formData.taskType === 'packing') {
    if (!formData.orderNumber) {
      errors.orderNumber = 'Please enter an order number'
      isValid = false
    }
    
    if (formData.taskType === 'picking' && orderItems.value.length > 0) {
      if (!orderItems.value.some(item => item.selected)) {
        errors.items = 'Please select at least one item to pick'
        isValid = false
      }
    }
  }
  
  if (formData.taskType === 'inventory' && !formData.inventoryType) {
    errors.inventoryType = 'Please select an inventory task type'
    isValid = false
  }
  
  if (formData.taskType === 'replenishment' && formData.replenishmentItems.length === 0) {
    errors.replenishmentItems = 'Please add at least one item to replenish'
    isValid = false
  }
  
  if (formData.taskType === 'shipping') {
    if (!formData.shipmentType) {
      errors.shipmentType = 'Please select a shipment type'
      isValid = false
    }
    
    if (formData.orderNumbers.length === 0) {
      errors.orderNumbers = 'Please add at least one order to ship'
      isValid = false
    }
  }
  
  return isValid
}

async function createTask() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Prepare task data based on type
    let taskData = {
      id: `task-${Date.now()}`,
      type: formData.taskType,
      priority: formData.priority,
      deadline: formData.deadline,
      notes: formData.notes,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    switch (formData.taskType) {
      case 'picking':
        taskData = {
          ...taskData,
          orderNumber: formData.orderNumber,
          items: orderItems.value
            .filter(item => item.selected)
            .map(item => ({
              id: item.id,
              name: item.name,
              sku: item.sku,
              quantity: parseInt(item.quantity),
              location: item.location
            }))
        }
        break
        
      case 'packing':
        taskData = {
          ...taskData,
          orderNumber: formData.orderNumber,
          shippingMethod: formData.shippingMethod,
          assignedStation: formData.stationId || null
        }
        break
        
      case 'inventory':
        taskData = {
          ...taskData,
          inventoryType: formData.inventoryType,
          location: formData.location,
          assigneeId: formData.assigneeId || null
        }
        break
        
      case 'replenishment':
        taskData = {
          ...taskData,
          replenishmentMethod: formData.replenishmentMethod,
          items: formData.replenishmentItems.map(item => ({
            sku: item.sku,
            quantity: parseInt(item.quantity),
            sourceLocation: item.sourceLocation,
            destinationLocation: item.destinationLocation
          }))
        }
        break
        
      case 'shipping':
        taskData = {
          ...taskData,
          shipmentType: formData.shipmentType,
          carrier: formData.carrier,
          orderNumbers: [...formData.orderNumbers]
        }
        break
    }
    
    // Emit the created task
    emit('task-created', taskData)
  } catch (error) {
    console.error('Error creating task:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>