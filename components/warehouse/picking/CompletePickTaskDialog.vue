<template>
  <DialogContent class="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle>Complete Picking Task</DialogTitle>
      <DialogDescription>
        Record picked items and complete this picking task
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
      </div>

      <!-- Items to Pick -->
      <div class="space-y-2">
        <h4 class="text-sm font-medium">Items to Pick</h4>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Picked</TableHead>
                <TableHead>Issue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(item, index) in formState.items" :key="item.lineItemId">
                <TableCell>
                  <div class="flex items-center space-x-3">
                    <div class="h-10 w-10 rounded-md border flex items-center justify-center bg-muted/50">
                      <PackageIcon class="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>{{ item.name }}</div>
                  </div>
                </TableCell>
                <TableCell>{{ item.sku }}</TableCell>
                <TableCell>
                  <Badge variant="outline">{{ item.locationId || 'No location' }}</Badge>
                </TableCell>
                <TableCell>{{ item.quantity }}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    v-model="formState.items[index].pickedQuantity"
                    :min="0"
                    :max="item.quantity"
                    class="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Select v-model="formState.items[index].issueType" v-if="item.pickedQuantity < item.quantity">
                    <SelectTrigger class="w-[180px]">
                      <SelectValue placeholder="Select issue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Issue</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="location_error">Location Error</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <!-- Exception Notes -->
      <div class="space-y-2" v-if="hasExceptions">
        <h4 class="text-sm font-medium">Exception Notes</h4>
        <p class="text-sm text-muted-foreground">
          Please provide details for any items with exceptions (out of stock, damaged, etc.)
        </p>
        <Textarea 
          v-model="formState.exceptionNotes"
          placeholder="Enter details about missing or damaged items..."
          :rows="3"
        />
      </div>

      <!-- Additional options -->
      <div class="space-y-4">
        <h4 class="text-sm font-medium">Completion Options</h4>
        <div class="flex flex-col space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="createPackingTask"
              v-model:checked="formState.createPackingTask"
            />
            <Label for="createPackingTask">Automatically create packing task</Label>
          </div>
          
          <div class="flex items-center space-x-2 pl-6" v-if="formState.createPackingTask">
            <Checkbox
              id="highPriorityPacking"
              v-model:checked="formState.highPriorityPacking"
            />
            <Label for="highPriorityPacking">Mark as high priority packing</Label>
          </div>
        </div>

        <div class="flex items-center space-x-2" v-if="hasPartialPick">
          <Checkbox
            id="createResidualTask"
            v-model:checked="formState.createResidualTask"
          />
          <Label for="createResidualTask">Create follow-up task for remaining items</Label>
        </div>
      </div>

      <!-- Notes -->
      <div class="space-y-2">
        <h4 class="text-sm font-medium">Completion Notes (Optional)</h4>
        <Textarea 
          v-model="formState.notes"
          placeholder="Enter any notes about this picking task..."
          :rows="2"
        />
      </div>
    </div>

    <AlertDialog v-model:open="showConfirmDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to complete this task?</AlertDialogTitle>
          <AlertDialogDescription>
            {{ getMissingItemsMessage() }}
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
      <Button variant="default" @click="completeTask" :disabled="isSubmitting">
        <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        <CheckIcon v-else class="h-4 w-4 mr-2" />
        {{ isSubmitting ? 'Completing...' : 'Complete Task' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  CheckIcon,
  Loader2Icon,
  PackageIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

const isSubmitting = ref(false)
const showConfirmDialog = ref(false)

const formState = reactive({
  items: [],
  notes: '',
  exceptionNotes: '',
  createPackingTask: true,
  highPriorityPacking: false,
  createResidualTask: false
})

// Computed properties
const hasExceptions = computed(() => {
  return formState.items.some(item => 
    item.pickedQuantity < item.quantity && item.issueType && item.issueType !== 'none'
  )
})

const hasPartialPick = computed(() => {
  return formState.items.some(item => item.pickedQuantity < item.quantity)
})

const isMissingItems = computed(() => {
  return formState.items.some(item => item.pickedQuantity < item.quantity)
})

// Methods
function initializeForm() {
  // Deep copy items to prevent modifying the original task
  formState.items = props.task.items.map(item => ({
    ...item,
    pickedQuantity: item.pickedQuantity || item.quantity, // Default to full quantity
    issueType: 'none'
  }))
  
  // Set other default values
  formState.createPackingTask = true
  formState.highPriorityPacking = props.task.priority === 'high' || props.task.priority === 'urgent'
  formState.createResidualTask = false
  formState.notes = ''
  formState.exceptionNotes = ''
}

function getMissingItemsMessage() {
  const missingCount = formState.items.filter(item => item.pickedQuantity < item.quantity).length
  
  if (missingCount === 0) {
    return 'This will mark all items as picked and complete the task.'
  } else if (missingCount === 1) {
    return '1 item is not fully picked. Do you want to complete this task anyway?'
  } else {
    return `${missingCount} items are not fully picked. Do you want to complete this task anyway?`
  }
}

function completeTask() {
  // Check if any items are not fully picked
  if (isMissingItems.value) {
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
  try {
    isSubmitting.value = true
    
    // Prepare the completion data
    const completionData = {
      items: formState.items,
      notes: formState.notes,
      exceptionNotes: hasExceptions.value ? formState.exceptionNotes : '',
      createPackingTask: formState.createPackingTask,
      highPriorityPacking: formState.highPriorityPacking,
      createResidualTask: formState.createResidualTask && hasPartialPick.value
    }
    
    // Allow a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Emit the completed event with the task and completion data
    emit('task-completed', props.task, completionData)
  } catch (error) {
    console.error('Error completing task:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Initialize the form when component is mounted
onMounted(() => {
  initializeForm()
})
</script>