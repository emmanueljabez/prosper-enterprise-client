<template>
  <DialogContent class="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle class="flex items-center space-x-2">
        <span>Modify Allocation</span>
        <Badge :variant="getStatusVariant(allocation.status)">
          {{ formatStatus(allocation.status) }}
        </Badge>
      </DialogTitle>
      <DialogDescription>
        Adjust allocated quantities for order {{ allocation.orderReference }}
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6 py-4">
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

      <Separator />

      <!-- Allocation location -->
      <div class="space-y-2">
        <Label for="location">Allocation Location</Label>
        <Select v-model="formData.locationId">
          <SelectTrigger id="location">
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
        <p class="text-xs text-muted-foreground" v-if="selectedLocation">
          Available inventory: {{ selectedLocation.availableItems || 'Unknown' }} items
        </p>
      </div>

      <!-- Allocation items -->
      <div class="space-y-2">
        <Label>Items to Allocate</Label>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead class="text-right w-24">Requested</TableHead>
                <TableHead class="text-right w-24">Current</TableHead>
                <TableHead class="text-right w-32">New Allocation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(item, index) in formData.items" :key="item.itemId">
                <TableCell>{{ item.itemName }}</TableCell>
                <TableCell>{{ item.sku }}</TableCell>
                <TableCell class="text-right">{{ item.requestedQuantity }}</TableCell>
                <TableCell class="text-right">{{ item.currentQuantity }}</TableCell>
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
                      :max="item.requestedQuantity"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      class="h-7 w-7"
                      @click="incrementQuantity(index)"
                      :disabled="item.allocatedQuantity >= item.requestedQuantity"
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

      <!-- Change summary -->
      <div v-if="hasChanges" class="rounded-md bg-muted p-4">
        <h3 class="text-sm font-medium mb-2">Allocation Changes</h3>
        <ul class="space-y-1 text-sm">
          <li v-for="change in allocationChanges" :key="change.itemId">
            <span class="font-medium">{{ change.itemName }}:</span> 
            <span>{{ change.currentQuantity }} → {{ change.newQuantity }}</span>
            <Badge 
              :variant="change.difference > 0 ? 'success' : 'destructive'"
              class="ml-2"
            >
              {{ change.difference > 0 ? '+' : '' }}{{ change.difference }}
            </Badge>
          </li>
        </ul>
      </div>

      <!-- Notes -->
      <div class="space-y-2">
        <Label for="notes">Modification Notes</Label>
        <Textarea
          id="notes"
          v-model="formData.notes"
          placeholder="Reason for modifying this allocation"
          rows="2"
        />
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        @click="saveModification" 
        :disabled="isSubmitting || !hasChanges"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Save Changes
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Loader2Icon, PlusIcon, MinusIcon } from 'lucide-vue-next'
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
  }
})

const emit = defineEmits(['close', 'allocation-modified'])

// Form state
const formData = ref({
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
    currentQuantity: item.allocatedQuantity || 0,
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

const hasChanges = computed(() => {
  // Check if any quantities have changed
  return formData.value.items.some(
    item => item.allocatedQuantity !== item.currentQuantity
  ) || (formData.value.locationId !== props.allocation.locationId && formData.value.locationId !== '')
})

const allocationChanges = computed(() => {
  return formData.value.items
    .filter(item => item.allocatedQuantity !== item.currentQuantity)
    .map(item => ({
      itemId: item.itemId,
      itemName: item.itemName,
      currentQuantity: item.currentQuantity,
      newQuantity: item.allocatedQuantity,
      difference: item.allocatedQuantity - item.currentQuantity
    }))
})

// Helper functions
function formatStatus(status) {
  const statuses = {
    pending: 'Pending',
    allocated: 'Allocated',
    partially_allocated: 'Partially Allocated',
    fulfilled: 'Fulfilled',
    cancelled: 'Cancelled'
  }
  return statuses[status] || status
}

function getStatusVariant(status) {
  const variants = {
    pending: 'warning',
    allocated: 'success',
    partially_allocated: 'info',
    fulfilled: 'default',
    cancelled: 'destructive'
  }
  return variants[status] || 'outline'
}

// Action handlers
function incrementQuantity(index) {
  const item = formData.value.items[index]
  if (item.allocatedQuantity < item.requestedQuantity) {
    item.allocatedQuantity++
  }
}

function decrementQuantity(index) {
  const item = formData.value.items[index]
  if (item.allocatedQuantity > 0) {
    item.allocatedQuantity--
  }
}

async function saveModification() {
  if (!hasChanges.value) return
  
  isSubmitting.value = true
  
  try {
    // Prepare update data
    const modificationData = {
      allocationId: props.allocation.id,
      locationId: formData.value.locationId,
      notes: formData.value.notes,
      items: formData.value.items.map(item => ({
        itemId: item.itemId,
        allocatedQuantity: item.allocatedQuantity
      })),
      changes: allocationChanges.value
    }
    
    // Pass the data to parent component
    emit('allocation-modified', modificationData)
  } catch (error) {
    console.error('Error modifying allocation:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Initialize locationId when component is created
watch(() => props.allocation, (newAllocation) => {
  if (newAllocation && newAllocation.locationId) {
    formData.value.locationId = newAllocation.locationId
  }
}, { immediate: true })
</script>