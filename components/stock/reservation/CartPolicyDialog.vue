<template>
  <DialogContent class="sm:max-w-[800px]">
    <DialogHeader>
      <DialogTitle>Cart Reservation Rules</DialogTitle>
      <DialogDescription>
        Configure how items are handled in customer shopping carts
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium">Cart Reservation Policies</h3>
          <p class="text-sm text-muted-foreground">
            These policies define how long items remain reserved in customer carts
          </p>
        </div>
        <Button @click="addPolicy" variant="outline" size="sm">
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Policy
        </Button>
      </div>

      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Customer Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="editedPolicies.length === 0">
              <TableCell colSpan="5" class="text-center">
                <div class="flex flex-col items-center justify-center py-6">
                  <ShoppingCartIcon class="h-8 w-8 text-muted-foreground mb-2" />
                  <p class="text-muted-foreground">No cart policies defined yet</p>
                  <Button @click="addPolicy" variant="outline" size="sm" class="mt-2">
                    <PlusIcon class="h-4 w-4 mr-2" />
                    Add Policy
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-for="(policy, index) in editedPolicies" :key="policy.id">
              <TableCell>
                <Input
                  v-if="policy.isEditing"
                  v-model="policy.name"
                  placeholder="Policy name"
                  class="max-w-[200px]"
                />
                <div v-else>{{ policy.name }}</div>
                <div v-if="!policy.isEditing && policy.description" class="text-xs text-muted-foreground">
                  {{ policy.description }}
                </div>
              </TableCell>
              <TableCell>
                <div v-if="policy.isEditing" class="flex items-center space-x-2">
                  <Input
                    v-model.number="policy.duration"
                    type="number"
                    min="5"
                    max="1440"
                    class="w-[80px]"
                  />
                  <Select v-model="policy.durationType">
                    <SelectTrigger class="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div v-else>{{ formatDuration(policy) }}</div>
              </TableCell>
              <TableCell>
                <div v-if="policy.isEditing">
                  <Select v-model="policy.customerType">
                    <SelectTrigger class="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      <SelectItem value="guest">Guest Customers</SelectItem>
                      <SelectItem value="registered">Registered Customers</SelectItem>
                      <SelectItem value="vip">VIP Customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div v-else>{{ formatCustomerType(policy.customerType) }}</div>
              </TableCell>
              <TableCell>
                <div v-if="policy.isEditing">
                  <Select v-model="policy.status">
                    <SelectTrigger class="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div v-else>
                  <Badge :variant="policy.status === 'active' ? 'success' : 'secondary'">
                    {{ policy.status === 'active' ? 'Active' : 'Inactive' }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell class="text-right">
                <div v-if="policy.isEditing" class="flex justify-end space-x-2">
                  <Button 
                    @click="savePolicy(index)" 
                    size="sm" 
                    variant="outline" 
                    class="h-8 px-2 text-green-600"
                  >
                    <CheckIcon class="h-4 w-4" />
                  </Button>
                  <Button 
                    @click="cancelEdit(index)" 
                    size="sm" 
                    variant="outline" 
                    class="h-8 px-2 text-muted-foreground"
                  >
                    <XIcon class="h-4 w-4" />
                  </Button>
                </div>
                <div v-else class="flex justify-end space-x-2">
                  <Button 
                    @click="editPolicy(index)" 
                    size="sm" 
                    variant="ghost" 
                    class="h-8 w-8 p-0"
                  >
                    <EditIcon class="h-4 w-4" />
                  </Button>
                  <Button 
                    @click="confirmDeletePolicy(index)" 
                    size="sm" 
                    variant="ghost" 
                    class="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2Icon class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Separator />

      <div class="space-y-4">
        <h3 class="text-lg font-medium">Cart Abandonment Settings</h3>
        <p class="text-sm text-muted-foreground">
          Configure how cart reservations are handled when abandoned or expired
        </p>

        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-2">
            <Label for="abandonmentThreshold">Cart Abandonment Threshold</Label>
            <div class="flex items-center space-x-2">
              <Input
                id="abandonmentThreshold"
                v-model.number="abandonment.threshold"
                type="number"
                min="0"
                max="72"
                class="w-[100px]"
              />
              <span class="text-muted-foreground">hours</span>
            </div>
            <p class="text-xs text-muted-foreground">
              Time after which an inactive cart is considered abandoned
            </p>
          </div>

          <div class="space-y-2">
            <Label for="abandonmentAction">Action on Abandonment</Label>
            <Select v-model="abandonment.action">
              <SelectTrigger id="abandonmentAction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="release">Release Items Immediately</SelectItem>
                <SelectItem value="hold">Hold Items for Additional Time</SelectItem>
                <SelectItem value="notify">Notify Admin & Hold Items</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2" v-if="abandonment.action === 'hold'">
            <Label for="additionalHoldTime">Additional Hold Time</Label>
            <div class="flex items-center space-x-2">
              <Input
                id="additionalHoldTime"
                v-model.number="abandonment.additionalHoldHours"
                type="number"
                min="1"
                max="48"
                class="w-[100px]"
              />
              <span class="text-muted-foreground">hours</span>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="autoRestoreEnabled">Auto-Restore Items</Label>
            <div class="flex items-center space-x-2">
              <Switch
                id="autoRestoreEnabled"
                v-model="abandonment.autoRestoreEnabled"
              />
              <Label>{{ abandonment.autoRestoreEnabled ? 'Enabled' : 'Disabled' }}</Label>
            </div>
            <p class="text-xs text-muted-foreground">
              Automatically restore items to cart if customer returns within threshold
            </p>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="cancelChanges">Cancel</Button>
      <Button 
        @click="savePolicies" 
        :disabled="isSubmitting || hasPolicyError"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Save Changes
      </Button>
    </DialogFooter>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="showDeleteConfirmation">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Policy</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this cart policy? This action cannot be undone.
            Any active cart reservations using this policy will not be affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteConfirmation = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="deletePolicy" class="bg-destructive text-destructive-foreground">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </DialogContent>
</template>

<script setup>
import { ref, computed, toRaw } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { 
  PlusIcon, CheckIcon, XIcon, EditIcon, 
  Trash2Icon, ShoppingCartIcon, Loader2Icon 
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const props = defineProps({
  policies: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['close', 'policies-updated'])

// State management
const editedPolicies = ref([])
const policyToDeleteIndex = ref(null)
const showDeleteConfirmation = ref(false)
const isSubmitting = ref(false)

// Abandonment settings
const abandonment = ref({
  threshold: 24,
  action: 'release',
  additionalHoldHours: 24,
  autoRestoreEnabled: true
})

// Initialize from props
const initializePolicies = () => {
  // Deep clone the policies and add isEditing flag
  editedPolicies.value = props.policies.map(policy => ({
    ...policy,
    isEditing: false,
    originalData: { ...policy } // Keep original data for cancel
  }))
  
  // If we have abandonment settings in the first policy, use them
  if (props.policies.length > 0 && props.policies[0].abandonmentSettings) {
    abandonment.value = { ...props.policies[0].abandonmentSettings }
  }
}

// Initialize on component creation
initializePolicies()

// Computed properties
const hasPolicyError = computed(() => {
  return editedPolicies.value.some(policy => {
    return !policy.name || !policy.duration || policy.duration <= 0
  })
})

// Helper functions
function formatDuration(policy) {
  if (!policy || !policy.duration) return ''
  
  if (policy.durationType === 'minutes') {
    if (policy.duration < 60) {
      return policy.duration === 1 ? '1 minute' : `${policy.duration} minutes`
    } else {
      const hours = Math.floor(policy.duration / 60)
      const minutes = policy.duration % 60
      if (minutes === 0) {
        return hours === 1 ? '1 hour' : `${hours} hours`
      } else {
        return `${hours}h ${minutes}m`
      }
    }
  } else if (policy.durationType === 'hours') {
    return policy.duration === 1 ? '1 hour' : `${policy.duration} hours`
  }
  
  return `${policy.duration} ${policy.durationType}`
}

function formatCustomerType(type) {
  const types = {
    all: 'All Customers',
    guest: 'Guest Customers',
    registered: 'Registered Customers',
    vip: 'VIP Customers'
  }
  return types[type] || type
}

// Action handlers
function addPolicy() {
  const newPolicy = {
    id: `cart-policy-${uuidv4()}`,
    name: 'New Cart Policy',
    description: '',
    duration: 60,
    durationType: 'minutes',
    customerType: 'all',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEditing: true,
    originalData: null
  }
  
  editedPolicies.value.push(newPolicy)
}

function editPolicy(index) {
  // Store original data for cancellation
  editedPolicies.value[index].originalData = { ...toRaw(editedPolicies.value[index]) }
  
  // Set isEditing to true
  editedPolicies.value[index].isEditing = true
}

function savePolicy(index) {
  const policy = editedPolicies.value[index]
  
  // Validate policy
  if (!policy.name || !policy.duration || policy.duration <= 0) {
    return
  }
  
  // Update timestamp
  policy.updatedAt = new Date().toISOString()
  
  // Clear original data and exit edit mode
  policy.originalData = null
  policy.isEditing = false
}

function cancelEdit(index) {
  const policy = editedPolicies.value[index]
  
  if (policy.originalData) {
    // Restore original data
    Object.assign(policy, policy.originalData)
    policy.originalData = null
    policy.isEditing = false
  } else {
    // If it's a new policy without original data, remove it
    editedPolicies.value.splice(index, 1)
  }
}

function confirmDeletePolicy(index) {
  policyToDeleteIndex.value = index
  showDeleteConfirmation.value = true
}

function deletePolicy() {
  if (policyToDeleteIndex.value !== null) {
    editedPolicies.value.splice(policyToDeleteIndex.value, 1)
    policyToDeleteIndex.value = null
  }
  
  showDeleteConfirmation.value = false
}

function cancelChanges() {
  emit('close')
}

function savePolicies() {
  isSubmitting.value = true
  
  try {
    // Prepare policies for saving
    const policiesToSave = editedPolicies.value.map(policy => {
      // Remove temporary properties
      const { isEditing, originalData, ...cleanPolicy } = policy
      return cleanPolicy
    })
    
    // Add abandonment settings to the first policy
    if (policiesToSave.length > 0) {
      policiesToSave[0].abandonmentSettings = { ...abandonment.value }
    }
    
    // Emit update event
    emit('policies-updated', policiesToSave)
  } catch (error) {
    console.error('Error saving cart policies:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>