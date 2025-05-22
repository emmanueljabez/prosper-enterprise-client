<template>
  <SheetContent side="right" class="w-full sm:max-w-xl lg:max-w-2xl flex flex-col h-full overflow-hidden">
    <SheetHeader>
      <SheetTitle>{{ getTransferTypeTitle }}</SheetTitle>
      <SheetDescription>
        {{ getTransferTypeDescription }}
      </SheetDescription>
    </SheetHeader>
    
    <div class="flex-1 overflow-y-auto mt-5">
      <!-- Steps indicator -->
      <div class="mb-8">
        <div class="flex justify-between">
          <div 
            v-for="(step, index) in steps" 
            :key="index" 
            class="flex flex-col items-center"
            :class="{ 
              'text-primary font-medium': currentStep === index,
              'text-muted-foreground': currentStep !== index
            }"
          >
            <div 
              class="h-8 w-8 rounded-full flex items-center justify-center border mb-1"
              :class="{
                'bg-primary text-white border-primary': currentStep > index,
                'bg-primary/10 border-primary text-primary': currentStep === index,
                'bg-muted border-muted-foreground/20': currentStep < index
              }"
            >
              <CheckIcon v-if="currentStep > index" class="h-4 w-4" />
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="text-xs">{{ step.title }}</div>
          </div>
        </div>
        
        <!-- Progress line between steps -->
        <div class="relative mt-2">
          <div class="absolute top-0 left-0 right-0 h-1 bg-muted"></div>
          <div 
            class="absolute top-0 left-0 h-1 bg-primary transition-all"
            :style="`width: ${((currentStep) / (steps.length - 1)) * 100}%`"
          ></div>
        </div>
      </div>
      
      <!-- Step content -->
      <div>
        <!-- Step 1: Basic Info -->
        <div v-if="currentStep === 0" class="space-y-4">
          <h3 class="text-lg font-medium">Transfer Details</h3>
          
          <div class="space-y-3">
            <div v-if="transferType === 'custom'" class="grid grid-cols-2 gap-4">
              <div>
                <Label for="transferTypeSelect">Transfer Type</Label>
                <Select v-model="formData.type" required>
                  <SelectTrigger id="transferTypeSelect">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Transfer</SelectItem>
                    <SelectItem value="return">Return Transfer</SelectItem>
                    <SelectItem value="bulk">Bulk Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label for="externalReference">External Reference</Label>
                <Input 
                  id="externalReference"
                  v-model="formData.externalReference" 
                  placeholder="Order #, PO #, etc."
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-4">
              <div v-if="formData.type !== 'adjustment'">
                <Label>Which locations are involved in this transfer?</Label>
                <div class="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label for="fromLocation">From Location</Label>
                    <Select v-model="formData.fromLocationId" required>
                      <SelectTrigger id="fromLocation">
                        <SelectValue placeholder="Select source location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem 
                          v-for="location in fromLocations" 
                          :key="location.id" 
                          :value="location.id"
                        >
                          {{ location.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label for="toLocation">To Location</Label>
                    <Select v-model="formData.toLocationId" required>
                      <SelectTrigger id="toLocation">
                        <SelectValue placeholder="Select destination location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem 
                          v-for="location in toLocations" 
                          :key="location.id" 
                          :value="location.id"
                        >
                          {{ location.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div v-else>
                <Label for="locationForAdjustment">Location for Adjustment</Label>
                <Select v-model="formData.fromLocationId" required>
                  <SelectTrigger id="locationForAdjustment">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="location in locations" 
                      :key="location.id" 
                      :value="location.id"
                    >
                      {{ location.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div class="text-xs text-muted-foreground mt-1">
                  The location where the inventory adjustment will occur
                </div>
              </div>
              
              <div v-if="formData.type !== 'adjustment'" class="grid grid-cols-2 gap-4">
                <div>
                  <Label for="expectedShipDate">Expected Ship Date</Label>
                  <Input 
                    id="expectedShipDate"
                    v-model="formData.expectedShipDate" 
                    type="date"
                    :min="today"
                    required
                  />
                </div>
                
                <div>
                  <Label for="expectedDeliveryDate">Expected Delivery Date</Label>
                  <Input 
                    id="expectedDeliveryDate"
                    v-model="formData.expectedDeliveryDate" 
                    type="date"
                    :min="formData.expectedShipDate || today"
                  />
                </div>
              </div>
              
              <div>
                <Label for="transferNotes">Transfer Notes</Label>
                <Textarea
                  id="transferNotes"
                  v-model="formData.notes"
                  placeholder="Enter any additional information about this transfer"
                  rows="3"
                />
              </div>
              
              <div class="flex items-center space-x-2">
                <Checkbox id="requiresApproval" v-model:checked="formData.requiresApproval" />
                <Label for="requiresApproval" class="cursor-pointer">This transfer requires approval</Label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Step 2: Items -->
        <div v-else-if="currentStep === 1" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">
              {{ formData.type === 'adjustment' ? 'Items to Adjust' : 'Items to Transfer' }}
            </h3>
            <Button type="button" variant="outline" size="sm" @click="addItem">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <Card v-if="formData.type === 'adjustment'" class="bg-amber-50 border-amber-200">
            <CardContent class="p-3">
              <div class="flex gap-3 items-start">
                <AlertTriangleIcon class="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 class="font-medium text-amber-800">Inventory Adjustments</h4>
                  <p class="text-sm text-amber-700">
                    Use positive quantities to add inventory and negative quantities to remove inventory.
                    You must provide a reason for each adjustment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div class="space-y-4">
            <div v-if="formData.items.length === 0" class="text-center p-8 border rounded-md">
              <PackageIcon class="h-10 w-10 mx-auto text-muted-foreground/70" />
              <p class="mt-2 text-muted-foreground">No items added yet</p>
              <p class="text-sm text-muted-foreground">
                Click "Add Item" to start {{ formData.type === 'adjustment' ? 'adjusting inventory' : 'adding items to this transfer' }}
              </p>
            </div>
            
            <Card v-for="(item, index) in formData.items" :key="index" class="overflow-hidden">
              <CardHeader class="py-3 px-4 bg-muted/30 border-b flex flex-row items-center justify-between">
                <CardTitle class="text-base">Item {{ index + 1 }}</CardTitle>
                <Button type="button" variant="ghost" size="icon" @click="removeItem(index)" class="h-8 w-8">
                  <XIcon class="h-4 w-4" />
                  <span class="sr-only">Remove item</span>
                </Button>
              </CardHeader>
              <CardContent class="p-4 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label :for="`item-${index}`">Item</Label>
                    <Select v-model="item.itemId" required>
                      <SelectTrigger :id="`item-${index}`">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem 
                          v-for="inventoryItem in items" 
                          :key="inventoryItem.id" 
                          :value="inventoryItem.id"
                        >
                          {{ inventoryItem.name }} ({{ inventoryItem.sku }})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div class="flex gap-3">
                    <div class="flex-grow">
                      <Label :for="`quantity-${index}`">
                        {{ formData.type === 'adjustment' ? 'Adjustment Quantity' : 'Quantity' }}
                      </Label>
                      <Input 
                        :id="`quantity-${index}`"
                        v-model.number="item.quantity" 
                        type="number"
                        :min="formData.type === 'adjustment' ? undefined : 1"
                        required
                      />
                      <div v-if="formData.type === 'adjustment'" class="text-xs text-muted-foreground mt-0.5">
                        Use negative values for decreases
                      </div>
                    </div>
                    <div v-if="item.itemId && formData.type !== 'adjustment'" class="w-1/3">
                      <Label for="inStock">In Stock</Label>
                      <div class="h-9 flex items-center border rounded-md px-3 bg-muted/30">
                        {{ getItemCurrentStock(item.itemId, formData.fromLocationId) }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label :for="`sourceBin-${index}`">
                      {{ formData.type === 'adjustment' && item.quantity >= 0 ? 'Destination Bin' : 'Source Bin' }}
                    </Label>
                    <Input 
                      :id="`sourceBin-${index}`"
                      v-model="item.sourceBin"
                      placeholder="Optional"
                      :disabled="formData.type === 'adjustment' && item.quantity < 0"
                    />
                  </div>
                  
                  <div v-if="formData.type !== 'adjustment' || item.quantity < 0">
                    <Label :for="`destinationBin-${index}`">Destination Bin</Label>
                    <Input 
                      :id="`destinationBin-${index}`"
                      v-model="item.destinationBin"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                
                <div>
                  <Label :for="`notes-${index}`">
                    {{ formData.type === 'adjustment' ? 'Adjustment Reason' : 'Notes' }}
                  </Label>
                  <Textarea
                    :id="`notes-${index}`"
                    v-model="item.notes"
                    :placeholder="formData.type === 'adjustment' ? 
                      'Reason for inventory adjustment (required)' : 
                      'Optional notes for this item'"
                    rows="2"
                    :required="formData.type === 'adjustment'"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <!-- Step 3: Review -->
        <div v-else-if="currentStep === 2" class="space-y-4">
          <h3 class="text-lg font-medium">Review and Submit</h3>
          
          <Card>
            <CardHeader>
              <CardTitle>Transfer Summary</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <div class="text-sm font-medium">Type</div>
                  <div>{{ formatTransferType(formData.type) }}</div>
                </div>
                
                <div>
                  <div class="text-sm font-medium">External Reference</div>
                  <div>{{ formData.externalReference || '—' }}</div>
                </div>
                
                <div>
                  <div class="text-sm font-medium">From Location</div>
                  <div>{{ getLocationName(formData.fromLocationId) }}</div>
                </div>
                
                <div>
                  <div class="text-sm font-medium">To Location</div>
                  <div>{{ 
                    formData.type === 'adjustment' ? 
                    getLocationName(formData.fromLocationId) : 
                    getLocationName(formData.toLocationId) 
                  }}</div>
                </div>
                
                <div v-if="formData.type !== 'adjustment'">
                  <div class="text-sm font-medium">Expected Ship Date</div>
                  <div>{{ formatDate(formData.expectedShipDate) }}</div>
                </div>
                
                <div v-if="formData.type !== 'adjustment' && formData.expectedDeliveryDate">
                  <div class="text-sm font-medium">Expected Delivery</div>
                  <div>{{ formatDate(formData.expectedDeliveryDate) }}</div>
                </div>
                
                <div>
                  <div class="text-sm font-medium">Requires Approval</div>
                  <div>{{ formData.requiresApproval ? 'Yes' : 'No' }}</div>
                </div>
                
                <div>
                  <div class="text-sm font-medium">Items</div>
                  <div>{{ formData.items.length }}</div>
                </div>
              </div>
              
              <div v-if="formData.notes">
                <div class="text-sm font-medium">Notes</div>
                <div class="text-sm">{{ formData.notes }}</div>
              </div>
            </CardContent>
          </Card>
          
          <div class="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Bins</TableHead>
                  <TableHead v-if="hasItemNotes">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(item, index) in formData.items" :key="index">
                  <TableCell>
                    <div class="font-medium">{{ getItemName(item.itemId) }}</div>
                    <div class="text-sm text-muted-foreground">{{ getItemSku(item.itemId) }}</div>
                  </TableCell>
                  <TableCell>
                    {{ item.quantity }}
                  </TableCell>
                  <TableCell>
                    <div v-if="item.sourceBin" class="text-xs">
                      {{ formData.type === 'adjustment' && item.quantity >= 0 ? 'To: ' : 'From: ' }}
                      {{ item.sourceBin }}
                    </div>
                    <div v-if="item.destinationBin" class="text-xs">To: {{ item.destinationBin }}</div>
                  </TableCell>
                  <TableCell v-if="hasItemNotes">
                    <div class="text-xs">{{ item.notes || '—' }}</div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
    
    <SheetFooter class="pt-4 border-t mt-4 gap-2">
      <div class="flex justify-between w-full">
        <Button 
          variant="outline" 
          @click="currentStep > 0 ? currentStep-- : $emit('close')"
        >
          {{ currentStep > 0 ? 'Back' : 'Cancel' }}
        </Button>
        
        <Button 
          @click="currentStep < steps.length - 1 ? nextStep() : submitTransfer()"
          :disabled="!canProceed || isSubmitting"
        >
          <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          {{ currentStep < steps.length - 1 ? 'Continue' : 'Create Transfer' }}
        </Button>
      </div>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import {
  AlertTriangleIcon,
  CheckIcon,
  Loader2Icon,
  PackageIcon,
  PlusIcon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
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
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'

const props = defineProps({
  transferType: { 
    type: String, 
    default: 'standard',
    validator: value => ['standard', 'return', 'adjustment', 'bulk', 'custom'].includes(value)
  },
  locations: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] }
})

const emit = defineEmits(['transfer-created', 'close'])

// Steps configuration
const steps = [
  { title: 'Details', isValid: () => isStep1Valid.value },
  { title: 'Items', isValid: () => isStep2Valid.value },
  { title: 'Review', isValid: () => true }
]

// Local state
const currentStep = ref(0)
const isSubmitting = ref(false)

// Form data
const formData = ref({
  type: props.transferType === 'custom' ? 'standard' : props.transferType,
  fromLocationId: '',
  toLocationId: '',
  expectedShipDate: '',
  expectedDeliveryDate: '',
  requiresApproval: false,
  notes: '',
  externalReference: '',
  items: []
})

// Handle adjustment type
watch(() => formData.value.type, (newType) => {
  if (newType === 'adjustment') {
    formData.value.toLocationId = formData.value.fromLocationId
  }
})

watch(() => formData.value.fromLocationId, (newLocation) => {
  if (formData.value.type === 'adjustment' && newLocation) {
    formData.value.toLocationId = newLocation
  }
})

// Initialize form with default values
const initForm = () => {
  // Set today's date as the default expected ship date
  formData.value.expectedShipDate = format(new Date(), 'yyyy-MM-dd')
  
  // Set tomorrow as the default expected delivery date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  formData.value.expectedDeliveryDate = format(tomorrow, 'yyyy-MM-dd')
}

// Computed properties
const getTransferTypeTitle = computed(() => {
  switch (props.transferType) {
    case 'standard': return 'Create Standard Transfer'
    case 'return': return 'Create Return Transfer'
    case 'adjustment': return 'Create Inventory Adjustment'
    case 'bulk': return 'Create Bulk Transfer'
    case 'custom': return 'Create Transfer'
    default: return 'Create Transfer'
  }
})

const getTransferTypeDescription = computed(() => {
  switch (props.transferType) {
    case 'standard': return 'Move inventory from one location to another'
    case 'return': return 'Return inventory to its source location'
    case 'adjustment': return 'Adjust inventory quantities at a specific location'
    case 'bulk': return 'Transfer multiple items in a single operation'
    case 'custom': return 'Create a customized inventory transfer'
    default: return 'Move inventory between locations'
  }
})

const today = computed(() => {
  return format(new Date(), 'yyyy-MM-dd')
})

const fromLocations = computed(() => {
  return props.locations
})

const toLocations = computed(() => {
  if (formData.value.type === 'adjustment') {
    return props.locations.filter(loc => loc.id === formData.value.fromLocationId)
  }
  return props.locations.filter(loc => loc.id !== formData.value.fromLocationId)
})

const isStep1Valid = computed(() => {
  const baseValid = formData.value.fromLocationId && 
    (formData.value.type === 'adjustment' || formData.value.toLocationId)
  
  const dateValid = formData.value.type === 'adjustment' || (
    formData.value.expectedShipDate && 
    (!formData.value.expectedDeliveryDate || 
      formData.value.expectedDeliveryDate >= formData.value.expectedShipDate)
  )
  
  return baseValid && dateValid
})

const isStep2Valid = computed(() => {
  return formData.value.items.length > 0 && 
    formData.value.items.every(item => {
      const baseValid = item.itemId && 
        (formData.value.type === 'adjustment' ? item.quantity !== 0 : item.quantity > 0)
      
      // For adjustments, require notes
      const notesValid = formData.value.type !== 'adjustment' || !!item.notes
      
      return baseValid && notesValid
    })
})

const canProceed = computed(() => {
  if (currentStep.value === 0) return isStep1Valid.value
  if (currentStep.value === 1) return isStep2Valid.value
  return true
})

const hasItemNotes = computed(() => {
  return formData.value.items.some(item => item.notes)
})

// Helper functions
function getLocationName(locationId) {
  const location = props.locations.find(loc => loc.id === locationId)
  return location ? location.name : locationId || '—'
}

function getItemName(itemId) {
  const item = props.items.find(item => item.id === itemId)
  return item ? item.name : itemId
}

function getItemSku(itemId) {
  const item = props.items.find(item => item.id === itemId)
  return item ? item.sku : ''
}

function getItemCurrentStock(itemId, locationId) {
  // Mock function - in real world this would check actual inventory levels
  return '25 units'
}

function formatDate(date) {
  if (!date) return '—'
  try {
    return format(new Date(date), 'MMM d, yyyy')
  } catch (e) {
    return date
  }
}

function formatTransferType(type) {
  switch (type) {
    case 'standard': return 'Standard Transfer'
    case 'return': return 'Return Transfer'
    case 'adjustment': return 'Inventory Adjustment'
    case 'bulk': return 'Bulk Transfer'
    default: return type
  }
}

// Action handlers
function addItem() {
  formData.value.items.push({
    itemId: '',
    quantity: formData.value.type === 'adjustment' ? 0 : 1,
    sourceBin: '',
    destinationBin: '',
    notes: ''
  })
}

function removeItem(index) {
  formData.value.items.splice(index, 1)
}

function nextStep() {
  if (currentStep.value < steps.length - 1 && canProceed.value) {
    currentStep.value++
  }
}

async function submitTransfer() {
  isSubmitting.value = true

  try {
    const transferData = {
      ...formData.value,
      expectedShipDate: formData.value.expectedShipDate ? new Date(formData.value.expectedShipDate).toISOString() : undefined,
      expectedDeliveryDate: formData.value.expectedDeliveryDate ? new Date(formData.value.expectedDeliveryDate).toISOString() : undefined,
    }
    
    // For adjustments, ensure to/from are the same location
    if (transferData.type === 'adjustment') {
      transferData.toLocationId = transferData.fromLocationId
    }

    emit('transfer-created', transferData)
  } catch (error) {
    console.error('Error creating transfer:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Initialize on mount
initForm()
</script>