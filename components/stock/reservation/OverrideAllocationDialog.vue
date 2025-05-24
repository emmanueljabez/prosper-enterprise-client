<template>
  <DialogContent class="sm:max-w-[700px] max-h-[90vh] flex flex-col">
    <DialogHeader class="flex-shrink-0">
      <DialogTitle class="flex items-center space-x-2">
        <span>Override Allocation Rules</span>
        <Badge variant="warning">Manual Override</Badge>
      </DialogTitle>
      <DialogDescription>
        Manually allocate inventory for order {{ allocation.orderReference }} by overriding automatic rules
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6 py-4 overflow-y-auto flex-grow">
      <!-- Order summary -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <p class="text-sm font-medium">Order Reference</p>
          <p class="font-medium">{{ allocation.orderReference }}</p>
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium">Customer</p>
          <p>{{ allocation.customerName }}</p>
        </div>
      </div>

      <Alert variant="warning">
        <AlertCircleIcon class="h-4 w-4" />
        <AlertTitle>Allocation Override</AlertTitle>
        <AlertDescription>
          This will bypass automatic allocation rules. Use this option only when necessary.
        </AlertDescription>
      </Alert>

      <Separator />

      <!-- Override settings -->
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="priority">Manual Priority Level</Label>
          <Select v-model="formData.priorityLevel">
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical (Highest)</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="normal">Normal Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs text-muted-foreground">
            Sets priority for this order relative to other orders
          </p>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label for="allocationType">Override Type</Label>
          </div>
          <Select v-model="formData.allocationType">
            <SelectTrigger id="allocationType">
              <SelectValue placeholder="Select override type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fullyManual">Fully Manual Allocation</SelectItem>
              <SelectItem value="priorityBoost">Priority Boost</SelectItem>
              <SelectItem value="reserveInventory">Reserve Specific Inventory</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="overrideLocation">Preferred Location</Label>
          <Select v-model="formData.locationId">
            <SelectTrigger id="overrideLocation">
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
        </div>
      </div>

      <Separator />

      <!-- Allocation items -->
      <div class="space-y-2">
        <Label>Item Allocation</Label>
        <div class="rounded-md border">
          <div class="max-h-[200px] overflow-y-auto">
            <Table>
              <TableHeader class="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead class="text-right w-24">Requested</TableHead>
                  <TableHead class="text-right w-24">
                    Available
                    <HelpCircleIcon 
                      class="inline-block h-4 w-4 ml-1 text-muted-foreground cursor-help"
                      data-tooltip="Available at selected location"
                    />
                  </TableHead>
                  <TableHead class="text-right w-32">Allocation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(item, index) in formData.items" :key="item.itemId">
                  <TableCell>{{ item.itemName }}</TableCell>
                  <TableCell>{{ item.sku }}</TableCell>
                  <TableCell class="text-right">{{ item.requestedQuantity }}</TableCell>
                  <TableCell class="text-right">
                    {{ getAvailableQuantity(item.itemId) }}
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        class="h-7 w-7"
                        @click="decrementQuantity(index)"
                        :disabled="item.allocatedQuantity <= 0"
                      >
                        <MinusIcon class="h-3 w-3" />
                      </Button>
                      <Input 
                        type="number" 
                        v-model.number="item.allocatedQuantity" 
                        class="w-16 h-9 text-right"
                        min="0"
                        :max="getMaxAllocation(item)"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        class="h-7 w-7"
                        @click="incrementQuantity(index)"
                        :disabled="item.allocatedQuantity >= getMaxAllocation(item)"
                      >
                        <PlusIcon class="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="space-y-2">
        <Label for="notes">Override Reason</Label>
        <Textarea
          id="notes"
          v-model="formData.notes"
          placeholder="Explain why this override is necessary"
          rows="2"
        />
        <p class="text-xs text-muted-foreground">
          This note will be recorded in the allocation history
        </p>
      </div>
    </div>

    <DialogFooter class="flex-shrink-0">
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        @click="applyOverride" 
        :disabled="isSubmitting || !isValid"
        variant="default"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Apply Override
      </Button>
    </DialogFooter>
  </DialogContent>
</template>
<script setup>
import { ref, computed } from 'vue'
import { 
  Loader2Icon, PlusIcon, MinusIcon, 
  AlertCircleIcon, HelpCircleIcon 
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
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
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

const props = defineProps({
  allocation: {
    type: Object,
    required: true
  },
  locations: {
    type: Array,
    required: true,
    default: () => []
  },
  availableInventory: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'allocation-overridden'])

// Form state
const formData = ref({
  priorityLevel: 'normal',
  allocationType: 'fullyManual',
  locationId: '',
  items: [],
  notes: ''
})

const isSubmitting = ref(false)

// Initialize form data
const initializeFormData = () => {
  formData.value.locationId = props.allocation.locationId || ''
  
  // Initialize items with current allocation quantities
  formData.value.items = props.allocation.items.map(item => ({
    itemId: item.itemId,
    itemName: item.itemName,
    sku: item.sku,
    requestedQuantity: item.requestedQuantity || 0,
    allocatedQuantity: item.allocatedQuantity || 0
  }))
}

// Call initialization when component mounts
initializeFormData()

// Computed properties
const selectedLocation = computed(() => {
  if (!formData.value.locationId) return null
  return props.locations.find(loc => loc.id === formData.value.locationId)
})

const isValid = computed(() => {
  return (
    formData.value.priorityLevel && 
    formData.value.allocationType && 
    formData.value.locationId && 
    formData.value.notes.length > 0 &&
    formData.value.items.some(item => item.allocatedQuantity > 0)
  )
})

// Helper functions
function getAvailableQuantity(itemId) {
  if (!selectedLocation.value || !props.availableInventory[itemId]) return 0
  
  const locationInventory = props.availableInventory[itemId].locations || {}
  return locationInventory[formData.value.locationId] || 0
}

function getMaxAllocation(item) {
  // For manual allocation, allow allocating up to the requested quantity
  // if available inventory is sufficient
  const available = getAvailableQuantity(item.itemId)
  return Math.min(item.requestedQuantity, available)
}

// Action handlers
function incrementQuantity(index) {
  const item = formData.value.items[index]
  const maxAllocation = getMaxAllocation(item)
  
  if (item.allocatedQuantity < maxAllocation) {
    item.allocatedQuantity++
  }
}

function decrementQuantity(index) {
  const item = formData.value.items[index]
  if (item.allocatedQuantity > 0) {
    item.allocatedQuantity--
  }
}

async function applyOverride() {
  if (!isValid.value) return
  
  isSubmitting.value = true
  
  try {
    // Prepare override data
    const overrideData = {
      allocationId: props.allocation.id,
      priorityLevel: formData.value.priorityLevel,
      allocationType: formData.value.allocationType,
      locationId: formData.value.locationId,
      locationName: selectedLocation.value?.name,
      notes: formData.value.notes,
      items: formData.value.items.map(item => ({
        itemId: item.itemId,
        allocatedQuantity: item.allocatedQuantity
      })),
      appliedAt: new Date().toISOString(),
      overrideType: 'manual'
    }
    
    // Pass the data to parent component
    emit('allocation-overridden', overrideData)
  } catch (error) {
    console.error('Error applying allocation override:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>