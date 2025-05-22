<!-- filepath: c:\Users\user\Documents\pcash-inventory\pcash-inventory\components\warehouse\packing\CompletePackTaskDialog.vue -->
<template>
  <DialogContent class="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle>Complete Packing Task</DialogTitle>
      <DialogDescription>
        Complete this packing task and prepare it for shipping
      </DialogDescription>
    </DialogHeader>

    <div class="grid gap-6 py-4">
      <!-- Task Information Summary -->
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
          <div class="text-xs font-medium text-muted-foreground">Shipping Method</div>
          <div>{{ formatShippingMethod(task.shippingMethod) }}</div>
        </div>
      </div>

      <!-- Packaging Information -->
      <div class="space-y-2">
        <h4 class="text-sm font-medium">Package Details</h4>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="packageType">Package Type</Label>
            <Select v-model="formData.packageType">
              <SelectTrigger id="packageType">
                <SelectValue placeholder="Select package type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="box_small">Small Box</SelectItem>
                <SelectItem value="box_medium">Medium Box</SelectItem>
                <SelectItem value="box_large">Large Box</SelectItem>
                <SelectItem value="envelope">Envelope</SelectItem>
                <SelectItem value="tube">Tube</SelectItem>
                <SelectItem value="custom">Custom Packaging</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="dimensions">Dimensions (optional)</Label>
            <Input 
              id="dimensions" 
              v-model="formData.dimensions" 
              placeholder="e.g. 30x20x15 cm"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="weight">Package Weight (kg)</Label>
            <Input 
              id="weight" 
              v-model="formData.weight" 
              type="number" 
              step="0.01" 
              min="0"
              placeholder="Enter weight in kg"
            />
            <p v-if="errors.weight" class="text-destructive text-sm">{{ errors.weight }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="numberOfPackages">Number of Packages</Label>
            <Input 
              id="numberOfPackages" 
              v-model="formData.numberOfPackages" 
              type="number" 
              min="1"
              placeholder="1"
            />
          </div>
        </div>
      </div>

      <!-- Items Verification -->
      <div class="space-y-2">
        <h4 class="text-sm font-medium">Item Verification</h4>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Packed</TableHead>
                <TableHead>Issue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(item, index) in formData.items" :key="item.lineItemId">
                <TableCell>
                  <div class="flex items-center space-x-3">
                    <Checkbox
                      :id="'item-' + item.lineItemId"
                      v-model:checked="formData.items[index].verified"
                    />
                    <Label :for="'item-' + item.lineItemId" class="cursor-pointer">
                      {{ item.name }}
                    </Label>
                  </div>
                </TableCell>
                <TableCell>{{ item.sku }}</TableCell>
                <TableCell>{{ item.quantity }}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    v-model="formData.items[index].packedQuantity"
                    :min="0"
                    :max="item.quantity"
                    class="w-20"
                    :disabled="!formData.items[index].verified"
                  />
                </TableCell>
                <TableCell>
                  <Select 
                    v-model="formData.items[index].issueType"
                    v-if="formData.items[index].packedQuantity < item.quantity"
                  >
                    <SelectTrigger class="w-[180px]">
                      <SelectValue placeholder="Select issue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Issue</SelectItem>
                      <SelectItem value="inventory_error">Inventory Error</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="wrong_item">Wrong Item</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div v-if="!allItemsVerified" class="text-sm text-amber-600 flex items-center">
          <AlertTriangleIcon class="h-4 w-4 mr-1" />
          All items must be verified before completing
        </div>
      </div>

      <!-- Shipping Label -->
      <div class="space-y-2">
        <h4 class="text-sm font-medium">Shipping Label</h4>
        <div class="flex flex-col space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="generateLabel"
              v-model:checked="formData.generateShippingLabel"
            />
            <Label for="generateLabel">Generate shipping label now</Label>
          </div>
          
          <div 
            v-if="formData.generateShippingLabel" 
            class="ml-6 p-3 border rounded-md space-y-3"
          >
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="carrier">Shipping Carrier</Label>
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
                <Label for="shippingService">Shipping Service</Label>
                <Select v-model="formData.shippingService">
                  <SelectTrigger id="shippingService">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ground">Ground</SelectItem>
                    <SelectItem value="2day">2-Day</SelectItem>
                    <SelectItem value="overnight">Overnight</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div class="space-y-2">
                <Label for="trackingNumber">Tracking Number (Optional)</Label>
                <Input 
                  id="trackingNumber" 
                  v-model="formData.trackingNumber" 
                  placeholder="Enter tracking number"
                />
              </div>
              
              <div class="space-y-2">
                <Label for="insuranceValue">Insurance Value ($)</Label>
                <Input 
                  id="insuranceValue" 
                  v-model="formData.insuranceValue" 
                  type="number" 
                  min="0"
                  step="0.01"
                  placeholder="Enter value to insure"
                />
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <Checkbox
                id="printAfterGeneration"
                v-model:checked="formData.printLabelAfterGeneration"
              />
              <Label for="printAfterGeneration">Print label immediately after generation</Label>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Options -->
      <div class="space-y-4">
        <h4 class="text-sm font-medium">Additional Options</h4>
        <div class="flex flex-col space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="includeInvoice"
              v-model:checked="formData.includeInvoice"
            />
            <Label for="includeInvoice">Include invoice in package</Label>
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox
              id="includeGiftReceipt"
              v-model:checked="formData.includeGiftReceipt"
            />
            <Label for="includeGiftReceipt">Include gift receipt (no prices)</Label>
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox
              id="markAsShipped"
              v-model:checked="formData.markAsShipped"
            />
            <Label for="markAsShipped">Mark order as shipped after completion</Label>
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox
              id="notifyCustomer"
              v-model:checked="formData.notifyCustomer"
            />
            <Label for="notifyCustomer">Send shipping notification to customer</Label>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="space-y-2">
        <h4 class="text-sm font-medium">Completion Notes (Optional)</h4>
        <Textarea 
          v-model="formData.notes"
          placeholder="Enter any notes about this packing task..."
          :rows="2"
        />
      </div>
    </div>

    <AlertDialog v-model:open="showConfirmDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to complete this task?</AlertDialogTitle>
          <AlertDialogDescription>
            {{ getConfirmationMessage() }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showConfirmDialog = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmComplete">Yes, Complete Task</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button variant="default" @click="completeTask" :disabled="isSubmitting || !allItemsVerified">
        <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        <CheckIcon v-else class="h-4 w-4 mr-2" />
        {{ isSubmitting ? 'Completing...' : 'Complete Packing' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  AlertTriangleIcon,
  CheckIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'task-completed'])

// State
const isSubmitting = ref(false)
const showConfirmDialog = ref(false)
const errors = reactive({
  weight: ''
})

// Form data
const formData = reactive({
  // Package details
  packageType: 'box_medium',
  dimensions: '',
  weight: '',
  numberOfPackages: 1,

  // Items verification
  items: [],

  // Shipping label
  generateShippingLabel: true,
  carrier: '',
  shippingService: '',
  trackingNumber: '',
  insuranceValue: '',
  printLabelAfterGeneration: true,

  // Additional options
  includeInvoice: true,
  includeGiftReceipt: false,
  markAsShipped: true,
  notifyCustomer: true,

  // Notes
  notes: ''
})

// Computed properties
const allItemsVerified = computed(() => {
  return formData.items.every(item => item.verified)
})

const isFormValid = computed(() => {
  return (
    allItemsVerified.value && 
    formData.weight && 
    !isNaN(formData.weight) &&
    parseFloat(formData.weight) > 0
  )
})

// Initialize form when component is mounted
onMounted(() => {
  // Initialize the item verification data
  formData.items = props.task.items.map(item => ({
    ...item,
    verified: false,
    packedQuantity: item.quantity,
    issueType: 'none'
  }))

  // Set initial carrier based on task's shipping method or carrier
  if (props.task.carrier) {
    formData.carrier = props.task.carrier.toLowerCase()
  } else if (props.task.shippingMethod) {
    switch (props.task.shippingMethod) {
      case 'express':
      case 'priority':
        formData.carrier = 'fedex'
        formData.shippingService = props.task.shippingMethod === 'express' ? '2day' : 'overnight'
        break
      case 'standard':
        formData.carrier = 'ups'
        formData.shippingService = 'ground'
        break
      case 'economy':
        formData.carrier = 'usps'
        formData.shippingService = 'ground'
        break
      default:
        formData.carrier = 'ups'
        formData.shippingService = 'ground'
    }
  }
})

// Methods
function formatShippingMethod(method) {
  switch (method) {
    case 'standard': return 'Standard'
    case 'express': return 'Express'
    case 'priority': return 'Priority'
    case 'economy': return 'Economy'
    default: return method || 'Not specified'
  }
}

function getConfirmationMessage() {
  if (!allItemsVerified.value) {
    return 'Some items have not been verified. Please verify all items before completing.'
  }

  const unpackedItems = formData.items.filter(item => item.packedQuantity < item.quantity)
  if (unpackedItems.length > 0) {
    return `${unpackedItems.length} item(s) are not fully packed. Are you sure you want to complete this task?`
  }

  return 'This will mark the packing task as completed and prepare it for shipping.'
}

function validateForm() {
  let isValid = true
  errors.weight = ''

  if (!formData.weight || isNaN(formData.weight) || parseFloat(formData.weight) <= 0) {
    errors.weight = 'Please enter a valid package weight'
    isValid = false
  }

  if (!allItemsVerified.value) {
    isValid = false
  }

  return isValid
}

function completeTask() {
  if (!validateForm()) {
    return
  }

  const unpackedItems = formData.items.filter(item => item.packedQuantity < item.quantity)
  if (unpackedItems.length > 0) {
    showConfirmDialog.value = true
  } else {
    submitCompletionData()
  }
}

function confirmComplete() {
  showConfirmDialog.value = false
  submitCompletionData()
}

async function submitCompletionData() {
  isSubmitting.value = true
  
  try {
    // Format the data to submit
    const completionData = {
      // Package details
      packageDetails: {
        packageType: formData.packageType,
        dimensions: formData.dimensions,
        weight: parseFloat(formData.weight),
        numberOfPackages: parseInt(formData.numberOfPackages)
      },
      
      // Items
      items: formData.items.map(item => ({
        lineItemId: item.lineItemId,
        sku: item.sku,
        quantity: item.quantity,
        packedQuantity: item.packedQuantity,
        verified: item.verified,
        issueType: item.packedQuantity < item.quantity ? item.issueType : null
      })),
      
      // Shipping label
      shippingLabel: formData.generateShippingLabel ? {
        carrier: formData.carrier,
        service: formData.shippingService,
        trackingNumber: formData.trackingNumber,
        insuranceValue: formData.insuranceValue ? parseFloat(formData.insuranceValue) : null,
        printImmediately: formData.printLabelAfterGeneration
      } : null,
      
      // Additional options
      options: {
        includeInvoice: formData.includeInvoice,
        includeGiftReceipt: formData.includeGiftReceipt,
        markAsShipped: formData.markAsShipped,
        notifyCustomer: formData.notifyCustomer
      },
      
      // Notes
      notes: formData.notes
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Emit completion event
    emit('task-completed', props.task, completionData)
  } catch (error) {
    console.error('Error completing packing task:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>