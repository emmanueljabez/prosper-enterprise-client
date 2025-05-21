<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ isMultiple ? 'Delete Customer Groups' : 'Delete Customer Group' }}
        </DialogTitle>
        <DialogDescription>
          {{ 
            isMultiple 
              ? `Are you sure you want to delete ${selectedGroups.length} customer groups?` 
              : 'Are you sure you want to delete this customer group?' 
          }}
          This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-4">
        <!-- Single group deletion -->
        <div v-if="!isMultiple && group" class="rounded-md border p-4">
          <div class="flex items-start gap-4">
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium leading-none">{{ group.name }}</p>
              <p v-if="group.description" class="text-sm text-muted-foreground">
                {{ group.description }}
              </p>
              
              <div class="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary" v-if="group.customerCount">
                  {{ group.customerCount }} customers
                </Badge>
                <Badge :variant="group.isActive ? 'success' : 'secondary'">
                  {{ group.isActive ? 'Active' : 'Inactive' }}
                </Badge>
                <Badge variant="default" v-if="group.isDefault">
                  Default Group
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Multiple group deletion -->
        <div v-else-if="isMultiple && selectedGroups.length > 0" class="space-y-3">
          <p class="text-sm text-muted-foreground">
            You're about to delete the following customer groups:
          </p>
          <ScrollArea class="h-[200px] rounded-md border p-4">
            <div class="space-y-2">
              <div 
                v-for="(groupId, index) in selectedGroups" 
                :key="groupId" 
                class="flex items-center justify-between py-1"
              >
                <span class="text-sm">
                  {{ getGroupName(groupId) || `Group #${index + 1}` }}
                </span>
                <Badge 
                  variant="secondary" 
                  class="ml-2"
                  v-if="getGroupCustomerCount(groupId)"
                >
                  {{ getGroupCustomerCount(groupId) }} customers
                </Badge>
              </div>
            </div>
          </ScrollArea>
        </div>
        
        <!-- Special warning if default group is being deleted -->
        <Alert variant="destructive" class="mt-4" v-if="isDefaultGroupBeingDeleted">
          <AlertCircleIcon class="h-4 w-4" />
          <AlertTitle>Warning: Default Group Deletion</AlertTitle>
          <AlertDescription>
            You are attempting to delete the default customer group. 
            Please set another group as default before deleting this one.
          </AlertDescription>
        </Alert>
        
        <!-- Warning about customer reassignment -->
        <Alert variant="destructive" class="mt-4" v-else-if="hasCustomers">
          <AlertCircleIcon class="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Deleting this group will affect customers assigned to it.
            {{ selectedGroupForReplacement ? 
               `Customers will be reassigned to the "${getGroupName(selectedGroupForReplacement)}" group.` : 
               'Please select a replacement group for affected customers.' }}
          </AlertDescription>
        </Alert>
        
        <!-- Replacement group selection -->
        <div class="mt-4 space-y-2" v-if="hasCustomers && !isDefaultGroupBeingDeleted">
          <Label for="replacement-group">Move customers to</Label>
          <Select 
            v-model="selectedGroupForReplacement"
            :disabled="isProcessing"
          >
            <SelectTrigger id="replacement-group">
              <SelectValue placeholder="Select a replacement group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="g in availableReplacementGroups" 
                :key="g.id" 
                :value="g.id"
              >
                {{ g.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DialogFooter>
        <Button
          variant="outline"
          @click="$emit('update:isOpen', false)"
          :disabled="isProcessing"
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          @click="confirmDelete"
          :disabled="isProcessing || isDefaultGroupBeingDeleted || (hasCustomers && !selectedGroupForReplacement)"
        >
          <Loader2Icon
            v-if="isProcessing"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{ isMultiple ? 'Delete Groups' : 'Delete Group' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  AlertCircleIcon,
  Loader2Icon
} from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  group: {
    type: Object,
    default: null
  },
  selectedGroups: {
    type: Array,
    default: () => []
  },
  customerGroups: {
    type: Array,
    default: () => []
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:isOpen',
  'confirm-delete'
])

// For replacement group selection
const selectedGroupForReplacement = ref(null)

// Computed properties
const isMultiple = computed(() => {
  return props.selectedGroups && props.selectedGroups.length > 0
})

const hasCustomers = computed(() => {
  if (isMultiple.value) {
    return props.selectedGroups.some(groupId => {
      const group = props.customerGroups.find(g => g.id === groupId)
      return group && group.customerCount > 0
    })
  } else {
    return props.group && props.group.customerCount > 0
  }
})

const isDefaultGroupBeingDeleted = computed(() => {
  if (isMultiple.value) {
    return props.selectedGroups.some(groupId => {
      const group = props.customerGroups.find(g => g.id === groupId)
      return group && group.isDefault
    })
  } else {
    return props.group && props.group.isDefault
  }
})

const availableReplacementGroups = computed(() => {
  let excludedIds = []
  
  if (isMultiple.value) {
    excludedIds = props.selectedGroups
  } else if (props.group) {
    excludedIds = [props.group.id]
  }
  
  return props.customerGroups.filter(g => !excludedIds.includes(g.id))
})

// Methods
function getGroupName(groupId) {
  const group = props.customerGroups.find(g => g.id === groupId)
  return group ? group.name : null
}

function getGroupCustomerCount(groupId) {
  const group = props.customerGroups.find(g => g.id === groupId)
  return group ? group.customerCount : 0
}

function confirmDelete() {
  const data = {
    groupIds: isMultiple.value ? props.selectedGroups : [props.group.id],
    replacementGroupId: selectedGroupForReplacement.value
  }
  
  emit('confirm-delete', data)
}
</script>