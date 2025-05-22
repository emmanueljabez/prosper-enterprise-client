<template>
  <DialogContent class="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Bulk Edit Promotions</DialogTitle>
      <DialogDescription>
        Edit multiple promotions at once. Only fields you modify will be updated.
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-4">
      <div class="mb-6 p-3 bg-muted/50 rounded-md">
        <div class="flex items-center justify-between">
          <span class="font-medium">{{ selectedPromotions.length }} promotions selected</span>
          <Button variant="link" size="sm" class="h-auto p-0" @click="showSelectedItems = !showSelectedItems">
            {{ showSelectedItems ? 'Hide' : 'Show' }} list
          </Button>
        </div>
        
        <div v-if="showSelectedItems" class="mt-2 border rounded-md max-h-[150px] overflow-y-auto bg-background">
          <div class="divide-y">
            <div v-for="promotion in selectedPromotions" :key="promotion.id" class="p-2 text-sm">
              <div class="flex items-center justify-between">
                <span>{{ promotion.name }}</span>
                <Badge :variant="getStatusBadgeVariant(promotion.status)">
                  {{ promotion.status }}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="status" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="dates">Dates</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
        </TabsList>
        
        <!-- Status Tab -->
        <TabsContent value="status" class="space-y-4 pt-4">
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="update-status" 
                v-model:checked="updateFields.status"
              />
              <Label for="update-status" class="font-medium cursor-pointer">Update Status</Label>
            </div>
            
            <Select 
              v-model="updates.status" 
              :disabled="!updateFields.status"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div v-if="updates.status === 'inactive' && updateFields.status" class="space-y-2">
            <Label for="status-reason">Reason for Deactivation</Label>
            <Textarea
              id="status-reason"
              v-model="updates.statusReason"
              placeholder="Why are these promotions being deactivated?"
              rows="3"
            />
          </div>
          
          <Alert v-if="updates.status === 'inactive' && updateFields.status" variant="warning">
            <AlertTriangleIcon class="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Deactivating these promotions will immediately stop them from applying to any orders.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <!-- Dates Tab -->
        <TabsContent value="dates" class="space-y-4 pt-4">
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="update-start-date" 
                v-model:checked="updateFields.startDate"
              />
              <Label for="update-start-date" class="font-medium cursor-pointer">Update Start Date</Label>
            </div>
            
            <Input
              type="date"
              v-model="updates.startDate"
              :disabled="!updateFields.startDate"
            />
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="update-end-date" 
                v-model:checked="updateFields.endDate"
              />
              <Label for="update-end-date" class="font-medium cursor-pointer">Update End Date</Label>
            </div>
            
            <Input
              type="date"
              v-model="updates.endDate"
              :disabled="!updateFields.endDate"
            />
            
            <div class="flex items-center space-x-2 mt-1" v-if="updateFields.endDate">
              <Checkbox 
                id="remove-end-date" 
                v-model:checked="removeEndDate"
              />
              <Label for="remove-end-date" class="text-sm cursor-pointer">Remove end date (make promotions unlimited)</Label>
            </div>
          </div>
          
          <Alert v-if="updateFields.startDate || updateFields.endDate" variant="default">
            <CalendarIcon class="h-4 w-4" />
            <AlertTitle>Date Changes</AlertTitle>
            <AlertDescription>
              Changing dates may affect when these promotions become active or expire.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <!-- Targeting Tab -->
        <TabsContent value="targeting" class="space-y-4 pt-4">
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="update-customer-groups" 
                v-model:checked="updateFields.customerGroups"
              />
              <Label for="update-customer-groups" class="font-medium cursor-pointer">Update Customer Groups</Label>
            </div>
            
            <div v-if="updateFields.customerGroups" class="border rounded-md divide-y max-h-[200px] overflow-y-auto">
              <div 
                v-for="group in customerGroups" 
                :key="group.id"
                class="p-3 flex items-center space-x-3"
              >
                <Checkbox 
                  :id="`group-${group.id}`"
                  :checked="updates.customerGroupIds.includes(group.id)"
                  @update:checked="toggleCustomerGroupSelection(group.id)"
                />
                <Label :for="`group-${group.id}`" class="flex-1 cursor-pointer font-normal">
                  {{ group.name }}
                </Label>
              </div>
              <div v-if="customerGroups.length === 0" class="p-4 text-center text-muted-foreground">
                No customer groups available.
              </div>
            </div>
            
            <div class="flex items-center space-x-2 mt-1" v-if="updateFields.customerGroups">
              <Checkbox 
                id="apply-to-all-customers" 
                v-model:checked="applyToAllCustomers"
              />
              <Label for="apply-to-all-customers" class="text-sm cursor-pointer">Apply to all customers (clear group selection)</Label>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="update-sales-channels" 
                v-model:checked="updateFields.salesChannels"
              />
              <Label for="update-sales-channels" class="font-medium cursor-pointer">Update Sales Channels</Label>
            </div>
            
            <div v-if="updateFields.salesChannels" class="border rounded-md divide-y max-h-[200px] overflow-y-auto">
              <div 
                v-for="channel in salesChannels" 
                :key="channel.id"
                class="p-3 flex items-center space-x-3"
              >
                <Checkbox 
                  :id="`channel-${channel.id}`"
                  :checked="updates.salesChannelIds.includes(channel.id)"
                  @update:checked="toggleSalesChannelSelection(channel.id)"
                />
                <Label :for="`channel-${channel.id}`" class="flex-1 cursor-pointer font-normal">
                  {{ channel.name }}
                </Label>
              </div>
              <div v-if="salesChannels.length === 0" class="p-4 text-center text-muted-foreground">
                No sales channels available.
              </div>
            </div>
            
            <div class="flex items-center space-x-2 mt-1" v-if="updateFields.salesChannels">
              <Checkbox 
                id="apply-to-all-channels" 
                v-model:checked="applyToAllChannels"
              />
              <Label for="apply-to-all-channels" class="text-sm cursor-pointer">Apply to all channels (clear channel selection)</Label>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        @click="applyUpdates"
        :disabled="isUpdating || !hasChangesToApply"
      >
        <Loader2Icon v-if="isUpdating" class="mr-2 h-4 w-4 animate-spin" />
        {{ isUpdating ? 'Updating...' : 'Update Promotions' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import {
  AlertTriangleIcon,
  CalendarIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const props = defineProps({
  selectedPromotions: {
    type: Array,
    required: true
  },
  products: {
    type: Array,
    required: true,
    default: () => []
  },
  customerGroups: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['promotions-updated', 'close'])

// UI state
const showSelectedItems = ref(false)
const isUpdating = ref(false)

// Track which fields to update
const updateFields = ref({
  status: false,
  startDate: false,
  endDate: false,
  customerGroups: false,
  salesChannels: false
})

// Values for updates
const updates = ref({
  status: '',
  statusReason: '',
  startDate: format(new Date(), 'yyyy-MM-dd'),
  endDate: '',
  customerGroupIds: [],
  salesChannelIds: []
})

// Special flags
const removeEndDate = ref(false)
const applyToAllCustomers = ref(false)
const applyToAllChannels = ref(false)

// Reset customerGroupIds when toggling "apply to all customers"
watch(applyToAllCustomers, (newVal) => {
  if (newVal) {
    updates.value.customerGroupIds = []
  }
})

// Reset salesChannelIds when toggling "apply to all channels"
watch(applyToAllChannels, (newVal) => {
  if (newVal) {
    updates.value.salesChannelIds = []
  }
})

// Check if there are any changes to apply
const hasChangesToApply = computed(() => {
  return Object.values(updateFields.value).some(value => value === true)
})

// Methods for adding/removing items from arrays
function toggleCustomerGroupSelection(groupId) {
  const index = updates.value.customerGroupIds.indexOf(groupId)
  if (index === -1) {
    updates.value.customerGroupIds.push(groupId)
  } else {
    updates.value.customerGroupIds.splice(index, 1)
  }
  // If we select any group, make sure "apply to all" is unchecked
  if (updates.value.customerGroupIds.length > 0) {
    applyToAllCustomers.value = false
  }
}

function toggleSalesChannelSelection(channelId) {
  const index = updates.value.salesChannelIds.indexOf(channelId)
  if (index === -1) {
    updates.value.salesChannelIds.push(channelId)
  } else {
    updates.value.salesChannelIds.splice(index, 1)
  }
  // If we select any channel, make sure "apply to all" is unchecked
  if (updates.value.salesChannelIds.length > 0) {
    applyToAllChannels.value = false
  }
}

// Status badge styling
function getStatusBadgeVariant(status) {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    case 'scheduled':
      return 'warning'
    case 'expired':
      return 'outline'
    default:
      return 'outline'
  }
}

// Apply updates to the selected promotions
async function applyUpdates() {
  isUpdating.value = true
  
  try {
    // Build the updates object based on which fields should be updated
    const updatesToApply = {}
    
    if (updateFields.value.status) {
      updatesToApply.status = updates.value.status
      if (updates.value.status === 'inactive' && updates.value.statusReason) {
        updatesToApply.statusReason = updates.value.statusReason
      }
    }
    
    if (updateFields.value.startDate) {
      updatesToApply.startDate = new Date(updates.value.startDate).toISOString()
    }
    
    if (updateFields.value.endDate) {
      if (removeEndDate.value) {
        updatesToApply.endDate = null
      } else {
        updatesToApply.endDate = new Date(updates.value.endDate).toISOString()
      }
    }
    
    if (updateFields.value.customerGroups) {
      updatesToApply.customerGroupIds = applyToAllCustomers.value ? [] : updates.value.customerGroupIds
    }
    
    if (updateFields.value.salesChannels) {
      updatesToApply.salesChannelIds = applyToAllChannels.value ? [] : updates.value.salesChannelIds
    }
    
    // Log the updates being applied
    console.log('Applying updates:', updatesToApply)
    
    // Emit the event with the selected promotions and updates
    emit('promotions-updated', props.selectedPromotions, updatesToApply)
  } catch (error) {
    console.error('Error preparing updates:', error)
  } finally {
    isUpdating.value = false
  }
}
</script>