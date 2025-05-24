<template>
  <DialogContent class="sm:max-w-[800px]">
    <DialogHeader>
      <DialogTitle>Hold Duration Policies</DialogTitle>
      <DialogDescription>
        Configure how long items can be reserved for different purposes
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium">Active Policies</h3>
          <p class="text-sm text-muted-foreground">
            These policies define how long items can be held for various purposes
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
              <TableHead>Applies To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="editedPolicies.length === 0">
              <TableCell colSpan="5" class="text-center">
                <div class="flex flex-col items-center justify-center py-6">
                  <ClockIcon class="h-8 w-8 text-muted-foreground mb-2" />
                  <p class="text-muted-foreground">No policies defined yet</p>
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
                    min="1"
                    max="90"
                    class="w-[80px]"
                  />
                  <Select v-model="policy.durationType">
                    <SelectTrigger class="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div v-else>{{ formatDuration(policy) }}</div>
              </TableCell>
              <TableCell>
                <div v-if="policy.isEditing">
                  <Select v-model="policy.applicableTo">
                    <SelectTrigger class="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="manual">Manual Holds</SelectItem>
                      <SelectItem value="service">Service Holds</SelectItem>
                      <SelectItem value="project">Project Holds</SelectItem>
                      <SelectItem value="customer">Customer Holds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div v-else>{{ formatApplicableTo(policy.applicableTo) }}</div>
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

      <div>
        <h3 class="text-lg font-medium mb-2">Default Policy</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Set which policy should be used as the default for new reservations
        </p>
        
        <Select v-model="defaultPolicyId">
          <SelectTrigger class="w-[300px]">
            <SelectValue placeholder="Select default policy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="policy in activePolicies" 
              :key="policy.id" 
              :value="policy.id"
            >
              {{ policy.name }} ({{ formatDuration(policy) }})
            </SelectItem>
          </SelectContent>
        </Select>
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
            Are you sure you want to delete this policy? This action cannot be undone.
            Any active reservations using this policy will not be affected.
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
  Trash2Icon, ClockIcon, Loader2Icon 
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
import { Badge } from '@/components/ui/badge'
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
    required: true
  }
})

const emit = defineEmits(['close', 'policies-updated'])

// State management
const editedPolicies = ref([])
const policyToDeleteIndex = ref(null)
const showDeleteConfirmation = ref(false)
const isSubmitting = ref(false)
const defaultPolicyId = ref('')

// Initialize from props
const initializePolicies = () => {
  // Deep clone the policies and add isEditing flag
  editedPolicies.value = props.policies.map(policy => ({
    ...policy,
    isEditing: false,
    originalData: { ...policy } // Keep original data for cancel
  }))
  
  // Set default policy ID if any policy has isDefault = true
  const defaultPolicy = props.policies.find(policy => policy.isDefault)
  if (defaultPolicy) {
    defaultPolicyId.value = defaultPolicy.id
  } else if (props.policies.length > 0) {
    // Default to first active policy if none is marked default
    const firstActive = props.policies.find(policy => policy.status === 'active')
    if (firstActive) {
      defaultPolicyId.value = firstActive.id
    }
  }
}

// Initialize on component creation
initializePolicies()

// Computed properties
const activePolicies = computed(() => {
  return editedPolicies.value.filter(policy => policy.status === 'active')
})

const hasPolicyError = computed(() => {
  return editedPolicies.value.some(policy => {
    return !policy.name || !policy.duration || policy.duration <= 0
  })
})

// Helper functions
function formatDuration(policy) {
  if (!policy || !policy.duration) return ''
  
  if (policy.durationType === 'days') {
    return policy.duration === 1 ? '1 day' : `${policy.duration} days`
  } else if (policy.durationType === 'hours') {
    return policy.duration === 1 ? '1 hour' : `${policy.duration} hours`
  }
  
  return `${policy.duration} ${policy.durationType}`
}

function formatApplicableTo(value) {
  const types = {
    all: 'All Types',
    manual: 'Manual Holds',
    service: 'Service Holds',
    project: 'Project Holds',
    customer: 'Customer Holds'
  }
  return types[value] || value
}

// Action handlers
function addPolicy() {
  const newPolicy = {
    id: `policy-${uuidv4()}`,
    name: 'New Policy',
    description: '',
    duration: 7,
    durationType: 'days',
    applicableTo: 'all',
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
      
      // Set isDefault based on defaultPolicyId
      cleanPolicy.isDefault = cleanPolicy.id === defaultPolicyId.value
      
      return cleanPolicy
    })
    
    // Emit update event
    emit('policies-updated', policiesToSave)
  } catch (error) {
    console.error('Error saving policies:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>